import "./globals.css";
import { HERO_BG_URL } from "./_lift/heroBg";

export const metadata = {
  title: "MD Asif Shah Diner — MERN Stack & Shopify Developer",
  description:
    "MD Asif Shah Diner — MERN stack & Shopify developer in Dhaka. I build MERN stack websites, Next.js apps, and custom Shopify 2.0 themes and stores that convert.",
  keywords:
    "MD Asif Shah Diner, Asif, MERN Stack Developer, Shopify Developer, Shopify 2.0, Next.js, React, MongoDB, Node.js, Dhaka, Bangladesh",
  robots: "INDEX,FOLLOW",
  icons: {
    // favicon.png does not exist in /public (404 on every load) — use the
    // existing logo instead.
    icon: "/assets/images/logo/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Stylesheets in the exact original order, plus a small Next.js-only
// stylesheet that restores template behaviors lost inside the app's
// #site-root wrapper (sticky header + work-card zigzag). See file.
const stylesheets = [
  "/assets/css/bootstrap.min.css",
  "/assets/css/swiper-bundle.css",
  "/assets/css/magnific-popup.css",
  "/assets/css/aos.css",
  "/assets/css/main.css",
  "/assets/css/next-only.css",
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {stylesheets.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {/* Above-the-fold hero assets start downloading during HTML parse:
            the WebGL photo background (CORS mode so the texture can reuse
            the same cache) and the hero portrait (the LCP image). */}
        <link
          rel="preload"
          as="image"
          href={HERO_BG_URL}
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/images/shapes/banner-three-man.png"
          fetchPriority="high"
        />
      </head>
      <body
        className="tw-magic-cursor"
        // Browser extensions (e.g. ColorZilla's cz-shortcut-listen="true")
        // mutate <body> before React hydrates, which would otherwise log a
        // hydration mismatch warning. This suppresses the check for this
        // element's attributes only — children are unaffected.
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
