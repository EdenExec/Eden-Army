// Eden Hub browser test (Q, 19 Nov 2026).  node projects/eden-app/hub/test/hub-browser-test.cjs <seed dir> [shots dir]
// Loads the page with window.claude stubbed from the seed documents (seed.mjs output), at 390 / 768 / 1280, light and dark.
// Checks: no console errors, no sideways scroll, tabs by role, every control's write, the Sabbath, and a leak sweep of the rendered text.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const seedDir = process.argv[2], shots = process.argv[3] || path.join(seedDir, '..', 'shots');
if (!seedDir) { console.error('seed dir required'); process.exit(1); }
fs.mkdirSync(shots, { recursive: true });
const docs = {};
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.json')) docs[path.relative(seedDir, p).replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(p, 'utf8')); } })(seedDir);
const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}img{max-width:100%}</style></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'eden-hub.html'), 'utf8') + '</body></html>';
const BLOCKED = ['Baker', 'PB South', 'VMG', 'Moss', 'Triton', 'Megawatt', 'Hoffman', 'MK Marlow', 'Marlow', 'Sherrill', 'INL', 'Idaho National', 'CityPlace', 'Brickell', 'Hibiscus', 'Project X', 'HSI', 'Pence'];

function stub(docs, me) {
  const store = JSON.parse(JSON.stringify(docs)), subs = [], writes = [];
  window.__writes = writes; window.__store = store;
  const merge = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) merge(a[k], b[k]); else a[k] = b[k]; } return a; };
  const snap = (p) => ({ id: p.split('/').pop(), exists: p in store, data: () => store[p] ? JSON.parse(JSON.stringify(store[p])) : undefined, metadata: { fromCache: false, hasPendingWrites: false } });
  const qsnap = (c) => { const ds = Object.keys(store).filter((p) => p.startsWith(c + '/') && p.split('/').length === c.split('/').length + 1).sort().map(snap); return { docs: ds, size: ds.length, empty: !ds.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } }; };
  const fire = () => subs.forEach((s) => setTimeout(() => s.cb(s.col ? qsnap(s.path) : snap(s.path)), 0));
  const doc = (p) => ({ id: p.split('/').pop(), path: p, get: async () => snap(p),
    set: async (d) => { writes.push({ op: 'set', path: p, data: d }); store[p] = JSON.parse(JSON.stringify(d)); fire(); },
    update: async (d) => { writes.push({ op: 'update', path: p, data: d }); if (!(p in store)) throw { code: 'invalid_argument' }; merge(store[p], JSON.parse(JSON.stringify(d))); fire(); },
    delete: async () => { writes.push({ op: 'delete', path: p }); delete store[p]; fire(); },
    onSnapshot: (cb) => { const s = { path: p, cb }; subs.push(s); setTimeout(() => cb(snap(p)), 0); return () => {}; } });
  const db = { doc, collection: (c) => ({ path: c, doc: (id) => doc(c + '/' + id), onSnapshot: (cb) => { const s = { path: c, cb, col: true }; subs.push(s); setTimeout(() => cb(qsnap(c)), 0); return () => {}; }, get: async () => qsnap(c) }) };
  const user = { me: async () => me, profiles: async (ids) => { const o = {}; [].concat(ids).forEach((i) => { o[i] = { id: i, name: i === me.id ? me.name : '', avatarUrl: '', color: '#888', email: null, isMe: i === me.id, guest: false }; }); return o; }, search: async (q) => q ? [{ id: 'u_found', name: 'Found Person' }] : [] };
  window.claude = { use: async (n) => (n === 'db' ? db : n === 'user' ? user : null) };
}
const VIEWERS = {
  president: { id: 'u_kev', name: 'Kevin Williams', email: null, isOwner: true, canEdit: true },
  recruiter: { id: 'u_evan', name: 'Evan Example', email: null, isOwner: false, canEdit: false },
  bridger: { id: 'u_bridger', name: 'Bridger Example', email: null, isOwner: false, canEdit: false },
  none: { id: 'u_stranger', name: 'Pat Stranger', email: null, isOwner: false, canEdit: false },
  signedout: { id: null, name: '', email: null, isOwner: false, canEdit: false },
};
const results = []; let failed = 0;
function check(name, ok, detail) { results.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' · ' + detail : '')); if (!ok) failed++; }

