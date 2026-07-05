'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CONSENT_TEXT, CURRENT_CONSENT_VERSION } from '@/lib/consent';
import { Logo } from '@/lib/ui/Logo';

export default function ConsentClient({ userId }) {
  const supabase = createClient();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!checked) return;
    setError(null);
    setBusy(true);
    const { error } = await supabase.from('consents').insert({
      user_id: userId,
      version: CURRENT_CONSENT_VERSION,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace('/');
    router.refresh();
  }

  return (
    <main className="min-h-screen px-4 py-8 flex justify-center bg-nys-bg">
      <div className="w-full max-w-xl">
        <div className="mb-6">
          <Logo />
        </div>

        <div className="bg-nys-card border border-nys-border rounded-xl p-6 flex flex-col gap-5">
          <div>
            <h1 className="text-lg font-medium text-white">{CONSENT_TEXT.title}</h1>
            <p className="text-sm text-nys-dim mt-2">{CONSENT_TEXT.intro}</p>
          </div>

          {CONSENT_TEXT.sections.map((s) => (
            <div key={s.heading}>
              <h3 className="text-sm font-medium text-white mb-1">{s.heading}</h3>
              <p className="text-sm text-nys-dim">{s.body}</p>
            </div>
          ))}

          <div className="border border-[rgba(232,25,44,0.3)] bg-[rgba(232,25,44,0.08)] rounded-lg p-4">
            <h3 className="text-sm font-medium text-nys-red mb-1">
              {CONSENT_TEXT.safeguarding.heading}
            </h3>
            <p className="text-sm text-nys-dim">{CONSENT_TEXT.safeguarding.body}</p>
          </div>

          <label className="flex items-start gap-2.5 text-sm text-white">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5"
            />
            {CONSENT_TEXT.checkboxLabel}
          </label>

          {error && (
            <p className="text-xs text-nys-red bg-[rgba(232,25,44,0.1)] border border-[rgba(232,25,44,0.3)] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            disabled={!checked || busy}
            onClick={handleSubmit}
            className="bg-nys-red text-white font-bold text-sm tracking-wide uppercase rounded-lg py-3 disabled:opacity-40"
          >
            {busy ? 'Saving…' : 'Accept & continue'}
          </button>
        </div>
      </div>
    </main>
  );
}
