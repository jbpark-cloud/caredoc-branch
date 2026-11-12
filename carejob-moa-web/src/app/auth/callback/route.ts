import { NextResponse } from "next/server";
/** Supabase 카카오 OAuth·이메일 확인 리다이렉트 수신. 세션은 클라이언트 SDK(detectSessionInUrl)가 처리하므로 next 로 돌려보내기만 한다. */
export function GET(req: Request) {
  const u = new URL(req.url); const next = u.searchParams.get("next") || "/";
  // 같은 사이트 안의 경로만 허용: "//evil.com", "/\\evil.com" 같은 외부 주소로 새는 것을 막는다
  const safe = /^\/(?![\/\\])/.test(next) && !/[\u0000-\u001f]/.test(next) ? next : "/";
  const to = new URL(safe, u.origin);
  return NextResponse.redirect(to.origin === u.origin ? to : new URL("/", u.origin));
}
