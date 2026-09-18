// 아에테른 종족간 전쟁 역사 — 종족 선택 시 배경
// Auto-extracted from taleforge.html (original section banner preserved above).
import { RELICS, REPUTATION_LEVELS } from '../data/054-이동수단-시스템.js';
import { JOB_MASTERY_BONUS, MASTERY_LEVELS } from '../data/064-아에테른-종족간-전쟁-역사-종족-선택-시-배경.js';
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { VASSAL_ROLES } from '../data/260-수인족-패널-렌더.js';
import { getStatInfo, loadTitles } from '../job/010-스킬-강화-시스템.js';
import { addAIJob, composeLocalNextJobs, findJob, getAIJobsByParent, getJobIdFromName, loadJobActions, loadJobCodex, loadJobMemory, offerJobChange, saveJobCodex } from '../job/042-직업-시스템-무한-파생-도감.js';
import { loadEndings, loadLocations, loadOwnedRelics, loadReputation } from '../misc/054-이동수단-시스템.js';
import { loadStats } from '../patches/299-플레이-통계-성향-분석-시스템-v57-완전판.js';
import { loadCycleCount } from '../progression/014-환생-누적-시스템-110번.js';
import { renderMsgs, updateSendBtn } from '../quest/086-퀘스트임무-수락-팝업-시스템.js';
import { esc, isBlockingPopupOpen, lsGet, lsSet, toast } from '../utils.js';
import { loadCurrentLocation } from '../world/052-동대륙-추가-장소-4.js';
import { loadGSFlags } from '../world/145-⑥-세계-상태-DB.js';
import { DEMESNE_EVENT_DEFS, calcDemesneResources, getDemesneBuilding, getDemesneSeason, getDemesneStatusLabel, getDemesneTier, getPopStage, loadDemesne, renderDemesnePanel, saveDemesne } from './260-수인족-패널-렌더.js';

