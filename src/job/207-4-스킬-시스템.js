// [4] 스킬 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveSession } from '../misc/001-block0-preamble.js';
import { getAllSkillDefs } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { gainEvoEnergy } from '../misc/206-3-진화Evolution-시스템.js';
import { applySkillCooldown, isSkillOnCooldown } from '../misc/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { autoDropLootOnDeath, calcMonsterDamageMultiplier, renderMonsters, tryReviveMonster } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { addThrall, checkDominationAbility } from '../ui/026-renderHumanAwakeningPanel-완전-재정의.js';
import { applyStatusEffect } from '../ui/155-⑭-메모리-패널-UI.js';
import { lsSet, toast } from '../utils.js';
import { SKILLS_KEY, loadSkills } from './002-스킬-시스템.js';

export function getActiveSkills() {
  try {
    const sk = loadSkills ? loadSkills() : {};
    return Object.entries(sk).map(([id, data]) => ({ id, ...data }));
  } catch(e) { return []; }
}
window.getActiveSkills = getActiveSkills;

export function useSkill(skillId) {
  try {
    const skills = loadSkills ? loadSkills() : {};
    const skillRecord = skills[skillId];
    if (!skillRecord) return false;

    // [B-1 FIX] mpCost 및 효과는 스킬 정의에서 가져옴 (저장 레코드에는 없음)
    const allDefs = typeof getAllSkillDefs === 'function' ? getAllSkillDefs() : [];
    const skillDef = allDefs.find(s => s.id === skillId) || {};
    const cost = skillDef.mpCost || skillRecord.mpCost || 10;

    // [버그 수정] 쿨다운 체크 — AI가 skill_use로 자동 발동시키는 경로에도
    // 쿨다운 검사가 없었다. 다른 두 경로(activateSkill, processSkillBeforeSend)
    // 와 동일한 규칙을 적용해 일관되게 막는다.
    if (typeof isSkillOnCooldown === 'function' && isSkillOnCooldown(skillId)) {
      toast(`⏳ ${skillDef.name || skillId} 쿨다운 중`, 1800);
      return false;
    }

    if (S?.stats?.mp !== undefined) {
      if (S.stats.mp < cost) { toast(`MP가 부족합니다! (필요: ${cost}MP)`, 1800); return false; }
      S.stats.mp = Math.max(0, S.stats.mp - cost);
    }
    // 사용 횟수 기록
    skillRecord.usedCount = (skillRecord.usedCount || 0) + 1;
    skillRecord.lastUsed = S?.msgCount || 0;
    if (typeof lsSet === 'function') lsSet(SKILLS_KEY, JSON.stringify(skills));

    // 스킬 효과 적용 (정의 기반)
    applySkillEffect(skillId, skillDef);

    // [버그 수정] 쿨다운 소모 — 발동 직후 실제로 쿨다운을 건다.
    if (typeof applySkillCooldown === 'function') applySkillCooldown(skillId, skillDef);

    // 업적 체크
    if (skillRecord.usedCount === 1) { try { unlockAchievement('first_skill'); } catch(e2) {} }
    // 진화 에너지
    try { gainEvoEnergy(5, '스킬 사용'); } catch(e2) {}
    if (typeof window.updateHeader === 'function') window.updateHeader();
    if (typeof saveSession === 'function') saveSession();
    return true;
  } catch(e) { return false; }
}
window.useSkill = useSkill;

