"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { BizVerifyBanner } from "./BizShared";
import { BIZ_STATUS_LABEL } from "@/lib/constants";

export default function BizMe() {
  const { biz, ready, open, logout } = useAuth(); const router = useRouter(); const leaving = useRef(false);
  useEffect(() => { if (ready && !biz && !leaving.current) open({ type: "login", kind: "biz", then: () => {} }); }, [ready, biz, open]);
  if (!ready) return null;
  if (!biz) return <div style={{ paddingBlock: 48 }} className="stack"><h1>기업회원 정보</h1><p className="muted">로그인하면 시설 정보와 이용 중인 상품을 볼 수 있습니다.</p><button className="btn sec pill" style={{ alignSelf: "flex-start" }} onClick={() => open({ type: "login", kind: "biz" })}>로그인</button></div>;
  return <>
    <div style={{ paddingBlock: 24 }} className="stack"><h1>기업회원 정보</h1></div><BizVerifyBanner />
    <div className="grid g2" style={{ marginTop: 16 }}><div className="card stack"><h3>{biz.org}</h3><dl className="kv"><dt>시설 유형</dt><dd>{biz.fac}</dd><dt>담당자</dt><dd>{biz.name}</dd><dt>아이디</dt><dd>{biz.email === "kakao" ? "카카오 연동" : biz.email}</dd><dt>인증</dt><dd>{biz.status === "verified" ? "인증 완료 · 공단 평가등급 연결" : BIZ_STATUS_LABEL[biz.status]}</dd></dl></div>
    <div className="card stack"><h3>이용 중인 상품</h3><p className="muted small">상위노출 7일 (요양보호사 · 오전) · 잔여 4일</p><p className="muted small">인재 제안 잔여 0건</p><Link className="btn out sm" style={{ alignSelf: "flex-start" }} href="/biz/ads">광고 상품 보기</Link><div className="hr" /><button className="btn out sm" style={{ alignSelf: "flex-start" }} onClick={() => { leaving.current = true; logout(); router.push("/biz"); }}>로그아웃</button></div></div>
  </>;
}
