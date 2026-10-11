"use client";
import { useState } from "react";
import { useToast } from "./providers";
export default function ConsultButton() {
  const toast = useToast();
  const [open, setOpen] = useState(false); const [phone, setPhone] = useState(""); const [busy, setBusy] = useState(false); const [agree, setAgree] = useState(false);
  if (!open) return <button className="btn pri pill" onClick={() => setOpen(true)}>상담 신청</button>;
  return <form className="stack" style={{ minWidth: 260 }} onSubmit={async e => {
    e.preventDefault(); if (!agree) { toast("연락 목적의 번호 수집에 동의해 주세요"); return; }
    setBusy(true); let j: { ok?: boolean; msg?: string } = {};
    try { const r = await fetch("/api/consult", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) }); j = await r.json(); } catch {}
    setBusy(false); if (j.ok) { toast("상담 신청이 접수되었습니다. 평일 중 전화드립니다"); setOpen(false); setPhone(""); } else toast(j.msg || "접수하지 못했습니다");
  }}>
    <div className="field"><label htmlFor="c-phone">연락받을 휴대전화</label><input id="c-phone" inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" value={phone} onChange={e => setPhone(e.target.value)} autoFocus /></div>
    <label className="cap" style={{ display: "flex", gap: 6, alignItems: "flex-start" }}><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ marginTop: 2 }} />[필수] 상담 연락 목적으로 번호를 수집하고 상담 후 6개월 뒤 파기하는 데 동의</label>
    <button className="btn pri pill" disabled={busy}>{busy ? "보내는 중…" : "상담 신청 보내기"}</button>
  </form>;
}
