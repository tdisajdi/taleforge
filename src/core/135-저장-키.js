// 저장 키
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { isAidenInParty } from '../npc/305-⑤-NPC-비밀-아젠다-이중성-시스템.js';
import { renderClanPanel } from '../ui/138-UI-패널.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const CLAN_PLAYER_KEY  = 'tf-clan-player';

export const CLAN_HISTORY_KEY = 'tf-clan-history';

export function loadClanPlayer(){
  try{ return JSON.parse(lsGet(CLAN_PLAYER_KEY)||'{}'); }catch(e){ return {}; } 
}
window.loadClanPlayer = loadClanPlayer;

export function saveClanPlayer(d){ lsSet(CLAN_PLAYER_KEY, JSON.stringify(d)); }
window.saveClanPlayer = saveClanPlayer;

export function loadClanHistory(){
  try{ return JSON.parse(lsGet(CLAN_HISTORY_KEY)||'[]'); }catch(e){ return []; }
}
window.loadClanHistory = loadClanHistory;

export function saveClanHistory(d){ lsSet(CLAN_HISTORY_KEY, JSON.stringify(d)); }
window.saveClanHistory = saveClanHistory;

export function addClanHistory(clanId, type, text){
  const h = loadClanHistory();
  h.push({ clanId, type, text, turn: S.msgCount||0, savedAt: Date.now() });
  saveClanHistory(h);
}
window.addClanHistory = addClanHistory;

