# Auth Implementation TODO
> Complete this before going live. Follow steps in order.

---

## What needs to be replaced

| File | Current (hardcoded) | Replace with |
|------|---------------------|--------------|
| `src/lib/actions/auth.ts` | Cookie `auth_session=authenticated`, hardcoded user object | Supabase `signInWithPassword`, `signUp`, `getUser`, `signOut` |
| `src/middleware.ts` | `cookie.get("auth_session")?.value === "authenticated"` | `createServerClient` + `supabase.auth.getUser()` |
| `src/lib/actions/projects.ts` | `OWNER_ID = "00000000-0000-0000-0000-000000000001"` | `(await supabase.auth.getUser()).data.user?.id` |
| `src/lib/hooks/useProjects.ts` | Same hardcoded `OWNER_ID` | `supabase.auth.getUser()` then query by real user id |
| `src/lib/actions/billing.ts` | Same hardcoded `OWNER_ID` | Real user id from session |
| `src/app/login/page.tsx` | Calls hardcoded `signIn` | Already calls `signIn` — just wire real Supabase underneath |
| `src/app/signup/page.tsx` | Calls stub `signUp` (no-op) | Wire real `signUp` with Supabase |

---

## Step-by-step implementation

### Step 1 — Enable Supabase Auth in dashboard
- Go to Supabase → Authentication → Providers → Email → Enable
- Turn OFF "Confirm email" for now (easier to test), turn back ON before launch
- Set Site URL to `https://handoff-eight.vercel.app` (or `gethandoff.co` when live)
- Set Redirect URLs: `https://handoff-eight.vercel.app/**`

### Step 2 — Replace `src/lib/actions/auth.ts`
```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } }
  });
  return { error: error?.message ?? null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id:    user.id,
    email: user.email ?? "",
    name:  user.user_metadata?.full_name ?? user.email ?? "User",
  };
}
```

### Step 3 — Replace `src/middleware.ts`
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return response;
}

export const config = { matcher: ["/dashboard/:path*", "/login", "/signup"] };
```

### Step 4 — Replace OWNER_ID in `src/lib/actions/projects.ts`
- Remove `const OWNER_ID = "..."` constant
- At the top of every action, get the real user:
```ts
const supabase = createServiceClient();
const { data: { user } } = await createClient().then(c => c.auth.getUser());
if (!user) return { data: null, error: "Not authenticated" };
const ownerId = user.id;
```
- Replace all `OWNER_ID` references with `ownerId`

### Step 5 — Replace OWNER_ID in `src/lib/hooks/useProjects.ts`
- Remove `const OWNER_ID = "..."`
- Replace with:
```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;
// use user.id instead of OWNER_ID
```

### Step 6 — Replace OWNER_ID in `src/lib/actions/billing.ts`
- Same pattern — get `user.id` from `createClient().auth.getUser()`
- The `upsertCustomer` and `getCustomerPlan` functions must use the real user ID

### Step 7 — Re-enable FK constraint on projects table
```sql
-- Run in Supabase SQL Editor after auth is live
ALTER TABLE projects
  ADD CONSTRAINT projects_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Step 8 — Enable RLS on customers table
```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own" ON customers
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "service_role_all" ON customers
  FOR ALL USING (true); -- service role bypasses RLS anyway
```

### Step 9 — Add auth check to `/api/dodo/checkout`
```ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// At the top of POST handler:
const cookieStore = await cookies();
const supabase = createServerClient(..., { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### Step 10 — Update landing page redirect
In `src/middleware.ts`, add: if user hits `/` while logged in → redirect to `/dashboard`

---

## Security checklist before going live
- [ ] Real Supabase auth wired (Steps 1-6)
- [ ] FK constraint re-enabled (Step 7)
- [ ] RLS on customers table (Step 8)
- [ ] Auth check on checkout API (Step 9)
- [ ] Switch Dodo from `test_mode` to `live_mode` in checkout + webhook routes
- [ ] Rotate Dodo API key (currently in .env.local which may have been seen)
- [ ] Confirm `.env.local` is in `.gitignore` ✓
- [ ] Set Supabase Site URL to production domain
- [ ] Turn email confirmation back ON in Supabase Auth settings
- [ ] Test full flow: sign up → create project → checkout → webhook → plan upgraded

---

## Notes
- `deleteApproval` in `approvals.ts` still uses `supabase.auth.getUser()` — this will work once real auth is in place
- The `useClientPortal` hook in `useProjectData.ts` is already auth-free (correct — client portal is public)
- Client portal actions (`postClientMessage`, `uploadClientFile`) use share token validation — keep as-is
- Rate limiting (`src/lib/rateLimit.ts`) is already in place for messages and approvals — keep as-is
