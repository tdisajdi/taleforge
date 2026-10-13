// 4. 동료 시스템 강화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { COMPANION_PERSONALITIES } from '../data/284-4-동료-시스템-강화.js';
import { applyPartyBonus, loadParty, saveParty } from '../misc/054-이동수단-시스템.js';
// [60-2번 섹션, 동반자 시스템 심화] 기존엔 동료의 "신뢰도"가 시간이
// 지나면 그냥 틱마다 +1씩 쌓이는 완전히 독립된 숫자였다 — 같은 NPC가
// npc/140의 NPC DB(trust/관계 점수, 전투·퀘스트 등 다수의 로컬 호출부가
// 이미 실제로 갱신 중)에 훨씬 풍부한 실제 관계 데이터를 갖고 있어도
// 서로 전혀 연결이 안 돼 있었다. 그 NPC DB 기록이 있으면 그걸 신뢰도의
// 진짜 출처로 쓰고(실제 스토리에서 쌓은 관계를 반영), 기록이 아직
// 없으면만 기존 틱 폴백을 쓴다.
import { loadNpcDB } from '../npc/140-①-NPC-DB-가장-세분화.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const COMPANION_DATA_KEY = 'tf-companion-ext';

export const COMP_PERSONALITY_KEY = 'tf-comp-personality';

export const COMP_GROWTH_KEY      = 'tf-comp-growth';

export function loadCompanionExt(){
  try{
    const per = lsGet(COMP_PERSONALITY_KEY); const grw = lsGet(COMP_GROWTH_KEY);
    if (per) {
      const pObj = JSON.parse(per); const gObj = grw ? JSON.parse(grw) : {};
      const merged = {};
      const allNames = new Set([...Object.keys(pObj), ...Object.keys(gObj)]);
      // [60-2번 섹션, 버그 수정] 이 병합이 growth/subQuestDone/trustLevel
      // 3개 필드만 하드코딩으로 복원해서, 그 뒤에 추가한 `bondRewardGiven`
      // 같은 새 필드는 저장은 되는데(아래 saveCompanionExt가 d를 그대로
      // 복사) 다음 로드 때 조용히 사라졌다(1회성 보상이 매번 다시
      // 지급될 뻔함 — Playwright 검증 중 실측으로 발견) — `...(gObj[n]||{})`
      // 로 저장된 필드를 전부 그대로 복원하도록 교정.
      allNames.forEach(n => { merged[n] = { growth:0, subQuestDone:false, trustLevel:0, bondRewardGiven:false, ...(gObj[n]||{}), personality: pObj[n]||'' }; });
      return merged;
    }
    return JSON.parse(lsGet(COMPANION_DATA_KEY)||'{}');
  }catch(e){ return {}; }
}
window.loadCompanionExt = loadCompanionExt;

export function saveCompanionExt(d){
  try{
    const per={}; const grw={};
    Object.keys(d).forEach(n => {
      per[n]=d[n].personality||'';
      const { personality, ...rest } = d[n]; // personality는 per 쪽에, 나머지 필드 전부는 grw 쪽에 그대로 보존
      grw[n] = rest;
    });
    lsSet(COMP_PERSONALITY_KEY, JSON.stringify(per));
    lsSet(COMP_GROWTH_KEY,      JSON.stringify(grw));
    lsSet(COMPANION_DATA_KEY,   JSON.stringify(d)); // 하위호환
  }catch(e){}
}
window.saveCompanionExt = saveCompanionExt;

export function assignCompanionPersonality(npcName){
  const ext = loadCompanionExt();
  if(ext[npcName]?.personality) return ext[npcName].personality;
  const types = Object.keys(COMPANION_PERSONALITIES);
  const assigned = types[Math.floor(Math.random()*types.length)];
  ext[npcName] = { ...ext[npcName], personality:assigned, growth:0, subQuestDone:false, trustLevel:0 };
  saveCompanionExt(ext);
  return assigned;
}
window.assignCompanionPersonality = assignCompanionPersonality;

window.assignCompanionPersonality = assignCompanionPersonality;

