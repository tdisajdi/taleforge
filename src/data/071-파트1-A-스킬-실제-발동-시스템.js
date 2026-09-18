// 파트1-A: 스킬 실제 발동 시스템 — data
// Pure data split out of job/071-파트1-A-스킬-실제-발동-시스템.js (see generate.js).
import { loadVampireChronicle } from '../progression/020-101130번-환생-누적-시스템.js';
import { S } from './084-TaleForge-순수-JS-엔진.js';

export const RACE_SKILL_CHOICES = {

  // ── 🩸 뱀파이어 ──────────────────────────────────────────
  // race_vamp_bite(흡혈)는 더 이상 여기 없다 — 예전엔 이 선택지 UI가
  // "회복만" 처리하고, 표준 스키마(RACE_DEFS.vampire.skills)의 damage
  // 버전은 AI 자동발동 때만 실행되는 이원화된 상태였다. 지금은 damage+
  // lifesteal(가한 피해의 40% 회복)+권속화 시도(무력화할수록 확률 상승)
  // 를 표준 스키마 하나로 완전히 통합했으므로, 퀵슬롯에서 눌러도 이제
  // 그 통합된 효과가 그대로 나간다. 별도 선택지 UI로 분기할 이유가
  // 없어져 제거함.

  race_vamp_charm: {
    name: '매혹', icon: '👁️',
    desc: 'CHA 판정. 신관·고신앙 대상은 저항 가능. 5턴 쿨다운.',
    choices: [
      { label: '👁️ 단일 대상을 매혹한다 (MP 20)',
        msg: '눈을 붉게 빛내며 상대의 눈을 똑바로 바라본다. CHA 판정으로 의지를 흔들어 복종하게 만든다. 신관이나 신앙이 높은 자는 저항할 수 있다.',
        condition: () => (S.stats?.cha || 0) >= 20,
        conditionFail: 'CHA 20 이상 필요합니다' },
      { label: '💬 매혹으로 정보를 캐낸다 (MP 20)',
        msg: '매혹 상태로 만든 뒤 알고 싶은 정보를 털어놓도록 유도한다. 판정 성공 여부에 따라 얻는 정보가 다르다.',
        condition: () => (S.stats?.cha || 0) >= 20,
        conditionFail: 'CHA 20 이상 필요합니다' },
      { label: '⚔️ 전투 전 매혹으로 전의를 꺾는다 (MP 20)',
        msg: '전투 직전 눈을 마주치며 매혹을 건다. 성공 시 상대의 첫 공격력이 크게 감소한다.',
        condition: () => (S.stats?.cha || 0) >= 20,
        conditionFail: 'CHA 20 이상 필요합니다' },
      { label: '🎭 광역 매혹 — 여러 명을 동시에 (MP 55, CHA 75+, 연대기 3단계+)',
        msg: '붉은 눈빛을 넓게 발산해 여러 명을 동시에 매혹하려 한다. 고대의 혈통 역사 없이는 감당하기 힘든 힘이다. 실패 시 정신적 반동으로 MP가 추가 소모된다.',
        condition: () => {
          const vc = (typeof loadVampireChronicle==='function') ? loadVampireChronicle() : {stage:0};
          return (S.stats?.cha||0) >= 75 && (S.stats?.mp||0) >= 55 && (vc.stage||0) >= 3;
        },
        conditionFail: 'CHA 75+, MP 55+, 피의 연대기 3단계(혈통의 역사) 이상 필요',
        extraMpCost: 35 },
    ],
    mpCost: 20,
    reqRace: ['뱀파이어','혈종','혈군','혈통 왕','고대 뱀파이어','밤의 지배자','원초의 혈군'],
  },

  // ── 세레스티얼 ─────────────────────────────────────────
  cc_s1_holy_mark: {
    name: '신성 각인', icon: '✨',
    choices: [
      { label: '✨ 적에게 신성 각인을 새긴다', msg: '손을 들어 적에게 빛의 각인을 새긴다. 신성 에너지가 상처처럼 타오른다.', condition: () => true },
      { label: '🛡️ 아군에게 보호 각인을 새긴다', msg: '동료에게 신성 각인을 새겨 보호한다. 다음 공격을 흡수하는 빛의 방패가 생긴다.', condition: () => true },
    ],
    mpCost: 10,
    reqRace: ['세레스티얼','빛의 수호자','천사','대천사','신의 화신'],
  },

  cc_s2_purify_touch: {
    name: '성광 정화', icon: '🌟',
    choices: [
      { label: '🌟 자신의 상태이상을 정화한다', msg: '손을 가슴에 얹고 빛을 내뿜는다. 몸에 깃든 저주와 독이 타들어가며 사라진다.', condition: () => true },
      { label: '💫 동료의 상태이상을 정화한다', msg: '동료에게 손을 뻗어 빛을 흘려보낸다. 그들을 옥죄던 저주와 독이 소멸한다.', condition: () => true },
      { label: '🔥 어둠의 존재에게 정화를 강제한다', msg: '언데드나 악마 계열 적에게 정화의 빛을 강제로 주입한다. 극심한 피해를 입힌다.', condition: () => true },
    ],
    mpCost: 15,
    reqRace: ['세레스티얼','빛의 수호자','천사','대천사','신의 화신'],
  },

  // ── 다크링 ────────────────────────────────────────────
  dv_s1_void_step: {
    name: '공허 걸음', icon: '🌑',
    choices: [
      { label: '🌑 어둠 속으로 사라진다', msg: '주변의 어둠을 끌어모아 몸을 감싼다. 시야에서 완전히 사라진 채 이동한다.', condition: () => true },
      { label: '🌑 적의 등 뒤로 순간이동한다', msg: '공허를 밟고 순식간에 적의 사각지대로 이동한다. 상대는 눈치채지 못한다.', condition: () => true },
    ],
    mpCost: 12,
    reqRace: ['다크링','심연의 존재','공허의 군주'],
  },

  // ── 오크 ─────────────────────────────────────────────
  orc_berserker_rage: {
    name: '광전사 분노', icon: '💢',
    choices: [
      { label: '💢 전투 중 분노를 폭발시킨다', msg: '이성의 끈을 놓고 순수한 분노로 몸을 채운다. 고통도 두려움도 사라지고 오직 파괴만 남는다.', condition: () => true },
      { label: '👊 위협으로 적의 사기를 꺾는다', msg: '포효하며 적들을 위협한다. 오크의 분노 앞에 약한 적들의 전의가 무너진다.', condition: () => true },
    ],
    mpCost: 0,
    reqRace: ['오크','오크 족장','전쟁군주'],
  },

  // ── 수인 ─────────────────────────────────────────────
  beast_wild_surge: {
    name: '야수 폭발', icon: '🐾',
    choices: [
      { label: '🐾 야성을 해방해 전투력을 폭발시킨다', msg: '내면의 야수를 해방한다. 몸이 변형되고 감각이 극도로 예민해지며 전투 본능이 극대화된다.', condition: () => true },
      { label: '🌕 무리 본능을 깨워 동료를 각성시킨다', msg: '무리를 이끄는 본능적 울부짖음을 발한다. 함께 있는 동료들의 전투 감각이 깨어난다.', condition: () => true },
    ],
    mpCost: 0,
    reqRace: ['수인','야수군주','원시의 화신'],
  },
};
