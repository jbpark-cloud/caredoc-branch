"use client";
import { useState } from "react";
import { Modal, Check, useAuth, useToast } from "../providers";
import type { Talent } from "@/lib/types";

const MY_POSTS = ["요양보호사 · 오전 9~12시", "요양보호사 · 야간"];

export function OrderModal({ name, price }: { name: string; price: string }) {
  const { close } = useAuth(); const toast = useToast();
  const [sel, setSel] = useState<number[]>([0]);
  const tg = (i: number) => setSel(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  return <Modal onClose={close}>
    <h2>{name} 신청</h2><p className="muted">적용할 공고를 고르고 결제하세요. (결제 연동 전 · 주문만 기록)</p>
    <div className="stack" style={{ marginTop: 16 }}>{MY_POSTS.map((x, i) => <Check key={x} on={sel.includes(i)} onClick={() => tg(i)}>{x}</Check>)}</div>
    <div className="card" style={{ marginTop: 16, background: "var(--bg)" }}><div className="row" style={{ justifyContent: "space-between" }}><span>{name} × {sel.length}건</span><b>{price}{sel.length > 1 ? ` × ${sel.length}` : ""}</b></div><div className="row"><span className="muted small">부가세 별도 · 세금계산서 발행</span></div></div>
    <div className="two" style={{ marginTop: 20 }}><button className="btn out" onClick={close}>취소</button><button className="btn pri pill" disabled={!sel.length} onClick={async () => { try { await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: name, count: sel.length }) }); } catch {} close(); toast(`${name} ${sel.length}건 주문이 접수되었습니다`); }}>결제하기</button></div>
  </Modal>;
}

export function TalentModal({ talent: t }: { talent: Talent }) {
  const { close } = useAuth(); const toast = useToast();
  const [sel, setSel] = useState<number[]>([0]);
  const tg = (i: number) => setSel(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  return <Modal onClose={close}>
    <div className="row" style={{ marginBottom: 6 }}>{t.caredoc && <span className="tag bl">케어닥 근무 인증</span>}{t.noLic && <span className="tag gr">자격 취득 예정</span>}<span className="tag gy">{t.last === 0 ? "오늘 활동" : `${t.last}일 전 활동`}</span></div>
    <h2>{t.name} <span className="muted" style={{ fontSize: 18, fontWeight: 500 }}>{t.age}세 {t.sex} · {t.gu} {t.dong}</span></h2>
    <dl className="kv" style={{ marginTop: 14 }}><dt>희망 직종</dt><dd>{t.job}</dd><dt>자격</dt><dd>{t.lic.join(" · ")}</dd><dt>경력</dt><dd>{t.yrs ? `${t.yrs}년` : "신입"}{t.care && <> · <b style={{ color: "var(--info)" }}>{t.care}</b></>}</dd><dt>가능 시간</dt><dd>{t.sched} · {t.days}</dd><dt>이동</dt><dd>{t.move}</dd><dt>희망 급여</dt><dd>{t.pay}</dd><dt>한마디</dt><dd>{t.memo}</dd><dt>연락처</dt><dd><span className="muted">010-****-**** · 수락 후 공개</span></dd></dl>
    <div className="card" style={{ marginTop: 16, background: "var(--bg)" }}><b>제안할 공고</b><div className="stack" style={{ marginTop: 8 }}>{MY_POSTS.map((x, i) => <Check key={x} on={sel.includes(i)} onClick={() => tg(i)}>{x}</Check>)}</div><p className="cap" style={{ marginTop: 8 }}>구직자에게 카카오톡으로 공고와 시설 정보(평가등급·급여·거리)가 전달됩니다. 수락률 평균 38%(가안).</p></div>
    <div className="row" style={{ justifyContent: "space-between", marginTop: 16 }}><span>제안 {sel.length}건 <b>{(sel.length * 5000).toLocaleString()}원</b> <span className="cap">미수락 시 환불</span></span></div>
    <div className="two" style={{ marginTop: 12 }}><button className="btn out" onClick={close}>닫기</button><button className="btn sec pill" disabled={!sel.length} onClick={async () => { try { await fetch("/api/proposals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ talentId: t.id, count: sel.length }) }); } catch {} close(); toast(`${t.name}님께 제안을 보냈습니다`); }}>제안 보내기</button></div>
  </Modal>;
}
