"""픽셀아트용으로 추천하는 체크포인트/LoRA 목록 — '받기' 버튼이 쓰는 데이터.

중요(정직하게): 이 URL들은 2026-10-28에 웹 검색으로 찾은 것이고, 이 세션은
huggingface.co에 직접 접속할 수 없는 샌드박스라(18절/21절 메모 참고) **실제로
다운로드가 되는지는 한 번도 못 해봤다** — 검색 결과에 실제 파일 경로(blob
URL)가 나온 것만 골라서 신뢰도를 높였을 뿐이다. 받기 버튼을 눌렀을 때 404나
오류가 나면 model_catalog.py의 url만 고치면 되고, 그 사이에는 화면 아래
"직접 URL로 받기"로 다른 주소를 바로 시도할 수 있다.

추천 방향: 체크포인트 자체를 통째로 바꾸는 대신, 지금 쓰시는 체크포인트
(SDXL 계열)에 "픽셀아트 LoRA"를 얹는 쪽을 1순위로 추천한다 — 다운로드가
훨씬 작고(수백 MB vs 수 GB), 체크포인트를 안 바꾸니 기존에 쓰던 다른
워크플로에 영향이 없고, 8GB VRAM에서 새 체크포인트를 또 얹는 부담도 없다.
"""

PIXEL_ART_MODELS = [
    {
        "id": "nerijs_pixel_art_xl",
        "name": "Pixel Art XL (LoRA, SDXL) — 1순위 추천",
        "url": "https://huggingface.co/nerijs/pixel-art-xl/resolve/main/pixel-art-xl.safetensors",
        "subdir": "loras",
        "filename": "pixel-art-xl.safetensors",
        "size_hint": "약 171MB",
        "desc": (
            "가장 널리 쓰이는 SDXL용 픽셀아트 LoRA. 지금 쓰시는 체크포인트에 그대로 "
            "얹어서 쓸 수 있어요(체크포인트 교체 불필요) — 프롬프트에 'pixel art'를 "
            "넣으면 더 잘 먹혀요. 받은 뒤 화면의 LoRA 목록에서 🔄로 새로고침하면 "
            "'pixel-art-xl.safetensors'가 보일 거예요."
        ),
    },
]
