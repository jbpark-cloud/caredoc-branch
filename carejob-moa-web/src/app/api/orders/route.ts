import { NextResponse } from "next/server";
import { insert } from "@/lib/db/server";
import { AD_PRODUCTS } from "@/lib/constants";
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const p = AD_PRODUCTS.find(x => x.name === b?.product) ?? (b?.product === "프리미엄 월정액" ? { key: "monthly", price: 190000 } : null);
  if (!p || !(b.count > 0)) return NextResponse.json({ ok: false, msg: "상품 또는 수량 오류" }, { status: 400 });
  const r = await insert("orders", { product: p.key, count: b.count, amount: p.price * b.count, status: "pending" });
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
