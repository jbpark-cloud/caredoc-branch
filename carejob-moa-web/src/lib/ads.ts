// 첫 화면 광고 자리 구성 (서버·클라이언트 공용 순수 함수)
// - 시범 운영: 가상 시설 광고를 '예시' 표시와 함께 보여 준다(시범 공고의 가상 시설을 그대로 사용 → 누르면 그 예시 공고로 이동)
// - 실서비스: 가상 광고는 전부 사라지고, 유료 상위노출 공고·케어닥 자사 안내·광고 문의만 남는다
import type { Job } from "./types";
import { jobPath } from "./seo";

export interface Slide {
  key: string; href: string; img?: string;
  tone: "fac" | "brand" | "biz";      // 시설 채용 광고 / 케어닥 자사 / 광고 문의
  tag: string; sample: boolean; org?: string; title: string; sub: string; cta: string;
}
export interface PremiumAd { job: Job; sample: boolean }

const firstOf = (jobs: Job[], facs: string[], types: string[], skip: Set<number>) =>
  jobs.find(j => !j.caredoc && j.top && !skip.has(j.id) && facs.includes(j.fac) && types.includes(j.job))
  ?? jobs.find(j => !j.caredoc && !skip.has(j.id) && facs.includes(j.fac) && types.includes(j.job));

const facSlide = (j: Job, img: string): Slide => ({
  key: "fac" + j.id, href: jobPath(j), img, tone: "fac", tag: "채용 광고", sample: true, org: j.org,
  title: `${j.job} 선생님을 모십니다`, sub: [j.area, j.hours[0], j.pay].filter(Boolean).join(" · "), cta: "공고 보기",
});

const EDU: Slide = { key: "edu", href: "/start", img: "/ads/study.jpg", tone: "brand", tag: "케어닥 교육 상담", sample: false, title: "자격증이 없어도 괜찮아요", sub: "요양보호사 자격, 4단계로 준비하는 방법을 알려드립니다", cta: "자격 취득 과정 보기" };
const HIRE: Slide = { key: "hire", href: "/jobs?q=" + encodeURIComponent("케어닥"), img: "/ads/hands.jpg", tone: "brand", tag: "케어닥 채용", sample: false, title: "케어닥과 함께 일할 분을 찾습니다", sub: "방문요양 · 어르신돌봄학교 · 케어홈", cta: "케어닥 공고 보기" };
const INQUIRY: Slide = { key: "inq", href: "/biz/ads", tone: "biz", tag: "시설·병원 담당자", sample: false, title: "이 자리에 우리 시설을 알리세요", sub: "첫 화면 배너로 동네 구직자에게 먼저 보입니다", cta: "광고 상품 보기" };

export function buildSlides(jobs: Job[], demo: boolean): { slides: Slide[]; used: Set<number> } {
  const used = new Set<number>();
  if (!demo) {
    const hasCaredoc = jobs.some(j => j.caredoc);
    return { slides: [EDU, ...(hasCaredoc ? [HIRE] : []), INQUIRY], used };
  }
  const a = firstOf(jobs, ["실버타운", "요양원"], ["요양보호사"], used); if (a) used.add(a.id);
  const b = firstOf(jobs, ["요양병원"], ["간병인", "요양보호사", "간호조무사"], used); if (b) used.add(b.id);
  return { slides: [...(a ? [facSlide(a, "/ads/lounge.jpg")] : []), EDU, ...(b ? [facSlide(b, "/ads/ward.jpg")] : []), HIRE], used };
}

/** 프리미엄 채용관: 상위노출 공고를 시설당 1건씩, 최대 n건 */
export function buildPremium(jobs: Job[], demo: boolean, skip: Set<number>, n = 7): PremiumAd[] {
  const seen = new Set<string>(); const out: PremiumAd[] = [];
  for (const j of jobs) {
    if (!j.top || j.closed || skip.has(j.id) || seen.has(j.org) || (demo && j.caredoc)) continue;
    seen.add(j.org); out.push({ job: j, sample: demo });
    if (out.length >= n) break;
  }
  return out;
}

/** 목록·카드에 필요 없는 긴 필드는 떼고 내려보낸다(첫 화면 용량 절감) */
export const slimJob = (j: Job): Job => ({ ...j, rv: [], duty: [], benef: [], req: "" });
