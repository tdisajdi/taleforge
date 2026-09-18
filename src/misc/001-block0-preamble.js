// block0-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { _dirty } from '../data/001-block0-preamble.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

window.onerror = function(msg, src, line, col, err){
  console.error('[TaleForge Error]', msg, 'at line', line, err);
  try{
    var screens = document.querySelectorAll('.screen');
    var anyActive = false;
    screens.forEach(function(s){ if(s.classList.contains('active')) anyActive=true; });
    if(!anyActive){
      var apikey = document.getElementById('screen-apikey');
      if(apikey) apikey.classList.add('active');
    }
  }catch(e2){}
  return false;
};

window.addEventListener('unhandledrejection', function(e){
  console.error('[TaleForge Promise Error]', e.reason);
});

export const STORAGE_KEY          = "taleforge-session";

export function _markDirty(key) { if (key in _dirty) _dirty[key] = true; }
window._markDirty = _markDirty;

export function _clearDirty() { Object.keys(_dirty).forEach(k => _dirty[k] = false); }
window._clearDirty = _clearDirty;

export const CHAR_KEY             = "tf-session-character";

export const STATS_SAVE_KEY       = "tf-session-stats";

export const CHAT_KEY             = "tf-session-chat";

export const META_KEY             = "tf-session-meta";

export const SCENARIO_SAVE_KEY    = "tf-session-scenario";

export const API_KEYS_STORAGE     = "taleforge-apikeys";

export const API_KEY_INDEX_STORAGE = "taleforge-keyindex";

window._lsQuotaWarned = false;

export const saveCharacter  = (force) => { if(!force && !_dirty.character) return; lsSet(CHAR_KEY, JSON.stringify(S.character||{})); _dirty.character=false; };

export const saveStatsSplit = (force) => { if(!force && !_dirty.stats)     return; lsSet(STATS_SAVE_KEY, JSON.stringify(S.stats||{})); _dirty.stats=false; };

export const CHAT_MESSAGES_KEY  = 'tf-chat-messages';

export const CHAT_FULL_KEY      = 'tf-chat-full';

export const CHAT_TURN_KEY      = 'tf-chat-turn';

export const saveChatHistory = (force) => {
  if(!force && !_dirty.chat) return;
  _dirty.chat=false;
  lsSet(CHAT_MESSAGES_KEY, JSON.stringify(S.messages||[]));
  lsSet(CHAT_FULL_KEY,     JSON.stringify(S.fullMessages||[]));
  lsSet(CHAT_TURN_KEY,     String(S.msgCount||0));
  lsSet('tf-chat-choices', JSON.stringify(S.choices||[]));
  // 하위호환
  lsSet(CHAT_KEY, JSON.stringify({messages:S.messages||[],fullMessages:S.fullMessages||[],msgCount:S.msgCount||0,choices:S.choices||[]}));
};

export const META_EMOTION_KEY    = 'tf-meta-emotion';

export const META_FATIGUE_KEY    = 'tf-meta-fatigue';

export const META_COMBAT_KEY     = 'tf-meta-combat';

export const META_STATUS_KEY     = 'tf-meta-status';

export const saveMetaState = () => {
  lsSet(META_EMOTION_KEY, JSON.stringify(S._emotion||null));
  lsSet(META_FATIGUE_KEY, String(S._fatigue||0));
  lsSet(META_COMBAT_KEY,  JSON.stringify({_skillCooldowns:S._skillCooldowns||{}, _nearDeathTurns:S._nearDeathTurns||0, _enemyMorale:S._enemyMorale||80}));
  lsSet(META_STATUS_KEY,  S.inCombat?'1':'0');
  // 하위호환 통합키 유지
  lsSet(META_KEY, JSON.stringify({_emotion:S._emotion||null,_fatigue:S._fatigue||0,_skillCooldowns:S._skillCooldowns||{},_nearDeathTurns:S._nearDeathTurns||0,_enemyMorale:S._enemyMorale||80,inCombat:S.inCombat||false}));
};

export const loadMetaState = () => {
  // 분리 키 우선, 없으면 통합키 폴백
  try {
    const em  = lsGet(META_EMOTION_KEY); const ft = lsGet(META_FATIGUE_KEY);
    const cb  = lsGet(META_COMBAT_KEY);  const st = lsGet(META_STATUS_KEY);
    if (em !== null || ft !== null || cb !== null) {
      const combat = cb ? JSON.parse(cb) : {};
      return { _emotion: em ? JSON.parse(em) : null, _fatigue: ft ? parseFloat(ft) : 0,
               _skillCooldowns: combat._skillCooldowns||{}, _nearDeathTurns: combat._nearDeathTurns||0,
               _enemyMorale: combat._enemyMorale||80, inCombat: st==='1' };
    }
  } catch(e) {}
  try { const r=lsGet(META_KEY); return r?JSON.parse(r):{}; } catch(e) { return {}; }
};

