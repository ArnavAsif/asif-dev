"use client";

import { useRef, useEffect, useState, useCallback } from "react";

/* ─── Reduced-motion hook ──────────────────────────────────── */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ─── Single Project Card ──────────────────────────────────── */
export default function ProjectCard({ project, index }) {
  const cardRef = useRef(null);
  const mediaInnerRef = useRef(null);
  const videoRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const videoPlayingRef = useRef(false);
  const rafRef = useRef(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const media = project.media || {};
  const isVideo = media.type === "video" && media.src;
  const hasPoster = media.poster && media.poster.length > 0;
  const imgSrc = !isVideo ? media.src : hasPoster ? media.poster : media.src;

  const variant = project.variant || "standard";
  const paddedIndex = String((index || 0) + 1).padStart(2, "0");

  /* ── Hover parallax on media (desktop) ────────────────────── */
  useEffect(() => {
    if (prefersReduced) return;
    const card = cardRef.current;
    const inner = mediaInnerRef.current;
    if (!card || !inner) return;

    let hovering = false;
    let loopRunning = false;
    let settleTimer = null;
    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      const tx = targetRef.current.x;
      const ty = targetRef.current.y;
      currentRef.current.x = lerp(currentRef.current.x, tx, 0.1);
      currentRef.current.y = lerp(currentRef.current.y, ty, 0.1);
      inner.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px) scale(1.05)`;
      // Keep running while hovered, or while still visibly offset from target
      const dx = Math.abs(currentRef.current.x - tx);
      const dy = Math.abs(currentRef.current.y - ty);
      if (hovering || dx > 0.05 || dy > 0.05) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        loopRunning = false;
        inner.style.transform = "";
      }
    };

    const startLoop = () => {
      if (!loopRunning) {
        loopRunning = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetRef.current.x = ((e.clientX - cx) / (rect.width / 2)) * 6;
      targetRef.current.y = ((e.clientY - cy) / (rect.height / 2)) * 4;
    };

    const onEnter = () => {
      hovering = true;
      window.clearTimeout(settleTimer);
      startLoop();
    };

    const onLeave = () => {
      hovering = false;
      targetRef.current.x = 0;
      targetRef.current.y = 0;
      // Loop keeps running via tick() until values settle near zero
    };

    card.addEventListener("mouseenter", onEnter, { passive: true });
    card.addEventListener("mousemove", onMove, { passive: true });
    card.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
      window.clearTimeout(settleTimer);
      cancelAnimationFrame(rafRef.current);
      inner.style.transform = "";
    };
  }, [prefersReduced]);

  /* ── Video: play on hover (desktop), viewport (mobile) ───── */
  const onEnter = useCallback(() => {
    if (videoRef.current && !videoPlayingRef.current) {
      videoPlayingRef.current = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const onLeave = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoPlayingRef.current = false;
    }
  }, []);

  /* ── Variant-specific class ───────────────────────────────── */
  const variantClass = variant === "featured"
    ? "ps-card--featured"
    : variant === "parallax"
    ? "ps-card--parallax"
    : variant === "editorial"
    ? "ps-card--editorial"
    : "";

  return (
    <article
      ref={cardRef}
      className={`ps-card ${variantClass}`}
      data-ps-card
      data-variant={variant}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* ── Media Area ──────────────────────────────────────── */}
      <div className="ps-card-media">
        <div className="ps-card-media-inner" ref={mediaInnerRef}>
          {imgSrc && (
            <img
              src={imgSrc}
              alt={project.title || "Project screenshot"}
              loading="lazy"
              decoding="async"
              className="ps-card-img"
            />
          )}
          {isVideo && (
            <video
              ref={videoRef}
              className="ps-card-video"
              muted
              loop
              playsInline
              preload="none"
              poster={hasPoster ? media.poster : undefined}
            >
              <source src={media.src} />
            </video>
          )}
        </div>

        {/* ── Year Badge ─────────────────────────────────────── */}
        {project.year && (
          <span className="ps-card-year">{project.year}</span>
        )}

        {/* ── Index Number ───────────────────────────────────── */}
        <span className="ps-card-index">{paddedIndex}</span>

        {/* ── Hover Overlay with links ───────────────────────── */}
        <div className="ps-card-overlay">
          {project.link && project.link !== "#" && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="ps-card-link-btn"
              aria-label={`Open ${project.title}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="ps-card-link-btn ps-card-link-btn--gh"
              aria-label={`GitHub for ${project.title}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          )}
        </div>

        {/* ── Bottom gradient fade ───────────────────────────── */}
        <div className="ps-card-media-gradient" />
      </div>

      {/* ── Info Area ────────────────────────────────────────── */}
      <div className="ps-card-info">
        <div className="ps-card-info-top">
          <span className="ps-card-category">{project.category}</span>
        </div>
        <h3 className="ps-card-title">{project.title}</h3>
        {project.description && (
          <p className="ps-card-desc">{project.description}</p>
        )}
        {project.technologies && project.technologies.length > 0 && (
          <div className="ps-card-tags">
            {project.technologies.map((tech) => (
              <span key={tech} className="ps-card-tag">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
