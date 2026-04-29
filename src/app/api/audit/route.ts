import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getParentIdFromCookies } from "@/lib/auth";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { child_id, action, detail } = body;
    const parentId = getParentIdFromCookies();
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const device = req.headers.get("user-agent") || "unknown";
    const supabase = getSupabase();
    await supabase.from("audit_log").insert({ parent_id: parentId, child_id: child_id || null, action, detail: detail || "", ip_address: ip, device_info: device.substring(0, 500) });
    return NextResponse.json({ ok: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
export async function GET() {
  const parentId = getParentIdFromCookies();
  if (!parentId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const supabase = getSupabase();
  const { data, error } = await supabase.from("audit_log").select("*").eq("parent_id", parentId).order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data });
}
