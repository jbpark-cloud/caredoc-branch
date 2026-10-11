import { NextResponse } from "next/server";
import { insert } from "@/lib/db/server";
import { getJobs } from "@/lib/repo";

export async function GET(req: Request) {
  const u = new URL(req.url); const gu = u.searchParams.get("gu"); const job = u.searchParams.get("job");
  const list = getJobs().filter(j => (!gu || j.gu === gu) && (!job || j.job === job)).slice(0, 100);
  return NextResponse.json({ count: list.length, jobs: list });
}

/** 기업 공고 등록. 인증 전(status!=='verified')이면 published=false 로 저장 → 검수 완료 시 노출 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || !b.org || !b.job || !b.pay) return NextResponse.json({ ok: false, msg: "필수 항목 누락" }, { status: 400 });
  const r = await insert("jobs", { org: b.org, fac: b.fac, job: b.job, sched: b.sched, hours: b.hours, addr: b.addr, pay: b.pay, contact: b.contact, ins: !!b.ins, pay_open: !!b.payOpen, no_lic: !!b.noLic, urgent: !!b.urgent, description: b.desc ?? "", published: b.bizStatus === "verified", source: "web" });
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
