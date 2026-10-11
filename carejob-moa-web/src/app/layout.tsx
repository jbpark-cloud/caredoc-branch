import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import Header from "@/components/Header";
import Footer, { TabBar } from "@/components/Footer";
import ModalHost from "@/components/ModalHost";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — 우리 동네 요양·돌봄 일자리`, template: `%s | ${SITE_NAME}` },
  description: "서울 요양보호사·간병인·사회복지사 일자리. 집 근처·근무 시간·공단 평가등급으로 찾고 전화번호만으로 지원하세요.",
  applicationName: SITE_NAME,
  robots: process.env.NEXT_PUBLIC_INDEXABLE === "1" ? { index: true, follow: true } : { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#FF6737" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Header />
          <main id="app" className="wrap">{children}</main>
          <Footer />
          <TabBar />
          <ModalHost />
        </Providers>
      </body>
    </html>
  );
}
