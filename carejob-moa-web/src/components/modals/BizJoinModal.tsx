"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, Steps, Check, useAuth, useToast } from "../providers";
import { Ico } from "../ui";
import { FACS } from "@/lib/constants";
import { bizSignUp, bizKakao, authFetch, authMode, supabase } from "@/lib/auth/client";
import type { BizUser } from "@/lib/types";

export default function BizJoinModal({ then, step: initStep }: { then?: () => void; step?: 1 | 2 }) {
  const { close, open, biz, setBiz, patchBiz } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(initStep ?? 1);
  const [f, setF] = useState({ org: biz?.org ?? "", fac: biz?.fac ?? "방문요양", name: biz?.name ?? "", phone: biz?.phone ?? "", email: biz?.email ?? "", pw: "" });
  const [agree, setAgree] = useState(false);
  const [verify, setVerify] = useState<"biz" | "ltc">("biz");
  const [bizno, setBizno] = useState("");
  const [ltc, setLtc] = useState("");
  const [busy, setBusy] = useState(false);
  const [loggedInNoBiz, setLoggedInNoBiz] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(s => ({ ...s, [k]: e.target.value }));
  const real = authMode() === "supabase";

  // 카카오 등으로 이미 로그인했지만 기업 정보가 없는 경우: 비밀번호 없이 시설 정보만 받는다
  useEffect(() => { const c = supabase(); if (c && !biz) c.auth.getSession().then(({ data }) => { if (data.session) { setLoggedInNoBiz(true); setF(s => ({ ...s, email: data.session!.user.email || s.email })); } }); }, [biz]);

  const doneJoin = (b: BizUser) => { setBiz(b); setStep(2); };

  const submit1 = async () => {
    const needPw = !loggedInNoBiz;
    if (!f.org.trim() || !f.name.trim() || f.phone.replace(/\D/g, "").length < 10 || (needPw && (!f.email.includes("@") || f.pw.length < 8))) { toast("빈칸과 비밀번호(8자 이상)를 확인해 주세요"); return; }
    if (!agree) { toast("이용약관·개인정보처리방침에 동의해 주세요"); return; }
    setBusy(true);
    if (loggedInNoBiz) {
      const r = await authFetch("/api/biz/join", { method: "POST", body: JSON.stringify(f) }); const j = await r.json().catch(() => ({}));
      setBusy(false); if (!j.ok) { toast(j.msg || "가입하지 못했습니다"); return; } doneJoin(j.biz); return;
    }
    const r = await bizSignUp(f); setBusy(false);
    if (!r.ok) { toast(r.msg || "가입하지 못했습니다"); return; }
    if (r.needConfirm) { setStep(3); return; }
    doneJoin(r.biz!);
  };

  const finish = async (status: "none" | "pending") => {
    if (status === "pending") {
      if (real) {
        setBusy(true); const r = await authFetch("/api/biz/verify", { method: "POST", body: JSON.stringify({ bizno: verify === "biz" ? bizno : "", ltc: verify === "ltc" ? ltc : "" }) }); const j = await r.json().catch(() => ({})); setBusy(false);
        if (!j.ok) { toast(j.msg || "인증 요청을 보내지 못했습니다"); return; }
        setBiz(j.biz);
      } else patchBiz({ status: "pending", bizno, ltc });
    }
    close(); toast(status === "pending" ? "인증 요청 완료 · 운영팀이 24시간 안에 확인합니다" : "가입 완료 · 인증은 기업 홈에서 언제든");
    if (then) then(); else if (initStep !== 2) router.push("/biz");
  };

  return <Modal wide onClose={close}>
    {step === 1 ? <>
      <span className="tag sec">기업회원 가입 · 1분</span><h2 style={{ marginTop: 8 }}>시설 정보와 담당자</h2><p className="muted">공고 등록은 가입 즉시 가능합니다. 인증은 다음 단계에서.</p><Steps n={1} of={2} />
      <div className="form" style={{ gap: 12 }}>
        <div className="field full"><label>시설·병원 이름</label><input placeholder="예: 해피케어 방문요양센터" value={f.org} onChange={set("org")} autoFocus /></div>
        <div className="field"><label>시설 유형</label><select value={f.fac} onChange={set("fac")}>{FACS.map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>담당자 이름</label><input placeholder="홍길동" autoComplete="name" value={f.name} onChange={set("name")} /></div>
        <div className="field"><label>담당자 휴대전화</label><input inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" value={f.phone} onChange={set("phone")} /></div>
        {!loggedInNoBiz && <><div className="field"><label>이메일 (아이디)</label><input type="email" autoComplete="email" placeholder="manager@facility.kr" value={f.email} onChange={set("email")} /></div>
        <div className="field full"><label>비밀번호</label><input type="password" autoComplete="new-password" placeholder="8자 이상" value={f.pw} onChange={set("pw")} /></div></>}
        <div className="full"><Check on={agree} onClick={() => setAgree(a => !a)}><b>[필수]</b> <Link href="/terms" target="_blank" style={{ color: "var(--info)" }} onClick={e => e.stopPropagation()}>이용약관</Link>·<Link href="/privacy" target="_blank" style={{ color: "var(--info)" }} onClick={e => e.stopPropagation()}>개인정보처리방침</Link>에 동의합니다<br /><span className="cap">지원자 개인정보는 채용 목적으로만 쓰고, 채용 종료 후 지체 없이 파기합니다.</span></Check></div>
      </div>
      <button className="btn sec pill wide" style={{ marginTop: 16 }} disabled={busy} onClick={submit1}>{busy ? "처리 중…" : "가입하고 인증 단계로"}</button>
      {!loggedInNoBiz && <><div className="or"><span>또는</span></div>
      <button className="btn kakao wide" disabled={busy} onClick={async () => { if (real) { const r = await bizKakao(); if (!r.ok) toast(r.msg || "카카오 로그인 실패"); return; } if (!agree) { toast("이용약관·개인정보처리방침에 동의해 주세요"); return; } doneJoin({ org: f.org || "우리요양원", fac: f.fac, email: "kakao", status: "none", name: f.name || "김담당", phone: f.phone }); }}><Ico.kakao />카카오로 빠르게 가입</button>
      <p className="cap" style={{ marginTop: 12 }}>가입 즉시 공고 작성이 가능하고, 인증이 끝나면 구직자에게 노출됩니다. 이미 회원이면 <a href="#" style={{ color: "var(--info)" }} onClick={e => { e.preventDefault(); open({ type: "login", kind: "biz", then }); }}>로그인</a></p></>}
    </> : step === 2 ? <>
      <span className="tag sec">{initStep === 2 ? "시설 인증" : "가입 완료"}</span><h2 style={{ marginTop: 8 }}>시설 인증</h2><p className="muted">둘 중 하나만 입력하세요. 운영팀이 24시간 안에 확인합니다. 지금 건너뛰어도 됩니다.</p><Steps n={2} of={2} />
      <div className="cert" style={{ marginTop: 8 }}><button className={verify === "biz" ? "on" : ""} onClick={() => setVerify("biz")}>사업자등록번호</button><button className={verify === "ltc" ? "on" : ""} onClick={() => setVerify("ltc")}>장기요양기관 코드</button></div>
      {verify === "biz" ? <div className="field big" style={{ marginTop: 14 }}><label>사업자등록번호</label><input inputMode="numeric" placeholder="000-00-00000" value={bizno} onChange={e => setBizno(e.target.value)} autoFocus /><span className="help">운영팀이 국세청 사업자 상태와 상호를 확인합니다</span></div>
        : <div className="field big" style={{ marginTop: 14 }}><label>장기요양기관 코드 (기호)</label><input inputMode="numeric" placeholder="1-2345678900" value={ltc} onChange={e => setLtc(e.target.value)} autoFocus /><span className="help">건강보험공단 기관 정보와 평가등급을 확인해 공고에 표시합니다</span></div>}
      <div className="two" style={{ marginTop: 20 }}><button className="btn out" disabled={busy} onClick={() => finish("none")}>나중에 할게요</button><button className="btn sec pill" disabled={busy} onClick={() => { const v = verify === "biz" ? bizno.replace(/\D/g, "") : ltc.replace(/\D/g, ""); if (verify === "biz" ? v.length !== 10 : v.length < 8) { toast(verify === "biz" ? "사업자등록번호 10자리를 확인해 주세요" : "기관 코드를 확인해 주세요"); return; } finish("pending"); }}>인증 요청</button></div>
    </> : <>
      <span className="tag sec">이메일 확인</span><h2 style={{ marginTop: 8 }}>메일함을 확인해 주세요</h2>
      <p className="muted" style={{ marginTop: 8 }}><b>{f.email}</b>로 확인 링크를 보냈습니다. 링크를 누르면 가입이 끝나고 기업 홈으로 돌아옵니다. 시설 인증은 그다음에 진행하시면 됩니다.</p>
      <button className="btn out wide" style={{ marginTop: 20 }} onClick={close}>확인</button>
    </>}
  </Modal>;
}
