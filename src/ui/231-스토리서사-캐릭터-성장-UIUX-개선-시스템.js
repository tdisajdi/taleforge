// 스토리/서사 · 캐릭터 성장 · UI/UX 개선 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getChoiceDiceHint } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { esc } from '../utils.js';

export function renderStoryMarkdown(text){
  if(!text) return '';
  // 코드블록(```...``` 또는 열린 코드블록) 제거 — JSON 노출 방지
  text = text.replace(/```[\s\S]*?```/g, '').trim();
  // 닫히지 않은 열린 코드블록 제거
  text = text.replace(/```[a-zA-Z]*[\s\S]*/g, '').trim();
  // XSS 방지: HTML 먼저 이스케이프
  let s = text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');

  // 줄 단위 처리
  const lines = s.split('\n');
  const out = [];
  let inQuote = false;

  for(let i = 0; i < lines.length; i++){
    let ln = lines[i];

    // > 인용 블록 (배경 설명, 내레이션)
    if(ln.startsWith('&gt; ')){
      if(!inQuote){ out.push('<div class="md-quote">'); inQuote=true; }
      out.push('<p>' + ln.slice(5) + '</p>');
      continue;
    } else if(inQuote){
      out.push('</div>'); inQuote=false;
    }

    // --- 구분선
    if(/^---+$/.test(ln.trim())){
      out.push('<div class="md-hr"></div>'); continue;
    }

    // ## 소제목
    if(ln.startsWith('## ')){
      out.push(`<div class="md-h2">${ln.slice(3)}</div>`); continue;
    }
    // # 대제목
    if(ln.startsWith('# ')){
      out.push(`<div class="md-h1">${ln.slice(2)}</div>`); continue;
    }

    // 인라인: **굵게** → <b>
    ln = ln.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    // 인라인: *기울임* → <i>
    ln = ln.replace(/\*(.+?)\*/g, '<i>$1</i>');
    // 인라인: `코드` → <code style>
    ln = ln.replace(/`(.+?)`/g, '<code class="md-code">$1</code>');
    // [버그 수정] "대사" 강조를 [장소명] 강조보다 먼저 처리해야 한다 — 순서가
    // 반대였을 때는 [시스템] 같은 짧은 대괄호 태그가 먼저 <span class="md-location">
    // 로 바뀌면서 그 태그 자신의 class="..." 큰따옴표 두 개가 뒤이은 대사 강조
    // 정규식(따옴표 1~80자 사이 아무 텍스트나 매칭)에 "대사"로 오인되어 다시
    // 매칭됐다. 그 결과 <span class="<span class="md-speech">...</span>> 같은
    // 중첩·미완성 태그가 만들어져, 여행 시스템이 보내는 "[시스템] ...도착했다"
    // 같은 메시지가 화면에 `"md-location">시스템 ...`처럼 깨진 원문 그대로
    // 노출되는 버그로 이어졌다. 대사 강조를 먼저 끝내면 그 시점엔 아직
    // [장소명] 변환이 일어나지 않았으니 서로의 결과물을 다시 매칭할 일이 없다.
    // "대사" → 대화 강조
    ln = ln.replace(/"([^"]{1,80})"/g, '<span class="md-speech">"$1"</span>');
    // [장소명] → 장소 강조
    ln = ln.replace(/\[([^\]]{1,20})\]/g, '<span class="md-location">$1</span>');

    out.push(ln ? '<p>' + ln + '</p>' : '<p class="md-blank"></p>');
  }
  if(inQuote) out.push('</div>');

  return out.join('');
}
window.renderStoryMarkdown = renderStoryMarkdown;

window.renderStoryMarkdown = renderStoryMarkdown;

export function getChoiceRiskTag(choiceText){
  const lc = choiceText.toLowerCase();
  // 치명적 위험
  if(/공격|싸워|습격|암살|도전|시비|대결|위협|폭발|불을 지|탈출을 시도|무시하고|강행|강제/.test(lc))
    return { icon:'🔴', label:'위험', color:'#e05050', bg:'#2a0a0a' };
  // 중간 위험
  if(/접근|조사|탐색|물어|시도|설득|협상|제안|확인|뒤진|훔쳐/.test(lc))
    return { icon:'🟡', label:'불확실', color:'#c0a030', bg:'#1a1500' };
  // 안전
  if(/도망|피해|숨어|기다려|관찰|물러|포기|무시|돌아|넘어가/.test(lc))
    return { icon:'🟢', label:'안전', color:'#40a060', bg:'#001a0a' };
  return null;
}
window.getChoiceRiskTag = getChoiceRiskTag;

export const _origRenderChoices = window.renderChoices || window.renderChoices;

export function renderChoicesEnhanced(){
  const el = document.getElementById('choices');
  if(!el) return;
  if(!S.choices || !S.choices.length){ el.innerHTML=''; return; }
  el.innerHTML = S.choices.map((c,i)=>{
    const hint = typeof getChoiceDiceHint==='function' ? getChoiceDiceHint(c) : null;
    const risk = getChoiceRiskTag(c);
    const diceHtml = hint
      ? `<span class="choice-dice-hint" style="color:#c8a96e;font-size:10px;font-family:'Cinzel',serif;margin-right:4px">🎲${typeof getEntityIconHTML==='function'?getEntityIconHTML(hint,{size:10}):(hint.icon)}${hint.stat}</span>`
      : '';
    const riskHtml = risk
      ? `<span class="choice-risk" style="font-size:9px;padding:1px 5px;border-radius:2px;background:${risk.bg};color:${risk.color};border:1px solid ${risk.color}44;margin-right:4px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(risk,{size:9}):(risk.icon)} ${risk.label}</span>`
      : '';
    // 빈사 상태에서 위험한 선택지 추가 경고
    const nearDeath = (S._nearDeathTurns||0) >= 2 && risk?.icon === '🔴';
    const warningHtml = nearDeath
      ? `<span style="font-size:8px;color:#e05050;display:block;margin-top:2px">⚠️ 빈사 상태에서 매우 위험</span>`
      : '';
    return `<button class="choice" data-choice-idx="${i}" onclick="pickChoiceByIdx(this)">${diceHtml}${riskHtml}${esc(c)}${warningHtml}</button>`;
  }).join('');
}
window.renderChoicesEnhanced = renderChoicesEnhanced;

export function checkFateChoiceMoment(cleanText){
  if(!cleanText) return;
  const isFate = /운명의|결정적인 순간|되돌릴 수 없|선택의 기로|마지막 기회|이 순간이|분기점|역사가 바뀔/.test(cleanText);
  if(!isFate) return;

  // choices 컨테이너에 운명 분위기 추가
  setTimeout(()=>{
    const el = document.getElementById('choices');
    if(!el || !el.children.length) return;
    // 이미 운명 헤더 있으면 스킵
    if(el.querySelector('.fate-header')) return;
    const header = document.createElement('div');
    header.className = 'fate-header';
    header.style.cssText = `
      text-align:center;padding:8px 12px;margin-bottom:6px;
      background:linear-gradient(135deg,#0d0500,#1a0800);
      border:1px solid #6a3010;border-left:3px solid #e08030;
      font-family:'Cinzel',serif;font-size:10px;color:#e08030;
      letter-spacing:1px;animation:questSGlow 2s ease-in-out infinite;
    `;
    header.innerHTML = '⚖️ 운명의 선택 — 되돌릴 수 없습니다';
    el.insertBefore(header, el.firstChild);
  }, 100);
}
window.checkFateChoiceMoment = checkFateChoiceMoment;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_206(){
window.renderChoices = renderChoicesEnhanced;
}

