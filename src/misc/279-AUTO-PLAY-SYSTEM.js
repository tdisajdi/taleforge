// 🤖 AUTO PLAY SYSTEM
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { STAT_POINT_ALLOC_KEYS } from '../data/009-레벨업-스탯-포인트-배분-시스템.js';
import { allocateStat } from './009-레벨업-스탯-포인트-배분-시스템.js';
import { closeGrp } from '../patches/183-v49-⑥-onclick-연결됐지만-정의-없던-함수들.js';
import { sendMsg } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { toast } from '../utils.js';
import { renderAISettings } from './298-훅-연결.js';

(function(){
  // ── 상태 ──────────────────────────────────────────
  var AP = {
    running: false,
    speed: 4000,
    strat: 'random',
    timer: null,
    turn: 0,
  };
  window._autoPlay = AP;

  // ── 설정 UI 함수 ──────────────────────────────────
  window.setAutoSpeed = function(ms){
    AP.speed = ms;
    var ids = ['aspd-4000','aspd-2000','aspd-800','aspd-300'];
    ids.forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      var isSelected = id === 'aspd-' + ms;
      el.style.background  = isSelected ? '#1a1005' : 'var(--bg-input)';
      el.style.border      = isSelected ? '2px solid var(--gold)' : '1px solid var(--border)';
      el.style.color       = isSelected ? 'var(--gold)'           : 'var(--dim)';
    });
    if(AP.running) apSetStatus('⏱ 간격 변경: ' + ms + 'ms');
  };

  window.setAutoStrat = function(s){
    AP.strat = s;
    var ids = ['astrat-random','astrat-first','astrat-last'];
    ids.forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      var isSelected = id === 'astrat-' + s;
      el.style.background  = isSelected ? '#1a1005' : 'var(--bg-input)';
      el.style.border      = isSelected ? '2px solid var(--gold)' : '1px solid var(--border)';
      el.style.color       = isSelected ? 'var(--gold)'           : 'var(--dim)';
    });
  };

  function apSetStatus(msg){
    var el = document.getElementById('autoplay-status');
    if(el) el.textContent = msg;
  }

  function apSetBtnState(running){
    var btn = document.getElementById('autoplay-main-btn');
    if(!btn) return;
    if(running){
      btn.textContent = '■ 자동 플레이 정지';
      btn.style.background = 'linear-gradient(135deg,#2a0d0d,#3a1515)';
      btn.style.borderColor = '#9a2a2a';
      btn.style.color = '#e05050';
    } else {
      btn.textContent = '▶ 자동 플레이 시작';
      btn.style.background = 'linear-gradient(135deg,#0d2a0d,#1a3a0d)';
      btn.style.borderColor = '#4a9a2a';
      btn.style.color = '#80c040';
    }
  }

  // ── 메인 토글 ─────────────────────────────────────
  window.toggleAutoPlay = function(){
    if(AP.running){
      AP.running = false;
      if(AP.timer) clearTimeout(AP.timer);
      AP.timer = null;
      apSetBtnState(false);
      apSetStatus('정지됨 — ' + AP.turn + '턴 진행함');
      if(typeof toast === 'function') toast('⏹ 자동 플레이 정지', 2000);
    } else {
      if(!S || !S.character || !S.initialized){
        if(typeof toast === 'function') toast('⚠️ 게임이 시작된 후에 사용하세요', 2500);
        return;
      }
      AP.running = true;
      apSetBtnState(true);
      apSetStatus('실행 중...');
      if(typeof toast === 'function') toast('🤖 자동 플레이 시작!', 2000);
      AP.turn = 0;
      apTick();
    }
  };

  // ── 선택지 고르기 ─────────────────────────────────
  function apPickChoice(choices){
    if(!choices || choices.length === 0) return null;
    if(AP.strat === 'first') return choices[0];
    if(AP.strat === 'last')  return choices[choices.length - 1];
    // random
    return choices[Math.floor(Math.random() * choices.length)];
  }

  // ── 틱 ───────────────────────────────────────────
  function apTick(){
    if(!AP.running) return;

    // AI 응답 기다리는 중이면 잠시 대기
    if(S.loading){
      apSetStatus('AI 응답 대기 중...');
      AP.timer = setTimeout(apTick, 500);
      return;
    }

    // ── [자동화] 선택지 목록 밖에 있는 팝업/화면들 ─────────────
    // 사람이 지켜볼 땐 문제 없지만, 사람 없이 오래 돌리려면 이 네 가지가
    // 전부 자동으로 처리돼야 한다 — 안 그러면 스탯은 쌓이기만 하고,
    // 전직·퀘스트 수락은 영원히 안 되고, 죽으면 거기서 완전히 멈춘다.
    // 우선순위: 게임오버→환생 확정 > 미배분 스탯 > 전직 팝업 > 퀘스트 수락 팝업.

    // 1) 게임오버 오버레이 — 예전엔 여기서 자동플레이를 그냥 멈췄다.
    //    이제 정지 대신 환생 화면으로 넘어가게 한다.
    var goEl = document.getElementById('go-overlay');
    if(goEl && goEl.style.display !== 'none' && goEl.offsetParent !== null){
      apSetStatus('💀 게임 오버 — 환생 준비 중...');
      try{ if(typeof window.goReinc === 'function') window.goReinc(); }catch(e){}
      AP.timer = setTimeout(apTick, 1000);
      return;
    }

    // 2) 환생 화면 — "환생 시작" 버튼을 자동으로 누른다.
    if(S.screen === 'reincarnation'){
      var reincBtn = document.getElementById('reinc-start-btn');
      if(reincBtn && !reincBtn.disabled){
        apSetStatus('🔄 자동 환생 진행...');
        reincBtn.click();
        AP.timer = setTimeout(apTick, 1500);
        return;
      }
      // 버튼이 아직 없거나 비활성 상태면 잠시 후 재시도
      AP.timer = setTimeout(apTick, 500);
      return;
    }

    // 3) 미배분 스탯 포인트 — 있는 만큼 전부 무작위 스탯에 나눠 찍는다.
    //    (STAT_POINT_ALLOC_KEYS는 실제 배분 패널이 쓰는 것과 같은 목록 —
    //    ALL_STAT_KEYS를 썼다간 배분 불가능한 파생 스탯까지 섞여 들어간다.)
    if((S._pendingStatPoints||0) > 0 && typeof allocateStat==='function' && STAT_POINT_ALLOC_KEYS && STAT_POINT_ALLOC_KEYS.length){
      apSetStatus('💪 스탯 자동 배분... (' + S._pendingStatPoints + '포인트 남음)');
      var _statKey = STAT_POINT_ALLOC_KEYS[Math.floor(Math.random()*STAT_POINT_ALLOC_KEYS.length)];
      allocateStat(_statKey, 1);
      AP.timer = setTimeout(apTick, 150);
      return;
    }

    // 4) 전직 제안 팝업 — showJobSuggestionPopup(신규 경로) 또는
    //    wanderer-evo-popup(구형 폴백) 둘 중 뭐가 떠도 첫 번째 선택지로 수락.
    var jsPopup = document.getElementById('job-suggest-popup');
    if(jsPopup){
      var jsAcceptBtn = jsPopup.querySelector('.btn-gold');
      if(jsAcceptBtn){
        apSetStatus('⚡ 자동 전직 수락...');
        jsAcceptBtn.click();
        AP.timer = setTimeout(apTick, 500);
        return;
      }
    }
    var wePopup = document.getElementById('wanderer-evo-popup');
    if(wePopup){
      var weAcceptBtn = wePopup.querySelector('button');
      if(weAcceptBtn){
        apSetStatus('⚡ 자동 전직 수락...');
        weAcceptBtn.click();
        AP.timer = setTimeout(apTick, 500);
        return;
      }
    }

    // 5) 퀘스트 수락 팝업 — window._qapPending이 있으면 뜬 상태다.
    if(window._qapPending && typeof window.questPopupAccept === 'function'){
      apSetStatus('📜 자동 퀘스트 수락...');
      window.questPopupAccept();
      AP.timer = setTimeout(apTick, 500);
      return;
    }

    // 선택지 가져오기
    var choices = (S.choices && S.choices.length > 0) ? S.choices.slice() : [];
    if(choices.length === 0){
      // DOM에서 직접 긁기
      var els = document.querySelectorAll('.choice');
      choices = Array.from(els).map(function(e){ return e.textContent.trim(); }).filter(Boolean);
    }

    if(choices.length === 0){
      apSetStatus('선택지 없음 — 대기 중');
      AP.timer = setTimeout(apTick, 800);
      return;
    }

    var chosen = apPickChoice(choices);
    if(!chosen){
      AP.timer = setTimeout(apTick, 800);
      return;
    }

    AP.turn++;
    apSetStatus('턴 ' + AP.turn + ' → "' + chosen.slice(0, 20) + (chosen.length > 20 ? '…' : '') + '"');

    // 실제 선택 전송
    AP.timer = setTimeout(function(){
      if(!AP.running) return;
      try {
        if(typeof sendMsg === 'function') sendMsg(chosen, true);
      } catch(e) {
        apSetStatus('오류: ' + e.message);
      }
      // 다음 틱 예약
      AP.timer = setTimeout(apTick, 300);
    }, AP.speed);
  }

  // ── 자동플레이 설정 UI 렌더 — 이 함수가 원래 빠져 있어서, 로직
  // (setAutoSpeed/setAutoStrat/toggleAutoPlay/apTick)은 이미 완성돼
  // 있는데도 정작 버튼을 누르면 AI설정 패널(개발콘솔 토글만 덩그러니
  // 있는 화면)만 보이고 자동플레이 컨트롤 자체가 안 보이던 버그가
  // 있었다. renderAISettings()가 호출될 때마다 안전하게 재생성한다. ──
  window.renderAutoPlaySection = function(){
    const pb = document.getElementById('pb-aisettings');
    if(!pb) return;
    let section = document.getElementById('ap-settings-section');
    if(!section){
      section = document.createElement('div');
      section.id = 'ap-settings-section';
      pb.appendChild(section);
    }
    const speedBtn = (ms, label) => {
      const isSel = AP.speed === ms;
      return `<button id="aspd-${ms}" onclick="setAutoSpeed(${ms})" style="
        flex:1;padding:6px 4px;font-size:9px;cursor:pointer;border-radius:2px;
        background:${isSel?'#1a1005':'var(--bg-input)'};
        border:${isSel?'2px solid var(--gold)':'1px solid var(--border)'};
        color:${isSel?'var(--gold)':'var(--dim)'};
      ">${label}</button>`;
    };
    const stratBtn = (key, label) => {
      const isSel = AP.strat === key;
      return `<button id="astrat-${key}" onclick="setAutoStrat('${key}')" style="
        flex:1;padding:6px 4px;font-size:9px;cursor:pointer;border-radius:2px;
        background:${isSel?'#1a1005':'var(--bg-input)'};
        border:${isSel?'2px solid var(--gold)':'1px solid var(--border)'};
        color:${isSel?'var(--gold)':'var(--dim)'};
      ">${label}</button>`;
    };
    section.innerHTML = `
      <div style="padding:12px 14px">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">
          🤖 자동 플레이
        </div>
        <div style="font-size:9px;color:var(--dim);margin-bottom:10px;line-height:1.5">
          화면에 뜬 선택지 중 하나를 골라 자동으로 다음 턴을 진행합니다.
          실제 게임 그대로 진행되므로 레벨업·서사가 정상적으로 이어집니다.
        </div>

        <div style="font-size:9px;color:var(--dim);margin-bottom:4px">선택 간격</div>
        <div style="display:flex;gap:4px;margin-bottom:10px">
          ${speedBtn(4000,'4초')}${speedBtn(2000,'2초')}${speedBtn(800,'0.8초')}${speedBtn(300,'0.3초')}
        </div>

        <div style="font-size:9px;color:var(--dim);margin-bottom:4px">선택 전략</div>
        <div style="display:flex;gap:4px;margin-bottom:14px">
          ${stratBtn('random','무작위')}${stratBtn('first','항상 첫번째')}${stratBtn('last','항상 마지막')}
        </div>

        <button id="autoplay-main-btn" onclick="toggleAutoPlay()" style="
          width:100%;padding:10px;font-family:'Cinzel',serif;font-size:11px;cursor:pointer;
          border-radius:2px;letter-spacing:1px;
          background:${AP.running?'linear-gradient(135deg,#2a0d0d,#3a1515)':'linear-gradient(135deg,#0d2a0d,#1a3a0d)'};
          border:1px solid ${AP.running?'#9a2a2a':'#4a9a2a'};
          color:${AP.running?'#e05050':'#80c040'};
        ">${AP.running?'■ 자동 플레이 정지':'▶ 자동 플레이 시작'}</button>

        <div id="autoplay-status" style="font-size:9px;color:var(--dim);margin-top:8px;text-align:center">
          ${AP.running ? '실행 중...' : '정지됨'}
        </div>
      </div>`;
  };

  // ── sub-sys 메뉴에 버튼 추가 (DOM 준비 후) ────────
  function injectSubSysBtn(){
    var subSys = document.getElementById('sub-sys');
    if(!subSys || document.getElementById('ap-grp-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'ap-grp-btn';
    btn.className = 'grp-sub-btn';
    btn.style.cssText = 'background:linear-gradient(135deg,#0d2a0d,#1a3a0d);border-color:#4a9a2a;color:#80c040';
    btn.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:3px;vertical-align:-1px"><polygon points="4,2 14,8 4,14" fill="#80c040" fill-opacity=".3" stroke="#80c040"/></svg>자동플레이';
    btn.onclick = function(){
      if(typeof closeGrp === 'function') closeGrp();
      if(typeof window.openP === 'function') window.openP('aisettings');
      if(typeof renderAISettings === 'function') renderAISettings();
      // 패널 열린 후 하단 자동플레이 섹션으로 스크롤
      setTimeout(function(){
        var pb = document.getElementById('pb-aisettings');
        if(pb) pb.scrollTop = pb.scrollHeight;
      }, 150);
    };
    subSys.appendChild(btn);
  }

  // PC 사이드바 메뉴에도 추가
  function injectSidebarBtn(){
    var grid = document.getElementById('pc-menu-grid');
    if(!grid || document.getElementById('ap-pc-btn')) return;
    // 구분선 찾기 (마지막 섹션 타이틀 뒤에 삽입)
    var btn = document.createElement('button');
    btn.id = 'ap-pc-btn';
    btn.className = 'pc-menu-btn';
    btn.style.borderColor = '#2a5a1a';
    btn.style.color = '#70b030';
    btn.onclick = function(){
      if(typeof window.openP === 'function') window.openP('aisettings');
      if(typeof renderAISettings === 'function') renderAISettings();
      setTimeout(function(){
        var pb = document.getElementById('pb-aisettings');
        if(pb) pb.scrollTop = pb.scrollHeight;
      }, 150);
    };
    btn.innerHTML = '<span class="pc-ico">▶</span><span class="pc-lbl">자동플레이</span>';
    grid.appendChild(btn);
  }

  setTimeout(function(){
    injectSubSysBtn();
    injectSidebarBtn();
  }, 1500);

})();
