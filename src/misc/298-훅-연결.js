// 훅 연결
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadSuggCache } from '../core/084-TaleForge-순수-JS-엔진.js';
import { loadAIJobPool } from '../job/042-직업-시스템-무한-파생-도감.js';
import { loadItemCache } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { animBloodlineAwaken, animBossRoom, animCritHit, animDungeonFloorTransit, animGoldGain, animHpDamage, animHpHeal, animLevelUpFlash, animProphecyGlow, animQuestBanner } from '../patches/297-TaleForge-애니메이션-트리거-시스템-v57.js';
import { getObjectLearnStats, getSituationLearnStats } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { isErudaEnabled } from '../ui/296-AI설정-패널-개발-콘솔eruda-토글.js';
import { lsGet } from '../utils.js';

(function hookQuestBannerAnim(){
  if(window._questBannerAnimHooked) return;
  window._questBannerAnimHooked = true;
  // MutationObserver로 AI 버블 감지
  const observer = new MutationObserver(mutations=>{
    for(const mut of mutations){
      for(const node of mut.addedNodes){
        if(node.nodeType!==1) continue;
        const bubble = node.classList?.contains('msg-ai') ? node : node.querySelector?.('.msg-ai');
        if(!bubble) continue;
        const text = bubble.innerText||bubble.textContent||'';
        // 퀘스트 완료 키워드 감지
        if(/퀘스트.*완료|임무.*완료|의뢰.*달성|달성.*완료|성공적으로.*완수/.test(text)){
          // 등급 감지
          const gradeM = text.match(/\[([SABCDE])등급\]/);
          const grade = gradeM?.[1]||'C';
          const titleM = text.match(/[「『""]([^」』""]*)(?:퀘스트|임무|의뢰)/);
          animQuestBanner(grade, titleM?.[1]||'');
        }
        // 크리티컬 히트 감지
        if(/크리티컬|치명타|대성공.*일격|완벽한.*일격/.test(text)){
          animCritHit();
        }
      }
    }
  });
  const tryAttach=()=>{
    const el=document.getElementById('msgs');
    if(el){ observer.observe(el,{childList:true,subtree:true}); }
    else setTimeout(tryAttach,800);
  };
  tryAttach();
})();

// [13차 감사 FIX — 제거] window.awakenBloodline은 이 게임에 그 이름으로
// 정의된 적이 없다(실제 각성 함수는 job/125의 awakenBloodlineAuto) — 그래서
// orig가 항상 undefined였고 이 블록이 늘 조용히 아무 일도 안 했다. 각성
// 연출(animBloodlineAwaken) 호출은 job/125의 awakenBloodlineAuto() 안으로
// 옮겼다.

