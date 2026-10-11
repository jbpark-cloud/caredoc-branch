// 국내 문자 발송 (솔라피 Solapi REST v4). 키가 없으면 서버 로그로만 남긴다(시범·개발).
// 필요 환경변수: SOLAPI_API_KEY, SOLAPI_API_SECRET, SMS_SENDER(사전 등록된 발신번호)
import crypto from "node:crypto";
import { SITE_URL } from "./constants";

export const smsEnabled = () => !!(process.env.SOLAPI_API_KEY && process.env.SOLAPI_API_SECRET && process.env.SMS_SENDER);
const digits = (p: string) => (p || "").replace(/\D/g, "").replace(/^82/, "0");

export async function sendSms(to: string, text: string): Promise<{ ok: boolean; mock?: boolean; msg?: string }> {
  const num = digits(to);
  if (!/^01\d{8,9}$/.test(num)) return { ok: false, msg: "invalid number" };
  const key = process.env.SOLAPI_API_KEY, secret = process.env.SOLAPI_API_SECRET, from = process.env.SMS_SENDER;
  if (!key || !secret || !from) { console.log(`[sms:mock] → ${num.slice(0, 3)}****${num.slice(-4)} : ${text}`); return { ok: true, mock: true }; }
  const date = new Date().toISOString(); const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto.createHmac("sha256", secret).update(date + salt).digest("hex");
  try {
    const r = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST", cache: "no-store",
      headers: { "Content-Type": "application/json", Authorization: `HMAC-SHA256 apiKey=${key}, date=${date}, salt=${salt}, signature=${signature}` },
      body: JSON.stringify({ message: { to: num, from: digits(from), text } }),
    });
    if (!r.ok) { const t = await r.text(); console.error("[sms] solapi", r.status, t.slice(0, 200)); return { ok: false, msg: `solapi ${r.status}` }; }
    return { ok: true };
  } catch (e) { console.error("[sms]", e); return { ok: false, msg: "network" }; }
}

export const site = (path: string) => SITE_URL + encodeURI(path);
