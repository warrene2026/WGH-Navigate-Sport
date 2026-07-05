import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasCurrentConsent } from '@/lib/consent';
import { SECTIONS } from '@/lib/assessment/questions';
import AssessmentClient from './AssessmentClient';

export const dynamic = 'force-dynamic';

export default async function AssessmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!(await hasCurrentConsent(supabase, user.id))) redirect('/consent');

  let { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assessment && assessment.status === 'complete') {
    redirect(`/results/${assessment.id}`);
  }

  if (!assessment) {
    const { data: created } = await supabase
      .from('assessments')
      .insert({ user_id: user.id, status: 'in_progress' })
      .select()
      .single();
    assessment = created;
  }

  const { data: responses } = await supabase
    .from('responses')
    .select('question_key, answer_value')
    .eq('assessment_id', assessment.id);

  const initialAnswers = Object.fromEntries(
    (responses ?? []).map((r) => [r.question_key, r.answer_value])
  );

  // Resume at the first section with an unanswered required question;
  // if everything's answered but not yet submitted, land on the last
  // section so "Finish" is one click away.
  let initialSectionIndex = 0;
  for (let i = 0; i < SECTIONS.length; i++) {
    initialSectionIndex = i;
    const unanswered = SECTIONS[i].questions.some(
      (q) => initialAnswers[q.key] === undefined
    );
    if (unanswered) break;
  }

  return (
    <AssessmentClient
      assessmentId={assessment.id}
      initialAnswers={initialAnswers}
      initialSectionIndex={initialSectionIndex}
    />
  );
}
