// 2. 인벤토리/아이템 서사 연동
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';

export function buildItemNarrativeContext(){
  try{
    const inv = S.inventory || [];
    const eq  = S.equipped  || {};
    const notable = [];

    // 장착 중인 아이템 중 특이한 것
    Object.values(eq).filter(Boolean).forEach(item=>{
      if(item.rarity === 'primal' || item.rarity === 'legendary' || item.rarity === 'epic')
        notable.push(`${item.icon}${item.name}(${item.rarity === 'primal' ? '태초' : item.rarity === 'legendary' ? '전설' : '에픽'} 장비)`);
    });
    // 인벤토리의 희귀 아이템
    inv.filter(i=>i.rarity==='primal'||i.rarity==='legendary'||i.rarity==='epic').slice(0,2).forEach(item=>{
      notable.push(`${item.icon}${item.name}(소지 중)`);
    });
    // 대륙 시작 아이템
    const startItem = inv.find(i=>i.source==='continent_start');
    if(startItem) notable.push(`${startItem.icon}${startItem.name}(출신지 유물)`);

    if(!notable.length) return '';
    return `\n[🎒 주목할 아이템] ${notable.join(', ')} — 상황에 따라 이 아이템들이 서사에 자연스럽게 등장하도록 하라.`;
  }catch(e){ return ''; }
}
window.buildItemNarrativeContext = buildItemNarrativeContext;

window.buildItemNarrativeContext = buildItemNarrativeContext;
