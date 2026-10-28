"""taleforge_graphic 화면 — ComfyUI 노드를 직접 안 만지고, 몇 번 클릭으로
픽셀아트 에셋을 생성·실험해 보는 Gradio 앱.

흐름: 설명 입력(+원하면 카테고리/스타일 보조 문구) → "미리보기 생성"
(ComfyUI가 그린 큰 원본) → 마음에 들면 "픽셀아트로 저장"(pixelate.js로
강제 도트 변환, outputs/pixel/에 저장). 카테고리/스타일 보조 문구는 둘 다
끌 수 있다 — Opus가 나중에 뽑아낼 실제 에셋 프롬프트를 한 글자도 안 바꾸고
그대로 테스트하고 싶을 때는 둘 다 끄고 설명란에 그 프롬프트를 그대로 넣으면 된다.
"""
import io
import os
import threading
import time
from pathlib import Path

import gradio as gr
from PIL import Image

import comfy_client as CC
import downloader as DL
import history as HIST
import model_catalog as MC
import paths as PATHS
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


def update_prompt_preview(category, description, extra, use_category_preset, use_style_base):
    return WF.build_prompt(category, description, extra, use_category_preset=use_category_preset, use_style_base=use_style_base)


def do_preview(category, description, extra, use_category_preset, use_style_base, checkpoint, size, steps, cfg, sampler, scheduler, seed_text, lora, lora_strength):
    if not checkpoint:
        yield None, "체크포인트(모델)를 먼저 고르세요 — '새로고침' 버튼으로 목록을 가져올 수 있어요.", None
        return
    positive = WF.build_prompt(category, description, extra, use_category_preset=use_category_preset, use_style_base=use_style_base)
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


# ---------------- 모델(체크포인트/LoRA) 받기 ----------------

def models_dir_status():
    md = PATHS.models_dir()
    if not md:
        return "설정 안 됨 — 아래에 ComfyUI의 models 폴더 경로를 적고 저장하세요."
    return f"현재 위치: {md}" + ("" if Path(md).is_dir() else "  ⚠ 이 경로가 실제로 있는지 확인하세요(아직 폴더가 없을 수 있어요).")


def save_models_dir(p):
    p = (p or "").strip().strip('"')
    if not p:
        return "경로를 입력하세요 — 예: C:\\Users\\이름\\simple ui confirm\\models"
    PATHS.set_models_dir(p)
    return models_dir_status()


def _download_with_progress(url, dest_path):
    """제너레이터: 진행 상황 문자열을 yield하다가, 끝나면 '완료'/'실패'로 시작하는
    마지막 문자열을 yield한다(그걸로 호출부가 끝났는지 판단)."""
    state = {"done": 0, "total": 0, "error": None, "finished": False}

    def progress_cb(done, total):
        state["done"], state["total"] = done, total

    def run():
        try:
            DL.download(url, dest_path, progress=progress_cb)
        except Exception as e:
            state["error"] = str(e)
        finally:
            state["finished"] = True

    threading.Thread(target=run, daemon=True).start()
    while not state["finished"]:
        done, total = state["done"], state["total"]
        if total:
            pct = int(done * 100 / total)
            yield f"받는 중... {pct}% ({done / 1024 ** 2:.0f}/{total / 1024 ** 2:.0f} MB)"
        elif done:
            yield f"받는 중... ({done / 1024 ** 2:.0f} MB)"
        else:
            yield "연결하는 중..."
        time.sleep(0.5)
    if state["error"]:
        yield f"실패: {state['error']}"
    else:
        yield f"완료! 저장됨: {dest_path}"


def make_catalog_download_handler(entry):
    def handler():
        md = PATHS.models_dir()
        if not md:
            yield "먼저 위에서 'ComfyUI models 폴더 위치'를 설정하고 저장하세요.", gr.update(), gr.update()
            return
        dest = Path(md) / entry["subdir"] / entry["filename"]
        for status in _download_with_progress(entry["url"], dest):
            if status.startswith("완료"):
                yield status, refresh_checkpoints(), refresh_loras()
            else:
                yield status, gr.update(), gr.update()
    return handler


def custom_download_handler(url, subdir):
    md = PATHS.models_dir()
    if not md:
        yield "먼저 위에서 'ComfyUI models 폴더 위치'를 설정하고 저장하세요.", gr.update(), gr.update()
        return
    url = (url or "").strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        yield "http:// 또는 https:// 로 시작하는 주소를 넣어 주세요.", gr.update(), gr.update()
        return
    filename = url.rstrip("/").split("/")[-1].split("?")[0] or "download.safetensors"
    dest = Path(md) / subdir / filename
    for status in _download_with_progress(url, dest):
        if status.startswith("완료"):
            yield status, refresh_checkpoints(), refresh_loras()
        else:
            yield status, gr.update(), gr.update()


CSS = """
.status-box textarea { font-family: ui-monospace, monospace; }
"""

