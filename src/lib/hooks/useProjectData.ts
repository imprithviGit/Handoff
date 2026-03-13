"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message, Approval } from "@/lib/supabase/types";

export function useMessages(projectId: string) {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [loading, setLoading]         = useState(true);
  const [hasMore, setHasMore]         = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(50);
    setMessages(data ?? []);
    setHasMore((data?.length ?? 0) === 50);
    setLoading(false);
  }, [projectId]);

  const loadMore = useCallback(async (cursor: string) => {
    setLoadingMore(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("project_id", projectId)
      .lt("created_at", cursor)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      setMessages((prev) => [...prev, ...data]);
      setHasMore(data.length === 50);
    }
    setLoadingMore(false);
  }, [projectId]);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel(`messages-${projectId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${projectId}` }, fetch)
      .subscribe();
    const poll = setInterval(fetch, 30_000);
    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [fetch, projectId]);

  return { messages, setMessages, loading, refetch: fetch, hasMore, loadingMore, loadMore };
}

export function useApprovals(projectId: string) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading]     = useState(true);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("approvals")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(50);
    setApprovals(data ?? []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel(`approvals-${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "approvals", filter: `project_id=eq.${projectId}` }, fetch)
      .subscribe();
    const poll = setInterval(fetch, 30_000);
    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [fetch, projectId]);

  return { approvals, setApprovals, loading, refetch: fetch };
}

// Client portal: load project + messages + approvals by share token
export function useClientPortal(token: string) {
  const [project, setProject]               = useState<{ id: string; name: string; client_name: string | null; client_email: string | null; status: string; deadline: string | null; description: string | null; created_at: string | null; freelancer_name: string } | null>(null);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [approvals, setApprovals]           = useState<Approval[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages]         = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const projectIdRef = useRef<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    let projectId: string | null = null;

    async function load() {
      const { data: proj, error: projError } = await supabase
        .from("projects")
        .select("id, name, client_name, client_email, status, deadline, description, created_at")
        .eq("share_token", token)
        .single();

      if (projError || !proj) {
        setError(projError?.code === "PGRST116" ? "not_found" : "error");
        setLoading(false);
        return;
      }

      const p = proj as { id: string; name: string; client_name: string | null; client_email: string | null; status: string; deadline: string | null; description: string | null; created_at: string | null };
      projectId = p.id;
      projectIdRef.current = p.id;

      const [msgRes, apprRes] = await Promise.all([
        supabase.from("messages").select("*").eq("project_id", p.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("approvals").select("*").eq("project_id", p.id).order("created_at", { ascending: false }).limit(50),
      ]);

      const msgs = (msgRes.data ?? []) as Message[];
      const freelancerName = msgs.find((m) => m.role === "freelancer")?.author_name ?? "Your freelancer";
      setProject({ ...p, freelancer_name: freelancerName });
      setMessages(msgs);
      setHasMoreMessages(msgs.length === 50);
      setApprovals((apprRes.data ?? []) as Approval[]);
      setLoading(false);
    }

    async function refetch() {
      if (!projectId) return;
      const [msgRes, apprRes] = await Promise.all([
        supabase.from("messages").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(50),
        supabase.from("approvals").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(50),
      ]);
      if (msgRes.data)  setMessages(msgRes.data);
      if (apprRes.data) setApprovals(apprRes.data);
    }

    load().catch(() => { setError("error"); setLoading(false); }).then(() => {
      if (!projectId) return;

      // Realtime subscriptions — fire once Realtime is enabled on the tables
      const msgChannel  = supabase.channel(`portal-messages-${token}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "messages",  filter: `project_id=eq.${projectId}` }, refetch)
        .subscribe();

      const apprChannel = supabase.channel(`portal-approvals-${token}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "approvals", filter: `project_id=eq.${projectId}` }, refetch)
        .subscribe();

      // 30s fallback poll — safety net only, Realtime handles the rest
      const interval = setInterval(refetch, 30_000);

      // Store cleanup refs on the outer scope so the effect cleanup can reach them
      cleanupRef.msgChannel  = msgChannel;
      cleanupRef.apprChannel = apprChannel;
      cleanupRef.interval    = interval;
    });

    const cleanupRef: { msgChannel?: ReturnType<typeof supabase.channel>; apprChannel?: ReturnType<typeof supabase.channel>; interval?: ReturnType<typeof setInterval> } = {};

    return () => {
      if (cleanupRef.msgChannel)  supabase.removeChannel(cleanupRef.msgChannel);
      if (cleanupRef.apprChannel) supabase.removeChannel(cleanupRef.apprChannel);
      if (cleanupRef.interval)    clearInterval(cleanupRef.interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadMoreMessages = useCallback(async (cursor: string) => {
    if (!projectIdRef.current) return;
    setLoadingMoreMessages(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("project_id", projectIdRef.current)
      .lt("created_at", cursor)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      setMessages((prev) => [...prev, ...data]);
      setHasMoreMessages(data.length === 50);
    }
    setLoadingMoreMessages(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { project, messages, setMessages, approvals, setApprovals, loading, error, hasMoreMessages, loadingMoreMessages, loadMoreMessages };
}
