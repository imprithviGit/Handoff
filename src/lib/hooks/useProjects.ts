"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/supabase/types";

const OWNER_ID = "00000000-0000-0000-0000-000000000001";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", OWNER_ID)
      .order("deadline", { ascending: true, nullsFirst: false });

    setProjects(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel("projects")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  return { projects, setProjects, loading, refetch: fetch };
}

export function useProjectDetail(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => { setProject(data); setLoading(false); });
  }, [id]);

  return { project, setProject, loading };
}