// [학습 현황 대시보드] 지금까지 흩어져 있던 학습/캐시 저장소(상황 학습·
// 오브젝트 학습·전투 상태 학습·직업 파생 풀·캐릭터 생성 추천 캐시·아이템
// 영구 보관고)를 한곳에 모아, "지금 콘텐츠 중 몇 %가 이제 AI 호출 없이
// 재사용되는지"를 숫자로 보여준다. 1단계→2단계→3단계(완전 하드코딩)로
// 가는 진행률을 실제로 확인할 수 있게 하는 게 목적이라, 새 캐시를 만드는
// 게 아니라 이미 있는 저장소들을 읽기만 한다.
export function getLearningOverview(){
  const situation = (typeof getSituationLearnStats==='function') ? getSituationLearnStats() : [];
  const object    = (typeof getObjectLearnStats==='function')    ? getObjectLearnStats()    : [];

  const combatData = (()=>{ try{ return JSON.parse(lsGet('tf-combat-learn-data')||'[]'); }catch(e){ return []; } })();
  const combatMin = 30;

  const jobPool = (typeof loadAIJobPool==='function') ? loadAIJobPool() : {};
  const jobParents = new Set(Object.values(jobPool).map(j=>j.parentJobId).filter(Boolean));

  const sugg = (typeof loadSuggCache==='function') ? loadSuggCache() : {};
  const suggKeys = Object.keys(sugg);
  const suggMatured = suggKeys.filter(k=>(sugg[k]||[]).length>=5);

  const itemCache = (typeof loadItemCache==='function') ? loadItemCache() : {items:{}};
  const itemCount = Object.keys(itemCache.items||{}).length;

  // [매칭 엔진] 이 게임에 원래부터 있던, 매 턴 AI 응답 자체를 스킵할 수
  // 있는 가장 핵심적인 학습 시스템(quest/086의 _meIntercept, callAI에
  // 실제로 연결되어 있음) — 새로 만든 게 아니라 이미 있던 것의 현재
  // 히트율을 그대로 읽어온다.
  const meStats = (()=>{ try{ return JSON.parse(lsGet('tf-me-stats')||'{}'); }catch(e){ return {}; } })();
  const meHits = meStats.hits||0, meMisses = meStats.misses||0, meTotal = meHits+meMisses;
  const meRate = meTotal>0 ? Math.round(meHits/meTotal*100) : 0;
  const meEnabled = lsGet('tf-me-enabled') === '1';

  // "성숙/미성숙"이 명확히 갈리는 버킷형 시스템만 모아 전체 진행률을 낸다
  // (직업 풀·아이템 보관고는 "한 번 성공하면 그걸로 끝"이라 성숙 개념이
  // 없는 누적 저장소라 분모에서 제외 — 별도로 숫자만 보여준다).
  const bucketSystems = [
    ...situation.map(s=>s.matured),
    ...object.map(o=>o.matured),
    ...suggKeys.map(k=>suggMatured.includes(k)),
  ];
  const totalBuckets   = bucketSystems.length;
  const maturedBuckets = bucketSystems.filter(Boolean).length;
  const overallPct = totalBuckets>0 ? Math.round(maturedBuckets/totalBuckets*100) : 0;

  return {
    situation: { buckets: situation.length, matured: situation.filter(s=>s.matured).length, totalExamples: situation.reduce((a,s)=>a+s.count,0) },
    object:    { buckets: object.length,    matured: object.filter(o=>o.matured).length,    totalExamples: object.reduce((a,o)=>a+o.count,0) },
    combat:    { examples: combatData.length, min: combatMin, matured: combatData.length>=combatMin },
    jobPool:   { cachedParents: jobParents.size, totalJobs: Object.keys(jobPool).length },
    suggCache: { keys: suggKeys.length, matured: suggMatured.length },
    itemArchive: { count: itemCount },
    matchingEngine: { enabled: meEnabled, hits: meHits, total: meTotal, rate: meRate },
    overallPct, totalBuckets, maturedBuckets,
  };
}
window.getLearningOverview = getLearningOverview;

