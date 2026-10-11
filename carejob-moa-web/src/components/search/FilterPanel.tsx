"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { SearchFilter } from "@/lib/types";
import { GUS, urlFromFilter, defaultFilter } from "@/lib/repo";
import { JOB_TYPES, SCHEDS, FACS } from "@/lib/constants";
import { useAuth, useToast } from "../providers";

export function FilterPanel({ filter }: { filter: SearchFilter }) {
  const router = useRouter();
  const [q, setQ] = useState(filter.q);
  const [openM, setOpenM] = useState(false);
  const active = (filter.gu !== "전체" ? 1 : 0) + filter.job.length + filter.sched.length + filter.fac.length + (filter.noLic ? 1 : 0) + (filter.q ? 1 : 0);
  useEffect(() => setQ(filter.q), [filter.q]);
  const go = (f: SearchFilter) => router.push(urlFromFilter(f));
  const tf = (key: "job" | "sched" | "fac", v: string) => { const a = filter[key]; go({ ...filter, [key]: a.includes(v) ? a.filter(x => x !== v) : [...a, v] }); };
  const chip = (key: "job" | "sched" | "fac", v: string) => <button key={v} className={`chip${filter[key].includes(v) ? " on" : ""}`} onClick={() => tf(key, v)}>{v}</button>;
  return (<>
    <button className="btn out ftoggle" onClick={() => setOpenM(o => !o)} aria-expanded={openM}><span>조건 {active ? `${active}개 적용 중` : "고르기"}</span><span>{openM ? "접기 ▲" : "펼치기 ▼"}</span></button>
    <aside className={`filter${openM ? " open" : ""}`}>
      <div><h3>지역</h3><div className="field"><select id="f-gu" aria-label="지역" value={filter.gu} onChange={e => go({ ...filter, gu: e.target.value })}>{GUS.map(g => <option key={g}>{g}</option>)}</select></div>
        <form className="field" style={{ marginTop: 8 }} onSubmit={e => { e.preventDefault(); go({ ...filter, q }); }}><input id="f-q" placeholder="동 이름·직종·시설명" value={q} onChange={e => setQ(e.target.value)} onBlur={() => { if (q !== filter.q) go({ ...filter, q }); }} /></form></div>
      <div><h3>근무 시간</h3><div className="chips">{SCHEDS.map(s => chip("sched", s))}</div></div>
      <div><h3>직종</h3><div className="chips">{JOB_TYPES.map(s => chip("job", s))}</div></div>
      <div><h3>시설 종류</h3><div className="chips">{FACS.map(s => chip("fac", s))}</div></div>
      <div className={`toggle${filter.noLic ? " on" : ""}`} onClick={() => go({ ...filter, noLic: !filter.noLic })} role="switch" aria-checked={filter.noLic} tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go({ ...filter, noLic: !filter.noLic }); } }}><span>자격증 없어도 가능한 일만</span><span className="sw" /></div>
      <button className="btn out sm" onClick={() => go(defaultFilter())}>조건 모두 지우기</button>
    </aside>
  </>);
}

export function ListHeadControls({ filter }: { filter: SearchFilter }) {
  const router = useRouter();
  const go = (f: SearchFilter) => router.push(urlFromFilter(f));
  return <div className="row">
    <div className="seg"><button className={filter.view !== "card" ? "on" : ""} onClick={() => go({ ...filter, view: "list" })}>목록</button><button className={filter.view === "card" ? "on" : ""} onClick={() => go({ ...filter, view: "card" })}>카드</button></div>
    <label className="small muted">정렬 <select aria-label="정렬" value={filter.sort} onChange={e => go({ ...filter, sort: e.target.value as SearchFilter["sort"] })}><option value="near">가까운 순</option><option value="new">최신 순</option><option value="grade">시설 등급 순</option></select></label>
  </div>;
}

export function AlertButton({ label }: { label: string }) {
  const { requireUser, setAlert } = useAuth(); const toast = useToast();
  return <button className="btn pri pill" style={{ marginTop: 16 }} onClick={() => requireUser(() => { setAlert(label); toast("새 공고 알림을 신청했습니다"); })}>이 조건 새 공고 문자 받기</button>;
}
