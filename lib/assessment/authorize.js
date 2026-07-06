import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Resolves { assessment, profile, responses } for a given assessmentId,
// authorized either for the assessment's own owner (via the normal
// RLS-bound client) or an admin (via the service-role client, since
// plain RLS never grants an admin access to another user's rows —
// admin bypass only happens through the service-role client, per the
// established pattern in this app).
export async function loadAssessmentForViewing(assessmentId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authorized: false, status: 401, error: 'Not authenticated.' };

  const { data: ownAssessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .maybeSingle();

  if (ownAssessment) {
    if (ownAssessment.status !== 'complete') {
      return { authorized: false, status: 404, error: 'Report not ready yet.' };
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
    return { authorized: true, user, assessment: ownAssessment, profile, responses: responses ?? [] };
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (callerProfile?.role !== 'admin') {
    return { authorized: false, status: 404, error: 'Not found.' };
  }

  const admin = createAdminClient();
  const { data: assessment } = await admin
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .maybeSingle();

  if (!assessment || assessment.status !== 'complete') {
    return { authorized: false, status: 404, error: 'Not found.' };
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('name, athlete_name, sport')
    .eq('id', assessment.user_id)
    .maybeSingle();

  const { data: responses } = await admin
    .from('responses')
    .select('question_key, answer_value')
    .eq('assessment_id', assessmentId);

  return { authorized: true, user, assessment, profile, responses: responses ?? [] };
}
