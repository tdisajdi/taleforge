// 파트1-A: 스킬 실제 발동 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RACE_SKILL_CHOICES } from '../data/071-파트1-A-스킬-실제-발동-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getAllSkillDefs } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { getPlayerMaxHp } from '../misc/054-이동수단-시스템.js';
import { applySkillCooldown, getSkillCooldownRemaining, isSkillOnCooldown } from '../misc/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { gainCelestialCovenant, getCelestialCovenantStatus } from '../progression/020-101130번-환생-누적-시스템.js';
import { gainSkillXp, sendMsg } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { applyStatusEffect, clearStatusEffect } from '../ui/155-⑭-메모리-패널-UI.js';
import { esc, toast } from '../utils.js';
import { applySkillEffect } from './207-4-스킬-시스템.js';

window.pendingSkill = null;

export function showRaceSkillPopup(skillId) {
  const def = RACE_SKILL_CHOICES[skillId];
  if (!def) {
    // 정의된 선택지 없으면 기존 방식 (pendingSkill)
    if (typeof activateSkill === 'function') activateSkill(skillId);
    return;
  }

  // 쿨다운 체크
  if (typeof isSkillOnCooldown === 'function' && isSkillOnCooldown(skillId)) {
    const rem = typeof getSkillCooldownRemaining === 'function' ? getSkillCooldownRemaining(skillId) : '?';
    toastHTML(`⏳ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.name)} 쿨다운 중 (${esc(rem)}턴 남음)`, 2000);
    return;
  }
  // MP 체크
  if (def.mpCost > 0 && (S.stats?.mp || 0) < def.mpCost) {
    toast(`MP 부족 (${def.mpCost} 필요, 현재 ${Math.round(S.stats?.mp || 0)})`, 2000);
    return;
  }

  // 기존 팝업 제거
  const old = document.getElementById('race-skill-popup');
  if (old) old.remove();

  const popup = document.createElement('div');
  popup.id = 'race-skill-popup';
  popup.style.cssText = `
    position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
    width:min(92vw,420px);background:#0a0008;
    border:1px solid #5a1030;border-radius:4px;
    z-index:9999;box-shadow:0 4px 24px rgba(150,0,50,0.4);
    animation:fadeInUp .15s ease;
  `;

  const choices = def.choices.filter(c => !c.condition || c.condition());

  popup.innerHTML = `
    <div style="padding:10px 14px;border-bottom:1px solid #2a0018;display:flex;align-items:center;justify-content:space-between">
      <div>
        <span style="font-family:'Cinzel',serif;font-size:12px;color:#e04060">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:12}):(def.icon)} ${def.name}</span>
        ${def.mpCost > 0 ? `<span style="font-size:9px;color:#6060a0;margin-left:8px">MP ${def.mpCost}</span>` : ''}
        ${def.desc ? `<div style="font-size:8px;color:#804050;margin-top:2px">${def.desc}</div>` : ''}
      </div>
      <button onclick="document.getElementById('race-skill-popup')?.remove()"
        style="background:none;border:none;color:#804050;font-size:14px;cursor:pointer;padding:0 2px">✕</button>
    </div>
    <div style="padding:8px">
      ${def.choices.map((c, i) => {
        const ok = !c.condition || c.condition();
        const failMsg = !ok ? (c.conditionFail || '조건 미충족') : '';
        return `<button onclick="${ok ? `selectRaceSkillChoice('${skillId}', ${i})` : `void(0)`}"
          style="width:100%;text-align:left;padding:10px 12px;margin-bottom:5px;
                 background:${ok?'#0f0008':'#050003'};border:1px solid ${ok?'#2a1020':'#1a0010'};
                 color:${ok?'#c08090':'#3a1020'};
                 font-size:11px;cursor:${ok?'pointer':'not-allowed'};border-radius:3px;
                 font-family:'Crimson Text',serif;line-height:1.5;
                 opacity:${ok?1:0.5};transition:border-color .15s"
          ${ok?`onmouseover="this.style.borderColor='#803050';this.style.background='#180010'"
          onmouseout="this.style.borderColor='#2a1020';this.style.background='#0f0008'"`:''}>
          ${c.label}
          ${!ok ? `<div style="font-size:8px;color:#601020;margin-top:3px">⚠️ ${failMsg}</div>` : ''}
        </button>`;
      }).join('')}
    </div>
  `;

  document.body.appendChild(popup);

  // 팝업 바깥 클릭 시 닫기
  setTimeout(() => {
    document.addEventListener('click', function outsideClick(e) {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', outsideClick);
      }
    });
  }, 100);
}
window.showRaceSkillPopup = showRaceSkillPopup;

