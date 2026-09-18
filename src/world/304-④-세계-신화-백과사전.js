// ④ 🌍 세계 신화 백과사전
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { callGeminiDirect } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { recordMarkovSample } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';

export const CODEX_KEY = 'tf-worldcodex';

export function loadCodex(){ try{ return JSON.parse(lsGet(CODEX_KEY)||'{}'); }catch(e){ return {}; } }
window.loadCodex = loadCodex;

export function saveCodex(d){ try{ lsSet(CODEX_KEY, JSON.stringify(d)); }catch(e){} }
window.saveCodex = saveCodex;

// ══════════════════════════════════════════════════════════════════
// 로컬 용어 추출 엔진 (AI 미사용) — 임의의 서사 텍스트에서 진짜
// "새로운 고유명사"를 뽑아내는 건 원래 AI의 요약/이해 능력이 필요한
// 일이라 완전히 똑같이 대체할 순 없다. 대신 판타지 세계관에서 고유명사
// 뒤에 흔히 붙는 접미어(신전/왕국/유물/전쟁/정령 등)로 텍스트 속 후보
// 단어를 찾아, 그 접미어로 카테고리를 정하고 설명은 카테고리별 문장
// 뱅크로 조합한다 — "텍스트에 실제로 등장한 단어"라는 점은 유지된다.
// ══════════════════════════════════════════════════════════════════
const CODEX_SUFFIX_CATEGORY = [
  { category:'신화', suffixes:['신전','사원','교단','여신','남신'] },
  { category:'장소', suffixes:['왕국','제국','요새','폐허','산맥','협곡','사막','평원','늪지','항구'] },
  { category:'유물', suffixes:['성검','성배','왕관','반지','목걸이','유물'] },
  { category:'사건', suffixes:['전쟁','재앙','협약','조약','맹세','저주'] },
  { category:'존재', suffixes:['정령','드래곤','망령','수호자'] },
  { category:'마법', suffixes:['주술','술식','비전','결계'] },
];
const CODEX_DESC_BANK = {
  신화: ['{term}에 대해서는 여러 갈래의 이야기가 전해진다.', '신앙과 전설이 뒤섞여 그 실체를 정확히 아는 이는 드물다.'],
  장소: ['{term}은(는) 지도에 정확히 표시되지 않은 곳이라고도 한다.', '그곳에 다녀온 이들의 이야기는 저마다 조금씩 다르다.'],
  유물: ['{term}의 출처는 명확히 밝혀진 바 없다.', '한때 누군가의 손에 들렸을 것이라는 추측만 무성하다.'],
  사건: ['{term}은(는) 이 세계의 역사에 깊은 흔적을 남겼다고 전해진다.', '그날의 진실을 정확히 아는 이는 이제 거의 남지 않았다.'],
  존재: ['{term}을(를) 직접 목격했다는 이들의 증언은 엇갈린다.', '실재하는지 전설 속의 존재인지조차 논쟁의 대상이다.'],
  마법: ['{term}의 원리를 온전히 이해하는 학자는 드물다고 한다.', '위험한 지식으로 취급되어 함부로 다뤄지지 않는다.'],
  기타: ['{term}에 얽힌 사연은 아직 제대로 알려지지 않았다.'],
};
function _cxJosa(word, type){
  const ch = String(word).charCodeAt(String(word).length-1);
  const hasBatchim = ch>=0xAC00 && ch<=0xD7A3 && (ch-0xAC00)%28!==0;
  if(type==='을를') return hasBatchim ? '을' : '를';
  return '';
}
function _cxFill(tpl, term){
  return tpl.replace(/\{term:을를\}/g, term+_cxJosa(term,'을를')).replace(/\{term\}/g, term);
}
function composeLocalCodexDesc(term, category){
  const bank = CODEX_DESC_BANK[category] || CODEX_DESC_BANK.기타;
  return bank.map(tpl=>_cxFill(tpl, term)).join(' ');
}
// 한국어는 명사 뒤에 조사가 공백 없이 바로 붙는다(예: "왕국의") — 접미어
// 매칭 전에 흔한 조사를 떼어낸다. 완벽한 형태소 분석은 아니지만 접미어
// 패턴 매칭 목적으로는 충분하다.
const CODEX_PARTICLES = ['에서','에게','으로','까지','부터','이나','은','는','이','가','을','를','의','에','로','와','과','도','만','께','나'];
function _cxStripParticle(word){
  for(const p of CODEX_PARTICLES){
    if(word.length - p.length >= 2 && word.endsWith(p)) return word.slice(0, word.length-p.length);
  }
  return word;
}
function findLocalCodexCandidates(aiText, excludeTerms){
  const excludeSet = new Set(excludeTerms);
  const words = aiText.split(/[\s,.!?~"'「」『』()·]+/).filter(Boolean);
  const found = [];
  const seen = new Set();
  for(let i=0; i<words.length; i++){
    const stripped = _cxStripParticle(words[i]);
    if(!/^[가-힣]{2,10}$/.test(stripped)) continue;
    const catDef = CODEX_SUFFIX_CATEGORY.find(c=>c.suffixes.some(suf=>stripped.endsWith(suf)));
    if(!catDef) continue;
    // 바로 앞 단어가 (그 자체로는 다른 접미어가 아닌) 순수 수식어라면
    // "알테라 왕국"처럼 붙여서 더 구체적인 고유명사로 만든다.
    let term = stripped;
    if(i > 0){
      const prevStripped = _cxStripParticle(words[i-1]);
      const prevIsSuffixWord = CODEX_SUFFIX_CATEGORY.some(c=>c.suffixes.some(suf=>prevStripped.endsWith(suf)));
      if(/^[가-힣]{2,6}$/.test(prevStripped) && !prevIsSuffixWord){
        term = prevStripped + ' ' + stripped;
      }
    }
    if(seen.has(term) || excludeSet.has(term)) continue;
    seen.add(term);
    found.push({ term, category: catDef.category });
  }
  return found;
}
window.findLocalCodexCandidates = findLocalCodexCandidates;

export async function extractCodexTerms(aiText){
  if(!aiText || aiText.length < 50) return;
  // 너무 자주 호출 방지: 10턴에 1번
  if((S.msgCount||0) % 10 !== 0) return;
  const codex = loadCodex();
  const existing = Object.keys(codex);
  const candidates = findLocalCodexCandidates(aiText, existing);
  if(!candidates.length) return;
  let added = 0;
  for(const c of candidates){
    if(added >= 2) break;
    if(codex[c.term]) continue;
    // [복원] AI 우선 — 키가 있으면 세계관에 맞는 진짜 설정 설명을
    // 시도하고, 없거나 실패하면 로컬 조합 폴백. 용어 추출 자체(어떤
    // 고유명사가 새로 등장했는지)는 접미어 패턴 매칭이 이미 텍스트에서
    // 실제 등장한 단어만 찾아내므로 AI 여부와 무관하게 그대로 둔다.
    const codexPrompt = `당신은 판타지 세계관 백과사전 작가입니다. 아래 용어에 대한 짧은 설정 설명을 JSON으로 작성하세요.
[용어] ${c.term} [분류] ${c.category}
반드시 다음 JSON만 출력하세요: {"desc":"1~2문장 설정 설명"}`;
    const desc = await tryCloudThenLocalModelThenBank(
      async () => {
        const raw = await callGeminiDirect(codexPrompt);
        if(raw && raw.desc) recordMarkovSample('codex_desc', raw.desc);
        return (raw && raw.desc) ? raw.desc : null;
      },
      async () => {
        const raw = await callLocalModelJSON(codexPrompt, { maxTokens: 150 });
        if(raw && raw.desc) recordMarkovSample('codex_desc', raw.desc);
        return (raw && raw.desc) ? raw.desc : null;
      },
      () => composeLocalCodexDesc(c.term, c.category),
      '백과사전 항목 생성'
    );
    codex[c.term] = { category: c.category, desc, addedAt: S.msgCount||0 };
    added++;
  }
  if(added > 0){
    saveCodex(codex);
    toast('🌍 백과사전에 '+added+'개 항목 추가', 1500);
  }
}
window.extractCodexTerms = extractCodexTerms;

export function renderCodexPanel(){
  const body = document.getElementById('pb-codex');
  if(!body) return;
  const codex = loadCodex();
  const entries = Object.entries(codex);
  const catColors = {신화:'#e0a040',장소:'#60b060',유물:'#e060a0',사건:'#e05050',존재:'#a060e0',마법:'#60a0e0',기타:'#8a8a6a'};
  const cats = [...new Set(entries.map(([,v])=>v.category))].sort();
  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#a0d060;letter-spacing:1px;margin-bottom:4px">🌍 세계 백과사전 (${entries.length}개)</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:12px">대화 중 언급되는 고유명사가 자동으로 수집됩니다.</div>
      ${entries.length===0?`<div style="text-align:center;padding:20px;font-size:11px;color:var(--dim)">아직 수집된 항목이 없습니다.<br>플레이하면 자동으로 쌓입니다.</div>`:''}
      ${cats.map(cat=>{
        const catEntries = entries.filter(([,v])=>v.category===cat);
        const cc = catColors[cat]||'#8a8a6a';
        return `<div style="margin-bottom:12px">
          <div style="font-family:Cinzel,serif;font-size:9px;color:${cc};letter-spacing:1px;margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid ${cc}44">${cat} (${catEntries.length})</div>
          ${catEntries.map(([term,v])=>`
            <div style="padding:8px 10px;background:#080a00;border:1px solid #1a2000;margin-bottom:4px;border-left:2px solid ${cc}88">
              <div style="font-size:10px;color:${cc};font-family:Cinzel,serif;margin-bottom:3px">${esc(term)}</div>
              <div style="font-size:10px;color:var(--text);line-height:1.5">${esc(v.desc||'')}</div>
              <div style="font-size:8px;color:var(--dim);margin-top:2px">턴 ${v.addedAt}</div>
            </div>`).join('')}
        </div>`;
      }).join('')}
      ${entries.length>0?`<div style="margin-top:8px;text-align:center">
        <button class="btn btn-dark" onclick="if(confirm('백과사전을 초기화하시겠습니까?')){ lsSet('${CODEX_KEY}','{}'); renderCodexPanel(); toast('초기화됨',1200); }" style="font-size:9px">🗑️ 초기화</button>
      </div>`:''}
    </div>`;
}
window.renderCodexPanel = renderCodexPanel;

window.renderCodexPanel = renderCodexPanel;

window.extractCodexTerms = extractCodexTerms;
