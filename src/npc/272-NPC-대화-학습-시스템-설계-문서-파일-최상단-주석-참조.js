// ★ NPC 대화 학습 시스템 (설계 문서: 파일 최상단 주석 참조)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { NPC_TOPIC_KEYWORDS } from '../data/272-NPC-대화-학습-시스템-설계-문서-파일-최상단-주석-참조.js';
import { generateAIQuest } from '../job/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { loadNPCs } from '../misc/001-block0-preamble.js';
import { generateAILocation } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { pmUpdateWorld } from '../world/271-세계관-파트-업데이트.js';
import { _pmNpcDefault } from './264-NPC별-풍부한-데이터-구조.js';

export function classifyNpcTopic(userMsg, aiText) {
  const combined = ((userMsg||'') + ' ' + (aiText||'')).toLowerCase();
  for (const [topic, regex] of Object.entries(NPC_TOPIC_KEYWORDS)) {
    if (regex.test(combined)) return topic;
  }
  return '일상/성격';
}
window.classifyNpcTopic = classifyNpcTopic;

// ══════════════════════════════════════════════════════════════════
// 로컬 NPC 화제 요약 엔진 (AI 미사용) — 실제 대화 텍스트를 정확히
// 요약하는 건 AI의 이해력이 필요한 일이라 똑같이는 못 한다. 대신
// classifyNpcTopic이 이미 분류해준 화제(무기/전투, 퀘스트/의뢰 등
// 8종)에 맞는 그럴듯한 태도 묘사를 뱅크에서 조합한다 — "이 NPC가 이
// 화제에 대해 어떤 태도를 보였는지"라는 힌트로는 충분하다.
// ══════════════════════════════════════════════════════════════════
const NPC_TOPIC_SUMMARY_BANK = {
  '무기/전투':   ['무기와 전투에 대해 나름의 확고한 기준을 갖고 있다.', '전투 이야기가 나오면 평소보다 말이 많아진다.', '장비에 대한 조예가 깊어 보인다.'],
  '퀘스트/의뢰': ['부탁할 일이 있는 듯 조심스럽게 운을 뗐다.', '의뢰에 관해서는 신중하게 말을 고른다.', '도움이 필요한 사정이 있어 보인다.'],
  '장소/지역':   ['이 근방 지리에 밝은 듯하다.', '특정 장소를 언급할 때 표정이 묘하게 변한다.', '가본 곳에 대한 이야기를 아끼지 않는다.'],
  '정보/비밀':   ['뭔가 아는 것이 있지만 쉽게 털어놓지 않는다.', '소문에 대해 조심스럽게 말을 흐린다.', '생각보다 많은 것을 알고 있는 눈치다.'],
  '거래/상점':   ['거래에는 나름의 원칙이 있는 듯하다.', '흥정을 즐기는 편인 것 같다.', '물건 보는 눈이 꽤 까다롭다.'],
  '관계/감정':   ['감정을 잘 숨기지 못하는 편이다.', '속마음을 조금씩 내비치기 시작했다.', '관계에 대해 신중한 태도를 보인다.'],
  '역사/전설':   ['옛이야기를 할 때 눈빛이 달라진다.', '역사에 대한 나름의 해석을 갖고 있다.', '오래된 이야기를 꽤 많이 알고 있는 듯하다.'],
  '일상/성격':   ['평소 성격이 대화 곳곳에서 드러난다.', '소소한 일상 이야기를 편하게 나눈다.', '특유의 말투와 태도가 느껴진다.'],
};
function composeLocalNpcTopicSummary(topic){
  const bank = NPC_TOPIC_SUMMARY_BANK[topic] || NPC_TOPIC_SUMMARY_BANK['일상/성격'];
  return bank[Math.floor(Math.random()*bank.length)];
}
window.composeLocalNpcTopicSummary = composeLocalNpcTopicSummary;

export function pmSummarizeNpcTopic(npcName, topic, aiText, userMsg) {
  if (!npcName||!topic||!aiText) return null;
  return composeLocalNpcTopicSummary(topic);
}
window.pmSummarizeNpcTopic = pmSummarizeNpcTopic;

export function checkNpcTriggers(npcName, n) {
  if (!n?.triggers?.length) return;
  const turn = S.msgCount||0;
  n.triggers.forEach(tr => {
    if (tr.fired) return;
    const count = (n.topicCount||{})[tr.topic]||0;
    if (count < tr.threshold) return;
    if (tr.rel && (n.rel||50) < tr.rel) return;
    tr.fired = true; tr.firedTurn = turn;
    setTimeout(()=>{
      switch(tr.action){
        case 'location_unlock':
          if(typeof generateAILocation==='function'){
            generateAILocation(`NPC 대화 트리거: ${npcName}`,
              `${npcName}과의 "${tr.topic}" 대화로 장소 정보 획득: ${tr.target}`)
              .then(loc=>{ if(loc) toastHTML(`🗺️ 새 장소: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:14}):(loc.icon)}${esc(loc.name)} (${esc(npcName)} 정보)`,4000); });
          }
          break;
        case 'quest_start':
          if(typeof generateAIQuest==='function'){
            generateAIQuest(false,{grade:'A',contextType:'npc_trigger',
              hint:`${npcName}과의 대화에서 발견된 의뢰: "${tr.target}". NPC 대화 맥락 반영.`});
          }
          break;
        case 'shop_unlock':
          { const su=JSON.parse(lsGet('tf-shop-unlocks')||'{}');
            su[npcName]=su[npcName]||[];
            if(!su[npcName].includes(tr.target)){ su[npcName].push(tr.target); lsSet('tf-shop-unlocks',JSON.stringify(su)); }
            toast(`🏪 ${npcName}의 특별 거래 해금: ${tr.target}`,3500); }
          break;
        case 'secret_reveal':
          S._nextInjectedContext=(S._nextInjectedContext||'')+
            ` [🔓 ${npcName} 비밀 공개 조건 충족] "${tr.target}" 진실을 이제 털어놓을 준비가 됐다. 자연스럽게 흘려라.`;
          toast(`🔓 ${npcName}이(가) 뭔가 말하려 한다...`,3000);
          break;
        case 'npc_join':
          S._nextInjectedContext=(S._nextInjectedContext||'')+
            ` [👥 ${npcName} 합류 조건 충족] 이제 플레이어를 충분히 신뢰한다. 동료 합류 의사를 자연스럽게 표현하라.`;
          toast(`👥 ${npcName}이(가) 동료가 될 수도 있다!`,3000);
          break;
      }
    },800);
  });
}
window.checkNpcTriggers = checkNpcTriggers;

