// 🎖️ 칭호 시스템 (완전판) — 1개 활성화, 스탯 효과 적용
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { TITLE_DEFS } from '../data/010-스킬-강화-시스템.js';
import { LEGACY_TITLE_DEFS } from '../data/012-궁수-계열-T2-파생-5종-칭호-전사마법사도적-계열과-동일한-절제-원칙.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MISSION_TYPES, MOOD_INFO, SUMMON_CATEGORY, SUMMON_ENHANCE_MATERIALS, SUMMON_EVO_THRESHOLDS, SUMMON_JOB_CONFIG, SUMMON_LEVELUP_STAT, SUMMON_PERSONALITY_POOL } from '../data/089-칭호-시스템-완전판-1개-활성화-스탯-효과-적용.js';
import { saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { getStatInfo, loadTitles } from '../job/010-스킬-강화-시스템.js';
import { saveSession } from '../misc/001-block0-preamble.js';
import { loadSummonLegacy, saveSummonLegacy } from '../misc/016-2130번-시스템.js';
import { calcAllyAttackDamage } from '../misc/054-이동수단-시스템.js';
import { updateChallenge } from '../misc/164-도전-과제-달성률-시스템.js';
import { handleCaravanEvolve, handleMercEvolve } from '../misc/251-통합-처리-함수-매-AI-응답-후-호출.js';
import { $, esc, lsGet, lsSet, toast } from '../utils.js';
import { loadLegacyTitles } from './012-궁수-계열-T2-파생-5종-칭호-전사마법사도적-계열과-동일한-절제-원칙.js';

export const ACTIVE_TITLE_KEY = 'tf-active-title';

export function loadActiveTitle(){ try{ return JSON.parse(lsGet(ACTIVE_TITLE_KEY)||'null'); }catch(e){ return null; } }
window.loadActiveTitle = loadActiveTitle;

export function saveActiveTitle(d){ try{ lsSet(ACTIVE_TITLE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveActiveTitle = saveActiveTitle;

export function equipTitle(titleId){
  const allTitles = [...(loadTitles()||[]), ...(loadLegacyTitles()||[])];
  const title = allTitles.find(t=>t.id===titleId);
  if(!title) return;
  const allDefs = [...(TITLE_DEFS||[]), ...(LEGACY_TITLE_DEFS||[])];
  const def = allDefs.find(d=>d.id===titleId)||title;

  // 이전 칭호 스탯 제거
  const prev = loadActiveTitle();
  if(prev && prev.id !== titleId){
    const prevDef = allDefs.find(d=>d.id===prev.id);
    if(prevDef?.bonus && S.stats){
      Object.entries(prevDef.bonus).forEach(([k,v])=>{
        if(S.stats[k]!==undefined) S.stats[k] = Math.max(0, (S.stats[k]||0) - v);
      });
    }
  }

  // 새 칭호 스탯 적용
  if(def.bonus && S.stats){
    Object.entries(def.bonus).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k] = Math.min(999, (S.stats[k]||0) + v);
    });
  }

  saveActiveTitle({ id:titleId, name:def.name, icon:def.icon, equippedAt:Date.now() });
  if(typeof window.updateHeader==='function') window.updateHeader();
  if(typeof saveSession==='function')  saveSession();
  toastHTML(`🎖️ 칭호 장착: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)} ${esc(def.name)}`, 2000);
  renderTitles();
}
window.equipTitle = equipTitle;

window.equipTitle = equipTitle;

export function unequipTitle(){
  const prev = loadActiveTitle();
  if(!prev) return;
  const allDefs = [...(TITLE_DEFS||[]), ...(LEGACY_TITLE_DEFS||[])];
  const prevDef = allDefs.find(d=>d.id===prev.id);
  if(prevDef?.bonus && S.stats){
    Object.entries(prevDef.bonus).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k] = Math.max(0, (S.stats[k]||0) - v);
    });
  }
  saveActiveTitle(null);
  if(typeof window.updateHeader==='function') window.updateHeader();
  if(typeof saveSession==='function')  saveSession();
  toast('칭호를 해제했습니다', 1500);
  renderTitles();
}
window.unequipTitle = unequipTitle;

window.unequipTitle = unequipTitle;

export function getActiveTitleBLS(){
  const at = loadActiveTitle();
  if(!at) return '';
  const allDefs = [...(TITLE_DEFS||[]), ...(LEGACY_TITLE_DEFS||[])];
  const def = allDefs.find(d=>d.id===at.id);
  if(!def) return '';
  const bonusDesc = def.bonus ? Object.entries(def.bonus).slice(0,3).map(([k,v])=>{const i=getStatInfo?.(k);return (i?.name||k)+' +'+ v;}).join('·') : '';
  let hint = `\n[🎖️ 활성 칭호: ${def.icon}${def.name}]`;
  if(def.aiHint) hint += ` ${def.aiHint}`;
  if(bonusDesc)  hint += ` (${bonusDesc} 효과 활성)`;
  return hint;
}
window.getActiveTitleBLS = getActiveTitleBLS;

window.getActiveTitleBLS = getActiveTitleBLS;

(function wrapBLSForTitle(){
  if(window._titleBLSWrapped) return;
  window._titleBLSWrapped = true;
  const check = ()=>{
    if(typeof window.buildLightSystem!=='function'){ setTimeout(check,500); return; }
    const orig = window.buildLightSystem;
    window.buildLightSystem = function(...args){
      let r = orig.apply(this,args);
      try{ const h=getActiveTitleBLS(); if(h) r+=h; }catch(e){}
      return r;
    };
  };
  check();
})();

export function renderTitles(){
  const body=$('pb-titles'); if(!body) return;
  const myTitles    = loadTitles()||[];
  const legacyTitles= loadLegacyTitles()||[];
  const activeTitle = loadActiveTitle();
  const allDefs     = [...(TITLE_DEFS||[]), ...(LEGACY_TITLE_DEFS||[])];
  const rarityColor = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',legendary:'#c8a96e'};
  const rarityLabel = {common:'일반',uncommon:'비범',rare:'희귀',legendary:'전설'};

  const allOwned = [...legacyTitles, ...myTitles];
  const total    = allOwned.length;

  const titleCard = (t, defs)=>{
    const def = defs.find(d=>d.id===t.id)||t;
    const rc  = rarityColor[def.rarity]||'#c8a96e';
    const isActive = activeTitle?.id === t.id;
    const bonusDesc = def.bonus ? Object.entries(def.bonus).slice(0,4).map(([k,v])=>{
      const i=typeof getStatInfo==='function'?getStatInfo(k):null;
      return `<span style="color:${v>0?'#60a060':'#e05050'}">${i?.name||k} ${v>0?'+':''}${v}</span>`;
    }).join(' ') : '';
    return `
      <div style="padding:10px 12px;background:${isActive?'linear-gradient(135deg,#1a1200,#241800)':'#0d0800'};border:${isActive?'2px':'1px'} solid ${isActive?rc:'#2a1a05'};margin-bottom:6px;border-radius:2px;position:relative">
        ${isActive?`<div style="position:absolute;top:6px;right:8px;font-size:8px;color:${rc};font-family:Cinzel,serif;letter-spacing:1px">✦ 장착 중</div>`:''}
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          ${typeof getEntityIconHTML==='function' ? getEntityIconHTML({id:def.id, name:def.name, icon:def.icon||'🏆'}, {size:22}) : `<span style="font-size:22px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:22}):(def.icon||"🏆")}</span>`}
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:5px">
              <span style="font-family:Cinzel,serif;font-size:11px;color:${rc}">${esc(def.name||t.name||'칭호')}</span>
              <span style="font-size:7px;padding:1px 5px;background:${rc}18;border:1px solid ${rc}44;color:${rc};border-radius:2px">${rarityLabel[def.rarity]||def.rarity||''}</span>
            </div>
            <div style="font-size:9px;color:var(--dim);margin-top:2px;line-height:1.4">${esc(def.desc||'')}</div>
          </div>
        </div>
        ${bonusDesc?`<div style="font-size:9px;margin-bottom:6px;display:flex;flex-wrap:wrap;gap:4px">${bonusDesc}</div>`:''}
        ${def.aiHint?`<div style="font-size:9px;color:#5a4a2a;font-style:italic;margin-bottom:6px;padding:4px 7px;background:#0a0600;border-left:2px solid ${rc}44">"${esc(def.aiHint)}"</div>`:''}
        <div style="display:flex;gap:5px">
          ${isActive
            ?`<button onclick="unequipTitle()" style="flex:1;padding:5px;background:#1a0a00;border:1px solid #6a3a00;color:#c08040;font-size:9px;cursor:pointer;font-family:Cinzel,serif">✕ 해제</button>`
            :`<button onclick="equipTitle('${t.id}')" style="flex:1;padding:5px;background:${rc}18;border:1px solid ${rc}55;color:${rc};font-size:9px;cursor:pointer;font-family:Cinzel,serif">✦ 장착</button>`}
        </div>
      </div>`;
  };

  let html = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);letter-spacing:1px;margin-bottom:6px">🎖️ 칭호 (${total}개 보유)</div>

      <!-- 현재 장착 칭호 -->
      ${activeTitle?`
        <div style="padding:10px 13px;background:linear-gradient(135deg,#140c00,#1e1200);border:1px solid #c8a96e66;margin-bottom:12px">
          <div style="font-size:9px;color:var(--dim);font-family:Cinzel,serif;letter-spacing:1px;margin-bottom:5px">✦ 현재 장착</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:28px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(activeTitle,{size:28}):(activeTitle.icon||"🏆")}</span>
            <div>
              <div style="font-family:Cinzel,serif;font-size:13px;color:#c8a96e">${esc(activeTitle.name)}</div>
              <div style="font-size:9px;color:var(--dim);margin-top:2px">이 칭호의 보너스와 AI 힌트가 활성화됩니다</div>
            </div>
          </div>
        </div>`:`
        <div style="padding:10px;background:#0a0800;border:1px dashed #3a2a05;text-align:center;margin-bottom:12px;color:var(--dim);font-size:10px">
          장착된 칭호 없음 — 아래에서 하나를 선택하세요
        </div>`}

      <!-- 안내 -->
      <div style="padding:6px 10px;background:#050400;border:1px solid #1a1200;font-size:9px;color:var(--dim);line-height:1.5;margin-bottom:12px">
        💡 칭호는 <span style="color:var(--gold)">1개만 장착</span> 가능합니다.<br>
        장착 시 해당 칭호의 스탯 보너스가 즉시 적용되고, AI가 칭호에 맞는 서사를 씁니다.
      </div>

      <!-- 레거시 칭호 -->
      ${legacyTitles.length?`
        <div style="font-family:Cinzel,serif;font-size:9px;color:#c8a96e;letter-spacing:1px;margin-bottom:6px">♾️ 레거시 칭호 (환생 누적)</div>
        ${legacyTitles.map(t=>titleCard(t,LEGACY_TITLE_DEFS)).join('')}
        <div style="height:1px;background:#2a1a05;margin:10px 0"></div>`:''}

      <!-- 일반 칭호 -->
      ${myTitles.length?`
        <div style="font-family:Cinzel,serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:6px">🏆 보유 칭호</div>
        ${myTitles.map(t=>titleCard(t,TITLE_DEFS)).join('')}`
        :`<div style="text-align:center;padding:14px;color:var(--dim);font-size:10px">보유한 칭호가 없습니다</div>`}
    </div>`;
  body.innerHTML = html;
}
window.renderTitles = renderTitles;

