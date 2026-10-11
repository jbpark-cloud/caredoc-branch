"use client";
import { useState } from "react";
export default function OfferActions({ id, t, initial }: { id: number; t: string; initial: string }) {
  const [status, setStatus] = useState(initial); const [busy, setBusy] = useState(false);
  const act = async (action: "accept" | "decline") => { setBusy(true); try { const r = await fetch("/api/offer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, t, action }) }); const j = await r.json(); if (j.status) setStatus(j.status); } catch {} setBusy(false); };
  if (status === "accepted") return <div className="vbanner ok"><div><b>수락했습니다</b><p>시설에서 보통 1~2일 안에 전화드립니다.</p></div></div>;
  if (status === "declined") return <div className="vbanner none"><div><b>거절했습니다</b><p>시설에는 연락처가 전달되지 않았습니다.</p></div></div>;
  return <div className="two"><button className="btn out" disabled={busy} onClick={() => act("decline")}>괜찮아요</button><button className="btn pri pill" disabled={busy} onClick={() => act("accept")}>수락하고 연락받기</button></div>;
}
