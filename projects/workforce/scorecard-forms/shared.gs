/**
 * Eden Friday Scorecard · shared helpers for recruiter-form.gs and leadership-form.gs
 * Owner: Dean (workforce). Engineering review: Q. Built 5 Nov 2026 for Kev. Nothing is sent or shared by any function here.
 *
 * All three files go in ONE Apps Script project (see README.md). Both forms write to one Sheet,
 * "Eden · Friday Scorecard responses", one tab per form, owned by Kev and shared with no one.
 *
 * The scored week runs Friday through Thursday. The form opens Thursday at noon Pacific and
 * answers can be edited until Friday 10:30am Pacific, then editing turns off.
 */
var EDEN_TZ = 'America/Los_Angeles';
var RECRUITERS = ['Max', 'Evan', 'Noah', 'Andrew', 'Bridger'];
var PILLARS = ['01 Righteousness', '02 Winning', '03 Accountability', '04 Discipline', '05 Transparency', '06 Growth', '07 Execution'];

/**
 * The Thursday that ends the week being scored: the day before the coming (or current) Friday.
 * Calendar maths is done in UTC on the Pacific calendar date, so it does not depend on the
 * script's own time zone setting. start/end are UTC-midnight Dates; format them with 'GMT'.
 */
function scoredWeek_(now) {
  now = now || new Date();
  var DAY = 24 * 60 * 60 * 1000;
  var p = Utilities.formatDate(now, EDEN_TZ, 'yyyy-MM-dd').split('-');
  var today = Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  var friday = today + ((5 - new Date(today).getUTCDay() + 7) % 7) * DAY;
  var end = new Date(friday - DAY);
  var start = new Date(friday - 7 * DAY);
  return {
    start: start, end: end,
    endLabel: Utilities.formatDate(end, 'GMT', 'EEE d MMM yyyy'),
    window: Utilities.formatDate(start, 'GMT', 'EEE d MMM') + ' to ' + Utilities.formatDate(end, 'GMT', 'EEE d MMM')
  };
}

function formTitle_(leadership) {
  return 'Eden Friday Scorecard' + (leadership ? ' · Leadership' : '') + ', week ending ' + scoredWeek_().endLabel;
}

/** Settings both forms share: Eden sign-in only, one response each, email collected, editable until the lock. */
function applySettings_(form) {
  try {
    form.setRequireLogin(true);          // edenexec.com accounts only (Workspace feature)
  } catch (e) {
    Logger.log('WARNING: setRequireLogin failed (' + e.message + '). Turn on "Restrict to users in your organization" in the Form settings by hand.');
  }
  form.setCollectEmail(true);            // recorded automatically from the sign-in
  try {
    form.setLimitOneResponsePerUser(true);
  } catch (e) {
    Logger.log('WARNING: setLimitOneResponsePerUser failed (' + e.message + '). Turn on "Limit to 1 response" in the Form settings by hand.');
  }
  form.setAllowResponseEdits(true);
  form.setProgressBar(true);
  form.setShowLinkToRespondAgain(false);
  form.setPublishingSummary(false);
  form.setConfirmationMessage('Thanks. You can edit your answers until 10:30am Pacific. See you at the Scorecard Review.');
}

/** The responses Sheet, created once and remembered in script properties. */
function responsesSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.create('Eden · Friday Scorecard responses');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

/** True if this sheet tab is the response tab of the given form. */
function sheetIsFormTab_(sh, form) {
  var linked;
  try { linked = sh.getFormUrl(); } catch (e) { return false; }
  if (!linked) return false;
  try { return FormApp.openByUrl(linked).getId() === form.getId(); } catch (e) { return false; }
}

/**
 * Point a form at the shared Sheet and name its response tab.
 * The response tab can take a moment to appear, so look for it a few times; if it never matches by
 * form URL, fall back to the newest unclaimed "Form Responses" tab; if nothing is found, carry on
 * (the form still saves answers to the Sheet) and log a warning rather than failing the build.
 */
