"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, useAuth, useToast } from "../providers";
import { Ico } from "../ui";
import { sendOtp, verifyOtp, kakaoLogin, normPhone, bizSignIn, bizKakao, resetPassword, kakaoEnabled } from "@/lib/auth/client";

export default function LoginModal({ kind, then }: { kind?: "user" | "biz"; then?: () => void }) {
  const { close, open, setUser, setBiz } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [k, setK] = useState<"user" | "biz" | null>(kind ?? null);
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [via, setVia] = useState<"sms" | "kakao">("sms");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const finishUser = async (viaKakao: boolean) => {
    setBusy(true);
    const r = viaKakao ? await kakaoLogin(window.location.pathname) : await verifyOtp(phone, code);
    setBusy(false);
    if (!r.ok) { toast(r.msg || "인증에 실패했습니다"); return; }
    if ("redirected" in r && r.redirected) return;
    setUser(r.user!); close(); toast(r.user!.caredoc ? `${r.user!.name}님, 다시 오셨네요` : "가입과 로그인이 끝났습니다"); then?.();
  };
  const finishBiz = async (how: "email" | "kakao") => {
    setBusy(true);
    if (how === "kakao") { const r = await bizKakao(); setBusy(false); if (!r.ok) { toast(r.msg || "카카오 로그인 실패"); return; } if (r.redirected) return; }
    const r = how === "kakao" ? await bizSignIn("kakao@demo", "") : await bizSignIn(email, pw);
    setBusy(false);
    if (!r.ok || !r.biz) { toast(r.msg || "로그인하지 못했습니다"); return; }
    setBiz(r.biz); close(); toast("로그인했습니다"); if (then) then(); else router.push("/biz");
  };

  let body: React.ReactNode;
  if (!k) body = <>
    <h2>어떻게 오셨어요?</h2><p className="muted">한 번만 고르시면 됩니다.</p>
    <div className="stack" style={{ marginTop: 16 }}>
      <button className="pick" onClick={() => setK("user")}><b>일자리를 찾고 있어요</b><span>전화번호만 있으면 됩니다. 비밀번호 없음.</span></button>
      <button className="pick" onClick={() => setK("biz")}><b>시설·병원 담당자예요</b><span>이메일로 로그인 · 처음이면 1분 가입</span></button>
    </div></>;
  else if (k === "user") {
    if (step === 1) body = <>
      <h2>전화번호를 눌러주세요</h2><p className="muted">비밀번호는 없습니다. 문자로 오는 숫자 6자리만 넣으면 끝.</p>
      <div className="field big" style={{ marginTop: 16 }}><label htmlFor="l-phone">휴대전화</label><input id="l-phone" inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" value={phone} onChange={e => setPhone(e.target.value)} autoFocus /></div>
      <button className="btn pri pill wide" style={{ marginTop: 16, height: 56, fontSize: 18 }} disabled={busy} onClick={async () => { if (normPhone(phone).length < 10) { toast("전화번호를 확인해 주세요"); return; } setBusy(true); const r = await sendOtp(phone); setBusy(false); if (!r.ok) { toast(r.msg || "문자 발송 실패"); return; } setVia("sms"); setStep(2); }}>문자로 인증번호 받기</button>
      {kakaoEnabled() && <><div className="or"><span>또는</span></div>
      <button className="btn kakao wide" onClick={() => { setVia("kakao"); setStep(2); }}><Ico.kakao />카카오로 로그인</button></>}
      <p className="cap" style={{ marginTop: 14, textAlign: "center" }}>처음 오셨어도 이 절차가 곧 가입입니다. 계속하면 <Link href="/terms" target="_blank" style={{ color: "var(--info)" }}>이용약관</Link>·<Link href="/privacy" target="_blank" style={{ color: "var(--info)" }}>개인정보처리방침</Link>에 동의하게 됩니다.</p></>;
    else body = <>
      <h2>{via === "kakao" ? "카카오로 로그인" : "문자를 확인해 주세요"}</h2>
      {via === "kakao" ? <div className="card" style={{ marginTop: 16, background: "var(--bg)" }}><p>카카오 화면으로 이동해 로그인한 뒤, 이 화면으로 돌아옵니다.</p><button className="btn sec sm" style={{ marginTop: 10 }} disabled={busy} onClick={() => finishUser(true)}>카카오로 계속</button></div>
        : <div className="field big" style={{ marginTop: 16 }}><label htmlFor="l-code">문자로 받은 숫자 6자리</label><input id="l-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} autoFocus /><span className="help">{phone}로 보냈습니다. 안 오면 <a href="#" style={{ color: "var(--info)" }} onClick={async e => { e.preventDefault(); const r = await sendOtp(phone); toast(r.ok ? "다시 보냈습니다" : (r.msg || "다시 보내지 못했습니다")); }}>다시 받기</a>{kakaoEnabled() && <> · <a href="#" style={{ color: "var(--info)" }} onClick={e => { e.preventDefault(); setVia("kakao"); }}>카카오로 대신하기</a></>}</span></div>}
      <div className="two" style={{ marginTop: 20 }}><button className="btn out" onClick={() => setStep(1)}>이전</button>{via === "sms" && <button className="btn pri pill" disabled={code.length !== 6 || busy} onClick={() => finishUser(false)}>로그인</button>}</div></>;
  } else body = <>
    <h2>기업회원 로그인</h2><p className="muted">처음이시면 아래 &apos;1분 가입&apos;으로.</p>
    <div className="stack" style={{ marginTop: 16, gap: 12 }}>
      <div className="field"><label htmlFor="l-email">이메일(아이디)</label><input id="l-email" type="email" autoComplete="email" placeholder="manager@facility.kr" value={email} onChange={e => setEmail(e.target.value)} autoFocus /></div>
      <div className="field"><label htmlFor="l-pw">비밀번호</label><input id="l-pw" type="password" autoComplete="current-password" placeholder="8자 이상" value={pw} onChange={e => setPw(e.target.value)} /><span className="help"><a href="#" style={{ color: "var(--info)" }} onClick={async e => { e.preventDefault(); if (!email.includes("@")) { toast("이메일을 먼저 입력해 주세요"); return; } const r = await resetPassword(email); toast(r.ok ? "비밀번호 재설정 링크를 이메일로 보냈습니다" : (r.msg || "보내지 못했습니다")); }}>비밀번호를 잊으셨나요?</a></span></div>
    </div>
    <button className="btn sec pill wide" style={{ marginTop: 16 }} disabled={busy} onClick={() => { if (!email.includes("@") || pw.length < 8) { toast("이메일과 비밀번호(8자 이상)를 확인해 주세요"); return; } finishBiz("email"); }}>로그인</button>
    {kakaoEnabled() && <><div className="or"><span>또는</span></div>
    <button className="btn kakao wide" disabled={busy} onClick={() => finishBiz("kakao")}><Ico.kakao />카카오로 로그인</button></>}
    <button className="btn out wide" style={{ marginTop: 10 }} onClick={() => open({ type: "bizjoin", then })}>기업회원 1분 가입</button></>;

  return <Modal onClose={close}>{body}</Modal>;
}
