// block7-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { CONTINENT_CURRENCY, CONTINENT_DEFAULT_WEATHER, CONTINENT_EXCLUSIVE_JOBS, CONTINENT_SPEECH_HINTS, CONTINENT_TABOOS, CULTURE_SHOCK_HINTS } from '../data/292-block7-preamble.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { addAIJob, discoverJob } from '../job/042-직업-시스템-무한-파생-도감.js';
import { FIVE_CONTINENTS, loadContinentRep, updateContinentRep } from '../race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadAtmosphere, saveAtmosphere } from './001-block0-preamble.js';

export function getContinentExchangeRate(){
  const origin = S.character?.startContinent || 'central';
  const current = S.character?.currentContinent
    || (typeof window.currentLocation !== 'undefined' && window.currentLocation?.continent)
    || origin;
  if(origin === current) return 1.0;
  const originRate = CONTINENT_CURRENCY[origin]?.exchangeRate || 1.0;
  return Math.round(originRate * 100) / 100;
}
window.getContinentExchangeRate = getContinentExchangeRate;

export function addGoldWithExchange(amount, reason=''){
  const rate = getContinentExchangeRate();
  const final = Math.max(1, Math.round(amount * rate));
  S.gold = (S.gold||0) + final;
  saveGold(S.gold);
  window.updateHeader();
  if(rate !== 1.0 && reason){
    const cur = CONTINENT_CURRENCY[S.character?.startContinent||'central'];
    toastHTML(`${esc(cur?.icon||'💰')} ${esc(reason)}: ${esc(final)}${esc(cur?.unit||'G')} (환율 ×${esc(rate)})`, 2500);
  }
  return final;
}
window.addGoldWithExchange = addGoldWithExchange;

window.addGoldWithExchange = addGoldWithExchange;

export function checkContinentTaboo(userMsg){
  const cid = S.character?.startContinent || 'central';
  const taboos = CONTINENT_TABOOS[cid] || [];
  for(const tab of taboos){
    if(tab.pattern.test(userMsg)){
      // 대륙 평판 감소
      if(typeof updateContinentRep === 'function') updateContinentRep(cid, tab.repDelta, tab.label);
      // AI 힌트 주입
      S._nextInjectedContext = (S._nextInjectedContext||'') + ` [⚠️ 대륙 금기 위반: ${tab.label}] ${tab.aiHint}`;
      toast(`⚠️ ${tab.label}`, 2500);
      break;
    }
  }
}
window.checkContinentTaboo = checkContinentTaboo;

window.checkContinentTaboo = checkContinentTaboo;

export function applyContinentWeather(){
  const cid = S.character?.startContinent || 'central';
  const def = CONTINENT_DEFAULT_WEATHER[cid];
  if(!def) return;
  const atm = loadAtmosphere();
  // 기본값이 none인 경우(날씨 미설정)에만 대륙 기본값 적용
  if(atm.weather === 'none' || !atm.weather){
    atm.weather = def.weather;
    atm.timeOfDay = def.timeOfDay;
    saveAtmosphere(atm);
    S.atmosphere = atm;
  }
}
window.applyContinentWeather = applyContinentWeather;

window.applyContinentWeather = applyContinentWeather;

export function getCultureShockHint(originContinent, currentContinent){
  if(originContinent === currentContinent) return '';
  return CULTURE_SHOCK_HINTS[originContinent]?.[currentContinent] || '';
}
window.getCultureShockHint = getCultureShockHint;

window.getCultureShockHint = getCultureShockHint;