window.renderTitles = renderTitles;


export function summonExpRequired(lv){ return Math.floor(30*Math.pow(1.45,lv-1)); }
window.summonExpRequired = summonExpRequired;

export function canSummonEvolve(s){
  const threshold = SUMMON_EVO_THRESHOLDS[s.evoCount||0];
  return threshold!==undefined && (s.level||1)>=threshold;
}
window.canSummonEvolve = canSummonEvolve;

export function addSummon(raw){
  if(!raw||!raw.name) return false;
  const summons = window.loadSummons();
  const jobId   = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
  const cat     = raw.category||'other';
  const catDef  = SUMMON_CATEGORY[cat]||SUMMON_CATEGORY.other;
  const cfg     = SUMMON_JOB_CONFIG[jobId]||{};
  const slotMax = (catDef.maxSlots||4)+(cfg.slotBonus||0);
  const sameCat = summons.filter(s=>s.status==='active'&&s.category===cat).length;
  if(sameCat>=slotMax){ toast('⚠️ '+catDef.label+' 슬롯 가득 (최대'+slotMax+')',2500); return false; }

  const lvl = typeof loadPlayerLevel==='function'?(loadPlayerLevel()||1):1;
  const hpBase  = raw.hp  ||(60+lvl*12);
  const atkBase = raw.atk ||(8+lvl*3);
  const defBase = raw.def ||(4+lvl*2);
  const hpM  = cfg.hpMult ||1;
  const atkM = cfg.atkMult||1;
  const defM = cfg.defMult||1;

  // 성격 결정 (AI가 지정하면 사용, 없으면 랜덤)
  const personality = raw.personality || SUMMON_PERSONALITY_POOL[Math.floor(Math.random()*SUMMON_PERSONALITY_POOL.length)].id;
  const persData = SUMMON_PERSONALITY_POOL.find(p=>p.id===personality)||SUMMON_PERSONALITY_POOL[0];

  const entry = {
    id:          'sm_'+Date.now(),
    name:        raw.name,
    customName:  null,              // 플레이어가 직접 지은 이름
    icon:        raw.icon||catDef.icon,
    category:    cat,
    catLabel:    catDef.label,
    catColor:    catDef.color,
    origin:      raw.origin||'소환됨',
    desc:        raw.desc||'',
    personality: personality,
    personalityLabel: persData.label,
    personalityDesc:  persData.desc,
    speechStyle: raw.speechStyle||'',   // 말투 특징
    skill:       raw.skill||'',
    skillDesc:   raw.skillDesc||'',
    hp:    Math.round(hpBase *hpM),
    maxHp: Math.round(hpBase *hpM),
    atk:   Math.round(atkBase*atkM),
    def:   Math.round(defBase*defM),
    spd:   raw.spd||5,
    level: 1,
    exp:   0,
    evoCount: 0,
    evoHistory: [],
    loyalty:  raw.loyalty||70,
    affection:0,              // 애정도 0~100 (대화·칭찬으로 증가)
    status:   'active',
    mood:     'neutral',      // happy/neutral/sulk/excited/wary
    moodDesc: '',
    onMission: false,
    missionLog: [],
    dialogLog:  [],
    totalKills: 0,
    totalMissions: 0,
    summonedAt: new Date().toISOString(),
  };

  summons.push(entry);
  window.saveSummons(summons);

  // [B67 FIX] "소환 수집가"(5개 계열 보유) 도전 과제 트래킹 — 진화 시점뿐
  // 아니라 신규 소환 시점에도 계열 집합이 바뀔 수 있으므로 여기서도 갱신.
  if(typeof updateChallenge==='function'){
    const cats = new Set(summons.filter(x=>x.status==='active'||x.status==='reserve').map(x=>x.category).filter(Boolean));
    updateChallenge('summon_categories', cats.size);
  }

  // 계승 연동
  try{
    if(typeof loadSummonLegacy==='function'&&typeof saveSummonLegacy==='function'){
      const leg=loadSummonLegacy();
      const ex=leg.find(l=>l.name===entry.name);
      if(ex){ex.appearances=(ex.appearances||0)+1;ex.bond=Math.min(10,(ex.bond||0)+1);}
      else leg.push({name:entry.name,icon:entry.icon,type:cat,bond:1,appearances:1});
      saveSummonLegacy(leg);
    }
  }catch(e){}

  toast(entry.icon+' '+entry.name+' 소환! ('+catDef.label+' · '+persData.label+')',3500);
  if(typeof addTimelineEvent==='function')
    addTimelineEvent('summon',entry.name+' 소환',{icon:entry.icon});

  renderSummons();
  return true;
}
window.addSummon = addSummon;

window.addSummon = addSummon;

export function renameSummon(summonId, newName){
  if(!newName||!newName.trim()) return;
  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===summonId);
  if(!s) return;
  const old=s.customName||s.name;
  s.customName=newName.trim();
  window.saveSummons(summons);
  toast('✏️ '+old+' → '+s.customName,2500);
  renderSummons();
}
window.renameSummon = renameSummon;

window.renameSummon = renameSummon;

export function getSummonDisplayName(s){ return s.customName||s.name; }
window.getSummonDisplayName = getSummonDisplayName;

export function dismissSummon(summonId){
  // [D-4 FIX] 전투 중에는 소환수 해제 불가
  if(S._inCombat){
    toast('⚠️ 전투 중에는 소환수를 해제할 수 없습니다!', 2000);
    return;
  }
  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===summonId);
  if(!s) return;
  if(!confirm(getSummonDisplayName(s)+'을(를) 해제하시겠습니까?')) return;
  s.status='dismissed';
  window.saveSummons(summons);
  renderSummons();
  toast((s.icon||'🔮')+' '+getSummonDisplayName(s)+' 해제됨',2500);
}
window.dismissSummon = dismissSummon;

window.dismissSummon = dismissSummon;

