// 10. BLS — AI에게 종교 현황 전달
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RELIGIONS } from '../data/090-1-마스터-데이터.js';
import { getJobEvangelActions } from '../job/096-7-직업별-교화-가능-여부.js';
import { getReligionTension } from '../misc/093-4-긴장도-계산.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadReligionState } from '../world/091-2-저장소.js';
import { getRegionReligionShare } from './092-3-지역-종교-점유율-조회수정.js';
import { getPlayerReligion } from './094-5-플레이어-종교-귀속-교화.js';
import { loadReligionMarriage, loadTerritoryPacts } from './105-5-제5-혼합-종파-Syncretism.js';



// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_80(){
function getReligionBLS(){
  const loc       = typeof loadCurrentLocation==='function'?loadCurrentLocation():null;
  const regionKey = (loc&&loc.continent)||'central';
  const share     = getRegionReligionShare(regionKey);
  const tension   = getReligionTension(regionKey);
  const playerRel = getPlayerReligion();
  const playerRelData = playerRel&&RELIGIONS[playerRel];
  const st        = loadReligionState();

  const shareDesc = Object.entries(share)
    .filter(([k,v])=>v>0&&(k!=='abyss'||v>5))
    .map(([k,v])=>{ const r=RELIGIONS[k]; return (r?r.icon+r.name:k)+' '+v+'%'; })
    .join(' / ');

  // 직업별 교화 가능 행동
  const jobId    = ((S.character&&(S.character.jobId||S.character.job))||'').toLowerCase();
  const availActs= getJobEvangelActions(jobId);
  const evangelDesc = availActs.length?('\n가능한 교화 행동: '+availActs.join('·')):'';

  // 비밀 정보 (조건부)
  const secretHints = [];
  if((S.character&&S.character.evangelCount||0)>=10)
    secretHints.push('순환의 사원 고위 성직자 일부가 루프 자각자임을 암시할 수 있음');
  if(playerRel==='abyss'||(S.character&&(S.character.evangelCount||0)>=5&&playerRel==='abyss'))
    secretHints.push('심연의 계시 신자들은 사실 마계 하수인이 되어간다는 사실을 모름');

  const warSection = st.war?'\n⚔️ 종교전쟁 진행 중 ('+st.war.region+'): '+st.war.sides.map(s=>RELIGIONS[s]?RELIGIONS[s].name:s).join(' vs '):'';

  // 혼인 동맹 / 성지 분할 협약 현황 — 이미 체결됐으면 AI가 계속 인지해야 함
  const marriage = typeof loadReligionMarriage==='function' ? loadReligionMarriage() : null;
  const marriageSection = marriage
    ? '\n💍 혼인 동맹 성립: '+marriage.name+' (배우자: '+marriage.spouseName+')'+(marriage.isAbyssTrap?' — 배우자는 실은 인간 형태를 한 심연 존재. 아직 드러나지 않은 비밀.':'')
    : '';
  const territoryPacts = typeof loadTerritoryPacts==='function' ? loadTerritoryPacts() : [];
  const territoryHere = territoryPacts.find(p=>p.region===regionKey);
  const territorySection = territoryHere
    ? '\n📜 이 지역은 '+(RELIGIONS[territoryHere.religionA]?.name||territoryHere.religionA)+'과 '+(RELIGIONS[territoryHere.religionB]?.name||territoryHere.religionB)+'이 성지 분할 협약으로 영역을 나눠 관할 중'
    : '';

  return '\n\n[⛪ 종교 현황 — '+(loc&&loc.name||regionKey)+']'
    +'\n신도 분포: '+shareDesc
    +'\n플레이어 소속: '+(playerRelData?playerRelData.icon+playerRelData.name:'무신앙')
    +'\n긴장도: '+tension.icon+' '+tension.level+'단계'+(tension.level>0?' ('+tension.desc+')':'')
    +warSection
    +marriageSection
    +territorySection
    +evangelDesc
    +(secretHints.length?'\n[종교 비밀 암시 가능]: '+secretHints.join(' / '):'')
    +'\n\n[종교 서사 지침]'
    +'\n• 과반 종교('+Object.entries(share).sort((a,b)=>b[1]-a[1])[0][0]+')의 성직자·신도가 자연스럽게 등장'
    +'\n• 긴장도 2단계 이상이면 길거리 종교 충돌 장면 포함 가능'
    +'\n• 심연 결사원은 정체 숨김 (disg 판정 성공 시만 발각)'
    +'\n• 교화 행동 시 NPC 반응을 fath/wil 기준으로 묘사'
    +'\n• GS: religion_share_delta:{region,temple±,solar±,roots±,abyss±} — 신도 변화 시 출력'
    +'\n• GS: convert_npc:{name,from,to} — NPC 개종 시 출력'
    +'\n• GS: religion_tension_up:{region} — 긴장도 상승 시 출력';
}
window.getReligionBLS = getReligionBLS;

window.getReligionBLS = window.getReligionBLS;
}

