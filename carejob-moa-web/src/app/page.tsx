import Link from "next/link";
import type { Metadata } from "next";
import HeroCarousel from "@/components/home/HeroCarousel";
import HomeSide from "@/components/home/HomeSide";
import { FeedCard, ListTable } from "@/components/jobs";
import { Ico, JsonLd, LogoMark, JobIco, daysLabel } from "@/components/ui";
import { getJobs, isDemo } from "@/lib/repo";
import { buildSlides, buildPremium, slimJob } from "@/lib/ads";
import { GUIDES, guideShort } from "@/lib/data/guides";
import { GU_LIST, HUB_GU, HUB_JOBS, SCHEDS, SITE_URL, SITE_NAME } from "@/lib/constants";
import { meta, jobPath } from "@/lib/seo";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const n = (await getJobs()).length;
  return meta("케어잡모아 — 우리 동네 요양·돌봄 일자리 | 요양보호사·간병인 구인", `서울 요양보호사·간병인·사회복지사 일자리${n >= 30 ? ` ${n}건` : ""}. 집 근처·근무 시간·공단 평가등급으로 찾고 전화번호만으로 지원하세요.`, "/");
}

const TILES: [label: string, key: string, href: string][] = [
  ["요양보호사", "요양보호사", "/jobs/요양보호사"], ["간병인", "간병인", "/jobs/간병인"], ["사회복지사", "사회복지사", "/jobs/사회복지사"], ["간호조무사", "간호조무사", "/jobs/간호조무사"],
  ["간호사", "간호사", "/jobs/간호사"], ["병원동행", "병원동행매니저", "/jobs/병원동행매니저"], ["생활지원사", "생활지원사", "/jobs/생활지원사"], ["자격증 없어도", "자격무관", "/jobs/자격무관"],
];