export function giveSummonExp(summonId, exp){
  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===summonId&&x.status==='active');
  if(!s) return;
  s.exp=(s.exp||0)+exp;
  s.level=s.level||1;
  let leveled=0;
  while(s.exp>=summonExpRequired(s.level)){
    s.exp-=summonExpRequired(s.level);
    s.level++; leveled++;
    const g=SUMMON_LEVELUP_STAT[s.category]||SUMMON_LEVELUP_STAT.other;
    s.maxHp+=g.hp; s.hp=Math.min(s.maxHp,s.hp+g.hp);
    s.atk+=g.atk; s.def+=g.def; s.spd=(s.spd||5)+g.spd;
  }
  if(leveled){
    toast('⬆️ '+getSummonDisplayName(s)+' Lv.'+s.level+'!',3000);
    if(typeof addTimelineEvent==='function')
      addTimelineEvent('summon_lvup',getSummonDisplayName(s)+' Lv.'+s.level,{icon:s.icon||'⬆️'});
    if(canSummonEvolve(s)) requestAISummonEvolution(s);
  }
  window.saveSummons(summons);
  renderSummons();
}
window.giveSummonExp = giveSummonExp;

window.giveSummonExp = giveSummonExp;

export function giveSummonBattleExp(tier){
  const base=tier===3?80:tier===2?35:15;
  const summons=window.loadSummons();
  const active=summons.filter(s=>s.status==='active'&&!s.onMission);
  if(!active.length) return;
  active.forEach(s=>{
    s.exp=(s.exp||0)+base; s.level=s.level||1;
    s.totalKills=(s.totalKills||0)+(tier>=2?1:0);
    let lp=0;
    while(s.exp>=summonExpRequired(s.level)&&lp<5){
      s.exp-=summonExpRequired(s.level); s.level++; lp++;
      const g=SUMMON_LEVELUP_STAT[s.category]||SUMMON_LEVELUP_STAT.other;
      s.maxHp+=g.hp; s.hp=Math.min(s.maxHp,s.hp+g.hp);
      s.atk+=g.atk; s.def+=g.def; s.spd=(s.spd||5)+g.spd;
      if(canSummonEvolve(s)) requestAISummonEvolution(s);
      setTimeout((function(n,lv,ic){return function(){toast('⬆️ '+ic+n+' Lv.'+lv+'!',2800);};})(getSummonDisplayName(s),s.level,s.icon||''),400*lp);
    }
  });
  window.saveSummons(summons);
  setTimeout(()=>{ if(typeof renderSummons==='function') renderSummons(); },600);
}
window.giveSummonBattleExp = giveSummonBattleExp;

window.giveSummonBattleExp = giveSummonBattleExp;

export function requestAISummonEvolution(s){
  const evoCount=s.evoCount||0;
  const stageNames=['1차','2차','3차','4차','5차','6차'];
  const stageName=stageNames[evoCount]||evoCount+'차';
  const catLabel=(SUMMON_CATEGORY[s.category]||{}).label||s.category;
  const persData=SUMMON_PERSONALITY_POOL.find(p=>p.id===s.personality)||{label:'',desc:''};
  const scaleGuide=[
    '1차=각성(특기 싹틈)',
    '2차=개화(고유 아이덴티티 확립, 서사 연결)',
    '3차=군림(NPC들이 반응, 세계 영향 시작)',
    '4차=초월(카테고리 경계 붕괴, 세계관 흔들림)',
    '5차=신화(감시자·봉인석 반응, 전설 등재)',
    '6차=현현(세계 사건급, 역사 기록됨, 감시자도 경계)',
  ];

  const prompt='\n[⚡ '+getSummonDisplayName(s)+' '+stageName+' 진화 — 지금 즉시 서사에서 묘사하고 GS 출력]\n'
    +'소환수 정보: 이름='+getSummonDisplayName(s)+', 계열='+catLabel+', 기원='+(s.origin||'소환됨')+', 성격='+persData.label+'('+persData.desc+')\n'
    +'현재 Lv.'+s.level+', 처치수='+(s.totalKills||0)+', 임무수='+(s.totalMissions||0)+', 충성도='+(s.loyalty||70)+', 애정도='+(s.affection||0)+'\n'
    +'기존 스킬: '+(s.skill||'없음')+'\n'
    +'이번 진화: '+stageName+' ('+(evoCount+1)+'/6단)\n'
    +'스케일 기준: '+scaleGuide[evoCount]+'\n'
    +'지금까지의 서사 맥락, 캐릭터 직업, 세계 상황, 이 소환수의 성격과 역사를 모두 반영해\n'
    +'완전히 새로운 존재로 재탄생시켜라. 이름·외형·스킬이 근본적으로 달라질 수 있다.\n'
    +'성격은 유지하되 더 극단적으로 심화될 수 있다.\n'
    +'진화 장면을 극적으로 묘사한 뒤 반드시 <gs>에 출력:\n'
    +'"summon_evolve":[{"name":"'+getSummonDisplayName(s)+'","newName":"진화 후 이름","newIcon":"이모지","newDesc":"외형·특성 묘사 2줄","newSkill":"고유 스킬명","newSkillDesc":"스킬 설명","newSpeechStyle":"진화 후 말투 특징","moodChange":"excited","statBoost":{"hp":40,"atk":15,"def":8}}]\n'
    +'5차(hp:100+), 6차(hp:150+)로 스탯 부스트 스케일도 올려라.';

  S._nextInjectedContext=(S._nextInjectedContext||'')+prompt;
  setTimeout(()=>toast('✨ '+getSummonDisplayName(s)+' '+stageName+' 진화 준비! 다음 행동에서 진화합니다',4500),500);
  // [버그 수정] ui/155의 patchSummonEvoWithSecret가 이 함수(정의된 곳
  // 밖)에서 window.requestAISummonEvolution을 감싸 4차 진화(evoCount===3,
  // 0→1→2→3) 도달 시 "소환수 비밀 스토리"를 트리거하려 했지만, 이 함수의
  // 실제 호출부가 전부(이 파일 안에서) bare 식별자라 그 감싸기가 적용된
  // 적이 없다 — 다른 죽은 훅들과 동일한 원인. 실제 정의부에 직접 연결한다.
  if(evoCount===3 && typeof window.triggerSummonSecretStory==='function'){
    setTimeout(()=>window.triggerSummonSecretStory(s.id), 3000);
  }
}
window.requestAISummonEvolution = requestAISummonEvolution;

window.requestAISummonEvolution = requestAISummonEvolution;

export function handleSummonEvolve(evoList){
  if(!Array.isArray(evoList)) return;
  const summons=window.loadSummons(); let changed=false;
  evoList.forEach(ev=>{
    if(!ev||!ev.name) return;
    const s=summons.find(x=>x.status==='active'&&x.name&&(x.customName||x.name).includes(ev.name.slice(0,4)));
    if(!s) return;
    const oldName=getSummonDisplayName(s); const oldIcon=s.icon;
    if(ev.newName){ s.name=ev.newName; if(s.customName) s.customName=null; }
    if(ev.newIcon) s.icon=ev.newIcon;
    if(ev.newDesc) s.desc=ev.newDesc;
    if(ev.newSkill){ s.skill=ev.newSkill; s.skillDesc=ev.newSkillDesc||''; }
    if(ev.newSpeechStyle) s.speechStyle=ev.newSpeechStyle;
    if(ev.moodChange) s.mood=ev.moodChange;
    const boost=ev.statBoost||{};
    s.maxHp=Math.round(s.maxHp*1.2)+(boost.hp||0);
    s.hp=s.maxHp;
    s.atk=Math.round(s.atk*1.2)+(boost.atk||0);
    s.def=Math.round(s.def*1.2)+(boost.def||0);
    s.spd=Math.round((s.spd||5)*1.1)+(boost.spd||0);
    s.loyalty=Math.min(100,(s.loyalty||70)+15);
    s.affection=Math.min(100,(s.affection||0)+10);
    s.evoCount=(s.evoCount||0)+1;
    s.evoHistory=s.evoHistory||[];
    s.evoHistory.push({from:oldName,to:getSummonDisplayName(s),fromIcon:oldIcon,toIcon:s.icon,atLevel:s.level,skill:s.skill,at:new Date().toLocaleString('ko-KR')});
    changed=true;
    showEvoPopup(s,oldName,oldIcon,ev);
    if(typeof addTimelineEvent==='function')
      addTimelineEvent('summon_evo',oldName+' → '+getSummonDisplayName(s),{icon:s.icon||'✨'});
  });
  if(changed){
    window.saveSummons(summons);
    renderSummons();
    // [B67 FIX] "소환 군주"(6차 진화)/"소환 수집가"(5개 계열 보유) 도전 과제 트래킹
    if(typeof updateChallenge==='function'){
      if(summons.some(x=>(x.evoCount||0)>=6)) updateChallenge('max_evo_summons', 1);
      const cats = new Set(summons.filter(x=>x.status==='active'||x.status==='reserve').map(x=>x.category).filter(Boolean));
      updateChallenge('summon_categories', cats.size);
    }
  }
}
window.handleSummonEvolve = handleSummonEvolve;

