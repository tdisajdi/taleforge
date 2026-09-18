// ① NPC 관계도 시각화
// Auto-extracted from taleforge.html (original section banner preserved above).
import { getNpcEmotion, renderNpcs } from '../items/065-NPC퀘스트-완성도-강화.js';
import { loadNPCs } from '../misc/001-block0-preamble.js';
import { loadNpcNetwork } from './067-③-NPC-관계망-시스템.js';

window._npcTab = 'list';

export function switchNpcTab(tab) {
  window._npcTab = tab;
  const listPane  = document.getElementById('pb-npcs');
  const graphPane = document.getElementById('pb-npcs-graph');
  const tabList   = document.getElementById('npc-tab-list');
  const tabGraph  = document.getElementById('npc-tab-graph');
  if (!listPane || !graphPane) return;

  if (tab === 'list') {
    listPane.style.display  = '';
    graphPane.style.display = 'none';
    tabList.style.borderBottomColor  = 'var(--gold)';
    tabList.style.color              = 'var(--gold)';
    tabList.style.background         = 'var(--bg-bubble-ai)';
    tabGraph.style.borderBottomColor = 'transparent';
    tabGraph.style.color             = 'var(--dim)';
    tabGraph.style.background        = 'var(--bg-input)';
    renderNpcs();
  } else {
    listPane.style.display  = 'none';
    graphPane.style.display = 'flex';
    tabGraph.style.borderBottomColor = 'var(--gold)';
    tabGraph.style.color             = 'var(--gold)';
    tabGraph.style.background        = 'var(--bg-bubble-ai)';
    tabList.style.borderBottomColor  = 'transparent';
    tabList.style.color              = 'var(--dim)';
    tabList.style.background         = 'var(--bg-input)';
    renderNpcGraph();
  }
}
window.switchNpcTab = switchNpcTab;

