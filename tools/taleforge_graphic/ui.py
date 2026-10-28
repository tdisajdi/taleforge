"""taleforge_graphic 화면 — ComfyUI 노드를 직접 안 만지고, 몇 번 클릭으로
Emberville 스타일 픽셀아트를 실험해 보는 Gradio 앱.

흐름: 설명/카테고리 선택 → "미리보기 생성"(ComfyUI가 그린 큰 원본) →
마음에 들면 "픽셀아트로 저장"(pixelate.js로 강제 도트 변환, outputs/pixel/에 저장).
"""
import io
import os
import time
from pathlib import Path

import gradio as gr
from PIL import Image

import comfy_client as CC
import history as HIST
import pixelate_bridge as PX
import workflow as WF

ROOT = Path(__file__).resolve().parent
OUTPUTS = ROOT / "outputs"
RAW_DIR = OUTPUTS / "raw"
PIXEL_DIR = OUTPUTS / "pixel"
RAW_DIR.mkdir(parents=True, exist_ok=True)
PIXEL_DIR.mkdir(parents=True, exist_ok=True)

PORT = int(os.environ.get("TALEFORGE_GRAPHIC_PORT", "7861"))

_STATE_ICON = {"ok": "🟢 연결됨", "busy": "🟡 응답 느림(모델 로딩 중일 수 있음)", "off": "🔴 연결 안 됨"}


def _safe_name(s):
    return "".join(c if c.isalnum() or c in "-_." else "_" for c in str(s))[:60]


def check_status():
    state = CC.comfy_state()
    msg = f"ComfyUI({CC.COMFYUI_URL}): {_STATE_ICON.get(state, state)}"
    if state == "off":
        msg += "\n먼저 ComfyUI를 켜 주세요 (예: 기존에 쓰던 도구의 START.bat)."
    return msg


def refresh_checkpoints():
    ckpts = CC.get_checkpoints()
    if not ckpts:
        return gr.update(choices=[], value=None, info="ComfyUI에서 체크포인트 목록을 못 가져왔어요 — ComfyUI가 켜져 있는지 확인하세요.")
    return gr.update(choices=ckpts, value=ckpts[0])


def refresh_loras():
    loras = [WF.NO_LORA] + CC.get_loras()
    return gr.update(choices=loras, value=WF.NO_LORA)


def do_preview(category, description, extra, checkpoint, size, steps, cfg, sampler, scheduler, seed_text, lora, lora_strength):
    if not checkpoint:
        yield None, "체크포인트(모델)를 먼저 고르세요 — '새로고침' 버튼으로 목록을 가져올 수 있어요.", None
        return
    positive = WF.build_prompt(category, description, extra)
    seed = None
    seed_text = (seed_text or "").strip()
    if seed_text:
        try:
            seed = int(seed_text)
        except ValueError:
            yield None, "시드는 숫자만 입력하세요(비워 두면 설명 기반으로 자동 결정).", None
            return
    graph, used_seed = WF.build_workflow(
        checkpoint, positive, size=int(size), steps=int(steps), cfg=float(cfg),
        sampler=sampler, scheduler=scheduler, seed=seed, lora=lora, lora_strength=float(lora_strength),
    )
    try:
        pid = CC.queue_prompt(graph)
    except CC.ComfyError as e:
        yield None, str(e), None
        return

    t0 = time.time()
    while True:
        try:
            done, refs = CC.poll_history(pid)
        except CC.ComfyError as e:
            yield None, str(e), None
            return
        if done:
            break
        yield None, f"그리는 중... ({time.time() - t0:.0f}초 경과)\n프롬프트: {positive}", None
        time.sleep(1.5)

    if not refs:
        yield None, "ComfyUI가 결과 이미지를 돌려주지 않았어요(중단됐을 수 있음). 다시 시도해 보세요.", None
        return
    try:
        raw_bytes = CC.fetch_image_bytes(refs[0])
    except Exception as e:
        yield None, CC.friendly_error(str(e), "이미지를 받아오지 못했습니다"), None
        return

    raw_path = RAW_DIR / f"{int(time.time())}_{_safe_name(category)}_{used_seed}.png"
    raw_path.write_bytes(raw_bytes)
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    status = f"완성! ({time.time() - t0:.0f}초)\n시드: {used_seed}\n프롬프트: {positive}"
    yield img, status, str(raw_path)


def do_pixelate(raw_path, category, grid_size, max_colors, alpha_threshold):
    if not raw_path:
        return None, "먼저 '미리보기 생성'으로 원본을 만드세요.", gr.update()
    try:
        out_path = PIXEL_DIR / (Path(raw_path).stem + "_px.png")
        PX.pixelate(raw_path, out_path, grid_size=int(grid_size), max_colors=int(max_colors), alpha_threshold=int(alpha_threshold))
    except PX.PixelateError as e:
        return None, f"도트 변환 실패: {e}", gr.update()

    pixel_img = Image.open(out_path).convert("RGBA")
    # 64x64 같은 작은 그리드를 화면에서 보기 쉽게 최근접 확대(저장 파일 자체는 원래 작은 그대로 둠)
    preview = pixel_img.resize((pixel_img.width * 6, pixel_img.height * 6), Image.NEAREST)

    HIST.add(str(OUTPUTS), {
        "category": category, "raw": str(raw_path), "pixel": str(out_path),
        "gridSize": int(grid_size), "maxColors": int(max_colors),
    })
    gallery_items = [(str(Path(r["pixel"])), f"{r.get('category', '')}") for r in HIST.recent(str(OUTPUTS), 24) if Path(r.get("pixel", "")).exists()]
    return preview, f"저장됨: {out_path}", gr.update(value=gallery_items)


