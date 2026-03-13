"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type ProjectUnread = { messages: boolean; approvals: boolean };

export function useNotifications(projectIds: string[]) {
  const [unread, setUnread] = useState<Record<string, ProjectUnread>>({});
  const supabase = createClient();
  const key = projectIds.join(",");

  const check = useCallback(async () => {
    if (!projectIds.length) return;

    const [msgRes, apprRes] = await Promise.all([
      supabase
        .from("messages")
        .select("project_id, created_at")
        .eq("role", "client")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false })
        .limit(projectIds.length * 2),
      supabase
        .from("approvals")
        .select("project_id, updated_at")
        .eq("status", "pending")
        .in("project_id", projectIds)
        .order("updated_at", { ascending: false })
        .limit(projectIds.length * 2),
    ]);

    // Deduplicate: keep only the first (latest) row per project_id
    const latestMsgMap  = new Map<string, { project_id: string; created_at: string }>();
    for (const m of (msgRes.data ?? []) as { project_id: string; created_at: string }[]) {
      if (!latestMsgMap.has(m.project_id)) latestMsgMap.set(m.project_id, m);
    }
    const latestApprMap = new Map<string, { project_id: string; updated_at: string }>();
    for (const a of (apprRes.data ?? []) as { project_id: string; updated_at: string }[]) {
      if (!latestApprMap.has(a.project_id)) latestApprMap.set(a.project_id, a);
    }

    const result: Record<string, ProjectUnread> = {};

    for (const id of projectIds) {
      const lastReadMsg  = localStorage.getItem(`handoff_read_messages_${id}`);
      const lastReadAppr = localStorage.getItem(`handoff_read_approvals_${id}`);

      const latestMsg  = latestMsgMap.get(id);
      const latestAppr = latestApprMap.get(id);

      result[id] = {
        messages:  latestMsg  ? (!lastReadMsg  || latestMsg.created_at  > lastReadMsg)  : false,
        approvals: latestAppr ? (!lastReadAppr || latestAppr.updated_at > lastReadAppr) : false,
      };
    }

    setUnread(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!projectIds.length) return;
    check();

    // Re-check whenever any client message is inserted or any approval status changes
    const msgChannel  = supabase.channel("dashboard-notifications-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, check)
      .subscribe();

    const apprChannel = supabase.channel("dashboard-notifications-approvals")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "approvals" }, check)
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(apprChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check]);

  return { unread, recheck: check };
}

// Call these when the freelancer opens a tab
export function markMessagesRead(projectId: string) {
  localStorage.setItem(`handoff_read_messages_${projectId}`, new Date().toISOString());
}

export function markApprovalsRead(projectId: string) {
  localStorage.setItem(`handoff_read_approvals_${projectId}`, new Date().toISOString());
}
