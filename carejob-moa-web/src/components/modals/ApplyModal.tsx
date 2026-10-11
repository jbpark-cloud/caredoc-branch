"use client";
import { useState } from "react";
import Link from "next/link";
import { Modal, Steps, Check, useAuth, useToast } from "../providers";
import { LIC_OPTIONS } from "@/lib/constants";
import { sendOtp, verifyOtp, kakaoLogin, normPhone, authFetch, authMode } from "@/lib/auth/client";
import type { Job } from "@/lib/types";
import { jobPath } from "@/lib/seo";

export default function ApplyModal({ job: j }: { job: Job }) {
  const { user, close, setUser, patchUser, addApplied, demo, applied } = useAuth();
  const toast = useToast();
  const verified = !!user && !!user.phone;
  const [step, setStep] = useState(verified ? 3 : 1);
  const [name, setName] = useState(user?.name && user.name !== "회원" ? user.name : "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [proxy, setProxy] = useState(false);
  const [cphone, setCphone] = useState("");
  const [consent, setConsent] = useState(false);
  const [via, setVia] = useState<"kakao" | "sms">(authMode() === "supabase" ? "sms" : "kakao");
  const [code, setCode] = useState("");
  const [ok, setOk] = useState(verified);
  const [lic, setLic] = useState<string[]>(user?.lic.slice() ?? []);
  const [openOffers, setOpenOffers] = useState(user?.open ?? false);
  const [joined, setJoined] = useState(false);
  const [result, setResult] = useState<"sent" | "demo" | "dup">("sent");
  const [busy, setBusy] = useState(false);
  const already = applied.some(a => a.id === j.id);

  const toggleLic = (o: string) => setLic(l => { if (o === "아직 없어요") return l.includes(o) ? [] : [o]; const n = l.includes(o) ? l.filter(x => x !== o) : [...l, o]; return n.filter(x => x !== "아직 없어요"); });
  const realLic = () => lic.filter(x => x !== "아직 없어요");

  const submit = async () => {
    setBusy(true);
    let res: { ok?: boolean; demo?: boolean; dup?: boolean; msg?: string } = {};
    try {
      const r = await authFetch("/api/apply", { method: "POST", body: JSON.stringify({ jobId: j.id, name, phone: normPhone(phone), proxyPhone: proxy ? normPhone(cphone) : null, lic: realLic(), openToOffers: openOffers, consent: true }) });
      res = await r.json();
    } catch { res = { ok: false, msg: "인터넷 연결을 확인해 주세요" }; }
    setBusy(false);
    if (!res.ok) { toast(res.msg || "지원하지 못했습니다. 잠시 후 다시 시도해 주세요"); return; }
    setResult(res.demo ? "demo" : res.dup ? "dup" : "sent");
    if (!user) setJoined(true);
    setUser({ name, phone: normPhone(phone), lic: realLic(), caredoc: user?.caredoc ?? false, open: openOffers });
    addApplied({ id: j.id, org: j.org, job: j.job, pay: j.pay, path: jobPath(j), at: Date.now() });
    setStep(4);
  };

  const next1 = async () => {
    if (!name.trim() || normPhone(phone).length < 10) { toast("이름과 휴대전화 번호를 확인해 주세요"); return; }
    if (proxy && normPhone(cphone).length < 10) { toast("연락받을 보호자 번호를 확인해 주세요"); return; }
    if (!consent) { toast("개인정보 수집·이용 및 제공에 동의해 주세요"); return; }
    if (verified && normPhone(phone) === user!.phone) { setStep(3); return; }
    setBusy(true); const r = await sendOtp(phone); setBusy(false);
    if (!r.ok) { toast(r.msg || "인증번호를 보내지 못했습니다"); return; }
    setVia("sms"); setOk(false); setCode(""); setStep(2);
  };

  let body: React.ReactNode;
  if (step === 1) body = <>
    <h2>이름과 전화번호를 알려주세요</h2><p className="muted">시설에서 이 번호로 연락드립니다.</p><Steps n={1} of={3} />
    {already && <p className="cap" style={{ color: "var(--primary)", marginBottom: 8 }}>이미 지원한 공고입니다. 다시 보내도 중복으로 접수되지 않아요.</p>}
    <div className="stack big" style={{ gap: 14 }}>
      <div className="field"><label htmlFor="a-name">이름</label><input id="a-name" placeholder="홍길동" autoComplete="name" value={name} onChange={e => setName(e.target.value)} autoFocus /></div>
      <div className="field"><label htmlFor="a-phone">휴대전화</label><input id="a-phone" inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" value={phone} onChange={e => setPhone(e.target.value)} /></div>
      <Check on={proxy} onClick={() => setProxy(p => !p)}>가족 대신 지원해요<br /><span className="cap">일하실 분의 이름·번호를 위에, 연락받을 내 번호를 아래에</span></Check>
      {proxy && <div className="field"><label htmlFor="a-cphone">연락받을 보호자 번호</label><input id="a-cphone" inputMode="numeric" placeholder="010-0000-0000" value={cphone} onChange={e => setCphone(e.target.value)} /></div>}
      <Check on={consent} onClick={() => setConsent(c => !c)}><b>[필수]</b> 개인정보 수집·이용 및 지원 시설 제공 동의<br /><span className="cap">이름·휴대전화·자격을 <b>{j.org}</b>에 전달하고, 채용 연락에만 씁니다. 지원 후 1년 보관 뒤 파기. <Link href="/privacy" target="_blank" style={{ color: "var(--info)" }} onClick={e => e.stopPropagation()}>자세히 보기</Link></span></Check>
    </div>
    <p className="cap" style={{ marginTop: 12 }}>{verified ? "로그인된 번호로 지원합니다." : "처음이시면 이 절차가 곧 회원가입입니다. 비밀번호는 없어요."}</p>
    <button className="btn pri pill wide" style={{ marginTop: 12, height: 56, fontSize: 18 }} disabled={busy} onClick={next1}>다음</button></>;
  else if (step === 2) body = <>
    <h2>본인 확인</h2><p className="muted">{phone}로 보낸 숫자 6자리를 넣어 주세요.</p><Steps n={2} of={3} />
    <div className="cert"><button className={via === "sms" ? "on" : ""} onClick={() => setVia("sms")}>문자 인증</button><button className={via === "kakao" ? "on" : ""} onClick={() => setVia("kakao")}>카카오로 인증</button></div>
    {via === "kakao" ? <div className="card" style={{ marginTop: 16, background: "var(--bg)" }}>
      <p>카카오 로그인으로 본인 확인을 대신합니다.</p>
      <p className="muted small">{authMode() === "supabase" ? "카카오 화면으로 이동했다가 이 공고로 돌아옵니다. 돌아오면 '간편 지원하기'를 한 번 더 눌러 주세요." : "시범 운영 중에는 버튼만 누르면 확인됩니다."}</p>
      <button className="btn kakao sm" style={{ marginTop: 10 }} onClick={async () => { if (authMode() === "supabase") { const r = await kakaoLogin(window.location.pathname); if (!r.ok) toast(r.msg || "카카오 로그인 실패"); } else setOk(true); }}>카카오로 인증하기</button>
    </div>
      : <div className="field big" style={{ marginTop: 16 }}><label htmlFor="a-code">문자로 받은 숫자 6자리</label><input id="a-code" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} value={code} onChange={e => { const v = e.target.value.replace(/\D/g, ""); setCode(v); setOk(v.length === 6); }} autoFocus /><span className="help">안 오면 <a href="#" style={{ color: "var(--info)" }} onClick={async e => { e.preventDefault(); const r = await sendOtp(phone); toast(r.ok ? "다시 보냈습니다" : (r.msg || "다시 보내지 못했습니다")); }}>다시 받기</a></span></div>}
    <div className="two" style={{ marginTop: 20 }}><button className="btn out" onClick={() => setStep(1)}>이전</button><button className="btn pri pill" disabled={!ok || busy} onClick={async () => { if (via === "sms") { setBusy(true); const r = await verifyOtp(phone, code); setBusy(false); if (!r.ok) { toast(r.msg || "인증번호가 맞지 않습니다"); return; } } setStep(3); }}>확인됐어요, 다음</button></div></>;
  else if (step === 3) body = <>
    <h2>가지고 계신 자격을 눌러주세요</h2><p className="muted">여러 개 골라도 됩니다. 없으면 &apos;아직 없어요&apos;.</p><Steps n={3} of={3} />
    <div className="stack">{LIC_OPTIONS.map(o => <Check key={o} on={lic.includes(o)} onClick={() => toggleLic(o)}>{o}</Check>)}</div>
    {verified && !consent && <Check on={consent} style={{ marginTop: 12 }} onClick={() => setConsent(c => !c)}><b>[필수]</b> 이름·휴대전화·자격을 {j.org}에 제공하는 데 동의 <Link href="/privacy" target="_blank" style={{ color: "var(--info)" }} onClick={e => e.stopPropagation()}>보기</Link></Check>}
    <div className="two" style={{ marginTop: 20 }}><button className="btn out" onClick={() => setStep(verified ? 1 : 2)}>이전</button><button className="btn pri pill" disabled={!lic.length || !consent || busy} onClick={submit}>{busy ? "보내는 중…" : "지원 완료"}</button></div></>;
  else body = <div className="done">
    <span className="ok"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg></span>
    {result === "demo" ? <><h2>지원 화면 체험이 끝났습니다</h2><p className="muted" style={{ marginTop: 8 }}>지금은 <b>시범 운영 중</b>이라 예시 공고이며, 시설에 전달되지 않았습니다.</p></>
      : result === "dup" ? <><h2>이미 지원한 공고예요</h2><p className="muted" style={{ marginTop: 8 }}><b>{j.org}</b>에 지원이 접수되어 있습니다. 시설 연락을 기다려 주세요.</p></>
      : <><h2>지원이 끝났습니다</h2><p className="muted" style={{ marginTop: 8 }}><b>{j.org}</b>에서 <b>{proxy && cphone ? cphone : phone}</b>로 보통 1~2일 안에 연락드립니다.</p></>}
    {joined && !demo && <div className="card" style={{ textAlign: "left", marginTop: 16, background: "var(--green-bg)", borderColor: "transparent" }}><b>회원가입도 함께 끝났습니다</b><p className="small">다음부터는 전화번호만 누르면 바로 지원돼요. 상단 이름을 누르면 내 지원 내역을 볼 수 있습니다.</p></div>}
    <Check on={openOffers} style={{ marginTop: 16, textAlign: "left" }} onClick={async () => { const v = !openOffers; setOpenOffers(v); patchUser({ open: v }); if (authMode() === "supabase") { try { await authFetch("/api/seeker", { method: "POST", body: JSON.stringify({ open: v }) }); } catch {} } }}>다른 시설에서도 연락받을게요 (선택)<br /><span className="cap">이름은 성만 남기고(김OO) 지역·자격·희망 직종만 인증된 시설에 보입니다. 연락처는 내가 수락해야 공개.</span></Check>
    <div className="two" style={{ marginTop: 20 }}><button className="btn out" onClick={close}>닫기</button><Link className="btn pri pill" href={`/jobs/${j.gu}/${j.job}`} onClick={close}>비슷한 공고 더 보기</Link></div>
  </div>;

  return <Modal onClose={close}>{body}</Modal>;
}
