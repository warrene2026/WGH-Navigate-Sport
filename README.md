# Navigate YS — Parent App

A parent-facing web app for accessing session reports and assigned resources.

## Stack
- **Next.js** (deployed on Vercel)
- **Supabase** (Postgres + Auth + Storage)
- **GitHub** (source control, connected to Vercel for auto-deploy on push)

## Status
Core flow scaffolded: login (magic link) → consent gate → home (reports + resources).
RLS policies are now in place — see `supabase/migrations/0002_rls.sql`. Run both
migrations in order (0001 then 0002) before connecting any real client data.

## Setup

1. **Create a Supabase project** at supabase.com
2. Run the migration in `supabase/migrations/0001_init.sql` (via Supabase Studio's SQL editor, or the Supabase CLI)
3. Copy `.env.example` to `.env.local` and fill in your Supabase project URL + anon key
4. `npm install`
5. `npm run dev` — runs locally at localhost:3000
6. Push to GitHub, connect the repo to Vercel, add the same env vars in Vercel's dashboard — every push to `main` auto-deploys

## Data model
See `supabase/migrations/0001_init.sql` for the full schema. Key relationships:
- One guardian can be linked to multiple athletes (`athlete_guardians`)
- Resources unlock either by plan tier (`resources.min_plan_id`) or explicit per-athlete assignment (`athlete_resources`)
- Consent is versioned (`consent_versions` + `consents`) so wording changes are always traceable

## Not yet built
- Practitioner-side interface (v1 plan: manage data directly via Supabase Studio, using the service_role key which bypasses RLS)
- Individual report detail page (`/report/[id]`) — currently linked but not implemented
- Re-consent-on-wording-change logic (compare guardian's latest consent_version_id against the current active version)
- Plan-tier auto-unlocking for resources (schema supports it via `resources.min_plan_id`; not yet wired into RLS or app logic — only explicit per-athlete assignment works right now)
