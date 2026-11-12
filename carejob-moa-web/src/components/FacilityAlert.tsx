"use client";
import { useAuth, useToast } from "./providers";
import { authFetch, authMode } from "@/lib/auth/client";

/** 시설이 있는 동네(구)의 새 공고 알림. 알림은 지역·직종 조건 한 가지로 저장된다(시설 단위 알림은 아직 없음) */
export default function FacilityAlert({ gu }: { gu: string }) {
  const { requireUser, setAlert, demo } = useAuth(); const toast = useToast();
  const save = async () => {
    if (authMode() !== "supabase" || demo) { toast("시범 운영 중에는 알림 문자가 발송되지 않습니다"); return; }
    try {
      const r = await authFetch("/api/alerts", { method: "POST", body: JSON.stringify({ gu }) }); const j = await r.json().catch(() => ({}));
      if (!j.ok) { toast(j.msg || "신청하지 못했습니다"); return; }
      setAlert(`${gu} 전체`); toast(`${gu} 새 공고가 올라오면 아침에 문자로 알려드릴게요`);
    } catch { toast("인터넷 연결을 확인해 주세요"); }
  };
  return <button className="btn pri pill" onClick={() => requireUser(save)}>{gu} 새 공고 알림 받기</button>;
}
