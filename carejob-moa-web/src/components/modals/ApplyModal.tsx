"use client";
import { useState } from "react";
import Link from "next/link";
import { Modal, Steps, Check, useAuth, useToast } from "../providers";
import { LIC_OPTIONS } from "@/lib/constants";
import { sendOtp, verifyOtp, normPhone } from "@/lib/auth/client";
import type { Job } from "@/lib/types";

export default function ApplyModal({ job: j }: { job: Job }) {
  const { user, close, setUser, patchUser, addApplied } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(user ? (user.lic.length ? 3 : 3) : 1);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [proxy, setProxy] = useState(false);
  const [cphone, setCphone] = useState("");
  const [via, setVia] = useState<"kakao" | "sms">("kakao");
  const [code, setCode] = useState("");
  const [ok, setOk] = useState(!!user);
  const [lic, setLic] = useState<string[]>(user?.lic.slice() ?? []);
  const [openOffers, setOpenOffers] = useState(user?.open ?? false);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleLic = (o: string) => setLic(l => { if (o === "아직 없어요") return l.includes(o) ? [] : [o]; const n = l.includes(o) ? l.filter(x => x !== o) : [...l, o]; return n.filter(x => x !== "아직 없어요"); });

  const submit = async () => {
    setBusy(true);
    try {
      await fetch("/api/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: j.id, name, phone: normPhone(phone), proxyPhone: proxy ? normPhone(cphone) : null, lic: lic.filter(x => x !== "아직 없어요"), openToOffers: openOffers }) });
    } catch {}
    setBusy(false);
    if (!user) { setUser({ name, phone: normPhone(phone), lic: lic.filter(x => x !== "아직 없어요"), caredoc: false, open: openOffers }); setJoined(true); }
    addApplied(j.id); setStep(4);
  };

  let body: React.ReactNode;
  if (step === 1) body = <>
    <h2>이름과 전화번호를 알려주세요</h2><p className="muted">시설에서 이 번호로 연락드립니다.</p><Steps n={1} of={3} />
    <div className="stack big" style={{ gap: 14 }}>
      <div className="field"><label htmlFor="a-name">이름</label><input id="a-name" placeholder="홍길동" value={name} onChange={e => setName(e.target.value)} autoFocus /></div>
      <div className="field"><label htmlFor="a-phone">휴대전화</label><input id="a-phone" inputMode="numeric" placeholder="010-0000-0000" value={phone} onChange={e => setPhone(e.target.value)} /></div>
      <Check on={proxy} onClick={() => setProxy(p => !p)}>가족 대신 지원해요<br /><span className="cap">일하실 분의 이름·번호를 위에, 연락받을 내 번호를 아래에</span></Check>
      {proxy && <div className="field"><label htmlFor="a-cphone">연락받을 보호자 번호</label><input id="a-cphone" inputMode="numeric" placeholder="010-0000-0000" value={cphone} onChange={e => setCphone(e.target.value)} /></div>}
    </div>
    <p className="cap" style={{ marginTop: 12 }}>{user ? "로그인된 번호로 지원합니다." : "처음이시면 이 절차가 곧 회원가입입니다. 비밀번호는 없어요."}</p>
    <button className="btn pri pill wide" style={{ marginTop: 12, height: 56, fontSize: 18 }} disabled={busy} onClick={async () => { if (!name || normPhone(phone).length < 10) { toast("이름과 전화번호를 확인해 주세요"); return; } if (user) { setStep(3); return; } setBusy(true); const r = await sendOtp(phone); setBusy(false); if (!r.ok) { toast(r.msg || "인증 요청 실패"); return; } setStep(2); }}>다음</button></>;
  else if (step === 2) body = <>
    <h2>본인 확인</h2><p className="muted">한 가지만 고르세요. 카카오톡이 더 편합니다.</p><Steps n={2} of={3} />
    <div className="cert"><button className={via === "kakao" ? "on" : ""} onClick={() => setVia("kakao")}>카카오톡 인증</button><button className={via === "sms" ? "on" : ""} onClick={() => setVia("sms")}>문자 인증</button></div>
    {via === "kakao" ? <div className="card" style={{ marginTop: 16, background: "var(--bg)" }}><p><b>{phone}</b> 카카오톡으로 인증 요청을 보냈습니다.</p><p className="muted small">카카오톡 알림에서 [인증하기]를 누르시면 자동으로 확인됩니다.</p><button className="btn sec sm" style={{ marginTop: 10 }} onClick={() => setOk(true)}>인증 완료</button></div>
      : <div className="field big" style={{ marginTop: 16 }}><label htmlFor="a-code">문자로 받은 숫자 6자리</label><input id="a-code" inputMode="numeric" placeholder="000000" maxLength={6} value={code} onChange={e => { const v = e.target.value.replace(/\D/g, ""); setCode(v); setOk(v.length === 6); }} autoFocus /><span className="help">{phone}로 보냈습니다. 안 오면 <a href="#" style={{ color: "var(--info)" }} onClick={async e => { e.preventDefault(); await sendOtp(phone); toast("다시 보냈습니다"); }}>다시 받기</a></span></div>}
    <div className="two" style={{ marginTop: 20 }}><button className="btn out" onClick={() => setStep(1)}>이전</button><button className="btn pri pill" disabled={!ok || busy} onClick={async () => { if (via === "sms") { setBusy(true); const r = await verifyOtp(phone, code); setBusy(false); if (!r.ok) { toast(r.msg || "인증 실패"); return; } } setStep(3); }}>확인됐어요, 다음</button></div></>;
  else if (step === 3) body = <>
    <h2>가지고 계신 자격을 눌러주세요</h2><p className="muted">여러 개 골라도 됩니다. 없으면 &apos;아직 없어요&apos;.</p><Steps n={3} of={3} />
    <div className="stack">{LIC_OPTIONS.map(o => <Check key={o} on={lic.includes(o)} onClick={() => toggleLic(o)}>{o}</Check>)}</div>
    <div className="two" style={{ marginTop: 20 }}><button className="btn out" onClick={() => setStep(user ? 1 : 2)}>이전</button><button className="btn pri pill" disabled={!lic.length || busy} onClick={submit}>지원 완료</button></div></>;
  else body = <div className="done">
    <span className="ok"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg></span>
    <h2>지원이 끝났습니다</h2><p className="muted" style={{ marginTop: 8 }}><b>{j.org}</b>에서 <b>{proxy && cphone ? cphone : phone}</b>로 보통 1~2일 안에 연락드립니다.</p>
    {joined && <div className="card" style={{ textAlign: "left", marginTop: 16, background: "var(--green-bg)", borderColor: "transparent" }}><b>회원가입도 함께 끝났습니다</b><p className="small">다음부터는 전화번호만 누르면 바로 지원돼요. 상단 이름을 누르면 내 지원 내역을 볼 수 있습니다.</p></div>}
    <div className="card" style={{ textAlign: "left", marginTop: 20, background: "var(--bg)" }}><b>카카오톡으로 3가지만 더 여쭤볼게요</b><p className="muted small">경력 기간 · 가능한 요일 · 이동 수단. 답하시면 시설에서 더 빨리 연락합니다. (선택)</p></div>
    <Check on={openOffers} style={{ marginTop: 10, textAlign: "left" }} onClick={() => { const v = !openOffers; setOpenOffers(v); patchUser({ open: v }); }}>다른 시설에서도 연락받을게요<br /><span className="cap">이름은 성만 남기고(김OO) 지역·자격·희망 시간만 시설에 보입니다. 연락처는 내가 수락해야 공개.</span></Check>
    <div className="two" style={{ marginTop: 20 }}><button className="btn out" onClick={close}>닫기</button><Link className="btn pri pill" href={`/jobs/${j.gu}/${j.job}`} onClick={close}>비슷한 공고 더 보기</Link></div>
  </div>;

  return <Modal onClose={close}>{body}</Modal>;
}
