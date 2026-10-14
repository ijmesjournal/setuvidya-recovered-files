/**
 * QA for "Understanding Your Thesis" on /research-thesis.
 * Run: NODE_PATH=/home/claude/.npm-global/lib/node_modules node scripts/qa-anatomy.js
 */
const { chromium } = require('playwright');
const path = require('path');

const FILE = 'file://' + path.resolve(__dirname, '..', 'preview', 'setuvidya-preview.html');

const CHAPTERS = [
  { n: '01', title: 'Introduction',
    must: ['research problem', 'significance', 'research gap', 'objectives', 'Scope'] },
  { n: '02', title: 'Literature Review', tag: 'LOR',
    must: ['synthesises previous research', 'theories', 'research gap'] },
  { n: '03', title: 'Research Methodology',
    must: ['Research design', 'sampling technique', 'Variables', 'Data sources', 'Research instruments'],
    tools: ['SPSS', 'SmartPLS / PLS-SEM', 'AMOS', 'EViews', 'R', 'Stata', 'Excel'] },
  { n: '04', title: 'Results & Analysis',
    must: ['Descriptive statistics', 'Reliability and validity', 'Correlation', 'Regression',
      'Hypothesis testing', 'Factor analysis', 'PLS-SEM', 'Tables and figures', 'thematic analysis'] },
  { n: '05', title: 'Discussion',
    must: ['interprets the findings', 'objectives', 'previous studies', 'implications'] },
  { n: '06', title: 'Conclusion',
    must: ['major findings', 'contribution', 'Limitations', 'future research'] },
  { n: '07', title: 'References — APA 7th Edition',
    must: ['APA 7th Edition'],
    examples: ['Journal article', 'Book', 'Journal article with a DOI'] },
];

