"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useToast } from "./providers";
import { Ico, maskPhone } from "./ui";
import { BIZ_STATUS_LABEL } from "@/lib/constants";

export const isBizPath = (p: string) => p === "/biz" || p.startsWith("/biz/");

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const { user, biz, open, ready } = useAuth();
  const toast = useToast();
  const bizMode = isBizPath(path);
  const userNav = [["/", "홈"], ["/jobs", "일자리 찾기"], ["/start", "자격증이 없어요"], ["/guide", "가이드"]];
  const bizNav = [["/biz", "기업 홈"], ["/biz/post", "공고 등록"], ["/biz/talent", "인재정보"], ["/biz/ads", "광고 상품"]];
  const on = (href: string) => href === "/" || href === "/biz" ? path === href : path.startsWith(href);

  return (
    <header className="hdr">
      <div className="wrap">
        <Link className="logo" href="/"><i />케어잡모아 <small>by 케어닥</small></Link>
        <nav className="nav" aria-label="주 메뉴">{(bizMode ? bizNav : userNav).map(([h, l]) => <Link key={h} href={h} className={on(h) ? "on" : ""}>{l}</Link>)}</nav>
        <span className="sp" />
        <form className="hsearch" onSubmit={e => { e.preventDefault(); const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim(); router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs"); }}>
          <input name="q" placeholder="동 이름·직종·시설명 검색" aria-label="검색" /><button type="submit" aria-label="검색"><Ico.search /></button>
        </form>
        <span id="auth-slot">
          {!ready ? null : bizMode ? (biz
            ? <Link className="uchip" href="/biz/me"><b>{biz.org}</b><span className={`tag ${biz.status === "verified" ? "gr" : biz.status === "pending" ? "bl" : "gy"}`}>{BIZ_STATUS_LABEL[biz.status]}</span></Link>
            : <><button className="btn out sm pill" onClick={() => open({ type: "login", kind: "biz" })}>로그인</button><button className="btn sec sm pill" onClick={() => open({ type: "bizjoin" })}>1분 가입</button></>)
            : (user
              ? <Link className="uchip" href="/me"><b>{user.name}님</b><span className="cap">{maskPhone(user.phone)}</span></Link>
              : <button className="btn out sm pill" onClick={() => open({ type: "login" })}>로그인</button>)}
        </span>
        <button className="hicon" onClick={() => toast("알림 0건")} aria-label="알림"><Ico.bell /></button>
        <div className="mode" role="tablist" aria-label="이용자 전환">
          <Link href="/" className={!bizMode ? "on" : ""}>일자리 찾기</Link>
          <Link href="/biz" className={bizMode ? "on" : ""}>기업회원</Link>
        </div>
      </div>
    </header>
  );
}
