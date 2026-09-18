// 방랑자 전용: 혼돈↔질서 슬라이더 & 개연성(P) 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { WDR_AXIS_TIERS, WDR_CHAOS_PATTERNS, WDR_CHAOS_SKILLS, WDR_HERO_TEMPLATES, WDR_NAME_POOL, WDR_ORDER_PATTERNS, WDR_ORDER_SKILLS, WDR_PERSONALITY_HERO, WDR_PERSONALITY_VILLAIN, WDR_PLAUS_TRIGGERS, WDR_RACE_POOL, WDR_RANK_POOL_HERO, WDR_RANK_POOL_VILLAIN, WDR_VILLAIN_TEMPLATES } from '../data/230-방랑자-전용-혼돈질서-슬라이더-개연성P-시스템.js';
import { closeP, showStatRisePopup } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';
import { loadWorldTimer } from './251-통합-처리-함수-매-AI-응답-후-호출.js';

export const WDR_AXIS_KEY  = 'tf-wdr-axis';

export const WDR_PLAUS_KEY = 'tf-wdr-plaus';

export const loadWdrAxis  = () => { try{ return parseFloat(lsGet(WDR_AXIS_KEY) ||'0'); }catch(e){ return 0; } };

export const saveWdrAxis  = (v) => lsSet(WDR_AXIS_KEY, String(Math.round(v)));

export const loadWdrPlaus = () => { try{ return parseInt(lsGet(WDR_PLAUS_KEY) ||'0'); }catch(e){ return 0; } };

export const saveWdrPlaus = (v) => lsSet(WDR_PLAUS_KEY, String(Math.max(0, Math.min(999, v))));

export function getWdrAxisTier(v){
  return WDR_AXIS_TIERS.find(t=>v>=t.min && v<=t.max) || WDR_AXIS_TIERS[6];
}
window.getWdrAxisTier = getWdrAxisTier;

export function _isWanderer(){
  const jobId = S?.character?.jobId || S?.character?.role || '';
  return jobId === 'wanderer' || jobId === '방랑자'
      || (typeof S?.character?.role === 'string' && S.character.role.includes('방랑자'));
}
window._isWanderer = _isWanderer;

window._isWanderer = _isWanderer;

export function processWandererAxis(aiText, userMsg){
  if(!_isWanderer()) return;
  if(!aiText) return;

  const lc = aiText.toLowerCase();
  let axisDelta = 0;
  let plausGain = 0;
  let gainLabel = '';

  // 혼돈 감지
  const chaosHit = WDR_CHAOS_PATTERNS.filter(p=>p.test(lc)).length;
  if(chaosHit > 0) axisDelta -= Math.min(chaosHit * 4, 12);

  // 질서 감지
  const orderHit = WDR_ORDER_PATTERNS.filter(p=>p.test(lc)).length;
  if(orderHit > 0) axisDelta += Math.min(orderHit * 4, 12);

  // 자연 회귀: 극단값은 중립 방향으로 아주 조금씩 당겨짐
  const cur = loadWdrAxis();
  if(Math.abs(cur) > 10) axisDelta += cur > 0 ? -0.5 : 0.5;

  // 개연성 획득 감지
  for(const t of WDR_PLAUS_TRIGGERS){
    if(t.pattern.test(lc)){
      plausGain += t.gain;
      gainLabel = t.label;
      break; // 한 턴에 하나만
    }
  }

  // 적용
  if(axisDelta !== 0){
    const newAxis = cur + axisDelta;
    saveWdrAxis(newAxis);
    const tier = getWdrAxisTier(newAxis);
    if(Math.abs(axisDelta) >= 4){
      const dir = axisDelta < 0 ? '혼돈' : '질서';
      (typeof showStatRisePopup==='function') && showStatRisePopup(`${tier.icon} ${dir} ${Math.abs(Math.round(axisDelta))}`, tier.color);
    }
  }

  if(plausGain > 0){
    const newPlaus = loadWdrPlaus() + plausGain;
    saveWdrPlaus(newPlaus);
    showStatRisePopup(`✨ 개연성 +${plausGain}`, '#d0c040');
    if(gainLabel) toast(`📖 개연성 +${plausGain} [${gainLabel}]`, 2000);
  }

  renderWandererAxisBar();
}
window.processWandererAxis = processWandererAxis;

