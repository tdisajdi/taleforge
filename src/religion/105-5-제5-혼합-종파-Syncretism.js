// 5. 제5 혼합 종파 (Syncretism)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { RELIGION_NPCS } from '../data/117-4-종교-전용-NPC-풀.js';
import { loadReputation } from '../misc/054-이동수단-시스템.js';
import { getReligionTension } from '../misc/093-4-긴장도-계산.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadReligionState, saveReligionState } from '../world/091-2-저장소.js';
import { loadGSFlags, saveGSFlags } from '../world/145-⑥-세계-상태-DB.js';
import { changeReligionShare, getRegionReligionShare } from './092-3-지역-종교-점유율-조회수정.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';

export const SYNCRETISM_KEY = 'tf-syncretism';

export function loadSyncretism(){ try{ return JSON.parse(lsGet(SYNCRETISM_KEY)||'null'); }catch(e){ return null; } }
window.loadSyncretism = loadSyncretism;

export function saveSyncretism(d){ lsSet(SYNCRETISM_KEY, JSON.stringify(d)); }
window.saveSyncretism = saveSyncretism;

export function trySyncretism(region){
  const existing = loadSyncretism();
  if(existing){ toast('🌈 혼합 종파가 이미 존재합니다: '+existing.name, 2500); return; }

  const playerRel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  const share = getRegionReligionShare(region||'central');

  // 두 종교가 각 30% 이상 공존할 때 가능
  const eligible = Object.entries(share).filter(([k,v])=>v>=30&&RELIGIONS[k]);
  if(eligible.length < 2){
    toast('⚠️ 혼합 종파를 위해 두 종교가 각 30% 이상 필요합니다.', 2500);
    return;
  }

  const [relA, relB] = eligible.slice(0,2).map(([k])=>k);
  const rA = RELIGIONS[relA], rB = RELIGIONS[relB];

  const syncName = rA.name.slice(0,3)+'·'+rB.name.slice(0,3)+' 통합파';
  const sync = {
    id:'syncretism',
    name: syncName,
    icon:'🌈',
    color:'#c0c060',
    baseA: relA, baseB: relB,
    doctrine: `${rA.doctrine.slice(0,20)}... 그러나 ${rB.doctrine.slice(0,20)}...도 진실이다`,
    bornAt: S.msgCount||0,
    region: region||'central',
    members: 0,
  };
  saveSyncretism(sync);

  // 혼합 종파를 RELIGIONS에 동적 추가
  RELIGIONS['syncretism'] = {
    ...sync,
    greeting:'모든 신은 하나',
    evangelMethods:['논쟁토론','설교','기적'],
    jobTree:['oracle','sage','grand_shaman'],
    secret:'진리를 가장 가까이 본 자들의 모임. 루프의 존재를 직감하는 신관이 있다.',
    weaknesses:'두 기존 교단 모두에게 이단으로 배척받음.',
    npcReaction:'개방적 NPC에게 호감. 근본주의 성직자에게 적대적.',
  };

  toast(`🌈 ${syncName} 탄생! 제5 혼합 종파가 형성됐다.`, 4000);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('event', `혼합 종파 탄생: ${syncName}`, {icon:'🌈'});
  S._nextInjectedContext = (S._nextInjectedContext||'')
    +`\n[🌈 혼합 종파 탄생] ${syncName}이(가) ${region||'central'} 지역에서 형성됐다. `
    +'소수이지만 열정적인 신자들이 생겨났다. 이 역사적 순간을 서사화하라.';

  if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
}
window.trySyncretism = trySyncretism;

window.trySyncretism = trySyncretism;

export const COUNCIL_DEBATE_KEY = 'tf-council-debate-log';

export function loadCouncilDebateLog(){ try{ return JSON.parse(lsGet(COUNCIL_DEBATE_KEY)||'[]'); }catch(e){ return []; } }
window.loadCouncilDebateLog = loadCouncilDebateLog;

export function saveCouncilDebateLog(d){ lsSet(COUNCIL_DEBATE_KEY, JSON.stringify((d||[]).slice(-30))); }
window.saveCouncilDebateLog = saveCouncilDebateLog;

