import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasCurrentConsent } from '@/lib/consent';

export const dynamic = 'force-dynamic';

// The single entry point that decides where an authenticated user
// actually belongs: admin -> roster; otherwise consent gate -> latest
// assessment (in progress or none) -> results. Kept as one cheap set
// of queries here rather than duplicated logic in middleware, so
// middleware stays a fast auth-only check on every request.
export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'admin') redirect('/admin');

  if (!(await hasCurrentConsent(supabase, user.id))) redirect('/consent');

  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, status')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assessment?.status === 'complete') {
    redirect(`/results/${assessment.id}`);
  }

  redirect('/assessment');
}
