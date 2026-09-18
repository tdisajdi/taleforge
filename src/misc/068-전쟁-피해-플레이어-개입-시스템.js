// ⚔️ 전쟁 피해 & 플레이어 개입 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { FACTION_GOAL_POOL, WAR_ACTIONS } from '../data/068-전쟁-피해-플레이어-개입-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { _initTension, _simKey, getCurrentFactions, getSimStatus, getSimTension, loadFactionRep, loadFactionSim, saveFactionRep, saveFactionSim, showFactionNewsToast, tickFactionSimulation, updateFactionRep } from '../npc/067-③-NPC-관계망-시스템.js';
import { renderNpcRumorPanel } from '../npc/294-NPC-소문-계급별-정보-시스템.js';
import { addEventLog } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { applyFactionWarResult } from '../world/199-NEW-6-세력-전쟁-영구-반영-시스템.js';

export const WAR_ACTION_KEY = 'tf-war-action';

export function loadWarAction(){ try{ return JSON.parse(lsGet(WAR_ACTION_KEY)||'{}'); }catch(e){ return {}; } }
window.loadWarAction = loadWarAction;

export function saveWarAction(d){ try{ lsSet(WAR_ACTION_KEY, JSON.stringify(d)); }catch(e){} }
window.saveWarAction = saveWarAction;

export function rollWarCheck(statKey, label){
  const statVal = Math.round(S.stats?.[statKey] || 50);
  const dice = Math.floor(Math.random()*100)+1;
  let threshold = Math.min(85, 30 + Math.floor(statVal * 0.5));
  const isCrit  = dice <= 5;
  const isGood  = dice <= threshold;
  const isCFail = dice >= 96;
  let grade, icon;
  if(isCrit)        { grade='대성공'; icon='🌟'; }
  else if(isGood)   { grade='성공';   icon='✅'; }
  else if(isCFail)  { grade='대실패'; icon='💀'; }
  else              { grade='실패';   icon='❌'; }
  const result = { dice, statVal, threshold, grade, icon, success: isGood||isCrit, crit: isCrit, critFail: isCFail };

  // [버그 수정] 아래 카르마·종교 보너스는 progression/202·religion/102가
  // 각각 window.rollWarCheck를 감싸는 방식으로 적용하려 했다. rollWarCheck의
  // 유일한 실제 호출부(이 파일 안, 469번째 줄)가 bare 식별자로 호출하기
  // 때문에 두 감싸기 모두 절대 적용되지 못했다(다른 죽은 훅들과 동일한
  // 원인). 함수 자체에 두 보너스를 순서대로(카르마 → 종교, 원래 훅
  // 설치 순서와 동일) 네이티브로 반영한다.
  if(typeof getKarmaRollBonus==='function'){
    const kb = getKarmaRollBonus();
    if(kb && kb.bonus !== 0){
      result.threshold = Math.min(92, Math.max(5, result.threshold + kb.bonus));
      result.success = (result.dice <= result.threshold) || result.crit;
      result.karmaLabel = kb.label;
    }
  }
  if(typeof getReligionRollBonus==='function'){
    const rb = getReligionRollBonus();
    if(rb && rb.bonusStat === statKey){
      result.threshold = Math.min(92, result.threshold + rb.bonus);
      result.success = result.dice <= result.threshold;
      result.religionLabel = rb.desc;
    }
    if(rb && rb.penaltyStat === statKey){
      result.threshold = Math.max(5, result.threshold + rb.penalty);
      result.success = result.dice <= result.threshold;
    }
  }
  return result;
}
window.rollWarCheck = rollWarCheck;

export function rollMediationCheck(factionA, factionB){
  const spk = Math.round(S.stats?.spk || 50);
  const neg = Math.round(S.stats?.neg || 50);
  const cha = Math.round(S.stats?.cha || 50);
  const avgStat = Math.floor((spk + neg + cha) / 3);
  const dice = Math.floor(Math.random()*100)+1;
  const threshold = Math.min(80, 25 + Math.floor(avgStat * 0.5));
  const isCrit  = dice <= 5;
  const isGood  = dice <= threshold;
  const isCFail = dice >= 96;
  let grade, icon, tensionChange, repChange;
  if(isCrit){
    grade='대성공'; icon='🌟';
    tensionChange = -20; repChange = 15;
  } else if(isGood){
    grade='성공';   icon='✅';
    tensionChange = -10; repChange = 8;
  } else if(isCFail){
    grade='대실패'; icon='💀';
    tensionChange = +8;  repChange = -5; // 중재 실패가 오히려 긴장 고조
  } else {
    grade='실패';   icon='❌';
    tensionChange = -2;  repChange = 2;  // 소폭만 효과
  }
  return { dice, avgStat, threshold, grade, icon, tensionChange, repChange, success: isGood||isCrit, crit: isCrit, critFail: isCFail, spk, neg, cha };
}
window.rollMediationCheck = rollMediationCheck;

export const WAR_INF_KEY = 'tf-war-influence';

export function loadWarInfluence(){ try{ return JSON.parse(lsGet(WAR_INF_KEY)||'{}'); }catch(e){ return {}; } }
window.loadWarInfluence = loadWarInfluence;

export function saveWarInfluence(d){ try{ lsSet(WAR_INF_KEY, JSON.stringify(d)); }catch(e){} }
window.saveWarInfluence = saveWarInfluence;

export const WAR_INTERV_KEY = 'tf-war-interv';

export function loadWarInterv(){ try{ return JSON.parse(lsGet(WAR_INTERV_KEY)||'{}'); }catch(e){ return {}; } }
window.loadWarInterv = loadWarInterv;

export function saveWarInterv(d){ try{ lsSet(WAR_INTERV_KEY, JSON.stringify(d)); }catch(e){} }
window.saveWarInterv = saveWarInterv;

export function getEffectiveInfluence(factionName){
  const base = (getCurrentFactions()[factionName]||{}).influence || 50;
  const dmg  = loadWarInfluence()[factionName] || 0;
  return Math.max(1, base - dmg);
}
window.getEffectiveInfluence = getEffectiveInfluence;

