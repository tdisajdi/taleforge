// 7. 성직자 비밀 퀘스트 라인 — data
// Pure data split out of quest/107-7-성직자-비밀-퀘스트-라인.js (see generate.js).

export const RELIGION_SECRET_QUESTS = {
  temple: [
    { id:'rq_temple_1', title:'📜 지하 문서고의 열쇠',    req:{fath:70, jobMatch:['cleric','paladin','archbishop']},
      desc:'고위 성직자가 비밀리에 접근해왔다. 세계수 지하에 루프에 관한 금서가 있다고 한다.',
      reward:{luk:10, per:8, secret:'루프 자각 단서 획득'}, aiHint:'순환의 사원 고위 성직자가 조심스럽게 접근해 지하 문서고에 관한 이야기를 꺼낸다. 루프를 암시하는 단서가 담겨있다.' },
    { id:'rq_temple_2', title:'🌳 세계수의 마지막 가지',  req:{fath:85, evangelCount:10},
      desc:'세계수가 시들고 있다. 선택받은 신자만이 가지를 회복할 수 있다.',
      reward:{wil:15, mgc:10, title:'세계수의 선택받은 자'}, aiHint:'세계수의 시듦을 막을 수 있는 의식에 대한 단서가 등장한다. 극적이고 신비로운 장면으로 묘사하라.' },
  ],
  solar: [
    { id:'rq_solar_1', title:'☀️ 이단 심문관의 진실',     req:{fath:65, jobMatch:['cleric','crusader','inquisitor']},
      desc:'이단 심문소가 무고한 자를 처형하고 있다. 내부를 파헤쳐야 한다.',
      reward:{rep:15, int:8, secret:'태양 성전 내부 비리 폭로'}, aiHint:'이단 심문소의 부패를 암시하는 단서가 등장한다. 의로운 성직자가 고뇌하며 내부 고발을 고려한다.' },
    { id:'rq_solar_2', title:'⚡ 태양신의 직접 강림',     req:{fath:90, evangelCount:15},
      desc:'태양신이 직접 메시지를 보내왔다. 세계의 어둠을 정화하라.',
      reward:{str:20, fath:20, title:'태양신의 대리인'}, aiHint:'태양신의 신탁이 내려진다. 극도로 신성하고 압도적인 장면으로 묘사하라.' },
  ],
  roots: [
    { id:'rq_roots_1', title:'🌿 잊혀진 조상신의 이름',   req:{fath:60, jobMatch:['shaman','grand_shaman','tribal_mage']},
      desc:'오래전 잊혀진 조상신 중 하나가 이름을 되찾길 원한다.',
      reward:{per:12, mgc:8, secret:'고대 신화 지식'}, aiHint:'꿈속에서 잊혀진 조상신이 나타나 이름을 되찾아달라고 부탁한다. 고대적이고 신비로운 분위기로 묘사하라.' },
    { id:'rq_roots_2', title:'🌳 세계수 원류의 수호자',   req:{fath:85, evangelCount:8},
      desc:'뿌리 신앙의 최고 신관만이 아는 진실 — 순환의 사원보다 더 근원에 가까운 진리가 있다.',
      reward:{per:18, int:12, title:'원류의 수호자'}, aiHint:'세계수의 진정한 근원에 대한 비밀이 밝혀진다. 순환의 사원 교리보다 더 오래된 진실을 암시하라.' },
  ],
  abyss: [
    { id:'rq_abyss_1', title:'😈 계약의 진실',            req:{fath:40, jobMatch:['dark_priest','abyss_evangelist']},
      desc:'심연의 계시 최고위층만이 아는 사실 — 신자들은 마계의 하수인이 되어간다.',
      reward:{neg:15, str:10, secret:'심연의 진실 인지'}, aiHint:'심연의 계시 내부에서 신자들이 알지 못하는 끔찍한 진실을 암시하는 단서가 등장한다. 주인공은 이 진실에 어떻게 반응할 것인가.' },
    { id:'rq_abyss_2', title:'🌑 마계 문의 열쇠',         req:{fath:70, evangelCount:12},
      desc:'심연의 신이 마계로 통하는 문의 열쇠를 줄 수 있다고 한다. 대가는 영혼.',
      reward:{str:25, mgc:20, title:'마계의 문지기', cost:{fath:-50}}, aiHint:'심연의 신이 직접 나타나 마계 문의 열쇠를 제안한다. 극적인 유혹의 장면. 영혼을 담보로 한 계약이다.' },
  ],
};