export function canUseWdrSkill(skill){
  const axis = loadWdrAxis();
  const plaus = loadWdrPlaus();
  if(skill.cost.plaus > 0 && plaus < skill.cost.plaus) return false;
  if(skill.req < 0 && axis > skill.req) return false; // 혼돈 스킬
  if(skill.req > 0 && axis < skill.req) return false; // 질서 스킬
  return true;
}
window.canUseWdrSkill = canUseWdrSkill;

export function renderWandererAxisBar(){
  if(!_isWanderer()){
    document.getElementById('wdr-axis-bar')?.remove();
    return;
  }
  const axis  = loadWdrAxis();
  const plaus = loadWdrPlaus();
  const tier  = getWdrAxisTier(axis);

  // 헤더에 이미 있으면 업데이트, 없으면 생성
  let bar = document.getElementById('wdr-axis-bar');
  if(!bar){
    bar = document.createElement('div');
    bar.id = 'wdr-axis-bar';
    bar.style.cssText = `
      flex-shrink:0;
      padding:3px 10px;background:var(--hdr-bg);
      border-top:1px solid var(--border);
      display:flex;align-items:center;gap:8px;
      font-family:'Cinzel',serif;cursor:pointer;
      z-index:10;
    `;
    bar.title = '탭하면 방랑자 시스템 패널 열기';
    bar.onclick = ()=>{ window.openP('wanderer-axis'); renderWandererAxisPanel(); };
    // input-zone 위에 삽입
    const inputZone = document.querySelector('.input-zone');
    if(inputZone && inputZone.parentNode){
      inputZone.parentNode.insertBefore(bar, inputZone);
    } else {
      document.body.appendChild(bar);
    }
  }

  // 슬라이더 퍼센트 계산 (−100→0%, +100→100%)
  const pct = Math.max(0, Math.min(100, (axis + 100) / 200 * 100)).toFixed(1);
  const thumbColor = tier.color;

  bar.innerHTML = `
    <span style="font-size:10px;color:${thumbColor};white-space:nowrap;min-width:56px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tier,{size:10}):(tier.icon)} ${tier.label}</span>
    <div style="flex:1;height:5px;background:var(--bg-input);border-radius:3px;position:relative;border:1px solid var(--border)">
      <div style="position:absolute;left:50%;top:-1px;width:1px;height:7px;background:var(--border)"></div>
      <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#c03030,#8a8a30,#3060a0);border-radius:3px"></div>
      <div style="position:absolute;top:-3px;left:calc(${pct}% - 5px);width:10px;height:10px;background:${thumbColor};border-radius:50%;border:1px solid var(--bg-body);box-shadow:0 0 5px ${thumbColor}"></div>
    </div>
    <span style="font-size:9px;color:#d0c040;white-space:nowrap;min-width:52px">✨${plaus}<span style="color:var(--dim)">/999</span></span>
  `;
}
window.renderWandererAxisBar = renderWandererAxisBar;

export function renderDoomClockBadge(){
  try{
    const wt = (typeof loadWorldTimer==='function') ? loadWorldTimer() : null;
    if(!wt || wt.doomClock < 20) {
      document.getElementById('h-doom-clock')?.remove();
      return;
    }
    const doom = wt.doomClock;
    const color = doom>=80?'#e03030':doom>=60?'#e07030':doom>=40?'#c0a030':'#8a8a5a';
    let badge = document.getElementById('h-doom-clock');
    if(!badge){
      badge = document.createElement('span');
      badge.id='h-doom-clock'; badge.className='hst';
      badge.style.cssText='cursor:pointer;font-size:9px';
      badge.title='둠 클락 — 세계 위기 진행도';
      // [버그 수정] openP('world-state')를 호출하고 있었지만 그런 패널
      // (p-world-state/pb-world-state)이 코드베이스 어디에도 만들어진
      // 적이 없어, 배지를 눌러도 아무 반응이 없던 죽은 링크였다. 별도
      // 패널을 새로 만들기보다, 이미 있는 정보를 토스트로 바로 보여준다.
      badge.onclick=()=>{
        try{
          const w = (typeof loadWorldTimer==='function') ? loadWorldTimer() : null;
          if(w && typeof toast==='function') toast(`🌍 세계 위기 — 둠 클락 ${w.doomClock||0}% · 전쟁 진행 ${w.warProgress||0}% · 봉인 붕괴 ${w.sealDecay||0}%`, 4000);
        }catch(e){}
      };
      const hs = document.querySelector('.hdr-stats');
      if(hs) hs.appendChild(badge);
    }
    const icon = doom>=80?'💀':doom>=60?'⚠️':doom>=40?'🌑':'🌍';
    badge.innerHTML=`${icon}<span style="font-size:8px;color:${color}">${doom}%</span>`;
  }catch(e){}
}
window.renderDoomClockBadge = renderDoomClockBadge;

