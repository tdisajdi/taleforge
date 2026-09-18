// 8. 패널 렌더
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { EVANGEL_ACTIONS, PEACE_ROUTES, RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { getJobEvangelActions } from '../job/096-7-직업별-교화-가능-여부.js';
import { getReligionTension } from '../misc/093-4-긴장도-계산.js';
import { getRegionReligionShare } from '../religion/092-3-지역-종교-점유율-조회수정.js';
import { getPlayerReligion } from '../religion/094-5-플레이어-종교-귀속-교화.js';
import { toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadReligionState } from '../world/091-2-저장소.js';

export function mediateReligionWar(){
  const st = loadReligionState();
  if(!st.war) return;
  S._nextInjectedContext=(S._nextInjectedContext||'')
    +'\n[☮️ 종교전쟁 중재] 플레이어가 중재자로 나섰다. 양측을 설득하는 장면을 서사화하라. '
    +'REP+INT 판정. 성공 시 GS: "religion_tension_reset":"'+st.war.region+'" 출력.';
  toast('☮️ 중재 시도...',2500);
}
window.mediateReligionWar = mediateReligionWar;

window.mediateReligionWar = mediateReligionWar;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_78(){
function renderReligionPanel(){
  const body = document.getElementById('pb-religion');
  if(!body) return;

  const loc        = typeof loadCurrentLocation==='function' ? loadCurrentLocation() : null;
  const regionKey  = (loc&&loc.continent)||'central';
  const share      = getRegionReligionShare(regionKey);
  const tension    = getReligionTension(regionKey);
  const playerRel  = getPlayerReligion();
  const playerRelData = playerRel&&RELIGIONS[playerRel];
  const jobId      = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
  const availActs  = getJobEvangelActions(jobId);
  const st         = loadReligionState();

  // ── 헤더
  let html = '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">⛪ 종교 시스템</div>';

  // ── 플레이어 소속
  html += '<div style="padding:8px 10px;background:#090600;border:1px solid #2a1a05;margin-bottom:10px">';
  if(playerRelData){
    html += '<div style="display:flex;align-items:center;gap:7px">'
      +'<span style="font-size:20px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(playerRelData,{size:14}):(playerRelData?.icon))+'</span>'
      +'<div><div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--gold)">'+playerRelData.name+'</div>'
      +'<div style="font-size:9px;color:'+playerRelData.color+'">"'+playerRelData.greeting+'"</div></div>'
      +'</div>'
      +'<div style="font-size:9px;color:var(--dim);margin-top:4px">교화 성공: '+(S.character&&S.character.evangelCount||0)+'회 · 개종 NPC: '+(st.convertedNpcs&&st.convertedNpcs.length||0)+'명</div>';
  } else {
    html += '<div style="font-size:10px;color:var(--dim);margin-bottom:6px">소속 종교 없음 (무신앙)</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">'
      +Object.values(RELIGIONS).map(r=>'<button onclick="setPlayerReligion(\''+r.id+'\')" style="padding:5px;background:#0a0500;border:1px solid '+r.color+'44;color:'+r.color+';font-size:9px;cursor:pointer;text-align:left">'+r.icon+' '+r.name+'</button>').join('')
      +'</div>';
  }
  html += '</div>';

  // ── 지역 신도 분포
  const locName = (loc&&loc.name)||regionKey;
  html += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:6px">📍 '+locName+' 지역 신도 분포</div>';
  html += '<div style="padding:8px 10px;background:#090600;border:1px solid #2a1a05;margin-bottom:8px">';
  ['temple','solar','roots','abyss'].forEach(rid=>{
    const rel = RELIGIONS[rid];
    const pct = share[rid]||0;
    if(rid==='abyss'&&pct<5) return; // 심연은 낮으면 숨김
    html += '<div style="margin-bottom:5px">'
      +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">'
      +'<span style="font-size:11px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(rel,{size:14}):(rel?.icon))+'</span>'
      +'<span style="font-size:9px;color:'+rel.color+';flex:1">'+rel.name+'</span>'
      +'<span style="font-size:9px;color:'+rel.color+'">'+pct+'%</span>'
      +'</div>'
      +'<div style="height:4px;background:#0a0500;border-radius:2px;overflow:hidden">'
      +'<div style="width:'+pct+'%;height:100%;background:'+rel.color+';border-radius:2px;transition:width .5s"></div>'
      +'</div>'
      +'</div>';
  });
  html += '</div>';

  // ── 긴장도
  if(tension.level>0){
    const tColor = tension.level>=3?'#e05050':tension.level>=2?'#e0a030':'#c0c030';
    html += '<div style="padding:7px 10px;background:#150808;border:1px solid '+tColor+'44;border-left:3px solid '+tColor+';margin-bottom:8px">'
      +'<div style="font-family:\'Cinzel\',serif;font-size:9px;color:'+tColor+';margin-bottom:2px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(tension,{size:14}):(tension?.icon))+' 긴장도 '+tension.level+'단계</div>'
      +'<div style="font-size:9px;color:var(--dim)">'+tension.desc+'</div>'
      +(tension.between.length?'<div style="font-size:8px;color:'+tColor+';margin-top:2px">'+tension.between.map(r=>RELIGIONS[r]&&RELIGIONS[r].name||r).join(' vs ')+'</div>':'')
      +'</div>';
  }

  // ── 종교전쟁
  if(st.war){
    html += '<div style="padding:8px 10px;background:#200808;border:2px solid #e05050;margin-bottom:8px">'
      +'<div style="font-family:\'Cinzel\',serif;font-size:10px;color:#e05050;margin-bottom:4px">🔥 종교전쟁 진행 중</div>'
      +'<div style="font-size:9px;color:var(--dim)">지역: '+st.war.region+'<br>'
      +'교전: '+st.war.sides.map(s=>RELIGIONS[s]&&RELIGIONS[s].name||s).join(' vs ')+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:6px">'
      +st.war.sides.map(side=>{const r=RELIGIONS[side]; return '<button onclick="supportReligionWar(\''+side+'\')" style="padding:4px;background:#1a0808;border:1px solid '+(r?r.color:'#888')+'44;color:'+(r?r.color:'#888')+';font-size:8px;cursor:pointer">'+(r?r.icon:'')+' 지원</button>';}).join('')
      +'<button onclick="mediateReligionWar()" style="padding:4px;background:#0a0a1a;border:1px solid #6060a0;color:#8080c0;font-size:8px;cursor:pointer">☮️ 중재</button>'
      +'</div>'
      +'</div>';
  }

  // ── 교화 행동 버튼
  if(playerRelData&&availActs.length){
    html += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">✦ 교화 행동</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">';
    availActs.forEach(act=>{
      const a=EVANGEL_ACTIONS[act]||{};
      html += '<button onclick="performEvangel(\''+act+'\',\''+regionKey+'\')" style="padding:4px 8px;background:#0a0600;border:1px solid '+(playerRelData.color||'#888')+'44;color:'+(playerRelData.color||'#888')+';font-size:8px;cursor:pointer;border-radius:2px">'
        +act+(a.gold?' ('+a.gold+'G)':'')
        +'</button>';
    });
    html += '</div>';
  }

  // ── 비전투 해결 (긴장도 1 이상)
  if(tension.level>=1){
    html += '<div style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">☮️ 비전투 해결 경로</div>';
    html += '<div style="display:flex;flex-direction:column;gap:3px;margin-bottom:8px">';
    Object.entries(PEACE_ROUTES).forEach(([id,r])=>{
      html += '<button onclick="initiatePeaceRoute(\''+id+'\',\''+regionKey+'\')" style="padding:5px 8px;background:#0a0808;border:1px solid #3a2820;color:#a08060;font-size:8px;cursor:pointer;text-align:left">'
        +'<b>'+r.name+'</b> — '+r.req+'</button>';
    });
    html += '</div>';
  }

  // ── 4대 종교 상세 토글
  html += '<details style="margin-bottom:8px"><summary style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);cursor:pointer;user-select:none">📖 4대 종교 상세 정보</summary><div style="padding:8px 0">';
  Object.values(RELIGIONS).forEach(r=>{
    html += '<div style="padding:8px 10px;background:#090600;border:1px solid '+r.color+'22;border-left:2px solid '+r.color+';margin-bottom:6px">'
      +'<div style="font-family:\'Cinzel\',serif;font-size:10px;color:'+r.color+';margin-bottom:3px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:14}):(r?.icon))+' '+r.name+'</div>'
      +'<div style="font-size:9px;color:var(--dim);margin-bottom:3px;font-style:italic">"'+r.doctrine+'"</div>'
      +'<div style="font-size:8px;color:#5a4a3a">교화: '+r.evangelMethods.join(' · ')+'</div>'
      +(playerRel===r.id?'<button onclick="setPlayerReligion(null)" style="margin-top:4px;padding:2px 8px;background:#1a0a0a;border:1px solid #3a1a1a;color:#a05050;font-size:8px;cursor:pointer">이탈</button>':'<button onclick="setPlayerReligion(\''+r.id+'\')" style="margin-top:4px;padding:2px 8px;background:#0a0a0a;border:1px solid '+r.color+'33;color:'+r.color+';font-size:8px;cursor:pointer">귀의</button>')
      +'</div>';
  });
  html += '</div></details>';

  body.innerHTML = html;
}
window.renderReligionPanel = renderReligionPanel;

window.renderReligionPanel = window.renderReligionPanel;

function supportReligionWar(religionId){
  const st  = loadReligionState();
  if(!st.war) return;
  const rel = RELIGIONS[religionId];
  S._nextInjectedContext=(S._nextInjectedContext||'')
    +'\n[⚔️ 종교전쟁 지원] 플레이어가 '+(rel?rel.name:religionId)+'을(를) 지원했다. '
    +'이 종교의 승리를 위해 활동하는 장면을 서사화하고, '
    +'GS: "religion_share_delta":{"region":"'+st.war.region+'","'+religionId+'":+10} 출력.';
  toast((rel?rel.icon:'')+' '+(rel?rel.name:religionId)+' 지원!',2500);
}
window.supportReligionWar = supportReligionWar;

window.supportReligionWar = supportReligionWar;
}

