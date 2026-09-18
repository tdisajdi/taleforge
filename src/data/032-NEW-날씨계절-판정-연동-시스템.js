// [NEW] 날씨/계절 판정 연동 시스템 — data
// Pure data split out of world/032-NEW-날씨계절-판정-연동-시스템.js (see generate.js).

export const WEATHER_EFFECTS = {
  none:        { label:"맑음",     icon:"☀️",  bonuses:{}, penalties:{}, aiHint:"맑은 날씨. 특별한 날씨 효과 없음." },
  rain:        { label:"비",       icon:"🌧️", bonuses:{ disg:8, agi:5 },     penalties:{ str:-3, crit:-3, per:-5 },  aiHint:"비가 내립니다. 잠입과 은신에 유리하나 시야와 힘이 약간 감소합니다." },
  storm:       { label:"폭풍",     icon:"⛈️",  bonuses:{ mgc:10, fear:8 },    penalties:{ agi:-8, per:-10, spk:-5 },  aiHint:"폭풍이 몰아칩니다. 마법과 위압에 유리하나 기동력과 소통이 크게 제한됩니다." },
  snow:        { label:"눈",       icon:"❄️",  bonuses:{ cal:5, wil:5 },      penalties:{ agi:-5, ftg:10 },           aiHint:"눈이 내립니다. 정신이 맑아지나 체력 소모가 증가합니다." },
  fog:         { label:"안개",     icon:"🌫️", bonuses:{ disg:15, per:5 },    penalties:{ per:-8, crit:-5 },          aiHint:"짙은 안개가 낍니다. 위장에 매우 유리하나 탐지 능력이 감소합니다." },
  scorching:   { label:"폭염",     icon:"🔥",  bonuses:{ str:5, fear:5 },     penalties:{ end:-5, cal:-5, ftg:10 },   aiHint:"찌는 더위입니다. 공격적인 상황에 유리하나 지구력과 냉정함이 감소합니다." },
  blizzard:    { label:"눈보라",   icon:"🌨️", bonuses:{ wil:10, end:5 },     penalties:{ agi:-10, per:-12 },         aiHint:"맹렬한 눈보라가 몰아칩니다. 의지와 인내가 강해지나 기동과 시야가 크게 제한됩니다." },
  sandstorm:   { label:"모래폭풍", icon:"🏜️", bonuses:{ end:5, cal:5 },      penalties:{ per:-15, disg:-5 },         aiHint:"모래폭풍이 휩쓸고 있습니다. 방향 감각을 잃기 쉽고 시야가 거의 없습니다." },
  acid_rain:   { label:"산성비",   icon:"☢️",  bonuses:{ mgc:8, pstx:10 },    penalties:{ end:-8, hp:-2 },            aiHint:"산성비가 내립니다(아포칼립스). 상태저항(PSTX)에 유리하나 지속적으로 HP가 소모됩니다." },
  divine_light:{ label:"신성광",   icon:"✨",  bonuses:{ fath:15, mgc:10 },   penalties:{ mad:-5, fear:-5 },          aiHint:"신성한 빛이 내립니다(신화). 신앙과 마법이 강화되나 어둠의 존재는 약화됩니다." },
};

export const TIME_EFFECTS = {
  none:     { label:"",      icon:"",   bonuses:{}, penalties:{} },
  dawn:     { label:"새벽",  icon:"🌅", bonuses:{ per:5, cal:5 },      penalties:{} },
  morning:  { label:"아침",  icon:"☀️", bonuses:{ wil:5, luk:3 },     penalties:{} },
  midday:   { label:"정오",  icon:"🌞", bonuses:{ str:5, end:3 },      penalties:{ mgc:-3 } },
  afternoon:{ label:"오후",  icon:"🌤️",bonuses:{},                    penalties:{} },
  evening:  { label:"저녁",  icon:"🌆", bonuses:{ spk:5, cha:3 },      penalties:{} },
  night:    { label:"밤",    icon:"🌙", bonuses:{ mgc:8, disg:8 },      penalties:{ per:-5, luk:-3 } },
  midnight: { label:"자정",  icon:"🌑", bonuses:{ mgc:15, mad:5 },      penalties:{ fath:-5, per:-8 } },
};
