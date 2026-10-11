import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
// 실서비스 도메인 전환 전까지 색인 차단. NEXT_PUBLIC_INDEXABLE=1 로 허용.
export default function robots(): MetadataRoute.Robots {
  const open = process.env.NEXT_PUBLIC_INDEXABLE === "1";
  return { rules: open ? [{ userAgent: "*", allow: "/", disallow: ["/api/", "/me", "/biz/me", "/biz/post", "/auth/", "/admin"] }] : [{ userAgent: "*", disallow: "/" }], sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
