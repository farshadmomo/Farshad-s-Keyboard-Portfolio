"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Scroll, ScrollControls, useScroll } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { SharedKeyboard, MobileKeyboard } from "@/components/three/shared-keyboard";
import { Intro } from "@/components/sections/intro";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";
import { Experience } from "@/components/sections/experience";
import { Certificates } from "@/components/sections/certificates";
import { Contact } from "@/components/sections/contact";
import {
  MobileHero,
  MobileSkills,
  MobileWork,
  MobileExperience,
  MobileCertificates,
  MobileContact,
} from "@/components/mobile-experience";
import { GLOW_SKILLS } from "@/lib/skills-data";
import { useDeviceTier } from "@/lib/use-device-tier";
import { registerNavScroll } from "@/lib/nav-scroll";

// Section → normalized scroll offset (0–1). drei normalizes offset by
// (scrollHeight − viewport). Experience is a 150vh block (its 5-card timeline
// scrolls through without clipping), so the slots aren't all 100vh: section
// tops are 0 / 100 / 300 / 400 / 550 / 650vh and the divisor is the last top
// (650vh, where Contact lands at offset 1). offset = topVh / 650.
const DESKTOP_OFFSETS: Record<string, number> = {
  intro: 0,
  skills: 100 / 650,
  work: 300 / 650,
  experience: 400 / 650,
  certificates: 550 / 650,
  contact: 1,
};
// Mobile uses native scroll (not ScrollControls), so nav jumps to the DOM
// section by id with native smooth scrollIntoView.
const MOBILE_SECTION_IDS: Record<string, string> = {
  skills: "mskills",
  work: "mwork",
  experience: "mexperience",
  certificates: "mcertificates",
  contact: "mcontact",
};

// Registers a nav handler that smooth-scrolls scroll.el to a section's offset.
// Native smooth scroll moves the element; ScrollControls tracks it and damps the
// 3D toward the new position. Must live inside <ScrollControls> to read scroll.el.
function RegisterNavScroll({ offsets }: { offsets: Record<string, number> }) {
  const scroll = useScroll();
  useEffect(() => {
    registerNavScroll((id) => {
      const offset = offsets[id];
      if (offset == null) return;
      const el = scroll.el;
      const max = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: offset * max, behavior: "smooth" });
    });
    return () => registerNavScroll(null);
  }, [offsets, scroll]);
  return null;
}

// Mobile nav: native smooth scroll to the DOM section (no ScrollControls).
function RegisterMobileNav() {
  useEffect(() => {
    registerNavScroll((id) => {
      if (id === "intro") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      document
        .getElementById(MOBILE_SECTION_IDS[id])
        ?.scrollIntoView({ behavior: "smooth" });
    });
    return () => registerNavScroll(null);
  }, []);
  return null;
}

// One persistent keyboard zooms across the hero → skills scroll. ScrollControls
// owns the scroll (Lenis removed); the keyboard reads useScroll, the DOM
// sections ride along inside <Scroll html>.
//
// Responsive tiers (see useDeviceTier):
//   desktop → full R3F + bloom, dpr [1,2], hover skill panels
//   tablet  → same R3F/interactions, bloom off, dpr 1 (cuts fill-rate cost)
//   mobile  → scroll-driven keyboard only (no interactivity), skills DOM below

// drei's ScrollControls lays its scroll container OVER the canvas to capture
// the wheel, so the canvas never receives pointer events and R3F can't raycast
// (no hover/press). Connect R3F's event system to that scroll element instead
// (it's the topmost element under the cursor), then restore the canvas on
// unmount. Must live inside <ScrollControls> to read scroll.el.
function ConnectPointerEvents() {
  const scroll = useScroll();
  // Read events/gl imperatively via the stable get() — depending on the live
  // `events` object loops, since connect() mutates it and changes its identity.
  const get = useThree((s) => s.get);
  useEffect(() => {
    const el = scroll.el;
    const { events, gl } = get();
    if (!el || !events.connect) return;
    events.connect(el);
    return () => events.connect?.(gl.domElement);
  }, [scroll.el, get]);
  return null;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#cfd6e4", "#1b212c", 0.5]} />
      <directionalLight position={[5, 8, 4]} intensity={0.9} castShadow />
      <directionalLight position={[-4, 3, -2]} intensity={0.25} />
      {/* Warm rim near the esc corner. Kept faint + short-range so it doesn't
          wash the number row (1/2 keys) and read like the emissive glow. */}
      <pointLight position={[-2, 0.1, 1]} intensity={1} color="#ff5b1f" distance={3} />
    </>
  );
}

