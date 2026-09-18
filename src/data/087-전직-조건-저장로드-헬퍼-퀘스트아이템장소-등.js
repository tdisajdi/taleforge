// 전직 조건 저장/로드 헬퍼 (퀘스트·아이템·장소 등) — data
// Pure data split out of job/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js (see generate.js).

export const WL={none:'없음',rain:'비 🌧️',storm:'폭풍 ⛈️',snow:'눈 ❄️',fog:'안개 🌫️',scorching:'폭염 🔥',clear:'맑음 ☀️'};

export const TL={none:'없음',dawn:'새벽 🌅',morning:'아침 ☀️',midday:'정오 🌞',afternoon:'오후 🌤️',evening:'저녁 🌆',night:'밤 🌙',midnight:'자정 🌑'};

export const WL_ICON={none:'',rain:'🌧️',storm:'⛈️',snow:'❄️',fog:'🌫️',scorching:'🔥',clear:'☀️'};

export const TL_ICON={none:'',dawn:'🌅',morning:'☀️',midday:'🌞',afternoon:'🌤️',evening:'🌆',night:'🌙',midnight:'🌑'};

export const WL_TEXT={none:'없음',rain:'비',storm:'폭풍',snow:'눈',fog:'안개',scorching:'폭염',clear:'맑음'};

export const TL_TEXT={none:'없음',dawn:'새벽',morning:'아침',midday:'정오',afternoon:'오후',evening:'저녁',night:'밤',midnight:'자정'};

export const QUEST_GRADES = {
  S: { label:'서사 핵심',    color:'#ff6060', glow:'rgba(255,60,60,.4)',  badge:'★ S',  maxActive:2,  cooldownTurns:0 },
  A: { label:'중요 사건',    color:'#e0a030', glow:'rgba(224,160,48,.35)', badge:'▲ A',  maxActive:5,  cooldownTurns:0 },
  B: { label:'일반 의뢰',    color:'#4a90d0', glow:'rgba(74,144,208,.25)', badge:'◆ B',  maxActive:99, cooldownTurns:0 },
  C: { label:'소소한 심부름',color:'#60b060', glow:'rgba(96,176,96,.2)',  badge:'● C',  maxActive:99, cooldownTurns:0 },
  D: { label:'분위기 퀘스트',color:'#6a6a8a', glow:'none',               badge:'○ D',  maxActive:99, cooldownTurns:0 },
};
