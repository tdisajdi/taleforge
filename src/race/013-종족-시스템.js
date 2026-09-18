// 종족 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { API_KEYS_STORAGE, API_KEY_INDEX_STORAGE } from '../misc/001-block0-preamble.js';
import { lsDel, lsGet, lsSet } from '../utils.js';

export const RACE_DEFS = [
  {
    id: "human",
    name: "인간",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3.5"/><path d="M6 21 C6 16.5 8.7 14 12 14 C15.3 14 18 16.5 18 21"/><path d="M9 11 C9 11 10 13 12 13 C14 13 15 11 15 11"/><path d="M8 8 L6 7 M16 8 L18 7"/></svg>`,
    color: "#c8a96e",
    accent: "#2a1f0d",
    desc: "적응력과 의지가 뛰어난 만물의 영장. 어떤 환경에서도 살아남는 균형의 종족.",
    lore: "인간은 마법도, 신체 능력도 특출나지 않지만 그 어떤 종족보다 빠르게 배우고 성장한다. 수백 년을 사는 엘프가 한 가지 기술을 완성할 동안, 인간은 열 가지를 익히고 세상을 바꾼다. 역사 속 왕국의 흥망과 혁명, 위대한 발명 대부분의 뒤에는 인간이 있었다. '짧은 삶이기에 더 간절하다'는 말은 인간 스스로 만든 속담이 아니다—그것은 다른 종족들이 인간을 보며 입에 담게 된 말이다. 금기는 딱 하나: 같은 실수를 두 번 반복하는 것. 인간은 그것만을 진정한 수치로 여긴다.",
    statBonus: { wil:5, luk:5, spk:3, neg:3, rep:2 },
    statPenalty: {},
    relations: {
      elf: { score: 30, label: "중립적 경계", desc: "오랜 역사 속 갈등과 교류가 혼재. 엘프는 인간의 짧은 수명을 안타까워한다.", history: "수백 년 전 '회색숲 조약'으로 공식 화평을 맺었으나, 인간의 빠른 영토 확장이 엘프 숲을 침식하며 지속적 마찰이 생겼다. 세대마다 인식이 달라—노인들은 경계하고 젊은이들은 교류에 열린 편." },
      dwarf: { score: 60, label: "우호 동맹", desc: "교역과 전투에서 수백 년 협력한 동반자 관계.", history: "'철과 밀의 동맹'이라 불리는 협약이 300년째 유지 중. 드워프가 무기와 광물을 공급하고 인간이 식량과 무역로를 제공하는 구조. 오크 대침공 때 함께 싸운 기억이 양측 모두에게 깊이 새겨져 있다." },
      orc: { score: -40, label: "긴장된 적대", desc: "오랜 전쟁의 상흔이 남아있다. 일부 오크 부족과는 화평 중.", history: "'붉은 여름 전쟁'에서 인간 왕국 셋이 오크 대군에 불탔다. 그 이후 세대를 거쳐 복수심과 적대감이 이어지고 있다. 최근 북방 오크 부족장이 평화 협상을 요청했으나 인간 귀족 의회가 거부한 상태." },
      darkling: { score: -60, label: "깊은 불신", desc: "어둠의 종족과는 본능적 경계심이 있다.", history: "100년 전 '그림자 역병' 사건으로 인해 다크링이 도시에서 강제 추방되었다. 역병의 진짜 원인은 끝내 밝혀지지 않았지만, 인간 사회는 다크링을 희생양으로 삼았고 그 낙인이 현재까지 이어진다." },
      celestial: { score: 20, label: "경외와 거리감", desc: "신성한 종족에 대한 존경과 두려움이 공존한다.", history: "인간 종교 대부분이 세레스티얼을 신의 사자로 섬긴다. 그러나 300년 전 '황금 심문' 사건—세레스티얼 사제단이 이단이라며 인간 학자들을 처형한 일—이 경외 뒤에 두려움의 층을 더했다." },
    },
    skills: [
      { id:"race_human_adapt",   type:"passive", name:"빠른 적응",     icon:"🔄", rarity:"uncommon", req:{}, desc:"새로운 환경/직업에 적응 시 모든 스탯 판정에 +5 보너스.", condition:"new_situation", conditionDesc:"새로운 상황 진입 시", statBoost:{wil:40}, scenario:null, mpCost:0, aiHint:"빠른 적응 발동! 인간 특유의 적응력으로 상황을 빠르게 파악합니다." },
      { id:"race_human_will",    type:"active",  name:"불굴의 의지",   icon:"🔥", rarity:"uncommon", req:{wil:20}, mpCost:15, desc:"의지를 불태워 1턴간 모든 판정에 +10. HP가 낮을수록 효과 상승.", scenario:null, aiHint:"불굴의 의지 발동! 한계를 넘어서는 인간의 의지가 빛납니다." },
      { id:"race_human_destiny", type:"event",   name:"운명의 주인공", icon:"⭐", rarity:"rare",     req:{}, mpCost:0, desc:"인간은 운명을 스스로 개척한다. LUK +10, 다음 판정 대성공 확률 2배.", unlockTitle:"prophecy", scenario:null, aiHint:"운명의 주인공 발동! 인간의 운명이 스스로를 향해 빛납니다." },
    ],
  },
  {
    id: "elf",
    name: "엘프",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6.5" r="3"/><path d="M6 21 C6 17 8.7 14.5 12 14.5 C15.3 14.5 18 17 18 21"/><path d="M8 5 L5 3 M16 5 L19 3"/><path d="M7 8.5 L4.5 11 M17 8.5 L19.5 11"/><path d="M9.5 10.5 C9.5 10.5 10.5 12.5 12 12.5 C13.5 12.5 14.5 10.5 14.5 10.5"/></svg>`,
    color: "#7adf9a",
    accent: "#0a1f0f",
    desc: "수천 년을 사는 장수의 종족. 마법과 자연에 친화적이며 뛰어난 감각을 지닌다.",
    lore: "엘프는 수천 년에 걸쳐 쌓인 지혜와 마법 친화력으로 고대 문명을 이끌었다. 그들의 도시는 나무 위에 세워지고, 법은 노래로 전해지며, 역사는 살아있는 장로들의 기억 속에 보존된다. 그러나 긴 삶은 긴 그늘도 만든다—감정을 억제하는 것이 미덕으로 여겨지며, 눈물을 흘리는 엘프는 '젊고 미숙한 자'로 취급받는다. 인간의 짧은 수명을 안타까워하면서도, 내심 그 열정을 부러워한다는 사실을 스스로 인정하는 엘프는 드물다. 엘프 사회의 최대 금기는 '망각': 선조의 이름을 잊는 것은 죽은 이를 두 번 죽이는 행위로 간주된다.",
    statBonus: { mgc:8, per:6, agi:5, int:5, crse:-5 },
    statPenalty: { str:-3, end:-3 },
    relations: {
      human: { score: 30, label: "온화한 거리감", desc: "인간을 다소 유치하게 보지만 그 잠재력을 인정한다.", history: "엘프 현자들은 '인간은 불꽃 같다—빠르게 타오르고 빠르게 사라진다'고 기록했다. 과거 엘프가 인간 왕들의 고문 역할을 맡은 시대가 있었으나, 인간이 그 지식을 이용해 엘프 숲 인근에 성을 쌓으면서 관계가 냉각되었다." },
      dwarf: { score: -30, label: "문화적 갈등", desc: "자연을 훼손하는 드워프 광업에 반감이 크다.", history: "'안개산맥 채굴 분쟁'이 200년에 걸쳐 간헐적 충돌을 일으켰다. 드워프가 고대 엘프 성지 아래를 굴착하는 사건이 세 번 있었고, 그때마다 엘프 전사단이 출동했다. 현재는 '채굴 금지 구역' 조약으로 봉합 중이나 긴장은 여전하다." },
      orc: { score: -70, label: "오랜 적대", desc: "역사적으로 가장 오래된 전쟁 상대. 본능적 혐오.", history: "'초록 하늘 전쟁'이라 불리는 고대 전쟁에서 오크 군단이 엘프의 3대 성도시를 불태웠다. 그 상흔은 수천 년이 지난 지금도 엘프 장로들의 기억 속에 생생히 살아있다. 일부 젊은 엘프들은 화해를 시도하지만 장로 의회가 번번이 막는다." },
      darkling: { score: -80, label: "빛과 어둠의 대립", desc: "근원적인 세계관의 충돌. 협력 거의 불가.", history: "고대 신화에 따르면 엘프와 다크링은 같은 원초 존재에서 갈라진 '빛의 가지'와 '어둠의 가지'다. 이 신화가 두 종족 모두에서 전해지는데, 엘프는 이를 숙명적 대립의 근거로, 다크링은 빼앗긴 자의 분노로 해석한다." },
      celestial: { score: 70, label: "신성한 친족", desc: "먼 혈통의 친척. 서로를 높이 여기며 협력한다.", history: "엘프 왕가 혈통의 일부가 세레스티얼과의 혼혈에서 비롯되었다는 전설이 있다. 실제로 고대 엘프 성가(聖歌)와 세레스티얼의 신성 언어는 어원을 공유한다. 양측 학자들이 수세기째 그 연결고리를 연구 중이다." },
    },
    skills: [
      { id:"race_elf_arcane",   type:"passive", name:"마법 친화",     icon:"🔮", rarity:"uncommon", req:{mgc:20}, desc:"마법 스킬 사용 시 MP 소모 -5, 마법 판정 +8 보너스.", condition:"magic_use", conditionDesc:"마법 스킬 사용 시", statBoost:{mgc:64}, scenario:null, mpCost:0, aiHint:"마법 친화 발동! 엘프의 타고난 마법 친화력이 효과를 증폭시킵니다." },
      { id:"race_elf_truesight",type:"active",  name:"진실의 눈",     icon:"👁️", rarity:"rare",     req:{per:30}, mpCost:20, desc:"주변의 환상, 위장, 거짓을 꿰뚫어본다. PER +20, DISG 저항.", scenario:null, aiHint:"진실의 눈 발동! 엘프의 예리한 시야가 모든 환상을 걷어냅니다." },
      { id:"race_elf_forest",   type:"event",   name:"숲의 축복",     icon:"🌿", rarity:"rare",     req:{}, mpCost:0, desc:"자연 환경에서 HP/MP 자동 회복. 숲이나 자연 속에서 강력한 힘을 발휘.", unlockTitle:"explorer", scenario:null, aiHint:"숲의 축복 발동! 자연과 교감하며 엘프의 생명력이 회복됩니다." },
    ],
  },
  {
    id: "dwarf",
    name: "드워프",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3"/><path d="M7 21 C7 17.5 9.2 15 12 15 C14.8 15 17 17.5 17 21"/><path d="M6 10 C5 11 5 13 6 14 C7 15 8 15.5 9 15"/><path d="M18 10 C19 11 19 13 18 14 C17 15 16 15.5 15 15"/><path d="M8 9.5 L7 12 M16 9.5 L17 12"/><path d="M9 7 L6 8 M15 7 L18 8"/></svg>`,
    color: "#c87a3a",
    accent: "#1a0f05",
    desc: "강인한 육체와 단단한 의지를 가진 대장장이 종족. 독과 마법에 강한 저항력을 보인다.",
    lore: "드워프는 산 속 깊은 곳에서 금속을 다루며 수천 년의 문명을 쌓았다. 그들의 도시는 지하 깊숙이 뻗어있고, 가장 오래된 홀에는 선조들이 직접 조각한 역사의 벽화가 남아있다. 느리지만 정확하고, 한 번 맺은 동맹은 절대 배신하지 않는다—그 대신 원한도 절대 잊지 않아, '드워프의 원한은 바위보다 오래간다'는 속담이 있을 정도다. 드워프 사회에서 가장 존경받는 자는 왕도 마법사도 아닌 '대장장이 장인'이다. 가장 큰 금기는 미완성된 일을 포기하는 것—작업 중인 물건을 방치하면 선조의 혼이 떠돈다고 믿는다.",
    statBonus: { end:8, str:6, pstx:6, wil:5, regen:4 },
    statPenalty: { agi:-5, mgc:-4 },
    relations: {
      human: { score: 60, label: "신뢰의 동맹", desc: "오랜 교역 파트너. 서로의 단점을 보완하는 관계.", history: "드워프 왕국과 인간 왕국 간의 '철산 조약'은 가장 오래 유지된 종족 간 협약으로 기록된다. 드워프는 인간을 '빠른 손'이라 부르며—완성도는 부족하지만 적응력이 뛰어나다는 의미로—내심 인정하는 표현이다." },
      elf: { score: -30, label: "자존심 충돌", desc: "서로를 미개하다/거만하다고 본다. 협력은 하지만 불편하다.", history: "'나무를 베는 자'와 '돌을 파는 자'의 갈등은 수백 년째 이어진다. 드워프는 엘프를 '발이 땅에 안 닿는 자들'이라 비꼬고, 엘프는 드워프를 '아름다움을 모르는 땅굴 쥐'라 부른다. 그럼에도 오크 전쟁 때는 나란히 싸웠다." },
      orc: { score: -50, label: "영토 분쟁", desc: "산악 지대 자원을 두고 끊임없이 충돌.", history: "철광석이 풍부한 '붉은 산맥'의 소유권을 두고 세 번의 전쟁이 있었다. 현재는 드워프가 산 안쪽을, 오크가 산 외곽을 사용하는 불안한 경계가 설정되어 있다. 드워프 광부들이 실종되는 사건이 간간이 발생한다." },
      darkling: { score: -60, label: "본능적 혐오", desc: "지하 세계를 공유하지만 사상이 완전히 다르다.", history: "드워프 광산의 깊은 곳에서 다크링 집단과 맞닥뜨린 사례가 여러 번 기록되어 있다. '깊은 곳의 조우'라 불리는 이 사건들은 대부분 유혈 충돌로 끝났고, 드워프는 지하 깊은 층을 '저주의 땅'이라 부르며 되도록 굴착을 피한다." },
      celestial: { score: 10, label: "어색한 존중", desc: "신성함보다 실리를 추구하는 드워프에겐 다소 낯선 존재.", history: "드워프 종교는 신보다 '선조의 의지'를 중시하기 때문에 신성 존재를 섬기지 않는다. 그러나 세레스티얼이 치유와 축복을 제공할 때는 실용적으로 받아들인다—드워프식 표현으로 '쓸 만한 낯선 것'." },
    },
    skills: [
      { id:"race_dwarf_forge",    type:"active",  name:"단조의 기예",   icon:"🔨", rarity:"uncommon", req:{str:25}, mpCost:10, desc:"전투 중 무기를 즉석 강화. STR +10, CRIT +8이 1턴 지속.", scenario:null, aiHint:"단조의 기예 발동! 드워프의 장인 기술로 무기가 순간 강화됩니다." },
      { id:"race_dwarf_resist",   type:"passive", name:"철벽 저항",     icon:"🛡️", rarity:"rare",     req:{end:30}, desc:"독/저주/마법 피해 25% 감소. PSTX, CRSE 저항 상시 적용.", condition:"always", conditionDesc:"항시 발동", statBoost:{end:40, pstx:40}, scenario:null, mpCost:0, aiHint:"철벽 저항 발동! 드워프의 강인한 체질이 피해를 흡수합니다." },
      { id:"race_dwarf_ancestor", type:"event",   name:"선조의 분노",   icon:"🪨", rarity:"legendary", req:{}, mpCost:0, desc:"HP가 30 이하가 되면 드워프 선조의 힘이 깨어나 STR +15, END +15.", unlockTitle:"duel_winner", scenario:null, aiHint:"선조의 분노 발동! 드워프 선조들의 투지가 깨어나 폭발합니다." },
    ],
  },
  {
    id: "orc",
    name: "오크",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C9 3 7 5 7 7.5 C7 10 9 12 12 12 C15 12 17 10 17 7.5 C17 5 15 3 12 3Z"/><path d="M9 9 L7 10 M15 9 L17 10"/><path d="M10 10 L10 11.5 M14 10 L14 11.5"/><path d="M6 21 C6 17 8.7 14.5 12 14.5 C15.3 14.5 18 17 18 21"/><path d="M8 6 L6 4 M16 6 L18 4"/></svg>`,
    accent: "#0a1505",
    desc: "타고난 전사 종족. 전투에서 전혀 물러서지 않으며 압도적인 근력과 공포감을 발산한다.",
    lore: "오크는 오랫동안 미개한 약탈자로 오해받았지만, 사실 치밀한 전략과 강력한 부족 체계를 가진 종족이다. 부족마다 '전쟁족장'과 별개로 '말하는 자(현자)'가 존재하며, 이 현자의 조언 없이 전쟁을 결정하는 족장은 존중받지 못한다. 힘이 곧 정의인 그들의 세계에서 강자는 존경받고 약자는 짐이 되지만—약자를 보살피는 강자는 '진정한 전사'로 불린다. '오크의 맹세는 죽어서도 지켜진다'는 말처럼, 맹세를 어기는 것은 살아있는 것 중 가장 큰 치욕이다. 타 종족의 오해와 달리, 오크 문화에는 정교한 구전 서사시와 전쟁 의례가 있다.",
    statBonus: { str:10, end:7, fear:6, hp:5, crit:4 },
    statPenalty: { cha:-5, spk:-4, mgc:-5 },
    relations: {
      human: { score: -40, label: "불안한 휴전", desc: "전쟁의 상흔이 남아있다. 신뢰하긴 어렵지만 이해관계가 맞으면 협력.", history: "'붉은 여름 전쟁' 이후 일부 오크 부족은 인간 도시 외곽에 정착해 용병으로 일하고 있다. 이들을 '길들여진 오크'라 부르는 인간 귀족의 시선이 오크 자존심을 건드린다. 북방 부족장 연합은 이 인식을 바꾸기 위한 협상을 추진 중." },
      elf: { score: -70, label: "오랜 원수", desc: "수백 년의 전쟁. 화해는 거의 불가능에 가깝다.", history: "오크 구전 서사시 '초록 하늘'은 엘프가 오크의 대평원을 마법으로 황폐화시킨 고대 사건을 담고 있다. 오크는 매년 그 날을 '침묵의 날'로 기린다. 엘프는 자신들의 기억에서 그 사건을 완전히 다른 방식으로 기록하고 있어, 두 종족의 역사는 영원히 평행선을 달린다." },
      dwarf: { score: -50, label: "자원 쟁탈", desc: "산악 자원을 두고 끊임없이 충돌한다.", history: "오크 샤먼들은 '붉은 산맥'을 전쟁의 신 '고르'가 잠든 성지로 여긴다. 드워프가 그 산을 파헤치는 것은 신성 모독으로 받아들여진다. 이 종교적 의미가 단순한 자원 분쟁을 성전(聖戰)의 성격으로 만들어, 협상을 더욱 어렵게 한다." },
      darkling: { score: 20, label: "힘의 연대", desc: "약자를 무시하는 세계관이 비슷해 드물게 협력한다.", history: "다크링의 저주 마법과 오크의 물리적 전투력은 전쟁에서 강력한 조합이 된다. 과거 '어둠의 동맹'이라 불린 오크-다크링 연합군이 여러 도시를 함락시킨 역사가 있다. 그러나 오크는 저주에 의존하는 전투를 '비겁한 전술'로 여기기도 해 연대가 지속되지는 않는다." },
      celestial: { score: -80, label: "신성의 거부", desc: "천상 종족의 권위와 우월감을 극도로 거부한다.", history: "세레스티얼 선교단이 오크 부족에게 '문명화'를 강요한 역사가 오크의 집단 기억에 깊이 새겨져 있다. 일부 부족은 세레스티얼을 붙잡아 자신들의 '힘의 의례'에 사용했다는 기록도 있다. 오크에게 세레스티얼의 '빛'은 자유를 빼앗는 쇠사슬의 색이다." },
    },
    skills: [
      { id:"race_orc_rage",    type:"active",  name:"전쟁의 함성",   icon:"😤", rarity:"uncommon", req:{str:30}, mpCost:0, desc:"전투 시작 시 함성을 질러 STR +15, FEAR +10. 적의 판정에 -8 패널티 부여.", scenario:null, aiHint:"전쟁의 함성 발동! 오크의 광포한 함성이 전장을 뒤덮습니다." },
      { id:"race_orc_blood",   type:"passive", name:"전투의 피",     icon:"🩸", rarity:"rare",     req:{end:30}, desc:"전투 중 피해를 받을수록 STR +2씩 누적 상승 (최대 +20).", condition:"taking_damage", conditionDesc:"피해 받을 때마다", statBoost:{str:16}, scenario:null, mpCost:0, aiHint:"전투의 피 발동! 오크의 야성이 깨어나 강해집니다." },
      { id:"race_orc_berserker",type:"event",  name:"광전사 각성",  icon:"💢", rarity:"legendary", req:{}, mpCost:0, desc:"HP 20 이하에서 광전사 상태 돌입. STR +25, END +20, 하지만 통제 불능.", unlockTitle:"duel_winner", scenario:null, aiHint:"광전사 각성 발동! 오크의 본능이 완전히 해방되어 폭주합니다." },
    ],
  },
  {
    id: "darkling",
    name: "다크링",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="3.5"/><path d="M6 21 C6 17 8.7 14.5 12 14.5 C15.3 14.5 18 17 18 21"/><path d="M8 5 L5 2 M16 5 L19 2"/><path d="M6 9 L3 10 M18 9 L21 10"/><path d="M10 6 L10 8 M14 6 L14 8" stroke-width="1.2"/><path d="M9 9 C9 9 10.5 11 12 11 C13.5 11 15 9 15 9" stroke-width="1"/></svg>`,
    accent: "#0a050f",
    desc: "어둠에서 태어난 신비로운 존재. 그림자와 죽음을 다루며 공포와 저주를 자유롭게 사용한다.",
    lore: "다크링은 어둠 세계와 현실 세계 사이의 균열에서 탄생했다. 그들은 죽음을 두려워하지 않으며—오히려 죽음과의 교감이 그들의 힘의 원천이다. 표면적으로는 냉혹하고 고독한 존재처럼 보이지만, 다크링 사회 내부에는 복잡한 철학 논쟁이 존재한다: '빛이 없으면 어둠도 없다, 그렇다면 우리는 빛의 종인가 아니면 빛의 적인가.' 다른 종족에게 본능적 공포를 자아내는 것을 알기에, 대부분의 다크링은 군집을 이루지 않고 혼자 움직이는 것을 택한다. 금기는 '필요 없는 공포를 주는 것'—다크링은 공포를 도구로 쓰지만, 쾌락으로 쓰는 자는 동족에게서도 배척당한다.",
    statBonus: { mgc:8, mad:6, fear:7, per:5, crse:5 },
    statPenalty: { fath:-8, trst:-5, luk:-3 },
    relations: {
      human: { score: -60, label: "두려움과 혐오", desc: "인간은 다크링을 본능적으로 두려워하고 기피한다.", history: "100년 전 '그림자 역병' 때 인간 도시들이 다크링을 원인으로 지목해 학살과 추방을 자행했다. 다크링 기록에는 그것이 억울한 누명이었다는 증언이 남아있다. 이 사건은 다크링 세대에 걸쳐 인간에 대한 냉소와 경계심의 씨앗이 되었다." },
      elf: { score: -80, label: "빛과 어둠의 대립", desc: "엘프의 순수한 마법이 다크링과 충돌한다.", history: "다크링 철학자들은 '우리는 빛이 너무 강해서 생긴 그림자'라고 말한다. 엘프는 이 주장 자체를 불경하게 여긴다. 실제로 엘프의 정화 마법은 다크링에게 극도로 고통스러우며, 역사적으로 엘프 성직자들이 다크링 거주지를 '정화'한 사건들이 기록되어 있다." },
      dwarf: { score: -60, label: "저주의 적", desc: "드워프는 저주를 가장 두려워한다.", history: "드워프 광산의 깊은 층에서 다크링 집단과 수십 차례 충돌했다. 다크링은 빛이 닿지 않는 지하 깊은 곳을 성역으로 여기며, 드워프의 굴착을 침입으로 받아들인다. '깊은 곳의 저주'라고 불리는 미지의 질병이 퍼질 때마다 드워프는 다크링을 원인으로 지목한다." },
      orc: { score: 20, label: "힘의 동족", desc: "서로의 어두운 본성을 인정하며 드물게 협력.", history: "다크링은 오크가 저주나 어둠 마법을 거부하지 않는 몇 안 되는 종족 중 하나라는 점을 높이 산다. 과거 연합전에서 효과적으로 협력한 전례가 있지만, 신뢰 기반이 아닌 이해관계 기반 협력이라 언제든 균열이 생긴다." },
      celestial: { score: -100, label: "불구대천의 원수", desc: "존재 자체가 상반된다. 공존 불가.", history: "세레스티얼의 빛은 다크링에게 물리적 고통을 준다. 고대 전쟁 '여명과 황혼의 전쟁'에서 두 종족은 서로를 존재 자체로 위협하는 상대로 인식하게 되었다. 이후 어떤 협약도 맺어진 적이 없으며, 두 종족이 마주치면 대화 없이 전투가 시작되는 것이 불문율이다." },
    },
    skills: [
      { id:"race_darkling_shadow",  type:"active",  name:"그림자 지배",   icon:"🌑", rarity:"rare",     req:{mgc:30, mad:20}, mpCost:25, desc:"주변 그림자를 지배해 적을 속박하거나 도망친다. AGI +15, DISG +10.", scenario:null, aiHint:"그림자 지배 발동! 다크링의 어둠이 주변 그림자를 장악합니다." },
      { id:"race_darkling_curse",   type:"active",  name:"공포의 저주",   icon:"😱", rarity:"rare",     req:{fear:30, crse:20}, mpCost:20, desc:"대상에게 공포 저주를 걸어 모든 판정 -15. FEAR +10 추가.", scenario:null, aiHint:"공포의 저주 발동! 다크링의 저주가 대상의 정신을 옥죕니다." },
      { id:"race_darkling_undeath", type:"event",   name:"불멸의 각성",   icon:"💀", rarity:"legendary", req:{}, mpCost:0, desc:"사망 직전 한 번 더 부활. HP 1로 생존하며 MAD +15, MGC +10 폭발 상승.", unlockTitle:"hidden_silence", scenario:null, aiHint:"불멸의 각성 발동! 다크링이 죽음의 경계에서 귀환했습니다." },
    ],
  },
  {
    id: "celestial",
    name: "세레스티얼",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="3"/><path d="M6 21 C6 17 8.7 14.5 12 14.5 C15.3 14.5 18 17 18 21"/><path d="M12 1 L12 4 M12 10 L12 12.5"/><path d="M4 7 L7 7 M17 7 L20 7"/><path d="M6.3 3.3 L8.5 5.5 M15.5 5.5 L17.7 3.3"/><path d="M6.3 10.7 L8.5 8.5 M15.5 8.5 L17.7 10.7"/></svg>`,
    accent: "#1a1a00",
    desc: "신성한 빛으로 이루어진 천상의 종족. 치유와 신앙의 힘이 탁월하며 축복을 내리는 존재.",
    lore: "세레스티얼은 신의 의지가 깃든 천상 존재의 후손이다. 빛과 생명의 원천에 가까워 강력한 치유와 신앙 능력을 보유하지만, 그 순수함 때문에 어둠과 부패에 극도로 취약하다. 그들은 태어날 때부터 '사명'을 부여받는다고 믿으며, 사명 없이 사는 세레스티얼은 스스로를 잃어버린 존재로 여긴다. 지상에서 살아가는 것 자체가 시련이지만, 그 시련을 통해 신성이 더욱 단련된다는 믿음으로 버텨낸다. 세레스티얼의 가장 큰 금기는 '거짓 기적'—능력이 없는데 치유를 약속하거나, 권력을 위해 신의 이름을 이용하는 행위는 천상에서 강제로 소환되어 심판받는다고 전해진다.",
    statBonus: { fath:10, mgc:6, trst:7, rep:5, wil:4 },
    statPenalty: { mad:-10, fear:-5, str:-3 },
    relations: {
      human: { score: 20, label: "축복의 시선", desc: "인간을 가련히 여기지만 보호하고 인도하려 한다.", history: "세레스티얼 사제단은 수세기 동안 인간 왕국에 치유와 예언을 제공하는 대가로 종교적 영향력을 행사했다. '황금 심문' 이후 인간 지식인들이 세레스티얼의 권위에 공개적으로 저항하기 시작했고, 현재는 세레스티얼의 영향력이 예전보다 줄어든 상태다." },
      elf: { score: 70, label: "친족의 유대", desc: "같은 빛의 계보를 잇는 존재로 서로를 높이 여긴다.", history: "세레스티얼과 엘프는 태초의 '빛의 계약'으로 연결되어 있다는 공동 신화를 가진다. 엘프의 고대 성가 중 일부는 세레스티얼 언어와 어원을 공유하며, 학자들은 두 종족이 한때 같은 존재였다는 가설을 연구 중이다." },
      dwarf: { score: 10, label: "어색한 존중", desc: "실용적인 드워프와 결이 다르지만 선의가 있다.", history: "드워프는 신앙보다 기술을 숭배하기 때문에 세레스티얼의 '신성한 권위'를 자동으로 인정하지 않는다. 그러나 세레스티얼이 제공하는 치유 마법을 실용적으로 받아들이며, '쓸모 있는 낯선 존재'로 분류한다. 양측 모두 서로의 신념 체계를 바꾸려 하지 않는 불문율이 있다." },
      orc: { score: -80, label: "정화 대상", desc: "오크의 폭력성을 정화해야 할 악으로 본다.", history: "세레스티얼 선교단이 오크 부족을 '야만에서 구원'한다는 명목으로 자행한 강제 개종 역사가 오크 집단 기억에 깊이 새겨져 있다. 세레스티얼 측 기록에는 '문명 전파'로 기술되어 있지만, 오크는 이를 '빛의 폭력'으로 기억한다." },
      darkling: { score: -100, label: "존재의 대립", desc: "빛과 어둠은 공존 불가. 반드시 한쪽이 사라져야 한다.", history: "고대 '여명과 황혼의 전쟁'에서 세레스티얼은 다크링을 세계의 균열에서 흘러나온 오류라고 선언했다. 다크링이 세레스티얼의 빛에 고통받는 것은 이 존재론적 충돌의 물리적 발현이다. 어떤 세레스티얼도 공식적으로 다크링과 협상을 시도한 기록이 없다." },
    },
    skills: [
      { id:"race_celestial_light",  type:"active",  name:"성광 치유",     icon:"💛", rarity:"uncommon", req:{fath:25}, mpCost:20, hpRestore:20, desc:"신성한 빛으로 HP +20 회복. 저주와 독도 동시에 정화한다.", scenario:null, aiHint:"성광 치유 발동! 세레스티얼의 빛이 상처와 저주를 정화합니다." },
      { id:"race_celestial_aura",   type:"passive", name:"신성의 오라",   icon:"✨", rarity:"rare",     req:{fath:30}, desc:"아군 전체에 신성 방어막 부여. 저주/독/어둠 피해 30% 감소.", condition:"always", conditionDesc:"항시 발동", statBoost:{fath:40}, scenario:null, mpCost:0, aiHint:"신성의 오라 발동! 세레스티얼의 신성한 기운이 아군을 보호합니다." },
      { id:"race_celestial_grace",  type:"event",   name:"신의 가호",     icon:"🌟", rarity:"legendary", req:{}, mpCost:0, desc:"위기의 순간 신의 가호가 내려와 모든 스탯 +15, 1턴간 무적.", unlockTitle:"mf_holy_light", scenario:null, aiHint:"신의 가호 발동! 신성한 빛이 세레스티얼을 감싸며 기적이 일어납니다." },
    ],
  },
  {
    id: "dragon",
    name: "드래곤혈",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 C10 4 7 5 6 8 C5 11 7 14 10 15 L10 20 L14 20 L14 15 C17 14 19 11 18 8 C17 5 14 4 12 4Z"/><path d="M10 7 L8 5 M14 7 L16 5"/><circle cx="10" cy="9" r="1" fill="currentColor"/><circle cx="14" cy="9" r="1" fill="currentColor"/><path d="M10 11.5 C10 11.5 11 13 12 13 C13 13 14 11.5 14 11.5"/><path d="M10 20 L8 22 M14 20 L16 22"/></svg>`,
    accent: "#1a0800",
    desc: "용의 피가 흐르는 반룡 종족. 화염과 냉기를 자유롭게 다루며 압도적인 존재감을 발산한다.",
    lore: "먼 옛날 인간과 고룡의 결합에서 탄생한 종족. 완전한 드래곤도, 완전한 인간도 아니기에 어느 쪽 사회에서도 이방인으로 살아간다. 고룡들은 드래곤혈을 '피를 희석시킨 자손'이라 얕보고, 인간들은 그들을 '짐승의 피가 섞인 위험한 존재'로 경계한다. 분노할수록 드래곤의 본능이 눈을 뜨기에, 드래곤혈 중 현자들은 '냉정함이 곧 힘'이라는 역설적 원칙을 평생 수련한다. 그러나 그 냉정함이 깨지는 순간, 세상이 불탄다. 드래곤혈의 속담: '불꽃은 방향을 선택하지 않는다—방향을 선택하는 것은 불꽃을 쥔 자의 의지다.'",
    statBonus: { str:8, mgc:8, fear:8, end:5, crit:5 },
    statPenalty: { trst:-6, cha:-3, cal:-5 },
    relations: {
      human: { score: -20, label: "공포의 대상", desc: "인간은 드래곤혈을 경외하며 두려워한다.", history: "드래곤혈은 인간 사회에서 '반은 짐승, 반은 사람'으로 불리며 차별받는다. 그러나 전쟁이 나면 가장 먼저 드래곤혈 용병을 찾는 것도 인간이다. 이 이중성이 드래곤혈 마음 속에 인간에 대한 경멸과 이해가 뒤섞인 복잡한 감정을 낳는다." },
      elf: { score: -10, label: "고대의 라이벌", desc: "고대부터 용과 엘프는 마법의 패권을 다퉜다.", history: "고대 마법 시대, 용들은 세계 마법 에너지의 원천을 독점하려 했고 엘프 현자들이 이를 저지했다는 신화가 있다. 드래곤혈은 그 본능적 기억을 희미하게 갖고 있어, 엘프 마법사를 보면 알 수 없는 경쟁 의식을 느끼는 경우가 있다." },
      dwarf: { score: -30, label: "숙적", desc: "드워프는 용의 보물을 탐내고, 용은 드워프의 탐욕을 혐오한다.", history: "고대 드래곤들의 보물굴 중 상당수가 드워프 왕국에 의해 침탈된 역사가 있다. '황금 동굴 학살'은 드워프 군대가 잠든 드래곤을 기습해 보물을 강탈한 사건으로, 드래곤혈 사회에서 드워프를 '탐욕의 화신'으로 규정하는 근거가 된다." },
      orc: { score: 30, label: "힘의 경외", desc: "오크는 드래곤혈의 힘을 진심으로 존경한다.", history: "오크 전사들에게 드래곤혈을 상대로 싸워 살아돌아오는 것은 최고의 명예 중 하나다. 일부 오크 부족은 드래곤혈을 '용신의 화신'으로 숭배하기도 한다. 이 순수한 경외가 드래곤혈에게도 오크를 적보다 동등한 전사로 인식하게 만든다." },
      darkling: { score: -10, label: "어둠과 불꽃", desc: "서로의 파괴적 본성을 인정하나 협력은 드물다.", history: "두 종족 모두 다른 종족에게 본능적 공포를 주는 존재라는 공통점이 있다. 그 공통점에서 드물게 연대가 생기기도 하지만, 드래곤혈의 불꽃은 어둠을 밝히고 다크링의 어둠은 불꽃을 삼키기에 근본적 긴장이 남는다." },
      celestial: { score: -50, label: "천상과 용의 대립", desc: "천상의 질서와 용의 혼돈 본능은 충돌한다.", history: "세레스티얼 신화에서 고대 드래곤은 창조 직후 세계에 혼돈을 불러온 존재로 기술된다. 세레스티얼은 드래곤혈을 그 혼돈의 잔재로 보며, 드래곤혈은 세레스티얼의 '질서' 집착을 생명의 불꽃을 억압하는 행위로 본다." },
    },
    skills: [
      { id:"race_dragon_breath", type:"active", name:"용의 숨결", icon:"🔥", rarity:"rare", req:{mgc:25}, mpCost:25, desc:"화염 혹은 냉기 숨결을 내뿜어 범위 피해. 적에게 공포 상태를 부여한다.", scenario:null, aiHint:"용의 숨결 발동! 드래곤의 불꽃이 적을 집어삼킵니다." },
      { id:"race_dragon_scale",  type:"passive", name:"용린 방어", icon:"🐉", rarity:"rare",   req:{end:25}, desc:"용의 비늘이 물리·마법 피해를 15% 감소. STR, END 판정 +6 상시 보너스.", condition:"always", conditionDesc:"항시 발동", statBoost:{str:48,end:48}, scenario:null, mpCost:0, aiHint:"용린 방어 발동! 비늘이 빛나며 피해를 흡수합니다." },
      { id:"race_dragon_awaken", type:"event", name:"용신 각성", icon:"🌋", rarity:"legendary", req:{}, mpCost:0, desc:"HP 25% 이하에서 진정한 드래곤 혈통이 깨어난다. STR·MGC·FEAR +20, 2턴 지속.", unlockTitle:"mf_dragon_blood", scenario:null, aiHint:"용신 각성! 드래곤의 진혈이 폭발적으로 해방됩니다!" },
    ],
  },
  {
    id: "demon",
    name: "악마족",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M6 21 C6 17 8.7 14.5 12 14.5 C15.3 14.5 18 17 18 21"/><path d="M8.5 5.5 L6 3 L7.5 6"/><path d="M15.5 5.5 L18 3 L16.5 6"/><path d="M10 9.5 L10 11 M14 9.5 L14 11"/><path d="M10 12 C10 12 11 13.5 12 13.5 C13 13.5 14 12 14 12" stroke-width="1.2"/></svg>`,
    accent: "#1a0005",
    desc: "심연에서 온 계약의 종족. 욕망과 거래를 통해 힘을 쌓으며 강렬한 카리스마로 타인을 지배한다.",
    lore: "악마족은 탄생부터 계약의 존재다. 원하는 것을 얻기 위해 반드시 무언가를 내주어야 한다는 불변의 법칙 속에서 살아간다. 그들의 사회는 위계가 명확하며, 더 교묘한 계약을 맺을수록 높은 지위를 얻는다—무력보다 언변이 권력의 척도다. 가장 위험한 것은 날카로운 지성과 말재주이며, '악마와 대화하면 이미 절반은 진 것'이라는 속담이 타 종족 사이에서 떠돈다. 악마족 내부의 금기는 오히려 단순하다: 자신이 맺은 계약을 어기는 것. 상대가 먼저 어겨도 상관없다—계약을 어긴 악마는 동족에게서 '이름'을 박탈당하고, 이름 없는 악마는 심연으로 추방된다.",
    statBonus: { mgc:7, neg:8, cha:7, fear:6, mad:5 },
    statPenalty: { fath:-12, trst:-8, wil:-3 },
    relations: {
      human: { score: -30, label: "먹잇감과 계약자", desc: "악마에게 인간은 계약 대상이자 욕망의 원천.", history: "악마족의 내부 문서에는 인간이 '욕망 밀도가 가장 높은 종족'으로 기록되어 있다. 수백 년간 인간 왕들이 악마와 계약해 권력을 얻고 결국 대가를 치른 사례가 반복되었다. 인간 사회는 이를 알면서도 필요할 때 악마의 문을 두드린다—악마는 이 반복되는 패턴을 '인간다움'의 본질로 여긴다." },
      elf: { score: -50, label: "순수함의 적", desc: "엘프의 순수한 마법과 악마의 부패한 힘은 상극.", history: "엘프는 태초부터 악마의 계약을 거부해온 유일한 종족이다. 엘프 마법은 순수 자연력에 기반하기 때문에 악마의 부패 마법과 직접 충돌한다. 악마족은 엘프를 '계약하지 않는 벽'으로 보며, 이 막힌 벽에 대한 강한 적의를 품고 있다." },
      dwarf: { score: -20, label: "거래 상대", desc: "드워프의 탐욕은 악마에게 좋은 협상 카드가 된다.", history: "드워프 역사에는 악마와 계약해 전설의 무기를 단조하고 대가로 영혼의 일부를 내준 대장장이 이야기가 여럿 기록되어 있다. 악마족은 드워프의 '완벽한 장인 작품에 대한 집착'을 계약의 빌미로 자주 이용한다." },
      orc: { score: 10, label: "힘의 동맹", desc: "오크의 폭력성과 악마의 잔혹함은 때때로 맞닿는다.", history: "악마는 오크를 계약의 대상으로 보지만, 오크는 계약보다 힘의 증명을 중시하기 때문에 관계가 단순하지 않다. 가끔 오크 족장이 전쟁 승리를 위해 악마와 계약하는 경우가 있는데, 오크 문화에서 이는 '강함을 위해 악을 이용하는 것'으로 용인되기도 한다." },
      darkling: { score: 50, label: "어둠의 동족", desc: "같은 어둠에서 태어난 동족. 음모를 공유한다.", history: "악마와 다크링은 '어둠의 심의회'라는 비밀 모임을 가진다는 소문이 있다. 실제로 두 종족이 협력해 인간 도시를 내부에서 붕괴시킨 사례가 몇 기록에 남아있다. 그러나 악마는 다크링도 계약 대상으로 보기 때문에 진정한 신뢰는 없다." },
      celestial: { score: -100, label: "영원한 적", desc: "천상과 심연은 존재 자체로 충돌한다.", history: "악마족 철학에서 세레스티얼은 '무결함을 강요하는 감옥 간수'다. 세레스티얼은 악마를 '세계에서 제거해야 할 불순물'로 본다. 두 종족 간에는 수천 년에 걸친 '빛과 계약의 전쟁'이 있었고, 그 전쟁은 끝난 적이 없다—단지 전장이 바뀌었을 뿐이다." },
    },
    skills: [
      { id:"race_demon_contract", type:"active", name:"계약 강요", icon:"📜", rarity:"rare",    req:{neg:30,cha:25}, mpCost:20, desc:"대화 중 상대에게 불리한 계약을 강요. NEG +20, CHA +15 판정 보너스.", scenario:null, aiHint:"계약 강요 발동! 악마의 말이 상대의 의지를 옥죄기 시작합니다." },
      { id:"race_demon_corrupt",  type:"passive", name:"부패의 오라", icon:"😈", rarity:"rare",   req:{mad:25}, desc:"주변 적의 신앙(FATH)과 의지(WIL)를 매 턴 -3씩 약화시킨다.", condition:"in_combat", conditionDesc:"전투 중 항시", statBoost:{fear:40}, scenario:null, mpCost:0, aiHint:"부패의 오라 발동! 주변의 의지와 신앙심이 서서히 썩어갑니다." },
      { id:"race_demon_pureform", type:"event",  name:"진상 해방", icon:"🔴", rarity:"legendary", req:{}, mpCost:0, desc:"HP 15 이하 시 악마의 진짜 모습으로 변신. 모든 스탯 +15, 저주·공포 면역, 1회 사용.", unlockTitle:"mf_dark_pact", scenario:null, aiHint:"진상 해방! 악마의 본 모습이 드러나며 공기가 부패합니다!" },
    ],
  },
  {
    id: "undead",
    name: "언데드",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8 7.5 C8 7.5 8 6 10 6 C10 6 10 8 8 8"/><path d="M16 7.5 C16 7.5 16 6 14 6 C14 6 14 8 16 8"/><path d="M10 10 L10 11 M14 10 L14 11"/><path d="M9 11.5 C9 11.5 10 13 12 13 C14 13 15 11.5 15 11.5"/><path d="M9 14 L7 21 L12 18 L17 21 L15 14" stroke-width="1.4"/></svg>`,
    accent: "#050810",
    desc: "세계로부터 시간을 빌린 존재. 죽음 너머를 보고 돌아왔기에 산 자가 보지 못하는 것들이 눈에 들어온다. 두 번째 죽음을 스스로 쟁취하기 위해 나아간다.",
    lore: "언데드는 세계로부터 시간을 빌린 존재다. 죽었어야 할 순간에 죽지 못했다—강렬한 집착이든, 빼앗긴 삶이든, 이유는 다양하지만 결과는 같다. 세계는 그 빚을 기억한다. 살아있는 자들이 죽음을 두려워하는 동안, 언데드는 이미 그 문 너머를 보고 돌아왔다. 그래서 산 자들이 보지 못하는 것들이 눈에 들어온다—거짓말, 두려움, 욕망의 냄새. 하지만 그 대가로 감정이 조금씩 식어간다. 느낄수록 약해지고, 냉정할수록 강해진다는 것을 언데드는 몸으로 안다. 모든 언데드에게는 미완성된 무언가가 있다. 그것이 이 세계에 발을 묶는 사슬이다. 그 사슬을 완성하는 날, 언데드는 비로소 선택할 수 있다—두 번째 죽음을, 스스로. 언데드의 금기는 둘이다. '빚을 늘리는 것', 그리고 '두 번째 죽음을 두려워하는 것.' 영원히 살려는 언데드는 가장 비겁하고 가장 약한 존재다—그리고 결국 가장 추한 망령이 된다. 언데드의 속담: '첫 번째 죽음은 당하는 것이다. 두 번째 죽음은 쟁취하는 것이다.'",
    statBonus: { end:10, pstx:15, wil:6, crse:6, hp:10 },
    statPenalty: { cha:-8, trst:-10, fath:-8, regen:-5 },
    relations: {
      human: { score: -70, label: "공포의 원천", desc: "살아있는 인간들은 언데드를 본능적으로 혐오한다.", history: "인간 도시의 법 대부분이 언데드를 '비시민'으로 규정하며, 일부 왕국은 발견 즉시 처치를 명한다. 그러나 드물게 언데드가 살아있을 때의 기억을 유지하며 가족과 재회한 사례들이 인간 문학에서 비극적 소재로 자주 등장한다—이 이야기들은 두려움 속에서도 언데드에 대한 연민의 씨앗을 심는다." },
      elf: { score: -60, label: "삶의 적", desc: "생명의 수호자인 엘프는 언데드를 정화 대상으로 본다.", history: "엘프의 생명 마법과 언데드의 사령 에너지는 접촉 시 폭발적으로 충돌한다. 엘프 드루이드 의회는 언데드를 '세계의 생명 순환을 방해하는 오류'로 공식 선언했다. 그러나 일부 엘프 현자들은 강한 의지로 언데드가 된 존재에게서 생명력의 다른 형태를 발견하려 노력한다." },
      dwarf: { score: -50, label: "지하의 공포", desc: "지하에서 자주 마주치는 위협. 드워프의 주요 적.", history: "드워프 광부들이 오래된 전장 아래를 굴착할 때 언데드 군단과 조우한 사례가 수십 건 기록되어 있다. 드워프는 선조를 극도로 공경하기에, 죽은 선조가 언데드로 돌아오는 것을 상상조차 못할 끔찍한 일로 여긴다. 그 혐오가 언데드 전반에 대한 강한 적의로 표출된다." },
      orc: { score: -20, label: "무서운 존재", desc: "오크도 언데드를 쉽게 대하지 못한다.", history: "오크는 용맹한 전사이지만 언데드는 '죽이기 전 이미 죽은 존재'라는 개념이 전투 본능을 혼란스럽게 한다. 오크 샤먼들은 언데드를 불완전하게 성불한 영혼으로 보며, 싸우기 전에 의례를 치러야 한다고 가르친다." },
      darkling: { score: 60, label: "죽음의 동족", desc: "죽음과 가장 친숙한 다크링은 언데드를 이해한다.", history: "다크링은 언데드를 '가장 솔직한 존재'라고 부른다—삶과 죽음의 경계를 이미 넘었기에 더 이상 아무것도 숨길 필요가 없다는 의미다. 다크링 사회에는 언데드를 안내하고 그들의 집착이 해소될 때까지 동반하는 '죽음의 길잡이' 역할을 자처하는 이들이 있다." },
      celestial: { score: -100, label: "정화 대상", desc: "천상의 존재에게 언데드는 반드시 소멸시켜야 할 존재.", history: "세레스티얼의 존재 목적 중 하나가 '생명 순환의 수호'이기 때문에, 순환을 거부한 언데드는 그 목적에 정면으로 위배된다. 세레스티얼의 빛이 언데드에게 극도의 고통과 소멸을 가져다주는 것은 이 원칙의 물리적 표현이다. 예외는 없다." },
    },
    skills: [
      { id:"race_undead_undying",  type:"passive", name:"죽지 않는 몸", icon:"💀", rarity:"rare",    req:{end:20}, desc:"독·저주 완전 면역. HP가 0이 되어도 1회 자동으로 HP 5로 부활.", condition:"death", conditionDesc:"사망 직전 1회", statBoost:{end:64}, scenario:null, mpCost:0, aiHint:"죽지 않는 몸 발동! 언데드는 쉽게 죽지 않습니다." },
      { id:"race_undead_drain",    type:"active",  name:"생명 흡수", icon:"🩸", rarity:"uncommon",  req:{mgc:20}, mpCost:15, desc:"적의 생명력을 흡수. 적 HP -10, 자신 HP +10. 저주 판정 +12.", scenario:null, aiHint:"생명 흡수 발동! 언데드의 손에서 차가운 기운이 뻗어나갑니다." },
      { id:"race_undead_terror",   type:"event",   name:"죽음의 위압", icon:"☠️", rarity:"legendary", req:{}, mpCost:0, desc:"진정한 공포를 발산. 범위 내 모든 적 FEAR 판정 -20, 적이 공격 포기 가능.", unlockTitle:"hidden_silence", scenario:null, aiHint:"죽음의 위압 발동! 죽음의 기운이 적들의 전의를 꺾습니다." },
    ],
  },
  {
    id: "beastman",
    name: "수인",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5 C9.5 5 7.5 6.8 7.5 9 C7.5 11.2 9.5 13 12 13 C14.5 13 16.5 11.2 16.5 9 C16.5 6.8 14.5 5 12 5Z"/><path d="M8.5 6 L6 3 M15.5 6 L18 3"/><path d="M8 8 L6.5 7 M16 8 L17.5 7"/><circle cx="10" cy="8.5" r="1" fill="currentColor"/><circle cx="14" cy="8.5" r="1" fill="currentColor"/><path d="M10.5 11 C10.5 11 11.2 12 12 12 C12.8 12 13.5 11 13.5 11"/><path d="M6 21 C6 17 8.7 14.5 12 14.5 C15.3 14.5 18 17 18 21"/></svg>`,
    accent: "#100a00",
    desc: "짐승의 본능과 인간의 이성을 겸비한 종족. 뛰어난 감각과 야생 전투 능력을 가진다.",
    lore: "수인은 인간과 짐승의 혼혈로 탄생한 다양한 종족을 통칭한다. 늑대인간, 호랑이인간, 독수리인간 등 그 형태는 다양하지만 공통적으로 날카로운 감각과 야생의 전투 본능을 공유한다. 수인 사회는 종족별로 독립된 문화를 가지며, '무리의 규칙'이 성문법보다 강력하게 작동한다—무리를 배신한 수인은 어느 무리에도 받아들여지지 않는 '홀로 된 자'가 된다. 인간 도시에서 차별과 편견에 시달리지만, 수인들 사이에서는 '편견을 품은 자가 진짜 야만인'이라는 자부심이 강하다. 최대 금기는 '사냥하지 않는 것'—먹기 위해서가 아니라 강함을 증명하기 위해 사냥하는 행위는 야수로 타락하는 첫걸음으로 여긴다.",
    statBonus: { str:7, agi:8, per:8, end:5, crit:5 },
    statPenalty: { mgc:-6, neg:-4, spk:-3 },
    relations: {
      human: { score: 10, label: "불안한 공존", desc: "인간 사회와 공존하지만 차별과 편견이 존재한다.", history: "수인은 인간 도시 외곽의 '수인 구역'에 모여 사는 경우가 많다. 인간 상인들은 수인의 날카로운 감각을 길잡이나 경비로 활용하면서도 같은 식탁에 앉는 것을 꺼리는 모순을 보인다. 최근 일부 진보적인 인간 도시에서 수인 평등법이 논의되고 있어 긴장과 기대가 공존한다." },
      elf: { score: 30, label: "자연의 친족", desc: "자연과 가까운 두 종족은 의외로 잘 어울린다.", history: "엘프 드루이드들은 수인의 야생 본능을 '자연의 목소리를 듣는 능력'으로 높이 평가한다. 수인 부족 중 일부는 엘프 숲에 보호받으며 공생하는 관계를 유지한다. '수인의 코가 먼저 위험을 맡고, 엘프의 마법이 그것을 봉인한다'는 협력의 속담이 있다." },
      dwarf: { score: -20, label: "문화 충돌", desc: "기계적인 드워프 문명과 야생 수인 문화가 충돌한다.", history: "드워프 도시의 소음과 금속 냄새는 수인에게 고통스럽다. 수인은 드워프의 광업이 자신들의 사냥터와 서식지를 파괴한다고 본다. 그러나 드워프가 만든 장비의 실용성을 수인도 인정하기 때문에 거래 관계는 유지된다—서로 불편하지만 필요한 이웃." },
      orc: { score: 50, label: "야생의 동족", desc: "같은 전사 종족으로서 서로를 강자로 인정한다.", history: "오크와 수인은 '야생의 회의'라는 비공식 전사 집회를 주기적으로 연다. 이 자리에서는 싸움보다 사냥 이야기와 힘 자랑이 주를 이루며, 서로의 부족을 적이 아닌 경쟁 상대로 인정한다. 두 종족이 연합하면 그 전투력은 전장의 판도를 뒤집을 수 있다." },
      darkling: { score: -30, label: "어둠의 위협", desc: "야생의 본능이 어둠의 존재에 강한 경계심을 보낸다.", history: "수인의 동물 본능은 다크링의 부패 기운을 본능적으로 탐지한다. 수인 부족에서는 다크링이 나타나면 짐승들도 도망가는 현상을 '세계가 등을 돌리는 신호'로 해석한다. 이 본능적 경계가 다크링과의 접촉을 극도로 꺼리게 만든다." },
      celestial: { score: 20, label: "순수함의 인정", desc: "야생의 순수함을 천상도 어느 정도 인정한다.", history: "세레스티얼은 수인의 야생 본능에서 '원초적 생명의 빛'을 발견한다고 말한다. 수인은 세레스티얼의 그 시선이 다소 거만하다고 느끼지만, 치유와 축복을 받는 것을 거부하지는 않는다. 일부 수인 부족은 세레스티얼을 '빛을 가진 이상한 인간'으로 우호적으로 대한다." },
    },
    skills: [
      { id:"race_beast_instinct", type:"passive", name:"야생의 직감", icon:"🐺", rarity:"uncommon", req:{per:25}, desc:"기습·매복 당할 확률 0. 선제공격 시 CRIT +10 보너스.", condition:"always", conditionDesc:"항시 발동", statBoost:{per:40,crit:40}, scenario:null, mpCost:0, aiHint:"야생의 직감 발동! 수인의 날카로운 감각이 위험을 미리 감지합니다." },
      { id:"race_beast_frenzy",   type:"active",  name:"야수 광란", icon:"🔴", rarity:"rare",    req:{str:30}, mpCost:0, desc:"야수의 본능으로 광란. STR +15, AGI +10. 하지만 이성 판정 -10.", scenario:null, aiHint:"야수 광란 발동! 수인의 야성이 완전히 해방되어 날뛰기 시작합니다." },
      { id:"race_beast_hunt",     type:"event",   name:"사냥꾼의 표식", icon:"🎯", rarity:"legendary", req:{}, mpCost:0, desc:"한 적을 '사냥감'으로 지정. 해당 적에 대한 모든 판정 +20, 도주 불가 상태 부여.", unlockTitle:"duel_winner", scenario:null, aiHint:"사냥꾼의 표식 발동! 수인의 눈에 사냥감이 포착되었습니다." },
    ],
  },
  {
    id: "elemental",
    name: "원소인",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 C9 5 7 8 9 11 C10 13 12 13 12 13 C12 13 14 13 15 11 C17 8 15 5 12 2Z"/><path d="M7 14 C5 15 4 17 5 19 C6 21 8 21 9 20"/><path d="M17 14 C19 15 20 17 19 19 C18 21 16 21 15 20"/><path d="M9 20 C9 21 10 22 12 22 C14 22 15 21 15 20"/><circle cx="12" cy="10" r="2" fill="currentColor" fill-opacity="0.3"/></svg>`,
    accent: "#001520",
    desc: "자연 원소와 융합된 존재. 불·물·바람·대지 중 하나와 공명하며 그 원소를 자유롭게 다룬다.",
    lore: "원소인은 고대 마법 실험이나 강렬한 원소 노출로 인해 원소 에너지가 체내에 스며든 존재들이다. 자신이 공명하는 원소에선 무적에 가깝지만 반대 원소에는 치명적인 약점을 가진다. 원소인들은 자신의 원소 속성을 '내면의 신'처럼 섬기며, 같은 원소를 공유하는 이들끼리 무언의 유대감을 느낀다—말을 나눈 적 없어도 불꽃 원소인끼리는 적으로 싸우기를 본능적으로 거부한다. 외형은 인간과 가깝지만, 감정이 격해지면 피부 아래서 원소가 빛나거나 흘러넘친다. 원소인의 금기: '자신의 원소를 파괴에만 쓰는 것.' 원소는 세계를 이루는 힘이기에, 그것을 순수한 파괴로만 사용하는 자는 원소로부터 거부당해 점차 능력을 잃는다고 전해진다.",
    statBonus: { mgc:10, mp:15, per:6, agi:5 },
    statPenalty: { end:-5, hp:-5, trst:-3 },
    relations: {
      human: { score: 20, label: "신기함과 경외", desc: "인간은 원소인을 신기하면서도 무서워한다.", history: "원소인이 감정을 억제하지 못해 도시 한가운데서 불꽃이나 폭풍이 튀어나온 사고들이 기록되어 있다. 인간은 원소인을 위험하지만 강력한 존재로 보며, 마법 연구소나 군사 기관에서 원소인을 영입하려는 시도가 끊임없이 있다. 원소인은 그 관심이 때로 불편하다." },
      elf: { score: 60, label: "자연의 친족", desc: "자연과 가까운 엘프는 원소인과 깊이 교감한다.", history: "엘프 드루이드들은 원소인과 함께 자연 재해를 치유하거나 황폐한 땅을 회복시키는 공동 작업을 해왔다. 엘프 마법 학교에서는 원소인을 '살아있는 마법 원소'로 연구의 귀감으로 삼는다. 원소인과 엘프의 공동 주거지인 '원소 숲'이 몇 곳 존재한다." },
      dwarf: { score: -20, label: "위험한 존재", desc: "불을 다루는 원소인은 드워프 광산에 위협이 된다.", history: "드워프 광산 사고 중 상당수가 불꽃 원소인의 감정 폭발과 관련된 것으로 기록되어 있다. 드워프는 원소인의 광산 출입을 원칙적으로 금지한다. 그러나 물 원소인은 광산의 지하수 관리에 협력한 사례가 있어, 원소 종류에 따라 관계가 다르다." },
      orc: { score: -10, label: "낯선 힘", desc: "오크는 원소인의 힘을 이해하기 어렵다.", history: "오크 전사들은 원소인의 마법을 이해하기보다 그 파괴력을 두려워한다. 직접 싸워보면 원소인의 강력함을 인정하게 되지만, '보이지 않는 힘으로 싸우는 것'에 대한 오크의 문화적 거부감이 관계를 어색하게 만든다." },
      darkling: { score: -20, label: "빛과 원소의 충돌", desc: "자연의 순수한 힘은 어둠을 밀어낸다.", history: "원소 에너지는 다크링의 어둠 기운과 접촉할 때 자연스럽게 정화 반응을 일으킨다. 원소인은 이것이 의도적인 행위가 아닌 본능적 반응이라고 설명하지만, 다크링에게는 그 구분이 없다. 두 종족이 가까이 있으면 원소가 요동치는 현상이 목격된다." },
      celestial: { score: 40, label: "자연의 신성", desc: "자연 원소의 순수함을 천상이 인정한다.", history: "세레스티얼 신화에서 원소들은 세계 창조의 기본 재료다. 원소인을 그 창조의 살아있는 조각으로 보는 세레스티얼은 원소인에게 경외에 가까운 존중을 표한다. 일부 원소인들은 세레스티얼의 성전에 자연스럽게 머물며 공생하는 경우도 있다." },
    },
    skills: [
      { id:"race_elem_resonance", type:"passive", name:"원소 공명", icon:"🌀", rarity:"rare",    req:{mgc:25}, desc:"자신의 원소 속성 스킬 사용 시 효과 +30%. MP 소모 -8.", condition:"magic_use", conditionDesc:"원소 스킬 사용 시", statBoost:{mgc:64}, scenario:null, mpCost:0, aiHint:"원소 공명 발동! 몸 속 원소 에너지가 공명하며 증폭됩니다." },
      { id:"race_elem_burst",     type:"active",  name:"원소 폭발", icon:"💥", rarity:"rare",    req:{mgc:30,mp:30}, mpCost:30, desc:"내재된 원소를 폭발시켜 범위 공격. 마법 피해 최대화.", scenario:null, aiHint:"원소 폭발 발동! 원소 에너지가 한꺼번에 해방되며 폭발합니다!" },
      { id:"race_elem_form",      type:"event",   name:"원소 변신", icon:"⚡", rarity:"legendary", req:{}, mpCost:0, desc:"3턴간 순수 원소 형태로 변신. 모든 원소 피해 무효, MGC·PER +20.", unlockTitle:"wx_qi_awakened", scenario:null, aiHint:"원소 변신 발동! 육체가 사라지고 순수한 원소 에너지체가 됩니다!" },
    ],
  },
  {
    id: "vampire",
    name: "뱀파이어",
    icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M8 6 C8 4 10 3 12 3 C14 3 16 4 16 6"/><path d="M10 10 L9 13 L12 11 L15 13 L14 10"/><path d="M6 21 C6 16.5 8.7 14 12 14 C15.3 14 18 16.5 18 21"/><path d="M4 8 L2 6 M20 8 L22 6" stroke-linecap="round"/></svg>`,
    color: "#8b0000",
    accent: "#0a0005",
    desc: "밤의 지배자. 흡혈로 강해지고 권속을 통해 세를 넓힌다. 낮에는 약해지지만 밤에는 인간을 초월한다.",
    lore: "뱀파이어는 시간을 먹는 존재다. 흡혈은 그 수단이다—피 안에 든 기억과 공포와 삶을 먹어 자신의 역사로 만든다. 수백 년 된 뱀파이어가 두려운 건 그 힘이 아니다. 그것이 살아온 역사의 무게다. 누구의 피를 마셨는가, 누가 그 이름을 두려워하는가, 얼마나 오래 버텨왔는가—이 세 가지가 뱀파이어를 정의한다. 뱀파이어의 이름이 알려지는 건 명성이 아니다—공포의 축적이다. 그 이름을 들은 자의 심장이 빨라지는 순간, 뱀파이어는 그것도 역사로 삼는다. 사회는 혈통의 수가 아니라 역사의 깊이로 위계가 결정된다. 피의 기록이 없는 뱀파이어는 그저 굶주린 시체일 뿐이고, 공포의 기록이 없는 뱀파이어는 그저 숨어 사는 겁쟁이일 뿐이다. 햇빛은 천적이고 신성한 빛은 약점이다. 하지만 역사가 쌓일수록 그 약점조차 극복해간다. 금기는 하나: 자신의 역사를 스스로 부정하는 것. 과거를 지우려는 뱀파이어는 가장 빠르게 무너진다.",
    statBonus: { str:8, agi:12, per:15, mgc:10, cha:10, fear:12 },
    statPenalty: { fath:-15, trst:-8, regen:-10 },
    relations: {
      human: { score: -60, label: "먹잇감과 포식자", desc: "인간은 뱀파이어의 먹잇감이자 권속 후보다.", history: "수백 년간 뱀파이어 귀족들이 인간 귀족으로 위장해 도시를 지배한 사례가 기록되어 있다. 인간들은 뱀파이어를 악마보다도 더 가까이에 있는 공포로 여긴다—저 귀족이, 저 상인이 뱀파이어일 수 있다는 의심." },
      elf: { score: -40, label: "오랜 적수", desc: "장수하는 엘프는 뱀파이어의 진짜 모습을 꿰뚫어 본다.", history: "엘프 현자들의 기록에 뱀파이어의 역사가 가장 상세히 남아있다. 수백 년을 사는 엘프들은 뱀파이어가 인간으로 위장해도 눈빛에서 알아챈다고 한다." },
      dwarf: { score: -30, label: "거래 가능한 적", desc: "드워프는 뱀파이어를 혐오하지만 거래는 한다.", history: "일부 뱀파이어 귀족이 드워프 장인들에게 막대한 금을 지불하며 지하 성채를 건설한 사례가 있다. 드워프는 원칙적으로 혐오하지만 금 앞에서는 현실적이다." },
      orc: { score: 10, label: "강자 인정", desc: "오크는 강한 존재를 존중한다. 뱀파이어도 예외가 아니다.", history: "오크 샤먼들은 뱀파이어를 '피의 전사'로 부르며 일종의 경의를 표한다. 직접 싸워보지 않는 한 적대하지 않는 경향이 있다." },
      darkling: { score: 50, label: "어둠의 동족", desc: "어둠을 공유하는 두 종족은 자연스럽게 끌린다.", history: "다크링 사회에서 뱀파이어는 '어둠의 귀족'으로 불린다. 두 종족은 인간 도시 지하에서 종종 공생 관계를 형성한다." },
      celestial: { score: -100, label: "빛의 천적", desc: "신성한 빛이 뱀파이어를 태운다. 절대적 적대 관계.", history: "세레스티얼의 빛은 뱀파이어에게 실제 물리적 고통과 소멸을 가져다준다. 이 관계는 영원히 변하지 않는다." },
      undead: { score: 30, label: "같은 죽음의 편", desc: "뱀파이어는 언데드를 동류로 여기며 권속으로 삼기도 한다.", history: "뱀파이어 군주들은 언데드 군단을 자신의 하수인으로 부리는 경우가 많다. 뱀파이어화된 언데드는 혈종 중 가장 강력한 부류가 된다." },
    },
    skills: [
      { id:"race_vamp_bite",      type:"active",  name:"흡혈", icon:"🩸", rarity:"rare",    req:{str:20}, mpCost:0,
        desc:"대상의 피를 마셔 피해를 입히고, 가한 피해의 40%만큼 자신의 HP를 회복한다. 전투 기절 상태 적에게 사용 시 권속화 가능. 야간 효과 2배.", scenario:null,
        aiHint:"흡혈 발동! 뱀파이어의 송곳니가 빛나며 대상에게 달려듭니다. 피를 빨아들일수록 상처가 아물고 눈이 붉게 타오릅니다.",
        effects:{ kind:'damage', statSource:{str:1}, damageMult:0.55, element:'physical', lifesteal:0.4 } },
      { id:"race_vamp_charm",     type:"active",  name:"매혹", icon:"👁️", rarity:"uncommon", req:{cha:30}, mpCost:20,
        desc:"대상을 매혹 상태로 만든다. CHR+CHA 판정. 성공 시 1~3턴간 명령에 복종. 신관·고신앙 대상 효과 감소.", scenario:null,
        aiHint:"매혹 발동! 뱀파이어의 눈이 붉게 빛나며 대상의 의지를 파고듭니다. 대상의 눈동자가 흔들리며 저항 의지가 녹아내립니다." },
      { id:"race_vamp_night",     type:"passive", name:"밤의 지배자", icon:"🌙", rarity:"rare", req:{}, mpCost:0,
        desc:"야간(밤 시간대·지하·어둠 속) 모든 스탯 +15. 주간에는 AGI·STR -8 패널티. 햇빛 직접 노출 시 HP -5/턴.", scenario:null,
        aiHint:"밤의 지배자! 야간에 뱀파이어의 능력이 최고조에 달합니다. 달빛 아래서 피부가 창백하게 빛납니다." },
      { id:"race_vamp_sovereign", type:"event",   name:"혈통의 군주", icon:"👑🩸", rarity:"legendary", req:{}, mpCost:0,
        desc:"권속 5명 이상 보유 시 자동 발동. 모든 스탯 +10, 권속들이 전장에 소환 가능. 혈통 붕괴 시 해제.", scenario:null,
        aiHint:"혈통의 군주 발동! 군주의 의지가 모든 권속에게 전달되며, 어둠 속에서 붉은 눈들이 빛나기 시작합니다." },
    ],
  },
];

