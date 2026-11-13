// Command Center · core.js (split from eden-office.html, 30 Oct 2026). Shared core: constants, the game and projects cores, state, helpers, sheets, sync and calendar, data loading, boot().
// Panel files share the page's global scope and load in this order: core.js, floor.js, pulse.js, strip.js, family.js, desks.js, today.js, boot.js. Edit here, not in the html.
'use strict';
  /* Data contract (collections the page reads; it writes only tickets/, seen/, actions/, chats/{agent}/messages/ and daily/{date}/ticks/):
     agents/{id}  agents/{id}/log/{n}  alerts/{id}  actions/{key}  seen/{key}  tickets/{id}  tools/{id}  benches/{id}  benches/{id}/rows/{rid}  meta/sync  meta/today  daily/{date}  daily/{date}/ticks/{key}
     Spec: projects/virtual-office/research/q-architecture.md */
  var MIN = 60000, HOUR = 3600000, DAY = 86400000;
  var WORKING_FRESH_H = 4;
  var BLINK_CAP_MIN = 30;                    // Kev to confirm (Marlowe ask 2): blinks hold steady after 30 minutes
  var ORDER = ['urgent', 'reply', 'review', 'blocked', 'working', 'idle'];
  var WORD = { urgent: 'Urgent', reply: 'Reply', review: 'Ready to look', blocked: 'Blocked on Kev', working: 'Working', idle: 'Idle' };
  var SHAPE = { urgent: 'urgent', reply: 'reply', review: 'done', blocked: 'blocked', working: 'working', idle: 'idle' };   // Marlowe's data-s names
  var PILLARS = ['Righteousness', 'Winning', 'Accountability', 'Discipline', 'Transparency', 'Growth', 'Execution'];
  var loadedAt = Date.now();

  /* The ticket SLA, points, streak and records: ONE source, workshop/core/office-game.js, also run by the sync script and its tests. */
  /* GAME-CORE:START generated from workshop/core/office-game.js by `npm run office -- build-page`. Do not edit here. */
var Game = (function () {
// Eden Office game core: the ticket SLA ("FAIL" and "STALL"), the points, the streak and the records.
// ONE source, two homes. The sync script (workshop/core/office.ts) imports it; the Office page carries a verbatim copy between the
// GAME-CORE markers in projects/virtual-office/draft/office/core.js (`npm run office -- build-page` refreshes the copy; a test fails on drift).
// So: plain ES2015, no imports, no DOM, only exported functions and vars (the page wraps them in a closure named Game).
// Pure: every function takes `now` (ms) as an argument.
//
// THE RULES (Kev, 22 Oct 2026; the tests pin each one)
//   The runner clock counts 6am to 10pm Pacific, Sunday to Thursday, and 6am to sunset on Friday. Saturday never counts.
//   THE SABBATH (Kev, 24 Oct 2026) runs from Friday sunset to Saturday sunset where the family lives: Vancouver, WA until the move on Sun 8 Nov 2026 (moved from 6 Nov, Kev 3 Nov),
//   then Boise, ID (SABBATH_PLACES). Inside it nothing fails, nothing scores, nothing is announced. Saturday evening after sundown is when
//   held work is launched; it is still off the runner clock, which restarts Sunday 6am, so nothing filed on the Sabbath can FAIL that night.
//   FAIL   a ticket still `open` (nobody picked it up) after more than 60 runner minutes. Done and gated tickets are never in a FAIL state.
//   STALL  a ticket `picked` or `working` for more than 4 runner hours with no result.
//   A ticket that was picked up late stays a FAIL on the day it crossed 60 minutes (-3), so the streak and the score are honest history.
//   Points  closed ticket: 3 if priority is "today", else 2. +1 picked within 60 runner minutes. +2 closed the same Pacific day it was filed.
//           Kev's own moves: 2 each (a Done, Follow up or Approve tap, a QC approval). FAIL: -3.
//   Streak  consecutive working days (Sun to Fri, Saturday skipped without breaking it) with zero FAILs, counted from the first ticket on record.
//   `npm run sabbath` asks the same functions whether an instant is inside the Sabbath (exit 0) or not (exit 1); routines run it first.

var TZ = 'America/Los_Angeles';
var SLA_PICKUP_MIN = 60;
var STALL_MIN = 240;
var RUNNER_START_HOUR = 6;
var RUNNER_END_HOUR = 22;
var POINTS = { today: 3, other: 2, onClock: 1, sameDay: 2, kevMove: 2, fail: -3 };
var OPEN_STATUSES = ['open', 'picked', 'working', 'blocked', 'gated'];
/** A record is only announced once it is worth a banner. */
var RECORD_FLOORS = { closedInDay: 3, weekPoints: 10, streakDays: 3 };

var fmts = {};
function partsIn(ms, tz) {
  var f = fmts[tz] || (fmts[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }));
  var o = {};
  f.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; });
  return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second };
}
function parts(ms) { return partsIn(ms, TZ); }
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function parse(iso) { if (!iso) return null; var n = Date.parse(iso); return isNaN(n) ? null : n; }
function offsetAt(ms) { var p = parts(ms); return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000; }
function localMs(date, hour) {
  var a = date.split('-'), local = Date.UTC(+a[0], +a[1] - 1, +a[2], hour, 0, 0), u = local - offsetAt(local);
  return local - offsetAt(u);
}

/** 'YYYY-MM-DD' in Pacific time. */
function pacificDate(ms) { var p = parts(ms); return p.y + '-' + pad(p.mo) + '-' + pad(p.d); }
function dayOfWeek(date) { var a = date.split('-'); return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2])).getUTCDay(); }
function addDays(date, n) {
  var a = date.split('-'), x = new Date(Date.UTC(+a[0], +a[1] - 1, +a[2] + n));
  return x.getUTCFullYear() + '-' + pad(x.getUTCMonth() + 1) + '-' + pad(x.getUTCDate());
}
/** The Sunday that opens this date's week. */
function weekStart(date) { return addDays(date, -dayOfWeek(date)); }

/** Where the family keeps the Sabbath, by date ('YYYY-MM-DD'): each place holds from its `from` date until the next one's. */
var SABBATH_PLACES = [
  { from: '2000-01-01', name: 'Vancouver, WA', lat: 45.6387, lon: -122.6615, tz: 'America/Los_Angeles' },
  { from: '2026-11-08', name: 'Boise, ID', lat: 43.6150, lon: -116.2023, tz: 'America/Boise' },
];
function sabbathPlace(date) {
  var p = SABBATH_PLACES[0];
  for (var i = 1; i < SABBATH_PLACES.length; i++) if (date >= SABBATH_PLACES[i].from) p = SABBATH_PLACES[i];
  return p;
}
var RAD = Math.PI / 180;
/** Sunset (ms) on a calendar date at a place (default: where the family is that date). The NOAA sunrise equation, upper limb with refraction; within about a minute. */
function sunsetAt(date, place) {
  var pl = place || sabbathPlace(date), a = date.split('-');
  var n = Math.round(Date.UTC(+a[0], +a[1] - 1, +a[2], 12) / 86400000 + 2440587.5 - 2451545);
  var js = n - pl.lon / 360, m = (357.5291 + 0.98560028 * js) % 360, mr = m * RAD;
  var c = 1.9148 * Math.sin(mr) + 0.02 * Math.sin(2 * mr) + 0.0003 * Math.sin(3 * mr);
  var l = ((m + c + 180 + 102.9372) % 360) * RAD;
  var transit = 2451545 + js + 0.0053 * Math.sin(mr) - 0.0069 * Math.sin(2 * l);
  var sd = Math.sin(l) * Math.sin(23.4397 * RAD), cd = Math.cos(Math.asin(sd)), lat = pl.lat * RAD;
  var w = Math.acos((Math.sin(-0.833 * RAD) - Math.sin(lat) * sd) / (Math.cos(lat) * cd)) / RAD;
  return Math.round((transit + w / 360 - 2440587.5) * 86400000);
}
/** The Sabbath that holds `ms`, or the next one: {start: Friday's sunset, end: Saturday's sunset, friday, saturday, place, tz}. */
function sabbathWindow(ms) {
  var d = pacificDate(ms), dow = dayOfWeek(d), fri = dow === 6 ? addDays(d, -1) : addDays(d, (5 - dow + 7) % 7);
  function at(f) { var s = addDays(f, 1), p = sabbathPlace(f); return { start: sunsetAt(f, p), end: sunsetAt(s, p), friday: f, saturday: s, place: p.name, tz: p.tz }; }
  var w = at(fri);
  return ms >= w.end ? at(addDays(fri, 7)) : w;
}
/** True from Friday's sunset to Saturday's sunset. */
function isSabbathAt(ms) { var w = sabbathWindow(ms); return ms >= w.start && ms < w.end; }
/** Saturday (Pacific): the day the streak skips. Most of it is the Sabbath, and its evening is off the runner clock. */
function isSabbathDay(date) { return dayOfWeek(date) === 6; }

function runnerWindow(date) {
  var dow = dayOfWeek(date); if (dow === 6) return null;
  var a = localMs(date, RUNNER_START_HOUR), b = localMs(date, RUNNER_END_HOUR);
  if (dow === 5) b = Math.min(b, sunsetAt(date));   // Friday's clock stops at sunset
  return b > a ? [a, b] : null;
}
function isRunnerTime(ms) { var w = runnerWindow(pacificDate(ms)); return !!w && ms >= w[0] && ms < w[1]; }

/** Minutes of runner time between two instants: the only clock a ticket waits on. */
function runnerMinutes(from, to) {
  if (!(to > from)) return 0;
  var d = pacificDate(from), last = pacificDate(to), total = 0, guard = 0;
  while (guard++ < 800) {
    var w = runnerWindow(d);
    if (w) { var a = Math.max(from, w[0]), b = Math.min(to, w[1]); if (b > a) total += (b - a) / 60000; }
    if (d >= last) break;
    d = addDays(d, 1);
  }
  return total;
}
/** The instant when `minutes` of runner time have passed since `from` (with 0: the next moment the runner is on the clock). */
function addRunnerMinutes(from, minutes) {
  var d = pacificDate(from), left = minutes, guard = 0;
  while (guard++ < 800) {
    var w = runnerWindow(d);
    if (w && w[1] > from) {
      var a = Math.max(from, w[0]), room = (w[1] - a) / 60000;
      if (left <= room) return a + left * 60000;
      left -= room;
    }
    d = addDays(d, 1);
  }
  return from + minutes * 60000;
}

/** 2h 10m, 45m, 1d 3h. */
function fmtWait(min) {
  var m = Math.max(0, Math.floor(min));
  if (m < 60) return m + 'm';
  var h = Math.floor(m / 60);
  if (h < 24) return h + 'h ' + (m % 60) + 'm';
  return Math.floor(h / 24) + 'd ' + (h % 24) + 'h';
}
function clip(text, n) {
  var s = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}
/** "Ticket waiting 2h 10m: <ask, 60 chars>" or "Ticket stalled 5h 0m: <ask>". */
function slaTitle(state, minutes, ask) { return 'Ticket ' + (state === 'stall' ? 'stalled ' : 'waiting ') + fmtWait(minutes) + ': ' + clip(ask, 60); }

function hasResult(t) { return !!(t.result && (t.result.summary || t.result.link)); }

/** When a ticket was picked up (ms), or null while it is still `open`. A done ticket with no pickedAt counts as picked when it closed. */
function pickupAt(t) {
  if (!t.status || t.status === 'open') return null;
  var pk = parse(t.pickedAt);
  if (pk == null && t.status === 'done') pk = parse(t.doneAt);
  if (pk == null) pk = parse(t.updatedAt);
  return pk;
}
/** The instant a ticket's 60 runner minutes run out. */
function failDeadline(t) { var c = parse(t.createdAt); return c == null ? null : addRunnerMinutes(c, SLA_PICKUP_MIN); }
/** When this ticket FAILED (ms), or null. History: a ticket picked up late still failed, whatever it became since. */
function failedAt(t, now) {
  var dl = failDeadline(t); if (dl == null || dl > now) return null;
  var pk = pickupAt(t), end = pk != null ? pk : (t.status === 'open' ? now : null);
  return end != null && end > dl ? dl : null;
}
/** The live state of one ticket: {state: 'ok'|'fail'|'stall', minutes, since}. Done, gated and blocked tickets are always ok. The Sabbath is always ok. */
function slaState(t, now) {
  var c = parse(t.createdAt), ok = { state: 'ok', minutes: 0, since: null };
  if (c == null || isSabbathAt(now)) return ok;
  if (t.status === 'open') {
    var w = runnerMinutes(c, now);
    return w > SLA_PICKUP_MIN ? { state: 'fail', minutes: w, since: addRunnerMinutes(c, SLA_PICKUP_MIN) } : { state: 'ok', minutes: w, since: null };
  }
  if ((t.status === 'picked' || t.status === 'working') && !hasResult(t)) {
    var s = parse(t.pickedAt) || parse(t.updatedAt) || c, w2 = runnerMinutes(s, now);
    if (w2 > STALL_MIN) return { state: 'stall', minutes: w2, since: addRunnerMinutes(s, STALL_MIN) };
  }
  return ok;
}
/** Every ticket that is failing or stalled right now. */
function slaFindings(tickets, now) {
  var out = [];
  (tickets || []).forEach(function (t) {
    var s = slaState(t, now);
    if (s.state !== 'ok') out.push({ id: t.id, agent: t.agent, state: s.state, minutes: s.minutes, since: s.since });
  });
  return out;
}

