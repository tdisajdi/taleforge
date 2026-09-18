// 🖤 4. 그림자 협약 시스템 — 다크링 핵심 협상 도구
// Auto-extracted from taleforge.html (original section banner preserved above).
import { PACT_TIERS } from '../data/024-4-그림자-협약-시스템-다크링-핵심-협상-도구.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { gainDarklingVoid, loadDarklingVoid } from '../progression/020-101130번-환생-누적-시스템.js';
import { lsDel, lsGet, lsSet, toast } from '../utils.js';

export const SHADOW_PACT_KEY   = 'tf-darkling-pact';

export const loadShadowPact    = () => { try { const r = lsGet(SHADOW_PACT_KEY); return r ? JSON.parse(r) : { pacts: [], history: [], totalPacts: 0, cursedCount: 0 }; } catch(e) { return { pacts: [], history: [], totalPacts: 0, cursedCount: 0 }; } };

export const saveShadowPact    = (d) => { try { lsSet(SHADOW_PACT_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearShadowPact   = () => lsDel(SHADOW_PACT_KEY);

export function initShadowPact(targetNpcName, condition) {
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) return;
  const dv = loadDarklingVoid();
  const tier = PACT_TIERS[dv.stage || 0];
  if (!tier.canPact) { toast('공허 1단계 이상에서 그림자 협약이 가능합니다.', 2000); return; }
  const sp = loadShadowPact();
  if ((sp.pacts || []).length >= tier.maxPacts) { toast(`최대 협약 수 초과 (최대 ${tier.maxPacts}개). 기존 협약을 파기하거나 공허도를 높이세요.`, 2500); return; }
  const mp = S.stats.mp !== undefined ? S.stats.mp : (S.stats.mgc || 50);
  if (mp < tier.mpCost) { toast(`MP 부족! ${tier.mpCost} MP 필요`, 2000); return; }
  // 포획 시도
  const roll = Math.floor(Math.random() * 100) + 1;
  const success = roll <= tier.successRate;
  if (S.stats.mp !== undefined) S.stats.mp = Math.max(0, S.stats.mp - tier.mpCost);
  else S.stats.mgc = Math.max(0, (S.stats.mgc||50) - Math.floor(tier.mpCost/2));
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
  if (!success) {
    toast(`🌑 그림자 포획 실패! (판정 ${roll}/100, 필요 ${tier.successRate} 이하) — MP -${tier.mpCost}`, 3000);
    gainDarklingVoid('dread', 2);
    return;
  }
  const pact = {
    id: 'pact_' + Date.now(),
    target: targetNpcName || '이름 모를 자',
    condition: condition || '(조건 없음)',
    tier: tier.stage,
    tierName: tier.name,
    curseStrength: tier.curseStrength,
    createdAt: new Date().toISOString().slice(0, 16),
    status: 'active',
    roll, successRate: tier.successRate,
  };
  sp.pacts = sp.pacts || [];
  sp.pacts.push(pact);
  sp.totalPacts = (sp.totalPacts || 0) + 1;
  sp.history = sp.history || [];
  sp.history.push({ ...pact });
  
  saveShadowPact(sp);
  // 공허도 상승
  gainDarklingVoid('dread', 8);
  gainDarklingVoid('conceal', 4);
  // AI 컨텍스트 주입
  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext || '') + ` [다크링 그림자 협약 성공! ${tier.icon} "${tier.name}" — "${targetNpcName||'대상'}"의 그림자가 다크링의 공허 속에 포획됐다. 조건: "${condition||'없음'}". 이 사실을 아는 순간부터 대상은 다크링의 시선을 항상 의식한다. 저주 강도: ${tier.curseStrength}. AI는 이 NPC와의 이후 대화에서 상대가 미묘하게 억압된 공포와 순응 성향을 보이도록 묘사하라.]`;
  }
  toastHTML(`🖤 그림자 협약 체결! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(tier,{size:14}):(tier.icon)} "${esc(targetNpcName||'대상')}"의 그림자를 포획했다. (판정 ${esc(roll)}/100 성공)`, 4000);
}
window.initShadowPact = initShadowPact;

