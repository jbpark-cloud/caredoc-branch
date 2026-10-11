import type { Metadata } from "next";
import Link from "next/link";
import { getJobs } from "@/lib/repo";
import { meta } from "@/lib/seo";
import { JobCard } from "@/components/jobs";
import ConsultButton from "@/components/ConsultButton";

export const metadata: Metadata = meta("자격증 없이 시작하는 돌봄 일자리 · 요양보호사 자격 취득 로드맵", "병원동행·생활지원·조리보조 등 자격증 없이 지금 가능한 일과 요양보호사 자격 취득 4단계. 케어닥 교육원 상담 무료.", "/start");

export default function StartPage() {
  const now = getJobs().filter(j => j.noLic);
  const hi = { background: "var(--primary-bg)" };
  return <>
    <div style={{ paddingBlock: 24 }} className="stack">
      <span className="tag gr" style={{ alignSelf: "flex-start" }}>자격증이 없어도 괜찮습니다</span>
      <h1>오늘 시작할 수 있는 일부터,<br />요양보호사가 되는 길까지</h1>
      <p className="muted" style={{ maxWidth: 640 }}>자격증이 없어도 바로 할 수 있는 일이 있습니다. 일하면서 자격을 따면 급여와 선택지가 넓어집니다.</p>
    </div>
    <div className="sec-t"><h2>지금 바로 가능한 일 <span className="muted" style={{ fontSize: 18 }}>{now.length}건</span></h2><Link href="/jobs/자격무관">전체 보기 →</Link></div>
    <div className="grid g3">{now.slice(0, 6).map(j => <JobCard key={j.id} j={j} />)}</div>
    <div className="sec-t"><h2>요양보호사 자격, 이렇게 4단계</h2><span className="small muted">교육 240시간 기준 · 세부 내용은 교육원 확인</span></div>
    <div className="road">
      <div className="now"><b>1</b><h3>지금 가능한 일로 시작</h3><p>병원동행·생활지원·조리보조·간병인 협회 등록. 현장을 먼저 경험합니다.</p></div>
      <div><b>2</b><h3>교육원 등록 (240시간)</h3><p>이론·실기·현장실습. 야간·주말반이 있어 일과 병행 가능. 케어닥 제휴 교육원 할인.</p></div>
      <div><b>3</b><h3>국가시험 응시</h3><p>연 3회 이상 시행. 합격률 90% 안팎(미확인). 시험 대비 문제집은 케어닥이 무료 제공.</p></div>
      <div><b>4</b><h3>자격증으로 재지원</h3><p>요양보호사 공고 전체가 열립니다. 시급 13,800~15,000원, 월 235~290만원대(샘플 공고 기준).</p></div>
    </div>
    <div className="card" id="consult" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
      <div><h3>케어닥 교육원 상담 받기</h3><p className="muted">내 동네 교육원과 야간반 일정을 전화로 안내해 드립니다. 상담 무료.</p></div>
      <ConsultButton />
    </div>
    <div className="sec-t"><h2>자격이 필요한 일과 필요 없는 일</h2></div>
    <div className="card tbl"><table><thead><tr><th>직종</th><th>필요 자격</th><th>준비 기간</th><th className="num">샘플 급여</th></tr></thead><tbody>
      <tr><td>병원동행매니저</td><td>없음 (케어닥 교육 8시간)</td><td>1주</td><td className="num">건당 3~3.5만원</td></tr>
      <tr><td>생활지원사</td><td>없음</td><td>바로</td><td className="num">월 118만원</td></tr>
      <tr><td>조리원·조리보조</td><td>없음 (보건증)</td><td>1주</td><td className="num">월 205만원</td></tr>
      <tr><td>간병인</td><td>없음 (협회 교육 권장)</td><td>1~2주</td><td className="num">일 13~15만원</td></tr>
      <tr><td style={hi}>요양보호사</td><td style={hi}>국가자격 (교육 240시간 + 시험)</td><td style={hi}>3~4개월</td><td className="num" style={hi}>월 235~290만원</td></tr>
      <tr><td>사회복지사</td><td>2급 이상 (학점 이수)</td><td>1~2년</td><td className="num">월 268만원</td></tr>
    </tbody></table></div>
  </>;
}
