'use client';
import { useState } from 'react';
import { Logo } from '@/lib/ui/Logo';

const LEVEL_STYLES = {
  Low: 'bg-[rgba(80,180,120,0.15)] text-[#6fcf97]',
  Moderate: 'bg-[rgba(224,160,0,0.15)] text-[#e0a000]',
  High: 'bg-[rgba(232,25,44,0.15)] text-nys-red',
};

function GaugeCard({ label, value }) {
  return (
    <div className="bg-nys-card border border-nys-border rounded-xl p-4 flex-1">
      <p className="text-xs text-nys-faint uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-medium text-white mt-1">
        {value ?? '—'}
        <span className="text-sm text-nys-faint font-normal">/10</span>
      </p>
      <div className="h-1.5 rounded-full bg-nys-border mt-2 overflow-hidden">
        <div
          className="h-full bg-nys-red rounded-full"
          style={{ width: `${((value ?? 0) / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultsClient({ assessmentId, data, showEmailAction = true }) {
  const [emailStatus, setEmailStatus] = useState('idle'); // idle | sending | sent | error
  const [emailError, setEmailError] = useState(null);

  async function handleEmail() {
    setEmailStatus('sending');
    setEmailError(null);
    const res = await fetch(`/api/report/${assessmentId}/email`, { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setEmailError(body.error || 'Something went wrong sending the email.');
      setEmailStatus('error');
      return;
    }
    setEmailStatus('sent');
  }

  const totalIdentity = data.identity.sportRelatedCount + data.identity.nonSportRelatedCount;
  const sportRatio = totalIdentity > 0 ? data.identity.sportRelatedCount / totalIdentity : 0;

  return (
    <main className="min-h-screen px-4 py-8 flex justify-center bg-nys-bg">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex gap-2">
            <a
              href={`/api/report/${assessmentId}/pdf`}
              className="border border-nys-border text-white text-xs font-medium rounded-lg px-3 py-2"
            >
              Download PDF
            </a>
            {showEmailAction && (
              <button
                type="button"
                onClick={handleEmail}
                disabled={emailStatus === 'sending'}
                className="bg-nys-red text-white text-xs font-bold uppercase tracking-wide rounded-lg px-3 py-2 disabled:opacity-60"
              >
                {emailStatus === 'sending' ? 'Sending…' : 'Email me this report'}
              </button>
            )}
          </div>
        </div>

        {emailStatus === 'sent' && (
          <p className="text-xs text-[#6fcf97] bg-[rgba(80,180,120,0.1)] border border-[rgba(80,180,120,0.3)] rounded-lg px-3 py-2">
            Sent — check your inbox.
          </p>
        )}
        {emailStatus === 'error' && (
          <p className="text-xs text-nys-red bg-[rgba(232,25,44,0.1)] border border-[rgba(232,25,44,0.3)] rounded-lg px-3 py-2">
            {emailError}
          </p>
        )}

        <div>
          <h1 className="text-xl font-medium text-white">{data.athleteName}</h1>
          <p className="text-sm text-nys-faint mt-0.5">
            {data.sport ? `${data.sport} · ` : ''}
            {data.completedAt ? new Date(data.completedAt).toLocaleDateString() : ''}
          </p>
        </div>

        <div className="border border-[rgba(232,25,44,0.3)] bg-[rgba(232,25,44,0.08)] rounded-xl p-5">
          <p className="text-xs font-medium text-nys-red uppercase tracking-wide mb-2">Key insight</p>
          <p className="text-sm text-white leading-relaxed">{data.keyInsight}</p>
        </div>

        <div className="flex gap-3">
          <GaugeCard label="Enjoyment" value={data.currentState.enjoyment} />
          <GaugeCard label="Competition pressure" value={data.currentState.competitionPressure} />
        </div>

        <div className="bg-nys-card border border-nys-border rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-3">Pressure sources</p>
          <div className="flex flex-col gap-2">
            {data.pressureSources.map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-sm text-nys-dim">{s.label}</span>
                {s.level ? (
                  <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${LEVEL_STYLES[s.level]}`}>
                    {s.level}
                  </span>
                ) : (
                  <span className="text-xs text-nys-faint">—</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {data.bodyLocations.length > 0 && (
          <div className="bg-nys-card border border-nys-border rounded-xl p-5">
            <p className="text-sm font-medium text-white mb-3">Where it's felt</p>
            <div className="flex flex-wrap gap-2">
              {data.bodyLocations.map((loc) => (
                <span key={loc} className="text-xs text-nys-dim border border-nys-border rounded-full px-3 py-1">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-nys-card border border-nys-border rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-3">Identity balance</p>
          <div className="h-2 rounded-full bg-nys-border overflow-hidden flex mb-2">
            <div className="h-full bg-nys-red" style={{ width: `${sportRatio * 100}%` }} />
          </div>
          <p className="text-xs text-nys-faint">
            {data.identity.sportRelatedCount} sport-related, {data.identity.nonSportRelatedCount} non-sport
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {data.identity.words.map((word) => (
              <span key={word} className="text-xs text-nys-dim border border-nys-border rounded-full px-3 py-1">
                {word}
              </span>
            ))}
          </div>
        </div>

        {(data.perspectiveGap.othersSee || data.perspectiveGap.selfSee) && (
          <div className="bg-nys-card border border-nys-border rounded-xl p-5">
            <p className="text-sm font-medium text-white mb-3">Perspective gap</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-nys-faint uppercase tracking-wide mb-1">What others might say</p>
                <p className="text-sm text-nys-dim">{data.perspectiveGap.othersSee || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-nys-faint uppercase tracking-wide mb-1">What you say</p>
                <p className="text-sm text-nys-dim">{data.perspectiveGap.selfSee || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {data.keyInsightChecklist.length > 0 && (
          <div className="bg-nys-card border border-nys-border rounded-xl p-5">
            <p className="text-sm font-medium text-white mb-3">Check-in</p>
            <ul className="flex flex-col gap-1.5">
              {data.keyInsightChecklist.map((item) => (
                <li key={item} className="text-sm text-nys-dim">✓ {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