export const CONTINENT_CRISIS_EVENTS = {
  north: [
    { id:'nc_invasion',    weight:40, icon:'❄️⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 2 L12 22 M4 7 L20 17 M20 7 L4 17" stroke-width="1.2"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, title:'야만족 대침공',
      desc:'북방 야만족이 대군을 이끌고 국경을 넘었다는 급보가 도착했다.',
      choices:['귀환하여 왕국을 지킨다', '무시하고 계속 진행한다', '용병을 모집하여 대응한다'],
      outcomes:{ 0:{ repDelta:20, hint:'고향을 지키기 위해 귀환을 선택한다. 북방의 영웅으로 기억될 것이다.' },
                 1:{ repDelta:-15, hint:'고향의 위기를 외면했다. 북방 전사들이 배신자라 부른다.' },
                 2:{ repDelta:10, hint:'용병을 보내 간접 지원한다. 완벽하진 않지만 체면은 지켰다.' } } },
    { id:'nc_blizzard',   weight:30, icon:'🌨️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15 C4 15 3 13.5 3 12 C3 10 4.5 9 6 9.2 C6.5 6.8 8.7 5 11 5 C13.8 5 16 7.2 16 10 C16 10 16 10 16 10 C18 10 19.5 11.5 19.5 13.5 C19.5 15.5 18 17 16 17 L7 17 C6.5 17 6 16 6 15 Z" stroke-linejoin="round"/><path d="M8 20 L8 21.5 M12 20 L12 21.5 M16 20 L16 21.5" stroke-width="1.3"/></svg>`, title:'100년 만의 대설',
      desc:'북대륙에 100년 만의 대설이 닥쳤다는 소식. 식량 지원이 절실하다.',
      choices:['골드를 보내 지원한다(100G)', '방법을 찾아 도움을 준다', '어쩔 수 없다'],
      outcomes:{ 0:{ repDelta:15, goldDelta:-100, hint:'100G를 보내 식량 위기를 해결하는 데 기여했다.' },
                 1:{ repDelta:10, hint:'직접 방법을 찾아 북방 동포들을 돕는다.' },
                 2:{ repDelta:-5, hint:'멀리서 소식만 듣는다. 북방 사람들이 조금 실망한다.' } } },
  ],
  east: [
    { id:'ec_power_struggle', weight:40, icon:'🏯⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M4 21 L4 9 L6 9 L6 7 L8 7 L8 9 L10.5 9 L10.5 6 L13.5 6 L13.5 9 L16 9 L16 7 L18 7 L18 9 L20 9 L20 21 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, title:'황실 권력 다툼',
      desc:'동방 황실에서 권력 다툼이 벌어지고 있다. 어느 파벌을 지지하겠는가?',
      choices:['황태자 파를 지지한다', '황후 파를 지지한다', '중립을 지킨다'],
      outcomes:{ 0:{ repDelta:12, hint:'황태자 파의 지지를 선언한다. 향후 황제 즉위 시 큰 보상이 있을 것이다.' },
                 1:{ repDelta:8, hint:'황후 파를 지지한다. 황실 내 인맥이 생긴다.' },
                 2:{ repDelta:3, hint:'중립을 선언한다. 양측 모두의 의심을 받지만 안전하다.' } } },
    { id:'ec_murim_tournament', weight:35, icon:'⚔️🌸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="8" cy="16" r="2.5"/><circle cx="15" cy="8" r="2.5"/></g></svg>`, title:'무림 천하대회 개최',
      desc:'10년에 한 번 열리는 무림 천하대회 소식이 들려온다.',
      choices:['참가 의사를 밝힌다', '구경꾼으로 참석한다', '관심 없다'],
      outcomes:{ 0:{ repDelta:15, hint:'천하대회 참가를 선언한다. 강호의 고수들이 주목한다.' },
                 1:{ repDelta:5, hint:'관전자로 참석한다. 강호의 정세를 파악할 수 있다.' },
                 2:{ repDelta:0, hint:'무림과 거리를 둔다.' } } },
  ],
  west: [
    { id:'wc_steam_explosion', weight:35, icon:'💥⚙️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 2 L14 8 L20 6 L16 11 L20 16 L14 14 L12 20 L10 14 L4 16 L8 11 L4 6 L10 8 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="3.2"/><path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12 M5.5 5.5 L7.5 7.5 M16.5 16.5 L18.5 18.5 M18.5 5.5 L16.5 7.5 M7.5 16.5 L5.5 18.5" stroke-width="1.2"/></g></svg>`, title:'대공창 폭발 사고',
      desc:'서대륙 대공창에서 대규모 폭발이 발생했다는 소식이 들어온다.',
      choices:['현장으로 달려가 구조를 돕는다', '기술적 원인을 조사한다', '무고한 자를 돕는다'],
      outcomes:{ 0:{ repDelta:18, hint:'구조 활동에 참여한다. 서대륙 시민들의 신뢰를 얻는다.' },
                 1:{ repDelta:10, hint:'원인 조사에 나선다. 기술자들의 존중을 받는다.' },
                 2:{ repDelta:12, hint:'부상자를 돕는다. 서민들에게 영웅으로 기억된다.' } } },
    { id:'wc_trade_war',     weight:30, icon:'💰⚙️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="3.2"/><path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12 M5.5 5.5 L7.5 7.5 M16.5 16.5 L18.5 18.5 M18.5 5.5 L16.5 7.5 M7.5 16.5 L5.5 18.5" stroke-width="1.2"/></g></svg>`, title:'무역 분쟁 발발',
      desc:'서대륙과 남대륙 간 무역 분쟁이 전쟁 직전까지 치달았다.',
      choices:['서대륙 편을 든다', '중재자를 자처한다', '이득을 취한다'],
      outcomes:{ 0:{ repDelta:12, hint:'서대륙의 입장을 지지한다. 증기 왕국과 관계가 깊어진다.' },
                 1:{ repDelta:8, hint:'중재자로 나선다. 양측 모두에게 인정받는다.' },
                 2:{ repDelta:-5, hint:'혼란을 틈타 이득을 취한다. 평판이 약간 하락한다.' } } },
  ],
  south: [
    { id:'sc_ruin_activation', weight:40, icon:'🌴🌟', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 21 L12 10 C12 10 9 8 6 9 M12 10 C12 10 15 8 18 9 M12 10 C12 10 10 6 7 6 M12 10 C12 10 14 6 17 6" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></g></svg>`, title:'고대 신전 각성',
      desc:'남대륙 깊은 밀림에서 고대 신전이 자력으로 깨어났다는 소문이 퍼진다.',
      choices:['신전을 향해 출발한다', '정보를 더 모은다', '위험하니 회피한다'],
      outcomes:{ 0:{ repDelta:15, hint:'고대 신전으로 향한다. 남방 탐험가들과 연대 가능성이 생긴다.' },
                 1:{ repDelta:8, hint:'정보를 수집한다. 신전에 대한 단서를 얻는다.' },
                 2:{ repDelta:-3, hint:'위험을 피한다. 신전의 비밀은 잠시 뒤로 미뤄진다.' } } },
    { id:'sc_plague',         weight:25, icon:'🌿💀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 21 C12 21 12 12 12 8 C12 4.5 9 3 6 3 C6 6.5 8 9 12 9" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></g></svg>`, title:'정글 독초 역병',
      desc:'남대륙에 알 수 없는 독초 역병이 퍼지고 있다는 급보가 왔다.',
      choices:['치료제를 찾아 나선다', '격리 지원을 한다', '위험 지역을 피한다'],
      outcomes:{ 0:{ repDelta:20, hint:'치료제 탐색에 나선다. 남방의 진정한 영웅이 될 기회.' },
                 1:{ repDelta:10, hint:'격리 지원에 협력한다. 피해 확산을 막는 데 기여한다.' },
                 2:{ repDelta:-8, hint:'위험을 피해 달아난다. 남방 사람들이 실망한다.' } } },
  ],
  central: [
    { id:'cc_summit',        weight:40, icon:'🏰🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M4 21 L4 9 L6 9 L6 7 L8 7 L8 9 L10.5 9 L10.5 6 L13.5 6 L13.5 9 L16 9 L16 7 L18 7 L18 9 L20 9 L20 21 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, title:'오대륙 정상 회담',
      desc:'중앙 대륙에서 오대륙 정상 회담이 열린다. 왕국이 참관을 요청했다.',
      choices:['적극 참여한다', '관찰자로 참석한다', '배후에서 정보를 수집한다'],
      outcomes:{ 0:{ repDelta:15, hint:'정상 회담에 적극 참여한다. 각 대륙 외교관들과 인맥이 생긴다.' },
                 1:{ repDelta:8, hint:'관찰한다. 각 대륙의 속사정을 파악한다.' },
                 2:{ repDelta:5, hint:'배후에서 정보를 모은다. 정치적 자산을 축적한다.' } } },
    { id:'cc_succession',    weight:30, icon:'👑⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, title:'왕위 계승 분쟁',
      desc:'중앙 왕국의 왕위 계승을 둘러싼 분쟁이 수면 위로 올라왔다.',
      choices:['왕태자를 지지한다', '반란 세력과 접촉한다', '중립을 유지한다'],
      outcomes:{ 0:{ repDelta:12, hint:'왕태자 지지를 선언한다. 왕국 기사단의 신뢰를 얻는다.' },
                 1:{ repDelta:-8, hint:'반란 세력과 접촉한다. 위험하지만 큰 보상의 가능성이 있다.' },
                 2:{ repDelta:3, hint:'중립을 지킨다. 어느 쪽도 적이 되지 않는다.' } } },
  ],
  northeast: [
    { id:'nec_worldtree_blight', weight:45, icon:'🌳💀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 21 L12 11" /><path d="M12 11 C7 11 4 8 4 4 C8 4 11 6 12 9 C13 6 16 4 20 4 C20 8 17 11 12 11 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></g></svg>`, title:'세계수 저주 발동',
      desc:'세계수 이그드라의 잎이 검게 변하기 시작했다는 급보가 달빛 숲에서 전해진다.',
      choices:['세계수 신전으로 즉시 향한다', '실라리엘 대예언사에게 연락한다', '상황을 지켜본다'],
      outcomes:{ 0:{ repDelta:20, hint:'세계수 신전으로 향한다. 봉인석 균열과의 연결고리를 발견할 수 있다.' },
                 1:{ repDelta:12, hint:'실라리엘에게 연락한다. 그녀가 처음으로 진실의 단편을 흘린다.' },
                 2:{ repDelta:-5, hint:'방관한다. 엘프 원로원이 실망한다. 세계수의 저주는 계속된다.' } } },
    { id:'nec_human_elf_clash', weight:35, icon:'🌿⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 21 C12 21 12 12 12 8 C12 4.5 9 3 6 3 C6 6.5 8 9 12 9" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, title:'인간-엘프 충돌',
      desc:'달빛 숲 외곽 인간 정착촌에서 엘프 보수파와 인간 이민자 간 충돌이 발생했다.',
      choices:['인간 이민자 편을 든다', '엘프 원로원을 설득한다', '에단 로스와 함께 중재한다'],
      outcomes:{ 0:{ repDelta:10, hint:'인간 이민자를 지지한다. 정착촌 사람들의 신뢰를 얻지만 엘프 귀족들의 반감을 산다.' },
                 1:{ repDelta:8, hint:'엘프를 설득한다. 원로원 일부가 마음을 연다.' },
                 2:{ repDelta:18, hint:'에단 로스와 중재에 나선다. 양측 모두에게 공정한 인물로 인정받는다.' } } },
  ],
  southeast: [
    { id:'sec_pirate_election', weight:40, icon:'🏴‍☠️⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="9" r="4"/><circle cx="9.7" cy="8" r="0.7" fill="currentColor"/><circle cx="14.3" cy="8" r="0.7" fill="currentColor"/><path d="M9.5 11.5 C10.3 12.3 13.7 12.3 14.5 11.5" stroke-width="1.2"/><path d="M9 21 L9 15 L15 15 L15 21"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, title:'해적왕 선거 쿠데타',
      desc:'군도에서 해적왕 발타자르의 지위를 위협하는 쿠데타가 시작됐다는 소식이 들어온다.',
      choices:['발타자르를 지지한다', '쿠데타 세력과 접촉한다', '혼란을 틈타 이득을 취한다'],
      outcomes:{ 0:{ repDelta:12, hint:'발타자르를 지지한다. 해적왕의 신임을 얻지만 그의 비밀에 더 깊이 연루된다.' },
                 1:{ repDelta:8, hint:'쿠데타 세력과 접촉한다. 위험하지만 새 권력의 지지를 얻을 수 있다.' },
                 2:{ repDelta:5, hint:'혼란 속에서 정보를 수집한다. 군도 전체의 상황을 파악한다.' } } },
    { id:'sec_abyss_tremor',    weight:35, icon:'🌊💀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M2 12 C2 12 5 9 8 12 C11 15 13 12 16 12 C19 12 22 9 22 9 M2 17 C2 17 5 14 8 17 C11 20 13 17 16 17 C19 17 22 14 22 14" stroke-width="1.4"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></g></svg>`, title:'테네브라 해구 진동',
      desc:'봉인의 심연 테네브라 해구에서 이상한 진동이 감지됐다. 봉인이 약해지고 있다.',
      choices:['해구 근처로 조사하러 간다', '마리넬라에게 정보를 구한다', '다른 대륙에 경보를 전한다'],
      outcomes:{ 0:{ repDelta:15, hint:'해구 조사에 나선다. 봉인된 고대 신의 기운을 직접 느낀다.' },
                 1:{ repDelta:10, hint:'마리넬라에게 접촉한다. 그녀가 봉인의 진실 일부를 알려준다.' },
                 2:{ repDelta:18, hint:'다른 대륙에 경보를 전한다. 세계적 위협에 대한 인식을 높인다.' } } },
  ],
  northwest: [
    { id:'nwc_ancient_machine', weight:45, icon:'⚙️💀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="3.2"/><path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12 M5.5 5.5 L7.5 7.5 M16.5 16.5 L18.5 18.5 M18.5 5.5 L16.5 7.5 M7.5 16.5 L5.5 18.5" stroke-width="1.2"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></g></svg>`, title:'고대 기계 재가동',
      desc:'지하 왕국 기어하트 신전 깊은 곳에서 잠들어 있던 고대 기계들이 스스로 움직이기 시작했다.',
      choices:['드워프 왕국에 지원을 제안한다', '기어하트로 잠입 조사한다', '볼린 기계 사제에게 연락한다'],
      outcomes:{ 0:{ repDelta:15, hint:'드워프를 돕겠다고 나선다. 투린 XVII세의 신뢰를 얻는다.' },
                 1:{ repDelta:18, hint:'기어하트에 직접 잠입한다. 고대 기계 문명의 비밀에 다가선다.' },
                 2:{ repDelta:10, hint:'볼린에게 연락한다. 그가 기계 문명의 진실 일부를 공유한다.' } } },
    { id:'nwc_surface_conflict', weight:30, icon:'⛏️🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M4 4 C4 4 9 4 12 7 C15 10 15 15 15 15" stroke-linejoin="round"/><path d="M20 4 C20 4 15 4 12 7" stroke-linejoin="round"/><path d="M6 20 L15 11" stroke-width="1.8"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, title:'지하 자원 채굴권 분쟁',
      desc:'드워프 왕국과 서대륙 상공회의소 간 지하 자원 채굴권 분쟁이 전쟁 직전까지 치달았다.',
      choices:['드워프 편을 든다', '중재자로 나선다', '분쟁을 이용해 이득을 취한다'],
      outcomes:{ 0:{ repDelta:15, hint:'드워프를 지지한다. 지하 왕국과 깊은 유대가 생긴다.' },
                 1:{ repDelta:12, hint:'중재를 시도한다. 양측 모두의 인정을 받는다.' },
                 2:{ repDelta:-5, hint:'혼란을 이용한다. 단기적 이득은 있지만 장기적 신뢰를 잃는다.' } } },
  ],
};

