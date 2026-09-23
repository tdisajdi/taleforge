// 🗺️ renderMiniMap — 던전 미니맵 / 일반 미니맵
// Auto-extracted from taleforge.html (original section banner preserved above).
import { ELEMENT_DEFS } from '../data/035-NEW-직업-조합-시너지-시스템.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { DUNGEON_GRADES, UNDEAD_ACTION_TYPES, UNDEAD_CHAIN_TYPES, UNDEAD_DEATH_SIGHT_LEVELS } from '../data/257-renderMiniMap-던전-미니맵-일반-미니맵.js';
import { generateAIItem, generateItem } from '../items/006-세트-아이템-시스템.js';
import { saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { loadPlayerLevel } from '../job/008-클리어-보상-시스템-시나리오-클리어-시-영구-아이템스킬.js';
import { calcAffinityMod, getCharElement } from '../job/035-NEW-직업-조합-시너지-시스템.js';
import { gainExpFromAction } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { onDungeonClear } from '../misc/016-2130번-시스템.js';
import { getPlayerMaxHp, loadLocations } from '../misc/054-이동수단-시스템.js';
import { updateChallenge } from '../misc/164-도전-과제-달성률-시스템.js';
import { saveStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { grantTitle } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { renderUndeadBorrowedTimePanel } from '../race/258-언데드-패널-렌더.js';
import { DUNGEON_STATE_KEY, applyStatusEffect } from '../ui/155-⑭-메모리-패널-UI.js';
import { esc, lsDel, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation, renderLocationPanel } from '../world/052-동대륙-추가-장소-4.js';
import { clearDungeonState, dbSaveChoiceResult, dbSaveDungeon, dbSaveRoom, generateDungeonChoiceResult, generateDungeonRoom, loadDungeonDB, loadDungeonState, renderDungeonUI, saveDungeonState } from './256-회차가-높을수록-보스가-더-빨리-더-강하게-스폰됨.js';

export function renderMiniMap(){
  const body = document.getElementById('pb-minimap');
  if(!body) return;

  const ds = window._dungeonSession;

  // ── 던전 진행 중: 층/방 진행도 시각화 ─────────────────────
  if(ds && ds.dungeonName){
    const gi = DUNGEON_GRADES[ds.grade||'D'] || DUNGEON_GRADES['D'];
    const maxFloors = ds.maxFloors || gi.floors.max || 3;
    const mapHistory = ds.mapHistory || [];

    // 방 타입별 아이콘/색
    const roomIcon  = {combat:'⚔️',trap:'🪤',treasure:'💎',shrine:'⛩️',boss:'💀',empty:'🌫️',mystery:'❓'};
    const roomColor = {combat:'#8a1a1a',trap:'#8a6a00',treasure:'#1a5a1a',shrine:'#1a3a6a',boss:'#6a0a2a',empty:'#2a2a2a',mystery:'#3a1a5a'};
    const roomBorder= {combat:'#e04040',trap:'#c0a020',treasure:'#40c040',shrine:'#4080e0',boss:'#ff2060',empty:'#444',mystery:'#a040e0'};

    // 층별로 그룹핑
    const byFloor = {};
    for(let f=1;f<=maxFloors;f++) byFloor[f]=[];
    for(const r of mapHistory){
      if(!byFloor[r.floor]) byFloor[r.floor]=[];
      byFloor[r.floor].push(r);
    }

    // 현재 층/방 정보
    const curFloor = ds.floor;
    const curRoomInFloor = (byFloor[curFloor]||[]).length;
    const hpPct = Math.max(0,Math.min(100,Math.round((S.stats?.hp||100)/999*100)));
    const hpColor = hpPct>60?'#4a9a4a':hpPct>30?'#c8a030':'#c03030';
    const totalRooms = mapHistory.length;

    // 전체 진행률
    const progressPct = maxFloors>0 ? Math.round(((curFloor-1)/maxFloors)*100) : 0;

    body.innerHTML = (typeof decorateEmojiIcons==='function' ? decorateEmojiIcons : (h=>h))(`
      <div style="padding:10px 13px">

        <!-- 던전 헤더 -->
        <div style="padding:10px 12px;background:linear-gradient(135deg,#0d0005,#1a0010);border:1px solid ${gi.color}66;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="font-size:22px">${ds.dungeonIcon||'🏚️'}</span>
            <div style="flex:1">
              <div style="font-family:Cinzel,serif;font-size:12px;color:${gi.color}">${esc(ds.dungeonName)}</div>
              <div style="font-size:9px;color:#888;margin-top:2px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(gi,{size:9}):(gi.icon)} ${gi.label} · ${gi.desc}</div>
            </div>
          </div>
          <!-- 전체 진행 바 -->
          <div style="font-size:9px;color:#888;margin-bottom:3px;display:flex;justify-content:space-between">
            <span>던전 진행도</span><span style="color:${gi.color}">${curFloor}/${maxFloors}층</span>
          </div>
          <div style="height:6px;background:#1a0010;border-radius:3px;overflow:hidden;margin-bottom:8px">
            <div style="height:100%;width:${progressPct}%;background:linear-gradient(90deg,${gi.color},${gi.color}88);transition:width .4s"></div>
          </div>
          <!-- HP 바 -->
          <div style="font-size:9px;color:#888;margin-bottom:3px;display:flex;justify-content:space-between">
            <span>❤️ HP</span><span style="color:${hpColor}">${Math.round(S.stats?.hp||0)} / 999</span>
          </div>
          <div style="height:5px;background:#1a0005;border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${hpPct}%;background:${hpColor};transition:width .3s"></div>
          </div>
        </div>

        <!-- 통계 -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-bottom:12px">
          <div style="padding:6px 8px;background:#0d0800;border:1px solid #2a1a05;text-align:center">
            <div style="font-size:14px">🚪</div>
            <div style="font-size:10px;color:var(--gold);font-family:Cinzel,serif">${totalRooms}</div>
            <div style="font-size:8px;color:var(--dim)">탐험한 방</div>
          </div>
          <div style="padding:6px 8px;background:#0d0800;border:1px solid #2a1a05;text-align:center">
            <div style="font-size:14px">💀</div>
            <div style="font-size:10px;color:#e04060;font-family:Cinzel,serif">${ds.kills||0}</div>
            <div style="font-size:8px;color:var(--dim)">처치</div>
          </div>
          <div style="padding:6px 8px;background:#0d0800;border:1px solid #2a1a05;text-align:center">
            <div style="font-size:14px">💰</div>
            <div style="font-size:10px;color:#c8a030;font-family:Cinzel,serif">${ds.totalGold||0}</div>
            <div style="font-size:8px;color:var(--dim)">획득 골드</div>
          </div>
        </div>

        <!-- 층별 방 맵 (역순: 깊은 층이 위) -->
        <div style="font-family:Cinzel,serif;font-size:9px;color:var(--gold);letter-spacing:1px;margin-bottom:8px">🗺️ 층별 탐험 기록</div>
        ${Array.from({length:maxFloors},(_, i)=>{
          const f = maxFloors - i; // 역순 (깊은 층 위)
          const rooms = byFloor[f]||[];
          const isCurFloor = f===curFloor;
          const isDeeper = f>curFloor;
          const floorBg = isCurFloor?'#1a0010':isDeeper?'#060408':'#080610';
          const floorBorder = isCurFloor?gi.color+'88':'#1a1028';
          const bossFloor = f%5===0;
          return `
            <div style="margin-bottom:6px;padding:7px 10px;background:${floorBg};border:1px solid ${floorBorder};border-radius:2px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:${rooms.length?'6px':'0'}">
                <span style="font-size:9px;color:${isCurFloor?gi.color:isDeeper?'#333':'#4a4a6a'};font-family:Cinzel,serif;min-width:28px">
                  ${isCurFloor?'▶ ':''}<span style="${isCurFloor?'color:'+gi.color:''}">${f}층</span>
                </span>
                ${bossFloor?'<span style="font-size:8px;color:#ff2060;background:#2a0010;padding:1px 5px;border-radius:2px">BOSS</span>':''}
                ${isCurFloor?`<span style="font-size:8px;color:${gi.color};margin-left:auto">현재 위치</span>`:''}
                ${!isCurFloor&&!isDeeper?`<span style="font-size:8px;color:#4a4a6a;margin-left:auto">✓ 클리어</span>`:''}
                ${isDeeper?`<span style="font-size:8px;color:#2a2a3a;margin-left:auto">미탐험</span>`:''}
              </div>
              ${rooms.length?`
                <div style="display:flex;flex-wrap:wrap;gap:4px">
                  ${rooms.map((r,ri)=>{
                    const isCurrentRoom = isCurFloor && ri===rooms.length-1 && !r.resolved;
                    const bg = isCurrentRoom ? roomColor[r.type]||'#2a2a2a' : r.resolved?(roomColor[r.type]||'#2a2a2a')+'88':'#0a0a0a';
                    const border = isCurrentRoom ? roomBorder[r.type]||'#888' : r.resolved?(roomBorder[r.type]||'#444'):'#222';
                    return `<div title="${esc(r.title)}" style="
                      width:30px;height:30px;
                      background:${bg};
                      border:${isCurrentRoom?'2px':'1px'} solid ${border};
                      border-radius:3px;
                      display:flex;align-items:center;justify-content:center;
                      font-size:13px;
                      position:relative;
                      ${isCurrentRoom?'box-shadow:0 0 8px '+border+'88;':r.resolved?'opacity:.7;':'opacity:.25;'}
                    ">
                      ${roomIcon[r.type]||'🚪'}
                      ${isCurrentRoom?`<div style="position:absolute;top:-5px;right:-4px;width:8px;height:8px;background:#fff;border-radius:50%;box-shadow:0 0 4px #fff"></div>`:''}
                    </div>`;
                  }).join('')}
                  ${isCurFloor?`<div style="width:30px;height:30px;background:#0a0010;border:2px dashed #3a1a3a;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#3a1a3a">?</div>`:''}
                </div>`:''}
            </div>`;
        }).join('')}

        <!-- 범례 -->
        <div style="margin-top:10px;padding:8px 10px;background:#04040c;border:1px solid #1a1a2a;border-radius:2px">
          <div style="font-size:8px;color:var(--dim);margin-bottom:5px;font-family:Cinzel,serif">범례</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${Object.entries(roomIcon).map(([type,icon])=>`
              <div style="display:flex;align-items:center;gap:3px">
                <span style="font-size:11px">${icon}</span>
                <span style="font-size:8px;color:${roomBorder[type]||'#888'}">${{combat:'전투',trap:'함정',treasure:'보물',shrine:'성소',boss:'보스',empty:'빈방',mystery:'미지'}[type]||type}</span>
              </div>`).join('')}
            <div style="display:flex;align-items:center;gap:3px">
              <div style="width:10px;height:10px;border:2px solid #fff;border-radius:50%;background:#fff;box-shadow:0 0 4px #fff"></div>
              <span style="font-size:8px;color:#ccc">현재 방</span>
            </div>
          </div>
        </div>

      </div>`);
    return;
  }

  // ── 던전 밖: 일반 방문 장소 미니맵 ─────────────────────────
  const visited = (typeof loadLocations==='function') ? loadLocations() : [];
  const curLoc  = (typeof loadCurrentLocation==='function') ? loadCurrentLocation() : null;
  const typeIcon = {hamlet:'🛖',village:'🏚️',town:'🏘️',city:'🏙️',capital:'🏰',dungeon:'🗝️',shrine:'⛩️',special:'✨',event:'⚔️',port:'⚓',wilderness:'🌾'};
  const typeColor= {hamlet:'#7a6a4a',village:'#5a8a5a',town:'#4a7aaa',city:'#aa7a2a',capital:'#c8a030',dungeon:'#8a1a5a',shrine:'#8a3a3a',special:'#7a4aaa',event:'#6a4a2a',port:'#3080a0',wilderness:'#6a8050'};

  if(!visited.length){
    body.innerHTML=`<div style="padding:20px;text-align:center;color:var(--dim);font-size:11px">
      아직 방문한 장소가 없습니다.<br>탐험을 시작하세요!
    </div>`;
    return;
  }

  // SVG 방문 지도 — 장소를 그리드/원형으로 배치
  const W=320, H=220;
  const n=visited.length;
  const positions=[];
  // 원형 배치
  visited.forEach((_,i)=>{
    const angle=(2*Math.PI*i/Math.max(n,1))-Math.PI/2;
    const r=Math.min(W,H)*0.35;
    positions.push({ x: W/2+r*Math.cos(angle), y: H/2+r*Math.sin(angle) });
  });

  // [도트 아이콘] 방문 장소는 실제로 각자 고유한 지형 기반 도트 이미지가
  // 이미 생성돼 있다(장소별 guessTerrain 결과) — typeIcon 이모지 대신
  // 그 이미지를 쓴다. SVG <text>는 HTML <img>를 못 담으므로 여기서는
  // <image> 엘리먼트로 직접 매니페스트를 조회한다(getEntityIconHTML은
  // HTML 문자열을 반환해서 SVG 안에서 못 씀).
  const nodes = visited.map((loc,i)=>{
    const pos = positions[i];
    const isCur = curLoc?.id===loc.id||curLoc?.name===loc.name;
    const color = typeColor[loc.type]||'#6a6a6a';
    const iconSize = isCur?18:14;
    const manifest = window.PIXEL_ART_MANIFEST;
    const hit = manifest && ((loc.id!=null && manifest.byId[loc.id]) || (loc.name && manifest.byName[loc.name]));
    const iconEl = hit
      ? `<image href="assets/${hit.path}" x="${pos.x-iconSize/2}" y="${pos.y-iconSize/2}" width="${iconSize}" height="${iconSize}" style="image-rendering:pixelated"/>`
      : `<text x="${pos.x}" y="${pos.y+5}" text-anchor="middle" font-size="${iconSize}">${typeIcon[loc.type]||'📍'}</text>`;
    return `<g style="cursor:default">
      <circle cx="${pos.x}" cy="${pos.y}" r="${isCur?18:14}" fill="${color}22" stroke="${color}" stroke-width="${isCur?2:1}" ${isCur?'filter="url(#glow-visited)"':''}/>
      ${iconEl}
      <text x="${pos.x}" y="${pos.y+(isCur?18:14)+11}" text-anchor="middle" font-size="7" fill="${color}" font-family="Cinzel,serif">${(loc.name||'').slice(0,6)}</text>
      ${isCur?`<circle cx="${pos.x+14}" cy="${pos.y-14}" r="5" fill="#60c060" stroke="#fff" stroke-width="1"/>`:''}
    </g>`;
  }).join('');

  body.innerHTML=`
    <div style="padding:10px 13px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:8px">🗺️ 방문 장소 (${visited.length}곳)</div>
      <div style="background:#04080c;border:1px solid #1a3050;border-radius:3px;overflow:hidden;margin-bottom:10px">
        <svg width="100%" viewBox="0 0 ${W} ${H}" style="display:block">
          <defs><filter id="glow-visited"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          ${nodes}
        </svg>
      </div>
      ${curLoc?`<div style="padding:8px 10px;background:#0a1808;border:1px solid #2a5a1a;margin-bottom:8px;display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(curLoc,{size:18}):(curLoc.icon||"📍")}</span>
        <div>
          <div style="font-size:10px;color:#60c060;font-family:Cinzel,serif">◀ 현재 위치</div>
          <div style="font-size:10px;color:var(--text)">${esc(curLoc.name||'')}</div>
          <div style="font-size:9px;color:var(--dim)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(curLoc,{size:10}):(typeIcon[curLoc.type]||'')} ${curLoc.type||''}</div>
        </div>
      </div>`:''}
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${visited.map(loc=>{
          const isCur=curLoc?.name===loc.name;
          const color=typeColor[loc.type]||'#6a6a6a';
          return `<div style="padding:3px 8px;background:${isCur?color+'22':'#0d0800'};border:1px solid ${isCur?color:'var(--border)'};font-size:10px;color:${isCur?color:'var(--dim)'};border-radius:2px">
            ${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:10}):(typeIcon[loc.type]||'📍')} ${esc(loc.name||'')}
          </div>`;
        }).join('')}
      </div>
    </div>`;
}
window.renderMiniMap = renderMiniMap;

