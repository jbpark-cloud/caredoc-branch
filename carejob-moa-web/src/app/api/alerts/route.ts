import { NextResponse } from "next/server";
import { db, userFromRequest, rateLimit } from "@/lib/db/server";
import { GU_LIST, JOB_TYPES, SCHEDS } from "@/lib/constants";
import { phoneOfUser } from "@/lib/db/mappers";

/** 새 공고 문자 알림 신청(로그인 구직자). 매일 아침 크론이 조건에 맞는 새 공고를 문자로 보낸다 */
export async function POST(req: Request) {
  if (!rateLimit(req, "alerts", 10)) return NextResponse.json({ ok: false }, { status: 429 });
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, msg: "로그인이 필요합니다" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const c = db()!;
  const { data: s } = await c.from("seekers").select("phone").eq("id", user.id).maybeSingle();
  const phone = s?.phone || phoneOfUser(user);
  if (!phone) return NextResponse.json({ ok: false, msg: "문자 받을 휴대전화 인증이 필요합니다" }, { status: 400 });
  const pick = (v: unknown, list: readonly string[]) => (typeof v === "string" && list.includes(v) ? v : null);
  const row = { seeker_id: user.id, phone, gu: pick(b.gu, GU_LIST), job: pick(b.job, JOB_TYPES), sched: pick(b.sched, SCHEDS), active: true };
  await c.from("alerts").delete().eq("seeker_id", user.id); // 1인 1조건(MVP)
  const { error } = await c.from("alerts").insert(row);
  return NextResponse.json({ ok: !error });
}
export async function DELETE(req: Request) {
  const user = await userFromRequest(req); if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await db()!.from("alerts").delete().eq("seeker_id", user.id);
  return NextResponse.json({ ok: true });
}
