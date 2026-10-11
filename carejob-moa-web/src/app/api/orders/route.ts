import { NextResponse } from "next/server";
import { insert, userFromRequest, rateLimit } from "@/lib/db/server";
import { bizOf } from "@/lib/db/mappers";
import { AD_PRODUCTS } from "@/lib/constants";

/** 광고 주문 접수 (PG 미연동: 담당자 확인 후 계좌이체·세금계산서) */
export async function POST(req: Request) {
  if (!rateLimit(req, "order", 10)) return NextResponse.json({ ok: false, msg: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const b = await req.json().catch(() => null);
  const p = AD_PRODUCTS.find(x => x.name === b?.product) ?? (b?.product === "프리미엄 월정액" ? { key: "monthly", price: 190000 } : null);
  const count = Math.min(50, Math.max(0, Number(b?.count) || 0));
  if (!p || !count) return NextResponse.json({ ok: false, msg: "상품 또는 수량을 확인해 주세요" }, { status: 400 });
  const user = await userFromRequest(req); const biz = user ? await bizOf(user) : null;
  const r = await insert("orders", { business_id: biz?.id ?? null, product: p.key, count, amount: p.price * count, status: "pending" });
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
