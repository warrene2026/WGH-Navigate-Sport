'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/lib/ui/Logo';

export default function NewUserPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [athleteName, setAthleteName] = useState('');
  const [sport, setSport] = useState('');
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setBusy(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, athleteName, sport }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }
    if (data.warning) {
      setWarning(data.warning);
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <Logo />
      </div>

      <h1 className="text-lg font-medium text-white mb-4">New user</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-nys-card border border-nys-border rounded-xl p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-nys-dim">Name (parent or athlete)</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg px-3 py-2.5 text-sm w-full"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-nys-dim">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg px-3 py-2.5 text-sm w-full"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-nys-dim">Athlete name</span>
          <input
            type="text"
            value={athleteName}
            onChange={(e) => setAthleteName(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm w-full"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-nys-dim">Sport</span>
          <input
            type="text"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm w-full"
          />
        </label>

        {error && (
          <p className="text-xs text-nys-red bg-[rgba(232,25,44,0.1)] border border-[rgba(232,25,44,0.3)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {warning && (
          <p className="text-xs text-[#e0a000] bg-[rgba(224,160,0,0.1)] border border-[rgba(224,160,0,0.3)] rounded-lg px-3 py-2">
            {warning}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="bg-nys-red text-white font-bold text-sm tracking-wide uppercase rounded-lg py-3 disabled:opacity-60"
        >
          {busy ? 'Creating…' : 'Create user'}
        </button>
      </form>
    </main>
  );
}
