import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { db, userFromRequest } from "@/lib/db/server";
import { bizOf } from "@/lib/db/mappers";

export const dynamic = "force-dynamic";

/** 우리 시설 공고 목록 + 지원자 수 */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, msg: "로그인이 필요합니다" }, { status: 401 });
  const b = await bizOf(user); if (!b) return NextResponse.json({ ok: true, jobs: [] });
  const c = db()!;
  const { data: jobs } = await c.from("jobs").select("id,job,title,hours,pay,published,top,urgent,closed_at,created_at,views").eq("business_id", b.id).order("created_at", { ascending: false });
  const ids = (jobs || []).map(j => j.id);
  const counts: Record<number, number> = {};
  if (ids.length) { const { data: apps } = await c.from("applications").select("job_id").in("job_id", ids); for (const a of apps || []) counts[a.job_id] = (counts[a.job_id] || 0) + 1; }
  return NextResponse.json({ ok: true, jobs: (jobs || []).map(j => ({ ...j, applicants: counts[j.id] || 0 })) });
}

/** 공고 마감/재개 */
export async function PATCH(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await bizOf(user); const body = await req.json().catch(() => ({}));
  if (!b || !(body.id > 0)) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await db()!.from("jobs").update({ closed_at: body.close ? new Date().toISOString() : null }).eq("id", body.id).eq("business_id", b.id);
  revalidateTag("jobs");
  return NextResponse.json({ ok: !error });
}
