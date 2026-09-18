// ⑪ 상황별 BLS 주입 (Context-Aware)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadNPCs } from '../misc/001-block0-preamble.js';
import { searchEvents } from '../misc/142-③-사건-DB-태그-인덱스-전문-검색.js';
import { loadPlayerDB } from '../misc/144-⑤-플레이어-상태-DB.js';
import { getNpc, getRecentNpcs } from '../npc/140-①-NPC-DB-가장-세분화.js';
import { getNpcRelations } from '../npc/143-④-관계-DB-NPC-간-관계망.js';
import { getRecentNpcDialogs } from '../npc/146-⑦-대화-DB-NPC별-실제-대화-전문-보존.js';
import { getAncientLangBLS, getDiplomacyBLS, getLoopWorldBLS } from '../progression/018-5170번-환생-누적-시스템.js';
import { getSummonSystemBLS } from '../progression/089-칭호-시스템-완전판-1개-활성화-스탯-효과-적용.js';
import { getActiveQuests } from '../quest/141-②-퀘스트-DB.js';
import { getSealOrderBLS } from '../ui/155-⑭-메모리-패널-UI.js';
import { loadWorldDB } from '../world/145-⑥-세계-상태-DB.js';

export function detectCtx(){
  const msgs=S.messages||[];
  const lastU=(msgs.filter(m=>m.role==='user').slice(-1)[0]||{}).content||'';
  const lastA=(msgs.filter(m=>m.role==='assistant').slice(-1)[0]||{}).content||'';
  const txt=(lastU+lastA).toLowerCase();

  const activeSummons=typeof window.loadSummons==='function'?(window.loadSummons()||[]).filter(s=>s.status==='active'):[];
  const activeNpcs=typeof loadNPCs==='function'?(loadNPCs()||[]):[];
  const monsters=typeof loadMonsters==='function'?(loadMonsters()||[]).filter(m=>m.status==='alive'):[];

  // 대화 중인 NPC 찾기 (더 정확하게)
  let talkNpc=null;
  for(const n of activeNpcs){
    if(n.name&&(lastU.includes(n.name)||lastA.includes(n.name))){
      talkNpc=n.name; break;
    }
  }

  return {
    inCombat:       monsters.length>0,
    talkNpc,
    hasSummons:     activeSummons.length>0,
    summonActive:   activeSummons.length>0&&/소환수|소환|귀환|임무|강화|진화/.test(txt),
    inReligion:     /신전|성전|사원|성직|사제|교회|종교|신앙|이단|성지/.test(txt),
    onQuest:        getActiveQuests().length>0,
    inDungeon:      /던전|지하|유적|폐허|동굴|미궁|보스/.test(txt),
    loopRelated:    /감시자|루프|회차|환생|봉인석|세계수/.test(txt),
    diplomacy:      /협상|외교|조약|동맹|휴전/.test(txt),
    exploration:    /탐험|지도|장소|이동|여행/.test(txt),
  };
}
window.detectCtx = detectCtx;

