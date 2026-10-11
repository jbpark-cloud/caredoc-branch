"use client";
import { useMemo, useState } from "react";
import { getTalents, GUS } from "@/lib/repo";
import { JOB_TYPES, SCHEDS } from "@/lib/constants";
import type { Talent } from "@/lib/types";
import { useAuth } from "../providers";

export default function TalentClient() {
  const TALENTS = getTalents();
  const { biz, ready, open } = useAuth();
  const [f, setF] = useState({ gu: "전체", job: [] as string[], sched: [] as string[], lic: false, caredoc: false });
  const [limit, setLimit] = useState(30);
  const list = useMemo(() => TALENTS.filter(t => (f.gu === "전체" || t.gu === f.gu) && (!f.job.length || f.job.includes(t.job)) && (!f.sched.length || f.sched.includes(t.sched)) && (!f.lic || t.lic.some(l => l !== "없음")) && (!f.caredoc || t.caredoc)).sort((a, b) => a.last - b.last), [TALENTS, f]);
  const tg = (k: "job" | "sched", v: string) => setF(s => ({ ...s, [k]: s[k].includes(v) ? s[k].filter(x => x !== v) : [...s[k], v] }));
  const chip = (k: "job" | "sched", v: string) => <button key={v} className={`chip${f[k].includes(v) ? " on" : ""}`} onClick={() => tg(k, v)}>{v}</button>;
  const openT = (t: Talent) => { if (!biz) open({ type: "bizjoin", then: () => open({ type: "talent", talent: t }) }); else open({ type: "talent", talent: t }); };
  return <>
    <div style={{ paddingBlock: "24px 8px" }} className="stack"><div className="row" style={{ justifyContent: "space-between" }}><div><h1>인재정보 <span className="muted" style={{ fontSize: 18 }}>{TALENTS.length}명</span></h1><p className="muted">간편지원 후 &quot;다른 시설에서도 연락받을게요&quot;에 동의한 구직자만 보입니다. 열람 무료 · 제안 발송만 유료.</p></div><span className="tag gr" style={{ fontSize: 14 }}>연락처는 구직자가 수락해야 공개</span></div>
      {ready && !biz && <div className="vbanner none" style={{ marginTop: 8 }}><div><b>미리보기 중입니다</b><p>가입하면 프로필 상세와 제안 보내기가 열립니다. 가입 1분, 열람 무료.</p></div><div className="row"><button className="btn out sm" onClick={() => open({ type: "login", kind: "biz" })}>로그인</button><button className="btn sec sm pill" onClick={() => open({ type: "bizjoin", then: () => {} })}>기업회원 1분 가입</button></div></div>}</div>
    <div className="search" style={{ paddingTop: 8 }}>
      <aside className="filter open">
        <div><h3>거주 지역</h3><div className="field"><select aria-label="거주 지역" value={f.gu} onChange={e => setF(s => ({ ...s, gu: e.target.value }))}>{GUS.map(g => <option key={g}>{g}</option>)}</select></div></div>
        <div><h3>희망 직종</h3><div className="chips">{JOB_TYPES.map(s => chip("job", s))}</div></div>
        <div><h3>희망 근무 시간</h3><div className="chips">{SCHEDS.map(s => chip("sched", s))}</div></div>
        <div className={`toggle${f.lic ? " on" : ""}`} role="switch" aria-checked={f.lic} tabIndex={0} onClick={() => setF(s => ({ ...s, lic: !s.lic }))}><span>자격증 보유자만</span><span className="sw" /></div>
        <div className={`toggle${f.caredoc ? " on" : ""}`} role="switch" aria-checked={f.caredoc} tabIndex={0} onClick={() => setF(s => ({ ...s, caredoc: !s.caredoc }))}><span>케어닥 근무 인증만</span><span className="sw" /></div>
        <button className="btn out sm" onClick={() => setF({ gu: "전체", job: [], sched: [], lic: false, caredoc: false })}>조건 모두 지우기</button>
        <div className="card" style={{ background: "var(--info-bg)", borderColor: "transparent" }}><b>제안 보내기 요금(가안)</b><p className="small">건당 5,000원 · 10건 묶음 40,000원 · 월정액 회원 50건 포함. 구직자가 수락하면 연락처가 열립니다. 미수락 건은 환불.</p></div>
      </aside>
      <section>
        <div className="listhead"><h2>{f.gu === "전체" ? "서울" : f.gu} 구직자 <span className="muted" style={{ fontSize: 18 }}>{list.length}명</span></h2><span className="small muted">최근 활동 순</span></div>
        {list.length ? <><div className="tbl listwrap"><table className="list talent"><thead><tr><th className="c-day">활동</th><th className="c-org">구직자</th><th className="c-job">희망 직종 · 자격</th><th className="c-area">거주 · 이동</th><th className="c-time">가능 시간</th><th className="c-pay">희망 급여</th><th className="c-act"></th></tr></thead><tbody>
          {list.slice(0, limit).map(t => <tr key={t.id} className="lr" onClick={() => openT(t)}>
            <td className="c-day"><span className={t.last === 0 ? "new" : ""}>{t.last === 0 ? "오늘" : `${t.last}일 전`}</span><span className="cap">활동</span></td>
            <td className="c-org"><b>{t.name} <span className="muted" style={{ fontWeight: 500 }}>{t.age}세 {t.sex}</span></b><span className="rt">{t.caredoc && <span className="tag bl">케어닥 근무 인증</span>}{t.noLic && <span className="tag gr">자격 취득 예정</span>}<span className="cap">{t.memo}</span></span></td>
            <td className="c-job">{t.job}<span className="cap">{t.lic.join(" · ")}{t.yrs ? ` · 경력 ${t.yrs}년` : " · 신입"}</span></td>
            <td className="c-area">{t.gu} {t.dong}<span className="cap">{t.move}</span></td>
            <td className="c-time">{t.sched}<span className="cap">{t.days}</span></td>
            <td className="c-pay"><b>{t.pay}</b><span className="cap">희망</span></td>
            <td className="c-act"><button className="btn sec pill xs" onClick={e => { e.stopPropagation(); openT(t); }}>제안</button></td></tr>)}
        </tbody></table></div>{list.length > limit && <button className="btn out wide" style={{ marginTop: 12 }} onClick={() => setLimit(l => l + 30)}>더 보기 ({list.length - limit}명 남음)</button>}</>
          : <div className="empty"><p style={{ fontSize: 20, color: "var(--title)" }}>조건에 맞는 구직자가 아직 없어요</p><p>조건을 하나 줄여 보세요.</p></div>}
      </section></div>
  </>;
}
