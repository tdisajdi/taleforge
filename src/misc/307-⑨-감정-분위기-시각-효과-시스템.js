// ⑨ 🎵 감정 분위기 시각 효과 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).

(function initAtmosphereEffects(){
  const style = document.createElement('style');
  style.textContent = `
    @keyframes combatPulse{0%,100%{background-color:rgba(160,20,20,0)}50%{background-color:rgba(160,20,20,0.06)}}
    @keyframes mysteriousParticle{0%{opacity:0;transform:translateY(0) scale(0)}50%{opacity:.7}100%{opacity:0;transform:translateY(-60px) scale(1.2)}}
    @keyframes sadGray{0%,100%{opacity:0}50%{opacity:1}}
    .atm-combat-overlay{position:fixed;inset:0;pointer-events:none;z-index:50;animation:combatPulse 1.5s infinite}
    .atm-mystic-overlay{position:fixed;inset:0;pointer-events:none;z-index:50;overflow:hidden}
    .atm-mystic-particle{position:absolute;width:4px;height:4px;border-radius:50%;background:radial-gradient(circle,#e8d070,#c8a020);animation:mysteriousParticle 3s ease-out forwards;pointer-events:none}
    .atm-sad-overlay{position:fixed;inset:0;pointer-events:none;z-index:50;background:rgba(60,60,80,0.12);animation:sadGray 2s ease forwards}
  `;
  document.head.appendChild(style);
})();

window._lastAtmMood = null;

export function applyAtmosphereEffect(mood){
  // 이전 오버레이 제거
  document.querySelectorAll('.atm-combat-overlay,.atm-mystic-overlay,.atm-sad-overlay').forEach(e=>e.remove());
  if(!mood || mood === window._lastAtmMood) return;
  window._lastAtmMood = mood;
  const msgs = document.getElementById('msgs');
  if(!msgs) return;
  if(mood === 'combat'){
    const div = document.createElement('div');
    div.className = 'atm-combat-overlay';
    document.body.appendChild(div);
    setTimeout(()=>div.remove(), 5000);
  } else if(mood === 'mystic'){
    const ov = document.createElement('div');
    ov.className = 'atm-mystic-overlay';
    document.body.appendChild(ov);
    for(let i=0;i<8;i++){
      setTimeout(()=>{
        const p = document.createElement('div');
        p.className = 'atm-mystic-particle';
        p.style.left = Math.random()*100+'%';
        p.style.bottom = Math.random()*30+'%';
        ov.appendChild(p);
        setTimeout(()=>p.remove(), 3000);
      }, i*300);
    }
    setTimeout(()=>ov.remove(), 5000);
  } else if(mood === 'sad'){
    const div = document.createElement('div');
    div.className = 'atm-sad-overlay';
    document.body.appendChild(div);
    setTimeout(()=>div.remove(), 4000);
  }
}
window.applyAtmosphereEffect = applyAtmosphereEffect;

export function detectMoodFromText(aiText){
  const lc = (aiText||'').toLowerCase();
  if(/전투|공격|베어|급습|피를|전장|보스|죽음|사망/.test(lc)) return 'combat';
  if(/신비|마법|고대|유적|예언|환영|꿈|신령|마력|봉인/.test(lc)) return 'mystic';
  if(/슬픔|눈물|상실|비통|애도|절망|홀로|쓸쓸|작별/.test(lc)) return 'sad';
  return null;
}
window.detectMoodFromText = detectMoodFromText;

window.applyAtmosphereEffect = applyAtmosphereEffect;

window.detectMoodFromText = detectMoodFromText;
