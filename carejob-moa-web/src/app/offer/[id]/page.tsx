import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db/server";
import OfferActions from "@/components/OfferActions";
import { jobPath } from "@/lib/seo";
import { getJob } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "일자리 제안", robots: { index: false, follow: false } };

export default async function OfferPage({ params, searchParams }: { params: { id: string }; searchParams: { t?: string } }) {
  const c = db();
  const fail = <div style={{ paddingBlock: 48 }} className="stack"><h1>제안을 찾을 수 없어요</h1><p className="muted">링크가 만료되었거나 주소가 잘못되었습니다.</p><Link className="btn pri pill" style={{ alignSelf: "flex-start" }} href="/jobs">다른 일자리 보기</Link></div>;
  if (!c) return fail;
  const { data: p } = await c.from("proposals").select("id,token,status,job_id,businesses(org,grade)").eq("id", Number(params.id) || 0).maybeSingle();
  if (!p || p.token !== searchParams.t) return fail;
  const job = await getJob(p.job_id as number);
  const org = (p.businesses as unknown as { org: string; grade: string | null } | null)?.org || job?.org || "시설";
  return <div style={{ paddingBlock: 32, maxWidth: 640 }} className="stack">
    <span className="tag or" style={{ alignSelf: "flex-start" }}>일자리 제안</span>
    <h1>{org}에서 함께 일하자고 제안했어요</h1>
    {job ? <div className="card stack"><h3>{job.title}</h3><p>{job.area} · {job.hours.filter(Boolean).join(" · ")}</p><p style={{ fontSize: 20 }}><b>{job.pay}</b></p><Link href={jobPath(job)} className="lnk" style={{ margin: 0 }}>공고 자세히 보기 →</Link></div> : <p className="muted">공고가 마감되었을 수 있습니다.</p>}
    <p className="muted">수락하시면 이름·휴대전화·자격이 {org}에 전달되고, 시설에서 연락드립니다. 거절해도 불이익은 없어요.</p>
    <OfferActions id={p.id as number} t={searchParams.t!} initial={p.status as string} />
  </div>;
}