export const FIVE_CONTINENTS = {
  // ── 중앙 대륙 ── 봉건 왕국 · 기사도 · 마법탑 ──────────────────
  center: {
    id: 'center', label: '중앙 대륙', icon: '🏰', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21 L4 9 L6 9 L6 7 L8 7 L8 9 L10.5 9 L10.5 6 L13.5 6 L13.5 9 L16 9 L16 7 L18 7 L18 9 L20 9 L20 21 Z" stroke-linejoin="round"/><path d="M12 21 L12 15 L15 15 L15 21"/><circle cx="12" cy="3" r="1" fill="currentColor"/></svg>`, color: '#c8a96e', direction: '중앙',
    theme: '봉건 왕국 · 기사도 · 마법과 종교의 각축',
    atmosphere: '넓은 평야와 석조 성채, 마법탑의 연기, 기사단의 말발굽 소리가 공존하는 문명의 심장. 오대륙 교역로가 모두 여기를 거친다.',
    kingdom: {
      name: '알테라 대왕국', icon: '⚜️',
      capital: '왕도 아이런홀', capitalIcon: '🏰',
      ruler: '대왕 알렉산더 IX세', rulerIcon: '👑',
      desc: '오대륙의 패권을 쥔 봉건 왕국. 기사단·마법탑·교회가 서로 견제하며 정치 지형을 만든다.',
      lore: '300년 전 다섯 공작이 연합해 세운 왕국. 지금은 왕권이 약해져 대귀족들의 의회가 실질적 권력을 행사한다. 왕도 아이런홀에는 모험가 길드·마법사 협회·교황 사절단이 모두 본부를 두고 있어 "세상의 모든 길이 아이런홀로 통한다"는 말이 있다.',
      culture: '기사도·명예 윤리·귀족 의회제',
      specialty: '기사단·마법 교육·국제 외교·밀 교역',
      military: '왕국 기사단 "은빛 사자" · 마법사 군단',
      uniqueFeatures: ['귀족 의회에서 왕권 제한', '마법사 길드와 교회의 오랜 갈등', '오대륙 교역로 요충지'],
      relations: { north: '동맹', east: '경쟁', west: '긴장', south: '우호', northeast: '적대', southeast: '무역', northwest: '중립' },
      uniqueLocation: { name: '다섯 교차로 — 아이런홀 대성', icon: '🏰', desc: '왕도 중심의 오각형 광장. 다섯 방향 교역로의 시작점이자 역사적 조약이 체결된 장소. 주변에 마법탑·대성당·기사단 훈련소가 늘어서 있다.' },
      npcs: [
        { name: '기사단장 레오나르드 경', icon: '⚔️', role: '왕국 최정예 기사단 단장. 엄격한 명예 원칙주의자.' },
        { name: '대마법사 아르카누스', icon: '🔮', role: '마법사 협회 수장. 노회한 정치적 마법사.' },
        { name: '대주교 클레멘스', icon: '✝️', role: '교회 세력의 실질적 수장. 왕보다 민심을 더 쥐고 있다는 말이 있다.' },
      ],
      events: ['귀족 의회 대분쟁', '왕위 계승 위기', '마법탑과 교회의 공개 충돌', '오대륙 사절단 대회의'],
    }
  },

  // ── 북대륙 ── 혹한 설원 · 바이킹풍 전사 · 빙결 마법 ─────────────
  north: {
    id: 'north', label: '북대륙', icon: '❄️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L12 22 M4 7 L20 17 M20 7 L4 17"/><path d="M12 2 L9.5 4.5 M12 2 L14.5 4.5 M12 22 L9.5 19.5 M12 22 L14.5 19.5 M4 7 L4.5 10 M4 7 L7 6.2 M20 7 L19.5 10 M20 7 L17 6.2 M4 17 L4.5 14 M4 17 L7 17.8 M20 17 L19.5 14 M20 17 L17 17.8" stroke-width="1.2"/></svg>`, color: '#6aace8', direction: '북',
    theme: '극한의 설원 · 바이킹 전사 문화 · 빙결 룬 마법',
    atmosphere: '연간 6개월 극야, 오로라가 춤추는 하늘, 뼈까지 파고드는 칼바람. 살아남는 것 자체가 명예인 땅. 롱쉽이 빙하를 가르고, 가죽 천막 안에서 사가(saga)가 낭송된다.',
    kingdom: {
      name: '아이스크라운 왕국', icon: '❄️',
      capital: '빙결 왕도 프로스트헤임', capitalIcon: '🏔️',
      ruler: '빙설 여왕 아이리나 "만년설의 칼날" II세', rulerIcon: '👸',
      desc: '극한의 설원에서 단련된 전사 왕국. 빙결 룬 마법과 철제 무기 제련 기술이 오대륙 최고 수준이다.',
      lore: '바이킹 족장들의 연합에서 시작된 왕국. 현 여왕은 부족 연합 전통을 지키며 의회(Thing)를 통해 통치한다. "강자만이 살아남는다"는 신조가 지배하는 사회. 북방 빙하 너머 얼음 거인족(요툰)과의 전쟁이 수백 년째 계속되고 있다.',
      culture: '전사 명예·부족 의회(Thing)·룬 신앙·항해 전통',
      specialty: '빙결 룬 마법·철제 무기·모피·고래기름 교역',
      military: '북방 빙설 기사단 · 룬 마법사 부대 · 롱쉽 전단',
      uniqueFeatures: ['Thing 의회에서 족장들이 왕권 견제', '얼음 거인족과 끝없는 국경 전쟁', '빙하 던전에서 고대 룬 무기 발굴', '오로라 아래서만 작동하는 특수 마법 존재'],
      relations: { center: '동맹', east: '긴장', west: '우호', south: '중립', northeast: '적대', northwest: '교역' },
      uniqueLocation: { name: '빙결 요새 글레이샤', icon: '🏔️', desc: '영구 빙하 위에 세워진 철옹성. 얼음 거인족의 침입을 막아온 최전선 요새. 내부에는 고대 룬 마법으로 가동되는 자동 방어 기제가 있다.' },
      npcs: [
        { name: '기사장 토르빈 "쇠손"', icon: '⚔️', role: '북방 기사단 단장. 얼음 거인의 팔 하나를 뜯어냈다는 전설의 전사.' },
        { name: '룬 마법사 크리스탈리아', icon: '🔮', role: '빙결 룬 연구의 권위자. 오로라를 마법에너지로 변환하는 기술 개발 중.' },
        { name: '족장 의회 의장 그리문드', icon: '🗡️', role: '열두 족장 중 수석. 여왕에게 반기를 들려는 세력을 이끈다는 소문.' },
      ],
      events: ['얼음 거인족 대침공', '빙하 던전 탐험대 조직', 'Thing 의회 권력 분쟁', '롱쉽 원정대 북방 항해'],
    }
  },

  // ── 남대륙 ── 사막+밀림 이중 지형 · 고대 문명 유적 · 태양신 신앙 ──
  south: {
    id: 'south', label: '남대륙', icon: '🌞', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2 L12 4.5 M12 19.5 L12 22 M2 12 L4.5 12 M19.5 12 L22 12 M5.1 5.1 L6.8 6.8 M17.2 17.2 L18.9 18.9 M18.9 5.1 L17.2 6.8 M6.8 17.2 L5.1 18.9"/></svg>`, color: '#e8a050', direction: '남',
    theme: '고대 제국의 유산 · 사막과 밀림 · 태양신 신앙',
    atmosphere: '거대한 사막이 대륙 북부를 덮고, 남쪽으로 갈수록 울창한 밀림으로 변한다. 수천 년 전 대마법 제국의 피라미드 신전이 모래 속에 반쯤 묻혀 있다. 태양이 모든 것을 지배하는 땅.',
    kingdom: {
      name: '황금 태양 왕국 케메트', icon: '☀️',
      capital: '태양 왕도 아우루스', capitalIcon: '🏛️',
      ruler: '태양왕 라메세스 "빛의 화신" IV세', rulerIcon: '🤴',
      desc: '수천 년 전 대마법 제국의 후계 국가. 고대 유물을 바탕으로 한 태양 마법과 연금술이 독보적이다.',
      lore: '고대 케메트 제국이 내전으로 붕괴한 뒤 3개 왕국이 통합되어 탄생. 파라오와 동일시되는 태양왕이 절대 권력을 행사하지만 신관단(사제 집단)이 그 권력을 실질적으로 뒤에서 조종한다. 밀림 깊숙이 아직 발굴되지 않은 고대 신전이 수십 곳에 달한다.',
      culture: '태양신 신앙·절대 신권 정치·고대 유물 숭배·연금술',
      specialty: '태양 마법·연금술·고대 유물·향신료·황금',
      military: '태양 근위대 · 신관 마법사 부대 · 전차 기병대',
      uniqueFeatures: ['신관단이 왕권 배후 조종', '사막 속 고대 던전 다수 존재', '고대 연금술 공식 독점', '밀림 원주민 부족들과의 복잡한 관계'],
      relations: { center: '우호', north: '중립', east: '무역 동맹', west: '적대', northeast: '교역', southeast: '중립' },
      uniqueLocation: { name: '태양 신전 솔아르카', icon: '⛩️', desc: '지상에서 가장 높은 피라미드 신전. 춘분·추분·하지·동지에 태양빛이 내부 제단을 정확히 비추는 고대 공학의 결정체. 신관단이 절대 통제하고 있다.' },
      npcs: [
        { name: '대신관 아멘호테프', icon: '✝️', role: '신관단 수장. 태양왕보다 더 많은 비밀을 안다.' },
        { name: '탐험가 후아나 "유적 사냥꾼"', icon: '🗺️', role: '고대 유적 발굴 전문가. 신관단과 갈등 중인 독립 연구자.' },
        { name: '밀림 부족장 아마루', icon: '🌿', role: '남부 밀림 원주민 연합 족장. 고대 유적의 진짜 수호자를 자처한다.' },
      ],
      events: ['고대 신전 봉인 해제', '태양왕 계승 위기', '신관단 내부 분열', '밀림 원주민 봉기'],
    }
  },

  // ── 동대륙 ── 무림 · 황실 · 동양풍 제국 ────────────────────────
  east: {
    id: 'east', label: '동대륙', icon: '🌋', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20 L8 6 L11 12 L13 9 L22 20 Z" stroke-linejoin="round"/><path d="M8 6 L6.5 3 M8 6 L9.5 3.5" stroke-width="1.2"/><circle cx="8" cy="6" r="1.1" fill="currentColor"/></svg>`, color: '#e85a30', direction: '동',
    theme: '드래곤 제국 · 화산 지형 · 용을 숭배하는 전사 문명',
    atmosphere: '대륙 전체가 화산맥으로 뒤덮여 있다. 용암 강이 흐르고 하늘에는 날개를 접은 고룡들이 선회한다. 이 땅의 전사들은 용의 숨결을 몸에 새기고, 드래곤 앞에 무릎 꿇는 것을 수치가 아닌 영광으로 여긴다. 불꽃이 꺼지지 않는 한 제국도 꺼지지 않는다.',
    kingdom: {
      name: '용염 제국 이그나르', icon: '🔥',
      capital: '용좌 왕도 아쉬카라', capitalIcon: '🌋',
      ruler: '용제(龍帝) 카르록스 "불꽃의 심장" 3세', rulerIcon: '🐲',
      desc: '살아있는 드래곤을 신으로 모시는 전사 제국. 황제는 고룡 이그나르의 피를 이어받은 혈통이어야만 즉위할 수 있다.',
      lore: '400년 전 고룡 이그나르가 인간 영웅 카르록스에게 자신의 피를 나눠주며 세운 계약 왕국에서 시작됐다. 지금은 제국으로 성장했지만 그 핵심 계약은 여전히 유효하다 — 황제 혈통이 끊기면 고룡들이 제국을 불태운다. 귀족 계급은 용의 비늘 조각을 몸에 문신처럼 새겨 신분을 증명하며, 가장 높은 명예는 드래곤 라이더(용기사)가 되는 것이다. 화산 지하에는 고대 드래곤들의 묘지가 있으며, 그 뼈에서 추출한 마법 재료 "용골"이 제국 경제를 지탱한다.',
      culture: '용 숭배·전사 명예·혈통 계약·화염 마법 신앙',
      specialty: '용골 마법 재료·화염 마법·흑요석 무기·드래곤 가죽 갑옷',
      military: '드래곤 라이더 부대 · 화염 마법사 군단 · 용암 중보병대',
      uniqueFeatures: [
        '황제 혈통이 끊기면 고룡들이 제국을 불태운다는 계약',
        '드래곤 라이더가 되는 것이 최고 명예 — 천 명 중 하나만 선택받음',
        '화산 지하 고룡 묘지에서 용골 채굴 — 제국 경제 핵심',
        '귀족은 용 비늘 문신으로 신분 증명',
        '고룡 3마리가 아직 살아있어 제국 수호자 역할'
      ],
      relations: { center: '경쟁', north: '긴장', west: '무역', south: '무역 동맹', northeast: '동맹', southeast: '교역' },
      uniqueLocation: {
        name: '용의 왕좌 — 이그나르 칼데라',
        icon: '🌋',
        desc: '제국 심장부에 있는 거대 칼데라. 살아있는 고룡 이그나르의 후손 "이그나르 2세"가 여기에 깃들어 있다. 황제 즉위식은 반드시 이 칼데라 앞에서 거행되며, 고룡이 불꽃을 내뿜어 황제를 인정해야 즉위가 완성된다.'
      },
      npcs: [
        { name: '드래곤 라이더단장 세라 "붉은 날개"', icon: '🐲', role: '제국 최강 전력 드래곤 라이더 부대의 단장. 전장에서는 산 하나를 불태운다.' },
        { name: '용골 연구소장 탈리스', icon: '🦴', role: '용골 마법 연구의 권위자. 고룡 묘지의 비밀을 쫓고 있으며 위험한 실험을 반복 중.' },
        { name: '황제 혈통 감찰관 크로마', icon: '🔥', role: '황제 혈통의 순수성을 감시하는 비밀 조직의 수장. 혈통이 의심되는 자는 고룡 앞에 세운다.' },
      ],
      events: [
        '드래곤 라이더 선발 시험 — 천 명 중 하나',
        '황제 혈통 위기 — 후계자 없는 용제의 병약',
        '고룡 묘지 심층 발굴 중 봉인된 고대 드래곤 부활 조짐',
        '용골 광맥 고갈 — 제국 경제 붕괴 위기'
      ],
    }
  },

  // ── 서대륙 ── 해양 상인 공화국 · 증기 기술 · 식민지 경쟁 ──────────
  west: {
    id: 'west', label: '서대륙', icon: '⚓', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7 L12 20"/><path d="M7 10 L17 10"/><path d="M4 14 C4 18.5 7.5 21 12 21 C16.5 21 20 18.5 20 14" stroke-width="1.4"/><path d="M4 14 L6.5 14 M20 14 L17.5 14" stroke-width="1.4"/></svg>`, color: '#6ab4e8', direction: '서',
    theme: '해양 무역 패권 · 상인 공화국 · 증기 기술과 식민지 야욕',
    atmosphere: '끝없이 펼쳐지는 바다, 항구마다 넘쳐나는 깃발과 상선, 조선소의 망치 소리. 마법보다 황금을 믿고, 혈통보다 계약을 중시하는 땅. 돈이 있는 자가 진짜 귀족이다.',
    kingdom: {
      name: '세 도시 해양 공화국 연맹', icon: '⚓',
      capital: '황금 항구 메르카타', capitalIcon: '🚢',
      ruler: '집정관 세라핀 코 "황금 혀"', rulerIcon: '🤴',
      desc: '세 대형 항구 도시가 연합한 상인 공화국. 귀족 혈통 대신 상공회의소가 실권을 쥔다.',
      lore: '과거 왕국이 무역 적자로 붕괴된 뒤 세 항구 도시가 연합 협정을 맺어 탄생. "혈통이 아니라 계약이 지배한다"는 원칙 아래 상공회의소 대표들이 집정관을 선출한다. 해군력이 오대륙 최강이며, 식민지 개척에 적극적. 최근 증기 기관 도입으로 산업 혁명 조짐이 보인다.',
      culture: '상업주의·계약 윤리·항해 전통·증기 기술 혁신',
      specialty: '해양 무역·증기 기계·폭발물·항해술·용병 수출',
      military: '해양 공화국 해군 · 증기 포함(砲艦) · 용병 군단',
      uniqueFeatures: ['상공회의소 선거로 집정관 선출', '오대륙 최강 해군력 보유', '증기 기관 개발 중 — 마법 대체 가능성', '식민지 개척으로 타 대륙과 마찰'],
      relations: { center: '긴장', north: '우호', east: '무역', south: '적대', northeast: '교역', northwest: '식민지 분쟁' },
      uniqueLocation: { name: '대공창 아이언하르트', icon: '⚙️', desc: '세계 최대 규모의 조선소 겸 증기 기계 공장. 전함·상선·증기 기관이 동시에 제작되는 서대륙 산업의 심장. 경쟁국들이 첩자를 끊임없이 보낸다.' },
      npcs: [
        { name: '상공회의소 총장 다비드 마르코', icon: '💰', role: '세 도시 최대 상인. 집정관보다 실질적 권력이 크다.' },
        { name: '해군 제독 카르미나 솔', icon: '⚓', role: '오대륙 최강 해군의 지휘관. 식민지 개척의 첨병.' },
        { name: '발명가 에다르손 "증기의 신"', icon: '⚙️', role: '증기 기관 개발의 선구자. 마법사들에게 적대적.' },
      ],
      events: ['식민지 영토 분쟁', '증기 기관 공개 시연', '해적 연합 봉기', '상공회의소 선거 부정 사건'],
    }
  },

  // ── 북동 대륙 ── 엘프 고원 왕국 · 자연 마법 · 종족 갈등 ───────────
  northeast: {
    id: 'northeast', label: '북동 대륙', icon: '🌿', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 12 12 12 8 C12 4.5 9 3 6 3 C6 6.5 8 9 12 9" stroke-linejoin="round"/><path d="M12 14 C12 14 12 9 15 7.5 C17 6.5 19 7 19 7 C19 9.5 17 12.5 12 12.5" stroke-linejoin="round"/></svg>`, color: '#70c878', direction: '북동',
    theme: '엘프 고원 왕국 · 자연·별빛 마법 · 종족 공존과 갈등',
    atmosphere: '수천 년 수령의 고목들이 숲을 이루는 고원. 별빛이 나무 사이로 내려앉는 밤, 엘프의 노래가 바람을 타고 흐른다. 시간은 천천히 흐르고, 기억은 수백 년을 이어간다.',
    kingdom: {
      name: '실버우드 엘프 고원 왕국', icon: '🌲',
      capital: '별빛 왕도 오로라홀', capitalIcon: '🌌',
      ruler: '달의 여왕 아엘린 "별빛의 목소리"', rulerIcon: '👸',
      desc: '수천 년 수령 고목이 자라는 고원에 세워진 엘프 왕국. 자연·별빛 마법 체계가 독보적으로 발전해 있다.',
      lore: '인간이 아직 도시를 세우기 전부터 존재한 고대 엘프 왕국. 달의 여왕이 천 년째 통치. 그러나 최근 인간 이민자 급증으로 종족 갈등이 심화되고 있다. 고대 엘프 유물 발굴 문제를 둘러싸고 왕국 내 보수파와 개방파가 대립 중.',
      culture: '자연 숭배·장수 종족 특유의 신중함·별빛 예언 신앙·고대 유산 보존',
      specialty: '자연 마법·별빛 마법·정밀 궁술·고대 엘프 유물·약초',
      military: '달빛 근위대 · 별빛 마법사 · 고원 수호 궁수단',
      uniqueFeatures: ['인간-엘프 종족 갈등 심화', '별빛 마법은 오직 엘프만 완전 사용 가능', '천 년 수령 나무 "세계수"가 왕국 중심에 존재', '예언사 집단이 미래를 보고 왕국 정책에 개입'],
      relations: { center: '경쟁', north: '적대', east: '동맹', south: '교역', west: '교역', northwest: '적대' },
      uniqueLocation: { name: '세계수 신전 이그드라', icon: '🌳', desc: '수만 년 수령의 거대한 세계수. 뿌리는 대지 깊이, 가지는 구름 위까지 뻗는다. 엘프 예언사들이 수액에서 미래를 읽는다.' },
      npcs: [
        { name: '대예언사 실라리엘', icon: '🔮', role: '세계수 신전의 수호자. 천 년 미래를 보지만 말을 아낀다.' },
        { name: '인간 사절 에단 로스', icon: '🤝', role: '인간-엘프 화해를 중재하는 외교관. 양쪽에서 의심받는다.' },
        { name: '고대 유물 밀수꾼 시리에', icon: '💎', role: '엘프 출신 배신자. 고대 유물을 서대륙 상인에게 팔아넘긴다.' },
      ],
      events: ['인간-엘프 종족 분쟁 격화', '세계수 저주 발동', '고대 유물 대규모 도굴 사건', '별빛 예언의 실현'],
    }
  },

  // ── 남동 대륙 ── 해적 왕국 · 군도(群島) · 저주와 전설의 바다 ────────
  southeast: {
    id: 'southeast', label: '남동 군도', icon: '🏴‍☠️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4"/><circle cx="9.7" cy="8" r="0.7" fill="currentColor"/><circle cx="14.3" cy="8" r="0.7" fill="currentColor"/><path d="M9.5 11.5 C10.3 12.3 13.7 12.3 14.5 11.5" stroke-width="1.2"/><path d="M8.5 4.5 L6.5 2.5 M15.5 4.5 L17.5 2.5" stroke-width="1.2"/><path d="M9 21 L9 15 L15 15 L15 21"/></svg>`, color: '#c87040', direction: '남동',
    theme: '해적 왕국 · 저주받은 바다 · 군도(群島) 열강 경쟁',
    atmosphere: '백 개 이상의 섬이 흩어진 군도. 열대 폭풍, 해적선의 검은 돛, 산호초 미로. 육지의 법이 닿지 않는 자유의 바다. 그러나 심해에는 오래된 저주가 잠들어 있다.',
    kingdom: {
      name: '자유 군도 해적 연맹', icon: '🏴‍☠️',
      capital: '해적 왕도 포르투 레알', capitalIcon: '⚓',
      ruler: '해적왕 "붉은 폭풍" 발타자르', rulerIcon: '🏴‍☠️',
      desc: '100개 섬에 흩어진 해적·어부·모험가들의 자유 연맹. 힘과 계약이 지배하는 바다의 왕국.',
      lore: '오래된 제국의 몰락 이후 노예로 팔려간 자들, 법망을 피해 도주한 자들, 모험을 꿈꾼 자들이 군도에 모였다. 해적왕은 투표로 선출되지만 실상은 가장 강한 함대를 가진 자가 된다. 군도 심해에는 고대 신이 봉인되어 있다는 전설이 있으며, 이를 둘러싼 탐욕과 공포가 연맹 내부를 흔든다.',
      culture: '자유주의·약탈 윤리·바다 신 신앙·해적 명예 규약',
      specialty: '해양 약탈·밀수·진귀한 군도 자원·심해 유물',
      military: '해적 연합 함대 · 저주받은 해골 선원 · 폭풍 마법사',
      uniqueFeatures: ['해적왕 선거 — 힘과 정치가 뒤엉킨 권력 게임', '심해 봉인된 고대 신 전설', '군도 100곳 각각 독자적 소왕국 성격', '저주받은 바다 구역 존재 — 들어간 배가 돌아오지 않음'],
      relations: { center: '교역', north: '중립', east: '교역', south: '중립', west: '식민지 분쟁', northeast: '교역' },
      uniqueLocation: { name: '봉인의 심연 — 테네브라 해구', icon: '🌊', desc: '군도 한가운데 위치한 수심 불명의 거대 해구. 여기에 닿은 배는 돌아오지 않는다. 폭풍이 항상 맴돌며, 해구 주변에서는 나침반이 작동하지 않는다.' },
      npcs: [
        { name: '해적왕 발타자르 "붉은 폭풍"', icon: '🏴‍☠️', role: '현 해적왕. 카리스마와 폭력으로 연맹을 장악. 심해의 진실을 알고 있다.' },
        { name: '폭풍 마법사 마리넬라', icon: '🌊', role: '기상 마법 전문가. 해적왕의 비밀 참모. 봉인된 신과 교신한다는 소문.' },
        { name: '밀수 왕 잭 "세 혀"', icon: '💰', role: '군도 전체 밀수 네트워크 장악. 모든 세력에 물자를 판다.' },
      ],
      events: ['해적왕 선거 쿠데타', '심해 봉인 약화 — 괴물 출현', '서대륙 식민지 함대와 해전', '군도 소왕국들의 분열'],
    }
  },

  // ── 북서 대륙 ── 드워프 왕국 · 지하 도시 · 고대 기계 문명 ─────────
  northwest: {
    id: 'northwest', label: '북서 대륙', icon: '⛏️', svgIcon:`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 C4 4 9 4 12 7 C15 10 15 15 15 15" stroke-linejoin="round"/><path d="M20 4 C20 4 15 4 12 7" stroke-linejoin="round"/><path d="M6 20 L15 11" stroke-width="1.8"/></svg>`, color: '#a07848', direction: '북서',
    theme: '드워프 지하 왕국 · 고대 기계 문명 · 땅 위와 지하의 이중 세계',
    atmosphere: '지상은 황량한 암석 고원, 지하는 수백 킬로미터 뻗은 터널 도시. 용광로의 열기, 쇠 두드리는 소리, 광석 캐는 노래. 드워프들은 수천 년을 땅 속에서 살며 세계 최고 수준의 야금술과 기계 공학을 완성했다.',
    kingdom: {
      name: '지하 왕국 카라드움', icon: '⛏️',
      capital: '용광로 왕도 이그드하르', capitalIcon: '🔥',
      ruler: '왕중왕 투린 "화강암 주먹" XVII세', rulerIcon: '👑',
      desc: '수십 개 지하 도시가 연결된 드워프 지하 왕국. 야금술·기계 공학·고대 기계 문명 복원이 전문.',
      lore: '수천 년 전 지상의 대재앙을 피해 땅 아래로 내려간 드워프들이 건설한 지하 문명. 지금은 지상 왕국들보다 더 발전된 기계 기술을 보유. 단, 최근 지하 깊은 곳에서 고대 기계 문명의 잔재가 발견되며 "그것들"이 재가동되기 시작했다는 보고가 이어진다.',
      culture: '씨족 명예·장인 정신·조상 숭배·기계 신앙',
      specialty: '야금술·기계 공학·루네스톤(마법 광석)·고대 기계 복원',
      military: '기계 골렘 부대 · 화기(火器) 전문 부대 · 지하 요새 방어망',
      uniqueFeatures: ['지하 도시 네트워크 — 지상보다 넓은 문명권', '고대 기계 문명 유적 발굴 진행 중', '드워프-지상 종족 간 지하 자원 분쟁', '"잠든 기계들"이 깨어나는 징조'],
      relations: { center: '중립', north: '우호', east: '중립', west: '긴장', northeast: '적대', south: '중립' },
      uniqueLocation: { name: '고대 기계 신전 — 기어하트', icon: '⚙️', desc: '지하 최심부에서 발견된 고대 기계 문명의 신전. 수백만 개의 톱니가 지금도 돌아가고 있다. 그 중심에 무언가가 잠들어 있다.' },
      npcs: [
        { name: '대장장이 왕 투린 XVII세', icon: '⚒️', role: '지하 왕국 최고 통치자. 고대 기계의 비밀을 알고 있다고 의심받는다.' },
        { name: '기계 사제 볼린 "철의 손"', icon: '⚙️', role: '고대 기계 문명 연구의 권위자. 기계에 신성이 깃든다고 믿는다.' },
        { name: '지상 첩자 기미 ', icon: '🕵️', role: '드워프 출신 지상 정보원. 지하 왕국 비밀을 중앙 대륙에 팔아넘긴다.' },
      ],
      events: ['고대 기계 재가동 위기', '지하 자원 채굴권 분쟁', '드워프-서대륙 기술 전쟁', '잠든 기계 군단 부활 전조'],
    }
  },
};

