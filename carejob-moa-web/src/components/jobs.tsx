"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/types";
import { jobPath } from "@/lib/seo";
import { useAuth, useToast } from "./providers";
import { Ico, GradeEl, JobTags, daysLabel, phoneOf } from "./ui";

export function ApplyButton({ job, className, children }: { job: Job; className?: string; children?: React.ReactNode }) {
  const { open } = useAuth();
  return <button className={className ?? "btn pri pill xs"} onClick={e => { e.stopPropagation(); e.preventDefault(); open({ type: "apply", job }); }}>{children ?? "지원"}</button>;
}
export function CallButton({ job, className, children }: { job: Job; className?: string; children?: React.ReactNode }) {
  return <a className={className ?? "btn out"} href={`tel:${phoneOf(job.id).replace(/-/g, "")}`} onClick={e => e.stopPropagation()}><Ico.phone />{children ?? "전화"}</a>;
}

/** 카드형 공고 */
export function JobCard({ j, preview }: { j: Job; preview?: boolean }) {
  const router = useRouter();
  const go = () => { if (!preview) router.push(jobPath(j)); };
  return (
    <article className={`card job${j.top ? " top" : ""}`} onClick={go} tabIndex={preview ? -1 : 0} onKeyDown={e => { if (e.key === "Enter") go(); }}>
      <div className="org"><JobTags j={j} /><span>{j.org} · {j.fac}</span></div>
      <h3>{j.title}</h3>
      <div className="meta"><span><Ico.pin />{j.area} · <b>{j.dist}</b></span><span><Ico.clock />{j.hours.filter(Boolean).join(" · ")}</span></div>
      <div className="pay">{j.pay}</div>
      <div className="foot"><GradeEl g={j.grade} /><span className="small muted">{daysLabel(j.days)} · 후기 {j.reviews}</span></div>
    </article>
  );
}

/** 밀도 높은 표 행 */
export function ListRow({ j }: { j: Job }) {
  const router = useRouter();
  return (
    <tr className={`lr${j.urgent ? " urg" : ""}`} onClick={() => router.push(jobPath(j))}>
      <td className="c-day"><span className={j.days === 0 ? "new" : ""}>{daysLabel(j.days)}</span><span className="cap">{j.head}명 · 채용시까지</span></td>
      <td className="c-org"><b><Link href={jobPath(j)} onClick={e => e.stopPropagation()} style={{ color: "inherit" }}>{j.org}</Link></b><span className="rt">{j.urgent && <span className="tag rd">급구</span>}{j.caredoc && <span className="tag bl">케어닥 직영</span>}{j.noLic && <span className="tag gr">자격증 없어도</span>}<span className="cap">{j.fac}</span><GradeEl g={j.grade} /></span></td>
      <td className="c-job">{j.job}<span className="cap">{j.title}</span></td>
      <td className="c-area">{j.area}<span className="cap or">{j.dist}</span></td>
      <td className="c-time">{j.hours[0]}<span className="cap">{j.hours[1] || ""} · {j.sched}</span></td>
      <td className="c-pay"><b>{j.pay}</b><span className="cap">{j.ins ? "4대보험" : "보험 미가입"}{j.payOpen ? "" : " · 협의"}</span></td>
      <td className="c-act"><ApplyButton job={j} /></td>
    </tr>
  );
}

export function ListTable({ jobs, children }: { jobs: Job[]; children?: React.ReactNode }) {
  return (
    <div className="tbl listwrap"><table className="list">
      <thead><tr><th className="c-day">등록</th><th className="c-org">기관명</th><th className="c-job">직종</th><th className="c-area">지역 · 거리</th><th className="c-time">근무시간</th><th className="c-pay">급여</th><th className="c-act"></th></tr></thead>
      <tbody>{children ?? jobs.map(j => <ListRow key={j.id} j={j} />)}{!children && !jobs.length && <tr><td colSpan={7} className="empty">이 조건의 공고가 아직 없어요. 다른 분류를 골라 보세요.</td></tr>}</tbody>
    </table></div>
  );
}

/** 상위노출 피드 카드 */
export function FeedCard({ j }: { j: Job }) {
  const router = useRouter();
  return (
    <article className={`fcard${j.top ? " top" : ""}`} onClick={() => router.push(jobPath(j))}>
      <div className="pay">{j.pay}</div><div className="dist">{j.dist}</div>
      <h3>{j.title}</h3>
      <div className="org"><JobTags j={j} short /><span>{j.org} · {j.area}</span></div>
      <div className="meta"><span><Ico.clock />{j.hours.filter(Boolean).join(" · ")}</span><GradeEl g={j.grade} /><span className="small muted">{daysLabel(j.days)}</span></div>
      <div className="btns"><CallButton job={j} /><ApplyButton job={j} className="btn pri pill">간편 지원하기</ApplyButton></div>
    </article>
  );
}

export function MiniJob({ j, left, right }: { j: Job; left?: React.ReactNode; right?: React.ReactNode }) {
  const router = useRouter();
  return <article className="mini-job" onClick={() => router.push(jobPath(j))}>{left ?? <span className="grade"><b className={`g${j.grade || "N"}`}>{j.grade || "–"}</b></span>}<div><b>{j.org}</b><span>{j.job} · {j.pay} · {j.dist}</span></div>{right ?? <span className="tag gr">후기 {j.score}</span>}</article>;
}

export function SaveButton({ job }: { job: Job }) {
  const { requireUser, toggleSaved, saved } = useAuth(); const toast = useToast();
  const on = saved.includes(job.id);
  return <button className="btn out" onClick={() => requireUser(() => { toggleSaved(job.id); toast(on ? "저장을 해제했습니다" : "공고를 저장했습니다"); })}>{on ? "저장됨" : "저장"}</button>;
}
