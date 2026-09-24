// 레벨업 + 스탯 포인트 배분 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { _addTimelineOnLevelUp, addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { EPIC_QUEST_CHAINS, SKILL_DEFS, SKILL_TREE, STAT_POINT_ALLOC_KEYS } from '../data/009-레벨업-스탯-포인트-배분-시스템.js';
import { STAT_DEFS } from '../data/010-스킬-강화-시스템.js';
import { DRAGON_BALANCE_PHASES } from '../data/020-101130번-환생-누적-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RC } from '../data/086-퀘스트임무-수락-팝업-시스템.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { saveSkillSP } from '../job/002-스킬-시스템.js';
import { EXP_KEY, getAllClearSkillDefs, loadPlayerExp, loadPlayerLevel, savePlayerExp, savePlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { getAllBaseJobs } from '../job/042-직업-시스템-무한-파생-도감.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { CELESTIAL_COVENANT_STAGES, DEMON_CORRUPTION_STAGES, VAMPIRE_CHRONICLE_STAGES, loadVampireChronicle } from '../progression/020-101130번-환생-누적-시스템.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { RACE_DEFS } from '../race/013-종족-시스템.js';
import { clearStatusEffects, saveStatusEffects } from '../ui/155-⑭-메모리-패널-UI.js';
import { esc, lsDel, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { _markDirty, saveStatsSplit } from './001-block0-preamble.js';
import { getPlayerMaxHp, getPlayerMaxMp } from './054-이동수단-시스템.js';
import { saveDiaryEntry } from './076-파트2-D-일기기록-시스템.js';
import { gainEvoEnergy, isEvoJob } from './206-3-진화Evolution-시스템.js';

export const STAT_POINT_KEY = 'tf-stat-points';

export function loadStatPoints(){ try{ return parseInt(lsGet(STAT_POINT_KEY)||'0'); }catch(e){ return 0; } }
window.loadStatPoints = loadStatPoints;

export function saveStatPoints(n){ lsSet(STAT_POINT_KEY, String(n)); }
window.saveStatPoints = saveStatPoints;

export function expToNextLevel(level){
  return Math.floor(120 * Math.pow(1.55, level - 1)); // 난이도 상향: 레벨업이 더 어려워짐
}
window.expToNextLevel = expToNextLevel;

export function calcLevelFromExp(totalExp){
  let level = 1, remaining = totalExp;
  // [F-10 FIX] 레벨을 정확히 999로 캡 (999 이상이 되면 루프 중단)
  while(remaining >= expToNextLevel(level) && level < 999){
    remaining -= expToNextLevel(level);
    level++;
  }
  level = Math.min(999, level); // 방어적 캡
  return { level, remaining, needed: expToNextLevel(level) };
}
window.calcLevelFromExp = calcLevelFromExp;

export function gainExp(amount){ return addExp(amount); }
window.gainExp = gainExp;

window.gainExp = gainExp;

export const EPIC_QUEST_KEY = 'tf-epic-quest-state';

export function loadEpicState(){ try{ return JSON.parse(lsGet(EPIC_QUEST_KEY)||'{}'); }catch(e){ return {}; } }
window.loadEpicState = loadEpicState;

export function saveEpicState(d){ try{ lsSet(EPIC_QUEST_KEY, JSON.stringify(d)); }catch(e){} }
window.saveEpicState = saveEpicState;

export function checkEpicQuests(cleanText){
  if(!cleanText) return;
  try{
    const text = String(cleanText);
    const state = loadEpicState();
    let changed = false;

    EPIC_QUEST_CHAINS.forEach(chain=>{
      const cs = state[chain.id] || { started:false, completed:false, completedSteps:[], currentStep:chain.steps[0].id };
      if(cs.completed) { state[chain.id]=cs; return; }

      const stepIdx = chain.steps.findIndex(s=>s.id===cs.currentStep);
      const step = chain.steps[stepIdx>=0?stepIdx:0];
      if(!step) { state[chain.id]=cs; return; }

      const matched = (step.keywords||[]).some(kw=>text.includes(kw));
      if(matched && !cs.completedSteps.includes(step.id)){
        cs.started = true;
        cs.completedSteps = [...cs.completedSteps, step.id];
        // [버그 수정] renderEpicQuestPanel/renderQuests가 'taleforge-quest-history'를
        // qid(=여기서는 step.id) 기준으로 읽어 "완료 단계 기록"을 표시하는데,
        // 이 키에 실제로 기록을 남기는 곳이 코드베이스 어디에도 없어 그
        // 표시 영역이 게임 전체에서 항상 비어있었다(전수조사로 발견).
        // 스텝이 완료되는 바로 이 시점에 네이티브로 기록한다.
        // [2026-09-24, 27번 섹션] 캡을 200→800으로 올림 — quest/086의
        // recordQuestProgressTurn()이 이제 같은 키에 AI 동적 퀘스트·히든
        // 퀘스트 기록까지 매 턴 같이 쌓기 시작해서, 여기 캡이 그대로 200이면
        // 스텝 완료 이벤트가 발생할 때마다 방금 쌓인 넓은 범위 기록을
        // 도로 잘라내 버린다 — 같은 배열을 쓰는 두 작성자의 캡을 맞췄다.
        try{
          const qHist = JSON.parse(lsGet('taleforge-quest-history')||'[]');
          qHist.push({ qid: step.id, turn: S.msgCount||0, scene: text.slice(0,150) });
          lsSet('taleforge-quest-history', JSON.stringify(qHist.slice(-800)));
        }catch(e){}
        const nextIdx = stepIdx + 1;
        if(nextIdx >= chain.steps.length){
          cs.completed = true;
          cs.currentStep = null;
          setTimeout(()=>toastHTML(`⚔️ 대서사시 완결: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(chain,{size:14}):(chain.icon)} ${esc(chain.title)}!`, 4500), 1000);
          // 완결 보상: SP 3 + 골드 500
          S.skillSP = (S.skillSP||0) + 3;
          if(typeof saveSkillSP==='function') saveSkillSP(S.skillSP);
          S.gold = (S.gold||0) + 500;
          if(typeof saveGold==='function') saveGold(S.gold);
          if(typeof window.updateHeader==='function') window.updateHeader();
        } else {
          cs.currentStep = chain.steps[nextIdx].id;
          setTimeout(()=>toast(`⚔️ ${chain.title}: ${step.title} 진행!`, 3500), 1000);
        }
        changed = true;
      }
      state[chain.id] = cs;
    });

    if(changed) saveEpicState(state);
  }catch(e){ console.warn('[checkEpicQuests 오류]', e); }
}
window.checkEpicQuests = checkEpicQuests;

window.loadEpicState = loadEpicState;

window.saveEpicState = saveEpicState;

window.checkEpicQuests = checkEpicQuests;

export function renderEpicQuestPanel(){
  const body = document.getElementById('pb-epic');
  if(!body) return;
  const epicState = loadEpicState();
  let _qHistory = [];
  try{ _qHistory = JSON.parse(lsGet('taleforge-quest-history')||'[]'); }catch(e){}
  const histByQid = {};
  _qHistory.forEach(h=>{ if(!histByQid[h.qid]) histByQid[h.qid]=[]; histByQid[h.qid].push(h); });

  const cards = EPIC_QUEST_CHAINS.map(chain=>{
    const cs = epicState[chain.id] || {};
    const started = !!cs.started;
    const done = !!cs.completed;
    const col = done ? '#60a060' : started ? 'var(--gold)' : 'var(--dim)';
    const pct = started ? Math.round((cs.completedSteps?.length||0)/chain.steps.length*100) : 0;
    const curStep = started && !done ? chain.steps.find(s=>s.id===cs.currentStep) : null;
    const stepHist = (cs.completedSteps||[]).flatMap(sid=>histByQid[sid]||[]);

    if(!started){
      return `<div style="padding:10px 11px;background:#0a0800;border:1px solid #2a1a05;border-left:3px solid var(--dim);margin-bottom:8px;opacity:0.7">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <span style="font-size:18px;filter:grayscale(1)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(chain,{size:18}):(chain.icon)}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--dim)">${esc(chain.title)}</div>
            <div style="font-size:8px;color:var(--dim)">미발견</div>
          </div>
        </div>
        <div style="font-size:9px;color:var(--dim)">${esc(chain.desc)}</div>
      </div>`;
    }
    return `<div style="padding:10px 11px;background:#0d0800;border:1px solid ${col}44;border-left:3px solid ${col};margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(chain,{size:18}):(chain.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:${col}">${esc(chain.title)}</div>
          <div style="font-size:8px;color:var(--dim)">${done?'완료':'진행중'} · ${cs.completedSteps?.length||0}/${chain.steps.length}단계</div>
        </div>
        ${done?'<span style="color:#60a060">✓</span>':''}
      </div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:6px">${esc(chain.desc)}</div>
      <div style="height:3px;background:#1a1005;border-radius:2px;margin-bottom:5px">
        <div style="width:${pct}%;height:100%;background:${col};border-radius:2px"></div>
      </div>
      ${curStep&&!done?`<div style="font-size:9px;color:var(--gold);margin-bottom:3px">▶ ${esc(curStep.title)}</div>
      <div style="font-size:9px;color:var(--dim)">${esc(curStep.desc||'')}</div>`:''}
      ${stepHist.length?`<div style="margin-top:6px;padding:5px 7px;background:#0a0800;border:1px solid #2a1a05;border-radius:2px">
        <div style="font-size:8px;color:var(--dim);margin-bottom:3px;font-family:'Cinzel',serif">완료 단계 기록</div>
        ${stepHist.slice(-3).map(h=>`<div style="font-size:9px;color:#4a3a2a;margin-bottom:2px">턴 ${h.turn||''} · ${esc((h.scene||'').slice(0,60))}...</div>`).join('')}
      </div>`:''}
    </div>`;
  }).join('');

  body.innerHTML = `<div style="padding:8px 12px;font-size:10px;color:var(--dim)">⚔️ 메인 스토리와 별개로 진행되는 장기 서사입니다. 관련 단서를 서사 중 자연스럽게 마주치면 자동으로 시작됩니다.</div>${cards}`;
}
window.renderEpicQuestPanel = renderEpicQuestPanel;

window.renderEpicQuestPanel = renderEpicQuestPanel;

export function addExp(amount){
  if(!amount || amount <= 0) return;
  const prevExp = loadPlayerExp();
  const prevLv  = loadPlayerLevel();
  const newExp  = prevExp + amount;
  const { level: newLv } = calcLevelFromExp(newExp);

  savePlayerExp(newExp);

  if(newLv > prevLv){
    savePlayerLevel(newLv);
    // [B6 FIX] S.stats.maxHp/maxMp는 캐릭터 생성 시 ALL_STAT_KEYS에 아예
    // 포함되지 않아 항상 undefined였고, 레벨업 시에도 갱신되는 곳이 없어
    // 25곳 이상의 참조가 전부 폴백값(100/999)에 의존하던 버그. 레벨업마다
    // 실제 레벨 기반 공식(getPlayerMaxHp/getPlayerMaxMp)으로 동기화한다.
    if(S.stats && typeof getPlayerMaxHp==='function') S.stats.maxHp = getPlayerMaxHp();
    if(S.stats && typeof getPlayerMaxMp==='function') S.stats.maxMp = getPlayerMaxMp();
    const levelsGained = newLv - prevLv;
    const pointsGained = levelsGained * 5;
    saveStatPoints(loadStatPoints() + pointsGained);
    S._pendingStatPoints = (S._pendingStatPoints||0) + pointsGained;

    // ── 레벨업 시 스킬 포인트 지급 ──────────────────────
    // 기본: 레벨업마다 1SP
    // 5단위 마일스톤(5,10,15...): +1 추가
    // 10단위 마일스톤(10,20,30...): +2 추가
    let spGain = levelsGained; // 레벨 1개당 1SP
    for(let lv = prevLv + 1; lv <= newLv; lv++){
      if(lv % 10 === 0) spGain += 2;       // 10,20,30... +2 보너스
      else if(lv % 5 === 0) spGain += 1;   // 5,15,25... +1 보너스
    }
    S.skillSP = (S.skillSP||0) + spGain;
    saveSkillSP(S.skillSP);
    setTimeout(()=> toast(`✨ 레벨업 보상: 스킬 포인트 +${spGain} SP (총 ${S.skillSP})`, 3500), 1200);

    toast(`🎉 레벨 업! Lv.${prevLv} → Lv.${newLv}  |  스탯 포인트 +${pointsGained}`, 4000);
    window.dramaticLevelUp(prevLv, newLv);
    if(typeof _addTimelineOnLevelUp==='function') _addTimelineOnLevelUp(prevLv, newLv);
    setTimeout(()=>{ if(typeof showStatRecommendation==='function') showStatRecommendation(); }, 2500);
    setTimeout(()=>{
      if(S._pendingStatPoints > 0)
        toast(`💡 스탯 포인트 ${S._pendingStatPoints}개 미배분`, 4000);
    }, 2000);
    unlockAchievement('level_up');
    if(newLv >= 10) unlockAchievement('level_10');
    if(newLv >= 30) unlockAchievement('level_30');
    if(newLv >= 50) unlockAchievement('level_50');
    if(newLv >= 99) unlockAchievement('level_99');
    if(typeof saveDiaryEntry==='function')
      saveDiaryEntry('levelup', `레벨 업! Lv.${prevLv} → Lv.${newLv}. 포인트 +${pointsGained}, SP +${spGain}`, S.msgCount);
    if(typeof addTimelineEvent==='function')
      addTimelineEvent('levelup', `Lv.${prevLv} → Lv.${newLv} 레벨업!`, {icon:'⬆️'});
  }
  window.updateHeader();
}
window.addExp = addExp;

export function gainExpFromAction(isSuccess, isCritSuccess, isCritFail){
  // 진화형 직업이면 EXP 대신 진화 에너지 획득
  if(typeof isEvoJob === 'function' && isEvoJob()){
    let evoGain = 0;
    if(isCritSuccess) evoGain = 20;
    else if(isSuccess) evoGain = 8;
    else if(isCritFail) evoGain = 2;
    else evoGain = 4;
    if(typeof gainEvoEnergy === 'function') gainEvoEnergy(evoGain, isCritSuccess ? '대성공' : isSuccess ? '성공' : '행동');
    return;
  }
  const lv = loadPlayerLevel();
  // 회차가 높을수록 EXP 획득 감소 (강적 처치 보상을 더 의미있게)
  const cycle = (typeof loadCycleCount==='function') ? (loadCycleCount()||0) : 0;
  const cyclePenalty = Math.max(0.3, 1 - cycle * 0.07); // 1회차=100%, 5회차=65%, 10회차=30%
  let exp = 0;
  if(isCritSuccess) exp = Math.floor(6 * (1 + lv * 0.04) * cyclePenalty);
  else if(isSuccess) exp = Math.floor(2 * (1 + lv * 0.02) * cyclePenalty);
  else if(isCritFail) exp = 1;
  else exp = 1;
  if(exp > 0) addExp(exp);
}
window.gainExpFromAction = gainExpFromAction;

export function gainExpFromKill(monsterRarity='common'){
  const lv     = loadPlayerLevel();
  const cycle  = (typeof loadCycleCount==='function') ? (loadCycleCount()||0) : 0;
  // 회차가 높아도 강적 처치는 충분히 보상
  const expMap = {
    common:    Math.floor(15  * (1 + lv * 0.03)),
    uncommon:  Math.floor(40  * (1 + lv * 0.04)),
    rare:      Math.floor(100 * (1 + lv * 0.05)),
    legendary: Math.floor(300 * (1 + lv * 0.06)),
    boss:      Math.floor(500 * (1 + lv * 0.08)),
  };
  const exp = expMap[monsterRarity] || expMap.common;
  if(exp > 0){
    addExp(exp);
    toast(`⚔️ 처치 EXP +${exp} [${monsterRarity}]`, 1800);
  }
}
window.gainExpFromKill = gainExpFromKill;

window.gainExpFromKill = gainExpFromKill;

export function renderStatAllocPanel(){
  const body = document.getElementById('pb-statalloc');
  if(!body) return;

  const points  = loadStatPoints();
  const lv      = loadPlayerLevel();
  const totalExp = loadPlayerExp();
  const { remaining, needed } = calcLevelFromExp(totalExp);
  const expPct  = Math.min(100, Math.floor((remaining / needed) * 100));

  const statNames = {
    str:'근력',agi:'민첩',end:'인내',mgc:'마법',int:'지력',
    per:'통찰',fath:'신앙',luk:'행운',wil:'의지',disg:'위장',
    fear:'공포',neg:'교섭',crit:'치명',rng:'사거리'
  };
  const statIcons = {
    str:'💪',agi:'⚡',end:'🛡️',mgc:'🔮',int:'🧠',
    per:'👁️',fath:'📿',luk:'🍀',wil:'🔥',disg:'🎭',
    fear:'😈',neg:'🤝',crit:'🗡️',rng:'🏹'
  };

  body.innerHTML = `
    <!-- 레벨/경험치 -->
    <div style="padding:12px;background:#1a1005;border:1px solid var(--gold);margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-family:'Cinzel',serif;font-size:14px;color:var(--gold)">Lv. ${lv}</div>
        <div style="font-size:9px;color:var(--dim)">다음 레벨까지 ${needed - remaining} EXP</div>
      </div>
      <div style="height:6px;background:#1a1005;border:1px solid #3a2a0a;border-radius:3px;overflow:hidden">
        <div style="width:${expPct}%;height:100%;background:linear-gradient(90deg,#c8a96e,#e8c97e);border-radius:3px;transition:width .4s"></div>
      </div>
      <div style="font-size:9px;color:var(--dim);margin-top:3px">${remaining} / ${needed} EXP (${expPct}%)</div>
    </div>

    <!-- 미배분 포인트 -->
    <div style="padding:10px 12px;background:${points>0?'#1a2a0a':'#0d0800'};border:1px solid ${points>0?'#3a5a2a':'var(--border)'};margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-family:'Cinzel',serif;font-size:11px;color:${points>0?'#80c040':'var(--dim)'}">미배분 스탯 포인트</div>
        <div style="font-size:9px;color:var(--dim)">레벨업마다 5포인트 획득</div>
      </div>
      <div style="font-family:'Cinzel',serif;font-size:20px;color:${points>0?'#80c040':'var(--dim)'}">${points}</div>
    </div>

    <!-- 스탯 배분 -->
    <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:8px;letter-spacing:1px">스탯 배분</div>
    ${STAT_POINT_ALLOC_KEYS.map(k=>{
      const val = Math.round(S.stats[k]||0);
      const pct = Math.min(100, Math.floor(val/999*100));
      const canAdd = points > 0;
      const history = S._statAllocHistory || {};
      const canUndo = (history[k]||0) > 0;
      return `<div style="padding:7px 10px;background:#0d0800;border:1px solid var(--border);margin-bottom:4px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:14px;width:20px;text-align:center">${statIcons[k]||'📊'}</span>
          <div style="flex:1;min-width:0">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px">
              <span style="font-size:10px;color:var(--gold);font-family:'Cinzel',serif">${statNames[k]||k.toUpperCase()}</span>
              <span style="font-size:10px;color:var(--gold)">${val}</span>
            </div>
            <div style="height:4px;background:#1a1005;border-radius:2px;overflow:hidden">
              <div style="width:${pct}%;height:100%;background:#c8a96e;border-radius:2px"></div>
            </div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button onclick="deallocateStat('${k}')" style="padding:3px 8px;background:${canUndo?'#2a0a0a':'#0d0800'};border:1px solid ${canUndo?'#6a1a1a':'#1a1005'};color:${canUndo?'#e05050':'#2a2a2a'};font-size:11px;cursor:pointer;border-radius:2px" ${canUndo?'':'disabled'} title="배분 취소">−</button>
            <button onclick="allocateStat('${k}',1)"  style="padding:3px 8px;background:${canAdd?'#1a3a0a':'#0d0800'};border:1px solid ${canAdd?'#3a6a1a':'#1a1005'};color:${canAdd?'#80c040':'#2a2a2a'};font-size:11px;cursor:pointer;border-radius:2px" ${canAdd?'':'disabled'}>+</button>
            <button onclick="allocateStat('${k}',5)"  style="padding:3px 8px;background:${canAdd&&points>=5?'#1a3a0a':'#0d0800'};border:1px solid ${canAdd&&points>=5?'#3a6a1a':'#1a1005'};color:${canAdd&&points>=5?'#80c040':'#2a2a2a'};font-size:9px;cursor:pointer;border-radius:2px" ${canAdd&&points>=5?'':'disabled'}>+5</button>
          </div>
        </div>
      </div>`;
    }).join('')}

    <!-- 경험치 획득 방법 안내 -->
    <div style="padding:8px 10px;background:#0d0800;border:1px solid #1a1005;margin-top:8px">
      <div style="font-size:9px;color:#3a2a0a;line-height:1.6">
        📈 경험치 획득: 대성공 +8 · 성공 +3 · 실패 +2 · 퀘스트/전투 보상<br>
        ✨ 스킬 포인트: 레벨업 +1SP (5단위 +1보너스, 10단위 +2보너스) · 희귀 아이템 사용 · 마법서/기술서 사용 · 칭호 획득
      </div>
    </div>
  `;
}
window.renderStatAllocPanel = renderStatAllocPanel;

export function renderBuildRecommendPanel(){
  const body = document.getElementById('pb-build');
  if(!body) return;

  const stats = S.stats || {};
  const unlocked = S.unlockedSkills || {};
  const allSkills = (typeof getAllSkillDefs==='function') ? getAllSkillDefs() : [];
  const rc = (typeof RC!=='undefined') ? RC : {'common':'#8a9a8a','uncommon':'#4a9a6a','rare':'#4a6fa5','epic':'#9060c0','legendary':'#c8a96e','primal':'#e0483c'};

  // 스탯 이름 매핑 (STAT_DEFS 통합)
  const statNames = {};
  if(typeof STAT_DEFS!=='undefined'){
    Object.values(STAT_DEFS).flat().forEach(d=>{ statNames[d.id]={name:d.name,icon:d.icon}; });
  }
  const statLabel = (k) => statNames[k] ? `${statNames[k].icon} ${statNames[k].name}` : k;

  // 미해금 스킬 중 요구 스탯을 가장 적게 남긴(가까운) 순서로 정렬
  const locked = allSkills.filter(s => s.req && !unlocked[s.id]);
  const withGap = locked.map(s=>{
    const reqs = Object.entries(s.req);
    const gaps = reqs.map(([k,v])=>({ key:k, need:v, have:Math.round(stats[k]||0), gap:Math.max(0, v-(stats[k]||0)) }));
    const totalGap = gaps.reduce((a,g)=>a+g.gap, 0);
    return { skill:s, gaps, totalGap };
  }).filter(x=>x.totalGap > 0) // 이미 조건 충족했는데 미해금인 건 다른 이유(레벨 등)이므로 제외
    .sort((a,b)=>a.totalGap - b.totalGap)
    .slice(0, 6);

  // 가장 자주 등장하는 부족 스탯 = 다음 투자 추천
  const gapCount = {};
  withGap.forEach(x => x.gaps.forEach(g => { if(g.gap>0) gapCount[g.key] = (gapCount[g.key]||0) + 1; }));
  const topStats = Object.entries(gapCount).sort((a,b)=>b[1]-a[1]).slice(0,3);

  // 스탯 상위 3개 (현재 강점)
  const strongStats = Object.entries(stats)
    .filter(([k,v])=> statNames[k] && typeof v==='number')
    .sort((a,b)=>b[1]-a[1]).slice(0,3);

  const points = (typeof loadStatPoints==='function') ? loadStatPoints() : 0;

  let html = `<div style="padding:8px 12px 14px">`;

  html += `<div style="font-family:'Cinzel',serif;font-size:11px;color:var(--gold);letter-spacing:1px;margin-bottom:10px">🧭 빌드 가이드</div>`;

  // 현재 강점
  html += `<div style="padding:8px 10px;background:#0d0800;border:1px solid var(--border);margin-bottom:8px">
    <div style="font-size:9px;color:var(--dim);margin-bottom:5px">💪 현재 강점 스탯</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px">
      ${strongStats.length ? strongStats.map(([k,v])=>`<span style="font-size:9px;padding:3px 7px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold)">${statLabel(k)} ${Math.round(v)}</span>`).join('') : '<span style="font-size:9px;color:var(--dim)">아직 두드러진 스탯이 없습니다</span>'}
    </div>
  </div>`;

  // 다음 투자 추천
  html += `<div style="padding:8px 10px;background:#0d0800;border:1px solid var(--border);margin-bottom:8px">
    <div style="font-size:9px;color:var(--dim);margin-bottom:5px">🎯 다음 투자 추천 ${points>0?`<span style="color:#80c080">(사용 가능 SP: ${points})</span>`:''}</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px">
      ${topStats.length ? topStats.map(([k,cnt])=>`<span style="font-size:9px;padding:3px 7px;background:var(--bg-input);border:1px solid var(--gold);color:var(--gold)">${statLabel(k)} <span style="color:var(--dim)">· 스킬 ${cnt}개 관련</span></span>`).join('') : '<span style="font-size:9px;color:var(--dim)">대부분의 스킬 조건을 충족했습니다</span>'}
    </div>
    ${points>0 ? `<button class="btn btn-gold" style="width:100%;margin-top:8px;font-size:9px;padding:5px" onclick="openP('statalloc')">스탯 배분하러 가기</button>` : ''}
  </div>`;

  // 가장 가까운 미해금 스킬
  html += `<div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);margin-bottom:5px">🔒 조금만 더 투자하면 열리는 스킬</div>`;
  if(!withGap.length){
    html += `<div style="padding:16px;text-align:center;color:var(--dim);font-size:10px">조건 미달로 잠긴 스킬이 없습니다.</div>`;
  } else {
    withGap.forEach(x=>{
      const s = x.skill;
      const color = rc[s.rarity] || '#c8a96e';
      const gapText = x.gaps.filter(g=>g.gap>0).map(g=>`${statLabel(g.key)} ${g.have}/${g.need}`).join(' · ');
      html += `<div style="padding:7px 9px;background:#0a0800;border:1px solid var(--border);border-left:3px solid ${color};margin-bottom:5px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:16}):(s.icon||"✨")}</span>
          <span style="font-size:10px;color:${color}">${esc(s.name)}</span>
          <span style="font-size:8px;color:var(--dim);margin-left:auto">부족 ${x.totalGap}</span>
        </div>
        <div style="font-size:8px;color:var(--dim)">${gapText}</div>
      </div>`;
    });
  }

  html += `<div style="margin-top:10px;padding:7px;background:var(--bg-screen);border:1px dashed var(--border);font-size:8px;color:var(--dim);line-height:1.6">
    💡 부족한 스탯은 스탯 배분 패널에서 직접 투자하거나, 관련 행동을 반복하면 자연히 오릅니다.
  </div>`;

  html += `</div>`;
  body.innerHTML = html;
}
window.renderBuildRecommendPanel = renderBuildRecommendPanel;

window.renderBuildRecommendPanel = renderBuildRecommendPanel;

// [17차 감사 FIX] addExp의 레벨업 분기에서 typeof 가드로 호출하던
// 함수인데 이 이름으로 구현된 적이 한 번도 없어(가드 덕에 에러는
// 안 났지만) 레벨업 직후 "추천 스탯" 토스트가 항상 조용히 안 떴다.
// renderBuildRecommendPanel의 gap 분석 로직을 재사용해 실제 구현.
export function showStatRecommendation(){
  try{
    const stats = S.stats || {};
    const unlocked = S.unlockedSkills || {};
    const allSkills = (typeof getAllSkillDefs==='function') ? getAllSkillDefs() : [];
    const locked = allSkills.filter(s => s.req && !unlocked[s.id]);
    const gapCount = {};
    locked.forEach(s=>{
      Object.entries(s.req).forEach(([k,v])=>{
        const gap = Math.max(0, v-(stats[k]||0));
        if(gap>0) gapCount[k] = (gapCount[k]||0) + 1;
      });
    });
    const top = Object.entries(gapCount).sort((a,b)=>b[1]-a[1])[0];
    if(top){
      const statNames = { str:'근력',agi:'민첩',end:'인내',mgc:'마법',int:'지력',per:'통찰',fath:'신앙',luk:'행운',wil:'의지',disg:'위장',fear:'공포',neg:'교섭',crit:'치명',rng:'사거리' };
      toast(`💡 추천: ${statNames[top[0]]||top[0]} 스탯을 올리면 잠긴 스킬 ${top[1]}개를 더 해금할 수 있습니다`, 4000);
    }
  }catch(e){}
}
window.showStatRecommendation = showStatRecommendation;

export function allocateStat(statKey, amount){
  const points = loadStatPoints();
  if(amount > 0){
    const spend  = Math.min(amount, points);
    if(spend <= 0){ toast('스탯 포인트가 없습니다'); return; }
    saveStatPoints(points - spend);
    S.stats[statKey] = Math.min(999, (S.stats[statKey]||0) + spend * 3);
    S._pendingStatPoints = Math.max(0, (S._pendingStatPoints||0) - spend);
    // [B-11] 배분 히스토리 기록 (되돌리기 지원)
    S._statAllocHistory = S._statAllocHistory || {};
    S._statAllocHistory[statKey] = (S._statAllocHistory[statKey]||0) + spend;
    if(typeof saveStats==='function') saveStats(S.stats);
  _markDirty('stats'); if(typeof saveStatsSplit==='function') saveStatsSplit();
    window.updateHeader();
    toast(`${statKey.toUpperCase()} +${spend*3}  (포인트 ${points} → ${points-spend})`, 2000);
  }
  renderStatAllocPanel();
}
window.allocateStat = allocateStat;

export function deallocateStat(statKey){
  const allocated = S._statAllocHistory || {};
  const prev = allocated[statKey] || 0;
  if(prev <= 0){ toast('되돌릴 배분 내역이 없습니다', 1500); return; }
  const refund = Math.min(1, prev); // 1포인트씩 되돌리기
  const curPoints = loadStatPoints();
  saveStatPoints(curPoints + refund);
  S.stats[statKey] = Math.max(0, (S.stats[statKey]||0) - refund * 3);
  allocated[statKey] = prev - refund;
  S._statAllocHistory = allocated;
  if(typeof saveStats==='function') saveStats(S.stats);
  _markDirty('stats'); if(typeof saveStatsSplit==='function') saveStatsSplit();
  window.updateHeader();
  toast(`${statKey.toUpperCase()} -${refund*3}  (포인트 반환: ${curPoints} → ${curPoints+refund})`, 2000);
  renderStatAllocPanel();
}
window.deallocateStat = deallocateStat;

window.deallocateStat = deallocateStat;

export function renderRestPanel(){
  const body = document.getElementById('pb-rest');
  if(!body) return;
  const loc = loadCurrentLocation();
  const hp = Math.round(S.stats?.hp||100);
  const maxHp = Math.round(S.stats?.maxHp||100);
  const mp = Math.round(S.stats?.mp||50);
  const maxMp = Math.round(S.stats?.maxMp||50);
  const gold = S.gold || 0;
  const REST_OPTIONS = [
    { id:'free', label:'🌿 간단한 휴식', desc:'HP/MP 30% 회복. 무료.', cost:0, hpRatio:0.3, mpRatio:0.3 },
    { id:'inn', label:'🛏️ 여관 투숙', desc:'HP/MP 완전 회복. 상태이상 일부 해제.', cost: loc?.priceModifier ? Math.round(15*loc.priceModifier) : 15, hpRatio:1, mpRatio:1 },
    { id:'premium', label:'💆 고급 치료', desc:'HP/MP 완전 회복 + 모든 상태이상 해제.', cost: loc?.priceModifier ? Math.round(40*loc.priceModifier) : 40, hpRatio:1, mpRatio:1, clearAll:true },
  ];
  body.innerHTML = `
    <div style="padding:10px 12px;background:#0d0800;border:1px solid #3a2a0a;margin-bottom:10px">
      <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:6px">현재 상태</div>
      <div style="font-size:11px;color:var(--text);margin-bottom:3px">❤️ HP: ${hp}/${maxHp}</div>
      <div style="height:5px;background:#1a0805;border-radius:2px;margin-bottom:6px">
        <div style="width:${Math.min(100,Math.round(hp/maxHp*100))}%;height:100%;background:#c04040;border-radius:2px"></div>
      </div>
      <div style="font-size:11px;color:var(--text);margin-bottom:3px">💙 MP: ${mp}/${maxMp}</div>
      <div style="height:5px;background:#050a1a;border-radius:2px;margin-bottom:4px">
        <div style="width:${Math.min(100,Math.round(mp/maxMp*100))}%;height:100%;background:#4060c0;border-radius:2px"></div>
      </div>
      <div style="font-size:10px;color:#c8a96e">💰 보유 골드: ${gold}G</div>
    </div>
    ${REST_OPTIONS.map(o=>`
      <div style="padding:10px 12px;background:#0a0800;border:1px solid #2a1a05;margin-bottom:6px">
        <div style="font-family:'Cinzel',serif;font-size:11px;color:var(--gold);margin-bottom:4px">${o.label}</div>
        <div style="font-size:10px;color:var(--dim);margin-bottom:7px">${o.desc}${o.cost>0?' ('+o.cost+'G)':' (무료)'}</div>
        <button onclick="doRest('${o.id}',${o.cost},${o.hpRatio},${o.mpRatio},${!!o.clearAll})"
          style="width:100%;padding:8px;background:${gold>=o.cost?'linear-gradient(135deg,#1a1005,#2a1a08)':'#0d0800'};border:1px solid ${gold>=o.cost?'var(--gold)':'#3a2a0a'};color:${gold>=o.cost?'var(--gold)':'#4a3a2a'};font-family:'Cinzel',serif;font-size:10px;cursor:${gold>=o.cost?'pointer':'default'};border-radius:2px"
          ${gold<o.cost?'disabled':''}
        >${o.cost>0?'💰 '+o.cost+'G 지불':'휴식하기'}</button>
      </div>`).join('')}
  `;
}
window.renderRestPanel = renderRestPanel;

window.renderRestPanel = renderRestPanel;

export function doRest(id, cost, hpRatio, mpRatio, clearAll){
  if(cost > 0 && (S.gold||0) < cost){ toast('💰 골드가 부족합니다', 1500); return; }
  if(cost > 0){ S.gold -= cost; saveGold(S.gold); }
  // [B-10 FIX] 실제 HP/MP 회복
  const maxHp = S.stats.maxHp || 100;
  const maxMp = S.stats.maxMp || 50;
  S.stats.hp = Math.min(maxHp, (S.stats.hp||0) + Math.floor(maxHp * hpRatio));
  S.stats.mp = Math.min(maxMp, (S.stats.mp||0) + Math.floor(maxMp * mpRatio));
  if(clearAll && typeof window.loadStatusEffects==='function'){
    try { if(typeof clearStatusEffects==='function') clearStatusEffects('player'); } catch(e){}
    toast('✨ 모든 상태이상이 해제됐다!', 2000);
  } else if(hpRatio >= 1 && typeof window.loadStatusEffects==='function'){
    try {
      const state = window.loadStatusEffects();
      if(state['player']) state['player'] = state['player'].filter(e=>['curse','bleed'].includes(e.id));
      if(typeof saveStatusEffects==='function') saveStatusEffects(state);
    } catch(e){}
  }
  if(typeof saveStats==='function') saveStats(S.stats);
  _markDirty('stats'); if(typeof saveStatsSplit==='function') saveStatsSplit();
  window.updateHeader();
  const hpGain = Math.floor(maxHp * hpRatio), mpGain = Math.floor(maxMp * mpRatio);
  toast(`🛏️ 휴식 완료! HP +${hpGain}, MP +${mpGain}`, 2500);
  renderRestPanel();
}
window.doRest = doRest;

window.doRest = doRest;

export const clearPlayerExp   = () => lsDel(EXP_KEY);

export const JOB_SKILLS_KEY   = "taleforge-jobskills";

export const loadJobSkills    = () => { const r = lsGet(JOB_SKILLS_KEY); return r ? JSON.parse(r) : []; };

export const saveJobSkills    = (s) => lsSet(JOB_SKILLS_KEY, JSON.stringify(s));

export const clearJobSkills   = () => lsDel(JOB_SKILLS_KEY);

export const getAllSkillDefs = () => {
  const base = [...SKILL_DEFS, ...loadJobSkills(), ...getAllClearSkillDefs()];
  const idSet = new Set(base.map(s=>s.id));
  // 모든 직업의 job.skills도 포함 (AI 생성 직업, 커스텀 직업 스킬 등)
  if(typeof getAllBaseJobs==='function'){
    for(const j of getAllBaseJobs()){
      for(const sk of (j.skills||[])){
        if(sk && sk.id && !idSet.has(sk.id)){ base.push(sk); idSet.add(sk.id); }
      }
    }
  }
  // 😈 악마족 타락 스킬 포함
  for(const stg of DEMON_CORRUPTION_STAGES){
    for(const sk of (stg.skills||[])){
      if(sk && sk.id && !idSet.has(sk.id)){ base.push(sk); idSet.add(sk.id); }
    }
  }
  // 🐉 드래곤혈 용심 스킬 포함
  if(typeof DRAGON_BALANCE_PHASES !== 'undefined'){
    for(const ph of DRAGON_BALANCE_PHASES){
      for(const sk of (ph.skills||[])){
        if(sk && sk.id && !idSet.has(sk.id)){ base.push(sk); idSet.add(sk.id); }
      }
    }
  }
  // 💛 세레스티얼 계율 스킬 포함 (신성 + 타락 양방향)
  if(typeof CELESTIAL_COVENANT_STAGES !== 'undefined'){
    for(const stg of CELESTIAL_COVENANT_STAGES){
      for(const sk of (stg.skills||[])){
        if(sk && sk.id && !idSet.has(sk.id)){ base.push(sk); idSet.add(sk.id); }
      }
    }
  }
  // 🩸 뱀파이어 종족 스킬 + 피의 연대기 단계 스킬 포함
  try {
    const race = (typeof S !== 'undefined' && S.character?.race) || '';
    const isVamp = race.includes('뱀파이어') || race.includes('혈종') || race.includes('혈군') || race.includes('혈통 왕');
    if (isVamp) {
      // RACE_DEFS에서 뱀파이어 스킬 가져오기
      if (typeof RACE_DEFS !== 'undefined') {
        const vampDef = RACE_DEFS.find(r => r.id === 'vampire');
        for (const sk of (vampDef?.skills || [])) {
          if (sk && sk.id && !idSet.has(sk.id)) { base.push(sk); idSet.add(sk.id); }
        }
      }
      // 피의 연대기 단계 스킬 가져오기
      if (typeof VAMPIRE_CHRONICLE_STAGES !== 'undefined') {
        const vc = (typeof loadVampireChronicle === 'function') ? loadVampireChronicle() : null;
        const curStage = vc ? (vc.stage || 0) : 0;
        for (let i = 0; i <= curStage; i++) {
          for (const sk of (VAMPIRE_CHRONICLE_STAGES[i]?.skills || [])) {
            if (sk && sk.id && !idSet.has(sk.id)) { base.push(sk); idSet.add(sk.id); }
          }
        }
      }
    }
  } catch(e) {}
  return base;
};

export function getSkillPrereqs(skillId){
  const fromMap = SKILL_TREE[skillId];
  if(fromMap) return fromMap;
  const def = getAllSkillDefs().find(s=>s.id===skillId);
  if(def && def.prereq) return Array.isArray(def.prereq) ? def.prereq : [def.prereq];
  return [];
}
window.getSkillPrereqs = getSkillPrereqs;

window.getSkillPrereqs = getSkillPrereqs;

export const getSkillUnlockable = (skillId, unlockedSkills, stats, titles) => {
  const def = getAllSkillDefs().find(s => s.id === skillId);
  if (!def) return false;
  if (unlockedSkills[skillId]) return false; // 이미 해금됨

  // 이벤트 스킬: 칭호 필요
  if (def.type === "event") {
    if (!def.unlockTitle) return true;
    return !!titles.find(t => t.id === def.unlockTitle);
  }

  // 스탯 요구 조건
  const statOk = Object.entries(def.req || {}).every(([k, v]) => (stats[k] || 0) >= v);
  if (!statOk) return false;

  // 선행 스킬 조건 (구식 SKILL_TREE + 신식 prereq 필드 통합)
  const prereqs = getSkillPrereqs(skillId);
  return prereqs.every(pid => !!unlockedSkills[pid]);
};

export const SKILL_TREE_SP_COST = (def) => {
  if (def.type === "event") return 0;
  const costs = { common:1, uncommon:2, rare:3, legendary:5 };
  return costs[def.rarity] || 1;
};