FIVE_CONTINENTS.central = FIVE_CONTINENTS.center;

FIVE_CONTINENTS.northeast_cont = FIVE_CONTINENTS.northeast;

FIVE_CONTINENTS.southeast_cont = FIVE_CONTINENTS.southeast;

FIVE_CONTINENTS.northwest_cont = FIVE_CONTINENTS.northwest;

FIVE_CONTINENTS.celestial = {
  id: 'celestial', label: '천계', icon: '✨', color: '#f0d860', direction: '천상',
  theme: '신성의 영역 · 천사와 신들의 도시 · 순수한 빛의 세계',
  atmosphere: '구름 위에 펼쳐지는 황금빛 도시. 시간이 느리게 흐르고 모든 것이 성스럽게 빛난다. 세레스티얼이거나 신앙이 깊은 자, 또는 천계와 인연을 맺은 자만이 들어설 수 있다.',
  _isSpecialDimension: true,
  _accessCond: 'celestial',
  kingdom: {
    name: '천상 도시 아우로라', icon: '✨',
    capital: '심판의 광장', capitalIcon: '⚖️',
    ruler: '대천사장 미카엘', rulerIcon: '👼',
    desc: '신성한 빛의 세계. 세레스티얼 종족의 고향이자 신앙이 깊은 자가 도달할 수 있는 곳.',
    lore: '천계는 아무나 닿을 수 없다. 세레스티얼의 피를 이었거나, 신에 대한 믿음이 극에 달했거나, 천계의 관문을 열 수 있는 특별한 인연이 있어야 한다. 이 곳의 시간은 속세와 다르게 흐른다.',
    culture: '신성 질서·심판·자비·신앙',
    specialty: '신성 마법·정화·예언·천계 유물',
    military: '천사 근위대 · 성광 마법사단',
    relations: { center: '우호', celestial: '본거지', infernal: '적대' },
    uniqueLocation: { name: '심판의 광장', icon: '⚖️', desc: '천계 중심의 거대한 황금 광장. 신의 심판이 내려지는 장소.' },
    npcs: [
      { name: '대천사장 미카엘', icon: '⚔️', role: '천계 수호자. 타락한 존재를 용납하지 않는다.' },
      { name: '예언사 가브리엘', icon: '📜', role: '신의 말씀을 전하는 자. 사명을 부여한다.' },
    ],
    events: ['천계의 시련', '타락한 천사 토벌전', '신성 사명 하달'],
  }
};

FIVE_CONTINENTS.infernal = {
  id: 'infernal', label: '마계', icon: '🔥', color: '#e03020', direction: '심연',
  theme: '혼돈과 어둠의 영역 · 악마와 마왕의 지배 · 욕망과 계약의 세계',
  atmosphere: '끝없는 용암 평원, 검은 하늘에 번쩍이는 번개, 유황 냄새. 악마족이거나 극도로 타락했거나, 마계와 계약을 맺은 자만이 살아 들어올 수 있다.',
  _isSpecialDimension: true,
  _accessCond: 'infernal',
  kingdom: {
    name: '마도시 카르나크', icon: '😈',
    capital: '혼돈의 왕좌', capitalIcon: '🔱',
    ruler: '마왕 베엘제부브', rulerIcon: '👑',
    desc: '혼돈과 어둠의 세계. 악마족의 고향이자 타락의 끝에 도달한 자가 이르는 곳.',
    lore: '마계는 강자의 논리가 지배한다. 악마족의 피를 이었거나, 타락이 극에 달했거나, 마계의 균열을 통과할 수 있는 힘이 있어야 한다. 여기서의 계약은 영혼을 담보로 한다.',
    culture: '힘의 논리·계약·배신·혼돈',
    specialty: '혼돈 마법·타락·계약 마법·마계 유물',
    military: '악마 군단 · 지옥 기사단',
    relations: { center: '긴장', infernal: '본거지', celestial: '적대' },
    uniqueLocation: { name: '혼돈의 왕좌', icon: '🔱', desc: '마왕이 좌정하는 마계의 심장. 근접한 것만으로도 의지가 흔들린다.' },
    npcs: [
      { name: '마왕 베엘제부브', icon: '👑', role: '마계의 지배자. 힘을 원하는 자에게 계약을 제안한다.' },
      { name: '계약 중개자 아스모데우스', icon: '📜', role: '마계 계약 전문가. 어떤 소원도 이뤄주지만 대가가 있다.' },
    ],
    events: ['마왕 타도 도전', '마계 투기장 대전', '금기 계약 의식'],
  }
};

export const CONTINENT_REP_KEY = 'tf-continent-rep';

export function loadContinentRep(){ try{ return JSON.parse(lsGet(CONTINENT_REP_KEY)||'{}'); }catch(e){ return {}; } }
window.loadContinentRep = loadContinentRep;

