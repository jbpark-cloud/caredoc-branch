"use client";
import { useAuth, useToast } from "./providers";
export default function FacilityAlert({ org }: { org: string }) {
  const { requireUser } = useAuth(); const toast = useToast();
  return <button className="btn pri pill" onClick={() => requireUser(() => toast(`${org} 새 공고 알림을 신청했습니다`))}>이 시설 새 공고 알림</button>;
}
