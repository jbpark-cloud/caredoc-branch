import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { db, userFromRequest, rateLimit, cleanName, cleanLine } from "@/lib/db/server";
import { seekerFromRow, phoneOfUser } from "@/lib/db/mappers";
import { GU_LIST, JOB_TYPES, LIC_OPTIONS, SCHEDS } from "@/lib/constants";

const pick = (v: unknown, list: readonly string[]) => (typeof v === "string" && list.includes(v) ? v : undefined);

/** 구직자 프로필 저장(이름·자격·연락 동의 등). 전화번호는 문자 인증으로 확인된 번호만 저장한다 */
export async function POST(req: Request) {
  if (!rateLimit(req, "seeker", 20)) return NextResponse.json({ ok: false, msg: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, msg: "로그인이 필요합니다" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const row: Record<string, unknown> = { id: user.id, updated_at: new Date().toISOString() };
  const name = cleanName(b.name); if (name) row.name = name;
  if (Array.isArray(b.lic)) row.lic = LIC_OPTIONS.filter(o => o !== "아직 없어요" && b.lic.includes(o));
  if (typeof b.open === "boolean") row.open_to_offers = b.open;
  const wantJob = pick(b.want_job, JOB_TYPES), gu = pick(b.gu, GU_LIST), sched = pick(b.sched, SCHEDS);
  if (wantJob) row.want_job = wantJob; if (gu) row.gu = gu; if (sched) row.sched = sched;
  if (typeof b.dong === "string") row.dong = cleanLine(b.dong, 20);
  if (typeof b.memo === "string") row.memo = cleanLine(b.memo, 80);
  const phone = phoneOfUser(user);
  if (phone) row.phone = phone;
  // 다른 시설의 제안은 문자로 가므로, 인증된 번호가 없으면 연락 동의를 켤 수 없다
  if (row.open_to_offers === true && !phone) return NextResponse.json({ ok: false, msg: "문자 인증을 마친 뒤 켤 수 있습니다" }, { status: 400 });
  const { data, error } = await db()!.from("seekers").upsert(row).select("*").single();
  if (error) return NextResponse.json({ ok: false, msg: "저장하지 못했습니다" }, { status: 500 });
  revalidateTag("jobs");
  return NextResponse.json({ ok: true, seeker: seekerFromRow(data) });
}
