// Bumping this constant is the entire "re-prompt on consent-text change"
// mechanism — see hasCurrentConsent below. No DB migration needed to
// roll out new consent wording, just edit this + CONSENT_TEXT.
export const CURRENT_CONSENT_VERSION = 1;

export const CONSENT_TEXT = {
  title: 'Before you continue',
  intro:
    "This confirms your consent to take part in the Navigate YS self-assessment, in line with South Africa's data protection law (POPIA) and our safeguarding policy.",
  sections: [
    {
      heading: 'What this assessment is for',
      body: 'Your responses help your practitioner understand how you’re feeling about your sport right now, so they can support you better.',
    },
    {
      heading: 'Who sees your results',
      body: 'Your practitioner at We Guide Heroes can see your results. If you are a parent completing this on behalf of your child, both of you may have access depending on how the account is set up.',
    },
    {
      heading: 'Data storage and privacy',
      body: 'Your responses are stored securely and are never shared outside We Guide Heroes without consent, except where required by law.',
    },
  ],
  safeguarding: {
    heading: 'Safeguarding — please read',
    body: 'If anything in your responses raises a safeguarding concern, we are legally and ethically required to report it to the appropriate authorities. This can happen without prior notice to you.',
  },
  checkboxLabel: 'I understand and agree to the above.',
};

export async function hasCurrentConsent(supabase, userId) {
  const { data } = await supabase
    .from('consents')
    .select('version')
    .eq('user_id', userId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  return !!data && data.version >= CURRENT_CONSENT_VERSION;
}
