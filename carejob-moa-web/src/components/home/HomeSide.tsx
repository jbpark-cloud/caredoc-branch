"use client";
import Link from "next/link";
import { useAuth } from "../providers";

/** 첫 화면 오른쪽 상자(PC): 로그인 안내 또는 내 활동 요약 + 자주 쓰는 바로가기 */
export default function HomeSide() {
  const { user, ready, open, applied, saved } = useAuth();
  return (
    <aside className="hside" aria-label="내 정보 바로가기">
      {ready && user ? <>
        <p className="hside-t"><b>{user.name}님</b>, 안녕하세요</p>
        <div className="hside-kpi">
          <Link href="/me"><b>{applied.length}</b><span>지원한 공고</span></Link>
          <Link href="/me"><b>{saved.length}</b><span>저장한 공고</span></Link>
        </div>
        <Link className="btn out sm wide" href="/me">내 지원 내역 보기</Link>
      </> : <>
        <p className="hside-t"><b>전화번호만 있으면</b><br />가입과 지원이 한 번에 됩니다</p>
        <button type="button" className="btn sec wide" onClick={() => open({ type: "login", kind: "user" })}>로그인 · 간편 가입</button>
        <p className="cap">비밀번호 없이 문자 인증으로 로그인합니다</p>
      </>}
      <ul className="hside-links">
        <li><Link href="/jobs/자격무관">자격증 없이 가능한 일</Link></li>
        <li><Link href="/guide/요양보호사-자격증">요양보호사 자격증 따는 법</Link></li>
        <li><Link href="/biz">시설·병원 공고 등록 <em>무료</em></Link></li>
      </ul>
    </aside>
  );
}