window.showRaceSkillPopup = showRaceSkillPopup;

export function selectRaceSkillChoice(skillId, choiceIdx) {
  const def = RACE_SKILL_CHOICES[skillId];
  if (!def) return;
  const choice = def.choices[choiceIdx];
  if (!choice) return;

  // 팝업 닫기
  document.getElementById('race-skill-popup')?.remove();

  // MP 소모 (기본 + 선택지별 추가)
  const totalMpCost = (def.mpCost || 0) + (choice.extraMpCost || 0);
  if (totalMpCost > 0 && S.stats?.mp !== undefined) {
    S.stats.mp = Math.max(0, (S.stats.mp || 0) - totalMpCost);
  }
  // HP 소모 (선택지별)
  if ((choice.hpCost || 0) > 0 && S.stats?.hp !== undefined) {
    S.stats.hp = Math.max(1, (S.stats.hp || 100) - choice.hpCost);
    toast(`💔 HP -${choice.hpCost} (흡혈 의식)`, 1500);
  }
  // HP 회복 (흡혈 효과)
  if ((choice.hpGain || 0) > 0 && S.stats?.hp !== undefined) {
    const maxHp = S.stats.maxHp || 999;
    S.stats.hp = Math.min(maxHp, (S.stats.hp || 100) + choice.hpGain);
    toast(`🩸 흡혈 — HP +${choice.hpGain}`, 1800);
  }
  if (typeof window.updateHeader === 'function') window.updateHeader();
  // 쿨다운 적용
  if (typeof applySkillCooldown === 'function') applySkillCooldown(skillId);

  // pendingSkill 등록 (BLS에 스킬 사용 주입)
  const allDefs = typeof getAllSkillDefs === 'function' ? getAllSkillDefs() : [];
  const skillDef = allDefs.find(s => s.id === skillId);
  if (skillDef) {
    window.pendingSkill = skillDef;
  } else {
    // 종족 스킬은 getAllSkillDefs에 없을 수 있으니 임시 객체
    window.pendingSkill = {
      id: skillId, name: def.name, icon: def.icon,
      type: 'active', mpCost: def.mpCost || 0,
      aiHint: choice.msg,
    };
  }

  // 메시지 자동 전송
  const inp = document.getElementById('msg-inp');
  if (inp) inp.value = '';
  if (typeof sendMsg === 'function') {
    sendMsg(choice.msg, true);
  }

  if (typeof gainSkillXp === 'function') gainSkillXp(skillId);
}
window.selectRaceSkillChoice = selectRaceSkillChoice;

window.selectRaceSkillChoice = selectRaceSkillChoice;

export function getSkillContextChoices(sk){
  try{
    const name = sk.name||'스킬';
    const icon = sk.icon||'⚡';
    const isCombat = sk.condition==='in_combat' || (typeof loadMonsters==='function' && (loadMonsters()||[]).some(m=>m.status==='alive'));
    const opts = [];
    if(isCombat){
      opts.push(`${icon} ${name}을 사용해 적을 향해 전력으로 펼친다.`);
      opts.push(`${icon} ${name}으로 정면이 아닌 빈틈을 노려 기습적으로 사용한다.`);
      opts.push(`${icon} ${name}을 신중하게 가다듬어 최적의 순간에 사용한다.`);
    } else {
      opts.push(`${icon} ${name}을 사용한다.`);
      opts.push(`${icon} ${name}을 주변 상황에 맞게 응용해본다.`);
    }
    return opts;
  }catch(e){
    return [`${sk.icon||'⚡'} ${sk.name||'스킬'}을 사용한다.`];
  }
}
window.getSkillContextChoices = getSkillContextChoices;

