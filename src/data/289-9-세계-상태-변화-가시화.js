// 9. 세계 상태 변화 가시화 — data
// Pure data split out of world/289-9-세계-상태-변화-가시화.js (see generate.js).

export const WORLD_CHANGE_TRIGGERS = [
  { pattern:/마왕.*쓰러|용을.*처치|최종.*보스|대악당.*처치/, impact:50, event:'대악당 처치', desc:'세계의 위협이 사라졌다. 각지에서 환호 소식이 들려온다.', worldHint:'이 세계의 사람들이 주인공의 업적을 기념하며 희망을 이야기하는 장면을 배경에 녹여라.' },
  { pattern:/전쟁.*막았|평화.*협상|분쟁.*해결/, impact:40, event:'전쟁 방지', desc:'피로 물들 뻔한 세계를 구했다. 국경 지역에 평화가 찾아왔다.', worldHint:'전쟁이 멈춘 지역에 서서히 활기가 돌아오는 변화를 묘사하라.' },
  { pattern:/마을.*구했|민중.*해방|노예.*해방/, impact:25, event:'민중 구원', desc:'억압받던 이들이 자유를 찾았다.', worldHint:'해방된 이들이 주인공을 기억하는 방식을 서사에 담아라.' },
  { pattern:/신전.*파괴|성물.*오염|신앙.*훼손/, impact:-30, event:'신성 모독', desc:'세계의 신성한 균형이 흔들린다.', worldHint:'신앙 NPC들이 불안과 경계심을 드러내는 장면을 추가하라.' },
  { pattern:/왕국.*전복|도시.*파괴|무고한.*학살/, impact:-50, event:'세계 혼란', desc:'세계에 어둠이 짙어지고 있다.', worldHint:'공포와 혼란이 퍼지고 있음을 NPC들의 반응과 배경 묘사에 담아라.' },
];
