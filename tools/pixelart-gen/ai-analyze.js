// 무료(텍스트) Gemini API로 아이템/몬스터 이름을 "분석"만 시키고,
// 실제 그림은 여전히 절차적 생성기(generators.js)가 그린다 — 이미지
// 생성 API(유료)는 전혀 안 쓴다. AI는 "이게 뭘 닮았는지, 어떤 속성
// 색을 써야 하는지"만 구조화된 값(enum)으로 판단하고, 그 값이 기존
// SHAPES/색상 표에 없으면 무조건 기존 기본값으로 폴백한다.
const WEAPON_SUBTYPES = ['sword', 'dagger', 'axe', 'bow', 'mace', 'trident', 'wand'];
const MONSTER_SUBTYPES = ['beast', 'dragon', 'ghost', 'demon', 'bat', 'golem', 'snake', 'bird', 'spider', 'undead'];
const ELEMENTS = ['none', 'fire', 'ice', 'poison', 'holy', 'dark', 'nature', 'electric'];

const SUBTYPES_BY_CATEGORY = { weapon: WEAPON_SUBTYPES, monster: MONSTER_SUBTYPES };

function buildPrompt(entity) {
  const subtypes = SUBTYPES_BY_CATEGORY[entity.category] || null;
  return [
    `아이템/몬스터 이름: "${entity.name}"${entity.desc ? ` (설명: ${entity.desc})` : ''}`,
    subtypes ? `이 항목의 종류를 다음 중 하나로만 골라라: ${subtypes.join(', ')}` : null,
    `이 항목의 속성(테마) 색을 다음 중 하나로만 골라라: ${ELEMENTS.join(', ')} (해당 없으면 none)`,
    'JSON으로만 답하라. 다른 설명 텍스트는 절대 쓰지 마라.',
  ].filter(Boolean).join('\n');
}

/**
 * entity: {name, category, desc}
 * 반환: {subtype: string|null, element: string} — 실패하면 항상
 * {subtype:null, element:'none'}으로 안전하게 폴백(호출부가 그러면
 * 기존 기본 모양/색을 그대로 씀).
 */
async function analyzeEntity(entity) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { subtype: null, element: 'none' };

  const subtypes = SUBTYPES_BY_CATEGORY[entity.category] || null;
  const schema = {
    type: 'OBJECT',
    properties: {
      subtype: subtypes ? { type: 'STRING', enum: subtypes } : undefined,
      element: { type: 'STRING', enum: ELEMENTS },
    },
    required: ['element'],
  };
  if (!subtypes) delete schema.properties.subtype;

  // 3.1-flash-lite: 무료 티어 일일 한도(RPD)가 가장 넉넉하고(500/일)
  // 이런 단순 분류 작업엔 충분한 가벼운 모델.
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';
  const body = {
    contents: [{ parts: [{ text: buildPrompt(entity) }] }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
  };
  // 네트워크가 막혀있으면 fetch()가 무한정 걸릴 수 있어서 강제 타임아웃을
  // 건다 — 안 그러면 항목 하나가 배치 전체를 영영 멈추게 할 수 있다.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) return { subtype: null, element: 'none' };
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { subtype: null, element: 'none' };
    const parsed = JSON.parse(text);
    const subtype = subtypes && subtypes.includes(parsed.subtype) ? parsed.subtype : null;
    const element = ELEMENTS.includes(parsed.element) ? parsed.element : 'none';
    return { subtype, element };
  } catch (e) {
    return { subtype: null, element: 'none' };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { analyzeEntity, WEAPON_SUBTYPES, MONSTER_SUBTYPES, ELEMENTS };
