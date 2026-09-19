// 직업 시스템 (무한 파생 + 도감)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { _addTimelineOnJob, addTimelineEvent } from '../combat/188-UI-1-타임라인-전투로그-데이터-시스템.js';
import { BASE_JOBS, MAIN_QUESTS, NPC_HEROES, SECRET_ENDINGS, WORLD_EVENTS } from '../data/042-직업-시스템-무한-파생-도감.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RACE_DEFS } from '../race/013-종족-시스템.js';
import { getAllSetItems } from '../items/006-세트-아이템-시스템.js';
import { saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { dramaticJobChange } from '../items/074-파트2-B-성장-연출-강화.js';
import { _markDirty, loadNPCs, saveNPCs, saveStatsSplit } from '../misc/001-block0-preamble.js';
import { loadJobSkills, saveJobSkills } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { loadPermStatBonus } from '../misc/015-시스템-1120.js';
import { loadLocations, loadOwnedRelics, loadParty } from '../misc/054-이동수단-시스템.js';
import { saveDiaryEntry } from '../misc/076-파트2-D-일기기록-시스템.js';
import { loadEvolution } from '../misc/206-3-진화Evolution-시스템.js';
import { loadStats, saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { loadWatcherGaze } from '../progression/018-5170번-환생-누적-시스템.js';
import { inheritVillainPower, loadSakuraData } from '../progression/019-71100번-환생-누적-시스템.js';
import { loadAnnals } from '../progression/037-NEW-회차-연보-엔딩-히스토리-갤러리.js';
import { unlockAchievement } from '../progression/187-2-업적-시스템.js';
import { loadHiddenQuests } from '../quest/039-NEW-히든-퀘스트-시스템.js';
import { callGeminiDirect } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { recordMarkovSample, showGameOver, triggerStoryEnding, updateCharHeader } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { loadJobTurns, renderMasteryInfo, showJobSuggestionPopup } from '../race/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadGSFlags, loadWorldDB, saveGSFlags } from '../world/145-⑥-세계-상태-DB.js';
import { loadSkills, saveSkillSP, saveSkills } from './002-스킬-시스템.js';
import { loadTitles } from './010-스킬-강화-시스템.js';
import { HIDDEN_JOBS } from './029-숨겨진-직업-시스템.js';

export const TIER2_JOBS = [

  // ══ 전사 파생 (7종) ══
  {id:'paladin', name:'성기사', icon:'⚔️✨', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 2 L13.5 8.5 L20 7 L15 12 L18 18.5 L12 15 L6 18.5 L9 12 L4 7 L10.5 8.5 Z" stroke-linejoin="round"/></g></svg>`, category:'combat', parentId:'warrior', tier:2,
   desc:'신앙과 검술을 결합한 성스러운 전사.',
   lore:'칼집을 신전 제단 위에 올려놓고 서약하는 날, 전사는 성기사가 된다. 신의 빛이 갑옷에 깃들고, 타격 하나하나에 기도가 실린다. 전장에서 가장 빛나는 존재지만, 그 빛이 오만으로 변하는 순간 신성력은 스러진다. 성기사에게 가장 어려운 시험은 강한 적이 아니라 — 올바른 이유로 칼을 뽑는 일이다.',
   statFocus:['str','fath'], howToGet:'⚔️ 근력 60·신앙심 60 + 📜 퀘스트 「성전의 서약」 완료 + 치유 10회',
   conditionHint:'대성당이나 신전에서 "성전의 서약" 퀘스트를 완수하면 성기사의 길이 열린다.',
   unlockCondition:{type:'stat_action', minStr:60, minFaith:60, minHealCount:10, requireQuest:'성전의 서약', desc:'근력 60·신앙심 60·치유 10회·퀘스트 완료'},
   skills:[
     {id:'job_pal_smite',  name:'신성 강타',   icon:'⚡', type:'active',  desc:'신성 피해를 입히고 아군을 소량 치유.', mpCost:18, rarity:'uncommon', hpRestore:8,
       effects:{ kind:'damage', statSource:{str:0.6,fath:0.4}, damageMult:0.75, element:'light' }},
     {id:'job_pal_aura',   name:'수호의 오라', icon:'💛', type:'passive', desc:'아군 HP+5/턴. 적 공포 효과 저항.', mpCost:0, rarity:'uncommon'},
     {id:'job_pal_judge',  name:'심판의 빛',   icon:'☀️', type:'active',  desc:'[신성 강타 선행] 광역 신성 피해. 악한 자에게 2배 피해.', mpCost:28, rarity:'rare', prereq:'job_pal_smite',
       effects:{ kind:'damage', statSource:{str:0.5,fath:0.5}, damageMult:1.1, hits:2, element:'light' }},
     {id:'job_pal_oath',   name:'불굴의 서약', icon:'🛐', type:'passive', desc:'[수호의 오라 선행] FATH+12. HP 30% 이하 시 1회 즉사 방지.', mpCost:0, rarity:'rare', prereq:'job_pal_aura'},
   ]},
  {id:'berserker', name:'광전사', icon:'🔥⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, category:'combat', parentId:'warrior', tier:2,
   desc:'분노를 힘으로 바꾸는 전투 특화 전사.',
   lore:'광전사의 힘은 고통에서 피어난다. 두 번 죽을 뻔한 자리에서 무언가가 끊어지고, 그 끊어진 자리에서 불꽃이 솟는다. 그들은 전투 중 두려움을 모르지만, 전투가 끝난 후 무엇을 했는지 기억하지 못하는 경우도 있다. 동료들은 광전사의 옆에 서는 것을 두려워하면서도, 그들이 먼저 무너지지 않는 한 전선이 무너지지 않는다는 사실을 안다.',
   statFocus:['str','end'], howToGet:'⚰️ 전투 사망 2회 + 💥 대성공 10회 + 🎒 아이템 「분노의 인장」 보유',
   conditionHint:'죽음 직전까지 몰렸다가 기적적으로 살아남은 뒤, 분노의 인장을 손에 넣어야 한다. 인장은 전투 상점이나 광전사의 시체에서 발견된다.',
   unlockCondition:{type:'death_crit', minDeaths:2, minCritSuccess:10, requireItem:'분노의 인장', desc:'사망 2회·대성공 10회·분노의 인장 보유'},
   skills:[
     {id:'job_bsrk_rage',  name:'분노 해방',   icon:'💢', type:'active',  desc:'HP 15 소모. STR+40 (3턴). 고통 무시.', mpCost:0, rarity:'uncommon', hpCost:15,
       effects:{ kind:'buff', statMod:{str:40}, duration:3 }},
     {id:'job_bsrk_blood', name:'피의 갈망',   icon:'🩸', type:'passive', desc:'HP 낮을수록 STR 최대+30.', mpCost:0, rarity:'uncommon'},
     {id:'job_bsrk_frenzy',name:'광란의 질주', icon:'🌪️', type:'active',  desc:'[분노 해방 선행] 연속 3회 공격. 매 타격마다 HP 5 소모.', mpCost:10, rarity:'rare', prereq:'job_bsrk_rage',
       effects:{ kind:'damage', statSource:{str:1}, damageMult:0.6, hits:3, element:'physical' }},
     {id:'job_bsrk_scar',  name:'상흔의 갑주', icon:'🩹', type:'passive', desc:'[피의 갈망 선행] END+15. 받은 피해의 10%를 다음 공격에 전가.', mpCost:0, rarity:'rare', prereq:'job_bsrk_blood'},
   ]},
  {id:'swordmaster', name:'검성', icon:'🗡️⚡', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g><g transform="translate(6,6) scale(0.62)"><path d="M13 2 L6 13 L11 13 L10 22 L18 10 L13 10 Z" stroke-linejoin="round"/></g></svg>`, category:'combat', parentId:'warrior', tier:2,
   desc:'검술의 극한을 추구하는 무인.',
   lore:'검성은 태어나지 않는다 — 만들어진다. 수만 번의 반복이 근육에 새겨지고, 그 너머에서 비로소 고요가 온다. 검을 잡지 않아도 검을 느끼고, 적의 칼이 빠져나가기 전에 이미 결말을 아는 경지. 검성은 싸우러 오지 않는다. 이미 싸움이 끝난 후에 서 있을 뿐이다. 세간에는 "진짜 검성은 검을 뽑지 않는다"는 말이 전해진다.',
   statFocus:['str','agi'], howToGet:'⚡ 근력 80 + 📜 퀘스트 「검성의 시험」 완료',
   conditionHint:'전설의 검 도장을 찾아 마스터의 시험에 도전하라. 시험은 3번 연속 도전에 성공해야 완료된다.',
   unlockCondition:{type:'stat_turn', minStr:80, requireQuest:'검성의 시험', desc:'근력 80·퀘스트 완료'},
   skills:[
     {id:'job_sword_flash', name:'섬광검',    icon:'⚡', type:'active',  desc:'빛의 속도로 베기. 회피 불가.', mpCost:22, rarity:'rare',
       effects:{ kind:'damage', statSource:{str:0.5,agi:0.5}, damageMult:0.9, element:'physical' }},
     {id:'job_sword_read',  name:'검기 감지', icon:'👁️', type:'passive', desc:'적 공격 예측. 회피+20.', mpCost:0, rarity:'rare'},
     {id:'job_sword_void',  name:'무형검',    icon:'🌀', type:'active',  desc:'[섬광검 선행] 궁극기. 단 일격으로 승부를 가른다. 치명타 확정.', mpCost:40, rarity:'legendary', prereq:'job_sword_flash',
       effects:{ kind:'damage', statSource:{str:0.5,agi:0.5}, damageMult:1.6, element:'physical' }},
     {id:'job_sword_still', name:'부동심',    icon:'🧘', type:'passive', desc:'[검기 감지 선행] AGI+15. 공포·혼란 완전 면역.', mpCost:0, rarity:'legendary', prereq:'job_sword_read'},
   ]},
  {id:'warlord', name:'전쟁군주', icon:'🏰⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M4 21 L4 9 L6 9 L6 7 L8 7 L8 9 L10.5 9 L10.5 6 L13.5 6 L13.5 9 L16 9 L16 7 L18 7 L18 9 L20 9 L20 21 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, category:'combat', parentId:'warrior', tier:2,
   desc:'전장을 지휘하며 아군을 이끄는 카리스마의 화신.',
   lore:'전쟁군주의 무기는 칼만이 아니다. 목소리, 눈빛, 그리고 적이 보는 앞에서도 흔들리지 않는 등판 — 이 모든 것이 무기다. 병사들은 전쟁군주 뒤에서 두 배의 용기를 낸다. 전쟁에서 이기는 것보다 병사들이 살아 돌아오게 하는 것이 더 어렵다는 사실을 아는 자만이 진정한 전쟁군주가 될 수 있다. 역사는 전쟁군주를 영웅으로도, 학살자로도 기록한다.',
   statFocus:['str','ldr'], howToGet:'👑 리더십 70 + ⚔️ 전투 승리 15회 + 🏰 세력 「왕국 기사단」 가입',
   conditionHint:'왕국 기사단에 가입하여 충분한 공을 세우면 전쟁군주의 칭호가 내려진다. 가입 없이는 아무리 강해도 인정받지 못한다.',
   unlockCondition:{type:'stat_action', minLdr:70, minBattleWins:15, requireFaction:'왕국 기사단', desc:'리더십 70·전투 승리 15회·기사단 가입'},
   skills:[
     {id:'job_wlrd_command', name:'전투 명령',    icon:'📯', type:'active',  desc:'아군 전체 STR+20·AGI+15 (3턴). 사기 극상.', mpCost:20, rarity:'rare',
       effects:{ kind:'buff', statMod:{str:20,agi:15}, duration:3 }},
     {id:'job_wlrd_rally',   name:'군주의 위엄', icon:'👑', type:'passive', desc:'LDR+12. 아군 첫 사망 1회 무효.', mpCost:0, rarity:'rare'},
     {id:'job_wlrd_charge',  name:'총공격 명령', icon:'⚔️', type:'active',  desc:'[전투 명령 선행] 아군 전체 즉시 추가 공격 1회 실행.', mpCost:32, rarity:'legendary', prereq:'job_wlrd_command',
       effects:{ kind:'damage', statSource:{str:0.6,ldr:0.4}, damageMult:1.1, element:'physical' }},
     {id:'job_wlrd_legacy',  name:'불멸의 이름', icon:'📜', type:'passive', desc:'[군주의 위엄 선행] LDR+10. 쓰러진 아군이 부활할 확률+15%.', mpCost:0, rarity:'legendary', prereq:'job_wlrd_rally'},
   ]},
  {id:'dragoon', name:'용기사', icon:'🐉⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/><path d="M8 6 L6.5 3 M8 6 L9.5 3.5" stroke-width="1.2"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, category:'combat', parentId:'warrior', tier:2,
   desc:'용의 힘을 몸에 깃들여 싸우는 전설의 창기사.',
   lore:'용기사는 용의 심장과 눈을 마주친 자에게서 시작된다. 그 눈빛을 견디고 살아남은 자의 혈관에는 아주 희미하게 용의 불꽃이 흐른다. 그들의 창 끝에서는 때로 불꽃이 일고, 추락하는 순간에도 두려움 대신 비상의 본능이 솟는다. 용기사는 하늘과 땅 사이 어딘가에 속한 존재로, 어느 쪽도 그들의 완전한 고향이 아니다.',
   statFocus:['str','end'], howToGet:'🐉 용 관련 조우 3회 + 💪 근력 75 + 🎒 아이템 「용의 비늘」 보유 + 🗺️ 「용의 둥지」 방문',
   conditionHint:'살아있는 용을 찾아 둥지에 가라. 그리고 그 비늘을 바쳐야만 용기사의 계약이 성립된다. 비늘은 무력으로도, 협상으로도 얻을 수 있다.',
   unlockCondition:{type:'stat_action', minStr:75, requireItem:'용의 비늘', requireLocation:'용의 둥지', desc:'근력 75·용의 비늘 보유·용의 둥지 방문'},
   skills:[
     {id:'job_drg_jump',   name:'용기사 강하', icon:'🐉', type:'active',  desc:'하늘에서 급강하. 범위 내 전체 타격.', mpCost:25, rarity:'rare',
       effects:{ kind:'damage', statSource:{str:1}, damageMult:0.85, element:'physical' }},
     {id:'job_drg_scale',  name:'용린 각성',  icon:'🔥', type:'passive', desc:'END+10. 화염·독 피해 50% 감소.', mpCost:0, rarity:'uncommon'},
     {id:'job_drg_breath', name:'용의 숨결',  icon:'💨', type:'active',  desc:'[용기사 강하 선행] 전방 화염 브레스. 넓은 범위 지속 피해.', mpCost:30, rarity:'legendary', prereq:'job_drg_jump',
       effects:{ kind:'damage', statSource:{str:0.5,mgc:0.5}, damageMult:1.05, hits:2, element:'fire' }},
     {id:'job_drg_wing',   name:'용익 비행',  icon:'🪽', type:'passive', desc:'[용린 각성 선행] STR+12. 회피율+15. 낙하 피해 완전 무효.', mpCost:0, rarity:'rare', prereq:'job_drg_scale'},
   ]},
  {id:'guardian', name:'수호전사', icon:'🛡️⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 3 L19 6 L19 12 C19 17 15.5 20 12 21.5 C8.5 20 5 17 5 12 L5 6 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, category:'combat', parentId:'warrior', tier:2,
   desc:'동료를 위해 모든 공격을 받아내는 철벽의 수호자.',
   lore:'수호전사는 자신을 위해 싸우지 않는다. 지켜야 할 얼굴이 있기에 방패를 든다. 적의 칼이 등 뒤에서 날아오면 그들은 앞으로 나서지 않고 뒤를 돈다. 그 목 위로 상처가 쌓이고 갑옷에 흠이 늘수록, 수호전사의 눈빛은 더 고요해진다. "내가 서 있는 한 이 선은 넘지 못한다" — 이것이 수호전사의 유일한 서약이다.',
   statFocus:['end','wil'], howToGet:'전사로 아군 보호 행동 10회 + 체력 90',
   unlockCondition:{type:'stat_action', minEnd:90, minProtectCount:10, desc:'체력 90·아군 보호 10회'},
   skills:[
     {id:'job_grd_taunt',  name:'도발',       icon:'🛡️', type:'active',  desc:'적 모든 공격을 자신에게 집중. 피해 30% 감소.', mpCost:12, rarity:'uncommon',
       effects:{ kind:'statBoost', statMod:{end:10} }},
     {id:'job_grd_fort',   name:'철벽 수호',  icon:'💪', type:'passive', desc:'END+15. 아군이 치명타를 받을 때 대신 흡수.', mpCost:0, rarity:'rare'},
     {id:'job_grd_wall',   name:'인간 방벽',  icon:'🧱', type:'active',  desc:'[도발 선행] 3턴간 아군 전체가 받는 피해를 자신에게 흡수.', mpCost:26, rarity:'legendary', prereq:'job_grd_taunt',
       effects:{ kind:'buff', statMod:{end:22}, duration:3 }},
     {id:'job_grd_will',   name:'불굴의 의지',icon:'🔥', type:'passive', desc:'[철벽 수호 선행] WIL+15. HP 0 도달 시 1턴간 쓰러지지 않음.', mpCost:0, rarity:'legendary', prereq:'job_grd_fort'},
   ]},
  {id:'gladiator', name:'투기사', icon:'🥊⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="9" cy="12" r="4.5" stroke-linejoin="round"/><path d="M13.5 12 L20 12 M17 9 L20 12 L17 15" stroke-width="1.2"/></g><g transform="translate(6,6) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g></svg>`, category:'combat', parentId:'warrior', tier:2,
   desc:'맨몸 격투와 무기를 동시에 다루는 투기장의 영웅.',
   lore:'투기장의 모래는 피를 잘 숨긴다. 투기사들은 그 모래 위에서 태어나고, 그 위에서 이름을 얻는다. 무기가 꺾이면 맨손으로, 맨손이 묶이면 이빨로라도 싸운다는 정신 — 그것이 투기사를 다른 전사들과 구별한다. 관중은 그들을 오락거리로 보지만, 살아남은 투기사는 가장 순수한 형태의 전사다. 규칙도 명예도 없는 싸움에서 살아남는 법을 아는 자.',
   statFocus:['str','agi'], howToGet:'전사로 무기 없이 전투 5회 + 근력 70',
   unlockCondition:{type:'stat_action', minStr:70, minUnarmedCount:5, desc:'근력 70·맨손 전투 5회'},
   skills:[
     {id:'job_gld_crush',  name:'분쇄 일격',  icon:'🥊', type:'active',  desc:'맨손·무기 연계 타격. 방어력 무시 30%.', mpCost:15, rarity:'uncommon',
       effects:{ kind:'damage', statSource:{str:1}, damageMult:0.65, element:'physical' }},
     {id:'job_gld_adapt',  name:'투사의 본능',icon:'💥', type:'passive', desc:'STR+10·AGI+8. 전투 중 피해 받을수록 반격력 상승.', mpCost:0, rarity:'uncommon'},
     {id:'job_gld_combo',  name:'연타 콤보',  icon:'👊', type:'active',  desc:'[분쇄 일격 선행] 5연타 콤보. 마지막 타격 치명타 확정.', mpCost:24, rarity:'rare', prereq:'job_gld_crush',
       effects:{ kind:'damage', statSource:{str:0.6,agi:0.4}, damageMult:0.35, hits:5, element:'physical' }},
     {id:'job_gld_crowd',  name:'관중의 함성',icon:'📣', type:'passive', desc:'[투사의 본능 선행] AGI+12. 연승할수록 모든 판정+2% 누적(최대+20%).', mpCost:0, rarity:'rare', prereq:'job_gld_adapt'},
   ]},

  // ══ 마법사 파생 (7종) ══
  {id:'warlock', name:'흑마법사', icon:'💀🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></g></svg>`, category:'magic', parentId:'mage', tier:2,
   desc:'금지된 마법을 다루는 어둠의 술사.',
   lore:'탑의 금서고에는 한 번 펼치면 돌아올 수 없다는 책들이 있다. 흑마법사는 그 책을 끝까지 읽은 자들이다. 처음에는 호기심으로, 다음에는 필요로, 마지막에는 중독으로 — 금지된 힘의 맛은 쉽게 잊히지 않는다. 사회는 그들을 경계하지만 위기가 닥치면 가장 먼저 찾는다. 흑마법사는 그 모순을 누구보다 잘 안다.',
   statFocus:['mgc','fear'], howToGet:'💀 업보 60 이상 + 👹 적대 NPC 5명 처치 + 🎒 「금서: 어둠의 계약」 보유',
   conditionHint:'지하 마법 시장이나 버려진 마법사의 탑에서 금서를 찾아라. 그것을 읽는 순간 돌아올 수 없는 길이 열린다.',
   unlockCondition:{type:'karma_npc', minKarma:60, minEnemyNpc:5, requireItem:'금서', desc:'업보 60·적대 NPC 5명·금서 보유'},
   skills:[
     {id:'job_wlk_curse',  name:'저주',       icon:'💜', type:'active',  desc:'대상 모든 스탯-30 (5턴). 해제 불가.', mpCost:25, rarity:'uncommon',
       effects:{ kind:'debuff', statMod:{str:-15,agi:-15}, duration:5 }},
     {id:'job_wlk_drain',  name:'마력 흡수',  icon:'🌑', type:'passive', desc:'마법 공격 시 MP 회복. 적 마력 흡수.', mpCost:0, rarity:'uncommon'},
     {id:'job_wlk_plague', name:'역병 낙인',  icon:'☠️', type:'active',  desc:'[저주 선행] 광역 저주 확산. 사망 시 주변에 전염.', mpCost:38, rarity:'legendary', prereq:'job_wlk_curse',
       effects:{ kind:'damage', statSource:{mgc:0.6,fear:0.4}, damageMult:0.9, element:'dark' }},
     {id:'job_wlk_pact',   name:'금단의 계약',icon:'📕', type:'passive', desc:'[마력 흡수 선행] MGC+15. MP 0 시에도 HP로 스킬 시전 가능.', mpCost:0, rarity:'rare', prereq:'job_wlk_drain'},
   ]},
  {id:'sage', name:'현자', icon:'📚🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M4 4 L4 19 L11 19 L11 4 Z" stroke-linejoin="round"/><path d="M13 4 L13 19 L20 19 L20 4 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></g></svg>`, category:'magic', parentId:'mage', tier:2,
   desc:'지식의 극한에 도달한 마법 학자.',
   lore:'현자는 마법을 "쓰는" 자가 아니라 "아는" 자다. 세계의 법칙을 이해하면 굳이 힘을 쏟지 않아도 현상이 따라온다. 현자들의 서재에는 읽지 않은 책이 없고, 기억하지 못하는 공식이 없다. 그러나 가장 위대한 현자들은 언제나 같은 말을 남긴다 — "알면 알수록 모른다는 것을 더 깊이 알게 된다." 그 겸손이 그들을 더욱 위험한 존재로 만든다.',
   statFocus:['int','per'], howToGet:'마법사로 지성 75 + 조사/탐색 행동 20회',
   unlockCondition:{type:'stat_action', minInt:75, minInvestCount:20, desc:'지성 75·조사 행동 20회'},
   skills:[
     {id:'job_sage_analyze', name:'완전 분석',  icon:'🔍', type:'active',  desc:'대상 약점 완전 파악. 다음 공격 대성공.', mpCost:15, rarity:'rare',
       effects:{ kind:'statBoost', statMod:{per:12,int:8} }},
     {id:'job_sage_wisdom',  name:'고대의 지혜',icon:'📜', type:'passive', desc:'INT+15. 모든 마법 효율+25%.', mpCost:0, rarity:'rare'},
     {id:'job_sage_predict', name:'예견',      icon:'🔮', type:'active',  desc:'[완전 분석 선행] 다음 3턴간 모든 판정 성공 확률 표시 및 보정.', mpCost:26, rarity:'legendary', prereq:'job_sage_analyze',
       effects:{ kind:'buff', statMod:{per:18,int:12}, duration:3 }},
     {id:'job_sage_archive', name:'만학의 서고',icon:'📚', type:'passive', desc:'[고대의 지혜 선행] INT+10. 새로운 지식 습득 시 즉시 스탯 반영.', mpCost:0, rarity:'legendary', prereq:'job_sage_wisdom'},
   ]},
  {id:'summoner', name:'소환사', icon:'🌀🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M12 12 C12 12 17 8 17 12 C17 16 12 12 12 12 C12 12 7 16 7 12 C7 8 12 12 12 12 Z" stroke-width="1.1"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></g></svg>`, category:'magic', parentId:'mage', tier:2,
   desc:'다른 세계의 존재를 불러내는 소환 전문가.',
   lore:'소환사는 두 세계 사이의 문지기다. 문을 열고 이쪽으로 불러낼 수 있다면, 저쪽에서 무언가가 이쪽을 들여다볼 수도 있다. 가장 강력한 소환사들은 정신이 점점 두 세계 사이 어딘가에 걸린 것처럼 행동한다고 전해진다. 그들이 부르는 존재들이 정말 "불려오는" 것인지, 아니면 소환사 스스로가 그쪽으로 "끌려가는" 것인지 — 묻는 자도, 아는 자도 드물다.',
   statFocus:['mgc','luk'], howToGet:'🔮 마법 70 + 🌀 소환 행동 15회 + 🗺️ 「소환의 제단」 방문',
   conditionHint:'고대의 소환 제단이 세계 어딘가에 잠들어 있다. 그곳에서 최초의 소환을 성공시켜야 소환사로 인정받는다.',
   unlockCondition:{type:'stat_action', minMagic:70, minSummonCount:15, requireLocation:'소환의 제단', desc:'마법 70·소환 15회·소환의 제단 방문'},
   skills:[
     {id:'job_sum_call',  name:'강령 소환',   icon:'👻', type:'active',  desc:'강력한 소환수 소환. 소환수 체력 비례 공격.', mpCost:35, rarity:'rare',
       effects:{ kind:'summon', baseCount:1, countByLocation:{graveyard:1, dungeon:1, default:0}, maxActive:2, statScaling:{source:'targetTier', mult:1.0}, levelScaling:0.15 }},
     {id:'job_sum_bond',  name:'소환수 유대', icon:'💫', type:'passive', desc:'소환수 능력치+30%. 소환 중 MP 소모 감소.', mpCost:0, rarity:'uncommon'},
     {id:'job_sum_gate',   name:'차원의 문',  icon:'🌀', type:'active',  desc:'[강령 소환 선행] 동시에 2체의 소환수를 유지할 수 있게 됨.', mpCost:30, rarity:'legendary', prereq:'job_sum_call',
       effects:{ kind:'buff', statMod:{mgc:14,wil:10}, duration:99 }},
     {id:'job_sum_sync',   name:'혼의 공명',  icon:'💠', type:'passive', desc:'[소환수 유대 선행] MGC+12. 소환수가 받는 피해의 일부를 술사와 분담.', mpCost:0, rarity:'rare', prereq:'job_sum_bond'},
   ]},
  {id:'chronomancer', name:'시간술사', icon:'⏳🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M6 3 L18 3 L18 7 L13 12 L18 17 L18 21 L6 21 L6 17 L11 12 L6 7 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></g></svg>`, category:'magic', parentId:'mage', tier:2,
   desc:'시간의 흐름을 조작하는 금지된 마법의 계승자.',
   lore:'시간은 가장 단단한 법칙이다. 그것을 구부리는 자는 반드시 대가를 치른다. 시간술사들 중 오래 산 자가 거의 없다는 것이 우연은 아닐 것이다. 그러나 한 번 시간을 되돌린 기억이 있는 자는 두 번째 기회를 포기하지 못한다. 시간술사는 과거와 미래가 동시에 보이는 눈을 가진 것처럼 행동한다. 어쩌면 정말 그럴지도 모른다.',
   statFocus:['mgc','int'], howToGet:'⏳ 마법 80 + ⏰ 시공 행동 8회 + 🎒 「시간의 모래시계」 보유 + 📜 퀘스트 「시간의 균열」 완료',
   conditionHint:'부서진 시간의 모래시계를 수리하는 퀘스트를 완료해야 한다. 그 과정에서 시간 마법의 원리를 체득하게 된다.',
   unlockCondition:{type:'stat_action', minMagic:80, minTimeCount:8, requireItem:'시간의 모래시계', requireQuest:'시간의 균열', desc:'마법 80·시공 행동 8회·아이템·퀘스트 완료'},
   skills:[
     {id:'job_chron_rewind', name:'시간 되감기', icon:'⏪', type:'active',  desc:'직전 턴으로 되돌림. 1회/전투.', mpCost:40, rarity:'legendary',
       effects:{ kind:'buff', statMod:{wil:14,per:10}, duration:1 }},
     {id:'job_chron_slow',   name:'시간 지연',  icon:'⏳', type:'passive', desc:'INT+12. 적의 행동속도 20% 감소.', mpCost:0, rarity:'rare'},
     {id:'job_chron_stop',   name:'시간 정지',  icon:'⏹️', type:'active',  desc:'[시간 되감기 선행] 1턴간 적 전체 행동 불가. 대가로 MP 전부 소모.', mpCost:50, rarity:'legendary', prereq:'job_chron_rewind',
       effects:{ kind:'damage', statSource:{wil:1}, damageMult:1.2, hits:2, element:'physical' }},
     {id:'job_chron_haste',  name:'가속의 흐름',icon:'⏩', type:'passive', desc:'[시간 지연 선행] MGC+12. 자신의 행동 순서가 항상 가장 먼저.', mpCost:0, rarity:'legendary', prereq:'job_chron_slow'},
   ]},
  {id:'elementalist', name:'원소술사', icon:'🌊🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M2 12 C2 12 5 9 8 12 C11 15 13 12 16 12 C19 12 22 9 22 9 M2 17 C2 17 5 14 8 17 C11 20 13 17 16 17 C19 17 22 14 22 14" stroke-width="1.4"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></g></svg>`, category:'magic', parentId:'mage', tier:2,
   desc:'불·물·땅·바람 네 원소를 자유자재로 다루는 마법사.',
   lore:'세상 모든 것은 네 원소의 조화로 이루어져 있다고 고대 현자들은 말했다. 원소술사는 그 조화를 직접 손으로 다루는 자다. 불을 다룰 때는 그 자신이 불처럼 타오르고, 물을 다룰 때는 고요해진다. 네 원소를 모두 아는 자는 어느 하나에도 치우치지 않는 균형을 얻게 되고, 그 균형이 원소술사를 단순한 마법사와 구분 짓는다.',
   statFocus:['mgc','wil'], howToGet:'마법사로 4가지 속성 마법 각 3회 이상 사용',
   unlockCondition:{type:'element_count', minEachElement:3, desc:'4원소 각 3회 이상 사용'},
   skills:[
     {id:'job_elem_burst',  name:'원소 폭발', icon:'🌊', type:'active',  desc:'4원소 무작위 조합. 속성 약점 자동 적용.', mpCost:30, rarity:'rare',
       effects:{ kind:'damage', statSource:{mgc:1}, damageMult:0.85, element:'physical' }},
     {id:'job_elem_resist', name:'원소 친화', icon:'🌿', type:'passive', desc:'MGC+10. 원소 피해 40% 저항.', mpCost:0, rarity:'uncommon'},
     {id:'job_elem_storm',  name:'사원소 폭풍',icon:'🌪️', type:'active',  desc:'[원소 폭발 선행] 4원소 동시 발동. 광역 지속 피해.', mpCost:42, rarity:'legendary', prereq:'job_elem_burst',
       effects:{ kind:'damage', statSource:{mgc:1}, damageMult:0.55, hits:3, element:'physical' }},
     {id:'job_elem_balance',name:'균형의 경지',icon:'☯️', type:'passive', desc:'[원소 친화 선행] WIL+12. 4원소 모두 사용 시 다음 스킬 MP 소모 없음.', mpCost:0, rarity:'legendary', prereq:'job_elem_resist'},
   ]},
  {id:'necromancer', name:'강령술사', icon:'💀🌑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></g></svg>`, category:'magic', parentId:'mage', tier:2,
   desc:'죽음의 경계를 넘나들며 망자를 부리는 금지된 술법사.',
   lore:'강령술사들은 죽음을 두려워하지 않는다. 너무 자주 보아 익숙해졌거나, 이미 한 번 경험했거나. 그들이 부리는 망자들은 과거의 전사, 장인, 학자들이다. 죽음 이후에도 이름이 불리는 것이 명예인가 굴욕인가 — 강령술사들은 그 질문에 답하지 않는다. 교단과 국가는 그들을 금하지만, 전장에서 죽은 병사가 다시 일어서는 광경을 본 적 있는 군주는 다시 생각한다.',
   statFocus:['mgc','fear'], howToGet:'마법사로 죽음 관련 행동 10회 + 마법 72',
   unlockCondition:{type:'stat_action', minMagic:72, minDeathCount:10, desc:'마법 72·죽음 행동 10회'},
   skills:[
     {id:'job_necro_rise',  name:'언데드 소환', icon:'💀', type:'active',  desc:'처치한 적을 언데드로 부활. 최대 3기 유지.', mpCost:28, rarity:'rare',
       effects:{ kind:'summon', baseCount:1, countByLocation:{graveyard:2, dungeon:1, battlefield:1, default:0}, maxActive:3, statScaling:{source:'targetTier', mult:0.9}, levelScaling:0.15 }},
     {id:'job_necro_aura',  name:'사령의 오라', icon:'🌑', type:'passive', desc:'FEAR+12. 주변 적 매 턴 HP-5.', mpCost:0, rarity:'uncommon',
       effects:{ kind:'debuff', statMod:{fear:12}, duration:99, levelScaling:0.12 }},
     {id:'job_necro_legion',name:'망자의 군단', icon:'⚰️', type:'active',  desc:'[언데드 소환 선행] 언데드 유지 한도 +3기, 전체 능력치+20%.', mpCost:36, rarity:'legendary', prereq:'job_necro_rise',
       effects:{ kind:'buff', statMod:{fear:16,wil:12}, duration:99, levelScaling:0.1 }},
     {id:'job_necro_veil',  name:'죽음의 장막', icon:'🖤', type:'passive', desc:'[사령의 오라 선행] FEAR+15. HP 0 도달 시 언데드 1기를 대신 소멸시켜 생존.', mpCost:0, rarity:'legendary', prereq:'job_necro_aura',
       effects:{ kind:'buff', statMod:{fear:15}, duration:99, levelScaling:0.1 }},
   ]},
  {id:'enchanter', name:'결계사', icon:'🔯🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 2 L20.7 17 L3.3 17 Z" stroke-linejoin="round"/><path d="M12 22 L3.3 7 L20.7 7 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></g></svg>`, category:'magic', parentId:'mage', tier:2,
   desc:'강력한 결계와 마법 장벽으로 전장을 통제하는 전술 마법사.',
   lore:'결계사는 전장을 자신의 손바닥 위에 놓는다. 공격 대신 공간을 설계하고, 힘 대신 구조를 세운다. 적은 결계사가 어디 있는지 찾지 못하면서도, 그가 쳐놓은 선 앞에서 멈추고 만다. "싸우지 않고 이기는 것이 최상의 승리"라는 병법의 가르침을 마법으로 실현하는 자가 결계사다. 그들이 완성한 결계 안에서는 아군이 두 배의 용기를 낸다.',
   statFocus:['mgc','wil'], howToGet:'마법사로 방어/보호 마법 행동 12회 + 의지 65',
   unlockCondition:{type:'stat_action', minWil:65, minDefendCount:12, desc:'의지 65·방어 마법 12회'},
   skills:[
     {id:'job_enc_barrier', name:'마법 결계',   icon:'🔯', type:'active',  desc:'아군 전체 피해 완전 차단 (1회). 지속 5턴.', mpCost:32, rarity:'rare',
       effects:{ kind:'buff', statMod:{end:20,wil:10}, duration:5 }},
     {id:'job_enc_amplify', name:'마력 증폭',   icon:'✨', type:'passive', desc:'WIL+10. 아군 마법 효율+20%.', mpCost:0, rarity:'uncommon'},
     {id:'job_enc_reflect', name:'반사의 결계', icon:'🪞', type:'active',  desc:'[마법 결계 선행] 5턴간 받는 마법 피해를 그대로 반사.', mpCost:34, rarity:'legendary', prereq:'job_enc_barrier',
       effects:{ kind:'buff', statMod:{end:22,mgc:12}, duration:5 }},
     {id:'job_enc_grid',    name:'결계망 구축', icon:'🕸️', type:'passive', desc:'[마력 증폭 선행] WIL+12. 동시에 2개의 결계를 유지 가능.', mpCost:0, rarity:'legendary', prereq:'job_enc_amplify'},
   ]},

  // ══ 도적 파생 (7종) ══
  {id:'assassin', name:'암살자', icon:'🎯🗡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, category:'stealth', parentId:'rogue', tier:2,
   desc:'표적을 완벽하게 제거하는 그림자의 존재.',
   lore:'암살자는 세상에서 가장 고독한 직업이다. 이름을 가져서는 안 되고, 얼굴을 기억시켜서도 안 된다. 표적이 죽은 방에 들어가면, 창문이 열려 있어도 잠겨 있어도 흔적이 없다. 어떤 암살자 조직에는 "우리는 존재하지 않는다"는 첫 번째 규칙이 있다. 그 규칙을 어기면 다음 표적이 자기 자신이 된다는 것을 모두가 알고 있다.',
   statFocus:['agi','disg'], howToGet:'🥷 민첩 75 + 🌑 은신 성공 20회 + 🗺️ 「암살자 길드 본부」 방문 + 📜 퀘스트 「입문 시험」 완료',
   conditionHint:'암살자 길드는 스스로를 드러내지 않는다. 은신 20회를 달성하면 누군가가 찾아올 것이다. 그 자의 시험을 통과하면 길드 본부로 안내받는다.',
   unlockCondition:{type:'stat_action', minAgi:75, minStealthCount:20, requireLocation:'암살자 길드', requireQuest:'입문 시험', desc:'민첩 75·은신 20회·길드 방문·퀘스트 완료'},
   skills:[
     {id:'job_ass_vital',  name:'급소 찌르기', icon:'🎯', type:'active',  desc:'즉사 판정. 성공 시 대성공 처리.', mpCost:20, rarity:'rare',
       effects:{ kind:'damage', statSource:{agi:0.5,crit:0.5}, damageMult:1.1, element:'physical' }},
     {id:'job_ass_ghost',  name:'유령 발걸음', icon:'👻', type:'passive', desc:'이동 시 소리 없음. 기습 성공률+40%.', mpCost:0, rarity:'rare'},
     {id:'job_ass_execute',name:'처형',       icon:'⚔️', type:'active',  desc:'[급소 찌르기 선행] HP 30% 이하 대상 즉시 처치.', mpCost:26, rarity:'legendary', prereq:'job_ass_vital',
       effects:{ kind:'damage', statSource:{agi:0.5,crit:0.5}, damageMult:1.5, element:'physical' }},
     {id:'job_ass_shadow', name:'그림자 각인', icon:'🌑', type:'passive', desc:'[유령 발걸음 선행] AGI+15. 은신 중 이동속도 2배.', mpCost:0, rarity:'legendary', prereq:'job_ass_ghost'},
   ]},
  {id:'pirate', name:'해적', icon:'🏴‍☠️🗡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="9" r="4"/><circle cx="9.7" cy="8" r="0.7" fill="currentColor"/><circle cx="14.3" cy="8" r="0.7" fill="currentColor"/><path d="M9.5 11.5 C10.3 12.3 13.7 12.3 14.5 11.5" stroke-width="1.2"/><path d="M9 21 L9 15 L15 15 L15 21"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, category:'stealth', parentId:'rogue', tier:2,
   desc:'바다를 누비는 자유로운 약탈자.',
   lore:'해적기가 올라가면 항구는 침묵한다. 그러나 해적들 사이에서 그 깃발은 다른 의미다 — 우리는 어느 나라에도 속하지 않는다는 선언이다. 바다는 법이 닿지 않는 마지막 자유 구역이었고, 해적은 그 자유를 가장 거칠게 표현한 자들이다. 선원 중 가장 많이 웃고, 가장 잘 마시고, 가장 빠르게 배신하고, 가장 강하게 의리를 지킨다. 해적에게 "동료"는 가족보다 가까운 말이다.',
   statFocus:['str','neg'], howToGet:'도적으로 골드 300 획득 + 협박/거래 행동 15회',
   unlockCondition:{type:'gold_action', minGold:300, minTradeCount:15, desc:'골드 300 획득·거래 15회'},
   skills:[
     {id:'job_prt_plunder', name:'약탈',       icon:'💰', type:'active',  desc:'전투 승리 시 골드 2배 획득.', mpCost:0, rarity:'uncommon',
       effects:{ kind:'buff', statMod:{luk:12}, duration:3 }},
     {id:'job_prt_crew',    name:'선원 모집',  icon:'👥', type:'passive', desc:'NPC 호감도+15. 아군 항상 곁에.', mpCost:0, rarity:'uncommon'},
     {id:'job_prt_broadside',name:'현측 포격', icon:'💥', type:'active',  desc:'[약탈 선행] 광역 피해. 골드 소모하여 위력 증가.', mpCost:22, rarity:'rare', prereq:'job_prt_plunder',
       effects:{ kind:'damage', statSource:{str:0.6,neg:0.4}, damageMult:0.8, hits:2, element:'physical' }},
     {id:'job_prt_captain', name:'선장의 위엄',icon:'⚓', type:'passive', desc:'[선원 모집 선행] NEG+12. 선원(동료) 전체 능력치+15%.', mpCost:0, rarity:'rare', prereq:'job_prt_crew'},
   ]},
  {id:'ninja', name:'닌자', icon:'🥷🗡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="8" r="4" stroke-width="1.3"/><path d="M8.5 8 L15.5 8" stroke-width="1.1"/><path d="M6 20 C6 15.5 8.5 13 12 13 C15.5 13 18 15.5 18 20"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, category:'stealth', parentId:'rogue', tier:2,
   desc:'동양의 비술을 익힌 그림자 전사.',
   lore:'닌자는 학파가 아니라 철학이다. 그들이 배우는 것은 기술이 아니라 존재 방식이다 — 물처럼 흘러 틈을 찾고, 바람처럼 지나가 흔적을 남기지 않는다. 분신술은 단순한 마법이 아니라 "나는 여기에도 없다"는 선언이다. 닌자들은 마을 한가운데서 살면서도 누구도 그들이 닌자인지 모른다. 그것이 진짜 은신이다.',
   statFocus:['agi','int'], howToGet:'도적으로 민첩 80 + 연속 대성공 5회',
   unlockCondition:{type:'stat_crit', minAgi:80, minConsecCrit:5, desc:'민첩 80·연속 대성공 5회'},
   skills:[
     {id:'job_nin_clone',  name:'분신술',   icon:'🌀', type:'active',  desc:'분신 3개 생성. 적 공격을 분산.', mpCost:28, rarity:'rare',
       effects:{ kind:'statBoost', statMod:{agi:14,disg:10} }},
     {id:'job_nin_swift',  name:'순보',     icon:'⚡', type:'passive', desc:'AGI+12. 선제 공격 항상 발동.', mpCost:0, rarity:'rare'},
     {id:'job_nin_replace',name:'사영술',   icon:'🍃', type:'active',  desc:'[분신술 선행] 치명적 공격을 분신으로 완전 회피.', mpCost:20, rarity:'legendary', prereq:'job_nin_clone',
       effects:{ kind:'buff', statMod:{agi:20,disg:14}, duration:1 }},
     {id:'job_nin_void',   name:'무형의 걸음',icon:'💨', type:'passive', desc:'[순보 선행] INT+12. 매 전투 첫 공격 자동 회피.', mpCost:0, rarity:'legendary', prereq:'job_nin_swift'},
   ]},
  {id:'poisoner', name:'독술사', icon:'🐍🗡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M4 6 C4 6 8 4 10 7 C12 10 8 11 10 14 C12 17 16 15 18 18 C19 19.5 18.5 21 17 21" /><circle cx="17" cy="21" r="1" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, category:'stealth', parentId:'rogue', tier:2,
   desc:'독과 독소를 자유자재로 다루는 공포의 암술사.',
   lore:'독은 가장 인내심이 강한 무기다. 상대가 자신이 이미 당했다는 사실을 모른 채 웃으며 자리를 떠나는 것을 본 자만이 독술사가 된다. 독술사의 손가락에는 언제나 두 종류의 약이 있다 — 죽이는 것과 살리는 것. 그 경계를 아는 자가 진짜 독술사다. 어떤 교단은 그들을 치유사로 부르고, 어떤 왕국은 그들을 처형한다.',
   statFocus:['pstx','agi'], howToGet:'도적으로 독 관련 행동 10회 + 민첩 65',
   unlockCondition:{type:'stat_action', minAgi:65, minPoisonCount:10, desc:'민첩 65·독 행동 10회'},
   skills:[
     {id:'job_psn_brew',    name:'맹독 제조',  icon:'🧪', type:'active',  desc:'강력한 독 제조. 적 매 턴 HP-15. 해제 어려움.', mpCost:12, rarity:'uncommon',
       effects:{ kind:'damage', statSource:{int:1}, damageMult:0.6, element:'poison' }},
     {id:'job_psn_immune',  name:'독 면역',    icon:'🐍', type:'passive', desc:'PSTX+15. 독·질병 완전 면역. 독 피해 흡수.', mpCost:0, rarity:'rare'},
     {id:'job_psn_plague',  name:'역병 확산',  icon:'☠️', type:'active',  desc:'[맹독 제조 선행] 광역 독 살포. 감염된 적끼리 전염.', mpCost:24, rarity:'legendary', prereq:'job_psn_brew',
       effects:{ kind:'damage', statSource:{int:1}, damageMult:0.5, hits:2, element:'poison' }},
     {id:'job_psn_antidote',name:'만능 해독제',icon:'💊', type:'passive', desc:'[독 면역 선행] PSTX+12. 아군 상태이상 자동 해제 확률+30%.', mpCost:0, rarity:'legendary', prereq:'job_psn_immune'},
   ]},
  {id:'bounty_hunter', name:'현상금 사냥꾼', icon:'💲🗡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 3 L12 21 M15.5 7 C15.5 5.5 14 4.5 12 4.5 C9.8 4.5 8.5 5.8 8.5 7.3 C8.5 9 10 9.7 12 10.2 C14.2 10.7 15.8 11.5 15.8 13.5 C15.8 15.3 14.2 16.5 12 16.5 C10 16.5 8.3 15.5 8.3 14" stroke-width="1.2"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, category:'stealth', parentId:'rogue', tier:2,
   desc:'돈을 위해 어떤 표적도 추적하는 냉혹한 프리랜서.',
   lore:'현상금 사냥꾼은 법도 조직도 아닌, 오직 의뢰서와 보상금으로 움직인다. 선악을 가리지 않는다는 평판이 있지만, 오래 살아남은 사냥꾼들은 의뢰를 고른다. 아무리 돈이 많아도 잡은 후 자신이 표적이 되는 의뢰는 받지 않는다. 그 판단력이 이 직업의 진짜 핵심 기술이다. "추적은 기술이지만, 살아 돌아오는 것은 지혜다"라고 그들은 말한다.',
   statFocus:['per','str'], howToGet:'도적으로 현상금/의뢰 완료 5회 + 지각 70',
   unlockCondition:{type:'stat_action', minPer:70, minBountyCount:5, desc:'지각 70·의뢰 완료 5회'},
   skills:[
     {id:'job_bh_track',   name:'현상 추적',  icon:'🎯', type:'active',  desc:'표적 위치 완전 파악. 도주 불가. 포획/처치 보상 2배.', mpCost:15, rarity:'rare',
       effects:{ kind:'statBoost', statMod:{per:14,rng:10} }},
     {id:'job_bh_net',     name:'포박 덫',    icon:'🪤', type:'passive', desc:'PER+10. 도주하는 적 이동속도 -50%.', mpCost:0, rarity:'uncommon'},
     {id:'job_bh_execute', name:'현상금 회수',icon:'💰', type:'active',  desc:'[현상 추적 선행] 표적 처치 시 보상 3배 + 다음 스킬 쿨다운 초기화.', mpCost:18, rarity:'legendary', prereq:'job_bh_track',
       effects:{ kind:'damage', statSource:{per:0.5,rng:0.5}, damageMult:0.85, element:'physical' }},
     {id:'job_bh_veteran', name:'베테랑의 감',icon:'🧭', type:'passive', desc:'[포박 덫 선행] PER+12. 위험한 의뢰 실패 확률 사전 감지.', mpCost:0, rarity:'rare', prereq:'job_bh_net'},
   ]},
  {id:'spy', name:'첩자', icon:'🕵️🗡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="9" cy="12" r="3.2"/><circle cx="17" cy="12" r="3.2"/><path d="M12.2 12 L13.8 12" /><path d="M5.8 12 L2 11" /><path d="M20.2 12 L22 11" /></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, category:'stealth', parentId:'rogue', tier:2,
   desc:'신분을 위장하고 적 조직에 침투하는 정보전의 달인.',
   lore:'첩자의 가장 위험한 순간은 적의 손에 잡혔을 때가 아니다 — 너무 오래 위장하다 진짜 자신이 누구인지 잊어버렸을 때다. 세 겹의 신분을 쌓다 보면 어느 층이 진짜인지 본인도 모르게 된다. 그래서 뛰어난 첩자들은 역설적으로 가장 강한 자아를 가진 자들이다. 흔들리지 않아야 위장이 흔들리지 않는다.',
   statFocus:['disg','spk'], howToGet:'도적으로 위장/잠입 행동 12회 + 위장 75',
   unlockCondition:{type:'stat_action', minDisg:75, minInfilCount:12, desc:'위장 75·잠입 행동 12회'},
   skills:[
     {id:'job_spy_mask',   name:'완벽한 변장', icon:'🎭', type:'active',  desc:'완전 다른 인물로 위장. 들킬 확률 0 (5턴).', mpCost:18, rarity:'rare',
       effects:{ kind:'buff', statMod:{disg:20}, duration:5 }},
     {id:'job_spy_info',   name:'이중 첩보',   icon:'📡', type:'passive', desc:'DISG+12. 적 다음 행동 사전 파악.', mpCost:0, rarity:'rare'},
     {id:'job_spy_double', name:'삼중 신분',   icon:'🎭', type:'active',  desc:'[완벽한 변장 선행] 위장 상태에서 적 조직 정보를 즉시 획득.', mpCost:24, rarity:'legendary', prereq:'job_spy_mask',
       effects:{ kind:'buff', statMod:{per:16,int:10}, duration:3 }},
     {id:'job_spy_network',name:'정보망 구축', icon:'🕸️', type:'passive', desc:'[이중 첩보 선행] SPK+12. 모든 사회적 판정 성공 시 추가 정보 획득.', mpCost:0, rarity:'legendary', prereq:'job_spy_info'},
   ]},
  {id:'gambler', name:'도박사', icon:'🎲🗡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><rect x="3" y="3" width="18" height="18" rx="3" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></g></svg>`, category:'stealth', parentId:'rogue', tier:2,
   desc:'운명을 건 도박으로 모든 것을 얻거나 잃는 극단의 직업.',
   lore:'도박사는 확률을 아는 자가 아니라, 확률을 무시할 수 있는 자다. 머리로는 지고 있다는 것을 알면서도 손은 칩을 밀어 넣는다. 그 역설의 순간에 운명이 개입한다고 도박사들은 믿는다. 전부를 잃어본 자만이 전부를 걸 수 있다는 자격을 얻는다. 도박사에게 가장 두려운 것은 패배가 아니라 — 게임이 끝나는 것이다.',
   statFocus:['luk','neg'], howToGet:'도적으로 운 관련 행동 10회 + 행운 70',
   unlockCondition:{type:'stat_action', minLuk:70, minLuckCount:10, desc:'행운 70·운 행동 10회'},
   skills:[
     {id:'job_gmb_allIn',  name:'올인',       icon:'🎲', type:'active',  desc:'50% 확률: 피해 3배 OR 자신 HP-30. 극단의 도박.', mpCost:0, rarity:'rare',
       effects:{ kind:'damage', statSource:{luk:1}, damageMult:1.0, element:'physical' }},
     {id:'job_gmb_luck',   name:'도박사의 운',icon:'🍀', type:'passive', desc:'LUK+15. 대성공 확률+15%. 대실패 확률+5%.', mpCost:0, rarity:'uncommon'},
     {id:'job_gmb_jackpot',name:'잭팟',       icon:'💎', type:'active',  desc:'[올인 선행] 성공 시 이번 전투 모든 보상 3배. 실패해도 페널티 없음.', mpCost:15, rarity:'legendary', prereq:'job_gmb_allIn',
       effects:{ kind:'buff', statMod:{luk:20}, duration:3 }},
     {id:'job_gmb_reroll', name:'재도전',     icon:'🔄', type:'passive', desc:'[도박사의 운 선행] LUK+12. 대실패 판정 1회 무효화 (전투당 1회).', mpCost:0, rarity:'legendary', prereq:'job_gmb_luck'},
   ]},

  // ══ 방랑자 파생 (9종) ══
  {id:'blacksmith', name:'대장장이', icon:'🔨🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="1.3"/><path d="M11 7 L4 14 C3.3 14.7 3.3 15.8 4 16.5 C4.7 17.2 5.8 17.2 6.5 16.5 L13.5 9.5"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, category:'craft', parentId:'wanderer', tier:2,
   desc:'금속을 다루어 무기와 방어구를 만드는 장인.',
   lore:'대장장이의 손은 세상에서 가장 거칠고, 세상에서 가장 정교하다. 쇠를 두드리는 소리는 마을의 맥박이다 — 그 소리가 멈추면 마을도 멈춘다. 방랑자 출신 대장장이는 많은 세계의 기술을 흡수해 어떤 재료로도 도구를 만들 줄 안다. "최고의 무기는 사용하는 자의 손에 맞게 만들어진다"는 말은 대장장이들 사이의 오랜 신조다.',
   statFocus:['str','int'], howToGet:'방랑자로 제작/수리 행동 10회',
   unlockCondition:{type:'action_pattern', pattern:'craft', minCount:10, desc:'제작/수리 행동 10회'},
   skills:[
     {id:'job_bs_forge',   name:'단조',   icon:'🔨', type:'active',  desc:'아이템 강화. 효과+50%.', mpCost:0, rarity:'uncommon',
       effects:{ kind:'buff', statMod:{str:8,end:8}, duration:3 }},
     {id:'job_bs_repair',  name:'수리',   icon:'🔧', type:'active',  desc:'장비 내구도 완전 회복. HP+10.', mpCost:0, rarity:'common', hpRestore:10},
   ]},
  {id:'alchemist', name:'연금술사', icon:'⚗️🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M9 2 L15 2 M10 2 L10 9 L4.5 18 C4 19 4.7 20 6 20 L18 20 C19.3 20 20 19 19.5 18 L14 9 L14 2" stroke-linejoin="round"/><path d="M7 15 L17 15" stroke-width="1.1"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, category:'craft', parentId:'wanderer', tier:2,
   desc:'물질을 변환하고 포션을 만드는 신비로운 직업.',
   lore:'연금술사의 꿈은 납을 금으로 바꾸는 것이 아니다 — 그것은 세상 사람들이 지어낸 이야기다. 진짜 연금술사는 "모든 것은 변할 수 있다"는 가능성을 탐구한다. 포션 하나에 세 가지 재료를 섞을 때, 그 연금술사는 세계의 법칙과 대화하고 있는 것이다. 방랑자 시절의 호기심이 실험실을 만들고, 실험실이 다시 더 큰 세계로 이어진다.',
   statFocus:['int','mgc'], howToGet:'방랑자로 탐구/실험 행동 10회 + 지성 65',
   unlockCondition:{type:'action_stat', pattern:'research', minCount:10, minInt:65, desc:'탐구 행동 10회·지성 65'},
   skills:[
     {id:'job_alc_brew',   name:'포션 제조',  icon:'🧪', type:'active',  desc:'즉석 포션 제조. HP/MP 회복.', mpCost:0, rarity:'uncommon', hpRestore:20},
     {id:'job_alc_trans',  name:'연금 변환',  icon:'⚗️', type:'active',  desc:'아이템을 다른 아이템으로 변환.', mpCost:15, rarity:'rare',
       effects:{ kind:'buff', statMod:{int:10,pstx:6}, duration:2 }},
   ]},
  {id:'bard', name:'음유시인', icon:'🎵🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/><path d="M9.5 18 L9.5 6 L19.5 4 L19.5 16" /></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, category:'social', parentId:'wanderer', tier:2,
   desc:'노래와 이야기로 세상을 여행하는 예술가.',
   lore:'음유시인은 세상의 기억을 보관하는 자다. 왕은 전쟁을 기록으로 남기지만, 전쟁에서 죽은 병사들의 이름은 음유시인만이 노래로 살려낸다. 그들이 지나간 마을에는 이야기가 남는다. 방랑자 출신 음유시인은 더욱 많은 이야기를 담고 있다 — 직접 살았기에 더 진실하고, 여러 세계를 보았기에 더 넓다. 노래 한 곡이 때로 칼 한 자루보다 더 오래간다.',
   statFocus:['spk','luk'], howToGet:'방랑자로 설득/대화/공연 행동 15회',
   unlockCondition:{type:'action_pattern', pattern:'social', minCount:15, desc:'대화/설득 행동 15회'},
   skills:[
     {id:'job_brd_inspire', name:'영감의 노래', icon:'🎵', type:'active',  desc:'아군 전체 사기 상승. 모든 스탯+15.', mpCost:15, rarity:'uncommon',
       effects:{ kind:'buff', statMod:{str:15,agi:15,end:15}, duration:3 }},
     {id:'job_brd_charm',   name:'매혹의 선율', icon:'🎶', type:'passive', desc:'SPK+10. NPC 첫 만남 호감+20.', mpCost:0, rarity:'uncommon'},
   ]},
  {id:'hunter', name:'사냥꾼', icon:'🏹🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z"/><path d="M5 19 L6 15 L9 18 Z"/><path d="M3 12 C3 12 8 10 12 3" stroke-width="1.3"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, category:'combat', parentId:'wanderer', tier:2,
   desc:'야생에서 생존하며 몬스터를 사냥하는 전문가.',
   lore:'사냥꾼은 문명의 경계에 산다. 마을 사람들은 그들이 가져오는 고기와 가죽을 필요로 하면서도, 조금 두려워한다. 너무 오래 야생에 있다 보면 야생을 닮아가기 때문이다. 방랑자 출신 사냥꾼은 다양한 지형에서 살아남는 법을 안다. 그들에게 숲은 위험한 곳이 아니라 집이고, 몬스터는 적이기 이전에 자신과 같이 살아가는 존재들이다.',
   statFocus:['per','rng'], howToGet:'방랑자로 전투/추적 행동 12회 + 지각 65',
   unlockCondition:{type:'action_stat', pattern:'hunt', minCount:12, minPer:65, desc:'전투/추적 12회·지각 65'},
   skills:[
     {id:'job_hnt_track',  name:'추적',        icon:'🐾', type:'active',  desc:'대상 위치 완벽 파악. 다음 공격 회피 불가.', mpCost:10, rarity:'uncommon',
       effects:{ kind:'statBoost', statMod:{per:12,rng:8} }},
     {id:'job_hnt_wild',   name:'야생의 감각', icon:'🌿', type:'passive', desc:'PER+10. 기습 당할 확률 0.', mpCost:0, rarity:'uncommon'},
     {id:'job_hnt_trap',   name:'함정 사냥',   icon:'🪤', type:'active',  desc:'[추적 선행] 은신 함정 설치. 밟은 적 이동불가+피해.', mpCost:14, rarity:'rare', prereq:'job_hnt_track',
       effects:{ kind:'damage', statSource:{per:0.5,rng:0.5}, damageMult:0.6, element:'physical' }},
     {id:'job_hnt_instinct',name:'맹수의 본능',icon:'🐺', type:'passive', desc:'[야생의 감각 선행] PER+12. 야생 몬스터 상대 피해량+25%.', mpCost:0, rarity:'rare', prereq:'job_hnt_wild'},
   ]},
  {id:'merchant', name:'상인', icon:'💰🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, category:'social', parentId:'wanderer', tier:2,
   desc:'거래와 정보로 세상을 움직이는 사업가.',
   lore:'칼을 가진 자가 전쟁을 만들고, 돈을 가진 자가 전쟁을 끝낸다는 말이 있다. 상인은 두 나라 사이에서 양쪽 물건을 옮기며 평화를 만들기도 하고, 한쪽에만 무기를 팔아 전쟁을 연장하기도 한다. 방랑자 출신 상인은 가장 넓은 정보망을 가진다. 어느 마을에 무엇이 부족하고, 어느 나라에서 무엇이 넘치는지 — 그 간격이 곧 이윤이다.',
   statFocus:['neg','luk'], howToGet:'💰 골드 200 보유 + 🤝 거래 행동 10회 + 📜 퀘스트 「첫 번째 대규모 거래」 완료',
   conditionHint:'상인 길드에서 주는 "첫 번째 대규모 거래" 퀘스트를 완수하면 공식 상인 면허를 받는다. 그것이 상인 직업의 시작이다.',
   unlockCondition:{type:'gold_action', minGold:200, minTradeCount:10, requireQuest:'첫 번째 대규모 거래', desc:'골드 200·거래 10회·퀘스트 완료'},
   skills:[
     {id:'job_mrc_deal',   name:'완벽한 거래', icon:'🤝', type:'active',  desc:'협상 성공률+50%. 골드 획득+30%.', mpCost:0, rarity:'uncommon',
       effects:{ kind:'buff', statMod:{spk:12,luk:8}, duration:3 }},
     {id:'job_mrc_info',   name:'정보망',      icon:'📋', type:'passive', desc:'NEG+8. 상점 가격 20% 할인.', mpCost:0, rarity:'uncommon'},
   ]},
  {id:'healer', name:'치유사', icon:'💚🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 20 C12 20 3 14 3 8.2 C3 5.3 5.3 3 8.2 3 C10 3 11.3 3.9 12 5.2 C12.7 3.9 14 3 15.8 3 C18.7 3 21 5.3 21 8.2 C21 14 12 20 12 20 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, category:'support', parentId:'wanderer', tier:2,
   desc:'생명의 힘으로 상처를 치유하는 성스러운 직업.',
   lore:'치유사는 종교도, 마법도 아닌 생명에 대한 순수한 존중으로 일한다. 신앙 없이도 손에서 따뜻한 빛이 나오는 그들은 "생명에 대한 의지가 신앙보다 강하다"는 것을 증명한다. 방랑자 시절 많은 상처를 보았기에 가장 빠르게 진단한다. 마을 어귀에 나타난 치유사는 항상 환영받는다. 그들이 지나간 자리에는 살아난 이들의 기억이 남는다.',
   statFocus:['fath','wil'], howToGet:'방랑자로 치유/회복 행동 12회',
   unlockCondition:{type:'action_pattern', pattern:'heal', minCount:12, desc:'치유 행동 12회'},
   skills:[
     {id:'job_heal_cure',  name:'완전 치유',   icon:'💚', type:'active',  desc:'HP 완전 회복. 저주·독 해제.', mpCost:30, rarity:'rare', hpRestore:60},
     {id:'job_heal_regen', name:'생명 순환',   icon:'♻️', type:'passive', desc:'매 턴 HP+5. FATH+8.', mpCost:0, rarity:'uncommon'},
   ]},
  {id:'gravekeeper', name:'사자의 안내인', icon:'⚱️🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M9 21 L9 12 C9 12 6 11 6 9 C6 7 8 6 12 6 C16 6 18 7 18 9 C18 11 15 12 15 12 L15 21 Z" stroke-linejoin="round"/><path d="M10 3 L14 3 L14 6 L10 6 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, category:'social', parentId:'wanderer', tier:2,
   desc:'묘지와 무덤을 관리하며 죽은 자를 순환으로 돌려보내는 자. 때로는 잠든 자의 곁을 파헤치기도 한다.',
   lore:'아에테른에서는 죽음이 끝이 아니라 순환의 시작이다. 사자의 안내인은 그 경계에 서서 살아간다. 묘지를 정성껏 돌보면 마을의 평안을 지키지만, 무덤을 파헤쳐 유물을 꺼내는 손은 똑같은 손이다. "땅에 묻힌 것은 두 가지뿐이다 — 안식과 욕망." 이것이 안내인들 사이에 전해지는 경구다. 떠나지 못한 원혼이 나타나면, 안내인은 그 사연을 들어주거나, 강제로 보내거나, 외면할 수 있다. 무엇을 택하든 그 선택은 잊히지 않는다.',
   statFocus:['wil','per'], howToGet:'🪦 추모 행동 10회 + 💀 묘지·무덤 장소 5곳 방문 + 💬 NPC 「늙은 무덤지기」 호감도 60+',
   conditionHint:'늙은 무덤지기를 찾아가 죽은 자를 대하는 법을 배워라. 그가 인정해야만 안내인의 자격이 주어진다.',
   unlockCondition:{type:'action_stat', pattern:'mourn', minCount:10, minWil:60, npcAffection:{name:'무덤지기', min:60}, desc:'추모 10회·의지 60·무덤지기 호감'},
   skills:[
     {id:'job_gk_guide',  name:'영혼 인도',     icon:'🕯️', type:'active',  desc:'떠나지 못한 원혼을 진정시켜 순환으로 돌려보낸다. WIL+15.', mpCost:10, rarity:'rare',
       effects:{ kind:'buff', statMod:{wil:15}, duration:5 }},
     {id:'job_gk_sense',  name:'죽음의 감각',   icon:'⚱️', type:'passive', desc:'PER+10. 묘지·무덤에서 숨겨진 유물과 저주의 기운을 감지한다.', mpCost:0, rarity:'rare'},
   ]},
  {id:'farmer', name:'농부', icon:'🌾🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 6 C14 6 15 4.5 15 3 C13.5 3 12 4 12 6 Z" stroke-width="1.2"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, category:'support', parentId:'wanderer', tier:2,
   desc:'대지를 일구며 마을을 풍요롭게 하는 생활 직업. 싸우지 않고 엔딩 달성 가능.',
   lore:'세상이 아무리 혼란해도 봄에 씨를 뿌리는 사람이 있어야 가을이 온다. 농부는 가장 조용한 방식으로 세상을 지탱하는 자들이다. 방랑자가 마침내 발을 멈추고 땅에 씨앗을 심기로 했을 때 — 그것은 패배가 아니라 선택이다. 세상을 구하는 영웅도 먹어야 하고, 그 음식은 농부에게서 온다. 가장 위대한 엔딩은 때로 아무도 모르는 밭에서 맺어진다.',
   statFocus:['end','luk'], howToGet:'방랑자로 거래/생활 행동 10회',
   unlockCondition:{type:'action_pattern', pattern:'trade', minCount:10, desc:'거래/생활 행동 10회'},
   skills:[
     {id:'job_frm_harvest', name:'풍년의 손길', icon:'🌾', type:'active',  desc:'골드+50. 마을 주민 호감+15.', mpCost:0, rarity:'common',
       effects:{ kind:'buff', statMod:{rep:10,luk:6}, duration:3 }},
     {id:'job_frm_roots',   name:'대지의 뿌리', icon:'🌱', type:'passive', desc:'END+8. 매 턴 식량+3. 저주 저항 소폭 상승.', mpCost:0, rarity:'uncommon'},
   ]},
  {id:'scholar', name:'학자', icon:'📖🌍', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 6 C10 4.5 6.5 4 4 4.5 L4 18 C6.5 17.5 10 18 12 19.5 C14 18 17.5 17.5 20 18 L20 4.5 C17.5 4 14 4.5 12 6 Z" stroke-linejoin="round"/><path d="M12 6 L12 19.5" stroke-width="1.1"/></g><g transform="translate(6,6) scale(0.62)"><circle cx="12" cy="12" r="9" stroke-width="1.3"/><path d="M3 12 C3 12 7 9 12 12 C17 15 21 12 21 12" stroke-width="1.1"/><path d="M12 3 C12 3 9 7 12 12 C15 17 12 21 12 21" stroke-width="1.1"/></g></svg>`, category:'social', parentId:'wanderer', tier:2,
   desc:'모든 학문을 탐구하며 지식으로 세상을 바꾸는 지식인.',
   lore:'학자는 모르는 것을 만났을 때 두려워하지 않고 기뻐한다. 그것이 학자와 다른 직업의 차이다. 방랑자 시절 보고 들은 모든 것이 이제 연구 재료가 된다. 학자의 서재에는 아직 해석되지 않은 유물, 검증 중인 이론, 세 개의 언어로 된 쪽지가 동시에 펼쳐져 있다. "알기 위해 산다"는 이 직업의 가장 솔직한 동기다. 그 지식이 세상을 구할지, 무너뜨릴지는 알 수 없다.',
   statFocus:['int','per'], howToGet:'📖 연구 행동 15회 + 🧠 지성 68 + 🎒 「고대 지식의 편린」 아이템 보유',
   conditionHint:'도서관이나 유적에서 찾을 수 있는 「고대 지식의 편린」을 해독하는 과정에서 학자로서의 첫 걸음을 내딛게 된다.',
   unlockCondition:{type:'action_stat', pattern:'research', minCount:15, minInt:68, requireItem:'고대 지식의 편린', desc:'연구 15회·지성 68·편린 보유'},
   skills:[
     {id:'job_sch_lore',    name:'고대 지식',  icon:'📖', type:'active',  desc:'적의 약점·이력 완전 분석. 전투 유리 판정+25%.', mpCost:10, rarity:'uncommon',
       effects:{ kind:'statBoost', statMod:{int:14,per:10} }},
     {id:'job_sch_memory',  name:'박학다식',   icon:'🧠', type:'passive', desc:'INT+12. 미지의 현상·언어 자동 해독.', mpCost:0, rarity:'uncommon'},
   ]},

  // ══ 궁수 파생 (5종) ══
  {id:'sniper', name:'스나이퍼', icon:'🎯🏹', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z"/><path d="M5 19 L6 15 L9 18 Z"/><path d="M3 12 C3 12 8 10 12 3" stroke-width="1.3"/></g></svg>`, category:'ranged', parentId:'archer', tier:2,
   desc:'극한의 사거리와 정확도로 단 한 발에 표적을 제압하는 저격 전문가.',
   lore:'스나이퍼에게 전투는 1분도 안 걸리지만, 그 준비는 몇 시간이다. 바람의 방향, 표적의 호흡 패턴, 빛의 각도 — 이 모든 것을 읽고 나서야 비로소 방아쇠를 당긴다. 놓치는 것은 기술의 실패가 아니라 판단의 실패다. 스나이퍼들 사이에서 "두 번째 기회는 없다"는 말은 격언이 아니라 사실이다. 한 발이 전쟁의 결과를 바꿨다는 이야기는 언제나 스나이퍼와 함께 전해진다.',
   statFocus:['rng','per'], howToGet:'🔭 지각 75 + 🎯 원거리 대성공 15회 + 💬 NPC 「전설의 저격수」 호감도 80+',
   conditionHint:'은퇴한 전설의 저격수를 찾아라. 그의 신뢰를 얻어야 비법을 전수받을 수 있다. 충분한 공적을 쌓고 그를 도우면 마음이 열린다.',
   unlockCondition:{type:'stat_action', minPer:75, minRangeCrit:15, npcAffection:{name:'전설의 저격수', min:80}, desc:'지각 75·원거리 대성공 15회·NPC 호감 80+'},
   skills:[
     {id:'job_snp_headshot', name:'헤드샷',      icon:'🎯', type:'active',  desc:'즉사 판정 포함 초고배율 저격. 회피 불가.', mpCost:20, rarity:'rare',
       effects:{ kind:'damage', statSource:{rng:0.6,crit:0.4}, damageMult:1.15, element:'physical' }},
     {id:'job_snp_scope',    name:'완벽 조준',   icon:'🔭', type:'passive', desc:'PER+15. 원거리 공격 치명타율+25%.', mpCost:0, rarity:'rare'},
     {id:'job_snp_pierce',   name:'관통 저격',   icon:'💥', type:'active',  desc:'[헤드샷 선행] 일렬로 선 적 전체 관통. 전원 치명타.', mpCost:32, rarity:'legendary', prereq:'job_snp_headshot',
       effects:{ kind:'damage', statSource:{rng:0.6,crit:0.4}, damageMult:0.75, hits:3, element:'physical' }},
     {id:'job_snp_calm',     name:'저격수의 침착',icon:'🧊', type:'passive', desc:'[완벽 조준 선행] PER+12. HP가 낮을수록 명중률 오히려 상승.', mpCost:0, rarity:'legendary', prereq:'job_snp_scope'},
   ]},
  {id:'ranger', name:'삼림 정찰대', icon:'🌲🏹', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 2 L18 12 L15 12 L20 20 L4 20 L9 12 L6 12 Z" stroke-linejoin="round"/><path d="M12 20 L12 22" stroke-width="1.3"/></g><g transform="translate(6,6) scale(0.62)"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z"/><path d="M5 19 L6 15 L9 18 Z"/><path d="M3 12 C3 12 8 10 12 3" stroke-width="1.3"/></g></svg>`, category:'ranged', parentId:'archer', tier:2,
   desc:'숲과 야생을 자유롭게 누비며 적을 기습하는 자연의 수호자.',
   lore:'삼림 정찰대는 군대의 눈이자 귀다. 본대가 닿기 전에 이미 다녀갔고, 본대가 물러난 후에도 아직 남아 있다. 숲은 그들에게 미로가 아니라 집이다. 이파리 하나의 흔들림, 새소리의 갑작스러운 중단 — 이것들이 그들의 언어다. 문명이 닿지 않는 곳을 지키는 자들이기에, 그들의 이름은 역사책보다 나무에 더 많이 새겨져 있다.',
   statFocus:['per','agi'], howToGet:'궁수로 야생/자연 행동 12회 + 민첩 65',
   unlockCondition:{type:'action_stat', minAgi:65, minNatureCount:12, desc:'민첩 65·야생 행동 12회'},
   skills:[
     {id:'job_rng_ambush',   name:'숲의 기습',   icon:'🌲', type:'active',  desc:'지형 이용 기습. 자연 속에서 은신+공격 동시.', mpCost:15, rarity:'uncommon',
       effects:{ kind:'damage', statSource:{per:0.5,agi:0.5}, damageMult:0.6, element:'physical' }},
     {id:'job_rng_nature',   name:'자연의 감각', icon:'🍃', type:'passive', desc:'AGI+10. 야외 전투 시 모든 판정+15%.', mpCost:0, rarity:'uncommon'},
     {id:'job_rng_pack',     name:'맹수 소환',   icon:'🐺', type:'active',  desc:'[숲의 기습 선행] 야생 동물을 불러 전투에 동참시킴 (3턴).', mpCost:26, rarity:'rare', prereq:'job_rng_ambush',
       effects:{ kind:'summon', baseCount:1, countByLocation:{battlefield:1, default:0}, maxActive:2, statScaling:{source:'locationTier', mult:0.8}, levelScaling:0.12 }},
     {id:'job_rng_oneness',  name:'자연과의 합일',icon:'🌳', type:'passive', desc:'[자연의 감각 선행] PER+12. 야외 전투 시 매 턴 HP·MP 소량 자동 회복.', mpCost:0, rarity:'rare', prereq:'job_rng_nature'},
   ]},
  {id:'magic_archer', name:'마법 궁수', icon:'✨🏹', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 2 L13.5 8.5 L20 7 L15 12 L18 18.5 L12 15 L6 18.5 L9 12 L4 7 L10.5 8.5 Z" stroke-linejoin="round"/></g><g transform="translate(6,6) scale(0.62)"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z"/><path d="M5 19 L6 15 L9 18 Z"/><path d="M3 12 C3 12 8 10 12 3" stroke-width="1.3"/></g></svg>`, category:'ranged', parentId:'archer', tier:2,
   desc:'화살에 마력을 불어넣어 원거리와 마법을 동시에 구사하는 하이브리드.',
   lore:'마법 궁수는 두 스승을 섬긴다 — 활쏘기의 정밀함과 마법의 유연함. 두 가지를 완성한 자는 드물지만, 완성했을 때의 위력은 그 어느 쪽도 넘어선다. 화살이 불꽃이 되고, 바람이 되고, 얼음이 된다. 마법사는 거리가 없고, 궁수는 마법이 없다 — 마법 궁수는 그 두 한계 모두를 넘은 자다. 두 세계의 이방인이지만, 그 자리가 가장 강력한 위치이기도 하다.',
   statFocus:['rng','mgc'], howToGet:'궁수로 마법 사용 행동 10회 + 마법 60',
   unlockCondition:{type:'stat_action', minMagic:60, minMagicCount:10, desc:'마법 60·마법 사용 10회'},
   skills:[
     {id:'job_ma_arrow',    name:'원소 화살',   icon:'✨', type:'active',  desc:'속성 마력이 깃든 화살. 속성 약점 자동 부여.', mpCost:22, rarity:'rare',
       effects:{ kind:'damage', statSource:{rng:0.5,mgc:0.5}, damageMult:0.85, element:'physical' }},
     {id:'job_ma_infuse',   name:'마력 주입',   icon:'🔮', type:'passive', desc:'MGC+10. 원거리 공격에 마법 효과 자동 부여.', mpCost:0, rarity:'uncommon'},
     {id:'job_ma_barrage',  name:'원소 연사',   icon:'🌈', type:'active',  desc:'[원소 화살 선행] 4원소 화살 동시 발사. 각각 다른 속성 적용.', mpCost:34, rarity:'legendary', prereq:'job_ma_arrow',
       effects:{ kind:'damage', statSource:{rng:0.5,mgc:0.5}, damageMult:0.4, hits:4, element:'physical' }},
     {id:'job_ma_hybrid',   name:'궁마 일체',   icon:'🎇', type:'passive', desc:'[마력 주입 선행] RNG+10·MGC+10. 화살과 마법 스킬 쿨다운 서로 공유 안 함.', mpCost:0, rarity:'legendary', prereq:'job_ma_infuse'},
   ]},
  {id:'crossbow_master', name:'석궁 전문가', icon:'🔩🏹', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="5" stroke-width="1.3"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><path d="M12 3 L12 5 M12 19 L12 21 M3 12 L5 12 M19 12 L21 12" stroke-width="1.2"/></g><g transform="translate(6,6) scale(0.62)"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z"/><path d="M5 19 L6 15 L9 18 Z"/><path d="M3 12 C3 12 8 10 12 3" stroke-width="1.3"/></g></svg>`, category:'ranged', parentId:'archer', tier:2,
   desc:'강력한 석궁과 특수 볼트로 방어구를 꿰뚫는 공성 궁수.',
   lore:'석궁은 훈련 없는 병사도 쓸 수 있지만, 석궁 전문가는 그것을 예술로 만든다. 특수 제작된 볼트 하나가 갑옷을 입은 기사를 쓰러뜨리는 광경을 본 귀족들은 기사 제도를 위협한다며 석궁을 금지했다. 그래서 석궁 전문가들은 언제나 금지와 실용 사이의 경계에 선다. 가장 민주적인 무기를 가장 정교하게 다루는 역설적인 장인들.',
   statFocus:['rng','str'], howToGet:'궁수로 근력 65 + 연속 명중 10회',
   unlockCondition:{type:'stat_action', minStr:65, minHitStreak:10, desc:'근력 65·연속 명중 10회'},
   skills:[
     {id:'job_cbm_pierce',  name:'관통 볼트',   icon:'🔩', type:'active',  desc:'방어력 완전 무시. 다중 적 관통.', mpCost:18, rarity:'rare',
       effects:{ kind:'damage', statSource:{rng:0.5,str:0.5}, damageMult:0.75, hits:2, element:'physical' }},
     {id:'job_cbm_reload',  name:'고속 장전',   icon:'⚙️', type:'passive', desc:'STR+8. 매 턴 추가 사격 1회 발동 확률 30%.', mpCost:0, rarity:'uncommon'},
     {id:'job_cbm_siege',   name:'공성 볼트',   icon:'💣', type:'active',  desc:'[관통 볼트 선행] 광역 폭발 볼트. 건물·방어구 파괴 특화.', mpCost:28, rarity:'legendary', prereq:'job_cbm_pierce',
       effects:{ kind:'damage', statSource:{rng:0.5,str:0.5}, damageMult:1.0, hits:2, element:'physical' }},
     {id:'job_cbm_master',  name:'장인의 손길', icon:'🛠️', type:'passive', desc:'[고속 장전 선행] STR+10. 볼트 소모 없이 무한 사격 가능.', mpCost:0, rarity:'legendary', prereq:'job_cbm_reload'},
   ]},
  {id:'wind_archer', name:'바람의 궁수', icon:'🌬️🏹', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M3 8 L15 8 C17 8 18 6.5 18 5 C18 3.5 17 2.5 15.5 2.5" /><path d="M3 12 L18 12 C20.5 12 21.5 14 21.5 15.5 C21.5 17.5 20 19 18 19" /><path d="M3 16 L11 16 C12.5 16 13.5 17 13.5 18.3 C13.5 19.5 12.5 20.5 11.3 20.5" /></g><g transform="translate(6,6) scale(0.62)"><path d="M5 19 L19 5"/><path d="M19 5 L14 5 L19 10 Z"/><path d="M5 19 L6 15 L9 18 Z"/><path d="M3 12 C3 12 8 10 12 3" stroke-width="1.3"/></g></svg>`, category:'ranged', parentId:'archer', tier:2,
   desc:'바람을 다스려 어떤 상황에서도 화살이 목표를 찾아가게 하는 정령 궁수.',
   lore:'바람의 궁수는 쏘는 것이 아니라 흘려보낸다. 화살이 스스로 길을 찾는 것처럼 보이지만, 사실은 그 바람의 흐름을 읽고 설계한 것이다. 폭풍 속에서 가장 정확하고, 역풍 앞에서 가장 강하다. 바람 정령들이 그들의 화살을 인도한다는 전설이 있다. 바람의 궁수들은 그 말에 답하지 않는다 — 다만, 바람이 부는 날이면 미소 짓는다.',
   statFocus:['agi','rng'], howToGet:'궁수로 민첩 70 + 바람/날씨 관련 행동 8회',
   unlockCondition:{type:'stat_action', minAgi:70, minWindCount:8, desc:'민첩 70·바람 관련 행동 8회'},
   skills:[
     {id:'job_wa_gust',     name:'질풍 난사',   icon:'🌬️', type:'active',  desc:'바람을 타고 화살 5발 연사. 각각 회피 확률 감소.', mpCost:24, rarity:'rare',
       effects:{ kind:'damage', statSource:{agi:0.5,rng:0.5}, damageMult:0.35, hits:5, element:'physical' }},
     {id:'job_wa_tailwind', name:'순풍',         icon:'💨', type:'passive', desc:'AGI+12. 원거리 명중률+20%. 역풍 패널티 무효.', mpCost:0, rarity:'uncommon'},
     {id:'job_wa_cyclone',  name:'선풍의 화살',  icon:'🌀', type:'active',  desc:'[질풍 난사 선행] 회오리 화살. 적을 끌어당기며 지속 피해.', mpCost:30, rarity:'legendary', prereq:'job_wa_gust',
       effects:{ kind:'damage', statSource:{agi:0.5,rng:0.5}, damageMult:1.0, hits:2, element:'physical' }},
     {id:'job_wa_spirit',   name:'바람 정령의 가호',icon:'🍃', type:'passive', desc:'[순풍 선행] AGI+15. 회피율+20%. 원거리 공격 사거리 무제한.', mpCost:0, rarity:'legendary', prereq:'job_wa_tailwind'},
   ]},

  // ══ 성직자 파생 (5종) ══
  {id:'archbishop', name:'대주교', icon:'✝️👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 3 L12 21 M6 9 L18 9" stroke-width="1.8"/></g><g transform="translate(6,6) scale(0.62)"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></g></svg>`, category:'support', parentId:'cleric', tier:2,
   desc:'신의 대리인으로 강력한 신성 마법과 절대적인 권위를 행사하는 최고 성직자.',
   lore:'대주교의 말 한마디는 법보다 무겁고, 왕의 칙령보다 오래 간다. 그 권위는 위협에서 오지 않는다 — 수십 년의 봉사와 믿음이 쌓인 결과다. 신성력이 절정에 달한 대주교들은 "기적을 행한다"는 기록이 남는다. 그러나 가장 위대한 대주교들이 남긴 유언은 언제나 같다 — "나는 신의 도구였을 뿐." 그 겸손이 역설적으로 그들을 신과 가장 가까이 있게 한다.',
   statFocus:['fath','wil'], howToGet:'✝️ 신앙심 80 + 💛 치유 행동 20회 + 🧬 칭호 「신의 증인」 보유 + 🗺️ 「대성당」 방문',
   conditionHint:'대성당에서의 특별한 의식을 통해서만 대주교로 서품받을 수 있다. 「신의 증인」 칭호는 기적을 일으키거나 신성한 장소를 지키는 과정에서 얻는다.',
   unlockCondition:{type:'stat_action', minFaith:80, minHealCount:20, requireTitle:'신의 증인', requireLocation:'대성당', desc:'신앙심 80·치유 20회·칭호·대성당 방문'},
   skills:[
     {id:'job_abp_divine',  name:'신의 심판',   icon:'☀️', type:'active',  desc:'강력한 신성 폭발. 악·언데드에게 5배 피해.', mpCost:35, rarity:'legendary',
       effects:{ kind:'damage', statSource:{fath:1}, damageMult:1.3, element:'light' }},
     {id:'job_abp_grace',   name:'성총',         icon:'✝️', type:'passive', desc:'FATH+15. 아군 전체 HP+20·상태이상 면역.', mpCost:0, rarity:'rare'},
     {id:'job_abp_miracle', name:'기적',        icon:'🕊️', type:'active',  desc:'[신의 심판 선행] 궁극기. 아군 전체 완전 회복 + 즉시 부활.', mpCost:50, rarity:'legendary', prereq:'job_abp_divine', hpRestore:100},
     {id:'job_abp_witness', name:'신의 증인',   icon:'👑', type:'passive', desc:'[성총 선행] WIL+15. 신성 스킬 시전 시 실패 확률 0.', mpCost:0, rarity:'legendary', prereq:'job_abp_grace'},
   ]},
  {id:'crusader', name:'성전사', icon:'⚔️✝️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 3 L12 21 M6 9 L18 9" stroke-width="1.8"/></g></svg>`, category:'combat', parentId:'cleric', tier:2,
   desc:'검과 신앙을 하나로 합쳐 성전을 이끄는 전투 성직자.',
   lore:'성전사의 기도는 전투 중에도 멈추지 않는다. 적을 베면서 신의 이름을 부르는 것이 위선처럼 보일 수 있지만, 그들에게 그것은 가장 진실한 신앙이다 — 지켜야 할 것을 위해 몸을 던지는 것. 성전사들 사이에는 "신은 강자 편이 아니라 옳은 자 편이다"는 믿음이 있다. 그 믿음이 흔들리는 날, 성전사의 신성력도 함께 흔들린다.',
   statFocus:['str','fath'], howToGet:'성직자로 근력 65 + 전투 행동 15회',
   unlockCondition:{type:'stat_action', minStr:65, minCombatCount:15, desc:'근력 65·전투 행동 15회'},
   skills:[
     {id:'job_crs_holy',    name:'성전의 검',   icon:'⚔️', type:'active',  desc:'신성 속성 강타. 악마·언데드 즉사 판정 포함.', mpCost:22, rarity:'rare',
       effects:{ kind:'damage', statSource:{str:0.5,fath:0.5}, damageMult:0.9, element:'light' }},
     {id:'job_crs_fervor',  name:'성전의 열의', icon:'🔥', type:'passive', desc:'STR+10·FATH+8. 신앙심 높을수록 공격력 상승.', mpCost:0, rarity:'uncommon'},
     {id:'job_crs_crusade', name:'성전 선포',   icon:'🚩', type:'active',  desc:'[성전의 검 선행] 아군 전체에 신성 버프 부여. 3턴간 공격에 신성 속성 추가.', mpCost:30, rarity:'legendary', prereq:'job_crs_holy',
       effects:{ kind:'buff', statMod:{fath:18,str:10}, duration:3 }},
     {id:'job_crs_unbroken',name:'꺾이지 않는 신념',icon:'🛡️', type:'passive', desc:'[성전의 열의 선행] STR+12. 신앙심이 60 이상이면 받는 피해 15% 감소.', mpCost:0, rarity:'legendary', prereq:'job_crs_fervor'},
   ]},
  {id:'exorcist', name:'퇴마사', icon:'🔱✝️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 22 L12 8" /><path d="M6 2 L6 10 C6 12 8 13 12 13 C16 13 18 12 18 10 L18 2" /><path d="M6 2 L6 6 M12 2 L12 6 M18 2 L18 6" /></g><g transform="translate(6,6) scale(0.62)"><path d="M12 3 L12 21 M6 9 L18 9" stroke-width="1.8"/></g></svg>`, category:'combat', parentId:'cleric', tier:2,
   desc:'악귀와 마물을 전문적으로 제압하고 봉인하는 신성 전사.',
   lore:'퇴마사는 신앙의 군인이다. 신전에서 성전을 읽는 시간보다 어두운 동굴과 저주받은 건물에서 보내는 시간이 더 많다. 그들이 맞서는 것들은 칼로 베이지 않는다 — 신성력과 의지만이 그것들을 봉인할 수 있다. 퇴마사들은 동료들이 잠든 후에도 오래 깨어 있다. 한 번 봐버린 것들이 쉽게 잊히지 않기 때문이다. 그럼에도 그들은 내일도 어둠 속으로 걸어 들어간다.',
   statFocus:['fath','per'], howToGet:'성직자로 악령/마물 관련 행동 10회 + 신앙심 70',
   unlockCondition:{type:'stat_action', minFaith:70, minExorcCount:10, desc:'신앙심 70·퇴마 행동 10회'},
   skills:[
     {id:'job_exc_banish',  name:'성스러운 봉인', icon:'🔱', type:'active',  desc:'악마·언데드·저주 완전 봉인. 봉인 중 행동 불능.', mpCost:28, rarity:'rare',
       effects:{ kind:'damage', statSource:{fath:0.6,per:0.4}, damageMult:0.85, element:'light' }},
     {id:'job_exc_ward',    name:'방마 결계',     icon:'🛡️', type:'passive', desc:'PER+10. 악령·저주 피해 60% 저항.', mpCost:0, rarity:'uncommon'},
     {id:'job_exc_purge',   name:'대정화',       icon:'✨', type:'active',  desc:'[성스러운 봉인 선행] 광역 정화. 봉인 대상 즉시 소멸.', mpCost:36, rarity:'legendary', prereq:'job_exc_banish',
       effects:{ kind:'damage', statSource:{fath:0.6,per:0.4}, damageMult:1.3, element:'light' }},
     {id:'job_exc_vigil',   name:'불침번의 눈',   icon:'👁️', type:'passive', desc:'[방마 결계 선행] FATH+12. 숨겨진 악령·함정 자동 감지.', mpCost:0, rarity:'rare', prereq:'job_exc_ward'},
   ]},
  {id:'oracle', name:'신탁술사', icon:'🔮✝️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 3 L12 21 M6 9 L18 9" stroke-width="1.8"/></g></svg>`, category:'support', parentId:'cleric', tier:2,
   desc:'신의 계시를 받아 미래를 예언하고 운명을 조작하는 예지자.',
   lore:'신탁술사의 말은 언제나 맞지만, 언제나 이해하기 어렵다. 그것이 신의 배려인지, 신탁술사 자신도 완전히 이해하지 못하기 때문인지는 알 수 없다. 미래를 본다는 것은 축복이기도 하고 저주이기도 하다 — 막을 수 없는 것을 미리 아는 것보다 잔인한 일은 없다. 신탁술사들의 눈에는 언제나 먼 곳을 보는 듯한 시선이 있다. 아마 정말로 먼 곳을 보고 있을 것이다.',
   statFocus:['per','wil'], howToGet:'성직자로 예언/계시 관련 행동 8회 + 지각 72',
   unlockCondition:{type:'stat_action', minPer:72, minVisionCount:8, desc:'지각 72·계시 행동 8회'},
   skills:[
     {id:'job_orc_foresee', name:'예지',         icon:'🔮', type:'active',  desc:'다음 3턴의 적 행동 미리 파악. 회피율 대폭 상승.', mpCost:20, rarity:'rare',
       effects:{ kind:'buff', statMod:{per:16,agi:10}, duration:3 }},
     {id:'job_orc_fate',    name:'운명 조작',    icon:'🌟', type:'passive', desc:'WIL+12. 대실패를 보통 실패로 격하. 1회/전투.', mpCost:0, rarity:'rare'},
     {id:'job_orc_prophecy',name:'대예언',       icon:'📖', type:'active',  desc:'[예지 선행] 이번 전투의 결과를 미리 엿봄. 아군 전체 다음 판정 대성공 확정.', mpCost:34, rarity:'legendary', prereq:'job_orc_foresee',
       effects:{ kind:'buff', statMod:{per:22,wil:16,luk:16}, duration:1 }},
     {id:'job_orc_thread',  name:'운명의 실',    icon:'🧵', type:'passive', desc:'[운명 조작 선행] PER+12. 파티원의 대실패를 대신 흡수 (하루 1회).', mpCost:0, rarity:'legendary', prereq:'job_orc_fate'},
   ]},
  {id:'dark_priest', name:'어둠의 사제', icon:'💀✝️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(-2,-2) scale(0.62)"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></g><g transform="translate(6,6) scale(0.62)"><path d="M12 3 L12 21 M6 9 L18 9" stroke-width="1.8"/></g></svg>`, category:'magic', parentId:'cleric', tier:2,
   desc:'신앙을 버리고 어둠의 신을 섬기며 금지된 성스러운 힘을 사용하는 타락한 성직자.',
   lore:'어둠의 사제는 배신자가 아니다 — 그들은 다른 신을 선택한 자들이다. 빛의 신이 외면한 자들, 기도가 닿지 않던 시간을 보낸 자들이 어둠 속에서 손을 내밀어 온 다른 목소리를 들었다. 그 목소리에 응한 대가로 얻은 힘은 과거의 신성력보다 강하고 더 날카롭다. 교단은 그들을 이단이라 부르지만, 그들이 섬기는 신도 엄연히 이 세계의 일부다.',
   statFocus:['fath','fear'], howToGet:'🌑 업보 50 이상 + 💀 어둠 행동 10회 + 🎒 「이단의 성유」 보유',
   conditionHint:'「이단의 성유」는 터부시된 지하 제단이나 버려진 교단 창고에서 찾을 수 있다. 그것을 바름으로써 어둠의 신과의 계약이 시작된다.',
   unlockCondition:{type:'karma_action', minKarma:50, minDarkCount:10, requireItem:'이단의 성유', desc:'업보 50·어둠 10회·이단의 성유 보유'},
   skills:[
     {id:'job_dp_curse',    name:'신성 저주',   icon:'💀', type:'active',  desc:'신성력으로 강화된 저주. 적 HP 매 턴 -20. 치유 불가.', mpCost:30, rarity:'rare',
       effects:{ kind:'damage', statSource:{fath:0.5,fear:0.5}, damageMult:0.8, element:'dark' }},
     {id:'job_dp_sacrifice', name:'암흑 제물',  icon:'🩸', type:'passive', desc:'FEAR+12. 아군 HP를 소모해 강력한 신성 공격 강화.', mpCost:0, rarity:'rare'},
     {id:'job_dp_eclipse',  name:'식(蝕)의 강림',icon:'🌑', type:'active',  desc:'[신성 저주 선행] 광역 암흑 신성 피해. 대상의 치유 효과를 반전(피해로 전환).', mpCost:38, rarity:'legendary', prereq:'job_dp_curse',
       effects:{ kind:'damage', statSource:{fath:0.5,fear:0.5}, damageMult:1.25, element:'dark' }},
     {id:'job_dp_heresy',   name:'이단의 계약', icon:'📕', type:'passive', desc:'[암흑 제물 선행] FEAR+15. HP 소모형 스킬의 대가가 절반으로 감소.', mpCost:0, rarity:'legendary', prereq:'job_dp_sacrifice'},
   ]},

];

export const JOB_CODEX_KEY = 'tf-job-codex';

export const JOB_MEMORY_KEY = 'tf-job-memory';

export const JOB_HISTORY_KEY = 'tf-job-history';

export const AI_JOB_POOL_KEY = 'tf-ai-job-pool';

export function loadAIJobPool(){ try{ return JSON.parse(lsGet(AI_JOB_POOL_KEY)||'{}'); }catch(e){ return {}; } }
window.loadAIJobPool = loadAIJobPool;

export function saveAIJobPool(d){ try{ lsSet(AI_JOB_POOL_KEY, JSON.stringify(d)); }catch(e){} }
window.saveAIJobPool = saveAIJobPool;

export function addAIJob(job, parentJobId){
  if(!job?.id) return;
  const pool=loadAIJobPool();
  pool[job.id] = { ...job, parentJobId: parentJobId || job.parentJobId || pool[job.id]?.parentJobId || null };
  saveAIJobPool(pool);
}
window.addAIJob = addAIJob;

export function getAIJobsByParent(parentJobId){
  const pool = loadAIJobPool();
  return Object.values(pool).filter(j => j.parentJobId === parentJobId);
}
window.getAIJobsByParent = getAIJobsByParent;

export const JOB_ACTION_KEY = 'tf-job-actions';

export function loadJobCodex(){ try{ return JSON.parse(lsGet(JOB_CODEX_KEY)||'{}'); }catch(e){ return {}; } }
window.loadJobCodex = loadJobCodex;

export function saveJobCodex(d){ try{ lsSet(JOB_CODEX_KEY, JSON.stringify(d)); }catch(e){} }
window.saveJobCodex = saveJobCodex;

export function loadJobMemory(){ try{ return JSON.parse(lsGet(JOB_MEMORY_KEY)||'{}'); }catch(e){ return {}; } }
window.loadJobMemory = loadJobMemory;

export function saveJobMemory(d){ try{ lsSet(JOB_MEMORY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveJobMemory = saveJobMemory;

export function loadJobHistory(){ try{ return JSON.parse(lsGet(JOB_HISTORY_KEY)||'[]'); }catch(e){ return []; } }
window.loadJobHistory = loadJobHistory;

export function saveJobHistory(d){ try{ lsSet(JOB_HISTORY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveJobHistory = saveJobHistory;

export function loadJobActions(){ try{ return JSON.parse(lsGet(JOB_ACTION_KEY)||'{}'); }catch(e){ return {}; } }
window.loadJobActions = loadJobActions;

export function saveJobActions(d){ try{ lsSet(JOB_ACTION_KEY, JSON.stringify(d)); }catch(e){} }
window.saveJobActions = saveJobActions;

export function getAllBaseJobs(){
  const base = [...(typeof BASE_JOBS!=='undefined'?BASE_JOBS:[]),
                ...(typeof TIER2_JOBS!=='undefined'?TIER2_JOBS:[])];
  const hidden = [...(typeof HIDDEN_JOBS!=='undefined'?HIDDEN_JOBS:[]),
                  ...(typeof HIDDEN_JOBS_EPIC!=='undefined'?HIDDEN_JOBS_EPIC:[])];
  hidden.forEach(hj=>{ if(!base.find(j=>j.id===hj.id)) base.push(hj); });
  // AI 생성 직업 풀 포함
  Object.values(loadAIJobPool()).forEach(aj=>{ if(!base.find(j=>j.id===aj.id)) base.push(aj); });
  return base;
}
window.getAllBaseJobs = getAllBaseJobs;

export function findJob(id){ return getAllBaseJobs().find(j=>j.id===id); }
window.findJob = findJob;

export function discoverJob(jobId, howDiscovered){
  const codex = loadJobCodex();
  if(codex[jobId]) return; // 이미 발견
  const job = findJob(jobId);
  codex[jobId] = {
    discoveredAt: new Date().toISOString(),
    howDiscovered: howDiscovered || job?.howToGet || '알 수 없음',
    timesPlayed: 0,
    parentId: job?.parentId || null,
    tier: job?.tier || 1,
  };
  saveJobCodex(codex);
  toast('📖 직업 도감 등록: ' + (job?.icon||'') + ' ' + (job?.name||jobId), 3000);
}
window.discoverJob = discoverJob;

export function rememberJob(jobId, cycle){
  const mem = loadJobMemory();
  if(!mem[jobId]) mem[jobId] = { count: 0, firstAt: new Date().toISOString(), cycles: [] };
  mem[jobId].count = (mem[jobId].count || 0) + 1;
  mem[jobId].lastAt = new Date().toISOString();
  if(!Array.isArray(mem[jobId].cycles)) mem[jobId].cycles = [];
  if(typeof cycle === 'number' && !mem[jobId].cycles.includes(cycle)) mem[jobId].cycles.push(cycle);
  saveJobMemory(mem);
}
window.rememberJob = rememberJob;

export function getJobUnlockDiscount(jobId){
  const mem = loadJobMemory();
  const count = mem[jobId]?.count || 0;
  if(count === 0) return 1.0;   // 처음: 100% 조건
  if(count === 1) return 0.6;   // 2회차: 40% 완화
  if(count === 2) return 0.4;   // 3회차: 60% 완화
  return 0.25;                   // 4회차+: 75% 완화
}
window.getJobUnlockDiscount = getJobUnlockDiscount;

export function updateActionPattern(msgContent){
  const actions = loadJobActions();
  const lc = msgContent.toLowerCase();
  const patterns = {
    craft:        ['만들','제작','단조','수리','고치','조립','제조','건축'],
    research:     ['연구','실험','탐구','분석','조사','공부','배우','익히','알아'],
    social:       ['설득','대화','노래','공연','이야기','연설','흥정','협상','부탁'],
    hunt:         ['사냥','추적','포획','잡아','쫓','목표','표적'],
    investigate:  ['조사','관찰','추리','단서','증거','파악','살펴'],
    heal:         ['치유','치료','회복','간호','돌봐','살려'],
    trade:        ['거래','구매','판매','교환','흥정','가격','골드'],
    stealth:      ['숨','은신','잠입','몰래','조용','기척없이'],
    summon:       ['소환','불러','계약','강령','정령','악마를 부','악령','사령'],
    magic:        ['마법','주문','마나','마력','시전','발동','마술','마도'],
    ranged:       ['화살','활','저격','총','원거리','투척','던져','사격','겨냥'],
    time:         ['시간','시공','역행','되돌','멈추','빠르게','느려','가속','정지','왜곡'],
    // ── 전투 유형 구분 ──
    combat_aggressive: ['선제','먼저 공격','기습','덤벼','쳐들어','쳐부수','학살','무조건 싸우','싸움을 걸'],
    combat_defensive:  ['막아','방어','피하','도망','달아','어쩔 수 없','지키','보호','반격','당해서','습격당','쫓겨','포위'],
    combat_avoid:      ['싸움을 피','전투를 피','싸우지 않','평화롭게','대화로 해결','협상으로','무기를 내려','항복','화해','싸움 없이','피를 흘리지'],
  };
  Object.entries(patterns).forEach(([key, words])=>{
    if(words.some(w=>lc.includes(w))){
      actions[key] = (actions[key]||0) + 1;
    }
  });
  saveJobActions(actions);
  // 방랑자라면 파생 직업 체크
  if(S.character?.role === '방랑자' || S.character?.jobId === 'wanderer'){
    checkWandererEvolution(actions);
  }
}
window.updateActionPattern = updateActionPattern;

export function checkWandererEvolution(actions){
  // 최소 15턴 이후에만 제안 (일반 전직과 동일 기준으로 통일)
  if((S.msgCount||0) < 15) return;
  const codex = loadJobCodex();
  const tier2Wanderer = TIER2_JOBS.filter(j=>j.parentId==='wanderer');
  // 이미 팝업이 있으면 스킵
  if(document.getElementById('wanderer-evo-popup')||document.getElementById('job-suggest-popup')) return;
  // 조건 충족된 첫 번째 직업만 처리
  const metJob = tier2Wanderer.find(job=>{
    if(codex[job.id]) return false;
    const cond = job.unlockCondition;
    return cond.pattern && (actions[cond.pattern]||0) >= (cond.minCount||10);
  });
  if(!metJob) return;
  const job = metJob;
  const cond = job.unlockCondition;
  setTimeout(()=>{
    if(document.getElementById('wanderer-evo-popup')||document.getElementById('job-suggest-popup')) return;
    if(typeof showJobSuggestionPopup === 'function'){
      showJobSuggestionPopup([job], 'wanderer', S.msgCount||0);
    } else {
      const _ov = document.createElement('div');
      _ov.id = 'wanderer-evo-popup';
      _ov.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.9);display:flex;align-items:flex-end';
      _ov.innerHTML = `<div style="width:100%;background:#050200;border-top:2px solid var(--gold);padding:16px;font-family:Cinzel,serif">
        <div style="display:flex;color:var(--gold);margin-bottom:8px;transform:scale(1.09)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(job,{size:16}):(job.svgIcon||job.icon)}</div>
        <div style="font-size:13px;color:var(--gold);margin-bottom:4px">${esc(job.name)}</div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:12px">${esc(job.desc)}</div>
        <div style="display:flex;gap:8px">
          <button onclick="offerJobChange('${job.id}');document.getElementById('wanderer-evo-popup')?.remove();S.loading=false;if(typeof renderThinking==='function')renderThinking();if(typeof updateSendBtn==='function')updateSendBtn();if(typeof renderChoices==='function'){if(!S.choices||!S.choices.length)S.choices=['주변을 살피며 상황을 파악한다.','가까운 NPC에게 말을 건다.','다음 행동을 생각한다.'];renderChoices();}"
            style="flex:1;padding:10px;background:var(--gold);border:none;color:#000;font-family:Cinzel,serif;font-size:11px;cursor:pointer">⚡ 전직</button>
          <button onclick="discoverJob('${job.id}','${cond.desc||'방랑자 파생'}');document.getElementById('wanderer-evo-popup')?.remove();S.loading=false;if(typeof renderThinking==='function')renderThinking();if(typeof updateSendBtn==='function')updateSendBtn();if(typeof renderChoices==='function'){if(!S.choices||!S.choices.length)S.choices=['주변을 살피며 상황을 파악한다.','가까운 NPC에게 말을 건다.','다음 행동을 생각한다.'];renderChoices();}"
            style="flex:1;padding:10px;background:#0d0800;border:1px solid var(--border);color:var(--dim);font-family:Cinzel,serif;font-size:11px;cursor:pointer">나중에</button>
        </div>
      </div>`;
      document.body.appendChild(_ov);
    }
  }, 1000);
}
window.checkWandererEvolution = checkWandererEvolution;

export function offerJobChange(jobId){
  const job = findJob(jobId) || { id: jobId, name: jobId, icon: '💼' };
  discoverJob(jobId, '플레이 중 발견');
  // 직업 스킬 부여
  const newSkills = job.skills || [];
  const currentSkills = loadJobSkills();
  const withMeta = newSkills.map(s=>({...s, scenario:S.scenario?.id||'custom', jobRole:job.name}));
  saveJobSkills([...currentSkills, ...withMeta]);
  const unlocked = loadSkills();
  newSkills.forEach(s=>{ unlocked[s.id]=true; });
  saveSkills(unlocked); S.unlockedSkills=unlocked;
  // 히스토리 기록
  const hist = loadJobHistory();
  hist.push({ jobId, jobName:job.name, changedAt:new Date().toISOString(), turn:S.msgCount });
  saveJobHistory(hist);
  // 캐릭터 직업 변경
  if(S.character){ S.character = {...S.character, role:job.name, jobId, jobIcon:job.icon}; updateCharHeader(); }
  toast('⚡ ' + job.icon + ' ' + job.name + ' 전직 완료!', 3500);
  if(typeof dramaticJobChange==='function') dramaticJobChange(job.name, job.icon||'⚡');
  if(typeof _addTimelineOnJob==='function') _addTimelineOnJob(job.name, job.icon);
  if(typeof saveDiaryEntry==='function') saveDiaryEntry('job', `${job.icon||''} ${job.name} 전직 완료!`, S.msgCount);
  if(typeof addTimelineEvent==='function') addTimelineEvent('job', `${job.icon||'💼'} ${job.name} 전직`, {icon:job.icon||'💼'});
}
window.offerJobChange = offerJobChange;

export const JOB_AUTO_CHECK_KEY = 'tf-job-auto-notified';

export function loadJobAutoNotified(){ try{ return JSON.parse(lsGet(JOB_AUTO_CHECK_KEY)||'{}'); }catch(e){ return {}; } }
window.loadJobAutoNotified = loadJobAutoNotified;

export function saveJobAutoNotified(d){ try{ lsSet(JOB_AUTO_CHECK_KEY, JSON.stringify(d)); }catch(e){} }
window.saveJobAutoNotified = saveJobAutoNotified;

export function checkAutoJobUnlock(){
  if(!S?.character || !S?.stats) return;
  const turn = S.msgCount||0;
  if(turn < 5) return; // 초반 5턴은 체크 안 함
  if(turn % 10 !== 0) return; // 10턴마다만 체크

  const currentJobId = S.character?.jobId || S.character?.role || 'wanderer';
  const pool = loadAIJobPool();
  const allJobs = Object.values(pool);
  if(!allJobs.length) return;

  const notified = loadJobAutoNotified();
  const JOB_POPUP_COOLDOWN = 50; // 같은 직업 50턴 후 다시 팝업 가능

  // 조건 충족 + 쿨다운 지난 직업 찾기
  const eligible = allJobs.filter(job=>{
    if(!job.id) return false;
    // 이미 현재 직업이거나 같은 직업이면 스킵
    if(job.id === currentJobId) return false;
    // 이미 전직한 직업 스킵
    const history = typeof loadJobHistory==='function' ? loadJobHistory()||[] : [];
    // [B36 FIX] UI 수동 직업 변경(offerJobChange)만 {jobId,...} 필드명으로
    // 기록해 h.to 참조에서 누락되던 버그. 두 필드명 모두 확인.
    if(history.some(h=>h.to===job.id || h.jobId===job.id)) return false;
    // 쿨다운 체크
    const lastNotify = notified[job.id]||0;
    if(turn - lastNotify < JOB_POPUP_COOLDOWN) return false;
    // 조건 체크
    try{
      const cond = window.checkJobCondition(job);
      return cond.met;
    }catch(e){ return false; }
  });

  if(!eligible.length) return;

  // 가장 tier가 높은 것 우선 (최대 3개)
  const sorted = eligible.sort((a,b)=>(b.tier||1)-(a.tier||1)).slice(0,3);

  // 쿨다운 업데이트
  sorted.forEach(job=>{ notified[job.id] = turn; });
  saveJobAutoNotified(notified);

  // 팝업 (약간 딜레이로 서사 텍스트 렌더 후 표시)
  setTimeout(()=>{
    if(typeof showJobSuggestionPopup === 'function'){
      showJobSuggestionPopup(sorted, currentJobId, turn, {
        reason: `조건 달성 — ${sorted.map(j=>j.name).join(', ')} 전직 가능`
      });
      toast('💼 전직 가능한 직업이 생겼습니다!', 2500);
    }
  }, 1500);
}
window.checkAutoJobUnlock = checkAutoJobUnlock;

window.checkAutoJobUnlock = checkAutoJobUnlock;

// [버그 수정] 이 자리에 있던 hookAutoJobCheck는 window.sendMsg를 감싸는
// 방식이라(quest/086이 sendMsg를 로컬 바인딩으로 직접 호출해 재할당이
// 도달 못 함 — 다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않아,
// 전직 조건을 채워도 자동 전직 제안 팝업이 절대 뜨지 않았다.
// checkAutoJobUnlock()은 자체적으로 턴 간격(10턴마다)을 게이트하므로
// quest/086의 sendMsg() 응답 후처리 블록에 네이티브로 연결했다.

export const JOB_GEN_CACHE_KEY = 'tf-job-gen-cache';

export function loadJobGenCache(){ try{ return JSON.parse(lsGet(JOB_GEN_CACHE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadJobGenCache = loadJobGenCache;

export function saveJobGenCache(d){ try{ lsSet(JOB_GEN_CACHE_KEY, JSON.stringify(d)); }catch(e){} }
window.saveJobGenCache = saveJobGenCache;

// ══════════════════════════════════════════════════════════════════
// 로컬 전직 트리 생성 엔진 (AI 미사용) — 부모 직업의 category(전투/마법/
// 은신/제작/사교/지원/특수)마다 4가지 방향성(원형) 템플릿을 두고,
// 그 중 서로 다른 3개를 뽑아 "공격/방어/전략 등 다양한 방향"이라는
// 원래 설계 의도를 재현한다. 스킬 4개(기초 active/passive + prereq로
// 이어지는 심화 active/passive)도 함께 조합한다.
//
// [실제 언락 조건 체크 로직 확인 결과] checkAutoJobUnlock의 조건 판정은
// minStr/minMgc/minWil/minInt/minLuk/minFear/minFaith 등 정해진 필드만
// 읽는다 — requireQuest/requireItem/requireLocation 같은 필드는 애초에
// 어디서도 검사되지 않는 표시용 텍스트였다. 그래서 로컬 버전은 실제로
// 체크되는 스탯 조건만 부여하고, 존재하지도 않는 퀘스트/아이템/장소
// 이름을 지어내지 않는다 — 오히려 원래보다 더 정직한 조건이 된다.
// ══════════════════════════════════════════════════════════════════
const JOB_ADVANCE_BANK = {
  combat: [
    { name:'검투사', icon:'🗡️', desc:'화려한 검술로 적을 압도하는 전투 전문가.', statFocus:['str','agi'],
      lore:'검투장에서 살아남은 자만이 이 이름을 얻는다. 화려함과 실전성을 동시에 갖춘 검술로 유명하며, 대중 앞에서 싸우는 것을 두려워하지 않는다. 그 화려한 몸짓 뒤에는 수많은 실전으로 다져진 냉철함이 숨어 있다.' },
    { name:'철벽 수호자', icon:'🛡️', desc:'무너지지 않는 방어로 동료를 지키는 전사.', statFocus:['end','str'],
      lore:'전장의 방패가 되기를 자처한 이들이다. 누구보다 먼저 위험에 뛰어들고, 누구보다 늦게 물러선다. 그들의 존재만으로도 아군의 사기가 달라진다고 전해진다.' },
    { name:'전장의 책사', icon:'🎯', desc:'전투의 흐름을 읽고 전략적으로 움직이는 전사.', statFocus:['per','str'],
      lore:'힘만으로는 전장을 지배할 수 없다는 것을 깨달은 자들이다. 상대의 습관과 빈틈을 읽어내는 눈썰미가 그들의 진짜 무기다. 냉정한 판단력이 곧 생존의 열쇠가 된다.' },
    { name:'광전사', icon:'💢', desc:'두려움 없이 돌진하는 압도적인 파괴력의 전사.', statFocus:['str','wil'],
      lore:'전장에서 두려움을 완전히 잊어버린 자들이라 전해진다. 그 압도적인 기세 앞에서 물러서지 않는 적은 드물다. 다만 그 힘의 대가로 스스로를 돌보지 않는다는 위험이 따른다.' },
  ],
  magic: [
    { name:'비전 학자', icon:'📖', desc:'마법의 원리를 깊이 탐구하는 학구적인 술사.', statFocus:['int','mgc'],
      lore:'단순히 마법을 쓰는 것을 넘어, 그 원리 자체를 이해하고자 하는 이들이다. 수많은 고서와 실험을 거쳐 자신만의 술식을 완성해간다. 지식에 대한 갈증이 곧 힘의 원천이다.' },
    { name:'원소 지배자', icon:'🔥', desc:'원소의 힘을 자유자재로 다루는 강력한 마법사.', statFocus:['mgc','str'],
      lore:'불·물·대지·바람, 그 근원의 힘과 직접 맞닿은 자들이다. 자연의 힘을 빌리는 것이 아니라 스스로 원소 그 자체가 되어간다고 전해진다. 그만큼 위험하고 매혹적인 길이다.' },
    { name:'영혼 결속자', icon:'👻', desc:'영혼과 정신의 영역을 다루는 신비로운 술사.', statFocus:['wil','mgc'],
      lore:'보이지 않는 것들과 대화하는 법을 익힌 이들이다. 산 자와 죽은 자, 현실과 그 너머의 경계에서 살아간다. 그 대가로 종종 평범한 삶과는 멀어진다.' },
    { name:'금기의 마도사', icon:'🌑', desc:'위험한 지식을 다루는 것을 두려워하지 않는 술사.', statFocus:['mgc','int'],
      lore:'많은 이들이 손대기를 꺼리는 영역에 발을 들인 자들이다. 그 지식은 강력한 만큼 대가도 크다는 것을 알면서도 멈추지 않는다. 세상은 이들을 경계하면서도 그 힘을 부러워한다.' },
  ],
  stealth: [
    { name:'그림자 무희', icon:'🌙', desc:'소리 없이 움직이며 치명적인 일격을 노리는 자.', statFocus:['agi','luk'],
      lore:'그림자 속에서 태어나 그림자 속에서 살아가는 이들이다. 존재를 드러내지 않는 것이 곧 그들의 가장 큰 무기다. 한 번의 기회를 놓치지 않는 냉정함이 필요하다.' },
    { name:'정보상', icon:'🗝️', desc:'은밀한 정보망으로 세상을 움직이는 자.', statFocus:['per','int'],
      lore:'칼보다 정보가 더 강력한 무기임을 아는 이들이다. 도시 곳곳에 심어둔 눈과 귀로 누구보다 빠르게 진실에 다가선다. 그 정보를 어떻게 쓰느냐가 그들의 진짜 실력이다.' },
    { name:'덫사냥꾼', icon:'🪤', desc:'함정과 계략으로 적을 무력화시키는 전문가.', statFocus:['agi','per'],
      lore:'정면 승부보다 준비된 함정을 신뢰하는 자들이다. 상대가 눈치채기도 전에 이미 승부는 갈려 있는 경우가 많다. 인내심과 치밀함이 그들의 진짜 재능이다.' },
    { name:'야반의 자객', icon:'🗡️', desc:'단 한 번의 기회로 승부를 끝내는 암살 전문가.', statFocus:['agi','str'],
      lore:'그들이 움직였다는 사실조차 아무도 알아채지 못한다고 전해진다. 목표를 향한 집요함과 냉정함이 이 길을 걷는 자의 자격이다. 소문만 무성할 뿐 실체를 본 이는 드물다.' },
  ],
  craft: [
    { name:'전설의 대장장이', icon:'🔨', desc:'평범한 재료로 비범한 물건을 만들어내는 장인.', statFocus:['str','per'],
      lore:'수천 번의 담금질 끝에 자신만의 경지에 오른 이들이다. 만들어낸 물건 하나하나에 장인의 혼이 깃든다고 전해진다. 완벽을 향한 집착이 곧 그들의 원동력이다.' },
    { name:'연금술사', icon:'⚗️', desc:'물질의 본질을 꿰뚫어 새로운 것을 창조하는 자.', statFocus:['int','mgc'],
      lore:'세상 만물의 근원을 탐구하며 끊임없이 실험을 거듭하는 이들이다. 때로는 위험한 실패도 감수해야 하는 길이다. 그 끝에 무엇이 있을지는 아무도 알지 못한다.' },
    { name:'명공', icon:'🪵', desc:'섬세한 손끝으로 예술의 경지에 이른 제작자.', statFocus:['per','wil'],
      lore:'단순한 기술을 넘어 예술의 경지를 추구하는 이들이다. 완성된 작품 하나에 담긴 시간과 정성은 값으로 매길 수 없다고 전해진다. 느리지만 확실한 길을 택한 자들이다.' },
    { name:'기관공학자', icon:'⚙️', desc:'복잡한 장치와 기계를 다루는 독창적인 발명가.', statFocus:['int','str'],
      lore:'톱니바퀴와 태엽 속에서 새로운 가능성을 찾아내는 이들이다. 남들이 불가능하다 여기는 것을 현실로 만들어내는 데서 희열을 느낀다. 세상을 바꿀 발명은 늘 이런 이들의 손에서 태어난다.' },
  ],
  social: [
    { name:'만인의 웅변가', icon:'🎙️', desc:'말 한마디로 군중의 마음을 움직이는 자.', statFocus:['wil','per'],
      lore:'말의 힘을 그 누구보다 잘 아는 이들이다. 논리와 감정을 자유자재로 넘나들며 청중을 사로잡는다. 그 영향력은 때로 검보다 강력하다고 전해진다.' },
    { name:'그림자 협상가', icon:'🤝', desc:'양측의 이해관계를 조율하는 은밀한 중재자.', statFocus:['per','wil'],
      lore:'겉으로 드러나지 않는 곳에서 진짜 결정이 이뤄진다는 것을 아는 이들이다. 신뢰를 얻는 데는 오래 걸리지만, 한번 맺은 관계는 쉽게 끊어지지 않는다. 균형을 지키는 것이 그들의 진짜 기술이다.' },
    { name:'궁정의 책략가', icon:'👑', desc:'권력의 흐름을 읽고 판을 짜는 정치가.', statFocus:['int','wil'],
      lore:'궁정의 복잡한 셈법 속에서 살아남는 법을 터득한 이들이다. 겉으로 보이는 것과 실제로 벌어지는 일이 다르다는 것을 누구보다 잘 안다. 신중함과 대담함을 동시에 갖춰야 하는 길이다.' },
    { name:'떠돌이 이야기꾼', icon:'📜', desc:'세상 곳곳의 이야기를 전하며 마음을 얻는 자.', statFocus:['wil','luk'],
      lore:'한 곳에 머무르지 않고 세상을 떠돌며 사람들의 이야기를 모으는 이들이다. 그들이 전하는 이야기 하나에 웃고 우는 사람들이 많다. 소박해 보이지만 그 영향력은 결코 작지 않다.' },
  ],
  support: [
    { name:'생명의 수호자', icon:'💚', desc:'동료의 생명을 지키는 데 전념하는 치유사.', statFocus:['fath','wil'],
      lore:'누군가를 살리는 일에 자신의 모든 것을 거는 이들이다. 전장 한가운데서도 두려움보다 사명감이 앞선다. 그들이 있는 곳에서는 쉽게 절망하지 않는다고 전해진다.' },
    { name:'축복의 사도', icon:'✨', desc:'신성한 힘으로 동료를 뒷받침하는 지원가.', statFocus:['fath','mgc'],
      lore:'보이지 않는 힘을 믿고 그 힘을 나누는 법을 익힌 이들이다. 그들의 축복은 단순한 기술이 아니라 진심에서 우러나온다고 전해진다. 믿음이 깊을수록 그 힘도 강해진다.' },
    { name:'전략적 조력자', icon:'📋', desc:'동료의 능력을 극대화시키는 지원 전문가.', statFocus:['int','per'],
      lore:'스스로 앞에 나서기보다 동료를 빛나게 하는 것을 택한 이들이다. 누구보다 팀 전체의 흐름을 읽는 눈을 가지고 있다. 그 헌신이 결국 승리의 열쇠가 되는 경우가 많다.' },
    { name:'불굴의 버팀목', icon:'🕊️', desc:'어떤 상황에서도 동료를 포기하지 않는 지원가.', statFocus:['wil','end'],
      lore:'가장 어려운 순간에 가장 필요한 사람이 되고자 하는 이들이다. 자신의 안위보다 동료의 안전을 우선하는 것이 몸에 배어 있다. 그 헌신이 결국 신뢰로 돌아온다고 전해진다.' },
  ],
  special: [
    { name:'경계를 넘은 자', icon:'🌌', desc:'평범한 분류로는 설명할 수 없는 독자적인 존재.', statFocus:['wil','mgc'],
      lore:'기존의 어떤 틀에도 완전히 들어맞지 않는 존재들이다. 스스로 길을 만들어가야 하기에 그만큼 고독하다. 하지만 그 고독이야말로 그들을 특별하게 만든다.' },
    { name:'운명의 이단아', icon:'🔮', desc:'정해진 운명을 거부하고 자신의 길을 개척하는 자.', statFocus:['luk','wil'],
      lore:'예정된 결말을 거부하기로 결심한 이들이다. 남들이 정해준 길이 아닌 스스로 개척한 길을 걷는다. 그 대가로 늘 불확실함과 마주해야 한다.' },
    { name:'세계의 관찰자', icon:'👁️', desc:'세상의 이면을 꿰뚫어 보는 초연한 존재.', statFocus:['per','int'],
      lore:'많은 것을 보았기에 쉽게 놀라지 않는 이들이다. 세상을 한 발 떨어져서 바라보는 시선이 그들의 가장 큰 무기다. 그만큼 세상과의 거리감도 함께 짊어지고 산다.' },
    { name:'혼돈의 방랑자', icon:'🌪️', desc:'예측할 수 없는 힘으로 스스로도 놀라게 하는 자.', statFocus:['luk','mgc'],
      lore:'질서보다 혼돈 속에서 오히려 편안함을 느끼는 이들이다. 그 누구도, 심지어 자신조차도 다음 행동을 예측하기 어렵다. 위험하지만 그만큼 강렬한 존재감을 지닌다.' },
  ],
};
const JOB_BASE_ACTIVE_NAMES = ['일격','돌진','섬광타','기습'];
const JOB_BASE_PASSIVE_NAMES = ['본능','숙련','평정심','예리한 감각'];
const JOB_ADV_ACTIVE_NAMES = ['필살의 일격','파괴의 선율','절명의 한 수','종언의 일격'];
const JOB_ADV_PASSIVE_NAMES = ['불굴의 의지','완성된 경지','초월한 감각','흔들림 없는 마음'];
const JOB_STAT_TO_UNLOCK_FIELD = { str:'minStr', mgc:'minMgc', wil:'minWil', int:'minInt', luk:'minLuk', fear:'minFear', fath:'minFaith' };
function _pickJob(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
// [복원] aiSpecs를 주면(AI가 만든 {name,icon,desc,lore,statFocus} 배열,
// 검증된 것만) 뱅크 템플릿 대신 그걸 쓴다 — 스킬 이름/수치/prereq 연결
// 같은 게임 밸런스에 민감한 부분은 항상 이 함수가 계산해서, AI는 순수
// 플레이버(이름/설명/배경)만 책임지고 밸런스는 절대 못 건드리게 한다.
export function composeLocalNextJobs(currentJobId, count=3, aiSpecs=null){
  const job = findJob(currentJobId);
  const category = (job && JOB_ADVANCE_BANK[job.category]) ? job.category : 'special';
  const tier = (job?.tier||1) + 1;
  const templates = (Array.isArray(aiSpecs) && aiSpecs.length)
    ? aiSpecs.slice(0, count)
    : (JOB_ADVANCE_BANK[category]||JOB_ADVANCE_BANK.special).slice().sort(()=>Math.random()-0.5).slice(0, count);

  // [버그 수정] 클라우드 프롬프트는 char.race를 넣어 참고하게 하는데,
  // 로컬 폴백은 현재 직업의 category+tier로만 후보를 고르고 종족은
  // 전혀 안 봤다(전수조사로 발견). 밸런스(스탯/스킬)는 그대로 category/
  // tier 기반으로 두고, 후보 중 하나의 lore에만 종족 관련 한 문장을
  // 40% 확률로 덧붙인다 — 3개 다 붙이면 반복되는 느낌이라 하나만.
  const char = S.character||{};
  const race = char.race ? RACE_DEFS.find(r=>r.name===char.race) : null;
  const raceFlavorIdx = (race && Math.random()<0.4) ? Math.floor(Math.random()*templates.length) : -1;

  return templates.map((t,i)=>{
    const jobId = 'aidq_job_'+Date.now()+'_'+i+'_'+Math.random().toString(36).slice(2,6);
    const primaryStat = t.statFocus[0], secondaryStat = t.statFocus[1]||t.statFocus[0];
    const baseActiveId = jobId+'_ba', basePassiveId = jobId+'_bp';
    const threshold = 60 + tier*5;
    const unlockField = JOB_STAT_TO_UNLOCK_FIELD[primaryStat];
    const unlockCondition = unlockField
      ? { type:'stat_action', [unlockField]: threshold, desc: `${primaryStat.toUpperCase()} ${threshold} 이상` }
      : { type:'custom', desc: '충분한 경험을 쌓으면 자연스럽게 열리는 길' };
    const baseActiveName = _pickJob(JOB_BASE_ACTIVE_NAMES), basePassiveName = _pickJob(JOB_BASE_PASSIVE_NAMES);
    return {
      id: jobId, name: t.name, icon: t.icon, desc: t.desc,
      lore: (i===raceFlavorIdx) ? `${t.lore} ${char.race}인 ${char.name||'그'}에게는 특히 남다른 길이 될 것이다.` : t.lore,
      tier, parentId: currentJobId, howToGet: unlockCondition.desc,
      conditionHint: `${primaryStat.toUpperCase()} 스탯을 꾸준히 올리며 이 방향에 맞는 행동을 반복하면 길이 열린다.`,
      category, statFocus: t.statFocus, unlockCondition,
      skills: [
        { id:baseActiveId, name:baseActiveName, icon:t.icon, type:'active', desc:'적에게 강력한 일격을 가한다.', mpCost:15, rarity:'uncommon',
          effects:{ kind:'damage', statSource:{[primaryStat]:1}, damageMult:0.6, element:'physical' } },
        { id:basePassiveId, name:basePassiveName, icon:t.icon, type:'passive', desc:'전투 감각이 예리해져 판정에 유리해진다.', mpCost:0, rarity:'uncommon',
          effects:{ kind:'statBoost', statMod:{[primaryStat]:8} } },
        { id:jobId+'_aa', name:'['+baseActiveName+' 선행] '+_pickJob(JOB_ADV_ACTIVE_NAMES), icon:t.icon, type:'active', desc:`[${baseActiveName} 선행] 극한까지 끌어올린 필살기를 펼친다.`, mpCost:28, rarity:'rare', prereq:baseActiveId,
          effects:{ kind:'damage', statSource:{[primaryStat]:1}, damageMult:1.0, element:'physical' } },
        { id:jobId+'_ap', name:'['+basePassiveName+' 선행] '+_pickJob(JOB_ADV_PASSIVE_NAMES), icon:t.icon, type:'passive', desc:`[${basePassiveName} 선행] 오랜 수련 끝에 도달한 완성된 경지.`, mpCost:0, rarity:'rare', prereq:basePassiveId,
          effects:{ kind:'statBoost', statMod:{[primaryStat]:16, [secondaryStat]:8} } },
      ],
    };
  });
}
window.composeLocalNextJobs = composeLocalNextJobs;

export async function generateNextJob(currentJobId){
  // [버그 수정] currentTurns가 이 함수 어디에도 선언돼 있지 않아(파라미터도
  // 아니고 지역변수도 아님) strict 모드 ES 모듈에서 아래 코드에 처음
  // 닿는 순간 ReferenceError로 항상 죽던 버그 — 즉 "✨ AI 직업 탐색"
  // 버튼이 지금까지 한 번도 실제로 작동한 적이 없었다. race/064가 쓰는
  // 것과 같은 턴 카운터(loadJobTurns)로 값을 채워 넣어 고쳤다.
  const currentTurns = loadJobTurns()[currentJobId] || 0;
  const loadingEl = document.getElementById('job-gen-loading');
  if(loadingEl) loadingEl.style.display='block';

  // ── [F-BUG 수정] 영구 재사용 체크 (신규) ──────────────────────
  // 기존엔 "같은 부모 직업 + 30턴 이내"일 때만 캐시를 썼는데, 30턴이
  // 지나거나 환생·재플레이로 같은 직업을 다시 만나면 이전에 이미 AI가
  // 만들어준 파생 직업이 AI_JOB_POOL에 그대로 남아있는데도 그 사실을
  // 전혀 조회하지 않고 매번 API를 새로 호출해 완전히 다른 직업 3개를
  // 또 만들어냈다 — API 호출 낭비이자, 스킬 계보가 매번 리셋되어
  // "T1→T2→T3→T4"로 이어지는 진짜 트리가 형성되지 못하는 근본 원인이었다.
  // 이제 이 부모 직업에서 이미 파생시킨 적이 있으면(영구, 시간 제한 없음)
  // API 호출 자체를 생략하고 그 결과를 그대로 재사용한다.
  const existingDerived = getAIJobsByParent(currentJobId);
  if(existingDerived.length){
    if(loadingEl) loadingEl.style.display='none';
    showJobSuggestionPopup(existingDerived, currentJobId, currentTurns);
    toast('💼 이미 발견한 전직 경로 ('+existingDerived.length+'개)', 1800);
    return;
  }

  // 캐시 체크 (같은 직업 30턴 이내 재탐색 시 캐시 반환) — 위 영구
  // 재사용 체크로 대부분 흡수되지만, addAIJob 실패 등 예외 상황을
  // 위한 이중 안전장치로 유지한다.
  const jobCache = loadJobGenCache();
  const cached_job = jobCache[currentJobId];
  if(cached_job && (currentTurns - (cached_job.turn||0)) < 30 && cached_job.jobs?.length){
    if(loadingEl) loadingEl.style.display='none';
    showJobSuggestionPopup(cached_job.jobs, currentJobId, currentTurns);
    toast('💼 이전 탐색 결과 (캐시)', 1500);
    return;
  }

  try{
    // [복원] AI 우선 — 키가 있으면 캐릭터/현재 직업에 맞는 진짜 창의적인
    // 전직 후보 3개(이름/설명/배경/스탯특화만)를 시도하고, 없거나
    // 실패·형식오류면 로컬 뱅크 조합으로 폴백. 스킬 수치/prereq 연결 같은
    // 밸런스는 항상 composeLocalNextJobs가 계산하므로 AI 결과와 무관하게
    // 안전하다.
    const curJob = findJob(currentJobId);
    const char = S?.character||{};
    const jobPrompt = `당신은 TaleForge RPG의 직업 디자이너입니다. 현재 직업에서 파생될 수 있는 다음 단계 직업 3개를 JSON으로 생성하세요.
[캐릭터] ${char.name||'주인공'} (${char.race||'인간'}, Lv.${char.level||1})
[현재 직업] ${curJob?.name||currentJobId} — ${curJob?.desc||''}
[직업 계열] ${curJob?.category||'특수'}
반드시 아래 JSON 배열만 출력하세요(정확히 3개, 다른 텍스트 금지):
[
  {"name":"직업명 (10자 이내)","icon":"이모지1개","desc":"직업 설명 1문장","lore":"이 직업의 유래/배경 1문장","statFocus":["str|mgc|wil|int|luk|fear|fath 중 1~2개"]}
]`;
    const _validateJobSpecs = (raw)=>{
      const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.jobs) ? raw.jobs : null);
      if(!arr || !arr.length) return null;
      const specs = arr.filter(j=>j && j.name && j.desc && Array.isArray(j.statFocus) && j.statFocus.length)
        .map(j=>({ name:j.name, icon:j.icon||'✨', desc:j.desc, lore:j.lore||'', statFocus:j.statFocus }));
      if(!specs.length) return null;
      // [패턴 학습] 진짜 AI가 쓴 직업 설명/유래만 코퍼스에 누적.
      specs.forEach(s=>{
        if(s.desc) recordMarkovSample('job_desc', s.desc);
        if(s.lore) recordMarkovSample('job_lore', s.lore);
      });
      return composeLocalNextJobs(currentJobId, 3, specs);
    };
    const jobs = await tryCloudThenLocalModelThenBank(
      async () => _validateJobSpecs(await callGeminiDirect(jobPrompt)),
      async () => _validateJobSpecs(await callLocalModelJSON(jobPrompt, { maxTokens: 400 })),
      () => composeLocalNextJobs(currentJobId, 3),
      '전직 후보 생성'
    );
    if(!jobs.length) throw new Error('no jobs');
    // 발견 기록 — parentJobId를 함께 저장해 다음 조회 시 재사용 가능하게 함
    jobs.forEach(j=>{ if(!j.id) return; addAIJob(j, currentJobId); discoverJob(j.id, '직업 트리 탐색으로 발견'); });
    // 캐시 저장
    jobCache[currentJobId] = { jobs, turn: currentTurns };
    saveJobGenCache(jobCache);
    showJobSuggestionPopup(jobs, currentJobId, currentTurns);
  }catch(e){
    toast('직업 생성 오류: '+e.message);
  }finally{
    if(loadingEl) loadingEl.style.display='none';
  }
}
window.generateNextJob = generateNextJob;

export function renderJobPanel(){
  const body = document.getElementById('pb-jobs');
  if(!body) return;

  const codex = loadJobCodex();
  const mem = loadJobMemory();
  const allBase = getAllBaseJobs();
  const currentJobId = S.character?.jobId || getJobIdFromName(S.character?.role);
  const hist = loadJobHistory();

  // 카테고리별 분류
  const cats = {
    combat:  { label:'⚔️ 전투', jobs:[] },
    magic:   { label:'🔮 마법', jobs:[] },
    stealth: { label:'🗡️ 은신', jobs:[] },
    craft:   { label:'🔨 제작', jobs:[] },
    social:  { label:'💬 사교', jobs:[] },
    support: { label:'💚 지원', jobs:[] },
    special: { label:'🌍 특수', jobs:[] },
    ai:      { label:'✨ 발견', jobs:[] },
  };

  // 기본 직업 분류
  allBase.forEach(job=>{
    if(cats[job.category]) cats[job.category].jobs.push({ ...job, known: !!codex[job.id]||job.tier===1 });
  });

  // AI 생성 직업 분류
  Object.entries(codex).forEach(([id, info])=>{
    if(!allBase.find(j=>j.id===id)){
      cats.ai.jobs.push({ id, name:id, icon:'✨', category:'ai', tier:info.tier||3, known:true,
        parentId:info.parentId, howToGet:info.howDiscovered, desc:'AI가 생성한 직업', lore: info.lore||'' });
    }
  });

  // 현재 직업 전직 버튼
  const canEvolve = currentJobId && allBase.find(j=>j.parentId===currentJobId);

  body.innerHTML = `
    <!-- 현재 직업 -->
    <div style="padding:10px 12px;background:#1a1005;border:1px solid var(--gold);margin-bottom:8px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--dim);margin-bottom:4px">현재 직업</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:20px">${S.character?.jobIcon||'💼'}</span>
        <div>
          <div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold)">${esc(S.character?.role||'없음')}</div>
          <div style="font-size:9px;color:var(--dim)">${hist.length>0?'전직 '+hist.length+'회':'첫 직업'} · 기억 ${mem[currentJobId]?.count||0}회차</div>
        </div>
        <button class="btn btn-gold" style="margin-left:auto;padding:6px 10px;font-size:9px" onclick="openJobEvolution()">전직 탐색 ▶</button>
      </div>
      ${renderMasteryInfo(currentJobId)}
    </div>

    <!-- 직업 히스토리 -->
    ${hist.length>0?`
    <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px;letter-spacing:1px">직업 히스토리</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
      ${hist.slice(-5).map(h=>`<span style="padding:3px 8px;background:#0d0800;border:1px solid var(--border);font-size:10px;color:#8a7a5a">${esc(h.jobName)}</span>`).join('→')}
    </div>`:''}

    <!-- 도감 통계 -->
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <div style="flex:1;padding:8px;background:#0d0800;border:1px solid var(--border);text-align:center">
        <div style="font-family:Cinzel,serif;font-size:16px;color:var(--gold)">${Object.keys(codex).length}</div>
        <div style="font-size:9px;color:var(--dim)">발견한 직업</div>
      </div>
      <div style="flex:1;padding:8px;background:#0d0800;border:1px solid var(--border);text-align:center">
        <div style="font-family:Cinzel,serif;font-size:16px;color:var(--gold)">${allBase.length}+</div>
        <div style="font-size:9px;color:var(--dim)">전체 직업</div>
      </div>
      <div style="flex:1;padding:8px;background:#0d0800;border:1px solid var(--border);text-align:center">
        <div style="font-family:Cinzel,serif;font-size:16px;color:#a080e0">${Object.keys(mem).length}</div>
        <div style="font-size:9px;color:var(--dim)">기억한 직업</div>
      </div>
    </div>

    <!-- 카테고리별 직업 목록 -->
    ${Object.entries(cats).filter(([,c])=>c.jobs.length>0).map(([catId, cat])=>`
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px;margin-top:10px;letter-spacing:1px">${cat.label}</div>
      ${cat.jobs.map(job=>{
        const isKnown = job.known || job.tier===1;
        const isCurrent = job.id === currentJobId;
        const memCount = mem[job.id]?.count||0;
        const codexInfo = codex[job.id];
        const parentJob = job.parentId ? (allBase.find(j=>j.id===job.parentId)||{name:job.parentId}) : null;
        return `<div style="padding:9px 11px;background:${isCurrent?'#1a1005':'#0d0800'};border:1px solid ${isCurrent?'var(--gold)':isKnown?'#3a2a0a':'#1a1005'};margin-bottom:4px;opacity:${isKnown?1:0.4}">
          <div style="display:flex;align-items:center;gap:7px">
            <span style="font-size:18px">${isKnown?(typeof getEntityIconHTML==='function'?getEntityIconHTML(job,{size:14}):(job?.icon)):'❓'}</span>
            <div style="flex:1;min-width:0">
              <div style="font-family:Cinzel,serif;font-size:10px;color:${isCurrent?'var(--gold)':isKnown?'#c8a96e':'#4a3a2a'}">${isKnown?esc(job.name):'??? (미발견)'}</div>
              ${isKnown&&job.desc?`<div style="font-size:10px;color:var(--dim);line-height:1.4">${esc(job.desc)}</div>`:''}
              ${isKnown&&job.lore?`<div style="font-size:9px;color:#7a6a4a;line-height:1.5;margin-top:3px;font-style:italic;border-left:2px solid #3a2a0a;padding-left:6px">${esc(job.lore)}</div>`:''}
              ${isKnown&&parentJob?`<div style="font-size:9px;color:#4a6fa5;margin-top:2px">↑ ${esc(parentJob.name)}에서 파생</div>`:''}
              ${isKnown&&codexInfo?.howDiscovered?`<div style="font-size:9px;color:#4a3a2a;margin-top:1px">📖 ${esc(codexInfo.howDiscovered)}</div>`:''}
            </div>
            <div style="text-align:right;flex-shrink:0">
              ${isCurrent?'<span style="font-size:9px;color:#60a060">현재</span>':''}
              ${memCount>0?`<div style="font-size:9px;color:#a080e0">${memCount}회차 경험</div>`:''}
              <div style="font-size:9px;color:var(--dim)">${'T'.repeat(job.tier||1)}</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    `).join('')}

    <div id="job-gen-loading" style="display:none;text-align:center;padding:16px;color:var(--dim);font-size:11px">⚙ AI가 직업을 생성 중...</div>

    <!-- 비전투 직업 엔딩 안내 -->
    ${(()=>{
      const CIVILIAN_IDS=['farmer','merchant','blacksmith','bard','healer','alchemist','gravekeeper'];
      const isCiv = CIVILIAN_IDS.includes(currentJobId);
      const CIVILIAN_ENDINGS=[
        {jobId:'farmer',    name:'대지의 수호자',    icon:'🌾', hint:'거래 30회 + 골드 500 + 우호 NPC 5명'},
        {jobId:'merchant',  name:'황금 상단의 전설', icon:'🏮', hint:'거래 50회 + 골드 3000 + 우호 NPC 4명'},
        {jobId:'blacksmith',name:'신화의 장인',      icon:'⚒️', hint:'제작 30회 + 골드 800 + 우호 NPC 3명'},
        {jobId:'bard',      name:'세계를 노래한 자', icon:'🎵', hint:'사교 40회 + 우호 NPC 6명'},
        {jobId:'healer',    name:'빛의 치유자',      icon:'💚', hint:'치유 25회 + 우호 NPC 5명'},
      ];
      const wandererCivEndings = CIVILIAN_ENDINGS.filter(e=>codex[e.jobId]);
      if(!isCiv && wandererCivEndings.length===0) return '';
      return `
      <div style="margin-top:12px;padding:10px 12px;background:#0a150a;border:1px solid #3a5a2a;border-radius:2px">
        <div style="font-family:Cinzel,serif;font-size:10px;color:#60a060;letter-spacing:1px;margin-bottom:6px">🌿 비전투 직업 전용 엔딩</div>
        ${isCiv ? `
        <div style="font-size:10px;color:#80c080;line-height:1.6">
          ✨ 현재 직업으로 <b style="color:#c8a96e">"${esc(CIVILIAN_ENDINGS.find(e=>e.jobId===currentJobId)?.name||'평화 엔딩')}"</b>을 달성할 수 있습니다!<br>
          <span style="color:var(--dim)">조건: ${esc(CIVILIAN_ENDINGS.find(e=>e.jobId===currentJobId)?.hint||'')}</span><br>
          <span style="color:var(--dim)">💡 방어·도주·협상으로 위기를 넘기세요. 어쩔 수 없는 싸움은 괜찮지만, 먼저 덤비는 전투가 잦으면 엔딩 조건이 어긋납니다.</span>
        </div>` : `
        <div style="font-size:10px;color:var(--dim);line-height:1.6">
          방랑자에서 아래 직업으로 전직하면 싸움 없는 고유 엔딩을 노릴 수 있습니다:
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px">
          ${CIVILIAN_ENDINGS.map(e=>{
            const known=codex[e.jobId];
            return `<div style="padding:3px 7px;background:#0d0800;border:1px solid ${known?'#3a5a2a':'#1a1005'};font-size:9px;color:${known?'#80c080':'var(--dim)'}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(e,{size:9}):(e.icon)} ${e.name}</div>`;
          }).join('')}
        </div>`}
      </div>`;
    })()}
  `;
}
window.renderJobPanel = renderJobPanel;

export function openJobEvolution(){
  const currentJobId = S.character?.jobId || getJobIdFromName(S.character?.role);
  if(!currentJobId){ toast('직업 정보가 없습니다'); return; }
  const body = document.getElementById('pb-jobs');
  if(!body) return;

  // 하드코딩 파생 + AI 생성 선택
  const hardcoded = getAllBaseJobs().filter(j=>j.parentId===currentJobId);

  // 조건 타입별 아이콘 반환
  function condTypeIcon(cond){
    const icons = [];
    if(cond.requireQuest) icons.push('📜 퀘스트');
    if(cond.requireItem) icons.push('🎒 아이템');
    if(cond.requireLocation) icons.push('🗺️ 장소');
    if(cond.requireFaction) icons.push('🏰 세력');
    if(cond.requireTitle) icons.push('🧬 칭호');
    if(cond.npcAffection) icons.push('💬 NPC');
    if(cond.minDeaths) icons.push('⚰️ 사망');
    if(cond.minKarma) icons.push('⚖️ 업보');
    if(cond.minCycle) icons.push('🌀 회차');
    if(icons.length === 0 && (cond.minStr||cond.minAgi||cond.minMagic||cond.minFaith)) icons.push('📊 스탯');
    return icons.join(' ');
  }

  body.innerHTML = `
    <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:10px;letter-spacing:1px">전직 탐색</div>
    ${hardcoded.length>0?`
      <div style="font-size:10px;color:var(--dim);margin-bottom:8px">알려진 전직 경로 (${hardcoded.length}종)</div>
      ${hardcoded.map(job=>{
        const mem = loadJobMemory();
        const discount = getJobUnlockDiscount(job.id);
        const discountText = discount<1?` (${Math.round((1-discount)*100)}% 완화)` : '';
        const cond = window.checkJobCondition(job);
        const condMet = cond.met || cond.bypass;
        const condBadge = cond.met ? '<span style="color:#60a060;font-size:9px">✔ 조건 충족</span>'
          : cond.bypass ? '<span style="color:#a060d0;font-size:9px">⚡ 우회 가능</span>'
          : `<span style="color:#c05040;font-size:9px">✘ 미달: ${cond.failed.join(' · ')}</span>`;
        const condTypeStr = condTypeIcon(job.unlockCondition||{});
        const progressFrac = cond.met ? 1 : Math.max(0, 1 - cond.failed.length / Math.max(1, Object.keys(job.unlockCondition||{}).filter(k=>k!=='type'&&k!=='desc').length));
        return `<div style="padding:10px;background:#0d0800;border:1px solid ${condMet?'#3a5a1a':'#3a1010'};margin-bottom:6px">
          <!-- 직업 헤더 -->
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px">
            <span style="color:var(--gold);display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(job,{size:16}):(job.svgIcon||job.icon)}</span>
            <div style="flex:1;min-width:0">
              <div style="font-family:Cinzel,serif;font-size:11px;color:${condMet?'var(--gold)':'#a09070'}">${esc(job.name)}${discountText?`<span style="color:#60a060;font-size:9px"> ${esc(discountText)}</span>`:''}</div>
              <div style="font-size:9px;color:var(--dim)">${esc(job.desc)}</div>
              ${condTypeStr?`<div style="margin-top:3px;font-size:9px;color:#6080a0">${condTypeStr}</div>`:''}
            </div>
          </div>
          <!-- lore -->
          ${job.lore?`<div style="font-size:9px;color:#7a6a4a;line-height:1.5;margin-bottom:6px;font-style:italic;border-left:2px solid #3a2a0a;padding-left:6px">${esc(job.lore)}</div>`:''}
          <!-- 조건 상세 -->
          <div style="background:#0a0500;border:1px solid #2a1a05;padding:7px 9px;margin-bottom:6px;border-radius:1px">
            <div style="font-size:9px;color:#8a7a5a;margin-bottom:4px;font-family:Cinzel,serif;letter-spacing:.5px">전직 조건</div>
            <div style="font-size:10px;color:#c8a96e;line-height:1.6">${esc(job.howToGet||job.unlockCondition?.desc||'')}</div>
            <!-- 힌트 -->
            ${job.conditionHint?`<div style="margin-top:5px;font-size:9px;color:#6a9a6a;line-height:1.5;padding-top:5px;border-top:1px solid #2a1a05">💡 ${esc(job.conditionHint)}</div>`:''}
          </div>
          <!-- 진행도 바 -->
          <div style="height:3px;background:#1a1005;border-radius:2px;overflow:hidden;margin-bottom:6px">
            <div style="width:${condMet?100:Math.round(progressFrac*100)}%;height:100%;background:${condMet?'#40a040':'#806020'};border-radius:2px;transition:width .4s"></div>
          </div>
          <div style="margin-bottom:6px">${condBadge}</div>
          <!-- 스킬 미리보기 -->
          ${(job.skills||[]).slice(0,2).map(s=>`<div style="font-size:9px;background:#150d03;padding:3px 6px;margin-bottom:2px;border-left:2px solid #c8a96e44">${typeof getEntityIconHTML==='function'?getEntityIconHTML(s,{size:9}):(s.icon)} <b style="color:#c8a96e">${esc(s.name)}</b> — ${esc(s.desc)}</div>`).join('')}
          <button class="btn ${condMet?'btn-gold':'btn-dark'}" style="width:100%;padding:7px;font-size:9px;margin-top:4px" onclick="selectHardcodedJob('${job.id}')">${condMet?'⚡ 전직하기':'🔒 조건 미달 (확인)'}</button>
        </div>`;
      }).join('')}
    `:'<div style="font-size:10px;color:var(--dim);padding:12px;text-align:center">하드코딩된 전직 경로가 없습니다.</div>'}
    <button class="btn btn-gold" style="width:100%;padding:10px;font-size:10px;margin-top:8px;letter-spacing:1px" onclick="generateNextJob('${currentJobId}')">✨ AI 직업 탐색 (새로운 경로)</button>
    <button class="btn btn-dark" style="width:100%;padding:8px;font-size:10px;margin-top:6px" onclick="renderJobPanel()">← 돌아가기</button>
  `;
}
window.openJobEvolution = openJobEvolution;

export function selectHardcodedJob(jobId){
  const job = findJob(jobId);
  if(!job){ toast('직업 정보 없음'); return; }
  // 전직 조건 체크
  const condResult = window.checkJobCondition(job);
  if(!condResult.met && !condResult.bypass){
    toast(`⚠ 전직 조건 미달: ${condResult.failed.join(', ')}`, 3500);
    alert(`❌ 전직 조건을 만족하지 못했습니다.\n\n미충족 조건:\n• ${condResult.failed.join('\n• ')}`);
    return;
  }
  const confirmMsg = condResult.bypass
    ? `[아티팩트/칭호로 조건 우회]\n${job.icon} ${job.name}으로 전직하겠습니까?\n(일부 조건 미달이지만 특수 능력으로 강제 전직 가능)`
    : `${job.icon} ${job.name}으로 전직하겠습니까?`;
  if(!confirm(confirmMsg)) return;
  discoverJob(jobId, job.howToGet||'전직 조건 달성');
  offerJobChange(jobId);
  renderJobPanel();
}
window.selectHardcodedJob = selectHardcodedJob;

export function getJobIdFromName(roleName){
  if(!roleName) return null;
  const all = getAllBaseJobs();
  return all.find(j=>j.name===roleName)?.id || null;
}
window.getJobIdFromName = getJobIdFromName;

export const WANDERER_LEGACY_KEY = 'tf-wanderer-job-legacy';

export function loadWandererJobLegacy(){ try{ return JSON.parse(lsGet(WANDERER_LEGACY_KEY)||'[]'); }catch(e){ return []; } }
window.loadWandererJobLegacy = loadWandererJobLegacy;

export function saveWandererJobLegacy(d){ try{ lsSet(WANDERER_LEGACY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveWandererJobLegacy = saveWandererJobLegacy;

export function saveJobToMemory(){
  const jobId = S.character?.jobId || getJobIdFromName(S.character?.role);
  const cycle = typeof loadCycleCount === 'function' ? loadCycleCount() : 0;
  if(jobId) rememberJob(jobId, cycle);
  // 코덱에도 기록
  if(jobId) discoverJob(jobId, '직접 플레이');

  // 방랑자로 시작한 캐릭터라면, 이 생에서 실제로 거쳐간 전직 경로를
  // 영구 기록으로 남긴다.
  try{
    const startedAsWanderer = (S.character?.startRole === '방랑자') || (S.character?.startRole === 'wanderer');
    if(startedAsWanderer){
      const jh = JSON.parse(lsGet('tf-job-history') || '[]');
      const path = jh.map(e => e.to).filter(Boolean);
      const finalJobId = jobId;
      if(finalJobId && !path.includes(finalJobId)) path.push(finalJobId);
      if(path.length > 0){
        const legacy = loadWandererJobLegacy();
        legacy.push({ cycle, path, endedAt: new Date().toISOString() });
        saveWandererJobLegacy(legacy);
      }
    }
  }catch(e){}
}
window.saveJobToMemory = saveJobToMemory;

export const NPC_HERO_KEY = 'tf-npc-hero-state';

export function loadNPCHeroState(){ try{ return JSON.parse(lsGet(NPC_HERO_KEY)||'{}'); }catch(e){ return {}; } }
window.loadNPCHeroState = loadNPCHeroState;

export function saveNPCHeroState(d){ try{ lsSet(NPC_HERO_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNPCHeroState = saveNPCHeroState;

export function getNPCHero(){
  const sid = (typeof S!=='undefined' && S.scenario?.id) ? S.scenario.id : 'medieval';
  return (NPC_HEROES[sid] || NPC_HEROES.medieval || [])[0] || null;
}
window.getNPCHero = getNPCHero;

export function tickNPCHero(){
  const hero = getNPCHero();
  if(!hero) return;
  const state = loadNPCHeroState();
  const turn  = (typeof S!=='undefined' && S.msgCount) ? S.msgCount : 0;

  if(state.concluded) return; // 이미 결론 난 경우

  // [버그 수정] 용사의 진행 정보가 AI 시스템 프롬프트 안에만 존재해서, AI가
  // 우연히 언급하지 않으면 플레이어(특히 직접 전투에 참여 안 하는 농부·상인
  // 등 비전투 직업)는 평생 이 사건을 마주칠 방법이 없던 문제. 토스트 알림 +
  // 다음 응답에 명확히 반영되는 주입 컨텍스트를 추가해, 어떤 직업이든 소문
  // 형태로 반드시 접하고 개입(또는 무시) 여부를 선택할 수 있게 한다.
  // 진행 단계 체크
  for(const step of hero.progressSteps){
    if(!state[step.flag] && turn >= step.turn){
      state[step.flag] = true;
      state.lastDesc   = step.desc;
      state.lastTurn   = turn;

      // 명확한 알림 — 어떤 직업으로 플레이해도 놓치지 않도록
      try{ toast(`📰 소문: ${step.desc}`, 4000); }catch(e){}
      // 부상으로 후퇴 중이거나 진군 중인 단계는 플레이어의 동네/길목을 지나갈
      // 가능성이 자연스러운 단계 — 30% 확률로 "직접 조우"로 격상시켜, 단순
      // 소문이 아니라 실제로 용사를 만나 즉석에서 개입할 기회를 만든다.
      const directEncounter = ['hero_resting','hero_approaching_boss'].includes(step.flag) && Math.random() < 0.3;
      if(directEncounter){
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          `\n\n[⚔️ 용사와의 직접 조우] 용사 ${hero.name}이(가) 주인공이 있는 장소 근처를 지나가거나 직접 찾아오는 장면을 다음 응답에 반드시 연출하라. ("${step.desc}" 상황과 연결지어라.) 주인공의 현재 직업·신분에 맞는 자연스러운 만남으로 그려라(농부라면 밭 근처를 지나가다 마주침, 상인이라면 가게에 들름 등). 선택지에 직접적인 개입 옵션을 포함하라: 돕는다(물자·정보 제공, 함께 싸움), 무시한다, 배신한다(적에게 팔아넘김), 또는 직접 영웅 역할을 가로챈다. `+
          `중요: 주인공이 전투 능력이 있는 직업(사냥꾼·용병·도적 등)이라도 "전투력이 있으니 당연히 도와야 한다"는 압박을 서사에 깔지 마라 — 용병이나 사냥꾼도 그저 자기 생업에 집중하며 세계의 위기와 무관하게 살아가는 것이 완전히 정당하고 자연스러운 선택이다. "무시한다"를 선택해도 비겁하거나 부족한 사람으로 묘사하지 말고, 그저 자신의 삶을 사는 자연스러운 인물로 그려라.`;
      } else {
        S._nextInjectedContext = (S._nextInjectedContext||'') +
          `\n\n[📰 거리의 소문] "${step.desc}" 라는 소문이 퍼지고 있다. 이 소식을 주인공이 어떤 경로로든(여관 손님들의 대화, 행상인, 게시판 공고, 마을 사람들의 수다 등 현재 직업·상황에 자연스러운 방식으로) 듣게 되는 장면을 다음 응답에 반드시 포함하라. 직접 개입할지, 무시하고 자기 삶을 살지는 플레이어의 선택이며, 선택지에 개입 가능한 옵션(예: "그 소식에 대해 더 알아본다", "신경 쓰지 않는다")을 자연스럽게 포함하라. 전투 능력이 있는 직업(사냥꾼·용병 등)도 이 소식과 무관하게 자기 삶에 집중하는 것이 자연스러운 선택임을 잊지 마라.`;
      }

      // 최종 전투 — 성공/실패 결정 (50% 랜덤, 단 플레이어가 도왔으면 성공률 +30%)
      if(step.flag === (hero.progressSteps[hero.progressSteps.length-1].flag)){
        const playerHelped = !!(loadGSFlags && loadGSFlags()['hero_player_helped']);
        const successRate  = playerHelped ? 80 : 50;
        const isSuccess    = Math.random() * 100 < successRate;
        state.concluded = true;
        state.success   = isSuccess;
        const effect = isSuccess ? hero.successEffect : hero.failEffect;
        // 세계 결과 플래그 저장
        try{
          const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
          gsF[effect.worldFlag] = true;
          if(typeof saveGSFlags==='function') saveGSFlags(gsF);
        }catch(e){}
        state.resultRumors = effect.rumors;
        // 최종 결과도 명확한 알림으로
        try{ toast(`🌍 ${isSuccess ? '세계 구원!' : '세계 위기...'} ${effect.rumors[0]}`, 5000); }catch(e){}
      }
      break;
    }
  }
  saveNPCHeroState(state);
}
window.tickNPCHero = tickNPCHero;

export function getNPCHeroBLSContext(){
  const hero  = getNPCHero();
  if(!hero) return '';
  const state = loadNPCHeroState();

  let statusDesc = hero.currentStatus;
  if(state.lastDesc)     statusDesc = state.lastDesc;
  if(state.concluded)    statusDesc = state.success ? '임무 완수 (세계 구원됨)' : '임무 실패 (세계 위기)';

  let rumors = '';
  if(state.resultRumors && state.resultRumors.length){
    rumors = '\n  관련 소문: ' + state.resultRumors.join(' / ');
  }

  // [버그 수정] 용사가 실패해도 "이야기가 끝났다"는 암시만 있고, 마왕이 여전히
  // 존재하며 플레이어가 직접 나설 수 있다는 가능성이 전혀 전달되지 않던 문제.
  // killed_villain_first 플래그는 시점 제한이 없어 실패 이후에도 받아들여지지만,
  // AI가 그 가능성 자체를 모르면 "세계는 이미 망했다"로 서사를 종결시켜버릴 위험.
  let aftermathNote = '';
  if(state.concluded && !state.success){
    aftermathNote = '\n※ 용사가 패배했어도 마왕(최종 보스)은 여전히 존재하며 세계 어딘가에서 활동 중이다. 절대로 "이제 손쓸 방법이 없다"거나 "이야기가 완전히 끝났다"고 단정하지 마라 — 플레이어가 직접 마왕에게 도전하거나, 새로운 저항군을 조직하거나, 다른 방식으로 위기에 맞서는 것은 언제나 유효한 선택이다. 플레이어가 마왕을 처치하면 killed_villain_first 플래그를 출력하라(세계가 뒤늦게라도 구원된다).';
  }

  return `\n\n[🗡️ NPC 용사 — ${hero.icon} ${hero.name}]\n현재 상태: ${statusDesc}${rumors}${aftermathNote}\n※ 플레이어가 메인에 개입하지 않는 경우 세계는 위 NPC 용사 중심으로 자체 진행 중.`;
}
window.getNPCHeroBLSContext = getNPCHeroBLSContext;

export function getWorldBackgroundPrompt(){
  const hero  = getNPCHero();
  if(!hero) return '';
  const state = loadNPCHeroState();
  const jobId = (typeof S!=='undefined') ? (S.character?.jobId || '') : '';
  const sid   = (typeof S!=='undefined' && S.scenario?.id) ? S.scenario.id : 'medieval';

  let jobHint = '';
  if(jobId === 'farmer' || jobId === 'peasant'){
    jobHint = '농부 시점: 물가 변화, 피난민이 밭을 지나감, 마을 분위기 변화로 세계 위기를 간접 묘사.';
  } else if(jobId === 'merchant'){
    jobHint = '상인 시점: 교역로 변화, 수요 변동, 전쟁 특수, 거래처 불안정으로 세계 상황을 묘사.';
  } else if(jobId === 'bard'){
    jobHint = '음유시인 시점: 각지에서 들려오는 소문, 노래의 주제 변화, 청중의 반응으로 세계를 묘사.';
  } else if(jobId === 'blacksmith'){
    jobHint = '대장장이 시점: 무기 주문 급증, 철 가격 변화, 전장에서 돌아온 상처입은 병사들로 세계를 묘사.';
  } else if(jobId === 'healer'){
    jobHint = '치유사 시점: 부상자 급증, 의약품 부족, 피난민 치료 요청으로 세계 위기를 묘사.';
  } else if(jobId === 'thief' || jobId === 'assassin' || jobId === 'rogue'){
    jobHint = '도적/암살자 시점: 혼란 속 기회 증가, 의뢰 변화, 체포 강화, 세력 다툼 틈새.';
  }

  const npcStatus = state.lastDesc || hero.currentStatus;
  const worldFailed = !!(typeof loadGSFlags==='function' && loadGSFlags()['world_failed']);
  const worldSaved  = !!(typeof loadGSFlags==='function' && loadGSFlags()['world_saved']);

  let worldStatus = `NPC 용사 ${hero.name}의 현재 진행: ${npcStatus}`;
  if(worldSaved)  worldStatus = `${hero.name}가 임무를 완수했다. 세계는 안정됐지만 상처는 남아있다.`;
  if(worldFailed) worldStatus = `${hero.name}가 실패했다. 세계가 어두워지고 있다.`;

  return `\n\n[🌍 세계 배경 자동 진행 — AI 행동 지침]
1. 플레이어가 메인 퀘스트에 개입하지 않아도 세계는 자체적으로 변한다.
2. ${worldStatus}
3. 플레이어의 직업과 상황에 맞게 세계 변화를 배경으로 자연스럽게 스며들게 묘사하라.
   ${jobHint}
4. 절대로 플레이어를 강제로 메인으로 끌어들이지 마라.
5. 플레이어가 관심을 보이거나 직접 질문할 때만 개입 선택지를 제공하라.
6. 플레이어가 완전히 무시하면 세계는 NPC 용사 주도로 계속 진행된다.`;
}
window.getWorldBackgroundPrompt = getWorldBackgroundPrompt;

export const WORLD_EVENT_KEY = 'tf-world-events';

export function loadWorldEvents(){ try{ return JSON.parse(lsGet(WORLD_EVENT_KEY)||'{}'); }catch(e){ return {}; } }
window.loadWorldEvents = loadWorldEvents;

export function saveWorldEvents(d){ try{ lsSet(WORLD_EVENT_KEY, JSON.stringify(d)); }catch(e){} }
window.saveWorldEvents = saveWorldEvents;

export const MAIN_QUEST_KEY = 'tf-main-quests';

export function _mqKey(){ const sid = (typeof S!=='undefined'&&S.scenario?.id) ? S.scenario.id : 'custom'; return MAIN_QUEST_KEY+'-'+sid; }
window._mqKey = _mqKey;

export function loadMainQuestState(){ try{ return JSON.parse(lsGet(_mqKey())||'{}'); }catch(e){ return {}; } }
window.loadMainQuestState = loadMainQuestState;

export function saveMainQuestState(d){ try{ lsSet(_mqKey(), JSON.stringify(d)); }catch(e){} }
window.saveMainQuestState = saveMainQuestState;

export function checkMainQuests(){
  // 하드코딩 메인 퀘스트 자동 활성화 완전 제거
  // 메인 퀘스트는 이제 S등급 AI 동적 퀘스트로 대체됨
  // S등급 퀘스트는 analyzeQuestNeed() → generateAIQuest()가 상황 기반으로 생성
}
window.checkMainQuests = checkMainQuests;

// [19번 라운드, [대기] mq16 진엔딩 분기 — 새 시스템, 사용자 확정 지시:
// "심혈을 기울여야 한다"] 지금까지 이 챕터의 "죽였는가/살려뒀는가"
// 판정(confronted_villain_unresolved 플래그)은 오직 AI가 자유서술
// 대사·전투 묘사를 스스로 해석해서 <gs> 태그로 출력해줘야만 결정되는
// 구조였다 — 이 게임에서 가장 중요한 분기점(진엔딩行 여부)이 AI의
// 자유 판단 하나에 전부 걸려 있었다는 뜻. 이걸 없애기 위해, "16장이
// 끝났다"는 판정 자체는 (기존처럼 AI의 q_done 판정에서 오든, 앞으로
// 다른 경로에서 오든) 더 이상 곧바로 완료 처리하지 않는다 — 대신 여기서
// 가로채서, 반드시 아래 showMq16ConfrontationChoice()의 하드코딩 선택
// 팝업(둘 중 하나를 실제로 클릭해야만 진행되는 명시적 UI)을 띄운다.
// 실제 죽였는지/살렸는지는 그 팝업의 버튼 클릭 하나로만 결정되고,
// resolveMq16Confrontation()이 확정된 선택으로 completeMainQuest('mq16',
// {resolved:true})를 다시 호출해야만 아래 본문(실제 분기 판정)이 실행된다
// — opts.resolved가 없는 일반 호출은 이 가드에서 되돌아간다.
export function completeMainQuest(questId, opts){
  opts = opts || {};
  if(questId === 'mq16' && !opts.resolved){
    try{
      const state0 = loadMainQuestState();
      if(state0['mq16'] === 'complete') return;
      // 팝업이 이미 화면에 떠 있으면 또 띄우지 않는다. 이 판단을 영구
      // 저장 플래그가 아니라 실제 DOM 존재 여부로 하는 이유 — 팝업이
      // 뜬 채로 새로고침하면 그 DOM은 사라지는데, 영구 플래그로
      // 막아뒀다면 다시는 못 뜨고 16장에서 영원히 멈추는 사고가 난다.
      // 대신 이 함수가(AI의 q_done이든, 아래 sendMsg 매 턴 자가복구
      // 훅이든) 다시 불릴 때마다 "아직 결정 안 됨"이면 다시 띄워서
      // 스스로 복구되게 한다.
      if(!document.getElementById('mq16-confrontation-modal')){
        showMq16ConfrontationChoice();
      }
    }catch(e){ console.warn('[mq16 결전 팝업 트리거 오류]', e); }
    return;
  }
  const state = loadMainQuestState();
  const sid = S.scenario?.id || 'custom';
  const quests = MAIN_QUESTS[sid] || MAIN_QUESTS.custom;
  const q = quests.find(x=>x.id===questId);
  if(!q || state[questId]==='complete') return;
  state[questId] = 'complete';
  // [CRITICAL BUG FIX] 'active' 상태로 세팅하는 코드가 어디에도 없어서
  // _activeMQ(현재 활성 챕터)가 항상 undefined였고, 그 결과 각 챕터의
  // aiHint(핵심 서사 방향 지시)가 1장부터 단 한 번도 AI에게 전달되지
  // 않던 버그. 다음 챕터(nextId)를 명시적으로 active로 전환한다.
  if(q.nextId && quests.find(x=>x.id===q.nextId)){
    state[q.nextId] = 'active';
  }
  // [신규] 16장(mq16)은 표면 루트와 히든 루트가 갈라지는 배타적 분기점이다.
  // nextId가 null이라 자동 연결은 안 되고, 여기서 명시적으로 판정한다:
  // (1) 마왕을 죽이거나 완전히 굴복시켰다면(confronted_villain_unresolved
  //     플래그가 없음) → 즉시 표면 엔딩 트리거, 17장은 영원히 열리지 않음.
  // (2) 마왕과의 결착을 보류했고(confronted_villain_unresolved) + 학자 +
  //     "금서의 무게" 완료 상태라면 → mq17을 active로 전환해 히든 루트 진입.
  // (3) 보류했지만 게이트 조건 미충족 → 게임은 안 끝나고 자유 플레이 계속.
  if(questId === 'mq16'){
    try{
      const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      const isHeld = !!gsF['confronted_villain_unresolved'];
      const isScholar = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase()==='scholar';
      const hiddenQuests = (typeof loadHiddenQuests==='function') ? loadHiddenQuests() : {};
      const gateCleared = hiddenQuests['hq_weight_of_forbidden_books']?.status === 'completed';
      if(isHeld && isScholar && gateCleared){
        state['mq17'] = 'active';
        toast('📖 무언가 석연치 않은 위화감이 짙어진다...', 3500);
      } else if(!isHeld){
        // 마왕을 죽이거나 완전히 끝장냄 — 표면 엔딩으로 즉시 종료
        if(typeof inheritVillainPower==='function') inheritVillainPower('베엘제부브', '마왕의 위압', S.scenario?.id);
        setTimeout(()=>{ if(typeof triggerStoryEnding==='function') triggerStoryEnding(); }, 2000);
      }
      // isHeld && (!isScholar || !gateCleared) 인 경우는 아무 것도 하지 않고
      // 자유 플레이를 계속한다 — 나중에 조건을 갖추면 별도 트리거로 재확인 가능.
    }catch(e){ console.warn('[mq16 분기 판정 오류]', e); }
  }
  saveMainQuestState(state);
  // 보상: 골드
  if(q.reward.gold){ S.gold += q.reward.gold; saveGold(S.gold); window.updateHeader(); }
  if(q.reward.exp){ window.updateStats('totalExp', q.reward.exp); }
  // 보상: 아이템 (세트 아이템 파츠인 경우 인벤토리에 직접 지급 — RELICS 유물은 hasFlag 자동체크로 별도 처리됨)
  if(q.reward.item && typeof getAllSetItems==='function'){
    try{
      const setPart = getAllSetItems().find(it=>it.id===q.reward.item);
      if(setPart){
        S.inventory = S.inventory||[];
        if(!S.inventory.some(it=>it&&it.id===setPart.id)){
          S.inventory.push({...setPart});
          if(typeof saveInventory==='function') saveInventory(S.inventory);
          setTimeout(()=>toastHTML(`🎁 세트 아이템 획득: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(setPart,{size:14}):(setPart.icon)} ${esc(setPart.name)}!`, 4000), 2500);
        }
      }
    }catch(e){}
  }
  // 보상: 스탯 보너스
  if(q.reward.statsBonus){
    Object.entries(q.reward.statsBonus).forEach(([k,v])=>{
      if(S.stats[k]!==undefined) S.stats[k]=Math.min(999,(S.stats[k]||10)+v);
    });
    if(typeof saveStats==='function') saveStats(S.stats);
  _markDirty('stats'); if(typeof saveStatsSplit==='function') saveStatsSplit();
  }
  // 보상: GS 플래그 자동 등록
  if(q.flags && q.flags.length){
    try{
      const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      q.flags.forEach(f=>{ gsF[f]=true; });
      if(typeof saveGSFlags==='function') saveGSFlags(gsF);
    }catch(e){}
  }
  // 보상: 신규 NPC 자동 등록
  if(q.newNpcs && q.newNpcs.length){
    try{
      const existNpcs = (typeof loadNPCs==='function') ? loadNPCs() : [];
      const existNames = new Set(existNpcs.map(n=>n.name));
      const toAdd = q.newNpcs.filter(n=>!existNames.has(n.name));
      if(toAdd.length){
        const updated = [...existNpcs, ...toAdd.map(n=>({
          ...n, relationship:50, active:true,
          metAtLoc: S.currentLocation?.name || '불명',
          note: n.role,
        }))];
        if(typeof saveNPCs==='function') saveNPCs(updated);
        S.npcs = updated;
      }
    }catch(e){}
  }
  // SP 지급
  const spGain = q.reward.sp || (q.rarity==='main' ? 2 : 1);
  S.skillSP = (S.skillSP||0) + spGain;
  saveSkillSP(S.skillSP);
  // 세계관 조각 해금
  if(q.worldLoreUnlock){
    try{
      const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      gsF['lore_'+q.id] = q.worldLoreUnlock;
      if(typeof saveGSFlags==='function') saveGSFlags(gsF);
      setTimeout(()=>toast(`📜 세계의 진실 발견: ${q.worldLoreUnlock.slice(0,30)}...`, 5000), 1500);
    }catch(e){}
  }
  toast(`✅ [${q.chapter||'메인'}] ${q.title} 완료! 골드 +${q.reward.gold||0} | SP +${spGain}`, 4000);
  // 엔딩 체크
  if(q.reward.ending) checkSecretEndings();
  // [수정] 28장 재설계 이후 — 16장(mq16)의 엔딩 판정은 completeMainQuest
  // 상단의 전용 분기 로직이 이미 처리한다(표면 엔딩 또는 17장行 여부).
  // 28장(mq28) 완료는 히든 루트의 진짜 최종장이므로 여기서 엔딩 팝업을 띄운다.
  if(questId === 'mq28'){
    setTimeout(()=>{ if(typeof triggerStoryEnding==='function') triggerStoryEnding(); }, 2000);
  }
}
window.completeMainQuest = completeMainQuest;

// [19번 라운드, mq16 진엔딩 분기 — 새 시스템] 마왕(베엘제부브)과의
// 결전을 "죽인다"/"살려서 물러난다" 둘 중 하나로 확정 짓는 하드코딩
// 선택 팝업. 기존 팝업 시스템(quest/086의 showQuestAcceptPopup)은
// template.html에 미리 박아둔 고정 DOM(#quest-accept-popup 등)에
// 의존하는 구조라 "수락/거절" 의미로 이미 굳어 있어서, 의미가 전혀
// 다른 "죽인다/살린다" 선택에 억지로 끼워 맞추면 그게 바로 사용자가
// 거부한 "기워붙이기"가 된다 — 대신 이 파일의 showEnhancedEndingCutscene/
// showLastSessionSummary와 같은 관례(모달 DOM을 그때그때 직접
// 만들어서 body에 붙이는 방식)를 그대로 따라 독립된 모달을 새로 만든다.
// 대사(npcHint)는 이미 data/042 MAIN_QUESTS.mq16에 작가가 직접 써둔
// 것을 그대로 가져다 쓴다 — 새로 지어내거나 대충 요약하지 않는다.
export function showMq16ConfrontationChoice(){
  if(document.getElementById('mq16-confrontation-modal')) return;
  const sid = S.scenario?.id || 'custom';
  const quests = MAIN_QUESTS[sid] || MAIN_QUESTS.custom;
  const q = quests.find(x=>x.id==='mq16');
  const npcLine = q?.npcHint || '"인간이 여기까지 오다니. 그래서, 나를 어떻게 하고 싶은 것이냐?"';
  const modal = document.createElement('div');
  modal.id = 'mq16-confrontation-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:#000000dd;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  modal.innerHTML = `<div style="background:#0d0800;border:2px solid #8a2020;padding:22px;max-width:420px;width:100%;max-height:85vh;overflow-y:auto;border-radius:3px;box-shadow:0 0 50px rgba(180,40,40,.35)">
    <div style="text-align:center;margin-bottom:14px">
      <div style="font-size:38px;margin-bottom:6px">👑</div>
      <div style="font-family:'Cinzel',serif;font-size:16px;color:#e0a060;margin-bottom:4px">최후의 결전 — 마왕 베엘제부브</div>
      <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim)">이 선택이 이야기의 결말을 가른다</div>
    </div>
    <div style="font-size:11px;color:#d8c8a8;line-height:1.7;margin-bottom:14px;padding:12px;background:#050300;border-left:2px solid #8a2020;border-radius:2px">${esc(npcLine)}</div>
    <div style="font-size:10px;color:var(--dim);line-height:1.7;margin-bottom:18px">검을 들 것인가, 거둘 것인가 — 이 순간의 선택은 돌이킬 수 없다.</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button onclick="resolveMq16Confrontation('kill')" style="padding:12px;background:linear-gradient(135deg,#2a0a0a,#3a1010);border:1px solid #8a2020;color:#e08080;font-family:'Cinzel',serif;font-size:11px;cursor:pointer;border-radius:2px;letter-spacing:.5px">⚔️ 마왕을 처단한다 — 이야기를 여기서 완결짓는다</button>
      <button onclick="resolveMq16Confrontation('spare')" style="padding:12px;background:linear-gradient(135deg,#0a1a2a,#10243a);border:1px solid #2a5a8a;color:#80b0e0;font-family:'Cinzel',serif;font-size:11px;cursor:pointer;border-radius:2px;letter-spacing:.5px">🕊️ 검을 거두고 물러난다 — 결착을 보류한다</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}
window.showMq16ConfrontationChoice = showMq16ConfrontationChoice;

// choice: 'kill'(처단, 표면 엔딩 확정) | 'spare'(보류, 학자+금서 조건
// 충족 시에만 히든 루트로 이어질 가능성이 열림 — 나머지 분기 판정은
// completeMainQuest 본문의 기존 로직을 그대로 재사용한다. 여기서는
// "무엇을 골랐는가"만 실제 게임 상태(GS 플래그)에 정직하게 반영한다.
export function resolveMq16Confrontation(choice){
  const modal = document.getElementById('mq16-confrontation-modal');
  if(modal) modal.remove();
  try{
    const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
    if(choice==='spare') gsF['confronted_villain_unresolved'] = true;
    else delete gsF['confronted_villain_unresolved'];
    if(typeof saveGSFlags==='function') saveGSFlags(gsF);
  }catch(e){}
  const narrText = choice==='kill'
    ? '검이 마왕의 심장을 꿰뚫는다. 오랜 위협이 마침내 끝났다 — 승리의 순간이지만, 그 이상의 감흥은 없다. 이것으로 이 싸움은 완전히 끝났다.'
    : '검을 거둔다. 마왕은 쓰러지지 않았다 — 그저 침묵할 뿐이다. "...현명한 선택인지는, 두고 볼 일이군." 낮은 목소리가 등 뒤로 따라온다.';
  toast(choice==='kill' ? '⚔️ 마왕을 처단했다' : '🕊️ 결착을 보류하고 물러났다', 3200);
  // [16번 라운드 #10과 같은 패턴 재사용] 다음 턴 서사(로컬 폴백이든
  // AI든)가 방금 일어난 이 결정을 자연스럽게 이어받게 한다 —
  // composeLocalTurnText는 S._pendingMq16ResolutionHint를 직접 읽고,
  // AI 쪽은 S._nextInjectedContext(이미 여러 시스템이 공용으로 쓰는
  // 프롬프트 주입 채널)로 같은 내용을 전달한다.
  S._pendingMq16ResolutionHint = narrText;
  S._nextInjectedContext = (S._nextInjectedContext||'') + '\n[방금 마왕과의 결전이 확정됨] ' + narrText;
  if(typeof completeMainQuest==='function') completeMainQuest('mq16', {resolved:true});
  if(typeof window.saveSession==='function') window.saveSession();
}
window.resolveMq16Confrontation = resolveMq16Confrontation;

export function checkSecretEndings(){
  // ── 게임이 제대로 초기화됐는지 먼저 확인 ──
  if(!S || !S.character) return;

  const st = loadStats()||{};
  const state = loadMainQuestState()||{};
  const titles = loadTitles()||[];
  const npcs = loadNPCs()||[];
  const evolved = loadEvolution()||{};
  const reinc = loadCycleCount()||0;
  const actions = loadJobActions()||{};
  const jobId = S.character?.jobId || getJobIdFromName(S.character?.role);

  SECRET_ENDINGS.forEach(ending=>{
    const alreadyKey = 'ending_unlocked_'+ending.id;
    if(lsGet(alreadyKey)) return;
    const c = ending.condition;
    let met = true;

    // ── 메인 퀘스트 완료 여부 ──
    if(c.mainQuestDone){
      const sid = S.scenario?.id||'custom';
      const quests = MAIN_QUESTS[sid]||MAIN_QUESTS.custom;
      if(!quests.every(q=>state[q.id]==='complete')) met=false;
    }

    // ── 칭호 / NPC 관계 ──
    if(c.minTitles && titles.length < c.minTitles) met=false;
    if(c.noEnemyNpc && npcs.some(n=>n.relationship<30)) met=false;
    if(c.minEnemyNpc && npcs.filter(n=>n.relationship<30).length < c.minEnemyNpc) met=false;
    if(c.minFriendNpc){
      const friendCount = npcs.filter(n=>(n.relationship||50)>=65).length;
      if(friendCount < c.minFriendNpc) met=false;
    }

    // ── 스탯/업보 ──
    if(c.minKarma !== undefined && (S.stats?.krma||0) < c.minKarma) met=false;
    if(c.maxKarma !== undefined && (S.stats?.krma||50) > c.maxKarma) met=false;
    if(c.minFaith && (S.stats?.fath||0) < c.minFaith) met=false;
    if(c.minFear && (S.stats?.fear||0) < c.minFear) met=false;
    if(c.minGold && (S.gold||0) < c.minGold) met=false;

    // ── 환생 / 사망 / 판정 카운터 ──
    if(c.minReinc && reinc < c.minReinc) met=false;
    if(c.minDeaths && (st.deathCount||0) < c.minDeaths) met=false;
    if(c.minCritSuccess && (st.critSuccessCount||0) < c.minCritSuccess) met=false;
    if(c.minCritFail && (st.critFailCount||0) < c.minCritFail) met=false;

    // ── 직업 ──
    if(c.jobId && jobId !== c.jobId) met=false;
    if(c.civilianJob){
      const CIVILIAN_JOB_IDS = { farmer:'farmer', merchant:'merchant', blacksmith:'blacksmith', bard:'bard', healer:'healer' };
      const requiredId = CIVILIAN_JOB_IDS[c.civilianJob];
      if(jobId !== requiredId) met=false;
    }

    // ── 행동 패턴 카운터 ──
    if(c.minTrade   && (actions.trade  ||0) < c.minTrade)   met=false;
    if(c.minCraft   && (actions.craft  ||0) < c.minCraft)   met=false;
    if(c.minSocial  && (actions.social ||0) < c.minSocial)  met=false;
    if(c.minHeal    && (actions.heal   ||0) < c.minHeal)    met=false;
    if(c.minStealthCount && (actions.stealth||0) < c.minStealthCount) met=false; // [수정] phantom 엔딩 은신 카운터
    if(c.minCombatWin    && (actions.combat_win||0) < c.minCombatWin) met=false;
    if(c.minGoodActs && (actions.good_acts||0) < c.minGoodActs) met=false;
    if(c.minEvilActs && (actions.evil_acts||0) < c.minEvilActs) met=false;
    if(c.minNatureAct && (actions.nature||0) < c.minNatureAct) met=false; // [수정] 사회 행동과 혼용 제거
    // [수정] 전투 회피 횟수: peacemaker 엔딩용 — combat_avoid 카운터로 추적 (방어/반격과 분리)
    if(c.minPeaceCount && (actions.combat_avoid||0) < c.minPeaceCount) met=false;

    // ── 전투 없는 엔딩 조건 ──
    if(c.noCombatEnding){
      const aggressiveCount = (actions.combat_aggressive||0) + (actions.hunt||0);
      if(aggressiveCount > 20) met=false;
    }
    if(c.peacefulEnd){
      const aggressiveCount = (actions.combat_aggressive||0) + (actions.hunt||0);
      if(aggressiveCount > 30) met=false;
    }

    // ── 종족 진화 ──
    if(c.raceEvo){
      const evoStage = evolved[S.character?.race]?.stage||1;
      const evo = RACE_EVOLUTION?.[S.character?.race];
      const stageName = evo?.['stage'+evoStage]?.name||'';
      if(stageName !== c.raceEvo) met=false;
    }
    if(c.raceId && S.character?.race !== c.raceId) met=false;
    if(c.raceEvoMin){
      const evoStage = evolved[S.character?.race]?.stage||1;
      const evo = RACE_EVOLUTION?.[S.character?.race];
      const stageNames = [1,2,3,4,5,6,7,8].map(i=>evo?.['stage'+i]?.name).filter(Boolean);
      const minIdx = stageNames.indexOf(c.raceEvoMin);
      if(minIdx < 0 || evoStage-1 < minIdx) met=false;
    }
    // [수정] hasEvoId: 진화명에 특정 문자열이 포함되어야 하는 조건 (dark_lord 엔딩 등)
    if(c.hasEvoId){
      const evoStage = evolved[S.character?.race]?.stage||1;
      const evo = RACE_EVOLUTION?.[S.character?.race];
      const stageName = evo?.['stage'+evoStage]?.name||'';
      if(!stageName.includes(c.hasEvoId)) met=false;
    }

    // ── 야생 동물 동료 수 (primal_sovereign 엔딩용) ──
    // [수정] party에서 isAnimal 플래그가 있는 동료를 카운트
    if(c.minAnimalCompanion){
      const party = typeof loadParty==='function' ? loadParty()||[] : [];
      const animalCount = party.filter(p=>p.alive!==false && (p.isAnimal || p.type==='animal')).length;
      if(animalCount < c.minAnimalCompanion) met=false;
    }

    // ── 모든 세계관 경험 (wandering_god 엔딩용) ──
    // [수정] loadSakuraData의 clearedScenarios 활용
    if(c.allScenarios){
      const sakura = typeof loadSakuraData==='function' ? loadSakuraData() : {clearedScenarios:[]};
      if((sakura.clearedScenarios||[]).length < 4) met=false;
    }

    // ── 동료 생존 / 연보 / 탐험 ──
    if(c.minPartyAlive){
      const party = typeof loadParty==='function' ? loadParty()||[] : [];
      if(party.filter(p=>p.alive!==false).length < c.minPartyAlive) met=false;
    }
    if(c.minAnnals){
      const annals = typeof loadAnnals==='function' ? loadAnnals()||[] : [];
      if(annals.length < c.minAnnals) met=false;
    }
    if(c.minExploration){
      const locs = typeof loadLocations==='function' ? loadLocations()||[] : [];
      if(locs.length < c.minExploration) met=false;
    }

    // ── 관찰자 단계 ──
    if(c.watcherStage){
      const wg = typeof loadWatcherGaze==='function' ? loadWatcherGaze() : {stage:0};
      if((wg.stage||0) < c.watcherStage) met=false;
    }

    // ── GS 플래그 ──
    if(c.hasFlag){
      const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      if(!gsF[c.hasFlag]) met=false;
    }
    if(c.hasAllFlags && Array.isArray(c.hasAllFlags)){
      const gsF = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      if(!c.hasAllFlags.every(f=>gsF[f])) met=false;
    }

    // ── 스탯 직접 조건 ──
    if(c.minStr    && (S.stats?.str ||0) < c.minStr)    met=false;
    if(c.minMgc    && (S.stats?.mgc ||0) < c.minMgc)    met=false;
    if(c.minWil    && (S.stats?.wil ||0) < c.minWil)    met=false;
    if(c.minInt    && (S.stats?.int ||0) < c.minInt)    met=false;
    if(c.minLuk    && (S.stats?.luk ||0) < c.minLuk)    met=false;
    if(c.minFear   && (S.stats?.fear||0) < c.minFear)   met=false;
    if(c.minFaith  && (S.stats?.fath||0) < c.minFaith)  met=false;

    // ── 영구 스탯 누적 (환생 보너스) ──
    if(c.minPermTotal){
      const perm = (typeof loadPermStatBonus==='function') ? loadPermStatBonus() : {};
      const total = Object.values(perm).reduce((a,b)=>a+(b||0),0);
      if(total < c.minPermTotal) met=false;
    }

    // ── 모든 대륙 방문 ──
    if(c.allContinents){
      const locs = typeof loadLocations==='function' ? loadLocations()||[] : [];
      const visited = new Set(locs.map(l=>l.continent||l.id?.split('_')[0]));
      const required = ['central','north','east','west','south','northeast','southeast','northwest'];
      if(!required.every(c=>visited.has(c))) met=false;
    }

    // ── 특정 NPC 전원 생존 ──
    if(c.npcsAlive && Array.isArray(c.npcsAlive)){
      const npcList = typeof loadNPCs==='function' ? loadNPCs()||[] : [];
      if(!c.npcsAlive.every(name=>npcList.find(n=>n.name===name&&(n.alive!==false)&&(n.relationship||50)>=40))) met=false;
    }

    // ── 전설 유물 보유 수 ──
    if(c.minRelics){
      const owned = typeof loadOwnedRelics==='function' ? loadOwnedRelics()||[] : [];
      if(owned.length < c.minRelics) met=false;
    }

    // ── 드래곤 동료 수 (dragon_god_ending) ──
    if(c.minDragonCompanion){
      const party = typeof loadParty==='function' ? loadParty()||[] : [];
      const dragonCount = party.filter(p=>p.alive!==false && (p.isDragon || (p.race||'').includes('드래곤') || (p.type||'').includes('dragon'))).length;
      if(dragonCount < c.minDragonCompanion) met=false;
    }

    // ── 악마족 계약 수 (abyss_lord_ending) ──
    if(c.minContracts){
      const gsF2 = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      const contractCount = Object.keys(gsF2).filter(k=>k.startsWith('contract_')).length;
      if(contractCount < c.minContracts) met=false;
    }

    // ── 오크 의회 영향력 (great_chieftain_ending) ──
    if(c.minCouncilInfluence){
      const orcDB = typeof loadWorldDB==='function' ? (loadWorldDB().orcCouncil||{}) : {};
      if((orcDB.influence||0) < c.minCouncilInfluence) met=false;
    }
    if(c.minTribeUnified){
      const orcDB2 = typeof loadWorldDB==='function' ? (loadWorldDB().orcCouncil||{}) : {};
      if(!orcDB2.unified) met=false;
    }

    // ── 인간 각성도 (human_transcend_ending) ──
    if(c.minAscension){
      const perm = (typeof loadPermStatBonus==='function') ? loadPermStatBonus() : {};
      const totalPerm = Object.values(perm).reduce((a,b)=>a+(b||0),0);
      if(totalPerm < c.minAscension) met=false;
    }

    // ── 세계 구원/멸망 상태 (행동 패턴 / 카르마 엔딩) ──
    if(c.worldSaved !== undefined || c.worldFailed !== undefined){
      const gsF3 = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      const wSaved = !!(gsF3['world_saved'] || gsF3['good_ending_triggered'] || gsF3['true_ending_triggered']);
      const wFailed = !!(gsF3['world_failed'] || gsF3['bad_ending_triggered'] || gsF3['abyss_contract']);
      if(c.worldSaved && !wSaved) met=false;
      if(c.worldFailed && !wFailed) met=false;
    }

    // ── 행동 패턴 타입 체크 (행동 패턴 엔딩) ──
    if(c.patternType){
      const act2 = loadJobActions()||{};
      const combatC   = (act2.combat||0) + (act2.combat_aggressive||0);
      const socialC   = (act2.social||0);
      const craftC    = (act2.craft||0) + (act2.trade||0);
      const exploreC  = (typeof loadLocations==='function') ? (loadLocations()||[]).length : 0;
      const karmaC2   = S.stats?.krma || 50;
      const maxVal = Math.max(combatC, socialC, craftC, exploreC);
      let detectedPattern = 'neutral';
      if(maxVal === combatC && combatC > 20)        detectedPattern = 'combat';
      else if(maxVal === socialC && socialC > 20)   detectedPattern = 'social';
      else if(maxVal === craftC  && craftC  > 15)   detectedPattern = 'craft';
      else if(maxVal === exploreC && exploreC > 10) detectedPattern = 'explore';
      if(karmaC2 < 30 && c.patternType === 'dark')  detectedPattern = 'dark';
      if(detectedPattern !== c.patternType) met=false;
    }
    if(c.minCombat){
      const act3 = loadJobActions()||{};
      const totalCombat = (act3.combat||0)+(act3.combat_aggressive||0);
      if(totalCombat < c.minCombat) met=false;
    }
    if(c.minCraftOrTrade){
      const act4 = loadJobActions()||{};
      if((act4.craft||0)+(act4.trade||0) < c.minCraftOrTrade) met=false;
    }

    if(met){
      lsSet(alreadyKey, '1');
      unlockAchievement('secret_ending');

      // 엔딩 AI 힌트 주입
      if(ending.aiHint){
        S._nextInjectedContext = (S._nextInjectedContext||'') + '\n[🎭 엔딩 분기 감지] ' + ending.aiHint + ' 이번 턴부터 서사를 이 방향으로 자연스럽게 이끄십시오.';
      }

      // 비메인 엔딩 달성 팝업 — 환생 or 메인엔딩 계속 선택
      setTimeout(()=>{
        if(typeof showGameOver === 'function'){
          showGameOver(
            { type:'ending', endingName: ending.name, endingIcon: ending.icon, endingDesc: ending.desc },
            true // isNonMainEnding
          );
        } else {
          toastHTML(`🌟 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(ending,{size:14}):(ending.icon)} ${esc(ending.name)} 달성!`, 5000);
        }
      }, ending.aiHint ? 2000 : 500);
    }
  });
}
window.checkSecretEndings = checkSecretEndings;

export function checkWorldEvents(){
  const sid = S.scenario?.id||'custom';
  const events = WORLD_EVENTS[sid]||[];
  const fired = loadWorldEvents();
  const gsFlags = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
  const curContinent = S.character?.startContinent || 'central';
  const curTurn = S.msgCount || 0;

  events.forEach(ev=>{
    if(fired[ev.id]) return;

    // ── 1. 최소 턴 조건 ────────────────────────────────
    const minTurn = ev.minTurn ?? ev.turn ?? 0;
    if(curTurn < minTurn) return;

    // ── 2. MQ 플래그 조건 ──────────────────────────────
    if(ev.requireFlag){
      // requireFlag가 we_ 로 시작하면 세계사건 발동 여부 체크
      if(ev.requireFlag.startsWith('we_')){
        if(!fired[ev.requireFlag]) return;
      } else {
        // GS 플래그 체크
        if(!gsFlags[ev.requireFlag]) return;
      }
    }

    // ── 3. 대륙 선호도 — 다른 대륙이면 추가 턴 필요 ────
    if(ev.preferContinent && ev.preferContinent !== 'all'){
      const isHome = curContinent === ev.preferContinent;
      // 현재 대륙이 아니면 minTurn + 20턴 추가 필요
      if(!isHome && curTurn < minTurn + 20) return;
    }

    // ── 4. turn 하드캡 (999면 MQ 연동만으로 발동) ──────
    if(ev.turn !== 999 && curTurn < ev.turn) return;

    // ── 모든 조건 통과 → 발동 ─────────────────────────
    fired[ev.id] = true;
    saveWorldEvents(fired);

    // GS 플래그에도 등록 (rumorSection 등에서 참조)
    try{
      const gsF2 = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
      gsF2[ev.id] = true;
      if(typeof saveGSFlags==='function') saveGSFlags(gsF2);
    }catch(e){}

    setTimeout(()=>{
      toast(`🌍 세계 사건: ${ev.title}`, 4000);
      if(ev.effect?.magicBonus) S.stats.mgc = Math.min(999,(S.stats.mgc||50)+Math.round(ev.effect.magicBonus/10));
      if(ev.effect?.combatBonus) S.stats.str = Math.min(999,(S.stats.str||50)+Math.round(ev.effect.combatBonus/10));
      window.updateHeader?.();
    }, 2000);
  });
}
window.checkWorldEvents = checkWorldEvents;