export function buildContextBLS(){
  const ctx=detectCtx();
  const parts=[];

  // ── 항상: 핵심 DB 요약 ───────────────────────────────
  const core=buildCoreBLS();
  if(core) parts.push(core);

  // ── 전투 ─────────────────────────────────────────────
  if(ctx.inCombat||ctx.summonActive){
    try{ const x=typeof getSummonSystemBLS==='function'?getSummonSystemBLS():''; if(x) parts.push(x); }catch(e){}
  }

  // ── NPC 대화 ──────────────────────────────────────────
  if(ctx.talkNpc){
    const npc=getNpc(ctx.talkNpc);
    const dialogs=getRecentNpcDialogs(ctx.talkNpc,4);
    const deepLore=typeof V36_NPC_DEEP_LORE!=='undefined'?V36_NPC_DEEP_LORE[ctx.talkNpc]:null;
    if(npc||deepLore){
      let s='\n\n[🎭 '+ctx.talkNpc+' 상세 기억]';
      if(npc){
        s+='\n관계점수: '+npc.relation.score+'('+npc.relation.type+') 신뢰:'+npc.trust+' 공포:'+npc.fear;
        s+='\n현재 감정: '+npc.emotions.current+' | 배신위험: '+npc.betrayalRisk+'%';
        if(npc.keyFacts.length) s+='\n핵심사실: '+npc.keyFacts.slice(-4).map(f=>f.text).join(' / ');
        if(npc.promises.filter(p=>p.kept==null).length) s+='\n미결 약속: '+npc.promises.filter(p=>p.kept==null).map(p=>p.text).join(' / ');
        if(npc.secrets.revealed.length) s+='\n드러난 비밀: '+npc.secrets.revealed.slice(-2).join(' / ');
        if(npc.reactPositiveTo.length) s+='\n호의 반응: '+npc.reactPositiveTo.join('·');
        if(npc.reactNegativeTo.length) s+='\n부정 반응: '+npc.reactNegativeTo.join('·');
        if(npc.loyaltyBreakpoint) s+='\n배신 임계점: '+npc.loyaltyBreakpoint;
      }
      if(deepLore){ s+='\n내면: '+deepLore.deep.slice(0,100)+'\n버릇: '+deepLore.mannerism; }
      if(dialogs.length){ s+='\n최근 대화:\n'+dialogs.map(d=>'  플레이어: "'+d.player.slice(0,50)+'" → '+d.npc.slice(0,80)).join('\n'); }
      // NPC 관계망
      const rels=getNpcRelations(ctx.talkNpc).slice(0,3);
      if(rels.length) s+='\n이 NPC의 관계: '+rels.map(r=>{const other=r.npcA===ctx.talkNpc?r.npcB:r.npcA; return other+'('+r.relation.type+')'}).join(', ');
      parts.push(s);
    }
  }

  // ── 종교 ─────────────────────────────────────────────
  if(ctx.inReligion){
    try{ const x=typeof window.getReligionBLS==='function'?window.getReligionBLS():''; if(x) parts.push(x); }catch(e){}
  }

  // ── 활성 퀘스트 ──────────────────────────────────────
  if(ctx.onQuest){
    const qs=getActiveQuests().slice(0,3);
    if(qs.length){
      const lines=qs.map(q=>{
        let s='• ['+(q.isMainQuest?'메인':'서브')+'] '+q.title+' — '+q.objective;
        const curPhase=q.phases.find(p=>p.status==='active'||p.status==='in_progress');
        if(curPhase) s+='\n  현재 단계: '+curPhase.desc;
        const recentClue=q.clues.slice(-1)[0];
        if(recentClue) s+='\n  최신 단서: '+recentClue.text;
        const recentChoice=q.choices.slice(-1)[0];
        if(recentChoice) s+='\n  최근 선택: '+recentChoice.desc+' → '+recentChoice.outcome;
        return s;
      });
      parts.push('\n\n[📜 진행 퀘스트 상세]\n'+lines.join('\n\n'));
    }
  }

  // ── 루프/봉인석 ──────────────────────────────────────
  if(ctx.loopRelated){
    try{ const x=typeof getLoopWorldBLS==='function'?getLoopWorldBLS():''; if(x) parts.push(x); }catch(e){}
    try{ const x=typeof getSealOrderBLS==='function'?getSealOrderBLS():''; if(x) parts.push(x); }catch(e){}
    try{ const x=typeof getAncientLangBLS==='function'?getAncientLangBLS():''; if(x) parts.push(x); }catch(e){}
  }

  // ── 외교 ─────────────────────────────────────────────
  if(ctx.diplomacy){
    try{ const x=typeof getDiplomacyBLS==='function'?getDiplomacyBLS():''; if(x) parts.push(x); }catch(e){}
  }

  return parts.join('');
}
window.buildContextBLS = buildContextBLS;

window.buildContextBLS=buildContextBLS;

export function buildCoreBLS(){
  try{
    const parts=[];
    const t=S.msgCount||0;

    // 최근 만난 NPC 요약 (5명)
    const recentNpcs=getRecentNpcs(5,40);
    if(recentNpcs.length){
      parts.push('[최근 NPC] '+recentNpcs.map(n=>
        n.name+'('+n.relation.type+'/신뢰'+n.trust+'/감정:'+n.emotions.current+(n.betrayalRisk>50?' ⚠️배신위험':'')+')'
      ).join(' | '));
    }

    // 활성 퀘스트 (제목만)
    const qs=getActiveQuests();
    if(qs.length) parts.push('[진행퀘스트] '+qs.map(q=>q.title+(q.isMainQuest?'(메인)':'')).join(' / '));

    // 최근 사건 (3개)
    const evts=searchEvents({ recent:true, limit:3 });
    if(evts.length) parts.push('[최근사건] '+evts.map(e=>e.title).join(' → '));

    // 플레이어 상태
    const p=loadPlayerDB();
    const pLines=[];
    const activeInj=p.injuries.filter(i=>!i.healed);
    if(activeInj.length) pLines.push('부상: '+activeInj.map(i=>i.text).join('/'));
    if(p.traumas.filter(t=>!t.resolved).length) pLines.push('트라우마: '+p.traumas.filter(t=>!t.resolved).slice(-2).map(t=>t.text).join('/'));
    const latestAch=p.achievements.slice(-2);
    if(latestAch.length) pLines.push('업적: '+latestAch.map(a=>a.text).join('/'));
    const activeBonds=p.bonds.filter(b=>!b.broken&&b.strength>=50);
    if(activeBonds.length) pLines.push('강한유대: '+activeBonds.map(b=>b.npc+'('+b.strength+')').join('/'));
    if(pLines.length) parts.push('[주인공] '+pLines.join(' | '));

    // 도덕 성향
    const align=p.moralAlignment||0;
    const alignDesc=align>=60?'선량':align>=20?'선':align>=-20?'중립':align>=-60?'악':'극악';
    parts.push('[도덕성향] '+alignDesc+'('+align+')');

    // 세계 상태
    const w=loadWorldDB();
    const brokenSeals=Object.entries(w.seals).filter(([,s])=>s.broken).map(([n])=>n);
    if(brokenSeals.length) parts.push('[파괴봉인석] '+brokenSeals.join('/'));
    const activeFlags=Object.entries(w.flags).filter(([,f])=>f.set).slice(-5).map(([k])=>k);
    if(activeFlags.length) parts.push('[세계플래그] '+activeFlags.join('/'));

    if(!parts.length) return '';
    return '\n\n[🧠 메모리 핵심 요약]\n'+parts.join('\n');
  }catch(e){ return ''; }
}
window.buildCoreBLS = buildCoreBLS;

window.buildCoreBLS=buildCoreBLS;
