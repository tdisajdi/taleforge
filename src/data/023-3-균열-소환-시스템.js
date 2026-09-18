// 🌀 3. 균열 소환 시스템 — data
// Pure data split out of summon/023-3-균열-소환-시스템.js (see generate.js).

export const VOID_SUMMON_POOL = {
  2: [
    { id: 'vs_shade',     name: '그림자 조각',    icon: '🌑', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7" stroke-width="1.2" opacity="0.6"/><circle cx="12" cy="12" r="7" fill="currentColor" fill-opacity="0.4" stroke="none"/></svg>', tier: 1, hp: 20, atk: 8,  desc: '희미한 그림자 파편. 적에게 FEAR +5 부여. 빛에 닿으면 즉시 소멸.', mpCost: 15 },
  ],
  3: [
    { id: 'vs_shade',     name: '그림자 조각',    icon: '🌑', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7" stroke-width="1.2" opacity="0.6"/><circle cx="12" cy="12" r="7" fill="currentColor" fill-opacity="0.4" stroke="none"/></svg>', tier: 1, hp: 20, atk: 8,  desc: '희미한 그림자 파편. 적에게 FEAR +5 부여. 빛에 닿으면 즉시 소멸.', mpCost: 15 },
    { id: 'vs_wraith',    name: '공허 망령',      icon: '👻', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 21 12 21 Z" stroke-linejoin="round" opacity="0.7"/></svg>', tier: 2, hp: 45, atk: 15, desc: '공허 차원의 망령. 적의 WIL과 FATH을 매 턴 -5 약화. 물리 공격 면역.', mpCost: 25 },
  ],
  4: [
    { id: 'vs_wraith',    name: '공허 망령',      icon: '👻', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 4 15.5 4 9.5 C4 6.5 6.2 4.5 8.8 4.5 C10.2 4.5 11.3 5.2 12 6.3 C12.7 5.2 13.8 4.5 15.2 4.5 C17.8 4.5 20 6.5 20 9.5 C20 15.5 12 21 12 21 Z" stroke-linejoin="round" opacity="0.7"/></svg>', tier: 2, hp: 45, atk: 15, desc: '공허 차원의 망령. 적의 WIL과 FATH을 매 턴 -5 약화. 물리 공격 면역.', mpCost: 25 },
    { id: 'vs_voidbeast', name: '공허 맹수',      icon: '🐺', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 C4 16 6 14 6 11 C6 8.5 7.5 7 9.5 7 C11.5 7 13 8.5 13 11 C13 14 15 16 15 20"/><path d="M15 20 C15 17 16.5 15.5 18 15.5 C19.5 15.5 20.5 17 20.5 19"/></svg>', tier: 3, hp: 80, atk: 28, desc: '어둠 차원에서 끌려온 맹수. STR 기반 공격. 처치 시 그림자 폭발로 FEAR +15.', mpCost: 38 },
  ],
  5: [
    { id: 'vs_voidbeast', name: '공허 맹수',      icon: '🐺', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 C4 16 6 14 6 11 C6 8.5 7.5 7 9.5 7 C11.5 7 13 8.5 13 11 C13 14 15 16 15 20"/><path d="M15 20 C15 17 16.5 15.5 18 15.5 C19.5 15.5 20.5 17 20.5 19"/></svg>', tier: 3, hp: 80, atk: 28, desc: '어둠 차원에서 끌려온 맹수. STR 기반 공격. 처치 시 그림자 폭발로 FEAR +15.', mpCost: 38 },
    { id: 'vs_dread',     name: '절망의 현신',    icon: '😱', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.6" fill="currentColor" stroke="none"/></svg>', tier: 4, hp: 120, atk: 40, desc: '공포 자체가 형태를 갖춘 존재. 접촉한 적에게 "절망" 상태이상. 모든 판정 -20.', mpCost: 50 },
  ],
  6: [
    { id: 'vs_dread',     name: '절망의 현신',    icon: '😱', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C7.5 3 4.5 6.2 4.5 10.5 C4.5 13.2 6 15.3 6 17 L6 18.5 L18 18.5 L18 17 C18 15.3 19.5 13.2 19.5 10.5 C19.5 6.2 16.5 3 12 3 Z" stroke-width="1.3"/><circle cx="9" cy="11" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.6" fill="currentColor" stroke="none"/></svg>', tier: 4, hp: 120, atk: 40, desc: '공포 자체가 형태를 갖춘 존재. 접촉한 적에게 "절망" 상태이상. 모든 판정 -20.', mpCost: 50 },
    { id: 'vs_voidlord',  name: '공허의 군주',    icon: '👑', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/></svg>', tier: 5, hp: 200, atk: 65, desc: '공허 차원의 지배자. 전장 전체에 공허 영역 생성. 적 전체 매 턴 HP -8, WIL -8.', mpCost: 70 },
  ],
  7: [
    { id: 'vs_voidlord',  name: '공허의 군주',    icon: '👑', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/></svg>', tier: 5, hp: 200, atk: 65, desc: '공허 차원의 지배자. 전장 전체에 공허 영역 생성. 적 전체 매 턴 HP -8, WIL -8.', mpCost: 70 },
    { id: 'vs_abyss',     name: '심연 그 자체',   icon: '⚫', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/></svg>', tier: 6, hp: 350, atk: 100, desc: '공허도 7단계 전용. 형태 없는 심연. 빛과 신성한 존재를 자동으로 흡수 소멸.', mpCost: 100 },
  ],
};
