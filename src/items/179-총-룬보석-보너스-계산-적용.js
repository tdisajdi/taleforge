// 총 룬·보석 보너스 계산 + 적용
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RUNE_DEFS } from '../data/174-룬-정의-30종.js';
import { GEM_TYPES } from '../data/175-보석-정의-5종-5등급.js';
import { loadEquipped } from './007-동적-아이템-생성-시스템-무제한-영구-캐시.js';

export function updateRuneGemBonuses(){
  const equip   = typeof loadEquipped==='function' ? loadEquipped() : {};
  // [B70 FIX] 14개 키만 초기화되어 RUNE_DEFS가 실제로 쓰는 32개 stat 키 중
  // 19개(특히 S급 룬의 핵심 효과 대다수)가 bonuses[k]!=null 체크에 걸려
  // 조용히 무시되던 버그. 룬 데이터가 실제로 쓰는 전체 키를 초기화한다.
  const bonuses = { atk:0, def:0, hp:0, spd:0, fire:0, ice:0, lightning:0, all_elem:0, all_stat:0, crit:0, lifesteal:0, exp_bonus:0, summon_atk:0, summon_hp:0,
    eva:0, ice_res:0, poison:0, mp_regen:0, light:0, enhance_safe:0, detect:0, seal_sense:0, gold_bonus:0, all_res:0, summon_exp:0, freeze_imm:0, fear_imm:0, lightning_extra:0, crit_dmg:0, revive:0, armor_pierce:0, indestructible:0, enhance_lock:0 };

  Object.values(equip).forEach(function(item){
    if(!item||!item.sockets) return;
    const enhLv = item.enhanceLevel||0;
    bonuses.atk += (item.enhanceAtk||0);
    bonuses.def += (item.enhanceDef||0);
    bonuses.hp  += (item.enhanceHp||0);

    // 룬 보너스
    item.sockets.runes.forEach(function(runeId){
      if(!runeId) return;
      const rune = RUNE_DEFS[runeId];
      if(!rune||!rune.stat) return;
      Object.keys(rune.stat).forEach(function(k){ if(bonuses[k]!=null) bonuses[k]+=(rune.stat[k]||0); });
    });
    // 보석 보너스
    item.sockets.gems.forEach(function(gem){
      if(!gem) return;
      const g = GEM_TYPES[gem.typeId];
      if(!g) return;
      const v = g.vals[gem.grade]||0;
      if(gem.typeId==='ruby')     bonuses.atk   +=v;
      if(gem.typeId==='sapphire') bonuses.def   +=v;
      if(gem.typeId==='emerald')  bonuses.hp    +=v;
      if(gem.typeId==='amethyst') bonuses.summon_atk+=v;
      if(gem.typeId==='topaz')    bonuses.exp_bonus +=v;
      if(gem.typeId==='diamond')  bonuses.all_stat  +=v;
    });
  });

  // all_stat 분배
  if(bonuses.all_stat){ bonuses.atk+=bonuses.all_stat; bonuses.def+=bonuses.all_stat; bonuses.hp+=bonuses.all_stat*3; }

  // [BUG9 FIX] 이전 보너스 제거 후 새 보너스를 S.stats에 실제 반영
  const prev = S._runeGemStatBonus || {};
  const statMap = { atk:'str', def:'end', hp:'hp', crit:'crit', exp_bonus:'luk' };
  Object.entries(prev).forEach(([bk,bv])=>{
    const sk=statMap[bk]; if(sk&&S.stats&&S.stats[sk]!==undefined) S.stats[sk]=Math.max(0,S.stats[sk]-bv);
  });
  const newApplied = {};
  Object.entries(bonuses).forEach(([bk,bv])=>{
    if(!bv) return;
    const sk=statMap[bk];
    if(sk&&S.stats&&S.stats[sk]!==undefined){ S.stats[sk]=Math.min(999,S.stats[sk]+bv); newApplied[bk]=bv; }
  });
  S._runeGemStatBonus = newApplied;

  S.runeGemBonuses = bonuses;
  return bonuses;
}
window.updateRuneGemBonuses = updateRuneGemBonuses;

window.updateRuneGemBonuses = updateRuneGemBonuses;