window.handleSummonEvolve = handleSummonEvolve;

export function showEvoPopup(s,oldName,oldIcon,ev){
  document.querySelectorAll('.summon-evo-popup').forEach(el=>el.remove());
  const catColor=(SUMMON_CATEGORY[s.category]||{}).color||'#c8a96e';
  const stageLabel=['1차','2차','3차','4차','5차','6차'][(s.evoCount||1)-1]||'';
  const popup=document.createElement('div');
  popup.className='summon-evo-popup';
  popup.style.cssText='position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s';
  popup.innerHTML=
    '<div style="width:100%;max-width:340px;background:#0d0800;border:2px solid '+catColor+';box-shadow:0 0 60px '+catColor+'55;overflow:hidden">'
    +'<div style="background:linear-gradient(135deg,#1a0f00,#2a1a05);padding:16px;text-align:center;border-bottom:1px solid '+catColor+'44">'
    +'<div style="font-family:\'Cinzel\',serif;font-size:9px;color:'+catColor+';letter-spacing:3px;margin-bottom:6px">✦ '+stageLabel+' EVOLUTION ✦</div>'
    +'<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin:8px 0">'
    +'<div style="opacity:.4;text-align:center"><div style="font-size:28px">'+(oldIcon||'🔮')+'</div><div style="font-size:8px;color:#5a4a2a;margin-top:2px">'+esc(oldName)+'</div></div>'
    +'<div style="color:'+catColor+';font-size:20px">→</div>'
    +'<div style="text-align:center"><div style="font-size:44px;filter:drop-shadow(0 0 16px '+catColor+')">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s?.icon||'✨'))+'</div><div style="font-family:\'Cinzel\',serif;font-size:13px;color:#e8d89e;margin-top:4px">'+esc(getSummonDisplayName(s))+'</div></div>'
    +'</div>'
    +'<div style="font-size:9px;color:#8a7a4a">Lv.'+(s.level||1)+' · '+stageLabel+' 진화 ('+(s.evoCount||1)+'/6)</div>'
    +'</div>'
    +'<div style="padding:14px 16px">'
    +(s.desc?'<div style="font-size:10px;color:#c0b080;line-height:1.7;margin-bottom:10px;text-align:center;font-style:italic">'+esc(s.desc)+'</div>':'')
    +(s.skill?'<div style="padding:8px 10px;background:#0a0500;border-left:3px solid '+catColor+';margin-bottom:10px"><div style="font-size:9px;color:'+catColor+';margin-bottom:2px">✦ 새 스킬</div><div style="font-size:11px;color:#d0b0f0">'+esc(s.skill)+'</div>'+(s.skillDesc?'<div style="font-size:9px;color:#8060a0;margin-top:2px">'+esc(s.skillDesc)+'</div>':'')+'</div>':'')
    +(s.speechStyle?'<div style="font-size:9px;color:#8a7a4a;margin-bottom:10px">💬 '+esc(s.speechStyle)+'</div>':'')
    +'<div style="display:flex;gap:5px;font-size:9px;color:#80c080;flex-wrap:wrap;margin-bottom:12px"><span>❤️ HP+20%+</span><span>⚔️ ATK+20%+</span><span>🛡 DEF+20%+</span><span>💛 충성+15</span><span>💖 애정+10</span></div>'
    +'<button onclick="this.closest(\'.summon-evo-popup\').remove()" style="width:100%;padding:10px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid '+catColor+';color:'+catColor+';font-family:\'Cinzel\',serif;font-size:11px;cursor:pointer;letter-spacing:1px">확인</button>'
    +'</div></div>';
  document.body.appendChild(popup);
  popup.addEventListener('click',e=>{if(e.target===popup)popup.remove();});
}
window.showEvoPopup = showEvoPopup;

window.showEvoPopup = showEvoPopup;

export function openSummonDialog(summonId){
  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===summonId);
  if(!s) return;
  const catColor=(SUMMON_CATEGORY[s.category]||{}).color||'#c8a96e';
  const persData=SUMMON_PERSONALITY_POOL.find(p=>p.id===s.personality)||{label:'',desc:''};

  document.querySelectorAll('.summon-dialog-popup').forEach(e=>e.remove());
  const popup=document.createElement('div');
  popup.className='summon-dialog-popup';
  popup.style.cssText='position:fixed;inset:0;z-index:9400;background:rgba(0,0,0,.9);display:flex;align-items:flex-end;justify-content:center;padding:16px;animation:fadeIn .2s';

  const recent=(s.dialogLog||[]).slice(-4);

  popup.innerHTML=
    '<div style="width:100%;max-width:420px;background:#0d0800;border:2px solid '+catColor+';border-bottom:none;max-height:70vh;display:flex;flex-direction:column">'
    +'<div style="padding:10px 14px;border-bottom:1px solid '+catColor+'44;display:flex;align-items:center;gap:8px;flex-shrink:0">'
    +'<span style="font-size:22px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s?.icon||'🔮'))+'</span>'
    +'<div style="flex:1">'
    +'<div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--gold)">'+esc(getSummonDisplayName(s))+'</div>'
    +'<div style="font-size:9px;color:'+catColor+'">'+persData.label+' · 애정 '+(s.affection||0)+' · 충성 '+(s.loyalty||70)+'</div>'
    +'</div>'
    +'<button onclick="this.closest(\'.summon-dialog-popup\').remove()" style="background:none;border:none;color:var(--dim);font-size:16px;cursor:pointer">✕</button>'
    +'</div>'
    +'<div id="sdlg-log" style="flex:1;overflow-y:auto;padding:10px 14px;display:flex;flex-direction:column;gap:6px;min-height:120px">'
    +(recent.length?recent.map(d=>
      d.role==='player'
        ?'<div style="text-align:right"><span style="font-size:10px;background:#0a1520;color:#9ab4d4;padding:4px 8px;border-radius:8px 8px 2px 8px;display:inline-block;max-width:80%">'+esc(d.text)+'</span></div>'
        :'<div style="display:flex;gap:6px;align-items:flex-start"><span style="font-size:14px;flex-shrink:0">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s?.icon||'🔮'))+'</span><span style="font-size:10px;background:#150d03;color:#d4b896;padding:4px 8px;border-radius:8px 8px 8px 2px;display:inline-block;max-width:80%">'+esc(d.text)+'</span></div>'
    ).join(''):'<div style="color:var(--dim);font-size:10px;text-align:center;padding:12px 0">처음으로 말을 건다...</div>')
    +'</div>'
    +'<div style="padding:8px 10px;border-top:1px solid '+catColor+'22;display:flex;gap:6px;flex-shrink:0">'
    +'<input id="sdlg-input" placeholder="'+esc(getSummonDisplayName(s))+'에게 말을 건다..." style="flex:1;background:#0a0600;border:1px solid #3a2a0a;color:var(--text);font-size:11px;padding:7px 10px;font-family:\'Crimson Text\',serif" maxlength="200">'
    +'<button onclick="sendSummonDialog(\''+summonId+'\')" style="background:#1a1005;border:1px solid '+catColor+';color:'+catColor+';font-size:10px;padding:7px 12px;cursor:pointer;font-family:\'Cinzel\',serif">전송</button>'
    +'</div>'
    +'</div>';
  document.body.appendChild(popup);
  const inp=document.getElementById('sdlg-input');
  if(inp){ inp.focus(); inp.addEventListener('keydown',e=>{ if(e.key==='Enter') sendSummonDialog(summonId); }); }
}
window.openSummonDialog = openSummonDialog;

window.openSummonDialog = openSummonDialog;

