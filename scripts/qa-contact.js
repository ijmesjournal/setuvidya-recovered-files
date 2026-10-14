/**
 * QA for the central contact configuration.
 * Run: NODE_PATH=/home/claude/.npm-global/lib/node_modules node scripts/qa-contact.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const FILE = 'file://' + path.join(ROOT, 'preview', 'setuvidya-preview.html');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'site.json'), 'utf8'));

const EMAIL = 'setuvidya.edu@gmail.com';
const DIGITS = '917415411642';
const ADDRESS = ['District Centre, Janakpuri West', 'New Delhi 110058'];

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

  console.log('=== 1. Central config holds the values ===');
  const c = site.contact;
  check('email set', c.email === EMAIL, c.email);
  check('phone set', c.phone.replace(/\D/g, '') === DIGITS, c.phone);
  check('whatsapp set', c.whatsapp.replace(/\D/g, '') === DIGITS, c.whatsapp);
  check('address set', ADDRESS.every((l) => c.addressLines.includes(l)), c.addressLines.join(' / '));
  check('no placeholder left in email/phone/whatsapp/address',
    ![c.email, c.phone, c.whatsapp, ...c.addressLines].some((v) => v.trim().startsWith('[')));
  check('social config uses the four platforms',
    JSON.stringify(Object.keys(c.socialLinks)) ===
      JSON.stringify(['instagram', 'facebook', 'linkedin', 'youtube']),
    JSON.stringify(Object.keys(c.socialLinks)));
  check('Instagram configured with the official account',
    c.socialLinks.instagram === 'https://www.instagram.com/setuvidyaconsultancy/',
    c.socialLinks.instagram);
  check('Facebook configured with the official page',
    c.socialLinks.facebook === 'https://www.facebook.com/people/SetuVidya-Consultancy/61594104910205/',
    c.socialLinks.facebook);
  check('the retired Instagram handle is gone',
    !JSON.stringify(c.socialLinks).includes('setuvidya.edu2026'));
  check('no other social URL invented',
    ['linkedin', 'youtube'].every((k) => c.socialLinks[k] === ''),
    JSON.stringify(c.socialLinks));
  check('working hours configured, no placeholder',
    typeof c.hours === 'object' && Array.isArray(c.hours.schedule)
    && c.hours.schedule.length === 2, JSON.stringify(c.hours).slice(0, 60));
  check('Mon–Sat 10:00 AM – 5:00 PM',
    c.hours.schedule[0].days === 'Monday \u2013 Saturday'
    && c.hours.schedule[0].time === '10:00 AM \u2013 5:00 PM',
    `${c.hours.schedule[0].days} / ${c.hours.schedule[0].time}`);
  check('Sunday closed',
    c.hours.schedule[1].days === 'Sunday' && c.hours.schedule[1].time === 'Closed'
    && c.hours.schedule[1].closed === true);
  check('machine-readable times for structured data',
    c.hours.schedule[0].opens === '10:00' && c.hours.schedule[0].closes === '17:00'
    && c.hours.schedule[0].dayOfWeek.length === 6);

  console.log('\n=== 2. Values are not duplicated in components ===');
  const componentFiles = [];
  const walk = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(f.name)) componentFiles.push(full);
    }
  };
  walk(path.join(ROOT, 'app'));
  walk(path.join(ROOT, 'components'));
  walk(path.join(ROOT, 'lib'));

  const offenders = componentFiles.filter((f) => {
    const src = fs.readFileSync(f, 'utf8');
    return /setuvidya\.edu@gmail\.com/.test(src) || /7415411642/.test(src)
      || /Janakpuri/.test(src);
  });
  check('no contact value hard-coded in any .ts/.tsx file',
    offenders.length === 0, offenders.map((f) => path.relative(ROOT, f)).join(', '));

  const contentSrc = fs.readFileSync(path.join(ROOT, 'lib', 'content.ts'), 'utf8');
  check('a single href builder exists (contactLinks)', /export const contactLinks/.test(contentSrc));
  const commerceSrc = fs.readFileSync(path.join(ROOT, 'lib', 'commerce.ts'), 'utf8');
  check('commerce reuses the shared digit helper rather than re-deriving',
    /contactDigits\(contact\.whatsapp\)/.test(commerceSrc));

  console.log('\n=== 3. Contact page ===');
  await page.goto(FILE + '#/contact');
  await page.waitForTimeout(400);
  const contactSec = page.locator('.page[data-active="true"]');
  const text = await contactSec.innerText();
  check('email shown', text.includes(EMAIL));
  check('phone shown', text.includes('74154 11642'));
  check('whatsapp shown', text.includes('74154 11642'));
  check('address shown', ADDRESS.every((l) => text.includes(l)));

  const mailto = await contactSec.locator(`a[href="mailto:${EMAIL}"]`).count();
  check('email is a mailto link', mailto >= 1, `${mailto}`);
  const tel = await contactSec.locator(`a[href="tel:+${DIGITS}"]`).count();
  check('phone is a tel link with no spaces', tel >= 1, `${tel}`);
  const wa = await contactSec.locator(`a[href="https://wa.me/${DIGITS}"]`).count();
  check('whatsapp is a wa.me link', wa >= 1, `${wa}`);
  const waAttrs = await contactSec.locator(`a[href="https://wa.me/${DIGITS}"]`).first()
    .evaluate((a) => ({ t: a.getAttribute('target'), r: a.getAttribute('rel') }));
  check('whatsapp opens in a new tab safely',
    waAttrs.t === '_blank' && /noopener/.test(waAttrs.r || ''), JSON.stringify(waAttrs));
  check('no stale placeholder text on the contact page',
    !/\[ADD (EMAIL|PHONE|WHATSAPP|OFFICE|CITY)/i.test(text));

  console.log('\n=== 3b. Working hours ===');
  const hoursDl = contactSec.locator('dl.hrs').first();
  check('contact page shows the hours', await hoursDl.isVisible());
  check('rendered as a description list (semantic pairing)',
    await hoursDl.evaluate((el) => el.tagName === 'DL'));
  const pairs = await hoursDl.evaluate((dl) =>
    [...dl.querySelectorAll('div')].map((d) => [
      d.querySelector('dt').textContent.trim(),
      d.querySelector('dd').textContent.trim(),
    ]));
  check('two rows, correctly paired',
    JSON.stringify(pairs) === JSON.stringify([
      ['Monday \u2013 Saturday', '10:00 AM \u2013 5:00 PM'],
      ['Sunday', 'Closed'],
    ]), JSON.stringify(pairs));
  check('hours labelled',
    /working hours/i.test(await contactSec.innerText()));
  check('no leftover hours placeholder', !/\[ADD WORKING HOURS\]/i.test(await contactSec.innerText()));

  console.log('\n=== 3c. No empty error container on load ===');
  await page.goto(FILE + '#/contact');
  await page.reload();
  await page.waitForTimeout(450);
  check('error container is not in the DOM at all on first load',
    (await page.locator('#form-alert').count()) === 0,
    `${await page.locator('#form-alert').count()} found`);
  const strays = await page.evaluate(() => {
    // anything painting a red border/background while empty
    return [...document.querySelectorAll('.page[data-active="true"] *')]
      .filter((el) => {
        const cs = getComputedStyle(el);
        const red = /rgb\(254, 242, 242\)/.test(cs.backgroundColor)
          || /185, 28, 28/.test(cs.borderColor);
        return red && el.textContent.trim() === '' && el.getBoundingClientRect().height > 4;
      }).length;
  });
  check('no empty red-bordered box rendered anywhere on the contact page',
    strays === 0, `${strays} found`);
  check('form fields still present and spaced normally',
    (await page.locator('#enquiry-form .input, #enquiry-form .select, #enquiry-form .textarea').count()) >= 8);

  console.log('\n=== 3d. Error container appears only on a real error ===');
  await page.locator('#enquiry-form button[type="submit"]').click();
  await page.waitForTimeout(250);
  const alertBox = page.locator('#form-alert');
  check('error container created on invalid submit', (await alertBox.count()) === 1);
  check('it carries a real message',
    (await alertBox.innerText()).trim().length > 10, await alertBox.innerText());
  check('announced with role=alert', (await alertBox.getAttribute('role')) === 'alert');
  check('and it takes focus',
    await page.evaluate(() => document.activeElement.id === 'form-alert'));
  const errIds = await page.$$eval('#enquiry-form [aria-describedby]',
    (els) => els.map((el) => el.getAttribute('aria-describedby'))
      .every((id) => !!document.getElementById(id)));
  check('each invalid field points at a real error element', errIds);

  // fix everything and confirm the container is removed again
  await page.fill('#fullName', 'Test Scholar');
  await page.fill('#email', 'scholar@university.edu');
  await page.fill('#phone', '+91 98765 43210');
  await page.selectOption('#academicLevel', 'PhD scholar');
  await page.selectOption('#service', 'Thesis & Research');
  await page.fill('#discipline', 'Structural Engineering');
  await page.fill('#requirement', 'I need help restructuring my methodology chapter before submission.');
  await page.check('#consent');
  await page.locator('#enquiry-form button[type="submit"]').click();
  await page.waitForTimeout(250);
  check('no field-level errors remain on a valid submit',
    (await page.locator('#enquiry-form .err:not([hidden])').count()) === 0);

  console.log('\n=== 3e. CTA destinations are distinct ===');
  await page.goto(FILE + '#/');
  await page.reload();
  await page.waitForTimeout(400);
  const headerCtas = await page.$$eval('.header-cta a',
    (els) => els.map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href'),
      scroll: a.getAttribute('data-scroll') })));
  const consult = headerCtas.find((c) => /book a consultation/i.test(c.text));
  check('header carries exactly one CTA', headerCtas.length === 1,
    headerCtas.map((c) => c.text).join(' | '));
  check('the secondary "Get research assistance" CTA is gone',
    !headerCtas.some((c) => /research assistance/i.test(c.text)));
  check('Book a consultation -> contact, requirement form',
    consult && consult.href === '#/contact' && consult.scroll === 'requirement-form',
    JSON.stringify(consult));
  // Contact is not a header item; the footer carries the route.
  check('Contact is not in the main header nav',
    (await page.$$('.nav > ul > li > a[href="#/contact"]')).length === 0);
  const touch = await page.$eval('.footer .footer-touch',
    (a) => ({ text: a.textContent.trim(), href: a.getAttribute('href') }));
  check('footer "Get in Touch" -> /contact',
    /get in touch/i.test(touch.text) && touch.href === '#/contact', JSON.stringify(touch));
  check('footer still carries the contact details',
    (await page.$eval('.footer', (f) => f.innerText)).includes('setuvidya.edu@gmail.com'));

  await page.locator('.header-cta a[data-scroll="requirement-form"]').click();
  await page.waitForTimeout(700);
  check('Book a consultation lands on the contact page', page.url().includes('/contact'));
  const scrolled = await page.evaluate(() => {
    const el = document.getElementById('requirement-form');
    return el ? el.getBoundingClientRect().top < window.innerHeight * 0.5 : false;
  });
  check('and scrolls to the requirement form', scrolled);

  check('only one requirement form exists in the whole document',
    (await page.locator('#enquiry-form').count()) === 1,
    `${await page.locator('#enquiry-form').count()}`);

  console.log('\n=== 3f. Mobile navigation uses the same destinations ===');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(FILE + '#/');
  await page.reload();
  await page.waitForTimeout(450);
  await page.locator('#burger').click();
  await page.waitForTimeout(300);
  const mob = await page.$$eval('.drawer-foot a',
    (els) => els.map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href'),
      scroll: a.getAttribute('data-scroll') })));
  check('mobile: Book a consultation -> contact + requirement form',
    mob.some((c) => /book a consultation/i.test(c.text) && c.href === '#/contact'
      && c.scroll === 'requirement-form'), JSON.stringify(mob));
  check('mobile drawer carries exactly one CTA', mob.length === 1,
    mob.map((c) => c.text).join(' | '));
  await page.setViewportSize({ width: 1280, height: 900 });

  console.log('\n=== 4. Footer, on every page ===');
  const routes = ['/', '/about', '/services', '/research-thesis', '/publication',
    '/book-publication', '/university-admission', '/contact'];
  for (const route of routes) {
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(200);
    const f = page.locator('.footer');
    const ok = (await f.locator(`a[href="mailto:${EMAIL}"]`).count()) >= 1
      && (await f.locator(`a[href="tel:+${DIGITS}"]`).count()) >= 1
      && (await f.locator(`a[href="https://wa.me/${DIGITS}"]`).count()) >= 1
      && (await f.innerText()).includes('Janakpuri West');
    const hoursOk = (await f.locator('dl.hrs').count()) >= 1
      && (await f.innerText()).includes('10:00 AM \u2013 5:00 PM')
      && (await f.innerText()).includes('Closed');
    check(`${route}: footer shows email, phone, whatsapp and address`, ok);
    check(`${route}: footer shows working hours`, hoursOk);
  }

  console.log('\n=== 5. Consultation CTA routes to the contact channel ===');
  await page.goto(FILE + '#/');
  await page.waitForTimeout(300);
  const ctaHrefs = await page.$$eval('.page[data-active="true"] .cta a',
    (els) => els.map((a) => a.getAttribute('href')));
  check('closing CTA points at the contact page',
    ctaHrefs.length > 0 && ctaHrefs.every((h) => h === '#/contact'), ctaHrefs.join(', '));
  await page.locator('.page[data-active="true"] .cta a').first().click();
  await page.waitForTimeout(350);
  check('CTA reaches the contact page', page.url().includes('/contact'), page.url());
  check('and the contact page shows the real details',
    (await page.locator('.page[data-active="true"]').innerText()).includes(EMAIL));

  console.log('\n=== 6. Book ordering WhatsApp flow ===');
  await page.goto(FILE + '#/book-publication');
  await page.reload();
  await page.waitForTimeout(450);
  await page.locator('[data-buy]').first().click();
  await page.waitForTimeout(250);
  await page.locator('#cm-add').click();
  await page.waitForTimeout(300);
  const orderWa = await page.locator('#cm-wa').getAttribute('href');
  check('order WhatsApp link present', !!orderWa);
  check('uses the central number',
    (orderWa || '').startsWith(`https://wa.me/${DIGITS}?text=`), (orderWa || '').slice(0, 45));
  const msg = decodeURIComponent((orderWa || '').split('text=')[1] || '');
  check('message carries the book and quantity',
    /Organic Chemistry/.test(msg) && /qty\s*\d/.test(msg));
  check('order link opens safely',
    (await page.locator('#cm-wa').getAttribute('target')) === '_blank'
    && /noopener/.test(await page.locator('#cm-wa').getAttribute('rel') || ''));

  console.log('\n=== 7. Structured data now carries real contact points ===');
  const ld = await page.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(' '));
  // the preview does not emit JSON-LD; assert on the builder instead
  const schemaSrc = fs.readFileSync(path.join(ROOT, 'lib', 'schema.ts'), 'utf8');
  check('opening hours emitted as openingHoursSpecification',
    /openingHoursSpecification/.test(schemaSrc) && /workingHours\.schedule/.test(schemaSrc));
  check('closed days omitted from structured data rather than sent as empty',
    /filter\(\(row\) => !row\.closed/.test(schemaSrc));
  check('schema still omits values while they are placeholders',
    /isPlaceholder\(contact\.email\)/.test(schemaSrc) && /isPlaceholder\(contact\.phone\)/.test(schemaSrc));
  check('email and phone are no longer placeholders, so they will be emitted',
    !site.contact.email.startsWith('[') && !site.contact.phone.startsWith('['));
  void ld;

  console.log('\n=== 7b. Footer social icons ===');
  await page.goto(FILE + '#/');
  await page.reload();
  await page.waitForTimeout(400);
  const footer = page.locator('.footer');
  const footerHtml = await footer.evaluate((el) => el.innerHTML);

  // The old bug: the first letter of each platform name was printed as the icon.
  const letterIcons = await footer.evaluate((el) =>
    [...el.querySelectorAll('.socials a')].filter((a) => {
      const t = (a.textContent || '').trim();
      return t.length > 0 && t.length <= 2 && !a.querySelector('svg');
    }).length);
  check('no single-letter L/I/F/Y icon substitutes', letterIcons === 0, `${letterIcons}`);
  check('no dead social link pointing at "#"',
    (await footer.locator('.socials a[href="#"]').count()) === 0);
  check('no empty social buttons',
    (await footer.locator('.socials a:not(:has(svg))').count()) === 0);
  const socialLinks = await footer.locator('.socials a').evaluateAll(
    (as) => as.map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target'),
      rel: a.getAttribute('rel'), label: a.getAttribute('aria-label'), svg: !!a.querySelector('svg') })));
  check('two social icons, both configured', socialLinks.length === 2, `${socialLinks.length}`);
  const expected = {
    Instagram: 'https://www.instagram.com/setuvidyaconsultancy/',
    Facebook: 'https://www.facebook.com/people/SetuVidya-Consultancy/61594104910205/',
  };
  for (const [name, href] of Object.entries(expected)) {
    const icon = socialLinks.find((s) => new RegExp(name, 'i').test(s.label || ''));
    check(`${name} icon: official URL, new tab, safe rel, real icon`,
      !!icon && icon.href === href && icon.svg && icon.target === '_blank'
      && /noopener/.test(icon.rel || '') && /noreferrer/.test(icon.rel || ''),
      JSON.stringify(icon));
  }
  const boxes = await footer.locator('.socials a').evaluateAll((as) => as.map((a) => {
    const cs = getComputedStyle(a); const r = a.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
      border: cs.borderWidth + cs.borderColor, radius: cs.borderRadius,
      bg: cs.backgroundColor, color: cs.color };
  }));
  check('both icons meet the 44px touch target',
    boxes.every((b) => b.w >= 44 && b.h >= 44), JSON.stringify(boxes.map((b) => `${b.w}x${b.h}`)));
  check('both icons are styled identically',
    ['w', 'h', 'border', 'radius', 'bg', 'color'].every((k) => boxes[0][k] === boxes[1][k]),
    JSON.stringify(boxes));
  void footerHtml;

  console.log('\n=== 7c. Footer general ===');
  const footerText = await footer.innerText();
  check('no bracketed placeholder in the footer',
    !/\[(ADD|INSERT|YOUR|TODO)[^\]]*\]/i.test(footerText),
    (footerText.match(/\[[^\]]*\]/) || [''])[0]);
  const legalLinks = await footer.locator('a[href^="#/legal/"]')
    .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  check('all three legal links present',
    ['#/legal/privacy-policy', '#/legal/terms', '#/legal/disclaimer']
      .every((h) => legalLinks.includes(h)), legalLinks.join(', '));
  const deadFooterLinks = await footer.locator('a').evaluateAll((as) =>
    as.filter((a) => {
      const h = a.getAttribute('href') || '';
      return h === '' || h === '#';
    }).length);
  check('no footer link that goes nowhere', deadFooterLinks === 0, `${deadFooterLinks}`);

  console.log('\n=== 8. Legal pages: placeholders and claims ===');
  const LEGAL = ['/legal/privacy-policy', '/legal/terms', '/legal/disclaimer'];
  for (const route of LEGAL) {
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(250);
    const t = await page.locator('.page[data-active="true"]').innerText();
    // Unresolved template tokens must never reach a published policy.
    check(`${route}: no unresolved {{tokens}}`, !/\{\{\w+\}\}/.test(t),
      (t.match(/\{\{\w+\}\}/) || [''])[0]);
    // Any bracketed placeholder still present is a known, reported gap.
    const brackets = t.match(/\[(ADD|INSERT|YOUR|TODO)[^\]]*\]/gi) || [];
    console.log(`        ${route}: ${brackets.length} bracketed placeholder(s) still awaiting your input`);
  }

  await page.goto(FILE + '#/legal/privacy-policy');
  await page.waitForTimeout(250);
  const privText = await page.locator('.page[data-active="true"]').innerText();
  check('privacy policy names a real contact point',
    privText.includes(EMAIL) && privText.includes('Janakpuri West'));

  console.log('\n=== 9. No unnegated guarantee or affiliation claims ===');
  const ALL = ['/', '/about', '/services', '/research-thesis', '/publication',
    '/book-publication', '/university-admission', '/contact', ...LEGAL];
  const NEG = /(do not|does not|don't|never|no |cannot|can't|without|refuse|decline|nothing|claim no|not imply|wary of|warning sign|rather than)/i;
  const claimHits = [];
  for (const route of ALL) {
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(200);
    const t = (await page.locator('.page[data-active="true"]').innerText()).replace(/\s+/g, ' ');
    const re = /(guarantee\w*|assured|100%|success rate|award-winning|best-?selling|accredited|endorsed by|approved by|official partner|affiliated with|trusted by)/gi;
    let m;
    while ((m = re.exec(t)) !== null) {
      const before = t.slice(Math.max(0, m.index - 110), m.index);
      const after = t.slice(m.index, m.index + 90);
      const questionish = /\b(Can you|Will you|Are you|Do you)\b[^.?]*$/i.test(before)
        || /^guarantee\w*[^?]{0,40}\?/i.test(after);
      if (!NEG.test(before) && !NEG.test(after) && !questionish) {
        claimHits.push(`${route}: "${m[0]}"`);
      }
    }
  }
  check('every guarantee/affiliation mention is a denial or a question',
    claimHits.length === 0, claimHits.slice(0, 3).join(' | '));

  console.log('\n=== 10. No internal notes anywhere on the public site ===');
  const ALLPAGES = ['/', '/about', '/services', '/research-thesis', '/publication',
    '/book-publication', '/university-admission', '/contact',
    '/legal/privacy-policy', '/legal/terms', '/legal/disclaimer'];
  const leaks = [];
  for (const route of ALLPAGES) {
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(220);
    const t = await page.locator('.page[data-active="true"]').innerText();
    const m = t.match(/\[(ADD|INSERT|TODO|YOUR)[^\]]*\]/i);
    if (m) leaks.push(`${route}: ${m[0].slice(0, 46)}`);
    if (/Draft wording is in place|approval flag|content\/site\.json/i.test(t)) {
      leaks.push(`${route}: implementation message`);
    }
  }
  check('no bracketed placeholder or implementation message on any page',
    leaks.length === 0, leaks.join(' | '));

  check('no runtime errors', errors.length === 0, errors.slice(0, 2).join(' | '));

  await browser.close();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`CONTACT RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('\nFailures:'); failures.forEach((f) => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})();