export function ScrollExperience() {
  const tier = useDeviceTier();

  // Pre-mount: render nothing (there's no 3D on the server anyway) to avoid a
  // hydration mismatch; the tier resolves on the client immediately after.
  if (tier === null) return null;

  if (tier === "mobile") {
    // Native document scroll (no ScrollControls): the keyboard sits in a fixed
    // canvas behind the content and rotates on window.scrollY, then lifts away.
    // The DOM sections flow normally below, so long content can't overlap.
    return (
      <>
        <div className="pointer-events-none fixed inset-0 z-0">
          <Canvas
            dpr={1}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 0.5, 5], fov: 35 }}
          >
            <Lights />
            <Suspense fallback={null}>
              <MobileKeyboard glowSkills={GLOW_SKILLS} />
            </Suspense>
          </Canvas>
        </div>

        <RegisterMobileNav />

        {/* Transparent content in normal flow over the fixed keyboard canvas;
            the board animates pose-by-pose behind it as a backdrop. */}
        <div className="relative z-10">
          <section className="relative h-[100svh]">
            <MobileHero />
          </section>
          <MobileSkills />
          <MobileWork />
          <MobileExperience />
          <MobileCertificates />
          <MobileContact />
        </div>
      </>
    );
  }

  // GPU fill-rate is the bottleneck (183-mesh GLB + Bloom). Cap dpr at 1.25 and
  // — since EffectComposer renders the scene into its own buffer, making the
  // Canvas's own antialias unused — turn the base MSAA off and let the composer
  // do AA at a cheaper 4x (default is 8). Together this lifts fps so the key
  // press stops reading as low-fps.
  const dpr: [number, number] | number = tier === "tablet" ? 1 : [1, 1.25];
  const bloom = tier === "desktop";

  return (
    <div className="fixed inset-0">
      <Canvas
        dpr={dpr}
        // Composer (desktop) does AA via multisampling, so skip base MSAA there;
        // tablet has no composer, so it keeps base antialias.
        gl={{ antialias: !bloom, alpha: true }}
        camera={{ position: [0, 0.5, 5], fov: 35 }}
      >
        <Lights />

        {/* 7.5 pages: hero → skills → a one-page HOLD at skills (the pause) →
            work → experience (a taller 150vh block so its timeline scrolls
            through) → certificates (all share the low keyboard pose) → contact.
            The keyboard shrinks into the bottom-right corner over the contact
            page and buzzes there (see shared-keyboard). */}
        <ScrollControls pages={7.5} damping={0.3}>
          <ConnectPointerEvents />
          <RegisterNavScroll offsets={DESKTOP_OFFSETS} />
          <Suspense fallback={null}>
            <SharedKeyboard glowSkills={GLOW_SKILLS} />
          </Suspense>

          {/* pointer-events:none lets hover/clicks fall through to the keyboard
              behind; interactive bits (buttons, project cards) re-enable it. */}
          <Scroll html style={{ pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh" }}>
              <Intro />
            </div>
            <div style={{ position: "absolute", top: "100vh", left: 0, width: "100vw", height: "100vh" }}>
              <Skills />
            </div>
            <div style={{ position: "absolute", top: "300vh", left: 0, width: "100vw", height: "100vh" }}>
              <Work />
            </div>
            <div style={{ position: "absolute", top: "400vh", left: 0, width: "100vw", height: "150vh" }}>
              <Experience />
            </div>
            <div style={{ position: "absolute", top: "550vh", left: 0, width: "100vw", height: "100vh" }}>
              <Certificates />
            </div>
            <div style={{ position: "absolute", top: "650vh", left: 0, width: "100vw", height: "100vh" }}>
              <Contact />
            </div>
          </Scroll>
        </ScrollControls>

        {bloom && (
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={0.8}
              luminanceThreshold={0.6}
              luminanceSmoothing={0.4}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