export function sendSummonDialog(summonId){
  const inp=document.getElementById('sdlg-input');
  if(!inp) return;
  const text=inp.value.trim();
  if(!text) return;
  inp.value='';

  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===summonId);
  if(!s) return;

  // 플레이어 메시지 기록
  s.dialogLog=s.dialogLog||[];
  s.dialogLog.push({role:'player',text});
  if(s.dialogLog.length>40) s.dialogLog=s.dialogLog.slice(-40);

  // UI 즉시 업데이트
  const log=document.getElementById('sdlg-log');
  if(log){
    log.innerHTML+='<div style="text-align:right"><span style="font-size:10px;background:#0a1520;color:#9ab4d4;padding:4px 8px;border-radius:8px 8px 2px 8px;display:inline-block;max-width:80%">'+esc(text)+'</span></div>';
    log.innerHTML+='<div id="sdlg-typing" style="color:var(--dim);font-size:9px">'+esc(getSummonDisplayName(s))+' 반응 중...</div>';
    log.scrollTop=log.scrollHeight;
  }
  window.saveSummons(summons);

  // AI에게 소환수 답변 요청 주입
  const persData=SUMMON_PERSONALITY_POOL.find(p=>p.id===s.personality)||{label:'',desc:''};
  const catLabel=(SUMMON_CATEGORY[s.category]||{}).label||s.category;
  const context='\n[💬 소환수 대화 — 즉시 처리]\n'
    +getSummonDisplayName(s)+'('+catLabel+' · '+persData.label+' · Lv.'+(s.level||1)+'이 주인에게 답한다.\n'
    +'성격: '+persData.desc+'\n'
    +'말투: '+(s.speechStyle||'특별한 말투 없음')+'\n'
    +'현재 기분: '+(s.mood||'neutral')+' / 충성도: '+(s.loyalty||70)+' / 애정도: '+(s.affection||0)+'\n'
    +'주인이 말했다: "'+text+'"\n'
    +'소환수의 성격과 기분에 맞게 자연스럽게 답하라. 1~3문장. 서사 묘사 안에 녹여도 되고 직접 대사로 써도 된다.\n'
    +'답변 후 GS에: "summon_dialog":{"id":"'+summonId+'","reply":"답변 내용","moodChange":"happy|neutral|sulk|excited|wary","affectionChange":3}\n'
    +'칭찬/관심은 affectionChange +3~10, 무시/명령은 성격에 따라 -5~+2';
  S._nextInjectedContext=(S._nextInjectedContext||'')+context;
}
window.sendSummonDialog = sendSummonDialog;

window.sendSummonDialog = sendSummonDialog;

export function openMissionSelect(summonId){
  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===summonId);
  if(!s) return;
  if(s.onMission){ toast(getSummonDisplayName(s)+'은(는) 이미 임무 중입니다',2500); return; }

  const catColor=(SUMMON_CATEGORY[s.category]||{}).color||'#c8a96e';
  document.querySelectorAll('.summon-mission-popup').forEach(e=>e.remove());
  const popup=document.createElement('div');
  popup.className='summon-mission-popup';
  popup.style.cssText='position:fixed;inset:0;z-index:9400;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s';
  popup.innerHTML=
    '<div style="width:100%;max-width:380px;background:#0d0800;border:2px solid '+catColor+';max-height:80vh;overflow-y:auto">'
    +'<div style="padding:12px 14px;border-bottom:1px solid '+catColor+'44;display:flex;align-items:center;gap:8px">'
    +'<span style="font-size:20px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s?.icon||'🔮'))+'</span>'
    +'<div style="flex:1"><div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--gold)">'+esc(getSummonDisplayName(s))+' — 임무 파견</div>'
    +'<div style="font-size:9px;color:var(--dim)">Lv.'+(s.level||1)+' · 완료 임무 '+(s.totalMissions||0)+'회</div></div>'
    +'<button onclick="this.closest(\'.summon-mission-popup\').remove()" style="background:none;border:none;color:var(--dim);font-size:16px;cursor:pointer">✕</button>'
    +'</div>'
    +'<div style="padding:10px">'
    +MISSION_TYPES.map(m=>{
      const ok=(s.level||1)>=m.minLv;
      return '<div style="padding:9px 11px;background:'+(ok?'#090600':'#060400')+';border:1px solid '+(ok?catColor+'33':'#1a1005')+';margin-bottom:6px;opacity:'+(ok?1:0.4)+'">'
        +'<div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">'
        +'<span style="font-size:16px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m?.icon))+'</span>'
        +'<div style="flex:1"><div style="font-family:\'Cinzel\',serif;font-size:10px;color:'+(ok?'var(--gold)':'var(--dim)')+'">'+m.label+'</div>'
        +'<div style="font-size:9px;color:var(--dim)">'+m.desc+'</div></div>'
        +'<div style="font-size:9px;color:var(--dim);text-align:right">'+m.duration+'턴<br>Lv.'+m.minLv+'↑</div>'
        +'</div>'
        +'<div style="font-size:8px;color:#5a6a3a;margin-bottom:5px">예상 보상: '+m.rewards.slice(0,2).join(' / ')+'</div>'
        +(ok?'<button onclick="startMission(\''+summonId+'\',\''+m.id+'\')" style="width:100%;padding:5px;background:#1a1005;border:1px solid '+catColor+'44;color:'+catColor+';font-size:9px;cursor:pointer;font-family:\'Cinzel\',serif">파견</button>':'<div style="font-size:8px;color:#3a2a1a;text-align:center">레벨 부족</div>')
        +'</div>';
    }).join('')
    +'</div></div>';
  document.body.appendChild(popup);
}
window.openMissionSelect = openMissionSelect;

window.openMissionSelect = openMissionSelect;

export function startMission(summonId, missionId){
  document.querySelectorAll('.summon-mission-popup').forEach(e=>e.remove());
  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===summonId);
  const m=MISSION_TYPES.find(x=>x.id===missionId);
  if(!s||!m) return;
  s.onMission=true;
  s.currentMission={id:missionId,label:m.label,icon:m.icon,startTurn:S.msgCount||0,duration:m.duration,rewards:m.rewards};
  s.missionLog=s.missionLog||[];
  s.missionLog.push({id:missionId,label:m.label,startTurn:S.msgCount||0,at:new Date().toLocaleString('ko-KR')});
  window.saveSummons(summons);
  renderSummons();
  toast(s.icon+' '+getSummonDisplayName(s)+' → '+m.icon+' '+m.label+' 파견! ('+m.duration+'턴 후 귀환)',3500);

  // AI에게 파견 서사 요청
  S._nextInjectedContext=(S._nextInjectedContext||'')
    +'\n[📨 소환수 파견] '+getSummonDisplayName(s)+'이(가) '+m.label+' 임무로 파견됐다. 간단히 출발 장면을 묘사하라 (1~2문장).';
}
window.startMission = startMission;

window.startMission = startMission;

export function checkMissionReturns(){
  const summons=window.loadSummons(); let changed=false;
  summons.forEach(s=>{
    if(!s.onMission||!s.currentMission) return;
    const elapsed=(S.msgCount||0)-(s.currentMission.startTurn||0);
    if(elapsed<s.currentMission.duration) return;
    // 귀환
    s.onMission=false;
    s.totalMissions=(s.totalMissions||0)+1;
    s.loyalty=Math.min(100,(s.loyalty||70)+5);
    s.affection=Math.min(100,(s.affection||0)+3);
    // 경험치 보상
    giveSummonExp(s.id, 40+s.currentMission.duration*8);
    // 랜덤 보상 선택
    const rewardDesc=s.currentMission.rewards[Math.floor(Math.random()*s.currentMission.rewards.length)];
    const mLabel=s.currentMission.label;
    const mIcon=s.currentMission.icon;
    s.missionLog[s.missionLog.length-1].result=rewardDesc;
    s.currentMission=null;
    changed=true;
    // 귀환 서사 요청
    S._nextInjectedContext=(S._nextInjectedContext||'')
      +'\n[📩 소환수 귀환] '+getSummonDisplayName(s)+'이(가) '+mLabel+' 임무를 마치고 돌아왔다. 결과: '+rewardDesc+'. 1~2문장으로 귀환 장면을 묘사하라.';
    setTimeout(()=>toast(s.icon+' '+getSummonDisplayName(s)+' 임무 완료 귀환! '+rewardDesc,4000),300);
    if(typeof addTimelineEvent==='function')
      addTimelineEvent('mission',getSummonDisplayName(s)+' 임무 완료',{icon:mIcon});
  });
  if(changed){ window.saveSummons(summons); renderSummons(); }
}
window.checkMissionReturns = checkMissionReturns;

window.checkMissionReturns = checkMissionReturns;

