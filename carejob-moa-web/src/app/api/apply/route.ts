import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { db, insert, userFromRequest, rateLimit, isDemo, cleanName } from "@/lib/db/server";
import { getJob } from "@/lib/repo";
import { phoneOfUser } from "@/lib/db/mappers";
import { sendSms, site } from "@/lib/sms";
import { LIC_OPTIONS } from "@/lib/constants";

const bad = (msg: string, status = 400, extra: Record<string, unknown> = {}) => NextResponse.json({ ok: false, msg, ...extra }, { status });

export async function POST(req: Request) {
  if (!rateLimit(req, "apply", 8)) return bad("잠시 후 다시 시도해 주세요", 429);
  const b = await req.json().catch(() => null);
  if (!b || b.website) return NextResponse.json({ ok: true }); // honeypot
  const phone = String(b.phone ?? "").replace(/\D/g, "");
  const name = cleanName(b.name);
  if (typeof b.jobId !== "number" || !name || !/^01\d{8,9}$/.test(phone)) return bad("이름과 휴대전화 번호를 확인해 주세요");
  if (b.consent !== true) return bad("개인정보 수집·이용 및 제공 동의가 필요합니다");
  const job = await getJob(b.jobId);
  if (!job || job.closed) return bad("마감되었거나 없는 공고입니다", 404);
  if (isDemo()) return NextResponse.json({ ok: true, demo: true });

  // 실서비스: 본인 확인(문자 인증·카카오)을 마친 사람만 지원할 수 있다. 문자 인증 사용자는 인증한 번호로만.
  const user = await userFromRequest(req);
  if (!user) return bad("본인 확인이 필요합니다. 문자 인증 후 다시 지원해 주세요", 401, { needAuth: true });
  const verified = phoneOfUser(user);
  if (verified && verified !== phone) return bad("인증한 휴대전화 번호로만 지원할 수 있습니다", 403, { needAuth: true });

  // 자격은 정해진 선택지만 받는다(문자 본문에 임의 글자를 넣지 못하게)
  const lic: string[] = Array.isArray(b.lic) ? LIC_OPTIONS.filter(o => o !== "아직 없어요" && b.lic.includes(o)) : [];
  const proxyRaw = b.proxyPhone ? String(b.proxyPhone).replace(/\D/g, "") : "";
  const proxy = /^0\d{8,10}$/.test(proxyRaw) ? proxyRaw : null;

  const c = db()!;
  const { data: jr } = await c.from("jobs").select("business_id").eq("id", job.id).maybeSingle();
  const dup = await c.from("applications").select("id").eq("job_id", job.id).eq("phone", phone).maybeSingle();
  if (dup.data) return NextResponse.json({ ok: true, dup: true });
  // 프로필의 전화번호는 '인증된 번호'만 저장한다(남의 번호를 내 프로필에 올리지 못하게). applications.seeker_id 가 seekers 를 참조하므로 먼저 만든다
  const { error: seekerErr } = await c.from("seekers").upsert({ id: user.id, name, ...(verified ? { phone: verified } : {}), lic, open_to_offers: !!b.openToOffers && !!verified, gu: job.gu, want_job: job.job, updated_at: new Date().toISOString() });
  if (seekerErr) console.error("[apply] seeker", seekerErr.message);
  const r = await insert("applications", { job_id: job.id, business_id: jr?.business_id ?? null, job_org: job.org, seeker_id: seekerErr ? null : user.id, name, phone, proxy_phone: proxy, lic, open_to_offers: !!b.openToOffers, consent_at: new Date().toISOString(), source: "web" });
  if (r.ok && jr?.business_id) {
    const { data: biz } = await c.from("businesses").select("manager_phone,org").eq("id", jr.business_id).maybeSingle();
    if (biz?.manager_phone) await sendSms(biz.manager_phone, `[케어잡모아] ${job.job} 공고에 새 지원자 ${name}님(${lic[0] || "자격 확인 필요"}). 연락처 확인: ${site("/biz")}`);
  }
  revalidateTag("jobs");
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
