// 룬 조합
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RUNE_DEFS, RUNE_RECIPES } from '../data/174-룬-정의-30종.js';
import { renderRuneGemPanel } from '../ui/181-UI-패널.js';
import { toast } from '../utils.js';
import { loadInventory, saveInventory } from './007-동적-아이템-생성-시스템-무제한-영구-캐시.js';

export function combineRunes(recipeIdx){
  const recipe = RUNE_RECIPES[recipeIdx];
  if(!recipe){ toast('⚠️ 잘못된 레시피', 2000); return; }
  const inv = typeof loadInventory==='function' ? loadInventory() : [];
  const needed = {};
  recipe.materials.forEach(function(m){ needed[m]=(needed[m]||0)+1; });

  // 재료 체크
  for(const runeId of Object.keys(needed)){
    const have = inv.filter(function(i){ return i&&i.runeId===runeId; }).length;
    if(have<needed[runeId]){
      const rd=RUNE_DEFS[runeId];
      toast('⚠️ '+(rd?rd.name:runeId)+' '+(needed[runeId]-have)+'개 부족', 2500);
      return;
    }
  }
  // 재료 제거
  Object.entries(needed).forEach(function(entry){
    const runeId=entry[0], cnt=entry[1];
    let removed=0;
    for(let i=inv.length-1;i>=0&&removed<cnt;i--){
      if(inv[i]&&inv[i].runeId===runeId){ inv.splice(i,1); removed++; }
    }
  });
  // 결과 추가
  const resultDef = RUNE_DEFS[recipe.result];
  inv.push({ name:(resultDef?resultDef.name:recipe.result), icon:(resultDef?resultDef.icon:'🔮'), runeId:recipe.result, type:'rune', desc:(resultDef?resultDef.effect:'') });
  if(typeof saveInventory==='function') saveInventory(inv);
  toast((resultDef?resultDef.icon:'🔮')+' '+(resultDef?resultDef.name:recipe.result)+' 조합 완료!', 4000);
  renderRuneGemPanel();
}
window.combineRunes = combineRunes;

window.combineRunes = combineRunes;
