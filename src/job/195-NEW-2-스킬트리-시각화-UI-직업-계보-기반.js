// ★ NEW 2: 스킬트리 시각화 UI (직업 계보 기반)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { SKILL_TREE_SP_COST, getSkillPrereqs, getSkillUnlockable } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { findJob, getAllBaseJobs } from './042-직업-시스템-무한-파생-도감.js';

export function getJobAncestryChain(jobId){
  const chain = [];
  let cur = findJob(jobId);
  const seen = new Set();
  while(cur && !seen.has(cur.id)){
    seen.add(cur.id);
    chain.unshift(cur);
    cur = cur.parentId ? findJob(cur.parentId) : null;
  }
  return chain;
}
window.getJobAncestryChain = getJobAncestryChain;

export function getJobDirectChildren(jobId){
  return getAllBaseJobs().filter(j => j.parentId === jobId);
}
window.getJobDirectChildren = getJobDirectChildren;

export function getJobLineageTree(currentJobId){
  const ancestry = getJobAncestryChain(currentJobId); // [T1, T2, ..., 현재]
  const generations = ancestry.map(j => [j]);

  // 현재 직업부터 자손 방향으로 BFS — 여러 세대, 여러 가지 모두 포함
  let frontier = [currentJobId];
  const visited = new Set(ancestry.map(j=>j.id));
  while(frontier.length){
    const nextGenJobs = [];
    frontier.forEach(pid=>{
      getJobDirectChildren(pid).forEach(child=>{
        if(!visited.has(child.id)){
          visited.add(child.id);
          nextGenJobs.push(child);
        }
      });
    });
    if(!nextGenJobs.length) break;
    generations.push(nextGenJobs);
    frontier = nextGenJobs.map(j=>j.id);
  }
  return generations;
}
window.getJobLineageTree = getJobLineageTree;

export function renderSkillTreePanel(){
  const body = document.getElementById('pb-skilltree');
  if(!body) return;
  const unlocked = S.unlockedSkills||{};
  const stats = S.stats||{};
  const titles = S.titles||[];
  const sp = S.skillSP||0;
  const currentJobId = (S.character && (S.character.jobId || S.character.job)) || '';
  const currentJob = findJob(currentJobId);

  if(!currentJob){
    body.innerHTML = `<div style="padding:20px;text-align:center;font-size:10px;color:var(--dim)">현재 직업 정보를 찾을 수 없습니다.</div>`;
    return;
  }

  const generations = getJobLineageTree(currentJobId);
  const rc = (sk)=>({common:'#6a8a6a',uncommon:'#4a9a6a',rare:'#4a6fa5',legendary:'#c8a96e',event:'#e05a5a'}[sk.rarity]||'#6a6a6a');

  // 계보 경로 표시용 (조상 → 현재 이름만 요약)
  const ancestry = getJobAncestryChain(currentJobId);
  const pathLabel = ancestry.map(j=>`${j.icon||'💼'} ${j.name}`).join(' → ');

  function renderJobNode(job, isCurrent){
    const jobSkills = job.skills || [];
    const border = isCurrent ? '#c8a96e' : '#3a3020';
    return `<div style="margin-bottom:10px;padding:8px;background:${isCurrent?'#0f0a02':'#080604'};border:1px solid ${border};border-radius:5px;${isCurrent?'box-shadow:0 0 8px #c8a96e33':''}">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px">
        <span style="font-size:15px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(job,{size:15}):(job.icon||"💼")}</span>
        <span style="font-family:Cinzel,serif;font-size:10px;color:${isCurrent?'#c8a96e':'#a08040'};letter-spacing:1px">${job.name}</span>
        ${isCurrent?'<span style="font-size:7px;color:#c8a96e;border:1px solid #c8a96e55;padding:1px 5px;border-radius:8px">현재</span>':''}
        <span style="font-size:7px;color:var(--dim);margin-left:auto">T${job.tier||1}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${jobSkills.map(sk=>{
          const prereqs = (typeof getSkillPrereqs==='function') ? getSkillPrereqs(sk.id) : [];
          const prereqMet = prereqs.every(pid=>!!unlocked[pid]);
          const isUnlocked = !!unlocked[sk.id];
          const canUnlock = !isUnlocked && prereqMet && getSkillUnlockable(sk.id, unlocked, stats, titles);
          const cost = SKILL_TREE_SP_COST(sk);
          const color = rc(sk);
          const opacity = isUnlocked ? 1 : prereqMet ? 0.8 : 0.4;
          const skBorder = isUnlocked ? color : prereqMet ? color+'88' : '#1a1a1a';
          const bg = isUnlocked ? '#0a0f05' : '#060604';
          const allSkillsFlat = job.skills||[];
          const prereqNames = prereqs.map(pid=>{ const ps=allSkillsFlat.find(s=>s.id===pid); return ps?ps.name:pid; }).join(', ');
          return `<div style="position:relative;padding:6px 8px;background:${bg};border:1px solid ${skBorder};border-radius:4px;width:calc(50% - 4px);box-sizing:border-box;opacity:${opacity};cursor:${canUnlock?'pointer':'default'}"
            onclick="${canUnlock?`unlockSkill('${sk.id}');renderSkillTreePanel()`:''}">
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
              <span style="font-size:12px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(sk,{size:12}):(sk.icon||"⚡")}</span>
              <span style="font-family:Cinzel,serif;font-size:8px;color:${color};flex:1">${sk.name}</span>
              ${isUnlocked?'<span style="font-size:7px;color:#60c060">✓</span>':canUnlock?`<span style="font-size:7px;color:#c8a96e">SP${cost}</span>`:'<span style="font-size:7px;color:var(--dim)">🔒</span>'}
            </div>
            <div style="font-size:7px;color:var(--dim);line-height:1.3">${sk.desc||''}</div>
            ${prereqs.length?`<div style="font-size:6px;color:#604020;margin-top:2px">↑ 선행: ${prereqNames}</div>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  body.innerHTML = `
    <div style="padding:10px 14px">
      <div style="font-family:Cinzel,serif;font-size:11px;color:#c8a96e;letter-spacing:2px;margin-bottom:2px">⚡ 스킬 트리</div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:4px">보유 SP: <span style="color:#80c040;font-weight:bold">${sp}</span></div>
      <div style="font-size:8px;color:#806840;margin-bottom:12px;padding:6px 8px;background:#0a0805;border-radius:4px;border:1px solid #2a2000">📍 현재 계보: ${pathLabel}</div>
      ${generations.map((gen, genIdx)=>{
        const isLast = genIdx===generations.length-1;
        return `
        <div style="position:relative">
          ${gen.map(job=>renderJobNode(job, job.id===currentJobId)).join('')}
        </div>
        ${!isLast?`<div style="text-align:center;font-size:11px;color:#604020;margin:-4px 0 6px">↓</div>`:''}
        `;
      }).join('')}
      ${generations.length<=ancestry.length ? `
        <div style="margin-top:6px;padding:8px;text-align:center;font-size:8px;color:var(--dim);border:1px dashed #2a2000;border-radius:4px">
          아직 이 직업에서 더 파생된 경로가 없습니다.<br>전직 화면에서 "✨ AI 직업 탐색"으로 다음 단계를 발견해보세요.
        </div>` : ''}
    </div>`;
}
window.renderSkillTreePanel = renderSkillTreePanel;

window.renderSkillTreePanel = renderSkillTreePanel;

window.getJobAncestryChain = getJobAncestryChain;

window.getJobDirectChildren = getJobDirectChildren;

window.getJobLineageTree = getJobLineageTree;
