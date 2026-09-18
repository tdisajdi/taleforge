// [v49 ⑥] onclick 연결됐지만 정의 없던 함수들 — data
// Pure data split out of patches/183-v49-⑥-onclick-연결됐지만-정의-없던-함수들.js (see generate.js).

export const SAVE_DATA_ONLY_KEYS = [
  // doReincarnate에서 매 환생마다 지우는 "이번 생의 진행 상태" 키 전체
  'tf-main-quests','tf-choice-history','tf-world-state','tf-world-reactions',
  'tf-factions','tf-npc-network','tf-materials','tf-diary','tf-timeline-v2',
  'tf-academy','tf-battle-log-v2','tf-exploration','tf-world-events',
  'tf-boss-state','tf-party','tf-job-turns','tf-npc-quest-state',
  'tf-current-location','tf-owned-relics','tf-skill-combos','tf-locations',
  'tf-npc-memory','tf-evolution','tf-reputation','tf-epic-quest-state',
  'taleforge-hidden-quests','tf-quest-choices','tf-timecost','tf-boss-hp',
  'tf-boss-hp-cache','tf-fired-events','taleforge-quest-history',
  'tf-npc-dlg-quests','tf-food-water','tf-black-market','tf-world-timer',
  'tf-faction-pursuit','tf-wdr-npcs','tf-wdr-axis','tf-wdr-plaus',
  'tf-demesne','tf-demesne-v5','tf-rival-domains','tf-thrall-system',
  'tf-vampire-chronicle','tf-prisoners','tf-world-settlements',
  'tf-demesne-notified','tf-ai-bulletin','tf-shop-stock-cache',
  'tf-job-auto-notified','tf-traumas','tf-mental-corruption','tf-job-history',
  'tf-social-rank-log','tf-faction-sim','tf-combat-state','tf-quest-history',
  'tf-seal-restore','tf-seal-visit-track','tf-skill-xp','tf-status-effects','tf-catastrophe-fired','tf-catastrophe-active',
  // 세션/캐릭터 직결 키 (doReincarnate 밖에서 별도 관리되지만 "세이브"의 핵심)
  'tf-session','tf-char','tf-stats','tf-chat','tf-meta','tf-scenario',
  'tf-chat-messages','tf-chat-full','tf-chat-turn','tf-chat-choices',
  'tf-meta-emotion','tf-meta-fatigue','tf-meta-combat','tf-meta-status',
  'tf-gold','tf-inventory','tf-equipped','tf-skills','tf-npcs',
  'taleforge-emotion','tf-monsters',
  // 플레이어에게 직접 영향을 주는 진행 요소 (업적/히든직업/유물 등)
  'tf-achievements','taleforge-achievement-rate','taleforge-hidden-jobs',
  'tf-owned-relics','tf-skill-combos','tf-job-mastery','tf-skill-xp',
  'taleforge-worldtree',
  // [버그 수정] 위 'tf-X' 항목 중 일부는 실제 저장 키가 'taleforge-X'였다
  // (예: 골드/인벤토리/스킬/NPC/트라우마/정신오염/세션 — 본문 처리 로직의
  // 키 불일치 버그를 수정하며 같이 발견됨). 잘못된 키는 과거 세이브 잔재
  // 정리용으로 남겨두고, 실제 키를 추가해야 "초기화" 버튼이 진짜로 동작한다.
  'taleforge-mental-corruption','taleforge-trauma','taleforge-session',
  'taleforge-gold','taleforge-inventory','taleforge-equipped','taleforge-skills',
  'taleforge-npcs',
  // NPC는 분리 저장 구조라 saveNPCs가 실제로 쓰는 키는 이 3개다
  // (taleforge-npcs는 하위호환용 통합 백업일 뿐 — 위에서 이미 포함).
  'tf-npc-base','tf-npc-relations','tf-npc-growth-ext',
];

export const CYCLE_RESET_EXTRA_KEYS = [
  'taleforge-cyclecount', // CYCLE_COUNT_KEY 실제 값
  'taleforge-perm-stat-bonus', // 영구 스탯 보너스 (환생 보상 누적분)
  'taleforge-famelegacy', // 전생 명성
  'taleforge-past-language', // 전생 언어
  'tf-past-prophecy', // 예언 이월
  'tf-bard-legend', // 음유시인 기록 (전생 이야기 노래)
];
