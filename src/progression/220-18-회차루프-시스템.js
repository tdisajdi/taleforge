// [18] 회차/루프 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { showScreen } from '../core/084-TaleForge-순수-JS-엔진.js';
import { ARTIFACT_COMPLETE, RELIC_DEFS } from '../data/014-환생-누적-시스템-110번.js';
import { DEATH_DEAL_OPTIONS } from '../data/028-악마족-진명-시스템-Demon-True-Name.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { DEATH_DEAL_HP_RATIO } from '../data/220-18-회차루프-시스템.js';
import { extractDefeatedEnemyName, loadInventory, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadTitles } from '../job/010-스킬-강화-시스템.js';
import { loadNPCs, saveSession } from '../misc/001-block0-preamble.js';
import { classifyLastWordTone, recordDeathCause, saveLastWord } from '../misc/015-시스템-1120.js';
import { checkGreatCycleReset, recordAgeParadox, recordGrudgeWeapon, recordStatDeath } from '../misc/016-2130번-시스템.js';
import { recordCurseLineage, recordTestament } from '../misc/017-4150번-시스템.js';
import { summarizeHistory } from '../misc/217-14-메모리-자동-요약.js';
import { upsertNpc } from '../npc/140-①-NPC-DB-가장-세분화.js';
import { showReincScreen } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { collectGodShard, loadDeathDealer, makeDealWithDeath, recordDeathForEye } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadLoopRecords } from '../world/165-저장소.js';
import { ARTIFACT_MAX_SHARDS, checkRelicCondition, loadArtifactShards, loadCycleCount, saveArtifactShards, saveCycleCount } from './014-환생-누적-시스템-110번.js';
import { assignMoonPhase, assignStarSign, collectMysteryPiece, earnTimeToken, triggerUndyingPassive } from './018-5170번-환생-누적-시스템.js';
import { applyLegacyBonus } from './156-NG-회차-계승-시스템.js';
import { recordElementDeath, recordLegacyWord, recordPastLetter } from './019-71100번-환생-누적-시스템.js';
import { bloomGrudgeFlower, recordAssassinDeath, recordAvoidedFate } from './020-101130번-환생-누적-시스템.js';
import { unlockAchievement } from './187-2-업적-시스템.js';

export const LOOP_REC_KEY = 'tf-loop-records';

export function saveLoopRecord(data) {
  try {
    const records = typeof loadLoopRecords === 'function' ? loadLoopRecords() : [];
    const cyc = typeof loadCycleCount === 'function' ? loadCycleCount() : 0;
    records.push({
      cycle: cyc, ...data,
      savedAt: Date.now(), turn: S?.msgCount||0,
    });
    lsSet(LOOP_REC_KEY, JSON.stringify(records));
  } catch(e) {}
}
window.saveLoopRecord = saveLoopRecord;

export function transferLoopLegacy() {
  try {
    // 이전 회차에서 넘겨받을 유산
    const records = typeof loadLoopRecords === 'function' ? loadLoopRecords() : [];
    if (!records.length) return;
    const last = records[records.length-1];
    // 관계 유산
    if (last.relationships) {
      Object.entries(last.relationships).forEach(([npc, score]) => {
        if (score > 70 && typeof upsertNpc === 'function') {
          upsertNpc(npc, { legacyBond: true, bondNote: '전생에서 이어진 인연' });
        }
      });
    }
    // 유산 칭호
    if (last.legacy) {
      const lt = (typeof lsGet === 'function' ? JSON.parse(lsGet('tf-legacy-titles')||'[]') : []);
      lt.push(last.legacy);
      if (typeof lsSet === 'function') lsSet('tf-legacy-titles', JSON.stringify(lt));
    }
    toast(`✨ 전생의 유산이 이어졌다`, 3000);
  } catch(e) {}
}
window.transferLoopLegacy = transferLoopLegacy;

