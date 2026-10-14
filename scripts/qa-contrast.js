/**
 * Contrast audit.
 *
 * Walks every visible text node on every page, resolves its effective
 * background by climbing ancestors, and reports anything under the WCAG AA
 * threshold (4.5:1 for body text, 3:1 for large text).
 *
 * Run: NODE_PATH=/home/claude/.npm-global/lib/node_modules node scripts/qa-contrast.js
 */
const { chromium } = require('playwright');
const path = require('path');

const FILE = 'file://' + path.resolve(__dirname, '..', 'preview', 'setuvidya-preview.html');
const ROUTES = ['/', '/about', '/services', '/research-thesis', '/publication',
  '/book-publication', '/university-admission', '/contact',
  '/legal/privacy-policy', '/legal/terms', '/legal/disclaimer'];

const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const bgOf = (el) => {
    let node = el;
    let acc = null;
    while (node && node !== document.documentElement) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0) { acc = acc ? over(acc, c) : c; if (acc.a >= 0.999) break; }
      node = node.parentElement;
    }
    if (!acc || acc.a < 0.999) acc = over(acc || { r: 255, g: 255, b: 255, a: 0 }, { r: 255, g: 255, b: 255, a: 1 });
    return acc;
  };

  const results = [];
  const page = document.querySelector('.page[data-active="true"]');
  const roots = [page, document.querySelector('.header'), document.querySelector('.footer')].filter(Boolean);

  roots.forEach((root) => {
    root.querySelectorAll('*').forEach((el) => {
      const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!direct) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.1) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;

      const fgRaw = parse(cs.color);
      if (!fgRaw) return;
      const bg = bgOf(el);
      const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
      const size = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;
      const r = ratio(fg, bg);
      if (r < need) {
        results.push({
          text: el.textContent.trim().slice(0, 55),
          sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''),
          ratio: Math.round(r * 100) / 100,
          need,
          size: Math.round(size * 10) / 10,
          color: cs.color,
        });
      }
    });
  });
  return results;
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let total = 0;
  const seen = new Set();

  for (const route of ROUTES) {
    await page.goto(FILE + '#' + route);
    await page.waitForTimeout(400);
    // reveal animations start at opacity 0; force them shown so nothing is skipped
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach((el) => el.setAttribute('data-shown', 'true'));
      // disclosure panels hold real text; open them so it gets measured
      document.querySelectorAll('.rd-panel[hidden], .acc-panel[hidden]').forEach((el) => { el.hidden = false; });
    });
    await page.waitForTimeout(250);
    const res = await page.evaluate(AUDIT);
    if (res.length) {
      console.log(`\n${route}`);
      res.forEach((r) => {
        const key = r.sel + '|' + r.ratio;
        if (seen.has(key)) return;
        seen.add(key);
        total++;
        console.log(`  ${r.ratio}:1 (needs ${r.need}) ${r.size}px  ${r.sel}  ${r.color}`);
        console.log(`      "${r.text}"`);
      });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(total === 0 ? 'CONTRAST: no AA failures found' : `CONTRAST: ${total} distinct AA failures`);
  await browser.close();
  process.exit(total ? 1 : 0);
})();
