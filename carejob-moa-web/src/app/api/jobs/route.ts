import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { db, userFromRequest, rateLimit, isDemo } from "@/lib/db/server";
import { getJobs, parseAddr } from "@/lib/repo";
import { bizOf } from "@/lib/db/mappers";
import { FACS, JOB_TYPES, SCHEDS } from "@/lib/constants";

export async function GET(req: Request) {
  const u = new URL(req.url); const gu = u.searchParams.get("gu"); const job = u.searchParams.get("job");
  const list = (await getJobs()).filter(j => (!gu || j.gu === gu) && (!job || j.job === job)).slice(0, 100);
  return NextResponse.json({ count: list.length, jobs: list });
}

const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

/** 기업 공고 등록. 시설 인증 전이면 published=false 로 저장 → 운영자 검수 완료 시 일괄 노출 */
export async function POST(req: Request) {
  if (!rateLimit(req, "post", 10)) return NextResponse.json({ ok: false, msg: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (!b || !s(b.org, 60) || !s(b.pay, 40) || !s(b.hours, 60) || !s(b.addr, 80)) return NextResponse.json({ ok: false, msg: "시설 이름·근무 시간·주소·급여를 입력해 주세요" }, { status: 400 });
  if (!(JOB_TYPES as readonly string[]).includes(b.job) || !(SCHEDS as readonly string[]).includes(b.sched) || !(FACS as readonly string[]).includes(b.fac)) return NextResponse.json({ ok: false, msg: "직종·근무형태·시설 종류를 확인해 주세요" }, { status: 400 });
  if (isDemo()) return NextResponse.json({ ok: true, demo: true, published: false });
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, msg: "기업회원 로그인이 필요합니다" }, { status: 401 });
  const biz = await bizOf(user); if (!biz) return NextResponse.json({ ok: false, msg: "기업회원 가입이 필요합니다" }, { status: 403 });
  const addr = s(b.addr, 80); const { gu, dong } = parseAddr(addr);
  const published = biz.status === "verified";
  const { data, error } = await db()!.from("jobs").insert({
    business_id: biz.id, org: s(b.org, 60), fac: b.fac, job: b.job, sched: b.sched, title: s(b.title, 80) || null, hours: s(b.hours, 60), addr, gu, dong, pay: s(b.pay, 40), contact: s(b.contact, 20),
    ins: !!b.ins, pay_open: !!b.payOpen, no_lic: !!b.noLic, urgent: false, description: s(b.desc, 3000), head: Math.min(99, Math.max(1, Number(b.head) || 1)), published, source: "web",
  }).select("id").single();
  if (error) return NextResponse.json({ ok: false, msg: "저장하지 못했습니다" }, { status: 500 });
  if (b.urgent) await db()!.from("orders").insert({ business_id: biz.id, product: "urgent", count: 1, amount: 7000, job_id: data.id, status: "pending" });
  revalidateTag("jobs");
  return NextResponse.json({ ok: true, id: data.id, published });
}