export function getLoopRewards(cycleNum) {
  const rewards = [];
  // [버그 수정] stat 키가 'lck'/'wis'였는데 S.stats에는 이 키가 없다
  // (진짜 키는 luk/per) — applyLoopCycleExtras의
  // `S.stats[r.stat] !== undefined` 가드에 걸려 두 보상 모두 조용히
  // 버려지고 있었다. 실제 존재하는 키로 교정(luk=행운, per=통찰/지혜).
  if (cycleNum >= 3)  rewards.push({ type:'stat', stat:'luk', value:5, desc:'루프 경험 +행운' });
  if (cycleNum >= 5)  rewards.push({ type:'stat', stat:'per', value:10, desc:'반복된 지혜' });
  if (cycleNum >= 10) rewards.push({ type:'skill', skill:'loop_memory', desc:'루프 기억 스킬' });
  if (cycleNum >= 20) rewards.push({ type:'stat', stat:'all', value:10, desc:'고회차 보너스' });
  return rewards;
}
window.getLoopRewards = getLoopRewards;

// [19차 감사 FIX] 아래 로직(유산 이전/루프 보상/전생 유물/봉인된
// 유물 파편/시간 역행 토큰)은 전부 startNewCycle() 안에 완성되어
// 있었지만, 실제 "새 삶 시작" 버튼(template.html의 reinc-start-btn)이
// 호출하는 진짜 환생 처리 함수는 quest/086의 doReincarnate()이고
// startNewCycle()/endCycle2()/saveLoopRecord()/transferLoopLegacy()/
// getLoopRewards()는 코드베이스 어디에서도(다른 시스템은 물론 서로도)
// 호출된 적이 없는, doReincarnate()과 완전히 분리된 죽은 회차 처리
// 경로였다 — 즉 여기 담긴 전생 유물/유물 파편/시간 역행 토큰 지급
// 로직 전부가 게임이 나온 이래 한 번도 실행된 적이 없었다(이전 라운드
// "[신규]" 주석은 이 죽은 함수 안을 고친 것이었다). 카운터 증가 이후
// 부분을 별도 함수로 분리해 실제 진입점(doReincarnate)에서 부르도록
// 아래쪽에 훅을 추가한다.
export function applyLoopCycleExtras(newCyc) {
  try {
    // 유산 이전
    transferLoopLegacy();
    // [22-1, AI 의존 전수 스캔] NG+ 계승 스탯 보너스(applyLegacyBonus,
    // progression/156) — 직전 회차에서 진/선 엔딩을 봤으면 pendingBonus에
    // HP/ATK/DEF 보너스가 계산까지 다 돼서 저장돼 있는데, 이걸 실제로
    // 적용하는 유일한 호출부가 AI가 <gs>{"apply_legacy":{"confirmed":true}}
    // 를 되돌려줘야만 실행되는 npc/158의 GS 훅 하나뿐이었다 — 무-API
    // 모드에서는 보상 텍스트("전생의 기억이 스며든다")는 나와도 실제
    // 스탯은 영원히 안 붙는 구조. applyLegacyBonus()는 pendingBonus가
    // 없으면 즉시 return하는 멱등 함수라 여기서 매 회차 시작마다 그냥
    // 불러도 안전하다 — 위 artifact/time-token 지급과 같은 "새 회차
    // 시작 시 누락된 지급을 자동으로 채운다" 패턴을 그대로 따른다.
    if(typeof applyLegacyBonus==='function') applyLegacyBonus();
    // 보상 적용
    const rewards = getLoopRewards(newCyc);
    rewards.forEach(r => {
      if (r.type === 'stat' && S?.stats) {
        if (r.stat === 'all') Object.keys(S.stats).forEach(k => { S.stats[k] = Math.min(999,(S.stats[k]||0)+r.value); });
        else if (S.stats[r.stat] !== undefined) S.stats[r.stat] = Math.min(999,(S.stats[r.stat]||0)+r.value);
      }
    });
    // [신규] 전생 유물 지급 — RELIC_DEFS/checkRelicCondition은 완성되어
    // 있었지만 pastLife 객체 자체를 만드는 코드가 어디에도 없어 영원히
    // 호출될 수 없는 죽은 시스템이었다. 실제 카르마 점수와 칭호 데이터로
    // pastLife를 즉석 구성해 조건을 확인하고, 이미 보유하지 않은 유물만
    // 새로 지급한다.
    try{
      const pastLife = {
        karmaScore: (S?.character && S.character.karmaScore) ?? 50,
        titles: (typeof loadTitles==='function' ? loadTitles() : []).map(t=>({id:t.id})),
      };
      const ownedRelics = (typeof loadInventory==='function' ? loadInventory() : (S.inventory||[])).map(it=>it.relicId).filter(Boolean);
      RELIC_DEFS.forEach(relic=>{
        if(ownedRelics.includes(relic.id)) return; // 이미 보유
        if(checkRelicCondition(pastLife, relic.condition)){
          const inv = typeof loadInventory==='function' ? loadInventory() : (S.inventory||[]);
          inv.push({ relicId: relic.id, name: relic.name, icon: relic.icon, rarity: relic.rarity, desc: relic.desc, effects: relic.effects, type: 'relic' });
          if(typeof saveInventory==='function') saveInventory(inv);
          S.inventory = inv;
          toast(`전생의 유물 「${relic.name}」을(를) 발견했다 — ${relic.desc}`, 4000, relic);
        }
      });
    }catch(e){ console.warn('[전생 유물 지급 오류]', e); }

    // [신규] 봉인된 유물 파편 — ARTIFACT_COMPLETE/ARTIFACT_MAX_SHARDS는
    // 완성되어 있었지만 파편을 증가시키는 코드가 어디에도 없어 영원히
    // 5개를 모을 수 없는 죽은 시스템이었다. 매 환생마다 파편 1개를
    // 자동으로 지급하고, 5개가 모이면 완전체를 조립해 지급한다.
    try{
      if(typeof loadArtifactShards==='function' && typeof saveArtifactShards==='function'){
        const shards = loadArtifactShards();
        if(shards < ARTIFACT_MAX_SHARDS){
          const newShards = shards + 1;
          saveArtifactShards(newShards);
          if(newShards >= ARTIFACT_MAX_SHARDS){
            const inv = typeof loadInventory==='function' ? loadInventory() : (S.inventory||[]);
            inv.push({ ...ARTIFACT_COMPLETE, type:'artifact' });
            if(typeof saveInventory==='function') saveInventory(inv);
            S.inventory = inv;
            toast(`${ARTIFACT_COMPLETE.name}이(가) 완성됐다! — ${ARTIFACT_COMPLETE.desc}`, 5000, ARTIFACT_COMPLETE);
          } else {
            toast(`🏺 봉인된 유물의 파편을 발견했다 (${newShards}/${ARTIFACT_MAX_SHARDS})`, 3500);
          }
        }
      }
    }catch(e){ console.warn('[유물 파편 지급 오류]', e); }

    // [신규] 시간 역행 토큰 — earnTimeToken()은 완성되어 있었지만 실제로
    // 호출하는 곳이 어디에도 없어, 소비 로직(AI 프롬프트 연동)은 있는데
    // 정작 토큰을 얻을 방법이 전혀 없는 반쪽짜리 시스템이었다. "회차
    // 마일스톤" 조건(5, 10, 20...회차)을 자동으로 연결한다.
    try{
      if(newCyc % 5 === 0 && typeof earnTimeToken==='function'){
        const earned = earnTimeToken('cycle_milestone');
        if(earned) toast(`⏪ ${newCyc}회차 도달 — 시간 역행 토큰을 얻었다!`, 3500);
      }
    }catch(e){ console.warn('[시간 역행 토큰 지급 오류]', e); }
  } catch(e) {}
}
window.applyLoopCycleExtras = applyLoopCycleExtras;