window.renderMiniMap = renderMiniMap;

export function determineDungeonGrade(loc){
  const danger = loc?.dangerLevel || 1;
  const name   = (loc?.name||'').toLowerCase();
  const type   = loc?.type || 'dungeon';
  const lv     = loadPlayerLevel() || 1;

  // 이름/테마 키워드로 S/A 우선 감지
  if(/전설|신화|봉인|세계수|고대신|심연|균열|차원/.test(name)) return 'S';
  if(/고룡|마왕|리치|천계|마계|영웅의 무덤|최후/.test(name)) return 'A';
  if(/폐허|유적|저주|어둠의|혈/.test(name)) return 'B';

  // dangerLevel 기반
  if(danger >= 6) return 'S';
  if(danger >= 5) return 'A';
  if(danger >= 4) return 'B';
  if(danger >= 3) return 'C';
  if(danger >= 2) return 'D';

  // 플레이어 레벨 기반 (장소 정보 없을 때)
  if(lv >= 40) return 'B';
  if(lv >= 25) return 'C';
  if(lv >= 15) return 'D';
  return 'E';
}
window.determineDungeonGrade = determineDungeonGrade;

window.determineDungeonGrade = determineDungeonGrade;

window.DUNGEON_GRADES = DUNGEON_GRADES;

