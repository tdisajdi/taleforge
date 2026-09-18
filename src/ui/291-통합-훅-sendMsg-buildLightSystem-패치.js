// 통합 훅 — sendMsg / buildLightSystem 패치
// Auto-extracted from taleforge.html (original section banner preserved above).
import { buildCombatChoices, getEquippedItemCombatHint } from '../combat/281-1-전투-시스템-실질화.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { COMPANION_PERSONALITIES } from '../data/284-4-동료-시스템-강화.js';
import { MYSTERY_QUESTLINE } from '../data/290-10-진짜-미스터리-퀘스트라인.js';
import { processInvestments, processMercenary, showEconomyMenu } from '../economy/285-5-경제-시스템-실질화.js';
import { buildItemNarrativeContext } from '../items/282-2-인벤토리아이템-서사-연동.js';
import { checkCompanionLeave, growCompanions, loadCompanionExt } from '../items/284-4-동료-시스템-강화.js';
import { buildButterflyContext, recordButterflyEvent } from '../items/287-7-선택-나비효과-강화.js';
import { loadParty, loadReputation } from '../misc/054-이동수단-시스템.js';
import { getUnifiedFameLevel } from '../npc/286-6-평판명성-통합-시스템.js';
import { generateLocalFlavorChoices } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { checkMysteryQuestlineProgress } from '../quest/290-10-진짜-미스터리-퀘스트라인.js';
import { toast } from '../utils.js';
import { buildWorldImpactContext, updateWorldImpact } from '../world/289-9-세계-상태-변화-가시화.js';
import { _origRenderChoices } from './231-스토리서사-캐릭터-성장-UIUX-개선-시스템.js';
import { showCraftingQuickMenu } from './283-3-크래프팅-빠른-접근-UI.js';

