import Link from "next/link";
import type { Job } from "@/lib/types";
import { jobPath, facilityPath, jobLD, breadcrumbLD } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { JsonLd, GradeEl, JobTags, stars, fmtTel } from "./ui";
import { ApplyButton, CallButton, SaveButton } from "./jobs";
import CopyUrl from "./CopyUrl";

export default function JobDetail({ j, demo }: { j: Job; demo: boolean }) {
  const path = jobPath(j);
  const tel = demo ? "" : fmtTel(j.contact);
  // 시범 공고의 시설은 가상이므로 동네까지만, 실서비스는 시설명까지 넣어 지도에서 찾는다
  const mapHref = `https://map.kakao.com/link/search/${encodeURIComponent(demo ? j.area : `${j.area} ${j.org}`)}`;
  return (
    <div className="detail pad-bar">
      {!demo && !j.closed && <JsonLd data={jobLD(j)} />}
      <JsonLd data={breadcrumbLD([{ name: "홈", path: "/" }, { name: "일자리", path: "/jobs" }, { name: j.gu, path: `/jobs/${j.gu}` }, { name: j.job, path: `/jobs/${j.gu}/${j.job}` }, { name: j.org, path }])} />
      <section className="stack" style={{ gap: 16 }}>
        <nav className="crumb" aria-label="경로"><Link href="/">홈</Link><span>›</span><Link href="/jobs">일자리</Link><span>›</span><Link href={`/jobs/${j.gu}`}>{j.gu}</Link><span>›</span><Link href={`/jobs/${j.gu}/${j.job}`}>{j.job}</Link><span>›</span><b>{j.org}</b></nav>
        {j.closed && <div className="vbanner none" role="status"><div><b>마감된 공고입니다</b><p>지원은 받지 않습니다. 같은 동네의 다른 공고를 확인해 보세요.</p></div><Link className="btn pri pill sm" href={`/jobs/${j.gu}/${j.job}`}>비슷한 공고 보기</Link></div>}
        <div className="card stack" style={{ gap: 12 }}>
          <div className="row" style={{ justifyContent: "space-between" }}><div className="row">{demo && <span className="tag gy">예시 공고</span>}<JobTags j={j} /></div><CopyUrl url={SITE_URL + encodeURI(path)} label="공고 주소 복사" /></div>
          <h1>{j.title}</h1>
          <p style={{ fontSize: 20 }}><Link href={facilityPath(j)} className="orglink">{j.org}</Link> <span className="muted">· {j.fac} · {j.area}</span></p>
          <div className="hr" style={{ margin: "8px 0" }} />
          <dl className="kv">
            <dt>급여</dt><dd><b style={{ fontSize: 20 }}>{j.pay}</b> {j.payOpen ? <span className="tag gr">급여 공개</span> : <span className="tag gy">면접 시 협의</span>}</dd>
            <dt>근무 시간</dt><dd>{j.hours.filter(Boolean).join(" · ")} <span className="tag or">{j.sched}</span></dd>
            <dt>근무지</dt><dd>{j.area}{j.dist ? <span className="muted"> · {j.dist}</span> : null}</dd>
            <dt>4대보험</dt><dd>{j.ins ? "가입" : "미가입 · 프리랜서 계약"}</dd>
            {j.req && <><dt>자격</dt><dd>{j.req}</dd></>}
            <dt>모집 인원</dt><dd>{j.head}명 · 채용 시 마감</dd>
          </dl>
          {(j.duty.length > 0 || j.benef.length > 0) && <><div className="hr" style={{ margin: "8px 0" }} />
            <div className="grid g2">
              {j.duty.length > 0 && <div><h3>하는 일</h3><ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>{j.duty.map(d => <li key={d}>{d}</li>)}</ul></div>}
              {j.benef.length > 0 && <div><h3>복리후생</h3><div className="chips" style={{ marginTop: 8 }}>{j.benef.map(b => <span key={b} className="tag gy" style={{ fontSize: 14, padding: "6px 12px" }}>{b}</span>)}</div></div>}
            </div></>}
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}><h2>이 시설, 믿을 수 있나요?</h2><span className="cap">{demo ? "예시 정보" : "시설 등록 정보 · 평가등급은 운영팀 확인"}</span></div>
          <div className={`trust${j.reviews ? "" : " t3"}`}>
            <div><b>{j.grade || "–"}</b><span>건강보험공단 평가등급{j.grade ? "" : " (확인 전이거나 대상 아님)"}</span></div>
            <div><b>{j.ins ? "가입" : "미가입"}</b><span>4대보험</span></div>
            <div><b>{j.payOpen ? "공개" : "비공개"}</b><span>급여 공개 여부</span></div>
            {j.reviews > 0 && <div><b>{j.score}<small className="muted" style={{ fontSize: 14 }}> /5</small></b><span>근무자 후기 {j.reviews}건</span></div>}
          </div>
          {j.rv.length > 0 && <div className="stack" style={{ marginTop: 8 }}>{j.rv.map((r, i) => <div className="review" key={i}><span className="star" aria-label={`5점 만점에 ${r.score}점`}>{stars(r.score)}</span><p>{r.text}</p><span className="who">{r.who}{demo ? " · 예시" : ""}</span></div>)}</div>}
        </div>

        <div className="card stack">
          <h2>오시는 길</h2>
          <p>{j.area}{j.dist ? <span className="muted"> · {j.dist}</span> : null}</p>
          <a className="btn out" style={{ alignSelf: "flex-start" }} href={mapHref} target="_blank" rel="noopener noreferrer">카카오맵에서 위치 보기</a>
          <p className="cap">정확한 주소는 지원 후 시설에서 안내해 드립니다.</p>
        </div>
      </section>

      <aside className="side card stack" style={{ gap: 12 }}>
        <h3>{j.closed ? "마감된 공고" : "지원하기"}</h3>
        <p className="muted small">이름과 전화번호만 있으면 됩니다. 비밀번호는 없어요. 1분이면 끝나요.</p>
        <ApplyButton job={j} className="btn pri pill wide">간편 지원하기</ApplyButton>
        <div className="two"><SaveButton job={j} /><CallButton job={j}>전화로 문의</CallButton></div>
        {tel && !j.closed && <><p className="tel">{tel}</p><p className="cap">채용 담당자 · 통화가 어려우면 간편 지원을 남겨 주세요</p></>}
        {demo && <p className="cap">시범 운영 중인 예시 공고입니다. 전화는 연결되지 않습니다.</p>}
        <div className="row" style={{ marginTop: 4 }}><GradeEl g={j.grade} /></div>
      </aside>
      <div className="bar two"><CallButton job={j}>전화</CallButton><ApplyButton job={j} className="btn pri pill">간편 지원하기</ApplyButton></div>
    </div>
  );
}
