"""ComfyUI의 실제 models 폴더 위치 설정 — 다운로드 버튼이 받은 파일을
'ComfyUI가 실제로 보는 폴더'에 넣으려면 이 경로를 알아야 한다.

taleforge_graphic은 ComfyUI와 HTTP(`comfy_client.py`)로만 대화하고 ComfyUI를
직접 설치/관리하지 않으므로(메모장 1-3절 — 기존 ComfyUI 재사용), 모델 폴더
경로를 추측하지 않고 사용자가 한 번 설정하게 한다. 설정 방법은 2가지
(둘 다 상관없음, 둘 다 있으면 환경변수가 우선):
  1) 환경변수 COMFYUI_MODELS_DIR
  2) 이 폴더에 models_location.txt 파일을 만들어 경로를 한 줄 적기
     (사용자가 이미 쓰는 'simple ui confirm'의 models_location.txt와
     같은 포맷 — 내용을 그대로 복사해 와도 됨)
표준 라이브러리만 사용."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG = ROOT / "models_location.txt"


def models_dir():
    """ComfyUI models 폴더 경로(Path) 또는 설정 안 됐으면 None."""
    env = (os.environ.get("COMFYUI_MODELS_DIR") or "").strip().strip('"')
    if env:
        return Path(env)
    try:
        t = CONFIG.read_text(encoding="utf-8-sig").strip().strip('"')
    except UnicodeDecodeError:
        try:
            t = CONFIG.read_text(encoding="cp949").strip().strip('"')
        except (OSError, UnicodeDecodeError):
            return None
    except OSError:
        return None
    return Path(t) if t else None


def set_models_dir(path):
    CONFIG.write_text(str(Path(path)), encoding="utf-8")
