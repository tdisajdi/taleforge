// [1] 소환수 — loadSummons / saveSummons
// Auto-extracted from taleforge.html (original section banner preserved above).
import { lsGet, lsSet } from '../utils.js';

export const SUMMONS_KEY = 'tf-summons-v3';

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_163(){
function loadSummons() {
  try { return JSON.parse(lsGet(SUMMONS_KEY) || '[]'); } catch(e) { return []; }
}
window.loadSummons = loadSummons;

function saveSummons(arr) {
  try { lsSet(SUMMONS_KEY, JSON.stringify(arr)); } catch(e) {}
}
window.saveSummons = saveSummons;

window.loadSummons = window.loadSummons;

window.saveSummons = window.saveSummons;
}