with gr.Blocks(title="taleforge_graphic") as demo:
    gr.Markdown("# 🎨 taleforge_graphic — ComfyUI 그래픽 생성 도우미")
    gr.Markdown(
        "ComfyUI 노드 화면을 직접 안 만지고, 설명만 쓰고 버튼을 눌러 픽셀아트 에셋을 "
        "생성·실험해 보는 도구입니다. 카테고리/스타일 보조 문구는 아래에서 켜고 끌 수 있어요."
    )

    with gr.Row():
        status_box = gr.Textbox(label="ComfyUI 상태", value="", interactive=False, elem_classes=["status-box"])
        status_btn = gr.Button("🔄 다시 확인", scale=0)

    with gr.Accordion("📦 픽셀아트 모델 받기 (체크포인트/LoRA)", open=False):
        gr.Markdown(
            "먼저 ComfyUI의 **models 폴더 위치**를 한 번 설정하세요(기존에 쓰시던 도구의 "
            "`models` 폴더와 같은 곳이면 됩니다 — 예: `...\\simple ui confirm\\models`)."
        )
        with gr.Row():
            models_dir_box = gr.Textbox(label="ComfyUI models 폴더 위치", placeholder="예: C:\\Users\\이름\\simple ui confirm\\models", scale=3)
            models_dir_save_btn = gr.Button("저장", scale=0)
        models_dir_status_box = gr.Textbox(label="", value="", interactive=False)

        gr.Markdown("### 추천 목록")
        catalog_rows = []
        for entry in MC.PIXEL_ART_MODELS:
            gr.Markdown(f"**{entry['name']}** ({entry['size_hint']})  \n{entry['desc']}")
            with gr.Row():
                dl_btn = gr.Button(f"⬇ {entry['filename']} 받기", scale=0)
                dl_status = gr.Textbox(label="", value="", interactive=False, scale=3)
            catalog_rows.append((entry, dl_btn, dl_status))
        gr.Markdown(
            "*(이 URL들은 받아보기 전까지 확실하다고 장담 못 해요 — 오류가 나면 아래 "
            "'직접 URL로 받기'로 다른 주소를 시도해 보세요.)*"
        )

        gr.Markdown("### 직접 URL로 받기")
        with gr.Row():
            custom_url_box = gr.Textbox(label="HuggingFace 등 .safetensors 직접 주소", placeholder="https://huggingface.co/.../resolve/main/....safetensors", scale=3)
            custom_subdir_dd = gr.Dropdown(label="저장 위치", choices=["loras", "checkpoints"], value="loras", scale=1)
            custom_dl_btn = gr.Button("받기", scale=0)
        custom_dl_status = gr.Textbox(label="", value="", interactive=False)

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
                use_category_preset = gr.Checkbox(label="카테고리 구도 문구 추가", value=True,
                                                    info="켜면 '어떤 종류'에 맞는 구도 설명(아이콘은 중앙 배치 등)을 덧붙여요. 카메라 각도는 안 건드려요.")
                use_style_base = gr.Checkbox(label="스타일 보조 문구 추가", value=True,
                                               info="켜면 색감/조명/질감 수식어를 덧붙여요. 둘 다 끄면 입력한 설명이 그대로(수정 없이) 전송돼요 — Opus가 줄 실제 프롬프트를 그대로 테스트할 때 둘 다 끄세요.")
            prompt_preview = gr.Textbox(label="실제로 전송될 프롬프트 (미리보기)", interactive=False, lines=2)

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

    models_dir_save_btn.click(save_models_dir, inputs=models_dir_box, outputs=models_dir_status_box)
    for entry, dl_btn, dl_status in catalog_rows:
        dl_btn.click(make_catalog_download_handler(entry), outputs=[dl_status, checkpoint, lora])
    custom_dl_btn.click(custom_download_handler, inputs=[custom_url_box, custom_subdir_dd], outputs=[custom_dl_status, checkpoint, lora])

    preview_btn.click(
        do_preview,
        inputs=[category, description, extra, use_category_preset, use_style_base, checkpoint, size, steps, cfg, sampler, scheduler, seed_text, lora, lora_strength],
        outputs=[preview_img, status_text, raw_path_state],
    )
    for comp in (category, description, extra, use_category_preset, use_style_base):
        comp.change(update_prompt_preview, inputs=[category, description, extra, use_category_preset, use_style_base], outputs=prompt_preview)
    pixelate_btn.click(
        do_pixelate,
        inputs=[raw_path_state, category, grid_size, max_colors, alpha_threshold],
        outputs=[pixel_img, pixel_status, gallery],
    )

    demo.load(check_status, outputs=status_box)
    demo.load(refresh_checkpoints, outputs=checkpoint)
    demo.load(refresh_loras, outputs=lora)
    demo.load(load_gallery, outputs=gallery)
    demo.load(update_prompt_preview, inputs=[category, description, extra, use_category_preset, use_style_base], outputs=prompt_preview)
    demo.load(models_dir_status, outputs=models_dir_status_box)
    demo.load(lambda: str(PATHS.models_dir() or ""), outputs=models_dir_box)

if __name__ == "__main__":
    demo.queue().launch(server_name="127.0.0.1", server_port=PORT, inbrowser=True, css=CSS)
