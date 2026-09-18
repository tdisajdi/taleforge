// ⑩ 자동 요약 압축 (강화판)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { MEMDB } from '../data/139-스토어-키.js';
import { addEvent } from '../misc/142-③-사건-DB-태그-인덱스-전문-검색.js';
import { updatePlayerDB } from '../misc/144-⑤-플레이어-상태-DB.js';
import { upsertNpc } from '../npc/140-①-NPC-DB-가장-세분화.js';
import { upsertQuest } from '../quest/141-②-퀘스트-DB.js';
import { dbGet, dbSet, toast } from '../utils.js';
import { updateWorldDB } from '../world/145-⑥-세계-상태-DB.js';

export function loadSummaries(){ return dbGet(MEMDB.SUMMARY)||[]; }
window.loadSummaries = loadSummaries;

export function saveSummaries(d){ dbSet(MEMDB.SUMMARY,d); }
window.saveSummaries = saveSummaries;

window._compressLock = false;

export async function autoCompressHistory(){
  if(window._compressLock) return;
  if(!S.messages||S.messages.length<30) return;
  const toCompress=S.messages.slice(0,-20);
  if(toCompress.length<10) return;

  const summaries=loadSummaries();
  const lastEnd=summaries.length?summaries[summaries.length-1].endTurn:0;
  if(lastEnd>=(S.msgCount||0)-20) return;

  window._compressLock=true;
  try{
    const text=toCompress.map(m=>(m.role==='user'?'[P]':'[S]')+' '+(m.content||'').slice(0,250)).join('\n');
    const prompt='다음 RPG 대화를 분석해 반드시 순수 JSON만 출력 (```없이):\n{"narrative":"핵심서사흐름200자","npcs":[{"name":"NPC명","fact":"드러난사실","emotion":"감정","relationChange":"관계변화"}],"quests":[{"title":"퀘스트명","progress":"진행상황","clue":"새단서"}],"events":[{"title":"사건","impact":"영향"}],"playerChanges":{"injuries":[],"achievements":[],"choices":[]},"worldChanges":[],"moralDelta":0}\n\n대화:\n'+text.slice(0,3500);

    const raw=await window.callAI([{role:'user',content:prompt}],'');
    if(!raw||raw.length<20){ window._compressLock=false; return; }

    let summary;
    try{
      const m=raw.match(/\{[\s\S]*\}/);
      if(!m) throw new Error('no json');
      summary=JSON.parse(m[0]);
    }catch(e){ window._compressLock=false; return; }

    // DB 반영
    if(summary.npcs) summary.npcs.forEach(n=>{
      if(n.name) upsertNpc(n.name,{ fact:n.fact, emotion:n.emotion, relationDelta:0, relationReason:n.relationChange||'' });
    });
    if(summary.quests) summary.quests.forEach(q=>{
      if(q.title){ const id='q_'+q.title.replace(/\s/g,'').slice(0,12); upsertQuest(id,{ title:q.title, moment:q.progress, clue:q.clue }); }
    });
    if(summary.events) summary.events.forEach(e=>{ if(e.title) addEvent({ title:e.title, desc:e.impact, tags:['archived'], worldImpact:3 }); });
    if(summary.playerChanges){
      const pc=summary.playerChanges;
      (pc.achievements||[]).forEach(a=>updatePlayerDB({ achievement:a }));
      (pc.injuries||[]).forEach(i=>updatePlayerDB({ injury:i }));
      if(pc.choices&&pc.choices.length) updatePlayerDB({ choice:pc.choices[0], moralScore:summary.moralDelta||0 });
    }
    if(summary.worldChanges) summary.worldChanges.forEach(w=>{ if(w) updateWorldDB({ flag:String(w).slice(0,30) }); });

    const entry={
      id:'sum_'+Date.now(),
      startTurn:lastEnd, endTurn:(S.msgCount||0)-20,
      msgCount:toCompress.length,
      narrative:summary.narrative||'',
      npcCount:(summary.npcs||[]).length,
      eventCount:(summary.events||[]).length,
      createdAt:new Date().toISOString(),
    };
    const arr=loadSummaries();
    arr.push(entry);
    saveSummaries(arr.slice(-100));

    // 압축 메시지로 교체
    const compressed={
      role:'assistant',
      content:'[📖 압축된 서사 ('+entry.startTurn+'~'+entry.endTurn+'턴)]\n'+summary.narrative
        +(summary.events&&summary.events.length?'\n사건: '+summary.events.slice(0,3).map(e=>e.title).join(' / '):''),
      isCompressed:true,
    };
    S.messages=[compressed,...S.messages.slice(-20)];
    toast('📖 서사 자동 압축 완료 ('+toCompress.length+'턴 → 1개 요약)',3500);
  }catch(e){ console.warn('[Compress]',e); }
  finally{ window._compressLock=false; }
}
window.autoCompressHistory = autoCompressHistory;

window.autoCompressHistory=autoCompressHistory;

export function getSummaryBLS(){
  const arr=loadSummaries().slice(-3);
  if(!arr.length) return '';
  return '\n\n[📖 압축 서사 기록]\n'+arr.map(s=>'['+s.startTurn+'~'+s.endTurn+'턴] '+s.narrative).join('\n');
}
window.getSummaryBLS = getSummaryBLS;

window.getSummaryBLS=getSummaryBLS;
