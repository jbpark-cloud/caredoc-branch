"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Steps, useAuth, useToast } from "../providers";
import { Ico } from "../ui";
import { FACS } from "@/lib/constants";
import type { BizStatus } from "@/lib/types";

export default function BizJoinModal({ then, step: initStep }: { then?: () => void; step?: 1 | 2 }) {
  const { close, open, biz, setBiz, patchBiz } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(initStep ?? 1);
  const [f, setF] = useState({ org: biz?.org ?? "", fac: biz?.fac ?? "방문요양", name: biz?.name ?? "", phone: biz?.phone ?? "", email: biz?.email ?? "", pw: "" });
  const [verify, setVerify] = useState<"biz" | "ltc">("biz");
  const [bizno, setBizno] = useState("");
  const [ltc, setLtc] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(s => ({ ...s, [k]: e.target.value }));

  const finish = (status: BizStatus) => {
    if (initStep === 2 && biz) patchBiz({ status, bizno, ltc });
    else setBiz({ org: f.org, fac: f.fac, email: f.email || "kakao", status, name: f.name, phone: f.phone, bizno, ltc });
    close(); toast(status === "pending" ? "가입 완료 · 인증 검수 중" : status === "none" ? "가입 완료 · 인증은 기업 홈에서 언제든" : "인증 요청 완료");
    if (then) then(); else if (initStep !== 2) router.push("/biz");
  };

  return <Modal wide onClose={close}>
    {step === 1 ? <>
      <span className="tag sec">기업회원 가입 · 1분</span><h2 style={{ marginTop: 8 }}>시설 정보와 담당자</h2><p className="muted">공고 등록은 가입 즉시 가능합니다. 인증은 다음 단계에서.</p><Steps n={1} of={2} />
      <div className="form" style={{ gap: 12 }}>
        <div className="field full"><label>시설·병원 이름</label><input placeholder="예: 해피케어 방문요양센터" value={f.org} onChange={set("org")} autoFocus /></div>
        <div className="field"><label>시설 유형</label><select value={f.fac} onChange={set("fac")}>{FACS.map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>담당자 이름</label><input placeholder="홍길동" value={f.name} onChange={set("name")} /></div>
        <div className="field"><label>담당자 휴대전화</label><input inputMode="numeric" placeholder="010-0000-0000" value={f.phone} onChange={set("phone")} /></div>
        <div className="field"><label>이메일 (아이디)</label><input type="email" placeholder="manager@facility.kr" value={f.email} onChange={set("email")} /></div>
        <div className="field full"><label>비밀번호</label><input type="password" placeholder="8자 이상" value={f.pw} onChange={set("pw")} /></div>
      </div>
      <button className="btn sec pill wide" style={{ marginTop: 16 }} onClick={() => { if (!f.org || !f.name || f.phone.replace(/\D/g, "").length < 10 || !f.email.includes("@") || f.pw.length < 8) { toast("빈칸과 비밀번호(8자 이상)를 확인해 주세요"); return; } setStep(2); }}>가입하고 인증 단계로</button>
      <div className="or"><span>또는</span></div>
      <button className="btn kakao wide" onClick={() => { setF(s => ({ ...s, org: s.org || "우리요양원", name: s.name || "김담당", email: "kakao" })); setStep(2); }}><Ico.kakao />카카오로 빠르게 가입</button>
      <p className="cap" style={{ marginTop: 12 }}>가입 즉시 공고 작성이 가능하고, 인증이 끝나면 구직자에게 노출됩니다. 이미 회원이면 <a href="#" style={{ color: "var(--info)" }} onClick={e => { e.preventDefault(); open({ type: "login", kind: "biz", then }); }}>로그인</a></p>
    </> : <>
      <span className="tag sec">{initStep === 2 ? "시설 인증" : "가입 완료"}</span><h2 style={{ marginTop: 8 }}>시설 인증</h2><p className="muted">둘 중 하나만 입력하세요. 운영팀이 24시간 안에 확인합니다. 지금 건너뛰어도 됩니다.</p><Steps n={2} of={2} />
      <div className="cert" style={{ marginTop: 8 }}><button className={verify === "biz" ? "on" : ""} onClick={() => setVerify("biz")}>사업자등록번호</button><button className={verify === "ltc" ? "on" : ""} onClick={() => setVerify("ltc")}>장기요양기관 코드</button></div>
      {verify === "biz" ? <div className="field big" style={{ marginTop: 14 }}><label>사업자등록번호</label><input inputMode="numeric" placeholder="000-00-00000" value={bizno} onChange={e => setBizno(e.target.value)} autoFocus /><span className="help">국세청 조회로 대표자·상호 일치 여부를 확인합니다</span></div>
        : <div className="field big" style={{ marginTop: 14 }}><label>장기요양기관 코드 (기호)</label><input inputMode="numeric" placeholder="1-2345678900" value={ltc} onChange={e => setLtc(e.target.value)} autoFocus /><span className="help">건강보험공단 기관 정보와 평가등급이 자동으로 연결됩니다</span></div>}
      <div className="two" style={{ marginTop: 20 }}><button className="btn out" onClick={() => finish("none")}>나중에 할게요</button><button className="btn sec pill" onClick={() => { if (!(verify === "biz" ? bizno : ltc)) { toast("번호를 입력해 주세요"); return; } finish("pending"); }}>인증 요청</button></div>
    </>}
  </Modal>;
}
