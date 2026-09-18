// NG+ 회차 계승 시스템 — data
// Pure data split out of progression/156-NG-회차-계승-시스템.js (see generate.js).

export const LEGACY_RULES = {
  carry_over: {
    titles:       { label:'획득한 칭호', desc:'전 회차에서 얻은 칭호들이 유지됩니다' },
    summon_bonds: { label:'소환수 유대', desc:'유대도 50 이상인 소환수의 기억이 다음 회차에 잠재 기억으로 남습니다' },
    scars:        { label:'전생 흉터',   desc:'중요한 부상·트라우마가 흉터로 남아 특수 반응을 유발합니다' },
    world_memory: { label:'세계 기억',   desc:'루프 자각 상태 유지. 아르카누스가 처음부터 플레이어를 알아봅니다' },
    ending_bonus: { label:'엔딩 보상',   desc:'달성한 엔딩에 따라 특별 시작 보너스를 받습니다' },
    loop_count:   { label:'회차 수',     desc:'누적 회차 수에 따라 감시자의 태도가 달라집니다' },
  },
  reset: {
    stats:     '스탯 초기화 (종족 기본값으로)',
    gold:      '골드 초기화',
    inventory: '아이템 초기화 (계승 아이템 제외)',
    relations: '파벌·NPC 관계 초기화',
    quests:    '퀘스트 초기화',
    location:  '위치 초기화',
  },
};
