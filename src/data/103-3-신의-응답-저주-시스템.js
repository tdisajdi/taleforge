// 3. 신의 응답 / 저주 시스템 — data
// Pure data split out of religion/103-3-신의-응답-저주-시스템.js (see generate.js).

export const DIVINE_RESPONSES = {
  temple: [
    { type:'blessing', minFaith:70, trigger:'near_death',   effect:{hp:30,wil:5},  msg:'⛪ 세계수의 가지가 당신을 감쌌다. HP+30, 의지+5!', icon:'🌳' },
    { type:'blessing', minFaith:60, trigger:'quest_done',   effect:{exp:50,fath:5}, msg:'⛪ 순환의 사원이 당신의 공을 인정한다. 경험+50!', icon:'⛪' },
    { type:'blessing', minFaith:80, trigger:'crit_success', effect:{hp:15,mp:15},  msg:'⛪ 세계수의 가호! HP+15 MP+15', icon:'🌿' },
    { type:'curse',    minFaith:0,  trigger:'betray_npc',   effect:{wil:-10},       msg:'⛪ 배신으로 순환의 사원에서 파문당했다. 의지-10!', icon:'💔' },
  ],
  solar: [
    { type:'blessing', minFaith:70, trigger:'crit_success', effect:{str:5,hp:20},  msg:'☀️ 태양신의 빛이 당신에게 힘을 불어넣었다! STR+5 HP+20', icon:'☀️' },
    { type:'blessing', minFaith:80, trigger:'kill_undead',  effect:{exp:100,fath:10},msg:'☀️ 태양신이 기뻐하신다! 언데드 정화 공로를 인정받았다.', icon:'✨' },
    { type:'curse',    minFaith:0,  trigger:'use_dark_magic',effect:{hp:-20,fath:-15},msg:'☀️ 어둠의 마법 사용으로 태양신의 노여움을 샀다!', icon:'⚡' },
  ],
  roots: [
    { type:'blessing', minFaith:65, trigger:'visit_nature', effect:{hp:25,per:5},  msg:'🌿 자연령이 당신을 반겼다. HP+25 지각+5', icon:'🌿' },
    { type:'blessing', minFaith:75, trigger:'crit_success', effect:{agi:5,luk:5},  msg:'🌿 뿌리 신앙의 가호! 민첩+5 행운+5', icon:'🍀' },
    { type:'curse',    minFaith:0,  trigger:'destroy_nature',effect:{per:-10,luk:-5},msg:'🌿 자연을 파괴해 조상신의 저주를 받았다!', icon:'🍂' },
  ],
  abyss: [
    { type:'blessing', minFaith:60, trigger:'make_deal',    effect:{neg:10,str:5}, msg:'😈 계약의 신이 힘을 빌려줬다. 협상+10 STR+5', icon:'😈' },
    { type:'blessing', minFaith:50, trigger:'betray_npc',   effect:{str:8,disg:5}, msg:'😈 배신으로 심연이 기뻐한다. STR+8 위장+5', icon:'🌑' },
    { type:'curse',    minFaith:0,  trigger:'refuse_deal',  effect:{str:-10,fear:10},msg:'😈 계약을 거부하자 심연이 처벌한다!', icon:'💀' },
  ],
};
