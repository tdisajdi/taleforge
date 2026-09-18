// [5] 직업 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { ALIGN_AXES, DISSONANCE_STAGES, JOB_ALIGNMENTS, JOB_DEFS, RACE_ALIGNMENTS, RACE_ALIGNMENT_KEYWORDS } from '../data/208-5-직업-시스템.js';
import { saveSession } from '../misc/001-block0-preamble.js';
import { getPlayerReligion } from '../religion/094-5-플레이어-종교-귀속-교화.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadPlayerLevel } from './008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadJobHistory, saveJobToMemory } from './042-직업-시스템-무한-파생-도감.js';

window.JOB_DEFS = JOB_DEFS;

export function getJobAlignment(jobId){
  const id = (jobId||'').toLowerCase().replace(/\s/g,'');
  if(!id) return null;
  let bestRow = null, bestLen = 0;
  for(const row of JOB_ALIGNMENTS){
    for(const kw of row.match){
      const kwLower = kw.toLowerCase();
      if((id.includes(kwLower) || kwLower.includes(id)) && kwLower.length > bestLen){
        bestLen = kwLower.length;
        bestRow = row;
      }
    }
  }
  return bestRow;
}
window.getJobAlignment = getJobAlignment;

export function getItemAlignment(item){
  if(!item?.effects) return null;
  const scores = {};
  Object.entries(ALIGN_AXES).forEach(([axisId, def])=>{
    let score = 0;
    Object.entries(def.stats).forEach(([statKey, weight])=>{
      const v = item.effects[statKey];
      if(typeof v === 'number' && v > 0) score += v * weight;
    });
    scores[axisId] = score;
  });
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  if(!sorted.length || sorted[0][1] <= 0) return null;
  const [topAxis, topScore] = sorted[0];
  // 총 effects 합 대비 해당 축 비중으로 강도 계산
  const totalPositive = Object.values(item.effects).filter(v=>typeof v==='number'&&v>0).reduce((a,b)=>a+b,0) || 1;
  const strength = Math.min(1, topScore / totalPositive);
  return { axis: topAxis, strength };
}
window.getItemAlignment = getItemAlignment;

export const ITEM_DISSONANCE_KEY = 'tf-item-dissonance';

export function loadItemDissonance(){ try{ return parseFloat(lsGet(ITEM_DISSONANCE_KEY)||'0')||0; }catch(e){ return 0; } }
window.loadItemDissonance = loadItemDissonance;

export function saveItemDissonance(n){ try{ lsSet(ITEM_DISSONANCE_KEY, String(Math.max(0,Math.min(100,n)))); }catch(e){} }
window.saveItemDissonance = saveItemDissonance;

export function getDissonanceStage(val){
  return DISSONANCE_STAGES.find(s=>val>=s.min && val<=s.max) || DISSONANCE_STAGES[0];
}
window.getDissonanceStage = getDissonanceStage;

export function recalcItemDissonance(){
  try{
    const jobId = (S?.character && (S.character.jobId || S.character.role)) || '';
    const jobAlign = getJobAlignment(jobId);
    const prevVal = loadItemDissonance();
    if(!jobAlign){
      // 정체성 축이 없는 직업(방랑자 등)은 부조화 시스템 자체를 적용하지 않음
      return { changed:false, val:prevVal, prevVal, stage:getDissonanceStage(0), jobAlign:null };
    }
    const equipped = Object.values(S.equipped||{}).filter(Boolean);
    let pressure = 0; // 양수=부조화 심화, 음수=완화
    equipped.forEach(item=>{
      const ia = getItemAlignment(item);
      if(!ia) return;
      if(ia.axis === jobAlign.opposite) pressure += ia.strength * 8;      // 정반대 축 장비 → 부조화 상승
      else if(ia.axis && ia.axis !== jobAlign.axis) pressure += ia.strength * 2; // 무관한 축 → 소폭 상승
      else if(ia.axis === jobAlign.axis) pressure -= ia.strength * 5;     // 같은 축 → 부조화 완화(정체성 강화)
    });
    const newVal = Math.max(0, Math.min(100, prevVal + pressure*0.3)); // 완만하게 수렴 (턴마다 급변 방지)
    // [F-BUG 수정] 이전에는 "1 미만 변화는 저장 안 함" 조건 때문에 prevVal이
    // 영원히 갱신되지 않아 매턴 같은 값만 계산되고 사실상 절대 누적되지 않는
    // 버그가 있었다. 이제 값이 조금이라도 변하면 항상 저장하고(소수점 보존은
    // saveItemDissonance가 정수 반올림하므로 아래서 반올림해 저장),
    // changed는 "단계(stage)가 실제로 바뀌었는지"로 판정한다.
    const prevStage = getDissonanceStage(prevVal).stage;
    const newStage = getDissonanceStage(newVal).stage;
    if(newVal !== prevVal) saveItemDissonance(newVal);
    const changed = newStage !== prevStage;
    return { changed, val:newVal, prevVal, stage:getDissonanceStage(newVal), jobAlign };
  }catch(e){ return { changed:false, val:0, stage:getDissonanceStage(0), jobAlign:null }; }
}
window.recalcItemDissonance = recalcItemDissonance;