export function tryCouncilDebate(region){
  const playerRel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  if(!playerRel){ toast('⚠️ 소속 종교가 없습니다.', 2000); return; }
  const rep = (typeof loadReputation==='function' ? loadReputation() : {}).score || 0;
  if(rep < 50){ toast(`⚠️ 교리 대논쟁은 평판 50 이상 필요합니다. (현재 ${rep})`, 2500); return; }

  const share = getRegionReligionShare(region||'central');
  // 상대 종교 = 이 지역에서 플레이어 종교를 제외하고 가장 점유율 높은 종교
  const rival = Object.entries(share).filter(([k])=>k!==playerRel && RELIGIONS[k]).sort((a,b)=>b[1]-a[1])[0];
  if(!rival){ toast('⚠️ 이 지역에는 논쟁을 벌일 만한 경쟁 종교가 없습니다.', 2500); return; }
  const [rivalId] = rival;
  const rivalDef = RELIGIONS[rivalId];
  const rivalNpcs = RELIGION_NPCS[rivalId] || [];
  const opponent = rivalNpcs[0]; // 목록의 첫 NPC를 그 종교의 최고위로 취급

  // 판정: REP + fath/wil 평균 기준, 50%를 중심으로 조정
  const fathWil = ((S.stats?.fath||50) + (S.stats?.wil||50)) / 2;
  const successChance = Math.max(0.15, Math.min(0.85, 0.4 + (rep-50)/200 + (fathWil-50)/200));
  const success = Math.random() < successChance;
  const opponentName = opponent ? opponent.name : (rivalDef.name+' 대표 성직자');

  const log = loadCouncilDebateLog();
  log.push({ region, rivalId, opponentName, success, turn:S.msgCount||0 });
  saveCouncilDebateLog(log);

  if(success){
    changeReligionShare(region, { [playerRel]: 15, [rivalId]: -15 });
    if(typeof saveGSFlags==='function') saveGSFlags({ council_debate_won:true });
    toast(`🏆 ${opponentName}와의 교리 대논쟁에서 승리! ${rivalDef.name} 신도 15%를 흡수했습니다.`, 4500);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[⚖️ 교리 대논쟁 승리] 플레이어가 ${region} 지역에서 ${opponentName}(${rivalDef.name})와 공개 논쟁을 벌여 승리했다. `
      + `이 역사적인 논쟁 장면과 군중의 반응을 서사화하라. 논리와 신앙심으로 상대를 압도하는 모습을 그려라.`;
  } else {
    changeReligionShare(region, { [playerRel]: -5 });
    toast(`💥 ${opponentName}와의 교리 대논쟁에서 패배했습니다. 신뢰가 흔들립니다.`, 4500);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[⚖️ 교리 대논쟁 패배] 플레이어가 ${region} 지역에서 ${opponentName}(${rivalDef.name})와의 공개 논쟁에서 밀렸다. `
      + `군중 앞에서 논파당하는 씁쓸한 장면을 서사화하라.`;
  }
  if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
}
window.tryCouncilDebate = tryCouncilDebate;

window.tryCouncilDebate = tryCouncilDebate;

export function hasWorldThreatActive(){
  const flags = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
  return Object.keys(flags).some(k=>k.startsWith('seal_broken_') && flags[k]);
}
window.hasWorldThreatActive = hasWorldThreatActive;

window.hasWorldThreatActive = hasWorldThreatActive;

export function tryCommonFoeTruce(region){
  if(!hasWorldThreatActive()){
    toast('⚠️ 세계적 위협이 발생하지 않은 상태에서는 이 협상을 시작할 수 없습니다.', 3000);
    return;
  }
  const st = loadReligionState();
  const tension = getReligionTension(region);
  if(tension<=0){ toast('이 지역은 이미 평화롭습니다.', 2000); return; }

  st.tension = st.tension || {};
  st.tension[region] = 0;
  if(st.war && st.war.region===region) st.war = null;
  saveReligionState(st);
  if(typeof saveGSFlags==='function') saveGSFlags({ common_foe_truce_made:true });

  toast(`☮️ 공통의 위협 앞에서 ${region} 지역의 모든 종교가 임시 휴전에 합의했습니다.`, 4500);
  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `\n[☮️ 공통의 적 — 임시 휴전] 세계를 위협하는 재앙 앞에서, ${region} 지역의 서로 다른 종교 지도자들이 한자리에 모여 `
    + `임시 휴전에 합의했다. 오랜 적이었던 이들이 손을 맞잡는 역사적 순간을 무게감 있게 서사화하라. `
    + `이 휴전은 위협이 해소되면 다시 깨질 수 있는 불안정한 평화임을 암시해도 좋다.`;
  if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
}
window.tryCommonFoeTruce = tryCommonFoeTruce;

window.tryCommonFoeTruce = tryCommonFoeTruce;

export const MARRIAGE_ALLIANCE_KEY = 'tf-religion-marriage';

export function loadReligionMarriage(){ try{ return JSON.parse(lsGet(MARRIAGE_ALLIANCE_KEY)||'null'); }catch(e){ return null; } }
window.loadReligionMarriage = loadReligionMarriage;

export function saveReligionMarriage(d){ lsSet(MARRIAGE_ALLIANCE_KEY, JSON.stringify(d)); }
window.saveReligionMarriage = saveReligionMarriage;

