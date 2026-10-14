/**
 * QA for the Research Domains section on /research-thesis.
 * Run: NODE_PATH=/home/claude/.npm-global/lib/node_modules node scripts/qa-domains.js
 */
const { chromium } = require('playwright');
const path = require('path');

const FILE = 'file://' + path.resolve(__dirname, '..', 'preview', 'setuvidya-preview.html');

const CATEGORIES = [
  {
    title: 'Management, Commerce & Economics',
    subjects: ['Management', 'Business Administration', 'Commerce', 'Economics', 'Finance',
      'Marketing', 'Human Resource Management', 'Entrepreneurship', 'Banking & Financial Studies'],
    tools: ['SPSS', 'SmartPLS / PLS-SEM', 'AMOS', 'EViews', 'Stata', 'R', 'Excel'],
  },
  {
    title: 'Humanities, Languages & Social Sciences',
    subjects: ['Education', 'Hindi', 'Hindi Literature', 'English', 'English Literature',
      'Philosophy', 'History', 'Political Science', 'Sociology', 'Psychology', 'Geography',
      'Public Administration', 'Social Work', 'Library & Information Science'],
    tools: [],
  },
  {
    title: 'Science & Mathematics',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Statistics', 'Environmental Science',
      'Biotechnology', 'Microbiology', 'Botany', 'Zoology', 'Life Sciences'],
    tools: [],
  },
  {
    title: 'Technical & Applied Sciences',
    subjects: ['Computer Science', 'Information Technology', 'Data Science',
      'Artificial Intelligence', 'Engineering', 'Electronics', 'Electrical Engineering',
      'Mechanical Engineering', 'Civil Engineering', 'Biotechnology and allied sciences'],
    tools: [],
  },
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

  console.log('=== 1. Section placement ===');
  await page.goto(FILE + '#/research-thesis');
  await page.waitForTimeout(500);
  check('section exists on Research & Thesis', await page.locator('#research-domains').isVisible());
  check('title is "Research Domains"',
    (await page.locator('#research-domains h2').innerText()).trim() === 'Research Domains');
  check('subtitle matches the brief',
    (await page.locator('#research-domains .lede').innerText())
      .includes('Research support across disciplines, methodologies and academic domains'));
  const cards = await page.locator('#research-domains .rd-card').count();
  check('four domain cards', cards === 4, `found ${cards}`);

  // it must NOT have leaked into the nav
  await page.goto(FILE + '#/');
  await page.waitForTimeout(300);
  await page.locator('.has-menu[data-menu="services"] .navlink, .has-menu .navlink:text-is("Services")').click();
  await page.waitForTimeout(250);
  const menuText = await page.locator('#sv-menu-services').innerText();
  const leaked = ['Sociology', 'Botany', 'Mechanical Engineering', 'Hindi Literature']
    .filter((s) => menuText.includes(s));
  check('no subject list leaked into the Services dropdown', leaked.length === 0, leaked.join(', '));
  const menuCards = await page.locator('#sv-menu-services .mm-card').count();
  // Research Guide was added to Services, so five entries now.
  // Services now holds Book Publication and University Admission.
  check('Services dropdown shows exactly 2 entries', menuCards === 2, `found ${menuCards}`);

  console.log('\n=== 2. Card contents (collapsed state) ===');
  await page.goto(FILE + '#/research-thesis');
  await page.waitForTimeout(500);
  for (let i = 0; i < CATEGORIES.length; i++) {
    const card = page.locator('#research-domains .rd-card').nth(i);
    const cat = CATEGORIES[i];
    check(`card ${i + 1}: "${cat.title.slice(0, 28)}…"`,
      (await card.locator('h3').innerText()).trim() === cat.title,
      await card.locator('h3').innerText());
    check(`  has an icon`, await card.locator('.rd-icon svg').count() === 1);
    check(`  has an intro sentence`,
      (await card.locator('.rd-intro').innerText()).trim().length > 40);
    const chips = await card.locator('.rd-chips .rd-chip').count();
    check(`  shows subject chips`, chips >= 6, `${chips} chips`);
    check(`  has an "Explore domains" toggle`, await card.locator('.rd-toggle').isVisible());
    check(`  hidden panel is collapsed initially`, await card.locator('.rd-panel').isHidden());
    check(`  toggle reports aria-expanded=false`,
      (await card.locator('.rd-toggle').getAttribute('aria-expanded')) === 'false');
  }

  console.log('\n=== 3. Every listed subject is present after expanding ===');
  for (let i = 0; i < CATEGORIES.length; i++) {
    const card = page.locator('#research-domains .rd-card').nth(i);
    await card.locator('.rd-toggle').click();
    await page.waitForTimeout(150);
    const text = await card.innerText();
    const missing = CATEGORIES[i].subjects.filter((s) => !text.includes(s));
    check(`card ${i + 1}: all ${CATEGORIES[i].subjects.length} subjects present`,
      missing.length === 0, missing.join(', '));
    if (CATEGORIES[i].tools.length) {
      const missingTools = CATEGORIES[i].tools.filter((t) => !text.includes(t));
      check(`card ${i + 1}: all research tools present`, missingTools.length === 0, missingTools.join(', '));
    }
    check(`card ${i + 1}: panel now visible`, await card.locator('.rd-panel').isVisible());
    check(`card ${i + 1}: aria-expanded flips to true`,
      (await card.locator('.rd-toggle').getAttribute('aria-expanded')) === 'true');
    check(`card ${i + 1}: label switches to collapse text`,
      (await card.locator('.rd-toggle-text').innerText()).trim() === 'Show less',
      await card.locator('.rd-toggle-text').innerText());
  }

  console.log('\n=== 4. Collapse again ===');
  const first = page.locator('#research-domains .rd-card').nth(0);
  await first.locator('.rd-toggle').click();
  await page.waitForTimeout(150);
  check('panel collapses', await first.locator('.rd-panel').isHidden());
  check('aria-expanded back to false',
    (await first.locator('.rd-toggle').getAttribute('aria-expanded')) === 'false');
  check('label back to "Explore domains"',
    (await first.locator('.rd-toggle-text').innerText()).trim() === 'Explore domains');

  console.log('\n=== 5. Accessibility ===');
  const wiring = await page.$$eval('#research-domains .rd-toggle', (btns) =>
    btns.map((b) => {
      const id = b.getAttribute('aria-controls');
      return { hasControls: !!id, resolves: !!(id && document.getElementById(id)),
        hasExpanded: b.hasAttribute('aria-expanded'), tag: b.tagName };
    }));
  check('every toggle is a real <button>', wiring.every((w) => w.tag === 'BUTTON'));
  check('every toggle has aria-expanded', wiring.every((w) => w.hasExpanded));
  check('every aria-controls resolves to its panel', wiring.every((w) => w.hasControls && w.resolves));

  // keyboard operation
  await first.locator('.rd-toggle').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  check('opens with Enter', await first.locator('.rd-panel').isVisible());
  await page.keyboard.press('Space');
  await page.waitForTimeout(150);
  check('closes with Space', await first.locator('.rd-panel').isHidden());

  const decorative = await page.$$eval('#research-domains .rd-icon svg',
    (els) => els.every((e) => e.getAttribute('aria-hidden') === 'true'));
  check('domain icons are decorative (aria-hidden)', decorative);

  console.log('\n=== 6. Scope wording: no lab or guarantee claims ===');
  const sectionText = await page.locator('#research-domains').innerText();
  check('carries the scope note', /do not operate laboratories/i.test(sectionText));
  check('states no outcome guarantee', /guarantee research outcomes/i.test(sectionText));
  const banned = [/we conduct experiments/i, /our laborator/i, /guaranteed (results|outcome|publication)/i,
    /we perform (fieldwork|experiments)/i];
  const hits = banned.filter((r) => r.test(sectionText)).map((r) => r.source);
  check('no laboratory or guarantee claims', hits.length === 0, hits.join(' | '));

  console.log('\n=== 7. Closing CTA ===');
  check('CTA heading present',
    (await page.locator('#research-domains .rd-cta h3').innerText()).includes("Can't find your research domain?"));
  check('CTA body present',
    (await page.locator('#research-domains .rd-cta p').innerText())
      .includes('Tell us about your subject and research requirement'));
  const ctaBtn = page.locator('#research-domains .rd-cta .btn');
  check('CTA button label', (await ctaBtn.innerText()).includes('Discuss Your Research'));
  await ctaBtn.click();
  await page.waitForTimeout(400);
  check('CTA navigates to contact', page.url().includes('/contact'), page.url());

  console.log('\n=== 8. Responsive ===');
  for (const w of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(FILE + '#/research-thesis');
    await page.waitForTimeout(300);
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${w}px: no horizontal overflow`, over <= 1, `+${over}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(FILE + '#/research-thesis');
  await page.waitForTimeout(400);
  const mobCols = await page.$$eval('#research-domains .rd-grid > li',
    (lis) => new Set(lis.map((l) => Math.round(l.getBoundingClientRect().left))).size);
  check('cards stack to one column on mobile', mobCols === 1, `${mobCols} columns`);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(FILE + '#/research-thesis');
  await page.waitForTimeout(400);
  const deskGeom = await page.$$eval('#research-domains .rd-grid > li', (lis) => {
    const r = lis.map((l) => l.getBoundingClientRect());
    return { cols: new Set(r.map((b) => Math.round(b.left))).size,
      widths: new Set(r.map((b) => Math.round(b.width))).size };
  });
  check('two equal columns on desktop', deskGeom.cols === 2 && deskGeom.widths === 1,
    JSON.stringify(deskGeom));

  check('no runtime errors', errors.length === 0, errors.slice(0, 2).join(' | '));

  await browser.close();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`DOMAINS RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('\nFailures:'); failures.forEach((f) => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})();