(async () => {
  const browser = await chromium.launch();
  async function open(viewer, opts = {}) {
    const ctx = await browser.newContext({ viewport: { width: opts.w || 1280, height: 900 }, colorScheme: opts.dark ? 'dark' : 'light' });
    const page = await ctx.newPage(); const errs = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|net::ERR|Failed to load resource/.test(m.text())) errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push(String(e)));
    if (opts.at) await page.clock.setFixedTime(new Date(opts.at));
    await page.route('**/*', (r) => (r.request().url().startsWith('http://hub.test/') ? r.fulfill({ contentType: 'text/html', body: html }) : r.abort()));
    const d = JSON.parse(JSON.stringify(docs)); if (opts.docs) opts.docs(d);
    await page.addInitScript(stub, d); await page.addInitScript((me) => { const u = window.claude; const orig = u.use; window.__me = me; }, viewer);
    await page.addInitScript(`(${stub.toString()})(${JSON.stringify(d)}, ${JSON.stringify(viewer)})`);
    await page.goto('http://hub.test/' + (opts.hash ? '#' + opts.hash : '')); await page.waitForTimeout(250);
    return { page, errs, ctx };
  }
  const tabsOf = (page) => page.$$eval('#tabs .tab', (n) => n.map((x) => x.textContent));

  // 1. Every tab at three widths, light and dark, as the president (who sees all nine)
  const allText = {};
  for (const w of [390, 768, 1280]) for (const dark of [false, true]) {
    const { page, errs, ctx } = await open(VIEWERS.president, { w, dark });
    const tabs = await tabsOf(page); let over = [];
    for (const id of ['home', 'desk', 'recruiting', 'training', 'tickets', 'comms', 'partners', 'president', 'admin']) {
      await page.click('#tab-' + id); await page.waitForTimeout(120);
      if (id === 'tickets') { await page.selectOption('#tk-type', 'reimbursement'); await page.waitForTimeout(80); }
      await page.$$eval('details', (ds) => ds.forEach((d) => { d.open = true; }));
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      if (m.sw > m.cw + 1) over.push(id + ' ' + m.sw + '>' + m.cw);
      await page.screenshot({ path: path.join(shots, `${id}-${w}-${dark ? 'dark' : 'light'}.png`), fullPage: true });
      if (w === 1280 && !dark) allText[id] = await page.innerText('body');
    }
    check(`width ${w} ${dark ? 'dark' : 'light'}: 9 tabs, no console errors, no sideways scroll`, tabs.length === 9 && !errs.length && !over.length, [tabs.length + ' tabs', errs.join(' | '), over.join(', ')].filter(Boolean).join(' · '));
    if (w === 390 && dark) { const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor); check('dark mode paints the dark floor', bg === 'rgb(18, 18, 16)', bg); }
    await ctx.close();
  }

  // 2. Tabs by role
  for (const [who, want] of [['recruiter', 'Home,My Desk,Recruiting,Training,Tickets,Comms'], ['none', 'Home,Training'], ['signedout', 'Home,Training']]) {
    const { page, errs, ctx } = await open(VIEWERS[who]); const t = (await tabsOf(page)).join(',');
    check(`role ${who}: tabs`, t === want && !errs.length, t + (errs.length ? ' · ' + errs.join('|') : ''));
    if (who === 'recruiter') { const txt = await page.innerText('body'); check('recruiter never sees the President links or drafts', !/Command Center|Cash Pulse|Draft · only Kev/.test(txt)); }
    if (who === 'none') { await page.goto('http://hub.test/#president'); await page.waitForTimeout(200); check('not-listed viewer cannot reach #president', (await page.$eval('.tab[aria-selected="true"]', (n) => n.textContent)) === 'Home'); }
    await ctx.close();
  }
  { const { page, ctx } = await open({ id: 'u_p', name: 'Pat Partner', email: null, isOwner: false, canEdit: false }, { docs: (d) => d['roles/current'].people.push({ key: 'p', name: 'Pat Partner', role: 'partner' }) });
    const t = (await tabsOf(page)).join(','); await page.click('#tab-partners'); await page.waitForTimeout(100); const txt = await page.innerText('body');
    const hit = BLOCKED.filter((n) => new RegExp('(?<![A-Za-z])' + n + '(?![A-Za-z])', 'i').test(txt));
    check('role partner: Home, Training, Partners only; 16 roles; client-blind', t === 'Home,Training,Partners' && (txt.match(/EPG-\d{3}/g) || []).length >= 16 && !hit.length, t + ' · blocked names found: ' + (hit.join(',') || 'none'));
    await page.click('#tab-home'); const home = await page.innerText('body'); check('partner Home has no leaderboard', !/Leaderboard/i.test(home)); await ctx.close(); }
  { const { page, ctx } = await open(VIEWERS.bridger); await page.click('#tab-desk'); await page.waitForTimeout(100); check('Bridger sees the interns’ scorecards tile', /Interns. scorecards/i.test(await page.innerText('body')));
    const r = await open(VIEWERS.recruiter); await r.page.click('#tab-desk'); await r.page.waitForTimeout(100); check('another recruiter does not', !/Interns. scorecards/i.test(await r.page.innerText('body'))); await ctx.close(); await r.ctx.close(); }

  // 3. Controls and what they write (recruiter)
  { const { page, errs, ctx } = await open(VIEWERS.recruiter); const W = () => page.evaluate(() => window.__writes);
    await page.click('#tab-desk'); await page.fill('#task-new', 'Call three supers'); await page.click('button:has-text("Add")'); await page.waitForTimeout(150);
    let w = await W(); check('task add writes the private desk doc', w.length === 1 && w[0].path === 'data/users/u_evan/desk' && w[0].op === 'set', JSON.stringify(w[0]).slice(0, 120));
    await page.check('.task input'); await page.waitForTimeout(150); w = await W(); check('task tick updates done and collapses', w[1].op === 'update' && /"done":true/.test(JSON.stringify(w[1])) && /Done · 1/i.test(await page.innerText('body')));
    const desk = await page.innerText('body'); const pace = /RP PACE\s*\n?\s*([\d.]+)/i.exec(desk); check('JO check-out shows pace and limit', !!pace && /JO LIMIT/i.test(desk), pace ? 'pace ' + pace[1] : desk.slice(0, 200));
    const opt = await page.$eval('#jo-pick option:nth-child(2)', (o) => o.value); await page.selectOption('#jo-pick', opt); await page.click('button:has-text("Check out")'); await page.waitForTimeout(150);
    w = await W(); const co = w.filter((x) => x.path === 'checkouts/u_evan'); check('check-out writes checkouts/<me> only', co.length === 1 && !w.some((x) => /crelate/i.test(x.path)), co.length + ' write');
    await page.click('text=Finished'); await page.waitForTimeout(150); w = await W(); check('finish marks done_at', /done_at":"20/.test(JSON.stringify(w[w.length - 1])));
    await page.click('#tab-tickets'); await page.selectOption('#tk-type', 'leads'); await page.waitForTimeout(80); await page.fill('#tk-f0', 'Supers, data centers'); await page.fill('#tk-f2', '40'); await page.click('text=File ticket'); await page.waitForTimeout(150);
    w = await W(); const tk = w.filter((x) => x.path === 'tickets/u_evan'); check('ticket files to tickets/<me> with status open', tk.length === 1 && /"status":"open"/.test(JSON.stringify(tk[0])) && /Leads request/.test(await page.innerText('body')), JSON.stringify(tk[0] || '').slice(0, 160));
    check('recruiter has no all-tickets queue', !/The queue · everyone/i.test(await page.innerText('body')));
    await page.click('#tab-comms'); await page.click('.chanlist >> text=Wins'); await page.fill('#post-new', 'First start of the quarter.'); await page.click('button:has-text("Post")'); await page.waitForTimeout(150);
    w = await W(); const po = w.filter((x) => x.path === 'posts/u_evan'); check('post writes posts/<me> and shows', po.length === 1 && /First start of the quarter/.test(await page.innerText('body')));
    await page.click('.chanlist >> text=Announcements'); await page.waitForTimeout(80); check('announcements are read-only for a recruiter', !(await page.$('#post-new')));
    check('controls run: no console errors', !errs.length, errs.join('|')); await ctx.close(); }

  // 4. President: settings save, view-as, announcement publish, ticket queue
  { const { page, errs, ctx } = await open(VIEWERS.president, { docs: (d) => { d['tickets/u_evan'] = { items: { 't-1': { type: 'leads', type_name: 'Leads request', fields: { Region: 'Boise' }, status: 'open', at: '2026-11-19T08:00:00Z' } } }; } });
    const W = () => page.evaluate(() => window.__writes); await page.waitForTimeout(100);
    let w = await W(); check('owner id is claimed once on first visit', w.length === 1 && w[0].path === 'roles/current' && w[0].data.owner_id === 'u_kev');
    check('president sees draft announcements marked', /Draft · only Kev sees this/i.test(await page.innerText('body')));
    await page.click('text=Publish >> nth=0'); await page.waitForTimeout(150); w = await W(); check('publish writes content/home', w[w.length - 1].path === 'content/home');
    await page.click('#tab-tickets'); await page.waitForTimeout(100); check('president sees the whole queue', /The queue · everyone/i.test(await page.innerText('body')) && /Boise/.test(await page.innerText('body')));
    await page.click('text=Picked up'); await page.waitForTimeout(150); w = await W(); check('picked up writes status to that person’s ticket doc', w[w.length - 1].path === 'tickets/u_evan' && /picked/.test(JSON.stringify(w[w.length - 1])));
    await page.click('#tab-admin'); await page.click('text=Add a person'); await page.waitForTimeout(80); const inputs = await page.$$('input[id^="rl-name-"]'); await inputs[inputs.length - 1].fill('Sam Intern'); const sels = await page.$$('select[id^="rl-role-"]'); await sels[sels.length - 1].selectOption('intern'); await page.click('text=Save roles'); await page.waitForTimeout(150);
    w = await W(); const rs = w[w.length - 1]; check('save roles writes roles/current with the new person and no new emails', rs.path === 'roles/current' && rs.op === 'set' && rs.data.people.length === 8 && rs.data.people.filter((p) => p.email).length === 1, rs.data.people.map((p) => p.name + ':' + p.role).join(', '));
    await page.selectOption('#view-as', 'recruiter'); await page.waitForTimeout(100); check('view as recruiter shows six tabs', (await tabsOf(page)).length === 6);
    check('president run: no console errors', !errs.length, errs.join('|')); await ctx.close(); }

  // 5. The Sabbath (Boise sunset on Fri 20 Nov 2026 is about 5:15pm MST = 00:15Z Sat)
  for (const [label, at, rest] of [['Fri 3:00pm MT, before sunset', '2026-11-20T22:00:00Z', false], ['Fri 6:00pm MT, after sunset', '2026-11-21T01:00:00Z', true], ['Sat noon MT', '2026-11-21T19:00:00Z', true], ['Sat 6:00pm MT, after sunset', '2026-11-22T01:00:00Z', false]]) {
    const { page, errs, ctx } = await open(VIEWERS.president, { at, w: 390 }); const txt = await page.innerText('body'); const resting = /The Hub rests/.test(txt), tabs = (await tabsOf(page)).length;
    check('Sabbath · ' + label + ': ' + (rest ? 'rests' : 'open'), resting === rest && (rest ? tabs === 0 && !/Leaderboard/i.test(txt) : tabs === 9) && !errs.length, (resting ? 'resting' : 'open') + ', ' + tabs + ' tabs');
    if (rest && label.startsWith('Fri')) { await page.screenshot({ path: path.join(shots, 'sabbath-390-light.png'), fullPage: true }); const d = await open(VIEWERS.president, { at, w: 1280, dark: true }); await d.page.screenshot({ path: path.join(shots, 'sabbath-1280-dark.png'), fullPage: true }); await d.ctx.close(); }
    await ctx.close();
  }

  // 6. Leak sweep: rendered text of every tab, and the page source
  const text = Object.values(allText).join('\n'), src = fs.readFileSync(path.join(__dirname, '..', 'eden-hub.html'), 'utf8');
  const phone = /(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/;
  check('leak sweep · rendered: no phone-shaped numbers', !phone.test(text));
  check('leak sweep · rendered: no email addresses', !/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(text));
  check('leak sweep · rendered: no pay, age or health words', !/\$\s?\d|\bsalary\b|\bcomp(ensation)?\b|\bage \d|\bbirthday\b|\bSSN\b|\bdiagnos/i.test(text), (text.match(/\$\s?\d[^\n]{0,30}|\bsalary\b[^\n]{0,30}|\bcomp\b[^\n]{0,30}/i) || [''])[0]);
  check('leak sweep · source: no emails, phones, artifact links or names in the page file', !/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(src) && !phone.test(src) && !/claude\.ai\/artifact/.test(src) && !/Evan|Bridger|Andrew|Noah/.test(src));
  const ptxt = allText.partners || ''; const hit = BLOCKED.filter((n) => new RegExp('(?<![A-Za-z])' + n + '(?![A-Za-z])', 'i').test(ptxt));
  check('leak sweep · Partners tab is client-blind', !hit.length, hit.join(','));

  await browser.close();
  console.log(results.join('\n')); console.log(failed ? `\nFAIL (${failed} of ${results.length})` : `\nPASS (${results.length} checks)`); process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
