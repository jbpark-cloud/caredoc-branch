import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getFacility, getJobs } from "@/lib/repo";
import { meta, facilityPath, parseIdSlug, safeDecode, facilityLD, breadcrumbLD, jobPath } from "@/lib/seo";
import { FAC_INTRO } from "@/lib/constants";
import { JsonLd, stars, daysLabel, phoneOf } from "@/components/ui";
import { ApplyButton } from "@/components/jobs";
import FacilityAlert from "@/components/FacilityAlert";

interface Props { params: { slug: string } }

export function generateMetadata({ params }: Props): Metadata {
  const id = parseIdSlug(params.slug); const f = id ? getFacility(id) : null;
  if (!f) return { title: "시설을 찾을 수 없습니다" };
  return meta(`${f.org} 채용정보 · ${f.fac} · ${f.gu}`, `${f.org}(${f.area}) 진행 중 공고 ${f.jobs.length}건. ${f.grade ? "공단 평가 " + f.grade + "등급, " : ""}4대보험 ${f.ins ? "가입" : "미가입"}, 근무자 후기 ${f.reviews}건.`, facilityPath(f));
}

export default function FacilityPage({ params }: Props) {
  const id = parseIdSlug(params.slug); const f = id ? getFacility(id) : null;
  if (!f) notFound();
  if ("/facility/" + safeDecode(params.slug) !== facilityPath(f)) permanentRedirect(encodeURI(facilityPath(f)));
  const nearby = [...new Set(getJobs().filter(j => j.fac === f.fac && j.gu === f.gu && j.org !== f.org).map(j => j.org))].slice(0, 4).map(o => getFacility(o)!);
  return (
    <div style={{ paddingBlock: 24 }}>
      <JsonLd data={facilityLD(f)} />
      <JsonLd data={breadcrumbLD([{ name: "홈", path: "/" }, { name: `${f.gu} ${f.fac}`, path: `/jobs/${f.gu}?fac=${f.fac}` }, { name: f.org, path: facilityPath(f) }])} />
      <nav className="crumb"><Link href="/">홈</Link><span>›</span><Link href={`/jobs/${f.gu}?fac=${encodeURIComponent(f.fac)}`}>{f.gu} {f.fac}</Link><span>›</span><b>{f.org}</b></nav>
      <div className="fac-head"><div><div className="row">{f.caredoc && <span className="tag bl">케어닥 직영</span>}<span className="tag gy">{f.fac}</span>{f.grade && <span className="tag gr">공단 평가 {f.grade}등급</span>}</div><h1 style={{ marginTop: 8 }}>{f.org}</h1><p className="muted">{f.area} · {FAC_INTRO[f.fac] ?? ""}</p></div>
        <div className="row"><a className="btn out" href={`tel:${phoneOf(f.id).replace(/-/g, "")}`}>전화</a><FacilityAlert org={f.org} /></div></div>
      <div className="trust" style={{ marginTop: 16 }}><div><b>{f.grade || "–"}</b><span>건강보험공단 평가등급{f.grade ? " (2024)" : " (대상 아님)"}</span></div><div><b>{f.ins ? "가입" : "미가입"}</b><span>4대보험</span></div><div><b>{f.payOpen ? "공개" : "비공개"}</b><span>급여 공개</span></div><div><b>{f.score}<small className="muted" style={{ fontSize: 14 }}> /5</small></b><span>근무자 후기 {f.reviews}건</span></div></div>
      <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 20, marginTop: 20 }} id="fac-grid">
        <div className="stack" style={{ gap: 16 }}>
          <div className="card"><h2 style={{ marginBottom: 10 }}>진행 중 공고 <span className="muted" style={{ fontSize: 16 }}>{f.jobs.length}건</span></h2><div className="tbl listwrap" style={{ border: 0 }}><table className="list"><thead><tr><th className="c-day">등록</th><th className="c-job">직종</th><th className="c-time">근무시간</th><th className="c-pay">급여</th><th className="c-act"></th></tr></thead><tbody>{f.jobs.map(j => <tr key={j.id} className={`lr${j.urgent ? " urg" : ""}`}><td className="c-day"><span className={j.days === 0 ? "new" : ""}>{daysLabel(j.days)}</span></td><td className="c-job"><Link href={jobPath(j)} style={{ color: "inherit" }}>{j.job}<span className="cap">{j.title}</span></Link></td><td className="c-time">{j.hours[0]}<span className="cap">{j.sched}</span></td><td className="c-pay"><b>{j.pay}</b></td><td className="c-act"><ApplyButton job={j} /></td></tr>)}</tbody></table></div></div>
          <div className="card"><h2 style={{ marginBottom: 6 }}>근무자 후기</h2><p className="cap">지원 이력이 확인된 근무자·전 근무자만 작성할 수 있습니다. 시설은 답글을 달 수 있습니다.</p>{f.rv.map((r, i) => <div className="review" key={i}><span className="star">{stars(r.score)}</span><p>{r.text}</p><span className="who">{r.who}</span></div>)}</div>
        </div>
        <div className="stack" style={{ gap: 16 }}>
          <div className="card stack"><h3>시설 정보</h3><dl className="kv" style={{ fontSize: 16 }}><dt>유형</dt><dd>{f.fac}</dd><dt>위치</dt><dd>{f.area}</dd><dt>정원·현원</dt><dd>{f.fac === "방문요양" || f.fac === "간병인 협회" ? "–" : `${29 + f.id % 40}명 · ${24 + f.id % 30}명`}</dd><dt>종사자</dt><dd>{8 + f.id % 20}명</dd><dt>지정일</dt><dd>20{10 + f.id % 14}년</dd><dt>전화</dt><dd className="tel" style={{ fontSize: 18 }}>{phoneOf(f.id)}</dd></dl><p className="cap">정원·종사자·지정일은 건강보험공단 장기요양기관 공개 정보에서 자동 연결됩니다(현재 샘플).</p></div>
          <div className="card stack"><h3>오시는 길</h3><div className="map"><svg viewBox="0 0 600 180"><rect width="600" height="180" fill="var(--bg)" /><path d="M0 90h600M300 0v180M120 0v180M480 0v180M0 40h600M0 140h600" stroke="var(--line)" strokeWidth="2" fill="none" /><circle cx="300" cy="90" r="12" fill="var(--primary)" /><text x="300" y="120" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--title)" fontFamily="inherit">{f.org}</text></svg></div><p className="muted small">{f.area}</p></div>
          <div className="card stack"><h3>같은 동네 {f.fac}</h3>{nearby.length ? nearby.map(o => <Link key={o.org} href={facilityPath(o)} className="lnk" style={{ margin: 0, fontSize: 15 }}>{o.org} →</Link>) : <p className="cap">아직 없어요</p>}</div>
        </div>
      </div>
    </div>
  );
}
