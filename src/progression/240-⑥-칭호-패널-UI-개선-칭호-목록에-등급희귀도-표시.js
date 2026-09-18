// ⑥ 칭호 패널 UI 개선 — 칭호 목록에 등급/희귀도 표시
// Auto-extracted from taleforge.html (original section banner preserved above).
import { renderTitles } from './089-칭호-시스템-완전판-1개-활성화-스탯-효과-적용.js';

setTimeout(function(){
  if(typeof renderTitles !== 'function') return;
  const _origRenderTitles = renderTitles;
  window.renderTitles = function(){
    _origRenderTitles.call(this);
    // 칭호 아이템에 희귀도 색상 적용
    try{
      document.querySelectorAll('.title-item, [data-title]').forEach(el=>{
        if(el._titleStyled) return;
        el._titleStyled = true;
        const rarity = el.dataset.rarity || 'common';
        const colors = { legendary:'#c040c0', rare:'#4a80d0', uncommon:'#40a060', common:'var(--dim)' };
        el.style.borderLeft = `2px solid ${colors[rarity]||colors.common}`;
      });
    }catch(e){}
  };
}, 3000);
