# Handoff — Project Context

## What is Handoff
Handoff (`gethandoff.co`) is a SaaS client portal tool for freelancers. Freelancers create projects, share a unique link with their client, and both parties communicate via updates and approvals — no login required for the client.

## Tech Stack
- **Next.js 15** App Router
- **Tailwind CSS v4**
- **Supabase** — `@supabase/ssr` + `@supabase/supabase-js`
- **Recharts** — bar charts on dashboard and revenue page
- **TypeScript**
- Fonts: Geist (body), Syne (headings/logo)

## Project Structure
```
src/
  app/
    page.tsx                        # Landing page
    layout.tsx                      # Root layout
    login/page.tsx                  # Login page
    signup/page.tsx                 # Signup page
    dashboard/
      layout.tsx                    # Sidebar layout (icon-only, hover-expands)
      page.tsx                      # Main dashboard — projects grid + revenue strip
      revenue/page.tsx              # Revenue page with chart, target, breakdown
      project/[id]/page.tsx         # Project detail — updates, approvals, details tabs
    p/[id]/page.tsx                 # Client portal (public, no auth)
  lib/
    supabase/
      client.ts                     # createClient() — browser
      server.ts                     # createClient() + createServiceClient() — server
      types.ts                      # TypeScript types for all tables
    actions/
      auth.ts                       # signIn, signOut, getUser (hardcoded for now)
      projects.ts                   # CRUD for projects (uses service client + OWNER_ID)
      messages.ts                   # postMessage, postClientMessage
      approvals.ts                  # createApproval, decideApproval
    hooks/
      useProjects.ts                # useProjects, useProjectDetail
      useProjectData.ts             # useMessages, useApprovals, useClientPortal
  middleware.ts                     # Protects /dashboard routes via auth_session cookie
supabase/
  migrations/0001_schema.sql        # Full schema (run once)
  schemas/                          # Individual schema files per table
    functions.sql
    projects.sql
    messages.sql
    approvals.sql
    storage.sql
```

## Database Schema (Supabase)
3 tables — keep it simple, scalable to 50K users.

### `projects`
- `id` uuid PK
- `owner_id` uuid (FK to auth.users dropped for dev — hardcoded OWNER_ID)
- `share_token` text unique — 16-char random token, used as client portal URL key
- `name`, `client_name`, `client_email`, `status`, `deadline` date, `amount` numeric
- `description` text — shown as "Notes" in the UI
- `is_contract` boolean default false — long-term/retainer projects
- `created_at`, `updated_at`

### `messages`
- `role` check: `freelancer` | `client`
- `files` JSONB default `[]` — `[{name, size, type, url, path}]`

### `approvals`
- `status` check: `pending` | `approved` | `changes_requested`
- `files` JSONB default `[]`

## Auth (Temporary — Hardcoded)
Real Supabase auth is NOT wired up yet. Currently using:
- Cookie `auth_session=authenticated` set on login
- Hardcoded user: `{ id: "00000000-0000-0000-0000-000000000001", email: "test@gmail.com", name: "Test" }`
- `OWNER_ID = "00000000-0000-0000-0000-000000000001"` in `projects.ts` and `useProjects.ts`
- The FK constraint `projects_owner_id_fkey` was dropped in Supabase to allow this UUID
- Middleware checks cookie, not Supabase session

## Client Portal
- URL: `/p/[share_token]` — uses the project's `share_token`, not its `id`
- No login required
- Client can post messages and decide approvals
- Client writes use `createServiceClient()` (service role bypasses RLS)
- Invalid token → "This link is invalid or has expired" screen

## Key UI Decisions
- **Logo**: `Hand` in gray-900 + `off` in emerald-500, Syne font, no icon beside it
- **Sidebar**: Icon-only (`w-14`), hover-expands to `w-52`, overlays content
- **Status colors**: Ready to work=violet, In Progress=blue, Under Review=amber, Completed=emerald, Parked=gray
- **Contract projects**: `is_contract=true` shows "Long-term" violet tag on card, "Monthly rate" label, "Ongoing" instead of deadline
- **Revenue strip** on dashboard: compact single bar showing this month's earnings + mini chart + target progress
- **Revenue page**: All data computed from real `projects.amount` grouped by `created_at` month

## localStorage Keys
- `handoff_revenue_target` — monthly revenue target (number), shared between dashboard and revenue page

## Supabase SQL to Run After Fresh Setup
```sql
-- Drop FK constraint (dev only, re-add when real auth is wired)
alter table projects drop constraint projects_owner_id_fkey;

-- Add is_contract column
alter table projects add column if not exists is_contract boolean not null default false;
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

## Pending / Not Yet Built
- Real Supabase auth (sign up, sign in, email confirmation)
- Messages and approvals wired to Supabase (currently local state only on project detail page)
- Client portal wired to real data (currently no-op)
- Settings page (`/dashboard/settings`) — nav link exists, no page
- File uploads to Supabase Storage (bucket `project-files` created, actions exist in `messages.ts`)
- Save changes on project Details tab
- Delete project button
