"use client";
import { Analytics } from "@vercel/analytics/react";

/** 방문 통계. 문자 링크의 개인 토큰(?t=...)·검색어가 통계 서버로 넘어가지 않게 주소에서 쿼리를 떼고, 제안 페이지는 번호를 가린다 */
export default function SiteAnalytics() {
  return <Analytics beforeSend={ev => {
    try {
      const u = new URL(ev.url);
      u.search = "";
      if (u.pathname.startsWith("/offer/")) u.pathname = "/offer/[id]";
      return { ...ev, url: u.toString() };
    } catch { return ev; }
  }} />;
}
