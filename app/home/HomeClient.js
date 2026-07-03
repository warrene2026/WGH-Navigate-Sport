'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function HomeClient({ userId }) {
  const supabase = createClient();
  const [athletes, setAthletes] = useState([]);
  const [activeAthlete, setActiveAthlete] = useState(null);
  const [reports, setReports] = useState([]);
  const [resources, setResources] = useState([]);

  // Load athletes linked to this guardian
  useEffect(() => {
    async function loadAthletes() {
      const { data } = await supabase
        .from('athlete_guardians')
        .select('athletes(id, name, sport)')
        .eq('guardian_id', userId);

      const list = data?.map((row) => row.athletes) || [];
      setAthletes(list);
      setActiveAthlete(list[0] || null);
    }
    loadAthletes();
  }, [userId]);

  // Load reports + resources for the active athlete
  useEffect(() => {
    if (!activeAthlete) return;

    async function loadForAthlete() {
      const { data: reportData } = await supabase
        .from('reports')
        .select('*')
        .eq('athlete_id', activeAthlete.id)
        .eq('status', 'shared')
        .order('session_number', { ascending: false });
      setReports(reportData || []);

      // Resources: tier-unlocked OR explicitly assigned (see athlete_resources)
      const { data: resourceData } = await supabase
        .from('athlete_resources')
        .select('resources(*)')
        .eq('athlete_id', activeAthlete.id);
      setResources(resourceData?.map((row) => row.resources) || []);
    }
    loadForAthlete();
  }, [activeAthlete]);

  return (
    <main className="home-page">
      <header>
        <div className="brand">NAVIGATE YS</div>
        {athletes.length > 1 && (
          <div className="athlete-switcher">
            {athletes.map((a) => (
              <button
                key={a.id}
                className={activeAthlete?.id === a.id ? 'active' : ''}
                onClick={() => setActiveAthlete(a)}
              >
                {a.name}
              </button>
            ))}
          </div>
        )}
      </header>

      <section>
        <h2>Reports</h2>
        {reports.length === 0 && <p className="empty">No reports shared yet.</p>}
        {reports.map((r) => (
          <a key={r.id} className="report-card" href={`/report/${r.id}`}>
            Session {r.session_number}
          </a>
        ))}
      </section>

      <section>
        <h2>Resources</h2>
        {resources.length === 0 && <p className="empty">No resources assigned yet.</p>}
        {resources.map((res) => (
          <a key={res.id} className="resource-card" href={res.storage_path} target="_blank" rel="noreferrer">
            <span className="type">{res.type}</span>
            {res.title}
          </a>
        ))}
      </section>
    </main>
  );
}
