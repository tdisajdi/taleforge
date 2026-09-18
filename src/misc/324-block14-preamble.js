// block14-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { closeGrp } from '../patches/183-v49-⑥-onclick-연결됐지만-정의-없던-함수들.js';
import { applyDemesneStats, loadDemesne, saveDemesne } from '../race/260-수인족-패널-렌더.js';
import { toast } from '../utils.js';
import { loadNPCs } from './001-block0-preamble.js';

(function RivalDomainSystem() {
  'use strict';

  /* ── 유틸 ── */
  const _lsG = k => { try { return localStorage.getItem(k); } catch(e) { return null; } };
  const _lsS = (k,v) => { try { localStorage.setItem(k,v); } catch(e) {} };
  const _toast = (m,ms) => { if(typeof toast==='function') toast(m,ms||3500); };
  const _inj   = t => { if(S?._nextInjectedContext!==undefined) S._nextInjectedContext=(S._nextInjectedContext||'')+t; };
  const _turn  = () => S?.msgCount||0;
  const _gold  = () => S?.gold||0;
  const _spend = n => { S.gold=Math.max(0,_gold()-n); if(typeof saveGold==='function')saveGold(S.gold); if(typeof window.updateHeader==='function')window.updateHeader(); };
  const _gain  = n => { S.gold=(_gold())+n; if(typeof saveGold==='function')saveGold(S.gold); if(typeof window.updateHeader==='function')window.updateHeader(); };
  const _esc   = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const RD_KEY = 'tf-rival-domains';
  const loadRD = () => { try { return JSON.parse(_lsG(RD_KEY)||'{}'); } catch(e) { return {}; } };
  const saveRD = d => { try { _lsS(RD_KEY,JSON.stringify(d)); } catch(e) {} };

  /* ── NPC 영지 기본 생성 ── */
  function _defaultRivalDomain(npcName, npcRole, npcFaction) {
    const tier = /왕|황제|대공|후작/.test(npcRole) ? 4 :
                 /백작|공작/.test(npcRole) ? 3 :
                 /자작|남작|영주/.test(npcRole) ? 2 : 1;
    return {
      npcName,
      npcRole:    npcRole||'영주',
      npcFaction: npcFaction||'',
      tier,
      name:       `${npcName}의 영지`,
      defense:    40 + tier*10,
      loyalty:    60,           // 영민의 충성 (낮을수록 반란 유도 쉬움)
      treasury:   200 + tier*150,
      alert:      0,            // 경계심 0~100 (높을수록 플레이어 작전 어려움)
      // 플레이어 공작 진행도
      infiltration: 0,          // 침투도 0~100
      subversion:   0,          // 공작도 0~100 (민심 이반)
      rebellion:    0,          // 반란 준비도 0~100
      // 상태
      phase: 'intact',          // intact → infiltrated → subverted → rebellion → conquered
      conqueredBy: null,        // 플레이어가 찬탈 성공 시 'player'
      puppet: false,            // 괴뢰 영주 임명 여부
      history: [],
      establishedTurn: _turn(),
      lastTick: _turn(),
    };
  }

  /* ── NPC 영지 자동 생성 (NPC가 귀족/영주 신분이면) ── */
  function ensureRivalDomainForNpc(npc) {
    if(!npc||!npc.name) return;
    const isLord = /영주|귀족|남작|자작|백작|후작|공작|왕|군주|성주|족장|수장|두목|길드장|교주|제독|선장/.test(npc.role||'');
    if(!isLord) return;
    const rd = loadRD();
    if(rd[npc.name]) return; // 이미 있음
    rd[npc.name] = _defaultRivalDomain(npc.name, npc.role||'', npc.faction||'');
    saveRD(rd);
  }
  window.ensureRivalDomainForNpc = ensureRivalDomainForNpc;

  /* ── NPC 영지 자연 틱 (경계심 회복, 재정 변동) ── */
  function tickRivalDomain(domainKey) {
    const rd = loadRD();
    const d = rd[domainKey];
    if(!d||d.conqueredBy) return;
    const now = _turn();
    if(now - (d.lastTick||0) < 5) return;
    d.lastTick = now;
    // 경계심 자연 회복
    if(d.alert > 0) d.alert = Math.max(0, d.alert - 3);
    // 반란도 자연 감소 (NPC가 진압)
    if(d.rebellion > 0 && d.loyalty > 50) d.rebellion = Math.max(0, d.rebellion - 5);
    // 재정 자연 회복
    d.treasury = Math.min(2000, d.treasury + 20*d.tier);
    rd[domainKey] = d;
    saveRD(rd);
  }

  /* ────────────────────────────────────────────────────────
     플레이어 행동 정의
     각 행동: 비용, 성공률, 경계심 상승, 효과
  ──────────────────────────────────────────────────────── */
  const RIVAL_ACTIONS = {
    /* 1단계: 침투 */
    scout: {
      id:'scout', phase:'intact', label:'정찰대 파견', icon:'🔭',
      desc:'영지 방어 배치와 경비 패턴을 파악한다.',
      cost:50, alertRise:5,
      successBase:0.80,
      effect: d => { d.infiltration=Math.min(100,d.infiltration+20); },
      aiHint: (d,n) => `플레이어가 ${n}의 영지를 은밀히 정찰했다. 경비 배치와 지형이 어느 정도 파악됐다.`,
    },
    bribe_guard: {
      id:'bribe_guard', phase:'intact', label:'경비병 매수', icon:'💰',
      desc:'영지 내부 경비 일부를 금전으로 포섭한다.',
      cost:150, alertRise:8,
      successBase:0.65,
      effect: d => { d.infiltration=Math.min(100,d.infiltration+30); d.treasury-=50; },
      aiHint: (d,n) => `경비 일부가 매수됐다. ${n}의 영지 내부 정보가 새나가고 있다.`,
    },
    plant_spy: {
      id:'plant_spy', phase:'intact', label:'첩자 심기', icon:'🕵️',
      desc:'상인·하인으로 위장한 첩자를 영지 내부에 배치한다.',
      cost:200, alertRise:10,
      successBase:0.60,
      effect: d => { d.infiltration=Math.min(100,d.infiltration+40); d.alert+=5; },
      aiHint: (d,n) => `플레이어의 첩자가 ${n}의 영지 내부에 잠입했다. 내부 정보가 전달되기 시작했다.`,
    },
    /* 2단계: 공작 (민심 이반) */
    spread_rumor: {
      id:'spread_rumor', phase:'infiltrated', label:'악소문 유포', icon:'📢',
      desc:'영주의 폭정·부패에 관한 소문을 영민 사이에 퍼뜨린다.',
      cost:80, alertRise:6,
      successBase:0.70,
      effect: d => { d.subversion=Math.min(100,d.subversion+15); d.loyalty=Math.max(0,d.loyalty-10); },
      aiHint: (d,n) => `${n}의 영민들 사이에 영주에 대한 불만이 퍼지고 있다. 술집마다 소문이 무성하다.`,
    },
    incite_tax_protest: {
      id:'incite_tax_protest', phase:'infiltrated', label:'세금 저항 선동', icon:'✊',
      desc:'과도한 세금에 반발하는 영민들을 조직화한다.',
      cost:120, alertRise:15,
      successBase:0.60,
      effect: d => { d.subversion=Math.min(100,d.subversion+25); d.loyalty=Math.max(0,d.loyalty-20); d.treasury-=80; },
      aiHint: (d,n) => `${n}의 영지에서 세금 저항 시위가 벌어지고 있다. 영주가 당황하며 경비를 강화했다.`,
    },
    assassinate_advisor: {
      id:'assassinate_advisor', phase:'infiltrated', label:'핵심 참모 제거', icon:'🗡️',
      desc:'영주의 핵심 참모나 재무관을 암살해 내부를 혼란에 빠뜨린다.',
      cost:300, alertRise:25,
      successBase:0.50,
      effect: d => { d.subversion=Math.min(100,d.subversion+35); d.defense=Math.max(0,d.defense-15); d.treasury-=150; },
      aiHint: (d,n) => `${n}의 핵심 참모가 의문의 죽음을 맞았다. 영지 내부가 혼란에 빠지고 있다.`,
    },
    bribe_vassal: {
      id:'bribe_vassal', phase:'infiltrated', label:'봉신 매수', icon:'⚜️',
      desc:'영주의 봉신 중 한 명을 포섭해 내부 분열을 일으킨다.',
      cost:400, alertRise:20,
      successBase:0.55,
      effect: d => { d.subversion=Math.min(100,d.subversion+30); d.loyalty=Math.max(0,d.loyalty-15); d.defense=Math.max(0,d.defense-10); },
      aiHint: (d,n) => `${n}의 봉신 중 하나가 포섭됐다. 내부에서 정보가 새어나가고 있다.`,
    },
    /* 3단계: 반란 준비 */
    arm_rebels: {
      id:'arm_rebels', phase:'subverted', label:'반란군 무장 지원', icon:'⚔️',
      desc:'불만을 가진 영민들에게 무기와 훈련을 제공해 반란군을 조직한다.',
      cost:500, alertRise:30,
      successBase:0.55,
      effect: d => { d.rebellion=Math.min(100,d.rebellion+30); d.loyalty=Math.max(0,d.loyalty-15); },
      aiHint: (d,n) => `${n}의 영지 곳곳에 무장한 민병대가 생겨나고 있다. 영주가 공포에 떨고 있다.`,
    },
    rally_peasants: {
      id:'rally_peasants', phase:'subverted', label:'민중 집결 연설', icon:'📣',
      desc:'직접 나서서 영민들에게 봉기를 촉구하는 연설을 한다.',
      cost:0, alertRise:40,
      successBase:0.50,
      effect: d => { d.rebellion=Math.min(100,d.rebellion+40); d.loyalty=Math.max(0,d.loyalty-25); d.alert+=20; },
      aiHint: (d,n) => `플레이어가 직접 ${n}의 영민 앞에 나서 봉기를 촉구했다. 영지 전체가 들끓고 있다.`,
    },
    siege_treasury: {
      id:'siege_treasury', phase:'subverted', label:'재무창고 습격', icon:'🏦',
      desc:'영주의 자금줄을 끊어 방어력을 약화시킨다.',
      cost:0, alertRise:35,
      successBase:0.45,
      effect: d => { d.treasury=Math.max(0,d.treasury-300); d.defense=Math.max(0,d.defense-20); d.rebellion=Math.min(100,d.rebellion+20); },
      aiHint: (d,n) => `${n}의 재무창고가 습격당했다. 병사들의 급료가 끊겨 사기가 바닥이다.`,
      successGold: 200,
    },
    /* 4단계: 직접 공격 / 찬탈 */
    open_assault: {
      id:'open_assault', phase:'rebellion', label:'정면 공격', icon:'🔥',
      desc:'반란군과 함께 영지를 정면으로 공격해 함락한다.',
      cost:0, alertRise:0,
      successBase:0.50,
      effect: d => { /* 성공 시 conqueredBy 설정 */ },
      isConquest: true, conquestMethod:'force',
      aiHint: (d,n) => `${n}의 영지에 전면전이 벌어졌다. 성문이 불타고 있다.`,
    },
    inside_coup: {
      id:'inside_coup', phase:'rebellion', label:'내부 쿠데타 지원', icon:'🗡️',
      desc:'포섭한 봉신과 반란군이 동시에 영주를 제거하는 쿠데타를 일으킨다.',
      cost:300, alertRise:0,
      successBase:0.60,
      effect: d => {},
      isConquest: true, conquestMethod:'coup',
      aiHint: (d,n) => `${n}의 영지 안에서 쿠데타가 발생했다. 봉신들이 영주를 배신했다.`,
    },
    negotiated_surrender: {
      id:'negotiated_surrender', phase:'rebellion', label:'항복 협상', icon:'🤝',
      desc:'완전히 고립된 영주에게 항복과 퇴위를 제안한다.',
      cost:500, alertRise:0,
      successBase:0.70,
      effect: d => {},
      isConquest: true, conquestMethod:'surrender',
      aiHint: (d,n) => `${n}이(가) 압박을 이기지 못하고 항복 협상 테이블에 앉았다.`,
    },
    /* 특수: 잠입 암살 (영주 직접 제거) */
    assassinate_lord: {
      id:'assassinate_lord', phase:'subverted', label:'영주 직접 암살', icon:'💀',
      desc:'영주를 직접 암살해 권력 공백을 만들고 영지를 손에 넣는다. 고위험·고보상.',
      cost:600, alertRise:50,
      successBase:0.35,
      effect: d => {},
      isConquest: true, conquestMethod:'assassination',
      aiHint: (d,n) => `${n}이(가) 암살됐다! 영지 전체가 혼란에 빠졌다.`,
    },
  };

  /* ── 단계 조건 ── */
  function getPhase(d) {
    if(d.conqueredBy) return 'conquered';
    if(d.rebellion >= 70) return 'rebellion';
    if(d.subversion >= 60) return 'subverted';
    if(d.infiltration >= 50) return 'infiltrated';
    return 'intact';
  }

  function getAvailableActions(d) {
    const phase = getPhase(d);
    const order = ['intact','infiltrated','subverted','rebellion'];
    const phaseIdx = order.indexOf(phase);
    return Object.values(RIVAL_ACTIONS).filter(a => {
      const aIdx = order.indexOf(a.phase);
      // 현재 단계 이하의 행동 모두 허용 (이미 진행한 단계도 강화 가능)
      return aIdx <= phaseIdx;
    });
  }

  /* ── 행동 실행 ── */
  function executeRivalAction(npcName, actionId) {
    const rd = loadRD();
    let d = rd[npcName];
    if(!d) { _toast('해당 NPC의 영지 정보가 없습니다. 먼저 영지를 가진 NPC와 교류하세요.'); return; }
    if(d.conqueredBy) { _toast('이미 찬탈한 영지입니다.'); return; }

    const action = RIVAL_ACTIONS[actionId];
    if(!action) return;

    // 비용 체크
    if(action.cost > 0 && _gold() < action.cost) { _toast(`골드 부족 (${action.cost}G 필요)`); return; }

    // 경계심에 따른 성공률 보정
    const alertPenalty = d.alert * 0.003;
    // 침투도·공작도에 따른 보너스
    const infBonus = d.infiltration * 0.002;
    const subBonus = d.subversion * 0.002;
    const finalChance = Math.min(0.92, Math.max(0.10, action.successBase - alertPenalty + infBonus + subBonus));

    if(action.cost > 0) _spend(action.cost);

    const success = Math.random() < finalChance;
    d.alert = Math.min(100, d.alert + (success ? action.alertRise : action.alertRise*1.5));

    if(success) {
      if(action.isConquest) {
        // 찬탈 성공
        _conquestSuccess(npcName, d, action);
      } else {
        action.effect(d);
        if(action.successGold) _gain(action.successGold);
        // 단계 업데이트
        d.phase = getPhase(d);
        d.history.push({ action:action.label, turn:_turn(), success:true });
        rd[npcName] = d;
        saveRD(rd);
        _toast(`✅ ${action.icon} ${action.label} 성공! (경계심 +${action.alertRise})`, 4000);
        _inj(` [${npcName} 영지 공작 성공: ${action.aiHint(d,npcName)} 침투도:${d.infiltration} 공작도:${d.subversion} 반란도:${d.rebellion} 경계심:${Math.round(d.alert)}]`);
      }
    } else {
      // 실패 — 경계심 급등, 일부 진행도 손실
      d.infiltration = Math.max(0, d.infiltration - 5);
      d.history.push({ action:action.label, turn:_turn(), success:false });
      rd[npcName] = d;
      saveRD(rd);
      const caught = d.alert > 70;
      _toast(`❌ ${action.icon} ${action.label} 실패!${caught?' — 들켰다! 경계심이 급등했다.':''}`, 4000);
      _inj(` [${npcName} 영지 공작 실패: ${action.label}이 실패했다. ${caught?`영주가 눈치챘다. 경계심:${Math.round(d.alert)}`:'아직 발각되지 않았으나 진행이 늦어졌다.'}]`);
    }
    renderRivalDomainPanel();
  }
  window.executeRivalAction = executeRivalAction;

  /* ── 찬탈 성공 처리 ── */
  function _conquestSuccess(npcName, d, action) {
    d.conqueredBy = 'player';
    d.phase = 'conquered';
    d.history.push({ action:action.label, turn:_turn(), success:true, conquest:true });

    const rd = loadRD();
    rd[npcName] = d;
    saveRD(rd);

    // 영지 흡수 여부 선택을 위한 팝업
    _showConquestResult(npcName, d, action);
  }

  function _showConquestResult(npcName, d, action) {
    const isLM = document.body.classList.contains('light-mode');
    const bg   = isLM?'#fdf5e8':'#050200';
    const gold = '#c8a040';
    const dim  = isLM?'#7a5a30':'var(--dim)';

    const overlay = document.createElement('div');
    overlay.id = 'rd-conquest-popup';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;animation:fadeIn .4s ease';
    overlay.innerHTML = `
    <div style="width:90%;max-width:380px;background:${bg};border:2px solid ${gold};border-radius:3px;overflow:hidden">
      <div style="padding:18px 20px 12px;text-align:center;background:linear-gradient(135deg,#1a1000,#2a1800);border-bottom:1px solid ${gold}">
        <div style="font-size:44px;margin-bottom:8px">${action.conquestMethod==='assassination'?'💀':action.conquestMethod==='coup'?'🗡️':action.conquestMethod==='surrender'?'🤝':'🔥'}</div>
        <div style="font-size:9px;color:#8a7050;letter-spacing:3px;margin-bottom:5px">DOMAIN CONQUERED</div>
        <div style="font-size:16px;color:${gold};letter-spacing:1px;font-family:'Cinzel',serif">"${_esc(npcName)}"의 영지 찬탈!</div>
        <div style="font-size:9px;color:${dim};margin-top:5px">${action.aiHint(d,npcName)}</div>
      </div>
      <div style="padding:14px 18px">
        <div style="font-size:10px;color:${dim};margin-bottom:12px;line-height:1.8">
          영지를 어떻게 처리할까?<br>
          남은 재정: <span style="color:${gold}">${d.treasury}G</span> / 등급: <span style="color:${gold}">${d.tier}등급</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button onclick="absorbRivalDomain('${_esc(npcName)}')"
            style="padding:10px;background:linear-gradient(135deg,#0d1800,#1a2800);border:1px solid #50a030;color:#80d060;font-family:'Cinzel',serif;font-size:10px;cursor:pointer;border-radius:2px;text-align:left">
            🏰 내 영지로 흡수<br><span style="font-size:8px;color:${dim}">재정 획득 + 영지 면적 확대 + 명성 대폭 상승</span>
          </button>
          <button onclick="installPuppet('${_esc(npcName)}')"
            style="padding:10px;background:linear-gradient(135deg,#0d0800,#1a1200);border:1px solid #a08030;color:#c0a060;font-family:'Cinzel',serif;font-size:10px;cursor:pointer;border-radius:2px;text-align:left">
            👤 괴뢰 영주 임명<br><span style="font-size:8px;color:${dim}">간접 지배 — 매 5턴 공납 수입, 독립 유지</span>
          </button>
          <button onclick="dismantleDomain('${_esc(npcName)}')"
            style="padding:10px;background:linear-gradient(135deg,#140000,#1e0800);border:1px solid #803020;color:#c05040;font-family:'Cinzel',serif;font-size:10px;cursor:pointer;border-radius:2px;text-align:left">
            🔥 해체·약탈<br><span style="font-size:8px;color:${dim}">재정 전액 획득 + 영지 소멸, 명성 일부 손실</span>
          </button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(overlay);
  }

  window.absorbRivalDomain = function(npcName) {
    document.getElementById('rd-conquest-popup')?.remove();
    const rd = loadRD();
    const d  = rd[npcName]; if(!d) return;
    const treasury = d.treasury||0;
    _gain(treasury);
    // 내 영지 강화
    const myD = (typeof loadDemesne==='function') ? loadDemesne() : null;
    if(myD && myD.established) {
      myD.population  = (myD.population||500) + Math.floor(500*d.tier);
      myD.prosperity  = Math.min(100,(myD.prosperity||50)+10);
      myD.defense     = Math.min(100,(myD.defense||50)+8);
      myD.tax         = Math.min(100,(myD.tax||50)+5);
      if(typeof saveDemesne==='function') saveDemesne(myD);
      if(typeof applyDemesneStats==='function') applyDemesneStats();
    }
    const d5 = (typeof loadD5==='function') ? loadD5() : {};
    d5.renown = Math.min(200,(d5.renown||0)+30);
    if(typeof saveD5==='function') saveD5(d5);
    d.absorbedBy = 'player';
    rd[npcName] = d;
    saveRD(rd);
    _toast(`🏰 "${npcName}"의 영지 흡수 완료! +${treasury}G, 인구+${Math.floor(500*d.tier)}명`, 5000);
    _inj(` [영지 흡수: "${npcName}"의 영지가 플레이어의 영토로 합병됐다. 인구와 자원이 대폭 늘어났다. 명성이 크게 상승했다.]`);
    renderRivalDomainPanel();
  };

  window.installPuppet = function(npcName) {
    document.getElementById('rd-conquest-popup')?.remove();
    const rd = loadRD();
    const d  = rd[npcName]; if(!d) return;
    d.puppet = true;
    d.puppetTribute = Math.floor(d.tier*15); // 매 5턴 공납
    rd[npcName] = d;
    saveRD(rd);
    _toast(`👤 "${npcName}" 영지에 괴뢰 영주 임명. 매 5턴 ${d.puppetTribute}G 공납.`, 4500);
    _inj(` [괴뢰 영주 임명: "${npcName}"의 영지에 플레이어가 선택한 인물이 새 영주로 앉혔다. 형식적 독립이지만 실질적으로 플레이어의 지배를 받는다. 매 5턴 ${d.puppetTribute}G 공납.]`);
    renderRivalDomainPanel();
  };

  window.dismantleDomain = function(npcName) {
    document.getElementById('rd-conquest-popup')?.remove();
    const rd = loadRD();
    const d  = rd[npcName]; if(!d) return;
    const loot = Math.floor((d.treasury||0)*1.3);
    _gain(loot);
    const d5 = (typeof loadD5==='function') ? loadD5() : {};
    d5.renown = Math.max(0,(d5.renown||0)-10);
    if(typeof saveD5==='function') saveD5(d5);
    d.dismantled = true;
    rd[npcName] = d;
    saveRD(rd);
    _toast(`🔥 "${npcName}"의 영지 약탈·해체! +${loot}G`, 4000);
    _inj(` [영지 약탈·해체: "${npcName}"의 영지가 불타고 해체됐다. ${loot}G의 전리품을 챙겼다. 하지만 잔혹한 행동이라는 소문이 퍼지고 있다.]`);
    renderRivalDomainPanel();
  };

  /* ── 괴뢰 영지 공납 틱 ── */
  function tickPuppetTribute() {
    const rd = loadRD();
    let total = 0;
    Object.values(rd).forEach(d => {
      if(d.puppet && !d.dismantled) {
        const due = d.puppetTribute||0;
        if(due>0) { _gain(due); total+=due; }
      }
    });
    if(total>0) _toast(`⚜️ 괴뢰 영지 공납: +${total}G`, 2500);
  }
  window.tickPuppetTribute = tickPuppetTribute;
  window.loadRD = loadRD;
  window.saveRD = saveRD;
  window.tickRivalDomain = tickRivalDomain;

  // [버그 수정] 이 자리에 있던 hookRDtoSendMsg는 window.sendMsg를 감싸는
  // 방식이라(quest/086이 sendMsg를 로컬 바인딩으로 직접 호출해 재할당이
  // 도달 못 함 — 다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않아,
  // NPC 영지 자동 생성·자연 틱·괴뢰 공납이 전혀 작동하지 않았다.
  // quest/086의 sendMsg() 응답 후처리 블록에 네이티브로 옮겨 연결했다
  // (괴뢰 공납은 원래 있던 5턴 간격 게이트를 그 블록의 기존 5턴 주기
  // 블록으로 대체).

  /* ── BLS 주입 ── */
  function getRivalDomainBLS() {
    const rd=loadRD();
    const entries=Object.entries(rd);
    if(!entries.length) return '';
    const active=entries.filter(([,d])=>!d.conqueredBy&&!d.dismantled);
    const conquered=entries.filter(([,d])=>d.conqueredBy||d.dismantled);
    if(!active.length&&!conquered.length) return '';
    let bls='\n[🗡️ NPC 영지 현황]';
    // 활성 공작 중인 영지만 상세 표기, 최대 5개
  const activeWithProgress = active.filter(([,d])=>d.infiltration>10||d.subversion>10||d.rebellion>10);
  const activeSimple = active.filter(([,d])=>d.infiltration<=10&&d.subversion<=10&&d.rebellion<=10);
  activeWithProgress.slice(0,5).forEach(([name,d])=>{
    const ph=getPhase(d);
    const phLabel={intact:'정상',infiltrated:'침투됨',subverted:'공작 중',rebellion:'반란 직전',conquered:'찬탈됨'}[ph];
    bls+=`\n• ${name}(${phLabel}) 경계:${Math.round(d.alert)} 침투:${d.infiltration} 공작:${d.subversion} 반란:${d.rebellion}`;
  });
  if(activeSimple.length>0) bls+=`\n• 미접촉 영지 ${activeSimple.length}곳`;
    conquered.forEach(([name,d])=>{
      if(d.puppet) bls+=`\n• ${name}의 영지 — 괴뢰 통치 중 (공납 ${d.puppetTribute}G/5턴)`;
      if(d.dismantled) bls+=`\n• ${name}의 영지 — 해체됨`;
      if(d.absorbedBy) bls+=`\n• ${name}의 영지 — 플레이어 영토에 흡수됨`;
    });
    bls+='\n이 영지 상황들이 NPC의 태도·대화·세계 이벤트에 반영되어야 한다.';
    return bls;
  }

  function hookRDtoBLS() {
    if(window._rdBLSHooked) return;
    const check=()=>{
      if(typeof window.buildLightSystem!=='function'){setTimeout(check,800);return;}
      window._rdBLSHooked=true;
      const orig=window.buildLightSystem;
      window.buildLightSystem=function(...args){
        let r=orig.apply(this,args);
        try{const h=getRivalDomainBLS();if(h)r+=h;}catch(e){}
        return r;
      };
    };
    check();
  }

  /* ── UI 패널 ── */
  function renderRivalDomainPanel() {
    const body=document.getElementById('pb-rival-domain');
    if(!body) return;
    const rd=loadRD();
    const entries=Object.entries(rd);

    if(!entries.length) {
      body.innerHTML=`<div style="padding:20px;text-align:center;color:var(--dim);font-size:10px">
        <div style="font-size:36px;margin-bottom:10px;opacity:.4">🗡️</div>
        <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:11px;margin-bottom:8px">NPC 영지 정보 없음</div>
        <div style="font-size:9px;line-height:1.7">귀족·영주·족장·길드장 신분의 NPC와<br>교류하면 자동으로 등록됩니다.<br>이후 이 패널에서 침략·공작을 진행할 수 있습니다.</div>
      </div>`;
      return;
    }

    const phaseColor={intact:'#6a6a6a',infiltrated:'#4080c0',subverted:'#c08020',rebellion:'#e04030',conquered:'#40a040'};
    const phaseLabel={intact:'🏰 정상',infiltrated:'🔭 침투됨',subverted:'⚔️ 공작 중',rebellion:'🔥 반란 직전',conquered:'✅ 찬탈됨'};

    let html='<div style="padding:10px 12px">';

    entries.forEach(([npcName,d])=>{
      const ph=getPhase(d);
      const pc=phaseColor[ph]||'#6a6a6a';
      const pl=phaseLabel[ph]||ph;
      const isConquered=d.conqueredBy||d.dismantled;

      html+=`<div style="background:var(--bg-input);border:1px solid ${pc}55;border-radius:3px;padding:9px 11px;margin-bottom:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
          <div>
            <div style="font-family:'Cinzel',serif;font-size:11px;color:${pc}">${_esc(npcName)}의 영지</div>
            <div style="font-size:8px;color:var(--dim)">${_esc(d.npcRole||'')} ${d.npcFaction?'· '+_esc(d.npcFaction):''} · ${d.tier}등급</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:9px;color:${pc};font-family:'Cinzel',serif">${pl}</div>
            ${d.puppet?`<div style="font-size:8px;color:#c0a040">⚜️ 괴뢰 +${d.puppetTribute}G/5턴</div>`:''}
            ${d.absorbedBy?`<div style="font-size:8px;color:#60c060">🏰 흡수됨</div>`:''}
            ${d.dismantled?`<div style="font-size:8px;color:#e04030">🔥 해체됨</div>`:''}
          </div>
        </div>`;

      if(!isConquered) {
        // 수치 바
        html+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px">
          ${[
            {label:'경계심',val:d.alert,color:'#e04040'},
            {label:'민심',   val:d.loyalty,color:'#60c060'},
            {label:'방어력', val:d.defense,color:'#4080e0'},
            {label:'재정',   val:Math.min(100,Math.round(d.treasury/20)),color:'#c8a040'},
          ].map(s=>`<div>
            <div style="display:flex;justify-content:space-between;font-size:7px;margin-bottom:1px">
              <span style="color:var(--dim)">${s.label}</span>
              <span style="color:${s.color}">${s.label==='재정'?d.treasury+'G':s.val}</span>
            </div>
            <div style="height:3px;background:#050300;border-radius:2px;overflow:hidden">
              <div style="width:${Math.min(100,s.val)}%;height:100%;background:${s.color};border-radius:2px"></div>
            </div>
          </div>`).join('')}
        </div>`;
        // 진행도 바
        html+=`<div style="margin-bottom:8px">
          ${[
            {label:'침투도',val:d.infiltration,color:'#4080c0'},
            {label:'공작도',val:d.subversion,color:'#c08020'},
            {label:'반란도',val:d.rebellion,color:'#e04030'},
          ].map(s=>`<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
            <span style="font-size:7px;color:${s.color};width:28px;flex-shrink:0">${s.label}</span>
            <div style="flex:1;height:5px;background:#050300;border-radius:2px;overflow:hidden">
              <div style="width:${s.val}%;height:100%;background:${s.color};border-radius:2px;transition:width .4s"></div>
            </div>
            <span style="font-size:8px;color:${s.color};width:22px;text-align:right">${s.val}</span>
          </div>`).join('')}
        </div>`;
        // 행동 버튼
        const avail=getAvailableActions(d);
        html+=`<div style="font-family:'Cinzel',serif;font-size:8px;color:var(--dim);letter-spacing:1px;margin-bottom:5px">── 사용 가능한 행동 ──</div>`;
        html+=`<div style="display:flex;flex-direction:column;gap:3px">`;
        avail.forEach(a=>{
          const canAfford=a.cost===0||_gold()>=a.cost;
          html+=`<button onclick="executeRivalAction('${_esc(npcName)}','${a.id}')"
            style="padding:6px 8px;background:${canAfford?'#050a00':'#080808'};border:1px solid ${canAfford?'#305030':'#1a1a1a'};color:${canAfford?'#80c060':'#3a3a3a'};font-size:8px;cursor:${canAfford?'pointer':'not-allowed'};font-family:'Cinzel',serif;border-radius:2px;text-align:left;display:flex;justify-content:space-between;align-items:center">
            <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML(a,{size:16}):(a.icon)} ${a.label}</span>
            <span style="font-size:7px;color:${canAfford?'#60a040':'#3a3a3a'}">${a.cost?`-${a.cost}G`:'무료'} | 경계+${a.alertRise} | ${Math.round(Math.min(92,Math.max(10,(a.successBase-(d.alert*0.003)+(d.infiltration*0.002)+(d.subversion*0.002))*100)))}%</span>
          </button>`;
        });
        html+=`</div>`;
        // 경계심 경고
        if(d.alert>=70) html+=`<div style="font-size:8px;color:#e04040;margin-top:6px">⚠️ 경계심이 매우 높다! 잠시 행동을 멈추고 경계심이 내려가길 기다리세요.</div>`;
        // 진행 가이드
        const guide={intact:'🔭 1단계: 정찰·침투 행동으로 침투도를 50 이상으로 올리세요.',infiltrated:'⚔️ 2단계: 공작 행동으로 공작도 60+, 민심을 낮추세요.',subverted:'🔥 3단계: 반란군 무장·선동으로 반란도를 70 이상 올리세요.',rebellion:'💀 최종: 정면 공격·쿠데타·협상으로 찬탈하거나 직접 암살하세요.'};
        html+=`<div style="margin-top:7px;padding:5px 7px;background:var(--bg-screen);border:1px dashed var(--border);font-size:8px;color:var(--dim);border-radius:2px">${guide[ph]||''}</div>`;
      }

      html+=`</div>`;
    });

    html+=`</div>`;
    body.innerHTML=html;
  }
  window.renderRivalDomainPanel=renderRivalDomainPanel;

  /* ── DOM 패널 삽입 ── */
  function injectRivalDomainPanel() {
    if(document.getElementById('p-rival-domain')) return;

    // 새 패널 DOM
    const panel=document.createElement('div');
    panel.className='panel-ov';
    panel.id='p-rival-domain';
    panel.innerHTML=`<div class="panel">
      <div class="p-header">
        <span class="p-title" style="color:#c04040">🗡️ NPC 영지 침략</span>
        <button class="p-close" onclick="closeP('rival-domain')">✕</button>
      </div>
      <div class="p-body scrollable" id="pb-rival-domain"></div>
    </div>`;
    document.body.appendChild(panel);
    renderRivalDomainPanel();

    // 버튼이 없으면 기존 영지 경영 버튼 옆에 추가
    const demesneBtn=document.querySelector('button[onclick*="demesne"]');
    if(demesneBtn&&demesneBtn.parentElement) {
      const btn=document.createElement('button');
      btn.className='grp-sub-btn';
      btn.style.color='#c04040';
      btn.innerHTML=`<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:3px;vertical-align:-1px"><path d="M8 2L14 8L8 14M2 8L14 8"/></svg>영지침략`;
      btn.onclick=()=>{ if(typeof window.openP==='function') window.openP('rival-domain'); renderRivalDomainPanel(); if(typeof closeGrp==='function') closeGrp(); };
      demesneBtn.parentElement.insertBefore(btn, demesneBtn.nextSibling);
    }
  }

  /* ── 초기화 ── */
  function initRD() {
    hookRDtoBLS();
    setTimeout(injectRivalDomainPanel, 4000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initRD);
  else setTimeout(initRD,500);

  window.RivalDomain={loadRD,saveRD,ensureRivalDomainForNpc,executeRivalAction,renderRivalDomainPanel,getRivalDomainBLS};
})();
