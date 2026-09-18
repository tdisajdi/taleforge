// 10. 혈통 패널 UI — 완전히 자동 표시
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { BLOODLINE_MASTER } from '../data/124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { getBloodlineEvolution } from '../progression/126-5-회차-진화-완전-자동.js';
import { loadBL } from './124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';

window.renderBloodlinePanel = function(){
  const body = document.getElementById('pb-bloodline');
  if(!body) return;

  const bl  = loadBL();
  const evo = getBloodlineEvolution();

  if(!bl?.type){
    // 미배정 — 게임 시작하면 자동 배정됨 안내
    body.innerHTML=`
      <div style="padding:20px;text-align:center">
        <div style="font-size:40px;margin-bottom:12px;opacity:.5">🩸</div>
        <div style="font-family:Cinzel,serif;font-size:12px;color:#e04060;margin-bottom:8px">숨겨진 혈통</div>
        <div style="font-size:11px;color:var(--dim);line-height:1.8">
          캐릭터를 생성하면 혈통이 자동으로 배정됩니다.<br>
          혈통의 존재는 서사 속에서 자연스럽게 드러납니다.
        </div>
      </div>`;
    return;
  }

  const def   = BLOODLINE_MASTER[bl.type]||{};
  const turn  = S.msgCount||0;
  const isActive  = bl.awakened && bl.activeUntil && turn <= bl.activeUntil;
  const canAwaken = !bl.awakened || (bl.activeUntil && turn > bl.activeUntil+20);
  const cycle = typeof loadCycleCount==='function'?loadCycleCount():0;

  // 진화 단계 바
  const BL_EVO = {
    3:{label:'1단계'},7:{label:'2단계'},12:{label:'3단계(최종)'}
  };
  const evoPct = Math.min(100, Math.round(cycle/12*100));

  body.innerHTML = `
    <div style="padding:10px 14px">
      <!-- 헤더 -->
      <div style="padding:12px;background:#0d0608;border:1px solid ${def.color||'#882020'}44;margin-bottom:10px;border-left:3px solid ${def.color||'#882020'}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span style="font-size:28px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:28}):(def.icon||"🩸")}</span>
          <div>
            <div style="font-family:Cinzel,serif;font-size:13px;color:${def.color||'#e04060'}">${evo?.stageName||def.name}</div>
            <div style="font-size:9px;color:var(--dim)">${def.name} ${cycle>0?`→ ${evo?.stageName}`:''}</div>
          </div>
          <div style="margin-left:auto;text-align:right">
            ${isActive
              ? `<span style="font-size:10px;color:#60c060;animation:pulse 1s infinite">⚡ 각성 중</span>`
              : canAwaken
              ? `<span style="font-size:9px;color:#a08040">대기 중</span>`
              : `<span style="font-size:9px;color:var(--dim)">충전 중 (${(bl.activeUntil||0)+20-turn}턴)</span>`
            }
          </div>
        </div>
        <div style="font-size:9px;color:#8a7060;line-height:1.5">${def.desc||''}</div>
      </div>

      <!-- 힌트 -->
      <div style="padding:8px 10px;background:#08060a;border:1px solid #1a1020;margin-bottom:8px">
        <div style="font-size:8px;color:var(--dim);margin-bottom:3px">🔍 발견된 징후</div>
        <div style="font-size:9px;color:#8a8060;font-style:italic">"${def.hint||''}"</div>
        ${bl.hints?.length ? bl.hints.map(h=>`
          <div style="font-size:8px;color:#6a8060;margin-top:3px;padding-top:3px;border-top:1px solid #1a1a0a">
            턴${h.turn}: ${h.text}
          </div>`).join('') : ''}
      </div>

      <!-- 각성 스킬 -->
      <div style="padding:8px 10px;background:#0a0806;border:1px solid ${def.color||'#882020'}33;margin-bottom:8px">
        <div style="font-size:8px;color:var(--dim);margin-bottom:3px">⚡ 각성 능력</div>
        <div style="font-size:10px;color:${def.color||'#e04060'};margin-bottom:2px">${def.skill||''}</div>
        <div style="font-size:9px;color:#8a7060">${def.skillDesc||''}</div>
        <div style="font-size:8px;color:var(--dim);margin-top:3px">조건: ${def.awakeCond||''}</div>
      </div>

      <!-- 패시브 스탯 -->
      <div style="padding:8px 10px;background:#060a08;border:1px solid #1a2010;margin-bottom:8px">
        <div style="font-size:8px;color:var(--dim);margin-bottom:4px">📊 혈통 패시브</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${Object.entries(def.passiveStats||{}).map(([k,v])=>`
            <span style="font-size:9px;padding:2px 6px;background:#0a1408;border:1px solid #2a3020;color:#80c060">
              ${k.toUpperCase()} +${v}
            </span>`).join('')}
        </div>
      </div>

      <!-- 진화 현황 -->
      <div style="padding:8px 10px;background:#080608;border:1px solid #1a1020;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--dim);margin-bottom:4px">
          <span>진화 현황 (${cycle}회차)</span>
          <span style="color:${def.color||'#e04060'}">${evo?.stageName||def.name}</span>
        </div>
        <div style="height:5px;background:#1a1020;border-radius:3px;overflow:hidden;margin-bottom:4px">
          <div style="width:${evoPct}%;height:100%;background:linear-gradient(90deg,${def.color||'#882020'}80,${def.color||'#882020'});border-radius:3px;transition:width .5s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:7px;color:#3a2030">
          ${Object.entries(BL_EVO).map(([req,{label}])=>`
            <span style="color:${cycle>= +req?(def.color||'#e04060'):'#3a2030'}">${label}(${req}회)</span>`).join('')}
        </div>
      </div>

      <!-- 기원 -->
      <div style="padding:8px 10px;background:#080608;border:1px solid #1a1020">
        <div style="font-size:8px;color:var(--dim);margin-bottom:3px">📖 혈통의 기원</div>
        <div style="font-size:9px;color:#8a7060;line-height:1.6;font-style:italic">
          ${bl.origin || '아직 밝혀지지 않은 비밀. 플레이하며 자연스럽게 드러납니다.'}
        </div>
        <div style="font-size:8px;color:var(--dim);margin-top:4px">${def.lore||''}</div>
      </div>

      ${bl.awakeCount>0?`<div style="margin-top:8px;font-size:8px;color:var(--dim);text-align:center">각성 횟수: ${bl.awakeCount}회</div>`:''}
    </div>`;
};
