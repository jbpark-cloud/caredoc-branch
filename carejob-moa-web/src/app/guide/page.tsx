import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, guideShort } from "@/lib/data/guides";
import { meta } from "@/lib/seo";

export const metadata: Metadata = meta("돌봄 일자리 가이드 · 자격증·급여·직종별 시작 방법", "요양보호사 자격증, 병원동행매니저, 요양보호사 월급, 간병인 되는 법.", "/guide");

export default function GuidesPage() {
  return <div style={{ paddingBlock: 24 }}>
    <nav className="crumb"><Link href="/">홈</Link><span>›</span><b>돌봄 일자리 가이드</b></nav>
    <h1>돌봄 일자리 가이드</h1><p className="muted">자격증·급여·직종별 시작 방법. 검색으로 들어온 분이 공고까지 이어지도록 만든 정보 페이지입니다.</p>
    <div className="grid g2" style={{ marginTop: 20 }}>{GUIDES.map(g => <Link key={g.slug} href={`/guide/${g.slug}`} className="card stack"><span className="tag or" style={{ alignSelf: "flex-start" }}>가이드</span><h3 style={{ fontSize: 20 }}>{guideShort(g)}</h3><p className="muted small">{g.lead.slice(0, 80)}…</p><span className="lnk" style={{ margin: 0 }}>읽기 →</span></Link>)}</div>
  </div>;
}