window.renderDoomClockBadge = renderDoomClockBadge;

export function renderWandererAxisPanel(){
  const body = document.getElementById('pb-wanderer-axis');
  if(!body) return;

  const axis  = loadWdrAxis();
  const plaus = loadWdrPlaus();
  const tier  = getWdrAxisTier(axis);

  // 해금된 혼돈 스킬
  const unlockedChaos = WDR_CHAOS_SKILLS.filter(s => axis <= s.req);
  // 해금된 질서 스킬
  const unlockedOrder = WDR_ORDER_SKILLS.filter(s => axis >= s.req);
  // 잠긴 스킬 힌트 (다음 단계)
  const nextChaos = WDR_CHAOS_SKILLS.find(s => axis > s.req);
  const nextOrder = WDR_ORDER_SKILLS.find(s => axis < s.req);

  const skillCard = (s, side) => {
    const usable = canUseWdrSkill(s);
    const gc = side === 'chaos' ? '#d05020' : '#4a80c0';
    return `<div style="padding:9px 11px;background:${gc}10;border:1px solid ${gc}44;border-left:2px solid ${gc}${usable?'cc':'44'};margin-bottom:5px;opacity:${usable?1:.55}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:16}):(s.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:${gc}">${s.name}</div>
          <div style="font-size:8px;color:var(--dim)">${s.type==='passive'?'패시브':'액티브'} ${s.cost.plaus>0?`· ✨${s.cost.plaus} 개연성 소모`:''}</div>
        </div>
        ${usable && s.type==='active' ? `<button onclick="useWdrSkill('${s.id}')" style="padding:4px 10px;background:${gc}22;border:1px solid ${gc}88;color:${gc};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">발동</button>` : ''}
      </div>
      <div style="font-size:10px;color:var(--text);line-height:1.5">${s.desc}</div>
    </div>`;
  };

  const lockedHint = (s, side) => {
    if(!s) return '';
    const gc = side === 'chaos' ? '#d05020' : '#4a80c0';
    const needed = side === 'chaos' ? `혼돈 ${Math.abs(s.req)} 이상` : `질서 ${s.req} 이상`;
    return `<div style="padding:7px 10px;background:var(--bg-input);border:1px dashed ${gc}33;margin-bottom:4px;opacity:.5">
      <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):(s.icon)}</span>
      <span style="font-family:'Cinzel',serif;font-size:9px;color:${gc};margin-left:6px">${s.name}</span>
      <span style="font-size:8px;color:var(--dim);margin-left:6px">— ${needed} 필요</span>
    </div>`;
  };

  body.innerHTML = `
    <!-- 슬라이더 현황 -->
    <div style="padding:12px 14px;background:var(--bg-bubble-ai);border:1px solid var(--border);margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:9px;color:#c03030;font-family:'Cinzel',serif">← 혼돈</span>
        <span style="font-family:'Cinzel',serif;font-size:11px;color:${tier.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tier,{size:11}):(tier.icon)} ${tier.label}</span>
        <span style="font-size:9px;color:#4a80c0;font-family:'Cinzel',serif">질서 →</span>
      </div>
      <div style="height:8px;background:var(--bg-input);border-radius:4px;position:relative;border:1px solid var(--border);margin-bottom:6px">
        <div style="position:absolute;left:50%;top:-2px;width:1px;height:12px;background:var(--border)"></div>
        <div style="width:${((axis+100)/200*100).toFixed(1)}%;height:100%;background:linear-gradient(90deg,#c03030,#8a8a30,#3060a0);border-radius:4px"></div>
        <div style="position:absolute;top:-5px;left:calc(${((axis+100)/200*100).toFixed(1)}% - 7px);width:14px;height:14px;background:${tier.color};border-radius:50%;border:2px solid var(--bg-body);box-shadow:0 0 8px ${tier.color}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--dim)">
        <span>-100</span><span style="color:${tier.color}">${axis > 0 ? '+' : ''}${axis.toFixed(0)}</span><span>+100</span>
      </div>
      <div style="margin-top:5px;font-size:10px;color:var(--dim);font-style:italic">${tier.desc}</div>
    </div>

    <!-- 개연성 -->
    <div style="padding:10px 14px;background:var(--bg-bubble-ai);border:1px solid var(--border);margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-family:'Cinzel',serif;font-size:10px;color:#d0c040">✨ 개연성 (Plausibility)</span>
        <span style="font-family:'Cinzel',serif;font-size:13px;color:#e0d050">${plaus} <span style="font-size:9px;color:var(--dim)">/ 999</span></span>
      </div>
      <div style="height:5px;background:var(--bg-input);border-radius:3px;margin-bottom:5px">
        <div style="width:${(plaus/999*100).toFixed(1)}%;height:100%;background:linear-gradient(90deg,#a09020,#e0d050);border-radius:3px"></div>
      </div>
      <div style="font-size:9px;color:var(--dim);line-height:1.5">세계에 영향을 미치는 행동을 할 때마다 획득. 강력한 스킬 발동에 소모됩니다.</div>
    </div>

    <!-- 혼돈 스킬 -->
    <div style="font-family:'Cinzel',serif;font-size:9px;color:#c03030;letter-spacing:1.5px;margin-bottom:6px">🌑 혼돈 스킬</div>
    ${unlockedChaos.length ? unlockedChaos.map(s=>skillCard(s,'chaos')).join('') : '<div style="font-size:9px;color:var(--dim);padding:6px;margin-bottom:4px">혼돈 수치가 낮아질수록 해금됩니다</div>'}
    ${lockedHint(nextChaos, 'chaos')}

    <!-- 질서 스킬 -->
    <div style="font-family:'Cinzel',serif;font-size:9px;color:#4a80c0;letter-spacing:1.5px;margin:10px 0 6px">👑 질서 스킬</div>
    ${unlockedOrder.length ? unlockedOrder.map(s=>skillCard(s,'order')).join('') : '<div style="font-size:9px;color:var(--dim);padding:6px;margin-bottom:4px">질서 수치가 높아질수록 해금됩니다</div>'}
    ${lockedHint(nextOrder, 'order')}
  `;
}
window.renderWandererAxisPanel = renderWandererAxisPanel;

