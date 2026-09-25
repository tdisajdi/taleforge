// ★ NEW 8: Carry-over UI 패널
// Auto-extracted from taleforge.html (original section banner preserved above).
import { WEAPON_TYPES } from '../data/014-환생-누적-시스템-110번.js';
import { TIME_TOKEN_CONDITIONS } from '../data/018-5170번-환생-누적-시스템.js';
import { SOUL_CRYSTAL_CRAFTS, WISH_OPTIONS } from '../data/019-71100번-환생-누적-시스템.js';
import { DEIFICATION_CONDITIONS, DEIFICATION_STAGES } from '../data/020-101130번-환생-누적-시스템.js';
import { AUCTIONABLE_MEMORIES } from '../data/028-악마족-진명-시스템-Demon-True-Name.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { getHiddenJobProgress, getUnlockedHiddenJobs } from '../job/029-숨겨진-직업-시스템.js';
import { _buildHiddenJobGameData } from '../job/203-NEW-10-히든-직업-자동-감지-강화.js';
import { getPastPrayerStatus } from '../misc/016-2130번-시스템.js';
import { getCurseLineage, getDivineContracts, getLanguageMemories, getLegendShards, getMythChapters, getSinRedemptions, getWarScars, getWorldMemoryStatus } from '../misc/017-4150번-시스템.js';
import { getTopWeapon, getUnlockedAwakenedJobs, loadCycleCount, loadMemoryFragments, loadSoulWeapon, loadWeaponAffinity, saveSoulWeapon } from '../progression/014-환생-누적-시스템-110번.js';
import { getCurrentFateCard, getMemoryMerchantStatus, loadBestiary, loadTimeTokens, selectFateCard } from '../progression/018-5170번-환생-누적-시스템.js';
import { checkWishAvailable, getGamblingDebt, getSoulCrystalStatus, getTearCrystalStatus, loadSealedMemories } from '../progression/019-71100번-환생-누적-시스템.js';
import { clearMentalCorruption, loadDeification, loadRuins, updateDeification } from '../progression/020-101130번-환생-누적-시스템.js';
import { getAnnalStats } from '../progression/037-NEW-회차-연보-엔딩-히스토리-갤러리.js';
import { loadLegacy } from '../progression/156-NG-회차-계승-시스템.js';
import { getLoopersGuild, getMemoryAuction, joinLoopersGuild, loadRoleReversal, rejectLoopersGuild } from '../race/028-악마족-진명-시스템-Demon-True-Name.js';
import { esc, toast } from '../utils.js';

