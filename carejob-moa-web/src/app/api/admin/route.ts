import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { db, userFromRequest, isAdminEmail } from "@/lib/db/server";

export const dynamic = "force-dynamic";

async function guard(req: Request) {
  const u = await userFromRequest(req);
  return u && isAdminEmail(u.email) ? u : null;
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
    case "order": ({ error } = await c.from("orders").update({ status: String(b.value || "done").slice(0, 20) }).eq("id", id)); break;
    default: return NextResponse.json({ ok: false, msg: "알 수 없는 조치" }, { status: 400 });
  }
  revalidateTag("jobs");
  if (!error) await c.from("admin_logs").insert({ admin_email: admin.email, action: b.action, target_id: String(id), value: b.value ?? b.grade ?? null });
  return NextResponse.json({ ok: !error, msg: error?.message });
}
