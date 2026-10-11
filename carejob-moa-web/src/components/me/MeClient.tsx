"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { Check } from "../providers";
import { MiniJob } from "../jobs";
import { fmtPhone } from "../ui";
import { getJob } from "@/lib/repo";
import { signOut } from "@/lib/auth/client";

export default function MeClient() {
  const { user, ready, open, applied, alert, patchUser, logout } = useAuth();
  const router = useRouter(); const leaving = useRef(false);
  useEffect(() => { if (ready && !user && !leaving.current) open({ type: "login", kind: "user", then: () => {} }); }, [ready, user, open]);
  if (!ready) return <div style={{ paddingBlock: 48 }} className="muted">불러오는 중…</div>;
  if (!user) return <div style={{ paddingBlock: 48 }} className="stack"><h1>내 정보</h1><p className="muted">전화번호로 로그인하면 지원 내역을 볼 수 있습니다.</p><button className="btn pri pill" style={{ alignSelf: "flex-start" }} onClick={() => open({ type: "login", kind: "user" })}>로그인</button></div>;
  const jobs = applied.map(getJob).filter(Boolean);
  return <>
    <div style={{ paddingBlock: 24 }} className="stack"><h1>내 정보</h1></div>
    <div className="grid g2">
      <div className="card stack"><h3>{user.name}님</h3><dl className="kv"><dt>전화번호</dt><dd>{fmtPhone(user.phone)} <span className="tag gr">인증됨</span></dd><dt>자격</dt><dd>{user.lic.length ? user.lic.join(" · ") : <>아직 없음 · <Link href="/start" style={{ color: "var(--info)" }}>자격 취득 경로 보기</Link></>}</dd><dt>케어닥 앱</dt><dd>{user.caredoc ? <><span className="tag bl">연결됨</span> 케어닥 근무 이력이 인증 경력으로 표시됩니다</> : "연결 안 됨 · 같은 번호로 케어닥 앱에 가입하면 자동 연결"}</dd></dl>
        <div className="hr" /><Check on={user.open} onClick={() => patchUser({ open: !user.open })}>다른 시설에서도 연락받을게요<br /><span className="cap">이름은 성만 남기고(김OO) 지역·자격·희망 시간만 시설에 보입니다. 연락처는 내가 수락해야 공개.</span></Check></div>
      <div className="card stack"><h3>내 지원 내역</h3>{!jobs.length && <p className="muted">아직 지원한 공고가 없어요.</p>}{jobs.map(j => <MiniJob key={j!.id} j={j!} left={<span className="tag or">지원함</span>} right={<span className="cap">연락 대기</span>} />)}
        <div className="hr" /><h3>새 공고 문자 알림</h3><p className="muted small">{alert ? `${alert} 조건으로 새 공고가 오면 문자로 알려드립니다.` : "탐색 화면에서 조건을 고르고 '새 공고 문자 받기'를 누르세요."}</p>
        <button className="btn out sm" style={{ alignSelf: "flex-start", marginTop: 8 }} onClick={async () => { leaving.current = true; await signOut(); logout(); router.push("/"); }}>로그아웃</button></div>
    </div>
  </>;
}
