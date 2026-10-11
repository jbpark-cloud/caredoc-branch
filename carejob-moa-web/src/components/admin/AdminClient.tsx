"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase, authFetch, authMode } from "@/lib/auth/client";
import { useToast } from "../providers";
import { fmtPhone } from "../ui";
import { BIZ_STATUS_LABEL } from "@/lib/constants";
import CsvImport from "./CsvImport";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Data = { businesses: any[]; jobs: any[]; applications: any[]; orders: any[]; consults: any[]; proposals: any[] };
type Tab = "biz" | "jobs" | "import" | "apps" | "orders" | "consults";
const d = (s: string) => new Date(s).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminClient() {
  const toast = useToast();
  const [state, setState] = useState<"init" | "login" | "denied" | "ok" | "nodb">("init");
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<Tab>("biz");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [grade, setGrade] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const r = await authFetch("/api/admin");
    if (r.status === 503) { setState("nodb"); return; }
    if (r.status === 403 || r.status === 401) { const c = supabase(); const { data: s } = c ? await c.auth.getSession() : { data: { session: null } }; setState(s.session ? "denied" : "login"); return; }
    setData(await r.json()); setState("ok");
  }, []);
  useEffect(() => { if (authMode() !== "supabase") { setState("nodb"); return; } load(); }, [load]);

  const act = async (action: string, id: string | number, value?: unknown, extra: Record<string, unknown> = {}) => {
    const r = await authFetch("/api/admin", { method: "POST", body: JSON.stringify({ action, id, value, ...extra }) }); const j = await r.json().catch(() => ({}));
    toast(j.ok ? "처리했습니다" : (j.msg || "처리하지 못했습니다")); load();
  };

  if (state === "init") return <p className="muted" style={{ paddingBlock: 48 }}>불러오는 중…</p>;
  if (state === "nodb") return <div style={{ paddingBlock: 48 }} className="stack"><h1>운영자 콘솔</h1><p className="muted">데이터베이스(Supabase)가 연결되면 사용할 수 있습니다. 지금은 시범 운영 모드입니다.</p></div>;
  if (state === "login" || state === "denied") return <div style={{ paddingBlock: 48, maxWidth: 420 }} className="stack">
    <h1>운영자 콘솔</h1>
    {state === "denied" && <p style={{ color: "var(--red)" }}>이 계정은 운영자로 등록되어 있지 않습니다. ADMIN_EMAILS 환경변수에 이메일을 추가해 주세요.</p>}
    <form className="stack" style={{ gap: 12, marginTop: 8 }} onSubmit={async e => { e.preventDefault(); const c = supabase()!; const { error } = await c.auth.signInWithPassword({ email, password: pw }); if (error) { toast("이메일 또는 비밀번호가 맞지 않습니다"); return; } load(); }}>
      <div className="field"><label>운영자 이메일</label><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="field"><label>비밀번호</label><input type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} /></div>
      <button className="btn sec pill">로그인</button>
      {state === "denied" && <button type="button" className="btn out" onClick={async () => { await supabase()!.auth.signOut(); setState("login"); }}>다른 계정으로 로그인</button>}
    </form></div>;

  const D = data!;
  const pending = D.businesses.filter(b => b.status === "pending");
  const tabs: [Tab, string, number][] = [["biz", "기업 인증", pending.length], ["jobs", "공고", D.jobs.filter(j => !j.published && !j.closed_at).length], ["import", "공고 일괄 등록", 0], ["apps", "지원", D.applications.length], ["orders", "광고 신청", D.orders.filter(o => o.status === "pending").length], ["consults", "교육 상담", D.consults.length]];
  return <div style={{ paddingBlock: 24 }}>
    <div className="row" style={{ justifyContent: "space-between" }}><h1>운영자 콘솔</h1><button className="btn out sm" onClick={load}>새로고침</button></div>
    <div className="dash" style={{ marginTop: 16 }}>
      <div className="card hi"><b>{pending.length}</b><span>인증 검수 대기</span></div>
      <div className="card"><b>{D.jobs.filter(j => j.published && !j.closed_at).length}</b><span>노출 중 공고</span></div>
      <div className="card"><b>{D.applications.length}</b><span>최근 지원(100건까지)</span></div>
      <div className="card"><b>{D.orders.filter(o => o.status === "pending").reduce((a, o) => a + o.amount, 0).toLocaleString()}원</b><span>미처리 광고 신청액</span></div>
    </div>
    <div className="seg" style={{ marginTop: 20, display: "inline-flex", flexWrap: "wrap" }}>{tabs.map(([k, l, n]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}{n ? ` ${n}` : ""}</button>)}</div>
    <div className="card tbl" style={{ marginTop: 12 }}>
      {tab === "biz" && <table><thead><tr><th>시설</th><th>담당자</th><th>인증 번호</th><th>상태</th><th>공단 등급</th><th></th></tr></thead><tbody>{D.businesses.map(b => <tr key={b.id}>
        <td><b>{b.org}</b><span className="cap" style={{ display: "block" }}>{b.fac} · 가입 {d(b.created_at)}</span></td>
        <td>{b.manager_name}<span className="cap" style={{ display: "block" }}>{fmtPhone(b.manager_phone || "")} · {b.email}</span></td>
        <td>{b.bizno ? `사업자 ${b.bizno.replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3")}` : b.ltc_code ? `기관 ${b.ltc_code}` : "–"}{b.verify_requested_at && <span className="cap" style={{ display: "block" }}>요청 {d(b.verify_requested_at)}</span>}</td>
        <td><span className={`tag ${b.status === "verified" ? "gr" : b.status === "pending" ? "bl" : "gy"}`}>{BIZ_STATUS_LABEL[b.status]}</span></td>
        <td><select aria-label="공단 평가등급" value={grade[b.id] ?? b.grade ?? ""} onChange={e => setGrade(g => ({ ...g, [b.id]: e.target.value }))}><option value="">미확인</option>{["A", "B", "C", "D", "E"].map(x => <option key={x}>{x}</option>)}</select></td>
        <td style={{ whiteSpace: "nowrap" }}>{b.status !== "verified" ? <button className="btn sec xs" onClick={() => act("verify", b.id, null, { grade: grade[b.id] ?? b.grade })}>인증 승인</button> : <button className="btn out xs" onClick={() => act("verify", b.id, null, { grade: grade[b.id] ?? b.grade })}>등급 저장</button>} {b.status === "pending" && <button className="btn out xs" onClick={() => act("reject", b.id)}>반려</button>}</td></tr>)}
        {!D.businesses.length && <tr><td colSpan={6} className="muted">가입한 기업이 아직 없습니다.</td></tr>}</tbody></table>}
      {tab === "jobs" && <table><thead><tr><th>#</th><th>공고</th><th>상태</th><th></th></tr></thead><tbody>{D.jobs.map(j => <tr key={j.id}>
        <td>{j.id}</td><td><b>{j.org}</b> · {j.title || j.job}<span className="cap" style={{ display: "block" }}>{j.gu} · {j.pay} · {d(j.created_at)}</span></td>
        <td>{j.closed_at ? <span className="tag gy">마감</span> : j.published ? <span className="tag gr">노출</span> : <span className="tag bl">미노출</span>}{j.top && <span className="tag or" style={{ marginLeft: 4 }}>상위</span>}{j.urgent && <span className="tag rd" style={{ marginLeft: 4 }}>급구</span>}</td>
        <td style={{ whiteSpace: "nowrap" }}><button className="btn out xs" onClick={() => act("publish", j.id, !j.published)}>{j.published ? "내리기" : "노출"}</button> <button className="btn out xs" onClick={() => act("top", j.id, !j.top)}>{j.top ? "상위 해제" : "상위노출"}</button> <button className="btn out xs" onClick={() => act("urgent", j.id, !j.urgent)}>{j.urgent ? "급구 해제" : "급구"}</button></td></tr>)}
        {!D.jobs.length && <tr><td colSpan={4} className="muted">등록된 공고가 없습니다.</td></tr>}</tbody></table>}
      {tab === "import" && <CsvImport onDone={load} />}
      {tab === "apps" && <table><thead><tr><th>지원일</th><th>공고</th><th>지원자</th></tr></thead><tbody>{D.applications.map(a => <tr key={a.id}><td>{d(a.created_at)}</td><td>#{a.job_id} {a.job_org}</td><td>{a.name} · {fmtPhone(a.phone)}</td></tr>)}{!D.applications.length && <tr><td colSpan={3} className="muted">아직 지원이 없습니다.</td></tr>}</tbody></table>}
      {tab === "orders" && <table><thead><tr><th>신청일</th><th>상품</th><th className="num">금액</th><th>상태</th><th></th></tr></thead><tbody>{D.orders.map(o => { const b = D.businesses.find(x => x.id === o.business_id); return <tr key={o.id}><td>{d(o.created_at)}</td><td>{o.product} × {o.count}<span className="cap" style={{ display: "block" }}>{b ? `${b.org} · ${b.manager_name} ${fmtPhone(b.manager_phone || "")}` : "비회원"}</span></td><td className="num">{o.amount.toLocaleString()}원</td><td><span className={`tag ${o.status === "pending" ? "bl" : o.status === "paid" ? "gr" : "gy"}`}>{({ pending: "확인 대기", paid: "입금 완료", canceled: "취소" } as Record<string, string>)[o.status] || o.status}</span></td><td style={{ whiteSpace: "nowrap" }}><button className="btn out xs" onClick={() => act("order", o.id, "paid")}>입금 확인</button> <button className="btn out xs" onClick={() => act("order", o.id, "canceled")}>취소</button></td></tr>; })}{!D.orders.length && <tr><td colSpan={5} className="muted">광고 신청이 없습니다.</td></tr>}</tbody></table>}
      {tab === "consults" && <table><thead><tr><th>신청일</th><th>종류</th><th>연락처</th></tr></thead><tbody>{D.consults.map(c => <tr key={c.id}><td>{d(c.created_at)}</td><td>{c.type === "education" ? "요양보호사 교육 상담" : c.type}</td><td>{c.name ? c.name + " · " : ""}{fmtPhone(c.phone || "")}</td></tr>)}{!D.consults.length && <tr><td colSpan={3} className="muted">상담 신청이 없습니다.</td></tr>}</tbody></table>}
    </div>
    <p className="cap" style={{ marginTop: 12 }}>인증 승인 시 해당 기업의 미노출 공고가 한 번에 노출됩니다. 모든 조치는 admin_logs에 기록됩니다.</p>
  </div>;
}
