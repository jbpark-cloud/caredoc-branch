"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "../providers";

/** 기업 인증 상태 배너 */
export function BizVerifyBanner() {
  const { biz, ready, open, patchBiz, demo } = useAuth(); const toast = useToast();
  if (!ready) return null;
  if (!biz) return <div className="vbanner none"><div><b>아직 로그인 전입니다</b><p>가입은 1분, 공고 등록은 무료. 인증이 끝나면 구직자에게 노출됩니다.</p></div><div className="row"><button className="btn out sm" onClick={() => open({ type: "login", kind: "biz" })}>로그인</button><button className="btn sec sm pill" onClick={() => open({ type: "bizjoin" })}>기업회원 1분 가입</button></div></div>;
  if (biz.status === "verified") return <div className="vbanner ok"><div><b>{biz.org} · 인증 완료</b><p>공고가 구직자에게 노출되고 있습니다. 공단 평가등급이 공고에 자동 표시됩니다.</p></div><span className="tag gr">인증 완료</span></div>;
  if (biz.status === "pending") return <div className="vbanner pend"><div><b>{biz.org} · 인증 검수 중</b><p>운영팀이 24시간 안에 확인합니다. 그동안 공고를 미리 작성해 두세요. 검수가 끝나면 자동 노출됩니다.</p></div>{demo ? <button className="btn out sm" onClick={() => { patchBiz({ status: "verified" }); toast("시범 운영: 검수 완료로 처리했습니다"); }}>검수 완료로 처리(시범)</button> : <span className="tag bl">검수 중</span>}</div>;
  return <div className="vbanner none"><div><b>{biz.org} · 시설 인증이 필요합니다</b><p>공고는 작성할 수 있지만 인증 전엔 구직자에게 보이지 않습니다. 사업자번호 또는 장기요양기관 코드 하나면 됩니다. 7일 안에 인증하지 않으면 리마인드 후 작성한 공고가 비공개로 유지됩니다.</p></div><button className="btn sec sm pill" onClick={() => open({ type: "bizjoin", step: 2 })}>지금 인증하기</button></div>;
}

export function BizCta({ className, children, href = "/biz/post" }: { className?: string; children: React.ReactNode; href?: string }) {
  const { requireBiz } = useAuth(); const router = useRouter();
  return <button className={className ?? "btn pri pill xl"} onClick={() => requireBiz(() => router.push(href))}>{children}</button>;
}

export function BackToBiz() { return <Link className="btn out xs" style={{ alignSelf: "flex-start" }} href="/biz">← 기업 홈</Link>; }

export function OrderButton({ name, price, className, children }: { name: string; price: string; className?: string; children: React.ReactNode }) {
  const { biz, open } = useAuth();
  return <button className={className ?? "btn out pill"} onClick={() => { if (!biz) open({ type: "bizjoin", then: () => open({ type: "order", name, price }) }); else open({ type: "order", name, price }); }}>{children}</button>;
}
