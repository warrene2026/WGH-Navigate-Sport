-- Navigate YS — Parent App
-- Basic schema (security/RLS to be added later)

create table guardians (
  id uuid primary key references auth.users(id),
  name text not null,
  email text not null,
  created_at timestamptz default now()
);

create table athletes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dob date,
  sport text,
  created_at timestamptz default now()
);

create table athlete_guardians (
  athlete_id uuid references athletes(id),
  guardian_id uuid references guardians(id),
  primary key (athlete_id, guardian_id)
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,           -- 'Assessment Session' / 'Skills Programme' / 'Season Partnership'
  sort_order int not null
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references athletes(id),
  plan_id uuid references plans(id),
  started_at timestamptz default now(),
  status text default 'active'  -- 'active' / 'completed'
);

create table consent_versions (
  id uuid primary key default gen_random_uuid(),
  text_content text not null,
  effective_date timestamptz default now()
);

create table consents (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid references guardians(id),
  athlete_id uuid references athletes(id),
  consent_version_id uuid references consent_versions(id),
  parental_consent boolean not null,
  athlete_assent_confirmed boolean not null,
  signed_name text not null,
  ip_address text,
  signed_at timestamptz default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references athletes(id),
  session_number int not null,
  content jsonb not null,
  status text default 'draft',  -- 'draft' / 'shared'
  shared_at timestamptz
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,           -- 'doc' / 'video'
  storage_path text not null,
  description text,
  category text,
  min_plan_id uuid references plans(id)
);

create table athlete_resources (
  athlete_id uuid references athletes(id),
  resource_id uuid references resources(id),
  assigned_at timestamptz default now(),
  primary key (athlete_id, resource_id)
);

-- RLS policies intentionally left out for now — to be added before real client data touches this.