window.getSkillContextChoices = getSkillContextChoices;

export function activateSkill(skillId){
  const sk = getAllSkillDefs().find(s=>s.id===skillId);
  if(!sk){ toast('스킬을 찾을 수 없습니다'); return; }
  if(!S.unlockedSkills[skillId]){ toast('해금되지 않은 스킬입니다'); return; }
  if(sk.type !== 'active'){ toast('패시브 스킬은 자동으로 적용됩니다'); return; }

  // MP 체크
  if(sk.mpCost > 0 && (S.stats.mp||0) < sk.mpCost){
    toast(`MP 부족 (${sk.mpCost} 필요, 현재 ${Math.round(S.stats.mp||0)})`); return;
  }
  // HP 비용 체크
  if(sk.hpCost > 0 && (S.stats.hp||0) <= sk.hpCost){
    toast(`HP 부족 (${sk.hpCost} 필요)`); return;
  }
  // 조건 체크
  if(sk.condition === 'in_combat'){
    const monsters = loadMonsters()||[];
    if(!monsters.some(m=>m.status==='alive')){ toast('전투 중에만 사용 가능합니다'); return; }
  }

  // [버그 수정] 쿨다운 체크 — 예전엔 이 함수(유저가 실제로 스킬을 쓰는
  // 메인 경로)에 쿨다운 검사가 전혀 없어서, 어떤 스킬이든 MP만 있으면
  // 매 턴 무제한 연타가 가능했다. isSkillOnCooldown/calcSkillCooldown
  // 규칙(SKILL_CD_DEFS 수동값 우선, 없으면 mpCost+rarity 기반 자동
  // 산출)로 실제로 막는다.
  if(typeof isSkillOnCooldown === 'function' && isSkillOnCooldown(skillId)){
    const rem = typeof getSkillCooldownRemaining === 'function' ? getSkillCooldownRemaining(skillId) : '?';
    toastHTML(`⏳ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)} 쿨다운 중 (${esc(rem)}턴 남음)`, 2000);
    return;
  }

  // 이전 스킬 취소 — 선택지도 스킬 사용 전 상태로 복원
  if(window.pendingSkill && window.pendingSkill.id === skillId){
    window.pendingSkill = null;
    if(S._choicesBeforeSkill){
      S.choices = S._choicesBeforeSkill;
      S._choicesBeforeSkill = null;
      if(typeof window.renderChoices==='function') window.renderChoices();
    }
    renderSkillQuickSlot();
    toast('스킬 취소', 1000);
    return;
  }

  // 이미 다른 스킬이 예약되어 있었다면, 원래 선택지 기준을 유지(중첩 저장 방지)
  if(!window.pendingSkill && !S._choicesBeforeSkill){
    S._choicesBeforeSkill = (S.choices||[]).slice();
  }

  window.pendingSkill = sk;
  renderSkillQuickSlot();
  // [신규] 선택지를 이 스킬에 맞는 행동으로 동적 교체 — 클릭만으로도 스킬 발동 가능
  if(typeof getSkillContextChoices==='function'){
    S.choices = getSkillContextChoices(sk);
    if(typeof window.renderChoices==='function') window.renderChoices();
  }
  // 입력창에 스킬 힌트 (자유 입력으로도 계속 사용 가능)
  const inp = document.getElementById('msg-inp');
  if(inp && !inp.value.includes('[스킬:')){
    inp.placeholder = `⚡ ${sk.icon} ${sk.name} 발동 중... 아래 선택지를 누르거나 직접 입력하세요`;
  }
  toastHTML(`⚡ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)} 준비됨! 선택지를 누르거나 행동을 입력하면 발동됩니다`, 2500);

  if(typeof gainSkillXp==='function') gainSkillXp(skillId);
}
window.activateSkill = activateSkill;

