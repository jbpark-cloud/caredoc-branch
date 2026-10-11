// 서버 전용 데이터 접근 계층. DB 연결 시 Supabase(노출 승인된 공고), 아니면 시범 모드 샘플.
// 클라이언트 컴포넌트에서 import 금지 → 서버 페이지에서 읽어 props 로 넘긴다.
import type { Job, Facility, Talent, Grade, Sched } from "./types";
import { seedJobs, DUTY, REQ } from "./data/seed-jobs";
import { seedTalents } from "./data/seed-talents";
import { NOLIC_JOBS, GU_LIST } from "./constants";
import { dbRead as db, isDemo } from "./db/server";
import { facilitiesFromJobs } from "./filter";

export { isDemo };

interface JobRow {
  id: number; org: string; fac: string; job: string; sched: string; title: string | null; hours: string | null; addr: string | null; gu: string | null; dong: string | null;
  pay: string | null; contact: string | null; ins: boolean | null; pay_open: boolean | null; no_lic: boolean | null; urgent: boolean | null; top: boolean | null; caredoc: boolean | null;
  description: string | null; head: number | null; benefits: string[] | null; created_at: string; businesses?: { grade: string | null } | null;
}

const SCHEDS = new Set(["오전만", "주간", "주3일", "야간", "입주", "단기"]);

export function parseAddr(addr: string) {
  const parts = (addr || "").split(/\s+/).filter(Boolean);
  const gu = parts.find(p => (GU_LIST as readonly string[]).includes(p)) || parts.find(p => p.endsWith("구")) || "";
  const dong = parts.find(p => /[동가로리]$/.test(p) && p !== gu) || "";
  return { gu, dong };
}

export function rowToJob(r: JobRow): Job {
  const hp = (r.hours || "").split(" · ");
  const desc = (r.description || "").split(/\n+/).map(s => s.trim()).filter(Boolean);
  const gu = r.gu || parseAddr(r.addr || "").gu, dong = r.dong || parseAddr(r.addr || "").dong;
  const benef = [...(r.ins ? ["4대보험"] : []), ...(r.benefits || [])];
  return {
    id: r.id, job: r.job, fac: r.fac, gu, area: [gu, dong].filter(Boolean).join(" ") || (r.addr || ""), sched: (SCHEDS.has(r.sched) ? r.sched : "주간") as Sched,
    hours: [hp[0] || "", hp[1] || ""], pay: r.pay || "면접 시 협의", grade: ((r.businesses?.grade || "") as Grade), ins: !!r.ins, payOpen: r.pay_open !== false,
    score: 0, reviews: 0, noLic: r.no_lic ?? NOLIC_JOBS.has(r.job), urgent: !!r.urgent, caredoc: !!r.caredoc, org: r.org, dist: "",
    days: Math.max(0, Math.floor((Date.now() - new Date(r.created_at).getTime()) / 864e5)), top: !!r.top,
    title: r.title || `${r.job} 모집${hp[0] ? " · " + hp[0] : ""}`, benef, duty: desc.length ? desc.slice(0, 8) : (DUTY[r.job] || []), req: REQ[r.job] || "",
    head: r.head || 1, rv: [], contact: r.contact || undefined,
  };
}

const JOB_COLS = "id,org,fac,job,sched,title,hours,addr,gu,dong,pay,contact,ins,pay_open,no_lic,urgent,top,caredoc,description,head,benefits,created_at,businesses(grade)";

export async function getJobs(): Promise<Job[]> {
  const c = db();
  if (!c || process.env.NEXT_PUBLIC_DEMO === "1") return seedJobs();
  const { data, error } = await c.from("jobs").select(JOB_COLS).eq("published", true).is("closed_at", null).order("created_at", { ascending: false }).limit(2000);
  if (error) { console.error("[repo] jobs", error.message); return []; }
  return (data as unknown as JobRow[]).map(rowToJob);
}

export async function getJob(id: number): Promise<Job | null> {
  const c = db();
  if (!c || process.env.NEXT_PUBLIC_DEMO === "1") return seedJobs().find(j => j.id === id) ?? null;
  const { data } = await c.from("jobs").select(JOB_COLS).eq("id", id).eq("published", true).maybeSingle();
  return data ? rowToJob(data as unknown as JobRow) : null;
}

export async function getFacility(id: number): Promise<Facility | null> {
  const base = await getJob(id); if (!base) return null;
  const all = await getJobs();
  const f = facilitiesFromJobs(all.filter(j => j.org === base.org))[0];
  return f ?? facilitiesFromJobs([base])[0];
}

export async function listFacilities(): Promise<Facility[]> { return facilitiesFromJobs(await getJobs()); }

/** 인재정보: 시범 모드 샘플 / DB 모드는 '다른 시설 연락 동의' 구직자 */
export async function getTalents(): Promise<Talent[]> {
  const c = db();
  if (!c || process.env.NEXT_PUBLIC_DEMO === "1") return seedTalents();
  const { data, error } = await c.from("seekers").select("id,name,lic,want_job,gu,dong,sched,age,memo,caredoc_linked,updated_at").eq("open_to_offers", true).order("updated_at", { ascending: false }).limit(500);
  if (error || !data) return [];
  return data.map((s, i) => {
    const lic: string[] = (s.lic as string[] | null)?.length ? (s.lic as string[]) : ["없음"];
    return { id: i + 1, uid: s.id as string, name: String(s.name || "회원").slice(0, 1) + "OO", age: (s.age as number) || 0, sex: "여", gu: (s.gu as string) || "", dong: (s.dong as string) || "", lic, job: (s.want_job as string) || (lic[0] === "없음" ? "병원동행매니저" : lic[0].replace(/ 자격증$/, "")), yrs: 0, sched: ((s.sched as Sched) || "주간"), days: "협의", pay: "협의", last: Math.max(0, Math.floor((Date.now() - new Date(s.updated_at as string).getTime()) / 864e5)), caredoc: !!s.caredoc_linked, care: s.caredoc_linked ? "케어닥 근무 이력 연동" : "", move: "—", memo: (s.memo as string) || "", noLic: lic[0] === "없음" } satisfies Talent;
  });
}
