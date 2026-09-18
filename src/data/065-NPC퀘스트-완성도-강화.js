// NPC/퀘스트 완성도 강화 — data
// Pure data split out of items/065-NPC퀘스트-완성도-강화.js (see generate.js).

export const NPC_EMOTIONS = {
  trust:    { icon:'💛', label:'신뢰',    threshold:80, bonus:{ neg:10, spk:8 } },
  friendly: { icon:'😊', label:'우호적',  threshold:65, bonus:{ spk:5 } },
  neutral:  { icon:'😐', label:'중립',    threshold:40, bonus:{} },
  cautious: { icon:'😟', label:'경계',    threshold:25, bonus:{ neg:-5 } },
  hostile:  { icon:'😠', label:'적대적',  threshold:0,  bonus:{ fear:10, neg:-10 } },
};

export const NPC_QUEST_TEMPLATES = [
  { id:'nq_fetch', title:'물건을 찾아줘', type:'fetch',
    generateDesc: (npc)=>`${npc.name}이(가) 잃어버린 물건을 찾아달라고 부탁했다.`,
    condition: (npc)=>(npc.relationship||50)>=70,
    reward: { gold:60, relBonus:15, exp:80 },
    completeKeywords:['찾았','발견','가져','구했'] },
  { id:'nq_protect', title:'위험에서 지켜줘', type:'protect',
    generateDesc: (npc)=>`${npc.name}이(가) 위험에 처했다. 보호해달라고 한다.`,
    condition: (npc)=>(npc.relationship||50)>=65,
    reward: { gold:80, relBonus:20, exp:100 },
    completeKeywords:['지켰','보호','막았','물리쳤'] },
  { id:'nq_deliver', title:'전달 부탁', type:'deliver',
    generateDesc: (npc)=>`${npc.name}이(가) 중요한 것을 다른 사람에게 전달해달라고 한다.`,
    condition: (npc)=>(npc.relationship||50)>=60,
    reward: { gold:40, relBonus:12, exp:60 },
    completeKeywords:['전달','전했','줬','건넸'] },
  { id:'nq_secret', title:'비밀 이야기', type:'secret',
    generateDesc: (npc)=>`${npc.name}이(가) 아무에게도 말 못 했던 비밀을 털어놓았다.`,
    condition: (npc)=>(npc.relationship||50)>=85,
    reward: { gold:0, relBonus:25, exp:50, titleId:'confidant' },
    completeKeywords:['들었','이해','공감','함께'] },
  { id:'nq_revenge', title:'복수를 도와줘', type:'revenge',
    generateDesc: (npc)=>`${npc.name}이(가) 자신의 복수를 도와달라고 부탁했다. 응하면 관계가 깊어지지만 위험하다.`,
    condition: (npc)=>(npc.relationship||50)>=75,
    reward: { gold:120, relBonus:30, exp:150 },
    completeKeywords:['복수','해결','처치','해냈'] },
];
