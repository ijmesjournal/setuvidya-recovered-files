/**
 * QA suite for the static preview.
 *
 * Run:  NODE_PATH=/home/claude/.npm-global/lib/node_modules node scripts/qa-preview.js
 *
 * This drives a real Chromium instance against preview/setuvidya-preview.html.
 * It is not a substitute for testing the Next.js build, but the preview shares
 * its markup, copy, CSS tokens and interaction behaviour, so anything broken
 * here is broken there too.
 */

const { chromium } = require('playwright');
const path = require('path');

const FILE = 'file://' + path.resolve(__dirname, '..', 'preview', 'setuvidya-preview.html');

// Derived from the built preview so a new route can never be rendered but
// untested, and so this list cannot drift from the builder.
const ROUTES = [
  ...new Set(
    (require('fs')
      .readFileSync(require('path').resolve(__dirname, '..', 'preview', 'setuvidya-preview.html'), 'utf8')
      .match(/class="page" data-route="([^"]+)"/g) || [])
      .map((m) => m.replace(/.*data-route="([^"]+)".*/, '$1')),
  ),
];

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];

let pass = 0, fail = 0;
const failures = [];

function check(name, ok, detail) {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; failures.push(name + (detail ? ` — ${detail}` : '')); console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  const isNetworkNoise = (t) =>
    /Failed to load resource/i.test(t) || /net::ERR_/i.test(t) || /fonts\.googleapis/i.test(t);
  page.on('console', (m) => {
    if (m.type() === 'error' && !isNetworkNoise(m.text())) consoleErrors.push(m.text());
  });
  page.on('pageerror', (err) => consoleErrors.push('PAGEERROR: ' + err.message));

  console.log('\n=== 1. Page loads, headings, console errors ===');
  for (const route of ROUTES) {
    consoleErrors.length = 0;
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(350);

    const h1s = await page.locator('.page[data-active="true"] h1').count();
    const visible = await page.locator('.page[data-active="true"]').isVisible();
    const text = (await page.locator('.page[data-active="true"]').innerText()).trim();

    check(`${route} renders`, visible && text.length > 400, `${text.length} chars`);
    check(`${route} has exactly one h1`, h1s === 1, `found ${h1s}`);
    check(`${route} no console errors`, consoleErrors.length === 0, consoleErrors.join(' | '));
  }

  console.log('\n=== 2. Heading hierarchy (no skipped levels) ===');
  for (const route of ROUTES) {
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(200);
    const levels = await page.$$eval('.page[data-active="true"] :is(h1,h2,h3,h4)',
      (els) => els.map((el) => Number(el.tagName[1])));
    let ok = true, prev = 0, bad = '';
    for (const l of levels) {
      if (prev && l > prev + 1) { ok = false; bad = `h${prev} -> h${l}`; break; }
      prev = l;
    }
    check(`${route} heading order`, ok, bad);
  }

  console.log('\n=== 3. Accordions (the reported .each bug) ===');
  const accRoutes = ['/', '/services', '/research-thesis', '/publication', '/book-publication', '/university-admission'];
  let totalAccordions = 0;
  for (const route of accRoutes) {
    consoleErrors.length = 0;
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(300);
    const btns = page.locator('.page[data-active="true"] .acc-btn');
    const n = await btns.count();
    totalAccordions += n;
    let allOk = n > 0;
    let detail = '';

    // The first item ships open, so collapse it before iterating; otherwise
    // the first click correctly *closes* it and the assertion misreads that.
    if (n > 0 && (await page.locator('.page[data-active="true"] .acc-item[data-open]').count()) > 0) {
      await btns.nth(0).click();
      await page.waitForTimeout(80);
    }

    for (let i = 0; i < n; i++) {
      const btn = btns.nth(i);
      await btn.click();
      await page.waitForTimeout(60);
      const expanded = await btn.getAttribute('aria-expanded');
      const panelId = await btn.getAttribute('aria-controls');
      const panelVisible = await page.locator(`#${panelId}`).isVisible();
      // exactly one panel open at a time
      const openCount = await page.locator('.page[data-active="true"] .acc-item[data-open]').count();
      if (expanded !== 'true' || !panelVisible || openCount !== 1) {
        allOk = false;
        detail = `item ${i}: expanded=${expanded} visible=${panelVisible} open=${openCount}`;
        break;
      }
    }
    // A route with no accordion is not a failure: Home no longer carries the
    // FAQ, which lives at /faq.
    if (n > 0) {
      check(`${route} all ${n} accordion items open`, allOk, detail);
    }
    check(`${route} accordion throws no errors`, consoleErrors.length === 0, consoleErrors.join(' | '));

    // toggle closed
    if (n > 0) {
      const first = btns.nth(0);
      // Normalise: make sure the first item is the open one.
      if ((await page.locator('.page[data-active="true"] .acc-item[data-open] .acc-btn').count()) === 0
          || !(await page.locator('.page[data-active="true"] .acc-item').first().getAttribute('data-open')) === false) {
        // fall through; explicit open below covers both cases
      }
      const firstItemOpen = async () =>
        (await page.locator('.page[data-active="true"] .acc-item').first().getAttribute('data-open')) !== null;

      if (!(await firstItemOpen())) { await first.click(); await page.waitForTimeout(80); }
      check(`${route} accordion opens first item`, await firstItemOpen());

      await first.click(); await page.waitForTimeout(80);
      const closed = await page.locator('.page[data-active="true"] .acc-item[data-open]').count();
      check(`${route} accordion toggles closed`, closed === 0, `open=${closed}`);
    }
  }
  console.log(`  (exercised ${totalAccordions} accordion items in total)`);

  console.log('\n=== 4. Desktop navigation + Services dropdown ===');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(FILE + '#/');
  await page.waitForTimeout(300);

  // The visible label only: an external item appends a screen-reader-only
  // "(opens in a new tab)", which is not part of the label.
  const navLabels = await page.$$eval('.nav > ul > li', (lis) =>
    lis.map((li) => {
      const el = li.querySelector('.navlink').cloneNode(true);
      el.querySelectorAll('.sr-only').forEach((n) => n.remove());
      return el.textContent.trim();
    }));
  // Contact now lives in the footer ("Get in Touch"), not the header.
  const NAV = ['Home', 'Research & Thesis', 'Publication', 'Services', 'Journal', 'More'];
  check('nav shows exactly the six approved top-level items',
    JSON.stringify(navLabels) === JSON.stringify(NAV), navLabels.join(', '));
  check('no Sign In / Get Started / Courses style items',
    !navLabels.some((l) => /sign in|get started|job|faculty|fellowship|workshop|call for paper|program|course/i.test(l)),
    navLabels.join(', '));
  check('no Sign In / Get Started / Courses style items',
    !navLabels.some((l) => /sign in|get started|jobs?|faculty|fellowship|workshop|call for paper|programs?|courses?/i.test(l)),
    navLabels.join(', '));

  // Our Academic Journal now lives inside the More dropdown.
  const journal = await page.evaluate(() => {
    const el = [...document.querySelectorAll('.nav > ul > li')]
      .map((li) => li.querySelector('.navlink'))
      .find((e) => e && /^Journal/.test(e.textContent.trim()));
    return el ? { tag: el.tagName, href: el.getAttribute('href'),
      target: el.getAttribute('target'), rel: el.getAttribute('rel') } : null;
  });
  check('Journal is a top-level item', !!journal, JSON.stringify(journal));
  const siteCfg = JSON.parse(require('fs').readFileSync(
    require('path').resolve(__dirname, '..', 'content', 'site.json'), 'utf8'));
  const journalLive = /^https?:\/\//.test((siteCfg.journalUrl || '').trim());
  if (journalLive) {
    check('journal opens in a new tab safely',
      journal.tag === 'A' && journal.href === siteCfg.journalUrl
      && journal.target === '_blank' && /noopener/.test(journal.rel || ''), JSON.stringify(journal));
  } else {
    check('journal renders as plain text while its URL is unset, not a dead link',
      journal.tag !== 'A' && journal.href === null, JSON.stringify(journal));
  }
  check('the placeholder URL is never printed on the page',
    !(await page.locator('body').innerText()).includes('JOURNAL_URL_TO_BE_ADDED'));

  // Two dropdowns now (Services and More); scope to Services.
  const servicesLi = page.locator('.has-menu').filter({ has: page.locator('.navlink:text-is("Services")') }).first();
  const dropBtn = servicesLi.locator('.navlink');
  await dropBtn.click();
  await page.waitForTimeout(200);
  check('dropdown opens on click', await servicesLi.locator('.menu').isVisible());
  check('dropdown aria-expanded=true', (await dropBtn.getAttribute('aria-expanded')) === 'true');
  const cardCount = await servicesLi.locator('.mm-card').count();
  check('Services menu shows 2 cards', cardCount === 2, `found ${cardCount}`);

  const cardTitles = await servicesLi.locator('.mm-card .mm-title').evaluateAll((els) => els.map((e) => e.textContent.trim()));
  check('the two Services entries, in order',
    JSON.stringify(cardTitles) === JSON.stringify(['Book Publication', 'University Admission']),
    cardTitles.join(', '));

  const cardHrefs = await servicesLi.locator('.mm-card').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  check('each card keeps its existing route',
    JSON.stringify(cardHrefs) === JSON.stringify(['#/book-publication', '#/university-admission']),
    cardHrefs.join(', '));

  const cardParts = await servicesLi.locator('.mm-card').evaluateAll((els) => els.map((c) => ({
    icon: !!c.querySelector('.mm-icon'),
    blurb: !!c.querySelector('.mm-blurb'),
    explore: !!c.querySelector('.mm-explore'),
  })));
  check('every Services card has icon, description and Explore link',
    cardParts.every((c) => c.icon && c.blurb && c.explore), JSON.stringify(cardParts));

  const moreLi = page.locator('.has-menu').filter({ has: page.locator('.navlink:text-is("More")') }).first();
  await moreLi.locator('.navlink').click();
  await page.waitForTimeout(200);
  const moreTitles = await moreLi.locator('.mm-card .mm-title').evaluateAll((els) => els.map((e) => e.textContent.trim()));
  check('More menu order: Academic Updates first',
    JSON.stringify(moreTitles) === JSON.stringify(['Academic Updates', 'About SetuVidya',
      'Research Guide', 'Testimonials', 'FAQ']), moreTitles.join(', '));

  check('trigger exposes aria-controls', !!(await dropBtn.getAttribute('aria-controls')));
  check('trigger exposes aria-haspopup', (await dropBtn.getAttribute('aria-haspopup')) === 'true');

  await dropBtn.hover();
  await page.waitForTimeout(200);
  await servicesLi.locator('.mm-card').first().click();
  await page.waitForTimeout(300);
  check('dropdown link navigates', page.url().includes('/book-publication'), page.url());
  check('dropdown closes after navigation', !(await servicesLi.locator('.menu').isVisible()));

  console.log('\n=== 5. Every internal link resolves to a real page ===');
  await page.goto(FILE + '#/');
  await page.waitForTimeout(200);
  const hrefs = await page.$$eval('a[href^="#/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
  const knownRoutes = new Set(ROUTES.map((r) => '#' + r));
  const broken = hrefs.filter((hr) => !knownRoutes.has(hr));
  check('no links point at unknown routes', broken.length === 0, broken.join(', '));

  // walk footer links on a deep page too
  await page.goto(FILE + '#/book-publication');
  await page.waitForTimeout(200);
  const footerHrefs = await page.$$eval('.footer a[href^="#/"]', (as) => as.map((a) => a.getAttribute('href')));
  const footerBroken = footerHrefs.filter((hr) => !knownRoutes.has(hr));
  check('footer links all resolve', footerBroken.length === 0, footerBroken.join(', '));

  console.log('\n=== 6. Mobile navigation ===');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(FILE + '#/');
  await page.waitForTimeout(300);

  check('desktop nav hidden on mobile', !(await page.locator('.nav').isVisible()));
  check('burger visible on mobile', await page.locator('#burger').isVisible());

  await page.locator('#burger').click();
  await page.waitForTimeout(250);
  check('drawer opens', await page.locator('.drawer-panel').isVisible());
  check('burger aria-expanded=true', (await page.locator('#burger').getAttribute('aria-expanded')) === 'true');
  check('drawer has dialog role', (await page.locator('.drawer-panel').getAttribute('role')) === 'dialog');

  // The drawer must fill the viewport. It used to be nested inside <header>,
  // whose backdrop-filter made it a containing block for position:fixed.
  const drawerBox = await page.locator('.drawer-panel').boundingBox();
  check('drawer fills the viewport height', Math.round(drawerBox.height) >= 840,
    `${Math.round(drawerBox.height)}px of 844`);
  check('drawer is not nested inside the header',
    await page.evaluate(() => !document.querySelector('.drawer')?.closest('header')));

  const mobLabels = await page.evaluate(() => [...document.querySelectorAll('.drawer nav > ul > li')]
    .map((li) => {
      const el = li.querySelector(':scope > a, :scope > span');
      return (el ? el.textContent : '').replace(/\s*\(opens in a new tab\)/, '').trim();
    }));
  check('mobile nav matches the desktop nav exactly',
    JSON.stringify(mobLabels) === JSON.stringify(NAV), mobLabels.join(', '));

  const subCount = await page.locator('.drawer .sub .dm-card').count();
  // Two drawer submenus now (Services 5 + More 3).
  // Publication 5 + Services 2 + More 5 = 12
  check('mobile submenus show 12 cards in total', subCount === 12, `found ${subCount}`);
  const mobBlurbs = await page.$$eval('.drawer .sub .dm-card .mm-blurb', (els) =>
    els.filter((e) => e.textContent.trim().length > 10).length);
  check('mobile cards carry descriptions', mobBlurbs === subCount, `${mobBlurbs} of ${subCount} with text`);

  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  check('body scroll locked behind drawer', bodyOverflow === 'hidden', bodyOverflow);

  await page.locator('.drawer .sub .dm-card').first().click();
  await page.waitForTimeout(300);
  check('mobile submenu link navigates', page.url().includes('/publication'), page.url());
  check('drawer closes after navigation', !(await page.locator('.drawer-panel').isVisible()));
  check('body scroll restored', (await page.evaluate(() => document.body.style.overflow)) !== 'hidden');

  await page.locator('#burger').click();
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('Escape closes drawer', !(await page.locator('.drawer-panel').isVisible()));

  console.log('\n=== 7. Student reviews ===');
  await page.setViewportSize({ width: 1280, height: 900 });
  // Testimonials now live on their own page, not on Home.
  await page.goto(FILE + '#/');
  await page.waitForTimeout(300);
  const site = JSON.parse(require('fs').readFileSync(
    require('path').resolve(__dirname, '..', 'content', 'site.json'), 'utf8'));
  const approved = site.testimonials.items.filter((t) => t.approved);
  check('home carries no testimonial cards',
    (await page.locator('.page[data-active="true"] .review-card').count()) === 0);
  check('home does not say "What Scholars Say"',
    !(await page.locator('.page[data-active="true"]').innerText()).includes('What Scholars Say'));

  await page.goto(FILE + '#/testimonials');
  await page.waitForTimeout(400);
  const scope = page.locator('.page[data-active="true"]');
  const cards = await scope.locator('.review-card').count();
  check('every approved testimonial is published on its page',
    cards === approved.length, `${cards} cards vs ${approved.length} approved`);
  check('no unapproved wording rendered on the page',
    !(await scope.innerText())
      .includes(site.testimonials.items.find((t) => !t.approved)?.review ?? '\u0000'));
  const imgs = await scope.locator('.review-card img').count();
  check('no student photographs', imgs === 0, `found ${imgs}`);
  const starImgs = await scope.locator('.review-stars svg').count();
  check('stars appear only on published cards',
    starImgs === approved.reduce((n, t) => n + (t.rating || 0), 0), `${starImgs}`);

  console.log('\n=== 8. SD Publication House ===');
  await page.goto(FILE + '#/book-publication');
  await page.waitForTimeout(300);
  check('SD Publication House section exists', await page.locator('#sd-publication-house').isVisible());
  const sdText = await page.locator('#sd-publication-house').innerText();
  check('names the division', sdText.includes('SD Publication House'));
  check('no bracketed internal note shown to the public',
    !/\[ADD |\[INSERT |\[TODO/i.test(sdText), (sdText.match(/\[[^\]]{0,40}/) || [''])[0]);

  console.log('\n=== 9. Contact form ===');
  await page.goto(FILE + '#/contact');
  await page.waitForTimeout(300);

  await page.locator('#enquiry-form button[type="submit"]').click();
  await page.waitForTimeout(200);
  check('empty submit blocked with summary', await page.locator('#form-alert').isVisible());
  const errCount = await page.locator('#enquiry-form .err:not([hidden])').count();
  check('per-field errors shown', errCount >= 7, `found ${errCount}`);
  const invalid = await page.locator('#enquiry-form [aria-invalid="true"]').count();
  check('invalid fields marked aria-invalid', invalid >= 6, `found ${invalid}`);

  const svcOptions = await page.$$eval('#service option', (os) => os.map((o) => o.value).filter(Boolean));
  check('service options match the brief',
    JSON.stringify(svcOptions) === JSON.stringify(['Thesis & Research', 'Research Paper Publication', 'Book Publication', 'University Admission', 'Other']),
    svcOptions.join(', '));

  await page.fill('#fullName', 'Test Scholar');
  await page.fill('#email', 'not-an-email');
  await page.fill('#phone', '+91 90000 00000');
  await page.selectOption('#academicLevel', 'PhD scholar');
  await page.selectOption('#service', 'Thesis & Research');
  await page.fill('#discipline', 'Structural Engineering');
  await page.fill('#requirement', 'I need help restructuring my methodology chapter before submission.');
  await page.check('#consent');
  await page.locator('#enquiry-form button[type="submit"]').click();
  await page.waitForTimeout(200);
  const emailErr = await page.locator('[data-err="email"]').isVisible();
  check('invalid email still rejected', emailErr);

  await page.fill('#email', 'scholar@university.edu');
  await page.locator('#enquiry-form button[type="submit"]').click();
  await page.waitForTimeout(200);
  const alertText = await page.locator('#form-alert').innerText();
  check('valid submit passes validation', (await page.locator('#enquiry-form .err:not([hidden])').count()) === 0);
  check('preview states it has no backend rather than faking success',
    /no backend/i.test(alertText), alertText.slice(0, 90));

  console.log('\n=== 10. Keyboard access ===');
  // Fresh page: on a cold load the skip link must be the first tab stop.
  const kbPage = await ctx.newPage();
  await kbPage.goto(FILE);
  await kbPage.waitForTimeout(400);
  await kbPage.keyboard.press('Tab');
  const firstFocus = await kbPage.evaluate(() => document.activeElement.className);
  check('first tab stop is the skip link on cold load', firstFocus.includes('skip'), firstFocus);

  // Route change should move focus into the new page, not leave it stranded
  // on the previous page's controls.
  await kbPage.goto(FILE + '#/about');
  await kbPage.waitForTimeout(400);
  const afterRoute = await kbPage.evaluate(() => document.activeElement.id);
  check('focus moves to main on route change', afterRoute === 'main', afterRoute || '(body)');
  await kbPage.close();

  await page.goto(FILE + '#/research-thesis');
  await page.waitForTimeout(300);
  // Use the second item: the first ships open, so Enter there would close it.
  const kbBtn = page.locator('.page[data-active="true"] .acc-btn').nth(1);
  const kbPanelId = await kbBtn.getAttribute('aria-controls');
  await kbBtn.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  check('accordion opens via Enter key',
    (await kbBtn.getAttribute('aria-expanded')) === 'true' &&
    (await page.locator(`#${kbPanelId}`).isVisible()));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  check('accordion closes via Enter key',
    (await kbBtn.getAttribute('aria-expanded')) === 'false');

  console.log('\n=== 11. Responsive: no horizontal overflow ===');
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    let worst = null;
    for (const route of ROUTES) {
      await page.goto(FILE + '#' + route);
      await page.waitForTimeout(200);
      const over = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1 && (!worst || over > worst.over)) worst = { route, over };
    }
    check(`${w}px: no horizontal scroll on any page`, !worst,
      worst ? `${worst.route} overflows by ${worst.over}px` : '');
  }

  console.log('\n=== 12. Reduced motion ===');
  const rmCtx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const rmPage = await rmCtx.newPage();
  await rmPage.goto(FILE + '#/');
  await rmPage.waitForTimeout(400);
  const revealOpacity = await rmPage.$$eval('.page[data-active="true"] .reveal',
    (els) => els.slice(0, 12).map((el) => getComputedStyle(el).opacity));
  check('content visible under prefers-reduced-motion',
    revealOpacity.every((o) => Number(o) === 1), revealOpacity.join(','));
  await rmCtx.close();

  console.log('\n=== 13. No-JS fallback (never a blank page) ===');
  const njCtx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const njPage = await njCtx.newPage();
  await njPage.goto(FILE + '#/');
  await njPage.waitForTimeout(300);
  const njText = (await njPage.locator('body').innerText()).trim();
  check('page still renders content with JS disabled', njText.length > 2000, `${njText.length} chars`);
  const njOpacity = await njPage.$$eval('.reveal', (els) => els.slice(0, 8).map((el) => getComputedStyle(el).opacity));
  check('reveal elements not stuck at opacity 0 without JS',
    njOpacity.every((o) => Number(o) === 1), njOpacity.join(','));
  await njCtx.close();

  console.log('\n=== 14. Integrity guarantees absent from copy ===');
  await page.setViewportSize({ width: 1280, height: 900 });
  const banned = [
    /guaranteed\s+(sci|scopus|publication|admission|acceptance)/i,
    /100%\s*(acceptance|success)/i,
    /\bwe guarantee\b/i,
  ];
  let offending = [];
  for (const route of ROUTES) {
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(200);
    const t = await page.locator('.page[data-active="true"]').innerText();
    for (const re of banned) {
      const m = t.match(re);
      if (!m) continue;
      // Look back a short way for a negation, so "we do not sell guaranteed
      // publication" is not flagged as a promise of guaranteed publication.
      const before = t.slice(Math.max(0, m.index - 70), m.index).toLowerCase();
      if (/\b(no|not|never|cannot|without|refuse|avoid|nor|don't|do not)\b/.test(before)) continue;
      offending.push(`${route}: "${m[0]}" (context: ...${before.slice(-50)})`);
    }
  }
  check('no guarantee claims anywhere', offending.length === 0, offending.join(' | '));

  await browser.close();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) {
    console.log('\nFailures:');
    failures.forEach((f) => console.log('  - ' + f));
  }
  process.exit(fail ? 1 : 0);
})();
