export const metadata = {
  title: "Shan - Digital Agency & Creative Portfolio",
  description:
    "Shan - Personal Portfolio and Digital Designer. Fully responsive, creative design, and easy to customize.",
  keywords:
    "Shan, Personal Portfolio, Digital Designer, Developer, Creative Agency, Responsive",
  robots: "INDEX,FOLLOW",
  icons: {
    icon: "/assets/images/logo/favicon.png",
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
      </head>
      <body className="tw-magic-cursor">{children}</body>
    </html>
  );
}
