import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  }

  const { name, email, athleteName, sport } = await request.json();
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  const admin = createAdminClient();

  // No password is set here — the user sets their own via the
  // reset-password email sent below.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    name,
    email,
    athlete_name: athleteName || null,
    sport: sport || null,
    role: 'user',
    status: 'active',
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const { error: resetError } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (resetError) {
    return NextResponse.json(
      { warning: `User was created, but the set-password email failed to send: ${resetError.message}` },
      { status: 200 }
    );
  }

  return NextResponse.json({ success: true });
}
