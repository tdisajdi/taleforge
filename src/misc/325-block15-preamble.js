// block15-preamble
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { closeGrp } from '../patches/183-v49-⑥-onclick-연결됐지만-정의-없던-함수들.js';
import { applyDemesneStats, calcDemesneResources, loadDemesne, saveDemesne } from '../race/260-수인족-패널-렌더.js';
import { toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { renderPoliticalMapPanel } from '../world/315-⑥-대륙-정치-지도.js';

(function WorldSettlementIntegration(){
'use strict';
const _lsG=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const _lsS=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
const _toast=(m,ms)=>{if(typeof toast==='function')toast(m,ms||3200);};
const _inj=t=>{if(S&&S._nextInjectedContext!==undefined)S._nextInjectedContext=(S._nextInjectedContext||'')+t;};
const _turn=()=>S&&S.msgCount||0;
const _gold=()=>S&&S.gold||0;
const _spend=n=>{S.gold=Math.max(0,_gold()-n);if(typeof saveGold==='function')saveGold(S.gold);if(typeof window.updateHeader==='function')window.updateHeader();};
const _gain=n=>{S.gold=(_gold())+n;if(typeof saveGold==='function')saveGold(S.gold);if(typeof window.updateHeader==='function')window.updateHeader();};
const _esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const _curLoc=()=>{try{return typeof loadCurrentLocation==='function'?loadCurrentLocation():null;}catch(e){return null;}};
const WSI_KEY='tf-world-settlements';
const loadWSI=()=>{try{return JSON.parse(_lsG(WSI_KEY)||'{}');}catch(e){return {};}};
const saveWSI=d=>{try{_lsS(WSI_KEY,JSON.stringify(d));}catch(e){}};
window._WSI_load=loadWSI; window._WSI_save=saveWSI;

const TYPE_DEFAULTS={
  capital: {pop:50000,prosperity:70,defense:80,tax:65,loyalty:60,icon:'🏰'},
  city:    {pop:15000,prosperity:60,defense:60,tax:55,loyalty:55,icon:'🏙️'},
  town:    {pop:4000, prosperity:50,defense:45,tax:45,loyalty:60,icon:'🏘️'},
  village: {pop:500,  prosperity:40,defense:30,tax:35,loyalty:65,icon:'🏚️'},
  hamlet:  {pop:80,   prosperity:30,defense:20,tax:25,loyalty:70,icon:'🛖'},
  special: {pop:2000, prosperity:55,defense:50,tax:40,loyalty:50,icon:'✨'},
  shrine:  {pop:300,  prosperity:45,defense:35,tax:30,loyalty:75,icon:'⛩️'},
  dungeon: {pop:0,    prosperity:10,defense:70,tax:0, loyalty:20,icon:'🗝️'},
};
const CONTROL_LABELS=['무관계','우호','동맹','보호령','지배','합병'];
const CONTROL_COLORS=['#5a5a5a','#4a8a4a','#4a6aaa','#a0a030','#c08020','#e0b840'];
const FACTION_COLORS={'왕국 귀족':'#d4a030','왕국 기사단':'#4a6fa5','교회':'#c8a96e','상인 조합':'#27ae60','도적 길드':'#2c3e50','암흑 결사':'#e74c3c','마법사 협회':'#8e44ad','민중 반란군':'#c0392b','독립':'#60c060','무주공산':'#5a5a5a','플레이어':'#e0b840'};
const _fmtP=p=>{if(p>=10000)return (p/10000).toFixed(1)+'만';if(p>=1000)return (p/1000).toFixed(1)+'천';return ''+p;};

function initSettlement(locId,locDef){
  const wsi=loadWSI();
  if(wsi[locId])return wsi[locId];
  const td=TYPE_DEFAULTS[locDef.type]||TYPE_DEFAULTS.village;
  let ruler='독립';
  const nd=(locDef.name||'')+(locDef.desc||'')+(locDef.lore||'');
  if(/왕도|왕궁|왕성|왕실|수도/.test(nd))ruler='왕국 귀족';
  else if(/기사|요새|병영|수비대|군사/.test(nd))ruler='왕국 기사단';
  else if(/성도|신전|성당|교회|성소/.test(nd))ruler='교회';
  else if(/교역|상인|시장|항구|무역/.test(nd))ruler='상인 조합';
  else if(/해적|암흑|도적|범죄/.test(nd))ruler='도적 길드';
  else if(/마법|학문|마탑|연구/.test(nd))ruler='마법사 협회';
  const s={locId,name:locDef.name,type:locDef.type||'village',continent:locDef.continent||'central',
    population:td.pop,prosperity:td.prosperity,defense:td.defense,tax:td.tax,loyalty:td.loyalty,
    ruler,playerInfluence:0,controlLevel:0,investments:{},events:[],history:[],lastTick:_turn(),established:_turn()};
  wsi[locId]=s; saveWSI(wsi); return s;
}
window.initSettlement=initSettlement;

// ── 행동 정의 ──
const WSI_ACTIONS={
  invest_prosperity:{label:'번영 투자',icon:'💰',cost:200,desc:'상인·장인에게 투자해 도시 경제를 키운다.',
    effect:s=>{s.prosperity=Math.min(100,s.prosperity+8);s.playerInfluence=Math.min(100,s.playerInfluence+10);s.population=Math.floor(s.population*1.03);},
    hint:s=>`${s.name}에 경제 투자가 이뤄져 시장이 활기차다.`},
  invest_defense:{label:'방어 지원',icon:'🛡️',cost:250,desc:'성벽 보수·용병 고용으로 도시 방어를 강화한다.',
    effect:s=>{s.defense=Math.min(100,s.defense+10);s.playerInfluence=Math.min(100,s.playerInfluence+8);},
    hint:s=>`${s.name}의 성벽이 강화됐다.`},
  build_road:{label:'도로 건설',icon:'🛤️',cost:300,desc:'영지와 연결하는 도로를 건설해 교역을 활성화한다.',
    effect:s=>{s.prosperity=Math.min(100,s.prosperity+5);s.tax=Math.min(100,s.tax+5);s.playerInfluence=Math.min(100,s.playerInfluence+12);},
    hint:s=>`${s.name}으로 이어지는 새 도로가 완공됐다.`},
  aid_people:{label:'민중 지원',icon:'🌾',cost:150,desc:'식량·의약품을 나눠 민심을 얻는다.',
    effect:s=>{s.loyalty=Math.min(100,s.loyalty+12);s.playerInfluence=Math.min(100,s.playerInfluence+15);},
    hint:s=>`${s.name}의 민중이 플레이어의 선행에 감사한다.`},
  propose_alliance:{label:'동맹 제안',icon:'🤝',cost:400,desc:'도시 지도자에게 공식 동맹을 제안한다.',reqInf:30,
    effect:s=>{s.controlLevel=Math.max(s.controlLevel,2);s.playerInfluence=Math.min(100,s.playerInfluence+20);},
    hint:s=>`${s.name}이(가) 플레이어와 공식 동맹을 맺었다.`},
  establish_protectorate:{label:'보호령 선포',icon:'⚜️',cost:800,desc:'도시를 보호령으로 선포해 간접 지배한다.',reqInf:60,reqCtrl:2,
    effect:s=>{s.controlLevel=3;s.ruler='플레이어';s.playerInfluence=Math.min(100,s.playerInfluence+15);},
    hint:s=>`${s.name}이(가) 플레이어의 보호령이 됐다.`},
  annex:{label:'합병·직할',icon:'🏰',cost:1500,desc:'도시를 영지에 직접 합병해 완전 지배한다.',reqInf:80,reqCtrl:3,
    effect:s=>{s.controlLevel=5;s.ruler='플레이어';_mergeCity(s);},
    hint:s=>`${s.name}이(가) 플레이어의 영지에 합병됐다!`},
  collect_tribute:{label:'세금 징수',icon:'💎',cost:0,desc:'지배 도시에서 세금을 징수한다.',reqCtrl:3,
    effect:s=>{const amt=Math.floor(s.tax*0.4*(s.controlLevel/5)*(TYPE_DEFAULTS[s.type]&&TYPE_DEFAULTS[s.type].pop||1000)/200);_gain(amt);s.loyalty=Math.max(0,s.loyalty-3);s.history.push({turn:_turn(),label:'세금 징수 +'+amt+'G'});_toast('💎 '+s.name+' 세수: +'+amt+'G',2500);},
    hint:s=>`플레이어의 세리가 ${s.name}에서 세금을 걷었다.`},
  liberate:{label:'해방 선언',icon:'🕊️',cost:0,desc:'지배를 해제하고 자치를 허용해 민심을 크게 얻는다.',reqCtrl:3,
    effect:s=>{s.controlLevel=1;s.ruler='독립';s.loyalty=Math.min(100,s.loyalty+25);s.playerInfluence=Math.min(100,s.playerInfluence+10);},
    hint:s=>`${s.name}이(가) 자유를 되찾았다!`},
  port_trade:{label:'항구 무역 독점',icon:'⚓',cost:500,desc:'항구 도시의 무역 이권을 독점 계약한다.',nameRx:/항구|항만|포트|해적|해안|어촌|bay|harbor/i,
    effect:s=>{s.tax=Math.min(100,s.tax+15);s.playerInfluence=Math.min(100,s.playerInfluence+20);},
    hint:s=>`${s.name} 항구의 무역 이권이 플레이어 수중에 들어왔다.`},
  garrison:{label:'수비대 주둔',icon:'⚔️',cost:350,desc:'요새 도시에 직속 수비대를 배치한다.',nameRx:/요새|기지|성채|fortress|garrison/i,
    effect:s=>{s.defense=Math.min(100,s.defense+15);s.playerInfluence=Math.min(100,s.playerInfluence+15);s.controlLevel=Math.max(s.controlLevel,1);},
    hint:s=>`${s.name}에 플레이어의 수비대가 배치됐다.`},
  scholarly:{label:'학술 후원',icon:'📚',cost:400,desc:'학문 도시의 연구자들을 후원해 기술 이점을 얻는다.',nameRx:/학문|학술|마법|연구|도서관|magic|academy/i,
    effect:s=>{s.prosperity=Math.min(100,s.prosperity+10);s.playerInfluence=Math.min(100,s.playerInfluence+18);},
    hint:s=>`${s.name}의 학자들이 플레이어를 후원자로 인정했다.`},
  donation:{label:'성전 봉헌',icon:'⛪',cost:300,desc:'성지·신전에 기부해 종교 세력의 지지를 얻는다.',nameRx:/성도|신전|성당|교회|성소|shrine|holy|temple/i,
    effect:s=>{s.loyalty=Math.min(100,s.loyalty+15);s.playerInfluence=Math.min(100,s.playerInfluence+20);},
    hint:s=>`${s.name}의 성직자들이 플레이어를 칭송한다.`},
  mine_contract:{label:'광산 채굴 계약',icon:'⛏️',cost:200,desc:'광산 마을과 독점 채굴 계약을 맺어 자원을 확보한다.',nameRx:/광산|광부|채굴|mine|ore|silver|iron/i,
    effect:s=>{s.tax=Math.min(100,s.tax+10);s.playerInfluence=Math.min(100,s.playerInfluence+12);_gain(100);},
    hint:s=>`${s.name}의 광부들과 독점 계약이 성사됐다.`},
};

function _mergeCity(s){
  try{
    const d=typeof loadDemesne==='function'?loadDemesne():null;
    if(!d||!d.established)return;
    d.population=(d.population||500)+Math.floor((s.population||0)*0.3);
    d.prosperity=Math.min(100,(d.prosperity||50)+Math.floor(s.prosperity*0.1));
    d.defense=Math.min(100,(d.defense||50)+Math.floor(s.defense*0.05));
    d.tax=Math.min(100,(d.tax||50)+Math.floor(s.tax*0.08));
    if(typeof saveDemesne==='function')saveDemesne(d);
    if(typeof applyDemesneStats==='function')applyDemesneStats();
    const d5=typeof loadD5==='function'?loadD5():null;
    if(d5){d5.renown=Math.min(200,(d5.renown||0)+20);if(typeof saveD5==='function')saveD5(d5);}
  }catch(e){}
}

function getActions(s){
  return Object.entries(WSI_ACTIONS).filter(([,a])=>{
    if(a.reqInf&&s.playerInfluence<a.reqInf)return false;
    if(a.reqCtrl&&s.controlLevel<a.reqCtrl)return false;
    if(a.nameRx&&!a.nameRx.test(s.name||''))return false;
    return true;
  });
}

function executeWSIAction(locId,actionId){
  const wsi=loadWSI();
  let s=wsi[locId];
  if(!s){
    const all=typeof window.getAllLocations==='function'?window.getAllLocations():[];
    const ld=all.find(l=>l.id===locId);
    if(!ld){_toast('장소 정보 없음');return;}
    s=initSettlement(locId,ld);
  }
  const entry=WSI_ACTIONS[actionId];if(!entry)return;
  if(entry.cost>0&&_gold()<entry.cost){_toast('골드 부족 ('+entry.cost+'G 필요)');return;}
  if(entry.reqInf&&s.playerInfluence<entry.reqInf){_toast('영향력 부족 ('+entry.reqInf+' 필요)');return;}
  if(entry.reqCtrl&&s.controlLevel<entry.reqCtrl){_toast(CONTROL_LABELS[entry.reqCtrl]+' 단계 이상 필요');return;}
  if(entry.cost>0)_spend(entry.cost);
  entry.effect(s);
  // 영향력→지배 자동 단계
  if(s.playerInfluence>=80&&s.controlLevel<4)s.controlLevel=Math.max(s.controlLevel,3);
  else if(s.playerInfluence>=50&&s.controlLevel<3)s.controlLevel=Math.max(s.controlLevel,2);
  else if(s.playerInfluence>=20&&s.controlLevel<2)s.controlLevel=Math.max(s.controlLevel,1);
  s.history=s.history||[];
  s.history.push({turn:_turn(),label:entry.icon+' '+entry.label,cost:entry.cost});
  wsi[locId]=s;saveWSI(wsi);
  _toast('✅ '+entry.icon+' '+entry.label+' 완료!'+(entry.cost?' (-'+entry.cost+'G)':''),3500);
  _inj(' ['+s.name+' 도시 행동: '+entry.hint(s)+' 영향력:'+s.playerInfluence+' 지배:'+CONTROL_LABELS[s.controlLevel]+' 지배세력:'+s.ruler+']');
  renderWSIPanel(locId);
}
window.executeWSIAction=executeWSIAction;

// ── 자연 틱 ──
function tickWSI(){
  const wsi=loadWSI();const now=_turn();let ch=false;
  Object.values(wsi).forEach(s=>{
    if(now-(s.lastTick||0)<5)return;
    s.lastTick=now;ch=true;
    if(s.prosperity>=60)s.population=Math.floor(s.population*1.01);
    else if(s.prosperity<25)s.population=Math.max(10,Math.floor(s.population*0.99));
    if(s.loyalty<50)s.loyalty=Math.min(50,s.loyalty+1);
    if(s.playerInfluence>0&&s.controlLevel<3)s.playerInfluence=Math.max(0,s.playerInfluence-1);
    if(s.controlLevel>=3&&s.ruler==='플레이어'){
      const inc=Math.floor(s.tax*0.2*(s.controlLevel/5));
      if(inc>0){_gain(inc);s.history.push({turn:now,label:'자동세수 +'+inc+'G'});}
    }
    try{
      const d=typeof loadDemesne==='function'?loadDemesne():null;
      if(d&&d.established&&d.prosperity>=70&&s.continent==='central')s.prosperity=Math.min(100,s.prosperity+1);
    }catch(e){}
  });
  if(ch)saveWSI(wsi);
}

// ── BLS ──
function getWSIBLS(){
  const wsi=loadWSI();
  const entries=Object.entries(wsi).filter(([,s])=>s.playerInfluence>10||s.controlLevel>0);
  if(!entries.length)return '';
  // 지배 단계 높은 순 정렬, 상위만 BLS 포함 (토큰 절약)
  const sorted=entries.sort((a,b)=>b[1].controlLevel-a[1].controlLevel);
  const dom=sorted.filter(([,s])=>s.controlLevel>=3).slice(0,5);
  const ally=sorted.filter(([,s])=>s.controlLevel===2).slice(0,3);
  const fri=sorted.filter(([,s])=>s.controlLevel===1).slice(0,3);
  const restCount=Math.max(0,entries.length-dom.length-ally.length-fri.length);
  let b='\n[🌍 도시영향권]';
  if(dom.length)b+=' 지배:'+dom.map(([,s])=>s.name+'(인구'+_fmtP(s.population||0)+')').join('·');
  if(ally.length)b+=' 동맹:'+ally.map(([,s])=>s.name).join('·');
  if(fri.length)b+=' 우호:'+fri.map(([,s])=>s.name).join('·');
  if(restCount>0)b+=' 외'+restCount+'곳';
  const cur=_curLoc();
  if(cur&&wsi[cur.id]){
    const cs=wsi[cur.id];
    b+='\n[현재:'+cs.name+'] 번영'+cs.prosperity+'/방어'+cs.defense+'/민심'+cs.loyalty+'/지배:'+cs.ruler+'/영향력:'+cs.playerInfluence+'('+CONTROL_LABELS[cs.controlLevel]+') — 묘사에 반영하라.';
  }
  return b;
}
window.getWSIBLS=getWSIBLS;

// ── 패널 렌더 ──
function renderWSIPanel(locId){
  const body=document.getElementById('pb-wsi-panel');if(!body)return;
  const wsi=loadWSI();let s=wsi[locId];
  if(!s){
    const all=typeof window.getAllLocations==='function'?window.getAllLocations():[];
    const ld=all.find(l=>l.id===locId)||{id:locId,name:locId,type:'village',continent:'central'};
    s=initSettlement(locId,ld);
  }
  const cl=s.controlLevel||0;
  const cc=CONTROL_COLORS[cl]||'#5a5a5a';
  const fc=FACTION_COLORS[s.ruler]||'#aaa';
  const td=TYPE_DEFAULTS[s.type]||TYPE_DEFAULTS.village;
  const avail=getActions(s);
  let h='<div style="padding:10px 12px">';
  // 헤더
  h+='<div style="padding:10px;background:linear-gradient(135deg,#080d00,#101800);border:1px solid '+cc+'55;border-radius:3px;margin-bottom:10px">';
  h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
  h+='<span style="font-size:22px">'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(td,{size:14}):(td?.icon))+'</span>';
  h+='<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:12px;color:'+cc+'">'+_esc(s.name)+'</div>';
  h+='<div style="font-size:8px;color:var(--dim)">'+s.type+' · '+s.continent+'</div></div>';
  h+='<div style="text-align:right"><div style="font-family:Cinzel,serif;font-size:10px;color:'+cc+'">'+CONTROL_LABELS[cl]+'</div>';
  h+='<div style="font-size:8px;color:'+fc+'">지배: '+_esc(s.ruler)+'</div></div></div>';
  // 수치 바
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:7px">';
  [['👥','인구',_fmtP(s.population||0),Math.min(100,Math.round((s.population||0)/(td.pop||500)*100)),'#c8a040'],
   ['🌟','번영',s.prosperity+'%',s.prosperity,'#60c060'],
   ['🛡️','방어',s.defense+'%',s.defense,'#4080e0'],
   ['❤️','민심',s.loyalty+'%',s.loyalty,'#e06060'],
  ].forEach(([ic,lb,val,raw,col])=>{
    h+='<div style="padding:5px;background:#050a00;border:1px solid #1a2a00;border-radius:2px">';
    h+='<div style="display:flex;justify-content:space-between;font-size:8px;margin-bottom:2px"><span style="color:var(--dim)">'+ic+' '+lb+'</span><span style="color:'+col+'">'+val+'</span></div>';
    h+='<div style="height:3px;background:#030500;border-radius:2px;overflow:hidden"><div style="width:'+Math.min(100,raw)+'%;height:100%;background:'+col+';border-radius:2px"></div></div></div>';
  });
  h+='</div>';
  // 영향력 바
  h+='<div style="margin-bottom:4px"><div style="display:flex;justify-content:space-between;font-size:8px;margin-bottom:2px"><span style="color:#a0c040">플레이어 영향력</span><span style="color:#a0c040">'+s.playerInfluence+'/100</span></div>';
  h+='<div style="height:6px;background:#030500;border-radius:3px;overflow:hidden"><div style="width:'+s.playerInfluence+'%;height:100%;background:linear-gradient(90deg,#406020,#80c040);border-radius:3px"></div></div></div>';
  // 지배 단계 바
  h+='<div style="display:flex;gap:3px;margin-top:5px">'+CONTROL_LABELS.map((lb,i)=>'<div style="flex:1;height:5px;background:'+(i<=cl?CONTROL_COLORS[i]:'#1a1a1a')+';border-radius:2px" title="'+lb+'"></div>').join('')+'</div>';
  h+='<div style="font-size:7px;color:var(--dim);margin-top:2px;text-align:center">'+CONTROL_LABELS.join(' → ')+'</div>';
  h+='</div>';
  // 행동 버튼
  h+='<div style="font-family:Cinzel,serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:6px">── 행동 선택 ──</div>';
  if(avail.length===0)h+='<div style="font-size:9px;color:var(--dim);text-align:center;padding:12px">사용 가능한 행동 없음<br><span style="font-size:8px">먼저 번영 투자·민중 지원으로 영향력을 쌓으세요.</span></div>';
  else avail.forEach(([aid,a])=>{
    const ok=a.cost===0||_gold()>=a.cost;
    h+='<button onclick="executeWSIAction(\"'+_esc(locId)+'\",\"'+aid+'\")\" style="width:100%;margin-bottom:3px;padding:8px 10px;background:'+(ok?'#050d00':'#080808')+';border:1px solid '+(ok?'#305020':'#1a1a1a')+';color:'+(ok?'#80c050':'#3a3a3a')+';font-size:9px;cursor:'+(ok?'pointer':'not-allowed')+';font-family:Cinzel,serif;border-radius:2px;text-align:left">';
    h+='<div style="display:flex;justify-content:space-between"><span>'+(typeof getEntityIconHTML==='function'?getEntityIconHTML(a,{size:14}):(a?.icon))+' '+a.label+'</span><span style="font-size:8px;color:'+(ok?'#60a030':'#2a2a2a')+'">'+(a.cost?'-'+a.cost+'G':'무료')+'</span></div>';
    h+='<div style="font-size:8px;color:var(--dim);margin-top:2px">'+_esc(a.desc)+'</div>';
    if(a.reqInf)h+='<div style="font-size:7px;color:'+(s.playerInfluence>=a.reqInf?'#60a030':'#a03030')+'">영향력 '+a.reqInf+'+ 필요</div>';
    h+='</button>';
  });
  // 내 영지 비교
  try{
    const d=typeof loadDemesne==='function'?loadDemesne():null;
    if(d&&d.established){
      const res=typeof calcDemesneResources==='function'?calcDemesneResources(d):{};
      h+='<div style="margin-top:10px;font-family:Cinzel,serif;font-size:9px;color:var(--gold);margin-bottom:6px">── 📊 내 영지 vs 이 도시 ──</div>';
      h+='<div style="background:#050a00;border:1px solid #1a2a00;border-radius:2px;padding:8px">';
      h+='<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:4px;font-size:8px;text-align:center">';
      h+='<div style="color:#c8a040;font-family:Cinzel,serif">내 영지</div><div></div><div style="color:#a0c040;font-family:Cinzel,serif">'+_esc(s.name)+'</div>';
      [['번영',res.prosperity||50,s.prosperity,'#60c060'],['방어',res.defense||50,s.defense,'#4080e0'],['세수',res.tax||50,s.tax,'#c8a040'],['민심',res.loyalty||50,s.loyalty,'#e06060']].forEach(([lb,mv,tv,col])=>{
        h+='<div style="color:'+col+'">'+mv+'</div><div style="color:var(--dim);font-size:7px">'+lb+'</div><div style="color:'+col+'">'+tv+'</div>';
      });
      h+='</div></div>';
    }
  }catch(e){}
  // 기록
  if(s.history&&s.history.length>0){
    h+='<div style="margin-top:10px;font-family:Cinzel,serif;font-size:9px;color:var(--gold);margin-bottom:4px">── 행동 기록 ──</div>';
    [...s.history].reverse().slice(0,8).forEach(rec=>{
      h+='<div style="display:flex;justify-content:space-between;font-size:8px;padding:3px 5px;background:#050a00;border-radius:2px;margin-bottom:2px"><span style="color:#80c040">'+_esc(rec.label)+'</span><span style="color:var(--dim)">턴'+rec.turn+'</span></div>';
    });
  }
  h+='</div>';
  body.innerHTML=h;
}
window.renderWSIPanel=renderWSIPanel;

// ── 패널 열기 ──
function openWSIPanel(locId){
  let panel=document.getElementById('p-wsi-panel');
  if(!panel){
    panel=document.createElement('div');panel.className='panel-ov';panel.id='p-wsi-panel';
    panel.innerHTML='<div class="panel"><div class="p-hdr"><span class="p-title" style="color:#a0c040">🌍 도시 관리</span><button class="p-close" onclick="closeP(&apos;wsi-panel&apos;)">✕</button></div><div class="p-body scrollable" id="pb-wsi-panel"></div></div>';
    document.body.appendChild(panel);
  }
  if(typeof window.openP==='function')window.openP('wsi-panel');
  renderWSIPanel(locId);
}
window.openWSIPanel=openWSIPanel;

// ── 지배 도시 목록 패널 ──
function renderControlledCitiesPanel(){
  const wsi=loadWSI();
  const ctrl=Object.entries(wsi).filter(([,s])=>s.controlLevel>=1).sort((a,b)=>b[1].controlLevel-a[1].controlLevel);
  let panel=document.getElementById('p-wsi-cities');
  if(!panel){
    panel=document.createElement('div');panel.className='panel-ov';panel.id='p-wsi-cities';
    panel.innerHTML='<div class="panel"><div class="p-hdr"><span class="p-title" style="color:#a0c040">🌍 영향권 도시</span><button class="p-close" onclick="closeP(&apos;wsi-cities&apos;)">✕</button></div><div class="p-body scrollable" id="pb-wsi-cities"></div></div>';
    document.body.appendChild(panel);
  }
  if(typeof window.openP==='function')window.openP('wsi-cities');
  const body=document.getElementById('pb-wsi-cities');if(!body)return;
  if(!ctrl.length){body.innerHTML='<div style="padding:20px;text-align:center;color:var(--dim);font-size:10px">아직 영향권 도시가 없습니다.<br>장소로 이동 후 "도시 관리" 버튼을 눌러보세요.</div>';return;}
  let h='<div style="padding:10px 12px">';
  const totalIncome=ctrl.filter(([,s])=>s.controlLevel>=3&&s.ruler==='플레이어').reduce((sum,[,s])=>sum+Math.floor(s.tax*0.2*(s.controlLevel/5)),0);
  if(totalIncome>0)h+='<div style="padding:7px 10px;background:#050a00;border:1px solid #2a5a10;border-radius:2px;margin-bottom:10px;font-size:9px;color:#80c040;text-align:center">💰 지배 도시 자동 세수: +'+totalIncome+'G/5턴</div>';
  ctrl.forEach(([locId,s])=>{
    const cc=CONTROL_COLORS[s.controlLevel]||'#5a5a5a';
    const inc=s.controlLevel>=3&&s.ruler==='플레이어'?Math.floor(s.tax*0.2*(s.controlLevel/5)):0;
    h+='<div style="padding:8px 10px;background:#050a00;border:1px solid '+cc+'44;border-radius:2px;margin-bottom:6px">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">';
    h+='<div><div style="font-family:Cinzel,serif;font-size:10px;color:'+cc+'">'+_esc(s.name)+'</div>';
    h+='<div style="font-size:8px;color:var(--dim)">'+s.type+' · '+CONTROL_LABELS[s.controlLevel]+'</div></div>';
    h+='<div style="text-align:right"><div style="font-size:9px;color:#a0c040">영향력 '+s.playerInfluence+'</div>'+(inc?'<div style="font-size:8px;color:#c8a040">+'+inc+'G/5턴</div>':'')+'</div></div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:3px;margin-bottom:5px">';
    [['👥',_fmtP(s.population||0),'인구'],['🌟',s.prosperity,'번영'],['🛡️',s.defense,'방어'],['❤️',s.loyalty,'민심']].forEach(([ic,v,l])=>{
      h+='<div style="text-align:center;padding:3px;background:#030700;border-radius:2px"><div style="font-size:9px">'+ic+'</div><div style="font-size:8px;color:var(--gold)">'+v+'</div><div style="font-size:7px;color:var(--dim)">'+l+'</div></div>';
    });
    h+='</div>';
    h+='<button onclick="openWSIPanel(&apos;'+_esc(locId)+'&apos;)" style="width:100%;padding:5px;background:#0a1200;border:1px solid '+cc+'66;color:'+cc+';font-size:8px;cursor:pointer;font-family:Cinzel,serif;border-radius:2px">관리 열기</button>';
    h+='</div>';
  });
  h+='</div>';
  body.innerHTML=h;
}
window.renderControlledCitiesPanel=renderControlledCitiesPanel;

// ── 위치 패널에 버튼 주입 ──
function injectWSIBtn(){
  const lb=document.getElementById('pb-location');if(!lb)return;
  if(lb.querySelector('#wsi-loc-btn'))return;
  const loc=_curLoc();if(!loc||!loc.id)return;
  if(loc.type==='battlefield')return; // 전장만 제외, 던전/AI장소 포함
  const btn=document.createElement('button');
  btn.id='wsi-loc-btn';
  btn.style.cssText='width:100%;margin-top:8px;padding:9px;background:linear-gradient(135deg,#0a0d00,#141a00);border:1px solid #6a8a20;color:#a0c040;font-family:Cinzel,serif;font-size:10px;cursor:pointer;border-radius:2px;letter-spacing:.5px';
  btn.innerHTML='🌍 도시 관리 & 영향력';
  btn.onclick=()=>{
    const wsi=loadWSI();
    if(!wsi[loc.id]){const all=typeof window.getAllLocations==='function'?window.getAllLocations():[];const ld=all.find(l=>l.id===loc.id)||loc;initSettlement(loc.id,ld);}
    openWSIPanel(loc.id);
  };
  lb.appendChild(btn);
}

// ── 영지 패널 버튼에 도시 탭 추가 ──
function injectCitiesShortcut(){
  if(window._wsiShortcutInjected)return;
  const demesneBtn=document.querySelector('button[onclick*="demesne"]');
  if(!demesneBtn||!demesneBtn.parentElement)return;
  if(demesneBtn.parentElement.querySelector('#wsi-cities-shortcut'))return;
  window._wsiShortcutInjected=true;
  const btn=document.createElement('button');
  btn.id='wsi-cities-shortcut';btn.className='grp-sub-btn';btn.style.color='#80c040';
  btn.innerHTML='<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:3px;vertical-align:-1px"><circle cx="8" cy="8" r="5"/><path d="M4 8 Q8 4 12 8 Q8 12 4 8" stroke-width="1"/><path d="M8 3 L8 13" stroke-width="0.8"/></svg>영향권도시';
  btn.onclick=()=>{renderControlledCitiesPanel();if(typeof closeGrp==='function')closeGrp();};
  demesneBtn.parentElement.insertBefore(btn,demesneBtn.nextSibling);
}

// ── 세계지도 패치 ──
function patchWorldMap(){
  if(window._wsiMapPatched)return;
  const check=()=>{
    if(typeof window.renderWorldMap!=='function'){setTimeout(check,1200);return;}
    window._wsiMapPatched=true;
    const orig=window.renderWorldMap;
    window.renderWorldMap=function(...args){
      let html=orig.apply(this,args);
      const wsi=loadWSI();
      Object.entries(wsi).forEach(([,s])=>{
        if(s.controlLevel<1&&s.playerInfluence<10)return;
        const cc=CONTROL_COLORS[s.controlLevel]||'#5a5a5a';
        const badge='<span style="font-size:7px;background:'+cc+'33;border:1px solid '+cc+'88;color:'+cc+';padding:1px 4px;border-radius:2px;margin-left:3px">'+CONTROL_LABELS[s.controlLevel]+'</span>';
        const ename=_esc(s.name||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        if(ename)html=html.replace(new RegExp('('+ename+')','g'),'$1'+badge);
      });
      return html;
    };
  };
  check();
}

// ── BLS 훅 ──
function hookBLS(){
  if(window._wsiBLSH)return;
  const c=()=>{
    if(typeof window.buildLightSystem!=='function'){setTimeout(c,800);return;}
    window._wsiBLSH=true;
    const o=window.buildLightSystem;
    window.buildLightSystem=function(...a){let r=o.apply(this,a);try{const h=getWSIBLS();if(h)r+=h;}catch(e){}return r;};
  };c();
}

// [버그 수정] 이 자리에 있던 hookSend는 window.sendMsg를 감싸는 방식이라
// (quest/086이 sendMsg를 로컬 바인딩으로 직접 호출해 재할당이 도달 못 함
// — 다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않아, 정착지 자동
// 등록·틱·도시 관리 버튼 주입·정치 지도 갱신이 전혀 작동하지 않았다.
// tickWSI/injectWSIBtn/injectCitiesShortcut을 quest/086의 sendMsg()
// 응답 후처리 블록에 네이티브로 옮겨 연결했다(그 안에서 현재 위치
// 정착지 자동 등록·정치 지도 갱신까지 함께 처리).
window.tickWSI = tickWSI;
window.injectWSIBtn = injectWSIBtn;
window.injectCitiesShortcut = injectCitiesShortcut;

function init(){
  hookBLS();patchWorldMap();
  setTimeout(()=>{injectWSIBtn();injectCitiesShortcut();},4000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else setTimeout(init,600);

window.WSI={loadWSI,saveWSI,initSettlement,executeWSIAction,renderWSIPanel,openWSIPanel,renderControlledCitiesPanel,getWSIBLS};
// [CRITICAL BUG FIX] loadWSI/saveWSI가 WorldSettlementIntegration IIFE 내부의
// 지역 변수라서 window.WSI.loadWSI()로만 접근 가능했음. 그런데 tickThrallDomainWSI
// 등 외부 코드는 typeof loadWSI==='function' (전역 식별자 체크)로 호출하고
// 있어서 항상 false가 되어 권속-도시 영향력 연동 전체가 처음부터 한 번도
// 작동하지 않고 있었음. 진짜 전역 별칭을 추가해 해결.
window.loadWSI = loadWSI;
window.saveWSI = saveWSI;
})();
