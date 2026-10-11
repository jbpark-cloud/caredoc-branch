import { NextResponse } from "next/server";
import { db, rateLimit } from "@/lib/db/server";
import { sendSms, site } from "@/lib/sms";

/** 구직자의 제안 수락/거절 (문자 링크의 토큰으로 본인 확인) */
export async function POST(req: Request) {
  if (!rateLimit(req, "offer", 20)) return NextResponse.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const c = db(); if (!c) return NextResponse.json({ ok: false, msg: "시범 운영 중입니다" }, { status: 503 });
  const { data: p } = await c.from("proposals").select("id,token,status,seeker_id,business_id,job_id").eq("id", Number(b.id) || 0).maybeSingle();
  if (!p || !b.t || p.token !== b.t) return NextResponse.json({ ok: false, msg: "링크가 올바르지 않습니다" }, { status: 404 });
  if (p.status !== "sent") return NextResponse.json({ ok: true, status: p.status });
  const accept = b.action === "accept";
  await c.from("proposals").update({ status: accept ? "accepted" : "declined", accepted_at: accept ? new Date().toISOString() : null }).eq("id", p.id);
  if (accept) {
    const [{ data: s }, { data: biz }, { data: job }] = await Promise.all([
      c.from("seekers").select("name,phone,lic").eq("id", p.seeker_id).maybeSingle(),
      c.from("businesses").select("manager_phone,org").eq("id", p.business_id).maybeSingle(),
      c.from("jobs").select("org,job").eq("id", p.job_id).maybeSingle(),
    ]);
    if (s && job) await c.from("applications").upsert({ job_id: p.job_id, business_id: p.business_id, job_org: job.org, seeker_id: p.seeker_id, name: s.name, phone: s.phone, lic: s.lic || [], source: "proposal", consent_at: new Date().toISOString() }, { onConflict: "job_id,phone" });
    if (biz?.manager_phone && s) await sendSms(biz.manager_phone, `[케어잡모아] ${s.name}님이 ${job?.job || ""} 제안을 수락했습니다. 연락처 확인: ${site("/biz")}`);
  }
  return NextResponse.json({ ok: true, status: accept ? "accepted" : "declined" });
}
