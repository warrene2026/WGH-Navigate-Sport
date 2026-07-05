import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasCurrentConsent } from '@/lib/consent';
import ConsentClient from './ConsentClient';

export const dynamic = 'force-dynamic';

export default async function ConsentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Already consented at the current version — nothing to do here, let
  // the root router send them to the right next step.
  if (await hasCurrentConsent(supabase, user.id)) {
    redirect('/');
  }

  return <ConsentClient userId={user.id} />;
}