export const saveScenario   = ()  => lsSet(SCENARIO_SAVE_KEY,  JSON.stringify(S.scenario||{}));

export const loadStatsSplit = ()  => { try{ const r=lsGet(STATS_SAVE_KEY);    return r?JSON.parse(r):{};   }catch(e){ return {}; } };

export const loadChatHistory = () => {
  try {
    const msgs=lsGet(CHAT_MESSAGES_KEY); const full=lsGet(CHAT_FULL_KEY); const turn=lsGet(CHAT_TURN_KEY);
    if (msgs!==null) {
      const ch = lsGet('tf-chat-choices');
      return { messages:JSON.parse(msgs||'[]'), fullMessages:JSON.parse(full||'[]'), msgCount:parseInt(turn||'0'), choices:JSON.parse(ch||'[]') };
    }
    const r=lsGet(CHAT_KEY); return r?JSON.parse(r):{messages:[],fullMessages:[],msgCount:0};
  } catch(e) { return {messages:[],fullMessages:[],msgCount:0}; }
};

export const loadScenarioSave=()  => { try{ const r=lsGet(SCENARIO_SAVE_KEY); return r?JSON.parse(r):null; }catch(e){ return null; } };

export const saveSession = (data) => {
  // 분리 저장
  saveCharacter();
  saveStatsSplit();
  saveChatHistory();
  saveMetaState();
  saveScenario();
  // 하위호환: 기존 session 키에도 저장 (이어하기 모달 등 활용)
  const compact = {
    character: S.character,
    msgCount:  S.msgCount||0,
    scenario:  S.scenario,
    choices:   S.choices||[],
    _splitSaved: true,   // 분리 저장 여부 플래그
  };
  lsSet(STORAGE_KEY, JSON.stringify(compact));
};

export const loadSession = () => {
  try {
    const compact = lsGet(STORAGE_KEY);
    if (!compact || compact === 'undefined' || compact === 'null') return null;
    const base = JSON.parse(compact);
    if (!base || !base.character) return null;
    // 분리 저장 키에서 각 항목 복원
    if (base._splitSaved) {
      const chat  = loadChatHistory();
      const stats = loadStatsSplit();
      const meta  = loadMetaState();
      const scen  = loadScenarioSave();
      return {
        character:    base.character,
        msgCount:     chat.msgCount || base.msgCount || 0,
        messages:     chat.messages     || [],
        fullMessages: chat.fullMessages || [],
        choices:      chat.choices || base.choices || [],
        stats:        stats,
        scenario:     scen || base.scenario,
        // 메타
        _emotion:         meta._emotion         || null,
        _fatigue:         meta._fatigue         || 0,
        _skillCooldowns:  meta._skillCooldowns  || {},
        _nearDeathTurns:  meta._nearDeathTurns  || 0,
        _enemyMorale:     meta._enemyMorale     || 80,
        inCombat:         meta.inCombat         || false,
        // 나머지는 기존 개별 키에서 로드 (gold, inventory, equipped 등은 이미 분리됨)
        gold:       null,  // loadGold()로 로드
        inventory:  null,  // loadInventory()로 로드
        equipped:   null,  // loadEquipped()로 로드
      };
    }
    // 구버전 폴백
    return base;
  } catch(e) { return null; }
};

export const clearSession = () => {
  lsDel(STORAGE_KEY);
  lsDel(CHAR_KEY); lsDel(STATS_SAVE_KEY); lsDel(CHAT_KEY);
  lsDel(META_KEY); lsDel(SCENARIO_SAVE_KEY);
  // [CRITICAL BUG FIX] 분리 저장 키들이 누락돼서 새 게임/환생 시 이전 생의
  // 채팅 내역(tf-chat-messages/full/turn/choices)과 감정·피로·전투 메타
  // (tf-meta-emotion/fatigue/combat/status)가 그대로 남아있던 버그.
  // loadSession()은 _splitSaved일 때 이 분리 키들을 우선 읾으므로 실제로
  // 새 게임 시작 후에도 이전 대화가 복원될 수 있었음.
  lsDel(CHAT_MESSAGES_KEY); lsDel(CHAT_FULL_KEY); lsDel(CHAT_TURN_KEY); lsDel('tf-chat-choices');
  lsDel(META_EMOTION_KEY); lsDel(META_FATIGUE_KEY); lsDel(META_COMBAT_KEY); lsDel(META_STATUS_KEY);
};

export const WNOTES_KEY    = "taleforge-worldnotes";

export const loadWorldNotes = () => { const r = lsGet(WNOTES_KEY); return r ? JSON.parse(r) : []; };


export const QUESTS_KEY    = "taleforge-quests";