/** What closing this ticket scored: {points, base, onClock, sameDay, date}, or null if it is not a done ticket. */
function ticketScore(t) {
  var c = parse(t.createdAt), dn = parse(t.doneAt) || parse(t.updatedAt);
  if (t.status !== 'done' || c == null || dn == null) return null;
  var pk = pickupAt(t), dl = addRunnerMinutes(c, SLA_PICKUP_MIN), date = pacificDate(dn);
  var onClock = (pk == null ? dn : pk) <= dl, sameDay = pacificDate(c) === date, base = t.priority === 'today' ? POINTS.today : POINTS.other;
  return { points: base + (onClock ? POINTS.onClock : 0) + (sameDay ? POINTS.sameDay : 0), base: base, onClock: onClock, sameDay: sameDay, date: date };
}

function median(xs) {
  if (!xs.length) return null;
  var s = xs.slice().sort(function (a, b) { return a - b; }), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * The whole game for one moment. input: {now, tickets: [...], actions: [{action, at}], qcByDay: {'YYYY-MM-DD': n}}.
 * Everything is derived from the tickets collection's history, so nothing is stored that cannot be recomputed.
 */
function buildGame(input) {
  var now = input.now, tickets = input.tickets || [], actions = input.actions || [], qcByDay = input.qcByDay || {};
  var today = pacificDate(now), sab = isSabbathAt(now), days = {}, first = null;
  function D(date) { return days[date] || (days[date] = { date: date, points: 0, closed: 0, fails: 0, kev: 0, qc: 0 }); }
  var closedEvents = [], failEvents = [], pickups = [];

  tickets.forEach(function (t) {
    var c = parse(t.createdAt); if (c == null) return;
    var cd = pacificDate(c); if (first === null || cd < first) first = cd;
    var dl = addRunnerMinutes(c, SLA_PICKUP_MIN), f = failedAt(t, now), pk = pickupAt(t);
    if (f != null) { var fd = pacificDate(f); failEvents.push({ id: t.id, agent: t.agent, date: fd }); D(fd).fails++; D(fd).points += POINTS.fail; }
    if (pk != null) pickups.push({ agent: t.agent, date: pacificDate(pk), minutes: runnerMinutes(c, pk) });
    if (t.status === 'done') {
      var sc = ticketScore(t), dn = parse(t.doneAt) || parse(t.updatedAt);
      if (!sc || dn > now || isSabbathAt(dn)) return;
      closedEvents.push({ id: t.id, agent: t.agent, date: sc.date, points: sc.points, onClock: sc.onClock, sameDay: sc.sameDay, minutes: (dn - c) / 60000 });
      D(sc.date).closed++; D(sc.date).points += sc.points;
    }
  });
  var kevEvents = 0;
  actions.forEach(function (a) {
    if (!a || (a.action !== 'done' && a.action !== 'followup' && a.action !== 'approve')) return;   // approve: Kev's own yes in the Office (23 Oct)
    var at = parse(a.at); if (at == null) return;
    if (isSabbathAt(at)) return;
    var d = pacificDate(at);
    D(d).kev++; D(d).points += POINTS.kevMove; kevEvents++;
  });
  Object.keys(qcByDay).forEach(function (d) {
    var n = +qcByDay[d] || 0; if (!n || isSabbathDay(d)) return;   // a day count, no time of day: Saturday is skipped whole
    D(d).qc += n; D(d).points += POINTS.kevMove * n;
  });

  var ws = weekStart(today), we = addDays(ws, 6), lws = addDays(ws, -7), lwe = addDays(ws, -1);
  function sum(from, to) {
    var s = { start: from, points: 0, closed: 0, fails: 0, kev: 0, qc: 0 };
    Object.keys(days).forEach(function (d) { if (d >= from && d <= to) { var x = days[d]; s.points += x.points; s.closed += x.closed; s.fails += x.fails; s.kev += x.kev; s.qc += x.qc; } });
    return s;
  }
  var inWeek = function (d) { return d >= ws && d <= we; };

  // leaderboard, this week
  var ag = {};
  function A(id) { return ag[id] || (ag[id] = { agent: id, closed: 0, fails: 0, points: 0, mins: [] }); }
  closedEvents.forEach(function (e) { if (inWeek(e.date)) { var a = A(e.agent); a.closed++; a.points += e.points; a.mins.push(e.minutes); } });
  failEvents.forEach(function (e) { if (inWeek(e.date)) { var a = A(e.agent); a.fails++; a.points += POINTS.fail; } });
  var rows = Object.keys(ag).map(function (id) { var a = ag[id]; return { agent: id, closed: a.closed, fails: a.fails, points: a.points, medianCloseMin: median(a.mins) }; })
    .sort(function (x, y) { return (y.points - x.points) || (y.closed - x.closed) || (x.agent < y.agent ? -1 : 1); });
  var wk = sum(ws, we);

  // open now, the oldest waiting
  var openNow = 0, oldest = null;
  tickets.forEach(function (t) {
    if (OPEN_STATUSES.indexOf(t.status) >= 0) openNow++;
    var c = parse(t.createdAt);
    if (t.status === 'open' && c != null && (oldest === null || c < oldest.at)) oldest = { id: t.id, agent: t.agent, createdAt: t.createdAt, at: c };
  });
  if (oldest) oldest = { id: oldest.id, agent: oldest.agent, createdAt: oldest.createdAt, waitedMin: runnerMinutes(oldest.at, now) };
  var pickMins = pickups.filter(function (p) { return inWeek(p.date); }).map(function (p) { return p.minutes; });

  // streak and records, walking the working days from the first ticket on record
  var run = 0, longest = { days: 0, on: null }, d = first, guard = 0;
  while (d !== null && d <= today && guard++ < 800) {
    if (!isSabbathDay(d)) {
      if (days[d] && days[d].fails > 0) run = 0; else run++;
      if (run > longest.days) longest = { days: run, on: d };
    }
    d = addDays(d, 1);
  }
  var mostClosed = { n: 0, date: null, on: null }, weeks = {}, dates = Object.keys(days).sort();
  dates.forEach(function (dt) {
    if (days[dt].closed > mostClosed.n) mostClosed = { n: days[dt].closed, date: dt, on: dt };
    var w = weekStart(dt), x = weeks[w] || (weeks[w] = { points: 0, on: null });
    x.points += days[dt].points; if (days[dt].points > 0) x.on = dt;
  });
  var bestWeek = { points: 0, weekOf: null, on: null };
  Object.keys(weeks).sort().forEach(function (w) { if (weeks[w].points > bestWeek.points) bestWeek = { points: weeks[w].points, weekOf: w, on: weeks[w].on }; });
  var zero = { date: today, points: 0, closed: 0, fails: 0, kev: 0, qc: 0 };

  return {
    today: today, sabbath: sab,
    day: days[today] || zero,
    week: wk, lastWeek: sum(lws, lwe),
    openNow: openNow, oldest: oldest, medianPickupMin: median(pickMins),
    streak: run, agents: rows,
    kev: { moves: wk.kev + wk.qc, points: (wk.kev + wk.qc) * POINTS.kevMove },
    records: { mostClosedDay: mostClosed, bestWeek: bestWeek, longestStreak: longest },
    firstDay: first,
  };
}

function better(a, b, key) { return !b || !(b[key] > 0) ? a : (a && a[key] > b[key] ? a : b); }
/** Records only ever advance: today's computation against what meta/records already holds (a tie keeps the earlier one). */
function mergeRecords(live, prior) {
  prior = prior || {};
  return {
    mostClosedDay: better(live.mostClosedDay, prior.mostClosedDay, 'n'),
    bestWeek: better(live.bestWeek, prior.bestWeek, 'points'),
    longestStreak: better(live.longestStreak, prior.longestStreak, 'days'),
  };
}
/** Records set today that deserve their one quiet banner. `key` is what the page remembers so a banner shows once. Never on Saturday (the page also holds every banner while the Sabbath is on). */
function newRecords(rec, today) {
  var out = [];
  if (isSabbathDay(today) || !rec) return out;
  var m = rec.mostClosedDay, b = rec.bestWeek, s = rec.longestStreak;
  if (m && m.n >= RECORD_FLOORS.closedInDay && m.on === today) out.push({ key: 'closed:' + today, text: 'New course record: ' + m.n + ' tickets closed in a day' });
  if (b && b.points >= RECORD_FLOORS.weekPoints && b.on === today) out.push({ key: 'week:' + b.weekOf, text: 'New course record: best week, ' + b.points + ' points' });
  if (s && s.days >= RECORD_FLOORS.streakDays && s.on === today) out.push({ key: 'streak:' + today, text: 'New course record: longest streak, ' + s.days + ' working days clean' });
  return out;
}
return { SLA_PICKUP_MIN: SLA_PICKUP_MIN, STALL_MIN: STALL_MIN, RUNNER_START_HOUR: RUNNER_START_HOUR, RUNNER_END_HOUR: RUNNER_END_HOUR, POINTS: POINTS, OPEN_STATUSES: OPEN_STATUSES, RECORD_FLOORS: RECORD_FLOORS, pacificDate: pacificDate, dayOfWeek: dayOfWeek, addDays: addDays, weekStart: weekStart, SABBATH_PLACES: SABBATH_PLACES, sabbathPlace: sabbathPlace, sunsetAt: sunsetAt, sabbathWindow: sabbathWindow, isSabbathAt: isSabbathAt, isSabbathDay: isSabbathDay, isRunnerTime: isRunnerTime, runnerMinutes: runnerMinutes, addRunnerMinutes: addRunnerMinutes, fmtWait: fmtWait, clip: clip, slaTitle: slaTitle, pickupAt: pickupAt, failDeadline: failDeadline, failedAt: failedAt, slaState: slaState, slaFindings: slaFindings, ticketScore: ticketScore, buildGame: buildGame, mergeRecords: mergeRecords, newRecords: newRecords };
})();
/* GAME-CORE:END */
  /* PROJECTS-CORE:START generated from workshop/core/office-projects.js by `npm run office -- build-page`. Do not edit here. */
