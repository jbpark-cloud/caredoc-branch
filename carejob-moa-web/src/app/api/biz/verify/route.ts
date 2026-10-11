import { NextResponse } from "next/server";
import { db, userFromRequest, rateLimit } from "@/lib/db/server";
import { bizOf, bizFromRow } from "@/lib/db/mappers";

/** 시설 인증 요청 → status=pending, 운영자 검수 대기 */
export async function POST(req: Request) {
  if (!rateLimit(req, "bizverify", 5)) return NextResponse.json({ ok: false, msg: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, msg: "로그인이 필요합니다" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const bizno = String(b.bizno || "").replace(/\D/g, ""), ltc = String(b.ltc || "").replace(/[^\d-]/g, "");
  if (bizno && bizno.length !== 10) return NextResponse.json({ ok: false, msg: "사업자등록번호 10자리를 확인해 주세요" }, { status: 400 });
  if (!bizno && ltc.replace(/\D/g, "").length < 8) return NextResponse.json({ ok: false, msg: "번호를 확인해 주세요" }, { status: 400 });
  const cur = await bizOf(user); if (!cur) return NextResponse.json({ ok: false, msg: "기업회원 정보가 없습니다" }, { status: 404 });
  if (cur.status === "verified") return NextResponse.json({ ok: true, biz: bizFromRow(cur) });
  const { data, error } = await db()!.from("businesses").update({ bizno: bizno || null, ltc_code: ltc || null, status: "pending", verify_requested_at: new Date().toISOString() }).eq("id", cur.id).select("*").single();
  if (error) return NextResponse.json({ ok: false, msg: "저장하지 못했습니다" }, { status: 500 });
  return NextResponse.json({ ok: true, biz: bizFromRow(data) });
}
