import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Logo } from '@/lib/ui/Logo';

export const dynamic = 'force-dynamic';

async function loadRoster() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email, athlete_name, sport, created_at')
    .eq('role', 'user')
    .order('created_at', { ascending: false });

  const ids = (profiles ?? []).map((p) => p.id);

  const { data: assessmentRows } = await supabase
    .from('assessments')
    .select('user_id, status, started_at')
    .in('user_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
    .order('started_at', { ascending: false });

  const latestByUser = new Map();
  for (const row of assessmentRows ?? []) {
    if (!latestByUser.has(row.user_id)) latestByUser.set(row.user_id, row);
  }

  const { data: authList } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authByUser = new Map((authList?.users ?? []).map((u) => [u.id, u]));

  return (profiles ?? []).map((profile) => {
    const authUser = authByUser.get(profile.id);
    const latest = latestByUser.get(profile.id);
    let status = 'Invited';
    if (authUser?.last_sign_in_at) {
      status = latest ? (latest.status === 'complete' ? 'Complete' : 'In progress') : 'Password set';
    }
    return { ...profile, status };
  });
}

const STATUS_STYLES = {
  Invited: 'bg-nys-border text-nys-dim',
  'Password set': 'bg-[rgba(232,25,44,0.15)] text-nys-red',
  'In progress': 'bg-[rgba(232,25,44,0.15)] text-nys-red',
  Complete: 'bg-[rgba(80,180,120,0.15)] text-[#6fcf97]',
};

export default async function AdminRosterPage() {
  const rows = await loadRoster();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Logo />
        <Link
          href="/admin/new"
          className="bg-nys-red text-white text-sm font-bold uppercase tracking-wide rounded-lg px-4 py-2"
        >
          New user
        </Link>
      </div>

      <h1 className="text-lg font-medium text-white mb-4">Roster</h1>

      {rows.length === 0 ? (
        <p className="text-sm text-nys-dim">No users yet. Create the first one.</p>
      ) : (
        <div className="border border-nys-border rounded-xl overflow-hidden">
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/admin/users/${row.id}`}
              className="flex items-center justify-between px-4 py-3 border-b border-nys-border last:border-b-0 hover:bg-nys-card"
            >
              <div>
                <p className="text-sm text-white">{row.name}</p>
                <p className="text-xs text-nys-faint">
                  {row.email}
                  {row.athlete_name ? ` · ${row.athlete_name}` : ''}
                  {row.sport ? ` · ${row.sport}` : ''}
                </p>
              </div>
              <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${STATUS_STYLES[row.status]}`}>
                {row.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