export function applyWarDamage(sim, factions, names, now, events){
  const inf   = loadWarInfluence();
  const interv = loadWarInterv();
  const warPairs = [];

  for(let i=0; i<names.length; i++){
    for(let j=i+1; j<names.length; j++){
      const a=names[i], b=names[j];
      const k = _simKey(a,b);
      const t = sim.relations[k] || _initTension(a,b);
      if(getSimStatus(t).code !== 'war') continue;
      warPairs.push({a, b, k});
    }
  }
  if(!warPairs.length) return;

  warPairs.forEach(({a, b, k}) => {
    const iv = interv[k] || { side:'neutral', since: now };

    // 기본 피해: 양측 각 1~3
    let dmgA = Math.floor(Math.random()*3)+1;
    let dmgB = Math.floor(Math.random()*3)+1;

    // 플레이어 개입 효과
    if(iv.side === 'a'){
      // A편 참전: A 피해 -1, B 피해 +2
      dmgA = Math.max(0, dmgA - 1);
      dmgB += 2;
    } else if(iv.side === 'b'){
      dmgB = Math.max(0, dmgB - 1);
      dmgA += 2;
    } else if(iv.side === 'mediate'){
      // 조정: 양측 피해 절반
      dmgA = Math.max(1, Math.floor(dmgA * 0.5));
      dmgB = Math.max(1, Math.floor(dmgB * 0.5));
    }
    // neutral: 기본 피해 그대로

    inf[a] = (inf[a]||0) + dmgA;
    inf[b] = (inf[b]||0) + dmgB;

    // 세력 influence가 10 이하면 전쟁 패배 → 강제 휴전
    const effA = getEffectiveInfluence(a) - dmgA;
    const effB = getEffectiveInfluence(b) - dmgB;
    if(effA <= 10 || effB <= 10){
      const loser  = effA <= effB ? a : b;
      const winner = loser === a ? b : a;
      // 긴장도를 초기값으로 리셋하고 휴전 처리
      sim.relations[k] = Math.min(_initTension(a,b), 89);
      const warStart = sim.warMeta[k]?.warStart;
      sim.warMeta[k] = { ...(sim.warMeta[k]||{}), ceasefireAt: now };
      events.push({
        a, b, winner, loser, from:'war', to:'conflict', tension: sim.relations[k],
        msg:`💀 ${(factions[loser]||{}).icon||''}${loser}이(가) 전쟁에서 패배했다! ${(factions[winner]||{}).icon||''}${winner}의 승리로 전쟁이 끝났다.`,
        turn: now, isDefeat: true
      });
      // [버그 수정] applyFactionWarResult(패전 세력의 영구 영향력 감소 +
      // AI용 GS 플래그 기록)를 실제로 호출하는 코드가 코드베이스 어디에도
      // 없었다 — world/199의 window.tickFactionSimulation 래핑은 이
      // 함수의 실제 호출부(quest/086·misc/068)가 import 바인딩을 직접
      // 호출해 절대 도달하지 못하는 죽은 코드였고, 설령 도달했더라도
      // winner/loser 필드가 이벤트 객체에 없어 항상 a를 승자로 잘못
      // 단정했을 것이다(패배 판정과 무관하게 절반 확률로 진짜 패자에게
      // 보상을 주는 반대 결과). 여기서 실제로 승패가 확정되는 시점에
      // 직접, 올바른 승자/패자로 연결한다.
      try{ if(typeof applyFactionWarResult==='function') applyFactionWarResult(winner, loser, warStart!==undefined ? now-warStart : 0); }catch(e){}
      // 패자 influence 피해 리셋 (재기 가능하도록)
      inf[loser] = Math.floor((inf[loser]||0) * 0.5);
      // 개입 상태 초기화
      delete interv[k];

      // [신규 ②] 어부지리 효과 — 전쟁이 끝나면 그 결과를 지켜보던 제3
      // 세력이 약해진 패자의 영향력 일부를 흡수할 수 있다. 패자와
      // rivals 관계인 제3세력이 우선 후보가 된다 — "적의 적이 약해지면
      // 내가 득을 본다"는 자연스러운 국제정치 논리.
      try{
        const opportunists = names.filter(n => n !== a && n !== b &&
          ((factions[n]?.rivals||[]).includes(loser) || (factions[loser]?.rivals||[]).includes(n)));
        if(opportunists.length && Math.random() < 0.5){
          const lucky = opportunists[Math.floor(Math.random()*opportunists.length)];
          const gain = Math.floor(Math.random()*8) + 5; // 5~12
          inf[lucky] = (inf[lucky]||0) + gain;
          events.push({
            a: lucky, b: loser, from:'observe', to:'gain', tension: 0,
            msg:`📈 ${(factions[lucky]||{}).icon||''}${lucky}이(가) ${(factions[loser]||{}).icon||''}${loser}의 패배를 틈타 영향력을 확장했다 — 어부지리.`,
            turn: now, isOpportunist: true
          });
        }
      }catch(e){}
    }
  });

  saveWarInfluence(inf);
  saveWarInterv(interv);
}
window.applyWarDamage = applyWarDamage;

export const FACTION_GOAL_KEY = 'tf-faction-goals';

export function loadFactionGoals(){ try{ return JSON.parse(lsGet(FACTION_GOAL_KEY)||'{}'); }catch(e){ return {}; } }
window.loadFactionGoals = loadFactionGoals;

