"""Record explicit screenshot review, independently of capture success."""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


def review(folder, step, result, observation, reviewer):
    manifest = json.loads((folder / "manifest.json").read_text(encoding="utf-8"))
    event = manifest["steps"][step]
    evidence = {}
    for name in ("before", "after"):
        item = event[name]
        raw = (folder / item["file"]).read_bytes()
        sha = hashlib.sha256(raw).hexdigest()
        if sha != item["sha256"]:
            raise ValueError(f"Evidence hash mismatch: {name}")
        evidence[name] = {"file": item["file"], "sha256": sha}
    path = folder / "reviews.json"
    reviews = json.loads(path.read_text(encoding="utf-8")) if path.exists() else []
    reviews.append({"step": step, "result": result, "observation": observation,
                    "reviewer": reviewer, "at": datetime.now(timezone.utc).isoformat(),
                    "basis": "visual review, not runtime instrumentation", "evidence": evidence})
    path.write_text(json.dumps(reviews, ensure_ascii=False, indent=2), encoding="utf-8")
    return reviews[-1]


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("folder", type=Path)
    p.add_argument("--step", type=int, required=True)
    p.add_argument("--result", choices=["matched", "different", "inconclusive"], required=True)
    p.add_argument("--observation", required=True)
    p.add_argument("--reviewer", required=True)
    a = p.parse_args()
    print(json.dumps(review(a.folder, a.step, a.result, a.observation, a.reviewer), ensure_ascii=False, indent=2))