export function startNewCycle() {
  try {
    // 현재 회차 기록 저장
    const cyc = typeof loadCycleCount === 'function' ? loadCycleCount() : 0;
    const summary = summarizeHistory();
    const npcs = typeof loadNPCs === 'function' ? loadNPCs() : [];
    const relMap = {};
    npcs.forEach(n => { if (n.relationship > 50) relMap[n.name] = n.relationship; });
    saveLoopRecord({ summary, relationships: relMap, cycle: cyc });
    // 카운터 증가
    const newCyc = cyc + 1;
    if (typeof saveCycleCount === 'function') saveCycleCount(newCyc);
    applyLoopCycleExtras(newCyc);
    toast(`🔄 ${newCyc}회차 시작!`, 3000);
    if (newCyc >= 100) unlockAchievement('century_cycle');
    if (typeof window.updateHeader === 'function') window.updateHeader();
    // [BUG11 FIX] saveSession이 없으면 lsSet으로 직접 세션 저장 시도
    if (typeof saveSession === 'function') {
      saveSession();
    } else {
      try {
        if (typeof lsSet === 'function' && S) {
          lsSet('taleforge-session', JSON.stringify({
            character: S.character, stats: S.stats, msgCount: S.msgCount,
            scenario: S.scenario, gold: S.gold
          }));
        }
      } catch(e2) {}
    }
    return newCyc;
  } catch(e) { return 1; }
}
window.startNewCycle = startNewCycle;

