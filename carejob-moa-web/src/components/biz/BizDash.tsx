"use client";
import Link from "next/link";
import { useAuth, useToast } from "../providers";
import { BizCta } from "./BizShared";

export default function BizDash() {
  const { biz } = useAuth(); const toast = useToast();
  return <>
    {biz ? <div className="sec-t"><h2>우리 시설 채용 현황</h2><span className="small muted">{biz.org}</span></div> : <div className="sec-t"><h2>가입하면 이렇게 보입니다 <span className="cap">샘플</span></h2><span className="small muted">해피케어 방문요양센터</span></div>}
    <div className="dash"><div className="card hi"><b>27</b><span>이번 주 지원자</span></div><div className="card"><b>3</b><span>진행 중 공고</span></div><div className="card"><b>412</b><span>공고 조회</span></div><Link className="card" href="/biz/talent"><b>41</b><span>우리 동네 구직자 · 인재정보 보기 →</span></Link></div>
    <div className="sec-t"><h2>진행 중 공고</h2><BizCta className="btn out sm">+ 새 공고</BizCta></div>
    <div className="card tbl"><table><thead><tr><th>공고</th><th>상품</th><th>상태</th><th className="num">조회</th><th className="num">지원</th><th></th></tr></thead><tbody>
      <tr><td>요양보호사 · 오전 9~12시</td><td><span className="tag or">상위노출 7일</span></td><td><span className="tag gr">노출 중</span></td><td className="num">312</td><td className="num">19</td><td><button className="btn out xs" onClick={() => toast("지원자 목록은 DB 연결 후 제공됩니다")}>지원자 보기</button></td></tr>
      <tr><td>요양보호사 · 야간</td><td><span className="tag gy">무료</span></td><td><span className="tag gr">노출 중</span></td><td className="num">64</td><td className="num">5</td><td><Link className="btn out xs" href="/biz/ads">상위노출 추가</Link></td></tr>
      <tr><td>사무행정</td><td><span className="tag gy">무료</span></td><td><span className="tag gy">마감</span></td><td className="num">36</td><td className="num">3</td><td></td></tr>
    </tbody></table></div>
  </>;
}