export function saveContinentRep(d){ try{ lsSet(CONTINENT_REP_KEY, JSON.stringify(d)); }catch(e){} }
window.saveContinentRep = saveContinentRep;

export function getContinentRepLevel(score){
  if(score >= 60) return { label:'충성 동맹', color:'#60d060' };
  if(score >= 30) return { label:'우호', color:'#80b080' };
  if(score >= 0) return { label:'중립', color:'#8a7a5a' };
  if(score >= -30) return { label:'경계', color:'#d0a050' };
  return { label:'적대', color:'#e05050' };
}
window.getContinentRepLevel = getContinentRepLevel;

export function updateContinentRep(continentId, delta, reason){
  const rep = loadContinentRep();
  rep[continentId] = Math.max(-100, Math.min(100, (rep[continentId]||0) + delta));
  saveContinentRep(rep);
  if(typeof toast === 'function'){
    const cont = FIVE_CONTINENTS[continentId==='central'?'center':continentId];
    if(cont) toast(`${cont.kingdom.name} 관계 ${delta>0?'+':''}${delta} (${reason})`, 2500, cont);
  }
}
window.updateContinentRep = updateContinentRep;

export function renderContinentsPanel(){
  const rep = loadContinentRep();
  const race = (S.character?.race||'').toLowerCase();
  const gsFlags = (typeof loadGSFlags==='function') ? loadGSFlags() : {};
  const demonStage = (() => { try{ return JSON.parse(lsGet('tf-demon-corruption')||'{}').stage||0; }catch(e){ return 0; } })();
  const canCelestial = race.includes('세레스티얼')||race.includes('celestial')||(S.stats?.fath||0)>=80||gsFlags['celestial_gate_open'];
  const canInfernal  = race.includes('악마')||race.includes('demon')||demonStage>=4||gsFlags['infernal_gate_open'];
  const dirOrder = ['north','northeast','east','southeast','south','west','northwest','center',
    ...(canCelestial?['celestial']:[]),
    ...(canInfernal ?['infernal'] :[]),
  ];
  return `
    <div style="margin-bottom:14px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:8px;letter-spacing:1px">🌍 오대륙 왕국</div>
      ${dirOrder.map(id => {
        const c = FIVE_CONTINENTS[id];
        if(!c) return '';
        const k = c.kingdom;
        const score = rep[id]||0;
        const rl = getContinentRepLevel(score);
        const pct = Math.round((score+100)/2);
        return `<div style="padding:8px 10px;background:#0d0800;border:1px solid ${c.color}44;margin-bottom:5px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
            <span style="color:${c.color};display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(c,{size:16}):(c.svgIcon||c.icon)}</span>
            <div style="flex:1">
              <div style="font-family:Cinzel,serif;font-size:10px;color:${c.color}">${c.direction}대륙 · ${k.name} ${typeof getEntityIconHTML==='function'?getEntityIconHTML(k,{size:10}):(k.icon)}</div>
              <div style="font-size:9px;color:var(--dim)">${k.capitalIcon} ${k.capital} · ${k.rulerIcon} ${k.ruler}</div>
            </div>
            <span style="font-size:9px;color:${rl.color};flex-shrink:0">${rl.label}</span>
          </div>
          <div style="font-size:9px;color:var(--dim);margin-bottom:4px;line-height:1.4">${k.desc}</div>
          <div style="font-size:8px;color:${c.color}99;margin-bottom:4px">🏛️ ${k.culture} &nbsp;|&nbsp; ⚔️ ${k.military}</div>
          <div style="font-size:8px;color:#6a8a6a;margin-bottom:5px">🛒 ${k.specialty}</div>
          <div style="height:3px;background:#1a1005;border-radius:2px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${c.color};border-radius:2px;transition:width .4s"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:2px">
            <span style="font-size:8px;color:var(--dim)">관계도 ${score>0?'+':''}${score}</span>
            <span style="font-size:8px;color:#4a8a7a">✨ ${typeof getEntityIconHTML==='function'?getEntityIconHTML(k.uniqueLocation,{size:8}):(k.uniqueLocation.icon)} ${k.uniqueLocation.name}</span>
          </div>
          <div style="margin-top:5px;display:flex;gap:3px;flex-wrap:wrap">
            ${k.events.map(ev=>`<span style="font-size:8px;padding:2px 6px;background:#1a1005;border:1px solid ${c.color}33;color:${c.color}cc;border-radius:1px">📌 ${ev}</span>`).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div style="margin-bottom:10px">
      <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px;letter-spacing:1px">🤝 대륙 간 관계도</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${dirOrder.map(id=>{
          const c = FIVE_CONTINENTS[id];
          if(!c) return '';
          const k = c.kingdom;
          return Object.entries(k.relations).map(([dir, rel])=>{
            const tc = FIVE_CONTINENTS[dir];
            if(!tc) return '';
            const relColor = rel==='동맹'?'#60d060':rel==='우호'?'#80b080':rel==='무역 동맹'?'#6ab080':rel==='경쟁'?'#d0a050':rel==='긴장'?'#d08050':'#e05050';
            return `<div style="font-size:8px;padding:3px 6px;background:#0d0800;border:1px solid #2a1a05">
              <span style="color:${c.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(c,{size:16}):(c.icon)}</span> ↔ <span style="color:${tc.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tc,{size:16}):(tc.icon)}</span>
              <span style="color:${relColor};margin-left:4px">${rel}</span>
            </div>`;
          }).join('');
        }).join('')}
      </div>
    </div>
  `;
}
window.renderContinentsPanel = renderContinentsPanel;

export function renderWorldMap(){
  const locations  = loadLocations();
  const rep        = loadReputation();
  const endings    = loadEndings();
  const relics     = loadOwnedRelics();
  const repLevel   = [...REPUTATION_LEVELS].reverse().find(l=>rep.score>=l.min)||REPUTATION_LEVELS[0];
  const allLocs    = window.getAllLocations();
  const curLocId   = loadCurrentLocation()?.id;

  // ── 대륙별 분류 ─────────────────────────────
  const celestialLocs = allLocs.filter(l=>l.continent==='celestial');
  const infernalLocs  = allLocs.filter(l=>l.continent==='infernal');
  const mortalLocs    = allLocs.filter(l=>l.continent!=='celestial'&&l.continent!=='infernal');

  const hasCelestial = celestialLocs.length > 0;
  const hasInfernal  = infernalLocs.length  > 0;

  const sizeOrder = { hamlet:0,village:1,town:2,port:2,city:3,capital:4,special:5,shrine:6,dungeon:7,event:8,wilderness:8 };
  const sizeLabel = { hamlet:'🛖 소촌',village:'🏚️ 마을',town:'🏘️ 중소도시',port:'⚓ 항구',city:'🏙️ 도시',capital:'🏰 수도',special:'✨ 특수',shrine:'⛩️ 성소',dungeon:'🗝️ 던전',event:'⚔️ 이벤트',wilderness:'🌾 황야' };

  // ── 장소 카드 렌더 (공통) ─────────────────────
  function locCard(loc, theme){
    const isCurrent = curLocId === loc.id;
    const isC = theme==='celestial', isI = theme==='infernal';
    const bg     = isCurrent ? (isC?'#1a1a00':isI?'#1a0000':'#1a1005') : (isC?'rgba(255,240,100,.04)':isI?'rgba(220,40,20,.04)':'#0d0800');
    const border = isCurrent ? (isC?'#f0d860':isI?'#e03020':'var(--gold)') : (isC?'rgba(240,216,96,.25)':isI?'rgba(220,60,30,.25)':'var(--border)');
    const nameCol= isCurrent ? (isC?'#f0d860':isI?'#ff6040':'var(--gold)') : (isC?'#e8d070':isI?'#e86040':'var(--text)');
    const typeColor={hamlet:'#7a6a4a',village:'#5a8a5a',town:'#4a7aaa',port:'#3080a0',city:'#aa7a2a',capital:'#c8a030',special:isC?'#c8b840':isI?'#e05030':'#7a4aaa',shrine:'#aa4a4a',dungeon:isI?'#c03020':'#4a4a6a',event:'#6a4a2a',wilderness:'#6a8050'}[loc.type]||'#5a5a5a';
    const moveFn = `(window.beginJourneyTo||moveToLocation)('${loc.name.replace(/'/g,"\\'")}');closeP('worldmap');openP('location')`;
    return `<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:${bg};border:1px solid ${border};margin-bottom:4px;${isC?'box-shadow:0 0 8px rgba(240,216,96,.08)':isI?'box-shadow:0 0 8px rgba(220,60,30,.08)':''}">
      <span style="font-size:18px;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:18}):loc.icon}</span>
      <div style="flex:1;min-width:0">
        <div style="font-family:Cinzel,serif;font-size:10px;color:${nameCol}">${esc(loc.name)} ${isCurrent?'<span style="font-size:8px;color:#60a060">◀ 현재</span>':''}</div>
        <div style="font-size:9px;color:${typeColor}">${sizeLabel[loc.type]||loc.type}${loc.population?' · 👥 '+esc(loc.population):''}</div>
        <div style="font-size:9px;color:var(--dim);margin-top:1px">${esc(loc.desc)}</div>
      </div>
      ${!isCurrent?`<button class="btn btn-dark" style="padding:4px 8px;font-size:8px;flex-shrink:0;${isC?'border-color:#f0d86060;color:#f0d860':isI?'border-color:#e0302060;color:#e06040':''}" onclick="${moveFn}">이동</button>`:'<div style="font-size:9px;color:#60a060;flex-shrink:0">여기</div>'}
    </div>`;
  }

  // ── 탭 상태 (DOM 직접 저장) ──────────────────
  const tabId = 'wm-dim-tab';

  return `
    <!-- ══ 차원 탭 헤더 ══════════════════════════ -->
    <div style="display:flex;gap:0;margin-bottom:12px;border:1px solid var(--border);overflow:hidden">
      <button id="wm-tab-mortal" onclick="wmSwitchTab('mortal')"
        style="flex:1;padding:8px 4px;background:#0d0800;border:none;border-right:1px solid var(--border);color:var(--gold);font-family:Cinzel,serif;font-size:9px;cursor:pointer;letter-spacing:.5px">
        🌍 속세
      </button>
      ${hasCelestial?`<button id="wm-tab-celestial" onclick="wmSwitchTab('celestial')"
        style="flex:1;padding:8px 4px;background:#0d0a00;border:none;border-right:1px solid var(--border);color:#d4c060;font-family:Cinzel,serif;font-size:9px;cursor:pointer;letter-spacing:.5px">
        ✨ 천계
      </button>`:''}
      ${hasInfernal?`<button id="wm-tab-infernal" onclick="wmSwitchTab('infernal')"
        style="flex:1;padding:8px 4px;background:#0d0000;border:none;color:#c04030;font-family:Cinzel,serif;font-size:9px;cursor:pointer;letter-spacing:.5px">
        🔥 마계
      </button>`:''}
    </div>

    <!-- ══ 속세 패널 ══════════════════════════════ -->
    <div id="wm-pane-mortal">
      <!-- 방문 기록 -->
      <div style="margin-bottom:12px">
        <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px;letter-spacing:1px">🌍 세계 지도 (${locations.length}곳 방문)</div>
        ${locations.length===0?'<div style="color:var(--dim);font-size:11px">아직 방문한 장소가 없습니다</div>':
        '<div style="display:flex;flex-wrap:wrap;gap:5px">'+
        locations.map(l=>`<div style="padding:4px 9px;background:#0d0800;border:1px solid var(--border);border-radius:2px;font-size:11px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(l,{size:11}):(l.icon)} ${esc(l.name)}</div>`).join('')+
        '</div>'}
      </div>
      <!-- 이동 가능 장소 -->
      <div style="margin-bottom:14px">
        <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:8px;letter-spacing:1px">🗺️ 이동 가능한 장소 (${mortalLocs.length}곳)</div>
        ${[...mortalLocs].sort((a,b)=>(sizeOrder[a.type]||9)-(sizeOrder[b.type]||9)).map(l=>locCard(l,'mortal')).join('')}
      </div>
      <!-- 평판 -->
      <div style="margin-bottom:12px">
        <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px;letter-spacing:1px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(repLevel,{size:10}):(repLevel.icon)} 평판: ${rep.level}</div>
        <div style="font-size:11px;color:var(--dim)">"${esc(rep.title)}" · 점수 ${rep.score}</div>
        <div style="height:5px;background:#1a1005;border-radius:3px;overflow:hidden;margin-top:6px">
          <div style="width:${Math.min(100,(rep.score/2000)*100)}%;height:100%;background:linear-gradient(90deg,var(--gold),#e8c97e)"></div>
        </div>
      </div>
      ${renderContinentsPanel()}
      <!-- 유물 -->
      <div style="margin-bottom:12px">
        <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px;letter-spacing:1px">🏛️ 유물 (${relics.length}/${RELICS.length})</div>
        ${relics.length===0?'<div style="color:var(--dim);font-size:11px">획득한 유물 없음</div>':
        RELICS.filter(r=>relics.includes(r.id)).map(r=>`<div style="padding:6px 9px;background:#0d0800;border:1px solid #4a3a0a;margin-bottom:3px;font-size:11px">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:11}):(r.icon)} ${esc(r.name)} — <span style="color:var(--dim)">${esc(r.desc)}</span></div>`).join('')}
      </div>
      <!-- 엔딩 -->
      <div>
        <div style="font-family:Cinzel,serif;font-size:10px;color:var(--gold);margin-bottom:6px;letter-spacing:1px">🎭 달성한 엔딩 (${endings.length}개)</div>
        ${endings.length===0?'<div style="color:var(--dim);font-size:11px">아직 엔딩을 달성하지 못했습니다</div>':
        endings.map(e=>`<div style="padding:5px 9px;background:#0d0800;border:1px solid var(--border);margin-bottom:3px;font-size:11px;color:var(--gold)">${esc(e.name)}</div>`).join('')}
      </div>
    </div>

    <!-- ══ 천계 패널 ══════════════════════════════ -->
    ${hasCelestial?`<div id="wm-pane-celestial" style="display:none">
      <!-- 천계 배경 헤더 -->
      <div style="padding:16px 12px;margin-bottom:14px;background:linear-gradient(180deg,rgba(240,216,96,.12) 0%,rgba(255,248,180,.04) 100%);border:1px solid rgba(240,216,96,.3);text-align:center;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,216,96,.15),transparent 70%)"></div>
        <div style="font-size:28px;margin-bottom:6px;position:relative">✨</div>
        <div style="font-family:Cinzel,serif;font-size:13px;color:#f0d860;letter-spacing:2px;position:relative">천 계</div>
        <div style="font-family:Cinzel,serif;font-size:9px;color:rgba(240,216,96,.6);letter-spacing:1px;margin-top:3px;position:relative">CELESTIAL REALM</div>
        <div style="font-size:9px;color:rgba(240,216,96,.5);margin-top:8px;line-height:1.6;position:relative">신성한 빛의 차원. 세레스티얼이거나<br>신앙이 극에 달한 자만이 발을 디딜 수 있다.</div>
      </div>
      <!-- 천계 장소 목록 -->
      <div style="margin-bottom:8px">
        <div style="font-family:Cinzel,serif;font-size:9px;color:rgba(240,216,96,.7);letter-spacing:1.5px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid rgba(240,216,96,.2)">✦ 천계의 장소 (${celestialLocs.length}곳)</div>
        ${[...celestialLocs].sort((a,b)=>(sizeOrder[a.type]||9)-(sizeOrder[b.type]||9)).map(l=>locCard(l,'celestial')).join('')}
      </div>
    </div>`:''}

    <!-- ══ 마계 패널 ══════════════════════════════ -->
    ${hasInfernal?`<div id="wm-pane-infernal" style="display:none">
      <!-- 마계 배경 헤더 -->
      <div style="padding:16px 12px;margin-bottom:14px;background:linear-gradient(180deg,rgba(200,30,10,.14) 0%,rgba(80,0,0,.06) 100%);border:1px solid rgba(200,50,20,.35);text-align:center;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 50% 100%,rgba(200,30,10,.2),transparent 70%)"></div>
        <div style="font-size:28px;margin-bottom:6px;position:relative">🔥</div>
        <div style="font-family:Cinzel,serif;font-size:13px;color:#e84020;letter-spacing:2px;position:relative">마 계</div>
        <div style="font-family:Cinzel,serif;font-size:9px;color:rgba(220,60,30,.6);letter-spacing:1px;margin-top:3px;position:relative">INFERNAL REALM</div>
        <div style="font-size:9px;color:rgba(220,60,30,.55);margin-top:8px;line-height:1.6;position:relative">혼돈과 어둠의 차원. 악마족이거나<br>타락이 극에 달한 자만이 살아 들어올 수 있다.</div>
      </div>
      <!-- 마계 장소 목록 -->
      <div style="margin-bottom:8px">
        <div style="font-family:Cinzel,serif;font-size:9px;color:rgba(220,60,30,.7);letter-spacing:1.5px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid rgba(200,50,20,.25)">✦ 마계의 장소 (${infernalLocs.length}곳)</div>
        ${[...infernalLocs].sort((a,b)=>(sizeOrder[a.type]||9)-(sizeOrder[b.type]||9)).map(l=>locCard(l,'infernal')).join('')}
      </div>
    </div>`:''}

    <div id="wm-tab-init" data-inittab="mortal"></div>
  `;
  // 초기 탭 활성화 (렌더 직후)
  setTimeout(function(){
    var initTab = sessionStorage.getItem('wm-last-tab') || 'mortal';
    if(typeof window.wmSwitchTab === 'function') window.wmSwitchTab(initTab);
  }, 20);
}
window.renderWorldMap = renderWorldMap;

export function _onArriveAtDemesne(loc, transport){
  try{
    const d = loadDemesne();
    if(!d || !d.established) return;
    const res = calcDemesneResources(d);
    const stage = getPopStage(d.popStage||0);
    const season = getDemesneSeason(d.season||0);
    const status = getDemesneStatusLabel(d);
    const activeEvents = (d.events||[]).filter(e=>!e.resolved);
    const suspended = (d.suspendedBuildings||[]);
    const pop = d.population||500;
    const tIcon = transport ? transport.icon+' ' : '';

    // ── 귀환 환영 연출 ──
    setTimeout(()=>toastHTML(`${esc(tIcon)}${typeof getEntityIconHTML==='function'?getEntityIconHTML(loc,{size:14}):(loc.icon)} ${esc(d.name)}에 귀환했습니다!`, 3000), 200);

    // ── 부재 중 이벤트 처리 ──
    const absence = d._absence||{};
    if(absence.startTurn && (S.msgCount||0) - absence.startTurn >= 5){
      _processDemesneAbsenceEvents(d, absence);
    }
    d._absence = null;
    d._atDemesne = true;
    saveDemesne(d);

    // ── AI 서사 주입 ──
    const evtHint = activeEvents.length
      ? `긴급 이벤트가 처리를 기다리고 있다: ${activeEvents.map(e=>{ const ed=DEMESNE_EVENT_DEFS?.find(ev=>ev.id===e.id); return ed?ed.name:e.id; }).join(', ')}.`
      : '';
    const susHint = suspended.length
      ? `일부 건물(${suspended.map(bid=>{ const b=getDemesneBuilding?.(bid); return b?b.name:bid; }).join(', ')})이 유지비 부족으로 중단된 상태다.`
      : '';
    const loyaltyHint = res.loyalty >= 75 ? '영민들이 환호하며 영주를 맞이한다.' :
                        res.loyalty >= 50 ? '영민들이 조용히 영주를 맞이한다.' :
                        res.loyalty >= 30 ? '영민들의 표정이 어둡다. 불만이 쌓여 있다.' :
                        '영민들이 영주를 경계하는 눈빛으로 바라본다. 일촉즉발의 상황이다.';
    const prosperityHint = res.prosperity >= 70 ? `${stage.icon}${stage.name}은 활기차고 번영하고 있다.` :
                           res.prosperity >= 40 ? `${stage.icon}${stage.name}은 그럭저럭 유지되고 있다.` :
                           `${stage.icon}${stage.name}의 분위기가 침울하다. 경제 상황이 좋지 않다.`;

    if(S._nextInjectedContext !== undefined){
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        ` [영지 "${d.name}" 귀환. ${season.icon}${season.name}. 인구 ${window._fmtPop?window._fmtPop(pop):pop}명. 상태: ${status.label}. ${loyaltyHint} ${prosperityHint} ${evtHint} ${susHint} 영주의 귀환에 맞게 영지의 분위기와 영민들의 반응을 생생하게 묘사하라.]`;
    }

    // ── 이벤트 있으면 알림 ──
    if(activeEvents.length > 0){
      setTimeout(()=>toast(`⚠️ 처리 대기 중인 영지 이벤트 ${activeEvents.length}건!`, 3500), 800);
    }
    if(suspended.length > 0){
      setTimeout(()=>toast(`⚙️ 건물 ${suspended.length}개 운영 중단 상태. 골드를 확인하세요.`, 3000), 1400);
    }

    // 영지 패널 갱신
    // [버그 수정] renderDemesnePanel을 bare import 참조로 setTimeout에
    // 넘기면 misc/323의 hookV5toRenderPanel(영지 패널 렌더 후 V5 확장
    // 섹션을 같이 그리는 훅)이 적용된 window.renderDemesnePanel 재할당을
    // 건너뛴다(다른 죽은 훅들과 동일한 원인) — 귀환 시 패널이 이미 열려
    // 있으면 V5 섹션만 갱신되지 않고 낡은 채로 남는다. window.
    // renderDemesnePanel을 우선 사용해 훅이 항상 적용되게 한다.
    if(typeof renderDemesnePanel === 'function') setTimeout(()=>{ (window.renderDemesnePanel||renderDemesnePanel)(); }, 300);

  }catch(e){ console.warn('_onArriveAtDemesne error:', e); }
}
window._onArriveAtDemesne = _onArriveAtDemesne;

export function _onDepartDemesne(loc){
  try{
    const d = loadDemesne();
    if(!d || !d.established) return;
    const res = calcDemesneResources(d);

    // 출발 경고
    if(res.defense < 35){
      toast(`⚠️ 경고: "${d.name}"의 방어력이 위험 수준입니다! 부재 중 침략 위험이 높습니다.`, 4500);
    } else if(res.loyalty < 30){
      toast(`⚠️ 경고: "${d.name}"의 충성도가 매우 낮습니다! 부재 중 소요 발생 가능성이 있습니다.`, 4000);
    }

    // 부재 시작 기록
    d._atDemesne = false;
    d._absence = { startTurn: S.msgCount||0, defenseAtDepart: res.defense, loyaltyAtDepart: res.loyalty };
    saveDemesne(d);

    if(S._nextInjectedContext !== undefined){
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        ` [영지 "${d.name}"을 떠난다. 방어력: ${res.defense}, 충성도: ${res.loyalty}. 영주 부재 중이다.]`;
    }
  }catch(e){}
}
window._onDepartDemesne = _onDepartDemesne;

export function _processDemesneAbsenceEvents(d, absence){
  const absentTurns = Math.min((S.msgCount||0) - (absence.startTurn||0), 30);
  const events = [];

  // 방어력 낮은 상태로 오래 비우면 침략 발생
  if((absence.defenseAtDepart||0) < 40 && absentTurns >= 10 && Math.random() < 0.4){
    d.defense = Math.max(0, (d.defense||50) - 15);
    d.prosperity = Math.max(0, (d.prosperity||50) - 10);
    events.push('⚔️ 부재 중 소규모 침략이 있었다. 방어력과 번영도가 하락했다.');
  }
  // 충성도 낮은 상태로 오래 비우면 소요
  if((absence.loyaltyAtDepart||0) < 35 && absentTurns >= 8 && Math.random() < 0.35){
    d.loyalty = Math.max(0, (d.loyalty||50) - 12);
    d.tax = Math.max(0, (d.tax||50) - 8);
    events.push('🗡️ 부재 중 소요가 일어났다. 충성도와 세수가 하락했다.');
  }
  // 번영도 높으면 자연 성장
  if((d.prosperity||50) >= 65 && absentTurns >= 5){
    d.population = Math.floor((d.population||500) * (1 + absentTurns * 0.002));
    events.push('🌱 부재 중에도 영지가 꾸준히 성장했다.');
  }

  if(events.length > 0){
    saveDemesne(d);
    setTimeout(()=>{
      events.forEach((msg, i) => setTimeout(()=>toast(msg, 4000), i*800));
    }, 600);
    if(S._nextInjectedContext !== undefined){
      S._nextInjectedContext = (S._nextInjectedContext||'') +
        ` [영주 부재(${absentTurns}턴) 중 영지 변화: ${events.join(' ')}]`;
    }
  }
}
window._processDemesneAbsenceEvents = _processDemesneAbsenceEvents;

export function _renderDemesneLocationBlock(){
  try{
    const d = loadDemesne();
    if(!d || !d.established) return '';
    const res = calcDemesneResources(d);
    const stage = getPopStage(d.popStage||0);
    const tier = getDemesneTier(d.tier||1);
    const status = getDemesneStatusLabel(d);
    const activeEvents = (d.events||[]).filter(e=>!e.resolved);
    const pop = d.population||500;
    const popStr = window._fmtPop ? window._fmtPop(pop) : pop+'';
    const esc2 = (s)=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    // 빠른 행동 버튼
    const quickActions = [
      { label:'🏰 영지 관리',  onclick:"openP('demesne');renderDemesnePanel()", color:'var(--gold)' },
      { label:'👥 인구 현황', onclick:"openP('demesne');setDemesneTab('population')", color:'#60c060' },
      { label:'⚜️ 봉신 소집', onclick:"openP('demesne');setDemesneTab('vassals')", color:'#c0a040' },
      { label:'📜 정책 결정', onclick:"openP('demesne');setDemesneTab('policies')", color:'#8060c0' },
    ];

    return `
    <div style="margin-bottom:12px;padding:10px 12px;background:linear-gradient(135deg,#0d0a00,#1a1200);border:2px solid ${tier.color};border-radius:2px">
      <div style="font-family:'Cinzel',serif;font-size:10px;color:${tier.color};letter-spacing:1px;margin-bottom:8px">🏰 나의 영지 — ${esc2(d.name)}</div>
      <!-- 수치 요약 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:8px">
        <div style="padding:5px 7px;background:#050300;border:1px solid #2a1a00;border-radius:2px">
          <div style="font-size:7px;color:var(--dim)">도시 단계</div>
          <div style="font-family:'Cinzel',serif;font-size:10px;color:${stage.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(stage,{size:10}):(stage.icon)} ${stage.name}</div>
          <div style="font-size:8px;color:${stage.color}">${popStr}명</div>
        </div>
        <div style="padding:5px 7px;background:#050300;border:1px solid #2a1a00;border-radius:2px">
          <div style="font-size:7px;color:var(--dim)">영지 상태</div>
          <div style="font-family:'Cinzel',serif;font-size:10px;color:${status.color}">${status.label}</div>
          <div style="font-size:8px;color:var(--dim)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(tier,{size:8}):(tier.icon)} ${tier.name}</div>
        </div>
        ${[
          {label:'세수',icon:'💰',color:'#e0c040',val:res.tax},
          {label:'번영',icon:'🌟',color:'#60c060',val:res.prosperity},
          {label:'방어',icon:'🛡️',color:'#4080e0',val:res.defense},
          {label:'충성',icon:'❤️',color:'#e05060',val:res.loyalty},
        ].map(r=>`
          <div style="padding:4px 7px;background:#050300;border:1px solid #2a1a00;border-radius:2px">
            <div style="display:flex;justify-content:space-between;font-size:7px;margin-bottom:2px">
              <span style="color:${r.color}">${typeof getEntityIconHTML==='function'?getEntityIconHTML(r,{size:16}):(r.icon)} ${r.label}</span>
              <span style="color:${r.color}">${r.val}</span>
            </div>
            <div style="height:3px;background:#0a0600;border-radius:2px;overflow:hidden">
              <div style="width:${r.val}%;height:100%;background:${r.color};border-radius:2px"></div>
            </div>
          </div>`).join('')}
      </div>
      <!-- 이벤트 경고 -->
      ${activeEvents.length>0?`
      <div style="padding:6px 8px;background:#1a0500;border:1px solid #e03030;border-radius:2px;margin-bottom:8px;font-size:9px;color:#e06060">
        ⚠️ 처리 대기 중인 이벤트 ${activeEvents.length}건!
        <button onclick="openP('demesne');renderDemesnePanel()" style="float:right;padding:2px 7px;background:#2a0500;border:1px solid #e03030;color:#e06060;font-size:8px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">처리하기</button>
      </div>`:''}
      <!-- 봉신 목록 -->
      ${(d.vassals||[]).length>0?`
      <div style="margin-bottom:8px">
        <div style="font-size:8px;color:var(--dim);margin-bottom:4px">⚜️ 재임 중인 봉신</div>
        <div style="display:flex;flex-wrap:wrap;gap:3px">
          ${(d.vassals||[]).map(v=>{
            // [B39 FIX] VASSAL_ROLES도 window. 없이 직접 참조해야 정상 노출됨.
            const rd = (typeof VASSAL_ROLES!=='undefined'?VASSAL_ROLES:{})[v.role]||{icon:'⚜️'};
            const bc = v.bond>=70?'#60d060':v.bond>=40?'#c8a040':'#d06030';
            return `<div style="padding:3px 6px;background:#0a0800;border:1px solid #2a2010;border-radius:2px;font-size:8px;color:var(--gold)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(rd,{size:8}):(rd.icon)} ${esc2(v.name)} <span style="color:${bc}">유대${v.bond}</span></div>`;
          }).join('')}
        </div>
      </div>`:''}
      <!-- 빠른 행동 -->
      <div style="font-size:8px;color:var(--dim);margin-bottom:4px">📌 빠른 행동</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${quickActions.map(a=>`
          <button onclick="${a.onclick}"
            style="padding:7px 4px;background:#0a0800;border:1px solid ${a.color}55;color:${a.color};font-size:9px;cursor:pointer;font-family:'Cinzel',serif;border-radius:2px">
            ${a.label}
          </button>`).join('')}
      </div>
      <!-- 메모 -->
      ${d.note?`<div style="margin-top:8px;padding:5px 7px;background:#050300;border:1px dashed #3a2a0a;font-size:9px;color:var(--dim);line-height:1.5">📝 ${esc2(d.note)}</div>`:''}
    </div>`;
  }catch(e){ return ''; }
}
window._renderDemesneLocationBlock = _renderDemesneLocationBlock;

