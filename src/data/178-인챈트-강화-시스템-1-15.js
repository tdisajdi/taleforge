// 인챈트 강화 시스템 (+1 ~ +15) — data
// Pure data split out of items/178-인챈트-강화-시스템-1-15.js (see generate.js).

export const ENHANCE_RATES = [
  { lv:1,  success:100, break_rate:0,  cost:100  },
  { lv:2,  success:100, break_rate:0,  cost:150  },
  { lv:3,  success:100, break_rate:0,  cost:200  },
  { lv:4,  success:95,  break_rate:0,  cost:300  },
  { lv:5,  success:90,  break_rate:0,  cost:400  },
  { lv:6,  success:80,  break_rate:0,  cost:600  },
  { lv:7,  success:70,  break_rate:5,  cost:900  },
  { lv:8,  success:60,  break_rate:10, cost:1200 },
  { lv:9,  success:50,  break_rate:15, cost:1800 },
  { lv:10, success:40,  break_rate:20, cost:2500 },
  { lv:11, success:30,  break_rate:25, cost:3500 },
  { lv:12, success:20,  break_rate:30, cost:5000 },
  { lv:13, success:15,  break_rate:35, cost:7000 },
  { lv:14, success:10,  break_rate:40, cost:10000},
  { lv:15, success:5,   break_rate:45, cost:15000},
];

export const ENHANCE_STONES = {
  '축복의 강화석': { successBonus:+10, breakProtect:true,  desc:'+10% 성공, 파괴 방지' },
  '수호의 강화석': { successBonus:0,   breakProtect:true,  desc:'파괴 방지' },
  '행운의 강화석': { successBonus:+20, breakProtect:false, desc:'+20% 성공' },
  '초월의 강화석': { successBonus:+30, breakProtect:true,  desc:'+30% 성공, 파괴 방지 (희귀)' },
};
