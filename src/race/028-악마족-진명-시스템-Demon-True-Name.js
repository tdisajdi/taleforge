// 🏷️  악마족 진명 시스템 (Demon True Name)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { AUCTIONABLE_MEMORIES, CINEMA_SCENES, CORRUPTION_LEVELS, CYBER_IMPLANTS, DEATH_DEAL_OPTIONS, DEATH_EYE_LEVELS, GUILD_RANKS, KINGDOM_TYPES, NATURAL_LAW_MUTATIONS, SWORD_TECHNIQUES, TRUENAME_EVENTS, TRUENAME_INTEGRITY_STAGES, WORLD_WILLS } from '../data/028-악마족-진명-시스템-Demon-True-Name.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadNPCs, saveNPCs } from '../misc/001-block0-preamble.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { applyDemonCorruptionStats, loadDemonCorruption, loadMentalCorruption, saveMentalCorruption } from '../progression/020-101130번-환생-누적-시스템.js';
import { esc, lsDel, lsGet, lsSet, toast } from '../utils.js';
import { applyDemonContractStats, detectDemonContractFromText } from './027-악마족-계약-장부-시스템-Demon-Contract-Ledger.js';

export const DEMON_TRUENAME_KEY = "tf-demon-truename";

export const loadDemonTrueName = () => {
  try {
    return JSON.parse(lsGet(DEMON_TRUENAME_KEY) ||
      '{"integrity":100,"shards":0,"capturedNames":[],"history":[],"shardAbilities":[],"awakened":false}');
  } catch(e) {
    return {integrity:100, shards:0, capturedNames:[], history:[], shardAbilities:[], awakened:false};
  }
};

