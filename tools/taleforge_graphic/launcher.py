"""자동 설치 + 실행기 (표준 라이브러리만 사용).

순서: ①전용 가상환경(venv) 준비 ②gradio/pillow/requests 설치
③ComfyUI가 켜져 있는지 확인(안 켜져 있으면 안내만 하고 그래도 화면은 띄움) ④화면(ui.py) 실행.

사용자가 이미 쓰고 있는 'simple ui confirm' 도구의 launcher.py와 달리, ComfyUI/PyTorch/venv를
통째로 새로 설치하지는 않는다 — 그 도구로 이미 설치해 둔 ComfyUI를 그대로 재사용해서 디스크
용량이 중복되지 않게 한다. ComfyUI 자체를 이 도구가 새로 설치/실행하는 기능이 필요하면
(예: 이 도구만 따로 다른 PC에 깔아야 하는 경우) 다음에 따로 요청해서 추가할 수 있다.
"""
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = Path(__file__).resolve().parent
VENV = ROOT / "venv"
PY = VENV / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
PORT = int(os.environ.get("TALEFORGE_GRAPHIC_PORT", "7861"))
COMFY_URL = os.environ.get("COMFYUI_URL", "http://127.0.0.1:8188").rstrip("/")

REQUIRED = ["gradio", "pillow", "requests"]


def step(msg):
    print(f"\n=== {msg} ===", flush=True)


def fail(msg):
    print(f"\n[오류] {msg}", flush=True)
    input("엔터를 누르면 종료합니다...")
    sys.exit(1)


def ensure_venv():
    step("1/3 가상환경 준비")
    if PY.exists():
        print("이미 있음")
        return
    r = subprocess.run([sys.executable, "-m", "venv", str(VENV)])
    if r.returncode != 0 or not PY.exists():
        fail("가상환경을 만들지 못했습니다. Python이 올바르게 설치돼 있는지 확인하세요.")
    subprocess.run([str(PY), "-m", "pip", "install", "--upgrade", "pip"])


def ensure_packages():
    step("2/3 필요한 패키지 확인")
    marker = VENV / "deps_ok.txt"
    want = ",".join(REQUIRED)
    if marker.exists() and marker.read_text(encoding="utf-8").strip() == want:
        print("이미 설치됨")
        return
    print("설치 중... (처음 한 번만, 1~2분 걸릴 수 있습니다)")
    r = subprocess.run([str(PY), "-m", "pip", "install", *REQUIRED])
    if r.returncode != 0:
        fail("패키지 설치에 실패했습니다. 인터넷 연결을 확인하고 다시 실행해 보세요.")
    marker.write_text(want, encoding="utf-8")


def comfy_alive():
    try:
        urllib.request.urlopen(f"{COMFY_URL}/system_stats", timeout=3)
        return True
    except Exception:
        return False


def ensure_comfyui():
    step("3/3 ComfyUI 연결 확인")
    if comfy_alive():
        print(f"ComfyUI 연결됨 ({COMFY_URL})")
        return
    print(f"[안내] {COMFY_URL} 에서 ComfyUI를 찾지 못했습니다.")
    print("먼저 ComfyUI를 켜 주세요 — 기존에 쓰시던 'simple ui confirm' 폴더의 START.bat을 실행하면")
    print("ComfyUI도 같이 켜집니다. (다른 방법으로 ComfyUI를 직접 켜도 됩니다.)")
    print("10초 동안 기다려 봅니다...")
    for _ in range(5):
        time.sleep(2)
        if comfy_alive():
            print("ComfyUI 연결됨")
            return
    print("[계속 진행] ComfyUI가 아직 안 보이지만 화면은 일단 엽니다 — 화면 안의 '다시 확인' 버튼으로")
    print("재확인할 수 있어요. ComfyUI를 켜기 전에는 '미리보기 생성'을 눌러도 오류 메시지만 나옵니다.")


def main():
    os.chdir(ROOT)
    print("taleforge_graphic — 그래픽 생성 도우미")
    ensure_venv()
    ensure_packages()
    ensure_comfyui()
    print(f"\n화면을 엽니다 → http://127.0.0.1:{PORT}  (이 창을 닫지 마세요)")
    env = dict(os.environ, TALEFORGE_GRAPHIC_PORT=str(PORT), COMFYUI_URL=COMFY_URL,
               GRADIO_ANALYTICS_ENABLED="False")
    try:
        subprocess.call([str(PY), "ui.py"], cwd=ROOT, env=env)
    except KeyboardInterrupt:
        pass
    print("종료되었습니다.")


if __name__ == "__main__":
    main()
