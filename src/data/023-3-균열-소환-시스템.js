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

// [61-3번 섹션] 마계 소환 — 균열 소환(다크링 전용)과 같은 구조를
// 악마족에게도 제공한다. 악마족은 다크링의 "공허도" 대신 이미 갖고
// 있던 자체 단계 진행치(progression/020의 DEMON_CORRUPTION_STAGES,
// 0~7단계 — 공허도와 동일한 범위)를 그대로 게이트로 재사용해, 새
// 진행 시스템을 만들지 않았다. 수치 커브(hp/atk/mpCost)도 공허
// 소환과 동일하게 맞춰 밸런스 일관성을 유지하고, 테마만 그림자/공허
// 대신 지옥/계약으로 바꿨다.
export const DEMON_SUMMON_POOL = {
  2: [
    { id: 'ds_imp',       name: '임프',           icon: '👹', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7" stroke-width="1.2" opacity="0.6"/><path d="M9 9 L7 6 M15 9 L17 6" stroke-width="1.1"/></svg>', tier: 1, hp: 20, atk: 8,  desc: '하급 마계 종자. 적을 비웃어 NEG +5 유발. 금방 흩어지는 약한 존재.', mpCost: 15 },
  ],
  3: [
    { id: 'ds_imp',       name: '임프',           icon: '👹', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7" stroke-width="1.2" opacity="0.6"/><path d="M9 9 L7 6 M15 9 L17 6" stroke-width="1.1"/></svg>', tier: 1, hp: 20, atk: 8,  desc: '하급 마계 종자. 적을 비웃어 NEG +5 유발. 금방 흩어지는 약한 존재.', mpCost: 15 },
    { id: 'ds_hellhound', name: '지옥 사냥개',    icon: '🐕', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19 C4 15 6 13 9 13 C12 13 13 15 14 19"/><path d="M14 19 C15 16.5 17 15 19 15" stroke-width="1.2"/></svg>', tier: 2, hp: 45, atk: 15, desc: '지옥의 사냥개. 적의 FEAR를 매 턴 +5 축적. 화염에 면역.', mpCost: 25 },
  ],
  4: [
    { id: 'ds_hellhound', name: '지옥 사냥개',    icon: '🐕', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19 C4 15 6 13 9 13 C12 13 13 15 14 19"/><path d="M14 19 C15 16.5 17 15 19 15" stroke-width="1.2"/></svg>', tier: 2, hp: 45, atk: 15, desc: '지옥의 사냥개. 적의 FEAR를 매 턴 +5 축적. 화염에 면역.', mpCost: 25 },
    { id: 'ds_tormentor', name: '고문자',         icon: '🔥', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 C4 16 6 14 6 11 C6 8.5 7.5 7 9.5 7 C11.5 7 13 8.5 13 11 C13 14 15 16 15 20"/></svg>', tier: 3, hp: 80, atk: 28, desc: '죄인을 벌하는 마계 집행자. STR 기반 공격. 처치 시 화염 폭발로 FEAR +15.', mpCost: 38 },
  ],
  5: [
    { id: 'ds_tormentor', name: '고문자',         icon: '🔥', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 C4 16 6 14 6 11 C6 8.5 7.5 7 9.5 7 C11.5 7 13 8.5 13 11 C13 14 15 16 15 20"/></svg>', tier: 3, hp: 80, atk: 28, desc: '죄인을 벌하는 마계 집행자. STR 기반 공격. 처치 시 화염 폭발로 FEAR +15.', mpCost: 38 },
    { id: 'ds_contractor',name: '계약의 악마',    icon: '📜', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4 L5 20 L19 20 L19 4 Z" stroke-linejoin="round"/><path d="M8 9 L16 9 M8 13 L16 13" stroke-width="1.1"/></svg>', tier: 4, hp: 120, atk: 40, desc: '영혼 계약을 전문으로 하는 악마. 접촉한 적에게 "굴종" 상태이상. 모든 판정 -20.', mpCost: 50 },
  ],
  6: [
    { id: 'ds_contractor',name: '계약의 악마',    icon: '📜', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4 L5 20 L19 20 L19 4 Z" stroke-linejoin="round"/><path d="M8 9 L16 9 M8 13 L16 13" stroke-width="1.1"/></svg>', tier: 4, hp: 120, atk: 40, desc: '영혼 계약을 전문으로 하는 악마. 접촉한 적에게 "굴종" 상태이상. 모든 판정 -20.', mpCost: 50 },
    { id: 'ds_duke',      name: '지옥 공작',      icon: '👑', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/></svg>', tier: 5, hp: 200, atk: 65, desc: '마계 서열 상위 공작. 전장에 유황 안개를 펼쳐 적 전체 매 턴 HP -8, END -8.', mpCost: 70 },
  ],
  7: [
    { id: 'ds_duke',      name: '지옥 공작',      icon: '👑', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 L3 8 L7.5 12 L12 4 L16.5 12 L21 8 L21 17 Z" stroke-linejoin="round"/></svg>', tier: 5, hp: 200, atk: 65, desc: '마계 서열 상위 공작. 전장에 유황 안개를 펼쳐 적 전체 매 턴 HP -8, END -8.', mpCost: 70 },
    { id: 'ds_primordial',name: '원초 악마',      icon: '🌋', svgIcon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/></svg>', tier: 6, hp: 350, atk: 100, desc: '타락도 7단계 전용. 형태를 갖추기 전의 혼돈. 신성한 존재를 자동으로 불태워 소멸.', mpCost: 100 },
  ],
};
