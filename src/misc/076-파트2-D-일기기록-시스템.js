// 파트2-D: 일기/기록 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { TITLE_DEFS } from '../data/010-스킬-강화-시스템.js';
import { MAIN_QUESTS, WORLD_EVENTS } from '../data/042-직업-시스템-무한-파생-도감.js';
import { RELICS, REPUTATION_LEVELS } from '../data/054-이동수단-시스템.js';
import { MASTERY_LEVELS } from '../data/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { WAR_ACTIONS } from '../data/068-전쟁-피해-플레이어-개입-시스템.js';
import { MATERIALS } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MAXSEC_JAIL_INMATES } from '../data/086-퀘스트임무-수락-팝업-시스템.js';
import { calcSetBonus } from '../items/006-세트-아이템-시스템.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { loadMemory, loadTitles } from '../job/010-스킬-강화-시스템.js';
import { findJob, getJobIdFromName, loadJobHistory, loadMainQuestState, loadWorldEvents } from '../job/042-직업-시스템-무한-파생-도감.js';
import { getCurrentFactions, getFactionDesc, getSimTension, loadFactionRep, loadFactionSim } from '../npc/067-③-NPC-관계망-시스템.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { loadJailState } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { RACE_DEFS } from '../race/013-종족-시스템.js';
import { getJobMastery } from '../race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { loadThrallData } from '../ui/026-renderHumanAwakeningPanel-완전-재정의.js';
import { getActiveEffects } from '../ui/155-⑭-메모리-패널-UI.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadAtmosphere, loadDynQuests, loadNPCs } from './001-block0-preamble.js';
import { loadStatPoints } from './009-레벨업-스탯-포인트-배분-시스템.js';
import { calcPstxResist, classifyMonsterNamed, loadBossState, loadOwnedRelics, loadParty, loadReputation } from './054-이동수단-시스템.js';
import { getWorldStateDesc } from './066-②-선택-결과-추적-시스템.js';
import { loadBlueprints, loadMaterials } from './075-파트2-C-크래프팅-시스템.js';
import { loadEvolution } from './206-3-진화Evolution-시스템.js';
import { getRecentShockBLS } from './217-14-메모리-자동-요약.js';

export const DIARY_KEY = 'tf-diary';

export function loadDiary(){ try{ return JSON.parse(lsGet(DIARY_KEY)||'[]'); }catch(e){ return []; } }
window.loadDiary = loadDiary;

