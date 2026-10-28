// 이미지 생성 백엔드 3종을 지원한다:
//  - pollinations(기본, 무료, API 키 불필요) — https://pollinations.ai
//  - gemini(유료, GEMINI_API_KEY 필요, 결제 계정 연결 필요)
//  - comfyui(사용자 본인 컴퓨터의 로컬 ComfyUI 서버 호출, 키 불필요하지만
//    이 클라우드 샌드박스에선 절대 도달 못 함 — 아래 "ComfyUI 백엔드" 섹션 참고)
// IMAGE_PROVIDER 환경변수로 고른다('gemini'/'comfyui'를 명시적으로 지정할
// 때만 그 경로로 감, 그 외엔 기본 pollinations). 셋 중 뭘 쓰든 반환값은
// 항상 "원본 이미지 PNG Buffer"로 동일해서, 그 뒤(pixelate.js가 강제로
// 도트화하는 부분)는 완전히 똑같이 처리된다.
//
// --- ComfyUI 백엔드 (IMAGE_PROVIDER=comfyui) ---
// 사용자 본인 PC(RTX 5070 8GB, ComfyUI 설치됨)에서 `node generate.js --ai`를
// 돌릴 때만 의미가 있다 — 이 코드가 도는 클라우드 샌드박스는 외부 호스트
// 아웃바운드가 막혀있고(메모장.md 18-2절) localhost:8188은 애초에 사용자의
// 로컬 머신이라 이 샌드박스에서는 물리적으로 접근 자체가 불가능하다. 즉
// 이 함수는 **코드만 여기서 작성하고, 실제 호출 테스트는 반드시 사용자가
// 본인 PC에서 ComfyUI를 켜둔 채로 직접 돌려봐야 한다.**
// 환경변수로 조정 가능(전부 기본값 있음, ComfyUI 기본 설치 기준):
//   COMFYUI_URL(기본 http://127.0.0.1:8188), COMFYUI_CHECKPOINT(기본
//   체크포인트 파일명 — 설치된 모델명으로 반드시 바꿔야 함),
//   COMFYUI_LORA(선택, 픽셀아트 전용 LoRA 쓸 때), COMFYUI_STEPS/CFG/
//   SAMPLER/SCHEDULER/WIDTH/HEIGHT/NEGATIVE.
// ComfyUI는 "그래프(API) 형식" JSON을 /prompt로 큐에 넣고, /history/
// {prompt_id}를 폴링해 완료를 확인한 뒤 /view로 실제 PNG 바이트를
// 받아오는 3단계 호출이다(공식 웹소켓 방식 대신 의존성 없는 폴링을
// 선택 — 이 프로젝트가 이미 fetch 기반 폴링/타임아웃 패턴을 쓰고 있어
// 일관성 유지).
//
// entity에 aiSubtype/element(ai-analyze.js가 무료 텍스트 분석으로
// 판단한 값)가 있으면 프롬프트에 그대로 반영한다 — "분석 → 그 분석을
// 반영해서 이미지 생성 → 도트로 강제 변환 → 매니페스트에 등록"까지
// 한 번의 --ai 실행으로 이어지는 자동화 파이프라인의 핵심 연결부.
const GEMINI_MODEL = 'gemini-2.5-flash-image'; // 장당 약 $0.039(2026-09 기준) — 유료 경로 전용

const ELEMENT_PROMPT_WORDS = {
  fire: 'fiery color theme, flame orange and red',
  ice: 'icy color theme, frost cyan and blue',
  poison: 'toxic color theme, venomous green and purple',
  holy: 'holy color theme, radiant gold and white',
  dark: 'dark color theme, shadowy purple and black',
  nature: 'natural color theme, earthy green and brown',
  electric: 'electric color theme, charged yellow and blue',
};

