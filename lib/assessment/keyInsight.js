// Deterministic, rule-based synthesis of the "Key Insight" takeaway
// line — NOT an LLM call. The PRD explicitly leaves the scoring logic
// undefined ("needs a defined rule set... if it's to be auto-generated");
// this is a v1 heuristic for a WGH sports psychologist to review and
// tune, not final clinical copy. Deterministic on purpose: fast, free,
// reproducible, and explainable if a practitioner ever asks "why did
// it say that." An LLM-generated narrative (matching the depth of a
// full practitioner write-up) is a deliberate later step, not this one.
//
// Acceptance case: the real "Zara Vermaak Conversation Session 1"
// reference document — pressure_source_reflection = mostly_myself,
// identity 2/5 sport-related -> expected conclusions: "pressure comes
// from within" and "identity isn't heavily fused with the sport (a
// protective factor)," both of which this function reproduces.

const IDENTITY_AMPLIFY_RATIO = 0.8;
const IDENTITY_BUFFER_RATIO = 0.4;
const HIGH_PRESSURE_LEVEL = 4; // on the 1-5 labeled_scale (>= this counts as "a lot")

// Mirrors the wording branches in lib/assessment/questions.js's
// PRESSURE_MOMENT_LABELS — same question_keys, phrasing tailored to
// how the moment is described in a sentence rather than as a label.
const MOMENT_PHRASES = {
  individual: {
    during: [
      ['during_start_of_performance', 'the first few seconds of your routine'],
      ['during_recovering_mistake', 'recovering from a mistake mid-performance'],
      ['during_family_watching', 'family watching'],
      ['during_coach_watching_new_skill', "your coach watching you try something new"],
    ],
    before: [
      ['before_getting_ready', 'getting ready on competition day'],
      ['before_waiting_to_perform', 'waiting to perform'],
      ['before_watching_others', 'watching someone else compete first'],
      ['before_final_practice', 'final practice before competing'],
    ],
  },
  team: {
    during: [
      ['during_start_of_performance', 'the first few minutes of the match'],
      ['during_recovering_mistake', 'recovering from a mistake during play'],
      ['during_family_watching', 'family watching'],
      ['during_coach_watching_new_skill', "your coach watching you try something new in training"],
    ],
    before: [
      ['before_getting_ready', 'getting ready on game day'],
      ['before_waiting_to_perform', 'waiting in the tunnel before kickoff'],
      ['before_watching_others', 'sitting on the bench waiting to be brought on'],
      ['before_final_practice', 'the last training session before a big game'],
    ],
  },
};

export function computeKeyInsight(answers, { name, sport, sportType } = {}) {
  const moments = MOMENT_PHRASES[sportType] || MOMENT_PHRASES.individual;
  const subject = name ? `${name}'s` : 'Your';

  const enjoymentTraining = answers.enjoyment_training;
  const enjoymentCompetition = answers.enjoyment_competition;
  const pressureTraining = answers.pressure_training;
  const pressureCompetition = answers.pressure_competition;
  const source = answers.pressure_source_reflection;

  let core;

  if (enjoymentTraining === 'not_enjoying' || enjoymentCompetition === 'not_enjoying') {
    // Low enjoyment overrides the pressure-source framing — a
    // burnout-risk signal likely matters more than attributing source.
    core = `${subject} enjoyment of ${sport || 'the sport'} is currently a concern, which is worth paying attention to regardless of where the pressure is coming from.`;
  } else if (source === 'mostly_myself') {
    core = `${subject} pressure appears to come from within rather than from other people — the work focuses on softening that internal standard rather than managing outside pressure.`;
  } else if (source === 'mostly_others') {
    core = `${subject} pressure appears to be externally driven rather than self-generated — worth exploring which specific people or situations are contributing most, since the source isn't primarily internal.`;
  } else if (source === 'a_mix') {
    core = `${subject} pressure seems to come from a mix of internal expectations and outside sources, rather than clearly one or the other.`;
  } else {
    core = `${subject} results are in — talk through them together to unpack what's driving how ${name ? name.toLowerCase() : 'things are'} feeling right now.`;
  }

  // Healthy-relationship cross-check: strong enjoyment + low pressure
  // in competition specifically (training alone doesn't tell us much
  // here, since competition is where pressure typically shows up).
  if (
    (enjoymentCompetition === 'love_it' || enjoymentCompetition === 'its_fine') &&
    typeof pressureCompetition === 'number' &&
    pressureCompetition <= 2
  ) {
    core += ` Overall, this points to a healthy relationship with competing right now.`;
  }

  // Name the highest-pressure specific moments (favouring "during"
  // moments, since those tend to be the more acute, in-the-moment
  // flashpoints worth prioritising first).
  const highMoments = [...moments.during, ...moments.before]
    .filter(([key]) => answers[key] === 'High')
    .map(([, label]) => label)
    .slice(0, 2);

  if (highMoments.length > 0) {
    core += ` This shows up most clearly around ${highMoments.join(' and ')}.`;
  }

  // Identity balance modifier.
  const identitySentences = [1, 2, 3, 4, 5]
    .map((n) => answers[`identity_sentence_${n}`])
    .filter((s) => typeof s === 'string' && s.trim().length > 0);

  if (identitySentences.length > 0) {
    const sportRelatedCount = identitySentences.filter((s) => {
      const lower = s.toLowerCase();
      return ['athlete', 'sport', 'team', 'compet', 'train', 'play', 'game', 'match', 'gymnast', 'coach'].some(
        (hint) => lower.includes(hint)
      );
    }).length;
    const ratio = sportRelatedCount / identitySentences.length;

    if (ratio >= IDENTITY_AMPLIFY_RATIO) {
      core += ` ${subject} sense of self is closely tied to the sport, which may amplify this.`;
    } else if (ratio <= IDENTITY_BUFFER_RATIO) {
      core += ` ${subject} identity doesn't appear heavily fused with the sport, which is a genuine protective factor.`;
    }
  }

  return core;
}
