"""ADB scenario recorder. Captures evidence; does not infer Unity state from pixels."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess
import time

from pipeline import ROOT, DEFAULT_DB, connect, digest

ADB = Path("C:/Users/45186/AppData/Local/Android/Sdk/platform-tools/adb.exe")


def utc():
    return datetime.now(timezone.utc).isoformat()


def validate(plan):
    if not isinstance(plan.get("steps"), list):
        raise ValueError("steps must be a list")
    for step in plan["steps"]:
        kind = step.get("action")
        if kind not in ["snapshot", "tap", "swipe", "back", "wait"]:
            raise ValueError(f"Unsupported action: {kind}")
        for key in (["x", "y"] if kind == "tap" else ["x", "y", "toX", "toY"] if kind == "swipe" else []):
            if not isinstance(step.get(key), (int, float)) or not 0 <= step[key] < 1:
                raise ValueError(f"{key} must be normalized within [0,1)")
        for key, default, low, high in [("settle", .5, 0, 60), ("seconds", .5, 0, 60),
                                        ("durationMs", 500, 50, 5000)]:
            val = step.get(key, default)
            if not isinstance(val, (int, float)) or not low <= val <= high:
                raise ValueError(f"Invalid {key}")


class Recorder:
    def __init__(self, adb=ADB, serial="emulator-5554", package=None):
        self.base = [str(adb), "-s", serial]
        self.serial, self.package = serial, package

    def run(self, *args, binary=False):
        result = subprocess.run([*self.base, *args], capture_output=True, timeout=25, check=True)
        return result.stdout if binary else result.stdout.decode("utf-8", errors="replace")

    def focus(self):
        text = self.run("shell", "dumpsys", "activity", "activities")
        lines = [s.strip() for s in text.splitlines()
                 if "mResumedActivity" in s or "topResumedActivity" in s]
        return "\n".join(lines)

    def checkpoint(self, folder, name):
        focus = self.focus()
        if self.package and not re.search(r"(?<![\w.])" + re.escape(self.package) + r"/", focus):
            raise RuntimeError(f"Foreground differs from required package {self.package}: {focus}")
        raw = self.run("exec-out", "screencap", "-p", binary=True)
        if raw[:8] != b"\x89PNG\r\n\x1a\n":
            raise RuntimeError("ADB returned invalid PNG")
        width, height = struct.unpack(">II", raw[16:24])
        path = folder / (name + ".png")
        path.write_bytes(raw)
        return {"at": utc(), "file": path.name, "sha256": hashlib.sha256(raw).hexdigest(),
                "width": width, "height": height, "focus": focus, "unityState": None}

    def capture(self, plan, folder, dbpath=DEFAULT_DB):
        validate(plan)
        if any(s["action"] not in ["snapshot", "wait"] for s in plan["steps"]) and not self.package:
            raise ValueError("Interactive scenarios require --package foreground guard")
        folder.mkdir(parents=True, exist_ok=False)
        manifest = {"schema": 1, "id": folder.name, "serial": self.serial, "package": self.package,
                    "started": utc(), "status": "running", "steps": [], "scenario": plan,
                    "evidence": "screenshots + Android foreground; not Unity hook telemetry",
                    "assemblySha256": digest(ROOT / "work/alignment-v9/runtime/text-assets/2yad24y_Assembly-CSharp")}
        def save():
            (folder / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
        save()
        try:
            if self.package:
                details = self.run("shell", "dumpsys", "package", self.package)
                manifest["installedPackage"] = [line.strip() for line in details.splitlines()
                                                if re.search(r"\b(versionCode|versionName|lastUpdateTime)=", line)]
                manifest["assemblyProvenance"] = "Local analysis assembly; runtime equality not established."
                save()
            for i, step in enumerate(plan["steps"]):
                event = {"index": i, "label": step.get("label", str(i)), "action": step,
                         "started": utc(), "status": "started"}
                manifest["steps"].append(event)
                save()
                before = self.checkpoint(folder, f"{i:03}-before")
                event["before"] = before
                save()
                w, h = before["width"], before["height"]
                xy = lambda a, b: [str(int(step[a] * w)), str(int(step[b] * h))]
                kind = step["action"]
                if kind == "tap":
                    self.run("shell", "input", "tap", *xy("x", "y"))
                elif kind == "swipe":
                    self.run("shell", "input", "swipe", *xy("x", "y"), *xy("toX", "toY"), str(int(step.get("durationMs", 500))))
                elif kind == "back":
                    self.run("shell", "input", "keyevent", "4")
                if kind == "wait":
                    time.sleep(step.get("seconds", .5))
                time.sleep(step.get("settle", .5))
                event["after"] = self.checkpoint(folder, f"{i:03}-after")
                event["pixelsChanged"] = before["sha256"] != event["after"]["sha256"]
                event["status"] = "recorded"
                # Semantic expectations are explicitly pending human/hook validation.
                event["semanticStatus"] = "unverified" if step.get("expected") else "not-specified"
                save()
            manifest["status"] = "recorded"
        except Exception as exc:
            manifest["status"] = "failed"
            manifest["error"] = str(exc)
            raise
        finally:
            manifest["ended"] = utc()
            save()
            with connect(dbpath) as db:
                db.execute("INSERT OR REPLACE INTO runs VALUES(?,?,?,?,?)",
                           (manifest["id"], str((folder / "manifest.json").resolve()),
                            manifest["status"], len(manifest["steps"]), self.package))
        return manifest


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--adb", type=Path, default=ADB)
    p.add_argument("--serial", default="emulator-5554")
    p.add_argument("--package")
    p.add_argument("--scenario", type=Path)
    p.add_argument("--out", type=Path)
    p.add_argument("--db", type=Path, default=DEFAULT_DB)
    a = p.parse_args()
    plan = json.loads(a.scenario.read_text(encoding="utf-8-sig")) if a.scenario else {
        "name": "current-screen", "steps": [{"action": "snapshot", "label": "original-current-state"}]}
    folder = a.out or ROOT / "work/rea-pipeline/captures" / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S-%f")
    print(json.dumps(Recorder(a.adb, a.serial, a.package).capture(plan, folder, a.db), ensure_ascii=False, indent=2))
