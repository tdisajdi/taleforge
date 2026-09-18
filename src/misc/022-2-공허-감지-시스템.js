// 👁️ 2. 공허 감지 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { DARKLING_VOID_STAGES, loadDarklingVoid } from '../progression/020-101130번-환생-누적-시스템.js';

export function getVoidSenseBonus() {
  const dv = loadDarklingVoid();
  const stage = dv.stage || 0;
  // 단계 0~7 → 감지 등급
  const grades = [
    { grade: 0, label: '감지 없음',       desc: '숨겨진 의도를 읽지 못한다.',                               perBonus: 0,  perBonus2: 0, negBonus: 0 },
    { grade: 1, label: '희미한 감지',      desc: '거짓말 여부 정도는 느낄 수 있다.',                          perBonus: 8,  perBonus2: 5, negBonus: 3 },
    { grade: 2, label: '감정 읽기',        desc: '상대의 공포·욕망을 어렴풋이 감지한다.',                      perBonus: 15, perBonus2: 10, negBonus: 8 },
    { grade: 3, label: '의도 파악',        desc: '대화 상대가 숨기는 것이 무엇인지 대략 알 수 있다.',           perBonus: 25, perBonus2: 18, negBonus: 15 },
    { grade: 4, label: '비밀 감지',        desc: '상대의 핵심 비밀이 윤곽으로 보인다. 협상에서 완전 우위.',    perBonus: 38, perBonus2: 28, negBonus: 25 },
    { grade: 5, label: '심층 독심',        desc: '말하지 않은 진실을 거의 완벽하게 읽는다.',                   perBonus: 55, perBonus2: 40, negBonus: 38 },
    { grade: 6, label: '영혼 직독',        desc: '상대의 모든 두려움과 욕망이 투명하게 보인다.',               perBonus: 75, perBonus2: 55, negBonus: 55 },
    { grade: 7, label: '공허의 전지',      desc: '존재 자체가 거짓 없는 공허다. 모든 숨김이 의미를 잃는다.',   perBonus: 100, perBonus2: 75, negBonus: 75 },
  ];
  return grades[stage] || grades[0];
}
window.getVoidSenseBonus = getVoidSenseBonus;

export function getVoidSenseAIHint() {
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) return '';
  const sense = getVoidSenseBonus();
  if (sense.grade === 0) return '';
  const dv = loadDarklingVoid();
  const stg = DARKLING_VOID_STAGES[dv.stage || 0];
  return `[다크링 공허 감지 ${stg.icon} ${sense.label} (${dv.stage}단계)] 이 다크링은 현재 대화 상대의 숨겨진 의도와 공포를 ${sense.desc} AI는 NPC 반응 묘사 시 다크링이 이 사실을 이미 알고 있다는 뉘앙스를 자연스럽게 포함하라. 협상·설득 판정 시 PER +${sense.perBonus}, NEG +${sense.negBonus} 보너스가 적용된다.`;
}
window.getVoidSenseAIHint = getVoidSenseAIHint;

export function renderVoidSensePanel(containerId) {
  const body = document.getElementById(containerId);
  if (!body) return;
  const race = S.character?.race || '';
  if (!race.includes('다크링') && !race.includes('darkling')) {
    body.innerHTML = '<div style="text-align:center;padding:20px;color:#304060;font-size:10px">다크링 전용 시스템</div>';
    return;
  }
  const sense = getVoidSenseBonus();
  const dv = loadDarklingVoid();
  const color = '#5090d0';
  const stageColors = ['#4060c0','#5070d0','#4080e0','#3090f0','#20a0ff','#10b0ff','#00c0ff','#00d8ff'];
  const c = stageColors[dv.stage || 0];
  body.innerHTML = `
    <div style="padding:12px;background:linear-gradient(135deg,#000510,#000820);border-bottom:2px solid ${c}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span style="font-size:26px">👁️</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:${c}">공허 감지</div>
          <div style="font-size:9px;color:#304060">Void Sense · ${dv.stage}단계</div>
        </div>
        <div style="padding:4px 10px;background:${c}22;border:1px solid ${c}55;border-radius:12px;font-family:'Cinzel',serif;font-size:10px;color:${c}">${sense.label}</div>
      </div>
      <div style="font-size:10px;color:#4060a0;line-height:1.6;font-style:italic;margin-top:4px">"${sense.desc}"</div>
    </div>
    <!-- 판정 보너스 -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${c};letter-spacing:1px;margin-bottom:6px">── 감지 판정 보너스 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px">
        <div style="padding:7px;background:#000810;border:1px solid #0a1830;border-radius:2px;text-align:center">
          <div style="font-size:8px;color:#304060;margin-bottom:2px">PER 판정</div>
          <div style="font-family:'Cinzel',serif;font-size:16px;color:${c}">+${sense.perBonus}</div>
        </div>
        <div style="padding:7px;background:#000810;border:1px solid #0a1830;border-radius:2px;text-align:center">
          <div style="font-size:8px;color:#304060;margin-bottom:2px">협상(NEG)</div>
          <div style="font-family:'Cinzel',serif;font-size:16px;color:${c}">+${sense.negBonus}</div>
        </div>
        <div style="padding:7px;background:#000810;border:1px solid #0a1830;border-radius:2px;text-align:center">
          <div style="font-size:8px;color:#304060;margin-bottom:2px">거짓 탐지</div>
          <div style="font-family:'Cinzel',serif;font-size:16px;color:${c}">+${sense.perBonus2}</div>
        </div>
      </div>
    </div>
    <!-- 단계별 감지 능력 -->
    <div style="padding:10px 12px;border-bottom:1px solid #0a1030">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${c};letter-spacing:1px;margin-bottom:6px">── 공허도 단계 × 감지 능력 ──</div>
      ${['감지 없음','희미한 감지','감정 읽기','의도 파악','비밀 감지','심층 독심','영혼 직독','공허의 전지'].map((lbl, i) => {
        const active = i === (dv.stage||0);
        const passed = i < (dv.stage||0);
        const sc = stageColors[i];
        return `<div style="display:flex;align-items:center;gap:6px;padding:4px 7px;background:${active?'#000818':passed?'#00050f':'#00020a'};border:1px solid ${active?sc:passed?sc+'44':'#0a1030'};border-radius:2px;margin-bottom:3px;opacity:${active?1:passed?0.75:0.3}">
          <span style="font-size:9px;color:#203050">${i}단계</span>
          <span style="font-family:'Cinzel',serif;font-size:9px;color:${active?sc:passed?sc:'#203060'};flex:1">${lbl}</span>
          ${active ? `<span style="font-size:8px;color:${sc}">◀ 현재</span>` : passed ? `<span style="font-size:9px;color:${sc}">✓</span>` : ''}
        </div>`;
      }).join('')}
    </div>
    <!-- AI 힌트 미리보기 -->
    <div style="padding:10px 12px">
      <div style="font-family:'Cinzel',serif;font-size:9px;color:${c};letter-spacing:1px;margin-bottom:6px">── AI 자동 주입 힌트 ──</div>
      <div style="padding:8px;background:#00020a;border:1px solid #0a1030;border-radius:2px;font-size:9px;color:#304060;line-height:1.6">
        ${sense.grade > 0 ? getVoidSenseAIHint() || '(대화 중 자동 활성화)' : '⚠️ 공허도 1단계 이상에서 활성화됩니다.'}
      </div>
    </div>
  `;
}
window.renderVoidSensePanel = renderVoidSensePanel;
