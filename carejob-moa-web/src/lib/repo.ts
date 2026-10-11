// 데이터 접근 계층. 지금은 시드 데이터(동기, 서버·클라이언트 공용).
// Supabase 연결 시 이 파일의 함수만 async 로 바꾸고 supabase/*.ts 로 교체하면 화면 코드는 그대로.
import type { Job, Facility, Talent, SearchFilter } from "./types";
import { seedJobs } from "./data/seed-jobs";
import { seedTalents } from "./data/seed-talents";
import { GU_LIST, JOB_TYPES } from "./constants";
import { safeDecode } from "./seo";

export const getJobs = (): Job[] => seedJobs();
export const getJob = (id: number): Job | null => seedJobs().find(j => j.id === id) ?? null;
export const getTalents = (): Talent[] => seedTalents();

export function getFacility(idOrOrg: number | string): Facility | null {
  const JOBS = seedJobs();
  const base = typeof idOrOrg === "number" ? JOBS.find(j => j.id === idOrOrg) : JOBS.find(j => j.org === idOrOrg);
  if (!base) return null;
  const js = JOBS.filter(j => j.org === base.org);
  const j = js[0];
  return { id: j.id, org: j.org, fac: j.fac, gu: j.gu, area: j.area, grade: j.grade, ins: j.ins, payOpen: j.payOpen, score: Math.max(...js.map(x => x.score)), reviews: js.reduce((a, x) => a + x.reviews, 0), caredoc: j.caredoc, jobs: js, rv: j.rv };
}

export function listFacilities(): Facility[] {
  const seen = new Set<string>(); const out: Facility[] = [];
  for (const j of seedJobs()) { if (seen.has(j.org)) continue; seen.add(j.org); const f = getFacility(j.org); if (f) out.push(f); }
  return out;
}

export const GUS = ["전체", ...[...new Set(seedJobs().map(j => j.gu))].sort((a, b) => a.localeCompare(b, "ko"))];

export const defaultFilter = (): SearchFilter => ({ gu: "전체", q: "", job: [], sched: [], fac: [], noLic: false, sort: "near", view: "list" });

export function distNum(d: string) { const m = d.match(/\d+/); let n = m ? +m[0] : 0; if (d.includes("버스")) n = n * 4 + 5; if (d.includes("지하철")) n = n * 5 + 8; return n; }

export function filterJobs(f: SearchFilter): Job[] {
  const r = seedJobs().filter(j => (f.gu === "전체" || j.gu === f.gu) && (!f.q || j.area.includes(f.q) || j.job.includes(f.q) || j.org.includes(f.q) || j.title.includes(f.q)) && (!f.job.length || f.job.includes(j.job)) && (!f.sched.length || f.sched.includes(j.sched)) && (!f.fac.length || f.fac.includes(j.fac)) && (!f.noLic || j.noLic));
  const top = r.filter(j => j.top), rest = r.filter(j => !j.top);
  const sortf = { near: (a: Job, b: Job) => distNum(a.dist) - distNum(b.dist), new: (a: Job, b: Job) => a.days - b.days, grade: (a: Job, b: Job) => (a.grade || "F").localeCompare(b.grade || "F") }[f.sort];
  return [...top.sort(sortf), ...rest.sort(sortf)];
}

/** URL 세그먼트(/jobs/{구}/{직종}/자격무관) + 쿼리 → 필터 */
export function filterFromUrl(segments: string[], sp: Record<string, string | string[] | undefined>): SearchFilter {
  const f = defaultFilter();
  for (const raw of segments) {
    const s = safeDecode(raw).replace(/-/g, " ");
    if ((GU_LIST as readonly string[]).includes(s)) f.gu = s;
    else if ((JOB_TYPES as readonly string[]).includes(s)) f.job = [s];
    else if (s === "자격무관") f.noLic = true;
  }
  const one = (k: string) => { const v = sp[k]; return Array.isArray(v) ? v[0] : v; };
  const many = (k: string) => { const v = one(k); return v ? v.split(",").filter(Boolean) : []; };
  if (one("q")) f.q = one("q")!;
  if (many("job").length) f.job = many("job");
  if (many("sched").length) f.sched = many("sched");
  if (many("fac").length) f.fac = many("fac");
  if (one("noLic") === "1") f.noLic = true;
  if (one("gu")) f.gu = one("gu")!;
  const sort = one("sort"); if (sort === "new" || sort === "grade") f.sort = sort;
  if (one("view") === "card") f.view = "card";
  return f;
}

/** 필터 → 정규 URL. 구·단일 직종·자격무관은 경로로, 나머지는 쿼리로 */
export function urlFromFilter(f: SearchFilter): string {
  const gu = f.gu && f.gu !== "전체" ? f.gu : "";
  const job = f.job.length === 1 ? f.job[0] : "";
  const path = "/jobs" + (gu ? "/" + gu : "") + (job ? "/" + job : "") + (f.noLic && !job ? "/자격무관" : "");
  const q = new URLSearchParams();
  if (f.q) q.set("q", f.q);
  if (f.job.length > 1) q.set("job", f.job.join(","));
  if (f.sched.length) q.set("sched", f.sched.join(","));
  if (f.fac.length) q.set("fac", f.fac.join(","));
  if (f.noLic && job) q.set("noLic", "1");
  if (f.sort !== "near") q.set("sort", f.sort);
  if (f.view === "card") q.set("view", "card");
  const qs = q.toString();
  return path + (qs ? "?" + qs : "");
}
