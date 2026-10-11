import type { Metadata } from "next";
import BizMe from "@/components/biz/BizMe";
export const metadata: Metadata = { title: "기업회원 정보", robots: { index: false } };
export default function BizMePage() { return <BizMe />; }