export function enforceOrCursePact(pactId) {
  const sp = loadShadowPact();
  const pact = (sp.pacts||[]).find(p => p.id === pactId);
  if (!pact || pact.status !== 'active') return;
  pact.status = 'cursed';
  sp.cursedCount = (sp.cursedCount || 0) + 1;
  saveShadowPact(sp);
  gainDarklingVoid('dread', 12);
  gainDarklingVoid('void_touch', 6);
  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext||'') + ` [그림자 저주 집행! "${pact.target}"의 포획된 그림자에 저주 발동. 강도 ${pact.curseStrength}. 해당 NPC는 극심한 공포와 신체 이상 증상을 경험하기 시작한다. 구체적으로: 어둠 속에서 자신의 그림자가 다크링의 형태로 변하고, 수면 중 공허의 목소리가 들리며, 의지력이 급격히 약화된다. AI는 이 효과를 이후 서사에 반영하라.]`;
  }
  toast(`⛓️ 그림자 저주 집행! "${pact.target}"에게 공허의 저주가 발동됐다.`, 3500);
}
window.enforceOrCursePact = enforceOrCursePact;

export function releasePact(pactId) {
  const sp = loadShadowPact();
  const idx = (sp.pacts||[]).findIndex(p => p.id === pactId);
  if (idx === -1) return;
  const released = sp.pacts.splice(idx, 1)[0];
  saveShadowPact(sp);
  gainDarklingVoid('void_touch', 2);
  toast(`🌑 "${released.target}"의 그림자 해방.`, 2000);
}
window.releasePact = releasePact;

