// 5. 경제 시스템 실질화 — data
// Pure data split out of economy/285-5-경제-시스템-실질화.js (see generate.js).

export const ECONOMY_ACTIONS = {
  bribe:     { label:'💰 뇌물',     minGold:50,  repCost:-5,  hint:'뇌물을 통해 NPC를 회유한다. 관계 +20, 평판 -5.' },
  info_buy:  { label:'🕵️ 정보 구매', minGold:30,  repCost:0,   hint:'정보 상인에게 지역 정보를 구매한다.' },
  hire:      { label:'⚔️ 용병 고용', minGold:100, repCost:0,   hint:'용병을 단기 고용해 전투를 지원받는다. 3턴 유지.' },
  invest:    { label:'🏦 영지 투자', minGold:200, repCost:5,   hint:'지역에 투자해 명성을 쌓고 턴마다 골드를 회수한다.' },
  donate:    { label:'🎁 기부',      minGold:50,  repCost:10,  hint:'기부를 통해 지역 명성과 신앙심을 올린다.' },
};
