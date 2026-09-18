// ⑤ 세계 반응 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { WORLD_EVENTS } from '../data/042-직업-시스템-무한-파생-도감.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadWorldEvents } from '../job/042-직업-시스템-무한-파생-도감.js';
import { loadReputation, updateReputation } from '../misc/054-이동수단-시스템.js';
import { loadWorldState } from '../misc/066-②-선택-결과-추적-시스템.js';
import { getCurrentFactions, loadFactionRep, updateFactionRep } from '../npc/067-③-NPC-관계망-시스템.js';
import { loadStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { renderWorldMap } from '../race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from './052-동대륙-추가-장소-4.js';
import { loadGSFlags } from './145-⑥-세계-상태-DB.js';

export const WORLD_REACTION_KEY = 'tf-world-reactions';

export function loadWorldReactions(){ try{ return JSON.parse(lsGet(WORLD_REACTION_KEY)||'[]'); }catch(e){ return []; } }
window.loadWorldReactions = loadWorldReactions;

export function saveWorldReactions(d){ try{ lsSet(WORLD_REACTION_KEY, JSON.stringify(d)); }catch(e){} }
window.saveWorldReactions = saveWorldReactions;

export function checkWorldReactions(){
  const ws  = loadWorldState();
  const st  = loadStats()||{};
  const rep = loadReputation();
  const reactions = loadWorldReactions();
  const fired = new Set(reactions.map(r=>r.id));

  const triggers = [
    // 악행 누적
    { id:'evil_rumor',    condition:()=>(ws.evilActs||0)>=5 && !fired.has('evil_rumor'),
      effect:()=>{ updateFactionRep('왕국 기사단',-15); updateFactionRep('교회',-10);
        return '네 악행에 대한 소문이 퍼지기 시작했다. 왕국 기사단과 교회가 경계를 높인다.'; } },
    { id:'evil_wanted',   condition:()=>(ws.evilActs||0)>=15 && !fired.has('evil_wanted'),
      effect:()=>{ updateFactionRep('왕국 기사단',-30);
        return '현상수배 명단에 이름이 올랐다! 기사단이 추적을 시작한다.'; } },
    // 선행 누적
    { id:'hero_rumor',    condition:()=>(ws.goodActs||0)>=5 && !fired.has('hero_rumor'),
      effect:()=>{ updateFactionRep('왕국 기사단',10); updateFactionRep('교회',8);
        return '선행의 소문이 퍼졌다. 사람들이 당신을 의인으로 부르기 시작한다.'; } },
    { id:'hero_champion', condition:()=>(ws.goodActs||0)>=20 && !fired.has('hero_champion'),
      effect:()=>{ updateFactionRep('왕국 기사단',25); updateReputation(50);
        return '왕국 전역에 영웅으로 이름을 떨쳤다! 왕이 알현을 요청한다.'; } },
    // 평판 기반
    { id:'legend_born',   condition:()=>rep.score>=500 && !fired.has('legend_born'),
      effect:()=>{ toast('📜 전설이 탄생했다', 3000);
        return '음유시인들이 당신의 이야기를 노래하기 시작했다. 세계가 당신을 기억한다.'; } },
    // 죽음 목격
    { id:'death_haunts',  condition:()=>(ws.deathsWitnessed||0)>=10 && !fired.has('death_haunts'),
      effect:()=>{ 
        return '너무 많은 죽음을 목격했다. 가끔 망자들의 얼굴이 떠오른다. (WIL-5 영구)'; } },
    // 배신
    { id:'betrayal_mark', condition:()=>(ws.did_배신||0)>=2 && !fired.has('betrayal_mark'),
      effect:()=>{ updateFactionRep('상인 조합',-10);
        return '배신자라는 낙인이 찍혔다. 사람들이 당신을 믿기 꺼린다.'; } },
  ];

  triggers.forEach(t=>{
    if(t.condition()){
      const msg = t.effect();
      const newReaction = { id:t.id, msg, turn:S.msgCount, at:new Date().toISOString() };
      reactions.push(newReaction);
      saveWorldReactions(reactions);
      setTimeout(()=>toast(`🌍 세계의 반응: ${msg.slice(0,40)}...`, 4000), 500);
    }
  });
}
window.checkWorldReactions = checkWorldReactions;

export function renderWorldReactions(){
  const reactions = loadWorldReactions();
  const ws = loadWorldState();
  const factionRep = loadFactionRep();
  const body = document.getElementById('pb-worldmap');
  if(!body) return;

  // ── 세계 뉴스피드 데이터 생성 ──────────────────────────────
  const _sid = S.scenario?.id || 'medieval';
  const _firedEvts = loadWorldEvents ? loadWorldEvents() : {};
  const _worldEvtList = WORLD_EVENTS[_sid] || [];
  const _activeEvts = _worldEvtList.filter(e=>_firedEvts[e.id]);
  const _cycle = loadCycleCount ? loadCycleCount() : 0;
  const _gsFlags = (typeof loadGSFlags==='function') ? loadGSFlags() : {};

  // 아에테른 달력
  const _MONTHS = ['싹트기월','꽃비월','여름불월','폭풍월','황금월','낙엽월','서리월','설원월'];
  const _ICONS =  ['🌱','🌸','☀️','⛈️','🌾','🍂','❄️','🌨️'];
  const _turn = S.msgCount || 0;
  const _mIdx = Math.floor((_turn / 15) % 8);
  const _day  = (_turn % 15) + 1;
  const _year = 3782 + Math.floor(_turn / 120);
  const _anomaly = (window._gsFlags['mq4_done']||window._gsFlags['world_saved']) ? ' ⚠️' : '';

  // 주요 인물 현재 상태
  const _npcNews = [];
  if(_firedEvts['we_noble_crisis']) _npcNews.push('⚔️ 레오나르드 기사단장 — 긴급 집회 소집');
  else _npcNews.push('⚔️ 레오나르드 기사단장 — 왕성 지하 잦은 방문');
  if(_firedEvts['we_seal_crack'])   _npcNews.push('🔮 아르카누스 대마법사 — 탑 칩거 중');
  else _npcNews.push('🔮 아르카누스 대마법사 — 마법 도서관 접근 통제');
  if(window._gsFlags['mq3_done'])          _npcNews.push('😈 아스모데우스 결사 — 각 대륙 활동 포착');
  if(window._gsFlags['celestial_gate_open']) _npcNews.push('✨ 미카엘 대천사장 — 에이든 지원 중, 예언 밖의 존재(플레이어) 주시 중');
  if(window._gsFlags['infernal_gate_open'])  _npcNews.push('🔥 마왕 베엘제부브 — 마계 군단 집결');

  const existingContent = body.innerHTML;
  body.innerHTML = `
    <!-- [V1/V2 통합] 지도(SVG) / 세계 소식 탭 전환 -->
    <div style="display:flex;border-bottom:1px solid #1a2a14;margin:-1px -1px 12px -1px">
      <button onclick="renderWorldMapPanel()" style="flex:1;padding:7px 4px;background:transparent;border:none;border-bottom:2px solid transparent;color:var(--dim);font-family:Cinzel,serif;font-size:9px;cursor:pointer">🗺️ 지도</button>
      <button onclick="renderWorldReactions()" style="flex:1;padding:7px 4px;background:#0d1a0a;border:none;border-bottom:2px solid #7aaa6a;color:#7aaa6a;font-family:Cinzel,serif;font-size:9px;cursor:pointer">📰 세계 소식</button>
    </div>
    <!-- ══ 세계 뉴스피드 ══════════════════════════════════ -->
    <div style="margin-bottom:14px">
      <!-- 달력 헤더 -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1px">📰 아에테른 세계 소식</div>
        <div style="font-size:9px;color:var(--dim)">${_ICONS[_mIdx]} ${_year}년 ${_MONTHS[_mIdx]} ${_day}일${_anomaly}</div>
      </div>

      <!-- 발화된 세계 사건 -->
      ${_activeEvts.length ? `
      <div style="margin-bottom:8px">
        <div style="font-size:9px;color:var(--dim);margin-bottom:4px;letter-spacing:.5px">🌍 진행 중인 세계 사건</div>
        ${_activeEvts.slice(-5).reverse().map(e=>`
          <div style="display:flex;align-items:flex-start;gap:6px;padding:5px 8px;background:#0d0800;border:1px solid var(--border);margin-bottom:3px">
            <div style="flex:1">
              <div style="font-size:10px;color:var(--text)">${e.title}</div>
              <div style="font-size:9px;color:var(--dim);margin-top:1px">${e.desc?.slice(0,50)||''}${(e.desc?.length||0)>50?'...':''}</div>
            </div>
          </div>`).join('')}
      </div>` : `<div style="font-size:9px;color:var(--dim);padding:6px 8px;border:1px solid var(--border);margin-bottom:8px">아직 특별한 세계 사건이 발생하지 않았습니다.</div>`}

      <!-- 주요 인물 동향 -->
      <div style="margin-bottom:8px">
        <div style="font-size:9px;color:var(--dim);margin-bottom:4px;letter-spacing:.5px">👤 주요 인물 동향</div>
        ${_npcNews.slice(0,4).map(n=>`
          <div style="padding:4px 8px;background:#0d0800;border:1px solid var(--border);margin-bottom:2px;font-size:9px;color:var(--text)">${n}</div>`).join('')}
      </div>

      <!-- 오늘의 소문 -->
      <div style="padding:7px 9px;background:#080500;border:1px dashed #2a1a05;margin-bottom:4px">
        <div style="font-size:8px;color:var(--dim);margin-bottom:4px">🍺 오늘 술집에서 들은 이야기</div>
        <div style="font-size:9px;color:#a09070;line-height:1.6;font-style:italic">"${[
          '셀리나 폐허에서 불빛이 보였다는 사람이 있대.',
          '예로부터 이야기를 먹고 사는 것이 있다지...',
          '기사단 지하에 뭔가 봉인된 게 있다더군.',
          '아르카누스 대마법사가 탑에서 나오질 않아.',
          '"에테르 나시온"이라고 속삭이는 자들이 있대.',
          '황금시대엔 세계수가 살아있었다고 노인들은 말하지.',
          '"세계수의 축복을" — 요즘 이 인사가 예전 같지 않아.',
          '왕의 건강이 나빠지고 있다더군.',
        ][(_turn + _cycle) % 8]}"</div>
      </div>
    </div>

    <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:8px;letter-spacing:1px">🌍 세계 기록</div>

    <!-- 파벌 관계도 -->
    <div style="margin-bottom:12px">
      <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:6px">⚖️ 파벌 관계</div>
      ${Object.entries(getCurrentFactions()).map(([name,f])=>{
        const rep2 = factionRep[name]||0;
        const level = rep2>=50?'동맹':rep2>=20?'우호':rep2>=-20?'중립':rep2>=-50?'적대':'전쟁';
        const color = rep2>=20?'#60a060':rep2>=-20?'#8a7a5a':'#e05050';
        const pct = Math.round((rep2+100)/2);
        return `<div style="padding:5px 8px;background:#0d0800;border:1px solid var(--border);margin-bottom:3px">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:10px;color:var(--gold)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(f,{size:10}):(f.icon)} ${name}</span>
            <span style="font-size:9px;color:${color}">${level} ${rep2>0?'+':''}${rep2}</span>
          </div>
          <div style="height:3px;background:#1a1005;border-radius:2px">
            <div style="width:${pct}%;height:100%;background:${color};border-radius:2px"></div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- 세계 반응 이력 -->
    <div style="margin-bottom:12px">
      <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:6px">📜 세계의 반응</div>
      ${reactions.length===0?'<div style="color:var(--dim);font-size:10px">아직 세계에 영향을 주지 않았다</div>':
      reactions.slice().reverse().slice(0,8).map(r=>`
        <div style="padding:6px 8px;background:#0d0800;border:1px solid #2a1a05;margin-bottom:3px">
          <div style="font-size:10px;color:#c8a96e">${esc(r.msg)}</div>
          <div style="font-size:8px;color:var(--dim);margin-top:2px">턴 ${r.turn}</div>
        </div>`).join('')}
    </div>

    <!-- 선택 이력 요약 -->
    <div style="margin-bottom:12px">
      <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-bottom:6px">🎯 선택 이력</div>
      <div style="display:flex;gap:8px;margin-bottom:6px">
        ${[['선행',ws.goodActs||0,'#60a060'],['악행',ws.evilActs||0,'#e05050'],['현명',ws.wiseActs||0,'#4a6fa5']].map(([label,cnt,color])=>`
          <div style="flex:1;padding:6px;background:#0d0800;border:1px solid ${color}33;text-align:center">
            <div style="font-size:14px;color:${color};font-family:'Cinzel',serif">${cnt}</div>
            <div style="font-size:8px;color:var(--dim)">${label}</div>
          </div>`).join('')}
      </div>
    </div>

    ${/* [버그 수정] renderWorldMap을 이 파일이 직접 import해 bare 호출하면
        race/064의 ★ 내 영지 표시 훅과 misc/325의 WSI 영향권 배지 훅이
        건 window.renderWorldMap 재할당을 둘 다 건너뛴다(다른 죽은 훅들과
        동일한 원인). window.renderWorldMap을 우선 사용해 두 훅 모두 살림. */
      (typeof window.renderWorldMap==='function'?window.renderWorldMap():renderWorldMap()).replace('<div style="margin-bottom:12px">','<div style="margin-bottom:12px" id="wm-inner">')}
  `;
  // 현재 위치가 천계/마계면 해당 탭 자동 선택
  try{
    const curContinent = (typeof loadCurrentLocation==='function') ? (loadCurrentLocation()?.continent||'') : '';
    if(curContinent==='celestial' || curContinent==='infernal'){
      setTimeout(()=>{ if(typeof window.wmSwitchTab==='function') window.wmSwitchTab(curContinent); }, 50);
    }
  }catch(e){}
}
window.renderWorldReactions = renderWorldReactions;
