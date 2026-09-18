// 클리어 보상 시스템 (시나리오 클리어 시 영구 아이템/스킬) — data
// Pure data split out of job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js (see generate.js).

export const CLEAR_ITEMS = {
  medieval: [
    { id:"ci_mf_hero_crest",    name:"왕국 영웅 휘장",    icon:"⚜️",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ ldr:6, rep:5, fear:3 },                 desc:"왕국을 구한 영웅만이 달 수 있는 휘장. 통솔·평판·공포 강화.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_dragon_fang",   name:"용의 이빨 목걸이",  icon:"🐲",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ str:8, mgc:6, crit:5 },                 desc:"드래곤의 이빨로 만든 목걸이. 강력한 전투력을 부여한다.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_ancient_crown", name:"고대 왕관 파편",     icon:"👑",  rarity:"legendary", type:"equip",  slot:"accessory", effects:{ ldr:10, int:6, wil:5 },                 desc:"고대 왕국의 왕관 파편. 지도자의 기운을 발산한다.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_holy_water",    name:"성수 플라스크",      icon:"✨",  rarity:"rare",      type:"consume", effects:{ hp:50, fath:10, crse:-15 },                              desc:"신전에서 봉인된 성수. HP 회복과 저주 정화 효과.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_rune_blade",    name:"룬 문자 단검",       icon:"🗡️", rarity:"rare",      type:"equip",  slot:"weapon",    effects:{ str:10, crit:8, mgc:4 },                desc:"마법 룬이 새겨진 단검. 마법과 물리 양면의 위력.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_knight_shield", name:"기사단 방패",         icon:"🛡️", rarity:"rare",      type:"equip",  slot:"armor",     effects:{ end:12, hp:10, wil:4 },                 desc:"왕국 최정예 기사단의 방패. 견고한 방어력.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_fate_scroll",   name:"운명의 두루마리",    icon:"📜",  rarity:"legendary", type:"consume", effects:{ luk:20, wil:8, per:6 },                                  desc:"예언이 적힌 두루마리. 사용 시 운명이 요동친다.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_elixir",        name:"불로 영약",          icon:"🧪",  rarity:"legendary", type:"consume", effects:{ hp:60, mp:40, end:10, wil:8 },                           desc:"전설 속 불로장생의 영약. 막대한 회복 효과.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_spirit_ring",   name:"정령의 반지",         icon:"💍",  rarity:"rare",      type:"equip",  slot:"accessory", effects:{ mgc:8, per:6, luk:5 },                  desc:"숲의 정령이 깃든 반지. 마법과 감각을 예리하게 한다.", clearDesc:"중세 판타지 클리어 보상" },
    { id:"ci_mf_war_medal",     name:"전쟁 훈장",           icon:"🎖️", rarity:"uncommon",  type:"equip",  slot:"accessory", effects:{ str:4, end:4, rep:6 },                  desc:"전장에서의 공훈을 기리는 훈장. 평판과 전투력 향상.", clearDesc:"중세 판타지 클리어 보상" },
  ],
};