export function showContinentCrisisEvent(){
  const cid = S.character?.startContinent || 'central';
  const events = CONTINENT_CRISIS_EVENTS[cid] || [];
  if(!events.length) return;

  // 이미 발생한 이벤트 추적
  const fired = JSON.parse(lsGet('tf-continent-crisis-fired')||'[]');
  const available = events.filter(e=>!fired.includes(e.id));
  if(!available.length) return;

  // 가중치 기반 랜덤 선택
  const total = available.reduce((s,e)=>s+e.weight, 0);
  let r = Math.random()*total, chosen = available[0];
  for(const e of available){ r-=e.weight; if(r<=0){ chosen=e; break; } }

  const popup = document.createElement('div');
  popup.id = 'continent-crisis-popup';
  popup.style.cssText='position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center';
  const cont = FIVE_CONTINENTS[cid==='central'?'center':cid];
  popup.innerHTML=`
  <div style="width:90%;max-width:400px;background:#050200;border:2px solid ${cont?.color||'#c8a96e'};padding:0;font-family:'Cinzel',serif;animation:fadeIn .3s ease">
    <div style="padding:14px 16px;border-bottom:1px solid var(--border);background:${cont?.color||'#c8a96e'}22">
      <div style="display:flex;color:${cont?.color||'var(--gold)'};margin-bottom:4px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(chosen,{size:16}):(chosen.svgIcon||chosen.icon)}</div>
      <div style="font-size:13px;color:${cont?.color||'var(--gold)'};letter-spacing:1px">${chosen.title}</div>
      <div style="font-size:9px;color:var(--dim);margin-top:2px">${cont?.label||'대륙'} 긴급 소식</div>
    </div>
    <div style="padding:14px 16px">
      <div style="font-size:12px;color:var(--text);line-height:1.7;margin-bottom:14px">${chosen.desc}</div>
      ${chosen.choices.map((c,i)=>`
        <button onclick="handleContinentCrisis('${chosen.id}',${i})" style="
          width:100%;padding:10px;margin-bottom:6px;text-align:left;
          background:#0d0800;border:1px solid var(--border);color:var(--dim);
          font-family:'Crimson Text',serif;font-size:12px;cursor:pointer;
          transition:all .15s;border-radius:2px
        " onmouseover="this.style.borderColor='${cont?.color||'var(--gold)'}';this.style.color='${cont?.color||'var(--gold)'}'"
           onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--dim)'">
          ${['①','②','③'][i]} ${c}
        </button>
      `).join('')}
    </div>
  </div>`;
  document.body.appendChild(popup);

  // fired 목록에 추가
  fired.push(chosen.id);
  lsSet('tf-continent-crisis-fired', JSON.stringify(fired));
}
window.showContinentCrisisEvent = showContinentCrisisEvent;

