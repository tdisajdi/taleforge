// GS 처리 — clan_join / clan_leave / clan_rep_delta / clan_event
// Auto-extracted from taleforge.html (original section banner preserved above).
import { addClanHistory, changeClanRep, joinClan, leaveClan, promoteClan } from '../core/135-저장-키.js';

(function hookClanGS(){
  setTimeout(()=>{
    const orig = window.processGSToAllDBs;
    if(typeof orig==='function' && !orig._clanGSHooked){
      window.processGSToAllDBs = function(gs){
        const result = orig.apply(this, arguments);
        try{
          if(gs.clan_join)      joinClan(gs.clan_join);
          if(gs.clan_leave)     leaveClan(gs.clan_leave);
          if(gs.clan_promote)   promoteClan(gs.clan_promote);
          if(gs.clan_rep_delta){
            const d = gs.clan_rep_delta;
            const id = d.clan||d.id;
            if(id) changeClanRep(id, d.delta||0, d.reason||'AI 이벤트');
          }
          if(gs.clan_event){
            const d = gs.clan_event;
            if(d.clan && d.text) addClanHistory(d.clan, d.type||'event', d.text);
          }
        }catch(e){}
        return result;
      };
      window.processGSToAllDBs._clanGSHooked = true;
    }
  }, 2000);
})();