export function openEnhanceSelect(summonId){
  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===summonId&&x.status==='active');
  if(!s) return;
  const inv=S.inventory||[];
  // [B59 FIX] 앞 4글자 부분매칭이라 "마력 결정"과 "고급 마력 결정"처럼
  // 한쪽이 다른 쪽의 부분 문자열인 경우 서로 혼동되던 버그(저가 재료를
  // 선택했는데 실제로는 고가 재료가 소모될 위험). 정확한 이름 매칭으로 교체.
  const usable=Object.entries(SUMMON_ENHANCE_MATERIALS).filter(([name])=>inv.some(i=>i.name===name));
  if(!usable.length){ toast('⚠️ 사용 가능한 강화 재료가 없습니다',2500); return; }
  const catColor=(SUMMON_CATEGORY[s.category]||{}).color||'#c8a96e';
  document.querySelectorAll('.summon-enhance-popup').forEach(e=>e.remove());
  const popup=document.createElement('div');
  popup.className='summon-enhance-popup';
  popup.style.cssText='position:fixed;inset:0;z-index:9400;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s';
  popup.innerHTML=
    '<div style="width:100%;max-width:340px;background:#0d0800;border:2px solid '+catColor+'">'
    +'<div style="padding:12px 14px;border-bottom:1px solid '+catColor+'44;display:flex;align-items:center;gap:8px">'
    +'<span style="font-size:18px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s?.icon||'🔮'))+'</span>'
    +'<div style="flex:1"><div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold)">'+esc(getSummonDisplayName(s))+' — 강화</div>'
    +'<div style="font-size:9px;color:var(--dim)">EXP '+(s.exp||0)+'/'+summonExpRequired(s.level||1)+'</div></div>'
    +'<button onclick="this.closest(\'.summon-enhance-popup\').remove()" style="background:none;border:none;color:var(--dim);font-size:16px;cursor:pointer">✕</button>'
    +'</div>'
    +'<div style="padding:10px">'
    +usable.map(([name,data])=>{
      const count=inv.filter(i=>i.name===name).length;
      return '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#090600;border:1px solid '+catColor+'22;margin-bottom:5px">'
        +'<div style="flex:1"><div style="font-size:10px;color:var(--text)">'+esc(name)+'</div>'
        +'<div style="font-size:9px;color:#60a060">EXP +'+data.exp+' · 보유 '+count+'개</div></div>'
        +'<button onclick="enhanceSummon(\''+summonId+'\',\''+name+'\')" style="background:#1a1005;border:1px solid '+catColor+'44;color:'+catColor+';font-size:9px;padding:4px 10px;cursor:pointer">사용</button>'
        +'</div>';
    }).join('')
    +'</div></div>';
  document.body.appendChild(popup);
}
window.openEnhanceSelect = openEnhanceSelect;

window.openEnhanceSelect = openEnhanceSelect;

export function enhanceSummon(summonId,itemName){
  document.querySelectorAll('.summon-enhance-popup').forEach(e=>e.remove());
  const mat=SUMMON_ENHANCE_MATERIALS[itemName];
  if(!mat) return;
  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===summonId&&x.status==='active');
  if(!s) return;
  const inv=S.inventory||[];
  const idx=inv.findIndex(i=>i.name===itemName);
  if(idx===-1){ toast('⚠️ 인벤토리에 없습니다',2000); return; }
  inv.splice(idx,1);
  if(typeof saveInventory==='function') saveInventory(inv); else S.inventory=inv;
  toast(s.icon+' '+getSummonDisplayName(s)+' 강화! EXP +'+mat.exp,3000);
  giveSummonExp(summonId,mat.exp);
}
window.enhanceSummon = enhanceSummon;

window.enhanceSummon = enhanceSummon;

window.enhanceSummonWithItem = enhanceSummon;

export function praiseSummon(summonId){
  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===summonId&&x.status==='active');
  if(!s) return;
  s.affection=Math.min(100,(s.affection||0)+8);
  s.loyalty  =Math.min(100,(s.loyalty  ||70)+3);
  s.mood='happy';
  window.saveSummons(summons);
  renderSummons();
  toast('💖 '+getSummonDisplayName(s)+'을(를) 칭찬했다. 애정도 +8',2500);
  S._nextInjectedContext=(S._nextInjectedContext||'')
    +'\n[💖 소환수 칭찬] 주인이 '+getSummonDisplayName(s)+'을(를) 칭찬했다. 소환수가 기뻐하는 모습을 한 문장으로 자연스럽게 서사에 녹여라.';
}
window.praiseSummon = praiseSummon;

window.praiseSummon = praiseSummon;

export function handleSummonDialogGS(dlg){
  if(!dlg||!dlg.id) return;
  const summons=window.loadSummons();
  const s=summons.find(x=>x.id===dlg.id);
  if(!s) return;
  if(dlg.reply){
    s.dialogLog=s.dialogLog||[];
    s.dialogLog.push({role:'summon',text:dlg.reply});
    if(s.dialogLog.length>40) s.dialogLog=s.dialogLog.slice(-40);
    // 대화 팝업 업데이트
    const log=document.getElementById('sdlg-log');
    if(log){
      const typing=document.getElementById('sdlg-typing');
      if(typing) typing.remove();
      log.innerHTML+='<div style="display:flex;gap:6px;align-items:flex-start"><span style="font-size:14px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s?.icon||'🔮'))+'</span><span style="font-size:10px;background:#150d03;color:#d4b896;padding:4px 8px;border-radius:8px 8px 8px 2px;display:inline-block;max-width:80%">'+esc(dlg.reply)+'</span></div>';
      log.scrollTop=log.scrollHeight;
    }
  }
  if(dlg.moodChange) s.mood=dlg.moodChange;
  if(typeof dlg.affectionChange==='number'){
    s.affection=Math.min(100,Math.max(0,(s.affection||0)+dlg.affectionChange));
  }
  window.saveSummons(summons);
  renderSummons();
}
window.handleSummonDialogGS = handleSummonDialogGS;

window.handleSummonDialogGS = handleSummonDialogGS;

