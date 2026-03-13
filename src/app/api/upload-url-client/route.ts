import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { shareToken, filename } = await req.json();
  if (!shareToken || !filename) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = createServiceClient();

  // Validate share token
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("share_token", shareToken)
    .single();

  if (!project) return NextResponse.json({ error: "Invalid link" }, { status: 403 });

  const ext  = filename.split(".").pop() ?? "bin";
  const path = `${project.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("project-files")
    .createSignedUploadUrl(path);

  if (error || !data) return NextResponse.json({ error: error?.message }, { status: 500 });

  return NextResponse.json({ signedUrl: data.signedUrl, path, token: data.token });
}
