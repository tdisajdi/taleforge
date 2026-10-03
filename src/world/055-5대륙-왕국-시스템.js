// 5대륙 왕국 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { AIDEN_PROFILE, ARCANUS_LOOP_PROFILE, ASMODEUS_PROFILE, BEELZEBUB_PROFILE, CABAL_OFFICERS, CELESTIAL_FACTIONS, CONTINENT_RULER_NPCS, FACTION_LEADER_NPCS, GABRIEL_PROFILE, INFERNAL_FACTIONS, JOB_MASTER_NPCS, LEONARD_PROFILE, LOOP_REMEMBERERS, MALAKAR_PROFILE, MICHAEL_PROFILE, MYTH_ORIGIN_REVELATION, NPC_TARIEL, PRIMORDIAL_CHAOS, RACE_RULER_NPCS, SEAL_GUARDIANS, SILARIEL_PROFILE, SILVER_PROFILE, SOCIAL_RANK_NPCS, WATCHER_IDENTITY, WORLD_HISTORY_FRAGMENTS, WORLD_LORE, WORLD_WILL_MANIFESTATION } from '../data/055-5대륙-왕국-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadNPCs } from '../misc/001-block0-preamble.js';
import { isLocLoreUnlocked, unlockLocationLore, loadWorldSecrets, recordWorldSecret } from '../misc/016-2130번-시스템.js';
import { loadFactionRep } from '../npc/067-③-NPC-관계망-시스템.js';
import { gainDwarfCraft } from '../progression/020-101130번-환생-누적-시스템.js';
import { loadElfMemory, saveElfMemory } from '../ui/025-통합-패널-공허-확장-탭-시스템.js';
import { esc, lsGet, lsSet, toast, toastHTML } from '../utils.js';
import { loadCurrentLocation } from './052-동대륙-추가-장소-4.js';
import { loadGSFlags } from './145-⑥-세계-상태-DB.js';

window.WORLD_LORE = WORLD_LORE;

window.PRIMORDIAL_CHAOS = PRIMORDIAL_CHAOS;

window.MYTH_ORIGIN_REVELATION = MYTH_ORIGIN_REVELATION;

window.WATCHER_IDENTITY = WATCHER_IDENTITY;

window.LOOP_REMEMBERERS = LOOP_REMEMBERERS;

window.SEAL_GUARDIANS = SEAL_GUARDIANS;

window.WORLD_HISTORY_FRAGMENTS = WORLD_HISTORY_FRAGMENTS;

export function detectHistoryFragment(aiText, userMsg){
  if(!aiText) return;
  const turn = S.msgCount||0;
  const lc = aiText.toLowerCase() + ' ' + (userMsg||'').toLowerCase();
  const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
  WORLD_HISTORY_FRAGMENTS.forEach(frag=>{
    if(isLocLoreUnlocked('hist_'+frag.id)) return; // 이미 발견
    // 트리거 키워드 매칭
    const trig = (frag.trigger||'').toLowerCase();
    const loc = loadCurrentLocation();
    const locId = loc?.id||'';
    // [버그 수정] 기존엔 장소 기반 트리거(trig.includes(locId))만 매칭되고,
    // "ch6 이후" 같은 챕터 기반 조건은 전혀 파싱되지 않아 해당 파편이
    // 영구히 발견 불가능한 죽은 데이터였다. hist_inf_001(신계 대전의
    // 진실 — 천계/마계가 최초의 혼돈에게 먹히고 있었다는 히든 루트 전용
    // 정보)이 정확히 이 경우였다. 챕터 기반 트리거를 실제로 지원하되,
    // 히든 루트 전용 진실이 표면 루트에 새지 않도록 명시적 게이트를 건다.
    if(frag.id === 'hist_inf_001'){
      if(gsF['mq21_done']){ // 히든 루트 21장(진실의 무게) 이후에만 발견 가능
        // [44번 라운드] unlockLocationLore()가 내부에서 이미 같은
        // 내용으로 recordWorldSecret()을 호출한다(키만 'lore_'+id로
        // 다름) — 여기서 또 호출하면 서로 다른 secretId로 중복
        // 레코드가 쌓이고, recordWorldSecret 자신의 토스트(🔍 정보
        // 파편 획득)가 unlockLocationLore의 새 본문 토스트를 곧바로
        // 덮어써버리는 버그가 있었다(발견·수정, 상세는 44번 섹션).
        unlockLocationLore('hist_'+frag.id, frag.title, frag.content, frag.trigger);
      }
      return;
    }
    // [버그 수정] hist_alt_003(왕도 방문 + INT 60+)과 hist_ws_002(실라리엘
    // 신뢰 90+)도 순수 장소 매칭 로직으로는 부가 조건을 확인할 수 없어
    // 발견이 불가능했다 — 각각의 실제 조건을 명시적으로 확인한다.
    if(frag.id === 'hist_alt_003'){
      const isCapital = locId === 'loc_capital' || (loc?.name||'').includes('왕도');
      const intStat = S?.stats?.int || 0;
      if(isCapital && intStat >= 60){
        unlockLocationLore('hist_'+frag.id, frag.title, frag.content, frag.trigger); // 중복 recordWorldSecret 제거(44번 섹션)
      }
      return;
    }
    if(frag.id === 'hist_ws_002'){
      const npcs = (typeof loadNPCs==='function') ? loadNPCs() : (S.npcs||[]);
      const silariel = npcs.find(n=>n.name==='실라리엘');
      const silarielTrust = silariel?.relationship || 0;
      if(silarielTrust >= 90){
        unlockLocationLore('hist_'+frag.id, frag.title, frag.content, frag.trigger); // 중복 recordWorldSecret 제거(44번 섹션)
      }
      return;
    }
    // 장소 기반 트리거
    if(trig.includes(locId) && locId){
      unlockLocationLore('hist_'+frag.id, frag.title, frag.content, frag.trigger); // 중복 recordWorldSecret 제거(44번 섹션)
    }
  });
}
window.detectHistoryFragment = detectHistoryFragment;

