"use client";
import { useState } from "react";
import { authFetch } from "@/lib/auth/client";
import { useToast } from "../providers";

const HEAD: Record<string, string> = { "시설명": "org", "시설유형": "fac", "직종": "job", "근무형태": "sched", "공고제목": "title", "근무시간": "hours", "주소": "addr", "급여": "pay", "연락처": "contact", "4대보험": "ins", "급여공개": "pay_open", "자격무관": "no_lic", "모집인원": "head", "상세": "description" };
const TEMPLATE = "시설명,시설유형,직종,근무형태,공고제목,근무시간,주소,급여,연락처,4대보험,급여공개,자격무관,모집인원,상세\n케어닥 방문요양 강남점,방문요양,요양보호사,오전만,요양보호사 선생님을 모십니다,오전 9~12시 · 주 5일,서울 강남구 대치동,시급 15000원,02-000-0000,Y,Y,N,2,\"어르신 신체활동 지원\n식사·위생 보조\"\n";

/** RFC4180 수준 CSV 파서(따옴표·줄바꿈 포함 셀) */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}
function decode(buf: ArrayBuffer) { try { return new TextDecoder("utf-8", { fatal: true }).decode(buf); } catch { return new TextDecoder("euc-kr").decode(buf); } }

export default function CsvImport({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [caredoc, setCaredoc] = useState(false);
  const [result, setResult] = useState<{ saved: number; errors: { line: number; error: string }[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = (text: string) => {
    const t = parseCsv(text.replace(/^﻿/, "")); if (t.length < 2) { toast("헤더와 공고 1줄 이상이 필요합니다"); return; }
    const head = t[0].map(h => h.trim()); setUnknown(head.filter(h => !HEAD[h]));
    setRows(t.slice(1).map(r => Object.fromEntries(head.map((h, i) => [HEAD[h] || h, (r[i] ?? "").trim()])))); setResult(null);
  };
  return <div className="stack" style={{ gap: 12 }}>
    <p className="small">엑셀에서 <b>CSV로 저장</b>한 파일을 올리면 공고가 바로 노출됩니다(운영자 등록 = 검수 완료). 한 번에 1,000건까지.</p>
    <div className="row"><a className="btn out sm" download="케어잡모아_공고_양식.csv" href={"data:text/csv;charset=utf-8,﻿" + encodeURIComponent(TEMPLATE)}>양식 내려받기</a>
      <label className="btn sec sm pill" style={{ cursor: "pointer" }}>CSV 파일 선택<input type="file" accept=".csv,text/csv" hidden onChange={async e => { const f = e.target.files?.[0]; if (f) load(decode(await f.arrayBuffer())); e.target.value = ""; }} /></label>
      <label className="small row" style={{ gap: 6 }}><input type="checkbox" checked={caredoc} onChange={e => setCaredoc(e.target.checked)} />케어닥 직영 공고로 표시</label></div>
    {unknown.length > 0 && <p className="cap" style={{ color: "var(--red)" }}>알 수 없는 열(무시됨): {unknown.join(", ")}</p>}
    {rows.length > 0 && <>
      <div className="tbl" style={{ maxHeight: 280, overflow: "auto" }}><table><thead><tr><th>#</th><th>시설명</th><th>직종</th><th>근무형태</th><th>주소</th><th>급여</th></tr></thead><tbody>{rows.slice(0, 50).map((r, i) => <tr key={i}><td>{i + 2}</td><td>{r.org}</td><td>{r.job}</td><td>{r.sched}</td><td>{r.addr}</td><td>{r.pay}</td></tr>)}</tbody></table></div>
      <button className="btn pri pill" style={{ alignSelf: "flex-start" }} disabled={busy} onClick={async () => { setBusy(true); const r = await authFetch("/api/admin", { method: "POST", body: JSON.stringify({ action: "import", id: 0, rows, caredoc }) }); const j = await r.json().catch(() => ({})); setBusy(false); if (!j.ok && !j.errors) { toast(j.msg || "등록하지 못했습니다"); return; } setResult({ saved: j.saved || 0, errors: j.errors || [] }); setRows([]); toast(`${j.saved || 0}건 등록했습니다`); onDone(); }}>{busy ? "등록 중…" : `${rows.length}건 등록하기`}</button>
    </>}
    {result && <div className={`vbanner ${result.errors.length ? "none" : "ok"}`}><div><b>{result.saved}건 등록{result.errors.length ? ` · ${result.errors.length}건 제외` : ""}</b>{result.errors.slice(0, 10).map(e => <p key={e.line}>{e.line}행: {e.error}</p>)}</div></div>}
  </div>;
}
