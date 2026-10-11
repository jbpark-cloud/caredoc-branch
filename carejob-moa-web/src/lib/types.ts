export type Sched = "오전만" | "주간" | "주3일" | "야간" | "입주" | "단기";
export type Grade = "A" | "B" | "C" | "D" | "";

export interface Review {
  who: string;
  text: string;
  score: number;
}

export interface Job {
  id: number;
  job: string; // 직종
  fac: string; // 시설 유형(짧은 이름)
  area: string; // "강남구 대치동"
  gu: string;
  sched: Sched;
  hours: [string, string];
  pay: string;
  grade: Grade;
  ins: boolean; // 4대보험
  payOpen: boolean;
  score: number;
  reviews: number;
  noLic: boolean;
  urgent: boolean;
  caredoc: boolean;
  org: string;
  dist: string;
  days: number; // 등록 후 경과일
  top: boolean; // 상위노출
  title: string;
  benef: string[];
  duty: string[];
  req: string;
  head: number;
  rv: Review[];
}

export interface Facility {
  id: number; // 대표 공고 id (시설 페이지 URL용)
  org: string;
  fac: string;
  gu: string;
  area: string;
  grade: Grade;
  ins: boolean;
  payOpen: boolean;
  score: number;
  reviews: number;
  caredoc: boolean;
  jobs: Job[];
  rv: Review[];
}

export interface Talent {
  id: number;
  name: string; // "김OO"
  age: number;
  sex: "여" | "남";
  gu: string;
  dong: string;
  lic: string[];
  job: string;
  yrs: number;
  sched: Sched;
  days: string;
  pay: string;
  last: number;
  caredoc: boolean;
  care: string;
  move: string;
  memo: string;
  noLic: boolean;
}

export interface Guide {
  slug: string;
  title: string;
  kw: string;
  lead: string;
  sections: [string, string][];
  cta: { t: string; href: string };
  cta2: { t: string; href: string };
}

export interface SearchFilter {
  gu: string; // "전체" | 구
  q: string;
  job: string[];
  sched: string[];
  fac: string[];
  noLic: boolean;
  sort: "near" | "new" | "grade";
  view: "list" | "card";
}

export type BizStatus = "none" | "pending" | "verified";

export interface SeekerUser {
  name: string;
  phone: string;
  lic: string[];
  caredoc: boolean;
  open: boolean;
}

export interface BizUser {
  org: string;
  fac: string;
  email: string;
  status: BizStatus;
  name: string;
  phone: string;
  bizno?: string;
  ltc?: string;
}