export async function startAIDungeonExplore(){
  const loc = window.currentLocation || loadCurrentLocation();
  const dungeonName  = loc?.name || '미지의 던전';
  const dungeonIcon  = loc?.icon || '🏚️';
  const dungeonTheme = loc?.desc || loc?.atmosphere || '고대의 어둠이 드리운 지하 던전';
  const saved = loadDungeonState();
  if(saved && saved.dungeonName === dungeonName){
    const resume = confirm('⚔️ ' + dungeonName + '\n\n이전 탐험 기록이 있습니다.\n(' + saved.floor + '층, ' + saved.roomCount + '번째 방)\n\n이어서 탐험하시겠습니까?\n(취소: 새로 시작)');
    if(resume){ window._dungeonSession=saved; window.openP('location'); renderDungeonUI(); return; }
  }
  // 등급 결정
  const dungeonGrade = determineDungeonGrade(loc);
  const gradeInfo = DUNGEON_GRADES[dungeonGrade];
  // 등급별 층 수 결정
  const maxFloors = gradeInfo.floors.min + Math.floor(Math.random()*(gradeInfo.floors.max - gradeInfo.floors.min + 1));

  window._dungeonSession = {
    dungeonName, dungeonIcon, dungeonTheme,
    grade: dungeonGrade,         // 등급 저장
    maxFloors,                   // 최대 층 수
    floor:1, roomCount:0, kills:0, totalGold:0, totalExp:0, itemsFound:0,
    currentRoom:null, prevRoomDesc:'', startedAt:new Date().toISOString(),
    mapHistory: []               // 미니맵용 방 이력 [{floor, roomIdx, type, resolved}]
  };
  saveDungeonState(window._dungeonSession);
  window.openP('location');
  renderDungeonUI();
  if(S._nextInjectedContext !== undefined) S._nextInjectedContext = (S._nextInjectedContext||'') + ' [던전 탐험 시작] ' + gradeInfo.icon + ' ' + gradeInfo.label + ' ' + dungeonName + '에 발을 들였다. ' + gradeInfo.atmosTone;
  toast(gradeInfo.icon + ' [' + dungeonGrade + '등급] ' + dungeonName + ' 탐험 시작!', 3000);
}
window.startAIDungeonExplore = startAIDungeonExplore;

export async function chooseDungeonAction(choiceId){
  const ds = window._dungeonSession;
  const room = ds?.currentRoom;
  if(!room || room._resolved) return;
  const choice = room.choices?.find(c=>c.id===choiceId);
  if(!choice) return;
  const loadDiv = document.getElementById('dungeon-loading');
  const loadTxt = document.getElementById('dungeon-loading-text');
  if(loadDiv) loadDiv.style.display='block';
  if(loadTxt) loadTxt.textContent = '⚔️ "' + choice.text + '" — AI가 판정 중...';
  document.querySelectorAll('#dungeon-room-area button').forEach(b=>{ if(b.getAttribute('onclick')?.includes('chooseDungeonAction')) b.disabled=true; });
  const statVal = S.stats[choice.stat]||50;
  const roll    = Math.floor(Math.random()*100)+1;
  // 속성 상성 보정: 방의 속성(room.element)이 있으면 상성 배율 적용
  const _myElemD = typeof getCharElement==='function' ? getCharElement() : 'physical';
  const _roomElem = room.element || 'none';
  const _affinMod = (typeof calcAffinityMod==='function' && _roomElem!=='none')
    ? calcAffinityMod(_myElemD, _roomElem)
    : { mod:1.0, label:'보통', color:'#888' };
  const _baseRoll = Math.min(100, roll + Math.floor((statVal-50)*0.3));
  const effRoll   = Math.min(100, Math.round(_baseRoll * _affinMod.mod));
  // 상성 보정 토스트 (전투방이고 상성 효과 있을 때만)
  if(_roomElem!=='none' && _affinMod.mod!==1.0 && (room.roomType==='combat'||room.roomType==='boss')){
    const _elemDef = typeof ELEMENT_DEFS!=='undefined' ? ELEMENT_DEFS[_roomElem] : null;
    toastHTML(`${esc(_affinMod.label)} (${esc(_elemDef?_elemDef.icon+_elemDef.name:_roomElem)}) 판정 ${esc(_baseRoll)}→${esc(effRoll)}`, 2000);
  }
  try{
    const result = await generateDungeonChoiceResult(room, choiceId, effRoll, choice.stat);
    const _dg    = DUNGEON_GRADES[window._dungeonSession?.grade||'D'] || DUNGEON_GRADES['D'];
    const hpChg   = Math.round((result.hpChange||0) * (_dg.hpDamageMult||1));
    const goldChg = Math.max(0, Math.round((result.goldChange||0) * (_dg.goldMult||1)));
    const expGain = Math.max(0, Math.round((result.expGain||10) * (_dg.expMult||1)));
    S.stats.hp = Math.max(1, Math.min((typeof getPlayerMaxHp==='function'?getPlayerMaxHp():999), (S.stats.hp||100) + hpChg));
    if(goldChg > 0){ if(typeof addGoldWithExchange==='function') addGoldWithExchange(goldChg, '던전 결과'); else { S.gold += goldChg; saveGold(S.gold); } }
    window.updateHeader();
    if(result.statusEffect && result.statusEffect !== 'null'){ try{ applyStatusEffect(result.statusEffect); }catch(e){} }
    if(result.foundItem){
      // 등급별 최소 희귀도 보장
      const _gradeMinRarity = {E:'common',D:'common',C:'uncommon',B:'rare',A:'rare',S:'legendary'};
      const _minRarity = _gradeMinRarity[window._dungeonSession?.grade||'D']||'common';
      const rarityOrder = ['common','uncommon','rare','legendary'];
      const resultRarity = result.foundItemRarity||'common';
      // 등급 최소 희귀도보다 낮으면 올려줌
      const rarity = rarityOrder.indexOf(resultRarity) >= rarityOrder.indexOf(_minRarity) ? resultRarity : _minRarity;
      try{
        const item = await generateAIItem('던전 ' + (ds.grade||'D') + '등급 ' + ds.floor + '층 보상', null);
        if(item){ item.rarity=rarity; S.inventory.push(item); saveInventory(S.inventory); toast('📦 ' + item.icon + ' ' + item.name + ' 획득! (' + rarity + ')', 3000); ds.itemsFound=(ds.itemsFound||0)+1; }
      }catch(e){ const fi=typeof generateItem==='function'?generateItem(null,rarity):null; if(fi){ S.inventory.push(fi); saveInventory(S.inventory); ds.itemsFound=(ds.itemsFound||0)+1; } }
    }
    if(typeof gainExpFromAction==='function'){ gainExpFromAction(effRoll>=50, effRoll>=90, false); }
    if(room.roomType==='combat'||room.roomType==='boss'){ if(effRoll>=50) ds.kills=(ds.kills||0)+1; }
    ds.totalGold  = (ds.totalGold||0) + goldChg;
    ds.totalExp   = (ds.totalExp||0)  + expGain;
    ds.prevRoomDesc = (result.resultText||'').slice(0,100);
    room._resolved   = true;
    room._resultText = result.resultText||'';
    room._hpChange   = hpChg;
    room._goldChange = goldChg;
    room._foundItem  = result.foundItem||false;
    ds.currentRoom   = room;
    // 미니맵 이력에 클리어 표시
    if(ds.mapHistory && ds.mapHistory.length>0){
      const last = ds.mapHistory[ds.mapHistory.length-1];
      if(last.floor===ds.floor) last.resolved=true;
    }
    saveDungeonState(ds);
    dbSaveChoiceResult(room, choiceId, effRoll, choice.stat, result, ds.dungeonName, ds.floor);
    S._nextInjectedContext = (S._nextInjectedContext||'') + ' [던전 판정: 주사위 ' + effRoll + '/100, ' + (effRoll>=50?'성공':'실패') + '] ' + (result.resultText||'').slice(0,80);
    if(S.stats.hp<=1){ renderDungeonUI(); setTimeout(()=>{ toast('💀 던전에서 쓰러졌다! 탈출합니다...', 3000); leaveDungeon(true); }, 1500); return; }
    renderDungeonUI();
  }catch(e){
    console.warn('[던전 결과 생성 실패]', e.message);
    const isSucc = effRoll >= 50;
    if(isSucc){ const gold=Math.floor(Math.random()*50)+10; if(typeof addGoldWithExchange==='function') addGoldWithExchange(gold, '던전 폴백 결과'); else { S.gold+=gold; saveGold(S.gold); } window.updateHeader(); ds.totalGold=(ds.totalGold||0)+gold; room._resultText='성공적으로 처리했다. 골드 +'+gold+'를 획득했다.'; room._goldChange=gold; }
    else { const dmg=Math.floor(Math.random()*15)+5; S.stats.hp=Math.max(1,(S.stats.hp||100)-dmg); window.updateHeader(); room._resultText='실패했다. HP -'+dmg+' 피해를 입었다.'; room._hpChange=-dmg; }
    room._resolved=true; ds.currentRoom=room; saveDungeonState(ds); renderDungeonUI();
    toast('⚠️ AI 지연, 기본 판정 적용', 1500);
  }
}
window.chooseDungeonAction = chooseDungeonAction;

