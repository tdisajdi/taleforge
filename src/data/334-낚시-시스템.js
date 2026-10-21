// 🎣 낚시 시스템 (62-3번 섹션 신설)
// 포구/해안 장소(coastal:true)에서 낚시로 잡을 수 있는 물고기 도감.
// weight 필드로 가중 랜덤 추첨 — economy/255의 SEA_EVENT_POOL/
// pickWeightedSeaEvent와 똑같은 가중치 합산 방식(총합 100).
export const FISH_DEFS = [
  { id:'fish_silver_minnow', name:'은빛 피라미', icon:'🐟', rarity:'common', weight:30 },
  { id:'fish_river_carp', name:'잉어', icon:'🐠', rarity:'common', weight:25 },
  { id:'fish_blue_mackerel', name:'청색 고등어', icon:'🐟', rarity:'uncommon', weight:18 },
  { id:'fish_crimson_bass', name:'진홍 농어', icon:'🐡', rarity:'uncommon', weight:14 },
  { id:'fish_pearl_eel', name:'진주 뱀장어', icon:'🦑', rarity:'rare', weight:7 },
  { id:'fish_shark_pup', name:'새끼 상어', icon:'🦈', rarity:'rare', weight:4 },
  { id:'fish_golden_koi', name:'황금 잉어', icon:'🎏', rarity:'epic', weight:1.5 },
  { id:'fish_kraken_spawn', name:'크라켄의 새끼', icon:'🐙', rarity:'legendary', weight:0.5 },
];
