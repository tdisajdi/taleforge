// ★ UI-4: 경제 현황 패널
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { getDynamicPrice, loadEconomy } from './069-④-경제-시스템.js';
import { getEcoStatusLabel } from './200-NEW-7-경제-자동-변동-시스템.js';

export function renderEconomyPanel(){
  const body = document.getElementById('pb-economy');
  if(!body){ 
    // 패널 없으면 생성
    if(!document.getElementById('p-economy')){
      const el = document.createElement('div');
      el.className='panel-ov'; el.id='p-economy';
      el.innerHTML=`<div class="panel"><div class="p-head"><span class="p-title">💰 경제 현황</span><button class="p-close" onclick="closeP('economy')">✕</button></div><div class="p-body scrollable" id="pb-economy"></div></div>`;
      document.body.appendChild(el);
    }
    return renderEconomyPanel();
  }

  const eco   = typeof loadEconomy==='function' ? loadEconomy() : {inflation:1.0,marketTrend:'stable',taxRate:0.1};
  const gold  = S.gold||0;
  const inv   = S.inventory||[];
  const status = typeof getEcoStatusLabel==='function' ? getEcoStatusLabel() : '';

  const trendIcon  = {boom:'📈',stable:'⚖️',crisis:'📉'}[eco.marketTrend]||'⚖️';
  const trendColor = {boom:'#60c060',stable:'#c8a96e',crisis:'#e05050'}[eco.marketTrend]||'#c8a96e';
  const infPct     = Math.min(200, Math.round(eco.inflation*100));
  const infColor   = eco.inflation>=1.5?'#e05050':eco.inflation>=1.2?'#e08050':eco.inflation<=0.9?'#60c0c0':'#60c060';

  // 인벤토리 자산 가치 계산
  const RARITY_PRICE = {common:25,uncommon:55,rare:120,legendary:280};
  const invValue = inv.reduce((s,item)=>s+(RARITY_PRICE[item.rarity]||25),0);

  // 예상 물가 등급
  const priceGrades = [
    {name:'일반 아이템',  base:25,  rarity:'common'},
    {name:'고급 아이템',  base:55,  rarity:'uncommon'},
    {name:'희귀 아이템',  base:120, rarity:'rare'},
    {name:'전설 아이템',  base:280, rarity:'legendary'},
  ];

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:12px">💰 경제 현황</div>

      <!-- 현재 상태 -->
      <div style="padding:12px;background:#0a0800;border:1px solid #2a2000;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:20px">${trendIcon}</span>
          <div>
            <div style="font-size:11px;color:${trendColor}">${{boom:'호황',stable:'안정',crisis:'불황'}[eco.marketTrend]||'안정'}</div>
            <div style="font-size:8px;color:var(--dim)">${status}</div>
          </div>
        </div>
        <!-- 인플레이션 게이지 -->
        <div style="margin-bottom:6px">
          <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--dim);margin-bottom:2px">
            <span>물가 지수</span><span style="color:${infColor}">${infPct}%</span>
          </div>
          <div style="height:6px;background:#1a1200;border-radius:3px;overflow:hidden;position:relative">
            <div style="position:absolute;left:50%;width:1px;height:100%;background:#3a2a00"></div>
            <div style="width:${Math.min(100,infPct/2)}%;height:100%;background:linear-gradient(90deg,#4a8020,${infColor});border-radius:3px;transition:width .5s"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:7px;color:#3a3020;margin-top:1px">
            <span>디플레 50%</span><span>기준 100%</span><span>고인플레 200%</span>
          </div>
        </div>
        <div style="font-size:9px;color:var(--dim)">세금: ${Math.round((eco.taxRate||0.1)*100)}%</div>
      </div>

      <!-- 내 재산 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
        <div style="padding:10px;background:#08070a;border:1px solid #1a1400;text-align:center">
          <div style="font-size:18px">💰</div>
          <div style="font-family:Cinzel,serif;font-size:12px;color:#c8a96e">${gold.toLocaleString()}</div>
          <div style="font-size:8px;color:var(--dim)">보유 골드</div>
        </div>
        <div style="padding:10px;background:#08070a;border:1px solid #1a1400;text-align:center">
          <div style="font-size:18px">📦</div>
          <div style="font-family:Cinzel,serif;font-size:12px;color:#c8a96e">${invValue.toLocaleString()}</div>
          <div style="font-size:8px;color:var(--dim)">아이템 자산가치</div>
        </div>
      </div>

      <!-- 현재 물가 -->
      <div style="font-family:Cinzel,serif;font-size:9px;color:#a08040;margin-bottom:6px">📊 현재 시장 물가</div>
      ${priceGrades.map(pg=>{
        const price = typeof getDynamicPrice==='function' ? getDynamicPrice(pg.base, pg.rarity) : pg.base;
        const change = price - pg.base;
        const changeStr = change>0?`<span style="color:#e05050">+${change}</span>`:change<0?`<span style="color:#60c060">${change}</span>`:'';
        return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #0f0c00;font-size:9px">
          <span style="color:var(--dim);flex:1">${pg.name}</span>
          <span style="color:#c8a96e">${pg.base}G</span>
          <span style="color:var(--dim)">→</span>
          <span style="color:#a0c060">${price}G</span>
          ${changeStr}
        </div>`;
      }).join('')}

      <!-- 경제 조언 -->
      <div style="margin-top:12px;padding:8px;background:#080600;border:1px solid #2a1a00;font-size:9px;color:var(--dim);line-height:1.6">
        ${eco.marketTrend==='boom'?'📈 호황기입니다. 아이템 매입보다 판매가 유리합니다.':
          eco.marketTrend==='crisis'?'📉 불황기입니다. 싸게 구입하고 비축하는 것이 전략적입니다.':
          '⚖️ 시장이 안정적입니다. 평시 거래에 좋습니다.'}
      </div>
    </div>`;
}
window.renderEconomyPanel = renderEconomyPanel;

window.renderEconomyPanel = renderEconomyPanel;
