/**
 * Accessibility audit.
 *
 * axe-core is not installable here (npm registry returns 403), so these are
 * hand-written checks over the same ground axe covers for this kind of site,
 * plus a real accessibility-tree snapshot from Chromium — which is the closest
 * available stand-in for what a screen reader would announce.
 *
 * Run: NODE_PATH=/home/claude/.npm-global/lib/node_modules node scripts/qa-a11y.js
 */
const { chromium } = require('playwright');
const path = require('path');

const FILE = 'file://' + path.resolve(__dirname, '..', 'preview', 'setuvidya-preview.html');
const ROUTES = ['/', '/about', '/services', '/research-thesis', '/publication',
  '/book-publication', '/university-admission', '/contact',
  '/legal/privacy-policy', '/legal/terms', '/legal/disclaimer'];

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; failures.push(`${name}${detail ? ' — ' + detail : ''}`); console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}

const AUDIT = () => {
  const out = {};
  const active = document.querySelector('.page[data-active="true"]');
  const scope = [active, document.querySelector('.header'), document.querySelector('.footer')].filter(Boolean);
  const all = (sel) => scope.flatMap((r) => [...r.querySelectorAll(sel)]);

  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return !el.closest('[hidden]');
  };

  // --- accessible name resolution (simplified but faithful for this markup)
  const accName = (el) => {
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').trim();
    const lb = el.getAttribute('aria-labelledby');
    if (lb) {
      const t = lb.split(/\s+/).map((id) => (document.getElementById(id) || {}).textContent || '').join(' ');
      if (t.trim()) return t.trim();
    }
    if (el.id) {
      const lab = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lab && lab.textContent.trim()) return lab.textContent.trim();
    }
    const wrap = el.closest('label');
    if (wrap && wrap.textContent.trim()) return wrap.textContent.trim();
    if (el.title) return el.title.trim();
    const txt = (el.textContent || '').trim();
    if (txt) return txt;
    const img = el.querySelector('img[alt]');
    if (img && img.alt.trim()) return img.alt.trim();
    return '';
  };

  // 1. images
  out.imagesMissingAlt = all('img').filter((i) => i.getAttribute('alt') === null)
    .map((i) => i.src.slice(-40));

  // 2. svgs: either exposed with a name, or hidden
  out.svgsUnlabelled = all('svg').filter((s) => {
    if (s.getAttribute('aria-hidden') === 'true') return false;
    if (s.closest('[aria-hidden="true"]')) return false;
    const named = s.getAttribute('aria-label') || s.querySelector('title');
    return !named;
  }).map((s) => (s.getAttribute('class') || '') + ' ' + (s.parentElement.className || ''));

  // 3. form controls need names
  out.controlsUnnamed = all('input, select, textarea')
    .filter((el) => el.type !== 'hidden' && visible(el))
    .filter((el) => !accName(el))
    .map((el) => el.tagName.toLowerCase() + '#' + (el.id || '?'));

  // 4. buttons and links need names
  out.buttonsUnnamed = all('button, a[href]')
    .filter(visible)
    .filter((el) => !accName(el))
    .map((el) => el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : ''));

  // 5. focusables inside aria-hidden — announced as absent but reachable by Tab
  out.hiddenFocusables = all('[aria-hidden="true"]')
    .flatMap((h) => [...h.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')])
    .filter((el) => el.getAttribute('tabindex') !== '-1')
    .map((el) => el.tagName.toLowerCase());

  // 6. duplicate ids anywhere in the document
  const ids = {};
  document.querySelectorAll('[id]').forEach((el) => { ids[el.id] = (ids[el.id] || 0) + 1; });
  out.duplicateIds = Object.entries(ids).filter(([, n]) => n > 1).map(([id, n]) => `${id} x${n}`);

  // 7. ARIA references must resolve
  out.danglingRefs = [];
  ['aria-controls', 'aria-labelledby', 'aria-describedby'].forEach((attr) => {
    document.querySelectorAll(`[${attr}]`).forEach((el) => {
      el.getAttribute(attr).split(/\s+/).filter(Boolean).forEach((id) => {
        if (!document.getElementById(id)) out.danglingRefs.push(`${attr}="${id}"`);
      });
    });
  });

  // 8. positive tabindex breaks natural order
  out.positiveTabindex = all('[tabindex]')
    .filter((el) => parseInt(el.getAttribute('tabindex'), 10) > 0)
    .map((el) => el.tagName.toLowerCase());

  // 9. list semantics
  out.badLists = all('ul, ol')
    .filter((l) => [...l.children].some((c) => !['LI', 'SCRIPT', 'TEMPLATE'].includes(c.tagName)))
    .map((l) => l.className || l.tagName);

  // 10. generic link text
  const generic = /^(click here|here|read more|more|learn more|link|this)$/i;
  out.genericLinks = all('a[href]').filter(visible)
    .filter((a) => generic.test(accName(a))).map((a) => accName(a));

  // 11. multiple navs must be distinguishable
  const navs = [...document.querySelectorAll('nav')].filter(visible);
  out.navsUnlabelled = navs.length > 1
    ? navs.filter((n) => !n.getAttribute('aria-label') && !n.getAttribute('aria-labelledby')).length
    : 0;

  // 12. landmarks
  out.landmarks = {
    main: document.querySelectorAll('main').length,
    header: document.querySelectorAll('body > header, body > div > header').length,
    footer: document.querySelectorAll('footer').length,
  };

  // 13. skip link target exists
  const skip = document.querySelector('a.skip');
  out.skipOk = !!(skip && document.getElementById(skip.getAttribute('href').slice(1)));

  // 14. hidden accordion panels must not hold tabbable content
  out.tabbableInHiddenPanels = all('.acc-panel[hidden] a[href], .acc-panel[hidden] button').length;

  // 15. every accordion button exposes state
  out.accordionNoState = all('.acc-btn').filter((b) => !b.hasAttribute('aria-expanded')).length;

  // 16. accessible name of accordion buttons matches the visible question
  out.accordionNameMismatch = all('.acc-btn').filter((b) => {
    const q = (b.querySelector('span') || {}).textContent || '';
    return q.trim() && !accName(b).includes(q.trim());
  }).length;

  return out;
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('=== A. Per-page structural / ARIA checks ===');
  for (const route of ROUTES) {
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(300);
    const r = await page.evaluate(AUDIT);
    const problems = [];
    if (r.imagesMissingAlt.length) problems.push(`img without alt: ${r.imagesMissingAlt.join(',')}`);
    if (r.svgsUnlabelled.length) problems.push(`svg neither labelled nor hidden: ${r.svgsUnlabelled.slice(0, 3).join(' | ')}`);
    if (r.controlsUnnamed.length) problems.push(`unnamed controls: ${r.controlsUnnamed.join(',')}`);
    if (r.buttonsUnnamed.length) problems.push(`unnamed button/link: ${r.buttonsUnnamed.join(',')}`);
    if (r.hiddenFocusables.length) problems.push(`focusable inside aria-hidden: ${r.hiddenFocusables.join(',')}`);
    if (r.duplicateIds.length) problems.push(`duplicate ids: ${r.duplicateIds.join(',')}`);
    if (r.danglingRefs.length) problems.push(`dangling aria refs: ${[...new Set(r.danglingRefs)].join(',')}`);
    if (r.positiveTabindex.length) problems.push(`positive tabindex: ${r.positiveTabindex.join(',')}`);
    if (r.badLists.length) problems.push(`non-li in list: ${r.badLists.slice(0, 3).join(',')}`);
    if (r.genericLinks.length) problems.push(`generic link text: ${r.genericLinks.join(',')}`);
    if (r.navsUnlabelled) problems.push(`${r.navsUnlabelled} nav landmarks share no label`);
    if (r.landmarks.main !== 1) problems.push(`main landmarks: ${r.landmarks.main}`);
    if (!r.skipOk) problems.push('skip link target missing');
    if (r.tabbableInHiddenPanels) problems.push(`${r.tabbableInHiddenPanels} tabbable nodes in collapsed panels`);
    if (r.accordionNoState) problems.push(`${r.accordionNoState} accordion buttons without aria-expanded`);
    if (r.accordionNameMismatch) problems.push(`${r.accordionNameMismatch} accordion names differ from visible text`);
    check(`${route}`, problems.length === 0, problems.join(' ; '));
  }

  console.log('\n=== B. Document-level ===');
  await page.goto(FILE + '#/');
  await page.waitForTimeout(300);
  const lang = await page.getAttribute('html', 'lang');
  check('html lang set', !!lang && /^[a-z]{2}(-[A-Z]{2})?$/.test(lang), lang || '(none)');
  const title = await page.title();
  check('document has a title', title.length > 10, title);

  console.log('\n=== C. Accessibility tree (what a screen reader walks) ===');
  // interestingOnly:true prunes landmark containers, which is exactly what we
  // are trying to assert here, so walk the full tree.
  const snap = await page.accessibility.snapshot({ interestingOnly: false });
  const roles = [];
  (function walk(n) { if (!n) return; roles.push(n.role); (n.children || []).forEach(walk); })(snap);
  const counts = roles.reduce((a, r) => ((a[r] = (a[r] || 0) + 1), a), {});
  check('banner landmark exposed', !!counts.banner, JSON.stringify(Object.keys(counts)));
  check('main landmark exposed', !!counts.main);
  check('contentinfo landmark exposed', !!counts.contentinfo);
  check('navigation landmarks exposed', (counts.navigation || 0) >= 2, `found ${counts.navigation || 0}`);
  check('heading nodes exposed', (counts.heading || 0) >= 8, `found ${counts.heading || 0}`);

  // the h1 must be the first heading a screen reader meets inside main
  const firstHeading = await page.evaluate(() => {
    const m = document.querySelector('main .page[data-active="true"]');
    const h = m.querySelector('h1,h2,h3,h4');
    return h ? h.tagName : null;
  });
  check('first heading inside main is the h1', firstHeading === 'H1', firstHeading || '(none)');

  console.log('\n=== D. Form: errors announced, not just coloured ===');
  await page.goto(FILE + '#/contact');
  await page.waitForTimeout(300);
  await page.locator('#enquiry-form button[type="submit"]').click();
  await page.waitForTimeout(250);
  const alertRole = await page.getAttribute('#form-alert', 'role');
  check('error summary has role=alert', alertRole === 'alert', alertRole || '(none)');
  const described = await page.evaluate(() => {
    const el = document.getElementById('fullName');
    const id = el.getAttribute('aria-describedby');
    return { invalid: el.getAttribute('aria-invalid'), described: id, resolves: !!(id && document.getElementById(id)) };
  });
  check('invalid field marked aria-invalid', described.invalid === 'true');
  check('field points at its error message', !!described.described, described.described || '(none)');
  check('that error message element exists', described.resolves,
    described.resolves ? '' : `aria-describedby="${described.described}" does not resolve`);

  console.log('\n=== E. Reflow at 200% zoom (WCAG 1.4.10) ===');
  // 1280 CSS px at 200% is equivalent to a 640px viewport
  for (const w of [640, 480]) {
    await page.setViewportSize({ width: w, height: 900 });
    let worst = null;
    for (const route of ROUTES) {
      await page.goto(FILE + '#' + route);
      await page.waitForTimeout(200);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1) worst = { route, over };
    }
    check(`${w}px equivalent: no horizontal scroll`, !worst, worst ? `${worst.route} +${worst.over}px` : '');
  }

  console.log('\n=== F. Keyboard reachability of every nav destination ===');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(FILE + '#/');
  await page.waitForTimeout(300);
  const reachable = await page.evaluate(() => {
    // Scope to the visible page. The preview holds every route in one
    // document, and getComputedStyle on a descendant of a display:none
    // ancestor still reports its own display, so an unscoped query counts
    // links on all 33 pages.
    const active = document.querySelector('.page[data-active="true"]') || document;
    const chrome = [document.querySelector('.header'), document.querySelector('.footer')]
      .filter(Boolean);
    const stops = [...chrome, active]
      .flatMap((root) => [...root.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')])
      .filter((el) => el.getAttribute('tabindex') !== '-1')
      .filter((el) => {
        const cs = getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
      });
    return stops.length;
  });
  check('page exposes a sensible number of tab stops', reachable > 20 && reachable < 300, `${reachable}`);

  await browser.close();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`A11Y RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('\nFailures:'); failures.forEach((f) => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})();
