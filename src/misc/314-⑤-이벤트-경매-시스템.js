// ⑤ 🎪 이벤트 경매 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { pickGeneratedObject, recordGeneratedObject, recordMarkovSample } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { callGeminiDirect } from '../quest/229-NPC-대화-퀘스트-시스템-AI-생성.js';
import { callLocalModelJSON, tryCloudThenLocalModelThenBank } from '../quest/331-로컬-AI-모델-엔진.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';

export const AUCTION_KEY = 'tf-auction';

export function loadAuction(){ try{ return JSON.parse(lsGet(AUCTION_KEY)||'null'); }catch(e){ return null; } }
window.loadAuction = loadAuction;

export function saveAuction(d){ try{ lsSet(AUCTION_KEY, JSON.stringify(d)); }catch(e){} }
window.saveAuction = saveAuction;

// ══════════════════════════════════════════════════════════════════
// 로컬 경매 생성 엔진 (AI 미사용) — 분류(유물/정보/토지/서비스/스킬)별
// 물품 뱅크에서 매번 4개를 무작위로 뽑아 조합한다. 희귀도는 가중치
// 확률로 굴리고, 시작가는 희귀도 구간 + 플레이어 보유 골드에 맞춰 스케일.
// ══════════════════════════════════════════════════════════════════
const AUCTION_TITLE_BANK = ['달빛 아래 경매','은밀한 물밑 거래','상인 길드의 특별 경매','떠돌이 상단의 좌판','저택의 유산 정리 경매','전쟁 이후의 전리품 경매'];
const AUCTION_ITEM_BANK = {
  유물: [
    { name:'낡은 인장 반지', desc:'누군가의 신분을 증명했던 물건이다.' },
    { name:'빛바랜 지도 조각', desc:'알 수 없는 장소를 가리키고 있다.' },
    { name:'봉인된 목함', desc:'열어본 이가 없다는 소문이 있다.' },
    { name:'이가 나간 검', desc:'한때 이름을 떨쳤을 것 같은 검이다.' },
  ],
  정보: [
    { name:'상단의 이동 경로 정보', desc:'값을 매기기 힘든 정보다.' },
    { name:'귀족가의 뒷이야기', desc:'듣는 것만으로도 위험할 수 있다.' },
    { name:'숨겨진 던전의 단서', desc:'진위는 확인되지 않았다.' },
    { name:'수배자의 은신처 정보', desc:'믿을 만한 출처인지는 알 수 없다.' },
  ],
  토지: [
    { name:'변두리 공터 권리증', desc:'개발 가능성이 있다는 평가다.' },
    { name:'버려진 창고 부지', desc:'위치가 나쁘지 않다.' },
    { name:'경계 지역 농지', desc:'분쟁 소지가 있다는 소문도 있다.' },
    { name:'낡은 여관 건물', desc:'수리하면 쓸 만해 보인다.' },
  ],
  서비스: [
    { name:'경비대 인맥 소개', desc:'급할 때 도움이 될 수 있다.' },
    { name:'대장장이의 특별 제작권', desc:'한정된 기회라고 한다.' },
    { name:'용병단 하루 고용권', desc:'단기간 전력 보강에 유용하다.' },
    { name:'상단 호위 동행권', desc:'안전한 이동을 보장한다.' },
  ],
  스킬: [
    { name:'비전 스크롤 조각', desc:'완전하지 않아 보인다.' },
    { name:'수련 비법서', desc:'낡았지만 내용은 온전하다.' },
    { name:'오래된 무공 필사본', desc:'해독에 시간이 걸릴 듯하다.' },
    { name:'스승 없는 제자의 노트', desc:'개인적인 기록이 섞여 있다.' },
  ],
};
const AUCTION_BID_RANGE = { 일반:[20,80], 희귀:[80,250], 전설:[250,800] };
function rollAuctionRarity(){
  const r = Math.random();
  return r < 0.55 ? '일반' : r < 0.90 ? '희귀' : '전설';
}
function composeLocalAuction(gold){
  const categories = Object.keys(AUCTION_ITEM_BANK).sort(()=>Math.random()-0.5).slice(0,4);
  const goldFactor = Math.max(0.7, Math.min(2.5, (gold||500)/500));
  const items = categories.map(cat=>{
    const pool = AUCTION_ITEM_BANK[cat];
    const base = pool[Math.floor(Math.random()*pool.length)];
    const rarity = rollAuctionRarity();
    const [lo,hi] = AUCTION_BID_RANGE[rarity];
    const startBid = Math.round((lo + Math.random()*(hi-lo)) * goldFactor);
    let desc = base.desc;
    if(rarity==='전설') desc += ' 보기 드문 물건이라는 감정가의 평가가 있었다.';
    return { name: base.name, desc, startBid, rarity, category: cat };
  });
  const title = AUCTION_TITLE_BANK[Math.floor(Math.random()*AUCTION_TITLE_BANK.length)];
  return { title, items };
}
window.composeLocalAuction = composeLocalAuction;

