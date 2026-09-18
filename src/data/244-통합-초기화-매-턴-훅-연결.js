// 통합 초기화 & 매 턴 훅 연결 — data
// Pure data split out of core/244-통합-초기화-매-턴-훅-연결.js (see generate.js).

export const NPC_PERSONALITY_POOL = [
  // 성격, 말버릇 힌트
  { trait:'냉소적',    speech:'짧고 비꼬는 말투',      value:'negative' },
  { trait:'열정적',    speech:'감탄사가 많고 흥분됨',  value:'positive' },
  { trait:'신중한',    speech:'말을 아끼고 천천히 함', value:'neutral'  },
  { trait:'수다스러운',speech:'끊임없이 말을 이어감',  value:'positive' },
  { trait:'오만한',    speech:'아랫사람 대하듯 말함',  value:'negative' },
  { trait:'겁쟁이',    speech:'말 끝을 흐리고 눈치봄', value:'neutral'  },
  { trait:'의리파',    speech:'직설적이고 솔직함',     value:'positive' },
  { trait:'음흉한',    speech:'돌려 말하고 속을 숨김', value:'negative' },
  { trait:'낙천적',    speech:'항상 밝고 긍정적',      value:'positive' },
  { trait:'분노형',    speech:'쉽게 흥분하고 목소리 높임', value:'negative' },
  { trait:'학자풍',    speech:'논리적이고 설명이 길음',value:'neutral'  },
  { trait:'겸손한',    speech:'자신을 낮추고 경어 사용',value:'positive'},
  { trait:'변덕스러운',speech:'감정 기복이 심하고 예측 불가', value:'neutral'},
  { trait:'과묵한',    speech:'핵심만 짧게 말함',      value:'neutral'  },
  { trait:'교활한',    speech:'달콤하게 말하지만 속셈이 있음', value:'negative'},
  { trait:'정직한',    speech:'불편해도 사실만 말함',  value:'positive' },
  { trait:'두려움 없는',speech:'대담하고 거침없음',    value:'positive' },
  { trait:'트라우마 있는',speech:'특정 주제에서 굳어버림', value:'neutral'},
  { trait:'야망가',    speech:'언제나 더 큰 것을 향함',value:'negative' },
  { trait:'허무주의적',speech:'아무것도 의미없다는 듯 말함', value:'negative'},
];

export const NPC_RACE_POOL_INLINE = [
  '인간','엘프','드워프','오크','하프엘프','수인족','악마족','불사자','요정족','용인족','천인족','고블린','트롤','거인족',
];

export const NPC_RANK_POOL_INLINE = [
  // {name, icon, faction_hint}
  { name:'평민',        icon:'👤', faction:'없음 (자유민)' },
  { name:'상인',        icon:'💰', faction:'상인 길드 or 독립' },
  { name:'용병',        icon:'⚔️', faction:'용병 길드 or 고용주' },
  { name:'기사',        icon:'🛡️', faction:'왕국 기사단 or 영주 직속' },
  { name:'귀족',        icon:'🏰', faction:'귀족 가문 (가문명 있음)' },
  { name:'도적',        icon:'🗡️', faction:'도적단 or 무소속' },
  { name:'성직자',      icon:'⛪', faction:'신전 (신앙 있음)' },
  { name:'마법사',      icon:'🔮', faction:'마탑 or 무소속' },
  { name:'노예',        icon:'⛓️', faction:'소유주 존재' },
  { name:'왕족',        icon:'👑', faction:'왕가 직계' },
  { name:'군인',        icon:'🪖', faction:'왕국군 or 영주군' },
  { name:'첩보원',      icon:'🕵️', faction:'비밀 조직 or 왕국 정보부' },
  { name:'음유시인',    icon:'🎵', faction:'음유시인 조합 or 독립' },
  { name:'농부',        icon:'🌾', faction:'마을 공동체' },
  { name:'해적',        icon:'🏴‍☠️', faction:'해적단' },
  { name:'암살자',      icon:'🌑', faction:'암살자 길드 or 의뢰인' },
  { name:'수도승',      icon:'🧘', faction:'수도원 or 유랑 수행자' },
  { name:'탐정',        icon:'🔍', faction:'왕국 수사대 or 독립' },
  { name:'의사',        icon:'💊', faction:'의사 길드 or 독립' },
  { name:'광부',        icon:'⛏️', faction:'광산 조합 or 영주 소속' },
];

export const NPC_FACTION_SUFFIX = [
  '제국','왕국','공국','연합','동맹','길드','단','파','회','조합','교단',
];

export const NPC_FACTION_ADJ = [
  '붉은','검은','은빛','황금','어둠','빛의','강철','불꽃','폭풍','고대',
  '비밀','잊혀진','저주받은','신성','야만','철혈','새벽','황혼','태양','달의',
];

export const NPC_FACTION_NOUN = [
  '검','방패','독수리','늑대','용','사자','까마귀','뱀','불사조','거미',
  '번개','안개','별','달','태양','돌','나무','바다','산','강',
];
