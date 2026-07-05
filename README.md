# Navigate YS

A self-assessment web app for We Guide Heroes. A single admin creates
accounts (name + email), the athlete/parent sets their own password via
an emailed link, accepts a consent form (first login only), completes a
7-section self-assessment, and gets an auto-generated results page they
can download as a PDF or email to themselves.

## Stack
- **Next.js** (App Router, plain JS), deployed on Vercel via GitHub auto-deploy on push to `main`
- **Supabase** — Postgres, Auth, Row Level Security
- **Resend** — transactional email (password-set links, "email me my report")
- **@react-pdf/renderer** — PDF generation (no headless browser, Vercel-serverless-friendly)
- **Tailwind CSS** — dark theme

## Roles

- **Admin** (single, MVP): creates users, views the roster (`/admin`), can view any user's results (`/admin/users/[id]`).
- **User**: no self-registration. Logs in with a password set via a reset-password email, accepts consent once, completes the assessment, views/downloads/emails their results.

## One-time setup: bootstrap the first admin

There's a chicken-and-egg problem — no admin exists yet to use the
admin UI, so the very first admin account is created manually:

1. Supabase dashboard → **Authentication → Users → Add user**. Set an email + password directly (tick "Auto Confirm User").
2. Supabase dashboard → **Table Editor → profiles → Insert row**: `id` = that user's UUID (copy from the Users list), `name`, `email`, `role = 'admin'`.
3. Log in with that email/password — you'll land on `/admin`.

Every subsequent user is created through `/admin/new` in the app itself.

## Environment variables

See `.env.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — same page, **server-only**, never exposed to the client. Used for admin actions (creating users, reading the full roster/other users' results) via `lib/supabase/admin.js`.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — from a Resend account. Used directly by the app for "email me my report".

Also recommended: point Supabase's own Auth SMTP settings (dashboard → Project Settings → Auth → SMTP Settings) at Resend, so Supabase-authored emails (the password-set/reset link) also route through Resend rather than Supabase's built-in mailer, which has a low rate limit not meant for production use.

## Setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_teardown_and_init.sql` then `0002_rls.sql` in the Supabase SQL Editor, in that order.
3. Copy `.env.example` to `.env.local` and fill in every value above.
4. `npm install`
5. `npm run dev` — runs locally at localhost:3000
6. Bootstrap the first admin (see above).
7. Push to GitHub, connect the repo to Vercel, add the same env vars in Vercel's dashboard (all environments) — every push to `main` auto-deploys.

## Data model

See `supabase/migrations/0001_teardown_and_init.sql`. Key points:
- `profiles` — one row per `auth.users` row, created only by the admin-create-user route (never client-side).
- `consents` — append-only. The required version is a constant (`lib/consent.js` → `CURRENT_CONSENT_VERSION`), not a DB row — bump the constant to force re-consent after a wording change.
- `assessments` / `responses` — a user can have multiple assessments over time (schema supports future trend-tracking; no UI for it yet). `responses` is one row per question, upserted repeatedly during autosave.
- `reports` — thin log only (generated/emailed timestamps). A "report" is always computed on demand from `assessments` + `responses` via `lib/assessment/reportData.js`, shared by the results page, the PDF route, and the email route — they can never drift apart in content.

RLS policies are plain "own row" checks only. Admin operations (creating users, reading the full roster, viewing another user's results) go through service-role-backed Route Handlers (`lib/supabase/admin.js` + `lib/auth/requireAdmin.js`), not RLS bypass policies.

## Assessment content

Question wording lives in `lib/assessment/questions.js` as a static config (not DB-driven — no admin CMS for this in MVP). Several sections are marked `PLACEHOLDER` in that file — the PRD specified structure but not final wording for Warm-up, Perspective Gap, the Key Insight checklist, the body-location list, and the identity word list. Confirm actual copy with WGH before real launch.

The "Key Insight" takeaway line (`lib/assessment/keyInsight.js`) is a deterministic, rule-based heuristic — not an LLM call — comparing internal vs. external pressure sources, cross-checked against enjoyment and identity balance. It's a v1 heuristic meant for a WGH sports psychologist to review and tune, validated against the PRD's worked example (Zara Vermaak) as the acceptance case.

## Security note

The "email me my report" route (`app/api/report/[assessmentId]/email/route.js`) derives the recipient **only** from the authenticated session's own email — it never reads a `to`/recipient field from the request body. This is deliberate: it's what makes "this can only ever email the requester's own address" structurally true rather than merely validated. Do not add a `to` parameter to this route.

## Not yet built

- Multiple-assessment trend-tracking UI (schema supports it, no UI)
- Practitioner review/edit of the auto-generated report before the user sees it
- Plan-tier/billing logic
- Multi-admin accounts
