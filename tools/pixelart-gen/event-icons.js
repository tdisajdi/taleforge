// NPC 소문/월드뉴스 게시판에서 반복적으로 쓰이는 "사건 종류" 이모지 →
// 대표 도트 배지 매핑. generate.js가 이 목록을 읽어서 이미지를 만들고
// manifest.byName[emoji]에 등록한다 (자세한 이유는 generate.js 참고).
const EVENT_EMOJI_ICONS = [
  { emoji: '💕', id: 'evt-romance',  rarity: 'rare' },
  { emoji: '💍', id: 'evt-marriage', rarity: 'legendary' },
  { emoji: '💢', id: 'evt-feud',     rarity: 'uncommon' },
  { emoji: '💀', id: 'evt-death',    rarity: 'mythic' },
  { emoji: '⚡', id: 'evt-clash',    rarity: 'rare' },
  { emoji: '🌿', id: 'evt-trade',    rarity: 'uncommon' },
  { emoji: '💌', id: 'evt-letter',   rarity: 'common' },
  { emoji: '🔥', id: 'evt-fire',     rarity: 'rare' },
  { emoji: '🕊️', id: 'evt-peace',    rarity: 'uncommon' },
  { emoji: '🤝', id: 'evt-alliance', rarity: 'uncommon' },
  { emoji: '⚔️', id: 'evt-war',      rarity: 'mythic' },
  { emoji: '💥', id: 'evt-conflict', rarity: 'rare' },
  { emoji: '📜', id: 'evt-decree',   rarity: 'common' },
  { emoji: '📰', id: 'evt-news',     rarity: 'common' },
];

module.exports = { EVENT_EMOJI_ICONS };
