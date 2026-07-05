-- Navigate YS — Row Level Security policies
--
-- Model: plain "own row" policies only. There is deliberately no
-- admin-bypass RLS policy here — admin writes (creating users,
-- reading the full roster) go through service-role-backed Route
-- Handlers instead (lib/supabase/admin.js + lib/auth/requireAdmin.js),
-- which bypass RLS entirely by design. This keeps every policy below
-- a simple, auditable "is this your own row" check.

alter table profiles enable row level security;
alter table consents enable row level security;
alter table assessments enable row level security;
alter table responses enable row level security;
alter table reports enable row level security;

-- profiles: a user can read their own row only. No insert/update/
-- delete policy for regular users — profile rows are created/edited
-- only by the admin route via the service_role client.
create policy "users read own profile"
  on profiles for select
  using (id = auth.uid());

-- consents: append-only from the user's perspective.
create policy "users read own consents"
  on consents for select
  using (user_id = auth.uid());

create policy "users insert own consent"
  on consents for insert
  with check (user_id = auth.uid());

-- assessments: a user can read/insert/update only their own rows.
-- Update is needed to flip status in_progress -> complete and set
-- completed_at/key_insight.
create policy "users read own assessments"
  on assessments for select
  using (user_id = auth.uid());

create policy "users insert own assessments"
  on assessments for insert
  with check (user_id = auth.uid());

create policy "users update own assessments"
  on assessments for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- responses: gated through the parent assessment's ownership (no
-- duplicated user_id column on this table).
create policy "users read own responses"
  on responses for select
  using (
    exists (
      select 1 from assessments a
      where a.id = responses.assessment_id
        and a.user_id = auth.uid()
    )
  );

create policy "users insert own responses"
  on responses for insert
  with check (
    exists (
      select 1 from assessments a
      where a.id = responses.assessment_id
        and a.user_id = auth.uid()
    )
  );

create policy "users update own responses"
  on responses for update
  using (
    exists (
      select 1 from assessments a
      where a.id = responses.assessment_id
        and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from assessments a
      where a.id = responses.assessment_id
        and a.user_id = auth.uid()
    )
  );

-- reports: users may read/insert/update their own report log rows
-- (via assessment ownership) — needed so the results page can show
-- "last emailed at" and log PDF/email generation.
create policy "users read own reports"
  on reports for select
  using (
    exists (
      select 1 from assessments a
      where a.id = reports.assessment_id
        and a.user_id = auth.uid()
    )
  );

create policy "users insert own reports"
  on reports for insert
  with check (
    exists (
      select 1 from assessments a
      where a.id = reports.assessment_id
        and a.user_id = auth.uid()
    )
  );

create policy "users update own reports"
  on reports for update
  using (
    exists (
      select 1 from assessments a
      where a.id = reports.assessment_id
        and a.user_id = auth.uid()
    )
  );
