// ③ NPC 관계망 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { CONTINENT_RULER_NPCS, FACTION_LEADER_NPCS, JOB_MASTER_NPCS, RACE_RULER_NPCS, SOCIAL_RANK_NPCS } from '../data/055-5대륙-왕국-시스템.js';
import { MAIN_STORY_NPC_NAME_MAP } from '../data/061-볼린-드워프-기계-사제-프로필-패치-v40.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadNPCs, saveNPCs } from '../misc/001-block0-preamble.js';
import { applyWarDamage, getEffectiveInfluence, loadWarInfluence, loadWarInterv, saveWarInfluence } from '../misc/068-전쟁-피해-플레이어-개입-시스템.js';
import { addPermanentFact } from '../misc/217-14-메모리-자동-요약.js';
import { getMainStoryNpcSafeInfo } from '../religion/061-볼린-드워프-기계-사제-프로필-패치-v40.js';
import { esc, lsGet, lsSet, toast } from '../utils.js';
import { loadNpcStoryStages } from '../world/055-5대륙-왕국-시스템.js';

export const NPC_NETWORK_KEY = 'tf-npc-network';

export function loadNpcNetwork(){ try{ return JSON.parse(lsGet(NPC_NETWORK_KEY)||'{}'); }catch(e){ return {}; } }
window.loadNpcNetwork = loadNpcNetwork;