export function saveDiary(d){ try{ lsSet(DIARY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveDiary = saveDiary;

export function saveDiaryEntry(type, content, metadata={}){
  const diary = loadDiary();
  const entry = {
    id: Date.now(),
    type, // 'combat','levelup','evolution','jobchange','npc','quest','choice','event','custom'
    content: content.slice(0,300),
    turn: S.msgCount,
    level: loadPlayerLevel()||1,
    location: loadCurrentLocation()?.name || '알 수 없는 곳',
    at: new Date().toLocaleString('ko-KR'),
    metadata,
  };
  diary.push(entry);
  saveDiary(diary);
}
window.saveDiaryEntry = saveDiaryEntry;

export function detectDiaryMoment(aiText, userAction){
  const lc = (aiText||'').toLowerCase();
  const ua = (userAction||'').toLowerCase();

  // 중요 전투 결과
  if(lc.includes('격퇴') || lc.includes('처치') || lc.includes('승리'))
    saveDiaryEntry('combat', `[Lv.${loadPlayerLevel()}] ${aiText.slice(0,200)}`, {action:userAction.slice(0,50)});

  // NPC와 중요 대화
  const npcs = loadNPCs()||[];
  npcs.forEach(npc=>{
    if(lc.includes(npc.name.toLowerCase()) && (lc.includes('계약') || lc.includes('맹세') || lc.includes('비밀')))
      saveDiaryEntry('npc', `${npc.name}과의 중요한 순간: ${aiText.slice(0,200)}`, {npc:npc.name});
  });

  // 큰 골드 획득
  const gm = aiText.match(/골드\s*\+\s*(\d+)/);
  if(gm && parseInt(gm[1])>=100)
    saveDiaryEntry('gold', `${gm[0]} 획득`, {amount:parseInt(gm[1])});
}
window.detectDiaryMoment = detectDiaryMoment;

export function renderDiaryPanel(){
  const body = document.getElementById('pb-diary');
  if(!body) return;
  const diary = loadDiary().slice().reverse();

  const typeIcons = { combat:'⚔️', levelup:'⬆️', evolution:'✨', jobchange:'💼', npc:'👤', quest:'📜', choice:'🎯', event:'🎲', gold:'💰', custom:'📖' };
  const typeNames = { combat:'전투', levelup:'레벨업', evolution:'진화', jobchange:'전직', npc:'NPC', quest:'퀘스트', choice:'선택', event:'이벤트', gold:'획득', custom:'기록' };

  body.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);letter-spacing:1px">📖 모험 일지 (${diary.length}개)</div>
      <button class="btn btn-dark" style="padding:3px 8px;font-size:9px" onclick="addCustomDiary()">+ 직접 기록</button>
    </div>
    ${diary.length===0?'<div style="color:var(--dim);font-size:11px;text-align:center;padding:20px">아직 기록된 내용이 없습니다</div>':
    diary.map(e=>`
      <div style="padding:9px 11px;background:#0d0800;border:1px solid var(--border);margin-bottom:5px;border-left:3px solid var(--gold)">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:14px">${typeIcons[e.type]||'📖'}</span>
          <span style="font-size:9px;color:var(--gold);font-family:Cinzel,serif">${typeNames[e.type]||e.type}</span>
          <span style="font-size:8px;color:var(--dim);margin-left:auto">Lv.${e.level} · 턴${e.turn} · ${e.location}</span>
        </div>
        <div style="font-size:10px;color:#c8a96e;line-height:1.5">${esc(e.content)}</div>
        <div style="font-size:8px;color:var(--dim);margin-top:3px">${e.at}</div>
      </div>`).join('')}
    ${diary.length>20?`<div style="text-align:center;font-size:9px;color:var(--dim);padding:8px">... 총 ${diary.length}개 (최근 20개 표시)</div>`:''}
  `;
}
window.renderDiaryPanel = renderDiaryPanel;

export function addCustomDiary(){
  const text = prompt('모험 일지에 기록할 내용을 입력하세요:');
  if(!text || !text.trim()) return;
  saveDiaryEntry('custom', text.trim());
  renderDiaryPanel();
  toast('📖 일지에 기록했습니다', 1500);
}
window.addCustomDiary = addCustomDiary;

export function buildFactionWarContext(){
  try{
    // [B50 FIX] 세력 시뮬레이션 저장 구조가 sim.relations(_simKey 기반)로
    // 바뀐 뒤에도 이 함수만 구버전 필드명(sim.factions/sim.tensions)을
    // 참조해 항상 빈 배열/기본값만 반환하던 버그. 실제 저장/조회 함수로 교체.
    const sim = (typeof loadFactionSim==='function') ? loadFactionSim() : {relations:{}};
    const factionsMap = (typeof getCurrentFactions==='function') ? getCurrentFactions() : {};
    const names = Object.keys(factionsMap);
    if(names.length < 2) return '';
    const wars=[], conflicts=[], alliances=[];
    for(let i=0;i<names.length;i++){
      for(let j=i+1;j<names.length;j++){
        const a=names[i], b=names[j];
        const t = getSimTension(sim, a, b);
        if(t>=90) wars.push(a+' vs '+b);
        else if(t>=70) conflicts.push(a+' ↔ '+b);
        else if(t<=20) alliances.push(a+' ↔ '+b);
      }
    }
    const q=(()=>{ try{ return JSON.parse(lsGet('tf-faction-news-queue')||'[]'); }catch(e){ return []; } })();
    const recent = q.slice(0,2).map(n=>n.msg).join(' / ');
    let c = '\n\n[🌍 세계 전황 — 직접 언급 말고 배경·NPC 대화·분위기로만 반영]\n';
    if(wars.length)      c += `⚔️ 전쟁 중: ${wars.join(', ')} — 피난민·징집 소문·물가 상승·공포 분위기\n`;
    if(conflicts.length) c += `😤 긴장: ${conflicts.join(', ')} — 소규모 충돌·암살 소문·지지자 대립\n`;
    if(alliances.length) c += `🤝 동맹: ${alliances.join(', ')} — 공동 순찰·우호 교류\n`;
    if(recent)           c += `📰 최근 소식: ${recent}\n`;
    if(!wars.length && !conflicts.length) c += `표면적 평화 — 각 세력의 암중 움직임 암시 가능\n`;
    return c;
  }catch(e){ return ''; }
}
window.buildFactionWarContext = buildFactionWarContext;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_63(){
function buildLightSystem(char, titles, memory, npcs){
  if(!char) return '너는 인터랙티브 소설의 나레이터야.';

  // ── 기본 정보 ──────────────────────────────
  const race = RACE_DEFS.find(r=>r.name===char.race);
  const era = char.scenario || '중세 판타지';
  const sid = S.scenario?.id || 'custom';

  // ── 환경 ──────────────────────────────────
  const atm = loadAtmosphere();
  const weatherMap={none:'',rain:'비가 내린다',storm:'폭풍이 몰아친다',snow:'눈이 내린다',fog:'짙은 안개가 깔렸다',scorching:'폭염이다',clear:'맑고 화창하다'};
  const timeMap={none:'',dawn:'새벽',morning:'아침',midday:'정오',afternoon:'오후',evening:'저녁',night:'밤',midnight:'자정'};
  const weather = weatherMap[atm?.weather]||'';
  const timeOfDay = timeMap[atm?.timeOfDay]||'';
  // 날씨/시간 S에 저장 (판정 반영용)
  S._weather = weather||'';
  S._timeOfDay = timeOfDay||'낮';

  // ── 현재 위치 ─────────────────────────────
  const curLoc = loadCurrentLocation();
  const locTypeName = curLoc?.type==='dungeon'?'던전':curLoc?.type==='capital'?'수도':curLoc?.type==='city'?'도시':curLoc?.type==='shrine'?'성소':curLoc?.type==='special'?'특수':curLoc?.type==='event'?'이벤트':'장소';
  const locDesc = curLoc ? `${curLoc.icon} ${curLoc.name}(${locTypeName})` : '알 수 없는 장소';
  const locDanger = curLoc?.dangerLevel ? `위험도${'⚠️'.repeat(curLoc.dangerLevel)}` : '';
  // 장소 전설/소문 — AI에 주입
  const locLoreExtra = curLoc ? (() => {
    let extra = '';
    if(curLoc.lore) extra += `\n  [장소 역사/분위기] ${curLoc.lore}`;
    if(curLoc.rumors && curLoc.rumors.length) extra += `\n  [떠도는 소문] ${curLoc.rumors.join(' / ')}`;
    return extra;
  })() : '';

  // ── 스탯 ──────────────────────────────────
  const stats = S.stats||{};
  const hp = Math.round(stats.hp||100), mp = Math.round(stats.mp||100);
  const hpState = hp<=20?'위험(HP매우낮음)':hp<=40?'부상':hp<=70?'약간부상':'양호';
  const mpState = mp<=15?'마나고갈':mp<=40?'마나부족':'충분';

  // ── 상태이상 ──────────────────────────────
  const statusEffects = (typeof getActiveEffects==='function') ? getActiveEffects('player') : [];
  const pstxVal = Math.round(S.stats?.pstx || 50);
  const { fullResist, partResist } = calcPstxResist(pstxVal);
  const activeStatus = statusEffects.map(e=>{
    const def = window.STATUS_EFFECTS[e.id];
    if(!def) return '';
    return `${def.icon}${def.name}${e.weakened?'(약화)':''}(${e.remaining}턴)`;
  }).filter(Boolean);

  // ── 직업 + 숙련도 ─────────────────────────
  const jobId = char.jobId || getJobIdFromName(char.role);
  const mastery = jobId ? getJobMastery(jobId) : null;
  const masteryName = mastery ? MASTERY_LEVELS[mastery.level-1]?.name : '';
  const masteryIcon = mastery ? MASTERY_LEVELS[mastery.level-1]?.icon : '';
  const jobHistory = (loadJobHistory()||[]).slice(-3).map(h=>h.jobName).join('→');
  const jobDef = jobId ? findJob(jobId) : null;
  const jobLoreText = jobDef?.lore || '';

  // ── 비전투 직업 여부 ────────────────────────
  const CIVILIAN_JOB_IDS = ['farmer','merchant','blacksmith','bard','healer','alchemist','gravekeeper'];
  const isCivilianJob = CIVILIAN_JOB_IDS.includes(jobId);

  // ── 종족 진화 ─────────────────────────────
  const evolved = loadEvolution();
  const evoStage = evolved[char.race]?.stage||1;
  const evoData = RACE_EVOLUTION[char.race]?.['stage'+evoStage];
  const raceName = evoData?.displayName || char.race;
  const raceAiHint = evoData?.aiHint || (race?.lore||'').slice(0,80);

  // ── 파티 ──────────────────────────────────
  const party = loadParty()||[];

  // ── NPC 관계 ──────────────────────────────
  const allNpcs = loadNPCs()||[];
  const friendNpcs = allNpcs.filter(n=>(n.relationship||50)>=70).slice(0,4)
    .map(n=>`${n.icon||''}${n.name}(우호${n.relationship})`);
  const enemyNpcs = allNpcs.filter(n=>(n.relationship||50)<30).slice(0,3)
    .map(n=>`${n.icon||''}${n.name}(적대${n.relationship})`);
  const neutralNpcs = allNpcs.filter(n=>(n.relationship||50)>=30&&(n.relationship||50)<70).slice(0,3)
    .map(n=>`${n.icon||''}${n.name}(중립)`);

  // ── 콤보 ──────────────────────────────────
  const combo = window.comboState?.count||0;
  const comboDesc = combo>=5?`🔥${combo}콤보 진행중! 강화된 상태`:combo>=3?`⚡${combo}콤보 진행중`:'';

  // ── 메인 퀘스트 ───────────────────────────
  const mqState = loadMainQuestState();
  const quests = MAIN_QUESTS[sid]||MAIN_QUESTS.custom||[];
  const activeQuest = quests.find(q=>mqState[q.id]==='active');
  const completedQuests = quests.filter(q=>mqState[q.id]==='complete').length;

  // ── 세계 상태/파벌/선택 이력 ───────────────────
  const worldStateDesc = getWorldStateDesc();
  const factionDesc    = getFactionDesc();
  const gameTimeDesc   = getGameTimeDesc();
  const fameLevelDesc  = getFameDesc();
  const fameReaction   = applyFameToNpcReaction();
  const bossCtx        = S._bossPhaseCtx||'';
  // ── 크래프팅/일지/이벤트 ────────────────────────
  const activeSetBonuses = (()=>{
    if(typeof calcSetBonus!=='function') return '';
    try{ const sb=calcSetBonus(); return Object.entries(sb).filter(([,v])=>v&&v.count>=2).map(([k,v])=>k+'('+v.count+'세트)').join(', '); }catch(e){ return ''; }
  })();
  const matDesc = (()=>{ const m=loadMaterials(); const keys=Object.keys(m).filter(k=>m[k]>0); return keys.length?keys.map(k=>`${MATERIALS[k]?.icon}${MATERIALS[k]?.name}×${m[k]}`).join(' '):'없음'; })();
  const lastDiary = loadDiary().slice(-1)[0]?.content||'';
  const lastEvent = S._lastEventResult||'';

  // ── 세계 사건 ─────────────────────────────
  const firedEvents = loadWorldEvents();
  const worldEvents = WORLD_EVENTS[sid]||[];
  const activeEvents = worldEvents.filter(e=>firedEvents[e.id]).slice(-2).map(e=>e.title);

  // ── 평판 ──────────────────────────────────
  const rep = loadReputation();
  const repLevel = [...REPUTATION_LEVELS].reverse().find(l=>(rep.score||0)>=l.min)||REPUTATION_LEVELS[0];

  // ── 유물 ──────────────────────────────────
  const ownedRelics = loadOwnedRelics()||[];
  const relicNames = ownedRelics.slice(0,3).map(id=>{
    const r=RELICS.find(x=>x.id===id); return r?r.icon+r.name:'';
  }).filter(Boolean);

  // ── 칭호 ──────────────────────────────────
  const myTitles = (loadTitles()||[]).slice(-3).map(t=>{
    const d=TITLE_DEFS.find(x=>x.id===t.id); return d?d.icon+d.name:'';
  }).filter(Boolean);

  // ── 기억 ──────────────────────────────────
  const mem = memory||loadMemory();
  const coreMem = (mem.core||'').slice(0,400);
  const midMem = (mem.mid||'').slice(0,300);
  // [신규] 영구 보존 사실 — core/mid는 토큰 절약을 위해 400자/300자로
  // 잘리지만, NPC 생사·세계 영구 변화 같은 절대 잊으면 안 되는 사실은
  // 글자수 제한 없이(개수 기반 관리이므로) 항상 전부 포함시킨다. 이게
  // 빠지면 "영구 보존"이라는 이름이 무색하게, 정작 AI가 받는 실제
  // 프롬프트(buildLightSystem)에는 반영되지 않는 상태가 된다.
  const factsMem = (() => {
    if(!Array.isArray(mem.facts) || !mem.facts.length) return '';
    const labels = { npc_death:'NPC생사', world_change:'세계변화', identity_reveal:'정체발각', irreversible_choice:'중대선택', relationship_turn:'관계전환', unresolved_hook:'미해결떡밥' };
    return mem.facts.map(f => `[${labels[f.category]||f.category}]${f.text}`).join(' / ');
  })();
  // [신규] 단기 감정 잔상 — 동료 사망 등 충격적 사건 직후 몇 턴 동안만
  // 살아있는 휘발성 안내. 5턴이 지나면 자동으로 사라진다.
  const recentShockMem = (typeof getRecentShockBLS==='function') ? getRecentShockBLS() : '';
  // [신규] 감옥 수감 상태 — checkArrestCondition()이 체포를 판정해도
  // AI가 매번 "현재 감옥에 갇혀있다"는 사실을 인지하지 못하면 서사가
  // 모순될 수 있다(예: 갇혀있는데 자유롭게 마을을 돌아다니는 묘사).
  const jailMem = (() => {
    try{
      const jail = (typeof loadJailState==='function') ? loadJailState() : {};
      if(!jail.jailed) return '';
      const served = (S.msgCount||0) - (jail.jailedAt||0);
      const remaining = Math.max(0, (jail.sentenceTurns||10) - served);
      let out = `\n[🔒 수감 중] 플레이어는 현재 ${jail.location||'감옥'}의 감옥에 갇혀있다(남은 형기 약 ${remaining}턴). 자유롭게 돌아다니거나 마을 밖으로 이동하는 묘사는 하지 말고, 감옥 안에서의 상황(간수, 다른 수감자, 탈출 가능성, 재판 대기)을 중심으로 서사를 전개하라. 플레이어가 탈출을 시도하면 jail_escape_attempt GS로 결과를 알려라.`;
      // [신규] 최고 보안 감옥("심연의 탑")이면 고정 수감자 2명을 항상
      // AI에게 알려준다 — 임펠다운처럼 "거기 가면 만날 수 있는 인물이
      // 있는" 진짜 장소가 되도록.
      if(jail.tier === 'maxsec' && typeof MAXSEC_JAIL_INMATES !== 'undefined'){
        const inmateLines = MAXSEC_JAIL_INMATES.map(n =>
          `${n.icon}${n.name}(${n.title}) — ${n.personality}`
        ).join('\n');
        out += `\n[⛓️ 심연의 탑 — 고정 수감자]\n${inmateLines}\n이들은 고정 캐릭터다. 적절한 장면에서 자연스럽게 등장시키고, 새로운 가상의 전설적 수감자를 임의로 만들지 마라.`;
      }
      return out;
    }catch(e){ return ''; }
  })();

  // ── 소환수/몬스터 ─────────────────────────
  // 동료+소환수 "전투 참여" 슬롯 = 합산 3명. 영입/소환 인원 제한과는 별개이며,
  // 슬롯 밖의 인원은 후방 대기로 묘사된다. 등장 순서(joinedAt/summonedAt) 기준
  // 먼저 합류한 쪽이 우선 전투 슬롯을 차지하도록 안정적으로 정렬한다.
  const BATTLE_PARTICIPANT_SLOTS = 3;
  const _allSummonsActive = (window.loadSummons()||[]).filter(s=>s.status==='active');
  // 권속 중 전투 소환된 것 — deployedBattle:true 플래그
  const _battleThralls = (() => {
    try {
      const td = (typeof loadThrallData==='function') ? loadThrallData() : {thralls:[]};
      return (td.thralls||[]).filter(t => t.deployedBattle && t.loyalty > 0);
    } catch(e) { return []; }
  })();

  const _battlePool = [
    ...party.filter(m=>m.alive!==false && !m.incapUntilTurn).map(m=>({ kind:'party', ref:m, order:new Date(m.joinedAt||0).getTime()||0 })),
    ..._allSummonsActive.map(s=>({ kind:'summon', ref:s, order:new Date(s.summonedAt||0).getTime()||0 })),
    ..._battleThralls.map(t=>({ kind:'thrall', ref:t, order:Date.now()-((t.rankIdx||0)*1000) })),
  ].sort((a,b)=>a.order-b.order);
  const _battleActive = _battlePool.slice(0, BATTLE_PARTICIPANT_SLOTS);
  const _battleStandby = _battlePool.slice(BATTLE_PARTICIPANT_SLOTS);

  const partyDesc = party.length>0
    ? party.map(m=>{
        const inBattle = _battleActive.some(b=>b.kind==='party'&&b.ref===m);
        const standbyTag = (m.alive!==false && !inBattle) ? '·후방대기' : '';
        const incapTag = m.incapUntilTurn ? `·부상이탈(${Math.max(0,(m.incapUntilTurn||0)-(S.msgCount||0))}턴)` : m.alive===false?'·전투불능':'';
        return `${m.icon||''}${m.name}(${m.role||'동료'}·HP:${Math.round(m.hp??m.maxHp??100)}/${Math.round(m.maxHp??100)}${incapTag||standbyTag})`;
      }).join(', ')
    : '없음';

  const summons = _battlePool.filter(b=>b.kind==='summon')
    .map(b=>{
      const s = b.ref;
      const inBattle = _battleActive.includes(b);
      return `${s.icon||''}${s.name}(HP:${Math.round(s.hp||0)}${inBattle?'':'·후방대기'})`;
    });
  const battleParticipantDesc = _battleActive.length
    ? _battleActive.map(b => {
        const r = b.ref;
        if (b.kind === 'thrall') {
          return `${r.icon||'⚔️'}${r.name}(권속·${r.rank}·충성${r.loyalty})`;
        }
        return `${r.icon||''}${r.name}`;
      }).join(', ')
    : '없음';
  const battleStandbyDesc = _battleStandby.length
    ? _battleStandby.map(b=>`${b.ref.icon||''}${b.ref.name}`).join(', ')
    : '';

  // 적 분류: 네임드(주요 적)는 개별 표시, 잡몹은 무리로 묶음
  // — 최초 등장 시 분류가 isNamed 플래그로 고정되어, 전투 중 HP 변화로
  //   잡몹과 네임드가 서로 뒤바뀌지 않는다.
  const _allMonsters = (loadMonsters()||[]);
  let _monstersDirty = false;
  _allMonsters.forEach(m=>{
    if(m.isNamed === undefined){
      m.isNamed = classifyMonsterNamed(m.name, m.isBoss);
      _monstersDirty = true;
    }
  });

  // ── 네임드 동시 출현 슬롯 제한 + 대기열 ──────────────────
  // 살아있는 네임드가 슬롯을 초과하면 초과분은 'waiting'으로 대기시키고,
  // 슬롯에 여유가 생기면(네임드 처치 등) 대기 중인 적을 순서대로 등장시킨다.
  const NAMED_ENEMY_SLOTS = 5;
  let _reinforcementNames = [];
  {
    const aliveNamed   = _allMonsters.filter(m=>m.status==='alive' && m.isNamed);
    const waitingNamed = _allMonsters.filter(m=>m.status==='waiting' && m.isNamed)
      .sort((a,b)=>(a.spawnedAt||0)-(b.spawnedAt||0));

    if(aliveNamed.length > NAMED_ENEMY_SLOTS){
      // 초과분을 대기로 전환 (가장 최근에 등장한 것부터 대기시킴)
      const sorted = [...aliveNamed].sort((a,b)=>(b.spawnedAt||0)-(a.spawnedAt||0));
      const overflow = sorted.slice(0, aliveNamed.length - NAMED_ENEMY_SLOTS);
      overflow.forEach(m=>{ m.status='waiting'; });
      _monstersDirty = true;
    } else if(aliveNamed.length < NAMED_ENEMY_SLOTS && waitingNamed.length){
      const openSlots = NAMED_ENEMY_SLOTS - aliveNamed.length;
      const promote = waitingNamed.slice(0, openSlots);
      promote.forEach(m=>{ m.status='alive'; _reinforcementNames.push(`${m.icon||''}${m.name}`); });
      if(promote.length) _monstersDirty = true;
    }
  }
  if(_monstersDirty) saveMonsters(_allMonsters);

  const _aliveMonsters = _allMonsters.filter(m=>m.status==='alive');
  const _majorMonsters = _aliveMonsters.filter(m=>m.isNamed).slice(0,NAMED_ENEMY_SLOTS);
  const _minorMonsters  = _aliveMonsters.filter(m=>!m.isNamed);
  const _waitingCount = _allMonsters.filter(m=>m.status==='waiting' && m.isNamed).length;
  const monsters = _majorMonsters
    .map(m=>`${m.icon||''}${m.name}(HP:${Math.round(m.hp||0)}·ATK:${m.atk||0}${m.isBoss?'·보스':''})`);
  if(_minorMonsters.length){
    const totalHp = _minorMonsters.reduce((s,m)=>s+(m.hp||0),0);
    const totalMaxHp = _minorMonsters.reduce((s,m)=>s+(m.maxHp||m.hp||0),0);
    const repIcon = _minorMonsters[0]?.icon || '👹';
    const repName = _minorMonsters[0]?.name || '잡몹';
    monsters.push(`${repIcon}${repName} 무리×${_minorMonsters.length}(총HP:${Math.round(totalHp)}/${Math.round(totalMaxHp)||Math.round(totalHp)})`);
  }
  // 대기 중인 적 등장 안내 (전투 슬롯에 여유가 생겼을 때)
  const reinforcementHint = _reinforcementNames.length
    ? `\\n[⚔️ 증원 등장] ${_reinforcementNames.join(', ')}이(가) 전장에 새로 합류했다. 이번 응답에서 자연스럽게 등장 장면을 묘사하라.`
    : (_waitingCount > 0 ? `\\n[⚔️ 적 증원 대기 중] 추가로 ${_waitingCount}명의 적이 어딘가에서 전황을 지켜보고 있다. 현재 전투가 정리되면 등장시킬 수 있다.` : '');

  // ── 레벨/경험치 ──────────────────────────────
  const playerLv   = loadPlayerLevel()||1;
  const statPoints = loadStatPoints()||0;

  // ── 환생 회차 ─────────────────────────────
  const cycle = loadCycleCount()||0;
  const cycleDesc = cycle>0?`${cycle}회차 환생(전생 기억 보유)`:'첫 번째 삶';

  // ── 계절 ──────────────────────────────────
  const _gt = ((typeof loadGameTime==='function') ? loadGameTime() : null) || {season:'봄',year:1,day:1,timePhase:0};
  const _curPhase = (typeof TIME_PHASES!=='undefined') ? (TIME_PHASES[_gt.timePhase||0]) : null;
  const currentSeason = `${_gt.season} ${_gt.year}년 ${_gt.day}일`;
  const _seasonEff = (typeof getSeasonEffect==='function') ? getSeasonEffect() : {};
  const seasonEffDesc = _seasonEff.desc||'';
  // 시간대 설명 (AI 컨텍스트용)
  const _timePhaseDesc = _curPhase ? `${_curPhase.icon}${_curPhase.label} — ${_curPhase.desc}${_curPhase.shopOpen?' (상점 영업 중)':' (상점 영업 종료)'}${_curPhase.assassinRisk?' ⚠️ 암살자 활동 시간':''}${_curPhase.guardAlert?' ⚔️ 경비 경계 강화':''}` : '';

  // ── 탐험 진행도 ───────────────────────────
  const _explRate = (typeof getExplorationRate==='function') ? getExplorationRate() : {rate:0};
  const explorationRate = _explRate.rate||0;

  // ── 누락 변수 안전 선언 ──────────────────────
  const bossCtxBLS    = (typeof S._bossCtxBLS  !=='undefined') ? S._bossCtxBLS   : '';
  const bossHpDesc     = (()=>{
    if(typeof loadBossState!=='function') return '';
    try{
      const bs=loadBossState(); const ab=Object.entries(bs).find(([,b])=>b?.active&&!b.dead);
      if(!ab) return '';
      const [bid,boss]=ab;
      const {current,max}=typeof getBossCurrentHp==='function'?getBossCurrentHp(bid):{current:boss.hp||1000,max:boss.maxHp||1000};
      const pct=Math.round(current/max*100);
      return boss.name+' HP: '+current+'/'+max+'('+pct+'%)';
    }catch(e){ return ''; }
  })();
  const epicQuestBLS  = (typeof S._epicQuestBLS!=='undefined') ? S._epicQuestBLS : '';
  const emotionDesc   = (typeof S._emotionDesc !=='undefined') ? S._emotionDesc  : '';
  const skillMasteryDesc = (()=>{
    try{ if(typeof getSkillMasteryDesc==='function') return getSkillMasteryDesc(); }catch(e){}
    return '';
  })();
  const partyBattleInfoBLS = (typeof S._partyBattleInfo!=='undefined'&&S._partyBattleInfo) ? S._partyBattleInfo : {desc:''};
  const jailDesc      = (typeof S._jailDesc     !=='undefined') ? S._jailDesc     : '';
  const durabilityWarning = (()=>{
    try{ if(typeof getDurabilityWarning==='function') return getDurabilityWarning(); }catch(e){}
    return '';
  })();
  const activeComboDesc = (()=>{
    try{ if(typeof getActiveComboDesc==='function') return getActiveComboDesc(); }catch(e){}
    return comboDesc||'';
  })();
  const academyDesc   = (typeof S._academyDesc  !=='undefined') ? S._academyDesc  : '';
  const battleSummary = (typeof S._battleSummary!=='undefined') ? S._battleSummary: '';
  const weatherEffDesc= (typeof S._weatherEffDesc!=='undefined')? S._weatherEffDesc: '';

  // ══════════════════════════════════════════
  //  시스템 프롬프트 조립
  // ══════════════════════════════════════════
  return `너는 인터랙티브 소설의 전지적 나레이터야. 아래 모든 정보를 철저히 반영해서 이야기를 이어가라.

[주인공]
이름: ${char.name} | 레벨: Lv.${playerLv}${statPoints>0?' (스탯포인트 '+statPoints+'개 미배분)':''} | 종족: ${raceName} | 직업: ${char.role}${masteryIcon?' '+masteryIcon+masteryName+' 숙련도':''}
성격: ${char.personality||'알 수 없음'} | 말투: ${char.speechStyle||'기본'}
배경: ${(char.background||'알 수 없음').slice(0,120)}
HP: ${hp}(${hpState}) | MP: ${mp}(${mpState})
${cycleDesc}
${jobHistory?'직업 이력: '+jobHistory:''}
${raceAiHint?'종족 특성: '+raceAiHint:''}
${jobLoreText?'[직업 배경] '+jobLoreText:''}
${evoStage>1?'진화 단계: '+evoStage+'단계 — '+(evoData?.name||raceName):''}

[현재 상황]
위치: ${locDesc} ${locDanger}
${weather&&timeOfDay?'환경: '+timeOfDay+', '+weather:weather||timeOfDay?'환경: '+(timeOfDay||'')+(weather?' '+weather:''):''}
${activeStatus.length>0?'상태이상: '+activeStatus.join(', '):''}
${pstxVal > 60 ? `[상태저항 PSTX ${pstxVal}] 완전 차단 ${Math.round(fullResist*100)}% / 약화 저항 ${Math.round(partResist*100)}% — 독·빙결·저주·화상·광기 등 부정 상태이상 전반에 상당한 내성을 지닌다. 상태이상 묘사 시 저항력을 반영하라.` : ''}${comboDesc}
${monsters.length>0?'⚔️ 전투 중인 적: '+monsters.join(', '):''}${reinforcementHint}
${summons.length>0?'소환수: '+summons.join(', '):''}
${party.length>0?'파티: '+partyDesc:''}

[관계]
우호 NPC: ${friendNpcs.length>0?friendNpcs.join(', '):'없음'}
${neutralNpcs.length>0?'중립 NPC: '+neutralNpcs.join(', '):''}
${enemyNpcs.length>0?'적대 NPC: '+enemyNpcs.join(', '):''}
평판: ${repLevel.icon} ${repLevel.level}${rep.title?' — "'+rep.title+'"':''}

[세계관]
시대: ${era}${char.customWorldSetting?' | '+char.customWorldSetting.slice(0,150):''}
${(()=>{
  try{
    const dq = (typeof loadDynQuests==='function') ? loadDynQuests() : [];
    const activeMain = dq.filter(q=>q.grade==='S' && q.status==='active');
    const activeImportant = dq.filter(q=>q.grade==='A' && q.status==='active');
    const parts = [];
    if(activeMain.length) parts.push('[★ 메인 퀘스트] ' + activeMain.map(q=>q.title+': '+q.desc+(q.aiHint?' ('+q.aiHint+')':'')).join(' / '));
    if(activeImportant.length) parts.push('[▲ 중요 퀘스트] ' + activeImportant.map(q=>q.title+': '+q.desc).join(' / '));
    return parts.join('\n');
  }catch(e){ return ''; }
})()}
${gameTimeDesc?'날짜: '+gameTimeDesc:''}
${_timePhaseDesc?'시간대: '+_timePhaseDesc:''}
${seasonEffDesc?'계절 효과: '+seasonEffDesc:''}
${fameLevelDesc?'명성: '+fameLevelDesc:''}
${lastDiary?'최근 일지: '+lastDiary:''}
${worldStateDesc!=='없음'?'플레이어 이력: '+worldStateDesc:''}
${(()=>{ try{ return factionDesc?'세력 전황: '+factionDesc:''; }catch(e){ return ''; } })()}
${(()=>{
  const fr = loadFactionRep();
  const factions = getCurrentFactions();
  const active = Object.entries(fr).filter(([,v])=>Math.abs(v)>=10);
  if(active.length === 0) return '';
  const lines = active.map(([k,v])=>{
    const f = factions[k];
    const lv = v>=50?'동맹':v>=20?'우호':v>=-20?'중립':v>=-50?'적대':'전쟁';
    const capNote = f?.capital ? ` [거점: ${f.capital.name}]` : '';
    return `  • ${f?.icon||''}${k}(${lv} ${v>0?'+':''}${v})${capNote}${v>=50?' — 강력한 지원 가능':v<=-50?' — 적극 방해·공격':''}`;
  }).join('\n');
  return `[⚜️ 세력 관계]\n${lines}\n동맹 세력은 NPC 지원·정보·거래 혜택을 제공하고, 적대 세력은 서사에서 장애물·매복·음모로 등장시키십시오.
${(()=>{
  try{
    if(typeof calcUnificationProgress!=='function') return '';
    const up = calcUnificationProgress();
    const max = Math.max(up.conquest||0, up.diplomacy||0, up.subversion||0, up.foundation||0);
    if(max < 30) return '';
    const routeNames = {conquest:'무력 정복',diplomacy:'외교 통합',subversion:'비밀 공작',foundation:'새 국가 건국'};
    const leading = Object.entries(up).sort((a,b)=>b[1]-a[1])[0];
    const uni = typeof loadUnification==='function' ? loadUnification() : {};
    if(uni.completed) return '\n[🏰 세계 통일 달성] 플레이어가 ' + (typeof UNIFICATION_ROUTES!=='undefined' && UNIFICATION_ROUTES[uni.route] ? UNIFICATION_ROUTES[uni.route].endingName : '통일') + '을 이루었다. 서사에서 통일된 세계의 분위기와 새로운 질서를 묘사하십시오.';
    return '\n[🏰 통일 진행 중] ' + routeNames[leading[0]] + ' 루트 진행도 ' + leading[1] + '%. 플레이어의 행동이 세계의 판도를 바꾸고 있다. 세력 간 긴장과 통일 기운을 서사에 녹이십시오.';
  }catch(e){ return ''; }
})()}
${(()=>{try{return typeof window.getFactionGaugeBLS==='function'?window.getFactionGaugeBLS():'';}catch(e){return '';}})()}`;
})()}
현재 계절: ${currentSeason}${seasonEffDesc?' — '+seasonEffDesc:''}
탐험 진행도: ${explorationRate}%
${matDesc!=='없음'?'보유 재료: '+matDesc:''}
${(()=>{const bps=loadBlueprints();return bps.length?`보유 설계도 ${bps.length}종 (제작/연금술 가능)`:''})()}
${activeSetBonuses?'활성 세트: '+activeSetBonuses:''}
${lastEvent?'최근 이벤트: '+lastEvent:''}
${bossCtx}
${fameReaction}
${bossCtxBLS}
${bossHpDesc?'['+bossHpDesc+']':''}
${epicQuestBLS}

${emotionDesc?'현재 감정: '+emotionDesc:''}
${skillMasteryDesc?'스킬 숙련: '+skillMasteryDesc:''}
${partyBattleInfoBLS.desc?'파티 지원: '+partyBattleInfoBLS.desc:''}
${jailDesc?'[수감 중: '+jailDesc+']':''}
${durabilityWarning}
${activeComboDesc}
${academyDesc?'[수학 중: '+academyDesc+']':''}
${battleSummary}
${weatherEffDesc?'날씨효과: '+weatherEffDesc:''}
${(()=>{
  const ctx = window._warActionCtx;
  if(!ctx) return '';
  let txt = '';
  if(ctx.type === 'combat'){
    const act = typeof WAR_ACTIONS !== 'undefined' ? WAR_ACTIONS[ctx.actionId] : null;
    const actName = act ? act.label : ctx.actionId;
    const myFaction = ctx.side==='a' ? ctx.fa : ctx.fb;
    txt = `[⚔️ 전쟁 행동 — ${ctx.grade}] 플레이어가 ${myFaction} 편에서 [${actName}]을 수행했다. 결과: ${ctx.outcomeMsg}\n${ctx.aiHint}\n이 결과를 서사에 녹여 묘사하십시오. 판정 수치 언급 금지.`;
  } else if(ctx.type === 'mediate'){
    txt = `[🕊️ 외교 조정 — ${ctx.grade}] 플레이어가 ${ctx.fa}↔${ctx.fb} 전쟁 조정 시도. 결과: ${ctx.resultMsg}\n${ctx.aiHint}`;
  }
  window._warActionCtx = null;
  return txt ? txt : '';
})()}
${completedQuests>0?'완료한 퀘스트: '+completedQuests+'개':''}
${activeEvents.length>0?'세계 사건: '+activeEvents.join(', '):''}

[기억/역사]
${coreMem?'핵심 기억: '+coreMem:''}
${midMem?'요약: '+midMem:''}
${factsMem?'[📌 절대 잊으면 안 되는 사실 — 모순 없이 반영] '+factsMem:''}
${recentShockMem}
${jailMem}

${myTitles.length>0?'[칭호] '+myTitles.join(' | '):''}
${relicNames.length>0?'[유물] '+relicNames.join(' | '):''}
${(()=>{const eq=S.equipped||{}; const parts=[]; if(eq.weapon) parts.push('무기:'+eq.weapon.icon+eq.weapon.name); if(eq.armor) parts.push('방어구:'+eq.armor.icon+eq.armor.name); if(eq.accessory) parts.push('장신구:'+eq.accessory.icon+eq.accessory.name); return parts.length>0?'[장착 장비] '+parts.join(' | '):'';})()}

${typeof getAntiRepeatInstruction==='function'?getAntiRepeatInstruction():''}
[서술 규칙 — 반드시 준수]

■ 기본
1. 3인칭 나레이션, 한국어, 생동감 있게 3~6문장
1-1. 모든 단어는 정확한 사전적 의미로만 사용하라. 뜻이 확실하지 않은 한자어·고어체 표현은 쓰지 말고, 더 쉽고 자연스러운 현대 한국어 표현으로 바꿔 써라. 어색하거나 문맥에 맞지 않는 단어 하나가 몰입을 깬다.
2. 절대 플레이어의 행동/대사를 대신 작성하지 말 것
3. [주사위 굴림] 결과를 서사에 녹여라:
   - 대성공: "완벽하게", "믿을 수 없는 솜씨로", 주변이 감탄하는 반응 포함
   - 성공: 의도한 대로 진행, 간결하게
   - 실패: 부분적 실패, 예상치 못한 문제 발생
   - 대실패: 심각한 역효과, 위기 상황 연출, 긴장감 극대화

■ 상황별 필수 반영
4. 상태이상 [${activeStatus.join(', ')||'없음'}]:
   상태이상이 있다면 캐릭터가 몸으로 느끼는 증상만 서사에 자연스럽게 녹여라. 수치나 지속시간은 절대 언급하지 말 것.
   - 빙결: 몸이 굳어 행동이 느려지는 느낌
   - 화상: 타오르는 고통, 근력이 흔들리며 집중력 흐트러짐
   - 중독: 시야가 흐려지고 독기가 온몸에 퍼지는 느낌
   - 저주: 불길한 기운이 행동을 방해하는 느낌
   - 광기: 이성이 무너지며 충동이 행동을 지배한다. 캐릭터가 의도하지 않은 공격적 행동을 할 수 있다.${S._isUncontrolled?' ⚠️ 현재 광기 상태 — 반드시 제어 불가 상황을 묘사할 것':''}
   - 축복: 빛이 감싸는 듯한 가호, 모든 행동에 신성한 힘이 실리는 느낌
   - 은신: 그림자 속에서 조용히, 적이 위치를 파악하기 어려운 상태

5. 현재 위치 [${locDesc}${locDanger?' — '+locDanger:''}]:${locLoreExtra}
   - 도시: 북적이는 군중, 상인들의 외침, 냄새
   - 던전: 어둠과 습기, 발소리 메아리, 위험의 기척
   - 성소: 신성한 고요함, 향 냄새, 경건한 분위기
   - 전장: 피비린내, 전쟁의 상흔, 긴장감

6. 환경 [${timeOfDay||''}${weather?' '+weather:''}]:
   - 밤/자정: 어둠이 모든 것을 삼킨다
   - 폭풍: 바람 소리가 말을 끊는다
   - 안개: 시야가 제한되고 불안감 고조

■ 전투
7. 적 [${monsters.length>0?monsters.map(m=>m).join(', '):'없음'}]:
   - 반드시 적의 반응과 반격을 묘사
   - 보스급: 압도적인 위압감, 전장이 변함
   - HP가 낮은 적: 비틀거림, 절박한 공격
   - [🐺 몬스터 사회성 — 등장 방식 결정] 몬스터를 등장시킬 때는 종족의 생태적 습성을 반영하라. 단독 영역 동물·고독한 마물(곰·표범·트롤·골렘·정령·뱀파이어·고룡·리치 등 강력한 단일 개체)은 절대 같은 종끼리 무리로 몰려다니게 하지 마라 — 항상 1체로 등장. 무리·군집 생활을 하는 종(늑대·들개·코볼트·고블린·도적단 등)은 자연스럽게 여럿이 함께 등장시켜라. 떼로 다니는 약한 잡몹(쥐·박쥐·까마귀·슬라임 등)은 다수가 몰려오는 것이 정상이다. 단, 부족장·우두머리급(오크 족장, 오크 대족장, 하피 여왕, 도적 두목 등)은 "혼자 다니는 것"도 부자연스럽다 — 이런 존재는 동급 개체와 무리짓지는 않지만 자신보다 약한 부하·호위(같은 종족의 하급 개체)를 거느리고 다니는 것이 자연스럽다. 예: 오크 족장이 혼자 등장하는 것은 어색하다 → 오크 족장(개별 보스로 npc_add 또는 enemy_incap 관리) + 오크 졸개 무리(monster_group_spawn으로 등록)를 함께 등장시켜 "족장과 그 부하들" 구도로 묘사하라.
   - "○○ 무리×N" 형태로 표시된 항목은 잡몹 집단이다. 개별 개체로 일일이 묘사하지 말고 "무리 전체"를 하나의 단위로 다뤄라(예: "잡몹 무리가 일제히 달려들었다"). 잡몹 무리가 처음 등장하면(이전에 등록 안 된 경우) 반드시 <gs>{"monster_group_spawn":{"name":"무리이름","icon":"👹","count":3,"hp":20}}</gs>를 출력해 무리를 등록하라 — 이게 빠지면 시스템에 적이 전혀 등록되지 않는다. 전투 중 매 턴 <gs>{"monster_group_damage":{"name":"무리이름","dmg":무리가입은피해,"dmgToPlayer":플레이어가받은피해}}</gs>를 출력해 양쪽 피해를 모두 반영하라. 무리가 전멸하면 <gs>{"monster_group_wipe":true}</gs>로 알려라. 시스템이 HP는 마리 수만큼 정확히 합산하지만, 공격력은 마리 수가 많아질수록 완만하게(제곱근 곡선) 증가시켜 대규모 무리도 플레이어가 충분히 상대 가능한 수준으로 유지한다 — 예: 3마리는 한 마리의 약 1.7배, 13마리는 약 3.6배 위협도. 마리 수가 많을수록 "오래 버티지만 한 번에 치명적이지는 않은" 무리임을 서사에 반영하라. 피해를 입어 개체가 줄어들수록 무리의 위협도도 함께 감소시킨다 — 서사에서도 "한 마리, 두 마리 쓰러지며 무리의 기세가 꺾인다" 식으로 마리 수 감소에 따른 약화를 반영하라. 보스/강적(개별 표시된 적)은 이름으로 직접 지칭하며 개별적으로 묘사하고, npc_add 또는 enemy_incap으로 개별 관리하라.
   - [⚔️ 명시적 전투 상태 판단 — 매 응답 필수] 더 이상 서술 속 단어만으로 전투 여부를 추측하게 하지 않는다. 매 응답 끝의 <gs>에 반드시 combat_state 필드를 포함하라 — 값은 "start"(이번 턴에 전투가 시작됨), "ongoing"(전투가 계속 진행 중), "end"(이번 턴에 전투가 끝남), "none"(전투 상황이 아님) 중 정확히 하나. 플레이어가 "기습한다", "공격한다", "달려들어 싸운다", "묶어서 위협한다"처럼 명백히 전투를 개시하는 선택을 하면 반드시 combat_state:"start"를 출력하라 — 그 행동의 대상이 이미 등록된 일반 NPC(상점 주인, 감독관 등)였어도 마찬가지다. [🔄 NPC→적 전환] 이미 npc_add로 등록된 일반 NPC가 전투의 적이 되는 경우(감독관을 기습한다, 상인이 배신하고 덤벼든다 등), 반드시 <gs>{"npc_to_enemy":[{"name":"NPC이름","icon":"😠","hp":적정HP,"atk":적정공격력}]}</gs>를 함께 출력하라 — 이게 빠지면 그 인물이 전투 중인데도 몬스터로 등록되지 않아 시스템이 전투를 인식하지 못한다. HP/공격력은 그 인물의 지위(평범한 감독관=낮음, 숙련된 전사=중간, 보스급=높음)에 맞게 정하라.
8. 콤보 [${comboDesc}]:
   - 3콤보 이상: 흐름이 완전히 주인공 편, 상대가 방어에 급급
   - 10콤보: 전설이 탄생하는 순간처럼 묘사

■ 관계/사회
9. 평판 [${repLevel.icon} ${repLevel.level}]:
   - 무명: 아무도 신경 쓰지 않음
   - 영웅: 사람들이 길을 비켜주고 속삭임
   - 전설: 등장만으로 분위기가 바뀜
   - 불멸: 신화 속 인물을 보듯 경외
10. NPC 반응 — 관계도에 따라 말투를 철저히 다르게:
    - 신뢰(80+): 편안하고 솔직한 대화, 농담도 가능
    - 우호(65+): 친절하고 도움을 주려 함
    - 중립(40+): 공손하지만 거리를 둠
    - 경계(25+): 짧게 대답, 의심스러운 눈초리
    - 적대(0~25): 노골적인 적의, 위협적 태도
11. 파티원 [${party.length>0?partyDesc:'없음'}]:
    - 각 파티원이 자신의 특기로 상황에 기여
    - 파티원들 사이의 케미도 가끔 묘사
    - '·후방대기' 표시가 붙은 동료/소환수는 이번 전투의 직접 전투 슬롯(최대 ${BATTLE_PARTICIPANT_SLOTS}명)에 들지 못해 후방에서 대기 중이다. 이들은 전투에 직접 끼어들지 않되, 주변을 경계하거나 부상자를 돌보거나 다음 기회를 노리는 모습으로 가끔 짧게 언급해도 좋다.${battleStandbyDesc?` (후방 대기: ${battleStandbyDesc})`:''}

■ 캐릭터 고유성
12. 종족 [${raceName}] 특성을 행동/감각에 반영:
    - 엘프: 자연의 기척을 감지, 마법에 예민
    - 드래곤혈: 내면에서 불길이 끓어오름
    - 언데드: 고통을 느끼지 못함, 싸늘한 감각
    - 수인: 본능적 감지, 동물적 반응
13. 직업 숙련도 [${masteryIcon} ${masteryName}]:
    - 달인/전설/신화: 행동이 마치 예술처럼 묘사
    - 수련/숙련: 아직 어색하지만 성장이 보임
14. 환생 기억 [${cycleDesc}]:
    - 2회차+: "어디선가 본 듯한 느낌", "손이 먼저 움직였다"
    - 5회차+: 전생의 기억이 선명하게 떠오르기도 함

■ 경제/아이템
15. 골드 획득 시 반드시 "골드 +숫자" 명시
16. 아이템 발견 시 "아이템 획득: [아이템명]" 형식
17. HP/MP 변화 시 "HP-숫자" 또는 "HP+숫자" 명시
18. 세트 아이템 [${Object.values(S.equipped||{}).filter(Boolean).length}개 장착]:
    - 세트가 완성되면 장비에서 빛이 나거나 특별한 효과 묘사

■ 선택지
19. 마지막에 반드시: [선택지]①행동1②행동2③행동3④행동4[/선택지]
    - 선택지는 현재 상황과 직결된 의미있는 선택
    - 성격이 다른 선택지를 섞을 것 — 전투/생존형, 대화/설득형, 실리/탐색형, 대담하거나 위험한 선택형 중 최소 2가지 이상 포함(매번 전투나 대화로만 수렴하지 말 것)
    - NPC 호감도가 충분히 쌓였으면 가끔 관계 진전 방향을, 수상한 단서·소문을 좇을 만한 상황이면 가끔 숨겨진 장소나 퀘스트로 이어질 법한 선택지를 자연스럽게 섞어도 좋다
    - 아주 가끔, 특정 조건이 무르익었을 때만 ⑤ 비밀 선택지 추가

■ 동료/소환수 전투 참여 [필수]
20. 전투 중 직접 참여하는 동료·소환수 [${battleParticipantDesc}]는 배경 장식이 아니라 실제 전투 참가자다(최대 ${BATTLE_PARTICIPANT_SLOTS}명까지만 동시에 직접 전투, 나머지는 후방 대기). 매 전투 턴마다 다음을 반영하라:
    - 자동 행동: 동료·소환수는 명령 없이도 매 턴 스스로 판단하여 행동한다. 각자의 battleRole·성격에 맞는 공격/방어/지원 행동을 1턴에 1회 이상 구체적으로 묘사하라(예: "○○가 검을 휘둘러 적의 측면을 베었다").
    - 전투 슬롯: 아군(동료+소환수) 최대 3명·적 최대 3명이 동시 전투. 부상 이탈 시 후방 대기 중인 자가 자동으로 슬롯을 채운다.
    - 아군 부상: P 피격: 동료·소환수도 적의 공격을 실제로 받아 HP가 깎일 수 있다. 피해를 입으면 반드시 <gs>의 party_damage 또는 summon_damage 필드로 수치를 출력하라. HP가 0에 도달했을 때 판단 기준(자동): party_damage로 HP가 0에 도달하면 시스템이 그 즉시 자동으로 사망/부상 확률을 판정한다(동료 30% 사망·70% 부상이탈, 소환수 50% 소멸·50% 이탈, 이미 부상 상태에서 재피격이면 사망 확률 2배) — party_incap을 별도로 출력할 필요가 없다. 즉사(독·저주·즉사기)처럼 확정적으로 죽여야 하는 특수한 경우에만 party_incap에 dead:true를 추가해 강제 처리하라. 서사에서는 '쓰러졌다'·'피를 흘리며 무너졌다' 수준만 묘사하고 생사를 확정하지 말라 — 시스템이 결정한다. 형식: party_incap:[{"name":"동료이름","reason":"부상 이유","turns":회복까지턴수}], summon_incap도 동일. 전투불능은 쓰러져 있지만 살아있으므로 시체처럼 묘사하지 말고, 의식이 흐릿하거나 부상으로 움직이지 못하는 상태로 묘사하라. 동료의 사망은 가볍게 다루지 말고 서사적 비중을 두어 묘사하라. 적 HP 점진 감소(매우 중요): 보스·네임드·강적처럼 이름으로 개별 추적되는 적이 일반 공격으로 피해를 입으면(즉사·필살이 아닌 보통의 타격), 매 턴 enemy_damage:[{"name":"적이름","dmg":피해량}]을 출력해 그 적의 HP를 실제로 깎아라 — 이게 빠지면 보스 체력이 전투 내내 100%로 보이다가 enemy_incap이 떴을 때 갑자기 0%로 뛰는 부자연스러운 흐름이 된다. 피해량은 그 적의 전체 HP 대비 묘사의 강도에 맞게 합리적으로(약한 타격 5~10%, 강한 타격 15~25% 등) 산정하라. [🔥 속성 데미지 배율 규칙] 몬스터 정보에 element(속성)·weakElement(약점)·resistElement(저항)가 안내되어 있으면, 플레이어의 공격 수단(무기·마법·스킬)에 어울리는 속성을 element 필드에 함께 출력하라(fire/water/earth/wind/light/dark/lightning/ice/physical/magic/poison/time 중 하나) — 안내된 weakElement와 정확히 일치하는 속성으로 공격하면 시스템이 자동으로 데미지를 2배로 올리고, resistElement와 일치하면 0.4배로 낮춘다. 이 배율은 시스템이 직접 계산해 실제 HP에 반영하므로, dmg 필드에는 배율을 적용하기 전의 기본 피해량만 적으면 된다(배율 계산 후 실제로 얼마나 깎였는지는 시스템이 토스트로 알려준다). element를 생략하면 물리(physical) 공격으로 취급되어 상성 없이 그대로 적용된다. 적 HP 0 처리(자동): 적의 HP가 enemy_damage로 0에 도달하면 시스템이 그 즉시 자동으로 사망/부상 확률을 판정한다(보스 25%·네임드 40%·잡몹 60% 사망, 나머지는 부상 이탈) — enemy_incap을 별도로 출력할 필요가 없다. 서사에서는 결과를 미리 확정하지 말고 \'쓰러졌다\' \'휘청거린다\' 수준으로만 묘사하라. 즉사(독·저주·즉사기·압도적 피해)처럼 확정적으로 죽여야 하는 특수한 경우에만 enemy_incap:[{\"name\":\"이름\",\"reason\":\"이유\",\"dead\":true}]를 출력해 강제 사망시켜라(이 경우는 부활 판정도 건너뛴다). [🌑 적 부활 규칙] 언데드·불사 계열(구울/좀비/리치/미라/스켈레톤/뱀파이어 등 이름에 해당 단어가 포함되는 몬스터) 및 dark 속성 몬스터는 사망/부상 판정 직후 시스템이 자동으로 낮은 확률(언데드 35%, dark 속성 15%)로 부활을 시도한다 — 별도 GS 출력 불필요, 완전히 로컬 판정이다. 만약 서사에서 특정 아이템(부활의 인장 등)이나 스킬로 평범한 몬스터에게 특별히 부활 능력을 부여하는 사건이 발생하면, <gs>{\\"enemy_revival_grant\\":{\\"name\\":\\"적이름\\",\\"chance\\":0.3}}</gs>를 출력해 그 개체에 한해 부활 확률을 부여할 수 있다 (chance는 0~1 사이, 생략하면 기본값 사용 안 함). 포로 획득: 플레이어가 적을 포로로 잡는 서사가 나오면 enemy_captured:[{"name":"적이름","role":"역할","faction":"소속","desc":"특징"}]를 출력하라. 포로는 심문·회유·영입·처형·석방이 가능하다. 포로와 대화 시 prisoner_update:{"name":"이름","condition":"cooperative/defiant/broken","canRecruit":true/false}로 상태를 갱신하라. 적대 전환 등록(매우 중요): 원래 적이 아니었던 기존 NPC(호위·관리자·우연히 만난 고위 인사 등)가 전투 상대가 되면 — 플레이어가 먼저 시비를 걸거나 싸움을 건 경우도 포함 — 반드시 <gs>{\"npc_turns_hostile\":[{\"name\":\"NPC명\",\"reason\":\"적대로 전환된 이유\"}]}</gs>를 출력하라. 이게 출력되어야만 시스템이 그 NPC를 신분·역할에 따른 고정 절대 레벨(평민 Lv.5~20 / 신병~이등병 Lv.12~22 / 하사~상사 Lv.25~48 / 소위~대위 Lv.35~60 / 소령~대령 Lv.52~80 / 장군·기사단장 Lv.72~98 / 원수 Lv.90~110 / 기사 Lv.45~60 / 왕·황제 Lv.90~120)로 전투 상대에 정식 등록한다 — 이걸 빠뜨리면 그 NPC는 숫자상 HP가 전혀 없는 상태로 서사만 진행되어, 아무리 강하게 공격해도 실제로는 전혀 약해지지 않는 오류가 생긴다. 대주교·귀족·기사단장 같은 고위 인사라도 전투가 성립되면 반드시 이 필드를 출력해야 한다.
    - 스킬 사용: 동료·소환수가 자신의 uniqueSkill(고유 스킬)을 발동시키는 장면을 전투 흐름에 맞춰 가끔 연출하고, 발동 시 skill_use 필드로 알려라.
    - 협동 공격(콤보): 동료/소환수와 함께 협동하는 공격이 성사되면(예: "동료가 다리를 묶는 사이 주인공이 마무리한다", "소환수가 시선을 끄는 틈에 빈틈을 찌른다") <gs>{"combo_attack":{"target":"적이름","ally":"협동한 동료/소환수 이름"}}</gs>를 출력하라 — 시스템이 추가 피해를 보장해 협동이 실질적으로 더 강력한 선택임을 체감시킨다. 단순히 "동료도 함께 싸운다" 정도의 평범한 묘사가 아니라, 두 행동이 명확히 맞물려 하나의 결정적 타격을 만들어낼 때만 출력하라.
    - 명령 체계: 플레이어가 "○○야 ~해" 같은 명령을 내릴 수 있는 대상은 소환수뿐이다(소환수는 주인의 의지에 종속됨). 동료(파티원)는 독립된 인격체이므로 플레이어의 명령을 그대로 따르지 않으며, 자기 판단과 성격에 따라 행동하거나 거부/반박할 수 있다. 다만 동료가 자발적으로 협력하는 것은 자연스럽게 묘사하라.
    - 출력 형식: <gs>{"betrayal":"배신한NPC명","betrayed_by":"배신한NPC명","mental_corruption":true,"meta_knowledge":"발견한비밀","party_damage":[{"name":"동료이름"}],"party_incap":[{"name":"동료이름","reason":"부상","turns":2}],"party_death":["동료이름"],"summon_incap":[{"name":"소환수이름","turns":3}],"summon_damage":[{"name":"소환수이름"}],"summon_add":[{"name":"소환수명","icon":"💀","category":"undead","origin":"시체 부활","desc":"설명","skill":"고유스킬명","skillDesc":"스킬설명","hp":120,"atk":25,"def":10,"loyalty":80}],"summon_dismiss":["소환수명"],"summon_death":["소환수이름"],"skill_use":[{"name":"이름","skill":"스킬명"}]}</gs> — 해당 없으면 필드 생략. party_damage/summon_damage는 name만 지정하면 된다(dmg 숫자는 시스템이 자동 계산하므로 넣지 않아도 무시됨).
    - 출력량 제한: 한 턴에 실제로 의미 있는 변화(피해/사망/스킬 발동)가 일어난 대상만 출력하라. 보통 한 턴에 2~3건 이내로 충분하다. 모든 동료·소환수·적을 매번 빠짐없이 나열하려 하지 말고, 서사상 핵심적인 사건만 정확히 출력하라.
${isCivilianJob ? `
■ 비전투 직업 전용 규칙 [${char.role}]
20. 이 캐릭터는 생활 직업(비전투 직종)이다.
    【일반 상황】
    - 거래·설득·제작·치유·예술 등 직업 행동을 중심으로 서사 전개
    - NPC와의 깊은 유대, 신뢰를 쌓는 과정을 강조
    - 마을·도시·시장·작업장 등 생활 공간 에피소드를 풍부하게 묘사
    - 직업 행동 성공 시 직업적 성취감 묘사:
      농부: "손에 밴 흙냄새가 나는 손이 씨앗을 고른다"
      상인: "상인의 눈이 가격을 즉시 계산해냈다"
      대장장이: "장인의 망치질이 금속을 노래하게 했다"
      음유시인: "노래 한 구절이 분위기를 단숨에 바꿨다"
      치유사: "따뜻한 손길이 상처 위에 빛을 불렀다"
    【전투 상황 — 싸움이 불가피할 때】
    - 전투 자체는 가능하나, 먼저 싸움을 피하거나 대화·도주·협상 선택지를 반드시 먼저 제공
    - 어쩔 수 없이 싸울 때: 이 캐릭터답게 묘사
      농부: 농기구(낫·삽)로 버티는 거친 몸싸움, 세련되지 않지만 강인함
      상인: 상황을 계산하며 빠져나갈 틈을 노리는 영리한 자위
      대장장이: 단련된 팔로 버티는 육탄전, 무기보다 몸이 무기
      음유시인: 기지와 말로 상황을 비트는 도망 위주의 대처
      치유사: 마지막 수단으로만 싸우며, 쓰러진 후 치유부터 시도
    - 방어·도망·협상으로 해결하면 "역시 싸움보다 대화가 낫다" 식의 캐릭터 철학 묘사
    - 이 직업의 고유 엔딩(대지의 수호자/황금 상단의 전설 등)은 전투를 주도적으로 즐기지 않아야 달성 가능함을 서사 흐름으로 자연스럽게 암시
` : ''}` + buildFactionWarContext();
}
window.buildLightSystem = buildLightSystem;
}

