import { NextResponse } from "next/server";
import { db, userFromRequest } from "@/lib/db/server";
import { bizOf, seekerOf, seekerFromRow, bizFromRow, phoneOfUser } from "@/lib/db/mappers";

export const dynamic = "force-dynamic";

/** 현재 로그인 사용자의 구직자·기업 정보. 전화 인증 사용자는 seekers 행을 자동 생성, 가입 메타데이터가 있는 기업은 businesses 행 자동 생성 */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ seeker: null, biz: null });
  const c = db()!;
  const meta = (user.user_metadata || {}) as Record<string, string>;
  let s = await seekerOf(user);
  const phone = phoneOfUser(user);
  if (!s && phone && meta.role !== "biz") {
    const { data } = await c.from("seekers").insert({ id: user.id, phone, name: "회원" }).select("*").single();
    s = data;
  }
  let b = await bizOf(user);
  if (!b && meta.role === "biz" && meta.org) {
    const { data } = await c.from("businesses").insert({ owner_id: user.id, org: meta.org, fac: meta.fac || "방문요양", manager_name: meta.manager_name || "담당자", manager_phone: meta.manager_phone || "", email: user.email, status: "none" }).select("*").single();
    b = data;
  }
  const kakaoName = (meta.name || meta.full_name || meta.nickname) as string | undefined;
  return NextResponse.json({
    seeker: s ? seekerFromRow(s) : (meta.role !== "biz" && user.app_metadata?.provider === "kakao" ? { name: kakaoName || "회원", phone: "", lic: [], caredoc: false, open: false } : null),
    biz: b ? bizFromRow(b) : null,
  });
}
