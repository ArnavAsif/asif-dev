// The Hero's WebGL canvas renders this remote photo as its full-bleed
// background (distorted by cursor ripples; the portrait sits on top).
// Defined once so the HTML <link rel="preload"> and the WebGL texture
// always reference the same URL. w=1920&q=80 keeps the fetch light while
// staying sharp at typical hero sizes — swap in any optimized CDN/AVIF
// URL here later without touching components.
export const HERO_BG_URL =
  "https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";