function linkToSheet_(form, tabName) {
  var id = responsesSheet_().getId();
  form.setDestination(FormApp.DestinationType.SPREADSHEET, id);
  var ss, tab = null;
  for (var attempt = 0; attempt < 6 && !tab; attempt++) {
    SpreadsheetApp.flush();
    ss = SpreadsheetApp.openById(id); // re-open so the new response tab is visible
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length && !tab; i++) if (sheetIsFormTab_(sheets[i], form)) tab = sheets[i];
    if (!tab) {
      var guess = sheets.filter(function (sh) { return /^Form Responses/i.test(sh.getName()); });
      if (attempt >= 3 && guess.length) tab = guess[guess.length - 1];
    }
    if (!tab) Utilities.sleep(1500);
  }
  if (tab) {
    var name = tabName, n = 2, clash = ss.getSheetByName(name);
    while (clash && clash.getSheetId() !== tab.getSheetId()) { name = tabName + ' ' + n++; clash = ss.getSheetByName(name); }
    tab.setName(name);
    // Drop the blank starter tab ("Sheet1" in English; any name in other locales). Only after the response tab is confirmed.
    ss.getSheets().forEach(function (sh) {
      if (ss.getSheets().length > 1 && sh.getSheetId() !== tab.getSheetId() && !sh.getFormUrl() &&
          sh.getLastRow() === 0 && sh.getLastColumn() === 0 && ['Prefill', 'Recruiters', 'Leadership'].indexOf(sh.getName()) < 0 &&
          /^(Sheet|Hoja|Feuille|Tabelle|Foglio)\s*\d*$/i.test(sh.getName())) ss.deleteSheet(sh);
    });
  } else {
    Logger.log('WARNING: could not find the response tab for "' + tabName + '". Answers still save to the Sheet; rename its "Form Responses" tab by hand.');
  }
  return ss;
}

function numberItem_(form, title, help, max) {
  var v = FormApp.createTextValidation().setHelpText(max ? 'A whole number from 0 to ' + max + '.' : 'A whole number, 0 or more.');
  v = max ? v.requireNumberBetween(0, max) : v.requireNumberGreaterThanOrEqualTo(0);
  var item = form.addTextItem().setTitle(title).setRequired(true).setValidation(v.build());
  if (help) item.setHelpText(help);
  return item;
}

function para_(form, title, required, help) {
  var i = form.addParagraphTextItem().setTitle(title).setRequired(!!required);
  if (help) i.setHelpText(help);
  return i;
}

function page_(form, title, help) {
  var p = form.addPageBreakItem().setTitle(title);
  if (help) p.setHelpText(help);
  return p;
}

/** Find a form by the id stored when it was built. */
function storedForm_(key) {
  var id = PropertiesService.getScriptProperties().getProperty(key);
  if (!id) throw new Error('No ' + key + ' yet. Run buildRecruiterForm and buildLeadershipForm first.');
  return FormApp.openById(id);
}

/**
 * Weekly reset, Thursday noon Pacific: new week's title and window, answers cleared from the
 * Form (the Sheet keeps every past week), responses and edits open again.
 */
function weeklyReset() {
  var w = scoredWeek_();
  [['RECRUITER_FORM_ID', false], ['LEADERSHIP_FORM_ID', true]].forEach(function (f) {
    var form = storedForm_(f[0]);
    form.setTitle(formTitle_(f[1]));
    form.deleteAllResponses();
    form.setAcceptingResponses(true);
    form.setAllowResponseEdits(true);
    var intro = form.getItems(FormApp.ItemType.SECTION_HEADER)[0];
    if (intro) intro.asSectionHeaderItem().setHelpText(page0Note_(w));
  });
}

function page0Note_(w) {
  return 'Scored week: ' + w.window + ' (Friday through Thursday). The numbers are filled in from Crelate and CloudTalk; ' +
    'correct anything that looks off in 4.1.\nRevenue, commission and draw aren\'t shown yet.';
}

/** Friday 10:30am Pacific: editing turns off. Late first submissions are still accepted. */
function lockEdits() {
  ['RECRUITER_FORM_ID', 'LEADERSHIP_FORM_ID'].forEach(function (k) { storedForm_(k).setAllowResponseEdits(false); });
}

/**
 * Prefilled links. The agents fill the "Prefill" tab in the responses Sheet each Thursday afternoon:
 * column A Form ("recruiter" or "leadership"), B Name, C Email, then one column per page 0 field
 * with the header exactly as the question title, and a last column "Link". This writes a prefilled
 * link into "Link" for every row. It sends nothing: Kev sends the links on his go.
 */
