// 3. 크래프팅 빠른 접근 UI
// Auto-extracted from taleforge.html (original section banner preserved above).
import { BLUEPRINT_SHOP } from '../data/075-파트2-C-크래프팅-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadBlueprints } from '../misc/075-파트2-C-크래프팅-시스템.js';
import { sendMsg } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { toast } from '../utils.js';

export function showCraftingQuickMenu(){
  const inv = S.inventory||[];
  const bps = typeof loadBlueprints==='function' ? loadBlueprints() : [];
  const isLm = document.body.classList.contains('light-mode');
  const bg = isLm ? '#fdf5e8' : '#050200';
  const border = isLm ? '#c8a860' : 'var(--gold)';
  const textCol = isLm ? '#4a3020' : 'var(--text)';
  const dimCol  = isLm ? '#7a5a30' : 'var(--dim)';

  // 제작 가능한 레시피 찾기
  const craftable = bps.slice(0,6).map(bpId=>{
    const def = typeof BLUEPRINT_SHOP!=='undefined' ? BLUEPRINT_SHOP[bpId] : null;
    return def ? { id:bpId, ...def } : null;
  }).filter(Boolean);

  const overlay = document.createElement('div');
  overlay.id = 'craft-quick-menu';
  overlay.style.cssText = `position:fixed;inset:0;z-index:250;background:rgba(0,0,0,.85);display:flex;align-items:flex-end`;
  overlay.innerHTML = `
  <div style="width:100%;max-height:70vh;background:${bg};border-top:2px solid ${border};overflow-y:auto;animation:slideUp .2s ease">
    <div style="padding:12px 16px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center">
      <div style="font-family:Cinzel,serif;font-size:13px;color:${border}">⚒️ 빠른 제작</div>
      <button onclick="document.getElementById('craft-quick-menu').remove()" style="background:none;border:none;color:${dimCol};font-size:18px;cursor:pointer">✕</button>
    </div>
    <div style="padding:12px 16px">
      ${craftable.length === 0
        ? `<div style="color:${dimCol};font-size:12px;padding:8px 0">보유한 설계도가 없습니다.<br>상점에서 설계도를 구매하거나 몬스터 드롭으로 획득하세요.</div>`
        : craftable.map(bp=>`
          <div style="padding:10px;background:${isLm?'#f5e8d0':'#0d0800'};border:1px solid ${isLm?'#c8a860':'var(--border)'};margin-bottom:6px;border-radius:2px;display:flex;align-items:center;gap:10px">
            <span style="font-size:24px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(bp,{size:24}):(bp.icon||"📜")}</span>
            <div style="flex:1">
              <div style="font-family:Cinzel,serif;font-size:11px;color:${border}">${bp.name||bp.id}</div>
              <div style="font-size:10px;color:${dimCol};margin-top:2px">희귀도: ${bp.rarity||'common'}</div>
            </div>
            <button onclick="craftItemFromBp('${bp.id}')" style="padding:6px 12px;background:${border};border:none;color:${isLm?'#fff':'#000'};font-family:Cinzel,serif;font-size:10px;cursor:pointer;border-radius:2px">제작</button>
          </div>`).join('')
      }
      <button onclick="openP('craft');document.getElementById('craft-quick-menu').remove()" style="width:100%;padding:10px;margin-top:4px;background:${isLm?'#e8d8b8':'#0d0800'};border:1px solid ${isLm?'#c8a860':'var(--border)'};color:${dimCol};font-family:Cinzel,serif;font-size:11px;cursor:pointer">
        전체 제작 패널 열기 →
      </button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
}
window.showCraftingQuickMenu = showCraftingQuickMenu;

window.showCraftingQuickMenu = showCraftingQuickMenu;

export function craftItemFromBp(bpId){
  document.getElementById('craft-quick-menu')?.remove();
  const bp = typeof BLUEPRINT_SHOP!=='undefined' ? BLUEPRINT_SHOP[bpId] : null;
  if(!bp){ toast('설계도를 찾을 수 없습니다', 2000); return; }
  // AI 서사에 제작 액션 주입
  S._nextInjectedContext = (S._nextInjectedContext||'') +
    ` [⚒️ 제작 시도: ${bp.icon||''}${bp.name||bpId}] 캐릭터가 ${bp.name||bpId} 제작을 시도한다. 성공 여부를 주사위와 INT/craft 스탯으로 판정하고, 성공 시 아이템을 만들어 GS items 배열에 포함시켜라.`;
  if(typeof sendMsg==='function') sendMsg(`${bp.name||bpId}을 제작하려 한다.`, false);
}
window.craftItemFromBp = craftItemFromBp;

window.craftItemFromBp = craftItemFromBp;
