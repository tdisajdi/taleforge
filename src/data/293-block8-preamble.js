// block8-preamble — data
// Pure data split out of misc/293-block8-preamble.js (see generate.js).

export const WEATHER_GAMEPLAY = {
  snow:      { hint:'눈이 발을 잠그고 시야를 막는다. 이동·원거리 판정 -10. 이동이 제한된 선택지를 포함하라.' },
  rain:      { hint:'빗소리가 귓가를 채운다. 화염 마법·원거리 -15. 은신에는 유리. 날씨를 선택지에 반영하라.' },
  fog:       { hint:'짙은 안개가 시야를 가린다. 지각 판정 -10. 불확실성이 선택지에 드러나야 한다.' },
  storm:     { hint:'폭풍이 몰아친다. 외부 행동 -15. 대피 선택지를 포함하라.' },
  scorching: { hint:'태양이 작열한다. 장시간 이동에 END 소모. 그늘·물 관련 선택지를 자연스럽게 포함하라.' },
};

export const DILEMMA_TEMPLATES = [
  { trigger:/구해|살려|도움/, dilemma:'무고한 자를 구하려면 지금 쫓는 목표를 포기해야 한다. 어느 쪽을 선택해도 뭔가를 잃는 선택지 2개를 포함하라.' },
  { trigger:/비밀|진실|거짓/, dilemma:'진실을 말하면 친구가 위험해진다. 어느 쪽을 선택해도 뭔가를 잃는 선택지 2개를 포함하라.' },
  { trigger:/싸워|전투|적/, dilemma:'적은 이미 무릎을 꿇었다. 자비를 베풀면 훗날 위협이 될 수 있다. 어느 쪽을 선택해도 뭔가를 잃는 선택지 2개를 포함하라.' },
  { trigger:/보상|금|재물|훔/, dilemma:'이 돈은 부패한 귀족에게서 빼앗은 것이지만 가져가면 도둑이 된다. 어느 쪽을 선택해도 뭔가를 잃는 선택지 2개를 포함하라.' },
];

export const RUMOR_TRIGGERS = [
  { pattern:/마왕.*쓰러|용.*처치|보스.*처치/, rumor:function(n){ return n+'이(가) 대악을 처치했다는 소문이 퍼지고 있다.'; }, fame:20 },
  { pattern:/구했|살려|해방|도와/, rumor:function(n){ return n+'이(가) 무고한 자들을 구했다는 이야기가 들린다.'; }, fame:10 },
  { pattern:/배신|팔아넘|배반/, rumor:function(n){ return n+'은(는) 믿을 수 없는 자라는 소문이 돈다.'; }, fame:-15 },
  { pattern:/학살|민간.*해쳐/, rumor:function(n){ return n+'이(가) 무고한 자를 해쳤다는 소문이 퍼지고 있다.'; }, fame:-25 },
  { pattern:/훔쳤|도둑|약탈/, rumor:function(n){ return n+'이(가) 도둑질을 했다는 소문이 돈다.'; }, fame:-8 },
  { pattern:/전투.*이겼|승리/, rumor:function(n){ return n+'의 전투 실력이 뛰어나다는 소문이 퍼지고 있다.'; }, fame:8 },
];

export const EMOTION_FX = {
  angry:   { label:'분노',  icon:'😡', hint:'분노 상태. 설득·협상 -15, 위협 +15. 충동적이거나 날카로운 반응을 묘사하라.' },
  sad:     { label:'슬픔',  icon:'😢', hint:'슬픔 상태. 사회 판정 -10. 대화가 단조롭거나 공허하고 상대가 걱정하는 반응을 보인다.' },
  fearful: { label:'두려움',icon:'😨', hint:'두려움 상태. 대화 판정 -15. 목소리가 떨리거나 주저하는 묘사를 추가하라.' },
  joyful:  { label:'기쁨',  icon:'😄', hint:'기쁨 상태. 설득·대화 +10. 밝고 활기찬 대화 분위기를 묘사하라.' },
  calm:    { label:'평온',  icon:'😌', hint:'평온 상태. 모든 판정 +5. 차분하고 이성적인 대화 묘사.' },
};

export const INJURY_PARTS = {
  r_arm:{ label:'오른팔', icon:'💪', penalty:'무기 STR -15', stat:'str', delta:-15, heal:8 },
  leg:  { label:'다리',   icon:'🦵', penalty:'이동·회피 AGI -15', stat:'agi', delta:-15, heal:10 },
  head: { label:'머리',   icon:'🪖', penalty:'집중 INT -10', stat:'int', delta:-10, heal:6 },
  chest:{ label:'흉부',   icon:'🫀', penalty:'체력 END -12', stat:'end', delta:-12, heal:12 },
};

export const SENSORY_DB = {
  city:   { sound:'시장 소란·상인 외침', smell:'구운 빵·향신료·마구간', touch:'자갈 진동', sight:'인파 속 다양한 표정' },
  dungeon:{ sound:'물 소리·자신의 발소리·이상한 울림', smell:'곰팡이·녹슨 쇠·차가운 공기', touch:'차가운 돌벽·미끄러운 바닥', sight:'횃불 그림자' },
  forest: { sound:'나뭇잎 바스락·새소리·짐승 울음', smell:'흙·이끼·꽃향기', touch:'낙엽과 부드러운 흙', sight:'햇빛이 잎 사이로' },
  inn:    { sound:'끓이는 소리·담소·술잔 소리', smell:'맥주·고기 굽는 냄새·나무 연기', touch:'거친 나무 의자·벽난로 열기', sight:'흐릿한 촛불과 취객들' },
  castle: { sound:'갑옷 소리·트럼펫·발소리 메아리', smell:'밀랍·돌먼지·오래된 직물', touch:'차가운 대리석', sight:'높은 천장의 깃발' },
  port:   { sound:'갈매기 울음·파도·선원들의 고함', smell:'소금기·생선·타르', touch:'축축한 판자와 밧줄', sight:'정박한 돛단배와 짐꾼들' },
  wilderness: { sound:'바람 소리·풀벌레·먼 짐승 울음', smell:'젖은 흙·야생초', touch:'거친 잡초와 자갈길', sight:'끝없이 펼쳐진 황무지' },
};

export const RIVAL_NAMES_LIST = ['강철의 칼리우스','붉은 갈퀴 데르만','독이빨 사이렌','검은 갑옷 오그레인','냉혹한 스카르'];

export const RIVAL_TAUNTS_LIST = ['또 만나는군. 이번엔 살아남지 못할 것이다.','기다리고 있었다.','재미있군. 좀 더 버텨봐.','네 눈빛이 마음에 든다. 그래서 더 처절하게 박살낼 거야.'];

export const PS_PATTERNS = {
  combat:/공격|싸워|베|찌르|때려|전투|쳐|돌격/,
  talk:/말을|대화|설득|물어|부탁|협상|이야기/,
  stealth:/몰래|숨|잠입|은신|조용|기척/,
  flee:/도망|달아|피해|물러|후퇴/,
  help:/도와|구해|살려|보호|치료/,
  betray:/배신|팔아|속여|거짓/,
  explore:/탐색|조사|살펴|둘러|찾아/,
  craft:/만들|제작|고쳐|수리/,
};
