import Link from "next/link";
import type { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";
import { Ico, JsonLd } from "@/components/ui";
import { getJobs } from "@/lib/repo";
import { GUIDES, guideShort } from "@/lib/data/guides";
import { HUB_GU, HUB_JOBS, SITE_URL, SITE_NAME } from "@/lib/constants";
import { meta } from "@/lib/seo";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const n = (await getJobs()).length;
  return meta("케어잡모아 — 우리 동네 요양·돌봄 일자리 | 요양보호사·간병인 구인", `서울 요양보호사·간병인·사회복지사 일자리 ${n}건. 집 근처·근무 시간·공단 평가등급으로 찾고 전화번호만으로 지원하세요.`, "/");
}

export default async function HomePage() {
  const jobs = await getJobs();
  const ld = { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/jobs?q={search_term_string}`, "query-input": "required name=search_term_string" } };
  return <>
    <JsonLd data={ld} />
    <HomeClient jobs={jobs} />
    <div className="sec-t"><div><h2>지역별 · 직종별 채용정보 바로가기</h2><p className="muted small">검색엔진 색인용 내부 링크 허브</p></div></div>
    <div className="card linkhub">{HUB_GU.map(g => <div key={g}><b>{g}</b>{HUB_JOBS.map(t => <Link key={t} href={`/jobs/${g}/${t}`}>{g} {t} 구인</Link>)}</div>)}</div>
    <div className="sec-t"><div><h2>돌봄 일자리 가이드</h2><p className="muted small">검색으로 들어온 분을 공고로 잇는 정보 콘텐츠</p></div><Link href="/guide">전체 보기 →</Link></div>
    <div className="grid g4">{GUIDES.map(g => <Link key={g.slug} href={`/guide/${g.slug}`} className="card stack"><span className="tag or" style={{ alignSelf: "flex-start" }}>가이드</span><h3>{guideShort(g)}</h3><p className="muted small">{g.lead.slice(0, 60)}…</p></Link>)}</div>
    <div className="sec-t"><h2>왜 케어잡모아인가요</h2></div>
    <div className="grid g3 why">
      <div className="card stack"><Ico.home /><h3>가까운 곳·맞는 시간부터</h3><p className="muted">도보·버스 정거장 기준 거리와 오전·주3일·야간·입주·단기 근무형태로 찾습니다.</p></div>
      <div className="card stack"><Ico.shield /><h3>믿을 수 있는 시설인지 먼저</h3><p className="muted">공단 평가등급, 4대보험, 급여 공개 여부, 근무자 후기를 공고에 기본 표시합니다.</p></div>
      <div className="card stack"><Ico.cert /><h3>자격증이 없어도 시작</h3><p className="muted">지금 가능한 일부터 요양보호사 자격 취득까지, 케어닥 교육과 이어드립니다.</p></div>
    </div>
  </>;
}
