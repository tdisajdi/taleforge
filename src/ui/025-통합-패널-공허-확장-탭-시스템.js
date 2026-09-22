// 🌑 통합 패널 — 공허 확장 탭 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { ECHO_MILESTONES } from '../data/021-1-죽음의-메아리-시스템.js';
import { AWAKENING_POWER_SKILLS, ELF_MEMORY_GAIN, ELF_RESTORE_METHODS, ELF_SPECIALIZATIONS, EMOTION_SKILLS, HUMAN_DEED_GAIN, HUMAN_FATE_PATHS, HUMAN_PATH_SKILLS, NPC_INSPIRE_METHODS, NPC_INSPIRE_STAGES } from '../data/025-통합-패널-공허-확장-탭-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { saveSkills } from '../job/002-스킬-시스템.js';
import { loadNPCs } from '../misc/001-block0-preamble.js';
import { clearDeathEcho, detectDeathEchoFromText, gainDeathEcho, getDeathEchoStatus, loadDeathEcho, renderDeathEchoPanel } from '../misc/021-1-죽음의-메아리-시스템.js';
import { getVoidSenseAIHint, getVoidSenseBonus, renderVoidSensePanel } from '../misc/022-2-공허-감지-시스템.js';
import { getPlayerMaxHp, getPlayerMaxMp } from '../misc/054-이동수단-시스템.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { DARKLING_VOID_STAGES, loadDarklingVoid, renderDarklingVoidPanel } from '../progression/020-101130번-환생-누적-시스템.js';
import { grantTitle } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { clearShadowPact, enforceOrCursePact, initShadowPact, loadShadowPact, releasePact, renderShadowPactPanel } from '../race/024-4-그림자-협약-시스템-다크링-핵심-협상-도구.js';
import { activateVoidSummon, clearVoidSummon, dismissVoidSummon, loadVoidSummon, renderVoidSummonPanel } from '../summon/023-3-균열-소환-시스템.js';
import { esc, lsDel, lsGet, lsSet, toast } from '../utils.js';