export function endCycle2(endingId='neutral') {
  try {
    // [BUG12 FIX] S가 리셋되기 전에 msgCount를 캡처
    const finalTurn = (S?.msgCount) || 0;
    saveLoopRecord({ ending: endingId, finalTurn, summary: `${endingId} 엔딩 (${finalTurn}턴)` });
    toast(`이번 생이 끝났다. (${endingId})`, 3000);
  } catch(e) {}
}
window.endCycle2 = endCycle2;

export function getLoopBLS() {
  try {
    const cyc = typeof loadCycleCount === 'function' ? loadCycleCount() : 0;
    const records = typeof loadLoopRecords === 'function' ? loadLoopRecords() : [];
    const last = records[records.length-1];
    // [BUG13 FIX] summary 없을 때 의미 있는 기본값 제공
    if (!last) return '';
    const summaryText = last.summary || `${last.ending||'알 수 없음'} 엔딩 (${last.finalTurn||0}턴)`;
    return `\n[🔄 전생 요약] ${cyc}회차 / 이전: ${summaryText.slice(0,60)}`;
  } catch(e) { return ''; }
}
window.getLoopBLS = getLoopBLS;

export function checkLoopCondition() {
  // 사망, 엔딩 조건 충족 시 루프 시작 여부 체크
  return (S?.stats?.hp !== undefined) && S.stats.hp <= 0;
}
window.checkLoopCondition = checkLoopCondition;

export function showDeathDealModal(){
  document.querySelectorAll('.death-deal-modal').forEach(el=>el.remove());
  const modal = document.createElement('div');
  modal.className = 'death-deal-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9600;background:rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s';
  const optsHtml = DEATH_DEAL_OPTIONS.map((d,i) =>
    `<button onclick="_chooseDeathDeal('${d.id}')" style="display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;background:#1a0a10;border:1px solid #6a2030;color:#e0a0b0;font-size:11px;cursor:pointer;font-family:'Cinzel',serif;line-height:1.5">${i+1}. ${d.sacrifice} → <span style="color:#e0c060">${d.grant}</span></button>`
  ).join('');
  modal.innerHTML =
    '<div style="width:100%;max-width:380px;background:#0d0800;border:2px solid #6a2030;box-shadow:0 0 60px #6a203055;overflow:hidden">'
    +'<div style="background:linear-gradient(135deg,#1a0000,#2a0510);padding:16px;text-align:center;border-bottom:1px solid #6a203044">'
    +'<div style="font-size:32px;margin-bottom:6px">💀</div>'
    +'<div style="font-family:\'Cinzel\',serif;font-size:13px;color:#e0a0b0">죽음이 거래를 제안한다...</div>'
    +'</div>'
    +'<div style="padding:16px">'
    + optsHtml
    +'<button onclick="_declineDeathDeal()" style="display:block;width:100%;text-align:center;padding:10px 14px;margin-top:6px;background:transparent;border:1px solid #444;color:#888;font-size:10px;cursor:pointer;font-family:\'Cinzel\',serif">거래를 거부하고 이번 생을 마감한다</button>'
    +'</div></div>';
  document.body.appendChild(modal);
}
window.showDeathDealModal = showDeathDealModal;

