// ⑥ ⏳ 세계 시간 달력 시스템 (확장)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { esc } from '../utils.js';

export function getCalendarEffect(){
  try{
    const gt = (typeof loadGameTime==='function') ? loadGameTime() : null;
    if(!gt) return '';
    const { day, season, year } = gt;
    const effects = [];
    // 달 위상 (day 기준 0~29 사이클)
    const moonPhase = day % 30;
    if(moonPhase >= 13 && moonPhase <= 16){
      effects.push('🌕 보름달 — 수인족 야수 각성 위험 증가, 언데드 활성화');
    } else if(moonPhase === 0 || moonPhase === 29){
      effects.push('🌑 그믐달 — 어둠의 마법 강화, 은신 판정 보너스');
    } else if(moonPhase <= 5){
      effects.push('🌒 초승달 — 새로운 시작에 축복, 탐험 판정 소폭 상승');
    }
    // 특별 날짜
    if(day === 1 && season === '봄') effects.push('🌸 봄의 축제 — NPC들이 축제 분위기, 상점 20% 할인');
    if(day === 1 && season === '겨울') effects.push('❄️ 동짓날 — 언데드 전력 강화, 신관들이 정화 의식 거행');
    if(day === 15 && season === '여름') effects.push('☀️ 하지 대제 — 화염 마법 강화, 왕국 곳곳 경비 증원');
    if(day === 15 && season === '가을') effects.push('🍂 추수제 — 영지 수입 증가, NPC들이 관대해짐');
    // 계절 효과
    const seasonBaseEff = {봄:'초목이 자라고 탐험하기 좋은 날씨', 여름:'뜨거운 열기로 피로도 증가, 수분 섭취 필요', 가을:'시야가 맑아 탐색 유리, 적들이 예민해짐', 겨울:'이동 속도 감소, 생존 소모품 중요성 증가'}[season]||'';
    if(seasonBaseEff && !effects.length) effects.push(seasonBaseEff);
    return effects.join(' | ');
  }catch(e){ return ''; }
}
window.getCalendarEffect = getCalendarEffect;

window.getCalendarEffect = getCalendarEffect;

export function getMoonPhaseIcon(){
  try{
    const gt = (typeof loadGameTime==='function') ? loadGameTime() : null;
    if(!gt) return '🌙';
    const p = (gt.day||1) % 30;
    if(p<=2||p>=28) return '🌑';
    if(p<=7) return '🌒';
    if(p<=12) return '🌓';
    if(p<=17) return '🌕';
    if(p<=22) return '🌖';
    if(p<=26) return '🌗';
    return '🌘';
  }catch(e){ return '🌙'; }
}
window.getMoonPhaseIcon = getMoonPhaseIcon;