window.checkNpcTriggers = checkNpcTriggers;

export async function pmLearnFromNpcDialog(npcName, userMsg, aiText) {
  if (!npcName||!aiText) return;
  const d = pmLoad('npc');
  if (!d[npcName]) d[npcName] = _pmNpcDefault();
  const n = d[npcName];
  const turn = S.msgCount||0;
  const topic = classifyNpcTopic(userMsg, aiText);
  n.topicCount = n.topicCount||{};
  n.topicCount[topic] = (n.topicCount[topic]||0)+1;
  n.topicSummary = n.topicSummary||{};
  const existing = n.topicSummary[topic];
  // 3번마다 요약 갱신 (API 절약)
  if (!existing || n.topicCount[topic]%3===0) {
    const summary = await pmSummarizeNpcTopic(npcName, topic, aiText, userMsg);
    if (summary) {
      n.topicSummary[topic] = { summary, count:n.topicCount[topic], lastTurn:turn };
      const topics = Object.keys(n.topicSummary);
      if (topics.length>10){
        const oldest = topics.sort((a,b)=>(n.topicSummary[a]?.lastTurn||0)-(n.topicSummary[b]?.lastTurn||0))[0];
        delete n.topicSummary[oldest];
      }
    }
  } else {
    n.topicSummary[topic] = {...(existing||{}), count:n.topicCount[topic], lastTurn:turn};
  }
  // 트리거 자동 생성 (첫 2회 대화 후, 트리거 없을 때만)
  n.triggers = n.triggers||[];
  if (n.triggers.length===0 && n.topicCount[topic]>=2) {
    const autoMap = {
      '장소/지역':   {action:'location_unlock', target:npcName+'이(가) 언급한 장소', threshold:3},
      '퀘스트/의뢰': {action:'quest_start',     target:npcName+'의 의뢰',           threshold:2},
      '정보/비밀':   {action:'secret_reveal',    target:npcName+'의 비밀',           threshold:3, rel:65},
      '거래/상점':   {action:'shop_unlock',      target:npcName+'의 특별 거래',      threshold:2},
    };
    const auto = autoMap[topic];
    if (auto) n.triggers.push({topic,...auto,fired:false,autoGenerated:true});
  }
  pmSave('npc', d);
  checkNpcTriggers(npcName, n);
}
window.pmLearnFromNpcDialog = pmLearnFromNpcDialog;

window.pmLearnFromNpcDialog = pmLearnFromNpcDialog;

export function buildNpcTopicSummaryHint(userMsg) {
  if (!userMsg) return '';
  try {
    const d = pmLoad('npc');
    const npcs = (typeof loadNPCs==='function'?loadNPCs():[])||[];
    const lc = userMsg.toLowerCase();
    const hints = [];
    npcs.slice(0,8).forEach(npc=>{
      if (!npc?.name||!lc.includes(npc.name.toLowerCase())) return;
      const nd = d[npc.name];
      if (!nd?.topicSummary) return;
      const topic = classifyNpcTopic(userMsg,'');
      const sm = nd.topicSummary[topic]||nd.topicSummary['일상/성격'];
      if (!sm?.summary) return;
      const cnt = nd.topicCount?.[topic]||0;
      hints.push(`[${npc.name}·${topic}·${cnt}회] ${sm.summary}`);
    });
    return hints.length ? `
[💬 NPC 누적 정보] ${hints.join(' / ')} — 이 정보와 일관된 반응.` : '';
  }catch(e){ return ''; }
}
window.buildNpcTopicSummaryHint = buildNpcTopicSummaryHint;

window.buildNpcTopicSummaryHint = buildNpcTopicSummaryHint;

export function pmDetectWorldFromText(aiText) {
  if (!aiText) return;
  var lc = aiText.toLowerCase();
  if (/전쟁|침공|전투 발발|봉기|혁명|쿠데타|함락/.test(lc))
    pmUpdateWorld(aiText.slice(0,80), 'event');
  if (/소문|들었다|전해지길|알려지길|듣기론|소식이/.test(lc))
    pmUpdateWorld(aiText.slice(0,80), 'rumor');
  if (/비밀 조직|숨겨진 세력|금지된|고대의 진실|예언/.test(lc))
    pmUpdateWorld(aiText.slice(0,80), 'discovery');
  if (/파벌|세력 관계|동맹 체결|전쟁 선포/.test(lc))
    pmUpdateWorld(aiText.slice(0,60), 'faction');
}
window.pmDetectWorldFromText = pmDetectWorldFromText;