export function applySkillEffect(skillId, skill) {
  try {
    if (!skill || !S?.stats) return;
    const effects = skill.effects || {};

    // [버그 수정] hpRestore 필드는 그동안 processSkillBeforeSend(유저가
    // 스킬 아이콘을 눌러 쓰는 경로)에서만 처리되고, 이 함수(applySkillEffect,
    // useSkill()이 호출하는 AI 자동발동 경로)에는 전혀 반영되지 않았다.
    // 즉 회복 스킬을 AI가 skill_use로 자동 발동시키면 MP만 소모되고
    // 실제 회복은 전혀 일어나지 않는 상태였다 — 헤드리스 재현으로 확인.
    if (skill.hpRestore) {
      S.stats.hp = Math.min(S.stats.maxHp || 999, (S.stats.hp || 0) + skill.hpRestore);
      toast(`💚 ${skill.name || skillId}: HP +${skill.hpRestore} 회복`, 2200);
    }

    // ── [신규] 표준 스키마(kind 필드가 있는 경우) — 로컬 계산 엔진으로 처리 ──
    // 기존 단순 effects.hp/mp/str 방식과 공존하도록, kind가 있을 때만
    // 새 경로를 타고 없으면 기존 레거시 처리로 그대로 넘어간다.
    if (effects.kind && typeof resolveSkillEffect === 'function') {
      const result = resolveSkillEffect(skillId, null);
      if (result) {
        switch (result.kind) {
          case 'damage': {
            // [버그 수정] 기존엔 데미지를 계산만 하고 실제로 어떤 대상의
            // HP도 깎지 않아, AI 서사 전투에서 데미지 스킬이 토스트만
            // 뜨고 실질적 효과가 없었다. 현재 전투 중인 몬스터 중 살아
            // 있는 대상을 자동으로 찾아 실제로 피해를 적용한다.
            try{
              const monsters = typeof loadMonsters==='function' ? loadMonsters() : [];
              const target = monsters.find(m=>m.status==='alive');
              if(target){
                let skillDmg = result.damage;
                let elemNote = '';
                // [버그 수정] 스킬 고유 속성이 있어도 대상 약점/저항과
                // 대조하는 배율이 빠져 있었다 — 로컬 전투와 동일하게 적용.
                if(result.element && result.element!=='physical' && typeof calcMonsterDamageMultiplier==='function'){
                  const affinity = calcMonsterDamageMultiplier(result.element, target);
                  if(affinity.mod !== 1.0){
                    skillDmg = Math.round(skillDmg * affinity.mod);
                    elemNote = ` [${affinity.label}!]`;
                  }
                }
                target.hp = Math.max(0, (target.hp||0) - skillDmg*(result.hits||1));
                // lifesteal — 실제로 몬스터에게 피해를 입혔을 때만(대상 없으면
                // 흡혈할 게 없으므로 적용 안 함) 자기 HP를 회복시킨다.
                if(result.lifesteal > 0){
                  S.stats.hp = Math.min(S.stats.maxHp||999, (S.stats.hp||0) + result.lifesteal);
                }
                // [종족 특성] 흡혈(lifesteal) 스킬은 대상을 무력화할수록
                // 권속화 확률이 함께 오른다 — "피를 마실 때마다 굴복시킬
                // 기회를 노린다"는 종족 컨셉을 매 사용마다 자연스럽게
                // 반영한다. 지배 능력이 없는 종족/직업(checkDominationAbility
                // 실패)이면 조용히 건너뛴다 — 흡혈 자체는 정상 진행.
                let thrallNote = '';
                if(result.lifesteal > 0 && typeof checkDominationAbility==='function' && typeof addThrall==='function'){
                  const domCheck = checkDominationAbility();
                  if(domCheck.ok){
                    const hpRatio = target.maxHp ? (target.hp / target.maxHp) : 1;
                    // 기본 확률 10%, 대상 HP가 낮을수록 최대 +55%p, 이미
                    // 무력화(incap) 상태면 추가 +20%p — 몰아붙일수록 굴복시키기
                    // 쉬워진다는 의도.
                    let chance = 0.10 + (1 - hpRatio) * 0.55;
                    if(target.status === 'incap') chance += 0.20;
                    chance = Math.min(0.9, chance);
                    if(target.status !== 'dead' && Math.random() < chance){
                      const thrallOk = addThrall(target.name, null, `흡혈 중 권속화 (${skill.name})`);
                      if(thrallOk){
                        target.status = 'incap'; // 권속화된 대상은 전투에서 이탈
                        target.incapReason = '권속화됨';
                        thrallNote = ` 👑 ${target.name} 권속화 성공!`;
                      }
                    }
                  }
                }
                if(target.hp <= 0 && target.status === 'alive'){
                  // 스킬로 처치한 경우에도 기존 enemy_damage 자동화와 동일한
                  // 사망/부상 확률 판정을 적용해 일관성을 유지한다.
                  const deathChance = target.isBoss ? 0.25 : target.isNamed ? 0.40 : 0.60;
                  if(Math.random() < deathChance){
                    target.status = 'dead'; target.hp = 0;
                    toast(`💀 ${target.name} 사망`, 2500);
                    if(typeof autoDropLootOnDeath==='function') autoDropLootOnDeath(target);
                  } else {
                    target.status = 'incap';
                    target.incapReason = '치명상';
                    target.hp = Math.max(1, Math.round((target.maxHp||target.hp||50)*0.05));
                  }
                  if(typeof tryReviveMonster==='function' && tryReviveMonster(target)){
                    toast(`🌑 ${target.name}이(가) 다시 일어섰다!`, 3000);
                  }
                }
                if(typeof saveMonsters==='function') saveMonsters(monsters);
                if(typeof renderMonsters==='function') renderMonsters();
                toast(`⚔️ ${skill.name}: ${target.name}에게 ${skillDmg} 피해${result.hits>1?` ×${result.hits}`:''}${elemNote}${result.lifesteal>0?` 🩸+${result.lifesteal} 흡혈`:''}${thrallNote}`, 2200);
              } else {
                toast(`⚔️ ${skill.name}: ${result.damage} 피해${result.hits>1?` ×${result.hits}`:''} (대상 없음)`, 2200);
              }
            }catch(e){
              toast(`⚔️ ${skill.name}: ${result.damage} 피해${result.hits>1?` ×${result.hits}`:''}`, 2200);
            }
            break;
          }
          case 'heal': {
            S.stats.hp = Math.min(S.stats.maxHp||999, (S.stats.hp||0) + result.heal);
            toast(`💚 ${skill.name}: HP +${result.heal} 회복`, 2200);
            break;
          }
          case 'buff':
          case 'debuff':
          case 'statBoost': {
            for (const k in result.statMod) {
              if (S.stats[k] !== undefined) S.stats[k] = (S.stats[k]||0) + result.statMod[k];
            }
            toast(`✨ ${skill.name}: ${Object.entries(result.statMod).map(([k,v])=>`${k}${v>=0?'+':''}${v}`).join(', ')}`, 2500);
            // [버그 수정] duration이 있는 buff/debuff는 그동안 적용만 되고
            // 절대 만료되지 않았다(즉시 스탯을 더한 뒤 되돌리는 코드가 전혀
            // 없어서, "3턴간 STR+20" 같은 스킬이 실제로는 한 번 쓰면
            // 영구 적용이었다). duration<99인 경우만 만료 큐에 등록해
            // 턴 경과 후 자동으로 되돌린다(duration:99는 사실상 영구 지속
            // 의도인 패시브류라 제외).
            if (result.kind !== 'statBoost' && result.duration && result.duration < 99) {
              S._skillBuffQueue = S._skillBuffQueue || [];
              S._skillBuffQueue.push({
                statMod: result.statMod,
                expiresAtMsgCount: (S.msgCount||0) + result.duration,
                skillName: skill.name
              });
            }
            break;
          }
          case 'summon': {
            // 소환수를 실제로 등록 — 기존 loadSummons/saveSummons 스키마 재사용
            try {
              const summons = typeof window.loadSummons==='function' ? window.loadSummons() : [];
              const activeSummons = summons.filter(s=>s.status==='active');
              const roomLeft = Math.max(0, result.maxActive - activeSummons.length);
              const toSummon = Math.min(result.count, roomLeft);
              for (let i=0; i<toSummon; i++) {
                summons.push({
                  name: `${skill.name} 소환체 ${activeSummons.length+i+1}`,
                  icon: '💀', category:'undead', origin:'스킬 소환',
                  hp: result.summonHp, maxHp: result.summonHp,
                  atk: result.summonAtk, def: result.summonDef,
                  level:1, exp:0, loyalty:80, status:'active', mood:'neutral',
                  onMission:false, missionLog:[], dialogLog:[], totalKills:0, totalMissions:0,
                  summonedAt: new Date().toISOString(),
                });
              }
              if (typeof window.saveSummons==='function') window.saveSummons(summons);
              if (toSummon > 0) {
                toast(`💀 ${skill.name}: ${toSummon}기 소환 (${result.locationCategory==='graveyard'?'무덤 보정':result.locationCategory==='dungeon'?'던전 보정':'기본'}, HP${result.summonHp}/ATK${result.summonAtk})`, 3000);
              } else {
                toast(`⚠️ ${skill.name}: 이미 최대 유지 마릿수(${result.maxActive}기)에 도달했습니다.`, 2500);
              }
            } catch(e) {}
            break;
          }
        }
        return; // 표준 스키마 처리 완료 — 레거시 경로는 건너뜀
      }
    }

    // ── [기존] 레거시 단순 스탯 효과 처리 (하위 호환 유지) ──
    if (effects.hp)  S.stats.hp  = Math.min(S.stats.maxHp||999, (S.stats.hp||100)  + effects.hp);
    if (effects.mp)  S.stats.mp  = Math.min(S.stats.maxMp||999, (S.stats.mp||50)   + effects.mp);
    if (effects.str) S.stats.str = Math.min(999, (S.stats.str||50)  + effects.str);
    // 상태이상 효과
    if (effects.buff && typeof applyStatusEffect === 'function') applyStatusEffect(effects.buff);
    const eff = skill.desc || skill.effect || '';
    if (eff) toast(`✨ ${skill.name || skillId}: ${eff.slice(0,40)}`, 2000);
  } catch(e) {}
}
window.applySkillEffect = applySkillEffect;

