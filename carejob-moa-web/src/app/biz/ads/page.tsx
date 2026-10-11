import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import { AD_PRODUCTS } from "@/lib/constants";
import { BackToBiz, OrderButton } from "@/components/biz/BizShared";

export const metadata: Metadata = meta("광고 상품 · 상위노출·메인 배너·급구·문자 알림", "공고 등록 무료. 상위노출 7일 3만원부터.", "/biz/ads");
const hi = { background: "var(--primary-bg)" };

export default function AdsPage() {
  return <>
    <div style={{ paddingBlock: 24 }} className="stack"><BackToBiz /><h1>광고 상품</h1><p className="muted">공고 등록과 지원자 열람은 언제나 무료입니다. 가격은 가안이며 확정 전입니다.</p></div>
    <div className="grid g4" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>{AD_PRODUCTS.map(x => <div key={x.key} className={`card price${x.hot ? " hot" : ""}`}>{x.hot && <span className="tag or" style={{ alignSelf: "flex-start" }}>가장 많이 선택</span>}<h3>{x.name}</h3><p className="muted small">{x.desc}</p><p className="p">{x.priceLabel}<small> / {x.period}</small></p><ul>{x.notes.map(l => <li key={l}>{l}</li>)}</ul><OrderButton name={x.name} price={x.priceLabel} className={`btn ${x.hot ? "pri" : "out"} pill`}>신청</OrderButton></div>)}</div>
    <div className="sec-t"><h2>상시 채용 시설이라면 월정액</h2></div>
    <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center", borderColor: "var(--secondary)" }}><div><span className="tag sec">프리미엄 월정액</span><h3 style={{ marginTop: 8 }}>공고 무제한 + 상위노출 2건 상시 + 문자 알림 500건 + 인재 제안 50건</h3><p className="muted">요양원·요양병원처럼 늘 사람을 뽑는 시설용. 월 190,000원(가안).</p></div><OrderButton name="프리미엄 월정액" price="190,000원" className="btn sec pill">상담 신청</OrderButton></div>
    <div className="sec-t"><h2>상품 비교</h2></div>
    <div className="card tbl"><table><thead><tr><th></th><th>무료 공고</th><th style={hi}>상위노출</th><th>메인 배너</th><th>급구</th><th>문자 알림</th><th>월정액</th></tr></thead><tbody>
      <tr><td>목록 노출</td><td>최신순</td><td style={hi}>최상단 고정</td><td>최신순</td><td>상단</td><td>–</td><td>최상단 고정 2건</td></tr>
      <tr><td>첫 화면 노출</td><td>–</td><td style={hi}>눈여겨볼 공고</td><td>배너</td><td>–</td><td>–</td><td>눈여겨볼 공고</td></tr>
      <tr><td>강조 표시</td><td>–</td><td style={hi}>주황 테두리</td><td>로고·사진</td><td>빨간 태그</td><td>–</td><td>주황 테두리</td></tr>
      <tr><td>구직자 직접 도달</td><td>–</td><td style={hi}>–</td><td>–</td><td>–</td><td>문자</td><td>문자 500건 · 제안 50건</td></tr>
      <tr><td className="num">가격(가안)</td><td className="num">0원</td><td className="num" style={hi}>3만원/7일</td><td className="num">15만원/7일</td><td className="num">7천원/3일</td><td className="num">90원/건</td><td className="num">19만원/월</td></tr>
    </tbody></table></div>
  </>;
}