export function onEquipmentAlignmentChanged(){
  try{
    const result = recalcItemDissonance();
    if(!result.jobAlign) return;
    const prevStage = getDissonanceStage(result.prevVal ?? result.val).stage;
    const curStage = result.stage.stage;
    if(curStage !== prevStage && result.changed){
      const axisDef = ALIGN_AXES[result.jobAlign.axis];
      if(curStage > prevStage){
        toast(`${result.stage.stage>=3?'⚠️':'🌀'} 정체성 ${result.stage.label} (${curStage}단계) — ${result.stage.desc}`, 4500);
      } else {
        toast(`✨ 정체성이 안정을 되찾는다 — ${result.stage.label} (${curStage}단계)`, 3500);
      }
    }
    applyDissonanceStatEffect();
  }catch(e){}
}
window.onEquipmentAlignmentChanged = onEquipmentAlignmentChanged;

export const DISSONANCE_STAT_KEY = 'tf-dissonance-stat-applied';

export function applyDissonanceStatEffect(){
  try{
    const jobId = (S?.character && (S.character.jobId || S.character.role)) || '';
    const jobAlign = getJobAlignment(jobId);
    const prevApplied = JSON.parse(lsGet(DISSONANCE_STAT_KEY)||'{}');
    // 이전 적용분 롤백
    Object.entries(prevApplied).forEach(([k,v])=>{ if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });
    if(!jobAlign){ lsSet(DISSONANCE_STAT_KEY,'{}'); window.updateHeader&&window.updateHeader(); return; }

    const val = loadItemDissonance();
    const stage = getDissonanceStage(val);
    const penalty = stage.statPenalty || 0;
    const applied = {};
    if(penalty > 0){
      const axisStats = ALIGN_AXES[jobAlign.axis].stats;
      const oppStats = ALIGN_AXES[jobAlign.opposite]?.stats || {};
      // 주 축 스탯 약화
      Object.keys(axisStats).forEach(k=>{
        const amt = -Math.round(penalty*8);
        if(S.stats[k]!==undefined){ S.stats[k]=Math.max(0,S.stats[k]+amt); applied[k]=(applied[k]||0)+amt; }
      });
      // 반대 축 스탯 소폭 상승 (변질의 대가로 얻는 힘)
      Object.keys(oppStats).forEach(k=>{
        const amt = Math.round(penalty*5);
        if(S.stats[k]!==undefined){ S.stats[k]=Math.min(999,S.stats[k]+amt); applied[k]=(applied[k]||0)+amt; }
      });
    }
    lsSet(DISSONANCE_STAT_KEY, JSON.stringify(applied));
    window.updateHeader&&window.updateHeader();
  }catch(e){}
}
window.applyDissonanceStatEffect = applyDissonanceStatEffect;

export function getItemDissonanceSection(){
  try{
    const jobId = (S?.character && (S.character.jobId || S.character.role)) || '';
    const jobAlign = getJobAlignment(jobId);
    if(!jobAlign) return '';
    const val = loadItemDissonance();
    const stage = getDissonanceStage(val);
    if(stage.stage === 0) return '';
    const axisDef = ALIGN_AXES[jobAlign.axis];
    const equipped = Object.values(S.equipped||{}).filter(Boolean);
    const dissonantItems = equipped.filter(it=>{
      const ia = getItemAlignment(it);
      return ia && ia.axis === jobAlign.opposite;
    }).map(it=>`${it.icon||''}${it.name}`);
    return `\n[${axisDef.icon} 정체성 부조화 — ${stage.label} ${stage.stage}단계 (${Math.round(val)}/100)] ${stage.desc}${dissonantItems.length?` 부조화 원인 장비: ${dissonantItems.join(', ')}.`:''} ${stage.aiHint||''}`;
  }catch(e){ return ''; }
}
window.getItemDissonanceSection = getItemDissonanceSection;