export const loadQuests    = () => { const r = lsGet(QUESTS_KEY); return r ? JSON.parse(r) : []; };

export const saveQuests    = (q) => lsSet(QUESTS_KEY, JSON.stringify(q));

export const clearQuests   = () => lsDel(QUESTS_KEY);

export const DYN_QUEST_KEY  = 'taleforge-dyn-quests';

export const loadDynQuests  = () => { try{ return JSON.parse(lsGet(DYN_QUEST_KEY)||'[]'); }catch(e){ return []; } };

export const saveDynQuests  = (q) => { try{ lsSet(DYN_QUEST_KEY, JSON.stringify(q)); }catch(e){} };

export const BULLETIN_KEY = 'taleforge-bulletin';

export const loadBulletin = () => { try{ return JSON.parse(lsGet(BULLETIN_KEY)||'{}'); }catch(e){ return {}; } };

export const saveBulletin = (d) => { try{ lsSet(BULLETIN_KEY, JSON.stringify(d)); }catch(e){} };

export const ATMOSPHERE_KEY  = "taleforge-atmosphere";

export const loadAtmosphere  = () => { const r = lsGet(ATMOSPHERE_KEY); return r ? JSON.parse(r) : { weather:"none", timeOfDay:"none" }; };

export const saveAtmosphere  = (a) => lsSet(ATMOSPHERE_KEY, JSON.stringify(a));

export const clearAtmosphere = () => lsDel(ATMOSPHERE_KEY);

export const NPC_KEY         = "taleforge-npcs";

export const NPC_BASE_KEY    = 'tf-npc-base';

export const NPC_REL_KEY     = 'tf-npc-relations';

export const NPC_GROWTH_EXT_KEY = 'tf-npc-growth-ext';

export function loadNPCs() {
  try {
    // 분리 키에서 합성
    const base = lsGet(NPC_BASE_KEY); const rel = lsGet(NPC_REL_KEY); const growth = lsGet(NPC_GROWTH_EXT_KEY);
    if (base) {
      const bases = JSON.parse(base);
      const rels = rel ? JSON.parse(rel) : {};
      const growths = growth ? JSON.parse(growth) : {};
      return bases.map(n => ({
        ...n,
        relationship: rels[n.name] !== undefined ? rels[n.name] : (n.relationship || 50),
        ...(growths[n.name] || {})
      }));
    }
    const r = lsGet(NPC_KEY); return r ? JSON.parse(r) : [];
  } catch(e) { try { const r=lsGet(NPC_KEY); return r?JSON.parse(r):[]; } catch(e2){ return []; } }
}
window.loadNPCs = loadNPCs;

export function saveNPCs(npcs) {
  try {
    if (!npcs || !npcs.length) { lsSet(NPC_KEY,'[]'); lsSet(NPC_BASE_KEY,'[]'); lsSet(NPC_REL_KEY,'{}'); lsSet(NPC_GROWTH_EXT_KEY,'{}'); return; }
    // 분리 저장
    const bases = npcs.map(n => ({ name:n.name, role:n.role||'', personality:n.personality||'', type:n.type||'minor', faction:n.faction||'', icon:n.icon||'👤', desc:n.desc||'', autoRegistered:n.autoRegistered||false, note:n.note||'' }));
    const rels = {}; npcs.forEach(n => { rels[n.name] = n.relationship !== undefined ? n.relationship : 50; });
    const growths = {}; npcs.forEach(n => { growths[n.name] = { exp:n.exp||0, level:n.level||1, class:n.class||'', lastInteract:n.lastInteract||0, active:n.active!==undefined?n.active:true, history:n.history||[], hp:n.hp, maxHp:n.maxHp }; });
    lsSet(NPC_BASE_KEY,       JSON.stringify(bases));
    lsSet(NPC_REL_KEY,        JSON.stringify(rels));
    lsSet(NPC_GROWTH_EXT_KEY, JSON.stringify(growths));
    lsSet(NPC_KEY, JSON.stringify(npcs)); // 하위호환
  } catch(e) {}
}
window.saveNPCs = saveNPCs;

export const clearNPCs = () => { lsDel(NPC_KEY); lsDel(NPC_BASE_KEY); lsDel(NPC_REL_KEY); lsDel(NPC_GROWTH_EXT_KEY); };

export const PAST_LIFE_KEY  = "taleforge-pastlife";

export const loadPastLife   = () => { const r = lsGet(PAST_LIFE_KEY); return r ? JSON.parse(r) : null; };

export const savePastLife   = (p) => lsSet(PAST_LIFE_KEY, JSON.stringify(p));


export const EMOTION_KEY   = "taleforge-emotion";

export const loadEmotion   = () => { const r = lsGet(EMOTION_KEY); return r ? JSON.parse(r) : null; };

export const saveEmotion   = (e) => lsSet(EMOTION_KEY, JSON.stringify(e));

