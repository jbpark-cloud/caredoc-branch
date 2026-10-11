import { NextResponse } from "next/server";
import { insert, userFromRequest, rateLimit } from "@/lib/db/server";
import { bizOf } from "@/lib/db/mappers";
export async function POST(req: Request) {
  if (!rateLimit(req, "propose", 20)) return NextResponse.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (!b || !(b.talentId > 0) || !(b.count > 0)) return NextResponse.json({ ok: false }, { status: 400 });
  const user = await userFromRequest(req); const biz = user ? await bizOf(user) : null;
  const r = await insert("proposals", { business_id: biz?.id ?? null, talent_id: b.talentId, seeker_id: typeof b.uid === "string" ? b.uid : null, count: Math.min(10, b.count), amount: 5000 * Math.min(10, b.count), status: "requested" });
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
