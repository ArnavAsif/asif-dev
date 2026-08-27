/** @type {import('next').NextConfig} */
const nextConfig = {
  // The legacy jQuery/GSAP scripts in /public/assets/js mutate the DOM
  // directly and were never written to run twice. React StrictMode's
  // double-invoked effects (dev only) would double-init them, so it's
  // switched off to keep behavior identical to the original static site.
  reactStrictMode: false,
};

export default nextConfig;
