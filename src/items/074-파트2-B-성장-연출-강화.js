// 파트2-B: 성장 연출 강화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getStatInfo } from '../job/010-스킬-강화-시스템.js';
import { esc } from '../utils.js';

export function dramaticEvolution(stageName, stageIcon){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.97);display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="text-align:center;padding:30px;max-width:320px">
      <div style="font-size:56px;margin-bottom:16px">${stageIcon}</div>
      <div style="font-family:Cinzel,serif;font-size:12px;color:var(--dim);letter-spacing:3px;margin-bottom:8px">EVOLUTION</div>
      <div style="font-family:Cinzel,serif;font-size:22px;color:#c8a96e;margin-bottom:20px">${esc(stageName)}</div>
      <div style="font-size:11px;color:var(--dim);line-height:1.6;margin-bottom:20px">새로운 힘이 깨어났다.<br>세계가 변화를 감지한다.</div>
      <button onclick="this.parentElement.parentElement.remove()"
        style="padding:10px 24px;background:var(--gold);border:none;color:#000;font-family:Cinzel,serif;font-size:11px;cursor:pointer">
        계속하기
      </button>
    </div>`;
  document.body.appendChild(overlay);
}
window.dramaticEvolution = dramaticEvolution;

export function dramaticJobChange(jobName, jobIcon){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.97);display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="text-align:center;padding:30px;max-width:320px">
      <div style="font-size:52px;margin-bottom:16px">${jobIcon}</div>
      <div style="font-family:Cinzel,serif;font-size:11px;color:var(--dim);letter-spacing:3px;margin-bottom:8px">JOB CHANGE</div>
      <div style="font-family:Cinzel,serif;font-size:24px;color:#c8a96e;margin-bottom:16px">${esc(jobName)}</div>
      <div style="font-size:11px;color:var(--dim);line-height:1.6;margin-bottom:20px">새로운 길이 열렸다.</div>
      <button onclick="this.parentElement.parentElement.remove()"
        style="padding:10px 24px;background:var(--gold);border:none;color:#000;font-family:Cinzel,serif;font-size:11px;cursor:pointer">
        계속하기
      </button>
    </div>`;
  document.body.appendChild(overlay);
}
window.dramaticJobChange = dramaticJobChange;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_61(){
function dramaticLevelUp(prevLevel, newLevel){
  document.getElementById('levelup-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'levelup-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:8000;background:radial-gradient(ellipse at center,#1a0a00 0%,#000 70%);display:flex;align-items:center;justify-content:center;animation:fadeIn .4s ease';

  // 스탯 포인트 계산
  const levelsGained = newLevel - prevLevel;
  const pointsGained = levelsGained * 5;
  // 상징적 스탯 상승 표시 (실제 스탯 배분은 플레이어가 직접)
  const statKeys = ['str','agi','end','mgc','int','per','luk','wil'];
  const picks = [...statKeys].sort(()=>Math.random()-.5).slice(0,2);
  const gainLines = picks.map(k=>{
    const info = typeof getStatInfo==='function' ? getStatInfo(k) : null;
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #1a1005">
      <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(info,{size:14}):(info?.icon||'📊')}</span>
      <span style="flex:1;font-size:10px;color:var(--dim)">${info?.name||k}</span>
      <span style="color:#60d060;font-family:'Cinzel',serif">+2 <span style="font-size:8px;color:#3a6030">자동 상승</span></span>
    </div>`;
  }).join('');

  // 실제 자동 스탯 상승 적용
  picks.forEach(k=>{ if(S?.stats) S.stats[k] = Math.min(999, (S.stats[k]||50) + 2); });

  overlay.innerHTML = `
    <div style="text-align:center;max-width:320px;padding:30px 20px">
      <div style="font-size:56px;margin-bottom:8px;animation:float 1s ease-in-out infinite alternate">⭐</div>
      <div style="font-family:'Cinzel',serif;font-size:26px;color:#c8a96e;letter-spacing:4px;margin-bottom:4px">LEVEL UP</div>
      <div style="font-family:'Cinzel',serif;font-size:52px;color:#f0d070;margin-bottom:12px;text-shadow:0 0 24px #e0a030">${newLevel}</div>
      <div style="background:#0a0500;border:1px solid #3a2010;padding:10px 14px;margin-bottom:12px;text-align:left;border-left:3px solid #c8a96e">
        <div style="font-family:'Cinzel',serif;font-size:8px;color:#6a4020;margin-bottom:6px;letter-spacing:1px">자동 스탯 상승</div>
        ${gainLines}
      </div>
      <div style="font-size:10px;color:#c8a96e;margin-bottom:4px;font-family:'Cinzel',serif">📊 스탯 포인트 +${pointsGained} 획득</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:18px">스탯 배분 패널에서 원하는 스탯에 투자하세요</div>
      <button onclick="document.getElementById('levelup-overlay').remove();openP('statalloc');if(typeof renderStatAllocPanel==='function')renderStatAllocPanel();"
        style="padding:11px 24px;background:linear-gradient(135deg,#2a1505,#3a2008);border:1px solid #c8a96e;color:#c8a96e;
          font-family:'Cinzel',serif;font-size:11px;cursor:pointer;letter-spacing:1px;margin-right:6px">
        📊 스탯 배분
      </button>
      <button onclick="document.getElementById('levelup-overlay').remove();"
        style="padding:11px 18px;background:#0a0500;border:1px solid #2a1005;color:#4a3015;font-family:'Cinzel',serif;font-size:10px;cursor:pointer">
        ✕
      </button>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(()=>{ if(overlay.parentNode){ overlay.style.opacity='0'; overlay.style.transition='opacity .5s'; setTimeout(()=>overlay.remove(),500); } }, 8000);
}
window.dramaticLevelUp = dramaticLevelUp;
}

