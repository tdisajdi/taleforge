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
  merchant:  { secret:['사실 밀수 조직과 연이 닿아 있다','장부의 일부를 조작해 왔다','예전에 큰 빚을 지고 도망친 적이 있다','경쟁 상인의 뒤를 몰래 캐고 있다','귀한 물건의 출처를 숨기고 팔아왔다'],
               fear:['장부가 들통나는 것','옛 채권자와 마주치는 것','거래처가 등을 돌리는 것','과거 동업자에게 약점을 잡히는 것','소문이 퍼져 신용을 잃는 것'],
               goal:['이 마을을 떠나 새 출발을 하는 것','조용히 큰돈을 모아 자취를 감추는 것','숨겨둔 재산을 안전하게 지키는 것','예전 은인에게 진 빚을 갚는 것','더 큰 상단을 일으키는 것'],
               questTitle:['장부 너머의 진실','상인의 오래된 빚','숨겨진 거래장부','상단의 그림자','신용의 무게'] },
  noble:     { secret:['가문의 몰락을 숨기고 있다','평민 혈통이 섞여 있다는 사실을 숨기고 있다','정적을 몰래 돕고 있다','혼인 동맹의 이면을 숨기고 있다','가문의 재산을 몰래 빼돌리고 있다'],
               fear:['가문의 명예가 실추되는 것','비밀이 새어나가는 것','후계 다툼에서 밀려나는 것','가신들의 신뢰를 잃는 것','정적에게 약점을 잡히는 것'],
               goal:['가문의 위신을 되찾는 것','권력 다툼에서 살아남는 것','가문의 진짜 뿌리를 지키는 것','믿을 수 있는 사람을 곁에 두는 것','후계 구도를 안정시키는 것'],
               questTitle:['가문의 그림자','숨겨진 혈통','몰락 앞의 가문','권력의 이면','후계자의 무게'] },
  knight:    { secret:['과거 전투에서 동료를 버리고 도망친 적이 있다','명령을 어기고 몰래 누군가를 살려준 적이 있다','상관의 부당한 명령에 눈감은 적이 있다','전공을 가로챈 적이 있다','탈영병을 몰래 놓아준 적이 있다'],
               fear:['그날의 일이 밝혀지는 것','다시 같은 선택을 해야 하는 상황','동료들의 신뢰를 잃는 것','같은 실수를 반복하는 것','과거를 아는 자와 마주치는 것'],
               goal:['그때의 잘못을 갚는 것','더 이상 도망치지 않는 사람이 되는 것','떳떳한 기사로 다시 서는 것','죽은 동료의 몫까지 사는 것','후배들에게 부끄럽지 않은 선배가 되는 것'],
               questTitle:['잊지 못한 전장','기사의 속죄','버려진 맹세','전장의 그림자','명예의 무게'] },
  priest:    { secret:['신을 향한 믿음을 잃은 지 오래됐다','금기된 의식에 손을 댄 적이 있다','교단의 부패를 알면서도 침묵해왔다','이단으로 몰린 이를 몰래 숨겨준 적이 있다','신의 뜻을 사칭한 적이 있다'],
               fear:['신도들이 진실을 알게 되는 것','믿음 없이 살아가야 한다는 두려움','교단에서 추방당하는 것','자신의 위선이 드러나는 것','신도들을 실망시키는 것'],
               goal:['잃어버린 믿음을 다시 찾는 것','과거의 죄를 조용히 씻어내는 것','신도들에게 부끄럽지 않은 사제가 되는 것','교단의 부패를 바로잡는 것','자신만의 답을 찾는 것'],
               questTitle:['흔들리는 믿음','금기의 기록','교단의 그림자','사제의 위선','잃어버린 계시'] },
  scholar:   { secret:['금서로 지정된 문헌을 몰래 소장하고 있다','한 연구 때문에 누군가를 위험에 빠뜨린 적이 있다','스승의 연구 성과를 가로챈 적이 있다','금지된 실험에 손을 댄 적이 있다','동료 학자의 연구를 몰래 훔쳐본 적이 있다'],
               fear:['연구가 미완성으로 끝나는 것','자신의 발견이 악용되는 것','학계에서 매장당하는 것','진실이 밝혀져 명성을 잃는 것','연구 자료를 빼앗기는 것'],
               goal:['연구를 끝까지 완성하는 것','자신의 실수를 바로잡는 것','학계에 떳떳이 인정받는 것','잃어버린 지식을 되찾는 것','제자에게 부끄럽지 않은 스승이 되는 것'],
               questTitle:['금서의 행방','미완의 연구','학자의 오점','잃어버린 지식','연구실의 비밀'] },
  rogue:     { secret:['한때 몸담았던 조직에서 배신하고 도망쳤다','누명을 쓰고 쫓기는 처지다','한때 동료를 팔아넘긴 적이 있다','귀족의 뒷돈을 받고 일을 봐준 적이 있다','정체를 숨기고 새 이름으로 살고 있다'],
               fear:['옛 동료들에게 발각되는 것','다시 그 세계로 끌려 들어가는 것','진짜 정체가 드러나는 것','과거의 죗값을 치르는 것','믿었던 사람에게 배신당하는 것'],
               goal:['완전히 손을 씻고 평범하게 사는 것','자신을 배신한 자에게 되갚아주는 것','조용히 새 삶을 꾸리는 것','진 빚을 갚고 떠나는 것','더는 누구도 해치지 않는 것'],
               questTitle:['그림자 속의 과거','배신의 대가','이름 없는 자의 과거','뒷골목의 빚','쫓기는 자의 선택'] },
  mage:      { secret:['금지된 마법을 연구하고 있다','스승을 배신하고 홀로 떠나온 과거가 있다','금서에서 배운 마법을 몰래 쓰고 있다','한 실험의 실패로 누군가를 다치게 한 적이 있다','금지된 계약을 맺은 적이 있다'],
               fear:['금지된 지식이 발각되는 것','힘을 완전히 통제하지 못하게 되는 것','마법사 협회에서 추방당하는 것','자신의 힘이 폭주하는 것','과거의 실패가 되풀이되는 것'],
               goal:['금지된 마법의 위험을 스스로 감당할 방법을 찾는 것','스승에게 진 빚을 갚는 것','자신의 힘을 완전히 통제하는 것','잃어버린 지식을 되찾는 것','제 발로 협회에 인정받는 것'],
               questTitle:['금지된 지식','스승의 그림자','마법사의 대가','통제되지 않은 힘','금서의 유혹'] },
  innkeeper: { secret:['여관 지하에 뭔가를 숨겨두고 있다','손님들의 뒷이야기를 몰래 팔아넘긴 적이 있다','수배 중인 손님을 몰래 숨겨준 적이 있다','과거 도적단과 연이 있었다','여관을 차리기 전의 삶을 완전히 숨기고 있다'],
               fear:['숨긴 것이 발각되는 것','단골손님들이 등을 돌리는 것','과거가 들통나 여관을 잃는 것','비밀을 아는 자가 나타나는 것','소문이 퍼져 장사를 접어야 하는 것'],
               goal:['조용히 지금의 삶을 지켜내는 것','숨긴 것을 안전한 곳으로 옮기는 것','여관을 오래도록 지켜가는 것','과거를 완전히 정리하는 것','단골들에게 신뢰받는 주인이 되는 것'],
               questTitle:['지하실의 비밀','여관의 뒷이야기','주인장의 과거','손님들의 소문','숨겨둔 것'] },
  commoner:  { secret:['가족에게도 말 못 할 사정이 있다','과거 신분을 숨기고 살고 있다','한때 큰 죄를 짓고 도망쳐온 처지다','자식을 남몰래 돌보고 있다','오래전 헤어진 가족을 찾고 있다'],
               fear:['과거가 들통나는 것','지금의 평온한 삶을 잃는 것','가족에게 상처를 주는 것','이웃들의 시선이 달라지는 것','평범한 삶이 무너지는 것'],
               goal:['조용히 지금의 삶을 지키는 것','언젠가 떳떳하게 진실을 말하는 것','가족과 다시 만나는 것','평범하지만 단단한 하루하루를 쌓는 것','더는 숨기지 않아도 되는 날을 맞는 것'],
               questTitle:['말 못 할 사정','숨겨진 나날들','평범함의 대가','되찾고 싶은 것','숨긴 이름'] },
};
const NPC_HINT_BANK = [
  '가끔 말끝을 흐리며 뭔가 숨기는 듯한 낌새를 보인다.',
  '특정 화제가 나오면 표정이 굳는다.',
  '평소와 다르게 눈을 피하는 순간이 있다.',
  '무심코 흘린 말 속에 숨은 사정이 느껴진다.',
  '가끔 허공을 응시하며 딴생각에 잠긴다.',
  '대화 중간중간 묘하게 뜸을 들인다.',
  '평소답지 않게 말을 아끼는 순간이 있다.',
  '속마음을 감추려는 듯 억지로 웃어 보인다.',
];
const NPC_SOLO_PREFACE_BANK = ['다른 사람 앞에서는 절대 안 할 말이지만,', '왠지 당신에게는 조금 더 솔직해지고 만다.', '에이든이 없어서인지 평소보다 말이 많다.', '단둘이 있으니 마음이 한결 편해지는 모양이다.', '혼자 있을 때만 보이는 표정이 있다.', '다른 이가 없을 때 비로소 속내를 꺼낸다.'];
const NPC_SOLO_LINE_BANK = ['당신, 혼자서도 제법이군.', '에이든 없이도 잘 해내는 모습이 인상적이다.', '가끔은 당신 혼자 하는 이야기가 더 흥미롭다.', '혼자 다니는 걸 보니 뭔가 사연이 있어 보인다.', '혼자 온 걸 보니 뭔가 결심이 선 모양이군.', '단둘이 이야기하니 더 솔직해질 수 있겠어.', '당신만의 방식이 따로 있는 것 같아.', '혼자서도 충분히 당신답다는 생각이 드는군.'];

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
