import Link from "next/link";
import type { Job } from "@/lib/types";
import { jobPath, facilityPath, jobLD, breadcrumbLD } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { JsonLd, GradeEl, JobTags, stars, phoneOf } from "./ui";
import { ApplyButton, CallButton, SaveButton } from "./jobs";
import CopyUrl from "./CopyUrl";

export default function JobDetail({ j, demo }: { j: Job; demo: boolean }) {
  const path = jobPath(j);
  return (
    <div className="detail pad-bar">
      {!demo && <JsonLd data={jobLD(j)} />}
      <JsonLd data={breadcrumbLD([{ name: "홈", path: "/" }, { name: "일자리", path: "/jobs" }, { name: j.gu, path: `/jobs/${j.gu}` }, { name: j.job, path: `/jobs/${j.gu}/${j.job}` }, { name: j.org, path }])} />
      <section className="stack" style={{ gap: 16 }}>
        <nav className="crumb" aria-label="경로"><Link href="/">홈</Link><span>›</span><Link href="/jobs">일자리</Link><span>›</span><Link href={`/jobs/${j.gu}`}>{j.gu}</Link><span>›</span><Link href={`/jobs/${j.gu}/${j.job}`}>{j.job}</Link><span>›</span><b>{j.org}</b></nav>
        <div className="card stack" style={{ gap: 12 }}>
          <div className="row"><JobTags j={j} /></div>
          <h1>{j.title}</h1>
          <p style={{ fontSize: 20 }}><Link href={facilityPath(j)} className="orglink">{j.org}</Link> <span className="muted">· {j.fac} · {j.area}</span> <span className="cap">시설 페이지 보기 →</span></p>
          <div className="urlbar"><span className="cap">이 공고 주소</span><code>{SITE_URL.replace(/^https?:\/\//, "")}{path}</code><CopyUrl url={SITE_URL + path} /></div>
          <div className="hr" style={{ margin: "8px 0" }} />
          <dl className="kv">
            <dt>급여</dt><dd><b style={{ fontSize: 20 }}>{j.pay}</b> {j.payOpen ? <span className="tag gr">급여 공개</span> : <span className="tag gy">면접 시 협의</span>}</dd>
            <dt>근무 시간</dt><dd>{j.hours.filter(Boolean).join(" · ")} <span className="tag or">{j.sched}</span></dd>
            <dt>거리</dt><dd>내 위치(강남구 대치동)에서 <b>{j.dist}</b></dd>
            <dt>4대보험</dt><dd>{j.ins ? "가입" : "미가입 · 프리랜서 계약"}</dd>
            <dt>자격</dt><dd>{j.req}</dd>
            <dt>모집 인원</dt><dd>{j.head}명 · 마감 시까지</dd>
          </dl>
          <div className="hr" style={{ margin: "8px 0" }} />
          <div className="grid g2"><div><h3>하는 일</h3><ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>{j.duty.map(d => <li key={d}>{d}</li>)}</ul></div><div><h3>복리후생</h3><div className="chips" style={{ marginTop: 8 }}>{j.benef.map(b => <span key={b} className="tag gy" style={{ fontSize: 14, padding: "6px 12px" }}>{b}</span>)}</div></div></div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}><h2>이 시설, 믿을 수 있나요?</h2><span className="cap">케어잡모아가 확인한 정보</span></div>
          <div className="trust">
            <div><b>{j.grade || "–"}</b><span>건강보험공단 평가등급{j.grade ? "" : " (대상 아님)"}</span></div>
            <div><b>{j.ins ? "가입" : "미가입"}</b><span>4대보험</span></div>
            <div><b>{j.payOpen ? "공개" : "비공개"}</b><span>급여 공개 여부</span></div>
            <div><b>{j.score}<small className="muted" style={{ fontSize: 14 }}> /5</small></b><span>근무자 후기 {j.reviews}건</span></div>
          </div>
          <div className="stack" style={{ marginTop: 8 }}>{j.rv.map((r, i) => <div className="review" key={i}><span className="star">{stars(r.score)}</span><p>{r.text}</p><span className="who">{r.who}</span></div>)}</div>
        </div>

        <div className="card stack">
          <h2>오시는 길</h2>
          <div className="map"><svg viewBox="0 0 600 180" aria-label="약도"><rect width="600" height="180" fill="var(--bg)" /><path d="M0 90h600M300 0v180M120 0v180M480 0v180M0 40h600M0 140h600" stroke="var(--line)" strokeWidth="2" fill="none" /><circle cx="150" cy="120" r="10" fill="var(--secondary)" /><text x="150" y="152" textAnchor="middle" fontSize="14" fill="var(--sub)" fontFamily="inherit">내 위치</text><path d="M160 116 Q300 60 440 66" stroke="var(--primary)" strokeWidth="4" strokeDasharray="8 6" fill="none" /><circle cx="450" cy="64" r="12" fill="var(--primary)" /><text x="450" y="45" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--title)" fontFamily="inherit">{j.org}</text><text x="300" y="112" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--primary)" fontFamily="inherit">{j.dist}</text></svg></div>
          <p className="muted">{j.area} · 지도 앱 길찾기는 카카오맵 연동 후 제공됩니다.</p>
        </div>
      </section>

      <aside className="side card stack" style={{ gap: 12 }}>
        <h3>지원하기</h3>
        <p className="muted small">회원가입 없이 이름·전화번호만으로 지원됩니다. 걸리는 시간 1분.</p>
        <ApplyButton job={j} className="btn pri pill wide" >간편 지원하기</ApplyButton>
        <div className="two"><SaveButton job={j} /><CallButton job={j}>전화로 문의</CallButton></div>
        <p className="tel">{phoneOf(j.id)}</p>
        <p className="cap">담당 {j.caredoc ? "케어닥 채용팀" : "원장 김OO"} · 평일 09~18시 통화 가능</p>
        <div className="row" style={{ marginTop: 4 }}><GradeEl g={j.grade} /></div>
      </aside>
      <div className="bar two"><CallButton job={j}>전화</CallButton><ApplyButton job={j} className="btn pri pill">간편 지원하기</ApplyButton></div>
    </div>
  );
}
