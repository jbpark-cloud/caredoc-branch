"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getJobs, GUS, distNum } from "@/lib/repo";
import { FACS, JOB_TYPES, SCHEDS } from "@/lib/constants";
import { jobPath } from "@/lib/seo";
import type { Job } from "@/lib/types";
import { FeedCard, ListRow, ListTable, MiniJob } from "../jobs";
import { Ico } from "../ui";
import { useToast } from "../providers";

type Tab = "fac" | "gu" | "job" | "sched";
const LABEL: Record<Tab, string> = { fac: "기관별", gu: "지역별", job: "직종별", sched: "근무시간별" };
const KEY: Record<Tab, keyof Job> = { fac: "fac", gu: "gu", job: "job", sched: "sched" };

export default function HomeClient() {
  const JOBS = getJobs();
  const router = useRouter();
  const toast = useToast();
  const [gu, setGu] = useState("강남구");
  const [tab, setTab] = useState<Tab>("fac");
  const [pick, setPick] = useState<{ tab: Tab; name: string } | null>(null);
  const [group, setGroup] = useState<"" | "fac" | "gu">("fac");
  const [limit, setLimit] = useState(30);
  const anchor = useRef<HTMLDivElement>(null);
  const [flash, setFlash] = useState(false);

  const pool = useMemo(() => pick ? JOBS.filter(j => j[KEY[pick.tab]] === pick.name) : JOBS, [JOBS, pick]);
  const plat = useMemo(() => pool.filter(j => j.top).sort((a, b) => a.days - b.days), [pool]);
  const rest = useMemo(() => pool.filter(j => !j.top).sort((a, b) => a.days - b.days), [pool]);
  const near = useMemo(() => JOBS.filter(j => j.gu === gu).sort((a, b) => distNum(a.dist) - distNum(b.dist)), [JOBS, gu]);
  const good = useMemo(() => JOBS.filter(j => j.grade === "A" && j.ins && j.payOpen).sort((a, b) => b.score - a.score).slice(0, 4), [JOBS]);
  const caredoc = JOBS.filter(j => j.caredoc);
  const noLicCount = JOBS.filter(j => j.noLic).length;

  const panel: [string, number, number][] = useMemo(() => {
    const names: readonly string[] = tab === "fac" ? FACS : tab === "gu" ? GUS.filter(g => g !== "전체") : tab === "job" ? JOB_TYPES : SCHEDS;
    return names.map(n => [n, JOBS.filter(j => j[KEY[tab]] === n).length, JOBS.filter(j => j[KEY[tab]] === n && j.urgent).length]);
  }, [JOBS, tab]);

  const homePick = (t: Tab, name: string) => {
    const same = pick?.tab === t && pick.name === name;
    setPick(same ? null : { tab: t, name }); setLimit(30);
    if (!same) { setTimeout(() => { anchor.current?.scrollIntoView({ behavior: "smooth", block: "start" }); setFlash(true); setTimeout(() => setFlash(false), 1200); }, 0); }
  };

  const shown = rest.slice(0, limit);
  let rows: React.ReactNode;
  if (group) {
    const groups: Record<string, Job[]> = {};
    shown.forEach(j => { const k = group === "fac" ? j.fac : j.gu; (groups[k] = groups[k] || []).push(j); });
    const keys = group === "fac" ? FACS.filter(f => groups[f]) : Object.keys(groups).sort((a, b) => a.localeCompare(b, "ko"));
    rows = keys.map(k => [
      <tr className="grp" key={"g" + k}><td colSpan={7}><b>{k}</b> <span className="muted small">{JOBS.filter(j => (group === "fac" ? j.fac : j.gu) === k).length}건 중 {groups[k].length}건</span> <button className="lnk" onClick={() => homePick(group, k)}>이 {group === "fac" ? "기관" : "지역"}만 보기</button></td></tr>,
      ...groups[k].map(j => <ListRow key={j.id} j={j} />),
    ]);
  } else rows = shown.map(j => <ListRow key={j.id} j={j} />);

  const pins = near.slice(0, 8).map((j, i) => { const ang = i / 8 * Math.PI * 2 - 1.2; const r = 46 + distNum(j.dist) * 3.2; return { j, x: 300 + Math.cos(ang) * r * 1.85, y: 118 + Math.sin(ang) * r * 0.62 }; });

  return <>
    <section className="top-strip"><div className="wrap">
      <div className="locbar">
        <div className="loc"><Ico.pinLg /><select id="home-gu" aria-label="내 동네" value={gu} onChange={e => setGu(e.target.value)}>{GUS.filter(g => g !== "전체").map(g => <option key={g}>{g}</option>)}</select><span className="cap">{near.length}개 자리 · 가까운 순</span></div>
        <div className="stats"><span><b>{JOBS.length}</b>전체 공고</span><span><b>{JOBS.filter(j => j.days === 0).length}</b>오늘 새 공고</span><span><b>{JOBS.filter(j => j.urgent).length}</b>급구</span><span><b>{noLicCount}</b>자격증 없어도</span></div>
      </div>
      <div className="banner-row">
        <Link className="banner main" href="/start"><span className="tag" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>자격증이 없어요</span><h2>오늘 시작할 수 있는 일부터,<br />요양보호사가 되는 길까지</h2><p>지금 가능한 {noLicCount}개 자리 · 교육 연결 · 상담 무료</p><b>진입 경로 보기 →</b></Link>
        <Link className="banner ad" href={jobPath(caredoc[0])}><span className="tag or">광고 · 메인 배너</span><h3>{caredoc[0].org}</h3><p>{caredoc[0].title}<br />{caredoc[0].pay} · {caredoc[0].hours[0]}</p><span className="cap">케어닥 직영 · 공단 평가 {caredoc[0].grade || "–"}등급</span></Link>
        <Link className="banner biz" href="/biz"><span className="tag" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}>시설·병원 담당자</span><h3>공고 등록 0원</h3><p>우리 동네 구직자에게 바로 닿습니다</p><b>무료로 공고 올리기 →</b></Link>
      </div>
    </div></section>

    <div className="browse">
      <div className="btabs">{(Object.keys(LABEL) as Tab[]).map(k => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{LABEL[k]}</button>)}<span className="sp" />{pick ? <span className="tag or" style={{ fontSize: 14, padding: "4px 6px 4px 12px" }}>{LABEL[pick.tab]} · {pick.name} <button className="x" aria-label="해제" onClick={() => setPick(null)}>×</button></span> : <span className="cap">누르면 아래 목록이 바뀝니다</span>}</div>
      <div className={`bgrid ${tab}`}>{panel.map(([name, n, u]) => <button key={name} className={`bitem${pick?.tab === tab && pick.name === name ? " on" : ""}`} onClick={() => homePick(tab, name)}><span>{name}</span><b>{n}</b>{u ? <em>급구 {u}</em> : null}</button>)}</div>
    </div>

    <div className="sec-t"><div><h2>상위노출 채용정보 <span className="muted" style={{ fontSize: 16 }}>{plat.length}건</span></h2><p className="muted small">유료 상위노출 공고 · 주황 테두리</p></div><Link href="/biz/ads">내 공고도 여기에 →</Link></div>
    {plat.length ? <div className="feedgrid">{plat.slice(0, 6).map(j => <FeedCard key={j.id} j={j} />)}</div> : <div className="card" style={{ textAlign: "center", color: "var(--sub)" }}>이 조건의 상위노출 공고는 아직 없어요. 아래 전체 목록을 봐 주세요.</div>}

    <div className={`sec-t${flash ? " flash" : ""}`} ref={anchor} id="list-anchor" style={{ marginBottom: 10, scrollMarginTop: 80 }}><div><h2>전체 채용정보 <span className="muted" style={{ fontSize: 16 }}>{rest.length}건</span></h2>
      <div className="selrow">{pick ? <span className="tag or">{LABEL[pick.tab]} · {pick.name} <button className="x" aria-label="해제" onClick={() => setPick(null)}>×</button></span> : <span className="cap">분류를 고르지 않으면 서울 전체 최신 순</span>}</div></div>
      <div className="row"><span className="small muted">묶어 보기</span><div className="seg"><button className={!group ? "on" : ""} onClick={() => setGroup("")}>최신 순</button><button className={group === "fac" ? "on" : ""} onClick={() => setGroup("fac")}>기관별</button><button className={group === "gu" ? "on" : ""} onClick={() => setGroup("gu")}>지역별</button></div></div></div>
    <ListTable jobs={rest}>{shown.length ? rows : <tr><td colSpan={7} className="empty">이 조건의 공고가 아직 없어요. 다른 분류를 골라 보세요.</td></tr>}</ListTable>
    {rest.length > limit && <button className="btn out wide" style={{ marginTop: 12 }} onClick={() => setLimit(l => l + 30)}>공고 더 보기 ({rest.length - limit}건 남음)</button>}

    <div className="sec-t"><div><h2>{gu} 내 주변</h2><p className="muted small">핀의 글자는 건강보험공단 평가등급 · 주황 핀은 상위노출</p></div><Link href={`/jobs/${gu}`}>목록으로 →</Link></div>
    <div className="dsplit">
      <div className="mapbox"><svg viewBox="0 0 600 236" aria-label="주변 지도 미리보기">
        <rect width="600" height="236" fill="var(--bg)" />
        <g stroke="var(--line)" strokeWidth="2" fill="none"><path d="M0 118h600M300 0v236M0 60h600M0 178h600M150 0v236M450 0v236" /></g>
        <g stroke="var(--line)" strokeWidth="7" fill="none" opacity=".7"><path d="M30 200 Q300 30 570 200" /><path d="M60 16 Q300 210 540 26" /></g>
        <circle cx="300" cy="118" r="9" fill="var(--secondary)" /><circle cx="300" cy="118" r="18" fill="none" stroke="var(--secondary)" strokeWidth="2" opacity=".5" /><text x="300" y="146" textAnchor="middle" fontSize="12" fill="var(--sub)" fontFamily="inherit">내 위치</text>
        {pins.map(p => <g key={p.j.id} style={{ cursor: "pointer" }} onClick={() => router.push(jobPath(p.j))}><circle cx={p.x.toFixed(0)} cy={p.y.toFixed(0)} r="13" fill={p.j.top ? "var(--primary)" : "var(--card)"} stroke="var(--primary)" strokeWidth="2" /><text x={p.x.toFixed(0)} y={(p.y + 4).toFixed(0)} textAnchor="middle" fontSize="11" fontWeight="700" fill={p.j.top ? "#fff" : "var(--primary)"} fontFamily="inherit">{p.j.grade || "•"}</text><text x={p.x.toFixed(0)} y={(p.y + 27).toFixed(0)} textAnchor="middle" fontSize="11" fill="var(--title)" fontFamily="inherit">{p.j.job}</text></g>)}
      </svg><div className="mapfoot"><span className="cap">실제 서비스에서는 카카오 지도 · 반경 조절</span><button className="btn out sm" onClick={() => toast("지도 전체 보기는 2차에 제공됩니다")}>지도 크게 보기</button></div></div>
      <div className="goodlist"><h3>등급 A · 4대보험 · 급여 공개 시설</h3>{good.map(j => <MiniJob key={j.id} j={j} />)}</div>
    </div>
  </>;
}