window.detectHistoryFragment = detectHistoryFragment;

// [46-③ 로컬 발견 시스템, 2026-09-30] LOOP_REMEMBERERS(4명)·SEAL_GUARDIANS
// (8명)는 window에 노출은 돼 있었지만 그걸 읽는 소비처가 코드 전체에
// 0곳이었다 — WORLD_LORE 등 다른 신화 데이터와 달리 AI 프롬프트 채널
// (religion/061)에도 안 닿는 완전히 죽은 데이터였다. 38번 섹션의
// tryLocalWdrDiscovery(정착지 도착 시 낮은 확률로 미발견 항목 1개를
// 직접 확정) 패턴을 그대로 재사용해, 기존 misc/016의 recordWorldSecret
// (저장+중복방지+토스트)만으로 새 저장소 없이 발견 가능하게 만든다.
const LOOP_REMEMBERER_CONTINENT = {
  rem_old_innkeeper: 'central',
  rem_east_sculptor: 'east',
  rem_south_child: 'south',
  rem_north_warrior: 'north',
};

export function isLoopRemembererDiscovered(id){
  return loadWorldSecrets().some(s=>s.secretId==='remember_'+id);
}
window.isLoopRemembererDiscovered = isLoopRemembererDiscovered;

export function revealLoopRememberer(rem){
  if(!rem || isLoopRemembererDiscovered(rem.id)) return false;
  recordWorldSecret('remember_'+rem.id, rem.name, rem.secretInfo, S.scenario?.id||'');
  S._nextInjectedContext = (S._nextInjectedContext||'') +
    ` [🔓 루프 기억자 발견: ${rem.name}] ${rem.secretInfo||''} — 이 인물이 루프를 은연중에 기억하고 있다는 인상을 서사에 자연스럽게 녹여라.`;
  toastHTML(`<div style="font-family:'Cinzel',serif;color:#ffd700;font-size:15px;margin-bottom:4px;">🔍 ${esc(rem.name)}</div>`+
    `<div style="font-size:13px;line-height:1.5;">${esc(rem.secretInfo||'')}</div>`+
    (rem.hint ? `<div style="font-size:11px;color:#999;margin-top:4px;">— ${esc(rem.hint)}</div>` : ''), 6000);
  return true;
}
window.revealLoopRememberer = revealLoopRememberer;

export function isSealGuardianDiscovered(sealId){
  return loadWorldSecrets().some(s=>s.secretId==='guardian_'+sealId);
}
window.isSealGuardianDiscovered = isSealGuardianDiscovered;

