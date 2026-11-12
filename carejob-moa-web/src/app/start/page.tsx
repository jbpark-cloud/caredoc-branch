import type { Metadata } from "next";
import Link from "next/link";
import { getJobs } from "@/lib/repo";
import { meta } from "@/lib/seo";
import { JobCard } from "@/components/jobs";
import ConsultButton from "@/components/ConsultButton";

export const metadata: Metadata = meta("자격증 없이 시작하는 돌봄 일자리 · 요양보호사 자격 취득 로드맵", "병원동행·생활지원·조리보조 등 자격증 없이 지금 가능한 일과 요양보호사 자격 취득 4단계. 교육 상담 무료.", "/start");

export const revalidate = 60;

export default async function StartPage() {
  const now = (await getJobs()).filter(j => j.noLic);
  const hi = { background: "var(--primary-bg)" };
  return <>
    <div style={{ paddingBlock: 24 }} className="stack">
      <span className="tag gr" style={{ alignSelf: "flex-start" }}>자격증이 없어도 괜찮습니다</span>
      <h1>오늘 시작할 수 있는 일부터,<br />요양보호사가 되는 길까지</h1>
      <p className="muted" style={{ maxWidth: 640 }}>자격증이 없어도 바로 할 수 있는 일이 있습니다. 일하면서 자격을 따면 급여와 선택지가 넓어집니다.</p>
    </div>
    <div className="sec-t"><h2>지금 바로 가능한 일 <span className="muted" style={{ fontSize: 18 }}>{now.length}건</span></h2><Link href="/jobs/자격무관">전체 보기 →</Link></div>
    <div className="grid g3">{now.slice(0, 6).map(j => <JobCard key={j.id} j={j} />)}</div>
    <div className="sec-t"><h2>요양보호사 자격, 이렇게 4단계</h2><span className="small muted">처음 따는 분 기준 교육 320시간 · 세부 내용은 교육원 확인</span></div>
    <div className="road">
      <div className="now"><b>1</b><h3>지금 가능한 일로 시작</h3><p>병원동행·생활지원·조리보조·간병인 협회 등록. 현장을 먼저 경험합니다.</p></div>
      <div><b>2</b><h3>교육원 등록 (320시간)</h3><p>이론 126 · 실기 114 · 현장실습 80시간. 야간·주말반을 운영하는 교육원도 있어 일과 병행할 수 있습니다.</p></div>
      <div><b>3</b><h3>자격시험 응시</h3><p>국시원 시험센터에서 컴퓨터로 봅니다. 필기·실기 각각 만점의 60% 이상이면 합격입니다.</p></div>
      <div><b>4</b><h3>자격증으로 다시 지원</h3><p>요양원·방문요양·주야간보호의 요양보호사 공고 전체에 지원할 수 있습니다.</p></div>
    </div>
    <div className="card" id="consult" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
      <div><h3>요양보호사 교육 상담 받기</h3><p className="muted">자격 취득 절차와 교육 과정을 전화로 안내해 드립니다. 상담 무료.</p></div>
      <ConsultButton />
    </div>
    <div className="sec-t"><h2>자격이 필요한 일과 필요 없는 일</h2></div>
    <div className="card tbl"><table><thead><tr><th>직종</th><th>필요 자격</th><th>급여 방식</th></tr></thead><tbody>
      <tr><td>병원동행매니저</td><td>없음 (기관 교육 이수)</td><td>건별 정산이 많음</td></tr>
      <tr><td>생활지원사</td><td>없음</td><td>월급제 (하루 5시간 안팎)</td></tr>
      <tr><td>조리원·조리보조</td><td>없음 (보건증)</td><td>월급제 또는 시급제</td></tr>
      <tr><td>간병인</td><td>없음 (협회 교육 권장)</td><td>일급제 또는 월급제</td></tr>
      <tr><td style={hi}>요양보호사</td><td style={hi}>국가자격 (교육 320시간 + 시험)</td><td style={hi}>시급제(방문) · 월급제(시설)</td></tr>
      <tr><td>사회복지사</td><td>2급 이상</td><td>월급제</td></tr>
    </tbody></table></div>
    <p className="cap" style={{ marginTop: 8 }}>급여는 시설과 근무 시간에 따라 다릅니다. 공고의 급여 표시를 확인해 주세요.</p>
  </>;
}