export function renderShadowPactPanel(containerId) {
  const body = document.getElementById(containerId);
  if (!body) return;
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) {
    body.innerHTML = '<div style="text-align:center;padding:20px;color:#304060;font-size:10px">다크링 전용 시스템</div>';
    return;
  }
  const dv = loadDarklingVoid();
  const sp = loadShadowPact();
  const tier = PACT_TIERS[dv.stage || 0];
  const color = '#9040c0';
  const mp = S.stats.mp !== undefined ? S.stats.mp : (S.stats.mgc || 50);
  const npcs = S.npcs || [];

  body.innerHTML = `
    <div style="padding:12px;background:linear-gradient(135deg,#050008,#0a0015);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span style="font-size:26px">🖤</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:${color}">그림자 협약</div>
          <div style="font-size:9px;color:#402050">${tier.name} (${dv.stage}단계) · 활성 ${(sp.pacts||[]).filter(p=>p.status==='active').length}/${tier.maxPacts}개</div>
        </div>
        <div style="padding:4px 10px;background:${color}22;border:1px solid ${color}55;border-radius:12px;font-size:9px;color:${color}">성공률 ${tier.successRate}%</div>
      </div>
      <div style="font-size:9px;color:#402050;line-height:1.5;font-style:italic">"${tier.desc}"</div>
      ${!tier.canPact ? `<div style="margin-top:6px;padding:5px;background:#04000a;border:1px solid #2a0040;border-radius:2px;font-size:9px;color:#402050">⚠️ 공허 1단계 이상에서 활성화됩니다.</div>` : ''}
    </div>

    <!-- 협약 능력치 -->
    <div style="padding:10px 12px;border-bottom:1px solid #0d0018">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 현재 협약 능력 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px">
        <div style="padding:7px;background:#08000f;border:1px solid #1a0030;border-radius:2px;text-align:center">
          <div style="font-size:8px;color:#402050;margin-bottom:2px">포획 성공률</div>
          <div style="font-family:'Cinzel',serif;font-size:16px;color:${color}">${tier.successRate}%</div>
        </div>
        <div style="padding:7px;background:#08000f;border:1px solid #1a0030;border-radius:2px;text-align:center">
          <div style="font-size:8px;color:#402050;margin-bottom:2px">저주 강도</div>
          <div style="font-family:'Cinzel',serif;font-size:16px;color:${color}">${tier.curseStrength}</div>
        </div>
        <div style="padding:7px;background:#08000f;border:1px solid #1a0030;border-radius:2px;text-align:center">
          <div style="font-size:8px;color:#402050;margin-bottom:2px">최대 협약</div>
          <div style="font-family:'Cinzel',serif;font-size:16px;color:${color}">${tier.maxPacts}</div>
        </div>
      </div>
    </div>

    <!-- 활성 협약 -->
    ${(sp.pacts||[]).length > 0 ? `
    <div style="padding:10px 12px;border-bottom:1px solid #0d0018">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 포획된 그림자 ──</div>
      ${(sp.pacts||[]).map(p => {
        const active = p.status === 'active';
        const cursed = p.status === 'cursed';
        const bc = active ? color : cursed ? '#e04040' : '#403050';
        return `<div style="padding:9px 10px;background:${active?'#0a0015':cursed?'#180008':'#06000a'};border:1px solid ${bc}55;margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:14px">${active?'🖤':cursed?'⛓️':'🌑'}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${bc}">${p.target}</div>
              <div style="font-size:8px;color:#402050">${p.tierName} · 저주 강도 ${p.curseStrength}</div>
            </div>
            <span style="font-size:8px;padding:2px 6px;background:${bc}22;color:${bc};border:1px solid ${bc}44;border-radius:10px">${active?'포획 중':cursed?'저주 발동':'해제'}</span>
          </div>
          <div style="font-size:8px;color:#402050;margin-bottom:5px">조건: "${p.condition}"</div>
          ${active ? `
          <div style="display:flex;gap:4px">
            <button onclick="enforceOrCursePact('${p.id}');renderDarklingVoidExtPanel()" style="flex:1;padding:5px;background:#180010;border:1px solid #a03050;color:#e04060;font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">⛓️ 저주 집행</button>
            <button onclick="releasePact('${p.id}');renderDarklingVoidExtPanel()" style="flex:1;padding:5px;background:#08000f;border:1px solid ${color}44;color:${color};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">🌑 해방</button>
          </div>` : ''}
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- 새 협약 체결 -->
    ${tier.canPact ? `
    <div style="padding:10px 12px;border-bottom:1px solid #0d0018">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 새 그림자 포획 ──</div>
      <div style="font-size:9px;color:#402050;margin-bottom:6px">대화 중인 NPC의 그림자를 포획해 협약을 맺습니다. MP ${tier.mpCost} 소모.</div>
      ${npcs.length > 0 ? `
      <div style="margin-bottom:6px">
        <div style="font-size:8px;color:#402050;margin-bottom:4px">등록된 NPC 선택:</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${npcs.slice(0, 6).map(n => `
            <button onclick="initShadowPact('${(n.name||'').replace(/'/g,'')}','자신의 이름으로 나에게 복종한다');renderDarklingVoidExtPanel()"
              style="padding:4px 8px;background:#08000f;border:1px solid ${color}44;color:${color};font-size:9px;cursor:pointer;border-radius:2px">${n.icon||'👤'} ${n.name||'?'}</button>`).join('')}
        </div>
      </div>` : ''}
      <button onclick="initShadowPact(prompt('협약 대상 이름'), prompt('조건 (예: 나를 배신하지 않는다)'));renderDarklingVoidExtPanel()"
        style="width:100%;padding:8px;background:#0a0015;border:1px solid ${color}55;color:${color};font-family:'Cinzel',serif;font-size:10px;cursor:pointer;border-radius:2px">
        🖤 직접 입력으로 그림자 포획 (MP -${tier.mpCost})
      </button>
    </div>` : ''}

    <!-- 협약 단계 안내 -->
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 협약 단계 (공허도 연동) ──</div>
      ${PACT_TIERS.map((t, i) => {
        const active = i === (dv.stage||0);
        const passed = i < (dv.stage||0);
        return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#0a0015':passed?'#05000a':'#03000a'};border:1px solid ${active?color:passed?color+'44':'#0d0018'};border-radius:2px;margin-bottom:3px;opacity:${active?1:passed?0.75:0.3}">
          <span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:10}):(t.icon)}</span>
          <span style="font-family:'Cinzel',serif;font-size:9px;color:${active?color:passed?color:'#402050'};flex:1">${t.name}</span>
          <span style="font-size:8px;color:#402050">성공 ${t.successRate}% / 강도 ${t.curseStrength}</span>
          ${active ? `<span style="font-size:8px;color:${color}">◀</span>` : passed ? `<span style="color:${color};font-size:9px">✓</span>` : ''}
        </div>`;
      }).join('')}
    </div>
  `;
}
window.renderShadowPactPanel = renderShadowPactPanel;