export const CLEAR_SKILLS = {
  medieval: [
    { id:"cs_mf_dragon_roar",   type:"active",  name:"용의 포효",     icon:"🐲", rarity:"legendary", mpCost:35, req:{}, scenario:"medieval", desc:"드래곤의 기운으로 포효. 범위 내 모든 적의 사기를 꺾고 공포를 심는다.",            aiHint:"용의 포효 발동! 거대한 용의 울부짖음이 전장을 뒤덮어 적들을 공포에 빠뜨립니다.", clearDesc:"중세 판타지 클리어 보상", condition:null, conditionDesc:null, statBoost:{},
      effects:{ kind:'damage', statSource:{fear:0.6,str:0.4}, damageMult:1.1, element:'dark' } },
    { id:"cs_mf_holy_barrier",  type:"active",  name:"성광 결계",     icon:"✨", rarity:"legendary", mpCost:40, req:{}, scenario:"medieval", desc:"신성한 빛으로 결계를 펼쳐 한 턴간 모든 피해를 차단한다.",                       aiHint:"성광 결계 발동! 눈부신 빛의 방벽이 캐릭터를 완전히 감쌉니다.", clearDesc:"중세 판타지 클리어 보상", condition:null, conditionDesc:null, statBoost:{},
      effects:{ kind:'buff', statMod:{end:30,fath:20}, duration:1 } },
    { id:"cs_mf_royal_decree",  type:"active",  name:"왕명 선포",     icon:"👑", rarity:"rare",      mpCost:20, req:{}, scenario:"medieval", desc:"왕의 이름으로 명령을 내려 NPC들의 행동을 통제하거나 협력을 이끌어낸다.",          aiHint:"왕명 선포 발동! 왕실의 권위가 주변 인물들을 압도합니다.", clearDesc:"중세 판타지 클리어 보상", condition:null, conditionDesc:null, statBoost:{},
      effects:{ kind:'buff', statMod:{ldr:16,rep:12}, duration:3 } },
    { id:"cs_mf_rune_burst",    type:"active",  name:"룬 폭발",       icon:"💥", rarity:"rare",      mpCost:28, req:{}, scenario:"medieval", desc:"무기에 새긴 룬을 폭발시켜 강력한 마법 파동을 일으킨다.",                        aiHint:"룬 폭발 발동! 무기에서 룬 마법이 폭발하며 강렬한 파동이 쏟아집니다.", clearDesc:"중세 판타지 클리어 보상", condition:null, conditionDesc:null, statBoost:{},
      effects:{ kind:'damage', statSource:{mgc:1}, damageMult:0.9, element:'magic' } },
    { id:"cs_mf_undying_oath",  type:"passive", name:"기사의 맹세",   icon:"⚔️", rarity:"rare",      mpCost:0,  req:{}, scenario:"medieval", desc:"죽음에 맞서는 기사 정신. HP 25% 이하 시 STR·END +15 자동 강화.",               aiHint:"기사의 맹세 발동! 죽음을 불사하는 기사의 의지가 불타오릅니다.", clearDesc:"중세 판타지 클리어 보상", condition:"hp_low", conditionDesc:"HP 25% 이하", statBoost:{str:120, end:120} },
    { id:"cs_mf_realm_sight",   type:"passive", name:"세계의 눈",     icon:"👁️", rarity:"rare",      mpCost:0,  req:{}, scenario:"medieval", desc:"세계를 꿰뚫어 보는 눈. 모든 판정 PER·INT +10 상시 보너스.",                    aiHint:"세계의 눈 발동! 숨겨진 진실이 눈앞에 펼쳐집니다.", clearDesc:"중세 판타지 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{per:80, int:80} },
    { id:"cs_mf_legend_aura",   type:"passive", name:"전설의 기운",   icon:"⭐", rarity:"legendary", mpCost:0,  req:{}, scenario:"medieval", desc:"전설로 남은 영웅의 기운. REP·LDR +12 상시 효과. NPC들이 자연스레 따른다.",       aiHint:"전설의 기운 발동! 강렬한 영웅의 기운이 주변을 압도합니다.", clearDesc:"중세 판타지 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{rep:96, ldr:96} },
    { id:"cs_mf_fate_reversal", type:"event",   name:"운명 역전",     icon:"🔮", rarity:"legendary", mpCost:0,  req:{}, scenario:"medieval", desc:"한 번의 치명적 실패를 완전한 성공으로 뒤바꾼다. 1회 한정.",                    aiHint:"운명 역전 발동! 불가능해 보였던 순간, 기적이 일어납니다!", clearDesc:"중세 판타지 클리어 보상", condition:"crit_fail", conditionDesc:"대실패 시 1회 전환", statBoost:{} },
    { id:"cs_mf_ancient_power", type:"event",   name:"고대의 힘",     icon:"🏺", rarity:"legendary", mpCost:30, req:{}, scenario:"medieval", desc:"잠들어 있던 고대 마법의 힘을 해방. 모든 스탯 +20, 1턴간 최강 상태.",            aiHint:"고대의 힘 해방! 고대 문명의 마법이 폭발적으로 각성합니다.", clearDesc:"중세 판타지 클리어 보상", condition:"activate", conditionDesc:"직접 발동", statBoost:{} },
    { id:"cs_mf_kingdom_will",  type:"passive", name:"왕국의 의지",   icon:"🏰", rarity:"rare",      mpCost:0,  req:{}, scenario:"medieval", desc:"왕국을 지켜낸 자의 의지. WIL·CAL +10 상시 강화. 공포·저주 저항 강화.",          aiHint:"왕국의 의지 발동! 왕국을 수호한 강인한 의지가 빛납니다.", clearDesc:"중세 판타지 클리어 보상", condition:"always", conditionDesc:"항시 발동", statBoost:{wil:80, cal:80} },
  ],
};