// 프롬프트를 일부러 "단순한 평면 아이콘"으로 강하게 제한한다 — 이렇게
// 해야 pixelate.js의 다운스케일+양자화가 지저분해지지 않는다(사진처럼
// 그림자/질감이 많은 원본은 아무리 잘 양자화해도 얼룩덜룩해진다).
function buildPrompt(entity) {
  // manual-overrides.json으로 프롬프트 전체를 사용자가 직접 지정했으면
  // 그걸 그대로 쓴다(자동 조합 문구를 전혀 안 붙임 — 완전한 수동 제어).
  if (entity.promptOverride) return entity.promptOverride;
  const desc = entity.desc || entity.description || '';
  const label = entity.name || entity.label || '';
  const hints = [];
  if (entity.aiSubtype) hints.push(`it is specifically ${entity.aiSubtype.match(/^[aeiou]/i) ? 'an' : 'a'} ${entity.aiSubtype}`);
  if (entity.element && ELEMENT_PROMPT_WORDS[entity.element]) hints.push(ELEMENT_PROMPT_WORDS[entity.element]);
  return [
    `Simple flat-color game icon of: ${label}${desc ? ' — ' + desc : ''}.`,
    hints.length ? hints.join(', ') + '.' : '',
    'Full body / whole object shown, wide shot, entire subject visible from top to bottom — NOT a close-up, NOT a cropped zoom on just the head or face.',
    'Centered, single object, plain white background.',
    'Flat colors only, no gradients, no shadows, no texture, no anti-aliasing softness.',
    'Bold clean silhouette, thick outlines, like a board-game piece icon.',
    // 1차 결과가 클로즈업으로 판정돼서 재시도할 때만 붙는 추가 강조 —
    // 그냥 처음부터 이 문장까지 넣으면 오히려 과도하게 반복돼서 프롬프트
    // 품질이 떨어질 수 있어 재시도 때만 켠다.
    entity._forceWide ? 'IMPORTANT: this must look like a full character/object reference sheet showing the WHOLE subject from a distance — absolutely NOT zoomed in on the head or any single part.' : '',
  ].filter(Boolean).join(' ');
}

// 프롬프트로 "전신 구도"를 요청해도 이미지 생성 모델이 항상 지키는 건
// 아니라서(특히 무료 공개 모델), 만들어진 결과물을 다시 무료 vision
// 분석으로 검증한다 — 이미지를 "만드는" 게 아니라 "읽고 답하는" 거라
// 이 호출은 결제 계정 없이도 된다(실측 확인함: 이미지 입력 + 텍스트
// 출력은 유료 이미지 생성 할당량과 별개).
async function isFullBodyShot(pngBuffer) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return true; // 검증 불가하면 안전하게 통과(재시도 낭비 방지)
  const body = {
    contents: [{
      parts: [
        { text: '이 이미지가 그리려는 대상의 전체 모습(맨 위부터 맨 아래까지)이 다 보이면 "full", 얼굴/머리 등 일부만 크게 확대된 클로즈업이면 "closeup"이라고 한 단어로만 답해라.' },
        { inlineData: { mimeType: 'image/png', data: pngBuffer.toString('base64') } },
      ],
    }],
  };
  try {
    const res = await fetchWithTimeout('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    });
    if (!res.ok) return true; // 검증 자체가 실패하면 안전하게 통과
    const json = await res.json();
    const text = (json?.candidates?.[0]?.content?.parts?.[0]?.text || '').toLowerCase();
    return !text.includes('closeup'); // 판단 불명확(N/A 등)이면 일단 통과시킴
  } catch (e) {
    return true;
  }
}

// 결정론적 시드(이름 기반) — 같은 항목이면 재생성해도 같은 이미지가
// 나오도록(Pollinations는 seed 파라미터로 이를 지원).
function seedFor(entity) {
  // 재시도(_forceWide) 때는 시드를 다르게 줘야 한다 — Pollinations는
  // 프롬프트+시드가 같으면 같은 그림을 돌려주므로, 시드를 안 바꾸면
  // 강화된 프롬프트를 써도 똑같은 클로즈업 그림이 또 나올 수 있다.
  const s = String(entity.id || entity.name || 'x') + (entity._forceWide ? ':retry' : '');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0) % 1000000;
}