export function confirmLeaveDungeon(){
  const ds = window._dungeonSession;
  if(!ds) return;
  if(confirm('🚪 ' + ds.dungeonName + '에서 탈출하시겠습니까?\n\n⬇️ 도달 층: ' + ds.floor + '층\n🚪 탐험 방: ' + ds.roomCount + '개\n💀 처치: ' + (ds.kills||0) + '\n💰 획득 골드: ' + (ds.totalGold||0) + '\n📦 획득 아이템: ' + (ds.itemsFound||0) + '개')) leaveDungeon(false);
}
window.confirmLeaveDungeon = confirmLeaveDungeon;

export function leaveDungeon(forced){
  const ds = window._dungeonSession;
  if(!ds) return;
  const summary = (forced?'💀 쓰러져서 탈출':'🚪 던전 탈출') + ': ' + ds.dungeonName + ' (' + ds.floor + '층, ' + ds.roomCount + '방, 처치 ' + (ds.kills||0) + ', 골드 +' + (ds.totalGold||0) + ')';
  if(S._nextInjectedContext !== undefined) S._nextInjectedContext = (S._nextInjectedContext||'') + ' [' + summary + ']';
  if(ds.roomCount >= 5) try{ grantTitle('mf_dungeon_diver'); }catch(e){}
  if(ds.floor >= 3)     try{ grantTitle('explorer'); }catch(e){}
  toast((forced?'💀':'🗝️') + ' ' + ds.dungeonName + (forced?' 탈출...':' 탈출 완료!'), 3000);
  clearDungeonState();
  window._dungeonSession = null;
  renderLocationPanel();
}
window.leaveDungeon = leaveDungeon;

window.startAIDungeonExplore = startAIDungeonExplore;

window.chooseDungeonAction   = chooseDungeonAction;

window.confirmLeaveDungeon   = confirmLeaveDungeon;

window.leaveDungeon          = leaveDungeon;

export const UNDEAD_BORROWED_TIME_KEY = 'tf-undead-borrowed-time';

export const loadUndeadBorrowedTime = () => {
  try {
    return JSON.parse(lsGet(UNDEAD_BORROWED_TIME_KEY) || 'null') || {
      // 감정 온도계 (0~100, 기본 60)
      soulTemp: 60,
      // 세계의 빚 (0~100)
      worldDebt: 0,
      // 두 번째 죽음 저울 (0~100)
      deathScale: 30,
      // 미완성의 사슬 선택 유형
      chainType: null,
      // 사슬 진척도 (0~100)
      chainProgress: 0,
      // 완성된 사슬 수 (엔딩 조건)
      chainsCompleted: 0,
      // 죽음 너머의 눈 레벨 (0~4, 온도에 따라 자동)
      deathSightLevel: 0,
      // 행동 기록
      history: [],
      // 사신 방문 횟수
      reaperVisits: 0,
      // 금기 위반 횟수
      tabooViolations: 0,
      // 이미 두 번째 죽음을 선택했는가
      secondDeathChosen: false
    };
  } catch(e) {
    return {
      soulTemp:60, worldDebt:0, deathScale:30,
      chainType:null, chainProgress:0, chainsCompleted:0,
      deathSightLevel:0, history:[], reaperVisits:0,
      tabooViolations:0, secondDeathChosen:false
    };
  }
};

export const saveUndeadBorrowedTime = (d) => { try { lsSet(UNDEAD_BORROWED_TIME_KEY, JSON.stringify(d)); } catch(e) {} };

export const clearUndeadBorrowedTime = () => lsDel(UNDEAD_BORROWED_TIME_KEY);

