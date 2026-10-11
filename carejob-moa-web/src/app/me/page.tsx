import type { Metadata } from "next";
import MeClient from "@/components/me/MeClient";
export const metadata: Metadata = { title: "내 정보", robots: { index: false } };
export default function MePage() { return <MeClient />; }
