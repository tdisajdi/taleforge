// 2. 창세신화 & 세계관 역사
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGION_WORLD_HISTORY } from '../data/115-2-창세신화-세계관-역사.js';
import { toast } from '../utils.js';
import { loadCodex, saveCodex } from './304-④-세계-신화-백과사전.js';

export const WORLD_MYTHOLOGY = {
  creation: {
    title:'창세의 기억',
    icon:'🌌',
    text:`태초에 빛과 어둠, 뿌리와 허무가 함께 존재했다.
세계수(World Tree)가 첫 번째로 싹을 틔웠을 때, 그 뿌리에서 대지가, 가지에서 하늘이 생겨났다.
태양신이 세계수의 첫 잎을 보고 율법을 새겼고, 뿌리의 조상신들이 그 아래 생명을 심었다.
그러나 세계수의 그림자에서 심연이 태어났다. 빛이 있는 곳에 어둠이 있듯.
창세의 마지막 날, 시간이 처음으로 흘렀다. 그리고 어느 날 — 시간이 다시 흐르기 시작했다.
반복이 시작된 것이다.`,
    codexKey:'creation_myth',
  },
  first_war: {
    title:'제1차 신성전쟁 (300년 전)',
    icon:'⚔️',
    text:`순환의 사원이 대륙 중앙을 장악하자, 태양의 성전이 "이단 정화"를 선포했다.
세 개의 신성 군단이 충돌하며 대륙 남부가 황폐화됐다.
뿌리 신앙은 북부 숲으로 후퇴해 부족 형태로 살아남았다.
전쟁은 "알테라 조약"으로 끝났다: 중앙은 순환의 사원, 남부는 태양의 성전, 북부는 뿌리 신앙.
심연의 계시는 이 혼란을 틈타 지하로 파고들었다.`,
    codexKey:'first_holy_war',
  },
  loop_origin: {
    title:'루프의 기원 (알려지지 않은 역사)',
    icon:'♾️',
    text:`순환의 사원 지하 문서고에만 남아있는 금서에 따르면:
최초의 루프는 한 신관이 세계수에 간청하며 시작됐다.
"다시 한번"이라는 소원이 세계 전체를 되감았다.
시간의 현현을 신봉하는 자들은 이것이 신의 의도라고 주장한다.
루프 자각자들 사이에서는 이 금서의 복사본이 유통된다.`,
    codexKey:'loop_origin',
    hidden:true,
    unlockCondition:'cycle >= 1',
  },
  abyss_truth: {
    title:'심연의 진실 (극비)',
    icon:'😈',
    text:`심연의 계시는 종교가 아니다.
마계의 군주 "발록 에이레"가 이 세계를 식민지로 삼기 위해 만든 포섭 조직이다.
신자들은 단계적으로 마계 에너지에 물들어 결국 하수인이 된다.
최고위층은 이미 돌아올 수 없다. 그들은 사실을 알면서도 권력을 위해 동참했다.`,
    codexKey:'abyss_truth',
    hidden:true,
    unlockCondition:'abyss_secret 달성',
  },
  world_tree: {
    title:'세계수의 현재',
    icon:'🌳',
    text:`세계수는 대륙 중심부 깊은 곳에 뿌리를 두고 있지만, 눈에 보이지 않는다.
순환의 사원은 그 위에 신전을 세웠고, 자신들이 세계수와 연결돼 있다고 주장한다.
뿌리 신앙의 대신관만이 실제로 세계수와 대화할 수 있다고 전해진다.
최근 세계수가 시들고 있다는 소문이 퍼지고 있다.`,
    codexKey:'world_tree',
  },
};

window.WORLD_MYTHOLOGY = WORLD_MYTHOLOGY;

window.RELIGION_WORLD_HISTORY = RELIGION_WORLD_HISTORY;

export function initMythologyCodex(){
  if(typeof loadCodex!=='function'||typeof saveCodex!=='function') return;
  const codex = loadCodex();
  Object.values(WORLD_MYTHOLOGY).forEach(myth=>{
    const key = myth.codexKey;
    if(myth.hidden) return; // 히든은 조건 충족 시만
    if(!codex[key]) codex[key] = { title:myth.title, text:myth.text, icon:myth.icon, category:'신화', discoveredAt:0 };
  });
  saveCodex(codex);
}
window.initMythologyCodex = initMythologyCodex;

window.initMythologyCodex = initMythologyCodex;

setTimeout(initMythologyCodex, 2000);

export function unlockHiddenMyth(conditionKey){
  if(typeof loadCodex!=='function') return;
  const codex = loadCodex();
  Object.values(WORLD_MYTHOLOGY).forEach(myth=>{
    if(!myth.hidden) return;
    // [버그 수정] 원래는 사람이 읽는 설명 텍스트(unlockCondition, 예:
    // "abyss_secret 달성")에 대해 부분 문자열 검사를 했다. 호출부가
    // 실제로 넘기는 값(religion/119의 codexUnlock: 'abyss_truth' 등)은
    // 그 설명 텍스트 안에 우연히 등장하는 문자열이 아니라 codexKey
    // 자체이므로, 'abyss_truth' 신화는 그 자신의 unlockCondition
    // 문자열("abyss_secret 달성")에 'abyss_truth'가 포함돼 있지 않아
    // 의도된 퀘스트 보상 경로로는 영원히 해금될 수 없었다. codexKey를
    // 정확히 대조하도록 수정.
    if(myth.codexKey === conditionKey){
      if(!codex[myth.codexKey]){
        codex[myth.codexKey] = { title:myth.title, text:myth.text, icon:myth.icon, category:'신화', discoveredAt:S.msgCount||0 };
        if(typeof saveCodex==='function') saveCodex(codex);
        toast(`📖 신화 해금: ${myth.title}`, 3000);
        if(typeof addTimelineEvent==='function') addTimelineEvent('event', `신화 발견: ${myth.title}`, {icon:myth.icon});
      }
    }
  });
}
window.unlockHiddenMyth = unlockHiddenMyth;

window.unlockHiddenMyth = unlockHiddenMyth;
