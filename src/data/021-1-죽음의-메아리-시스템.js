// 💀 1. 죽음의 메아리 시스템 — data
// Pure data split out of misc/021-1-죽음의-메아리-시스템.js (see generate.js).

export const ECHO_MILESTONES = [
  { stacks: 3,  name: '첫 메아리',       icon: '👻', bonus: { mgc: 5, fear: 5 },         skillId: 'dk_echo_whisper',  skillName: '죽음의 속삭임',  skillIcon: '💬', skillDesc: '처치한 적의 목소리를 내어 산 자를 공황 상태로. 대상 FEAR +25, WIL -15.' },
  { stacks: 8,  name: '메아리 군집',      icon: '🌀', bonus: { mgc: 10, fear: 10, per: 8 }, skillId: 'dk_echo_mirage',   skillName: '기억 환영',      skillIcon: '👁️', skillDesc: '흡수한 적의 기억으로 완벽한 변장. 적 중 한 명의 모습으로 3턴 변신. DISG 판정 무조건 성공.' },
  { stacks: 15, name: '메아리의 군주',    icon: '💀', bonus: { mgc: 18, fear: 20, str: 12, per: 15 }, skillId: 'dk_echo_drain',    skillName: '영혼 흡수',      skillIcon: '⚫', skillDesc: 'MP 35. 살아있는 대상의 생명력을 직접 흡수. HP -30(대상), HP +30(자신). 죽을 경우 메아리 +3.' },
  { stacks: 25, name: '영원한 기억의 벽', icon: '∞',  bonus: { mgc: 30, fear: 35, str: 20, per: 25, mad: 15 }, skillId: 'dk_echo_legion',   skillName: '메아리 군단',    skillIcon: '💀', skillDesc: '흡수한 모든 기억을 전장에 해방. 전투 중 그림자 전사 2체 소환. 각 전사는 처치된 적의 능력을 사용.' },
];

export const ECHO_ABILITY_POOL = [
  { id: 'ea_str',   name: '근력의 메아리',   stat: 'str',  gain: 8,  icon: '💪' },
  { id: 'ea_agi',   name: '민첩의 메아리',   stat: 'agi',  gain: 8,  icon: '💨' },
  { id: 'ea_mgc',   name: '마력의 메아리',   stat: 'mgc',  gain: 10, icon: '✨' },
  { id: 'ea_per',   name: '감지의 메아리',   stat: 'per',  gain: 7,  icon: '👁️' },
  { id: 'ea_crse',  name: '저주의 메아리',   stat: 'crse', gain: 12, icon: '🖤' },
  { id: 'ea_fear',  name: '공포의 메아리',   stat: 'fear', gain: 10, icon: '😱' },
  { id: 'ea_int',   name: '지식의 메아리',   stat: 'int',  gain: 7,  icon: '📚' },
  { id: 'ea_wil',   name: '의지의 메아리',   stat: 'wil',  gain: 6,  icon: '🔥' },
];
