"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useToast } from "../providers";
import { BizCta } from "./BizShared";
import { authFetch, authMode } from "@/lib/auth/client";
import { fmtPhone } from "../ui";

interface MyJob { id: number; job: string; title: string | null; hours: string | null; pay: string | null; published: boolean; top: boolean; urgent: boolean; closed_at: string | null; created_at: string; applicants: number }
interface App { id: number; job_id: number; name: string; phone: string; proxy_phone: string | null; lic: string[]; created_at: string }

export default function BizDash() {
  const { biz, demo } = useAuth(); const toast = useToast();
  const real = authMode() === "supabase" && !demo;
  const [jobs, setJobs] = useState<MyJob[] | null>(null);
  const [apps, setApps] = useState<App[] | null>(null);
  const [openJob, setOpenJob] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!real || !biz) return;
    try { const r = await authFetch("/api/biz/jobs"); const j = await r.json(); setJobs(j.jobs || []); } catch { setJobs([]); }
  }, [real, biz]);
  useEffect(() => { load(); }, [load]);

  const showApps = async (id: number) => {
    setOpenJob(id); setApps(null);
    try { const r = await authFetch(`/api/biz/applications?job=${id}`); const j = await r.json(); setApps(j.applications || []); } catch { setApps([]); }
  };
  const toggleClose = async (j: MyJob) => {
    const r = await authFetch("/api/biz/jobs", { method: "PATCH", body: JSON.stringify({ id: j.id, close: !j.closed_at }) });
    toast(r.ok ? (j.closed_at ? "공고를 다시 열었습니다" : "공고를 마감했습니다") : "변경하지 못했습니다"); load();
  };

  if (real && biz) {
    const list = jobs ?? [];
    const total = list.reduce((a, j) => a + j.applicants, 0);
    return <>
      <div className="sec-t"><h2>우리 시설 채용 현황</h2><span className="small muted">{biz.org}</span></div>
      <div className="dash"><div className="card hi"><b>{total}</b><span>누적 지원자</span></div><div className="card"><b>{list.filter(j => !j.closed_at && j.published).length}</b><span>노출 중 공고</span></div><div className="card"><b>{list.filter(j => !j.published).length}</b><span>인증 대기 공고</span></div><Link className="card" href="/biz/talent"><b>→</b><span>우리 동네 구직자 · 인재정보 보기</span></Link></div>
      <div className="sec-t"><h2>우리 공고</h2><BizCta className="btn out sm">+ 새 공고</BizCta></div>
      {jobs === null ? <div className="card muted">불러오는 중…</div> : !list.length ? <div className="empty"><p style={{ fontSize: 20, color: "var(--title)" }}>아직 올린 공고가 없어요</p><p>공고 등록은 무료이고 5분이면 끝납니다.</p><BizCta className="btn pri pill" >첫 공고 올리기</BizCta></div> :
        <div className="card tbl"><table><thead><tr><th>공고</th><th>상태</th><th className="num">지원</th><th></th></tr></thead><tbody>
          {list.map(j => <tr key={j.id}><td>{j.title || j.job}<span className="cap" style={{ display: "block" }}>{j.hours} · {j.pay}</span></td>
            <td>{j.closed_at ? <span className="tag gy">마감</span> : j.published ? <span className="tag gr">노출 중</span> : <span className="tag bl">인증 후 노출</span>}{j.top && <span className="tag or" style={{ marginLeft: 4 }}>상위노출</span>}</td>
            <td className="num">{j.applicants}</td>
            <td style={{ whiteSpace: "nowrap" }}><button className="btn out xs" onClick={() => showApps(j.id)}>지원자 보기</button> <button className="btn out xs" onClick={() => toggleClose(j)}>{j.closed_at ? "다시 열기" : "마감"}</button></td></tr>)}
        </tbody></table></div>}
      {openJob && <div className="card" style={{ marginTop: 16 }}><div className="row" style={{ justifyContent: "space-between" }}><h3>지원자 · 공고 #{openJob}</h3><button className="btn out xs" onClick={() => setOpenJob(null)}>닫기</button></div>
        {apps === null ? <p className="muted">불러오는 중…</p> : !apps.length ? <p className="muted">아직 지원자가 없어요.</p> :
          <div className="tbl"><table><thead><tr><th>이름</th><th>연락처</th><th>자격</th><th>지원일</th></tr></thead><tbody>{apps.map(a => <tr key={a.id}><td>{a.name}</td><td><a href={`tel:${a.phone}`} style={{ color: "var(--info)" }}>{fmtPhone(a.phone)}</a>{a.proxy_phone && <span className="cap" style={{ display: "block" }}>보호자 {fmtPhone(a.proxy_phone)}</span>}</td><td>{(a.lic || []).join(" · ") || "없음"}</td><td>{new Date(a.created_at).toLocaleDateString("ko-KR")}</td></tr>)}</tbody></table></div>}
        <p className="cap" style={{ marginTop: 8 }}>지원자 정보는 채용 연락에만 쓰고, 채용이 끝나면 파기해 주세요(개인정보 보호법).</p></div>}
    </>;
  }

  return <>
    <div className="sec-t"><h2>가입하면 이렇게 보입니다 <span className="tag gy" style={{ verticalAlign: "middle" }}>예시</span></h2><span className="small muted">{biz?.org || "해피케어 방문요양센터"}</span></div>
    <div className="dash"><div className="card hi"><b>27</b><span>이번 주 지원자</span></div><div className="card"><b>3</b><span>진행 중 공고</span></div><div className="card"><b>412</b><span>공고 조회</span></div><Link className="card" href="/biz/talent"><b>41</b><span>우리 동네 구직자 · 인재정보 보기 →</span></Link></div>
    <div className="sec-t"><h2>진행 중 공고 <span className="tag gy" style={{ verticalAlign: "middle" }}>예시</span></h2><BizCta className="btn out sm">+ 새 공고</BizCta></div>
    <div className="card tbl"><table><thead><tr><th>공고</th><th>상품</th><th>상태</th><th className="num">조회</th><th className="num">지원</th><th></th></tr></thead><tbody>
      <tr><td>요양보호사 · 오전 9~12시</td><td><span className="tag or">상위노출 7일</span></td><td><span className="tag gr">노출 중</span></td><td className="num">312</td><td className="num">19</td><td><button className="btn out xs" onClick={() => toast("시범 운영 중에는 예시 화면입니다")}>지원자 보기</button></td></tr>
      <tr><td>요양보호사 · 야간</td><td><span className="tag gy">무료</span></td><td><span className="tag gr">노출 중</span></td><td className="num">64</td><td className="num">5</td><td><Link className="btn out xs" href="/biz/ads">상위노출 추가</Link></td></tr>
      <tr><td>사무행정</td><td><span className="tag gy">무료</span></td><td><span className="tag gy">마감</span></td><td className="num">36</td><td className="num">3</td><td></td></tr>
    </tbody></table></div>
  </>;
}
