const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push('PAGEERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|favicon/i.test(msg.text())) pageErrors.push('CONSOLE: ' + msg.text()); });

  const filePath = 'file://' + path.resolve(__dirname, '../dist/taleforge.html');
  await page.goto(filePath);
  await page.waitForTimeout(3000);
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
  console.log('game started, msg-inp visible:', await page.locator('#msg-inp').isVisible().catch(()=>false));

  // ===================== F1: Dragon Heart =====================
  const f1 = await page.evaluate(() => {
    const out = {};
    window.S.character = window.S.character || {};
    window.S.character.race = '드래곤';

    // (a) direct function call, no AI/mock
    const before = window.loadDragonHeart();
    window.gainDragonAwakenPoints('breath');
    window.gainDragonHoard('war');
    window.gainDragonFragment('ancient_ruin');
    window.shiftDragonBalance(-30);
    const after = window.loadDragonHeart();
    out.directCall = {
      before: { awakenPoints: before.awakenPoints||0, hoardObsession: before.hoardObsession||0, ancestorFragments: before.ancestorFragments||0, heartBalance: before.heartBalance||500 },
      after:  { awakenPoints: after.awakenPoints||0,  hoardObsession: after.hoardObsession||0,  ancestorFragments: after.ancestorFragments||0,  heartBalance: after.heartBalance||500 },
    };

    // (b) open real panel via openP, check button exists
    window.openP('dragon-heart');
    window.renderDragonHeartPanel();
    const body = document.getElementById('pb-dragon-heart');
    out.panelHasButtons = !!body && /gainDragonAwakenPoints|gainDragonHoard|gainDragonFragment|shiftDragonBalance/.test(body.innerHTML);
    return out;
  });
  console.log('F1 direct-call result:', JSON.stringify(f1.directCall));
  console.log('F1 panel has manual buttons:', f1.panelHasButtons);

  // click a real DOM button end-to-end
  const f1Click = await page.evaluate(() => {
    const before = window.loadDragonHeart();
    return { before: { fragments: before.ancestorFragments||0 } };
  });
  await page.locator('#pb-dragon-heart button[onclick*="gainDragonFragment(\'elder_dragon\')"]').first().click();
  const f1After = await page.evaluate(() => {
    const dh = window.loadDragonHeart();
    return { fragments: dh.ancestorFragments||0 };
  });
  console.log('F1 DOM click fragments before/after:', f1Click.before.fragments, '->', f1After.fragments);

  // ancient_ruin hook in investigateRuins (dragon race, forced roll success)
  const f1Ruin = await page.evaluate(() => {
    window.S.stats.int = 90;
    window.S.inventory = (window.S.inventory||[]).filter(it=>it && it.id!=='ancient_knowledge_fragment');
    const dh0 = window.loadDragonHeart();
    const origRandom = Math.random;
    Math.random = () => 0.01; // force both rolls to succeed
    window.doInteraction ? window.doInteraction('investigateRuins') : null;
    Math.random = origRandom;
    const dh1 = window.loadDragonHeart();
    return { before: dh0.ancestorFragments||0, after: dh1.ancestorFragments||0, hasItem: window.S.inventory.some(it=>it&&it.id==='ancient_knowledge_fragment') };
  });
  console.log('F1 ancient_ruin hook via investigateRuins:', JSON.stringify(f1Ruin));

  await page.screenshot({ path: '/home/user/taleforge/scratchpad/f1_dragon_heart.png' }).catch(()=>{});

  // ===================== F2: Death Echo =====================
  const f2 = await page.evaluate(() => {
    window.S.character.race = '다크링';
    const before = window.getDeathEchoStatus();
    // (a) direct function call
    window.gainDeathEcho('테스트 적', null);
    const afterDirect = window.getDeathEchoStatus();

    // (b) finishLocalCombat hook (deterministic local combat engine)
    const lc = {
      active: true,
      enemies: [{ id:'test_enemy_1', name:'테스트 늑대', hp:0, level:5 }],
      allies: [],
      log: [],
      turn: 1,
    };
    if (typeof window.finishLocalCombat === 'function') {
      window.finishLocalCombat(lc, true);
    }
    const afterCombat = window.getDeathEchoStatus();

    // open real panel, check button
    window.darkling_ext_tab = 'echo';
    window.openP('darkling-void');
    window.renderDarklingVoidPanel();
    const body = document.getElementById('darkling-ext-tab-body');
    return {
      before: before.stacks||0,
      afterDirect: afterDirect.stacks||0,
      afterCombat: afterCombat.stacks||0,
      hasFinishLocalCombat: typeof window.finishLocalCombat === 'function',
      panelHasButton: !!body && /gainDeathEcho/.test(body.innerHTML),
    };
  });
  console.log('F2 result:', JSON.stringify(f2));

  const f2ClickBefore = await page.evaluate(() => window.getDeathEchoStatus().stacks||0);
  await page.locator('#darkling-ext-tab-body button[onclick*="gainDeathEcho"]').first().click();
  const f2ClickAfter = await page.evaluate(() => window.getDeathEchoStatus().stacks||0);
  console.log('F2 DOM click stacks before/after:', f2ClickBefore, '->', f2ClickAfter);

  // ===================== F3: Loopers Guild =====================
  const f3 = await page.evaluate(() => {
    window.S.character.race = '인간';
    // ensure cycle >= 5 so getLoopersGuild() unlocks
    localStorage.setItem('taleforge-cyclecount', '6');
    // reset guild state to 'unknown'
    window.saveLoopersGuild({ status:'unknown', joinedAt:null, rank:0, knowledgeShared:[] });
    const before = window.loadLoopersGuild();

    window.openP('legacy-archive');
    window.renderLegacyArchivePanel();
    const body = document.getElementById('pb-legacy-archive');
    const hasButtons = !!body && /joinLoopersGuild\(\)/.test(body.innerHTML) && /rejectLoopersGuild\(\)/.test(body.innerHTML);
    return { before: before.status, cycle: window.v36_getReincarnationCount ? window.v36_getReincarnationCount() : null, hasButtons, bodyHtmlSnippet: body ? body.innerHTML.slice(0,50) : null };
  });
  console.log('F3 setup result:', JSON.stringify(f3));

  // click the real DOM join button
  await page.locator('#pb-legacy-archive button[onclick*="joinLoopersGuild()"]').first().click();
  const f3AfterJoin = await page.evaluate(() => window.loadLoopersGuild());
  console.log('F3 after clicking join button:', JSON.stringify(f3AfterJoin));

  // now test reject path fresh
  const f3Reject = await page.evaluate(() => {
    window.saveLoopersGuild({ status:'unknown', joinedAt:null, rank:0, knowledgeShared:[] });
    window.renderLegacyArchivePanel();
    return window.loadLoopersGuild().status;
  });
  await page.locator('#pb-legacy-archive button[onclick*="rejectLoopersGuild()"]').first().click();
  const f3AfterReject = await page.evaluate(() => window.loadLoopersGuild());
  console.log('F3 before reject:', f3Reject, '-> after clicking reject button:', JSON.stringify(f3AfterReject));

  // ===================== F4: Human Stigma =====================
  const f4 = await page.evaluate(() => {
    window.S.character.race = '인간';
    window.clearHumanStigma ? window.clearHumanStigma() : null;
    const before = window.loadHumanStigma();

    // (a) direct function calls
    window.addStigma('cowardice', '테스트');
    const afterAdd = window.loadHumanStigma();
    window.overcomeStigma('cowardice');
    const afterOvercome = window.loadHumanStigma();

    // (b) open real panel, verify manual button grid exists
    window.openP('human-stigma');
    window.renderHumanStigmaPanel();
    const body = document.getElementById('pb-human-stigma');
    const hasAddButtons = !!body && /addStigma\('cowardice'\)/.test(body.innerHTML);
    return {
      beforeStacks: (before.stigmas && before.stigmas.cowardice) || 0,
      afterAddStacks: (afterAdd.stigmas && afterAdd.stigmas.cowardice) || 0,
      afterOvercomeStacks: (afterOvercome.stigmas && afterOvercome.stigmas.cowardice) || 0,
      proofPointsAfterOvercome: afterOvercome.proofPoints||0,
      hasAddButtons,
    };
  });
  console.log('F4 direct-call result:', JSON.stringify(f4));

  // click real DOM add-stigma button
  const f4Before = await page.evaluate(() => (window.loadHumanStigma().stigmas||{}).failure || 0);
  await page.locator('#pb-human-stigma button[onclick*="addStigma(\'failure\')"]').first().click();
  const f4After = await page.evaluate(() => (window.loadHumanStigma().stigmas||{}).failure || 0);
  console.log('F4 DOM click failure-stigma before/after:', f4Before, '->', f4After);

  // click real DOM overcome button (should exist now that failure stigma exists)
  const f4OvercomeBefore = await page.evaluate(() => window.loadHumanStigma().proofPoints||0);
  await page.locator('#pb-human-stigma button[onclick*="overcomeStigma(\'failure\')"]').first().click();
  const f4OvercomeAfter = await page.evaluate(() => window.loadHumanStigma().proofPoints||0);
  console.log('F4 DOM click overcome proofPoints before/after:', f4OvercomeBefore, '->', f4OvercomeAfter);

  console.log('PAGE ERRORS SO FAR:', pageErrors.length ? pageErrors : 'none');

  await browser.close();
})();
