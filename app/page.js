import { bodyHtml } from "./_lift/bodyContent";
import LegacyScripts from "./_lift/LegacyScripts";
import HeroRipple from "./_lift/HeroRipple";

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
      <LegacyScripts />
      {/* WebGL ripple distortion on the hero portrait only */}
      <HeroRipple />
    </>
  );
}
