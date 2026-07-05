-- Navigate YS — full schema replacement
-- Drops the old parent-report-app schema (test data only, confirmed
-- safe to drop) and creates the new practitioner + self-assessment
-- schema described in the PRD.

-- ---- Teardown old schema ----
drop table if exists athlete_resources cascade;
drop table if exists resources cascade;
drop table if exists reports cascade;
drop table if exists consents cascade;
drop table if exists consent_versions cascade;
drop table if exists enrollments cascade;
drop table if exists plans cascade;
drop table if exists athlete_guardians cascade;
drop table if exists athletes cascade;
drop table if exists guardians cascade;

-- ---- Extensions ----
create extension if not exists pgcrypto;

-- ---- profiles ----
-- One row per auth.users row. Created only by the admin-create-user
-- route (via the service_role client) — never client-side.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  athlete_name text,
  sport text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create index profiles_role_idx on profiles(role);
create index profiles_email_idx on profiles(email);

-- ---- consents ----
-- Append-only. The "current required version" is a constant in app
-- code (lib/consent.js -> CURRENT_CONSENT_VERSION), not a row here —
-- bumping that constant is the entire re-prompt-on-change mechanism.
create table consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  version int not null,
  accepted_at timestamptz not null default now()
);

create index consents_user_id_idx on consents(user_id);
create index consents_user_version_idx on consents(user_id, version);

-- ---- assessments ----
-- Multiple per user over time (future trend-tracking; MVP only ever
-- surfaces the latest one). status drives routing.
create table assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'complete')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  key_insight text
);

create index assessments_user_id_idx on assessments(user_id);
create index assessments_user_started_idx on assessments(user_id, started_at desc);

-- ---- responses ----
-- One row per (assessment, question). Upserted repeatedly during
-- autosave. answer_value is jsonb so every answer shape (int scale,
-- enum string, string[] chips, free text) fits without a
-- differently-typed column per question type.
create table responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  section text not null,
  question_key text not null,
  answer_value jsonb not null,
  updated_at timestamptz not null default now(),
  unique (assessment_id, question_key)
);

create index responses_assessment_id_idx on responses(assessment_id);

-- ---- reports ----
-- Thin/log-only. A "report" is always computed on demand from
-- assessments + responses (see lib/assessment/reportData.js); this
-- row just logs that a report was generated/emailed. No pdf_url, no
-- Supabase Storage — PDFs are streamed, never persisted.
create table reports (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  generated_at timestamptz not null default now(),
  emailed_at timestamptz,
  email_count int not null default 0
);

create index reports_assessment_id_idx on reports(assessment_id);

-- ---- autosave hygiene ----
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger responses_set_updated_at
  before update on responses
  for each row execute function set_updated_at();