export function getReligionFamilyNpc(religionId){
  const npcs = RELIGION_NPCS[religionId] || [];
  const familyNpc = npcs.find(n=>n.lore && (n.lore.includes('가문')||n.lore.includes('세습')||n.lore.includes('대째')));
  return familyNpc || npcs[0] || null;
}
window.getReligionFamilyNpc = getReligionFamilyNpc;

window.getReligionFamilyNpc = getReligionFamilyNpc;

export function tryMarriageAlliance(region){
  const playerRel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  if(!playerRel){ toast('⚠️ 소속 종교가 없습니다.', 2000); return; }
  const existing = loadReligionMarriage();
  if(existing){ toast('🔔 이미 혼인 동맹이 성사되어 있습니다: '+existing.name, 2500); return; }

  const share = getRegionReligionShare(region||'central');
  const rival = Object.entries(share).filter(([k])=>k!==playerRel && RELIGIONS[k]).sort((a,b)=>b[1]-a[1])[0];
  if(!rival){ toast('⚠️ 혼인 동맹을 맺을 만한 상대 종교가 없습니다.', 2500); return; }
  const [rivalId] = rival;
  const rivalDef = RELIGIONS[rivalId];
  const familyNpc = getReligionFamilyNpc(rivalId);
  if(!familyNpc){ toast('⚠️ 혼인 상대가 될 고위 성직자 가문을 찾을 수 없습니다.', 2500); return; }

  const allianceName = `${RELIGIONS[playerRel].name.slice(0,2)}·${rivalDef.name.slice(0,2)} 혼인가`;
  const marriage = {
    id:'marriage', name:allianceName, region:region||'central',
    baseA:playerRel, baseB:rivalId, spouseName:familyNpc.name, spouseIcon:familyNpc.icon,
    bornAt:S.msgCount||0, members:0, isAbyssTrap: rivalId==='abyss',
  };
  saveReligionMarriage(marriage);
  changeReligionShare(region, { [playerRel]:5, [rivalId]:5 });

  toast(`💍 ${familyNpc.name}와(과)의 혼인으로 ${allianceName}이(가) 성립됐습니다!`, 4500);
  if(typeof addTimelineEvent==='function') addTimelineEvent('event', `혼인 동맹: ${allianceName}`, {icon:'💍'});
  if(rivalId==='abyss'){
    // 심연의 계시 쪽 배우자는 실제로는 인간 형태를 한 마계 존재일 수 있다 —
    // 위험한 함정 요소를 서사에 반영한다.
    if(typeof saveGSFlags==='function') saveGSFlags({ religion_marriage_abyss:true });
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[💍⚠️ 위험한 혼인 동맹] 플레이어가 심연의 계시의 ${familyNpc.name}와(과) 혼인을 맺었다. `
      + `${familyNpc.secret||'이 인물에게는 숨겨진 위험한 비밀이 있다.'} `
      + `겉으로는 평범한 정략혼처럼 보이지만, 이 관계에는 서서히 드러날 위험이 도사리고 있다. `
      + `당장 정체를 폭로하지 말고, 앞으로의 서사에서 미묘한 이상 징후(밤에만 활동, 인간이 아닌 듯한 습관, `
      + `수상한 손님 등)를 점진적으로 흘려라. 플레이어가 눈치채고 추적하면 진실이 드러나는 흐름으로 이어질 수 있다.`;
    return;
  }
  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `\n[💍 혼인 동맹] 플레이어가 ${rivalDef.name}의 고위 성직자 가문인 ${familyNpc.name}(${familyNpc.role||''})와 혼인을 맺어 `
    + `${RELIGIONS[playerRel].name}과 ${rivalDef.name} 사이에 정식 동맹이 성립됐다. `
    + `이 혼인식과 두 종교 신자들의 엇갈린 반응(축복과 우려가 공존)을 서사화하라.`;
  if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
}
window.tryMarriageAlliance = tryMarriageAlliance;

window.tryMarriageAlliance = tryMarriageAlliance;

export function tryHeresyPact(region){
  const playerRel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  if(!playerRel){ toast('⚠️ 소속 종교가 없습니다.', 2000); return; }
  if(playerRel==='abyss'){ toast('⚠️ 심연의 계시 신자는 이 조약을 제안할 수 없습니다.', 2500); return; }
  const share = getRegionReligionShare(region||'central');
  if(!share.abyss || share.abyss<5){
    toast('⚠️ 이 지역에는 공동으로 견제할 만한 이단 세력(심연의 계시)이 충분하지 않습니다.', 3000);
    return;
  }
  const tension = getReligionTension(region);
  if(tension<=0){ toast('이 지역은 이미 평화롭습니다. 조약이 필요 없습니다.', 2000); return; }

  const st = loadReligionState();
  st.tension = st.tension || {};
  st.tension[region] = Math.max(0, tension-2);
  saveReligionState(st);
  changeReligionShare(region, { abyss: -8 });
  if(typeof saveGSFlags==='function') saveGSFlags({ heresy_pact_made:true });

  toast(`🕊️ 이단 분리 조약 체결! ${region} 지역의 긴장이 완화되고 심연의 계시 세력이 위축됩니다.`, 4500);
  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `\n[🕊️ 이단 분리 조약] 플레이어의 중재로 ${region} 지역의 정통 종교들이 심연의 계시를 공동의 이단으로 규정하고 `
    + `서로 간의 반목을 잠시 내려놓았다. 함께 이단을 몰아내는 합동 의식이나 선언 장면을 서사화하라.`;
  if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
}
window.tryHeresyPact = tryHeresyPact;

window.tryHeresyPact = tryHeresyPact;

export const TERRITORY_PACT_KEY = 'tf-religion-territory';

export function loadTerritoryPacts(){ try{ return JSON.parse(lsGet(TERRITORY_PACT_KEY)||'[]'); }catch(e){ return []; } }
window.loadTerritoryPacts = loadTerritoryPacts;

export function saveTerritoryPacts(d){ lsSet(TERRITORY_PACT_KEY, JSON.stringify(d)); }
window.saveTerritoryPacts = saveTerritoryPacts;

export function tryTerritoryPact(region){
  const playerRel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  if(!playerRel){ toast('⚠️ 소속 종교가 없습니다.', 2000); return; }
  const pacts = loadTerritoryPacts();
  if(pacts.some(p=>p.region===region)){ toast('이 지역은 이미 분할 협약이 체결되어 있습니다.', 2500); return; }

  const share = getRegionReligionShare(region||'central');
  const rival = Object.entries(share).filter(([k])=>k!==playerRel && RELIGIONS[k]).sort((a,b)=>b[1]-a[1])[0];
  if(!rival){ toast('⚠️ 영역을 분할할 상대 종교가 없습니다.', 2500); return; }
  const [rivalId] = rival;
  const rivalDef = RELIGIONS[rivalId];

  // 고난이도 판정 — neg(협상)/cha 평균, 성공률 낮게 설계
  const negCha = ((S.stats?.neg||S.stats?.cha||50) + (S.stats?.int||50)) / 2;
  const successChance = Math.max(0.1, Math.min(0.7, (negCha-50)/150 + 0.3));
  const success = Math.random() < successChance;

  if(success){
    pacts.push({ region, religionA:playerRel, religionB:rivalId, at:S.msgCount||0 });
    saveTerritoryPacts(pacts);
    const half = Math.round((share[playerRel]+share[rivalId])/2);
    changeReligionShare(region, { [playerRel]: half-(share[playerRel]||0), [rivalId]: half-(share[rivalId]||0) });
    if(typeof saveGSFlags==='function') saveGSFlags({ territory_pact_made:true });
    toast(`📜 ${region} 지역 성지 분할 협약 체결! ${RELIGIONS[playerRel].name}과 ${rivalDef.name}이 영역을 나눕니다.`, 4500);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[📜 성지 분할 협약 성공] 어려운 협상 끝에 ${region} 지역을 ${RELIGIONS[playerRel].name}과 ${rivalDef.name}이 `
      + `공식적으로 절반씩 나누기로 합의했다. 양측 대표가 조약에 서명하는 장면을 서사화하라.`;
  } else {
    toast(`❌ 성지 분할 협약 결렬. ${rivalDef.name} 측이 양보를 거부했습니다.`, 3500);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[📜 성지 분할 협약 실패] ${region} 지역의 영역 분할 협상이 결렬됐다. ${rivalDef.name} 측의 강경한 태도로 `
      + `협상 테이블이 뒤집히는 장면을 서사화하라.`;
  }
  if(typeof window.renderReligionPanel==='function') window.renderReligionPanel();
}
window.tryTerritoryPact = tryTerritoryPact;

window.tryTerritoryPact = tryTerritoryPact;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_86(){
const _origInitPeace = window.initiatePeaceRoute;

if(typeof _origInitPeace==='function'){
  window.initiatePeaceRoute = function(routeId, region){
    if(routeId==='syncretism'){ trySyncretism(region); return; }
    if(routeId==='council'){ tryCouncilDebate(region); return; }
    if(routeId==='common_foe'){ tryCommonFoeTruce(region); return; }
    if(routeId==='marriage'){ tryMarriageAlliance(region); return; }
    if(routeId==='heresy_pact'){ tryHeresyPact(region); return; }
    if(routeId==='territory'){ tryTerritoryPact(region); return; }
    _origInitPeace(routeId, region);
  };
}
}

