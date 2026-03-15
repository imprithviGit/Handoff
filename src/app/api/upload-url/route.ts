import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, filename } = await req.json();
  if (!projectId || !filename) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const ext  = filename.split(".").pop() ?? "bin";
  const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from("project-files")
    .createSignedUploadUrl(path);

  if (error || !data) { console.error("Upload URL error:", error); return NextResponse.json({ error: "Failed to generate upload URL." }, { status: 500 }); }

  return NextResponse.json({ signedUrl: data.signedUrl, path, token: data.token });
}
