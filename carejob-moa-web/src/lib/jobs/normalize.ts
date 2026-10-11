// 외부 입력(케어닥 앱 연동·CSV)을 jobs 행으로 정규화. 잘못된 값은 이유와 함께 거절
import { FACS, JOB_TYPES, SCHEDS } from "../constants";
import { parseAddr } from "../repo";

const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
const yes = (v: unknown, dflt = false) => { if (v === undefined || v === null || v === "") return dflt; if (typeof v === "boolean") return v; return /^(y|yes|true|1|o|예|네|가입|공개|무관)$/i.test(String(v).trim()); };
const FAC_ALIAS: Record<string, string> = { "방문요양센터": "방문요양", "주야간보호센터": "주야간보호", "주간보호": "주야간보호", "데이케어": "주야간보호", "병원": "일반 병원", "간병인협회": "간병인 협회", "노인복지관": "복지관" };

export type JobInput = Record<string, unknown>;
export function normalizeJob(r: JobInput): { ok: true; row: Record<string, unknown> } | { ok: false; error: string } {
  const fac = FAC_ALIAS[s(r.fac, 20)] || s(r.fac, 20);
  const job = s(r.job, 20), sched = s(r.sched, 10) || "주간";
  if (!s(r.org, 60)) return { ok: false, error: "시설명 없음" };
  if (!(FACS as readonly string[]).includes(fac)) return { ok: false, error: `시설유형 '${r.fac}' 미지원` };
  if (!(JOB_TYPES as readonly string[]).includes(job)) return { ok: false, error: `직종 '${r.job}' 미지원` };
  if (!(SCHEDS as readonly string[]).includes(sched)) return { ok: false, error: `근무형태 '${r.sched}' 미지원` };
  if (!s(r.addr, 80)) return { ok: false, error: "주소 없음" };
  if (!s(r.pay, 40)) return { ok: false, error: "급여 없음" };
  const addr = s(r.addr, 80); const { gu, dong } = parseAddr(addr);
  return { ok: true, row: {
    org: s(r.org, 60), fac, job, sched, title: s(r.title, 80) || null, hours: s(r.hours, 60), addr, gu, dong, pay: s(r.pay, 40), contact: s(r.contact, 20),
    ins: yes(r.ins, true), pay_open: yes(r.pay_open, true), no_lic: r.no_lic === undefined ? ["간병인", "병원동행매니저", "생활지원사", "조리원·조리보조", "운전원(송영)", "사무행정"].includes(job) : yes(r.no_lic),
    description: s(r.description, 3000), head: Math.min(99, Math.max(1, Number(r.head) || 1)),
  } };
}
