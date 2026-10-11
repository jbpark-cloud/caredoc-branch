import type { Metadata } from "next";
import TalentClient from "@/components/biz/TalentClient";
import { getTalents } from "@/lib/repo";
import { meta } from "@/lib/seo";
export const metadata: Metadata = meta("인재정보 · 요양·돌봄 구직자 프로필", "동의한 구직자의 지역·자격·희망 시간 프로필. 열람 무료, 제안 발송 건당 과금.", "/biz/talent");
export const revalidate = 60;
export default async function TalentPage() { return <TalentClient talents={await getTalents()} />; }
