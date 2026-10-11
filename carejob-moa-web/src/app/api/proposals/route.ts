import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db, insert, userFromRequest, rateLimit, isDemo } from "@/lib/db/server";
import { bizOf } from "@/lib/db/mappers";
import { sendSms, site } from "@/lib/sms";

/** 인재 제안: 구직자에게 문자로 공고 링크 발송 → 구직자가 수락해야 연락처 공개. 미수락 건은 청구하지 않음 */
export async function POST(req: Request) {
  if (!rateLimit(req, "propose", 20)) return NextResponse.json({ ok: false, msg: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (!b || !(b.talentId > 0)) return NextResponse.json({ ok: false }, { status: 400 });
  if (isDemo()) return NextResponse.json(await insert("proposals", { talent_id: b.talentId, count: 1, amount: 5000, status: "requested" }));
  const user = await userFromRequest(req); const biz = user ? await bizOf(user) : null;
  if (!biz) return NextResponse.json({ ok: false, msg: "기업회원 로그인이 필요합니다" }, { status: 401 });
  if (biz.status !== "verified") return NextResponse.json({ ok: false, msg: "시설 인증이 끝난 뒤 제안할 수 있습니다" }, { status: 403 });
  const jobIds: number[] = Array.isArray(b.jobIds) ? b.jobIds.filter((x: unknown) => typeof x === "number").slice(0, 5) : [];
  if (!jobIds.length || typeof b.uid !== "string") return NextResponse.json({ ok: false, msg: "제안할 공고를 골라 주세요" }, { status: 400 });
  const c = db()!;
  const { data: seeker } = await c.from("seekers").select("id,phone,open_to_offers").eq("id", b.uid).maybeSingle();
  if (!seeker?.open_to_offers || !seeker.phone) return NextResponse.json({ ok: false, msg: "연락 동의가 해제된 구직자입니다" }, { status: 404 });
  const { data: jobs } = await c.from("jobs").select("id,job,title").in("id", jobIds).eq("business_id", biz.id);
  let sent = 0;
  for (const j of jobs || []) {
    const dup = await c.from("proposals").select("id").eq("job_id", j.id).eq("seeker_id", seeker.id).maybeSingle();
    if (dup.data) continue;
    const token = crypto.randomBytes(16).toString("hex");
    const { data: row } = await c.from("proposals").insert({ business_id: biz.id, talent_id: b.talentId, seeker_id: seeker.id, job_id: j.id, count: 1, amount: 5000, status: "sent", token }).select("id").single();
    if (row) { await sendSms(seeker.phone, `[케어잡모아] ${biz.org}에서 ${j.job} 일자리를 제안했습니다. 공고 보고 수락하기: ${site(`/offer/${row.id}`)}?t=${token}`); sent++; }
  }
  return NextResponse.json({ ok: true, sent });
}
