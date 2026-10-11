import { NextResponse } from "next/server";
import { insert } from "@/lib/db/server";
import { getJob } from "@/lib/repo";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b.jobId !== "number" || !b.name || !/^\d{10,11}$/.test(String(b.phone ?? ""))) return NextResponse.json({ ok: false, msg: "이름과 전화번호를 확인해 주세요" }, { status: 400 });
  const job = getJob(b.jobId); if (!job) return NextResponse.json({ ok: false, msg: "공고가 없습니다" }, { status: 404 });
  const r = await insert("applications", { job_id: b.jobId, job_org: job.org, name: String(b.name).slice(0, 40), phone: String(b.phone), proxy_phone: b.proxyPhone ? String(b.proxyPhone) : null, lic: Array.isArray(b.lic) ? b.lic : [], open_to_offers: !!b.openToOffers, source: "web" });
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
