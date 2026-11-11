// Command Center · desks.js (split from eden-office.html, 30 Oct 2026). Desk sheets: tickets, chats, projects, needs, autopsies, benches, levers and photo upload.
// Panel files share the page's global scope and load in this order: core.js, floor.js, pulse.js, strip.js, family.js, desks.js, today.js, boot.js. Edit here, not in the html.
'use strict';
  /* ---------- the sheet: sit down at a desk, a bench or a lever ---------- */
  function stateChip(light, e) { return WORD[light] + (e && e.stale ? ' · stale' : ''); }
  function head(title, light, sub, eyebrow) {
    var hd = h('div', { class: 'panel-h' });
    if (light) hd.appendChild(led(light, true));
    hd.appendChild(h('h2', { id: 'sheet-title', text: title }));
    if (sub) hd.appendChild(h('span', { class: 'role', text: sub }));
    hd.appendChild(h('span', { class: 'eyebrow', text: eyebrow || (S.live ? (S.meta ? 'Synced ' + ago(S.meta.syncedAt) : 'Live') : 'Example data') }));
    hd.appendChild(h('button', { class: 'stand', 'data-stand': '', text: 'Stand up · Esc', title: 'Back to the floor (Esc)' }));
    return hd;
  }
  function ticketForm(agentId, withAgent) {
    var f = h('form');
    var sel = h('select', { required: 'required' });
    Object.keys(S.agents).map(function (k) { return S.agents[k]; }).filter(function (a) { return !hidden(a); }).forEach(function (a) { sel.appendChild(h('option', { value: a.id, text: a.name })); });
    if (agentId) sel.value = agentId;
    var ask = h('textarea', { maxlength: '500', required: 'required', placeholder: 'What should they do? No pay, phone numbers or candidate contact details.' });
    var due = h('input', { type: 'date' });
    var pr = h('select'); [['today', 'Today'], ['now', 'Now'], ['whenever', 'Whenever']].forEach(function (o) { pr.appendChild(h('option', { value: o[0], text: o[1] })); });
    if (withAgent) f.appendChild(h('label', null, 'Agent', sel));
    f.appendChild(h('label', null, 'Priority', pr));
    f.appendChild(h('label', { class: 'full' }, 'Ask', ask)); f.appendChild(h('label', null, 'Due (optional)', due));
    var go = h('button', { class: 'key', type: 'submit', text: 'Create ticket' }); go.disabled = !S.canWrite;
    f.appendChild(h('div', null, go));
    f.appendChild(h('p', { class: 'small full', text: S.flash || ('Radar picks tickets up in the hourly sweep (next: ' + nextSweep() + '). Say "go" in chat to run one now.') }));
    f.addEventListener('submit', function (ev) {
      ev.preventDefault(); if (!ask.value.trim()) return;
      makeTicket({ agent: withAgent ? sel.value : agentId, ask: ask.value.trim(), priority: pr.value, due: due.value || null });
      S.flash = 'Created. Radar picks it up in the sweep (next: ' + nextSweep() + ').'; S.formOpen = false; renderSheet();
    });
    return f;
  }
  function itemRow(i) {
    if (i.kind === 'sla') return h('div', { class: 'item' }, led(i.light, true), h('span', { class: 't' }, i.title, h('span', { class: 'ago', text: ' · ' + ago(i.raisedAt) }), h('small', { class: 'why', text: i.light === 'urgent' ? 'Waiting for pickup past 60 minutes of runner time. It clears when the ticket is picked up.' : 'Picked up, no result after 4 hours of runner time.' })));
    var acts = h('span', { class: 'sacts', style: 'padding:0' });
    if (usefulLink(i.link)) acts.appendChild(h('a', { class: 'mini txt', href: linkUrl(i.link), target: '_blank', rel: 'noopener', text: openLabel(i.link) }));
    if (i.preview) { var rd = h('button', { class: 'mini txt', text: openDrafts[i.key] ? 'Hide draft' : 'Read draft' }); rd.addEventListener('click', function () { openDrafts[i.key] = !openDrafts[i.key]; S.forceSheet = true; renderSheet(); }); acts.insertBefore(rd, acts.firstChild); }
    if (!usefulLink(i.link) && !i.preview && !i.found && i.kind !== 'sla' && !needsApproval(i)) {
      var asked = Object.keys(S.tickets).some(function (k) { var x = S.tickets[k]; return x.lever === 'brief' && x.ask.indexOf(i.title) >= 0 && x.status !== 'done'; });
      var br = h('button', { class: 'mini txt', text: asked ? 'Brief asked for' : 'Brief me', title: 'Nothing to open yet: ask ' + nameOf(i.agent) + ' for a link and a five-line summary' }); br.disabled = asked || !S.canWrite;
      br.addEventListener('click', function () { makeTicket({ agent: i.agent, ask: 'Brief Kev on this, which reached him with nothing to open: "' + i.title + '". Put the full result at a link on the item and give him five lines: what it is, what you recommend, and the decisions you need from him.', priority: 'today', lever: 'brief' }); S.forceSheet = true; renderSheet(); });
      acts.appendChild(br);
    }
    var appr = needsApproval(i);
    var done = h('button', { class: appr ? 'mini' : 'mini primary', text: appr ? 'Did it myself' : 'Done', title: 'You handled it yourself. The item closes and no agent acts on it.', 'data-act': 'done', 'data-key': i.key }); done.disabled = !S.canWrite;
    var fu = h('button', { class: 'mini', text: 'Follow up', title: 'Send it back with a question', 'data-act': 'followup', 'data-key': i.key }); fu.disabled = !S.canWrite;
    var seg = h('span', { class: 'seg', role: 'group', 'aria-label': 'Decide' });
    var px = appr ? approvalOf(i) : null;
    if (appr && approveOpen[i.key] && px) {        // second tap: the confirm names the exact action; only this saves the yes
      var yes = h('button', { class: 'mini primary', text: 'Confirm: ' + clip1(px.exact, 70) }); yes.disabled = !S.canWrite;
      yes.addEventListener('click', function () { delete approveOpen[i.key]; markAction(i.key, 'approve', { confirmed: true, qc: px.qc, hash: px.hash, exact: px.exact }); S.forceSheet = true; renderSheet(); });
      var no = h('button', { class: 'mini txt', text: 'Cancel' }); no.addEventListener('click', function () { delete approveOpen[i.key]; S.forceSheet = true; renderSheet(); });
      acts.appendChild(yes); acts.appendChild(no);
    } else {
      if (appr) { var ok = h('button', { class: 'mini primary', text: 'Approve', title: px ? 'Your yes for exactly the action shown. A second tap confirms.' : 'Waiting for the next sync to show the exact action' }); ok.disabled = !S.canWrite || !px; ok.addEventListener('click', function () { approveOpen[i.key] = true; S.forceSheet = true; renderSheet(); }); seg.appendChild(ok); }
      seg.appendChild(done); seg.appendChild(fu); acts.appendChild(seg);
    }
    zzz(acts, i);
    if (!i.seen) { var sn = seenBtn(i); sn.className = 'mini txt'; acts.appendChild(sn); }
    var row = h('div', { class: 'item' }, led(i.light, true), h('span', { class: 't' }, i.rank != null ? h('span', { class: 'rk', text: '#' + i.rank }) : null, i.title, h('span', { class: 'ago', text: ' · ' + ago(i.raisedAt) }), i.why ? h('small', { class: 'why', text: i.why }) : null), acts);
    if (i.found) row.appendChild(h('div', { class: 'exact draft' }, h('b', { text: 'What ' + nameOf(i.agent) + ' found' }), '\n' + i.found.text + '\n\nFrom ticket ' + i.found.from + '. Done means you have dealt with it; Follow up sends it back with a question.'));
    if (appr) row.appendChild(h('div', { class: 'exact', style: 'grid-column:2' }, h('b', { text: px ? 'Approve carries out exactly this, once:' : 'The exact action shows here after the next sync.' }), px ? '\n' + px.exact : '', '\n\nDid it myself closes it with no agent action.'));
    if (i.preview && openDrafts[i.key]) row.appendChild(h('div', { class: 'exact draft' }, h('b', { text: 'To: ' + ((i.preview.to || []).join(', ') || 'blank, add before sending') }), '\n' + i.preview.text + '\n\nNothing sends from here. Proof it, then open Superhuman to edit and send.'));
    return row;
  }
  /* ---------- quick chat: the fast model, briefed with this desk's status; notes save to chats/{agent}/messages ---------- */
  function chatPrompt(a, text) {
    var e = effective(a), lines = [];
    lines.push('You are ' + a.name + ', ' + (a.role || 'an AI employee') + ', one of the AI employees working for Kev Williams (Eden Executive Search and Eden Partner Group; KDTW Group is the family office).');
    lines.push('This is the quick chat at your desk in Eden Office. Kev pops in for fast decisions and zips back out. Reply in at most four short sentences, plain words, no preamble, no lists unless he asks.');
    lines.push('HOW THE OFFICE WORKS (say this plainly when asked): You are the quick desk version of ' + a.name + '. The full ' + a.name + ' is the same employee run by Radar, the chief of staff, with the files, tools and connectors; Radar runs it on tickets in the hourly weekday sweep (7am to 6pm Pacific) or right away when Kev says "go" in his chat with Radar. Everything Kev says here is saved and Radar reads it every sweep, files his directions into your memory and acts on them, so Kev never repeats himself. Approvals: anything that writes to a live system, spends or publishes waits for Kev\'s Approve tap on the item in the Office, which shows the exact action. "Done" on an item means Kev did it himself: it closes and no agent acts on it, so never treat Done as a go-ahead. A yes in this chat is recorded as his direction; the item still waits for his Approve tap. Drafted emails wait in his Superhuman Drafts and he sends them himself.');
    lines.push('THE TEAM: Radar (chief of staff, runs everyone), Scout (lead research), Casey (Client Care Manager: the job-order board and depth charts in the Team Hub; turns voice notes into JOs, briefs Scout on new JOs, preps client reviews and drafts follow-ups for Kev), Ember (MPC and warm-inventory keeper, next to Casey: reads Crelate weekdays for MPCs and people tagged for follow-up who are not in process, posts touch-due asks to the owner recruiter, and each Monday drafts 3 to 5 MPCs to take to market for Kev\u2019s review; never sends), Dean (scorecards, Eden University; weekly scorecards are graded on PDF and uploaded through Upload, and Dean files each one to that person’s Round Table folder as the record; each recruiter’s goal is the $25k-per-quarter accelerator, credited by the recruiter and split columns of the Hub Rev Report, with annual totals tracked behind the scenes), Q (systems and engineering; cuts friction), Jenny (comms director: inbox, client and candidate writing, travel, events; no exclamation marks in anything she writes; travel defaults to the cheapest refundable option), Tally (finance), Docket (contracts and risk, second key on Tally), Pam (projects PM: special projects inside Eden Partner Group, now the Eden Staffing temp-staffing launch with Nick; chases admin deliverables and reports to Radar), Atlas (tutor), Marlowe (architect and designer), Keys (the Vancouver rental), Hale (health), Jethro (growth coach, C12), Barny (spiritual advisor).');
    lines.push('You only know what is below. You cannot see files, email or tools, and you have done no work in this chat, so never say you did, checked or sent anything. You never send, spend or publish. When Kev decides or approves something, restate it as the Direction line and say Radar will queue it; do not ask him to repeat himself or be more specific unless it is genuinely ambiguous. If you do not know something, say so and offer a ticket.');
    lines.push('When Kev gives you a direction or a decision, end with one line: "Direction: <it, in one sentence>". When it needs real work from the full agent, end with one line: "Ticket: <the ask, in one sentence>".');
    lines.push('', 'YOUR DESK RIGHT NOW (from the Office, ' + (S.live ? 'live' : 'example data') + '):');
    lines.push('Status: ' + WORD[e.light] + (e.stale ? ' (stale)' : '') + '. Task: ' + (a.task || 'none posted') + '. Last heard: ' + ago(heardAt(a)) + '.');
    if (e.items.length) lines.push('Needs Kev: ' + e.items.map(function (i) { return i.title; }).join(' | '));
    var naps = snoozedFor(a.id); if (naps.length) lines.push('Kev snoozed these (bring them up whenever he asks what you need or what is open): ' + naps.map(function (x) { return x.title + ' (back ' + untilLabel(x.until) + ')'; }).join(' | '));
    var tk = Object.keys(S.tickets).map(function (k) { return S.tickets[k]; }).filter(function (x) { return x.agent === a.id && ['open', 'picked', 'working', 'blocked', 'gated'].indexOf(x.status) >= 0; });
    if (tk.length) lines.push('Open tickets: ' + tk.map(function (x) { return x.ask + ' (' + x.status + ')'; }).join(' | '));
    var lg = (S.logs[a.id] || []).slice(0, 5); if (lg.length) lines.push('Recent log: ' + lg.map(function (l) { return l.text; }).join(' | '));
    if (['tally', 'docket', 'radar'].indexOf(a.id) >= 0 && !S.share) {   // Kev, 21 Oct: "Tally should be linked to the cash flow artifact"
      ['finance', 'revenue'].forEach(function (id) { var b = S.benches[id]; if (b && !b.example && b.tiles && b.tiles.length) lines.push(id.charAt(0).toUpperCase() + id.slice(1) + ' bench (as of ' + String(b.asOf || '').slice(0, 10) + '): ' + b.tiles.map(function (x) { return x.label + ' ' + x.value + (x.gate && !x.needsGate ? ' (gate ' + x.gate + ')' : ' (not yet checked)'); }).join(' | ')); });
      var cp = toolMap()['cash-pulse'];
      lines.push('Cash flow detail lives in EPG Cash Pulse' + (cp && cp.url ? ' (' + cp.url + ')' : '') + ': bank lines by month, the Q4 cash forecast and Rev Report placements with expected cash dates. If Kev asks for a figure that is not above, say it is not on the floor yet, point him to Cash Pulse, and offer a ticket for Tally to pull it from QuickBooks.');
    }
    if (a.id === 'radar') {
      lines.push('', 'YOU ARE RADAR IN A REAL CONVERSATION. Kev chose the deep model to think out loud with you. Talk like his chief of staff and battle buddy: result first, plain words, push back when something is off, recommend one option, ask at most one question back. Up to 8 sentences when the topic needs it. Kev is a Christian founder; the Seven Pillars are Righteousness, Winning, Accountability, Discipline, Transparency, Growth, Execution. The Sabbath runs Friday sunset to Saturday sunset: anything Kev asks then is held and launched after sundown Saturday. You can hand any agent a ticket with the make_ticket tool when Kev decides something should happen; say you did. You never send, spend or publish.', '', 'THE WHOLE FLOOR RIGHT NOW:');
      Object.keys(S.agents).map(function (k) { return S.agents[k]; }).filter(function (x) { return x.id !== 'radar' && !hidden(x); }).forEach(function (x) {
        var ex = effective(x); lines.push('- ' + x.name + ' (' + (x.role || '') + '): ' + WORD[ex.light] + (ex.stale ? ', stale' : '') + '. Task: ' + (x.task || 'none posted') + '.' + (ex.items.length ? ' Needs Kev: ' + ex.items.slice(0, 8).map(function (i) { return (i.rank != null ? '#' + i.rank + ' ' : '') + i.title; }).join(' | ') : ''));
      });
      var openT = Object.keys(S.tickets).map(function (k) { return S.tickets[k]; }).filter(function (x) { return ['open', 'picked', 'working', 'blocked', 'gated'].indexOf(x.status) >= 0; });
      if (openT.length) lines.push('Open tickets: ' + openT.slice(0, 15).map(function (x) { return nameOf(x.agent) + ': ' + x.ask + ' (' + x.status + ')'; }).join(' | '));
      var fl = laneOf(S.focus); if (fl) lines.push('Kev is in ' + (S.focus.kind === 'recruit' ? 'recruit mode' : 'deep work on ' + fl.name) + (S.focus.task ? ' (' + S.focus.task + ')' : '') + '. Keep him on it; park anything outside that lane unless it is urgent.');
      if (S.today && S.today.lines && !S.share) lines.push('Today: ' + S.today.lines.map(function (l) { return l.at + ' ' + l.text; }).join(' | '));
    }
    var hist = (S.chats[a.id] || []).slice(-10);
    if (hist.length) { lines.push('', 'EARLIER IN THIS CHAT:'); hist.forEach(function (m) { lines.push((m.role === 'kev' ? 'Kev: ' : a.name + ': ') + m.text); }); }
    lines.push('', 'Kev: ' + text, '', a.name + ':');
    return lines.join('\n');
  }
  function saveMsg(agentId, role, text) {
    var at = new Date().toISOString(), id = at.replace(/[-:.TZ]/g, '') + '-' + role;
    var doc = { role: role, text: text, at: at, filed: false };
    (S.chats[agentId] = S.chats[agentId] || []).push(doc);
    if (S.live && S.db && S.canWrite) S.db.doc('chats/' + agentId + '/messages/' + id).set(doc).catch(function () {});
  }
  var CHAT_COPY = { not_granted: 'Chat is off: Claude access was declined for this page. Reload to be asked again.', rate_limited: 'Too many at once. Give it a few seconds.', };
  function sendChat(a, text) {
    if (!S.sample || S.pending) return;
    var prompt = chatPrompt(a, text);
    saveMsg(a.id, 'kev', text);
    S.pending = { agent: a.id, text: '' }; S.forceSheet = true; renderSheet();
    var deep = a.id === 'radar';
    var tools = deep && S.canWrite ? [{ name: 'make_ticket', description: 'Hand one agent a work ticket in Eden Office. Returns the ticket id. Use only when Kev has decided something should be done. agent is one of: ' + Object.keys(S.agents).join(', ') + '.',
      inputSchema: { type: 'object', properties: { agent: { type: 'string' }, ask: { type: 'string', description: 'One clear sentence, names and roles only' }, priority: { type: 'string', enum: ['now', 'today', 'whenever'] } }, required: ['agent', 'ask'] },
      execute: function (inp) { var ag = String(inp.agent || '').toLowerCase(); if (!S.agents[ag] && ag !== 'radar') throw new Error('Unknown agent ' + ag); var tk = makeTicket({ agent: ag, ask: String(inp.ask || '').slice(0, 500), priority: ['now', 'today', 'whenever'].indexOf(inp.priority) >= 0 ? inp.priority : 'today', lever: 'radar-chat' }); return { id: tk.id, agent: ag }; } }] : undefined;
    S.sample(prompt, { modelTier: deep ? 'complex' : 'quick', cache: false, tools: tools, onText: function (x) {
      if (!S.pending) return; S.pending.text = x.text; var el = document.getElementById('pendingmsg'); if (el) { el.lastChild.textContent = x.text; var lg = el.parentNode; lg.scrollTop = lg.scrollHeight; }
    } }).then(function (r) {
      S.pending = null; saveMsg(a.id, 'agent', (r.text || '').trim()); S.forceSheet = true; renderAll(); focusChat();
      if (S.voice && window.speechSynthesis) { try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance((r.text || '').replace(/^(Direction|Ticket):.*$/gm, '').trim()); u.rate = 1.05; speechSynthesis.speak(u); } catch (e) {} }
    }, function (err) {
      var kept = S.pending && S.pending.text; S.pending = null;
      if (kept) saveMsg(a.id, 'agent', kept.trim());
      S.flash = CHAT_COPY[err && err.code] || 'That reply did not come through. Try again.';
      if (err && err.code === 'not_granted') S.sample = null;
      S.forceSheet = true; renderAll();
    });
  }
  /* voice: the browser's own speech recognition; the reply is read aloud. Falls back quietly where the viewer blocks the microphone. */
  var rec = null;
  function toggleListen(a, ta) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return;
    if (rec) { try { rec.stop(); } catch (e) {} return; }
    rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false;
    var said = '';
    rec.onresult = function (ev) { said = [].map.call(ev.results, function (r) { return r[0].transcript; }).join(' '); var t2 = $('#chat-in'); if (t2) t2.value = said; };
    rec.onerror = function (ev) { S.flash = ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? 'The microphone is blocked in this view. Use your keyboard\'s dictation mic instead; it works the same.' : 'Did not catch that. Try again.'; };
    rec.onend = function () { rec = null; S.listening = false; S.voice = !!said; S.forceSheet = true; renderSheet(); if (said.trim()) { var t3 = $('#chat-in'); if (t3) t3.value = ''; sendChat(a, said.trim()); } };
    try { rec.start(); S.listening = true; S.flash = 'Listening...'; S.forceSheet = true; renderSheet(); } catch (e) { rec = null; S.flash = 'The microphone is not available here. Use your keyboard\'s dictation mic.'; S.forceSheet = true; renderSheet(); }
  }
  function focusChat() { var ta = $('#chat-in'); if (ta) ta.focus(); var lg = $('.chatlog'); if (lg) lg.scrollTop = lg.scrollHeight; }
  function chatSection(a) {
    var sec = h('section', { class: 'chat' }, h('h3', { text: a.id === 'radar' ? 'Talk with Radar · deep model' : 'Quick chat with ' + a.name }));
    if (!S.sample) { sec.appendChild(h('p', { class: 'small', text: 'Chat needs Claude access on this page; it lights up in the Claude viewer. Hand a ticket meanwhile.' })); return sec; }
    var log = h('div', { class: 'chatlog', 'aria-live': 'polite' });
    (S.chats[a.id] || []).slice(-14).forEach(function (m) { log.appendChild(h('div', { class: 'msg ' + (m.role === 'kev' ? 'kev' : 'agent') }, h('b', { text: m.role === 'kev' ? 'You' : a.name }), m.text)); });
    if (S.pending && S.pending.agent === a.id) log.appendChild(h('div', { class: 'msg agent', id: 'pendingmsg' }, h('b', { text: a.name }), S.pending.text || 'Thinking...'));
    if (!log.childNodes.length) log.appendChild(h('p', { class: 'small', text: 'Quick hits: ask, decide, give direction. ' + a.name + ' knows this desk\'s status and your recent notes here, not the files.' }));
    sec.appendChild(log);
    var last = (S.chats[a.id] || []).filter(function (m) { return m.role === 'agent'; }).slice(-1)[0], tm = last && /^Ticket:\s*(.+)$/m.exec(last.text);
    if (tm && !S.pending) {
      var mk = h('button', { class: 'mini', text: 'Make it a ticket: ' + tm[1].slice(0, 60) }); mk.disabled = !S.canWrite;
      mk.addEventListener('click', function () { makeTicket({ agent: a.id, ask: tm[1].trim(), priority: 'today', lever: 'chat' }); mk.textContent = 'Ticket created'; mk.disabled = true; });
      sec.appendChild(mk);
    }
    var f = h('form', { class: 'chatform' }), ta = h('textarea', { id: 'chat-in', maxlength: '1000', placeholder: (a.id === 'radar' ? 'Talk it through with Radar.' : 'Quick note or decision for ' + a.name + '.') + ' Enter sends; Shift+Enter for a new line.', 'aria-label': 'Message ' + a.name });
    var go = h('button', { class: 'key', type: 'submit', text: S.pending ? '...' : 'Send' }); go.disabled = !!S.pending;
    ta.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); f.requestSubmit ? f.requestSubmit() : go.click(); } });
    f.addEventListener('submit', function (ev) { ev.preventDefault(); var v = ta.value.trim(); if (!v) return; ta.value = ''; S.flash = ''; sendChat(a, v); });
    f.appendChild(ta);
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      var mic = h('button', { class: 'key mic', type: 'button', 'aria-pressed': String(!!S.listening), title: 'Speak instead of typing; the reply is read aloud', text: S.listening ? 'Stop' : 'Mic' });
      mic.addEventListener('click', function () { toggleListen(a, ta); });
      f.appendChild(mic);
    }
    f.appendChild(go); sec.appendChild(f);
    sec.appendChild(h('p', { class: 'small', text: S.flash || (a.id === 'radar' ? 'Deep model: it thinks before it answers, so give it a few seconds. It sees the whole floor and can hand out tickets. Saved here.' : 'Fast model. Saved here; Radar files the directions into ' + a.name + '\'s memory on the next sweep' + (sensitiveAgent(a.id) ? ' (private notes go to your private Notion page, never the repo).' : '.')) }));
    return sec;
  }
  function watchChat(id) {
    if (!S.live || !S.db || S.unsub['chat-' + id] || (S.share && sensitiveAgent(id))) return;
    S.unsub['chat-' + id] = S.db.collection('chats/' + id + '/messages').orderBy('at', 'desc').limit(30).onSnapshot(function (snap) {
      S.chats[id] = snap.docs.map(function (d) { return d.data(); }).reverse(); renderAll();
    }, function () { S.unsub['chat-' + id] = null; });
  }

  /* ---------- the desk sheet (Kev, 29 Oct 2026): projects, not a feed ----------
     "we need the feed to be a list of clickable projects we're working on with each bot. Tasks should be far more collapsed and have a title on them
     explaining what is done. but less is more here... use less words, show tasks that are shipped, open to work on, or need input."
     Top to bottom: header; NEEDS YOUR INPUT (open, one line each, answer on the line); PROJECTS (collapsed rows with chips); other open work;
     Hand a ticket behind a button; chat. Titles, the project a ticket belongs to and the item lists come from Proj (workshop/core/office-projects.js);
     the hourly sync writes agents/{id}.projects, and the page lays this hour's live tickets over it so a closed ticket moves to Shipped at once. */
  var FEED_WORD = { open: 'Waiting', picked: 'Picked up', working: 'Working', waiting: 'Waiting', blocked: 'Blocked', gated: 'Needs your yes', done: 'Done' };
  function fromOf(x) { return x.createdBy === 'radar' || /^(radar|runner|radar-chat)$/.test(x.lever || '') ? { who: 'Radar', av: 'R', cls: 'r' } : x.lever === 'session' ? { who: 'Kev · session', av: 'K', cls: 'k' } : { who: 'Kev', av: 'K', cls: 'k' }; }
  /* Kev, 27 Oct: once he taps Approve, Done or Follow up on a ticket waiting on him, it leaves the open line at once; Radar still applies it next sweep */
  function kevClosed(x) { if (x.status !== 'gated' && x.status !== 'blocked') return false; var key = 'ticket-' + x.id + '-' + x.status, act = S.actions[key]; return !!act && act.action !== 'snooze' && acted(key); }

  var prjOpen = {}, itemOpen = {}, moreOpen = {}, fuOpen = {}, fuDraft = {};
  var CONNECTORS_URL = 'https://claude.ai/settings/connectors';
  var STAFFING = { id: 'eden-staffing', title: 'Eden Staffing', keywords: ['Eden Staffing', 'EOR', 'BaaS', 'temp staffing'] };
  function rerender() { S.forceSheet = true; renderAll(); }

  /* Project definitions the page knows: every project in a visible desk's synced document (Screen share drops the private desks'), plus Eden Staffing. */
  function projectDefs() {
    var m = {}; m[STAFFING.id] = STAFFING;
    Object.keys(S.agents).forEach(function (k) { var a = S.agents[k]; if (hidden(a)) return; (a.projects || []).forEach(function (p) { if (!m[p.id] || m[p.id] === STAFFING) m[p.id] = { id: p.id, title: p.title, keywords: p.keywords || [] }; }); });
    return Object.keys(m).map(function (k) { return m[k]; });
  }
  /* A ticket from the Special projects bay ("Hand to PM") is an Eden Staffing ticket whatever its words are. */
  function projTicket(x) { return x.project || x.lever !== 'projects' ? x : Object.assign({}, x, { project: STAFFING.id }); }
  /* Eden Staffing before the sync has carried the schedule's rows: the working doc's deliverables (PROJECT_ITEMS) as open items. */
  function staffingFallback() {
    var asked = {}; Object.keys(S.tickets).forEach(function (k) { var x = S.tickets[k]; if (x.agent === 'pm' && x.status !== 'done') asked[x.ask] = true; });
    var items = []; PROJECT_ITEMS.forEach(function (g) { g[1].forEach(function (ask) { if (!asked[ask]) items.push({ title: Proj.cutWords(Proj.firstClause(ask), Proj.TITLE_WORDS), state: 'open', link: '', note: ask }); }); });
    return { id: STAFFING.id, title: STAFFING.title, status: 'Launch deliverables from the working doc', statusAuto: false, items: items };
  }
  /* The projects on one desk, laid out for the page: the synced document's, with this moment's tickets merged in. */
  function agentProjects(a) {
    var now = Date.now(), defs = projectDefs();
    var mine = Object.keys(S.tickets).map(function (k) { return projTicket(S.tickets[k]); }).filter(function (x) { return x.agent === a.id && !ticketHidden(x) && !kevClosed(x); });
    var g = Proj.groupTickets(mine, defs, now), docs = (a.projects || []).slice();
    if (a.id === 'pm' && !docs.some(function (p) { return p.id === STAFFING.id; })) docs.push(staffingFallback());
    var seen = {}, out = [];
    function add(p, tks) {
      var file = (p.items || []).filter(function (i) { return !i.ticket; });          // the sync's ticket items are re-made from the live tickets
      var items = Proj.mergeItems(file, tks || [], now).map(function (i) { return Object.assign({}, i, { url: i.link ? linkUrl(i.link) : '' }); });
      var c = Proj.countItems(items);
      out.push({ id: p.id, title: p.title, status: p.statusAuto === false ? p.status : Proj.autoStatus(items), url: p.link ? linkUrl(p.link) : '', items: items, counts: c });
      seen[p.id] = true;
    }
    docs.forEach(function (p) { add(p, g.byProject[p.id]); });
    Object.keys(g.byProject).forEach(function (id) { if (seen[id]) return; var d = defs.filter(function (x) { return x.id === id; })[0]; add({ id: id, title: d ? d.title : id, statusAuto: true, items: [] }, g.byProject[id]); });
    var proj = {}; out.forEach(function (p) { proj[p.id] = true; });
    var loose = g.loose.filter(function (x) { return Proj.ticketState(x) === 'open'; }).sort(function (x, y) { return t(y.updatedAt || y.createdAt) - t(x.updatedAt || x.createdAt); });
    out.sort(function (x, y) { return (y.counts.needs * 100 + y.counts.open) - (x.counts.needs * 100 + x.counts.open) || x.title.localeCompare(y.title); });
    return { projects: out, loose: loose };
  }

  /* ---- NEEDS YOUR INPUT: what is waiting on Kev, with the answer on the line (Kev, 29 Oct: "these are blocked by me but idk even how to move them forward without clicking in here") ---- */
  var LRANK = { urgent: 0, reply: 1, review: 2, blocked: 3 };
  function agentNeeds(id) {
    return agentItems(id).filter(function (i) { return i.needsKev && i.kind !== 'sla' && !/^ticket-.+-done$/.test(i.key || ''); })
      .sort(function (x, y) { return ((x.rank == null ? 99 : x.rank) - (y.rank == null ? 99 : y.rank)) || ((LRANK[x.light] || 0) - (LRANK[y.light] || 0)) || (t(x.raisedAt) - t(y.raisedAt)); });
  }
  function allNeeds() {
    var out = []; Object.keys(S.agents).forEach(function (id) { if (!hidden(S.agents[id])) out = out.concat(agentNeeds(id)); });
    return out.sort(function (x, y) { return ((LRANK[x.light] || 0) - (LRANK[y.light] || 0)) || (t(x.raisedAt) - t(y.raisedAt)); });
  }
  /* The thing he needs to act on, when there is one: a link the ticket or alert carries, a URL named in blockedOn, or the connector settings page when it is a sign-in. */
  function needLink(i, tk) {
    var why = tk ? (tk.blockedOn || '') : (i.kind === 'blocked' ? i.title : ''), m = /https?:\/\/[^\s)>\]]+/.exec(why);
    var u = (tk && tk.blockedLink) || usefulLink(i.link) || (m && m[0]) || (/connector|sign[- ]?in|re-?auth|log[- ]?in|authori[sz]/i.test(why) ? CONNECTORS_URL : '') || (tk && tk.result && tk.result.link) || '';
    if (!u) return null;
    var url = linkUrl(u);
    return { url: url, label: url === CONNECTORS_URL ? 'Open connectors' : openLabel(url) };
  }
  function needRow(i, withWho) {
    var m = /^ticket-(.+)-(?:gated|blocked)$/.exec(i.key || ''), tk = m && S.tickets[m[1]], key = i.key;
    var title = (i.rank != null ? '#' + i.rank + ' ' : '') + (tk ? Proj.ticketTitle(tk) : Proj.cutWords(i.title, Proj.TITLE_WORDS));
    var line = tk ? (Proj.needLine(tk) || 'No reason recorded. Follow up to ask.') : (i.why ? Proj.cutWords(i.why, Proj.NEED_WORDS) : '');
    var row = h('div', { class: 'need' });
    var top = h('div', { class: 'nt' }, led(i.light, true), h('b', { text: title }), h('span', { class: 'ago', text: ago(i.raisedAt) }));
    if (withWho) top.appendChild(h('span', { class: 'who', text: nameOf(i.agent) }));
    row.appendChild(top);
    if (line) row.appendChild(h('div', { class: 'nl', text: line }));
    var acts = h('div', { class: 'nacts' }), lk = needLink(i, tk), appr = needsApproval(i), px = appr ? approvalOf(i) : null;
    if (lk) acts.appendChild(h('a', { class: 'mini txt', href: lk.url, target: '_blank', rel: 'noopener', text: lk.label }));
    if (i.preview) { var rd = h('button', { class: 'mini txt', text: openDrafts[key] ? 'Hide draft' : 'Read draft' }); rd.addEventListener('click', function () { openDrafts[key] = !openDrafts[key]; rerender(); }); acts.appendChild(rd); }
    if (appr && approveOpen[key] && px) {                    // second tap: the confirm names the exact action; only this saves the yes
      var yes = h('button', { class: 'mini primary', text: 'Confirm: ' + clip1(px.exact, 60) }); yes.disabled = !S.canWrite;
      yes.addEventListener('click', function () { delete approveOpen[key]; markAction(key, 'approve', { confirmed: true, qc: px.qc, hash: px.hash, exact: px.exact }); rerender(); });
      var no = h('button', { class: 'mini txt', text: 'Cancel' }); no.addEventListener('click', function () { delete approveOpen[key]; rerender(); });
      acts.appendChild(yes); acts.appendChild(no);
    } else if (fuOpen[key]) {
      var send = function () { var v = (fuDraft[key] || '').trim(); delete fuOpen[key]; delete fuDraft[key]; markAction(key, 'followup', v ? { note: v.slice(0, 300) } : {}); rerender(); };
      var inp = h('input', { class: 'fu', type: 'text', maxlength: '200', 'data-td-in': 'fu-' + key, placeholder: 'What should ' + nameOf(i.agent) + ' do next?', 'aria-label': 'Follow-up note for ' + nameOf(i.agent) });
      inp.value = fuDraft[key] || ''; inp.disabled = !S.canWrite;
      inp.addEventListener('input', function () { fuDraft[key] = inp.value; });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send(); } });
      var go = h('button', { class: 'mini primary', text: 'Send' }); go.disabled = !S.canWrite; go.addEventListener('click', send);
      var cx = h('button', { class: 'mini txt', text: 'Cancel' }); cx.addEventListener('click', function () { delete fuOpen[key]; rerender(); });
      acts.appendChild(inp); acts.appendChild(go); acts.appendChild(cx);
    } else {
      var seg = h('span', { class: 'seg', role: 'group', 'aria-label': 'Answer' });
      if (appr) { var ok = h('button', { class: 'mini primary', text: 'Approve', title: px ? 'Your yes for exactly the action shown. A second tap confirms.' : 'Waiting for the next sync to show the exact action' }); ok.disabled = !S.canWrite || !px; ok.addEventListener('click', function () { approveOpen[key] = true; rerender(); }); seg.appendChild(ok); }
      var dn = h('button', { class: appr ? 'mini' : 'mini primary', text: appr ? 'Did it myself' : 'Done (I handled it)', title: 'You handled it yourself. It closes and no agent acts on it.', 'data-act': 'done', 'data-key': key }); dn.disabled = !S.canWrite;
      var fu = h('button', { class: 'mini', text: 'Follow up', title: 'Send it back with a note' }); fu.disabled = !S.canWrite;
      fu.addEventListener('click', function () { fuOpen[key] = true; rerender(); var n = document.querySelector('[data-td-in="fu-' + key + '"]'); if (n) n.focus(); });
      seg.appendChild(dn); seg.appendChild(fu); acts.appendChild(seg);
    }
    row.appendChild(acts);
    if (appr && px && approveOpen[key]) row.appendChild(h('div', { class: 'exact' }, h('b', { text: 'Approve carries out exactly this, once:' }), '\n' + px.exact));
    if (i.preview && openDrafts[key]) row.appendChild(h('div', { class: 'exact draft' }, h('b', { text: 'To: ' + ((i.preview.to || []).join(', ') || 'blank, add before sending') }), '\n' + i.preview.text + '\n\nNothing sends from here. Proof it, then open Superhuman to edit and send.'));
    return row;
  }
  /* What Kev just answered stays one line with Undo until the next sync clears it; a snooze shows when it wakes. */
  function handledLines(a) {
    var out = [], now = Date.now();
    Object.keys(S.actions).map(function (k) { return S.actions[k]; }).filter(function (x) { return x.agent === a.id && x.action !== 'snooze' && x.action !== 'clipnote' && x.source !== 'daily' && !/^daily-/.test(x.key || '') && acted(x.key) && now - t(x.at) < DAY; })
      .sort(function (x, y) { return t(y.at) - t(x.at); }).slice(0, 3).forEach(function (x) {
        var u = h('button', { class: 'mini txt', text: 'Undo', 'data-undo': x.key }); u.disabled = !S.canWrite;
        var tm = /^ticket-(.+)-(?:gated|blocked|done)$/.exec(x.key || ''), tt = tm && S.tickets[tm[1]] ? Proj.ticketTitle(S.tickets[tm[1]]) : Proj.cutWords(x.title, 6);
        out.push(h('div', { class: 'handled' }, h('span', { class: 't', text: (x.action === 'done' ? 'Done' : x.action === 'approve' ? 'Approved' : 'Sent back') + ' · ' + tt + ' · ' + ago(x.at) + (x.applied ? '' : ' · Radar files it next sweep') }), u));
      });
    snoozedFor(a.id).forEach(function (x) {
      var w = h('button', { class: 'mini txt', text: 'Wake now', 'data-undo': x.key }); w.disabled = !S.canWrite;
      out.push(h('div', { class: 'handled' }, h('span', { class: 't', text: 'Snoozed · ' + Proj.cutWords(x.title, 6) + ' · back ' + untilLabel(x.until) }), w));
    });
    return out;
  }


  /* ---- CLIPBOARD (phase 2 of Marlowe's flow): impact first, waiting-on-Kev pinned, projects above bullets, notes inline ---- */
  var clipOpen = {}, clipNoteDraft = {}, clipLog = {};
  function clipBullets() { return Object.keys(S.clip || {}).map(function (k) { return S.clip[k]; }); }
  function saveClipNote(b) {
    var key = Clip.noteKey(b.id), doc = Clip.noteDoc(b, clipNoteDraft[b.id], S.actions[key], new Date().toISOString()); if (!doc) return;
    delete clipNoteDraft[b.id]; S.actions[key] = doc; rerender();
    if (S.live && S.db && S.canWrite) S.db.doc('actions/' + key).set(doc).catch(function () { delete S.actions[key]; S.flash = 'That note did not save. Try again.'; rerender(); });
  }
  function clipLi(b) {
    var open = !!clipOpen[b.id], li = h('li', { class: 'it cb ' + b.state }), row = h('div', { class: 'it-r' });
    var tg = h('button', { class: 'it-t', type: 'button', 'aria-expanded': String(open), text: b.line });
    tg.addEventListener('click', function () { clipOpen[b.id] = !clipOpen[b.id]; rerender(); });
    row.appendChild(tg); if (b.state === 'kev') row.appendChild(h('span', { class: 'st', text: 'Waiting on you' }));
    li.appendChild(row);
    if (b.why) li.appendChild(h('p', { class: 'cb-why', text: b.why }));
    if (open) {
      var x = h('div', { class: 'it-x' });
      if (b.detail) x.appendChild(h('p', { class: 'clip open', text: b.detail }));
      (b.links || []).slice(0, 3).forEach(function (l) { var u = linkUrl(l.url || l); if (u) x.appendChild(h('a', { class: 'lk', href: u, target: '_blank', rel: 'noopener', text: (l.label || 'Open') + ' ↗' })); });
      Clip.thread(b, S.actions[Clip.noteKey(b.id)]).forEach(function (n) { x.appendChild(h('p', { class: 'cb-note' + (n.pending ? ' pending' : ''), text: (n.by === 'kev' ? 'You' : nameOf(b.agent)) + ': ' + n.text + (n.pending ? ' · ' + nameOf(b.agent) + ' answers next pass' : '') })); });
      var inp = h('input', { class: 'fu', type: 'text', maxlength: '400', placeholder: 'Leave a note, press Enter', 'aria-label': 'Note on ' + b.line, 'data-td-in': 'cb-' + b.id });
      inp.value = clipNoteDraft[b.id] || ''; inp.disabled = !S.canWrite;
      inp.addEventListener('input', function () { clipNoteDraft[b.id] = inp.value; });
      inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); saveClipNote(b); } });
      x.appendChild(inp); li.appendChild(x);
    }
    return li;
  }
  function clipSection(a) {
    var all = clipBullets().filter(function (b) { return b.agent === a.id; }); if (!all.length) return null;
    var v = Clip.clipboard(all, a.id), g = Clip.byProject(all, a.id, a.projects || []);
    var sec = h('section', { class: 'clipboard' }, h('h3', { text: 'Clipboard · ' + (v.shown.length + v.more) + (v.kev ? ' · ' + v.kev + ' waiting on you' : '') }));
    var pinned = v.shown.filter(function (b) { return b.state === 'kev'; });
    if (pinned.length) { var pu = h('ul', { class: 'its' }); pinned.forEach(function (b) { pu.appendChild(clipLi(b)); }); sec.appendChild(pu); }
    var shownIds = {}; v.shown.forEach(function (b) { shownIds[b.id] = true; });
    g.projects.forEach(function (p) {
      var bs = p.bullets.filter(function (b) { return b.state !== 'kev'; }); if (!bs.length && !p.stalled) return;
      var wrap = h('div', { class: 'prj open' }, h('div', { class: 'prj-r' }, h('div', { class: 'prj-h' }, h('span', { class: 'car' }), h('span', { class: 'pt', text: p.title }), h('span', { class: 'chips' }, p.stalled ? h('span', { class: 'chip n', text: 'stalled · no next step' }) : ''), h('span', { class: 'ps', text: p.next ? 'Next: ' + p.next : p.status }))));
      var ul = h('ul', { class: 'its' }); bs.forEach(function (b) { ul.appendChild(clipLi(b)); }); if (bs.length) wrap.appendChild(h('div', { class: 'prj-b' }, ul)); sec.appendChild(wrap);
    });
    var loose = g.loose.filter(function (b) { return b.state !== 'kev'; });
    if (loose.length) { var lu = h('ul', { class: 'its' }); loose.forEach(function (b) { lu.appendChild(clipLi(b)); }); sec.appendChild(h('h4', { class: 'gh', text: 'Other · ' + (loose.length + g.looseMore) })); sec.appendChild(lu); }
    var dl = Clip.doneLog(all, a.id, 10);
    if (dl.length) {
      var d = h('details', { class: 'cb-log' }, h('summary', { text: 'Done log · ' + dl.length })), du = h('ul', { class: 'its' });
      dl.forEach(function (b) { du.appendChild(h('li', { class: 'it shipped' }, h('div', { class: 'it-r' }, h('span', { class: 'it-t', text: b.line }), h('span', { class: 'st', text: ago(b.doneAt) })))); });
      d.appendChild(du); sec.appendChild(d);
    }
    return sec;
  }

  /* ---- PROJECTS ---- */
  var ITEM_CAP = 6;
  function itemText(i) {
    var tk = i.ticket && S.tickets[i.ticket];
    if (tk) return tk.status === 'done' && tk.result && tk.result.summary ? tk.result.summary : (tk.ask || '');
    return i.note || '';
  }
  function itemLi(i, key) {
    var li = h('li', { class: 'it ' + i.state }), txt = itemText(i), row = h('div', { class: 'it-r' }), x = null;
    if (txt) {
      var open = !!itemOpen[key], b = h('button', { class: 'it-t', type: 'button', 'aria-expanded': String(open), text: i.title });
      x = h('div', { class: 'it-x' }); x.hidden = !open;
      var p = h('p', { class: 'clip' + (moreOpen[key] ? ' open' : ''), text: txt }); x.appendChild(p);
      if (txt.length > 110) { var mb = h('button', { class: 'more', type: 'button', text: moreOpen[key] ? 'less' : 'more' }); mb.addEventListener('click', function () { moreOpen[key] = !moreOpen[key]; p.classList.toggle('open', !!moreOpen[key]); mb.textContent = moreOpen[key] ? 'less' : 'more'; }); x.appendChild(mb); }
      b.addEventListener('click', function () { itemOpen[key] = !itemOpen[key]; b.setAttribute('aria-expanded', String(!!itemOpen[key])); x.hidden = !itemOpen[key]; });
      row.appendChild(b);
    } else row.appendChild(h('span', { class: 'it-t', text: i.title }));
    if (i.url) row.appendChild(h('a', { class: 'lk', href: i.url, target: '_blank', rel: 'noopener', 'aria-label': 'Open ' + i.title, title: 'Open the document', text: '↗' }));
    li.appendChild(row); if (x) li.appendChild(x);
    return li;
  }
  var GROUPS = [['needs', 'Needs input'], ['open', 'Open'], ['shipped', 'Shipped · last 7 days']];
  function projectRow(a, p, expandDefault) {
    var key = a.id + ':' + p.id, open = prjOpen[key] !== undefined ? prjOpen[key] : expandDefault, pid = 'prj-' + a.id + '-' + p.id;
    var wrap = h('div', { class: 'prj' + (open ? ' open' : ''), 'data-project': p.id });
    var chips = h('span', { class: 'chips' }); Proj.chips(p.counts).forEach(function (c) { chips.appendChild(h('span', { class: 'chip' + (/needs/.test(c) ? ' n' : ''), text: c })); });
    var b = h('button', { class: 'prj-h', type: 'button', 'aria-expanded': String(open), 'aria-controls': pid }, h('span', { class: 'car', 'aria-hidden': 'true' }), h('span', { class: 'pt', text: p.title }), chips, h('span', { class: 'ps', text: p.status }));
    var r = h('div', { class: 'prj-r' }, b);
    if (p.url) r.appendChild(h('a', { class: 'lk', href: p.url, target: '_blank', rel: 'noopener', 'aria-label': 'Open the ' + p.title + ' plan', title: 'Open the plan', text: '↗' }));
    var body = h('div', { class: 'prj-b', id: pid }); body.hidden = !open;
    GROUPS.forEach(function (g) {
      var xs = p.items.filter(function (i) { return i.state === g[0]; }); if (!xs.length) return;
      var gk = key + ':' + g[0], ul = h('ul', { class: 'its' });
      xs.forEach(function (i, n) { var li = itemLi(i, key + ':' + (i.ticket || i.title)); if (n >= ITEM_CAP && !moreOpen[gk]) li.hidden = true; ul.appendChild(li); });
      body.appendChild(h('h4', { class: 'gh', text: g[1] + ' · ' + xs.length })); body.appendChild(ul);
      if (xs.length > ITEM_CAP && !moreOpen[gk]) { var mo = h('button', { class: 'more', type: 'button', text: '+' + (xs.length - ITEM_CAP) + ' more' }); mo.addEventListener('click', function () { moreOpen[gk] = true; [].forEach.call(ul.children, function (li) { li.hidden = false; }); mo.remove(); }); body.appendChild(mo); }
    });
    if (!p.items.length) body.appendChild(h('p', { class: 'small', text: 'Nothing open or shipped this week.' }));
    b.addEventListener('click', function () { var o = b.getAttribute('aria-expanded') !== 'true'; prjOpen[key] = o; b.setAttribute('aria-expanded', String(o)); body.hidden = !o; wrap.classList.toggle('open', o); });
    wrap.appendChild(r); wrap.appendChild(body);
    return wrap;
  }

  function deskSheet(p, a) {
    var e = effective(a), hide = hidden(a);
    p.appendChild(head(a.name, hide ? 'idle' : e.light, Proj.cutWords(a.role || '', 6) + ' · ' + (hide ? 'Hidden' : stateChip(e.light, e))));
    var su0 = !hide && sessionUrl(a.id); if (su0) { var hd0 = p.lastChild, sb0 = hd0.querySelector('.stand'); hd0.insertBefore(toolLink({ id: 'session-' + a.id, name: 'Session ↗', url: su0 }, 'stand sess'), sb0); }
    var body = h('div', { class: 'panel-b one desk' }); p.appendChild(body);
    if (hide) { body.appendChild(h('section', null, h('p', { class: 'small', text: 'Hidden in Screen share mode.' }))); return; }
    // 2. NEEDS YOUR INPUT: open by default, gone when empty
    var needs = agentNeeds(a.id);
    if (needs.length) { var ns = h('section', { class: 'needs' }, h('h3', { text: 'Needs your input · ' + needs.length })); needs.forEach(function (i) { ns.appendChild(needRow(i, false)); }); body.appendChild(ns); }
    var clip = clipSection(a); if (clip) body.appendChild(clip);
    var hl = handledLines(a); if (hl.length) { var hs = h('section', { class: 'handled-s' }); hl.forEach(function (x) { hs.appendChild(x); }); body.appendChild(hs); }
    // 3. PROJECTS: collapsed, except the first with something needing input
    var ap = agentProjects(a), firstNeeds = ap.projects.filter(function (x) { return x.counts.needs > 0; })[0];
    if (ap.projects.length) {
      var ps = h(clip ? 'details' : 'section', { class: 'projects' }, h(clip ? 'summary' : 'h3', { text: (clip ? 'Tickets and shipped work · ' : 'Projects · ') + ap.projects.length }));
      ap.projects.forEach(function (x) { ps.appendChild(projectRow(a, x, !clip && x === firstNeeds)); });
      body.appendChild(ps);
    }
    // 4. other open work: open tickets that belong to no project
    if (ap.loose.length) {
      var os = h('section', { class: 'other' }, h('h3', { text: 'Other open work · ' + ap.loose.length })), ul = h('ul', { class: 'its' });
      ap.loose.forEach(function (x) { var it = Proj.ticketItem(x); it.url = it.link ? linkUrl(it.link) : ''; var li = itemLi(it, a.id + ':o:' + x.id); li.querySelector('.it-r').appendChild(h('span', { class: 'st', text: FEED_WORD[x.status] || x.status })); ul.appendChild(li); });
      os.appendChild(ul); body.appendChild(os);
    }
    if (!needs.length && !ap.projects.length && !ap.loose.length) body.appendChild(h('section', null, h('p', { class: 'small', text: 'Nothing open at this desk.' })));
    // 5. Hand a ticket, behind a button
    var foot = h('section', { class: 'desk-foot' }), row = h('div', { class: 'keys' });
    var ht = h('button', { class: 'key', type: 'button', 'aria-expanded': String(!!S.formOpen), text: S.formOpen ? 'Close ticket form' : 'Hand a ticket' });
    ht.addEventListener('click', function () { S.formOpen = !S.formOpen; S.flash = ''; renderSheet(); });
    row.appendChild(ht);
    if (a.id === 'dean' && !S.share) { var rb = h('button', { class: 'key', type: 'button', text: 'Team pulse · Recruiting bench' }); rb.addEventListener('click', function () { openSheet('bench', 'recruiting', rb); }); row.appendChild(rb); }   // Kev, 30 Oct: the pulse detail lives in recruiting, for Dean and him
    if (S.assets) { var pb = h('button', { class: 'key', type: 'button', text: 'Upload a file' }); pb.disabled = !S.canWrite; pb.addEventListener('click', function () { pickPhoto(a.id); }); row.appendChild(pb); }
    foot.appendChild(row);
    if (S.formOpen) foot.appendChild(ticketForm(a.id, false));
    else if (S.flash) foot.appendChild(h('p', { class: 'small', text: S.flash }));
    var tl = toolsFor(['org-chart'].concat((AGENT_TOOLS[a.id] || []).filter(function (id) { return id !== 'eden-desk' && id !== 'hub'; })));
    if (tl.length) { var gl = h('div', { class: 'golinks' }); tl.forEach(function (x) { gl.appendChild(toolLink(Object.assign({}, x, { name: x.id === 'org-chart' ? 'Go to the org chart' : 'Open ' + x.name }), 'golink')); }); foot.appendChild(h('details', { class: 'tools-d' }, h('summary', { text: 'Tools' }), gl)); }
    body.appendChild(foot);
    var cw = h('div', { class: 'panel-b one' }); cw.appendChild(chatSection(a)); p.appendChild(cw);
  }
  /* ---------- the board's breakdowns (Kev, 27 Oct): click a count, see the tickets behind it; a FAIL gets an autopsy ---------- */
  var RUNNER_MINUTE = 43;   // Radar's ticket runner fires at :43 every hour (routine "Radar · Office ticket runner")
  function nextRunnerPass(ms) { var d = new Date(ms); d.setSeconds(0, 0); var m = d.getMinutes(); d.setMinutes(m <= RUNNER_MINUTE ? RUNNER_MINUTE : 60 + RUNNER_MINUTE); return d.getTime(); }
  function autopsy(x, now) {
    var c = t(x.createdAt), dl = Game.failDeadline(x), pk = Game.pickupAt(x), first = nextRunnerPass(c);
    var steps = [
      'Filed ' + dateLabel(Game.pacificDate(c)) + ' ' + clockLabel(c) + ' by ' + fromOf(x).who + ' to ' + nameOf(x.agent) + '.',
      'Clock ran out ' + clockLabel(dl) + ': 60 minutes on the runner clock (6am to 10pm PT, Sunday to Friday).',
      'First runner pass after filing: ' + clockLabel(first) + '.',
      pk != null ? 'Picked up ' + clockLabel(pk) + ', ' + Game.fmtWait(Game.runnerMinutes(dl, pk)) + ' after the line.' : 'Still not picked up: ' + Game.fmtWait(Game.runnerMinutes(dl, now)) + ' past the line.'
    ];
    var cause;
    var passes = now >= first ? Math.floor((now - first) / HOUR) + 1 : 0;
    if (pk == null) cause = 'Never picked up. ' + (passes ? 'The hourly runner has passed it ' + passes + (passes === 1 ? ' time' : ' times') + ' without taking it: check the runner log and the agent’s desk.' : 'The runner has not reached it yet.');
    else if (pk <= first + 20 * MIN) cause = 'Picked up on the first runner pass, but that pass came after the 60-minute line. The runner is hourly, so a ticket filed soon after :' + RUNNER_MINUTE + ' can only make it if the pass is quick. System cause, not the agent.';
    else if (pk <= first + HOUR + 20 * MIN) cause = 'Missed the first runner pass at ' + clockLabel(first) + ' and was taken on the next one. Look at the ' + clockLabel(first) + ' run: it skipped this ticket.';
    else cause = 'Missed ' + Math.floor((pk - first) / HOUR) + ' runner passes. The runner was down or skipping this desk: check the runner log for those hours.';
    var box = h('div', { class: 'autopsy' });
    box.appendChild(h('h3', { text: nameOf(x.agent) + ' · ' + Game.clip(x.ask || '', 90) }));
    var ol = h('ol'); steps.forEach(function (st) { ol.appendChild(h('li', { text: st })); }); box.appendChild(ol);
    box.appendChild(h('p', { class: 'cause', text: 'Cause: ' + cause }));
    box.appendChild(h('p', { class: 'small', text: 'Now: ' + (FEED_WORD[x.status] || x.status) + (x.result && x.result.summary ? ' · ' + Game.clip(x.result.summary, 140) : '') }));
    var acts = h('div', { class: 'acts' });
    acts.appendChild(h('button', { class: 'mini', 'data-id': x.agent, text: 'Open ' + nameOf(x.agent) + '’s desk' }));
    var ak = h('button', { class: 'mini primary', 'data-autopsy': x.id, text: 'Ask Radar for the fix' }); ak.disabled = !S.canWrite; acts.appendChild(ak);
    box.appendChild(acts);
    return box;
  }
  function askAutopsy(id) {
    var x = S.tickets[id]; if (!x) return;
    makeTicket({ agent: 'radar', priority: 'today', lever: 'board', ask: 'Autopsy the FAIL on ticket ' + id + ' (' + nameOf(x.agent) + ': ' + Game.clip(x.ask || '', 80) + '). Why was it picked up late, and what change stops it happening again? Report the cause and the fix.' });
    S.flash = 'Sent to Radar: autopsy on that FAIL.'; S.forceSheet = true; renderAll();
  }
  function boardSheet(p, key) {
    var now = Date.now(), today = Game.pacificDate(now), ws = Game.weekStart(today);
    var all = vals(S.tickets).filter(function (x) { return !ticketHidden(x); });
    var TITLES = { points: 'Points today', closed: 'Closed today', open: 'Open now', fails: 'FAILs', pickup: 'Pickups this week' };
    p.appendChild(head(TITLES[key] || 'The board', null, 'What is behind the number', S.flash || null));
    var body = h('div', { class: 'panel-b one' }); p.appendChild(body); var sec = h('section'); body.appendChild(sec);
    function table(rows, cols) {
      if (!rows.length) { sec.appendChild(h('p', { class: 'small', text: 'Nothing here.' })); return; }
      var tb = h('table'), hr = h('tr'); cols.forEach(function (c) { hr.appendChild(h('th', { text: c[0] })); }); tb.appendChild(hr);
      rows.forEach(function (x) { var tr = h('tr'); cols.forEach(function (c) { tr.appendChild(h('td', { text: String(c[1](x)) })); }); tb.appendChild(tr); });
      sec.appendChild(h('div', { class: 'scroll' }, tb));
    }
    if (key === 'fails') {
      var failed = all.map(function (x) { return { x: x, f: Game.failedAt(x, now) }; }).filter(function (o) { return o.f != null && Game.pacificDate(o.f) >= ws; })
        .sort(function (a, b) { return b.f - a.f; });
      var tdy = failed.filter(function (o) { return Game.pacificDate(o.f) === today; }), wk = failed.filter(function (o) { return Game.pacificDate(o.f) !== today; });
      sec.appendChild(h('h3', { text: 'Today · ' + tdy.length }));
      if (!tdy.length) sec.appendChild(h('p', { class: 'small', text: 'No FAIL today.' }));
      tdy.forEach(function (o) { sec.appendChild(autopsy(o.x, now)); });
      sec.appendChild(h('h3', { text: 'Earlier this week · ' + wk.length }));
      wk.forEach(function (o) { sec.appendChild(autopsy(o.x, now)); });
      sec.appendChild(h('p', { class: 'small', text: 'A FAIL is a ticket not picked up within 60 runner minutes of being filed. It stays a FAIL whatever happens after; it costs 3 points and breaks the streak.' }));
    } else if (key === 'closed' || key === 'points') {
      var done = all.filter(function (x) { var sc = Game.ticketScore(x); return sc && sc.date === today; });
      sec.appendChild(h('h3', { text: 'Closed today · ' + done.length }));
      table(done, [['Desk', function (x) { return nameOf(x.agent); }], ['Ticket', function (x) { return Game.clip(x.ask || '', 70); }], ['Points', function (x) { var sc = Game.ticketScore(x); return sc.points + ' (' + sc.base + (sc.onClock ? ' +1 on time' : '') + (sc.sameDay ? ' +2 same day' : '') + ')'; }]]);
      if (key === 'points') {
        var ft = all.filter(function (x) { var f = Game.failedAt(x, now); return f != null && Game.pacificDate(f) === today; });
        sec.appendChild(h('h3', { text: 'FAILs today · −3 each · ' + ft.length }));
        table(ft, [['Desk', function (x) { return nameOf(x.agent); }], ['Ticket', function (x) { return Game.clip(x.ask || '', 70); }]]);
        var kv = vals(S.actions).filter(function (a) { return a && /^(done|followup|approve)$/.test(a.action) && a.at && Game.pacificDate(t(a.at)) === today; });
        sec.appendChild(h('h3', { text: 'Your moves today · +2 each · ' + kv.length }));
        table(kv, [['Move', function (a) { return a.action; }], ['On', function (a) { return Game.clip(a.title || '', 80); }], ['At', function (a) { return clockLabel(t(a.at)); }]]);
      }
    } else if (key === 'open') {
      var open = all.filter(function (x) { return Game.OPEN_STATUSES.indexOf(x.status) >= 0 && !kevClosed(x); }).sort(function (a, b) { return t(a.createdAt) - t(b.createdAt); });
      table(open, [['Desk', function (x) { return nameOf(x.agent); }], ['Ticket', function (x) { return Game.clip(x.ask || '', 70); }], ['Status', function (x) { return FEED_WORD[x.status] || x.status; }], ['Waiting', function (x) { return Game.fmtWait(Game.runnerMinutes(t(x.createdAt), now)); }]]);
      sec.appendChild(h('button', { class: 'mini', 'data-go': '#line', text: 'Go to the open line' }));
    } else if (key === 'pickup') {
      var pk = all.map(function (x) { var q = Game.pickupAt(x); return q != null && Game.pacificDate(q) >= ws ? { x: x, m: Game.runnerMinutes(t(x.createdAt), q) } : null; }).filter(Boolean).sort(function (a, b) { return b.m - a.m; });
      table(pk, [['Desk', function (o) { return nameOf(o.x.agent); }], ['Ticket', function (o) { return Game.clip(o.x.ask || '', 70); }], ['Pickup', function (o) { return Game.fmtWait(o.m) + (o.m > Game.SLA_PICKUP_MIN ? ' · FAIL' : ''); }]]);
    }
  }
  function benchSheet(p, def) {
    if (def.id === 'recruiting' && Game.isSabbathAt(Date.now())) { plRest(p, def.title); return; }   // rests on the Sabbath like the Floor (Kev's standing rule)
    var doc = S.benches[def.id] || {};
    p.appendChild(head(def.title, null, 'Desk: ' + def.owner + (doc.example ? ' · example figures' : ''), doc.asOf ? 'As of ' + doc.asOf.slice(0, 10) : 'Not synced'));
    var body = h('div', { class: 'panel-b one' }); p.appendChild(body);
    var sec = h('section'); body.appendChild(sec);
    var tiles = doc.tiles || [];
    if (!tiles.length && def.id !== 'projects') sec.appendChild(h('p', { class: 'small', text: 'No figures synced to this bench yet. ' + (doc.source ? '' : 'Its owner writes them through Radar.') }));
    else {
      var tb = h('table'); tb.appendChild(h('tr', null, h('th', { text: 'Figure' }), h('th', { text: 'Value' }), h('th', { text: 'Source' }), h('th', { text: 'Check' })));
      tiles.forEach(function (x) { tb.appendChild(h('tr', null, h('td', { text: x.label }), h('td', { text: String(x.value) + (x.unit ? ' ' + x.unit : '') }), h('td', { text: (x.source || doc.source || '') + (x.asOf ? ' · ' + String(x.asOf).slice(0, 10) : '') }), h('td', { text: x.gate ? 'gate ' + x.gate : (x.needsGate ? 'not checked' : '') }))); });
      sec.appendChild(h('div', { class: 'scroll' }, tb));
    }
    var rows = S.benchRows[def.id] || [];
    if (rows.length) {
      sec.appendChild(h('h3', { text: 'Detail' }));
      var rt = h('table');
      rows.slice(0, 20).forEach(function (r) { var bits = Object.keys(r).filter(function (k) { return ['id', 'updated', 'section'].indexOf(k) < 0 && /^(string|number|boolean)$/.test(typeof r[k]); }).slice(0, 5).map(function (k) { return k + ': ' + r[k]; }); rt.appendChild(h('tr', null, h('td', { text: r.name || r.section || r.id }), h('td', { text: bits.join(' · ') }))); });
      sec.appendChild(h('div', { class: 'scroll' }, rt));
    }
    var tl = h('div', { class: 'tools' }); toolsFor(BENCH_TOOLS[def.id]).forEach(function (x) { tl.appendChild(toolLink(x, '')); }); sec.appendChild(tl);
    if (def.id === 'projects') projectList(sec);
    if (def.id === 'recruiting' && !S.share) { var PD = plData(); sec.appendChild(h('h3', { class: 'gap', text: 'Team pulse · dials and RPs by day' })); if (PD) { var pb = h('div', { class: 'pl-body pl-in-sheet' }); plTable(pb, PD); sec.appendChild(pb); sec.appendChild(h('h3', { class: 'gap', text: 'Funnel ratios · this week against the last four' })); var rb2 = h('div', { class: 'pl-body pl-in-sheet pl-ratios' }); plRatios(rb2, PD); sec.appendChild(rb2); } else sec.appendChild(h('p', { class: 'small', text: 'Waiting for the office run to write the Crelate counts (meta/crelate).' })); }   // Kev, 30 Oct: the detail lives here, for Kev and Dean
    sec.appendChild(h('p', { class: 'small', text: def.id === 'projects' ? 'Deliverables from the Eden Staffing working doc (21 Oct). "Hand to PM" makes a ticket; the PM chases it down and reports up through Radar. Status lives in the doc until the PM syncs it here.' : 'Each figure carries its source and date. Finance figures show a gate id only when the numbers gate passed; otherwise "not checked".' }));
  }

  /* Special projects: the Eden Staffing deliverables, from the working doc. The PM chases them; each one can become a ticket. */
  var PROJECT_ITEMS = [
    ['Next 30 days', [
      'Get two EOR and two BaaS quotes on identical assumptions (our trades, FL/ID/OR, 25 workers) and replace the assumed fees in the unit economics',
      'Engage a staffing-specialist insurance broker and an employment attorney: entity, client agreement, worker arbitration agreement, FCRA forms',
      'Rewrite the commission plan on true gross profit and pressure-test it with two recruiters'] ],
    ['Before launch', [
      'Form Eden Staffing LLC as a stand-alone EPG subsidiary with its own bank accounts, contracts and insurance',
      'Set the pricing floor on true gross profit (25%+; 20 to 25% needs the desk lead; under 20% the CEO)',
      'Win EOR and insurance terms before signing: Eden-specific loss runs, GC-ready certificates, exit without conversion fees',
      'Draft the staffing services agreement and the vetting checklist for the EOR provider (class codes, FL/ID/OR registration, tax deposits)'] ],
    ['Before investors', [
      'Add a downside case and state break-even in gross-profit dollars',
      'Show the cash trough and size the ask',
      'Work the fix list: BD example, delete placeholders, relabel profit as operating profit before EPG overhead and tax'] ],
    ['Open questions for Kev and Nick', [
      'Florida demand: how many workers, which trades, what pay, start dates, signed or not',
      'Who runs Eden Staffing day to day',
      'Was anyone promised 40% of spread'] ]
  ];
  function projectList(sec) {
    var open = Object.keys(S.tickets).map(function (k) { return S.tickets[k]; }).filter(function (x) { return x.agent === 'pm' && x.status !== 'done'; });
    PROJECT_ITEMS.forEach(function (g) {
      sec.appendChild(h('h3', { class: 'gap', text: g[0] }));
      g[1].forEach(function (ask) {
        var tk = open.filter(function (x) { return x.ask === ask; })[0];
        var b = h('button', { class: 'mini', text: tk ? 'With the PM · ' + tk.status : 'Hand to PM' }); b.disabled = !!tk || !S.canWrite;
        b.addEventListener('click', function () { makeTicket({ agent: 'pm', ask: ask, priority: 'today', lever: 'projects', project: 'eden-staffing' }); S.forceSheet = true; renderSheet(); });
        sec.appendChild(h('div', { class: 'item' }, h('span', { class: 'role', text: '·' }), h('span', { class: 't', text: ask }), h('span', { class: 'sacts', style: 'padding:0;grid-column:2;justify-content:flex-start' }, b)));
      });
    });
  }
  /* until Radar posts agents/pm, the desk stands empty but real: tickets queue for it and Radar sees them */
  function ensurePm() { if (!S.agents.pm) S.agents.pm = { id: 'pm', name: 'Pam', desk: 'projects', role: 'Special projects PM', task: 'Desk not staffed yet: Radar stands it up', counts: {}, lastHeard: null, openTickets: Object.keys(S.tickets).filter(function (k) { return S.tickets[k].agent === 'pm' && S.tickets[k].status !== 'done'; }).length, placeholder: true }; }
  function visibleAgents() { return Object.keys(S.agents).map(function (k) { return S.agents[k]; }).filter(function (a) { return !hidden(a); }); }
  var LEVERS = {
    wip: { title: 'WIP report', build: function (sec) {
      sec.appendChild(h('p', { class: 'small', text: 'Built from the Office database now (' + (S.meta ? 'repo synced ' + ago(S.meta.syncedAt) : 'example data') + '). For ledger rows and the Day Board, ask Radar for the full version.' }));
      var tb = h('table'); tb.appendChild(h('tr', null, h('th', { text: 'Desk' }), h('th', { text: 'Light' }), h('th', { text: 'On it' }), h('th', { text: 'QC' }), h('th', { text: 'Tickets' }), h('th', { text: 'Heard' }))); var lines = [];
      visibleAgents().forEach(function (a) {
        var e = effective(a);
        tb.appendChild(h('tr', null, h('td', { text: a.name }), h('td', null, h('span', { text: stateChip(e.light, e) })), h('td', { text: a.task || '' }), h('td', { text: String(a.pendingQc || 0) }), h('td', { text: String(a.openTickets || 0) }), h('td', { text: short(heardAt(a)) })));
        lines.push(a.name + ': ' + stateChip(e.light, e) + (a.task ? ' · ' + a.task : '') + ' · QC ' + (a.pendingQc || 0) + ' · tickets ' + (a.openTickets || 0) + ' · heard ' + short(heardAt(a)));
      });
      sec.appendChild(h('div', { class: 'scroll' }, tb));
      var row = h('div', { class: 'keys' });
      var copy = h('button', { class: 'key', text: 'Copy as text' });
      copy.addEventListener('click', function () { var txt = 'WIP ' + new Date().toISOString().slice(0, 16) + '\n' + lines.join('\n'); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { copy.textContent = 'Copied'; }, function () { copy.textContent = 'Copy blocked here'; }); });
      var full = h('button', { class: 'key', text: 'Ask Radar for the full WIP' }); full.disabled = !S.canWrite;
      full.addEventListener('click', function () { makeTicket({ agent: 'radar', ask: 'Run the full WIP report: ledger by lane, QC, gates, routines, Day Board.', priority: 'today', lever: 'wip' }); full.textContent = 'Ticket created'; full.disabled = true; });
      row.appendChild(copy); row.appendChild(full); sec.appendChild(row);
    } },
    status: { title: 'Status from everyone', build: function (sec) {
      var quiet = [], tb = h('table'); tb.appendChild(h('tr', null, h('th', { text: 'Desk' }), h('th', { text: 'Status' }), h('th', { text: 'Heard' })));
      visibleAgents().forEach(function (a) { var e = effective(a), old = Date.now() - t(heardAt(a)) > DAY; if (old) quiet.push(a); tb.appendChild(h('tr', null, h('td', { text: a.name }), h('td', { text: a.statusLine || a.task || WORD[e.light] }), h('td', { text: ago(heardAt(a)) + (old ? ' (over a day)' : '') }))); });
      sec.appendChild(h('p', { class: 'small', text: 'Instant: each desk\'s last posted status. Live roll call: one ticket per desk quiet over a day; each agent answers in three lines (on it, done, blocked on you).' }));
      sec.appendChild(h('div', { class: 'scroll' }, tb));
      var go = h('button', { class: 'key', text: quiet.length ? 'Ask the ' + quiet.length + ' quiet desk' + (quiet.length > 1 ? 's' : '') + ' for status' : 'Everyone has been heard from today' }); go.disabled = !quiet.length || !S.canWrite;
      go.addEventListener('click', function () { quiet.forEach(function (a) { makeTicket({ agent: a.id, ask: 'Status in three lines: working on, done since last status, blocked on Kev. Names and roles only.', priority: 'today', lever: 'status' }); }); go.textContent = quiet.length + ' tickets created'; go.disabled = true; });
      sec.appendChild(go);
    } },
    ticket: { title: 'Hand a ticket', build: function (sec) {
      sec.appendChild(h('p', { class: 'small', text: 'You stay accountable; the agent is your delegate. Anything it would send, spend or publish waits in QC for your yes, with the exact action shown. A ticket is never approval.' }));
      sec.appendChild(ticketForm(S.sheet.agent || null, true));
    } },
    unused: { title: "What did we ship that we're not using", build: function (sec) {
      var rows = [], tm = toolMap();
      Object.keys(tm).forEach(function (k) {
        var x = tm[k], every = x.expectedEveryDays || 14, clicked = S.seen['open-' + x.id], used = clicked && clicked.at ? clicked.at : null, act = x.lastActivity || null;
        var last = [used, act].filter(Boolean).sort().pop() || null, why = null;
        if (x.noTrigger) why = 'Built but never switched on: no trigger exists';
        else if (x.waitingOnKev) why = 'Waiting on your yes';
        else if (last && Date.now() - t(last) > 2 * every * DAY) why = 'Quiet for ' + Math.floor((Date.now() - t(last)) / DAY) + ' days (expected every ' + every + ')';
        else if (!last) why = 'No use recorded yet';
        if (why) rows.push({ x: x, why: why, evidence: last ? (last === used ? 'Office opens' : 'activity') : 'none' });
      });
      sec.appendChild(h('p', { class: 'small', text: 'Evidence is what the Office saw you open, plus activity Radar supplied. "No use recorded" means no evidence either way, not proof of no use. The list gets truer each week.' }));
      if (!rows.length) { sec.appendChild(h('p', { text: 'Everything shipped shows recent use.' })); return; }
      var tb = h('table'); tb.appendChild(h('tr', null, h('th', { text: 'Tool' }), h('th', { text: 'Why it is listed' }), h('th', { text: 'Evidence' }), h('th', { text: '' })));
      rows.forEach(function (r) {
        var b = h('button', { class: 'mini', text: 'Adopt or retire?' }); b.disabled = !S.canWrite;
        b.addEventListener('click', function () { makeTicket({ agent: r.x.owner || 'radar', ask: 'Adopt or retire "' + r.x.name + '": ' + r.why + '. Recommend one, with what it costs to keep.', priority: 'whenever', lever: 'unused' }); b.textContent = 'Ticket created'; b.disabled = true; });
        tb.appendChild(h('tr', null, h('td', { text: r.x.name }), h('td', { text: r.why }), h('td', { text: r.evidence }), h('td', null, b)));
      });
      sec.appendChild(h('div', { class: 'scroll' }, tb));
    } }
  };
  /* ---------- photos: snap or pick, shrink to a JPEG, upload to the Office's asset store, hand it to an agent as a ticket ---------- */
  function pickPhoto(agentId) { S.photoAgent = agentId || 'radar'; var inp = $('#photo-in'); inp.value = ''; inp.click(); }
  function toJpeg(file) {
    return new Promise(function (res, rej) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var max = 2000, k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('encode')); }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error('decode')); };
      img.src = u;
    });
  }
  /* Uploads: photos (shrunk to JPEG), PDFs, CSVs, text; spreadsheets become one CSV per sheet (the asset store takes no .xlsx). */
  var TYPES = { pdf: 'application/pdf', csv: 'text/csv', txt: 'text/plain', md: 'text/markdown', json: 'application/json' };
  function ext(n) { var m = /\.([a-z0-9]+)$/i.exec(n || ''); return m ? m[1].toLowerCase() : ''; }
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise(function (res, rej) { var sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; sc.onload = function () { res(window.XLSX); }; sc.onerror = rej; document.head.appendChild(sc); });
  }
  function prepare(file) {          // resolves [{blob, type, name}]
    var e = ext(file.name);
    if (/^image\//.test(file.type) || /^(jpe?g|png|heic|heif|gif|webp)$/.test(e)) return toJpeg(file).then(function (b) { return [{ blob: b, type: 'image/jpeg', name: file.name.replace(/\.[^.]+$/, '') + '.jpg' }]; }, function () { return [{ blob: file, type: file.type || 'image/jpeg', name: file.name }]; });
    if (e === 'xlsx' || e === 'xls') return file.arrayBuffer().then(function (buf) { return loadXlsx().then(function (X) {
      var wb = X.read(buf, { type: 'array' });
      return wb.SheetNames.map(function (sn) { return { blob: new Blob([X.utils.sheet_to_csv(wb.Sheets[sn])], { type: 'text/csv' }), type: 'text/csv', name: file.name.replace(/\.[^.]+$/, '') + (wb.SheetNames.length > 1 ? ' - ' + sn : '') + '.csv' }; });
    }); });
    var ty = TYPES[e] || file.type; if (!ty) return Promise.reject({ code: 'unsupported_type' });
    return Promise.resolve([{ blob: file, type: ty, name: file.name }]);
  }
  function kb(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