export const RACE_KEY = "taleforge-race";

export const loadRace = () => { const r = lsGet(RACE_KEY); return r ? JSON.parse(r) : null; };

export const saveRace = (race) => lsSet(RACE_KEY, JSON.stringify(race));

export const clearRace = () => lsDel(RACE_KEY);

window._embeddedKeys = [];

export const saveApiKeys = (keys) => {
  window._embeddedKeys = keys;
  lsSet(API_KEYS_STORAGE, JSON.stringify(keys));
};

export const loadApiKeys = () => {
  const r = lsGet(API_KEYS_STORAGE);
  if(r){ try{ const parsed=JSON.parse(r); if(parsed.length>0){ window._embeddedKeys=parsed; return parsed; } }catch(e){} }
  return window._embeddedKeys;
};

window._keySaveHintShown = false;

export function _scheduleKeySaveHint(){
  if(window._keySaveHintShown) return; window._keySaveHintShown=true;
  setTimeout(()=>{
    if(confirm('⚠️ 이 환경에서는 API 키가 앱을 닫으면 사라질 수 있습니다.\n\n키를 파일에 저장하려면 확인을 누르세요.\n(저장된 키가 포함된 HTML 파일을 다운로드합니다)'))
      _downloadWithKeys();
  }, 2000);
}
window._scheduleKeySaveHint = _scheduleKeySaveHint;

export function _downloadWithKeys(){
  const keys = window._embeddedKeys;
  if(!keys.length){ alert('저장된 키가 없습니다.'); return; }
  const blob = new Blob([document.documentElement.outerHTML
    .replace('let _embeddedKeys = [];', 'let _embeddedKeys = '+JSON.stringify(keys)+';')
  ], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'taleforge_saved.html';
  a.click();
}
window._downloadWithKeys = _downloadWithKeys;

export const saveKeyIndex = (i) => lsSet(API_KEY_INDEX_STORAGE, String(i));

export const loadKeyIndex = () => { const r = lsGet(API_KEY_INDEX_STORAGE); return r ? parseInt(r, 10) : 0; };
