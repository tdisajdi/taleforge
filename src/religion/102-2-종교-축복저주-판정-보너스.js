// 2. 종교 축복/저주 판정 보너스
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGION_ROLL_BONUS } from '../data/102-2-종교-축복저주-판정-보너스.js';
import { toast } from '../utils.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';
import { getFaithTier } from './101-1-신앙fath-종교-시스템-실제-연동.js';

export function getReligionRollBonus(){
  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  if(!rel) return null;
  const tier = getFaithTier();
  const base = RELIGION_ROLL_BONUS[rel];
  if(!base) return null;
  // 신격자면 보너스 2배
  const mult = tier.label==='신격자'?2:tier.label==='성자'?1.5:1;
  return {
    ...base,
    bonus:   Math.round(base.bonus * mult),
    penalty: Math.round(base.penalty * mult),
    tier:    tier.label,
  };
}
window.getReligionRollBonus = getReligionRollBonus;

window.getReligionRollBonus = getReligionRollBonus;

// [버그 수정] 이 자리에 있던 hookReligionIntoRoll도 같은 원인
// (window.rollWarCheck 감싸기가 bare 호출에 절대 도달 못 함)으로
// 죽어있었다. 같은 로직을 misc/068의 rollWarCheck() 함수 자체에
// 네이티브로 옮겼다.

export function tickAbyssCorruption(){
  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  if(rel!=='abyss') return;
  if((S.msgCount||0)%5!==0) return;
  if(S.stats){ S.stats.fath = Math.max(0, (S.stats.fath||50)-5); }
  if((S.stats?.fath||50) <= 10){
    toast('😈 심연의 타락이 깊어진다... 신앙이 거의 사라졌다.', 3000);
    if(typeof addTimelineEvent==='function')
      addTimelineEvent('event','심연 타락 임계점',{icon:'😈'});
  }
}
window.tickAbyssCorruption = tickAbyssCorruption;

window.tickAbyssCorruption = tickAbyssCorruption;
