import { NextResponse } from "next/server";
import { db, userFromRequest, cleanLine, cleanName } from "@/lib/db/server";
import { FACS } from "@/lib/constants";
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
    // user_metadata 는 가입자가 직접 넣는 값이다 → 길이·형식을 정리해서 저장
    const org = cleanLine(meta.org, 60);
    const fac = (FACS as readonly string[]).includes(meta.fac) ? meta.fac : "방문요양";
    const { data } = org ? await c.from("businesses").insert({ owner_id: user.id, org, fac, manager_name: cleanName(meta.manager_name, 30) || "담당자", manager_phone: String(meta.manager_phone || "").replace(/\D/g, "").slice(0, 11), email: user.email, status: "none" }).select("*").single() : { data: null };
    b = data;
  }
  const kakaoName = cleanName(meta.name || meta.full_name || meta.nickname) || undefined;
  return NextResponse.json({
    seeker: s ? seekerFromRow(s) : (meta.role !== "biz" && user.app_metadata?.provider === "kakao" ? { name: kakaoName || "회원", phone: "", lic: [], caredoc: false, open: false } : null),
    biz: b ? bizFromRow(b) : null,
  });
}
