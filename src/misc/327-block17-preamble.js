// block17-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { calcDamage } from '../combat/210-7-전투-시스템.js';
import { ALL_CONTINENTS } from '../data/054-이동수단-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { UNIFIED_FAME_LEVELS } from '../data/286-6-평판명성-통합-시스템.js';
import { loadInventory, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { getCurrentFactions } from '../npc/067-③-NPC-관계망-시스템.js';
import { getUnifiedFameLevel } from '../npc/286-6-평판명성-통합-시스템.js';
import { closeP } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadReputation, updateReputation } from './054-이동수단-시스템.js';
import { gainEvoEnergy } from './206-3-진화Evolution-시스템.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_294(){
(function(){

const RAID_KEY = 'tf-world-raid';

// ── 전투 패널 DOM 마크업 동적 삽입 (기존 panel-ov 구조 재사용) ──
(function injectRaidBattlePanelMarkup(){
  function doInject(){
    if(document.getElementById('p-world-raid-battle')) return;
    const div = document.createElement('div');
    div.className = 'panel-ov';
    div.id = 'p-world-raid-battle';
    div.innerHTML = `<div class="panel">
      <div class="p-hdr" style="background:linear-gradient(135deg,#1a0a00,#2a1400);border-bottom:1px solid #c8a040">
        <span class="p-title" style="color:#e0a050">🐉 월드 레이드</span>
        <button class="p-close" onclick="closeWorldRaidBattlePanel()">✕</button>
      </div>
      <div class="p-body scrollable" id="pb-world-raid-battle"></div>
    </div>`;
    document.body.appendChild(div);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', doInject);
  } else {
    doInject();
  }
})();

// ── 대륙별 레이드 보스 정의 (대륙 id는 ALL_CONTINENTS 기준) ──
const RAID_BOSS_POOL = {
  central: [
    { id:'rb_ironclad_wyrm', name:'강철비늘 대사룡', icon:'🐉',
      svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/><path d="M8 6 L6.5 3 M8 6 L9.5 3.5" stroke-width="1.2"/></svg>',
      color:'#c8a96e', maxHp:2600, atk:62, def:28,
      desc:'왕도 근교 고성에 잠들어 있던 고룡이 깨어나 국경을 위협하고 있다.',
      rewardPool:['runic_blade_c','dragon_armor_c'] },
  ],
  north: [
    { id:'rb_frost_giant_king', name:'서리거인 왕', icon:'❄️',
      svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 22 M4 7 L20 17 M20 7 L4 17"/></svg>',
      color:'#6aace8', maxHp:2200, atk:58, def:34,
      desc:'빙결 산맥 깊은 곳에서 거인 왕이 부족을 이끌고 남하하기 시작했다.',
      rewardPool:['frost_axe_c'] },
  ],
  east: [
    { id:'rb_magma_behemoth', name:'용암 베히모스', icon:'🌋',
      svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/></svg>',
      color:'#e85a30', maxHp:2800, atk:66, def:24,
      desc:'화산맥 심연에서 거대한 용암 짐승이 기어나와 마을들을 불태우고 있다.',
      rewardPool:['flame_greatsword_c'] },
  ],
  west: [
    { id:'rb_kraken', name:'심해의 크라켄', icon:'🐙',
      svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M7 13 C6 16 4 17 3 20 M9 14 C8.5 17 7 19 6 21 M12 14 L12 21 M15 14 C15.5 17 17 19 18 21 M17 13 C18 16 20 17 21 20" stroke-width="1.2"/></svg>',
      color:'#2a5a8a', maxHp:2400, atk:60, def:22,
      desc:'무역항 인근 해역에 거대한 크라켄이 출몰해 선박들을 침몰시키고 있다.',
      rewardPool:['leviathan_trident_c'] },
  ],
  south: [
    { id:'rb_sand_pharaoh', name:'각성한 모래 파라오', icon:'☀️',
      svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2 L12 4.5 M12 19.5 L12 22 M2 12 L4.5 12 M19.5 12 L22 12 M5.1 5.1 L6.8 6.8 M17.2 17.2 L18.9 18.9 M18.9 5.1 L17.2 6.8 M6.8 17.2 L5.1 18.9"/></svg>',
      color:'#e8a050', maxHp:2500, atk:60, def:30,
      desc:'봉인된 고대 신전이 무너지며 미라 파라오가 군세를 일으켜 부활했다.',
      rewardPool:['sun_scepter_c'] },
  ],
  northeast: [
    { id:'rb_corrupted_treant', name:'타락한 세계수 정령', icon:'🌳',
      svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 11" /><path d="M12 11 C7 11 4 8 4 4 C8 4 11 6 12 9 C13 6 16 4 20 4 C20 8 17 11 12 11 Z" stroke-linejoin="round"/></svg>',
      color:'#70c878', maxHp:2300, atk:56, def:32,
      desc:'세계수 뿌리 깊은 곳이 병들어 정령이 타락한 채로 숲을 휩쓸고 있다.',
      rewardPool:['worldroot_staff_c'] },
  ],
  southeast: [
    { id:'rb_abyss_leviathan', name:'테네브라 해구의 심연괴수', icon:'🌊',
      svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 C2 12 5 9 8 12 C11 15 13 12 16 12 C19 12 22 9 22 9 M2 17 C2 17 5 14 8 17 C11 20 13 17 16 17 C19 17 22 14 22 14" stroke-width="1.4"/></svg>',
      color:'#3060a0', maxHp:2700, atk:64, def:26,
      desc:'봉인이 흔들리며 심연에서 태고의 괴수가 수면 위로 떠오르고 있다.',
      rewardPool:['abyssal_harpoon_c'] },
  ],
  northwest: [
    { id:'rb_rogue_colossus', name:'폭주한 고대 기계 거신', icon:'⚙️',
      svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12 M5.5 5.5 L7.5 7.5 M16.5 16.5 L18.5 18.5 M18.5 5.5 L16.5 7.5 M7.5 16.5 L5.5 18.5" stroke-width="1.2"/></svg>',
      color:'#a07848', maxHp:2900, atk:68, def:36,
      desc:'지하 왕국 심층부의 고대 기계 신전에서 거대 골렘이 폭주하며 깨어났다.',
      rewardPool:['gearheart_hammer_c'] },
  ],
};

// 레이드 보상 완성 아이템 풀 (설계도 아님 — 직접 지급용)
const RAID_REWARD_ITEMS = {
  runic_blade_c:      { id:'runic_blade_c',      name:'룬 블레이드',        icon:'🔱', type:'equip', slot:'weapon', rarity:'epic',      effects:{str:35,mgc:25,crit:22,int:15}, desc:'룬 문자가 새겨진 신성한 검. 마법과 물리를 동시에.' },
  dragon_armor_c:      { id:'dragon_armor_c',     name:'드래곤 갑옷',        icon:'🐲', type:'equip', slot:'armor',  rarity:'epic',      effects:{end:32,str:18,hp:60},          desc:'고룡의 비늘로 벼린 갑옷. 화염 저항이 매우 높다.' },
  frost_axe_c:         { id:'frost_axe_c',        name:'서리거인의 대도끼',  icon:'❄️', type:'equip', slot:'weapon', rarity:'epic',      effects:{str:38,end:15,crit:18},        desc:'거인 왕의 무기. 적중 시 상대의 속도를 늦춘다.' },
  flame_greatsword_c:  { id:'flame_greatsword_c', name:'용암 대검',          icon:'🔥', type:'equip', slot:'weapon', rarity:'epic',      effects:{str:40,mgc:20,crit:15},         desc:'베히모스의 심장에서 뽑아낸 열기를 가둔 대검.' },
  leviathan_trident_c: { id:'leviathan_trident_c',name:'크라켄의 삼지창',    icon:'🔱', type:'equip', slot:'weapon', rarity:'epic',      effects:{str:30,agi:20,per:15},          desc:'심해의 압력을 견딘 삼지창. 수중 전투에 특화.' },
  sun_scepter_c:       { id:'sun_scepter_c',      name:'태양왕의 홀',        icon:'☀️', type:'equip', slot:'weapon', rarity:'legendary', effects:{mgc:42,wil:22,fath:18,hp:30},   desc:'파라오의 권능이 깃든 지팡이. 태양 마법을 증폭한다.' },
  worldroot_staff_c:   { id:'worldroot_staff_c',  name:'세계수 뿌리 지팡이', icon:'🌿', type:'equip', slot:'weapon', rarity:'epic',      effects:{mgc:32,wil:18,mp:40},           desc:'정령을 정화하고 남은 세계수의 힘이 깃들었다.' },
  abyssal_harpoon_c:   { id:'abyssal_harpoon_c',  name:'심연의 작살',        icon:'🌑', type:'equip', slot:'weapon', rarity:'legendary', effects:{str:36,fear:20,crit:24},        desc:'심연괴수의 뼈를 벼린 작살. 닿는 것을 얼어붙게 한다.' },
  gearheart_hammer_c:  { id:'gearheart_hammer_c', name:'기어하트의 망치',    icon:'⚙️', type:'equip', slot:'weapon', rarity:'legendary', effects:{str:44,end:20,crit:16,hp:40},   desc:'폭주한 거신의 핵을 부수고 얻은 전리품. 파괴력이 압도적이다.' },
};
window.RAID_REWARD_ITEMS = RAID_REWARD_ITEMS;

// 참전 자격: 명성 레벨(UNIFIED_FAME_LEVELS) 인덱스 기준 최소치
const RAID_MIN_FAME_INDEX = 2; // 0=무명인,1=신진,2=유명인 이상부터 참전 가능

// ── 저장/로드 ──
function loadWorldRaid(){
  try{ return JSON.parse(lsGet(RAID_KEY)||'null') || { active:null, log:[], lastCheckTurn:0, nextCheckTurn: 15+Math.floor(Math.random()*10) }; }
  catch(e){ return { active:null, log:[], lastCheckTurn:0, nextCheckTurn: 20 }; }
}
function saveWorldRaid(d){ try{ lsSet(RAID_KEY, JSON.stringify(d)); }catch(e){} }
window.loadWorldRaid = loadWorldRaid;
window.saveWorldRaid = saveWorldRaid;

function getRaidContinentLabel(cid){
  const map = { central:'중앙', north:'북', east:'동', west:'서', south:'남', northeast:'북동', southeast:'남동', northwest:'북서' };
  return map[cid] || cid;
}

// ── 참전 세력 배정 (해당 대륙과 무관하게 현재 시나리오 세력 중 2~3개 무작위, 서로 라이벌이면 충돌) ──
function assignRaidFactions(){
  try{
    const factions = typeof getCurrentFactions==='function' ? getCurrentFactions() : {};
    const names = Object.keys(factions);
    if(!names.length) return [];
    const shuffled = [...names].sort(()=>Math.random()-0.5);
    const picked = shuffled.slice(0, 2 + (Math.random()<0.5?1:0));
    return picked.map(n=>({
      name:n,
      power: 40 + Math.floor(Math.random()*40), // 세력별 화력치
      hp: 100, // 상대 세력과 충돌 시 소모되는 체력 (0 되면 이탈)
      isRival: false,
    })).map((entry, i, arr)=>{
      // 라이벌 관계 체크
      const def = factions[entry.name];
      const rivals = def?.rivals || [];
      entry.isRival = arr.some((o,j)=> j!==i && rivals.includes(o.name));
      return entry;
    });
  }catch(e){ return []; }
}

// ── 레이드 발생 체크 (매 턴 tickGameTime 훅에서 호출) ──
function checkWorldRaidTrigger(){
  try{
    const rd = loadWorldRaid();
    if(rd.active) return; // 이미 진행 중이면 새로 발생 안 함
    if(!S.msgCount || S.msgCount < rd.nextCheckTurn) return;

    rd.lastCheckTurn = S.msgCount;
    rd.nextCheckTurn = S.msgCount + 15 + Math.floor(Math.random()*11); // 다음 체크는 15~25턴 뒤

    if(Math.random() < 0.4){ // 40% 확률로 실제 발생
      const cid = ALL_CONTINENTS[Math.floor(Math.random()*ALL_CONTINENTS.length)];
      const pool = RAID_BOSS_POOL[cid];
      if(pool && pool.length){
        const bossDef = pool[Math.floor(Math.random()*pool.length)];
        const factions = assignRaidFactions();
        rd.active = {
          bossId: bossDef.id,
          continent: cid,
          hp: bossDef.maxHp,
          maxHp: bossDef.maxHp,
          startTurn: S.msgCount,
          expireTurn: S.msgCount + 30 + Math.floor(Math.random()*16), // 30~45턴 내 미해결 시 자동 소멸
          heard: false,
          factions,
          log: [`${bossDef.name}(이)가 ${getRaidContinentLabel(cid)}대륙에 출현했다.`],
        };
        rd.log.unshift({ turn:S.msgCount, text:`[레이드 발생] ${bossDef.name} — ${getRaidContinentLabel(cid)}대륙 (미확인)` });
        rd.log = rd.log.slice(0,30);
      }
    }
    saveWorldRaid(rd);
  }catch(e){}
}

// ── 매 턴 진행 처리: 참전 세력들이 자동으로 보스 HP를 깎고, 서로 충돌하는 세력은 화력 손실 ──
function tickWorldRaidProgress(){
  try{
    // 플레이어가 지금 이 레이드에 직접 참전해 전투 패널을 진행 중이면,
    // 백그라운드 자동 진행(세력 화력 누적, 자동 소멸)을 건너뛴다.
    // 그렇지 않으면 전투 도중 메인 채팅 메시지 한 번에 레이드가
    // 갑자기 종료되어 전투 상태가 붕 떠버리는 문제가 생긴다.
    if(window.RAID_BATTLE_STATE && window.RAID_BATTLE_STATE.active) return;

    const rd = loadWorldRaid();
    if(!rd.active) return;
    const raid = rd.active;
    const bossDef = getRaidBossDef(raid.bossId);
    if(!bossDef) return;

    // 자동 소멸 체크 (플레이어 미참여 시 다른 세력이 처치)
    if(S.msgCount >= raid.expireTurn){
      rd.log.unshift({ turn:S.msgCount, text:`[레이드 종료] ${bossDef.name}은(는) 다른 세력들에 의해 토벌되었다. (참여하지 않음)` });
      rd.log = rd.log.slice(0,30);
      rd.active = null;
      saveWorldRaid(rd);
      return;
    }

    // 참전 세력 간 충돌 처리 (라이벌끼리는 서로 화력 일부 소모)
    let totalFactionDmg = 0;
    raid.factions.forEach(f=>{
      if(f.hp <= 0) return;
      totalFactionDmg += Math.round(f.power * 0.5); // 세력 자체 화력의 절반이 매 턴 보스에게 누적 피해
    });
    raid.factions.forEach(f=>{
      if(!f.isRival || f.hp<=0) return;
      // 라이벌 세력끼리는 서로를 공격해 화력 손실 (내분)
      f.hp = Math.max(0, f.hp - 8);
    });

    raid.hp = Math.max(0, raid.hp - totalFactionDmg);
    if(raid.hp <= 0){
      rd.log.unshift({ turn:S.msgCount, text:`[레이드 종료] ${bossDef.name}은(는) 참전 세력들의 손에 쓰러졌다. (참여하지 않음)` });
      rd.log = rd.log.slice(0,30);
      rd.active = null;
    }
    saveWorldRaid(rd);
  }catch(e){}
}

// ── 소식 습득 확률 체크: 게시판 방문 시 호출 ──
function tryHearRaidRumorAtBulletin(){
  try{
    const rd = loadWorldRaid();
    if(!rd.active || rd.active.heard) return false;
    if(Math.random() < 0.35){
      rd.active.heard = true;
      const bossDef = getRaidBossDef(rd.active.bossId);
      rd.log.unshift({ turn:S.msgCount||0, text:`[소문 입수] 게시판에서 ${bossDef?bossDef.name:'레이드 몬스터'} 소식을 들었다.` });
      rd.log = rd.log.slice(0,30);
      saveWorldRaid(rd);
      toast(`📋 게시판에서 심상치 않은 소문을 들었다...`, 3000);
      return true;
    }
  }catch(e){}
  return false;
}
window.tryHearRaidRumorAtBulletin = tryHearRaidRumorAtBulletin;

// ── 소식 습득 확률 체크: AI 서사(대화) 중 호출 — 힌트만 주입, 실제 해금은 AI 응답 후 별도 확률 처리 ──
function injectRaidRumorHint(){
  try{
    const rd = loadWorldRaid();
    if(!rd.active || rd.active.heard) return;
    if(Math.random() < 0.12){ // 대화 중엔 확률을 낮게 (게시판보다 우연성 강조)
      const bossDef = getRaidBossDef(rd.active.bossId);
      if(!bossDef) return;
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        `\n[선택적 연출: 이번 응답에서 주인공이 지나가는 대화나 소문을 통해 "${getRaidContinentLabel(rd.active.continent)}대륙에 ${bossDef.name}이라는 위협적인 존재가 나타났다"는 이야기를 자연스럽게 들을 수 있다. 필수는 아니며, 장면에 어울릴 때만 자연스럽게 포함하라.]`;
      S._raidRumorPending = true;
    }
  }catch(e){}
}
window.injectRaidRumorHint = injectRaidRumorHint;

function resolveRaidRumorAfterAI(){
  try{
    if(!S._raidRumorPending) return;
    S._raidRumorPending = false;
    const rd = loadWorldRaid();
    if(!rd.active || rd.active.heard) return;
    if(Math.random() < 0.5){ // 힌트가 주입된 턴의 50% 확률로 실제 해금
      rd.active.heard = true;
      const bossDef = getRaidBossDef(rd.active.bossId);
      rd.log.unshift({ turn:S.msgCount||0, text:`[소문 입수] 대화 중 ${bossDef?bossDef.name:'레이드 몬스터'} 소식을 들었다.` });
      rd.log = rd.log.slice(0,30);
      saveWorldRaid(rd);
      toast(`💬 심상치 않은 소문을 들었다...`, 3000);
    }
  }catch(e){}
}
window.resolveRaidRumorAfterAI = resolveRaidRumorAfterAI;

function getRaidBossDef(bossId){
  for(const cid in RAID_BOSS_POOL){
    const found = RAID_BOSS_POOL[cid].find(b=>b.id===bossId);
    if(found) return found;
  }
  return null;
}
window.getRaidBossDef = getRaidBossDef;

// ── 참전 자격 확인 ──
function canJoinWorldRaid(){
  try{
    const fameScore = (typeof loadReputation==='function' ? loadReputation() : {score:0}).score || 0;
    const fameLevel = typeof getUnifiedFameLevel==='function' ? getUnifiedFameLevel(fameScore) : null;
    const fameIdx = fameLevel ? UNIFIED_FAME_LEVELS.indexOf(fameLevel) : 0;
    return fameIdx >= RAID_MIN_FAME_INDEX;
  }catch(e){ return false; }
}
window.canJoinWorldRaid = canJoinWorldRaid;

// ── 전투 참여: 기존 턴제 calcDamage를 사용하되, 참전 세력 화력을 합산 가중치로 반영 ──
function joinWorldRaidBattle(){
  // 일반 몬스터와의 로컬 전투가 이미 진행 중이면 레이드 전투를 동시에
  // 시작할 수 없다 — 두 전투 시스템이 동시에 플레이어 HP를 조작하면
  // 상태가 어긋난다. 먼저 진행 중인 전투를 끝내도록 안내한다.
  try{
    const _lc = typeof loadLocalCombat==='function' ? loadLocalCombat() : null;
    if(_lc && _lc.active){
      toast('⚔️ 이미 다른 전투가 진행 중입니다. 먼저 그 전투를 마무리하세요.', 3000);
      if(typeof window.openP==='function') window.openP('local-combat');
      if(typeof renderLocalCombatPanel==='function') renderLocalCombatPanel();
      return;
    }
  }catch(e){}

  const rd = loadWorldRaid();
  if(!rd.active){ toast('현재 활성화된 레이드가 없습니다.'); return; }
  if(!rd.active.heard){ toast('아직 이 레이드에 대한 소식을 듣지 못했습니다.'); return; }
  if(!canJoinWorldRaid()){ toast('🔒 참전하기엔 아직 명성이 부족합니다.'); return; }
  const bossDef = getRaidBossDef(rd.active.bossId);
  if(!bossDef) return;

  // 플레이어 참여 시작 상태 설정
  window.RAID_BATTLE_STATE = {
    active: true,
    bossId: bossDef.id,
    bossName: bossDef.name,
    bossMaxHp: rd.active.maxHp,
    hp: rd.active.hp, // 이미 참전 세력들이 깎아놓은 체력에서 시작
    def: bossDef.def,
    atk: bossDef.atk,
    turn: 0,
    log: [],
  };
  renderWorldRaidBattlePanel();
}
window.joinWorldRaidBattle = joinWorldRaidBattle;

function processWorldRaidTurn(action='attack'){
  const bs = window.RAID_BATTLE_STATE;
  if(!bs || !bs.active) return;
  bs.turn++;

  const player = { str: (S?.stats?.str||50), hp: S?.stats?.hp||100 };
  const enemy = { def: bs.def, hp: bs.hp, name: bs.bossName };

  // 이번 턴 참전 세력 지원 화력 (라이벌 충돌로 죽지 않은 세력만)
  const rd = loadWorldRaid();
  let allySupportDmg = 0;
  if(rd.active){
    rd.active.factions.forEach(f=>{ if(f.hp>0) allySupportDmg += Math.round(f.power*0.15); });
  }

  if(action==='attack'){
    const pAtk = calcDamage(player, enemy);
    const totalDmg = pAtk.dmg + allySupportDmg;
    bs.hp = Math.max(0, bs.hp - totalDmg);
    bs.log.unshift(`플레이어+참전세력 → ${bs.bossName}: ${totalDmg} 피해 (본인 ${pAtk.dmg}${pAtk.crit?' 크리!':''} + 세력지원 ${allySupportDmg})`);
  } else if(action==='defend'){
    bs.log.unshift(`플레이어가 방어 태세를 취했다.`);
  }

  if(bs.hp <= 0){
    finishWorldRaidBattle(true);
    return;
  }

  // 보스 반격 (방어 시 피해 절반)
  const eAtk = calcDamage({str:bs.atk}, {def: S?.stats?.end||0});
  const dmgToPlayer = action==='defend' ? Math.round(eAtk.dmg*0.5) : eAtk.dmg;
  if(S?.stats) S.stats.hp = Math.max(0, (S.stats.hp||100) - dmgToPlayer);
  bs.log.unshift(`${bs.bossName} → 플레이어: ${dmgToPlayer} 피해`);
  if(typeof window.updateHeader==='function') window.updateHeader();

  if((S?.stats?.hp||0) <= 0){
    finishWorldRaidBattle(false);
    return;
  }

  // 레이드 전역 상태에도 반영 (다른 곳에서 참조 가능하도록)
  if(rd.active){ rd.active.hp = bs.hp; saveWorldRaid(rd); }

  renderWorldRaidBattlePanel();
}
window.processWorldRaidTurn = processWorldRaidTurn;

function finishWorldRaidBattle(victory){
  const bs = window.RAID_BATTLE_STATE;
  const rd = loadWorldRaid();
  bs.active = false;

  if(victory){
    const bossDef = getRaidBossDef(bs.bossId);
    const rewardIds = bossDef?.rewardPool || [];
    const rewardId = rewardIds[Math.floor(Math.random()*rewardIds.length)];
    const rewardItem = RAID_REWARD_ITEMS[rewardId];
    if(rewardItem){
      const inv = typeof loadInventory==='function' ? loadInventory() : (S.inventory||[]);
      inv.push({ ...rewardItem });
      if(typeof saveInventory==='function') saveInventory(inv);
      S.inventory = inv;
    }
    toast(`🏆 레이드 승리! ${bossDef?bossDef.name:'몬스터'} 처치 — ${rewardItem?rewardItem.name:'보상'} 획득!`, 4500);
    if(rd.active){
      rd.log.unshift({ turn:S.msgCount||0, text:`[레이드 클리어] 플레이어가 직접 ${bossDef?bossDef.name:''}을(를) 처치했다! 보상: ${rewardItem?rewardItem.name:'?'}` });
      rd.log = rd.log.slice(0,30);
    }
    if(typeof gainEvoEnergy==='function') gainEvoEnergy(40, '레이드 승리');
    if(typeof updateReputation==='function') updateReputation(15);
  } else {
    // HP 0인 채로 방치하면 메인 게임 루프의 사망/체포 판정과 충돌하는
    // 애매한 상태가 되므로, 참전 세력에게 구조된 것으로 처리해 최소
    // HP로 되살려 정상적으로 게임을 이어갈 수 있게 한다.
    if(S?.stats){ S.stats.hp = Math.max(1, Math.round((S.stats.maxHp||100)*0.15)); }
    if(typeof window.updateHeader==='function') window.updateHeader();
    toast(`💀 레이드 전투에서 패배했다... 참전 세력에게 구조되어 겨우 후퇴했다.`, 4500);
    if(rd.active){
      rd.log.unshift({ turn:S.msgCount||0, text:`[레이드 실패] 플레이어가 전투에서 패배해 참전 세력에게 구조된 채 후퇴했다.` });
      rd.log = rd.log.slice(0,30);
    }
  }
  rd.active = null; // 승패 무관 종료 (패배 시 다음 재도전은 새 레이드로)
  saveWorldRaid(rd);
  window.RAID_BATTLE_STATE = null;
  renderWorldRaidBattlePanel();
}

// ── 전투 패널 렌더링 ──
// 전투 패널을 닫을 때 안전 처리 — 전투가 아직 진행 중(active)인 상태로
// 그냥 닫아버리면 RAID_BATTLE_STATE.active가 true로 영구히 남아
// tickWorldRaidProgress의 동시성 가드에 걸려 그 레이드가 다시는
// 자동 진행되지 않는 "좀비 상태"가 된다. 닫을 때 이탈로 안전 처리해
// 백그라운드 진행(세력 자동 토벌 등)이 재개되도록 한다.
function closeWorldRaidBattlePanel(){
  const bs = window.RAID_BATTLE_STATE;
  if(bs && bs.active){
    bs.active = false;
    toast('전장에서 이탈했다. 이후 상황은 참전 세력들에게 맡겨졌다.', 3000);
    const rd = loadWorldRaid();
    if(rd.active){
      rd.active.hp = bs.hp; // 지금까지 입힌 피해는 유지
      rd.log.unshift({ turn:S.msgCount||0, text:`플레이어가 전장에서 이탈했다. 참전 세력들이 계속 싸운다.` });
      rd.log = rd.log.slice(0,30);
      saveWorldRaid(rd);
    }
    window.RAID_BATTLE_STATE = null;
  }
  closeP('world-raid-battle');
}
window.closeWorldRaidBattlePanel = closeWorldRaidBattlePanel;

function renderWorldRaidBattlePanel(){
  const body = document.getElementById('pb-world-raid-battle');
  if(!body) return;
  const bs = window.RAID_BATTLE_STATE;

  if(!bs){
    body.innerHTML = `<div style="padding:20px;text-align:center;color:var(--dim);font-size:11px">진행 중인 레이드 전투가 없습니다.</div>`;
    return;
  }

  const hpPct = Math.max(0, Math.round((bs.hp/bs.bossMaxHp)*100));
  body.innerHTML = `
    <div style="padding:12px">
      <div style="font-family:'Cinzel',serif;font-size:13px;color:var(--gold);margin-bottom:6px">${esc(bs.bossName)}</div>
      <div style="height:10px;background:#1a0a0a;border-radius:4px;overflow:hidden;margin-bottom:4px">
        <div style="width:${hpPct}%;height:100%;background:linear-gradient(90deg,#e05030,#c8a040);transition:width .4s"></div>
      </div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:12px">HP ${bs.hp} / ${bs.bossMaxHp} (${hpPct}%)</div>
      ${bs.active ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
        <button onclick="processWorldRaidTurn('attack')" style="padding:9px;background:#1a0a00;border:1px solid #a04020;color:#e08050;font-family:'Cinzel',serif;font-size:10px;cursor:pointer">⚔️ 공격</button>
        <button onclick="processWorldRaidTurn('defend')" style="padding:9px;background:#0a0a1a;border:1px solid #204080;color:#5090e0;font-family:'Cinzel',serif;font-size:10px;cursor:pointer">🛡️ 방어</button>
      </div>` : `<div style="text-align:center;font-size:10px;color:var(--dim);margin-bottom:10px">전투가 종료되었습니다.</div>`}
      <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">── 전투 로그 ──</div>
      <div style="max-height:180px;overflow-y:auto">
        ${bs.log.slice(0,15).map(l=>`<div style="font-size:9px;color:var(--dim);padding:3px 0;border-bottom:1px solid #1a1005">${esc(l)}</div>`).join('')}
      </div>
    </div>`;
}
window.renderWorldRaidBattlePanel = renderWorldRaidBattlePanel;

// ── 월드맵 패널: 소식을 들은 레이드만 노출 ──
function renderWorldRaidMapSection(){
  const rd = loadWorldRaid();
  if(!rd.active || !rd.active.heard) return '';
  const bossDef = getRaidBossDef(rd.active.bossId);
  if(!bossDef) return '';
  const hpPct = Math.max(0, Math.round((rd.active.hp/rd.active.maxHp)*100));
  const canJoin = canJoinWorldRaid();
  const turnsLeft = Math.max(0, rd.active.expireTurn - (S.msgCount||0));
  const contLabel = getRaidContinentLabel(rd.active.continent);
  const curMode = S._landMapViewMode || 'continent';
  const viewingRaidContinent = curMode==='continent' && S._landMapSelectedContinent===rd.active.continent;

  // 세계지도(world)를 보고 있거나, 대륙뷰인데 레이드가 발생한 대륙이 아니면
  // — 상세 패널 대신 "어느 대륙에 레이드가 있다"는 짧은 안내 배너만 표시
  if(!viewingRaidContinent){
    return `
    <div style="padding:7px 12px;background:#1a0a00;border:1px solid ${bossDef.color};margin-bottom:8px;border-radius:2px;display:flex;align-items:center;gap:8px;cursor:pointer" onclick="selectMapContinent('${rd.active.continent}')">
      <span style="color:${bossDef.color};display:inline-flex;flex-shrink:0;transform:scale(0.9)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(bossDef,{size:16}):(bossDef.svgIcon||bossDef.icon)}</span>
      <div style="flex:1;font-size:8.5px;color:${bossDef.color}">${esc(bossDef.name)}이(가) <b>${contLabel}대륙</b>에 출현 — 터치해서 보기</div>
      <div style="font-size:7.5px;color:var(--dim);flex-shrink:0">${turnsLeft}턴 남음</div>
    </div>`;
  }

  return `
    <div style="padding:10px 12px;background:#1a0a00;border:2px solid ${bossDef.color};margin-bottom:10px;border-radius:2px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="color:${bossDef.color};display:inline-flex;flex-shrink:0;transform:scale(1.2)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(bossDef,{size:16}):(bossDef.svgIcon||bossDef.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:11px;color:${bossDef.color}">${esc(bossDef.name)}</div>
          <div style="font-size:8px;color:var(--dim)">${contLabel}대륙 · 잔여 ${turnsLeft}턴 후 자동 소멸</div>
        </div>
      </div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:6px">${esc(bossDef.desc)}</div>
      <div style="height:6px;background:#1a0a0a;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="width:${hpPct}%;height:100%;background:${bossDef.color};transition:width .4s"></div>
      </div>
      <div style="font-size:8px;color:var(--dim);margin-bottom:8px">HP ${hpPct}% · 참전 세력: ${rd.active.factions.map(f=>esc(f.name)+(f.hp<=0?'(이탈)':'')).join(', ')||'없음'}</div>
      ${canJoin
        ? `<button onclick="openP('world-raid-battle');joinWorldRaidBattle()" style="width:100%;padding:8px;background:linear-gradient(135deg,#2a1000,#3a1800);border:1px solid ${bossDef.color};color:${bossDef.color};font-family:'Cinzel',serif;font-size:10px;cursor:pointer">⚔️ 레이드 참전</button>`
        : `<div style="text-align:center;font-size:8px;color:#a05050;padding:6px;background:#150505;border:1px dashed #402020">🔒 참전하기엔 명성이 부족합니다 (유명인 이상 필요)</div>`}
    </div>`;
}
window.renderWorldRaidMapSection = renderWorldRaidMapSection;

// ── renderWorldMapPanel 후킹: 레이드 섹션을 맨 위에 삽입 ──
(function hookWorldMapForRaid(){
  const _orig = window.renderWorldMapPanel;
  if(typeof _orig === 'function' && !_orig._raidHooked){
    window.renderWorldMapPanel = function(){
      const r = _orig.apply(this, arguments);
      try{
        const container = document.getElementById('pb-worldmap');
        if(container){
          const old = container.querySelector('.world-raid-section');
          if(old) old.remove();
          const section = renderWorldRaidMapSection();
          if(section){
            const div = document.createElement('div');
            div.className = 'world-raid-section';
            div.innerHTML = section;
            container.insertBefore(div, container.firstChild);
          }
        }
      }catch(e){}
      return r;
    };
    window.renderWorldMapPanel._raidHooked = true;
  }
})();

// ── renderBulletinBoard 후킹: 게시판 방문 시 소문 습득 체크 ──
(function hookBulletinForRaid(){
  const _orig = window.renderBulletinBoard;
  if(typeof _orig === 'function' && !_orig._raidHooked){
    window.renderBulletinBoard = function(){
      try{ tryHearRaidRumorAtBulletin(); }catch(e){}
      return _orig.apply(this, arguments);
    };
    window.renderBulletinBoard._raidHooked = true;
  }
})();

// ── tickGameTime 후킹: 매 턴 레이드 발생/진행 체크 ──
(function hookTickForRaid(){
  setTimeout(()=>{
    const _orig = window.tickGameTime;
    if(typeof _orig === 'function' && !_orig._raidHooked){
      window.tickGameTime = function(){
        const r = _orig.apply(this, arguments);
        try{
          checkWorldRaidTrigger();
          tickWorldRaidProgress();
          injectRaidRumorHint();
        }catch(e){}
        return r;
      };
      window.tickGameTime._raidHooked = true;
    }
  }, 3200);
})();

// ── AI 응답 후처리 훅: 소문 해금 판정 (다음 메시지 렌더링 이후 시점에 확률 적용) ──
(function hookMsgCountForRaidRumor(){
  let lastCount = -1;
  setInterval(()=>{
    try{
      if(typeof S!=='undefined' && S.msgCount !== lastCount){
        lastCount = S.msgCount;
        resolveRaidRumorAfterAI();
      }
    }catch(e){}
  }, 2000);
})();

console.log('[TaleForge] 월드 레이드 시스템 v1 로드 완료 ✓ (순수 로직 · 세력 참전 · 소문 기반 노출)');

})();
}

