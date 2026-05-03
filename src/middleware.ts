import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/gate" || pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.startsWith("/favicon") || pathname === "/manifest.json" || /\.(jpeg|jpg|png|svg|gif|ico|webp)$/.test(pathname)) return NextResponse.next();
  const gateCookie = request.cookies.get("fle_site_gate")?.value;
  const sitePassword = process.env.SITE_PASSWORD;
  if (sitePassword && gateCookie !== sitePassword) return NextResponse.redirect(new URL("/gate", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
