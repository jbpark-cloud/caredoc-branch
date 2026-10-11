import { NextResponse } from "next/server";
import { db, userFromRequest } from "@/lib/db/server";
import { bizOf } from "@/lib/db/mappers";

export const dynamic = "force-dynamic";

/** 우리 공고에 들어온 지원자 (연락처 포함 — 지원자가 시설 제공에 동의한 정보) */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, msg: "로그인이 필요합니다" }, { status: 401 });
  const b = await bizOf(user); if (!b) return NextResponse.json({ ok: true, applications: [] });
  const jobId = Number(new URL(req.url).searchParams.get("job") || 0);
  const c = db()!;
  let q = c.from("applications").select("id,job_id,name,phone,proxy_phone,lic,status,created_at").eq("business_id", b.id).order("created_at", { ascending: false }).limit(300);
  if (jobId) q = q.eq("job_id", jobId);
  const { data } = await q;
  return NextResponse.json({ ok: true, applications: data || [] });
}
