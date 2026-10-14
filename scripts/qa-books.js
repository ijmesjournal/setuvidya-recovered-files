/**
 * QA for the "Selected published books" portfolio.
 * Run: NODE_PATH=/home/claude/.npm-global/lib/node_modules node scripts/qa-books.js
 */
const { chromium } = require('playwright');
const path = require('path');

const FILE = 'file://' + path.resolve(__dirname, '..', 'preview', 'setuvidya-preview.html');
const EXPECTED = [
  { title: 'Organic Chemistry', author: 'Mr. Mrityunjay Mandal', isbn: '978-819933139-6' },
  { title: 'Physical Chemistry', author: 'Mr. Mrityunjay Mandal', isbn: '978-93-49653-47-4' },
  { title: 'डिजिटल युग', author: 'Dr. Shikha Jain', isbn: '978-819933134-1' },
  { title: 'भावनात्मक बुद्धिमत्ता', author: 'Dr. Shikha Jain', isbn: '978-819933130-3' },
  { title: 'परीक्षा तनाव', author: 'Dr. Shikha Jain', isbn: '978-819933137-2' },
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
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|net::ERR_|fonts\.googleapis/i.test(m.text())) errors.push(m.text());
  });

  console.log('=== 1. Home "Explore book publication" reaches the page ===');
  await page.goto(FILE + '#/');
  await page.waitForTimeout(400);
  const cardText = await page.locator('.svc-card').nth(2).innerText();
  check('third services card is Book publication', /book publication/i.test(cardText), cardText.split('\n')[0]);
  await page.locator('.svc-card').nth(2).click({ position: { x: 40, y: 200 } });
  await page.waitForTimeout(400);
  check('clicking the card body navigates', page.url().includes('/book-publication'), page.url());

  await page.goto(FILE + '#/');
  await page.waitForTimeout(300);
  await page.locator('.svc-card a[href="#/book-publication"]').first().click();
  await page.waitForTimeout(400);
  check('clicking the card heading navigates', page.url().includes('/book-publication'), page.url());

  console.log('\n=== 2. Portfolio section and cards ===');
  await page.goto(FILE + '#/book-publication');
  await page.waitForTimeout(500);
  check('section present', await page.locator('#published-books').isVisible());
  const n = await page.locator('#published-books .bk-card').count();
  check('exactly 5 book cards (slots 6–10 render nothing)', n === 5, `found ${n}`);

  const sectionText = await page.locator('#published-books').innerText();
  for (const b of EXPECTED) {
    check(`card shows "${b.title.slice(0, 22)}"`, sectionText.includes(b.title));
    check(`  ISBN ${b.isbn} shown`, sectionText.includes(b.isbn));
  }
  check('author Mr. Mrityunjay Mandal shown', sectionText.includes('Mr. Mrityunjay Mandal'));
  check('co-author Abhilash Kumar Jain shown', sectionText.includes('Abhilash Kumar Jain'));
  check('publisher SD Publication House shown', sectionText.includes('SD Publication House'));

  console.log('\n=== 3. Cover images actually decode ===');
  const imgState = await page.$$eval('#published-books .bk-open img', (els) =>
    els.map((i) => ({ w: i.naturalWidth, h: i.naturalHeight, alt: (i.alt || '').length })));
  check('all 5 covers decoded with real pixels',
    imgState.length === 5 && imgState.every((i) => i.w > 100 && i.h > 100),
    JSON.stringify(imgState.map((i) => `${i.w}x${i.h}`)));
  check('every cover has descriptive alt text', imgState.every((i) => i.alt > 20));

  console.log('\n=== 4. View Book lightbox ===');
  await page.locator('.bk-open').first().click();
  await page.waitForTimeout(400);
  check('lightbox opens', await page.locator('#bk-lightbox').isVisible());
  check('dialog role + modal', (await page.getAttribute('.bk-dialog', 'role')) === 'dialog'
    && (await page.getAttribute('.bk-dialog', 'aria-modal')) === 'true');
  check('title matches book 1', (await page.locator('#bk-title').innerText()).includes('Organic Chemistry'));
  const frontSrc = await page.getAttribute('#bk-img', 'src');
  const frontDims = await page.$eval('#bk-img', (i) => `${i.naturalWidth}x${i.naturalHeight}`);
  check('front image decoded in modal', !/^0x/.test(frontDims), frontDims);

  console.log('\n=== 5. Front / back switch ===');
  check('front tab selected by default',
    (await page.getAttribute('.bk-tab[data-side="front"]', 'aria-selected')) === 'true');
  await page.locator('.bk-tab[data-side="back"]').click();
  await page.waitForTimeout(400);
  const backSrc = await page.getAttribute('#bk-img', 'src');
  check('back tab becomes selected',
    (await page.getAttribute('.bk-tab[data-side="back"]', 'aria-selected')) === 'true');
  check('back image differs from front', backSrc !== frontSrc);
  const backDims = await page.$eval('#bk-img', (i) => `${i.naturalWidth}x${i.naturalHeight}`);
  check('back image decoded', !/^0x/.test(backDims), backDims);
  const backAlt = await page.getAttribute('#bk-img', 'alt');
  check('back image has its own alt', /author|Author/.test(backAlt || ''), (backAlt || '').slice(0, 50));

  console.log('\n=== 6. Previous / Next across all five ===');
  await page.locator('.bk-tab[data-side="front"]').click();
  const seen = [];
  for (let i = 0; i < 5; i++) {
    seen.push(await page.locator('#bk-title').innerText());
    await page.locator('#bk-next').click();
    await page.waitForTimeout(250);
  }
  check('Next walks all 5 distinct titles', new Set(seen).size === 5, seen.join(' | ').slice(0, 90));
  check('Next wraps back to the first', (await page.locator('#bk-title').innerText()) === seen[0]);
  check('counter reads "1 of 5"', (await page.locator('#bk-count').innerText()) === '1 of 5',
    await page.locator('#bk-count').innerText());
  await page.locator('#bk-prev').click();
  await page.waitForTimeout(250);
  check('Previous wraps to the last', (await page.locator('#bk-title').innerText()) === seen[4]);
  check('switching book resets to the front cover',
    (await page.getAttribute('.bk-tab[data-side="front"]', 'aria-selected')) === 'true');

  console.log('\n=== 7. Keyboard ===');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  check('ArrowRight advances', (await page.locator('#bk-title').innerText()) === seen[0]);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(250);
  check('ArrowLeft goes back', (await page.locator('#bk-title').innerText()) === seen[4]);

  // focus trap: tab many times, focus must stay inside the dialog
  let escaped = false;
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() =>
      !!document.activeElement.closest('.bk-dialog'));
    if (!inside) { escaped = true; break; }
  }
  check('Tab stays trapped inside the dialog', !escaped);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('Escape closes the lightbox', await page.locator('#bk-lightbox').isHidden());
  const refocused = await page.evaluate(() => document.activeElement.className);
  check('focus returns to the trigger', /bk-open/.test(refocused), refocused);
  check('body scroll restored', (await page.evaluate(() => document.body.style.overflow)) !== 'hidden');

  console.log('\n=== 8. Open by keyboard, close by scrim ===');
  await page.locator('.bk-open').nth(2).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(350);
  check('Enter on a card opens the lightbox', await page.locator('#bk-lightbox').isVisible());
  check('opens the card that was focused',
    (await page.locator('#bk-title').innerText()).includes('डिजिटल'),
    await page.locator('#bk-title').innerText());
  await page.locator('.bk-scrim').click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(300);
  check('clicking the scrim closes', await page.locator('#bk-lightbox').isHidden());

  console.log('\n=== 9. Mobile ===');
  for (const w of [320, 375, 390, 430, 768]) {
    await page.setViewportSize({ width: w, height: 844 });
    await page.goto(FILE + '#/book-publication');
    await page.waitForTimeout(400);
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${w}px: no horizontal overflow`, over <= 1, `+${over}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(FILE + '#/book-publication');
  await page.waitForTimeout(400);
  const cols = await page.$$eval('#published-books .bk-grid > li', (lis) =>
    new Set(lis.map((l) => Math.round(l.getBoundingClientRect().left))).size);
  check('cards stack to one column on mobile', cols === 1, `${cols} columns`);
  await page.locator('.bk-open').first().click();
  await page.waitForTimeout(400);
  const fits = await page.evaluate(() => {
    const d = document.querySelector('.bk-dialog').getBoundingClientRect();
    return d.width <= window.innerWidth && d.height <= window.innerHeight + 1;
  });
  check('lightbox fits inside a 390px viewport', fits);
  await page.keyboard.press('Escape');

  console.log('\n=== 10. No runtime errors ===');
  check('no page errors during the whole run', errors.length === 0, errors.slice(0, 2).join(' | '));

  await browser.close();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`BOOKS RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('\nFailures:'); failures.forEach((f) => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})();
