import type { Metadata } from "next";
import Link from "next/link";
import { getJobs, isDemo } from "@/lib/repo";
import { meta } from "@/lib/seo";
import { Ico } from "@/components/ui";
import { BizVerifyBanner, BizCta } from "@/components/biz/BizShared";
import BizDash from "@/components/biz/BizDash";

export const metadata: Metadata = meta("기업회원 · 요양보호사·간병인 무료 채용공고 등록", "복지관·요양원·요양병원·주야간보호 채용공고 등록 무료. 5060 구직자에게 동네 단위로 도달. 상위노출·급구·문자 알림.", "/biz");

export const revalidate = 300;

export default async function BizPage() {
  const JOBS = await getJobs();
  const demo = isDemo();
  const stat = { org: new Set(JOBS.map(j => j.org)).size, jobs: JOBS.length, today: JOBS.filter(j => j.days === 0).length, noLic: JOBS.filter(j => j.noLic).length };
  const recent = demo ? JOBS.filter(j => j.days === 0).slice(0, 3) : [];
  return <>
    <section className="bhero" style={{ marginInline: -16, paddingInline: 16 }}><div className="bhero-in">
      <div className="bhero-copy">
        <span className="bhero-eyebrow">케어잡모아 기업회원</span>
        <h1>요양·돌봄 인력,<br />우리 동네 구직자에게<br /><em>바로</em> 닿습니다</h1>
        <p>공고 등록 0원 · 지원자 열람 0원. 필요할 때만 상위노출·급구·문자 알림을 더하세요.<br />5060 요양보호사·간병인이 매일 들어오는 곳에 공고를 올립니다.</p>
        <div className="bhero-cta"><BizCta>무료로 공고 올리기</BizCta><Link className="btn ghost pill xl" href="/biz/ads">광고 상품 보기</Link></div>
        <ul className="bhero-check"><li><Ico.chk />가입 즉시 공고 작성</li><li><Ico.chk />사업자번호 또는 기관코드 인증 후 노출</li><li><Ico.chk />공단 평가등급 자동 표시</li></ul>
      </div>
      <div className="bhero-side">
        <div className="bhero-stats">
          <div><b>{stat.org.toLocaleString()}</b><span>등록 시설·병원</span></div>
          <div><b>{stat.today}</b><span>오늘 올라온 공고</span></div>
          <div><b>{stat.jobs.toLocaleString()}</b><span>진행 중 공고</span></div>
          <div><b>{stat.noLic}</b><span>자격 무관 공고</span></div>
        </div>
        {demo ? <div className="bhero-card">
          <div className="row" style={{ justifyContent: "space-between" }}><b>지원이 들어오면 이렇게 보입니다</b><span className="tag gy">예시</span></div>
          {recent.map((j, i) => <div className="bhero-row" key={j.id}><span className="av">{["김", "박", "이"][i]}</span><div><b>{["김OO", "박OO", "이OO"][i]} · {[58, 52, 61][i]}세</b><span>{j.job} 지원 · {j.gu} · {["방금", "3분 전", "12분 전"][i]}</span></div><span className="tag gr">{["자격 보유", "케어닥 인증", "자격 보유"][i]}</span></div>)}
        </div> : <div className="bhero-card"><b>지원이 오면 바로 알려드립니다</b><p className="small muted">지원자 이름·연락처·자격이 기업 홈에 바로 쌓이고, 담당자 휴대전화로 알림이 갑니다(문자 연동 후).</p></div>}
      </div>
    </div>
    <div className="bhero-logos"><span>케어잡모아 기업회원</span>{["공고 등록 무료", "지원자 열람 무료", "인증 시설만 노출", "공단 평가등급 자동 표시", "케어닥 운영"].map(n => <b key={n}>{n}</b>)}</div>
    </section>
    <div style={{ marginTop: 20 }}><BizVerifyBanner /></div>
    <BizDash />
    <div className="sec-t"><h2>왜 케어잡모아에 올리나요</h2></div>
    <div className="grid g3">
      <div className="card stack"><h3>맞는 사람만 봅니다</h3><p className="muted">요양·돌봄 직종만 다루는 포탈입니다. 일반 잡포탈처럼 무관한 지원이 섞이지 않습니다.</p></div>
      <div className="card stack"><h3>동네 단위로 도달</h3><p className="muted">시설 반경 기준으로 노출되고, 문자 알림은 해당 동 구직자에게만 갑니다.</p></div>
      <div className="card stack"><h3>시설 신뢰 정보가 곧 광고</h3><p className="muted">평가등급·4대보험·급여 공개를 표시하면 지원율이 올라갑니다. 등급이 좋은 시설일수록 유리합니다.</p></div>
    </div>
  </>;
}