(function patchRenderWorldMap(){
  const tryPatch = () => {
    if(window._demesneWorldMapPatched) return;
    if(typeof window.renderWorldMap !== 'function'){ setTimeout(tryPatch, 1500); return; }
    window._demesneWorldMapPatched = true;
    const _orig = window.renderWorldMap;
    window.renderWorldMap = function(...args){
      let html = _orig.apply(this, args);
      // 영지 장소 카드에 특별 스타일 추가 (loc_demesne id 기반)
      try{
        const d = loadDemesne?.();
        if(d && d.established){
          const name = d.name || '나의 영지';
          // 영지 이름 버튼에 골드 테두리 추가
          html = html.replace(
            new RegExp(`(${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[^<]*?)(이동</button>)`,'g'),
            `$1<span style="font-size:8px;color:var(--gold);margin-left:3px">★ 내 영지</span> 이동</button>`
          );
        }
      }catch(e){}
      return html;
    };
  };
  setTimeout(tryPatch, 2000);
})();

(function patchOpenTransportPanel(){
  const tryPatch = () => {
    if(window._demesneTransportPatched) return;
    if(typeof window.openTransportPanel !== 'function'){ setTimeout(tryPatch, 1500); return; }
    window._demesneTransportPatched = true;
    const _orig = window.openTransportPanel;
    window.openTransportPanel = function(transportType, ...rest){
      _orig.apply(this, [transportType, ...rest]);
      // 이동수단 목록 렌더 후 영지 구역 강조
      try{
        const d = loadDemesne?.();
        if(!d || !d.established) return;
        const body = document.getElementById('pb-location');
        if(!body) return;
        const demesneName = d.name||'나의 영지';
        // 영지 항목 버튼에 ★ 마킹 추가 (DOM 조작)
        setTimeout(()=>{
          const allDivs = body.querySelectorAll('div[onclick]');
          allDivs.forEach(el=>{
            if(el.textContent.includes(demesneName) || (el.getAttribute('onclick')||'').includes(demesneName)){
              el.style.border = '1px solid var(--gold)';
              el.style.background = '#1a1200';
            }
          });
        }, 100);
      }catch(e){}
    };
  };
  setTimeout(tryPatch, 2000);
})();

