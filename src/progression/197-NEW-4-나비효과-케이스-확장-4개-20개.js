// ★ NEW 4: 나비효과 케이스 확장 (4개 → 20개)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { BUTTERFLY_EFFECTS } from '../data/015-시스템-1120.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_174(){
Object.assign(BUTTERFLY_EFFECTS, {
  kingdom_conquered: {
    label:'정복한 왕국의 저항',
    worldEcho: (d)=>`전생에서 정복한 ${d.kingdomName||'왕국'}의 저항군이 다음 세계에서 더욱 강해졌다.`,
    aiHint: (d)=>`전생 나비효과: ${d.kingdomName||'왕국'} 출신 NPC들이 처음부터 강한 적대감을 보입니다.`,
  },
  helped_refugee: {
    label:'도운 난민의 보은',
    worldEcho: ()=>`전생에서 도운 난민의 후손이 세계 어딘가에서 번성했다.`,
    aiHint: ()=>`전생 나비효과: 낯선 사람이 이유 없이 호의를 베풀며 도움을 줍니다.`,
  },
  sealed_demon: {
    label:'봉인한 악마의 귀환',
    worldEcho: (d)=>`전생에서 봉인한 ${d.demonName||'악마'}의 봉인이 약해지고 있다.`,
    aiHint: (d)=>`전생 나비효과: 지하에서 불길한 기운이 느껴지며 ${d.demonName||'고대의 악'}의 낌새가 감지됩니다.`,
  },
  discovered_secret: {
    label:'발견한 비밀의 파장',
    worldEcho: (d)=>`전생에서 발견한 비밀이 세계 권력 구도를 흔들었다.`,
    aiHint: ()=>`전생 나비효과: 정보 브로커나 비밀 조직이 당신에게 관심을 보입니다.`,
  },
  ended_war: {
    label:'종결한 전쟁의 평화',
    worldEcho: ()=>`전생에서 종결시킨 전쟁이 100년 평화의 토대가 됐다.`,
    aiHint: ()=>`전생 나비효과: 세계는 비교적 평화롭고 여러 세력이 협력하는 분위기입니다.`,
  },
  betrayed_kingdom: {
    label:'배신한 왕국의 저주',
    worldEcho: ()=>`전생에서 배신한 왕국이 당신의 이름을 저주로 남겼다.`,
    aiHint: ()=>`전생 나비효과: 귀족과 왕족 NPC들이 당신에게 본능적인 불신을 품습니다.`,
  },
  mastered_forbidden: {
    label:'금기 마법의 흔적',
    worldEcho: (d)=>`전생에서 익힌 금기 마법의 잔향이 세계에 남아있다.`,
    aiHint: ()=>`전생 나비효과: 마법사 길드나 교단이 당신에게 경계심을 보입니다.`,
  },
  saved_child: {
    label:'구한 아이의 성장',
    worldEcho: (d)=>`전생에서 구한 아이가 이 세계에서 중요한 인물로 성장했다.`,
    aiHint: ()=>`전생 나비효과: 중반부에 강력한 조력자가 예상치 못한 순간에 등장합니다.`,
  },
  destroyed_city: {
    label:'파괴한 도시의 원혼',
    worldEcho: (d)=>`전생에서 파괴된 ${d.cityName||'도시'}의 원혼이 세계에 떠돌고 있다.`,
    aiHint: (d)=>`전생 나비효과: ${d.cityName||'폐허'} 근처에서 불길한 현상과 원한 맺힌 NPC들이 등장합니다.`,
  },
  broke_oath: {
    label:'깨진 서약의 저주',
    worldEcho: ()=>`전생에서 어긴 서약의 저주가 이 세계에도 이어진다.`,
    aiHint: ()=>`전생 나비효과: 초반부터 불운이 따르며 중요한 순간마다 판정에 소폭 불이익이 있습니다.`,
  },
  created_legend: {
    label:'만든 전설의 파급',
    worldEcho: ()=>`전생에서 만든 전설이 이 세계에 신화처럼 전해진다.`,
    aiHint: ()=>`전생 나비효과: 음유시인과 학자들이 당신의 이름을 알아보고 경외심을 표합니다.`,
  },
  corrupted_relic: {
    label:'오염시킨 유물의 여파',
    worldEcho: (d)=>`전생에서 오염된 유물이 세계 어딘가에서 사악한 힘을 발산하고 있다.`,
    aiHint: ()=>`전생 나비효과: 세계 곳곳에서 원인불명의 이상 현상이 발생하고 있습니다.`,
  },
  united_races: {
    label:'통합한 종족의 유산',
    worldEcho: ()=>`전생에서 이룬 종족 통합이 이 세계의 문화에 영향을 미쳤다.`,
    aiHint: ()=>`전생 나비효과: 종족 간 갈등이 적고 다종족 NPC들이 호의적으로 접근합니다.`,
  },
  killed_innocents: {
    label:'죽인 무고한 자들의 원한',
    worldEcho: ()=>`전생에서 죽인 무고한 자들의 원한이 세계에 스며들었다.`,
    aiHint: ()=>`전생 나비효과: 낯선 사람들이 이유 없이 적대적이며 고난이 더 빈번합니다.`,
  },
  ascended: {
    label:'신격화의 여운',
    worldEcho: ()=>`전생에서 신격에 도달한 기억이 이 세계에 희미하게 남아있다.`,
    aiHint: ()=>`전생 나비효과: 종교 세력이 당신에게 강한 관심을 보이며 예언서에 당신의 묘사가 등장합니다.`,
  },
  found_true_ending: {
    label:'진엔딩의 메아리',
    worldEcho: ()=>`전생에서 세계의 진실에 도달했다. 그 기억이 꿈속에서 속삭인다.`,
    aiHint: ()=>`전생 나비효과: 루프 감시자가 처음부터 당신을 인식하며 더 빠르게 단서를 줍니다.`,
  },
});

window.BUTTERFLY_EFFECTS = BUTTERFLY_EFFECTS;
}

