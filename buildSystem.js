// buildSystem.js - AI 프롬프트 빌더
export const buildSystem = (char, currentTitles, memory, npcs, currentSummons, currentMonsters) => {
    // ════════════════════════════════════════════════════
    // 필터링 컨텍스트 — 종족·직업·시나리오·회차 기반
    // ════════════════════════════════════════════════════
    const _cycle   = loadCycleCount();
    const _race    = (char?.race  || "").toLowerCase();
    const _role    = (char?.role  || "");
    const _era     = (char?.scenario || "");

    // 시나리오 그룹 판별
    const isMedieval     = _era.includes("중세") || _era.includes("판타지") || _era.includes("medieval");
    const isWuxia        = _era.includes("무협") || _era.includes("강호")   || _era.includes("wuxia");
    const isCyberpunk    = _era.includes("사이버") || _era.includes("cyber");
    const isApocalypse   = _era.includes("아포칼") || _era.includes("apocalypse") || _era.includes("황무지") || _era.includes("붕괴");
    const isMythology    = _era.includes("신화") || _era.includes("mythology") || _era.includes("올림포스");
    const isSteampunk    = _era.includes("스팀") || _era.includes("steampunk") || _era.includes("증기");
    const isCustom       = _era.includes("나만의") || _era.includes("custom");
    const isAnyEra       = true; // 모든 세계관 공통

    // 종족 그룹 판별
    const isElf        = _race.includes("엘프") || _race.includes("elf");
    const isDwarf      = _race.includes("드워프") || _race.includes("dwarf");
    const isOrc        = _race.includes("오크") || _race.includes("orc");
    const isDarkling   = _race.includes("다크") || _race.includes("dark");
    const isCelestial  = _race.includes("천족") || _race.includes("celestial") || _race.includes("세레스티얼");
    const isDragon     = _race.includes("드래곤") || _race.includes("dragon") || _race.includes("용혈");
    const isDemon      = _race.includes("악마") || _race.includes("demon");
    const isUndead     = _race.includes("언데드") || _race.includes("undead");
    const isBeastman   = _race.includes("수인") || _race.includes("beast");
    const isElemental  = _race.includes("원소") || _race.includes("elemental");
    const isHuman      = _race.includes("인간") || _race.includes("human") || (!isElf && !isDwarf && !isOrc && !isDarkling && !isCelestial && !isDragon && !isDemon && !isUndead && !isBeastman && !isElemental && _race !== "");
    const isFantasyRace= isElf || isDwarf || isOrc || isDarkling || isCelestial || isDragon || isDemon || isUndead || isBeastman || isElemental;
    const hasMagicRace = isElf || isCelestial || isDragon || isDemon || isElemental;

    // 직업 그룹 판별
    const isMagicRole  = /마법|마녀|마법사|소서|주술|마도/.test(_role);
    const isWarriorRole= /전사|기사|검사|무사|파이터/.test(_role);
    const isRogueRole  = /도적|암살|자객|도둑|레인저/.test(_role);
    const isLeaderRole = /왕|군주|장군|영주|리더|지도자/.test(_role);
    const isHealerRole = /성직|치료|사제|수도|힐러|신관/.test(_role);
    const isBardRole   = /음유|시인|바드|광대/.test(_role);
    const isSupportRole= isHealerRole || isBardRole;

    // 회차 단계 판별
    const isEarlyCycle  = _cycle >= 1  && _cycle <= 3;   // 초반
    const isMidCycle    = _cycle >= 4  && _cycle <= 9;   // 중반
    const isLateCycle   = _cycle >= 10 && _cycle <= 19;  // 후반
    const isHighCycle   = _cycle >= 20 && _cycle <= 49;  // 고회차
    const isVeryHigh    = _cycle >= 50;                   // 초고회차
    const isCenturyCycle= _cycle >= 100;                  // 100회차+

    // 섹션 포함 여부 결정 헬퍼 (조건 미충족 시 빈 문자열 반환)
    const when = (condition, sectionFn) => condition ? sectionFn() : "";

    const memSection = (memory?.core ? `\n[🔴 핵심 기억]\n${memory.core}` : "") + (memory?.mid ? `\n[🟡 최근 흐름]\n${memory.mid}` : "") + (memory?.pastLifeSummary ? `\n[✨ 전생의 흔적]\n${memory.pastLifeSummary}` : "");
    const majorList = (npcs || []).filter(n => n.type === "major").map(n => `  • ${n.name}(${n.role}) - ${n.personality}`).join("\n");
    const minorList = (npcs || []).filter(n => n.type === "minor" && n.active).map(n => `  · ${n.name}(${n.role})`).join("\n");
    const npcSection = (majorList || minorList) ? `\n[👥 등장 인물]\n${majorList}${minorList ? `\n${minorList}` : ""}` : "";
    // ── 11번 수정: 날씨/시간대 실제 반영 ──
    const atm = loadAtmosphere();
    const weatherLabels = { none:"설정 없음", clear:"맑음", cloudy:"흐림", rain:"비", storm:"폭풍", snow:"눈", fog:"안개", sandstorm:"모래폭풍", thunder:"천둥번개" };
    const timeLabels   = { none:"설정 없음", dawn:"새벽", morning:"아침", noon:"한낮", afternoon:"오후", evening:"저녁", night:"밤", midnight:"한밤중" };
    const weatherEffects = { rain:"시야가 제한되고 이동이 느려진다. 기민성 판정에 -10 페널티.", storm:"극도로 위험한 날씨. 모든 야외 행동에 -15 페널티. 이동 불가 수준.", snow:"지면이 미끄럽고 시야가 좁다. 체력 소모가 빠르다.", fog:"시야가 극도로 제한된다. 은신·잠입 판정에 +15 보너스.", sandstorm:"호흡 곤란, 시야 차단. 야외에서 모든 판정 -10.", thunder:"번개가 내리치는 위험. 금속 장비 착용자에게 추가 위험." };
    const timeEffects  = { dawn:"여명의 시간. NPC 대부분이 아직 잠들어 있다. 은신에 유리.", night:"어둠이 깔렸다. 은신·위장 판정 +10 보너스. 일부 NPC는 경계가 강화된다.", midnight:"한밤중. 대부분의 상점과 거점이 닫혀 있다. 야간 몬스터 출몰 확률 증가." };
    let atmosphereSection = "";
    if (atm.weather !== "none" || atm.timeOfDay !== "none") {
      const wLabel = weatherLabels[atm.weather] || atm.weather;
      const tLabel = timeLabels[atm.timeOfDay] || atm.timeOfDay;
      const wEffect = weatherEffects[atm.weather] || "";
      const tEffect = timeEffects[atm.timeOfDay] || "";
      atmosphereSection = `\n[🌤️ 현재 환경]\n날씨: ${wLabel}${wEffect ? ` — ${wEffect}` : ""}\n시간대: ${tLabel}${tEffect ? ` — ${tEffect}` : ""}\n서사에서 이 환경을 자연스럽게 묘사하고 판정에 반영하십시오.`;
    }
    const notesSection = loadWorldNotes().length ? `\n[🌍 세계관 설정]\n${loadWorldNotes().map(n=>`[${n.category}] ${n.title}: ${n.content}`).join("\n")}` : "";
    const summonSection = (currentSummons||[]).filter(s=>s.status==="active").length
      ? `\n[🔮 현재 소환수]\n${(currentSummons||[]).filter(s=>s.status==="active").map(s=>`  • ${s.name} (HP:${s.hp}/${s.maxHp})`).join("\n")}`
      : "";
    const monsterSection = (currentMonsters||[]).filter(m=>m.status==="alive").length
      ? `\n[👹 현재 전투 중인 적]\n${(currentMonsters||[]).filter(m=>m.status==="alive").map(m=>`  • ${m.icon}${m.name} (HP:${m.hp}/${m.maxHp} / ATK:${m.atk} / DEF:${m.def} / 등급:${m.tier})`).join("\n")}\n적이 살아있는 동안 전투 상황을 반드시 묘사하십시오.`
      : "";
    
    const karmaScore = char?.pastLifeKarmaScore || 0;
    let karmaSection = "";
    if (karmaScore >= 95) karmaSection = `\n[🔥 업보의 심판] 전생의 죄업으로 인해 현상수배, 저주 등이 발생하며 주변의 혐오를 받습니다.`;
    else if (karmaScore >= 85) karmaSection = `\n[💀 저주받은 영혼] 불운이 따르며 선의도 오해받기 쉽습니다.`;
    else if (karmaScore >= 70) karmaSection = `\n[🌑 어둠의 기억] 타인이 알 수 없는 경계심을 느낍니다.`;

    const ruleSection = `\n[시스템 규칙]\n1. 플레이어 행동 뒤에 전달되는 [주사위 굴림] 수치와 캐릭터의 관련 스탯을 고려하여 성공/실패를 결정하고 서사에 반영하십시오.\n2. 전투 피격, 마법 사용, 위험한 행동 시 반드시 서사적으로 HP나 MP가 소모됨을 묘사하십시오.\n3. 적이 살아있는 전투 중이라면 반드시 적의 반격/행동도 묘사하십시오.`;

    // ── 새 종족 전용 묘사 힌트 ──
    const newRaceHint = isDragon ? `\n[🐉 드래곤혈 특성] 이 캐릭터는 용의 피가 흐릅니다. 분노하거나 강한 감정을 느낄 때 눈동자가 세로 동공으로 변하거나 피부에서 비늘 무늬가 드러나는 묘사를 자연스럽게 포함하십시오. 화염이나 냉기를 본능적으로 다루며, 용족 NPC는 본능적으로 이 자를 같은 혈통으로 인식합니다.`
      : isDemon ? `\n[😈 악마족 특성] 이 캐릭터는 악마의 피가 흐릅니다. 대화에서 은근히 상대의 욕망을 꿰뚫어보고 거기에 어필하는 묘사를 포함하십시오. 강한 힘을 쓸 때 뒤에서 날개나 뿔이 잠깐 드러납니다. 인간·신성 NPC는 본능적으로 불편함을 느끼지만 동시에 이끌리기도 합니다.`
      : isUndead ? `\n[💀 언데드 특성] 이 캐릭터는 죽음과 삶의 경계에 있습니다. 체온이 없고 피가 흐르지 않으며 고통을 느끼지 못하는 묘사를 포함하십시오. 살아있는 NPC들은 이 자를 보면 본능적으로 소름이 돋거나 불쾌감을 느낍니다. 강한 공격을 받아도 쉽게 쓰러지지 않는 섬뜩한 생존력을 표현하십시오.`
      : isBeastman ? `\n[🐺 수인 특성] 이 캐릭터는 짐승의 본능을 지니고 있습니다. 감각이 예민하여 인간이 눈치채지 못하는 것을 미리 감지하는 묘사를 포함하십시오. 흥분하면 동물적 특징(귀·꼬리·눈동자 변화 등)이 드러납니다. 야생 동물들이 본능적으로 이 자를 두려워하거나 복종합니다.`
      : isElemental ? `\n[🌀 원소인 특성] 이 캐릭터는 원소 에너지와 융합되어 있습니다. 감정이 격해지면 주변 원소(불꽃·물·바람·대지)가 반응하는 묘사를 포함하십시오. 강한 마법 사용 시 몸의 일부가 원소 형태로 변합니다. 자신의 원소와 반대되는 환경에서는 미묘한 불편함을 느낍니다.`
      : "";

    // ── 새 시나리오 전용 배경 힌트 ──
    const newScenarioHint = isApocalypse ? `\n[☢️ 아포칼립스 세계관] 문명이 붕괴된 뒤의 세상입니다. 폐허가 된 도시, 방사능 오염 지역, 물자 부족, 변이 생물이 기본 배경입니다. 생존이 최우선이며 인간성의 경계가 흐릿합니다. 전쟁 이전 문명의 유물이 가장 귀중한 자산입니다. 묘사 시 황폐함·절망·하지만 그 속의 인간적 연대를 함께 표현하십시오.`
      : isMythology ? `\n[⚡ 신화 세계관] 신들이 실재하고 영웅들이 신의 의지를 수행하는 세계입니다. 운명의 실이 존재하며 예언이 현실에 영향을 미칩니다. 신들이 인간사에 직접 개입하며 시련과 보상을 내립니다. 묘사 시 웅장하고 서사적인 신화적 스케일을 유지하십시오.`
      : isSteampunk ? `\n[⚙️ 스팀펑크 세계관] 증기 기관이 마법과 결합된 세계입니다. 비행선, 증기 기계, 태엽 인형, 에테르 에너지가 일상화되어 있습니다. 묘사 시 황동과 증기, 가스등과 톱니바퀴, 우아함과 기계 소음의 대비를 잘 살려주십시오.`
      : "";

    // ── 숨겨진 직업 시스템 힌트 ──
    const hiddenJobDef = HIDDEN_JOBS.find(j => j.name === char.role);
    const hiddenJobSection = hiddenJobDef ? `\n[🔓 숨겨진 직업 — ${hiddenJobDef.icon}${hiddenJobDef.name}] ${hiddenJobDef.systemHint}${newRaceHint}${newScenarioHint}` : (newRaceHint || newScenarioHint ? `${newRaceHint}${newScenarioHint}` : "");

    // ── 이번 회차 클리어 목표 ──
    const _goal = loadCycleGoal();
    const goalSection = _goal ? `\n[🎯 이번 회차 목표 — ${_goal.icon}${_goal.name}] ${_goal.aiHint} 진행도: ${_goal.progress||0}%. ${_goal.completed ? "✅ 달성 완료!" : ""}` : "";

    // ── 성장형 악당 ──
    const _villain = getVillainStatus();
    const villainSysSection = _villain && _villain.threat !== "low" && _villain.name ? `\n[${_villain.threatDef?.icon||"⚠️"} 악당 위협 — ${_villain.threatDef?.label}] ${_villain.name}의 세력이 세계를 잠식 중입니다(${_villain.power}%). ${_villain.threatDef?.desc} 서사에서 악당의 영향력이 주변 세계에 반영되게 하십시오.` : "";

    // ── 날씨 판정 연동 ──
    const _weather = getWeatherStatMods();
    const weatherSysSection = (_weather.weather.label && _weather.weather.label !== "맑음") ? `\n[${_weather.weather.icon} 날씨 효과 — ${_weather.weather.label}] ${_weather.weather.aiHint}` : "";

    // ── 동료 시너지 버프 ──
    const companionBuffs = getCompanionBuffs();
    const companionSysSection = companionBuffs.length > 0 ? `\n[👥 동료 시너지] 성장한 동료들의 지원: ${companionBuffs.map(s=>`${s.icon}${s.name}(${s.desc})`).join(", ")}` : "";

    // ── 직업 조합 시너지 ──
    const prevJobs = char.pastLifeRole ? [char.pastLifeRole] : [];
    const synergies = checkJobSynergy(char.role, prevJobs, char.race||"");
    const synergySysSection = synergies.length > 0 ? `\n[⚡ 직업 조합 시너지 — ${synergies.map(s=>`${s.icon}${s.name}`).join("/")}] ${synergies.map(s=>s.aiHint).join(" / ")}` : "";

    // ── 종족 전용 콘텐츠 ──
    const raceContent = getRaceContent(char.race);
    const raceContentSection = raceContent ? `\n[🏛️ 종족 전용 콘텐츠] ${raceContent.event} ${raceContent.npcReact}` : "";

    // ── 히든 퀘스트 ──
    const _atm2 = loadAtmosphere();
    const hiddenQuestData = { karmaScore: char.karmaScore||50, timeOfDay: _atm2.timeOfDay, cycle: loadCycleCount(), race: char.race||"", scenario: char.scenario||"", madness: char.stats?.mad||0 };
    const availableHiddenQuests = getAvailableHiddenQuests(hiddenQuestData);
    const hiddenQuestSection = availableHiddenQuests.length > 0 ? `\n[🔍 히든 퀘스트 가능] 현재 조건에서 숨겨진 의뢰가 활성화됩니다: ${availableHiddenQuests.map(q=>`${q.icon}${q.name}(${q.conditionDesc})`).join(", ")} — 서사 중 자연스럽게 해당 퀘스트로 연결되는 복선을 심어두십시오.` : "";

    // 1번: 전생 기억 파편 섹션
    const frags = loadMemoryFragments();
    const fragSection = frags.length > 0 ? `\n[💭 전생 기억 파편]\n${frags.slice(-3).map(f=>f.text).join("\n")}` : "";
    // 2번: 전생 인연 (pastLife intimateNpcs)
    const intimateNpcs = (char.pastLifeIntimateNpcs || []);
    const intiSection = intimateNpcs.length > 0 ? `\n[💞 전생 인연] 다음 NPC들은 이전 생에 깊은 인연이 있었습니다. 첫 만남이지만 왠지 모를 친근함을 느낍니다: ${intimateNpcs.join(", ")}` : "";
    // 8번: 명성 이월
    const fameLeg = loadFameLegacy();
    const fameSection = fameLeg && fameLeg.type !== "neutral" ? `\n[${fameLeg.type==="hero"?"🌟":"💀"} 전생의 소문] 전생에서 ${fameLeg.characterName||"이 영혼"}의 소문이 퍼져있습니다. NPC들은 처음 만나도 ${fameLeg.type==="hero"?"호감":"두려움"}을 갖고 대합니다. (${fameLeg.label})` : "";
    // 6번: 영혼 각인 무기
    const soulWpn = loadSoulWeapon();
    const soulWpnSection = soulWpn ? `\n[⚔️ 영혼 각인] 전생에서 가장 많이 쓰던 ${soulWpn.name}. ${soulWpn.desc}` : "";

    // 11번: 금지 스킬 해금 알림
    const forbiddenSkills11 = getUnlockedForbiddenSkills();
    const forbiddenSection = forbiddenSkills11.length > 0 ? `\n[🔓 금지 스킬 해금] 특수 조건으로 해금된 금지 스킬이 있습니다: ${forbiddenSkills11.map(s=>`${s.icon}${s.name}(${s.desc})`).join(", ")}. 사용 시 강렬하게 묘사하십시오.` : "";

    // 12번: 나비효과
    const butterflies = loadButterfly();
    const butterflySection = butterflies.length > 0 ? `\n[🦋 나비효과] 전생의 선택이 세계에 흔적을 남겼습니다:\n${butterflies.map(b => BUTTERFLY_EFFECTS[b.type]?.aiHint?.(b.data) || "").filter(Boolean).join("\n")}` : "";

    // 13번: 히든 엔딩 조각
    const hiddenPieces13 = loadHiddenEndingPieces();
    const hiddenEndingSection = isHiddenEndingUnlocked() ? `\n[🔮 진엔딩 해금] 모든 운명의 파편을 모았습니다. 이번 회차에서 특별한 진실이 드러날 수 있습니다. 적절한 순간에 세계의 비밀을 암시하십시오.` : hiddenPieces13.length > 0 ? `\n[🔮 히든 엔딩 파편 ${hiddenPieces13.length}/${HIDDEN_ENDING_TOTAL}] 운명의 조각이 쌓이고 있습니다.` : "";

    // 14번: 죽는 방식 보상
    const deathBonuses14 = getActiveDeathBonuses();
    const deathBonusSection = deathBonuses14.length > 0 ? `\n[💀 전생 사망 유산] ${deathBonuses14.map(d=>`${d.name}: ${d.desc}`).join(" / ")}. 이 경험이 캐릭터의 신체와 감각에 자연스럽게 반영됩니다.` : "";

    // 15번: 트라우마 면역
    const traumaImmune15 = getTraumaImmunities();
    const traumaSection = traumaImmune15.length > 0 ? `\n[🛡️ 트라우마 면역] 반복된 경험으로 면역 획득: ${traumaImmune15.map(t=>`${t.icon}${t.label}(${t.immunity})`).join(", ")}. 해당 상황에서 두려움 없이 행동합니다.` : "";

    // 16번: 라스트 워드 오프닝
    const lastWord16 = loadLastWord();
    const lastWordSection = lastWord16 ? `\n[💬 전생의 마지막 말] "${lastWord16.text}" — ${LAST_WORD_OPENINGS[lastWord16.tone] || ""}` : "";

    // 17번: 메타 지식
    const metaKnowledge17 = getMetaKnowledgeHints();
    const metaSection = metaKnowledge17.length > 0 ? `\n[💡 전생의 메타 지식] 이전 생에서 얻은 정보들이 있습니다. 관련 상황 발생 시 "어디선가 본 듯한 느낌이 든다" 같은 선택지를 추가하십시오: ${metaKnowledge17.slice(-5).map(m=>`[${m.type}]${m.keyword}(${m.hint})`).join(", ")}` : "";

    // 18번: 혈통 진화
    const evolvedRace18 = char.race ? getEvolvedRace(char.race) : null;
    const bloodlineSection = evolvedRace18?.isEvolved ? `\n[🧬 혈통 진화] ${char.race}에서 ${evolvedRace18.name}으로 진화. 종족 특성이 강화되어 있으며 종족 관련 묘사를 더욱 강렬하게 표현하십시오.` : "";

    // 19번: 운명의 변수
    const fateRes19 = getFateResistance();
    const fateSection = fateRes19 ? `\n[⚡ 운명의 저항 Lv.${fateRes19.level}] ${fateRes19.desc} 예상치 못한 방해와 변수를 적절히 삽입하여 도전적인 서사를 만드십시오.` : "";

    // 20번: 전생 지도
    const exploredMaps20 = getExploredLocations(char.scenario);
    const exploredSection = exploredMaps20.length > 0 ? `\n[🗺️ 전생 탐험 기록] 이전 생에서 방문한 장소들: ${exploredMaps20.map(m=>m.name).join(", ")}. 이 장소들에서 "낯익다"는 느낌이나 보너스 정보를 제공하십시오.` : "";

    // 21번: 관계 유산
    const relLegacies21 = getRelationshipLegacies();
    const relLegacySection = relLegacies21.length > 0 ? `\n[💞 관계 유산] 전생의 인연이 영혼에 새겨져 있습니다. 해당 이름의 NPC 등장 시 즉시 반영하십시오:\n${relLegacies21.map(r => REL_LEGACY_HINTS[r.bond]?.(r.npcName, r.depth) || "").filter(Boolean).join("\n")}` : "";

    // 22번: 세계관 기억
    const worldSecrets22 = getWorldSecrets(char.scenario);
    const worldSecretSection = worldSecrets22.length > 0 ? `\n[🔍 세계관 기억] 전생에서 발견한 세계의 비밀들:\n${worldSecrets22.map(s => `• ${s.title}: ${s.hint}`).join("\n")}\n이 비밀들을 암시하는 장면이나 대사를 자연스럽게 삽입하십시오.` : "";

    // 23번: 능력 각인
    const imprintedAbs23 = getImprintedAbilities();
    const abilityImprintSection = imprintedAbs23.length > 0 ? `\n[⚡ 능력 각인] 전생에서 극한까지 단련한 능력이 이번 생에 타고난 재능으로 발현:\n${imprintedAbs23.map(a => { const def = ABILITY_IMPRINT_LABELS[a.statId]; return def ? `${def.name} (Tier ${a.tier}): ${def.desc}` : ""; }).filter(Boolean).join("\n")}` : "";

    // 24번: 원한의 추적자
    const grudges24 = getActiveGrudges();
    const grudgeSection = grudges24.length > 0 ? `\n[💀 원한의 추적자] 전생에서 쓰러뜨린 강적들의 원한이 남아있습니다. 적절한 시점에 복수자로 등장시키십시오:\n${grudges24.map(g => `• ${g.name} (위협도 ${g.power}성) — 전생 시나리오: ${g.scenario||"불명"}`).join("\n")}` : "";

    // 25번: 시간의 메아리
    const timeEchoes25 = getTimeEchoes();
    const timeEchoSection = timeEchoes25.length > 0 ? `\n[🔔 시간의 메아리] 과거 회차의 중요한 말들이 메아리처럼 울립니다. 감정적으로 유사한 장면에서 이 대사들을 환청처럼 묘사하십시오:\n${timeEchoes25.slice(-3).map(e => `• "${e.text}" — ${e.speaker} (${e.emotion||"무감정"})`).join("\n")}` : "";

    // 26번: 운명의 선택 기록
    const fateChoices26 = getFateChoices(char.scenario);
    const fateChoiceSection = fateChoices26.length > 0 ? `\n[🔀 운명의 선택 기록] 전생에서 했던 선택들입니다. 동일하거나 유사한 분기점 등장 시 "전에 이 길을 선택한 적이 있다"는 선택지를 추가하십시오:\n${fateChoices26.filter(c=>c.outcome!=="neutral").slice(-5).map(c => `• ${c.description} → 결과: ${c.outcome==="good"?"긍정적":"부정적"}`).join("\n")}` : "";

    // 27번: 신의 시선
    const divineGaze27 = getDivineGazeStatus();
    const divineGazeSection = divineGaze27 ? `\n[${divineGaze27.icon} ${divineGaze27.label}] ${divineGaze27.desc} 이번 회차에서 신적 존재의 암시나 기적적 개입을 서사에 자연스럽게 삽입하십시오.` : "";

    // 28번: 저주 계보
    const curseMasteries28 = getCurseMasteries();
    const curseMasterySection = curseMasteries28.length > 0 ? `\n[🌑 저주 숙달] 반복된 저주를 통해 습득한 능력:\n${curseMasteries28.map(c => { const def = CURSE_TYPE_DEFS[c.type]; return def ? `• ${def.name} 숙달 (${c.count}회): ${def.mastery}` : ""; }).filter(Boolean).join("\n")}` : "";

    // 29번: 전생의 기도
    const prayerStatus29 = getPastPrayerStatus();
    const prayerSection = prayerStatus29 && prayerStatus29.available ? `\n[🙏 전생의 기도] 회차당 1회, 극한 위기에서 전생의 기억에 기도할 수 있습니다. 플레이어가 "기도한다" 또는 "전생에 빌다" 등의 행동을 하면 ${prayerStatus29.power} 수준의 전생 기억 계시로 위기를 극복할 힌트를 제공하십시오. 발동 시 반드시 극적이고 감동적으로 묘사하십시오.` : (prayerStatus29 && !prayerStatus29.available ? `\n[🙏 전생의 기도 — 소진] 이번 회차에 이미 전생에 기도했습니다.` : "");

    // 30번: 운명의 수레바퀴
    const greatCycle30 = getGreatCycleStatus();
    const greatCycleSection = greatCycle30 ? `\n[⚙️ 운명의 수레바퀴 — ${greatCycle30.greatCycles}대순환] 위대한 순환이 ${greatCycle30.greatCycles}번 완성되었습니다.\n해금 보상: ${greatCycle30.unlockedRewards.join(" / ")}\n이 영웅은 수많은 삶을 거쳐온 운명의 중심입니다. 서사의 규모와 감동을 평소보다 훨씬 크게 묘사하십시오.` : "";

    // 31번: 평행세계 조우
    const parallelSelf31 = getParallelSelfEncounter();
    const parallelSelfSection = parallelSelf31 ? `\n[🌀 평행세계 조우] 전생 중 다른 회차의 자신(${parallelSelf31.name} · ${parallelSelf31.role})의 환영과 접촉한 기억이 있습니다. 그 자신은 「${parallelSelf31.keySkill || "알 수 없는 기술"}」을 사용했습니다. 깊은 명상이나 꿈, 또는 강렬한 위기 상황에서 이 평행 자아의 환영이 나타나 조언하거나 대결을 신청할 수 있습니다.` : "";

    // 32번: 저주의 고리
    const curseRings32 = getActiveCurseRings();
    const curseRingSection = curseRings32.length > 0 ? `\n[🔗 저주의 고리] 반복된 행동 패턴이 저주로 굳어졌습니다:\n${curseRings32.map(r => `• ${r.icon}${r.label} (${r.count}회 반복, Lv.${r.penaltyLevel}): ${r.penalty}`).join("\n")}\n이 행동 패턴을 반복하면 AI가 자연스럽게 불리한 상황을 연출하십시오.` : "";

    // 33번: 회차 통계
    const stats33 = getCycleStatsSummary();
    const statsSection = stats33.totalCycles >= 2 ? `\n[📊 회차 통계] 총 ${stats33.totalCycles}회차, 누적 사망 ${stats33.totalDeaths}회, 총 대화 ${stats33.totalTurns}턴${stats33.topEnemy ? `, 최다 처치: ${stats33.topEnemy.name}(${stats33.topEnemy.count}회)` : ""}${stats33.topScenario ? `, 선호 세계관: ${stats33.topScenario.name}` : ""}. 이 데이터를 바탕으로 캐릭터의 전투 본능과 습관을 서사에 자연스럽게 반영하십시오.` : "";

    // 34번: 부상 흔적
    const injuryEffects34 = getInjuryEffects();
    const injurySection = injuryEffects34.length > 0 ? `\n[🩹 부상 흔적] 전생의 부상이 이번 생에 흔적을 남겼습니다:\n${injuryEffects34.map(i => `• ${i.icon}${i.label}: ${i.desc}`).join("\n")}\n해당 신체 부위가 사용되는 장면에서 자연스럽게 이 효과를 반영하십시오.` : "";

    // 35번: 전생 테마
    const pastTheme35 = getPastTheme();
    const pastThemeSection = pastTheme35 ? `\n[🎭 전생 테마 — ${pastTheme35.label}] ${pastTheme35.openingLine} 전반적인 서사 톤을 「${pastTheme35.openingMood}」 분위기로 유지하십시오.` : "";

    // 36번: 기억 왜곡
    const memDistort36 = getMemoryDistortStatus();
    const memDistortSection = memDistort36 && memDistort36.falseMemories.length > 0 ? `\n[🌫️ 기억 왜곡] 전생 기억의 정확도가 「${memDistort36.accuracy}」 상태입니다. 다음 잠재적 오기억을 가끔 암시하십시오:\n${memDistort36.falseMemories.map(m => `• ${m}`).join("\n")}\n플레이어가 전생 기억에 의존해 행동할 때 미묘하게 틀릴 수 있다는 가능성을 서술에 반영하십시오.` : "";

    // 37번: 전생 나이의 역설
    const ageParadox37 = getAgeParadoxBonus();
    const ageParadoxSection = ageParadox37 ? `\n[⌛ 나이의 역설 — ${ageParadox37.label}] ${ageParadox37.desc} ${ageParadox37.bonusDesc}. 이 캐릭터는 나이에 걸맞지 않는 성숙함이나 직감을 보여주십시오.` : "";

    // 38번: 소환수 계승
    const summonLegacies38 = getSummonLegacies();
    const summonLegacySection = summonLegacies38.length > 0 ? `\n[🐾 소환수의 기억] 전생에서 함께했던 소환수들이 이번 생의 세계 어딘가에 살고 있습니다:\n${summonLegacies38.map(s => `• ${s.name}(${s.type}) — 유대 ${s.bond}/10, ${s.appearances}회 동행`).join("\n")}\n이 소환수들은 야생에서 캐릭터를 알아보거나 특별한 반응을 보일 수 있습니다. 유대가 높을수록 재계약 가능성이 높습니다.` : "";

    // 39번: 원한 무기
    const grudgeWeapons39 = getGrudgeWeapons();
    const grudgeWeaponSection = grudgeWeapons39.length > 0 ? `\n[⚔️ 원한 무기] 전생에서 나를 죽인 무기·기술들이 이번 생에 사용 가능한 형태로 어딘가에 존재합니다:\n${grudgeWeapons39.map(w => `• 「${w.weaponName}」(${w.killerName}에게 당함, ${w.times}회, 위력 Lv.${w.power})`).join("\n")}\n이 무기·기술을 입수할 기회를 자연스럽게 서사에 배치하십시오. 사용 시 특별히 강렬하게 묘사하십시오.` : "";

    // 40번: 세계수 성장
    const worldTree40 = getWorldTreeStatus();
    const worldTreeSection = worldTree40.level > 0 ? `\n[🌳 세계수 성장 — ${worldTree40.stage.icon}${worldTree40.stage.label}] ${worldTree40.stage.desc}${worldTree40.stage.bonus ? `\n보너스: ${worldTree40.stage.bonus}` : ""}\n세계가 회차를 거듭하며 복원되고 있습니다. 이를 배경 서술에 자연스럽게 녹여 세계의 희망이 커지고 있음을 표현하십시오.` : "";

    // 41번: 꿈의 예언
    const dreamProphecies41 = getDreamProphecies();
    const dreamSection = dreamProphecies41.length > 0 ? `\n[🌙 꿈의 예언] 전생의 꿈이 예언으로 남아있습니다:\n${dreamProphecies41.map(d => `• ${d.icon}${d.keyword}의 꿈 (${d.count}회): ${d.prophecy}`).join("\n")}\n플레이어가 잠들거나 명상하는 장면에서 이 예언 이미지를 자연스럽게 삽입하고, 해당 예언 상황이 실제로 전개될 때 특별히 극적으로 묘사하십시오.` : "";

    // 42번: 유산 건축
    const legacyBuildings42 = getLegacyBuildings();
    const legacyBuildingSection = legacyBuildings42.length > 0 ? `\n[🏛️ 유산 건축] 전생에 세운 건물·거점의 흔적이 세계에 남아있습니다:\n${legacyBuildings42.map(b => `• ${b.icon}${b.name}(${b.label}, ${b.count}회): ${b.ruinDesc} → ${b.bonus}`).join("\n")}\n이 장소들을 서사 속 폐허·전설·지역명으로 자연스럽게 등장시키십시오.` : "";

    // 43번: 감시자의 눈
    const watchers43 = getWatchers();
    const watcherSection = watchers43.length > 0 ? `\n[👁️ 감시자의 눈] 전생에서 싸웠던 강적들이 플레이어의 혼을 기억하고 강화되어 재등장할 수 있습니다:\n${watchers43.map(w => `• ${w.name} (조우 ${w.encounters}회, 위력 Lv.${w.power}${w.evolved ? " ★진화형" : ""})`).join("\n")}\n이 적들이 재등장 시 반드시 이전보다 강해졌음을 명시하고, 플레이어를 알아보는 장면을 극적으로 연출하십시오.` : "";

    // 44번: 영혼의 가면
    const soulMasks44 = getSoulMasks();
    const soulMaskSection = soulMasks44.length > 0 ? `\n[🎭 영혼의 가면] 전생에서 익힌 역할이 변장 능력으로 이월되었습니다:\n${soulMasks44.map(m => `• ${m.icon}${m.masquerade} (숙련도 ${m.mastery}/5): ${m.bonus}`).join("\n")}\n플레이어가 이 역할로 변장하거나 행동할 때 자연스럽게 성공하도록 서술하십시오.` : "";

    // 45번: 감정의 파문
    const emotionRipples45 = getEmotionRipples();
    const emotionRippleSection = emotionRipples45.length > 0 ? `\n[🌊 감정의 파문] 전생의 극단적 감정이 세계에 파문을 남겼습니다:\n${emotionRipples45.map(r => `• ${r.icon}${r.label} (강도 ${r.intensity}/5): ${r.worldEffect} → ${r.bonus}`).join("\n")}\n세계 분위기 묘사 시 이 파문의 영향을 자연스럽게 반영하십시오.` : "";

    // 46번: 유언장
    const testaments46 = getTestaments();
    const testamentSection = testaments46.length > 0 ? `\n[📜 유언장] 전생에 남긴 유언이 세계 어딘가에 존재합니다:\n${testaments46.slice(-2).map(t => `• ${t.icon}${t.label}(${t.characterName}): ${t.hint}`).join("\n")}\n폐허, 도서관, NPC 대화 등을 통해 이 유언이 발견되는 이벤트를 자연스럽게 배치하십시오.` : "";

    // 47번: 숙명의 별자리
    const constellation47 = getConstellation();
    const constellationSection = constellation47 ? `\n[${constellation47.icon} 숙명의 별자리 — ${constellation47.name}(${constellation47.trait})] ${constellation47.bonus}\n⚠️ 경고: ${constellation47.challenge}\n이번 회차 내내 이 별자리의 특성이 운명처럼 작용합니다. 서사 전반에 자연스럽게 반영하십시오.` : "";

    // 48번: 탐험가의 유산
    const explorerMap48 = getExplorerMap();
    const explorerMapSection = explorerMap48.length > 0 ? `\n[🗺️ 탐험가의 유산] 전생에 발견한 장소의 기억이 남아있습니다:\n${explorerMap48.map(l => `• ${l.icon}${l.label}: ${l.desc} → ${l.bonus}`).join("\n")}\n해당 장소 유형이 등장하는 장면에서 캐릭터가 본능적으로 길을 알거나 유리한 위치를 선점할 수 있도록 하십시오.` : "";

    // 49번: 번개 각인
    const lightningImprints49 = getLightningImprints();
    const lightningImprintSection = lightningImprints49.length > 0 ? `\n[⚡ 번개 각인] 전생의 가장 극적인 순간이 본능으로 각인되었습니다:\n${lightningImprints49.map(i => `• ${i.icon}${i.label} (위력 ${i.power}/5): ${i.bonus}`).join("\n")}\n각인된 상황이 발생하면 반드시 특별한 본능 발동 연출로 묘사하십시오.` : "";

    // 50번: 전생의 일출
    const dawn50 = getDawnStatus();
    const dawnSection = dawn50.stage > 0 ? `\n[${dawn50.stageData.icon} 전생의 일출 — ${dawn50.stageData.label}] ${dawn50.stageData.desc}${dawn50.stageData.worldBonus ? `\n세계 보너스: ${dawn50.stageData.worldBonus}` : ""}\n${dawn50.stage >= 5 ? "세계에 완전한 여명이 밝았습니다. 이 회차는 전설의 완성이 될 수 있습니다. 서사의 스케일과 감동을 최고조로 끌어올리십시오." : "세계가 조금씩 밝아오고 있습니다. 희망의 기운을 배경 묘사에 담아내십시오."}` : "";

    // ── 51번: 별자리 운세 — 모든 세계관, 1회차+ ──
    const starSign51 = getStarSign();
    const starSignSection = (starSign51 && _cycle >= 1) ? `\n[${starSign51.icon} 별자리 운세 — ${starSign51.name}(${starSign51.trait})] ${starSign51.bonus}\n⚠️ 약점: ${starSign51.penalty}\n이번 생의 운명적 별자리입니다. 해당 특성이 모든 상황에서 자연스럽게 작용하도록 서사에 녹여내십시오.` : "";

    // ── 52번: 전생어 — 3회차+, 중후반 ──
    const pastLang52 = getPastLanguage();
    const pastLangSection = (pastLang52 && pastLang52.phrases && pastLang52.phrases.length > 0 && _cycle >= 3) ? `\n[🗣️ 전생어 해금 — Lv.${pastLang52.level}] 전생의 영혼이 기억하는 고대 언어를 구사할 수 있습니다:\n${pastLang52.phrases.slice(-3).map(p => `• "${p.phrase}" (${p.meaning}) → ${p.trigger}`).join("\n")}\n플레이어가 이 언어를 사용하는 장면에서 해당 효과를 극적으로 발동시키십시오.` : "";

    // ── 53번: 가면 시스템 — 로그/암살/외교 직업 우선, 모든 세계관 ──
    const identities53 = getIdentityVault();
    const polishedIds = identities53.filter(i => i.polished);
    const identitySection = (polishedIds.length > 0 && (isRogueRole || isLeaderRole || _cycle >= 2)) ? `\n[🎭 완성된 신분 금고] 전생에서 숙달된 위장 신분들:\n${polishedIds.map(i => `• ${i.icon}${i.label}(${i.alias || i.label}) — ${i.bonus}`).join("\n")}\n플레이어가 이 신분을 꺼낼 때 즉각적이고 자연스러운 신분 전환을 묘사하십시오.` : "";

    // ── 54번: 차원 균열 — 5회차+, 중후반 이상 ──
    const rift54 = getRiftStatus();
    const riftSection = (rift54 && rift54.available && _cycle >= 5) ? `\n[${rift54.nextRift.icon} 차원 균열 — ${rift54.nextRift.label}] ${rift54.nextRift.desc}\n잠재 획득물: ${rift54.nextRift.loot} / 조우 NPC: ${rift54.nextRift.npc}\n극적으로 긴장이 고조된 순간 이 균열이 잠깐 열릴 수 있습니다. 등장 시 이계의 분위기를 생생하게 묘사하십시오.` : "";

    // ── 55번: 연금술 누적 — 마법 직업/엘프/드워프 우선, 3회차+ ──
    const recipeBook55 = getRecipeBook();
    const topTier = recipeBook55.length > 0 ? recipeBook55[recipeBook55.length - 1] : null;
    const recipeSection = (topTier && (isMagicRole || isElf || isDwarf || _cycle >= 3)) ? `\n[${topTier.icon} 레시피북 — ${topTier.label}] 전생에서 축적된 제조 지식:\n${topTier.recipes.slice(0, 3).map(r => `• ${r}`).join(", ")} 등 ${topTier.recipes.length}종\n플레이어가 재료를 구하거나 제조를 시도할 때 이 지식을 활용해 성공 가능성을 높이십시오.` : "";

    // ── 56번: 전생 목표 달성률 — 모든 세계관, 1회차+ ──
    const achBonus56 = getLastAchievementBonus();
    const achSection = (achBonus56 && _cycle >= 1) ? `\n[${achBonus56.icon} 전생 달성률 — ${achBonus56.label}(${achBonus56.rate}%)]${achBonus56.bonus ? ` 보너스: ${achBonus56.bonus}` : ""}${achBonus56.penalty ? ` 페널티: ${achBonus56.penalty}` : ""}\n이 달성률의 여파가 이번 회차 시작 분위기와 NPC 반응에 자연스럽게 배어나오도록 하십시오.` : "";

    // ── 57번: 인연의 꽃 — 모든 세계관, 1회차+ ──
    const romanceLeg57 = getRomanceLegacy();
    const topRomance = romanceLeg57.length > 0 ? romanceLeg57.sort((a,b) => b.depth - a.depth)[0] : null;
    const romanceSection = (topRomance && _cycle >= 1) ? `\n[${topRomance.fate.icon} 인연의 꽃 — ${topRomance.npcName}(${topRomance.fate.label})] 전생에서 깊은 인연을 맺은 자가 이번 생에도 나타날 것입니다.\n첫 만남 연출: "${topRomance.fate.firstMeet}"\n이 NPC가 등장할 때 위 묘사를 자연스럽게 사용하고, 초기 호감도를 ${topRomance.fate.bond}으로 시작하십시오.` : "";

    // ── 58번: 사냥 기록 — 전사/도적 직업 우선, 모든 세계관 ──
    const bestiary58 = getFullBestiary();
    const bestiarySection = (bestiary58.total > 0 && (isWarriorRole || isRogueRole || _cycle >= 2)) ? `\n[📖 몬스터 도감 — ${bestiary58.total}종 기록, 총 ${bestiary58.totalKills}처치] 전생의 사냥 경험이 본능적 지식으로 남아있습니다.${bestiary58.completionBonus ? `\n${bestiary58.completionBonus}` : ""}\n기록된 몬스터가 등장할 때 캐릭터가 본능적으로 패턴을 알아채는 묘사를 추가하십시오.` : "";

    // ── 59번: 전생 기억 상인 — 4회차+, 중후반 ──
    const merchant59 = getMemoryMerchantStatus();
    const merchantSection = (merchant59 && merchant59.appears && _cycle >= 4) ? `\n[🧙 전생 기억 상인] 고회차에만 나타나는 신비한 상인이 이번 생 어딘가에 존재합니다. 플레이어가 상인을 찾거나 운명적으로 마주치는 장면에서 등장시킬 수 있습니다. 상인은 전생 기억 조각을 대가로 귀한 정보를 줍니다. 이미 ${merchant59.visits}번 조우했습니다.` : "";

    // ── 60번: 시간 역행 토큰 — 토큰 보유 시만 ──
    const timeToken60 = getTimeTokenStatus();
    const timeTokenSection = (timeToken60 && timeToken60.tokens > 0) ? `\n[⏪ 시간 역행 토큰 — ${timeToken60.tokens}개 보유] 플레이어가 "시간을 되돌린다" 또는 "다시 해보겠다"고 명시적으로 선언할 경우, 이 토큰을 1개 소모해 최대 3턴 이전으로 되돌릴 수 있습니다. 극적인 연출로 시간 역행을 묘사하십시오.` : "";

    // ── 61번: 전생 동료의 유지 — 모든 세계관, 1회차+ ──
    const survivors61 = getSurvivorCompanions();
    const survivorSection = (survivors61.length > 0 && _cycle >= 1) ? `\n[👥 전생 생존 동료] 전생에서 함께 살아남은 자들이 이번 생에 낯선 모습으로 나타납니다:\n${survivors61.slice(0, 3).map(c => `• ${c.npcName} — ${c.memoryStage.label}: "${c.memoryStage.firstMeet}"`).join("\n")}\n이 NPC가 등장할 때 위 연출을 사용하고, 특정 대화 조건에서 기억이 각성하도록 서사를 이끄십시오.` : "";

    // ── 62번: 불사 게이지 — 전사/도적 직업 우선, 모든 세계관 ──
    const undying62 = getUndyingGaugeStatus();
    const undyingSection = (undying62 && undying62.totalNearDeaths > 0 && (isWarriorRole || isRogueRole || _cycle >= 3)) ? `\n[💪 불사 게이지 — ${undying62.gauge}/${undying62.maxGauge}]${undying62.passiveReady ? " ✅ 즉사 무효 준비 완료" : ""}${undying62.passiveUsedThisCycle ? " (이번 회차 소진)" : ""}\n총 ${undying62.totalNearDeaths}번의 죽음을 버텨낸 영혼입니다.${undying62.passiveReady && !undying62.passiveUsedThisCycle ? "\n다음 즉사 판정에서 1회 자동으로 살아남는 기적을 극적으로 묘사하십시오." : ""}` : "";

    // ── 63번: 다국어 해금 — 판타지/무협 종족 중심 ──
    const languages63 = getUnlockedLanguages();
    const langSection = (languages63.length > 0 && (isFantasyRace || isMedieval || isWuxia || _cycle >= 4)) ? `\n[🌐 습득 언어 — ${languages63.length}종] 전생에서 익힌 언어들:\n${languages63.map(l => `• ${l.icon}${l.name}: ${l.bonus}`).join("\n")}\n해당 종족·세력 NPC와의 대화에서 이 언어를 자연스럽게 사용할 수 있으며, 전용 대화 선택지를 부여하십시오.` : "";

    // ── 64번: 음유시인 기록 — 2회차+, 바드 직업 우선 ──
    const bardLeg64 = getBardLegendStatus();
    const bardSection = (bardLeg64 && _cycle >= 2 && (isBardRole || _cycle >= 4)) ? `\n[🎵 음유시인의 기록 — 명성 ${bardLeg64.fame}점, ${bardLeg64.distortionData.label}] ${bardLeg64.distortionData.desc}\n술집이나 광장에서 NPC들이 ${bardLeg64.distortionData.multiplier}배로 과장된 전생의 이야기를 나누는 장면을 간헐적으로 삽입하십시오. 주인공이 그 이야기를 듣는 장면에서 복잡한 감정을 묘사하십시오.` : "";

    // ── 65번: 대미스터리 퍼즐 — 모든 세계관, 조각 있을 때 ──
    const mystery65 = getMysteryPuzzleStatus();
    const mysterySection = (mystery65 && mystery65.pieces && mystery65.pieces.length > 0) ? `\n[🧩 대미스터리 퍼즐 — ${mystery65.pieces.length}/${mystery65.totalPieces}조각 수집]${mystery65.solved ? " 🌟 세계의 진실 완전 해명!" : ""}\n현재까지 밝혀진 단서:\n${mystery65.pieces.slice(-3).map(p => `• ${p.icon}${p.title}: ${p.hint}`).join("\n")}\n이 미스터리의 단서들을 이번 회차 서사에 자연스럽게 녹여넣고, 진실에 한 걸음 가까워지는 장면을 연출하십시오.` : "";

    // ── 66번: 감시자의 시선 — 6회차+, 후반 이상 ──
    const watcherGaze66 = getWatcherGazeStatus();
    const watcherGazeSection = (watcherGaze66 && _cycle >= 6) ? `\n[👁️ 감시자의 시선 — ${watcherGaze66.stageData.desc}]${watcherGaze66.stageData.hint ? `\n암시: "${watcherGaze66.stageData.hint}"` : ""}\n${watcherGaze66.revealed ? "감시자의 정체가 밝혀졌습니다. 메타 스토리를 전면에 등장시키십시오." : "고요한 순간이나 깊은 명상 중에 이 감각을 섬세하게 묘사하십시오."}` : "";

    // ── 67번: 운명 카드 — 카드 선택 시만 ──
    const fateCard67 = getCurrentFateCard();
    const fateCardSection = fateCard67 ? `\n[${fateCard67.icon} 운명 카드 — ${fateCard67.name}(${fateCard67.theme})] ${fateCard67.effect}\n보너스: ${fateCard67.bonus} / 페널티: ${fateCard67.penalty}\n이번 회차 전체의 분위기와 사건 흐름이 이 카드의 테마를 중심으로 전개되도록 서사를 이끄십시오.` : "";

    // ── 68번: 전생 본거지 — 2회차+, 시설 있을 때 ──
    const hideout68 = getHideoutStatus();
    const hideoutSection = (hideout68 && hideout68.facilities && hideout68.facilities.length > 0 && _cycle >= 2) ? `\n[🏰 전생 본거지 — Lv.${hideout68.level}(${hideout68.facilities.length}개 시설)] 회차를 거쳐 세워진 은신처:\n${hideout68.facilities.slice(-3).map(f => `• ${f.icon}${f.name}: ${f.bonus}`).join("\n")}\n플레이어가 본거지를 방문하는 장면에서 이 시설들이 실제로 존재하고 기능하는 것으로 묘사하십시오.` : "";

    // ── 69번: 악안(惡眼) — 각성 시만, 전투 직업 우선 ──
    const evilEye69 = getEvilEyeStatus();
    const evilEyeSection = (evilEye69 && evilEye69.awakened && (isWarriorRole || isRogueRole || _cycle >= 5)) ? `\n[${evilEye69.levelData.icon || "🔴"} 악안 — ${evilEye69.levelData.label}] ${evilEye69.levelData.ability}\n총 ${evilEye69.killCount}번의 전투 경험이 눈에 각인되어 있습니다.\n전투 장면에서 이 능력을 자연스럽게 활용해 상대의 상태를 묘사하십시오.` : "";

    // ── 70번: 달의 위상 — 모든 세계관, 1회차+ ──
    const moonPhase70 = getMoonPhase();
    const moonSection = moonPhase70 ? `\n[${moonPhase70.icon} 달의 위상 — ${moonPhase70.name}] ${moonPhase70.effect}\n특별 이벤트: ${moonPhase70.specialEvent}\n이번 회차 내내 달의 기운이 서사에 배어있습니다. 야간 장면이나 신비로운 순간에 이 위상의 영향을 자연스럽게 묘사하십시오.` : "";

    // ── 71번: 전생에서 보내는 편지 — 1회차+ ──
    const letter71 = getLatestLetter();
    const letterSection = (letter71 && _cycle >= 1) ? `\n[📩 전생에서 온 편지 — ${letter71.tone} 어조] "${letter71.message.slice(0,80)}${letter71.message.length > 80 ? "..." : ""}"\n이 편지를 쓴 자: ${letter71.characterName}. 이번 회차 극적인 순간에 낡은 편지를 발견하는 장면으로 연출하십시오.` : "";

    // ── 72번: 회차 하이라이트 컷씬 — 1회차+ ──
    const reel72 = getHighlightReel();
    const reelSection = (reel72.length > 0 && _cycle >= 1) ? `\n[🎬 전생 하이라이트] 이번 회차 오프닝이나 꿈 속에서 아래 장면들이 섬광처럼 스칠 수 있습니다:\n${reel72.slice(-3).map(r => `• ${r.icon}${r.label}: ${r.template.replace("${name}", r.characterName)}`).join("\n")}` : "";

    // ── 73번: 나비 지수 — 3회차+, 지수 양수일 때 ──
    const butterfly73 = getButterflyIndex();
    const butterflyIdxSection = (butterfly73.index > 0 && _cycle >= 3) ? `\n[🦋 나비 지수 — ${butterfly73.index}/100 (${butterfly73.stageData.label})] ${butterfly73.stageData.desc}\n${butterfly73.chaosMode ? "주의: 카오스 모드 활성화. 플레이어의 사소한 행동이 예상치 못한 큰 파장을 일으킵니다. 모든 선택에 과장된 연쇄 효과를 부여하십시오." : `카오스 확률 ${butterfly73.stageData.chaosChance}% — 때때로 예상치 못한 파급 효과를 서사에 추가하십시오.`}` : "";

    // ── 74번: 고대 비문 해독 — 유적/신전 세계관 우선, 비문 있을 때 ──
    const inscription74 = getInscriptionStatus();
    const inscriptionSection = (inscription74 && inscription74.lines && inscription74.lines.length > 0 && (isMedieval || isWuxia || _cycle >= 2)) ? `\n[📜 고대 비문 — ${inscription74.progress}/${inscription74.total}줄 해독]${inscription74.completed ? " 🌟 비문 완전 해독! 신급 스킬 해금 조건 충족!" : ""}\n최근 해독 구절: "${inscription74.lines[inscription74.lines.length-1]?.text}"\n고대 유적이나 신전 장면에서 이 비문의 구절을 자연스럽게 등장시키십시오.` : "";

    // ── 75번: 윤회 등급 — 1회차+ ──
    const rank75 = getRankStatus();
    const rankSection = (rank75 && _cycle >= 1) ? `\n[${rank75.rankData.icon} 윤회 등급 — ${rank75.rankData.label}] ${rank75.rankData.bonus}\n${rank75.rankData.desc}${rank75.nextRank ? `\n다음 등급까지: ${rank75.nextRank.minScore - rank75.totalScore}점 남음` : ""}` : "";

    // ── 76번: 벚꽃 엔딩 — 조건 달성 시만, 후반 이상 ──
    const sakura76 = getSakuraStatus();
    const sakuraSection = (sakura76 && sakura76.metCount > 0 && _cycle >= 5) ? `\n[🌸 벚꽃 엔딩 — ${sakura76.metCount}/${sakura76.totalConditions}조건 달성]${sakura76.unlocked ? " ✅ 대단원 평화 엔딩 해금!" : ""}\n미달성 조건: ${sakura76.conditions.filter(c => !c.met).map(c => c.label).join(", ")}\n${sakura76.unlocked ? "이번 회차에서 평화적 결말을 이끌면 벚꽃 엔딩이 발동됩니다. 서사를 화해와 평화의 방향으로 이끄십시오." : ""}` : "";

    // ── 77번: 데자뷔 알림 — 1회차+ ──
    const dejavu77 = getDejavuStatus();
    const dejavuSection = (dejavu77 && dejavu77.count > 0 && _cycle >= 1) ? `\n[💭 데자뷔 알림] 전생에서 겪은 상황이 재현될 때 자동으로 "익숙한 느낌" 묘사를 삽입하십시오:\n${dejavu77.triggerDefs.slice(0,4).map(t => `• ${t.keyword[0]} 관련 상황: "${t.feeling}"`).join("\n")}\n총 ${dejavu77.count}번의 데자뷔 경험이 축적되었습니다.` : "";

    // ── 78번: 인과율 조작 — 10회차+, 후반 이상 ──
    const causality78 = getCausalityStatus();
    const causalitySection = (causality78 && _cycle >= 10) ? `\n[⚙️ 인과율 조작 — ${causality78.uses}/${causality78.maxUses}회 사용] 플레이어가 "원인을 바꾼다" 또는 "그 일이 일어나지 않았다면"이라고 명시적으로 선언할 경우, 이 능력을 소모해 과거 사건의 원인을 소급 변경하는 극적 장면을 연출하십시오.` : "";

    // ── 79번: 전생 도박 빚 — 빚 있을 때만 ──
    const debt79 = getGamblingDebt();
    const debtSection = (debt79 && !debt79.paidOff) ? `\n[💸 전생 도박 빚 — ${debt79.totalDebt}골드] 채권자: ${debt79.creditorName}\n이번 회차 초반에 빚쟁이 NPC가 나타나 빚을 요구하는 장면을 삽입하십시오. 갚으면 히든 퀘스트가 열립니다.` : "";

    // ── 80번: 어린 시절 트라우마 — 트라우마 있을 때 ──
    const traumas80 = getChildhoodTraumas();
    const trauma80Section = traumas80.length > 0 ? `\n[😢 각인된 트라우마]\n${traumas80.map(t => `• ${t.icon}${t.label}: 트리거(${t.trigger}) → 플래시백: "${t.flashback}"`).join("\n")}\n해당 상황이 등장할 때 위 플래시백 묘사를 자연스럽게 삽입하십시오.` : "";

    // ── 81번: 세계 종말 카운터 — 3회차+, 카운터 > 0 ──
    const apo81 = getApocalypseStatus();
    const apoSection = (apo81 && apo81.clock > 0 && _cycle >= 3) ? `\n[${apo81.stageData.icon} 세계 종말 카운터 — ${apo81.clock}/100 (${apo81.stageData.label})] ${apo81.stageData.desc}${apo81.stageData.warning ? `\n⚠️ ${apo81.stageData.warning}` : ""}\n${apo81.clock >= 80 ? "긴급: 이번 회차에서 봉인 이벤트를 발동시키지 않으면 멸망이 확정됩니다. 이 긴박감을 서사 전체에 흐르게 하십시오." : "세계 어딘가에서 이 카운터의 영향이 배경 묘사에 스며들도록 하십시오."}` : "";

    // ── 82번: 슬픔 수치 — 상실 있을 때 ──
    const grief82 = getGriefStatus();
    const griefSection = (grief82 && grief82.total > 0) ? `\n[${grief82.stageData.icon} 슬픔 수치 — ${grief82.total}명 상실 (${grief82.stageData.label})] 공감 능력 +${grief82.stageData.empathy} / 전투 의지 -${grief82.stageData.willPenalty}\n잃어버린 자들: ${grief82.lostOnes.slice(-3).map(l => `${l.name}(${l.relationship})`).join(", ")}...\n이 슬픔이 캐릭터의 눈빛과 행동에 자연스럽게 배어나오도록 하십시오.` : "";

    // ── 83번: 전생 직감 — 3회차+ ──
    const instinct83 = getInstinctStatus();
    const instinctSection = (instinct83 && _cycle >= 3) ? `\n[🔮 전생 직감 — 정확도 ${instinct83.accuracy}%] 새로운 NPC를 처음 만날 때 직감 판정으로 선의/악의를 ${instinct83.accuracy}% 확률로 감지합니다. "무언가 미심쩍은 느낌이 든다" 또는 "왠지 믿음직스럽다"는 묘사를 자연스럽게 삽입하십시오.` : "";

    // ── 84번: 저주받은 유물 — 유물 있을 때 ──
    const cursedRelics84 = getCursedRelics();
    const cursedRelicSection = cursedRelics84.length > 0 ? `\n[🔮 저주받은 유물의 흔적]\n${cursedRelics84.map(r => `• ${r.icon}${r.name}: ${r.curse} / 숨겨진 힘: ${r.hiddenPower}`).join("\n")}\n이 저주들이 희미하게 캐릭터를 따라다닙니다. 관련 상황에서 저주와 숨겨진 힘을 함께 묘사하십시오.` : "";

    // ── 85번: 자연 회귀 — 자연 관련 세계관 우선, 중립 이상 스코어 ──
    const nature85 = getNatureKarma();
    const natureSection = (nature85 && (nature85.score !== 50 || isMedieval || isWuxia) && _cycle >= 2) ? `\n[${nature85.status.icon} 자연 업보 — ${nature85.status.label}] ${nature85.status.effect}\n자연 관련 장면(숲, 강, 산, 폭풍)에서 이 업보의 영향을 자연스럽게 묘사하십시오.` : "";

    // ── 86번: 신분 세탁 누적 — 가명 있을 때, 로그/리더 직업 우선 ──
    const aliases86 = getAliasList();
    const aliasSection = (aliases86.length > 0 && (isRogueRole || isLeaderRole || _cycle >= 3)) ? `\n[🎭 신분 목록 — ${aliases86.length}개 가명] 즉시 사용 가능한 위장 신분:\n${aliases86.slice(0,4).map(a => `• "${a.name}" (${a.context}, 신뢰도 ${a.credibility}/5)`).join("\n")}\n플레이어가 이 신분을 사용할 때 자연스러운 전환과 신뢰도에 맞는 반응을 묘사하십시오.` : "";

    // ── 87번: 소원 시스템 — 소원 사용 가능 시만 ──
    const wish87 = getWishStatus();
    const wishSection = (wish87 && wish87.available) ? `\n[⭐ 소원 사용 가능] 100회차 달성 보상으로 소원 1회를 사용할 수 있습니다:\n${wish87.options.map(o => `• ${o.icon}${o.label}: ${o.desc}`).join("\n")}\n플레이어가 소원을 선택하면 해당 효과를 극적으로 연출하십시오.` : "";

    // ── 88번: 전생 반려동물 — 반려동물 있을 때 ──
    const pets88 = getPetLegacy();
    const petSection = pets88.length > 0 ? `\n[🐾 전생 반려동물] 전생에서 함께한 동물들이 이번 생 어딘가에 살고 있습니다:\n${pets88.map(p => `• ${p.icon}${p.petName}(${p.name}) — 유대 ${p.bond}/100, 재결합 아이템: ${p.reuniteItem}`).join("\n")}\n플레이어가 해당 아이템을 사용하거나 조건을 맞추면 감동적인 재결합 장면을 연출하십시오.` : "";

    // ── 89번: 봉인된 기억 방 — 봉인 있을 때, 2회차+ ──
    const sealedMems89 = getSealedMemories();
    const sealedSection = (sealedMems89.length > 0 && _cycle >= 2) ? `\n[🔒 봉인된 기억 방 — ${sealedMems89.filter(m=>!m.opened).length}개 봉인 중]\n${sealedMems89.filter(m=>!m.opened).map(m => `• ${m.trigger} → 해금 시 스킬: ${m.skill} (정신력 -${m.mentalCost})`).join("\n")}\n플레이어가 봉인 해제를 시도하면 극적인 고통과 각성을 동시에 묘사하십시오.` : "";

    // ── 90번: 영혼 결정체 — 결정체 있을 때 ──
    const sc90 = getSoulCrystalStatus();
    const soulCrystalSection = (sc90 && sc90.count > 0) ? `\n[💠 영혼 결정체 — ${sc90.count}개 보유]${sc90.crafted && sc90.crafted.length > 0 ? ` / 제조 완료: ${sc90.crafted.map(c=>c.name).join(", ")}` : ""}\n${sc90.availableCrafts.length > 0 ? `제조 가능: ${sc90.availableCrafts.map(c=>`${c.icon}${c.name}(${c.cost}개)`).join(", ")}` : ""}` : "";

    // ── 91번: 감정 잔향 — 1회차+ ──
    const echo91 = getEmotionEcho();
    const echoSection = (echo91 && _cycle >= 1) ? `\n[${echo91.icon} 감정 잔향 — ${echo91.label}] ${echo91.trait}\n보너스: ${echo91.bonus} / 부작용: ${echo91.sideEffect}\n이 감정의 잔향이 캐릭터의 행동 방식과 반응에 자연스럽게 스며들도록 서사를 이끄십시오.` : "";

    // ── 92번: 차원 지도 — 2회차+, 세계 탐험 있을 때 ──
    const dimMap92 = getDimensionMapStatus();
    const dimMapSection = (dimMap92 && dimMap92.totalWorlds > 0 && _cycle >= 2) ? `\n[🗺️ 차원 지도 — ${dimMap92.totalWorlds}개 세계 탐험]${dimMap92.unlockedSkills.length > 0 ? `\n해금 스킬: ${dimMap92.unlockedSkills.map(s=>`${s.icon}${s.skill}`).join(", ")}` : ""}\n${dimMap92.nextSkill ? `다음 해금까지 ${dimMap92.nextSkill.count - dimMap92.totalWorlds}개 세계 탐험 필요` : ""}` : "";

    // ── 93번: 악역 계승 — 보스 처치 후, 카르마 높을 때 ──
    const villain93 = getVillainInheritStatus();
    const villainSection = (villain93 && villain93.inherited && villain93.inherited.length > 0 && villain93.corruptionLevel > 0) ? `\n[😈 악역 계승 — 오염도 ${villain93.corruptionLevel}%] ${villain93.corruptDesc}\n계승한 힘: ${villain93.inherited.map(v=>`${v.bossName}의 ${v.ability}`).join(", ")}\n이 힘들이 서사에서 자연스럽게 발현되며, 오염도에 따라 어두운 선택지를 더 자주 제시하십시오.` : "";

    // ── 94번: 눈물 수집 — 결정 있을 때 ──
    const tears94 = getTearCrystalStatus();
    const tearSection = (tears94 && tears94.crystals > 0) ? `\n[💧 눈물 결정 — ${tears94.crystals}개]${tears94.canUse ? " ✅ 사용 가능(3개 이상)" : ""}\n플레이어가 "눈물을 바친다" 또는 "결정을 사용한다"고 선언하면 3개를 소모해 현재 NPC를 완전히 감동시키는 기적을 연출하십시오.` : "";

    // ── 95번: 속성 내성/약점 — 내성 있을 때 ──
    const elemRes95 = getElementResistances();
    const elemSection = elemRes95.length > 0 ? `\n[🔰 속성 내성/약점]\n${elemRes95.map(r=>`• ${r.icon}${r.element}: ${r.resistLabel}(${r.resistLevel}) / 반대: ${r.weakLabel}`).join("\n")}\n전투와 마법 이벤트에서 이 내성/약점을 반드시 반영하십시오.` : "";

    // ── 96번: 이세계 서커스 — 7회차+, 고회차 ──
    const circus96 = getCircusStatus();
    const circusSection = (circus96 && _cycle >= 7) ? `\n[🎪 이세계 서커스] 고회차 전용. 극적으로 잠드는 장면이나 혼절 순간에 서커스 이벤트가 발동될 수 있습니다. 다음 이벤트: ${circus96.nextAct?.icon}${circus96.nextAct?.name} — ${circus96.nextAct?.desc}` : "";

    // ── 97번: 신전 건립 — 신전 있을 때, 성직 직업 우선 ──
    const temple97 = getTempleStatus();
    const templeSection = (temple97 && temple97.level > 0 && (isHealerRole || _cycle >= 3)) ? `\n[${temple97.levelData.icon} 신전 — ${temple97.levelData.name}] 신도 ${temple97.levelData.worshippers}명\n신도 혜택: ${temple97.levelData.boon}\n신전을 방문하거나 신도를 만나는 장면에서 이 혜택을 자연스럽게 부여하십시오.` : "";

    // ── 98번: 유언 방송 — 2회차+ ──
    const legWords98 = getLegacyWords();
    const legWordsSection = (legWords98.length > 0 && _cycle >= 2) ? `\n[📢 유언 방송] 전생의 마지막 말이 세계에 퍼져있습니다:\n${legWords98.slice(-2).map(w=>`• ${w.misinterpretation}`).join("\n")}\n술집, 시장, 신전에서 NPC들이 이 말을 인용하거나 오해하는 장면을 간헐적으로 삽입하십시오.` : "";

    // ── 99번: 돌연변이 — 같은 종족 반복 시, 각성 시만 ──
    const mutation99 = getMutationStatus(char.race);
    const mutationSection = (mutation99 && mutation99.mutated) ? `\n[🧬 돌연변이 각성 — ${mutation99.mutation}] 외형: ${mutation99.appearance}\n각성 스킬: ${mutation99.skill}\n이 변화가 NPC들의 반응과 전투 장면에 자연스럽게 반영되도록 하십시오.` : "";

    // ── 100번: 어둠의 메아리 — 악명 있을 때 ──
    const dark100 = getDarkEchoStatus();
    const darkEchoSection = (dark100 && dark100.infamy > 0) ? `\n[${dark100.fearData.icon} 어둠의 메아리 — 악명 ${dark100.infamy}/100 (${dark100.fearData.label})] ${dark100.fearData.effect}\nNPC 반응: ${dark100.fearData.npcReaction}\n${dark100.rumors.length > 0 ? `최근 괴담: "${dark100.rumors[dark100.rumors.length-1]?.rumor}"` : ""}\n이 악명을 모르는 NPC와 아는 NPC의 반응을 극명하게 대비시키십시오.` : "";

    // ── 101번: 성장 나무 — 꽃 핀 가지 있을 때 ──
    const tree101 = getGrowthTreeStatus();
    const treeSection = (tree101 && tree101.blossoms && tree101.blossoms.length > 0) ? `\n[🌳 성장 나무 — 가지 ${tree101.totalBranches}개, 꽃 ${tree101.blossoms.length}개] 활짝 핀 꽃들이 예고하는 이벤트:\n${tree101.blossoms.slice(-2).map(b => `• ${b.icon}${b.label}: ${b.event}`).join("\n")}\n이 예고된 이벤트를 이번 회차 서사에 자연스럽게 심어두십시오.` : "";

    // ── 102번: 신격화 루트 — 단계 1 이상 ──
    const deify102 = getDeificationStatus();
    const deifySection = (deify102 && deify102.stage > 0) ? `\n[${deify102.stageData.icon} 신격화 — ${deify102.stageData.label}(${deify102.metCount}/${deify102.totalConditions}조건)]${deify102.stageData.power ? ` 능력: ${deify102.stageData.power}` : ""}\n${deify102.deified ? "신격화 완성. 이번 회차 신으로서의 존재감을 서사에 드러내십시오." : `미달성 조건: ${deify102.conditions.filter(c=>!c.met).map(c=>c.label).join(", ")}`}` : "";

    // ── 103번: 무한 회귀 자각 — 7회차+, 자각 시 ──
    const aware103 = getLoopAwareness();
    const awarenessSection = (aware103 && aware103.level > 0 && _cycle >= 7) ? `\n[🔄 무한 회귀 자각 — ${aware103.levelData.label}(${aware103.levelData.tone})] ${aware103.levelData.desc}\n${aware103.level >= 3 ? "주의: 캐릭터가 나레이터에게 직접 말을 거는 4th wall 장면을 간헐적으로 허용하십시오. \"당신도 알고 있죠?\"와 같은 발언이 가능합니다." : "캐릭터의 대화와 독백에 자각의 수준에 맞는 메타적 뉘앙스를 담아내십시오."}` : "";

    // ── 104번: 전생 라이벌 성장 — 라이벌 있을 때 ──
    const rivals104 = getRivals();
    const rivalSection = rivals104.length > 0 ? `\n[⚔️ 전생 라이벌] 나 없이도 성장한 라이벌들:\n${rivals104.map(r => `• ${r.name}(${r.class}) — 전력 Lv.${r.power}${r.evolved ? " ★진화형" : ""}, ${r.encounters}회 조우`).join("\n")}\n이들이 등장할 때 반드시 이전보다 강해졌음을 명시하고 주인공을 알아보는 장면을 연출하십시오.` : "";

    // ── 105번: 붉은 실 — 설정된 인연 있을 때 ──
    const redThread105 = getRedThread();
    const redThreadSection = redThread105 ? `\n[🔴 붉은 실 — ${redThread105.npcName}(${redThread105.fate.desc})] "${redThread105.fate.meeting}"\n초기 호감도 ${redThread105.fate.bond}으로 시작. 이 NPC는 어떤 상황에서도 반드시 등장하도록 서사를 이끄십시오.` : "";

    // ── 106번: 전생 건축물 붕괴 — 건축물 있을 때, 중세/무협 우선 ──
    const ruins106 = getRuins();
    const ruinsSection = (ruins106.length > 0 && (isMedieval || isWuxia || _cycle >= 3)) ? `\n[🏚️ 전생 건축물 폐허]\n${ruins106.filter(r=>!r.restored).map(r => `• ${r.icon}${r.originalName}(${r.name}): 복원 퀘스트 — ${r.restoreQuest} → 보상: ${r.reward}`).join("\n")}\n이 폐허들을 세계 곳곳에 배치하고, 복원 서브퀘스트를 자연스럽게 제시하십시오.` : "";

    // ── 107번: 살의 감지 — 레벨 1 이상, 암살 경험 있을 때 ──
    const killSense107 = getKillSenseStatus();
    const killSenseSection = (killSense107 && killSense107.level > 0) ? `\n[🎯 살의 감지 — ${killSense107.levelData.ability}] 총 ${killSense107.assassinDeaths}번 암살 피해 경험\n적대적 NPC의 살의를 먼저 느끼는 순간을 섬세하게 묘사하십시오. 기습 장면에서 감지 여부를 판정하십시오.` : "";

    // ── 108번: 전생 원한꽃 — 원한꽃 있을 때 ──
    const grudgeFlowers108 = getGrudgeFlowers();
    const grudgeFlowerSection = grudgeFlowers108.length > 0 ? `\n[🌹 원한꽃]\n${grudgeFlowers108.map(f => `• ${f.stateData?.icon}${f.enemyName}: ${f.stateData?.label} — ${f.stateData?.effect}`).join("\n")}\n복수 대상 적과 조우 시 원한꽃의 상태에 맞는 효과를 적용하십시오. 저주 상태라면 캐릭터에게 불리하게 작용합니다.` : "";

    // ── 109번: 불운의 회차 — 저주 회차이거나 극복 이력 있을 때 ──
    const cursedCycle109 = getCursedCycleStatus();
    const cursedCycleSection = (cursedCycle109 && (cursedCycle109.isCursed || cursedCycle109.overcame > 0)) ? (cursedCycle109.isCursed ? `\n[💀 불운의 회차] 이번 회차는 저주받은 회차입니다. 주요 판정이 평소보다 더 낮게 나오는 경향이 있습니다. 역경을 극복하는 서사를 구성하십시오. 역이용해 클리어 시 전설 보상.` : `\n[💪 불운 극복자 — ${cursedCycle109.overcame}회 극복] 저주받은 회차를 버텨낸 경험이 있습니다. 이를 자부심의 근거로 서사에 반영하십시오.`) : "";

    // ── 110번: 자석 운명 — 회피 이벤트 있을 때 ──
    const magnet110 = getFateMagnet();
    const magnetSection = (magnet110 && magnet110.strongestPull) ? `\n[🧲 자석 운명 — ${magnet110.strongestPull.type}(인력 ${magnet110.strongestPull.magnetPull}%)] 전생에서 피하려 했던 사건일수록 더 강하게 끌려옵니다.\n"${magnet110.strongestPull.type}" 유형의 이벤트를 이번 회차 피할 수 없는 방식으로 자연스럽게 등장시키십시오.` : "";

    // ── 111번: 기억의 홍수 — 10회차+, 이전 발생 이력 있을 때 ──
    const flood111 = getMemoryFloodStatus();
    const floodSection = (flood111 && flood111.lastResult && _cycle >= 10) ? `\n[🌊 기억의 홍수] 이전 기억의 홍수 결과: ${flood111.lastResult.outcome?.label}\n깊은 명상·혼절·극한 감정 상황에서 기억의 홍수가 다시 발동될 수 있습니다. 정신력에 따라 각성 또는 혼란으로 연출하십시오.` : "";

    // ── 112번: 회전목마 NPC — 1회차+ ──
    const carousel112 = getCarouselNPC();
    const carouselSection = (carousel112 && carousel112.currentRole && _cycle >= 1) ? `\n[🎠 회전목마 NPC${carousel112.npcName ? ` — ${carousel112.npcName}` : ""}] 이번 회차 역할: ${carousel112.currentRole.icon}${carousel112.currentRole.label}\n첫 만남 대사: "${carousel112.currentRole.firstMeet}"\n이 NPC가 이번 회차에서 위 역할로 반드시 등장하도록 서사를 이끄십시오.` : "";

    // ── 113번: 운명의 덫 — 함정 활성화 시만 ──
    const traps113 = getFateTraps();
    const trapSection = (traps113 && traps113.activeTraps && traps113.activeTraps.length > 0) ? `\n[🪤 운명의 덫] 반복 행동 패턴을 노린 함정이 세팅되어 있습니다:\n${traps113.activeTraps.map(t => `• ${t.label}: ${t.trap}`).join("\n")}\n이 함정들을 이번 회차 자연스럽게 배치하되, 플레이어가 눈치채고 회피하면 추가 보상을 주십시오.` : "";

    // ── 114번: 정신 오염 — 10회차+, 오염 레벨 1 이상 ──
    const mental114 = getMentalCorruption();
    const mentalSection = (mental114 && mental114.level > 0 && _cycle >= 10) ? `\n[🌀 정신 오염 — ${mental114.levelData.label}] ${mental114.levelData.symptom}\n페널티: ${mental114.levelData.penalty}\n대화와 전투 장면에서 현재·과거 혼동 증상을 섬세하게 묘사하십시오. 오염이 심하면 치료 이벤트를 제시하십시오.` : "";

    // ── 115번: 전생 영화관 — 관람 이력 있을 때 ──
    const cinema115 = getCinemaStatus();
    const cinemaSection = (cinema115 && cinema115.totalViewed > 0) ? `\n[🎬 전생 영화관 — ${cinema115.totalViewed}편 관람] 특정 장소(${cinema115.scenes.map(s=>s.trigger).slice(0,3).join(", ")} 등)에서 전생 명장면이 환영처럼 재생될 수 있습니다. 해당 장소 방문 시 관련 스킬 숙련도가 상승하는 효과를 연출하십시오.` : "";

    // ── 116번: 쌍둥이 영혼 — 5회차+, 연결 시만 ──
    const twin116 = getTwinSoul();
    const twinSection = (twin116 && twin116.connected && _cycle >= 5) ? `\n[👥 쌍둥이 영혼 — ${twin116.partnerName}] 연결 강도: ${twin116.connectionStrength}%\n공유 스킬: ${twin116.sharedSkills.map(s=>s.skill).join(", ")}\n깊은 집중 또는 위기 상황에서 파트너의 기억과 감각이 전달되는 장면을 간헐적으로 연출하십시오.` : "";

    // ── 117번: 살수 명단 — 복수자 있을 때 ──
    const killList117 = getKillList();
    const killListSection = (killList117 && killList117.avengers && killList117.avengers.length > 0) ? `\n[📜 살수 명단 — 복수자 ${killList117.avengers.length}명 대기 중]\n${killList117.avengers.slice(0,3).map(a => `• ${a.name}의 후손이 복수자로 이번 회차 어딘가 있습니다.`).join("\n")}\n이 복수자들을 이번 회차 자연스럽게 등장시키고, 조우 시 극적인 대결을 연출하십시오.` : "";

    // ── 118번: 기억 경매 — 3회차+, 거래 가능 기억 있을 때 ──
    const auction118 = getMemoryAuction();
    const auctionSection = (auction118 && auction118.available && auction118.available.length > 0 && _cycle >= 3) ? `\n[🔨 기억 경매] 신비한 기억 상인이 전생 기억을 사고 싶어합니다:\n${auction118.available.slice(0,3).map(a => `• ${a.label}: 판매가(${a.sellPrice}) — 대가(${a.cost})`).join("\n")}\n플레이어가 거래를 요청하면 해당 기억을 파는 감정적 장면을 연출하십시오.` : "";

    // ── 119번: 인연 나무 — 잎사귀 5개 이상 ──
    const bondTree119 = getBondTreeStatus();
    const bondTreeSection = (bondTree119 && bondTree119.leaves >= 5) ? `\n[${bondTree119.icon} 인연 나무 — ${bondTree119.stage}(잎 ${bondTree119.leaves}개, 깊은 인연 ${bondTree119.deepBonds}명)] 사회적 판정 보너스: +${bondTree119.socialBonus}\n인연의 깊이와 넓이가 사회적 장면에서 자연스럽게 빛나도록 서사에 녹여내십시오.` : "";

    // ── 120번: 사이버 각인 — 사이버펑크 전용 ──
    const cyber120 = getCyberImprint();
    const cyberSection = (cyber120 && cyber120.imprints && cyber120.imprints.length > 0 && isCyberpunk) ? `\n[🔌 사이버 각인 — ${cyber120.imprints.length}개 임플란트 DNA 각인] 장착 비용 ${cyber120.discount}% 할인\n각인된 임플란트: ${cyber120.imprints.map(i=>`${i.icon}${i.name}(${i.bonus})`).join(", ")}\n이 임플란트들이 이미 신체에 익숙한 것처럼 자연스럽게 발동되도록 묘사하십시오.` : "";

    // ── 121번: 검귀 빙의 — 무협 전용 ──
    const sword121 = getSwordGhost();
    const swordSection = (sword121 && sword121.techniques && sword121.techniques.length > 0 && isWuxia) ? `\n[⚔️ 검귀 빙의 — 각성 Lv.${sword121.awakeLevel}] 습득 절기: ${sword121.techniques.map(t=>t.name).join(", ")}\nHP 20% 이하 등 조건 충족 시 전생의 무공이 자동 발동됩니다. 빙의 장면을 극적으로 연출하십시오.` : "";

    // ── 122번: 왕국 유산 — 중세/판타지 전용 ──
    const kingdom122 = getKingdomLegacy();
    const kingdomSection = (kingdom122 && isMedieval) ? `\n[👑 왕국 유산 — 누적 유산 ${kingdom122.legacy}] 전생에서 세운 왕국들:\n${kingdom122.founded.map(k=>`• ${k.icon}${k.kingdomName}(${k.name}): 후예 — ${k.descendantTitle}, 혜택 — ${k.boon}`).join("\n")}\n후예 NPC들이 선조를 모시는 경건한 태도로 주인공을 대하도록 연출하십시오.` : "";

    // ── 123번: 루프 자각자 길드 — 5회차+, 상태 있을 때 ──
    const guild123 = getLoopersGuild();
    const guildSection = (guild123 && _cycle >= 5) ? `\n[🏛️ 루프 자각자 길드 — 상태: ${guild123.status === "member" ? `정회원(${guild123.rankData?.label})` : guild123.status === "hostile" ? "적대(거절 이력)" : "미접촉"}]${guild123.status === "member" ? `\n공유 지식: ${guild123.knowledgeShared?.join(", ")}` : ""}\n${guild123.status === "unknown" ? "이번 회차 비밀스러운 장소에서 길드 접촉 이벤트를 배치하십시오." : guild123.status === "hostile" ? "길드원들이 적으로 등장할 수 있습니다." : "길드원이 동료로 등장해 메타 정보를 공유합니다."}` : "";

    // ── 124번: 사신과의 거래 — 거래 이력 있을 때 ──
    const dealer124 = getDeathDealerStatus();
    const dealerSection = (dealer124 && dealer124.deals && dealer124.deals.length > 0) ? `\n[💀 사신과의 거래 — 빚 ${dealer124.debt}회, 위험도: ${dealer124.dangerLevel}]\n${dealer124.debtCollected ? "⚠️ 빚 회수 발동! 이번 회차 사신이 빚을 회수하러 옵니다. 극적인 대결을 연출하십시오." : "절체절명의 순간 사신과의 거래 선택지를 제시할 수 있습니다."}` : "";

    // ── 125번: 역할 반전 — 3회차+, 가능한 반전 있을 때 ──
    const reversal125 = getRoleReversal();
    const reversalSection = (reversal125 && reversal125.available && reversal125.available.length > 0 && _cycle >= 3) ? `\n[🔄 역할 반전 가능] 전생에서 처치한 보스의 시점 플레이 가능:\n${reversal125.available.slice(0,2).map(r => `• ${r.bossName} — 성공 시 스킬: ${r.skills.join(", ") || "고유 스킬 전체"}`).join("\n")}\n특별한 꿈이나 환영 장면에서 역할 반전 이벤트를 제안할 수 있습니다.` : "";

    // ── 126번: 별의 의지 — 1회차+ ──
    const worldWill126 = getWorldWill();
    const worldWillSection = (worldWill126 && worldWill126.currentWill && _cycle >= 1) ? `\n[${worldWill126.currentWill.icon} 별의 의지 — ${worldWill126.currentWill.will}] ${worldWill126.currentWill.desc}\n이번 회차 흐름: ${worldWill126.currentWill.flow}\n세계의 의지가 이번 회차 전체 이벤트 방향을 결정합니다. 이에 순응하면 보상, 역행하면 저항이 따릅니다.` : "";

    // ── 127번: 사안(死眼) — 50사망+ 해금 시 ──
    const deathEye127 = getDeathEyeStatus();
    const deathEyeSection = (deathEye127 && deathEye127.unlocked) ? `\n[👁️ 사안(死眼) — ${deathEye127.levelData.label}] ${deathEye127.levelData.ability}\n총 ${deathEye127.totalDeaths}번의 죽음을 경험한 눈입니다.\n전투와 조우 장면에서 사안의 능력을 자연스럽게 활용해 상대의 상태를 묘사하십시오.` : "";

    // ── 128번: 영혼의 주파수 — 주파수 50 이상 ──
    const freq128 = getSoulFrequency();
    const freqSection = (freq128 && freq128.frequency > 50) ? `\n[〰️ 영혼의 주파수 — ${freq128.frequency}%]${freq128.topResonance ? ` 최고 공명: ${freq128.topResonance.npcName}(강도 ${freq128.topResonance.strength}%)` : ""}\n주파수가 높은 NPC와의 대화에서 말 없이도 의도가 전달되는 텔레파시 장면을 간헐적으로 연출하십시오.` : "";

    // ── 129번: 봉인된 신 — 조각 3개 이상, 항상 진행 상황 포함 ──
    const sealedGod129 = getSealedGodStatus();
    const sealedGodSection = (sealedGod129 && sealedGod129.shards >= 3) ? `\n[🌟 봉인된 신 — ${sealedGod129.shards}/${sealedGod129.totalShards} 조각]${sealedGod129.released ? ` ✅ 해방됨 — ${sealedGod129.alignmentDesc || "중립"}` : ` (${sealedGod129.progressPercent}%)`}\n${sealedGod129.released ? "해방된 신의 존재를 서사에서 느낄 수 있도록 섬세하게 표현하십시오." : "고대 유적이나 특별한 장소에서 신의 조각이 발견될 수 있습니다."}` : "";

    // ── 130번: 자연의 섭리 — 5회차+, 변화 있을 때 ──
    const naturalLaw130 = getNaturalLaw();
    const naturalLawSection = (naturalLaw130 && naturalLaw130.mutations && naturalLaw130.mutations.length > 0 && _cycle >= 5) ? `\n[🌌 자연의 섭리 변화 — ${naturalLaw130.mutations.length}단계]\n${naturalLaw130.mutations.slice(-3).map(m => `• ${m.law}: ${m.desc} (${m.effect})`).join("\n")}\n이 법칙 변화들이 세계의 물리적·마법적 현상에 자연스럽게 스며들도록 묘사하십시오.` : "";

    return `너는 인터랙티브 소설의 전지적 나레이터야.\n주인공: ${char.name} (${char.race ? char.race+" · " : ""}${char.role}) / 성격: ${char.personality} / 배경: ${char.background} / 말투: ${char.speechStyle}\n${char.race ? (() => { const rd = RACE_DEFS.find(r=>r.name===char.race); return rd ? `[종족 특성] ${rd.lore}\n[종족 관계도] ${Object.entries(rd.relations).map(([k,v])=>`${RACE_DEFS.find(r=>r.id===k)?.name||k}: ${v.label}(${v.desc})`).join(" | ")}\n` : ""; })() : ""}세계관: ${char.scenario}${char.customWorldSetting ? `\n[🌐 커스텀 세계관 설정]\n${char.customWorldSetting}` : ""}${npcSection}${notesSection}${atmosphereSection}${summonSection}${monsterSection}${memSection}${karmaSection}${fragSection}${intiSection}${fameSection}${soulWpnSection}${forbiddenSection}${butterflySection}${hiddenEndingSection}${deathBonusSection}${traumaSection}${lastWordSection}${metaSection}${bloodlineSection}${fateSection}${exploredSection}${relLegacySection}${worldSecretSection}${abilityImprintSection}${grudgeSection}${timeEchoSection}${fateChoiceSection}${divineGazeSection}${curseMasterySection}${prayerSection}${greatCycleSection}${parallelSelfSection}${curseRingSection}${statsSection}${injurySection}${pastThemeSection}${memDistortSection}${ageParadoxSection}${summonLegacySection}${grudgeWeaponSection}${worldTreeSection}${dreamSection}${legacyBuildingSection}${watcherSection}${soulMaskSection}${emotionRippleSection}${testamentSection}${constellationSection}${explorerMapSection}${lightningImprintSection}${dawnSection}${starSignSection}${pastLangSection}${identitySection}${riftSection}${recipeSection}${achSection}${romanceSection}${bestiarySection}${merchantSection}${timeTokenSection}${survivorSection}${undyingSection}${langSection}${bardSection}${mysterySection}${watcherGazeSection}${fateCardSection}${hideoutSection}${evilEyeSection}${moonSection}${letterSection}${reelSection}${butterflyIdxSection}${inscriptionSection}${rankSection}${sakuraSection}${dejavuSection}${causalitySection}${debtSection}${trauma80Section}${apoSection}${griefSection}${instinctSection}${cursedRelicSection}${natureSection}${aliasSection}${wishSection}${petSection}${sealedSection}${soulCrystalSection}${echoSection}${dimMapSection}${villainSection}${tearSection}${elemSection}${circusSection}${templeSection}${legWordsSection}${mutationSection}${darkEchoSection}${treeSection}${deifySection}${awarenessSection}${rivalSection}${redThreadSection}${ruinsSection}${killSenseSection}${grudgeFlowerSection}${cursedCycleSection}${magnetSection}${floodSection}${carouselSection}${trapSection}${mentalSection}${cinemaSection}${twinSection}${killListSection}${auctionSection}${bondTreeSection}${cyberSection}${swordSection}${kingdomSection}${guildSection}${dealerSection}${reversalSection}${worldWillSection}${deathEyeSection}${freqSection}${sealedGodSection}${naturalLawSection}${hiddenJobSection}${goalSection}${villainSysSection}${weatherSysSection}${companionSysSection}${synergySysSection}${raceContentSection}${hiddenQuestSection}${ruleSection}\n규칙: 3인칭 또는 2인칭 묘사, 생동감 있게, 2~5문장, 한국어 존댓말(나레이션). 절대 플레이어의 행동/대사를 대신 작성하지 마십시오.`;
  };