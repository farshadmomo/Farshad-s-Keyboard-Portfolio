"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Scroll, ScrollControls, useScroll } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { SharedKeyboard } from "@/components/three/shared-keyboard";
import { Intro } from "@/components/sections/intro";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";
import { Contact } from "@/components/sections/contact";
import { MobileHero, MobileSkills, MobileWork, MobileContact } from "@/components/mobile-experience";
import { GLOW_SKILLS } from "@/lib/skills-data";
import { useDeviceTier } from "@/lib/use-device-tier";

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
    return (
      <div className="fixed inset-0">
        <Canvas
          dpr={1}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0.5, 5], fov: 35 }}
        >
          <Lights />
          {/* 5 pages: rotate the board into the skills pose, lift it up, then
              the Skills + Work + Contact DOM scroll past beneath the settled
              keyboard. */}
          <ScrollControls pages={5} damping={0.2}>
            <ConnectPointerEvents />
            <Suspense fallback={null}>
              <SharedKeyboard glowSkills={GLOW_SKILLS} mobile />
            </Suspense>

            <Scroll html style={{ pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh" }}>
                <MobileHero />
              </div>
              <div style={{ position: "absolute", top: "200vh", left: 0, width: "100vw" }}>
                <MobileSkills />
              </div>
              <div style={{ position: "absolute", top: "300vh", left: 0, width: "100vw" }}>
                <MobileWork />
              </div>
              <div style={{ position: "absolute", top: "400vh", left: 0, width: "100vw" }}>
                <MobileContact />
              </div>
            </Scroll>
          </ScrollControls>
        </Canvas>
      </div>
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

        {/* 5 pages: hero → skills → a one-page HOLD at skills (the pause) →
            work → contact. The hold lives between skills (100vh) and work
            (300vh); the keyboard pins to the skills pose across it, then sinks
            out of frame over the contact page (see shared-keyboard). */}
        <ScrollControls pages={5} damping={0.2}>
          <ConnectPointerEvents />
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
            <div style={{ position: "absolute", top: "400vh", left: 0, width: "100vw", height: "100vh" }}>
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
