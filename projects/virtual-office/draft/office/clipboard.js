/* Command Center · clipboard.js (phase 2 of Marlowe's flow, 4 Nov 2026). One running list per agent, as `Clip`.
   Pure functions, no page state, so a test can load this file in node. The desk sheet (desks.js) draws it.
   A bullet (collection `clipboard`, one doc each): {agent, project, line, why, state: now|next|kev|parked|done, rank, detail, links, notes:[{at,by,text}], ticketIds, touchedAt, doneAt, digestWeek}.
   Order: waiting on Kev pins to the top, then now, then next; inside a state by the agent's rank (1 = most impactful), ties to the most recently touched. */
var Clip = (function () {
  var STATES = ['kev', 'now', 'next', 'parked', 'done'], ORDER = { kev: 0, now: 1, next: 2 }, SHOWN_CAP = 5, LOOSE_CAP = 3, PARK_DAYS = 7, DAY = 86400000;
  function ms(v) { var n = v ? new Date(v).getTime() : 0; return isNaN(n) ? 0 : n; }
  function words(s, n) { var w = String(s || '').trim().split(/\s+/).filter(Boolean); return w.length > n ? w.slice(0, n).join(' ') + '…' : w.join(' '); }
  function live(b) { return !!b && (b.state === 'kev' || b.state === 'now' || b.state === 'next'); }
  function cmp(x, y) {
    return (ORDER[x.state] - ORDER[y.state]) || ((x.rank == null ? 999 : x.rank) - (y.rank == null ? 999 : y.rank)) || (ms(y.touchedAt) - ms(x.touchedAt)) || String(x.line).localeCompare(String(y.line));
  }
  /* The agent's live bullets, in the order Kev reads them. */
  function ordered(bullets, agent) { return (bullets || []).filter(function (b) { return live(b) && (!agent || b.agent === agent); }).sort(cmp); }
  /* A desk's clipboard: top `cap` bullets shown (waiting-on-Kev bullets always shown, even past the cap), the rest counted. */
  function clipboard(bullets, agent, cap) {
    var all = ordered(bullets, agent), c = cap == null ? SHOWN_CAP : cap, shown = [];
    all.forEach(function (b) { if (b.state === 'kev' || shown.length < c) shown.push(b); });
    return { shown: shown, more: all.length - shown.length, kev: all.filter(function (b) { return b.state === 'kev'; }).length,
      parked: (bullets || []).filter(function (b) { return b.state === 'parked' && (!agent || b.agent === agent); }).length };
  }
  /* The quiet log: done bullets, newest first. Hidden unless Kev asks. */
  function doneLog(bullets, agent, limit) {
    return (bullets || []).filter(function (b) { return b.state === 'done' && (!agent || b.agent === agent); }).sort(function (x, y) { return ms(y.doneAt) - ms(x.doneAt); }).slice(0, limit || 20);
  }
  /* Projects above bullets: each project with its live bullets (agent order); a project without a next step is stalled; loose bullets are capped at 3 under "Other". */
  function byProject(bullets, agent, projects) {
    var mine = ordered(bullets, agent), seen = {}, rows = [];
    (projects || []).forEach(function (p) {
      var bs = mine.filter(function (b) { return b.project === p.id; }); seen[p.id] = true;
      if (!bs.length && !p.next) return;
      rows.push({ id: p.id, title: p.title, status: p.status || '', next: p.next || '', stalled: !p.next, bullets: bs, kev: bs.filter(function (b) { return b.state === 'kev'; }).length });
    });
    rows.sort(function (x, y) { return (y.kev > 0) - (x.kev > 0) || (x.stalled - y.stalled) || (y.bullets.length - x.bullets.length) || String(x.title).localeCompare(String(y.title)); });
    var loose = mine.filter(function (b) { return !b.project || !seen[b.project]; });
    return { projects: rows, loose: loose.slice(0, LOOSE_CAP), looseMore: Math.max(0, loose.length - LOOSE_CAP) };
  }
  /* Bullets the agent should park on its tidy pass: untouched for 7 days and not waiting on Kev. */
  function toPark(bullets, now) { return (bullets || []).filter(function (b) { return (b.state === 'now' || b.state === 'next') && now - ms(b.touchedAt) > PARK_DAYS * DAY; }); }
  /* Caps Radar checks hourly: returns the problems (empty list = fine). Lines over 10 words, desks over 5 live non-Kev bullets. */
  function capProblems(bullets) {
    var out = [], per = {};
    (bullets || []).filter(live).forEach(function (b) {
      if (String(b.line || '').trim().split(/\s+/).length > 10) out.push(b.agent + ': "' + words(b.line, 6) + '" is over 10 words');
      if (b.state !== 'kev') per[b.agent] = (per[b.agent] || 0) + 1;
    });
    Object.keys(per).forEach(function (k) { if (per[k] > 12) out.push(k + ' has ' + per[k] + ' live bullets; park or merge down'); });
    return out;
  }
  /* Kev's note on a bullet: one action doc per bullet, `clip-<id>-note`; the text holds every note since the agent last answered. */
  function noteKey(id) { return 'clip-' + id + '-note'; }
  function noteDoc(bullet, text, prior, nowIso) {
    var t = String(text || '').trim().slice(0, 400); if (!t) return null;
    var pending = prior && prior.applied === false && prior.text ? prior.text + '\n' + t : t;
    return { key: noteKey(bullet.id), agent: bullet.agent, title: words(bullet.line, 8), action: 'clipnote', bullet: bullet.id, text: pending.slice(-800), at: nowIso, by: 'kev', applied: false };
  }
  /* The note thread shown under a bullet: the agent's saved notes, then Kev's pending one. */
  function thread(bullet, action) {
    var n = (bullet.notes || []).slice(-3).map(function (x) { return { at: x.at, by: x.by, text: x.text }; });
    if (action && action.applied === false && action.text) n.push({ at: action.at, by: 'kev', text: action.text, pending: true });
    return n;
  }
  return { STATES: STATES, SHOWN_CAP: SHOWN_CAP, LOOSE_CAP: LOOSE_CAP, PARK_DAYS: PARK_DAYS, ordered: ordered, clipboard: clipboard, doneLog: doneLog, byProject: byProject, toPark: toPark, capProblems: capProblems, noteKey: noteKey, noteDoc: noteDoc, thread: thread, words: words };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Clip;