export function isAtDemesne(){
  try{
    const loc = loadCurrentLocation?.();
    return !!(loc && loc.isDemesne);
  }catch(e){ return false; }
}
window.isAtDemesne = isAtDemesne;

// [버그 수정] 여기 있던 patchCheckDemesneEventsForLocation(영지에 있을 때
// 이벤트 확률 1.5배)은 checkDemesneEvents가 정의된 race/260의 실제
// 호출부가 bare 식별자라 한 번도 적용되지 못했다. 같은 로직을 실제
// 정의부(checkDemesneEvents 본문 맨 앞)에 네이티브로 옮겼다.

export const JOB_MASTERY_KEY = 'tf-job-mastery';

export function loadJobMastery(){ try{ return JSON.parse(lsGet(JOB_MASTERY_KEY)||'{}'); }catch(e){ return {}; } }
window.loadJobMastery = loadJobMastery;

export function saveJobMastery(d){ try{ lsSet(JOB_MASTERY_KEY, JSON.stringify(d)); }catch(e){} }
window.saveJobMastery = saveJobMastery;

export function checkJobMasterySkillUnlock(){
  try{
    // [B47 FIX] 한글 role로 저장하면 applyMasteryBonus()는 영문 jobId로
    // 조회해 숙련도 보너스가 항상 무효화되던 버그. 다른 시스템과 동일하게
    // 영문 id 체계로 통일.
    const jobId = S?.character?.jobId || getJobIdFromName(S?.character?.role);
    if(!jobId) return;
    const jm = loadJobMastery();
    const prev = jm[jobId] || 0;
    jm[jobId] = Math.min(100, prev + 0.5);
    saveJobMastery(jm);
    // 20점 단위로 숙련 단계 상승 알림
    if(Math.floor(jm[jobId]/20) > Math.floor(prev/20)){
      const lvl = MASTERY_LEVELS[Math.min(MASTERY_LEVELS.length-1, Math.floor(jm[jobId]/20))];
      toast(`직업 숙련도 상승: ${lvl.name}`, 2500, lvl);
    }
  }catch(e){ console.warn('[checkJobMasterySkillUnlock]', e); }
}
window.checkJobMasterySkillUnlock = checkJobMasterySkillUnlock;

