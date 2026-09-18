// 세트 아이템 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { ITEM_POOL } from '../data/006-세트-아이템-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { updateChallenge } from '../misc/164-도전-과제-달성률-시스템.js';
import { pickGeneratedObject, recordGeneratedObject } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { esc, lsGet, lsSet } from '../utils.js';

export const SET_DEFS = {

  // ─── 중세 판타지 세트 ───────────────────────

  'set_dragon': {
    name:'용살자 세트', icon:'🐉', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/><path d="M8 6 L6.5 3 M8 6 L9.5 3.5" stroke-width="1.2"/></svg>`, rarity:'legendary',
    desc:'용을 쓰러트린 전설의 용사가 착용했던 장비 세트.',
    items:['set_dragon_helm','set_dragon_armor','set_dragon_gloves','set_dragon_boots','set_dragon_weapon'],
    bonus: {
      2: { effects:{str:12,fear:12},    desc:'용의 위압감. 적이 공포에 질린다.' },
      3: { effects:{str:12,end:12,fear:12}, desc:'용의 힘. 전투력 폭발.' },
      5: { effects:{str:12,end:12,fear:12,mgc:12,crit:12}, desc:'용신 강림. 완전한 용의 화신.' },
    },
    items_data: [
      {id:'set_dragon_helm',   name:'용살자의 투구',   icon:'🐲',slot:'helmet',  rarity:'legendary',type:'equip',effects:{end:12,fear:12,str:12,hp:30}, desc:'용의 두개골로 만든 투구. 착용자에게 용의 기운이 깃든다.'},
      {id:'set_dragon_armor',  name:'용살자의 갑옷',   icon:'🐉',slot:'armor',   rarity:'legendary',type:'equip',effects:{end:13,hp:35,str:12,mgc:12},  desc:'드래곤 비늘을 여러 겹 엮은 갑옷. 불꽃에 완전 면역.'},
      {id:'set_dragon_gloves', name:'용살자의 장갑',   icon:'🔥',slot:'gloves',  rarity:'legendary',type:'equip',effects:{str:12,crit:12,mgc:12},         desc:'용의 발톱을 본뜬 장갑. 강렬한 불꽃이 깃들어 있다.'},
      {id:'set_dragon_boots',  name:'용살자의 부츠',   icon:'⚡',slot:'boots',   rarity:'legendary',type:'equip',effects:{agi:12,str:12,end:12},           desc:'용의 발로 만든 부츠. 대지를 가를 듯 강렬하다.'},
      {id:'set_dragon_weapon', name:'드래곤슬레이어',  icon:'⚔️',slot:'weapon',  rarity:'legendary',type:'equip',effects:{str:15,crit:12,fear:12,mgc:12}, desc:'전설의 용살자의 검. 드래곤의 심장을 꿰뚫기 위해 단조되었다.'},
    ],
  },

  'set_shadow': {
    name:'그림자 암살자 세트', icon:'🌑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>`, rarity:'legendary',
    desc:'존재 자체가 그림자인 전설의 암살자가 남긴 장비.',
    items:['set_shadow_hood','set_shadow_cloak','set_shadow_gloves','set_shadow_boots','set_shadow_blade'],
    bonus: {
      2: { effects:{disg:12,agi:12},       desc:'그림자 발걸음. 소리가 사라진다.' },
      3: { effects:{disg:12,agi:12,crit:12}, desc:'그림자 융합. 어둠 속에서 완전히 사라진다.' },
      5: { effects:{disg:15,agi:12,crit:12,fear:12,per:12}, desc:'공허의 암살자. 적이 죽었는지도 모른다.' },
    },
    items_data: [
      {id:'set_shadow_hood',   name:'공허의 두건',    icon:'🎭',slot:'helmet', rarity:'legendary',type:'equip',effects:{disg:12,per:12,agi:12},        desc:'어둠을 짜서 만든 두건. 착용자의 얼굴이 사라진다.'},
      {id:'set_shadow_cloak',  name:'공허의 망토',    icon:'🌑',slot:'cloak',  rarity:'legendary',type:'equip',effects:{disg:12,agi:12,fear:12},        desc:'공허에서 꺼낸 망토. 빛을 완전히 흡수한다.'},
      {id:'set_shadow_gloves', name:'공허의 장갑',    icon:'🖤',slot:'gloves', rarity:'legendary',type:'equip',effects:{disg:12,crit:12,agi:12},        desc:'그림자의 촉각. 어떤 잠금도 소리 없이 연다.'},
      {id:'set_shadow_boots',  name:'공허의 신발',    icon:'👣',slot:'boots',  rarity:'legendary',type:'equip',effects:{agi:12,disg:12,crit:12},        desc:'흔적을 지우는 신발. 발자국이 남지 않는다.'},
      {id:'set_shadow_blade',  name:'공허의 단검',    icon:'🗡️',slot:'weapon', rarity:'legendary',type:'equip',effects:{str:12,crit:14,disg:12,agi:12}, desc:'공허를 베는 단검. 존재를 지우는 절대적인 암살 무기.'},
    ],
  },

  'set_holy': {
    name:'성기사 세트', icon:'✝️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L12 21 M6 9 L18 9"/></svg>`, rarity:'legendary',
    desc:'신의 직접적인 가호를 받은 성기사의 완전한 장비.',
    items:['set_holy_helm','set_holy_armor','set_holy_shield','set_holy_cloak','set_holy_sword'],
    bonus: {
      2: { effects:{fath:12,wil:12},        desc:'신의 가호. 피해 15% 감소.' },
      3: { effects:{fath:12,wil:12,hp:30}, desc:'성스러운 오라. 아군 전체 강화.' },
      5: { effects:{fath:15,wil:12,hp:42,str:12,mgc:12}, desc:'신의 화신. 살아있는 기적.' },
    },
    items_data: [
      {id:'set_holy_helm',   name:'빛의 투구',    icon:'⛑️',slot:'helmet',   rarity:'legendary',type:'equip',effects:{fath:12,wil:12,end:12,hp:30},  desc:'신성한 빛이 깃든 투구. 악을 밝히는 광채를 발한다.'},
      {id:'set_holy_armor',  name:'빛의 갑옷',    icon:'🌟',slot:'armor',    rarity:'legendary',type:'equip',effects:{end:13,hp:42,fath:12,wil:12},  desc:'신의 축복으로 단조된 갑옷. 어떤 저주도 닿지 않는다.'},
      {id:'set_holy_shield', name:'빛의 방패',    icon:'🛡️',slot:'subweapon',rarity:'legendary',type:'equip',effects:{end:12,hp:30,wil:12,fath:12},  desc:'신전에서 축성된 방패. 악한 의도를 가진 공격을 튕겨낸다.'},
      {id:'set_holy_cloak',  name:'빛의 망토',    icon:'☀️',slot:'cloak',    rarity:'legendary',type:'equip',effects:{fath:12,wil:12,mgc:12,hp:30},  desc:'신성한 빛을 담은 망토. 빛이 닿지 않는 곳에서 스스로 빛난다.'},
      {id:'set_holy_sword',  name:'신성한 성검',  icon:'✝️',slot:'weapon',   rarity:'legendary',type:'equip',effects:{str:13,fath:15,wil:12,mgc:12,crit:12}, desc:'신이 직접 하사한 검. 악에게 3배의 피해를 입힌다.'},
    ],
  },

  'set_archmage': {
    name:'대마도사 세트', icon:'🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>`, rarity:'legendary',
    desc:'수천 년을 살아온 대마도사의 연구가 집약된 장비.',
    items:['set_mage_hat','set_mage_robe','set_mage_gloves','set_mage_staff','set_mage_necklace'],
    bonus: {
      2: { effects:{mgc:12,int:12},            desc:'마력 증폭. 모든 마법 효과 20% 강화.' },
      3: { effects:{mgc:12,int:12,mp:30},      desc:'고대 마법 각성. 금지된 마법에 접근 가능.' },
      5: { effects:{mgc:19,int:15,mp:42,wil:12,per:12}, desc:'세계의 관찰자. 마법이 현실이 된다.' },
    },
    items_data: [
      {id:'set_mage_hat',      name:'현자의 관',      icon:'🎩',slot:'helmet',  rarity:'legendary',type:'equip',effects:{int:12,mgc:12,per:12,mp:30},  desc:'수천 년의 지식이 담긴 관. 착용 시 모든 마법을 이해한다.'},
      {id:'set_mage_robe',     name:'별빛 로브',       icon:'✨',slot:'armor',   rarity:'legendary',type:'equip',effects:{mgc:13,int:12,mp:35,wil:12},  desc:'밤하늘의 별을 엮어 만든 로브. 마력이 무한히 순환한다.'},
      {id:'set_mage_gloves',   name:'마법진 장갑',     icon:'🔮',slot:'gloves',  rarity:'legendary',type:'equip',effects:{mgc:12,int:12,crit:12,mp:30},  desc:'마법 증폭 문양이 새겨진 장갑. 시전 속도가 극한으로 빨라진다.'},
      {id:'set_mage_staff',    name:'세계수 지팡이',   icon:'🌳',slot:'weapon',  rarity:'legendary',type:'equip',effects:{mgc:19,int:14,wil:12,mp:42},  desc:'세계수의 가지로 만든 지팡이. 마법 상한이 사라진다.'},
      {id:'set_mage_necklace', name:'별의 결정 목걸이',icon:'💫',slot:'necklace',rarity:'legendary',type:'equip',effects:{mgc:12,int:12,luk:12,mp:30},  desc:'별빛을 결정화한 목걸이. 마법의 정밀도가 극한에 달한다.'},
    ],
  },

  // ─── 추가 legendary 세트 ────────────────────

  'set_demon_lord': {
    name:'마왕 세트', icon:'👿', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20 C6 15.5 8.5 13 12 13 C15.5 13 18 15.5 18 20" /><path d="M4 8 C4 4.5 7.5 2 12 2 C16.5 2 20 4.5 20 8 C20 11 18 13 16 13 L8 13 C6 13 4 11 4 8 Z" stroke-linejoin="round"/><circle cx="9" cy="7.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none"/><path d="M9 2 L7 -1 M15 2 L17 -1"/></svg>`, rarity:'legendary',
    desc:'이 세계를 지배했던 고대 마왕의 전설적인 장비. 착용자에게 마왕의 권능이 깃든다.',
    items:['set_dml_crown','set_dml_armor','set_dml_gloves','set_dml_boots','set_dml_scepter'],
    bonus: {
      2: { effects:{fear:14,mgc:12},                   desc:'마왕의 위압. 모든 하급 존재가 무릎을 꿇는다.' },
      3: { effects:{fear:14,mgc:14,str:12},             desc:'마왕의 분노. 파괴 마법 위력 2배.' },
      5: { effects:{fear:18,mgc:18,str:14,hp:40,int:14}, desc:'마왕 강림. 세계가 두려움에 떤다.' },
    },
    items_data: [
      {id:'set_dml_crown',   name:'마왕의 왕관',   icon:'👑',slot:'helmet',  rarity:'legendary',type:'equip',effects:{fear:14,int:13,mgc:12,mp:35},  desc:'공포 자체를 결정화한 왕관. 쓰는 순간 모든 약자가 공포에 질린다.'},
      {id:'set_dml_armor',   name:'마왕의 갑옷',   icon:'👿',slot:'armor',   rarity:'legendary',type:'equip',effects:{end:14,hp:42,fear:13,mgc:12},  desc:'마계의 철로 주조된 갑옷. 어떤 신성 공격도 흡수한다.'},
      {id:'set_dml_gloves',  name:'마왕의 장갑',   icon:'🖤',slot:'gloves',  rarity:'legendary',type:'equip',effects:{str:13,mgc:13,fear:12,crit:12}, desc:'파괴의 손. 닿는 것은 무엇이든 붕괴된다.'},
      {id:'set_dml_boots',   name:'마왕의 부츠',   icon:'🌋',slot:'boots',   rarity:'legendary',type:'equip',effects:{fear:13,agi:12,str:12,end:12}, desc:'지옥의 땅을 밟은 부츠. 발걸음마다 대지가 갈라진다.'},
      {id:'set_dml_scepter', name:'파멸의 홀',     icon:'🔱',slot:'weapon',  rarity:'legendary',type:'equip',effects:{mgc:19,fear:16,str:13,int:14,mp:42}, desc:'세계 멸망을 불러오는 홀. 한 번 휘두르면 도시 하나가 사라진다.'},
    ],
  },

  'set_phoenix': {
    name:'불사조 세트', icon:'🔥', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></svg>`, rarity:'legendary',
    desc:'죽어서도 다시 타오르는 불사조의 깃털로 만들어진 불멸의 장비.',
    items:['set_phx_helm','set_phx_armor','set_phx_wings','set_phx_ring','set_phx_spear'],
    bonus: {
      2: { effects:{hp:30,end:12},                  desc:'불사의 기운. 사망 시 HP 30% 회복 후 부활.' },
      3: { effects:{hp:35,end:14,str:12},            desc:'불꽃 재생. 매 턴 HP 10 자동 회복.' },
      5: { effects:{hp:50,end:16,str:14,mgc:14,crit:13}, desc:'불사조 강림. 완전한 불멸. 한 전투에서 3회 부활.' },
    },
    items_data: [
      {id:'set_phx_helm',  name:'불사조 투구',   icon:'🔥',slot:'helmet',   rarity:'legendary',type:'equip',effects:{end:13,hp:35,mgc:12,wil:12},  desc:'불사조의 볏으로 만든 투구. 착용자가 죽음의 문턱에서 되살아난다.'},
      {id:'set_phx_armor', name:'불사조 갑옷',   icon:'🦅',slot:'armor',    rarity:'legendary',type:'equip',effects:{end:14,hp:42,mgc:13,str:12},  desc:'불사조 깃털을 엮어 만든 갑옷. 화염 완전 면역, 냉기 피해 흡수.'},
      {id:'set_phx_wings', name:'불사조의 날개', icon:'🌅',slot:'cloak',    rarity:'legendary',type:'equip',effects:{agi:14,mgc:12,end:12,hp:30},  desc:'불타는 날개. 하늘을 자유롭게 날 수 있다.'},
      {id:'set_phx_ring',  name:'부활의 불꽃 반지',icon:'💍',slot:'ring1',  rarity:'legendary',type:'equip',effects:{hp:35,end:12,mgc:12,luk:13}, desc:'불사조의 심장불이 담긴 반지. 죽음 직전 자동 발동.'},
      {id:'set_phx_spear', name:'태양의 창',     icon:'☀️',slot:'weapon',   rarity:'legendary',type:'equip',effects:{str:15,mgc:14,crit:13,end:13,hp:40}, desc:'태양의 핵으로 단조된 창. 불꽃이 살아 숨쉬듯 타오른다.'},
    ],
  },

  'set_time_weaver': {
    name:'시간직조자 세트', icon:'⏳', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3 L18 3 L18 7 L13 12 L18 17 L18 21 L6 21 L6 17 L11 12 L6 7 Z" stroke-linejoin="round"/></svg>`, rarity:'legendary',
    desc:'시간의 흐름 자체를 바꿨던 전설의 시간술사의 유물.',
    items:['set_tw_crown','set_tw_robe','set_tw_gloves','set_tw_watch','set_tw_staff'],
    bonus: {
      2: { effects:{per:14,agi:13},                    desc:'시간 지각. 적의 다음 행동이 보인다.' },
      3: { effects:{per:14,agi:14,int:13},              desc:'시간 감속. 전투 중 시간이 느려진다.' },
      5: { effects:{per:18,agi:16,int:16,luk:14,mgc:14}, desc:'시간의 주인. 원할 때 시간을 되돌린다.' },
    },
    items_data: [
      {id:'set_tw_crown', name:'시간의 왕관',   icon:'⌚',slot:'helmet',  rarity:'legendary',type:'equip',effects:{per:14,int:13,mgc:12,mp:35},   desc:'시간의 흐름이 새겨진 왕관. 과거와 미래가 동시에 보인다.'},
      {id:'set_tw_robe',  name:'시공간 로브',   icon:'🌀',slot:'armor',   rarity:'legendary',type:'equip',effects:{int:14,mgc:13,per:12,mp:40},   desc:'공간을 접어 만든 로브. 이동 시 순간이동이 된다.'},
      {id:'set_tw_gloves',name:'시간사의 장갑', icon:'⏳',slot:'gloves',  rarity:'legendary',type:'equip',effects:{agi:14,per:13,crit:12,int:12}, desc:'시간을 움켜쥔 장갑. 터치 한 번으로 시간을 압축한다.'},
      {id:'set_tw_watch', name:'영원의 회중시계',icon:'🕰️',slot:'trinket',rarity:'legendary',type:'equip',effects:{luk:14,per:13,int:12,agi:12},  desc:'멈추지 않는 시계. 착용자의 노화가 멈춘다.'},
      {id:'set_tw_staff', name:'시간의 지팡이', icon:'🔮',slot:'weapon',  rarity:'legendary',type:'equip',effects:{mgc:19,int:15,per:14,agi:14,mp:42}, desc:'시간을 재단하는 지팡이. 원하는 순간으로 세계를 되돌린다.'},
    ],
  },

  'set_deep_sea': {
    name:'심해의 지배자 세트', icon:'🌊', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 C2 12 5 9 8 12 C11 15 13 12 16 12 C19 12 22 9 22 9 M2 17 C2 17 5 14 8 17 C11 20 13 17 16 17 C19 17 22 14 22 14" stroke-width="1.4"/></svg>`, rarity:'legendary',
    desc:'바다의 심연에서 잠들어있던 고대 해신의 장비.',
    items:['set_ds_helm','set_ds_armor','set_ds_gloves','set_ds_boots','set_ds_trident'],
    bonus: {
      2: { effects:{end:13,mgc:12},                   desc:'조류 제어. 물 속에서 무한 호흡 및 자유 이동.' },
      3: { effects:{end:14,mgc:13,str:12},             desc:'해신의 힘. 물을 자유롭게 조종한다.' },
      5: { effects:{end:16,mgc:16,str:15,hp:45,fear:14}, desc:'심해 군주. 바다 전체가 의지에 따라 움직인다.' },
    },
    items_data: [
      {id:'set_ds_helm',    name:'해신의 투구',   icon:'🌊',slot:'helmet', rarity:'legendary',type:'equip',effects:{end:13,mgc:12,per:12,hp:35},   desc:'깊은 바다에서 건져 올린 투구. 바다의 모든 생물이 복종한다.'},
      {id:'set_ds_armor',   name:'산호 갑옷',     icon:'🪸',slot:'armor',  rarity:'legendary',type:'equip',effects:{end:14,hp:42,mgc:13,str:12},   desc:'심해 산호로 만든 갑옷. 물리 피해와 마법 피해를 모두 흡수.'},
      {id:'set_ds_gloves',  name:'해류 장갑',     icon:'💧',slot:'gloves', rarity:'legendary',type:'equip',effects:{mgc:13,str:12,agi:12,crit:12}, desc:'해류를 손에 담은 장갑. 공격할 때마다 물의 충격파가 발생.'},
      {id:'set_ds_boots',   name:'파도 부츠',     icon:'🌀',slot:'boots',  rarity:'legendary',type:'equip',effects:{agi:14,end:12,mgc:12,str:12},  desc:'파도처럼 흐르는 부츠. 물 위를 걷고 물 속에서 날아다닌다.'},
      {id:'set_ds_trident', name:'포세이돈의 삼지창',icon:'🔱',slot:'weapon',rarity:'legendary',type:'equip',effects:{str:16,mgc:18,end:13,fear:14,hp:40}, desc:'바다의 신이 직접 만든 삼지창. 대지를 꿰뚫어 해일을 일으킨다.'},
    ],
  },

  'set_void_walker': {
    name:'공허 보행자 세트', icon:'🌌', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="1.2"/><circle cx="8" cy="9" r="0.8" fill="currentColor" stroke="none"/><circle cx="15" cy="8" r="0.6" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r="0.9" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="0.6" fill="currentColor" stroke="none"/></svg>`, rarity:'legendary',
    desc:'차원과 차원 사이의 공허를 걷는 자가 입는 장비.',
    items:['set_vw_mask','set_vw_robe','set_vw_gloves','set_vw_boots','set_vw_blade'],
    bonus: {
      2: { effects:{disg:14,agi:13},                  desc:'공허 이동. 벽과 장애물을 투과한다.' },
      3: { effects:{disg:14,agi:14,mgc:13},            desc:'차원 절단. 공간 자체를 베어 공격한다.' },
      5: { effects:{disg:18,agi:16,mgc:16,crit:14,per:14}, desc:'공허 군주. 현실과 비현실 사이를 자유롭게 이동.' },
    },
    items_data: [
      {id:'set_vw_mask',  name:'공허의 가면',   icon:'🌌',slot:'helmet', rarity:'legendary',type:'equip',effects:{disg:14,per:13,mgc:12,agi:12},  desc:'공허로 만든 가면. 착용자의 존재 자체가 불명확해진다.'},
      {id:'set_vw_robe',  name:'차원 균열 로브',icon:'🕳️',slot:'armor',  rarity:'legendary',type:'equip',effects:{mgc:14,agi:13,disg:13,int:12}, desc:'차원 균열을 꿰매어 만든 로브. 어떤 공격도 다른 차원으로 흘려보낸다.'},
      {id:'set_vw_gloves',name:'공허 장갑',     icon:'🌑',slot:'gloves', rarity:'legendary',type:'equip',effects:{mgc:13,crit:14,agi:12,disg:12}, desc:'공허를 쥔 손. 물리 법칙을 무시한 공격이 가능하다.'},
      {id:'set_vw_boots', name:'차원 보행화',   icon:'🌀',slot:'boots',  rarity:'legendary',type:'equip',effects:{agi:14,disg:14,per:12,mgc:12},  desc:'차원 사이를 걷는 신발. 이동 시 순간적으로 다른 차원에 진입한다.'},
      {id:'set_vw_blade', name:'공허의 검',     icon:'🌌',slot:'weapon', rarity:'legendary',type:'equip',effects:{mgc:18,crit:16,agi:14,disg:14,str:13}, desc:'공허를 결정화한 검. 베인 부분이 공허로 사라져버린다.'},
    ],
  },

  'set_ancient_king': {
    name:'고대왕 세트', icon:'👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></svg>`, rarity:'legendary',
    desc:'수천 년 전 세계를 통일했던 고대 왕의 완전한 왕장.',
    items:['set_ak_crown','set_ak_robe','set_ak_shield','set_ak_ring','set_ak_sword'],
    bonus: {
      2: { effects:{rep:14,wil:13},                   desc:'왕의 카리스마. 모든 NPC 호감도 +30.' },
      3: { effects:{rep:14,wil:14,str:13},             desc:'왕국의 수호자. 아군 전체 능력치 +15%.' },
      5: { effects:{rep:18,wil:16,str:15,int:14,end:14}, desc:'고대왕 재림. 세계가 자연스럽게 복종한다.' },
    },
    items_data: [
      {id:'set_ak_crown',  name:'고대왕의 왕관', icon:'👑',slot:'helmet',   rarity:'legendary',type:'equip',effects:{rep:14,wil:13,int:13,fear:12},   desc:'수천 년 역사가 담긴 왕관. 쓰는 순간 왕족의 혈통이 인정된다.'},
      {id:'set_ak_robe',   name:'왕실 예복',     icon:'🟣',slot:'armor',    rarity:'legendary',type:'equip',effects:{rep:13,end:13,wil:13,hp:40},      desc:'왕실에서만 입을 수 있는 예복. 어디서든 왕으로 인정받는다.'},
      {id:'set_ak_shield', name:'왕국의 방패',   icon:'🛡️',slot:'subweapon',rarity:'legendary',type:'equip',effects:{end:14,hp:40,wil:14,rep:12},      desc:'왕국을 수호해온 방패. 아군의 피해를 일부 흡수한다.'},
      {id:'set_ak_ring',   name:'왕권 반지',     icon:'💍',slot:'ring1',    rarity:'legendary',type:'equip',effects:{rep:14,wil:13,int:12,luk:13},     desc:'왕권을 상징하는 반지. 착용자의 명령이 법률이 된다.'},
      {id:'set_ak_sword',  name:'왕의 성검',     icon:'⚔️',slot:'weapon',   rarity:'legendary',type:'equip',effects:{str:16,rep:15,wil:14,end:13,crit:13}, desc:'왕국의 수호검. 정의를 위해 싸울 때 위력이 2배가 된다.'},
    ],
  },

  // ─── 추가 rare 세트 ──────────────────────────

  'set_storm_knight': {
    name:'폭풍 기사 세트', icon:'⚡', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L6 13 L11 13 L10 22 L18 10 L13 10 Z" stroke-linejoin="round"/></svg>`, rarity:'rare',
    desc:'폭풍을 다루는 뇌전 기사의 전투 장비.',
    items:['set_sk_helm','set_sk_armor','set_sk_boots','set_sk_lance'],
    bonus: {
      2: { effects:{str:12,agi:12},                  desc:'뇌전 돌격. 첫 공격 시 번개 충격파 발생.' },
      4: { effects:{str:14,agi:13,crit:12,end:12},   desc:'폭풍의 화신. 이동할 때마다 번개가 튄다.' },
    },
    items_data: [
      {id:'set_sk_helm',  name:'폭풍 투구',   icon:'⛈️',slot:'helmet', rarity:'rare',type:'equip',effects:{end:12,str:12,agi:12,per:12},   desc:'번개를 머금은 투구. 전장에서 번개처럼 빛난다.'},
      {id:'set_sk_armor', name:'폭풍 갑옷',   icon:'⚡',slot:'armor',  rarity:'rare',type:'equip',effects:{end:13,hp:30,str:12,agi:12},   desc:'뇌전이 흐르는 갑옷. 접촉 시 전기 충격을 준다.'},
      {id:'set_sk_boots', name:'폭풍 부츠',   icon:'🌪️',slot:'boots',  rarity:'rare',type:'equip',effects:{agi:13,str:12,crit:12,per:12}, desc:'바람처럼 빠른 부츠. 달릴 때 번개가 발 뒤에 남는다.'},
      {id:'set_sk_lance', name:'뇌전 창',     icon:'⚡',slot:'weapon', rarity:'rare',type:'equip',effects:{str:14,crit:13,agi:12,end:12},  desc:'번개를 가둔 창. 찌를 때마다 폭발적인 전기 충격이 발생.'},
    ],
  },

  'set_forest_guardian': {
    name:'숲의 수호자 세트', icon:'🌿', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 12 12 12 8 C12 4.5 9 3 6 3 C6 6.5 8 9 12 9" stroke-linejoin="round"/><path d="M12 14 C12 14 12 9 15 7.5 C17 6.5 19 7 19 7 C19 9.5 17 12.5 12 12.5" stroke-linejoin="round"/></svg>`, rarity:'rare',
    desc:'수백 년 된 고목이 인정한 자에게만 주어지는 자연의 장비.',
    items:['set_fg_helm','set_fg_armor','set_fg_gloves','set_fg_bow'],
    bonus: {
      2: { effects:{per:12,luk:12},                   desc:'자연의 감각. 숲 속 모든 위험 자동 감지.' },
      4: { effects:{per:13,luk:13,agi:12,end:12},     desc:'숲의 가호. 자연 환경에서 능력치 +25%.' },
    },
    items_data: [
      {id:'set_fg_helm',   name:'나뭇잎 두건',   icon:'🍃',slot:'helmet', rarity:'rare',type:'equip',effects:{per:12,disg:12,luk:12,agi:12}, desc:'살아있는 나뭇잎으로 만든 두건. 숲 속에서 완전히 사라진다.'},
      {id:'set_fg_armor',  name:'나무껍질 갑옷', icon:'🌳',slot:'armor',  rarity:'rare',type:'equip',effects:{end:13,hp:30,per:12,luk:12},   desc:'수백 년 된 고목의 껍질로 만든 갑옷. 자연 에너지가 지속 회복.'},
      {id:'set_fg_gloves', name:'덩굴 장갑',     icon:'🌿',slot:'gloves', rarity:'rare',type:'equip',effects:{per:12,agi:12,luk:12,str:12},  desc:'살아 움직이는 덩굴 장갑. 원거리에서 적을 묶어버린다.'},
      {id:'set_fg_bow',    name:'고목의 장궁',   icon:'🏹',slot:'weapon', rarity:'rare',type:'equip',effects:{str:13,per:14,agi:12,crit:12}, desc:'수백 년 된 고목으로 만든 활. 화살이 자동으로 목표를 추적한다.'},
    ],
  },

  'set_frost': {
    name:'빙결 마법사 세트', icon:'❄️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 22 M4 7 L20 17 M20 7 L4 17"/></svg>`, rarity:'rare',
    desc:'영원한 겨울의 땅에서 단련된 빙결 마법사의 장비.',
    items:['set_fr_hat','set_fr_robe','set_fr_staff','set_fr_ring'],
    bonus: {
      2: { effects:{mgc:12,int:12},                  desc:'빙결 전문. 냉기 마법 위력 +40%.' },
      4: { effects:{mgc:13,int:13,per:12,mp:30},     desc:'절대영도. 적을 즉시 동결시킨다.' },
    },
    items_data: [
      {id:'set_fr_hat',  name:'눈보라 모자',   icon:'❄️',slot:'helmet',  rarity:'rare',type:'equip',effects:{int:12,mgc:12,per:12,mp:30},   desc:'영구 눈보라가 담긴 모자. 착용자 주변에 항상 서리가 생긴다.'},
      {id:'set_fr_robe', name:'빙하 로브',     icon:'🧊',slot:'armor',   rarity:'rare',type:'equip',effects:{mgc:13,int:12,end:12,mp:35},   desc:'빙하를 녹여 만든 로브. 화염 공격을 완전히 흡수한다.'},
      {id:'set_fr_staff','name':'서리 지팡이', icon:'🌨️',slot:'weapon',  rarity:'rare',type:'equip',effects:{mgc:14,int:13,crit:12,mp:35},  desc:'얼음 결정이 자라나는 지팡이. 시전하는 모든 마법에 빙결 효과 추가.'},
      {id:'set_fr_ring', name:'빙결의 반지',   icon:'💎',slot:'ring1',   rarity:'rare',type:'equip',effects:{mgc:12,int:12,luk:12,mp:30},   desc:'순수한 얼음을 굳혀 만든 반지. 착용자의 체온이 0도에 가까워진다.'},
    ],
  },

  'set_pirate': {
    name:'전설 해적 세트', icon:'🏴‍☠️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4"/><circle cx="9.7" cy="8" r="0.7" fill="currentColor"/><circle cx="14.3" cy="8" r="0.7" fill="currentColor"/><path d="M9.5 11.5 C10.3 12.3 13.7 12.3 14.5 11.5" stroke-width="1.2"/><path d="M8.5 4.5 L6.5 2.5 M15.5 4.5 L17.5 2.5" stroke-width="1.2"/><path d="M9 21 L9 15 L15 15 L15 21"/></svg>`, rarity:'rare',
    desc:'7개 바다를 정복한 전설의 해적왕의 유품.',
    items:['set_pt_hat','set_pt_coat','set_pt_boots','set_pt_pistol'],
    bonus: {
      2: { effects:{luk:13,neg:12},                  desc:'해적의 행운. 전리품 획득 확률 +50%.' },
      4: { effects:{luk:14,neg:13,agi:12,crit:12},   desc:'해적왕의 위엄. 협박 시 저항 불가.' },
    },
    items_data: [
      {id:'set_pt_hat',    name:'해적왕의 모자',  icon:'🏴‍☠️',slot:'helmet', rarity:'rare',type:'equip',effects:{luk:13,rep:12,neg:12,per:12}, desc:'해적왕이 쓴 삼각모. 쓰면 이 바다의 왕이 될 운명이 따라온다.'},
      {id:'set_pt_coat',   name:'해적왕의 코트',  icon:'🧥',slot:'armor',  rarity:'rare',type:'equip',effects:{luk:12,end:12,neg:12,agi:12},  desc:'피와 소금기가 밴 롱코트. 어디서든 전설의 해적임을 알아본다.'},
      {id:'set_pt_boots',  name:'해적왕의 부츠',  icon:'👢',slot:'boots',  rarity:'rare',type:'equip',effects:{agi:13,luk:12,neg:12,str:12},  desc:'7개 바다를 누빈 부츠. 어떤 갑판도, 어떤 땅도 미끄럽지 않다.'},
      {id:'set_pt_pistol', name:'황금 권총',      icon:'🔫',slot:'weapon', rarity:'rare',type:'equip',effects:{str:13,crit:14,luk:12,per:12}, desc:'해적왕의 황금 권총. 빗나가는 법이 없다.'},
    ],
  },

  'set_scholar': {
    name:'고대 학자 세트', icon:'📚', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/></svg>`, rarity:'rare',
    desc:'잊혀진 문명의 모든 지식을 습득한 고대 학자의 장비.',
    items:['set_sc_hat','set_sc_robe','set_sc_necklace','set_sc_book'],
    bonus: {
      2: { effects:{int:13,per:12},                  desc:'박식. 모든 수수께끼와 고대 문자 자동 해독.' },
      4: { effects:{int:14,per:13,mgc:12,mp:30},     desc:'금지된 지식. 세계의 숨겨진 진실이 보인다.' },
    },
    items_data: [
      {id:'set_sc_hat',      name:'학자의 모자',     icon:'🎓',slot:'helmet',  rarity:'rare',type:'equip',effects:{int:13,per:12,mgc:12,mp:30},   desc:'고대 학당에서 수여하는 모자. 쓰면 고대어가 저절로 읽힌다.'},
      {id:'set_sc_robe',     name:'지식의 로브',     icon:'📜',slot:'armor',   rarity:'rare',type:'equip',effects:{int:13,mgc:12,per:12,mp:35},   desc:'고대 문자가 가득 새겨진 로브. 글자들이 살아 움직이며 정보를 전달.'},
      {id:'set_sc_necklace', name:'지혜의 목걸이',   icon:'🔍',slot:'necklace',rarity:'rare',type:'equip',effects:{int:13,per:13,luk:12,mp:30},   desc:'지혜의 눈이 달린 목걸이. 숨겨진 것들이 모두 드러난다.'},
      {id:'set_sc_book',     name:'금서',            icon:'📖',slot:'trinket', rarity:'rare',type:'equip',effects:{int:14,mgc:13,per:12,mp:35},   desc:'세상에 존재해서는 안 될 지식을 담은 책. 펼치면 금지된 마법을 쓸 수 있다.'},
    ],
  },

  'set_blood_warrior': {
    name:'핏빛 전사 세트', icon:'🩸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C12 3 6 11 6 15.5 C6 18.5 8.7 21 12 21 C15.3 21 18 18.5 18 15.5 C18 11 12 3 12 3 Z" stroke-linejoin="round"/></svg>`, rarity:'rare',
    desc:'피를 힘으로 변환하는 금단의 전투술을 익힌 전사의 장비.',
    items:['set_bw_helm','set_bw_armor','set_bw_ring','set_bw_axe'],
    bonus: {
      2: { effects:{str:12,crit:12},                 desc:'피의 각성. HP가 낮을수록 공격력 증가.' },
      4: { effects:{str:14,crit:13,end:12,hp:30},    desc:'혈전 광란. 적의 피를 흡수해 회복한다.' },
    },
    items_data: [
      {id:'set_bw_helm',  name:'핏빛 투구',   icon:'🩸',slot:'helmet', rarity:'rare',type:'equip',effects:{end:12,str:12,crit:12,hp:30}, desc:'붉게 물든 투구. 착용자의 눈이 핏빛으로 물든다.'},
      {id:'set_bw_armor', name:'핏빛 갑옷',   icon:'❤️',slot:'armor',  rarity:'rare',type:'equip',effects:{end:13,hp:35,str:12,crit:12}, desc:'수많은 전투로 피가 스며든 갑옷. 핏빛이 더해질수록 강해진다.'},
      {id:'set_bw_ring',  name:'피의 맹약 반지',icon:'💍',slot:'ring1', rarity:'rare',type:'equip',effects:{str:12,crit:12,hp:30,end:12}, desc:'피를 마신 반지. 전투 중 HP가 줄수록 위력이 올라간다.'},
      {id:'set_bw_axe',   name:'도살자의 도끼',icon:'🪓',slot:'weapon', rarity:'rare',type:'equip',effects:{str:15,crit:13,fear:12,end:12}, desc:'수천 명을 베어낸 도끼. 공격마다 적의 생명력을 흡수한다.'},
    ],
  },

  'set_plague_doctor': {
    name:'역병 의사 세트', icon:'🦠', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6"/><path d="M12 2 L12 4.5 M12 19.5 L12 22 M2 12 L4.5 12 M19.5 12 L22 12 M5.1 5.1 L6.8 6.8 M17.2 17.2 L18.9 18.9 M18.9 5.1 L17.2 6.8 M6.8 17.2 L5.1 18.9" stroke-width="1.1"/><circle cx="10" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="13" r="1" fill="currentColor" stroke="none"/></svg>`, rarity:'rare',
    desc:'치료와 독을 동시에 다루는 역병 의사의 특수 장비.',
    items:['set_pd_mask','set_pd_coat','set_pd_gloves','set_pd_syringe'],
    bonus: {
      2: { effects:{int:12,mgc:12},                  desc:'상태이상 면역. 독·질병·저주 등 모든 부정 상태이상에 완전 내성.' },
      4: { effects:{int:13,mgc:13,per:12,fear:12},   desc:'역병 전파. 공격 시 독 상태이상 자동 부여.' },
    },
    items_data: [
      {id:'set_pd_mask',    name:'역병 마스크',  icon:'😷',slot:'helmet', rarity:'rare',type:'equip',effects:{int:12,per:12,mgc:12,end:12},  desc:'부리 모양의 마스크. 어떤 독기도 차단하고 적에게 역류시킨다.'},
      {id:'set_pd_coat',    name:'역병 코트',    icon:'🧥',slot:'armor',  rarity:'rare',type:'equip',effects:{end:12,int:12,mgc:12,per:12},  desc:'왁스가 입혀진 코트. 독소와 병균을 완전히 튕겨낸다.'},
      {id:'set_pd_gloves',  name:'실험 장갑',    icon:'🧤',slot:'gloves', rarity:'rare',type:'equip',effects:{int:12,mgc:12,per:12,crit:12}, desc:'세균을 다루는 특수 장갑. 촉감만으로 독의 종류를 식별한다.'},
      {id:'set_pd_syringe', name:'독 주사기',    icon:'💉',slot:'weapon', rarity:'rare',type:'equip',effects:{str:12,mgc:13,int:13,crit:13}, desc:'치료와 독이 담긴 주사기. 대상의 HP에 따라 효과가 달라진다.'},
    ],
  },

  // ─── 추가 uncommon 세트 ──────────────────────

  'set_gladiator': {
    name:'검투사 세트', icon:'⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>`, rarity:'uncommon',
    desc:'콜로세움을 지배한 전설의 검투사의 장비.',
    items:['set_gl_helm','set_gl_armor','set_gl_shield','set_gl_sword'],
    bonus: {
      2: { effects:{str:12,end:12},               desc:'군중의 함성. 관중이 있으면 공격력 +20%.' },
      4: { effects:{str:13,end:12,crit:12,hp:30}, desc:'챔피언의 의지. HP가 1이 되어도 쓰러지지 않는다.' },
    },
    items_data: [
      {id:'set_gl_helm',   name:'검투사 투구',  icon:'⚔️',slot:'helmet',   rarity:'uncommon',type:'equip',effects:{end:12,str:12,fear:12,hp:30}, desc:'콜로세움에서 쓰는 투구. 군중의 환호를 힘으로 바꾼다.'},
      {id:'set_gl_armor',  name:'검투사 갑옷',  icon:'🏟️',slot:'armor',    rarity:'uncommon',type:'equip',effects:{end:13,hp:30,str:12,crit:12}, desc:'수많은 상처가 새겨진 갑옷. 그 흔적이 오히려 위협이 된다.'},
      {id:'set_gl_shield', name:'검투 방패',    icon:'🛡️',slot:'subweapon',rarity:'uncommon',type:'equip',effects:{end:12,hp:30,str:12,wil:12},  desc:'공격도 방어도 되는 검투 방패. 상대를 밀어붙이는 데 최적화.'},
      {id:'set_gl_sword',  name:'검투 단검',    icon:'🗡️',slot:'weapon',   rarity:'uncommon',type:'equip',effects:{str:13,crit:12,agi:12,end:12}, desc:'콜로세움에서 연마된 단검. 좁은 거리에서 치명적이다.'},
    ],
  },

  'set_alchemist': {
    name:'연금술사 세트', icon:'⚗️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2 L15 2 M10 2 L10 9 L4.5 18 C4 19 4.7 20 6 20 L18 20 C19.3 20 20 19 19.5 18 L14 9 L14 2" stroke-linejoin="round"/><path d="M7 15 L17 15" stroke-width="1.1"/></svg>`, rarity:'uncommon',
    desc:'금속을 변환하고 포션을 제조하는 연금술사의 작업 장비.',
    items:['set_alc_goggles','set_alc_coat','set_alc_gloves','set_alc_belt'],
    bonus: {
      2: { effects:{int:12,luk:12},               desc:'연금의 손. 아이템 제조 성공률 +30%.' },
      4: { effects:{int:13,luk:12,mgc:12,per:12}, desc:'황금 변환. 모든 물질을 원하는 재료로 변환.' },
    },
    items_data: [
      {id:'set_alc_goggles',name:'연금 고글',      icon:'🥽',slot:'helmet', rarity:'uncommon',type:'equip',effects:{int:12,per:12,luk:12,mgc:12}, desc:'물질의 본질을 보는 고글. 모든 재료의 성분이 보인다.'},
      {id:'set_alc_coat',   name:'연금술사 코트',  icon:'⚗️',slot:'armor',  rarity:'uncommon',type:'equip',effects:{int:12,end:12,mgc:12,luk:12}, desc:'시약이 스며든 코트. 독성 물질과 폭발에 내성이 있다.'},
      {id:'set_alc_gloves', name:'연금 장갑',      icon:'🧪',slot:'gloves', rarity:'uncommon',type:'equip',effects:{int:12,luk:12,per:12,mgc:12}, desc:'세밀한 작업을 위한 장갑. 어떤 위험한 물질도 안전하게 다룬다.'},
      {id:'set_alc_belt',   name:'약품 벨트',      icon:'🧴',slot:'belt',   rarity:'uncommon',type:'equip',effects:{int:12,luk:12,per:12,hp:30},  desc:'수십 개의 포션 홀더가 달린 벨트. 필요한 포션이 항상 꺼내진다.'},
    ],
  },

  'set_scout': {
    name:'정찰병 세트', icon:'🔭', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15 L15 6 L18 10 L6 19 Z" stroke-linejoin="round"/><path d="M15 6 L20 4 L21 9 L18 10" stroke-linejoin="round"/><circle cx="5" cy="18" r="1.5"/></svg>`, rarity:'uncommon',
    desc:'전장의 눈이자 귀가 되는 정찰병의 경량 장비.',
    items:['set_st_cap','set_st_vest','set_st_boots','set_st_crossbow'],
    bonus: {
      2: { effects:{per:12,agi:12},               desc:'넓은 시야. 전장 전체의 적 위치 파악.' },
      4: { effects:{per:13,agi:13,luk:12,crit:12},desc:'저격의 달인. 원거리 공격 치명타율 +40%.' },
    },
    items_data: [
      {id:'set_st_cap',      name:'정찰 모자',     icon:'🧢',slot:'helmet', rarity:'uncommon',type:'equip',effects:{per:13,agi:12,luk:12,disg:12}, desc:'위장색 모자. 멀리서도 적의 위치를 파악한다.'},
      {id:'set_st_vest',     name:'경량 조끼',     icon:'🦺',slot:'armor',  rarity:'uncommon',type:'equip',effects:{agi:12,per:12,end:12,disg:12}, desc:'움직임을 방해하지 않는 경량 방탄 조끼. 빠른 이동에 최적화.'},
      {id:'set_st_boots',    name:'정찰 부츠',     icon:'🥾',slot:'boots',  rarity:'uncommon',type:'equip',effects:{agi:13,per:12,disg:12,luk:12}, desc:'소리를 죽이는 부츠. 어떤 지형도 소리 없이 이동한다.'},
      {id:'set_st_crossbow', name:'접이식 석궁',   icon:'🏹',slot:'weapon', rarity:'uncommon',type:'equip',effects:{str:12,per:13,crit:13,agi:12}, desc:'휴대 가능한 접이식 석궁. 빠르고 정확하다.'},
    ],
  },

  'set_cook': {
    name:'전설의 요리사 세트', icon:'👨‍🍳', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11 C7 6.5 9 3 12 3 C15 3 17 6.5 17 11 Z" stroke-linejoin="round"/><path d="M6 11 L18 11 M8 11 L8 20 L16 20 L16 11" /></svg>`, rarity:'uncommon',
    desc:'세상 최고의 요리로 사람들을 감동시키는 전설의 요리사 장비.',
    items:['set_ck_hat','set_ck_apron','set_ck_gloves','set_ck_knife'],
    bonus: {
      2: { effects:{neg:12,rep:12},               desc:'맛의 마법. 만든 음식이 능력치 포션 역할.' },
      4: { effects:{neg:13,rep:13,luk:12,int:12}, desc:'전설의 요리. 먹은 자는 무조건 아군이 된다.' },
    },
    items_data: [
      {id:'set_ck_hat',   name:'요리사 모자',   icon:'👨‍🍳',slot:'helmet', rarity:'uncommon',type:'equip',effects:{neg:12,rep:12,luk:12,int:12},  desc:'전설의 요리사의 모자. 쓰면 최고의 요리법이 머릿속에 떠오른다.'},
      {id:'set_ck_apron', name:'요리사 앞치마', icon:'🧑‍🍳',slot:'armor',  rarity:'uncommon',type:'equip',effects:{end:12,neg:12,rep:12,luk:12},   desc:'전투와 요리 모두를 위한 앞치마. 어떤 물질도 튀지 않는다.'},
      {id:'set_ck_gloves',name:'내열 장갑',     icon:'🧤',slot:'gloves', rarity:'uncommon',type:'equip',effects:{neg:12,int:12,luk:12,per:12},    desc:'어떤 온도도 견디는 장갑. 맨손으로 불을 다룰 수 있다.'},
      {id:'set_ck_knife', name:'만능 요리 칼',  icon:'🔪',slot:'weapon', rarity:'uncommon',type:'equip',effects:{str:12,crit:12,neg:12,per:12},   desc:'어떤 재료도, 어떤 적도 한 번에 써는 전설의 칼.'},
    ],
  },

  'set_bard': {
    name:'음유시인 세트', icon:'🎸', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="17" r="4"/><path d="M10.5 14.5 L18 3" /><path d="M16 6 L20 4 M17.5 8 L21 6.5" stroke-width="1.1"/></svg>`, rarity:'uncommon',
    desc:'노래로 전쟁을 끝내고 마음을 움직이는 음유시인의 장비.',
    items:['set_bd_hat','set_bd_cloak','set_bd_ring','set_bd_lute'],
    bonus: {
      2: { effects:{rep:12,neg:12},               desc:'감동의 선율. NPC 호감도 +20, 협상 성공률 +25%.' },
      4: { effects:{rep:13,neg:13,wil:12,luk:12}, desc:'전장의 시인. 노래로 아군 사기와 능력치 강화.' },
    },
    items_data: [
      {id:'set_bd_hat',   name:'음유시인 모자',  icon:'🎭',slot:'helmet', rarity:'uncommon',type:'equip',effects:{rep:12,neg:12,luk:12,per:12},  desc:'깃털 장식이 달린 모자. 모든 이의 시선을 사로잡는다.'},
      {id:'set_bd_cloak', name:'음유시인 망토',  icon:'🎸',slot:'cloak',  rarity:'uncommon',type:'equip',effects:{rep:12,neg:12,disg:12,agi:12}, desc:'화려한 망토. 무대 위에서도, 전장에서도 완벽히 어울린다.'},
      {id:'set_bd_ring',  name:'공명 반지',      icon:'💍',slot:'ring1',  rarity:'uncommon',type:'equip',effects:{rep:12,neg:12,mgc:12,luk:12},  desc:'소리를 증폭하는 반지. 노래의 마법 효과가 2배가 된다.'},
      {id:'set_bd_lute',  name:'마법 류트',      icon:'🎵',slot:'weapon', rarity:'uncommon',type:'equip',effects:{mgc:12,rep:13,neg:13,wil:12},  desc:'마법이 깃든 류트. 연주할 때마다 마법 효과가 발생한다.'},
    ],
  },

  'set_engineer': {
    name:'마법 기술자 세트', icon:'⚙️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12 M5.5 5.5 L7.5 7.5 M16.5 16.5 L18.5 18.5 M18.5 5.5 L16.5 7.5 M7.5 16.5 L5.5 18.5" stroke-width="1.2"/></svg>`, rarity:'uncommon',
    desc:'마법과 기술을 결합하여 기계를 만드는 공학자의 장비.',
    items:['set_eng_goggles','set_eng_suit','set_eng_belt','set_eng_wrench'],
    bonus: {
      2: { effects:{int:12,per:12},               desc:'기계의 눈. 모든 장치와 함정 즉시 파악.' },
      4: { effects:{int:13,per:12,luk:12,str:12}, desc:'발명의 천재. 즉석에서 기계 무기 제작 가능.' },
    },
    items_data: [
      {id:'set_eng_goggles',name:'마법 공학 고글', icon:'🥽',slot:'helmet', rarity:'uncommon',type:'equip',effects:{int:12,per:13,luk:12,mgc:12}, desc:'모든 기계와 마법 장치를 분석하는 고글. 약점이 바로 보인다.'},
      {id:'set_eng_suit',   name:'방호복',         icon:'⚙️',slot:'armor',  rarity:'uncommon',type:'equip',effects:{end:12,int:12,per:12,luk:12}, desc:'폭발과 전기에 내성을 가진 방호복. 어떤 실험도 안전하게.'},
      {id:'set_eng_belt',   name:'공구 벨트',      icon:'🔧',slot:'belt',   rarity:'uncommon',type:'equip',effects:{int:12,luk:12,per:12,str:12}, desc:'모든 공구가 들어있는 벨트. 어떤 기계도 즉석에서 수리한다.'},
      {id:'set_eng_wrench', name:'마법 렌치',      icon:'🔩',slot:'weapon', rarity:'uncommon',type:'equip',effects:{str:12,int:12,crit:12,per:12}, desc:'마법 에너지가 흐르는 렌치. 기계를 고치기도, 부수기도 한다.'},
    ],
  },

  'set_arena_champion': {
    name:'투기장 챔피언 세트', icon:'🏆', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6 L6 5 L8 10 L12 3 L16 10 L18 5 L22 6 L20 17 L4 17 Z" stroke-linejoin="round"/><path d="M4 17 L20 17 L20 20 L4 20 Z" stroke-linejoin="round"/></svg>`, rarity:'uncommon',
    desc:'수백 번의 투기장 전투를 이기고 얻은 챔피언의 장비.',
    items:['set_ac_helm','set_ac_greaves','set_ac_gauntlets','set_ac_blade'],
    bonus: {
      2: { effects:{str:12,crit:12},              desc:'챔피언의 투지. 1:1 전투에서 공격력 +25%.' },
      4: { effects:{str:14,crit:13,end:12,fear:12}, desc:'무패의 전사. 연속 전투 시 매 전투마다 공격력 +10%.' },
    },
    items_data: [
      {id:'set_ac_helm',      name:'챔피언 투구',    icon:'🏆',slot:'helmet', rarity:'uncommon',type:'equip',effects:{end:12,str:12,fear:12,crit:12},  desc:'투기장 최고 챔피언에게 수여된 투구. 쓰면 군중이 환호한다.'},
      {id:'set_ac_greaves',   name:'전투 각반',      icon:'🦵',slot:'boots',  rarity:'uncommon',type:'equip',effects:{agi:12,end:12,str:12,crit:12},  desc:'투기장 바닥을 수백 번 밟은 각반. 전진 속도가 극적으로 빨라진다.'},
      {id:'set_ac_gauntlets', name:'전투 건틀릿',    icon:'🥊',slot:'gloves', rarity:'uncommon',type:'equip',effects:{str:12,crit:13,end:12,fear:12},  desc:'수백 번의 전투로 단련된 건틀릿. 방어와 공격을 동시에 수행.'},
      {id:'set_ac_blade',     name:'투기장의 검',    icon:'⚔️',slot:'weapon', rarity:'uncommon',type:'equip',effects:{str:14,crit:13,end:12,fear:12},  desc:'투기장에서 연마된 검. 수백 명의 적을 쓰러트린 역전의 무기.'},
    ],
  },

  // ─── 메인 스토리 연동 세트 (퀘스트 보상 전용) ───────────────
  'set_seal_guardian': {
    name:'봉인석 수호자 세트', icon:'🔒', rarity:'legendary',
    desc:'봉인석을 지키던 고대 수호자의 유산. 마왕과의 결전을 끝낸 자에게만 주어진다.',
    items:['set_seal_helm','set_seal_armor','set_seal_shield','set_seal_ring','set_seal_necklace','set_seal_boots'],
    bonus:{
      2:{ effects:{def:15}, desc:'봉인석 복원 속도 +30%' },
      4:{ effects:{hp:50,def:20}, desc:'봉인석 파괴 시 피해 -50%' },
      6:{ effects:{hp:100,def:30,atk:20}, desc:'진 엔딩 전용 스킬 "봉인의 권능" 해방', specialSkill:'봉인의 권능' },
    },
    items_data:[
      {id:'set_seal_helm',     name:'봉인 수호의 투구',  icon:'🔒',slot:'helmet',   rarity:'legendary',type:'equip',effects:{def:8,hp:15},  desc:'봉인석의 힘을 나눠 받은 투구.'},
      {id:'set_seal_armor',    name:'봉인 수호의 갑옷',  icon:'🔒',slot:'armor',    rarity:'legendary',type:'equip',effects:{def:12,hp:20}, desc:'봉인석 파편이 박힌 갑옷. 마계 에너지를 막아낸다.'},
      {id:'set_seal_shield',   name:'봉인 수호의 방패',  icon:'🛡️',slot:'subweapon',rarity:'legendary',type:'equip',effects:{def:15,hp:10}, desc:'봉인의 문양이 새겨진 방패.'},
      {id:'set_seal_ring',     name:'봉인 수호의 반지',  icon:'💍',slot:'ring1',    rarity:'legendary',type:'equip',effects:{def:6,mgc:8},  desc:'봉인석과 공명하는 반지.'},
      {id:'set_seal_necklace', name:'봉인 수호의 목걸이',icon:'📿',slot:'necklace', rarity:'legendary',type:'equip',effects:{def:6,wil:8},  desc:'봉인석의 안정을 돕는 목걸이.'},
      {id:'set_seal_boots',    name:'봉인 수호의 장화',  icon:'👢',slot:'boots',    rarity:'legendary',type:'equip',effects:{def:8,agi:6},  desc:'봉인의 영역을 조용히 지키는 장화.'},
    ],
  },
  'set_shadow_lord': {
    name:'어둠 군주 세트', icon:'🌑', rarity:'rare',
    desc:'그림자 군주의 유산. 도적 길드의 진실을 파헤친 자에게 주어진다.',
    items:['set_shdlord_robe','set_shdlord_staff','set_shdlord_ring','set_shdlord_necklace'],
    bonus:{
      2:{ effects:{atk:10}, desc:'언데드·환령 소환수 ATK +25%' },
      4:{ effects:{atk:20,hp:30}, desc:'소환수 진화 비용 절감, 사령 군주 소환 가능' },
    },
    items_data:[
      {id:'set_shdlord_robe',     name:'어둠 군주의 로브',  icon:'🌑',slot:'armor',   rarity:'rare',type:'equip',effects:{mgc:10,neg:8},  desc:'그림자 군주가 입던 로브. 어둠이 스며 있다.'},
      {id:'set_shdlord_staff',    name:'어둠 군주의 지팡이',icon:'🪄',slot:'weapon',  rarity:'rare',type:'equip',effects:{mgc:14,atk:6}, desc:'사령술이 깃든 지팡이.'},
      {id:'set_shdlord_ring',     name:'어둠 군주의 반지',  icon:'💍',slot:'ring1',   rarity:'rare',type:'equip',effects:{mgc:8,neg:5},  desc:'결사의 인장이 새겨진 반지.'},
      {id:'set_shdlord_necklace', name:'어둠 군주의 목걸이',icon:'📿',slot:'necklace',rarity:'rare',type:'equip',effects:{hp:15,neg:5},  desc:'죽음의 기운을 다스리는 목걸이.'},
    ],
  },
  'set_world_tree': {
    name:'세계수 수호자 세트', icon:'🌳', rarity:'legendary',
    desc:'세계수 실라리엘의 신뢰를 얻은 자에게 주어지는 유산.',
    items:['set_wtree_armor','set_wtree_staff','set_wtree_crown'],
    bonus:{
      2:{ effects:{hp:30}, desc:'정령·원소 정령 소환수 HP +30%, 세계수 에너지 공명' },
      3:{ effects:{hp:60,def:15}, desc:'봉인석 복원 시 HP 전체 회복, 실라리엘 신뢰도 자동 상승', specialSkill:'세계수의 축복' },
    },
    items_data:[
      {id:'set_wtree_armor', name:'세계수 잎사귀 갑옷', icon:'🌿',slot:'armor', rarity:'legendary',type:'equip',effects:{hp:20,wil:10}, desc:'세계수의 잎으로 엮은 갑옷. 생명력이 흐른다.'},
      {id:'set_wtree_staff', name:'세계수 뿌리 지팡이', icon:'🪄',slot:'weapon',rarity:'legendary',type:'equip',effects:{mgc:14,wil:10}, desc:'세계수의 뿌리를 깎아 만든 지팡이.'},
      {id:'set_wtree_crown', name:'세계수 꽃 왕관',    icon:'👑',slot:'helmet',rarity:'legendary',type:'equip',effects:{wil:14,per:10}, desc:'세계수의 꽃으로 엮은 왕관. 자연과 공명한다.'},
    ],
  },
  'set_dragon_lord': {
    name:'용군주 세트', icon:'🐉', rarity:'legendary',
    desc:'용염 제국 내전을 끝낸 자에게 고룡이 하사하는 유산.',
    items:['set_drlord_armor','set_drlord_claw','set_drlord_eye','set_drlord_crown'],
    bonus:{
      2:{ effects:{atk:15}, desc:'용 소환수 능력 +30%, 용염 속성 공격 +20%' },
      4:{ effects:{atk:30,hp:50}, desc:'고룡급 소환수 계약 가능, 용염 제국 특별 취급', specialSkill:'용왕의 권위' },
    },
    items_data:[
      {id:'set_drlord_armor', name:'용군주의 비늘갑옷', icon:'🐉',slot:'armor', rarity:'legendary',type:'equip',effects:{def:14,end:10}, desc:'고룡의 비늘로 엮은 갑옷.'},
      {id:'set_drlord_claw',  name:'용군주의 발톱',    icon:'🗡️',slot:'weapon',rarity:'legendary',type:'equip',effects:{str:16,crit:10}, desc:'고룡의 발톱으로 벼린 무기.'},
      {id:'set_drlord_eye',   name:'용군주의 안구',    icon:'👁️',slot:'accessory',rarity:'legendary',type:'equip',effects:{per:12,mgc:8}, desc:'고룡의 눈을 담은 장신구. 화염을 꿰뚫어 본다.'},
      {id:'set_drlord_crown', name:'용군주의 관',      icon:'👑',slot:'helmet',rarity:'legendary',type:'equip',effects:{fear:14,str:8}, desc:'고룡의 위엄이 서린 관.'},
    ],
  },
  'set_abyss_apostle': {
    name:'심연 사도 세트', icon:'😈', rarity:'legendary',
    desc:'아스모데우스와 대면하고 살아남은 자에게 남겨지는 유산.',
    items:['set_abyss_robe','set_abyss_seal','set_abyss_mask'],
    bonus:{
      2:{ effects:{atk:10}, desc:'악마 소환수 충성도 자동 +10, 심연 결사 비밀 접촉 가능' },
      3:{ effects:{atk:25,hp:20}, desc:'아스모데우스와 특별 대화 해방, 심연 봉인석 접근 가능', specialSkill:'심연의 계약' },
    },
    items_data:[
      {id:'set_abyss_robe', name:'심연 사도의 법의', icon:'😈',slot:'armor',     rarity:'legendary',type:'equip',effects:{neg:12,mgc:10}, desc:'심연 결사의 사도가 입던 법의.'},
      {id:'set_abyss_seal', name:'심연 사도의 인장', icon:'📜',slot:'ring1',     rarity:'legendary',type:'equip',effects:{neg:10,cha:8},  desc:'아스모데우스의 인장이 찍힌 반지.'},
      {id:'set_abyss_mask', name:'심연 사도의 안면구',icon:'🎭',slot:'accessory',rarity:'legendary',type:'equip',effects:{fear:12,per:8}, desc:'심연을 들여다본 자만이 쓸 수 있는 안면구.'},
    ],
  },

};

