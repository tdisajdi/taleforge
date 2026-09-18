// 저장소
// Auto-extracted from taleforge.html (original section banner preserved above).
import { lsGet, lsSet } from '../utils.js';

export const HERITAGE_KEY    = 'tf-heritage-v2';

export const MILESTONE_KEY   = 'tf-milestones';

export const LOOP_RECORD_KEY = 'tf-loop-records';

export function loadHeritage(){ try{ return JSON.parse(lsGet(HERITAGE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadHeritage = loadHeritage;

export function saveHeritage(d){ try{ lsSet(HERITAGE_KEY,JSON.stringify(d)); }catch(e){} }
window.saveHeritage = saveHeritage;

export function loadMilestones(){ try{ return JSON.parse(lsGet(MILESTONE_KEY)||'[]'); }catch(e){ return []; } }
window.loadMilestones = loadMilestones;

export function saveMilestones(d){ try{ lsSet(MILESTONE_KEY,JSON.stringify(d)); }catch(e){} }
window.saveMilestones = saveMilestones;

export function loadLoopRecords(){ try{ return JSON.parse(lsGet(LOOP_RECORD_KEY)||'[]'); }catch(e){ return []; } }
window.loadLoopRecords = loadLoopRecords;

export function saveLoopRecords(d){ try{ lsSet(LOOP_RECORD_KEY,JSON.stringify(d)); }catch(e){} }
window.saveLoopRecords = saveLoopRecords;
