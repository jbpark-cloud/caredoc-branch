"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Slide } from "@/lib/ads";
import { LogoMark } from "../ui";

/** 첫 화면 큰 배너. 5초마다 넘어가고(정지 버튼 제공), 모바일에서는 손가락으로 밀어 넘긴다. '동작 줄이기' 설정이면 자동으로 넘기지 않는다 */
export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const idxRef = useRef(0); const busy = useRef(false);
  const n = slides.length;
  idxRef.current = idx;

  const go = useCallback((i: number) => {
    const el = track.current; if (!el || !n) return;
    const to = ((i % n) + n) % n;
    el.scrollTo({ left: el.clientWidth * to, behavior: "smooth" });
  }, [n]);

  useEffect(() => {
    const el = track.current; if (!el) return;
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setIdx(Math.min(n - 1, Math.max(0, Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))))); };
    el.addEventListener("scroll", on, { passive: true });
    return () => { el.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, [n]);

  useEffect(() => {
    if (paused || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => { if (!busy.current && !document.hidden) go(idxRef.current + 1); }, 5000);
    return () => clearInterval(t);
  }, [paused, go, n]);

  if (!n) return null;
  return (
    <section className="hc" aria-roledescription="carousel" aria-label="추천 배너"
      onMouseEnter={() => { busy.current = true; }} onMouseLeave={() => { busy.current = false; }}
      onFocusCapture={() => { busy.current = true; }} onBlurCapture={() => { busy.current = false; }}
      onTouchStart={() => { busy.current = true; }} onTouchEnd={() => { setTimeout(() => { busy.current = false; }, 4000); }}>
      <div className="hc-track" ref={track}>
        {slides.map((s, i) => (
          <Link prefetch={false} key={s.key} href={s.href} className={`hc-slide ${s.tone}${s.img ? "" : " noimg"}`} aria-roledescription="slide" aria-label={`${n}장 중 ${i + 1}번째. ${s.sample ? "예시 광고. " : ""}${s.org ? s.org + " " : ""}${s.title}`}>
            <span className="hc-text">
              <span className="hc-tag">{s.tag}{s.sample && <em>예시</em>}</span>
              {s.org && <span className="hc-org"><LogoMark name={s.org} size={30} />{s.org}</span>}
              <strong>{s.title}</strong>
              <span className="hc-sub">{s.sub}</span>
              <span className="hc-cta">{s.cta} <span aria-hidden="true">→</span></span>
            </span>
            {s.img && <span className="hc-img"><Image src={s.img} alt="" fill sizes="(max-width: 900px) 100vw, 480px" priority={i === 0} /></span>}
          </Link>
        ))}
      </div>
      {n > 1 && <div className="hc-ctrl">
        <button type="button" aria-label="이전 배너" onClick={() => go(idx - 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg></button>
        <span className="hc-count"><b>{idx + 1}</b> / {n}</span>
        <button type="button" aria-label="다음 배너" onClick={() => go(idx + 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg></button>
        <button type="button" aria-label={paused ? "배너 자동 넘김 다시 시작" : "배너 자동 넘김 멈춤"} aria-pressed={paused} onClick={() => setPaused(p => !p)}>
          {paused ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14" /></svg>}
        </button>
      </div>}
    </section>
  );
}