export const CLAN_DEFS = {

  // ── S등급: 전대륙에 영향력을 미치는 절대 세력 ──────────────────────────────
  iron_throne: {
    id: 'iron_throne', grade: 'S', icon: '👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></svg>`,
    name: '철왕좌 왕가',
    color: '#c8a020',
    domain: '왕권·군사·대륙 정치',
    territory: '대륙 중부 전역 / 3개 속국 포함',
    desc: '3백 년간 대륙을 지배해온 왕족 혈통. 군사력과 외교력 모두 최강이지만 내부 계승 분쟁이 심각하다.',
    philosophy: '질서와 지배. 강한 자가 통치하고 약한 자가 복종하는 것이 세계의 이치.',
    secret: '현 국왕은 정통 혈통이 아니다. 200년 전 쿠데타로 진짜 왕가를 숙청했으며, 그 증거를 찾는 반왕파 세력이 암약 중이다.',
    publicFace: '대륙 최강 왕국. 질서와 번영의 수호자.',
    npcTone: '격식 차리고 권위적. 가문 이름 앞에 절을 요구한다.',
    joinReq: { rep: 60, grade: ['noble','royal'], note: '왕가 혈통이거나 공작 이상의 봉작자만 정식 가입 가능. 예외는 왕의 특사 임명을 통해서만.' },
    ranks: ['종복', '기사', '영주', '백작', '공작', '왕족'],
    rivals: ['ancient_conclave', 'void_circle'],
    allies: ['sun_council', 'silver_lance'],
    events: {
      join:    '왕가에 귀속되었다. 앞으로 왕명은 절대적이다.',
      rep_up:  '왕가의 신임이 높아졌다. 더 중요한 임무가 주어진다.',
      rep_down:'왕가에 불쾌감을 샀다. 감시가 붙을 수도 있다.',
      betray:  '왕가를 배신했다. 대륙 어디서든 수배될 것이다.',
      quest:   ['왕자 호위 임무', '반왕파 세력 색출', '속국 반란 진압', '왕가 비밀 문서 탈취'],
    },
  },

  ancient_conclave: {
    id: 'ancient_conclave', grade: 'S', icon: '🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>`,
    name: '고대 집회',
    color: '#8040c0',
    domain: '마법·고대 지식·세계 비밀',
    territory: '공식 영토 없음 / 대륙 전역 비밀 거점 보유',
    desc: '수천 년 전부터 존재했다고 전해지는 마법사들의 비밀 결사. 세계의 진실을 알고 있으며, 루프에 대해서도 인지하고 있다.',
    philosophy: '지식이 곧 힘. 세계의 진실은 준비된 자에게만 주어져야 한다.',
    secret: '고대 집회는 루프를 수백 년 전부터 알고 있었다. 루프를 끊을 방법도 알지만 의도적으로 공개하지 않고 있다. 루프가 지속될수록 이들의 지식이 축적되기 때문이다.',
    publicFace: '학술 연구 집단. 고대 유물 보존 단체.',
    npcTone: '냉정하고 관찰자적. 모든 것을 알고 있다는 듯한 태도.',
    joinReq: { int: 70, mgc: 60, note: '초대받은 자만 가입 가능. INT·MGC 기준 이상이어도 집회가 먼저 접근하지 않으면 방법이 없다.' },
    ranks: ['견습생', '학자', '현자', '대현자', '집회원', '집회장'],
    rivals: ['iron_throne', 'sun_council'],
    allies: ['merchant_crown'],
    events: {
      join:    '고대 집회에 입문했다. 세계의 진실 일부에 접근할 수 있다.',
      rep_up:  '집회 내 신뢰가 쌓였다. 더 깊은 비밀이 열린다.',
      rep_down:'집회가 경계하기 시작했다. 지식 접근이 제한될 수 있다.',
      betray:  '집회를 배신했다. 지식의 저주를 받을 것이다.',
      quest:   ['금서 회수 임무', '루프 흔적 조사', '배신자 기억 삭제', '고대 유물 발굴'],
    },
  },

  // ── A등급: 국가 혹은 대형 세력 ──────────────────────────────────────────────
  sun_council: {
    id: 'sun_council', grade: 'A', icon: '☀️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2 L12 4.5 M12 19.5 L12 22 M2 12 L4.5 12 M19.5 12 L22 12 M5.1 5.1 L6.8 6.8 M17.2 17.2 L18.9 18.9 M18.9 5.1 L17.2 6.8 M6.8 17.2 L5.1 18.9"/></svg>`,
    name: '태양 의회',
    color: '#e08020',
    domain: '종교·이단 심문·도덕 질서',
    territory: '대륙 남부 3개국 / 성전도시 5곳',
    desc: '태양의 성전을 기반으로 한 종교 정치 세력. 외형은 신앙 단체지만 실질적으로는 남부 전역의 정치를 지배한다.',
    philosophy: '태양신의 율법 아래 모든 이단과 어둠을 척결한다.',
    secret: '이단 심문소 최고 심문관들 중 일부가 심연의 계시 신자다. 내부에서 신앙 시스템을 역이용 중.',
    publicFace: '정의롭고 강직한 종교 세력. 약자를 보호하는 빛의 기사들.',
    npcTone: '격식 있고 도덕적. 이단에 매우 예민하게 반응한다.',
    joinReq: { fath: 50, note: '태양신 신자이며 이단 전력이 없어야 한다. 심연 신자는 절대 불가.' },
    ranks: ['신도', '성직자', '기사', '심문관', '추기경', '대주교'],
    rivals: ['void_circle', 'blood_banner', 'ancient_conclave'],
    allies: ['iron_throne', 'silver_lance'],
    events: {
      join:    '태양 의회 신도로 등록됐다. 이단 의심 행동은 감시받는다.',
      rep_up:  '태양 의회 내 신임이 상승했다. 비밀 심문 정보 접근 가능.',
      rep_down:'신앙심이 의심받고 있다. 이단 혐의 위험도가 상승한다.',
      betray:  '태양 의회를 배신했다. 이단 선고를 받으며 성전사들이 추격한다.',
      quest:   ['이단 색출', '금지 서적 회수', '순례지 정화', '배교자 심문'],
    },
  },

  silver_lance: {
    id: 'silver_lance', grade: 'A', icon: '⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>`,
    name: '은창 용병단',
    color: '#a0b0c0',
    domain: '전투·용병·군사 전문가',
    territory: '대륙 전역 거점 / 의뢰 기반 이동',
    desc: '대륙 최강의 용병 집단. 출신을 가리지 않는다. 전쟁터에서 실력으로만 계급이 정해진다.',
    philosophy: '의뢰인의 금화는 신성하다. 실력과 의리만이 가치 있다.',
    secret: '은창 단장은 왕가에서 숙청된 진짜 왕족의 후손이다. 언젠가 왕좌를 되찾으려 하고 있다.',
    publicFace: '프로 용병 집단. 어떤 의뢰든 완수한다.',
    npcTone: '직선적이고 실리적. 실력 외에는 아무것도 따지지 않는다.',
    joinReq: { str: 40, note: '전투 테스트 통과 후 가입. 출신·종족·전과 불문. 실력만 있으면 된다.' },
    ranks: ['신병', '병사', '분대장', '대장', '부단장', '단장'],
    rivals: ['blood_banner'],
    allies: ['iron_throne', 'sun_council', 'merchant_crown'],
    events: {
      join:    '은창 용병단에 합류했다. 의뢰를 수행하면 보수와 계급이 오른다.',
      rep_up:  '단 내 평판이 올랐다. 더 높은 보수의 의뢰가 들어온다.',
      rep_down:'실력을 의심받고 있다. 저급 의뢰만 배정된다.',
      betray:  '은창을 배신했다. 용병 세계에서 블랙리스트에 오른다.',
      quest:   ['호위 임무', '요새 공략', '수색·구출', '암살 의뢰', '전쟁 참전'],
    },
  },

  merchant_crown: {
    id: 'merchant_crown', grade: 'A', icon: '💰', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></svg>`,
    name: '황금 상인 왕관',
    color: '#c0a030',
    domain: '교역·정보·금융·밀수',
    territory: '대륙 전역 교역로 / 항구 도시 독점',
    desc: '표면적으로는 대규모 무역 상단이지만, 실제로는 대륙 경제와 정보망을 지배하는 거대 조직. 돈으로 움직이지 않는 것이 없다.',
    philosophy: '모든 것은 거래가 된다. 적도 돈으로 우군이 되고, 우군도 돈으로 적이 된다.',
    secret: '상인 왕관은 양측에 무기를 파는 것으로 악명 높다. 현재 왕가와 반왕파 모두에 자금을 대고 있다.',
    publicFace: '합법적인 대상단. 번영과 교역의 수호자.',
    npcTone: '항상 계산적. 모든 대화에서 이익 구조를 파악하려 한다.',
    joinReq: { neg: 40, luk: 30, note: '초기 투자금 500G 또는 특수 재능 보유자. 밀수 경력도 오히려 우대.' },
    ranks: ['행상', '상인', '지부장', '대리인', '부단주', '상인 왕'],
    rivals: ['blood_banner'],
    allies: ['silver_lance', 'ancient_conclave', 'wanderers_guild'],
    events: {
      join:    '상인 왕관의 일원이 됐다. 모든 거래는 조직의 이름으로 진행된다.',
      rep_up:  '상단 내 신용이 올랐다. 더 큰 거래와 내부 정보 접근 가능.',
      rep_down:'신용을 잃었다. 빚 독촉원이 붙을 수도 있다.',
      betray:  '상인 왕관을 배신했다. 경제적으로 완전히 고립된다.',
      quest:   ['밀수품 운반', '경쟁 상단 파산 공작', '정보 거래', '채무자 추적', '시장 독점'],
    },
  },

  root_tribe: {
    id: 'root_tribe', grade: 'A', icon: '🌿', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 12 12 12 8 C12 4.5 9 3 6 3 C6 6.5 8 9 12 9" stroke-linejoin="round"/><path d="M12 14 C12 14 12 9 15 7.5 C17 6.5 19 7 19 7 C19 9.5 17 12.5 12 12.5" stroke-linejoin="round"/></svg>`,
    name: '뿌리 부족 연맹',
    color: '#409040',
    domain: '자연·북부 영토·부족 연합',
    territory: '대륙 북부 전역 / 대삼림',
    desc: '뿌리 신앙을 중심으로 연합한 북부 부족들의 동맹. 도시 문명을 거부하며 자연 속에서 독자적인 법을 유지한다.',
    philosophy: '자연은 법이다. 대지의 뜻을 거스르는 자는 배척한다.',
    secret: '부족 연맹 내 샤먼들은 루프의 존재를 "세계의 숨"으로 인지하고 있다. 루프가 반복될 때마다 의식을 치른다.',
    publicFace: '독립적인 부족 연합. 외부와 교역하지 않는 폐쇄 집단.',
    npcTone: '자연스럽고 직관적. 신뢰를 얻기 전에는 외부인에게 극도로 경계적.',
    joinReq: { per: 45, fath: 30, note: '뿌리 신앙을 따르거나 자연 친화적인 종족(엘프·오크 등) 우대. 도시 출신은 시험 기간 1년 이상 필요.' },
    ranks: ['나그네', '구성원', '전사', '사냥꾼장', '장로', '대신관'],
    rivals: ['iron_throne', 'sun_council'],
    allies: ['wanderers_guild'],
    events: {
      join:    '뿌리 부족 연맹의 일원으로 받아들여졌다. 자연의 법을 따라야 한다.',
      rep_up:  '부족의 신뢰를 얻었다. 금지 구역 접근 허가가 나온다.',
      rep_down:'자연의 법을 어겼다. 의식을 통해 사죄하지 않으면 추방될 수 있다.',
      betray:  '부족을 배신했다. 대삼림에서 평생 추적당한다.',
      quest:   ['정령 의식', '침입자 격퇴', '약초·재료 수집', '사냥 의식', '꿈 해몽'],
    },
  },

  // ── B등급: 지역 지배 세력 ──────────────────────────────────────────────────
  shadow_compact: {
    id: 'shadow_compact', grade: 'B', icon: '🌑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>`,
    name: '그림자 협약',
    color: '#6040a0',
    domain: '암살·정보·지하 세계',
    territory: '대도시 지하 / 암흑가 전역',
    desc: '대륙 암흑가를 조율하는 비밀 조직. 암살·절도·정보 거래를 사업으로 한다. 존재 자체를 부정하지만 모두가 알고 있다.',
    philosophy: '그림자 속에서 움직이는 자가 세상을 지배한다.',
    secret: '그림자 협약의 수장은 귀족 의회 의원이다. 낮에는 법을 만들고 밤에는 법을 파괴한다.',
    publicFace: '존재하지 않는 조직.',
    npcTone: '드러나지 않는다. 접촉은 항상 중개인을 통해.',
    joinReq: { agi: 45, disg: 40, note: '기존 조직원의 추천 필수. 신원 보증 없이는 접근 불가. 거절당하면 기억이 지워진다.' },
    ranks: ['망루꾼', '실행원', '전문가', '중개인', '간부', '협약장'],
    rivals: ['sun_council', 'silver_lance'],
    allies: ['void_circle', 'merchant_crown'],
    events: {
      join:    '그림자 협약의 일원이 됐다. 정체를 밝히면 제거된다.',
      rep_up:  '협약 내 신뢰를 얻었다. 더 위험하고 수익성 높은 의뢰가 들어온다.',
      rep_down:'실수가 있었다. 감시가 붙을 수 있다.',
      betray:  '협약을 배신했다. 어디서든 암살자가 따라온다.',
      quest:   ['암살 의뢰', '기밀 탈취', '위장 잠입', '증인 제거', '경쟁 조직 와해'],
    },
  },

  blood_banner: {
    id: 'blood_banner', grade: 'B', icon: '🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C12 3 6 11 6 15.5 C6 18.5 8.7 21 12 21 C15.3 21 18 18.5 18 15.5 C18 11 12 3 12 3 Z" stroke-linejoin="round"/></svg>`,
    name: '피의 군기단',
    color: '#c02020',
    domain: '약탈·정복·공포 지배',
    territory: '대륙 동부 국경지대',
    desc: '약탈과 공포로 영토를 지배하는 군사 집단. 강한 자가 모든 것을 갖는다는 원칙 하에 운영된다.',
    philosophy: '힘만이 진실이다. 약자의 것은 강자의 것이다.',
    secret: '군기단의 진짜 목적은 약탈이 아니다. 고대 전쟁 신의 부활 의식을 위해 피를 모으고 있다.',
    publicFace: '악명 높은 약탈 군단. 근처에는 얼씬도 하지 말 것.',
    npcTone: '거칠고 직접적. 약함을 보이면 즉시 착취한다.',
    joinReq: { str: 55, note: '결투에서 현 조직원을 이기면 가입 가능. 패배하면 노예가 된다.' },
    ranks: ['노예병', '일반병', '십인장', '백인장', '장군', '군기 대장'],
    rivals: ['iron_throne', 'silver_lance', 'merchant_crown'],
    allies: ['void_circle'],
    events: {
      join:    '피의 군기단에 합류했다. 약하면 동료에게도 착취당한다.',
      rep_up:  '강함을 인정받았다. 더 좋은 약탈품 우선 배분.',
      rep_down:'약함을 보였다. 강등되거나 노예로 전락할 수 있다.',
      betray:  '군기단을 배신했다. 동부 국경에선 살아남기 어렵다.',
      quest:   ['마을 약탈', '포로 포획', '결투', '요새 습격', '경쟁 세력 섬멸'],
    },
  },

  alchemist_guild: {
    id: 'alchemist_guild', grade: 'B', icon: '⚗️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2 L15 2 M10 2 L10 9 L4.5 18 C4 19 4.7 20 6 20 L18 20 C19.3 20 20 19 19.5 18 L14 9 L14 2" stroke-linejoin="round"/><path d="M7 15 L17 15" stroke-width="1.1"/></svg>`,
    name: '연금술사 길드',
    color: '#408060',
    domain: '연금술·제조·비약',
    territory: '대륙 중부·동부 도시 길드 하우스',
    desc: '연금술과 제조 기술을 독점하는 장인 집단. 포션·독약·폭발물 등 모든 화학적 산물의 공급을 통제한다.',
    philosophy: '기술이 세계를 바꾼다. 지식은 독점해야 가치가 있다.',
    secret: '연금술사 길드는 불사의 묘약 연구를 수십 년째 진행 중이다. 실험 재료가 실종자들과 관련이 있다는 소문이 있다.',
    publicFace: '합법 제조업 길드. 허가증 없이 포션 판매 금지.',
    npcTone: '기술적이고 꼼꼼하다. 규정과 허가에 집착한다.',
    joinReq: { int: 50, note: '연금술 기초 시험 통과 필수. 또는 희귀 재료 기증으로 단번에 입문 가능.' },
    ranks: ['견습생', '조수', '연금술사', '마스터', '그랜드마스터', '길드장'],
    rivals: ['blood_banner'],
    allies: ['merchant_crown', 'ancient_conclave', 'scholars_hall'],
    events: {
      join:    '연금술사 길드에 등록됐다. 무허가 포션 제조는 금지된다.',
      rep_up:  '길드 내 기술력을 인정받았다. 희귀 레시피 접근 가능.',
      rep_down:'규정을 어겼다. 허가 정지 위험.',
      betray:  '길드 비밀을 유출했다. 독약 공급이 끊기며 추격자가 붙는다.',
      quest:   ['희귀 재료 수집', '신약 임상 테스트', '경쟁 길드 방해', '금지된 합성 의뢰'],
    },
  },

  void_circle: {
    id: 'void_circle', grade: 'B', icon: '🌀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M12 12 C12 12 17 8 17 12 C17 16 12 12 12 12 C12 12 7 16 7 12 C7 8 12 12 12 12 Z" stroke-width="1.1"/></svg>`,
    name: '공허 결사',
    color: '#604080',
    domain: '공허 마법·차원·금기',
    territory: '세계 각지 비밀 거점 (위치 미공개)',
    desc: '금기 마법과 공허 에너지를 연구하는 위험한 비밀 결사. 세계의 경계를 허물고 차원을 넘나드는 것이 목표다.',
    philosophy: '경계는 인간이 만든 환상이다. 진실은 경계 너머에 있다.',
    secret: '공허 결사는 이 세계가 루프 안에 있음을 알고 있으며, 루프 자체를 부수려 하고 있다. 그 방법이 세계를 파괴할 수도 있다.',
    publicFace: '존재하지 않음.',
    npcTone: '철학적이고 광기 어린. 현실과 비현실을 구분하지 않는다.',
    joinReq: { mgc: 60, note: '루프 자각자이거나 공허 마법 흔적을 보유한 자만 입문 가능. 결사가 먼저 찾아온다.' },
    ranks: ['개안자', '탐구자', '경계 파괴자', '공허 술사', '공허 사제', '결사장'],
    rivals: ['iron_throne', 'sun_council', 'ancient_conclave'],
    allies: ['shadow_compact', 'blood_banner'],
    events: {
      join:    '공허 결사의 일원이 됐다. 이제 세계가 다르게 보인다.',
      rep_up:  '결사 내 신뢰가 깊어졌다. 차원 이동 기술을 배울 수 있다.',
      rep_down:'의심을 받고 있다. 기억이 지워질 수 있다.',
      betray:  '결사를 배신했다. 차원의 틈 어딘가에 갇히게 된다.',
      quest:   ['차원 균열 조사', '공허 재료 수집', '금기 의식 수행', '루프 흔적 탐사'],
    },
  },

  // ── C등급: 도시 혹은 특정 집단 ──────────────────────────────────────────────
  healers_order: {
    id: 'healers_order', grade: 'C', icon: '💚', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20 C12 20 3 14 3 8.2 C3 5.3 5.3 3 8.2 3 C10 3 11.3 3.9 12 5.2 C12.7 3.9 14 3 15.8 3 C18.7 3 21 5.3 21 8.2 C21 14 12 20 12 20 Z" stroke-linejoin="round"/></svg>`,
    name: '치유사 수도회',
    color: '#40a060',
    domain: '치유·의학·구호',
    territory: '대륙 전역 치유소 네트워크',
    desc: '종교와 무관하게 누구든 치료하는 의료 집단. 전장에서도 중립을 유지하며 모든 부상자를 돕는다.',
    philosophy: '생명은 신념보다 귀하다. 적도 치료한다.',
    secret: '치유사 수도회는 죽은 자를 잠시 되살리는 금지된 의술을 알고 있다. 극소수만 아는 비밀.',
    publicFace: '무결점 중립 의료 집단. 건드리면 모든 세력의 적이 된다.',
    npcTone: '따뜻하고 헌신적. 어떤 환자도 거부하지 않는다.',
    joinReq: { wil: 35, note: '치유 의지가 있으면 출신 불문. 단, 가입 후 중립 서약을 해야 한다.' },
    ranks: ['견습 치유사', '치유사', '상급 치유사', '마스터', '수도원장'],
    rivals: [],
    allies: ['wanderers_guild', 'scholars_hall'],
    events: {
      join:    '치유사 수도회에 입단했다. 중립 서약으로 어떤 세력과도 적이 되지 않는다.',
      rep_up:  '수도회 내 신임이 올랐다. 금지된 의술을 배울 기회가 생긴다.',
      rep_down:'중립 서약을 어겼다. 제명 위기.',
      betray:  '수도회를 배신했다. 대륙 모든 치유소의 문이 닫힌다.',
      quest:   ['전장 구호 활동', '전염병 연구', '실종 치유사 수색', '금지 의술 연구'],
    },
  },

  wanderers_guild: {
    id: 'wanderers_guild', grade: 'C', icon: '🧭', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M15 9 L13 13 L9 15 L11 11 Z" stroke-linejoin="round"/></svg>`,
    name: '방랑자 길드',
    color: '#806040',
    domain: '탐험·정보·의뢰 중개',
    territory: '대륙 전역 여관·거점 네트워크',
    desc: '모험가·탐험가·방랑자들의 느슨한 연대. 강제 의무가 없으며 원하는 의뢰만 받으면 된다. 정보 공유와 상호 부조가 핵심.',
    philosophy: '자유롭게 떠돌고, 자유롭게 선택한다.',
    secret: '방랑자 길드 내부에 루프 자각자 소규모 모임이 있다. "반복자 모임"이라 불린다.',
    publicFace: '모험가·의뢰인 연결 중개 조직. 어디서나 볼 수 있다.',
    npcTone: '자유롭고 개방적. 어떤 출신도 환영한다.',
    joinReq: { note: '조건 없음. 길드 마크만 받으면 누구나 가입 가능.' },
    ranks: ['등록 방랑자', '베테랑', '명성 있는 방랑자', '전설급'],
    rivals: [],
    allies: ['healers_order', 'merchant_crown', 'root_tribe'],
    events: {
      join:    '방랑자 길드에 등록됐다. 대륙 어디서든 길드 마크가 통한다.',
      rep_up:  '명성이 올랐다. 더 높은 보수의 의뢰가 들어온다.',
      rep_down:'평판이 내려갔다. 의뢰 배정이 줄어든다.',
      betray:  '길드를 배신했다. 의뢰 블랙리스트에 오른다.',
      quest:   ['던전 탐사', '호위', '물건 배달', '정보 수집', '미지 지역 지도 제작'],
    },
  },

  scholars_hall: {
    id: 'scholars_hall', grade: 'C', icon: '📚', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/></svg>`,
    name: '학자의 전당',
    color: '#6060a0',
    domain: '학문·역사·언어·교육',
    territory: '대륙 주요 도시 도서관·대학',
    desc: '지식인들의 학술 집단. 정치에 관여하지 않으며 역사와 지식을 보존하는 것이 유일한 목적이다.',
    philosophy: '진실은 기록되어야 한다. 역사를 잊는 자는 반복한다.',
    secret: '학자의 전당 깊은 금서고에 루프에 관한 기록이 있다. 수천 년 전 누군가가 남긴 것으로, 현재 단장만 알고 있다.',
    publicFace: '중립적 학술 기관. 지식의 수호자.',
    npcTone: '신중하고 분석적. 주장에는 반드시 근거를 요구한다.',
    joinReq: { int: 45, note: 'INT 기준 이상이며 학술 논문 1편 제출. 또는 희귀 고서 기증.' },
    ranks: ['학생', '연구원', '학자', '수석 학자', '원로', '총장'],
    rivals: [],
    allies: ['alchemist_guild', 'healers_order', 'ancient_conclave'],
    events: {
      join:    '학자의 전당 회원이 됐다. 방대한 자료실 접근 권한이 주어진다.',
      rep_up:  '학문적 기여를 인정받았다. 금서고 일부 접근 가능.',
      rep_down:'학문 윤리를 어겼다. 자료실 접근이 제한된다.',
      betray:  '전당의 비밀을 팔았다. 지식인 사회에서 영구 추방.',
      quest:   ['유물 해석', '고서 번역', '역사 현장 조사', '루프 기록 열람'],
    },
  },

  // ── D등급: 신흥 혹은 소규모 세력 ────────────────────────────────────────────
  new_dawn: {
    id: 'new_dawn', grade: 'D', icon: '🌅', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="17" r="5" stroke-width="1.3"/><path d="M3 17 L21 17" stroke-width="1.4"/><path d="M12 3 L12 6 M5 8 L7 10 M19 8 L17 10" stroke-width="1.1"/></svg>`,
    name: '새벽 혁명단',
    color: '#e06040',
    domain: '반체제·민중 봉기·평등',
    territory: '왕국 내 빈민가·지하 거점',
    desc: '귀족과 왕가의 지배를 타도하려는 민중 혁명 세력. 조직력은 약하지만 민심이 폭발하면 무서운 집단이다.',
    philosophy: '모두가 평등하다. 태어난 신분이 아닌 의지로 살아야 한다.',
    secret: '혁명단 지도자는 사실 몰락한 귀족 출신이다. 개인 복수심이 반체제 운동과 섞여 있다.',
    publicFace: '불만 세력의 집합. 왕국 내 지명 수배 중.',
    npcTone: '열정적이고 거칠다. 신분 차별에 극도로 민감하다.',
    joinReq: { note: '귀족·왕족 출신은 가입 불가. 민중 출신이면 누구든 환영.' },
    ranks: ['동조자', '혁명원', '분대장', '간부', '혁명 지도자'],
    rivals: ['iron_throne', 'sun_council'],
    allies: ['wanderers_guild'],
    events: {
      join:    '새벽 혁명단에 합류했다. 왕국 내에서 체포될 위험이 있다.',
      rep_up:  '혁명 동지로 인정받았다. 더 중요한 거사 계획에 참여한다.',
      rep_down:'의심받고 있다. 밀정으로 오해받을 수 있다.',
      betray:  '혁명단을 밀고했다. 민중의 적이 됐다.',
      quest:   ['귀족 저택 습격', '선동 전단 배포', '왕국군 장비 탈취', '포로 구출'],
    },
  },

  dragon_remnant: {
    id: 'dragon_remnant', grade: 'D', icon: '🐉', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/><path d="M8 6 L6.5 3 M8 6 L9.5 3.5" stroke-width="1.2"/></svg>`,
    name: '용의 잔재',
    color: '#c04020',
    domain: '드래곤 혈통·고대 용 신앙',
    territory: '폐허가 된 드래곤 성역 주변',
    desc: '고대 용 시대의 유산을 지키는 소수 집단. 드래곤혈 종족이나 용을 숭배하는 자들로 이루어져 있다.',
    philosophy: '용의 시대는 끝나지 않았다. 용신의 화신이 다시 태어날 때까지 기다린다.',
    secret: '용의 잔재는 진짜 고룡 한 마리가 인간 형태로 숨어 조직을 이끌고 있다.',
    publicFace: '미신을 믿는 소규모 컬트.',
    npcTone: '장엄하고 고풍스럽다. 드래곤혈에게 본능적으로 경의를 표한다.',
    joinReq: { note: '드래곤혈 종족이면 자동 입문 권유. 다른 종족은 용의 피를 증명하면 가능.' },
    ranks: ['신도', '의식 집전자', '드래곤 기사', '용의 전령', '용의 화신'],
    rivals: ['sun_council'],
    allies: [],
    events: {
      join:    '용의 잔재에 합류했다. 고대 용의 유산을 지키는 임무가 주어진다.',
      rep_up:  '용신의 선택을 받은 자로 인정받았다.',
      rep_down:'용신의 뜻을 어겼다. 의식을 통해 속죄해야 한다.',
      betray:  '용의 잔재를 배신했다. 고룡의 저주를 받는다.',
      quest:   ['용의 성역 정화', '용 알 수호', '드래곤 혈통 탐색', '고대 용어 해독'],
    },
  },
};

window.CLAN_DEFS = CLAN_DEFS;

export function getClanPlayer(clanId){
  const d = loadClanPlayer();
  return d[clanId] || { status:'none', rank:0, rep:0, repHistory:[], joinedAt:null, events:[] };
}
window.getClanPlayer = getClanPlayer;

export function setClanPlayer(clanId, patch){
  const d = loadClanPlayer();
  if(!d[clanId]) d[clanId] = { status:'none', rank:0, rep:0, repHistory:[], joinedAt:null, events:[] };
  Object.assign(d[clanId], patch);
  saveClanPlayer(d);
}
window.setClanPlayer = setClanPlayer;

export function changeClanRep(clanId, delta, reason){
  const cp = getClanPlayer(clanId);
  const newRep = Math.max(-100, Math.min(100, (cp.rep||0) + delta));
  cp.rep = newRep;
  cp.repHistory = cp.repHistory||[];
  cp.repHistory.push({ turn: S.msgCount||0, delta, reason, total: newRep });
  setClanPlayer(clanId, cp);
  addClanHistory(clanId, 'rep_change', `${delta>0?'+':''}${delta} (${reason}) → ${newRep}`);

  // 평판에 따라 상태 자동 갱신
  if(cp.status === 'member'){
    // 멤버 상태에서 -50 이하면 강제 추방
    if(newRep <= -50){
      setClanPlayer(clanId, { status:'enemy', rank:0 });
      const def = CLAN_DEFS[clanId];
      toast(`❌ ${def?.name||clanId}에서 추방됐다!`, 3500);
      addClanHistory(clanId, 'expelled', '평판 -50 이하로 강제 추방');
      S._nextInjectedContext = (S._nextInjectedContext||'')
        + `\n[🏴 가문 추방] 플레이어가 ${def?.name||clanId}에서 강제 추방됐다. ${def?.events?.betray||''} 이 상황을 서사화하라.`;
    }
  }
  if(typeof renderClanPanel==='function') setTimeout(renderClanPanel, 100);
}
window.changeClanRep = changeClanRep;

window.changeClanRep = changeClanRep;

export function joinClan(clanId){
  const def = CLAN_DEFS[clanId];
  if(!def){ toast('알 수 없는 가문입니다.', 2000); return; }

  const cp = getClanPlayer(clanId);
  if(cp.status === 'member'){ toast(`이미 ${def.name}의 일원입니다.`, 2000); return; }
  if(cp.status === 'enemy'){  toast(`${def.name}의 적으로 지목됐습니다. 가입 불가.`, 2500); return; }

  // 가입 조건 체크 (소프트 체크 — AI가 최종 판단)
  const req = def.joinReq||{};
  const warnings = [];
  if(req.rep && (S.stats?.rep||0) < req.rep) warnings.push(`평판 부족 (${req.rep} 필요)`);
  if(req.str && (S.stats?.str||0) < req.str) warnings.push(`STR 부족 (${req.str} 필요)`);
  if(req.int && (S.stats?.int||0) < req.int) warnings.push(`INT 부족 (${req.int} 필요)`);
  if(req.mgc && (S.stats?.mgc||0) < req.mgc) warnings.push(`MGC 부족 (${req.mgc} 필요)`);
  if(req.agi && (S.stats?.agi||0) < req.agi) warnings.push(`AGI 부족 (${req.agi} 필요)`);
  if(req.fath && (S.stats?.fath||0) < req.fath) warnings.push(`신앙 부족 (${req.fath} 필요)`);
  if(req.neg && (S.stats?.neg||0) < req.neg) warnings.push(`협상 부족 (${req.neg} 필요)`);
  if(req.per && (S.stats?.per||0) < req.per) warnings.push(`지각 부족 (${req.per} 필요)`);
  if(req.disg && (S.stats?.disg||0) < req.disg) warnings.push(`위장 부족 (${req.disg} 필요)`);

  setClanPlayer(clanId, { status:'member', rank:0, joinedAt: S.msgCount||0 });
  addClanHistory(clanId, 'join', `${def.name} 가입`);

  // 적대 가문과 자동 갈등
  (def.rivals||[]).forEach(rId=>{
    const rcp = getClanPlayer(rId);
    if(rcp.status === 'member'){
      toast(`⚠️ ${CLAN_DEFS[rId]?.name}와(과) 갈등이 생길 수 있습니다.`, 3000);
    }
  });

  toast(`🏴 ${def.name}에 가입했습니다!`, 3000);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('faction', `${def.name} 가입`, { icon: def.icon });

  // [3순위 보강] 메인 스토리의 withAiden/withoutAiden 패턴을 가문 가입에도
  // 적용. 에이든 없이 혼자 가입하러 온 자를 가문이 더 흥미롭게/진지하게
  // 보는 것은 메인 챕터 전체의 일관된 원칙이므로 동일하게 반영.
  const aidenWith = (typeof isAidenInParty==='function') ? isAidenInParty() : false;
  const soloJoinNote = aidenWith
    ? ''
    : `\n에이든 없이 단독으로 가입하러 왔다는 점을 가문 NPC가 알아챌 수 있다 — "에이든의 그늘 없이 혼자 왔군" 식의 반응이 자연스럽다. 평판이 낮은 자가 혼자 찾아온 것을 무모함이 아니라 의미 있는 선택으로 보는 가문(${def.grade==='S'||def.grade==='A'?'특히 거대 세력':'일부'})이라면 더 진지하게 대할 수 있다.`;

  // AI 서사 주입
  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `\n[🏴 가문 가입] 플레이어가 ${def.name}(등급:${def.grade})에 가입했다.`
    + `\n${def.events?.join||''}`
    + (warnings.length ? `\n조건 경고: ${warnings.join(', ')} — 조건 미달이지만 가입은 허용됐다. 서사에서 이 아슬아슬함을 반영할 것.` : '')
    + soloJoinNote
    + `\n가입 후 가문 NPC들의 초기 반응을 묘사하라. 가문 철학(${def.philosophy})을 반영할 것.`
    + `\nGS: {"clan_join":"${clanId}"} 출력.`;

  if(typeof renderClanPanel==='function') setTimeout(renderClanPanel, 100);
}
window.joinClan = joinClan;

window.joinClan = joinClan;

export function leaveClan(clanId){
  const def = CLAN_DEFS[clanId];
  const cp  = getClanPlayer(clanId);
  if(cp.status !== 'member'){ toast('가입된 가문이 아닙니다.', 2000); return; }

  setClanPlayer(clanId, { status:'rival', rank:0 });
  changeClanRep(clanId, -20, '탈퇴');
  addClanHistory(clanId, 'leave', `${def?.name||clanId} 탈퇴`);
  toast(`🚪 ${def?.name||clanId}에서 탈퇴했습니다.`, 2500);

  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `\n[🚪 가문 탈퇴] 플레이어가 ${def?.name||clanId}에서 탈퇴했다. `
    + `탈퇴에 대한 가문의 반응을 자연스럽게 묘사하라. GS: {"clan_leave":"${clanId}"} 출력.`;
  if(typeof renderClanPanel==='function') setTimeout(renderClanPanel, 100);
}
window.leaveClan = leaveClan;

window.leaveClan = leaveClan;

export function promoteClan(clanId){
  const def = CLAN_DEFS[clanId];
  const cp  = getClanPlayer(clanId);
  if(cp.status !== 'member') return;
  const ranks = def.ranks||[];
  if(cp.rank >= ranks.length - 1){ toast('이미 최고 직위입니다.', 2000); return; }
  const newRank = (cp.rank||0) + 1;
  setClanPlayer(clanId, { rank: newRank });
  addClanHistory(clanId, 'promote', `${ranks[newRank]} 승진`);
  toast(`⬆️ ${def.name} — ${ranks[newRank]} 승진!`, 3000);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('event', `${def.name} ${ranks[newRank]} 승진`, { icon: def.icon });

  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `\n[⬆️ 가문 승진] 플레이어가 ${def.name}에서 ${ranks[newRank]} 직위를 받았다. `
    + `승진 장면을 가문 분위기에 맞게 묘사하라. GS: {"clan_rep_delta":{"clan":"${clanId}","delta":10,"reason":"승진"}} 출력.`;
  if(typeof renderClanPanel==='function') setTimeout(renderClanPanel, 100);
}
window.promoteClan = promoteClan;

window.promoteClan = promoteClan;
