// Command Center · floor.js (split from eden-office.html, 30 Oct 2026). The Floor: the board, the line, records, banner taps, zones and desks, focus, tools, flow and notes drawing.
// Panel files share the page's global scope and load in this order: core.js, floor.js, pulse.js, strip.js, family.js, desks.js, today.js, boot.js. Edit here, not in the html.
'use strict';
  /* a board count is a door: scroll to the line and put focus on the ticket it counts */
  function goBoard(sel) {
    var line = $('#line'), card = sel && sel !== '#line' ? $(sel) : $('#tks .tk'), smooth = !reduced.matches && !root.classList.contains('still');
    (card || line).scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: card ? 'center' : 'start' });
    line.classList.remove('ping'); void line.offsetWidth; line.classList.add('ping'); setTimeout(function () { line.classList.remove('ping'); }, 1300);
    if (card) { card.classList.add('ping'); setTimeout(function () { card.classList.remove('ping'); }, 1600); try { card.focus({ preventScroll: true }); } catch (e) { card.focus(); } }
  }
  var lastPts = null;
  function renderBoard() {
    var d = derived(), g = d.game, grid = $('#board-grid'), note = $('#board-note'), sb = $('#b-sync');
    sb.textContent = syncText(); sb.className = 'sync' + (syncWarn() ? ' warn' : '');
    grid.textContent = '';
    if (g.sabbath) {
      var nx = Game.addRunnerMinutes(Date.now(), 0), sw = Game.sabbathWindow(Date.now());
      grid.appendChild(h('div', { class: 'board-rest', style: 'grid-column:1/-1' }, h('b', { text: 'Sabbath · the board rests' }), h('span', { class: 's', style: 'font:500 11px/1.5 var(--mono);color:var(--bd-mute)', text: 'Friday sunset to Saturday sunset: nothing is counted. The streak holds at ' + g.streak + '. The Sabbath ends at sundown, ' + clockLabel(sw.end) + ' Saturday; the runner is back ' + new Date(nx).toLocaleDateString('en-US', { weekday: 'long' }) + ' at ' + clockLabel(nx) + '.' })));
      note.textContent = 'Open tickets are still listed below, in full.'; $('#lb').hidden = true; lastPts = null; return;
    }
    $('#lb').hidden = false;
    var wk = g.week, lw = g.lastWeek, day = g.day, openWait = 0;
    vals(S.tickets).forEach(function (x) { if (x.status === 'open' && !ticketHidden(x)) openWait++; });
    var pts = cell('Points today', day.points, 'Week ' + wk.points + ' · last week ' + lw.points, 'pts');
    if (lastPts !== null && day.points > lastPts) pts.className += ' bump';
    lastPts = day.points; grid.appendChild(pts);
    grid.appendChild(cell('Closed today', day.closed, "Kev's moves: " + (day.kev + day.qc)));
    grid.appendChild(cell('Open now', g.openNow, openWait + ' waiting for pickup', '', null, g.openNow ? '#line' : null));
    var o = g.oldest, oc = '', sec = 0, who = '—';
    if (o) { sec = waitedSec(t(o.createdAt), Date.now()); who = (S.share && sensitiveAgent(o.agent) ? 'Private desk' : nameOf(o.agent)) + ' · filed ' + clockLabel(t(o.createdAt)); oc = sec > 60 * 60 ? 'bad' : sec > 45 * 60 ? 'warn' : ''; }
    var oc2 = cell('Oldest waiting', o ? hms(sec) : '—', o ? who + (Game.isRunnerTime(Date.now()) ? '' : ' · clock paused') : 'Nothing waiting', oc, 'b-oldest', o && !(S.share && sensitiveAgent(o.agent)) ? '.tk[data-tk="' + o.id + '"]' : null);
    if (o) oc2.querySelector('.v').setAttribute('data-from', String(t(o.createdAt)));
    grid.appendChild(oc2);
    grid.appendChild(cell('FAILs today', day.fails, day.fails ? '−3 each · picked up after 60 min' : 'Ticket open past 60 min', day.fails ? 'bad' : '', null, $('#tks .tk.fail') || Object.keys(d.sla).some(function (k) { return d.sla[k].state === 'fail'; }) ? '.tk.fail' : null));
    var mp = g.medianPickupMin;
    grid.appendChild(cell('Median pickup', mp == null ? '—' : Math.round(mp), 'minutes, this week · goal under 60', ''));
    grid.appendChild(cell('Streak', g.streak, 'working days, no FAIL'));
    note.textContent = 'Closed 3 (today) or 2 · +1 picked up within 60 min · +2 closed the day it was filed · Kev’s moves +2 · FAIL −3. The clock runs 6am to 10pm PT, Sunday to Friday.';
    renderLeaders(d);
  }
  function renderLeaders(d) {
    var g = d.game, body = $('#lb-body'); body.textContent = '';
    var rows = g.agents.filter(function (r) { return !(S.share && sensitiveAgent(r.agent)); }).map(function (r) { return { name: nameOf(r.agent), closed: r.closed, med: r.medianCloseMin, fails: r.fails, pts: r.points }; });
    rows.push({ name: 'Kev', closed: g.kev.moves, med: null, fails: 0, pts: g.kev.points, kev: true });
    rows.sort(function (a, b) { return (b.pts - a.pts) || (b.closed - a.closed); });
    var left = h('div'); left.appendChild(h('h3', { text: 'Leaderboard · this week' }));
    var tb = h('table', { class: 'golf' }); tb.appendChild(h('tr', null, h('th', { text: 'Pos' }), h('th', { text: 'Player' }), h('th', { class: 'n', text: 'Closed' }), h('th', { class: 'n', text: 'Med' }), h('th', { class: 'n', text: 'Fail' }), h('th', { class: 'n', text: 'Pts' })));
    rows.forEach(function (r, i) {
      var tie = rows.some(function (x, j) { return j !== i && x.pts === r.pts; }), first = rows.map(function (x) { return x.pts; }).indexOf(r.pts) + 1;
      tb.appendChild(h('tr', { class: r.pts < 0 ? 'neg' : '' }, h('td', { class: 'pos', text: (tie ? 'T' : '') + first }), h('td', { class: 'nm', text: r.name }), h('td', { class: 'n', text: String(r.closed) + (r.kev ? (r.closed === 1 ? ' move' : ' moves') : '') }), h('td', { class: 'n', text: r.med == null ? '–' : Game.fmtWait(r.med) }), h('td', { class: 'n', text: String(r.fails) }), h('td', { class: 'n', text: String(r.pts) })));
    });
    tb.appendChild(h('tr', { class: 'us' }, h('td'), h('td', { class: 'nm', text: 'Us' }), h('td', { class: 'n', text: String(g.week.closed) }), h('td', { class: 'n', text: '' }), h('td', { class: 'n', text: String(g.week.fails) }), h('td', { class: 'n', text: String(g.week.points) })));
    left.appendChild(h('div', { class: 'scroll' }, tb)); body.appendChild(left);
    var recBlock = recruiterBlock(); body.className = 'lb-body' + (recBlock ? ' has-rec' : '');
    if (recBlock) body.appendChild(recBlock);
    var r = d.rec, right = h('div', { class: 'lb-recs' }); right.appendChild(h('h3', { text: 'Course records' }));
    var dl = h('dl', { class: 'recs' });
    dl.appendChild(h('dt', { text: 'Most closed in a day' })); dl.appendChild(h('dd', { text: r.mostClosedDay.n ? r.mostClosedDay.n + ' · ' + dateLabel(r.mostClosedDay.date) : '—' }));
    dl.appendChild(h('dt', { text: 'Best week' })); dl.appendChild(h('dd', { text: r.bestWeek.points > 0 ? r.bestWeek.points + ' pts · week of ' + dateLabel(r.bestWeek.weekOf) : '—' }));
    dl.appendChild(h('dt', { text: 'Longest streak' })); dl.appendChild(h('dd', { text: r.longestStreak.days ? r.longestStreak.days + ' working days' : '—' }));
    right.appendChild(dl);
    right.appendChild(h('h3', { text: 'This week and last' }));
    var wt = h('table'); wt.appendChild(h('tr', null, h('th', { text: '' }), h('th', { class: 'n', text: 'Pts' }), h('th', { class: 'n', text: 'Closed' }), h('th', { class: 'n', text: 'Fails' })));
    [['This week', g.week], ['Last week', g.lastWeek]].forEach(function (x) { wt.appendChild(h('tr', null, h('td', { text: x[0] }), h('td', { text: String(x[1].points) }), h('td', { text: String(x[1].closed) }), h('td', { text: String(x[1].fails) }))); });
    right.appendChild(wt); body.appendChild(right);
  }

  /* ---------- Recruiters · Crelate · this week (Kev, 28 Oct) ----------
     Reads meta/crelate, written by the hourly office run from one read-only Crelate pull (workshop/core/recruiter-board.ts).
     Counts and first names only. Hidden whole under Screen share: it is a name-by-name pace table. */
  var REC_TZ = 'America/Los_Angeles';
  function ptStamp(iso) {
    var d = new Date(iso); if (isNaN(d)) return 'unknown time';
    return recDay(d) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: REC_TZ }) + ' PT';
  }
  function recDay(d) { var o = {}; new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', timeZone: REC_TZ }).formatToParts(d).forEach(function (p) { o[p.type] = p.value; }); return o.weekday + ' ' + o.day + ' ' + o.month; }
  function ptDay(ymd) { var a = ymd.split('-'); return recDay(new Date(Date.UTC(+a[0], +a[1] - 1, +a[2], 19))); }   // 19:00Z is noon Pacific in daylight time and 11am in standard: the same calendar day either way
  function recRank(rows) {                   // sorted by RPs; ties share a place, shown with a T
    var by = rows.slice().sort(function (a, b) { return (b.week.rps - a.week.rps) || (a.name < b.name ? -1 : 1); });
    by.forEach(function (r) { r.place = by.map(function (x) { return x.week.rps; }).indexOf(r.week.rps) + 1; r.tie = by.some(function (x) { return x !== r && x.week.rps === r.week.rps; }); });
    return by;
  }
  function recFresh(c) {                     // what to say about the data's age: never "fresh" over an old file
    var ageMs = Date.now() - t(c.asOf), old = ageMs > 3 * HOUR;
    return { text: ago(c.asOf), warn: c.live === false || old || c.weekIsCurrent === false };
  }
  function recruiterBlock() {
    if (S.share) return null;
    var box = h('div', { class: 'lb-rec' }), c = S.crelate;
    box.appendChild(h('h3', { text: 'Recruiters · Crelate · this week' }));
    if (!c || !c.recruiters) { box.appendChild(h('p', { class: 'small', text: S.live ? 'Waiting for the office run to write the Crelate counts (meta/crelate). Crelate stays the system of record.' : 'Example data.' })); return box; }
    var rows = recRank(c.recruiters.map(function (r) { return Object.assign({}, r); }));
    var tb = h('table', { class: 'golf' });
    tb.appendChild(h('tr', null, h('th', { text: 'Pos' }), h('th', { text: 'Recruiter' }), h('th', { class: 'n', text: 'RPs / std' }), h('th', { class: 'n', text: 'PTC' }), h('th', { class: 'n', text: 'Sub' }), h('th', { class: 'n', text: 'FTI' })));
    function std(r) { return r.standardToDate == null ? '–' : String(r.standardToDate); }
    rows.forEach(function (r) {
      var tr = h('tr', { class: 'rec-row' + (r.behind ? ' behind' : ''), 'data-card': 'rec:' + r.name, role: 'button', tabindex: '0', 'aria-label': r.name + ': ' + r.week.rps + ' RPs against ' + std(r) + ' due' + (r.behind ? ', behind pace' : '') + '. Open today and this week.' });
      var nm = h('td', { class: 'nm' }); if (r.behind) nm.appendChild(h('span', { class: 'mk', title: 'Behind pace by ' + (-r.gap) + ' RPs' })); nm.appendChild(document.createTextNode(r.name)); if (r.behind) nm.appendChild(h('span', { class: 'vh', text: ' behind pace' }));
      tr.appendChild(h('td', { class: 'pos', text: (r.tie ? 'T' : '') + r.place })); tr.appendChild(nm);
      tr.appendChild(h('td', { class: 'n rp' }, h('b', { text: String(r.week.rps) }), h('span', { class: 'std', text: ' / ' + std(r) })));
      tr.appendChild(h('td', { class: 'n', text: String(r.week.ptcs) })); tr.appendChild(h('td', { class: 'n', text: String(r.week.subs) })); tr.appendChild(h('td', { class: 'n', text: String(r.week.ftis) }));
      tb.appendChild(tr);
    });
    var tm = c.team, us = h('tr', { class: 'us rec-row', 'data-card': 'rec:__team', role: 'button', tabindex: '0', 'aria-label': 'Team total: ' + tm.week.rps + ' RPs against ' + tm.standardToDate + ' due. Open today and this week.' });
    us.appendChild(h('td')); us.appendChild(h('td', { class: 'nm', text: 'Team' }));
    us.appendChild(h('td', { class: 'n rp' }, h('b', { text: String(tm.week.rps) }), h('span', { class: 'std', text: ' / ' + tm.standardToDate })));
    us.appendChild(h('td', { class: 'n', text: String(tm.week.ptcs) })); us.appendChild(h('td', { class: 'n', text: String(tm.week.subs) })); us.appendChild(h('td', { class: 'n', text: String(tm.week.ftis) }));
    tb.appendChild(us);
    box.appendChild(h('div', { class: 'scroll' }, tb));
    var f = recFresh(c);
    box.appendChild(h('p', { class: 'small gap', text: 'As of ' + ptStamp(c.asOf) + ' (' + f.text + ') · ' + ('Crelate, read-only' + (c.example ? ' · example figures' : c.live === false ? ' · saved board file, not a live pull' : '')) + ' · week of ' + ptDay(c.weekOf) }));
    if (f.warn && !c.example) box.appendChild(h('p', { class: 'small gap warn', text: c.weekIsCurrent === false ? 'These are the week of ' + ptDay(c.weekOf) + ', not this week: the office run has had no live Crelate read since ' + ptDay(c.through) + '.' : c.live === false ? 'Not a live read: the last Crelate pull saved in the repo. It refreshes the next time the office run has its Crelate key.' : 'The Crelate read is ' + f.text + ': the hourly run may be stalled.' }));
    box.appendChild(h('p', { class: 'small gap', text: 'Standard ' + (c.perDay || 15) + ' RPs a day, Monday to Friday, each day’s due by noon PT. Red = behind that pace. Tap a row for today against the week.' }));
    return box;
  }

  /* the line: every ticket that is not closed, in full */
  function ageSpec(tk) {      // what the card's clock measures
    if (tk.status === 'open') return { from: t(tk.createdAt), kind: 'wait', label: 'waiting ' };
    if (tk.status === 'picked' || tk.status === 'working') return { from: t(tk.pickedAt || tk.updatedAt || tk.createdAt), kind: 'wait', label: 'on it ' };
    return { from: t(tk.updatedAt || tk.createdAt), kind: 'wall', label: 'since ' };
  }
  function ageText(sp, now) { return sp.label + Game.fmtWait(sp.kind === 'wait' ? Game.runnerMinutes(sp.from, now) : (now - sp.from) / MIN); }
  function tkTop(tk, st, light) {
    var sp = ageSpec(tk), age = h('span', { class: 'tk-age', text: ageText(sp, Date.now()) }); age.setAttribute('data-from', String(sp.from)); age.setAttribute('data-kind', sp.kind); age.setAttribute('data-label', sp.label);
    return h('span', { class: 'tk-top' }, led(light, true), h('span', { class: 'tk-who', text: nameOf(tk.agent) }), st !== 'ok' ? h('span', { class: 'tag ' + st, text: st === 'fail' ? 'FAIL' : 'STALL' }) : h('span', { class: 'tk-st', text: STATUS_WORD[tk.status] || tk.status }), age);
  }
  function tkCard(tk, d) {
    var f = d.sla[tk.id], st = f ? f.state : 'ok';
    var light = st === 'fail' ? 'urgent' : st === 'stall' ? 'blocked' : (tk.status === 'working' || tk.status === 'picked') ? 'working' : (tk.status === 'blocked' || tk.status === 'gated') ? 'blocked' : 'idle';
    var b = h('button', { class: 'tk held' + (st !== 'ok' ? ' ' + st : ''), type: 'button', 'data-tk': tk.id, 'data-tk-agent': tk.agent });
    b.appendChild(tkTop(tk, st, light));
    b.appendChild(h('span', { class: 'tk-ask', text: tk.ask || '' }));
    b.appendChild(h('span', { class: 'tk-meta', text: (tk.createdAt ? 'Filed ' + clockLabel(t(tk.createdAt)) + ' · ' : '') + (tk.priority || 'today') + (tk.status === 'gated' && tk.proposed ? ' · waiting on your Approve' : '') + (acted('ticket-' + tk.id + '-' + tk.status) && (S.actions['ticket-' + tk.id + '-' + tk.status] || {}).action === 'done' ? ' · you closed it, Radar files it next sweep' : (tk.status === 'gated' || tk.status === 'blocked') ? ' · tap to close it on the desk' : '') + (f && f.state === 'fail' ? ' · the 60 minutes ran out ' + ago(new Date(f.since).toISOString()) : '') }));
    return b;
  }
  var AC = null;
  function playClick() {          // one short, quiet click; browsers allow audio only after a tap on the page, and then it works
    if (!S.sound) return;
    try {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      AC = AC || new C(); if (AC.state === 'suspended') AC.resume();
      var t0 = AC.currentTime, o = AC.createOscillator(), gn = AC.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(1700, t0); o.frequency.exponentialRampToValueAtTime(650, t0 + 0.035);
      gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(0.05, t0 + 0.004); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
      o.connect(gn); gn.connect(AC.destination); o.start(t0); o.stop(t0 + 0.07);
    } catch (e) {}
  }
  function closeGhost(tk) {
    var box = $('#ghosts'), sc = Game.ticketScore(tk), bits = [];
    if (sc) { bits.push('+' + sc.points); if (sc.onClock) bits.push('on the clock'); if (sc.sameDay) bits.push('same day'); }
    var g = h('div', { class: 'tk ghost', role: 'status', 'data-ghost': tk.id }, tkTop(tk, 'ok', 'review'), h('span', { class: 'tk-ask', text: tk.ask || '' }), h('span', { class: 'stamp' }, 'CLOSED', bits.length ? h('small', { text: bits.join(' · ') }) : null));
    box.appendChild(g); playClick();
    var calm = reduced.matches || root.classList.contains('still');
    setTimeout(function () {
      if (calm) { g.remove(); return; }
      g.style.maxHeight = g.offsetHeight + 'px'; void g.offsetHeight; g.classList.add('leaving');
      setTimeout(function () { g.remove(); }, 480);
    }, calm ? 1500 : 1300);
  }
  function renderLine() {
    var d = derived(), box = $('#tks'), clear = $('#clear'), prevFocus = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-tk');
    var all = vals(S.tickets).filter(function (x) { return Game.OPEN_STATUSES.indexOf(x.status) >= 0 && !kevClosed(x); }), list = all.filter(function (x) { return !ticketHidden(x); });
    var rank = function (x) { var f = d.sla[x.id]; return f ? (f.state === 'fail' ? 0 : 1) : 2; };
    list.sort(function (a, b) { return (rank(a) - rank(b)) || (t(a.createdAt) - t(b.createdAt)); });
    box.textContent = ''; list.forEach(function (x) { box.appendChild(tkCard(x, d)); });
    if (prevFocus) { var back = $('.tk[data-tk="' + prevFocus + '"]'); if (back) back.focus(); }
    var waiting = list.filter(function (x) { return x.status === 'open'; }).length, priv = all.length - list.length;
    $('#line-count').textContent = list.length ? list.length + ' open' + (waiting ? ' · ' + waiting + ' waiting for pickup' : '') + (priv ? ' · ' + priv + ' private' : '') : '';
    // a ticket that left the line as `done` since the last render closes with a stamp and a click (never on the Sabbath)
    var seen = {}; list.forEach(function (x) { seen[x.id] = x; });
    if (S.lineSeen && !d.game.sabbath) Object.keys(S.lineSeen).forEach(function (id) { var x = S.tickets[id]; if (!seen[id] && x && x.status === 'done' && !ticketHidden(x)) closeGhost(x); });
    S.lineSeen = seen;
    if (!list.length && !priv) {
      var last = vals(S.tickets).filter(function (x) { return x.status === 'done' && x.doneAt && new Date(x.doneAt).toDateString() === new Date().toDateString(); }).map(function (x) { return t(x.doneAt); }).sort().pop();
      clear.hidden = false; clear.textContent = ''; clear.appendChild(document.createTextNode('Board clear · ' + clockLabel(last || Date.now()))); clear.appendChild(h('small', { text: 'Nothing is waiting.' }));
    } else clear.hidden = true;
  }

  /* course records: one understated banner per new record, once (remembered in localStorage, and in memory if storage is blocked) */
  var recSeen = {}, recNow = null;
  function recKnown(key) { if (recSeen[key]) return true; try { return localStorage.getItem('eo-rec-' + key) === '1'; } catch (e) { return false; } }
  function recRemember(key) { recSeen[key] = true; try { localStorage.setItem('eo-rec-' + key, '1'); } catch (e) {} }
  function renderRecords() {
    var d = derived(), bar = $('#recbar');
    if (!S.live || d.game.sabbath) { bar.hidden = true; recNow = null; return; }
    if (recNow) return;                                       // one at a time; it stays until dismissed or 20 seconds pass
    var next = Game.newRecords(d.rec, d.game.today).filter(function (r) { return !recKnown(r.key); })[0];
    if (!next) { bar.hidden = true; return; }
    recNow = next.key; recRemember(next.key);
    bar.textContent = ''; bar.hidden = false; bar.appendChild(h('span', { text: next.text }));
    var ok = h('button', { class: 'mini', type: 'button', text: 'Noted' });
    var close = function () { bar.hidden = true; recNow = null; renderRecords(); };
    ok.addEventListener('click', close); bar.appendChild(ok); setTimeout(function () { if (recNow === next.key) close(); }, 20000);
  }
  /* once a second, only the clocks move: the oldest ticket's age and each card's age */
  function tickLive() {
    if (document.hidden) return;
    var now = Date.now(), o = document.getElementById('b-oldest');
    if (o && o.getAttribute('data-from')) o.textContent = hms(waitedSec(+o.getAttribute('data-from'), now));
    document.querySelectorAll('.tk-age[data-from]').forEach(function (el) {
      var sp = { from: +el.getAttribute('data-from'), kind: el.getAttribute('data-kind'), label: el.getAttribute('data-label') }; var txt = ageText(sp, now); if (el.textContent !== txt) el.textContent = txt;
    });
  }

  /* ---------- next sweep: Radar's hourly sweep runs at :07, 7 to 18, Monday to Friday, Pacific ---------- */
  var PT = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false });
  function nextSweep() {
    var start = Math.ceil(Date.now() / MIN) * MIN;
    for (var i = 0; i < 8 * 24 * 60; i++) {
      var p = {}; PT.formatToParts(new Date(start + i * MIN)).forEach(function (x) { p[x.type] = x.value; });
      var hr = parseInt(p.hour, 10) % 24;
      if (parseInt(p.minute, 10) === 7 && hr >= 7 && hr <= 18 && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(p.weekday) >= 0) return p.weekday + ' ' + (hr % 12 || 12) + ':07 ' + (hr < 12 ? 'am' : 'pm') + ' PT';
    }
    return 'next weekday morning';
  }

  /* ---------- writes: the page writes only tickets and seen marks, on a user action ---------- */
  function makeTicket(o) {
    var id = 't-' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12) + '-' + Math.random().toString(36).slice(2, 6);
    var now = new Date().toISOString();
    var doc = { id: id, agent: o.agent, ask: o.ask, due: o.due || null, priority: o.priority || 'today', status: 'open', owner: 'kev', createdBy: 'kev', lever: o.lever || null, attachments: o.attachments || null, createdAt: now, updatedAt: now };
    if (o.project) doc.project = o.project;
    S.tickets[id] = doc; renderAll();
    if (S.live && S.db) S.db.doc('tickets/' + id).set(doc).catch(function () { delete S.tickets[id]; S.flash = 'That ticket did not save. Try again.'; renderAll(); });
    return doc;
  }
  var pendingSeen = {};
  function markSeen(key) {
    var doc = { at: new Date().toISOString() };
    S.seen[key] = doc; renderAll();
    if (S.live && S.db && S.canWrite && !pendingSeen[key]) {
      pendingSeen[key] = true;                                  // one write at a time per document
      S.db.doc('seen/' + key).set(doc).catch(function () {}).then(function () { pendingSeen[key] = false; });
    }
  }

  /* Done / Follow up on a "Needs you" item: the page records Kev's call; Radar's sweep applies it to the source (QC, ledger, routine) */
  var pendingAct = {};
  function markAction(key, action, extra) {
    var item = allItems().concat(Object.keys(S.agents).reduce(function (o, id) { return o.concat(effective(S.agents[id]).items); }, [])).filter(function (i) { return i.key === key; })[0] || {};
    var doc = Object.assign({ key: key, agent: item.agent || null, title: item.title || '', action: action, at: new Date().toISOString(), by: 'kev', applied: false }, extra || {});
    S.actions[key] = doc; renderAll();
    if (S.live && S.db && S.canWrite && !pendingAct[key]) {
      pendingAct[key] = true;
      S.db.doc('actions/' + key).set(doc).catch(function () { delete S.actions[key]; S.flash = 'That did not save. Try again.'; renderAll(); }).then(function () { pendingAct[key] = false; });
    }
  }
  /* Zzz: hides an item until a time, then it comes back on its own. Page-side only; Radar's sweep leaves snoozes alone. */
  function snoozedFor(id) { return Object.keys(S.actions).map(function (k) { return S.actions[k]; }).filter(function (x) { return x.agent === id && x.action === 'snooze' && t(x.until) > Date.now(); }).sort(function (x, y) { return t(x.until) - t(y.until); }); }
  function acted(key) { var x = S.actions[key]; return !!x && (x.action !== 'snooze' || t(x.until) > Date.now()); }
  function at(d, hh, mm) { var x = new Date(d); x.setHours(hh, mm || 0, 0, 0); return x; }
  function nextWorkday(d) { var x = new Date(d); do { x.setDate(x.getDate() + 1); } while (x.getDay() === 6); return x; }   // never wakes on the Sabbath
  function snoozeOptions() {
    var now = new Date(), opts = [['1 hour', new Date(now.getTime() + HOUR)]];
    var co = at(now, 17, 30); if (co - now > HOUR && !Game.isSabbathAt(co.getTime())) opts.push(['Till check-out 5:30', co]);   // no 5:30 wake inside a Friday Sabbath
    opts.push(['Tomorrow 7am', at(nextWorkday(now), 7)]);
    var mon = new Date(now); mon.setDate(mon.getDate() + ((8 - mon.getDay()) % 7 || 7)); opts.push(['Monday 7am', at(mon, 7)]);
    return opts;
  }
  function untilLabel(iso) { var d = new Date(iso); return d.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  var zzzOpen = {};
  function zzz(acts, i) {
    if (!zzzOpen[i.key]) { var z = h('button', { class: 'mini', text: 'Zzz', title: 'Snooze' }); z.disabled = !S.canWrite; z.addEventListener('click', function (ev) { ev.stopPropagation(); zzzOpen[i.key] = true; S.forceSheet = true; renderAll(); }); acts.appendChild(z); return; }
    var g = h('span', { class: 'seg snooze', role: 'group', 'aria-label': 'Snooze until' });
    snoozeOptions().forEach(function (o) {
      var b = h('button', { class: 'mini', text: o[0] }); b.addEventListener('click', function (ev) { ev.stopPropagation(); delete zzzOpen[i.key]; snooze(i, o[1]); }); g.appendChild(b);
    });
    acts.appendChild(g);
    var c = h('button', { class: 'mini txt', text: 'Cancel' }); c.addEventListener('click', function (ev) { ev.stopPropagation(); delete zzzOpen[i.key]; S.forceSheet = true; renderAll(); }); acts.appendChild(c);
  }
  function snooze(i, until) {
    var doc = { key: i.key, agent: i.agent || null, title: i.title || '', action: 'snooze', until: until.toISOString(), at: new Date().toISOString(), by: 'kev', applied: true };
    S.actions[i.key] = doc; S.forceSheet = true; renderAll();
    if (S.live && S.db && S.canWrite) S.db.doc('actions/' + i.key).set(doc).catch(function () { delete S.actions[i.key]; renderAll(); });
  }
  function undoAction(key) {
    stripUndo = stripUndo.filter(function (u) { return u.key !== key; });
    delete S.actions[key]; S.forceSheet = true; renderAll();
    if (S.live && S.db && S.canWrite) S.db.doc('actions/' + key).delete().catch(function () {});
  }

  /* ---------- the strip, the banner ---------- */
  function seenBtn(item) { var b = h('button', { class: 'mini', text: 'Seen' }); b.disabled = !S.canWrite; b.setAttribute('data-seen', item.key); return b; }
  function renderBanner() {
    var b = $('#banner'); b.textContent = '';
    var now = Date.now(), fresh = function (i) { return t(i.raisedAt) && now - t(i.raisedAt) <= STACK_DAYS * DAY ? 0 : 1; };   // Kev, 30 Oct: the newest red leads; a 25-day-old spend no longer sits on top
    var reds = allItems().filter(function (i) { return i.light === 'urgent' && !i.seen; }).sort(function (x, y) { return (fresh(x) - fresh(y)) || (t(y.raisedAt) - t(x.raisedAt)); });
    if (!reds.length) { b.hidden = true; bannerKey = null; return; }
    b.hidden = false; var f = reds[0]; bannerKey = f.key;   // the strip skips what the banner already holds
    b.appendChild(led('urgent', true));
    b.appendChild(h('div', null, h('div', { class: 'what', text: f.title }), h('div', { class: 'sub', text: nameOf(f.agent) + ' · ' + ago(f.raisedAt) + (reds.length > 1 ? ' · ' + (reds.length - 1) + ' more urgent' : '') })));
    if (f.kind !== 'sla') { var acts = h('div', { class: 'sacts' }); if (/^sync-qc-/.test(f.key || '') && usefulLink(f.link)) acts.appendChild(h('a', { class: 'mini txt', href: linkUrl(f.link), target: '_blank', rel: 'noopener', text: 'Approve in QC' })); acts.appendChild(answerSeg(f)); b.appendChild(acts); }   // a FAIL clears when the ticket is picked up, not when it is dismissed
  }
  function openLabel(url) { return /github\.com|^(?!https?:)/.test(url || '') ? 'Open the file' : /superhuman\.com/.test(url) ? 'Open in Superhuman' : 'Open'; }
  /* The Eden Desk has no approval cards (Kev, 23 Oct), so a link that only points there is dropped; approval is the Approve tap. */
  function usefulLink(url) { return url && !/5SuFoioujKFV6KgX4dXi3G/.test(url) ? url : null; }
  /* Kev, 23 Oct: "Done" means I did it myself, close it, nobody acts on it. Approval is its own tap, only on items an agent would carry out
     for him (a QC item that is not a draft he sends himself, a gated ticket). */
  var approveOpen = {};
  function clip1(x, n) { x = String(x || '').replace(/\s+/g, ' ').trim(); return x.length > n ? x.slice(0, n - 1) + '\u2026' : x; }
  /* What Kev approves: the alert's own (a QC item) or the gated ticket's. Only one with a QC id and a fingerprint can be approved,
     because Radar's office-approve check refuses anything else (and anything changed after the tap). */
  function approvalOf(i) {
    var tk0 = /^ticket-(.+)-gated$/.exec(i.key || ''), px = i.proposed || (tk0 && S.tickets[tk0[1]] && S.tickets[tk0[1]].proposed) || null;
    return px && px.qc && px.hash && px.exact ? px : null;
  }
  function needsApproval(i) { return (i.kind === 'qc' && !i.preview) || /^ticket-.+-gated$/.test(i.key || ''); }
  var bannerKey = null;
  var openDrafts = {};
  function nameOf(id) { return S.agents[id] ? S.agents[id].name : id; }

  /* ---------- the floor ---------- */
  var ZONE_OF = { radar: 'rad', recruiting: 'rec', finance: 'fin', family: 'fam', other: 'rec' };
  var AGENT_ORDER = ['scout', 'casey', 'ember', 'dean', 'q', 'pm', 'tally', 'docket', 'host', 'atlas', 'housing-architect', 'keys', 'hale', 'jethro', 'barnabas', 'lookahead'];
  var WING = ['atlas', 'housing-architect', 'keys', 'hale', 'jethro', 'barnabas', 'lookahead'];   // the KDTW wing: private, closes whole under Screen share
  var SEAT = { q: 'rec', host: 'fin', pm: 'spx', casey: 'cli', ember: 'cli' };   // ember: MPC and warm-inventory keeper, Kev 28 Oct: next to Casey in Client work   // casey: Client Care Manager, Kev 23 Oct: a desk in Client work, over the job-order board   // pm: the special projects PM, Kev 21 Oct; side projects inside EPG, reports to Radar
    // Kev, 21 Oct: Q takes Host's old seat on the recruiting desk; Jenny (host) sits by Docket
  function zoneOf(a) { return SEAT[a.id] || (WING.indexOf(a.id) >= 0 ? 'fam' : (ZONE_OF[a.desk] || 'rec')); }
  /* A desk that exists in the repo before its first office sync still sits in its zone (Hawk, 30 Oct): the synced doc replaces the stub the moment it arrives. */
  var STUBS = { lookahead: { id: 'lookahead', name: 'Hawk', role: 'Look-ahead keeper', desk: 'family', sensitive: true, light: 'idle', counts: {}, task: null, stub: true } };
  function withStubs(m) { Object.keys(STUBS).forEach(function (k) { if (!m[k]) m[k] = Object.assign({}, STUBS[k]); }); return m; }
  function isDusk() { var d = new Date(), x = d.getHours() + d.getMinutes() / 60; return !(x >= 7.5 && x <= 18.5); }

  function deskEl(a) {
    var e = effective(a), hide = hidden(a), light = hide ? 'idle' : e.light;
    var btn = h('button', { class: 'desk' + (!hide && e.held ? ' held' : '') + (!hide && isDusk() && light === 'working' ? ' lamp' : ''), 'data-id': a.id });
    var word = hide ? 'Hidden' : WORD[light];
    btn.setAttribute('aria-label', a.name + ', ' + word + (hide ? '' : ', ' + (a.task || 'no task posted')) + '. Sit down.');
    var box = h('span', { class: 'ledbox', 'aria-hidden': 'true' });
    if (!hide && e.others > 0) box.appendChild(h('span', { class: 'cnt', text: '+' + e.others }));
    box.appendChild(led(light, true));
    btn.appendChild(h('span', { class: 'chair', 'aria-hidden': 'true' })); btn.appendChild(box);
    btn.appendChild(h('span', { class: 'plate', text: a.name })); btn.appendChild(h('span', { class: 'role', text: a.role || '' }));
    btn.appendChild(h('span', { class: 'task', text: hide ? '' : (a.task || (light === 'idle' ? 'No task posted' : '')) }));
    var right = h('span'); var p = hide ? null : papers(a.openTickets || 0); if (p) right.appendChild(p);
    if (!hide && e.stale) right.appendChild(h('span', { class: 'stale', title: e.staleWhy, text: 'Stale' })), right.appendChild(document.createTextNode(' '));
    if (!hide) right.appendChild(document.createTextNode(short(heardAt(a))));
    btn.appendChild(h('span', { class: 'meta' }, h('span', { class: 'st', text: word }), right));
    return btn;
  }
  function radarEl() {
    var a = S.agents.radar || { id: 'radar', name: 'Radar', role: 'Chief of staff', task: null }, e = effective(a), r = $('#radar'); r.textContent = '';
    r.className = 'radar' + (e.held ? ' held' : '');
    r.appendChild(h('span', { class: 'ledbox', 'aria-hidden': 'true' }, e.others > 0 ? h('span', { class: 'cnt', text: '+' + e.others }) : null, led(e.light, true)));
    var sit = h('button', { class: 'radar-sit', 'data-id': 'radar' }, h('span', { class: 'plate', text: 'Radar' }), h('span', { class: 'role', text: (a.role || 'Chief of staff') + ' · your seat' }));
    sit.setAttribute('aria-label', 'Radar, ' + WORD[e.light] + '. Sit down.');
    r.appendChild(sit);
    var lines = S.share ? [] : ((S.today && S.today.lines) || []);   // calendar lines hide under Screen share
    if (lines.length) { var dl = h('dl', { class: 'today' }); lines.slice(0, 3).forEach(function (l) { dl.appendChild(h('dt', { text: l.at })); dl.appendChild(h('dd', { text: l.text })); }); r.appendChild(dl); }
    var c = (S.meta && S.meta.counts) || {}, open = Object.keys(S.tickets).filter(function (k) { return ['open', 'picked', 'working', 'blocked', 'gated'].indexOf(S.tickets[k].status) >= 0; }).length;
    r.appendChild(h('div', { class: 'counts' }, h('span', null, 'QC ', h('b', { text: String(c.qcPending == null ? '–' : c.qcPending) })), h('span', null, 'Tickets ', h('b', { text: String(open) })), h('span', null, 'Ledger ', h('b', { text: String(c.ledgerOpen == null ? '–' : c.ledgerOpen) }))));
    var keys = h('div', { class: 'keys' });
    [['wip', 'WIP report'], ['status', 'Status, all'], ['ticket', 'Hand a ticket'], ['unused', 'Shipped, unused']].forEach(function (k) { keys.appendChild(h('button', { class: 'key', 'data-lever': k[0], text: k[1] })); });
    r.appendChild(keys);
    var shipped = Object.keys(S.tickets).filter(function (k) { var x = S.tickets[k]; return x.status === 'done' && x.doneAt && new Date(x.doneAt).toDateString() === new Date().toDateString(); }).length;
    var tray = h('span', { class: 'tray' }); for (var i = 0; i < Math.min(shipped, 6); i++) tray.appendChild(h('i', { style: 'top:' + (3 + i * 2.4) + 'px' }));
    r.appendChild(h('div', { class: 'out', title: 'Resets at midnight. Never compared with yesterday.' }, tray, 'Out tray · ' + shipped + ' shipped today'));
  }
  function benchEl(def) {
    var doc = S.benches[def.id] || {}, hide = S.share && def.sensitive;
    var b = h('button', { class: def.cls, 'data-bench': def.id });
    b.appendChild(h('b', { text: def.title }));
    b.appendChild(h('span', { text: hide ? '' : def.sub + (doc.asOf ? ' · updated ' + short(doc.asOf) : ' · not synced') + (doc.example ? ' · example' : '') }));
    return b;
  }
  /* Client work: straight to the depth charts, the job orders and their lead sheets, and the phones. One tap each, no sheet. */
  function quickRow() {
    var m = toolMap(), row = h('div', { class: 'quick', 'data-fb': 'client' });
    [['Depth charts', 'hub', ''], ['Job orders + leads', 'hub', ''], ['Phones', 'cloudtalk', ''], ['Crelate', 'crelate', '']].forEach(function (q) {
      var x = m[q[1]]; if (!x || !x.url) return;
      row.appendChild(toolLink({ id: x.id, name: q[0], url: x.url + q[2] }, 'key'));
    });
    return row;
  }
  function renderFloor() {
    var focus = document.activeElement && (document.activeElement.getAttribute('data-id') || document.activeElement.getAttribute('data-bench'));
    var focusIsBench = document.activeElement && document.activeElement.hasAttribute('data-bench');
    ['rec', 'fin', 'fam', 'spx', 'cli'].forEach(function (z) { $('#d-' + z).textContent = ''; });
    var list = Object.keys(S.agents).map(function (k) { return S.agents[k]; }).filter(function (a) { return a.id !== 'radar'; })
      .sort(function (x, y) { var i = AGENT_ORDER.indexOf(x.id), j = AGENT_ORDER.indexOf(y.id); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j); });
    list.forEach(function (a) { var z = zoneOf(a); if (z === 'rad') z = 'rec'; var box = $('#d-' + z); if (box) box.appendChild(deskEl(a)); });
    radarEl();
    ['rec', 'rev', 'fin', 'ppl', 'cli', 'spx', 'fam'].forEach(function (z) { var box = $('#b-' + z); box.textContent = ''; BENCH_DEFS.filter(function (d) { return d.zone === z; }).forEach(function (d) { box.appendChild(benchEl(d)); }); });
    $('#b-cli').appendChild(quickRow());
    if (!S.share) { var rt = toolMap()['round-table']; if (rt) {                 // a bench like its neighbours, but it opens the Round Table page
      var door = h('a', { class: 'bench', href: rt.url, target: '_blank', rel: 'noopener', 'data-fb': 'round-table' }, h('b', { text: 'Round Table' }), h('span', { text: 'Scorecards · coaching · goals · Kev only' }));
      door.addEventListener('click', function () { markSeen('open-' + rt.id); }); $('#b-ppl').appendChild(door); } }
    if (focus) { var back = focusIsBench ? $('[data-bench="' + focus + '"]') : $('.desk[data-id="' + focus + '"]'); if (back && back !== document.activeElement && !S.sheet) back.focus(); }
    applyFocus(); phaseLock(); drawNotes(); drawFlow();
  }

  /* ---------- focus: Recruit mode (a preset, no timer) and Deep work (pick a lane or one desk, optional timer) ---------- */
  function lanes() {
    return {
      recruiting: { name: 'Recruiting', agents: ['scout', 'casey', 'ember', 'dean', 'q', 'host'], benches: ['recruiting', 'depth', 'client', 'round-table'], tools: ['crelate', 'cloudtalk', 'round-table', 'hub'] },
      client: { name: 'Client delivery', agents: ['casey', 'ember', 'scout', 'host'], benches: ['client'], tools: ['hub', 'cloudtalk', 'crelate'] },
      people: { name: 'People and hiring', agents: ['dean'], benches: ['depth', 'university', 'round-table'], tools: ['round-table', 'hub'] },
      money: { name: 'Revenue and finance', agents: ['tally', 'docket'], benches: ['revenue', 'finance'], tools: ['cash-pulse', 'quickbooks', 'gusto', 'hub'], sensitive: true },
      projects: { name: 'Special projects', agents: ['pm'], benches: ['projects'], tools: ['staffing-doc', 'hub'] },
      family: { name: 'Family office', agents: WING, benches: ['family'], tools: ['atlas-desk', 'marlowe-desk'], sensitive: true }
    };
  }
  function laneOf(f) {
    if (!f || !f.lane) return null;
    if (f.lane.indexOf('desk:') === 0) { var id = f.lane.slice(5); return { name: nameOf(id), agents: [id], benches: [], tools: AGENT_TOOLS[id] || ['eden-desk'] }; }
    return lanes()[f.lane] || null;
  }
  function inFocusAgent(id) { var L = laneOf(S.focus); return !L || id === 'radar' || L.agents.indexOf(id) >= 0; }
  function inFocusBench(id) { var L = laneOf(S.focus); return !L || L.benches.indexOf(id) >= 0; }
  function saveFocus() { try { if (S.focus) localStorage.setItem('eo-focus', JSON.stringify(S.focus)); else localStorage.removeItem('eo-focus'); } catch (x) {} }
  function startFocus(f) { S.focus = f; S.focusDone = null; saveFocus(); renderAll(); }
  function endFocus() { S.focus = null; S.focusDone = null; saveFocus(); renderAll(); }
  function applyFocus() {
    var on = !!laneOf(S.focus); root.classList.toggle('focus', on);
    document.querySelectorAll('.desk').forEach(function (d) { d.classList.toggle('dim', on && !inFocusAgent(d.getAttribute('data-id'))); });
    document.querySelectorAll('[data-bench],[data-fb]').forEach(function (b) { b.classList.toggle('dim', on && !inFocusBench(b.getAttribute('data-bench') || b.getAttribute('data-fb'))); });
    document.querySelectorAll('.zone:not(.z-rad)').forEach(function (z) { var lit = on && !!z.querySelector('.desk:not(.dim),[data-bench]:not(.dim),[data-fb]:not(.dim)'); z.classList.toggle('lit', lit); z.classList.toggle('dimz', on && !lit); });
    $('#tools').classList.toggle('dim', on);
    $('#sw-recruit').setAttribute('aria-pressed', String(!!(S.focus && S.focus.kind === 'recruit')));
    $('#focus-btn').textContent = S.focus && S.focus.kind === 'deep' ? 'Deep work · on' : 'Deep work';
  }
  function renderFocus() {
    var box = $('#focusbar'); box.textContent = '';
    if (S.focusDone) {
      box.hidden = false;
      box.appendChild(h('span', { class: 'fb-dot', 'aria-hidden': 'true' }));
      box.appendChild(h('div', null, h('div', { class: 'fb-t', text: 'Block done · ' + S.focusDone.name }), h('div', { class: 'fb-s', text: 'The floor is back. Check the strip for what waited.' })));
      var more = h('span', { class: 'sacts', style: 'padding:0' });
      var plus = h('button', { class: 'mini', text: '+25 min' }); plus.addEventListener('click', function () { var d = S.focusDone; startFocus({ lane: d.lane, task: d.task, kind: 'deep', until: new Date(Date.now() + 25 * MIN).toISOString() }); });
      var ok = h('button', { class: 'mini primary', text: 'Back to the floor' }); ok.addEventListener('click', endFocus);
      more.appendChild(plus); more.appendChild(ok); box.appendChild(more); return;
    }
    var L = laneOf(S.focus); if (!L) { box.hidden = true; return; }
    box.hidden = false;
    var f = S.focus, left = f.until ? t(f.until) - Date.now() : null;
    var held = allItems().filter(function (i) { return i.needsKev && !i.seen && i.light !== 'urgent' && !inFocusAgent(i.agent); }).length;
    box.appendChild(h('span', { class: 'fb-dot', 'aria-hidden': 'true' }));
    box.appendChild(h('div', null,
      h('div', { class: 'fb-t', text: f.kind === 'recruit' ? 'Recruit mode' : 'Deep work · ' + L.name }),
      f.task ? h('div', { class: 'fb-task', text: f.task }) : null,
      h('div', { class: 'fb-s', text: (left != null ? 'Until ' + tf.format(new Date(t(f.until))) + ' · ' + Math.max(0, Math.ceil(left / MIN)) + 'm left' : 'Until you end it') + ' · ' + (held ? held + ' item' + (held > 1 ? 's' : '') + ' from other desks held' : 'nothing held') + ' · red still comes through' })));
    var end = h('button', { class: 'mini', text: f.kind === 'recruit' ? 'Leave recruit mode' : 'End deep work' }); end.addEventListener('click', endFocus); box.appendChild(end);
    var look = h('div', { class: 'fb-look' }, h('span', { class: 'eyebrow', text: 'Look here' }));
    L.agents.forEach(function (id) { if (!S.agents[id] || hidden(S.agents[id])) return; look.appendChild(h('button', { class: 'mini', 'data-id': id, text: 'Sit with ' + nameOf(id) })); });
    toolsFor(L.tools).forEach(function (x) { look.appendChild(toolLink(x, 'mini txt')); });
    box.appendChild(look);
    var rank = { urgent: 0, reply: 1, review: 2, blocked: 3 };
    var first = allItems().filter(function (i) { return i.needsKev && !i.seen && rank[i.light] !== undefined && inFocusAgent(i.agent) && i.agent !== 'radar'; })
      .sort(function (a, b) { return ((a.rank == null ? 99 : a.rank) - (b.rank == null ? 99 : b.rank)) || (rank[a.light] - rank[b.light]) || (t(a.raisedAt) - t(b.raisedAt)); })[0];
    if (first) { var go = h('button', { 'data-id': first.agent, text: nameOf(first.agent) + ': ' + first.title }); box.appendChild(h('div', { class: 'fb-start' }, h('span', { class: 'eyebrow', text: 'Start here' }), led(first.light, true), go)); }
  }
  function checkFocusTimer() {
    if (S.focus && S.focus.until && Date.now() >= t(S.focus.until)) { var L = laneOf(S.focus); S.focusDone = { name: L ? L.name : 'focus', lane: S.focus.lane, task: S.focus.task }; S.focus = null; saveFocus(); }
  }
  function renderTools() {
    var box = $('#tools'); box.textContent = ''; box.appendChild(h('span', { class: 'eyebrow', text: 'Tools' }));
    toolsFor(['runway', 'hub', 'eden-daily', 'day-board', 'workshop', 'eden-desk', 'ledger', 'cash-pulse', 'quickbooks', 'gusto'].filter(function (id) { return !(S.share && id === 'cash-pulse'); })).forEach(function (x) { box.appendChild(toolLink(x, '')); });
  }
  /* every blink on the floor shares one clock, so lights flash in unison instead of twinkling */
  function phaseLock() { var tt = performance.now() / 1000; document.querySelectorAll('.led').forEach(function (l) { l.style.setProperty('--ph', '-' + (tt % 15).toFixed(3) + 's'); }); }

  /* the room keeps time: daylight moves with the hour; the day's pillar is drawn solid on the colonnade */
  function tick() {
    var d = new Date(), x = d.getHours() + d.getMinutes() / 60, day = (d.getDay() + 6) % 7;
    $('#clock').textContent = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '') + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    $('#pillar').textContent = 'Pillar ' + String(day + 1).padStart(2, '0') + ' · ' + PILLARS[day];
    var col = $('#colonnade'); col.textContent = ''; PILLARS.forEach(function (p, i) { col.appendChild(h('i', { class: i === day ? 'today' : '', title: p })); });
    var sun = $('#sun'), lit = x >= 7.5 && x <= 18.5; sun.hidden = !lit;
    if (lit) { var k = (x - 7.5) / 11; sun.style.left = (8 + k * 62) + '%'; sun.style.transform = 'skewX(' + ((k - .5) * -50) + 'deg)'; }
  }
  /* A desk is "in conversation" with Radar while it has a ticket moving (open, picked, working) or one touched in the last hour.
     Fresh traffic (under 15 minutes) glows a little brighter. Never on a hidden desk, never under Screen share for the wing. */
  function drawFlow() {
    var svg = $('#flow'); if (!svg) return; svg.textContent = '';
    if (innerWidth <= 820 || S.sheet) return;
    var NS = 'http://www.w3.org/2000/svg', fl = $('#floor').getBoundingClientRect(), rdEl = $('#radar'); if (!rdEl) return;
    var c = function (el) { var r = el.getBoundingClientRect(); return [r.left - fl.left + r.width / 2, r.top - fl.top + r.height / 2]; };
    var rd = c(rdEl), now = Date.now(), by = {};
    vals(S.tickets).forEach(function (x) {
      if (!x.agent || x.agent === 'radar' || ticketHidden(x)) return;
      var at = t(x.updatedAt || x.createdAt), moving = ['open', 'picked', 'working'].indexOf(x.status) >= 0;
      if (!moving && now - at > HOUR) return;
      var cur = by[x.agent]; if (!cur || at > cur.at) by[x.agent] = { at: at, cls: fromOf(x).cls };
    });
    Object.keys(by).forEach(function (id) {
      var d = $('.desk[data-id="' + id + '"]'); if (!d || !d.offsetParent) return;
      var p2 = c(d), fresh = now - by[id].at < 15 * MIN, cls = by[id].cls;
      var l = document.createElementNS(NS, 'line'); l.setAttribute('x1', rd[0]); l.setAttribute('y1', rd[1]); l.setAttribute('x2', p2[0]); l.setAttribute('y2', p2[1]); l.setAttribute('class', cls); l.setAttribute('opacity', fresh ? '.6' : '.3'); svg.appendChild(l);
      var dot = document.createElementNS(NS, 'circle'); dot.setAttribute('cx', p2[0]); dot.setAttribute('cy', p2[1] - d.getBoundingClientRect().height / 2); dot.setAttribute('r', '3'); dot.setAttribute('class', cls); svg.appendChild(dot);
    });
  }
  function drawNotes() {
    var svg = $('#lines'), on = document.documentElement.classList.contains('notes') && innerWidth > 820; svg.textContent = '';
    if (!on) return;
    var NS = 'http://www.w3.org/2000/svg', f = $('#floor').getBoundingClientRect();
    var c = function (el) { var r = el.getBoundingClientRect(); return [r.left - f.left + r.width / 2, r.top - f.top + r.height / 2]; };
    var rd = c($('#radar'));
    function line(x1, y1, x2, y2, cls) { var l = document.createElementNS(NS, 'line'); l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); if (cls) l.setAttribute('class', cls); svg.appendChild(l); return l; }
    document.querySelectorAll('.desk').forEach(function (d) { if (!d.offsetParent) return; var p = c(d); line(rd[0], rd[1], p[0], p[1]); });
    var ta = $('.desk[data-id="tally"]'), dk = $('.desk[data-id="docket"]');
    if (ta && dk && ta.offsetParent && dk.offsetParent) { var a = c(ta), b = c(dk); line(a[0], a[1] - 70, b[0], b[1] - 70, 'pair'); var tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', (a[0] + b[0]) / 2 - 30); tx.setAttribute('y', a[1] - 75); tx.textContent = 'TWO KEYS'; svg.appendChild(tx); }
  }
