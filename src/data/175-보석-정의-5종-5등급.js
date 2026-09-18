// 보석 정의 (5종 × 5등급) — data
// Pure data split out of items/175-보석-정의-5종-5등급.js (see generate.js).

export const GEM_TYPES = {
  ruby:     { name:'루비',     icon:'💎', color:'#e04040', baseEffect:'ATK +{v}',   vals:{D:5,C:10,B:18,A:28,S:40} },
  sapphire: { name:'사파이어', icon:'💙', color:'#4060e0', baseEffect:'DEF +{v}',   vals:{D:4,C:8, B:15,A:24,S:35} },
  emerald:  { name:'에메랄드', icon:'💚', color:'#40a040', baseEffect:'HP +{v}',    vals:{D:20,C:40,B:70,A:110,S:160} },
  amethyst: { name:'자수정',   icon:'💜', color:'#8040c0', baseEffect:'소환수 ATK +{v}%', vals:{D:5,C:10,B:18,A:28,S:40} },
  topaz:    { name:'토파즈',   icon:'💛', color:'#c0a000', baseEffect:'경험치 +{v}%',    vals:{D:5,C:10,B:18,A:28,S:40} },
  diamond:  { name:'다이아몬드',icon:'🔷', color:'#a0d0f0', baseEffect:'전스탯 +{v}',     vals:{D:2,C:4, B:7, A:12,S:18} },
  obsidian: { name:'흑요석',   icon:'⬛', color:'#303030', baseEffect:'상태이상 저항 +{v}%', vals:{D:8,C:15,B:25,A:38,S:55} },
  moonstone:{ name:'문스톤',   icon:'🌙', color:'#c0c0e0', baseEffect:'루프 경험 +{v}%',   vals:{D:3,C:6, B:10,A:16,S:25}, special:true },
};

export const GEM_GRADES = ['D','C','B','A','S'];

export const GEM_GRADE_COLOR = { D:'#8a8a6a', C:'#60a060', B:'#4060c0', A:'#c06060', S:'#e0c040' };

export const GEM_UPGRADE_COST = { D:100, C:300, B:800, A:2000, S:0 };

export const SOCKET_CONFIG = {
  weapon:    { runeSlots:2, gemSlots:2 },
  armor:     { runeSlots:2, gemSlots:2 },
  helmet:    { runeSlots:1, gemSlots:2 },
  gloves:    { runeSlots:1, gemSlots:1 },
  boots:     { runeSlots:1, gemSlots:1 },
  ring:      { runeSlots:0, gemSlots:2 },
  necklace:  { runeSlots:1, gemSlots:1 },
  accessory: { runeSlots:1, gemSlots:2 },
  offhand:   { runeSlots:1, gemSlots:1 },
};
