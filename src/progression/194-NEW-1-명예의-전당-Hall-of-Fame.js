// ★ NEW 1: 명예의 전당 (Hall of Fame)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadCycleCount } from './014-환생-누적-시스템-110번.js';
import { loadAchievements } from './187-2-업적-시스템.js';

export const HOF_KEY = 'tf-hall-of-fame';

export function loadHallOfFame(){ try{ return JSON.parse(lsGet(HOF_KEY)||'[]'); }catch(e){ return []; } }
window.loadHallOfFame = loadHallOfFame;

export function saveHallOfFame(d){ lsSet(HOF_KEY, JSON.stringify(d)); }
window.saveHallOfFame = saveHallOfFame;

export function recordHallOfFame(endingId){
  if(!S.character) return;
  const hof = loadHallOfFame();
  const entry = {
    name:     S.character.name,
    race:     S.character.race||'인간',
    role:     S.character.role||'방랑자',
    icon:     S.character.icon||'👤',
    ending:   endingId||'unknown',
    cycle:    typeof loadCycleCount==='function' ? loadCycleCount() : 0,
    turns:    S.msgCount||0,
    level:    typeof loadPlayerLevel==='function' ? loadPlayerLevel() : 1,
    gold:     S.gold||0,
    stats:    {...(S.stats||{})},
    achCount: Object.keys(loadAchievements()||{}).length,
    savedAt:  new Date().toISOString(),
  };
  hof.unshift(entry);
  saveHallOfFame(hof.slice(0, 50)); // 최대 50개
  toast('🏆 명예의 전당에 기록되었습니다!', 3000);
}
window.recordHallOfFame = recordHallOfFame;

window.recordHallOfFame = recordHallOfFame;

export function renderHallOfFamePanel(){
  const body = document.getElementById('pb-halloffame');
  if(!body) return;
  const hof = loadHallOfFame();
  const ENDING_ICONS = {
    true_ending:'🌟', good_ending:'✨', hero_ending:'⚔️', villain_ending:'😈',
    sacrifice_ending:'💫', loop_master_ending:'♾️', neutral_ending:'⚖️', unknown:'❓'
  };
  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:4px">🏆 명예의 전당</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:12px">엔딩을 달성한 모든 캐릭터의 기록</div>
      ${hof.length===0?`<div style="text-align:center;padding:30px;font-size:11px;color:var(--dim)">아직 기록이 없습니다.<br>엔딩을 달성하면 이곳에 남습니다.</div>`:''}
      ${hof.map((e,i)=>{
        const endIcon = ENDING_ICONS[e.ending]||'❓';
        const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
        const date = new Date(e.savedAt).toLocaleDateString('ko-KR');
        return `<div style="padding:10px 12px;background:#080600;border:1px solid #2a2000;margin-bottom:6px;border-left:3px solid #c8a96e44">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:18px">${medal||(typeof getEntityIconHTML==='function'?getEntityIconHTML(e,{size:18}):e.icon)}</span>
            <div style="flex:1">
              <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e">${e.name}</div>
              <div style="font-size:9px;color:var(--dim)">${e.race} · ${e.role}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:10px;color:#a0c060">${endIcon} ${e.ending.replace('_ending','').replace('_',' ')}</div>
              <div style="font-size:8px;color:var(--dim)">${date}</div>
            </div>
          </div>
          <div style="display:flex;gap:12px;font-size:9px;color:var(--dim);border-top:1px solid #1a1400;padding-top:5px;margin-top:4px">
            <span>🔁 ${e.cycle}회차</span>
            <span>📜 ${e.turns}턴</span>
            <span>⭐ Lv.${e.level}</span>
            <span>💰 ${(e.gold||0).toLocaleString()}</span>
            <span>🏅 업적 ${e.achCount}개</span>
          </div>
        </div>`;
      }).join('')}
      ${hof.length>0?`<div style="text-align:center;margin-top:8px">
        <button class="btn btn-dark" onclick="if(confirm('명예의 전당을 초기화하시겠습니까?')){ lsSet('${HOF_KEY}','[]'); renderHallOfFamePanel(); toast('초기화됨',1200); }" style="font-size:9px">🗑️ 초기화</button>
      </div>`:''}
    </div>`;
}
window.renderHallOfFamePanel = renderHallOfFamePanel;

window.renderHallOfFamePanel = renderHallOfFamePanel;

// [버그 수정] 여기 있던 hookHofOnEnding은 window.triggerStoryEnding을
// 감싸는 방식이었다. triggerStoryEnding의 유일한 실제 호출부(job/042의
// 두 곳)가 quest/086에서 직접 import한 바인딩을 bare로 호출해서(다른
// 죽은 훅들과 동일한 원인) 이 감싸기가 한 번도 적용된 적이 없었다 —
// 어떤 엔딩을 달성해도 명예의 전당에는 영원히 아무 기록도 남지 않던
// 버그. 19차 감사에서 이 래퍼 내부의 "인자로 endingId가 넘어올 것"이라는
// 잘못된 가정(실제로는 무인자 호출)까지 고쳤지만, 정작 래퍼 자체가
// 죽어있어 그 수정도 무의미했다. recordHallOfFame(top.id) 호출을
// triggerStoryEnding() 정의부(quest/086, 이미 top을 계산해둔 바로 그
// 자리) 안으로 네이티브로 옮겼다.
