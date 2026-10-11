"use client";
// 인증 클라이언트.
// - Supabase 키(NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)가 있으면: 구직자 전화 OTP·카카오 OAuth, 기업 이메일/비밀번호·카카오
// - 없으면 시범 모드 목업(아무 6자리 통과, 끝자리 0101 = 케어닥 회원 예시)
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SeekerUser, BizUser } from "../types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let sb: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null { if (!URL || !KEY) return null; if (!sb) sb = createClient(URL, KEY, { auth: { persistSession: true, detectSessionInUrl: true } }); return sb; }
export const authMode = (): "supabase" | "mock" => (URL && KEY ? "supabase" : "mock");

export const normPhone = (p: string) => p.replace(/\D/g, "");
const e164 = (p: string) => { const d = normPhone(p); return d.startsWith("0") ? "+82" + d.slice(1) : "+" + d; };
const krErr = (m?: string) => {
  if (!m) return "잠시 후 다시 시도해 주세요";
  if (/invalid login|invalid credentials/i.test(m)) return "이메일 또는 비밀번호가 맞지 않습니다";
  if (/expired|invalid.*token|otp/i.test(m)) return "인증번호가 맞지 않거나 시간이 지났습니다. 다시 받아 주세요";
  if (/already registered|exists/i.test(m)) return "이미 가입된 이메일입니다. 로그인해 주세요";
  if (/rate|too many/i.test(m)) return "요청이 많습니다. 1분 뒤 다시 시도해 주세요";
  if (/password/i.test(m)) return "비밀번호는 8자 이상으로 입력해 주세요";
  return "잠시 후 다시 시도해 주세요";
};

/** 로그인 세션 토큰을 붙여 API 호출 */
export async function authFetch(input: string, init: RequestInit = {}) {
  const c = supabase(); const headers = new Headers(init.headers);
  if (c) { const { data } = await c.auth.getSession(); if (data.session) headers.set("Authorization", "Bearer " + data.session.access_token); }
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers });
}

async function session(): Promise<{ seeker: SeekerUser | null; biz: BizUser | null }> {
  const r = await authFetch("/api/session"); if (!r.ok) return { seeker: null, biz: null };
  return r.json();
}

export async function sendOtp(phone: string): Promise<{ ok: boolean; msg?: string }> {
  const c = supabase();
  if (!c) return { ok: true };
  const { error } = await c.auth.signInWithOtp({ phone: e164(phone) });
  return error ? { ok: false, msg: krErr(error.message) } : { ok: true };
}

export async function verifyOtp(phone: string, code: string): Promise<{ ok: boolean; user?: SeekerUser; msg?: string }> {
  const c = supabase();
  const digits = normPhone(phone);
  if (!c) {
    if (code.length !== 6) return { ok: false, msg: "숫자 6자리를 입력해 주세요" };
    const known = digits.endsWith("0101");
    return { ok: true, user: { name: known ? "김영숙" : "회원", phone: digits, lic: known ? ["요양보호사 자격증"] : [], caredoc: known, open: false } };
  }
  const { error } = await c.auth.verifyOtp({ phone: e164(phone), token: code, type: "sms" });
  if (error) return { ok: false, msg: krErr(error.message) };
  const s = await session();
  return s.seeker ? { ok: true, user: s.seeker } : { ok: false, msg: "회원 정보를 불러오지 못했습니다" };
}

export async function kakaoLogin(next: string): Promise<{ ok: boolean; user?: SeekerUser; redirected?: boolean; msg?: string }> {
  const c = supabase();
  if (!c) return { ok: true, user: { name: "김영숙", phone: "01055550101", lic: ["요양보호사 자격증"], caredoc: true, open: false } };
  const { error } = await c.auth.signInWithOAuth({ provider: "kakao", options: { redirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(next) } });
  return error ? { ok: false, msg: krErr(error.message) } : { ok: true, redirected: true };
}

export interface BizJoinInput { org: string; fac: string; name: string; phone: string; email: string; pw: string }

/** 기업 가입. 이메일 인증이 켜져 있으면 세션 없이 needConfirm=true */
export async function bizSignUp(f: BizJoinInput): Promise<{ ok: boolean; biz?: BizUser; needConfirm?: boolean; msg?: string }> {
  const c = supabase();
  const meta = { role: "biz", org: f.org, fac: f.fac, manager_name: f.name, manager_phone: normPhone(f.phone) };
  if (!c) return { ok: true, biz: { org: f.org, fac: f.fac, email: f.email || "kakao", status: "none", name: f.name, phone: f.phone } };
  const { data, error } = await c.auth.signUp({ email: f.email, password: f.pw, options: { data: meta, emailRedirectTo: window.location.origin + "/auth/callback?next=/biz" } });
  if (error) return { ok: false, msg: krErr(error.message) };
  if (!data.session) return { ok: true, needConfirm: true };
  const s = await session();
  return s.biz ? { ok: true, biz: s.biz } : { ok: false, msg: "가입 정보를 저장하지 못했습니다" };
}

export async function bizSignIn(email: string, pw: string): Promise<{ ok: boolean; biz?: BizUser; msg?: string }> {
  const c = supabase();
  if (!c) return { ok: true, biz: { org: "해피케어 방문요양센터", fac: "방문요양", email: email.startsWith("kakao") ? "kakao" : email, status: "verified", name: "김담당", phone: "02-555-0123" } };
  const { error } = await c.auth.signInWithPassword({ email, password: pw });
  if (error) return { ok: false, msg: krErr(error.message) };
  const s = await session();
  return s.biz ? { ok: true, biz: s.biz } : { ok: false, msg: "기업회원 정보가 없습니다. 1분 가입을 진행해 주세요" };
}

export async function bizKakao(): Promise<{ ok: boolean; redirected?: boolean; msg?: string }> {
  const c = supabase(); if (!c) return { ok: true };
  const { error } = await c.auth.signInWithOAuth({ provider: "kakao", options: { redirectTo: window.location.origin + "/auth/callback?next=/biz" } });
  return error ? { ok: false, msg: krErr(error.message) } : { ok: true, redirected: true };
}

export async function resetPassword(email: string) {
  const c = supabase(); if (!c) return { ok: true };
  const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/auth/callback?next=/biz/me" });
  return error ? { ok: false, msg: krErr(error.message) } : { ok: true };
}

export async function signOut() { const c = supabase(); if (c) await c.auth.signOut(); }
