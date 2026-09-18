// 10. 진짜 미스터리 퀘스트라인
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MYSTERY_QUESTLINE } from '../data/290-10-진짜-미스터리-퀘스트라인.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const MQ_DATA_KEY = 'tf-mystery-questline';

export function loadMQData(){ try{ return JSON.parse(lsGet(MQ_DATA_KEY)||'{"found":[],"active":true}'); }catch(e){ return {found:[],active:true}; } }
window.loadMQData = loadMQData;

export function saveMQData(d){ try{ lsSet(MQ_DATA_KEY, JSON.stringify(d)); }catch(e){} }
window.saveMQData = saveMQData;

export function checkMysteryQuestlineProgress(){
  try{
    const mq = loadMQData();
    if(!mq.active) return;
    const turn = S.msgCount||0;
    // 해당 턴에 공개될 단서 확인
    for(const clue of MYSTERY_QUESTLINE.clues){
      if(turn >= clue.turn && !mq.found.includes(clue.id)){
        if(Math.random() < 0.4){ // 40% 확률로 발견
          mq.found.push(clue.id);
          saveMQData(mq);
          // AI에 단서 발견 힌트 주입
          S._nextInjectedContext = (S._nextInjectedContext||'') +
            ` [🧩 미스터리 단서 발견: ${clue.icon}${clue.title}] ${clue.reveal} 이 장면을 지금 서사에 자연스럽게 삽입하라. 너무 직접적이지 않게, 플레이어가 스스로 의미를 파악하도록.`;
          setTimeout(()=>toastHTML(`🧩 미스터리 단서 발견: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(clue,{size:14}):(clue.icon)} ${esc(clue.title)}`, 4000), 1000);
          // 모든 단서 수집 시
          if(mq.found.length >= MYSTERY_QUESTLINE.totalClues){
            mq.active = false;
            saveMQData(mq);
            setTimeout(()=>{
              S._nextInjectedContext = (S._nextInjectedContext||'') +
                ' [🌟 대미스터리 완성] 모든 단서가 모였다. 세계의 균열 퀘스트라인이 완성됐다. 이번 장면 또는 다음 장면에서 진실이 드러나는 클라이맥스를 향해 서사를 이끌어라.';
              toast('🌟 미스터리 퀘스트라인 완성! 세계의 진실에 다가섰다!', 5000);
            }, 2000);
          }
          break;
        }
      }
    }
    // 미스터리 진행 상황을 BLS에 포함
    if(mq.found.length > 0){
      S._mysteryProgress = mq.found.length;
      S._mysteryHints = mq.found.map(id=>MYSTERY_QUESTLINE.clues.find(c=>c.id===id)?.hint||'').filter(Boolean);
    }
  }catch(e){}
}
window.checkMysteryQuestlineProgress = checkMysteryQuestlineProgress;

window.checkMysteryQuestlineProgress = checkMysteryQuestlineProgress;