window.ALIGN_AXES = ALIGN_AXES;

window.getJobAlignment = getJobAlignment;

window.getItemAlignment = getItemAlignment;

window.recalcItemDissonance = recalcItemDissonance;

window.onEquipmentAlignmentChanged = onEquipmentAlignmentChanged;

window.applyDissonanceStatEffect = applyDissonanceStatEffect;

window.getItemDissonanceSection = getItemDissonanceSection;

window.loadItemDissonance = loadItemDissonance;

window.getDissonanceStage = getDissonanceStage;

export function getRaceAlignment(){
  try{
    const race = (S?.character?.race||'').toLowerCase();
    for(const [rid, kws] of Object.entries(RACE_ALIGNMENT_KEYWORDS)){
      if(kws.some(k=>race.includes(k.toLowerCase()))) return RACE_ALIGNMENTS[rid];
    }
    return null;
  }catch(e){ return null; }
}
window.getRaceAlignment = getRaceAlignment;

export const RACE_JOB_DISSONANCE_KEY = 'tf-race-job-dissonance';

export const RACE_JOB_DISSONANCE_RESOLVED_KEY = 'tf-race-job-dissonance-resolved';

export function loadRaceJobDissonance(){ try{ return parseFloat(lsGet(RACE_JOB_DISSONANCE_KEY)||'0')||0; }catch(e){ return 0; } }
window.loadRaceJobDissonance = loadRaceJobDissonance;

export function saveRaceJobDissonance(n){ try{ lsSet(RACE_JOB_DISSONANCE_KEY, String(Math.max(0,Math.min(100,n)))); }catch(e){} }
window.saveRaceJobDissonance = saveRaceJobDissonance;

export function isRaceJobDissonanceResolved(){ try{ return lsGet(RACE_JOB_DISSONANCE_RESOLVED_KEY)==='1'; }catch(e){ return false; } }
window.isRaceJobDissonanceResolved = isRaceJobDissonanceResolved;

export function markRaceJobDissonanceResolved(){ lsSet(RACE_JOB_DISSONANCE_RESOLVED_KEY,'1'); }
window.markRaceJobDissonanceResolved = markRaceJobDissonanceResolved;

export function recalcRaceJobDissonance(){
  try{
    const jobId = (S?.character && (S.character.jobId || S.character.role)) || '';
    const jobAlign = getJobAlignment(jobId);
    const raceAxis = getRaceAlignment();
    // 극복 완료 상태면 더 이상 부조화를 재계산하지 않는다(서사로 매듭지은 것을
    // 시스템이 다시 되돌리지 않음).
    if(isRaceJobDissonanceResolved()) return { val:0, stage:getDissonanceStage(0), jobAlign, raceAxis };
    if(!jobAlign || !raceAxis){ saveRaceJobDissonance(0); return { val:0, stage:getDissonanceStage(0), jobAlign, raceAxis }; }

    const prevVal = loadRaceJobDissonance();
    let target;
    if(raceAxis === jobAlign.opposite) target = 70;       // 정반대 축 — 언데드+성직자 등, 강한 초기 부조화
    else if(raceAxis !== jobAlign.axis) target = 25;       // 무관한 축 — 약한 부조화
    else target = 0;                                        // 같은 축 — 부조화 없음(자연스러운 조합)

    // 매 턴 target을 향해 완만하게 수렴(자연 적응) — 급격한 변화 없이
    // 서서히 완화되되 완전히 0으로는 잘 안 내려가게(target이 0이 아닌 한).
    const newVal = prevVal + (target - prevVal) * 0.02;
    if(Math.abs(newVal - prevVal) >= 0.1) saveRaceJobDissonance(newVal);
    return { val:newVal, stage:getDissonanceStage(newVal), jobAlign, raceAxis };
  }catch(e){ return { val:0, stage:getDissonanceStage(0), jobAlign:null, raceAxis:null }; }
}
window.recalcRaceJobDissonance = recalcRaceJobDissonance;

