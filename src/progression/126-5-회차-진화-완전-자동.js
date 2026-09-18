// 5. 회차 진화 — 완전 자동
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { BLOODLINE_MASTER } from '../data/124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';
import { getEvolvedRace } from '../misc/015-시스템-1120.js';
import { loadBL } from '../summon/124-1-통합-혈통-정의-BLOODLINETYPES-BLOODLINEDEFS-.js';
import { loadCycleCount } from './014-환생-누적-시스템-110번.js';

export function getBloodlineEvolution(){
  const bl = loadBL();
  if(!bl?.type) return null;
  const cycle = typeof loadCycleCount==='function'?loadCycleCount():0;
  const race  = S.character?.race||'인간';

  // 혈통 타입별 회차 진화
  const BL_EVOLUTION = {
    // 범용 혈통
    dragon:    {3:'용의 눈뜸',    7:'드래곤로드의 피',    12:'원시 용신의 화신'},
    demonic:   {3:'악마의 징표',  7:'마계의 반신',         12:'혼돈의 화신'},
    royal:     {3:'왕혈의 각인',  7:'고대 왕의 계승자',    12:'전설의 군주'},
    celestial: {3:'신성의 싹',    7:'천계의 반신',         12:'빛의 화신'},
    ancient:   {3:'정령의 속삭임',7:'정령의 왕',           12:'대자연의 화신'},
    void:      {3:'공허의 틈',    7:'차원의 방랑자',       12:'공간의 지배자'},
    shadow:    {3:'그림자의 일부',7:'암흑의 군주',         12:'불멸의 암살자'},
    feral:     {3:'야수의 심장',  7:'원시의 군주',         12:'야수신의 화신'},
    arcane:    {3:'마력의 눈뜸',  7:'비전의 대마도사',     12:'마법의 화신'},
    cursed:    {3:'저주의 계승',  7:'불사의 낙인',         12:'저주의 지배자'},
    // 종족 전용 혈통 진화
    hero_blood:     {3:'영웅의 후예',   7:'전설의 계승자',  12:'세계의 영웅'},
    fate_blood:     {3:'운명의 실',     7:'운명의 직조자',  12:'세계의 주인공'},
    star_blood:     {3:'별빛의 눈',     7:'별의 예언자',    12:'별의 화신'},
    forest_blood:   {3:'숲의 목소리',  7:'정령의 친구',    12:'대삼림의 수호자'},
    forge_blood:    {3:'장인의 손',     7:'전설의 대장장이',12:'창조의 화신'},
    stone_blood:    {3:'바위의 심장',  7:'산의 수호자',    12:'대지의 화신'},
    warchief_blood: {3:'전사의 함성',  7:'전장의 지배자',  12:'전쟁신의 화신'},
    blood_shaman:   {3:'피의 목소리',  7:'영혼의 대화자',  12:'샤먼 왕'},
    void_walker:    {3:'그림자 보행자',7:'공허의 방랑자',   12:'차원의 지배자'},
    curse_weaver:   {3:'저주 술사',    7:'저주 예술가',    12:'저주의 신'},
    divine_chosen:  {3:'신의 눈길',    7:'신의 대리인',    12:'신성의 화신'},
    light_herald:   {3:'빛의 심부름꾼',7:'빛의 기사',      12:'정화의 신'},
    contract_lord:  {3:'계약의 중개자',7:'계약의 지배자',  12:'마계의 군주'},
    chaos_blood:    {3:'혼돈의 씨앗',  7:'혼돈의 전사',    12:'원초 혼돈의 화신'},
    death_pact:     {3:'죽음의 친구',  7:'죽음의 파트너',  12:'죽음 그 자체'},
    memory_eater:   {3:'기억의 수집가',7:'기억의 도서관',  12:'전지의 영혼'},
  };

  const evoMap = BL_EVOLUTION[bl.type]||{};
  let stage = 0, stageName = bl.name;
  for(const [req,name] of Object.entries(evoMap).sort((a,b)=>+a[0]-+b[0])){
    if(cycle >= +req){ stage=+req; stageName=name; }
  }

  // 종족 진화명도 함께
  const raceEvo = typeof getEvolvedRace==='function' ? getEvolvedRace(race) : null;

  return {
    type:      bl.type,
    baseName:  BLOODLINE_MASTER[bl.type]?.name||bl.name,
    stageName,
    stage,
    cycle,
    raceEvo,
    icon:      BLOODLINE_MASTER[bl.type]?.icon||'🩸',
  };
}
window.getBloodlineEvolution = getBloodlineEvolution;

window.getBloodlineEvolution = getBloodlineEvolution;
