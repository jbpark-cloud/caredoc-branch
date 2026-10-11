import { NextResponse } from "next/server";
import { db } from "@/lib/db/server";
import { sendSms, site } from "@/lib/sms";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * 매일 09:00(KST) Vercel Cron 실행 — vercel.json 참고. Authorization: Bearer CRON_SECRET 로 보호.
 * 1) 가입 7일 지난 미인증 기업에 인증 리마인드(1회)  2) 보관기간 지난 개인정보 파기  3) 새 공고 문자 알림
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  const c = db(); if (!c) return NextResponse.json({ ok: true, skipped: "demo" });
  const now = Date.now(), day = 864e5, iso = (ms: number) => new Date(ms).toISOString();
  const out = { reminded: 0, purgedApps: 0, purgedConsults: 0, alerts: 0 };

  // 1) 미인증 7일 리마인드
  const { data: stale } = await c.from("businesses").select("id,org,manager_phone").eq("status", "none").is("reminded_at", null).lt("created_at", iso(now - 7 * day)).limit(200);
  for (const b of stale || []) {
    if (b.manager_phone) await sendSms(b.manager_phone, `[케어잡모아] ${b.org} 시설 인증이 아직 안 되어 공고가 구직자에게 보이지 않습니다. 사업자번호 하나면 됩니다: ${site("/biz/me")}`);
    await c.from("businesses").update({ reminded_at: iso(now) }).eq("id", b.id); out.reminded++;
  }

  // 2) 개인정보 파기 (방침: 지원 1년, 상담 6개월)
  const a = await c.from("applications").delete({ count: "exact" }).lt("created_at", iso(now - 365 * day)); out.purgedApps = a.count || 0;
  const k = await c.from("consults").delete({ count: "exact" }).lt("created_at", iso(now - 183 * day)); out.purgedConsults = k.count || 0;

  // 3) 새 공고 알림 (지난 24시간 노출 공고, 1인 1일 1회)
  const { data: fresh } = await c.from("jobs").select("id,gu,job,sched,org,pay").eq("published", true).is("closed_at", null).gt("created_at", iso(now - day)).limit(500);
  if (fresh?.length) {
    const { data: alerts } = await c.from("alerts").select("id,phone,gu,job,sched,last_sent_at").eq("active", true).limit(2000);
    for (const al of alerts || []) {
      if (al.last_sent_at && now - new Date(al.last_sent_at).getTime() < 20 * 3600e3) continue;
      const hit = fresh.filter(j => (!al.gu || j.gu === al.gu) && (!al.job || j.job === al.job) && (!al.sched || j.sched === al.sched));
      if (!hit.length) continue;
      const path = "/jobs" + (al.gu ? "/" + al.gu : "") + (al.job ? "/" + al.job : "");
      await sendSms(al.phone, `[케어잡모아] ${al.gu || "서울"} ${al.job || "돌봄"} 새 공고 ${hit.length}건 (${hit[0].org} ${hit[0].pay} 등). 보기: ${site(path)} · 알림 끄기는 내 정보에서`);
      await c.from("alerts").update({ last_sent_at: iso(now) }).eq("id", al.id); out.alerts++;
    }
  }
  return NextResponse.json({ ok: true, ...out });
}
