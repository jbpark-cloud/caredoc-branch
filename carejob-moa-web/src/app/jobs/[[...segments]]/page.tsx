import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getJob, getJobs, isDemo } from "@/lib/repo";
import { filterJobs, filterFromUrl, urlFromFilter } from "@/lib/filter";
import { meta, jobPath, parseIdSlug, breadcrumbLD, safeDecode } from "@/lib/seo";
import { HUB_GU, HUB_JOBS } from "@/lib/constants";
import JobDetail from "@/components/JobDetail";
import { JobCard, ListTable } from "@/components/jobs";
import { FilterPanel, ListHeadControls, AlertButton } from "@/components/search/FilterPanel";
import { JsonLd } from "@/components/ui";

type SP = Record<string, string | string[] | undefined>;
interface Props { params: { segments?: string[] }; searchParams: SP }

const isDetail = (seg?: string[]) => !!seg && seg.length === 1 && /^\d+(-|$)/.test(safeDecode(seg[0]));

export const revalidate = 60;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  if (isDetail(params.segments)) {
    const j = await getJob(parseIdSlug(params.segments![0])!);
    if (!j) return { title: "공고를 찾을 수 없습니다" };
    return meta(`${j.org} ${j.job} 채용 · ${j.pay} · ${j.area}`, `${j.title}. ${j.hours.filter(Boolean).join(" ")}, ${j.pay}. ${j.grade ? "건강보험공단 평가 " + j.grade + "등급, " : ""}${j.ins ? "4대보험 가입" : ""}. 회원가입 없이 전화번호로 1분 지원.`, jobPath(j));
  }
  const f = filterFromUrl(params.segments ?? [], searchParams);
  const gu = f.gu !== "전체" ? f.gu : "서울", job = f.job.length === 1 ? f.job[0] : f.noLic ? "자격증 없이 가능한 돌봄" : "요양·돌봄";
  const n = filterJobs(await getJobs(), f).length;
  const canonical = urlFromFilter({ ...f, q: "", sort: "near", view: "list" }).split("?")[0];
  const hasQuery = !!(f.q || f.sched.length || f.fac.length || f.job.length > 1 || f.sort !== "near" || f.view === "card");
  return meta(`${gu} ${job} 구인 ${n}건`, `${gu} ${job} 채용공고 ${n}건. 도보·버스 거리, 오전·주3일·야간 근무형태, 4대보험·급여 공개 여부까지 한눈에.`, canonical, hasQuery ? { robots: { index: false, follow: true } } : {});
}

export default async function JobsPage({ params, searchParams }: Props) {
  if (isDetail(params.segments)) {
    const j = await getJob(parseIdSlug(params.segments![0])!);
    if (!j) notFound();
    const canon = jobPath(j);
    if ("/jobs/" + safeDecode(params.segments![0]) !== canon) permanentRedirect(encodeURI(canon));
    return <JobDetail j={j} demo={isDemo()} />;
  }
  const f = filterFromUrl(params.segments ?? [], searchParams);
  const limit = Math.max(40, parseInt(String(searchParams.limit ?? "40"), 10) || 40);
  const list = filterJobs(await getJobs(), f);
  const shown = list.slice(0, limit);
  const guLabel = f.gu === "전체" ? "서울" : f.gu;
  const title = `${guLabel}${f.q ? " " + f.q : ""} ${f.job.length === 1 ? f.job[0] + " " : ""}${f.noLic && f.job.length !== 1 ? "자격증 없이 가능한 " : ""}일자리`;
  const moreHref = urlFromFilter(f) + (urlFromFilter(f).includes("?") ? "&" : "?") + `limit=${limit + 40}`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "일자리", path: "/jobs" }, ...(f.gu !== "전체" ? [{ name: f.gu, path: `/jobs/${f.gu}` }] : []), ...(f.job.length === 1 ? [{ name: f.job[0], path: `/jobs${f.gu !== "전체" ? "/" + f.gu : ""}/${f.job[0]}` }] : [])];

  return (
    <div className="search">
      <JsonLd data={breadcrumbLD(crumbs)} />
      <FilterPanel filter={f} />
      <section>
        <nav className="crumb" aria-label="경로">{crumbs.map((c, i) => i < crumbs.length - 1 ? <span key={c.path} style={{ display: "contents" }}><Link href={c.path}>{c.name}</Link><span>›</span></span> : <b key={c.path}>{c.name}</b>)}</nav>
        <div className="listhead"><h1 style={{ fontSize: 22 }}>{title} <span className="muted" style={{ fontSize: 18 }}>{list.length}건</span></h1><ListHeadControls filter={f} /></div>
        {list.length ? <>
          {f.view === "card" ? <div className="grid g2">{shown.map(j => <JobCard key={j.id} j={j} />)}</div> : <ListTable jobs={shown} />}
          {list.length > limit && <Link className="btn out wide" style={{ marginTop: 16 }} href={moreHref} scroll={false}>공고 더 보기 ({list.length - limit}건 남음)</Link>}
          <div className="card" style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><b>이 조건의 새 공고, 문자로 받을까요?</b><p className="small muted">매일 아침 한 번만 보내드립니다. 내 정보에서 언제든 끌 수 있어요.</p></div><AlertButton label={`${guLabel} ${f.job.length === 1 ? f.job[0] + " " : ""}${f.sched.join("·") || "전체"}`} filter={f} /></div>
        </> : <div className="empty"><p style={{ fontSize: 20, color: "var(--title)" }}>조건에 맞는 공고가 아직 없어요</p><p>조건을 하나 줄여 보시거나, 새 공고가 올라오면 문자로 알려드릴까요?</p><AlertButton label={`${guLabel} ${f.job.length === 1 ? f.job[0] + " " : ""}${f.sched.join("·") || "전체"}`} filter={f} /></div>}
        {f.gu !== "전체" && f.job.length !== 1 && <div className="card" style={{ marginTop: 24 }}><h3 style={{ marginBottom: 8 }}>{f.gu} 직종별 공고</h3><div className="chips">{HUB_JOBS.map(t => <Link key={t} className="chip" href={`/jobs/${f.gu}/${t}`}>{f.gu} {t}</Link>)}</div></div>}
        {f.job.length === 1 && <div className="card" style={{ marginTop: 24 }}><h3 style={{ marginBottom: 8 }}>다른 지역 {f.job[0]} 공고</h3><div className="chips">{HUB_GU.filter(g => g !== f.gu).map(g => <Link key={g} className="chip" href={`/jobs/${g}/${f.job[0]}`}>{g}</Link>)}</div></div>}
      </section>
    </div>
  );
}
