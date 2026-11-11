/**
 * Eden Friday Scorecard · recruiter form (Max, Evan, Noah, Andrew, Bridger)
 * Spec: Kev's scorecard brief, approved 5 Nov 2026. Needs shared.gs in the same project. See README.md.
 * Run buildRecruiterForm once. It creates an unshared Form; nothing is sent.
 */
function buildRecruiterForm() {
  var w = scoredWeek_();
  var form = FormApp.create(formTitle_(false));
  form.setDescription('Fill this in Friday 10:00 to 10:30am Pacific. We go through it together at the 10:30 Scorecard Review.');
  applySettings_(form);

  // Page 0 · your numbers (prefilled each Thursday; confirm or correct)
  form.addSectionHeaderItem().setTitle('0 · Your numbers').setHelpText(page0Note_(w));
  numberItem_(form, 'RPs');
  numberItem_(form, 'Days at 15 RPs', 'How many days this week you hit 15 RPs.', 5);
  numberItem_(form, 'FTIs');
  numberItem_(form, 'MPs');
  numberItem_(form, 'PTCs');
  numberItem_(form, 'Resumes');
  numberItem_(form, 'Submittals');
  numberItem_(form, 'Dials out');
  numberItem_(form, 'Dials answered');
  form.addTextItem().setTitle('Placements').setHelpText('Names of anyone who started or accepted this week. Leave blank if none.').setRequired(false);

  // Page 1 · big wins
  page_(form, '1 · Big wins');
  para_(form, '1.1 Biggest win this week, big or small', true);
  para_(form, '1.2 How did you get better at your daily work this week?', true);
  para_(form, '1.3 Which revenue, FTI or notable prospect should we talk about, and why?', false);
  form.addScaleItem().setTitle('1.4 How aligned was this week with your 10-5-3-1?').setBounds(1, 5).setLabels('Off track', 'Fully aligned').setRequired(true);
  form.addTextItem().setTitle('1.5 Which 1-year goal did this week move, and how?').setRequired(true);

  // Page 2 · MUST DOs and core values
  page_(form, '2 · MUST DOs and core values');
  form.addGridItem().setTitle('2.1 to 2.6 · This week\'s MUST DOs')
    .setRows([
      '2.1 Plan the week ahead (leads built, calendar set before Monday)',
      '2.2 Don\'t chase the day (RPA daily, 15 RPs on track by noon)',
      '2.3 Audit your inventory (chop tomorrow\'s wood today)',
      '2.4 Build your own book (new revenue opportunities charted)',
      '2.5 Autopsy your work (if you missed your numbers, 4.9 is filled in)',
      '2.6 Activity, Inventory, Skill (JOs worked to required resumes, depth chart owned)'
    ])
    .setColumns(['Yes', 'Partly', 'No'])
    .setRequired(true);
  form.addListItem().setTitle('2.7 Which pillar did you live best this week?').setChoiceValues(PILLARS).setRequired(true);
  form.addTextItem().setTitle('2.7 One example').setRequired(true);
  form.addListItem().setTitle('2.8 Which pillar will you work on next week?').setChoiceValues(PILLARS).setRequired(true);
  form.addTextItem().setTitle('2.9 Who on the team lived out a core value this week, and how?')
    .setHelpText('Counts as a Good Guy of the Week nomination.').setRequired(false);

  // Page 3 · radical candor
  page_(form, '3 · Radical candor', 'Only Kev reads this section. Skip anything you\'d rather say in person.');
  form.addScaleItem().setTitle('3.1 Burnout score').setBounds(1, 10).setLabels('Fried', 'Fresh').setRequired(true);
  para_(form, '3.2 Anything about pay, commission or draw you want to talk through?', false);
  para_(form, '3.3 Anything outside work affecting your week Kev should know?', false);
  para_(form, '3.4 What do you need from leadership to win next week?', false);
  para_(form, '3.5 Anything you\'d like resolved, or something we should be talking about?', false);

  // Page 4 · autopsy and inventory review
  page_(form, '4 · Autopsy and inventory review');
  form.addTextItem().setTitle('4.1 Do your numbers look right? If not, what\'s off?')
    .setHelpText('Add any placement the Thursday check missed.').setRequired(false);
  para_(form, '4.2 MPCs taking to market: name, role, location', true);
  para_(form, '4.3 Client prospects to develop, and the next step with each', true);
  para_(form, '4.4 FTIs and PTCs needing follow-up (your WIP)', true);
  para_(form, '4.5 Pending starts to touch base with before they start', false);
  para_(form, '4.6 JOs worked this week', true);
  para_(form, '4.7 JOs that are dead or need a client update', false);
  para_(form, '4.8 JOs you\'d like to work next week', true, 'Leadership confirms in the review.');
  para_(form, '4.9 Autopsy: one thing you\'d do differently', true, 'If you hit 15 RPs every day, write "hit my numbers".');
  para_(form, '4.10 Next week I will: three commitments', true);

  PropertiesService.getScriptProperties().setProperty('RECRUITER_FORM_ID', form.getId());
  var ss = linkToSheet_(form, 'Recruiters');
  Logger.log('Recruiter form, edit: ' + form.getEditUrl());
  Logger.log('Recruiter form, link to share (only on Kev\'s go): ' + form.getPublishedUrl());
  Logger.log('Responses Sheet: ' + ss.getUrl());
}
