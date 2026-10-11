"use client";
import { useToast } from "./providers";
export default function ConsultButton() {
  const toast = useToast();
  return <button className="btn pri pill" onClick={async () => { try { await fetch("/api/consult", { method: "POST" }); } catch {} toast("상담 신청이 접수되었습니다"); }}>상담 신청</button>;
}
