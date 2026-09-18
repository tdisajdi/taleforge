// [NEW] 히든 퀘스트 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { HIDDEN_QUEST_POOL } from '../data/039-NEW-히든-퀘스트-시스템.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

export const HIDDEN_QUEST_KEY  = "taleforge-hidden-quests";

export const loadHiddenQuests  = () => {
  const r = lsGet(HIDDEN_QUEST_KEY);
  if(!r) return {};
  try{
    const parsed = JSON.parse(r);
    // 구버전 호환: 배열(string[])이면 객체로 마이그레이션
    if(Array.isArray(parsed)){
      const migrated = {};
      parsed.forEach(id => {
        const pool = (typeof HIDDEN_QUEST_POOL !== 'undefined') ? HIDDEN_QUEST_POOL.find(q=>q.id===id) : null;
        migrated[id] = { id, name: pool?.name||id, icon: pool?.icon||'🔮', desc: pool?.desc||'', reward: pool?.reward||'', status:'completed', startedAt: new Date().toISOString() };
      });
      lsSet(HIDDEN_QUEST_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  }catch(e){ return {}; }
};

export const saveHiddenQuests  = (q) => lsSet(HIDDEN_QUEST_KEY, JSON.stringify(q));


export const SCHOLAR_RESEARCH_LOG_KEY = 'tf-scholar-research-log';

export function loadScholarResearchLog(){ try{ return JSON.parse(lsGet(SCHOLAR_RESEARCH_LOG_KEY)||'{"count":0}'); }catch(e){ return {count:0}; } }
window.loadScholarResearchLog = loadScholarResearchLog;

export function saveScholarResearchLog(d){ try{ lsSet(SCHOLAR_RESEARCH_LOG_KEY, JSON.stringify(d)); }catch(e){} }
window.saveScholarResearchLog = saveScholarResearchLog;