export function revealSealGuardian(seal){
  if(!seal || isSealGuardianDiscovered(seal.sealId)) return false;
  recordWorldSecret('guardian_'+seal.sealId, seal.guardianName, seal.guardianNote, S.scenario?.id||'');
  S._nextInjectedContext = (S._nextInjectedContext||'') +
    ` [🔓 봉인 수호자 발견: ${seal.guardianName}] ${seal.guardianNote||''} — 이 인물이 ${seal.sealName}을 지키고 있다는 사실을 서사에 자연스럽게 녹여라.`;
  toastHTML(`<div style="font-family:'Cinzel',serif;color:#ffd700;font-size:15px;margin-bottom:4px;">🔍 ${esc(seal.guardianName)}</div>`+
    `<div style="font-size:13px;line-height:1.5;">${esc(seal.guardianNote||'')}</div>`+
    `<div style="font-size:11px;color:#999;margin-top:4px;">— ${esc(seal.sealName)}</div>`, 6000);
  return true;
}
window.revealSealGuardian = revealSealGuardian;

export function tryLocalLoreDiscovery(loc){
  try{
    const continent = loc?.continent;
    if(!continent) return;
    if(Math.random() < 0.06){
      const rem = LOOP_REMEMBERERS.find(r => LOOP_REMEMBERER_CONTINENT[r.id]===continent && !isLoopRemembererDiscovered(r.id));
      if(rem) revealLoopRememberer(rem);
    }
    if(Math.random() < 0.06){
      // seal_northeast2/northwest2/southeast2는 존재하지 않는다(31번
      // 섹션에서 이미 결정된 대로, 신규 3개 왕국에 새 봉인석/수호자를
      // 지어내지 않음 — .find가 자연히 undefined를 반환해 no-op됨).
      const seal = SEAL_GUARDIANS.find(s => s.sealId === 'seal_'+continent && !isSealGuardianDiscovered(s.sealId));
      if(seal) revealSealGuardian(seal);
    }
  }catch(e){}
}
window.tryLocalLoreDiscovery = tryLocalLoreDiscovery;

window.CELESTIAL_FACTIONS = CELESTIAL_FACTIONS;

window.ASMODEUS_PROFILE = ASMODEUS_PROFILE;

window.CABAL_OFFICERS = CABAL_OFFICERS;

window.NPC_TARIEL = NPC_TARIEL;

window.SOCIAL_RANK_NPCS = SOCIAL_RANK_NPCS;

window.RACE_RULER_NPCS = RACE_RULER_NPCS;

window.FACTION_LEADER_NPCS = FACTION_LEADER_NPCS;

window.CONTINENT_RULER_NPCS = CONTINENT_RULER_NPCS;

window.JOB_MASTER_NPCS = JOB_MASTER_NPCS;

export function getJobMasterNpc(jobId){
  return (typeof JOB_MASTER_NPCS!=='undefined') ? JOB_MASTER_NPCS[jobId] : null;
}
window.getJobMasterNpc = getJobMasterNpc;

window.getJobMasterNpc = getJobMasterNpc;

export function getContinentRulerNpc(continentId){
  return (typeof CONTINENT_RULER_NPCS!=='undefined') ? CONTINENT_RULER_NPCS[continentId] : null;
}
window.getContinentRulerNpc = getContinentRulerNpc;

window.getContinentRulerNpc = getContinentRulerNpc;

export function getFactionLeaderNpc(factionName){
  return (typeof FACTION_LEADER_NPCS!=='undefined') ? FACTION_LEADER_NPCS[factionName] : null;
}
window.getFactionLeaderNpc = getFactionLeaderNpc;

window.getFactionLeaderNpc = getFactionLeaderNpc;

export function getRaceRulerNpc(raceId){
  return (typeof RACE_RULER_NPCS!=='undefined') ? RACE_RULER_NPCS[raceId] : null;
}
window.getRaceRulerNpc = getRaceRulerNpc;

window.getRaceRulerNpc = getRaceRulerNpc;

export function getSocialRankNpc(rankId){
  return (typeof SOCIAL_RANK_NPCS!=='undefined') ? SOCIAL_RANK_NPCS[rankId] : null;
}
window.getSocialRankNpc = getSocialRankNpc;

window.getSocialRankNpc = getSocialRankNpc;

export const NPC_STORY_STAGE_KEY = 'tf-npc-story-stage';

