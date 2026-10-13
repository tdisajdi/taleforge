// [17] 세력 명성 변경 / 상태 조회 — data
// Pure data split out of world/219-17-세력-명성-변경-상태-조회.js (see generate.js).

export const FACTION_DEFS = {
  kingdom_knights: { name:'철의 맹세단',  icon:'⚔️',  baseRep:50 },
  mage_assoc:      { name:'마법사 협회',  icon:'🔮',  baseRep:50 },
  church:          { name:'순환의 사원',  icon:'⛪',  baseRep:50 },
  thieves:         { name:'도적 길드',    icon:'🗡️',  baseRep:30 },
  merchants:       { name:'상공회의소',   icon:'💰',  baseRep:50 },
  cabal:           { name:'아스모데우스 결사', icon:'🌑', baseRep:0 },
  celestial:       { name:'천계',         icon:'👼',  baseRep:40 },
  infernal:        { name:'마계',         icon:'😈',  baseRep:20 },
};

// [60-3번 섹션] FACTION_DEFS(영문 ID 8개, AI의 gs.faction_rep 태그가
// 쓰는 체계)와 FACTIONS_BY_SCENARIO(한글 이름 20개, npc/067 — 라이벌/
// 동맹·세력전쟁 시뮬레이션·전담 리더 NPC 퀘스트체인까지 갖춘 실제
// 플레이 중 평판이 쌓이는 체계)는 서로 다른 ID 공간이라 완전히
// 평행하게 따로 작동했다. 이름이 실질적으로 같은 세력을 가리키는
// 6개를 여기 매핑해두고, world/219의 changeFactionRep ↔ npc/067의
// updateFactionRep가 서로를 양방향으로 반영하게 한다(구현은 두 함수
// 쪽에 있음). celestial/infernal(천계/마계)은 중세 시나리오의 정치
// 세력이 아니라 외부 종족 세력이라 FACTIONS_BY_SCENARIO에 대응하는
// 항목이 없음 — 매핑하지 않고 FACTION_DEFS 전용(상점 가격 연동 등)으로
// 그대로 둔다.
export const FACTION_DEF_SCENARIO_MAP = {
  kingdom_knights: '왕국 기사단',
  mage_assoc: '마법사 협회',
  church: '교회',
  thieves: '도적 길드',
  merchants: '상인 조합',
  cabal: '암흑 결사',
};