export const saveDemonTrueName = (d) => { try { lsSet(DEMON_TRUENAME_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearDemonTrueName = () => lsDel(DEMON_TRUENAME_KEY);

export function getTrueNameStage(integrity) {
  for (const s of TRUENAME_INTEGRITY_STAGES) {
    if (integrity >= s.min && integrity <= s.max) return s;
  }
  return TRUENAME_INTEGRITY_STAGES[TRUENAME_INTEGRITY_STAGES.length - 1];
}
window.getTrueNameStage = getTrueNameStage;

export function changeTrueNameIntegrity(eventId, customDmg) {
  const race = S.character?.race || "";
  if (!race.includes("악마") && !race.includes("demon")) return;
  const tn = loadDemonTrueName();
  const ev = TRUENAME_EVENTS.find(e => e.id === eventId);
  const delta = customDmg !== undefined ? customDmg : (ev?.dmg || 0);

  if (eventId === "capture_name") {
    openCaptureNameModal();
    return;
  }
  if (eventId === "name_seal") {
    if ((S.stats.hp || 100) <= 30) { toast("⚠️ HP가 부족합니다 (30 이상 필요)"); return; }
    S.stats.hp = Math.max(1, (S.stats.hp || 100) - 20);
    if (typeof saveStats === 'function') saveStats(S.stats);
  }

  tn.integrity = Math.max(0, Math.min(100, (tn.integrity || 100) + delta));
  tn.history = tn.history || [];
  tn.history.push({
    event: eventId, label: ev?.label || eventId, icon: ev?.icon || "🏷️",
    delta, total: tn.integrity, at: new Date().toISOString().slice(0, 16)
  });
  
  saveDemonTrueName(tn);
  applyTrueNameStats();

  if (tn.integrity <= 0) {
    setTimeout(() => toast("💀 진명이 소멸했습니다! 심연 추방 위기!", 5000), 300);
  } else if (tn.integrity <= 10) {
    setTimeout(() => toast("⚠️ 이름 붕괴 직전입니다! 즉시 강화하세요.", 4000), 300);
  } else if (delta < 0) {
    setTimeout(() => toast(`🏷️ 진명 강화 +${Math.abs(delta)} (온전도: ${tn.integrity})`, 3000), 300);
  }
  return tn;
}
window.changeTrueNameIntegrity = changeTrueNameIntegrity;

export function openCaptureNameModal() {
  const npcs = (S.npcs || []).filter(n => n.active !== false);
  if (!npcs.length) { toast("포획 가능한 NPC가 없습니다."); return; }
  const dc = loadDemonCorruption();
  const modal = document.createElement('div');
  modal.id = 'truename-capture-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:#000a;z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:#1a0010;border:2px solid #801030;padding:16px;max-width:320px;width:90%;border-radius:4px;max-height:80vh;overflow-y:auto">
    <div style="font-family:'Cinzel',serif;font-size:12px;color:#ff6080;margin-bottom:12px;text-align:center">🎯 진명 포획 — 대상 선택</div>
    <div style="font-size:9px;color:#804050;margin-bottom:10px">성공 시 대상 NPC를 완전히 지배. 타락 단계가 높을수록 성공률 증가.</div>
    <div style="display:flex;flex-direction:column;gap:4px">
      ${npcs.slice(0, 15).map(n => `
        <button onclick="attemptCaptureNpcName('${esc(n.name)}');document.getElementById('truename-capture-modal').remove();renderDemonTrueNamePanel()"
          style="padding:7px 10px;background:#0d0008;border:1px solid #601020;color:#ff6080;font-size:10px;cursor:pointer;text-align:left;border-radius:2px;font-family:'Crimson Text',serif">
          🎯 ${esc(n.name)} <span style="color:#604040;font-size:8px">${esc(n.role||'')}</span>
        </button>`).join('')}
    </div>
    <button onclick="document.getElementById('truename-capture-modal').remove()"
      style="width:100%;margin-top:10px;padding:6px;background:#0a0008;border:1px solid #401020;color:#804050;font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">취소</button>
  </div>`;
  document.body.appendChild(modal);
}
window.openCaptureNameModal = openCaptureNameModal;

export function attemptCaptureNpcName(npcName) {
  const dc = loadDemonCorruption();
  const tn = loadDemonTrueName();
  const myStage = dc.stage || 0;
  // 성공률: 타락 단계 * 15% + 기본 10%
  const successChance = Math.min(95, 10 + myStage * 15);
  const roll = Math.floor(Math.random() * 100);

  tn.capturedNames = tn.capturedNames || [];
  if (roll < successChance) {
    if (!tn.capturedNames.find(c => c.name === npcName)) {
      tn.capturedNames.push({
        name: npcName, capturedAt: new Date().toISOString().slice(0, 16),
        dominance: 100
      });
    }
    saveDemonTrueName(tn);
    toast(`✨ 진명 포획 성공! ${npcName}의 이름을 손에 넣었습니다. (성공률 ${successChance}%)`, 4000);
    // 포획된 NPC 관계도 강제 상승
    const npcs = loadNPCs ? loadNPCs() : (S.npcs || []);
    const target = npcs.find(n => n.name === npcName);
    if (target) { target.relationship = 100; target.note = (target.note||'') + ' [진명 지배]'; if(typeof saveNPCs==='function') saveNPCs(npcs); }
  } else {
    // 실패 시 이름 노출 위험
    tn.integrity = Math.max(0, (tn.integrity || 100) - 10);
    tn.history = tn.history || [];
    tn.history.push({ event:"capture_fail", label:"진명 포획 실패", icon:"💥", delta:-10, total:tn.integrity, at:new Date().toISOString().slice(0,16) });
    saveDemonTrueName(tn);
    applyTrueNameStats();
    toast(`💥 진명 포획 실패! ${npcName}이(가) 역으로 이름을 읽으려 했다. 이름 온전도 -10 (성공률 ${successChance}%)`, 4000);
  }
}
window.attemptCaptureNpcName = attemptCaptureNpcName;

export function applyTrueNameStats() {
  const tn = loadDemonTrueName();
  const stg = getTrueNameStage(tn.integrity || 100);
  const prev = S._demonTrueNameBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const nb = {};
  Object.entries(stg.bonus || {}).forEach(([k, v]) => { S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); nb[k] = v; });
  Object.entries(stg.penalty || {}).forEach(([k, v]) => { S.stats[k] = Math.max(0, (S.stats[k] || 50) + v); });
  S._demonTrueNameBonus = nb;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyTrueNameStats = applyTrueNameStats;

export function detectTrueNameEventFromText(text) {
  if (!text) return;
  const race = S.character?.race || "";
  if (!race.includes("악마") && !race.includes("demon")) return;
  if (/진명|이름을 불렀|이름이 드러|이름을 알아/.test(text) && Math.random() < 0.4) changeTrueNameIntegrity('revealed', -8);
  if (/신성한 빛|성수|신의 이름|천상의 빛/.test(text) && Math.random() < 0.3) changeTrueNameIntegrity('purify_light', -5);
  if (/계약을 완수|약속을 지켜|이행했/.test(text) && Math.random() < 0.4) changeTrueNameIntegrity('restore_vow', 8);
}
window.detectTrueNameEventFromText = detectTrueNameEventFromText;

export function renderDemonTrueNamePanel() {
  const body = document.getElementById('pb-demon-truename');
  if (!body) return;
  const race = S.character?.race || "";
  const isDemon = race.includes("악마") || race.includes("demon");
  if (!isDemon) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">🏷️</div>
      <div>악마족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const tn = loadDemonTrueName();
  const integrity = tn.integrity || 100;
  const stg = getTrueNameStage(integrity);
  const color = stg.color;
  const pct = integrity;

  // 이름 색상 결정 (온전도 기반)
  const integrityBarColor = integrity > 70 ? '#60d060' : integrity > 40 ? '#d0a020' : integrity > 15 ? '#d06020' : '#e03020';

  body.innerHTML = `
    <!-- ① 헤더: 진명 온전도 -->
    <div style="padding:14px;background:linear-gradient(135deg,#1a0010,#220015);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:28px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:28}):(stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#803050;margin-top:2px">진명 온전도 ${integrity} / 100</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:20px;color:${color}">${integrity}<span style="font-size:9px;color:#602040"> / 100</span></div>
          <div style="font-size:8px;color:#602040">이름 온전도</div>
        </div>
      </div>
      <!-- 이름 온전도 바 (왼쪽이 0, 오른쪽이 100) -->
      <div style="height:8px;background:#1a000e;border-radius:4px;overflow:hidden;margin-bottom:4px;border:1px solid #3a0020">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#800010,${integrityBarColor});border-radius:4px;transition:width .4s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:8px;color:#602040">
        <span>💀 소멸</span><span>⭐ 완전</span>
      </div>
      <div style="margin-top:8px;font-size:10px;color:#c06080;line-height:1.6;font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- ② 온전도 단계 목록 -->
    <div style="padding:8px 12px;border-bottom:1px solid #1a0010">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 진명 상태 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${[...TRUENAME_INTEGRITY_STAGES].reverse().map((s) => {
          const active = integrity >= s.min && integrity <= s.max;
          const passed = integrity > s.max;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a0015':passed?'#0f000e':'#0a0008'};border:1px solid ${active?s.color:passed?s.color+'44':'#1a0010'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):(s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#4a2030'}">${s.name}</span><span style="font-size:8px;color:#3a1020;margin-left:5px">(${s.min}~${s.max})</span></div>
            ${active ? `<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀ 현재</span>` : ''}
            ${passed ? `<span style="font-size:9px;color:${s.color}">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ③ 스탯 효과 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0010">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 진명 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.bonus || {}).map(([k,v]) => `<div style="padding:3px 7px;background:#0d0a00;border:1px solid #3a2a0a;border-radius:2px;font-size:9px"><span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span></div>`).join('')}
        ${Object.entries(stg.penalty || {}).map(([k,v]) => `<div style="padding:3px 7px;background:#0d0000;border:1px solid #3a0a0a;border-radius:2px;font-size:9px"><span style="color:#a06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:4px">${v}</span></div>`).join('')}
        ${Object.keys({...stg.bonus,...stg.penalty}).length === 0 ? `<div style="grid-column:span 2;font-size:9px;color:#402020;text-align:center;padding:6px">현재 스탯 효과 없음</div>` : ''}
      </div>
    </div>

    <!-- ④ 포획한 진명 목록 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0010">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 포획한 진명 (${(tn.capturedNames||[]).length}개) ──</div>
      ${(tn.capturedNames||[]).length === 0
        ? `<div style="font-size:9px;color:#3a1020;text-align:center;padding:8px">아직 포획한 진명이 없습니다</div>`
        : (tn.capturedNames||[]).map(cn => `
          <div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:#0d0010;border:1px solid #801030;margin-bottom:3px;border-radius:2px">
            <span style="font-size:14px">🎯</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:#ff6080">${esc(cn.name)}</div>
              <div style="font-size:8px;color:#603040">포획일: ${cn.capturedAt} | 지배도: ${cn.dominance}%</div>
            </div>
            <div style="font-size:9px;color:#e05060">지배 중</div>
          </div>`).join('')}
    </div>

    <!-- ⑤ 이벤트 버튼 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0010">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 진명 이벤트 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
        ${TRUENAME_EVENTS.map(ev => {
          const evcolor = ev.dmg < 0 ? '#60d060' : ev.dmg > 0 ? '#e05050' : '#e0a030';
          return `<button onclick="changeTrueNameIntegrity('${ev.id}');renderDemonTrueNamePanel()"
            style="padding:7px;background:#150010;border:1px solid ${color}44;color:${evcolor};font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;text-align:left;border-radius:2px;line-height:1.4">
            ${typeof getEntityIconHTML==='function'?getEntityIconHTML(ev,{size:7}):(ev.icon)} ${ev.label}<br><span style="font-size:7px;color:#603040">${esc(ev.desc)}</span>
            <span style="float:right;font-family:'Cinzel',serif;font-size:9px;color:${evcolor}">${ev.dmg === 0 ? '시도' : (ev.dmg < 0 ? '+' + Math.abs(ev.dmg) : '-' + ev.dmg)}</span>
          </button>`;
        }).join('')}
      </div>
    </div>

    <!-- ⑥ 최근 기록 -->
    ${(tn.history||[]).length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 기록 ──</div>
      ${[...tn.history].reverse().slice(0, 12).map(h => `
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d0008;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#803050">${esc(h.label)}</span>
          <span style="color:${h.delta < 0 ? '#e05050' : '#60d060'};font-family:'Cinzel',serif">${h.delta > 0 ? '+' : ''}${h.delta}</span>
          <span style="color:#401020;font-size:8px">(${h.total})</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderDemonTrueNamePanel = renderDemonTrueNamePanel;

window.renderDemonTrueNamePanel     = renderDemonTrueNamePanel;

window.changeTrueNameIntegrity      = changeTrueNameIntegrity;

window.applyTrueNameStats           = applyTrueNameStats;

window.openCaptureNameModal         = openCaptureNameModal;

window.attemptCaptureNpcName        = attemptCaptureNpcName;

window.detectTrueNameEventFromText  = detectTrueNameEventFromText;

window.clearDemonTrueName           = clearDemonTrueName;

export function initDemonAllSystems() {
  const race = S.character?.race || "";
  if (!race.includes("악마") && !race.includes("demon")) return;
  applyDemonCorruptionStats();
  applyDemonContractStats();
  applyTrueNameStats();
}
window.initDemonAllSystems = initDemonAllSystems;

window.initDemonAllSystems = initDemonAllSystems;

export const growMentalCorruption = (cycle) => {
  const mc = loadMentalCorruption();
  const gain = Math.max(0, cycle - 10) * 2; // 10회차 이후부터 누적
  // [B30 FIX] gain을 어디에도 누적하지 않고, mc.level이 자기 자신의 이전
  // 값을 다시 읽어 재계산하는 순환 논리라 항상 0에 고정되던 버그. 누적
  // 포인트(mc.points)를 별도로 관리하고, 그 포인트를 기준으로 레벨을
  // 계산하도록 수정.
  mc.points = (mc.points || 0) + gain;
  mc.level = Math.min(5, CORRUPTION_LEVELS.reduce((acc, l) => mc.points >= l.threshold ? l.level : acc, 0));
  if (gain > 0) mc.symptoms = mc.symptoms || [];
  saveMentalCorruption(mc);
  return mc;
};

export const cureMentalCorruption = (amount) => {
  const mc = loadMentalCorruption();
  mc.level = Math.max(0, (mc.level || 0) - (amount || 1));
  mc.cured = (mc.cured || 0) + 1;
  saveMentalCorruption(mc);
};

export const getMentalCorruption = () => {
  const cycle = loadCycleCount();
  if (cycle < 10) return null;
  const mc = loadMentalCorruption();
  return { ...mc, levelData: CORRUPTION_LEVELS[mc.level || 0] };
};

export const CINEMA_KEY  = "taleforge-cinema";

export const loadCinema  = () => { const r = lsGet(CINEMA_KEY); return r ? JSON.parse(r) : { screenings: [], totalViewed: 0 }; };

export const saveCinema  = (c) => lsSet(CINEMA_KEY, JSON.stringify(c));


export const viewCinemaScene = (sceneId, location) => {
  const cinema = loadCinema();
  const scene = CINEMA_SCENES.find(s => s.id === sceneId) || CINEMA_SCENES[cinema.totalViewed % CINEMA_SCENES.length];
  cinema.screenings = cinema.screenings || [];
  cinema.screenings.push({ ...scene, location: location || "전생의 기억 속", viewedAt: new Date().toISOString() });
  cinema.totalViewed = (cinema.totalViewed || 0) + 1;
  // 개수 제한 없음 (전체 저장)
  saveCinema(cinema);
  return scene;
};

export const getCinemaStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return { ...loadCinema(), scenes: CINEMA_SCENES };
};

export const TWIN_SOUL_KEY  = "taleforge-twin-soul";

export const loadTwinSoul   = () => { const r = lsGet(TWIN_SOUL_KEY); return r ? JSON.parse(r) : { connected: false, partnerName: null, sharedSkills: [], connectionStrength: 0 }; };

export const saveTwinSoul   = (t) => lsSet(TWIN_SOUL_KEY, JSON.stringify(t));


export const connectTwinSoul = (partnerName, partnerSkill, mySkill) => {
  if (!partnerName) return;
  const ts = loadTwinSoul();
  ts.connected = true;
  ts.partnerName = partnerName;
  ts.connectionStrength = Math.min(100, (ts.connectionStrength || 0) + 20);
  ts.sharedSkills = ts.sharedSkills || [];
  if (partnerSkill && !ts.sharedSkills.find(s => s.skill === partnerSkill)) {
    ts.sharedSkills.push({ skill: partnerSkill, from: partnerName, sharedAt: new Date().toISOString() });
  }
  if (mySkill) ts.gaveSkill = mySkill;
  saveTwinSoul(ts);
};

export const getTwinSoul = () => {
  const cycle = loadCycleCount();
  if (cycle < 5) return null;
  return loadTwinSoul();
};

export const KILL_LIST_KEY  = "taleforge-kill-list";

export const loadKillList   = () => { const r = lsGet(KILL_LIST_KEY); return r ? JSON.parse(r) : []; };

export const saveKillList   = (k) => lsSet(KILL_LIST_KEY, JSON.stringify(k));


export const addToKillList = (targetName, targetRole, scenario) => {
  if (!targetName) return;
  const list = loadKillList();
  const existing = list.find(l => l.name === targetName);
  if (existing) { existing.kills = (existing.kills || 1) + 1; }
  else { list.push({ name: targetName, role: targetRole || "적", kills: 1, scenario: scenario || "", hasDescendant: Math.random() > 0.5, addedAt: new Date().toISOString() }); }
  // 개수 제한 없음 (전체 저장)
  saveKillList(list);
};

export const getKillList = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return [];
  const list = loadKillList();
  const avengers = list.filter(l => l.hasDescendant);
  return { list, avengers };
};

export const MEMORY_AUCTION_KEY  = "taleforge-memory-auction";

export const loadMemoryAuction   = () => { const r = lsGet(MEMORY_AUCTION_KEY); return r ? JSON.parse(r) : { sold: [], bought: [], balance: 0 }; };

export const saveMemoryAuction   = (a) => lsSet(MEMORY_AUCTION_KEY, JSON.stringify(a));


export const sellMemory = (memoryId) => {
  const ma = loadMemoryAuction();
  const mem = AUCTIONABLE_MEMORIES.find(m => m.id === memoryId);
  if (!mem) return false;
  ma.sold = ma.sold || [];
  ma.sold.push({ ...mem, soldAt: new Date().toISOString() });
  ma.balance = (ma.balance || 0) + 1;
  saveMemoryAuction(ma);
  if(typeof applyMemoryAuctionReward==='function') applyMemoryAuctionReward(memoryId);
  return mem;
};

export function applyMemoryAuctionReward(memoryId){
  const rewards = {
    first_love:   { gold: 500, stat: { cha: 5 } },
    worst_defeat: { stat: { str: 8 } },
    childhood:    { stat: { luk: 10 } },
    best_victory: { gold: 1000 },
    true_friend:  { stat: { wil: 5 } },
  };
  const r = rewards[memoryId];
  if(!r) return;
  if(r.gold){ S.gold = (S.gold||0) + r.gold; if(typeof saveGold==='function') saveGold(S.gold); }
  if(r.stat){
    Object.entries(r.stat).forEach(([k,v])=>{
      if(S.stats && S.stats[k]!==undefined) S.stats[k] = Math.min(999, S.stats[k]+v);
    });
  }
  if(typeof window.updateHeader==='function') window.updateHeader();
}
window.applyMemoryAuctionReward = applyMemoryAuctionReward;

window.applyMemoryAuctionReward = applyMemoryAuctionReward;

export const getMemoryAuction = () => {
  const cycle = loadCycleCount();
  if (cycle < 3) return null;
  const ma = loadMemoryAuction();
  const available = AUCTIONABLE_MEMORIES.filter(m => !ma.sold.find(s => s.id === m.id));
  return { ...ma, available };
};

export const BOND_TREE_KEY  = "taleforge-bond-tree";

export const loadBondTree   = () => { const r = lsGet(BOND_TREE_KEY); return r ? JSON.parse(r) : { leaves: 0, deepBonds: 0, socialBonus: 0 }; };

export const saveBondTree   = (t) => lsSet(BOND_TREE_KEY, JSON.stringify(t));


export const growBondTree = (npcCount, deepBondCount) => {
  const bt = loadBondTree();
  bt.leaves = (bt.leaves || 0) + (npcCount || 1);
  bt.deepBonds = (bt.deepBonds || 0) + (deepBondCount || 0);
  bt.socialBonus = Math.min(50, Math.floor((bt.leaves || 0) / 10) * 3 + (bt.deepBonds || 0) * 2);
  saveBondTree(bt);
  return bt;
};

export const getBondTreeStatus = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const bt = loadBondTree();
  const stage = bt.leaves >= 100 ? "거대한 나무" : bt.leaves >= 50 ? "성숙한 나무" : bt.leaves >= 20 ? "자라는 나무" : "새싹";
  return { ...bt, stage, icon: bt.leaves >= 100 ? "🌳" : bt.leaves >= 50 ? "🌲" : bt.leaves >= 20 ? "🌿" : "🌱" };
};

export const CYBER_IMPRINT_KEY  = "taleforge-cyber-imprint";

export const loadCyberImprint   = () => { const r = lsGet(CYBER_IMPRINT_KEY); return r ? JSON.parse(r) : { imprints: [], discount: 0 }; };

export const saveCyberImprint   = (c) => lsSet(CYBER_IMPRINT_KEY, JSON.stringify(c));


export const recordCyberImprint = (implantId, scenario) => {
  if (!implantId) return;
  const ci = loadCyberImprint();
  const def = CYBER_IMPLANTS.find(i => i.id === implantId);
  if (!def) return;
  if (!ci.imprints.find(i => i.id === implantId)) {
    ci.imprints.push({ ...def, scenario: scenario || "", imprintedAt: new Date().toISOString() });
    ci.discount = Math.min(75, (ci.discount || 0) + 10);
  }
  saveCyberImprint(ci);
};

export const getCyberImprint = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadCyberImprint();
};

export const SWORD_GHOST_KEY  = "taleforge-sword-ghost";

export const loadSwordGhost   = () => { const r = lsGet(SWORD_GHOST_KEY); return r ? JSON.parse(r) : { techniques: [], possessionCount: 0, awakeLevel: 0 }; };

export const saveSwordGhost   = (g) => lsSet(SWORD_GHOST_KEY, JSON.stringify(g));


export const recordSwordTechnique = (techniqueId, scenario) => {
  if (!techniqueId) return;
  const sg = loadSwordGhost();
  const def = SWORD_TECHNIQUES.find(t => t.id === techniqueId);
  if (!def || sg.techniques.find(t => t.id === techniqueId)) return;
  sg.techniques.push({ ...def, scenario: scenario || "", learnedAt: new Date().toISOString() });
  sg.awakeLevel = Math.min(5, sg.techniques.length);
  saveSwordGhost(sg);
};

export const triggerSwordGhost = () => {
  const sg = loadSwordGhost();
  if (!sg.techniques.length) return null;
  sg.possessionCount = (sg.possessionCount || 0) + 1;
  const technique = sg.techniques[sg.possessionCount % sg.techniques.length];
  saveSwordGhost(sg);
  return technique;
};

export const getSwordGhost = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  return loadSwordGhost();
};

export const KINGDOM_KEY  = "taleforge-kingdom";

export const loadKingdom  = () => { const r = lsGet(KINGDOM_KEY); return r ? JSON.parse(r) : { founded: [], legacy: 0 }; };

export const saveKingdom  = (k) => lsSet(KINGDOM_KEY, JSON.stringify(k));


export const foundKingdom = (kingdomType, kingdomName, scenario) => {
  if (!kingdomType) return;
  const k = loadKingdom();
  const def = KINGDOM_TYPES.find(t => t.id === kingdomType);
  if (!def) return;
  if (!k.founded.find(f => f.id === kingdomType)) {
    k.founded.push({ ...def, kingdomName: kingdomName || def.name, scenario: scenario || "", foundedAt: new Date().toISOString() });
    k.legacy = (k.legacy || 0) + def.legacy;
  }
  saveKingdom(k);
};

export const getKingdomLegacy = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const k = loadKingdom();
  if (!k.founded.length) return null;
  return k;
};

export const LOOPERS_GUILD_KEY  = "taleforge-loopers-guild";

export const loadLoopersGuild   = () => { const r = lsGet(LOOPERS_GUILD_KEY); return r ? JSON.parse(r) : { status: "unknown", joinedAt: null, rank: 0, knowledgeShared: [] }; };

export const saveLoopersGuild   = (g) => lsSet(LOOPERS_GUILD_KEY, JSON.stringify(g));


export const joinLoopersGuild = () => {
  const g = loadLoopersGuild();
  if (g.status === "member") return g;
  g.status = "member";
  g.joinedAt = new Date().toISOString();
  g.rank = 0;
  g.knowledgeShared = [GUILD_RANKS[0].knowledge];
  saveLoopersGuild(g);
  return g;
};

export const rejectLoopersGuild = () => {
  const g = loadLoopersGuild();
  g.status = "hostile";
  saveLoopersGuild(g);
};

export const rankUpGuild = () => {
  const g = loadLoopersGuild();
  if (g.status !== "member" || (g.rank || 0) >= 4) return false;
  g.rank = (g.rank || 0) + 1;
  g.knowledgeShared = g.knowledgeShared || [];
  g.knowledgeShared.push(GUILD_RANKS[g.rank].knowledge);
  saveLoopersGuild(g);
  return GUILD_RANKS[g.rank];
};

export const getLoopersGuild = () => {
  const cycle = loadCycleCount();
  if (cycle < 5) return null;
  const g = loadLoopersGuild();
  return { ...g, rankData: GUILD_RANKS[g.rank || 0], ranks: GUILD_RANKS };
};

export const DEATH_DEALER_KEY  = "taleforge-death-dealer";

export const loadDeathDealer   = () => { const r = lsGet(DEATH_DEALER_KEY); return r ? JSON.parse(r) : { deals: [], debt: 0, debtCollected: false }; };

export const saveDeathDealer   = (d) => lsSet(DEATH_DEALER_KEY, JSON.stringify(d));


export const makeDealWithDeath = (dealType) => {
  const dd = loadDeathDealer();
  const deal = DEATH_DEAL_OPTIONS.find(d => d.id === dealType);
  if (!deal) return false;
  dd.deals = dd.deals || [];
  dd.deals.push({ ...deal, dealDate: new Date().toISOString() });
  dd.debt = (dd.debt || 0) + 1;
  if (dd.debt >= 7) dd.debtCollected = true; // 7번 이상 거래 시 빚 회수
  saveDeathDealer(dd);
  return { ...deal, totalDebt: dd.debt, debtWarning: dd.debt >= 5 };
};

export const getDeathDealerStatus = () => {
  const dd = loadDeathDealer();
  return { ...dd, options: DEATH_DEAL_OPTIONS, dangerLevel: dd.debt >= 7 ? "빚 회수 위험" : dd.debt >= 5 ? "위험" : dd.debt >= 3 ? "주의" : "안전" };
};

export const ROLE_REVERSAL_KEY  = "taleforge-role-reversal";

export const loadRoleReversal   = () => { const r = lsGet(ROLE_REVERSAL_KEY); return r ? JSON.parse(r) : { available: [], completed: [] }; };

export const saveRoleReversal   = (rv) => lsSet(ROLE_REVERSAL_KEY, JSON.stringify(rv));


export const addRoleReversal = (bossName, bossSkills, scenario) => {
  if (!bossName) return;
  const rv = loadRoleReversal();
  rv.available = rv.available || [];
  if (!rv.available.find(r => r.bossName === bossName) && !rv.completed.find(r => r.bossName === bossName)) {
    rv.available.push({ bossName, skills: bossSkills || [], scenario: scenario || "", addedAt: new Date().toISOString() });
  }
  // 개수 제한 없음 (전체 저장)
  saveRoleReversal(rv);
};

export const completeRoleReversal = (bossName) => {
  const rv = loadRoleReversal();
  const idx = rv.available.findIndex(r => r.bossName === bossName);
  if (idx < 0) return null;
  const completed = rv.available.splice(idx, 1)[0];
  completed.completedAt = new Date().toISOString();
  rv.completed = rv.completed || [];
  rv.completed.push(completed);
  saveRoleReversal(rv);
  return completed;
};

export const getRoleReversal = () => {
  const cycle = loadCycleCount();
  if (cycle < 3) return null;
  return loadRoleReversal();
};

export const WORLD_WILL_KEY  = "taleforge-world-will";

export const loadWorldWill   = () => { const r = lsGet(WORLD_WILL_KEY); return r ? JSON.parse(r) : { currentWill: null, history: [], readingLevel: 0 }; };

export const saveWorldWill   = (w) => lsSet(WORLD_WILL_KEY, JSON.stringify(w));


export const assignWorldWill = (cycle) => {
  const idx = cycle % WORLD_WILLS.length;
  const will = WORLD_WILLS[idx];
  const ww = loadWorldWill();
  ww.currentWill = { ...will, cycle, assignedAt: new Date().toISOString() };
  ww.history = ww.history || [];
  ww.history.push({ id: will.id, cycle });
  // 개수 제한 없음 (전체 저장)
  ww.readingLevel = Math.min(5, Math.floor(cycle / 5));
  saveWorldWill(ww);
  return will;
};

export const getWorldWill = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const ww = loadWorldWill();
  if (!ww.currentWill) assignWorldWill(cycle);
  return loadWorldWill();
};

export const DEATH_EYE_KEY  = "taleforge-death-eye";

export const loadDeathEye   = () => { const r = lsGet(DEATH_EYE_KEY); return r ? JSON.parse(r) : { totalDeaths: 0, unlocked: false, level: 0 }; };

export const saveDeathEye   = (e) => lsSet(DEATH_EYE_KEY, JSON.stringify(e));


export const recordDeathForEye = () => {
  const de = loadDeathEye();
  de.totalDeaths = (de.totalDeaths || 0) + 1;
  const newLevel = DEATH_EYE_LEVELS.reduce((acc, l) => de.totalDeaths >= l.deaths ? l.level : acc, 0);
  if (newLevel > (de.level || 0)) { de.level = newLevel; de.unlocked = newLevel > 0; }
  saveDeathEye(de);
  return de;
};

export const getDeathEyeStatus = () => {
  const de = loadDeathEye();
  return { ...de, levelData: DEATH_EYE_LEVELS[de.level || 0], nextLevel: DEATH_EYE_LEVELS[(de.level || 0) + 1] || null };
};

export const SOUL_FREQUENCY_KEY  = "taleforge-soul-frequency";

export const loadSoulFrequency   = () => { const r = lsGet(SOUL_FREQUENCY_KEY); return r ? JSON.parse(r) : { frequency: 50, resonances: [] }; };

export const saveSoulFrequency   = (f) => lsSet(SOUL_FREQUENCY_KEY, JSON.stringify(f));


export const growSoulFrequency = (cycleCount, deepBonds) => {
  const sf = loadSoulFrequency();
  sf.frequency = Math.min(100, 50 + (cycleCount * 2) + (deepBonds * 5));
  saveSoulFrequency(sf);
  return sf;
};

export const addResonance = (npcName, resonanceStrength) => {
  if (!npcName) return;
  const sf = loadSoulFrequency();
  sf.resonances = sf.resonances || [];
  const existing = sf.resonances.find(r => r.npcName === npcName);
  if (existing) existing.strength = Math.min(100, (existing.strength || 0) + (resonanceStrength || 10));
  else sf.resonances.push({ npcName, strength: resonanceStrength || 10, addedAt: new Date().toISOString() });
  saveSoulFrequency(sf);
};

export const getSoulFrequency = () => {
  const cycle = loadCycleCount();
  if (cycle < 1) return null;
  const sf = loadSoulFrequency();
  const topResonance = sf.resonances && sf.resonances.length > 0 ? sf.resonances.sort((a,b) => b.strength - a.strength)[0] : null;
  return { ...sf, topResonance };
};

export const SEALED_GOD_KEY  = "taleforge-sealed-god";

export const loadSealedGod   = () => { const r = lsGet(SEALED_GOD_KEY); return r ? JSON.parse(r) : { shards: 0, totalShards: 15, released: false, alignment: null }; };

export const saveSealedGod   = (g) => lsSet(SEALED_GOD_KEY, JSON.stringify(g));


export const collectGodShard = (scenario) => {
  const sg = loadSealedGod();
  if (sg.released) return sg;
  sg.shards = Math.min(sg.totalShards, (sg.shards || 0) + 1);
  sg.lastShard = { scenario: scenario || "", collectedAt: new Date().toISOString() };
  if (sg.shards >= sg.totalShards) {
    sg.released = true;
    sg.releasedAt = new Date().toISOString();
  }
  saveSealedGod(sg);
  return sg;
};

export const setGodAlignment = (karmaScore) => {
  const sg = loadSealedGod();
  if (!sg.released) return;
  sg.alignment = karmaScore <= 30 ? "ally" : karmaScore >= 70 ? "enemy" : "neutral";
  sg.alignmentDesc = sg.alignment === "ally" ? "신이 당신을 돕기로 결정했다. 강력한 조력자 등장."
    : sg.alignment === "enemy" ? "신이 당신을 위협으로 여긴다. 최강의 적이 등장."
    : "신이 중립을 지킨다. 간섭하지 않으나 길을 막지도 않는다.";
  saveSealedGod(sg);
};

export const getSealedGodStatus = () => {
  const sg = loadSealedGod();
  return { ...sg, progressPercent: Math.round(((sg.shards || 0) / sg.totalShards) * 100) };
};

export const NATURAL_LAW_KEY  = "taleforge-natural-law";

export const loadNaturalLaw   = () => { const r = lsGet(NATURAL_LAW_KEY); return r ? JSON.parse(r) : { mutations: [], stage: 0 }; };

export const saveNaturalLaw   = (l) => lsSet(NATURAL_LAW_KEY, JSON.stringify(l));


export const evolvNaturalLaw = (cycle) => {
  const nl = loadNaturalLaw();
  const newMutations = NATURAL_LAW_MUTATIONS.filter(m => m.cycle <= cycle && !nl.mutations.find(nm => nm.stage === m.stage));
  newMutations.forEach(m => nl.mutations.push({ ...m, evolvedAt: new Date().toISOString(), atCycle: cycle }));
  nl.stage = nl.mutations.length;
  saveNaturalLaw(nl);
  return { newMutations, total: nl.mutations };
};

export const getNaturalLaw = () => {
  const cycle = loadCycleCount();
  if (cycle < 5) return null;
  const nl = loadNaturalLaw();
  const nextMutation = NATURAL_LAW_MUTATIONS.find(m => m.cycle > cycle && !nl.mutations.find(nm => nm.stage === m.stage));
  return { ...nl, nextMutation };
};

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_25(){
const _origDetectDemonSin = window.detectDemonSinFromText;

window.detectDemonSinFromText = function(text) {
  if (_origDetectDemonSin) _origDetectDemonSin(text);
  detectDemonContractFromText(text);
  detectTrueNameEventFromText(text);
};
}