export function processSkillBeforeSend(userMsg){
  if(!window.pendingSkill) return userMsg;
  const sk = window.pendingSkill;
  // 선택지 교체로 저장해둔 "스킬 사용 전 선택지" 기록은 더 이상 필요 없음
  S._choicesBeforeSkill = null;

  // MP/HP 소모
  if(sk.mpCost > 0){
    S.stats.mp = Math.max(0, (S.stats.mp||0) - sk.mpCost);
    window.updateStats('totalMpUsed', sk.mpCost);
  }
  if(sk.hpCost > 0){
    S.stats.hp = Math.max(1, (S.stats.hp||0) - sk.hpCost);
  }

  // [버그 수정] 쿨다운 소모 — activateSkill()에서 쿨다운 중이면 애초에
  // 여기까지 못 오도록 막았지만(체크①), 실제로 다 쓰고 난 뒤 쿨다운을
  // "거는" 처리(소모③)가 없으면 매 턴 계속 재사용 가능하다. 스킬이
  // 실제로 발동되는 이 시점에 건다.
  if(typeof applySkillCooldown === 'function') applySkillCooldown(sk.id, sk);

  // [버그 수정] HP 회복은 여기서 직접 처리하지 않는다. applySkillEffect()에
  // 이제 hpRestore 처리가 통합되어 있어서(useSkill() 경로에서 회복이 전혀
  // 안 되던 버그를 고치며 추가함), 여기서도 직접 더하면 hpRestore와
  // effects.kind(damage/buff)를 동시에 가진 스킬(job_pal_smite,
  // db_guard_roar, job_abp_miracle)에서 회복이 두 번 적용되는 걸 헤드리스
  // 재현으로 확인했다(HP+8 스킬이 실제로 +16 적용됨). 아래 applySkillEffect
  // 호출 한 번으로 hpRestore/effects 전부 정확히 1회씩만 처리한다.

  // ── [신규] 표준 스키마(effects.kind) 스킬은 시스템이 직접 데미지/회복/버프를
  // 계산한다. 기존엔 이 경로(유저가 스킬 아이콘을 눌러 쓰는 방식)가 [스킬:이름]
  // 태그만 붙여 AI에게 넘기고, 실제 숫자는 AI가 서사만 보고 즉흥 판단했다 —
  // useSkill()(AI의 skill_use 자동발동 경로)과 동일하게 applySkillEffect를
  // 호출해, 어느 경로로 스킬을 쓰든 동일한 로컬 계산 엔진을 타도록 통일한다.
  //
  // [예외] 세레스티얼 계율 스킬 5개(cc_s2_purify_touch, cc_s4_salvation,
  // cc_sm2_tainted_heal, cc_sm3_dark_dominion, cc_sm4_abyss_incarnate)는
  // 바로 아래에 이미 전용 하드코딩 로직이 있다. 실제 재현 검증 결과
  // (헤드리스 테스트: HP 50 → effects.heal +20 채운 뒤 실행 → 90으로
  // 이중 반영 확인됨) 이 5개에 표준 effects를 채우면 반드시 이중 실행이
  // 일어나는 것으로 확정됐다. 따라서 이 5개는 절대 표준 스키마로
  // 마이그레이션하지 말고, 여기서 명시적으로 건너뛴다. ──
  const CELESTIAL_LEGACY_ONLY_IDS = ['cc_s2_purify_touch','cc_s4_salvation','cc_sm2_tainted_heal','cc_sm3_dark_dominion','cc_sm4_abyss_incarnate'];
  if((sk.hpRestore || (sk.effects && sk.effects.kind)) && !CELESTIAL_LEGACY_ONLY_IDS.includes(sk.id) && typeof applySkillEffect==='function'){
    try{ applySkillEffect(sk.id, sk); }catch(e){}
  } else if(sk.hpRestore > 0 && CELESTIAL_LEGACY_ONLY_IDS.includes(sk.id)){
    // 세레스티얼 5개는 hpRestore가 있어도 applySkillEffect를 타지 않는다
    // (전용 하드코딩 로직이 바로 아래에서 자체적으로 HP를 회복시킨다).
    S.stats.hp = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), (S.stats.hp||0) + sk.hpRestore);
  }

  // ── 💛 세레스티얼 계율 스킬 특수 효과 ─────────────────────────
  // ★ 신성 스킬
  if(sk.id === 'cc_s2_purify_touch'){
    // 저주·독·상태이상 정화 + HP 회복
    S.stats.hp = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), (S.stats.hp||100) + 20);
    try{ if(typeof clearStatusEffect==='function'){ clearStatusEffect('poison'); clearStatusEffect('curse'); clearStatusEffect('blind'); } }catch(e){}
    toast('🌟 성광 정화 — 저주·독 정화! HP +20', 2500);
    if(typeof gainCelestialCovenant === 'function') gainCelestialCovenant('heal', 5);
  }
  if(sk.id === 'cc_s3_holy_brand'){
    // 적에게 신성 낙인 — 다음 전투 판정 보너스 부여
    S._tempBoosts = S._tempBoosts || {};
    S._tempBoosts['holy_brand_bonus'] = 20;
    setTimeout(()=>{ if(S._tempBoosts) delete S._tempBoosts['holy_brand_bonus']; }, 8000);
    toast('🔯 신성 낙인 — 다음 신성 판정 +20!', 2500);
    if(typeof gainCelestialCovenant === 'function') gainCelestialCovenant('judge', 6);
  }
  if(sk.id === 'cc_s4_salvation'){
    // HP 전부 소모하고 아군 전체 소생 (HP를 최소값으로)
    if(S.stats) S.stats.hp = 1;
    toast('🌈 구원 — HP를 모두 바쳐 전장을 정화한다!', 3000);
    if(typeof gainCelestialCovenant === 'function') gainCelestialCovenant('sacrifice', 20);
  }
  if(sk.id === 'cc_s4_divine_immortal'){
    // 패시브 발동 시 표시용 — 실제 사망 전환은 HP 0 체크 로직에서 처리
    toast('♾️ 신성 불멸 — 사망 시 부활 준비 완료', 2000);
  }
  if(sk.id === 'cc_s5_divine_miracle' || sk.id === 'cc_s4_celestial_call'){
    // 기적: HP 완전 회복 + 일시 강화
    S.stats.hp = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), (S.stats.hp||100) + 60);
    S._tempBoosts = S._tempBoosts || {};
    S._tempBoosts['divine_miracle_bonus'] = 25;
    setTimeout(()=>{ if(S._tempBoosts) delete S._tempBoosts['divine_miracle_bonus']; }, 10000);
    toast(`${sk.name} — HP+60, 판정+25 (10초)`, 3000, sk);
    if(typeof gainCelestialCovenant === 'function') gainCelestialCovenant('miracle', 15);
  }
  // ★ 타락 스킬
  if(sk.id === 'cc_sm2_tainted_heal'){
    // 오염된 치유 — HP 회복 + 30% 확률 독 부여
    S.stats.hp = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), (S.stats.hp||100) + 15);
    if(Math.random() < 0.3){
      try{ applyStatusEffect('poison'); }catch(e){}
      toast('💜 오염된 치유 — HP+15, 하지만 독에 감염!', 2500);
    } else {
      toast('💜 오염된 치유 — HP+15 (간신히 정화됨)', 2000);
    }
  }
  if(sk.id === 'cc_sm3_dark_dominion'){
    // 어둠의 지배 — 다음 공격/공포 판정 대폭 강화
    S._tempBoosts = S._tempBoosts || {};
    S._tempBoosts['dark_dominion_bonus'] = 25;
    setTimeout(()=>{ if(S._tempBoosts) delete S._tempBoosts['dark_dominion_bonus']; }, 8000);
    toast('⛓️ 어둠의 지배 — 공포·공격 판정 +25 (8초)!', 2500);
  }
  if(sk.id === 'cc_sm4_abyss_incarnate'){
    // 심연 강림 — 전투 판정 +30, 신성 존재에게 추가 피해
    S._tempBoosts = S._tempBoosts || {};
    S._tempBoosts['abyss_incarnate_bonus'] = 30;
    setTimeout(()=>{ if(S._tempBoosts) delete S._tempBoosts['abyss_incarnate_bonus']; }, 12000);
    // HP 소폭 감소 (심연의 힘 반동)
    S.stats.hp = Math.max(1, (S.stats.hp||100) - 10);
    toast('🖤 심연 강림 — 전투 판정 +30, HP -10 (반동)', 3000);
  }
  // ─────────────────────────────────────────────────────────────

  window.updateHeader();

  // 메시지에 스킬 태그 추가
  const taggedMsg = `[스킬:${sk.name}] ${userMsg}`;
  window.pendingSkill = null;
  const inp = document.getElementById('msg-inp');
  if(inp) inp.placeholder = '행동이나 대화를 입력하세요...';
  renderSkillQuickSlot();
  return taggedMsg;
}
window.processSkillBeforeSend = processSkillBeforeSend;

