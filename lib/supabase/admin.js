import { createClient } from '@supabase/supabase-js';

// Service-role client — SERVER ONLY. Bypasses RLS and can use the Auth
// admin API (create users, generate password-set links). Never import
// this into a 'use client' file or into middleware.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
