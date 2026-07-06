'use client';
import { useState } from 'react';
import { Logo } from '@/lib/ui/Logo';

const LEVEL_STYLES = {
  Low: 'bg-[rgba(80,180,120,0.15)] text-[#6fcf97]',
  Moderate: 'bg-[rgba(224,160,0,0.15)] text-[#e0a000]',
  High: 'bg-[rgba(232,25,44,0.15)] text-nys-red',
};

const RELATIONSHIP_STYLES = {
  good: 'bg-[rgba(80,180,120,0.15)] text-[#6fcf97]',
  watch: 'bg-[rgba(224,160,0,0.15)] text-[#e0a000]',
};

const RELATIONSHIP_LABELS = { good: 'Good', watch: 'Watch' };

function ContextCard({ label, enjoyment, pressure }) {
  return (
    <div className="bg-nys-card border border-nys-border rounded-xl p-4 flex-1">
      <p className="text-xs text-nys-faint uppercase tracking-wide mb-2">{label}</p>
      <p className="text-sm text-white mb-3">{enjoyment ?? '—'}</p>
      <div className="h-1.5 rounded-full bg-nys-border overflow-hidden">
        <div
          className="h-full bg-nys-red rounded-full"
          style={{ width: `${((pressure ?? 0) / 5) * 100}%` }}
        />
      </div>
      <p className="text-xs text-nys-faint mt-1.5">
        Pressure: {pressure ?? '—'}/5
      </p>
    </div>
  );
}

function MomentList({ title, moments }) {
  const answered = moments.filter((m) => m.level);
  if (answered.length === 0) return null;
  return (
    <div>
      <p className="text-xs text-nys-faint uppercase tracking-wide mb-2">{title}</p>
      <div className="flex flex-col gap-2">
        {answered.map((m) => (
          <div key={m.key} className="flex items-center justify-between">
            <span className="text-sm text-nys-dim">{m.label}</span>
            <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${LEVEL_STYLES[m.level]}`}>
              {m.level}
            </span>
          </div>
        ))}
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

  const hasFeelingDescription =
    data.feelingDescription.whatItFeelsLike ||
    data.feelingDescription.whatYourBrainDoes ||
    data.feelingDescription.whatYouDoAboutIt;

  const hasRelationshipMap = data.relationshipMap.some((r) => r.rating);

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
            {data.completedAt ? new Date(data.completedAt).toLocaleDateString('en-ZA') : ''}
          </p>
        </div>

        <div className="border border-[rgba(232,25,44,0.3)] bg-[rgba(232,25,44,0.08)] rounded-xl p-5">
          <p className="text-xs font-medium text-nys-red uppercase tracking-wide mb-2">Key insight</p>
          <p className="text-sm text-white leading-relaxed">{data.keyInsight}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-white mb-3">Where they're at</p>
          <div className="flex gap-3">
            <ContextCard
              label="Training"
              enjoyment={data.currentState.enjoymentTraining}
              pressure={data.currentState.pressureTraining}
            />
            <ContextCard
              label="Competition"
              enjoyment={data.currentState.enjoymentCompetition}
              pressure={data.currentState.pressureCompetition}
            />
          </div>
        </div>

        {data.pressureSourceReflection && (
          <div className="bg-nys-card border border-nys-border rounded-xl p-5">
            <p className="text-xs text-nys-faint uppercase tracking-wide mb-1.5">Where the pressure comes from</p>
            <p className="text-sm text-white">{data.pressureSourceReflection}</p>
          </div>
        )}

        {(data.pressureMap.before.some((m) => m.level) || data.pressureMap.during.some((m) => m.level)) && (
          <div className="bg-nys-card border border-nys-border rounded-xl p-5 flex flex-col gap-4">
            <p className="text-sm font-medium text-white">Pressure map</p>
            <MomentList title="Before" moments={data.pressureMap.before} />
            <MomentList title="During" moments={data.pressureMap.during} />
          </div>
        )}

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

        {hasFeelingDescription && (
          <div className="bg-nys-card border border-nys-border rounded-xl p-5 flex flex-col gap-3">
            <p className="text-sm font-medium text-white">How it feels</p>
            {data.feelingDescription.whatItFeelsLike && (
              <div>
                <p className="text-xs text-nys-faint uppercase tracking-wide mb-1">What it feels like</p>
                <p className="text-sm text-nys-dim">{data.feelingDescription.whatItFeelsLike}</p>
              </div>
            )}
            {data.feelingDescription.whatYourBrainDoes && (
              <div>
                <p className="text-xs text-nys-faint uppercase tracking-wide mb-1">What your brain does</p>
                <p className="text-sm text-nys-dim">{data.feelingDescription.whatYourBrainDoes}</p>
              </div>
            )}
            {data.feelingDescription.whatYouDoAboutIt && (
              <div>
                <p className="text-xs text-nys-faint uppercase tracking-wide mb-1">What they do about it</p>
                <p className="text-sm text-nys-dim">{data.feelingDescription.whatYouDoAboutIt}</p>
              </div>
            )}
          </div>
        )}

        {hasRelationshipMap && (
          <div className="bg-nys-card border border-nys-border rounded-xl p-5">
            <p className="text-sm font-medium text-white mb-3">Relationship map</p>
            <div className="flex flex-col gap-3">
              {data.relationshipMap
                .filter((r) => r.rating)
                .map((r) => (
                  <div key={r.key}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-nys-dim">{r.label}</span>
                      <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${RELATIONSHIP_STYLES[r.rating]}`}>
                        {RELATIONSHIP_LABELS[r.rating]}
                      </span>
                    </div>
                    {r.note && <p className="text-xs text-nys-faint mt-1">{r.note}</p>}
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="bg-nys-card border border-nys-border rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-3">Identity reflection</p>
          {totalIdentity > 0 && (
            <>
              <div className="h-2 rounded-full bg-nys-border overflow-hidden flex mb-2">
                <div className="h-full bg-nys-red" style={{ width: `${sportRatio * 100}%` }} />
              </div>
              <p className="text-xs text-nys-faint mb-3">
                {data.identity.sportRelatedCount} of {totalIdentity} sport-related
              </p>
            </>
          )}
          <ul className="flex flex-col gap-1.5">
            {data.identity.sentences.map((s, i) => (
              <li key={i} className="text-sm text-nys-dim">
                "I am someone who… {s.text}"
              </li>
            ))}
          </ul>
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
