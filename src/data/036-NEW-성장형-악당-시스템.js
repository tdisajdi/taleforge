// [NEW] 성장형 악당 시스템 — data
// Pure data split out of misc/036-NEW-성장형-악당-시스템.js (see generate.js).

export const VILLAIN_THREAT_LEVELS = [
  { id:"low",     threshold:0,   label:"성장 중",    icon:"🌱", desc:"아직 알려지지 않은 위협. 세계는 평온하다.",                worldPenalty:{} },
  { id:"medium",  threshold:25,  label:"위협 증대",  icon:"⚠️", desc:"마을 몇 곳이 점령당했다. 사람들이 두려움에 떤다.",           worldPenalty:{ rep:-5, trst:-3 } },
  { id:"high",    threshold:50,  label:"세계 위기",  icon:"🔥", desc:"주요 도시까지 위협받는다. 왕국이 흔들린다.",                 worldPenalty:{ rep:-10, ldr:-5, fath:-5 } },
  { id:"critical",threshold:75,  label:"멸망 직전",  icon:"💀", desc:"악의 군주가 세계의 절반을 지배한다. 희망이 보이지 않는다.",  worldPenalty:{ rep:-15, ldr:-10, fath:-10, wil:-5 } },
  { id:"omega",   threshold:100, label:"종말",       icon:"☠️", desc:"세계가 완전히 잠식됐다. 이제 역전하지 않으면 모든 것이 끝난다.", worldPenalty:{ str:-10, mgc:-10, rep:-20 } },
];
