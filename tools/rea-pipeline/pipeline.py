"""Versioned, local Unity reconstruction index. Standard library only.

Static edges are observations/candidates, never proof of runtime execution.
Generated databases, capture media and account state stay in work/.
"""
import argparse
import bisect
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import sys
import time

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB = ROOT / "work/rea-pipeline/index.sqlite"


class Connection(sqlite3.Connection):
    def __exit__(self, *args):
        try:
            return super().__exit__(*args)
        finally:
            self.close()


def digest(path):
    with path.open("rb") as f:
        return hashlib.file_digest(f, "sha256").hexdigest()


def connect(path=DEFAULT_DB):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path, factory=Connection)
    db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS artifacts(path TEXT PRIMARY KEY, sha256 TEXT, kind TEXT);
    CREATE TABLE IF NOT EXISTS windows(id TEXT PRIMARY KEY, name TEXT, source TEXT,
      line INTEGER, end_line INTEGER, prefab TEXT, basis TEXT);
    CREATE TABLE IF NOT EXISTS methods(id TEXT PRIMARY KEY, window_id TEXT, name TEXT,
      line INTEGER, end_line INTEGER);
    CREATE TABLE IF NOT EXISTS edges(method_id TEXT, kind TEXT, target TEXT,
      line INTEGER, confidence TEXT);
    CREATE TABLE IF NOT EXISTS layouts(name TEXT PRIMARY KEY, source TEXT, sha256 TEXT,
      nodes INTEGER, payload TEXT);
    CREATE TABLE IF NOT EXISTS config_tables(name TEXT PRIMARY KEY, source TEXT,
      sha256 TEXT, rows INTEGER, fields TEXT);
    CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY, manifest TEXT, status TEXT,
      steps INTEGER, package TEXT);
    CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT);
    CREATE INDEX IF NOT EXISTS edge_target ON edges(target);
    CREATE INDEX IF NOT EXISTS method_window ON methods(window_id);
    """)
    return db


def rel(path):
    return path.resolve().relative_to(ROOT).as_posix()


def register(db, path, kind):
    h = digest(path)
    old = db.execute("SELECT sha256 FROM artifacts WHERE path=?", (rel(path),)).fetchone()
    db.execute("INSERT OR REPLACE INTO artifacts VALUES(?,?,?)", (rel(path), h, kind))
    return h, old is None or old[0] != h


def masked_code(text):
    # Keep line positions while removing literals/comments from brace parsing.
    pattern = r'@"(?:""|[^"])*"|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|//[^\n]*|/\*[\s\S]*?\*/'
    return re.sub(pattern, lambda m: re.sub(r"[^\n]", " ", m[0]), text)


def index_code(db, path, force=False):
    _, changed = register(db, path, "decompiled-csharp")
    if not changed and not force:
        return
    text = path.read_text(encoding="utf-8-sig")
    clean = masked_code(text)
    lines = [m.start() for m in re.finditer("\n", text)]
    line = lambda pos: bisect.bisect_left(lines, pos) + 1
    stack, ends = [], {}
    for pos, ch in enumerate(clean):
        if ch == "{":
            stack.append(pos)
        elif ch == "}" and stack:
            ends[stack.pop()] = pos
    old_ids = [r[0] for r in db.execute("SELECT id FROM windows WHERE source=?", (rel(path),))]
    for wid in old_ids:
        db.execute("DELETE FROM edges WHERE method_id IN (SELECT id FROM methods WHERE window_id=?)", (wid,))
        db.execute("DELETE FROM methods WHERE window_id=?", (wid,))
        db.execute("DELETE FROM windows WHERE id=?", (wid,))
    declarations = re.compile(r"\bclass\s+(\w+)(?:\s*:[^{]+)?\s*\{")
    method_re = re.compile(
        r"\b(?:public|private|protected|internal)\s+"
        r"(?:(?:static|override|virtual|sealed|async|new|unsafe|extern)\s+)*"
        r"[\w.<>,?\[\]]+\s+(\w+)\s*\([^;{}]*\)\s*\{")
    patterns = {
        "opens": r"\b(?:ShowWindow|AddSubWindow)<(\w+)>",
        "closes": r"\bCloseWindow<(\w+)>",
        "show-call": r"\b(UI\w+)\.Show\s*\(",
        "config": r"\bGameScheme\.(\w+)\s*\(",
        "request": r"\b(SEND_MSG_\w+)\s*\(",
        "event": r"\b(?:DGlobalEventEx|DGlobalEvent)\.(EVENT_\w+)",
        "callback": r"\bnew\s+(?:UnityAction|Action(?:<[^>]+>)?)\s*\(\s*(\w+)\s*\)",
    }
    for c in declarations.finditer(clean):
        name = c[1]
        if not name.startswith("UI"):
            continue
        start, end = c.end() - 1, ends.get(c.end() - 1)
        if end is None:
            continue
        wid = f"{rel(path)}:{line(c.start())}:{name}"
        body = text[start:end]
        prefab = re.search(r'ResPath\s*=\s*"([^"]+)"', body)
        db.execute("INSERT INTO windows VALUES(?,?,?,?,?,?,?)",
                   (wid, name, rel(path), line(c.start()), line(end),
                    prefab[1] if prefab else None, "lexical-class-span"))
        nested = [(n.start(), ends.get(n.end()-1, end)) for n in declarations.finditer(clean, start+1, end)]
        for m in method_re.finditer(clean, start+1, end):
            if any(a <= m.start() <= b for a, b in nested):
                continue
            mend = ends.get(m.end()-1)
            if mend is None or mend > end:
                continue
            mid = wid + ":" + str(line(m.start()))
            db.execute("INSERT INTO methods VALUES(?,?,?,?,?)",
                       (mid, wid, m[1], line(m.start()), line(mend)))
            method = clean[m.end():mend]
            for kind, pattern in patterns.items():
                for hit in re.finditer(pattern, method):
                    db.execute("INSERT INTO edges VALUES(?,?,?,?,?)",
                               (mid, kind, hit[1], line(m.end()+hit.start()), "static-reference"))


def build(dbpath=DEFAULT_DB, force=False):
    db = connect(dbpath)
    assembly = ROOT / "work/alignment-v9/runtime/text-assets/2yad24y_Assembly-CSharp"
    register(db, assembly, "managed-assembly")
    index_code(db, ROOT / "work/alignment-v13/all.cs", force)
    # Explicit precedence prevents silently mixing stale prefab/config exports.
    sources = [ROOT / f"work/alignment-v{v}" for v in [9, 10, 11, 12, 13, 14, 15, 16]]
    selected = {}
    for source in sources:
        path = source / "layouts.json"
        if path.exists():
            sha, _ = register(db, path, "prefab-export")
            data = json.loads(path.read_text(encoding="utf-8-sig"))
            for name, layout in data["layouts"].items():
                selected[name] = (path, sha, layout, data["sprites"])
    db.execute("DELETE FROM layouts")
    for name, (path, sha, layout, sprites) in selected.items():
        db.execute("INSERT INTO layouts VALUES(?,?,?,?,?)",
                   (name, rel(path), sha, len(layout["nodes"]), json.dumps(
                       {"layout": layout, "sprites": sprites}, ensure_ascii=False)))
    tables = {}
    for source in [ROOT / "work/apk-analysis", ROOT / "work/alignment-v9/runtime", *sources]:
        for path in sorted((source / "configs").glob("*.json")):
            tables[path.stem] = path
    db.execute("DELETE FROM config_tables")
    for name, path in tables.items():
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        if not isinstance(data, list):
            continue
        sha, _ = register(db, path, "config-export")
        fields = sorted({k for row in data if isinstance(row, dict) for k in row})
        db.execute("INSERT INTO config_tables VALUES(?,?,?,?,?)",
                   (name, rel(path), sha, len(data), json.dumps(fields)))
    db.execute("INSERT OR REPLACE INTO meta VALUES('built_at',?)", (str(time.time()),))
    db.execute("INSERT OR REPLACE INTO meta VALUES('schema','1')")
    db.commit()
    result = summary(db)
    db.close()
    return result


def summary(db):
    result = {t: db.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
              for t in ["artifacts", "windows", "methods", "edges", "layouts", "config_tables", "runs"]}
    result["limits"] = ["Static class/method scan is lexical, not compiler-resolved.",
                        "Only exported prefabs are indexed; unexported windows remain visible as gaps.",
                        "Static edges do not establish conditions or execution order.",
                        "Capture screenshots/Android focus do not identify Unity windows automatically."]
    result["layout_linked_windows"] = db.execute(
        "SELECT count(*) FROM windows WHERE lower(name) IN (SELECT name FROM layouts)").fetchone()[0]
    return result


def query(db, term):
    windows = [dict(r) for r in db.execute(
        "SELECT * FROM windows WHERE name LIKE ? OR prefab LIKE ? LIMIT 60", (f"%{term}%", f"%{term}%"))]
    for w in windows:
        w["methods"] = [dict(r) for r in db.execute(
            "SELECT * FROM methods WHERE window_id=? ORDER BY line", (w["id"],))]
        w["edges"] = [dict(r) for r in db.execute(
            "SELECT e.*,m.name AS method FROM edges e JOIN methods m ON e.method_id=m.id WHERE m.window_id=?",
            (w["id"],))]
        w["layout"] = db.execute("SELECT source FROM layouts WHERE name=?", (w["name"].lower(),)).fetchone()
        w["layout"] = w["layout"][0] if w["layout"] else None
    return {"term": term, "windows": windows,
            "layouts": [dict(r) for r in db.execute(
                "SELECT name,source,sha256,nodes FROM layouts WHERE name LIKE ?", (f"%{term}%",))],
            "configs": [dict(r) for r in db.execute(
                "SELECT * FROM config_tables WHERE name LIKE ? OR fields LIKE ?", (f"%{term}%", f"%{term}%"))],
            "references": [dict(r) for r in db.execute(
                "SELECT e.*,m.name AS method,w.name AS window,w.source FROM edges e "
                "JOIN methods m ON e.method_id=m.id JOIN windows w ON m.window_id=w.id "
                "WHERE e.target LIKE ? LIMIT 300", (f"%{term}%",))]}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    sub = parser.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build")
    b.add_argument("--force", action="store_true")
    sub.add_parser("summary")
    q = sub.add_parser("query")
    q.add_argument("term")
    args = parser.parse_args()
    if args.cmd == "build":
        result = build(args.db, args.force)
    else:
        with connect(args.db) as db:
            result = summary(db) if args.cmd == "summary" else query(db, args.term)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
