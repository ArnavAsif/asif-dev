"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";

// ogl/WebGL stays out of the initial JS bundle: the ripple component is
// browser-only and loads right after hydration, long before the user can
// move a cursor over the hero. Visual behavior is unchanged.
const RippleDistortion = dynamic(() => import("./RippleDistortion"), {
  ssr: false,
});

// The page body is injected as raw HTML (bodyContent.js), so the hero
// mount point (#hero-ripple-mount inside .banner-three-area) can't hold
// a React child directly. This component portals the WebGL canvas into
// that div, adding a cursor-ripple effect over the whole hero section.
//
// No `src` is passed, so RippleDistortion runs in its image-less mode:
// the canvas stays fully transparent and only draws glowing ripple
// rings that follow the cursor — the hero img/background is untouched.
export default function HeroRipple() {
  const [mount, setMount] = useState(null);

  useEffect(() => {
    // The mount point lives in raw HTML injected via dangerouslySetInnerHTML,
    // so it can only be looked up after mount — this is a legitimate
    // "sync with an external system" effect, hence the disable below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMount(document.getElementById("hero-ripple-mount"));
  }, []);

  if (!mount) return null;

  return createPortal(
    <RippleDistortion
      brushSize={130}
      spread={6}
      fade={2.5}
      spacing={18}
      rings={4}
      tint="#F4F2EE"
      tintAmount={0.3}
      highlightColor="#F4F2EE"
      grayscale={false}
      trigger="both"
      clickStrength={2}
      quality="medium"
      className="ripple-distortion--no-image"
    />,
    mount
  );
}