export function renderLegacyArchivePanel(){
  const body = document.getElementById('pb-legacy-archive');
  if(!body) return;
  const cycle = (typeof loadCycleCount==='function') ? loadCycleCount() : 0;
  const sections = [];

  const sectionHtml = (icon, title, items) => {
    if(!items || !items.length) return '';
    return `<div style="margin-bottom:14px">
      <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">${icon} ${title}</div>
      ${items.map(t=>`<div style="padding:6px 10px;background:#0a0800;border:1px solid #2a1a05;border-left:2px solid var(--gold)44;margin-bottom:4px;font-size:9px;color:var(--dim)">${t}</div>`).join('')}
    </div>`;
  };

  try{
    // 연보 통계
    if(typeof getAnnalStats==='function'){
      const stats = getAnnalStats();
      if(stats) sections.push(sectionHtml('📜','회차 연보', [`가장 흔한 엔딩: ${Object.entries(stats.endingCounts||{}).sort((a,b)=>b[1]-a[1])[0]?.[0]||'-'}`]));
    }
    // 저주 계보
    if(typeof getCurseLineage==='function'){
      const curses = getCurseLineage();
      if(curses?.length) sections.push(sectionHtml('👻','저주의 계보', curses.map(c=>`${c.label||c.id} (깊이 ${c.depth||1})`)));
    }
    // 신의 계약
    if(typeof getDivineContracts==='function'){
      const contracts = getDivineContracts();
      if(contracts?.length) sections.push(sectionHtml('🕯️','신의 계약', contracts.map(c=>`${c.entityType} (갱신 ${c.renewals||0}회, 힘 ${c.power||1})`)));
    }
    // 언어의 기억
    if(typeof getLanguageMemories==='function'){
      const langs = getLanguageMemories();
      if(langs?.length) sections.push(sectionHtml('🗣️','언어의 기억', langs.map(l=>`${l.name||l.id} (숙련도 ${l.fluency||1})`)));
    }
    // 전설의 조각
    if(typeof getLegendShards==='function'){
      const shards = getLegendShards();
      if(shards?.length) sections.push(sectionHtml('🗡️','전설 유물 조각', shards.map(s=>`${s.label||s.id}: ${s.collected||0}/${s.totalShards||5}${s.completed?' ✓복원됨':''}`)));
    }
    // 신화의 장
    if(typeof getMythChapters==='function'){
      const myth = getMythChapters();
      if(myth?.chapters?.length) sections.push(sectionHtml('📖','신화가 된 이야기', myth.chapters.map(c=>`${c.label||c.id}`)));
    }
    // 죄와 속죄
    if(typeof getSinRedemptions==='function'){
      const sins = getSinRedemptions();
      if(sins?.length) sections.push(sectionHtml('⚖️','죄와 속죄', sins.map(s=>`${s.label||s.sinType} (무게 ${s.weight||1})${s.redeemed?' — 속죄됨':''}`)));
    }
    // 전쟁의 상흔
    if(typeof getWarScars==='function'){
      const scars = getWarScars();
      if(scars?.length) sections.push(sectionHtml('⚔️','전쟁의 상흔', scars.map(s=>`${s.label||s.id} (심각도 ${s.severity||1})`)));
    }
    // 봉인된 기억
    // [버그 수정] "정신력 -N"을 소모한다고 확인창까지 띄우면서 실제로는
    // S.stats.sanity를 차감했는데, S.stats에는 sanity라는 키가 아예
    // 존재하지 않아(진짜 정신 계열 스탯은 wil) `S.stats.sanity!==undefined`
    // 가드가 항상 false — 비용이 단 한 번도 실제로 적용되지 않고 봉인된
    // 기억을 항상 공짜로 열 수 있던 버그. quest/086의 "정신력"→wil 매핑
    // 관례를 따라 실제 존재하는 wil 스탯에서 차감하도록 교정.
    if(typeof loadSealedMemories==='function'){
      const sealedMems = loadSealedMemories();
      if(sealedMems?.length){
        const memHtml = sealedMems.map(m=>`
          <div style="padding:6px 10px;background:#0a0800;border:1px solid #2a1a05;margin-bottom:4px;font-size:9px;display:flex;justify-content:space-between;align-items:center">
            <span style="color:var(--dim)">${esc(m.trigger)}${m.opened?' ✓개봉함: '+esc(m.skill):''}</span>
            ${!m.opened?`<button onclick="if(confirm('정신력 ${m.mentalCost}을(를) 소모해 기억을 엽니다. 계속하시겠습니까?')&&typeof openSealedMemory==='function'){const r=openSealedMemory('${m.id}');if(r){if(S.stats&&S.stats.wil!==undefined){S.stats.wil=Math.max(0,S.stats.wil-${m.mentalCost});updateHeader();}toast('🔓 봉인 해제: '+r.skill,4000);renderLegacyArchivePanel();}}" style="padding:3px 8px;font-size:8px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">개봉 (정신력 -${m.mentalCost})</button>`:''}
          </div>`).join('');
        sections.push(`<div style="margin-bottom:14px">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:#8060a0;letter-spacing:1.5px;margin-bottom:6px">🔒 봉인된 기억</div>
          ${memHtml}
        </div>`);
      }
    }
    // 시간 역행 토큰
    if(typeof loadTimeTokens==='function' && typeof TIME_TOKEN_CONDITIONS!=='undefined'){
      const ttStatus = loadTimeTokens();
      if((ttStatus.tokens||0)>0 || (ttStatus.totalEarned||0)>0){
        const condLines = TIME_TOKEN_CONDITIONS.map(c=>`${esc(c.label)}: ${esc(c.desc)}`);
        sections.push(sectionHtml('⏪', `시간 역행 토큰 (보유: ${ttStatus.tokens||0}개)`, condLines));
      }
    }
    // 전생의 기도 (회차당 1회, 정신 오염 치료)
    if(typeof getPastPrayerStatus==='function'){
      const prayerStatus = getPastPrayerStatus();
      if(prayerStatus){
        sections.push(`<div style="margin-bottom:14px">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">🙏 전생의 기도 (${prayerStatus.power}, 누적 ${prayerStatus.total}회)</div>
          <div style="padding:8px 10px;background:#0a0800;border:1px solid #2a1a05;display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:9px;color:var(--dim)">${prayerStatus.available?'전생의 영혼들에게 기도해 정신을 정화할 수 있습니다.':'이번 생에는 이미 기도했습니다.'}</span>
            ${prayerStatus.available?`<button onclick="if(typeof usePastPrayer==='function'&&usePastPrayer()){if(typeof cureMentalCorruption==='function')cureMentalCorruption(2);toast('🙏 전생의 기도로 마음이 정화되었다.',3500);renderLegacyArchivePanel();}" style="padding:3px 8px;font-size:8px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">기도하기</button>`:''}
          </div>
        </div>`);
      }
    }
    // 영혼 결정 제작
    if(typeof getSoulCrystalStatus==='function'){
      const scStatus = getSoulCrystalStatus();
      if(scStatus && (scStatus.count>0 || (scStatus.crafted||[]).length>0) && typeof SOUL_CRYSTAL_CRAFTS!=='undefined'){
        const craftedIds = new Set((scStatus.crafted||[]).map(c=>c.id));
        const craftHtml = SOUL_CRYSTAL_CRAFTS.filter(c=>!craftedIds.has(c.id)).map(c=>`
          <div style="padding:6px 10px;background:#0a0800;border:1px solid #2a1a05;margin-bottom:4px;font-size:9px;display:flex;justify-content:space-between;align-items:center">
            <span style="color:var(--dim)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(c,{size:16}):(c.icon)} ${esc(c.name)} (결정 ${c.cost}개) — ${esc(c.effect)}</span>
            <button onclick="if(typeof craftWithSoulCrystal==='function'&&craftWithSoulCrystal('${c.id}')){toast('${c.icon} ${esc(c.name)} 제작 완료!',3500);renderLegacyArchivePanel();}else{toast('영혼 결정 부족');}" style="padding:3px 8px;font-size:8px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">제작</button>
          </div>`).join('');
        sections.push(`<div style="margin-bottom:14px">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">💎 영혼 결정 (보유: ${scStatus.count||0}개)</div>
          ${craftHtml || '<div style="font-size:9px;color:var(--dim)">모두 제작 완료</div>'}
        </div>`);
      }
    }
    // 운명의 카드 선택 (회차 시작 시 3장 중 1장)
    if(window._reincFateCardChoices?.length && typeof selectFateCard==='function' && typeof getCurrentFateCard==='function' && !getCurrentFateCard()){
      const cardHtml = window._reincFateCardChoices.map(c=>`
        <div style="padding:8px 10px;background:#0a0800;border:1px solid #2a1a05;margin-bottom:6px">
          <div style="font-size:10px;color:var(--gold);margin-bottom:3px">${esc(c.name)} — ${esc(c.theme)}</div>
          <div style="font-size:9px;color:var(--dim);margin-bottom:5px">${esc(c.effect)}</div>
          <button onclick="if(typeof selectFateCard==='function'){selectFateCard('${c.id}');window._reincFateCardChoices=null;toast('🃏 운명의 카드: ${esc(c.name)}',4000);renderLegacyArchivePanel();}" style="width:100%;padding:5px;font-size:8px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">이 카드를 선택</button>
        </div>`).join('');
      sections.push(`<div style="margin-bottom:14px">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:#c060a0;letter-spacing:1.5px;margin-bottom:6px">🃏 운명의 카드 (하나를 선택하세요)</div>
        ${cardHtml}
      </div>`);
    } else if(typeof getCurrentFateCard==='function'){
      const _curCard = getCurrentFateCard();
      if(_curCard) sections.push(sectionHtml('🃏','이번 생의 운명', [`${_curCard.name} — ${_curCard.effect}`]));
    }
    // 눈물의 결정
    if(typeof getTearCrystalStatus==='function'){
      const tcStatus = getTearCrystalStatus();
      if(tcStatus?.crystals>0){
        sections.push(`<div style="margin-bottom:14px">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:#80a0e0;letter-spacing:1.5px;margin-bottom:6px">💧 눈물의 결정 (보유: ${tcStatus.crystals}개)</div>
          <div style="padding:8px 10px;background:#0a0800;border:1px solid #2a1a05;display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:9px;color:var(--dim)">전생의 슬픔이 응축된 결정. 사용하면 만나는 NPC를 즉시 깊이 감동시킬 수 있습니다.</span>
            <button onclick="if(typeof useTearCrystal==='function'&&useTearCrystal(1)){S._nextInjectedContext=(S._nextInjectedContext||'')+'\\n\\n[💧 눈물의 결정] 캐릭터가 전생의 슬픔이 담긴 결정을 사용했습니다. 다음에 만나는 NPC가 이 진심 어린 감정에 깊이 감동받아 관계가 급격히 가까워질 수 있습니다.';toast('💧 눈물의 결정을 사용했다. 다음 만남이 특별해질 것이다.',3500);renderLegacyArchivePanel();}" style="padding:3px 8px;font-size:8px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px;flex-shrink:0">사용</button>
          </div>
        </div>`);
      }
    }
    // 역할 반전 — 처치한 보스의 시선으로 재도전
    if(typeof loadRoleReversal==='function'){
      const rv = loadRoleReversal();
      if(rv?.available?.length){
        const rvHtml = rv.available.map(r=>`
          <div style="padding:6px 10px;background:#0a0800;border:1px solid #2a1a05;margin-bottom:4px;font-size:9px;display:flex;justify-content:space-between;align-items:center">
            <span style="color:var(--dim)">${esc(r.bossName)}의 시선으로 그날을 다시 체험할 수 있습니다.</span>
            <button onclick="if(typeof completeRoleReversal==='function'){const c=completeRoleReversal('${esc(r.bossName)}');if(c){S._nextInjectedContext=(S._nextInjectedContext||'')+'\\n\\n[🔄 역할 반전] 다음 서술은 ${esc(r.bossName)}의 시점에서, 그날 플레이어와 싸우기 전후의 감정과 사정을 짧게 회상하는 특별한 장면으로 그려주십시오. 그 후 평소 시점으로 돌아오십시오.';toast('🔄 역할 반전: ${esc(r.bossName)}의 이야기',3500);renderLegacyArchivePanel();}}" style="padding:3px 8px;font-size:8px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">재도전</button>
          </div>`).join('');
        sections.push(`<div style="margin-bottom:14px">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:#6080c0;letter-spacing:1.5px;margin-bottom:6px">🔄 역할 반전</div>
          ${rvHtml}
        </div>`);
      }
    }
    // [F3 FIX] 루프 자각자 길드 — joinLoopersGuild/rejectLoopersGuild가
    // ai-prompt/222의 gs.looper_guild(AI 서사 감지) 한 곳에서만 호출되고
    // 수동 트리거가 전혀 없었다. 가입 이후 랭크업(rankUpGuild)은 이미
    // quest/086의 회차 진행 틱에서 완전히 로컬로 동작하지만, 그 앞의
    // "가입 자체"가 막혀 있어 무-API 플레이어는 가입조차 못 했다. getLoopersGuild
    // 자체가 이미 이 시스템의 해금 조건(5회차+)을 판정하는 함수이므로 그대로
    // 가시성 게이트로 재사용.
    if(typeof getLoopersGuild==='function'){
      const guild = getLoopersGuild();
      if(guild){
        if(guild.status === 'unknown'){
          sections.push(`<div style="margin-bottom:14px">
            <div style="font-family:'Cinzel',serif;font-size:10px;color:#8060c0;letter-spacing:1.5px;margin-bottom:6px">🏛️ 루프 자각자 길드</div>
            <div style="padding:8px 10px;background:#0a0800;border:1px solid #2a1a05;font-size:9px;color:var(--dim);margin-bottom:6px">비밀스러운 길드가 루프를 자각한 당신에게 접촉해왔다. 그들과 함께할 것인가?</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
              <button onclick="joinLoopersGuild();toast('🏛️ 루프 자각자 길드에 가입했다.',3500);renderLegacyArchivePanel()" style="padding:6px;font-size:9px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">가입</button>
              <button onclick="rejectLoopersGuild();toast('🏛️ 길드의 제안을 거절했다.',3500);renderLegacyArchivePanel()" style="padding:6px;font-size:9px;background:#1a0505;border:1px solid #6a3030;color:#c08080;cursor:pointer;border-radius:2px">거절</button>
            </div>
          </div>`);
        } else {
          sections.push(sectionHtml('🏛️','루프 자각자 길드',
            [guild.status === 'member' ? `정회원 — ${guild.rankData?.label||''} (공유 지식 ${guild.knowledgeShared?.length||0}개)` : '적대 관계 (가입 거절함)']));
        }
      }
    }
    // 100회차 소원
    if(typeof checkWishAvailable==='function' && checkWishAvailable(cycle) && typeof WISH_OPTIONS!=='undefined'){
      const wishHtml = WISH_OPTIONS.map(w=>`
        <div style="padding:6px 10px;background:#0a0800;border:1px solid #2a1a05;margin-bottom:4px;font-size:9px;display:flex;justify-content:space-between;align-items:center">
          <span style="color:var(--dim)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(w,{size:16}):(w.icon)} ${esc(w.label)} — ${esc(w.desc)}</span>
          <button onclick="if(typeof grantWish==='function'&&grantWish('${w.id}',${cycle})){applyWishEffect('${w.id}');toast('🌈 소원이 이루어졌다: ${esc(w.label)}',4000);renderLegacyArchivePanel();}" style="padding:3px 8px;font-size:8px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">소원 빌기</button>
        </div>`).join('');
      sections.push(`<div style="margin-bottom:14px">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:#e0a060;letter-spacing:1.5px;margin-bottom:6px">🌈 100회차의 소원 (${cycle}회차)</div>
        ${wishHtml}
      </div>`);
    }
    // 신격화 진행도
    if(typeof loadDeification==='function' && typeof DEIFICATION_CONDITIONS!=='undefined'){
      const deif = loadDeification();
      const metCount = Object.values(deif.conditions||{}).filter(Boolean).length;
      if(metCount>0){
        const stageData = DEIFICATION_STAGES[deif.stage||0];
        const condHtml = DEIFICATION_CONDITIONS.map(c=>{
          const met = !!(deif.conditions||{})[c.id];
          return `<div style="font-size:9px;color:${met?'#60c060':'var(--dim)'};margin-bottom:2px">${met?'✓':'○'} ${esc(c.label)} — ${esc(c.desc)}</div>`;
        }).join('');
        sections.push(`<div style="margin-bottom:14px">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:#e0c060;letter-spacing:1.5px;margin-bottom:6px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stageData,{size:14}):(stageData?.icon||'👤')} 신격화 진행 (${stageData?.label||'인간'})</div>
          ${condHtml}
        </div>`);
      }
    }
    // 전생 기억 상인 (4회차부터)
    if(typeof getMemoryMerchantStatus==='function'){
      const merchantStatus = getMemoryMerchantStatus();
      if(merchantStatus){
        const fragCount = (typeof loadMemoryFragments==='function') ? loadMemoryFragments().length : 0;
        const hintsHtml = (merchantStatus.availableHints||[]).map(h=>{
          const bought = (merchantStatus.purchasedHints||[]).includes(h.id);
          const costNum = parseInt((h.cost||'').match(/\d+/)?.[0]||'1');
          return `<div style="padding:6px 10px;background:#0a0800;border:1px solid #2a1a05;margin-bottom:4px;font-size:9px;display:flex;justify-content:space-between;align-items:center">
            <span style="color:var(--dim)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(h,{size:16}):(h.icon)} ${esc(h.label)} — ${esc(h.cost)}${bought?' ✓구매함':''}</span>
            ${!bought?`<button onclick="if(${fragCount}>=${costNum}){visitMemoryMerchant('${h.id}');const frags=loadMemoryFragments();saveMemoryFragments(frags.slice(${costNum}));S._nextInjectedContext=(S._nextInjectedContext||'')+'\\n\\n[기억 상인 힌트: ${esc(h.label)}] ${esc(h.desc)}';toast('🔮 힌트 획득: ${esc(h.label)}',3500);renderLegacyArchivePanel();}else{toast('기억 파편 부족');}" style="padding:3px 8px;font-size:8px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">구매</button>`:''}
          </div>`;
        }).join('');
        sections.push(`<div style="margin-bottom:14px">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">🔮 전생 기억 상인 (보유 기억 파편: ${fragCount}개)</div>
          ${hintsHtml}
        </div>`);
      }
    }
    // 기억 경매 (강력한 트레이드오프 — 신중한 선택 유도)
    if(typeof getMemoryAuction==='function'){
      const auctionStatus = getMemoryAuction();
      if(auctionStatus && typeof AUCTIONABLE_MEMORIES!=='undefined'){
        const sold = new Set((auctionStatus.sold||[]).map(m=>m.id));
        const memHtml = AUCTIONABLE_MEMORIES.filter(m=>!sold.has(m.id)).map(m=>`
          <div style="padding:6px 10px;background:#0a0800;border:1px solid #2a1a05;margin-bottom:4px;font-size:9px;display:flex;justify-content:space-between;align-items:center">
            <span style="color:var(--dim)">${esc(m.label)} — 대가: ${esc(m.sellPrice)}<br><span style="color:#8a5a5a">잃는 것: ${esc(m.cost)}</span></span>
            <button onclick="if(confirm('정말로 \\'${esc(m.label)}\\'을(를) 파시겠습니까?\\n대가: ${esc(m.sellPrice)}\\n잃는 것: ${esc(m.cost)}\\n\\n이 선택은 되돌릴 수 없습니다.')){sellMemory('${m.id}');toast('🕯️ ${esc(m.label)}을(를) 팔았다...',4000);renderLegacyArchivePanel();}" style="padding:3px 8px;font-size:8px;background:#1a0505;border:1px solid #6a3030;color:#c08080;cursor:pointer;border-radius:2px">판매</button>
          </div>`).join('');
        if(memHtml) sections.push(`<div style="margin-bottom:14px">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:#a06a6a;letter-spacing:1.5px;margin-bottom:6px">🕯️ 기억 경매 (신중히 선택하세요)</div>
          ${memHtml}
        </div>`);
      }
    }
    // 도박 빚
    if(typeof getGamblingDebt==='function'){
      const debt = getGamblingDebt();
      if(debt && !debt.paidOff){
        sections.push(`<div style="margin-bottom:14px">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:#e05a5a;letter-spacing:1.5px;margin-bottom:6px">💸 전생의 빚</div>
          <div style="padding:8px 10px;background:#150505;border:1px solid #5a2020;font-size:9px;color:#e0a0a0;display:flex;justify-content:space-between;align-items:center">
            <span>${esc(debt.creditorName||'빚쟁이')}에게 ${debt.totalDebt}G 빚짐</span>
            <button onclick="if((S.gold||0)>=${debt.totalDebt}){S.gold-=${debt.totalDebt};saveGold(S.gold);updateHeader();payOffDebt();renderLegacyArchivePanel();toast('💰 빚을 청산했다!',3000);}else{toast('골드 부족');}" style="padding:3px 8px;font-size:8px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">상환 (${debt.totalDebt}G)</button>
          </div>
        </div>`);
      }
    }
    // 발견한 유적 (복구 가능)
    if(typeof loadRuins==='function'){
      const ruins = loadRuins();
      if(ruins?.length){
        const ruinHtml = ruins.map(r=>`<div style="padding:6px 10px;background:#0a0800;border:1px solid #2a1a05;border-left:2px solid var(--gold)44;margin-bottom:4px;font-size:9px;color:var(--dim);display:flex;justify-content:space-between;align-items:center">
          <span>${esc(r.originalName||r.label||r.id)}${r.restored?' ✓복구됨':' (붕괴됨)'}</span>
          ${!r.restored?`<button onclick="if(typeof restoreRuin==='function'){restoreRuin('${r.id}');if(typeof recordLegacyBuilding==='function'&&typeof BUILDING_TYPES!=='undefined'&&BUILDING_TYPES['${r.id}']){recordLegacyBuilding('${r.id}',BUILDING_TYPES['${r.id}'].label,'${S.scenario?.id||''}');}renderLegacyArchivePanel();}" style="padding:3px 8px;font-size:8px;background:#1a1005;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px">복구</button>`:''}
        </div>`).join('');
        sections.push(`<div style="margin-bottom:14px">
          <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">🏛️ 발견한 유적</div>
          ${ruinHtml}
        </div>`);
      }
    }
    // 세계의 기억
    if(typeof getWorldMemoryStatus==='function'){
      const wm = getWorldMemoryStatus();
      if(wm?.stageData) sections.push(sectionHtml('🌍','세계의 기억', [`${wm.stageData.label||''} — 현상 ${(wm.phenomena||[]).length}건`]));
    }
    // 애용 무기 / 영혼 각인 무기
    if(typeof getTopWeapon==='function'){
      const w = getTopWeapon();
      if(w) sections.push(sectionHtml('🗡️','전생의 무기 숙련', [WEAPON_TYPES?.[w]?.name || w]));
      // 숙련도가 충분히 쌓이면 영혼 각인 무기 생성
      if(w && typeof loadWeaponAffinity==='function' && typeof loadSoulWeapon==='function' && typeof saveSoulWeapon==='function' && typeof WEAPON_TYPES!=='undefined'){
        const aff = loadWeaponAffinity();
        if((aff[w]||0)>=15 && !loadSoulWeapon()){
          const wDef = WEAPON_TYPES[w];
          const soulWpn = {
            id:'soul_weapon_'+w, name:(wDef?.name||w)+'의 영혼 각인',
            icon:wDef?.icon||'⚔️', rarity:'legendary',
            desc:'수많은 생을 거쳐 '+(wDef?.name||w)+'과(와) 함께한 영혼이 무기에 각인되었다.',
            effects: Object.fromEntries(Object.entries(wDef?.bonus||{}).map(([k,v])=>[k, Math.round(v*1.5)])),
          };
          saveSoulWeapon(soulWpn);
          if(S.inventory && !S.inventory.some(it=>it.id===soulWpn.id)){
            S.inventory.push({ ...soulWpn, type:'equip', slot:'weapon' });
            if(typeof saveInventory==='function') saveInventory(S.inventory);
          }
          setTimeout(()=>toast(`⚔️ 영혼 각인 무기가 각성했다: ${soulWpn.name}!`, 4500), 1000);
        }
      }
      const _soulWpn = (typeof loadSoulWeapon==='function') ? loadSoulWeapon() : null;
      if(_soulWpn) sections.push(sectionHtml('⚔️','영혼 각인 무기', [`${_soulWpn.name} — ${_soulWpn.desc||''}`]));
    }
    // 베스티어리 요약
    if(typeof loadBestiary==='function'){
      const bestiary = loadBestiary();
      const entries = Object.values(bestiary||{});
      if(entries.length) sections.push(sectionHtml('📕','몬스터 도감', [`총 ${entries.length}종 기록, 최다 처치: ${entries.sort((a,b)=>(b.killCount||0)-(a.killCount||0))[0]?.name||''}`]));
    }
    // 숨겨진 직업 진행도
    if(typeof getUnlockedHiddenJobs==='function'){
      const hj = getUnlockedHiddenJobs();
      if(hj?.length) sections.push(sectionHtml('🎭','해금된 숨겨진 직업', hj.map(j=>j.name||j.id)));
    }
    // 각성 직업
    if(typeof getUnlockedAwakenedJobs==='function'){
      const aj = getUnlockedAwakenedJobs();
      if(aj?.length) sections.push(sectionHtml('✨','각성 가능 직업', aj.map(j=>`${j.name||j.id} (${j.minCycle}회차부터)`)));
    }
    // 숨겨진 직업 미해금 진행도
    // [B33 FIX] 이 경로는 원래 {cycle, karmaScore, totalDeaths} 3개 필드만
    // 전달해 "곧 해금될 직업" 안내가 checkAllHiddenJobsAuto()보다도 더
    // 부정확하던 버그. 동일한 공용 헬퍼로 통일.
    if(typeof getHiddenJobProgress==='function'){
      const gameData = (typeof _buildHiddenJobGameData==='function') ? _buildHiddenJobGameData() : { cycle, karmaScore: Math.round(S.stats?.krma||50) };
      const hjProgress = getHiddenJobProgress(gameData).filter(j=>!j.isUnlocked && j.canUnlock);
      if(hjProgress.length) sections.push(sectionHtml('🔓','곧 해금될 숨겨진 직업', hjProgress.map(j=>`${j.name||j.id} — 조건 충족!`)));
    }
  }catch(e){ console.warn('[renderLegacyArchivePanel]', e); }

  if(!sections.length){
    body.innerHTML = `<div style="text-align:center;padding:30px 20px;color:var(--dim);font-size:11px">
      아직 기록된 전생의 유산이 없습니다.<br>회차를 거듭하며 세계에 흔적을 남겨보세요.
    </div>`;
    return;
  }
  body.innerHTML = `<div style="padding:10px 14px">
    <div style="font-size:9px;color:var(--dim);margin-bottom:12px">현재 ${cycle}회차 — 지금까지 쌓아온 전생의 흔적들입니다.</div>
    ${sections.join('')}
  </div>`;
}
window.renderLegacyArchivePanel = renderLegacyArchivePanel;

