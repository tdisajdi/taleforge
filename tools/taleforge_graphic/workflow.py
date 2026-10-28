"""ComfyUI 그래프(워크플로) 빌더 + 선택적 스타일 보조 문구.

표준 노드만 사용한다(커스텀 노드 설치 불필요): CheckpointLoaderSimple →
EmptyLatentImage + CLIPTextEncode(긍정/부정) → KSampler → VAEDecode → SaveImage,
LoRA를 고르면 LoraLoader를 체크포인트와 KSampler/CLIPTextEncode 사이에 끼워 넣는다.

**중요(2026-10-28 수정)**: 예전 버전은 "탑뷰"·"Stardew Valley x Diablo"처럼
카메라 각도·장르를 단정하는 문구를 모든 프롬프트에 자동으로 끼워 넣었다 —
사용자가 실제로 요청한 적 없는 걸 임의로 코드에 박아 넣은 것이었다(사용자가
보여준 레퍼런스 이미지는 "이런 색감/조명/질감"을 보여준 것이지 "카메라 각도를
이렇게 확정해달라"는 요청이 아니었다). 그래서 카메라 각도·장르 비유는 전부
뺐고, 색감/조명/질감처럼 이미지에서 실제로 보이는 성질만 **선택적으로**(기본
켜짐, 화면에서 끌 수 있음) 덧붙이게 바꿨다. 이 도구의 진짜 용도는 Opus가
나중에 뽑아낼 실제 에셋 프롬프트를 그대로 넣어서 테스트해보는 것이므로,
원본 설명을 건드리지 않고 그대로 보낼 수 있는 경로가 항상 있어야 한다.
"""
import hashlib

NEGATIVE_DEFAULT = (
    "blurry, photo, realistic, 3d render, watermark, signature, text, "
    "low quality, jpeg artifacts, extra limbs, deformed"
)

# 선택적 스타일 보조 문구 — 카메라 각도·장르 비유 없이, 색감/조명/질감처럼
# 레퍼런스 이미지에서 실제로 보이는 성질만 담았다. 화면에서 끌 수 있고,
# 끄면 입력한 설명이 그대로(수식어 없이) 전송된다.
STYLE_BASE = (
    "detailed pixel art, dithered shading, rich texture, "
    "moody dark color palette with vivid accent colors, dynamic lighting with glow, high detail"
)

CATEGORY_LABELS = {
    "weapon_icon": "무기/아이템 아이콘",
    "tile": "타일(바닥/지형)",
    "monster": "몬스터",
    "character": "캐릭터 스프라이트",
    "scene": "장면/환경",
    "effect": "이펙트(마법/파티클)",
}
# 카메라 각도는 단정하지 않는다 — "무엇을 그리는가"만 구분(아이콘인지 장면인지
# 등 구도 성격)하고, 탑뷰/횡스크롤/쿼터뷰 같은 시점은 전혀 언급하지 않는다.
CATEGORY_PRESETS = {
    "weapon_icon": "a single weapon or item icon, centered, plain dark background, no character",
    "tile": "a seamless ground tile texture, game tileset piece, no character",
    "monster": "a monster creature, full body shown from head to foot, game sprite",
    "character": "a character sprite, full body shown from head to foot, game sprite, standing pose",
    "scene": "a full game scene, dungeon or forest environment, atmospheric",
    "effect": "a magical particle effect sprite, glowing, dark background",
}

RESOLUTIONS = [512, 640, 768]  # pixelate.js가 정사각 그리드로 강제 변환하므로 정사각만 제공
SAMPLERS = ["dpmpp_2m", "dpmpp_sde", "euler", "euler_ancestral", "ddim", "uni_pc"]
SCHEDULERS = ["karras", "normal", "simple", "sgm_uniform"]
NO_LORA = "(사용 안 함)"


def seed_for(text):
    """결정론적 시드 — 같은 설명/옵션이면 재현 가능하도록 한다(화면에서 직접 바꿀 수도 있음)."""
    h = hashlib.sha1(text.encode("utf-8")).hexdigest()
    return int(h[:8], 16) % 2_000_000_000


def build_prompt(category, description, extra="", use_category_preset=True, use_style_base=True):
    """description을 기반으로 긍정 프롬프트를 만든다.
    use_category_preset/use_style_base를 둘 다 끄면 description(+extra)을
    전혀 안 건드리고 그대로 돌려준다 — Opus가 뽑아낸 실제 프롬프트를
    한 글자도 안 바꾸고 그대로 테스트하고 싶을 때 쓰는 경로."""
    parts = []
    if description and description.strip():
        parts.append(description.strip())
    if use_category_preset:
        parts.append(CATEGORY_PRESETS.get(category, CATEGORY_PRESETS["weapon_icon"]))
    if use_style_base:
        parts.append(STYLE_BASE)
    if extra and extra.strip():
        parts.append(extra.strip())
    return ", ".join(p for p in parts if p)


def build_workflow(checkpoint, positive, negative=None, *, size=512, steps=24, cfg=6.5,
                    sampler="dpmpp_2m", scheduler="karras", seed=None, lora=None, lora_strength=0.8):
    """ComfyUI에 그대로 보낼 수 있는 그래프(dict)와 실제 쓰인 seed를 돌려준다."""
    negative = negative or NEGATIVE_DEFAULT
    if seed is None:
        seed = seed_for(positive)
    graph = {
        "checkpoint": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": checkpoint}},
        "latent": {"class_type": "EmptyLatentImage", "inputs": {"batch_size": 1, "width": size, "height": size}},
        "positive": {"class_type": "CLIPTextEncode", "inputs": {"text": positive, "clip": ["checkpoint", 1]}},
        "negative": {"class_type": "CLIPTextEncode", "inputs": {"text": negative, "clip": ["checkpoint", 1]}},
        "sampler": {"class_type": "KSampler", "inputs": {
            "seed": seed, "steps": steps, "cfg": cfg, "sampler_name": sampler, "scheduler": scheduler,
            "denoise": 1, "model": ["checkpoint", 0], "positive": ["positive", 0], "negative": ["negative", 0],
            "latent_image": ["latent", 0],
        }},
        "decode": {"class_type": "VAEDecode", "inputs": {"samples": ["sampler", 0], "vae": ["checkpoint", 2]}},
        "save": {"class_type": "SaveImage", "inputs": {"filename_prefix": "taleforge_graphic", "images": ["decode", 0]}},
    }
    if lora and lora != NO_LORA:
        graph["lora"] = {"class_type": "LoraLoader", "inputs": {
            "lora_name": lora, "strength_model": lora_strength, "strength_clip": lora_strength,
            "model": ["checkpoint", 0], "clip": ["checkpoint", 1],
        }}
        graph["sampler"]["inputs"]["model"] = ["lora", 0]
        graph["positive"]["inputs"]["clip"] = ["lora", 1]
        graph["negative"]["inputs"]["clip"] = ["lora", 1]
    return graph, seed
