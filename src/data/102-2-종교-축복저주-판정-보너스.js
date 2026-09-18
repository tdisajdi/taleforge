// 2. 종교 축복/저주 판정 보너스 — data
// Pure data split out of religion/102-2-종교-축복저주-판정-보너스.js (see generate.js).

export const RELIGION_ROLL_BONUS = {
  temple: { bonusStat:'wil', bonus:5,  penaltyStat:'fear', penalty:-3, desc:'순환의 축복: 의지 판정+5' },
  solar:  { bonusStat:'str', bonus:5,  penaltyStat:'disg', penalty:-5, desc:'태양의 율법: STR+5, 위장-5' },
  roots:  { bonusStat:'per', bonus:5,  penaltyStat:'int',  penalty:-3, desc:'자연의 감각: 지각+5' },
  abyss:  { bonusStat:'neg', bonus:8,  penaltyStat:'fath', penalty:-5, desc:'계약의 힘: 협상+8, 신앙-5/턴' },
};