def load_gallery():
    items = [(str(Path(r["pixel"])), f"{r.get('category', '')}") for r in HIST.recent(str(OUTPUTS), 24) if Path(r.get("pixel", "")).exists()]
    return gr.update(value=items)


CSS = """
.status-box textarea { font-family: ui-monospace, monospace; }
"""

with gr.Blocks(title="taleforge_graphic") as demo:
    gr.Markdown("# 🎨 taleforge_graphic — ComfyUI 그래픽 생성 도우미")
    gr.Markdown(
        "ComfyUI 노드 화면을 직접 안 만지고, 설명만 쓰고 버튼을 눌러 Emberville 스타일"
        "(탑뷰 픽셀아트, 디테일한 타일, 동적 조명/파티클) 그림을 실험해 보는 도구입니다."
    )

    with gr.Row():
        status_box = gr.Textbox(label="ComfyUI 상태", value="", interactive=False, elem_classes=["status-box"])
        status_btn = gr.Button("🔄 다시 확인", scale=0)

    with gr.Row():
        with gr.Column():
            category = gr.Dropdown(
                label="어떤 종류", choices=[(label, key) for key, label in WF.CATEGORY_LABELS.items()],
                value="weapon_icon",
            )
            description = gr.Textbox(
                label="무엇을 그릴지 (영어로 쓰면 더 잘 그려져요)",
                placeholder="예: a glowing ice sword with blue runes",
                lines=2,
            )
            extra = gr.Textbox(label="추가 문구 (선택)", placeholder="예: autumn colors", lines=1)

            with gr.Row():
                checkpoint = gr.Dropdown(label="체크포인트(모델)", choices=[], interactive=True)
                ckpt_refresh = gr.Button("🔄", scale=0)
            with gr.Row():
                lora = gr.Dropdown(label="LoRA (선택)", choices=[WF.NO_LORA], value=WF.NO_LORA, interactive=True)
                lora_refresh = gr.Button("🔄", scale=0)
            lora_strength = gr.Slider(label="LoRA 강도", minimum=0, maximum=1.5, value=0.8, step=0.05)

            with gr.Accordion("고급 설정", open=False):
                size = gr.Radio(label="해상도(정사각)", choices=WF.RESOLUTIONS, value=512)
                steps = gr.Slider(label="스텝", minimum=4, maximum=60, value=24, step=1)
                cfg = gr.Slider(label="CFG", minimum=1, maximum=15, value=6.5, step=0.5)
                sampler = gr.Dropdown(label="샘플러", choices=WF.SAMPLERS, value="dpmpp_2m")
                scheduler = gr.Dropdown(label="스케줄러", choices=WF.SCHEDULERS, value="karras")
                seed_text = gr.Textbox(label="시드 (비우면 자동)", placeholder="예: 12345")

            preview_btn = gr.Button("🖼 미리보기 생성", variant="primary")

        with gr.Column():
            preview_img = gr.Image(label="원본 미리보기 (아직 도트 아님)", type="pil")
            status_text = gr.Textbox(label="상태", lines=4, interactive=False)
            raw_path_state = gr.State(value=None)

            with gr.Row():
                grid_size = gr.Slider(label="그리드 크기", minimum=16, maximum=96, value=64, step=8)
                max_colors = gr.Slider(label="색상 수", minimum=4, maximum=64, value=48, step=4)
            alpha_threshold = gr.Slider(label="투명 임계값", minimum=0, maximum=255, value=96, step=1)

            pixelate_btn = gr.Button("🧱 픽셀아트로 저장", variant="secondary")
            pixel_img = gr.Image(label="픽셀아트 결과(화면 표시용으로 확대됨)", type="pil")
            pixel_status = gr.Textbox(label="저장 상태", lines=2, interactive=False)

    gr.Markdown("## 최근 만든 것들")
    gallery = gr.Gallery(label="기록", columns=8, height=220)

    status_btn.click(check_status, outputs=status_box)
    ckpt_refresh.click(refresh_checkpoints, outputs=checkpoint)
    lora_refresh.click(refresh_loras, outputs=lora)

    preview_btn.click(
        do_preview,
        inputs=[category, description, extra, checkpoint, size, steps, cfg, sampler, scheduler, seed_text, lora, lora_strength],
        outputs=[preview_img, status_text, raw_path_state],
    )
    pixelate_btn.click(
        do_pixelate,
        inputs=[raw_path_state, category, grid_size, max_colors, alpha_threshold],
        outputs=[pixel_img, pixel_status, gallery],
    )

    demo.load(check_status, outputs=status_box)
    demo.load(refresh_checkpoints, outputs=checkpoint)
    demo.load(refresh_loras, outputs=lora)
    demo.load(load_gallery, outputs=gallery)

if __name__ == "__main__":
    demo.queue().launch(server_name="127.0.0.1", server_port=PORT, inbrowser=True, css=CSS)