export function expireSkillBuffs(){
  try{
    if (!S._skillBuffQueue || !S._skillBuffQueue.length) return;
    const now = S.msgCount||0;
    const stillActive = [];
    for (const entry of S._skillBuffQueue) {
      if (now >= entry.expiresAtMsgCount) {
        for (const k in entry.statMod) {
          if (S.stats[k] !== undefined) S.stats[k] = (S.stats[k]||0) - entry.statMod[k];
        }
        if (typeof toast === 'function') toast(`⏳ ${entry.skillName} 효과 종료`, 2000);
      } else {
        stillActive.push(entry);
      }
    }
    S._skillBuffQueue = stillActive;
  }catch(e){}
}
window.expireSkillBuffs = expireSkillBuffs;

window.expireSkillBuffs = expireSkillBuffs;

export function getSkillEffect(skillId) {
  try {
    const skills = loadSkills ? loadSkills() : {};
    return skills[skillId] || null;
  } catch(e) { return null; }
}
window.getSkillEffect = getSkillEffect;

export function checkSkillEvolution2(skillId) {
  try {
    const skills = loadSkills ? loadSkills() : {};
    const skill = skills[skillId];
    if (!skill) return;
    const uses = skill.usedCount || 0;
    const lv = skill.level || 1;
    if (uses >= lv * 20) {
      skill.level = lv + 1;
      lsSet(SKILLS_KEY, JSON.stringify(skills));
      toast(`⬆️ 스킬 진화: ${skillId} Lv.${skill.level}`, 2500);
    }
  } catch(e) {}
}
window.checkSkillEvolution2 = checkSkillEvolution2;

window.getActiveSkills   = getActiveSkills;

window.useSkill          = useSkill;

window.applySkillEffect  = applySkillEffect;

window.getSkillEffect    = getSkillEffect;

window.checkSkillEvolution = checkSkillEvolution2;
