// ⑤ 적 사기(Morale) 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { TERRAIN_EFFECTS_BATTLE } from '../data/245-①-전투-지형-효과.js';
import { toast } from '../utils.js';

export function updateEnemyMorale(isSuccess, isCritSuccess, isCritFail, cleanText){
  if(!S._inCombat) return;
  if(S._enemyMorale === undefined) S._enemyMorale = 80;

  // 리더 처치 감지 → 사기 대폭 하락
  const leaderKilled = /두목.*쓰러|수장.*처치|대장.*죽|리더.*격파|지휘관.*쓰러/.test(cleanText||'');
  if(leaderKilled){
    S._enemyMorale = Math.max(0, S._enemyMorale - 40);
    toast('🏳️ 적 리더 처치! 적 사기 대폭 하락!', 2500);
  }

  // [신규] 지휘관형 — "절대 먼저 덤비지 않음" 힌트를 시스템으로 보강.
  // 지휘관(보스/네임드)이 아직 살아있는 동안은 부하들의 사기가 잘 안
  // 흔들린다는 의미로, 사기 변동폭을 줄인다. 지휘관이 죽으면(leaderKilled)
  // 위에서 이미 대폭 하락 처리되므로 자연스럽게 통제력이 사라진다.
  const monsters = (typeof loadMonsters==='function') ? (loadMonsters()||[]) : [];
  const commanderAlive = monsters.some(m=>m.status==='alive' && m._behaviorId==='commander' && (m.isBoss||m.isNamed));
  const moraleDamp = commanderAlive ? 0.6 : 1.0;

  if(isCritSuccess)     S._enemyMorale = Math.max(0,   S._enemyMorale - Math.round(20*moraleDamp));
  else if(isSuccess)    S._enemyMorale = Math.max(0,   S._enemyMorale - Math.round(8*moraleDamp));
  else if(isCritFail)   S._enemyMorale = Math.min(100, S._enemyMorale + 15);
  else if(!isSuccess)   S._enemyMorale = Math.min(100, S._enemyMorale + 6);

  // 사기 효과 적용
  const morale = S._enemyMorale;
  let moraleCtx = '';
  if(morale <= 10){
    moraleCtx = `\n[🏳️ 적 사기 완전 붕괴(${morale})] 적들이 무기를 버리고 도망치거나 항복한다. 전투가 사실상 끝났다.`;
    toast('🏳️ 적 사기 붕괴! 적이 도망친다!', 3000);
    S._inCombat = false;
  } else if(morale <= 30){
    moraleCtx = `\n[😨 적 사기 낮음(${morale})] 적들이 눈에 띄게 흔들린다. 일부는 후퇴하고 남은 적도 소극적으로 싸운다.`;
    // [신규] 사기·콤보·지형 연계 — 적이 흔들리는 순간이야말로 지형을
    // 활용한 필살 행동이 가장 그럴듯하게 성립하는 타이밍이다. 이 셋이
    // 각자 따로 토스트만 띄우고 끝나는 게 아니라, 서로 맞물려 "결정적인
    // 한 순간"을 만들도록 AI에게 그 연결고리를 직접 알려준다.
    if(S._terrainId && typeof TERRAIN_EFFECTS_BATTLE!=='undefined' && TERRAIN_EFFECTS_BATTLE[S._terrainId]?.finisher){
      moraleCtx += ` 적이 흔들리는 이 틈이야말로 "${TERRAIN_EFFECTS_BATTLE[S._terrainId].finisher.label}" 같은 지형 필살 행동을 시도하기에 가장 그럴듯한 순간이다 — 상황이 맞는다면 선택지나 서사로 자연스럽게 제안하라.`;
    }
  } else if(morale >= 90){
    moraleCtx = `\n[😡 적 사기 최고(${morale})] 적들이 분노해 더욱 공격적으로 덤빈다. 이번 턴 적의 공격이 강해진다.`;
  } else if(morale >= 70){
    moraleCtx = `\n[💪 적 사기 높음(${morale})] 적들이 자신감 있게 싸운다.`;
  }
  // [신규] 콤보 연계 — 5콤보 이상이면 적의 빈틈이 커진 상태이므로,
  // 지형 필살 행동의 성공 가능성도 함께 높아진다는 것을 AI에게 알린다.
  if(typeof window.comboState!=='undefined' && window.comboState.count>=5 && S._terrainId && typeof TERRAIN_EFFECTS_BATTLE!=='undefined' && TERRAIN_EFFECTS_BATTLE[S._terrainId]?.finisher){
    moraleCtx += `\n[🔥 ${window.comboState.count}콤보 + 지형 활용] 연속된 우위로 적의 빈틈이 크게 벌어졌다. 지금이 "${TERRAIN_EFFECTS_BATTLE[S._terrainId].finisher.label}" 같은 결정적 행동을 시도하기 좋은 순간이다.`;
  }
  if(moraleCtx) S._nextInjectedContext = (S._nextInjectedContext||'') + moraleCtx;
}
window.updateEnemyMorale = updateEnemyMorale;
