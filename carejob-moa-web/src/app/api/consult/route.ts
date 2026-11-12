import { NextResponse } from "next/server";
import { insert, rateLimit, cleanName } from "@/lib/db/server";
export async function POST(req: Request) {
  if (!rateLimit(req, "consult", 5)) return NextResponse.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  if (b.consent !== true) return NextResponse.json({ ok: false, msg: "상담 연락을 위한 번호 수집에 동의해 주세요" }, { status: 400 });
  const phone = String(b.phone || "").replace(/\D/g, "");
  if (!/^01\d{8,9}$/.test(phone)) return NextResponse.json({ ok: false, msg: "연락받을 휴대전화 번호를 확인해 주세요" }, { status: 400 });
  const r = await insert("consults", { type: "education", phone, name: cleanName(b.name, 30), source: "web" });
  return NextResponse.json(r);
}
