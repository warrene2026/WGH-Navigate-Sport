import { BODY_LOCATION_OPTIONS, findQuestion, SPORT_KEYWORD_HINTS } from './questions';

function guessSportRelated(sentence) {
  const lower = sentence.toLowerCase();
  return SPORT_KEYWORD_HINTS.some((hint) => lower.includes(hint));
}

const ENJOYMENT_LABELS = {
  love_it: 'I love it',
  its_fine: "It's fine, some good some not",
  not_enjoying: "Not really enjoying it",
};

const PRESSURE_SOURCE_LABELS = {
  mostly_myself: 'Mostly from myself / expectations I set',
  mostly_others: 'Mostly from other people or situations',
  a_mix: 'A mix of both',
};

const BEFORE_MOMENT_KEYS = [
  ['before_getting_ready', 'Getting ready on competition day'],
  ['before_waiting_to_perform', 'Sitting / waiting to perform'],
  ['before_watching_others', 'Watching someone else compete first'],
  ['before_final_practice', 'Right before competing (final practice)'],
];

const DURING_MOMENT_KEYS = [
  ['during_start_of_performance', 'The first few seconds of the routine'],
  ['during_recovering_mistake', 'Recovering from a mistake mid-performance'],
  ['during_family_watching', 'Family members watching'],
  ['during_coach_watching_new_skill', 'Coach watching a new skill'],
];

const RELATIONSHIP_KEYS = [
  ['relationship_coach', 'relationship_coach_note', 'Coach'],
  ['relationship_parents', 'relationship_parents_note', 'Parents / guardians'],
  ['relationship_teammates', 'relationship_teammates_note', 'Teammates'],
  ['relationship_family', 'relationship_family_note', 'Siblings / other family'],
];

// Single source of truth for report content — consumed by the
// on-screen results page, the PDF route, and the email route. Keeping
// this in one place guarantees those three can never drift apart in
// content, only in presentation.
export function buildReportData({ assessment, responses, profile }) {
  const answers = Object.fromEntries(
    (responses ?? []).map((r) => [r.question_key, r.answer_value])
  );

  const currentState = {
    enjoymentTraining: ENJOYMENT_LABELS[answers.enjoyment_training] ?? null,
    pressureTraining: answers.pressure_training ?? null,
    enjoymentCompetition: ENJOYMENT_LABELS[answers.enjoyment_competition] ?? null,
    pressureCompetition: answers.pressure_competition ?? null,
  };

  const pressureSourceReflection = PRESSURE_SOURCE_LABELS[answers.pressure_source_reflection] ?? null;

  const pressureMap = {
    before: BEFORE_MOMENT_KEYS.map(([key, label]) => ({ key, label, level: answers[key] ?? null })),
    during: DURING_MOMENT_KEYS.map(([key, label]) => ({ key, label, level: answers[key] ?? null })),
  };

  const bodyLocationValues = Array.isArray(answers.body_locations) ? answers.body_locations : [];
  const bodyLocations = bodyLocationValues.map((value) => {
    const opt = BODY_LOCATION_OPTIONS.find((o) => o.value === value);
    return opt ? opt.label : value;
  });

  const feelingDescription = {
    whatItFeelsLike: answers.what_it_feels_like || '',
    whatYourBrainDoes: answers.what_your_brain_does || '',
    whatYouDoAboutIt: answers.what_you_do_about_it || '',
  };

  const relationshipMap = RELATIONSHIP_KEYS.map(([ratingKey, noteKey, label]) => ({
    key: ratingKey,
    label,
    rating: answers[ratingKey] ?? null,
    note: answers[noteKey] || '',
  }));

  const identitySentenceValues = [1, 2, 3, 4, 5]
    .map((n) => answers[`identity_sentence_${n}`])
    .filter((s) => typeof s === 'string' && s.trim().length > 0);

  const identitySentences = identitySentenceValues.map((text) => ({
    text,
    sportRelated: guessSportRelated(text),
  }));
  const sportRelatedCount = identitySentences.filter((s) => s.sportRelated).length;

  const checklistValues = Array.isArray(answers.key_insight_checklist)
    ? answers.key_insight_checklist
    : [];
  const checklistQuestion = findQuestion('key_insight_checklist');
  const keyInsightChecklist = checklistValues.map((value) => {
    const opt = checklistQuestion?.options.find((o) => o.value === value);
    return opt ? opt.label : value;
  });

  return {
    athleteName: profile?.athlete_name || profile?.name || 'Athlete',
    sport: profile?.sport || null,
    completedAt: assessment.completed_at,
    currentState,
    pressureSourceReflection,
    pressureMap,
    bodyLocations,
    feelingDescription,
    relationshipMap,
    identity: {
      sentences: identitySentences,
      sportRelatedCount,
      nonSportRelatedCount: identitySentences.length - sportRelatedCount,
    },
    perspectiveGap: {
      othersSee: answers.perspective_others_see || '',
      selfSee: answers.perspective_self_see || '',
    },
    keyInsightChecklist,
    keyInsight: assessment.key_insight || '',
  };
}
