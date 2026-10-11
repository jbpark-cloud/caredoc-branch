import { NextResponse } from "next/server";
import { insert, rateLimit } from "@/lib/db/server";
export async function POST(req: Request) {
  if (!rateLimit(req, "consult", 5)) return NextResponse.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const phone = String(b.phone || "").replace(/\D/g, "");
  if (!/^01\d{8,9}$/.test(phone)) return NextResponse.json({ ok: false, msg: "연락받을 휴대전화 번호를 확인해 주세요" }, { status: 400 });
  const r = await insert("consults", { type: "education", phone, name: String(b.name || "").slice(0, 30), source: "web" });
  return NextResponse.json(r);
}