window.showContinentCrisisEvent = showContinentCrisisEvent;

export function handleContinentCrisis(eventId, choiceIdx){
  document.getElementById('continent-crisis-popup')?.remove();
  const cid = S.character?.startContinent || 'central';
  const events = CONTINENT_CRISIS_EVENTS[cid]||[];
  const ev = events.find(e=>e.id===eventId);
  if(!ev) return;
  const outcome = ev.outcomes[choiceIdx];
  if(!outcome) return;

  if(outcome.repDelta && typeof updateContinentRep==='function'){
    updateContinentRep(cid, outcome.repDelta, ev.title+' — '+ev.choices[choiceIdx]);
  }
  if(outcome.goldDelta){
    S.gold = Math.max(0,(S.gold||0)+outcome.goldDelta);
    saveGold(S.gold); window.updateHeader();
  }
  if(outcome.hint){
    S._nextInjectedContext = (S._nextInjectedContext||'')+' [🌍 대륙 위기 선택: '+ev.title+' → '+ev.choices[choiceIdx]+'] '+outcome.hint;
  }
  toast(`${ev.title} — ${ev.choices[choiceIdx]}`, 3000, ev);
}
window.handleContinentCrisis = handleContinentCrisis;

window.handleContinentCrisis = handleContinentCrisis;