export async function generateAuction(){
  // [버그 수정] 골드는 이 게임 전체에서 S.gold(최상위 필드)에 저장된다.
  // S.stats에는 gold라는 스탯이 존재한 적이 없어(STAT_DEFS 참고)
  // S.stats?.gold는 항상 undefined였다 — 시작가 스케일링이 항상
  // "500골드 보유"로 고정되던 문제.
  const gold = S.gold||0;
  const era = S.character?.scenario||'중세 판타지';
  const btn = document.getElementById('auction-gen-btn');
  if(btn) btn.disabled=true;
  toast('🎪 경매 목록 생성 중...',800);

  // 세계관만으로 버킷화 — 골드 액수는 시작가 계산에만 쓰이고 목록
  // 자체의 성격(유물/정보/토지/서비스)은 세계관에 따라 갈리므로 이걸로 충분하다.
  const auctionBucketKey = 'auction|'+era;
  const reusedAuction = pickGeneratedObject(auctionBucketKey);
  // [복원] AI 우선 — 키가 있으면 세계관에 맞는 진짜 경매 물품 4개를
  // 시도하고, 없거나 실패·형식오류면 로컬 조합으로 폴백.
  const auctionPrompt = `당신은 TaleForge RPG의 경매 진행자입니다. 세계관 "${era}"에 어울리는 경매 물품 4개를 JSON으로 생성하세요.
카테고리는 유물/정보/토지/서비스/스킬 중에서 서로 다른 4개를 골고루 섞으세요.
반드시 다음 JSON만 출력하세요:
{"title":"경매 제목","items":[{"name":"물품명","desc":"1문장 설명","rarity":"일반|희귀|전설","category":"유물|정보|토지|서비스|스킬"}]}`;
  const _shapeAuction = (raw)=>{
    if(!raw || !raw.title || !Array.isArray(raw.items) || !raw.items.length) return null;
    const bidRange = { 일반:[20,80], 희귀:[80,250], 전설:[250,800] };
    const goldFactor = Math.max(0.7, Math.min(2.5, (gold||500)/500));
    const items = raw.items.slice(0,4).map(it=>{
      const rarity = ['일반','희귀','전설'].includes(it.rarity) ? it.rarity : '일반';
      const [lo,hi] = bidRange[rarity];
      return { name: it.name||'경매 물품', desc: it.desc||'', rarity, category: it.category||'유물',
        startBid: Math.round((lo + Math.random()*(hi-lo)) * goldFactor) };
    });
    // [패턴 학습] 진짜 AI가 쓴 경매 물품 설명만 코퍼스에 누적.
    items.forEach(it=>{ if(it.desc) recordMarkovSample('auction_item_desc', it.desc); });
    return { title: raw.title, items };
  };
  const result = reusedAuction || await tryCloudThenLocalModelThenBank(
    async () => _shapeAuction(await callGeminiDirect(auctionPrompt)),
    async () => _shapeAuction(await callLocalModelJSON(auctionPrompt, { maxTokens: 400 })),
    () => composeLocalAuction(gold),
    '경매 생성'
  );
  if(!reusedAuction) recordGeneratedObject(auctionBucketKey, result);

  const auction = {
    ...result,
    items: result.items.map(item=>({ ...item, myBid:0, topBid:item.startBid, won:false })),
    generatedAt: S.msgCount||0,
    expiresAt: (S.msgCount||0)+20,
  };
  saveAuction(auction);
  renderAuctionPanel();
  toast('🎪 경매가 시작되었습니다!',2000);
  if(btn) btn.disabled=false;
}
window.generateAuction = generateAuction;

