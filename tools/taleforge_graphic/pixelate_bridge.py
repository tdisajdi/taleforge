"""tools/pixelart-gen/pixelate-cli.js(Node)를 subprocess로 호출하는 다리.

양자화(박스 다운스케일+median-cut)를 파이썬으로 다시 짜지 않고, 이미 검증된
pixelate.js/png-encoder.js를 그대로 재사용한다 — 같은 로직이 두 언어에
중복 구현되는 걸 막기 위함(이 저장소의 기존 ai-image-gen.js도 같은 모듈을 씀).
"""
import json
import subprocess
from pathlib import Path

PIXELART_GEN_DIR = Path(__file__).resolve().parent.parent / "pixelart-gen"
CLI = PIXELART_GEN_DIR / "pixelate-cli.js"


class PixelateError(Exception):
    pass


def pixelate(input_path, output_path, grid_size=64, max_colors=48, alpha_threshold=96, node_cmd="node"):
    """input_path(PNG)를 도트화해서 output_path에 저장한다. 결과 정보 dict를 돌려준다."""
    if not CLI.exists():
        raise PixelateError(f"{CLI} 를 찾을 수 없어요 — taleforge 저장소의 tools/pixelart-gen/ 폴더와 함께 있어야 합니다.")
    cmd = [node_cmd, str(CLI), str(input_path), str(output_path),
           f"--gridSize={grid_size}", f"--maxColors={max_colors}", f"--alphaThreshold={alpha_threshold}"]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    except FileNotFoundError:
        raise PixelateError(f"'{node_cmd}' 명령을 찾을 수 없어요 — Node.js가 설치돼 있는지 확인하세요.")
    except subprocess.TimeoutExpired:
        raise PixelateError("도트 변환이 60초 안에 끝나지 않았어요.")
    if r.returncode != 0:
        raise PixelateError(r.stderr.strip() or r.stdout.strip() or "pixelate-cli.js 실행 실패")
    try:
        return json.loads(r.stdout.strip().splitlines()[-1])
    except Exception:
        return {"ok": True, "output": str(output_path)}
