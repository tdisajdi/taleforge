// NPC 소문 & 계급별 정보 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { loadTitles } from '../job/010-스킬-강화-시스템.js';
import { esc } from '../utils.js';
import { getCurrentFactions, getSimTension, loadFactionNewsQueue, loadFactionSim } from './067-③-NPC-관계망-시스템.js';

export function getRumorChannels(){
  const rank = S.character?.rank || '';
  const role = S.character?.role || '';
  const titles = (loadTitles()||[]).map(t=>t.name||'').join(' ');
  const combined = (rank+' '+role+' '+titles).toLowerCase();
  const channels = [];

  // 누구나 — 길거리/술집 소문
  channels.push({ id:'street', label:'길거리 소문', icon:'🗣️', color:'#8a9a8a',
    desc:'술집·시장·감옥·뒷골목 어디서든 떠도는 소문' });

  // 뒷골목 — 노예·죄수·무법자·도적·방랑자
  if(/노예|죄수|무법자|도적|도둑|거지|부랑자|탈옥|방랑자/.test(combined)){
    channels.push({ id:'underground', label:'뒷골목 정보', icon:'🌑', color:'#9a7a4a',
      desc:'뒷골목 정보상·탈옥수·지하조직이 아는 소문' });
  }

  // 상인 정보망
  if(/상인|행상|길드|여관|무역|장사|상단/.test(combined)){
    channels.push({ id:'merchant', label:'상인 정보망', icon:'📦', color:'#6a9a6a',
      desc:'교역로·물가 변동으로 읽는 전황' });
  }

  // 군사 보고
  if(/기사|병사|군인|용병|전사|경비|장교/.test(combined)){
    channels.push({ id:'military', label:'기사단 보고', icon:'⚔️', color:'#5a80d0',
      desc:'교전 지역·병력 이동·전선 현황' });
  }

  // 귀족 첩보망
  if(/귀족|백작|자작|남작|장군|사령관|총독|대신관|대마법사|길드마스터/.test(combined)){
    channels.push({ id:'noble', label:'귀족 첩보망', icon:'🔍', color:'#a060c0',
      desc:'세력 전력·동맹 협상·비밀 외교' });
  }

  // 왕실 기밀
  if(/왕|황제|여왕|국왕|대왕|영주|공작|후작/.test(combined)){
    channels.push({ id:'royal', label:'왕실 기밀', icon:'📜', color:'#c8a96e',
      desc:'전체 세력 시뮬레이션·기밀 첩보' });
  }

  // 신전 정보망
  if(/신관|사제|수도사|성직자|수녀|주교/.test(combined)){
    channels.push({ id:'clergy', label:'신전 정보망', icon:'⛪', color:'#c0a050',
      desc:'각지 신전 네트워크·민심·재난 소문' });
  }

  return channels;
}
window.getRumorChannels = getRumorChannels;