export const SET_BONUS_KEY = 'tf-set-bonus';

export function loadSetBonuses(){ try{ return JSON.parse(lsGet(SET_BONUS_KEY)||'{}'); }catch(e){ return {}; } }
window.loadSetBonuses = loadSetBonuses;

export function saveSetBonuses(d){ try{ lsSet(SET_BONUS_KEY, JSON.stringify(d)); }catch(e){} }
window.saveSetBonuses = saveSetBonuses;

export function getAllSetItems(){
  const result = [];
  Object.entries(SET_DEFS).forEach(([setId, set])=>{
    (set.items_data||[]).forEach(item=>{
      result.push({...item, _setId:setId, _setName:set.name});
    });
  });
  return result;
}
window.getAllSetItems = getAllSetItems;

export function calcSetBonus(){
  if(!S.equipped) return {};
  const equippedIds = Object.values(S.equipped)
    .filter(Boolean).map(it=>it.id);

  const bonusStats = {};
  const activeSetBonus = {};

  Object.entries(SET_DEFS).forEach(([setId, set])=>{
    const matchCount = set.items.filter(id=>equippedIds.includes(id)).length;
    if(matchCount < 2) return;

    activeSetBonus[setId] = { name:set.name, icon:set.icon, svgIcon:set.svgIcon, count:matchCount, total:set.items.length, bonuses:[] };

    // 달성한 모든 단계 보너스 적용
    Object.entries(set.bonus).forEach(([req, bonus])=>{
      if(matchCount >= parseInt(req)){
        activeSetBonus[setId].bonuses.push({ req:parseInt(req), desc:bonus.desc });
        Object.entries(bonus.effects||{}).forEach(([k,v])=>{
          bonusStats[k] = (bonusStats[k]||0) + v;
        });
      }
    });
  });

  return { bonusStats, activeSetBonus };
}
window.calcSetBonus = calcSetBonus;

