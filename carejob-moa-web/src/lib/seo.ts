import type { Metadata } from "next";
import type { Job, Facility } from "./types";
import { SITE_URL, SITE_NAME } from "./constants";

export const safeDecode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
export const slug = (s: string) => String(s).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

export const jobPath = (j: Job) => `/jobs/${j.id}-${slug(j.org)}-${slug(j.job)}-${slug(j.gu)}`;
export const facilityPath = (f: { id: number; org: string }) => `/facility/${f.id}-${slug(f.org)}`;
export const parseIdSlug = (s: string): number | null => { const m = /^(\d+)(?:-|$)/.exec(safeDecode(s)); return m ? parseInt(m[1], 10) : null; };

export function meta(title: string, description: string, path: string, extra: Partial<Metadata> = {}): Metadata {
  const url = SITE_URL + encodeURI(path);
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, type: "website", locale: "ko_KR" },
    ...extra,
  };
}

export function jobLD(j: Job) {
  const [gu, dong] = j.area.split(" ");
  const num = parseInt(j.pay.replace(/[^\d]/g, ""), 10) * (j.pay.includes("만원") ? 10000 : 1);
  const posted = new Date(Date.now() - j.days * 864e5);
  const validThrough = new Date(posted.getTime() + 30 * 864e5);
  return {
    "@context": "https://schema.org/", "@type": "JobPosting",
    title: j.title,
    description: `${j.duty.join(". ")}. 자격: ${j.req}. 근무시간: ${j.hours.join(" ")}. 복리후생: ${j.benef.join(", ")}`,
    datePosted: posted.toISOString().slice(0, 10),
    validThrough: validThrough.toISOString().slice(0, 10),
    employmentType: j.sched === "단기" ? "TEMPORARY" : j.sched === "주3일" || j.sched === "오전만" ? "PART_TIME" : "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: j.org, sameAs: SITE_URL + encodeURI(facilityPath(j)) },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressRegion: "서울특별시", addressLocality: gu, streetAddress: dong, addressCountry: "KR" } },
    baseSalary: { "@type": "MonetaryAmount", currency: "KRW", value: { "@type": "QuantitativeValue", value: num, unitText: j.pay.startsWith("시급") ? "HOUR" : j.pay.startsWith("일급") ? "DAY" : j.pay.startsWith("연봉") ? "YEAR" : "MONTH" } },
    identifier: { "@type": "PropertyValue", name: "carejobmoa", value: String(j.id) },
    industry: "노인복지·요양", directApply: true, url: SITE_URL + encodeURI(jobPath(j)),
  };
}

export function facilityLD(f: Facility) {
  return { "@context": "https://schema.org", "@type": "Organization", name: f.org, url: SITE_URL + encodeURI(facilityPath(f)), address: { "@type": "PostalAddress", addressRegion: "서울특별시", addressLocality: f.gu, addressCountry: "KR" }, ...(f.reviews ? { aggregateRating: { "@type": "AggregateRating", ratingValue: f.score, reviewCount: f.reviews, bestRating: 5 } } : {}) };
}

export function breadcrumbLD(items: { name: string; path: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: SITE_URL + encodeURI(it.path) })) };
}
