// Deterministic, rule-based synthesis of the "Key Insight" takeaway
// line — NOT an LLM call. The PRD explicitly leaves the scoring logic
// undefined ("needs a defined rule set... if it's to be auto-generated");
// this is a v1 heuristic for a WGH sports psychologist to review and
// tune, not final clinical copy. Deterministic on purpose: fast, free,
// reproducible, and explainable if a practitioner ever asks "why did
// it say that."
//
// Acceptance case (from the PRD's worked example, Zara Vermaak):
// enjoyment 8, competition_pressure 6, pressure sources
// competition/coach = Moderate, parents/peers = Low, self = High,
// identity 3/5 sport-related -> expected conclusion: "stress is
// self-generated rather than externally driven."

const LEVEL_SCORE = { Low: 0, Moderate: 1, High: 2 };

const EXTERNAL_SOURCE_KEYS = [
  { key: 'pressure_competition', label: 'competition' },
  { key: 'pressure_parents', label: 'parents' },
  { key: 'pressure_coach', label: 'coach' },
  { key: 'pressure_peers', label: 'peers' },
];

const DOMINANCE_THRESHOLD = 1; // on the 0-2 level scale
const IDENTITY_AMPLIFY_RATIO = 0.8;
const IDENTITY_BUFFER_RATIO = 0.4;
const LOW_ENJOYMENT_CUTOFF = 4;
const HIGH_ENJOYMENT_CUTOFF = 7;
const LOW_PRESSURE_CUTOFF = 4;

export function computeKeyInsight(answers, { name, sport } = {}) {
  const subject = name ? `${name}'s` : 'Your';
  const subjectLower = name ? `${name}'s` : 'their';

  const enjoyment = answers.enjoyment_scale;
  const competitionPressure = answers.competition_pressure_scale;

  const externalLevels = EXTERNAL_SOURCE_KEYS.map(({ key, label }) => ({
    label,
    score: LEVEL_SCORE[answers[key]] ?? null,
  })).filter((s) => s.score !== null);

  const selfScore = LEVEL_SCORE[answers.pressure_self];

  const identityWords = Array.isArray(answers.identity_words) ? answers.identity_words : [];
  const sportRelatedCount = identityWords.filter((w) => w.sportRelated).length;
  const identityRatio = identityWords.length > 0 ? sportRelatedCount / identityWords.length : null;

  // Not enough data to say anything meaningful yet.
  if (externalLevels.length === 0 || selfScore === null) {
    return `${subject} results are in — talk through them with your practitioner to unpack what's driving how you're feeling.`;
  }

  const externalAvg =
    externalLevels.reduce((sum, s) => sum + s.score, 0) / externalLevels.length;

  let core;

  if (typeof enjoyment === 'number' && enjoyment <= LOW_ENJOYMENT_CUTOFF) {
    // Low enjoyment overrides the pressure-source framing — a
    // burnout-risk signal likely matters more than attributing source.
    core = `${subject} enjoyment of ${sport || 'the sport'} is currently low, which is worth paying attention to regardless of where the pressure is coming from.`;
  } else if (selfScore - externalAvg >= DOMINANCE_THRESHOLD) {
    core = `${subject} stress appears to be self-generated rather than externally driven — pressure from self-expectation outweighs pressure from competition, parents, coaches, or peers, so the work focuses on softening ${subjectLower} internal standard rather than managing outside pressure.`;
  } else if (externalAvg - selfScore >= DOMINANCE_THRESHOLD) {
    const dominant = externalLevels.reduce((max, s) => (s.score > max.score ? s : max), externalLevels[0]);
    const clearlyDominant = externalLevels.every(
      (s) => s.label === dominant.label || dominant.score - s.score >= DOMINANCE_THRESHOLD
    );
    core = clearlyDominant
      ? `${subject} stress appears to be externally driven, with pressure from ${dominant.label} standing out above other sources — worth exploring what's coming from that direction specifically.`
      : `${subject} stress appears to be externally driven more than self-generated, without one single source clearly standing out.`;
  } else {
    core = `${subject} pressure feels fairly balanced between internal expectations and outside sources — no single driver clearly stands out.`;
  }

  if (
    typeof enjoyment === 'number' &&
    typeof competitionPressure === 'number' &&
    enjoyment >= HIGH_ENJOYMENT_CUTOFF &&
    competitionPressure <= LOW_PRESSURE_CUTOFF
  ) {
    core += ` Overall, this points to a healthy relationship with the sport right now.`;
  }

  if (identityRatio !== null) {
    if (identityRatio >= IDENTITY_AMPLIFY_RATIO) {
      core += ` ${subject} sense of self is closely tied to their sport, which may amplify this.`;
    } else if (identityRatio <= IDENTITY_BUFFER_RATIO) {
      core += ` ${subject} identity outside sport gives them a helpful buffer.`;
    }
  }

  return core;
}