window.showDeathDealModal = showDeathDealModal;

window._chooseDeathDeal = function(dealType){
  document.querySelectorAll('.death-deal-modal').forEach(el=>el.remove());
  const _deal = (typeof makeDealWithDeath==='function') ? makeDealWithDeath(dealType) : null;
  if(_deal){
    const ratio = DEATH_DEAL_HP_RATIO[dealType] ?? 0.5;
    S.stats.hp = Math.max(1, Math.round((S.stats.maxHp||100)*ratio));
    if(typeof window.updateHeader==='function') window.updateHeader();
    toast(`💀 죽음과 거래했다: ${_deal.sacrifice}`, 4500);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      +`\n\n[💀 죽음과의 거래] 캐릭터가 죽음의 문턱에서 신비한 존재와 거래했습니다. 대가: ${_deal.sacrifice}. 이 거래를 신비롭고 무겁게 묘사하십시오.`;
  } else if(typeof _proceedToDeathAfterDealDeclined==='function'){
    _proceedToDeathAfterDealDeclined();
  }
};

window._declineDeathDeal = function(){
  document.querySelectorAll('.death-deal-modal').forEach(el=>el.remove());
  if(typeof _proceedToDeathAfterDealDeclined==='function') _proceedToDeathAfterDealDeclined();
};

export function triggerLoopIfDead() {
  try {
    if (!checkLoopCondition()) return;
    if (window._loopDeathTriggered) return;
    // [연결] 불사의 게이지가 가득 찼으면 이번 죽음을 무효화
    if(typeof triggerUndyingPassive==='function' && triggerUndyingPassive()){
      S.stats.hp = Math.max(1, Math.round((S.stats.maxHp||100)*0.15));
      if(typeof window.updateHeader==='function') window.updateHeader();
      toast('✨ 불사의 힘이 죽음을 거부했다! 마지막 순간 되살아난다...', 4500);
      if(typeof recordAvoidedFate==='function') recordAvoidedFate('death', S.scenario?.id);
      if(typeof earnTimeToken==='function') earnTimeToken('perfect_escape');
      S._nextInjectedContext = (S._nextInjectedContext||'')
        +'\n\n[✨ 불사의 기적] 캐릭터가 치명적인 순간 신비한 힘으로 되살아났습니다. 이 기적적인 생환을 극적으로 묘사하십시오.';
      return;
    }
    // [B32 FIX] 죽음과의 거래 — 브라우저 confirm()은 예/아니오 이진 응답만
    // 가능해 4개 선택지 중 항상 첫 번째("기억 소멸")로만 고정 처리되던
    // 버그. 4개 선택지를 전부 실제로 고를 수 있는 커스텀 모달로 교체.
    // 모달은 비동기 UI라 여기서는 표시만 하고 return — 이후 진행(거래
    // 체결 또는 거부 시 실제 죽음 처리)은 모달의 버튼 클릭이 트리거한다.
    if(typeof loadDeathDealer==='function' && typeof DEATH_DEAL_OPTIONS!=='undefined'){
      const _dd = loadDeathDealer();
      if(!_dd?.debtCollected && typeof showDeathDealModal==='function'){
        showDeathDealModal();
        return;
      }
    }
    _proceedToDeathAfterDealDeclined();
  } catch(e) {}
}
window.triggerLoopIfDead = triggerLoopIfDead;