export function initRaceJobDissonance(){
  try{
    if(isRaceJobDissonanceResolved()) return;
    const jobId = (S?.character && (S.character.jobId || S.character.role)) || '';
    const jobAlign = getJobAlignment(jobId);
    const raceAxis = getRaceAlignment();
    if(!jobAlign || !raceAxis){ saveRaceJobDissonance(0); return; }
    let initVal = 0;
    if(raceAxis === jobAlign.opposite) initVal = 45;
    else if(raceAxis !== jobAlign.axis) initVal = 15;
    saveRaceJobDissonance(initVal);
    applyRaceJobDissonanceStatEffect();
  }catch(e){}
}
window.initRaceJobDissonance = initRaceJobDissonance;

export const RACE_JOB_DISSONANCE_STAT_KEY = 'tf-race-job-dissonance-stat-applied';

export function applyRaceJobDissonanceStatEffect(){
  try{
    const jobId = (S?.character && (S.character.jobId || S.character.role)) || '';
    const jobAlign = getJobAlignment(jobId);
    const prevApplied = JSON.parse(lsGet(RACE_JOB_DISSONANCE_STAT_KEY)||'{}');
    Object.entries(prevApplied).forEach(([k,v])=>{ if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });
    if(!jobAlign || isRaceJobDissonanceResolved()){ lsSet(RACE_JOB_DISSONANCE_STAT_KEY,'{}'); window.updateHeader&&window.updateHeader(); return; }

    const val = loadRaceJobDissonance();
    const stage = getDissonanceStage(val);
    const penalty = stage.statPenalty || 0;
    const applied = {};
    if(penalty > 0){
      const axisStats = ALIGN_AXES[jobAlign.axis].stats;
      const oppStats = ALIGN_AXES[jobAlign.opposite]?.stats || {};
      Object.keys(axisStats).forEach(k=>{
        const amt = -Math.round(penalty*6); // item_dissonance보다 약간 완만(8→6) — 이미 태생적 긴장이라 장비만큼 급격하지 않게
        if(S.stats[k]!==undefined){ S.stats[k]=Math.max(0,S.stats[k]+amt); applied[k]=(applied[k]||0)+amt; }
      });
      Object.keys(oppStats).forEach(k=>{
        const amt = Math.round(penalty*4);
        if(S.stats[k]!==undefined){ S.stats[k]=Math.min(999,S.stats[k]+amt); applied[k]=(applied[k]||0)+amt; }
      });
    }
    lsSet(RACE_JOB_DISSONANCE_STAT_KEY, JSON.stringify(applied));
    window.updateHeader&&window.updateHeader();
  }catch(e){}
}
window.applyRaceJobDissonanceStatEffect = applyRaceJobDissonanceStatEffect;

export function resolveRaceJobDissonance(){
  try{
    const wasResolved = isRaceJobDissonanceResolved();
    const hadDissonance = loadRaceJobDissonance() >= 20;
    markRaceJobDissonanceResolved();
    saveRaceJobDissonance(0);
    applyRaceJobDissonanceStatEffect();
    if(!wasResolved && hadDissonance && typeof toast==='function'){
      toast('✨ 종족과 직업 사이의 오랜 긴장이 마침내 풀렸다 — 온전히 자기 자신으로 서게 되었다', 5000);
    }
  }catch(e){}
}
window.resolveRaceJobDissonance = resolveRaceJobDissonance;

window.recalcRaceJobDissonance = recalcRaceJobDissonance;

window.initRaceJobDissonance = initRaceJobDissonance;

window.applyRaceJobDissonanceStatEffect = applyRaceJobDissonanceStatEffect;

window.resolveRaceJobDissonance = resolveRaceJobDissonance;

window.loadRaceJobDissonance = loadRaceJobDissonance;

window.isRaceJobDissonanceResolved = isRaceJobDissonanceResolved;

window.getRaceAlignment = getRaceAlignment;

