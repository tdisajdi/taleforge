// 3. 신의 응답 / 저주 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { DIVINE_RESPONSES } from '../data/103-3-신의-응답-저주-시스템.js';
import { gainExp } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';
import { getFaithTier } from './101-1-신앙fath-종교-시스템-실제-연동.js';

export const RELIGION_BLESS_KEY = 'tf-religion-bless';

export function loadReligionBlessLog(){ try{ return JSON.parse(lsGet(RELIGION_BLESS_KEY)||'[]'); }catch(e){ return []; } }
window.loadReligionBlessLog = loadReligionBlessLog;

export function saveReligionBlessLog(d){ lsSet(RELIGION_BLESS_KEY, JSON.stringify((d||[]).slice(-50))); }
window.saveReligionBlessLog = saveReligionBlessLog;

export function checkDivineResponse(trigger){
  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  if(!rel) return;
  const fath = S.stats?.fath||50;
  const tier = getFaithTier();
  const responses = DIVINE_RESPONSES[rel]||[];

  responses.forEach(r=>{
    if(r.trigger !== trigger) return;
    if(r.type==='blessing'){
      if(fath < r.minFaith) return;
      if(Math.random() > (tier.miracleChance||0.15)) return;
    } else {
      if(Math.random() > 0.4) return;
    }
    // 효과 적용
    Object.entries(r.effect||{}).forEach(([k,v])=>{
      if(S.stats&&S.stats[k]!==undefined) S.stats[k] = Math.max(0, Math.min(999,(S.stats[k]||0)+v));
      else if(k==='exp' && typeof gainExp==='function') gainExp(v);
    });
    toast(r.msg, 3500);
    // 기록
    const log = loadReligionBlessLog();
    log.push({ rel, type:r.type, trigger, msg:r.msg, turn:S.msgCount||0 });
    saveReligionBlessLog(log);
    if(typeof addTimelineEvent==='function')
      addTimelineEvent('event', r.msg.slice(0,40), {icon:r.icon});
    // AI 서사 주입
    S._nextInjectedContext = (S._nextInjectedContext||'')
      +'\n['+r.icon+' 신성 반응] '+r.msg+' 이 신성한 개입을 극적으로 서사화하라.';
  });
}
window.checkDivineResponse = checkDivineResponse;

window.checkDivineResponse = checkDivineResponse;

export function tickDivineCheck(cleanText, rollInfo){
  if(!cleanText) return;
  // 크리티컬 성공
  if(rollInfo?.crit) checkDivineResponse('crit_success');
  // 임박 사망
  if((S.stats?.hp||100) <= 15) checkDivineResponse('near_death');
  // 자연 방문
  if(/숲|자연|강|산|대지|나무|초원/.test(cleanText)) checkDivineResponse('visit_nature');
  // 언데드 처치
  if(/언데드|해골|좀비|유령.*처치|정화/.test(cleanText)) checkDivineResponse('kill_undead');
  // 계약/협상
  if(/계약.*맺|거래.*성사|협상.*성공/.test(cleanText)) checkDivineResponse('make_deal');
  // 배신
  if(/배신|뒤통수|암살.*동료|동료.*죽/.test(cleanText)) checkDivineResponse('betray_npc');
  // 자연 파괴
  if(/불태우|나무.*베|숲.*파괴|대지.*오염/.test(cleanText)) checkDivineResponse('destroy_nature');
  // 어둠 마법
  if(/어둠.*마법|죽음.*마법|금기.*주문/.test(cleanText)) checkDivineResponse('use_dark_magic');
}
window.tickDivineCheck = tickDivineCheck;

window.tickDivineCheck = tickDivineCheck;