export function renderDarklingVoidExtPanel() {
  const body = document.getElementById('pb-darkling-void');
  if (!body) return;
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">🌟</div>
      <div>다크링 캐릭터에게만 활성화됩니다.</div>
    </div>`;
    return;
  }
  const dv = loadDarklingVoid();
  const color = DARKLING_VOID_STAGES[dv.stage||0]?.color || '#4060c0';
  // 활성 탭 상태
  const tabKey = 'darkling_ext_tab';
  // [23-3, 라우팅 버그 수정] 예전엔 이 4탭 UI가 window.renderDarklingVoidPanel을
  // 통째로 덮어써서, 공허 게이지·수동 획득 버튼을 보여주는 진짜
  // renderDarklingVoidPanel(progression/020)이 실제 게임에서 한 번도
  // 안 보였다(22-1 위임 작업 중 발견). 새 UI를 만드는 대신 이 파일의
  // 다른 4개 탭과 같은 관례(targetId를 받는 서브패널)로 게이지를
  // 5번째 탭으로 끼워넣는다 — 기본 탭도 '게이지'로 바꿔서 처음 열었을
  // 때 가장 먼저 보이게 한다(현재 단계·수치가 하위 기능보다 우선순위가
  // 높다고 판단).
  const activeTab = window[tabKey] || 'gauge';

  body.innerHTML = `
    <!-- 탭 헤더 -->
    <div style="display:flex;background:#000210;border-bottom:1px solid #0a1030;overflow-x:auto;-webkit-overflow-scrolling:touch;flex-shrink:0">
      ${[
        { id:'gauge', icon:'🌑', label:'게이지' },
        { id:'echo',  icon:'💀', label:'메아리' },
        { id:'sense', icon:'👁️', label:'감지' },
        { id:'summon',icon:'🌀', label:'소환' },
        { id:'pact',  icon:'🖤', label:'협약' },
      ].map(t => `
        <button onclick="window.${tabKey}='${t.id}';renderDarklingVoidExtPanel()"
          style="flex:1;min-width:60px;padding:9px 4px;background:${activeTab===t.id?'#000c20':'transparent'};border:none;border-bottom:2px solid ${activeTab===t.id?color:'transparent'};color:${activeTab===t.id?color:'#304060'};font-family:'Cinzel',serif;font-size:9px;cursor:pointer;transition:all .15s;white-space:nowrap">
          <div style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(t,{size:12}):(t.icon)}</div>
          <div style="margin-top:1px">${t.label}</div>
        </button>`).join('')}
    </div>
    <!-- 탭 컨텐츠 -->
    <div id="darkling-ext-tab-body" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch"></div>
  `;
  const tabBody = document.getElementById('darkling-ext-tab-body');
  if (!tabBody) return;
  if (activeTab === 'gauge')  renderDarklingVoidPanel('darkling-ext-tab-body');
  if (activeTab === 'echo')   renderDeathEchoPanel('darkling-ext-tab-body');
  if (activeTab === 'sense')  renderVoidSensePanel('darkling-ext-tab-body');
  if (activeTab === 'summon') renderVoidSummonPanel('darkling-ext-tab-body');
  if (activeTab === 'pact')   renderShadowPactPanel('darkling-ext-tab-body');
}
window.renderDarklingVoidExtPanel = renderDarklingVoidExtPanel;

window.renderDarklingVoidExtPanel = renderDarklingVoidExtPanel;

export function getDarklingExtContext() {
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) return '';
  const dv    = loadDarklingVoid();
  const echo  = loadDeathEcho();
  const vs    = loadVoidSummon();
  const sp    = loadShadowPact();
  const sense = getVoidSenseBonus();
  const stg   = DARKLING_VOID_STAGES[dv.stage || 0];

  let hint = `\n[🌑 다크링 고유 시스템 현황]\n`;

  // 공허 잠식 단계
  hint += `공허 단계: ${dv.stage}단계 — ${stg.name} (${dv.points}/1000)\n`;
  hint += `${stg.aiHint || ''}\n`;
  hint += `현재 오라: "${stg.aura}"\n`;
  hint += `빛 반응: ${stg.lightEffect}\n`;

  // 죽음의 메아리
  if ((echo.stacks || 0) > 0) {
    hint += `\n[💀 죽음의 메아리 ${echo.stacks}스택] 이 다크링은 처치한 ${echo.totalKills}개 존재의 기억과 능력 조각을 흡수했다. `;
    const reached = ECHO_MILESTONES.filter(m => echo.stacks >= m.stacks);
    if (reached.length > 0) {
      hint += `마일스톤 달성: ${reached.map(m => m.icon + m.name).join(', ')}. `;
    }
    const last3 = [...(echo.absorbed||[])].reverse().slice(0, 3);
    if (last3.length > 0) {
      hint += `최근 흡수: ${last3.map(a => a.icon + a.name + `(from ${a.from})`).join(', ')}. `;
    }
    hint += '메아리가 충분히 쌓인 다크링의 눈에는 죽은 자의 기억이 잔상처럼 겹쳐 보이는 묘사를 포함하라.\n';
  }

  // 공허 감지
  if (sense.grade > 0) {
    hint += `\n[👁️ 공허 감지: ${sense.label}] ${sense.desc} `;
    hint += `대화 중인 NPC의 숨겨진 의도·거짓말·공포를 이 다크링이 이미 파악하고 있다. `;
    hint += `AI는 협상·대화 장면에서 다크링이 상대보다 한 발 앞서 있다는 뉘앙스를 자연스럽게 포함하라. `;
    hint += `PER 판정 +${sense.perBonus}, 협상(NEG) +${sense.negBonus}, 거짓 탐지 +${sense.perBonus2}.\n`;
  }

  // 활성 소환체
  const activeSummons = vs.activeSummons || [];
  if (activeSummons.length > 0) {
    hint += `\n[🌀 공허 소환체 활성] `;
    hint += activeSummons.map(s => `${s.icon} ${s.name}(Tier ${s.tier}, HP ${s.hp})`).join(', ');
    hint += `. 이 존재들은 다크링 주변에 어른거리며 전투에 참여한다. 적들이 소환체를 보고 공황 반응을 보이는 묘사를 포함하라.\n`;
  }

  // 그림자 협약
  const activePacts = (sp.pacts || []).filter(p => p.status === 'active');
  const cursedPacts = (sp.pacts || []).filter(p => p.status === 'cursed');
  if (activePacts.length > 0) {
    hint += `\n[🖤 그림자 협약 활성] 다음 NPC의 그림자가 이 다크링의 공허 속에 포획돼 있다: `;
    hint += activePacts.map(p => `"${p.target}"(저주 강도 ${p.curseStrength})`).join(', ');
    hint += `. 이들은 이 다크링과 마주칠 때 무의식적 압박감을 느낀다. 조건: "${activePacts.map(p=>p.condition).join(' / ')}". `;
    hint += `AI는 이 NPC들이 다크링의 요구에 대해 저항하고 싶어도 내면에서 억압되는 묘사를 넣어라.\n`;
  }
  if (cursedPacts.length > 0) {
    hint += `[⛓️ 저주 집행 중] ${cursedPacts.map(p => `"${p.target}"`).join(', ')}에게 그림자 저주가 발동 중이다. 이들은 어둠 속에서 자신의 그림자가 다크링의 형상으로 변하는 공포를 경험하고 있다.\n`;
  }

  return hint;
}
window.getDarklingExtContext = getDarklingExtContext;

setTimeout(() => {
  if (typeof window.buildLightSystem === 'function' && !window._darklingExtBLSWrapped) {
    window._darklingExtBLSWrapped = true;
    const _origBLS = window.buildLightSystem;
    window.buildLightSystem = function(...args) {
      let result = _origBLS.apply(this, args);
      const darkCtx = getDarklingExtContext();
      if (darkCtx && typeof result === 'string') {
        if (!result.includes('[🌑 다크링 고유 시스템 현황]')) {
          result = result + darkCtx;
        }
      }
      return result;
    };
  }
}, 1500);

window.getDarklingExtContext = getDarklingExtContext;

// [19차 감사 FIX] ELF_MEMORY_KEY가 이 파일 어디에도 선언된 적이 없어
// loadElfMemory/saveElfMemory/clearElfMemory를 호출하는 순간(정의 시점이
// 아니라 실행 시점이라 node --check/빌드에서는 걸리지 않음)
// ReferenceError가 발생했다 — 엘프 종족의 기억 시스템 전체(조회/저장/
// 환생 시 초기화)가 사실상 매번 예외를 던지던 활성 버그. doReincarnate()
// 헤드리스 재현으로 실제 발생을 확인했다.
export const ELF_MEMORY_KEY = 'tf-elf-memory-v2';

export const loadElfMemory  = () => {
  try {
    const raw = lsGet(ELF_MEMORY_KEY);
    if (raw) return JSON.parse(raw);
    // 구버전 키 마이그레이션
    const oldRaw = lsGet("tf-elf-memory");
    if (oldRaw) {
      const old = JSON.parse(oldRaw);
      return { points: old.points||0, stage: old.stage||0, history: old.history||[],
        memory: old.memory||{bond:0,knowledge:0,loss:0,oath:0,place:0},
        forgetCount: old.forgetCount||0, awakened: false, specialization: 'none',
        specPoints: {bond:0,knowledge:0,loss:0,oath:0,place:0},
        forgottenNPCs: [], curseTargets: [], natureBondLevel: 0 };
    }
  } catch(e) {}
  return { points:0, stage:0, history:[], memory:{bond:0,knowledge:0,loss:0,oath:0,place:0},
    forgetCount:0, awakened:false, specialization:'none',
    specPoints:{bond:0,knowledge:0,loss:0,oath:0,place:0},
    forgottenNPCs:[], curseTargets:[], natureBondLevel:0 };
};

export const saveElfMemory  = (d) => { try{ lsSet(ELF_MEMORY_KEY, JSON.stringify(d)); }catch(e){} };

export const clearElfMemory = () => { lsDel(ELF_MEMORY_KEY); lsDel("tf-elf-memory"); };

export const ELF_MEMORY_STAGES = [
  {
    stage:0, name:"잠든 기억", icon:"🧝", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2" opacity="0.5"/></svg>`, color:"#30a080", threshold:0,
    desc:"기억의 씨앗이 아직 깨어나지 않은 상태. 천년 기억이 잠들어 있다.",
    statBonus:{}, statPenalty:{}, skills:[],
    aura:"평범한 엘프로 보인다. 기억의 기운이 없다.",
    aiHint:""
  },
  {
    stage:1, name:"각인의 눈", icon:"🧝👁️", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="8" ry="5" stroke-width="1.3"/><circle cx="12" cy="12" r="2"/></svg>`, color:"#38b890", threshold:50,
    desc:"눈에 담은 것이 결정처럼 새겨진다. 한 번 본 얼굴·장소·거짓말을 절대 잊지 않는다.",
    statBonus:{ per:8, int:5, wis:4 }, statPenalty:{ mad:-2 },
    skills:[
      { id:"em_s1_crystal_eye", name:"결정의 눈", icon:"👁️", type:"passive",
        desc:"만난 NPC의 감정 상태와 진심이 자동으로 읽힌다. PER +10, 거짓말 자동 탐지.",
        rarity:"uncommon", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{per:80, int:40} }
    ],
    aura:"눈빛이 깊어진다. 상대는 이 시선 아래서 거짓말하기 어렵다.",
    aiHint:"1단계 기억: 과거에 만난 NPC나 장소를 정확히 기억하는 묘사. 눈이 유리처럼 맑고 깊다. 상대가 거짓말할 때 캐릭터가 눈치채는 장면."
  },
  {
    stage:2, name:"연결된 기억", icon:"📿🧝", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="10" r="1.8"/><circle cx="17" cy="10" r="1.8"/><circle cx="12" cy="16" r="1.8"/><path d="M7 10 L17 10 M7 10 L12 16 M17 10 L12 16"/></svg>`, color:"#40c898", threshold:120,
    desc:"기억들이 살아 숨쉬며 연결된다. 과거 실마리가 현재를 밝힌다. 특화 계열이 형성되기 시작한다.",
    statBonus:{ per:14, int:11, wis:9, mgc:6 }, statPenalty:{ mad:-4, str:-2 },
    skills:[
      { id:"em_s2_memory_link", name:"기억 연결", icon:"📿", type:"active",
        desc:"MP 12. 과거 경험에서 단서를 추출해 현재 판정에 적용. INT·WIS 판정 +22.",
        rarity:"rare", mpCost:12, condition:null, conditionDesc:null, statBoost:{} },
      { id:"em_s2_truth_weave", name:"거짓의 결", icon:"🔍", type:"passive",
        desc:"대화 중 거짓말이 '금 간 도자기'처럼 느껴진다. 상대의 숨은 의도 자동 감지.",
        rarity:"rare", mpCost:0, condition:"in_dialogue", conditionDesc:"대화 중", statBoost:{per:100} }
    ],
    aura:"기억의 파동이 은은히 흐른다. NPC들이 이 엘프 앞에서 더 솔직해진다.",
    aiHint:"2단계 기억: 과거 정보를 연결해 단서를 발견하는 묘사. 대화 중 거짓을 눈치채는 장면. 기억 특화 계열(인연·지식·상실·서약·자연)이 드러나기 시작."
  },
  {
    stage:3, name:"천년의 눈", icon:"🌿🧝", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 6 C14 6 15 4.5 15 3 C13.5 3 12 4 12 6 Z" stroke-width="1.2"/><ellipse cx="12" cy="12" rx="9" ry="5.5" stroke-width="0.9" opacity="0.5"/></svg>`, color:"#48d8a8", threshold:220,
    desc:"천년의 역사가 눈 속에 깃들었다. 특화 계열 전용 스킬이 강력하게 각성한다.",
    statBonus:{ per:22, int:18, wis:16, mgc:12, luk:6 }, statPenalty:{ mad:-9, str:-5, wil:-3 },
    skills:[
      { id:"em_s3_ancient_sight", name:"고대의 시야", icon:"🌿", type:"active",
        desc:"MP 20. 장소에 깃든 과거 기억을 열람. 그 장소에서 일어난 중요 사건을 시각화.",
        rarity:"rare", mpCost:20, condition:null, conditionDesc:null, statBoost:{} },
      { id:"em_s3_spec_awaken", name:"특화 각성", icon:"⚡", type:"event",
        desc:"주 특화 계열의 전용 능력이 크게 강화된다. 특화 유형 행동 시 추가 기억력 획득.",
        rarity:"rare", mpCost:0, condition:"spec_action", conditionDesc:"특화 행동 시", statBoost:{} }
    ],
    aura:"존재에서 고요한 권위가 느껴진다. 신성 NPC들이 경의를 표한다.",
    aiHint:"3단계 기억: 눈에 천년의 깊이가 느껴진다. 장소에 스민 역사를 읽어내는 묘사. 거짓말이 통하지 않는다. 특화 계열에 따라 외형이 변하기 시작(인연→눈이 은빛, 지식→손에서 서책 빛, 상실→눈물 자국 같은 흉터, 서약→손목 룬, 자연→피부에 나뭇결)."
  },
  {
    stage:4, name:"기억의 수호자", icon:"🏛️🧝", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21 L4 9 L6 9 L6 7 L8 7 L8 9 L10.5 9 L10.5 6 L13.5 6 L13.5 9 L16 9 L16 7 L18 7 L18 9 L20 9 L20 21 Z" stroke-linejoin="round"/></svg>`, color:"#50e8b8", threshold:350,
    desc:"기억이 무기가 된다. 특화 계열이 완전히 개화하며 게임 세계에 직접적인 변화를 일으킨다.",
    statBonus:{ per:32, int:26, wis:24, mgc:20, luk:11, trst:13 }, statPenalty:{ mad:-15, str:-7, wil:-6, fath:-4 },
    skills:[
      { id:"em_s4_spec_weapon", name:"기억의 무기", icon:"💠", type:"active",
        desc:"특화 계열에 따라 완전히 다른 강력 스킬 발동. 인연→영령 소환, 지식→마법 카운터, 상실→분노 폭발, 서약→저주 반사, 자연→지형 제어.",
        rarity:"epic", mpCost:30, condition:null, conditionDesc:null, statBoost:{} },
      { id:"em_s4_living_archive", name:"살아있는 서고", icon:"🏛️", type:"passive",
        desc:"과거에 만난 모든 NPC의 현재 상태(생사·위치·감정)가 직감으로 느껴진다.",
        rarity:"epic", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{per:180, int:140, wis:120} }
    ],
    aura:"기억의 파문이 눈에 보인다. 동족 엘프들이 자연스럽게 정보를 가져온다.",
    aiHint:"4단계 기억: 캐릭터 주변에 과거의 잔상이 어른거린다. 특화 계열에 맞는 외형 변화가 뚜렷해진다. 잃어버린 동료의 목소리가 들리거나(상실), 자연이 말을 걸거나(자연), 서약한 목표가 어디 있든 위치가 느껴지는(서약) 묘사."
  },
  {
    stage:5, name:"살아있는 역사", icon:"📖🧝", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/></svg>`, color:"#58f8c8", threshold:520,
    desc:"세계의 역사 그 자체가 된다. 과거 만난 모든 존재의 현재를 직감으로 안다. 특화 능력이 세계에 영향을 미친다.",
    statBonus:{ per:46, int:38, wis:35, mgc:30, luk:17, trst:22, rep:15 }, statPenalty:{ mad:-24, str:-11, wil:-9, fath:-7 },
    skills:[
      { id:"em_s5_history_walk", name:"역사의 발걸음", icon:"📖", type:"active",
        desc:"MP 45. 기억 속 강력한 고대 엘프 영웅의 힘을 3턴간 빌린다. 모든 스탯 +28.",
        rarity:"legendary", mpCost:45, condition:null, conditionDesc:null, statBoost:{} },
      { id:"em_s5_world_memory", name:"세계 기억망", icon:"🌐", type:"event",
        desc:"세계 전역의 중요 사건이 꿈처럼 감지된다. 숨겨진 퀘스트·위기 자동 탐지. 특화 영역 퀘스트 우선 감지.",
        rarity:"legendary", mpCost:0, condition:"activate", conditionDesc:"직접 발동", statBoost:{} }
    ],
    aura:"이 엘프가 지나간 자리에 역사의 무게가 내려앉는다. 어떤 NPC도 과거를 숨길 수 없다.",
    aiHint:"5단계 기억: 캐릭터가 세계의 현재 사건들을 직감으로 감지하는 묘사. 역사의 산 증인으로서의 위엄. 특화 계열에 따라 세계의 특정 영역(인연→사람들의 네트워크, 지식→금지된 마법 도서관, 상실→전장의 망자들, 서약→모든 계약의 흐름, 자연→대지의 상처)을 인식."
  },
  {
    stage:6, name:"기억의 군주", icon:"👑🌿", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M12 21 L12 6" stroke-width="0.9" opacity="0.5"/></svg>`, color:"#60ffcc", threshold:750,
    desc:"기억 자체를 지배한다. 타인의 기억에 손을 뻗고, 특화 능력이 신의 영역에 가까워진다.",
    statBonus:{ per:62, int:52, wis:48, mgc:42, luk:25, trst:32, rep:26, wil:20 }, statPenalty:{ mad:-37, str:-15, fath:-11 },
    skills:[
      { id:"em_s6_memory_domain", name:"기억의 영역", icon:"💠", type:"passive",
        desc:"반경 내 모든 존재의 기억이 열린 책처럼 느껴진다. 적 전략 사전 파악, 아군 기억 공유. 특화 영역 내에서는 신적 권능 수준.",
        rarity:"legendary", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{per:340, int:300, wis:280, mgc:220} },
      { id:"em_s6_memory_seal", name:"기억 봉인", icon:"🔒", type:"active",
        desc:"HP 40 소모. 대상의 특정 기억 영구 봉인. 봉인된 기술·지식 사용 불가. 특화 계열에 따라 봉인 방식이 달라진다.",
        rarity:"legendary", mpCost:0, condition:null, conditionDesc:null, statBoost:{} }
    ],
    aura:"과거·현재·미래의 기억이 이 존재를 중심으로 흐른다. 망각이 허락되지 않는 세계.",
    aiHint:"6단계 기억: 캐릭터가 존재하는 공간 전체가 기억의 도서관이 된다. 세계가 이 엘프를 역사의 수호자로 인정. 특화 계열이 완성되어 외형이 완전히 변화(인연→몸에서 과거 만난 이들의 실루엣이 비쳐보임, 지식→눈이 책의 문자로 빛남, 상실→눈물이 검고 주변에 망자의 기운, 서약→전신에 계약 룬이 빛남, 자연→몸 자체가 나무와 결합)."
  },
  {
    stage:7, name:"세계의 증인", icon:"🌍🧝", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></svg>`, color:"#70ffd8", threshold:1000,
    desc:"기억이 종착점에 달했다. 죽어도 기억만은 다음 생으로 이어지는 불멸의 증인. 특화 능력이 세계의 법칙이 된다.",
    statBonus:{ per:82, int:70, wis:66, mgc:58, luk:36, trst:44, rep:38, wil:30 }, statPenalty:{ mad:-52, str:-19 },
    skills:[
      { id:"em_s7_eternal_witness", name:"불멸의 증언", icon:"🌍", type:"active",
        desc:"HP 70 소모. 세계 창조부터 현재까지의 진실을 증언. 모든 비밀·거짓·음모 자동 폭로. 특화 계열에 따라 추가 효과 발동.",
        rarity:"legendary", mpCost:0, condition:null, conditionDesc:null, statBoost:{} },
      { id:"em_s7_memory_reborn", name:"기억의 환생", icon:"♾️", type:"passive",
        desc:"사망 시 기억만은 소멸하지 않는다. 환생 후에도 전생의 중요 기억·스킬이 계승. 특화 계열이 환생 후에도 유지.",
        rarity:"legendary", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{per:520, int:460, wis:440, mgc:380, wil:220} }
    ],
    aura:"세계 자체가 이 엘프를 기억의 수호자로 인정한다. 신들조차 이 존재의 증언을 두려워한다.",
    aiHint:"7단계 기억: 세계의 모든 진실이 이 존재에게 열려있다. 죽음조차 기억을 끊지 못하며, 세계의 비밀 엔딩이 해금된다. 특화 계열이 세계의 법칙이 된다(인연→모든 생명의 연결을 볼 수 있음, 지식→세계 창조의 비밀을 앎, 상실→죽은 자들과 자유롭게 대화, 서약→세계의 모든 계약을 인식하고 변경 가능, 자연→자연 재해를 멈추거나 일으킬 수 있음)."
  }
];

export function getElfSpecialization(em) {
  const sp = em.specPoints || {};
  const entries = Object.entries(sp).filter(([,v]) => v > 0);
  if (!entries.length) return 'none';
  entries.sort((a,b) => b[1] - a[1]);
  const top = entries[0];
  const specDef = ELF_SPECIALIZATIONS[top[0]];
  if (specDef && top[1] >= specDef.threshold) return top[0];
  // threshold 미달이지만 가장 높은 것
  return top[1] >= 5 ? top[0] : 'none';
}
window.getElfSpecialization = getElfSpecialization;

export function checkElfSpecSkills(em, prevSpec, newSpec) {
  const stage = em.stage || 0;
  if (newSpec === 'none') return;
  const specDef = ELF_SPECIALIZATIONS[newSpec];
  if (!specDef) return;
  // 3단계 이상이면 stage3Skill 해금
  if (stage >= 3 && specDef.stage3Skill) {
    const sk = specDef.stage3Skill;
    if (!S.unlockedSkills[sk.id]) {
      S.unlockedSkills[sk.id] = true;
      saveSkills(S.unlockedSkills);
      setTimeout(() => toastHTML(`🔓 특화 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)} [${esc(specDef.name)}]`, 4000), 800);
    }
  }
  // 5단계 이상이면 stage5Skill 해금
  if (stage >= 5 && specDef.stage5Skill) {
    const sk = specDef.stage5Skill;
    if (!S.unlockedSkills[sk.id]) {
      S.unlockedSkills[sk.id] = true;
      saveSkills(S.unlockedSkills);
      setTimeout(() => toastHTML(`🔓 특화 전설 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)} [${esc(specDef.name)}]`, 4500), 1600);
    }
  }
  // 특화 계열 변경 알림
  if (prevSpec !== newSpec && newSpec !== 'none') {
    const spDef = ELF_SPECIALIZATIONS[newSpec];
    setTimeout(() => toastHTML(`🧝 특화 계열 결정: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(spDef,{size:14}):(spDef.icon)} ${esc(spDef.name)}`, 4000), 300);
  }
}
window.checkElfSpecSkills = checkElfSpecSkills;

export function gainElfMemory(memType, customGain) {
  const race = S.character?.race || "";
  const isElf = race.includes("엘프") || race.includes("elf");
  if (!isElf) return;
  const em = loadElfMemory();
  const memDef = ELF_MEMORY_GAIN[memType];
  const gain = customGain !== undefined ? customGain : (memDef?.gain || 5);
  em.points = Math.min(1000, (em.points || 0) + gain);
  em.memory = em.memory || {bond:0,knowledge:0,loss:0,oath:0,place:0};
  em.specPoints = em.specPoints || {bond:0,knowledge:0,loss:0,oath:0,place:0};
  if (memType && em.memory[memType] !== undefined) {
    em.memory[memType] = (em.memory[memType] || 0) + 1;
    em.specPoints[memType] = (em.specPoints[memType] || 0) + 1;
  }
  em.history = em.history || [];
  em.history.push({
    type: memType, gain, label: memDef?.label || memType,
    icon: memDef?.icon || "🧝", total: em.points,
    at: new Date().toISOString().slice(0, 16)
  });
  

  const prevStage = em.stage || 0;
  const prevSpec  = em.specialization || 'none';
  let newStage = 0;
  for (let i = ELF_MEMORY_STAGES.length - 1; i >= 0; i--) {
    if (em.points >= ELF_MEMORY_STAGES[i].threshold) { newStage = i; break; }
  }
  em.stage = newStage;

  // 특화 계열 판정
  const newSpec = getElfSpecialization(em);
  em.specialization = newSpec;

  saveElfMemory(em);

  // 단계 상승 알림
  if (newStage > prevStage) {
    const stg = ELF_MEMORY_STAGES[newStage];
    setTimeout(() => {
      toastHTML(`🧝 기억 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 4000);
      stg.skills.forEach(sk => {
        if (!S.unlockedSkills[sk.id]) {
          S.unlockedSkills[sk.id] = true;
          saveSkills(S.unlockedSkills);
          setTimeout(() => toastHTML(`🔓 기억 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3000), 1200);
        }
      });
    }, 500);
  }

  // 특화 스킬 체크
  checkElfSpecSkills(em, prevSpec, newSpec);
  applyElfMemoryStats();
  return em;
}
window.gainElfMemory = gainElfMemory;

export function triggerElfForgetting(amount, npcName) {
  const race = S.character?.race || "";
  const isElf = race.includes("엘프") || race.includes("elf");
  if (!isElf) return;
  const em = loadElfMemory();
  const lost = Math.min(em.points, amount || 50);
  em.points = Math.max(0, em.points - lost);
  em.forgetCount = (em.forgetCount || 0) + 1;
  // NPC 망각 기록
  if (npcName) {
    em.forgottenNPCs = em.forgottenNPCs || [];
    em.forgottenNPCs.push({ name: npcName, at: new Date().toISOString().slice(0,16) });
    // 인연 specPoints 페널티
    em.specPoints = em.specPoints || {bond:0,knowledge:0,loss:0,oath:0,place:0};
    em.specPoints.bond = Math.max(0, (em.specPoints.bond || 0) - 3);
    setTimeout(() => toast(`💀 ${npcName}와의 기억이 사라졌다! 인연 특화 -3`, 3500), 500);
  }
  em.history = em.history || [];
  em.history.push({
    type:"forget", gain:-lost, label: npcName ? `${npcName} 망각` : "기억 봉인/망각",
    icon:"💀", total:em.points,
    at: new Date().toISOString().slice(0,16)
  });
  
  let newStage = 0;
  for (let i = ELF_MEMORY_STAGES.length - 1; i >= 0; i--) {
    if (em.points >= ELF_MEMORY_STAGES[i].threshold) { newStage = i; break; }
  }
  // 특화 강등 체크
  const oldSpec = em.specialization || 'none';
  em.stage = newStage;
  const newSpec = getElfSpecialization(em);
  em.specialization = newSpec;
  if (oldSpec !== 'none' && newSpec !== oldSpec) {
    setTimeout(() => toast(`⚠️ 특화 계열 변경: ${ELF_SPECIALIZATIONS[oldSpec]?.name||oldSpec} → ${newSpec !== 'none' ? ELF_SPECIALIZATIONS[newSpec]?.name||newSpec : '없음'}`, 4000), 1000);
  }
  saveElfMemory(em);
  applyElfMemoryStats();
  toast(`💀 기억이 봉인됐다! -${lost} (현재: ${em.points})`, 4000);
  setTimeout(() => toast('⚠️ 망각한 엘프는 동족에게 배척당하는 이벤트가 발생할 수 있습니다', 3500), 1000);
  if (typeof renderElfMemoryPanel === 'function') renderElfMemoryPanel();
}
window.triggerElfForgetting = triggerElfForgetting;

export function elfRestore(methodId) {
  const method = ELF_RESTORE_METHODS.find(m => m.id === methodId);
  if (!method) return;
  const em = loadElfMemory();
  if (method.goldCost && S.gold < method.goldCost) { toast(`골드 부족 (필요: ${method.goldCost}G)`); return; }
  if (method.hpCost && (S.stats.hp || 100) <= method.hpCost + 10) { toast('HP가 너무 낮습니다'); return; }
  if (method.goldCost) { S.gold -= method.goldCost; saveGold(S.gold); }
  if (method.hpCost) { S.stats.hp = Math.max(1, (S.stats.hp || 100) - method.hpCost); }
  const actualGain = method.reduce;
  em.points = Math.min(1000, (em.points || 0) + actualGain);
  em.history = em.history || [];
  em.history.push({ type:"restore", gain:actualGain, label:"기억 회복", icon:"✨", total:em.points, at:new Date().toISOString().slice(0,16) });
  
  const prevStage = em.stage || 0;
  let newStage = 0;
  for (let i = ELF_MEMORY_STAGES.length - 1; i >= 0; i--) {
    if (em.points >= ELF_MEMORY_STAGES[i].threshold) { newStage = i; break; }
  }
  const prevSpec = em.specialization || 'none';
  em.stage = newStage;
  em.specialization = getElfSpecialization(em);
  saveElfMemory(em);
  if (newStage > prevStage) {
    const stg = ELF_MEMORY_STAGES[newStage];
    setTimeout(() => { toastHTML(`🧝 기억 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 4000); }, 500);
  }
  checkElfSpecSkills(em, prevSpec, em.specialization);
  applyElfMemoryStats();
  window.updateHeader();
  toast(`✨ 기억 회복! +${actualGain} (현재: ${em.points})`, 3000);
  if (typeof renderElfMemoryPanel === 'function') renderElfMemoryPanel();
}
window.elfRestore = elfRestore;