export function renderLearningDashboardSection(){
  const pb = document.getElementById('pb-aisettings');
  if(!pb) return;
  let mount = document.getElementById('learning-dashboard-mount');
  if(!mount){
    mount = document.createElement('div');
    mount.id = 'learning-dashboard-mount';
    pb.appendChild(mount);
  }
  const o = getLearningOverview();
  const row = (label, matured, total, extra='') => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--bg-input);border:1px solid var(--border);border-radius:2px;margin-bottom:6px">
      <div style="font-size:10px;color:var(--dim)">${label}${extra?`<div style="font-size:9px;color:#5a4a3a;margin-top:2px">${extra}</div>`:''}</div>
      <div style="font-family:Cinzel,serif;font-size:11px;color:var(--gold)">${matured}/${total}</div>
    </div>`;

  mount.innerHTML = `
    <div style="padding:0 14px 14px">
      <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1px;margin-bottom:10px;padding-bottom:6px;border-top:1px solid var(--border);padding-top:14px">
        📊 학습 현황 — AI 없이 재사용되는 비율
      </div>
      <div style="text-align:center;padding:12px;margin-bottom:10px;background:linear-gradient(135deg,#0d0800,#1a1000);border:1px solid var(--gold);border-radius:2px">
        <div style="font-family:Cinzel,serif;font-size:24px;color:var(--gold)">${o.overallPct}%</div>
        <div style="font-size:9px;color:var(--dim);margin-top:2px">버킷형 학습 조합 ${o.maturedBuckets}/${o.totalBuckets}건 성숙</div>
      </div>
      ${row('🎭 상황 학습 (돌발조우·보스·재앙 서술)', o.situation.matured, o.situation.buckets, `누적 예시 ${o.situation.totalExamples}건`)}
      ${row('📦 오브젝트 학습 (장소·퀘스트·아이템·던전 등)', o.object.matured, o.object.buckets, `누적 예시 ${o.object.totalExamples}건`)}
      ${row('⚔️ 전투 상태 학습', o.combat.matured?1:0, 1, `${o.combat.examples}/${o.combat.min}건`)}
      ${row('✨ 캐릭터 생성 추천 캐시', o.suggCache.matured, o.suggCache.keys)}
      <div style="font-size:9px;color:#5a4a3a;padding:6px 10px">💼 직업 파생 풀: ${o.jobPool.cachedParents}개 부모 직업에서 총 ${o.jobPool.totalJobs}개 캐시됨 (누적 저장소, 성숙 개념 없음)</div>
      <div style="font-size:9px;color:#5a4a3a;padding:2px 10px">🗡️ 아이템 영구 보관고: 누적 ${o.itemArchive.count}개</div>

      <div style="margin-top:10px;padding:10px;background:#0a0a14;border:1px solid #2a2a4a;border-radius:2px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:10px;color:#8090e0">🧠 로컬 매칭 엔진 (매 턴 서사 자체를 스킵)</span>
          <span style="font-size:9px;color:${o.matchingEngine.enabled?'#60c060':'#888'}">${o.matchingEngine.enabled?'ON':'OFF'}</span>
        </div>
        <div style="font-size:8px;color:#6a6a8a;line-height:1.5;margin-bottom:6px">위 학습 시스템들과 달리, 이건 매 턴 AI 응답 그 자체를 대신할 수 있는 가장 핵심적인 학습 시스템입니다 — 선택지 클릭에만 적용되고, 자유 입력은 항상 AI를 씁니다.</div>
        ${o.matchingEngine.total>0
          ? `<div style="font-size:9px;color:#8a8aa0">AI 호출 절감 <b style="color:#60c060">${o.matchingEngine.rate}%</b> (${o.matchingEngine.hits}/${o.matchingEngine.total}건)</div>`
          : `<div style="font-size:8px;color:#4a4a5a">아직 시도 기록 없음</div>`}
        <button onclick="showCollectionStats()" style="width:100%;margin-top:8px;padding:6px;font-size:9px;background:#0d0d1a;border:1px solid #3a3a5a;color:#a0a0d0;cursor:pointer;border-radius:2px">자세히 보기 · 켜기/끄기 · 룰 추출기</button>
      </div>
    </div>`;
}
window.renderLearningDashboardSection = renderLearningDashboardSection;

export function renderAISettings() {
  const pb = document.getElementById('pb-aisettings');
  if (!pb) return;
  const erudaOn = isErudaEnabled();
  let html = `
    <div style="padding:12px 14px">
      <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">
        ⚙️ 일반 설정
      </div>

      <!-- 개발 콘솔 토글 -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg-input);border:1px solid var(--border);border-radius:2px;margin-bottom:8px">
        <div>
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold)">🛠️ 개발 콘솔</div>
          <div style="font-size:9px;color:var(--dim);margin-top:2px">eruda 디버그 콘솔 표시 여부</div>
        </div>
        <button onclick="toggleEruda()" style="
          padding:6px 14px;
          background:${erudaOn ? 'linear-gradient(135deg,#1a3a0d,#2a5a1a)' : 'var(--bg-screen)'};
          border:1px solid ${erudaOn ? '#4a9a2a' : 'var(--border)'};
          color:${erudaOn ? '#80c040' : 'var(--dim)'};
          font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px;
          min-width:52px;text-align:center
        ">${erudaOn ? '켜짐' : '꺼짐'}</button>
      </div>
    </div>`;

  // 자동플레이 섹션 — renderAutoPlaySection이 없으면 만들고, 있으면
  // 다시 그려서(속도/전략/실행상태를 최신으로 유지) 뒤에 붙인다.
  pb.innerHTML = html;
  if (typeof window.renderAutoPlaySection === 'function') window.renderAutoPlaySection();
  renderLearningDashboardSection();

  // [로컬 AI 모델] 시작 화면에만 있던 토글/진단로그를 게임 중에도 볼 수
  // 있게 마운트 — 시작 화면(#local-model-setting)은 게임 시작 후엔
  // 더 이상 접근할 방법이 없어서, 여기 없으면 로그를 확인할 길이 없었다.
  let localModelWrap = document.getElementById('local-model-setting-ingame-wrap');
  if (!localModelWrap) {
    localModelWrap = document.createElement('div');
    localModelWrap.id = 'local-model-setting-ingame-wrap';
    localModelWrap.style.padding = '0 14px 14px';
    pb.appendChild(localModelWrap);
  }
  localModelWrap.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1px;margin-bottom:10px;padding-bottom:6px;border-top:1px solid var(--border);padding-top:14px">
      🧠 로컬 AI 모델
    </div>
    <div id="local-model-setting-ingame"></div>`;
  if (typeof window.renderLocalModelSetting === 'function') window.renderLocalModelSetting();
}
window.renderAISettings = renderAISettings;

