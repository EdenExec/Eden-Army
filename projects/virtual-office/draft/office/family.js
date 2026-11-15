// Command Center · family.js (split from eden-office.html, 30 Oct 2026). Family wing: the look-ahead card (private; closes under Screen share).
// Panel files share the page's global scope and load in this order: core.js, floor.js, pulse.js, strip.js, family.js, desks.js, today.js, boot.js. Edit here, not in the html.
'use strict';
  /* ---------- Hawk's look-ahead card, inside the Family office wing (Kev, 30 Oct: "should we add our planning scheduler and a widget down here?") ----------
     Reads meta/lookahead, which Hawk writes: titles, dates and owners only, never a note. Private: hidden whole and unsubscribed under Screen share, like the wing. */
  function laDay(d, short2) {
    var x = new Date(d + 'T12:00:00Z'); if (isNaN(x)) return d;
    return x.toLocaleDateString('en-US', short2 ? { month: 'short', day: 'numeric', timeZone: 'UTC' } : { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }
  function laWhen(x, today) {
    if (x.start === today) return 'Today'; if (x.start === Game.addDays(today, 1) && !(x.end && x.end > x.start)) return 'Tomorrow';
    if (x.end && x.end > x.start) { var a = laDay(x.start, true), b = laDay(x.end, true); return a.split(' ')[0] === b.split(' ')[0] ? a + '–' + b.split(' ')[1] : a + ' – ' + b; }
    return laDay(x.start);
  }
  function laRow(x, today, withTag) {
    var ti = h('span', { class: 'ti' });
    if (withTag && x.kind === 'travel') ti.appendChild(h('span', { class: 'tag', text: 'Trip' }));
    if (withTag && x.kind === 'milestone') ti.appendChild(h('span', { class: 'tag ms', text: 'Milestone' }));
    ti.appendChild(document.createTextNode(x.title + (x.time ? ' · ' + x.time : '')));
    return h('li', null, h('span', { class: 'd', text: laWhen(x, today) }), ti, h('span', { class: 'o', text: x.owner || '' }));
  }
  /* The 12-week plan (Kev, 15 Nov: "a clean dumbed down 12-week plan in here + expandable"). Marlowe's runway rule for the glance:
     each week shows only its big thing (a trip, milestone, decision or anything longer than a day). Tap a week for its detail;
     "Show all 12 weeks" opens every week as a list. Reads meta/lookahead.plan, which Hawk's nightly mirror writes. */
  function laWeekBody(w, today) {
    var b = h('div', { class: 'la-wk' });
    if (w.one) b.appendChild(h('p', { class: 'one', text: w.one }));
    if (w.work) b.appendChild(h('p', { class: 'ln' }, h('b', { text: 'Work' }), w.work));
    if (w.family) b.appendChild(h('p', { class: 'ln' }, h('b', { text: 'Family' }), w.family));
    var it = Array.isArray(w.items) ? w.items : [];
    if (it.length) { var ul = h('ul'); it.forEach(function (x) { ul.appendChild(laRow(x, today, true)); }); b.appendChild(ul); }
    else if (!w.one && !w.work && !w.family) b.appendChild(h('p', { class: 'none', text: 'Nothing planned yet.' }));
    return b;
  }
  function laPlan(plan, today) {
    var wrap = h('div'), strip = h('div', { class: 'la-strip', role: 'list', 'aria-label': 'The next 12 weeks' });
    var open = typeof S.laWeek === 'number' && S.laWeek < plan.length ? S.laWeek : -1;
    plan.forEach(function (w, i) {
      var bigs = Array.isArray(w.big) ? w.big : [], n = Array.isArray(w.items) ? w.items.length : 0;
      var big = bigs.filter(function (x) { return x.start >= w.start; })[0] || bigs[0], cont = big && big.start < w.start;   // something that starts this week beats a trip carried over
      var head = big ? (cont ? '\u21B3 ' : '') + big.title : (w.one || '');
      var cell = h('button', { type: 'button', class: 'wk' + (i === 0 ? ' now' : '') + (big && !cont ? '' : ' quiet'), role: 'listitem', 'aria-expanded': String(open === i), title: 'Week of ' + laDay(w.start, true) + (n ? ' · ' + n + ' planned' : '') },
        h('span', { class: 'wn', text: (i === 0 ? 'This wk' : 'W' + (i + 1)) + ' · ' + laDay(w.start, true) }),
        h('span', { class: 'wt', text: head || '\u2014' }),
        n > 1 || (n === 1 && !big) ? h('span', { class: 'wc', text: (big ? '+' + (n - 1) : String(n)) + ' more' }) : null);
      if (big && big.kind === 'travel') cell.classList.add('trip');
      if (big && (big.kind === 'milestone' || big.kind === 'decision')) cell.classList.add('ms');
      cell.addEventListener('click', function () { S.laWeek = open === i ? -1 : i; S.laAll = false; renderAll(); });
      strip.appendChild(cell);
    });
    wrap.appendChild(strip);
    if (S.laAll) plan.forEach(function (w, i) { var sec = h('div', { class: 'la-all' }); sec.appendChild(h('h4', { text: (i === 0 ? 'This week' : 'Week ' + (i + 1)) + ' · ' + laDay(w.start, true) })); sec.appendChild(laWeekBody(w, today)); wrap.appendChild(sec); });
    else if (open >= 0) { var w = plan[open], sec = h('div', { class: 'la-all' }); sec.appendChild(h('h4', { text: (open === 0 ? 'This week' : 'Week ' + (open + 1)) + ' · ' + laDay(w.start, true) })); sec.appendChild(laWeekBody(w, today)); wrap.appendChild(sec); }
    var tg = h('button', { class: 'mini txt', type: 'button', 'aria-expanded': String(!!S.laAll), text: S.laAll ? 'Fold the 12 weeks' : 'Show all 12 weeks' });
    tg.addEventListener('click', function () { S.laAll = !S.laAll; S.laWeek = -1; renderAll(); });
    wrap.appendChild(tg);
    return wrap;
  }
  function renderLookahead() {
    var box = $('#la'); if (!box) return;
    box.textContent = '';
    if (S.share) { box.hidden = true; return; }
    box.hidden = false;
    var d = S.look, today = Game.pacificDate(Date.now());
    box.appendChild(h('div', { class: 'la-h' }, h('span', { class: 'eyebrow', text: '12-week plan · Hawk' }), h('span', { class: 'eyebrow', text: d && d.week && d.week.start ? 'Week of ' + laDay(d.week.start, true) : '' })));
    if (!d) { box.appendChild(h('p', { class: 'none', text: 'Hawk has not written the look-ahead yet. It shows here after the next nightly run.' })); return; }
    var w = d.week || {}, wk = h('div');
    wk.appendChild(h('h4', { text: 'This week' }));
    if (w.one) wk.appendChild(h('p', { class: 'one', text: w.one }));
    if (w.work) wk.appendChild(h('p', { class: 'ln' }, h('b', { text: 'Work' }), w.work));
    if (w.family) wk.appendChild(h('p', { class: 'ln' }, h('b', { text: 'Family' }), w.family));
    if (!w.one && !w.work && !w.family) wk.appendChild(h('p', { class: 'none', text: 'No focus set for this week yet.' }));
    box.appendChild(wk);
    var decs = Array.isArray(d.decisions) ? d.decisions : [], decIds = {}; decs.forEach(function (x) { decIds[x.id] = true; });
    var plan = Array.isArray(d.plan) ? d.plan.filter(function (w) { return w && w.start; }) : [];
    if (plan.length) box.appendChild(laPlan(plan, today));
    else {
      /* an older mirror (before the 12-week plan, 15 Nov): the next three weeks as a list */
      var nx = (Array.isArray(d.next) ? d.next : []).filter(function (x) { return !decIds[x.id]; });
      var cap = S.laAll ? nx.length : 6, nb = h('div'); nb.appendChild(h('h4', { text: 'Next 3 weeks' }));
      if (nx.length) {
        var ul = h('ul'); nx.slice(0, cap).forEach(function (x) { ul.appendChild(laRow(x, today, true)); }); nb.appendChild(ul);
        if (nx.length > 6) { var mb = h('button', { class: 'mini txt', type: 'button', text: S.laAll ? 'Show fewer' : '+' + (nx.length - 6) + ' more' }); mb.addEventListener('click', function () { S.laAll = !S.laAll; renderAll(); }); nb.appendChild(mb); }
      } else nb.appendChild(h('p', { class: 'none', text: 'Nothing dated in the next three weeks.' }));
      box.appendChild(nb);
    }
    if (decs.length) {
      var db = h('div'); db.appendChild(h('h4', { text: 'Open decisions · decide by' }));
      var dl = h('ul'); decs.forEach(function (x) { dl.appendChild(h('li', null, h('span', { class: 'd', text: x.start === today ? 'Today' : laDay(x.start) }), h('span', { class: 'ti', text: x.title }), h('span', { class: 'o', text: x.owner || '' }))); }); db.appendChild(dl);
      box.appendChild(db);
    }
    var old = Date.now() - t(d.asOf) > 36 * HOUR, f = h('div', { class: 'foot2' });
    if (typeof d.url === 'string' && /^https:\/\//.test(d.url)) f.appendChild(h('a', { class: 'mini', href: d.url, target: '_blank', rel: 'noopener', text: 'Edit in the Look Ahead' }));
    f.appendChild(h('a', { class: 'mini', href: 'https://claude.ai/artifact/LL1hw8T3s9Bqk8tJchv8Xv', target: '_blank', rel: 'noopener', text: 'Runway calendar' }));
    f.appendChild(h('span', { class: 'asof' + (old ? ' warn' : ''), text: 'as of ' + (d.asOf ? ptStamp(d.asOf) : 'unknown') + (old ? ' · older than a day' : '') }));
    box.appendChild(f);
  }
