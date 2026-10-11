"use client";
// 인증 클라이언트. 환경변수(NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)가 있으면 Supabase 전화 OTP·카카오 OAuth,
// 없으면 목업(아무 6자리 코드 통과, 010-xxxx-0101 = 기존 케어닥 회원 김영숙).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SeekerUser } from "../types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let sb: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null { if (!URL || !KEY) return null; if (!sb) sb = createClient(URL, KEY); return sb; }
export const authMode = (): "supabase" | "mock" => (URL && KEY ? "supabase" : "mock");

export const normPhone = (p: string) => p.replace(/\D/g, "");
const e164 = (p: string) => { const d = normPhone(p); return d.startsWith("0") ? "+82" + d.slice(1) : "+" + d; };

export async function sendOtp(phone: string): Promise<{ ok: boolean; msg?: string }> {
  const c = supabase();
  if (!c) return { ok: true };
  const { error } = await c.auth.signInWithOtp({ phone: e164(phone) });
  return error ? { ok: false, msg: error.message } : { ok: true };
}

export async function verifyOtp(phone: string, code: string): Promise<{ ok: boolean; user?: SeekerUser; msg?: string }> {
  const c = supabase();
  const digits = normPhone(phone);
  if (!c) {
    if (code.length !== 6) return { ok: false, msg: "숫자 6자리를 입력해 주세요" };
    const known = digits.endsWith("0101");
    return { ok: true, user: { name: known ? "김영숙" : "회원", phone: digits, lic: known ? ["요양보호사 자격증"] : [], caredoc: known, open: false } };
  }
  const { data, error } = await c.auth.verifyOtp({ phone: e164(phone), token: code, type: "sms" });
  if (error || !data.user) return { ok: false, msg: error?.message ?? "인증 실패" };
  const { data: prof } = await c.from("seekers").select("name,lic,caredoc_linked,open_to_offers").eq("id", data.user.id).maybeSingle();
  return { ok: true, user: { name: prof?.name ?? "회원", phone: digits, lic: prof?.lic ?? [], caredoc: !!prof?.caredoc_linked, open: !!prof?.open_to_offers } };
}

export async function kakaoLogin(next: string): Promise<{ ok: boolean; user?: SeekerUser; redirected?: boolean; msg?: string }> {
  const c = supabase();
  if (!c) return { ok: true, user: { name: "김영숙", phone: "01055550101", lic: ["요양보호사 자격증"], caredoc: true, open: false } };
  const { error } = await c.auth.signInWithOAuth({ provider: "kakao", options: { redirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(next) } });
  return error ? { ok: false, msg: error.message } : { ok: true, redirected: true };
}

export async function signOut() { const c = supabase(); if (c) await c.auth.signOut(); }
