"""생성 기록(프롬프트/설정)을 outputs/history.jsonl에 한 줄씩 저장·조회.
표준 라이브러리만 사용 — 'simple ui confirm'의 history.py와 같은 패턴."""
import json
import threading
import time
from pathlib import Path

_LOCK = threading.Lock()


def _path(outputs_dir):
    return Path(outputs_dir) / "history.jsonl"


def add(outputs_dir, rec):
    rec = dict(rec)
    rec.setdefault("ts", time.time())
    p = _path(outputs_dir)
    p.parent.mkdir(parents=True, exist_ok=True)
    with _LOCK:
        with open(p, "a", encoding="utf-8") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def recent(outputs_dir, n=80):
    p = _path(outputs_dir)
    if not p.exists():
        return []
    lines = p.read_text(encoding="utf-8").splitlines()
    out = []
    for line in lines[-n:]:
        try:
            out.append(json.loads(line))
        except Exception:
            continue
    return list(reversed(out))
