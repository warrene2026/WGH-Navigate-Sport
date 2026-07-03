-- Navigate YS — Parent App
-- Row Level Security policies
--
-- Model: guardians are READ-ONLY everywhere except `consents`, where they can
-- insert (but never update/delete — consent is an append-only audit trail).
-- All writes (creating reports, assigning resources, managing enrollments)
-- happen practitioner-side via Supabase Studio, using the service_role key,
-- which bypasses RLS entirely. There is no practitioner-facing app in v1.

-- 1. Turn RLS on for every table. Tables default to UNPROTECTED in Postgres —
--    this line is the one most likely to be forgotten, and the most important.
alter table guardians enable row level security;
alter table athletes enable row level security;
alter table athlete_guardians enable row level security;
alter table plans enable row level security;
alter table enrollments enable row level security;
alter table consent_versions enable row level security;
alter table consents enable row level security;
alter table reports enable row level security;
alter table resources enable row level security;
alter table athlete_resources enable row level security;

-- 2. guardians — can only see/update their own row
create policy "guardians read own row"
  on guardians for select
  using (id = auth.uid());

create policy "guardians update own row"
  on guardians for update
  using (id = auth.uid());

-- guardians can create their own row on first login (see app/auth/callback/route.js,
-- which upserts a guardians row right after the magic-link session is established)
create policy "guardians insert own row"
  on guardians for insert
  with check (id = auth.uid());

-- 3. athletes — visible only if linked via athlete_guardians
create policy "guardians read linked athletes"
  on athletes for select
  using (
    exists (
      select 1 from athlete_guardians ag
      where ag.athlete_id = athletes.id
        and ag.guardian_id = auth.uid()
    )
  );

-- 4. athlete_guardians — a guardian can see their own links (needed so the
--    app can discover which athletes belong to the logged-in parent)
create policy "guardians read own links"
  on athlete_guardians for select
  using (guardian_id = auth.uid());

-- 5. plans — reference data, safe to read for any authenticated user
create policy "authenticated read plans"
  on plans for select
  using (auth.role() = 'authenticated');

-- 6. enrollments — visible only for the guardian's own linked athletes
create policy "guardians read linked enrollments"
  on enrollments for select
  using (
    exists (
      select 1 from athlete_guardians ag
      where ag.athlete_id = enrollments.athlete_id
        and ag.guardian_id = auth.uid()
    )
  );

-- 7. consent_versions — must be readable pre-consent, so the guardian can
--    actually see what they're agreeing to
create policy "authenticated read consent versions"
  on consent_versions for select
  using (auth.role() = 'authenticated');

-- 8. consents — the core safeguarding boundary.
--    Guardians can read their own consent history, and INSERT a new consent
--    row for themselves — but never UPDATE or DELETE. Consent is append-only:
--    if wording changes, a new row is added, not the old one edited. This is
--    what makes the audit trail defensible.
create policy "guardians read own consents"
  on consents for select
  using (guardian_id = auth.uid());

create policy "guardians insert own consent"
  on consents for insert
  with check (guardian_id = auth.uid());

-- 9. reports — the single most important policy in this file.
--    A guardian can NEVER see a report with status != 'shared', and can only
--    ever see reports for athletes they're actually linked to. There is
--    deliberately no INSERT/UPDATE/DELETE policy here for guardians — reports
--    are written practitioner-side only, via the service_role key.
create policy "guardians read shared reports for linked athletes"
  on reports for select
  using (
    status = 'shared'
    and exists (
      select 1 from athlete_guardians ag
      where ag.athlete_id = reports.athlete_id
        and ag.guardian_id = auth.uid()
    )
  );

-- 10. athlete_resources — which resources are assigned to which athlete
create policy "guardians read linked athlete_resources"
  on athlete_resources for select
  using (
    exists (
      select 1 from athlete_guardians ag
      where ag.athlete_id = athlete_resources.athlete_id
        and ag.guardian_id = auth.uid()
    )
  );

-- 11. resources — a guardian can only see a resource's details if it's been
--     explicitly assigned to one of their linked athletes.
--     NOTE: this does not yet implement plan-tier auto-unlocking
--     (resources.min_plan_id) — that logic isn't wired into the app yet
--     either. Add a second policy for tier-based access once that feature
--     is actually built; don't add it speculatively now.
create policy "guardians read assigned resources"
  on resources for select
  using (
    exists (
      select 1 from athlete_resources ar
      join athlete_guardians ag on ag.athlete_id = ar.athlete_id
      where ar.resource_id = resources.id
        and ag.guardian_id = auth.uid()
    )
  );
