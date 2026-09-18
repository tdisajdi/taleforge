// [3] 진화(Evolution) 시스템 — data
// Pure data split out of misc/206-3-진화Evolution-시스템.js (see generate.js).

export const EVO_JOBS = ['warrior','mage','rogue','ranger','paladin','necromancer',
                  'archmage','swordmaster','shadowblade','dragoon'];

export const EVO_STAGES = [
  { level:0,  name:'각성 전',  energy:0,   icon:'🌱', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 L12 12"/><path d="M12 12 C10 12 9 10.5 9 9 C10.5 9 12 10 12 12 Z" stroke-width="1.2"/></svg>', bonus:{} },
  { level:1,  name:'각성',     energy:100, icon:'⚡', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L6 13 L11 13 L10 22 L18 10 L13 10 Z" stroke-linejoin="round"/></svg>', bonus:{ str:5, agi:5 } },
  { level:2,  name:'성장',     energy:250, icon:'🌿', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 12 12 12 8 C12 4.5 9 3 6 3 C6 6.5 8 9 12 9" stroke-linejoin="round"/><path d="M12 14 C12 14 12 9 15 7.5 C17 6.5 19 7 19 7 C19 9.5 17 12.5 12 12.5" stroke-linejoin="round"/></svg>', bonus:{ str:10, int:10 } },
  { level:3,  name:'개화',     energy:500, icon:'🌸', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.3"/><circle cx="12" cy="7" r="2.6"/><circle cx="16.3" cy="9.5" r="2.6"/><circle cx="16.3" cy="14.5" r="2.6"/><circle cx="12" cy="17" r="2.6"/><circle cx="7.7" cy="14.5" r="2.6"/><circle cx="7.7" cy="9.5" r="2.6"/></svg>', bonus:{ str:20, agi:15, int:15 } },
  { level:4,  name:'극한',     energy:1000,icon:'🌟', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L14.7 9 L22 9.8 L16.5 14.6 L18.2 22 L12 18 L5.8 22 L7.5 14.6 L2 9.8 L9.3 9 Z" stroke-linejoin="round"/></svg>', bonus:{ str:30, agi:25, int:25, luk:20 } },
  { level:5,  name:'초월',     energy:2000,icon:'👑', svgIcon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/><path d="M3 17 L21 17 L21 20 L3 20 Z" stroke-linejoin="round"/></svg>', bonus:{ str:50, agi:40, int:40, luk:30, cha:20 } },
];
