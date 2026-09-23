// 🐾 수인족 패널 렌더
// Auto-extracted from taleforge.html (original section banner preserved above).
import { renderDungeonUI } from '../combat/256-회차가-높을수록-보스가-더-빨리-더-강하게-스폰됨.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { BEAST_ACTION_TYPES } from '../data/259-수인족-야생의-법칙-Law-of-the-Wild-시스템.js';
import { ALL_BUILDINGS_MAP, BEAST_INSTINCT_GAIN, BEAST_LINEAGES, BEAST_SUPPRESS_METHODS, DEMESNE_ACHIEVEMENTS, DEMESNE_POLICIES, DEMESNE_SEASONS, DEMESNE_TITLES, DEMESNE_TRADE_PARTNERS, DEMESNE_UNLOCK_CONDITIONS, FG_STAGES, LONE_WOLF_PENALTY, PACK_RULES, STAGE_BUILDINGS, VASSAL_ROLES } from '../data/260-수인족-패널-렌더.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { saveSkills } from '../job/002-스킬-시스템.js';
import { _markDirty, saveStatsSplit } from '../misc/001-block0-preamble.js';
import { getCurrentFactions } from '../npc/067-③-NPC-관계망-시스템.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { _closeNpcQuestDlg, _nqdDecline, checkNPCLocationHint, checkNpcDlgQuestCompletion, openNpcQuestDialog, renderAILocationsPanel } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { esc, lsDel, lsGet, lsSet, toast } from '../utils.js';
import { addPackMember, addTerritory, applyBeastWildlawStats, clearBeastWildlaw, getBeastBloodStage, getBeastHunterCodeStage, getBeastPackRankStage, getBeastWildlawStatus, increaseMemberBond, isBeastRace, loadBeastWildlaw, removePackMember, saveBeastWildlaw, triggerBeastAction } from './259-수인족-야생의-법칙-Law-of-the-Wild-시스템.js';

export function renderBeastWildlawPanel() {
  const body = document.getElementById('pb-beast-wildlaw');
  if (!body) return;

  if (!isBeastRace()) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">🐾</div>
      <div>수인 캐릭터에게만 활성화됩니다.</div>
      <div style="margin-top:6px;font-size:10px">캐릭터 설정에서 종족을 수인으로 선택하세요.</div>
    </div>`;
    return;
  }

  const data = loadBeastWildlaw();
  const packStg  = getBeastPackRankStage(data.packRank||30);
  const bloodStg = getBeastBloodStage(data.beastBlood||50);
  const codeStg  = getBeastHunterCodeStage(data.hunterCode||50);

  // 현재 탭 관리
  if (!window._beastTab) window._beastTab = 'main';
  const tab = window._beastTab;

  const tabBtn = (id, lbl) => `<button onclick="window._beastTab='${id}';renderBeastWildlawPanel()" class="sk-tab${tab===id?' act':''}" style="font-size:9px">${lbl}</button>`;

  // ── 메인 탭 ──
  let mainHtml = '';
  if (tab === 'main') {
    // 홀로 된 자 경고
    if (data.isLoneWolf) {
      mainHtml += `<div style="background:#1a0505;border:1px solid #602020;padding:10px;margin-bottom:10px;text-align:center;border-radius:2px">
        <div style="color:#e04040;font-size:11px;font-family:'Cinzel',serif;letter-spacing:1px">🐺 홀로 된 자</div>
        <div style="color:#904040;font-size:10px;margin-top:4px">무리를 배신한 자. 어느 무리에도 속하지 못한다.</div>
        <button onclick="if(confirm('홀로 된 자 상태를 초기화하시겠습니까? (신규 스토리 진행 후)')){const d=loadBeastWildlaw();d.isLoneWolf=false;d.packRank=15;d.tabooViolations=0;saveBeastWildlaw(d);applyBeastWildlawStats();renderBeastWildlawPanel();}" style="margin-top:6px;padding:3px 10px;background:#1a0808;border:1px solid #602020;color:#a04040;font-size:9px;cursor:pointer;font-family:'Cinzel',serif">속죄의 길</button>
      </div>`;
    }

    // 세 수치 게이지
    const gauges = [
      { label:'무리 서열', icon:'🐾', val:data.packRank||30, stg:packStg, color:packStg.color },
      { label:'야수의 피', icon:'🩸', val:data.beastBlood||50, stg:bloodStg, color:bloodStg.color,
        extra: data.beastBlood>=80 ? '<span style="color:#e04020;font-size:9px">⚠️ 금기 위험</span>' : '' },
      { label:'사냥꾼의 윤리', icon:'⚖️', val:data.hunterCode||50, stg:codeStg, color:codeStg.color },
    ];
    mainHtml += `<div style="margin-bottom:10px">`;
    gauges.forEach(g => {
      mainHtml += `<div style="margin-bottom:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
          <span style="font-family:'Cinzel',serif;font-size:9px;color:${g.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(g,{size:9}):(g.icon)} ${g.label}</span>
          <span style="display:flex;align-items:center;gap:5px">
            ${g.extra||''}
            <span style="font-size:9px;color:${g.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(g.stg,{size:9}):(g.stg.icon)} ${g.stg.name}</span>
            <span style="font-family:'Cinzel',serif;font-size:9px;color:${g.color}">${g.val}/100</span>
          </span>
        </div>
        <div style="height:5px;background:var(--bg-input);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${g.val}%;background:${g.color};border-radius:3px;transition:width .4s"></div>
        </div>
        <div style="font-size:9px;color:var(--dim);margin-top:2px">${g.stg.aura||g.stg.desc||''}</div>
      </div>`;
    });
    mainHtml += `</div>`;

    // 무리원 목록
    mainHtml += `<div style="margin-bottom:10px">
      <div class="sg-title">🫂 무리의 유대 (${(data.packMembers||[]).length}/5)</div>`;
    if ((data.packMembers||[]).length === 0) {
      mainHtml += `<div style="color:var(--dim);font-size:10px;padding:6px">아직 무리가 없다. 동료 NPC 이름을 입력해 유대를 맺어라.</div>`;
    } else {
      (data.packMembers||[]).forEach(m => {
        mainHtml += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;padding:5px 8px;background:var(--bg-input);border:1px solid var(--border)">
          <span style="font-size:11px">🐾</span>
          <span style="flex:1;font-size:10px;color:var(--gold)">${m.name}</span>
          <div style="width:60px;height:4px;background:var(--bg-screen);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${m.bond||0}%;background:#7ec850;border-radius:2px"></div>
          </div>
          <span style="font-size:9px;color:#7ec850;font-family:'Cinzel',serif;width:22px;text-align:right">${m.bond||0}</span>
          <button onclick="increaseMemberBond('${m.name}',10);closeP('beast-wildlaw');openP('beast-wildlaw')" style="padding:2px 5px;background:var(--bg-screen);border:1px solid var(--border);color:#7ec850;font-size:8px;cursor:pointer;font-family:'Cinzel',serif">+유대</button>
          <button onclick="if(confirm('${m.name}을 무리에서 제거하시겠습니까?'))removePackMember('${m.name}')" style="padding:2px 5px;background:var(--bg-screen);border:1px solid #3a1a1a;color:#904040;font-size:8px;cursor:pointer;font-family:'Cinzel',serif">이탈</button>
        </div>`;
      });
    }
    // 무리원 추가 입력
    mainHtml += `<div style="display:flex;gap:5px;margin-top:5px">
      <input id="beast-pack-name-inp" type="text" placeholder="NPC 이름 입력..." style="flex:1;padding:5px 8px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:'Crimson Text',serif;font-size:12px;outline:none" />
      <button onclick="const n=document.getElementById('beast-pack-name-inp').value.trim();if(n)addPackMember(n)" style="padding:5px 10px;background:var(--bg-screen);border:1px solid var(--gold);color:var(--gold);font-size:9px;cursor:pointer;font-family:'Cinzel',serif">추가</button>
    </div></div>`;

    // 영역 표식
    mainHtml += `<div style="margin-bottom:10px">
      <div class="sg-title">🗺️ 영역 표식 (${(data.territories||[]).length}개)</div>`;
    if ((data.territories||[]).length === 0) {
      mainHtml += `<div style="color:var(--dim);font-size:10px;padding:6px">영역이 없다. 장소명을 입력해 영역 표식을 남겨라.</div>`;
    } else {
      (data.territories||[]).forEach(t => {
        const stars = '★'.repeat(t.level||1) + '☆'.repeat(3-(t.level||1));
        mainHtml += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;padding:4px 8px;background:var(--bg-input);border:1px solid var(--border)">
          <span style="font-size:10px">🗺️</span>
          <span style="flex:1;font-size:10px;color:var(--gold)">${t.name}</span>
          <span style="color:#7ec850;font-size:10px">${stars}</span>
          <button onclick="const d=loadBeastWildlaw();const t=d.territories.find(x=>x.name==='${t.name}');if(t)t.level=Math.min(3,(t.level||1)+1);saveBeastWildlaw(d);renderBeastWildlawPanel()" style="padding:2px 5px;background:var(--bg-screen);border:1px solid #2a5010;color:#7ec850;font-size:8px;cursor:pointer">↑강화</button>
          <button onclick="const d=loadBeastWildlaw();d.territories=d.territories.filter(x=>x.name!=='${t.name}');saveBeastWildlaw(d);renderBeastWildlawPanel()" style="padding:2px 5px;background:var(--bg-screen);border:1px solid #3a1a1a;color:#904040;font-size:8px;cursor:pointer">삭제</button>
        </div>`;
      });
    }
    mainHtml += `<div style="display:flex;gap:5px;margin-top:5px">
      <input id="beast-terr-inp" type="text" placeholder="장소명 입력..." style="flex:1;padding:5px 8px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:'Crimson Text',serif;font-size:12px;outline:none" />
      <button onclick="const n=document.getElementById('beast-terr-inp').value.trim();if(n)addTerritory(n)" style="padding:5px 10px;background:var(--bg-screen);border:1px solid var(--gold);color:var(--gold);font-size:9px;cursor:pointer;font-family:'Cinzel',serif">표식</button>
    </div></div>`;
  }

  // ── 행동 탭 ──
  let actHtml = '';
  if (tab === 'actions') {
    const groups = [
      { label:'⬆️ 서열 상승', ids:['pack_protect','pack_hunt','pack_challenge'] },
      { label:'🩸 야수 조절', ids:['beast_frenzy','beast_reason'] },
      { label:'⚖️ 사냥 윤리', ids:['code_survival','code_protect'] },
      { label:'⚠️ 금기 행동', ids:['pack_flee','pack_betray','code_show','code_massacre'] },
    ];
    groups.forEach(g => {
      actHtml += `<div class="sg-title">${g.label}</div>`;
      g.ids.forEach(id => {
        const def = BEAST_ACTION_TYPES[id];
        const isTaboo = id==='pack_betray'||id==='code_show'||id==='code_massacre';
        const rStr = def.rankDelta !== 0 ? `<span style="color:${def.rankDelta>0?'#7ec850':'#e04040'};font-size:9px">서열${def.rankDelta>0?'+':''}${def.rankDelta}</span>` : '';
        const bStr = def.bloodDelta !== 0 ? `<span style="color:${def.bloodDelta>0?'#e07030':'#5090c0'};font-size:9px">야수${def.bloodDelta>0?'+':''}${def.bloodDelta}</span>` : '';
        const cStr = def.codeDelta !== 0 ? `<span style="color:${def.codeDelta>0?'#50a090':'#a03030'};font-size:9px">윤리${def.codeDelta>0?'+':''}${def.codeDelta}</span>` : '';
        actHtml += `<div style="padding:7px 9px;background:var(--bg-input);border:1px solid ${isTaboo?'#4a1a1a':'var(--border)'};margin-bottom:4px;cursor:pointer" onclick="triggerBeastAction('${id}');renderBeastWildlawPanel()">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def.icon)}</span>
            <span style="flex:1;font-family:'Cinzel',serif;font-size:10px;color:${isTaboo?'#c04040':'var(--gold)'}">${def.label}</span>
            <div style="display:flex;gap:4px">${rStr}${bStr}${cStr}</div>
          </div>
          <div style="font-size:10px;color:var(--dim);margin-top:3px;padding-left:20px">${def.desc}</div>
        </div>`;
      });
    });
  }

  // ── 스킬 탭 ──
  let skillHtml = '';
  if (tab === 'skills') {
    const allSkills = [
      ...(packStg.skills||[]).map(s => ({...s, _from:`서열 · ${packStg.name}`})),
      ...(bloodStg.skills||[]).map(s => ({...s, _from:`야수의 피 · ${bloodStg.name}`})),
      ...(codeStg.skills||[]).map(s => ({...s, _from:`사냥꾼의 윤리 · ${codeStg.name}`})),
    ];
    if (allSkills.length === 0) {
      skillHtml = `<div style="text-align:center;padding:20px;color:var(--dim);font-size:10px">현재 해금된 스킬이 없습니다.<br><span style="font-size:9px">서열·야수의 피·윤리 수치를 변화시켜 새 스킬을 해금하세요.</span></div>`;
    } else {
      allSkills.forEach(sk => {
        const rarityColors = { common:'#808080', uncommon:'#3a9a3a', rare:'#3a6fa5', epic:'#7a3aa5', legendary:'#c8a030' };
        const rc = rarityColors[sk.rarity||'common'];
        skillHtml += `<div class="sk-card unlocked" style="margin-bottom:5px">
          <div class="sk-top">
            <span class="sk-ico">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:16}):(sk.icon)}</span>
            <div>
              <span class="sk-nm" style="color:var(--gold)">${sk.name}</span>
              <span class="sk-rar" style="color:${rc};background:${rc}22;margin-left:4px">${sk.rarity||''}</span>
            </div>
            <span style="font-size:8px;color:var(--dim);margin-left:auto">${sk._from}</span>
          </div>
          <div class="sk-desc">${sk.desc}</div>
          <div style="font-size:9px;color:#7ec850;margin-top:2px">${sk.conditionDesc||''}</div>
        </div>`;
      });
    }
  }

  // ── 기록 탭 ──
  let histHtml = '';
  if (tab === 'history') {
    const hist = (data.history||[]).slice().reverse().slice(0,20);
    if (hist.length === 0) {
      histHtml = `<div style="text-align:center;padding:20px;color:var(--dim);font-size:10px">아직 기록이 없습니다.</div>`;
    } else {
      hist.forEach(h => {
        const rStr = h.rankDelta !== 0 ? ` <span style="color:${h.rankDelta>0?'#7ec850':'#e04040'}">서열${h.rankDelta>0?'+':''}${h.rankDelta}</span>` : '';
        const bStr = h.bloodDelta !== 0 ? ` <span style="color:${h.bloodDelta>0?'#e07030':'#5090c0'}">야수${h.bloodDelta>0?'+':''}${h.bloodDelta}</span>` : '';
        const cStr = h.codeDelta !== 0 ? ` <span style="color:${h.codeDelta>0?'#50a090':'#a03030'}">윤리${h.codeDelta>0?'+':''}${h.codeDelta}</span>` : '';
        histHtml += `<div style="padding:5px 8px;background:var(--bg-input);border:1px solid var(--border);margin-bottom:3px;font-size:10px">
          <div style="display:flex;align-items:center;gap:5px">
            <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon||"🐾")}</span>
            <span style="flex:1;color:var(--gold)">${h.label}</span>
            <span style="color:var(--dim);font-size:9px">${(h.at||'').slice(0,10)}</span>
          </div>
          <div style="font-size:9px;color:var(--dim);padding-left:17px;margin-top:1px">${rStr}${bStr}${cStr} → 서열${h.packRank||0} / 야수${h.beastBlood||0} / 윤리${h.hunterCode||0}</div>
        </div>`;
      });
    }
  }

  // ── 엔딩 경로 ──
  let endingHtml = '';
  if (tab === 'ending') {
    const endings = [
      { icon:'🌟', name:'무리의 왕', cond: data.packRank>=80 && (data.packMembers||[]).length>=3 && data.beastBlood<70, desc:'알파 서열 + 이성 + 3명 이상 유대', status: data.packRank>=80 && (data.packMembers||[]).length>=3 && data.beastBlood<70 },
      { icon:'🌑', name:'원초의 야수신', cond: data.packRank>=80 && data.beastBlood>=80 && (data.territories||[]).length>=3, desc:'알파 서열 + 야수 MAX + 영역 3개 이상', status: data.packRank>=80 && data.beastBlood>=80 && (data.territories||[]).length>=3 },
      { icon:'🏕️', name:'떠도는 사냥꾼', cond: data.isLoneWolf && data.hunterCode>=80, desc:'홀로 된 자 + 사냥꾼의 윤리 80+', status: data.isLoneWolf && data.hunterCode>=80 },
      { icon:'💀', name:'추방된 자', cond: data.isLoneWolf && data.tabooViolations>=3, desc:'배신 3회 + 홀로 된 자 상태', status: data.isLoneWolf && data.tabooViolations>=3 },
    ];
    endingHtml = `<div class="sg-title">엔딩 분기 경로</div>`;
    endings.forEach(e => {
      const active = e.status;
      endingHtml += `<div style="padding:9px 10px;background:${active?'#0a1e04':'var(--bg-input)'};border:1px solid ${active?'#3a7010':'var(--border)'};margin-bottom:5px;border-radius:2px">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(e,{size:16}):(e.icon)}</span>
          <span style="font-family:'Cinzel',serif;font-size:11px;color:${active?'#7ec850':'var(--gold)'}">${e.name}</span>
          ${active?`<span style="font-size:9px;color:#7ec850;margin-left:auto">✓ 달성 가능</span>`:''}
        </div>
        <div style="font-size:9px;color:var(--dim);margin-top:3px;padding-left:22px">${e.desc}</div>
      </div>`;
    });
    // 금기 위반 현황
    endingHtml += `<div class="sg-title" style="margin-top:8px">금기 위반 현황</div>
      <div style="padding:7px 9px;background:${data.tabooViolations>0?'#1a0505':'var(--bg-input)'};border:1px solid ${data.tabooViolations>0?'#602020':'var(--border)'};margin-bottom:4px">
        <div style="font-size:10px;color:${data.tabooViolations>0?'#e04040':'var(--dim)'}">⚠️ 총 ${data.tabooViolations||0}회 금기 위반</div>
        <div style="font-size:9px;color:var(--dim);margin-top:2px">금기: 강함을 증명하기 위한 사냥 / 무리 배신 / 무고한 자 학살</div>
      </div>`;
  }

  body.innerHTML = `
    <div style="padding:8px 0 4px">
      <div style="display:flex;align-items:center;gap:8px;padding:0 11px 8px;border-bottom:1px solid var(--border)">
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:#7ec850">${typeof getEntityIconHTML==='function'?getEntityIconHTML(packStg,{size:13}):(packStg.icon)} ${packStg.name}</div>
          <div style="font-size:9px;color:var(--dim);margin-top:2px">${packStg.aura||''}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:9px;color:#7ec850;font-family:'Cinzel',serif">야수의 법칙</div>
          <div style="font-size:9px;color:var(--dim)">${data.tabooViolations>0?`⚠️ 금기 ${data.tabooViolations}회`:'금기 없음'} ${data.isLoneWolf?'· 🐺홀로된자':''}</div>
        </div>
      </div>
      <div class="sk-tabs">
        ${tabBtn('main','상태')}
        ${tabBtn('actions','행동')}
        ${tabBtn('skills','스킬')}
        ${tabBtn('ending','엔딩')}
        ${tabBtn('history','기록')}
      </div>
      <div style="padding:9px 11px">
        ${mainHtml}${actHtml}${skillHtml}${endingHtml}${histHtml}
      </div>
    </div>`;
}
window.renderBeastWildlawPanel = renderBeastWildlawPanel;

window.renderBeastWildlawPanel = renderBeastWildlawPanel;

export const BEAST_AWAKENING_KEY = 'tf-beast-awakening';

export const loadBeastAwakening  = () => {
  try {
    return JSON.parse(localStorage.getItem(BEAST_AWAKENING_KEY) ||
      '{"points":0,"stage":0,"history":[],"instinct":{"shapeshift":0,"bloodFight":0,"territoryMark":0,"beastSpeak":0,"ritualHunt":0},"suppressCount":0,"fullAwakened":false}');
  } catch(e) {
    return {points:0,stage:0,history:[],instinct:{shapeshift:0,bloodFight:0,territoryMark:0,beastSpeak:0,ritualHunt:0},suppressCount:0,fullAwakened:false};
  }
};

export const saveBeastAwakening  = (d) => { try{ localStorage.setItem(BEAST_AWAKENING_KEY, JSON.stringify(d)); }catch(e){} };

export const clearBeastAwakening = () => localStorage.removeItem(BEAST_AWAKENING_KEY);

export const BEAST_AWAKENING_STAGES = [
  {
    stage: 0, name: '잠든 야수', icon: '🌑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3" opacity="0.4"/></svg>`, color: '#6a7040', threshold: 0,
    desc: '야수성이 깊이 잠들어 있다. 평범한 수인처럼 보인다.',
    statBonus: {}, statPenalty: {},
    skills: [],
    aura: '야수적 기운이 느껴지지 않는다. 동물들이 경계를 풀고 접근한다.',
    aiHint: ''
  },
  {
    stage: 1, name: '야성의 눈뜸', icon: '🌒', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><path d="M12 4 A8 8 0 0 0 12 20 Z" fill="currentColor" fill-opacity="0.3" stroke="none"/></svg>`, color: '#8a9030', threshold: 80,
    desc: '야수성이 서서히 깨어난다. 감각이 날카로워지고 본능이 살아난다.',
    statBonus: { per: 6, agi: 4, str: 3 }, statPenalty: { int: -2 },
    skills: [
      { id:'ba_s1_primal_sense', name:'원초적 감각', icon:'👁️', type:'passive', rarity:'uncommon',
        desc:'야수의 본능이 깨어났다. 어둠 속 시야 확보, 냄새로 적 탐지. PER +10, 기습 불가.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동', statBoost:{per:80, agi:40} }
    ],
    aura: '눈동자가 동물처럼 빛난다. 동물들이 본능적으로 복종한다.',
    aiHint: '1단계 각성: 수인의 감각이 비정상적으로 예민해졌다. 냄새나 소리에 반응하는 묘사, 눈빛이 야수처럼 빛나는 장면을 포함하라.'
  },
  {
    stage: 2, name: '본능의 해방', icon: '🌓', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><path d="M12 4 A8 8 0 0 0 12 20 Z" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>`, color: '#b08020', threshold: 200,
    desc: '야수의 본능이 이성과 길항하기 시작했다. 전투 본능이 폭발적으로 강화된다.',
    statBonus: { per: 12, agi: 10, str: 8, crit: 6 }, statPenalty: { int: -5, cha: -4 },
    skills: [
      { id:'ba_s2_beast_rush', name:'야수 돌진', icon:'💨', type:'active', rarity:'rare',
        desc:'MP 12. 야수의 속도로 순간 돌진. AGI +20, 첫 타격 반드시 치명타. 쿨다운 없음.',
        mpCost:12, condition:null, conditionDesc:'직접 발동', statBoost:{agi:160, crit:120} },
      { id:'ba_s2_blood_scent', name:'혈흔 추적', icon:'🩸', type:'passive', rarity:'uncommon',
        desc:'피 냄새로 부상한 적을 추적. 상처입은 적 공격 시 STR +15, 도주 불가.',
        mpCost:0, condition:'enemy_wounded', conditionDesc:'적 부상 시', statBoost:{str:120, per:80} }
    ],
    aura: '전투 중 눈이 세로로 변한다. NPC들이 긴장하며 거리를 둔다.',
    aiHint: '2단계 각성: 전투 시 야수 본능이 전면에 나선다. 이성보다 본능이 빠른 묘사, 상처 냄새를 맡고 반응하는 장면을 포함하라.'
  },
  {
    stage: 3, name: '반야수화', icon: '🌔', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 C4 16 6 14 6 11 C6 8.5 7.5 7 9.5 7 C11.5 7 13 8.5 13 11 C13 14 15 16 15 20"/><path d="M15 20 C15 17 16.5 15.5 18 15.5 C19.5 15.5 20.5 17 20.5 19"/></svg>`, color: '#d06010', threshold: 380,
    desc: '외형에 야수성이 드러나기 시작했다. 강해지지만 대화 판정이 어려워진다.',
    statBonus: { per: 20, agi: 18, str: 16, end: 10, crit: 10 }, statPenalty: { int: -10, cha: -12, trst: -8 },
    skills: [
      { id:'ba_s3_partial_shift', name:'부분 변신', icon:'🐾', type:'active', rarity:'rare',
        desc:'MP 0. 팔·발이 야수 형태로 강화. STR +25, AGI +18, 3턴 지속. 무기 사용 불가.',
        mpCost:0, condition:null, conditionDesc:'직접 발동', statBoost:{str:200, agi:144, end:80} },
      { id:'ba_s3_territorial_roar', name:'영역 포효', icon:'🦁', type:'active', rarity:'rare',
        desc:'MP 8. 영역 선언 포효. 반경 내 모든 적 FEAR 판정. 실패 시 2턴 이동 불가.',
        mpCost:8, condition:null, conditionDesc:'직접 발동', statBoost:{str:80, fear:120} }
    ],
    aura: '이빨과 발톱이 드러난다. 성직자들이 "야수의 오염"을 경고한다.',
    aiHint: '3단계 각성: 외형이 변하기 시작했다. 이빨이 날카로워지고 손톱이 발톱으로 자라는 묘사, NPC들이 두려움으로 거리를 두는 장면을 포함하라.'
  },
  {
    stage: 4, name: '야수의 본색', icon: '🌕', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.55" stroke="none"/></svg>`, color: '#e84010', threshold: 600,
    desc: '야수의 본모습이 드러났다. 폭발적인 전투력과 대가가 공존한다.',
    statBonus: { per: 30, agi: 28, str: 26, end: 18, crit: 16, fear: 14 }, statPenalty: { int: -18, cha: -20, trst: -14, wil: -8 },
    skills: [
      { id:'ba_s4_predator_instinct', name:'포식자 본능', icon:'🌑', type:'passive', rarity:'epic',
        desc:'모든 전투 전 선제공격 확정. 적의 약점이 자동 감지됨. CRIT +20, STR +20 상시.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동', statBoost:{str:160, crit:160, per:120} },
      { id:'ba_s4_feral_regeneration', name:'야수 재생', icon:'🩸', type:'passive', rarity:'epic',
        desc:'전투 중 매 턴 HP +8 자동 회복. END +15 상시. 빈사 상태에서 각성도 자동 +20.',
        mpCost:0, condition:'in_combat', conditionDesc:'전투 중 항시', statBoost:{end:120, str:80} }
    ],
    aura: '반경의 약한 동물이 엎드린다. 일반 NPC들이 도망간다. 수인 동족도 두려워한다.',
    aiHint: '4단계 각성: 야수의 본색이 완전히 드러났다. 접근하는 모든 생명체가 본능적 공포를 느끼고, 공기 자체가 무거워지는 묘사를 포함하라.'
  },
  {
    stage: 5, name: '원초의 야수', icon: '🔴', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" stroke-width="1.3"/><path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12" stroke-width="1.2"/></svg>`, color: '#ff2000', threshold: 820,
    desc: '이성이 거의 사라졌다. 원시 야수의 힘이 극한에 달했다.',
    statBonus: { per: 42, agi: 40, str: 38, end: 28, crit: 24, fear: 22 }, statPenalty: { int: -28, cha: -32, trst: -22, wil: -18, luk: -8 },
    skills: [
      { id:'ba_s5_primal_frenzy', name:'원초 광란', icon:'🔴', type:'active', rarity:'legendary',
        desc:'HP 20 소모. 완전한 야수 형태 해방. STR·AGI·END 모두 +30, 5턴 지속. 이 동안 대화 불가.',
        mpCost:0, condition:null, conditionDesc:'직접 발동', statBoost:{str:240, agi:240, end:200, fear:180} },
      { id:'ba_s5_pack_domination', name:'무리 지배', icon:'👑', type:'passive', rarity:'legendary',
        desc:'야수의 기운으로 반경 내 동물·야수·수인 자동 복종. 결투 시 선공 확정. FEAR +25 상시.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동', statBoost:{str:200, fear:200, per:160} }
    ],
    aura: '존재 자체가 원시 공포다. 고레벨 NPC조차 자동 공포 판정. 숲의 동물들이 귀속된다.',
    aiHint: '5단계 각성: 거의 이성을 잃었다. 말보다 포효가 먼저 나오고, 행동이 동물적으로 변한다. 주변 생명체가 본능적으로 복종하는 묘사를 포함하라.'
  },
  {
    stage: 6, name: '완전 야수화', icon: '🌋', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/></svg>`, color: '#ff6000', threshold: 1000,
    desc: '야수화가 완성됐다. 이성은 사라졌지만 최강의 야수가 됐다.',
    statBonus: { per: 58, agi: 56, str: 54, end: 40, crit: 32, fear: 30 }, statPenalty: { int: -45, cha: -50, trst: -35, wil: -28 },
    skills: [
      { id:'ba_s6_apex_predator', name:'정점의 포식자', icon:'🌋', type:'passive', rarity:'legendary',
        desc:'완전 야수화의 경지. 모든 피해 25% 감소. 전투 중 매 턴 HP +15, 기절·마비 면역. STR +40 상시.',
        mpCost:0, condition:'always', conditionDesc:'항시 발동', statBoost:{str:320, agi:280, end:240, fear:240, crit:200} },
      { id:'ba_s6_world_eater', name:'세계의 포식자', icon:'💀', type:'active', rarity:'legendary',
        desc:'HP 40 소모. 전장의 모든 적에게 원시적 공포 폭발. 약한 적 즉사 판정. 강한 적 -40% HP.',
        mpCost:0, condition:null, conditionDesc:'직접 발동', statBoost:{str:400, fear:360, crit:280} }
    ],
    aura: '우주의 생명체들이 이 존재를 최상위 포식자로 인식한다. 신들도 주목한다.',
    aiHint: '6단계 완전 야수화: 인격이 야수와 융합됐다. 대화는 으르렁거림으로, 행동은 본능으로만 이루어진다. 자연계 전체가 복종하는 묘사를 포함하라.'
  }
];

