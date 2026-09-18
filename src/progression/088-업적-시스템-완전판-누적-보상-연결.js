// 🏆 업적 시스템 (완전판) — 누적, 보상 연결
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { ACH_REWARDS } from '../data/088-업적-시스템-완전판-누적-보상-연결.js';
import { ACHIEVEMENT_DEFS } from '../data/187-2-업적-시스템.js';
import { STAT_ACHIEVEMENTS } from '../data/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { saveSession } from '../misc/001-block0-preamble.js';
import { gainExp } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadAchievements } from './187-2-업적-시스템.js';

export const ACH_REWARD_KEY = 'tf-ach-rewards-v2';

export function loadAchRewards(){ try{ return JSON.parse(lsGet(ACH_REWARD_KEY)||'{}'); }catch(e){ return {}; } }
window.loadAchRewards = loadAchRewards;

export function saveAchRewards(d){ try{ lsSet(ACH_REWARD_KEY, JSON.stringify(d)); }catch(e){} }
window.saveAchRewards = saveAchRewards;

export function applyAchievementReward(achId){
  const reward = ACH_REWARDS[achId];
  if(!reward) return;
  const claimed = loadAchRewards();
  if(claimed[achId]) return;
  claimed[achId] = true;
  saveAchRewards(claimed);
  if(!S.stats) return;
  const stat = reward.stat;
  const amount = reward.amount||0;
  // stat별 처리
  if(stat==='hp'){
    S.stats.maxHp = (S.stats.maxHp||100) + amount;
    S.stats.hp    = Math.min(S.stats.maxHp, (S.stats.hp||100) + amount);
  } else if(stat==='mp'){
    S.stats.maxMp = (S.stats.maxMp||50) + amount;
    S.stats.mp    = Math.min(S.stats.maxMp, (S.stats.mp||50) + amount);
  } else if(stat==='exp'){
    if(typeof gainExp==='function') gainExp(amount);
    else { /* EXP는 별도 시스템 - updateStats로만 기록 */ window.updateStats('totalExp', amount); }
  } else {
    // 일반 스탯 직접 증가
    S.stats[stat] = Math.min(999, (S.stats[stat]||0) + amount);
  }
  if(typeof window.updateHeader==='function') window.updateHeader();
  if(typeof saveSession==='function')  saveSession();
  toast(`🎁 업적 보상: ${reward.label}`, 2500);
}
window.applyAchievementReward = applyAchievementReward;

window.applyAchievementReward = applyAchievementReward;

// [버그 수정] 여기 있던 window.unlockAchievement 감싸기(달성 시 보상 지급)는
// unlockAchievement가 정의된 progression/187의 모든 실제 호출부가 bare
// 식별자로 호출해서 한 번도 적용되지 못했다 — 다른 죽은 훅들과 동일한
// 원인. 같은 로직을 실제 정의부(progression/187의 unlockAchievement 함수
// 본문)에 네이티브로 옮겼다.

