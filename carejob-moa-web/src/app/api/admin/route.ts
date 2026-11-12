import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { db, userFromRequest, isAdminUser, isUuid } from "@/lib/db/server";
import { normalizeJob } from "@/lib/jobs/normalize";

export const dynamic = "force-dynamic";

async function guard(req: Request) {
  const u = await userFromRequest(req);
  return isAdminUser(u) ? u : null;
}

/** 운영 현황: 검수 대기 기업·미노출 공고·최근 지원·주문·상담 */
export async function GET(req: Request) {
  if (!db()) return NextResponse.json({ ok: false, msg: "DB가 연결되지 않았습니다" }, { status: 503 });
  if (!(await guard(req))) return NextResponse.json({ ok: false, msg: "운영자 계정이 아닙니다" }, { status: 403 });
  const c = db()!;
  const [biz, jobs, apps, orders, consults, proposals] = await Promise.all([
    c.from("businesses").select("id,org,fac,manager_name,manager_phone,email,bizno,ltc_code,status,grade,verify_requested_at,created_at").order("verify_requested_at", { ascending: false, nullsFirst: false }).limit(300),
    c.from("jobs").select("id,business_id,org,job,title,gu,pay,published,top,urgent,closed_at,created_at").order("created_at", { ascending: false }).limit(300),
    c.from("applications").select("id,job_id,job_org,name,phone,created_at").order("created_at", { ascending: false }).limit(100),
    c.from("orders").select("id,business_id,product,count,amount,status,created_at").order("created_at", { ascending: false }).limit(100),
    c.from("consults").select("id,type,phone,name,created_at").order("created_at", { ascending: false }).limit(100),
    c.from("proposals").select("id,business_id,talent_id,seeker_id,count,amount,status,created_at").order("created_at", { ascending: false }).limit(100),
  ]);
  return NextResponse.json({ ok: true, businesses: biz.data || [], jobs: jobs.data || [], applications: apps.data || [], orders: orders.data || [], consults: consults.data || [], proposals: proposals.data || [] });
}

/** 운영 조치 */
export async function POST(req: Request) {
  if (!db()) return NextResponse.json({ ok: false }, { status: 503 });
  const admin = await guard(req); if (!admin) return NextResponse.json({ ok: false, msg: "운영자 계정이 아닙니다" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const c = db()!; const now = new Date().toISOString();
  const id = b.id;
  const bizAction = b.action === "verify" || b.action === "reject";
  if (b.action !== "import" && (bizAction ? !isUuid(id) : !(Number.isInteger(id) && id > 0))) return NextResponse.json({ ok: false, msg: "대상을 확인해 주세요" }, { status: 400 });
  let error: { message: string } | null = null;
  switch (b.action) {
    case "verify": {
      const grade = ["A", "B", "C", "D", "E"].includes(b.grade) ? b.grade : null;
      ({ error } = await c.from("businesses").update({ status: "verified", verified_at: now, ...(grade ? { grade } : {}) }).eq("id", id));
      if (!error) ({ error } = await c.from("jobs").update({ published: true }).eq("business_id", id).is("closed_at", null));
      break;
    }
    case "reject": ({ error } = await c.from("businesses").update({ status: "none" }).eq("id", id)); break;
    case "publish": ({ error } = await c.from("jobs").update({ published: !!b.value }).eq("id", id)); break;
    case "top": ({ error } = await c.from("jobs").update({ top: !!b.value }).eq("id", id)); break;
    case "urgent": ({ error } = await c.from("jobs").update({ urgent: !!b.value }).eq("id", id)); break;
    case "close": ({ error } = await c.from("jobs").update({ closed_at: b.value ? now : null }).eq("id", id)); break;
    case "order": {
      if (!["pending", "paid", "canceled"].includes(b.value)) return NextResponse.json({ ok: false, msg: "상태 값을 확인해 주세요" }, { status: 400 });
      ({ error } = await c.from("orders").update({ status: b.value }).eq("id", id)); break;
    }
    case "import": {
      const rows: Record<string, unknown>[] = Array.isArray(b.rows) ? b.rows.slice(0, 1000) : [];
      const good: Record<string, unknown>[] = []; const errors: { line: number; error: string }[] = [];
      rows.forEach((r, i) => { const n = normalizeJob(r); if (n.ok) good.push({ ...n.row, caredoc: !!b.caredoc, published: true, source: "admin" }); else errors.push({ line: i + 2, error: n.error }); });
      if (good.length) ({ error } = await c.from("jobs").insert(good));
      if (!error) await c.from("admin_logs").insert({ admin_email: admin.email, action: "import", target_id: String(good.length), value: errors.length ? `${errors.length} errors` : null });
      revalidateTag("jobs");
      if (error) console.error("[admin] import", error.message);
      return NextResponse.json({ ok: !error, saved: error ? 0 : good.length, errors, msg: error ? "저장하지 못했습니다" : undefined });
    }
    default: return NextResponse.json({ ok: false, msg: "알 수 없는 조치" }, { status: 400 });
  }
  revalidateTag("jobs");
  if (error) console.error("[admin]", b.action, error.message);
  else await c.from("admin_logs").insert({ admin_email: admin.email, action: b.action, target_id: String(id), value: b.value != null ? String(b.value).slice(0, 40) : (typeof b.grade === "string" ? b.grade.slice(0, 2) : null) });
  return NextResponse.json({ ok: !error, msg: error ? "처리하지 못했습니다" : undefined });
}
