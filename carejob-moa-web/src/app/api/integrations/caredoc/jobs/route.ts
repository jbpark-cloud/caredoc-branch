import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "node:crypto";
import { db } from "@/lib/db/server";
import { normalizeJob } from "@/lib/jobs/normalize";

/**
 * 케어닥 앱 → 케어잡모아 공고 동기화 (확정 요구사항: 케어닥 앱 공고는 케어잡모아에 자동 노출)
 * POST  Authorization: Bearer CAREDOC_SYNC_SECRET
 * body: { jobs: [{ external_id, org, fac, job, sched, title?, hours, addr, pay, contact?, ins?, pay_open?, no_lic?, description?, head?, closed? }] }
 * external_id 기준 upsert. closed=true 면 마감 처리. 응답: 건별 결과
 */
function authed(req: Request) {
  const secret = process.env.CAREDOC_SYNC_SECRET || ""; const h = req.headers.get("authorization") || "";
  const got = h.startsWith("Bearer ") ? h.slice(7) : "";
  return !!secret && got.length === secret.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(secret));
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ ok: false, msg: "unauthorized" }, { status: 401 });
  const c = db(); if (!c) return NextResponse.json({ ok: false, msg: "DB not configured" }, { status: 503 });
  const b = await req.json().catch(() => null);
  const list: Record<string, unknown>[] = Array.isArray(b?.jobs) ? b.jobs.slice(0, 500) : [];
  if (!list.length) return NextResponse.json({ ok: false, msg: "jobs[] required" }, { status: 400 });
  const results: { external_id: string; ok: boolean; id?: number; error?: string }[] = [];
  const now = new Date().toISOString();
  for (const r of list) {
    const ext = String(r.external_id ?? "").trim().slice(0, 64);
    if (!ext) { results.push({ external_id: "", ok: false, error: "external_id 없음" }); continue; }
    if (r.closed === true) {
      const { data } = await c.from("jobs").update({ closed_at: now }).eq("source", "caredoc_app").eq("external_id", ext).select("id").maybeSingle();
      results.push({ external_id: ext, ok: !!data, id: data?.id, error: data ? undefined : "없는 공고" }); continue;
    }
    const n = normalizeJob(r);
    if (!n.ok) { results.push({ external_id: ext, ok: false, error: n.error }); continue; }
    const { data, error } = await c.from("jobs").upsert({ ...n.row, source: "caredoc_app", external_id: ext, caredoc: true, published: true, closed_at: null }, { onConflict: "source,external_id" }).select("id").single();
    results.push({ external_id: ext, ok: !error, id: data?.id, error: error ? "저장 실패" : undefined });
  }
  revalidateTag("jobs");
  return NextResponse.json({ ok: true, total: results.length, saved: results.filter(x => x.ok).length, results });
}
