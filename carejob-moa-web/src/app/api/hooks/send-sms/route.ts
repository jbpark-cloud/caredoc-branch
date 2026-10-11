import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sendSms } from "@/lib/sms";

/**
 * Supabase Auth "Send SMS Hook" (HTTPS). Supabase → 이 주소로 OTP 를 넘기면 솔라피로 발송.
 * Supabase 대시보드 Authentication → Hooks → Send SMS → HTTPS, URL: {사이트}/api/hooks/send-sms
 * 생성된 시크릿(v1,whsec_...)을 SEND_SMS_HOOK_SECRET 환경변수에 넣는다. 서명은 Standard Webhooks 규격.
 */
function verify(body: string, h: Headers): boolean {
  const secret = process.env.SEND_SMS_HOOK_SECRET; if (!secret) return false;
  const id = h.get("webhook-id"), ts = h.get("webhook-timestamp"), sigs = h.get("webhook-signature");
  if (!id || !ts || !sigs) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const key = Buffer.from(secret.replace(/^v1,/, "").replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
  return sigs.split(" ").some(s => { const v = s.split(",")[1] || ""; return v.length === expected.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(expected)); });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verify(raw, req.headers)) return NextResponse.json({ error: { http_code: 401, message: "invalid signature" } }, { status: 401 });
  let p: { user?: { phone?: string }; sms?: { otp?: string } } = {};
  try { p = JSON.parse(raw); } catch { return NextResponse.json({ error: { http_code: 400, message: "bad json" } }, { status: 400 }); }
  const phone = p.user?.phone || "", otp = p.sms?.otp || "";
  if (!phone || !otp) return NextResponse.json({ error: { http_code: 400, message: "missing phone/otp" } }, { status: 400 });
  const r = await sendSms(phone, `[케어잡모아] 인증번호 ${otp} 를 입력해 주세요. 타인에게 알려주지 마세요.`);
  if (!r.ok) return NextResponse.json({ error: { http_code: 500, message: "sms failed" } }, { status: 500 });
  return NextResponse.json({});
}
