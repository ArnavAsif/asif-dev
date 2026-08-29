"use client";

import { useEffect } from "react";

// Exact same order as the original index.html's closing <script> tags.
const SCRIPTS = [
  "/assets/js/jquery-3.7.1.min.js",
  "/assets/js/phosphor-icon.js",
  "/assets/js/boostrap.bundle.min.js",
  "/assets/js/aos.js",
  "/assets/js/magnific-popup.min.js",
  "/assets/js/jquery.marquee.min.js",
  "/assets/js/purecounter.js",
  "/assets/js/swiper-bundle.min.js",
  "/assets/js/gsap/gsap.js",
  "/assets/js/gsap/gsap-scroll-to-plugin.js",
  "/assets/js/gsap/gsap-scroll-smoother.js",
  "/assets/js/gsap/gsap-scroll-trigger.js",
  "/assets/js/gsap/gsap-split-text.js",
  "/assets/js/gsap/chroma.min.js",
  "/assets/js/slider-active.js",
  "/assets/js/custom-gsap.js",
  "/assets/js/main.js",
  "/assets/js/tw-cursor.js",
];

// These libraries are plain global-scope scripts (jQuery plugins, GSAP
// plugins, custom init code) that depend on loading and *executing* in
// this exact order — e.g. boostrap.bundle.js needs window.$ from jQuery
// already defined, custom-gsap.js needs GSAP + its plugins already
// registered, tw-cursor.js needs main.js's DOM setup already done, etc.
//
// A dynamically-created <script> defaults to async=true (order NOT
// guaranteed). Setting async=false on each one restores the classic,
// in-order, blocking behavior of the original static <script src> tags
// that sat right before </body>.
export default function LegacyScripts() {
  // ---------------------------------------------------------------
  // Force scroll to top on every (re)load.
  // ---------------------------------------------------------------
  // Browsers with "auto" scrollRestoration remember the last scroll
  // position and restore it after a hard refresh — the user sees the
  // Footer for a split second before ScrollSmoother jumps to the Hero.
  // Setting "manual" and calling scrollTo(0) before any legacy scripts
  // load keeps the page clean.
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    // Scroll immediately so the first paint is already at the top.
    window.scrollTo(0, 0);
    // Also override the back/forward cache in case the browser still
    // tries to restore a position from the session history.
    const onPopState = () => window.scrollTo(0, 0);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const created = [];
    let loadedCount = 0;

    // main.js and custom-gsap.js each do:
    //   document.addEventListener("DOMContentLoaded", () => { ... })
    // expecting to run once, right after the page's HTML is parsed —
    // that's how the preloader-hide animation in main.js is wired up.
    //
    // But because these scripts are injected client-side *after* Next.js
    // has already mounted the page, the browser's real DOMContentLoaded
    // event fired long before these listeners were ever attached, so it
    // never reaches them. Result: the preloader-hide animation never
    // runs, and the "Loading" screen stays up forever.
    //
    // Once every legacy script below has finished loading (and therefore
    // registered its listeners), we re-dispatch a synthetic
    // DOMContentLoaded event so that startup code fires as intended.
    const dispatchSyntheticDomReady = () => {
      document.dispatchEvent(
        new Event("DOMContentLoaded", { bubbles: true, cancelable: true })
      );
    };

    SCRIPTS.forEach((src) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = () => {
        loadedCount += 1;
        if (loadedCount === SCRIPTS.length) {
          dispatchSyntheticDomReady();
        }
      };
      document.body.appendChild(script);
      created.push(script);
    });

    return () => {
      created.forEach((script) => script.remove());
    };
    // Runs once on mount — the script list is static for this build.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ---------------------------------------------------------------
    // Nav links -> homepage (no more black 404 screens)
    // ---------------------------------------------------------------
    // The template's menu links point at other pages (about.html,
    // service.html, contact.html, ...). None of those pages exist in
    // this Next.js project, so a normal click navigates the browser
    // to a Next.js "not found" page that renders with a black
    // background — the "whole site becomes black" symptom. Intercept
    // those clicks and take the user to the homepage instead, which
    // is the closest equivalent the single-page app can offer.
    const onClick = (e) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      // Placeholder "#" links (hero CTA, work/service cards...) must not
      // navigate: with the template's CSS they smooth-scroll the document
      // back to the top — the random "jump to Hero" bug.
      if (href === "#" || href === "" || href === "##") {
        e.preventDefault();
        return;
      }
      // Leave external / protocol links (mailto:, tel:, http(s)://) alone.
      if (/^(https?:|mailto:|tel:|javascript:|\/\/)/i.test(href)) return;
      // Only *.html targets 404 in this app — redirect those to home.
      if (/\.html$/i.test(href)) {
        e.preventDefault();
        window.location.href = "/";
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ---------------------------------------------------------------
    // Full-height wrapper so the template's sticky header works
    // ---------------------------------------------------------------
    // In the original index.html the header's parent is <body>, which
    // ScrollSmoother keeps at the full document height (it pins
    // #smooth-wrapper to the viewport), so the header's
    // "position: sticky" can travel the whole page. Here the header's
    // parent is #site-root, which collapses to zero height once
    // ScrollSmoother fixes the wrapper — a zero-height parent is why
    // the sticky header never stuck. Mirror the template by giving
    // #site-root the same height as the document content.
    const root = document.getElementById("site-root");
    const content = document.getElementById("smooth-content");
    if (!root) return;

    let lastMeasuredHeight = 0;
    let refreshTimer;
    let lastScrollTime = 0;
    let isRefreshing = false;
    const onScrollMarker = () => {
      lastScrollTime = Date.now();
    };
    window.addEventListener("scroll", onScrollMarker, { passive: true });

    // ---------------------------------------------------------------
    // Bottom-of-page guard
    // ---------------------------------------------------------------
    // The original jump happens because ScrollTrigger.refresh()
    // recalculates every trigger/pin position; at the bottom boundary
    // even a 1-px content-height change can make the browser/GSAP
    // think the current scrollY is invalid and shove the viewport.
    // We detect the bottom boundary and skip the refresh there.
    const isNearBottom = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 && window.scrollY >= max - 3;
    };

    const refreshWhenQuiet = () => {
      if (Date.now() - lastScrollTime < 350) {
        refreshTimer = window.setTimeout(refreshWhenQuiet, 350);
        return;
      }
      if (isRefreshing || !window.ScrollTrigger) return;
      // At the bottom boundary, a refresh would fight the browser's
      // max-scroll position and cause the oscillating jump.
      if (isNearBottom()) return;
      isRefreshing = true;
      // ScrollTrigger.refresh() recalculates every pin / trigger
      // position.  When those positions shift, GSAP may adjust the
      // scroll position to stay consistent — the user sees a random
      // jump.  Save the scroll position before the refresh and
      // restore it immediately after so the user stays put.
      const savedScrollY = window.scrollY;
      window.ScrollTrigger.refresh();
      window.scrollTo(0, savedScrollY);
      isRefreshing = false;
    };

    const sync = () => {
      const target = content
        ? content.scrollHeight
        : document.body.scrollHeight;
      if (
        target > 0 &&
        Math.abs(root.getBoundingClientRect().height - target) > 1
      ) {
        root.style.height = `${target}px`;
      }
      if (target > 0 && Math.abs(target - lastMeasuredHeight) > 1) {
        const needsRefresh = lastMeasuredHeight > 0;
        lastMeasuredHeight = target;
        if (needsRefresh && window.ScrollTrigger) {
          window.clearTimeout(refreshTimer);
          refreshTimer = window.setTimeout(refreshWhenQuiet, 400);
        }
      }
    };
    sync();
    window.addEventListener("resize", sync);
    let ro;
    if (content && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        // Height still updates (so #site-root stays correct), but we
        // only schedule a refresh when NOT at the bottom boundary.
        const target = content
          ? content.scrollHeight
          : document.body.scrollHeight;
        if (
          target > 0 &&
          Math.abs(root.getBoundingClientRect().height - target) > 1
        ) {
          root.style.height = `${target}px`;
        }
        if (
          target > 0 &&
          Math.abs(target - lastMeasuredHeight) > 1
        ) {
          const needsRefresh = lastMeasuredHeight > 0;
          lastMeasuredHeight = target;
          if (needsRefresh && window.ScrollTrigger && !isNearBottom()) {
            window.clearTimeout(refreshTimer);
            refreshTimer = window.setTimeout(refreshWhenQuiet, 400);
          }
        }
      });
      ro.observe(content);
    }
    // Re-run once the legacy scripts, fonts and images have settled.
    const settle = window.setTimeout(sync, 1500);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", onScrollMarker);
      window.clearTimeout(settle);
      window.clearTimeout(refreshTimer);
      if (ro) ro.disconnect();
      root.style.height = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
