import { createServiceClient } from "@/lib/supabase/server";

type Table = "messages" | "approvals";

/**
 * Returns true if the rate limit is exceeded.
 * Counts rows inserted in the last `windowMs` ms for the given project.
 */
export async function isRateLimited(
  table: Table,
  projectId: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const service = createServiceClient();
  const since = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await service
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .gte("created_at", since);

  if (error) return false; // fail open — don't block on DB error
  return (count ?? 0) >= limit;
}
