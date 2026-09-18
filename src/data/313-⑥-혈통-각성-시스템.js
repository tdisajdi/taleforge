// ⑥ 🩸 혈통 각성 시스템 — data
// Pure data split out of job/313-⑥-혈통-각성-시스템.js (see generate.js).

export const BLOODLINE_TYPES = {
  dragon:   { name:'고대 드래곤혈', icon:'🐉', color:'#e05020', awakeCond:'HP 20% 이하에서 극한의 의지력 발휘', skill:'용염 폭발 — 1회용, 모든 적에게 강력한 화염 피해', hint:'체온이 비정상적으로 높고, 분노 시 눈이 황금빛으로 빛난다' },
  demonic:  { name:'악마 혼혈', icon:'😈', color:'#a030c0', awakeCond:'배신당하거나 극한의 절망 상태', skill:'어둠의 계약 — 적과 거래하여 임시 능력 흡수', hint:'그림자가 가끔 다른 방향으로 움직인다' },
  royal:    { name:'고대 왕족 혈통', icon:'👑', color:'#c0a020', awakeCond:'정당한 명분을 위해 싸울 때', skill:'카리스마 발현 — 모든 NPC의 관계도 +20 (1턴)', hint:'특정 문장과 유물에 반응하는 이상한 감각이 있다' },
  celestial:{ name:'천계 반신', icon:'⭐', color:'#c0d040', awakeCond:'선한 행동 누적 또는 신관과의 깊은 인연', skill:'신성 보호 — 1회 치명타 차단 + 전원 HP 30 회복', hint:'성소에서 다른 이들에게는 들리지 않는 소리가 들린다' },
  ancient:  { name:'고대 정령혈', icon:'🌊', color:'#30a0c0', awakeCond:'자연 속에서 극한의 위기', skill:'정령 소환 — 전투 1회, 강력한 정령을 3턴간 소환', hint:'식물과 동물이 두려움이나 경외심으로 반응한다' },
  void:     { name:'허공 혼혈', icon:'🌀', color:'#6040a0', awakeCond:'죽음 직전의 무아지경 상태', skill:'공간 왜곡 — 적 1체 공격을 무효화 + 반격', hint:'가끔 이 세계가 꿈처럼 느껴지는 순간이 있다' },
};
