"use client";
import { useToast } from "./providers";
export default function CopyUrl({ url }: { url: string }) {
  const toast = useToast();
  return <button className="btn out xs" onClick={async () => { try { await navigator.clipboard.writeText(url); toast("주소를 복사했습니다"); } catch { toast("복사가 지원되지 않는 환경입니다"); } }}>복사</button>;
}
