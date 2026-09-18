// 영지 파트 업데이트
// Auto-extracted from taleforge.html (original section banner preserved above).
import { pmLoad, pmSave } from '../core/267-저장로드초기화.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { DEMESNE_EVENT_DEFS, calcDemesneResources } from '../race/260-수인족-패널-렌더.js';
import { lsGet } from '../utils.js';

export function pmUpdateDemesne() {
  try {
    var raw = lsGet('tf-demesne');
    if (!raw) return;
    var dem = JSON.parse(raw);
    if (!dem || !dem.established) return;
    var d = pmLoad('demesne');
    var turn = (typeof S !== 'undefined' && S.msgCount) || 0;
    d.name = dem.name || '';
    d.tier = dem.tier || 1;
    d.population = dem.population || 0;
    var res = typeof calcDemesneResources === 'function'
      ? calcDemesneResources(dem)
      : { tax:dem.tax||50, prosperity:dem.prosperity||50, defense:dem.defense||50, loyalty:dem.loyalty||50 };
    d.status = '세수'+res.tax+' 번영'+res.prosperity+' 방어'+res.defense+' 충성'+res.loyalty;
    d.vassals = (dem.vassals || []).map(function(v){ return v.name + '(' + v.role + ')'; });
    // 최근 역사 동기화
    var hist = (dem.history || []).slice(-10);
    d.decisions = hist.map(function(h){ return { turn:h.turn||0, text:(h.label||'').slice(0,50), outcome:'' }; });
    // 진행중 이벤트
    var activeEvts = (dem.events || []).filter(function(e){ return !e.resolved; });
    if (activeEvts.length) {
      var evtNames = activeEvts.map(function(e){
        var def = typeof DEMESNE_EVENT_DEFS !== 'undefined'
          ? DEMESNE_EVENT_DEFS.find(function(ed){ return ed.id === e.id; }) : null;
        return def ? def.name : e.id;
      });
      d.keyEvents = d.keyEvents || [];
      d.keyEvents.push({ turn:turn, text:'이벤트: ' + evtNames.join(', ') });
      // demesne keyEvents 무제한
    }
    pmSave('demesne', d);
  } catch(e) {}
}
window.pmUpdateDemesne = pmUpdateDemesne;
