"""ComfyUI 로컬 서버와 통신하는 얇은 클라이언트.

사용자가 이미 쓰고 있는 'simple ui confirm' 도구의 ui.py에 있던
queue_prompt / poll_history / fetch_image / comfy_state / friendly_error
패턴을 그대로 가져와, 인물 사진 전용 내용(학습 중 생성 차단 등)만 빼고
범용으로 다듬었다 — ComfyUI와의 "큐 등록 → 폴링 → 다운로드" 왕복 자체는
이미 그 도구가 사용자 PC에서 실전 검증한 형태이므로 새로 설계하지 않았다.
"""
import os
import socket
import time

import requests

COMFYUI_URL = os.environ.get("COMFYUI_URL", "http://127.0.0.1:8188").rstrip("/")
HTTP = requests.Session()


class ComfyError(Exception):
    """사용자에게 그대로 보여 줄 한국어 메시지."""


_ERR_RULES = [
    (("no space left", "errno 28", "disk full"),
     "저장 공간이 부족해요. 디스크 여유 공간을 확보한 뒤 다시 해보세요."),
    (("connection", "refused", "max retries", "timed out"),
     "ComfyUI와 연결이 안 돼요. ComfyUI가 켜져 있는지 확인하세요. 방금 켰다면 1~2분 기다렸다가 다시 시도해 보세요."),
    (("cuda", "cublas", "device-side assert"),
     "그래픽카드(CUDA) 오류예요. ComfyUI를 다시 시작하고, 계속되면 그래픽 드라이버를 최신으로 업데이트해 보세요."),
]


def friendly_error(msg, prefix="ComfyUI 오류"):
    """영어 오류 원문을 보고 원인과 해결 방법을 한글로 알려 준다. 해당 없으면 원문 그대로."""
    raw = str(msg or "").strip() or "알 수 없는 오류"
    low = raw.lower()
    for keys, hint in _ERR_RULES:
        if any(k in low for k in keys):
            return f"{hint}\n\n(자세한 원인: {raw[:400]})"
    return f"{prefix}: {raw}"


def queue_prompt(workflow, client_id="taleforge_graphic"):
    """워크플로(그래프)를 ComfyUI 큐에 등록하고 prompt_id를 돌려준다."""
    try:
        r = HTTP.post(f"{COMFYUI_URL}/prompt", json={"prompt": workflow, "client_id": client_id}, timeout=30)
    except requests.exceptions.RequestException as e:
        raise ComfyError(friendly_error(f"connection {e}"))
    if r.status_code != 200:
        try:
            j = r.json()
            msg = j.get("error", {}).get("message", r.text)
            details = []
            for nid, ne in (j.get("node_errors") or {}).items():
                for err in ne.get("errors", []):
                    details.append(f"[{ne.get('class_type')}] {err.get('message')} {err.get('details', '')}")
            if details:
                msg += "\n" + "\n".join(details)
        except Exception:
            msg = r.text
        raise ComfyError(friendly_error(msg, "ComfyUI가 요청을 거부했습니다"))
    return r.json()["prompt_id"]


_POLL_FAIL = {}             # prompt_id -> [타임아웃 연속 횟수, 연결거부 연속 횟수]
POLL_TIMEOUT_MAX = 120      # 응답이 느린 채로 연속 이만큼(약 20분)이면 포기 — 큰 모델 로딩 등
POLL_REFUSED_MAX = 30       # 연결 자체가 거부되면(ComfyUI 꺼짐) 이만큼(약 30초) 뒤에 포기


