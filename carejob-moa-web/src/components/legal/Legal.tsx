import Link from "next/link";
import { COMPANY } from "@/lib/constants";

export const or = (v: string, fallback = "공개 전 기재") => v || fallback;

export function LegalShell({ title, effective, children }: { title: string; effective: string; children: React.ReactNode }) {
  return <div style={{ paddingBlock: 24 }}>
    <nav className="crumb"><Link href="/">홈</Link><span>›</span><b>{title}</b></nav>
    <article className="card guide legal" style={{ maxWidth: 880 }}>
      <h1 style={{ fontSize: 28 }}>{title}</h1>
      <p className="cap" style={{ marginTop: 8 }}>시행일 {effective} · {COMPANY.name}</p>
      {children}
      <div className="row" style={{ marginTop: 28 }}><Link className="btn out sm" href="/terms">이용약관</Link><Link className="btn out sm" href="/privacy">개인정보처리방침</Link></div>
    </article>
  </div>;
}