export function checkHomelandNpcReunion(aiText){
  try{
    const cid = S.character?.startContinent || 'central';
    const cont = FIVE_CONTINENTS[cid==='central'?'center':cid];
    if(!cont) return;
    const homelandNpcs = cont.kingdom?.npcs || [];
    if(!homelandNpcs.length) return;
    // 이미 발생한 재회 체크
    const reunions = JSON.parse(lsGet('tf-npc-reunions')||'[]');
    for(const kNpc of homelandNpcs){
      if(reunions.includes(kNpc.name)) continue;
      // 텍스트에서 NPC 이름 또는 역할 언급 감지
      if(aiText.includes(kNpc.name) || aiText.includes(kNpc.role)){
        reunions.push(kNpc.name);
        lsSet('tf-npc-reunions', JSON.stringify(reunions));
        S._nextInjectedContext = (S._nextInjectedContext||'')+
          ` [👥 고향 NPC 재회: ${kNpc.icon}${kNpc.name}(${kNpc.role})이 등장했다. 이 인물은 주인공의 고향 ${cont.label}의 핵심 인물로, 반가움과 고향에 대한 감정이 자연스럽게 교차한다. 관계가 더 깊어질 수 있는 대화를 유도하라.]`;
        toast(`${kNpc.name} — 고향의 얼굴이 낯선 땅에서 나타났다!`, 3500, kNpc);
        break;
      }
    }
  }catch(e){}
}
window.checkHomelandNpcReunion = checkHomelandNpcReunion;

