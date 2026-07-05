import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export default async function AdminLayout({ children }) {
  const { authorized, user } = await requireAdmin();
  if (!user) redirect('/login');
  if (!authorized) redirect('/');

  return <div className="min-h-screen bg-nys-bg">{children}</div>;
}
