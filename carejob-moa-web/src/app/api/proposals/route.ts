import { NextResponse } from "next/server";
import { insert } from "@/lib/db/server";
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || !(b.talentId > 0) || !(b.count > 0)) return NextResponse.json({ ok: false }, { status: 400 });
  const r = await insert("proposals", { talent_id: b.talentId, count: b.count, amount: 5000 * b.count, status: "sent" });
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