export function renderSummons(){
  const body=document.getElementById('pb-summons');
  if(!body) return;
  const summons=window.loadSummons()||[];
  const active=summons.filter(s=>s.status==='active');
  const dismissed=summons.filter(s=>s.status==='dismissed').slice(-3);
  const jobId=((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
  const cfg=SUMMON_JOB_CONFIG[jobId]||{};

  let html='<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">🔮 소환수 ('+active.length+'기 활성)</div>';
  if(cfg.bonus) html+='<div style="font-size:9px;color:#80c080;padding:4px 8px;background:#0a1a0a;border:1px solid #1a3a1a;margin-bottom:8px;border-radius:2px">✦ '+esc(cfg.bonus)+'</div>';

  if(!active.length){
    html+='<div style="text-align:center;padding:24px 16px;color:var(--dim)">'
      +'<div style="font-size:32px;margin-bottom:8px">🔮</div>'
      +'<div style="font-size:11px;margin-bottom:4px">소환수가 없습니다</div>'
      +'<div style="font-size:9px;opacity:.6">소환·계약·부활·조종 등의 서사에서 자동 등록됩니다</div>'
      +'</div>';
  } else {
    html+=active.map(s=>{
      const lv=s.level||1;
      const curExp=s.exp||0;
      const reqExp=summonExpRequired(lv);
      const expPct=Math.min(100,Math.round(curExp/reqExp*100));
      const hpPct=Math.min(100,Math.max(0,(s.hp/s.maxHp)*100));
      const hpColor=hpPct>60?'#4a9a6a':hpPct>30?'#c0a030':'#c04040';
      const catColor=s.catColor||(SUMMON_CATEGORY[s.category]||{}).color||'#3a5a2a';
      const evoReady=canSummonEvolve(s);
      const evoCount=s.evoCount||0;
      const dots='◆'.repeat(evoCount)+'◇'.repeat(Math.max(0,6-evoCount));
      const nextThr=SUMMON_EVO_THRESHOLDS[evoCount];
      const mood=MOOD_INFO[s.mood||'neutral']||MOOD_INFO.neutral;
      const persData=SUMMON_PERSONALITY_POOL.find(p=>p.id===s.personality)||{label:'?'};
      const loyColor=(s.loyalty||70)>=70?'#60a060':(s.loyalty||70)>=40?'#c0a030':'#e05050';
      const affColor=(s.affection||0)>=70?'#e060a0':(s.affection||0)>=40?'#c08050':'#8a6a4a';
      const displayName=getSummonDisplayName(s);

      return '<div style="padding:12px 12px 10px;background:#0d0800;border:1px solid '+catColor+(evoReady?';box-shadow:0 0 10px '+catColor+'33':'')+'33;border-left:3px solid '+catColor+';margin-bottom:10px">'

        // ── 상단: 아이콘 + 이름 + 뱃지
        +'<div style="display:flex;align-items:flex-start;gap:9px;margin-bottom:8px">'
        +'<div style="position:relative;flex-shrink:0">'
        +'<span style="font-size:26px;filter:drop-shadow(0 0 7px '+catColor+'88);display:block">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s?.icon||'🔮'))+'</span>'
        +(s.onMission?'<span style="position:absolute;bottom:-2px;right:-4px;font-size:10px" title="임무 중">📨</span>':'')
        +'</div>'
        +'<div style="flex:1;min-width:0">'
        +'<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:2px">'
        +'<span style="font-family:\'Cinzel\',serif;font-size:12px;color:var(--gold)">'+esc(displayName)+'</span>'
        +'<span style="font-size:9px;color:'+catColor+';background:'+catColor+'22;padding:1px 5px;border-radius:2px;flex-shrink:0">Lv.'+lv+'</span>'
        +(evoReady?'<span style="font-size:8px;color:#e0c040;background:#2a2500;padding:1px 4px;border-radius:2px">⚡진화대기</span>':'')
        +(s.onMission?'<span style="font-size:8px;color:#60a0e0;background:#001525;padding:1px 4px;border-radius:2px">📨임무중</span>':'')
        +'</div>'
        +'<div style="font-size:9px;color:'+catColor+';margin-bottom:2px">'+esc(s.catLabel||'')+' · '+esc(s.origin||'')+'</div>'
        +'<div style="font-size:8px;color:#5a4a2a">'+dots+' '+evoCount+'차 진화 / '+persData.label+'</div>'
        +'</div>'
        +'</div>'

        // ── 기분·성격
        +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:7px;padding:5px 8px;background:#090500;border-radius:3px">'
        +'<span style="font-size:14px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(mood,{size:14}):(mood?.icon))+'</span>'
        +'<span style="font-size:9px;color:'+mood.color+'">'+mood.label+'</span>'
        +'<span style="font-size:8px;color:var(--dim);margin-left:4px">'+(s.moodDesc||persData.desc||'').slice(0,30)+'</span>'
        +'</div>'

        // ── 설명
        +(s.desc?'<div style="font-size:9px;color:var(--dim);margin-bottom:7px;line-height:1.5;border-left:2px solid '+catColor+'33;padding-left:7px">'+esc(s.desc)+'</div>':'')

        // ── 스탯 행
        +'<div style="display:flex;gap:6px;font-size:9px;font-family:\'Cinzel\',serif;margin-bottom:5px;flex-wrap:wrap">'
        +'<span style="color:#e05050">❤️ '+Math.round(s.hp)+'/'+s.maxHp+'</span>'
        +(s.atk?'<span style="color:#e0a050">⚔️ '+s.atk+'</span>':'')
        +(s.def?'<span style="color:#60a0e0">🛡 '+s.def+'</span>':'')
        +(s.spd?'<span style="color:#80e0a0">💨 '+s.spd+'</span>':'')
        +'<span style="color:'+loyColor+'">💛 '+(s.loyalty||70)+'</span>'
        +'<span style="color:'+affColor+'">💖 '+(s.affection||0)+'</span>'
        +'</div>'

        // ── HP바
        +'<div style="height:3px;background:#1a1005;border-radius:2px;overflow:hidden;margin-bottom:3px">'
        +'<div style="width:'+hpPct+'%;height:100%;background:'+hpColor+';border-radius:2px;transition:width .5s"></div></div>'

        // ── EXP바
        +'<div style="display:flex;align-items:center;gap:5px;margin-bottom:'+(s.skill?'6px':'5px')+'">'
        +'<div style="flex:1;height:3px;background:#0a0a1a;border-radius:2px;overflow:hidden">'
        +'<div style="width:'+expPct+'%;height:100%;background:'+(evoReady?'#e0c040':'#4060c0')+';border-radius:2px;transition:width .5s"></div></div>'
        +'<span style="font-size:8px;color:'+(evoReady?'#e0c040':'#4060c0')+';flex-shrink:0">'+curExp+'/'+reqExp+'</span>'
        +'</div>'

        // ── 스킬
        +(s.skill?'<div style="font-size:9px;color:#a060e0;margin-bottom:7px;padding:4px 7px;background:#0d0a18;border-radius:2px">✦ '+esc(s.skill)+(s.skillDesc?' — '+esc(s.skillDesc):'')+'</div>':'')

        // ── 진화 힌트
        +(evoReady
          ?'<div style="font-size:9px;color:#e0c040;padding:4px 7px;background:#1a1500;border:1px solid #3a3000;border-radius:2px;margin-bottom:7px">⚡ 진화 준비 완료 — 다음 행동에서 AI가 서사에 맞는 새 형태로 설계합니다</div>'
          :(nextThr?'<div style="font-size:8px;color:#4a3a2a;margin-bottom:7px">▶ Lv.'+nextThr+' 달성 시 '+(evoCount+1)+'차 진화 개방</div>':'')
        )

        // ── 임무 현황
        +(s.onMission&&s.currentMission
          ?'<div style="font-size:9px;color:#60a0e0;padding:4px 7px;background:#001020;border:1px solid #002040;border-radius:2px;margin-bottom:7px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s.currentMission,{size:14}):(s.currentMission?.icon))+' '+esc(s.currentMission.label)+' 임무 중 ('+Math.max(0,s.currentMission.duration-((S.msgCount||0)-(s.currentMission.startTurn||0)))+'턴 남음)</div>'
          :'')

        // ── 진화 히스토리
        +(s.evoHistory&&s.evoHistory.length
          ?'<details style="margin-bottom:7px"><summary style="font-size:8px;color:#5a4a3a;cursor:pointer;user-select:none">진화 기록 ('+s.evoHistory.length+'회)</summary><div style="padding:4px 0">'
            +s.evoHistory.map(h=>'<div style="font-size:8px;color:#4a3a2a;padding:2px 0">'+(h.fromIcon||'')+esc(h.from)+' → '+(h.toIcon||'')+esc(h.to)+' (Lv.'+h.atLevel+')</div>').join('')
            +'</div></details>'
          :'')

        // ── 액션 버튼
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px">'
        +'<button onclick="openSummonDialog(\''+s.id+'\')" style="padding:5px 2px;background:#0a1020;border:1px solid #1a3050;color:#6090c0;font-size:8px;cursor:pointer;border-radius:2px">💬 대화</button>'
        +'<button onclick="praiseSummon(\''+s.id+'\')" style="padding:5px 2px;background:#1a0a18;border:1px solid #3a1a38;color:#c060a0;font-size:8px;cursor:pointer;border-radius:2px">💖 칭찬</button>'
        +(s.onMission
          ?'<button disabled style="padding:5px 2px;background:#050808;border:1px solid #0a1010;color:#2a4040;font-size:8px;border-radius:2px;cursor:default">📨 파견중</button>'
          :'<button onclick="openMissionSelect(\''+s.id+'\')" style="padding:5px 2px;background:#0a1808;border:1px solid #1a3818;color:#60a060;font-size:8px;cursor:pointer;border-radius:2px">📨 임무</button>')
        +'<button onclick="openEnhanceSelect(\''+s.id+'\')" style="padding:5px 2px;background:#1a1508;border:1px solid #3a3010;color:#b0a040;font-size:8px;cursor:pointer;border-radius:2px">⬆️ 강화</button>'
        +'</div>'

        // ── 이름 변경 + 해제
        +'<div style="display:flex;gap:4px;margin-top:4px">'
        +'<input id="rename-'+s.id+'" placeholder="이름 변경..." style="flex:1;background:#080500;border:1px solid #2a1a05;color:var(--text);font-size:9px;padding:4px 6px" maxlength="20">'
        +'<button onclick="renameSummon(\''+s.id+'\',document.getElementById(\'rename-'+s.id+'\').value)" style="padding:4px 8px;background:#1a1005;border:1px solid #3a2a05;color:#a08030;font-size:8px;cursor:pointer">변경</button>'
        +'<button onclick="dismissSummon(\''+s.id+'\')" style="padding:4px 7px;background:#1a0808;border:1px solid #3a1a1a;color:#a05050;font-size:8px;cursor:pointer">해제</button>'
        +'</div>'

        +'</div>';
    }).join('');
  }

  // 해제 기록
  if(dismissed.length){
    html+='<div style="margin-top:10px"><div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">💨 해제된 소환수</div>';
    html+=dismissed.map(s=>'<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:#080500;border:1px solid #1a0a00;margin-bottom:2px;opacity:.5"><span>'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:14}):(s?.icon||'🔮'))+'</span><span style="font-size:9px;color:var(--dim)">'+esc(getSummonDisplayName(s))+'</span><span style="font-size:8px;color:#5a4a2a;margin-left:auto">Lv.'+(s.level||1)+' · '+(s.evoCount||0)+'진화</span></div>').join('');
    html+='</div>';
  }

  if(cfg.allowed&&cfg.allowed.length){
    const cl=cfg.allowed.map(c=>(SUMMON_CATEGORY[c]||{}).label||c).join(', ');
    html+='<div style="margin-top:10px;padding:7px 9px;background:#0a0a0a;border:1px dashed #2a2010;font-size:9px;color:var(--dim)">💡 이 직업은 <span style="color:var(--gold)">'+cl+'</span> 계열 소환에 특화</div>';
  }
  body.innerHTML=html;
  // [버그 수정] ui/155의 extendSummonPanel이 이 함수(정의된 곳 밖)에서
  // window.renderSummons를 감싸 시너지 정보·소환수 한정 퀘스트 버튼을
  // 덧붙이려 했지만, 이 함수의 실제 호출부가 전부 bare 식별자라 그
  // 감싸기가 적용된 적이 없다 — 소환수 패널을 열어도 시너지 안내와
  // 한정 퀘스트 버튼이 한 번도 보이지 않았다. 실제 정의부에 직접 연결한다.
  try{
    if(typeof window.checkSummonSynergies==='function'){
      const synBLS=window.checkSummonSynergies();
      if(synBLS){
        const div=document.createElement('div');
        div.style.cssText='margin-top:8px;padding:7px 9px;background:#0a0800;border:1px solid #3a2010;font-size:9px;color:#c0a060;line-height:1.6';
        div.innerHTML=synBLS.replace(/\n/g,'<br>');
        body.appendChild(div);
      }
    }
    const eligible=active.filter(s=>(s.evoCount||0)>=2);
    if(eligible.length && typeof window.loadSummonDepth==='function'){
      const div=document.createElement('div');
      div.style.cssText='margin-top:8px';
      div.innerHTML='<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);margin-bottom:4px">⭐ 소환수 한정 퀘스트</div>'
        +eligible.map(s=>{
          const dep=window.loadSummonDepth()[s.id]||{};
          const display=getSummonDisplayName(s);
          return '<button onclick="triggerSummonQuest(\''+s.id+'\')" style="width:100%;padding:5px;background:#0a0600;border:1px solid #3a2a05;color:#c0a030;font-size:8px;cursor:pointer;margin-bottom:3px;text-align:left">'
            +(s.icon||'🔮')+' '+esc(display)+'의 퀘스트 시작'+(dep.questActive?' (진행중)':'')+'</button>';
        }).join('');
      body.appendChild(div);
    }
  }catch(e){}
}
window.renderSummons = renderSummons;