let pass = 0, fail = 0; const failures = [];
const check = (n, ok, d) => {
  if (ok) { pass++; console.log(`  PASS  ${n}`); }
  else { fail++; failures.push(`${n}${d ? ' — ' + d : ''}`); console.log(`  FAIL  ${n}${d ? ' — ' + d : ''}`); }
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  console.log('=== 1. Section, title, subtitle ===');
  await page.goto(FILE + '#/research-thesis');
  await page.waitForTimeout(500);
  const sec = page.locator('#understanding-your-thesis');
  check('section exists on Research & Thesis', await sec.isVisible());
  check('title is "Understanding Your Thesis"',
    (await sec.locator('h2').innerText()).trim() === 'Understanding Your Thesis');
  check('subtitle matches the brief',
    (await sec.locator('.lede').innerText())
      .includes('key stages of a structured research project'));
  const count = await sec.locator('.ta-item').count();
  check('seven chapters', count === 7, `found ${count}`);

  // must not appear elsewhere
  for (const route of ['/', '/services', '/publication']) {
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(250);
    check(`not added to ${route}`,
      (await page.locator('.page[data-active="true"] #understanding-your-thesis').count()) === 0);
  }

  console.log('\n=== 2. Numbering, titles and collapsed state ===');
  await page.goto(FILE + '#/research-thesis');
  await page.waitForTimeout(500);
  const nums = await sec.locator('.ta-num').allInnerTexts();
  check('numbered 01–07 in order',
    JSON.stringify(nums.map((s) => s.trim())) === JSON.stringify(CHAPTERS.map((c) => c.n)),
    nums.join(','));
  const titles = await sec.locator('.ta-title').allInnerTexts();
  check('chapter titles in order',
    JSON.stringify(titles.map((s) => s.trim())) === JSON.stringify(CHAPTERS.map((c) => c.title)),
    titles.join(' | '));
  check('Literature Review carries the LOR label',
    (await sec.locator('.ta-item').nth(1).locator('.ta-tag').innerText()).trim() === 'LOR');

  const openAtStart = await sec.locator('.ta-item[data-open]').count();
  check('exactly one chapter open initially', openAtStart === 1, `${openAtStart} open`);
  const hiddenPanels = await sec.locator('.ta-panel[hidden]').count();
  check('the other six panels are collapsed', hiddenPanels === 6, `${hiddenPanels} hidden`);

  console.log('\n=== 3. Content of each chapter ===');
  for (let i = 0; i < CHAPTERS.length; i++) {
    const item = sec.locator('.ta-item').nth(i);
    const btn = item.locator('.ta-btn');
    if ((await item.getAttribute('data-open')) === null) {
      await btn.click();
      await page.waitForTimeout(120);
    }
    const text = await item.innerText();
    const textCI = text.toLowerCase();
    const c = CHAPTERS[i];
    const missing = c.must.filter((m) => !textCI.includes(m.toLowerCase()));
    check(`${c.n} ${c.title.slice(0, 26)}: key content present`, missing.length === 0, missing.join(', '));
    if (c.tools) {
      const missingTools = c.tools.filter((t) => !textCI.includes(t.toLowerCase()));
      check(`${c.n}: all analysis tools listed`, missingTools.length === 0, missingTools.join(', '));
    }
    if (c.examples) {
      const missingEx = c.examples.filter((x) => !textCI.includes(x.toLowerCase()));
      check(`${c.n}: three APA examples present`, missingEx.length === 0, missingEx.join(', '));
      const exCount = await item.locator('.ta-ex').count();
      check(`${c.n}: examples rendered as blocks`, exCount === 3, `${exCount} blocks`);
    }
  }

  console.log('\n=== 4. Single-open behaviour (matches the FAQ pattern) ===');
  const openNow = await sec.locator('.ta-item[data-open]').count();
  check('still only one open after clicking through all seven', openNow === 1, `${openNow} open`);
  const last = sec.locator('.ta-item').nth(6);
  check('the last one clicked is the open one', (await last.getAttribute('data-open')) !== null);
  await last.locator('.ta-btn').click();
  await page.waitForTimeout(120);
  check('clicking an open chapter closes it',
    (await sec.locator('.ta-item[data-open]').count()) === 0);

  console.log('\n=== 5. Accessibility ===');
  const wiring = await page.$$eval('#understanding-your-thesis .ta-btn', (btns) =>
    btns.map((b) => {
      const pid = b.getAttribute('aria-controls');
      const panel = pid && document.getElementById(pid);
      return {
        tag: b.tagName,
        hasExpanded: b.hasAttribute('aria-expanded'),
        resolves: !!panel,
        region: panel ? panel.getAttribute('role') : null,
        labelled: panel ? panel.getAttribute('aria-labelledby') === b.id : false,
      };
    }));
  check('every toggle is a real <button>', wiring.every((w) => w.tag === 'BUTTON'));
  check('every toggle has aria-expanded', wiring.every((w) => w.hasExpanded));
  check('every aria-controls resolves', wiring.every((w) => w.resolves));
  check('every panel is a labelled region',
    wiring.every((w) => w.region === 'region' && w.labelled));

  const headings = await page.$$eval('#understanding-your-thesis .ta-item > h3',
    (els) => els.length);
  check('each chapter title is a heading', headings === 7, `${headings} h3s`);

  const firstBtn = sec.locator('.ta-btn').first();
  await firstBtn.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  check('opens with Enter', (await sec.locator('.ta-item').first().getAttribute('data-open')) !== null);
  await page.keyboard.press('Space');
  await page.waitForTimeout(120);
  check('closes with Space', (await sec.locator('.ta-item').first().getAttribute('data-open')) === null);

  console.log('\n=== 6. APA examples are templates, not fabricated sources ===');
  await sec.locator('.ta-item').nth(6).locator('.ta-btn').click();
  await page.waitForTimeout(150);
  const refText = await sec.locator('.ta-item').nth(6).innerText();
  check('uses placeholder authors', /Author, A\. A\./.test(refText));
  check('uses a placeholder DOI', /https:\/\/doi\.org\/xx\.xxxx/.test(refText));
  check('states they are templates, not real publications',
    /formatting templates, not real publications/i.test(refText));
  // a fabricated source would carry a real-looking year and named journal
  check('no concrete year like (2021) presented as a real source',
    !/\((19|20)\d{2}\)/.test(refText), (refText.match(/\((19|20)\d{2}\)/) || [''])[0]);

  console.log('\n=== 7. CTA ===');
  check('CTA heading', (await sec.locator('.ta-cta h3').innerText()).includes('Need guidance with your research?'));
  check('CTA body', (await sec.locator('.ta-cta p').innerText())
    .includes('From research design to thesis preparation'));
  const ctaBtn = sec.locator('.ta-cta .btn');
  check('CTA button label', (await ctaBtn.innerText()).includes('Book a Consultation'));
  await ctaBtn.click();
  await page.waitForTimeout(400);
  check('CTA navigates to contact', page.url().includes('/contact'), page.url());

  console.log('\n=== 8. Responsive ===');
  for (const w of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(FILE + '#/research-thesis');
    await page.waitForTimeout(250);
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${w}px: no horizontal overflow`, over <= 1, `+${over}px`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(FILE + '#/research-thesis');
  await page.waitForTimeout(400);
  // open every chapter on mobile and confirm nothing spills sideways
  const btns = sec.locator('.ta-btn');
  for (let i = 0; i < 7; i++) {
    await btns.nth(i).click();
    await page.waitForTimeout(100);
  }
  const overMobile = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('390px: no overflow with a chapter expanded', overMobile <= 1, `+${overMobile}px`);
  const tapTargets = await page.$$eval('#understanding-your-thesis .ta-btn',
    (els) => els.every((e) => e.getBoundingClientRect().height >= 44));
  check('toggles meet the 44px touch-target guideline', tapTargets);

  check('no runtime errors', errors.length === 0, errors.slice(0, 2).join(' | '));

  await browser.close();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`ANATOMY RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('\nFailures:'); failures.forEach((f) => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})();
