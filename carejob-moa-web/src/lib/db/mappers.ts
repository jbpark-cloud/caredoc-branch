import type { SeekerUser, BizUser, BizStatus } from "../types";
import type { User } from "@supabase/supabase-js";
import { db } from "./server";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const seekerFromRow = (r: any): SeekerUser => ({ name: r.name || "회원", phone: r.phone || "", lic: r.lic || [], caredoc: !!r.caredoc_linked, open: !!r.open_to_offers });
export const bizFromRow = (r: any): BizUser & { id: string } => ({ id: r.id, org: r.org, fac: r.fac, email: r.email || "kakao", status: (r.status || "none") as BizStatus, name: r.manager_name, phone: r.manager_phone, bizno: r.bizno || undefined, ltc: r.ltc_code || undefined });

export async function bizOf(user: User) {
  const c = db()!; const { data } = await c.from("businesses").select("*").eq("owner_id", user.id).maybeSingle();
  return data;
}
export async function seekerOf(user: User) {
  const c = db()!; const { data } = await c.from("seekers").select("*").eq("id", user.id).maybeSingle();
  return data;
}
export const phoneOfUser = (u: User) => (u.phone ? (u.phone.startsWith("82") ? "0" + u.phone.slice(2) : u.phone).replace(/\D/g, "") : "");
