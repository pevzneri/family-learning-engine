import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("child_id");
  if (!childId) return NextResponse.json({ error: "child_id required" }, { status: 400 });
  const supabase = getSupabase();
  const { data, error } = await supabase.from("progress").select("*").eq("child_id", childId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ progress: data });
}
export async function PUT(req: NextRequest) {
  try {
    const { child_id, subject, topic_id, updates } = await req.json();
    if (!child_id || !subject || !topic_id || !updates) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const supabase = getSupabase();
    const { unlock_next_topic_id, ...dbUpdates } = updates;
    const { data, error } = await supabase.from("progress").update({ ...dbUpdates, updated_at: new Date().toISOString() }).eq("child_id", child_id).eq("subject", subject).eq("topic_id", topic_id).select("*").single();
    if (error) throw error;
    if (unlock_next_topic_id) { await supabase.from("progress").update({ unlocked: true }).eq("child_id", child_id).eq("subject", subject).eq("topic_id", unlock_next_topic_id); }
    return NextResponse.json({ progress: data });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
