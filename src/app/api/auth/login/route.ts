import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyPassword, createSession } from "@/lib/auth";
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    const supabase = getSupabase();
    const { data: parent, error } = await supabase.from("parents").select("id, email, name, password_hash").eq("email", email.toLowerCase()).single();
    if (error || !parent) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    if (!verifyPassword(password, parent.password_hash)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    const session = createSession(parent.id);
    const res = NextResponse.json({ parent: { id: parent.id, email: parent.email, name: parent.name } });
    res.cookies.set("fle_session", session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60*60*24*30, path: "/" });
    return res;
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
