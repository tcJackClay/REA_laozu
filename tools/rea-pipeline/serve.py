"""Loopback-only, read-only index and source preview server."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import argparse
import json
import mimetypes
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote
import threading
from analyze import analyze, DEFAULT_OUT
from pipeline import ROOT, DEFAULT_DB, connect, summary, query

APP = ROOT / "outputs/laozu-web"
HERE = Path(__file__).resolve().parent


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/api/analyze':
            return self.send_error(404)
        # A local webpage may trigger only this fixed job, never arbitrary commands.
        if self.headers.get('Origin') not in (None, 'http://' + self.headers.get('Host', '')):
            return self.send_error(403)
        if not self.server.job_lock.acquire(blocking=False):
            return self.send_json(self.server.job)
        self.server.job = {'status':'running'}
        def run():
            try:
                report = analyze(self.server.dbpath)
                self.server.job = {'status':'complete', 'counts':report['counts'], 'generatedAt':report['generatedAt']}
            except Exception as exc:
                self.server.job = {'status':'failed','error':str(exc)}
            finally:
                self.server.job_lock.release()
        threading.Thread(target=run,daemon=True).start()
        return self.send_json(self.server.job)

    def log_message(self, format, *args):
        # Keep successful asset requests from overwhelming the terminal.
        if len(args) > 1 and str(args[1]) != "200":
            super().log_message(format, *args)

    def do_GET(self):
        url = urlparse(self.path)
        args = parse_qs(url.query)
        try:
            if url.path == '/api/analysis/status':
                return self.send_json(self.server.job)
            if url.path in ['/api/analysis', '/api/analysis/window']:
                path = DEFAULT_OUT / 'report.json'
                if not path.exists():
                    return self.send_json({'status':'not-run'})
                report = json.loads(path.read_text(encoding='utf-8'))
                if url.path.endswith('/window'):
                    return self.send_json([w for w in report['windows'] if w['name'].lower() == args.get('name',[''])[0].lower()])
                return self.send_json({k:v for k,v in report.items() if k not in ('windows','artifacts')})
            with connect(self.server.dbpath) as db:
                if url.path == "/api/summary":
                    return self.send_json(summary(db))
                if url.path == "/api/query":
                    return self.send_json(query(db, args.get("q", [""])[0][:150]))
                if url.path == "/api/layouts":
                    return self.send_json([dict(r) for r in db.execute("SELECT name,source,nodes FROM layouts ORDER BY name")])
                if url.path == "/api/layout":
                    row = db.execute("SELECT payload FROM layouts WHERE name=?", (args.get("name", [""])[0],)).fetchone()
                    if not row:
                        return self.send_error(404)
                    return self.send_json(json.loads(row[0]))
                if url.path == "/api/runs":
                    runs = []
                    for row in db.execute("SELECT * FROM runs ORDER BY id"):
                        run = {k: row[k] for k in ("id", "status", "steps", "package")}
                        reviews = Path(row["manifest"]).parent / "reviews.json"
                        run["reviews"] = json.loads(reviews.read_text(encoding="utf-8")) if reviews.exists() else []
                        runs.append(run)
                    return self.send_json(runs)
            if url.path in ["/", "/lab.js", "/lab.css"]:
                path = HERE / ("lab.html" if url.path == "/" else url.path.lstrip("/"))
            else:
                path = (APP / unquote(url.path).lstrip("/")).resolve()
                if not path.is_relative_to(APP.resolve()):
                    return self.send_error(403)
            if not path.is_file():
                return self.send_error(404)
            body = path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", mimetypes.guess_type(path.name)[0] or "application/octet-stream")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
        except (ValueError, KeyError):
            self.send_error(400)

    def send_json(self, value):
        body = json.dumps(value, ensure_ascii=False).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=5180)
    p.add_argument("--db", type=Path, default=DEFAULT_DB)
    args = p.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    server.dbpath = args.db
    server.job_lock = threading.Lock()
    server.job = {'status':'idle'}
    print(f"Source lab: http://127.0.0.1:{args.port}", flush=True)
    server.serve_forever()
