"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { SeekerUser, BizUser, Job, Talent } from "@/lib/types";

/* ---------- Toast ---------- */
const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

/* ---------- Modal ---------- */
export type ModalSpec =
  | { type: "login"; kind?: "user" | "biz"; then?: () => void }
  | { type: "bizjoin"; then?: () => void; step?: 1 | 2 }
  | { type: "apply"; job: Job }
  | { type: "order"; name: string; price: string }
  | { type: "talent"; talent: Talent };

/* ---------- Auth ---------- */
interface AuthState { user: SeekerUser | null; biz: BizUser | null; applied: number[]; alert: string | null; saved: number[] }
interface Ctx extends AuthState {
  ready: boolean;
  setUser: (u: SeekerUser | null) => void;
  setBiz: (b: BizUser | null) => void;
  patchUser: (p: Partial<SeekerUser>) => void;
  patchBiz: (p: Partial<BizUser>) => void;
  addApplied: (id: number) => void;
  toggleSaved: (id: number) => void;
  setAlert: (s: string | null) => void;
  logout: () => void;
  modal: ModalSpec | null;
  open: (m: ModalSpec) => void;
  close: () => void;
  requireUser: (then: () => void) => void;
  requireBiz: (then: () => void) => void;
}
const AuthCtx = createContext<Ctx | null>(null);
export const useAuth = () => { const c = useContext(AuthCtx); if (!c) throw new Error("AuthProvider missing"); return c; };

const KEY = "cjm.state.v1";
const empty: AuthState = { user: null, biz: null, applied: [], alert: null, saved: [] };

export function Providers({ children }: { children: ReactNode }) {
  const [st, setSt] = useState<AuthState>(empty);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState<ModalSpec | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const seq = useRef(0);

  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setSt({ ...empty, ...JSON.parse(raw) }); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} } }, [st, ready]);

  const toast = useCallback((msg: string) => { const id = ++seq.current; setToasts(t => [...t, { id, msg }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2200); }, []);
  const open = useCallback((m: ModalSpec) => setModal(m), []);
  const close = useCallback(() => setModal(null), []);

  const ctx = useMemo<Ctx>(() => ({
    ...st, ready, modal, open, close,
    setUser: u => setSt(s => ({ ...s, user: u })),
    setBiz: b => setSt(s => ({ ...s, biz: b })),
    patchUser: p => setSt(s => s.user ? { ...s, user: { ...s.user, ...p } } : s),
    patchBiz: p => setSt(s => s.biz ? { ...s, biz: { ...s.biz, ...p } } : s),
    addApplied: id => setSt(s => s.applied.includes(id) ? s : { ...s, applied: [...s.applied, id] }),
    toggleSaved: id => setSt(s => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter(x => x !== id) : [...s.saved, id] })),
    setAlert: a => setSt(s => ({ ...s, alert: a })),
    logout: () => { setSt(s => ({ ...s, user: null, biz: null })); toast("로그아웃했습니다"); },
    requireUser: then => { if (st.user) then(); else setModal({ type: "login", kind: "user", then }); },
    requireBiz: then => { if (st.biz) then(); else setModal({ type: "bizjoin", then }); },
  }), [st, ready, modal, open, close, toast]);

  return (
    <ToastCtx.Provider value={toast}>
      <AuthCtx.Provider value={ctx}>
        {children}
        {toasts.map((t, i) => <div key={t.id} className="toast" style={{ bottom: 24 + i * 52 }}>{t.msg}</div>)}
      </AuthCtx.Provider>
    </ToastCtx.Provider>
  );
}

/** 공통 모달 껍데기 */
export function Modal({ children, wide, onClose }: { children: ReactNode; wide?: boolean; onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="ov" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="md" role="dialog" aria-modal="true" style={wide ? { maxWidth: 600 } : undefined}>{children}</div>
    </div>
  );
}
export function Steps({ n, of }: { n: number; of: number }) { return <div className="steps">{Array.from({ length: of }, (_, i) => <i key={i} className={n >= i + 1 ? "on" : ""} />)}</div>; }
export function Check({ on, onClick, children, style }: { on: boolean; onClick: () => void; children: ReactNode; style?: React.CSSProperties }) {
  return <div className={`check${on ? " on" : ""}`} onClick={onClick} role="checkbox" aria-checked={on} tabIndex={0} style={style} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}><span className="bx">{on ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg> : null}</span><span>{children}</span></div>;
}