window.checkHomelandNpcReunion = checkHomelandNpcReunion;

(function initContinentExtSystem(){
  // sendMsg 이후 처리 훅 등록 (3초 후 패치)
  setTimeout(()=>{
    // 날씨 적용 (첫 시작 시)
    if(S.character && typeof applyContinentWeather==='function') applyContinentWeather();

    // [참고] 금기 체크(checkContinentTaboo)는 quest/086의 sendMsg() 안에
    // 네이티브로 연결했다 — window.sendMsg 래핑은 sendMsg가 이 파일 밖에서
    // (그리고 자기 자신도 자기 모듈 안에서) 직접 호출돼 실제로는 한 번도
    // 실행된 적이 없었다.
    if(window._continentSendMsgPatched) return;
    window._continentSendMsgPatched = true;

    // buildLightSystem 패치 — 말투 힌트 + 문화 충격 주입
    const _origBLS = window.buildLightSystem;
    if(typeof _origBLS==='function' && !window._continentBLSPatched){
      window._continentBLSPatched = true;
      window.buildLightSystem = function(char, ...args){
        let result = _origBLS.apply(this, [char, ...args]);
        if(typeof result !== 'string') return result;
        try{
          const cid = char?.startContinent || 'central';
          const speechHint = CONTINENT_SPEECH_HINTS[cid];
          if(speechHint && !result.includes('[대륙 말투 힌트]')){
            result += `\n[🗣️ 대륙 말투 힌트] ${speechHint}`;
          }
          // 문화 충격 (현재 위치 대륙 vs 출신 대륙 — 현재는 장소명으로 감지)
          const curLoc = typeof loadCurrentLocation==='function' ? loadCurrentLocation() : null;
          if(curLoc?.continent && curLoc.continent !== cid){
            const shock = getCultureShockHint(cid, curLoc.continent);
            if(shock) result += `\n[🌍 문화 충격] ${shock}`;
          }
        }catch(e){}
        return result;
      };
    }

    // [참고] 고향 NPC 재회 감지(checkHomelandNpcReunion)는 quest/086의
    // sendMsg() 안에 네이티브로 연결했다 — window.renderMsgs 래핑은
    // sendMsg가 renderMsgs를 같은 파일에서 직접 호출해 실제로는 한 번도
    // 실행된 적이 없었다.

    // 위기 이벤트: 15턴마다 확률 발생
    const _origTickGameTime = window.tickGameTime;
    if(typeof _origTickGameTime==='function' && !window._continentTickPatched){
      window._continentTickPatched = true;
      window.tickGameTime = function(){
        const result = _origTickGameTime.apply(this, arguments);
        try{
          if(S.msgCount && S.msgCount % 15 === 0 && Math.random() < 0.45){
            setTimeout(()=>showContinentCrisisEvent(), 1500);
          }
        }catch(e){}
        return result;
      };
    }

  }, 3000);
})();

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_263(){
(function patchJobConditionForContinent(){
  if(window._continentJobCondPatched) return;
  window._continentJobCondPatched = true;
  const _orig = window.checkJobCondition;
  if(typeof _orig !== 'function') return;
  window.checkJobCondition = function(job){
    const result = _orig.apply(this, arguments);
    const cond = job.unlockCondition || {};
    if(cond.requiredContinent){
      const charContinent = S.character?.startContinent || 'central';
      // 출신 대륙 체크 + 해당 대륙 방문 기록 체크
      const visitedContinents = JSON.parse(lsGet('tf-visited-continents')||'[]');
      if(charContinent !== cond.requiredContinent && !visitedContinents.includes(cond.requiredContinent)){
        const contName = FIVE_CONTINENTS[cond.requiredContinent]?.label || cond.requiredContinent;
        result.failed.push(`${contName} 출신이거나 ${contName} 방문 필요`);
        result.met = false;
      }
    }
    return result;
  };
  // 대륙 전용 직업을 직업 풀에 추가
  setTimeout(()=>{
    try{
      Object.values(CONTINENT_EXCLUSIVE_JOBS).forEach(jobs=>{
        jobs.forEach(job=>{
          if(typeof addAIJob==='function') addAIJob(job);
          if(typeof discoverJob==='function' && job.requiredContinent === (S.character?.startContinent||'central')){
            discoverJob(job.id, '출신 대륙 전용 직업');
          }
        });
      });
    }catch(e){}
  }, 3000);
})();

(function patchEndingConditionsForContinent(){
  if(window._continentEndingPatched) return;
  window._continentEndingPatched = true;
  const _origCheck = window.checkEndingConditions;
  if(typeof _origCheck !== 'function') return;
  window.checkEndingConditions = function(){
    const result = _origCheck.apply(this, arguments);
    try{
      const rep = typeof loadContinentRep==='function' ? loadContinentRep() : {};
      const cid = S.character?.startContinent||'central';

      // 외교관 엔딩: 모든 대륙 평판 30 이상
      if(result){
        const allPositive = ['central','north','east','west','south'].every(id=>(rep[id]||0)>=30);
        if(allPositive){
          S._nextInjectedContext = (S._nextInjectedContext||'')+' [🌍 외교관 엔딩 조건 달성: 오대륙 모두에게 인정받은 전설의 외교관이 될 자격이 생겼다.]';
        }
      }
      // 대륙 수호자 엔딩: 출신 대륙 평판 80 이상
      if((rep[cid]||0)>=80){
        const cont = FIVE_CONTINENTS[cid==='central'?'center':cid];
        S._nextInjectedContext = (S._nextInjectedContext||'')+` [🏆 ${cont?.label||cid} 수호자 엔딩 조건 달성: 이 대륙의 전설적 수호자로 불릴 자격이 생겼다.]`;
      }
    }catch(e){}
    return result;
  };
})();
}