window.renderLegacyArchivePanel = renderLegacyArchivePanel;

export function applyWishEffect(wishId){
  try{
    switch(wishId){
      case 'stat_reset':
        if(typeof clearPermStatBonus==='function') clearPermStatBonus();
        if(typeof clearMentalCorruption==='function') clearMentalCorruption();
        toast('✨ 누적된 페널티와 저주가 모두 초기화되었다.', 3000);
        break;
      case 'item_restore':
        if(S.inventory){
          S.inventory.push({ id:'wish_restored_'+Date.now(), name:'되찾은 유품', icon:'💎', type:'equip', slot:'accessory', rarity:'legendary', effects:{luk:10,cha:5}, desc:'소원으로 되찾은 잃어버린 물건.' });
          if(typeof saveInventory==='function') saveInventory(S.inventory);
        }
        break;
      case 'cycle_skip':
        S._wishCurseImmune = true;
        break;
      case 'hidden_ending':
        if(typeof loadDeification==='function' && typeof updateDeification==='function' && typeof DEIFICATION_CONDITIONS!=='undefined'){
          const d = loadDeification();
          const unmet = DEIFICATION_CONDITIONS.find(c=>!(d.conditions||{})[c.id]);
          if(unmet) updateDeification(unmet.id);
        }
        break;
      // npc_revive는 되살릴 대상을 특정할 정보가 부족해 서사 힌트로만 처리
      case 'npc_revive':
        S._nextInjectedContext = (S._nextInjectedContext||'')
          +'\n\n[🌈 소원: NPC 부활] 전생에서 잃었던 중요한 NPC 한 명이 기적적으로 되살아날 수 있습니다. 적절한 시점에 이 기적을 서사에 반영하십시오.';
        break;
    }
    if(typeof window.updateHeader==='function') window.updateHeader();
  }catch(e){ console.warn('[applyWishEffect]', e); }
}
window.applyWishEffect = applyWishEffect;