(function(){
  if (isErudaEnabled()) {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/eruda';
    s.onload = function() { try { eruda.init(); } catch(e) {} };
    document.head.appendChild(s);
  }
})();

window.renderAISettings = renderAISettings;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_268(){
(function hookLevelUpAnim(){
  const orig = window.dramaticLevelUp;
  if(typeof orig!=='function') return;
  window.dramaticLevelUp = function(...args){
    animLevelUpFlash();
    return orig.apply(this, args);
  };
})();

(function hookHpAnim(){
  if(window._hpAnimHooked) return;
  window._hpAnimHooked = true;
  const origUpdateHeader = window.updateHeader;
  let _prevHp = null;
  window.updateHeader = function(...args){
    const curHp = S?.stats?.hp;
    if(_prevHp !== null && curHp !== undefined && curHp !== _prevHp){
      const delta = curHp - _prevHp;
      if(delta < 0) animHpDamage(Math.abs(delta));
      else if(delta > 0) animHpHeal(delta);
    }
    _prevHp = curHp;
    if(typeof origUpdateHeader==='function') return origUpdateHeader.apply(this, args);
  };
})();

(function hookGoldAnim(){
  if(window._goldAnimHooked) return;
  window._goldAnimHooked = true;
  const orig = window.processGSBlock;
  if(typeof orig!=='function') return;
  window.processGSBlock = function(gs, ...args){
    if(gs && gs.gold && Number(gs.gold)>0) animGoldGain(Number(gs.gold));
    return orig.apply(this, [gs, ...args]);
  };
})();

(function hookDungeonFloor(){
  if(window._dungeonFloorAnimHooked) return;
  window._dungeonFloorAnimHooked = true;
  const orig = window.advanceDungeonRoom;
  if(typeof orig!=='function') return;
  window.advanceDungeonRoom = function(...args){
    const ds = window._dungeonSession;
    const prevFloor = ds?.floor||1;
    const result = orig.apply(this, args);
    // 층 변화 감지 (비동기이므로 짧은 interval로 체크)
    let checks = 0;
    const iv = setInterval(()=>{
      checks++;
      if(window._dungeonSession && window._dungeonSession.floor > prevFloor){
        animDungeonFloorTransit(window._dungeonSession.floor);
        // 보스층이면 보스 연출 추가
        if(window._dungeonSession.floor % 5 === 0) setTimeout(animBossRoom, 1600);
        clearInterval(iv);
      }
      if(checks > 40) clearInterval(iv); // 4초 후 포기
    }, 100);
    return result;
  };
})();

// [버그 수정] 여기 있던 hookBossRoomAnim(보스방 진입 연출)과
// hookProphecyAnim(예언 실현 연출)은 각각 renderDungeonRoomHTML(combat/256)
// ·fulfillProphecy(lore/301)의 실제 호출부가 bare 식별자라 한 번도
// 적용되지 못했다. 같은 로직을 각 실제 정의부에 네이티브로 옮겼다.

window.animLevelUpFlash = animLevelUpFlash;

window.animQuestBanner  = animQuestBanner;

window.animProphecyGlow = animProphecyGlow;

window.animBloodlineAwaken = animBloodlineAwaken;

window.animHpDamage     = animHpDamage;

window.animHpHeal       = animHpHeal;

window.animGoldGain     = animGoldGain;

window.animDungeonFloorTransit = animDungeonFloorTransit;

window.animBossRoom     = animBossRoom;

window.animCritHit      = animCritHit;
}