export function getRaceJobDissonanceSection(){
  try{
    if(isRaceJobDissonanceResolved()) return '';
    const jobId = (S?.character && (S.character.jobId || S.character.role)) || '';
    const jobAlign = getJobAlignment(jobId);
    const raceAxis = getRaceAlignment();
    if(!jobAlign || !raceAxis || raceAxis===jobAlign.axis) return '';
    const val = loadRaceJobDissonance();
    if(val < 15) return '';
    const stage = getDissonanceStage(val);
    const raceLabel = S?.character?.race || '이 종족';
    const jobAxisDef = ALIGN_AXES[jobAlign.axis];
    const raceAxisDef = ALIGN_AXES[raceAxis];
    const severity = raceAxis === jobAlign.opposite ? '정반대되는' : '결이 다른';
    // [신규] 종교 시스템 연동 — 정식으로 그 직업 계열과 같은 종교에
    // 귀의했다면(예: 뱀파이어가 순환의 사원에 귀의하고 성기사를 함),
    // "종교 조직 차원에서는 이미 받아들여졌지만 개인적 신뢰는 아직"이라는
    // 훨씬 섬세한 뉘앙스를 안내한다 — 완전히 배척당하는 것과는 다르다.
    const playerRel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
    const relDef = playerRel && typeof RELIGIONS!=='undefined' ? RELIGIONS[playerRel] : null;
    let religionNote = '';
    if(relDef && jobAlign.axis==='holy' && playerRel==='temple'){
      religionNote = ` 다만 캐릭터는 이미 ${relDef.icon}${relDef.name}에 정식으로 귀의한 상태다 — 종교 조직 차원에서는 신도로 받아들여졌으니 노골적인 배척은 어울리지 않는다. 대신 "교리로는 받아들이지만 개인적으로는 아직 낯설다"는 더 섬세한 온도차로 표현하라.`;
    } else if(relDef && jobAlign.axis==='dark' && playerRel==='abyss'){
      religionNote = ` 다만 캐릭터는 이미 ${relDef.icon}${relDef.name}에 은밀히 귀의한 상태다 — 이 사실이 알려지면 오히려 직업 계열 마스터의 경계가 더 짙어질 수 있다는 점을 활용하라.`;
    }
    return `\n[⚡ 종족-직업 정체성 부조화 — ${stage.label} ${stage.stage}단계 (${Math.round(val)}/100)] 캐릭터는 ${raceLabel} 종족(${raceAxisDef.icon}${raceAxisDef.label} 성향)이면서 ${severity} ${jobAxisDef.icon}${jobAxisDef.label} 계열 직업을 걷고 있다 — 이는 타고난 본성과 선택한 길 사이의 근본적인 긴장이다. 이 직업 계열의 마스터 NPC나 동료 성직자/전문가들은 처음에는 이 캐릭터를 의아해하거나 경계할 수 있다(대놓고 배척하기보다, "왜 하필 이 길을?"이라는 의문이나 미묘한 거리감으로 표현하라). 이 부조화는 장비를 바꾼다고 사라지지 않으며, 오직 그 직업 계열의 핵심 서사(히든 퀘스트)를 통해 진심으로 인정받아야 해소된다.${religionNote} ${stage.aiHint||''}`;
  }catch(e){ return ''; }
}
window.getRaceJobDissonanceSection = getRaceJobDissonanceSection;

window.getRaceJobDissonanceSection = getRaceJobDissonanceSection;

export function getJobDef(jobId) {
  const id = (jobId || '').toLowerCase().replace(/\s/g,'');
  return Object.entries(JOB_DEFS).find(([k]) => id.includes(k) || k.includes(id))?.[1] || null;
}
window.getJobDef = getJobDef;