window.renderSummons = renderSummons;

export function getSummonSystemBLS(){
  const summons=typeof window.loadSummons==='function'?window.loadSummons():[];
  const active=summons.filter(s=>s.status==='active');
  if(!active.length) return '';

  const lines=active.map(s=>{
    const lv=s.level||1;
    const persData=SUMMON_PERSONALITY_POOL.find(p=>p.id===s.personality)||{label:'?'};
    const evoReady=canSummonEvolve(s);
    return '• '+(s.icon||'🔮')+' '+getSummonDisplayName(s)
      +' ['+((SUMMON_CATEGORY[s.category]||{}).label||s.category)+' Lv.'+lv+' · '+persData.label+' · 기분:'+(s.mood||'neutral')+' · 충성:'+(s.loyalty||70)+' · 애정:'+(s.affection||0)+']'
      +' ATK:'+s.atk+' DEF:'+s.def+' HP:'+s.hp+'/'+s.maxHp
      +(s.skill?' 스킬:'+s.skill:'')
      +(s.onMission?' [임무중:'+(s.currentMission&&s.currentMission.label||'?')+']':'')
      +(evoReady?' ⚡진화대기':'');
  });

  // 진화 대기 소환수 상세 지시
  const evoReady=active.filter(canSummonEvolve);
  const evoInstr=evoReady.length
    ?'\n\n【⚡ 진화 대기 — 이번 응답에서 서사 묘사 후 GS 출력 필수】\n'
      +evoReady.map(s=>{
        const catLabel=(SUMMON_CATEGORY[s.category]||{}).label||s.category;
        const persData=SUMMON_PERSONALITY_POOL.find(p=>p.id===s.personality)||{label:''};
        const stageNames=['1차','2차','3차','4차','5차','6차'];
        const stageName=stageNames[s.evoCount||0]||'?';
        const scaleGuide=['각성(특기 싹틈)','개화(고유 아이덴티티)','군림(NPC 반응)','초월(세계관 영향)','신화(감시자 반응)','현현(세계 사건급)'];
        return s.icon+' '+getSummonDisplayName(s)+' → '+stageName+' 진화 ['+(s.evoCount||0)+'→'+(+(s.evoCount||0)+1)+'/6]\n'
          +'  계열:'+catLabel+' / 성격:'+persData.label+' / 기원:'+(s.origin||'')+' / 스킬:'+(s.skill||'없음')+'\n'
          +'  이번 스케일: '+(scaleGuide[s.evoCount||0]||'')+'\n'
          +'  서사·직업·지금까지 함께한 모험을 반영해 완전히 새로운 존재로 설계하라.\n'
          +'  "summon_evolve":[{"name":"'+getSummonDisplayName(s)+'","newName":"새이름","newIcon":"이모지","newDesc":"묘사","newSkill":"스킬명","newSkillDesc":"설명","newSpeechStyle":"말투","moodChange":"excited","statBoost":{"hp":50,"atk":18,"def":10}}]';
      }).join('\n')
    :'';

  return '\n\n[🔮 소환수 현황]\n'+lines.join('\n')
    +'\n【GS 필드】summon_exp:[{"name":"이름","exp":30}] / summon_evolve:[{...}] / summon_dialog:{"id":"id","reply":"답변","moodChange":"happy","affectionChange":5}'
    +'\n전투 처치 시 summon_exp 반드시 출력. 잡몹 15, 중형 35, 보스 80 기준.'
    +evoInstr;
}
window.getSummonSystemBLS = getSummonSystemBLS;

window.getSummonSystemBLS = getSummonSystemBLS;

window.getSummonGrowthBLS  = getSummonSystemBLS;

// [버그 수정] 이 자리에 있던 hookSummonGS는 window.sendMsg를 감싸는
// 방식이라(다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않았다. 그 중
// summon_add/summon_exp/summon_evolve/merc_evolve/caravan_evolve/
// summon_dialog는 combat/150의 processGSToAllDBs(실제 processGSBlock
// 체인의 베이스)가 이미 동일하게 처리하고 있어 손대지 않는다(순수 중복).
// checkMissionReturns()/전투 키워드 자동 경험치(giveSummonBattleExp)도
// ai-prompt/153에 동일한 로직이 있어 중복 — 그쪽 정리 작업(Task #69)에서
// 함께 정리한다. 여기서는 다른 곳에 있지 않은 고유 로직만
// window.processGSBlock(gs)에 옮겨 연결한다: summon_dismiss(해제),
// summon_damage(피해), summon_death의 상태 갱신(status='defeated',hp=0 —
// ui/155의 triggerSummonDeathStory는 "죽음 서사"만 트리거하고 실제
// summon.status는 바꾸지 않아, 이 부분이 빠지면 소환수가 서사상 죽어도
// 목록에는 계속 "생존" 상태로 남는 버그가 있었다).
(function hookSummonGS(){
  const tryPatch=function(){
    if(window._summonV3GSHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(tryPatch,1500); return; }
    window._summonV3GSHooked=true;
    const _orig=window.processGSBlock;
    window.processGSBlock=function(gs){
      const result=_orig.apply(this,arguments);
      try{
        if(gs){
          // summon_dismiss
          if(Array.isArray(gs.summon_dismiss)){
            const ss=window.loadSummons(); let ch=false;
            gs.summon_dismiss.forEach(name=>{ const s=ss.find(x=>x.status==='active'&&x.name&&(x.customName||x.name).includes(name.slice(0,4))); if(s){s.status='dismissed';ch=true;toast(s.icon+' '+getSummonDisplayName(s)+' 해제',2000);} });
            if(ch){window.saveSummons(ss);renderSummons();}
          }
          // summon_damage
          if(Array.isArray(gs.summon_damage)){
            const ss=window.loadSummons(); let ch=false;
            gs.summon_damage.forEach(d=>{ if(!d||!d.name) return; const s=ss.find(x=>x.status==='active'&&(x.customName||x.name)&&(x.customName||x.name).includes(d.name.slice(0,4))); if(!s) return; const dmg=(typeof calcAllyAttackDamage==='function')?calcAllyAttackDamage():Math.abs(Number(d.dmg)||0); s.maxHp=s.maxHp||100; s.hp=Math.max(0,(s.hp??s.maxHp)-dmg); ch=true; toast('💥 '+getSummonDisplayName(s)+' -'+dmg+' HP',2000); if(s.hp<=0) s.status='defeated'; }); if(ch){window.saveSummons(ss);renderSummons();}
          }
          // summon_death — 상태 갱신 (죽음 서사 자체는 ui/155가 별도 처리)
          if(Array.isArray(gs.summon_death)){
            const ss=window.loadSummons(); let ch=false;
            gs.summon_death.forEach(name=>{ const s=ss.find(x=>x.status==='active'&&(x.customName||x.name)&&(x.customName||x.name).includes(name.slice(0,4))); if(s){s.status='defeated';s.hp=0;ch=true;} }); if(ch){window.saveSummons(ss);renderSummons();}
          }
        }
      }catch(e){ console.warn('[SummonV3]',e); }
      return result;
    };
  };
  setTimeout(tryPatch,3000);
})();

(function hookSummonV3ToPrompt(){
  const tryPatch=function(){
    if(window._summonV3PromptHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(tryPatch,2800); return; }
    window._summonV3PromptHooked=true;
    const _o=window[fn];
    window[fn]=function(){ const r=_o.apply(this,arguments); try{ const b=getSummonSystemBLS(); return b&&typeof r==='string'?r+b:r; }catch(e){ return r; } };
  };
  setTimeout(tryPatch,4000);
})();

console.log('[TaleForge v36] 소환수 시스템 v3 (나혼자만레벨업 스타일) 로드 완료 ✓');

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_70(){
}

