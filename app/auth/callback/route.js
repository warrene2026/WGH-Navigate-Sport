import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.exchangeCodeForSession(code);

    if (user) {
      await supabase
        .from('guardians')
        .upsert(
          { id: user.id, name: user.email, email: user.email },
          { onConflict: 'id' }
        );
    }
  }

  return NextResponse.redirect(`${origin}/consent`);
}
