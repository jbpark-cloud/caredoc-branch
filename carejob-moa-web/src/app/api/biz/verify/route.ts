import { NextResponse } from "next/server";
import { db, userFromRequest, rateLimit } from "@/lib/db/server";
import { bizOf, bizFromRow } from "@/lib/db/mappers";

/** 사업자등록번호 검증식(국세청 체크섬). 오타·임의 숫자를 접수 단계에서 걸러 운영팀 검수 부담을 줄인다 */
function validBizNo(n: string) {
  if (!/^\d{10}$/.test(n)) return false;
  const w = [1, 3, 7, 1, 3, 7, 1, 3, 5]; const d = n.split("").map(Number);
  let sum = 0; for (let i = 0; i < 9; i++) sum += d[i] * w[i];
  sum += Math.floor((d[8] * 5) / 10);
  return (10 - (sum % 10)) % 10 === d[9];
}

/** 시설 인증 요청 → status=pending, 운영자 검수 대기 */
export async function POST(req: Request) {
  if (!rateLimit(req, "bizverify", 5)) return NextResponse.json({ ok: false, msg: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, msg: "로그인이 필요합니다" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const bizno = String(b.bizno || "").replace(/\D/g, ""), ltc = String(b.ltc || "").replace(/[^\d-]/g, "");
  if (bizno && !validBizNo(bizno)) return NextResponse.json({ ok: false, msg: "사업자등록번호를 다시 확인해 주세요 (숫자 10자리)" }, { status: 400 });
  if (!bizno && ltc.replace(/\D/g, "").length < 8) return NextResponse.json({ ok: false, msg: "번호를 확인해 주세요" }, { status: 400 });
  const cur = await bizOf(user); if (!cur) return NextResponse.json({ ok: false, msg: "기업회원 정보가 없습니다" }, { status: 404 });
  if (cur.status === "verified") return NextResponse.json({ ok: true, biz: bizFromRow(cur) });
  const { data, error } = await db()!.from("businesses").update({ bizno: bizno || null, ltc_code: ltc || null, status: "pending", verify_requested_at: new Date().toISOString() }).eq("id", cur.id).select("*").single();
  if (error) return NextResponse.json({ ok: false, msg: "저장하지 못했습니다" }, { status: 500 });
  return NextResponse.json({ ok: true, biz: bizFromRow(data) });
}