function buildPrefillLinks() {
  var ss = responsesSheet_();
  var tab = ss.getSheetByName('Prefill');
  if (!tab) throw new Error('No Prefill tab yet. Run installScorecard first.');
  var values = tab.getDataRange().getValues();
  var head = values[0];
  var linkCol = head.indexOf('Link');
  if (linkCol < 0) throw new Error('The Prefill tab needs a column headed Link. Run installScorecard to rebuild the headers.');
  var forms = { recruiter: storedForm_('RECRUITER_FORM_ID'), leadership: storedForm_('LEADERSHIP_FORM_ID') };
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var form = forms[String(row[0]).toLowerCase()];
    if (!form) continue;
    var link, filled = 0;
    try { // one bad row must not stop the rest, or fail the Thursday trigger
      var resp = form.createResponse();
      form.getItems(FormApp.ItemType.TEXT).forEach(function (item) {
        var c = head.indexOf(item.getTitle());
        if (c < 0 || c === linkCol || row[c] === '' || row[c] === null) return;
        resp.withItemResponse(item.asTextItem().createResponse(String(row[c])));
        filled++;
      });
      if (!filled) continue; // no numbers yet: leave the row (and its Link) alone
      link = resp.toPrefilledUrl();
    } catch (e) {
      link = 'ERROR: ' + e.message;
    }
    if (row[linkCol] !== link) tab.getRange(r + 1, linkCol + 1).setValue(link); // idempotent: rewritten each run, written only if changed
  }
}

/** Creates the Prefill tab with the right headers. Safe to run twice. */
function preparePrefillTab_() {
  var ss = responsesSheet_();
  var tab = ss.getSheetByName('Prefill') || ss.insertSheet('Prefill');
  var titles = [];
  ['RECRUITER_FORM_ID', 'LEADERSHIP_FORM_ID'].forEach(function (k) {
    storedForm_(k).getItems(FormApp.ItemType.TEXT).forEach(function (i) {
      var t = i.getTitle();
      if (titles.indexOf(t) < 0 && PAGE0_FIELDS.indexOf(t) >= 0) titles.push(t);
    });
  });
  var head = ['Form', 'Name', 'Email'].concat(titles).concat(['Link']);
  tab.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  if (tab.getLastRow() < 2) {
    var rows = RECRUITERS.map(function (n) { return ['recruiter', n, ''].concat(titles.map(function () { return ''; })).concat(['']); });
    rows.push(['leadership', 'Kev', 'kev@edenexec.com'].concat(titles.map(function () { return ''; })).concat(['']));
    rows.push(['leadership', 'Nick', 'nick@edenexec.com'].concat(titles.map(function () { return ''; })).concat(['']));
    tab.getRange(2, 1, rows.length, head.length).setValues(rows);
  }
  tab.setFrozenRows(1);
}

/**
 * Run once after both forms are built: Prefill tab, plus the weekly triggers
 * (reset Thursday 12:00, prefilled links every hour, lock Friday 10:30am, all Pacific).
 */
function installScorecard() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (['weeklyReset', 'lockEdits', 'buildPrefillLinks'].indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('weeklyReset').timeBased().onWeekDay(ScriptApp.WeekDay.THURSDAY).atHour(12).nearMinute(0).inTimezone(EDEN_TZ).create();
  ScriptApp.newTrigger('buildPrefillLinks').timeBased().everyHours(1).create(); // hourly, any day: links appear within the hour a row gets numbers
  ScriptApp.newTrigger('lockEdits').timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(10).nearMinute(30).inTimezone(EDEN_TZ).create();
  preparePrefillTab_();
  var ss = responsesSheet_();
  Logger.log('Responses Sheet (Prefill tab included): ' + ss.getUrl());
}

/** Page 0 question titles, shared by the forms and the Prefill tab headers. */
var PAGE0_FIELDS = ['RPs', 'Days at 15 RPs', 'FTIs', 'MPs', 'PTCs', 'Resumes', 'Submittals', 'Dials out', 'Dials answered', 'Placements',
  'Team RPs', 'Team FTIs', 'Team MPs', 'Team PTCs', 'Team resumes', 'Team submittals', 'Team dials', 'Team placements'];
