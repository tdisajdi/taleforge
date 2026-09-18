// 환경 생존 시스템 — data
// Pure data split out of misc/160-환경-생존-시스템.js (see generate.js).

export const SURVIVAL_ENVS = {
  desert:   { name:'사막',    icon:'🏜️', threats:['탈수','일사병','모래폭풍'], resource:'물 (사막 생존 자원)', tickDamage:5,  resistStat:'vit', resistItem:'사막 물 통' },
  ocean:    { name:'해상',    icon:'🌊', threats:['폭풍','익사','기아'],       resource:'식량',                tickDamage:3,  resistStat:'str', resistItem:'항해 식량' },
  arctic:   { name:'극지',    icon:'❄️', threats:['동사','눈보라','크레바스'], resource:'체온 (따뜻함)',       tickDamage:7,  resistStat:'vit', resistItem:'방한 외투' },
  volcanic: { name:'화산 지대',icon:'🌋', threats:['용암','독가스','고열'],    resource:'내화 보호',           tickDamage:6,  resistStat:'def', resistItem:'내화 갑옷' },
  deep_sea: { name:'심해',    icon:'🌊', threats:['수압','어둠','해저 생물'],  resource:'산소 (잠수 시간)',    tickDamage:8,  resistStat:'agi', resistItem:'잠수 장비' },
  forest:   { name:'마수의 숲',icon:'🌲', threats:['매복','독초','길 잃음'],   resource:'방향 감각',           tickDamage:2,  resistStat:'per', resistItem:'나침반' },
};
