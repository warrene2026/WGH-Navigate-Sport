import { BODY_LOCATION_OPTIONS, findQuestion } from './questions';

// Single source of truth for report content — consumed by the
// on-screen results page, the PDF route, and the email route. Keeping
// this in one place guarantees those three can never drift apart in
// content, only in presentation.
export function buildReportData({ assessment, responses, profile }) {
  const answers = Object.fromEntries(
    (responses ?? []).map((r) => [r.question_key, r.answer_value])
  );

  const pressureSources = [
    { key: 'competition', label: 'Competition', level: answers.pressure_competition ?? null },
    { key: 'parents', label: 'Parents', level: answers.pressure_parents ?? null },
    { key: 'coach', label: 'Coach', level: answers.pressure_coach ?? null },
    { key: 'peers', label: 'Peers', level: answers.pressure_peers ?? null },
    { key: 'self', label: 'Self-expectation', level: answers.pressure_self ?? null },
  ];

  const bodyLocationValues = Array.isArray(answers.body_locations) ? answers.body_locations : [];
  const bodyLocations = bodyLocationValues.map((value) => {
    const opt = BODY_LOCATION_OPTIONS.find((o) => o.value === value);
    return opt ? opt.label : value;
  });

  const identityWords = Array.isArray(answers.identity_words) ? answers.identity_words : [];
  const sportRelatedCount = identityWords.filter((w) => w.sportRelated).length;

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
    currentState: {
      enjoyment: answers.enjoyment_scale ?? null,
      competitionPressure: answers.competition_pressure_scale ?? null,
    },
    pressureSources,
    bodyLocations,
    identity: {
      words: identityWords.map((w) => w.label),
      sportRelatedCount,
      nonSportRelatedCount: identityWords.length - sportRelatedCount,
    },
    perspectiveGap: {
      othersSee: answers.perspective_others_see || '',
      selfSee: answers.perspective_self_see || '',
    },
    keyInsightChecklist,
    keyInsight: assessment.key_insight || '',
  };
}
