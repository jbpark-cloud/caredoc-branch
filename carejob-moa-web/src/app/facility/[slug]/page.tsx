import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getFacility, getJobs, isDemo } from "@/lib/repo";
import { facilitiesFromJobs } from "@/lib/filter";
import { meta, facilityPath, parseIdSlug, safeDecode, facilityLD, breadcrumbLD, jobPath } from "@/lib/seo";
import { FAC_INTRO } from "@/lib/constants";
import { JsonLd, stars, daysLabel, fmtTel } from "@/components/ui";
import { ApplyButton, CallButton } from "@/components/jobs";
import FacilityAlert from "@/components/FacilityAlert";

interface Props { params: { slug: string } }

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseIdSlug(params.slug); const f = id ? await getFacility(id) : null;
  if (!f) return { title: "시설을 찾을 수 없습니다" };
  return meta(`${f.org} 채용정보 · ${f.fac} · ${f.gu}`, `${f.org}(${f.area}) 진행 중 공고 ${f.jobs.length}건. ${f.grade ? "공단 평가 " + f.grade + "등급, " : ""}4대보험 ${f.ins ? "가입" : "미가입"}${f.reviews ? `, 근무자 후기 ${f.reviews}건` : ""}.`, facilityPath(f));
}

export default async function FacilityPage({ params }: Props) {
  const id = parseIdSlug(params.slug); const f = id ? await getFacility(id) : null;
  if (!f) notFound();
  if ("/facility/" + safeDecode(params.slug) !== facilityPath(f)) permanentRedirect(encodeURI(facilityPath(f)));
  const demo = isDemo();
  const tel = demo ? "" : fmtTel(f.jobs[0]?.contact);
  const nearby = facilitiesFromJobs((await getJobs()).filter(j => j.fac === f.fac && j.gu === f.gu && j.org !== f.org)).slice(0, 4);
  return (
    <div style={{ paddingBlock: 24 }}>
      {!demo && <JsonLd data={facilityLD(f)} />}
      <JsonLd data={breadcrumbLD([{ name: "홈", path: "/" }, { name: `${f.gu} ${f.fac}`, path: `/jobs/${f.gu}?fac=${f.fac}` }, { name: f.org, path: facilityPath(f) }])} />
      <nav className="crumb"><Link href="/">홈</Link><span>›</span><Link href={`/jobs/${f.gu}?fac=${encodeURIComponent(f.fac)}`}>{f.gu} {f.fac}</Link><span>›</span><b>{f.org}</b></nav>
      <div className="fac-head"><div><div className="row">{demo && <span className="tag gy">예시 시설</span>}{f.caredoc && <span className="tag bl">케어닥 직영</span>}<span className="tag gy">{f.fac}</span>{f.grade && <span className="tag gr">공단 평가 {f.grade}등급</span>}</div><h1 style={{ marginTop: 8 }}>{f.org}</h1><p className="muted">{f.area} · {FAC_INTRO[f.fac] ?? ""}</p></div>
        <div className="row">{f.jobs[0] && <CallButton job={f.jobs[0]} />}<FacilityAlert gu={f.gu} /></div></div>
      <div className={`trust${f.reviews ? "" : " t3"}`} style={{ marginTop: 16 }}><div><b>{f.grade || "–"}</b><span>건강보험공단 평가등급{f.grade ? "" : " (확인 전이거나 대상 아님)"}</span></div><div><b>{f.ins ? "가입" : "미가입"}</b><span>4대보험</span></div><div><b>{f.payOpen ? "공개" : "비공개"}</b><span>급여 공개</span></div>{f.reviews > 0 && <div><b>{f.score}<small className="muted" style={{ fontSize: 14 }}> /5</small></b><span>근무자 후기 {f.reviews}건</span></div>}</div>
      <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 20, marginTop: 20 }} id="fac-grid">
        <div className="stack" style={{ gap: 16 }}>
          <div className="card"><h2 style={{ marginBottom: 10 }}>진행 중 공고 <span className="muted" style={{ fontSize: 16 }}>{f.jobs.length}건</span></h2><div className="tbl listwrap" style={{ border: 0 }}><table className="list"><thead><tr><th className="c-day">등록</th><th className="c-job">직종</th><th className="c-time">근무시간</th><th className="c-pay">급여</th><th className="c-act"><span className="sr">지원</span></th></tr></thead><tbody>{f.jobs.map(j => <tr key={j.id} className={`lr${j.urgent ? " urg" : ""}`}><td className="c-day"><span className={j.days === 0 ? "new" : ""}>{daysLabel(j.days)}</span></td><td className="c-job"><Link href={jobPath(j)} style={{ color: "inherit" }}>{j.job}<span className="cap">{j.title}</span></Link></td><td className="c-time">{j.hours[0]}<span className="cap">{j.sched}</span></td><td className="c-pay"><b>{j.pay}</b></td><td className="c-act"><ApplyButton job={j} /></td></tr>)}</tbody></table></div></div>
          {f.rv.length > 0 && <div className="card"><h2 style={{ marginBottom: 6 }}>근무자 후기 {demo && <span className="tag gy" style={{ verticalAlign: "middle" }}>예시</span>}</h2>{f.rv.map((r, i) => <div className="review" key={i}><span className="star" aria-label={`5점 만점에 ${r.score}점`}>{stars(r.score)}</span><p>{r.text}</p><span className="who">{r.who}</span></div>)}</div>}
        </div>
        <div className="stack" style={{ gap: 16 }}>
          <div className="card stack"><h3>시설 정보</h3><dl className="kv" style={{ fontSize: 16 }}><dt>유형</dt><dd>{f.fac}</dd><dt>위치</dt><dd>{f.area}</dd><dt>진행 공고</dt><dd>{f.jobs.length}건</dd>{tel && <><dt>전화</dt><dd className="tel" style={{ fontSize: 18 }}>{tel}</dd></>}</dl>{demo && <p className="cap">시범 운영 중인 예시 시설입니다. 실제 시설이 아닙니다.</p>}</div>
          <div className="card stack"><h3>오시는 길</h3><p>{f.area}</p><a className="btn out sm" style={{ alignSelf: "flex-start" }} href={`https://map.kakao.com/link/search/${encodeURIComponent(demo ? f.area : `${f.area} ${f.org}`)}`} target="_blank" rel="noopener noreferrer">카카오맵에서 위치 보기</a></div>
          <div className="card stack"><h3>같은 동네 {f.fac}</h3>{nearby.length ? nearby.map(o => <Link key={o.org} href={facilityPath(o)} className="lnk" style={{ margin: 0, fontSize: 15 }}>{o.org} →</Link>) : <p className="cap">아직 없어요</p>}</div>
        </div>
      </div>
    </div>
  );
}