export function renderSkillQuickSlot(){
  const slot = document.getElementById('skill-quickslot');
  if(!slot) return;

  // 자주 쓰는 액티브 스킬 최대 6개
  const allSkills = getAllSkillDefs();
  const activeSkills = allSkills.filter(sk=>
    sk.type==='active' && S.unlockedSkills[sk.id]
  ).slice(0,6);

  if(!activeSkills.length){
    slot.innerHTML = '';
    slot.style.display = 'none';
    return;
  }

  slot.style.display = 'flex';
  slot.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;padding:4px 0 3px';
  slot.innerHTML = '<span style="font-size:9px;color:#4a3a1a;font-family:Cinzel,serif;letter-spacing:1px;align-self:center;flex-shrink:0">⚡스킬</span>'
    + activeSkills.map(sk=>{
    const isPending = window.pendingSkill?.id === sk.id;
    // [버그 수정] 쿨다운 중인지도 버튼 활성화 여부에 반영한다. 예전엔
    // MP만 체크해서, 쿨다운 중인 스킬도 버튼이 멀쩡하게 눌러지는 것처럼
    // 보이다가 실제로 눌러야만 "쿨다운 중" 토스트가 떴다.
    const onCooldown = typeof isSkillOnCooldown === 'function' && isSkillOnCooldown(sk.id);
    const cdRemain = onCooldown && typeof getSkillCooldownRemaining === 'function' ? getSkillCooldownRemaining(sk.id) : 0;
    const canUse = !onCooldown && (S.stats.mp||0) >= sk.mpCost;
    const rc = isPending ? '#c8a96e' : onCooldown ? '#8a5a3a' : canUse ? '#5a8fc0' : '#3a2a0a';
    const bg = isPending ? '#2a1f05' : onCooldown ? '#150d05' : canUse ? '#0a1018' : '#080500';
    const _isRaceSkill = sk.id && sk.id.startsWith('race_') && typeof RACE_SKILL_CHOICES!=='undefined' && RACE_SKILL_CHOICES[sk.id];
    return `<button onclick="${_isRaceSkill?'showRaceSkillPopup':'activateSkill'}('${sk.id}')"
      style="padding:3px 8px;background:${bg};
      border:1px solid ${rc};border-radius:3px;font-size:10px;cursor:pointer;
      color:${rc};opacity:${canUse?1:0.35};transition:all .2s;flex-shrink:0;
      font-family:Crimson Text,serif;letter-spacing:.3px;
      ${isPending?'box-shadow:0 0 6px '+rc+'44;':''}"
      title="${esc(sk.name)} — MP ${sk.mpCost} 소모${onCooldown?` (쿨다운 ${cdRemain}턴 남음)`:''}\n${esc(sk.desc||'')}">
      ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:8}):(sk.icon)} ${esc(sk.name)}<span style="font-size:8px;margin-left:3px;color:#6a9a6a">${onCooldown?'⏳'+cdRemain:sk.mpCost>0?'MP'+sk.mpCost:''}</span>${isPending?'<span style="color:#c8a96e;margin-left:2px">●준비</span>':''
    }</button>`;
  }).join('');
}
window.renderSkillQuickSlot = renderSkillQuickSlot;

