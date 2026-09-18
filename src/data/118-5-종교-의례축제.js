// 5. 종교 의례/축제 — data
// Pure data split out of religion/118-5-종교-의례축제.js (see generate.js).

export const RELIGION_RITUALS = {
  temple: [
    { id:'rit_cycle_new',   name:'새 순환제',     icon:'🌱', turn_mod:50,  effect:{hp:30, fath:10}, desc:'50턴마다. 세계수에 새 생명을 바치는 의식.' },
    { id:'rit_memory_day',  name:'기억의 날',      icon:'🪞', turn_mod:100, effect:{per:5, wil:5},   desc:'100턴마다. 망자를 기리며 과거를 떠올린다.' },
    { id:'rit_tree_prayer', name:'세계수 기도',    icon:'🌳', turn_mod:30,  effect:{hp:15,mp:15},    desc:'30턴마다. 세계수에 기도하면 HP·MP 회복.' },
  ],
  solar: [
    { id:'rit_sun_rise',    name:'일출 봉헌',      icon:'☀️', turn_mod:20,  effect:{str:3, rep:5},   desc:'20턴마다. 일출 방향으로 기도하면 STR+3.' },
    { id:'rit_heresy_pyre', name:'이단 정화식',    icon:'🔥', turn_mod:80,  effect:{rep:15, fath:10},desc:'80턴마다. 이단 혐의자를 심문·처벌하는 의식.' },
  ],
  roots: [
    { id:'rit_ancestor',    name:'조상 제사',      icon:'👥', turn_mod:40,  effect:{per:8, luk:5},   desc:'40턴마다. 조상신에게 제물을 바친다.' },
    { id:'rit_nature_fest', name:'자연 축제',      icon:'🌿', turn_mod:60,  effect:{hp:25,per:5},    desc:'60턴마다. 자연 속에서 노래하고 춤춘다.' },
  ],
  abyss: [
    { id:'rit_blood_pact',  name:'혈약 의식',      icon:'🩸', turn_mod:35,  effect:{str:10,neg:5, fath:-10}, desc:'35턴마다. 피로 계약을 갱신. 힘↑ 신앙↓' },
  ],
  loop_faith: [
    { id:'rit_loop_mark',   name:'루프 표식 의식', icon:'♾️', turn_mod:cycle=>Math.max(10,50-cycle*5),
      effect:{per:5,luk:5}, desc:'회차가 쌓일수록 더 자주 의식 기회가 온다.' },
  ],
  void_silence: [
    { id:'rit_great_silence','name':'대침묵 의식', icon:'🌑', turn_mod:45,  effect:{int:8, mgc:-5},  desc:'45턴마다. 완전한 침묵 속에 이성을 갈고닦는다.' },
  ],
};
