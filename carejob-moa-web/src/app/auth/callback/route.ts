import { NextResponse } from "next/server";
/** Supabase 카카오 OAuth 리다이렉트 수신. 세션은 클라이언트 SDK(detectSessionInUrl)가 처리하므로 next 로 돌려보내기만 한다. */
export function GET(req: Request) { const u = new URL(req.url); const next = u.searchParams.get("next") || "/"; return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", u.origin)); }
