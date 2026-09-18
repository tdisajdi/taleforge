// sendMsg 후처리 통합 훅
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { extractCodexTerms } from '../world/304-④-세계-신화-백과사전.js';
import { generateNpcAgenda, loadNpcAgenda, updateNpcAgendaFromRel } from '../npc/305-⑤-NPC-비밀-아젠다-이중성-시스템.js';
import { loadNPCs } from './001-block0-preamble.js';
import { checkDreamTrigger } from './302-②-꿈환영-시스템.js';
import { autoGenerateChronicle, CHRONICLE_INTERVAL } from './303-③-자동-모험-연대기-Living-Chronicle.js';
import { applyAtmosphereEffect, detectMoodFromText } from './307-⑨-감정-분위기-시각-효과-시스템.js';

(function hookSendMsgPostProcess(){
  if(window._newSystemsHooked) return;
  window._newSystemsHooked = true;

  // MutationObserver로 AI 메시지 생성 감지
  const observer = new MutationObserver(function(mutations){
    for(const mut of mutations){
      for(const node of mut.addedNodes){
        // [15차 감사 FIX] continue가 아니라 return이었다 — 이 콜백 안에서
        // 텍스트/주석 노드 하나만 먼저 걸려도(같은 mutation 배치에 다른
        // element 노드가 더 있어도) 그 즉시 콜백 전체가 끝나버려서, 뒤이은
        // 진짜 메시지 버블(.msg-ai)을 건너뛸 수 있는 잠재적 버그였다
        // (바로 옆 misc/320의 같은 패턴은 continue를 올바르게 쓰고 있음).
        if(node.nodeType !== 1) continue;
        const bubble = node.classList?.contains('msg-ai') ? node : node.querySelector?.('.msg-ai');
        if(!bubble) continue;
        const aiText = bubble.innerText || bubble.textContent || '';
        if(!aiText || aiText.length < 20) continue;

        const turn = S.msgCount||0;

        // 꿈 트리거
        checkDreamTrigger(aiText, turn);

        // [변경] 아래 세 기능은 전부 예전에 AI(Gemini)를 직접 호출하던
        // 방식이라 "API 한도 절약"을 위해 꺼둔 채였다 — 즉 지금까지
        // 실제로는 한 번도 작동하지 않던 죽은 기능이었다. 이제 셋 다
        // AI 호출이 전혀 없는 로컬 조합 방식으로 바뀌어서 그 제약이
        // 사라졌으므로 다시 켠다.

        // 연대기 자동 생성
        if(turn > 0 && turn % CHRONICLE_INTERVAL === 0){
          const msgs = S.fullMessages || S.messages || [];
          autoGenerateChronicle(msgs);
        }

        // 백과사전 추출
        extractCodexTerms(aiText);

        // 분위기 효과
        const mood = detectMoodFromText(aiText);
        if(mood) applyAtmosphereEffect(mood);

        // NPC 비밀 아젠다 자동 생성 (새 NPC 감지)
        const npcs = (typeof loadNPCs==='function') ? loadNPCs()||[] : [];
        const agenda = loadNpcAgenda();
        for(const npc of npcs){
          if(npc.name && !agenda[npc.name]){
            generateNpcAgenda(npc.name);
          }
          // 관계도 동기화
          if(npc.name && agenda[npc.name]){
            updateNpcAgendaFromRel(npc.name, npc.relationship||50);
          }
        }
      }
    }
  });

  const msgsEl = document.getElementById('msgs');
  if(msgsEl){
    observer.observe(msgsEl, { childList:true, subtree:true });
  } else {
    // msgs가 아직 없으면 body 감시하다가 나타나면 재연결
    const bodyObs = new MutationObserver(function(){
      const el = document.getElementById('msgs');
      if(el){
        observer.observe(el, { childList:true, subtree:true });
        bodyObs.disconnect();
      }
    });
    bodyObs.observe(document.body, { childList:true, subtree:true });
  }
})();
