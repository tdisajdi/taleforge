// ★ NEW 5: 종족 공통 NPC 원한 시스템 강화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { addGrudge, resolveGrudge } from '../misc/016-2130번-시스템.js';
import { lsGet, lsSet, toast } from '../utils.js';

export const NPC_GRUDGE_KEY = 'tf-npc-grudge-v2';

export function loadNpcGrudgeMap(){ try{ return JSON.parse(lsGet(NPC_GRUDGE_KEY)||'{}'); }catch(e){ return {}; } }
window.loadNpcGrudgeMap = loadNpcGrudgeMap;

export function saveNpcGrudgeMap(d){ lsSet(NPC_GRUDGE_KEY, JSON.stringify(d)); }
window.saveNpcGrudgeMap = saveNpcGrudgeMap;

export function addNpcGrudge(npcName, reason, power){
  const map = loadNpcGrudgeMap();
  if(!map[npcName]){
    map[npcName] = { name:npcName, grudges:[], resolved:false, power:0 };
  }
  map[npcName].grudges.push({ reason, power:power||1, addedAt:S.msgCount||0 });
  map[npcName].power = Math.min(10, map[npcName].power + (power||1));
  saveNpcGrudgeMap(map);
  // AI 프롬프트용 - 원한 NPC 기록
  if(typeof addGrudge==='function') addGrudge(npcName, power||1, S.character?.scenario||'');
  toast(`😤 ${npcName}의 원한이 쌓였습니다!`, 2000);
}
window.addNpcGrudge = addNpcGrudge;

window.addNpcGrudge = addNpcGrudge;

export function resolveNpcGrudge(npcName){
  const map = loadNpcGrudgeMap();
  if(map[npcName]){ map[npcName].resolved = true; saveNpcGrudgeMap(map); }
  if(typeof resolveGrudge==='function') resolveGrudge(npcName);
  toast(`🤝 ${npcName}의 원한이 해소되었습니다.`, 2000);
}
window.resolveNpcGrudge = resolveNpcGrudge;

window.resolveNpcGrudge = resolveNpcGrudge;

export function getNpcGrudgeSection(){
  const map = loadNpcGrudgeMap();
  const active = Object.values(map).filter(g=>!g.resolved&&g.power>0);
  if(!active.length) return '';
  return `\n[😤 원한 관계 NPC]\n${active.map(g=>{
    const bar = '█'.repeat(Math.min(g.power,10)) + '░'.repeat(Math.max(0,10-g.power));
    const lastReason = g.grudges[g.grudges.length-1]?.reason||'알 수 없는 이유';
    return `• ${g.name}: 원한 ${g.power}/10 [${bar}] — "${lastReason}"`;
  }).join('\n')}\n이 NPC들은 적대적으로 행동하거나 복수 기회를 노립니다. 원한이 7 이상이면 기습이나 함정을 꾸밀 수 있습니다.`;
}
window.getNpcGrudgeSection = getNpcGrudgeSection;

window.getNpcGrudgeSection = getNpcGrudgeSection;

(function hookNpcGrudgeFromGS(){
  setTimeout(()=>{
    const origProc = window.processGSToAllDBs;
    if(typeof origProc==='function' && !origProc._grudgeHooked){
      window.processGSToAllDBs = function(gs){
        const result = origProc.apply(this, arguments);
        // NPC 관계가 -20 이하로 악화되면 원한 추가
        if(Array.isArray(gs?.npc)){
          gs.npc.forEach(n=>{
            if(n.rel && (n.rel==='hostile'||n.rel==='enemy')){
              const existing = loadNpcGrudgeMap()[n.name];
              if(!existing||!existing.resolved){
                addNpcGrudge(n.name, '적대 관계', 2);
              }
            }
            // [버그 수정] resolveNpcGrudge가 완성돼 있었지만 호출부가
            // 전혀 없어 한 번 쌓인 원한이 게임 안에서 절대 풀릴 방법이
            // 없었다(플레이어가 화해에 성공해도 원한 표시가 영구히
            // 남음). 원한 추가와 정확히 대칭되는 조건 — AI가 관계를
            // 다시 우호적(friendly)으로 보고하면 — 에서 해소하도록
            // 연결한다.
            else if(n.rel === 'friendly'){
              const existing = loadNpcGrudgeMap()[n.name];
              if(existing && !existing.resolved){
                resolveNpcGrudge(n.name);
              }
            }
          });
        }
        return result;
      };
      window.processGSToAllDBs._grudgeHooked = true;
    }
  }, 800);
})();