export function renderAchievementsPanel(){
  const body = document.getElementById('pb-achievements');
  if(!body) return;
  const myAch    = loadAchievements()||{};
  const claimed  = loadAchRewards()||{};
  const allDefs  = {...ACHIEVEMENT_DEFS};
  // STAT_ACHIEVEMENTS도 포함
  if(typeof STAT_ACHIEVEMENTS !== 'undefined'){
    STAT_ACHIEVEMENTS.forEach(a=>{ allDefs[a.key] = {name:a.label.replace(/^.*? /,''), icon:a.label.match(/./)[0], desc:a.reward, rarity:'hidden'}; });
  }
  const rarityColor = {common:'#8a9a8a',uncommon:'#4a9a6a',rare:'#4a6fa5',legendary:'#c8a96e',hidden:'#a060c0'};
  const rarityLabel = {common:'일반',uncommon:'비범',rare:'희귀',legendary:'전설',hidden:'숨김'};
  const total    = Object.keys(allDefs).length;
  const unlocked = Object.keys(myAch).filter(k=>allDefs[k]).length;

  // 카테고리 분류 (ACHIEVEMENT_DEFS의 cat 필드 기반으로 자동 분류)
  const catOrder = ['성장','전투','관계','탐험','서사','엔딩','환생','종족','경제','특수','히든'];
  const catIcons = {성장:'🌱',전투:'⚔️',관계:'🤝',탐험:'🌍',서사:'📜',엔딩:'🌌',환생:'🔁',종족:'🏅',경제:'💰',특수:'🎯',히든:'🕵️'};
  const categories = {};
  catOrder.forEach(c=>categories[c]=[]);
  Object.entries(allDefs).forEach(([id,def])=>{
    const c = def.cat||'특수';
    if(categories[c]) categories[c].push(id);
    else categories['특수'].push(id);
  });
  // 숨겨진 업적(STAT_ACHIEVEMENTS) 별도 추가
  if(typeof STAT_ACHIEVEMENTS!=='undefined'){
    if(!categories['숨김']) categories['숨김']=[];
    STAT_ACHIEVEMENTS.forEach(a=>categories['숨김'].push(a.key));
  }

  let html = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);letter-spacing:1px;margin-bottom:6px">🏆 업적 (${unlocked}/${total})</div>
      <div style="height:6px;background:#1a1000;border-radius:3px;overflow:hidden;margin-bottom:12px">
        <div style="height:100%;width:${Math.round(unlocked/Math.max(total,1)*100)}%;background:linear-gradient(90deg,#c8a030,#e8c050);transition:width .4s"></div>
      </div>`;

  for(const cat of [...catOrder, '숨김']){
    const ids = categories[cat]||[];
    const catAchs = ids.map(id=>({id, def:allDefs[id]||STAT_ACHIEVEMENTS?.find(a=>a.key===id) && {name:STAT_ACHIEVEMENTS.find(a=>a.key===id).label,icon:'🏆',desc:STAT_ACHIEVEMENTS.find(a=>a.key===id).reward,rarity:'hidden',cat:'숨김'}, unlocked:!!myAch[id], claimed:!!claimed[id]})).filter(a=>a.def);
    if(!catAchs.length) continue;
    const catUnlocked = catAchs.filter(a=>a.unlocked).length;
    const catIcon = catIcons[cat]||'🏅';
    html += `
      <div style="margin-bottom:12px">
        <div style="font-family:Cinzel,serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px;display:flex;justify-content:space-between">
          <span>${catIcon} ${cat}</span><span style="color:${catUnlocked===catAchs.length?'#60c060':'var(--dim)'}">${catUnlocked}/${catAchs.length}</span>
        </div>
        ${catAchs.map(({id,def,unlocked,claimed})=>{
          const rc = rarityColor[def.rarity]||'#8a9a8a';
          const reward = ACH_REWARDS[id];
          const isHiddenLocked = def.hidden && !unlocked;
          // 히든 업적이 잠겨있을 땐 절대 실제 이미지를 노출하지 않는다(정체를
          // 미리 알려주면 안 됨) — 그 경우만 물음표 그대로 유지.
          const iconHtml = isHiddenLocked ? '❓'
            : (typeof getEntityIconHTML==='function' ? getEntityIconHTML({id, name:def.name, icon:def.icon||'🏆'}, {size:18}) : (def.icon||'🏆'));
          return `<div style="padding:8px 10px;background:${unlocked?'#0d0a00':'#060604'};border:1px solid ${unlocked?rc+'55':'#1a1a1a'};margin-bottom:3px;display:flex;align-items:center;gap:8px;opacity:${unlocked?1:.45}">
            <span style="font-size:18px;filter:${unlocked?'none':'grayscale(1)'}">${iconHtml}</span>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
                <span style="font-family:Cinzel,serif;font-size:10px;color:${unlocked?rc:'var(--dim)'}">${unlocked?def.name:'???'}</span>
                <span style="font-size:7px;padding:1px 4px;background:${rc}22;border:1px solid ${rc}44;color:${rc};border-radius:2px">${rarityLabel[def.rarity]||def.rarity}</span>
              </div>
              <div style="font-size:9px;color:var(--dim);margin-top:2px">${unlocked?def.desc:(isHiddenLocked?'조건을 알 수 없다...':'미달성')}</div>
              ${reward&&unlocked?`<div style="font-size:9px;color:${claimed?'var(--dim)':'#60c060'};margin-top:2px">${claimed?'✓ 보상 수령됨':'🎁 '+reward.label}</div>`:''}
            </div>
            ${reward&&unlocked&&!claimed?`<button onclick="applyAchievementReward('${id}');renderAchievementsPanel()" style="padding:4px 10px;background:#0d1a00;border:1px solid #3a6020;color:#80c040;font-size:8px;cursor:pointer;font-family:Cinzel,serif;white-space:nowrap">수령</button>`:''}
          </div>`;
        }).join('')}
      </div>`;
  }
  html += `</div>`;
  body.innerHTML = html;
}
window.renderAchievementsPanel = renderAchievementsPanel;

window.renderAchievementsPanel = renderAchievementsPanel;