export function growCompanions(){
  const party = typeof loadParty==='function' ? loadParty() : [];
  if(!party.length) return;
  const ext = loadCompanionExt();
  let changed = false;

  party.forEach(member=>{
    const pType = assignCompanionPersonality(member.name);
    const pDef  = COMPANION_PERSONALITIES[pType];
    if(!pDef) return;
    if(!ext[member.name]) ext[member.name] = { personality:pType, growth:0, subQuestDone:false, trustLevel:0 };
    const e = ext[member.name];
    e.growth = (e.growth||0) + 1;
    // 10 성장마다 스탯 보너스 +2
    if(e.growth % 10 === 0){
      member.statBonus = member.statBonus || {};
      member.statBonus[pDef.growthStat] = (member.statBonus[pDef.growthStat]||0) + 2;
      if(S.stats?.[pDef.growthStat] !== undefined)
        S.stats[pDef.growthStat] = Math.min(999, (S.stats[pDef.growthStat]||10) + 2);
      toast(`${member.name} 성장! ${pDef.growthStat.toUpperCase()} +2`, 3000, member);
      changed = true;
    }
    // [60-2번 섹션] 신뢰도 — 실제 NPC DB에 이 이름의 관계 기록이 있으면
    // (전투/퀘스트 등에서 이미 쌓인 진짜 관계) 그 trust 값을 그대로
    // 신뢰도로 쓴다. 기록이 아예 없는 동료(아직 NPC DB에 안 잡힌 경우)
    // 만 기존 "턴마다 +1" 폴백으로 유지 — 회귀 없음.
    const npcRec = (typeof loadNpcDB==='function') ? loadNpcDB()[member.name] : null;
    if(npcRec && typeof npcRec.trust==='number'){
      e.trustLevel = npcRec.trust;
    } else {
      e.trustLevel = Math.min(100, (e.trustLevel||0) + 1);
    }
    // 서브퀘스트 제안 (신뢰도 50 이상, 미완료)
    if(e.trustLevel >= 50 && !e.subQuestDone && !e._subQuestPending){
      e._subQuestPending = true;
      setTimeout(()=>{
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          ` [👥 동료 서브퀘스트: ${member.icon}${member.name}] 신뢰도가 쌓였다. ${pDef.subQuestHint} 다음 장면에서 ${member.name}이 주인공에게 개인적인 부탁이나 고백을 꺼내는 자연스러운 계기를 만들어라.`;
      }, 500);
    }
    // [60-2번 섹션] 결속 완성 — 서브퀘스트보다 더 높은 신뢰(85 이상)에
    // 도달하면 1회성으로 영구 스탯 보너스(+5)와 전용 서사 계기를 준다.
    // 길드마스터 선물(59-2번 섹션)/영지 왕국 선포(60-1번 섹션)와 같은
    // "최고 단계 1회성 보상" 패턴을 재사용.
    if(e.trustLevel >= 85 && !e.bondRewardGiven){
      e.bondRewardGiven = true;
      member.statBonus = member.statBonus || {};
      member.statBonus[pDef.growthStat] = (member.statBonus[pDef.growthStat]||0) + 5;
      if(S.stats?.[pDef.growthStat] !== undefined)
        S.stats[pDef.growthStat] = Math.min(999, (S.stats[pDef.growthStat]||10) + 5);
      toastHTML(`💞 ${member.icon||''} ${member.name}과(와) 깊은 신뢰를 쌓았다! ${pDef.growthStat.toUpperCase()} +5 (영구)`, 4500);
      setTimeout(()=>{
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          ` [💞 동료 결속 완성: ${member.icon}${member.name}] ${pDef.bondHint} 다음 장면에서 이 결속이 완성되는 장면을 자연스럽게 묘사하라.`;
      }, 600);
      changed = true;
    }
  });

  if(changed){
    if(typeof saveParty==='function') saveParty(party);
    if(typeof applyPartyBonus==='function') applyPartyBonus();
  }
  saveCompanionExt(ext);
}
window.growCompanions = growCompanions;

window.growCompanions = growCompanions;

export function checkCompanionLeave(userMsg){
  const party = typeof loadParty==='function' ? loadParty() : [];
  if(!party.length) return;
  const ext = loadCompanionExt();
  const lc = userMsg.toLowerCase();

  party.forEach(member=>{
    const pType = ext[member.name]?.personality;
    if(!pType) return;
    const pDef = COMPANION_PERSONALITIES[pType];
    if(!pDef) return;
    const triggered = pDef.leaveTrigger.some(t=>lc.includes(t.toLowerCase()));
    if(triggered && Math.random() < 0.3){
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        ` [💔 동료 이탈 경고: ${member.icon}${member.name}] ${member.name}의 성격(${pDef.label})과 충돌하는 상황이다. 표정이 굳어지거나 거리를 두는 묘사를 추가하라. 계속되면 이탈할 수 있다.`;
    }
  });
}
window.checkCompanionLeave = checkCompanionLeave;

window.checkCompanionLeave = checkCompanionLeave;
