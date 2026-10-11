import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { db, insert, userFromRequest, rateLimit, isDemo } from "@/lib/db/server";
import { getJob } from "@/lib/repo";
import { sendSms, site } from "@/lib/sms";

export async function POST(req: Request) {
  if (!rateLimit(req, "apply", 8)) return NextResponse.json({ ok: false, msg: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (!b || b.website) return NextResponse.json({ ok: true }); // honeypot
  const phone = String(b.phone ?? "").replace(/\D/g, "");
  const name = String(b.name ?? "").trim();
  if (typeof b.jobId !== "number" || !name || name.length > 40 || !/^01\d{8,9}$/.test(phone)) return NextResponse.json({ ok: false, msg: "이름과 휴대전화 번호를 확인해 주세요" }, { status: 400 });
  if (b.consent !== true) return NextResponse.json({ ok: false, msg: "개인정보 수집·이용 및 제공 동의가 필요합니다" }, { status: 400 });
  const job = await getJob(b.jobId); if (!job) return NextResponse.json({ ok: false, msg: "마감되었거나 없는 공고입니다" }, { status: 404 });
  if (isDemo()) return NextResponse.json({ ok: true, demo: true });
  const user = await userFromRequest(req);
  const c = db()!;
  const { data: jr } = await c.from("jobs").select("business_id").eq("id", job.id).maybeSingle();
  const dup = await c.from("applications").select("id").eq("job_id", job.id).eq("phone", phone).maybeSingle();
  if (dup.data) return NextResponse.json({ ok: true, dup: true });
  const proxy = b.proxyPhone ? String(b.proxyPhone).replace(/\D/g, "").slice(0, 11) : null;
  const r = await insert("applications", { job_id: job.id, business_id: jr?.business_id ?? null, job_org: job.org, seeker_id: user?.id ?? null, name, phone, proxy_phone: proxy, lic: Array.isArray(b.lic) ? b.lic.slice(0, 10) : [], open_to_offers: !!b.openToOffers, consent_at: new Date().toISOString(), source: "web" });
  if (r.ok && jr?.business_id) {
    const { data: biz } = await c.from("businesses").select("manager_phone,org").eq("id", jr.business_id).maybeSingle();
    if (biz?.manager_phone) await sendSms(biz.manager_phone, `[케어잡모아] ${job.job} 공고에 새 지원자 ${name}님(${(Array.isArray(b.lic) && b.lic[0]) || "자격 확인 필요"}). 연락처 확인: ${site("/biz")}`);
  }
  if (r.ok && user) await c.from("seekers").upsert({ id: user.id, name, phone, lic: Array.isArray(b.lic) ? b.lic.slice(0, 10) : [], open_to_offers: !!b.openToOffers, gu: job.gu, want_job: job.job, updated_at: new Date().toISOString() });
  revalidateTag("jobs");
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
