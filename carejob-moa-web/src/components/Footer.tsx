"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useToast } from "./providers";
import { Ico } from "./ui";
import { isBizPath } from "./Header";

export default function Footer() {
  const toast = useToast();
  return (
    <footer className="foot"><div className="wrap">
      <div className="fcols">
        <div><span className="logo" style={{ fontSize: 18 }}><i />케어잡모아</span><p className="cap" style={{ marginTop: 8 }}>요양·돌봄 일자리 전문 잡포탈 · 케어닥 서브 브랜드<br />대표전화 02-1234-5678 (평일 09~18시)</p></div>
        <div><b>구직자</b><Link href="/jobs">일자리 찾기</Link><Link href="/start">자격증이 없어요</Link><Link href="/guide">돌봄 일자리 가이드</Link><Link href="/me">내 지원 내역</Link></div>
        <div><b>시설·병원</b><Link href="/biz">기업 홈</Link><Link href="/biz/post">공고 등록 (무료)</Link><Link href="/biz/ads">광고 상품</Link><a href="mailto:ad@carejobmoa.kr">광고 문의</a></div>
        <div><b>케어닥</b><a href="https://caredoc.kr" target="_blank" rel="noopener">케어닥 홈 caredoc.kr</a><a href="#" onClick={e => { e.preventDefault(); toast("케어닥 교육원 안내는 준비 중입니다"); }}>요양보호사 교육원</a><a href="#" onClick={e => { e.preventDefault(); toast("케어닥 앱 링크는 준비 중입니다"); }}>케어닥 일자리 찾기 앱</a></div>
      </div>
      <div className="fbottom"><span>(주)케어닥 · 서울특별시 · 사업자등록번호 000-00-00000 · 직업정보제공사업 신고번호 J0000000000000</span><span>이용약관 · 개인정보처리방침</span></div>
    </div></footer>
  );
}

/** 모바일 하단 탭바 (≤900px) */
export function TabBar() {
  const path = usePathname();
  const { requireBiz } = useAuth();
  const bizMode = isBizPath(path);
  const on = (h: string) => (h === "/" || h === "/biz" ? path === h : path.startsWith(h)) ? "on" : "";
  if (bizMode) return (
    <nav className="tabbar five">
      <Link href="/biz" className={on("/biz") && path === "/biz" ? "on" : ""}><Ico.tabHome />기업 홈</Link>
      <Link href="/biz/post" className={on("/biz/post")} onClick={e => { if (!on("/biz/post")) { e.preventDefault(); requireBiz(() => { window.location.href = "/biz/post"; }); } }}><Ico.tabSend />공고 등록</Link>
      <Link href="/biz/talent" className={on("/biz/talent")}><Ico.tabList />인재정보</Link>
      <Link href="/biz/ads" className={on("/biz/ads")}><Ico.tabCert />광고</Link>
      <Link href="/"><Ico.tabBiz />구직자</Link>
    </nav>);
  return (
    <nav className="tabbar five">
      <Link href="/" className={on("/")}><Ico.tabHome />홈</Link>
      <Link href="/jobs" className={on("/jobs")}><Ico.tabList />일자리</Link>
      <Link href="/me" className={on("/me")}><Ico.tabSend />내 지원</Link>
      <Link href="/start" className={on("/start")}><Ico.tabCert />자격증</Link>
      <Link href="/biz"><Ico.tabBiz />기업회원</Link>
    </nav>);
}
