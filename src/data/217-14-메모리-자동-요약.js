// [14] 메모리 자동 요약 — data
// Pure data split out of misc/217-14-메모리-자동-요약.js (see generate.js).

export const FACT_CATEGORY_PRIORITY = {
  'npc_death':      100,
  'world_change':   90,
  'identity_reveal':85,
  'irreversible_choice': 70,
  'relationship_turn':   40,
  'unresolved_hook':      30,
};

export const IMMEDIATE_HOOK_PATTERNS = [
  // 자비/방생 — "죽이지 않고 보내줬다/살려줬다"
  { re:/(살려|살려주|놓아주|풀어주|보내주|용서하).{0,20}(었|줬|었다|주었다)/, label:'자비/방생' },
  // 의미심장한 물건 습득 — "정체를 알 수 없는/수상한" 류 수식어 + 습득 동사
  { re:/(수상한|기이한|낯선|정체를 알 수 없는|이상한 기운이 도는|범상치 않은).{0,15}(을|를)\s*(챙겼|주웠|획득했|손에 넣었|가져왔)/, label:'의미심장한 물건 습득' },
  // 비밀/진실 목격 — 본의 아니게 알게 된 것
  { re:/(우연히|몰래|엿듣|엿보|목격하).{0,20}(비밀|진실|음모|정체)/, label:'비밀 목격' },
  // 빚/은혜 지움 — 갚아야 할 것이 생긴 경우
  { re:/(빚을 졌|은혜를 입|신세를 졌|갚아야)/, label:'빚/은혜' },
  // 경고/예언성 발언을 들음
  { re:/(경고했|예언하|조심하라고|위험할 것이라고).{0,20}(말했|일렀|전했)/, label:'경고/예언' },
];
