// 서버 전용 DB 접근. SUPABASE_SERVICE_ROLE_KEY 가 있으면 Supabase, 없으면 시범(데모) 모드.
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "node:crypto";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;
let cached: SupabaseClient | null = null;
export function dbEnabled() { return !!(URL && KEY); }
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
/** 쓰기·인증·API 용: Next 데이터 캐시를 쓰지 않는다 */
export function db(): SupabaseClient | null {
  if (!URL || !KEY) return null;
  if (!client) client = createClient(URL, KEY, { ...opts, global: { fetch: (i: RequestInfo | URL, init?: RequestInit) => fetch(i, { ...init, cache: "no-store" }) } });
  return client;
}
/** 공개 목록 읽기 용: 60초 캐시 + 'jobs' 태그(쓰기 시 revalidateTag 로 즉시 갱신) */
export function dbRead(): SupabaseClient | null {
  if (!URL || !KEY) return null;
  if (!cached) cached = createClient(URL, KEY, { ...opts, global: { fetch: (i: RequestInfo | URL, init?: RequestInit) => fetch(i, { ...init, next: { revalidate: 60, tags: ["jobs"] } } as RequestInit) } });
  return cached;
}

/** 시범 모드: DB 미연결이거나 NEXT_PUBLIC_DEMO=1 이면 샘플 공고를 '예시'로 표시 */
export function isDemo() { return process.env.NEXT_PUBLIC_DEMO === "1" || !dbEnabled(); }

export async function insert(table: string, row: Record<string, unknown>): Promise<{ ok: boolean; id?: string | number; msg?: string; demo?: boolean }> {
  const c = db();
  if (!c) { console.log(`[db:demo] ${table}`, JSON.stringify(row)); return { ok: true, id: Date.now(), demo: true }; }
  const { data, error } = await c.from(table).insert(row).select("id").single();
  if (error) { console.error(`[db] ${table}`, error.message); return { ok: false, msg: "저장 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." }; }
  return { ok: true, id: data?.id };
}

/** Authorization: Bearer <supabase access token> → 사용자 */
export async function userFromRequest(req: Request): Promise<User | null> {
  const c = db(); if (!c) return null;
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  const { data, error } = await c.auth.getUser(token);
  return error ? null : data.user;
}

export function isAdminEmail(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}
/** 운영자: ADMIN_EMAILS 에 있고 '이메일 확인이 끝난' 계정만. (이메일 확인을 끈 환경에서 남의 주소로 가입해 운영자가 되는 것을 막는다) */
export function isAdminUser(u?: User | null) {
  return !!u && !!u.email_confirmed_at && isAdminEmail(u.email);
}

/** 비밀값 비교는 길이·내용 모두 상수 시간으로 */
export function safeEq(a: string, b: string) {
  const x = createHash("sha256").update(a).digest(), y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

/** 사람 이름: 글자와 공백만 남긴다(점·슬래시·숫자 제거) → 문자 본문에 링크로 읽힐 글자를 끼워 넣지 못하게 */
export const cleanName = (v: unknown, max = 20) => String(v ?? "").replace(/[^\p{L}\p{M} ]/gu, "").replace(/\s+/g, " ").trim().slice(0, max);
/** 시설명 등 한 줄 텍스트: 제어문자·꺾쇠 제거 */
export const cleanLine = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
export const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** 아주 단순한 인스턴스 메모리 레이트리밋 (MVP). 키당 windowMs 동안 max 회 */
const hits = new Map<string, number[]>();
export function rateLimit(req: Request, bucket: string, max = 10, windowMs = 60_000): boolean {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  const k = bucket + ":" + ip; const now = Date.now();
  const arr = (hits.get(k) || []).filter(t => now - t < windowMs); arr.push(now); hits.set(k, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length <= max;
}
