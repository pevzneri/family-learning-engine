import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getParentIdFromCookies } from "@/lib/auth";
export async function POST(req: NextRequest) {
  const parentId = getParentIdFromCookies();
  if (!parentId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { pin } = await req.json();
  const supabase = getSupabase();
  const { data } = await supabase.from("parents").select("parent_pin").eq("id", parentId).single();
  if (!data?.parent_pin) return NextResponse.json({ ok: true, needsSetup: true });
  if (data.parent_pin === pin) return NextResponse.json({ ok: true });
  return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
}
export async function PUT(req: NextRequest) {
  const parentId = getParentIdFromCookies();
  if (!parentId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { pin } = await req.json();
  if (!pin || pin.length < 4) return NextResponse.json({ error: "PIN must be at least 4 digits" }, { status: 400 });
  const supabase = getSupabase();
  await supabase.from("parents").update({ parent_pin: pin }).eq("id", parentId);
  return NextResponse.json({ ok: true });
}