window.checkJobMasterySkillUnlock = checkJobMasterySkillUnlock;

export function getJobMastery(jobId){
  const turns = loadJobTurns();
  const jobTurns = turns[jobId] || 0;
  const mem = loadJobMemory();
  const prevExp = mem[jobId]?.count || 0;
  // 환생 기억으로 경험치 보정 (이전 경험 30% 반영)
  const effectiveTurns = jobTurns + Math.floor(prevExp * 15);
  
  let level = 1;
  for(const ml of MASTERY_LEVELS){
    if(effectiveTurns >= ml.minTurns) level = ml.level;
    else break;
  }
  return { level, turns:jobTurns, effectiveTurns, levelData: MASTERY_LEVELS[level-1] };
}
window.getJobMastery = getJobMastery;

export function applyMasteryBonus(){
  const jobId = S.character?.jobId || getJobIdFromName(S.character?.role);
  if(!jobId) return;
  const mastery = getJobMastery(jobId);
  const bonuses = JOB_MASTERY_BONUS[jobId] || [];
  const bonus = bonuses[mastery.level - 1] || {};
  
  Object.entries(bonus).forEach(([k,v])=>{
    if(k==='desc') return;
    if(S.stats[k] !== undefined){
      S.stats[k] = Math.min(999, S.stats[k] + v);
    }
  });
}
window.applyMasteryBonus = applyMasteryBonus;

export function checkMasteryLevelUp(jobId){
  const mastery = getJobMastery(jobId);
  const mastery_key = 'mastery_last_' + jobId;
  const lastLevel = parseInt(lsGet(mastery_key)||'1');
  
  if(mastery.level > lastLevel){
    lsSet(mastery_key, mastery.level);
    const levelData = MASTERY_LEVELS[mastery.level-1];
    const bonuses = JOB_MASTERY_BONUS[jobId]||[];
    const bonus = bonuses[mastery.level-1]||{};
    const bonusText = Object.entries(bonus)
      .filter(([k])=>k!=='desc')
      .map(([k,v])=>{ const i=getStatInfo(k); return (i?.name||k)+' +'+v; })
      .join(' · ');

    toast(`직업 숙련도 ${levelData.name} 달성! ${bonus.desc?'['+bonus.desc+']':''}`, 4000, levelData);
    if(bonusText) setTimeout(()=>toast('✨ 보너스: '+bonusText, 3000), 1500);

    // [20차 감사 FIX] 여기서 bonuses[mastery.level-1]를 직접 S.stats에 더한
    // 뒤 곧바로 applyMasteryBonus()를 호출하고 있었는데, applyMasteryBonus()도
    // 내부에서 동일한 jobId·동일한 mastery.level(이 함수 안에서 아직 턴/기억이
    // 바뀌지 않았으므로 재계산해도 같은 값)로 같은 bonuses[mastery.level-1]를
    // 다시 조회해 S.stats에 또 더했다 — 되돌리는 로직 없이 두 번 누적되어,
    // 숙련도가 오를 때마다(총 7단계 중 최대 6번) 보너스 스탯이 항상 실제
    // 의도의 2배로 지급되던 문제. 직접 적용 블록을 제거하고
    // applyMasteryBonus() 단일 호출로 정리한다.
    applyMasteryBonus();
    window.updateHeader();
  }
}
window.checkMasteryLevelUp = checkMasteryLevelUp;

