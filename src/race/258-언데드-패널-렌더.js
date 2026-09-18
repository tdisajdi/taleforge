// 💀 언데드 패널 렌더
// Auto-extracted from taleforge.html (original section banner preserved above).
import { UNDEAD_DEATH_SCALE_STAGES, UNDEAD_DEBT_STAGES, UNDEAD_SOUL_TEMP_STAGES, advanceUndeadChain, applyUndeadBorrowedTimeStats, chooseUndeadChainType, clearUndeadBorrowedTime, detectUndeadActionFromText, getUndeadBorrowedTimeStatus, isUndeadRace, loadUndeadBorrowedTime, saveUndeadBorrowedTime, triggerUndeadAction } from '../combat/257-renderMiniMap-던전-미니맵-일반-미니맵.js';
import { UNDEAD_ACTION_TYPES, UNDEAD_CHAIN_TYPES, UNDEAD_DEATH_SIGHT_LEVELS } from '../data/257-renderMiniMap-던전-미니맵-일반-미니맵.js';

export function renderUndeadBorrowedTimePanel() {
  const body = document.getElementById('pb-undead-borrowed-time');
  if (!body) return;

  if (!isUndeadRace()) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">💀</div>
      <div>언데드 캐릭터에게만 활성화됩니다.</div>
      <div style="margin-top:6px;font-size:10px">캐릭터 설정에서 종족을 언데드로 선택하세요.</div>
    </div>`;
    return;
  }

  const status = getUndeadBorrowedTimeStatus();
  const data = status;
  const tempStg  = status.tempStage;
  const debtStg  = status.debtStage;
  const scaleStg = status.scaleStage;
  const sightDef = status.sightDef;
  const chainDef = status.chainDef;
  const tc = tempStg.color;
  const dc = debtStg.color;
  const sc = scaleStg.color;

  body.innerHTML = `

    <!-- ① 헤더: 세 게이지 요약 -->
    <div style="padding:14px 14px 10px;background:linear-gradient(135deg,#060010,#0d0018);border-bottom:2px solid #3a2060;margin-bottom:0">
      <div style="font-family:'Cinzel',serif;font-size:11px;color:#8060c0;letter-spacing:2px;text-align:center;margin-bottom:10px">💀 빌린 시간 (BORROWED TIME)</div>

      <!-- 감정 온도계 -->
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span style="font-size:10px;color:${tc};font-family:'Cinzel',serif">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tempStg,{size:10}):(tempStg.icon)} ${tempStg.name}</span>
          <span style="font-family:'Cinzel',serif;font-size:13px;color:${tc}">${data.soulTemp}<span style="font-size:8px;color:#4a3a6a"> /100</span></span>
        </div>
        <div style="height:5px;background:#0d000e;border-radius:3px;overflow:hidden">
          <div style="width:${data.soulTemp}%;height:100%;background:linear-gradient(90deg,#3060b0,${tc});border-radius:3px;transition:width .4s"></div>
        </div>
        <div style="font-size:8px;color:#4a3a6a;margin-top:2px;text-align:right">감정 온도</div>
      </div>

      <!-- 세계의 빚 -->
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span style="font-size:10px;color:${dc};font-family:'Cinzel',serif">${typeof getEntityIconHTML==='function'?getEntityIconHTML(debtStg,{size:10}):(debtStg.icon)} 세계의 빚 — ${debtStg.name}</span>
          <span style="font-family:'Cinzel',serif;font-size:13px;color:${dc}">${data.worldDebt}<span style="font-size:8px;color:#4a3a2a"> /100</span></span>
        </div>
        <div style="height:5px;background:#0d0000;border-radius:3px;overflow:hidden">
          <div style="width:${data.worldDebt}%;height:100%;background:linear-gradient(90deg,#604020,${dc});border-radius:3px;transition:width .4s"></div>
        </div>
        <div style="font-size:8px;color:#4a2a2a;margin-top:2px;text-align:right">낮을수록 좋다</div>
      </div>

      <!-- 두 번째 죽음의 저울 -->
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span style="font-size:10px;color:${sc};font-family:'Cinzel',serif">${typeof getEntityIconHTML==='function'?getEntityIconHTML(scaleStg,{size:10}):(scaleStg.icon)} ${scaleStg.name}</span>
          <span style="font-family:'Cinzel',serif;font-size:13px;color:${sc}">${data.deathScale}<span style="font-size:8px;color:#4a4a2a"> /100</span></span>
        </div>
        <div style="height:5px;background:#0d0e00;border-radius:3px;overflow:hidden">
          <div style="width:${data.deathScale}%;height:100%;background:linear-gradient(90deg,#404020,${sc});border-radius:3px;transition:width .4s"></div>
        </div>
        <div style="font-size:8px;color:#4a4a2a;margin-top:2px;text-align:right">두 번째 죽음의 자격</div>
      </div>
    </div>

    <!-- ② 미완성의 사슬 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#8060c0;letter-spacing:1px;margin-bottom:8px">── ⛓️ 미완성의 사슬 ──</div>

      ${chainDef ? `
        <div style="padding:8px 10px;background:#0a0015;border:1px solid ${chainDef.color}44;border-radius:2px;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
            <span style="color:${chainDef.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(chainDef,{size:16}):(chainDef.svgIcon||chainDef.icon)}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:11px;color:${chainDef.color}">${chainDef.label}</div>
              <div style="font-size:8px;color:#5a3a7a;margin-top:1px;font-style:italic">"${chainDef.desc}"</div>
            </div>
            <div style="text-align:right">
              <div style="font-family:'Cinzel',serif;font-size:16px;color:${chainDef.color}">${data.chainProgress}<span style="font-size:8px;color:#4a2a6a">/100</span></div>
            </div>
          </div>
          <!-- 사슬 진척 바 -->
          <div style="height:6px;background:#0d000e;border-radius:3px;overflow:hidden;margin-bottom:4px">
            <div style="width:${data.chainProgress}%;height:100%;background:linear-gradient(90deg,${chainDef.color}88,${chainDef.color});border-radius:3px;transition:width .4s;${data.chainProgress>=100?'animation:pulse 1.5s infinite':''}"></div>
          </div>
          ${data.chainProgress >= 100 ? `<div style="font-size:9px;color:#c0d060;text-align:center;font-family:'Cinzel',serif">✨ 사슬 완성 — 두 번째 죽음을 선택할 자격을 얻었다</div>` : `<div style="font-size:8px;color:#4a2a6a">완성까지 ${100 - data.chainProgress} 남음 · 완성된 사슬: ${data.chainsCompleted}회</div>`}
        </div>
        <!-- 사슬 진척 수동 버튼 -->
        <button onclick="advanceUndeadChain(10);renderUndeadBorrowedTimePanel()"
          style="width:100%;padding:7px;background:#0a0010;border:1px solid ${chainDef.color}66;color:${chainDef.color};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">
          ⛓️ 사슬 진척 +10
        </button>
      ` : `
        <div style="font-size:9px;color:#5a3a7a;margin-bottom:8px">이 언데드가 죽지 못한 이유를 선택하세요. 선택한 집착이 이 세계에 발을 묶는 사슬이 됩니다.</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
          ${Object.entries(UNDEAD_CHAIN_TYPES).map(([id, ct]) => `
            <button onclick="chooseUndeadChainType('${id}');renderUndeadBorrowedTimePanel()"
              style="padding:8px 6px;background:#0a0010;border:1px solid ${ct.color}55;color:${ct.color};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px;text-align:left;line-height:1.5">
              ${ct.icon} ${ct.label}<br>
              <span style="font-size:8px;color:#3a2a5a;font-family:'Crimson Text',serif">${ct.desc.slice(0,22)}...</span>
            </button>
          `).join('')}
        </div>
      `}
    </div>

    <!-- ③ 감정 온도 상세 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#8060c0;letter-spacing:1px;margin-bottom:7px">── 🌡️ 감정 온도계 ──</div>
      <div style="padding:8px 10px;background:#080010;border:1px solid ${tc}44;border-radius:2px;margin-bottom:7px">
        <div style="font-family:'Cinzel',serif;font-size:11px;color:${tc};margin-bottom:4px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tempStg,{size:11}):(tempStg.icon)} ${tempStg.name} (${data.soulTemp}/100)</div>
        <div style="font-size:9px;color:#7050a0;line-height:1.6;font-style:italic">"${tempStg.desc}"</div>
        <div style="font-size:9px;color:#5a3a7a;margin-top:5px">${tempStg.aura}</div>
      </div>

      <!-- 온도 단계 진행 표시 -->
      <div style="display:flex;flex-direction:column;gap:2px;margin-bottom:7px">
        ${UNDEAD_SOUL_TEMP_STAGES.map((s, i) => {
          const active = data.soulTemp >= s.range[0] && data.soulTemp <= s.range[1];
          return `<div style="display:flex;align-items:center;gap:5px;padding:3px 7px;background:${active?'#120020':'#080010'};border:1px solid ${active?s.color:s.color+'22'};border-radius:2px;opacity:${active?1:0.45}">
            <span style="display:inline-flex;width:11px;height:11px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:11}):((s.svgIcon||'').replace('width="20" height="20"','width="11" height="11"')||s.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:8px;color:${active?s.color:'#4a2a6a'};flex:1">${s.name}</span>
            <span style="font-size:8px;color:#3a2a5a">${s.range[0]}~${s.range[1]}</span>
            ${active ? `<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀</span>` : ''}
          </div>`;
        }).join('')}
      </div>

      <!-- 스탯 보너스/페널티 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">
        ${Object.entries(tempStg.statBonus || {}).map(([k,v]) => `
          <div style="padding:3px 7px;background:#0a000a;border:1px solid #2a0030;border-radius:2px;font-size:9px">
            <span style="color:${tc}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span>
          </div>`).join('')}
        ${Object.entries(tempStg.statPenalty || {}).map(([k,v]) => `
          <div style="padding:3px 7px;background:#0a0000;border:1px solid #2a0000;border-radius:2px;font-size:9px">
            <span style="color:#a06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:4px">${v}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- ④ 죽음 너머의 눈 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#8060c0;letter-spacing:1px;margin-bottom:7px">── 👁️ 죽음 너머의 눈 ──</div>
      <div style="font-size:9px;color:#5a4a7a;margin-bottom:7px">감정 온도가 낮을수록 자동 해금됩니다. 플레이어의 선택이 아닌, 냉정해진 대가로 열리는 감각입니다.</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${UNDEAD_DEATH_SIGHT_LEVELS.map((s) => {
          const active = s.level === data.deathSightLevel;
          const unlocked = s.level <= data.deathSightLevel;
          return `<div style="padding:6px 9px;background:${active?'#0a1520':unlocked?'#060d10':'#060810'};border:1px solid ${active?'#4080c0':unlocked?'#204050':'#101820'};border-radius:2px">
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:13}):(s.icon)}</span>
              <div style="flex:1">
                <span style="font-family:'Cinzel',serif;font-size:9px;color:${active?'#6090d0':unlocked?'#4070a0':'#2a3a4a'}">${s.name}</span>
                ${active ? '<span style="font-size:8px;color:#4080c0;margin-left:5px;font-family:\'Cinzel\',serif">◀ 현재</span>' : ''}
                ${!unlocked ? '<span style="font-size:9px;color:#2a3a4a;margin-left:auto">🔒</span>' : ''}
              </div>
            </div>
            ${unlocked || active ? `<div style="font-size:8px;color:#3a5a70;margin-top:3px">${s.desc}</div>` : ''}
            ${(active || unlocked) && s.ability ? `<div style="font-size:8px;color:#4080c0;margin-top:2px">✓ ${s.ability}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ⑤ 해금 스킬 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#8060c0;letter-spacing:1px;margin-bottom:7px">── ✨ 해금된 스킬 ──</div>
      <div style="font-size:8px;color:#4a3a6a;margin-bottom:7px">감정 온도 단계와 집착 진척도에 따라 자동 해금됩니다.</div>

      <!-- 감정 온도 스킬 -->
      ${(tempStg.skills || []).length > 0 ? `
        <div style="font-family:'Cinzel',serif;font-size:8px;color:${tc};letter-spacing:1px;margin-bottom:4px">🌡️ 감정 온도 스킬 [${tempStg.name}]</div>
        <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:10px">
          ${(tempStg.skills || []).map(sk => `
            <div style="padding:7px 9px;background:#080015;border:1px solid ${tc}55;border-radius:2px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                <span style="font-size:15px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:15}):(sk.icon)}</span>
                <div style="flex:1">
                  <span style="font-family:'Cinzel',serif;font-size:9px;color:${tc}">${sk.name}</span>
                  <span style="font-size:8px;color:#6040a0;margin-left:6px;font-family:'Cinzel',serif">${sk.rarity === 'legendary' ? '⭐ 전설' : sk.rarity === 'epic' ? '💜 희귀' : sk.rarity === 'rare' ? '🔵 레어' : '⚪ 언커먼'}</span>
                </div>
                <span style="font-size:8px;color:${tc};font-family:'Cinzel',serif">✅ 활성</span>
              </div>
              <div style="font-size:8px;color:#5a3a7a;line-height:1.5">${sk.desc}</div>
              <div style="font-size:8px;color:#4060a0;margin-top:2px;font-style:italic">📌 ${sk.conditionDesc}</div>
            </div>
          `).join('')}
        </div>
      ` : `<div style="font-size:8px;color:#3a2a5a;margin-bottom:8px;font-style:italic">현재 감정 온도 단계에는 해금 스킬이 없습니다.</div>`}

      <!-- 집착 단계 스킬 -->
      ${chainDef ? (() => {
        const progress = data.chainProgress || 0;
        const allChainSkills = chainDef.chainSkills || [];
        if(!allChainSkills.length) return '';
        return `
          <div style="font-family:'Cinzel',serif;font-size:8px;color:${chainDef.color};letter-spacing:1px;margin-bottom:4px">⛓️ 집착 스킬 [${typeof getEntityIconHTML==='function'?getEntityIconHTML(chainDef,{size:8}):(chainDef.icon)} ${chainDef.label}]</div>
          <div style="display:flex;flex-direction:column;gap:4px">
            ${allChainSkills.map(sk => {
              const unlocked = progress >= sk.threshold;
              return `<div style="padding:7px 9px;background:${unlocked?'#080015':'#040008'};border:1px solid ${unlocked?chainDef.color+'55':'#2a1a3a'};border-radius:2px;opacity:${unlocked?1:0.5}">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                  <span style="font-size:15px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:15}):(sk.icon)}</span>
                  <div style="flex:1">
                    <span style="font-family:'Cinzel',serif;font-size:9px;color:${unlocked?chainDef.color:'#4a2a6a'}">${sk.name}</span>
                    <span style="font-size:8px;color:#4a2a6a;margin-left:5px">[${sk.threshold}% 이상]</span>
                  </div>
                  ${unlocked ? `<span style="font-size:8px;color:${chainDef.color};font-family:'Cinzel',serif">✅ 활성</span>` : `<span style="font-size:9px;color:#3a1a5a">🔒 ${sk.threshold - progress} 남음</span>`}
                </div>
                <div style="font-size:8px;color:${unlocked?'#5a3a7a':'#3a1a5a'};line-height:1.5">${sk.desc}</div>
                ${unlocked ? `<div style="font-size:8px;color:#4060a0;margin-top:2px;font-style:italic">📌 ${sk.conditionDesc}</div>` : ''}
              </div>`;
            }).join('')}
          </div>
        `;
      })() : ''}
    </div>

    <!-- ⑥ 세계의 빚 상세 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#8060c0;letter-spacing:1px;margin-bottom:7px">── 💸 세계의 빚 ──</div>
      <div style="padding:7px 10px;background:#080008;border:1px solid ${dc}44;border-radius:2px;margin-bottom:7px">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:${dc};margin-bottom:3px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(debtStg,{size:10}):(debtStg.icon)} ${debtStg.name} (${data.worldDebt}/100)</div>
        <div style="font-size:9px;color:#7050a0;font-style:italic">${debtStg.desc}</div>
        ${debtStg.event ? `<div style="font-size:8px;color:#804040;margin-top:4px">📌 ${debtStg.event}</div>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:2px">
        ${UNDEAD_DEBT_STAGES.map(s => {
          const active = data.worldDebt >= s.range[0] && data.worldDebt <= s.range[1];
          return `<div style="display:flex;align-items:center;gap:5px;padding:3px 7px;background:${active?'#120008':'#080005'};border:1px solid ${active?s.color:s.color+'22'};border-radius:2px;opacity:${active?1:0.5}">
            <span style="display:inline-flex;width:11px;height:11px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:11}):((s.svgIcon||'').replace('width="20" height="20"','width="11" height="11"')||s.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:8px;color:${active?s.color:'#3a2040'};flex:1">${s.name}</span>
            <span style="font-size:8px;color:#3a1a2a">${s.range[0]}~${s.range[1]}</span>
            ${active ? `<span style="font-size:8px;color:${s.color}">◀</span>` : ''}
          </div>`;
        }).join('')}
      </div>
      <!-- 빚 청산 버튼 -->
      ${data.worldDebt > 0 ? `
        <button onclick="triggerUndeadAction('scale_debt_pay');renderUndeadBorrowedTimePanel()"
          style="width:100%;margin-top:8px;padding:7px;background:#080008;border:1px solid #406040;color:#60a060;font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">
          💸 빚 일부 청산 (선한 행동으로 갚기)
        </button>
      ` : `<div style="text-align:center;font-size:9px;color:#60a060;margin-top:6px;font-family:'Cinzel',serif">✨ 현재 빚이 없습니다</div>`}
    </div>

    <!-- ⑦ 두 번째 죽음의 저울 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#8060c0;letter-spacing:1px;margin-bottom:7px">── ⚖️ 두 번째 죽음의 저울 ──</div>
      <div style="padding:8px 10px;background:#080a00;border:1px solid ${sc}44;border-radius:2px;margin-bottom:7px">
        <div style="font-family:'Cinzel',serif;font-size:11px;color:${sc};margin-bottom:3px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(scaleStg,{size:11}):(scaleStg.icon)} ${scaleStg.name}</div>
        <div style="font-size:9px;color:#7080a0;font-style:italic;margin-bottom:4px">"${scaleStg.desc}"</div>
        <div style="font-size:8px;color:#5a6040;border-top:1px solid #1a2010;padding-top:4px">📌 ${scaleStg.ending}</div>
      </div>
      <!-- 저울 단계 -->
      <div style="display:flex;flex-direction:column;gap:2px">
        ${UNDEAD_DEATH_SCALE_STAGES.map(s => {
          const active = data.deathScale >= s.range[0] && data.deathScale <= s.range[1];
          return `<div style="display:flex;align-items:center;gap:5px;padding:3px 7px;background:${active?'#0a0c00':'#060800'};border:1px solid ${active?s.color:s.color+'22'};border-radius:2px;opacity:${active?1:0.5}">
            <span style="display:inline-flex;width:11px;height:11px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:11}):((s.svgIcon||'').replace('width="20" height="20"','width="11" height="11"')||s.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:8px;color:${active?s.color:'#3a4020'};flex:1">${s.name}</span>
            <span style="font-size:8px;color:#2a3010">${s.range[0]}~${s.range[1]}</span>
            ${active ? `<span style="font-size:8px;color:${s.color}">◀</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ⑦ 행동 선택 버튼 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#8060c0;letter-spacing:1px;margin-bottom:7px">── 행동 기록 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(UNDEAD_ACTION_TYPES).map(([id, act]) => {
          const isTaboo = id === 'cold_betray' || id === 'scale_taboo';
          return `<button onclick="triggerUndeadAction('${id}');renderUndeadBorrowedTimePanel()"
            style="padding:6px;background:${isTaboo?'#120000':'#080010'};border:1px solid ${isTaboo?'#601010':'#2a1050'};color:${isTaboo?'#e05050':'#8060c0'};font-size:8px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;line-height:1.4">
            ${act.icon} ${act.label}
            <span style="display:block;font-size:7px;color:${isTaboo?'#803030':'#4a2a7a'}">온도${act.tempDelta>0?'+':''}${act.tempDelta} 빚${act.debtDelta>0?'+':''}${act.debtDelta} 저울${act.scaleDelta>0?'+':''}${act.scaleDelta}</span>
          </button>`;
        }).join('')}
      </div>
    </div>

    <!-- ⑧ 금기 경고 -->
    ${data.tabooViolations > 0 ? `
    <div style="padding:8px 12px;border-bottom:1px solid #1a0028;background:#0a0000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#c03030;letter-spacing:1px;margin-bottom:4px">⚠️ 금기 위반 기록</div>
      <div style="font-size:9px;color:#803030">총 ${data.tabooViolations}회 금기를 어겼습니다.</div>
      <div style="font-size:8px;color:#601010;margin-top:2px">"영원히 살려는 언데드는 가장 비겁하고 가장 약한 존재다 — 그리고 결국 가장 추한 망령이 된다."</div>
    </div>` : ''}

    <!-- ⑨ 최근 기록 -->
    ${data.history && data.history.length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#8060c0;letter-spacing:1px;margin-bottom:6px">── 최근 기록 ──</div>
      ${[...data.history].reverse().slice(0, 10).map(h => `
        <div style="display:flex;align-items:flex-start;gap:5px;padding:4px 0;border-bottom:1px solid #0d0015;font-size:9px">
          <span style="font-size:11px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:11}):(h.icon)}</span>
          <div style="flex:1;color:#6040a0;line-height:1.4">${h.label}<br><span style="font-size:8px;color:#3a2050">${h.desc ? h.desc.slice(0,40) : ''}</span></div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:8px;color:#5090d0">${h.tempDelta > 0 ? '+' : ''}${h.tempDelta}°</div>
            <div style="font-size:8px;color:${h.debtDelta > 0 ? '#c05050' : '#50a050'}">${h.debtDelta > 0 ? '+' : ''}${h.debtDelta}💸</div>
            <div style="font-size:8px;color:#80a040">${h.scaleDelta > 0 ? '+' : ''}${h.scaleDelta}⚖️</div>
          </div>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderUndeadBorrowedTimePanel = renderUndeadBorrowedTimePanel;

window.renderUndeadBorrowedTimePanel = renderUndeadBorrowedTimePanel;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_232(){
window.loadUndeadBorrowedTime    = loadUndeadBorrowedTime;

window.saveUndeadBorrowedTime    = saveUndeadBorrowedTime;

window.clearUndeadBorrowedTime   = clearUndeadBorrowedTime;

window.getUndeadBorrowedTimeStatus = getUndeadBorrowedTimeStatus;

window.triggerUndeadAction       = triggerUndeadAction;

window.advanceUndeadChain        = advanceUndeadChain;

window.chooseUndeadChainType     = chooseUndeadChainType;

window.applyUndeadBorrowedTimeStats = applyUndeadBorrowedTimeStats;

window.detectUndeadActionFromText = detectUndeadActionFromText;

window.isUndeadRace              = isUndeadRace;
}

