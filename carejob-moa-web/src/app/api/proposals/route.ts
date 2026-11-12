import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db, userFromRequest, rateLimit, isDemo, isUuid } from "@/lib/db/server";
import { bizOf } from "@/lib/db/mappers";
import { sendSms, site } from "@/lib/sms";

const DAILY_CAP = 30; // 시설 1곳이 하루에 보낼 수 있는 제안 문자 수(구직자 보호)

/** 인재 제안: 구직자에게 문자로 공고 링크 발송 → 구직자가 수락해야 연락처 공개. 미수락 건은 청구하지 않음 */
export async function POST(req: Request) {
  if (!rateLimit(req, "propose", 20)) return NextResponse.json({ ok: false, msg: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (!b || !(b.talentId > 0)) return NextResponse.json({ ok: false }, { status: 400 });
  if (isDemo()) return NextResponse.json({ ok: true, demo: true, sent: 0 });
  const user = await userFromRequest(req); const biz = user ? await bizOf(user) : null;
  if (!biz) return NextResponse.json({ ok: false, msg: "기업회원 로그인이 필요합니다" }, { status: 401 });
  if (biz.status !== "verified") return NextResponse.json({ ok: false, msg: "시설 인증이 끝난 뒤 제안할 수 있습니다" }, { status: 403 });
  const jobIds: number[] = Array.isArray(b.jobIds) ? b.jobIds.filter((x: unknown) => typeof x === "number" && x > 0).slice(0, 3) : [];
  if (!jobIds.length || !isUuid(b.uid)) return NextResponse.json({ ok: false, msg: "제안할 공고를 골라 주세요" }, { status: 400 });
  const c = db()!;
  const { data: seeker } = await c.from("seekers").select("id,phone,open_to_offers").eq("id", b.uid).maybeSingle();
  if (!seeker?.open_to_offers || !seeker.phone) return NextResponse.json({ ok: false, msg: "연락 동의가 해제된 구직자입니다" }, { status: 404 });

  const since = new Date(Date.now() - 864e5).toISOString();
  const { count: today } = await c.from("proposals").select("id", { count: "exact", head: true }).eq("business_id", biz.id).gt("created_at", since);
  let left = DAILY_CAP - (today || 0);
  if (left <= 0) return NextResponse.json({ ok: false, msg: `제안은 하루 ${DAILY_CAP}건까지 보낼 수 있습니다. 내일 다시 시도해 주세요` }, { status: 429 });
  // 같은 구직자에게는 하루 한 번만 문자를 보낸다
  const { count: sameSeeker } = await c.from("proposals").select("id", { count: "exact", head: true }).eq("business_id", biz.id).eq("seeker_id", seeker.id).gt("created_at", since);
  if (sameSeeker) return NextResponse.json({ ok: false, msg: "이 구직자에게는 오늘 이미 제안을 보냈습니다" }, { status: 409 });

  // 노출 중인 우리 공고만 제안할 수 있다
  const { data: jobs } = await c.from("jobs").select("id,job,title").in("id", jobIds).eq("business_id", biz.id).eq("published", true).is("closed_at", null);
  let sent = 0; let first: { id: number; token: string; job: string } | null = null;
  for (const j of jobs || []) {
    if (left <= 0) break;
    const dup = await c.from("proposals").select("id").eq("job_id", j.id).eq("seeker_id", seeker.id).maybeSingle();
    if (dup.data) continue;
    const token = crypto.randomBytes(16).toString("hex");
    const { data: row } = await c.from("proposals").insert({ business_id: biz.id, talent_id: b.talentId, seeker_id: seeker.id, job_id: j.id, count: 1, amount: 5000, status: "sent", token }).select("id").single();
    if (row) { sent++; left--; if (!first) first = { id: row.id as number, token, job: j.job as string }; }
  }
  if (!sent) return NextResponse.json({ ok: false, msg: jobs?.length ? "이미 제안한 공고입니다" : "노출 중인 공고만 제안할 수 있습니다" }, { status: 400 });
  // 여러 공고를 골라도 문자는 한 통(첫 공고 링크)만
  if (first) await sendSms(seeker.phone, `[케어잡모아] ${biz.org}에서 ${first.job} 일자리를 제안했습니다${sent > 1 ? ` (외 ${sent - 1}건)` : ""}. 공고 보고 수락하기: ${site(`/offer/${first.id}`)}?t=${first.token}`);
  return NextResponse.json({ ok: true, sent });
}
