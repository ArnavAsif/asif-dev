"use client";

import { useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import ProjectGrid from "./ProjectGrid";

/**
 * ProjectGridMount
 *
 * Finds the #ps-mount placeholder inside the existing portfolio-three-area
 * section and renders the React-powered ProjectGrid into it using createRoot.
 *
 * Intercepts the circular "Discover Our Projects" button click to trigger
 * load-more instead of navigating away.
 */
export default function ProjectGridMount() {
  const rootRef = useRef(null);
  const loadMoreRef = useRef(null);

  const handleLoadMore = useCallback(() => {
    if (loadMoreRef.current) {
      loadMoreRef.current();
    }
  }, []);

  useEffect(() => {
    const mountPoint = document.getElementById("ps-mount");
    if (!mountPoint) return;

    // Create a React root inside the existing DOM placeholder
    const root = createRoot(mountPoint);
    rootRef.current = root;

    root.render(<ProjectGrid onLoadMoreRef={loadMoreRef} />);

    // ── Intercept the circular "Discover Our Projects" button ──
    const counter = document.querySelector(".portfolio-three-counter");
    const btn = counter?.querySelector("a");
    if (btn) {
      btn.addEventListener("click", onCircularClick, true);
    }

    function onCircularClick(e) {
      e.preventDefault();
      e.stopPropagation();
      handleLoadMore();
    }

    return () => {
      btn?.removeEventListener("click", onCircularClick, true);
      root.unmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // This component renders nothing itself
}
