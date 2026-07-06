// Static assessment content — fixed at build time, not DB-driven (no
// admin CMS for this in MVP, per PRD). Sections/questions marked
// PLACEHOLDER need WGH sign-off on exact wording before real launch;
// the PRD only specified structure, not final copy, for those.
//
// Structure deepened to actually support the report format WGH
// practitioners produce today (see the "Zara Vermaak Conversation
// Session 1" reference document): training/competition split,
// situational pressure moments (not abstract categories), a
// relationship map, and open-ended identity sentence completions,
// rather than the simpler single-score version this replaced.

export const BODY_LOCATION_OPTIONS = [
  { value: 'head', label: 'Head / forehead' },
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

// Simple keyword match for classifying free-typed identity sentences
// as sport-related or not — a rough heuristic, not linguistics, same
// approach used for custom identity chips previously.
export const SPORT_KEYWORD_HINTS = [
  'athlete', 'sport', 'team', 'compet', 'train', 'play', 'game', 'match',
  'gymnast', 'coach',
];

export const PRESSURE_LEVEL_OPTIONS = ['Low', 'Moderate', 'High'];

export const RELATIONSHIP_OPTIONS = [
  { value: 'good', label: 'Good — feels like support' },
  { value: 'watch', label: 'Watch — something to keep an eye on' },
];

// Pressure Map moment labels branch by sport_type — same question_keys
// either way, only the displayed wording differs (see
// supabase/migrations/0003_sport_type.sql).
export const PRESSURE_MOMENT_LABELS = {
  individual: {
    before_getting_ready: 'Getting ready on competition day',
    before_waiting_to_perform: 'Sitting / waiting to perform',
    before_watching_others: 'Watching someone else compete first',
    before_final_practice: 'Right before competing (final practice)',
    during_start_of_performance: 'The first few seconds of your routine/performance',
    during_recovering_mistake: 'Recovering from a mistake mid-performance',
    during_family_watching: 'Family members watching',
    during_coach_watching_new_skill: 'Coach watching you try something new',
  },
  team: {
    before_getting_ready: 'Getting ready on game day',
    before_waiting_to_perform: 'In the tunnel / warming up before kickoff',
    before_watching_others: 'Sitting on the bench, waiting to be brought on',
    before_final_practice: 'The last training session before a big game',
    during_start_of_performance: 'The first few minutes of the match',
    during_recovering_mistake: 'Recovering from a mistake during play',
    during_family_watching: 'Family members watching',
    during_coach_watching_new_skill: 'Coach watching you try something new in training',
  },
};

function pressureMapQuestions(sportType) {
  const labels = PRESSURE_MOMENT_LABELS[sportType] || PRESSURE_MOMENT_LABELS.individual;
  return [
    {
      key: 'pressure_source_reflection',
      type: 'single_choice',
      label: 'Where does the pressure mostly come from?',
      options: [
        { value: 'mostly_myself', label: 'Mostly from myself / expectations I set' },
        { value: 'mostly_others', label: 'Mostly from other people or situations' },
        { value: 'a_mix', label: 'A mix of both' },
      ],
    },
    { key: 'before_getting_ready', type: 'level_low_mod_high', label: labels.before_getting_ready },
    { key: 'before_waiting_to_perform', type: 'level_low_mod_high', label: labels.before_waiting_to_perform },
    { key: 'before_watching_others', type: 'level_low_mod_high', label: labels.before_watching_others },
    { key: 'before_final_practice', type: 'level_low_mod_high', label: labels.before_final_practice },
    { key: 'during_start_of_performance', type: 'level_low_mod_high', label: labels.during_start_of_performance },
    { key: 'during_recovering_mistake', type: 'level_low_mod_high', label: labels.during_recovering_mistake },
    { key: 'during_family_watching', type: 'level_low_mod_high', label: labels.during_family_watching },
    { key: 'during_coach_watching_new_skill', type: 'level_low_mod_high', label: labels.during_coach_watching_new_skill },
  ];
}

// sportType: 'individual' | 'team' — controls Pressure Map wording only,
// every other section is identical either way.
export function getSections(sportType = 'individual') {
  return [
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
          key: 'enjoyment_training',
          type: 'single_choice',
          label: 'How much do you enjoy training?',
          options: [
            { value: 'love_it', label: 'I love it' },
            { value: 'its_fine', label: "It's fine, some good some not" },
            { value: 'not_enjoying', label: "I'm not really enjoying it" },
          ],
        },
        {
          key: 'pressure_training',
          type: 'labeled_scale',
          label: 'How much pressure do you feel in training?',
          steps: 5,
          lowLabel: 'Barely thinks about it',
          highLabel: 'Thinks about it a lot',
        },
        {
          key: 'enjoyment_competition',
          type: 'single_choice',
          label: 'How much do you enjoy competing?',
          options: [
            { value: 'love_it', label: 'I love it' },
            { value: 'its_fine', label: "It's fine, some good some not" },
            { value: 'not_enjoying', label: "I'm not really enjoying it" },
          ],
        },
        {
          key: 'pressure_competition',
          type: 'labeled_scale',
          label: 'How much pressure do you feel around competition?',
          steps: 5,
          lowLabel: 'Barely thinks about it',
          highLabel: 'Thinks about it a lot',
        },
      ],
    },
    {
      key: 'pressure_map',
      title: 'Pressure Map',
      questions: pressureMapQuestions(sportType),
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
        {
          // PLACEHOLDER — confirm wording with WGH before launch
          key: 'what_it_feels_like',
          type: 'open_text',
          label: 'What does it actually feel like?',
        },
        {
          // PLACEHOLDER — confirm wording with WGH before launch
          key: 'what_your_brain_does',
          type: 'open_text',
          label: 'What does your brain do in that moment?',
        },
        {
          // PLACEHOLDER — confirm wording with WGH before launch
          key: 'what_you_do_about_it',
          type: 'open_text',
          label: 'What do you do about it?',
        },
      ],
    },
    {
      key: 'relationship_map',
      title: 'Relationship Map',
      questions: [
        { key: 'relationship_coach', type: 'single_choice', label: 'Coach', options: RELATIONSHIP_OPTIONS },
        {
          key: 'relationship_coach_note',
          type: 'open_text',
          label: 'Anything to note about that? (optional)',
          required: false,
        },
        { key: 'relationship_parents', type: 'single_choice', label: 'Parents / guardians', options: RELATIONSHIP_OPTIONS },
        {
          key: 'relationship_parents_note',
          type: 'open_text',
          label: 'Anything to note about that? (optional)',
          required: false,
        },
        { key: 'relationship_teammates', type: 'single_choice', label: 'Teammates', options: RELATIONSHIP_OPTIONS },
        {
          key: 'relationship_teammates_note',
          type: 'open_text',
          label: 'Anything to note about that? (optional)',
          required: false,
        },
        { key: 'relationship_family', type: 'single_choice', label: 'Siblings / other family', options: RELATIONSHIP_OPTIONS },
        {
          key: 'relationship_family_note',
          type: 'open_text',
          label: 'Anything to note about that? (optional)',
          required: false,
        },
      ],
    },
    {
      key: 'identity',
      title: 'Identity Reflection',
      questions: [
        { key: 'identity_sentence_1', type: 'open_text', label: 'Finish the sentence: "I am someone who…" (1 of 5)' },
        { key: 'identity_sentence_2', type: 'open_text', label: 'Finish the sentence: "I am someone who…" (2 of 5)' },
        { key: 'identity_sentence_3', type: 'open_text', label: 'Finish the sentence: "I am someone who…" (3 of 5)' },
        { key: 'identity_sentence_4', type: 'open_text', label: 'Finish the sentence: "I am someone who…" (4 of 5)' },
        { key: 'identity_sentence_5', type: 'open_text', label: 'Finish the sentence: "I am someone who…" (5 of 5)' },
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
}

export function allQuestions(sportType = 'individual') {
  return getSections(sportType).flatMap((section) =>
    section.questions.map((q) => ({ ...q, section: section.key }))
  );
}

export function findQuestion(questionKey, sportType = 'individual') {
  for (const section of getSections(sportType)) {
    const q = section.questions.find((q) => q.key === questionKey);
    if (q) return q;
  }
  return null;
}
