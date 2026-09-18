// 도전 과제 달성률 시스템 — data
// Pure data split out of misc/164-도전-과제-달성률-시스템.js (see generate.js).

export const CHALLENGE_DEFS = [
  // 탐험
  { id:'visit_all_continents', cat:'탐험', icon:'🗺️', name:'세계 탐험가', desc:'8개 대륙 모두 방문', target:8, trackKey:'continents_visited' },
  { id:'dungeon_100', cat:'탐험', icon:'🏚️', name:'던전 마스터', desc:'던전 완전 탐험 (탐험도 100%)', target:1, trackKey:'dungeons_completed' },
  { id:'secret_rooms', cat:'탐험', icon:'🚪', name:'비밀 탐정', desc:'비밀 방 5개 발견', target:5, trackKey:'secret_rooms_found' },

  // 전투
  { id:'boss_all', cat:'전투', icon:'💀', name:'보스 사냥꾼', desc:'보스 몬스터 10마리 처치', target:10, trackKey:'bosses_defeated' },
  { id:'no_damage', cat:'전투', icon:'🛡️', name:'무상처 전사', desc:'피해 없이 전투 승리 5회', target:5, trackKey:'no_damage_wins' },
  { id:'flee_success', cat:'전투', icon:'🏃', name:'생존 전문가', desc:'전투 도망 성공 3회', target:3, trackKey:'flee_successes' },

  // 소환수
  { id:'summon_max_evo', cat:'소환수', icon:'🔮', name:'소환 군주', desc:'소환수를 6차 진화까지 성장', target:1, trackKey:'max_evo_summons' },
  { id:'summon_all_cats', cat:'소환수', icon:'🌈', name:'소환 수집가', desc:'5개 이상 다른 계열 소환수 보유', target:5, trackKey:'summon_categories' },

  // 스토리
  { id:'seal_restore_all', cat:'스토리', icon:'🌟', name:'봉인의 수호자', desc:'봉인석 11개 전부 복원', target:11, trackKey:'seals_restored' },
  { id:'loop_10', cat:'스토리', icon:'🔄', name:'루프 베테랑', desc:'10회차 이상 달성', target:10, trackKey:'loop_count' },
  { id:'true_ending', cat:'스토리', icon:'👑', name:'진 엔딩 달성자', desc:'진 엔딩 달성', target:1, trackKey:'true_ending_count' },
  { id:'all_npc_trust', cat:'스토리', icon:'🤝', name:'모두의 친구', desc:'주요 NPC 8명 신뢰도 70 이상', target:8, trackKey:'trusted_npcs' },

  // 경제
  { id:'gold_100k', cat:'경제', icon:'💰', name:'대상인', desc:'골드 100,000 이상 보유', target:100000, trackKey:'max_gold' },
  { id:'set_complete', cat:'경제', icon:'🔰', name:'세트 수집가', desc:'세트 아이템 1종 완성', target:1, trackKey:'sets_completed' },

  // 도덕
  { id:'pure_good', cat:'도덕', icon:'😇', name:'성인', desc:'도덕 성향 +90 이상 유지', target:90, trackKey:'max_moral' },
  { id:'pure_evil', cat:'도덕', icon:'😈', name:'악의 화신', desc:'도덕 성향 -90 이하', target:-90, trackKey:'min_moral' },
];

export const CALENDAR_FIXED_EVENTS = [
  { season:'봄', day:1,   name:'새해 축제',     effect:'모든 NPC 호감도 +5, 상점 할인 20%', tags:['festival'] },
  { season:'봄', day:15,  name:'봉인 기념일',   effect:'봉인석 에너지 강화. 복원 성공률 +30%', tags:['seal','world'] },
  { season:'여름', day:21,  name:'하지 태양 의식',effect:'태양 성전 신자 수 급증. 태양 속성 +50%', tags:['religion','solar'] },
  { season:'가을', day:7,   name:'영혼의 날',     effect:'언데드 소환수 능력 2배. 사령 마법 강화', tags:['undead','religion'] },
  { season:'겨울', day:22, name:'동지 봉인 기념일', effect:'순환의 사원 의식. 루프 자각자들이 모인다', tags:['seal','loop','temple'] },
  { season:'여름', day:1,   name:'드래곤 각성제', effect:'용염 제국 3년마다 용이 하늘을 난다', tags:['dragon','east'] },
  { season:'가을', day:31, name:'심연의 밤',     effect:'심연 결사가 활동을 강화한다. 악마 소환 보너스', tags:['abyss','demon'] },
];
