'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ConsentClient({ userId }) {
  const supabase = createClient();
  const router = useRouter();
  const [assent, setAssent] = useState(false);
  const [consent, setConsent] = useState(false);
  const [name, setName] = useState('');
  const ready = assent && consent && name.trim().length > 1;

  async function handleSubmit() {
    if (!ready) return;

    // TODO: replace with the athlete this guardian is linked to,
    // and the current active consent_version id
    await supabase.from('consents').insert({
      guardian_id: userId,
      parental_consent: consent,
      athlete_assent_confirmed: assent,
      signed_name: name,
    });

    router.push('/home');
  }

  return (
    <main className="consent-page">
      <div className="consent-card">
        <h1>Before you continue</h1>
        <p className="sub">
          This confirms your consent for your child to take part in Navigate YS
          sessions, in line with South Africa's data protection law (POPIA) and
          our safeguarding policy.
        </p>

        <section>
          <h3>What we collect &amp; why</h3>
          <p>Session notes, assessment scales, and a written report — collected only
          to provide mental performance support to your child.</p>
        </section>

        <section>
          <h3>What you see vs. what stays private</h3>
          <p>You'll receive the written report after each session. Raw session
          conversation stays private between your child and their practitioner.</p>
        </section>

        <section className="flag">
          <h3>Safeguarding — please read</h3>
          <p>If anything in a session raises a safeguarding concern, we are legally
          and ethically required to report it to the appropriate authorities. This
          can override the privacy commitment above, and may happen without prior
          notice to you.</p>
        </section>

        <label className="check-row">
          <input type="checkbox" checked={assent} onChange={(e) => setAssent(e.target.checked)} />
          I confirm my child has been told about these sessions in age-appropriate
          language, and has agreed to take part.
        </label>

        <label className="check-row">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          I am my child's parent/legal guardian, and I consent to the above.
        </label>

        <label htmlFor="name">Full name (acts as your signature)</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} />

        <button disabled={!ready} onClick={handleSubmit}>Confirm consent</button>
      </div>
    </main>
  );
}