export function renderWorldCalendarPanel(){
  const body = document.getElementById('pb-world-calendar');
  if(!body) return;
  const gt = (typeof loadGameTime==='function') ? loadGameTime() : {day:1,season:'봄',year:1,timePhase:0};
  const moonPhase = (gt.day||1) % 30;
  const moonPct = Math.round(moonPhase / 29 * 100);
  const effect = getCalendarEffect();
  const moonIcon = getMoonPhaseIcon();
  const moonName = moonPhase<=2||moonPhase>=28?'그믐달':moonPhase<=7?'초승달':moonPhase<=12?'상현달':moonPhase<=17?'보름달':moonPhase<=22?'기우는달':moonPhase<=26?'하현달':'그믐 무렵';
  
  const seasonEvents = {
    봄: [{day:1,name:'봄의 축제',desc:'만물이 깨어나는 날. 상점 할인, NPC 우호'},{day:15,name:'씨앗 심는 날',desc:'농민들이 영지에서 바쁘게 움직임'}],
    여름: [{day:1,name:'여름 개전',desc:'군대 훈련 시즌 시작. 용병 고용 수요 증가'},{day:15,name:'하지 대제',desc:'화염 마법 강화. 왕국 경비 증원'}],
    가을: [{day:1,name:'사냥 해금',desc:'왕실 사냥 시즌 시작. 숲에서 귀족들 목격 가능'},{day:15,name:'추수제',desc:'영지 수입 증가. NPC 관대함 증가'}],
    겨울: [{day:1,name:'동짓날',desc:'언데드 강화. 신관들 정화 의식 시작'},{day:15,name:'얼음 축제',desc:'강이 얼어붙음. 빙상 이동 가능, 선박 이동 불가'}],
  }[gt.season||'봄']||[];

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:#80b0e0;letter-spacing:1px;margin-bottom:12px">⏳ 세계 달력</div>
      
      <!-- 현재 날짜 -->
      <div style="padding:12px 14px;background:#000a18;border:1px solid #204060;margin-bottom:10px;text-align:center">
        <div style="font-size:28px;margin-bottom:4px">${moonIcon}</div>
        <div style="font-family:Cinzel,serif;font-size:13px;color:#80b0e0">${gt.season||'봄'} ${gt.year||1}년 ${gt.day||1}일</div>
        <div style="font-size:10px;color:#5080a0;margin-top:3px">${moonName} (${moonPct}%)</div>
      </div>
      
      <!-- 달 위상 바 -->
      <div style="margin-bottom:12px">
        <div style="font-size:9px;color:var(--dim);margin-bottom:4px">달의 위상</div>
        <div style="height:6px;background:#0a1520;border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${moonPct}%;background:linear-gradient(90deg,#1a3060,#80b0e0);border-radius:3px;transition:width .3s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:2px;font-size:8px;color:var(--dim)"><span>🌑 그믐</span><span>🌓 상현</span><span>🌕 보름</span><span>🌗 하현</span></div>
      </div>
      
      <!-- 현재 효과 -->
      ${effect?`<div style="padding:10px 12px;background:#040e1e;border:1px solid #1a4060;margin-bottom:10px;border-left:3px solid #4080c0">
        <div style="font-size:9px;color:#4080c0;font-family:Cinzel,serif;margin-bottom:4px">⚡ 현재 효과</div>
        <div style="font-size:10px;color:#80a8c8;line-height:1.5">${esc(effect)}</div>
      </div>`:''}
      
      <!-- 이번 계절 이벤트 -->
      <div style="font-family:Cinzel,serif;font-size:9px;color:#6090b0;letter-spacing:1px;margin-bottom:6px">이번 계절 특별일</div>
      ${seasonEvents.map(e=>{
        const passed = (gt.day||1) > e.day;
        const today = (gt.day||1) === e.day;
        return `<div style="padding:7px 10px;background:${today?'#0a1e30':'#050d18'};border:1px solid ${today?'#4080c0':'#0a2040'};margin-bottom:4px;display:flex;gap:8px;align-items:flex-start">
          <div style="font-size:9px;color:${today?'#e0c040':passed?'var(--dim)':'#4080c0'};font-family:Cinzel,serif;min-width:28px">${e.day}일</div>
          <div>
            <div style="font-size:10px;color:${today?'#e8d070':passed?'var(--dim)':'#80b0e0'}">${today?'★ ':passed?'✓ ':''} ${esc(e.name)}</div>
            <div style="font-size:9px;color:var(--dim);line-height:1.4">${esc(e.desc)}</div>
          </div>
        </div>`;
      }).join('')}
      
      <!-- 세계 달력 영향 -->
      <div style="margin-top:10px;padding:8px 10px;background:#040810;border:1px dashed #1a3050;font-size:9px;color:var(--dim);line-height:1.6">
        💡 달력 효과는 AI 서사와 판정에 자동으로 반영됩니다.<br>보름달 — 수인족 야수화 위험, 동짓날 — 언데드 강화, 축제일 — NPC 배치/반응 변화
      </div>
    </div>`;
}
window.renderWorldCalendarPanel = renderWorldCalendarPanel;

window.renderWorldCalendarPanel = renderWorldCalendarPanel;