// [20차 감사 FIX] applyJobBonus/removeJobBonus는 매번 getJobDef(jobId)의
// stats를 그 자리에서 계산해 더하거나 빼기만 할 뿐, "실제로 무엇을
// 적용했는지"를 추적하지 않았다. 그런데 이 둘은 changeJob()을 통해서만
// 쌍으로 호출되고, 정작 게임에서 실제로 가장 많이 쓰이는 전직 경로인
// job/042의 offerJobChange()(전직 제안 팝업 수락, 방랑자 진화 등)는
// S.character.role/jobId만 바꿀 뿐 이 보너스 시스템을 전혀 건드리지
// 않는다 — 캐릭터 생성 시점도 마찬가지로 applyJobBonus가 호출된 적이
// 없다. 그 상태에서 AI가 GS로 gs.job 필드를 단 한 번이라도 출력해
// changeJob()이 처음 실행되면, removeJobBonus(prev)가 "한 번도 적용된
// 적 없는" 이전 직업(JOB_DEFS와 우연히 id가 일치하는 기본 직업일 경우)의
// 보너스를 실제로 스탯에서 깎아버린다 — 부여된 적 없는 보상을 지워버려
// 스탯이 영구적으로 부당하게 감소하는 결과였다. 다른 apply*Stats
// 함수들과 동일한 "이전에 실제로 적용한 델타를 추적 → 되돌리기 → 새로
// 계산해 적용"패턴으로 통일해, offerJobChange가 이 시스템을 건너뛰어도
// (즉 S._jobDefBonus가 비어있어도) changeJob()이 안전하게 동작하도록
// 고친다.
export function applyJobBonus(jobId) {
  try {
    if (!S?.stats) return;
    const prevBonus = S._jobDefBonus || {};
    Object.entries(prevBonus).forEach(([k,v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
    });
    const def = getJobDef(jobId);
    const nb = {};
    if (def && def.stats) {
      Object.entries(def.stats).forEach(([k,v]) => {
        if (S.stats[k] !== undefined) { S.stats[k] = Math.min(999, (S.stats[k]||0) + v); nb[k] = v; }
      });
    }
    S._jobDefBonus = nb;
    if (typeof window.updateHeader === 'function') window.updateHeader();
    if (typeof saveSession === 'function') saveSession();
  } catch(e) {}
}
window.applyJobBonus = applyJobBonus;

// removeJobBonus는 이제 추적된 S._jobDefBonus만 되돌리고 비운다 — jobId
// 인자는 하위 호환을 위해 유지하되 실제로는 쓰지 않는다(무엇이 실제로
// 적용됐는지는 추적된 값만이 정확히 알 수 있으므로).
export function removeJobBonus(jobId) {
  try {
    if (!S?.stats) return;
    const prevBonus = S._jobDefBonus || {};
    Object.entries(prevBonus).forEach(([k,v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, (S.stats[k]||0) - v);
    });
    S._jobDefBonus = {};
  } catch(e) {}
}
window.removeJobBonus = removeJobBonus;

export function changeJob(newJobId, reason='') {
  try {
    const prev = S?.character?.role || '';
    removeJobBonus(prev);
    if (S?.character) {
      S.character.role = newJobId;
      // [F-15 FIX] jobId도 함께 갱신 (직업 숙련도·스킬 체크 기준)
      S.character.jobId = newJobId;
    }
    applyJobBonus(newJobId);
    // [신규] 전직하면 새 직업에 대한 종족-직업 부조화를 다시 초기화한다
    // — 이전 직업에서 히든 퀘스트로 극복했더라도, 새 직업은 다시 그
    // 조합의 처음부터 시작한다(단, 극복 여부는 직업별이 아니라 통합
    // 플래그라 실제로는 한 번 극복하면 이후 다른 직업으로도 유지되는
    // 쪽이 자연스럽다고 판단해 markRaceJobDissonanceResolved는 직업
    // 무관하게 지속시킨다 — initRaceJobDissonance 내부에서 이미
    // isRaceJobDissonanceResolved 체크로 처리됨).
    if (typeof initRaceJobDissonance === 'function') initRaceJobDissonance();
    const def = getJobDef(newJobId);
    toast(`⚔️ 직업 변경: ${prev} → ${def?.name || newJobId}`, 3000);
    // 직업 이력 저장
    const jh = (typeof loadJobHistory === 'function' ? loadJobHistory() : []) || [];
    jh.push({ from: prev, to: newJobId, reason, turn: S?.msgCount || 0 });
    if (typeof lsSet === 'function') lsSet('tf-job-history', JSON.stringify(jh));
    if (typeof saveSession === 'function') saveSession();
    if (typeof saveJobToMemory === 'function') saveJobToMemory();
  } catch(e) {}
}
window.changeJob = changeJob;

export function applyJobStatBonus(jobId) { applyJobBonus(jobId); }
window.applyJobStatBonus = applyJobStatBonus;

export function checkJobUnlock(jobId) {
  const def = getJobDef(jobId);
  if (!def) return false;
  const lv = typeof loadPlayerLevel === 'function' ? loadPlayerLevel() : null;
  return !lv || (lv || 1) >= (def.reqLevel || 1);
}
window.checkJobUnlock = checkJobUnlock;

window.getJobDef        = getJobDef;

window.applyJobBonus    = applyJobBonus;

window.removeJobBonus   = removeJobBonus;

window.changeJob        = changeJob;

window.applyJobStatBonus = applyJobStatBonus;

window.checkJobUnlock   = checkJobUnlock;