export function loadNpcStoryStages(){ try{ return JSON.parse(lsGet(NPC_STORY_STAGE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadNpcStoryStages = loadNpcStoryStages;

export function saveNpcStoryStages(d){ try{ lsSet(NPC_STORY_STAGE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNpcStoryStages = saveNpcStoryStages;

export function findWorldFigureById(npcId){
  try{
    const groups = [SOCIAL_RANK_NPCS, RACE_RULER_NPCS, FACTION_LEADER_NPCS, CONTINENT_RULER_NPCS, JOB_MASTER_NPCS];
    for(const g of groups){
      if(!g) continue;
      const found = Object.values(g).find(n => n?.id === npcId);
      if(found) return found;
    }
    return null;
  }catch(e){ return null; }
}
window.findWorldFigureById = findWorldFigureById;

window.findWorldFigureById = findWorldFigureById;

export function advanceNpcStoryStage(npcId){
  try{
    const stages = loadNpcStoryStages();
    // [34번 섹션, M4] 이미 완결된 서브플롯은 더 이상 진행시키지 않는다 —
    // 수동 버튼(npc/067의 renderWorldFigures)이 생기면서 AI 없이도 이
    // 함수가 여러 번 연달아 눌릴 수 있게 됐는데, 예전엔 questChain 길이를
    // 넘어서도 stages가 무한히 증가할 수 있어(표시만 Math.min으로 가렸을
    // 뿐) 오크/드워프/엘프 종족 보너스를 클릭할 때마다 무한히 파밍할 수
    // 있는 구멍이 될 뻔했다 — 완결(cur>=total) 시점에 더 늘지 않게 막아
    // 종족 보너스도 NPC당 총 questChain 단계 수만큼만(1회성) 받게 한다.
    const npcDef = findWorldFigureById(npcId);
    const totalStages = Array.isArray(npcDef?.questChain) ? npcDef.questChain.length : 0;
    if(totalStages > 0 && (stages[npcId]||0) >= totalStages){
      if(typeof toast==='function') toast(`📖 ${npcDef.name}의 이야기는 이미 마무리됐다.`, 2500);
      return stages[npcId];
    }
    stages[npcId] = (stages[npcId]||0) + 1;
    saveNpcStoryStages(stages);
    // [신규] 단계가 진행되는 순간 플레이어가 즉시 알 수 있도록 토스트로
    // 알린다 — 이전엔 localStorage 숫자만 조용히 바뀌어서 플레이어가
    // 전혀 인지할 방법이 없었다.
    const npc = npcDef;
    if(npc && typeof toast==='function'){
      const total = totalStages;
      const cur = Math.min(stages[npcId], total);
      if(cur >= total && total > 0){
        toast(`📖 ${npc.name}의 이야기가 마무리됐다.`, 3500);
      } else {
        toast(`📖 ${npc.name}와(과)의 이야기가 진전됐다. (${cur}/${total||'?'})`, 3000);
      }
    }
    // [4순위 보강] 종족 대표 NPC(셀레네스/토린/그롬 등)의 서브플롯과 종족
    // 전용 수치 시스템(엘프 망각/드워프 원한/오크 명예)이 지금까지 서로
    // 완전히 단절돼 있었다 — 같은 종족 플레이어가 그 종족 대표 NPC의
    // 서브플롯을 진전시키면, 종족 시스템에도 작은 의미 있는 반영이 가도록
    // 연결한다. 다른 종족 NPC(천계/마계/언데드 등)의 서브플롯은 영향 없음.
    try{
      const playerRace = (S.character?.race || '').toLowerCase();
      if(npcId === 'npc_race_orc' && /오크|orc/.test(playerRace) && typeof window.gainOrcHonor === 'function'){
        window.gainOrcHonor('tribe_protect', 6);
        toast(`🪓 그롬의 정치적 위기 — 같은 오크로서 명예가 함께 흔들리고, 함께 회복된다.`, 2800);
      }
      if(npcId === 'npc_race_dwarf' && /드워프|dwarf/.test(playerRace) && typeof gainDwarfCraft === 'function'){
        gainDwarfCraft('engrave', 5);
      }
      if(npcId === 'npc_race_elf' && /엘프|elf/.test(playerRace) && typeof saveElfMemory === 'function' && typeof loadElfMemory === 'function'){
        const em = loadElfMemory();
        em.points = Math.min(999, (em.points||0) + 8);
        saveElfMemory(em);
        toast(`🌳 셀레네스와 실라리엘의 800년 갈등 — 선조의 기억이 한 조각 더 또렷해진다.`, 2800);
      }
      // [47번 섹션 ⑤] 천계/마계 평판 파급 — 이 자리의 기존 주석이
      // "다른 종족 NPC(천계/마계/언데드 등)의 서브플롯은 영향 없음"
      // 이라고 스스로 밝혀뒀던 공백 중 천계/마계 두 개를 메운다(언데드는
      // 이번 승인 범위 밖). 방향은 종족 보너스(player race 일치)와
      // 반대 — 오필리아/바알제스는 특정 플레이어 종족이 아니라 세력
      // 평판(world/219)에 반응한다: 이미 그 세력과 우호 이상이면
      // NPC가 더 적극적으로 돕고(소액 보상), 적대면 거리를 둔다는
      // 안내만 뜬다. rep 값 자체는 이 경로에서 건드리지 않음(기존
      // progression/020 게이지·mq25 완료 훅이 이미 올리는 값을
      // 그대로 읽기만 함 — 이중 집계 없음).
      if(npcId === 'npc_race_celestial' && typeof getFactionStatus === 'function'){
        const st = getFactionStatus('celestial');
        if(st === '우호' || st === '동맹'){
          if(typeof window.addGoldWithExchange === 'function') window.addGoldWithExchange(20, '천계 평판 호의');
          else { S.gold = (S.gold||0) + 20; }
          toast(`✨ 천계와의 관계(${st}) — 오필리아가 호의로 작은 지원을 보낸다. 💰+20`, 2800);
        } else if(st === '적대'){
          toast(`✨ 천계의 경계심(평판: ${st}) 때문에 오필리아가 거리를 둔다.`, 2800);
        }
      }
      if(npcId === 'npc_race_demon' && typeof getFactionStatus === 'function'){
        const st = getFactionStatus('infernal');
        if(st === '우호' || st === '동맹'){
          if(typeof window.addGoldWithExchange === 'function') window.addGoldWithExchange(20, '마계 평판 호의');
          else { S.gold = (S.gold||0) + 20; }
          toast(`😈 마계와의 관계(${st}) — 바알제스가 호의로 작은 지원을 보낸다. 💰+20`, 2800);
        } else if(st === '적대'){
          toast(`😈 마계의 경계심(평판: ${st}) 때문에 바알제스가 거리를 둔다.`, 2800);
        }
      }
    }catch(e2){}
    return stages[npcId];
  }catch(e){ return 0; }
}
window.advanceNpcStoryStage = advanceNpcStoryStage;

window.advanceNpcStoryStage = advanceNpcStoryStage;

window.loadNpcStoryStages = loadNpcStoryStages;

export function formatNpcStoryContext(npc){
  if(!npc) return '';
  let out = '';
  if(npc.connections) out += ` [관계: ${npc.connections}]`;
  if(Array.isArray(npc.questChain) && npc.questChain.length){
    const stages = loadNpcStoryStages();
    const cur = Math.min(stages[npc.id]||0, npc.questChain.length-1);
    out += `\n  → 현재 서사 단계(${cur+1}/${npc.questChain.length}): ${npc.questChain[cur]}`;
  }
  return out;
}
window.formatNpcStoryContext = formatNpcStoryContext;

window.formatNpcStoryContext = formatNpcStoryContext;

export function getSocialRankNpcBLS(){
  try{
    const rankId = S?.character?.socialRankId || 'commoner';
    const npc = getSocialRankNpc(rankId);
    if(!npc) return '';
    let out = `\n[👤 같은 신분의 전형적 인물 — ${npc.name}] ${npc.title}. ${npc.aiHint||''}`;
    if(npc.questHook) out += ` (활용 가능: ${npc.questHook})`;
    out += formatNpcStoryContext(npc);
    // 왕/황제/왕자처럼 메인 스토리에 직결되는 핵심 신분이면, 그 존재
    // 자체를 항상 환기시켜 AI가 잊지 않게 한다 — 평소엔 등장 안 해도
    // "세계에 분명히 존재한다"는 사실을 계속 인지하게 만드는 목적.
    if(['king','emperor','prince'].includes(rankId) && npc.note){
      out += `\n참고: ${npc.note}`;
    }
    return out;
  }catch(e){ return ''; }
}
window.getSocialRankNpcBLS = getSocialRankNpcBLS;

window.getSocialRankNpcBLS = getSocialRankNpcBLS;

export function getWorldFigureBLS(){
  try{
    let out = '';
    // 캐릭터 본인의 종족에 대응하는 통치자 — 같은 종족 출신이면
    // 자연스럽게 알거나 얽혀있을 법한 인물이므로 항상 인지시킨다.
    const raceName = S?.character?.race || '';
    // [B42 FIX] 정식 종족명은 "세레스티얼"인데 오타("셀레스티얼")로 등록되어
    // includes() 매칭이 절대 성립하지 않아 세레스티얼 종족 통치자 정보가
    // 시스템 프롬프트에 전혀 주입되지 않던 버그.
    const RACE_NAME_TO_ID = { '엘프':'elf','드워프':'dwarf','오크':'orc','다크링':'darkling','세레스티얼':'celestial','데몬':'demon','언데드':'undead','수인':'beastman','원소인':'elemental','뱀파이어':'vampire' };
    const raceId = Object.entries(RACE_NAME_TO_ID).find(([kr]) => raceName.includes(kr))?.[1];
    if(raceId){
      const ruler = getRaceRulerNpc(raceId);
      if(ruler){
        out += `\n[👑 ${raceName} 종족 통치자 — ${ruler.name}] ${ruler.title}. ${ruler.aiHint||''}`;
        out += formatNpcStoryContext(ruler);
      }
    }
    // 현재 위치한 대륙의 정치적 통치자
    const continentId = S?.character?.startContinent || (typeof loadCurrentLocation==='function' ? loadCurrentLocation()?.continent : null);
    if(continentId){
      const cRuler = getContinentRulerNpc(continentId);
      if(cRuler){
        out += `\n[🗺️ 현재 대륙 통치자 — ${cRuler.name}] ${cRuler.title}. ${cRuler.aiHint||''}`;
        out += formatNpcStoryContext(cRuler);
      }
    }
    // 캐릭터의 현재 직업에 대응하는 마스터
    const jobId = S?.character?.jobId || S?.character?.job;
    if(jobId){
      const master = getJobMasterNpc(jobId);
      if(master && !master.note){ // note만 있는 경우(기존 인물 재사용)는 이미 다른 경로로 주입되므로 중복 방지
        out += `\n[🎓 ${master.title} — ${master.name}] ${master.aiHint||''}`;
        if(master.questHook) out += ` (활용 가능: ${master.questHook})`;
        out += formatNpcStoryContext(master);
      }
    }
    // [B43 FIX] getFactionLeaderNpc()는 헬퍼까지 만들어졌지만 이 통합 함수
    // 어디에서도 호출되지 않아 10개 세력 수장 NPC가 AI에게 사전 주입될
    // 경로가 없었다. 다른 3개(종족/대륙/직업)와 같은 패턴으로, 플레이어가
    // 가장 깊이 얽힌(평판 절댓값이 가장 큰) 세력의 수장을 주입한다.
    try{
      const rep = typeof loadFactionRep==='function' ? loadFactionRep() : {};
      const topFaction = Object.entries(rep).filter(([,v])=>Math.abs(v)>=10).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0]?.[0];
      if(topFaction){
        const leader = getFactionLeaderNpc(topFaction);
        if(leader){
          out += `\n[🏴 ${topFaction} 수장 — ${leader.name}] ${leader.title}. ${leader.aiHint||''}`;
          out += formatNpcStoryContext(leader);
        }
      }
    }catch(e){}
    return out;
  }catch(e){ return ''; }
}
window.getWorldFigureBLS = getWorldFigureBLS;

window.getWorldFigureBLS = getWorldFigureBLS;

window.AIDEN_PROFILE = AIDEN_PROFILE;

window.BEELZEBUB_PROFILE = BEELZEBUB_PROFILE;

window.MALAKAR_PROFILE = MALAKAR_PROFILE;

window.WORLD_WILL_MANIFESTATION = WORLD_WILL_MANIFESTATION;

window.LEONARD_PROFILE = LEONARD_PROFILE;

window.INFERNAL_FACTIONS = INFERNAL_FACTIONS;

window.ARCANUS_LOOP_PROFILE = ARCANUS_LOOP_PROFILE;

window.MICHAEL_PROFILE = MICHAEL_PROFILE;

window.GABRIEL_PROFILE = GABRIEL_PROFILE;

window.SILARIEL_PROFILE = SILARIEL_PROFILE;

window.SILVER_PROFILE = SILVER_PROFILE;
