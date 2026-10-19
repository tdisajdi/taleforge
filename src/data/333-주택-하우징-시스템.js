// 🏠 주택/하우징 시스템 (62-1번 섹션 신설)
// 마을·도시 등 정착지에서 한 번 구매하면, 그 장소에 플레이어 개인
// 소유의 "내 집"이 생긴다 — 그 집에 있을 때는 여관 비용 없이 무료로
// 쉴 수 있고, 가구를 사서 꾸미면 영구 스탯 보너스가 붙는다.
export const HOUSE_PRICE = 500;

// quest/086의 openP('shop') 검사와 같은 "정착지다움" 판정 기준(SHOP_ALLOWED_TYPES)
// 중 실제 거주지 성격의 타입만 재사용 — shrine/special/event 등 특수 장소는 제외.
export const HOUSE_BUY_LOCATION_TYPES = ['city', 'village', 'capital', 'town', 'hamlet', 'port'];

export const FURNITURE_DEFS = [
  { id: 'fn_fireplace', name: '따뜻한 벽난로', icon: '🔥', cost: 120, bonus: { regen: 5 }, desc: '매일 밤 몸을 데워 회복력을 길러준다.' },
  { id: 'fn_bookshelf', name: '서재 책장', icon: '📚', cost: 150, bonus: { int: 5 }, desc: '틈틈이 책을 읽으며 지력을 길렀다.' },
  { id: 'fn_training_dummy', name: '수련용 짚인형', icon: '🥊', cost: 140, bonus: { str: 5 }, desc: '매일 짬짬이 휘두르다 보니 힘이 붙었다.' },
  { id: 'fn_meditation_mat', name: '명상용 방석', icon: '🧘', cost: 130, bonus: { wil: 5 }, desc: '고요히 앉아 마음을 다스리는 습관이 생겼다.' },
  { id: 'fn_lucky_horseshoe', name: '행운의 말편자', icon: '🧿', cost: 160, bonus: { luk: 5 }, desc: '문 위에 걸어두면 행운이 깃든다는 말이 있다.' },
  { id: 'fn_parlor_set', name: '응접실 소파 세트', icon: '🛋️', cost: 180, bonus: { cha: 5 }, desc: '손님을 맞이할 때마다 품격이 느껴진다.' },
];
