// 1. 신규 종교 2개 추가
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { RELIGION_ROLL_BONUS } from '../data/102-2-종교-축복저주-판정-보너스.js';
import { DIVINE_RESPONSES } from '../data/103-3-신의-응답-저주-시스템.js';
import { SHRINE_DEFS } from '../data/109-9-성지-시스템.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { loadAchievements } from '../progression/187-2-업적-시스템.js';
import { toast } from '../utils.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_95(){
Object.assign(RELIGIONS, {
  // 5번째 종교: 시간의 현현 (루프 자각자 비밀 종파)
  loop_faith: {
    id:'loop_faith',
    name:'시간의 현현',
    icon:'♾️',
    color:'#6090e0',
    doctrine:'시간은 수레바퀴다. 반복 속에서 완전해지는 자만이 진정한 신격에 오른다',
    greeting:'이전 생을 기억하는가',
    factionAllies:['루프 감시자','이단 심문소(표면상)'],
    factionRivals:['순환의 사원','태양의 성전'],
    evangelMethods:['루프 기억 공유','예언 제시','데자뷔 유도','과거 폭로'],
    jobTree:['wanderer','loop_sage','time_seer','loop_master'],
    secret:'이 종파의 고위층은 완전한 루프 자각자. 루프 탈출보다 "완전한 순환" 자체가 목적인 자들도 있다.',
    weaknesses:'소수 비밀 결사. 공개 활동 불가. 순환의 사원에게 이단으로 박해받음.',
    npcReaction:'루프 자각 징후 있는 자에게만 접근. 일반 NPC에겐 정체 숨김.',
    hiddenInMap:true,
    unlockCondition:'cycle >= 3 또는 loop_aware 업적 달성',
  },

  // 6번째 종교: 허무의 침묵 (무신론 철학 종파)
  void_silence: {
    id:'void_silence',
    name:'허무의 침묵',
    icon:'🌑',
    color:'#808090',
    doctrine:'신은 없다. 있다 해도 무관하다. 오직 자신의 의지와 이성만이 진실이다',
    greeting:'(침묵)',
    factionAllies:['마법사 협회','자유 상인 연합'],
    factionRivals:['모든 종교 세력'],
    evangelMethods:['논리적 반박','철학 토론','신기적 부정','의심 씨앗'],
    jobTree:['scholar','philosopher','null_mage','void_walker'],
    secret:'허무의 침묵 내부에 "신은 없지만 신이 될 수 있다"고 믿는 과격파 존재.',
    weaknesses:'어떤 신성 마법도 거부해 자체 치유 불가. 위기 시 종교적 위안 없음.',
    npcReaction:'지식인·자유 사상가에게 호감. 신앙심 강한 NPC에게 강한 반감.',
    unlockCondition:'int >= 80 또는 faith_refuse_count >= 10 달성 시',
  },
});

Object.assign(RELIGION_ROLL_BONUS, {
  loop_faith:   { bonusStat:'per', bonus:8,  penaltyStat:'fath', penalty:-3, desc:'시간의 현현: 지각+8, 루프 기억으로 미래 감지' },
  void_silence: { bonusStat:'int', bonus:8,  penaltyStat:'mgc',  penalty:-5, desc:'허무의 침묵: INT+8, 신성마법 사용불가' },
});

Object.assign(DIVINE_RESPONSES, {
  loop_faith: [
    { type:'blessing', minFaith:60, trigger:'crit_success',   effect:{per:5, luk:5},   msg:'♾️ 시간의 현현이 응답했다. 이 순간을 기억하라. 지각+5 행운+5', icon:'♾️' },
    { type:'blessing', minFaith:75, trigger:'near_death',     effect:{wil:10, hp:25},  msg:'♾️ 이전 생의 기억이 당신을 살렸다. 의지+10 HP+25', icon:'⏳' },
    { type:'curse',    minFaith:0,  trigger:'destroy_nature', effect:{per:-8},         msg:'♾️ 시간의 현현이 경고한다. 반복을 망치지 마라.', icon:'⚠️' },
  ],
  void_silence: [
    { type:'blessing', minFaith:50, trigger:'crit_success',   effect:{int:5, str:3},   msg:'🌑 오직 의지로 이루었다. INT+5 STR+3', icon:'🌑' },
    { type:'blessing', minFaith:70, trigger:'quest_done',     effect:{int:8, per:5},   msg:'🌑 신 없이 성취했다. INT+8 지각+5', icon:'🧠' },
  ],
});

Object.assign(SHRINE_DEFS, {
  loop_faith:   { name:'루프의 제단', icon:'♾️', effect:{per:4,luk:4},      blessing:'매 10턴 루프 기억 단편 획득', evangelBonus:10 },
  void_silence: { name:'침묵의 서당', icon:'📚', effect:{int:5,mgc:-3},     blessing:'INT 판정 항상 +8, 신성마법 봉쇄', evangelBonus:6 },
});

const _origSetRel3 = window.setPlayerReligion;

window.setPlayerReligion = function(religionId){
  if(religionId==='loop_faith'){
    const cycle = typeof loadCycleCount==='function'?loadCycleCount():0;
    const ach = loadAchievements()||{};
    if(cycle < 3 && !ach['loop_aware'] && !ach['awakened']){
      toast('♾️ 시간의 현현은 루프를 경험한 자에게만 열린다.', 3000); return;
    }
  }
  if(religionId==='void_silence'){
    if((S.stats?.int||10) < 60 && (S.character?.faithRefuseCount||0) < 5){
      toast('🌑 허무의 침묵은 강한 이성과 회의론자에게만 열린다.', 3000); return;
    }
  }
  _origSetRel3(religionId);
};
}