window.applyWishEffect = applyWishEffect;

export function renderCarryOverPanel(){
  const body = document.getElementById('pb-carryover');
  if(!body) return;
  const legacy = typeof loadLegacy==='function' ? loadLegacy() : {};
  const cycle = typeof loadCycleCount==='function' ? loadCycleCount() : 0;
  const loops = legacy.loops||[];
  const pending = legacy.pendingBonus;

  const CARRY_ITEMS = [
    { key:'titles',       icon:'👑', label:'칭호',       desc:'획득한 칭호가 유지됩니다' },
    { key:'summon_bonds', icon:'🐉', label:'소환수 유대', desc:'유대 50 이상 소환수 기억이 남습니다' },
    { key:'scars',        icon:'🩹', label:'전생 흉터',   desc:'중요 부상/트라우마가 흉터로 남습니다' },
    { key:'world_memory', icon:'🔮', label:'세계 기억',   desc:'루프 자각 상태가 유지됩니다' },
    { key:'ending_bonus', icon:'✨', label:'엔딩 보상',   desc:'엔딩에 따른 시작 보너스' },
    { key:'loop_count',   icon:'🔁', label:'회차 수',     desc:'누적 회차에 따라 감시자 태도 변화' },
  ];

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:4px">🔁 회차 계승 시스템</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:10px">현재 ${cycle}회차 — 환생 시 아래 항목이 다음 생으로 이어집니다</div>

      <div style="margin-bottom:12px">
        ${CARRY_ITEMS.map(item=>`
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #1a1400">
            <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)}</span>
            <div style="flex:1">
              <div style="font-size:10px;color:#c8a96e">${item.label}</div>
              <div style="font-size:8px;color:var(--dim)">${item.desc}</div>
            </div>
            <span style="font-size:9px;color:#60c060">✓ 계승</span>
          </div>`).join('')}
      </div>

      ${pending?`
        <div style="padding:10px;background:#0a0f05;border:1px solid #3a6020;border-radius:4px;margin-bottom:12px">
          <div style="font-size:10px;color:#80c040;margin-bottom:4px">⏳ 대기 중인 계승 보너스</div>
          <div style="font-size:9px;color:#c8a96e">${pending.endingIcon} ${pending.endingName}</div>
          ${Object.entries(pending.statBonus||{}).length?`<div style="font-size:9px;color:#60c060;margin-top:3px">보너스: ${Object.entries(pending.statBonus).map(([k,v])=>`${k.toUpperCase()} +${v}`).join(', ')}</div>`:''}
          ${pending.specialTitle?`<div style="font-size:9px;color:#c8a96e;margin-top:2px">칭호: ${pending.specialTitle}</div>`:''}
        </div>
      `:''}

      <div style="font-family:Cinzel,serif;font-size:9px;color:#a08040;margin-bottom:6px">📖 역대 회차 기록</div>
      ${loops.length===0?`<div style="font-size:9px;color:var(--dim);padding:10px;text-align:center">첫 번째 회차 진행 중</div>`:''}
      ${loops.slice(0,10).map((l,i)=>`
        <div style="padding:6px 10px;background:#060604;border:1px solid #1a1400;margin-bottom:3px;display:flex;align-items:center;gap:8px">
          <span style="font-size:9px;color:var(--dim)">#${l.loopNum||i+1}</span>
          <div style="flex:1">
            <div style="font-size:9px;color:#a08040">${l.endingId?.replace('_ending','').replace('_',' ')||'알 수 없음'}</div>
            <div style="font-size:8px;color:var(--dim)">칭호 ${(l.titles||[]).length}개 · 소환수 ${(l.summonBonds||[]).length}마리</div>
          </div>
          <span style="font-size:8px;color:var(--dim)">${new Date(l.savedAt||Date.now()).toLocaleDateString('ko-KR')}</span>
        </div>`).join('')}
    </div>`;
}
window.renderCarryOverPanel = renderCarryOverPanel;

window.renderCarryOverPanel = renderCarryOverPanel;