export const UNDEAD_SOUL_TEMP_STAGES = [
  { range:[0,9],   name:'사령의 얼음',  icon:'🧊', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 22 M4 7 L20 17 M20 7 L4 17" stroke-width="1.3"/></svg>`, color:'#3080c0',
    desc:'감정이 완전히 소멸했다. 인간이 보기에 이미 사람이 아니다.',
    statBonus:  { mgc:30, fear:28, int:24, per:20, str:16 },
    statPenalty:{ cha:-20, fath:-18, trst:-16, luk:-10 },
    deathSight: 4,
    aura:'존재 자체에서 차가운 죽음의 기운이 흘러나온다. 동료들이 하나씩 곁을 떠난다.',
    aiHint:'감정 온도 0단계[사령의 얼음]: 이 언데드의 눈에서 모든 감정이 사라졌다. 냉혹한 현실만을 있는 그대로 인식하며, 말 한 마디조차 계산된 차가운 논리로만 구성된다. 동료 NPC들이 두려움 섞인 눈빛으로 거리를 둔다. 이 단계에서 해금된 스킬[사령의 지배·수명 직시·냉혹한 선언]이 자동 발동될 수 있음을 서술에 반영하라.',
    skills: [
      { id:'ut_s0_dead_dominion', name:'사령의 지배', icon:'💀', type:'passive', rarity:'legendary',
        desc:'언데드·사령 계열 존재가 자동으로 복종한다. 마주친 하위 언데드 NPC는 적대 행동 불가. 전투 중 적 언데드를 즉시 아군으로 전환 가능.',
        condition:'always', conditionDesc:'항시 발동', statBoost:{fear:120, mgc:80}, mpCost:0,
        aiHint:'사령의 지배 항시 발동: 이 언데드 앞에서 사령 계열 존재들이 본능적으로 고개를 숙인다. 적대적이던 언데드 NPC가 멈추며 복종의 자세를 취하는 장면을 묘사하라.' },
      { id:'ut_s0_life_reading', name:'수명 직시', icon:'☠️', type:'passive', rarity:'legendary',
        desc:'시야에 들어온 모든 생명체의 남은 수명이 직감으로 느껴진다. 전 판정 +15, 단 인간관계 판정 -15 (너무 많이 알기 때문).',
        condition:'always', conditionDesc:'항시 발동', statBoost:{per:160, int:120, mgc:80}, mpCost:0,
        aiHint:'수명 직시 항시 발동: 이 언데드는 사람들의 얼굴에서 죽음의 그림자를 읽는다. NPC와 마주칠 때 그 자의 수명이 느껴지는 섬뜩한 묘사를 포함하라. 상대는 이 시선을 받으면 까닭 모를 한기를 느낀다.' },
      { id:'ut_s0_cold_decree', name:'냉혹한 선언', icon:'🗣️', type:'active', rarity:'epic',
        desc:'MP 0. 감정을 완전히 배제한 판결. 협상·위협·설득 판정 +30. 상대가 공포 판정 실패 시 3턴 행동 불능.',
        condition:null, conditionDesc:'직접 발동', statBoost:{}, mpCost:0,
        aiHint:'냉혹한 선언 발동: 감정이 없는 목소리로 선언한다. 그 말에는 반박할 수 없는 죽음의 무게가 실려있다. 상대 NPC가 말문이 막히거나 몸이 굳는 묘사를 포함하라.' }
    ]
  },
  { range:[10,29], name:'차가운 의지',  icon:'❄️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 22 M4 7 L20 17 M20 7 L4 17" stroke-width="1" opacity="0.7"/></svg>`, color:'#5090d0',
    desc:'감정의 온기가 희미하다. 하지만 그 희미함 속에 강철 같은 냉정함이 있다.',
    statBonus:  { mgc:18, fear:16, int:14, per:12, str:8 },
    statPenalty:{ cha:-10, fath:-8, trst:-6 },
    deathSight: 3,
    aura:'말수가 극도로 줄었다. 필요한 말만, 필요한 순간에만 한다.',
    aiHint:'감정 온도 1단계[차가운 의지]: 냉정하고 계산적이다. 감정적 반응을 철저히 억제하며, 타인의 두려움과 욕망이 선명하게 보인다. 동료들이 이 존재를 신뢰하면서도 어딘가 불편해한다. 해금 스킬[죽음의 낙인·의도 파악]이 발동될 때 서술에 반영하라.',
    skills: [
      { id:'ut_s1_death_brand', name:'죽음의 낙인', icon:'🖤', type:'event', rarity:'rare',
        desc:'대상에게 보이지 않는 죽음의 낙인을 새긴다. 낙인자의 위치를 항상 감지하며, 낙인자가 거짓말할 때 자동으로 감지됨. 낙인 해제는 불가.',
        condition:'activate', conditionDesc:'직접 발동', statBoost:{per:80}, mpCost:0,
        aiHint:'죽음의 낙인 발동: 차가운 손끝이 스치며 보이지 않는 인장이 새겨진다. 이후 그 자의 동선과 거짓이 안개 속 등불처럼 느껴지는 묘사를 포함하라.' },
      { id:'ut_s1_intent_read', name:'의도 파악', icon:'🔮', type:'passive', rarity:'rare',
        desc:'적의 다음 행동 의도가 직감으로 느껴진다. 전투 중 적의 약점 자동 노출, 배신 징후 경고. NEG·PER 판정 +20.',
        condition:'always', conditionDesc:'항시 발동', statBoost:{per:96, neg:80, int:64}, mpCost:0,
        aiHint:'의도 파악 항시 발동: 이 언데드는 상대의 눈빛에서 숨겨진 의도를 읽는다. 대화 장면에서 상대의 진심과 거짓을 꿰뚫어 보는 날카로운 묘사를 포함하라.' }
    ]
  },
  { range:[30,49], name:'식어가는 불씨', icon:'🕯️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C10 21 9 19.5 9 18 C9 16.8 9.8 16 10 15 C10.2 15.6 10.6 15.8 10.8 15.5 C10.6 14 11.3 12.5 12.5 11.5 C12.2 12.7 13 13.3 13.5 14 C14 14.7 14.7 15.3 14.7 17 C14.7 19.5 13 21 12 21 Z" stroke-linejoin="round" opacity="0.6"/></svg>`, color:'#8060a0',
    desc:'감정이 있다는 것은 안다. 하지만 느끼는 것이 점점 힘들어진다.',
    statBonus:  { mgc:8, fear:8, per:8, int:6 },
    statPenalty:{ cha:-4, fath:-3 },
    deathSight: 2,
    aura:'가끔 과거의 온기를 떠올리는 듯 멈칫한다. 그 순간이 점점 짧아진다.',
    aiHint:'감정 온도 2단계[식어가는 불씨]: 감정과 냉정 사이에서 흔들린다. 중요한 순간에 짧게 감정이 드러났다가 곧 차갑게 봉인된다. 타인의 거짓말이 직감적으로 느껴지기 시작한다. 해금 스킬[공포 감지]이 수동으로 작동할 수 있다.',
    skills: [
      { id:'ut_s2_fear_sense', name:'공포 감지', icon:'👁️‍🗨️', type:'passive', rarity:'uncommon',
        desc:'NPC의 숨겨진 공포와 욕망의 냄새가 느껴진다. 대화창에 NPC 숨겨진 감정 힌트 표시. CHA·NEG 판정 +12.',
        condition:'always', conditionDesc:'항시 발동', statBoost:{per:48, neg:48, cha:32}, mpCost:0,
        aiHint:'공포 감지 항시 발동: 이 언데드는 상대가 숨기려는 공포와 욕망의 냄새를 맡는다. NPC와 대화할 때 그 자의 가장 깊은 두려움이나 욕망이 스치듯 감지되는 묘사를 포함하라.' }
    ]
  },
  { range:[50,69], name:'미지근한 경계', icon:'💧', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C12 3 6 11 6 15.5 C6 18.5 8.7 21 12 21 C15.3 21 18 18.5 18 15.5 C18 11 12 3 12 3 Z" stroke-linejoin="round" opacity="0.7"/></svg>`, color:'#6080a0',
    desc:'언데드로서도, 산 자로서도 어중간한 상태. 가장 인간에 가깝지만, 가장 방황한다.',
    statBonus:  {},
    statPenalty:{},
    deathSight: 1,
    aura:'어느 쪽도 아닌 눈빛이다. 살아있는 자들은 이 자가 불편하고, 완전한 언데드는 이 자가 약해 보인다.',
    aiHint:'감정 온도 3단계[미지근한 경계]: 언데드의 경계 상태. 감정을 느끼려 하지만 완전히 열지 못하고, 냉정해지려 하지만 완전히 닫지도 못한다. 정체성의 혼란이 행동에 미묘하게 묻어난다.',
    skills: []
  },
  { range:[70,84], name:'살아있는 온기', icon:'🔥', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C8 21 6 18.5 6 15.5 C6 13 7.5 11.5 8 10 C8.3 11 9 11.5 9.5 11 C9 8 10.5 5 13 3 C12.5 5.5 14 7 15 8.5 C16 10 17.5 11.5 17.5 14.5 C17.5 18.5 15 21 12 21 Z" stroke-linejoin="round"/></svg>`, color:'#d08030',
    desc:'감정이 되살아나고 있다. 동료가 생기고, 웃음이 돌아온다. 하지만 그만큼 약해진다.',
    statBonus:  { cha:8, fath:8, trst:6, luk:4 },
    statPenalty:{ mgc:-5, fear:-5, per:-4 },
    deathSight: 0,
    aura:'언데드치고 따뜻한 눈빛이다. 동료들이 이 자를 산 자처럼 대하기 시작한다.',
    aiHint:'감정 온도 4단계[살아있는 온기]: 감정이 살아있다. 동료들과 진심을 나누고, 웃고, 눈물도 흘린다. 하지만 죽음 너머의 직관은 흐릿해지고, 전투에서 감정적 실수를 범할 수 있다. 해금 스킬[생명의 공명]이 동료 보호 장면에서 발동될 수 있다.',
    skills: [
      { id:'ut_s4_life_resonance', name:'생명의 공명', icon:'❤️', type:'passive', rarity:'rare',
        desc:'동료의 HP가 30% 이하가 되면 자동으로 감지하고 자신의 HP를 분배. 동료 HP+20, 자신 HP-10. 유대가 깊은 동료(bond 50 이상)에게 판정 보조 +10.',
        condition:'ally_low_hp', conditionDesc:'동료 위기 시 자동', statBoost:{cha:64, fath:48}, mpCost:0,
        aiHint:'생명의 공명 발동: 동료가 쓰러지려는 순간 이 언데드의 몸에서 희미한 온기가 퍼지며 생명력이 흘러간다. 언데드답지 않은 이 반사적 보호 행동에 당사자도 동료도 잠시 말을 잃는 묘사를 포함하라.' }
    ]
  },
  { range:[85,100],name:'뜨거운 회귀', icon:'🌅', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2 L12 4.5 M12 19.5 L12 22 M2 12 L4.5 12 M19.5 12 L22 12 M5.1 5.1 L6.8 6.8 M17.2 17.2 L18.9 18.9 M18.9 5.1 L17.2 6.8 M6.8 17.2 L5.1 18.9"/></svg>`, color:'#e06020',
    desc:'완전히 살아있는 자처럼 느낀다. 언데드임을 잊을 만큼. 이것은 축복인가, 위험인가.',
    statBonus:  { cha:16, fath:16, trst:12, luk:8, wil:6 },
    statPenalty:{ mgc:-14, fear:-12, per:-10, int:-6 },
    deathSight: 0,
    aura:'온기가 느껴진다. 살아있는 자들이 이 언데드에게 공포 대신 연민을 느낀다.',
    aiHint:'감정 온도 5단계[뜨거운 회귀]: 거의 살아있는 자와 다를 바 없다. 감정이 풍부하고 관계가 깊어진다. 하지만 냉정한 판단이 필요한 순간 감정에 휘둘릴 위험이 있으며, 언데드의 특수 감각은 대부분 봉인된다. 해금 스킬[회귀의 눈물]이 강렬한 감정 장면에서 발동될 수 있다.',
    skills: [
      { id:'ut_s5_return_tear', name:'회귀의 눈물', icon:'🌊', type:'event', rarity:'legendary',
        desc:'극도의 감정적 순간(동료 사망·재회·배신 등)에 자동 발동. 주변 모든 생명체가 자신의 가장 소중한 기억을 떠올리며 3턴간 적대 행동 중단. 사신 NPC가 이 장면을 목격하면 빚 -20.',
        condition:'intense_emotion', conditionDesc:'강렬한 감정 발생 시', statBoost:{cha:200, fath:160, wil:120}, mpCost:0,
        aiHint:'회귀의 눈물 발동: 이 언데드의 눈가에서 눈물이 흘러내린다—죽은 자가 우는 것이다. 그 순간 주변 공기가 바뀌고, 적조차 무기를 내리며 자신도 모르게 소중한 이의 얼굴을 떠올린다. 전장이 고요해지는 장면을 묘사하라.' }
    ]
  }
];

