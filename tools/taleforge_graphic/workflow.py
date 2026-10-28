"""ComfyUI 그래프(워크플로) 빌더 + Emberville 스타일 프롬프트 프리셋.

표준 노드만 사용한다(커스텀 노드 설치 불필요): CheckpointLoaderSimple →
EmptyLatentImage + CLIPTextEncode(긍정/부정) → KSampler → VAEDecode → SaveImage,
LoRA를 고르면 LoraLoader를 체크포인트와 KSampler/CLIPTextEncode 사이에 끼워 넣는다.

tools/pixelart-gen/ai-image-gen.js의 buildComfyWorkflow()(78번 라운드에서 taleforge
게임 아이콘용으로 먼저 만든 버전)와 그래프 구조는 사실상 같지만, 프롬프트 프리셋은
완전히 다르다 — 그쪽은 "UI 아이콘(흰 배경 위 단일 오브젝트)"용이고 이 도구는
"Emberville 레퍼런스(탑뷰 타일/스프라이트, 디테일한 질감, 동적 조명/파티클)"용이라
목적 자체가 다르다. 그래서 그래프 빌더를 공용 모듈로 묶지 않고 각자 둔다.
"""
import hashlib

NEGATIVE_DEFAULT = (
    "blurry, photo, realistic, 3d render, watermark, signature, text, "
    "low quality, jpeg artifacts, extra limbs, deformed"
)

# Emberville 레퍼런스(사용자 제공 스크린샷 2장)에서 뽑은 공통 스타일 문구 —
# "플랫 아이콘"이 아니라 디더링된 질감·그림자가 있는 탑뷰 픽셀아트, 어둡고
# 채도 낮은 베이스 팔레트 + 포인트 컬러 대비, 동적 조명(glow)과 파티클.
STYLE_BASE = (
    "detailed pixel art, top-down RPG game asset, dithered shading, rich texture, "
    "moody dark fantasy color palette with vivid magic accent colors, dynamic lighting with glow, "
    "Stardew Valley x Diablo art style, high detail, game asset"
)

CATEGORY_LABELS = {
    "weapon_icon": "무기/아이템 아이콘",
    "tile": "타일(바닥/지형)",
    "monster": "몬스터",
    "character": "캐릭터 스프라이트",
    "scene": "장면/환경",
    "effect": "이펙트(마법/파티클)",
}
CATEGORY_PRESETS = {
    "weapon_icon": "a single weapon or item icon, centered, plain dark background, no character",
    "tile": "a seamless top-down ground tile, grass and stone texture, game tileset piece, no character",
    "monster": "a monster creature, full body shown from head to foot, top-down RPG game sprite",
    "character": "a character sprite, full body shown from head to foot, top-down RPG game sprite, standing pose",
    "scene": "a full game scene, top-down RPG dungeon or forest environment, atmospheric, wide view",
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


def build_prompt(category, description, extra=""):
    base = CATEGORY_PRESETS.get(category, CATEGORY_PRESETS["weapon_icon"])
    parts = []
    if description and description.strip():
        parts.append(description.strip())
    parts.append(base)
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
