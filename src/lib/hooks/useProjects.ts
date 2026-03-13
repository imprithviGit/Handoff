"use client";

import { useEffect, useState, useCallback } from "react";
import { getProjects, getProject } from "@/lib/actions/projects";
import type { Project } from "@/lib/supabase/types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await getProjects();
    setProjects(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { projects, setProjects, loading, refetch: fetch };
}

export function useProjectDetail(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProject(id).then(({ data }) => {
      setProject(data);
      setLoading(false);
    });
  }, [id]);

  return { project, setProject, loading };
}
