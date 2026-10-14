/**
 * QA for the book ordering system.
 * Run: NODE_PATH=/home/claude/.npm-global/lib/node_modules node scripts/qa-commerce.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const FILE = 'file://' + path.join(ROOT, 'preview', 'setuvidya-preview.html');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'site.json'), 'utf8'));

let pass = 0, fail = 0; const failures = [];
const check = (n, ok, d) => {
  if (ok) { pass++; console.log(`  PASS  ${n}`); }
  else { fail++; failures.push(`${n}${d ? ' — ' + d : ''}`); console.log(`  FAIL  ${n}${d ? ' — ' + d : ''}`); }
};

const openBook = async (page, i) => {
  await page.locator('[data-buy]').nth(i).click();
  await page.waitForTimeout(180);
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  const goBooks = async () => {
    // A hash change does not reload, so cart state would survive between
    // scenarios. Force a real load.
    await page.goto(FILE + '#/book-publication');
    await page.reload();
    await page.waitForTimeout(450);
  };

  console.log('=== 1. Configuration is honest ===');
  check('no invented shipping charge', site.commerce.shipping.charge === null,
    String(site.commerce.shipping.charge));
  check('payment gateway not enabled', site.commerce.payment.enabled === false);
  check('payment marked ready-for-integration',
    site.commerce.payment.status === 'ready-for-integration', site.commerce.payment.status);
  const books = site.pages.bookPublication.portfolio.books.filter((b) => b.title);
  check('still exactly 5 books', books.length === 5, `${books.length}`);
  // Two MRPs, two discounts, one selling price.
  const PRICING = {
    'organic-chemistry': [450, 30], 'physical-chemistry': [450, 30],
    'digital-yug-bal-man': [350, 10], 'bhavnatmak-buddhimatta': [350, 10],
    'pariksha-tanav': [350, 10],
  };
  check('each book carries its own printed MRP',
    books.every((b) => b.mrp === PRICING[b.id][0]), JSON.stringify(books.map((b) => [b.id, b.mrp])));
  check('discount matches that MRP',
    books.every((b) => b.discountPercent === PRICING[b.id][1]),
    JSON.stringify(books.map((b) => b.discountPercent)));
  check('every book derives to exactly 315',
    books.every((b) => Math.round(b.mrp * (1 - b.discountPercent / 100)) === 315),
    JSON.stringify(books.map((b) => Math.round(b.mrp * (1 - b.discountPercent / 100)))));
  check('no 450 book is ever discounted at 10%',
    !books.some((b) => b.mrp === 450 && b.discountPercent === 10));
  check('selling price is derived, not stored',
    books.every((b) => b.price === null), JSON.stringify(books.map((b) => b.price)));
  check('no component hard-codes 315',
    !/\b315\b/.test(fs.readFileSync(path.join(ROOT,'components','commerce','BookCommerce.tsx'),'utf8')
      + fs.readFileSync(path.join(ROOT,'components','sections','BookPortfolio.tsx'),'utf8')));
  check('WhatsApp number comes from central config',
    /7415411642/.test((site.contact.whatsapp || '').replace(/\D/g, '')), site.contact.whatsapp);

  const src = fs.readFileSync(path.join(ROOT, 'components', 'commerce', 'BookCommerce.tsx'), 'utf8')
    + fs.readFileSync(path.join(ROOT, 'components', 'commerce', 'CartContext.tsx'), 'utf8')
    + fs.readFileSync(path.join(ROOT, 'lib', 'commerce.ts'), 'utf8')
    + fs.readFileSync(path.join(ROOT, 'app', 'api', 'orders', 'route.ts'), 'utf8');
  check('no WhatsApp number hard-coded in components', !/7415411642/.test(src));
  check('no ts suppression comments', !/@ts-ignore|@ts-expect-error/.test(src));
  check('no bare any type', !/:\s*any\b/.test(src));
  check('no fake "payment successful" anywhere',
    !/payment\s+success/i.test(src), (src.match(/payment\s+success\w*/i) || [''])[0]);
  const routeSrc = fs.readFileSync(path.join(ROOT, 'app', 'api', 'orders', 'route.ts'), 'utf8');
  check('server recomputes totals (does not read them from the body)',
    /calculateTotals\(lines\.data\)/.test(routeSrc) && !/body\.(total|subtotal)/.test(routeSrc));
  check('route can only ever set paymentStatus pending',
    /paymentStatus: 'pending'/.test(routeSrc) && !/paymentStatus:\s*'paid'/.test(routeSrc));
  check('no secret key referenced in client code', !/KEY_SECRET/.test(
    fs.readFileSync(path.join(ROOT, 'components', 'commerce', 'BookCommerce.tsx'), 'utf8')));

  console.log('\n=== 2. Book cards keep View Book and gain Buy This Book ===');
  await goBooks();
  const viewBtns = await page.locator('#published-books .bk-open').count();
  check('View Book preserved on all 5 cards', viewBtns === 5, `${viewBtns}`);
  const buyBtns = await page.locator('[data-buy]').count();
  check('Buy This Book on all 5 cards', buyBtns === 5, `${buyBtns}`);
  const nows = await page.locator('#published-books .pb-now').allInnerTexts();
  check('all five cards show ₹315', nows.length === 5 && nows.every((t) => t.trim() === '₹315'),
    nows.join(' | '));
  const mrps = await page.locator('#published-books .pb-mrp').allInnerTexts();
  check('cards show each book\'s own MRP struck through',
    JSON.stringify(mrps.map((t) => t.trim())) ===
      JSON.stringify(['₹450', '₹450', '₹350', '₹350', '₹350']), mrps.join(' | '));
  check('MRP is visually struck through',
    await page.$eval('#published-books .pb-mrp',
      (el) => getComputedStyle(el).textDecorationLine.includes('line-through')));
  const badges = await page.locator('#published-books .pb-badge').allInnerTexts();
  check('badge percentage matches each MRP',
    JSON.stringify(badges.map((t) => t.trim().replace(/\s+/g, ' '))) ===
      JSON.stringify(['30% OFF', '30% OFF', '10% OFF', '10% OFF', '10% OFF']), badges.join(' | '));
  const pairs = await page.$$eval('#published-books .bk-card',
    (els) => els.map((c) => [
      (c.querySelector('.pb-mrp') || {}).textContent?.trim(),
      (c.querySelector('.pb-badge') || {}).textContent?.trim().replace(/\s+/g, ' '),
    ]));
  check('₹450 never appears beside a 10% OFF badge',
    !pairs.some(([mrp, badge]) => mrp === '₹450' && /10%/.test(badge || '')),
    JSON.stringify(pairs));
  check('no stale "price will be available soon" on a priced book',
    !(await page.locator('#published-books').innerText())
      .includes(site.commerce.priceUnavailableLabel));

  // the existing lightbox must still work
  await page.locator('#published-books .bk-open').first().click();
  await page.waitForTimeout(300);
  check('existing View Book lightbox still opens', await page.locator('#bk-lightbox').isVisible());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  console.log('\n=== 3. Buy dialog ===');
  await openBook(page, 0);
  const panel = page.locator('#cm-panel');
  check('purchase panel opens', await panel.isVisible());
  check('panel is a modal dialog',
    (await panel.getAttribute('role')) === 'dialog' && (await panel.getAttribute('aria-modal')) === 'true');
  const buyText = await panel.innerText();
  check('shows cover, title, author, ISBN, publisher',
    (await panel.locator('.cm-buy-book img').count()) === 1 &&
    buyText.includes('Organic Chemistry') && buyText.includes('Mr. Mrityunjay Mandal') &&
    buyText.includes('978-819933139-6') && buyText.includes('SD Publication House'));
  check('shows year where available', buyText.includes('2025'));
  check('buy dialog shows ₹315 with ₹450 struck through and 30% OFF',
    buyText.includes('₹315') && buyText.includes('₹450') && /30%\s*OFF/i.test(buyText),
    buyText.replace(/\n/g, ' ').slice(0, 140));
  check('states that no payment is taken yet', /not yet enabled/i.test(buyText));
  check('has Add to Cart and Buy Now',
    (await page.locator('#cm-add').count()) === 1 && (await page.locator('#cm-buynow').count()) === 1);

  console.log('\n=== 4. Cart: add, repeat add, quantity, remove, empty ===');
  await page.locator('#cm-buy-inc').click();          // qty 2
  await page.waitForTimeout(80);
  check('buy dialog quantity stepper works',
    (await page.locator('#cm-buy-qty').innerText()) === '2');
  await page.locator('#cm-add').click();
  await page.waitForTimeout(250);
  check('adding moves to the cart', (await page.locator('#cm-title').innerText()).includes('Cart'));
  check('cart shows quantity 2',
    (await page.locator('[data-qty]').first().innerText()) === '2');

  // add the same book again
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await openBook(page, 0);
  await page.locator('#cm-add').click();
  await page.waitForTimeout(250);
  check('adding the same book increases quantity rather than duplicating',
    (await page.locator('.cm-line').count()) === 1 &&
    (await page.locator('[data-qty]').first().innerText()) === '3',
    `${await page.locator('.cm-line').count()} lines`);

  await page.locator('[data-inc]').first().click();
  await page.waitForTimeout(150);
  check('increase quantity', (await page.locator('[data-qty]').first().innerText()) === '4');
  await page.locator('[data-dec]').first().click();
  await page.waitForTimeout(150);
  check('decrease quantity', (await page.locator('[data-qty]').first().innerText()) === '3');

  // several different titles
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  await openBook(page, 1); await page.locator('#cm-add').click(); await page.waitForTimeout(200);
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  await openBook(page, 2); await page.locator('#cm-add').click(); await page.waitForTimeout(250);
  check('multiple different titles held separately',
    (await page.locator('.cm-line').count()) === 3, `${await page.locator('.cm-line').count()}`);
  check('cart count reflects total units',
    (await page.locator('#cm-title').innerText()).includes('(5)'),
    await page.locator('#cm-title').innerText());

  await page.locator('[data-remove]').first().click();
  await page.waitForTimeout(200);
  check('remove item', (await page.locator('.cm-line').count()) === 2);

  await page.locator('#cm-clear').click();
  await page.waitForTimeout(200);
  check('empty cart state shown', (await page.locator('.cm-empty').count()) === 1);
  check('empty state explains what to do',
    (await page.locator('.cm-empty').innerText()).includes(site.commerce.labels.emptyCartHint));

  console.log('\n=== 5. Cart arithmetic at ₹315 per unit ===');
  await goBooks();
  await openBook(page, 0);
  await page.locator('#cm-add').click();
  await page.waitForTimeout(250);

  const expected = ['₹315', '₹630', '₹945', '₹1,260', '₹1,575'];
  for (let q = 1; q <= 5; q++) {
    if (q > 1) { await page.locator('[data-inc]').first().click(); await page.waitForTimeout(150); }
    const t = await page.locator('.cm-totals').innerText();
    const line = await page.locator('.cm-line').first().innerText();
    check(`  ${q} book(s): subtotal ${expected[q - 1]}`,
      t.includes(expected[q - 1]), t.replace(/\n/g, ' '));
    check(`  ${q} book(s): line total ${expected[q - 1]}`,
      line.includes(expected[q - 1]), line.replace(/\n/g, ' '));
  }

  const totalsText = await page.locator('.cm-totals').innerText();
  check('shipping still unconfigured, not invented',
    /Confirmed after your request/i.test(totalsText), totalsText.replace(/\n/g, ' '));
  check('grand total withheld while shipping is unknown',
    totalsText.includes(site.commerce.totalUnavailableLabel));
  check('shipping charge still null in config', site.commerce.shipping.charge === null);

  // mixed titles: 5 x 315 across two lines
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  await openBook(page, 1); await page.locator('#cm-add').click(); await page.waitForTimeout(250);
  check('mixed cart subtotal 6 x 315 = ₹1,890',
    (await page.locator('.cm-totals').innerText()).includes('₹1,890'),
    (await page.locator('.cm-totals').innerText()).replace(/\n/g, ' '));


  console.log('\n=== 6. Checkout validation ===');
  await page.locator('#cm-checkout').click();
  await page.waitForTimeout(250);
  check('checkout form opens', (await page.locator('#cm-form').count()) === 1);
  for (const f of ['name', 'email', 'mobile', 'address', 'city', 'state', 'pin', 'country']) {
    check(`  field present: ${f}`, (await page.locator(`#cm-${f}`).count()) === 1);
  }
  const labelled = await page.$$eval('#cm-form input, #cm-form select, #cm-form textarea',
    (els) => els.every((el) => !!document.querySelector(`label[for="${el.id}"]`)));
  check('every field has a real <label for>', labelled);

  await page.locator('#cm-submit').click();
  await page.waitForTimeout(250);
  check('empty submit blocked', (await page.locator('#cm-alert').count()) === 1);
  const errCount = await page.locator('.cm-err').count();
  check('per-field errors shown', errCount >= 7, `${errCount}`);
  check('error summary takes focus',
    await page.evaluate(() => document.activeElement.id === 'cm-alert'));

  const fill = async (vals) => {
    for (const [k, v] of Object.entries(vals)) {
      const el = page.locator(`#cm-${k}`);
      if (k === 'state') await el.selectOption(v);
      else { await el.fill(''); await el.type(v); }
    }
  };
  await fill({ name: 'Test Buyer', email: 'not-an-email', mobile: '123',
    address: 'Flat 4, 12 Example Road', city: 'Gwalior', pin: '00123', country: 'India' });
  await page.locator('#cm-state').selectOption('Madhya Pradesh');
  await page.locator('#cm-submit').click();
  await page.waitForTimeout(250);
  check('invalid email rejected', (await page.locator('#cm-email-err').count()) === 1);
  check('invalid mobile rejected', (await page.locator('#cm-mobile-err').count()) === 1);
  check('invalid PIN rejected', (await page.locator('#cm-pin-err').count()) === 1);
  check('valid fields not flagged',
    (await page.locator('#cm-name-err').count()) === 0 &&
    (await page.locator('#cm-city-err').count()) === 0);

  console.log('\n=== 7. Order summary ===');
  const summary = await page.locator('.cm-summary').innerText();
  check('summary lists book, qty, unit and total columns',
    /Book/.test(summary) && /Qty/.test(summary) && /Unit/.test(summary) && /Total/.test(summary));
  check('summary shows the ordered title', summary.includes('Organic Chemistry'));
  check('summary shows the derived unit price and line total',
    summary.includes('₹315'), summary.replace(/\n/g, ' ').slice(0, 140));

  console.log('\n=== 8. WhatsApp ordering ===');
  const waHref = await page.locator('#cm-wa').getAttribute('href');
  check('WhatsApp link present at checkout', !!waHref);
  check('uses the centralized number', /wa\.me\/917415411642/.test(waHref || ''), (waHref || '').slice(0, 40));
  const decoded = decodeURIComponent((waHref || '').split('text=')[1] || '');
  check('message names the book', decoded.includes('Organic Chemistry'));
  check('message carries the quantity', /qty\s*\d/.test(decoded));
  check('message includes the customer name', decoded.includes('Test Buyer'));
  check('message quotes the line total',
    /₹315|₹630|₹945|₹1,260|₹1,575|₹1,890/.test(decoded), decoded.slice(-120));
  check('message still withholds a grand total while shipping is unconfigured',
    /Total: to be confirmed/.test(decoded), decoded.slice(-60));
  check('opens in a new tab safely',
    (await page.locator('#cm-wa').getAttribute('target')) === '_blank' &&
    /noopener/.test(await page.locator('#cm-wa').getAttribute('rel') || ''));

  console.log('\n=== 9. Order confirmation is not a payment ===');
  await fill({ email: 'buyer@example.com', mobile: '+91 98765 43210', pin: '474001' });
  await page.locator('#cm-submit').click();
  await page.waitForTimeout(350);
  const conf = await page.locator('#cm-panel').innerText();
  check('confirmation state reached', /Order request received/i.test(conf));
  check('explicitly not a completed payment', /not a completed payment/i.test(conf));
  check('never claims payment successful', !/payment successful/i.test(conf));
  check('order reference shown', /SV-BK-\d{6}-[A-Z0-9]{4}/.test(
    await page.locator('#cm-ref').innerText()));
  check('items and quantity listed',
    conf.includes('Organic Chemistry') && /×\s*\d+/.test(conf), conf.match(/×\s*\d+/) || 'no qty');
  check('next steps listed', (await page.locator('.cm-steps li').count()) >= 3);
  check('preview states nothing was actually submitted', /no backend/i.test(conf));
  check('cart emptied after submission',
    await page.evaluate(() => document.getElementById('cm-count').textContent === '0'));

  console.log('\n=== 10. Accessibility ===');
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  check('Escape closes the panel', await page.locator('#cm-overlay').isHidden());
  check('aria-live region exists for cart updates',
    (await page.locator('#cm-live').getAttribute('aria-live')) === 'polite');

  await openBook(page, 0);
  check('focus moves into the dialog on open',
    await page.evaluate(() => !!document.activeElement.closest('#cm-panel')));
  let escaped = false;
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    if (!(await page.evaluate(() => !!document.activeElement.closest('#cm-panel')))) { escaped = true; break; }
  }
  check('Tab is trapped inside the dialog', !escaped);
  await page.locator('#cm-add').click(); await page.waitForTimeout(250);
  const live = await page.locator('#cm-live').innerText();
  check('cart change announced', /added to cart/i.test(live), live);
  const qtyLabels = await page.$$eval('.cm-qty button',
    (els) => els.every((b) => (b.getAttribute('aria-label') || '').length > 10));
  check('quantity buttons have descriptive labels', qtyLabels);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  check('focus returns to the trigger after close',
    await page.evaluate(() => !!document.activeElement.hasAttribute('data-buy')));

  console.log('\n=== 11. Responsive purchase flow ===');
  for (const w of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width: w, height: 860 });
    await goBooks();
    await openBook(page, 0);
    await page.locator('#cm-add').click();
    await page.waitForTimeout(200);
    await page.locator('#cm-checkout').click();
    await page.waitForTimeout(250);
    const r = await page.evaluate(() => {
      const doc = document.documentElement;
      const p = document.getElementById('cm-panel').getBoundingClientRect();
      const visible = (b) => b.offsetParent !== null;
      // Primary controls get a full 40px; inline text actions must still clear
      // the 24px WCAG target-size minimum.
      const taps = [...document.querySelectorAll('#cm-panel .btn, #cm-panel .cm-qty button, #cm-panel .cm-close')]
        .filter(visible).every((b) => b.getBoundingClientRect().height >= 40)
        && [...document.querySelectorAll('#cm-panel .cm-remove')]
        .filter(visible).every((b) => b.getBoundingClientRect().height >= 24);
      return {
        over: doc.scrollWidth - doc.clientWidth,
        fits: p.width <= window.innerWidth + 1 && p.left >= -1,
        taps,
      };
    });
    check(`${w}px: no overflow, panel inside viewport, tap targets ≥40px`,
      r.over <= 1 && r.fits && r.taps,
      `over=${r.over} fits=${r.fits} taps=${r.taps}`);
    await page.keyboard.press('Escape');
  }

  console.log('\n=== 12. Nothing else on the page regressed ===');
  await page.setViewportSize({ width: 1280, height: 900 });
  await goBooks();
  check('SD Publication House section intact',
    await page.locator('#sd-publication-house').isVisible());
  check('book portfolio intact', (await page.locator('#published-books .bk-card').count()) === 5);
  check('no cart button until something is added',
    await page.locator('#cm-cart-btn').isHidden());
  await openBook(page, 0); await page.locator('#cm-add').click(); await page.waitForTimeout(200);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  check('floating cart button appears once the cart has items',
    await page.locator('#cm-cart-btn').isVisible());
  check('cart button reopens the cart',
    await (async () => {
      await page.locator('#cm-cart-btn').click();
      await page.waitForTimeout(200);
      return (await page.locator('#cm-title').innerText()).includes('Cart');
    })());

  check('no runtime errors', errors.length === 0, errors.slice(0, 2).join(' | '));

  await browser.close();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`COMMERCE RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('\nFailures:'); failures.forEach((f) => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})();
