"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./providers";
import { Ico } from "./ui";
import { isBizPath } from "./Header";
import { COMPANY } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="foot"><div className="wrap">
      <div className="fcols">
        <div><span className="logo" style={{ fontSize: 18 }}><i />케어잡모아</span><p className="cap" style={{ marginTop: 8 }}>요양·돌봄 일자리 전문 잡포탈 · 케어닥 서브 브랜드{COMPANY.tel && <><br />대표전화 {COMPANY.tel} (평일 09~18시)</>}</p></div>
        <div><b>구직자</b><Link href="/jobs">일자리 찾기</Link><Link href="/start">자격증이 없어요</Link><Link href="/guide">돌봄 일자리 가이드</Link><Link href="/me">내 지원 내역</Link></div>
        <div><b>시설·병원</b><Link href="/biz">기업 홈</Link><Link href="/biz/post">공고 등록 (무료)</Link><Link href="/biz/ads">광고 상품</Link><Link href="/biz/ads">광고 문의</Link></div>
        <div><b>케어닥</b><a href="https://caredoc.kr" target="_blank" rel="noopener">케어닥 홈 caredoc.kr</a><Link href="/start#consult">요양보호사 교육 상담</Link><Link href="/guide/요양보호사-자격증">자격증 따는 법</Link></div>
      </div>
      <div className="fbottom"><span>{[COMPANY.name, COMPANY.ceo && `대표 ${COMPANY.ceo}`, COMPANY.address, COMPANY.bizNo && `사업자등록번호 ${COMPANY.bizNo}`, COMPANY.mailOrderNo && `통신판매업 ${COMPANY.mailOrderNo}`, COMPANY.jobInfoNo && `직업정보제공사업 신고 ${COMPANY.jobInfoNo}`, COMPANY.email].filter(Boolean).join(" · ")}</span><span><Link href="/terms">이용약관</Link> · <Link href="/privacy"><b>개인정보처리방침</b></Link></span></div>
    </div></footer>
  );
}

/** 모바일 하단 탭바 (≤900px) */
export function TabBar() {
  const path = usePathname();
  const { requireBiz } = useAuth();
  const bizMode = isBizPath(path);
  // 공고 상세는 하단에 '전화·간편 지원하기' 고정 바가 있으므로 탭바를 숨긴다(겹침 방지)
  if (/^\/jobs\/\d+/.test(decodeURIComponent(path))) return null;
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
