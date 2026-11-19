// Eden Hub seed builder (Q, 19 Nov 2026). Turns the content files in ../content/ into the Hub's database documents.
//   node projects/eden-app/hub/seed.mjs --out <dir> [--board <board.json>] [--phones <phones.json>]
// Writes one JSON file per document under <dir>/<collection>/<doc>.json. Q or Radar then loads them with ArtifactData.
// board and phones hold live names and counts, so they are built into a scratch path and never committed.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url)), content = join(here, '..', 'content');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const out = arg('--out'); if (!out) { console.error('--out <dir> is required'); process.exit(1); }
const json = (f) => JSON.parse(readFileSync(f, 'utf8'));
const text = (f) => readFileSync(join(content, f), 'utf8');
const docs = {};

docs['content/home'] = json(join(content, 'jenny-home.json'));
docs['content/comms'] = json(join(content, 'jenny-comms.json'));
docs['content/tickets'] = json(join(content, 'jenny-tickets.json'));
docs['content/training'] = json(join(content, 'dean-training.json'));
docs['content/desk'] = json(join(content, 'dean-desk-rules.json'));
docs['content/partners'] = json(join(content, 'scout-partners.json'));
docs['content/handbook'] = { title: 'Handbook', status: 'coming', md: text('jenny-handbook-outline.md') };
docs['content/new-hire'] = { title: 'New-hire framework', status: 'draft', md: text('dean-new-hire-framework.md') };
docs['roles/current'] = json(join(here, 'seed', 'roles.json'));
docs['links/team'] = json(join(here, 'seed', 'links-team.json'));
docs['president/links'] = json(join(here, 'seed', 'links-president.json'));

if (arg('--board')) docs['board/current'] = json(arg('--board'));
if (arg('--phones')) {
  // Counts only on a team surface: the stand-up notes and the inbound/missed-call lines stay on the Round Table.
  const p = json(arg('--phones')), d = p.data || p;
  docs['phones/current'] = { ...d, notes: [], people: (d.people || []).map(({ inbound, ...x }) => x), copied_from: 'Round Table phones/current', copied_at: new Date().toISOString() };
}

// Leak sweep before anything is written: no phone runs, no pay words, and no email except the one on the president's own role entry.
const bad = [];
for (const [path, doc] of Object.entries(docs)) {
  const own = path === 'roles/current' ? (doc.people || []).filter((p) => p.role === 'president').map((p) => p.email) : [];
  const s = JSON.stringify(doc);
  const emails = (s.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi) || []).filter((e) => !own.includes(e));
  if (emails.length) bad.push(`${path}: email ${emails.length}`);
  if (/(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/.test(s)) bad.push(`${path}: phone-shaped number`);
  if (/\$\s?\d|\bsalary\b|\bSSN\b/i.test(s) && !/^board\//.test(path)) bad.push(`${path}: pay-shaped text`);
}
if (bad.length) { console.error('LEAK SWEEP FAILED\n' + bad.join('\n')); process.exit(2); }

for (const [path, doc] of Object.entries(docs)) {
  const f = join(out, path + '.json'); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(doc, null, 1));
}
console.log(Object.keys(docs).map((p) => `${p}  ${JSON.stringify(docs[p]).length} bytes`).join('\n'));
