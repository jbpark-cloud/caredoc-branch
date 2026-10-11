import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide, guideShort } from "@/lib/data/guides";
import { getJobs } from "@/lib/repo";
import { meta, safeDecode, breadcrumbLD } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { JsonLd } from "@/components/ui";

interface Props { params: { slug: string } }
export function generateStaticParams() { return GUIDES.map(g => ({ slug: g.slug })); }
export function generateMetadata({ params }: Props): Metadata {
  const g = getGuide(safeDecode(params.slug)); if (!g) return { title: "가이드를 찾을 수 없습니다" };
  return meta(g.title, g.lead, `/guide/${g.slug}`, { keywords: g.kw.split(", ") });
}

export const revalidate = 300;

export default async function GuidePage({ params }: Props) {
  const g = getGuide(safeDecode(params.slug)); if (!g) notFound();
  const noLic = (await getJobs()).filter(j => j.noLic).length;
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.lead, author: { "@type": "Organization", name: "케어잡모아" }, publisher: { "@type": "Organization", name: "케어닥" }, mainEntityOfPage: `${SITE_URL}/guide/${g.slug}` };
  return <div style={{ paddingBlock: 24 }}>
    <JsonLd data={ld} /><JsonLd data={breadcrumbLD([{ name: "홈", path: "/" }, { name: "돌봄 일자리 가이드", path: "/guide" }, { name: guideShort(g), path: `/guide/${g.slug}` }])} />
    <nav className="crumb"><Link href="/">홈</Link><span>›</span><Link href="/guide">돌봄 일자리 가이드</Link><span>›</span><b>{guideShort(g)}</b></nav>
    <div className="grid" style={{ gridTemplateColumns: "1fr 340px", gap: 24 }} id="guide-grid">
      <article className="card guide"><span className="tag or">돌봄 일자리 가이드</span><h1 style={{ marginTop: 10, fontSize: 30 }}>{g.title}</h1><p className="lead">{g.lead}</p>
        {g.sections.map((s, i) => <section key={i}><h2 id={`s${i}`}>{s[0]}</h2><p>{s[1]}</p></section>)}
        <div className="two" style={{ marginTop: 24 }}><Link className="btn out" href={g.cta2.href}>{g.cta2.t}</Link><Link className="btn pri pill" href={g.cta.href}>{g.cta.t}</Link></div>
        <p className="cap" style={{ marginTop: 16 }}>검색 키워드: {g.kw}</p></article>
      <aside className="stack" style={{ gap: 16 }}>
        <div className="card stack"><h3>목차</h3>{g.sections.map((s, i) => <a key={i} href={`#s${i}`} className="lnk" style={{ margin: 0, fontSize: 15 }}>{i + 1}. {s[0]}</a>)}</div>
        <div className="card stack"><h3>다른 가이드</h3>{GUIDES.filter(x => x.slug !== g.slug).map(x => <Link key={x.slug} href={`/guide/${x.slug}`} className="lnk" style={{ margin: 0, fontSize: 15 }}>{guideShort(x)} →</Link>)}</div>
        <div className="card stack" style={{ background: "var(--green-bg)", borderColor: "transparent" }}><h3>자격증이 없어도 괜찮아요</h3><p className="small">지금 가능한 {noLic}개 자리부터 시작하세요.</p><Link className="btn pri pill sm" style={{ alignSelf: "flex-start" }} href="/start">진입 경로 보기</Link></div>
      </aside></div></div>;
}