export function applySetBonus(){
  const prev = loadSetBonuses();
  // 이전 보너스 제거
  Object.entries(prev).forEach(([k,v])=>{
    if(S.stats[k]!==undefined) S.stats[k]=Math.max(0,S.stats[k]-v);
  });

  const {bonusStats, activeSetBonus} = calcSetBonus();
  // 새 보너스 적용
  Object.entries(bonusStats).forEach(([k,v])=>{
    if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,S.stats[k]+v);
  });
  saveSetBonuses(bonusStats);
  // [B67 FIX] 도전 과제 "세트 수집가"(sets_completed)가 어디서도
  // updateChallenge()로 갱신되지 않던 버그. 세트를 전부(모든 부위) 갖춘
  // 경우를 완성으로 집계한다.
  if(typeof updateChallenge==='function' && activeSetBonus){
    const _completedSets = Object.values(activeSetBonus).filter(s=>s.count>=s.total).length;
    if(_completedSets>0) updateChallenge('sets_completed', _completedSets);
  }
  window.updateHeader();
}
window.applySetBonus = applySetBonus;

export function renderSetBonusPanel(){
  const {activeSetBonus} = calcSetBonus();
  const body = document.getElementById('pb-setbonus');
  if(!body) return;

  const activeEntries = Object.entries(activeSetBonus);
  if(!activeEntries.length){
    body.innerHTML = `
      <div style="text-align:center;padding:20px;color:var(--dim);font-size:11px">
        활성화된 세트 보너스가 없습니다.<br><br>
        같은 세트 아이템을 2개 이상 장착하면 보너스가 활성화됩니다.
      </div>
      ${renderAllSetsPreview()}`;
    return;
  }

  body.innerHTML = activeEntries.map(([setId, info])=>{
    const set = SET_DEFS[setId];
    const rc = {uncommon:'#4a9a6a',rare:'#4a6fa5',legendary:'#c8a96e'}[set.rarity]||'#8a9a8a';
    return `
      <div style="padding:12px;background:#0d0800;border:2px solid ${rc};margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="color:${rc};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(info,{size:16}):(info.svgIcon||info.icon)}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:12px;color:${rc}">${esc(info.name)}</div>
            <div style="font-size:10px;color:var(--dim)">${info.count}/${info.total}개 장착</div>
          </div>
          <div style="font-size:9px;font-family:'Cinzel',serif;color:${rc}">${set.rarity}</div>
        </div>
        <!-- 진행 바 -->
        <div style="display:flex;gap:3px;margin-bottom:8px">
          ${set.items.map(id=>{
            const equipped = Object.values(S.equipped||{}).filter(Boolean).some(it=>it.id===id);
            const partItem = typeof findSetItem==='function' ? findSetItem(id) : null;
            const partName = partItem ? partItem.name : id;
            return `<div title="${esc(partName)}${equipped?' (장착중)':' (미보유)'}" style="flex:1;height:5px;background:${equipped?rc:'#2a1a05'};border-radius:2px"></div>`;
          }).join('')}
        </div>
        <!-- 보너스 단계 -->
        ${Object.entries(set.bonus).map(([req, bonus])=>{
          const active = info.count >= parseInt(req);
          return `<div style="padding:5px 8px;background:${active?'#1a2a0a':'#0a0800'};border:1px solid ${active?'#3a5a2a':'#1a1005'};margin-bottom:3px;border-radius:2px">
            <span style="font-size:9px;color:${active?'#60a060':'#3a2a0a'};">${active?'✅':'○'} ${req}세트: ${esc(bonus.desc)}</span>
          </div>`;
        }).join('')}
      </div>`;
  }).join('') + renderAllSetsPreview();
}
window.renderSetBonusPanel = renderSetBonusPanel;

