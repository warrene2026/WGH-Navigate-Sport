import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildReportData } from '@/lib/assessment/reportData';
import { renderReportPdf } from '@/lib/pdf/renderReportPdf';
import { sendReportEmail } from '@/lib/email/reportEmail';

// react-pdf needs Node APIs — must not run on the Edge runtime.
export const runtime = 'nodejs';

export async function POST(request, { params }) {
  const { assessmentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  // SECURITY: owner-only, deliberately not using the admin-bypass
  // authorize helper. The recipient below is derived ONLY from
  // `user.email` on this authenticated session — there is no `to`
  // field read from the request body anywhere in this file. That is
  // what makes "this always emails the caller's own address, never an
  // arbitrary one" structurally true rather than merely validated. Do
  // not "helpfully" add a `to`/`email` param to this route.
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!assessment || assessment.status !== 'complete') {
    return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, athlete_name, sport, sport_type')
    .eq('id', user.id)
    .maybeSingle();

  const { data: responses } = await supabase
    .from('responses')
    .select('question_key, answer_value')
    .eq('assessment_id', assessmentId);

  const reportData = buildReportData({ assessment, responses: responses ?? [], profile });
  const pdfBuffer = await renderReportPdf(reportData);

  try {
    await sendReportEmail({ to: user.email, reportData, pdfBuffer });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to send email.' }, { status: 500 });
  }

  const { data: existingReport } = await supabase
    .from('reports')
    .select('id, email_count')
    .eq('assessment_id', assessmentId)
    .maybeSingle();

  if (existingReport) {
    await supabase
      .from('reports')
      .update({
        emailed_at: new Date().toISOString(),
        email_count: existingReport.email_count + 1,
      })
      .eq('id', existingReport.id);
  } else {
    await supabase.from('reports').insert({
      assessment_id: assessmentId,
      emailed_at: new Date().toISOString(),
      email_count: 1,
    });
  }

  return NextResponse.json({ success: true });
}
