import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { db, userFromRequest, rateLimit } from "@/lib/db/server";
import { seekerFromRow, phoneOfUser } from "@/lib/db/mappers";

/** 구직자 프로필 저장(이름·자격·연락 동의 등) */
export async function POST(req: Request) {
  if (!rateLimit(req, "seeker", 20)) return NextResponse.json({ ok: false, msg: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, msg: "로그인이 필요합니다" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const row: Record<string, unknown> = { id: user.id, updated_at: new Date().toISOString() };
  if (typeof b.name === "string" && b.name.trim()) row.name = b.name.trim().slice(0, 40);
  if (Array.isArray(b.lic)) row.lic = b.lic.filter((x: unknown) => typeof x === "string").slice(0, 10);
  if (typeof b.open === "boolean") row.open_to_offers = b.open;
  for (const k of ["want_job", "gu", "dong", "sched", "memo"]) if (typeof b[k] === "string") row[k] = b[k].slice(0, 80);
  const phone = phoneOfUser(user) || (typeof b.phone === "string" ? b.phone.replace(/\D/g, "").slice(0, 11) : "");
  if (phone) row.phone = phone;
  const { data, error } = await db()!.from("seekers").upsert(row).select("*").single();
  if (error) return NextResponse.json({ ok: false, msg: "저장하지 못했습니다" }, { status: 500 });
  revalidateTag("jobs");
  return NextResponse.json({ ok: true, seeker: seekerFromRow(data) });
}