export function renderAllSetsPreview(){
  return `
    <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin:12px 0 8px;letter-spacing:1px">── 전체 세트 목록 ──</div>
    ${Object.entries(SET_DEFS).map(([setId, set])=>{
      const rc = {uncommon:'#4a9a6a',rare:'#4a6fa5',legendary:'#c8a96e'}[set.rarity]||'#8a9a8a';
      const equippedCount = set.items.filter(id=>Object.values(S.equipped||{}).filter(Boolean).some(it=>it.id===id)).length;
      return `<div style="padding:8px 10px;background:#0d0800;border:1px solid ${rc}44;margin-bottom:4px;display:flex;align-items:center;gap:8px">
        <span style="font-size:16px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(set,{size:16}):(set.icon)}</span>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:${rc}">${esc(set.name)}</div>
          <div style="font-size:9px;color:var(--dim)">${esc(set.desc.length > 40 ? set.desc.slice(0,40)+'...' : set.desc)}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:9px;color:var(--dim)">${equippedCount}/${set.items.length}</div>
          <div style="font-size:8px;color:${rc}">${set.rarity}</div>
        </div>
      </div>`;
    }).join('')}`;
}
window.renderAllSetsPreview = renderAllSetsPreview;

export function getItemsBySlot(slot, rarity=null){
  const pool = ITEM_POOL[slot] || ITEM_POOL.trinket;
  if(rarity) return pool.filter(it=>it.rarity===rarity);
  return pool;
}
window.getItemsBySlot = getItemsBySlot;

