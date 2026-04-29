import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getParentIdFromCookies } from "@/lib/auth";
import { buildProgressDefaults } from "@/lib/curriculum";
import { GradeBand } from "@/lib/types";
export async function GET() {
  const parentId = getParentIdFromCookies();
  if (!parentId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const supabase = getSupabase();
  const { data, error } = await supabase.from("children").select("*").eq("parent_id", parentId).order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ children: data });
}
export async function POST(req: NextRequest) {
  const parentId = getParentIdFromCookies();
  if (!parentId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, pin, avatar, grade_band, learning_style, notes, interests } = body;
    if (!name || !pin) return NextResponse.json({ error: "Name and PIN required" }, { status: 400 });
    const supabase = getSupabase();
    const { data: child, error } = await supabase.from("children").insert({ parent_id: parentId, name, pin, avatar: avatar || "🦊", grade_band: grade_band || "2-3", learning_style: learning_style || "visual", notes: notes || "", interests: interests || "" }).select("*").single();
    if (error) throw error;
    const defaults = buildProgressDefaults((grade_band || "2-3") as GradeBand);
    const progressRows = defaults.map((d) => ({ child_id: child.id, subject: d.subject, topic_id: d.topic_id, unlocked: d.unlocked, mastered: false, level: 1, correct: 0, total: 0, streak: 0, best_streak: 0 }));
    await supabase.from("progress").insert(progressRows);
    return NextResponse.json({ child });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
export async function PUT(req: NextRequest) {
  const parentId = getParentIdFromCookies();
  if (!parentId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const body = await req.json();
    const { id, name, pin, avatar, grade_band, learning_style, notes, interests } = body;
    const supabase = getSupabase();
    const { data: existing } = await supabase.from("children").select("id, grade_band").eq("id", id).eq("parent_id", parentId).single();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const gradeChanged = existing.grade_band !== grade_band;
    const { data: child, error } = await supabase.from("children").update({ name, pin, avatar, grade_band, learning_style, notes, interests }).eq("id", id).select("*").single();
    if (error) throw error;
    if (gradeChanged) {
      await supabase.from("progress").delete().eq("child_id", id);
      const defaults = buildProgressDefaults(grade_band as GradeBand);
      const progressRows = defaults.map((d) => ({ child_id: id, subject: d.subject, topic_id: d.topic_id, unlocked: d.unlocked, mastered: false, level: 1, correct: 0, total: 0, streak: 0, best_streak: 0 }));
      await supabase.from("progress").insert(progressRows);
    }
    return NextResponse.json({ child });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
export async function DELETE(req: NextRequest) {
  const parentId = getParentIdFromCookies();
  if (!parentId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const supabase = getSupabase();
  const { error } = await supabase.from("children").delete().eq("id", id).eq("parent_id", parentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
