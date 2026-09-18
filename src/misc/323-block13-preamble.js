// block13-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { applyDemesneStats, applyPopEffect, calcDemesneResources, getDemesneBuilding, getDemesnePolicy, loadDemesne, saveDemesne } from '../race/260-수인족-패널-렌더.js';
import { toast } from '../utils.js';

(function DemesneV5() {
  'use strict';

  // ────────────────────────────────────────────────────────
  //  유틸
  // ────────────────────────────────────────────────────────
  const _lsGet = k => { try { return localStorage.getItem(k); } catch(e) { return null; } };
  const _lsSet = (k,v) => { try { localStorage.setItem(k,v); } catch(e) {} };
  const _toast = (msg,ms) => { if(typeof toast==='function') toast(msg, ms||3000); };
  const _inject = txt => { if(S && S._nextInjectedContext !== undefined) S._nextInjectedContext = (S._nextInjectedContext||'') + txt; };
  const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const _turn = () => S?.msgCount || 0;
  const _gold = () => S?.gold || 0;
  const _spendGold = n => { S.gold = Math.max(0, _gold()-n); if(typeof saveGold==='function') saveGold(S.gold); if(typeof window.updateHeader==='function') window.updateHeader(); };
  const _gainGold  = n => { S.gold = (_gold())+n; if(typeof saveGold==='function') saveGold(S.gold); if(typeof window.updateHeader==='function') window.updateHeader(); };
  const _scenario  = () => S?.scenario?.id || 'medieval';
  const _socialRank= () => (S?.character?.socialRank||'') + (S?.character?.socialRankId||'') + (S?.character?.role||'');
  const _isKing    = () => /왕|황제|군주|여왕|국왕|대왕|폐하/.test(_socialRank());
  const _isDuke    = () => /공작|후작|대공/.test(_socialRank());
  const _isCount   = () => /백작|자작|남작/.test(_socialRank());
  const _isNoble   = () => _isKing()||_isDuke()||_isCount()||/귀족|영주|성주/.test(_socialRank());
  const _isWarlord = () => /군벌|장군|사령관|총독/.test(_socialRank());
  const _isMerchant= () => /상단주|대상인|거상/.test(_socialRank());
  const _isPriest  = () => /대신관|교황|수도원장|대사제/.test(_socialRank());
  const _isCriminal= () => /암흑가|마피아|해적|도적왕|갱/.test(_socialRank());

  const D5_KEY = 'tf-demesne-v5';
  function loadD5() { try { return JSON.parse(_lsGet(D5_KEY)||'null') || _defaultD5(); } catch(e) { return _defaultD5(); } }
  function saveD5(d) { try { _lsSet(D5_KEY, JSON.stringify(d)); } catch(e) {} }
  // [CRITICAL BUG FIX] loadD5/saveD5가 DemesneV5 클로저 내부에만 있어
  // 클로저 밖(86777, 86807, 87163 등)에서 typeof loadD5==='function'로
  // 체크하면 항상 false가 되어 영지 v5 확장(무역 봉쇄·정책·축제 등)
  // 데이터가 항상 빈 객체만 받고 있던 버그. 전역 별칭 추가.
  window.loadD5 = loadD5;
  window.saveD5 = saveD5;
  function _defaultD5() {
    return {
      buildQueue: [],          // ① [{bid, level, completeTurn, cost}]
      vassalBetrayals: [],     // ② 배신 기록
      occupation: null,        // ③ 점령 상태 {byFaction, since, severity}
      recoveryQuest: false,    // ③ 수복 퀘스트 활성
      policyExpiry: {},        // ④ {policyId: expiryTurn}
      tradeBlockades: [],      // ⑤ [{partnerId, byFaction, endTurn}]
      seasonFestival: null,    // ⑥ {season, choices, resolved}
      population_classes: {    // ⑦ 계층 비율 합계 100
        peasant: 70, merchant: 15, soldier: 10, noble: 5
      },
      renown: 0,               // ⑧ 영지 명성 0~200
      renownTitle: '',
      questHooks: [],          // ⑨ 자동생성 퀘스트 훅
      scenarioEvents: [],      // ⑩ 시나리오 특화 이벤트
      kingsRelation: 50,       // ⑪ 왕과의 관계 0~100
      kingsEventCooldown: 0,
      lastV5Tick: 0,
    };
  }

  // ────────────────────────────────────────────────────────
  //  ① 건물 건설 대기열
  // ────────────────────────────────────────────────────────
  const BUILD_TURNS = { farm:3, barracks:4, market:3, wall:5, temple:4, library:4, dungeon:3, harbor:6, tower:5, granary:2, inn:3, guild_hall:5, academy:6, colosseum:8 };

  function queueBuilding(bid) {
    const d5 = loadD5();
    const d  = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d||!d.established) { _toast('먼저 영지를 개설하세요'); return; }

    // 이미 대기 중인지
    if(d5.buildQueue.some(q=>q.bid===bid)) { _toast('이미 건설 대기 중'); return; }

    const bdef = (typeof getDemesneBuilding==='function') ? getDemesneBuilding(bid) : null;
    if(!bdef) return;

    const existing = d.buildings?.[bid];
    const level    = existing ? existing.level : 0;
    if(level >= bdef.maxLevel) { _toast(`${bdef.name}은 이미 최대 레벨`); return; }

    const cost  = bdef.cost*(level+1);
    const turns = BUILD_TURNS[bid] || 4;
    if(_gold() < cost) { _toast(`골드 부족 (${cost}G 필요)`); return; }

    _spendGold(cost);
    d5.buildQueue.push({ bid, level:level+1, completeTurn: _turn()+turns, cost });
    saveD5(d5);
    _toast(`🏗️ ${bdef.icon}${bdef.name} 건설 시작! (${turns}턴 후 완공)`, 3500);
    _inject(` [건설 중: "${d.name}"에 ${bdef.name} Lv.${level+1} 건설이 시작됐다. ${turns}턴 뒤 완공 예정.]`);
    renderDemesneV5Panel();
  }

  function tickBuildQueue() {
    const d5 = loadD5();
    if(!d5.buildQueue.length) return;
    const d  = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d) return;
    const now = _turn();
    const done = d5.buildQueue.filter(q => now >= q.completeTurn);
    d5.buildQueue   = d5.buildQueue.filter(q => now < q.completeTurn);
    done.forEach(q => {
      const bdef = (typeof getDemesneBuilding==='function') ? getDemesneBuilding(q.bid) : null;
      if(!bdef) return;
      d.buildings = d.buildings || {};
      d.buildings[q.bid] = { level: q.level, builtAt: now };
      _toast(`🎉 ${bdef.icon}${bdef.name} Lv.${q.level} 완공!`, 4000);
      _inject(` [건설 완공: "${d.name}"의 ${bdef.name} Lv.${q.level}이 완공됐다. ${bdef.aiHint(q.level)}]`);
    });
    if(done.length) {
      if(typeof saveDemesne==='function') saveDemesne(d);
      if(typeof applyDemesneStats==='function') applyDemesneStats();
    }
    saveD5(d5);
  }

  // ────────────────────────────────────────────────────────
  //  ② 봉신 배신 / 반란 시스템
  // ────────────────────────────────────────────────────────
  const VASSAL_BETRAYAL_EVENTS = [
    { id:'demand_more', threshold:25, label:'봉신 불만 표출',   icon:'😤',
      desc:(name,role)=>`${name}(${role})이(가) 처우 개선을 강하게 요구하고 있다.`,
      actions:[
        { id:'appease',  label:'사례 지급 (200G)',  cost:200, result:{ bond:+25, loyalty:+5 } },
        { id:'warn',     label:'경고·위협',          cost:0,   result:{ bond:-5,  loyalty:-8 } },
        { id:'demote',   label:'봉신 강등',          cost:0,   result:{ bond:-99, loyalty:-15, eject:true } },
      ]},
    { id:'secret_deal', threshold:15, label:'비밀 협약 의혹',  icon:'🕵️',
      desc:(name,role)=>`${name}(${role})이(가) 적 세력과 접촉 중이라는 정보가 들어왔다.`,
      actions:[
        { id:'investigate', label:'첩자 파견 (100G)', cost:100, result:{ bond:+10, defense:+5 } },
        { id:'confront',    label:'직접 추궁',         cost:0,   result:{ bond:-20, loyalty:+5 } },
        { id:'ignore',      label:'무시',              cost:0,   result:{ bond:-30, defense:-5 } },
      ]},
    { id:'open_revolt', threshold:5,  label:'봉신 공개 반란',  icon:'⚔️',
      desc:(name,role)=>`${name}(${role})이(가) 공개적으로 반기를 들었다! 일부 병력이 이탈하고 있다.`,
      actions:[
        { id:'crush',       label:'군사 진압',         cost:0,   result:{ bond:-99, defense:-10, loyalty:-10, eject:true, popEffect:-0.05 } },
        { id:'pardon',      label:'사면·화해 (500G)',  cost:500, result:{ bond:+30, loyalty:+15 } },
        { id:'duel',        label:'결투로 결판',        cost:0,   result:{ bond:-99, eject:true, loyalty:+10, renown:+20 } },
      ]},
  ];

  function checkVassalBetrayals() {
    const d = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d||!d.established||(d.vassals||[]).length===0) return;
    const d5 = loadD5();
    (d.vassals||[]).forEach(v => {
      const bond = v.bond||30;
      const def = VASSAL_BETRAYAL_EVENTS.find(e => bond <= e.threshold);
      if(!def) return;
      // 이미 같은 이벤트 처리 중이면 스킵
      if(d5.vassalBetrayals.some(b=>b.vassalName===v.name&&b.eventId===def.id&&!b.resolved)) return;
      if(Math.random() > 0.3) return; // 30% 확률
      d5.vassalBetrayals.push({ vassalName:v.name, vassalRole:v.role, eventId:def.id, startTurn:_turn(), resolved:false });
      saveD5(d5);
      _toast(`${def.icon} 봉신 사태: ${v.name} — ${def.label}`, 5000);
      _inject(` [봉신 위기: ${v.name}(${v.role})의 충성도가 바닥까지 떨어졌다. ${def.desc(v.name,v.role||'기사')} 영주로서 결단이 필요하다.]`);
    });
  }

  function resolveVassalBetrayal(vassalName, eventId, actionId) {
    const d5 = loadD5();
    const ev = d5.vassalBetrayals.find(b=>b.vassalName===vassalName&&b.eventId===eventId&&!b.resolved);
    if(!ev) { _toast('이미 처리됨'); return; }
    const evDef  = VASSAL_BETRAYAL_EVENTS.find(e=>e.id===eventId);
    const action = evDef?.actions.find(a=>a.id===actionId);
    if(!action) return;
    if(action.cost > 0) {
      if(_gold()<action.cost) { _toast(`골드 부족 (${action.cost}G 필요)`); return; }
      _spendGold(action.cost);
    }
    ev.resolved = true;
    saveD5(d5);

    const d = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d) return;
    const v = (d.vassals||[]).find(v=>v.name===vassalName);
    if(v && action.result.bond !== undefined) {
      v.bond = Math.max(0, Math.min(100, (v.bond||30) + action.result.bond));
    }
    if(action.result.eject && v) {
      d.vassals = d.vassals.filter(x=>x.name!==vassalName);
      _toast(`⚜️ ${vassalName} 봉신 해제`, 3000);
    }
    ['loyalty','defense','prosperity','tax'].forEach(k=>{
      if(action.result[k]!==undefined) d[k] = Math.max(0,Math.min(100,(d[k]||50)+action.result[k]));
    });
    if(action.result.popEffect && typeof applyPopEffect==='function') applyPopEffect(d, action.result.popEffect);
    if(action.result.renown !== undefined) {
      const d5b = loadD5(); d5b.renown = Math.max(0, Math.min(200, (d5b.renown||0)+action.result.renown)); saveD5(d5b);
    }
    if(typeof saveDemesne==='function') saveDemesne(d);
    if(typeof applyDemesneStats==='function') applyDemesneStats();
    _toast(`✅ ${evDef.label} 처리: ${action.label}`, 3000);
    _inject(` [봉신 사태 처리: ${vassalName} — "${action.label}" 선택. 결과: ${Object.entries(action.result).filter(([k])=>!['bond','eject','popEffect','renown'].includes(k)).map(([k,v])=>`${k}${v>0?'+':''}${v}`).join(', ')||'영지 상태 변화 없음'}]`);
    renderDemesneV5Panel();
  }
  window.resolveVassalBetrayal = resolveVassalBetrayal;

  // ────────────────────────────────────────────────────────
  //  ③ 영지 점령 / 수복 전쟁 시스템
  // ────────────────────────────────────────────────────────
  function checkOccupation() {
    const d  = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d||!d.established) return;
    const d5 = loadD5();
    if(d5.occupation) return; // 이미 점령 중
    const res = (typeof calcDemesneResources==='function') ? calcDemesneResources(d) : { defense:50, loyalty:50, prosperity:50 };
    if(res.defense >= 30) return;
    if(Math.random() > 0.25) return;

    // 세력 시나리오에 맞는 침략 세력
    const invaders = _getScenarioInvader();
    d5.occupation = { byFaction: invaders.name, icon: invaders.icon, since: _turn(), severity: res.defense < 15 ? 'full' : 'partial' };
    d5.recoveryQuest = true;
    saveD5(d5);

    d.tax       = Math.max(0, d.tax-25);
    d.prosperity= Math.max(0, d.prosperity-20);
    d.loyalty   = Math.max(0, d.loyalty-30);
    if(typeof saveDemesne==='function') saveDemesne(d);
    if(typeof applyDemesneStats==='function') applyDemesneStats();

    _toast(`🔥 영지 "${d.name}" 점령 위기! ${invaders.icon}${invaders.name}이(가) 침략했다!`, 6000);
    _inject(` [영지 점령 위기!] "${d.name}"이(가) ${invaders.name}에 의해 ${d5.occupation.severity==='full'?'완전 점령':'부분 점령'}됐다. 영민들이 두려워하고 있다. 영주는 수복을 위한 행동에 나서야 한다. 퀘스트: 영지 수복.`);
  }

  function _getScenarioInvader() {
    const sc = _scenario();
    const map = {
      medieval:   [{ name:'왕국 귀족', icon:'👑' }, { name:'암흑 결사', icon:'💀' }, { name:'민중 반란군', icon:'✊' }],
    };
    const list = map[sc] || map.medieval;
    return list[Math.floor(Math.random()*list.length)];
  }

  function attemptRecovery(method) {
    const d5 = loadD5();
    if(!d5.occupation) { _toast('점령 상태가 아닙니다'); return; }
    const d  = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d) return;
    const methods = {
      military: { label:'군사 수복 원정', cost:0,   successBase:0.55, loyaltyBonus:15, renown:30, desc:'직접 군대를 이끌어 점령군을 몰아낸다.' },
      diplomacy:{ label:'외교 협상',      cost:400, successBase:0.70, loyaltyBonus:5,  renown:10, desc:'협상과 공물로 점령을 끝낸다.' },
      uprising: { label:'민중 봉기 지원', cost:100, successBase:0.45, loyaltyBonus:25, renown:20, desc:'영민들의 봉기를 뒤에서 지원한다.' },
    };
    const m = methods[method];
    if(!m) return;
    if(m.cost > 0 && _gold()<m.cost) { _toast(`골드 부족 (${m.cost}G 필요)`); return; }
    if(m.cost>0) _spendGold(m.cost);

    const res = (typeof calcDemesneResources==='function') ? calcDemesneResources(d) : { defense:50, loyalty:50 };
    const chance = Math.min(0.90, m.successBase + (res.defense-30)*0.005 + (res.loyalty-30)*0.003);
    const success = Math.random() < chance;

    if(success) {
      const faction = d5.occupation.byFaction;
      d5.occupation    = null;
      d5.recoveryQuest = false;
      saveD5(d5);
      d.defense   = Math.min(100, (d.defense||50)+15);
      d.loyalty   = Math.min(100, (d.loyalty||50)+m.loyaltyBonus);
      d.prosperity= Math.min(100, (d.prosperity||50)+10);
      if(typeof saveDemesne==='function') saveDemesne(d);
      if(typeof applyDemesneStats==='function') applyDemesneStats();
      const d5b = loadD5(); d5b.renown=Math.min(200,(d5b.renown||0)+m.renown); saveD5(d5b);
      _toast(`🎉 영지 수복 성공! "${d.name}"을 되찾았다! (+${m.renown} 명성)`, 5000);
      _inject(` [영지 수복 성공!] ${m.desc} "${d.name}"이(가) ${faction}의 지배에서 벗어났다. 영민들이 영주의 귀환을 환영한다. 명성이 대폭 상승했다.`);
    } else {
      d.defense   = Math.max(0, (d.defense||50)-10);
      d.loyalty   = Math.max(0, (d.loyalty||50)-10);
      if(typeof saveDemesne==='function') saveDemesne(d);
      _toast(`💀 수복 실패... 방어력이 약해졌다.`, 4000);
      _inject(` [영지 수복 실패] ${m.label} 시도가 실패했다. 점령군의 지배가 이어진다. 영민들의 사기가 떨어지고 있다.`);
    }
    renderDemesneV5Panel();
  }
  window.attemptRecovery = attemptRecovery;

  // ────────────────────────────────────────────────────────
  //  ④ 정책 만료 시스템
  // ────────────────────────────────────────────────────────
  const POLICY_DURATION = {
    heavy_tax: 0, low_tax: 0, conscript: 0, open_trade: 0, fortify: 0,
    festival: 8,           // 축제는 8턴 후 만료
    immigration_policy: 20,
    birth_incentive: 25,
  };

  function tickPolicyExpiry() {
    const d  = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d||!d.established) return;
    const d5 = loadD5();
    const now = _turn();
    let changed = false;
    Object.entries(d5.policyExpiry).forEach(([pid, expiryTurn]) => {
      if(expiryTurn > 0 && now >= expiryTurn && d.policies?.[pid]) {
        d.policies[pid] = false;
        delete d5.policyExpiry[pid];
        const pdef = (typeof getDemesnePolicy==='function') ? getDemesnePolicy(pid) : null;
        _toast(`⏰ 정책 만료: ${pdef?.icon||''}${pdef?.name||pid}`, 3000);
        _inject(` [정책 만료: ${pdef?.name||pid}이(가) 기한이 다 됐다.]`);
        changed = true;
      }
    });
    if(changed) {
      if(typeof saveDemesne==='function') saveDemesne(d);
      if(typeof applyDemesneStats==='function') applyDemesneStats();
      saveD5(d5);
    }
  }

  // 정책 시행 시 만료 등록 훅
  function hookPolicyExpiry() {
    if(window._v5PolicyHooked) return;
    window._v5PolicyHooked = true;
    const orig = window.toggleDemesnePolicy;
    if(typeof orig !== 'function') { setTimeout(hookPolicyExpiry, 1000); return; }
    window.toggleDemesnePolicy = function(pid, ...args) {
      const result = orig.call(this, pid, ...args);
      const d  = (typeof loadDemesne==='function') ? loadDemesne() : null;
      const d5 = loadD5();
      const dur = POLICY_DURATION[pid];
      if(d?.policies?.[pid] && dur > 0) {
        d5.policyExpiry[pid] = _turn() + dur;
        saveD5(d5);
        const pdef = (typeof getDemesnePolicy==='function') ? getDemesnePolicy(pid) : null;
        _toast(`⏳ ${pdef?.name||pid} — ${dur}턴 후 자동 만료`, 2500);
      } else {
        delete d5.policyExpiry[pid];
        saveD5(d5);
      }
      return result;
    };
  }

  // ────────────────────────────────────────────────────────
  //  ⑤ 교역로 차단 이벤트
  // ────────────────────────────────────────────────────────
  const BLOCKADE_CAUSES = [
    { id:'bandit_blockade',   label:'산적 교역로 차단', icon:'🔪', desc:'산적 무리가 교역로를 봉쇄했다.',         duration:8,  cost:150, defReq:40  },
    { id:'war_blockade',      label:'전쟁 물자 차단',   icon:'⚔️', desc:'세력 간 전쟁으로 교역로가 막혔다.',     duration:12, cost:0,   defReq:0   },
    { id:'political_embargo', label:'정치적 무역 금수', icon:'📜', desc:'외교 갈등으로 교역 파트너가 금수를 선언했다.', duration:15, cost:300, defReq:0 },
  ];

  function checkTradeBlockade() {
    const d = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d||!d.established||(d.tradePartners||[]).length===0) return;
    const d5 = loadD5();
    if(Math.random() > 0.15) return;
    const partner = d.tradePartners[Math.floor(Math.random()*d.tradePartners.length)];
    if(d5.tradeBlockades.some(b=>b.partnerId===partner&&b.endTurn>_turn())) return;
    const cause = BLOCKADE_CAUSES[Math.floor(Math.random()*BLOCKADE_CAUSES.length)];
    const blockade = { partnerId:partner, causeId:cause.id, byFaction:_getScenarioInvader().name, startTurn:_turn(), endTurn:_turn()+cause.duration, resolved:false };
    d5.tradeBlockades.push(blockade);
    saveD5(d5);
    d.tax = Math.max(0,(d.tax||50)-8);
    if(typeof saveDemesne==='function') saveDemesne(d);
    _toast(`🚧 교역로 차단! ${cause.icon} ${cause.label}`, 4000);
    _inject(` [교역로 차단: ${cause.desc} 세수가 줄고 있다. 해결하거나 대체 교역로를 찾아야 한다.]`);
  }

  function resolveTradeBlockade(partnerId, method) {
    const d5 = loadD5();
    const bl = d5.tradeBlockades.find(b=>b.partnerId===partnerId&&!b.resolved&&b.endTurn>_turn());
    if(!bl) { _toast('해당 교역로 차단이 없습니다'); return; }
    const d = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(method==='force') {
      if(_gold()<200) { _toast('골드 부족 (200G 필요)'); return; }
      _spendGold(200);
      bl.resolved = true;
      d.tax = Math.min(100,(d.tax||50)+8);
      _toast(`✅ 교역로 복구! (-200G)`, 3000);
      _inject(' [교역로 복구: 토벌대를 파견해 교역로를 다시 열었다.]');
    } else if(method==='wait') {
      // 그냥 기다림 — 자연 만료
      _toast(`⏳ 차단이 ${bl.endTurn-_turn()}턴 후 자연 해소될 예정입니다.`, 3000);
    }
    if(method==='force') {
      if(d && typeof saveDemesne==='function') saveDemesne(d);
      saveD5(d5);
    }
    renderDemesneV5Panel();
  }
  window.resolveTradeBlockade = resolveTradeBlockade;

  // 자연 만료 체크
  function tickTradeBlockades() {
    const d5 = loadD5();
    const now = _turn();
    const before = d5.tradeBlockades.length;
    d5.tradeBlockades = d5.tradeBlockades.filter(b => !b.resolved && b.endTurn > now);
    if(d5.tradeBlockades.length < before) {
      saveD5(d5);
      _toast('🛤️ 교역로 차단이 해소됐다.', 3000);
      const d = (typeof loadDemesne==='function') ? loadDemesne() : null;
      if(d) { d.tax=Math.min(100,(d.tax||50)+8); if(typeof saveDemesne==='function') saveDemesne(d); }
    }
  }

  // ────────────────────────────────────────────────────────
  //  ⑥ 계절 행사 선택지
  // ────────────────────────────────────────────────────────
  const SEASON_FESTIVALS = {
    0: { // 봄
      name:'봄 파종제', icon:'🌱', desc:'봄의 신에게 풍년을 기원하는 파종 축제.',
      choices:[
        { id:'grand',  label:'성대한 봄 축제 (300G)', cost:300, result:{ loyalty:+20, prosperity:+15, tax:-5, renown:+15 } },
        { id:'prayer', label:'신전 기도식 (50G)',      cost:50,  result:{ loyalty:+8,  prosperity:+8 } },
        { id:'skip',   label:'생략',                   cost:0,   result:{ loyalty:-5 } },
      ]},
    1: { // 여름
      name:'한여름 방어 훈련', icon:'⚔️', desc:'여름 더위를 이용한 병사들의 실전 훈련.',
      choices:[
        { id:'drill',    label:'전군 훈련령 (200G)',    cost:200, result:{ defense:+20, loyalty:+5 } },
        { id:'contest',  label:'무예 대회 개최 (150G)', cost:150, result:{ defense:+10, loyalty:+15, renown:+10 } },
        { id:'skip',     label:'생략',                   cost:0,   result:{ defense:-5 } },
      ]},
    2: { // 가을
      name:'가을 수확제', icon:'🍂', desc:'풍성한 수확을 감사하는 가을 축제.',
      choices:[
        { id:'feast',    label:'대연회 개최 (400G)',    cost:400, result:{ loyalty:+25, prosperity:+20, renown:+20, popEffect:+0.04 } },
        { id:'market',   label:'가을 대시장 개최 (100G)',cost:100, result:{ tax:+20, prosperity:+10 } },
        { id:'skip',     label:'생략',                   cost:0,   result:{ loyalty:-5 } },
      ]},
    3: { // 겨울
      name:'동지 생존 축제', icon:'❄️', desc:'혹독한 겨울을 함께 버티는 공동체 의례.',
      choices:[
        { id:'warmth',   label:'연료·식량 배급 (250G)', cost:250, result:{ loyalty:+20, prosperity:+10, popEffect:+0.02 } },
        { id:'ceremony', label:'엄숙한 기념 의식 (50G)', cost:50, result:{ loyalty:+10, defense:+5 } },
        { id:'skip',     label:'생략',                   cost:0,   result:{ loyalty:-10, prosperity:-5 } },
      ]},
  };

  function checkSeasonFestival() {
    const d = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d||!d.established) return;
    const d5 = loadD5();
    if(d5.seasonFestival && !d5.seasonFestival.resolved) return;
    const season = d.season||0;
    // 계절 변경 직후에만 행사
    if(_turn() - (d.seasonTurn||0) > 3) return;
    if(d5.seasonFestival?.season === season) return;
    const fest = SEASON_FESTIVALS[season];
    if(!fest) return;
    d5.seasonFestival = { season, name:fest.name, icon:fest.icon, resolved:false };
    saveD5(d5);
    _toast(`${fest.icon} 계절 행사: ${fest.name}`, 4000);
    _inject(` [계절 행사 발생: ${fest.name} — ${fest.desc} 영주로서 어떻게 할 것인지 결정이 필요하다.]`);
  }

  function resolveSeasonFestival(choiceId) {
    const d5 = loadD5();
    if(!d5.seasonFestival||d5.seasonFestival.resolved) { _toast('진행 중인 행사가 없습니다'); return; }
    const fest = SEASON_FESTIVALS[d5.seasonFestival.season];
    const choice = fest?.choices.find(c=>c.id===choiceId);
    if(!choice) return;
    if(choice.cost>0 && _gold()<choice.cost) { _toast(`골드 부족 (${choice.cost}G 필요)`); return; }
    if(choice.cost>0) _spendGold(choice.cost);
    d5.seasonFestival.resolved = true;
    d5.seasonFestival.resolvedChoice = choiceId;
    const renownGain = choice.result.renown||0;
    if(renownGain) { d5.renown=Math.min(200,(d5.renown||0)+renownGain); delete choice.result.renown; }
    saveD5(d5);

    const d = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d) return;
    ['tax','prosperity','defense','loyalty'].forEach(k=>{
      if(choice.result[k]!==undefined) d[k]=Math.max(0,Math.min(100,(d[k]||50)+choice.result[k]));
    });
    if(choice.result.popEffect && typeof applyPopEffect==='function') applyPopEffect(d, choice.result.popEffect);
    if(typeof saveDemesne==='function') saveDemesne(d);
    if(typeof applyDemesneStats==='function') applyDemesneStats();
    _toast(`${fest.icon} ${fest.name} 완료: ${choice.label}`, 3500);
    _inject(` [계절 행사 "${fest.name}" — "${choice.label}" 선택. 영지 분위기가 달라졌다.]`);
    renderDemesneV5Panel();
  }
  window.resolveSeasonFestival = resolveSeasonFestival;

  // ────────────────────────────────────────────────────────
  //  ⑦ 인구 계층 시스템
  // ────────────────────────────────────────────────────────
  function updatePopClasses(d) {
    const d5 = loadD5();
    const cls = d5.population_classes;
    const res = (typeof calcDemesneResources==='function') ? calcDemesneResources(d) : { tax:50, prosperity:50, defense:50, loyalty:50 };
    // 정책 영향
    if(d.policies?.conscript)   { cls.soldier = Math.min(25, (cls.soldier||10)+1); cls.peasant = Math.max(50,(cls.peasant||70)-1); }
    if(d.policies?.open_trade)  { cls.merchant= Math.min(30, (cls.merchant||15)+1); cls.peasant = Math.max(50,(cls.peasant||70)-1); }
    if(res.prosperity>=70)      { cls.merchant= Math.min(30, (cls.merchant||15)+1); cls.peasant = Math.max(50,(cls.peasant||70)-1); }
    if(res.prosperity<=25)      { cls.peasant = Math.min(85, (cls.peasant||70)+2); cls.merchant= Math.max(5,(cls.merchant||15)-2); }
    // 합계 100 정규화
    const total = (cls.peasant||70)+(cls.merchant||15)+(cls.soldier||10)+(cls.noble||5);
    if(total!==100) { const diff=100-total; cls.peasant=Math.max(40,(cls.peasant||70)+diff); }
    d5.population_classes = cls;
    saveD5(d5);
  }


  // ────────────────────────────────────────────────────────
  //  ⑧ 영지 명성 (Renown) 시스템
  // ────────────────────────────────────────────────────────
  const RENOWN_TITLES = [
    { min:0,   max:20,  title:'무명의 영주',   icon:'🏚️', effect:'효과 없음' },
    { min:21,  max:50,  title:'알려진 영주',   icon:'🏡', effect:'교역 친밀도 +5' },
    { min:51,  max:90,  title:'이름난 영지',   icon:'🏰', effect:'봉신 모집 용이, 세수+3' },
    { min:91,  max:130, title:'명성 높은 영주', icon:'🏯', effect:'왕실 관심, 특수 교역 해금' },
    { min:131, max:170, title:'전설적 영주',   icon:'👑', effect:'왕이 사신을 보낸다, 세수+8' },
    { min:171, max:200, title:'왕국의 기둥',   icon:'⭐', effect:'독자 외교권, 충성+10' },
  ];

  function getRenownTitle(renown) {
    return RENOWN_TITLES.find(t => renown>=t.min && renown<=t.max) || RENOWN_TITLES[0];
  }

  function tickRenown(d) {
    const d5 = loadD5();
    const res = (typeof calcDemesneResources==='function') ? calcDemesneResources(d) : { prosperity:50, defense:50, loyalty:50, tax:50 };
    const avg = (res.prosperity+res.defense+res.loyalty+res.tax)/4;
    let gain = 0;
    if(avg>=70) gain = 2;
    else if(avg>=50) gain = 1;
    else if(avg<25) gain = -1;
    if((d.tier||1)>=4) gain += 1;
    d5.renown = Math.max(0, Math.min(200, (d5.renown||0)+gain));
    const rt = getRenownTitle(d5.renown);
    if(rt.title !== d5.renownTitle) {
      d5.renownTitle = rt.title;
      _toast(`✨ 명성 칭호: ${rt.icon} ${rt.title}`, 4000);
      _inject(` [영지 명성 변화: "${d.name}"의 명성이 높아져 "${rt.title}"로 불리게 됐다. ${rt.effect}]`);
    }
    saveD5(d5);
  }

  // ────────────────────────────────────────────────────────
  //  ⑨ 영지 전용 퀘스트 훅 자동 생성 BLS
  // ────────────────────────────────────────────────────────
  function generateQuestHooks(d, res) {
    const d5 = loadD5();
    const hooks = [];
    if(res.defense<30)    hooks.push('⚔️ 방어 위기: 성벽 강화 또는 용병 고용이 시급하다.');
    if(res.loyalty<25)    hooks.push('😤 민심 이반: 영민의 불만을 달래는 정책이나 행사가 필요하다.');
    if(res.prosperity<20) hooks.push('💸 경제 붕괴: 새로운 교역로 개척 또는 세금 감면이 필요하다.');
    if((d.vassals||[]).some(v=>(v.bond||30)<20)) hooks.push('🗡️ 봉신 반란 조짐: 유대도가 낮은 봉신을 관리해야 한다.');
    if((d5.buildQueue||[]).length>0) {
      const q = d5.buildQueue[0];
      const bdef = (typeof getDemesneBuilding==='function') ? getDemesneBuilding(q.bid) : null;
      if(bdef) hooks.push(`🏗️ 건설 진행 중: ${bdef.name} Lv.${q.level} (${q.completeTurn-_turn()}턴 남음)`);
    }
    if(d5.recoveryQuest) hooks.push('🔥 수복 퀘스트: 점령된 영지를 되찾아야 한다. 방법은 세 가지다.');
    if(d5.occupation && !d5.recoveryQuest) hooks.push(`⚠️ 점령 상태: ${d5.occupation.byFaction}이(가) 영지를 지배하고 있다.`);
    d5.questHooks = hooks;
    saveD5(d5);
    return hooks;
  }

  // ────────────────────────────────────────────────────────
  //  ⑩ 시나리오·신분 특화 이벤트 & 건물 & 정책
  // ────────────────────────────────────────────────────────
  function _getScenarioSpecialEvent(d, res) {
    const sc = _scenario();
    const events = {
      medieval: [
        { id:'royal_summons',  icon:'👑', label:'왕의 소환령',  desc:'왕이 세금 분담을 요구하는 소환장을 보냈다.',
          trigger:()=>_isNoble() && Math.random()<0.12,
          actions:[
            { id:'comply',  label:'순응 (500G)',    cost:500, result:{ loyalty:+10, kingsRelation:+15 } },
            { id:'delay',   label:'지연·회피',       cost:0,   result:{ kingsRelation:-10, defense:+5 } },
            { id:'refuse',  label:'거부·독립 선언',  cost:0,   result:{ kingsRelation:-30, renown:+20, defense:-10 } },
          ]},
        { id:'crusade_call',   icon:'✝️', label:'성전 참전 요청', desc:'교회가 성전에 기사와 물자를 요청했다.',
          trigger:()=>_isPriest()===false && Math.random()<0.10,
          actions:[
            { id:'join',    label:'기사 파견 (300G)', cost:300, result:{ loyalty:+15, kingsRelation:+10 } },
            { id:'donate',  label:'물자만 기부 (200G)',cost:200, result:{ loyalty:+5,  kingsRelation:+5  } },
            { id:'refuse',  label:'거부',              cost:0,   result:{ loyalty:-10, kingsRelation:-5  } },
          ]},
        { id:'noble_alliance', icon:'🤝', label:'귀족 연맹 제안', desc:'인근 귀족이 왕에 대항한 연맹을 제안했다.',
          trigger:()=>_isDuke()&&Math.random()<0.08,
          actions:[
            { id:'join',    label:'연맹 참여',         cost:0,   result:{ renown:+15, kingsRelation:-20 } },
            { id:'inform',  label:'왕에게 밀고',        cost:0,   result:{ kingsRelation:+20, renown:-5 } },
            { id:'ignore',  label:'무시',               cost:0,   result:{} } ,
          ]},
        { id:'warlord_tribute', icon:'⚔️', label:'인접 군벌의 조공 요구', desc:'국경을 접한 군벌이 병력을 앞세워 조공을 요구했다.',
          trigger:()=>_isWarlord()&&Math.random()<0.1,
          actions:[
            { id:'pay',     label:'조공 지불 (400G)',   cost:400, result:{ defense:-5, loyalty:+5 } },
            { id:'refuse',  label:'거부하고 방비 강화',  cost:0,   result:{ defense:+15, loyalty:-5 } },
            { id:'raid',    label:'선제 기습',           cost:0,   result:{ renown:+20, defense:-10, loyalty:-10 } },
          ]},
        { id:'merchant_monopoly', icon:'💰', label:'상단의 독점 요청', desc:'영지의 대상인이 특정 교역로 독점권을 요청했다.',
          trigger:()=>_isMerchant()&&Math.random()<0.1,
          actions:[
            { id:'grant',   label:'독점권 승인',         cost:0,   result:{ renown:+10, loyalty:-5 } },
            { id:'deny',    label:'거부 (자유 경쟁 유지)',cost:0,   result:{ loyalty:+10, renown:-5 } },
            { id:'tax',     label:'대신 특별세 부과',     cost:0,   result:{ renown:+5, loyalty:+5 } },
          ]},
        { id:'priest_relic_request', icon:'🕯️', label:'교단의 성유물 요청', desc:'인근 교단이 영지에 보관된 성유물을 요구했다.',
          trigger:()=>_isPriest()&&Math.random()<0.08,
          actions:[
            { id:'donate',  label:'헌납 (신앙 강화)',     cost:0,   result:{ loyalty:+15, renown:+5 } },
            { id:'refuse',  label:'거부',                 cost:0,   result:{ loyalty:-10, defense:+5 } },
            { id:'sell',    label:'대신 매각',            cost:0,   result:{ renown:-10 } },
          ]},
        { id:'criminal_shakedown', icon:'🗡️', label:'암흑가의 뒷거래 제안', desc:'암흑가 조직이 영지 치안을 눈감아달라며 뒷돈을 제안했다.',
          trigger:()=>_isCriminal()&&Math.random()<0.1,
          actions:[
            { id:'accept',  label:'뒷돈 수령',           cost:0,   result:{ loyalty:-10, defense:-5, renown:+5 } },
            { id:'crackdown', label:'소탕 작전',           cost:0,   result:{ defense:+10, loyalty:+10, renown:+10 } },
            { id:'ignore',  label:'무시',                 cost:0,   result:{} },
          ]},
      ],
    };
    const pool = events[sc] || events.medieval;
    for(const ev of pool) {
      if(ev.trigger && ev.trigger()) {
        const d5 = loadD5();
        if(d5.scenarioEvents.some(e=>e.id===ev.id&&!e.resolved)) continue;
        return ev;
      }
    }
    return null;
  }

  function checkScenarioEvents(d, res) {
    if(Math.random()>0.3) return;
    const d5 = loadD5();
    if(d5.scenarioEvents.filter(e=>!e.resolved).length>=1) return;
    const ev = _getScenarioSpecialEvent(d, res);
    if(!ev) return;
    d5.scenarioEvents.push({ id:ev.id, label:ev.label, icon:ev.icon, desc:ev.desc, actions:ev.actions, resolved:false, startTurn:_turn() });
    saveD5(d5);
    _toast(`${ev.icon} 특수 이벤트: ${ev.label}`, 5000);
    _inject(` [특수 이벤트: ${ev.label} — ${ev.desc} 어떻게 대응할 것인가?]`);
  }

  function resolveScenarioEvent(evId, actionId) {
    const d5 = loadD5();
    const ev = d5.scenarioEvents.find(e=>e.id===evId&&!e.resolved);
    if(!ev) { _toast('이미 처리됨'); return; }
    const action = ev.actions.find(a=>a.id===actionId);
    if(!action) return;
    if(action.cost>0 && _gold()<action.cost) { _toast(`골드 부족 (${action.cost}G 필요)`); return; }
    if(action.cost>0) _spendGold(action.cost);
    if(action.result.popEffect) {
      const d=(typeof loadDemesne==='function')?loadDemesne():null;
      if(d&&typeof applyPopEffect==='function') { applyPopEffect(d,action.result.popEffect); if(typeof saveDemesne==='function')saveDemesne(d);}
    }
    if(action.result.kingsRelation!==undefined) {
      d5.kingsRelation=Math.max(0,Math.min(100,(d5.kingsRelation||50)+action.result.kingsRelation));
    }
    if(action.result.renown!==undefined) {
      d5.renown=Math.max(0,Math.min(200,(d5.renown||0)+action.result.renown));
    }
    const d=(typeof loadDemesne==='function')?loadDemesne():null;
    if(d) {
      ['tax','prosperity','defense','loyalty'].forEach(k=>{
        if(action.result[k]!==undefined) d[k]=Math.max(0,Math.min(100,(d[k]||50)+action.result[k]));
      });
      if(typeof saveDemesne==='function') saveDemesne(d);
      if(typeof applyDemesneStats==='function') applyDemesneStats();
    }
    ev.resolved=true; ev.resolvedChoice=actionId;
    saveD5(d5);
    _toast(`✅ ${ev.label} 처리: ${action.label}`,3500);
    _inject(` [특수 이벤트 "${ev.label}" 처리 완료: "${action.label}" 선택.]`);
    renderDemesneV5Panel();
  }
  window.resolveScenarioEvent = resolveScenarioEvent;

  // ────────────────────────────────────────────────────────
  //  ⑪ 왕/세력 관계 연동 특수 이벤트
  // ────────────────────────────────────────────────────────
  function tickKingsRelation(d) {
    const d5 = loadD5();
    const kr = d5.kingsRelation||50;
    const now = _turn();
    if(now - (d5.kingsEventCooldown||0) < 15) return;

    if(kr >= 80 && Math.random()<0.2) {
      // 왕이 특혜 제공
      const boon = [
        { msg:'왕이 기사단 파견을 승인했다! 방어+10', effect:()=>{ d.defense=Math.min(100,(d.defense||50)+10); } },
        { msg:'왕실에서 보조금을 하사했다! +300G',     effect:()=>{ _gainGold(300); } },
        { msg:'왕이 영지 확장을 허가했다! 번영+8',     effect:()=>{ d.prosperity=Math.min(100,(d.prosperity||50)+8); } },
      ];
      const b = boon[Math.floor(Math.random()*boon.length)];
      b.effect();
      if(typeof saveDemesne==='function') saveDemesne(d);
      d5.kingsEventCooldown = now;
      saveD5(d5);
      _toast(`👑 ${b.msg}`, 4000);
      _inject(` [왕실의 총애: ${b.msg} 왕과의 좋은 관계가 영지에 실질적 혜택을 가져왔다.]`);

    } else if(kr <= 20 && Math.random()<0.25) {
      // 왕이 압박
      const penalty = [
        { msg:'왕이 세금 인상을 명령했다! 세수-10, 충성-5', effect:()=>{ d.tax=Math.max(0,(d.tax||50)-10); d.loyalty=Math.max(0,(d.loyalty||50)-5); } },
        { msg:'왕이 군사 감찰관을 파견했다! 방어-5',         effect:()=>{ d.defense=Math.max(0,(d.defense||50)-5); } },
        { msg:'왕이 무역 제한령을 내렸다! 번영-10',          effect:()=>{ d.prosperity=Math.max(0,(d.prosperity||50)-10); } },
      ];
      const p = penalty[Math.floor(Math.random()*penalty.length)];
      p.effect();
      if(typeof saveDemesne==='function') saveDemesne(d);
      d5.kingsEventCooldown = now;
      saveD5(d5);
      _toast(`⚠️ 왕실 압박: ${p.msg}`, 4500);
      _inject(` [왕실 압박: ${p.msg} 왕과의 관계가 악화되어 영지에 불이익이 가해지고 있다.]`);
    }
  }

  // ────────────────────────────────────────────────────────
  //  통합 틱 — sendMsg 훅에 연결
  // ────────────────────────────────────────────────────────
  function v5Tick() {
    const d = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d||!d.established) return;
    const d5 = loadD5();
    const now = _turn();
    if(now - (d5.lastV5Tick||0) < 3) return;
    d5.lastV5Tick = now;
    saveD5(d5);

    tickBuildQueue();
    tickPolicyExpiry();
    tickTradeBlockades();
    // [CRITICAL BUG FIX] checkTradeBlockade(신규 차단 발생)가 v5Tick에서 빠져있어서
    // tickTradeBlockades(기존 차단 해소)만 동작하고 새로운 무역로 차단 이벤트가
    // 영원히 발생하지 않던 버그. 무역 파트너 보유 시 매 틱마다 15% 확률로 체크.
    if(typeof checkTradeBlockade==='function') checkTradeBlockade();
    checkVassalBetrayals();
    checkOccupation();
    checkSeasonFestival();
    const res = (typeof calcDemesneResources==='function') ? calcDemesneResources(d) : { defense:50, loyalty:50, prosperity:50, tax:50 };
    const dFresh = (typeof loadDemesne==='function') ? loadDemesne() : d;
    tickRenown(dFresh);
    tickKingsRelation(dFresh);
    updatePopClasses(dFresh);
    checkScenarioEvents(dFresh, res);
    generateQuestHooks(dFresh, res);
  }

  window.v5Tick = v5Tick;
  // [버그 수정] 이 자리에 있던 hookV5toSendMsg는 window.sendMsg를 감싸는
  // 방식이라(다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않아, 명성/
  // 왕실관계/인구계층/건설대기열/봉신반란/점령/계절행사가 전부 멈춰
  // 있었다(v5Tick 자체 게이트: established된 영지 + 3턴 간격). v5Tick()을
  // quest/086의 sendMsg() 응답 후처리 블록에 네이티브로 연결했다.

  // ────────────────────────────────────────────────────────
  //  BLS 확장 — buildLightSystem 훅
  // ────────────────────────────────────────────────────────
  function getV5BLS() {
    const d = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(!d||!d.established) return '';
    const d5 = loadD5();
    const rt = getRenownTitle(d5.renown||0);
    const cls = d5.population_classes || {};
    const kr = d5.kingsRelation||50;
    const krLabel = kr>=70?'총애':kr>=45?'보통':kr>=25?'경계':'적대';
    const occ = d5.occupation ? `⚠️ 점령 중(${d5.occupation.byFaction})` : '정상';
    const queue = (d5.buildQueue||[]).map(q=>{ const b=(typeof getDemesneBuilding==='function')?getDemesneBuilding(q.bid):null; return b?`${b.name}(${q.completeTurn-_turn()}턴 후 완공)`:''; }).filter(Boolean).join(', ');
    const blockades = d5.tradeBlockades.filter(b=>b.endTurn>_turn()).map(b=>b.partnerId).join(', ');
    const hooks = (d5.questHooks||[]).join(' ');
    const scenActive = d5.scenarioEvents.filter(e=>!e.resolved).map(e=>e.label).join(', ');
    const vassalCrisis = d5.vassalBetrayals.filter(b=>!b.resolved).map(b=>`${b.vassalName}(${b.eventId})`).join(', ');
    const festInfo = (d5.seasonFestival&&!d5.seasonFestival.resolved) ? `계절행사 대기: ${d5.seasonFestival.name}` : '';
    const expiry = Object.entries(d5.policyExpiry||{}).map(([k,v])=>`${k}(${v-_turn()}턴 남음)`).join(', ');

    let bls = `\n[🏰 영지 v5 확장 상태]\n명성: ${d5.renown||0}pts → ${rt.icon}${rt.title} | 왕과의 관계: ${kr}(${krLabel}) | 영지 상태: ${occ}`;
    bls += `\n인구 계층 — 농민:${cls.peasant||70}% 상인:${cls.merchant||15}% 병사:${cls.soldier||10}% 귀족:${cls.noble||5}%`;
    if(queue)      bls += `\n건설 대기: ${queue}`;
    if(blockades)  bls += `\n교역로 차단 중: ${blockades}`;
    if(hooks)      bls += `\n[퀘스트 훅] ${hooks}`;
    if(scenActive) bls += `\n[진행 중 특수이벤트] ${scenActive}`;
    if(vassalCrisis) bls += `\n[봉신 위기] ${vassalCrisis}`;
    if(festInfo)   bls += `\n[${festInfo}]`;
    if(expiry)     bls += `\n[정책 만료 예정: ${expiry}]`;
    bls += `\n명성과 왕과의 관계가 NPC 대화·왕실 퀘스트·외교 이벤트에 자연스럽게 반영되어야 한다. 계층 구성이 영지 분위기 묘사에 반영되어야 한다.`;
    return bls;
  }

  function hookV5toBLS() {
    if(window._v5BLSHooked) return;
    const check = () => {
      if(typeof window.buildLightSystem !== 'function') { setTimeout(check, 800); return; }
      window._v5BLSHooked = true;
      const orig = window.buildLightSystem;
      window.buildLightSystem = function(...args) {
        let r = orig.apply(this, args);
        try { const h = getV5BLS(); if(h) r += h; } catch(e) {}
        return r;
      };
    };
    check();
  }

  // ────────────────────────────────────────────────────────
  //  UI 패널 (영지 탭에 v5 섹션 추가)
  // ────────────────────────────────────────────────────────
  function renderDemesneV5Panel() {
    const body = document.getElementById('pb-demesne-v5');
    if(!body) { injectV5PanelDOM(); return; }
    const d  = (typeof loadDemesne==='function') ? loadDemesne() : null;
    const d5 = loadD5();
    if(!d||!d.established) { body.innerHTML = '<div style="padding:12px;font-size:9px;color:var(--dim)">영지를 먼저 개설하세요.</div>'; return; }
    const rt  = getRenownTitle(d5.renown||0);
    const cls = d5.population_classes||{peasant:70,merchant:15,soldier:10,noble:5};
    const kr  = d5.kingsRelation||50;
    const krColor = kr>=70?'#60c060':kr>=45?'#c8a040':kr>=25?'#d06030':'#e03030';
    const krLabel = kr>=70?'총애':kr>=45?'보통':kr>=25?'경계':'적대';
    const occ = d5.occupation;
    const queue = d5.buildQueue||[];
    const blockades = (d5.tradeBlockades||[]).filter(b=>b.endTurn>_turn());
    const vassalCrises = (d5.vassalBetrayals||[]).filter(b=>!b.resolved);
    const scenEvents = (d5.scenarioEvents||[]).filter(e=>!e.resolved);
    const fest = d5.seasonFestival&&!d5.seasonFestival.resolved ? d5.seasonFestival : null;

    let html = `
    <div style="padding:10px 12px">
      <!-- 명성 & 왕 관계 -->
      <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:8px">── ✨ 명성 & 왕실 관계 ──</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:10px">
        <div style="padding:8px;background:var(--bg-input);border:1px solid #c8a04055;border-radius:2px">
          <div style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(rt,{size:10}):(rt.icon)}</div>
          <div style="font-family:'Cinzel',serif;font-size:9px;color:#c8a040">${rt.title}</div>
          <div style="font-size:8px;color:var(--dim)">명성 ${d5.renown||0}/200</div>
          <div style="height:4px;background:#0a0600;border-radius:2px;margin-top:4px;overflow:hidden">
            <div style="width:${Math.min(100,Math.round((d5.renown||0)/2))}%;height:100%;background:#c8a040;border-radius:2px"></div>
          </div>
          <div style="font-size:7px;color:var(--dim);margin-top:3px">${rt.effect}</div>
        </div>
        <div style="padding:8px;background:var(--bg-input);border:1px solid ${krColor}55;border-radius:2px">
          <div style="font-size:10px">👑</div>
          <div style="font-family:'Cinzel',serif;font-size:9px;color:${krColor}">왕실 관계: ${krLabel}</div>
          <div style="height:4px;background:#0a0600;border-radius:2px;margin-top:4px;overflow:hidden">
            <div style="width:${kr}%;height:100%;background:${krColor};border-radius:2px"></div>
          </div>
          <div style="font-size:7px;color:var(--dim);margin-top:3px">${kr>=80?'왕이 특혜를 내릴 수 있다':kr<=20?'왕이 압박을 가하고 있다':'보통 수준의 관계'}</div>
        </div>
      </div>

      <!-- 인구 계층 -->
      <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:6px">── 👥 인구 계층 ──</div>
      <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:2px;padding:7px;margin-bottom:10px">
        ${[
          {k:'peasant', label:'농민', icon:'🌾', color:'#8a7a5a'},
          {k:'merchant',label:'상인', icon:'💰', color:'#c8a040'},
          {k:'soldier', label:'병사', icon:'⚔️', color:'#4080e0'},
          {k:'noble',   label:'귀족', icon:'👑', color:'#e0b840'},
        ].map(c=>`
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px">
            <span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(c,{size:10}):(c.icon)}</span>
            <span style="font-size:8px;color:${c.color};width:28px;flex-shrink:0">${c.label}</span>
            <div style="flex:1;height:5px;background:#050300;border-radius:2px;overflow:hidden">
              <div style="width:${cls[c.k]||0}%;height:100%;background:${c.color};border-radius:2px;transition:width .4s"></div>
            </div>
            <span style="font-size:8px;color:${c.color};width:25px;text-align:right">${cls[c.k]||0}%</span>
          </div>`).join('')}
      </div>

      <!-- 건설 대기열 -->
      <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:6px">── 🏗️ 건설 대기열 ──</div>
      ${queue.length ? queue.map(q=>{
        const bdef=(typeof getDemesneBuilding==='function')?getDemesneBuilding(q.bid):null;
        const rem=Math.max(0,q.completeTurn-_turn());
        const pct=Math.max(0,Math.min(100,Math.round((1-rem/(BUILD_TURNS[q.bid]||4))*100)));
        return `<div style="padding:6px 8px;background:var(--bg-input);border:1px solid #2a5a1a;border-radius:2px;margin-bottom:4px">
          <div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:3px">
            <span style="color:var(--gold)">${bdef?(typeof getEntityIconHTML==='function'?getEntityIconHTML(bdef,{size:14}):(bdef?.icon)):''}${bdef?bdef.name:q.bid} Lv.${q.level}</span>
            <span style="color:${rem===0?'#60c060':'#c8a040'}">${rem===0?'완공!':`${rem}턴 남음`}</span>
          </div>
          <div style="height:4px;background:#050300;border-radius:2px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#2a6a1a,#60c040);border-radius:2px;transition:width .4s"></div>
          </div>
        </div>`;
      }).join('') : `<div style="font-size:9px;color:var(--dim);padding:8px;text-align:center">건설 대기 중인 건물이 없습니다.<br><span style="font-size:8px">건물 탭에서 건설을 시작하면 여기에 표시됩니다.</span></div>`}

      <!-- 영지 점령 -->
      ${occ ? `
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#e03030;letter-spacing:1px;margin:10px 0 6px">── 🔥 영지 점령 상황 ──</div>
      <div style="background:#1a0000;border:2px solid #e03030;border-radius:2px;padding:10px;margin-bottom:10px">
        <div style="font-size:9px;color:#e06060;margin-bottom:8px">⚠️ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(occ,{size:9}):(occ.icon||"")}${occ.byFaction}이(가) "${d.name}"을 점령하고 있다! (${_turn()-occ.since}턴째)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
          <button onclick="attemptRecovery('military')" style="padding:6px 3px;background:#0a0000;border:1px solid #c03030;color:#e06060;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px;text-align:center">⚔️<br>군사 수복</button>
          <button onclick="attemptRecovery('diplomacy')" style="padding:6px 3px;background:#050a00;border:1px solid #30a030;color:#60c060;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px;text-align:center">🤝<br>외교(400G)</button>
          <button onclick="attemptRecovery('uprising')" style="padding:6px 3px;background:#0a0a00;border:1px solid #a0a030;color:#c0c060;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px;text-align:center">✊<br>민중봉기(100G)</button>
        </div>
      </div>` : ''}

      <!-- 봉신 위기 -->
      ${vassalCrises.length ? `
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#e08040;letter-spacing:1px;margin-bottom:6px">── ⚠️ 봉신 위기 ──</div>
      ${vassalCrises.map(cr=>{
        const evDef = VASSAL_BETRAYAL_EVENTS.find(e=>e.id===cr.eventId);
        if(!evDef) return '';
        return `<div style="background:#1a0800;border:1px solid #c05020;border-radius:2px;padding:8px;margin-bottom:6px">
          <div style="font-size:9px;color:#e08040;margin-bottom:5px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(evDef,{size:9}):(evDef.icon)} ${evDef.desc(cr.vassalName,cr.vassalRole||'기사')}</div>
          <div style="display:grid;grid-template-columns:${evDef.actions.length===3?'1fr 1fr 1fr':'1fr 1fr'};gap:3px">
            ${evDef.actions.map(a=>`<button onclick="resolveVassalBetrayal('${_esc(cr.vassalName)}','${cr.eventId}','${a.id}')"
              style="padding:5px 3px;background:#0d0500;border:1px solid #8a4010;color:#c08040;font-size:7px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px;text-align:center;line-height:1.4">
              ${_esc(a.label)}${a.cost?`<br>-${a.cost}G`:''}
            </button>`).join('')}
          </div>
        </div>`;
      }).join('')}` : ''}

      <!-- 교역로 차단 -->
      ${blockades.length ? `
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#c08030;letter-spacing:1px;margin-bottom:6px">── 🚧 교역로 차단 ──</div>
      ${blockades.map(b=>`
        <div style="background:#0d0800;border:1px solid #7a4010;border-radius:2px;padding:7px;margin-bottom:4px">
          <div style="font-size:9px;color:#c08040;margin-bottom:5px">🚧 ${b.partnerId} 교역로 차단 중 (${b.endTurn-_turn()}턴 남음)</div>
          <div style="display:flex;gap:4px">
            <button onclick="resolveTradeBlockade('${b.partnerId}','force')" style="flex:1;padding:4px;background:#050a00;border:1px solid #305030;color:#50c050;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">토벌 복구 (-200G)</button>
            <button onclick="resolveTradeBlockade('${b.partnerId}','wait')"  style="flex:1;padding:4px;background:#0a0800;border:1px solid #3a2a0a;color:#a08040;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">자연 해소 대기</button>
          </div>
        </div>`).join('')}` : ''}

      <!-- 계절 행사 -->
      ${fest ? `
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#60c080;letter-spacing:1px;margin-bottom:6px">── 🎉 계절 행사 ──</div>
      <div style="background:#050d05;border:1px solid #2a6a2a;border-radius:2px;padding:8px;margin-bottom:8px">
        <div style="font-size:9px;color:#60c080;margin-bottom:6px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(fest,{size:9}):(fest.icon)} ${fest.name}</div>
        <div style="display:flex;flex-direction:column;gap:3px">
          ${(SEASON_FESTIVALS[fest.season]?.choices||[]).map(c=>`
            <button onclick="resolveSeasonFestival('${c.id}')"
              style="padding:6px 8px;background:#030803;border:1px solid #2a5a2a;color:#50c050;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px;text-align:left">
              ${_esc(c.label)}
              <span style="float:right;font-size:7px;color:var(--dim)">${Object.entries(c.result).filter(([k])=>!['renown','popEffect'].includes(k)).map(([k,v])=>`${k}${v>0?'+':''}${v}`).join(' ')}</span>
            </button>`).join('')}
        </div>
      </div>` : ''}

      <!-- 시나리오 특수 이벤트 -->
      ${scenEvents.length ? `
      <div style="font-family:'Cinzel',serif;font-size:9px;color:#8060e0;letter-spacing:1px;margin-bottom:6px">── ⭐ 특수 이벤트 ──</div>
      ${scenEvents.map(ev=>`
        <div style="background:#080010;border:1px solid #5030a0;border-radius:2px;padding:8px;margin-bottom:6px">
          <div style="font-size:9px;color:#a060e0;margin-bottom:4px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(ev,{size:9}):(ev.icon)} ${ev.label}</div>
          <div style="font-size:8px;color:var(--dim);margin-bottom:6px">${_esc(ev.desc)}</div>
          <div style="display:flex;flex-direction:column;gap:3px">
            ${ev.actions.map(a=>`<button onclick="resolveScenarioEvent('${ev.id}','${a.id}')"
              style="padding:5px 8px;background:#050008;border:1px solid #4020a0;color:#8060e0;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px;text-align:left">
              ${_esc(a.label)}${a.cost?` (-${a.cost}G)`:''}
              <span style="float:right;font-size:7px;color:var(--dim)">${Object.entries(a.result).filter(([k])=>!['renown','kingsRelation','popEffect'].includes(k)).map(([k,v])=>`${k}${v>0?'+':''}${v}`).join(' ')||''}</span>
            </button>`).join('')}
          </div>
        </div>`).join('')}` : ''}

      <!-- 퀘스트 훅 -->
      ${(d5.questHooks||[]).length ? `
      <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:6px">── 📜 퀘스트 훅 ──</div>
      <div style="background:var(--bg-input);border:1px dashed var(--border);border-radius:2px;padding:8px">
        ${(d5.questHooks||[]).map(h=>`<div style="font-size:9px;color:#c0a060;margin-bottom:4px">${_esc(h)}</div>`).join('')}
      </div>` : ''}

      <!-- 정책 만료 예고 -->
      ${Object.keys(d5.policyExpiry||{}).length ? `
      <div style="margin-top:8px;font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:1px;margin-bottom:4px">── ⏳ 정책 만료 예고 ──</div>
      ${Object.entries(d5.policyExpiry||{}).map(([pid,et])=>{
        const pdef=(typeof getDemesnePolicy==='function')?getDemesnePolicy(pid):null;
        const rem=Math.max(0,et-_turn());
        return `<div style="font-size:8px;color:var(--dim);padding:3px 0">${pdef?(typeof getEntityIconHTML==='function'?getEntityIconHTML(pdef,{size:14}):(pdef?.icon)):''}${pdef?pdef.name:pid} — ${rem}턴 후 만료</div>`;
      }).join('')}` : ''}
    </div>`;

    body.innerHTML = html;
  }
  window.renderDemesneV5Panel = renderDemesneV5Panel;

  // ────────────────────────────────────────────────────────
  //  DOM 삽입 — 기존 영지 패널에 v5 탭 추가
  // ────────────────────────────────────────────────────────
  function injectV5PanelDOM() {
    if(document.getElementById('pb-demesne-v5')) return;
    // 기존 패널 body 컨테이너 내에 새 div 삽입
    const existingBody = document.getElementById('pb-demesne');
    if(!existingBody) { setTimeout(injectV5PanelDOM, 1200); return; }

    const v5div = document.createElement('div');
    v5div.id = 'pb-demesne-v5';
    v5div.style.cssText = 'border-top:2px solid #c8a04055;margin-top:0';
    existingBody.parentElement.appendChild(v5div);
    renderDemesneV5Panel();
  }

  // 기존 renderDemesnePanel 훅 — v5 렌더도 같이 실행
  function hookV5toRenderPanel() {
    if(window._v5RenderHooked) return;
    const check = () => {
      if(typeof window.renderDemesnePanel !== 'function') { setTimeout(check, 1000); return; }
      window._v5RenderHooked = true;
      const orig = window.renderDemesnePanel;
      window.renderDemesnePanel = function(...args) {
        const r = orig.apply(this, args);
        setTimeout(() => { try { injectV5PanelDOM(); renderDemesneV5Panel(); } catch(e) {} }, 80);
        return r;
      };
    };
    check();
  }

  // 건물 탭 버튼을 대기열 방식으로 교체하는 훅
  function hookBuildButtons() {
    if(window._v5BuildHooked) return;
    window._v5BuildHooked = true;
    // buildDemesneBuilding을 래핑해서 대기열 우선 시도
    const origBuild = window.buildDemesneBuilding;
    if(typeof origBuild !== 'function') { setTimeout(hookBuildButtons, 1200); return; }
    window.buildDemesneBuilding = function(bid) {
      queueBuilding(bid);
    };
  }

  // ────────────────────────────────────────────────────────
  //  초기화
  // ────────────────────────────────────────────────────────
  function init() {
    hookPolicyExpiry();
    hookV5toBLS();
    hookV5toRenderPanel();
    setTimeout(hookBuildButtons, 3000);
    setTimeout(injectV5PanelDOM, 3500);
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 500);
  }

  // 전역 노출
  window.DemesneV5 = {
    queueBuilding, resolveVassalBetrayal, attemptRecovery,
    resolveTradeBlockade, resolveSeasonFestival, resolveScenarioEvent,
    renderDemesneV5Panel, loadD5, saveD5, getRenownTitle, getV5BLS,
  };

})();
