// ★ 패널 HTML 추가 (명예의 전당, Carry-over, 속성매트릭스)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { renderSkillTreePanel } from '../job/195-NEW-2-스킬트리-시각화-UI-직업-계보-기반.js';
import { renderAffinityMatrixPanel } from '../ui/196-NEW-3-속성-상성-심화-매트릭스-UI.js';
import { renderCarryOverPanel } from '../ui/201-NEW-8-Carry-over-UI-패널.js';
import { renderHallOfFamePanel } from './194-NEW-1-명예의-전당-Hall-of-Fame.js';

document.addEventListener('DOMContentLoaded', function(){
  // 명예의 전당 패널
  if(!document.getElementById('p-halloffame')){
    const hof = document.createElement('div');
    hof.className = 'panel-ov'; hof.id = 'p-halloffame';
    hof.innerHTML = `<div class="panel"><div class="p-head"><span class="p-title">🏆 명예의 전당</span><button class="p-close" onclick="closeP('halloffame')">✕</button></div><div class="p-body scrollable" id="pb-halloffame"></div></div>`;
    document.body.appendChild(hof);
  }
  // Carry-over 패널
  if(!document.getElementById('p-carryover')){
    const co = document.createElement('div');
    co.className = 'panel-ov'; co.id = 'p-carryover';
    co.innerHTML = `<div class="panel"><div class="p-head"><span class="p-title">🔁 회차 계승</span><button class="p-close" onclick="closeP('carryover')">✕</button></div><div class="p-body scrollable" id="pb-carryover"></div></div>`;
    document.body.appendChild(co);
  }
  // 전생의 유산 도감 패널
  if(!document.getElementById('p-legacy-archive')){
    const la = document.createElement('div');
    la.className = 'panel-ov'; la.id = 'p-legacy-archive';
    la.innerHTML = `<div class="panel"><div class="p-head"><span class="p-title">📚 전생의 유산</span><button class="p-close" onclick="closeP('legacy-archive')">✕</button></div><div class="p-body scrollable" id="pb-legacy-archive"></div></div>`;
    document.body.appendChild(la);
  }
  // 속성 매트릭스 패널
  if(!document.getElementById('p-affinity-matrix')){
    const am = document.createElement('div');
    am.className = 'panel-ov'; am.id = 'p-affinity-matrix';
    am.innerHTML = `<div class="panel"><div class="p-head"><span class="p-title">🔮 속성 매트릭스</span><button class="p-close" onclick="closeP('affinity-matrix')">✕</button></div><div class="p-body scrollable" id="pb-affinity-matrix"></div></div>`;
    document.body.appendChild(am);
  }
});

(function hookOpenP(){
  // openP 훅 — 모든 다른 훅 이후(3초)에 실행해서 체인 맨 끝에 붙음
  function _patchNewPanelOpenP(){
    const orig = window.openP;
    if(typeof orig==='function'){
      window.openP = function(id){
        const r = orig.apply(this, arguments);
        if(id==='halloffame')      { setTimeout(renderHallOfFamePanel, 50); }
        if(id==='carryover')       { setTimeout(renderCarryOverPanel, 50); }
        if(id==='affinity-matrix') { setTimeout(renderAffinityMatrixPanel, 50); }
        if(id==='skilltree')       { setTimeout(renderSkillTreePanel, 50); }
        return r;
      };
      window.openP._newPanelHooked = true;
    }
  }
  setTimeout(_patchNewPanelOpenP, 3000);
})();