var Proj = (function () {
// Eden Office projects core: short titles, which project a ticket belongs to, and the item lists on an agent's desk.
// ONE source, two homes (same pattern as office-game.js). The sync (workshop/core/office-projects.ts, run hourly by office-prep) imports it;
// the Office page carries a verbatim copy between the PROJECTS-CORE markers (`npm run office -- build-page` refreshes it; a test fails on drift).
// So: plain ES2015, no imports, no DOM, only exported functions and vars (the page wraps them in a closure named Proj).
//
// Kev, 29 Oct 2026: "we need the feed to be a list of clickable projects we're working on with each bot. Tasks should be far more collapsed and have a
// title on them explaining what is done. but less is more here."

var TITLE_WORDS = 8;     // a ticket or item title
var STATUS_WORDS = 10;   // a project's one-line status
var NEED_WORDS = 12;     // the "what I need from Kev" line
var SHIPPED_DAYS = 7;    // shipped items stay on the desk this long
var DAY_MS = 86400000;

/** Collapse whitespace. */
function squash(text) { return String(text == null ? '' : text).replace(/\s+/g, ' ').trim(); }

/** Cut at n words, never mid-word; an ellipsis marks a cut. Trailing punctuation and open brackets are dropped before the ellipsis. */
function cutWords(text, n) {
  var s = squash(text); if (!s) return '';
  var w = s.split(' '); if (w.length <= n) return s;
  return w.slice(0, n).join(' ').replace(/[\s,;:.\-–—(\[]+$/, '') + '…';
}

/** The first clause: up to the first sentence end, semicolon, colon, dash or opening bracket. "Matched 6 of 8; 2 left unknown" -> "Matched 6 of 8". */
function firstClause(text) {
  var s = squash(text).replace(/^[#>*\-\s"']+/, '');
  var m = /^(.{3,}?)(?:[.;:!?](?:\s|$)|\s[—–-]\s|\s\(|$)/.exec(s);
  return m ? m[1] : s;
}

/** The title the desk shows: the ticket's own `title` if the runner wrote one, else the first clause of the result summary (finished work) or of the ask. */
function ticketTitle(x) {
  if (x.title) return cutWords(x.title, TITLE_WORDS);
  var summary = x.result && x.result.summary;
  var src = x.status === 'done' && summary ? summary : x.ask, c = firstClause(src);
  return cutWords(c.split(' ').length < 3 ? squash(src) : c, TITLE_WORDS);   // a one- or two-word clause ("Passed 3/3") says nothing: take the opening words instead
}

/** What is needed from Kev, in about 12 words: why a ticket is blocked (`blockedOn`), or the exact action waiting for his Approve (`proposed.exact`). */
function needLine(x) {
  var s = x.status === 'blocked' ? x.blockedOn : x.status === 'gated' ? (x.proposed && x.proposed.exact) : (x.blockedOn || (x.proposed && x.proposed.exact));
  return cutWords(s, NEED_WORDS);
}

/** needs = waiting on Kev (blocked or gated); shipped = done; open = everything else still moving (open, picked, working, waiting). */
function ticketState(x) {
  return x.status === 'blocked' || x.status === 'gated' ? 'needs' : x.status === 'done' ? 'shipped' : 'open';
}
function isLive(x) { return ['open', 'picked', 'working', 'waiting', 'blocked', 'gated'].indexOf(x.status) >= 0; }

function esc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** Which project a ticket belongs to (defs = [{id, keywords}]). Order, first hit wins:
 *   1. the ticket's own `project` field, when it names a known project;
 *   2. a repo path in the ticket text or result link ("projects/eden-crm/..."): the folder name is the project;
 *   3. keywords: the project with the most whole-word keyword hits in the ask, title and result summary.
 *  Returns {id, how: 'field'|'path'|'keyword'} or null (the ticket is "other open work"). */
function inferProject(x, defs) {
  var list = defs || [], i, j;
  if (x.project) for (i = 0; i < list.length; i++) if (list[i].id === x.project) return { id: list[i].id, how: 'field' };
  var hay = [x.ask, x.title, x.result && x.result.summary, x.result && x.result.link].join(' ').toLowerCase();
  for (i = 0; i < list.length; i++) if (hay.indexOf('projects/' + list[i].id + '/') >= 0) return { id: list[i].id, how: 'path' };
  var best = null, bestN = 0;
  for (i = 0; i < list.length; i++) {
    var n = 0, ks = list[i].keywords || [];
    for (j = 0; j < ks.length; j++) if (ks[j] && new RegExp('(^|[^a-z0-9])' + esc(String(ks[j]).toLowerCase()) + '([^a-z0-9]|$)').test(hay)) n++;
    if (n > bestN) { best = list[i].id; bestN = n; }
  }
  return best ? { id: best, how: 'keyword' } : null;
}

/** One item from a ticket. `link` is whatever the ticket carries (result.link); each home turns it into an http(s) URL. */
function ticketItem(x) {
  return { title: ticketTitle(x), state: ticketState(x), link: (x.result && x.result.link) || '', at: x.doneAt || x.updatedAt || x.createdAt || null, ticket: x.id };
}

/** Split an agent's tickets into per-project lists and the rest. Done tickets older than SHIPPED_DAYS drop out; so do cancelled ones. */
function groupTickets(tickets, defs, now) {
  var by = {}, loose = [];
  (tickets || []).forEach(function (x) {
    if (!isLive(x) && !(x.status === 'done' && recent(x.doneAt || x.updatedAt || x.createdAt, now))) return;
    var p = inferProject(x, defs);
    if (p) (by[p.id] = by[p.id] || []).push(x); else loose.push(x);
  });
  return { byProject: by, loose: loose };
}

function recent(at, now) {
  if (!at) return true;
  var ms = typeof at === 'number' ? at : Date.parse(at);
  return isNaN(ms) || now - ms <= SHIPPED_DAYS * DAY_MS;
}

var ORDER = { needs: 0, open: 1, shipped: 2 };
/** A project's items: file items (a schedule's rows) plus its tickets' items, shipped ones only if recent, grouped needs / open / shipped (shipped newest first). */
function mergeItems(fileItems, tickets, now) {
  var items = (fileItems || []).concat((tickets || []).map(ticketItem)).filter(function (i) { return i.state !== 'shipped' || recent(i.at, now); });
  return items.map(function (i, n) { return { i: i, n: n }; }).sort(function (a, b) {
    var d = ORDER[a.i.state] - ORDER[b.i.state];
    if (d) return d;
    if (a.i.state === 'shipped') { var t = (Date.parse(b.i.at) || 0) - (Date.parse(a.i.at) || 0); if (t) return t; }
    return a.n - b.n;
  }).map(function (o) { return o.i; });
}

function countItems(items) {
  var c = { needs: 0, open: 0, shipped: 0 };
  (items || []).forEach(function (i) { if (c[i.state] !== undefined) c[i.state]++; });
  return c;
}

/** The chips on a project row: "2 open · 1 needs you · 3 shipped" as separate strings, zeros left out. */
function chips(c) {
  var out = [];
  if (c.open) out.push(c.open + ' open');
  if (c.needs) out.push(c.needs + ' needs you');
  if (c.shipped) out.push(c.shipped + ' shipped');
  return out;
}

/** The status line when no file says one: the newest shipped item, else what is waiting. At most STATUS_WORDS words. */
function autoStatus(items) {
  var c = countItems(items);
  var shipped = (items || []).filter(function (i) { return i.state === 'shipped'; })[0];
  if (c.needs) return cutWords('Waiting on Kev: ' + items.filter(function (i) { return i.state === 'needs'; })[0].title, STATUS_WORDS);
  if (c.open) return cutWords('Working: ' + items.filter(function (i) { return i.state === 'open'; })[0].title, STATUS_WORDS);
  if (shipped) return cutWords('Last shipped: ' + shipped.title, STATUS_WORDS);
  return 'Quiet this week';
}
return { TITLE_WORDS: TITLE_WORDS, STATUS_WORDS: STATUS_WORDS, NEED_WORDS: NEED_WORDS, SHIPPED_DAYS: SHIPPED_DAYS, squash: squash, cutWords: cutWords, firstClause: firstClause, ticketTitle: ticketTitle, needLine: needLine, ticketState: ticketState, isLive: isLive, inferProject: inferProject, ticketItem: ticketItem, groupTickets: groupTickets, recent: recent, mergeItems: mergeItems, countItems: countItems, chips: chips, autoStatus: autoStatus };
})();
/* PROJECTS-CORE:END */

  /* Mirrors projects/virtual-office/tools.json (a test keeps the urls in step). Live `tools` docs override by id. */
  var DEFAULT_TOOLS = [
    { id: 'hub', name: 'Team Hub', url: 'https://claude.ai/artifact/7kccfScydYDcWoXfeeE8q6' },
    { id: 'eden-daily', name: 'Eden Daily', url: 'https://claude.ai/artifact/6WCnWouUfZFBXL1FNZMGi2' },
    { id: 'day-board', name: 'Day Board', url: 'https://claude.ai/artifact/4QFTb8NFvWhbc2jg5zD4hc' },
    { id: 'workshop', name: 'Employee Workshop', url: 'https://claude.ai/artifact/8nmNm3TD2MaJzia8tvHFxR' },
    { id: 'eden-desk', name: 'Eden Desk', url: 'https://claude.ai/artifact/5SuFoioujKFV6KgX4dXi3G' },
    { id: 'atlas-desk', name: 'Atlas Desk', url: 'https://claude.ai/artifact/Hy19F4FNCKe18QHUvRqj6h' },
    { id: 'marlowe-desk', name: "Marlowe's Desk", url: 'https://claude.ai/artifact/2eHGZMaWKJox5hFGHYWLPo' },
    { id: 'org-chart', name: 'Org chart', url: 'https://claude.ai/artifact/CyZ475DJjbNNaGbfc93nZN' },
    { id: 'ledger', name: 'Notion ledger', url: 'https://app.notion.com/p/3ce25d7d12f48110b9f2d1dcda440b90' },
    { id: 'quickbooks', name: 'QuickBooks', url: 'https://qbo.intuit.com' },
    { id: 'gusto', name: 'Gusto', url: 'https://app.gusto.com' },
    { id: 'cloudtalk', name: 'CloudTalk phone', url: 'https://phone.cloudtalk.io' },
    { id: 'crelate', name: 'Crelate', url: 'https://app.crelate.com' },
    { id: 'round-table', name: 'Round Table', url: 'https://claude.ai/artifact/DTXbu7B6F3B2s8NEnmYdCE' },
    { id: 'staffing-doc', name: 'Eden Staffing doc', url: 'https://docs.google.com/document/d/1e1KMIudOcvCG2baYmYGe-fIOMKoi43NkFLxPmR1gq7I/edit' }
  ];
  /* Kev, 23 Oct: every agent has its own Claude Code session (full skills, files and history). Desk buttons and the org chart open it.
     Mirrors projects/virtual-office/sessions.json; live `sessions/{agent}` docs override. */
  var DEFAULT_SESSIONS = {"radar":"https://claude.ai/code/session_012ech5hw2f8wh5988FWa92Z","host":"https://claude.ai/code/session_01HWXpQMMCrS1aHrLGE4iPN9","scout":"https://claude.ai/code/session_013d6RV5F2UzvavY5KYE5gC2","dean":"https://claude.ai/code/session_01VTzuVbujV9WkkNEL1uTxC3","q":"https://claude.ai/code/session_01NaV6afr4cxChSyMxf4QjCS","pm":"https://claude.ai/code/session_01NmQm57E8JzXPM5yhiivmWp","tally":"https://claude.ai/code/session_01QjJJfHL3pbHoRFQYyP5gRj","docket":"https://claude.ai/code/session_01LKexcLmbP1uHLF2QuAEEJK","atlas":"https://claude.ai/code/session_019WiV7BNnqiAwEFE1fid2qq","housing-architect":"https://claude.ai/code/session_01DrdWBy2LzD2hVrTfxgF2wL","keys":"https://claude.ai/code/session_01YT6ywzc4eEs4VZMxo8Dhkf","hale":"https://claude.ai/code/session_01QfufmucSF1Kvw417paHgCT","jethro":"https://claude.ai/code/session_019kpA2jTPA59tgNxwEQLsbp","barnabas":"https://claude.ai/code/session_01Bb8T7ZJX5HwgGEhww9MN5P","casey":"https://claude.ai/code/session_01Ep3HKBB1EzzeBw8Zh2Ndks"};
  function sessionUrl(id) { var x = S.sessions && S.sessions[id]; return (x && x.url) || DEFAULT_SESSIONS[id] || null; }
  var AGENT_TOOLS = { radar: ['eden-daily', 'day-board', 'eden-desk', 'ledger', 'hub'], scout: ['hub'], q: ['workshop', 'hub'], dean: ['round-table', 'hub'], host: ['eden-desk', 'hub'], tally: ['cash-pulse', 'quickbooks', 'gusto', 'hub'], docket: ['cash-pulse', 'quickbooks'], atlas: ['atlas-desk'], 'housing-architect': ['marlowe-desk'], keys: ['eden-desk'], hale: ['eden-desk'], jethro: ['eden-desk'], barnabas: ['eden-desk'], pm: ['staffing-doc', 'hub'], casey: ['hub', 'crelate'], ember: ['hub', 'crelate'] };
  var BENCH_TOOLS = { recruiting: ['round-table', 'hub'], depth: ['round-table', 'hub'], revenue: ['cash-pulse', 'hub', 'quickbooks'], university: ['hub'], finance: ['cash-pulse', 'quickbooks', 'gusto', 'hub'], client: ['hub', 'cloudtalk', 'crelate'], family: ['atlas-desk', 'marlowe-desk'], projects: ['staffing-doc', 'hub'] };
  /* Bench skeletons: the floor always has its benches; docs in `benches/` fill in the figures. */
  var BENCH_DEFS = [
    { id: 'recruiting', zone: 'rec', title: 'Recruiting floor · Vancouver', sub: 'Coaching · scorecards · deliverables', owner: 'Dean', sensitive: true, cls: 'bench priv' },
    { id: 'revenue', zone: 'rev', title: 'Revenue', sub: 'Vancouver numbers · Tally + Dean', owner: 'Tally + Dean', sensitive: true, cls: 'bench tall' },
    { id: 'finance', zone: 'fin', title: 'Finance', sub: 'Cash · invoices · P&L · payroll', owner: 'Tally', sensitive: true, cls: 'bench' },
    { id: 'depth', zone: 'ppl', title: 'Hiring ramp', sub: 'Depth chart · onboarding · PDF scorecards via Upload', owner: 'Dean', sensitive: true, cls: 'bench priv' },
    { id: 'university', zone: 'ppl', title: 'Eden University', sub: 'Tracks · Wednesday training', owner: 'Dean', sensitive: false, cls: 'bench' },
    { id: 'client', zone: 'cli', title: 'Client work', sub: 'Job orders · depth charts · leads', owner: 'Casey', sensitive: false, cls: 'bench' },
    { id: 'projects', zone: 'spx', title: 'Eden Staffing · with Nick', sub: 'Temp staffing launch · deliverables', owner: 'Pam', sensitive: false, cls: 'bench' },
    { id: 'family', zone: 'fam', title: 'Home list', sub: 'KDTW Group · family office', owner: 'Radar', sensitive: true, cls: 'bench' }
  ];

  var S = { sessions: {}, live: false, canWrite: true, share: false, agents: {}, alerts: {}, actions: {}, seen: {}, tickets: {}, benches: {}, benchRows: {}, crelate: null, phones: null, tools: {}, logs: {}, chats: {}, assets: null, photo: null, pending: null, sample: null, meta: null, records: null, sound: true, lineSeen: null, today: null, look: null, ctasks: null, credits: null, sheet: null, formOpen: false, flash: '', unsub: {}, db: null };
  var lastFrom = null;

  /* ---------- helpers ---------- */
  function $(s, el) { return (el || document).querySelector(s); }
  function h(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === 'class') e.className = attrs[k]; else if (k === 'text') e.textContent = attrs[k]; else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k]); });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c == null) continue; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); }
    return e;
  }
  function t(iso) { var n = Date.parse(iso); return isNaN(n) ? 0 : n; }
  function short(iso) {
    if (!iso) return 'never'; var d = Date.now() - t(iso);
    if (d < MIN) return 'now'; if (d < HOUR) return Math.floor(d / MIN) + 'm'; if (d < DAY) return Math.floor(d / HOUR) + 'h'; return Math.floor(d / DAY) + 'd';
  }
  function ago(iso) { var s = short(iso); return s === 'now' ? 'just now' : s === 'never' ? 'never' : s + ' ago'; }
  function led(light, extra) { var i = h('i', { class: 'led', 'data-s': SHAPE[light] }); if (extra) i.setAttribute('aria-hidden', 'true'); return i; }
  function papers(n) { if (!n) return null; var s = h('span', { class: 'papers', title: n + ' open ticket' + (n > 1 ? 's' : '') }); for (var i = 0; i < Math.min(n, 3); i++) s.appendChild(h('i')); return s; }
  function sensitiveAgent(id) { return WING.indexOf(id) >= 0 || !!(S.agents[id] && S.agents[id].sensitive); }   // the wing is private whatever a synced doc says
  function hidden(a) { return S.share && sensitiveAgent(a.id); }

  /* ---------- tools ---------- */
  function toolMap() {
    var m = {}; DEFAULT_TOOLS.forEach(function (x) { m[x.id] = x; });
    Object.keys(S.tools).forEach(function (k) { var x = S.tools[k]; m[x.id || k] = Object.assign({}, m[x.id || k] || {}, x); });
    return m;
  }
  function toolLink(x, cls) {
    var a = h('a', { href: x.url, target: '_blank', rel: 'noopener', class: cls || 'mini', text: x.name });
    a.addEventListener('click', function () { markSeen('open-' + x.id); });     // the only usage evidence the Office collects itself
    return a;
  }
  /* Result links: the sync sometimes writes a repo path ("employees/dean/drafts/x.md") instead of a URL, and a bare path opens nothing inside
     the artifact frame. Any link that is not already http(s) or mailto is treated as a path in the Agent-Builder repo and opened on GitHub. */
  var REPO_BLOB = 'https://github.com/EdenExec/Agent-Builder/blob/claude/pensive-brown-18gll8/';
  function linkUrl(u) { u = String(u == null ? '' : u).trim(); if (!u) return ''; if (/^(https?:|mailto:)/i.test(u) || /^\/_blob\//.test(u)) return u; return REPO_BLOB + u.replace(/^\.?\/+/, ''); }
  function toolsFor(ids) { var m = toolMap(); return (ids || []).map(function (i) { return m[i]; }).filter(function (x) { return x && x.url; }); }

  /* ---------- lights (page side; the sync script computes the same rule into agents/{id}) ---------- */
  function isSeen(key) { return !!S.seen[key]; }
  function ticketHidden(tk) { return S.share && sensitiveAgent(tk.agent); }
  function agentItems(id) {
    var out = [];
    Object.keys(S.alerts).forEach(function (k) {
      var a = S.alerts[k]; if (a.agent !== id || a.kind === 'sla' || (S.share && (a.sensitive || sensitiveAgent(a.agent)))) return;   // SLA alerts are recomputed live below, so they are never an hour stale
      if (acted(a.id) || stripHidden(a.id, a)) return;     // Kev marked it done, moved it to follow-up, or snoozed it; or answered it on the strip; or Radar snoozed it (snoozeUntil)
      var seen = isSeen(a.id) && !(a.light === 'urgent' && Date.now() - t(S.seen[a.id].at) > DAY);   // a seen red comes back to the top of the list after a day (Kev, 26 Oct)
      if (seen && a.light !== 'urgent') return;           // seen clears everything but red; red holds steady until the source resolves
      var rel = a.link ? null : relatedTicket(a);
      out.push({ light: a.light, title: a.title, raisedAt: a.raisedAt, seen: seen, key: a.id, needsKev: a.needsKev, link: a.link || (rel && rel.result && rel.result.link) || null, preview: a.preview, rank: a.rank, why: a.why, kind: a.kind, proposed: a.proposed || null, agent: id, found: rel && rel.result && rel.result.summary ? { text: rel.result.summary, from: rel.id } : null });
    });
    Object.keys(S.tickets).forEach(function (k) {
      var tk = S.tickets[k]; if (tk.agent !== id || ticketHidden(tk)) return;
      var f = derived().sla[tk.id];                        // FAIL (red) or STALL (amber), by the page's own clock
      if (f) out.push({ light: f.state === 'fail' ? 'urgent' : 'blocked', title: Game.slaTitle(f.state, f.minutes, tk.ask), raisedAt: new Date(f.since).toISOString(), key: 'sla-' + f.state + '-' + tk.id, needsKev: false, agent: id, kind: 'sla', seen: false });
      var key = 'ticket-' + tk.id + '-' + tk.status;
      if (acted(key) || stripHidden(key)) return;
      // Kev, 26 Oct: a gated or blocked ticket stays on its desk until he taps Done or Follow up; Seen only quiets the strip (it was on the line with no way to close it).
      if (tk.status === 'blocked' || tk.status === 'gated') out.push({ light: 'blocked', title: 'Ticket needs you: ' + tk.ask, raisedAt: tk.updatedAt || tk.createdAt, key: key, needsKev: true, agent: id, seen: isSeen(key), link: tk.result && tk.result.link });
      // Kev, 4 Nov ("instant decision fatigue"): a finished ticket no longer asks him to look; it rests on its desk and in the done log (Marlowe's flow, phase 1).
    });
    return out;
  }
  /* An alert that arrives with no link (a gate that cleared, a blocker) still has its work somewhere: the ticket that produced it.
     Match a gate by its id in the ticket's result ("Gate 7ce970 PASSED"), else take the same agent's latest finished ticket from the day before the alert. */
  function relatedTicket(a) {
    var tks = Object.keys(S.tickets).map(function (k) { return S.tickets[k]; }).filter(function (x) { return x.agent === a.agent && x.result && (x.result.summary || x.result.link); });
    if (!tks.length) return null;
    var gid = /([0-9a-f]{6,})$/i.exec(String(a.source || a.id || ''));
    if (gid) { var g = tks.filter(function (x) { return String(x.result.summary || '').toLowerCase().indexOf(gid[1].toLowerCase()) >= 0; })[0]; if (g) return g; }
    if (a.kind !== 'gate') return null;
    var at = t(a.raisedAt);
    return tks.filter(function (x) { var d = t(x.doneAt || x.updatedAt); return x.lever !== 'status' && d && Math.abs(d - at) < DAY; })
      .sort(function (x, y) { return Math.abs(t(x.doneAt || x.updatedAt) - at) - Math.abs(t(y.doneAt || y.updatedAt) - at); })[0] || null;
  }
  /* Heard from: the later of the sync's lastHeard and the agent's latest ticket activity on this page (Kev, 26 Oct: "why do they all say
     stale"). The sync can lag an hour or a day; a ticket closed this morning on the feed means the desk was heard this morning. */
  function heardAt(a) {
    var best = t(a.lastHeard) || 0, now = Date.now();
    Object.keys(S.tickets).forEach(function (k) {
      var x = S.tickets[k]; if (x.agent !== a.id) return;
      [x.createdAt, x.pickedAt, x.doneAt, x.updatedAt].forEach(function (v) { var m = t(v); if (m && m <= now && m > best) best = m; });
    });
    return best ? new Date(best).toISOString() : null;
  }
  function workingState(a) {
    var ticket = Object.keys(S.tickets).some(function (k) { var x = S.tickets[k]; return x.agent === a.id && (x.status === 'picked' || x.status === 'working') && Date.now() - t(x.pickedAt || x.createdAt) < 6 * HOUR; });
    var claims = (a.counts && a.counts.working > 0) || ticket;
    var fresh = Date.now() - t(heardAt(a)) <= WORKING_FRESH_H * HOUR;
    return { on: claims && (fresh || ticket), stale: claims && !fresh && !ticket };
  }
  function effective(a) {
    var items = agentItems(a.id), counts = {}, w = workingState(a);
    ORDER.forEach(function (l) { counts[l] = 0; });
    items.forEach(function (i) { counts[i.light]++; });
    if (w.on) counts.working = 1;
    var light = ORDER.filter(function (l) { return counts[l] > 0; })[0] || 'idle';
    var blinkable = light === 'urgent' || light === 'reply' || light === 'review';
    var lookedAt = t((S.seen['look-' + a.id] || {}).at);
    var blink = blinkable && items.some(function (i) {
      return !i.seen && i.light === light && t(i.raisedAt) > lookedAt && Date.now() < Math.max(t(i.raisedAt), loadedAt) + BLINK_CAP_MIN * MIN;
    });
    var others = 0; ORDER.forEach(function (l) { if (l !== light && l !== 'idle') others += counts[l]; });
    var heard = heardAt(a), silent = !!heard && Date.now() - t(heard) > (a.expectedEveryHours || 96) * HOUR;
    return { light: light, counts: counts, others: others, held: blinkable && !blink, stale: w.stale || silent, staleWhy: w.stale ? 'Said it was working but has not been heard from in ' + WORKING_FRESH_H + ' hours' : 'Quiet past its usual rhythm', items: items };
  }
  function allItems() {
    var out = [];
    Object.keys(S.agents).forEach(function (id) { var a = S.agents[id]; if (hidden(a)) return; effective(a).items.forEach(function (i) { out.push(i); }); });
    return out;
  }

  /* ---------- the game: one team score (Kev, Radar and the agents), the board, the line ----------
     Guardrails: no guilt copy, no fake urgency, no notification spam, nothing on the Sabbath (Friday sunset to Saturday sunset), and a ticket's real content is never hidden or shortened.
     Everything below is recomputed from the tickets and actions collections on every render, so it can never drift from the data. */
  var memo = null;
  function vals(o) { return Object.keys(o).map(function (k) { return o[k]; }); }
  function derived() {
    if (memo) return memo;
    var now = Date.now(), tk = vals(S.tickets), sla = {};
    Game.slaFindings(tk, now).forEach(function (f) { sla[f.id] = f; });
    var g = Game.buildGame({ now: now, tickets: tk, actions: vals(S.actions), qcByDay: (S.meta && S.meta.game && S.meta.game.qcByDay) || {} });
    memo = { now: now, sla: sla, game: g, rec: Game.mergeRecords(g.records, S.records) };
    return memo;
  }
  var STATUS_WORD = { open: 'Waiting', picked: 'Picked up', working: 'Working', blocked: 'Blocked', gated: 'Needs your yes' };
  function clockLabel(ms) { return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  function dateLabel(d) { var a = d.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  function hms(sec) { sec = Math.max(0, Math.floor(sec)); var hh = Math.floor(sec / 3600), mm = Math.floor(sec % 3600 / 60), ss = sec % 60; return hh + ':' + pad2(mm) + ':' + pad2(ss); }
  function waitedSec(fromMs, now) { return Game.runnerMinutes(fromMs, now) * 60; }
  function syncText() {
    if (!S.live) return 'Example data';
    if (!S.meta) return 'Waiting for the first sync';
    return 'Synced ' + (Date.now() - t(S.meta.syncedAt) < MIN ? 'just now' : ago(S.meta.syncedAt));
  }
  function syncWarn() { return S.live && S.meta && Date.now() - t(S.meta.syncedAt) > 2 * HOUR; }    // amber after two hours

  /* Kev, 27 Oct: "can we make this board clickable? 1 Fail - how do i look at that and autopsy that?" Every count opens its breakdown. */
  var CARD_OF = { 'Points today': 'points', 'Closed today': 'closed', 'Open now': 'open', 'Oldest waiting': 'open', 'FAILs today': 'fails', 'Median pickup': 'pickup', 'Streak': 'fails' };
  function cell(k, v, s, cls, id, go) {
    var vv = h('b', { class: 'v' }); if (typeof v === 'string' || typeof v === 'number') vv.textContent = String(v); else if (v) vv.appendChild(v);
    if (id) vv.id = id;
    var c = h('div', { class: 'cell' + (cls ? ' ' + cls : '') }, h('span', { class: 'k', text: k }), vv, h('span', { class: 's', text: s || '' }));
    var card = CARD_OF[k];
    if (card) { c.setAttribute('data-card', card); if (go) c.setAttribute('data-goto', go); c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0'); c.setAttribute('aria-label', k + ': ' + vv.textContent + '. Open the breakdown.'); }
    return c;
  }
  function leverSheet(p, key) {
    var L = LEVERS[key]; p.appendChild(head(L.title, null, 'Lever'));
    var body = h('div', { class: 'panel-b one' }), sec = h('section'); body.appendChild(sec); p.appendChild(body); L.build(sec);
  }

  function renderSheet() {
    var sheet = $('#sheet'), p = $('#panel');
    if (!S.sheet) { sheet.hidden = true; return; }
    var ae = document.activeElement;
    if (!sheet.hidden && ae && p.contains(ae) && /^(TEXTAREA|INPUT|SELECT)$/.test(ae.tagName) && !S.forceSheet) return;   // never rebuild under someone typing
    S.forceSheet = false;
    p.textContent = '';
    var sh = S.sheet, scrollTop = p.scrollTop;
    if (sh.kind === 'desk') { var a = sh.id === 'radar' ? (S.agents.radar || { id: 'radar', name: 'Radar', role: 'Chief of staff' }) : S.agents[sh.id]; if (!a) { S.sheet = null; sheet.hidden = true; return; } deskSheet(p, a); }
    else if (sh.kind === 'bench') { var def = BENCH_DEFS.filter(function (d) { return d.id === sh.id; })[0]; if (!def || (S.share && def.sensitive)) { S.sheet = null; sheet.hidden = true; return; } benchSheet(p, def); }
    else if (sh.kind === 'board') { if (/^rec:/.test(sh.id)) { if (S.share) { S.sheet = null; sheet.hidden = true; return; } recruiterSheet(p, sh.id); } else boardSheet(p, sh.id); }
    else if (sh.kind === 'stack') stackSheet(p);
    else leverSheet(p, sh.id);
    p.scrollTop = scrollTop;
    sheet.hidden = false;
  }
  function watchLog(id) {
    if (!S.live || !S.db || S.unsub['log-' + id] || (S.share && sensitiveAgent(id))) return;
    S.unsub['log-' + id] = S.db.collection('agents/' + id + '/log').orderBy('at', 'desc').limit(5).onSnapshot(function (snap) { S.logs[id] = snap.docs.map(function (d) { return d.data(); }); renderAll(); }, function () { S.unsub['log-' + id] = null; });
  }
  function watchRows(id) {
    if (!S.live || !S.db || S.unsub['rows-' + id]) return;
    S.unsub['rows-' + id] = S.db.collection('benches/' + id + '/rows').limit(50).onSnapshot(function (snap) { S.benchRows[id] = snap.docs.map(function (d) { var v = Object.assign({}, d.data()); v.id = d.id; return v; }); renderAll(); }, function () { S.unsub['rows-' + id] = null; });
  }
  function unwatch(name) { var u = S.unsub[name]; if (typeof u === 'function') u(); delete S.unsub[name]; }
  function openSheet(kind, id, from, extra) {
    var wasOpen = !!S.sheet;
    S.sheet = Object.assign({ kind: kind, id: id }, extra || {}); S.formOpen = false; S.flash = ''; S.forceSheet = true;
    lastFrom = from || lastFrom;
    if (kind === 'desk') { watchLog(id); watchChat(id); markLook(id); }
    if (kind === 'bench') watchRows(id);
    $('#floor').classList.add('sitting'); renderSheet();
    var panel = $('#panel');
    if (!wasOpen && !reduced.matches && lastFrom && lastFrom.getBoundingClientRect) {                           // sit: the sheet grows out of the desk
      var r = lastFrom.getBoundingClientRect(), pr = panel.getBoundingClientRect();
      if (pr.width && pr.height) {
        panel.animate([{ transform: 'translate(' + (r.left - pr.left) + 'px,' + (r.top - pr.top) + 'px) scale(' + (r.width / pr.width) + ',' + (r.height / pr.height) + ')', opacity: .5 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
        panel.querySelectorAll('.panel-h > *, .panel-b').forEach(function (el) { el.animate([{ opacity: 0 }, { opacity: 0, offset: .4 }, { opacity: 1 }], { duration: 320 }); });
      }
    } else if (!wasOpen) panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
    var sb = $('.stand', panel); if (sb) sb.focus();
    if (kind === 'desk') { try { history.replaceState(null, '', '#' + id); } catch (e) {} }
    renderAll();
  }
  function stand() {
    var sheet = $('#sheet'); if (sheet.hidden) return;
    var done = function () {
      var sh = S.sheet; S.sheet = null; sheet.hidden = true; $('#floor').classList.remove('sitting');
      if (sh && sh.kind === 'desk') { unwatch('log-' + sh.id); unwatch('chat-' + sh.id); } if (sh && sh.kind === 'bench') unwatch('rows-' + sh.id);
      renderAll(); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      var back = sh && sh.kind === 'desk' ? ($('.desk[data-id="' + sh.id + '"]') || $('#radar .radar-sit')) : (sh && sh.kind === 'bench' ? $('[data-bench="' + sh.id + '"]') : null);
      if (back && back.focus) back.focus();
    };
    if (reduced.matches) return done();
    $('#panel').animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px)' }], { duration: 200, easing: 'ease-in' }).onfinish = done;
  }
  /* sitting at a desk is "I looked": its blink holds steady. Written once per sit, on a user action. */
  function markLook(id) {
    var a = S.agents[id]; if (!a) return;
    var e = effective(a); if (!(e.light === 'urgent' || e.light === 'reply' || e.light === 'review')) return;
    markSeen('look-' + id);
  }

  /* ---------- events ---------- */
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function toggle(btn, apply, key) {
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', String(on)); apply(on);
      if (key) { try { localStorage.setItem(key, on ? '1' : '0'); } catch (x) {} }
      renderAll();
    });
  }
  var root = document.documentElement;
  function setShare(on) {
    S.share = on; root.classList.toggle('share', on);
    if (on) {
      dropSensitive();
      if (S.sheet && ((S.sheet.kind === 'bench' && BENCH_DEFS.some(function (d) { return d.id === S.sheet.id && d.sensitive; })) || (S.sheet.kind === 'desk' && sensitiveAgent(S.sheet.id)) || (S.sheet.kind === 'board' && /^rec:/.test(S.sheet.id)))) { S.sheet = null; $('#sheet').hidden = true; $('#floor').classList.remove('sitting'); }
    } else attachBenches();
  }

  /* ---------- render ---------- */
  function renderSync() {
    $('#demo').hidden = S.live;
    var m = S.meta, st = $('#stale');
    var sy = $('#sync'); sy.textContent = S.live ? (m ? 'Synced ' + (Date.now() - t(m.syncedAt) < MIN ? 'just now' : ago(m.syncedAt)) + ' from the repo' : 'Live · waiting for the first sync') : 'Example data';
    sy.style.color = syncWarn() ? 'var(--a)' : '';
    if (S.live && m && Date.now() - t(m.syncedAt) > 2 * HOUR) { st.hidden = false; st.textContent = 'The last sync was ' + ago(m.syncedAt) + '. Alerts and the repo-side lights may be out of date; ask Radar to sync. Tickets and the board are live.'; }
    else if (S.live && m && m.skipped && m.skipped.length) { st.hidden = false; st.textContent = 'Not in the last sync: ' + m.skipped.join('; ') + '.'; }
    else if (S.live && !S.canWrite) { st.hidden = false; st.textContent = 'Read-only view: tickets and seen marks are off.'; }
    else st.hidden = true;
  }
  /* ---------- now and next: Kev's calendar, live through his Google Calendar connector (read only) ---------- */
  var tf = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
  function pad2(n) { return String(n).padStart(2, '0'); }
  function isoLocal(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()); }
  function calEvents() {
    if (S.cal && S.cal.events) return S.cal.events;
    var lines = (S.today && S.today.lines) || [], d = new Date();    // fallback: Radar's lines for today, or the example
    return lines.map(function (l) { var m = /^(\d{1,2}):(\d{2})/.exec(l.at || ''); if (!m) return null; var st = new Date(d); st.setHours(+m[1], +m[2], 0, 0); return { title: l.text, start: st, end: new Date(st.getTime() + 30 * MIN) }; }).filter(Boolean);
  }
  function normCal(list) {
    return (list || []).filter(function (ev) {
      if (!ev || ev.status === 'cancelled' || !ev.start || !ev.start.dateTime) return false;     // timed events only
      var me = (ev.attendees || []).filter(function (a) { return a.self; })[0]; return !(me && me.responseStatus === 'declined');
    }).map(function (ev) {
      var eps = (ev.conferenceData && ev.conferenceData.entryPoints) || [], vid = eps.filter(function (x) { return x.entryPointType === 'video' && x.uri; })[0];
      var url = ev.hangoutLink || (vid && vid.uri) || ((String(ev.location || '').match(/https:\/\/\S+/) || [''])[0]);
      return { title: ev.summary || '(no title)', start: new Date(ev.start.dateTime), end: new Date(ev.end && ev.end.dateTime || ev.start.dateTime), join: /^https:\/\//.test(url || '') ? url : '' };
    }).sort(function (a, b) { return a.start - b.start; });
  }
  function inLabel(ms) { var m = Math.round(ms / MIN); return m < 1 ? 'now' : m < 60 ? 'in ' + m + 'm' : 'in ' + Math.floor(m / 60) + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : ''); }
  function renderNext() {
    var box = $('#nextup'); if (!box) return; box.textContent = '';
    var now = Date.now(), evs = calEvents(), cur = evs.filter(function (e) { return e.start <= now && e.end > now; })[0], up = evs.filter(function (e) { return e.start > now; }).slice(0, 2);
    var nb = h('div', { class: 'nowbox' }, h('span', { class: 'eyebrow', text: 'Now' }));
    var hideT = S.share;                                      // calendar titles carry client names: hidden on a screen share
    if (cur) { nb.appendChild(h('b', { text: hideT ? 'In an event' : cur.title })); nb.appendChild(h('span', { class: 'small', text: 'until ' + tf.format(cur.end) })); if (cur.join && !hideT) nb.appendChild(h('a', { class: 'join', href: cur.join, target: '_blank', rel: 'noopener', text: 'Join →' })); }
    else { nb.appendChild(h('b', { text: up[0] ? 'Open until ' + tf.format(up[0].start) : 'Open the rest of the day' }));  }
    box.appendChild(nb);
    var nl = h('div', { class: 'nextlist' }, h('span', { class: 'eyebrow', text: 'Next' }));
    if (!up.length) nl.appendChild(h('span', { class: 'small', text: S.cal && S.cal.error ? S.cal.error : (S.cal ? 'Nothing else today.' : 'Calendar not connected on this page yet.') }));
    up.forEach(function (e, i) {
      var row = h('div', { class: 'nx' + (i === 0 ? ' first' : '') }, h('span', { class: 'tm', text: (e.start.toDateString() === new Date().toDateString() ? '' : e.start.toLocaleDateString('en-US', { weekday: 'short' }) + ' ') + tf.format(e.start) }), h('span', { class: 'ti', text: hideT ? 'Event' : e.title }), h('span', { class: 'in', text: inLabel(e.start - now) }));
      nl.appendChild(row);
    });
    var dayb = toolMap()['day-board'];
    nl.appendChild(h('div', { class: 'foot2' }, h('span', { class: 'small', text: S.cal && S.cal.events ? 'Live' : (S.live ? 'Day lines' : 'Example') }), dayb ? toolLink({ id: dayb.id, name: 'Full day →', url: dayb.url }, '') : null));
    box.appendChild(nl);
  }
  var CAL_COPY = { needs_reauth: 'Google Calendar needs reconnecting in Claude settings.', server_not_connected: 'Google Calendar is not connected in Claude.', approval_required: 'Allow this page to read your calendar when Claude asks.', consent_required: 'Allow this page to read your calendar when Claude asks.', not_in_manifest: 'Calendar not enabled on this page.' };
  function watchCalendar(mcp) {
    var d = new Date(), st = new Date(d); st.setHours(0, 0, 0, 0); var en = new Date(st.getTime() + 2 * DAY);
    S.unsub.cal = mcp.watchTool('Google Calendar', 'list_events', { startTime: isoLocal(st), endTime: isoLocal(en), orderBy: 'startTime', pageSize: 100 }, function (ev) {
      if (ev.type === 'data') { var p = ev.result && ev.result.payload; if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e) { p = null; } } var list = Array.isArray(p) ? p : (p && Array.isArray(p.events) ? p.events : []); S.cal = { events: normCal(list), at: Date.now() }; }
      else { var code = ev.error && ev.error.code; S.cal = { events: (S.cal && S.cal.events) || null, error: CAL_COPY[code] || 'Calendar did not answer; trying again.' }; }
      renderNext();
    }, { refetchInterval: 60000 });
  }

  /* Refresh in place (Kev, 27 Oct: "refreshes the data in place without moving me from where I am"). Every render empties and rebuilds
     its boxes; the page height collapses for a moment and the browser clamps the scroll, so Kev jumped. Save the window and every inner
     scroller, rebuild, put them back before the next paint. */
  var SCROLLERS = ['#panel', '#board-grid', '#lb-body', '#tks', '#strip', '.chatlog'];
  function saveView() {
    var v = { x: window.pageXOffset || 0, y: window.pageYOffset || 0, els: [] };
    SCROLLERS.forEach(function (sel) { [].forEach.call(document.querySelectorAll(sel), function (el) { if (el.scrollTop || el.scrollLeft) v.els.push([el, el.scrollTop, el.scrollLeft]); }); });
    return v;
  }
  function restoreView(v) {
    v.els.forEach(function (e) { if (e[0].isConnected) { e[0].scrollTop = e[1]; e[0].scrollLeft = e[2]; } });
    if ((window.pageYOffset || 0) !== v.y || (window.pageXOffset || 0) !== v.x) window.scrollTo(v.x, v.y);
  }
  function renderAll() {
    var view = saveView();
    try { renderAllInner(); } finally { restoreView(view); requestAnimationFrame(function () { restoreView(view); }); }
  }
  function renderAllInner() {
    memo = null;                                    // one derivation of the game and the SLA per render
    try { ensurePm(); checkFocusTimer(); renderNext(); renderSync(); renderBanner(); renderFocus(); renderStrip(); renderToday(); renderBoard(); renderCredits(); renderPulse(); renderRecords(); renderLine(); renderFloor(); renderLookahead(); renderTools(); renderSheet(); }
    finally { memo = null; }
  }
  /* ---- example data: clearly invented, shown only when the page is not reading the database ---- */
  function tdExample(date) {
    var L = function (n, ti, co, ph, note) { return { name: n, title: ti, company: co, ph: ph, src: 'ZI', crelateUrl: null, linkedin: 'https://www.linkedin.com/search/results/people/?keywords=' + encodeURIComponent(n), note: note || '' }; };
    var A = [], B = [];
    for (var i = 1; i <= 12; i++) A.push(L('Sample Person ' + pad2(i), i % 3 ? 'General Superintendent' : 'Director, Field Operations', 'Example Builders ' + (1 + i % 4), ['M', 'D', 'M D', '—'][i % 4], i === 2 ? 'Example note (example)' : ''));
    for (var j = 1; j <= 6; j++) B.push(L('Sample Estimator ' + pad2(j), 'Chief Estimator', 'Example Mechanical ' + j, ['M', 'D'][j % 2]));
    A.forEach(function (l, n) { l.id = 'ex-miami-' + pad2(n + 1); }); B.forEach(function (l, n) { l.id = 'ex-vmg-' + pad2(n + 1); });
    return {
      schema: 1, date: date, label: tdLabel(date), pillar: { n: 1, name: 'Example', verse: '' }, scripture: '1 Timothy 1:1–2',
      habits: {}, streaks: { bible: 4, rps: 2, mps: null, workout: 6, drinks: null, wisdom: 3, agency: 1, growth: null, weight: null },
      run: [['05:45', 'Pray'], ['07:00', 'Admin · stand-up'], ['08:00', 'QC calls · must-calls'], ['09:00', 'Company-Wide Power Hour'], ['11:00', 'POWER HOUR · Example Miami', 'Example East Coast hour (example)', 1, 'ex-miami'], ['12:00', 'Weekly call (example)'], ['13:00', 'POWER HOUR · Example VMG', 'Example (example)', 1, 'ex-vmg'], ['14:00', 'Recruiting · callbacks'], ['15:45', 'Call a client (example)'], ['17:30', 'Check-out']]
        .map(function (r) { return { at: r[0], title: r[1], note: r[2] || '', powerHour: !!r[3], sheetId: r[4] || null }; }),
      must: [{ id: 'm1', at: '07:00', title: 'Send two retainers (example)', note: 'Drafted, still unsent (example).', addedAt: null }, { id: 'm2', at: '08:00', title: 'QC calls (example)', note: 'Two start inside a week (example).', addedAt: null }, { id: 'm3', at: '11:00', title: 'Power Hour: 12 dials (example)', note: 'East Coast hours (example).', addedAt: null }],
      decisions: [{ id: 'd1', text: 'Send the split-fee agreement (example)?', pick: 'Yes, after you read the terms.', alertId: null }, { id: 'd2', text: 'Forward the submittal (example)?', pick: 'Forward today.', alertId: null }],
      qc: [{ id: 'q1', name: 'Sample Candidate A', clientSeat: 'Example Client · Sr Super', date: 'Starts Thu', lastTouch: 'Never touched', 'do': 'Call today (example)', today: true, group: 'Pending start', asOf: date, addedAt: null }, { id: 'q2', name: 'Sample Candidate B', clientSeat: 'Example Client · MEP Super', date: 'Starts Mon', lastTouch: 'You, Mon', 'do': 'Next touch by Thu (example)', today: false, group: 'Pending start', asOf: date, addedAt: null }, { id: 'q3', name: 'Sample Candidate C', clientSeat: 'Example Client · PM', date: 'Started Mon', lastTouch: 'Never touched', 'do': 'Day-2 check-in (example)', today: true, group: 'Started', asOf: date, addedAt: null }],
      sheets: [
        { id: 'ex-miami', title: 'Example · Field Operations Leader, Miami', eyebrow: 'CALL SHEET', window: { pt: '11:00-12:00', et: '14:00-15:00' }, tz: 'ET', eastCoast: true, brief: 'Example brief: pitch the seat, not the client (example).', opener: '', sub: '12 sample names (example).', url: null, leads: A },
        { id: 'ex-vmg', title: 'Example · Chief Estimator + Precon', eyebrow: 'CALL SHEET', window: { pt: '13:00-14:00', et: '16:00-17:00' }, tz: 'ET', eastCoast: true, brief: '', opener: '', sub: '6 sample names (example).', url: null, leads: B }],
      study: { ref: '1 Timothy 1:1–2', text: 'Paul, an apostle of Christ Jesus by command of God our Savior… (example)', setting: 'Example setting.', words: [{ word: 'apostle', orig: 'apostolos', note: 'One sent with authority (example).' }], reflect: ['Example question one?', 'Example question two?'], prayer: 'Example prayer.', memory: 'Example memory verse.' },
      sources: ['example'], builtAt: new Date().toISOString(), builtBy: 'example'
    };
  }

  /* ---------- example data (clearly labelled; no client names, pay, phones, family or health) ---------- */
  function exampleData() {
    var n = Date.now(), iso = function (ago) { return new Date(n - ago).toISOString(); };
    var BLOB = 'https://github.com/EdenExec/Agent-Builder/blob/claude/pensive-brown-18gll8/';
    var SENS = ['tally', 'docket', 'atlas', 'housing-architect', 'keys', 'dean', 'hale', 'jethro', 'barnabas'];
    function ag(id, name, desk, role, o) { var a = { id: id, name: name, desk: desk, role: role, sensitive: SENS.indexOf(id) >= 0, light: 'idle', counts: {}, task: null, lastHeard: iso(2 * HOUR), pendingQc: 0, openTickets: 0, expectedEveryHours: 96, updated: iso(20 * MIN) }; for (var k in o) a[k] = o[k]; S.agents[id] = a; }
    ag('radar', 'Radar', 'centre', 'Chief of staff', { task: 'Hourly sweep (example)', counts: { working: 1 }, lastHeard: iso(30 * MIN), expectedEveryHours: 30, openTickets: 2, projects: [
      { id: 'virtual-office', title: 'Command Center', status: 'Today view live, desk sheets by project next', statusAuto: false, owner: 'q', keywords: ['Command Center', 'ticket runner'], items: [
        pi('Desk sheets by project', 'open', { note: 'Kev, 29 Oct: a list of clickable projects with each bot (example).' }),
        pi('Today view in the Command Center', 'shipped', { at: iso(DAY), link: BLOB + 'projects/virtual-office/draft/eden-office.html' })] }] });
    ag('scout', 'Scout', 'recruiting', 'Lead research', { task: "Tonight's lead buckets (example)", lastHeard: iso(HOUR), openTickets: 1 });
    ag('dean', 'Dean', 'recruiting', 'Workforce', { task: 'Friday scorecard prep (example)', lastHeard: iso(5 * HOUR), pendingQc: 1, openTickets: 1 });
    ag('host', 'Jenny', 'finance', 'Comms director', { lastHeard: iso(8 * DAY) });
    ag('tally', 'Tally', 'finance', 'Finance', { task: 'Month-end packet (example)', lastHeard: iso(3 * HOUR) });
    ag('docket', 'Docket', 'finance', 'Counsel and risk', { task: 'Second key on the packet (example)', counts: { working: 1 }, lastHeard: iso(30 * HOUR) });
    ag('q', 'Q', 'recruiting', 'Engineering', { task: 'Office status feed (example)', counts: { working: 1 }, lastHeard: iso(20 * MIN), pendingQc: 1, projects: [
      { id: 'eden-crm', title: 'Eden CRM', status: 'Mirror schema drafted, nightly read waiting', statusAuto: false, owner: 'q', keywords: ['Eden CRM', 'Crelate mirror'], link: BLOB + 'projects/eden-crm/brief.md', items: [
        pi('Nightly Crelate read-only mirror', 'open', { note: 'First job: a copy Eden owns, read-only (example).' }),
        pi('Mirror schema draft', 'shipped', { at: iso(2 * DAY), link: BLOB + 'projects/eden-crm/brief.md' })] },
      { id: 'cloudtalk-nightly', title: 'CloudTalk nightly load', statusAuto: true, owner: 'q', keywords: ['CloudTalk nightly'], link: BLOB + 'projects/cloudtalk-nightly/brief.md', items: [] },
      { id: 'recruiter-desk', title: 'Recruiter Desk', status: 'Spec and v0 built, not shared', statusAuto: false, owner: 'q', keywords: ['Recruiter Desk'], link: BLOB + 'projects/recruiter-desk/brief.md', items: [pi('Stamp-out command and tests', 'shipped', { at: iso(3 * DAY), link: BLOB + 'projects/recruiter-desk/brief.md' })] }] });
    function pi(title, state, o) { var x = { title: title, state: state, link: '', at: null }; for (var k in o) x[k] = o[k]; return x; }
    ag('pm', 'Pam', 'projects', 'Special projects PM', { task: 'Eden Staffing: chasing EOR and BaaS quotes (example)', counts: { working: 1 }, lastHeard: iso(2 * HOUR), openTickets: 1, projects: [
      { id: 'eden-staffing', title: 'Eden Staffing', status: '3 of 40 rows done, 1 slipped, 1 at risk', statusAuto: false, owner: 'pm', keywords: ['Eden Staffing', 'EOR', 'BaaS'], link: BLOB + 'projects/eden-staffing/schedule.md', items: [
        pi('ES-01 Owners and dates confirmed', 'needs', { note: 'Kev confirms the batch in the brief (example). Slipped, recovery Thu 29 Oct.', link: BLOB + 'employees/pm/briefs/eden-staffing-confirm-owners-dates.md' }),
        pi('ES-02 Answers to the three open questions', 'needs', { note: 'Florida demand and pay; who runs it day to day; was 40% of spread promised (example).' }),
        pi('AB-02 Kev decisions from the issues memo', 'needs', { note: 'Ranked questions with Docket picks (example).', link: BLOB + 'projects/eden-staffing/legal/05-issues-memo.md' }),
        pi('ES-03 Trades list for the quote requests', 'open', { note: 'Nick sends the trades and class codes (example).', link: BLOB + 'projects/eden-staffing/nick-chase-draft.md' }),
        pi('ES-04 Quote request pack', 'open', { note: 'One assumption sheet and the request text (example).' }),
        pi('ES-06 Broker and attorney shortlists', 'open', { note: 'Docket researches; no contact (example).' }),
        pi('AB-01 First drafts from Docket', 'shipped', { at: iso(5 * DAY), note: 'Five drafts saved for attorney review (example).', link: BLOB + 'projects/eden-staffing/legal' }),
        pi('AB-04 Names and marks contact sheet', 'shipped', { at: iso(5 * DAY), link: BLOB + 'projects/eden-staffing/brand/names.md' })] }] });
    ag('atlas', 'Atlas', 'family', 'Tutor', { lastHeard: iso(2 * DAY) });
    ag('housing-architect', 'Marlowe', 'family', 'Architect', { task: 'Floor plan (example)', counts: { working: 1 }, lastHeard: iso(HOUR) });
    ag('keys', 'Keys', 'family', 'Rental ops', { lastHeard: iso(3 * DAY) });
    ag('hale', 'Hale', 'family', 'Health advisor', { task: 'Example task', counts: { working: 1 }, lastHeard: iso(2 * HOUR) });
    ag('jethro', 'Jethro', 'family', 'Growth coach', { task: 'Example task', lastHeard: iso(6 * HOUR) });
    ag('barnabas', 'Barny', 'family', 'Spiritual advisor', { lastHeard: iso(4 * DAY) });
    ag('lookahead', 'Hawk', 'family', 'Look-ahead keeper', { lastHeard: iso(5 * HOUR) });
    function al(id, agent, light, kind, title, ms) { S.alerts[id] = { id: id, agent: agent, light: light, kind: kind, title: title, source: 'example', raisedAt: iso(ms), needsKev: true, sensitive: SENS.indexOf(agent) >= 0 }; }
    al('e1', 'radar', 'urgent', 'call', 'Missed call: a client contact (example)', 12 * MIN);
    al('e2', 'scout', 'reply', 'inbox', 'Reply (team): lead sheet question (example)', 40 * MIN);
    al('j1', 'host', 'reply', 'inbox', 'A client contact: Re: shortlist timing (example)', 25 * MIN); S.alerts.j1.rank = 1; S.alerts.j1.why = 'Client waiting on dates for interviews; draft ready (example)'; S.alerts.j1.link = 'https://mail.superhuman.com/'; S.alerts.j1.preview = { to: ['client (example)'], text: 'Hi there,\n\nThursday or Friday works on our side. (example)' };
    al('j2', 'host', 'reply', 'inbox', 'A candidate: offer questions (example)', 2 * HOUR); S.alerts.j2.rank = 2; S.alerts.j2.why = 'Candidate deciding this week (example)';
    al('e3', 'dean', 'review', 'qc', 'send message: draft ready to read (example)', 3 * HOUR);
    S.alerts.e3.preview = { to: [], text: 'Subject: Next steps (example)\n\nHi there,\n\nThis is where the draft text shows for proofing. (example)' };
    al('e4', 'tally', 'blocked', 'blocked', 'Blocked: QuickBooks sign-in expired (example)', DAY);
    al('e5', 'q', 'blocked', 'routine', 'Routine "CloudTalk nightly lead load" has no trigger yet (example)', 2 * DAY);
    S.tickets = {
      x1: { id: 'x1', agent: 'scout', ask: 'Refresh a lead bucket (example)', priority: 'today', status: 'working', createdAt: iso(2 * HOUR), pickedAt: iso(HOUR), owner: 'kev' },
      x2: { id: 'x2', agent: 'dean', ask: 'Draft a day-one page (example)', priority: 'whenever', status: 'gated', createdAt: iso(DAY), owner: 'kev', proposed: { kind: 'send_message', exact: 'To: Kev (review copy)\nSubject: Next steps before you start\n(the exact text appears here, from the QC item)', qc: 'example', hash: 'example' } },
      x3: { id: 'x3', agent: 'q', ask: 'Match missed calls to Crelate (example)', title: 'Matched 6 of 8 missed calls', project: 'eden-crm', priority: 'now', status: 'done', createdAt: iso(3 * DAY), pickedAt: iso(3 * DAY - 10 * MIN), doneAt: iso(2 * HOUR), owner: 'kev', result: { summary: 'Matched 6 of 8; 2 left unknown (example).', link: 'https://claude.ai/artifact/7kccfScydYDcWoXfeeE8q6' } }
    };
    S.tickets.xq1 = { id: 'xq1', agent: 'q', ask: 'Load tonight\'s lead sheet into CloudTalk (example)', title: 'CloudTalk nightly load stalled', project: 'cloudtalk-nightly', priority: 'today', status: 'blocked', createdAt: iso(5 * HOUR), pickedAt: iso(4 * HOUR), updatedAt: iso(3 * HOUR), owner: 'kev', blockedOn: 'CloudTalk connector sign-in expired; reconnect it so the load can run (example)' };
    S.tickets.xr1 = { id: 'xr1', agent: 'radar', ask: 'Read the Notion ledger view for the Family bench (example)', priority: 'today', status: 'blocked', createdAt: iso(7 * HOUR), updatedAt: iso(6 * HOUR), owner: 'kev', blockedOn: 'Notion needs a doc link: which ledger view should the Family bench read? (example)', blockedLink: 'https://www.notion.so/' };
    S.tickets.xq2 = { id: 'xq2', agent: 'q', ask: 'Draft the Crelate mirror schema from the API field list (example)', title: 'Crelate mirror schema', project: 'eden-crm', priority: 'today', status: 'working', createdAt: iso(2 * HOUR), pickedAt: iso(HOUR), owner: 'kev' };
    S.tickets.xq3 = { id: 'xq3', agent: 'q', ask: 'Tidy the ZoomInfo pull notes for Scout (example)', priority: 'whenever', status: 'open', createdAt: iso(40 * MIN), owner: 'kev' };
    /* tickets for the board: closed today, a FAIL, a STALL, and a few past days (all invented) */
    var tk = function (id, agent, ask, pr, st, created, o) { var x = { id: id, agent: agent, ask: ask + ' (example)', priority: pr, status: st, createdAt: iso(created), owner: 'kev', updatedAt: iso(created) }; for (var k in o) x[k] = o[k] == null ? undefined : (typeof o[k] === 'number' ? iso(o[k]) : o[k]); S.tickets[id] = x; };
    tk('y1', 'scout', 'Refresh the lead bucket', 'today', 'done', 5 * HOUR, { pickedAt: 4.6 * HOUR, doneAt: 3 * HOUR, result: { summary: 'Done (example)' } });
    tk('y2', 'q', 'Fix the sheet writer', 'whenever', 'done', 2.5 * HOUR, { pickedAt: 2 * HOUR, doneAt: HOUR, result: { summary: 'Done (example)' } });
    tk('y3', 'dean', 'Prep Friday scorecard questions', 'today', 'open', 2.2 * HOUR);
    tk('y4', 'radar', 'Chase the open placement notes', 'today', 'working', 5.4 * HOUR, { pickedAt: 5 * HOUR });
    tk('y5', 'tally', 'Reconcile last week', 'today', 'open', 25 * MIN);
    [[1, "scout", "today"], [1, "q", "today"], [2, "dean", "whenever"], [2, "scout", "today"], [3, "radar", "today"], [3, "q", "whenever"]].forEach(function (r, i) {
      var c = r[0] * DAY + 3 * HOUR; tk('h' + i, r[1], 'Past work ' + (i + 1), r[2], 'done', c, { pickedAt: c - 20 * MIN, doneAt: c - 40 * MIN, result: { summary: 'Done (example)' } });
    });
    S.actions = { 'ex-a1': { key: 'ex-a1', action: 'done', at: iso(90 * MIN), by: 'kev', title: 'Example', agent: null }, 'ex-a2': { key: 'ex-a2', action: 'followup', at: iso(26 * HOUR), by: 'kev', title: 'Example', agent: null } };
    (function () {         // invented, for the offline page only
      var td = Game.pacificDate(Date.now()), ad = function (n) { return Game.addDays(td, n); };
      function li(id, title, kind, start, o) { var x = { id: id, title: title + ' (example)', kind: kind, lane: 'both', start: start, end: '', time: '', owner: '', status: 'set' }; for (var k in o) x[k] = o[k]; return x; }
      S.look = { schema: 1, asOf: iso(5 * HOUR), url: 'https://claude.ai/artifact/', week: { start: Game.addDays(td, -Game.dayOfWeek(td)), work: 'Two client calls, one hire decision (example)', family: 'Soccer Saturday (example)', one: 'Settle the Boise move date (example)' },
        next: [li('x1', 'Family dinner', 'event', ad(1), { time: '6:30pm', owner: 'Kev & Ally' }), li('x2', 'Boise', 'travel', ad(8), { end: ad(10), owner: 'Kev' }), li('x3', 'Move to Boise', 'milestone', ad(12), { owner: 'Kev & Ally', status: 'open' })],
        decisions: [li('x4', 'Pick the move date', 'decision', ad(3), { owner: 'Kev', status: 'open' })], counts: { items: 4, open: 2 } };
    })();
    S.seen = { 'open-hub': { at: iso(DAY) }, 'open-eden-daily': { at: iso(5 * HOUR) } };
    S.tools = { nightly: { id: 'nightly', name: 'CloudTalk nightly lead load', noTrigger: true, owner: 'q' } };
    S.today = { lines: [{ at: '09:00', text: 'Coaching block (example)' }, { at: '11:30', text: 'Client call (example)' }, { at: '14:00', text: 'Wednesday training (example)' }] };
    function B(id, owner, tiles, source) { S.benches[id] = { id: id, owner: owner, tiles: tiles, source: source, example: true, asOf: iso(HOUR) }; }
    B('recruiting', 'Dean', [{ label: 'Recruiters on pace', value: '3 of 5' }, { label: 'Deliverables overdue', value: '1' }], 'Crelate, Friday pull');
    B('depth', 'Dean', [{ label: 'In ramp', value: '1' }, { label: 'Next checkpoint', value: 'Fri 6 Nov' }], 'Dean, new-hire packet');
    B('revenue', 'Tally + Dean', [{ label: 'Month to date', value: 'not synced', needsGate: true }], 'Hub Rev Report');
    B('university', 'Dean', [{ label: 'Modules built', value: '0 of 3' }, { label: 'Next Wednesday', value: 'topic to pick' }], 'Dean');
    B('finance', 'Tally', [{ label: 'Cash on hand', value: 'not synced', needsGate: true }, { label: 'Open invoices', value: 'not synced', needsGate: true }], 'QuickBooks (re-authorise first)');
    B('client', 'Radar', [{ label: 'Active job orders', value: 'count only' }], 'Hub');
    B('family', 'Radar', [{ label: 'This week', value: 'lessons and studies' }], 'Atlas Desk, Marlowe\'s Desk');
    (function () {          // invented recruiters and counts, for the offline page only
      function f(rps, mps, ptcs, subs, ftis) { return { rps: rps, mps: mps, ptcs: ptcs, subs: subs, ftis: ftis }; }
      var rr = [['Rowan', f(41, 2, 3, 2, 1), f(9, 0, 1, 0, 0), 30], ['Sasha', f(38, 0, 2, 1, 2), f(12, 0, 0, 1, 0), 30], ['Tate', f(30, 1, 1, 0, 0), f(6, 0, 0, 0, 0), 30], ['Wren', f(17, 0, 1, 1, 0), f(3, 0, 0, 0, 0), 30], ['Jules', f(4, 0, 0, 0, 0), f(0, 0, 0, 0, 0), null]];
      var team = f(0, 0, 0, 0, 0), tday = f(0, 0, 0, 0, 0), sd = 0, inG = 0;
      var list = rr.map(function (x) { Object.keys(team).forEach(function (k) { team[k] += x[1][k]; tday[k] += x[2][k]; }); if (x[3] != null) { sd += x[3]; inG += x[1].rps; } return { name: x[0], inGoal: x[3] != null, week: x[1], today: x[2], standardToDate: x[3], gap: x[3] == null ? null : x[1].rps - x[3], behind: x[3] != null && x[1].rps < x[3] }; });
      var today = Game.pacificDate(n), mon = Game.addDays(today, -((Game.dayOfWeek(today) + 6) % 7));
      var keys = []; [-7, 0].forEach(function (o) { for (var i = 0; i < 5; i++) keys.push(Game.addDays(mon, o + i)); });
      var shape = [[.9, 1.1, .8, 1.2, 1, .8, 1, 1.1, .7, 1.2], [1, .6, 1.2, 1, .9, 1.1, .9, 1, 1.1, .5]];   // invented day-to-day swings, repeated across the example recruiters
      list.forEach(function (x, k) { x.rpDays = keys.map(function (d, i) { return d > today ? null : Math.round(Math.max(0, x.week.rps / 3.2 * shape[k % 2][i])); }); });
      var tdays = keys.map(function (_, i) { var v = list.map(function (x) { return x.rpDays[i]; }).filter(function (y) { return y != null; }); return v.length ? v.reduce(function (a, b) { return a + b; }, 0) : null; });
      S.crelate = { example: true, schema: 1, asOf: iso(HOUR), source: 'Example figures', live: true, weekOf: mon, through: today, weekIsCurrent: true, todayCurrent: true, perDay: 15, goals: { rpsWeek: 75, mpsWeek: 100 }, dayKeys: keys, recruiters: list,
        team: { week: team, today: tday, rpDays: tdays, standardToDate: sd, gap: inG - sd, behind: list.filter(function (x) { return x.behind; }).length, people: list.length }, notes: ['Example figures: nothing here is read from Crelate.'] };
      S.phones = { example: true, schema: 1, asOf: iso(HOUR), source: 'Example figures', dayLabel: 'yesterday', weekLabel: 'this week', priorLabel: 'last week', dayKeys: keys.filter(function (d) { return d <= today; }),
        people: list.slice(0, 4).map(function (x, k) { var days = keys.filter(function (d) { return d <= today; }).map(function (d, i) { return Math.round((60 + k * 25) * shape[(k + 1) % 2][i % 10]); }); var wkd = days.slice(5);
          function sm(a) { return a.reduce(function (p, q) { return p + q; }, 0); }
          return { name: x.name + ' Example', day: { dials: days[days.length - 1], conn: 0 }, week: { dials: sm(wkd), conn: 0 }, prior: { dials: sm(days.slice(0, wkd.length)), conn: 0 }, inbound: { total: 0, missed: 0 }, days: days }; }),
        notes: ['Example figures: nothing here is read from CloudTalk.'] };
      list.forEach(function (x, k) { x.fourWeeks = { rps: 240 + k * 40, mps: 0, ptcs: 5 + k, subs: 3 + (k % 2), ftis: 1 + (k % 3) }; });   // the ratios' four trailing weeks (example)
      S.crelate.fourFrom = Game.addDays(mon, -28); S.crelate.team.fourWeeks = list.reduce(function (a, x) { ['rps', 'mps', 'ptcs', 'subs', 'ftis'].forEach(function (m) { a[m] += x.fourWeeks[m]; }); return a; }, { rps: 0, mps: 0, ptcs: 0, subs: 0, ftis: 0 });
      S.phones.people.forEach(function (p, k) { p.four = { dials: 1400 + k * 300, conn: 0 }; });
    })();
    S.credits = { example: true, schema: 1, asOf: iso(HOUR), month: Game.pacificDate(Date.now()).slice(0, 7), cap: 2000, runs: 3, flagged: 1, notes: ['seat-b: on pace for 2,300 of 2,000 this month (example).'],
      seats: [{ seat: 'seat-a', weekPaid: 40, monthPaid: 310, projected: 900, cap: 2000, lastRun: null, status: 'ok' }, { seat: 'seat-b', weekPaid: 420, monthPaid: 760, projected: 2300, cap: 2000, lastRun: null, status: 'over' }] };
    S.ctasks = { example: true, asOf: iso(HOUR), movedOn: { count: 12, oldestDue: Game.addDays(Game.pacificDate(Date.now()), -300) },
      screening: 'Hidden: due over 45 days ago and untouched 30+ days, or no due date and untouched 60+ days. Still open in Crelate.',
      active: [{ id: 'ex-ct1', title: 'Review the offer letter (example)', due: Game.addDays(Game.pacificDate(Date.now()), -1), overdueDays: 1, record: { type: 'Contact', name: 'Sample, Pat' }, assignedBy: 'other', assignerName: 'Dean (example)' },
        { id: 'ex-ct2', title: 'Call back about the superintendent seat (example)', due: Game.addDays(Game.pacificDate(Date.now()), 2), overdueDays: null, record: { type: 'Contact', name: 'Example, Sam' }, assignedBy: 'self' }] };
    S.logs = { q: [{ at: iso(20 * MIN), text: 'Wired the status feed (example)' }, { at: iso(2 * HOUR), text: 'Ran the dry sync (example)' }] };
  }
  function clearData() { S.agents = {}; S.alerts = {}; S.actions = {}; S.clip = {}; S.chats = {}; S.seen = {}; S.tickets = {}; S.benches = {}; S.benchRows = {}; S.crelate = null; S.phones = null; S.tools = {}; S.logs = {}; S.meta = null; S.records = null; S.today = null; S.look = null; S.ctasks = null; S.credits = null; }

  /* ---------- live data: render the example first, then light up when `db` resolves (null after about 10 s: stay on the example) ---------- */
  function listen(name, fn) {
    if (S.unsub[name]) return;
    S.unsub[name] = S.db.collection(name).onSnapshot(function (snap) {
      var m = {}; snap.docs.forEach(function (d) { var v = d.data(); if (v) { m[d.id] = Object.assign({ id: d.id }, v); } });
      fn(m); renderAll();
    }, function () { S.unsub[name] = null; $('#sync').textContent = 'Could not read ' + name; });
  }
  function attachBenches() {
    if (!S.live || !S.db) return;
    listen('benches', function (m) { S.benches = m; });
    if (!S.unsub.crelate) S.unsub.crelate = S.db.doc('meta/crelate').onSnapshot(function (s) { S.crelate = s.exists ? s.data() : null; renderAll(); }, function () { S.unsub.crelate = null; });
    if (!S.unsub.phones) S.unsub.phones = S.db.doc('meta/phones').onSnapshot(function (s) { S.phones = s.exists ? s.data() : null; renderAll(); }, function () { S.unsub.phones = null; });
    if (!S.unsub.ctasks) S.unsub.ctasks = S.db.doc('meta/crelate-tasks').onSnapshot(function (s) { S.ctasks = s.exists ? s.data() : null; renderAll(); }, function () { S.unsub.ctasks = null; });   // Kev's open Crelate tasks, stale ones screened out (workshop/crelate/tasks.ts)
    if (!S.unsub.lookahead) S.unsub.lookahead = S.db.doc('meta/lookahead').onSnapshot(function (s) { S.look = s.exists ? s.data() : null; renderAll(); }, function () { S.unsub.lookahead = null; });   // Hawk's mirror: the Family office card (private)
  }
  function dropSensitive() {                              // like the Hub: other data never sits in the page while presenting
    unwatch('benches'); unwatch('crelate'); S.crelate = null; unwatch('phones'); S.phones = null; unwatch('lookahead'); S.look = null; unwatch('ctasks'); S.ctasks = null; if (TD.padUn) { TD.padUn(); TD.padUn = null; } TD.pad = null;   // the scratch pad is Kev's own notes                 // names beside pace numbers never sit in the page while presenting
    Object.keys(S.benches).forEach(function (k) { var d = BENCH_DEFS.filter(function (x) { return x.id === k; })[0]; if (!d || d.sensitive) delete S.benches[k]; });
    S.benchRows = {}; Object.keys(S.unsub).forEach(function (k) { if (k.indexOf('rows-') === 0) unwatch(k); });
    Object.keys(S.logs).forEach(function (k) { if (sensitiveAgent(k)) { delete S.logs[k]; unwatch('log-' + k); } });
    Object.keys(S.chats).forEach(function (k) { if (sensitiveAgent(k)) { delete S.chats[k]; unwatch('chat-' + k); } });
  }
  function goLive(db) {
    S.db = db; S.live = true; clearData();
    listen('agents', function (m) { S.agents = withStubs(m); });
    listen('alerts', function (m) { S.alerts = m; });
    listen('seen', function (m) { S.seen = m; });
    listen('actions', function (m) { S.actions = m; });
    listen('clipboard', function (m) { S.clip = m; });   // phase 2 of Marlowe's flow: one running list per agent
    listen('tickets', function (m) { S.tickets = m; });
    listen('tools', function (m) { S.tools = m; });
    listen('sessions', function (m) { S.sessions = m; });
    S.unsub.meta = db.doc('meta/sync').onSnapshot(function (s) { S.meta = s.exists ? s.data() : null; renderAll(); }, function () {});
    S.unsub.records = db.doc('meta/records').onSnapshot(function (s) { S.records = s.exists ? s.data() : null; renderAll(); }, function () {});
    S.unsub.credits = db.doc('meta/credits').onSnapshot(function (s) { S.credits = s.exists ? s.data() : null; renderAll(); }, function () {});   // API credit watch (Kev, 4 Nov): counts and seat names, so it stays up under screen share
    S.unsub.today = db.doc('meta/today').onSnapshot(function (s) { S.today = s.exists ? s.data() : null; renderAll(); }, function () {});
    if (!S.share) attachBenches();
    TD.un = []; TD.date = null; TD.doc = null; tdWatch();
    renderAll();
  }
  function boot() {
    if (innerWidth <= 820) $('#lb').open = false;       // the leaderboard opens on a desk-sized screen and stays one tap away on a phone
    exampleData(); renderAll(); tick();
    var use = window.claude && typeof window.claude.use === 'function' ? window.claude.use.bind(window.claude) : function () { return Promise.resolve(null); };
    use('db').then(function (db) { if (db) goLive(db); }, function () {});
    use('assets').then(function (a) { if (a) { S.assets = a; $('#photo-btn').hidden = false; renderAll(); } }, function () {});
    $('#photo-btn').addEventListener('click', function () { pickPhoto(S.sheet && S.sheet.kind === 'desk' ? S.sheet.id : 'radar'); });
    $('#photo-in').addEventListener('change', function (e) {
      var files = [].slice.call(e.target.files || []); if (!files.length) return;
      S.photo = { files: files, agent: S.photoAgent || 'radar' };
      openSheet('lever', 'photo', $('#photo-btn'));
    });
    $('#talk-radar').addEventListener('click', function () { openSheet('desk', 'radar', $('#radar')); setTimeout(focusChat, 350); });
    use('mcp').then(function (m) { if (m) { S.mcp = m; watchCalendar(m); } }, function () {});
    use('sample').then(function (fn) { if (fn) { S.sample = fn; renderAll(); } }, function () {});
    use('user').then(function (u) { if (u && typeof u.can === 'function') return u.can('data.write').then(function (ok) { if (ok === false) { S.canWrite = false; renderAll(); } }); }, function () {}).catch(function () {});
    setInterval(function () { tick(); renderAll(); }, 30000);           // every 30 s, so the board and the line never sit longer than a minute without a render
    setInterval(tickLive, 1000);                                          // the oldest ticket's clock
    var wake = function () { if (!document.hidden) { tick(); renderAll(); } };   // a background tab's timers are throttled: catch up the moment it is looked at
    document.addEventListener('visibilitychange', wake); addEventListener('focus', wake); addEventListener('pageshow', wake);
    var hash = location.hash.slice(1); if (hash && (hash === 'radar' || S.agents[hash])) openSheet('desk', hash, null);
    var savedMode = null; try { savedMode = localStorage.getItem('eo-mode'); } catch (x) {}
    if (hash === 'today' || (!hash && savedMode === 'today')) setMode('today', true);
  }