export function bidAuction(idx, amount){
  const a = loadAuction();
  if(!a||!a.items[idx]) return;
  const item = a.items[idx];
  // [버그 수정] S.stats?.gold는 항상 undefined(→0)라서 어떤 입찰액을
  // 넣어도 "amount > gold"가 항상 참이 되어 매번 "골드가 부족합니다"로
  // 막히던 버그 — 경매 입찰 기능 자체가 한 번도 성공한 적이 없었다.
  // 골드는 S.gold(최상위 필드)에 저장된다.
  const gold = S.gold||0;
  if(amount > gold){ toast('골드가 부족합니다',1500); return; }
  if(amount <= item.topBid){ toast(`현재 최고가(${item.topBid}G)보다 높아야 합니다`,1500); return; }
  item.myBid = amount;
  item.topBid = amount;
  item.won = true; // 낙찰 (간단화)
  S.gold = (S.gold||0) - amount;
  if(typeof saveGold==='function') saveGold(S.gold);
  if(typeof window.updateHeader==='function') window.updateHeader();
  saveAuction(a);
  renderAuctionPanel();
  toast(`🎉 "${item.name}" 낙찰! -${amount}G`,2500);
}
window.bidAuction = bidAuction;

export function renderAuctionPanel(){
  const body = document.getElementById('pb-auction');
  if(!body) return;
  const a = loadAuction();
  const gold = S.gold||0;
  const rarityColors = {일반:'#8a9a8a',희귀:'#4090d0',전설:'#e0a030'};
  const catIcons = {유물:'⚗️',정보:'🔍',토지:'🏰',서비스:'🤝',스킬:'⚡'};
  if(!a){
    body.innerHTML=`
      <div style="padding:20px;text-align:center">
        <div style="font-size:40px;margin-bottom:12px">🎪</div>
        <div style="font-family:Cinzel,serif;font-size:12px;color:#e09040;margin-bottom:8px">이벤트 경매</div>
        <div style="font-size:11px;color:var(--dim);line-height:1.6;margin-bottom:16px">축제일·전쟁 후·특별한 날에 열리는 경매장.<br>희귀 유물, NPC 정보, 토지 권리 등을 입찰하세요.</div>
        <button id="auction-gen-btn" class="btn btn-gold" onclick="generateAuction()">🎪 경매 시작하기</button>
      </div>`;
    return;
  }
  const expired = (S.msgCount||0) > a.expiresAt;
  body.innerHTML=`
    <div style="padding:10px 14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-family:Cinzel,serif;font-size:11px;color:#e09040">${esc(a.title||'이벤트 경매')}</div>
        <div style="font-size:9px;color:${expired?'#e05050':'#60c060'}">${expired?'⌛ 경매 종료':'✅ 진행 중'} (보유: ${gold}G)</div>
      </div>
      ${a.items.map((item,i)=>`
        <div style="padding:11px 13px;background:#0c0800;border:1px solid ${item.won?'#806020':'#2a1a00'};margin-bottom:8px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
            <span>${catIcons[item.category]||'📦'}</span>
            <span style="font-size:10px;color:${rarityColors[item.rarity]||'#8a9a8a'};font-family:Cinzel,serif">${esc(item.name)}</span>
            <span style="font-size:8px;padding:1px 6px;background:${rarityColors[item.rarity]||'#8a9a8a'}18;border:1px solid ${rarityColors[item.rarity]||'#8a9a8a'}44;color:${rarityColors[item.rarity]||'#8a9a8a'};border-radius:2px">${item.rarity}</span>
            ${item.won?'<span style="margin-left:auto;font-size:9px;color:#e0a030">🏆 낙찰</span>':''}
          </div>
          <div style="font-size:10px;color:var(--dim);margin-bottom:6px">${esc(item.desc||'')}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:10px;color:#c8a050">최고가: ${item.topBid}G</span>
            ${!item.won&&!expired?`
              <input id="bid-${i}" type="number" min="${item.topBid+1}" placeholder="${item.topBid+100}" style="width:80px;padding:4px 6px;background:var(--bg-input);border:1px solid var(--border);color:var(--gold);font-size:10px;outline:none"/>
              <button onclick="(function(){const v=parseInt(document.getElementById('bid-${i}').value);if(!v)return;bidAuction(${i},v);})()" style="padding:4px 10px;background:#1a0d00;border:1px solid #806020;color:#e09040;font-size:9px;cursor:pointer;font-family:Cinzel,serif">입찰</button>`:''}
          </div>
        </div>`).join('')}
      <div style="margin-top:10px;text-align:center">
        <button id="auction-gen-btn" class="btn btn-dark" onclick="generateAuction()" style="font-size:9px">🎪 새 경매 생성</button>
      </div>
    </div>`;
}
window.renderAuctionPanel = renderAuctionPanel;

window.renderAuctionPanel = renderAuctionPanel;

window.generateAuction = generateAuction;

window.bidAuction = bidAuction;
