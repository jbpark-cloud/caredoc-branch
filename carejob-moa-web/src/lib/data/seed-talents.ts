import type { Talent, Sched } from "../types";
import { GU_LIST, SCHEDS } from "../constants";
import { seededRandom, seedJobs } from "./seed-jobs";

function build(): Talent[] {
  const r = seededRandom(7); const pick = <T,>(a: readonly T[]): T => a[Math.floor(r() * a.length)];
  const JOBS = seedJobs();
  const sur = ["김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권"];
  const LIC: string[][] = [["요양보호사"],["요양보호사","사회복지사 2급"],["간병인 교육 이수"],["간호조무사"],["요양보호사","간호조무사"],["없음"],["없음"],["사회복지사 2급"],["요양보호사","1종 보통"],["조리사","보건증"],["1종 보통"],["물리치료사"],["간호사"]];
  const WANT: Record<string, string[]> = {"요양보호사":["요양보호사"],"요양보호사,사회복지사 2급":["사회복지사","요양보호사"],"간병인 교육 이수":["간병인"],"간호조무사":["간호조무사"],"요양보호사,간호조무사":["간호조무사","요양보호사"],"없음":["병원동행매니저","생활지원사","조리원·조리보조","사무행정"],"사회복지사 2급":["사회복지사"],"요양보호사,1종 보통":["요양보호사","운전원(송영)"],"조리사,보건증":["조리원·조리보조"],"1종 보통":["운전원(송영)"],"물리치료사":["물리치료사"],"간호사":["간호사"]};
  const out: Talent[] = [];
  for (let i = 0; i < 72; i++) {
    const lic = pick(LIC); const key = lic.join(","); const want = WANT[key] || ["요양보호사"]; const job = pick(want);
    const gu = r() < 0.6 ? pick(["강남구","송파구","강동구","서초구"]) : pick(GU_LIST);
    const dongs = JOBS.filter(j => j.gu === gu).map(j => j.area.split(" ")[1]); const dong = dongs.length ? pick(dongs) : "역삼동";
    const age = 50 + Math.floor(r() * 17); const sex: "여" | "남" = r() < 0.9 ? "여" : "남"; const yrs = lic[0] === "없음" ? 0 : Math.floor(r() * 12);
    const sched = pick(SCHEDS) as Sched; const days = pick(["월~금","월·수·금","화·목","주말 가능","요일 무관"]);
    const pay = job === "간병인" ? `일 ${12 + Math.floor(r() * 4)}만원` : (sched === "오전만" || sched === "주3일") ? `시급 ${(13 + Math.floor(r() * 3)) * 1000 + 500}원` : `월 ${220 + Math.floor(r() * 8) * 10}만원`;
    const last = pick([0,0,1,1,2,3,5,7,10,14]); const caredoc = r() < 0.25; const care = caredoc ? `케어닥 근무 ${1 + Math.floor(r() * 4)}년 · 평점 ${(4 + r()).toFixed(1)}` : "";
    const move = pick(["도보","자차","대중교통","자전거"]); const memo = pick(["와상 어르신 케어 경험 있음","치매 어르신 대응 익숙","야간 근무 가능","즉시 출근 가능","주 3일만 희망","입주 가능","조리 경력 5년","송영 운전 경력"]);
    out.push({ id: i + 1, name: pick(sur) + "OO", age, sex, gu, dong, lic, job, yrs, sched, days, pay, last, caredoc, care, move, memo, noLic: lic[0] === "없음" });
  }
  return out;
}
let cache: Talent[] | null = null;
export function seedTalents(): Talent[] { if (!cache) cache = build(); return cache; }
