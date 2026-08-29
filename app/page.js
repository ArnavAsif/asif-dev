import { bodyHtml } from "./_lift/bodyContent";
import LegacyScripts from "./_lift/LegacyScripts";
import HeroRipple from "./_lift/HeroRipple";
import ProjectGridMount from "./_lift/ProjectGridMount";

export default function Home() {
  return (
    <>
      {/* Original markup, unchanged, only asset paths normalized to
          root-relative (assets/... -> /assets/...) so they resolve
          correctly from Next.js's /public folder. */}
      <div
        id="site-root"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
      {/* Mounts the JSON-driven project grid into the existing
          #ps-mount placeholder inside the portfolio-three-area section. */}
      <ProjectGridMount />
      <LegacyScripts />
      {/* WebGL ripple distortion on the hero portrait only */}
      <HeroRipple />
    </>
  );
}