export function saveFactionGoals(d){ try{ lsSet(FACTION_GOAL_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFactionGoals = saveFactionGoals;

export function extractGoalFromLore(lore){
  if(!lore) return null;
  const m = lore.match(/현재 욕망:\s*([^\n]+)/);
  if(!m) return null;
  // 욕망 텍스트가 길면 첫 문장(마침표 기준)만 목표명으로 사용 —
  // successMsg/failMsg에서 자연스러운 문장으로 활용하기 위함.
  const firstSentence = m[1].split('.')[0].trim();
  return firstSentence || null;
}
window.extractGoalFromLore = extractGoalFromLore;

export function getFactionGoalTemplate(name, lore, desc){
  const loreGoal = extractGoalFromLore(lore);
  // [보강] 세력 이름이 고유명사라 키워드 매칭이 안 되는 경우(예: '구파일방',
  // '갱 연합(스컬즈)')를 위해, 이름에 이어 설명(desc)도 매칭 대상에 포함한다.
  // 이름을 우선 검사하고, 이름이 안 걸리면 desc로 한 번 더 검사한다.
  const matchTarget = name + ' ' + (desc||'');
  for(const t of FACTION_GOAL_POOL){
    if(t.match.test(name) || t.match.test(matchTarget)){
      if(loreGoal){
        // lore 욕망이 있으면 목표명만 교체하고, 성공/실패 메시지는 그
        // 세력 정체성에 맞는 키워드 템플릿의 어조를 유지하면서 욕망을
        // 자연스럽게 엮는다.
        return { ...t, goal: loreGoal,
          successMsg:(f)=>`${f}이(가) "${loreGoal}"을(를) 향한 계획에서 큰 진전을 이뤄냈다.`,
          failMsg:(f)=>`${f}의 "${loreGoal}" 계획이 차질을 빚으며 좌초될 위기에 처했다.` };
      }
      return t;
    }
  }
  if(loreGoal){
    return { match:/.*/, goal: loreGoal, duration:[25,35],
      successMsg:(f)=>`${f}이(가) "${loreGoal}"을(를) 향한 계획에서 큰 진전을 이뤄냈다.`,
      failMsg:(f)=>`${f}의 "${loreGoal}" 계획이 차질을 빚으며 좌초될 위기에 처했다.` };
  }
  return { match:/.*/, goal:'세력 강화', duration:[25,35],
    successMsg:(f)=>`${f}이(가) 장기적인 세력 강화 계획을 성공적으로 완수했다.`,
    failMsg:(f)=>`${f}의 세력 강화 계획이 차질을 빚으며 내부 혼란이 생겼다.` };
}
window.getFactionGoalTemplate = getFactionGoalTemplate;

export function tickFactionGoals(){
  try{
    const factions = getCurrentFactions();
    const names = Object.keys(factions);
    const goals = loadFactionGoals();
    const now = S.msgCount || 0;
    const events = [];

    names.forEach(name=>{
      if(!goals[name]){
        // 70% 확률로만 새 목표 부여 — 모든 세력이 항상 목표를 갖는 건 아님(현실적)
        if(Math.random() < 0.7){
          const tpl = getFactionGoalTemplate(name, factions[name]?.lore, factions[name]?.desc);
          const dur = tpl.duration[0] + Math.floor(Math.random()*(tpl.duration[1]-tpl.duration[0]));
          goals[name] = { goal: tpl.goal, startedAt: now, deadline: now+dur, progress: 0 };
        }
        return;
      }
      const g = goals[name];
      // 진행도 누적 — 영향력이 높을수록(강한 세력일수록) 더 빨리 진행
      const inf = getEffectiveInfluence ? getEffectiveInfluence(name) : (factions[name]?.influence||50);
      g.progress += (inf/100) * (3 + Math.random()*4); // 매턴 3~7 * 영향력 보정

      const totalDuration = g.deadline - g.startedAt;
      const progressRatio = g.progress / Math.max(1, totalDuration);

      if(progressRatio >= 1 || now >= g.deadline){
        // [BUG FIX] lore/desc를 전달하지 않으면 시작 시점에 lore 기반
        // 목표로 배정됐어도 완료 시점에는 다시 일반 키워드 템플릿으로
        // 떨어져 successMsg/failMsg가 goal과 다른 내용을 말하는
        // 불일치가 생길 수 있었다. 동일한 lore/desc를 전달해 시작·완료
        // 메시지의 일관성을 보장한다.
        const tpl = getFactionGoalTemplate(name, factions[name]?.lore, factions[name]?.desc);
        const success = progressRatio >= 1; // 데드라인 전에 채웠으면 성공, 못 채웠으면 실패
        const rep = loadFactionRep(); const inf2 = loadWarInfluence();
        if(success){
          inf2[name] = (inf2[name]||0) + 15;
          events.push({ a:name, b:'', from:'goal', to:'success', tension:0, msg:`🎯 ${tpl.successMsg(name)}`, turn:now, isGoalEvent:true });
        } else {
          inf2[name] = Math.max(0, (inf2[name]||0) - 10);
          events.push({ a:name, b:'', from:'goal', to:'failure', tension:0, msg:`⚠️ ${tpl.failMsg(name)}`, turn:now, isGoalEvent:true });
          // [신규] 사건 체인 — 목표 실패는 단발성 뉴스로 끝나지 않고,
          // 그 세력의 라이벌(rivals) 중 하나가 빈틈을 노려 기회를 잡는
          // 파생 이벤트를 만든다. 35% 확률로 발생 — 매번 일어나면
          // 예측 가능해져 긴장감이 떨어지므로 확률을 둔다. 라이벌
          // 세력이 실제로 현재 시나리오에 존재해야만(다른 시나리오의
          // 세력 이름이 잘못 끼어들지 않도록) 발생시킨다.
          const rivals = (factions[name]?.rivals || []).filter(r => names.includes(r));
          if(rivals.length && Math.random() < 0.35){
            const rival = rivals[Math.floor(Math.random()*rivals.length)];
            const bonus = 5 + Math.floor(Math.random()*8); // 5~12
            inf2[rival] = Math.min(100, (inf2[rival]||0) + bonus);
            events.push({
              a: rival, b: name, from:'chain', to:'opportunist', tension:0,
              msg: `🔗 ${name}의 혼란을 틈타 ${rival}이(가) 빈틈을 파고들며 영향력을 넓혔다 (+${bonus}).`,
              turn: now, isGoalEvent:true, isChainEvent:true,
            });
          }
        }
        saveWarInfluence(inf2);
        delete goals[name]; // 목표 완료/실패 후 일정 기간 휴식 (다음 턴에 새 목표 배정 가능)
      }
    });

    saveFactionGoals(goals);
    if(events.length){
      const sim = loadFactionSim();
      sim.history = [...events, ...sim.history].slice(0, 30);
      saveFactionSim(sim);
    }
    return events;
  }catch(e){ console.warn('[tickFactionGoals]', e); return []; }
}
window.tickFactionGoals = tickFactionGoals;

window.tickFactionGoals = tickFactionGoals;

window.loadFactionGoals = loadFactionGoals;

export function playerInterveneWar(factionA, factionB, side){
  // side: 'a' | 'b' | 'neutral' | 'mediate'
  const k = _simKey(factionA, factionB);
  const interv = loadWarInterv();
  const now = S.msgCount || 0;

  interv[k] = { side, since: now };
  saveWarInterv(interv);

  const factions = getCurrentFactions();
  const fa = factions[factionA]||{}, fb = factions[factionB]||{};
  const rep = loadFactionRep();

  const SIDE_DESC = {
    a:       `${fa.icon||''}${factionA} 편 참전`,
    b:       `${fb.icon||''}${factionB} 편 참전`,
    neutral: '중립 유지',
    mediate: '조정 시도'
  };

  // ── 조정 시도: 스탯 기반 판정 ──────────────────────────
  if(side === 'mediate'){
    const result = rollMediationCheck(factionA, factionB);
    const sim = loadFactionSim();
    const t = getSimTension(sim, factionA, factionB);
    sim.relations[k] = Math.max(0, Math.min(100, t + result.tensionChange));
    rep[factionA] = Math.min(100, (rep[factionA]||0) + result.repChange);
    rep[factionB] = Math.min(100, (rep[factionB]||0) + result.repChange);
    saveFactionRep(rep);
    saveFactionSim(sim);

    let resultMsg;
    if(result.crit){
      resultMsg = `양측이 즉각 화평에 응했다! 긴장도 -${Math.abs(result.tensionChange)}. 조정자로서 명성 폭등.`;
      toast(`조정 대성공! 긴장도 -${Math.abs(result.tensionChange)}`, 4000, result);
    } else if(result.success){
      resultMsg = `조정이 부분적으로 받아들여졌다. 긴장도 -${Math.abs(result.tensionChange)}.`;
      toast(`조정 성공! 긴장도 -${Math.abs(result.tensionChange)}`, 3000, result);
    } else if(result.critFail){
      resultMsg = `조정 시도가 역효과를 낳았다. 양측이 내정간섭자로 지목해 긴장도 +${result.tensionChange}.`;
      toast(`조정 대실패! 긴장도 +${result.tensionChange}`, 4000, result);
    } else {
      resultMsg = `조정 시도가 큰 효과를 내지 못했다. 소폭 긴장 완화에 그쳤다.`;
      toast(`조정 실패. 효과 미미.`, 3000, result);
    }

    showWarRollResult('🕊️ 외교 조정 판정', [
      `SPK ${result.spk} / NEG ${result.neg} / CHA ${result.cha} (평균 ${result.avgStat})`,
      `주사위: ${result.dice} &nbsp;/&nbsp; 기준치: ${result.threshold}`,
      `${result.icon} ${result.grade} — ${resultMsg}`
    ]);

    const simAfter = loadFactionSim();
    simAfter.history = [{ a:factionA, b:factionB, from:'war', to:'war',
      tension:getSimTension(simAfter,factionA,factionB),
      msg:`🕊️ 플레이어 조정 [${result.grade}]: ${resultMsg}`,
      turn:now, isIntervention:true }, ];
    saveFactionSim(simAfter);

    window._warActionCtx = {
      type:'mediate', fa:factionA, fb:factionB,
      grade:result.grade, resultMsg,
      aiHint: result.crit
        ? `플레이어가 ${factionA}와 ${factionB} 사이에서 극적인 외교 조정에 성공했다! 양측 대표가 놀라움을 감추지 못하며 협상 테이블에 앉는 장면을 묘사하십시오.`
        : result.success
        ? `플레이어가 외교 조정을 시도해 부분적으로 성과를 거뒀다. 긴장이 소폭 완화되는 장면을 묘사하십시오.`
        : result.critFail
        ? `플레이어의 조정 시도가 역효과를 냈다! 양측 모두 플레이어를 외부 간섭자로 여기며 전쟁 의지가 오히려 강해지는 장면을 묘사하십시오.`
        : `플레이어가 조정을 시도했으나 큰 효과를 내지 못했다. 양측이 냉담하게 반응하는 장면을 묘사하십시오.`
    };

    if(typeof renderFactionSimPanel === 'function'){
      const pb = document.getElementById('pb-factions');
      if(pb) renderFactionSimPanel(pb);
    }
    return;
  }

  // ── 참전(a/b) 평판 변화 ─────────────────────────────────
  if(side === 'a'){
    rep[factionA] = Math.min(100, (rep[factionA]||0) + 15);
    rep[factionB] = Math.max(-100, (rep[factionB]||0) - 10);
  } else if(side === 'b'){
    rep[factionB] = Math.min(100, (rep[factionB]||0) + 15);
    rep[factionA] = Math.max(-100, (rep[factionA]||0) - 10);
  }
  saveFactionRep(rep);

  // 참전 시 → 전쟁 행동 선택 UI 표시
  if(side === 'a' || side === 'b'){
    toast(`⚔️ [${SIDE_DESC[side]}] 선택됨 — 전투 행동을 선택하십시오!`, 2500);
    showWarActionPanel(factionA, factionB, side);
  } else {
    toast(`😐 [중립 유지] 선택됨`, 2500);
  }

  // 개입 선언 이벤트 히스토리
  const sim = loadFactionSim();
  const msg = side === 'a'   ? `🗡️ 플레이어가 ${fa.icon||''}${factionA} 편에 참전했다!`
            : side === 'b'   ? `🗡️ 플레이어가 ${fb.icon||''}${factionB} 편에 참전했다!`
            : `😐 플레이어가 ${factionA}↔${factionB} 전쟁에서 중립을 선언했다.`;
  sim.history = [{ a:factionA, b:factionB, from:'war', to:'war',
    tension:getSimTension(sim,factionA,factionB),
    msg, turn:now, isIntervention:true }, ];
  saveFactionSim(sim);

  if(typeof renderFactionSimPanel === 'function'){
    const pb = document.getElementById('pb-factions');
    if(pb) renderFactionSimPanel(pb);
  }
}
window.playerInterveneWar = playerInterveneWar;

export function showWarRollResult(title, lines){
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    background:#0a0500;border:2px solid var(--gold);padding:16px 18px;
    z-index:600;min-width:260px;max-width:320px;border-radius:3px;animation:fadeIn .25s ease`;
  el.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:2px;margin-bottom:10px">${title}</div>
    ${lines.map(l=>`<div style="font-size:12px;color:var(--text);line-height:1.6;margin-bottom:4px">${l}</div>`).join('')}
    <button onclick="this.parentElement.remove()" style="margin-top:10px;width:100%;padding:7px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid var(--gold);color:var(--gold);font-family:'Cinzel',serif;font-size:10px;cursor:pointer">확인</button>
  `;
  document.body.appendChild(el);
}
window.showWarRollResult = showWarRollResult;

export function showWarActionPanel(factionA, factionB, side){
  const existing = document.getElementById('war-action-panel');
  if(existing) existing.remove();

  const factions = getCurrentFactions();
  const fa = factions[factionA]||{}, fb = factions[factionB]||{};
  const mySide = side==='a' ? (fa.icon||'')+factionA : (fb.icon||'')+factionB;

  const panel = document.createElement('div');
  panel.id = 'war-action-panel';
  panel.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    width:94%;max-width:370px;z-index:550;
    background:#0a0500;border:2px solid #e03030;
    border-radius:3px;padding:14px;animation:fadeIn .3s ease;max-height:82vh;overflow-y:auto`;

  const actions = Object.values(WAR_ACTIONS);
  panel.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:10px;color:#e05050;letter-spacing:2px;margin-bottom:4px">⚔️ 전투 행동 선택</div>
    <div style="font-size:10px;color:var(--dim);margin-bottom:10px">${mySide} 편 참전 중 — 어떻게 싸울 것인가?</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      ${actions.map(a=>{
        const sv = Math.round(S.stats?.[a.stat]||50);
        const chance = Math.min(85, 30+Math.floor(sv*0.5));
        return `<button onclick="executeWarAction('${factionA}','${factionB}','${side}','${a.id}');document.getElementById('war-action-panel')?.remove()"
          style="padding:8px 6px;background:#140000;border:1px solid #e03030;color:var(--text);font-size:9px;cursor:pointer;font-family:'Cinzel',serif;text-align:left;line-height:1.5">
          <div style="font-size:13px;margin-bottom:2px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(a,{size:13}):(a.icon)} ${a.label}</div>
          <div style="color:var(--dim);font-size:8px">${a.desc}</div>
          <div style="color:#a06030;font-size:8px;margin-top:3px">${a.stat.toUpperCase()} ${sv} → 성공률 ${chance}%${a.selfRisk?' ⚠️위험':''}</div>
        </button>`;
      }).join('')}
    </div>
    <button onclick="this.parentElement.remove()" style="margin-top:10px;width:100%;padding:6px;background:none;border:1px solid #3a2a0a;color:var(--dim);font-family:'Cinzel',serif;font-size:9px;cursor:pointer">취소 (참전 유지, 행동 보류)</button>
  `;
  document.body.appendChild(panel);
}
window.showWarActionPanel = showWarActionPanel;

export function executeWarAction(factionA, factionB, side, actionId){
  const action = WAR_ACTIONS[actionId];
  if(!action) return;

  const k = _simKey(factionA, factionB);
  const result = rollWarCheck(action.stat, action.label);

  // 행동 데이터 저장
  const warAction = loadWarAction();
  warAction[k] = { actionId, side, roll:result, turn:S.msgCount||0 };
  saveWarAction(warAction);

  // 참전 효과: 행동 성공 시 적에게 추가 피해
  if(result.success){
    const inf = loadWarInfluence();
    const enemySide = side==='a' ? factionB : factionA;
    const bonus = result.crit ? action.dmgBonus*2 : action.dmgBonus;
    inf[enemySide] = (inf[enemySide]||0) + bonus;
    saveWarInfluence(inf);
  }

  // 위험 행동 실패 시 HP 패널티
  if(action.selfRisk && !result.success && S.stats){
    const penalty = result.critFail ? 15 : 8;
    S.stats.hp = Math.max(1, (S.stats.hp||100) - penalty);
    if(typeof window.updateHeader==='function') window.updateHeader();
  }

  // 행동 성공 시 아군 평판 보너스
  if(result.success){
    const rep = loadFactionRep();
    const mySide = side==='a' ? factionA : factionB;
    rep[mySide] = Math.min(100, (rep[mySide]||0) + (result.crit?8:4));
    saveFactionRep(rep);
  }

  let outcomeMsg;
  if(result.crit)        outcomeMsg = `완벽한 ${action.label}! 적에게 ${action.dmgBonus*2}의 결정타. 아군 사기 최고조.`;
  else if(result.success) outcomeMsg = `${action.label} 성공. 적에게 ${action.dmgBonus}의 피해.`;
  else if(result.critFail) outcomeMsg = `${action.label} 대실패! 역으로 HP -15. 위기 상황.`;
  else                    outcomeMsg = `${action.label} 실패. 원하는 결과를 얻지 못했다.`;

  showWarRollResult(`${action.icon} ${action.label} 판정`, [
    `${action.stat.toUpperCase()} ${result.statVal} &nbsp;→&nbsp; 기준치 ${result.threshold}`,
    `주사위: ${result.dice}`,
    `${result.icon} ${result.grade} — ${outcomeMsg}`
  ]);

  // AI 서술 컨텍스트 저장 (다음 메시지에 반영)
  window._warActionCtx = {
    type:'combat', actionId, fa:factionA, fb:factionB, side,
    grade:result.grade, outcomeMsg,
    aiHint: action.aiHint + ` 판정 결과: [${result.grade}] ${outcomeMsg}`
  };

  if(typeof renderFactionSimPanel === 'function'){
    const pb = document.getElementById('pb-factions');
    if(pb) renderFactionSimPanel(pb);
  }
}
window.executeWarAction = executeWarAction;

export function showWarInterventionBanner(factionA, factionB){
  const existing = document.getElementById('war-interv-banner');
  if(existing) existing.remove();

  const factions = getCurrentFactions();
  const fa = factions[factionA]||{}, fb = factions[factionB]||{};
  const k = _simKey(factionA, factionB);
  const interv = loadWarInterv();
  const current = interv[k];

  // 이미 개입 중이면 현재 상태 + 변경 버튼 표시
  const banner = document.createElement('div');
  banner.id = 'war-interv-banner';
  banner.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
    width:92%;max-width:360px;z-index:501;
    background:#140000;border:1px solid #e03030;
    border-radius:3px;padding:11px 13px;animation:fadeIn .3s ease;`;

  const infA = getEffectiveInfluence(factionA);
  const infB = getEffectiveInfluence(factionB);
  const dmgA = loadWarInfluence()[factionA]||0;
  const dmgB = loadWarInfluence()[factionB]||0;

  banner.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:9px;color:#e05050;letter-spacing:2px;margin-bottom:7px">
      ⚔️ 전쟁 진행 중 — 개입 선택 (참전 시 전투 행동 선택 가능)
    </div>
    <div style="display:flex;gap:10px;margin-bottom:8px;font-size:9px;color:var(--dim)">
      <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(fa,{size:16}):(fa.icon||"")}${factionA} 세력 ${infA} <span style="color:#e05050">(-${dmgA})</span></span>
      <span style="color:#e03030">VS</span>
      <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(fb,{size:16}):(fb.icon||"")}${factionB} 세력 ${infB} <span style="color:#e05050">(-${dmgB})</span></span>
    </div>
    ${current ? `<div style="font-size:9px;color:#a08060;margin-bottom:7px">현재: ${
      current.side==='a' ? `${fa.icon||''}${factionA} 편 참전` :
      current.side==='b' ? `${fb.icon||''}${factionB} 편 참전` :
      current.side==='mediate' ? '조정 시도 중' : '중립'
    }</div>` : ''}
    <div style="display:flex;gap:5px;flex-wrap:wrap">
      <button onclick="playerInterveneWar('${factionA}','${factionB}','a');document.getElementById('war-interv-banner')?.remove()"
        style="flex:1;padding:6px 4px;background:#1a0808;border:1px solid #e03030;color:#e05050;font-size:9px;cursor:pointer;font-family:'Cinzel',serif;min-width:70px">
        ⚔️ ${fa.icon||''}${factionA}<br>편 참전
      </button>
      <button onclick="playerInterveneWar('${factionA}','${factionB}','b');document.getElementById('war-interv-banner')?.remove()"
        style="flex:1;padding:6px 4px;background:#1a0808;border:1px solid #e03030;color:#e05050;font-size:9px;cursor:pointer;font-family:'Cinzel',serif;min-width:70px">
        ⚔️ ${fb.icon||''}${factionB}<br>편 참전
      </button>
      <button onclick="playerInterveneWar('${factionA}','${factionB}','mediate');document.getElementById('war-interv-banner')?.remove()"
        style="flex:1;padding:6px 4px;background:#0d1a0d;border:1px solid #50c050;color:#50c080;font-size:9px;cursor:pointer;font-family:'Cinzel',serif;min-width:70px">
        🕊️ 조정<br>시도
      </button>
      <button onclick="playerInterveneWar('${factionA}','${factionB}','neutral');document.getElementById('war-interv-banner')?.remove()"
        style="flex:1;padding:6px 4px;background:#0d0d0d;border:1px solid #3a3a3a;color:#6a6a6a;font-size:9px;cursor:pointer;font-family:'Cinzel',serif;min-width:70px">
        😐 중립<br>유지
      </button>
    </div>
    <button onclick="this.parentElement.remove()"
      style="position:absolute;top:6px;right:8px;background:none;border:none;color:var(--dim);font-size:14px;cursor:pointer">✕</button>
  `;
  document.body.appendChild(banner);
}
window.showWarInterventionBanner = showWarInterventionBanner;

export function renderFactionSimPanel(pb){
  const sim = loadFactionSim();
  const factions = getCurrentFactions();
  const names = Object.keys(factions);
  const rep = loadFactionRep();

  // 현재 모든 쌍의 관계 상태 수집
  const pairs = [];
  for(let i=0; i<names.length; i++){
    for(let j=i+1; j<names.length; j++){
      const a=names[i], b=names[j];
      const t = getSimTension(sim, a, b);
      const s = getSimStatus(t);
      pairs.push({ a, b, fa:factions[a], fb:factions[b], t, s });
    }
  }
  pairs.sort((x,y)=>y.t-x.t); // 긴장도 높은 순

  const history = (sim.history||[]);

  pb.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <button onclick="window._factionView='list';renderFactionPanel()"
        style="background:none;border:1px solid var(--border);color:var(--dim);font-size:10px;padding:3px 8px;cursor:pointer;font-family:'Cinzel',serif">◀ 목록</button>
      <span style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold)">🌐 세력 관계도</span>
      <button onclick="forceFactionTick()" title="세력 동향 갱신"
        style="margin-left:auto;background:none;border:1px solid var(--border);color:var(--dim);font-size:9px;padding:3px 8px;cursor:pointer;font-family:'Cinzel',serif">⟳ 갱신</button>
    </div>

    <!-- 세력 관계 목록 -->
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:6px">⚖️ 현재 세력 간 긴장도</div>
    ${(()=>{
      const warInf   = loadWarInfluence();
      const warInterv= loadWarInterv();
      return pairs.slice(0,12).map(p=>{
        const pct  = p.t;
        const mk   = _simKey(p.a, p.b);
        const pm   = (sim.warMeta||{})[mk] || {};
        const nowT = S.msgCount||0;
        const isWar = p.s.code === 'war';

        // 잠금 배지
        const warLockLeft   = isWar && pm.warStart !== undefined ? Math.max(0, 20-(nowT-pm.warStart)) : 0;
        const ceaseLockLeft = pm.ceasefireAt !== undefined ? Math.max(0, 20-(nowT-pm.ceasefireAt)) : 0;
        const lockBadge = warLockLeft > 0
          ? `<span style="font-size:8px;color:#e05050;margin-left:4px">🔒 휴전불가 ${warLockLeft}턴</span>`
          : ceaseLockLeft > 0
          ? `<span style="font-size:8px;color:#50a0e0;margin-left:4px">🕊️ 재전쟁불가 ${ceaseLockLeft}턴</span>`
          : '';

        // 전쟁 피해 표시
        const dmgA = warInf[p.a]||0;
        const dmgB = warInf[p.b]||0;
        const effA = getEffectiveInfluence(p.a);
        const effB = getEffectiveInfluence(p.b);
        const warDmgBar = isWar ? `
          <div style="margin:4px 0 2px;display:flex;gap:6px;align-items:center">
            <span style="font-size:8px;color:var(--dim);min-width:30px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(p.fa,{size:8}):(p.fa.icon||"⚑")}</span>
            <div style="flex:1;height:3px;background:#2a0000;border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${Math.min(100,Math.round(effA/((p.fa.influence||50))*100))}%;background:#60a060;border-radius:2px;transition:width .4s"></div>
            </div>
            <span style="font-size:8px;color:#e05050;min-width:28px;text-align:right">-${dmgA}</span>
            <span style="font-size:9px;color:#e05050">VS</span>
            <span style="font-size:8px;color:#e05050;min-width:28px">-${dmgB}</span>
            <div style="flex:1;height:3px;background:#2a0000;border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${Math.min(100,Math.round(effB/((p.fb.influence||50))*100))}%;background:#60a060;border-radius:2px;transition:width .4s"></div>
            </div>
            <span style="font-size:8px;color:var(--dim);min-width:30px;text-align:right">${typeof getEntityIconHTML==='function'?getEntityIconHTML(p.fb,{size:8}):(p.fb.icon||"⚑")}</span>
          </div>` : '';

        // 개입 상태 + 버튼
        const iv = warInterv[mk];
        const ivLabel = !iv ? '' :
          iv.side==='a'       ? `<span style="font-size:8px;color:#e09040">⚔️ ${p.a} 참전 중</span>` :
          iv.side==='b'       ? `<span style="font-size:8px;color:#e09040">⚔️ ${p.b} 참전 중</span>` :
          iv.side==='mediate' ? `<span style="font-size:8px;color:#50c080">🕊️ 조정 중</span>` :
                                `<span style="font-size:8px;color:var(--dim)">😐 중립</span>`;
        const intervBtn = isWar
          ? `<button onclick="showWarInterventionBanner('${p.a}','${p.b}')"
              style="margin-top:5px;width:100%;padding:4px;background:#1a0808;border:1px solid #503030;color:#c06050;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;letter-spacing:1px">
              ⚔️ 전쟁 개입 선택 ${ivLabel ? '('+iv.side+')' : ''}
            </button>` : '';

        return `<div style="border:1px solid ${isWar?'#503030':'var(--border)'};background:${isWar?'#0d0303':'var(--bg-input)'};margin-bottom:4px;padding:7px 10px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(p.fa,{size:12}):(p.fa.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);flex:1">${p.a}</span>
            <span style="font-size:10px;color:${p.s.color};font-family:'Cinzel',serif">${p.s.label}</span>
            ${lockBadge}
            <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(p.fb,{size:12}):(p.fb.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold)">${p.b}</span>
          </div>
          <div style="position:relative;height:5px;background:var(--bg-screen);border-radius:3px;overflow:hidden">
            <div style="position:absolute;left:0;top:0;height:100%;width:${pct}%;background:${p.s.color};border-radius:3px;transition:width .4s"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:2px">
            <span style="font-size:8px;color:var(--dim)">평화</span>
            <span style="font-size:8px;color:var(--dim)">긴장도 ${Math.round(p.t)}</span>
            <span style="font-size:8px;color:var(--dim)">전쟁</span>
          </div>
          ${warDmgBar}
          ${intervBtn}
        </div>`;
      }).join('');
    })()}

    <!-- 최근 사건 로그 -->
    ${history.length ? `
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin:10px 0 6px">📜 세력 동향 기록</div>
    ${history.map(e=>`
    <div style="border-left:2px solid ${getSimStatus(e.tension||50).color};padding:5px 8px;margin-bottom:4px;background:var(--bg-input);font-size:10px;color:var(--dim);line-height:1.4">
      ${e.msg}
      <div style="font-size:8px;color:var(--dim);margin-top:2px">Turn ${e.turn||'?'}</div>
    </div>`).join('')}` : ''}

    <div style="margin-top:8px;padding:7px;background:var(--bg-screen);border:1px dashed var(--border);font-size:9px;color:var(--dim);line-height:1.5">
      💡 매 턴 긴장도가 ±1~3 변동하며, 15% 확률로 ±8~15 급변 이벤트 발생. 전쟁 후 최소 20턴 휴전불가, 휴전 후 20턴간 재전쟁불가. 전쟁 종료 시 긴장도 초기화.
    </div>
  `;
}
window.renderFactionSimPanel = renderFactionSimPanel;

export function forceFactionTick(){
  const events = tickFactionSimulation();
  if(events && events.length){
    showFactionNewsToast(events);
  } else {
    toast('세력 동향: 특이사항 없음', 1500);
  }
  if(window._factionView === 'sim') renderFactionSimPanel(document.getElementById('pb-factions'));
}
window.forceFactionTick = forceFactionTick;

export const FACTION_INTERACT_KEY = 'tf-faction-interact';

export function loadFactionInteract(){ try{ return JSON.parse(lsGet(FACTION_INTERACT_KEY)||'{}'); }catch(e){ return {}; } }
window.loadFactionInteract = loadFactionInteract;

export function saveFactionInteract(d){ try{ lsSet(FACTION_INTERACT_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFactionInteract = saveFactionInteract;

export function getFactionRelation(nameA, nameB){
  const factions = getCurrentFactions();
  const fa = factions[nameA]; const fb = factions[nameB];
  if(!fa || !fb) return 'neutral';
  const inter = loadFactionInteract();
  const key = [nameA, nameB].sort().join('||');
  if(inter[key]) return inter[key];
  if((fa.allies||[]).includes(nameB) || (fb.allies||[]).includes(nameA)) return 'ally';
  if((fa.rivals||[]).includes(nameB) || (fb.rivals||[]).includes(nameA)) return 'rival';
  return 'neutral';
}
window.getFactionRelation = getFactionRelation;

export function setFactionRelation(nameA, nameB, rel){
  const inter = loadFactionInteract();
  const key = [nameA, nameB].sort().join('||');
  inter[key] = rel;
  saveFactionInteract(inter);
}
window.setFactionRelation = setFactionRelation;

export let _factionSelected = null;

window._factionView = 'list';

export function renderFactionPanel(){
  const pb = document.getElementById('pb-factions');
  if(!pb) return;

  if(window._factionView === 'sim'){
    renderFactionSimPanel(pb);
  } else if(window._factionView === 'rumor'){
    pb.innerHTML = renderNpcRumorPanel ? renderNpcRumorPanel() : '<div style="color:var(--dim);font-size:10px;text-align:center;padding:15px">불러오는 중...</div>';
  } else if(window._factionView === 'interact' && _factionSelected){
    renderFactionInteract(pb);
  } else if(window._factionView === 'detail' && _factionSelected){
    renderFactionDetail(pb);
  } else {
    window._factionView = 'list';
    renderFactionList(pb);
  }
}
window.renderFactionPanel = renderFactionPanel;

export function renderFactionList(pb){
  const factions = getCurrentFactions();
  const rep = loadFactionRep();
  const sid = S?.scenario?.id || 'medieval';
  const scenarioLabel = { medieval:'⚔️ 중세 판타지' }[sid] || sid;
  const repLabel = (r) => r>=50?'동맹 🤝':r>=20?'우호 👍':r>=-20?'중립 ⚖️':r>=-50?'적대 ⚠️':'전쟁 ☠️';
  const repColor = (r) => r>=50?'#50c050':r>=20?'#80b040':r>=-20?'#a09060':r>=-50?'#d06030':'#e03030';

  pb.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border)">
      <span style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;flex:1">${scenarioLabel} · ${Object.keys(factions).length}개 세력</span>
      <button onclick="window._factionView='rumor';renderFactionPanel()"
        style="padding:4px 8px;background:#0d0800;border:1px solid #3a2a10;color:#9a8a5a;font-size:9px;font-family:Cinzel,serif;cursor:pointer;border-radius:1px;margin-bottom:6px;width:100%">
        🗣️ 소문 & 첩보 듣기
      </button>
      <button onclick="window._factionView='sim';renderFactionPanel()"
        style="background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-size:9px;padding:3px 8px;cursor:pointer;font-family:'Cinzel',serif">🌐 관계도</button>
      <button onclick="if(typeof renderFactionPowerPanel==='function') renderFactionPowerPanel();"
        style="background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-size:9px;padding:3px 8px;cursor:pointer;font-family:'Cinzel',serif;margin-left:4px">📊 힘의 구도</button>
    </div>
    ${Object.entries(factions).map(([name, f])=>{
      const r = rep[name]||0;
      const pct = Math.round((r+100)/2);
      const col = repColor(r);
      return `
      <div onclick="window._factionSelected='${name.replace(/'/g,"\\'")}';window._factionView='detail';renderFactionPanel()"
           style="border:1px solid var(--border);background:var(--bg-input);margin-bottom:6px;padding:9px 11px;border-left:3px solid ${f.color};cursor:pointer;transition:all .15s"
           onmouseover="this.style.borderColor='${f.color}'" onmouseout="this.style.borderColor='var(--border)'">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="color:${f.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(f,{size:16}):(f.svgIcon||f.icon)}</span>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Cinzel',serif;font-size:11px;color:var(--gold)">${name}</div>
            <div style="font-size:9px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.desc}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:9px;color:${col};font-family:'Cinzel',serif">${repLabel(r)}</div>
            <div style="font-size:9px;color:var(--dim)">${r>0?'+':''}${r}</div>
          </div>
        </div>
        <div style="height:3px;background:var(--bg-screen);border-radius:2px;margin-top:6px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${col};border-radius:2px"></div>
        </div>
      </div>`;
    }).join('')}
    <div style="margin-top:8px;padding:8px;background:var(--bg-screen);border:1px dashed var(--border);font-size:9px;color:var(--dim);line-height:1.6">
      💡 세력 카드를 탭하면 상세 정보가 열립니다. 🌐 관계도에서 세력 간 전쟁·동맹 현황을 확인하세요.
    </div>`;
}
window.renderFactionList = renderFactionList;

export function renderFactionDetail(pb){
  const factions = getCurrentFactions();
  const rep = loadFactionRep();
  const name = _factionSelected;
  const f = factions[name];
  if(!f){ window._factionView='list'; renderFactionList(pb); return; }

  const r = rep[name]||0;
  const pct = Math.round((r+100)/2);
  const repLabel = (r) => r>=50?'동맹 🤝':r>=20?'우호 👍':r>=-20?'중립 ⚖️':r>=-50?'적대 ⚠️':'전쟁 ☠️';
  const repColor = (r) => r>=50?'#50c050':r>=20?'#80b040':r>=-20?'#a09060':r>=-50?'#d06030':'#e03030';
  const col = repColor(r);

  // 다른 세력과의 현재 관계 목록
  const relRows = Object.entries(factions).filter(([n])=>n!==name).map(([n, g])=>{
    const rel = getFactionRelation(name, n);
    const rg = rep[n]||0;
    const relIcon = rel==='ally'?'🤝':rel==='rival'?'⚔️':'⚪';
    // [B49 FIX] 두 번째 조건이 '적대 관계'==='rival'(고정 문자열끼리 비교하는
    // 항상 거짓인 식)이라 rel==='rival'이어도 마지막 분기(중립)로 떨어지던 버그.
    const relLabel = rel==='ally'?'동맹':rel==='rival'?'라이벌':'중립';
    return `<div style="display:flex;align-items:center;gap:6px;padding:4px 6px;margin-bottom:3px;background:var(--bg-input);border-radius:2px;font-size:9px;cursor:pointer"
      onclick="window._factionSelected='${name.replace(/'/g,"\\'")}';window._factionTarget='${n.replace(/'/g,"\\'")}';window._factionView='interact';renderFactionPanel()">
      <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(g,{size:12}):(g.icon)}</span>
      <span style="flex:1;color:var(--gold);font-family:'Cinzel',serif">${n}</span>
      <span style="color:${repColor(rg)}">${rg>0?'+':''}${rg}</span>
      <span style="margin-left:4px">${relIcon}</span>
      <span style="color:var(--dim);margin-left:2px">▶</span>
    </div>`;
  }).join('');

  pb.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <button onclick="window._factionView='list';renderFactionPanel()"
        style="background:none;border:1px solid var(--border);color:var(--dim);font-size:10px;padding:3px 8px;cursor:pointer;font-family:'Cinzel',serif">◀ 목록</button>
      <span style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);flex:1">${typeof getEntityIconHTML==='function'?getEntityIconHTML(f,{size:10}):(f.icon)} ${name}</span>
    </div>

    <!-- 호감도 -->
    <div style="border:1px solid var(--border);background:var(--bg-input);padding:10px 12px;border-left:3px solid ${f.color};margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-family:'Cinzel',serif;font-size:10px;color:${col}">${repLabel(r)}</span>
        <span style="font-size:11px;color:${col};font-weight:bold">${r>0?'+':''}${r}</span>
      </div>
      <div style="height:5px;background:var(--bg-screen);border-radius:3px;overflow:hidden;margin-bottom:8px">
        <div style="height:100%;width:${pct}%;background:${col};border-radius:3px;transition:width .4s"></div>
      </div>
      <!-- 행동 버튼 -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
        <button onclick="updateFactionRep('${name.replace(/'/g,"\\'")}',5);renderFactionPanel()"
          style="padding:5px 0;background:var(--bg-screen);border:1px solid #1a4a1a;color:#40a040;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">▲ +5</button>
        <button onclick="updateFactionRep('${name.replace(/'/g,"\\'")}',20);renderFactionPanel()"
          style="padding:5px 0;background:var(--bg-screen);border:1px solid #2a5a2a;color:#50c050;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">▲▲ +20</button>
        <button onclick="updateFactionRep('${name.replace(/'/g,"\\'")}',50);renderFactionPanel()"
          style="padding:5px 0;background:var(--bg-screen);border:1px solid #3a7a3a;color:#70e070;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">★ +50</button>
        <button onclick="updateFactionRep('${name.replace(/'/g,"\\'")}', -5);renderFactionPanel()"
          style="padding:5px 0;background:var(--bg-screen);border:1px solid #4a1a1a;color:#c04040;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">▼ -5</button>
        <button onclick="updateFactionRep('${name.replace(/'/g,"\\'")}', -20);renderFactionPanel()"
          style="padding:5px 0;background:var(--bg-screen);border:1px solid #5a2a2a;color:#e05050;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">▼▼ -20</button>
        <button onclick="updateFactionRep('${name.replace(/'/g,"\\'")}', -50);renderFactionPanel()"
          style="padding:5px 0;background:var(--bg-screen);border:1px solid #7a1a1a;color:#ff4040;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">☠ -50</button>
      </div>
    </div>

    <!-- 영향력 & 로어 -->
    <div style="border:1px solid var(--border);background:var(--bg-input);padding:9px 11px;border-left:3px solid ${f.color};margin-bottom:8px">
      <div style="display:flex;gap:4px;align-items:center;margin-bottom:7px">
        <span style="font-size:9px;color:var(--dim);width:36px;font-family:'Cinzel',serif">영향력</span>
        <div style="flex:1;height:4px;background:var(--bg-screen);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${f.influence||50}%;background:${f.color};border-radius:2px"></div>
        </div>
        <span style="font-size:9px;color:var(--dim);width:22px;text-align:right">${f.influence||50}</span>
      </div>
      <div style="font-size:10px;color:var(--dim);line-height:1.5;margin-bottom:6px">${f.lore||''}</div>
      ${f.capital?`<div style="display:flex;gap:7px;padding:6px 8px;background:var(--bg-screen);border:1px solid ${f.color}33;border-radius:2px">
        <span style="font-size:13px;line-height:1.4">${typeof getEntityIconHTML==='function'?getEntityIconHTML(f.capital,{size:13}):(f.capital.icon)}</span>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:9px;color:${f.color};margin-bottom:1px">📍 ${f.capital.name}</div>
          <div style="font-size:9px;color:var(--dim);line-height:1.4">${f.capital.desc}</div>
        </div>
      </div>`:''}
    </div>

    <!-- 타 세력 상호작용 -->
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:6px">⚖️ 타 세력과 상호작용</div>
    ${relRows}
  `;
}
window.renderFactionDetail = renderFactionDetail;

export function renderFactionInteract(pb){
  const factions = getCurrentFactions();
  const rep = loadFactionRep();
  const nameA = _factionSelected;
  const nameB = window._factionTarget;
  const fa = factions[nameA]; const fb = factions[nameB];
  if(!fa || !fb){ window._factionView='detail'; renderFactionDetail(pb); return; }

  const repColor = (r) => r>=50?'#50c050':r>=20?'#80b040':r>=-20?'#a09060':r>=-50?'#d06030':'#e03030';
  const repLabel = (r) => r>=50?'동맹 🤝':r>=20?'우호 👍':r>=-20?'중립 ⚖️':r>=-50?'적대 ⚠️':'전쟁 ☠️';
  const currentRel = getFactionRelation(nameA, nameB);
  const relColor = currentRel==='ally'?'#50c080':currentRel==='rival'?'#e05050':'#a09060';
  const relText = currentRel==='ally'?'🤝 동맹 관계':currentRel==='rival'?'⚔️ 라이벌 관계':'⚪ 중립 관계';

  // 세력 간 상호작용 액션 정의
  const actions = [
    { id:'trade',    icon:'💱', label:'교역 협정',    desc:'두 세력 간 교역로를 개설. 양측 경제력과 영향력이 소폭 상승.',  relChange:'ally',    repA:8, repB:8,  condition: null },
    { id:'alliance', icon:'🤝', label:'동맹 체결',    desc:'정식 동맹 조약. 한 쪽이 공격받으면 다른 쪽도 참전.',        relChange:'ally',    repA:15, repB:15, condition: null },
    { id:'spy',      icon:'🕵️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="3.2"/><circle cx="17" cy="12" r="3.2"/><path d="M12.2 12 L13.8 12" /><path d="M5.8 12 L2 11" /><path d="M20.2 12 L22 11" /><path d="M9 15.2 C9 15.2 7 20 5 20" /></svg>`, label:'첩자 파견',    desc:`${nameA}의 첩자를 ${nameB}에 심는다. 정보 획득, 관계 악화 위험.`, relChange:null, repA:5, repB:-10, condition: null },
    { id:'sabotage', icon:'🔥', label:'공작 활동',    desc:`${nameB}의 핵심 시설을 파괴. 영향력 타격, 전면 갈등 위험.`,  relChange:'rival',   repA:5, repB:-20, condition: null },
    { id:'war',      icon:'⚔️', label:'전쟁 선포',    desc:'전면전 개시. 양측 모두 막대한 피해. 관계 최악으로 치달음.',  relChange:'rival',   repA:-10, repB:-30, condition: null },
    { id:'peace',    icon:'🕊️', label:'평화 협상',    desc:'적대 관계를 청산. 중립으로 복귀. 양측 신뢰 회복 시작.',     relChange:'neutral', repA:10, repB:10, condition: null },
    { id:'mediate',  icon:'⚖️', label:'중재 개입',    desc:'플레이어가 두 세력 사이에 서서 갈등을 중재. 양측 호감 상승.',relChange:'neutral', repA:12, repB:12, condition: null },
    { id:'pressure', icon:'👊', label:'압박 외교',    desc:`${nameA}의 힘을 빌어 ${nameB}를 압박. 양보 획득 또는 관계 파탄.`, relChange:null, repA:3, repB:-15, condition: null },
    { id:'intel',    icon:'📜', label:'정보 공유',    desc:'비밀 정보를 넘겨 신뢰를 구축. 공동의 적에 대한 협력 시작.',  relChange:null,      repA:8, repB:10, condition: null },
    { id:'tribute',  icon:'💰', label:'공물 헌납',    desc:`${nameA}가 ${nameB}에게 공물을 바쳐 호감을 크게 높인다.`,   relChange:null,      repA:-5, repB:25, condition: null },
  ];

  const rA = rep[nameA]||0; const rB = rep[nameB]||0;

  pb.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <button onclick="window._factionView='detail';renderFactionPanel()"
        style="background:none;border:1px solid var(--border);color:var(--dim);font-size:10px;padding:3px 8px;cursor:pointer;font-family:'Cinzel',serif">◀ 상세</button>
      <span style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);flex:1">세력 상호작용</span>
    </div>

    <!-- 두 세력 현황 -->
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <div style="flex:1;border:1px solid var(--border);background:var(--bg-input);padding:8px;border-left:3px solid ${fa.color};text-align:center">
        <div style="display:flex;justify-content:center;color:${fa.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(fa,{size:16}):(fa.svgIcon||fa.icon)}</div>
        <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);margin:3px 0">${nameA}</div>
        <div style="font-size:9px;color:${repColor(rA)}">${rA>0?'+':''}${rA}</div>
        <div style="height:3px;background:var(--bg-screen);border-radius:2px;margin-top:4px;overflow:hidden">
          <div style="height:100%;width:${Math.round((rA+100)/2)}%;background:${repColor(rA)};border-radius:2px"></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:44px">
        <div style="font-size:14px">${currentRel==='ally'?'🤝':currentRel==='rival'?'⚔️':'⚪'}</div>
        <div style="font-size:8px;color:${relColor};text-align:center;margin-top:2px;font-family:'Cinzel',serif">${currentRel==='ally'?'동맹':currentRel==='rival'?'라이벌':'중립'}</div>
      </div>
      <div style="flex:1;border:1px solid var(--border);background:var(--bg-input);padding:8px;border-left:3px solid ${fb.color};text-align:center">
        <div style="display:flex;justify-content:center;color:${fb.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(fb,{size:16}):(fb.svgIcon||fb.icon)}</div>
        <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);margin:3px 0">${nameB}</div>
        <div style="font-size:9px;color:${repColor(rB)}">${rB>0?'+':''}${rB}</div>
        <div style="height:3px;background:var(--bg-screen);border-radius:2px;margin-top:4px;overflow:hidden">
          <div style="height:100%;width:${Math.round((rB+100)/2)}%;background:${repColor(rB)};border-radius:2px"></div>
        </div>
      </div>
    </div>

    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:6px">🎲 상호작용 선택</div>

    ${actions.map(a=>`
    <div style="border:1px solid var(--border);background:var(--bg-input);margin-bottom:5px;padding:8px 10px;cursor:pointer;transition:all .15s"
      onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border)'"
      onclick="doFactionInteract('${nameA.replace(/'/g,"\\'")}','${nameB.replace(/'/g,"\\'")}','${a.id}','${a.relChange||''}',${a.repA},${a.repB})">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:3px">
        <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(a,{size:14}):(a.icon)}</span>
        <span style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);flex:1">${a.label}</span>
        <span style="font-size:8px;color:#50c050">${a.repA>=0?'+':''}${a.repA}</span>
        <span style="font-size:8px;color:var(--dim)">/</span>
        <span style="font-size:8px;color:${a.repB>=0?'#50c050':'#e05050'}">${a.repB>=0?'+':''}${a.repB}</span>
      </div>
      <div style="font-size:9px;color:var(--dim);line-height:1.4">${a.desc}</div>
    </div>`).join('')}

    <div style="margin-top:6px;padding:7px;background:var(--bg-screen);border:1px dashed var(--border);font-size:9px;color:var(--dim);line-height:1.5">
      💡 상호작용은 AI 서사에 자동 반영됩니다. 좌측 수치는 <span style="color:var(--gold)">${nameA}</span>의 호감 변화, 우측은 <span style="color:var(--gold)">${nameB}</span>의 호감 변화입니다.
    </div>
  `;
}
window.renderFactionInteract = renderFactionInteract;

export function doFactionInteract(nameA, nameB, actionId, relChange, repA, repB){
  // 호감도 변경
  updateFactionRep(nameA, repA);
  updateFactionRep(nameB, repB);

  // 관계 변경
  if(relChange) setFactionRelation(nameA, nameB, relChange);

  // 행동 라벨 매핑
  const labels = {
    trade:'💱 교역 협정', alliance:'🤝 동맹 체결', spy:'🕵️ 첩자 파견', sabotage:'🔥 공작 활동',
    war:'⚔️ 전쟁 선포', peace:'🕊️ 평화 협상', mediate:'⚖️ 중재 개입', pressure:'👊 압박 외교',
    intel:'📜 정보 공유', tribute:'💰 공물 헌납'
  };
  const label = labels[actionId]||actionId;
  const relLabels = {ally:'동맹', rival:'라이벌', neutral:'중립'};
  const relTxt = relChange ? ` → 관계: ${relLabels[relChange]||relChange}` : '';

  toast(`${label}: ${nameA}(${repA>=0?'+':''}${repA}) / ${nameB}(${repB>=0?'+':''}${repB})${relTxt}`, 3000);

  // 이벤트 로그에 추가 (있는 경우)
  if(typeof addEventLog === 'function'){
    if(typeof addEventLog==='function') addEventLog(`[세력 상호작용] ${label} — ${nameA} ↔ ${nameB}${relTxt}`);
  }

  renderFactionPanel();
}
window.doFactionInteract = doFactionInteract;