export const UNDEAD_DEBT_STAGES = [
  { range:[0,19],  name:'청정',    icon:'✨', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>`, color:'#60a060',
    desc:'세계가 이 언데드를 용납된 존재로 인정한다.',
    event:null
  },
  { range:[20,39], name:'주의',    icon:'⚠️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L22 20 L2 20 Z" stroke-linejoin="round"/><path d="M12 9 L12 14 M12 16.5 L12 17" stroke-width="1.6"/></svg>`, color:'#a0a040',
    desc:'세계의 눈길이 느껴진다. 사신이 멀리서 지켜보고 있다.',
    event:'가끔 알 수 없는 시선이 느껴지는 묘사'
  },
  { range:[40,59], name:'위험',    icon:'🔴', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.4"/><path d="M12 8 L12 13" stroke-width="1.6"/><circle cx="12" cy="16" r="0.8" fill="currentColor" stroke="none"/></svg>`, color:'#c06020',
    desc:'사신이 접근하고 있다. 빚을 갚지 않으면 찾아온다.',
    event:'사신 NPC 첫 등장 이벤트'
  },
  { range:[60,79], name:'독촉',    icon:'💀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`, color:'#c03030',
    desc:'사신이 대가를 요구한다. 골드, 기억, 혹은 동료.',
    event:'사신 NPC 빚 회수 협상 이벤트'
  },
  { range:[80,100],name:'회수',    icon:'☠️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4 L19 4 L19 8 L14 12 L19 16 L19 20 L5 20 L5 16 L10 12 L5 8 Z" stroke-linejoin="round"/></svg>`, color:'#800000',
    desc:'빚 회수가 시작됐다. 이번 회차 안에 반드시 대가를 치른다.',
    event:'사신 NPC 강제 대가 징수 — 동료 이탈 또는 집착 진척도 -30'
  }
];