export function renderNpcGraph() {
  const container = document.getElementById('pb-npcs-graph');
  if (!container) return;
  const npcs = (typeof loadNPCs === 'function' ? loadNPCs() : []) || [];
  const network = (typeof loadNpcNetwork === 'function' ? loadNpcNetwork() : {}) || {};

  if (!npcs.length) {
    container.innerHTML = '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--dim);font-size:11px">아직 만난 NPC가 없습니다</div>';
    return;
  }

  const W = container.clientWidth  || 360;
  const H = container.clientHeight || 420;
  const cx = W / 2, cy = H / 2;
  const r  = Math.min(cx, cy) * 0.68;

  // 위치 배치 (원형)
  const pos = {};
  npcs.forEach((npc, i) => {
    const angle = (2 * Math.PI * i / npcs.length) - Math.PI / 2;
    pos[npc.name] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  // 엣지 (관계)
  let edgeSVG = '';
  npcs.forEach(npc => {
    const net = network[npc.name] || {};
    (net.friends || []).forEach(friendName => {
      const from = pos[npc.name];
      const to   = pos[friendName];
      if (!from || !to) return;
      const rel1 = npc.relationship || 50;
      const friend = npcs.find(n => n.name === friendName);
      const rel2 = friend?.relationship || 50;
      const avgRel = (rel1 + rel2) / 2;
      const edgeColor = avgRel >= 70 ? '#4a9a6a44' : avgRel < 30 ? '#e05a5a44' : '#c8a96e33';
      edgeSVG += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${edgeColor}" stroke-width="1.5"/>`;
    });
  });

  // 노드
  // [도트 아이콘] 만난 NPC 중 정적 데이터(동료·퀘스트 NPC 등)로 이미
  // 도트 이미지가 있는 경우는 그걸 쓰고, 없으면(플레이 중 동적으로
  // 생긴 NPC) 원래 이모지 그대로 둔다 — SVG <text>는 <img> HTML을
  // 못 담으므로 매니페스트를 직접 조회해 <image> 엘리먼트로 그린다.
  const npcManifest = window.PIXEL_ART_MANIFEST;
  let nodeSVG = '';
  let tooltipHTML = '';
  npcs.forEach(npc => {
    const p   = pos[npc.name];
    const rel = npc.relationship || 50;
    const nodeColor = rel >= 70 ? '#4a9a6a' : rel < 30 ? '#e05a5a' : '#c8a96e';
    const nodeR = 18 + Math.round((rel / 100) * 8);
    const npcHit = npcManifest && ((npc.id!=null && npcManifest.byId[npc.id]) || (npc.name && npcManifest.byName[npc.name]));
    const iconSize = 16;
    const iconEl = npcHit
      ? `<image href="assets/${npcHit.path}" x="${p.x-iconSize/2}" y="${p.y-iconSize/2}" width="${iconSize}" height="${iconSize}" style="image-rendering:pixelated" pointer-events="none"/>`
      : `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-size="14">${npc.icon || '👤'}</text>`;

    // 원 + 아이콘/이모지 + 이름 + 호감도 막대
    nodeSVG += `
      <g style="cursor:pointer" onclick="showNpcGraphDetail('${npc.name.replace(/'/g,"\\'")}')">
        <circle cx="${p.x}" cy="${p.y}" r="${nodeR}" fill="#0d0800" stroke="${nodeColor}" stroke-width="1.5"/>
        ${iconEl}
        <text x="${p.x}" y="${p.y + nodeR + 11}" text-anchor="middle" font-size="8" fill="${nodeColor}" font-family="Cinzel,serif">${(npc.name||'').slice(0,5)}</text>
        <text x="${p.x}" y="${p.y + nodeR + 20}" text-anchor="middle" font-size="8" fill="${nodeColor}">${rel}</text>
      </g>`;
  });

  container.innerHTML = `
    <div style="flex:1;position:relative;overflow:hidden">
      <svg width="${W}" height="${H}" style="position:absolute;top:0;left:0">
        <defs>
          <filter id="glow-relgraph"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        ${edgeSVG}
        ${nodeSVG}
      </svg>
      <div id="npc-graph-detail" style="position:absolute;bottom:0;left:0;right:0;background:var(--bg-input);border-top:1px solid var(--border);padding:10px 13px;font-size:10px;color:var(--text);display:none;max-height:120px;overflow-y:auto"></div>
    </div>
    <div style="padding:6px 12px;font-size:9px;color:var(--dim);text-align:center;border-top:1px solid var(--border);flex-shrink:0">
      🟢 호감 70+　⬜ 중립　🔴 적대 30−　· 노드를 탭하면 상세 정보
    </div>`;
}
window.renderNpcGraph = renderNpcGraph;

export function showNpcGraphDetail(npcName) {
  const npcs = (typeof loadNPCs === 'function' ? loadNPCs() : []) || [];
  const npc  = npcs.find(n => n.name === npcName);
  if (!npc) return;
  const detail = document.getElementById('npc-graph-detail');
  if (!detail) return;
  const rel    = npc.relationship || 50;
  const emo    = (typeof getNpcEmotion === 'function') ? getNpcEmotion(rel) : { icon:'😐', label:'보통' };
  const network= (typeof loadNpcNetwork === 'function' ? loadNpcNetwork() : {}) || {};
  const net    = network[npcName] || {};
  const friends = (net.friends || []).join(', ') || '없음';

  detail.style.display = 'block';
  detail.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
      <span style="font-size:20px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(npc,{size:20}):(npc.icon||'👤')}</span>
      <div>
        <div style="font-family:Cinzel,serif;font-size:11px;color:var(--gold)">${npc.name} <span style="font-size:10px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(emo,{size:11}):(emo.icon)} ${emo.label}</span></div>
        <div style="font-size:9px;color:var(--dim)">${npc.role || ''}</div>
      </div>
      <div style="margin-left:auto;font-family:Cinzel,serif;font-size:13px;color:${rel>=70?'#60a060':rel<30?'#e05a5a':'var(--gold)'}">${rel}</div>
    </div>
    <div style="height:3px;background:#1a1005;border-radius:2px;overflow:hidden;margin-bottom:5px">
      <div style="width:${rel}%;height:100%;background:${rel>=70?'#4a9a6a':rel<30?'#e05a5a':'#c8a96e'};border-radius:2px"></div>
    </div>
    <div style="color:var(--dim);font-size:9px">지인: ${friends}</div>
    <button onclick="document.getElementById('npc-graph-detail').style.display='none'" style="margin-top:5px;background:none;border:1px solid var(--border);color:var(--dim);font-size:8px;padding:2px 8px;cursor:pointer;width:100%">닫기</button>`;
}
window.showNpcGraphDetail = showNpcGraphDetail;
