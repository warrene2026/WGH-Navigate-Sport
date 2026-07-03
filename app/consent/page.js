import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ConsentClient from './ConsentClient';

export const dynamic = 'force-dynamic';

export default async function ConsentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return <ConsentClient userId={user.id} />;
}
