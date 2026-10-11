import type { Metadata } from "next";
import PostForm from "@/components/biz/PostForm";
export const metadata: Metadata = { title: "공고 등록 (무료)", robots: { index: false } };
export default function PostPage() { return <PostForm />; }