window.triggerLoopIfDead = triggerLoopIfDead;

export function _proceedToDeathAfterDealDeclined() {
  try {
    window._loopDeathTriggered = true;
    // [연결] 사망 관련 계승 시스템 트리거 — 통계/달의 위상/별자리/사안/사망 보너스
    try{
      if(typeof recordStatDeath==='function') recordStatDeath();
      if(typeof assignMoonPhase==='function') assignMoonPhase(Date.now());
      if(typeof assignStarSign==='function') assignStarSign(new Date().getMonth());
      if(typeof recordDeathForEye==='function') recordDeathForEye();
      // 마지막 메시지 톤 분석 (라스트 워드)
      const _lastMsg = (S.messages||[]).filter(m=>m.role==='assistant').slice(-1)[0];
      if(_lastMsg && typeof extractDefeatedEnemyName==='function' && typeof bloomGrudgeFlower==='function'){
        const _killerName = extractDefeatedEnemyName(_lastMsg.content||'');
        if(_killerName) bloomGrudgeFlower(_killerName, S.scenario?.id);
      }
      if(_lastMsg && typeof classifyLastWordTone==='function' && typeof saveLastWord==='function'){
        const _tone = classifyLastWordTone(_lastMsg.content||'');
        saveLastWord({ text:(_lastMsg.content||'').slice(0,200), tone:_tone, turn:S.msgCount||0 });
        const _karmaForLastWord = Math.round(S.stats?.krma||50);
        if(typeof recordLegacyWord==='function') recordLegacyWord(_lastMsg.content, S.character?.name, S.scenario?.id, _karmaForLastWord);
        if(typeof recordPastLetter==='function') recordPastLetter(_lastMsg.content, S.character?.name, S.scenario?.id, _karmaForLastWord);
        if(typeof recordTestament==='function'){
          const _toneMap = {vengeful:'vengeful', peaceful:'hopeful', humorous:'cryptic', heroic:'heroic', tragic:'regretful'};
          recordTestament(_toneMap[_tone]||'hopeful', S.character?.name, S.scenario?.id);
        }
      }
      if(_lastMsg && /암습|암살|독살|기습.*당하|등 뒤에서/.test(_lastMsg.content||'') && typeof recordAssassinDeath==='function'){
        recordAssassinDeath();
      }
      // 사망 원인별 보너스 — 마지막 메시지에서 원인 키워드 감지
      if(_lastMsg && typeof recordDeathCause==='function'){
        const _deathCauseKw = {
          poison:['독','중독','맹독'], starved:['굶주','기아','아사'],
          betrayed:['배신','등에 칼'], magic:['마법에','저주받은 마법','폭발한 마력'],
          fall:['추락','떨어져','낙하'], curse:['저주에','저주로 인해'],
          old_age:['노환','천수','늙어서'], combat:['전투 중','칼에 맞','베여','찔려'],
        };
        for(const [cause,kws] of Object.entries(_deathCauseKw)){
          if(kws.some(kw=>_lastMsg.content.includes(kw))){
            recordDeathCause(cause);
            if(cause==='curse' && typeof recordCurseLineage==='function') recordCurseLineage('marked_by_death', '저주로 인한 죽음', S.scenario?.id);
            break;
          }
        }
        // 속성별 사망 감지 (원소 트라우마)
        if(typeof recordElementDeath==='function'){
          const _elemDeathKw = {fire:['화염','불길','타올라'],ice:['얼음','냉기','얼어'],lightning:['번개','전격'],earth:['대지','돌더미','흙에'],poison:['독','맹독'],holy:['신성','성스러운 빛'],darkness:['암흑','어둠에'],light:['빛에','섬광']};
          for(const [elem,kws] of Object.entries(_elemDeathKw)){
            if(kws.some(kw=>_lastMsg.content.includes(kw))){ recordElementDeath(elem); break; }
          }
        }
        // 무기로 사망 시 원한 무기 기록
        if(typeof recordGrudgeWeapon==='function'){
          const _weaponDeathKw = {'검':'sword','지팡이':'staff','활':'bow','단검':'dagger'};
          for(const [kw,wname] of Object.entries(_weaponDeathKw)){
            if(_lastMsg.content.includes(kw)){ recordGrudgeWeapon(wname, null, S.scenario?.id); break; }
          }
        }
      }
      // 회차 진행 관련 — 큰 주기 리셋, 봉인된 신 파편, 미스터리 퍼즐 조각
      const _cycleForDeath = (typeof loadCycleCount==='function') ? loadCycleCount() : 0;
      if(typeof checkGreatCycleReset==='function') checkGreatCycleReset(_cycleForDeath);
      if(typeof collectGodShard==='function') collectGodShard(S.scenario?.id);
      if(typeof collectMysteryPiece==='function') collectMysteryPiece(_cycleForDeath);
      // 나이 역설 — 실제 나이 데이터가 없어 이번 생 턴 수(생애 길이)로 대체 판단
      if(typeof recordAgeParadox==='function'){
        const _lifeTurns = S.msgCount||0;
        const _deathAgeType = _lifeTurns>=80 ? 'elder' : _lifeTurns<=20 ? 'young' : 'prime';
        recordAgeParadox(_deathAgeType);
      }
    }catch(e){}
    setTimeout(() => {
      window._loopDeathTriggered = false;
      toast('💀 HP가 0에 도달했습니다. 전생이 끝났습니다...', 3500);
      setTimeout(() => {
        if (typeof showReincScreen === 'function') showReincScreen();
        else if (typeof showScreen === 'function') showScreen('reincarnation');
      }, 2000);
    }, 500);
  } catch(e) {}
}
window._proceedToDeathAfterDealDeclined = _proceedToDeathAfterDealDeclined;

