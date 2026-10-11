"use client";
import { useEffect, useState } from "react";
import { Modal, Check, useAuth, useToast } from "../providers";
import type { Talent } from "@/lib/types";
import { authFetch, authMode } from "@/lib/auth/client";

const SAMPLE_POSTS = ["요양보호사 · 오전 9~12시", "요양보호사 · 야간"];
/** 실서비스: 우리 시설 노출 중 공고 / 시범 모드: 예시 */
function useMyPosts() {
  const { demo, biz } = useAuth();
  const real = authMode() === "supabase" && !demo && !!biz;
  const [posts, setPosts] = useState<string[] | null>(real ? null : SAMPLE_POSTS);
  useEffect(() => { if (!real) return; authFetch("/api/biz/jobs").then(r => r.json()).then(j => setPosts((j.jobs || []).filter((x: { closed_at: string | null }) => !x.closed_at).map((x: { id: number; title: string | null; job: string; hours: string | null }) => `#${x.id} ${x.title || x.job}${x.hours ? " · " + x.hours.split(" · ")[0] : ""}`))).catch(() => setPosts([])); }, [real]);
  return posts;
}
function PostPicker({ posts, sel, tg }: { posts: string[] | null; sel: number[]; tg: (i: number) => void }) {
  if (posts === null) return <p className="muted small">공고를 불러오는 중…</p>;
  if (!posts.length) return <p className="muted small">진행 중인 공고가 없습니다. 먼저 공고를 등록해 주세요.</p>;
  return <>{posts.map((x, i) => <Check key={x} on={sel.includes(i)} onClick={() => tg(i)}>{x}</Check>)}</>;
}

export function OrderModal({ name, price }: { name: string; price: string }) {
  const { close } = useAuth(); const toast = useToast();
  const [sel, setSel] = useState<number[]>([0]);
  const tg = (i: number) => setSel(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  const posts = useMyPosts(); const n = posts ? sel.filter(i => i < posts.length).length : 0;
  return <Modal onClose={close}>
    <h2>{name} 신청</h2><p className="muted">적용할 공고를 고르고 신청하세요. 담당자가 확인 전화를 드린 뒤 계좌이체·세금계산서로 진행합니다.</p>
    <div className="stack" style={{ marginTop: 16 }}><PostPicker posts={posts} sel={sel} tg={tg} /></div>
    <div className="card" style={{ marginTop: 16, background: "var(--bg)" }}><div className="row" style={{ justifyContent: "space-between" }}><span>{name} × {n}건</span><b>{price}{n > 1 ? ` × ${n}` : ""}</b></div><div className="row"><span className="muted small">부가세 별도 · 세금계산서 발행</span></div></div>
    <div className="two" style={{ marginTop: 20 }}><button className="btn out" onClick={close}>취소</button><button className="btn pri pill" disabled={!n} onClick={async () => { let ok = false; try { const r = await authFetch("/api/orders", { method: "POST", body: JSON.stringify({ product: name, count: n, jobs: sel.filter(i => posts && i < posts.length).map(i => posts![i]) }) }); ok = r.ok; } catch {} close(); toast(ok ? `${name} ${n}건 신청이 접수되었습니다. 담당자가 연락드립니다` : "신청하지 못했습니다. 잠시 후 다시 시도해 주세요"); }}>신청 접수</button></div>
  </Modal>;
}

export function TalentModal({ talent: t }: { talent: Talent }) {
  const { close } = useAuth(); const toast = useToast();
  const [sel, setSel] = useState<number[]>([0]);
  const tg = (i: number) => setSel(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  const posts = useMyPosts(); const n = posts ? sel.filter(i => i < posts.length).length : 0;
  return <Modal onClose={close}>
    <div className="row" style={{ marginBottom: 6 }}>{t.caredoc && <span className="tag bl">케어닥 근무 인증</span>}{t.noLic && <span className="tag gr">자격 취득 예정</span>}<span className="tag gy">{t.last === 0 ? "오늘 활동" : `${t.last}일 전 활동`}</span></div>
    <h2>{t.name} <span className="muted" style={{ fontSize: 18, fontWeight: 500 }}>{t.age ? `${t.age}세 ${t.sex} · ` : ""}{t.gu} {t.dong}</span></h2>
    <dl className="kv" style={{ marginTop: 14 }}><dt>희망 직종</dt><dd>{t.job}</dd><dt>자격</dt><dd>{t.lic.join(" · ")}</dd><dt>경력</dt><dd>{t.yrs ? `${t.yrs}년` : "신입"}{t.care && <> · <b style={{ color: "var(--info)" }}>{t.care}</b></>}</dd><dt>가능 시간</dt><dd>{t.sched} · {t.days}</dd><dt>이동</dt><dd>{t.move}</dd><dt>희망 급여</dt><dd>{t.pay}</dd><dt>한마디</dt><dd>{t.memo}</dd><dt>연락처</dt><dd><span className="muted">010-****-**** · 수락 후 공개</span></dd></dl>
    <div className="card" style={{ marginTop: 16, background: "var(--bg)" }}><b>제안할 공고</b><div className="stack" style={{ marginTop: 8 }}><PostPicker posts={posts} sel={sel} tg={tg} /></div><p className="cap" style={{ marginTop: 8 }}>구직자에게 공고와 시설 정보(평가등급·급여)가 문자로 전달됩니다. 수락하면 연락처가 열리고, 미수락 건은 청구하지 않습니다.</p></div>
    <div className="row" style={{ justifyContent: "space-between", marginTop: 16 }}><span>제안 {n}건 <b>{(n * 5000).toLocaleString()}원</b> <span className="cap">미수락 시 환불</span></span></div>
    <div className="two" style={{ marginTop: 12 }}><button className="btn out" onClick={close}>닫기</button><button className="btn sec pill" disabled={!n} onClick={async () => { let ok = false; try { const r = await authFetch("/api/proposals", { method: "POST", body: JSON.stringify({ talentId: t.id, uid: t.uid, count: n }) }); ok = r.ok; } catch {} close(); toast(ok ? `${t.name}님께 보낼 제안이 접수되었습니다` : "접수하지 못했습니다"); }}>제안 신청</button></div>
  </Modal>;
}
