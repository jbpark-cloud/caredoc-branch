import type { Job } from "@/lib/types";

type IcoProps = { className?: string; style?: React.CSSProperties };
const base = (p: IcoProps, cls: string) => ({ className: `ico ${cls} ${p.className ?? ""}`.trim(), style: p.style, viewBox: "0 0 24 24" });

export const Ico = {
  pin: (p: IcoProps = {}) => <svg {...base(p, "sm gy")}><path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></svg>,
  pinLg: (p: IcoProps = {}) => <svg {...base(p, "")}><path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></svg>,
  clock: (p: IcoProps = {}) => <svg {...base(p, "sm gy")}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  home: (p: IcoProps = {}) => <svg {...base(p, "")}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>,
  cert: (p: IcoProps = {}) => <svg {...base(p, "")}><circle cx="12" cy="9" r="5" /><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" /></svg>,
  phone: (p: IcoProps = {}) => <svg {...base(p, "sm")} style={{ color: "currentColor", ...p.style }}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>,
  shield: (p: IcoProps = {}) => <svg {...base(p, "")}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  tabHome: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>,
  tabList: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  tabSend: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 8-16 8 3-8z" /></svg>,
  tabCert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="5" /><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" /></svg>,
  tabBiz: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></svg>,
  kakao: () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3C6.5 3 2 6.4 2 10.6c0 2.7 1.8 5 4.5 6.4l-1 3.8c-.1.3.3.6.6.4l4.4-2.9c.5.1 1 .1 1.5.1 5.5 0 10-3.4 10-7.8S17.5 3 12 3z" /></svg>,
  chk: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" fill="rgba(255,255,255,.15)" stroke="none" /><path d="M7 12l3 3 7-7" /></svg>,
  check: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>,
  search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>,
  bell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 21h4" /></svg>,
};

export function GradeEl({ g }: { g: string }) {
  if (!g) return <span className="grade"><b className="gN">–</b>평가 대상 아님</span>;
  return <span className="grade"><b className={`g${g}`}>{g}</b>공단 평가 {g}등급</span>;
}
export const stars = (n: number) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

export function JobTags({ j, short }: { j: Pick<Job, "top" | "urgent" | "caredoc" | "noLic">; short?: boolean }) {
  return <>
    {j.top && <span className="tag or">상위노출</span>}
    {j.urgent && <span className="tag rd">급구</span>}
    {j.caredoc && <span className="tag bl">케어닥 직영</span>}
    {j.noLic && <span className="tag gr">{short ? "자격증 없어도" : "자격증 없어도 가능"}</span>}
  </>;
}

export const daysLabel = (d: number) => (d === 0 ? "오늘" : `${d}일 전`);
export const phoneOf = (id: number) => `02-555-0${String(id).padStart(2, "0")}3`;
export const fmtPhone = (p: string) => String(p).replace(/\D/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
export const maskPhone = (p: string) => String(p).replace(/\D/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-****-$3");

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
