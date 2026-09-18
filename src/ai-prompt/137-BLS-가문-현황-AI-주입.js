// BLS — 가문 현황 AI 주입
// Auto-extracted from taleforge.html (original section banner preserved above).
import { CLAN_DEFS, loadClanPlayer } from '../core/135-저장-키.js';
import { isAidenInParty } from '../npc/305-⑤-NPC-비밀-아젠다-이중성-시스템.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';

export function getClanBLS(){
  const cp   = loadClanPlayer();
  const loc  = typeof loadCurrentLocation==='function' ? loadCurrentLocation() : null;
  const region = loc?.continent||'central';
  const lines  = [];

  // 1. 플레이어 소속 가문
  const memberClans = Object.entries(cp)
    .filter(([,v])=>v.status==='member')
    .map(([id,v])=>({id, ...v}));

  if(memberClans.length){
    lines.push('[🏴 소속 가문]');
    memberClans.forEach(mc=>{
      const def  = CLAN_DEFS[mc.id];
      const ranks= def?.ranks||[];
      lines.push(`• ${def?.icon||''} ${def?.name||mc.id} (${def?.grade}등급) — ${ranks[mc.rank]||'일반원'} / 평판 ${mc.rep}`);
      if(def?.philosophy) lines.push(`  철학: "${def.philosophy}"`);
    });
  }

  // 2. 적대 관계
  const enemyClans = Object.entries(cp)
    .filter(([,v])=>v.status==='enemy'||v.status==='rival')
    .map(([id])=>CLAN_DEFS[id]?.name||id);
  if(enemyClans.length) lines.push(`[⚔️ 적대 가문] ${enemyClans.join(' / ')}`);

  // 3. 현재 지역 주요 가문 (세계관 배경)
  const regionalClans = Object.values(CLAN_DEFS)
    .filter(d=>d.grade==='S'||d.grade==='A')
    .slice(0,3);
  if(regionalClans.length){
    lines.push('[🌍 이 세계의 주요 세력]');
    regionalClans.forEach(d=>{
      lines.push(`• ${d.icon} ${d.name}(${d.grade}) — ${d.domain}`);
    });
  }

  // 4. AI 서사 가이드
  if(memberClans.length){
    lines.push('[가문 서사 가이드]');
    memberClans.forEach(mc=>{
      const def = CLAN_DEFS[mc.id];
      if(!def) return;
      lines.push(`• ${def.name} NPC 대화 시: "${def.npcTone}"`);
      if(mc.rep >= 60)  lines.push(`  → 높은 평판: 가문 NPC들이 플레이어를 신뢰하고 정보를 공유한다.`);
      if(mc.rep <= -30) lines.push(`  → 낮은 평판: 가문 NPC들이 의심하거나 냉담하게 대한다.`);
      const rivals = (def.rivals||[]).map(r=>CLAN_DEFS[r]?.name).filter(Boolean);
      if(rivals.length) lines.push(`  → 적대 가문(${rivals.join(', ')}) NPC를 돕는 행동은 이 가문에 -평판`);
    });
    // [3순위 보강] 가문 NPC도 메인 스토리와 동일한 원칙으로 에이든 동행
    // 여부를 인지할 수 있다 — 거대 세력(S/A등급)일수록 에이든의 동향에
    // 민감하므로, 솔로 플레이일 때 플레이어 개인에게 더 집중하는 반응을
    // 유도한다.
    const aidenWith = (typeof isAidenInParty==='function') ? isAidenInParty() : false;
    const bigClanMember = memberClans.find(mc=>{ const d=CLAN_DEFS[mc.id]; return d&&(d.grade==='S'||d.grade==='A'); });
    if(bigClanMember && !aidenWith){
      lines.push(`  → 에이든이 동행하지 않는 상태다. ${CLAN_DEFS[bigClanMember.id]?.name}처럼 대륙급 세력은 이런 동향에 민감할 수 있다 — "에이든 없이 혼자 가문 일을 처리하는군" 식으로, 플레이어 개인의 역량을 더 직접적으로 평가하는 반응을 자연스럽게 섞어도 좋다.`);
    }
    lines.push('GS 가이드:');
    lines.push('• 가문 의뢰 완료 → {"clan_rep_delta":{"clan":"ID","delta":10,"reason":"의뢰 완료"}}');
    lines.push('• 가문 NPC 배신 → {"clan_rep_delta":{"clan":"ID","delta":-20,"reason":"배신"}}');
    lines.push('• 가문 승진 이벤트 → {"clan_promote":"ID"}');
    lines.push('• 가문 가입 제안 → {"clan_join":"ID"}');
  }

  return lines.length ? '\n\n' + lines.join('\n') : '';
}
window.getClanBLS = getClanBLS;

window.getClanBLS = getClanBLS;

(function hookClanToBLS(){
  setTimeout(()=>{
    const fn = typeof window.buildLightSystem==='function'?'buildLightSystem'
             : typeof window.buildSystemPrompt==='function'?'buildSystemPrompt'
             : typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn) return;
    const orig = window[fn];
    if(typeof orig==='function' && !orig._clanBLSHooked){
      window[fn] = function(){
        const r = orig.apply(this, arguments);
        try{ const b=getClanBLS(); return b&&typeof r==='string'?r+b:r; }catch(e){ return r; }
      };
      window[fn]._clanBLSHooked = true;
    }
  }, 4500);
})();
