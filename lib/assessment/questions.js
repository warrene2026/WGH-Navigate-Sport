// Static assessment content — fixed at build time, not DB-driven (no
// admin CMS for this in MVP, per PRD). Sections/questions marked
// PLACEHOLDER need WGH sign-off on exact wording before real launch;
// the PRD only specified structure, not final copy, for those.

export const BODY_LOCATION_OPTIONS = [
  { value: 'head', label: 'Head' },
  { value: 'jaw_face', label: 'Jaw / face' },
  { value: 'throat', label: 'Throat' },
  { value: 'chest', label: 'Chest' },
  { value: 'stomach', label: 'Stomach' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'hands', label: 'Hands' },
  { value: 'legs', label: 'Legs' },
  { value: 'whole_body', label: 'Overall / whole body' },
];

// sportRelated flags which words count toward the "sport-related" side
// of the identity-balance auto-count (see lib/assessment/keyInsight.js).
// Includes the exact words from the PRD's worked example (Zara Vermaak:
// gymnast, disciplined, competitor, funny, sister) as real preset chips,
// not just reachable via free-text.
export const IDENTITY_WORD_OPTIONS = [
  { value: 'athlete', label: 'Athlete', sportRelated: true },
  { value: 'gymnast', label: 'Gymnast', sportRelated: true },
  { value: 'competitor', label: 'Competitor', sportRelated: true },
  { value: 'disciplined', label: 'Disciplined', sportRelated: true },
  { value: 'teammate', label: 'Teammate', sportRelated: true },
  { value: 'hard_worker', label: 'Hard worker', sportRelated: true },
  { value: 'leader', label: 'Leader', sportRelated: false },
  { value: 'friend', label: 'Friend', sportRelated: false },
  { value: 'sister', label: 'Sister', sportRelated: false },
  { value: 'brother', label: 'Brother', sportRelated: false },
  { value: 'student', label: 'Student', sportRelated: false },
  { value: 'funny', label: 'Funny', sportRelated: false },
  { value: 'creative', label: 'Creative', sportRelated: false },
  { value: 'kind', label: 'Kind', sportRelated: false },
];

// Simple keyword match for classifying free-typed custom identity
// words as sport-related or not — a rough heuristic, not linguistics.
// The UI lets the user manually flip this if it guesses wrong.
export const SPORT_KEYWORD_HINTS = [
  'athlete', 'sport', 'team', 'compet', 'train', 'play', 'game', 'match',
];

export const SECTIONS = [
  {
    key: 'warmup',
    title: 'Warm-up',
    questions: [
      {
        key: 'warmup_feeling_today',
        type: 'single_choice',
        label: 'How are you feeling today?',
        options: [
          { value: 'great', label: 'Great' },
          { value: 'okay', label: 'Okay' },
          { value: 'not_great', label: 'Not great' },
          { value: 'struggling', label: 'Struggling' },
        ],
      },
      {
        // PLACEHOLDER — confirm wording with WGH before launch
        key: 'warmup_training_word',
        type: 'open_text',
        label: "In one word, how's training been going lately?",
      },
    ],
  },
  {
    key: 'current_state',
    title: "Where They're At Right Now",
    questions: [
      {
        key: 'enjoyment_scale',
        type: 'scale_1_10',
        label: 'How much are you enjoying your sport right now?',
      },
      {
        key: 'competition_pressure_scale',
        type: 'scale_1_10',
        label: 'How much pressure do you feel around competition?',
      },
    ],
  },
  {
    key: 'pressure_check',
    title: 'Pressure Check',
    questions: [
      { key: 'pressure_competition', type: 'level_low_mod_high', label: 'Competition' },
      { key: 'pressure_parents', type: 'level_low_mod_high', label: 'Parents' },
      { key: 'pressure_coach', type: 'level_low_mod_high', label: 'Coach' },
      { key: 'pressure_peers', type: 'level_low_mod_high', label: 'Peers' },
      { key: 'pressure_self', type: 'level_low_mod_high', label: 'Self-expectation' },
    ],
  },
  {
    key: 'how_it_feels',
    title: 'How It Feels',
    questions: [
      {
        key: 'body_locations',
        type: 'multi_select_chips',
        label: 'Where do you feel it in your body?',
        options: BODY_LOCATION_OPTIONS,
      },
    ],
  },
  {
    key: 'identity',
    title: 'Identity',
    questions: [
      {
        key: 'identity_words',
        type: 'multi_select_chips_freeform',
        label: 'Which words describe you?',
        options: IDENTITY_WORD_OPTIONS,
        allowCustom: true,
      },
    ],
  },
  {
    key: 'perspective_gap',
    title: 'Perspective Gap',
    questions: [
      {
        // PLACEHOLDER — confirm wording with WGH before launch
        key: 'perspective_others_see',
        type: 'open_text',
        label: 'What do you think other people (coach, parents, teammates) would say is your biggest strength?',
      },
      {
        // PLACEHOLDER — confirm wording with WGH before launch
        key: 'perspective_self_see',
        type: 'open_text',
        label: 'What do YOU think is your biggest strength?',
      },
    ],
  },
  {
    key: 'key_insight',
    title: 'Key Insight',
    questions: [
      {
        // PLACEHOLDER — confirm wording with WGH before launch
        key: 'key_insight_checklist',
        type: 'checklist',
        label: 'Quick check-in',
        options: [
          { value: 'know_why', label: "I know what's making me feel this way" },
          { value: 'someone_to_talk_to', label: 'I have someone I can talk to about this' },
          { value: 'have_a_plan', label: 'I have a plan for managing pressure right now' },
        ],
      },
    ],
  },
];

export function allQuestions() {
  return SECTIONS.flatMap((section) =>
    section.questions.map((q) => ({ ...q, section: section.key }))
  );
}

export function findQuestion(questionKey) {
  for (const section of SECTIONS) {
    const q = section.questions.find((q) => q.key === questionKey);
    if (q) return q;
  }
  return null;
}