export function renderMasteryInfo(jobId){
  if(!jobId) return '<div style="color:var(--dim);font-size:11px">직업 없음</div>';
  const mastery = getJobMastery(jobId);
  const levelData = mastery.levelData;
  const nextLevel = MASTERY_LEVELS[mastery.level] || null;
  const bonuses = JOB_MASTERY_BONUS[jobId] || [];
  const currentBonus = bonuses[mastery.level-1] || {};
  const nextBonus = nextLevel ? (bonuses[mastery.level] || {}) : null;
  const progress = nextLevel 
    ? Math.min(100, ((mastery.effectiveTurns - levelData.minTurns) / (nextLevel.minTurns - levelData.minTurns)) * 100)
    : 100;

  return `
    <div style="padding:10px 12px;background:#0d0800;border:1px solid var(--border);margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="color:var(--gold);display:inline-flex;flex-shrink:0">${typeof getEntityIconHTML==='function'?getEntityIconHTML(levelData,{size:16}):(levelData.svgIcon||levelData.icon)}</span>
        <div style="flex:1">
          <div style="font-family:Cinzel,serif;font-size:11px;color:var(--gold)">숙련도 ${levelData.name} (${mastery.level}/7)</div>
          <div style="font-size:9px;color:var(--dim)">플레이 ${mastery.turns}턴 · 유효 ${mastery.effectiveTurns}턴</div>
        </div>
      </div>
      <!-- 진행 바 -->
      <div style="height:5px;background:#1a1005;border-radius:3px;overflow:hidden;margin-bottom:5px">
        <div style="width:${progress}%;height:100%;background:linear-gradient(90deg,#c8a96e,#e8c97e);border-radius:3px;transition:width .4s"></div>
      </div>
      <div style="font-size:9px;color:var(--dim);margin-bottom:8px">
        ${nextLevel ? nextLevel.minTurns+'턴까지 '+(nextLevel.minTurns-mastery.effectiveTurns)+'턴 남음 → '+nextLevel.name : '최고 숙련도 달성!'}
      </div>
      <!-- 현재 보너스 -->
      ${Object.keys(currentBonus).filter(k=>k!=='desc').length > 0 ? `
        <div style="font-size:9px;color:var(--gold);font-family:Cinzel,serif;margin-bottom:4px">현재 보너스</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
          ${Object.entries(currentBonus).filter(([k])=>k!=='desc').map(([k,v])=>{
            const i=getStatInfo(k); return `<span style="padding:2px 7px;background:#0a2a0a;border:1px solid #2a5a2a;border-radius:2px;font-size:9px;color:#60d060">${i?.name||k} +${v}</span>`;
          }).join('')}
        </div>
        ${currentBonus.desc?`<div style="font-size:10px;color:#a080e0;font-style:italic">"${esc(currentBonus.desc)}"</div>`:''}
      ` : ''}
      <!-- 다음 단계 미리보기 -->
      ${nextBonus && Object.keys(nextBonus).filter(k=>k!=='desc').length > 0 ? `
        <div style="font-size:9px;color:var(--dim);font-family:Cinzel,serif;margin-top:6px;margin-bottom:3px">다음 단계 (${nextLevel.name})</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${Object.entries(nextBonus).filter(([k])=>k!=='desc').map(([k,v])=>{
            const i=getStatInfo(k); return `<span style="padding:2px 7px;background:#0d0800;border:1px solid #3a2a0a;border-radius:2px;font-size:9px;color:#6a5a3a">${i?.name||k} +${v}</span>`;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
}
window.renderMasteryInfo = renderMasteryInfo;

export const JOB_TURN_KEY = 'tf-job-turns';

export function loadJobTurns(){ try{ return JSON.parse(lsGet(JOB_TURN_KEY)||'{}'); }catch(e){ return {}; } }
window.loadJobTurns = loadJobTurns;

export function saveJobTurns(d){ try{ lsSet(JOB_TURN_KEY, JSON.stringify(d)); }catch(e){} }
window.saveJobTurns = saveJobTurns;

export async function updateJobTurns(){
  const jobId = S.character?.jobId || getJobIdFromName(S.character?.role);
  if(!jobId) return;

  const turns = loadJobTurns();
  turns[jobId] = (turns[jobId]||0) + 1;
  saveJobTurns(turns);
  const currentTurns = turns[jobId];

  // 숙련도 레벨업 체크
  checkMasteryLevelUp(jobId);

  // 최소 10턴 미만이면 전직 제안 스킵 (게임 시작 직후 오발화 방지)
  if((S.msgCount||0) < 10) return;

  // 이미 제안 중이면 스킵
  if(S.jobSuggesting) return;

  // 상황 기반 트리거 체크
  const trigger = checkJobEvolutionTrigger(jobId, currentTurns);
  if(trigger){
    S.jobSuggesting = true;
    toast('💼 ' + trigger.reason, 2500);
    await autoSuggestNextJob(jobId, currentTurns, trigger);
    S.jobSuggesting = false;
  }
}
window.updateJobTurns = updateJobTurns;

export function checkJobEvolutionTrigger(jobId, currentTurns){
  // ── 최소 턴 수 가드: 절대 메시지 카운트 기준 ──
  // _memStore 기반이라 bp 키가 매 세션 초기화되므로
  // 스탯 돌파 등 조건이 첫 턴에 즉시 발화하는 버그 방지
  const absoluteTurns = S.msgCount || 0;
  const minAbsolute = 10; // 최소 10턴은 해야 전직 제안 가능
  if(absoluteTurns < minAbsolute) return null;

  const actions = loadJobActions();
  const st = loadStats();
  const mem = loadJobMemory();
  const stats = S.stats;
  const titles = loadTitles()||[];
  const inventory = S.inventory||[];
  const prevCount = mem[jobId]?.count || 0;

  // 마지막 제안 이후 재시도 간격 — 1차 직업(방랑자 등)은 5턴, 2차+는 15턴
  const _jobTierForCooldown = (typeof findJob==='function' ? findJob(jobId)?.tier : null) || 1;
  const retryCooldown = _jobTierForCooldown <= 1 ? 5 : 15;
  const lastSuggestKey = 'job_last_suggest_' + jobId;
  const lastSuggest = parseInt(lsGet(lastSuggestKey)||'0');
  if(currentTurns - lastSuggest < retryCooldown) return null;

  const triggers = [];

  // 행동 패턴 기반 (15회 이상)
  const topAction = Object.entries(actions).sort((a,b)=>b[1]-a[1])[0];
  if(topAction && topAction[1] >= 15)
    triggers.push({ weight:60, reason:'행동 패턴 변화 감지', context:`${topAction[0]} 행동 ${topAction[1]}회` });

  // 스탯 돌파 기반 (70/80/90) — 최소 15턴 이후에만 체크
  const statBreakpoints = [70, 80, 90];
  const statKeys = Object.entries(stats).filter(([k])=>!['hp','mp','food','ftg'].includes(k));
  for(const [k,v] of statKeys){
    for(const bp of statBreakpoints){
      const bpKey = `stat_bp_${k}_${bp}`;
      if(v >= bp && !lsGet(bpKey)){
        lsSet(bpKey, '1');
        const info = getStatInfo(k);
        triggers.push({ weight:80, reason:`${info?.name||k} ${bp} 돌파!`, context:`${info?.name||k} ${Math.round(v)} 달성` });
      }
    }
  }

  // 대성공 누적 기반
  const critCount = st.critSuccessCount||0;
  for(const bp of [5,15,30,50,100]){
    const bpKey = `crit_bp_${bp}`;
    if(critCount >= bp && !lsGet(bpKey)){
      lsSet(bpKey, '1');
      triggers.push({ weight:75, reason:`대성공 ${bp}회 달성!`, context:'전투 감각이 극에 달했다' });
    }
  }

  // 희귀 아이템 보유
  const rareItems = inventory.filter(i=>i.rarity==='primal'||i.rarity==='legendary'||i.rarity==='rare');
  if(rareItems.length > 0 && Math.random() < 0.3)
    triggers.push({ weight:70, reason:`${rareItems[0].icon} ${rareItems[0].name}의 힘이 각성을 촉구한다`, context:`희귀 아이템 보유` });

  // 칭호 달성 기반
  for(const bp of [3,7,12,20]){
    const bpKey = `title_bp_${bp}`;
    if(titles.length >= bp && !lsGet(bpKey)){
      lsSet(bpKey, '1');
      triggers.push({ weight:65, reason:`칭호 ${bp}개 달성!`, context:`${bp}개의 칭호가 새로운 길을 열었다` });
    }
  }

  // 전생 기억 있으면 10턴에 빠른 제안
  if(prevCount > 0 && currentTurns === 10)
    triggers.push({ weight:90, reason:'전생의 기억이 되살아난다', context:`${prevCount}회차 경험으로 빠른 각성` });

  // 최소 안전망 (처음:10턴, 경험:25턴) — 너무 늦지 않게, 그러나 3~5턴처럼 너무 즉흥적이지 않게
  const minTurns = prevCount > 0 ? 25 : 10;
  if(currentTurns > 0 && currentTurns % minTurns === 0)
    triggers.push({ weight:30, reason:'충분한 경험이 쌓였다', context:`${currentTurns}턴 플레이` });

  if(!triggers.length) return null;

  triggers.sort((a,b)=>b.weight-a.weight);
  const chosen = triggers[0];
  lsSet(lastSuggestKey, currentTurns);
  return chosen;
}
window.checkJobEvolutionTrigger = checkJobEvolutionTrigger;

export function autoSuggestNextJob(currentJobId, currentTurns, trigger=null){
  // [정리] job/042의 수동 "✨ AI 직업 탐색" 버튼(generateNextJob)은 이미
  // AI_JOB_POOL(getAIJobsByParent/addAIJob)로 "이 부모 직업에서 한번
  // 파생시킨 적 있으면 영구 재사용, API 재호출 없음"을 구현해뒀는데, 이
  // 자동 트리거 경로는 그 풀을 전혀 조회·기록하지 않아 같은 부모 직업도
  // 매번 새로 API를 부르고, 그 결과도 풀에 안 남아 두 경로의 직업 계보가
  // 서로 다르게 갈라지는 불일치가 있었다. 같은 풀을 공유하도록 정리.
  const existingDerived = getAIJobsByParent(currentJobId);
  if(existingDerived.length){
    showJobSuggestionPopup(existingDerived, currentJobId, currentTurns, trigger);
    return;
  }

  // 트리거 강도에 따라 직업 수 결정
  const jobCount = trigger?.weight >= 80 ? 3 : trigger?.weight >= 60 ? 2 : 1;

  // [변경] job/042의 로컬(AI 미사용) 전직 트리 생성 엔진을 그대로
  // 재사용한다 — 수동 탐색(generateNextJob)과 자동 제안(여기)이 이제
  // 완전히 같은 로직으로 계보를 만들어 AI_JOB_POOL을 자연스럽게 공유한다.
  try{
    const jobs = composeLocalNextJobs(currentJobId, jobCount);
    if(!jobs.length) return;
    const codex = loadJobCodex();
    jobs.forEach(j=>{
      if(!codex[j.id]){
        codex[j.id] = { parentId: currentJobId, tier: j.tier||2, aiGenerated: true, lore: j.lore||'', howDiscovered: null, discoveredAt: null };
      }
      addAIJob(j, currentJobId);
    });
    saveJobCodex(codex);
    showJobSuggestionPopup(jobs, currentJobId, currentTurns, trigger);
  }catch(e){
    console.warn('직업 자동 제안 실패:', e.message);
  }
}
window.autoSuggestNextJob = autoSuggestNextJob;

export function showJobSuggestionPopup(jobs, parentJobId, currentTurns, trigger=null){
  // [버그 수정] 다른 전체화면 팝업(퀘스트 수락·돌발 이벤트 등)이 이미
  // 열려 있으면 겹쳐 뜨지 않도록 잠시 후 재시도한다.
  if(isBlockingPopupOpen('job-suggest-popup')){
    setTimeout(()=>showJobSuggestionPopup(jobs, parentJobId, currentTurns, trigger), 1200);
    return;
  }
  // 기존 팝업 제거
  document.getElementById('job-suggest-popup')?.remove();

  const popup = document.createElement('div');
  popup.id = 'job-suggest-popup';
  popup.style.cssText = 'position:fixed;inset:0;z-index:150;background:rgba(0,0,0,.9);display:flex;align-items:flex-end';

  const box = document.createElement('div');
  box.style.cssText = 'width:100%;max-height:80vh;background:#050200;border-top:2px solid #c8a96e;overflow-y:auto;animation:slideUp .25s ease';
  box.innerHTML = `
    <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold);letter-spacing:2px">💼 직업 전직 제안</div>
        <div style="font-size:10px;color:var(--dim);margin-top:2px">${trigger?.reason||currentTurns+'턴 달성'} — 새로운 경지가 열렸습니다</div>
      </div>
      <button onclick="document.getElementById('job-suggest-popup')?.remove();S.loading=false;S.jobSuggesting=false;if(!S.choices||S.choices.length===0){S.choices=['주변을 살피며 상황을 파악한다.','가까운 NPC에게 말을 건다.','조용히 다음 행동을 생각한다.'];}if(typeof renderThinking==='function')renderThinking();if(typeof updateSendBtn==='function')updateSendBtn();if(typeof renderChoices==='function')renderChoices();if(typeof renderMsgs==='function')renderMsgs();" style="background:none;border:none;color:var(--dim);font-size:20px;cursor:pointer">✕</button>
    </div>
    <div style="padding:12px">
      <div style="font-size:11px;color:var(--dim);margin-bottom:12px;line-height:1.6">아래 직업 중 하나로 전직하거나, 현재 직업을 계속할 수 있습니다.<br>거절해도 도감에 기록되며 나중에 직업 패널에서 전직 가능합니다.</div>
      ${jobs.map((job,i)=>`
        <div style="padding:12px;background:#0d0800;border:1px solid var(--border);margin-bottom:8px;border-radius:2px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span style="color:var(--gold);display:inline-flex;flex-shrink:0;transform:scale(1.09)">${typeof getEntityIconHTML==='function'?getEntityIconHTML(job,{size:16}):(job.svgIcon||job.icon)}</span>
            <div style="flex:1">
              <div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold)">${esc(job.name)}</div>
              <div style="font-size:10px;color:var(--dim);margin-top:2px">${esc(job.desc)}</div>
            </div>
            <div style="font-size:9px;color:#4a3a2a;font-family:Cinzel,serif">T${job.tier||'?'}</div>
          </div>
          ${job.lore?`<div style="font-size:9px;color:#7a6a4a;line-height:1.5;margin-bottom:6px;font-style:italic;border-left:2px solid #3a2a0a;padding-left:6px">${esc(job.lore)}</div>`:''}
          <div style="font-size:10px;color:#4a6fa5;margin-bottom:4px">조건: ${esc(job.howToGet||job.unlockCondition?.desc||'')}</div>
          ${job.conditionHint?`<div style="font-size:9px;color:#6a9a6a;margin-bottom:6px;padding:4px 7px;background:#0a150a;border-left:2px solid #3a5a1a">💡 ${esc(job.conditionHint)}</div>`:''}
          ${(()=>{ try{ const c=window.checkJobCondition(job); return c.met?'<div style="font-size:9px;color:#60a060;margin-bottom:6px">✔ 조건 충족 — 즉시 전직 가능</div>' : c.bypass?'<div style="font-size:9px;color:#a060d0;margin-bottom:6px">⚡ 아티팩트/칭호로 우회 가능</div>' : `<div style="font-size:9px;color:#c05040;margin-bottom:6px">🔒 미달: ${c.failed.join(' · ')}</div>`; }catch(e){return '';} })()} 
          ${(job.skills||[]).slice(0,2).map(s=>`
            <div style="font-size:10px;background:#150d03;padding:3px 8px;margin-bottom:2px;border-left:2px solid #c8a96e33">
              ${s.icon} ${esc(s.name)} — ${esc(s.desc)}
            </div>`).join('')}
          <button class="btn btn-gold" style="width:100%;padding:9px;font-size:10px;letter-spacing:1px;margin-top:8px"
            onclick="acceptJobSuggestion(${JSON.stringify(job).replace(/"/g,'&quot;')})">
            ⚡ 이 직업으로 전직
          </button>
        </div>
      `).join('')}
      <button class="btn btn-dark" style="width:100%;padding:10px;font-size:10px;margin-top:4px"
        onclick="document.getElementById('job-suggest-popup')?.remove();S.loading=false;S.jobSuggesting=false;if(!S.choices||S.choices.length===0){S.choices=['주변을 살피며 상황을 파악한다.','가까운 NPC에게 말을 건다.','조용히 다음 행동을 생각한다.'];}if(typeof renderThinking==='function')renderThinking();if(typeof updateSendBtn==='function')updateSendBtn();if(typeof renderChoices==='function')renderChoices();if(typeof renderMsgs==='function')renderMsgs();">
        현재 직업 계속 유지
      </button>
    </div>
  `;

  popup.appendChild(box);
  document.body.appendChild(popup);
}
window.showJobSuggestionPopup = showJobSuggestionPopup;

export function acceptJobSuggestion(job){
  // 전직 조건 체크 — try-catch로 감싸서 에러 시 로딩 안 막힘
  let condResult;
  try{ condResult = window.checkJobCondition(job); }
  catch(e){ condResult = { met:true, bypass:false, failed:[] }; }

  if(!condResult.met && !condResult.bypass){
    toast('⚠ 전직 조건 미달: '+condResult.failed.join(', '), 3500);
    // alert/confirm 제거 — 로딩 중 모달 블로킹 방지
    return;
  }
  // bypass confirm 제거 — 팝업 내 버튼 클릭 자체가 의사 확인
  document.getElementById('job-suggest-popup')?.remove();
  S.loading=false;
  S.jobSuggesting=false;
  if(typeof window.renderThinking==='function') window.renderThinking();
  if(typeof updateSendBtn==='function') updateSendBtn();
  // 전직
  offerJobChange(job.id);
  // 새 직업 턴 카운터 초기화
  try{ const turns = loadJobTurns(); turns[job.id] = 0; saveJobTurns(turns); }catch(e){}
  // 선택지 복원
  if(!S.choices || S.choices.length === 0){
    S.choices = ['주변을 살피며 상황을 파악한다.', '가까운 NPC에게 말을 건다.', '조용히 다음 행동을 생각한다.'];
  }
  if(typeof window.renderChoices==='function') window.renderChoices();
  if(typeof renderMsgs==='function') renderMsgs();
}
window.acceptJobSuggestion = acceptJobSuggestion;

// [deferred] statements below read window.* values that another module
// may only finish assigning after this whole file evaluates (an ESM
// dependency-order back-edge) — main.js calls this once every module has
// fully loaded, in original file order (see generate.js).
export function __tfDeferred_51(){
window.wmSwitchTab = function(dim){
  ['mortal','celestial','infernal'].forEach(function(d){
    var pane = document.getElementById('wm-pane-'+d);
    var tab  = document.getElementById('wm-tab-'+d);
    if(!pane) return;
    var active = d===dim;
    pane.style.display = active ? 'block' : 'none';
    if(tab){
      tab.style.fontWeight   = active ? 'bold' : 'normal';
      tab.style.borderBottom = active ? '2px solid '+(d==='celestial'?'#f0d860':d==='infernal'?'#e03020':'var(--gold)') : '2px solid transparent';
      tab.style.background   = active ? (d==='celestial'?'rgba(240,216,96,.08)':d==='infernal'?'rgba(200,40,20,.08)':'rgba(200,160,48,.05)') : '';
    }
  });
  sessionStorage.setItem('wm-last-tab', dim);
};
}

