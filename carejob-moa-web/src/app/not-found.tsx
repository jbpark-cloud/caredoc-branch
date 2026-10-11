import Link from "next/link";
export default function NotFound() {
  return <div style={{ paddingBlock: 64, textAlign: "center" }} className="stack"><h1>페이지를 찾을 수 없어요</h1><p className="muted">공고가 마감되었거나 주소가 바뀌었을 수 있습니다.</p><div className="row" style={{ justifyContent: "center", marginTop: 12 }}><Link className="btn out" href="/">홈으로</Link><Link className="btn pri pill" href="/jobs">일자리 찾기</Link></div></div>;
}
