import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buildReportData } from '@/lib/assessment/reportData';
import ResultsClient from './ResultsClient';

export const dynamic = 'force-dynamic';

export default async function ResultsPage({ params }) {
  const { assessmentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!assessment) notFound();
  if (assessment.status !== 'complete') redirect('/assessment');

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, athlete_name, sport, sport_type')
    .eq('id', user.id)
    .single();

  const { data: responses } = await supabase
    .from('responses')
    .select('question_key, answer_value')
    .eq('assessment_id', assessmentId);

  const reportData = buildReportData({ assessment, responses: responses ?? [], profile });

  return <ResultsClient assessmentId={assessmentId} data={reportData} />;
}