export function getChannelNews(channelId){
  const queue = loadFactionNewsQueue ? loadFactionNewsQueue() : [];
  // [B50 FIX] 여기도 구버전 필드명(sim.factions/sim.tensions)을 참조해
  // 세력 뉴스 조회가 항상 빈 결과였던 버그. 실제 저장/조회 함수로 교체.
  const sim = (typeof loadFactionSim==='function') ? loadFactionSim() : {relations:{}};
  const factionsMap = (typeof getCurrentFactions==='function') ? getCurrentFactions() : {};
  const names = Object.keys(factionsMap);
  const wars=[], conflicts=[], alliances=[];
  for(let i=0;i<names.length;i++){
    for(let j=i+1;j<names.length;j++){
      const a=names[i],b=names[j];
      const t = getSimTension(sim, a, b);
      if(t>=90) wars.push(a+' vs '+b);
      else if(t>=70) conflicts.push(a+' ↔ '+b);
      else if(t<=20) alliances.push(a+' ↔ '+b);
    }
  }
  const recent = queue.slice(0,3).map(n=>n.msg);

  // [19차 감사 FIX] military/noble/royal 분기가 어디서도 선언된 적 없는
  // 맨 전역 변수 factions를 참조해 이 세 채널을 열람하면 항상
  // ReferenceError로 renderNpcRumorPanel() 전체가 죽던 버그. factionsMap과
  // 이미 계산해둔 wars/getSimTension으로 세력별 요약 배열을 실제로 만든다.
  const factions = names.map(name=>{
    const def = factionsMap[name] || {};
    const atWar = wars.some(w=>w.split(' vs ').includes(name));
    let tension = 0;
    for(const other of names){
      if(other===name) continue;
      const t = getSimTension(sim, name, other);
      if(t>tension) tension = t;
    }
    return { name, power: def.influence||0, atWar, tension };
  });

  if(channelId==='street'){
    if(!recent.length) return '별다른 소문이 없다.';
    return '"'+recent[0].slice(0,50)+'..." 라는 소문이 떠돌고 있다.'
      +(wars.length?'\n전쟁이 났다는 소식도 들린다. '+wars[0]:'');
  }
  if(channelId==='underground'){
    return (recent.length?'뒷골목 정보상이 귓속말로:\n'+recent.join('\n'):'특별한 움직임은 없다.')
      +(wars.length?'\n군대가 움직이고 있다. 탈영병들이 도시로 흘러들고 있어.':'');
  }
  if(channelId==='merchant'){
    return (recent.length?'교역 현황:\n'+recent.join(' / '):'교역로에 변화 없음.')
      +(wars.length?'\n'+wars.join(', ')+' 전쟁으로 물가 급등 중.':'');
  }
  if(channelId==='military'){
    return '기사단 보고:\n'+(wars.length?'교전: '+wars.join(', '):'전면전 없음.')
      +(conflicts.length?'\n긴장: '+conflicts.join(', '):'')
      +(factions.length?'\n긴장도: '+factions.map(f=>f.name+'('+( f.tension||0)+')').join(', '):'');
  }
  if(channelId==='noble'){
    const detail=factions.map(f=>f.name+': 전력'+(f.power||0)+(f.atWar?', ⚔️교전':'')).join(' | ');
    return '귀족 첩보:\n'+detail+(alliances.length?'\n동맹: '+alliances.join(', '):'')
      +(recent.length?'\n최근: '+recent[0]:'');
  }
  if(channelId==='royal'){
    const history=(sim.history||[]);
    return '왕실 기밀:\n'+(history.length?history.map((h,i)=>(i+1)+'. '+h.msg).join('\n'):'기록 없음')
      +'\n전체: '+factions.map(f=>f.name+'(전력:'+(f.power||0)+')').join(' / ');
  }
  if(channelId==='clergy'){
    return '신전 정보:\n'+(recent.length?recent.join('\n'):'이상 없음.')
      +(wars.length?'\n'+wars.join(', ')+' 전쟁으로 부상자·피난민이 신전으로 몰리고 있음.':'');
  }
  return '정보 없음';
}
window.getChannelNews = getChannelNews;

export function renderNpcRumorPanel(){
  const channels = getRumorChannels();
  const queue = loadFactionNewsQueue ? loadFactionNewsQueue() : [];
  const unread = queue.filter(n=>!n.read).length;

  let html = '<div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">🗣️ 소문 & 첩보</div>'
    +'<div style="font-size:9px;color:var(--dim);margin-bottom:10px">'
    +(S.character?.role||'방랑자')+'의 처지에서 접근 가능한 정보 채널'
    +(unread>0?'<span style="color:#e05050;margin-left:6px">새 소식 '+unread+'건</span>':'')
    +'</div>';

  for(const ch of channels){
    const news = getChannelNews(ch.id);
    html += '<div style="padding:10px 12px;background:#090600;border:1px solid '+ch.color+'44;margin-bottom:7px;border-radius:2px;border-left:2px solid '+ch.color+'88">'
      +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
      +'<span>'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(ch,{size:14}):(ch?.icon))+'</span>'
      +'<span style="font-family:Cinzel,serif;font-size:9px;color:'+ch.color+';letter-spacing:1px">'+ch.label+'</span>'
      +'</div>'
      +'<div style="font-size:9px;color:var(--dim);margin-bottom:5px;font-style:italic">'+ch.desc+'</div>'
      +'<div style="font-size:10px;color:var(--text);line-height:1.6;white-space:pre-line">'+esc(news)+'</div>'
      +'</div>';
  }

  if(channels.length <= 1){
    html += '<div style="margin-top:8px;padding:8px 10px;background:#0a0804;border:1px dashed #2a2010;border-radius:2px;font-size:9px;color:var(--dim)">💡 직업·신분·칭호에 따라 더 많은 정보 채널이 열립니다</div>';
  }

  return html;
}
window.renderNpcRumorPanel = renderNpcRumorPanel;
