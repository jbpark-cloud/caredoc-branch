"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast, Check } from "../providers";
import { JobCard } from "../jobs";
import { BackToBiz } from "./BizShared";
import { FACS, JOB_TYPES, SCHEDS } from "@/lib/constants";
import type { Job, Sched } from "@/lib/types";

export default function PostForm() {
  const { biz, ready, open } = useAuth(); const toast = useToast(); const router = useRouter();
  const [p, setP] = useState({ org: "", fac: "방문요양", job: "요양보호사", sched: "오전만" as Sched, hours: "오전 9~12시 · 주 5일", addr: "강남구 대치동", pay: "", contact: "", ins: true, payOpen: true, noLic: false, urgent: false, desc: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (biz) setP(s => ({ ...s, org: s.org || biz.org, fac: biz.fac || s.fac, contact: s.contact || biz.phone })); }, [biz]);
  useEffect(() => { if (ready && !biz) open({ type: "bizjoin", then: () => {} }); }, [ready, biz, open]);
  const set = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setP(s => ({ ...s, [k]: e.target.value }));
  const tg = (k: "ins" | "payOpen" | "noLic" | "urgent") => setP(s => ({ ...s, [k]: !s[k] }));
  if (!ready) return null;
  if (!biz) return <div style={{ paddingBlock: 48 }} className="stack"><h1>공고 등록</h1><p className="muted">기업회원 가입(1분) 후 바로 작성할 수 있습니다.</p><button className="btn sec pill" style={{ alignSelf: "flex-start" }} onClick={() => open({ type: "bizjoin" })}>기업회원 1분 가입</button></div>;

  const preview: Job = { id: 0, top: false, urgent: p.urgent, caredoc: false, noLic: p.noLic, org: p.org || "시설 이름", fac: p.fac, title: `${p.job} 모집 · ${p.hours.split(" ·")[0]}`, area: p.addr, gu: p.addr.split(" ")[0], dist: "도보 12분", hours: [p.hours.split(" · ")[0] || "", p.hours.split(" · ")[1] || ""], pay: p.pay || "급여 미입력", grade: "A", days: 0, reviews: 18, job: p.job, sched: p.sched, ins: p.ins, payOpen: p.payOpen, score: 4.5, benef: [], duty: [], req: "", head: 1, rv: [] };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p.pay || !p.hours || !p.addr) { toast("근무 시간·주소·급여를 입력해 주세요"); return; }
    setBusy(true);
    try { await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, bizStatus: biz.status }) }); } catch {}
    setBusy(false);
    toast(biz.status === "verified" ? "공고가 등록되어 노출 중입니다 (무료)" : "공고가 등록되었습니다 · 인증 완료 후 노출"); router.push("/biz");
  };
  return <>
    <div style={{ paddingBlock: 24 }} className="stack"><BackToBiz /><h1>공고 등록 <span className="tag gr" style={{ verticalAlign: "middle" }}>무료</span></h1><p className="muted">5분이면 끝납니다. 구직자가 가장 먼저 보는 것은 시간·거리·급여입니다.</p></div>
    {biz.status !== "verified" && <div className={`vbanner ${biz.status === "pending" ? "pend" : "none"}`} style={{ marginBottom: 16 }}><div><b>{biz.status === "pending" ? "인증 검수 중 · 등록해 두면 검수 완료와 함께 자동 노출됩니다" : "미인증 · 등록은 되지만 인증 전엔 구직자에게 보이지 않습니다"}</b></div>{biz.status !== "pending" && <button className="btn sec sm pill" onClick={() => open({ type: "bizjoin", step: 2 })}>지금 인증하기</button>}</div>}
    <div className="grid" style={{ gridTemplateColumns: "1fr 380px" }} id="post-grid">
      <form className="form card" onSubmit={submit}>
        <div className="field"><label>시설 이름</label><input value={p.org} onChange={set("org")} /></div>
        <div className="field"><label>시설 종류</label><select value={p.fac} onChange={set("fac")}>{FACS.map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>모집 직종</label><select value={p.job} onChange={set("job")}>{JOB_TYPES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>근무 형태</label><select value={p.sched} onChange={set("sched")}>{SCHEDS.map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>근무 시간·요일</label><input value={p.hours} onChange={set("hours")} placeholder="예: 오전 9~12시 · 주 5일" /><span className="help">구직자 화면에 그대로 보입니다. 짧고 정확하게.</span></div>
        <div className="field"><label>근무지 주소</label><input value={p.addr} onChange={set("addr")} /><span className="help">동 단위로 노출 · 도보·버스 거리 자동 계산</span></div>
        <div className="field"><label>급여</label><input placeholder="예: 시급 14,500원 / 월 235만원" value={p.pay} onChange={set("pay")} /></div>
        <div className="field"><label>담당자 연락처</label><input value={p.contact} onChange={set("contact")} /></div>
        <div className="full grid g2">
          <Check on={p.payOpen} onClick={() => tg("payOpen")}>급여 금액 공개<br /><span className="cap">공개 시 지원율 상승 · &apos;급여 공개&apos; 표시</span></Check>
          <Check on={p.ins} onClick={() => tg("ins")}>4대보험 가입<br /><span className="cap">공고에 표시됩니다</span></Check>
          <Check on={p.noLic} onClick={() => tg("noLic")}>자격증 없어도 지원 가능<br /><span className="cap">&apos;자격증 없어도 가능&apos; 표시 · 무자격자 진입 페이지에 노출</span></Check>
          <Check on={p.urgent} onClick={() => tg("urgent")}>급구 (유료 옵션)<br /><span className="cap">&apos;급구&apos; 빨간 태그 · 3일 7,000원</span></Check>
        </div>
        <div className="field full"><label>상세 내용</label><textarea placeholder="하는 일, 우대 사항, 식사·주차 제공 여부 등" value={p.desc} onChange={set("desc")} /></div>
        <div className="full card" style={{ background: "var(--info-bg)", borderColor: "transparent" }}><b>자동으로 붙는 시설 정보</b><p className="small">건강보험공단 평가등급 · 시설 후기 · 사업자 인증 상태가 인증 완료 후 자동으로 표시됩니다.</p></div>
        <div className="full two"><button className="btn out" type="button" onClick={() => toast("임시 저장했습니다")}>임시 저장</button><button className="btn pri pill" type="submit" disabled={busy}>무료로 등록하기</button></div>
      </form>
      <aside className="stack"><h3>구직자에게 이렇게 보입니다</h3>
        <JobCard j={preview} preview />
        <div className="card stack"><h3>더 많이 보이게 하려면</h3><p className="muted small">등록 후 상위노출(7일 3만원)을 붙이면 목록 최상단에 고정됩니다.</p><Link className="btn out sm" href="/biz/ads">광고 상품 보기</Link></div>
      </aside></div>
  </>;
}
