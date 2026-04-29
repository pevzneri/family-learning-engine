import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashPassword, createSession } from "@/lib/auth";
export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || !name) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    const supabase = getSupabase();
    const { data: existing } = await supabase.from("parents").select("id").eq("email", email.toLowerCase()).single();
    if (existing) return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    const passwordHash = hashPassword(password);
    const { data: parent, error } = await supabase.from("parents").insert({ email: email.toLowerCase(), password_hash: passwordHash, name }).select("id, email, name").single();
    if (error) throw error;
    const session = createSession(parent.id);
    const res = NextResponse.json({ parent: { id: parent.id, email: parent.email, name: parent.name } });
    res.cookies.set("fle_session", session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60*60*24*30, path: "/" });
    return res;
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