// 네트워크가 막혀있거나(방화벽/DNS) 서버가 응답을 그냥 안 주는 경우,
// fetch()는 기본적으로 무한정 기다린다 — 타임아웃이 없으면 항목
// 하나가 걸려서 3,450개 전체 배치가 영영 멈출 수 있다. 반드시 강제
// 타임아웃을 걸어서, 막힌 항목은 실패로 간주하고 절차적 생성으로
// 넘어가게 한다.
const FETCH_TIMEOUT_MS = 25000;
async function fetchWithTimeout(url, opts) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function generateViaPollinations(entity) {
  const prompt = buildPrompt(entity);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${seedFor(entity)}`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      console.warn(`[ai-image-gen] Pollinations 오류(${res.status}) — ${entity.id || entity.name}은 절차적 생성으로 대체`);
      return null;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (e) {
    console.warn(`[ai-image-gen] Pollinations 호출 실패(${e.message}) — ${entity.id || entity.name}은 절차적 생성으로 대체`);
    return null;
  }
}

async function generateViaGemini(entity) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const prompt = buildPrompt(entity);
  // 2026-09부로 구글이 새로 발급하는 키는 'AQ.' 접두사 형식이고, 이 형식은
  // ?key= 쿼리 파라미터가 아니라 x-goog-api-key 헤더로 보내야 인증됨.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn(`[ai-image-gen] Gemini API 오류(${res.status}) — ${entity.id || entity.name}은 절차적 생성으로 대체`);
      return null;
    }
    const json = await res.json();
    const parts = json?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData?.data);
    if (!imgPart) return null;
    return Buffer.from(imgPart.inlineData.data, 'base64');
  } catch (e) {
    console.warn(`[ai-image-gen] Gemini 호출 실패(${e.message}) — ${entity.id || entity.name}은 절차적 생성으로 대체`);
    return null;
  }
}

const COMFYUI_URL = (process.env.COMFYUI_URL || 'http://127.0.0.1:8188').replace(/\/$/, '');
// 기본 체크포인트는 실제로 어떤 모델이 설치돼 있는지 알 수 없어 placeholder일
// 뿐이다 — 반드시 COMFYUI_CHECKPOINT 환경변수로 본인 PC에 설치된 실제
// .safetensors/.ckpt 파일명(ComfyUI의 models/checkpoints/ 폴더 기준)으로
// 덮어써야 한다. 틀린 이름이면 ComfyUI가 /prompt에서 즉시 오류를 주고,
// 아래 generateViaComfyUI가 그걸 감지해 절차적 생성으로 안전하게 폴백한다.
const COMFYUI_CHECKPOINT = process.env.COMFYUI_CHECKPOINT || 'sd_xl_base_1.0.safetensors';
const COMFYUI_LORA = process.env.COMFYUI_LORA || ''; // 선택 — 픽셀아트 전용 LoRA 파일명
const COMFYUI_LORA_STRENGTH = parseFloat(process.env.COMFYUI_LORA_STRENGTH || '0.8');
const COMFYUI_STEPS = parseInt(process.env.COMFYUI_STEPS || '20', 10);
const COMFYUI_CFG = parseFloat(process.env.COMFYUI_CFG || '7.0');
const COMFYUI_SAMPLER = process.env.COMFYUI_SAMPLER || 'dpmpp_2m';
const COMFYUI_SCHEDULER = process.env.COMFYUI_SCHEDULER || 'karras';
const COMFYUI_WIDTH = parseInt(process.env.COMFYUI_WIDTH || '512', 10);
const COMFYUI_HEIGHT = parseInt(process.env.COMFYUI_HEIGHT || '512', 10);
// pixelate.js가 어차피 다운스케일+양자화를 강제하므로, 여기서는 사진처럼
// 지저분해지는 걸 막는 쪽으로만 네거티브를 잡는다(buildPrompt()의 "flat
// icon" 지시문과 같은 목적).
const COMFYUI_NEGATIVE = process.env.COMFYUI_NEGATIVE
  || 'blurry, photo, realistic, 3d render, watermark, signature, text, close-up, cropped, extra limbs, lowres';
const COMFYUI_POLL_INTERVAL_MS = 1500;
// SDXL 계열을 8GB VRAM에서 돌리면 모델 로드+생성에 꽤 걸릴 수 있어
// Pollinations/Gemini보다 훨씬 넉넉하게 잡는다(네트워크 왕복이 아니라
// 실제 로컬 GPU 추론 시간이라 25초 FETCH_TIMEOUT_MS로는 턱없이 부족함).
const COMFYUI_MAX_WAIT_MS = 180000;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// ComfyUI "API(그래프) 형식" 워크플로 — 기본 설치에 항상 있는 표준 노드
// (CheckpointLoaderSimple/CLIPTextEncode/EmptyLatentImage/KSampler/
// VAEDecode/SaveImage)만 써서 커스텀 노드 설치 여부에 의존하지 않는다.
// COMFYUI_LORA가 지정되면 LoraLoader를 체크포인트와 KSampler/CLIPTextEncode
// 사이에 끼워 넣는다(ComfyUI 공식 워크플로의 표준 연결 패턴).
function buildComfyWorkflow(entity) {
  const positivePrompt = buildPrompt(entity);
  const seed = seedFor(entity);
  const graph = {
    checkpoint: {
      class_type: 'CheckpointLoaderSimple',
      inputs: { ckpt_name: COMFYUI_CHECKPOINT },
    },
    latent: {
      class_type: 'EmptyLatentImage',
      inputs: { batch_size: 1, width: COMFYUI_WIDTH, height: COMFYUI_HEIGHT },
    },
    positive: {
      class_type: 'CLIPTextEncode',
      inputs: { text: positivePrompt, clip: ['checkpoint', 1] },
    },
    negative: {
      class_type: 'CLIPTextEncode',
      inputs: { text: COMFYUI_NEGATIVE, clip: ['checkpoint', 1] },
    },
    sampler: {
      class_type: 'KSampler',
      inputs: {
        seed, steps: COMFYUI_STEPS, cfg: COMFYUI_CFG,
        sampler_name: COMFYUI_SAMPLER, scheduler: COMFYUI_SCHEDULER, denoise: 1,
        model: ['checkpoint', 0], positive: ['positive', 0], negative: ['negative', 0],
        latent_image: ['latent', 0],
      },
    },
    decode: {
      class_type: 'VAEDecode',
      inputs: { samples: ['sampler', 0], vae: ['checkpoint', 2] },
    },
    save: {
      class_type: 'SaveImage',
      inputs: { filename_prefix: 'taleforge_pixelart', images: ['decode', 0] },
    },
  };
  if (COMFYUI_LORA) {
    graph.lora = {
      class_type: 'LoraLoader',
      inputs: {
        lora_name: COMFYUI_LORA,
        strength_model: COMFYUI_LORA_STRENGTH, strength_clip: COMFYUI_LORA_STRENGTH,
        model: ['checkpoint', 0], clip: ['checkpoint', 1],
      },
    };
    graph.sampler.inputs.model = ['lora', 0];
    graph.positive.inputs.clip = ['lora', 1];
    graph.negative.inputs.clip = ['lora', 1];
  }
  return graph;
}

function findFirstOutputImage(outputs) {
  for (const nodeId of Object.keys(outputs || {})) {
    const images = outputs[nodeId] && outputs[nodeId].images;
    if (images && images.length) return images[0];
  }
  return null;
}

// /history/{promptId}를 완료될 때까지 폴링한다. ComfyUI는 실행이 끝난
// prompt_id만 /history에 올려주므로(진행 중엔 키 자체가 없음), 응답에
// 그 키가 생기는 걸 "완료" 신호로 쓴다 — 별도 상태 필드를 안 봐도 됨.
async function waitForComfyResult(promptId) {
  const start = Date.now();
  while (Date.now() - start < COMFYUI_MAX_WAIT_MS) {
    let res;
    try {
      res = await fetchWithTimeout(`${COMFYUI_URL}/history/${promptId}`);
    } catch (e) {
      return null; // 서버가 중간에 죽거나 연결이 끊김 — 안전하게 폴백
    }
    if (res.ok) {
      const json = await res.json();
      const entry = json[promptId];
      if (entry && entry.outputs) return entry.outputs;
    }
    await sleep(COMFYUI_POLL_INTERVAL_MS);
  }
  console.warn(`[ai-image-gen] ComfyUI 응답 대기 시간 초과(${COMFYUI_MAX_WAIT_MS / 1000}초) — prompt_id=${promptId}`);
  return null;
}

async function generateViaComfyUI(entity) {
  const workflow = buildComfyWorkflow(entity);
  const clientId = `taleforge-pixelart-gen-${process.pid}`;
  try {
    const queueRes = await fetchWithTimeout(`${COMFYUI_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow, client_id: clientId }),
    });
    if (!queueRes.ok) {
      const errBody = await queueRes.text().catch(() => '');
      console.warn(`[ai-image-gen] ComfyUI 큐 등록 실패(${queueRes.status}) — ${entity.id || entity.name}은 절차적 생성으로 대체. 체크포인트 이름(COMFYUI_CHECKPOINT="${COMFYUI_CHECKPOINT}")이 실제 설치된 모델과 맞는지 확인하세요. 응답: ${errBody.slice(0, 300)}`);
      return null;
    }
    const { prompt_id } = await queueRes.json();
    const outputs = await waitForComfyResult(prompt_id);
    if (!outputs) {
      console.warn(`[ai-image-gen] ComfyUI 결과 수신 실패 — ${entity.id || entity.name}은 절차적 생성으로 대체`);
      return null;
    }
    const imageRef = findFirstOutputImage(outputs);
    if (!imageRef) return null;
    const viewUrl = `${COMFYUI_URL}/view?filename=${encodeURIComponent(imageRef.filename)}&subfolder=${encodeURIComponent(imageRef.subfolder || '')}&type=${encodeURIComponent(imageRef.type || 'output')}`;
    const imgRes = await fetchWithTimeout(viewUrl);
    if (!imgRes.ok) return null;
    return Buffer.from(await imgRes.arrayBuffer());
  } catch (e) {
    console.warn(`[ai-image-gen] ComfyUI 호출 실패(${e.message}) — ${entity.id || entity.name}은 절차적 생성으로 대체. ${COMFYUI_URL}에서 ComfyUI가 실행 중인지 확인하세요.`);
    return null;
  }
}

