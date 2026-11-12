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
/** 시설이 등록한 연락처에서 숫자만. 형식이 전화번호가 아니면 빈 문자열 */
export const telDigits = (p?: string | null) => { const d = String(p ?? "").replace(/\D/g, ""); return /^0\d{8,10}$|^1\d{7}$/.test(d) ? d : ""; };
export const fmtTel = (p?: string | null) => { const d = telDigits(p); if (!d) return ""; if (d.length === 8) return d.replace(/(\d{4})(\d{4})/, "$1-$2"); if (d.startsWith("02")) return d.replace(/(02)(\d{3,4})(\d{4})/, "$1-$2-$3"); return d.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3"); };
export const fmtPhone = (p: string) => String(p).replace(/\D/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
export const maskPhone = (p: string) => String(p).replace(/\D/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-****-$3");

export function JsonLd({ data }: { data: object }) {
  // 공고 제목·시설명은 기업회원이 입력한다 → "</script>" 로 스크립트를 끼워 넣지 못하게 꺾쇠·& 를 유니코드 이스케이프
  const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** 시설 로고 자리 표시(로고 이미지가 없을 때): 시설명 앞 두 글자 + 이름에서 정해지는 색. 케어닥 직영은 케어닥 원형 마크 */
const LOGO_COLORS = ["#483D8B", "#0A8F5A", "#1F6FD1", "#B4552D", "#5F6B7A", "#7A4FA3"];
export function LogoMark({ name, size = 44 }: { name: string; size?: number }) {
  if (name.startsWith("케어닥")) return <span className="lgm cd" style={{ width: size, height: size }} aria-hidden="true"><i /></span>;
  let h = 0; for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return <span className="lgm" style={{ width: size, height: size, background: LOGO_COLORS[h % LOGO_COLORS.length], fontSize: Math.round(size * 0.36) }} aria-hidden="true">{[...name.replace(/\s/g, "")].slice(0, 2).join("")}</span>;
}

/** 직종 바로가기 아이콘 (라인 1.5px) */
const jb = { viewBox: "0 0 24 24", className: "jico", "aria-hidden": true } as const;
export const JobIco: Record<string, () => JSX.Element> = {
  "요양보호사": () => <svg {...jb}><path d="M12 20s-7-4.4-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.6 12 20 12 20z" /></svg>,
  "간병인": () => <svg {...jb}><path d="M3 18v-7h11a4 4 0 0 1 4 4v3M3 18h18M3 11V6M21 18v-3" /><circle cx="7" cy="8.5" r="1.8" /></svg>,
  "사회복지사": () => <svg {...jb}><circle cx="9" cy="8" r="3" /><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><circle cx="17" cy="9" r="2.3" /><path d="M16.5 13.6c2.6.2 4.5 2 4.5 4.9" /></svg>,
  "간호조무사": () => <svg {...jb}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8.5v7M8.5 12h7" /></svg>,
  "간호사": () => <svg {...jb}><path d="M6 9l1.5-4h9L18 9" /><path d="M6 9h12v4a6 6 0 0 1-12 0z" /><path d="M12 10.5v3M10.5 12h3" /></svg>,
  "병원동행매니저": () => <svg {...jb}><circle cx="8" cy="5.5" r="2" /><circle cx="16.5" cy="6.5" r="1.8" /><path d="M5 20l1.5-6L5 11l3-2 2.5 3 3 .5M10.5 20l-1.5-5M14 20l1-5.5 2-1.5 2 2.5V20" /></svg>,
  "생활지원사": () => <svg {...jb}><path d="M4 11l8-6.5 8 6.5v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><path d="M12 17s-2.8-1.7-2.8-3.6a1.5 1.5 0 0 1 2.8-.8 1.5 1.5 0 0 1 2.8.8C14.800 15.300 12 17 12 17z" /></svg>,
  "자격무관": () => <svg {...jb}><circle cx="12" cy="12" r="8.5" /><path d="M8 12.3l2.7 2.7L16 9.500" /></svg>,
};