def poll_history(pid):
    """(끝났는지, 결과 이미지 참조 리스트). 아직이면 (False, [])."""
    try:
        r = HTTP.get(f"{COMFYUI_URL}/history/{pid}", timeout=10)
        h = r.json().get(pid)
    except (requests.exceptions.Timeout, requests.exceptions.ConnectionError, ValueError) as e:
        f = _POLL_FAIL.setdefault(pid, [0, 0])
        if isinstance(e, requests.exceptions.Timeout):
            f[0] += 1
            f[1] = 0
        elif isinstance(e, requests.exceptions.ConnectionError):
            f[1] += 1
        if f[0] > POLL_TIMEOUT_MAX:
            _POLL_FAIL.pop(pid, None)
            raise ComfyError("ComfyUI가 20분 가까이 응답이 없어요. 모델이 너무 커서 메모리가 부족한 것일 수 있어요. ComfyUI를 다시 시작해 보세요.")
        if f[1] > POLL_REFUSED_MAX:
            _POLL_FAIL.pop(pid, None)
            raise ComfyError("ComfyUI와 연결이 끊겼어요(꺼졌거나 오류로 종료됐을 수 있어요). ComfyUI를 다시 켜 주세요.")
        return False, []
    _POLL_FAIL.pop(pid, None)
    if not h:
        return False, []
    st = h.get("status", {})
    if st.get("status_str") == "error":
        msgs = st.get("messages", [])
        if any(m[0] == "execution_interrupted" for m in msgs):
            return True, []
        errs = [m[1] for m in msgs if m[0] == "execution_error"]
        detail = errs[-1].get("exception_message", "") if errs else "알 수 없는 오류"
        raise ComfyError(friendly_error(detail, "ComfyUI 실행 오류"))
    refs = []
    for out in h.get("outputs", {}).values():
        refs.extend(out.get("images", []))
    if refs or st.get("completed"):
        return True, refs
    return False, []


def fetch_image_bytes(ref):
    r = HTTP.get(f"{COMFYUI_URL}/view", params={
        "filename": ref["filename"], "subfolder": ref.get("subfolder", ""), "type": ref.get("type", "output"),
    }, timeout=60)
    r.raise_for_status()
    return r.content


def comfy_state():
    """'ok'(정상 응답) | 'busy'(연결은 되는데 응답이 느림 — 모델 로딩 등) | 'off'(연결 거부 = 꺼짐)."""
    host_port = COMFYUI_URL.split("//", 1)[-1]
    host, _, port = host_port.partition(":")
    port = int(port or 80)
    try:
        socket.create_connection((host, port), timeout=2).close()
    except OSError:
        return "off"
    try:
        HTTP.get(f"{COMFYUI_URL}/system_stats", timeout=5).json()
        return "ok"
    except Exception:
        return "busy"


def get_checkpoints():
    """설치된 체크포인트 이름 목록. ComfyUI의 /object_info로 실제 설치된 것만 가져온다
    (파일시스템을 직접 긁지 않음 — ComfyUI가 보는 것과 항상 일치하게)."""
    try:
        r = HTTP.get(f"{COMFYUI_URL}/object_info/CheckpointLoaderSimple", timeout=10)
        r.raise_for_status()
        return list(r.json()["CheckpointLoaderSimple"]["input"]["required"]["ckpt_name"][0])
    except Exception:
        return []


def get_loras():
    """설치된 LoRA 이름 목록(없으면 빈 리스트) — 체크포인트와 같은 방식."""
    try:
        r = HTTP.get(f"{COMFYUI_URL}/object_info/LoraLoader", timeout=10)
        r.raise_for_status()
        return list(r.json()["LoraLoader"]["input"]["required"]["lora_name"][0])
    except Exception:
        return []


def wait_for_result(pid, interval=1.5, max_wait=600, on_tick=None):
    """완료될 때까지 기다렸다가 결과 이미지 참조 리스트를 돌려준다.
    on_tick(elapsed_seconds)가 있으면 매 폴링마다 호출(화면 진행 표시용)."""
    start = time.time()
    while time.time() - start < max_wait:
        done, refs = poll_history(pid)
        if done:
            return refs
        if on_tick:
            on_tick(time.time() - start)
        time.sleep(interval)
    raise ComfyError(f"{max_wait}초 안에 끝나지 않았어요. 모델이 크거나 스텝 수가 많을 수 있어요.")