export function gainBeastAwakening(instinctType, customGain, silent) {
  if (!isBeastRace()) return;
  const ba = loadBeastAwakening();
  const def = BEAST_INSTINCT_GAIN[instinctType];
  const gain = customGain !== undefined ? customGain : (def?.gain || 5);
  ba.points = Math.min(1000, (ba.points || 0) + gain);
  ba.instinct = ba.instinct || {};
  if (instinctType) ba.instinct[instinctType] = (ba.instinct[instinctType] || 0) + 1;
  ba.history = ba.history || [];
  ba.history.push({
    type: instinctType, gain, label: def?.label || instinctType,
    icon: def?.icon || '🌕', total: ba.points,
    at: new Date().toISOString().slice(0, 16)
  });
  

  // 단계 업데이트
  const prevStage = ba.stage || 0;
  let newStage = 0;
  for (let i = BEAST_AWAKENING_STAGES.length - 1; i >= 0; i--) {
    if (ba.points >= BEAST_AWAKENING_STAGES[i].threshold) { newStage = i; break; }
  }
  ba.stage = newStage;

  // 야수의 피(beastBlood)와 연동: 각성 4단계 이상이면 beastBlood 자동 상승
  if (newStage >= 4 && typeof loadBeastWildlaw === 'function') {
    const bw = loadBeastWildlaw();
    bw.beastBlood = Math.min(100, (bw.beastBlood || 50) + 3);
    saveBeastWildlaw(bw);
  }
  // 완전 야수화(6단계) 도달 시 홀로 된 자 강제 전환
  if (newStage >= 6 && !ba.fullAwakened) {
    ba.fullAwakened = true;
    if (typeof loadBeastWildlaw === 'function') {
      const bw = loadBeastWildlaw();
      bw.isLoneWolf = true;
      saveBeastWildlaw(bw);
    }
  }

  saveBeastAwakening(ba);

  if (newStage > prevStage) {
    const stg = BEAST_AWAKENING_STAGES[newStage];
    setTimeout(() => {
      toastHTML(`🌕 야수 각성 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 4000);
      stg.skills.forEach(sk => {
        if (!S.unlockedSkills[sk.id]) {
          S.unlockedSkills[sk.id] = true;
          if (typeof saveSkills === 'function') saveSkills(S.unlockedSkills);
          setTimeout(() => toastHTML(`🔓 야수 각성 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3000), 1500);
        }
      });
    }, 500);
  } else if (!silent && gain >= 10) {
    toast(`🌕 야수 본능 강화: +${gain} (${ba.points}/1000)`, 2000);
  }

  applyBeastAwakeningStats();
  return ba;
}
window.gainBeastAwakening = gainBeastAwakening;

export function reduceBeastAwakening(amount, methodId) {
  if (!isBeastRace()) return;
  const ba = loadBeastAwakening();
  ba.points = Math.max(0, (ba.points || 0) - amount);
  ba.suppressCount = (ba.suppressCount || 0) + 1;
  ba.history = ba.history || [];
  ba.history.push({
    type: 'suppress', gain: -amount, label: '이성 회복',
    icon: '🌿', total: ba.points,
    at: new Date().toISOString().slice(0, 16)
  });

  let newStage = 0;
  for (let i = BEAST_AWAKENING_STAGES.length - 1; i >= 0; i--) {
    if (ba.points >= BEAST_AWAKENING_STAGES[i].threshold) { newStage = i; break; }
  }
  ba.stage = newStage;
  saveBeastAwakening(ba);
  applyBeastAwakeningStats();
  toast(`🌿 야성 억제! 각성도 -${amount} (현재: ${ba.points})`, 3000);
  return ba;
}
window.reduceBeastAwakening = reduceBeastAwakening;

export function applyBeastAwakeningStats() {
  if (!isBeastRace()) return;
  const ba = loadBeastAwakening();
  const stg = BEAST_AWAKENING_STAGES[ba.stage || 0];
  if (!stg) return;

  const prev = S._beastAwakeBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });

  const newBonus = {};
  Object.entries(stg.statBonus || {}).forEach(([k, v]) => { S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); newBonus[k] = v; });
  Object.entries(stg.statPenalty || {}).forEach(([k, v]) => { S.stats[k] = Math.max(0, (S.stats[k] || 50) + v); });
  S._beastAwakeBonus = newBonus;

  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyBeastAwakeningStats = applyBeastAwakeningStats;

export function getBeastAwakeningStatus() {
  if (!isBeastRace()) return null;
  const ba = loadBeastAwakening();
  const stg = BEAST_AWAKENING_STAGES[ba.stage || 0];
  const nextStg = BEAST_AWAKENING_STAGES[(ba.stage || 0) + 1];
  return { ...ba, stageDef: stg, nextStage: nextStg };
}
window.getBeastAwakeningStatus = getBeastAwakeningStatus;

export function beastSuppress(methodId) {
  const method = BEAST_SUPPRESS_METHODS.find(m => m.id === methodId);
  if (!method) return;
  const ba = loadBeastAwakening();
  if ((ba.points || 0) <= 0) { toast('억제할 각성도가 없습니다'); return; }
  if (method.cost.hp && (S.stats.hp || 100) <= method.cost.hp + 10) { toast('HP가 너무 낮습니다'); return; }
  // 무리 조건 체크
  if (methodId === 'suppress_pack_ritual') {
    const bw = typeof loadBeastWildlaw === 'function' ? loadBeastWildlaw() : {};
    if ((bw.packMembers || []).length < 2) { toast('무리 멤버가 2명 이상 필요합니다'); return; }
  }
  // 윤리 조건 체크
  if (methodId === 'suppress_meditation') {
    const bw = typeof loadBeastWildlaw === 'function' ? loadBeastWildlaw() : {};
    if ((bw.hunterCode || 0) < 60) { toast('사냥꾼의 윤리 60 이상이 필요합니다'); return; }
  }
  if (method.cost.hp) { S.stats.hp = Math.max(1, (S.stats.hp || 100) - method.cost.hp); }
  reduceBeastAwakening(method.reduce, methodId);
  window.updateHeader();
}
window.beastSuppress = beastSuppress;

