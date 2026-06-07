"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Keyboard } from "./keyboard";
import { useDeviceTier } from "@/lib/use-device-tier";

// Standalone background scene for the 404 page: the same GLB keyboard the rest
// of the site uses, turning slowly on its own axis with a gentle float. The
// single ESC keycap breathes orange (emissive + bloom) — the thematic "way out"
// of a dead-end page (see not-found.tsx, where the physical Esc key also routes
// home). No interactivity: it's a pure backdrop, so the canvas is
// pointer-events:none and the keyboard isn't `interactive`.

const lerp = THREE.MathUtils.lerp;

function LostScene() {
  const boardRef = useRef<THREE.Group>(null);
  // The ESC key's glow intensity, pinned by useFrame to a slow breathing pulse.
  const glow = useRef(0.7);

  useFrame((state) => {
    const board = boardRef.current;
    if (!board) return;
    const t = state.clock.elapsedTime;
    // Slow turntable spin + a fixed downward pitch so the camera reads the top
    // face. A gentle bob on Y keeps it feeling weightless / adrift.
    board.rotation.y = t * 0.32;
    board.rotation.x = 0.5;
    board.position.y = -0.15 + Math.sin(t * 0.8) * 0.06;
    // ESC keycap breathes between a dim ember and full glow.
    glow.current = lerp(0.35, 1, (Math.sin(t * 1.6) + 1) / 2);
  });

  return (
    <group ref={boardRef} scale={1.35}>
      <Keyboard interactive emissiveKeys={["Escape"]} glowProgress={glow} />
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#cfd6e4", "#1b212c", 0.5]} />
      <directionalLight position={[5, 8, 4]} intensity={0.9} />
      <directionalLight position={[-4, 3, -2]} intensity={0.25} />
      <pointLight position={[-2, 0.1, 1]} intensity={1} color="#ff5b1f" distance={3} />
    </>
  );
}

export function LostKeyboard() {
  const tier = useDeviceTier();

  // No 3D until the tier resolves on the client (avoids a hydration mismatch;
  // there's no canvas on the server). The page copy carries the message until then.
  if (tier === null) return null;

  // dpr capped at 1 (no retina supersample) since this loop runs continuously —
  // keeps the rotation smooth. Bloom (desktop only) gives the ESC key its halo.
  const bloom = tier === "desktop";

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={1}
        gl={{ antialias: !bloom, alpha: true }}
        camera={{ position: [0, 0.5, 5], fov: 35 }}
      >
        <Lights />
        <Suspense fallback={null}>
          <LostScene />
        </Suspense>

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
