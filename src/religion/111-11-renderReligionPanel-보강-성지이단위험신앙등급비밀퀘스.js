// 11. renderReligionPanel 보강 (성지/이단위험/신앙등급/비밀퀘스트)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { RELIGION_SECRET_QUESTS } from '../data/107-7-성직자-비밀-퀘스트-라인.js';
import { SHRINE_DEFS } from '../data/109-9-성지-시스템.js';
import { loadReputation } from '../misc/054-이동수단-시스템.js';
import { getReligionTension } from '../misc/093-4-긴장도-계산.js';
import { loadReligionQuests } from '../quest/107-7-성직자-비밀-퀘스트-라인.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { getRegionReligionShare } from './092-3-지역-종교-점유율-조회수정.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';
import { getFaithTier } from './101-1-신앙fath-종교-시스템-실제-연동.js';
import { getReligionRollBonus } from './102-2-종교-축복저주-판정-보너스.js';
import { loadReligionBlessLog } from './103-3-신의-응답-저주-시스템.js';
import { hasWorldThreatActive, loadReligionMarriage, loadSyncretism, loadTerritoryPacts } from './105-5-제5-혼합-종파-Syncretism.js';
import { getHeresyRiskLabel } from './108-8-이단-심문-시스템.js';
import { loadShrines } from './109-9-성지-시스템.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_92(){
const _origRenderReligion = window.renderReligionPanel;

