import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { buildReportData } from '@/lib/assessment/reportData';
import ResultsClient from '../../../results/[assessmentId]/ResultsClient';
import { Logo } from '@/lib/ui/Logo';

export const dynamic = 'force-dynamic';

// Gated by app/admin/layout.js's requireAdmin() check — reuses the
// same buildReportData + ResultsClient as the self-service results
// page (email action hidden — sending would email the admin's own
// inbox, not the parent's, which would be confusing).
export default async function AdminUserResultsPage({ params }) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, athlete_name, sport, email')
    .eq('id', userId)
    .single();

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!assessment || assessment.status !== 'complete') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <Link href="/admin" className="text-xs text-nys-dim hover:text-white">
            Back to roster
          </Link>
        </div>
        <p className="text-sm text-nys-dim">
          {profile?.name || 'This user'} hasn't completed an assessment yet.
        </p>
      </main>
    );
  }

  const { data: responses } = await supabase
    .from('responses')
    .select('question_key, answer_value')
    .eq('assessment_id', assessment.id);

  const reportData = buildReportData({ assessment, responses: responses ?? [], profile });

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Link href="/admin" className="text-xs text-nys-dim hover:text-white">
          ← Back to roster
        </Link>
      </div>
      <ResultsClient assessmentId={assessment.id} data={reportData} showEmailAction={false} />
    </div>
  );
}
