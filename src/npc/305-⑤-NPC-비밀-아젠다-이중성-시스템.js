// ⑤ 🎭 NPC 비밀 아젠다 / 이중성 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { loadNPCs } from '../misc/001-block0-preamble.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadGSFlags } from '../world/145-⑥-세계-상태-DB.js';

export const NPC_AGENDA_KEY = 'tf-npc-agenda';

export function loadNpcAgenda(){ try{ return JSON.parse(lsGet(NPC_AGENDA_KEY)||'{}'); }catch(e){ return {}; } }
window.loadNpcAgenda = loadNpcAgenda;

export function saveNpcAgenda(d){ try{ lsSet(NPC_AGENDA_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNpcAgenda = saveNpcAgenda;

export function isAidenInParty(){
  try {
    const gsF = (typeof loadGSFlags === 'function') ? loadGSFlags() : {};
    if(gsF['aiden_left'])   return false;
    if(gsF['aiden_joined']) return true;
    return false;
  } catch(e) { return false; }
}
window.isAidenInParty = isAidenInParty;

window.isAidenInParty = isAidenInParty;

// ══════════════════════════════════════════════════════════════════
// 로컬 아젠다 생성 엔진 (AI 미사용) — NPC의 role 키워드로 8가지
// 원형(상인/귀족/기사/사제/학자/도적/마법사/여관주인, 그 외는 평민)을
// 판정해, 원형별 비밀/두려움/목적/퀘스트제목 뱅크에서 조합한다.
// ══════════════════════════════════════════════════════════════════
const NPC_ARCHETYPE_PATTERNS = [
  { key:'merchant',   pattern:/상인|장사꾼|행상|무역상/ },
  { key:'noble',      pattern:/귀족|영주|백작|공작|후작|자작/ },
  { key:'knight',     pattern:/기사|병사|경비|용병|호위/ },
  { key:'priest',     pattern:/사제|성직자|신관|수녀|주교/ },
  { key:'scholar',    pattern:/학자|서기|사서|연구자|현자/ },
  { key:'rogue',      pattern:/도적|암살자|도둑|밀수꾼/ },
  { key:'mage',       pattern:/마법사|주술사|정령사|마도사/ },
  { key:'innkeeper',  pattern:/여관|주모|주인장|점주/ },
];
function classifyNpcArchetype(npc){
  const role = npc.role||'';
  for(const p of NPC_ARCHETYPE_PATTERNS){ if(p.pattern.test(role)) return p.key; }
  return 'commoner';
}
const NPC_AGENDA_BANK = {
  merchant:  { secret:['사실 밀수 조직과 연이 닿아 있다','장부의 일부를 조작해 왔다','예전에 큰 빚을 지고 도망친 적이 있다'],
               fear:['장부가 들통나는 것','옛 채권자와 마주치는 것'],
               goal:['이 마을을 떠나 새 출발을 하는 것','조용히 큰돈을 모아 자취를 감추는 것'],
               questTitle:['장부 너머의 진실','상인의 오래된 빚'] },
  noble:     { secret:['가문의 몰락을 숨기고 있다','평민 혈통이 섞여 있다는 사실을 숨기고 있다','정적을 몰래 돕고 있다'],
               fear:['가문의 명예가 실추되는 것','비밀이 새어나가는 것'],
               goal:['가문의 위신을 되찾는 것','권력 다툼에서 살아남는 것'],
               questTitle:['가문의 그림자','숨겨진 혈통'] },
  knight:    { secret:['과거 전투에서 동료를 버리고 도망친 적이 있다','명령을 어기고 몰래 누군가를 살려준 적이 있다'],
               fear:['그날의 일이 밝혀지는 것','다시 같은 선택을 해야 하는 상황'],
               goal:['그때의 잘못을 갚는 것','더 이상 도망치지 않는 사람이 되는 것'],
               questTitle:['잊지 못한 전장','기사의 속죄'] },
  priest:    { secret:['신을 향한 믿음을 잃은 지 오래됐다','금기된 의식에 손을 댄 적이 있다'],
               fear:['신도들이 진실을 알게 되는 것','믿음 없이 살아가야 한다는 두려움'],
               goal:['잃어버린 믿음을 다시 찾는 것','과거의 죄를 조용히 씻어내는 것'],
               questTitle:['흔들리는 믿음','금기의 기록'] },
  scholar:   { secret:['금서로 지정된 문헌을 몰래 소장하고 있다','한 연구 때문에 누군가를 위험에 빠뜨린 적이 있다'],
               fear:['연구가 미완성으로 끝나는 것','자신의 발견이 악용되는 것'],
               goal:['연구를 끝까지 완성하는 것','자신의 실수를 바로잡는 것'],
               questTitle:['금서의 행방','미완의 연구'] },
  rogue:     { secret:['한때 몸담았던 조직에서 배신하고 도망쳤다','누명을 쓰고 쫓기는 처지다'],
               fear:['옛 동료들에게 발각되는 것','다시 그 세계로 끌려 들어가는 것'],
               goal:['완전히 손을 씻고 평범하게 사는 것','자신을 배신한 자에게 되갚아주는 것'],
               questTitle:['그림자 속의 과거','배신의 대가'] },
  mage:      { secret:['금지된 마법을 연구하고 있다','스승을 배신하고 홀로 떠나온 과거가 있다'],
               fear:['금지된 지식이 발각되는 것','힘을 완전히 통제하지 못하게 되는 것'],
               goal:['금지된 마법의 위험을 스스로 감당할 방법을 찾는 것','스승에게 진 빚을 갚는 것'],
               questTitle:['금지된 지식','스승의 그림자'] },
  innkeeper: { secret:['여관 지하에 뭔가를 숨겨두고 있다','손님들의 뒷이야기를 몰래 팔아넘긴 적이 있다'],
               fear:['숨긴 것이 발각되는 것','단골손님들이 등을 돌리는 것'],
               goal:['조용히 지금의 삶을 지켜내는 것','숨긴 것을 안전한 곳으로 옮기는 것'],
               questTitle:['지하실의 비밀','여관의 뒷이야기'] },
  commoner:  { secret:['가족에게도 말 못 할 사정이 있다','과거 신분을 숨기고 살고 있다'],
               fear:['과거가 들통나는 것','지금의 평온한 삶을 잃는 것'],
               goal:['조용히 지금의 삶을 지키는 것','언젠가 떳떳하게 진실을 말하는 것'],
               questTitle:['말 못 할 사정','숨겨진 나날들'] },
};
const NPC_HINT_BANK = [
  '가끔 말끝을 흐리며 뭔가 숨기는 듯한 낌새를 보인다.',
  '특정 화제가 나오면 표정이 굳는다.',
  '평소와 다르게 눈을 피하는 순간이 있다.',
  '무심코 흘린 말 속에 숨은 사정이 느껴진다.',
];
const NPC_SOLO_PREFACE_BANK = ['다른 사람 앞에서는 절대 안 할 말이지만,', '왠지 당신에게는 조금 더 솔직해지고 만다.', '에이든이 없어서인지 평소보다 말이 많다.'];
const NPC_SOLO_LINE_BANK = ['당신, 혼자서도 제법이군.', '에이든 없이도 잘 해내는 모습이 인상적이다.', '가끔은 당신 혼자 하는 이야기가 더 흥미롭다.', '혼자 다니는 걸 보니 뭔가 사연이 있어 보인다.'];

function composeLocalNpcAgenda(npc){
  const arch = classifyNpcArchetype(npc);
  const bank = NPC_AGENDA_BANK[arch] || NPC_AGENDA_BANK.commoner;
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const hintSolo = (Math.random()<0.5 ? pick(NPC_SOLO_PREFACE_BANK)+' ' : '') + pick(NPC_HINT_BANK);
  return {
    secret: pick(bank.secret),
    fear: pick(bank.fear),
    goal: pick(bank.goal),
    hint: pick(NPC_HINT_BANK),
    hintSolo,
    questTitle: pick(bank.questTitle),
    soloLine: pick(NPC_SOLO_LINE_BANK),
  };
}
window.composeLocalNpcAgenda = composeLocalNpcAgenda;

export function generateNpcAgenda(npcName){
  const npcs = (typeof loadNPCs==='function') ? loadNPCs()||[] : [];
  const npc = npcs.find(n=>n.name===npcName);
  if(!npc) return;
  const agenda = loadNpcAgenda();
  if(agenda[npcName]) return; // 이미 생성됨
  const aidenWith = isAidenInParty();
  const result = composeLocalNpcAgenda(npc);
  agenda[npcName] = { ...result, rel: npc.relationship||50, revealed: false, hintShown: false, generatedSolo: !aidenWith };
  saveNpcAgenda(agenda);
}
window.generateNpcAgenda = generateNpcAgenda;

export function updateNpcAgendaFromRel(npcName, newRel){
  const agenda = loadNpcAgenda();
  if(!agenda[npcName]) return;
  const aidenWith = isAidenInParty();
  const hintThreshold = aidenWith ? 60 : 50;     // 솔로면 10 빨리 힌트
  const revealThreshold = aidenWith ? 80 : 72;   // 솔로면 8 빨리 전체 공개
  agenda[npcName].rel = newRel;
  if(newRel >= hintThreshold && !agenda[npcName].hintShown){
    agenda[npcName].hintShown = true;
    if(!aidenWith) toast(`🎭 ${npcName}이(가) 당신에게 마음을 조금 더 빨리 엽니다.`, 2400);
  }
  if(newRel >= revealThreshold && !agenda[npcName].revealed){
    agenda[npcName].revealed = true;
    toast(`🎭 ${npcName}의 비밀이 밝혀졌습니다!`, 3000);
  }
  saveNpcAgenda(agenda);
}
window.updateNpcAgendaFromRel = updateNpcAgendaFromRel;

export function getNpcAgendaSection(){
  const agenda = loadNpcAgenda();
  const entries = Object.entries(agenda);
  if(!entries.length) return '';
  const aidenWith = (typeof isAidenInParty==='function') ? isAidenInParty() : false;
  const hintThreshold = aidenWith ? 60 : 50;
  const revealThreshold = aidenWith ? 80 : 72;
  const lines = [];
  entries.forEach(([name, a])=>{
    const rel = a.rel||0;
    if(rel >= revealThreshold){
      lines.push(`• ${name}: 비밀이 이미 드러남 — "${a.secret||'?'}" (목적: ${a.goal||'?'})`);
    } else if(rel >= hintThreshold){
      const hintText = (!aidenWith && a.hintSolo) ? a.hintSolo : a.hint;
      if(hintText) lines.push(`• ${name}: 힌트 단계 — "${hintText}" 정도를 자연스럽게 흘릴 수 있음`);
    }
    if(!aidenWith && a.soloLine && rel < revealThreshold){
      lines.push(`• ${name}: 에이든 없이 혼자인 플레이어에게만 할 수 있는 말 — "${a.soloLine}"`);
    }
  });
  if(!lines.length) return '';
  return `\n[🎭 NPC 비밀 아젠다]\n${lines.join('\n')}\n관계도가 충분하지 않은 NPC는 비밀을 직접 말하지 않는다 — 위 힌트/대사만 자연스러운 타이밍에 사용하라.`;
}
window.getNpcAgendaSection = getNpcAgendaSection;

window.getNpcAgendaSection = getNpcAgendaSection;

export function renderNpcAgendaPanel(){
  const body = document.getElementById('pb-npc-agenda');
  if(!body) return;
  const agenda = loadNpcAgenda();
  const npcs = (typeof loadNPCs==='function') ? loadNPCs()||[] : [];
  const entries = Object.entries(agenda);
  const aidenWith = (typeof isAidenInParty==='function') ? isAidenInParty() : false;
  const hintThreshold = aidenWith ? 60 : 50;
  const revealThreshold = aidenWith ? 80 : 72;

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#c080d0;letter-spacing:1px;margin-bottom:4px">🎭 NPC 비밀 아젠다</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:10px;line-height:1.5">관계도 ${hintThreshold}+: 힌트 공개 / ${revealThreshold}+: 비밀 전체 공개 + 특수 퀘스트${aidenWith?'':' <span style="color:#c080d0">(에이든 없이 혼자 — 임계값 완화 적용 중)</span>'}</div>
      ${entries.length===0?`<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">NPC와 대화하면 자동으로 비밀 아젠다가 생성됩니다.</div>`:''}
      ${entries.map(([name, a])=>{
        const rel = a.rel||0;
        const relColor = rel>=revealThreshold?'#c080d0':rel>=hintThreshold?'#a060b0':rel>=40?'#6a5a7a':'#3a2a4a';
        const relBar = Math.min(100, rel);
        const hintText = (!aidenWith && a.hintSolo) ? a.hintSolo : a.hint;
        return `<div style="padding:12px 13px;background:#0a0010;border:1px solid ${rel>=revealThreshold?'#8040a0':rel>=hintThreshold?'#5030a0':'#2a1050'};margin-bottom:8px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="font-size:10px;color:#c080d0;font-family:Cinzel,serif">${esc(name)}</div>
            <div style="flex:1;height:4px;background:#1a0a30;border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${relBar}%;background:${relColor};transition:width .3s"></div>
            </div>
            <div style="font-size:9px;color:${relColor}">관계 ${rel}</div>
          </div>
          ${!aidenWith && a.soloLine?`<div style="margin-bottom:6px;padding:5px 8px;background:#100818;border-left:2px solid #8040a0;font-size:9px;color:#b890c8;font-style:italic">"${esc(a.soloLine)}"</div>`:''}
          ${rel>=revealThreshold?`
            <div style="margin-bottom:6px">
              <div style="font-size:9px;color:#ff6060;margin-bottom:3px">🔓 비밀</div>
              <div style="font-size:10px;color:#d0a0e0">${esc(a.secret||'?')}</div>
            </div>
            <div style="margin-bottom:6px">
              <div style="font-size:9px;color:#e08040;margin-bottom:3px">😱 두려움</div>
              <div style="font-size:10px;color:#c09070">${esc(a.fear||'?')}</div>
            </div>
            <div style="margin-bottom:6px">
              <div style="font-size:9px;color:#60c080;margin-bottom:3px">🎯 숨겨진 목적</div>
              <div style="font-size:10px;color:#80d0a0">${esc(a.goal||'?')}</div>
            </div>
            ${a.questTitle?`<div style="padding:5px 8px;background:#1a0a20;border:1px solid #5030a0;font-size:9px;color:#c080d0;font-family:Cinzel,serif">⚔️ 특수 퀘스트: ${esc(a.questTitle)}</div>`:''}
          `:rel>=hintThreshold?`
            <div style="font-size:10px;color:#9060a0;font-style:italic">"${esc(hintText||'뭔가 숨기고 있는 것 같다...')}"</div>
          `:`
            <div style="font-size:10px;color:#3a2a4a">관계도를 높이면 더 많은 것이 드러납니다. (${hintThreshold}: 힌트, ${revealThreshold}: 전체 공개)</div>
          `}
        </div>`;
      }).join('')}
    </div>`;
}
window.renderNpcAgendaPanel = renderNpcAgendaPanel;

window.renderNpcAgendaPanel = renderNpcAgendaPanel;

window.generateNpcAgenda = generateNpcAgenda;

window.updateNpcAgendaFromRel = updateNpcAgendaFromRel;

window.loadNpcAgenda = loadNpcAgenda;