window.renderReligionPanel = function(){
  if(typeof _origRenderReligion==='function') _origRenderReligion();

  const body = document.getElementById('pb-religion');
  if(!body) return;

  const tier = getFaithTier();
  const rb   = getReligionRollBonus();
  const heresyLabel = getHeresyRiskLabel();
  const shrines = loadShrines().filter(s=>s.active);
  const done = loadReligionQuests();
  const rel = typeof getPlayerReligion==='function' ? getPlayerReligion() : null;
  const rqs = rel ? (RELIGION_SECRET_QUESTS[rel]||[]) : [];
  const sync = loadSyncretism();
  const blessLog = loadReligionBlessLog().slice(-3).reverse();

  let extra = '';

  // 신앙 등급
  extra += `<div style="padding:8px 10px;background:#090600;border:1px solid #2a1a05;margin-bottom:8px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tier,{size:16}):(tier.icon)}</span>
      <div>
        <div style="font-family:Cinzel,serif;font-size:10px;color:#c8a96e">신앙 등급: ${tier.label}</div>
        <div style="font-size:8px;color:var(--dim)">기적 확률 ${Math.round((tier.miracleChance||0)*100)}% · 교화 보너스 ${tier.evangelBonus>0?'+':''}${tier.evangelBonus}</div>
      </div>
    </div>
    ${rb?`<div style="font-size:9px;color:#80c060">${rb.desc}</div>`:''}
    ${heresyLabel?`<div style="font-size:9px;color:#e05050;margin-top:3px">${heresyLabel}</div>`:''}
  </div>`;

  // 비밀 퀘스트
  if(rqs.length){
    const discovered = rqs.filter(q=>done[q.id]);
    if(discovered.length){
      extra += `<div style="font-family:Cinzel,serif;font-size:9px;color:#a08040;margin-bottom:5px">🔮 비밀 퀘스트</div>`;
      discovered.forEach(q=>{
        const status = done[q.id]==='completed'?'✅ 완료':'🔮 진행중';
        extra += `<div style="padding:6px 8px;background:#080600;border:1px solid #2a1a00;margin-bottom:4px">
          <div style="font-size:9px;color:#c8a96e">${q.title} <span style="color:${done[q.id]==='completed'?'#60c060':'#c8a96e'}">${status}</span></div>
          <div style="font-size:8px;color:var(--dim);margin-top:2px">${q.desc}</div>
          ${done[q.id]!=='completed'?`<button onclick="completeReligionQuest('${q.id}')" style="margin-top:4px;padding:2px 8px;background:#0a0800;border:1px solid #3a2a00;color:#a08040;font-size:8px;cursor:pointer">완료 처리</button>`:''}
        </div>`;
      });
    }
  }

  // 성지
  if(shrines.length){
    extra += `<div style="font-family:Cinzel,serif;font-size:9px;color:#a08040;margin-bottom:5px">⛪ 건립된 성지 (${shrines.length}개)</div>`;
    shrines.forEach(s=>{
      const def = SHRINE_DEFS[s.religion];
      extra += `<div style="padding:5px 8px;background:#080600;border:1px solid #2a1a00;margin-bottom:3px;display:flex;align-items:center;gap:6px">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:16}):(s.icon)}</span>
        <div style="flex:1"><div style="font-size:9px;color:#c8a96e">${s.name} (${s.region})</div>
        <div style="font-size:8px;color:var(--dim)">${def?.blessing||''}</div></div>
      </div>`;
    });
  }

  // 성지 건립 버튼
  if(rel){
    const loc = typeof loadCurrentLocation==='function'?loadCurrentLocation():null;
    const region = loc?.continent||'central';
    const existing = shrines.find(s=>s.region===region&&s.religion===rel);
    if(!existing){
      extra += `<button onclick="buildShrine('${region}')" style="width:100%;margin-bottom:8px;padding:7px;background:#0a0800;border:1px solid #3a2a00;color:#c8a96e;font-size:9px;cursor:pointer;font-family:Cinzel,serif">
        ⛪ 이 지역에 성지 건립 (300G)
      </button>`;
    }
  }

  // 혼합 종파
  if(sync){
    extra += `<div style="padding:7px 10px;background:#0a0a00;border:1px solid #4a4a10;margin-bottom:8px">
      <div style="font-family:Cinzel,serif;font-size:9px;color:#c0c060">🌈 ${sync.name}</div>
      <div style="font-size:8px;color:var(--dim);margin-top:2px">"${sync.doctrine}"</div>
    </div>`;
  } else if(rel) {
    extra += `<button onclick="initiatePeaceRoute('syncretism','${(typeof loadCurrentLocation==='function'?loadCurrentLocation():null)?.continent||'central'}')" style="width:100%;margin-bottom:8px;padding:6px;background:#060608;border:1px solid #2a2a10;color:#8080a0;font-size:8px;cursor:pointer">🌈 교리 혼합 시도 (혼합 종파 탄생)</button>`;
  }

  // ── 비전투 평화 해결 경로 5종 (교리 혼합 제외 — 위에서 별도 처리) ──
  if(rel){
    const _pRegion = (typeof loadCurrentLocation==='function'?loadCurrentLocation():null)?.continent||'central';
    const _repScore = (typeof loadReputation==='function' ? loadReputation() : {}).score || 0;
    const _share = getRegionReligionShare(_pRegion);
    const _hasRivalShare = Object.entries(_share).some(([k,v])=>k!==rel && RELIGIONS[k] && v>0);
    const _hasThreat = typeof hasWorldThreatActive==='function' && hasWorldThreatActive();
    const _hasAbyss = (_share.abyss||0) >= 5;
    const _marriageDone = typeof loadReligionMarriage==='function' && loadReligionMarriage();
    const _territoryDone = (typeof loadTerritoryPacts==='function' ? loadTerritoryPacts() : []).some(p=>p.region===_pRegion);

    extra += `<div style="font-family:Cinzel,serif;font-size:9px;color:#a08040;margin:10px 0 5px">☮️ 비전투 해결 경로</div>`;

    const peaceRouteRows = [
      { id:'council', icon:'⚖️', label:'교리 대논쟁', ok:_repScore>=50 && _hasRivalShare,
        note: !_hasRivalShare?'경쟁 종교 없음':(_repScore<50?`평판 ${_repScore}/50`:'') },
      { id:'common_foe', icon:'☮️', label:'공통의 적 — 임시 휴전', ok:_hasThreat && getReligionTension(_pRegion).level>0,
        note: !_hasThreat?'세계적 위협 없음':(getReligionTension(_pRegion).level<=0?'이미 평화로움':'') },
      { id:'marriage', icon:'💍', label:'혼인 동맹', ok:!_marriageDone && _hasRivalShare,
        note: _marriageDone?'이미 성사됨: '+_marriageDone.name:(!_hasRivalShare?'대상 종교 없음':'') },
      // [15차 감사 FIX] getReligionTension()은 {level,between,desc,icon,stage}
      // 객체를 반환하는데 여기 두 항목(common_foe·heresy_pact)이 그 반환값을
      // 그대로 >0/<=0으로 비교하고 있었다 — 객체와 숫자 비교는 "[object
      // Object]"를 NaN으로 강제 변환해 항상 false가 되므로, 두 평화 경로가
      // 실제 긴장도와 무관하게 절대 열리지 않는(그리고 "이미 평화로움" 안내도
      // 절대 안 뜨는) 진짜 버그였다. .level로 실제 숫자를 꺼내 비교하도록 수정.
      { id:'heresy_pact', icon:'🕊️', label:'이단 분리 조약', ok:_hasAbyss && rel!=='abyss' && getReligionTension(_pRegion).level>0,
        note: rel==='abyss'?'심연의 계시 신자는 불가':(!_hasAbyss?'공동 이단 세력 부족':(getReligionTension(_pRegion).level<=0?'이미 평화로움':'')) },
      { id:'territory', icon:'📜', label:'성지 분할 협약', ok:!_territoryDone && _hasRivalShare,
        note: _territoryDone?'이미 체결됨':(!_hasRivalShare?'대상 종교 없음':'') },
    ];
    peaceRouteRows.forEach(row=>{
      extra += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-top:1px solid #0a0800">
        <span style="flex:1;font-size:8px;color:${row.ok?'var(--text)':'var(--dim)'}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(row,{size:8}):(row.icon)} ${row.label}${row.note?` <span style="color:#6a5a3a">(${row.note})</span>`:''}</span>
        ${row.ok
          ? `<button onclick="initiatePeaceRoute('${row.id}','${_pRegion}')" style="padding:3px 8px;background:#0a0800;border:1px solid #3a2a10;color:#c8a96e;font-size:7px;cursor:pointer">시도</button>`
          : `<span style="font-size:7px;color:#4a3a2a">잠김</span>`}
      </div>`;
    });
  }

  // 최근 신성 응답 기록
  if(blessLog.length){
    extra += `<div style="font-family:Cinzel,serif;font-size:9px;color:#a08040;margin-bottom:5px">✨ 최근 신성 응답</div>`;
    blessLog.forEach(b=>{
      extra += `<div style="font-size:8px;color:var(--dim);padding:3px 0;border-bottom:1px solid #0f0c00">${b.type==='blessing'?'✨':'⚡'} ${b.msg.slice(0,50)} (턴${b.turn})</div>`;
    });
    extra += '<div style="margin-bottom:8px"></div>';
  }

  body.innerHTML += extra;
};
}

