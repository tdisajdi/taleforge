const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error' && !/ERR_CONNECTION_RESET|favicon/i.test(msg.text())) errors.push('CONSOLE: ' + msg.text()); });
  const filePath = 'file://' + path.resolve(__dirname, '../dist/taleforge.html');
  await page.goto(filePath);
  await page.waitForTimeout(5000);
  await page.click('text=시작하기');
  await page.click('text=모험 시작');
  for (let i = 0; i < 40; i++) {
    if (await page.locator('#msg-inp').isVisible().catch(()=>false)) break;
    const pickButtons = page.locator('[onclick^="pick"]:visible');
    if (await pickButtons.count() > 0) await pickButtons.first().click();
    if (await page.locator('#setup-next').isVisible().catch(()=>false)) await page.locator('#setup-next').click();
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(1000);
  const openingOk = (await page.locator('.msg-ai').first().innerText().catch(()=>'')).length > 10;
  console.log('opening ok:', openingOk);
  await page.waitForTimeout(4000);

  // Comprehensive functional sweep across every function touched this session
  const result = await page.evaluate(() => {
    const out = {};
    const fns = [
      'processGSBlock','sendMsg','checkDemesneDefenseWarning','tickDemesneResources',
      'runDramaScheduler','detectFactionGaugeFromText','detectCausalFromText','checkMilestones',
      'checkAutoJobUnlock','recordButterflyEvent','checkCompanionLeave','updateWorldImpact',
      'updatePlayStyle','buildDilemmaContext','ensureRivalDomainForNpc','tickRivalDomain',
      'tickPuppetTribute','renderRivalDomainPanel','tickWSI','injectWSIBtn','injectCitiesShortcut',
      'v5Tick','renderDemesneV5Panel','renderWorldMap','pmDetectNpcFromText','pmDetectWorldFromText',
      'pmDetectPersonalFromText','pmDetectQuestFromText','pmLearnFromNpcDialog','detectHistoryFragment',
      'pmUpdateChoice','collectTurnData','pmSyncQuestFromGame','pmUpdateDemesne','pmSyncPersonalFromGame',
      'detectPlotHooks','detectConsequences','runAutoSaveSnapshot','runOffscreenScheduler',
      'checkOffscreenEvents','checkLoopMilestones','loadStatusEffects','applyStatusEffect',
      'autoCompressHistory','buildContextBLS','getSummaryBLS','giveSummonBattleExp',
      'checkMissionReturns','triggerReligionEvent','enterSurvivalEnv','exitSurvivalEnv',
      'loadSurvivalState','checkRandomEncounter','tryHumanEncounter','tryWitnessEncounter',
      'rollWarCheck','scheduleLocalCombatStart','addProphecy','addPlayerRumor','triggerNpcDrama',
      'buildLightSystem','getKarmaRollBonus','getReligionRollBonus'
    ];
    out.missingFns = fns.filter(f => typeof window[f] !== 'function');

    // Functional smoke tests
    const errs = [];
    try { window.processGSBlock({}); } catch(e) { errs.push('processGSBlock empty: '+e.message); }
    try {
      const before = localStorage.getItem('tf-status-effects');
      window.processGSBlock({ apply_status: [{target:'player',effect:'poison'}] });
      const after = localStorage.getItem('tf-status-effects');
      out.statusEffectPersist = after && after.includes('poison');
    } catch(e) { errs.push('status effect: '+e.message); }
    try { window.checkRandomEncounter('마을로 걸어간다'); } catch(e) { errs.push('checkRandomEncounter: '+e.message); }
    try {
      S.stats = S.stats || {};
      S.stats.str = 50;
      const r = window.rollWarCheck('str','test');
      out.rollWarCheckShape = typeof r.threshold === 'number' && typeof r.success === 'boolean';
    } catch(e) { errs.push('rollWarCheck: '+e.message); }
    try { window.v5Tick(); } catch(e) { errs.push('v5Tick: '+e.message); }
    try { window.tickWSI(); } catch(e) { errs.push('tickWSI: '+e.message); }
    try { window.checkAutoJobUnlock(); } catch(e) { errs.push('checkAutoJobUnlock: '+e.message); }
    try {
      const html = window.renderWorldMap();
      out.worldMapOk = typeof html === 'string' && html.length > 10;
    } catch(e) { errs.push('renderWorldMap: '+e.message); }
    try { window.checkMilestones(); } catch(e) { errs.push('checkMilestones: '+e.message); }
    try { window.autoCompressHistory(); } catch(e) { errs.push('autoCompressHistory: '+e.message); }
    try { window.collectTurnData('테스트','테스트',false); } catch(e) { errs.push('collectTurnData: '+e.message); }

    out.smokeTestErrors = errs;
    return out;
  });
  console.log('regression sweep:', JSON.stringify(result, null, 2));

  // Simulate a few local turns via the input box to exercise sendMsg's full body (no API key -> will error gracefully, but should not crash the page)
  await page.fill('#msg-inp', '마을 주변을 둘러본다').catch(()=>{});
  await page.click('#send-btn').catch(()=>{});
  await page.waitForTimeout(2000);

  console.log('ERRORS:', errors.join('\n') || '(none)');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
