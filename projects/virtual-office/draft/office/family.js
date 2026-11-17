// Command Center · family.js (split from eden-office.html, 30 Oct 2026). Family wing: the 12-week plan card (private; closes under Screen share).
// Panel files share the page's global scope and load in this order: core.js, floor.js, pulse.js, strip.js, family.js, desks.js, today.js, boot.js. Edit here, not in the html.
'use strict';
  /* ---------- The 12-week plan, inside the Family office wing ----------
     Kev, 15 Nov: "a clean dumbed-down 12-week plan + expandable" in place of the old look-ahead card.
     Source: meta/runway, Hawk's mirror of the Runway page's data (the same events, decisions and owners Marlowe's Runway shows).
     Until Hawk writes it, the card falls back to meta/lookahead. One line a week, Sunday to Saturday like the Runway; tap a week to open it.
     Titles, dates and owners only. Private: hidden whole and unsubscribed under Screen share, like the wing. */
  var RUNWAY_URL = 'https://claude.ai/artifact/LL1hw8T3s9Bqk8tJchv8Xv';
  var laOpen = {};                                       // which weeks Kev opened, kept across the 30-second re-render
  function laDay(d, short2) {
    var x = new Date(d + 'T12:00:00Z'); if (isNaN(x)) return d;
    return x.toLocaleDateString('en-US', short2 ? { month: 'short', day: 'numeric', timeZone: 'UTC' } : { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }
  function laRange(a, b) { var x = laDay(a, true), y = laDay(b, true); return x.split(' ')[0] === y.split(' ')[0] ? x + '–' + y.split(' ')[1] : x + ' – ' + y; }
  /* one shape for both sources: {id, title, start, end, kind, tent, who, note} */
  function laItems() {
    var r = S.runway, out = [], decs = [];
    if (r && Array.isArray(r.events)) {
      r.events.forEach(function (e) { if (!e || !e.start) return; out.push({ id: e.id, title: String(e.title || ''), start: e.start, end: e.end && e.end > e.start ? e.end : e.start, kind: e.kind || 'work', tent: e.status === 'tentative', who: e.who || '', note: e.note || '' }); });
      (r.openDecisions || []).forEach(function (d) { if (d && d.title) decs.push({ title: String(d.title), by: d.decideBy || '' }); });
      return { items: out, decisions: decs, asOf: r.generatedAt || r.asOf, src: 'runway' };
    }
    var l = S.look; if (!l) return null;
    var seen = {};
    (Array.isArray(l.decisions) ? l.decisions : []).forEach(function (x) { seen[x.id] = true; decs.push({ title: String(x.title || ''), by: x.start || '' }); });
    (Array.isArray(l.next) ? l.next : []).forEach(function (x) { if (seen[x.id] || !x.start) return; out.push({ id: x.id, title: String(x.title || '') + (x.time ? ' · ' + x.time : ''), start: x.start, end: x.end && x.end > x.start ? x.end : x.start, kind: x.kind || 'event', tent: x.status === 'tentative', who: x.owner || '', note: '' }); });
    return { items: out, decisions: decs, asOf: l.asOf, src: 'lookahead' };
  }
  function laTag(x) {
    if (x.kind === 'travel') return h('span', { class: 'tag', text: 'Trip' });
    if (x.kind === 'milestone') return h('span', { class: 'tag ms', text: 'Milestone' });
    if (x.kind === 'deadline') return h('span', { class: 'tag', text: 'Due' });
    return null;
  }
  function renderLookahead() {
    var box = $('#la'); if (!box) return;
    box.textContent = '';
    if (S.share) { box.hidden = true; return; }
    box.hidden = false;
    var today = Game.pacificDate(Date.now()), w0 = Game.addDays(today, -Game.dayOfWeek(today)), wEnd = Game.addDays(w0, 83);
    box.appendChild(h('div', { class: 'la-h' }, h('span', { class: 'eyebrow', text: '12-week plan · Hawk' }), h('span', { class: 'eyebrow', text: laRange(w0, wEnd) })));
    var d = laItems();
    if (!d) { box.appendChild(h('p', { class: 'none', text: 'Hawk has not written the plan yet. It shows here after the next nightly run.' })); return; }
    // decide first: the only thing on the card that asks something of Kev
    var decs = d.decisions.filter(function (x) { return x.title; }).sort(function (a, b) { return (a.by || '9') < (b.by || '9') ? -1 : 1; });
    if (decs.length) {
      var db = h('div', { class: 'dec' }); db.appendChild(h('h4', { text: 'Decide' }));
      var dl = h('ul'); decs.forEach(function (x) { dl.appendChild(h('li', null, h('span', { class: 'd', text: !x.by ? 'No date' : x.by < today ? 'Overdue' : x.by === today ? 'Today' : 'by ' + laDay(x.by, true) }), h('span', { class: 'ti', text: x.title }), h('span', { class: 'o' }))); });
      db.appendChild(dl); box.appendChild(db);
    }
    // twelve weeks, one line each
    var wrap = h('div', { class: 'wk12' }); wrap.appendChild(h('h4', { text: 'Week by week' }));
    for (var i = 0; i < 12; i++) {
      var a = Game.addDays(w0, i * 7), b = Game.addDays(a, 6);
      var its = d.items.filter(function (x) { return x.end >= a && x.start <= b && x.end >= today; }).sort(function (x, y) { return x.start < y.start ? -1 : x.start > y.start ? 1 : 0; });
      var key = a, isNow = i === 0, open = laOpen[key] != null ? laOpen[key] : false;
      var det = h('details', { class: 'wk' + (isNow ? ' now' : '') + (its.length ? '' : ' empty') });
      if (open) det.open = true;
      var trip = its.some(function (x) { return x.kind === 'travel'; });
      var sm = its.length ? its.slice(0, 3).map(function (x) { return x.title + (x.tent ? '?' : ''); }).join(' · ') : 'Open week';
      det.appendChild(h('summary', null, h('span', { class: 'd' }, h('b', { text: 'W' + (i + 1) }), laDay(a, true)), h('span', { class: 'sm', text: (trip ? '✈ ' : '') + sm }), h('span', { class: 'n', text: its.length > 3 ? '+' + (its.length - 3) : its.length ? String(its.length) : '' })));
      if (its.length) {
        var ul = h('ul');
        its.forEach(function (x) {
          var ti = h('span', { class: 'ti' }), tg = laTag(x); if (tg) ti.appendChild(tg); if (x.tent) ti.appendChild(h('span', { class: 'tag tn', text: 'Maybe' }));
          ti.appendChild(document.createTextNode(x.title)); if (x.note) ti.appendChild(h('span', { class: 'nt', text: x.note }));
          ul.appendChild(h('li', null, h('span', { class: 'd', text: x.end > x.start ? laRange(x.start, x.end) : laDay(x.start) }), ti, h('span', { class: 'o', text: x.who || '' })));
        });
        det.appendChild(ul);
      }
      (function (k, el) { el.addEventListener('toggle', function () { laOpen[k] = el.open; }); })(key, det);
      wrap.appendChild(det);
    }
    box.appendChild(wrap);
    var old = d.asOf && Date.now() - t(d.asOf) > 36 * HOUR, f = h('div', { class: 'foot2' });
    var tools = h('span', { class: 'la-tools' });
    var allOpen = true; for (var j = 0; j < 12; j++) if (!laOpen[Game.addDays(w0, j * 7)]) allOpen = false;
    var all = h('button', { class: 'mini txt', type: 'button', text: allOpen ? 'Close all weeks' : 'Open all weeks' });
    all.addEventListener('click', function () { for (var k = 0; k < 12; k++) laOpen[Game.addDays(w0, k * 7)] = !allOpen; renderAll(); });
    tools.appendChild(all);
    tools.appendChild(h('a', { class: 'mini', href: RUNWAY_URL, target: '_blank', rel: 'noopener', text: 'Open the Runway' }));
    f.appendChild(tools);
    f.appendChild(h('span', { class: 'asof' + (old ? ' warn' : ''), text: (d.src === 'lookahead' ? 'from the old look-ahead · ' : '') + 'as of ' + (d.asOf ? ptStamp(d.asOf) : 'unknown') + (old ? ' · older than a day' : '') }));
    box.appendChild(f);
  }
