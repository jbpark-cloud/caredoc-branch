import { NextResponse } from "next/server";
import { db, userFromRequest, rateLimit } from "@/lib/db/server";
import { bizOf, bizFromRow } from "@/lib/db/mappers";
import { FACS } from "@/lib/constants";

/** 로그인(카카오 등) 사용자의 기업회원 등록 */
export async function POST(req: Request) {
  if (!rateLimit(req, "bizjoin", 5)) return NextResponse.json({ ok: false, msg: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, msg: "로그인이 필요합니다" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.org || !b.name) return NextResponse.json({ ok: false, msg: "시설 이름과 담당자를 입력해 주세요" }, { status: 400 });
  const exist = await bizOf(user); if (exist) return NextResponse.json({ ok: true, biz: bizFromRow(exist) });
  const { data, error } = await db()!.from("businesses").insert({ owner_id: user.id, org: String(b.org).slice(0, 60), fac: (FACS as readonly string[]).includes(b.fac) ? b.fac : "방문요양", manager_name: String(b.name).slice(0, 30), manager_phone: String(b.phone || "").replace(/\D/g, "").slice(0, 11), email: user.email }).select("*").single();
  if (error) return NextResponse.json({ ok: false, msg: "가입 정보를 저장하지 못했습니다" }, { status: 500 });
  return NextResponse.json({ ok: true, biz: bizFromRow(data) });
}