export function renderBeastAwakeningPanel() {
  const body = document.getElementById('pb-beast-awakening');
  if (!body) return;

  if (!isBeastRace()) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">🌑</div>
      <div>수인 캐릭터에게만 활성화됩니다.</div>
      <div style="margin-top:6px;font-size:10px">캐릭터 설정에서 종족을 수인으로 선택하세요.</div>
    </div>`;
    return;
  }

  const ba = loadBeastAwakening();
  const stg = BEAST_AWAKENING_STAGES[ba.stage || 0];
  const nextStg = BEAST_AWAKENING_STAGES[(ba.stage || 0) + 1];
  const color = stg.color;
  const instEntries = Object.entries(ba.instinct || {});
  const totalInst = instEntries.reduce((a, [, v]) => a + v, 0);
  const stageSkills = BEAST_AWAKENING_STAGES.slice(0, (ba.stage || 0) + 1).flatMap(s => s.skills);

  body.innerHTML = `
    <!-- 헤더: 현재 각성 단계 -->
    <div style="padding:14px;background:linear-gradient(135deg,#0d0800,#1a1000);border-bottom:2px solid ${color};margin-bottom:0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#906020;margin-top:2px">${ba.stage}단계 / 6단계</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:18px;color:${color}">${ba.points}<span style="font-size:9px;color:#6a4010"> / 1000</span></div>
          <div style="font-size:8px;color:#6a4010">각성도</div>
        </div>
      </div>
      <!-- 각성도 바 -->
      <div style="height:6px;background:#0d0800;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="width:${Math.min(100, Math.round(ba.points / 10))}%;height:100%;background:linear-gradient(90deg,#5a3000,${color});border-radius:3px;transition:width .4s"></div>
      </div>
      ${nextStg ? `
        <div style="display:flex;justify-content:space-between;font-size:8px;color:#6a4010">
          <span>현재: ${ba.points}</span>
          <span>다음 단계 (${nextStg.name}): ${nextStg.threshold}</span>
        </div>
      ` : `<div style="font-size:8px;color:${color};text-align:center">⚠️ 최고 각성 단계 도달 — 완전 야수화</div>`}
      <div style="margin-top:8px;font-size:10px;color:#a07030;line-height:1.6;font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- 단계별 오라 -->
    <div style="padding:8px 12px;background:#0a0600;border-bottom:1px solid #1a1000;font-size:10px;color:#806020">
      🌕 <span style="font-style:italic">${stg.aura}</span>
    </div>

    <!-- 각성 단계 진행 표시 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 각성 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${BEAST_AWAKENING_STAGES.map((s, i) => {
          const active = i === ba.stage;
          const passed = i < ba.stage;
          const c = s.color;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a1000':passed?'#0e0900':'#0a0600'};border:1px solid ${active?c:passed?c+'44':'#1a1000'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="display:inline-flex;width:12px;height:12px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):((s.svgIcon||'').replace('width="20" height="20"','width="12" height="12"')||s.icon)}</span>
            <div style="flex:1">
              <span style="font-family:'Cinzel',serif;font-size:9px;color:${active?c:passed?c:'#4a3010'}">${s.name}</span>
              <span style="font-size:8px;color:#4a3010;margin-left:5px">(${s.threshold})</span>
            </div>
            ${active ? `<span style="font-size:8px;color:${c};font-family:'Cinzel',serif">◀ 현재</span>` : ''}
            ${passed ? `<span style="font-size:9px;color:${c}">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- 스탯 보너스/페널티 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 각성 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.statBonus || {}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#0d0a00;border:1px solid #3a2a0a;border-radius:2px;font-size:9px">
            <span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span>
          </div>`).join('')}
        ${Object.entries(stg.statPenalty || {}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#0d0000;border:1px solid #3a0a0a;border-radius:2px;font-size:9px">
            <span style="color:#a06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:4px">${v}</span>
          </div>`).join('')}
        ${Object.keys(stg.statBonus || {}).length === 0 && Object.keys(stg.statPenalty || {}).length === 0 ?
          `<div style="padding:5px;font-size:9px;color:var(--dim);grid-column:1/-1">잠든 상태 — 아직 효과 없음</div>` : ''}
      </div>
    </div>

    <!-- 해금된 각성 스킬 -->
    ${stageSkills.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 야수 각성 스킬 ──</div>
      ${stageSkills.map(sk => {
        const unlocked = !!S.unlockedSkills[sk.id];
        return `<div style="padding:7px 9px;background:${unlocked?'#140a00':'#0a0600'};border:1px solid ${unlocked?color+'55':'#1a1000'};margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:${color}">${sk.name}</span>
            <span style="font-size:8px;padding:1px 5px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:2px;margin-left:auto">${sk.rarity}</span>
            ${unlocked ? '<span style="font-size:9px;color:#60d060">✓</span>' : '<span style="font-size:9px;color:#4a3010">🔒</span>'}
          </div>
          <div style="font-size:9px;color:#806040;line-height:1.5">${sk.desc}</div>
          ${sk.mpCost > 0 ? `<div style="font-size:8px;color:#507060;margin-top:2px">MP 소모: ${sk.mpCost}</div>` : ''}
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- 본능 행동 통계 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 본능 행동 기록 (총 ${totalInst}회) ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(BEAST_INSTINCT_GAIN).map(([k, def]) => `
          <div style="padding:5px 8px;background:#0a0600;border:1px solid #1a1000;border-radius:2px">
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
              <span style="font-size:11px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:11}):(def.icon)}</span>
              <span style="font-size:9px;color:#806030">${def.label}</span>
            </div>
            <div style="font-family:'Cinzel',serif;font-size:12px;color:${color}">${ba.instinct?.[k] || 0}<span style="font-size:8px;color:#4a3010">회</span></div>
          </div>`).join('')}
      </div>
    </div>

    <!-- 수동 각성도 증가 (행동 트리거) -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-size:9px;color:#4a3010;font-style:italic;text-align:center;padding:4px 0">🐾 야수 본능은 AI 서사에서 자동으로 쌓입니다</div>
    </div>

    <!-- 이성 회복 방법 -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a1000">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 야성 억제 (이성 회복) ──</div>
      ${BEAST_SUPPRESS_METHODS.map(m => {
        const bwData = typeof loadBeastWildlaw === 'function' ? loadBeastWildlaw() : {};
        let canUse = (ba.points || 0) > 0;
        if (m.id === 'suppress_meditation' && (bwData.hunterCode || 0) < 60) canUse = false;
        if (m.id === 'suppress_pack_ritual' && (bwData.packMembers || []).length < 2) canUse = false;
        if (m.id === 'suppress_force_seal' && (S.stats?.hp || 100) <= 40) canUse = false;
        return `<div style="padding:8px 10px;background:#0a0800;border:1px solid ${canUse?'#5a3800':'#1a1000'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m.icon)}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${canUse?'#c08030':'#5a4010'}">${m.name}</div>
              <div style="font-size:8px;color:#4a3010;margin-top:1px">조건: ${m.req}</div>
            </div>
            <span style="font-size:9px;color:#40a080;font-family:'Cinzel',serif">-${m.reduce}</span>
          </div>
          <div style="font-size:9px;color:#806040;margin-bottom:5px">${m.desc}</div>
          <button onclick="beastSuppress('${m.id}');renderBeastAwakeningPanel()"
            style="width:100%;padding:5px;background:${canUse?'#1e1000':'#0a0600'};border:1px solid ${canUse?'#7a5010':'#1a1000'};color:${canUse?'#c08030':'#4a3010'};font-family:'Cinzel',serif;font-size:9px;cursor:${canUse?'pointer':'not-allowed'};border-radius:2px"
            ${canUse?'':'disabled'}>
            ${canUse ? '🌿 억제하기' : '조건 미충족'}
            ${m.cost.hp ? `(HP ${m.cost.hp} 소모)` : ''}
          </button>
        </div>`;
      }).join('')}
    </div>

    <!-- 최근 기록 -->
    ${ba.history && ba.history.length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 기록 ──</div>
      ${[...ba.history].reverse().slice(0, 10).map(h => `
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d0800;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#6a4010">${h.label}</span>
          <span style="color:${h.gain > 0 ? '#e06010' : '#40a080'};font-family:'Cinzel',serif">${h.gain > 0 ? '+' : ''}${h.gain}</span>
          <span style="color:#3a2010;font-size:8px">(${h.total})</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderBeastAwakeningPanel = renderBeastAwakeningPanel;

window.gainBeastAwakening    = gainBeastAwakening;

window.reduceBeastAwakening  = reduceBeastAwakening;

window.beastSuppress         = beastSuppress;

window.applyBeastAwakeningStats = applyBeastAwakeningStats;

window.getBeastAwakeningStatus  = getBeastAwakeningStatus;

window.renderBeastAwakeningPanel = renderBeastAwakeningPanel;

window.loadBeastAwakening    = loadBeastAwakening;

window.clearBeastAwakening   = clearBeastAwakening;

export const BEAST_PACKBOND_KEY = 'tf-beast-packbond';

export const loadBeastPackBond  = () => {
  try {
    return JSON.parse(lsGet(BEAST_PACKBOND_KEY) ||
      '{"bonds":[],"packRules":[],"betrayalCount":0,"isLone":false,"vowHistory":[],"packStrength":0}');
  } catch(e) {
    return {bonds:[], packRules:[], betrayalCount:0, isLone:false, vowHistory:[], packStrength:0};
  }
};

export const saveBeastPackBond  = (d) => { try { lsSet(BEAST_PACKBOND_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearBeastPackBond = () => lsDel(BEAST_PACKBOND_KEY);

export const PACK_STRENGTH_STAGES = [
  { min:0,   max:29,  name:'흩어진 무리',   icon:'🌫️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="8" r="1.6"/><circle cx="17" cy="7" r="1.6"/><circle cx="11" cy="16" r="1.6"/></svg>`, color:'#706040',
    desc:'유대가 아직 약하다. 단체 행동 보너스 없음.',
    bonus:{}, penalty:{}, aiHint:'무리 유대가 약하다. 동료들이 개인 행동을 우선한다.' },
  { min:30,  max:59,  name:'소규모 무리',   icon:'🌿', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="1.8"/><circle cx="15" cy="9" r="1.8"/><path d="M8 9 L15 9" stroke-dasharray="1.5 1.5"/></svg>`, color:'#50a040',
    desc:'작은 무리가 형성됐다. 기본 협력 보너스 발동.',
    bonus:{str:6, agi:5, per:4}, penalty:{}, aiHint:'기본 무리 협력. 동료들이 서로 눈으로 신호를 주고받는다.' },
  { min:60,  max:89,  name:'결속된 무리',   icon:'🐺', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="10" r="1.8"/><circle cx="17" cy="10" r="1.8"/><circle cx="12" cy="16" r="1.8"/><path d="M7 10 L17 10 M7 10 L12 16 M17 10 L12 16"/></svg>`, color:'#70c050',
    desc:'강한 유대. 전투에서 완벽한 호흡을 자랑한다.',
    bonus:{str:14, agi:12, per:10, end:8, crit:6}, penalty:{}, aiHint:'강한 무리 유대. 말 없이도 서로의 의도를 읽는다.' },
  { min:90,  max:119, name:'혈맹의 무리',   icon:'🌙', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5" stroke-width="1.3"/><path d="M12 2 L12 4.5 M12 19.5 L12 22 M2 12 L4.5 12 M19.5 12 L22 12" stroke-width="1"/></svg>`, color:'#90e060',
    desc:'혈맹 수준의 결속. 무리를 위해 목숨을 바친다.',
    bonus:{str:24, agi:20, per:18, end:16, crit:12, ldr:10}, penalty:{}, aiHint:'혈맹 수준. 무리원이 위기에 처하면 본능적으로 몸이 먼저 움직인다.' },
  { min:120, max:999, name:'전설의 무리',   icon:'👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/></svg>`, color:'#b0ff70',
    desc:'전설에 남을 무리. 야생의 법칙 자체가 이 무리를 중심으로 흐른다.',
    bonus:{str:36, agi:32, per:28, end:24, crit:18, ldr:16, fear:14}, penalty:{},
    aiHint:'전설의 무리. 이 무리의 이름이 야생에 울려퍼진다. 다른 수인 집단들이 자발적으로 복속을 청한다.' },
];

export function getBeastPackStrengthStage(ps) {
  for (let i = PACK_STRENGTH_STAGES.length - 1; i >= 0; i--) {
    if (ps >= PACK_STRENGTH_STAGES[i].min) return PACK_STRENGTH_STAGES[i];
  }
  return PACK_STRENGTH_STAGES[0];
}
window.getBeastPackStrengthStage = getBeastPackStrengthStage;

export function addPackBondMember(name, role) {
  if (!isBeastRace()) return;
  const pb = loadBeastPackBond();
  if (pb.bonds.find(b => b.name === name)) { toast(`⚠️ ${name}은(는) 이미 무리에 있습니다.`); return; }
  pb.bonds.push({ name, role: role || '무리원', bond: 20, joinedAt: new Date().toISOString().slice(0,10) });
  saveBeastPackBond(pb);
  applyBeastPackBondStats();
  toast(`🐺 ${name}이(가) 무리에 합류했습니다!`, 3000);
}
window.addPackBondMember = addPackBondMember;

export function raiseBondWith(name, amount) {
  if (!isBeastRace()) return;
  const pb = loadBeastPackBond();
  const m = pb.bonds.find(b => b.name === name);
  if (!m) return;
  m.bond = Math.min(100, (m.bond || 20) + (amount || 10));
  // 무리 강도 재계산
  pb.packStrength = calcPackStrength(pb);
  saveBeastPackBond(pb);
  applyBeastPackBondStats();
}
window.raiseBondWith = raiseBondWith;

export function triggerPackBetrayal(name) {
  if (!isBeastRace()) return;
  const pb = loadBeastPackBond();
  pb.betrayalCount = (pb.betrayalCount || 0) + 1;
  // 전체 유대도 하락
  pb.bonds.forEach(b => { b.bond = Math.max(0, b.bond - 20); });
  if (name) { const m = pb.bonds.find(b => b.name === name); if (m) pb.bonds = pb.bonds.filter(b => b.name !== name); }
  // 배신 2회 이상 → 홀로 된 자
  if (pb.betrayalCount >= 2 && !pb.isLone) {
    pb.isLone = true;
    toast('💔 배신이 쌓였다. 이제 "홀로 된 자"가 되었습니다...', 5000);
  }
  pb.packStrength = calcPackStrength(pb);
  saveBeastPackBond(pb);
  applyBeastPackBondStats();
}
window.triggerPackBetrayal = triggerPackBetrayal;

export function applyPackRule(ruleId, fulfilled) {
  if (!isBeastRace()) return;
  const pb = loadBeastPackBond();
  const rule = PACK_RULES.find(r => r.id === ruleId);
  if (!rule) return;
  if (fulfilled) {
    if (ruleId === 'share_hunt')  pb.bonds.forEach(b => { b.bond = Math.min(100, b.bond + 5); });
    if (ruleId === 'protect_weak') pb.packStrength = Math.min(999, (pb.packStrength||0) + 10);
    if (ruleId === 'answer_howl')  pb.packStrength = Math.min(999, (pb.packStrength||0) + 8);
    pb.vowHistory = pb.vowHistory || [];
    pb.vowHistory.push({ rule: rule.label, icon: rule.icon, result:'이행', at: new Date().toISOString().slice(0,16) });
    toast(`✅ 무리 규칙 이행: ${rule.label}`, 3000);
  } else {
    if (ruleId === 'never_abandon') pb.betrayalCount = (pb.betrayalCount||0) + 2;
    if (ruleId === 'no_secret') pb.bonds.forEach(b => { b.bond = Math.max(0, b.bond - 10); });
    pb.vowHistory = pb.vowHistory || [];
    pb.vowHistory.push({ rule: rule.label, icon: rule.icon, result:'위반', at: new Date().toISOString().slice(0,16) });
    toast(`❌ 무리 규칙 위반: ${rule.label}`, 3000);
    if (pb.betrayalCount >= 2 && !pb.isLone) {
      pb.isLone = true;
      setTimeout(() => toast('💔 "홀로 된 자"가 되었습니다. 무리의 모든 혜택이 봉인됩니다.', 5000), 500);
    }
  }
  pb.packStrength = calcPackStrength(pb);
  saveBeastPackBond(pb);
  applyBeastPackBondStats();
  renderBeastPackBondPanel();
}
window.applyPackRule = applyPackRule;

export function redeemPackBetrayal() {
  if (!isBeastRace()) return;
  const pb = loadBeastPackBond();
  pb.isLone = false;
  pb.betrayalCount = Math.max(0, (pb.betrayalCount||0) - 1);
  pb.packStrength = Math.max(0, (pb.packStrength||0) - 20);
  saveBeastPackBond(pb);
  applyBeastPackBondStats();
  toast('🌿 속죄의 길을 걸었다. "홀로 된 자" 상태 해제.', 4000);
  renderBeastPackBondPanel();
}
window.redeemPackBetrayal = redeemPackBetrayal;

export function calcPackStrength(pb) {
  if (!pb.bonds || pb.bonds.length === 0) return 0;
  const avgBond = pb.bonds.reduce((a,b)=>a+(b.bond||0),0) / pb.bonds.length;
  return Math.round(avgBond * pb.bonds.length * 0.4 + (pb.packStrength||0) * 0.1);
}
window.calcPackStrength = calcPackStrength;

export function applyBeastPackBondStats() {
  if (!isBeastRace()) return;
  const pb = loadBeastPackBond();
  const prev = S._beastPackBondBonus || {};
  Object.entries(prev).forEach(([k,v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const nb = {};
  if (pb.isLone) {
    // [20차 감사 FIX] 이 분기가 S._beastPackBondBonus를 빈 객체로 지워버려서,
    // 방금 적용한 LONE_WOLF_PENALTY 자체가 다음 호출 때 되돌릴 대상으로
    // 추적되지 않았다. 이 함수는 updateHeader() 안에서(수인 캐릭터일 때
    // 매번) 호출되고, updateHeader는 스탯/골드/퀘스트 변화마다 한 턴에
    // 여러 번 실행되므로, "홀로 된 자" 상태가 된 순간부터 매 호출마다
    // 이전 페널티를 되돌리지 못한 채 CHA/TRST/LDR/STR에 페널티가 무한히
    // 누적되어 몇 턴 안에 0으로 고정되고, 이후 배신을 속죄해도(isLone
    // 해제) 이미 누적된 페널티는 영원히 남는 문제가 있었다. 보너스 분기와
    // 동일하게 실제 적용한 델타를 기록해 다음 호출에서 정확히 되돌릴 수 있게 한다.
    Object.entries(LONE_WOLF_PENALTY).forEach(([k,v]) => { S.stats[k] = Math.max(0, (S.stats[k]||50) + v); nb[k]=v; });
    S._beastPackBondBonus = nb;
  } else {
    const stg = getBeastPackStrengthStage(pb.packStrength || 0);
    Object.entries(stg.bonus || {}).forEach(([k,v]) => { S.stats[k] = Math.min(999,(S.stats[k]||50)+v); nb[k]=v; });
    S._beastPackBondBonus = nb;
  }
  if (typeof saveStats==='function') saveStats(S.stats);
  window.updateHeader();
}
window.applyBeastPackBondStats = applyBeastPackBondStats;

// [추출] 예전엔 detectBeastPackBondFromText 안에 pb.packStrength 증가가
// 직접 inline돼 있어 AI 텍스트 감지 없이는 절대 호출할 수 없었다 — 수동
// 버튼이 같은 로직을 재사용할 수 있도록 이름 있는 함수로 분리.
export function gainBeastPackBond(amount, reason) {
  if (!isBeastRace()) return;
  const pb = loadBeastPackBond();
  pb.packStrength = Math.min(999,(pb.packStrength||0)+(amount||6));
  saveBeastPackBond(pb); applyBeastPackBondStats();
  toast(`🐺 무리 강도 +${amount||6} (${reason||'협력'})`, 2500);
  return pb;
}
window.gainBeastPackBond = gainBeastPackBond;

export function detectBeastPackBondFromText(text) {
  if (!text || !isBeastRace()) return;
  if (/동료를 버리고|혼자 도망|혼자 빠져나|혼자 남겨/.test(text) && Math.random()<0.5) triggerPackBetrayal(null);
  if (/함께 싸우|나란히|어깨를 나란|호흡을 맞|무리와 함께/.test(text) && Math.random()<0.5) {
    gainBeastPackBond(6, 'AI 서사 감지');
  }
}
window.detectBeastPackBondFromText = detectBeastPackBondFromText;

export function renderBeastPackBondPanel() {
  const body = document.getElementById('pb-beast-packbond');
  if (!body) return;
  if (!isBeastRace()) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px"><div style="font-size:32px;margin-bottom:10px">🐺</div><div>수인족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const pb = loadBeastPackBond();
  const ps = Math.max(0, pb.packStrength || 0);
  const stg = getBeastPackStrengthStage(ps);
  const color = pb.isLone ? '#a04040' : stg.color;
  const npcs = (S.npcs || []).filter(n => n.active !== false && !pb.bonds.find(b=>b.name===n.name));

  body.innerHTML = `
    <!-- ① 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#001810,#002018);border-bottom:2px solid ${color}">
      ${pb.isLone ? `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:28px">💔</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:13px;color:#e04040;letter-spacing:1px">홀로 된 자</div>
            <div style="font-size:9px;color:#8a4040;margin-top:2px">무리에서 추방된 상태. 모든 협력 보너스 봉인.</div>
          </div>
        </div>
        <div style="font-size:9px;color:#e06060;padding:6px;background:#1a0808;border:1px solid #4a1010;border-radius:2px">
          배신 횟수: ${pb.betrayalCount || 0}회 — 속죄 행동으로 복귀 가능
        </div>
        <button onclick="redeemPackBetrayal();renderBeastPackBondPanel()"
          style="margin-top:8px;width:100%;padding:7px;background:#1a0808;border:1px solid #804040;color:#c06060;font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">
          🌿 속죄의 길 (무리 강도 -20, 배신 -1)
        </button>
      ` : `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
            <div style="font-size:9px;color:#408060;margin-top:2px">무리 강도 ${ps} | 멤버 ${pb.bonds.length}명</div>
          </div>
        </div>
        <div style="height:6px;background:#001008;border-radius:3px;overflow:hidden;margin-bottom:4px;border:1px solid #104030">
          <div style="width:${Math.min(100,Math.round(ps/1.2))}%;height:100%;background:linear-gradient(90deg,#208040,${color});border-radius:3px;transition:width .4s"></div>
        </div>
        <div style="font-size:9px;color:#306050;margin-top:6px;font-style:italic">"${stg.desc}"</div>
      `}
    </div>

    <!-- ② 무리 강도 단계 -->
    ${!pb.isLone ? `
    <div style="padding:8px 12px;border-bottom:1px solid #002010">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 무리 강도 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${PACK_STRENGTH_STAGES.map(s => {
          const active = ps >= s.min && ps <= s.max;
          const passed = ps > s.max;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#001a10':passed?'#000f08':'#000a05'};border:1px solid ${active?s.color:passed?s.color+'44':'#002010'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="display:inline-flex;width:12px;height:12px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):((s.svgIcon||'').replace('width="20" height="20"','width="12" height="12"')||s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#304030'}">${s.name}</span><span style="font-size:8px;color:#203020;margin-left:5px">(${s.min}+)</span></div>
            ${active?`<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀ 현재</span>`:''}
            ${passed?`<span style="font-size:9px;color:${s.color}">✓</span>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ③ 스탯 효과 -->
    <div style="padding:10px 12px;border-bottom:1px solid #002010">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 무리 유대 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.bonus||{}).map(([k,v])=>`<div style="padding:3px 7px;background:#050f00;border:1px solid #1a3000;border-radius:2px;font-size:9px"><span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span></div>`).join('')}
        ${Object.keys(stg.bonus||{}).length===0?`<div style="grid-column:span 2;font-size:9px;color:#203020;text-align:center;padding:6px">유대를 쌓아 보너스를 획득하세요</div>`:''}
      </div>
    </div>` : ''}

    <!-- ④ 무리원 목록 -->
    <div style="padding:10px 12px;border-bottom:1px solid #002010">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:8px">── 무리원 (${pb.bonds.length}명) ──</div>
      ${pb.bonds.length === 0
        ? `<div style="font-size:9px;color:#203020;text-align:center;padding:8px">아직 무리원이 없습니다</div>`
        : pb.bonds.map(m => `
          <div style="display:flex;align-items:center;gap:7px;padding:6px 8px;background:#001008;border:1px solid #104030;margin-bottom:4px;border-radius:2px">
            <span style="font-size:16px">🐾</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${color}">${esc(m.name)}</div>
              <div style="font-size:8px;color:#308050">${esc(m.role||'무리원')} | 합류: ${m.joinedAt||'-'}</div>
              <div style="height:3px;background:#001008;border-radius:2px;margin-top:3px;border:1px solid #104030">
                <div style="width:${m.bond||0}%;height:100%;background:${color};border-radius:2px"></div>
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-family:'Cinzel',serif;font-size:11px;color:${color}">${m.bond||0}</div>
              <div style="font-size:7px;color:#308050">유대도</div>
            </div>
            <button onclick="raiseBondWith('${esc(m.name)}',15);renderBeastPackBondPanel()"
              style="padding:3px 7px;background:#001a0a;border:1px solid ${color}55;color:${color};font-size:8px;cursor:pointer;border-radius:2px">+유대</button>
          </div>`).join('')}
      <!-- 무리원 추가 -->
      ${npcs.length > 0 ? `
        <div style="margin-top:6px">
          <select id="packbond-npc-select" style="width:100%;padding:5px;background:#001008;border:1px solid #104030;color:#50d0a0;font-size:9px;border-radius:2px;margin-bottom:4px">
            <option value="">— NPC 선택 —</option>
            ${npcs.slice(0,20).map(n=>`<option value="${esc(n.name)}">${esc(n.name)} (${esc(n.role||'')})</option>`).join('')}
          </select>
          <button onclick="const s=document.getElementById('packbond-npc-select');if(s&&s.value){addPackBondMember(s.value,'동료');renderBeastPackBondPanel();}"
            style="width:100%;padding:6px;background:#001a0a;border:1px solid ${color}55;color:${color};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">
            🐺 무리에 추가
          </button>
        </div>` : ''}
    </div>

    <!-- ④-2 무리 결속 행동 (AI 없이도 진행되도록 하는 수동 트리거 — 기존엔
         detectBeastPackBondFromText의 AI 서사 감지에만 의존해 no-API
         모드에서 무리 강도가 영구 정지했음) -->
    ${!pb.isLone ? `
    <div style="padding:10px 12px;border-bottom:1px solid #002010">
      <button onclick="gainBeastPackBond(6,'수동 발동');renderBeastPackBondPanel()"
        style="width:100%;padding:7px;background:#001a0a;border:1px solid ${color}55;color:${color};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">
        🐺 무리와 함께 싸우기 (무리 강도 +6)
      </button>
    </div>` : ''}

    <!-- ⑤ 무리 규칙 -->
    <div style="padding:10px 12px;border-bottom:1px solid #002010">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 무리 규칙 ──</div>
      ${PACK_RULES.map(r=>`
        <div style="padding:7px 9px;background:#001008;border:1px solid #104030;margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:14}):(r.icon)}</span>
            <div style="flex:1;font-family:'Cinzel',serif;font-size:9px;color:${color}">${r.label}</div>
          </div>
          <div style="font-size:8px;color:#406050;margin-bottom:5px">${esc(r.desc)}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
            <button onclick="applyPackRule('${r.id}',true)"
              style="padding:4px;background:#001a0a;border:1px solid #308050;color:#50d090;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">✅ 이행</button>
            <button onclick="applyPackRule('${r.id}',false)"
              style="padding:4px;background:#1a0808;border:1px solid #803030;color:#d05050;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">❌ 위반</button>
          </div>
        </div>`).join('')}
    </div>

    <!-- ⑥ 규칙 기록 -->
    ${(pb.vowHistory||[]).length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 규칙 이행 기록 ──</div>
      ${[...pb.vowHistory].reverse().slice(0,10).map(v=>`
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #001008;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(v,{size:16}):(v.icon)}</span>
          <span style="flex:1;color:#408060">${esc(v.rule)}</span>
          <span style="color:${v.result==='이행'?'#60d060':'#e05050'}">${v.result}</span>
          <span style="color:#203020;font-size:8px">${v.at||''}</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderBeastPackBondPanel = renderBeastPackBondPanel;

window.renderBeastPackBondPanel   = renderBeastPackBondPanel;

window.addPackBondMember          = addPackBondMember;

window.raiseBondWith              = raiseBondWith;

window.triggerPackBetrayal        = triggerPackBetrayal;

window.applyPackRule              = applyPackRule;

window.redeemPackBetrayal         = redeemPackBetrayal;

window.applyBeastPackBondStats    = applyBeastPackBondStats;

window.detectBeastPackBondFromText = detectBeastPackBondFromText;

window.loadBeastPackBond          = loadBeastPackBond;

window.clearBeastPackBond         = clearBeastPackBond;

export const BEAST_LINEAGE_KEY = 'tf-beast-lineage';

export const loadBeastLineage  = () => {
  try {
    return JSON.parse(lsGet(BEAST_LINEAGE_KEY) ||
      '{"selected":null,"bloodPurity":0,"unlocked":[],"history":[],"finalForm":false}');
  } catch(e) {
    return {selected:null, bloodPurity:0, unlocked:[], history:[], finalForm:false};
  }
};

export const saveBeastLineage  = (d) => { try { lsSet(BEAST_LINEAGE_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearBeastLineage = () => lsDel(BEAST_LINEAGE_KEY);

export function getBeastLineageStage(lineage, purity) {
  const stages = lineage.stages;
  let cur = stages[0];
  for (const s of stages) { if (purity >= s.purity) cur = s; }
  return cur;
}
window.getBeastLineageStage = getBeastLineageStage;

export function selectBeastLineage(lineageId) {
  if (!isBeastRace()) return;
  const bl = loadBeastLineage();
  if (bl.selected && bl.selected !== lineageId) {
    if (!confirm(`이미 선택된 계보가 있습니다 (${BEAST_LINEAGES.find(l=>l.id===bl.selected)?.name}). 변경하면 혈통 순도와 해금 스킬이 초기화됩니다. 계속하시겠습니까?`)) return;
    bl.bloodPurity = 0; bl.unlocked = []; bl.finalForm = false;
  }
  bl.selected = lineageId;
  bl.history = bl.history || [];
  bl.history.push({ event:'선택', lineage: lineageId, at: new Date().toISOString().slice(0,16) });
  saveBeastLineage(bl);
  applyBeastLineageStats();
  toast(`🧬 ${BEAST_LINEAGES.find(l=>l.id===lineageId)?.name} 계보를 각성했습니다!`, 4000);
  renderBeastLineagePanel();
}
window.selectBeastLineage = selectBeastLineage;

export function gainLineagePurity(amount, reason) {
  if (!isBeastRace()) return;
  const bl = loadBeastLineage();
  if (!bl.selected) { toast('⚠️ 먼저 계보를 선택하세요.'); return; }
  const lineage = BEAST_LINEAGES.find(l => l.id === bl.selected);
  if (!lineage) return;
  const prevStage = getBeastLineageStage(lineage, bl.bloodPurity || 0);
  bl.bloodPurity = Math.min(300, (bl.bloodPurity || 0) + (amount || 10));
  const newStage = getBeastLineageStage(lineage, bl.bloodPurity);

  // 스킬 해금
  if (newStage.purity > prevStage.purity) {
    newStage.skills?.forEach(sk => {
      if (!bl.unlocked.includes(sk.id)) {
        bl.unlocked.push(sk.id);
        S.unlockedSkills = S.unlockedSkills || {};
        S.unlockedSkills[sk.id] = true;
        if (typeof saveSkills==='function') saveSkills(S.unlockedSkills);
        setTimeout(()=>toastHTML(`🧬 계보 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3500), 600);
      }
    });
    toastHTML(`🧬 계보 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(newStage,{size:14}):(newStage.icon)} ${esc(newStage.name)}`, 4000);
  }

  // 최종 형태 해금
  if (bl.bloodPurity >= 200 && !bl.finalForm) {
    bl.finalForm = true;
    setTimeout(()=>toast(`✨ 최종 각성 형태 해금! ${lineage.finalFormName}`, 5000), 1000);
  }

  bl.history = bl.history || [];
  bl.history.push({ event:'순도 증가', amount, reason: reason||'행동', purity: bl.bloodPurity, at: new Date().toISOString().slice(0,16) });
  
  saveBeastLineage(bl);
  applyBeastLineageStats();
}
window.gainLineagePurity = gainLineagePurity;

export function applyBeastLineageStats() {
  if (!isBeastRace()) return;
  const bl = loadBeastLineage();
  if (!bl.selected) return;
  const lineage = BEAST_LINEAGES.find(l => l.id === bl.selected);
  if (!lineage) return;
  const prev = S._beastLineageBonus || {};
  Object.entries(prev).forEach(([k,v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const stage = getBeastLineageStage(lineage, bl.bloodPurity || 0);
  const purityMult = Math.min(2.0, 1.0 + (bl.bloodPurity || 0) / 200);
  const nb = {};
  // 기본 보너스 × 순도 배율
  Object.entries(lineage.baseBonus || {}).forEach(([k,v]) => {
    const val = Math.round(v * purityMult);
    S.stats[k] = Math.min(999, (S.stats[k]||50) + val); nb[k] = val;
  });
  S._beastLineageBonus = nb;
  if (typeof saveStats==='function') saveStats(S.stats);
  window.updateHeader();
}
window.applyBeastLineageStats = applyBeastLineageStats;

export function detectBeastLineageFromText(text) {
  if (!text || !isBeastRace()) return;
  const bl = loadBeastLineage();
  if (!bl.selected) return;
  const triggers = {
    wolf:  /달빛|보름달|울부짖|무리와 함께|늑대처럼/,
    tiger: /포효|호랑이처럼|홀로|영역을 지키|산신/,
    eagle: /하늘을 날|날개를 펼|폭풍|독수리처럼|내려다보/,
    bear:  /버텨|쓰러지지 않|대지처럼|곰처럼|수호/,
    snake: /독을|기다린다|뱀처럼|지혜롭게|은신/,
  };
  if (triggers[bl.selected] && triggers[bl.selected].test(text) && Math.random() < 0.4) {
    gainLineagePurity(5, 'AI 서사 감지');
  }
}
window.detectBeastLineageFromText = detectBeastLineageFromText;

export function renderBeastLineagePanel() {
  const body = document.getElementById('pb-beast-lineage');
  if (!body) return;
  if (!isBeastRace()) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px"><div style="font-size:32px;margin-bottom:10px">🧬</div><div>수인족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const bl = loadBeastLineage();
  const selected = bl.selected ? BEAST_LINEAGES.find(l=>l.id===bl.selected) : null;
  const color = selected ? selected.color : '#a080c0';
  const purity = bl.bloodPurity || 0;
  const currentStage = selected ? getBeastLineageStage(selected, purity) : null;
  const RARITY_C = { uncommon:'#4a9a6a', rare:'#4a6fa5', epic:'#8a40c0', legendary:'#c8a96e' };

  body.innerHTML = `
    <!-- ① 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#0e0018,#150022);border-bottom:2px solid ${color}">
      ${selected ? `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(selected,{size:16}):(selected.svgIcon||selected.icon)}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${selected.name}</div>
            <div style="font-size:9px;color:#6040a0;margin-top:2px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(currentStage,{size:14}):(currentStage?.icon)} ${currentStage?.name} | 혈통 순도 ${purity}/300</div>
          </div>
          ${bl.finalForm ? `<div style="text-align:center;padding:4px 8px;background:#1a0030;border:1px solid ${color};border-radius:2px">
            <div style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(selected,{size:10}):(selected.icon)}✨</div>
            <div style="font-family:'Cinzel',serif;font-size:8px;color:${color}">최종 각성</div>
          </div>` : ''}
        </div>
        <div style="height:6px;background:#0e0018;border-radius:3px;overflow:hidden;margin-bottom:4px;border:1px solid #3a1060">
          <div style="width:${Math.min(100,Math.round(purity/3))}%;height:100%;background:linear-gradient(90deg,#400080,${color});border-radius:3px;transition:width .4s"></div>
        </div>
        <div style="font-size:9px;color:#7050a0;margin-top:6px;font-style:italic">"${selected.lore.slice(0,60)}..."</div>
        ${bl.finalForm ? `<div style="margin-top:8px;padding:6px;background:#1a0030;border:1px solid ${color};border-radius:2px;font-size:9px;color:${color};text-align:center">
          ✨ 최종 형태: ${selected.finalFormName} — ${selected.finalFormDesc}
        </div>` : ''}
      ` : `
        <div style="text-align:center;padding:8px">
          <div style="font-size:24px;margin-bottom:8px">🧬</div>
          <div style="font-family:'Cinzel',serif;font-size:12px;color:${color}">계보 미선택</div>
          <div style="font-size:9px;color:#6040a0;margin-top:4px">아래에서 야수 계보를 선택하세요.</div>
        </div>
      `}
    </div>

    <!-- ② 선택된 계보 단계 트리 -->
    ${selected ? `
    <div style="padding:8px 12px;border-bottom:1px solid #1a0030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 계보 각성 트리 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${selected.stages.map(s => {
          // [B82 FIX] active/passed/unlocked를 계산만 하고 실제 반환 HTML에서
          // 전혀 쓰지 않아, 4단계 트리 대신 같은 고정 문구만 반복 출력되던 버그.
          const active = currentStage && s.purity === currentStage.purity;
          const passed = purity > s.purity && s !== currentStage;
          const unlocked = purity >= s.purity;
          const stateColor = active?color:passed?'#6a8060':unlocked?'#4a6030':'#3a3a3a';
          const stateIcon = active?'▶':passed||unlocked?'✔':'🔒';
          const skillLine = (s.skills||[]).map(sk=>`${sk.icon||''} ${esc(sk.name)}`).join(', ');
          return `<div style="padding:5px 8px;background:${active?'#0d1a30':'#050a00'};border:1px ${active?'solid':'dashed'} ${stateColor};border-radius:2px;font-size:9px;color:${stateColor}">
        ${stateIcon} <b>${s.icon||''} ${esc(s.name)}</b> (순도 ${s.purity}+)<br>
        <span style="font-size:8px;opacity:.85">${esc(s.desc||'')}</span>
        ${skillLine?`<br><span style="font-size:8px;color:${color}">🌟 ${skillLine}</span>`:''}
      </div>`;
        }).join('')}
      </div>
    </div>
    ` : ''}

    <!-- ②-2 혈통 순도 행동 (AI 없이도 진행되도록 하는 수동 트리거 — 기존엔
         detectBeastLineageFromText의 AI 서사 감지에만 의존해 no-API 모드에서
         혈통 순도가 영구 정지했음) -->
    ${selected ? `
    <div style="padding:10px 12px;border-bottom:1px solid #1a0030">
      <button onclick="gainLineagePurity(5,'수동 발동');renderBeastLineagePanel()"
        style="width:100%;padding:7px;background:#1a0030;border:1px solid ${color}55;color:${color};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">
        🧬 ${selected.name}의 본성 발현 (혈통 순도 +5)
      </button>
    </div>` : ''}

    <!-- ③ 계보 선택 (미선택 또는 변경) -->
    <div style="padding:10px 12px;border-bottom:1px solid #1a0030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── ${selected?'계보 변경':'계보 선택'} ──</div>
      ${BEAST_LINEAGES.map(l => {
        const isSelected = bl.selected === l.id;
        return `<div style="padding:8px 10px;background:${isSelected?'#1a0030':'#0e0018'};border:1px solid ${isSelected?l.color:l.color+'33'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="color:${l.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(l,{size:16}):(l.svgIcon||l.icon)}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${l.color}">${l.name}</div>
              <div style="font-size:8px;color:#6040a0;margin-top:1px">${l.concept}</div>
            </div>
            ${isSelected?`<span style="font-size:9px;color:${l.color};font-family:'Cinzel',serif">선택됨 ✓</span>`:`<button onclick="selectBeastLineage('${l.id}')" style="padding:4px 10px;background:#0e0018;border:1px solid ${l.color}55;color:${l.color};font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">선택</button>`}
          </div>
          <div style="font-size:8px;color:#5040a0;line-height:1.5">${esc(l.lore.slice(0,60))}...</div>
          <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:3px">
            ${Object.entries(l.baseBonus).map(([k,v])=>`<span style="padding:1px 5px;background:${l.color}22;border:1px solid ${l.color}44;color:${l.color};font-size:7px;border-radius:2px">${k.toUpperCase()} +${v}</span>`).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- ④ 최근 기록 -->
    ${(bl.history||[]).length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 혈통 기록 ──</div>
      ${[...bl.history].reverse().slice(0,8).map(h=>`
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d0018;font-size:9px">
          <span style="color:#a080c0">${h.event}</span>
          <span style="flex:1;color:#6040a0">${esc(h.reason||h.lineage||'')}</span>
          ${h.amount?`<span style="color:${color};font-family:'Cinzel',serif">+${h.amount}</span>`:''}
          <span style="color:#3a2060;font-size:8px">${h.at||''}</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderBeastLineagePanel = renderBeastLineagePanel;

window.renderBeastLineagePanel    = renderBeastLineagePanel;

window.selectBeastLineage         = selectBeastLineage;

window.gainLineagePurity          = gainLineagePurity;

window.applyBeastLineageStats     = applyBeastLineageStats;

window.detectBeastLineageFromText = detectBeastLineageFromText;

window.loadBeastLineage           = loadBeastLineage;

window.clearBeastLineage          = clearBeastLineage;

if(typeof renderTimeHeader==='function')    window.renderTimeHeader    = renderTimeHeader;

if(typeof openTimePanel==='function')       window.openTimePanel       = openTimePanel;

if(typeof _renderTimePanel==='function')    window._renderTimePanel    = _renderTimePanel;

if(typeof advanceTimePhase==='function')    window.advanceTimePhase    = advanceTimePhase;

if(typeof advanceTimeByPhases==='function') window.advanceTimeByPhases = advanceTimeByPhases;

if(typeof resetGameTime==='function')       window.resetGameTime       = resetGameTime;

if(typeof getCurrentTimePhase==='function') window.getCurrentTimePhase = getCurrentTimePhase;

if(typeof getSeasonEffect==='function')     window.getSeasonEffect     = getSeasonEffect;

if(typeof isShopOpen==='function')          window.isShopOpen          = isShopOpen;

export const FG_KEY = 'tf-faction-gauge';

export function loadFactionGauge(){ try{ return JSON.parse(lsGet(FG_KEY)||'{"gauges":{},"history":[],"dominance":null,"loyaltyActs":0,"betrayalRisk":0}'); }catch(e){ return {gauges:{},history:[],dominance:null,loyaltyActs:0,betrayalRisk:0}; } }
window.loadFactionGauge = loadFactionGauge;

export function saveFactionGauge(d){ try{ lsSet(FG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFactionGauge = saveFactionGauge;

export function clearFactionGauge(){ lsDel(FG_KEY); }
window.clearFactionGauge = clearFactionGauge;

export function getFGStage(score){
  return FG_STAGES.find(s => score >= s.min && (score < s.max || s.max === 100)) || FG_STAGES[2];
}
window.getFGStage = getFGStage;

export function getDominantFaction(){
  const fg = loadFactionGauge();
  const factions = getCurrentFactions ? getCurrentFactions() : {};
  const entries = Object.entries(fg.gauges||{}).filter(([k])=>factions[k]);
  if(!entries.length) return null;
  const top = entries.sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0];
  if(Math.abs(top[1]) < 20) return null; // 중립 수준이면 지배 파벌 없음
  const fName = top[0];
  const fDef = factions[fName]||{};
  const stage = getFGStage(top[1]);
  return { name:fName, score:top[1], stage, faction:fDef };
}
window.getDominantFaction = getDominantFaction;

export function changeFactionGauge(factionName, delta, reason){
  if(!factionName || delta === 0) return;
  const fg = loadFactionGauge();
  const factions = getCurrentFactions ? getCurrentFactions() : {};
  if(!factions[factionName] && !fg.gauges[factionName]) return; // 존재하지 않는 파벌

  const prev = fg.gauges[factionName] || 0;
  const prevStage = getFGStage(prev);
  fg.gauges[factionName] = Math.max(-100, Math.min(100, prev + delta));
  const newScore = fg.gauges[factionName];
  const newStage = getFGStage(newScore);

  // 반대 파벌 자동 감소 (라이벌 관계면 -절반)
  const fDef = factions[factionName];
  if(delta > 0 && fDef?.rivals){
    fDef.rivals.forEach(rival => {
      if(factions[rival] || fg.gauges[rival] !== undefined){
        fg.gauges[rival] = Math.max(-100, Math.min(100, (fg.gauges[rival]||0) - Math.round(delta*0.4)));
      }
    });
  }

  // 기록
  fg.history = fg.history || [];
  fg.history.push({
    faction: factionName, icon: fDef?.icon||'⚜️',
    delta, reason: reason||'',
    score: newScore,
    at: new Date().toISOString().slice(0,16)
  });
  

  // 배신 위험도 (충신이었다가 급락하면 상승)
  if(prev >= 60 && newScore < 20) fg.betrayalRisk = Math.min(100, (fg.betrayalRisk||0) + 30);

  saveFactionGauge(fg);

  // 단계 변화 토스트
  if(newStage.id !== prevStage.id){
    toastHTML(`${esc(fDef?.icon||'⚜️')} ${esc(factionName)} 파벌 기울기: ${esc(prevStage.label)} → ${esc(newStage.label)} ${typeof getEntityIconHTML==='function'?getEntityIconHTML(newStage,{size:14}):(newStage.icon)}`, 4000);
  }

  // AI 컨텍스트 주입
  if(S._nextInjectedContext !== undefined){
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      ` [⚖️ 파벌 기울기 변화: ${fDef?.icon||''}${factionName} ${delta>0?'+':''}${delta} → ${newStage.icon} ${newStage.label}(${newScore}) ${reason?'사유: '+reason:''}]`;
  }

  applyFactionGaugeStats();
  return fg;
}
window.changeFactionGauge = changeFactionGauge;

export function applyFactionGaugeStats(){
  if(!S || !S.stats) return;
  const fg = loadFactionGauge();
  const dom = getDominantFaction();

  // 이전 보너스 제거
  const prev = S._factionGaugeBonus || {};
  Object.entries(prev).forEach(([k,v])=>{ if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });

  const newBonus = {};
  if(dom && dom.stage){
    const bonuses = dom.stage.statBonus || {};
    Object.entries(bonuses).forEach(([k,v])=>{
      S.stats[k] = Math.min(999, (S.stats[k]||50)+v);
      newBonus[k] = v;
    });
    const penalties = dom.stage.statPenalty || {};
    Object.entries(penalties).forEach(([k,v])=>{ S.stats[k]=Math.max(0,(S.stats[k]||50)+v); });
  }
  S._factionGaugeBonus = newBonus;
  if(typeof saveStats==='function') saveStats(S.stats);
  _markDirty('stats'); if(typeof saveStatsSplit==='function') saveStatsSplit();
  if(typeof window.updateHeader==='function') window.updateHeader();
}
window.applyFactionGaugeStats = applyFactionGaugeStats;

export function detectFactionGaugeFromText(text){
  if(!text) return;
  const factions = getCurrentFactions ? getCurrentFactions() : {};
  const fNames = Object.keys(factions);
  if(!fNames.length) return;

  const lc = text.toLowerCase();
  // 파벌 지지/충성 키워드
  const supportKw  = ['충성','지지','편','동맹','협력','도움','신뢰','따르','위해 싸','파벌 지지'];
  const opposeKw   = ['반대','배신','거부','적대','반역','음모','방해','적으로'];
  // 각 파벌 이름이 텍스트에 등장하는지 확인
  fNames.forEach(fname => {
    if(!text.includes(fname)) return;
    const isSupport = supportKw.some(k=>lc.includes(k)) && Math.random()<0.45;
    const isOppose  = opposeKw.some(k=>lc.includes(k))  && Math.random()<0.4;
    if(isSupport && !isOppose) changeFactionGauge(fname, 3, 'AI 서사 감지');
    if(isOppose  && !isSupport) changeFactionGauge(fname, -3, 'AI 서사 감지');
  });
}
window.detectFactionGaugeFromText = detectFactionGaugeFromText;

export function renderFactionGaugePanel(){
  const pb = document.getElementById('pb-faction-gauge');
  if(!pb) return;
  const fg = loadFactionGauge();
  const factions = getCurrentFactions ? getCurrentFactions() : {};
  const gauges = fg.gauges || {};
  const fNames = Object.keys(factions);
  const dom = getDominantFaction();
  const repColor=(r)=>r>=60?'#c8a030':r>=20?'#50a060':r>=-20?'#a09060':r>=-60?'#d06030':'#e03030';
  const esc2=(s)=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // 파벌 게이지 바 HTML
  function gaugeBar(score){
    const pct = Math.round((score+100)/2); // -100~+100 → 0~100%
    const col = repColor(score);
    const leftPct = score<0 ? Math.round((-score)/2) : 0;
    const barPct  = Math.abs(score)/2;
    return `
      <div style="position:relative;height:6px;background:#1a1005;border-radius:3px;margin:4px 0;overflow:hidden">
        <div style="position:absolute;top:0;height:100%;width:50%;left:50%;border-left:1px solid #3a2a0a"></div>
        ${score>=0
          ? `<div style="position:absolute;top:0;left:50%;height:100%;width:${barPct}%;background:${col};border-radius:0 3px 3px 0;transition:width .5s"></div>`
          : `<div style="position:absolute;top:0;right:50%;height:100%;width:${barPct}%;background:${col};border-radius:3px 0 0 3px;transition:width .5s"></div>`
        }
      </div>`;
  }

  pb.innerHTML = `
    <!-- 지배 파벌 요약 -->
    ${dom ? `
    <div style="padding:10px 12px;background:#0d0a18;border:1px solid ${dom.stage.color}55;margin-bottom:10px;border-radius:2px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="font-size:20px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(dom.faction,{size:20}):(dom.faction.icon||"⚜️")}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:${dom.stage.color}">${dom.name}</div>
          <div style="font-size:9px;color:var(--dim)">지배적 파벌 기울기</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(dom.stage,{size:14}):(dom.stage.icon)}</div>
          <div style="font-family:'Cinzel',serif;font-size:9px;color:${dom.stage.color}">${dom.stage.label}</div>
        </div>
      </div>
      <div style="font-size:9px;color:var(--dim);line-height:1.5">${esc2(dom.stage.desc)}</div>
      ${Object.keys(dom.stage.statBonus||{}).length ? `
      <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:3px">
        ${Object.entries(dom.stage.statBonus).map(([k,v])=>`<span style="padding:1px 5px;background:${dom.stage.color}22;border:1px solid ${dom.stage.color}44;color:${dom.stage.color};font-size:7px;border-radius:2px">${k.toUpperCase()} +${v}</span>`).join('')}
      </div>` : ''}
    </div>` : `
    <div style="padding:10px 12px;background:#0d0800;border:1px dashed var(--border);margin-bottom:10px;text-align:center;font-size:10px;color:var(--dim)">
      ⚖️ 아직 어느 파벌에도 기울지 않은 중립 상태입니다.
    </div>`}

    <!-- 파벌 게이지 목록 -->
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:7px">── 파벌별 기울기 ──</div>

    ${fNames.length === 0 ? `<div style="font-size:9px;color:var(--dim);text-align:center;padding:16px">현재 시나리오의 세력 정보가 없습니다.</div>` :
      fNames.map(fname=>{
        const f = factions[fname]||{};
        const score = gauges[fname]||0;
        const st = getFGStage(score);
        return `
        <div style="border:1px solid var(--border);background:var(--bg-input);margin-bottom:6px;padding:9px 11px;border-left:3px solid ${f.color||st.color}">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
            <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(f,{size:18}):(f.icon||"⚜️")}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold)">${esc2(fname)}</div>
              <div style="font-size:9px;color:var(--dim)">${esc2(f.desc||'').slice(0,40)}${(f.desc||'').length>40?'...':''}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:11px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(st,{size:11}):(st.icon)}</div>
              <div style="font-size:8px;color:${st.color};font-family:'Cinzel',serif">${st.label}</div>
              <div style="font-size:9px;color:${st.color}">${score>0?'+':''}${score}</div>
            </div>
          </div>
          ${gaugeBar(score)}
          <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--dim);margin-bottom:6px">
            <span>반대 -100</span><span>중립 0</span><span>충신 +100</span>
          </div>
          <!-- 수동 조정 버튼 -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:3px">
            <button onclick="changeFactionGauge('${fname.replace(/'/g,"\\'")}', -10, '수동 조정');renderFactionGaugePanel()"
              style="padding:4px 0;background:#140000;border:1px solid #503030;color:#e05050;font-size:8px;cursor:pointer;font-family:'Cinzel',serif">−10</button>
            <button onclick="changeFactionGauge('${fname.replace(/'/g,"\\'")}', -3, '수동 조정');renderFactionGaugePanel()"
              style="padding:4px 0;background:#0d0000;border:1px solid #301818;color:#a04040;font-size:8px;cursor:pointer;font-family:'Cinzel',serif">−3</button>
            <button onclick="changeFactionGauge('${fname.replace(/'/g,"\\'")}', 3, '수동 조정');renderFactionGaugePanel()"
              style="padding:4px 0;background:#000d00;border:1px solid #183018;color:#40a040;font-size:8px;cursor:pointer;font-family:'Cinzel',serif">+3</button>
            <button onclick="changeFactionGauge('${fname.replace(/'/g,"\\'")}', 10, '수동 조정');renderFactionGaugePanel()"
              style="padding:4px 0;background:#001400;border:1px solid #305030;color:#50c050;font-size:8px;cursor:pointer;font-family:'Cinzel',serif">+10</button>
          </div>
        </div>`;
      }).join('')
    }

    <!-- 정치 행동 버튼들 -->
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin:10px 0 6px">── 정치적 행동 ──</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:10px">
      ${[
        {label:'🍷 왕실 연회 참석',   ftype:'royal',     delta:8,  hint:'왕실파 +8'},
        {label:'📜 마법사 길드 협력', ftype:'mages',     delta:8,  hint:'마법사 길드 +8'},
        {label:'⚔️ 기사단 임무 수행', ftype:'knights',   delta:8,  hint:'기사단 +8'},
        {label:'🕵️ 비밀 첩보 활동',  ftype:'guild',     delta:8,  hint:'도적 길드 +8'},
        {label:'🏛️ 공개 연설',       ftype:'_all_pos',  delta:5,  hint:'모든 파벌 +5'},
        {label:'💰 부유층 지원',      ftype:'merchant',  delta:10, hint:'상인 연합 +10'},
      ].map(a=>{
        const factionMap = {royal:'왕실',mages:'마법사 길드',knights:'기사단',guild:'도적 길드',merchant:'상인 연합'};
        const targetFaction = factionMap[a.ftype];
        const hasFaction = targetFaction ? !!factions[targetFaction] : true;
        return `
        <button onclick="${a.ftype==='_all_pos'
          ? `Object.keys(getCurrentFactions?getCurrentFactions():{}).forEach(fn=>changeFactionGauge(fn,${a.delta},'정치 행동'));renderFactionGaugePanel()`
          : `changeFactionGauge('${(targetFaction||'').replace(/'/g,"\\'")}',${a.delta},'정치 행동');renderFactionGaugePanel()`
        }"
          style="padding:7px 5px;background:var(--bg-screen);border:1px solid var(--border);color:var(--gold);font-size:9px;cursor:pointer;font-family:'Cinzel',serif;text-align:left;line-height:1.4;${!hasFaction?'opacity:.4;cursor:not-allowed':''}">
          ${a.label}<br><span style="font-size:8px;color:var(--dim)">${a.hint}</span>
        </button>`;
      }).join('')}
    </div>

    <!-- 최근 기록 -->
    ${(fg.history||[]).length ? `
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:6px">── 기울기 변화 기록 ──</div>
    ${[...fg.history].reverse().slice(0,10).map(h=>{
      const st=getFGStage(h.score||0);
      return `<div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid var(--border);font-size:9px">
        <span style="font-size:11px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:11}):(h.icon||"⚜️")}</span>
        <span style="flex:1;color:var(--gold)">${esc2(h.faction)}</span>
        <span style="color:${h.delta>=0?'#50c050':'#e05050'}">${h.delta>=0?'+':''}${h.delta}</span>
        <span style="color:${st.color};font-family:'Cinzel',serif;font-size:8px">${st.label}</span>
        <span style="color:var(--dim);font-size:8px">${h.reason||''}</span>
      </div>`;
    }).join('')}` : ''}

    <div style="margin-top:8px;padding:7px;background:var(--bg-screen);border:1px dashed var(--border);font-size:9px;color:var(--dim);line-height:1.6">
      💡 파벌 기울기는 AI 서사에 자동 반영됩니다. 충신이 되면 해당 파벌 NPC에게 특별 대우를 받고, 라이벌 파벌의 NPC는 경계합니다. 수치가 변화할 때마다 캐릭터의 정치적 포지션이 바뀝니다.
    </div>
  `;
}
window.renderFactionGaugePanel = renderFactionGaugePanel;

window.renderFactionGaugePanel = renderFactionGaugePanel;

window.changeFactionGauge      = changeFactionGauge;

window.getDominantFaction      = getDominantFaction;

window.applyFactionGaugeStats  = applyFactionGaugeStats;

window.detectFactionGaugeFromText = detectFactionGaugeFromText;

window.loadFactionGauge        = loadFactionGauge;

window.clearFactionGauge       = clearFactionGauge;

// [버그 수정] 이 자리에 있던 hookFactionGaugeDetect IIFE는 애초에 존재하지도
// 않는 window.onAIResponse/window.processAIText를 먼저 찾고(둘 다 이 코드베이스
// 어디에도 정의된 적 없음), 없으면 window.sendMsg를 감싸는 패치로 폴백했다.
// 그런데 sendMsg()는 quest/086 안에서 항상 로컬 바인딩으로 직접 호출되므로
// window.sendMsg 재할당은 도달하지 않는다 — 다른 죽은 훅들과 동일한 원인.
// detectFactionGaugeFromText(text)는 quest/086의 sendMsg() 후처리 블록(AI
// 응답 렌더링 직후, checkHomelandNpcReunion 등과 같은 자리)에 네이티브로
// 연결했다.

(function hookFactionGaugeToPrompt(){
  const tryPatch = () => {
    if(window._fgPromptPatched) return;
    // [버그 수정] window.buildSystemPrompt/window.buildPrompt는 이 코드베이스에
    // 실제로 존재한 적이 없는 함수명이라(전부 buildLightSystem으로 통합됨)
    // 이 훅은 fnName이 항상 null이라 영원히 setTimeout만 반복하며 절대
    // 패치되지 않았다 — 실제 BLS 빌더 이름인 buildLightSystem으로 교체.
    const fnName = typeof window.buildLightSystem==='function' ? 'buildLightSystem'
                 : typeof window.buildSystemPrompt==='function' ? 'buildSystemPrompt'
                 : typeof window.buildPrompt       ==='function' ? 'buildPrompt' : null;
    if(!fnName){ setTimeout(tryPatch, 2000); return; }
    window._fgPromptPatched = true;
    const _orig = window[fnName];
    window[fnName] = function(...args){
      const result = _orig.apply(this, args);
      const bls = window.getFactionGaugeBLS();
      if(!bls) return result;
      if(typeof result === 'string') return result + '\n' + bls;
      return result;
    };
  };
  setTimeout(tryPatch, 2500);
})();

// [버그 수정] 이 자리에 있던 injectFactionGaugeContext IIFE는 window.sendMsg를
// 감싸(다른 죽은 훅들과 같은 원인으로 어차피 죽어있었음) S._fgContext에
// getFactionGaugeBLS() 결과를 저장했지만, S._fgContext를 실제로 읽는 코드가
// 코드베이스 전체에 단 한 곳도 없었다 — 즉 살려도 아무도 안 읽는 죽은 값을
// 쓰기만 하는 완전한 no-op. 파벌 BLS를 실제 AI 프롬프트에 넣는 일은 바로 위
// hookFactionGaugeToPrompt(buildLightSystem 훅)가 이미 담당하므로 삭제.

// [버그 수정] 이 자리에 있던 hookFGClearOnNewGame은 window.newGame이라는
// 함수 자체가 이 코드베이스 어디에도 정의된 적이 없어(진짜 "새 게임"
// 진입점은 core/084의 _doNewGame이다) typeof 가드가 단 한 번도 통과하지
// 못했다 — clearFactionGauge()가 지금까지 한 번도 호출된 적이 없어서
// 새 캐릭터를 만들어도 이전 캐릭터의 파벌 게이지가 그대로 남아있던
// 버그였다. core/084의 _doNewGame() 안에 네이티브로 옮겨 연결했다.

export const DEMESNE_KEY = 'tf-demesne';

export function _defaultDemesne(){
  return {
    name:         '이름 없는 영지',
    tier:         1,
    tax:          50,
    prosperity:   50,
    defense:      50,
    loyalty:      50,
    population:   500,
    popStage:     0,         // ★v4: 도시 단계 0~4
    popPeak:      500,       // ★v4: 역대 최고 인구
    popGrowthLog: [],        // ★v4: 성장 기록 [{turn,pop,stage}] 최대 20
    buildings:    {},
    suspendedBuildings: [],
    events:       [],
    history:      [],
    policies:     {},
    vassals:      [],
    note:         '',
    lastTurn:     0,
    established:  false,
    totalIncome:  0,
    activeTab:    'buildings',
    season:       0,
    seasonTurn:   0,
    tradePartners:[],
    achievements: [],
    upkeepDebt:   0,
    vassalBondCooldown: {},
  };
}
window._defaultDemesne = _defaultDemesne;

export function loadDemesne(){ try{ return JSON.parse(lsGet(DEMESNE_KEY)||'null') || _defaultDemesne(); }catch(e){ return _defaultDemesne(); } }
window.loadDemesne = loadDemesne;

export function saveDemesne(d){ try{ lsSet(DEMESNE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveDemesne = saveDemesne;

export function clearDemesne(){ lsDel(DEMESNE_KEY); }
window.clearDemesne = clearDemesne;

export function isDemesneActive(){
  return DEMESNE_UNLOCK_CONDITIONS.some(cond=>{ try{ return cond.check(); }catch(e){ return false; } });
}
window.isDemesneActive = isDemesneActive;

export const DEMESNE_NOTIFIED_KEY = 'tf-demesne-notified';

export function checkDemesneUnlockTrigger(){
  if(lsGet(DEMESNE_NOTIFIED_KEY)) return; // 이미 알림 발송
  if(!isDemesneActive()) return;
  // 어떤 조건으로 활성화됐는지 찾기
  const triggered = DEMESNE_UNLOCK_CONDITIONS.find(cond=>{ try{ return cond.check(); }catch(e){ return false; } });
  if(!triggered) return;
  lsSet(DEMESNE_NOTIFIED_KEY, '1');
  // 팝업 연출
  showDemesneUnlockPopup(triggered);
}
window.checkDemesneUnlockTrigger = checkDemesneUnlockTrigger;

window.checkDemesneUnlockTrigger = checkDemesneUnlockTrigger;

export function showDemesneUnlockPopup(condition){
  const isLm = document.body.classList.contains('light-mode');
  const bg  = isLm ? '#fdf5e8' : '#050200';
  const brd = '#c8a96e';
  const dim = isLm ? '#7a5a30' : 'var(--dim)';

  const overlay = document.createElement('div');
  overlay.id = 'demesne-unlock-popup';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:350;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;animation:fadeIn .4s ease';
  overlay.innerHTML = `
  <div style="width:88%;max-width:380px;background:${bg};border:2px solid ${brd};font-family:'Cinzel',serif;overflow:hidden;border-radius:3px">
    <!-- 헤더 -->
    <div style="padding:20px 20px 14px;text-align:center;background:linear-gradient(135deg,#1a1000,#2a1800);border-bottom:1px solid ${brd}">
      <div style="font-size:48px;margin-bottom:10px">🏰</div>
      <div style="font-size:10px;color:#8a7050;letter-spacing:3px;margin-bottom:6px">DOMAIN UNLOCKED</div>
      <div style="font-size:17px;color:${brd};letter-spacing:2px">영지 경영 해금!</div>
    </div>
    <!-- 내용 -->
    <div style="padding:16px 20px">
      <div style="font-size:12px;color:${dim};line-height:1.8;margin-bottom:14px;text-align:center">
        <span style="color:${brd}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(condition,{size:16}):(condition.icon)} ${condition.label}</span> 조건으로<br>
        이제 영지를 경영할 수 있습니다.<br>
        땅을 개척하고, 백성을 다스리고,<br>세력을 키워나가세요.
      </div>
      <div style="background:${isLm?'#f5e8d0':'#0d0800'};border:1px solid ${isLm?'#c8a860':'#3a2a0a'};padding:10px 12px;border-radius:2px;margin-bottom:14px">
        <div style="font-size:10px;color:${brd};margin-bottom:6px;letter-spacing:1px">해금 기능</div>
        <div style="font-size:11px;color:${dim};line-height:1.7">
          🏗️ 건물 건설 (농장·병영·시장 등)<br>
          ⚖️ 정책 설정 (세율·군사·외교)<br>
          👥 봉신 등록 및 관리<br>
          📊 인구·번영·방어도 경영<br>
          🎲 영지 이벤트 처리
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="document.getElementById('demesne-unlock-popup').remove();openP('demesne');renderDemesnePanel();"
          style="flex:1;padding:11px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid ${brd};color:${brd};font-family:'Cinzel',serif;font-size:11px;cursor:pointer;letter-spacing:1px;border-radius:2px">
          🏰 지금 열기
        </button>
        <button onclick="document.getElementById('demesne-unlock-popup').remove();"
          style="padding:11px 14px;background:${isLm?'#e8d8b8':'#0d0800'};border:1px solid ${isLm?'#c8a860':'var(--border)'};color:${dim};font-family:'Cinzel',serif;font-size:11px;cursor:pointer;border-radius:2px">
          나중에
        </button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  // AI 서사에도 반영
  setTimeout(()=>{
    S._nextInjectedContext = (S._nextInjectedContext||'') +
      ` [🏰 영지 경영 해금: ${condition.label}] 이 캐릭터는 이제 영지·거점·세력을 직접 다스릴 수 있는 위치에 올랐다. 서사에서 영지 경영이나 세력 확장에 관련된 선택지를 자연스럽게 제시하라.`;
  }, 500);
}
window.showDemesneUnlockPopup = showDemesneUnlockPopup;

export const DEMESNE_TIERS = [
  { tier:1, name:'마을',   icon:'🏘️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 L4 12 L10 7 L16 12 L16 20 Z" stroke-linejoin="round"/></svg>`, color:'#8a7a5a', maxBuildings:3,  taxBase:5,  popBase:500   },
  { tier:2, name:'소영지', icon:'🏡', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 L4 11 L9 7 L14 11 L14 20 Z" stroke-linejoin="round"/><path d="M14 20 L14 14 L19 11 L19 20 Z" stroke-linejoin="round"/></svg>`, color:'#a08040', maxBuildings:5,  taxBase:10, popBase:2000  },
  { tier:3, name:'남작령', icon:'🏰', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21 L4 9 L6 9 L6 7 L8 7 L8 9 L10.5 9 L10.5 6 L13.5 6 L13.5 9 L16 9 L16 7 L18 7 L18 9 L20 9 L20 21 Z" stroke-linejoin="round"/><path d="M12 21 L12 15 L15 15 L15 21"/></svg>`, color:'#b89050', maxBuildings:8,  taxBase:18, popBase:6000  },
  { tier:4, name:'백작령', icon:'🏯', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14 5.5 L10 5.5 Z" stroke-linejoin="round"/><path d="M6 8 L18 8 L18 21 L6 21 Z" stroke-linejoin="round"/><path d="M3 11 L6 8 L6 14 L3 14 Z" stroke-linejoin="round"/><path d="M21 11 L18 8 L18 14 L21 14 Z" stroke-linejoin="round"/><path d="M10 21 L10 16 L14 16 L14 21"/></svg>`, color:'#c8a060', maxBuildings:12, taxBase:30, popBase:20000 },
  { tier:5, name:'공작령', icon:'👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></svg>`, color:'#e0b840', maxBuildings:20, taxBase:50, popBase:80000 },
];

export const getDemesneTier = (t) => DEMESNE_TIERS.find(d=>d.tier===t)||DEMESNE_TIERS[0];

export const POP_STAGES = [
  { stage:0, name:'마을',     icon:'🏘️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 L4 12 L10 7 L16 12 L16 20 Z" stroke-linejoin="round"/></svg>`, color:'#8a7a5a', threshold:0,
    taxBonus:0,  defBonus:0,
    desc:'작은 마을. 영민들이 소박하게 살아간다.',
    aiHint:'작은 마을 규모의 영지다. 사람들이 서로 얼굴을 알고 지낸다.',
    unlockBuildings:[] },
  { stage:1, name:'소도시',   icon:'🏙️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 L4 11 L9 7 L14 11 L14 20 Z" stroke-linejoin="round"/><path d="M14 20 L14 14 L19 11 L19 20 Z" stroke-linejoin="round"/></svg>`, color:'#a08040', threshold:2000,
    taxBonus:5,  defBonus:3,
    desc:'상업이 싹트고 외지인이 찾아오기 시작했다.',
    aiHint:'소도시로 성장한 영지다. 시장에 활기가 돌고 여행자들이 드나든다.',
    unlockBuildings:['inn'] },
  { stage:2, name:'도시',     icon:'🌆', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20 L3 9 L7 9 L7 20 M10 20 L10 5 L14 5 L14 20 M17 20 L17 11 L21 11 L21 20"/></svg>`, color:'#b89050', threshold:8000,
    taxBonus:12, defBonus:8,
    desc:'도시의 면모를 갖췄다. 각종 길드와 직인이 모인다.',
    aiHint:'번듯한 도시다. 길드 깃발이 곳곳에 걸리고 건물들이 빼곡하다.',
    unlockBuildings:['guild_hall'] },
  { stage:3, name:'대도시',   icon:'🌇', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L2 8 L5 8 L5 20 M8 20 L8 4 L11 4 L11 20 M14 20 L14 10 L17 10 L17 20 M19 20 L19 6 L22 6 L22 20"/></svg>`, color:'#c8a060', threshold:25000,
    taxBonus:22, defBonus:15,
    desc:'왕국에서도 손꼽히는 대도시. 각지에서 인재가 몰린다.',
    aiHint:'대도시다. 왕국 각지의 상인·학자·용병이 이곳을 거점으로 삼는다.',
    unlockBuildings:['academy'] },
  { stage:4, name:'왕도급',   icon:'👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></svg>`, color:'#e0b840', threshold:80000,
    taxBonus:35, defBonus:25,
    desc:'왕도에 필적하는 거대 도시. 왕국의 중심으로 불린다.',
    aiHint:'왕도에 필적하는 거대 도시다. 이 도시의 이름이 왕국 전역에 울려퍼진다.',
    unlockBuildings:['colosseum'] },
];

export const getPopStage = (s) => POP_STAGES[Math.min(s||0, POP_STAGES.length-1)];

export const getPopStageByPop = (pop) => {
  let stage = POP_STAGES[0];
  for(const s of POP_STAGES){ if(pop >= s.threshold) stage = s; }
  return stage;
};

[
  { id:'farm',     name:'농장',     icon:'🌾', cost:200,  upkeep:5,  maxLevel:3, stageReq:0,
    effect:(lv)=>({prosperity:lv*8,loyalty:lv*5,tax:lv*3}),
    aiHint:(lv)=>`${lv}단계 농장이 풍부한 식량을 생산한다.` },
  { id:'barracks', name:'병영',     icon:'⚔️', cost:300,  upkeep:10, maxLevel:3, stageReq:0,
    effect:(lv)=>({defense:lv*12,loyalty:lv*3}),
    aiHint:(lv)=>`${lv}단계 병영에서 정예 병사가 훈련 중이다.` },
  { id:'market',   name:'시장',     icon:'🏪', cost:250,  upkeep:8,  maxLevel:3, stageReq:0,
    effect:(lv)=>({tax:lv*10,prosperity:lv*7}),
    aiHint:(lv)=>`${lv}단계 시장이 활발히 운영 중이다.` },
  { id:'wall',     name:'성벽',     icon:'🧱', cost:400,  upkeep:6,  maxLevel:3, stageReq:0,
    effect:(lv)=>({defense:lv*15,loyalty:lv*4}),
    aiHint:(lv)=>`${lv}단계 성벽이 영지를 감싸고 있다.` },
  { id:'temple',   name:'신전',     icon:'⛪', cost:300,  upkeep:7,  maxLevel:2, stageReq:0,
    effect:(lv)=>({loyalty:lv*10,prosperity:lv*6}),
    aiHint:(lv)=>`${lv}단계 신전에서 영민들의 신앙심이 깊어지고 있다.` },
  { id:'library',  name:'도서관',   icon:'📚', cost:350,  upkeep:8,  maxLevel:2, stageReq:0,
    effect:(lv)=>({tax:lv*6,prosperity:lv*9}),
    aiHint:(lv)=>`${lv}단계 도서관에서 학자들이 연구한다.` },
  { id:'dungeon',  name:'지하감옥', icon:'⛓️', cost:200,  upkeep:4,  maxLevel:2, stageReq:0,
    effect:(lv)=>({defense:lv*6,tax:lv*5,loyalty:-(lv*4)}),
    aiHint:(lv)=>`지하감옥이 범죄를 억제한다.` },
  { id:'harbor',   name:'항구',     icon:'⚓', cost:450,  upkeep:12, maxLevel:2, stageReq:0,
    effect:(lv)=>({tax:lv*14,prosperity:lv*10}),
    aiHint:(lv)=>`${lv}단계 항구를 통해 해상 무역이 활발하다.` },
  { id:'tower',    name:'마법탑',   icon:'🗼', cost:500,  upkeep:15, maxLevel:2, stageReq:0,
    effect:(lv)=>({defense:lv*10,prosperity:lv*8}),
    aiHint:(lv)=>`${lv}단계 마법탑에서 마법사들이 영지를 지키고 있다.` },
  { id:'granary',  name:'곡물창고', icon:'🏚️', cost:180,  upkeep:3,  maxLevel:3, stageReq:0,
    effect:(lv)=>({loyalty:lv*6,prosperity:lv*5,defense:lv*2}),
    aiHint:(lv)=>`${lv}단계 곡물창고가 기근을 대비한다.` },
  ...Object.values(STAGE_BUILDINGS),
  // ── 🩸 혈통 건물 (뱀파이어·지배형 종족 전용) ──────────────
  { id:'blood_altar',    tier:1, name:'흡혈 제단',    icon:'🩸⛧', cost:400, upkeep:10, maxLevel:3,
    reqFlag:'thrall_lord',
    effect:(lv)=>({ tax:lv*3, loyalty:lv*5 }),
    aiHint:(lv)=>`${lv}단계 흡혈 제단에서 붉은 기운이 피어오른다. 권속들이 이 앞에서 경배를 드린다.`,
    desc:'매 턴 혈통 포인트를 생성. 권속 충성도 강화.' },
  { id:'blood_prison',   tier:1, name:'지하 감금소',  icon:'⛓️',  cost:300, upkeep:8,  maxLevel:2,
    reqFlag:'thrall_lord',
    effect:(lv)=>({ defense:lv*8, prosperity:lv*2 }),
    aiHint:(lv)=>`${lv}단계 지하 감금소. 어둠 속에서 사슬 소리가 들린다.`,
    desc:'포로 감금·권속화 시설. 권속 수용 한도 증가.' },
  { id:'thrall_barracks',tier:2, name:'권속 병영',    icon:'⚔️💀', cost:500, upkeep:12, maxLevel:3,
    reqFlag:'thrall_lord',
    effect:(lv)=>({ defense:lv*12, tax:lv*5 }),
    aiHint:(lv)=>`${lv}단계 권속 병영. 혈기사들이 새벽부터 훈련한다.`,
    desc:'권속 훈련. 등급 상승 속도 증가.' },
  { id:'night_sanctum',  tier:3, name:'밤의 성소',    icon:'🌙🏰', cost:800, upkeep:20, maxLevel:2,
    reqFlag:'thrall_lord',
    effect:(lv)=>({ loyalty:lv*15, prosperity:lv*10 }),
    aiHint:(lv)=>`${lv}단계 밤의 성소. 영원한 어둠이 깔린다.`,
    desc:'낮에도 햇빛 차단. 야간 능력치 상시 발동.' },
  { id:'blood_tower',    tier:4, name:'혈통 탑',       icon:'🗼🩸', cost:1000, upkeep:25, maxLevel:1,
    reqFlag:'thrall_lord',
    effect:(lv)=>({ tax:lv*20, defense:lv*15, loyalty:lv*10 }),
    aiHint:(lv)=>`혈통 탑의 첨탑에서 붉은 빛이 흘러내린다.`,
    desc:'주변 도시 혈통 영향력 방사. 권속 텔레파시 연결.' }
].forEach(b => { ALL_BUILDINGS_MAP[b.id] = b; });

export const DEMESNE_BUILDINGS = Object.values(ALL_BUILDINGS_MAP);

export const getDemesneBuilding = (id) => ALL_BUILDINGS_MAP[id] || null;

export const getDemesnePolicy = (id) => DEMESNE_POLICIES.find(p=>p.id===id);

export const getDemesneSeason = (s) => DEMESNE_SEASONS[s%4]||DEMESNE_SEASONS[0];

export const DEMESNE_EVENT_DEFS = [
  // 부정 이벤트
  { id:'famine',    name:'기근',      icon:'🌵', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6 C12 4.3 13.3 3 15 3 C15 3 15 7 15 9 C15 10 14 11 13 11" /><path d="M12 12 C12 12 8 12 8 9 C8 7.5 8 6 8 6" stroke-width="1.2"/><path d="M9 21 L15 21" stroke-width="1.6"/></svg>`, color:'#c05a20', positive:false,
    desc:'흉작으로 식량이 부족해졌다.',
    trigger:(res)=>res.prosperity<30, triggerChance:0.25,
    effect:{loyalty:-20,prosperity:-15}, popEffect:-0.08,
    actions:[
      {id:'relief',     label:'구호 물자 지원',  cost:200, resolve:{loyalty:+25,prosperity:+10}},
      {id:'ignore',     label:'방관',            cost:0,   resolve:{loyalty:-30,prosperity:-10}, popEffect:-0.05},
    ]},
  { id:'revolt',    name:'소요',      icon:'🗡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></svg>`, color:'#e03030', positive:false,
    desc:'불만이 쌓인 영민들이 소요를 일으켰다.',
    trigger:(res)=>res.loyalty<25, triggerChance:0.30,
    effect:{defense:-15,tax:-10}, popEffect:-0.04,
    actions:[
      {id:'negotiate',  label:'협상·감세',       cost:100, resolve:{loyalty:+30,tax:-5}},
      {id:'suppress',   label:'군사 진압',        cost:0,   resolve:{loyalty:-15,defense:+5}, popEffect:-0.03},
    ]},
  { id:'invasion',  name:'외적 침입', icon:'🔥', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></svg>`, color:'#c02020', positive:false,
    desc:'인근 세력이 영지를 침략했다!',
    trigger:(res)=>res.defense<35, triggerChance:0.20,
    effect:{defense:-20,prosperity:-15}, popEffect:-0.06,
    actions:[
      {id:'fight',      label:'군대 방어',        cost:0,   resolve:{defense:+10,loyalty:+10}},
      {id:'tribute',    label:'공물 납부',         cost:300, resolve:{loyalty:-5,prosperity:+5}},
    ]},
  { id:'plague',    name:'역병',      icon:'☠️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`, color:'#8040a0', positive:false,
    desc:'역병이 퍼져 영지 곳곳에서 사망자가 나온다.',
    trigger:(res)=>res.prosperity<45, triggerChance:0.18,
    effect:{loyalty:-15,prosperity:-20,tax:-10}, popEffect:-0.12,
    actions:[
      {id:'healer',     label:'치유사 파견',       cost:250, resolve:{prosperity:+20,loyalty:+10}},
      {id:'quarantine', label:'격리 조치',         cost:50,  resolve:{prosperity:+8,loyalty:-8}, popEffect:-0.04},
    ]},
  { id:'spy',       name:'첩자 발각', icon:'🕵️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="3.2"/><circle cx="17" cy="12" r="3.2"/><path d="M12.2 12 L13.8 12" /><path d="M5.8 12 L2 11" /><path d="M20.2 12 L22 11" /><path d="M9 15.2 C9 15.2 7 20 5 20" /></svg>`, color:'#8060a0', positive:false,
    desc:'적대 세력의 첩자가 영지에 침투했다.',
    trigger:(res)=>true, triggerChance:0.10,
    effect:{defense:-8,loyalty:-8},
    suppressedBy:'thieves_network',
    actions:[
      {id:'execute',    label:'공개 처형',         cost:0,   resolve:{loyalty:-10,defense:+12}},
      {id:'interrogate',label:'심문 후 추방',       cost:80,  resolve:{loyalty:+5,defense:+8}},
    ]},
  { id:'drought',   name:'가뭄',      icon:'☀️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2 L12 4.5 M12 19.5 L12 22 M2 12 L4.5 12 M19.5 12 L22 12 M5.1 5.1 L6.8 6.8 M17.2 17.2 L18.9 18.9 M18.9 5.1 L17.2 6.8 M6.8 17.2 L5.1 18.9"/></svg>`, color:'#d08020', positive:false,
    desc:'극심한 가뭄으로 농작물이 타들어 가고 있다.',
    trigger:(res)=>res.prosperity<55, triggerChance:0.15,
    effect:{prosperity:-18,loyalty:-10}, popEffect:-0.03,
    actions:[
      {id:'irrigation', label:'관개 시설 건설',   cost:180, resolve:{prosperity:+15,loyalty:+8}},
      {id:'pray',       label:'기우제 거행',       cost:50,  resolve:{loyalty:+10,prosperity:+5}},
    ]},
  { id:'bandit',    name:'산적 출몰', icon:'🔪', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 4 L6 16" /><path d="M18 4 L20 6 L8 18 L5 21 L4 20 L7 17 Z" stroke-linejoin="round"/></svg>`, color:'#a03030', positive:false,
    desc:'산적 무리가 교역로를 위협하고 있다.',
    trigger:(res)=>res.defense<50, triggerChance:0.16,
    effect:{tax:-12,prosperity:-8},
    actions:[
      {id:'hunt',       label:'토벌대 파견',       cost:120, resolve:{defense:+8,tax:+10,loyalty:+8}},
      {id:'bribe',      label:'뒷돈 협상',         cost:200, resolve:{tax:+5,loyalty:-5}},
    ]},
  // ★v4 인구 전용 이벤트
  { id:'immigration',   name:'이민자 유입', icon:'🚶', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="1.8"/><path d="M10 22 L11 15 L8 12 L9 7 L13 6 L15 9 L18 10" /><path d="M11 15 L15 17 L17 22" /><path d="M9 7 L5 9 L4 14" /></svg>`, color:'#60c080', positive:true,
    desc:'다른 지역에서 이민자들이 몰려오고 있다. 어떻게 받아들일까?',
    trigger:(res)=>res.prosperity>=55&&res.loyalty>=50, triggerChance:0.20,
    effect:{prosperity:+5}, popEffect:+0.08,
    actions:[
      {id:'welcome_all', label:'모두 받아들인다',   cost:0,   resolve:{loyalty:+10,prosperity:+8}, popEffect:+0.10},
      {id:'selective',   label:'선별 수용',         cost:100, resolve:{tax:+10,prosperity:+5},      popEffect:+0.05},
      {id:'refuse',      label:'거부한다',          cost:0,   resolve:{defense:+5,loyalty:-8},       popEffect:-0.02},
    ]},
  { id:'refugee',       name:'난민 수용', icon:'🏕️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 L12 5 L20 20 Z" stroke-linejoin="round"/><path d="M9.5 20 L12 12 L14.5 20" /></svg>`, color:'#c08040', positive:false,
    desc:'인근 분쟁 지역에서 난민들이 영지를 향해 몰려오고 있다.',
    trigger:(res)=>true, triggerChance:0.12,
    effect:{prosperity:-5,loyalty:-5},
    actions:[
      {id:'accept',      label:'인도적 수용',       cost:200, resolve:{loyalty:+15,prosperity:+5},  popEffect:+0.06},
      {id:'labor',       label:'노동력으로 활용',   cost:0,   resolve:{tax:+8,prosperity:-5},        popEffect:+0.04},
      {id:'expel',       label:'강제 추방',         cost:0,   resolve:{loyalty:-20,defense:+5},      popEffect:0},
    ]},
  { id:'overcrowding',  name:'인구 과밀', icon:'😤', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M8 10 L10 10 M14 10 L16 10" stroke-width="1.3"/><path d="M8 16 C8 16 10 14.5 12 14.5 C14 14.5 16 16 16 16" stroke-width="1.2"/></svg>`, color:'#d06060', positive:false,
    desc:'도시가 급성장하며 주거 부족과 위생 문제가 발생했다.',
    trigger:(res,d)=>(d&&d.popStage||0)>=2&&res.prosperity<60, triggerChance:0.18,
    effect:{loyalty:-12,prosperity:-10},
    actions:[
      {id:'expand',      label:'주거 지역 확장',    cost:300, resolve:{prosperity:+15,loyalty:+10}},
      {id:'regulate',    label:'인구 유입 제한',    cost:0,   resolve:{prosperity:+8,loyalty:-5},    popEffect:-0.03},
    ]},
  { id:'mass_exodus',   name:'대규모 이탈', icon:'🌊', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 C2 12 5 9 8 12 C11 15 13 12 16 12 C19 12 22 9 22 9 M2 17 C2 17 5 14 8 17 C11 20 13 17 16 17 C19 17 22 14 22 14" stroke-width="1.4"/></svg>`, color:'#e04040', positive:false,
    desc:'삶이 어렵다는 소문이 퍼지며 영민들이 영지를 떠나고 있다.',
    trigger:(res)=>res.loyalty<30&&res.prosperity<35, triggerChance:0.22,
    effect:{tax:-15,loyalty:-10}, popEffect:-0.15,
    actions:[
      {id:'incentive',   label:'정착 장려금 지급',  cost:250, resolve:{loyalty:+20,prosperity:+10}, popEffect:+0.05},
      {id:'force',       label:'이탈 강제 제지',    cost:0,   resolve:{loyalty:-20,defense:+5},      popEffect:-0.05},
    ]},
  // 긍정 이벤트
  { id:'windfall',      name:'풍작',       icon:'🌾', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 6 C14 6 15 4.5 15 3 C13.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 10 C10 10 9 8.5 9 7 C10.5 7 12 8 12 10 Z" stroke-width="1.2"/><path d="M12 10 C14 10 15 8.5 15 7 C13.5 7 12 8 12 10 Z" stroke-width="1.2"/></svg>`, color:'#60a040', positive:true,
    desc:'올해 농작물이 풍성하게 자랐다.',
    trigger:(res)=>res.prosperity>=60, triggerChance:0.22,
    effect:{prosperity:+15,loyalty:+10,tax:+8},
    actions:[
      {id:'store',       label:'비축',              cost:0,   resolve:{prosperity:+5,loyalty:+5}},
      {id:'sell',        label:'판매로 세수 확보',   cost:0,   resolve:{tax:+15,prosperity:-3}},
    ]},
  { id:'merchant_visit',name:'대상인 방문',icon:'💼', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="1.5" stroke-linejoin="round"/><path d="M8 8 L8 5 C8 4 8.7 3 10 3 L14 3 C15.3 3 16 4 16 5 L16 8" /></svg>`, color:'#c0a030', positive:true,
    desc:'이름난 대상인이 영지를 찾아왔다.',
    trigger:(res)=>res.prosperity>=55&&res.tax>=50, triggerChance:0.18,
    effect:{tax:+10,prosperity:+8},
    actions:[
      {id:'exclusive',   label:'독점 계약 체결',    cost:0,   resolve:{tax:+20,loyalty:+5}},
      {id:'open_market', label:'시장 개방',          cost:0,   resolve:{prosperity:+15,tax:+8,loyalty:+8}},
    ]},
  { id:'scholar_arrival',name:'학자 이주', icon:'📜', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3 C4.5 3 4 4 4 5 L4 19 C4 20 4.5 21 6 21 L18 21 C19.5 21 20 20 20 19 L20 5 C20 4 19.5 3 18 3 Z" stroke-linejoin="round"/><path d="M8 8 L16 8 M8 12 L16 12 M8 16 L13 16" stroke-width="1.1"/></svg>`, color:'#6080c0', positive:true,
    desc:'저명한 학자가 영지에 정착하겠다고 찾아왔다.',
    trigger:(res)=>res.prosperity>=65, triggerChance:0.15,
    effect:{prosperity:+5},
    actions:[
      {id:'welcome',     label:'환영 연회 개최',    cost:150, resolve:{prosperity:+18,loyalty:+12}},
      {id:'assign',      label:'고문으로 임명',     cost:0,   resolve:{prosperity:+10,tax:+8}},
    ]},
  { id:'royal_favor',   name:'왕의 총애',  icon:'👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></svg>`, color:'#e0c040', positive:true,
    desc:'왕실에서 영지의 공적을 인정해 포상을 내렸다.',
    trigger:(res)=>res.loyalty>=75&&res.defense>=65, triggerChance:0.12,
    effect:{loyalty:+10,prosperity:+10},
    actions:[
      {id:'accept',      label:'감사히 수령',       cost:0,   resolve:{loyalty:+15,tax:+10}},
      {id:'feast',       label:'경축 연회 개최',    cost:200, resolve:{loyalty:+25,prosperity:+15,tax:+5}},
    ]},
];

export function calcDemesneResources(d){
  const res = { tax:d.tax||50, prosperity:d.prosperity||50, defense:d.defense||50, loyalty:d.loyalty||50 };
  const suspended = d.suspendedBuildings||[];
  // 건물 보너스
  Object.entries(d.buildings||{}).forEach(([bid,bdata])=>{
    if(suspended.includes(bid)) return;
    const bdef = getDemesneBuilding(bid); if(!bdef) return;
    Object.entries(bdef.effect(bdata.level||1)).forEach(([k,v])=>{ res[k]=(res[k]||0)+v; });
  });
  // 정책 보너스
  Object.entries(d.policies||{}).forEach(([pid,active])=>{
    if(!active) return;
    const pdef = getDemesnePolicy(pid); if(!pdef) return;
    Object.entries(pdef.effect||{}).forEach(([k,v])=>{ res[k]=(res[k]||0)+v; });
  });
  // 봉신 역할별 보너스
  (d.vassals||[]).forEach(v=>{
    const rd = VASSAL_ROLES[v.role]||VASSAL_ROLES['기사'];
    const mult = (v.bond||30)>=70?1.5:(v.bond||30)>=40?1.0:0.6;
    Object.entries(rd.bonus).forEach(([k,val])=>{ res[k]=(res[k]||0)+Math.floor(val*mult); });
  });
  // 교역 파트너 보너스
  if((d.tradePartners||[]).includes('knight_supply')) res.defense=(res.defense||0)+5;
  if((d.tradePartners||[]).includes('mage_research'))  res.prosperity=(res.prosperity||0)+8;
  // ★v4 인구 역연동: 도시 단계에 따라 세수·방어 보정
  const stage = getPopStage(d.popStage||0);
  res.tax      = (res.tax||0)    + (stage.taxBonus||0);
  res.defense  = (res.defense||0)+ (stage.defBonus||0);
  ['tax','prosperity','defense','loyalty'].forEach(k=>{ res[k]=Math.max(0,Math.min(100,res[k]||0)); });
  return res;
}
window.calcDemesneResources = calcDemesneResources;

export function calcPopGrowthRate(d){
  const res = calcDemesneResources(d);
  const season = getDemesneSeason(d.season||0);
  let rate = 0;

  // 기본 성장률 (번영도 기반)
  rate += (res.prosperity - 50) * 0.001;

  // 건물 보너스
  const blds = d.buildings||{};
  if(blds.farm)    rate += (blds.farm.level||0)    * 0.008;
  if(blds.market)  rate += (blds.market.level||0)  * 0.006;
  if(blds.temple)  rate += (blds.temple.level||0)  * 0.010;
  if(blds.granary) rate += (blds.granary.level||0) * 0.005;
  if(blds.inn)     rate += (blds.inn.level||0)     * 0.007;
  if(blds.academy) rate += (blds.academy.level||0) * 0.012;

  // 정책 보너스
  Object.entries(d.policies||{}).forEach(([pid,active])=>{
    if(!active) return;
    const pdef = getDemesnePolicy(pid);
    if(pdef?.popGrowthBonus) rate += pdef.popGrowthBonus;
  });

  // 계절 보너스
  rate += season.popGrowthMod||0;

  // 충성도 보정
  if(res.loyalty >= 70) rate += 0.005;
  else if(res.loyalty <= 30) rate -= 0.010;

  // 인구 과밀 패널티 (단계 높을수록 자연 성장 둔화)
  const stage = d.popStage||0;
  rate -= stage * 0.003;

  return Math.max(-0.05, Math.min(0.08, rate));
}
window.calcPopGrowthRate = calcPopGrowthRate;

export function tickPopulation(d){
  const pop = d.population||500;
  const rate = calcPopGrowthRate(d);
  let newPop = Math.max(100, Math.floor(pop * (1 + rate)));

  // 도시 단계 체크
  const prevStage = d.popStage||0;
  const newStageData = getPopStageByPop(newPop);
  const newStage = newStageData.stage;

  if(newStage > prevStage){
    // ★단계 승급!
    d.popStage = newStage;
    toastHTML(`🎉 도시 성장! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(newStageData,{size:14}):(newStageData.icon)} ${esc(newStageData.name)} 달성! (인구 ${esc(_fmtPop(newPop))})`, 5000);
    if(S._nextInjectedContext!==undefined)
      S._nextInjectedContext=(S._nextInjectedContext||'')+` [도시 성장: "${d.name}"이 ${newStageData.name}(으)로 발전했다! 인구 ${_fmtPop(newPop)}명. ${newStageData.aiHint}]`;
    // 단계별 건물 잠금 해제 알림
    if(newStageData.unlockBuildings?.length > 0){
      const names = newStageData.unlockBuildings.map(bid=>{
        const b=getDemesneBuilding(bid); return b?`${b.icon}${b.name}`:'';
      }).filter(Boolean).join(', ');
      setTimeout(()=>toast(`🔓 신규 건물 잠금 해제: ${names}`, 4000), 1500);
    }
  } else if(newStage < prevStage){
    // 단계 하락
    d.popStage = newStage;
    toastHTML(`📉 도시 쇠퇴... ${typeof getEntityIconHTML==='function'?getEntityIconHTML(newStageData,{size:14}):(newStageData.icon)} ${esc(newStageData.name)}으로 하락했다.`, 4000);
    if(S._nextInjectedContext!==undefined)
      S._nextInjectedContext=(S._nextInjectedContext||'')+` [도시 쇠퇴: "${d.name}"이 ${newStageData.name}으로 떨어졌다. 영민들이 떠나고 있다.]`;
  }

  d.population = newPop;
  if(newPop > (d.popPeak||0)) d.popPeak = newPop;

  // 성장 로그
  d.popGrowthLog = d.popGrowthLog||[];
  d.popGrowthLog.push({ turn:S.msgCount||0, pop:newPop, stage:d.popStage||0, rate:Math.round(rate*1000)/10 });
  if(d.popGrowthLog.length > 20) d.popGrowthLog = d.popGrowthLog.slice(-20);

  return d;
}
window.tickPopulation = tickPopulation;

export function applyPopEffect(d, effect){
  if(!effect) return d;
  const pop = d.population||500;
  d.population = Math.max(100, Math.floor(pop * (1 + effect)));
  // 인구 감소 후 회복 플래그 (성취용)
  if(effect < 0 && pop > 1000) d._hadPopLoss = true;
  return d;
}
window.applyPopEffect = applyPopEffect;

export function _fmtPop(p){
  if(p>=10000) return `${(p/10000).toFixed(1)}만`;
  if(p>=1000)  return `${(p/1000).toFixed(1)}천`;
  return `${p}`;
}
window._fmtPop = _fmtPop;

export function getDemesneStatusLabel(d){
  const res = calcDemesneResources(d);
  const avg = Math.round((res.tax+res.prosperity+res.defense+res.loyalty)/4);
  if(avg>=80) return {label:'번성',color:'#60d060'};
  if(avg>=60) return {label:'안정',color:'#a0c040'};
  if(avg>=40) return {label:'보통',color:'#c8a040'};
  if(avg>=25) return {label:'쇠퇴',color:'#d06030'};
  return {label:'위기',color:'#e03030'};
}
window.getDemesneStatusLabel = getDemesneStatusLabel;

export function getDemesneTitleList(d){
  const res = calcDemesneResources(d);
  return DEMESNE_TITLES.filter(t=>t.cond(res,d));
}
window.getDemesneTitleList = getDemesneTitleList;

export function checkDemesneAchievements(d){
  const res = calcDemesneResources(d);
  const achieved = d.achievements||[];
  const newOnes = [];
  const grant = (id)=>{ if(!achieved.includes(id)){ achieved.push(id); newOnes.push(id); } };
  if(Object.keys(d.buildings||{}).length>=1)   grant('first_building');
  if((d.tier||1)>=3)                           grant('tier3');
  if((d.tier||1)>=5)                           grant('tier5');
  if((d.population||0)>=2000)                  grant('pop_2k');
  if((d.population||0)>=8000)                  grant('pop_8k');
  if((d.population||0)>=25000)                 grant('pop_25k');
  if((d.population||0)>=80000)                 grant('pop_80k');
  if((d.history||[]).filter(h=>h.type==='event').length>=10) grant('events_10');
  const baseBuildings=['farm','barracks','market','wall','temple','library','dungeon','harbor','tower','granary'];
  if(baseBuildings.every(bid=>d.buildings?.[bid]))  grant('all_buildings');
  if(res.loyalty>=95)                          grant('max_loyalty');
  if((d.tradePartners||[]).length>=3)          grant('trade_3');
  if((d.vassals||[]).length>=(d.tier||1)*2)    grant('max_vassals');
  if((d.history||[]).some(h=>h.label?.includes('역병'))) grant('plague_survived');
  const season=getDemesneSeason(d.season||0);
  if(season.id===3&&res.loyalty>=40)           grant('survive_winter');
  if(d._hadPopLoss && (d.population||0)>=(d.popPeak||0)*0.9) grant('pop_recovered');
  d.achievements = achieved;
  newOnes.forEach(id=>{
    const ach=DEMESNE_ACHIEVEMENTS.find(a=>a.id===id);
    if(ach) toastHTML(`🏆 성취! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(ach,{size:14}):(ach.icon)} ${esc(ach.name)}`,3500);
  });
}
window.checkDemesneAchievements = checkDemesneAchievements;

export function setDemesneTab(tab){
  const d=loadDemesne(); d.activeTab=tab; saveDemesne(d); renderDemesnePanel();
}
window.setDemesneTab = setDemesneTab;

export function establishDemesne(name){
  const d=loadDemesne();
  d.established=true; d.name=name||'이름 없는 영지';
  // [21번 라운드, 시스템 업그레이드 ⑤] 예전엔 world/052의 getAllLocations()
  // 가 영지를 항상 continent:'central'로 고정 배치했다(실제로 어느
  // 대륙에서 개설했는지와 무관) — 지금 서있는 대륙을 그대로 남겨서
  // 실제 필드 그래프에 그 대륙 안 진짜 위치로 들어가게 한다.
  try{
    const curLoc = (typeof window.loadCurrentLocation==='function') ? window.loadCurrentLocation() : null;
    d.continent = curLoc?.continent || S.character?.startContinent || 'central';
  }catch(e){ d.continent = 'central'; }
  d.tier=1; d.tax=50; d.prosperity=50; d.defense=30; d.loyalty=60;
  d.population=500; d.popStage=0; d.popPeak=500;
  d.season=0; d.seasonTurn=0; d.popGrowthLog=[];
  d.history=[{type:'establish',label:`영지 "${d.name}" 개설`,cost:0,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)}];
  saveDemesne(d); applyDemesneStats();
  toast(`🏰 영지 "${d.name}" 개설 완료!`,3500);
  if(S._nextInjectedContext!==undefined) S._nextInjectedContext=(S._nextInjectedContext||'')+` [영지 "${d.name}" 개설]`;
  renderDemesnePanel();
}
window.establishDemesne = establishDemesne;

export function renameDemesne(newName){
  if(!newName||!newName.trim()){toast('이름을 입력하세요');return;}
  const d=loadDemesne(); const old=d.name; d.name=newName.trim();
  d.history.push({type:'rename',label:`이름 변경: ${old} → ${d.name}`,cost:0,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)});
  
  saveDemesne(d); toast(`✏️ "${d.name}"으로 변경`,2000); renderDemesnePanel();
}
window.renameDemesne = renameDemesne;

export function buildDemesneBuilding(bid){
  const d=loadDemesne();
  if(!d.established){toast('먼저 영지를 개설하세요');return;}
  const bdef=getDemesneBuilding(bid); if(!bdef){toast('알 수 없는 건물');return;}
  // 도시 단계 체크
  if((bdef.stageReq||0)>(d.popStage||0)){
    const req=getPopStage(bdef.stageReq||0);
    toast(`${req.name} 이상이어야 건설 가능합니다 (현재: ${getPopStage(d.popStage||0).name})`, undefined, req);return;
  }
  const existing=d.buildings[bid];
  const level=existing?existing.level:0;
  if(level>=bdef.maxLevel){toast(`${bdef.name}은 이미 최대 레벨`);return;}
  const cost=bdef.cost*(level+1);
  const totalBuilt=Object.keys(d.buildings).length;
  const tier=getDemesneTier(d.tier||1);
  if(!existing&&totalBuilt>=tier.maxBuildings){toast(`최대 ${tier.maxBuildings}개 건설 가능`);return;}
  if((S.gold||0)<cost){toast(`골드 부족 (${cost}G 필요)`);return;}
  S.gold-=cost; saveGold(S.gold); window.updateHeader();
  d.buildings[bid]={level:level+1,builtAt:S.msgCount||0};
  d.suspendedBuildings=(d.suspendedBuildings||[]).filter(id=>id!==bid);
  d.history=d.history||[];
  d.history.push({type:'build',label:`${bdef.icon} ${bdef.name} Lv.${level+1} 건설`,cost,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)});
  
  saveDemesne(d); applyDemesneStats(); checkDemesneAchievements(d);
  toast(`${bdef.name} Lv.${level+1} 건설 완료! (-${cost}G)`,3000, bdef);
  renderDemesnePanel();
}
window.buildDemesneBuilding = buildDemesneBuilding;

export function demolishDemesneBuilding(bid){
  const d=loadDemesne();
  const bdef=getDemesneBuilding(bid); if(!bdef) return;
  const existing=d.buildings[bid]; if(!existing){toast('건설된 건물이 아닙니다');return;}
  const totalCost=bdef.cost*(existing.level*(existing.level+1)/2);
  const refund=Math.floor(totalCost*0.5);
  S.gold=(S.gold||0)+refund; saveGold(S.gold); window.updateHeader();
  delete d.buildings[bid];
  d.suspendedBuildings=(d.suspendedBuildings||[]).filter(id=>id!==bid);
  d.history=d.history||[];
  d.history.push({type:'demolish',label:`${bdef.icon} ${bdef.name} 철거`,cost:-refund,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)});
  
  saveDemesne(d); applyDemesneStats();
  toast(`🔨 ${bdef.name} 철거 (+${refund}G 환불)`,3000); renderDemesnePanel();
}
window.demolishDemesneBuilding = demolishDemesneBuilding;

export function toggleDemesnePolicy(pid){
  const d=loadDemesne();
  if(!d.established){toast('먼저 영지를 개설하세요');return;}
  const pdef=getDemesnePolicy(pid); if(!pdef) return;
  const willActivate=!d.policies[pid];
  if(pdef.cost&&pdef.cost>0&&willActivate){
    if((S.gold||0)<pdef.cost){toast(`골드 부족 (${pdef.cost}G 필요)`);return;}
    S.gold-=pdef.cost; saveGold(S.gold); window.updateHeader();
  }
  d.policies[pid]=willActivate;
  if(willActivate){
    (pdef.conflict||[]).forEach(cid=>{
      if(d.policies[cid]){
        d.policies[cid]=false;
        const cdef=getDemesnePolicy(cid);
        if(cdef) toastHTML(`⚠️ 상충: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(cdef,{size:14}):(cdef.icon)}${esc(cdef.name)} 자동 해제`,2500);
      }
    });
  }
  d.history=d.history||[];
  d.history.push({type:'policy',label:`정책 ${willActivate?'시행':'해제'}: ${pdef.icon} ${pdef.name}`,cost:willActivate?pdef.cost:0,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)});
  
  saveDemesne(d); applyDemesneStats();
  toast(`${pdef.name} ${willActivate?'시행':'해제'}`,2000, pdef); renderDemesnePanel();
}
window.toggleDemesnePolicy = toggleDemesnePolicy;

export function adjustDemesneResource(key,delta){
  const d=loadDemesne();
  if(!d.established){toast('먼저 영지를 개설하세요');return;}
  if(!['tax','prosperity','defense','loyalty'].includes(key)) return;
  d[key]=Math.max(0,Math.min(100,(d[key]||50)+delta));
  const label={tax:'세수',prosperity:'번영',defense:'방어',loyalty:'충성'}[key];
  d.history=d.history||[];
  d.history.push({type:'manual',label:`${label} 수동 조정 ${delta>0?'+':''}${delta}`,cost:0,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)});
  
  saveDemesne(d); applyDemesneStats(); renderDemesnePanel();
}
window.adjustDemesneResource = adjustDemesneResource;

export function addDemesneVassal(name,role){
  const d=loadDemesne();
  if(!d.established){toast('먼저 영지를 개설하세요');return;}
  if(!name||!name.trim()){toast('봉신 이름을 입력하세요');return;}
  const maxVassals=(d.tier||1)*2;
  if((d.vassals||[]).length>=maxVassals){toast(`현재 등급 최대 ${maxVassals}명`);return;}
  if((d.vassals||[]).some(v=>v.name===name.trim())){toast('이미 등록된 봉신');return;}
  const finalRole=role&&VASSAL_ROLES[role]?role:'기사';
  d.vassals=d.vassals||[];
  d.vassals.push({name:name.trim(),role:finalRole,bond:30,addedTurn:S.msgCount||0});
  d.history=d.history||[];
  d.history.push({type:'vassal',label:`봉신 등록: ${name.trim()} (${finalRole})`,cost:0,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)});
  
  saveDemesne(d); applyDemesneStats(); checkDemesneAchievements(d);
  toast(`⚜️ 봉신 "${name.trim()}" 등록!`,2500); renderDemesnePanel();
}
window.addDemesneVassal = addDemesneVassal;

export function removeDemesneVassal(name){
  const d=loadDemesne();
  d.vassals=(d.vassals||[]).filter(v=>v.name!==name);
  d.history=d.history||[];
  d.history.push({type:'vassal',label:`봉신 해제: ${name}`,cost:0,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)});
  
  saveDemesne(d); applyDemesneStats();
  toast(`봉신 "${name}" 해제`,2000); renderDemesnePanel();
}
window.removeDemesneVassal = removeDemesneVassal;

export function raiseDemesneVassalBond(name){
  const d=loadDemesne();
  const v=(d.vassals||[]).find(v=>v.name===name);
  if(!v){toast('봉신을 찾을 수 없습니다');return;}
  const cooldowns=d.vassalBondCooldown||{};
  const lastBond=cooldowns[name]||0;
  const turn=S.msgCount||0;
  if(turn-lastBond<10){toast(`쿨다운: ${10-(turn-lastBond)}턴 남음`);return;}
  if((S.gold||0)<50){toast('골드 부족 (50G 필요)');return;}
  S.gold-=50; saveGold(S.gold); window.updateHeader();
  v.bond=Math.min(100,(v.bond||30)+15);
  cooldowns[name]=turn; d.vassalBondCooldown=cooldowns;
  saveDemesne(d); applyDemesneStats();
  toast(`⚜️ ${name} 유대도 +15 (-50G)`,2000); renderDemesnePanel();
}
window.raiseDemesneVassalBond = raiseDemesneVassalBond;

export function saveDemesneNote(text){ const d=loadDemesne(); d.note=text||''; saveDemesne(d); }
window.saveDemesneNote = saveDemesneNote;

export function toggleDemesneTradePartner(pid){
  const d=loadDemesne();
  if(!d.established){toast('먼저 영지를 개설하세요');return;}
  const pdef=DEMESNE_TRADE_PARTNERS.find(p=>p.id===pid); if(!pdef) return;
  const partners=d.tradePartners||[];
  const idx=partners.indexOf(pid);
  if(idx>=0){
    d.tradePartners=partners.filter(p=>p!==pid);
    toast(`${pdef.name} 교역 해제`,2000, pdef);
  } else {
    let fgScore=0;
    try{
      // [B83 FIX] loadFactionGauge()의 실제 반환 구조는 {gauges:{}, ...}인데
      // 존재하지 않는 fg.factions를 참조해 항상 undefined가 되던 버그.
      const fg=typeof loadFactionGauge==='function'?loadFactionGauge():{};
      fgScore=(fg.gauges||{})[pdef.requiredFaction]||0;
    }catch(e){}
    if(fgScore<pdef.factionThreshold){
      toast(`${pdef.requiredFaction} 파벌 친밀도 ${pdef.factionThreshold} 이상 필요 (현재 ${fgScore})`,3000);return;
    }
    d.tradePartners=[...partners,pid];
    toast(`${pdef.name} 교역 체결!`,2500, pdef);
  }
  d.history=d.history||[];
  d.history.push({type:'trade',label:`교역 ${idx>=0?'해제':'체결'}: ${pdef.icon} ${pdef.name}`,cost:0,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)});
  
  saveDemesne(d); applyDemesneStats(); checkDemesneAchievements(d); renderDemesnePanel();
}
window.toggleDemesneTradePartner = toggleDemesneTradePartner;

export function tickDemesneResources(){
  let d=loadDemesne();
  if(!d.established) return;
  const turn=S.msgCount||0;
  if(turn-(d.lastTurn||0)<5) return;
  d.lastTurn=turn;
  const res=calcDemesneResources(d);

  // 계절 변경 (10턴마다)
  if(turn-(d.seasonTurn||0)>=10){
    d.season=((d.season||0)+1)%4;
    d.seasonTurn=turn;
    const season=getDemesneSeason(d.season);
    toast(`계절 변화: ${season.name}`,3000, season);
    if(S._nextInjectedContext!==undefined)
      S._nextInjectedContext=(S._nextInjectedContext||'')+` [계절 변화: ${season.name}. ${season.aiHint}]`;
  }

  // 건물 업킵 처리
  let totalUpkeep=0;
  const upkeepList=[];
  Object.entries(d.buildings||{}).forEach(([bid,bdata])=>{
    const bdef=getDemesneBuilding(bid);
    if(bdef){ const u=bdef.upkeep*(bdata.level||1); totalUpkeep+=u; upkeepList.push({bid,upkeep:u}); }
  });
  if(totalUpkeep>0){
    if((S.gold||0)>=totalUpkeep){
      S.gold-=totalUpkeep; saveGold(S.gold); window.updateHeader();
      d.suspendedBuildings=[]; d.upkeepDebt=0;
      if(totalUpkeep>=20) toast(`⚙️ 건물 유지비: -${totalUpkeep}G`,2000);
    } else {
      d.upkeepDebt=(d.upkeepDebt||0)+totalUpkeep-(S.gold||0);
      S.gold=0; saveGold(S.gold); window.updateHeader();
      upkeepList.sort((a,b)=>b.upkeep-a.upkeep);
      const suspend=upkeepList[0];
      const bdef=getDemesneBuilding(suspend.bid);
      d.suspendedBuildings=[suspend.bid];
      toastHTML(`⚠️ 골드 부족! ${esc(bdef?bdef.icon+bdef.name:'')} 운영 중단`,3500);
    }
  }

  // 세수 수입
  const tradeIncome=(d.tradePartners||[]).reduce((sum,pid)=>{
    const tp=DEMESNE_TRADE_PARTNERS.find(p=>p.id===pid); return sum+(tp?tp.income:0);
  },0);
  const income=Math.max(0,Math.floor(res.tax*0.6))+tradeIncome;
  if(income>0){
    if(typeof addGoldWithExchange==='function') addGoldWithExchange(income, '영지 세수'); else { S.gold=(S.gold||0)+income; saveGold(S.gold); } window.updateHeader();
    d.totalIncome=(d.totalIncome||0)+income;
    toast(`🏰 세수: +${income}G${tradeIncome>0?` (교역+${tradeIncome}G)`:''}`,2000);
  }

  // ★v4 인구 갱신
  d = tickPopulation(d);

  // 충성도 기반 번영도 변동
  if(res.loyalty>=70) d.prosperity=Math.min(100,(d.prosperity||50)+2);
  else if(res.loyalty<=30) d.prosperity=Math.max(0,(d.prosperity||50)-3);

  // 파벌 연동
  _demesneSyncFaction(d,res);
  checkDemesneAchievements(d);
  saveDemesne(d);
  setTimeout(()=>checkDemesneEvents(),300);
}
window.tickDemesneResources = tickDemesneResources;

export function _demesneSyncFaction(d,res){
  if(typeof changeFactionGauge!=='function') return;
  if(res.loyalty>=75)      changeFactionGauge('왕실',3,'영지 충성도 우호');
  else if(res.loyalty<=25) changeFactionGauge('왕실',-3,'영지 충성도 적대');
  if(res.prosperity>=75)   changeFactionGauge('상인 연합',2,'영지 번영도');
  else if(res.prosperity<=25) changeFactionGauge('상인 연합',-2,'영지 쇠퇴');
  if(res.defense>=75)      changeFactionGauge('기사단',2,'영지 방어력');
}
window._demesneSyncFaction = _demesneSyncFaction;

export function checkDemesneEvents(){
  // [버그 수정] race/064의 patchCheckDemesneEventsForLocation이 이 함수(정의된
  // 곳 밖)에서 window.checkDemesneEvents를 감싸 "영지에 있으면 이벤트 확률
  // 1.5배" 배율을 설정하려 했지만, 이 함수의 실제 호출부(같은 파일 안의
  // setTimeout(()=>checkDemesneEvents(),300) 등)가 bare 식별자라 그 감싸기가
  // 적용된 적이 없다 — window._demesneAtHomeMult가 항상 기본값 1.0으로만
  // 읽혀 영지에 있어도 이벤트가 더 자주 발생하지 않았다. 실제 정의부에서
  // 직접 계산한다.
  window._demesneAtHomeMult = (typeof window.isAtDemesne==='function' && window.isAtDemesne()) ? 1.5 : 1.0;
  const d=loadDemesne();
  if(!d.established) return;
  const res=calcDemesneResources(d);
  d.events=(d.events||[]).filter(e=>!e.resolved)
    .concat((d.events||[]).filter(e=>e.resolved).slice(-10));
  const activeIds=d.events.filter(e=>!e.resolved).map(e=>e.id);
  if(activeIds.length>=2){saveDemesne(d);return;}
  const season=getDemesneSeason(d.season||0);
  let triggered=false;
  DEMESNE_EVENT_DEFS.forEach(evDef=>{
    if(triggered||activeIds.includes(evDef.id)) return;
    if(evDef.suppressedBy&&(d.tradePartners||[]).includes(evDef.suppressedBy)) return;
    const seasonMod=season.eventMod?.[evDef.id]||1.0;
    const finalChance=(evDef.triggerChance||0.15)*seasonMod*(window._demesneAtHomeMult||1.0);
    if(finalChance<=0) return;
    const triggerRes = evDef.trigger(res, d);
    if(triggerRes&&Math.random()<finalChance){
      triggered=true;
      d.events.push({id:evDef.id,startTurn:S.msgCount||0,resolved:false});
      Object.entries(evDef.effect||{}).forEach(([k,v])=>{
        if(['tax','prosperity','defense','loyalty'].includes(k))
          d[k]=Math.max(0,Math.min(100,(d[k]||50)+v));
      });
      // ★v4 이벤트 즉시 인구 효과
      if(evDef.popEffect) applyPopEffect(d, evDef.popEffect);
      saveDemesne(d);
      toastHTML(`${esc(evDef.positive?'✨':'⚠️')} ${typeof getEntityIconHTML==='function'?getEntityIconHTML(evDef,{size:14}):(evDef.icon)} ${esc(evDef.name)}`,4000);
      if(S._nextInjectedContext!==undefined)
        S._nextInjectedContext=(S._nextInjectedContext||'')+` [영지 이벤트: ${evDef.name} — ${evDef.desc}]`;
    }
  });
  if(!triggered) saveDemesne(d);
}
window.checkDemesneEvents = checkDemesneEvents;

export function resolveDemesneEvent(evId,actionId){
  const d=loadDemesne();
  const ev=(d.events||[]).find(e=>e.id===evId&&!e.resolved);
  if(!ev){toast('이미 처리된 이벤트');return;}
  const evDef=DEMESNE_EVENT_DEFS.find(e=>e.id===evId); if(!evDef) return;
  const action=evDef.actions.find(a=>a.id===actionId); if(!action) return;
  if(action.cost>0){
    if((S.gold||0)<action.cost){toast(`골드 부족 (${action.cost}G 필요)`);return;}
    S.gold-=action.cost; saveGold(S.gold); window.updateHeader();
  }
  ev.resolved=true; ev.resolvedAction=actionId; ev.resolvedAt=S.msgCount||0;
  Object.entries(action.resolve||{}).forEach(([k,v])=>{
    if(['tax','prosperity','defense','loyalty'].includes(k))
      d[k]=Math.max(0,Math.min(100,(d[k]||50)+v));
  });
  // ★v4 조치별 인구 효과
  if(action.popEffect) applyPopEffect(d, action.popEffect);
  d.history=d.history||[];
  d.history.push({type:'event',label:`이벤트: ${evDef.icon} ${evDef.name} → ${action.label}`,cost:action.cost,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)});
  
  saveDemesne(d); applyDemesneStats(); checkDemesneAchievements(d);
  toast(`처리: ${action.label}`,3000, evDef);
  if(S._nextInjectedContext!==undefined)
    S._nextInjectedContext=(S._nextInjectedContext||'')+` [이벤트 "${evDef.name}" → "${action.label}"]`;
  renderDemesnePanel();
}
window.resolveDemesneEvent = resolveDemesneEvent;

export function upgradeDemesneTier(){
  const d=loadDemesne();
  if(!d.established){toast('먼저 영지를 개설하세요');return;}
  if(d.tier>=5){toast('이미 최고 등급');return;}
  const costs=[0,500,1200,2500,5000];
  const cost=costs[d.tier]||999999;
  if((S.gold||0)<cost){toast(`골드 부족 (${cost}G 필요)`);return;}
  const res=calcDemesneResources(d);
  if(res.prosperity<60){toast('번영도 60 이상 필요');return;}
  if(res.loyalty<50){toast('충성도 50 이상 필요');return;}
  S.gold-=cost; saveGold(S.gold); window.updateHeader();
  d.tier=(d.tier||1)+1;
  const newTier=getDemesneTier(d.tier);
  d.population=Math.max(d.population||500,newTier.popBase);
  d.history=d.history||[];
  d.history.push({type:'upgrade',label:`영지 승격 → ${newTier.icon} ${newTier.name}`,cost,turn:S.msgCount||0,at:new Date().toISOString().slice(0,16)});
  
  saveDemesne(d); applyDemesneStats(); checkDemesneAchievements(d);
  toastHTML(`🎉 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(newTier,{size:14}):(newTier.icon)} ${esc(newTier.name)}으로 승격!`,4000);
  if(S._nextInjectedContext!==undefined)
    S._nextInjectedContext=(S._nextInjectedContext||'')+` [영지 승격: ${newTier.name}]`;
  renderDemesnePanel();
}
window.upgradeDemesneTier = upgradeDemesneTier;

export function applyDemesneStats(){
  if(!S||!S.stats) return;
  const d=loadDemesne(); if(!d.established) return;
  const prev=S._demesneBonus||{};
  Object.entries(prev).forEach(([k,v])=>{ if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });
  const res=calcDemesneResources(d);
  const tier=d.tier||1;
  const vassalLdr=Math.floor((d.vassals||[]).reduce((s,v)=>s+(v.bond||30)/100,0)*3);
  const nb={
    ldr:Math.floor(res.loyalty*0.08*tier)+vassalLdr,
    rep:Math.floor(res.prosperity*0.06*tier),
    end:Math.floor(res.defense*0.04),
    neg:Math.floor(res.tax*0.04),
  };
  Object.entries(nb).forEach(([k,v])=>{ S.stats[k]=Math.min(999,(S.stats[k]||50)+v); });
  S._demesneBonus=nb;
  if(typeof saveStats==='function') saveStats(S.stats);
  _markDirty('stats'); if(typeof saveStatsSplit==='function') saveStatsSplit();
  window.updateHeader();
}
window.applyDemesneStats = applyDemesneStats;

export function getDemesneBLS(){
  const d=loadDemesne(); if(!d.established) return '';
  const res=calcDemesneResources(d);
  const tier=getDemesneTier(d.tier||1);
  const status=getDemesneStatusLabel(d);
  const season=getDemesneSeason(d.season||0);
  const stage=getPopStage(d.popStage||0);
  const pop=d.population||500;
  const growthRate=calcPopGrowthRate(d);
  const growthStr=growthRate>0.01?'빠르게 성장 중':growthRate>0?'서서히 성장 중':growthRate<-0.01?'인구 감소 중':'정체 중';
  const titles=getDemesneTitleList(d).map(t=>`${t.icon}${t.name}`).join(', ')||'없음';
  const bList=Object.entries(d.buildings||{}).map(([bid,bd])=>{
    const b=getDemesneBuilding(bid);
    const sus=(d.suspendedBuildings||[]).includes(bid)?'[중단]':'';
    return b?`${b.icon}${b.name}Lv.${bd.level}${sus}`:null;
  }).filter(Boolean).join(', ')||'없음';
  const pList=Object.entries(d.policies||{}).filter(([,v])=>v).map(([pid])=>{
    const p=getDemesnePolicy(pid); return p?`${p.icon}${p.name}`:null;
  }).filter(Boolean).join(', ')||'없음';
  const tpList=(d.tradePartners||[]).map(pid=>{
    const p=DEMESNE_TRADE_PARTNERS.find(tp=>tp.id===pid); return p?`${p.icon}${p.name}`:null;
  }).filter(Boolean).join(', ')||'없음';
  const vList=(d.vassals||[]).map(v=>`${v.name}(${v.role},유대${v.bond})`).join(', ')||'없음';
  const achList=(d.achievements||[]).map(id=>{
    const a=DEMESNE_ACHIEVEMENTS.find(ac=>ac.id===id); return a?`${a.icon}${a.name}`:null;
  }).filter(Boolean).join(', ')||'없음';
  const evts=(d.events||[]).filter(e=>!e.resolved).map(e=>{
    const ed=DEMESNE_EVENT_DEFS.find(ed=>ed.id===e.id); return ed?`${ed.icon}${ed.name}`:null;
  }).filter(Boolean).join(', ');
  const bHints=Object.entries(d.buildings||{}).map(([bid,bd])=>{
    const b=getDemesneBuilding(bid); return b?b.aiHint(bd.level||1):null;
  }).filter(Boolean).join(' ');
  const pHints=Object.entries(d.policies||{}).filter(([,v])=>v).map(([pid])=>{
    const p=getDemesnePolicy(pid); return p?p.aiHint:null;
  }).filter(Boolean).join(' ');
  const stageHints=getDemesneTitleList(d).map(t=>t.aiHint).join(' ');
  const achHints=(d.achievements||[]).slice(-3).map(id=>{
    const a=DEMESNE_ACHIEVEMENTS.find(ac=>ac.id===id); return a?a.aiHint:null;
  }).filter(Boolean).join(' ');
  const susHint=(d.suspendedBuildings||[]).length>0?'⚠️ 일부 건물이 유지비 부족으로 중단됐다.':'';
  const noteHint=d.note?`메모: ${d.note}`:'';

  return `\n[🏰 영지 경영 상태]
영지명: "${d.name}" (${tier.icon}${tier.name} ${d.tier}등급) | 계절: ${season.icon}${season.name}
도시: ${stage.icon}${stage.name} | 인구: ${_fmtPop(pop)}명 (${growthStr}) | 최고 인구: ${_fmtPop(d.popPeak||pop)}명
상태: ${status.label} | 세수: ${res.tax}/100 | 번영: ${res.prosperity}/100 | 방어: ${res.defense}/100 | 충성: ${res.loyalty}/100
칭호: ${titles}
건물: ${bList}
정책: ${pList}
교역: ${tpList}
봉신: ${vList}
성취: ${achList}
${evts?`⚠️ 진행 중 이벤트: ${evts}`:''}
${susHint}
${stage.aiHint} ${season.aiHint} ${bHints} ${pHints} ${stageHints} ${achHints} ${noteHint}
이 캐릭터는 영지의 영주다. 도시 단계(${stage.name})와 인구 규모(${_fmtPop(pop)}명)에 걸맞은 묘사를 사용하라. 영지 상황이 NPC 대화·퀘스트·세계 이벤트에 자연스럽게 반영되어야 한다.`;
}
window.getDemesneBLS = getDemesneBLS;

export function checkDemesneDefenseWarning(){
  const d=loadDemesne(); if(!d.established) return;
  const res=calcDemesneResources(d);
  if(res.defense<35) toast('⚠️ 영지 방어력이 위험 수준! 원정 중 침략 이벤트 위험이 높습니다.',4000);
}
window.checkDemesneDefenseWarning = checkDemesneDefenseWarning;

export function renderDemesnePanel(){
  const body=document.getElementById('pb-demesne'); if(!body) return;
  if(!isDemesneActive()){
    const condList = DEMESNE_UNLOCK_CONDITIONS.map(c=>`${c.icon} ${c.label}`).join('<br>');
    body.innerHTML=`<div style="text-align:center;padding:20px 16px;color:var(--dim);font-size:11px">
      <div style="font-size:36px;margin-bottom:12px;opacity:.35">🏰</div>
      <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:12px;margin-bottom:10px">영지 경영</div>
      <div style="font-size:10px;line-height:1.9;margin-bottom:6px;text-align:left;background:var(--bg-input);padding:10px 12px;border-radius:2px;border:1px solid var(--border)">
        <div style="color:var(--gold);font-family:'Cinzel',serif;font-size:9px;letter-spacing:1px;margin-bottom:6px">해금 조건 (하나라도 충족 시 자동 활성)</div>
        ${condList}
      </div>
      <div style="font-size:10px;color:var(--dim);margin:10px 0 14px;line-height:1.6">조건을 갖추면 자동으로 팝업이 뜹니다.</div>
      </div>`;
    return;
  }
  const d=loadDemesne();
  const res=calcDemesneResources(d);
  const tier=getDemesneTier(d.tier||1);
  const status=getDemesneStatusLabel(d);
  const activeEvents=(d.events||[]).filter(e=>!e.resolved);
  const color=tier.color;
  const tab=d.activeTab||'buildings';
  const season=getDemesneSeason(d.season||0);
  const stage=getPopStage(d.popStage||0);
  const pop=d.population||500;
  const growthRate=calcPopGrowthRate(d);
  const growthStr=growthRate>0.01?'📈 빠른 성장':growthRate>0.003?'📈 성장 중':growthRate>0?'➡️ 완만한 성장':growthRate<-0.005?'📉 인구 감소':'➡️ 정체';
  const titles=getDemesneTitleList(d);
  const suspended=d.suspendedBuildings||[];
  const esc2=(s)=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  if(!d.established){
    body.innerHTML=`<div style="padding:16px;text-align:center">
      <div style="font-size:40px;margin-bottom:12px">🏰</div>
      <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:13px;margin-bottom:8px">영지를 개설하세요</div>
      <div style="font-size:10px;color:var(--dim);line-height:1.7;margin-bottom:16px">영주 신분을 선언하고 영지를 경영하세요.</div>
      <input id="demesne-name-inp" placeholder="영지 이름 입력..." style="width:100%;padding:8px 10px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:'Crimson Text',serif;font-size:13px;outline:none;margin-bottom:10px;border-radius:2px">
      <button onclick="establishDemesne(document.getElementById('demesne-name-inp').value||'이름 없는 영지')"
        style="width:100%;padding:10px;background:linear-gradient(135deg,#2a1f0d,#3a2a10);border:1px solid var(--gold);color:var(--gold);font-family:'Cinzel',serif;font-size:11px;cursor:pointer;letter-spacing:1px;border-radius:2px">
        🏰 영지 개설</button></div>`;
    return;
  }

  // 이벤트 배너
  const evBanner=activeEvents.length?`
    <div style="background:#1a0500;border:2px solid #e03030;padding:10px 12px;margin-bottom:8px">
      <div style="font-family:'Cinzel',serif;font-size:10px;color:#e06060;letter-spacing:1px;margin-bottom:6px">⚠️ 영지 이벤트 발생!</div>
      ${activeEvents.map(ev=>{
        const evDef=DEMESNE_EVENT_DEFS.find(e=>e.id===ev.id); if(!evDef) return '';
        return `<div style="margin-bottom:8px;padding:8px;background:#100000;border:1px solid #3a1010;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
            <span style="color:${evDef.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(evDef,{size:16}):(evDef.svgIcon||evDef.icon)}</span>
            <div>
              <div style="font-family:'Cinzel',serif;font-size:11px;color:${evDef.color}">${esc2(evDef.name)}</div>
              <div style="font-size:9px;color:var(--dim)">${esc2(evDef.desc)}</div>
              ${evDef.popEffect?`<div style="font-size:8px;color:${evDef.popEffect<0?'#e06060':'#60c060'}">인구 ${evDef.popEffect>0?'+':''}${Math.round(evDef.popEffect*100)}%</div>`:''}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:${evDef.actions.length===3?'1fr 1fr 1fr':'1fr 1fr'};gap:4px">
            ${evDef.actions.map(a=>`<button onclick="resolveDemesneEvent('${ev.id}','${a.id}')"
              style="padding:6px 3px;background:var(--bg-screen);border:1px solid ${evDef.color}55;color:${evDef.color};font-size:8px;cursor:pointer;font-family:'Cinzel',serif;line-height:1.4;text-align:left;border-radius:2px">
              ${esc2(a.label)}${a.cost?`<br><span style="font-size:7px;color:var(--dim)">-${a.cost}G</span>`:''}${a.popEffect?`<br><span style="font-size:7px;color:${a.popEffect>0?'#60c060':'#e06060'}">인구${a.popEffect>0?'+':''}${Math.round(a.popEffect*100)}%</span>`:''}
            </button>`).join('')}
          </div></div>`;
      }).join('')}</div>`:'';

  // 헤더 (도시 단계 표시 포함)
  const nextStage=POP_STAGES[Math.min((d.popStage||0)+1,POP_STAGES.length-1)];
  const popToNext=nextStage.threshold>stage.threshold?nextStage.threshold-pop:0;
  const header=`
    <div style="padding:12px 14px;background:linear-gradient(135deg,#150a00,#1e1200);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.18);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tier,{size:16}):(tier.svgIcon||tier.icon)}</span>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color}">${esc2(d.name)}</div>
          <div style="font-size:9px;color:#806040;margin-top:1px">${tier.name} · ${typeof getEntityIconHTML==='function'?getEntityIconHTML(season,{size:9}):(season.icon)}${season.name}</div>
          ${titles.length?`<div style="font-size:8px;color:#a08040">${titles.map(t=>`${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:8}):(t.icon)}${t.name}`).join(' ')}</div>`:''}
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:${status.color}">${status.label}</div>
          <div style="font-size:8px;color:#605030">누적: ${d.totalIncome||0}G</div>
        </div>
      </div>
      <!-- ★v4 도시 단계 블록 -->
      <div style="background:#0a0600;border:1px solid ${stage.color}55;border-radius:3px;padding:7px 10px;margin-bottom:7px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <div style="display:flex;align-items:center;gap:5px">
            <span style="color:${stage.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stage,{size:16}):(stage.svgIcon||stage.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:11px;color:${stage.color}">${stage.name}</span>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:${stage.color};font-family:'Cinzel',serif">${_fmtPop(pop)}명</div>
            <div style="font-size:8px;color:var(--dim)">${growthStr}</div>
          </div>
        </div>
        ${(d.popStage||0)<4?`
        <div style="font-size:8px;color:var(--dim);margin-bottom:4px">다음 단계 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(nextStage,{size:8}):(nextStage.icon)}${nextStage.name}: ${_fmtPop(nextStage.threshold)}명 필요 (${popToNext>0?`${_fmtPop(popToNext)}명 남음`:'달성!'})</div>
        <div style="height:5px;background:#050300;border-radius:3px;overflow:hidden">
          <div style="width:${Math.min(100,Math.round((pop-stage.threshold)/(nextStage.threshold-stage.threshold)*100))}%;height:100%;background:linear-gradient(90deg,${stage.color}88,${stage.color});border-radius:3px;transition:width .5s"></div>
        </div>
        `:`<div style="font-size:8px;color:${stage.color};text-align:center;font-family:'Cinzel',serif">★ 최고 도시 단계 달성 ★</div>`}
        <div style="font-size:7px;color:#4a3020;margin-top:3px">역대 최고 인구: ${_fmtPop(d.popPeak||pop)}명 | 성장률: ${(growthRate*100).toFixed(2)}%/5턴</div>
      </div>
      <!-- 자원 바 -->
      ${[
        {key:'tax',       label:'세수',icon:'💰',color:'#e0c040',val:res.tax},
        {key:'prosperity',label:'번영',icon:'🌟',color:'#60c060',val:res.prosperity},
        {key:'defense',   label:'방어',icon:'🛡️',color:'#4080e0',val:res.defense},
        {key:'loyalty',   label:'충성',icon:'❤️',color:'#e05060',val:res.loyalty},
      ].map(r=>`
        <div style="margin-bottom:4px">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:8px;margin-bottom:2px">
            <span style="color:${r.color};font-family:'Cinzel',serif">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:16}):(r.icon)} ${r.label}</span>
            <span style="color:${r.color}">${r.val}</span>
          </div>
          <div style="height:4px;background:#0a0600;border-radius:3px;overflow:hidden">
            <div style="width:${r.val}%;height:100%;background:${r.color};border-radius:3px;transition:width .4s"></div>
          </div>
        </div>`).join('')}
    </div>`;

  // 승격 블록
  const costs=[0,500,1200,2500,5000];
  const uc=costs[d.tier]||0;
  const upgradeBlock=d.tier<5?`
    <div style="padding:7px 12px;background:#0a0800;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:9px;color:var(--dim)">다음: ${(()=>{const nt=getDemesneTier((d.tier||1)+1);return typeof getEntityIconHTML==='function'?getEntityIconHTML(nt,{size:12}):nt.icon;})()} ${getDemesneTier((d.tier||1)+1).name}</div>
        <div style="font-size:8px;color:#3a3030">번영60+ · 충성50+ · ${uc}G</div>
      </div>
      <button onclick="upgradeDemesneTier()" style="padding:4px 10px;background:#1a1200;border:1px solid ${color};color:${color};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">승격 -${uc}G</button>
    </div>`:`<div style="padding:6px 12px;background:#1a1400;border-bottom:1px solid var(--border);font-size:9px;color:${color};text-align:center;font-family:'Cinzel',serif">⭐ 최고 등급 달성</div>`;

  // 탭 바
  const tabDefs=[
    {id:'buildings',label:'🏗️ 건물'},
    {id:'policies', label:'📜 정책'},
    {id:'vassals',  label:'⚜️ 봉신'},
    {id:'trade',    label:'🤝 교역'},
    {id:'population',label:'👥 인구'},
    {id:'adjust',   label:'⚙️ 조정'},
    {id:'history',  label:'📖 기록'},
  ];
  const tabBar=`<div style="display:flex;border-bottom:1px solid var(--border);background:#0a0600;overflow-x:auto">
    ${tabDefs.map(t=>`<button onclick="setDemesneTab('${t.id}')"
      style="flex:0 0 auto;padding:7px 7px;background:${tab===t.id?'#1a1200':'transparent'};border:none;border-bottom:${tab===t.id?`2px solid ${color}`:'2px solid transparent'};color:${tab===t.id?color:'var(--dim)'};font-size:8px;cursor:pointer;font-family:'Cinzel',serif;white-space:nowrap">
      ${t.label}</button>`).join('')}
  </div>`;

  // ── 건물 탭 ──
  const builtCount=Object.keys(d.buildings||{}).length;
  const curStage=d.popStage||0;
  const buildingContent=`<div style="padding:10px 12px">
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:8px">── 건물 (${builtCount}/${getDemesneTier(d.tier||1).maxBuildings}) ──</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
      ${DEMESNE_BUILDINGS.map(bdef=>{
        const existing=(d.buildings||{})[bdef.id];
        const level=existing?existing.level:0;
        const maxed=level>=bdef.maxLevel;
        const cost=bdef.cost*(level+1);
        const canBuild=!maxed&&(S.gold||0)>=cost&&(existing||builtCount<getDemesneTier(d.tier||1).maxBuildings);
        const isSuspended=suspended.includes(bdef.id);
        const stageOk=(bdef.stageReq||0)<=curStage;
        const eff=bdef.effect(Math.max(1,level));
        const effStr=Object.entries(eff).map(([k,v])=>`${k.toUpperCase()}${v>0?'+':''}${v}`).join(' ');
        const stageReqStage=getPopStage(bdef.stageReq||0);
        return `<div style="padding:7px;background:${!stageOk?'#050300':isSuspended?'#1a0500':level>0?'#0d1a05':'var(--bg-input)'};border:1px solid ${!stageOk?'#1a0a00':isSuspended?'#e03030':level>0?'#2a5a1a':maxed?color:'var(--border)'};border-radius:2px;opacity:${stageOk?1:0.5}">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:3px">
            <span style="font-size:13px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(bdef,{size:13}):(bdef.icon)}</span>
            <div style="flex:1;min-width:0">
              <div style="font-family:'Cinzel',serif;font-size:8px;color:${!stageOk?'#4a3010':isSuspended?'#e06060':level>0?'var(--gold)':'var(--dim)'}">${bdef.name}${isSuspended?' ⚠️':''}</div>
              <div style="font-size:7px;color:#3a3030">Lv.${level}/${bdef.maxLevel} · 유지${bdef.upkeep*(level||1)}G</div>
            </div>
          </div>
          <div style="font-size:7px;color:#4a6040;margin-bottom:2px">${effStr}</div>
          ${!stageOk?`<div style="font-size:7px;color:#7a4020;text-align:center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stageReqStage,{size:7}):(stageReqStage.icon)}${stageReqStage.name} 달성 시 해제</div>`:
          `<div style="display:flex;gap:3px">
            ${maxed?`<div style="flex:1;font-size:8px;color:${color};text-align:center;font-family:'Cinzel',serif;padding:3px">MAX</div>`
              :`<button onclick="buildDemesneBuilding('${bdef.id}')"
                style="flex:1;padding:3px;background:${canBuild?'#0d1500':'#0a0800'};border:1px solid ${canBuild?'#3a6a1a':'#1a1005'};color:${canBuild?'#80c040':'#3a3a3a'};font-size:7px;cursor:${canBuild?'pointer':'not-allowed'};font-family:'Cinzel',serif;border-radius:2px">건설 -${cost}G</button>`}
            ${level>0?`<button onclick="if(confirm('${bdef.name}을 철거하시겠습니까? 50% 환불됩니다.'))demolishDemesneBuilding('${bdef.id}')"
              style="padding:3px 5px;background:#140000;border:1px solid #503030;color:#c05050;font-size:7px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">철거</button>`:''}
          </div>`}
        </div>`;
      }).join('')}
    </div></div>`;

  // ── 정책 탭 ──
  const policyContent=`<div style="padding:10px 12px">
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:8px">── 정책 ──</div>
    <div style="display:flex;flex-direction:column;gap:5px">
      ${DEMESNE_POLICIES.map(pdef=>{
        const active=!!(d.policies||{})[pdef.id];
        const effStr=Object.entries(pdef.effect).map(([k,v])=>`${k.toUpperCase()}${v>0?'+':''}${v}`).join(' ');
        const cnflNames=(pdef.conflict||[]).map(cid=>{const cd=getDemesnePolicy(cid);return cd?cd.name:'';}).filter(Boolean).join('·');
        return `<div style="display:flex;align-items:center;gap:7px;padding:7px 9px;background:${active?'#0d1a05':'var(--bg-input)'};border:1px solid ${active?'#3a6a1a':'var(--border)'};border-radius:2px">
          <span style="font-size:15px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(pdef,{size:15}):(pdef.icon)}</span>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Cinzel',serif;font-size:9px;color:${active?'var(--gold)':'var(--dim)'}">${pdef.name}</div>
            <div style="font-size:8px;color:#4a6040">${effStr}${pdef.cost?` · ${pdef.cost}G`:''}${pdef.popGrowthBonus?` · 인구성장+${Math.round(pdef.popGrowthBonus*100)}%`:''}</div>
            ${cnflNames?`<div style="font-size:7px;color:#7a4030">⚡ 상충: ${cnflNames}</div>`:''}
          </div>
          <button onclick="toggleDemesnePolicy('${pdef.id}')"
            style="padding:4px 8px;background:${active?'#0a1a00':'#1a0d00'};border:1px solid ${active?'#3a8a1a':'#3a2a0a'};color:${active?'#60c040':color};font-size:8px;cursor:pointer;font-family:'Cinzel',serif;white-space:nowrap;border-radius:2px">
            ${active?'해제':'시행'}</button>
        </div>`;
      }).join('')}
    </div></div>`;

  // ── 봉신 탭 ──
  const maxVassals=(d.tier||1)*2;
  const vassalContent=`<div style="padding:10px 12px">
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:6px">── 봉신 (${(d.vassals||[]).length}/${maxVassals}) ──</div>
    ${(d.vassals||[]).length>0?`<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:10px">
      ${(d.vassals||[]).map(v=>{
        const rd=VASSAL_ROLES[v.role]||VASSAL_ROLES['기사'];
        const bc=v.bond>=70?'#60d060':v.bond>=40?'#c8a040':'#d06030';
        const cooldowns=d.vassalBondCooldown||{};
        const coolLeft=Math.max(0,10-((S.msgCount||0)-(cooldowns[v.name]||0)));
        const sn=esc2(v.name);
        return `<div style="display:flex;align-items:center;gap:7px;padding:7px 9px;background:#0d1a05;border:1px solid #2a5a1a;border-radius:2px">
          <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(rd,{size:14}):(rd.icon)}</span>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold)">${sn} <span style="font-size:8px;color:var(--dim)">${v.role}</span></div>
            <div style="font-size:7px;color:#4a7040">${rd.desc}</div>
            <div style="display:flex;align-items:center;gap:4px;margin-top:2px">
              <div style="flex:1;height:3px;background:#0a0600;border-radius:2px;overflow:hidden"><div style="width:${v.bond||30}%;height:100%;background:${bc};border-radius:2px"></div></div>
              <span style="font-size:7px;color:${bc}">${v.bond||30}</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:3px">
            <button onclick="raiseDemesneVassalBond('${sn.replace(/'/g,"\\'")}')"
              style="padding:3px 5px;background:${coolLeft>0?'#0a0600':'#001400'};border:1px solid ${coolLeft>0?'#1a1005':'#305030'};color:${coolLeft>0?'#3a3a3a':'#50c050'};font-size:7px;cursor:${coolLeft>0?'not-allowed':'pointer'};font-family:'Cinzel',serif">
              ${coolLeft>0?`⏳${coolLeft}`:'유대 50G'}</button>
            <button onclick="removeDemesneVassal('${sn.replace(/'/g,"\\'")}')"
              style="padding:3px 5px;background:#140000;border:1px solid #503030;color:#c05050;font-size:7px;cursor:pointer;font-family:'Cinzel',serif">해제</button>
          </div></div>`;
      }).join('')}
    </div>`:`<div style="padding:12px;text-align:center;color:var(--dim);font-size:9px;margin-bottom:10px">아직 봉신이 없습니다.</div>`}
    ${(d.vassals||[]).length<maxVassals?`
    <div style="margin-bottom:6px;font-size:8px;color:var(--dim)">역할: ${Object.entries(VASSAL_ROLES).map(([r,rd])=>`${typeof getEntityIconHTML==='function'?getEntityIconHTML(rd,{size:8}):(rd.icon)}${r}(${rd.desc})`).join(' · ')}</div>
    <div style="display:flex;gap:4px">
      <input id="vassal-name-inp" placeholder="봉신 이름..." style="flex:1;padding:6px 8px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:'Crimson Text',serif;font-size:11px;outline:none;border-radius:2px">
      <select id="vassal-role-sel" style="padding:6px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:'Crimson Text',serif;font-size:11px;outline:none;border-radius:2px">
        ${Object.keys(VASSAL_ROLES).map(r=>`<option value="${r}">${r}</option>`).join('')}
      </select>
      <button onclick="addDemesneVassal(document.getElementById('vassal-name-inp').value,document.getElementById('vassal-role-sel').value)"
        style="padding:6px 10px;background:#1a1200;border:1px solid var(--gold);color:var(--gold);font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">+ 등록</button>
    </div>`:`<div style="font-size:9px;color:var(--dim);text-align:center">최대 봉신 수 도달</div>`}
  </div>`;

  // ── 교역 탭 ──
  const tradeContent=`<div style="padding:10px 12px">
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:8px">── 교역 파트너 ──</div>
    <div style="display:flex;flex-direction:column;gap:5px">
      ${DEMESNE_TRADE_PARTNERS.map(tp=>{
        const active=(d.tradePartners||[]).includes(tp.id);
        let fgScore=0;
        // [B83 FIX] fg.factions가 아니라 fg.gauges가 실제 필드명.
        try{ const fg=typeof loadFactionGauge==='function'?loadFactionGauge():{};
          fgScore=(fg.gauges||{})[tp.requiredFaction]||0; }catch(e){}
        const canActivate=fgScore>=tp.factionThreshold||active;
        return `<div style="display:flex;align-items:center;gap:7px;padding:7px 9px;background:${active?'#0d1a05':'var(--bg-input)'};border:1px solid ${active?'#3a6a1a':canActivate?'var(--border)':'#1a0a00'};border-radius:2px">
          <span style="font-size:15px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tp,{size:15}):(tp.icon)}</span>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Cinzel',serif;font-size:9px;color:${active?'var(--gold)':canActivate?'var(--dim)':'#4a3020'}">${tp.name}</div>
            <div style="font-size:8px;color:#4a6040">+${tp.income}G/5턴${tp.defBonus?` · 방어+${tp.defBonus}`:''}${tp.prosBonus?` · 번영+${tp.prosBonus}`:''}</div>
            <div style="font-size:7px;color:${fgScore>=tp.factionThreshold?'#50c050':'#c05030'}">${tp.requiredFaction}: ${fgScore}/${tp.factionThreshold}</div>
          </div>
          <button onclick="toggleDemesneTradePartner('${tp.id}')"
            style="padding:4px 7px;background:${active?'#0a1a00':'#1a0d00'};border:1px solid ${active?'#3a8a1a':canActivate?'#3a2a0a':'#1a0a00'};color:${active?'#60c040':canActivate?color:'#4a3020'};font-size:8px;cursor:${canActivate?'pointer':'not-allowed'};font-family:'Cinzel',serif;border-radius:2px">
            ${active?'해제':canActivate?'체결':'잠김'}</button>
        </div>`;
      }).join('')}
    </div></div>`;

  // ── ★v4 인구 탭 ──
  const popContent=`<div style="padding:10px 12px">
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:8px">── 도시 성장 & 인구 ──</div>
    <!-- 도시 단계 진행도 -->
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:9px;color:var(--dim)">단계 진행</div>
      <div style="display:flex;gap:3px;margin-bottom:8px">
        ${POP_STAGES.map((s,i)=>`
          <div style="flex:1;text-align:center;padding:5px 2px;background:${i<=(d.popStage||0)?s.color+'22':'#050300'};border:1px solid ${i<=(d.popStage||0)?s.color+'88':'#1a0a00'};border-radius:2px">
            <div style="color:${i<=(d.popStage||0)?s.color:'#3a2a10'};display:flex;justify-content:center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:16}):(s.svgIcon||s.icon)}</div>
            <div style="font-size:6px;color:${i<=(d.popStage||0)?s.color:'#3a2a10'};font-family:'Cinzel',serif">${s.name}</div>
            <div style="font-size:6px;color:#3a2a10">${_fmtPop(s.threshold)||'시작'}</div>
          </div>`).join('')}
      </div>
    </div>
    <!-- 현재 인구 상세 -->
    <div style="padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:2px;margin-bottom:8px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <div>
          <div style="font-size:8px;color:var(--dim)">현재 인구</div>
          <div style="font-family:'Cinzel',serif;font-size:14px;color:${stage.color}">${_fmtPop(pop)}명</div>
        </div>
        <div>
          <div style="font-size:8px;color:var(--dim)">역대 최고</div>
          <div style="font-family:'Cinzel',serif;font-size:14px;color:var(--gold)">${_fmtPop(d.popPeak||pop)}명</div>
        </div>
        <div>
          <div style="font-size:8px;color:var(--dim)">성장률 (5턴)</div>
          <div style="font-family:'Cinzel',serif;font-size:12px;color:${growthRate>=0?'#60c060':'#e06060'}">${(growthRate*100).toFixed(2)}%</div>
        </div>
        <div>
          <div style="font-size:8px;color:var(--dim)">도시 단계</div>
          <div style="font-family:'Cinzel',serif;font-size:12px;color:${stage.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stage,{size:12}):(stage.icon)} ${stage.name}</div>
        </div>
      </div>
    </div>
    <!-- 성장 요인 -->
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);margin-bottom:5px">── 성장 요인 ──</div>
    <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:10px">
      ${[
        {label:'번영도 기여',    val:(res.prosperity-50)*0.001, icon:'🌟'},
        {label:'농장 레벨',      val:((d.buildings?.farm?.level||0))*0.008, icon:'🌾'},
        {label:'시장 레벨',      val:((d.buildings?.market?.level||0))*0.006, icon:'🏪'},
        {label:'신전 레벨',      val:((d.buildings?.temple?.level||0))*0.010, icon:'⛪'},
        {label:'계절 보정',      val:getDemesneSeason(d.season||0).popGrowthMod||0, icon:season.icon},
        {label:'단계 과밀 패널티', val:-(d.popStage||0)*0.003, icon:'📉'},
      ].map(f=>`
        <div style="display:flex;justify-content:space-between;font-size:8px;padding:2px 4px;background:${f.val>=0?'#050d05':'#0d0505'};border-radius:2px">
          <span style="color:var(--dim)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(f,{size:16}):(f.icon)} ${f.label}</span>
          <span style="color:${f.val>=0?'#60c060':'#e06060'};font-family:'Cinzel',serif">${f.val>=0?'+':''}${(f.val*100).toFixed(2)}%</span>
        </div>`).join('')}
    </div>
    <!-- 성장 기록 -->
    ${(d.popGrowthLog||[]).length>0?`
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);margin-bottom:5px">── 인구 변화 기록 ──</div>
    <div style="display:flex;flex-direction:column;gap:2px">
      ${[...(d.popGrowthLog||[])].reverse().slice(0,8).map(log=>`
        <div style="display:flex;justify-content:space-between;font-size:8px;padding:2px 4px;border-bottom:1px solid var(--border)">
          <span style="color:var(--dim)">턴${log.turn}</span>
          <span style="color:${getPopStage(log.stage||0).color}">${(()=>{const ps=getPopStage(log.stage||0);return typeof getEntityIconHTML==='function'?getEntityIconHTML(ps,{size:11}):ps.icon;})()}</span>
          <span style="color:var(--gold);font-family:'Cinzel',serif">${_fmtPop(log.pop)}명</span>
          <span style="color:${(log.rate||0)>=0?'#60c060':'#e06060'}">${(log.rate||0)>=0?'+':''}${log.rate||0}%</span>
        </div>`).join('')}
    </div>`:''}
    <!-- 단계별 잠금 해제 건물 안내 -->
    <div style="margin-top:10px;font-family:'Cinzel',serif;font-size:9px;color:var(--dim);margin-bottom:5px">── 단계별 특수 건물 ──</div>
    ${POP_STAGES.filter(s=>s.unlockBuildings?.length>0).map(s=>`
      <div style="padding:5px 8px;background:${(d.popStage||0)>=s.stage?'#0d1a05':'#050300'};border:1px solid ${(d.popStage||0)>=s.stage?'#2a5a1a':'#1a0a00'};border-radius:2px;margin-bottom:4px">
        <div style="font-size:8px;color:${(d.popStage||0)>=s.stage?'var(--gold)':'#4a3010'}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:8}):(s.icon)} ${s.name} (${_fmtPop(s.threshold)}명)</div>
        <div style="font-size:8px;color:${(d.popStage||0)>=s.stage?'#50c050':'#3a2010'};margin-top:2px">
          ${s.unlockBuildings.map(bid=>{const b=getDemesneBuilding(bid);return b?`${b.icon}${b.name}`:null;}).filter(Boolean).join(', ')}
          ${(d.popStage||0)>=s.stage?'':'— 🔒 잠김'}
        </div>
      </div>`).join('')}
  </div>`;

  // ── 조정 탭 ──
  const adjustContent=`<div style="padding:10px 12px">
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:8px">── 수동 자원 조정 ──</div>
    ${[
      {key:'tax',       label:'세수',icon:'💰',color:'#e0c040',val:res.tax},
      {key:'prosperity',label:'번영',icon:'🌟',color:'#60c060',val:res.prosperity},
      {key:'defense',   label:'방어',icon:'🛡️',color:'#4080e0',val:res.defense},
      {key:'loyalty',   label:'충성',icon:'❤️',color:'#e05060',val:res.loyalty},
    ].map(r=>`
      <div style="margin-bottom:7px;padding:7px;background:var(--bg-input);border:1px solid var(--border);border-radius:2px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
          <span style="font-family:'Cinzel',serif;font-size:9px;color:${r.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:9}):(r.icon)} ${r.label}</span>
          <span style="font-family:'Cinzel',serif;font-size:12px;color:${r.color}">${r.val}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:3px">
          <button onclick="adjustDemesneResource('${r.key}',-10)" style="padding:5px 0;background:#140000;border:1px solid #503030;color:#e05050;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">−10</button>
          <button onclick="adjustDemesneResource('${r.key}',-3)"  style="padding:5px 0;background:#0d0000;border:1px solid #301818;color:#a04040;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">−3</button>
          <button onclick="adjustDemesneResource('${r.key}',3)"   style="padding:5px 0;background:#000d00;border:1px solid #183018;color:#40a040;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">+3</button>
          <button onclick="adjustDemesneResource('${r.key}',10)"  style="padding:5px 0;background:#001400;border:1px solid #305030;color:#50c050;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">+10</button>
        </div>
      </div>`).join('')}
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin:10px 0 6px">── 영지 이름 변경 ──</div>
    <div style="display:flex;gap:5px;margin-bottom:12px">
      <input id="demesne-rename-inp" placeholder="새 영지 이름..." value="${esc2(d.name)}"
        style="flex:1;padding:6px 8px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:'Crimson Text',serif;font-size:11px;outline:none;border-radius:2px">
      <button onclick="renameDemesne(document.getElementById('demesne-rename-inp').value)"
        style="padding:6px 10px;background:#1a1200;border:1px solid var(--gold);color:var(--gold);font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">변경</button>
    </div>
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:6px">── 영지 메모 ──</div>
    <textarea id="demesne-note-area" rows="3" placeholder="스토리 메모..."
      style="width:100%;padding:8px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-family:'Crimson Text',serif;font-size:11px;outline:none;resize:vertical;line-height:1.5;border-radius:2px"
      oninput="saveDemesneNote(this.value)">${esc2(d.note||'')}</textarea>
  </div>`;

  // ── 기록 탭 ──
  const historyContent=(d.history||[]).length?`<div style="padding:10px 12px">
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:6px">── 최근 기록 ──</div>
    ${[...(d.history||[])].reverse().slice(0,20).map(h=>`
      <div style="display:flex;align-items:center;gap:5px;padding:4px 0;border-bottom:1px solid var(--border);font-size:9px">
        <span style="flex:1;color:var(--gold)">${esc2(h.label)}</span>
        ${h.cost&&h.cost>0?`<span style="color:#c06030">-${h.cost}G</span>`:h.cost&&h.cost<0?`<span style="color:#50c050">+${Math.abs(h.cost)}G</span>`:''}
        <span style="color:var(--dim);font-size:8px">턴${h.turn}</span>
      </div>`).join('')}
    <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin:10px 0 6px">── 성취 ──</div>
    ${(d.achievements||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:4px">
      ${(d.achievements||[]).map(id=>{
        const a=DEMESNE_ACHIEVEMENTS.find(ac=>ac.id===id);
        return a?`<div style="padding:4px 7px;background:#0d1a05;border:1px solid #2a5a1a;font-size:8px;color:var(--gold);border-radius:2px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(a,{size:8}):(a.icon)} ${a.name}</div>`:'';
      }).join('')}
    </div>`:`<div style="font-size:9px;color:var(--dim)">아직 성취가 없습니다.</div>`}
  </div>`:`<div style="padding:20px;text-align:center;color:var(--dim);font-size:9px">아직 기록이 없습니다.</div>`;

  const tipBox=`<div style="margin:8px 12px;padding:7px;background:var(--bg-screen);border:1px dashed var(--border);font-size:9px;color:var(--dim);line-height:1.6">
    💡 인구가 임계점을 넘으면 도시 단계가 승급되고 특수 건물이 잠금 해제됩니다. 농장·시장·신전 건설, 이민 장려령·출산 장려금 정책으로 성장을 가속할 수 있습니다.
  </div>`;

  const tabContent=tab==='buildings'?buildingContent:tab==='policies'?policyContent:tab==='vassals'?vassalContent:tab==='trade'?tradeContent:tab==='population'?popContent:tab==='adjust'?adjustContent:historyContent;

  body.innerHTML=evBanner+header+upgradeBlock+tabBar+`<div class="scrollable" style="overflow-y:auto">`+tabContent+tipBox+`</div>`;
}
window.renderDemesnePanel = renderDemesnePanel;

window.renderDemesnePanel         = renderDemesnePanel;

window.setDemesneTab              = setDemesneTab;

window.buildDemesneBuilding       = buildDemesneBuilding;

window.demolishDemesneBuilding    = demolishDemesneBuilding;

window.toggleDemesnePolicy        = toggleDemesnePolicy;

window.upgradeDemesneTier         = upgradeDemesneTier;

window.resolveDemesneEvent        = resolveDemesneEvent;

window.establishDemesne           = establishDemesne;

window.renameDemesne              = renameDemesne;

window.getDemesneBLS              = getDemesneBLS;

window.applyDemesneStats          = applyDemesneStats;

window.checkDemesneEvents         = checkDemesneEvents;

window.checkDemesneAchievements   = checkDemesneAchievements;

window.tickDemesneResources       = tickDemesneResources;

window.adjustDemesneResource      = adjustDemesneResource;

window.addDemesneVassal           = addDemesneVassal;

window.removeDemesneVassal        = removeDemesneVassal;

window.raiseDemesneVassalBond     = raiseDemesneVassalBond;

window.saveDemesneNote            = saveDemesneNote;

window.toggleDemesneTradePartner  = toggleDemesneTradePartner;

window.loadDemesne                = loadDemesne;

window.clearDemesne               = clearDemesne;

window.checkDemesneDefenseWarning = checkDemesneDefenseWarning;

window.calcPopGrowthRate          = calcPopGrowthRate;

window._fmtPop                    = _fmtPop;

// [버그 수정] 이 자리에 있던 hookDemesneAll IIFE도 window.sendMsg를 감싸는
// 방식이라(다른 죽은 훅들과 같은 원인) 한 번도 실행되지 않았다.
// checkDemesneDefenseWarning()은 sendMsg() 전송 직전(원래 순서: AI 호출 전),
// tickDemesneResources()는 AI 응답 렌더링 후(원래 순서: AI 호출 후)에 맞춰
// quest/086의 sendMsg() 안에 네이티브로 연결했다.

(function hookDemesneToPrompt(){
  const tryPatch=()=>{
    if(window._demesnePromptPatched) return;
    const fnName=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fnName){setTimeout(tryPatch,2200);return;}
    window._demesnePromptPatched=true;
    const _orig=window[fnName];
    window[fnName]=function(...args){
      const result=_orig.apply(this,args);
      const bls=getDemesneBLS();
      if(!bls) return result;
      if(typeof result==='string') return result+'\n'+bls;
      return result;
    };
  };
  setTimeout(tryPatch,2700);
})();