export function generateItem(slot=null, rarityOverride=null){
  // 슬롯 랜덤 선택
  const slots = ['weapon','subweapon','helmet','armor','gloves','boots','cloak','necklace','ring','belt','trinket'];
  const targetSlot = slot || slots[Math.floor(Math.random()*slots.length)];

  // 희귀도 가중 랜덤
  const rarity = rarityOverride || (() => {
    const r = Math.random();
    if(r < 0.40) return 'common';
    if(r < 0.70) return 'uncommon';
    if(r < 0.90) return 'rare';
    return 'legendary';
  })();

  const pool = getItemsBySlot(targetSlot, rarity);
  const fallback = getItemsBySlot(targetSlot);
  const list = pool.length ? pool : fallback;
  if(!list.length) return null;
  const base = {...list[Math.floor(Math.random()*list.length)]};
  // slot 보정
  if(!base.slot) base.slot = targetSlot;
  if(!base.type) base.type = 'equip';
  return base;
}
window.generateItem = generateItem;

// [변경] 예전엔 여기서 직접 Gemini를 호출했다. 이제는 items/007에서
// 이미 만들어둔 로컬(AI 미사용) 아이템 생성 엔진(window.generateLocalItem)을
// 그대로 재사용한다 — 슬롯×희귀도 조합으로 이름/능력치/설명/배경까지
// 매번 다르게 조합해주는 엔진이라 이 파일에 따로 콘텐츠를 또 만들
// 필요가 없다. (정적 import로 연결하면 006↔007 순환 참조가 생기므로,
// 이 코드베이스 전반에서 이미 쓰이는 방식대로 window 전역을 통해 연결한다.)
export function generateAIItem(context='', slotHint=null){
  const slot = slotHint || ['weapon','armor','necklace','ring','trinket'][Math.floor(Math.random()*5)];

  // context는 매번 다른 구체적 상황 문구라 그대로는 버킷 키로 못 쓴다 —
  // slot·세계관·직업·종족·레벨밴드만으로 버킷을 만든다.
  const era = S.scenario?.era||'중세 판타지';
  const job = S.character?.role||'모험가';
  const race = S.character?.race||'인간';
  const level = loadPlayerLevel()||1;
  const lvBand = Math.floor(level/10);
  const aiItemBucketKey = 'aiitem|'+slot+'|'+era+'|'+job+'|'+race+'|'+lvBand;
  const reusedItem = pickGeneratedObject(aiItemBucketKey);
  if(reusedItem){
    return { ...reusedItem, id:'ai_item_'+Date.now()+'_'+Math.random().toString(36).slice(2,7), _aiGenerated:true, reusedFromLearning:true };
  }

  const rarityRoll = Math.random();
  const rarity = rarityRoll<0.30 ? 'common' : rarityRoll<0.65 ? 'uncommon' : rarityRoll<0.90 ? 'rare' : 'legendary';
  // items/007의 명사/아이콘 뱅크는 slot 키로 'ring1'/'ring2'를 쓰는데
  // 이 파일은 'ring'을 쓴다 — 콘텐츠 조회용으로만 매핑하고, 반환하는
  // item.slot은 호출부 호환을 위해 원래 요청받은 값을 그대로 유지한다.
  const contentSlot = slot==='ring' ? 'ring1' : slot;
  const item = (typeof window.generateLocalItem==='function')
    ? { ...window.generateLocalItem({job, race, era}, contentSlot, rarity), slot }
    : { ...generateItem(contentSlot, rarity), slot };
  if(!item || !item.name || !item.slot) return null;
  item._aiGenerated = true;
  recordGeneratedObject(aiItemBucketKey, { name:item.name, icon:item.icon, rarity:item.rarity, slot:item.slot, type:'equip', effects:item.effects, desc:item.desc, lore:item.lore });
  return item;
}
window.generateAIItem = generateAIItem;
