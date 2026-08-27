# Shan Portfolio — Next.js

The original static Shan portfolio, lifted into a Next.js (App Router) project with zero visual, structural, or animation changes.

## What changed (technical only, nothing visual)
- The exact index.html body markup is preserved and rendered as-is.
- All CSS (bootstrap, swiper, magnific-popup, aos, main.css) loads in the same original order via link tags in app/layout.js.
- All JS libraries (jQuery, GSAP + plugins, Swiper, AOS, Magnific Popup, PureCounter, marquee, custom scripts) load in the exact same original order via app/_lift/LegacyScripts.js, which sequentially injects them the same way the original script tags at the bottom of body did.
- Asset paths (assets/...) were normalized to root-relative (/assets/...) so they resolve correctly from Next's /public folder — a required technical tweak, not a visual change.
- React Strict Mode is disabled in next.config.mjs since the legacy scripts weren't written to run twice (Strict Mode double-invokes effects in dev).

## Run it
npm install
npm run dev      (http://localhost:3000)

or

npm run build && npm start

## Note
The original index.html referenced assets/images/logo/favicon.png, but that file was never actually included in the source project (pre-existing issue, not introduced by this conversion) — the favicon request will 404 until that image is added.