/**
 * entity 하나에 대해 이미지를 생성해서 PNG Buffer로 돌려준다.
 * 실패(네트워크 오류/키 없음/응답에 이미지 없음)하면 null을 반환한다
 * — 호출부(generate.js)가 null이면 절차적 생성기로 폴백한다.
 *
 * 생성 후 무료 vision 분석으로 "전신이 다 보이는 구도인지"를 검증한다
 * (예: "용"을 검색하면 머리만 확대된 그림과 전신이 다 보이는 그림이
 * 섞여 나오는 문제 — 아이콘 세트 전체의 구도 일관성이 깨지는 걸
 * 막기 위함). 클로즈업으로 판정되면 프롬프트를 더 강하게 해서 한 번
 * 재시도하고, 그래도 안 되면 null을 돌려줘서 절차적 생성으로 안전하게
 * 대체한다(잘못된 구도의 이미지를 그대로 쓰지 않음).
 */
async function generateImageForEntity(entity) {
  const provider = process.env.IMAGE_PROVIDER === 'gemini' ? 'gemini'
    : process.env.IMAGE_PROVIDER === 'comfyui' ? 'comfyui'
    : 'pollinations';
  const gen = provider === 'gemini' ? generateViaGemini
    : provider === 'comfyui' ? generateViaComfyUI
    : generateViaPollinations;

  let buf = await gen(entity);
  if (!buf) return null;
  if (await isFullBodyShot(buf)) return buf;

  console.warn(`[ai-image-gen] ${entity.id || entity.name}: 클로즈업 구도 감지 — 전신 구도로 1회 재시도`);
  buf = await gen({ ...entity, _forceWide: true });
  if (!buf) return null;
  if (await isFullBodyShot(buf)) return buf;

  console.warn(`[ai-image-gen] ${entity.id || entity.name}: 재시도해도 클로즈업 — 절차적 생성으로 대체`);
  return null;
}

module.exports = { generateImageForEntity, buildPrompt, isFullBodyShot, GEMINI_MODEL, buildComfyWorkflow, COMFYUI_URL };