(function initGameplayV2(){
  setTimeout(()=>{
    // [버그 수정] 이 자리에 있던 sendMsg 훅(나비효과 기록·동료 이탈 체크·
    // 세계 영향력 갱신)은 window.sendMsg를 감싸는 방식이라(quest/086이
    // sendMsg를 로컬 바인딩으로 직접 호출해 재할당이 도달 못 함 — 다른
    // 죽은 훅들과 동일한 원인) 한 번도 실행되지 않았다. quest/086의
    // sendMsg() 전송 직전(원래와 동일한 순서 — AI 호출 전)에 네이티브로
    // 연결했다.

    // tickGameTime 베이스 정의 (없을 경우)
    if(typeof window.tickGameTime !== 'function'){
      window.tickGameTime = function(){
        // 기본 시간 흐름: 턴마다 게임 시간 1단위 증가
        if(S && S.gameTime !== undefined) S.gameTime = (S.gameTime||0) + 1;
      };
    }
    // tickGameTime 훅 — 턴마다 처리
    const _origTick = window.tickGameTime;
    if(typeof _origTick === 'function' && !window._gameplayV2TickPatched){
      window._gameplayV2TickPatched = true;
      window.tickGameTime = function(){
        const result = _origTick.apply(this, arguments);
        try{
          growCompanions();
          processInvestments();
          processMercenary();
          checkMysteryQuestlineProgress();
        }catch(e){}
        return result;
      };
    }

    // buildLightSystem 훅 — 새 섹션들 주입
    const _origBLS = window.buildLightSystem;
    if(typeof _origBLS === 'function' && !window._gameplayV2BLSPatched){
      window._gameplayV2BLSPatched = true;
      window.buildLightSystem = function(char, ...args){
        let result = _origBLS.apply(this, [char, ...args]);
        if(typeof result !== 'string') return result;
        try{
          // 아이템 서사 연동
          const itemCtx = buildItemNarrativeContext();
          if(itemCtx) result += itemCtx;
          // 나비효과
          const butterflyCtx = buildButterflyContext();
          if(butterflyCtx) result += butterflyCtx;
          // 세계 변화
          const worldCtx = buildWorldImpactContext();
          if(worldCtx) result += worldCtx;
          // 전투 중 아이템 힌트
          if((currentMonsters||[]).some(m=>m.status==='alive')){
            const combatHint = getEquippedItemCombatHint();
            if(combatHint) result += `\n[⚔️ 전투 장비 힌트] ${combatHint}`;
          }
          // 미스터리 진행 힌트
          if(S._mysteryProgress > 0 && S._mysteryHints?.length){
            result += `\n[🧩 미스터리 단서 ${S._mysteryProgress}/${MYSTERY_QUESTLINE.totalClues}] 현재까지 수집한 단서: ${S._mysteryHints.slice(-2).join(' / ')}`;
          }
          // 동료 성격 컨텍스트
          const party = typeof loadParty==='function' ? loadParty() : [];
          if(party.length){
            const ext = loadCompanionExt();
            const compCtx = party.map(m=>{
              const pType = ext[m.name]?.personality;
              const pDef = pType ? COMPANION_PERSONALITIES[pType] : null;
              const trust = ext[m.name]?.trustLevel||0;
              return pDef ? `${m.icon}${m.name}(${pDef.label}, 신뢰${trust}/100)` : `${m.icon}${m.name}`;
            }).join(', ');
            result += `\n[👥 동료 상태] ${compCtx} — 각 동료의 성격에 맞는 대사와 반응을 보여라.`;
          }
          // 통합 명성 레벨
          const rep = typeof loadReputation==='function' ? loadReputation() : {score:0};
          const fameLevel = getUnifiedFameLevel(rep.score);
          if(fameLevel.min > 0)
            result += `\n[${fameLevel.icon} 명성: ${fameLevel.label}] ${fameLevel.npcReact}`;
        }catch(e){}
        return result;
      };
    }

    // 전투 중 선택지 강화
    const _origRenderChoices = window.renderChoices;
    if(typeof _origRenderChoices === 'function' && !window._gameplayV2ChoicesPatched){
      window._gameplayV2ChoicesPatched = true;
      window.renderChoices = function(){
        // 전투 중이면 전투 특화 선택지 추가 제안
        try{
          const alive = (currentMonsters||[]).filter(m=>m.status==='alive');
          if(alive.length && S.choices?.length && !S._combatChoicesInjected){
            const _lastUserMsg = (S.messages||[]).filter(m=>m.role==='user').slice(-1)[0]?.content || '';
            const combatChoices = buildCombatChoices(currentMonsters, _lastUserMsg);
            if(combatChoices && combatChoices.length){
              // 기존 선택지와 전투 선택지 병합 (중복 없이 최대 5개 — 기본 선택지가
              // 3→4개로 늘어난 데 맞춰 상향. 그렇지 않으면 전투 중엔 AI의 4번째
              // 선택지나 가끔 붙는 ⑤ 비밀 선택지가 병합 과정에서 잘려나간다)
              const merged = [...new Set([...combatChoices, ...S.choices])].slice(0,5);
              S.choices = merged;
              S._combatChoicesInjected = true;
            }
          } else if(!alive.length){
            S._combatChoicesInjected = false;
          }
        }catch(e){}
        // [로컬 선택지 재조합] AI가 준 선택지 뒤에, 자리가 남으면(최대 5개)
        // 그 자리에서 즉석 조합한 선택지를 채워 넣는다 — 이 상황을 예전에
        // 몇 번 겪었는지와 무관하게 매 턴 다르므로, Memory-Echo가 재생한
        // 턴(오래된 선택지가 그대로 나온 턴)에도 최소 하나는 항상 신선한
        // 선택지가 섞이도록 보장한다. AI 선택지를 절대 밀어내지 않도록
        // 항상 뒤에만 이어붙인다.
        try{
          if(S.choices?.length && S.choices.length < 5 && S._localFlavorInjectedTurn !== S.msgCount){
            const room = 5 - S.choices.length;
            const flavor = generateLocalFlavorChoices(room);
            if(flavor && flavor.length){
              S.choices = [...new Set([...S.choices, ...flavor])];
            }
            S._localFlavorInjectedTurn = S.msgCount;
          }
        }catch(e){}
        return _origRenderChoices.apply(this, arguments);
      };
    }

    // 크래프팅 버튼을 하단 바에 추가
    setTimeout(()=>{
      try{
        const btmBar = document.querySelector('.btm-bar');
        if(btmBar && !document.getElementById('btn-craft-quick')){
          const btn = document.createElement('button');
          btn.id = 'btn-craft-quick';
          btn.className = 'bb';
          btn.textContent = '⚒️제작';
          btn.title = '빠른 제작 메뉴';
          btn.onclick = showCraftingQuickMenu;
          btmBar.appendChild(btn);
        }
        // 경제 버튼도 추가
        if(btmBar && !document.getElementById('btn-economy')){
          const btn2 = document.createElement('button');
          btn2.id = 'btn-economy';
          btn2.className = 'bb';
          btn2.textContent = '💰경제';
          btn2.title = '경제 행동 메뉴';
          btn2.onclick = showEconomyMenu;
          btmBar.appendChild(btn2);
        }
      }catch(e){}
    }, 4000);

    toast('🎮 게임플레이 강화 시스템 v2.0 로드 완료', 2000);
  }, 3500);
})();
