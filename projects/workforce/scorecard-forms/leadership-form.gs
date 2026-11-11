/**
 * Eden Friday Scorecard · leadership form (Kev and Nick)
 * Spec: Kev's scorecard brief, approved 5 Nov 2026. Needs shared.gs in the same project. See README.md.
 * Run buildLeadershipForm once, after buildRecruiterForm. It creates an unshared Form; nothing is sent.
 */
function buildLeadershipForm() {
  var w = scoredWeek_();
  var form = FormApp.create(formTitle_(true));
  form.setDescription('Kev and Nick. Fill this in Friday 10:00 to 10:30am Pacific, before the Scorecard Review.');
  applySettings_(form);

  // Page 0 · team totals for Max, Evan, Noah, Andrew and Bridger (prefilled each Thursday)
  form.addSectionHeaderItem().setTitle('0 · Team numbers (Max, Evan, Noah, Andrew, Bridger)').setHelpText(page0Note_(w));
  numberItem_(form, 'Team RPs');
  numberItem_(form, 'Team FTIs');
  numberItem_(form, 'Team MPs');
  numberItem_(form, 'Team PTCs');
  numberItem_(form, 'Team resumes');
  numberItem_(form, 'Team submittals');
  numberItem_(form, 'Team dials');
  form.addTextItem().setTitle('Team placements').setHelpText('Names, or blank if none.').setRequired(false);

  page_(form, 'The week');
  para_(form, 'L1 Biggest team win, and who drove it', true);
  form.addGridItem().setTitle('L2 Team numbers against the weekly plan')
    .setRows(['RPs', 'FTIs', 'PTCs', 'Dials', 'Placements'])
    .setColumns(['On track', 'Close', 'Behind']).setRequired(true);
  form.addGridItem().setTitle('L3 Each recruiter in one line')
    .setRows(RECRUITERS)
    .setColumns(['On track', 'Watch', 'Needs help']).setRequired(true);
  para_(form, 'L4 Who needs coaching, and on what? Note any PIP conversation.', false);
  form.addListItem().setTitle('L5 Good Guy of the Week').setHelpText('Pick from this week\'s 2.9 nominations.')
    .setChoiceValues(RECRUITERS).setRequired(true);
  form.addTextItem().setTitle('L5 Why').setRequired(true);
  para_(form, 'L6 Client development: new clients, JOs opened, split partners worked', true);
  para_(form, 'L7 JOs to kill, reassign or push next week', false);
  para_(form, 'L8 Which system or agent helped or slowed the team, and the one fix for next week', false);
  form.addScaleItem().setTitle('L9 Your own burnout score').setBounds(1, 10).setLabels('Fried', 'Fresh').setRequired(true);
  para_(form, 'L10 Decisions waiting on you, and by when', false);
  para_(form, 'L11 Top three leadership priorities for next week', true);

  PropertiesService.getScriptProperties().setProperty('LEADERSHIP_FORM_ID', form.getId());
  var ss = linkToSheet_(form, 'Leadership');
  Logger.log('Leadership form, edit: ' + form.getEditUrl());
  Logger.log('Leadership form, link (Kev and Nick only): ' + form.getPublishedUrl());
  Logger.log('Responses Sheet: ' + ss.getUrl());
}
