'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SECTIONS } from '@/lib/assessment/questions';
import { QuestionRenderer } from './QuestionRenderer';
import { Logo } from '@/lib/ui/Logo';

const DEBOUNCED_TYPES = new Set(['open_text']);

function isAnswered(question, value) {
  if (question.required === false) return true;
  if (
    question.type === 'multi_select_chips' ||
    question.type === 'checklist' ||
    question.type === 'multi_select_chips_freeform'
  ) {
    return Array.isArray(value) && value.length > 0;
  }
  if (question.type === 'open_text') {
    return typeof value === 'string' && value.trim().length > 0;
  }
  return value !== undefined && value !== null && value !== '';
}

export default function AssessmentClient({ assessmentId, initialAnswers, initialSectionIndex }) {
  const router = useRouter();
  const [answers, setAnswers] = useState(initialAnswers ?? {});
  const [sectionIndex, setSectionIndex] = useState(initialSectionIndex ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimers = useRef({});
  // A ref, not state — the "wait for in-flight saves" loop below reads
  // this live; a state value would be a stale closure inside the loop.
  const pendingSavesRef = useRef(0);

  const section = SECTIONS[sectionIndex];
  const isLastSection = sectionIndex === SECTIONS.length - 1;

  async function persist(question, value) {
    pendingSavesRef.current += 1;
    try {
      await fetch('/api/assessment/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          section: question.section,
          questionKey: question.key,
          answerValue: value,
        }),
      });
    } finally {
      pendingSavesRef.current = Math.max(0, pendingSavesRef.current - 1);
    }
  }

  function handleChange(question, value) {
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
    const withSection = { ...question, section: section.key };

    if (DEBOUNCED_TYPES.has(question.type)) {
      clearTimeout(debounceTimers.current[question.key]);
      debounceTimers.current[question.key] = setTimeout(() => {
        persist(withSection, value);
      }, 500);
    } else {
      persist(withSection, value);
    }
  }

  const sectionComplete = section.questions.every((q) => isAnswered(q, answers[q.key]));

  async function waitForSaves() {
    while (pendingSavesRef.current > 0) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  async function handleNext() {
    Object.values(debounceTimers.current).forEach(clearTimeout);
    await waitForSaves();
    setSectionIndex((i) => Math.min(i + 1, SECTIONS.length - 1));
  }

  function handleBack() {
    setSectionIndex((i) => Math.max(i - 1, 0));
  }

  async function handleFinish() {
    setError(null);
    Object.values(debounceTimers.current).forEach(clearTimeout);
    await waitForSaves();
    setSubmitting(true);
    const res = await fetch('/api/assessment', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Something went wrong finishing your assessment.');
      return;
    }
    router.replace(`/results/${assessmentId}`);
  }

  return (
    <main className="min-h-screen px-4 py-8 flex justify-center bg-nys-bg">
      <div className="w-full max-w-xl">
        <div className="mb-6">
          <Logo />
        </div>

        <div className="flex gap-1.5 mb-6">
          {SECTIONS.map((s, i) => (
            <div
              key={s.key}
              className={`h-1.5 flex-1 rounded-full ${i <= sectionIndex ? 'bg-nys-red' : 'bg-nys-border'}`}
            />
          ))}
        </div>

        <div className="bg-nys-card border border-nys-border rounded-xl p-6 flex flex-col gap-6">
          <div>
            <p className="text-xs text-nys-faint uppercase tracking-wide">
              Section {sectionIndex + 1} of {SECTIONS.length}
            </p>
            <h1 className="text-lg font-medium text-white mt-1">{section.title}</h1>
          </div>

          {section.questions.map((q) => (
            <div key={q.key}>
              <p className="text-sm text-white mb-2.5">{q.label}</p>
              <QuestionRenderer
                question={q}
                value={answers[q.key]}
                onChange={(value) => handleChange(q, value)}
              />
            </div>
          ))}

          {error && (
            <p className="text-xs text-nys-red bg-[rgba(232,25,44,0.1)] border border-[rgba(232,25,44,0.3)] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            {sectionIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 border border-nys-border text-white text-sm font-medium rounded-lg py-3"
              >
                Back
              </button>
            )}
            {isLastSection ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={!sectionComplete || submitting}
                className="flex-1 bg-nys-red text-white font-bold text-sm tracking-wide uppercase rounded-lg py-3 disabled:opacity-40"
              >
                {submitting ? 'Finishing…' : 'Finish'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!sectionComplete}
                className="flex-1 bg-nys-red text-white font-bold text-sm tracking-wide uppercase rounded-lg py-3 disabled:opacity-40"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