window.saveLoopRecord    = saveLoopRecord;

window.transferLoopLegacy = transferLoopLegacy;

window.getLoopRewards    = getLoopRewards;

window.startNewCycle     = startNewCycle;

window.endCycle          = endCycle2;

window.getLoopBLS        = getLoopBLS;

window.checkLoopCondition = checkLoopCondition;

// [19차 감사 FIX] 실제 "새 삶 시작" 버튼이 부르는 doReincarnate()(quest/086)에
// 루프 기록 저장(getLoopBLS가 읽는 그 기록) + 유산 이전 + 전생 유물/유물
// 파편/시간 역행 토큰 지급을 실제로 연결한다. summarizeHistory/loadNPCs는
// 리셋 전 상태가 필요하므로 orig 호출 전에, 보상/유물 지급은 새 회차
// 스탯에 적용돼야 하므로 orig 호출 후에 실행한다.
(function hookLoopRecordIntoReincarnate(){
  setTimeout(()=>{
    const orig = window.doReincarnate;
    if(typeof orig==='function' && !orig._loopRecordHooked){
      window.doReincarnate = function(){
        try{
          const cyc = typeof loadCycleCount==='function' ? loadCycleCount() : 0;
          const summary = summarizeHistory();
          const npcs = typeof loadNPCs==='function' ? loadNPCs() : [];
          const relMap = {};
          npcs.forEach(n=>{ if(n.relationship>50) relMap[n.name]=n.relationship; });
          saveLoopRecord({ summary, relationships: relMap, cycle: cyc });
        }catch(e){}
        const r = orig.apply(this, arguments);
        try{
          const newCyc = typeof loadCycleCount==='function' ? loadCycleCount() : 0;
          applyLoopCycleExtras(newCyc);
        }catch(e){}
        return r;
      };
      window.doReincarnate._loopRecordHooked = true;
    }
  }, 2600);
})();