export function applyPassiveEffects(diceRoll, effStat, usedStat){
  let bonus = 0;
  const unlocked = S.unlockedSkills||{};
  const allSkills = getAllSkillDefs();

  allSkills.filter(sk=>sk.type==='passive' && unlocked[sk.id]).forEach(sk=>{
    // 조건별 보너스
    if(sk.condition === 'always'){
      // statBoost는 이미 stats에 반영됨 - 추가 보너스 없음
    }
    if(sk.condition === 'in_combat'){
      const monsters = loadMonsters()||[];
      if(monsters.some(m=>m.status==='alive')) bonus += 5;
    }
    if(sk.condition === 'hp_critical'){
      if((S.stats.hp||100) < 30) bonus += 15;
    }
    if(sk.condition === 'hp_danger'){
      if((S.stats.hp||100) < 50) bonus += 8;
    }
    // ── 💛 계율 스킬 조건별 판정 보너스 ──
    // 신성 계열 패시브
    if(sk.id === 'cc_s1_pain_sense'){
      // 치유/감지 판정 시 보너스
      if(usedStat === 'fath' || usedStat === 'per') bonus += 8;
    }
    if(sk.id === 'cc_s2_holy_light'){
      // 어둠 속 판정 — 항시 소폭 보너스 (어둠 적 대상 판정 상향)
      bonus += 5;
    }
    if(sk.id === 'cc_s3_divine_sight'){
      // 대화/감지/설득 판정 보너스
      if(usedStat === 'per' || usedStat === 'spk' || usedStat === 'neg') bonus += 10;
    }
    if(sk.id === 'cc_s4_angelic_presence'){
      // 전투 중 아군 지원 판정 보너스 — 항시 +8
      bonus += 8;
    }
    if(sk.id === 'cc_s4_divine_immortal'){
      // 위기 상황(HP 위험) 판정 보너스
      if((S.stats.hp||100) < 40) bonus += 20;
    }
    // 타락 계열 패시브
    if(sk.id === 'cc_sm1_shadow_touch'){
      // -1단계: 공격/회피 판정 소폭 보너스, 신성 판정 소폭 페널티
      if(usedStat === 'str' || usedStat === 'agi') bonus += 5;
      if(usedStat === 'fath') bonus -= 4;
    }
    if(sk.id === 'cc_sm2_tainted_heal'){
      // 타락한 상태: 전투 판정 약소한 보너스
      bonus += 3;
    }
    if(sk.id === 'cc_sm3_corrupted_aura'){
      // 전투 중 공포/압박 판정 보너스
      const monsters = loadMonsters()||[];
      if(monsters.some(m=>m.status==='alive')){
        if(usedStat === 'fear' || usedStat === 'str') bonus += 12;
        else bonus += 6;
      }
    }
    if(sk.id === 'cc_sm4_void_wings'){
      // 어둠 계열: 회피/이동 판정 보너스 + 전투 전반 보너스
      if(usedStat === 'agi') bonus += 15;
      else bonus += 8;
    }
  });

  // ── 💛 계율 단계 자체의 판정 보정 (스킬 해금 여부 무관) ──
  if(typeof getCelestialCovenantStatus === 'function'){
    const cvStatus = getCelestialCovenantStatus();
    if(cvStatus){
      const stage = cvStatus.stageDef?.stage || 0;
      if(stage >= 2){
        // +2 이상: 신성 판정(fath, wil) 보너스
        if(usedStat === 'fath' || usedStat === 'wil') bonus += stage * 4;
        // 치유/설득 판정 소폭 보너스
        if(usedStat === 'spk' || usedStat === 'mgc') bonus += stage * 2;
      }
      if(stage >= 3){
        // +3 이상: 심판의 눈 — 거짓/진실 판정(per) 보너스
        if(usedStat === 'per') bonus += 12;
      }
      if(stage <= -1){
        // -1 이하 타락: 공격(str)/공포(fear) 판정 보너스
        const absStage = Math.abs(stage);
        if(usedStat === 'str' || usedStat === 'fear') bonus += absStage * 5;
        // 신성 판정(fath) 페널티
        if(usedStat === 'fath') bonus -= absStage * 6;
      }
      if(stage <= -2){
        // -2 이하: 회피/이동(agi) 판정 타락 보너스
        if(usedStat === 'agi') bonus += Math.abs(stage) * 3;
      }
      if(stage <= -3){
        // -3 이하: 어둠 마법(mgc) 판정 보너스
        if(usedStat === 'mgc') bonus += 15;
      }
    }
  }

  return bonus;
}
window.applyPassiveEffects = applyPassiveEffects;