export const UNDEAD_DEATH_SCALE_STAGES = [
  { range:[0,19],  name:'추한 망령',    icon:'💀', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3" opacity="0.6"/></svg>`, color:'#600000',
    desc:'기억도 의지도 없이 세계를 떠돈다.',
    ending:'세계가 강제 추방. 기억도 없이 소멸하는 최악의 결말.',
    aiHint:'이 언데드는 무엇을 위해 남아있는지조차 잊어버린 망령이다. 행동에 목적이 없고, 그저 존재한다는 사실만이 남아있다.'
  },
  { range:[20,39], name:'방황하는 영혼', icon:'👻', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 21 12 21 Z" stroke-linejoin="round" opacity="0.5"/></svg>`, color:'#804040',
    desc:'완성하지 못한 채 그냥 남아있다.',
    ending:'미완성인 채로 세계에 봉인. 영원히 방황하는 반쪽짜리 결말.',
    aiHint:'이 언데드는 무언가를 하려 했지만 포기했다. 선택 앞에서 머뭇거리고, 의지가 흔들린다.'
  },
  { range:[40,59], name:'경계의 수호자', icon:'⚔️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L19 6 L19 12 C19 17 15.5 20 12 21.5 C8.5 20 5 17 5 12 L5 6 Z" stroke-linejoin="round"/></svg>`, color:'#6060a0',
    desc:'완전히 떠나지도, 완전히 살지도 않기로 선택했다.',
    ending:'삶과 죽음의 경계를 지키는 자가 된다. 고독하지만 의미 있는 결말.',
    aiHint:'이 언데드는 두 번째 죽음을 택하지 않고 경계에 머물기로 했다. 강인하고 고독하며, 세계의 이면을 지킨다.'
  },
  { range:[60,79], name:'완성을 향해',   icon:'🌟', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round" opacity="0.8"/></svg>`, color:'#a0a030',
    desc:'두 번째 죽음을 준비하고 있다. 조금만 더.',
    ending:'거의 다 왔다. 마지막 사슬 하나만 풀면 선택할 수 있다.',
    aiHint:'이 언데드는 두 번째 죽음에 가까워지고 있음을 직감한다. 행동에 결연함과 고요한 수용이 묻어난다.'
  },
  { range:[80,100],name:'두 번째 죽음',  icon:'✨', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>`, color:'#c8d080',
    desc:'스스로 두 번째 죽음을 선택할 자격을 얻었다.',
    ending:'모든 미완성을 완성하고, 스스로 눈을 감는다. 진정한 해방.',
    aiHint:'이 언데드는 모든 것을 완성했다. 마지막을 준비하는 자의 고요한 눈빛과 무게감 있는 침묵을 묘사하라. 동료들은 이 자가 곧 떠날 것임을 감지한다.'
  }
];

export function getUndeadSoulTempStage(temp) {
  return UNDEAD_SOUL_TEMP_STAGES.find(s => temp >= s.range[0] && temp <= s.range[1])
    || UNDEAD_SOUL_TEMP_STAGES[3];
}
window.getUndeadSoulTempStage = getUndeadSoulTempStage;

export function getUndeadDebtStage(debt) {
  return UNDEAD_DEBT_STAGES.find(s => debt >= s.range[0] && debt <= s.range[1])
    || UNDEAD_DEBT_STAGES[0];
}
window.getUndeadDebtStage = getUndeadDebtStage;

export function getUndeadDeathScaleStage(scale) {
  return UNDEAD_DEATH_SCALE_STAGES.find(s => scale >= s.range[0] && scale <= s.range[1])
    || UNDEAD_DEATH_SCALE_STAGES[1];
}
window.getUndeadDeathScaleStage = getUndeadDeathScaleStage;

export function calcDeathSightLevel(soulTemp) {
  const stg = getUndeadSoulTempStage(soulTemp);
  return stg.deathSight || 0;
}
window.calcDeathSightLevel = calcDeathSightLevel;

export function isUndeadRace() {
  const race = S.character?.race || '';
  return race.includes('언데드') || race.includes('undead') || race.includes('Undead');
}
window.isUndeadRace = isUndeadRace;

export function chooseUndeadChainType(typeId) {
  if (!isUndeadRace()) return;
  const data = loadUndeadBorrowedTime();
  if (data.chainType) { toast('⛓️ 이미 집착이 정해진 자는 바꿀 수 없습니다', 2000); return; }
  if (!UNDEAD_CHAIN_TYPES[typeId]) return;
  data.chainType = typeId;
  data.chainProgress = 0;
  saveUndeadBorrowedTime(data);
  const ct = UNDEAD_CHAIN_TYPES[typeId];
  toastHTML(`⛓️ 미완성의 사슬: ${typeof getEntityIconHTML==='function'?getEntityIconHTML(ct,{size:14}):(ct.icon)} ${esc(ct.label)} — ${esc(ct.desc.slice(0,30))}...`, 4000);
  applyUndeadBorrowedTimeStats();
  renderUndeadBorrowedTimePanel();
}
window.chooseUndeadChainType = chooseUndeadChainType;

export function triggerUndeadAction(actionId, customDesc) {
  if (!isUndeadRace()) return;
  const def = UNDEAD_ACTION_TYPES[actionId];
  if (!def) return;
  const data = loadUndeadBorrowedTime();

  // 금기 체크
  if (actionId === 'cold_betray' || actionId === 'scale_taboo') {
    data.tabooViolations = (data.tabooViolations || 0) + 1;
  }

  // 각 수치 변화 적용
  data.soulTemp   = Math.max(0,   Math.min(100, (data.soulTemp   || 60) + def.tempDelta));
  data.worldDebt  = Math.max(0,   Math.min(100, (data.worldDebt  || 0)  + def.debtDelta));
  data.deathScale = Math.max(0,   Math.min(100, (data.deathScale || 30) + def.scaleDelta));

  // 죽음 너머의 눈 자동 갱신
  data.deathSightLevel = calcDeathSightLevel(data.soulTemp);

  // 기록
  data.history = data.history || [];
  data.history.push({
    actionId, icon: def.icon, label: def.label,
    tempDelta: def.tempDelta, debtDelta: def.debtDelta, scaleDelta: def.scaleDelta,
    desc: customDesc || def.desc,
    soulTemp: data.soulTemp, worldDebt: data.worldDebt, deathScale: data.deathScale,
    at: new Date().toISOString().slice(0, 16)
  });
  

  saveUndeadBorrowedTime(data);
  applyUndeadBorrowedTimeStats();

  // 토스트
  const tempStr = def.tempDelta !== 0 ? ` 온도${def.tempDelta>0?'+':''}${def.tempDelta}` : '';
  const debtStr = def.debtDelta !== 0 ? ` 빚${def.debtDelta>0?'+':''}${def.debtDelta}` : '';
  const scaleStr= def.scaleDelta !== 0 ? ` 저울${def.scaleDelta>0?'+':''}${def.scaleDelta}` : '';
  toast(`${def.label}${tempStr}${debtStr}${scaleStr}`, 3000, def);

  // 빚 단계 이벤트 처리
  _checkUndeadDebtEvent(data);

  return data;
}
window.triggerUndeadAction = triggerUndeadAction;

export function advanceUndeadChain(amount) {
  if (!isUndeadRace()) return;
  const data = loadUndeadBorrowedTime();
  if (!data.chainType) { toast('⛓️ 먼저 미완성의 사슬 유형을 선택하세요', 2500); return; }
  const prev = data.chainProgress;
  data.chainProgress = Math.min(100, (data.chainProgress || 0) + (amount || 10));
  // 온도 하락, 빚 감소, 저울 상승 (집착을 완성할수록 세계의 빚이 줄어듦)
  data.soulTemp  = Math.max(0, Math.min(100, (data.soulTemp || 60) - 3));
  data.worldDebt = Math.max(0, (data.worldDebt || 0) - 8);
  data.deathScale= Math.min(100, (data.deathScale || 30) + 8);
  data.deathSightLevel = calcDeathSightLevel(data.soulTemp);

  // 완성 체크
  if (data.chainProgress >= 100 && prev < 100) {
    data.chainsCompleted = (data.chainsCompleted || 0) + 1;
    data.deathScale = Math.min(100, data.deathScale + 15); // 완성 보너스
    data.worldDebt  = Math.max(0, data.worldDebt - 20);
    const ct = UNDEAD_CHAIN_TYPES[data.chainType];
    setTimeout(() => toastHTML(`✨ 사슬 완성! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(ct,{size:14}):(ct.icon)} ${esc(ct.label)}의 집착이 해방됐다. 두 번째 죽음에 가까워진다.`, 5000), 500);
    // 완성 스탯 보너스 지급
    if (ct.completionBonus) {
      Object.entries(ct.completionBonus).forEach(([k, v]) => {
        if (S.stats[k] !== undefined) S.stats[k] = Math.min(999, (S.stats[k] || 50) + v);
      });
      if (typeof saveStats === 'function') saveStats(S.stats);
    }
  }

  data.history = data.history || [];
  data.history.push({
    actionId:'chain_advance', icon:'⛓️', label:'사슬 진척',
    tempDelta:-3, debtDelta:-8, scaleDelta:+8,
    desc:`${UNDEAD_CHAIN_TYPES[data.chainType]?.label} 집착 진척 +${amount}`,
    soulTemp: data.soulTemp, worldDebt: data.worldDebt, deathScale: data.deathScale,
    at: new Date().toISOString().slice(0, 16)
  });
  

  saveUndeadBorrowedTime(data);
  applyUndeadBorrowedTimeStats();
  toast(`⛓️ 사슬 진척 +${amount} (${data.chainProgress}/100)`, 2500);
  return data;
}
window.advanceUndeadChain = advanceUndeadChain;

export function _checkUndeadDebtEvent(data) {
  const stage = getUndeadDebtStage(data.worldDebt);
  if (data.worldDebt >= 40 && data.worldDebt < 60 && (data.reaperVisits || 0) === 0) {
    data.reaperVisits = 1;
    saveUndeadBorrowedTime(data);
    setTimeout(() => toast('💀 낯선 기운이 느껴진다. 사신이 당신을 찾아오기 시작했다...', 5000), 1000);
    if (S._nextInjectedContext !== undefined)
      S._nextInjectedContext = (S._nextInjectedContext || '') +
        ' [💀 세계의 빚 경고: 언데드가 빚진 시간이 쌓여 사신이 접근하기 시작했다. 이번 회차 어느 순간 사신 NPC가 나타나 대가를 요구하는 장면을 연출하라.]';
  }
  if (data.worldDebt >= 80) {
    data.reaperVisits = (data.reaperVisits || 0) + 1;
    saveUndeadBorrowedTime(data);
    setTimeout(() => toast('☠️ 사신이 왔다. 빚을 갚아야 한다—동료, 기억, 혹은 집착의 진척도.', 5000), 1000);
    if (S._nextInjectedContext !== undefined)
      S._nextInjectedContext = (S._nextInjectedContext || '') +
        ' [☠️ 사신 빚 회수: 세계의 빚이 임계치를 넘었다. 사신이 나타나 동료 1명 이탈 또는 사슬 진척도 -30의 대가를 강제 집행하는 극적인 장면을 연출하라. 이것이 언데드 금기 위반의 결과임을 암시하라.]';
    // 빚 회수 페널티: 사슬 진척도 감소
    data.chainProgress = Math.max(0, (data.chainProgress || 0) - 30);
    data.worldDebt = Math.max(0, data.worldDebt - 40); // 회수 후 빚 감소
    saveUndeadBorrowedTime(data);
  }
}
window._checkUndeadDebtEvent = _checkUndeadDebtEvent;

export function applyUndeadBorrowedTimeStats() {
  if (!isUndeadRace()) return;
  const data = loadUndeadBorrowedTime();
  const tempStg = getUndeadSoulTempStage(data.soulTemp || 60);

  // 이전 감정 온도 보너스 제거
  const prev = S._undeadTempBonus || {};
  Object.entries(prev).forEach(([k, v]) => {
    if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
  });

  // 새 감정 온도 보너스 적용
  const newBonus = {};
  Object.entries(tempStg.statBonus || {}).forEach(([k, v]) => {
    S.stats[k] = Math.min(999, (S.stats[k] || 50) + v);
    newBonus[k] = v;
  });
  Object.entries(tempStg.statPenalty || {}).forEach(([k, v]) => {
    S.stats[k] = Math.max(0, (S.stats[k] || 50) + v);
  });

  // 집착 유형 기본 스탯 보너스
  if (data.chainType) {
    const ct = UNDEAD_CHAIN_TYPES[data.chainType];
    const prev2 = S._undeadChainBonus || {};
    Object.entries(prev2).forEach(([k, v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
    });
    const cb = {};
    Object.entries(ct.statBonus || {}).forEach(([k, v]) => {
      S.stats[k] = Math.min(999, (S.stats[k] || 50) + v);
      cb[k] = v;
    });
    S._undeadChainBonus = cb;

    // ── 집착 단계 스킬 스탯 적용 ──
    const progress = data.chainProgress || 0;
    const activeChainSkills = (ct.chainSkills || []).filter(s => progress >= s.threshold);
    // 이전 집착 스킬 보너스 제거
    const prev3 = S._undeadChainSkillBonus || {};
    Object.entries(prev3).forEach(([k, v]) => {
      if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
    });
    const csb = {};
    activeChainSkills.forEach(skill => {
      Object.entries(skill.statBoost || {}).forEach(([k, v]) => {
        // statBoost 값은 내부 표현(퍼센트 기반)이므로 실제 스탯에는 1/8 비율로 적용
        const realV = Math.round(v / 8);
        S.stats[k] = Math.min(999, (S.stats[k] || 50) + realV);
        csb[k] = (csb[k] || 0) + realV;
      });
    });
    S._undeadChainSkillBonus = csb;

    // 새로 해금된 집착 스킬 토스트 알림
    const prevProgress = S._undeadChainProgress || 0;
    if (progress !== prevProgress) {
      (ct.chainSkills || []).forEach(skill => {
        if (skill.threshold > prevProgress && skill.threshold <= progress) {
          setTimeout(() => toastHTML(`✨ 새 집착 스킬 해금! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(skill,{size:14}):(skill.icon)} ${esc(skill.name)} — ${esc(skill.desc.slice(0,40))}...`, 5000), 800);
        }
      });
      S._undeadChainProgress = progress;
    }
  }

  // ── 감정 온도 단계 스킬 스탯 적용 ──
  const activeTempSkills = tempStg.skills || [];
  const prev4 = S._undeadTempSkillBonus || {};
  Object.entries(prev4).forEach(([k, v]) => {
    if (S.stats[k] !== undefined) S.stats[k] = Math.max(0, S.stats[k] - v);
  });
  const tsb = {};
  activeTempSkills.forEach(skill => {
    Object.entries(skill.statBoost || {}).forEach(([k, v]) => {
      const realV = Math.round(v / 8);
      S.stats[k] = Math.min(999, (S.stats[k] || 50) + realV);
      tsb[k] = (tsb[k] || 0) + realV;
    });
  });
  S._undeadTempSkillBonus = tsb;

  // 감정 온도 단계 전환 감지 → 스킬 언락 토스트
  const prevTemp = S._undeadPrevTemp || data.soulTemp;
  const prevStg  = getUndeadSoulTempStage(prevTemp);
  if (prevStg.name !== tempStg.name && (tempStg.skills || []).length > 0) {
    (tempStg.skills || []).forEach(skill => {
      setTimeout(() => toastHTML(`💀 감정 온도 변화! ${typeof getEntityIconHTML==='function'?getEntityIconHTML(skill,{size:14}):(skill.icon)} ${esc(skill.name)} ${esc(tempStg.skills.length > 1 ? '' : '')}해금!`, 5000), 1200);
    });
  }
  S._undeadPrevTemp = data.soulTemp;

  S._undeadTempBonus = newBonus;
  if (typeof saveStats === 'function') saveStats(S.stats);
  window.updateHeader();
}
window.applyUndeadBorrowedTimeStats = applyUndeadBorrowedTimeStats;

export function detectUndeadActionFromText(text) {
  if (!text || !isUndeadRace()) return;
  const data = loadUndeadBorrowedTime();

  // 감정 온기 상승 트리거
  if (/웃었|웃으며|눈물|울었|감동|그리워|소중|우정|사랑|따뜻|온기/.test(text) && Math.random() < 0.45)
    triggerUndeadAction('warm_memory');
  if (/도왔|보호|지켰|구했|살렸|감쌌/.test(text) && Math.random() < 0.4)
    triggerUndeadAction('warm_help');

  // 빚 증가 트리거
  if (/생명 흡수|사령|소환|죽음의 힘|언데드 스킬|부활/.test(text) && Math.random() < 0.5)
    triggerUndeadAction('cold_skill');
  if (/냉정하게|감정 없이|차갑게 처단|무감각|아무것도 느끼지/.test(text) && Math.random() < 0.4)
    triggerUndeadAction('cold_kill');

  // 금기 트리거
  if (/영원히 살|죽고 싶지 않아|두 번째 죽음이 두렵|떠나지 않겠|불멸/.test(text) && Math.random() < 0.6)
    triggerUndeadAction('cold_betray');

  // 집착 진척 트리거 (사슬 유형과 연관된 단어)
  if (data.chainType) {
    const ct = UNDEAD_CHAIN_TYPES[data.chainType];
    const matched = ct.progressTriggers.some(t => text.includes(t));
    if (matched && Math.random() < 0.5) advanceUndeadChain(5);
  }
}
window.detectUndeadActionFromText = detectUndeadActionFromText;

export function getUndeadBorrowedTimeStatus() {
  if (!isUndeadRace()) return null;
  const data = loadUndeadBorrowedTime();
  const chainDef = data.chainType ? UNDEAD_CHAIN_TYPES[data.chainType] : null;
  return {
    ...data,
    tempStage:  getUndeadSoulTempStage(data.soulTemp || 60),
    debtStage:  getUndeadDebtStage(data.worldDebt || 0),
    scaleStage: getUndeadDeathScaleStage(data.deathScale || 30),
    sightDef:   UNDEAD_DEATH_SIGHT_LEVELS[data.deathSightLevel || 0],
    chainDef:   chainDef
      ? { ...chainDef, chainSkills: (chainDef.chainSkills||[]).map(s=>({...s, unlocked:(data.chainProgress||0)>=s.threshold})) }
      : null
  };
}
window.getUndeadBorrowedTimeStatus = getUndeadBorrowedTimeStatus;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_231(){
async function advanceDungeonRoom(){
  const ds = window._dungeonSession;
  if(!ds) return;
  const roomArea = document.getElementById('dungeon-room-area');
  if(roomArea) roomArea.innerHTML = '<div style="text-align:center;padding:40px;color:#8060a0"><div style="font-size:24px;margin-bottom:10px">⚔️</div><div style="font-size:11px">AI가 다음 방을 생성 중...</div><div style="font-size:9px;color:#555;margin-top:6px">' + ds.dungeonName + ' · ' + ds.floor + '층</div></div>';
  ds.roomCount++;
  const gradeInfo2 = DUNGEON_GRADES[ds.grade||'D'];
  const roomsPerFloor = gradeInfo2.roomsPerFloor.min + Math.floor(Math.random()*(gradeInfo2.roomsPerFloor.max - gradeInfo2.roomsPerFloor.min + 1));
  if(ds.roomCount > 1 && (ds.roomCount - 1) % roomsPerFloor === 0){
    ds.floor++;
    // 최대 층 초과 = 던전 클리어
    if(ds.floor > (ds.maxFloors||99)){
      const bonus = Math.round((gradeInfo2.goldMult||1) * 200);
      S.gold = (S.gold||0) + bonus;
      saveGold(S.gold);
      toast(gradeInfo2.icon + ' 던전 클리어! 보너스 골드 +' + bonus, 4000);
      // [B67 FIX] "던전 완전탐험" 도전 과제 트래킹
      if(typeof updateChallenge==='function'){
        const dc = (parseInt(lsGet('tf-dungeons-completed-count')||'0',10)||0) + 1;
        lsSet('tf-dungeons-completed-count', String(dc));
        updateChallenge('dungeons_completed', dc);
      }
      // 던전 클리어 lore 해금
      const clearedLoc = loadCurrentLocation();
      if(clearedLoc && typeof onDungeonClear==='function') onDungeonClear(clearedLoc);
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        ' [🏆 던전 클리어] ' + ds.dungeonName + ' 전층 탐험 완료. 영웅적 귀환을 묘사하라.';
      window._dungeonSession = null;
      lsDel(DUNGEON_STATE_KEY);
      setTimeout(()=>{ window.openP('location'); renderLocationPanel(); }, 1500);
      return;
    }
    toast('⬇️ ' + ds.floor + '층으로 내려간다...', 2500);
  }
  try{
    // 같은 던전 재방문 시 DB에서 방 재활용 (30% 확률, 다른 층이나 방 유형 우선)
    let room = null;
    const db = loadDungeonDB();
    const sameRooms = db.rooms.filter(r=>
      r.dungeonName===ds.dungeonName &&
      r.roomType !== 'boss' && // 보스방은 항상 새로 생성
      Math.abs(r.floor - ds.floor) <= 1 // 같은 층 ±1
    );
    const isBossFloor = (ds.floor % 5 === 0);
    if(!isBossFloor && sameRooms.length >= 5 && Math.random() < 0.30){
      // 재활용 - 이전에 없던 유형 우선
      const usedTypes = ds._usedRoomTypes || [];
      const preferred = sameRooms.filter(r=>!usedTypes.includes(r.roomType));
      const pool = preferred.length ? preferred : sameRooms;
      const recycled = pool[Math.floor(Math.random()*pool.length)];
      room = {
        ...recycled,
        _resolved: false,
        _recycled: true,
        // 같은 방이지만 약간 변형된 묘사를 위해 플래그
        description: recycled.description,
      };
      toast('🗺️ 익숙한 구조의 방...', 1500);
    } else {
      room = await generateDungeonRoom(ds.dungeonName, ds.dungeonTheme, ds.floor, ds.roomCount, {hp:S.stats.hp,str:S.stats.str,agi:S.stats.agi,mgc:S.stats.mgc}, ds.prevRoomDesc||'');
      dbSaveRoom(room, ds.dungeonName, ds.dungeonTheme, ds.floor, S.scenario?.name||'');
    }
    // 사용한 방 유형 추적 (다양성 유지)
    ds._usedRoomTypes = [...(ds._usedRoomTypes||[]), room.roomType].slice(-10);
    room._resolved = false;
    ds.currentRoom = room;
    // 미니맵 이력 누적
    if(!ds.mapHistory) ds.mapHistory = [];
    const floorRooms = ds.mapHistory.filter(r=>r.floor===ds.floor);
    ds.mapHistory.push({ floor:ds.floor, roomIdx:floorRooms.length, type:room.roomType, title:room.title||'?', resolved:false });
    saveDungeonState(ds);
    dbSaveDungeon(ds);
    renderDungeonUI();
    S._nextInjectedContext = (S._nextInjectedContext||'') + ' [던전 ' + ds.floor + '층-' + ds.roomCount + '방: ' + (room.title||'?') + '] ' + (room.description||'').slice(0,80);
  }catch(e){
    console.warn('[던전 방 생성 실패]', e.message);
    const fbTypes = ['combat','trap','treasure','empty'];
    const fb = fbTypes[Math.floor(Math.random()*4)];
    ds.currentRoom = {roomType:fb,title:fb==='combat'?'몬스터의 방':fb==='trap'?'함정의 방':fb==='treasure'?'보물의 방':'조용한 방',description:fb==='combat'?'거대한 몬스터가 으르렁대며 달려온다!':fb==='trap'?'바닥에 정교한 함정이 깔려있다.':fb==='treasure'?'오래된 보물 상자가 놓여있다.':'아무것도 없는 조용한 방이다.',choices:[{id:'a',text:'정면으로 맞선다',stat:'str',riskLevel:2},{id:'b',text:'빠르게 회피한다',stat:'agi',riskLevel:1},{id:'c',text:'마법을 사용한다',stat:'mgc',riskLevel:2}],_resolved:false};
    saveDungeonState(ds);
    renderDungeonUI();
    toast('⚠️ AI 지연, 기본 방으로 진행', 2000);
  }
}
window.advanceDungeonRoom = advanceDungeonRoom;

window.advanceDungeonRoom    = advanceDungeonRoom;
}

