"use client";

import { useState, useRef, useEffect } from "react";
import projectsData from "../../data/projects.json";
import ProjectCard from "./ProjectCard";

const INITIAL_COUNT = 9;
const LOAD_MORE_COUNT = 3;

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

/* ─── Main Grid Component ──────────────────────────────────── */
export default function ProjectGrid({ onLoadMoreRef }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const gridRef = useRef(null);
  const cardCountRef = useRef(INITIAL_COUNT);
  const prefersReduced = useReducedMotion();

  const allProjects = projectsData.projects || [];
  const visibleProjects = allProjects.slice(0, visibleCount);
  const hasMore = visibleCount < allProjects.length;

  /* ── Expose loadMore to parent (circular button) ──────────── */
  useEffect(() => {
    if (onLoadMoreRef) {
      onLoadMoreRef.current = () => {
        if (visibleCount < allProjects.length) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE_COUNT, allProjects.length)
          );
        }
      };
    }
  }, [onLoadMoreRef, visibleCount, allProjects.length]);

  /* ── Hide circular button when all projects are loaded ─────── */
  useEffect(() => {
    if (!hasMore) {
      const btn = document.querySelector(".portfolio-three-counter");
      if (btn) btn.style.display = "none";
    } else {
      const btn = document.querySelector(".portfolio-three-counter");
      if (btn) btn.style.display = "";
    }
  }, [hasMore]);

  /* ── GSAP: Initial scroll-reveal for first 9 cards ─────────── */
  useEffect(() => {
    if (prefersReduced || !gridRef.current) return;

    let ctx;
    let interval;

    const trySetup = () => {
      if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
        return false;
      }
      const gsap = window.gsap;

      const cards = gridRef.current.querySelectorAll("[data-ps-card]");
      if (!cards || cards.length === 0) return false;

      // Use gsap.context() so Strict Mode double-mount cleans up
      // the previous ScrollTrigger + tweens automatically.
      ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: {
              each: 0.07,
              from: "start",
            },
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }, gridRef.current);
      return true;
    };

    if (!trySetup()) {
      interval = setInterval(() => {
        if (trySetup()) clearInterval(interval);
      }, 200);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (ctx) ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced]);

  /* ── GSAP: Animate only newly added cards ──────────────────── */
  useEffect(() => {
    if (prefersReduced) return;
    const prevCount = cardCountRef.current;
    cardCountRef.current = visibleCount;

    // Only animate on load-more (not initial render)
    if (visibleCount <= INITIAL_COUNT || visibleCount <= prevCount) return;

    const tryAnimate = () => {
      if (typeof window.gsap === "undefined") return false;
      const gsap = window.gsap;
      const cards = gridRef.current?.querySelectorAll("[data-ps-card]");
      if (!cards || cards.length === 0) return false;

      const newCards = Array.from(cards).slice(prevCount);
      if (newCards.length === 0) return true;

      gsap.fromTo(
        newCards,
        { opacity: 0, y: 45, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "transform",
        }
      );
      return true;
    };

    if (!tryAnimate()) {
      const interval = setInterval(() => {
        if (tryAnimate()) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [visibleCount, prefersReduced]);

  return (
    <div ref={gridRef} className="ps-grid">
      {visibleProjects.map((project, idx) => (
        <ProjectCard key={project.id} project={project} index={idx} />
      ))}
    </div>
  );
}