// [버그 수정] 이 자리에 있던 hookDemesneClearOnNewGame도 같은 이유
// (window.newGame이라는 함수 자체가 존재한 적이 없음)로 절대 실행되지
// 못했다 — clearDemesne()와 영지 확장 시스템(v5/라이벌 영지/세계 정착지)
// 초기화가 한 번도 호출된 적이 없어서, 새 캐릭터를 만들어도 이전
// 캐릭터의 영지 상태가 전부 그대로 남아있던 버그였다. core/084의
// _doNewGame() 안에 네이티브로 옮겨 연결했다.

// [버그 수정] 이 자리에 있던 hookDemesneToRenderPanel은 window.renderPanel을
// 감싸는 방식이라(다른 죽은 훅들과 동일한 원인) 절대 적용되지 못했다.
// 다만 '영지 관리' 메뉴의 모든 실제 진입점(openP('demesne') 뒤에)이
// renderDemesnePanel()/setDemesneTab()을 직접 같이 호출하고 있어 겉으로는
// 멀쩡했다. quest/086의 진짜 renderPanel(name) switch에 'demesne'
// 케이스를 방어적으로 추가해 이 우회 경로에 의존하지 않도록 정리했다.

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_234(){
window.loadBeastWildlaw        = loadBeastWildlaw;

window.saveBeastWildlaw        = saveBeastWildlaw;

window.clearBeastWildlaw       = clearBeastWildlaw;

window.isBeastRace             = isBeastRace;

window.triggerBeastAction      = triggerBeastAction;

window.addPackMember           = addPackMember;

window.increaseMemberBond      = increaseMemberBond;

window.removePackMember        = removePackMember;

window.addTerritory            = addTerritory;

window.applyBeastWildlawStats  = applyBeastWildlawStats;

window.detectBeastWildlawFromText = window.detectBeastWildlawFromText;

window.getBeastWildlawStatus   = getBeastWildlawStatus;

window.getBeastPackRankStage   = getBeastPackRankStage;

window.getBeastBloodStage      = getBeastBloodStage;

window.getBeastHunterCodeStage = getBeastHunterCodeStage;

const _origDetectBeastWildlaw = window.detectBeastWildlawFromText;

window.detectBeastWildlawFromText = function(text) {
  if (_origDetectBeastWildlaw) _origDetectBeastWildlaw(text);
  detectBeastPackBondFromText(text);
  detectBeastLineageFromText(text);
};

window.renderDungeonUI       = renderDungeonUI;

window.buildFullDataSnapshot  = window.buildFullDataSnapshot;

window.fallbackParseNarrative = window.fallbackParseNarrative || function(){};

window.renderAILocationsPanel = renderAILocationsPanel;

window.checkNPCLocationHint   = checkNPCLocationHint;

window.openNpcQuestDialog = openNpcQuestDialog;

window._closeNpcQuestDlg  = _closeNpcQuestDlg;

if (!window._nqdAccept) window._nqdAccept = window._nqdAccept;

window._nqdDecline        = _nqdDecline;

window.checkNpcDlgQuestCompletion = checkNpcDlgQuestCompletion;

function getFactionGaugeBLS(){
  const fg = loadFactionGauge();
  const factions = getCurrentFactions ? getCurrentFactions() : {};
  const gauges = fg.gauges || {};
  const active = Object.entries(gauges).filter(([k,v])=>factions[k]&&Math.abs(v)>=15);
  if(!active.length) return '';
  const lines = active.map(([k,v])=>{
    const f = factions[k]||{};
    const st = getFGStage(v);
    return `  • ${f.icon||''}${k}: ${st.icon}${st.label}(${v>0?'+':''}${v}) — ${st.aiHint}`;
  }).join('\n');
  return `[⚖️ 파벌 기울기 (플레이어 포지션)]\n${lines}`;
}
window.getFactionGaugeBLS = getFactionGaugeBLS;

window.getFactionGaugeBLS      = window.getFactionGaugeBLS;
}