export function saveNpcNetwork(d){ try{ lsSet(NPC_NETWORK_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNpcNetwork = saveNpcNetwork;

export function buildNpcNetwork(){
  const npcs = loadNPCs()||[];
  const network = loadNpcNetwork();

  // 각 NPC에게 랜덤하게 1~2명의 지인 연결
  npcs.forEach((npc,i)=>{
    if(!network[npc.name]) network[npc.name] = { friends:[], rivals:[] };
    if(network[npc.name].friends.length === 0 && npcs.length > 1){
      // 근처 NPC 1~2명을 친구로 설정
      const others = npcs.filter((_,j)=>j!==i);
      const friendCount = Math.min(1+Math.floor(Math.random()*2), others.length);
      const friends = others.sort(()=>Math.random()-0.5).slice(0,friendCount).map(n=>n.name);
      network[npc.name].friends = friends;
    }
  });

  saveNpcNetwork(network);
  return network;
}
window.buildNpcNetwork = buildNpcNetwork;

export function propagateRelationship(npcName, delta){
  const network = loadNpcNetwork();
  const npcs    = loadNPCs()||[];
  const npcNet  = network[npcName];
  if(!npcNet) return;

  // 친구들에게 20% 파급
  const friendDelta = Math.round(delta * 0.2);
  if(Math.abs(friendDelta) < 1) return;

  npcNet.friends.forEach(friendName=>{
    const friend = npcs.find(n=>n.name===friendName);
    if(!friend) return;
    const oldRel = friend.relationship||50;
    friend.relationship = Math.max(0, Math.min(100, oldRel + friendDelta));
    if(Math.abs(friendDelta) >= 3){
      const dir = friendDelta > 0 ? '친구의 이야기를 듣고 호감이 생겼다' : '친구의 이야기를 듣고 경계심이 생겼다';
      toast(`${friendName}: ${dir}`, 2000, friend);
    }
  });
  saveNPCs(npcs);
}
window.propagateRelationship = propagateRelationship;

export const NPC_BOND_KEY = 'tf-npc-bonds';

export function loadNpcBonds(){ try{ return JSON.parse(lsGet(NPC_BOND_KEY)||'{}'); }catch(e){ return {}; } }
window.loadNpcBonds = loadNpcBonds;

export function saveNpcBonds(d){ try{ lsSet(NPC_BOND_KEY, JSON.stringify(d)); }catch(e){} }
window.saveNpcBonds = saveNpcBonds;

export function _npcBondKey(a,b){ return [a,b].sort().join('|'); }
window._npcBondKey = _npcBondKey;

export function tickNpcBonds(){
  try{
    const npcs = loadNPCs()||[];
    if(npcs.length < 2) return [];
    const bonds = loadNpcBonds();
    const network = loadNpcNetwork();
    const now = S.msgCount || 0;
    const events = [];

    // 너무 많은 쌍을 매 턴 다 굴리면 부하가 크므로, 매 턴 최대 2쌍만 무작위로 진행
    const pairsToTick = [];
    npcs.forEach((npc,i)=>{
      npcs.forEach((other,j)=>{
        if(j<=i) return;
        // 친구/라이벌 관계로 이미 엮인 쌍이거나, 낮은 확률로 새로운 쌍도 진행
        const isLinked = (network[npc.name]?.friends||[]).includes(other.name)
                       || (network[npc.name]?.rivals||[]).includes(other.name);
        if(isLinked || Math.random() < 0.05){
          pairsToTick.push([npc.name, other.name]);
        }
      });
    });
    const sample = pairsToTick.sort(()=>Math.random()-0.5).slice(0,2);

    sample.forEach(([a,b])=>{
      const k = _npcBondKey(a,b);
      if(!bonds[k]) bonds[k] = { score: 0, status:'acquaintance', lastTick: now };
      const bond = bonds[k];
      if(bond.status === 'married' || bond.status === 'dead' || bond.status === 'feud_resolved') return; // 종결 상태는 더 진행 안 함

      // 매 턴 -4 ~ +6 (사랑/우정이 적대보다 살짝 더 잘 자라도록)
      const delta = Math.floor(Math.random()*11) - 4;
      bond.score = Math.max(-100, Math.min(100, bond.score + delta));
      bond.lastTick = now;

      const npcA = npcs.find(n=>n.name===a), npcB = npcs.find(n=>n.name===b);
      if(!npcA || !npcB) return;

      // 임계값 이벤트 — 한 번만 발생
      if(bond.score >= 80 && bond.status !== 'couple' && bond.status !== 'married'){
        bond.status = 'couple';
        events.push({ type:'npc_romance', a, b, msg:`💕 ${npcA.icon||'👤'} ${a}와 ${npcB.icon||'👤'} ${b}가 서로에게 마음을 열었다는 소문이 있다.`, turn: now });
      } else if(bond.score >= 95 && bond.status === 'couple'){
        bond.status = 'married';
        events.push({ type:'npc_marriage', a, b, msg:`💍 ${npcA.icon||'👤'} ${a}와 ${npcB.icon||'👤'} ${b}가 혼인을 약속했다는 소식이 들린다.`, turn: now });
      } else if(bond.score <= -80 && bond.status !== 'feud'){
        bond.status = 'feud';
        events.push({ type:'npc_feud', a, b, msg:`💢 ${npcA.icon||'👤'} ${a}와 ${npcB.icon||'👤'} ${b} 사이에 깊은 원한이 생겼다는 이야기가 들린다.`, turn: now });
      } else if(bond.score <= -95 && bond.status === 'feud' && Math.random() < 0.15){
        // 극단적 원한 + 낮은 확률 = 둘 중 하나가 죽거나 떠남 (살해보다는 추방/실종으로 — 너무 잔혹하지 않게)
        bond.status = 'feud_resolved';
        const victim = Math.random() < 0.5 ? a : b;
        const victimNpc = npcs.find(n=>n.name===victim);
        if(victimNpc){
          victimNpc.isAlive = false;
          events.push({ type:'npc_death', a, b, msg:`💀 ${victimNpc.icon||'👤'} ${victim}이(가) 사라졌다는 소식이 들린다 — 원한 관계의 끝이었다는 소문이다.`, turn: now });
        }
      }
    });

    if(events.length){
      saveNPCs(npcs);
      // 게시판/소문 큐에도 흘려보내서 ①(세력 게시판)과 같은 경로로 노출되게 함
      if(typeof loadFactionNewsQueue === 'function' && typeof saveFactionNewsQueue === 'function'){
        const queue = loadFactionNewsQueue();
        events.forEach(e => queue.unshift({ msg: e.msg, type: e.type, from: e.a, to: e.b, turn: e.turn, at: new Date().toISOString(), read: false }));
        saveFactionNewsQueue(queue.slice(0, 30));
      }
    }
    saveNpcBonds(bonds);
    return events;
  }catch(e){ console.warn('[tickNpcBonds]', e); return []; }
}
window.tickNpcBonds = tickNpcBonds;

window.tickNpcBonds = tickNpcBonds;

window.loadNpcBonds = loadNpcBonds;

export function getNpcBondSummary(npcName){
  try{
    const bonds = loadNpcBonds();
    const related = Object.entries(bonds).filter(([k]) => k.split('|').includes(npcName));
    if(!related.length) return '';
    const STATUS_LABEL = { couple:'💕 호감을 느끼는 사이', married:'💍 혼인을 약속한 사이', feud:'💢 갈등 관계', feud_resolved:'💀 비극으로 끝난 관계' };
    return related
      .filter(([,b]) => STATUS_LABEL[b.status])
      .map(([k,b]) => { const other = k.split('|').find(n=>n!==npcName); return `${other}: ${STATUS_LABEL[b.status]}`; })
      .join(' / ');
  }catch(e){ return ''; }
}
window.getNpcBondSummary = getNpcBondSummary;

window.getNpcBondSummary = getNpcBondSummary;

export const FACTIONS_BY_SCENARIO = {
  medieval: {
    '왕국 기사단':  { icon:'⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 L22 9.5 L9.5 22 L2 14.5 Z"/><path d="M3.5 3.5 L7.5 7.5"/><path d="M16.5 16.5 L20.5 20.5"/></svg>`,  color:'#4a6fa5', desc:'왕국의 검과 방패. "철의 맹세단"이라 불리는 왕실 직속 정예 기사들.', lore:'창립: 초대 왕 알테라 1세의 혈맹 기사들이 세운 수호 조직. "왕국이 있는 한 우리가 있다"가 창립 서약.\n현재 욕망: 왕위 정통성 수호. 기사단장 레오나르드 경은 실질 권력도 원한다.\n비밀: 220년 전 7대 국왕의 악마 계약서를 은폐 중. 기사단 지하 금고에 있으며, 증거가 드러나면 기사단의 정당성이 무너진다. 젊은 기사들은 진실을 알고 싶어한다.\nNPC 반응: 평민에게 공정하지만 차갑다. 동료 기사에게는 의리를 중시. 비밀을 캐려는 자에겐 적대적.', influence:75, capital:{ name:'알테라 왕도', icon:'🏰', desc:'대륙 중심부 거대 성채 도시. 왕궁과 기사 훈련소. 지하에 봉인된 비밀 금고가 있다.' }, rivals:['암흑 결사','도적 길드','철벽 대공령'], allies:['교회','왕국 귀족'] },
    '마법사 협회':  { icon:'🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>`,  color:'#8e44ad', desc:'대륙 최고의 마법 연구자 집단. 모든 마법 지식의 독점을 추구한다.', lore:'창립: 150년 전 대마법 폭발 사건 이후 금지 연구를 이어가기 위해 비밀 조직에서 출발. 이후 공식 기관이 됐지만 내부는 여전히 비밀 연구 중심.\n현재 욕망: 금지 마법 해금. 세계수 접근권. 봉인석 에너지 연구.\n비밀: 수장 아르카누스는 3회차 이상의 기억을 가진 루프 자각자. 봉인이 수십 회 반복됐다는 걸 안다. 혼자 감당하고 있다.\nNPC 반응: 지식인과 마법사에게 개방적. 교회와 기사단에 의심. 아르카누스를 직접 만나려면 신뢰를 쌓아야 한다.', influence:65, capital:{ name:'아르카나 탑', icon:'🗼', desc:'마법 에너지가 집중된 북부 고원의 대탑. 세계 최대 마법 도서관. 지하층에 봉인석 연구실이 있다.' }, rivals:['교회','이단 심문소'], allies:['마법사 길드','연금술사 조합'] },
    '도적 길드':    { icon:'🗡️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 L4 20"/><path d="M20 4 L15 4 L20 9 Z"/><path d="M4 20 L5 17 L7 19 Z"/></svg>`,  color:'#2c3e50', desc:'지하 세계를 지배하는 그림자 조직. 정보와 암살, 밀수를 독점한다.', lore:'창립: 150년 전 대마법 폭발 사건으로 땅을 잃은 평민들의 생존 조직에서 출발.\n현재 욕망: 귀족 독점 해체. 자유 교역. 정보 독점.\n비밀: 연맹의 정보망이 실질적으로 감시자(The Watcher)의 눈 역할. 정보상들이 수집한 감정 데이터가 감시자에게 흘러간다. 연맹 자체는 이 사실을 모른다.\nNPC 반응: 돈과 실력을 존중한다. 귀족에겐 냉소적. 정보를 가진 자에겐 우호적.', influence:55, capital:{ name:'암흑가 (왕도 지하)', icon:'🕳️', desc:'알테라 왕도 지하에 펼쳐진 비밀 구역. 길드 본부는 폐수로 아래 깊숙이 있다.' }, rivals:['왕국 기사단','교회'], allies:['암시장(중세)','밀수꾼 연합'] },
    '교회':         { icon:'✝️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L12 21 M6 9 L18 9"/></svg>`,  color:'#c8a96e', desc:'빛의 신앙 "순환의 사원"을 이끄는 신앙 집단. 민중의 정신적 지주이자 정치 세력.', lore:'창립: 세계수 이그드라 신앙에서 파생. 죽은 자는 세계수 뿌리로 돌아가 새 생을 받는다는 순환 교리.\n현재 욕망: 순환의 진리 수호. 민심 장악. 귀족 세력과 균형 유지.\n비밀: 고위 성직자 일부가 루프 자각자. "순환은 신성하다"고 가르치지만 내심 루프에서 탈출하고 싶어한다. 지하 문서고에 "이번 순환을 끊는 방법"을 연구한 금서가 있다.\n일상 의례: "세계수의 축복을"이 표준 인사. 장례에서 "뿌리로 돌아가 새 가지가 되길" 집전.\nNPC 반응: 신앙심 있는 자에게 따뜻하다. 타락하거나 악마와 연관된 자에게 적대적.', influence:70, capital:{ name:'성도 루체아', icon:'⛪', desc:'대성당이 위치한 남부 성지 도시. 지하에 루프 자각자들의 금서 문서고가 있다.' }, rivals:['마법사 협회','암흑 결사'], allies:['왕국 기사단','이단 심문소','태양 회랑 대공령'] },
    '암흑 결사':    { icon:'💀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`,  color:'#e74c3c', desc:'심연 신앙(Pact of the Abyss)을 추종하는 비밀 조직. "순환은 감옥, 악마의 계약만이 해방"을 믿는다.', lore:'창립: 220년 전 7대 국왕의 악마 계약 사건과 연관. 그 계약의 악마가 이후 결사를 형성시켰다.\n현재 욕망: 모든 봉인석 파괴. 순환에서 이탈해 영원한 권력 획득.\n비밀: 결사원 대부분은 순환에서 이탈하는 게 아니라 마계의 하수인이 된다는 사실을 모른다. 최고위층만 안다.\n상징: 검은 원 안에 자기 꼬리를 무는 뱀.\nNPC 반응: 비밀 암호로 접촉. 타락이 높을수록 우호적. 빛의 신앙 수행자에게 적대적.', influence:50, capital:{ name:'어둠의 제단 (불명)', icon:'💀', desc:'위치 불명의 지하 성역. 목격자는 살아 돌아오지 못한다. 셀리나 폐허 지하라는 소문.' }, rivals:['왕국 기사단','교회'], allies:['불사 군단','금지된 마법사'] },
    '순환의 기억자들': { icon:'🔄', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 C4 7.5 7.5 4 12 4 C15 4 17.5 5.5 19 8" /><path d="M19 3 L19 8 L14 8" /><path d="M20 12 C20 16.5 16.5 20 12 20 C9 20 6.5 18.5 5 16" /><path d="M5 21 L5 16 L10 16" /></svg>`, color:'#6040c0', desc:'이단 종파로 탄압받는 루프 자각자들의 비밀결사. "우리는 전생을 기억한다"고 선언한다.', lore:'창립: 알 수 없음. 최소 수백 회차 전부터 존재.\n세계 내 인식: 당국에 탄압받는 이단. "죽어도 죽지 않는다"며 환생 기억을 주장하는 미치광이들로 알려져 있다.\n욕망: 루프를 설계한 감시자를 찾아 파괴. 세계의 진짜 순환 구조 해명.\n비밀: 내부에 감시자의 스파이가 있다. 길드 마스터 자신이 감시자에게 타협한 쌍둥이 영혼일 수 있다.\n가입 암호: "에테르 나시온" (나는 환생자다)\n5회차 이전 플레이어에게는 술집에서 소문으로만 들린다.', influence:20, capital:{ name:'기억의 지하실 (왕도 외곽)', icon:'🕯️', desc:'지도에 없는 지하실. 루프를 기억하는 자들만 찾아올 수 있다.' }, rivals:['이단 심문소','교회'], allies:['마법사 협회'] },
    '왕국 귀족':    { icon:'👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></svg>`,  color:'#d4a030', desc:'영지와 권력을 지닌 귀족 계층. 왕국 정치의 실질적 지배 계급.', lore:'대공·후작·백작 등 70여 가문이 왕국 귀족회의를 구성. 파벌 다툼이 치열하다.', influence:80, capital:{ name:'알테라 왕도 귀족 구역', icon:'🏯', desc:'왕도 북쪽 고지대 귀족 저택가. 권력의 실질적 중심지.' }, rivals:['민중 반란군','무쇠 변경백령'], allies:['왕국 기사단','상인 조합','태양 회랑 대공령'] },
    '상인 조합':    { icon:'💰', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></svg>`,  color:'#27ae60', desc:'대륙 무역을 장악한 상인 연합. 돈이 있는 곳엔 언제나 그들이 있다.', lore:'총장 다비드 마르코가 이끄는 세 도시 연합 상단. 전쟁 자금도 기꺼이 대출한다.', influence:60, capital:{ name:'황금 항구 메르카타', icon:'⚓', desc:'대륙 최대 무역항. 동서 교역로의 교차점으로 막대한 세금이 걷힌다.' }, rivals:[], allies:['왕국 귀족','연금술사 조합','철벽 대공령','무쇠 변경백령'] },
    '이단 심문소':  { icon:'🔥', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></svg>`,  color:'#c0392b', desc:'마법 남용과 이단을 척결하는 교회 직속 기관. 두려움의 대상.', lore:'심문관 토르케마다가 지휘. 마법사·이단자·괴물 사냥에 특화된 전투 성직자들.', influence:45, capital:{ name:'심문 요새 카스티가', icon:'🔒', desc:'성도 인근 산악 요새. 지하 심문실이 악명 높다.' }, rivals:['마법사 협회','무쇠 변경백령'], allies:['교회'] },
    '민중 반란군':  { icon:'✊', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11 L8 6.5 C8 5.7 8.7 5 9.5 5 C10.3 5 11 5.7 11 6.5 L11 10.5" /><path d="M11 10.5 L11 6 C11 5.2 11.7 4.5 12.5 4.5 C13.3 4.5 14 5.2 14 6 L14 10.5" /><path d="M14 10.5 L14 6.5 C14 5.7 14.7 5 15.5 5 C16.3 5 17 5.7 17 6.5 L17 13" /><path d="M8 11 L6.5 12.5 C5.7 13.3 5.7 14.5 6.5 15.3 L10 19 C11 20.3 12.5 21 14 21 L15.5 21 C18 21 19.5 19 19.5 16.5 L19.5 13" /></svg>`,  color:'#c0392b', desc:'귀족의 착취에 맞서 봉기한 농민과 평민들의 연합.', lore:'전직 기사 출신 해방자 아론이 이끄는 반란 세력. 세금과 부역에 시달린 민중이 들고 일어났다.', influence:35, capital:{ name:'붉은 언덕 (반란군 야영지)', icon:'🏕️', desc:'왕도 외곽 붉은 흙 언덕에 세워진 반란군 본거지. 수천 명의 농민 전사가 집결해 있다.' }, rivals:['왕국 귀족','왕국 기사단'], allies:['도적 길드'] },
    '마법사 길드':  { icon:'🌟', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>`,  color:'#6a0dad', desc:'실용 마법을 다루는 평민 마법사들의 조합. 마법사 협회보다 개방적이다.', lore:'길드장 실버핸드가 이끄는 대중 마법사 집단. 치료·정화·농업 마법을 전문으로 한다.', influence:40, capital:{ name:'길드 홀 (왕도 중하층가)', icon:'🏠', desc:'왕도 중심부 상업 지구에 자리한 길드 본관. 누구나 마법을 배울 수 있다.' }, rivals:['이단 심문소'], allies:['마법사 협회','연금술사 조합'] },
    '연금술사 조합': { icon:'⚗️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2 L15 2 M10 2 L10 9 L4.5 18 C4 19 4.7 20 6 20 L18 20 C19.3 20 20 19 19.5 18 L14 9 L14 2" stroke-linejoin="round"/><path d="M7 15 L17 15" stroke-width="1.1"/></svg>`, color:'#d4ac0d', desc:'물질 변환과 비약 제조를 전문으로 하는 연구자 집단.', lore:'총장 파라켈수스 박사가 이끈다. 황금 제조의 꿈을 안고 있지만 실용 의약품으로 먹고 산다.', influence:45, capital:{ name:'연금술사 탑 (왕도 학술 구역)', icon:'🗼', desc:'다양한 연기와 냄새가 피어오르는 마법약 제조 집합소. 폭발 사고가 잦다.' }, rivals:['이단 심문소'], allies:['마법사 협회','상인 조합'] },
    '암시장(중세)': { icon:'🌑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.6" stroke="none"/></svg>`,  color:'#2c3e50', desc:'금지 물품과 정보를 거래하는 지하 경제 조직.', lore:'상인도 귀족도 아닌 익명의 중개인들이 운영. 독약, 마법 재료, 금지된 서적 등을 취급한다.', influence:30, capital:{ name:'암시장 골목 (왕도 빈민가)', icon:'🕯️', desc:'왕도 최하층 빈민가의 구불구불한 골목. 입구를 아는 자만 찾아올 수 있다.' }, rivals:['왕국 기사단'], allies:['도적 길드','밀수꾼 연합'] },
    '밀수꾼 연합':  { icon:'⚓', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7 L12 20"/><path d="M7 10 L17 10"/><path d="M4 14 C4 18.5 7.5 21 12 21 C16.5 21 20 18.5 20 14" stroke-width="1.4"/><path d="M4 14 L6.5 14 M20 14 L17.5 14" stroke-width="1.4"/></svg>`,  color:'#1a5276', desc:'왕국 관세를 피해 물자를 밀수하는 해상·육상 밀수 조직.', lore:'선장 크로우가 이끄는 광역 밀수 네트워크. 금지 물품부터 세금 회피 상품까지 무엇이든 운반한다.', influence:35, capital:{ name:'항구 창고 (메르카타 뒷골목)', icon:'🚢', desc:'황금 항구 메르카타 외곽 숨겨진 창고. 관세청 눈을 피해 물자가 드나든다.' }, rivals:['왕국 기사단','교회'], allies:['도적 길드','암시장(중세)'] },
    '불사 군단':    { icon:'💀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`,  color:'#6e2f2f', desc:'암흑 결사가 비밀리에 키운 불사 병사들의 집단.', lore:'강령술사 모르티머가 지휘하는 언데드 전투 집단. 암흑 결사의 전위 무력으로 활동한다.', influence:25, capital:{ name:'죽음의 계곡 (북부 황무지)', icon:'💀', desc:'생명 에너지가 고갈된 저주받은 황무지. 불사 생명체들이 자연스럽게 모여든다.' }, rivals:['왕국 기사단','교회'], allies:['암흑 결사','금지된 마법사'] },
    '금지된 마법사': { icon:'🔯', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L20.7 17 L3.3 17 Z" stroke-linejoin="round"/><path d="M12 22 L3.3 7 L20.7 7 Z" stroke-linejoin="round"/></svg>`, color:'#922b21', desc:'교회와 이단 심문소에 의해 추방된 금지 마법 연구자들.', lore:'마법사 협회에서도 배제된 극단적 마법 연구자들. 금지 마법·악마 계약·강령술을 탐구한다.', influence:20, capital:{ name:'버려진 마탑 (서부 황야)', icon:'🏚️', desc:'붕괴 직전의 낡은 마법탑. 추방된 마법사들이 은밀히 모여 금지 연구를 이어간다.' }, rivals:['교회','이단 심문소','마법사 협회'], allies:['암흑 결사','불사 군단'] },
    // ── 중앙 대륙 지방 귀족 (봉건 분권 세력) ──
    '철벽 대공령':  { icon:'🐺', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 C4 16 6 14 6 11 C6 8.5 7.5 7 9.5 7 C11.5 7 13 8.5 13 11 C13 14 15 16 15 20"/><path d="M15 20 C15 17 16.5 15.5 18 15.5 C19.5 15.5 20.5 17 20.5 19"/></svg>`, color:'#4a6a8a', desc:'북방 국경을 지켜온 무장 대공 가문. "우리가 없었다면 왕국은 진작 짓밟혔다"는 자부심이 강하다.', lore:'창립: 200년 전 야만족 대침공 당시 최전선을 지킨 볼프하르트 장군이 대공 작위를 받으며 시작. 이후 대대로 국경 방어를 세습.\\n현재 욕망: 왕실로부터 더 많은 자치권과 군비 지원 확보. "국경을 지키는 대가"를 정당하게 받고 싶어 한다.\\n비밀: 현 대공 그레고리안이 북대륙 야만족 부족장 딸과 비밀리에 정략결혼 동맹을 맺었다. 왕실이 알면 반역죄로 몰릴 사안이나, 정작 대공은 이 동맹 덕에 국경이 30년째 평온하다고 여긴다.\\nNPC 반응: 실력과 전공을 중시. 왕도 귀족의 허례허식을 경멸한다. 국경을 넘나든 자에게는 의외로 관대하다.', influence:58, capital:{ name:'철벽성 그림자하르트', icon:'🏔️', desc:'북방 산맥 관문에 세워진 거대 요새 도시. 성벽 밖은 만년설, 성벽 안은 대장간 화로 연기로 가득하다.' }, rivals:['왕국 기사단'], allies:['상인 조합'] },
    '태양 회랑 대공령': { icon:'🌾', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 6"/><path d="M12 6 C10 6 9 4.5 9 3 C10.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 6 C14 6 15 4.5 15 3 C13.5 3 12 4 12 6 Z" stroke-width="1.2"/><path d="M12 10 C10 10 9 8.5 9 7 C10.5 7 12 8 12 10 Z" stroke-width="1.2"/><path d="M12 10 C14 10 15 8.5 15 7 C13.5 7 12 8 12 10 Z" stroke-width="1.2"/></svg>`, color:'#d4a030', desc:'대륙 최대 곡창지대를 쥔 부유한 곡물 귀족 가문. 왕국의 식량 절반이 이곳에서 나온다.', lore:'창립: 100년 전 대기근 당시 유일하게 곡물을 비축해 왕국을 구한 솔라리 가문이 대공 작위를 받으며 시작.\\n현재 욕망: 여대공 이자벨라는 자신의 딸을 왕세자비로 들여보내 대공가를 왕가와 연결시키려 한다. 교회와의 밀착도 이 야심의 일환.\\n비밀: 대공령 지하 곡물 창고 심층부에 220년 전 악마 계약 사건과 연관된 또 다른 봉인 유적이 잠들어 있다. 교회조차 이 존재를 모르며, 대공가는 그것을 그저 "저주받은 지하실"로만 여겨 봉쇄해두었다.\\nNPC 반응: 우아하고 계산적. 왕도 사교계에 정통하다. 가난한 자에게는 자선을 베풀지만 그 자선이 곧 정치적 계산이다.', influence:62, capital:{ name:'태양의 회랑 솔라리아', icon:'🌻', desc:'황금빛 밀밭이 지평선까지 펼쳐진 남부 대공령 수도. 대성당 첨탑이 도시 어디서든 보인다.' }, rivals:['도적 길드','암흑 결사'], allies:['왕국 귀족','교회'] },
    '무쇠 변경백령': { icon:'⚙️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="1.3"/><path d="M11 7 L4 14 C3.3 14.7 3.3 15.8 4 16.5 C4.7 17.2 5.8 17.2 6.5 16.5 L13.5 9.5"/></svg>`, color:'#8a5a3a', desc:'전직 용병이 전공으로 벼락출세해 세운 신흥 변경백령. 혈통이 없어 기존 귀족들에게 은근히 무시당한다.', lore:'창립: 15년 전 국경 분쟁에서 홀로 적 지휘관을 베어낸 용병대장 카심 이브라힘이 변경백 작위를 하사받으며 시작.\\n현재 욕망: 정통 귀족 사회에 인정받는 것. 상인 조합과 결탁해 급속히 부와 무력을 키우고 있으며, 언젠가 대공으로 승격하는 것이 목표다.\\n비밀: 카심의 부대에는 국적 불명의 이민족 용병 출신이 많아 이단 심문소가 은밀히 감시 중이다. 실제로 부대원 일부는 과거 금지된 마법을 익힌 전력이 있으나 카심 본인은 이를 알고도 눈감아준다 — 실력만 있다면 과거는 묻지 않는다는 신조다.\\nNPC 반응: 실력만 보고 사람을 쓴다. 혈통이나 출신을 캐묻지 않는 대신, 배신에는 가차없다. 정통 귀족의 허세를 노골적으로 비웃는다.', influence:38, capital:{ name:'무쇠 요새 카심가르드', icon:'⚔️', desc:'동부 접경에 급조된 신흥 요새 도시. 용병 출신들이 모여들어 국적도 말투도 뒤섞인 거친 활기가 있다.' }, rivals:['왕국 귀족','이단 심문소'], allies:['상인 조합'] },
    // ── 북동 대륙 (엘프 왕국) 고유 세력 ──
    '달빛 예언단':   { icon:'🌙', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12.5 C20 17.7 15.7 22 10.5 22 C7.9 22 5.5 20.9 3.8 19.1 C8.3 19.5 12.6 16.1 12.6 10.8 C12.6 7.5 10.9 4.6 8.4 3 C14.8 2.5 20 6.9 20 12.5 Z" stroke-linejoin="round"/></svg>`, color:'#70c878', desc:'세계수 신전에 거주하는 엘프 예언사 집단. 별빛 마법으로 미래를 읽고 왕국 정책에 개입한다.', lore:'대예언사 실라리엘이 이끈다. 예언이 틀린 적이 없다고 전해지지만 말을 아껴 해석이 분분하다.', influence:70, capital:{ name:'세계수 신전 이그드라', icon:'🌳', desc:'수만 년 수령 세계수 내부에 자리한 신전. 엘프 외에는 입장이 불가하다.' }, rivals:['인간 이민자 연합','고대 유물 밀수 조직'], allies:['왕국 기사단'] },
    '인간 이민자 연합': { icon:'🤝', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 L9 12 L11 9 L13 15 L15 12 L22 12" stroke-linejoin="round"/><circle cx="6" cy="8" r="2.2"/><circle cx="18" cy="8" r="2.2"/></svg>`, color:'#a0a060', desc:'북동 대륙에 정착한 인간 이민자들의 자치 조직. 엘프와의 공존을 원하지만 차별에 맞서 목소리를 높인다.', lore:'외교관 에단 로스가 대변인 역할. 엘프 보수파와 갈등이 심화되고 있다.', influence:40, capital:{ name:'인간 정착촌 뉴포레스트', icon:'🏘️', desc:'세계수 외곽에 조성된 인간 거주 구역. 엘프와 인간이 뒤섞인 경계 도시.' }, rivals:['달빛 예언단'], allies:[] },
    '고대 유물 밀수 조직': { icon:'💎', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3 L18 3 L22 9 L12 21 L2 9 Z" stroke-linejoin="round"/><path d="M2 9 L22 9 M9 3 L7 9 L12 21 M15 3 L17 9 L12 21" stroke-width="1.1"/></svg>`, color:'#8060a0', desc:'엘프 고대 유물을 몰래 발굴해 서대륙 상인에게 팔아넘기는 지하 조직.', lore:'엘프 배신자 시리에가 수장. 왕국 금지 품목을 취급하므로 달빛 예언단에 쫓기고 있다.', influence:25, capital:{ name:'고대 유적 지하 창고 (위치 불명)', icon:'🕳️', desc:'아직 발굴되지 않은 엘프 유적 지하에 숨겨진 밀수 거점.' }, rivals:['달빛 예언단','왕국 기사단'], allies:[] },
    // ── 남동 군도 (해적 연맹) 고유 세력 ──
    '해적 연합 함대': { icon:'🏴‍☠️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4"/><circle cx="9.7" cy="8" r="0.7" fill="currentColor"/><circle cx="14.3" cy="8" r="0.7" fill="currentColor"/><path d="M9.5 11.5 C10.3 12.3 13.7 12.3 14.5 11.5" stroke-width="1.2"/><path d="M8.5 4.5 L6.5 2.5 M15.5 4.5 L17.5 2.5" stroke-width="1.2"/><path d="M9 21 L9 15 L15 15 L15 21"/></svg>`, color:'#c87040', desc:'남동 군도를 지배하는 해적왕 발타자르 휘하의 연합 함대. 100개 섬에서 모인 해적들의 최대 세력.', lore:'해적왕 선거로 세워진 연맹. 강한 자가 왕이 되지만 각 섬 선장들의 표심이 권력을 좌우한다.', influence:75, capital:{ name:'해적 왕도 포르투 레알', icon:'⚓', desc:'군도 중심 항구 도시. 해적왕의 본거지이자 세계 최대 암시장이 열리는 곳.' }, rivals:['심해 봉인 수호단'], allies:['군도 밀수 왕'] },
    '심해 봉인 수호단': { icon:'🌊', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 C2 12 5 9 8 12 C11 15 13 12 16 12 C19 12 22 9 22 9 M2 17 C2 17 5 14 8 17 C11 20 13 17 16 17 C19 17 22 14 22 14" stroke-width="1.4"/></svg>`, color:'#3060a0', desc:'테네브라 해구에 봉인된 고대 신이 깨어나지 못하도록 감시하는 비밀 결사.', lore:'폭풍 마법사 마리넬라가 실질적 수장. 해적왕조차 이 조직의 진짜 목적을 모른다.', influence:45, capital:{ name:'봉인의 등대 (테네브라 해구 인근)', icon:'🗼', desc:'항상 폭풍이 휘몰아치는 해구 외곽의 등대. 봉인 유지 마법이 걸려 있다.' }, rivals:['해적 연합 함대'], allies:[] },
    '군도 밀수 왕':  { icon:'💰', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></svg>`, color:'#b06020', desc:'남동 군도 전체의 밀수 네트워크를 장악한 상인 조직. 어느 세력에도 물자를 판다.', lore:'잭 "세 혀"가 이끈다. 해적왕과도 서대륙 상인과도 거래하며 중립을 유지한다.', influence:55, capital:{ name:'자유항 상인 구역', icon:'🚢', desc:'어느 법도 통하지 않는 자유항. 금지 물품부터 노예까지 모든 것이 거래된다.' }, rivals:[], allies:['해적 연합 함대'] },
    // ── 북서 대륙 (드워프 지하 왕국) 고유 세력 ──
    '철혈 장인 조합': { icon:'⚒️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 3.5 L20.5 9.5 L17 13 L11 7 Z" stroke-width="1.3"/><path d="M11 7 L4 14 C3.3 14.7 3.3 15.8 4 16.5 C4.7 17.2 5.8 17.2 6.5 16.5 L13.5 9.5"/><path d="M4 4 L9 9 M4 9 L9 4" stroke-width="1.1" opacity="0.6"/></svg>`, color:'#a07848', desc:'드워프 지하 왕국을 실질적으로 운영하는 최고 장인들의 집단. 야금술과 기계 공학의 정점.', lore:'대장장이 왕 투린 XVII세의 측근. 지상 왕국들에 무기와 기계를 수출해 막대한 부를 축적했다.', influence:80, capital:{ name:'용광로 왕도 이그드하르 장인 구역', icon:'🔥', desc:'지하 왕도 심장부의 용광로 지구. 쉬지 않고 불꽃이 타오르는 창조의 공간.' }, rivals:['고대 기계 신관단','지상 첩자 조직'], allies:[] },
    '고대 기계 신관단': { icon:'⚙️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12 M5.5 5.5 L7.5 7.5 M16.5 16.5 L18.5 18.5 M18.5 5.5 L16.5 7.5 M7.5 16.5 L5.5 18.5" stroke-width="1.2"/></svg>`, color:'#806040', desc:'지하 최심부에서 발견된 고대 기계 신전을 연구하는 드워프 사제 집단. 기계에 신성이 깃든다고 믿는다.', lore:'기계 사제 볼린 "철의 손"이 수장. 고대 기계 문명의 재가동을 시도 중이며 위험한 실험이 반복되고 있다.', influence:50, capital:{ name:'고대 기계 신전 기어하트', icon:'⚙️', desc:'지하 최심부의 고대 신전. 수백만 개의 톱니가 지금도 돌아간다. 드워프도 함부로 접근 못 한다.' }, rivals:['철혈 장인 조합'], allies:[] },
    '지상 첩자 조직':   { icon:'🕵️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="3.2"/><circle cx="17" cy="12" r="3.2"/><path d="M12.2 12 L13.8 12" /><path d="M5.8 12 L2 11" /><path d="M20.2 12 L22 11" /><path d="M9 15.2 C9 15.2 7 20 5 20" /></svg>`, color:'#706050', desc:'지상 왕국들의 의뢰를 받아 드워프 기술 기밀을 빼돌리는 정보 조직.', lore:'드워프 출신 배신자 기미가 이끈다. 철혈 장인 조합의 기술 비밀을 중앙 대륙에 팔아넘긴다.', influence:30, capital:{ name:'지하-지상 연결 비밀 통로 (위치 불명)', icon:'🕳️', desc:'지하 왕국과 지상을 연결하는 비밀 통로. 드워프 왕국 내 배신자들만 아는 경로.' }, rivals:['철혈 장인 조합','고대 기계 신관단'], allies:['왕국 기사단'] },
  },
  custom: {
    '지배 세력':   { icon:'👑', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></svg>`, color:'#c8a96e', desc:'이 세계의 공식 지배 집단.', lore:'권력의 중심에 서 있는 세력. 법과 질서를 정의한다.', influence:80, capital:{ name:'지배자의 수도', icon:'🏰', desc:'이 세계 권력의 중심지. 지배 세력의 궁전과 군대가 여기 있다.' }, rivals:['저항 세력'], allies:['상인 집단'] },
    '저항 세력':   { icon:'✊', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11 L8 6.5 C8 5.7 8.7 5 9.5 5 C10.3 5 11 5.7 11 6.5 L11 10.5" /><path d="M11 10.5 L11 6 C11 5.2 11.7 4.5 12.5 4.5 C13.3 4.5 14 5.2 14 6 L14 10.5" /><path d="M14 10.5 L14 6.5 C14 5.7 14.7 5 15.5 5 C16.3 5 17 5.7 17 6.5 L17 13" /><path d="M8 11 L6.5 12.5 C5.7 13.3 5.7 14.5 6.5 15.3 L10 19 C11 20.3 12.5 21 14 21 L15.5 21 C18 21 19.5 19 19.5 16.5 L19.5 13" /></svg>`, color:'#e74c3c', desc:'지배 세력에 맞서는 반체제 그룹.', lore:'자유를 위해 싸우는 집단. 지하에서 활동하며 지배 세력 타도를 꾀한다.', influence:45, capital:{ name:'저항군 은거지 (비밀)', icon:'🕳️', desc:'지배 세력의 추적을 피한 비밀 거점. 오직 신뢰받는 자만 위치를 안다.' }, rivals:['지배 세력','질서 집단'], allies:['중립 세력'] },
    '상인 집단':   { icon:'💰', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5 L12 16.5 M9.5 9.3 C9.5 8.2 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.3 14.5 9.4 C14.5 10.6 13.5 11 12 11.3 C10.5 11.6 9.5 12.2 9.5 13.4 C9.5 14.5 10.5 15.3 12 15.3 C13.5 15.3 14.5 14.6 14.5 13.5" stroke-width="1.2"/></svg>`, color:'#27ae60', desc:'경제를 움직이는 상업 세력.', lore:'돈이 있는 곳엔 언제나 있다. 어느 편도 아니지만 실리를 추구한다.', influence:60, capital:{ name:'교역 중심 도시', icon:'⚓', desc:'이 세계 최대의 시장이 있는 교역 도시. 모든 세력의 물자가 여기를 거친다.' }, rivals:[], allies:['지배 세력'] },
    '신비 집단':   { icon:'🔮', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.3"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>`, color:'#8e44ad', desc:'이 세계의 신비로운 힘을 다루는 비밀 조직.', lore:'고대의 지식을 보존하는 신비주의자들. 그들의 진짜 목적은 알 수 없다.', influence:55, capital:{ name:'고대의 성소 (불명)', icon:'🔮', desc:'위치를 아는 자가 거의 없는 신비로운 장소. 고대 지식의 보고.' }, rivals:[], allies:[] },
    '질서 집단':   { icon:'⚖️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 L21 12" stroke-width="1.4"/><path d="M12 4 L12 20" stroke-width="1.2"/><path d="M6 12 L4 16 L8 16 Z M18 12 L16 16 L20 16 Z" stroke-width="1.1"/></svg>`, color:'#3498db', desc:'이 세계의 법과 질서를 유지하는 세력.', lore:'공정한 심판을 자처하지만 때로 부패한다. 강력한 무력을 보유한다.', influence:65, capital:{ name:'법의 도시', icon:'⚖️', desc:'질서 집단의 본거지. 대법원과 감옥, 군사 시설이 집중되어 있다.' }, rivals:['저항 세력'], allies:['지배 세력'] },
    '중립 세력':   { icon:'⚪', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/></svg>`, color:'#95a5a6', desc:'어느 편에도 서지 않는 독립 집단.', lore:'자신들만의 이익과 원칙을 고수한다. 중립을 지키지만 이용하기에 따라 강력한 동맹이 된다.', influence:35, capital:{ name:'중립 구역', icon:'🏕️', desc:'어느 세력도 지배하지 않는 완충 지대. 모든 세력이 암묵적으로 존중한다.' }, rivals:[], allies:['저항 세력','상인 집단'] },
  },
};

export function getCurrentFactions(){
  const sid = S?.scenario?.id || 'medieval';
  return FACTIONS_BY_SCENARIO[sid] || FACTIONS_BY_SCENARIO['medieval'];
}
window.getCurrentFactions = getCurrentFactions;

export const FACTIONS = new Proxy({}, {
  get(target, key){
    const f = getCurrentFactions();
    if(key === 'then') return undefined; // Promise thenable 오탐 방지
    if(typeof key === 'symbol') return f[key];
    return f[key];
  },
  ownKeys(){ return Object.keys(getCurrentFactions()); },
  getOwnPropertyDescriptor(target, key){
    const f = getCurrentFactions();
    if(key in f) return { value: f[key], writable:true, enumerable:true, configurable:true };
    return undefined;
  },
  has(target, key){ return key in getCurrentFactions(); }
});

export const FACTION_KEY = 'tf-factions';

export function loadFactionRep(){ try{ return JSON.parse(lsGet(FACTION_KEY)||'{}'); }catch(e){ return {}; } }
window.loadFactionRep = loadFactionRep;

export function saveFactionRep(d){ try{ lsSet(FACTION_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFactionRep = saveFactionRep;

export function updateFactionRep(factionName, delta){
  const rep = loadFactionRep();
  rep[factionName] = Math.max(-100, Math.min(100, (rep[factionName]||0) + delta));

  // 라이벌 파벌은 반대로 변동
  const factions = getCurrentFactions();
  const faction = factions[factionName];
  if(faction?.rivals){
    faction.rivals.forEach(rival=>{
      rep[rival] = Math.max(-100, Math.min(100, (rep[rival]||0) - Math.round(delta*0.3)));
    });
  }
  saveFactionRep(rep);

  const level = rep[factionName] >= 50 ? '동맹' : rep[factionName] >= 20 ? '우호' : rep[factionName] >= -20 ? '중립' : rep[factionName] >= -50 ? '적대' : '전쟁';
  if(Math.abs(delta) >= 5)
    toastHTML(`${esc(factions[factionName]?.icon||'')} ${esc(factionName)}: ${esc(level)} (${esc(rep[factionName]>0?'+':'')}${esc(rep[factionName])})`, 2500);
}
window.updateFactionRep = updateFactionRep;

export function getFactionDesc(){
  const rep = loadFactionRep();
  const factions = getCurrentFactions();
  const playerRep = Object.entries(rep).filter(([,v])=>Math.abs(v)>=10)
    .map(([k,v])=>`${factions[k]?.icon||''}${k}:${v>0?'+':''}${v}`)
    .join(', ')||'없음';
  const simDesc = getFactionSimDesc();
  return simDesc ? `${playerRep}\n${simDesc}` : playerRep;
}
window.getFactionDesc = getFactionDesc;

export function detectFactionChanges(aiText){
  const lc = (aiText||'').toLowerCase();
  const factions = getCurrentFactions();
  Object.entries(factions).forEach(([name,f])=>{
    if(!lc.includes(name.toLowerCase())) return;
    if(lc.includes('도움') || lc.includes('구했') || lc.includes('지지'))
      updateFactionRep(name, 5);
    else if(lc.includes('공격') || lc.includes('배신') || lc.includes('적대'))
      updateFactionRep(name, -8);
  });
}
window.detectFactionChanges = detectFactionChanges;

export const FACTION_SIM_KEY = 'tf-faction-sim';

export const FS_RELATIONS_KEY = 'tf-faction-sim-relations';

export const FS_HISTORY_KEY = 'tf-faction-sim-history';

export const FS_WAR_KEY = 'tf-faction-sim-war';

export function loadFactionSim(){
  try{
    // 분리 키 우선
    const rel = lsGet(FS_RELATIONS_KEY); const hist = lsGet(FS_HISTORY_KEY); const war = lsGet(FS_WAR_KEY);
    if (rel !== null) {
      const base = lsGet(FACTION_SIM_KEY); const baseObj = base ? JSON.parse(base) : {};
      return {
        relations: JSON.parse(rel||'{}'),
        history:   hist ? JSON.parse(hist) : [],
        lastTick:  baseObj.lastTick||0,
        warMeta:   war  ? JSON.parse(war)  : {},
      };
    }
    const d = JSON.parse(lsGet(FACTION_SIM_KEY)||'{}');
    if(!d.relations) d.relations = {};
    if(!d.history)   d.history   = [];
    if(!d.lastTick)  d.lastTick  = 0;
    if(!d.warMeta)   d.warMeta   = {};
    return d;
  }catch(e){ return {relations:{},history:[],lastTick:0,warMeta:{}}; }
}
window.loadFactionSim = loadFactionSim;

export function saveFactionSim(d){
  try{
    lsSet(FS_RELATIONS_KEY, JSON.stringify(d.relations||{}));
    lsSet(FS_HISTORY_KEY,   JSON.stringify(d.history||[]));
    lsSet(FS_WAR_KEY,       JSON.stringify(d.warMeta||{}));
    lsSet(FACTION_SIM_KEY,  JSON.stringify(d)); // 하위호환
  }catch(e){}
}
window.saveFactionSim = saveFactionSim;

export function _simKey(a, b){ return [a,b].sort().join('|||'); }
window._simKey = _simKey;

export function _initTension(a, b){
  const factions = getCurrentFactions();
  const fa = factions[a], fb = factions[b];
  if(!fa||!fb) return 45;
  if((fa.rivals||[]).includes(b)||(fb.rivals||[]).includes(a)) return 70;
  if((fa.allies||[]).includes(b)||(fb.allies||[]).includes(a)) return 20;
  return 45;
}
window._initTension = _initTension;

export function getSimTension(sim, a, b){
  const k = _simKey(a,b);
  if(sim.relations[k] !== undefined) return sim.relations[k];
  return _initTension(a, b);
}
window.getSimTension = getSimTension;

export function getSimStatus(tension){
  if(tension >= 90) return { label:'⚔️ 전쟁', color:'#e03030', code:'war' };
  if(tension >= 70) return { label:'😤 갈등', color:'#d06030', code:'conflict' };
  if(tension >= 50) return { label:'😐 냉전', color:'#a09060', code:'cold' };
  if(tension >= 30) return { label:'🤝 우호', color:'#80b040', code:'friendly' };
  return { label:'🌟 동맹', color:'#50c050', code:'alliance' };
}
window.getSimStatus = getSimStatus;

export function getActiveWars(){
  try{
    const sim = loadFactionSim();
    const rels = sim.relations||{};
    const wars = [];
    for(const k in rels){
      if(rels[k] >= 90){
        const [a,b] = k.split('|||'); // _simKey(a,b) = [a,b].sort().join('|||')
        wars.push({ a, b, tension: rels[k] });
      }
    }
    return wars;
  }catch(e){ return []; }
}
window.getActiveWars = getActiveWars;

window.getActiveWars = getActiveWars;

export const FACTION_SECRET_KEY = 'tf-faction-secrets';

export function loadFactionSecrets(){ try{ return JSON.parse(lsGet(FACTION_SECRET_KEY)||'{}'); }catch(e){ return {}; } }
window.loadFactionSecrets = loadFactionSecrets;

export function saveFactionSecrets(d){ try{ lsSet(FACTION_SECRET_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFactionSecrets = saveFactionSecrets;

export function extractSecretFromLore(lore){
  if(!lore) return null;
  const m = lore.match(/비밀:\s*([^\n]+)/);
  return m ? m[1].trim() : null;
}
window.extractSecretFromLore = extractSecretFromLore;

export function checkFactionSecretTrigger(){
  try{
    const factions = getCurrentFactions();
    const rep = loadFactionRep();
    const secrets = loadFactionSecrets();
    const names = Object.keys(factions);
    // 평판(우호적이든 적대적이든 '깊이 얽힌' 상태) 절대값이 40 이상인
    // 세력만 후보 — 전혀 모르는 세력의 비밀이 갑자기 나오는 건 부자연스럽다.
    const candidates = names.filter(name => {
      if(secrets[name]) return false; // 이미 제시했음
      const secretText = extractSecretFromLore(factions[name]?.lore);
      if(!secretText) return false;
      return Math.abs(rep[name]||0) >= 40;
    });
    if(!candidates.length) return '';
    // 한 번에 하나만, 낮은 확률(매 턴 8%)로 제시 — 너무 자주 뜨면
    // "비밀"이라는 무게감이 사라진다.
    if(Math.random() > 0.08) return '';
    const name = candidates[Math.floor(Math.random()*candidates.length)];
    const secretText = extractSecretFromLore(factions[name]?.lore);
    secrets[name] = { surfaced: true, turn: S?.msgCount||0, resolved: false };
    saveFactionSecrets(secrets);
    return `\n[🔐 세력 비밀 발견 기회 — ${name}] 플레이어가 ${name}과(와) 충분히 얽혀 있어, 이 세력의 숨겨진 비밀을 우연히 접할 기회가 자연스럽게 열릴 수 있다: "${secretText}" 지금 당장 강제로 드러낼 필요는 없다 — 현재 장면이나 다음 몇 턴 안에서 단서(문서 조각, NPC의 실언, 의심스러운 장소 등)로 자연스럽게 흘려라. 플레이어가 그 단서를 추적해 비밀을 완전히 파헤치면 <gs>{"faction_secret_resolved":{"name":"${name}","outcome":"exposed 또는 concealed 또는 used"}}</gs>를 출력하라 — exposed(공개해 세력에 타격), concealed(은폐를 도와 그 세력에 약점을 쥠), used(비밀로 협박/거래에 활용).`;
  }catch(e){ console.warn('[checkFactionSecretTrigger]', e); return ''; }
}
window.checkFactionSecretTrigger = checkFactionSecretTrigger;

window.checkFactionSecretTrigger = checkFactionSecretTrigger;

export function processFactionSecretResolved(gs){
  try{
    if(!gs?.faction_secret_resolved?.name) return;
    const { name, outcome } = gs.faction_secret_resolved;
    const secrets = loadFactionSecrets();
    if(secrets[name]) secrets[name].resolved = true;
    saveFactionSecrets(secrets);
    const outcomeLabel = outcome==='exposed' ? '공개되어 큰 타격을 입었다' : outcome==='concealed' ? '계속 은폐됐다(플레이어가 약점을 쥐게 됐다)' : '플레이어에게 이용당했다';
    // 세력 비밀의 결말은 되돌릴 수 없는 무게가 있는 사건이므로 영구 사실로 기록
    if(typeof addPermanentFact==='function'){
      addPermanentFact('irreversible_choice', `${name}의 비밀이 ${outcomeLabel}.`, S?.msgCount||0);
    }
    // 결과에 따라 그 세력의 영향력에도 실제 영향
    if(outcome==='exposed'){
      const inf2 = loadWarInfluence();
      inf2[name] = Math.max(0, (inf2[name]||0) - 20);
      saveWarInfluence(inf2);
      toast(`💥 ${name}의 비밀이 폭로되며 큰 타격을 입었다!`, 3500);
    } else if(outcome==='used'){
      toast(`🗝️ ${name}의 비밀을 손에 넣었다 — 협상의 패가 생겼다.`, 3000);
    }
  }catch(e){ console.warn('[processFactionSecretResolved]', e); }
}
window.processFactionSecretResolved = processFactionSecretResolved;

window.processFactionSecretResolved = processFactionSecretResolved;

export function tickFactionSimulation(){
  const sim  = loadFactionSim();
  const factions = getCurrentFactions();
  const names = Object.keys(factions);
  if(names.length < 2) return [];

  const rep    = loadFactionRep();
  const events = [];
  const now    = S.msgCount || 0;

  for(let i=0; i<names.length; i++){
    for(let j=i+1; j<names.length; j++){
      const a = names[i], b = names[j];
      const k = _simKey(a,b);
      const fa = factions[a], fb = factions[b];
      let tension = getSimTension(sim, a, b);
      const meta  = sim.warMeta[k] || {};

      const prevTension = tension;
      const prevStatus  = getSimStatus(tension);

      // ── ① 매 턴 기본 랜덤 변동 (+1/+2/+3/-1/-2/-3) ──────
      const isRival = (fa.rivals||[]).includes(b)||(fb.rivals||[]).includes(a);
      const isAlly  = (fa.allies||[]).includes(b)||(fb.allies||[]).includes(a);

      // 가중 랜덤 스텝 함수
      function weightedStep(rival, ally){
        const r = Math.random();
        if(rival){
          // 라이벌: 상승 가중 — +3(18%) +2(22%) +1(20%) 0(15%) -1(12%) -2(8%) -3(5%)
          if(r<0.05)  return -3; if(r<0.13) return -2; if(r<0.25) return -1;
          if(r<0.40)  return  0; if(r<0.60) return  1; if(r<0.82) return  2; return 3;
        } else if(ally){
          // 동맹: 하강 가중 — -3(18%) -2(22%) -1(20%) 0(15%) +1(12%) +2(8%) +3(5%)
          if(r<0.18)  return -3; if(r<0.40) return -2; if(r<0.60) return -1;
          if(r<0.75)  return  0; if(r<0.87) return  1; if(r<0.95) return  2; return 3;
        } else {
          // 중립: 균등 — -3(10%) -2(15%) -1(20%) 0(10%) +1(20%) +2(15%) +3(10%)
          if(r<0.10)  return -3; if(r<0.25) return -2; if(r<0.45) return -1;
          if(r<0.55)  return  0; if(r<0.75) return  1; if(r<0.90) return  2; return 3;
        }
      }
      tension += weightedStep(isRival, isAlly);

      // ── ② 돌발 이벤트 (15% 확률, ±8~15 급변) ─────────────
      let bigEventMsg = null;
      if(Math.random() < 0.15){
        const BIG_EVENTS = [
          { delta:+12, msg:(x,y,fx,fy)=>`💢 ${fx.icon}${x}의 사절이 ${fy.icon}${y} 국경에서 피습되었다! 긴장이 급격히 고조된다.` },
          { delta:+10, msg:(x,y,fx,fy)=>`⚡ ${fx.icon}${x}와 ${fy.icon}${y} 접경지에서 무력 충돌이 발생했다!` },
          { delta:+15, msg:(x,y,fx,fy)=>`🔥 ${fx.icon}${x}가 ${fy.icon}${y}에 대한 경제 봉쇄를 선언했다!` },
          { delta: +8, msg:(x,y,fx,fy)=>`📜 ${fx.icon}${x} 내부에서 ${fy.icon}${y}를 적으로 지목하는 선동이 퍼지고 있다.` },
          { delta:-12, msg:(x,y,fx,fy)=>`🕊️ ${fx.icon}${x}와 ${fy.icon}${y} 사이에 비밀 화해 회담이 열렸다.` },
          { delta:-10, msg:(x,y,fx,fy)=>`🤝 공동의 위기 앞에 ${fx.icon}${x}와 ${fy.icon}${y}가 협력을 논의 중이다.` },
          { delta:-15, msg:(x,y,fx,fy)=>`🌿 ${fx.icon}${x}와 ${fy.icon}${y}가 대규모 교역 협정을 체결했다!` },
          { delta: -8, msg:(x,y,fx,fy)=>`💌 ${fx.icon}${x}와 ${fy.icon}${y} 지도자 간 친서가 교환되었다.` },
        ];
        const ev = BIG_EVENTS[Math.floor(Math.random()*BIG_EVENTS.length)];
        tension += ev.delta;
        bigEventMsg = ev.msg(a, b, fa, fb);
      }

      // ── 플레이어 영향 ──────────────────────────────────────
      const repA = rep[a]||0, repB = rep[b]||0;
      if(repA > 30 && repB < -20) tension = Math.min(100, tension + 3);
      if(repA < -20 && repB > 30) tension = Math.min(100, tension + 3);
      if(repA > 20 && repB > 20)  tension = Math.max(0,   tension - 2);

      tension = Math.max(0, Math.min(100, tension));

      // ── ③ 전쟁 중 최소 20턴 유지 ────────────────────────────
      const isCurrentlyWar = prevStatus.code === 'war';
      if(isCurrentlyWar && meta.warStart !== undefined){
        const warDuration = now - meta.warStart;
        if(warDuration < 20){
          tension = Math.max(tension, 90); // 89 이하로 못 내림
        }
      }

      // ── ④ 휴전 후 20턴간 재전쟁 불가 ──────────────────────
      if(meta.ceasefireAt !== undefined){
        const ceaseDuration = now - meta.ceasefireAt;
        if(ceaseDuration < 20){
          tension = Math.min(tension, 89); // 90 이상으로 못 올림
        }
      }

      const newStatus = getSimStatus(tension);

      // ── ⑤ 상태 전환 처리 ──────────────────────────────────
      let transitionEvt = null;
      if(newStatus.code !== prevStatus.code){
        // 전쟁 개전
        if(newStatus.code === 'war'){
          sim.warMeta[k] = { warStart: now, ceasefireAt: (meta.ceasefireAt !== undefined ? meta.ceasefireAt : undefined) };
        }
        // 전쟁 종료 (휴전)
        if(prevStatus.code === 'war' && newStatus.code !== 'war'){
          // ⑤ 긴장도를 초기값으로 리셋
          tension = _initTension(a, b);
          tension = Math.min(tension, 89);
          sim.warMeta[k] = { warStart: meta.warStart, ceasefireAt: now };
        }
        transitionEvt = generateFactionEvent(a, b, fa, fb, prevStatus.code, newStatus.code, tension);
      }

      // 돌발 이벤트 메시지 저장 (전환 없어도 기록)
      if(bigEventMsg && !transitionEvt){
        transitionEvt = { a, b, from:prevStatus.code, to:newStatus.code,
          tension, msg:bigEventMsg, turn:now, isBigEvent:true };
      } else if(bigEventMsg && transitionEvt){
        transitionEvt.bigEventMsg = bigEventMsg;
      }

      if(transitionEvt) events.push(transitionEvt);
      sim.relations[k] = tension;
    }
  }

  // ── ⑥ 전쟁 중 세력 influence 피해 처리 ────────────────
  applyWarDamage(sim, factions, names, now, events);

  if(events.length){
    sim.history = [...events, ...sim.history].slice(0, 30);
  }
  sim.lastTick = now;
  saveFactionSim(sim);
  return events;
}
window.tickFactionSimulation = tickFactionSimulation;

export function generateFactionEvent(a, b, fa, fb, fromCode, toCode, tension){
  const templates = {
    'alliance→cold':     [`${fa.icon}${a}와 ${fb.icon}${b} 사이에 균열이 생기기 시작했다.`, `${a}와 ${b}의 관계에 찬 바람이 불고 있다.`],
    'alliance→conflict': [`${fa.icon}${a}와 ${fb.icon}${b}의 동맹에 심각한 균열이 생겼다!`],
    'friendly→cold':     [`${fa.icon}${a}와 ${fb.icon}${b}의 교류가 뜸해졌다.`, `${a}와 ${b} 사이의 긴장이 조금씩 고조되고 있다.`],
    'friendly→conflict': [`${fa.icon}${a}와 ${fb.icon}${b}의 우호 관계가 급속히 냉각됐다!`],
    'cold→conflict':     [`${fa.icon}${a}와 ${fb.icon}${b} 간에 심각한 충돌이 발생했다!`, `${a}와 ${b}의 갈등이 수면 위로 올라왔다. 무력 충돌 직전이다.`],
    'cold→war':          [`⚔️ 냉전이 돌연 열전으로! ${fa.icon}${a}와 ${fb.icon}${b} 간에 전쟁이 발발했다!`],
    'conflict→war':      [`⚔️ ${a}와 ${b} 사이에 전쟁이 선포되었다!`, `⚔️ ${fa.icon}${a}의 군대가 ${fb.icon}${b}의 영토로 진격했다!`],
    'conflict→cold':     [`${fa.icon}${a}와 ${fb.icon}${b} 간의 긴장이 다소 완화되었다.`, `${a}와 ${b}가 일단 한 발씩 물러선 모양이다.`],
    'conflict→friendly': [`${fa.icon}${a}와 ${fb.icon}${b}가 전격적인 화해 선언을 발표했다.`],
    'war→conflict':      [`🕊️ ${fa.icon}${a}와 ${fb.icon}${b}의 전선이 교착 상태에 빠졌다.`, `🕊️ ${a}와 ${b} 사이에 휴전 협상이 시작되었다.`],
    'war→cold':          [`🕊️ ${fa.icon}${a}와 ${fb.icon}${b}가 전쟁을 끝내고 냉전 체제에 합의했다.`],
    'war→friendly':      [`🕊️ ${fa.icon}${a}와 ${fb.icon}${b}가 전쟁을 끝내고 화해했다. 강화 조약이 체결되었다.`],
    'war→alliance':      [`🌟 전쟁을 치른 ${fa.icon}${a}와 ${fb.icon}${b}가 오히려 강한 동맹을 맺었다!`],
    'cold→friendly':     [`${fa.icon}${a}와 ${fb.icon}${b}가 비밀 협상을 시작했다는 소문이다.`, `${a}와 ${b}의 관계가 개선되고 있다.`],
    'cold→alliance':     [`🌟 뜻밖에도 ${fa.icon}${a}와 ${fb.icon}${b}가 동맹을 맺었다!`],
    'friendly→alliance': [`🌟 ${fa.icon}${a}와 ${fb.icon}${b}가 공식 동맹을 체결했다!`, `🌟 ${a}와 ${b}가 손을 맞잡았다. 강력한 연합이 탄생했다.`],
    'alliance→war':      [`💥 동맹이었던 ${fa.icon}${a}와 ${fb.icon}${b}가 배신과 함께 전면전에 돌입했다!`],
  };
  const key = `${fromCode}→${toCode}`;
  const pool = templates[key];
  if(!pool) return null;
  const msg = pool[Math.floor(Math.random()*pool.length)];
  return { a, b, from:fromCode, to:toCode, tension, msg, turn: S.msgCount||0 };
}
window.generateFactionEvent = generateFactionEvent;

export function getFactionSimDesc(){
  const sim = loadFactionSim();
  const factions = getCurrentFactions();
  const names = Object.keys(factions);
  if(names.length < 2) return '';

  const lines = [];

  // 현재 전쟁 중인 쌍
  const wars = [], conflicts = [], alliances = [];
  for(let i=0; i<names.length; i++){
    for(let j=i+1; j<names.length; j++){
      const a=names[i], b=names[j];
      const t = getSimTension(sim, a, b);
      const s = getSimStatus(t);
      if(s.code==='war') wars.push(`${a}↔${b}`);
      else if(s.code==='conflict') conflicts.push(`${a}↔${b}`);
      else if(s.code==='alliance') alliances.push(`${a}↔${b}`);
    }
  }
  if(wars.length) lines.push(`⚔️ 현재 전쟁: ${wars.join(', ')}`);
  if(conflicts.length) lines.push(`😤 갈등 중: ${conflicts.join(', ')}`);
  if(alliances.length) lines.push(`🌟 동맹: ${alliances.join(', ')}`);

  // 전쟁 중 세력 피해 현황
  const warInf = loadWarInfluence();
  const warPairDescs = [];
  for(let i=0; i<names.length; i++){
    for(let j=i+1; j<names.length; j++){
      const a=names[i], b=names[j];
      const t = getSimTension(sim, a, b);
      if(getSimStatus(t).code==='war'){
        const dmgA = warInf[a]||0, dmgB = warInf[b]||0;
        const effA = getEffectiveInfluence(a), effB = getEffectiveInfluence(b);
        warPairDescs.push(`${a}(세력${effA}, -${dmgA}피해) vs ${b}(세력${effB}, -${dmgB}피해)`);
        // 플레이어 개입 상태
        const iv = loadWarInterv()[_simKey(a,b)];
        if(iv && iv.side !== 'neutral'){
          const ivDesc = iv.side==='a'?`${a} 편 참전`:iv.side==='b'?`${b} 편 참전`:'조정 시도';
          warPairDescs.push(`플레이어 개입: ${ivDesc}`);
        }
      }
    }
  }
  if(warPairDescs.length) lines.push(`⚔️ 전쟁 피해 현황: ${warPairDescs.join(' / ')}`);

  // 최근 사건 2개
  const recent = (sim.history||[]).map(e=>e.msg);
  if(recent.length) lines.push(`최근 세력 동향: ${recent.join(' / ')}`);

  return lines.join('\n');
}
window.getFactionSimDesc = getFactionSimDesc;

export const FACTION_NEWS_KEY = 'tf-faction-news-queue';

export function loadFactionNewsQueue(){ try{ return JSON.parse(lsGet(FACTION_NEWS_KEY)||'[]'); }catch(e){ return []; } }
window.loadFactionNewsQueue = loadFactionNewsQueue;

export function saveFactionNewsQueue(d){ try{ lsSet(FACTION_NEWS_KEY, JSON.stringify(d)); }catch(e){} }
window.saveFactionNewsQueue = saveFactionNewsQueue;

export function showFactionNewsToast(events){
  if(!events||!events.length) return;
  // 팝업 없이 큐에 쌓기만 함 — 게시판/NPC 소문으로 확인 가능
  const queue = loadFactionNewsQueue();
  const now = new Date().toISOString();
  for(const evt of events){
    queue.unshift({
      msg: evt.msg,
      type: evt.to || 'news',
      from: evt.from || '',
      to: evt.to || '',
      turn: S.msgCount || 0,
      at: now,
      read: false,
    });
  }
  // 최대 30개 보관
  saveFactionNewsQueue(queue.slice(0, 30));

  // 마을에 있을 때만 작은 힌트 토스트 (위치 무관 팝업 제거)
  const loc = (S.visitedLocations||[]).slice(-1)[0];
  const inTown = loc && ['hamlet','village','town','city','capital','port'].includes(loc.type);
  if(inTown){
    toast('📋 게시판에 새 소식이 붙었습니다', 2000);
  }
}
window.showFactionNewsToast = showFactionNewsToast;

export function getAllWorldFigures(){
  try{
    const groups = [
      { data: typeof SOCIAL_RANK_NPCS!=='undefined' ? SOCIAL_RANK_NPCS : {}, label:'신분' },
      { data: typeof RACE_RULER_NPCS!=='undefined' ? RACE_RULER_NPCS : {}, label:'종족' },
      { data: typeof FACTION_LEADER_NPCS!=='undefined' ? FACTION_LEADER_NPCS : {}, label:'세력' },
      { data: typeof CONTINENT_RULER_NPCS!=='undefined' ? CONTINENT_RULER_NPCS : {}, label:'대륙' },
      { data: typeof JOB_MASTER_NPCS!=='undefined' ? JOB_MASTER_NPCS : {}, label:'직업' },
    ];
    const all = [];
    groups.forEach(g => {
      Object.values(g.data||{}).forEach(npc => {
        if(npc?.id && !npc.note){ all.push({...npc, _category: g.label}); } // note만 있는 재사용 인물은 원본 쪽에서만 집계
      });
    });
    return all;
  }catch(e){ return []; }
}
window.getAllWorldFigures = getAllWorldFigures;

window.getAllWorldFigures = getAllWorldFigures;

export function renderWorldFigures(){
  try{
    const allFigures = getAllWorldFigures();
    const npcs = (typeof loadNPCs==='function') ? (loadNPCs()||[]) : [];
    const knownNames = new Set(npcs.map(n=>n.name));
    const stages = (typeof loadNpcStoryStages==='function') ? loadNpcStoryStages() : {};

    // [신규] 메인 스토리 인물 섹션 — getMainStoryNpcSafeInfo()의 3단계
    // 검증(만남 여부/현재 챕터/status 등급)을 통과한 정보만 표시한다.
    // 패널은 정보를 "새로 알려주는" 곳이 아니라, 이미 대화에서 실제로
    // 들은 적이 있는 내용만 다시 정리해서 보여주는 다이어리 개념이다.
    let mainStorySection = '';
    if(typeof MAIN_STORY_NPC_NAME_MAP!=='undefined' && typeof getMainStoryNpcSafeInfo==='function'){
      const mainStoryCards = [];
      Object.keys(MAIN_STORY_NPC_NAME_MAP).forEach(shortName => {
        const info = getMainStoryNpcSafeInfo(shortName);
        if(!info) return; // 만난 적 없거나 unknown/absent 단계 — 완전히 숨김
        const statusLabel = { hidden:'🔒 비밀 미공개', first:'🆕 첫 접점', active:'💬 진행 중', revealed:'💡 진실 공개', hostile:'⚔️ 대립', ally:'🤝 동맹', climax:'🔥 절정' };
        mainStoryCards.push(`<div style="padding:11px 12px;background:#0d0a06;border:1px solid #c8a96e44;margin-bottom:7px;border-radius:3px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
            <span style="font-size:11px;color:var(--text);font-weight:600">${esc(shortName)}</span>
            <span style="font-size:8px;color:#c8a96e;margin-left:auto;border:1px solid #c8a96e66;padding:1px 5px;border-radius:8px">메인 스토리</span>
          </div>
          <div style="font-size:9px;color:#e0c060;margin-bottom:4px">${statusLabel[info.status]||info.status}</div>
          <div style="font-size:9px;color:var(--text);line-height:1.5;opacity:0.85">${esc(info.note)}</div>
        </div>`);
      });
      if(mainStoryCards.length){
        mainStorySection = `<div style="font-size:10px;color:var(--dim);margin:4px 0 8px;letter-spacing:0.5px">━━ 핵심 인물 ━━</div>` + mainStoryCards.join('');
      }
    }

    // 플레이어가 실제로 만난(이름이 NPC 목록에 등록된) 인물만 표시 —
    // 만나지 않은 인물을 미리 노출하면 스포일러가 되므로 숨긴다.
    const met = allFigures.filter(f => knownNames.has(f.name));
    if(!met.length && !mainStorySection){
      return '<div style="text-align:center;padding:30px;color:var(--dim);font-size:11px">아직 만난 세계 인물이 없습니다.<br>여행하며 다양한 인물들을 만나보세요.</div>';
    }

    const catColor = { 신분:'#a09060', 종족:'#7adf9a', 세력:'#c08070', 대륙:'#6ab4e8', 직업:'#d4a0c8' };

    const worldFigureCards = met.map(npc => {
      const color = catColor[npc._category] || '#c8a96e';
      const total = Array.isArray(npc.questChain) ? npc.questChain.length : 0;
      const cur = Math.min(stages[npc.id]||0, total);
      const pct = total ? Math.round((cur/total)*100) : 0;
      const curStageText = total ? npc.questChain[Math.max(0,cur-1)] || npc.questChain[0] : '';
      return `<div style="padding:11px 12px;background:#090600;border:1px solid ${color}44;margin-bottom:7px;border-radius:3px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
          <span style="font-size:14px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(npc,{size:14}):(npc.icon||"👤")}</span>
          <span style="font-size:11px;color:var(--text);font-weight:600">${esc(npc.name)}</span>
          <span style="font-size:8px;color:${color};margin-left:auto;border:1px solid ${color}66;padding:1px 5px;border-radius:8px">${npc._category}</span>
        </div>
        <div style="font-size:9px;color:var(--dim);margin-bottom:6px">${esc(npc.title||'')}</div>
        ${total ? `
        <div style="background:#1a1008;border-radius:3px;height:6px;overflow:hidden;margin-bottom:4px">
          <div style="width:${pct}%;height:100%;background:${color};transition:width .3s"></div>
        </div>
        <div style="font-size:8px;color:var(--dim);text-align:right;margin-bottom:5px">${cur}/${total}단계${cur>=total?' (완결)':''}</div>
        <div style="font-size:9px;color:var(--text);line-height:1.5;opacity:0.85">${cur>0 ? esc(curStageText) : '아직 이야기가 시작되지 않았습니다.'}</div>
        ${cur<total ? `<button onclick="advanceNpcStoryStage('${npc.id}');renderPanel('worldfigures')" style="margin-top:7px;width:100%;padding:5px;font-size:9px;background:#1a1008;border:1px solid ${color}66;color:${color};border-radius:3px;cursor:pointer">📖 이야기 진전(수동)</button>` : ''}
        ` : ''}
      </div>`;
    }).join('');

    const worldFigureHeader = met.length ? `<div style="font-size:10px;color:var(--dim);margin:12px 0 8px;letter-spacing:0.5px">━━ 세계 인물 ━━</div>` : '';

    return mainStorySection + worldFigureHeader + worldFigureCards;
  }catch(e){
    console.warn('[renderWorldFigures]', e);
    return '<div style="text-align:center;padding:20px;color:var(--dim);font-size:10px">인물록을 불러오는 중 오류가 발생했습니다.</div>';
  }
}
window.renderWorldFigures = renderWorldFigures;

window.renderWorldFigures = renderWorldFigures;

export function renderFactionNewsBulletin(){
  const queue = loadFactionNewsQueue();
  if(!queue.length) return '<div style="font-size:10px;color:var(--dim);text-align:center;padding:12px">세력 관련 소식이 없습니다</div>';

  // 읽음 처리
  const updated = queue.map(n=>({...n, read:true}));
  saveFactionNewsQueue(updated);

  const typeIcon = { war:'⚔️', alliance:'🤝', conflict:'💥', 'alliance→war':'🔥', 'war→friendly':'🕊️', 'friendly→alliance':'🤝', news:'📰' };
  const typeColor = { war:'#e05050', alliance:'#50c080', conflict:'#e08030', 'alliance→war':'#e05050', 'war→friendly':'#50c0a0', news:'#c8a96e' };

  return queue.map(n=>{
    const icon = typeIcon[n.type] || '📰';
    const color = typeColor[n.type] || '#c8a96e';
    const turnStr = n.turn ? `${n.turn}턴` : '';
    return `<div style="padding:9px 11px;background:#090600;border:1px solid ${color}44;margin-bottom:5px;border-radius:2px${n.read?'':';border-left:2px solid '+color}">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
        <span>${typeof getEntityIconHTML==='function'?getEntityIconHTML({name:icon, icon},{size:14}):icon}</span>
        <span style="font-size:8px;color:${color};font-family:Cinzel,serif;letter-spacing:1px">${n.type.toUpperCase()}</span>
        ${turnStr?`<span style="font-size:8px;color:var(--dim);margin-left:auto">${turnStr}</span>`:''}
      </div>
      <div style="font-size:10px;color:var(--text);line-height:1.55">${typeof decorateEmojiIcons==='function'?decorateEmojiIcons(esc(n.msg)):esc(n.msg)}</div>
    </div>`;
  }).join('');
}
window.renderFactionNewsBulletin = renderFactionNewsBulletin;
