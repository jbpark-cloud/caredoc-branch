// 서버 전용 DB 접근. SUPABASE_SERVICE_ROLE_KEY 가 있으면 Supabase 에 기록, 없으면 콘솔 로그(개발·데모).
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function dbEnabled() { return !!(URL && KEY); }

export async function insert(table: string, row: Record<string, unknown>): Promise<{ ok: boolean; id?: string | number; msg?: string }> {
  if (!URL || !KEY) { console.log(`[db:mock] ${table}`, JSON.stringify(row)); return { ok: true, id: Date.now() }; }
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { data, error } = await c.from(table).insert(row).select("id").single();
  if (error) { console.error(`[db] ${table}`, error.message); return { ok: false, msg: error.message }; }
  return { ok: true, id: data?.id };
}
