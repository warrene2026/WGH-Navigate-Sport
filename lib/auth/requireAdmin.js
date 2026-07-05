import { createClient } from '@/lib/supabase/server';

// Checks the caller's own session (normal cookie-based client, so RLS's
// "read own profile" policy applies) and confirms role === 'admin'.
// Every /api/admin/* route and the /admin layout call this before doing
// anything privileged. Keeps RLS simple (plain "own row" policies only)
// and puts all privilege-escalation logic in this one reviewable place.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { authorized: false, user, profile: profile ?? null };
  }

  return { authorized: true, user, profile };
}
