// block16-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadGold, saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { saveSkillSP } from '../job/002-스킬-시스템.js';
import { isAidenInParty } from '../npc/305-⑤-NPC-비밀-아젠다-이중성-시스템.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { grantTitle } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation, renderLocationPanel } from '../world/052-동대륙-추가-장소-4.js';
import { loadNPCs } from './001-block0-preamble.js';
import { addExp } from './009-레벨업-스탯-포인트-배분-시스템.js';
import { renderContractsPanel } from './251-통합-처리-함수-매-AI-응답-후-호출.js';
import { loadGuilds } from './253-SVG-타일-렌더링-작물-단계별-애니메이션.js';

(function(){

const GUILD_WORLD_KEY   = 'tf-guild-defs';     // 길드 자체는 정적 정의라 별도 세계 상태 불필요하지만 키 규칙 통일을 위해 보유
const GUILD_PLAYER_KEY   = 'tf-guild-player';   // 플레이어↔길드 관계 { [guildId]: {status,rank,rep,proficiency,joinedAt,repHistory[],completedQuests} }
const GUILD_HISTORY_KEY  = 'tf-guild-history';  // 길드 사건 로그 (무제한 누적)
const GUILD_BOARD_KEY    = 'tf-guild-board';    // 길드별 의뢰판 { [guildId]: {generatedTurn, quests:[...]} }

function loadGuildPlayer(){ try{ return JSON.parse(lsGet(GUILD_PLAYER_KEY)||'{}'); }catch(e){ return {}; } }
function saveGuildPlayer(d){ lsSet(GUILD_PLAYER_KEY, JSON.stringify(d)); }

function loadGuildHistory(){ try{ return JSON.parse(lsGet(GUILD_HISTORY_KEY)||'[]'); }catch(e){ return []; } }
function saveGuildHistory(d){ lsSet(GUILD_HISTORY_KEY, JSON.stringify(d)); }
function addGuildHistory(guildId, type, text){
  const h = loadGuildHistory();
  h.push({ guildId, type, text, turn: S.msgCount||0, savedAt: Date.now() });
  saveGuildHistory(h);
}

function loadGuildBoard(){ try{ return JSON.parse(lsGet(GUILD_BOARD_KEY)||'{}'); }catch(e){ return {}; } }
function saveGuildBoard(d){ lsSet(GUILD_BOARD_KEY, JSON.stringify(d)); }

// ══════════════════════════════════════════════════════════════════════════════
//  길드 정의 — 표준 4종. 시나리오마다 다른 "지부 이름"으로 부를 수 있지만
//  데이터 구조와 규칙은 전부 공유한다(가문 시스템에서 세력별 정의를 따로
//  둔 것과 달리, 길드는 직능 길드이므로 4종이면 모든 지역을 충분히 커버한다).
// ══════════════════════════════════════════════════════════════════════════════
const GUILD_DEFS = {
  adventurer: {
    id:'adventurer', icon:'⚔️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>', color:'#c8a040',
    name:'모험가 길드',
    domain:'토벌·탐험·호위 의뢰',
    desc:'몬스터 토벌부터 호위, 탐험까지 가리지 않는 만능 의뢰 중개소. 실력으로 직위가 오른다.',
    philosophy:'의뢰는 의뢰다. 받았으면 완수하고, 못 하겠으면 처음부터 받지 않는다.',
    npcTone:'직선적이고 현장 중심적. 등급장 앞에서 허세는 통하지 않는다.',
    joinReq:{ note:'누구나 가입 가능. 첫 의뢰 완수가 진짜 시험이다.', goldCost:0 },
    ranks:['견습','동','은','금','백금','마스터'],
    proficiencyPerRank:[0,30,80,180,350,600],
    statBonusPerRank:[{},{str:3,end:2},{str:5,end:4,agi:3},{str:8,end:6,agi:5},{str:12,end:10,agi:8,luk:4},{str:18,end:15,agi:12,luk:8}],
    titlePerRank:['','','am_guild_silver','am_guild_gold','',''],
    statKey:'contract_success_count',
    questTypes:['토벌','호위','탐험','수색','채집'],
    events:{
      join:'모험가 길드에 견습으로 등록됐다. 의뢰판에서 일을 받을 수 있다.',
      rank_up:'길드 등급이 올랐다. 더 위험하고 보상이 큰 의뢰에 도전할 수 있다.',
      rep_down:'길드 내 신뢰가 떨어졌다. 등급장이 의뢰 배정을 까다롭게 한다.',
      betray:'길드를 배신했다. 등급이 박탈되고 블랙리스트에 오른다.',
    },
  },
  bounty: {
    id:'bounty', icon:'🎯', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>', color:'#c06020',
    name:'현상금 사냥꾼 조합',
    domain:'수배자 추적·체포·제거',
    desc:'수배자를 쫓는 자들의 모임. 직업도 종족도 상관없다 — 표적만 잡아 오면 된다.',
    philosophy:'법이 닿지 않는 곳에서 우리가 일한다. 감사는 필요 없다. 보상이면 충분하다.',
    npcTone:'냉정하고 실용적. 표적 정보를 공유하고 서로 협력하지만 보상은 나눠가진다.',
    joinReq:{ note:'누구나 가입 가능. 가입비 50G. 첫 현상금 사냥 성공 시 정식 등록.', goldCost:50 },
    ranks:['신참 추적자','추적자','숙련 추적자','전문 추적자','전설의 추적자','그림자 법관'],
    proficiencyPerRank:[0,20,60,150,300,500],
    statBonusPerRank:[{},{per:4,agi:3},{per:7,agi:6,luk:3},{per:10,agi:9,luk:5,str:4},{per:14,agi:13,luk:8,str:7},{per:20,agi:18,luk:12,str:10}],
    titlePerRank:['','','','am_bounty_hunter','','am_shadow_judge'],
    statKey:'bounty_kills',
    questTypes:['수배자 추적','현상금 수령','증거 확보','증인 보호','실종자 수색'],
    events:{
      join:'현상금 사냥꾼 조합에 신참으로 등록됐다. 의뢰판에서 수배 정보를 열람할 수 있다.',
      rank_up:'조합 내 등급이 올랐다. 더 높은 현상금의 표적에 접근할 수 있다.',
      rep_down:'조합에서의 신뢰가 떨어졌다. 좋은 수배 정보가 먼저 다른 사냥꾼에게 간다.',
      betray:'조합을 배신했다. 이제 당신도 수배 대상이 될 수 있다.',
    },
  },
  merchant: {
    id:'merchant', icon:'🏦', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 L12 4 L21 9.5 Z" stroke-linejoin="round"/><path d="M4.5 9.5 L4.5 18.5 M8 9.5 L8 18.5 M12 9.5 L12 18.5 M16 9.5 L16 18.5 M19.5 9.5 L19.5 18.5" stroke-width="1.3"/><path d="M3 20.5 L21 20.5" stroke-width="1.6"/></svg>', color:'#c0a030',
    name:'상인 길드',
    domain:'교역·운송·투자 의뢰',
    desc:'대륙을 가로지르는 교역 네트워크를 관리한다. 신용이 곧 자본이다.',
    philosophy:'신용 없이는 거래도 없다. 한 번의 배신은 평생의 낙인이다.',
    npcTone:'예의 바르고 계산적. 숫자 이야기가 나오면 표정이 바뀐다.',
    joinReq:{ note:'가입비 100G. 첫 거래 성사 후 정식 등록.', goldCost:100 },
    ranks:['수습 상인','정식 상인','중개인','지부장','상단주','대상회 주'],
    proficiencyPerRank:[0,30,80,180,350,600],
    statBonusPerRank:[{},{cha:3,luk:2},{cha:6,luk:4,int:3},{cha:9,luk:7,int:5},{cha:13,luk:10,int:8},{cha:18,luk:14,int:12}],
    titlePerRank:['','','','','am_merchant_lord',''],
    statKey:'merchant_trades',
    questTypes:['운송','중개','투자','정보매매','경매대행'],
    events:{
      join:'상인 길드에 수습으로 등록됐다. 거래 의뢰를 받을 수 있다.',
      rank_up:'상단 내 직위가 올랐다. 더 큰 거래를 중개할 수 있다.',
      rep_down:'신용이 떨어졌다. 좋은 거래가 먼저 다른 상인에게 간다.',
      betray:'상인 길드를 배신했다. 어떤 지부에서도 거래를 거절당한다.',
    },
  },
  mage: {
    id:'mage', icon:'🔮', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>', color:'#8060d0',
    name:'마법사 협회',
    domain:'마법 연구·봉인·정화 의뢰',
    desc:'마법적 이상 현상을 조사하고 봉인하는 전문가 집단. 지식이 곧 권위다.',
    philosophy:'무지한 마법 사용은 재앙이다. 모든 것은 연구를 거쳐야 한다.',
    npcTone:'학구적이고 신중함. 검증되지 않은 이론에는 냉담하다.',
    joinReq:{ note:'기초 마법 이해 또는 협회 추천 필요(소프트 체크).', goldCost:0 },
    ranks:['견습 마법사','정식 마법사','연구원','상급 연구원','대마법사','협회장'],
    proficiencyPerRank:[0,30,80,180,350,600],
    statBonusPerRank:[{},{int:4,mgc:3},{int:7,mgc:6,wil:3},{int:10,mgc:9,wil:5},{int:14,mgc:13,wil:8},{int:20,mgc:18,wil:12}],
    titlePerRank:['','','','','am_archmage','am_council_head'],
    statKey:'spell_research_count',
    questTypes:['이상현상조사','마법재료수집','봉인보조','마법서번역','정화'],
    events:{
      join:'마법사 협회에 견습으로 등록됐다. 연구 의뢰를 받을 수 있다.',
      rank_up:'협회 내 직위가 올랐다. 더 깊은 마법 지식에 접근할 수 있다.',
      rep_down:'협회의 신뢰를 잃었다. 중요 연구에서 배제된다.',
      betray:'협회를 배신했다. 금지된 지식 유출자로 수배된다.',
    },
  },
  thieves: {
    id:'thieves', icon:'🗡️', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></svg>', color:'#605070',
    name:'도적 길드',
    domain:'정보·밀수·은밀한 의뢰',
    desc:'표면에 드러나지 않는 모든 일을 처리한다. 들키지 않는 것이 실력이다.',
    philosophy:'잡히는 건 죄가 아니다 — 잡히는 게 무능이다.',
    npcTone:'은밀하고 거래적. 신뢰가 쌓이기 전엔 본심을 드러내지 않는다.',
    joinReq:{ note:'초대 또는 은밀 의뢰 한 건을 먼저 성공시켜야 한다.', goldCost:0 },
    ranks:['풋내기','칼잡이','정보원','조직원','부두목','그림자 군주'],
    proficiencyPerRank:[0,30,80,180,350,600],
    statBonusPerRank:[{},{agi:3,per:2},{agi:6,per:5,luk:3},{agi:9,per:8,luk:5},{agi:13,per:12,luk:8,cal:4},{agi:18,per:16,luk:12,cal:8}],
    titlePerRank:['','','','am_info_broker','','am_shadow_lord'],
    statKey:'intel_gathered',
    questTypes:['정보수집','밀수','감시','절도','협박'],
    events:{
      join:'도적 길드에 발을 들였다. 어둠 속 의뢰판에 접근할 수 있다.',
      rank_up:'조직 내 위치가 올랐다. 더 위험하고 은밀한 일이 맡겨진다.',
      rep_down:'조직의 신뢰가 흔들린다. 뒤를 조심해야 한다.',
      betray:'조직을 배신했다. 어둠 속에서 항상 그림자를 조심해야 한다.',
    },
  },
};

window.GUILD_DEFS = GUILD_DEFS;

// ── 시나리오/지역의 다양한 길드 이름 → 표준 길드 ID 매핑 ──
// (왕도 모험가 길드, 북방 모험가 길드 등은 전부 같은 '모험가 길드' 시스템의
//  지부일 뿐이다. 무협/포스트아포칼립스의 특수 명칭은 매핑하지 않고 기존
//  방식(guildInteractLegacy)으로 남겨, 시나리오 고유 분위기를 깨지 않는다.)
const GUILD_NAME_MAP = {
  '모험가 길드':'adventurer', '모험가 길드 (대)':'adventurer', '북방 모험가 길드':'adventurer',
  '탐험가 협회':'adventurer', '왕도 모험가 길드':'adventurer', '방벽 수비대 길드':'adventurer',
  '선원 길드':'adventurer', '황금 탐험가 협회':'adventurer', '동방 모험가 협회':'adventurer',
  '동방 해상 길드':'adventurer',
  '상인 길드':'merchant', '공화국 상인 길드':'merchant', '수상 무역 길드':'merchant',
  '어둠 길드':'thieves',
};
window.GUILD_NAME_MAP = GUILD_NAME_MAP;

// ══════════════════════════════════════════════════════════════════════════════
//  플레이어 ↔ 길드 관계
// ══════════════════════════════════════════════════════════════════════════════
function getGuildPlayer(guildId){
  const d = loadGuildPlayer();
  return d[guildId] || { status:'none', rank:0, rep:0, proficiency:0, repHistory:[], joinedAt:null, completedQuests:0 };
}
function setGuildPlayer(guildId, patch){
  const d = loadGuildPlayer();
  if(!d[guildId]) d[guildId] = { status:'none', rank:0, rep:0, proficiency:0, repHistory:[], joinedAt:null, completedQuests:0 };
  Object.assign(d[guildId], patch);
  saveGuildPlayer(d);
}

function changeGuildRep(guildId, delta, reason){
  const gp = getGuildPlayer(guildId);
  const newRep = Math.max(-100, Math.min(100, (gp.rep||0) + delta));
  gp.rep = newRep;
  gp.repHistory = gp.repHistory||[];
  gp.repHistory.push({ turn:S.msgCount||0, delta, reason, total:newRep });
  setGuildPlayer(guildId, gp);
  addGuildHistory(guildId, 'rep_change', `${delta>0?'+':''}${delta} (${reason}) → ${newRep}`);

  if(gp.status === 'member' && newRep <= -50){
    const oldRank = gp.rank||0;
    setGuildPlayer(guildId, { status:'enemy', rank:0 });
    if(typeof applyGuildStatBonus==='function') applyGuildStatBonus(guildId, oldRank, 0);
    const def = GUILD_DEFS[guildId];
    toast(`❌ ${def?.name||guildId}에서 추방됐다!`, 3500);
    addGuildHistory(guildId, 'expelled', '평판 -50 이하로 강제 추방');
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[⚔️ 길드 추방] 플레이어가 ${def?.name||guildId}에서 강제 추방됐다. ${def?.events?.betray||''} 이 상황을 서사화하라.`;
  }
  if(typeof renderGuildPanel==='function') setTimeout(renderGuildPanel, 100);
}
window.changeGuildRep = changeGuildRep;

// 길드 등급별 스탯 보너스를 실제로 적용/회수한다. 이전에 적용됐던 보너스를
// 정확히 제거한 뒤 새 등급의 보너스를 더하는 방식이라, 승급·강등·탈퇴가
// 반복돼도 중복 누적되거나 꼬이지 않는다.
function applyGuildStatBonus(guildId, oldRank, newRank){
  const def = GUILD_DEFS[guildId];
  if(!def || !def.statBonusPerRank || !S.stats) return;
  const oldBonus = def.statBonusPerRank[oldRank] || {};
  const newBonus = def.statBonusPerRank[newRank] || {};
  Object.entries(oldBonus).forEach(([k,v])=>{ S.stats[k] = (S.stats[k]||0) - v; });
  Object.entries(newBonus).forEach(([k,v])=>{ S.stats[k] = (S.stats[k]||0) + v; });
  if(typeof saveStats==='function') saveStats(S.stats);
  if(typeof window.updateHeader==='function') window.updateHeader();
}
window.applyGuildStatBonus = applyGuildStatBonus;

// ── 도적 길드 전용 — 잠입 조사(NPC 뒷조사) ──
// 정보망 조직이라는 정체성을 실제 기능으로 만든다. 길드 등급이 높을수록
// 조사 성공률이 오르고, 발각 시 그 NPC와의 관계가 나빠진다.
function investigateNpc(npcName){
  const gp = (typeof getGuildPlayer==='function') ? getGuildPlayer('thieves') : null;
  if(!gp || gp.status !== 'member'){ toast('도적 길드에 가입해야 잠입 조사를 할 수 있습니다.'); return; }
  const npcs = (typeof loadNPCs==='function') ? loadNPCs() : (S.npcs||[]);
  const npc = npcs.find(n=>n.name===npcName);
  if(!npc){ toast('해당 인물을 찾을 수 없습니다.'); return; }
  if(npc.secretRevealed){ toast(`${npcName}에 대해 이미 알아낸 것이 있습니다.`); return; }

  const rank = gp.rank||0;
  const successChance = Math.min(0.9, 0.35 + rank*0.11);
  const success = Math.random() < successChance;

  if(success){
    toast(`🕵️ ${npcName}에 대한 뒷조사가 성과를 거뒀습니다.`, 3500);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[🕵️ 도적 길드 — 잠입 조사 성공] 플레이어가 도적 길드의 정보망을 통해 ${npcName}을(를) 은밀히 뒷조사했다. `
      + `이 인물의 숨겨진 사정(비밀, 약점, 과거, 진짜 의도 중 하나)을 서사 맥락에 맞게 자연스럽게 드러내라. `
      + `직접 대면 없이 정보원을 통해 알아낸 것이므로, 정보 그 자체를 서술로 전달하면 된다. `
      + `반드시 <gs>{"pm_npc":[{"name":"${npcName}","secret":"알아낸 비밀 요약"}]}</gs> 형식으로 출력하라.`;
    if(typeof gainGuildProficiency==='function') gainGuildProficiency('thieves', 8, '잠입 조사 성공');
  } else {
    const repHit = 5+Math.floor(Math.random()*8);
    toast(`⚠️ ${npcName} 뒷조사가 발각됐습니다. 관계가 나빠질 수 있습니다.`, 3500);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[⚠️ 도적 길드 — 잠입 조사 발각] 플레이어가 ${npcName}을(를) 뒷조사하려다 들켰다. `
      + `${npcName}이 이 사실을 알고 불쾌해하거나 경계하는 반응을 자연스럽게 묘사하라. `
      + `<gs>{"pm_npc":[{"name":"${npcName}","relation":"불신"}]}</gs> 출력.`;
    if(typeof changeGuildRep==='function') changeGuildRep('thieves', -3, '잠입 조사 발각');
  }
  renderContractsPanel&&renderContractsPanel();
}
window.investigateNpc = investigateNpc;

// ── 마법사 협회 전용 — 마법 연구 ──
// 등급이 오를수록 더 심화된 연구 주제에 접근할 수 있다. 연구는 즉시
// 완료되는 골드 소비형 행동으로, 성공하면 영구 스킬 포인트와 소량의
// 지력 계열 스탯을 얻는다. 이 활동 자체가 마법사 길드의 숙련도 재료
// (spell_research_count)가 되어, 다른 4개 길드와 마찬가지로
// "실제 활동 → 통계 축적 → 자동 승급" 구조를 그대로 따른다.
const MAGE_RESEARCH_TOPICS = [
  { id:'elemental_theory', name:'원소 이론', icon:'🔥', minRank:0, cost:60, successChance:0.75, statBonus:{int:1} },
  { id:'ward_construction', name:'결계 구축법', icon:'🛡️', minRank:1, cost:120, successChance:0.65, statBonus:{int:1,wil:1} },
  { id:'anomaly_analysis', name:'이상현상 분석', icon:'🌀', minRank:2, cost:200, successChance:0.55, statBonus:{int:2,mgc:1} },
  { id:'forbidden_lore', name:'금지된 지식', icon:'📜', minRank:3, cost:320, successChance:0.45, statBonus:{int:2,mgc:2} },
  { id:'true_name_theory', name:'진명 이론', icon:'✨', minRank:4, cost:500, successChance:0.35, statBonus:{int:3,mgc:2,wil:1} },
];
window.MAGE_RESEARCH_TOPICS = MAGE_RESEARCH_TOPICS;

function conductMageResearch(topicId){
  const gp = (typeof getGuildPlayer==='function') ? getGuildPlayer('mage') : null;
  if(!gp || gp.status !== 'member'){ toast('마법사 협회에 가입해야 연구를 진행할 수 있습니다.'); return; }
  const topic = MAGE_RESEARCH_TOPICS.find(t=>t.id===topicId);
  if(!topic){ toast('알 수 없는 연구 주제'); return; }
  if((gp.rank||0) < topic.minRank){ toast(`이 연구는 ${GUILD_DEFS.mage.ranks[topic.minRank]} 등급부터 가능합니다.`); return; }
  if((S.gold||0) < topic.cost){ toast(`연구 비용 부족 (${topic.cost}G 필요)`); return; }

  S.gold -= topic.cost; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
  const success = Math.random() < topic.successChance;

  if(success){
    Object.entries(topic.statBonus||{}).forEach(([k,v])=>{ if(S.stats) S.stats[k] = (S.stats[k]||0)+v; });
    if(typeof saveStats==='function') saveStats(S.stats);
    S.skillSP = (S.skillSP||0) + 1;
    if(typeof saveSkillSP==='function') saveSkillSP(S.skillSP);
    window.updateHeader&&window.updateHeader();
    toast(`${topic.name} 연구 성공! 영구 스탯 소량 획득 + 스킬 포인트 +1`, 3500, topic);
    if(typeof window.updateStats==='function') window.updateStats('spell_research_count', 1);
    if(typeof gainGuildProficiency==='function') gainGuildProficiency('mage', 12, `연구 성공: ${topic.name}`);
    S._pendingContractHint = `마법사 협회에서 "${topic.name}" 연구를 성공적으로 마쳤다. 새로운 마법적 통찰을 얻은 순간을 서사화할 수 있다.`;
  } else {
    toast(`${topic.name} 연구가 실패했습니다. 비용만 소모됨.`, 3000, topic);
    if(typeof window.updateStats==='function') window.updateStats('spell_research_count', 1);
    if(typeof gainGuildProficiency==='function') gainGuildProficiency('mage', 4, `연구 시도: ${topic.name}`);
  }
  renderContractsPanel&&renderContractsPanel();
}
window.conductMageResearch = conductMageResearch;

function gainGuildProficiency(guildId, amount, reason){
  const def = GUILD_DEFS[guildId];
  if(!def) return;
  const gp = getGuildPlayer(guildId);
  if(gp.status !== 'member') return;
  gp.proficiency = Math.min(9999, (gp.proficiency||0) + amount);

  // 숙련도 임계값 도달 시 자동 승진 (가문의 '수동 승진 시도'와 달리,
  // 길드는 실력 누적이 곧 직위이므로 자동으로 처리한다 — 의뢰 완수가
  // 곧 승진이라는 직능 길드 특성을 반영).
  const thresholds = def.proficiencyPerRank||[];
  const oldRank = gp.rank||0;
  let newRank = oldRank;
  for(let i=thresholds.length-1;i>=0;i--){
    if(gp.proficiency >= thresholds[i]){ newRank = i; break; }
  }
  if(newRank > oldRank){
    gp.rank = newRank;
    setGuildPlayer(guildId, gp);
    applyGuildStatBonus(guildId, oldRank, newRank);
    // 여러 등급을 한 번에 건너뛰어도 중간 칭호가 누락되지 않도록 순차 지급
    for(let r=oldRank+1; r<=newRank; r++){
      const titleId = def.titlePerRank && def.titlePerRank[r];
      if(titleId && typeof grantTitle==='function'){ try{ grantTitle(titleId); }catch(e){} }
    }
    const rankName = (def.ranks||[])[newRank]||'?';
    const bonusText = Object.entries(def.statBonusPerRank?.[newRank]||{}).map(([k,v])=>`${k.toUpperCase()}+${v}`).join(' ');
    toast(`⬆️ ${def.name} 승급! ${rankName}${bonusText?` (${bonusText})`:''}`, 3500);
    addGuildHistory(guildId, 'rank_up', `${rankName}로 승급 (숙련도 ${gp.proficiency})`);
    S._nextInjectedContext = (S._nextInjectedContext||'')
      + `\n[⬆️ 길드 승급] 플레이어가 ${def.name}에서 ${rankName} 직위로 승급했다. ${def.events?.rank_up||''} 이 장면을 서사화하라.`;
  } else {
    setGuildPlayer(guildId, gp);
  }
  addGuildHistory(guildId, 'proficiency', `+${amount} (${reason}) → ${gp.proficiency}`);
}
window.gainGuildProficiency = gainGuildProficiency;

// 현재 가입 중인 길드 목록(status==='member') 조회 — 다중 가입 제한에 사용
function getJoinedGuildIds(){
  return Object.keys(GUILD_DEFS).filter(gid=>getGuildPlayer(gid).status==='member');
}
window.getJoinedGuildIds = getJoinedGuildIds;

function joinGuild(guildId){
  const def = GUILD_DEFS[guildId];
  if(!def){ toast('알 수 없는 길드입니다.', 2000); return; }
  const gp = getGuildPlayer(guildId);
  if(gp.status === 'member'){ toast(`이미 ${def.name}의 일원입니다.`, 2000); return; }
  if(gp.status === 'enemy'){ toast(`${def.name}의 적으로 지목됐습니다. 가입 불가.`, 2500); return; }
  // 길드는 하나만 가입 가능 — 용병단/상단은 길드가 아니라 별도 운영 조직이라
  // 이 제한과 무관하게 얼마든지 동시에 운영할 수 있다.
  const joined = getJoinedGuildIds();
  if(joined.length > 0){
    const cur = GUILD_DEFS[joined[0]];
    toast(`⚠️ 이미 ${cur?.name||joined[0]}에 소속되어 있습니다. 길드는 동시에 하나만 가입할 수 있습니다.`, 3500);
    return;
  }

  setGuildPlayer(guildId, { status:'member', rank:0, proficiency:gp.proficiency||0, joinedAt:S.msgCount||0 });
  addGuildHistory(guildId, 'join', `${def.name} 가입`);
  toast(`⚔️ ${def.name}에 가입했습니다!`, 3000);
  if(typeof addTimelineEvent==='function') addTimelineEvent('guild', `${def.name} 가입`, { icon:def.icon });

  const aidenWith = (typeof isAidenInParty==='function') ? isAidenInParty() : false;
  const soloNote = aidenWith ? '' : `\n에이든 없이 단독으로 가입했다는 점이 길드 내에서 화제가 될 수 있다 — "동행 없이 혼자 등록하다니" 식의 반응이 자연스럽다.`;

  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `\n[⚔️ 길드 가입] 플레이어가 ${def.name}에 견습으로 등록됐다.`
    + `\n${def.events?.join||''}`
    + soloNote
    + `\n가입 후 길드 NPC들의 초기 반응을 묘사하라. 길드 분위기(${def.philosophy})를 반영할 것.`
    + `\nGS: {"guild_join":"${guildId}"} 출력.`;

  if(typeof renderGuildPanel==='function') setTimeout(renderGuildPanel, 100);
}
window.joinGuild = joinGuild;

function leaveGuild(guildId){
  const def = GUILD_DEFS[guildId];
  const gp  = getGuildPlayer(guildId);
  if(gp.status !== 'member'){ toast('가입된 길드가 아닙니다.', 2000); return; }
  const oldRank = gp.rank||0;
  setGuildPlayer(guildId, { status:'none', rank:0 });
  if(typeof applyGuildStatBonus==='function') applyGuildStatBonus(guildId, oldRank, 0);
  changeGuildRep(guildId, -10, '탈퇴');
  addGuildHistory(guildId, 'leave', `${def?.name||guildId} 탈퇴`);
  toast(`🚪 ${def?.name||guildId}에서 탈퇴했습니다.`, 2500);
  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `\n[🚪 길드 탈퇴] 플레이어가 ${def?.name||guildId}에서 탈퇴했다. 자연스럽게 묘사하라. GS: {"guild_leave":"${guildId}"} 출력.`;
  if(typeof renderGuildPanel==='function') setTimeout(renderGuildPanel, 100);
}
window.leaveGuild = leaveGuild;

// ══════════════════════════════════════════════════════════════════════════════
//  의뢰판 — 길드의 핵심 차별 요소. 가문에는 없는 "직접 수행하는 일거리" 개념.
// ══════════════════════════════════════════════════════════════════════════════
const QUEST_RANK_TABLE = [
  // [최소요구등급, 난이도라벨, 보상 골드 범위, 보상 경험치 범위, 숙련도 보상]
  { minRank:0, label:'하급', goldMin:20,  goldMax:60,  expMin:15,  expMax:40,  prof:8  },
  { minRank:1, label:'중급', goldMin:60,  goldMax:150, expMin:40,  expMax:90,  prof:18 },
  { minRank:2, label:'상급', goldMin:150, goldMax:350, expMin:90,  expMax:200, prof:35 },
  { minRank:3, label:'고급', goldMin:350, goldMax:700, expMin:200, expMax:400, prof:60 },
  { minRank:4, label:'특급', goldMin:700, goldMax:1500,expMin:400, expMax:800, prof:100 },
];

function generateGuildBoard(guildId){
  const def = GUILD_DEFS[guildId];
  if(!def) return [];
  const gp = getGuildPlayer(guildId);
  const playerRank = gp.rank||0;
  // 플레이어 현재 등급 기준 ±1 범위의 의뢰 3개를 생성 (너무 쉽거나 너무
  // 어려운 의뢰만 뜨지 않도록).
  const availableTiers = QUEST_RANK_TABLE.filter(t => t.minRank <= playerRank+1);
  const quests = [];
  for(let i=0;i<3;i++){
    const tier = availableTiers[Math.floor(Math.random()*availableTiers.length)] || QUEST_RANK_TABLE[0];
    const qType = def.questTypes[Math.floor(Math.random()*def.questTypes.length)];
    quests.push({
      id: `gq_${guildId}_${S.msgCount||0}_${i}`,
      type: qType,
      tierLabel: tier.label,
      gold: tier.goldMin + Math.floor(Math.random()*(tier.goldMax-tier.goldMin)),
      exp: tier.expMin + Math.floor(Math.random()*(tier.expMax-tier.expMin)),
      prof: tier.prof,
      claimed: false,
    });
  }
  return quests;
}

function ensureGuildBoard(guildId){
  const board = loadGuildBoard();
  const cur = board[guildId];
  // 20턴마다 또는 데이터가 없으면 갱신
  if(!cur || (S.msgCount||0) - (cur.generatedTurn||0) >= 20){
    board[guildId] = { generatedTurn:S.msgCount||0, quests:generateGuildBoard(guildId) };
    saveGuildBoard(board);
  }
  return board[guildId];
}
window.ensureGuildBoard = ensureGuildBoard;

function acceptGuildQuest(guildId, questId){
  const def = GUILD_DEFS[guildId];
  const gp = getGuildPlayer(guildId);
  if(gp.status !== 'member'){ toast('길드 가입 후 의뢰를 받을 수 있습니다.', 2000); return; }
  const board = loadGuildBoard();
  const entry = board[guildId];
  if(!entry) return;
  const q = entry.quests.find(x=>x.id===questId);
  if(!q || q.claimed) return;
  q.claimed = true;
  saveGuildBoard(board);

  S._nextInjectedContext = (S._nextInjectedContext||'')
    + `\n[📋 길드 의뢰 수주] 플레이어가 ${def.name}에서 "${q.tierLabel} ${q.type}" 의뢰를 받았다. 이 의뢰의 내용을 그 길드 성격(${def.domain})에 맞게 즉석에서 구체화해 서사로 풀어내라. 완수하면 GS: {"guild_quest_done":{"guild":"${guildId}","questId":"${q.id}"}} 출력. 실패하거나 포기하면 GS: {"guild_quest_fail":{"guild":"${guildId}","questId":"${q.id}"}} 출력.`;
  toast(`📋 의뢰 수주: ${q.tierLabel} ${q.type}`, 2500);
  if(typeof renderGuildPanel==='function') setTimeout(renderGuildPanel, 100);
}
window.acceptGuildQuest = acceptGuildQuest;

function completeGuildQuest(guildId, questId){
  const def = GUILD_DEFS[guildId];
  if(!def) return;
  const board = loadGuildBoard();
  const entry = board[guildId];
  const q = entry?.quests.find(x=>x.id===questId);
  if(!q) return;

  const gold = q.gold||0, exp = q.exp||0, prof = q.prof||0;
  if(typeof saveGold==='function' && typeof loadGold==='function'){
    const next = loadGold() + gold;
    saveGold(next); S.gold = next;
  }
  if(exp && typeof addExp==='function') addExp(exp);
  gainGuildProficiency(guildId, prof, `의뢰 완수(${q.tierLabel} ${q.type})`);
  changeGuildRep(guildId, 5, '의뢰 완수');

  const gp = getGuildPlayer(guildId);
  gp.completedQuests = (gp.completedQuests||0) + 1;
  setGuildPlayer(guildId, gp);
  addGuildHistory(guildId, 'quest_done', `${q.tierLabel} ${q.type} 완수 (+${gold}G, +${exp}EXP, +${prof}숙련도)`);

  // 보드에서 제거하고 새 의뢰로 교체
  entry.quests = entry.quests.filter(x=>x.id!==questId);
  entry.quests.push(...generateGuildBoard(guildId).slice(0,1));
  saveGuildBoard(board);

  if(typeof window.updateHeader==='function') window.updateHeader();
  toast(`✅ 의뢰 완수! 💰+${gold} ⭐+${exp} 🔧+${prof}숙련도`, 3000);
  if(typeof renderGuildPanel==='function') setTimeout(renderGuildPanel, 100);
}
window.completeGuildQuest = completeGuildQuest;

function failGuildQuest(guildId, questId){
  const board = loadGuildBoard();
  const entry = board[guildId];
  if(!entry) return;
  entry.quests = entry.quests.filter(x=>x.id!==questId);
  entry.quests.push(...generateGuildBoard(guildId).slice(0,1));
  saveGuildBoard(board);
  changeGuildRep(guildId, -3, '의뢰 실패/포기');
  addGuildHistory(guildId, 'quest_fail', `의뢰 실패/포기`);
  toast(`⚠️ 의뢰 실패 — 평판 -3`, 2500);
  if(typeof renderGuildPanel==='function') setTimeout(renderGuildPanel, 100);
}
window.failGuildQuest = failGuildQuest;

// ══════════════════════════════════════════════════════════════════════════════
//  GS 처리 — guild_join / guild_leave / guild_quest_done / guild_quest_fail / guild_rep_delta
// ══════════════════════════════════════════════════════════════════════════════
(function hookGuildGS(){
  setTimeout(()=>{
    const orig = window.processGSToAllDBs;
    if(typeof orig==='function' && !orig._guildGSHooked){
      window.processGSToAllDBs = function(gs){
        const result = orig.apply(this, arguments);
        try{
          if(gs.guild_join)  joinGuild(gs.guild_join);
          if(gs.guild_leave) leaveGuild(gs.guild_leave);
          if(gs.guild_quest_done){
            const d = gs.guild_quest_done;
            if(d.guild && d.questId) completeGuildQuest(d.guild, d.questId);
          }
          if(gs.guild_quest_fail){
            const d = gs.guild_quest_fail;
            if(d.guild && d.questId) failGuildQuest(d.guild, d.questId);
          }
          if(gs.guild_rep_delta){
            const d = gs.guild_rep_delta;
            const id = d.guild||d.id;
            if(id) changeGuildRep(id, d.delta||0, d.reason||'AI 이벤트');
          }
        }catch(e){}
        return result;
      };
      window.processGSToAllDBs._guildGSHooked = true;
    }
  }, 2000);
})();

// ══════════════════════════════════════════════════════════════════════════════
//  BLS — 길드 현황 AI 주입
// ══════════════════════════════════════════════════════════════════════════════
function getGuildBLS(){
  const gpAll = loadGuildPlayer();
  const lines = [];

  const memberGuilds = Object.entries(gpAll)
    .filter(([,v])=>v.status==='member')
    .map(([id,v])=>({id, ...v}));

  if(memberGuilds.length){
    lines.push('[⚔️ 소속 길드]');
    memberGuilds.forEach(mg=>{
      const def = GUILD_DEFS[mg.id];
      const ranks = def?.ranks||[];
      lines.push(`• ${def?.icon||''} ${def?.name||mg.id} — ${ranks[mg.rank]||'견습'} (숙련도 ${mg.proficiency||0} / 평판 ${mg.rep||0} / 완수 의뢰 ${mg.completedQuests||0}건)`);
      const board = ensureGuildBoard(mg.id);
      const openQ = (board.quests||[]).filter(q=>!q.claimed);
      if(openQ.length) lines.push(`  → 의뢰판: ${openQ.map(q=>`${q.tierLabel} ${q.type}(${q.gold}G)`).join(', ')}`);
    });
    lines.push('GS 가이드:');
    lines.push('• 의뢰 완수 → {"guild_quest_done":{"guild":"ID","questId":"의뢰ID"}}');
    lines.push('• 의뢰 실패/포기 → {"guild_quest_fail":{"guild":"ID","questId":"의뢰ID"}}');
    lines.push('• 길드 평판 변화(의뢰 외 사건) → {"guild_rep_delta":{"guild":"ID","delta":-10,"reason":"사유"}}');
    lines.push('• 길드 가입 제안 → {"guild_join":"ID"}');
  }

  const enemyGuilds = Object.entries(gpAll).filter(([,v])=>v.status==='enemy').map(([id])=>GUILD_DEFS[id]?.name||id);
  if(enemyGuilds.length) lines.push(`[⚠️ 적대 길드] ${enemyGuilds.join(' / ')}`);

  return lines.length ? '\n\n' + lines.join('\n') : '';
}
window.getGuildBLS = getGuildBLS;

(function hookGuildToBLS(){
  setTimeout(()=>{
    const fn = typeof window.buildLightSystem==='function'?'buildLightSystem'
             : typeof window.buildSystemPrompt==='function'?'buildSystemPrompt'
             : typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn) return;
    const orig = window[fn];
    if(typeof orig==='function' && !orig._guildBLSHooked){
      window[fn] = function(){
        const r = orig.apply(this, arguments);
        try{ const b=getGuildBLS(); return b&&typeof r==='string'?r+b:r; }catch(e){ return r; }
      };
      window[fn]._guildBLSHooked = true;
    }
  }, 4600);
})();

// ══════════════════════════════════════════════════════════════════════════════
//  기존 더미 guildInteract 교체.
//  [구조 확인] 'actions' 객체는 doInteraction() 함수 내부의 로컬 변수라
//  외부에서 window.ACTIONS처럼 직접 접근/덮어쓰기가 불가능하다. 대신
//  doInteraction() 자체를 감싸서 action==='guildInteract'일 때만 가로채고,
//  나머지는 그대로 원본에 위임한다.
// ══════════════════════════════════════════════════════════════════════════════
function guildInteractLegacy(){
  const gold=Math.floor(Math.random()*80)+40; if(typeof addGoldWithExchange==='function') addGoldWithExchange(gold, '길드 의뢰 완료'); else { S.gold+=gold; if(typeof saveGold==='function') saveGold(S.gold); } if(typeof window.updateHeader==='function') window.updateHeader();
  toast(`⚔️ 길드 의뢰 완료! 골드+${gold}`, 2500);
}
window.guildInteractLegacy = guildInteractLegacy;

(function hookGuildInteractReplace(){
  setTimeout(()=>{
    const orig = window.doInteraction;
    if(typeof orig!=='function' || orig._guildInteractHooked) return;
    window.doInteraction = function(action, cost, transportType){
      if(action === 'guildInteract'){
        try{
          const loc = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
          const interactions = loc?.interactions||loc?.locationInteractions||[];
          const guildSpot = Array.isArray(interactions) ? interactions.find(i=>i.id==='int_guild') : null;
          const mappedId = guildSpot ? GUILD_NAME_MAP[guildSpot.name] : null;
          if(mappedId && GUILD_DEFS[mappedId]){
            if(cost>0 && S.gold>=cost){ S.gold-=cost; if(typeof saveGold==='function') saveGold(S.gold); if(typeof window.updateHeader==='function') window.updateHeader(); }
            if(typeof window.openP==='function') window.openP('guild');
            if(typeof renderGuildPanel==='function') setTimeout(()=>renderGuildPanel(mappedId), 50);
            if(typeof renderLocationPanel==='function') renderLocationPanel();
            return;
          }
        }catch(e){}
        // 매핑 안 되는 시나리오 전용 길드(무협 맹주회, 생존자 협의회 등)는
        // 기존 동작 그대로 유지.
        guildInteractLegacy();
        if(typeof renderLocationPanel==='function') renderLocationPanel();
        return;
      }
      return orig.apply(this, arguments);
    };
    window.doInteraction._guildInteractHooked = true;
  }, 4800);
})();

// ══════════════════════════════════════════════════════════════════════════════
//  UI 패널
// ══════════════════════════════════════════════════════════════════════════════
function renderGuildPanel(focusGuildId){
  if(!document.getElementById('pb-guild')){
    const el = document.createElement('div');
    el.className='panel-ov'; el.id='p-guild';
    el.innerHTML=`<div class="panel"><div class="p-head"><span class="p-title">⚔️ 길드</span><button class="p-close" onclick="closeP('guild')">✕</button></div><div class="p-body scrollable" id="pb-guild"></div></div>`;
    document.body.appendChild(el);
  }
  const body = document.getElementById('pb-guild');
  if(!body) return;

  const gpAll = loadGuildPlayer();
  const order = ['adventurer','bounty','merchant','mage','thieves'];
  const sorted = order.map(id=>GUILD_DEFS[id]).filter(Boolean).sort((a,b)=>{
    const am = gpAll[a.id]?.status==='member' ? -1:0;
    const bm = gpAll[b.id]?.status==='member' ? -1:0;
    return am-bm;
  });

  body.innerHTML = `<div style="padding:10px 14px">
    <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:4px">⚔️ 길드</div>
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">가입·의뢰 수주·숙련도 — 실력으로 직위가 오릅니다. 길드는 동시에 하나만 가입할 수 있습니다.</div>

    ${sorted.map(def=>{
      const state = gpAll[def.id] || {status:'none', rank:0, rep:0, proficiency:0, completedQuests:0};
      const isMember = state.status==='member';
      const gc = def.color;
      const ranks = def.ranks||[];
      const rankName = ranks[state.rank||0]||'—';
      const nextThreshold = (def.proficiencyPerRank||[])[(state.rank||0)+1];
      const repColor = (state.rep||0)>=30?'#60c060':(state.rep||0)>=-30?'#c8a96e':'#e05050';
      const board = isMember ? ensureGuildBoard(def.id) : null;
      const openQuests = board ? board.quests.filter(q=>!q.claimed) : [];
      const claimedQuests = board ? board.quests.filter(q=>q.claimed) : [];

      return `
        <div id="guild-card-${def.id}" style="padding:10px 12px;background:#080600;border:1px solid ${isMember?gc+'88':'#1a1400'};margin-bottom:8px;${isMember?'border-left:3px solid '+gc+';':''}${focusGuildId===def.id?'box-shadow:0 0 0 1px '+gc+';':''}">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="color:${gc};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:16}):(def.svgIcon||def.icon)}</span>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-family:Cinzel,serif;font-size:11px;color:${gc}">${def.name}</span>
                ${isMember?`<span style="font-size:8px;color:#60c060">● ${rankName}</span>`:''}
              </div>
              <div style="font-size:8px;color:var(--dim)">${def.domain}</div>
            </div>
            ${isMember?`<div style="font-size:9px;color:${repColor};text-align:right">평판 ${state.rep||0}</div>`:''}
          </div>
          <div style="font-size:9px;color:#8a7a5a;margin-bottom:6px;line-height:1.5">${def.desc}</div>

          ${isMember?`
            <!-- 숙련도 바 -->
            <div style="margin-bottom:6px">
              <div style="display:flex;justify-content:space-between;font-size:7px;color:var(--dim);margin-bottom:2px">
                <span>숙련도 ${state.proficiency||0}${nextThreshold!==undefined?` / 다음 직위 ${nextThreshold}`:' (최고 직위)'}</span>
                <span>완수 ${state.completedQuests||0}건</span>
              </div>
              <div style="height:4px;background:#1a1200;border-radius:2px;overflow:hidden">
                <div style="height:100%;width:${nextThreshold?Math.min(100,(state.proficiency||0)/nextThreshold*100):100}%;background:${gc};border-radius:2px"></div>
              </div>
            </div>

            <!-- 의뢰판 -->
            <div style="margin-top:8px">
              <div style="font-size:9px;color:${gc};margin-bottom:4px;font-family:Cinzel,serif">📋 의뢰판</div>
              ${openQuests.length?openQuests.map(q=>`
                <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 7px;background:#050300;border:1px solid #1a1400;border-radius:2px;margin-bottom:4px">
                  <div style="font-size:9px;color:#c0a070">${q.tierLabel} ${q.type} <span style="color:#5a4a30">— 💰${q.gold} ⭐${q.exp} 🔧${q.prof}</span></div>
                  <button onclick="acceptGuildQuest('${def.id}','${q.id}')" style="padding:2px 8px;background:#0a0800;border:1px solid ${gc}55;color:${gc};font-size:8px;cursor:pointer">수주</button>
                </div>
              `).join(''):'<div style="font-size:8px;color:var(--dim)">현재 받을 수 있는 의뢰가 없습니다.</div>'}
              ${claimedQuests.length?`
                <div style="font-size:8px;color:#5a8a60;margin-top:4px">진행 중: ${claimedQuests.map(q=>`${q.tierLabel} ${q.type}`).join(', ')}</div>
              `:''}
            </div>

            ${def.id==='mage' ? `
            <!-- 마법사 협회 전용: 마법 연구 -->
            <div style="margin-top:8px">
              <div style="font-size:9px;color:${gc};margin-bottom:4px;font-family:Cinzel,serif">🔮 마법 연구</div>
              ${MAGE_RESEARCH_TOPICS.filter(t=>t.minRank<=(state.rank||0)).map(t=>`
                <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 7px;background:#050300;border:1px solid #1a1400;border-radius:2px;margin-bottom:4px">
                  <div style="font-size:9px;color:#c0a070">${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:9}):(t.icon)} ${t.name} <span style="color:#5a4a30">— ${t.cost}G, 성공률 ${Math.round(t.successChance*100)}%</span></div>
                  <button onclick="conductMageResearch('${t.id}')" style="padding:2px 8px;background:#0a0800;border:1px solid ${gc}55;color:${gc};font-size:8px;cursor:pointer">연구</button>
                </div>
              `).join('') || '<div style="font-size:8px;color:var(--dim)">등급을 올리면 더 깊은 연구 주제가 열립니다.</div>'}
            </div>
            ` : ''}

            ${def.id==='thieves' ? `
            <!-- 도적 길드 전용: 잠입 조사 -->
            <div style="margin-top:8px">
              <div style="font-size:9px;color:${gc};margin-bottom:4px;font-family:Cinzel,serif">🕵️ 잠입 조사</div>
              <div style="font-size:8px;color:var(--dim);margin-bottom:5px">만난 인물을 뒷조사해 숨겨진 비밀을 캘 수 있습니다.</div>
              <select id="investigate-target-select" style="width:100%;padding:4px;background:#050300;border:1px solid #1a1400;color:#c0a070;font-size:8px;margin-bottom:4px">
                <option value="">인물 선택...</option>
                ${(S.npcs||[]).filter(n=>n.active!==false && !n.secretRevealed).map(n=>`<option value="${esc(n.name)}">${esc(n.name)}</option>`).join('')}
              </select>
              <button onclick="const sel=document.getElementById('investigate-target-select'); if(sel&&sel.value) investigateNpc(sel.value); else toast('인물을 선택하세요.')" style="width:100%;padding:4px;background:#0a0800;border:1px solid ${gc}55;color:${gc};font-size:8px;cursor:pointer">조사 실행</button>
            </div>
            ` : ''}

            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">
              <button onclick="leaveGuild('${def.id}')" style="padding:3px 8px;background:#1a0800;border:1px solid #3a1a00;color:#a08060;font-size:8px;cursor:pointer">탈퇴</button>
            </div>
          `:state.status==='enemy'?`
            <div style="font-size:9px;color:#e05050;margin-top:4px">⚠️ 적대 상태 — 가입 불가</div>
          `:(function(){
            const joinedElsewhere = gpAll && Object.keys(GUILD_DEFS).some(gid=>gid!==def.id && gpAll[gid]?.status==='member');
            if(joinedElsewhere){
              const otherId = Object.keys(GUILD_DEFS).find(gid=>gid!==def.id && gpAll[gid]?.status==='member');
              const otherName = GUILD_DEFS[otherId]?.name||otherId;
              return `<div style="font-size:8px;color:var(--dim);margin-top:4px">이미 ${otherName}에 소속되어 있어 가입할 수 없습니다. (길드는 동시에 하나만 가능)</div>`;
            }
            return `
            <details style="margin-top:4px">
              <summary style="font-size:8px;color:var(--dim);cursor:pointer;user-select:none">가입 조건 보기</summary>
              <div style="font-size:8px;color:#8a7a5a;margin-top:4px;padding:6px;background:#050300;border-radius:2px;line-height:1.6">
                ${def.joinReq?.note||'조건 없음'}
              </div>
            </details>
            <button onclick="joinGuild('${def.id}')" style="margin-top:6px;padding:4px 10px;background:#0a0800;border:1px solid ${gc}44;color:${gc};font-size:9px;cursor:pointer">
              ${def.icon} 가입 시도
            </button>
          `;
          })()}

          <details style="margin-top:6px">
            <summary style="font-size:8px;color:#4a3a2a;cursor:pointer;user-select:none">상세 정보 ▾</summary>
            <div style="margin-top:5px;font-size:8px;color:#6a5a4a;line-height:1.6">
              <div style="margin-bottom:3px">💭 <b>철학:</b> "${def.philosophy}"</div>
              <div style="margin-bottom:3px">🗣️ <b>분위기:</b> ${def.npcTone}</div>
              <div style="margin-bottom:3px">📜 <b>직위 단계:</b> ${(def.ranks||[]).join(' → ')}</div>
            </div>
          </details>
        </div>`;
    }).join('')}
  </div>`;
}
window.renderGuildPanel = renderGuildPanel;

(function hookGuildPanelOpen(){
  setTimeout(()=>{
    const orig = window.openP;
    if(typeof orig==='function' && !orig._guildPanelHooked){
      window.openP = function(id){
        const r = orig.apply(this, arguments);
        if(id==='guild'){
          // 구버전(joinGuildV2) 가입 기록이 있으면 신버전 저장소로 1회 마이그레이션
          try{
            if(typeof loadGuilds==='function' && typeof loadGuildPlayer==='function' && typeof setGuildPlayer==='function' && !window._guildV2Migrated){
              window._guildV2Migrated = true;
              const oldGuilds = loadGuilds()||[];
              const gpAll = loadGuildPlayer()||{};
              oldGuilds.forEach(g=>{
                if(!gpAll[g.id] || gpAll[g.id].status!=='member'){
                  setGuildPlayer(g.id, { status:'member', rank:g.rankIdx||0, proficiency:0, joinedAt:g.joinedAt||S.msgCount||0 });
                }
              });
            }
          }catch(e){}
          setTimeout(()=>renderGuildPanel(), 50);
        }
        return r;
      };
      window.openP._guildPanelHooked = true;
    }
  }, 4300);
})();

document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{
    if(!document.querySelector(".pc-menu-btn[onclick*=\"openP('guild')\"]")){
      const ref = document.querySelector('.pc-menu-btn[onclick*="clan"]')
               || document.querySelector('.pc-menu-btn[onclick*="factions"]');
      if(ref){
        const btn = document.createElement('button');
        btn.className='pc-menu-btn';
        btn.setAttribute('onclick',"openP('guild');renderGuildPanel()");
        btn.innerHTML='<span class="pc-ico">⚔️</span><span class="pc-lbl">길드</span>';
        ref.parentNode.insertBefore(btn, ref.nextSibling);
      }
    }
  }, 2100);
});

console.log('[TaleForge] 길드 시스템 v1 로드 완료 ✓ (모험가/상인/마법사/도적 4종 / 가입·탈퇴·자동승급·의뢰판·GS·BLS)');

window.GUILD_API = { loadGuildPlayer, getGuildPlayer, joinGuild, leaveGuild, changeGuildRep, gainGuildProficiency,
  acceptGuildQuest, completeGuildQuest, failGuildQuest, ensureGuildBoard, getGuildBLS, renderGuildPanel };

})();