export default async function HomePage() {
  const jobs = (await getJobs()).filter(j => !j.closed);
  const demo = isDemo();
  const { slides, used } = buildSlides(jobs, demo);
  const premium = buildPremium(jobs, demo, used, 7);
  const urgent = jobs.filter(j => j.urgent).sort((a, b) => a.days - b.days).slice(0, 6).map(slimJob);
  const fresh = [...jobs].sort((a, b) => a.days - b.days).slice(0, 12).map(slimJob);
  const count = (key: string) => key === "자격무관" ? jobs.filter(j => j.noLic).length : jobs.filter(j => j.job === key).length;
  const guCount = (g: string) => jobs.filter(j => j.gu === g).length;
  const showStats = demo || jobs.length >= 30; // 실서비스 초기에는 작은 숫자를 내세우지 않는다
  const today = jobs.filter(j => j.days === 0).length;
  const ld = { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/jobs?q={search_term_string}`, "query-input": "required name=search_term_string" } };

  return <>
    <JsonLd data={ld} />

    {/* 1. 검색 */}
    <section className="hm-top"><div className="hm-top-in">
      <div className="hm-head">
        <h1>우리 동네 요양·돌봄 일자리</h1>
        {showStats && <p className="hm-stats"><span>전체 <b>{jobs.length.toLocaleString()}</b>건</span><span>오늘 새 공고 <b>{today}</b>건</span><span>급구 <b>{jobs.filter(j => j.urgent).length}</b>건</span></p>}
      </div>
      <form className="hm-search" action="/jobs" method="get" role="search" aria-label="일자리 검색">
        <label className="sr" htmlFor="hs-gu">지역</label>
        <select id="hs-gu" name="gu" defaultValue=""><option value="">서울 전체</option>{[...GU_LIST].sort((a, b) => a.localeCompare(b, "ko")).map(g => <option key={g} value={g}>{g}</option>)}</select>
        <label className="sr" htmlFor="hs-q">검색어</label>
        <input id="hs-q" name="q" type="search" enterKeyHint="search" maxLength={40} placeholder="직종·시설·동 이름으로 검색" />
        <button className="btn pri pill" type="submit"><Ico.search />검색</button>
      </form>
      <div className="hm-keys" aria-label="자주 찾는 조건">
        <span className="cap">자주 찾는 조건</span>
        <Link href="/jobs?sched=오전만">오전만</Link><Link href="/jobs?sched=주3일">주 3일</Link><Link href="/jobs/자격무관">자격증 없어도</Link><Link href="/jobs?sched=야간">야간</Link><Link href="/jobs?sched=입주">입주</Link><Link href="/jobs?fac=주야간보호">주야간보호</Link><Link href="/jobs?fac=요양원">요양원</Link>
      </div>
    </div></section>

    {/* 2. 큰 배너 + 내 정보 상자 */}
    <div className="hm-hero">
      <HeroCarousel slides={slides} />
      <HomeSide />
    </div>

    {/* 3. 직종·지역 바로가기 */}
    <nav className="hm-tiles" aria-label="직종별 바로가기">
      {TILES.map(([label, key, href]) => { const I = JobIco[key]; const n = count(key); return <Link key={key} href={href} className="hm-tile"><I /><b>{label}</b>{showStats && <span>{n}건</span>}</Link>; })}
    </nav>
    <nav className="hm-chips" aria-label="지역·근무시간 바로가기">
      <div><span className="hm-chips-t">지역</span>{HUB_GU.map(g => <Link key={g} className="chip" href={`/jobs/${g}`}>{g}{showStats && guCount(g) > 0 && <small>{guCount(g)}</small>}</Link>)}<Link className="chip more" href="/jobs">전체 지역</Link></div>
      <div><span className="hm-chips-t">근무시간</span>{SCHEDS.map(s => <Link key={s} className="chip" href={`/jobs?sched=${s}`}>{s}</Link>)}</div>
    </nav>

    {/* 4. 프리미엄 채용관 */}
    <div className="sec-t"><div><h2>프리미엄 채용관</h2><p className="muted small">{demo ? "광고 자리 예시입니다. 시범 운영 중이라 실제 시설의 광고가 아닙니다." : "상위노출 광고를 이용 중인 시설의 공고입니다."}</p></div><Link href="/biz/ads">광고 안내 →</Link></div>
    <div className={`pm-grid${premium.length ? "" : " solo"}`}>
      {premium.map(({ job: j, sample }) => (
        <Link key={j.id} href={jobPath(j)} className="pm-card">
          <span className="pm-top"><LogoMark name={j.org} /><span className="pm-org"><b>{j.org}</b><small>{j.fac} · {j.area}</small></span>{sample && <em className="pm-sample">예시</em>}</span>
          <strong>{j.title}</strong>
          <span className="pm-meta">{[j.hours[0], j.sched].filter(Boolean).join(" · ")}</span>
          <span className="pm-foot"><b>{j.pay}</b><span>{j.urgent && <span className="tag rd">급구</span>}{j.noLic && <span className="tag gr">자격증 없어도</span>}{!j.urgent && !j.noLic && <span className="cap">{daysLabel(j.days)}</span>}</span></span>
        </Link>
      ))}
      <Link href="/biz/ads" className="pm-card inq">
        <span className="pm-inq-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></span>
        <strong>이 자리에 우리 시설을 알리세요</strong>
        <span className="pm-meta">공고 등록은 무료 · 상위노출은 7일 단위로 신청</span>
        <span className="pm-foot"><b>광고 상품 보기 →</b></span>
      </Link>
    </div>

    {jobs.length === 0 ? (
      <div className="empty" style={{ marginTop: 32 }}><p style={{ fontSize: 20, color: "var(--title)" }}>곧 첫 공고가 올라옵니다</p><p>시설·병원의 공고를 받고 있습니다. 공고 등록은 무료입니다.</p><Link className="btn sec pill" style={{ marginTop: 12 }} href="/biz">시설·병원 공고 등록하기</Link></div>
    ) : <>
      {/* 5. 급구 */}
      {urgent.length > 0 && <>
        <div className="sec-t"><div><h2>급하게 구하는 자리</h2><p className="muted small">바로 일할 분을 찾는 공고입니다</p></div><Link href="/jobs?sort=new">전체 보기 →</Link></div>
        <div className="feedgrid">{urgent.map(j => <FeedCard key={j.id} j={j} />)}</div>
      </>}

      {/* 6. 새 공고 */}
      <div className="sec-t"><div><h2>새로 올라온 공고</h2><p className="muted small">최근 등록 순</p></div><Link href="/jobs?sort=new">전체 보기 →</Link></div>
      <ListTable jobs={fresh} />
      <Link className="btn out wide" style={{ marginTop: 12 }} href="/jobs?sort=new">{showStats ? `전체 공고 ${jobs.length.toLocaleString()}건 보기` : "전체 공고 보기"}</Link>
    </>}

    {/* 7. 교육 띠 배너 */}
    <Link href="/start" className="hm-band edu">
      <span className="hm-band-t"><span className="tag gr">자격증이 없어요</span><b>오늘 시작할 수 있는 일부터, 요양보호사가 되는 길까지</b><span>자격증 없이 가능한 일{showStats ? ` ${count("자격무관")}건` : ""} · 자격 취득 4단계 · 교육 상담 무료</span></span>
      <span className="btn out pill">시작하는 방법 보기</span>
    </Link>

    {/* 8. 가이드 */}
    <div className="sec-t"><div><h2>돌봄 일자리 가이드</h2><p className="muted small">처음 시작하는 분들이 가장 많이 묻는 내용</p></div><Link href="/guide">전체 보기 →</Link></div>
    <div className="grid g4">{GUIDES.map(g => <Link key={g.slug} href={`/guide/${g.slug}`} className="card stack hm-guide"><span className="tag or" style={{ alignSelf: "flex-start" }}>가이드</span><h3>{guideShort(g)}</h3><p className="muted small">{g.lead.slice(0, 58)}…</p></Link>)}</div>

    {/* 9. 지역·직종 링크 */}
    <div className="sec-t"><div><h2>지역별 · 직종별 채용정보</h2></div></div>
    <div className="card linkhub">{HUB_GU.map(g => <div key={g}><b>{g}</b>{HUB_JOBS.map(t => <Link key={t} href={`/jobs/${g}/${t}`}>{g} {t} 구인</Link>)}</div>)}</div>

    {/* 10. 기업 띠 */}
    <div className="hm-band biz">
      <span className="hm-band-t"><span className="tag wh">시설·병원 담당자</span><b>공고 등록은 무료입니다</b><span>가입 1분 · 인증이 끝나면 동네 구직자에게 바로 보입니다</span></span>
      <span className="row"><Link className="btn wh pill" href="/biz">무료로 공고 올리기</Link><Link className="btn ghost pill" href="/biz/ads">광고 상품 보기</Link></span>
    </div>

    <div className="sec-t"><h2>케어잡모아는 이렇게 다릅니다</h2></div>
    <div className="grid g3 why">
      <div className="card stack"><Ico.home /><h3>가까운 곳·맞는 시간부터</h3><p className="muted">사는 동네와 오전·주3일·야간·입주·단기 근무형태로 먼저 고릅니다.</p></div>
      <div className="card stack"><Ico.shield /><h3>믿을 수 있는 시설인지 먼저</h3><p className="muted">공단 평가등급, 4대보험, 급여 공개 여부를 공고마다 표시합니다.</p></div>
      <div className="card stack"><Ico.cert /><h3>자격증이 없어도 시작</h3><p className="muted">지금 가능한 일부터 요양보호사 자격을 따는 방법까지 안내합니다.</p></div>
    </div>
  </>;
}
