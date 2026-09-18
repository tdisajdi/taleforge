// 4. 자동 각성 감지 — 매 턴 AI 응답 텍스트 분석
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { BLOODLINE_MASTER } from '../data/124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';
import { recordRaceForMutation } from '../progression/019-71100번-환생-누적-시스템.js';
import { saveRace } from '../race/013-종족-시스템.js';
import { loadBL, saveBL } from '../summon/124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';
import { toast } from '../utils.js';

export function tickBloodlineAwaken(cleanText, rollInfo){
  const bl = loadBL();
  if(!bl?.type) return;
  if(bl.awakened) return; // 이미 각성

  const def = BLOODLINE_MASTER[bl.type];
  if(!def) return;

  const patterns = def.awakePatterns||[];
  const hp = S.stats?.hp||100;
  const maxHp = S.stats?.maxHp||100;
  const hpPct = hp/maxHp*100;

  // 각성 조건 체크
  let triggered = false;

  // 텍스트 패턴 감지
  if(cleanText){
    triggered = patterns.some(p=>p.test(cleanText));
  }

  // HP 20% 이하 (dragon, void, cursed)
  if(!triggered && ['dragon','void','cursed'].includes(bl.type) && hpPct <= 20){
    triggered = true;
  }

  // 크리티컬 성공 (royal, celestial)
  if(!triggered && ['royal','celestial'].includes(bl.type) && rollInfo?.crit){
    triggered = Math.random() < 0.4; // 40% 확률
  }

  // 신앙 높음 (celestial)
  if(!triggered && bl.type==='celestial' && (S.stats?.fath||0)>=80){
    triggered = Math.random() < 0.1;
  }

  if(!triggered) return;

  // 각성 발동
  awakenBloodlineAuto();
}
window.tickBloodlineAwaken = tickBloodlineAwaken;

window.tickBloodlineAwaken = tickBloodlineAwaken;

export function awakenBloodlineAuto(){
  const bl = loadBL();
  if(!bl||bl.awakened) return;

  const def = BLOODLINE_MASTER[bl.type];
  if(!def) return;

  bl.awakened    = true;
  bl.awakeCount  = (bl.awakeCount||0)+1;
  bl.awakenedAt  = S.msgCount||0;
  bl.activeUntil = (S.msgCount||0)+5; // 5턴 유지
  saveBL(bl);
  if(typeof saveRace==='function' && bl.type) saveRace(bl.type);
  if(typeof recordRaceForMutation==='function' && S.character?.race){
    const _raceKeyMap = {'인간':'human','엘프':'elf','드워프':'dwarf','드래곤':'dragon','악마':'demon','수인':'beastkin'};
    const _raceKey = Object.entries(_raceKeyMap).find(([kr])=>S.character.race.includes(kr))?.[1];
    if(_raceKey) recordRaceForMutation(_raceKey);
  }

  // 각성 스탯 적용
  if(S.stats){
    Object.entries(def.awakeStats||{}).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,(S.stats[k]||0)+Math.floor(v*0.5));
      // 각성은 절반만 영구 적용, 나머지는 일시적
    });
  }

  // 타임라인 기록
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('event',`${def.icon} ${def.name} 각성!`,{icon:def.icon});

  // AI 서사 주입
  S._nextInjectedContext = (S._nextInjectedContext||'')
    +`\n[🩸 혈통 각성 발동!] ${def.name}이(가) 각성했다!`
    +`\n각성 능력: ${def.skill} — ${def.skillDesc}`
    +`\n이 순간을 극적으로 서사화하라. 신체 변화, 주변 반응, 능력 발동 장면을 묘사하라.`
    +`\nGS: {"bloodline_awaken":"${bl.type}"} 출력.`;

  toast(`${def.name} 각성! ${def.skill} 발동!`, 4000, def);
  console.log(`[Bloodline] 각성: ${def.name}`);
  // [13차 감사 FIX] misc/298이 각성 연출(animBloodlineAwaken)을 걸려고
  // window.awakenBloodline을 감싸려 했는데, 실제 함수명은 처음부터
  // awakenBloodlineAuto였다 — 존재한 적 없는 이름을 감싼 죽은 코드라
  // 각성 애니메이션이 한 번도 재생된 적이 없었다. 실제 각성 처리부인
  // 여기서 직접 호출한다.
  if(typeof window.animBloodlineAwaken==='function') window.animBloodlineAwaken();
}
window.awakenBloodlineAuto = awakenBloodlineAuto;

window.awakenBloodlineAuto = awakenBloodlineAuto;

export function tickBloodlineCooldown(){
  const bl = loadBL();
  if(!bl||!bl.awakened) return;
  if(!bl.activeUntil) return;
  if((S.msgCount||0) >= bl.activeUntil + 20){ // 20턴 후 재각성 가능
    bl.awakened = false; // 재각성 가능 상태로 리셋
    saveBL(bl);
    toastHTML(`${esc(BLOODLINE_MASTER[bl.type]?.icon||'🩸')} 혈통 각성 재충전 완료`, 2000);
  }
}
window.tickBloodlineCooldown = tickBloodlineCooldown;