(function injectWandererAxisPanel(){
  if(document.getElementById('p-wanderer-axis')) return;
  const div = document.createElement('div');
  div.className = 'panel-ov'; div.id = 'p-wanderer-axis';
  div.innerHTML = `<div class="panel">
    <div class="p-hdr">
      <span class="p-title">🌀 혼돈↔질서 & 개연성</span>
      <button class="p-close" onclick="closeP('wanderer-axis')">✕</button>
    </div>
    <div class="p-body scrollable" id="pb-wanderer-axis"></div>
  </div>`;
  document.body.appendChild(div);
})();

window.renderWandererAxisPanel = renderWandererAxisPanel;

window.renderWandererAxisBar   = renderWandererAxisBar;

export const WDR_NPC_KEY = 'tf-wdr-npcs';

export function generateWdrNPCs(){
  const key = WDR_NPC_KEY;
  const existing = (() => { try{ return JSON.parse(lsGet(key)||'null'); }catch(e){ return null; } })();
  if(existing) return existing; // 이미 생성됨

  // 시드 생성 (세션 시작 시간 기반)
  const seed = Date.now() % 9999;
  const rng = (function(s){
    let v = s;
    return function(){ v = (v * 1103515245 + 12345) & 0x7fffffff; return v / 0x7fffffff; };
  })(seed);

  // 이름 풀 셔플
  const names = [...WDR_NAME_POOL];
  for(let i = names.length-1; i > 0; i--){
    const j = Math.floor(rng() * (i+1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  let nameIdx = 0;
  const nextName = () => names[nameIdx++ % names.length];

  const pickArr = (arr) => arr[Math.floor(rng() * arr.length)];

  // 악역 20명 생성
  const villains = WDR_VILLAIN_TEMPLATES.map(tmpl => {
    const race = pickArr(WDR_RACE_POOL);
    const rank = pickArr(WDR_RANK_POOL_VILLAIN);
    const personality = pickArr(WDR_PERSONALITY_VILLAIN);
    const name = nextName();
    return {
      ...tmpl,
      name,
      race: race.name,
      raceIcon: race.icon,
      raceDesc: race.desc,
      rankName: rank.name,
      rankIcon: rank.icon,
      rankDesc: rank.desc,
      personality,
      side: 'villain',
      alive: true,
      discovered: false,
      relation: 0, // -100~+100
    };
  });

  // 선역 20명 생성
  const heroes = WDR_HERO_TEMPLATES.map(tmpl => {
    const race = pickArr(WDR_RACE_POOL);
    const rank = pickArr(WDR_RANK_POOL_HERO);
    const personality = pickArr(WDR_PERSONALITY_HERO);
    const name = nextName();
    return {
      ...tmpl,
      name,
      race: race.name,
      raceIcon: race.icon,
      raceDesc: race.desc,
      rankName: rank.name,
      rankIcon: rank.icon,
      rankDesc: rank.desc,
      personality,
      side: 'hero',
      alive: true,
      discovered: false,
      relation: 0,
    };
  });

  const result = { villains, heroes, seed, generatedAt: new Date().toISOString() };
  lsSet(key, JSON.stringify(result));
  return result;
}
window.generateWdrNPCs = generateWdrNPCs;

export function loadWdrNPCs(){ 
  try{ return JSON.parse(lsGet(WDR_NPC_KEY)||'null') || generateWdrNPCs(); }
  catch(e){ return generateWdrNPCs(); }
}
window.loadWdrNPCs = loadWdrNPCs;

export function getWdrNPCContext(){
  if(!_isWanderer()) return '';
  const d = loadWdrNPCs();
  const discovered = [...d.villains, ...d.heroes].filter(n => n.discovered);
  if(!discovered.length) return '';
  const lines = discovered.map(n =>
    `[${n.side==='villain'?'적대':'우호'} NPC] ${n.icon}${n.name}(${n.raceIcon}${n.race}·${n.rankName}): ${n.personality}. 동기: ${n.motivation}. 능력: ${n.ability}`
  );
  return '\n[방랑자 NPC 목록]\n' + lines.join('\n');
}
window.getWdrNPCContext = getWdrNPCContext;

export function renderWdrNPCPanel(){
  const body = document.getElementById('pb-wdr-npcs');
  if(!body) return;
  const data = loadWdrNPCs();
  const axis = loadWdrAxis();
  const all = [...data.villains, ...data.heroes];

  const card = (npc) => {
    const gc = npc.side === 'villain' ? '#c03030' : '#3a9a4a';
    const rel = npc.relation || 0;
    const relBar = `<div style="height:3px;background:#1a1005;border-radius:2px;margin-top:4px">
      <div style="width:${Math.max(0,Math.min(100,(rel+100)/2))}%;height:100%;background:${rel>=0?'#3a8a3a':'#8a3a3a'};border-radius:2px"></div>
    </div>`;
    return `<div style="padding:9px 11px;background:${gc}08;border:1px solid ${gc}33;border-left:2px solid ${gc}${npc.discovered?'aa':'22'};margin-bottom:4px;opacity:${npc.discovered?1:.45}">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
        <span style="font-size:14px">${npc.discovered ? (typeof getEntityIconHTML==='function'?getEntityIconHTML(npc,{size:14}):npc.icon) : '❓'}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:${gc}">${npc.discovered ? npc.name : '???'}</div>
          <div style="font-size:8px;color:var(--dim)">${npc.discovered ? npc.raceIcon+npc.race+' · '+npc.rankName : '미발견'}</div>
        </div>
        <span style="font-size:8px;color:${gc};padding:1px 6px;border:1px solid ${gc}44;border-radius:2px">${npc.side==='villain'?'적':'우호'}</span>
      </div>
      ${npc.discovered ? `
        <div style="font-size:9px;color:var(--dim);line-height:1.5;margin-top:3px">${npc.personality}</div>
        <div style="font-size:9px;color:var(--text);margin-top:2px">🎯 ${npc.motivation}</div>
        <div style="font-size:9px;color:#5a7a5a;margin-top:1px">⚡ ${npc.ability}</div>
        <div style="font-size:9px;color:#7a5a3a;margin-top:2px;font-style:italic">💬 ${npc.hook}</div>
        ${relBar}
        <div style="font-size:8px;color:var(--dim);text-align:right;margin-top:1px">관계도 ${rel>=0?'+':''}${rel}</div>
      ` : `<div style="font-size:9px;color:var(--dim);margin-top:3px">스토리에서 만나면 자동으로 발견됩니다</div>`}
    </div>`;
  };

  body.innerHTML = `
    <div style="font-size:9px;color:var(--dim);padding:6px 0 10px;line-height:1.6">
      매 게임마다 랜덤 조합으로 생성된 NPC들입니다.<br>스토리에 등장하면 자동 발견됩니다.
    </div>
    <div style="font-family:'Cinzel',serif;font-size:9px;color:#c03030;letter-spacing:1.5px;margin-bottom:6px">🌑 악역 NPC (${data.villains.filter(n=>n.discovered).length}/${data.villains.length} 발견)</div>
    ${data.villains.map(card).join('')}
    <div style="font-family:'Cinzel',serif;font-size:9px;color:#3a9a4a;letter-spacing:1.5px;margin:12px 0 6px">✨ 선역 NPC (${data.heroes.filter(n=>n.discovered).length}/${data.heroes.length} 발견)</div>
    ${data.heroes.map(card).join('')}
    <div style="margin-top:10px;padding:8px;background:#0a0800;border:1px dashed #2a1a05;font-size:9px;color:var(--dim);text-align:center">
      <button onclick="if(confirm('NPC를 다시 생성할까요?')){lsDel('${WDR_NPC_KEY}');renderWdrNPCPanel();toast('NPC 재생성 완료',2000)}" 
        style="background:none;border:1px solid #3a2a0a;color:#5a4a2a;font-size:8px;padding:3px 10px;cursor:pointer;font-family:Cinzel,serif">
        🔄 NPC 재생성
      </button>
    </div>
  `;
}
window.renderWdrNPCPanel = renderWdrNPCPanel;

(function injectWdrNPCPanel(){
  if(document.getElementById('p-wdr-npcs')) return;
  const div = document.createElement('div');
  div.className = 'panel-ov'; div.id = 'p-wdr-npcs';
  div.innerHTML = `<div class="panel">
    <div class="p-hdr">
      <span class="p-title">👥 방랑자 NPC 명부</span>
      <button class="p-close" onclick="closeP('wdr-npcs')">✕</button>
    </div>
    <div class="p-body scrollable" id="pb-wdr-npcs"></div>
  </div>`;
  document.body.appendChild(div);
})();

export function detectWdrNPCFromText(text){
  if(!_isWanderer() || !text) return;
  const data = loadWdrNPCs();
  let changed = false;
  [...data.villains, ...data.heroes].forEach(npc => {
    if(!npc.discovered && text.includes(npc.name)){
      npc.discovered = true;
      changed = true;
      setTimeout(()=>toast(`[${npc.side==='villain'?'적':'우호'}] ${npc.name} 발견!`, 3000, npc), 500);
    }
  });
  if(changed) lsSet(WDR_NPC_KEY, JSON.stringify(data));
}
window.detectWdrNPCFromText = detectWdrNPCFromText;

setTimeout(function(){
  try{
    const btmBar = document.querySelector('.btm-bar');
    if(btmBar && typeof _isWanderer==='function' && _isWanderer()){
      if(!document.getElementById('btn-wdr-npcs')){
        const bn = document.createElement('button');
        bn.id='btn-wdr-npcs'; bn.className='bb';
        bn.style.cssText='color:#5a9a6a;border-color:#1a4a2a';
        bn.textContent='👥NPC'; bn.title='방랑자 NPC 명부';
        bn.onclick=function(){ window.openP('wdr-npcs'); renderWdrNPCPanel(); };
        btmBar.appendChild(bn);
      }
    }
  }catch(e){}
}, 5500);

if(typeof _isWanderer==='function' && _isWanderer()){
  try{ generateWdrNPCs(); }catch(e){}
}

window.loadWdrNPCs        = loadWdrNPCs;

window.generateWdrNPCs    = generateWdrNPCs;

window.renderWdrNPCPanel  = renderWdrNPCPanel;

window.detectWdrNPCFromText = detectWdrNPCFromText;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_205(){
function useWdrSkill(skillId){
  if(!_isWanderer()){ toast('방랑자 전용 스킬입니다', 1500); return; }
  const all = [...WDR_CHAOS_SKILLS, ...WDR_ORDER_SKILLS];
  const skill = all.find(s=>s.id===skillId);
  if(!skill){ toast('알 수 없는 스킬', 1500); return; }

  if(!canUseWdrSkill(skill)){
    const axis = loadWdrAxis();
    const plaus = loadWdrPlaus();
    if(skill.cost.plaus > 0 && plaus < skill.cost.plaus)
      toast(`⚠️ 개연성 부족 (필요: ${skill.cost.plaus} / 보유: ${plaus})`, 2500);
    else
      toast(`⚠️ 혼돈↔질서 수치 부족`, 2000);
    return;
  }

  // 개연성 소모
  if(skill.cost.plaus > 0){
    saveWdrPlaus(loadWdrPlaus() - skill.cost.plaus);
    toast(`📖 개연성 -${skill.cost.plaus} 소모`, 1800);
  }

  // 다음 AI 턴에 스킬 힌트 주입
  S._nextInjectedContext = (S._nextInjectedContext||'') +
    `\n[방랑자 스킬 발동] ${skill.icon} ${skill.name}: ${skill.aiHint}`;

  toast(`${skill.name} 발동!`, 2500, skill);
  renderWandererAxisBar();
  closeP('wanderer-axis');
}
window.useWdrSkill = useWdrSkill;

const _origUpdateHeaderDoom = window.updateHeader;

if(typeof _origUpdateHeaderDoom === 'function'){
  window.updateHeader = function(){
    _origUpdateHeaderDoom.apply(this, arguments);
    try{ renderDoomClockBadge(); }catch(e){}
  };
}

// [B-fix] 같은 파일 위쪽의 _origUpdateHeaderDoom과 동일한 버그 —
// 여기 있던 _origUpdateHeader는 이 배포 함수 밖(모듈 최상위, Pass 1)에서
// 캡처되고 있었다. 그 시점엔 window.updateHeader의 진짜 구현(quest/086의
// __tfDeferred_67)이 아직 실행 전이라 항상 undefined를 캡처했고, 위
// 블록이 window.updateHeader를 새로 덮어써도(그 자체는 정상 동작) 이
// 아래 블록이 그 결과를 다시 덮어쓰면서 매번 존재하지도 않는 undefined를
// .apply()하려 해 헤더가 갱신되는 모든 곳(골드 변화·퀘스트 완료·스탯
// 변화 등 사실상 거의 매 행동)에서 예외가 터졌다. 바로 위 블록처럼 이
// 시점에 새로 캡처하면 방금 그 블록이 만든(둠 클록 배지 포함) 최신
// window.updateHeader를 정확히 잡는다.
const _origUpdateHeaderWdr = window.updateHeader;
window.updateHeader = function(){
  if(typeof _origUpdateHeaderWdr === 'function') _origUpdateHeaderWdr.apply(this, arguments);
  try{ renderWandererAxisBar(); }catch(e){}
};

window._wandererAxisHook = processWandererAxis;

window.useWdrSkill             = useWdrSkill;

// [버그 수정] _origCallAI가 이 배포 함수 밖(모듈 최상위, Pass 1)에서
// 캡처되고 있었다 — 바로 위 _origUpdateHeaderDoom/_origUpdateHeaderWdr과
// 완전히 같은 버그 패턴. 그 시점엔 window.callAI의 진짜 구현
// (quest/086의 __tfDeferred_67)이 아직 실행 전이라 항상 undefined를
// 캡처했고, 그 결과 이 래퍼가 실행될 때마다
// "Cannot read properties of undefined (reading 'call')"로 매 턴 서사
// 생성(callAI) 자체가 전부 크래시했다 — 이 배포 함수 안에서 새로
// 캡처하면 이 시점엔 이미 진짜 callAI가 설정되어 있어 정상 동작한다.
const _origCallAI = window.callAI;

window.callAI = async function(history, injectedContext='', retryCount=0){
  let ctx = injectedContext;
  if(retryCount === 0){
    const npcCtx = getWdrNPCContext();
    if(npcCtx) ctx = ctx + npcCtx;
  }
  return _origCallAI.call(this, history, ctx, retryCount);
};

const _prevAxisHook = window._wandererAxisHook;

window._wandererAxisHook = function(cleanText, userMsg){
  if(_prevAxisHook) _prevAxisHook(cleanText, userMsg);
  try{ detectWdrNPCFromText(cleanText); }catch(e){}
};
}

