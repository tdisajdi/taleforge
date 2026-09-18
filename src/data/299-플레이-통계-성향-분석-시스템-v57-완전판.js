// 📊 플레이 통계 + 성향 분석 시스템 (v57 완전판) — data
// Pure data split out of patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js (see generate.js).

export const STAT_ACHIEVEMENTS = [
  { key:'phoenix',     label:'🔥 불사조',      cond: d=> (d.deathCount||0)>=10,        reward:'사망 10회 달성 — 죽음을 두려워하지 않는 자',  titleObj:{id:'stat_phoenix',    name:'불사조',       icon:'🔥',color:'#e05050'} },
  { key:'warlord',    label:'⚔️ 전쟁의 신',   cond: d=> (d.battleWins||0)>=100,       reward:'전투 100승 달성',                             titleObj:{id:'stat_warlord',    name:'전쟁의 신',    icon:'⚔️',color:'#e08040'} },
  { key:'luckyStar',  label:'⭐ 행운아',       cond: d=> (d.critSuccessCount||0)>=50,  reward:'크리티컬 성공 50회 달성',                     titleObj:{id:'stat_lucky',      name:'행운아',       icon:'⭐',color:'#e0d040'} },
  { key:'comboist',   label:'💥 콤보마스터',   cond: d=> (d.maxCombo||0)>=20,          reward:'최대 콤보 20 달성',                           titleObj:{id:'stat_combo',      name:'콤보마스터',   icon:'💥',color:'#e06040'} },
  { key:'richman',    label:'💰 황금손',       cond: d=> (d.totalGoldEarned||0)>=50000,reward:'누적 골드 50000G 달성',                       titleObj:{id:'stat_rich',       name:'황금손',       icon:'💰',color:'#c0a030'} },
  { key:'veteran',    label:'🔄 베테랑',       cond: d=> (d.reincarnationCount||0)>=5, reward:'환생 5회 달성',                               titleObj:{id:'stat_veteran',    name:'베테랑',       icon:'🔄',color:'#8060e0'} },
  { key:'storyteller',label:'📖 이야기꾼',     cond: d=> (d.totalTurns||0)>=1000,     reward:'총 1000턴 플레이',                            titleObj:{id:'stat_story',      name:'이야기꾼',     icon:'📖',color:'#60a0c0'} },
  { key:'ending3',    label:'🌌 운명의수집가', cond: d=> (d.endingCount||0)>=3,        reward:'3종 엔딩 달성',                               titleObj:{id:'stat_ending',     name:'운명의 수집가',icon:'🌌',color:'#a060e0'} },
];