export function applyElfMemoryStats() {
  const em = loadElfMemory();
  const stg = ELF_MEMORY_STAGES[em.stage || 0];
  if (!stg) return;
  const prev = S._elfMemoryBonus || {};
  Object.entries(prev).forEach(([k,v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const newBonus = {};
  Object.entries(stg.statBonus || {}).forEach(([k,v]) => { S.stats[k] = Math.min(999, (S.stats[k]||50)+v); newBonus[k]=v; });
  Object.entries(stg.statPenalty || {}).forEach(([k,v]) => { S.stats[k] = Math.max(0, (S.stats[k]||50)+v); });

  // 특화 계열 상실 보너스 (HP 낮을 때)
  const spec = em.specialization || 'none';
  if (spec === 'loss' && (S.stats.hp || 100) < 50) {
    S.stats.str = Math.min(999, (S.stats.str||50) + 40);
    S.stats.mgc = Math.min(999, (S.stats.mgc||50) + 40);
    newBonus._lossBoost = 40;
  }
  // 특화 계열 자연 회복 (매 적용 시 소량 회복)
  if (spec === 'place') {
    const natureLvl = em.natureBondLevel || 0;
    if (natureLvl > 0) {
      S.stats.hp = Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), (S.stats.hp||100) + Math.min(8, natureLvl * 2));
      S.stats.mp = Math.min((typeof getPlayerMaxMp==='function'?getPlayerMaxMp():999), (S.stats.mp||50) + Math.min(6, natureLvl));
    }
  }
  S._elfMemoryBonus = newBonus;
  if (typeof saveStats === 'function') saveStats(S.stats);
}
window.applyElfMemoryStats = applyElfMemoryStats;

export function getElfMemoryStatus() {
  const race = S.character?.race || "";
  const isElf = race.includes("엘프") || race.includes("elf");
  if (!isElf) return null;
  const em = loadElfMemory();
  const stg = ELF_MEMORY_STAGES[em.stage || 0];
  const nextStg = ELF_MEMORY_STAGES[(em.stage || 0) + 1];
  return { ...em, stageDef: stg, nextStage: nextStg };
}
window.getElfMemoryStatus = getElfMemoryStatus;

export function renderElfMemoryPanel() {
  const body = document.getElementById('pb-elf-memory');
  if (!body) return;
  const status = getElfMemoryStatus();
  if (!status) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">
      <div style="font-size:32px;margin-bottom:10px">🧝</div>
      <div>엘프족 캐릭터에게만 활성화됩니다.</div>
      <div style="margin-top:6px;font-size:10px">캐릭터 설정에서 종족을 엘프족으로 선택하세요.</div>
    </div>`;
    return;
  }
  const em = loadElfMemory();
  const stg = ELF_MEMORY_STAGES[em.stage || 0];
  const nextStg = ELF_MEMORY_STAGES[(em.stage || 0) + 1];
  const color = stg?.color || '#40d0a0';
  const spec = em.specialization || 'none';
  const specDef = spec !== 'none' ? ELF_SPECIALIZATIONS[spec] : null;
  const specColor = specDef?.color || '#40d0a0';
  const totalMem = Object.values(em.memory || {}).reduce((a,b) => a+b, 0);
  const stageSkills = ELF_MEMORY_STAGES.slice(0, (em.stage||0)+1).flatMap(s => s.skills);

  // 특화 전용 스킬 목록
  let specSkills = [];
  if (specDef) {
    if ((em.stage||0) >= 3 && specDef.stage3Skill) specSkills.push(specDef.stage3Skill);
    if ((em.stage||0) >= 5 && specDef.stage5Skill) specSkills.push(specDef.stage5Skill);
  }

  // specPoints 상위 3개 정렬
  const spEntries = Object.entries(em.specPoints || {bond:0,knowledge:0,loss:0,oath:0,place:0})
    .sort((a,b) => b[1]-a[1]);
  const maxSp = spEntries[0]?.[1] || 1;

  body.innerHTML = `
    <!-- 헤더 -->
    <div style="padding:14px 12px;border-bottom:1px solid #003025;background:linear-gradient(135deg,#001810,#002015)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#206050;margin-top:2px">${stg.desc}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:20px;color:${color}">${em.points}</div>
          <div style="font-size:8px;color:#206050">/ 1000</div>
        </div>
      </div>
      <div style="height:8px;background:#001010;border-radius:4px;overflow:hidden;border:1px solid #003025;margin-bottom:6px">
        <div style="width:${(em.points/1000)*100}%;height:100%;background:linear-gradient(90deg,#208060,${color});border-radius:4px;transition:width .5s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:8px;color:#306050">
        <span>기억력 ${em.points} / 1000</span>
        ${nextStg ? `<span>다음 단계: ${nextStg.threshold - em.points} 더</span>` : `<span style="color:${color}">최고 단계 달성!</span>`}
      </div>
      <div style="margin-top:8px;padding:6px 8px;background:#001a12;border:1px solid #003025;border-radius:2px;font-size:9px;color:#40806a;font-style:italic">${stg.aura}</div>
    </div>

    <!-- 특화 계열 -->
    <div style="padding:12px;border-bottom:1px solid #003025;background:#000d08">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:8px">── 기억 특화 계열 ──</div>
      ${specDef ? `
        <div style="padding:10px;background:linear-gradient(135deg,#001510,#001208);border:1px solid ${specColor}55;border-radius:3px;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="color:${specColor};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(specDef,{size:16}):(specDef.svgIcon||specDef.icon)}</span>
            <div>
              <div style="font-family:'Cinzel',serif;font-size:11px;color:${specColor}">${specDef.name}</div>
              <div style="font-size:9px;color:#406a5a;margin-top:1px">${specDef.desc}</div>
            </div>
          </div>
          <div style="font-size:9px;color:${specColor}aa;padding:5px 7px;background:${specColor}11;border-radius:2px;border-left:2px solid ${specColor}55">
            ⚡ ${specDef.specEffect || ELF_MEMORY_GAIN[spec]?.specEffect || ''}
          </div>
          ${specDef.aiHint_spec ? `<div style="font-size:8px;color:#2a5040;margin-top:5px;font-style:italic">${specDef.aiHint_spec}</div>` : ''}
        </div>
      ` : `
        <div style="padding:8px;background:#000a08;border:1px solid #002015;border-radius:2px;font-size:9px;color:#2a5040;text-align:center">
          아직 특화 계열이 결정되지 않았다. 기억 행동을 쌓아라.
        </div>
      `}

      <!-- 특화 포인트 분포 -->
      <div style="display:flex;flex-direction:column;gap:3px;margin-top:6px">
        ${spEntries.map(([k,v]) => {
          const def = ELF_MEMORY_GAIN[k];
          const specD = ELF_SPECIALIZATIONS[k];
          const pct = maxSp > 0 ? Math.round((v/maxSp)*100) : 0;
          const isMain = k === spec;
          return `<div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:10px;width:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(def,{size:14}):(def?.icon||'?')}</span>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;font-size:8px;margin-bottom:2px">
                <span style="color:${isMain ? specD?.color : '#2a5040'}">${def?.label||k}</span>
                <span style="color:${isMain ? specD?.color : '#2a5040'};font-family:'Cinzel',serif">${v}</span>
              </div>
              <div style="height:4px;background:#000e0a;border-radius:2px;overflow:hidden">
                <div style="width:${pct}%;height:100%;background:${isMain ? specD?.color : '#204030'};transition:width .4s;border-radius:2px"></div>
              </div>
            </div>
            ${isMain ? `<span style="font-size:8px;color:${specD?.color}">★</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- 특화 전용 스킬 -->
    ${specSkills.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #003025">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${specColor};letter-spacing:1px;margin-bottom:6px">── ${specDef?.name||''} 전용 스킬 ──</div>
      ${specSkills.map(sk => {
        if(!S.unlockedSkills) S.unlockedSkills = {}; // [F-12 FIX]
        const unlocked = !!S.unlockedSkills[sk.id];
        return `<div style="padding:8px 10px;background:${unlocked?'#001a12':'#000a08'};border:1px solid ${unlocked?specColor+'66':'#002015'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:15px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:15}):(sk.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:${specColor}">${sk.name||''}</span>
            <span style="font-size:8px;padding:1px 5px;background:${specColor}22;color:${specColor};border:1px solid ${specColor}44;border-radius:2px;margin-left:auto">${sk.rarity}</span>
            ${unlocked ? '<span style="font-size:9px;color:#60d060">✓ 해금</span>' : '<span style="font-size:9px;color:#2a4a3a">🔒</span>'}
          </div>
          <div style="font-size:9px;color:#407a60;line-height:1.5">${sk.desc||''}</div>
          ${sk.conditionDesc ? `<div style="font-size:8px;color:#1a4030;margin-top:3px">발동: ${sk.conditionDesc}</div>` : ''}
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- 기억 단계 진행 -->
    <div style="padding:10px 12px;border-bottom:1px solid #003025">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:7px">── 기억 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${ELF_MEMORY_STAGES.map((s,i) => {
          const active = i === (em.stage||0);
          const passed = i < (em.stage||0);
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#001a14':passed?'#000e0b':'#000a08'};border:1px solid ${active?s.color:passed?s.color+'44':'#002015'};border-radius:2px;opacity:${active?1:passed?0.7:0.35}">
            <span style="display:inline-flex;width:12px;height:12px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:12}):((s.svgIcon||'').replace('width="20" height="20"','width="12" height="12"')||s.icon)}</span>
            <div style="flex:1">
              <span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:passed?s.color:'#2a4a3a'}">${s.name}</span>
              <span style="font-size:8px;color:#2a4a3a;margin-left:5px">(${s.threshold})</span>
            </div>
            ${active ? `<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀ 현재</span>` : ''}
            ${passed ? `<span style="font-size:9px;color:${s.color}">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- 기억 단계 스킬 -->
    ${stageSkills.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #003025">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 기억 공통 스킬 ──</div>
      ${stageSkills.map(sk => {
        if(!S.unlockedSkills) S.unlockedSkills = {}; // [F-12 FIX]
        const unlocked = !!S.unlockedSkills[sk.id];
        return `<div style="padding:7px 9px;background:${unlocked?'#001510':'#000a08'};border:1px solid ${unlocked?color+'55':'#002015'};margin-bottom:4px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)}</span>
            <span style="font-family:'Cinzel',serif;font-size:10px;color:${color}">${sk.name||''}</span>
            <span style="font-size:8px;padding:1px 5px;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:2px;margin-left:auto">${sk.rarity}</span>
            ${unlocked ? '<span style="font-size:9px;color:#60d060">✓</span>' : '<span style="font-size:9px;color:#2a4a3a">🔒</span>'}
          </div>
          <div style="font-size:9px;color:#406a5a;line-height:1.5">${sk.desc||''}</div>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- 스탯 효과 -->
    <div style="padding:10px 12px;border-bottom:1px solid #003025">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 기억 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.entries(stg.statBonus||{}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#0d0a00;border:1px solid #0a3020;border-radius:2px;font-size:9px">
            <span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:4px">+${v}</span>
          </div>`).join('')}
        ${Object.entries(stg.statPenalty||{}).map(([k,v])=>`
          <div style="padding:3px 7px;background:#0d0000;border:1px solid #1a0a0a;border-radius:2px;font-size:9px">
            <span style="color:#a06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:4px">${v}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- 기억 행동 자동 전용 -->
    <div style="padding:8px 12px;border-bottom:1px solid #003025">
      <div style="font-size:9px;color:#205040;font-style:italic;text-align:center;padding:4px 0">🌿 기억은 AI 서사에서 자동으로 쌓이고 잊혀집니다</div>
    </div>

    <!-- 기억 회복 -->
    <div style="padding:10px 12px;border-bottom:1px solid #003025">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 기억 회복 ──</div>
      ${ELF_RESTORE_METHODS.map(m => {
        const canAfford = !m.goldCost || S.gold >= m.goldCost;
        const canHp = !m.hpCost || (S.stats.hp||100) > m.hpCost + 10;
        const canUse = canAfford && canHp && em.points < 1000;
        return `<div style="padding:8px 10px;background:#000a10;border:1px solid ${canUse?'#207050':'#002015'};margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:14}):(m.icon)}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${canUse?'#40c090':'#206040'}">${m.name}</div>
              <div style="font-size:8px;color:#2a4a3a;margin-top:1px">조건: ${m.req}</div>
            </div>
            <span style="font-size:9px;color:#40a080;font-family:'Cinzel',serif">+${m.reduce}</span>
          </div>
          <div style="font-size:9px;color:#305a4a;margin-bottom:5px">${m.desc}</div>
          <button onclick="elfRestore('${m.id}')"
            style="width:100%;padding:5px;background:${canUse?'#0a2a1a':'#000a08'};border:1px solid ${canUse?'#308060':'#002015'};color:${canUse?'#40c090':'#205040'};font-family:'Cinzel',serif;font-size:9px;cursor:${canUse?'pointer':'not-allowed'};border-radius:2px"
            ${canUse?'':'disabled'}>
            ${canUse ? '✨ 회복하기' : '조건 미충족'}
            ${m.goldCost ? `(${m.goldCost}G)` : ''}${m.hpCost ? `(HP ${m.hpCost})` : ''}
          </button>
        </div>`;
      }).join('')}
    </div>

    <!-- 망각된 NPC 목록 -->
    ${em.forgottenNPCs && em.forgottenNPCs.length ? `
    <div style="padding:10px 12px;border-bottom:1px solid #003025">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#a05050;letter-spacing:1px;margin-bottom:6px">── 망각된 인연 (${em.forgottenNPCs.length}명) ──</div>
      ${em.forgottenNPCs.slice(-5).map(n => `
        <div style="padding:4px 7px;background:#080000;border:1px solid #2a1010;border-radius:2px;font-size:9px;color:#6a3030;margin-bottom:3px">
          💀 ${n.name} <span style="color:#3a1a1a;float:right">${n.at}</span>
        </div>`).join('')}
    </div>` : ''}

    <!-- 최근 기억 기록 -->
    ${em.history && em.history.length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 최근 기억 기록 ──</div>
      ${[...em.history].reverse().slice(0,12).map(h => `
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #000d08;font-size:9px">
          <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)}</span>
          <span style="flex:1;color:#406a5a">${h.label}</span>
          <span style="color:${h.gain>0?'#40d090':'#d04040'};font-family:'Cinzel',serif">${h.gain>0?'+':''}${h.gain}</span>
          <span style="color:#2a4a3a;font-size:8px">(${h.total})</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderElfMemoryPanel = renderElfMemoryPanel;

window.gainElfMemory           = gainElfMemory;

window.elfRestore              = elfRestore;

window.triggerElfForgetting    = triggerElfForgetting;

window.renderElfMemoryPanel    = renderElfMemoryPanel;

window.applyElfMemoryStats     = applyElfMemoryStats;

window.getElfMemoryStatus      = getElfMemoryStatus;

window.getElfSpecialization    = getElfSpecialization;

export const ELF_FORGETTING_KEY  = 'tf-elf-forgetting';

export const EF_COUNTERS_KEY     = 'tf-ef-counters';

export const EF_MEMORIES_KEY     = 'tf-ef-memories';

export const EF_HISTORY_KEY      = 'tf-ef-history';

export function loadElfForgetting() {
  try {
    const cnt=lsGet(EF_COUNTERS_KEY); const mem=lsGet(EF_MEMORIES_KEY); const hist=lsGet(EF_HISTORY_KEY);
    if (cnt!==null) { const mObj=mem?JSON.parse(mem):{sealedMemories:[],guardedNames:[]}; return { ...JSON.parse(cnt), sealedMemories:mObj.sealedMemories||[], guardedNames:mObj.guardedNames||[], history:JSON.parse(hist||'[]') }; }
    return JSON.parse(lsGet(ELF_FORGETTING_KEY)||'{"stack":0,"maxStack":100,"explosionCount":0,"sealedMemories":[],"ancestorApproval":0,"history":[],"lastExplosion":null,"guardedNames":[]}');
  } catch(e) { return {stack:0,maxStack:100,explosionCount:0,sealedMemories:[],ancestorApproval:0,history:[],lastExplosion:null,guardedNames:[]}; }
}
window.loadElfForgetting = loadElfForgetting;

export function saveElfForgetting(d) {
  try {
    lsSet(EF_COUNTERS_KEY, JSON.stringify({stack:d.stack||0,maxStack:d.maxStack||100,explosionCount:d.explosionCount||0,ancestorApproval:d.ancestorApproval||0,lastExplosion:d.lastExplosion||null}));
    lsSet(EF_MEMORIES_KEY, JSON.stringify({sealedMemories:d.sealedMemories||[],guardedNames:d.guardedNames||[]}));
    lsSet(EF_HISTORY_KEY,  JSON.stringify(d.history||[]));
    lsSet(ELF_FORGETTING_KEY, JSON.stringify(d));
  } catch(e) {}
}
window.saveElfForgetting = saveElfForgetting;

export const clearElfForgetting = () => { lsDel(ELF_FORGETTING_KEY); lsDel(EF_COUNTERS_KEY); lsDel(EF_MEMORIES_KEY); lsDel(EF_HISTORY_KEY); };

export function isElfRace() {
  const r = S.character?.race || '';
  return r.includes('엘프') || r.includes('elf');
}
window.isElfRace = isElfRace;

export const FORGETTING_STACK_STAGES = [
  { min:0,  max:19,  name:'완전한 기억',    icon:'💎', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" stroke-linejoin="round"/></svg>`, color:'#40d0a0',
    desc:'기억이 흠 없이 보존돼 있다. 선조들이 흐뭇하게 바라본다.',
    bonus:{ per:12, int:10, mgc:8, wis:8 }, penalty:{},
    aiHint:'기억이 완전한 엘프. 선조들의 축복이 느껴진다.' },
  { min:20, max:39,  name:'작은 균열',      icon:'🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" stroke-linejoin="round"/><path d="M12 7 L10 13 L13 13 L11 19" stroke-width="1.1"/></svg>`, color:'#50b890',
    desc:'기억 한 켠에 작은 빈자리가 생겼다. 가끔 낯선 공허함이 스친다.',
    bonus:{ per:8, int:7, mgc:5 }, penalty:{ wis:-3 },
    aiHint:'기억에 작은 균열이 생긴 엘프. 특정 이름이 떠오르지 않는 순간이 있다.' },
  { min:40, max:59,  name:'흔들리는 기억',  icon:'💫', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.2" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="2.5"/></svg>`, color:'#8060c0',
    desc:'억압된 기억들이 꿈속에서 떠오른다. 자신도 모르는 행동을 한다.',
    bonus:{ mgc:5 }, penalty:{ per:-5, int:-5, wil:-8, mad:8 },
    aiHint:'기억이 흔들리는 엘프. 꿈과 현실의 경계가 흐릿하고, 억압된 감정이 행동에 배어난다.' },
  { min:60, max:79,  name:'기억의 파열',    icon:'⚡', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L6 13 L11 13 L10 22 L18 10 L13 10 Z" stroke-linejoin="round"/></svg>`, color:'#c040a0',
    desc:'억압된 기억들이 균열을 넓힌다. 선조들의 목소리가 꿈속에서 원망한다.',
    bonus:{}, penalty:{ per:-12, int:-10, wil:-14, mad:18, mgc:-6 },
    aiHint:'기억이 파열 직전인 엘프. 선조들이 꿈속에서 원망의 목소리로 나타난다. 행동이 불안정하다.' },
  { min:80, max:99,  name:'붕괴 직전',      icon:'🌀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.2" stroke-dasharray="1 3"/><path d="M8 8 L16 16 M16 8 L8 16" stroke-width="1"/></svg>`, color:'#e02080',
    desc:'기억의 댐이 무너지기 직전이다. 다음 폭발이 임박했다.',
    bonus:{}, penalty:{ per:-22, int:-18, wil:-22, mad:32, mgc:-12, luk:-8 },
    aiHint:'기억 붕괴 직전. 이 엘프는 곧 통제를 잃을 것이다. 모든 대화에서 감정 불안정이 드러난다.' },
  { min:100,max:100, name:'기억 폭발',      icon:'💥', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14 9 L21 9.5 L15.5 14 L17.5 21 L12 17 L6.5 21 L8.5 14 L3 9.5 L10 9 Z" stroke-linejoin="round"/></svg>`, color:'#ff0060',
    desc:'억압된 모든 기억이 한꺼번에 터졌다! 통제 불능 상태.',
    bonus:{ mgc:30, fear:20 }, penalty:{ per:-35, int:-30, wil:-35, mad:50, cha:-20 },
    aiHint:'기억 폭발 상태! 억압된 기억이 모두 해방되며 엘프가 통제 불능 상태에 빠졌다. 극적인 감정 분출과 초자연적 마법 폭발이 동반된다.' },
];

export const ANCESTOR_APPROVAL_ELF_STAGES = [
  { min:0,   name:'선조의 침묵',    icon:'🌑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 12 12 12 8 C12 4.5 9 3 6 3 C6 6.5 8 9 12 9" stroke-linejoin="round" opacity="0.5"/></svg>`, color:'#608060', desc:'선조가 무관심하다.', bonus:{}, penalty:{} },
  { min:30,  name:'선조의 눈길',    icon:'🌿', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 12 12 12 8 C12 4.5 9 3 6 3 C6 6.5 8 9 12 9" stroke-linejoin="round"/></svg>`, color:'#40a080', desc:'선조가 지켜보기 시작했다.', bonus:{ mgc:6, per:5, wis:4 }, penalty:{} },
  { min:80,  name:'선조의 인정',    icon:'🌟', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 12 12 12 8 C12 4.5 9 3 6 3 C6 6.5 8 9 12 9" stroke-linejoin="round"/><path d="M12 14 C12 14 12 9 15 7.5 C17 6.5 19 7 19 7 C19 9.5 17 12.5 12 12.5" stroke-linejoin="round"/></svg>`, color:'#40c8a0', desc:'선조가 이 엘프를 기억의 수호자로 인정했다.', bonus:{ mgc:14, per:12, wis:12, int:8, luk:6 }, penalty:{} },
  { min:160, name:'선조의 가호',    icon:'✨', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>`, color:'#50e0b8', desc:'선조들의 힘이 깃든다.', bonus:{ mgc:24, per:22, wis:20, int:16, luk:12, trst:8 }, penalty:{} },
  { min:280, name:'선조와의 합일',  icon:'💠', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L15 8 L21 9 L16.5 13.5 L18 20 L12 16.5 L6 20 L7.5 13.5 L3 9 L9 8 Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="2" stroke-width="1.2"/></svg>`, color:'#70ffd0', desc:'선조의 기억이 몸속에 산다.', bonus:{ mgc:38, per:36, wis:32, int:26, luk:20, trst:16, rep:12 }, penalty:{} },
];

export function getForgettingStage(stack) {
  for (let i = FORGETTING_STACK_STAGES.length - 1; i >= 0; i--) {
    if (stack >= FORGETTING_STACK_STAGES[i].min) return FORGETTING_STACK_STAGES[i];
  }
  return FORGETTING_STACK_STAGES[0];
}
window.getForgettingStage = getForgettingStage;

export function getAncestorElfStage(ap) {
  let s = ANCESTOR_APPROVAL_ELF_STAGES[0];
  for (const st of ANCESTOR_APPROVAL_ELF_STAGES) { if (ap >= st.min) s = st; }
  return s;
}
window.getAncestorElfStage = getAncestorElfStage;

export function addForgettingStack(amount, reason) {
  if (!isElfRace()) return;
  const ef = loadElfForgetting();
  const prev = ef.stack || 0;
  ef.stack = Math.min(100, prev + (amount || 10));
  ef.history = ef.history || [];
  ef.history.push({ event:'망각', amount, reason: reason||'', stack: ef.stack, at: new Date().toISOString().slice(0,16) });
  

  // 폭발 트리거
  if (ef.stack >= 100 && prev < 100) {
    ef.explosionCount = (ef.explosionCount||0) + 1;
    ef.lastExplosion = new Date().toISOString().slice(0,16);
    // 폭발 후 스택 리셋
    ef.stack = 20;
    saveElfForgetting(ef);
    applyElfForgettingStats();
    setTimeout(() => {
      toast('💥 억압된 기억 폭발! 엘프가 통제 불능 상태에 빠졌다!', 5000);
      // 기억 연동 - 봉인된 기억 일부 해제
      if (typeof gainElfMemory === 'function') gainElfMemory('loss', 20);
    }, 300);
    return ef;
  }

  saveElfForgetting(ef);
  applyElfForgettingStats();
  if (ef.stack >= 80) setTimeout(() => toast('⚠️ 망각 스택이 위험 수위입니다! 기억을 지키세요.', 3500), 200);
  return ef;
}
window.addForgettingStack = addForgettingStack;

export function guardAncestorName(name) {
  if (!isElfRace()) return;
  const ef = loadElfForgetting();
  ef.guardedNames = ef.guardedNames || [];
  if (!ef.guardedNames.includes(name)) {
    ef.guardedNames.push(name);
    ef.ancestorApproval = Math.min(400, (ef.ancestorApproval||0) + 15);
    ef.stack = Math.max(0, (ef.stack||0) - 8);
    ef.history.push({ event:'수호', amount:-8, reason:`${name} 이름 보존`, stack: ef.stack, at: new Date().toISOString().slice(0,16) });
    saveElfForgetting(ef);
    applyElfForgettingStats();
    toast(`💎 "${name}"의 이름을 기억에 새겼습니다. 선조 인정 +15`, 3000);
  } else {
    toast(`이미 기억하고 있는 이름입니다: ${name}`);
  }
}
window.guardAncestorName = guardAncestorName;

export function healForgettingStack(amount, method) {
  if (!isElfRace()) return;
  const ef = loadElfForgetting();
  ef.stack = Math.max(0, (ef.stack||0) - (amount||15));
  ef.history.push({ event:'회복', amount:-amount, reason: method||'치유', stack: ef.stack, at: new Date().toISOString().slice(0,16) });
  saveElfForgetting(ef);
  applyElfForgettingStats();
  toast(`💎 망각 스택 -${amount} (현재: ${ef.stack})`, 3000);
}
window.healForgettingStack = healForgettingStack;

export function elfSealMemory(label) {
  if (!isElfRace()) return;
  const ef = loadElfForgetting();
  ef.sealedMemories = ef.sealedMemories || [];
  ef.sealedMemories.push({ label: label||'알 수 없는 기억', sealedAt: new Date().toISOString().slice(0,10) });
  addForgettingStack(18, `기억 봉인: ${label||''}`);
  toast(`🔒 기억을 봉인했습니다. 망각 스택 +18`, 3000);
}
window.elfSealMemory = elfSealMemory;

export function applyElfForgettingStats() {
  if (!isElfRace()) return;
  const ef = loadElfForgetting();
  const fstg = getForgettingStage(ef.stack||0);
  const astg = getAncestorElfStage(ef.ancestorApproval||0);

  const prev = S._elfForgettingBonus || {};
  Object.entries(prev).forEach(([k,v]) => { if (S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });
  const nb = {};

  // 망각 단계 패널티 + 선조 인정 보너스 합산
  Object.entries(fstg.bonus||{}).forEach(([k,v]) => { S.stats[k]=Math.min(999,(S.stats[k]||50)+v); nb[k]=(nb[k]||0)+v; });
  Object.entries(fstg.penalty||{}).forEach(([k,v]) => { S.stats[k]=Math.max(0,(S.stats[k]||50)+v); });
  Object.entries(astg.bonus||{}).forEach(([k,v]) => { S.stats[k]=Math.min(999,(S.stats[k]||50)+v); nb[k]=(nb[k]||0)+v; });

  S._elfForgettingBonus = nb;
  if (typeof saveStats==='function') saveStats(S.stats);
}
window.applyElfForgettingStats = applyElfForgettingStats;

export function detectElfForgettingFromText(text) {
  if (!text || !isElfRace()) return;
  if (/기억을 지웠|잊으려|봉인했|외면했|모른 척/.test(text) && Math.random()<0.5) addForgettingStack(10, 'AI 서사 감지');
  if (/선조의 이름|기억을 지켰|잊지 않|기억한다/.test(text) && Math.random()<0.4) {
    const ef = loadElfForgetting();
    ef.ancestorApproval = Math.min(400,(ef.ancestorApproval||0)+8);
    ef.stack = Math.max(0,(ef.stack||0)-5);
    saveElfForgetting(ef); applyElfForgettingStats();
  }
}
window.detectElfForgettingFromText = detectElfForgettingFromText;

export function renderElfForgettingPanel() {
  const body = document.getElementById('pb-elf-forgetting');
  if (!body) return;
  if (!isElfRace()) {
    body.innerHTML=`<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px"><div style="font-size:32px;margin-bottom:10px">💭</div><div>엘프족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const ef = loadElfForgetting();
  const stack = ef.stack||0;
  const fstg = getForgettingStage(stack);
  const astg = getAncestorElfStage(ef.ancestorApproval||0);
  const color = fstg.color;
  const npcs = (S.npcs||[]).filter(n=>n.active!==false);

  body.innerHTML = `
    <!-- ① 헤더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#0d0018,#160022);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(fstg,{size:16}):(fstg.svgIcon||fstg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${fstg.name}</div>
          <div style="font-size:9px;color:#6040a0;margin-top:2px">망각 스택 ${stack}/100 | 봉인 ${(ef.sealedMemories||[]).length}개 | 폭발 ${ef.explosionCount||0}회</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:20px;color:${color}">${stack}<span style="font-size:9px;color:#5030a0">/100</span></div>
          <div style="font-size:8px;color:#5030a0">망각 스택</div>
        </div>
      </div>
      <!-- 망각 게이지 (왼쪽 안전→오른쪽 위험) -->
      <div style="height:8px;background:#0a0015;border-radius:4px;overflow:hidden;margin-bottom:4px;border:1px solid #3a1060">
        <div style="width:${stack}%;height:100%;background:linear-gradient(90deg,#4020a0,${color});border-radius:4px;transition:width .4s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:8px;color:#5030a0"><span>💎 완전</span><span>💥 폭발</span></div>
      <div style="margin-top:8px;font-size:10px;color:#9060c0;font-style:italic">"${fstg.desc}"</div>
      ${stack >= 80 ? `<div style="margin-top:6px;padding:5px 8px;background:#1a0010;border:1px solid #e02080;border-radius:2px;font-size:9px;color:#e02080">⚠️ 폭발 임박! 기억을 지키거나 회복 의식을 수행하세요.</div>` : ''}
    </div>

    <!-- ② 선조 인정 상태 -->
    <div style="padding:8px 12px;border-bottom:1px solid #160028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#40d0a0;letter-spacing:1px;margin-bottom:5px">── 선조의 인정 ──</div>
      <div style="display:flex;align-items:center;gap:8px;padding:7px 9px;background:#001a12;border:1px solid ${astg.color}44;border-radius:2px">
        <span style="color:${astg.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(astg,{size:16}):(astg.svgIcon||astg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:${astg.color}">${astg.name}</div>
          <div style="font-size:8px;color:#306050;margin-top:2px">${esc(astg.desc)} | 인정도 ${ef.ancestorApproval||0}</div>
          <div style="height:4px;background:#001008;border-radius:2px;margin-top:3px">
            <div style="width:${Math.min(100,Math.round((ef.ancestorApproval||0)/4))}%;height:100%;background:${astg.color};border-radius:2px;transition:width .4s"></div>
          </div>
        </div>
      </div>
      ${Object.keys(astg.bonus||{}).length>0 ? `<div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:3px">
        ${Object.entries(astg.bonus).map(([k,v])=>`<span style="padding:2px 6px;background:${astg.color}22;border:1px solid ${astg.color}44;color:${astg.color};font-size:8px;border-radius:2px">${k.toUpperCase()} +${v}</span>`).join('')}
      </div>` : ''}
    </div>

    <!-- ③ 망각 단계 목록 -->
    <div style="padding:8px 12px;border-bottom:1px solid #160028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 망각 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${[...FORGETTING_STACK_STAGES].reverse().map(s=>{
          const active = stack >= s.min && stack <= s.max;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1a0028':'#0a0015'};border:1px solid ${active?s.color:s.color+'33'};border-radius:2px;opacity:${active?1:0.45}">
            <span style="display:inline-flex;width:11px;height:11px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:11}):((s.svgIcon||'').replace('width="20" height="20"','width="11" height="11"')||s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:'#5040a0'}">${s.name}</span><span style="font-size:8px;color:#3a2060;margin-left:4px">(${s.min}${s.max<100?'~'+s.max:''})</span></div>
            ${active?`<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀</span>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ④ 봉인된 기억 목록 -->
    <div style="padding:10px 12px;border-bottom:1px solid #160028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 봉인된 기억 (${(ef.sealedMemories||[]).length}개) ──</div>
      ${(ef.sealedMemories||[]).length===0
        ? `<div style="font-size:9px;color:#4030a0;text-align:center;padding:6px">봉인된 기억이 없습니다</div>`
        : (ef.sealedMemories||[]).slice(-6).reverse().map(m=>`
          <div style="display:flex;align-items:center;gap:5px;padding:4px 7px;background:#0d0018;border:1px solid #3a1060;margin-bottom:3px;border-radius:2px">
            <span style="font-size:12px">🔒</span>
            <div style="flex:1;font-size:9px;color:#7050a0">${esc(m.label)}</div>
            <div style="font-size:8px;color:#4030a0">${m.sealedAt||''}</div>
          </div>`).join('')}
    </div>

    <!-- ⑤ 수호한 이름 -->
    <div style="padding:10px 12px;border-bottom:1px solid #160028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#40d0a0;letter-spacing:1px;margin-bottom:6px">── 수호한 선조 이름 (${(ef.guardedNames||[]).length}명) ──</div>
      ${(ef.guardedNames||[]).length===0
        ? `<div style="font-size:9px;color:#306050;text-align:center;padding:4px">아직 수호한 이름이 없습니다</div>`
        : `<div style="display:flex;flex-wrap:wrap;gap:4px">${(ef.guardedNames||[]).slice(-12).map(n=>`<span style="padding:3px 8px;background:#001a12;border:1px solid #40d0a0aa;color:#40d0a0;font-size:9px;border-radius:2px">${esc(n)}</span>`).join('')}</div>`}
      <!-- 이름 수호 입력 -->
      <div style="margin-top:8px;display:flex;gap:4px">
        <input id="guard-name-input" type="text" placeholder="선조 또는 NPC 이름..."
          style="flex:1;padding:5px;background:#001008;border:1px solid #20a060;color:#40d0a0;font-size:9px;border-radius:2px;outline:none">
        <button onclick="const i=document.getElementById('guard-name-input');if(i&&i.value.trim()){guardAncestorName(i.value.trim());i.value='';renderElfForgettingPanel();}"
          style="padding:5px 10px;background:#001a12;border:1px solid #40d0a0;color:#40d0a0;font-size:9px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">수호</button>
      </div>
    </div>

    <!-- ⑥ 행동 버튼 -->
    <div style="padding:10px 12px;border-bottom:1px solid #160028">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 망각 관련 행동 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px">
        <div style="padding:5px 8px;background:#0a0318;border:1px dashed #2a1040;border-radius:2px;font-size:9px;color:#5a3070">
        💡 망각 스택은 트라우마·기억 봉인·세월 등 서사적 사건으로만 쌓입니다
      </div</div>
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#40d0a0;margin-bottom:5px">── 망각 회복 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
        <button onclick="healForgettingStack(15,'명상');renderElfForgettingPanel()"
          style="padding:5px;background:#001a12;border:1px solid #40d0a0;color:#40d0a0;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">🌿 명상<br>-15</button>
        <button onclick="healForgettingStack(25,'기억 의식');renderElfForgettingPanel()"
          style="padding:5px;background:#001a12;border:1px solid #40d0a0;color:#40d0a0;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">🕯️ 기억 의식<br>-25</button>
        <button onclick="healForgettingStack(40,'선조 제례');renderElfForgettingPanel()"
          style="padding:5px;background:#001a12;border:1px solid #40d0a0;color:#40d0a0;font-size:8px;cursor:pointer;border-radius:2px;font-family:'Cinzel',serif">🌙 선조 제례<br>-40</button>
      </div>
    </div>

    <!-- ⑦ 최근 기록 -->
    ${(ef.history||[]).length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 기록 ──</div>
      ${[...ef.history].reverse().slice(0,10).map(h=>`
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0a0015;font-size:9px">
          <span>${h.event==='수호'?'💎':h.event==='회복'?'🌿':'💭'}</span>
          <span style="flex:1;color:#7050a0">${esc(h.reason||h.event)}</span>
          <span style="color:${(h.amount||0)<0?'#40d0a0':'#c040a0'};font-family:'Cinzel',serif">${(h.amount||0)>0?'+':''}${h.amount||0}</span>
          <span style="color:#3a2060;font-size:8px">(${h.stack||0})</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderElfForgettingPanel = renderElfForgettingPanel;

window.renderElfForgettingPanel  = renderElfForgettingPanel;

window.addForgettingStack        = addForgettingStack;

window.guardAncestorName         = guardAncestorName;

window.healForgettingStack       = healForgettingStack;

window.elfSealMemory             = elfSealMemory;

window.applyElfForgettingStats   = applyElfForgettingStats;

window.detectElfForgettingFromText = detectElfForgettingFromText;

window.loadElfForgetting         = loadElfForgetting;

window.clearElfForgetting        = clearElfForgetting;

export const ELF_EMOTION_KEY = 'tf-elf-emotion';

export const loadElfEmotion  = () => {
  try {
    return JSON.parse(lsGet(ELF_EMOTION_KEY) ||
      '{"suppression":70,"explosionCount":0,"emotionEvents":[],"history":[],"suppressStreak":0,"releaseStreak":0}');
  } catch(e) {
    return {suppression:70, explosionCount:0, emotionEvents:[], history:[], suppressStreak:0, releaseStreak:0};
  }
};

export const saveElfEmotion  = (d) => { try { lsSet(ELF_EMOTION_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearElfEmotion = () => lsDel(ELF_EMOTION_KEY);

export const EMOTION_SUPPRESSION_STAGES = [
  { min:85, max:100, name:'완전 억제',    icon:'🧊', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L19 6 L19 12 C19 17 15.5 20 12 21.5 C8.5 20 5 17 5 12 L5 6 Z" stroke-linejoin="round"/><path d="M9 9 L15 15 M15 9 L9 15" stroke-width="1.1"/></svg>`, color:'#80b0d0',
    desc:'감정이 완벽히 봉인됐다. 주변이 이 엘프를 "진정한 장로"로 여긴다.',
    bonus:{ mgc:18, int:16, per:14, neg:12, cha:8 }, penalty:{ mad:-15, wil:10 },
    emotionSkills:[], suppressSkills:['em_sup_cold_logic','em_sup_iron_will'],
    aiHint:'완전 억제 상태. 감정이 없는 것처럼 말하고 행동한다. 어떤 상황에서도 냉정하다. 주변 NPC들이 경외와 약간의 두려움을 느낀다.' },
  { min:60, max:84,  name:'높은 억제',    icon:'❄️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 22 M4 7 L20 17 M20 7 L4 17" stroke-width="1.3"/></svg>`, color:'#60a0c0',
    desc:'감정을 잘 제어한다. 엘프 사회의 기대에 부응하는 상태.',
    bonus:{ mgc:12, int:10, per:10, neg:8 }, penalty:{ mad:-8 },
    emotionSkills:[], suppressSkills:['em_sup_cold_logic'],
    aiHint:'높은 억제 상태. 감정이 있지만 드러내지 않는다. 이따금 눈빛이 흔들리지만 즉시 제어한다.' },
  { min:40, max:59,  name:'균형 상태',    icon:'⚖️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 L21 12" stroke-width="1.4"/><path d="M12 4 L12 20" stroke-width="1.2"/><path d="M6 12 L4 16 L8 16 Z M18 12 L16 16 L20 16 Z" stroke-width="1.1"/></svg>`, color:'#50c090',
    desc:'억제와 감정 해방 사이의 균형. 양쪽 스킬을 모두 사용 가능.',
    bonus:{ mgc:6, int:6, per:6, cha:6 }, penalty:{},
    emotionSkills:['em_rel_empathy'], suppressSkills:['em_sup_cold_logic'],
    aiHint:'균형 상태. 억제하되 공감도 할 수 있다. 인간들과 가장 자연스럽게 어울리는 상태.' },
  { min:20, max:39,  name:'감정 흘러넘침', icon:'💧', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C12 3 6 11 6 15.5 C6 18.5 8.7 21 12 21 C15.3 21 18 18.5 18 15.5 C18 11 12 3 12 3 Z" stroke-linejoin="round"/></svg>`, color:'#e080a0',
    desc:'감정이 자주 표면으로 올라온다. 동족 엘프들이 "아직 젊군"이라 본다.',
    bonus:{ cha:12, trst:10, wil:8 }, penalty:{ mgc:-8, per:-5, int:-4 },
    emotionSkills:['em_rel_empathy','em_rel_passion'], suppressSkills:[],
    aiHint:'감정이 넘치는 상태. 표정이 풍부하고 반응이 즉각적이다. 인간이나 수인들이 친근감을 느낀다.' },
  { min:0,  max:19,  name:'완전 해방',    icon:'🔥', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></svg>`, color:'#ff6080',
    desc:'감정이 완전히 해방됐다. 강력한 감정 마법이 가능하지만 이성이 흐릿해진다.',
    bonus:{ cha:20, trst:16, wil:14, fear:10 }, penalty:{ mgc:-18, per:-12, int:-10, wil:-5 },
    emotionSkills:['em_rel_empathy','em_rel_passion','em_rel_eruption'],
    suppressSkills:[],
    aiHint:'완전 해방 상태. 엘프로서는 극히 이례적. 감정이 폭발적이고 마법이 불안정하지만 강렬하다. 동족 엘프들이 경멸하거나 경계한다.' },
];

export function getEmotionStage(sup) {
  for (let i = EMOTION_SUPPRESSION_STAGES.length - 1; i >= 0; i--) {
    if (sup >= EMOTION_SUPPRESSION_STAGES[i].min) return EMOTION_SUPPRESSION_STAGES[i];
  }
  return EMOTION_SUPPRESSION_STAGES[EMOTION_SUPPRESSION_STAGES.length - 1];
}
window.getEmotionStage = getEmotionStage;

export function changeEmotionSuppression(delta, reason) {
  if (!isElfRace()) return;
  const ee = loadElfEmotion();
  const prev = ee.suppression || 70;
  ee.suppression = Math.max(0, Math.min(100, prev + delta));

  if (delta > 0) { ee.suppressStreak = (ee.suppressStreak||0) + 1; ee.releaseStreak = 0; }
  else           { ee.releaseStreak  = (ee.releaseStreak||0) + 1; ee.suppressStreak = 0; }

  ee.history = ee.history || [];
  ee.history.push({ delta, reason: reason||'', suppression: ee.suppression, at: new Date().toISOString().slice(0,16) });
  

  // 완전 해방(0) 도달 시 감정 폭발
  if (ee.suppression === 0 && prev > 0) {
    ee.explosionCount = (ee.explosionCount||0) + 1;
    ee.suppression = 15;
    saveElfEmotion(ee);
    applyElfEmotionStats();
    setTimeout(()=>toast('🔥 감정 해방! 억눌린 감정이 폭발했습니다!', 4000), 300);
    // 감정 마법 스킬 해금
    if (!S.unlockedSkills?.['em_rel_eruption']) {
      S.unlockedSkills = S.unlockedSkills || {};
      S.unlockedSkills['em_rel_eruption'] = true;
      if (typeof saveSkills==='function') saveSkills(S.unlockedSkills);
      setTimeout(()=>toast('🔓 감정 폭발 스킬 해금: 💥 감정 폭발', 4000), 800);
    }
    return ee;
  }

  // 억제 스킬 해금 확인
  if (ee.suppression >= 85) {
    ['em_sup_cold_logic','em_sup_iron_will'].forEach(sid => {
      if (!S.unlockedSkills?.[sid]) {
        S.unlockedSkills = S.unlockedSkills || {};
        S.unlockedSkills[sid] = true;
        if (typeof saveSkills==='function') saveSkills(S.unlockedSkills);
        const sk = EMOTION_SKILLS[sid];
        if (sk) setTimeout(()=>toastHTML(`🔓 억제 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3500), 600);
      }
    });
  }
  // 해방 스킬 해금
  if (ee.suppression <= 20) {
    ['em_rel_empathy','em_rel_passion'].forEach(sid => {
      if (!S.unlockedSkills?.[sid]) {
        S.unlockedSkills = S.unlockedSkills || {};
        S.unlockedSkills[sid] = true;
        if (typeof saveSkills==='function') saveSkills(S.unlockedSkills);
        const sk = EMOTION_SKILLS[sid];
        if (sk) setTimeout(()=>toastHTML(`🔓 감정 해방 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3500), 600);
      }
    });
  }

  saveElfEmotion(ee);
  applyElfEmotionStats();
}
window.changeEmotionSuppression = changeEmotionSuppression;

export function applyElfEmotionStats() {
  if (!isElfRace()) return;
  const ee = loadElfEmotion();
  const stg = getEmotionStage(ee.suppression || 70);
  const prev = S._elfEmotionBonus || {};
  Object.entries(prev).forEach(([k,v]) => { if (S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v); });
  const nb = {};
  Object.entries(stg.bonus||{}).forEach(([k,v]) => { S.stats[k]=Math.min(999,(S.stats[k]||50)+v); nb[k]=v; });
  Object.entries(stg.penalty||{}).forEach(([k,v]) => { S.stats[k]=Math.max(0,(S.stats[k]||50)+v); });
  S._elfEmotionBonus = nb;
  if (typeof saveStats==='function') saveStats(S.stats);
}
window.applyElfEmotionStats = applyElfEmotionStats;

export function detectElfEmotionFromText(text) {
  if (!text || !isElfRace()) return;
  if (/눈물을 흘렸|감정을 드러냈|분노했|웃음을 터뜨렸|울었/.test(text) && Math.random()<0.5) changeEmotionSuppression(-10, 'AI 감지: 감정 표출');
  if (/감정을 억눌렀|냉정하게|표정 하나 변하지|침묵으로/.test(text) && Math.random()<0.4) changeEmotionSuppression(8, 'AI 감지: 억제');
}
window.detectElfEmotionFromText = detectElfEmotionFromText;

export function renderElfEmotionPanel() {
  const body = document.getElementById('pb-elf-emotion');
  if (!body) return;
  if (!isElfRace()) {
    body.innerHTML=`<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px"><div style="font-size:32px;margin-bottom:10px">💗</div><div>엘프족 캐릭터에게만 활성화됩니다.</div></div>`;
    return;
  }
  const ee = loadElfEmotion();
  const sup = ee.suppression || 70;
  const stg = getEmotionStage(sup);
  const color = stg.color;
  const RARITY_C = { uncommon:'#4a9a6a', rare:'#4a6fa5', epic:'#8a40c0', legendary:'#c8a96e' };

  // 해금된 감정 스킬
  const unlockedSkills = [...(stg.emotionSkills||[]), ...(stg.suppressSkills||[])]
    .map(id => EMOTION_SKILLS[id]).filter(Boolean);

  body.innerHTML = `
    <!-- ① 헤더: 억제도 슬라이더 -->
    <div style="padding:14px;background:linear-gradient(135deg,#180010,#200018);border-bottom:2px solid ${color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="color:${color};display:inline-flex;flex-shrink:0;transform:scale(1.27);transform-origin:left center">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:16}):(stg.svgIcon||stg.icon)}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${color};letter-spacing:1px">${stg.name}</div>
          <div style="font-size:9px;color:#804060;margin-top:2px">억제도 ${sup}/100 | 폭발 ${ee.explosionCount||0}회</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;font-size:20px;color:${color}">${sup}<span style="font-size:9px;color:#603040">/100</span></div>
          <div style="font-size:8px;color:#603040">억제도</div>
        </div>
      </div>
      <!-- 슬라이더 바: 왼쪽=해방(0), 오른쪽=억제(100) -->
      <div style="position:relative;height:12px;background:linear-gradient(90deg,#ff6080,#60a0c0);border-radius:6px;margin-bottom:4px;border:1px solid #5040a0">
        <div style="position:absolute;top:50%;left:${sup}%;transform:translate(-50%,-50%);width:16px;height:16px;background:#fff;border:2px solid ${color};border-radius:50%;box-shadow:0 0 6px ${color}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:8px;color:#604050">
        <span>🔥 완전 해방</span><span>🧊 완전 억제</span>
      </div>
      <div style="margin-top:8px;font-size:10px;color:${color};font-style:italic">"${stg.desc}"</div>
    </div>

    <!-- ② 억제도 단계 -->
    <div style="padding:8px 12px;border-bottom:1px solid #180018">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 억제도 단계 ──</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${EMOTION_SUPPRESSION_STAGES.map(s=>{
          const active = sup >= s.min && sup <= s.max;
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#1e0015':'#0e0010'};border:1px solid ${active?s.color:s.color+'33'};border-radius:2px;opacity:${active?1:0.45}">
            <span style="display:inline-flex;width:11px;height:11px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:11}):((s.svgIcon||'').replace('width="20" height="20"','width="11" height="11"')||s.icon)}</span>
            <div style="flex:1"><span style="font-family:'Cinzel',serif;font-size:9px;color:${active?s.color:'#6040a0'}">${s.name}</span><span style="font-size:8px;color:#3a2040;margin-left:4px">(${s.min}~${s.max})</span></div>
            ${active?`<span style="font-size:8px;color:${s.color};font-family:'Cinzel',serif">◀</span>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ③ 스탯 효과 -->
    <div style="padding:10px 12px;border-bottom:1px solid #180018">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 억제도 스탯 효과 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">
        ${Object.entries(stg.bonus||{}).map(([k,v])=>`<div style="padding:3px 6px;background:#0e0018;border:1px solid ${color}33;border-radius:2px;font-size:9px"><span style="color:${color}">${k.toUpperCase()}</span><span style="color:#60d060;margin-left:3px">+${v}</span></div>`).join('')}
        ${Object.entries(stg.penalty||{}).map(([k,v])=>`<div style="padding:3px 6px;background:#0e0008;border:1px solid #603030;border-radius:2px;font-size:9px"><span style="color:#c06060">${k.toUpperCase()}</span><span style="color:#e05050;margin-left:3px">${v}</span></div>`).join('')}
      </div>
    </div>

    <!-- ④ 해금된 스킬 -->
    ${unlockedSkills.length > 0 ? `
    <div style="padding:10px 12px;border-bottom:1px solid #180018">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:6px">── 현재 억제도 스킬 ──</div>
      ${unlockedSkills.map(sk => {
        const rc = RARITY_C[sk.rarity]||'#8a9a8a';
        return `<div style="padding:7px 9px;background:#0e0015;border:1px solid ${rc}44;margin-bottom:4px;border-radius:2px">
          <div style="padding:5px 8px;background:#0a0308;border:1px dashed #3a1020;border-radius:2px;font-size:9px;color:#7a3050">
        💡 감정 억제도는 수련·사건·NPC 상호작용으로 변화합니다. 직접 조작 불가
      </div>
      </div>`;
      }).join('')}
      <div>
        <div style="font-size:8px;color:#e080a0;margin-bottom:4px">감정 해방 (억제도 ↓)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
          <button onclick="changeEmotionSuppression(-10,'감정 표출');renderElfEmotionPanel()"
            style="padding:6px;background:#180010;border:1px solid #c06080;color:#e080a0;font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;border-radius:2px">💧 감정 표출 <span style="float:right">-10</span></button>
          <button onclick="changeEmotionSuppression(-20,'눈물 흘림');renderElfEmotionPanel()"
            style="padding:6px;background:#180010;border:1px solid #c06080;color:#e080a0;font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;border-radius:2px">😢 눈물 흘림 <span style="float:right">-20</span></button>
          <button onclick="changeEmotionSuppression(-15,'분노 표출');renderElfEmotionPanel()"
            style="padding:6px;background:#180010;border:1px solid #c06080;color:#e080a0;font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;border-radius:2px">😤 분노 표출 <span style="float:right">-15</span></button>
          <button onclick="changeEmotionSuppression(-40,'감정 완전 해방');renderElfEmotionPanel()"
            style="padding:6px;background:#180010;border:1px solid #ff4060;color:#ff6080;font-size:9px;cursor:pointer;font-family:'Crimson Text',serif;border-radius:2px">🔥 완전 해방 <span style="float:right">-40</span></button>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- ⑥ 최근 기록 -->
    ${(ee.history||[]).length ? `
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${color};letter-spacing:1px;margin-bottom:5px">── 감정 기록 ──</div>
      ${[...ee.history].reverse().slice(0,10).map(h=>`
        <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #0d000e;font-size:9px">
          <span>${(h.delta||0)>0?'🧊':'🔥'}</span>
          <span style="flex:1;color:#806080">${esc(h.reason||'')}</span>
          <span style="color:${(h.delta||0)>0?'#80b0d0':'#e080a0'};font-family:'Cinzel',serif">${(h.delta||0)>0?'+':''}${h.delta||0}</span>
          <span style="color:#402040;font-size:8px">(${h.suppression||0})</span>
        </div>`).join('')}
    </div>` : ''}
  `;
}
window.renderElfEmotionPanel = renderElfEmotionPanel;

window.renderElfEmotionPanel       = renderElfEmotionPanel;

window.changeEmotionSuppression    = changeEmotionSuppression;

window.applyElfEmotionStats        = applyElfEmotionStats;

window.detectElfEmotionFromText    = detectElfEmotionFromText;

window.loadElfEmotion              = loadElfEmotion;

window.clearElfEmotion             = clearElfEmotion;

export const HUMAN_AWAKENING_KEY    = "tf-human-awakening";

export const HA_PROGRESS_KEY        = 'tf-ha-progress';

export const HA_DEED_KEY            = 'tf-ha-deed';

export const HA_FATE_KEY            = 'tf-ha-fate';

export function loadHumanAwakening() {
  try {
    // 분리 키 우선
    const prog = lsGet(HA_PROGRESS_KEY); const deed = lsGet(HA_DEED_KEY); const fate = lsGet(HA_FATE_KEY);
    if (prog) {
      const p = JSON.parse(prog);
      const d = deed ? JSON.parse(deed) : {growth:0,courage:0,bond:0,triumph:0,sacrifice:0};
      const f = fate ? JSON.parse(fate) : {path:'none',pathBonus:{warrior:0,mage:0,diplomat:0},fateChoices:[],turnsSinceFate:0};
      return {...p, deed:d, ...f};
    }
    // 폴백
    const r = lsGet(HUMAN_AWAKENING_KEY);
    return r ? JSON.parse(r) : {points:0,stage:0,history:[],deed:{growth:0,courage:0,bond:0,triumph:0,sacrifice:0},choiceCount:0,fateChoices:[],path:'none',pathBonus:{warrior:0,mage:0,diplomat:0},turnsSinceFate:0,awakened:false};
  } catch(e) { return {points:0,stage:0,history:[],deed:{growth:0,courage:0,bond:0,triumph:0,sacrifice:0},choiceCount:0,fateChoices:[],path:'none',pathBonus:{warrior:0,mage:0,diplomat:0},turnsSinceFate:0,awakened:false}; }
}
window.loadHumanAwakening = loadHumanAwakening;

export function saveHumanAwakening(d) {
  try {
    // 분리 저장
    lsSet(HA_PROGRESS_KEY, JSON.stringify({points:d.points||0,stage:d.stage||0,history:d.history||[],choiceCount:d.choiceCount||0,awakened:d.awakened||false}));
    lsSet(HA_DEED_KEY,     JSON.stringify(d.deed||{growth:0,courage:0,bond:0,triumph:0,sacrifice:0}));
    lsSet(HA_FATE_KEY,     JSON.stringify({path:d.path||'none',pathBonus:d.pathBonus||{warrior:0,mage:0,diplomat:0},fateChoices:d.fateChoices||[],turnsSinceFate:d.turnsSinceFate||0}));
    // 하위호환
    lsSet(HUMAN_AWAKENING_KEY, JSON.stringify(d));
  } catch(e) {}
}
window.saveHumanAwakening = saveHumanAwakening;


export const HUMAN_AWAKENING_STAGES = [
  {
    stage: 0, name: "평범한 인간", icon: "👤", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M6 20 C6 15.5 8.5 13 12 13 C15.5 13 18 15.5 18 20"/></svg>`,
    color: "#b09060", threshold: 0,
    desc: "아직 운명이 깨어나지 않은 상태. 그러나 가능성은 무한하다.",
    statBonus: {}, statPenalty: {},
    skills: [],
    aura: "평범한 인간의 기운. 그러나 무언가 다른 것이 느껴진다.",
    aiHint: ""
  },
  {
    stage: 1, name: "운명의 씨앗", icon: "🌱", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 6 C14 6 15 4.5 15 3 C13.5 3 12 4 12 6 Z" stroke-width="1.2"/></svg>`,
    color: "#c0a040", threshold: 50,
    desc: "내면에 잠든 가능성이 싹트기 시작했다. 위기 속에서 더 빛난다.",
    statBonus: { wil: 5, luk: 4, per: 3 },
    statPenalty: {},
    skills: [
      { id:"ha_s1_human_potential", name:"인간의 가능성", icon:"✨", type:"passive",
        desc:"새로운 상황에서 모든 판정에 +5 보너스. 두 번째 기회가 생긴다.",
        rarity:"uncommon", mpCost:0, condition:"new_situation", conditionDesc:"새 상황 진입 시",
        statBoost:{wil:40, luk:32} }
    ],
    aura: "주변 사람들이 이 인간에게서 특별한 무언가를 느낀다.",
    aiHint: "1단계 각성: 캐릭터가 위기 속에서 포기하지 않는 강한 의지를 드러내는 장면을 자연스럽게 묘사하라."
  },
  {
    stage: 2, name: "의지의 눈뜸", icon: "🔥", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></svg>`,
    color: "#d0a030", threshold: 120,
    desc: "강인한 의지가 한계를 깨기 시작했다. 불굴의 정신이 몸에 깃든다.",
    statBonus: { wil: 10, str: 6, end: 6, luk: 5 },
    statPenalty: {},
    skills: [
      { id:"ha_s2_iron_will", name:"강철 의지", icon:"⚔️", type:"active",
        desc:"MP 15. 의지를 불태워 1턴간 모든 판정 +15. HP가 낮을수록 효과 최대 +30.",
        rarity:"rare", mpCost:15, condition:null, conditionDesc:null, statBoost:{} },
      { id:"ha_s2_rally", name:"고무의 외침", icon:"📣", type:"active",
        desc:"MP 10. 아군 전체 사기를 고취. 다음 1턴 아군 판정 +10. REP +3.",
        rarity:"uncommon", mpCost:10, condition:null, conditionDesc:null, statBoost:{} }
    ],
    aura: "흔들리지 않는 눈빛. 동료들이 이 인간 곁에서 용기를 얻는다.",
    aiHint: "2단계 각성: 캐릭터가 고통스럽거나 어려운 상황에서도 포기하지 않고 끝까지 버티는 모습을 묘사하라."
  },
  {
    stage: 3, name: "영웅의 발자국", icon: "⭐", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round" opacity="0.7"/></svg>`,
    color: "#e09020", threshold: 220,
    desc: "이 인간의 이름이 사람들 사이에 퍼지기 시작했다. 전설의 서막이다.",
    statBonus: { wil: 16, str: 10, end: 10, luk: 10, rep: 8, cha: 6 },
    statPenalty: {},
    skills: [
      { id:"ha_s3_hero_aura", name:"영웅의 기운", icon:"🌟", type:"passive",
        desc:"전투 및 협상 시 REP·CHA +15 상시. 적이 위압감을 느낀다.",
        rarity:"rare", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{rep:120, cha:96} },
      { id:"ha_s3_fate_surge", name:"운명의 파동", icon:"💫", type:"event",
        desc:"HP 30 이하에서 운명이 개입. LUK 최대화, 다음 판정 반드시 성공.",
        rarity:"rare", mpCost:0, condition:"low_hp", conditionDesc:"HP 30 이하 시",
        statBoost:{luk:200} }
    ],
    aura: "이 인간이 나타나면 전황이 바뀐다. NPC들이 '그/그녀라면 해낼 수 있다'고 말한다.",
    aiHint: "3단계 각성: 캐릭터의 등장이 전황이나 상황의 흐름을 바꾸는 극적인 장면을 연출하라. 주변 인물들이 감탄하거나 희망을 되찾는 모습을 포함하라."
  },
  {
    stage: 4, name: "전설의 시작", icon: "🏆", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/></svg>`,
    color: "#f07010", threshold: 350,
    desc: "이 인간의 이름이 역사에 새겨지기 시작했다. 운명이 이 자를 중심으로 돈다.",
    statBonus: { wil: 24, str: 16, end: 16, luk: 16, rep: 14, cha: 12, per: 10 },
    statPenalty: {},
    skills: [
      { id:"ha_s4_legend_aura", name:"전설의 이름", icon:"📜", type:"passive",
        desc:"이름만으로 적을 위축시킨다. FEAR +18, REP +20 상시. 처음 만나는 NPC 우호적.",
        rarity:"epic", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{rep:160, cha:140, fear:144} },
      { id:"ha_s4_miracle", name:"기적의 순간", icon:"✨", type:"event",
        desc:"절체절명의 위기에서 기적이 일어난다. 1회 한정, 치명적 실패를 역전.",
        rarity:"epic", mpCost:0, condition:"crit_fail", conditionDesc:"대실패 시 1회 전환",
        statBoost:{} }
    ],
    aura: "이 자의 발자국마다 역사가 만들어진다. 신들조차 관심을 갖기 시작한다.",
    aiHint: "4단계 각성: 캐릭터의 행동이 역사적 사건으로 기록될 만한 위업이 되는 장면을 연출하라. 목격자들이 훗날 이 순간을 이야기할 것임을 암시하라."
  },
  {
    stage: 5, name: "운명의 중심", icon: "🌍", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></svg>`,
    color: "#f05010", threshold: 520,
    desc: "세계가 이 인간을 중심으로 돌아간다. 만남마다 운명의 실이 엮인다.",
    statBonus: { wil: 35, str: 24, end: 24, luk: 24, rep: 22, cha: 20, per: 18, int: 16 },
    statPenalty: {},
    skills: [
      { id:"ha_s5_destiny_weave", name:"운명의 직조", icon:"🕸️", type:"active",
        desc:"MP 40. 상황의 흐름을 강제로 유리하게 바꾼다. 다음 3턴 모든 판정 +25.",
        rarity:"legendary", mpCost:40, condition:null, conditionDesc:null, statBoost:{} },
      { id:"ha_s5_inspire", name:"영감의 빛", icon:"💡", type:"active",
        desc:"MP 25. 동료나 NPC 한 명을 영구적으로 고무. 해당 인물 능력치 영구 +10.",
        rarity:"legendary", mpCost:25, condition:null, conditionDesc:null, statBoost:{} }
    ],
    aura: "이 존재가 있는 곳이 세계의 중심이 된다. 운명의 실이 모두 이 자에게 수렴한다.",
    aiHint: "5단계 각성: 캐릭터의 결정이 세계 전체에 영향을 미치는 규모로 묘사하라. 이 인간이 없으면 이 순간이 존재할 수 없었다는 것을 느끼게 하라."
  },
  {
    stage: 6, name: "살아있는 신화", icon: "🌠", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>`,
    color: "#f03020", threshold: 750,
    desc: "신화 속 영웅이 현실에 내려왔다. 이 인간의 이름은 천 년을 살 것이다.",
    statBonus: { wil: 50, str: 36, end: 36, luk: 36, rep: 34, cha: 30, per: 26, int: 22, ldr: 20 },
    statPenalty: {},
    skills: [
      { id:"ha_s6_myth_presence", name:"신화의 현존", icon:"👑", type:"passive",
        desc:"존재 자체가 전설이다. 모든 대화·전투 판정 +20 상시. 중립 세력 자동 우호.",
        rarity:"legendary", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{rep:280, cha:240, wil:200, ldr:200} },
      { id:"ha_s6_epoch_turn", name:"시대를 바꾸다", icon:"⏳", type:"active",
        desc:"MP 60. 현재 사건의 흐름을 완전히 역전. 패배하던 전투나 협상을 승리로 전환.",
        rarity:"legendary", mpCost:60, condition:null, conditionDesc:null, statBoost:{} }
    ],
    aura: "사람들이 자발적으로 이 이름을 전설로 기록한다. 신들이 이 인간의 다음 행동을 지켜본다.",
    aiHint: "6단계 각성: 캐릭터가 신화 속 영웅과 동등한 위업을 이루는 장면을 묘사하라. 이 자의 이름이 후세에 전해질 것임을 직접적으로 암시하라."
  },
  {
    stage: 7, name: "인류의 정점", icon: "🌟👑", svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="10.5" stroke-width="0.9" opacity="0.5"/></svg>`,
    color: "#ff2000", threshold: 1000,
    desc: "인간이 도달할 수 있는 최고의 경지. 한계란 존재하지 않는다.",
    statBonus: { wil: 70, str: 52, end: 52, luk: 52, rep: 50, cha: 44, per: 38, int: 34, ldr: 30, mgc: 20 },
    statPenalty: {},
    skills: [
      { id:"ha_s7_human_transcend", name:"인간 초월", icon:"🌌", type:"active",
        desc:"HP 50 소모. 인간의 한계를 완전히 초월. 1턴간 모든 스탯 2배, 모든 판정 자동 성공.",
        rarity:"legendary", mpCost:0, condition:null, conditionDesc:null, statBoost:{} },
      { id:"ha_s7_undying_will", name:"불멸의 의지", icon:"♾️", type:"passive",
        desc:"의지가 죽음조차 거부한다. 사망 직전 1회 부활, HP 50 회복. 매 전투 1회.",
        rarity:"legendary", mpCost:0, condition:"always", conditionDesc:"항시 발동",
        statBoost:{wil:480, end:360, luk:280} }
    ],
    aura: "이 존재 앞에서 신조차 침묵한다. 인간이라는 종족의 가능성이 이 한 사람에 집약된다.",
    aiHint: "7단계 각성: 인간이라는 종족의 정점에 선 이 존재를 신조차 경이로움으로 바라보는 장면을 묘사하라. 한계를 정의하는 것이 무의미해진 순재임을 나타내라."
  }
];

export function gainHumanAwakening(deedType, customGain) {
  const race = S.character?.race || "";
  // [F-4 FIX] 빈 문자열은 인간이 아닌 "미설정"으로 처리
  const isHuman = race.length > 0 && (race.includes("인간") || race.toLowerCase().includes("human"));
  if (!isHuman) return;
  const ha = loadHumanAwakening();
  const deedDef = HUMAN_DEED_GAIN[deedType];
  const gain = customGain !== undefined ? customGain : (deedDef?.gain || 5);
  ha.points = Math.min(1000, (ha.points || 0) + gain);
  ha.deed = ha.deed || {};
  if (deedType) ha.deed[deedType] = (ha.deed[deedType] || 0) + 1;
  ha.history = ha.history || [];
  ha.history.push({
    type: deedType, gain, label: deedDef?.label || deedType,
    icon: deedDef?.icon || "🌟", total: ha.points,
    at: new Date().toISOString().slice(0, 16)
  });
  
  // 턴 카운터 증가 및 운명 선택지 트리거
  ha.turnsSinceFate = (ha.turnsSinceFate || 0) + 1;
  // 단계 업데이트
  const prevStage = ha.stage || 0;
  let newStage = 0;
  for (let i = HUMAN_AWAKENING_STAGES.length - 1; i >= 0; i--) {
    if (ha.points >= HUMAN_AWAKENING_STAGES[i].threshold) { newStage = i; break; }
  }
  ha.stage = newStage;
  saveHumanAwakening(ha);
  // 단계 상승 알림
  if (newStage > prevStage) {
    const stg = HUMAN_AWAKENING_STAGES[newStage];
    setTimeout(() => {
      toastHTML(`🌟 각성 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 4000);
      stg.skills.forEach(sk => {
        if (!S.unlockedSkills[sk.id]) {
          S.unlockedSkills[sk.id] = true;
          saveSkills(S.unlockedSkills);
          setTimeout(() => toastHTML(`🔓 새 각성 스킬 해금: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)}`, 3000), 1500);
        }
      });
    }, 500);
  }
  // 운명 선택지 트리거 (10회 행적마다)
  const totalDeeds = Object.values(ha.deed || {}).reduce((a, v) => a + v, 0);
  if (totalDeeds > 0 && totalDeeds % 10 === 0) {
    setTimeout(() => openHumanFateChoice(), 1200);
  }
  // 스탯 반영
  applyHumanAwakeningStats();
  return ha;
}
window.gainHumanAwakening = gainHumanAwakening;

export function openHumanFateChoice() {
  const race = S.character?.race || "";
  // [F-4 FIX] 빈 문자열은 인간이 아닌 "미설정"으로 처리
  const isHuman = race.length > 0 && (race.includes("인간") || race.toLowerCase().includes("human"));
  if (!isHuman) return;
  const ha = loadHumanAwakening();
  ha.choiceCount = (ha.choiceCount || 0) + 1;
  saveHumanAwakening(ha);
  // [F-5 FIX] 기존 overlay 제거 후 새로 생성 (누적 방지)
  const existing = document.getElementById('fate-choice-overlay');
  if (existing) existing.remove();
  // 운명 선택 UI 생성
  const overlay = document.createElement('div');
  overlay.id = 'fate-choice-overlay';
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s ease`;
  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#1a1000,#2a1a00,#1a1000);border:2px solid #f0c040;max-width:340px;width:90%;padding:0;font-family:'Cinzel',serif;box-shadow:0 0 40px #f0c04044">
      <div style="background:linear-gradient(135deg,#100800,#1a1200);padding:16px;border-bottom:1px solid #b08020;text-align:center">
        <div style="font-size:28px;margin-bottom:6px">⭐🌟⭐</div>
        <div style="font-size:14px;color:#f0c040;letter-spacing:2px">운명의 선택</div>
        <div style="font-size:10px;color:#8a7040;margin-top:4px">인간의 운명이 갈림길에 섰다. 어떤 길을 택하겠는가?</div>
        <div style="font-size:9px;color:#6a5030;margin-top:3px">선택한 스탯이 영구 상승하며 전용 스킬이 해금됩니다</div>
      </div>
      <div style="padding:14px;display:flex;flex-direction:column;gap:8px">
        ${Object.entries(HUMAN_FATE_PATHS).map(([k, p]) => {
          const chosen = ha.path === k;
          const statStr = Object.entries(p.stats).map(([s, v]) => `${s.toUpperCase()} +${v}`).join(', ');
          return `<button onclick="chooseFatePath('${k}')" style="padding:12px;background:${chosen ? p.color+'22' : '#150d03'};border:1px solid ${p.color}${chosen?'':'44'};color:${p.color};cursor:pointer;text-align:left;border-radius:2px;transition:all .15s;font-family:'Crimson Text',serif">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <span style="color:${p.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(p,{size:16}):(p.svgIcon||p.icon)}</span>
              <span style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:1px">${p.label}</span>
              ${chosen ? '<span style="font-size:9px;background:'+p.color+'33;padding:1px 6px;border:1px solid '+p.color+';margin-left:auto">현재 계열</span>' : ''}
            </div>
            <div style="font-size:9px;color:#8a7040;margin-bottom:4px">${p.desc}</div>
            <div style="font-size:9px;color:#f0c040">📊 ${statStr}</div>
          </button>`;
        }).join('')}
      </div>
      <div style="padding:0 14px 14px">
        <button onclick="document.getElementById('fate-choice-overlay').remove()" style="width:100%;padding:8px;background:#0d0800;border:1px solid #3a2a0a;color:#6a5a3a;font-family:'Cinzel',serif;font-size:9px;cursor:pointer;border-radius:2px">나중에 결정한다</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  toast('⭐ 운명의 선택지가 등장했다!', 3000);
}
window.openHumanFateChoice = openHumanFateChoice;

export function chooseFatePath(pathKey) {
  const path = HUMAN_FATE_PATHS[pathKey];
  if (!path) return;
  const ha = loadHumanAwakening();
  const prevPath = ha.path;
  // 이전 계열 보너스 제거
  if (prevPath && prevPath !== 'none' && HUMAN_FATE_PATHS[prevPath]) {
    const prev = HUMAN_FATE_PATHS[prevPath];
    Object.entries(prev.stats).forEach(([k, v]) => {
      const times = ha.pathBonus?.[prevPath] || 1;
      if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - (v * times));
    });
  }
  ha.path = pathKey;
  ha.pathBonus = ha.pathBonus || { warrior: 0, mage: 0, diplomat: 0 };
  ha.pathBonus[pathKey] = (ha.pathBonus[pathKey] || 0) + 1;
  ha.fateChoices = ha.fateChoices || [];
  ha.fateChoices.push({ path: pathKey, at: new Date().toISOString().slice(0, 16) });
  // 스탯 영구 상승
  Object.entries(path.stats).forEach(([k, v]) => {
    if (k === 'mp') { S.stats.mp = Math.min((typeof getPlayerMaxMp==='function'?getPlayerMaxMp():999), (S.stats.mp || 50) + v); }
    else if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, S.stats[k] + v); }
  );
  saveHumanAwakening(ha);
  if (typeof saveStats === 'function') saveStats(S.stats);
  // 스킬 해금
  const skillId = path.skillUnlock;
  if (skillId && !S.unlockedSkills[skillId]) {
    S.unlockedSkills[skillId] = true;
    saveSkills(S.unlockedSkills);
    const sk = HUMAN_PATH_SKILLS[skillId];
    if (sk) setTimeout(() => toastHTML(`🔓 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(path,{size:14}):(path.icon)} ${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:14}):(sk.icon)} ${esc(sk.name)} 해금!`, 3500), 500);
  }
  // 칭호 부여 시도
  try { grantTitle(path.titleUnlock); } catch(e) {}
  window.updateHeader();
  // 오버레이 닫기
  const ov = document.getElementById('fate-choice-overlay');
  if (ov) ov.remove();
  const statStr = Object.entries(path.stats).map(([s, v]) => `${s.toUpperCase()} +${v}`).join(', ');
  toast(`${path.label} 선택! ${statStr} 영구 상승`, 4000, path);
  if (typeof window.renderHumanAwakeningPanel === 'function') {
    const pb = document.getElementById('pb-human-awakening');
    if (pb) window.renderHumanAwakeningPanel();
  }
}
window.chooseFatePath = chooseFatePath;

export function applyHumanAwakeningStats() {
  const ha = loadHumanAwakening();
  const stg = HUMAN_AWAKENING_STAGES[ha.stage || 0];
  if (!stg) return;
  const prev = S._humanAwakeBonus || {};
  Object.entries(prev).forEach(([k, v]) => { if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v); });
  const newBonus = {};
  Object.entries(stg.statBonus || {}).forEach(([k, v]) => { S.stats[k] = Math.min(999, (S.stats[k] || 50) + v); newBonus[k] = v; });
  S._humanAwakeBonus = newBonus;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyHumanAwakeningStats = applyHumanAwakeningStats;

export function getHumanAwakeningStatus() {
  const race = S.character?.race || "";
  const isHuman = race.includes("인간") || race.toLowerCase().includes("human") || race === "" || !race;
  if (!isHuman) return null;
  const ha = loadHumanAwakening();
  const stg = HUMAN_AWAKENING_STAGES[ha.stage || 0];
  const nextStg = HUMAN_AWAKENING_STAGES[(ha.stage || 0) + 1];
  return { ...ha, stageDef: stg, nextStage: nextStg };
}
window.getHumanAwakeningStatus = getHumanAwakeningStatus;

window.gainHumanAwakening        = gainHumanAwakening;

window.applyHumanAwakeningStats  = applyHumanAwakeningStats;

window.openHumanFateChoice       = openHumanFateChoice;

window.chooseFatePath            = chooseFatePath;

export const NPC_INSPIRE_KEY = "tf-npc-inspire";

export const loadNpcInspire = () => { try { return JSON.parse(lsGet(NPC_INSPIRE_KEY) || "{}"); } catch(e) { return {}; } };

export const saveNpcInspire = (d) => { try { lsSet(NPC_INSPIRE_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearNpcInspire = () => lsDel(NPC_INSPIRE_KEY);

export function inspireNpc(npcName, methodId, customPower) {
  const ha = loadHumanAwakening();
  const myStage = ha.stage || 0;
  const method = NPC_INSPIRE_METHODS.find(m => m.id === methodId);
  if (!method) return;
  if (myStage < method.reqStage) {
    toast(`⚠️ 각성 단계 부족 (필요: ${method.reqStage}단계)`); return;
  }
  if (ha.points < method.cost) {
    toast(`⚠️ 각성도 부족! 필요: ${method.cost}, 현재: ${ha.points}`); return;
  }
  // 각성도 소모
  ha.points = Math.max(0, ha.points - method.cost);
  saveHumanAwakening(ha);
  applyHumanAwakeningStats();

  // NPC 감화도 증가
  const nid = loadNpcInspire();
  if (!nid[npcName]) nid[npcName] = { points: 0, stage: 0, history: [], inspired: false };
  const prev = nid[npcName];
  const power = customPower !== undefined ? customPower : method.power;
  prev.points = Math.min(100, (prev.points || 0) + power);

  // 단계 계산
  const prevStage = prev.stage || 0;
  let newStage = 0;
  for (let i = NPC_INSPIRE_STAGES.length - 1; i >= 0; i--) {
    if (prev.points >= NPC_INSPIRE_STAGES[i].threshold) { newStage = i; break; }
  }
  prev.stage = newStage;
  prev.inspired = newStage >= 4;
  prev.history = prev.history || [];
  prev.history.push({
    method: method.name, icon: method.icon, power,
    total: prev.points, at: new Date().toISOString().slice(0, 16)
  });
  
  nid[npcName] = prev;
  saveNpcInspire(nid);

  // 단계 상승 알림 + AI 컨텍스트 주입
  if (newStage > prevStage) {
    const stg = NPC_INSPIRE_STAGES[newStage];
    setTimeout(() => toastHTML(`💗 ${esc(npcName)}의 감화 단계 상승! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(stg,{size:14}):(stg.icon)} ${esc(stg.name)} (${esc(newStage)}단계)`, 3500), 300);
    if (S._nextInjectedContext !== undefined) {
      S._nextInjectedContext = (S._nextInjectedContext || '') +
        ` [NPC 감화 진행: ${npcName} → ${stg.name}(${newStage}단계)] ${stg.aiHint}`;
    }
  } else {
    toastHTML(`💗 ${esc(npcName)}에게 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(method,{size:14}):(method.icon)} ${esc(method.name)} 시전! (감화도 +${esc(power)} → ${esc(prev.points)}/100)`, 2500);
    if (S._nextInjectedContext !== undefined) {
      S._nextInjectedContext = (S._nextInjectedContext || '') +
        ` [NPC 감화 행동: ${npcName}에게 ${method.name} 시전. ${method.aiHint}]`;
    }
  }
  return prev;
}
window.inspireNpc = inspireNpc;

export function useApsSkill(skillId, targetNpcName) {
  const skill = AWAKENING_POWER_SKILLS.find(s => s.id === skillId);
  if (!skill) return;
  const ha = loadHumanAwakening();
  if ((ha.stage || 0) < skill.reqStage) {
    toast(`⚠️ 필요 각성 단계: ${skill.reqStage}단계 (현재: ${ha.stage || 0}단계)`); return;
  }
  if (ha.points < skill.cost) {
    toast(`⚠️ 각성도 부족! 필요: ${skill.cost}, 현재: ${ha.points}`); return;
  }
  ha.points = Math.max(0, ha.points - skill.cost);
  ha.history = ha.history || [];
  ha.history.push({
    type: "skill_use", gain: -skill.cost,
    label: `스킬: ${skill.name}`, icon: skill.icon,
    total: ha.points, at: new Date().toISOString().slice(0, 16)
  });
  
  saveHumanAwakening(ha);
  applyHumanAwakeningStats();

  const targetTxt = targetNpcName ? ` 대상: ${targetNpcName}` : "";
  if (S._nextInjectedContext !== undefined) {
    S._nextInjectedContext = (S._nextInjectedContext || '') +
      ` [각성력 스킬 발동: ${skill.icon} ${skill.name}${targetTxt}] ${skill.aiHint}`;
  }
  toast(`${skill.name} 발동! (각성도 -${skill.cost} → 잔여: ${ha.points})`, 3000, skill);
  window.renderHumanAwakeningPanel();
}
window.useApsSkill = useApsSkill;

export function openApsSkillModal(skillId) {
  const skill = AWAKENING_POWER_SKILLS.find(s => s.id === skillId);
  if (!skill) return;
  if (skill.targetable) {
    const npcs = loadNPCs();
    const existingModal = document.getElementById('aps-target-modal');
    if (existingModal) existingModal.remove();
    const modal = document.createElement('div');
    modal.id = 'aps-target-modal';
    modal.style.cssText = `position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;`;
    const stageColor = HUMAN_AWAKENING_STAGES[loadHumanAwakening().stage || 0]?.color || '#f0c040';
    let npcButtons = npcs.length
      ? npcs.map(n => `<button onclick="useApsSkill('${skillId}','${esc(n.name)}');document.getElementById('aps-target-modal').remove();renderHumanAwakeningPanel()"
          style="display:block;width:100%;padding:8px 12px;margin-bottom:5px;background:#1a1200;border:1px solid ${stageColor}55;color:${stageColor};font-size:11px;cursor:pointer;text-align:left;border-radius:2px">
          ${typeof getEntityIconHTML==='function'?getEntityIconHTML(n,{size:9}):(n.icon||"👤")} ${esc(n.name)} <span style="color:#6a5030;font-size:9px">${esc(n.role||'')}</span>
        </button>`).join('')
      : '<div style="color:#6a5030;font-size:10px;text-align:center;padding:10px">등록된 NPC가 없습니다</div>';
    modal.innerHTML = `<div style="background:#100800;border:2px solid ${stageColor};padding:18px;max-width:300px;width:90%;max-height:80vh;overflow-y:auto;border-radius:3px">
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${stageColor};margin-bottom:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(skill,{size:12}):(skill.icon)} ${skill.name} — 대상 선택</div>
      <div style="font-size:10px;color:#8a7040;margin-bottom:10px">${esc(skill.desc)}</div>
      ${npcButtons}
      <button onclick="useApsSkill('${skillId}',null);document.getElementById('aps-target-modal').remove();renderHumanAwakeningPanel()"
        style="display:block;width:100%;padding:7px;margin-top:8px;background:#0a0800;border:1px solid #3a2a0a;color:#6a5a30;font-size:10px;cursor:pointer;border-radius:2px">
        🌍 대상 없이 발동 (서사 내 지정)
      </button>
      <button onclick="document.getElementById('aps-target-modal').remove()"
        style="display:block;width:100%;padding:6px;margin-top:5px;background:transparent;border:1px solid #2a1a00;color:#4a3a10;font-size:10px;cursor:pointer;border-radius:2px">
        ✕ 취소
      </button>
    </div>`;
    document.body.appendChild(modal);
  } else {
    useApsSkill(skillId, null);
  }
}
window.openApsSkillModal = openApsSkillModal;

export function openNpcInspireModal() {
  const npcs = loadNPCs();
  const nid = loadNpcInspire();
  const ha = loadHumanAwakening();
  const myStage = ha.stage || 0;
  const stageColor = HUMAN_AWAKENING_STAGES[myStage]?.color || '#f0c040';

  const existingModal = document.getElementById('npc-inspire-modal');
  if (existingModal) existingModal.remove();
  const modal = document.createElement('div');
  modal.id = 'npc-inspire-modal';
  modal.style.cssText = `position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.92);display:flex;align-items:flex-end;justify-content:center;`;

  const npcList = npcs.length
    ? npcs.map(n => {
        const nd = nid[n.name] || { points: 0, stage: 0 };
        const nstg = NPC_INSPIRE_STAGES[nd.stage] || NPC_INSPIRE_STAGES[0];
        const pct = Math.min(100, nd.points);
        return `<div style="padding:8px 10px;background:#0d0a00;border:1px solid ${nd.stage > 0 ? nstg.color + '55' : '#2a1800'};margin-bottom:6px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(n,{size:18}):(n.icon||"👤")}</span>
            <div style="flex:1">
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${nstg.color}">${esc(n.name)}</div>
              <div style="font-size:8px;color:#6a5a30">${esc(n.role||'')} · ${typeof getEntityIconHTML==='function'?getEntityIconHTML(nstg,{size:8}):(nstg.icon)} ${nstg.name}</div>
            </div>
            <div style="font-family:'Cinzel',serif;font-size:12px;color:${nstg.color}">${nd.points}<span style="font-size:8px;color:#4a3a20">/100</span></div>
          </div>
          <div style="height:4px;background:#1a1000;border-radius:2px;overflow:hidden;margin-bottom:6px">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#806010,${nstg.color});border-radius:2px"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
            ${NPC_INSPIRE_METHODS.filter(m => myStage >= m.reqStage).map(m => {
              const canAfford = ha.points >= m.cost;
              return `<button onclick="inspireNpc('${esc(n.name)}','${m.id}');document.getElementById('npc-inspire-modal').remove();renderHumanAwakeningPanel()"
                style="padding:5px 4px;background:${canAfford ? '#1a1200' : '#0a0900'};border:1px solid ${canAfford ? stageColor+'44' : '#1a1500'};color:${canAfford ? stageColor : '#4a3a20'};font-size:8px;cursor:${canAfford ? 'pointer' : 'not-allowed'};border-radius:2px;text-align:left"
                ${canAfford ? '' : 'disabled'}>
                ${typeof getEntityIconHTML==='function'?getEntityIconHTML(m,{size:16}):(m.icon)} ${m.name}<span style="color:#4a3a20;float:right">-${m.cost}</span>
              </button>`;
            }).join('')}
          </div>
          ${nd.history && nd.history.length ? `<div style="margin-top:5px;font-size:8px;color:#4a3a20">최근: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(nd.history[nd.history.length-1],{size:14}):(nd.history[nd.history.length-1]?.icon)} ${esc(nd.history[nd.history.length-1].method)}</div>` : ''}
        </div>`;
      }).join('')
    : '<div style="text-align:center;padding:20px;color:#4a3a20;font-size:10px">등록된 NPC가 없습니다.<br>NPC와 대화를 나누면 자동 등록됩니다.</div>';

  modal.innerHTML = `<div style="background:linear-gradient(180deg,#1a1000,#0a0900);border-top:2px solid ${stageColor};padding:14px;width:100%;max-width:500px;max-height:85vh;overflow-y:auto;border-radius:3px 3px 0 0">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${stageColor}">💗 NPC 감화 시스템</div>
      <div style="font-size:9px;color:#6a5a30">보유 각성도: <span style="color:${stageColor};font-family:'Cinzel',serif">${ha.points}</span></div>
      <button onclick="document.getElementById('npc-inspire-modal').remove()" style="background:none;border:none;color:#6a5a30;font-size:14px;cursor:pointer">✕</button>
    </div>
    <div style="font-size:9px;color:#6a5a30;margin-bottom:10px;font-style:italic">각성도를 소모해 NPC를 단계적으로 감화시킵니다. 완전 감화한 NPC는 영원한 동료가 됩니다.</div>
    ${npcList}
  </div>`;
  document.body.appendChild(modal);
}
window.openNpcInspireModal = openNpcInspireModal;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_22(){
window.renderDarklingVoidPanel = function() {
  renderDarklingVoidExtPanel();
};

window.gainDeathEcho            = gainDeathEcho;

window.getDeathEchoStatus       = getDeathEchoStatus;

window.detectDeathEchoFromText  = detectDeathEchoFromText;

window.getVoidSenseBonus        = getVoidSenseBonus;

window.getVoidSenseAIHint       = getVoidSenseAIHint;

window.activateVoidSummon       = activateVoidSummon;

window.dismissVoidSummon        = dismissVoidSummon;

window.initShadowPact           = initShadowPact;

window.enforceOrCursePact       = enforceOrCursePact;

window.releasePact              = releasePact;

window.clearDeathEcho           = clearDeathEcho;

window.clearVoidSummon          = clearVoidSummon;

window.clearShadowPact          = clearShadowPact;

function detectElfMemoryFromText(text) {
  if (!text) return;
  const race = S.character?.race || "";
  const isElf = race.includes("엘프") || race.includes("elf");
  if (!isElf) return;
  if (/인사|대화|교류|친해|만남|감동|감정|우정|사랑|포옹/.test(text) && Math.random() < 0.5) gainElfMemory('bond', 5);
  if (/탐험|발견|처음|도착|장소|지역|왔다|숲|자연|산|바다/.test(text) && Math.random() < 0.4) gainElfMemory('place', 4);
  if (/배웠|깨달|지식|기록|역사|마법|습득|연구|고서|문헌/.test(text) && Math.random() < 0.5) gainElfMemory('knowledge', 6);
  if (/죽었|사망|이별|잃었|배신|슬픔|상실|그리움|떠났|쓰러/.test(text) && Math.random() < 0.4) gainElfMemory('loss', 8);
  if (/맹세|약속|계약|서약|이행|지켰|선언|맹서|결의/.test(text) && Math.random() < 0.5) gainElfMemory('oath', 6);
}
window.detectElfMemoryFromText = detectElfMemoryFromText;

window.detectElfMemoryFromText = window.detectElfMemoryFromText;

const _origDetectElfMemory = window.detectElfMemoryFromText;

window.detectElfMemoryFromText = function(text) {
  if (_origDetectElfMemory) _origDetectElfMemory(text);
  detectElfForgettingFromText(text);
  detectElfEmotionFromText(text);
};

function detectHumanDeedFromText(text) {
  if (!text) return;
  const race = S.character?.race || "";
  const isHuman = race.includes("인간") || race.toLowerCase().includes("human") || race === "" || !race;
  if (!isHuman) return;
  if (/극복|배웠|성장|한계|새로운 능력|깨달/.test(text) && Math.random() < 0.45) gainHumanAwakening('growth', 5);
  if (/용기|두려움에도|맞섰|뛰어들|물러서지/.test(text) && Math.random() < 0.4) gainHumanAwakening('courage', 6);
  if (/동료|친구|인연|신뢰|함께|지켰/.test(text) && Math.random() < 0.35) gainHumanAwakening('bond', 4);
  if (/해냈|승리|위업|불가능|역전|성공/.test(text) && Math.random() < 0.4) gainHumanAwakening('triumph', 7);
  if (/희생|대신|헌신|구해|다쳤지만/.test(text) && Math.random() < 0.4) gainHumanAwakening('sacrifice', 6);
}
window.detectHumanDeedFromText = detectHumanDeedFromText;

window.detectHumanDeedFromText   = window.detectHumanDeedFromText;
}

