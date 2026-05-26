"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useScroll } from "@react-three/drei";
import { motion } from "framer-motion";
import { Keyboard } from "./keyboard";
import type { SkillDatum } from "@/lib/skills-data";

// Board poses tuned live in the browser. Hero = right-side three-quarter angle;
// Skills = zoomed in, shifted toward center, pitched back so the camera looks
// down onto the TOP face of the keyboard (positive rot.x tilts the top toward
// the camera at +z).
const HERO_POS = new THREE.Vector3(1.15, -0.1, 0);
const SKILLS_POS = new THREE.Vector3(0.1, -0.1, 0.9);
const HERO_ROT: [number, number, number] = [0.35, -0.2, 0];
const SKILLS_ROT: [number, number, number] = [0.78, 0, 0];
const HERO_SCALE = 1;
const SKILLS_SCALE = 1.5;

// Mobile (portrait) pose track. The board is centered and the scroll is split
// in two halves: first half rotates hero→skills (then STOPS), second half lifts
// the settled board up toward the top so the skills DOM below scrolls into view.
const M_HERO_POS = new THREE.Vector3(0, -0.15, 0);
const M_SKILLS_POS = new THREE.Vector3(0, 0.05, 0.5);
const M_TOP_POS = new THREE.Vector3(0, 1.25, 0.5);
const M_HERO_ROT: [number, number, number] = [0.3, -0.15, 0];
const M_SKILLS_ROT: [number, number, number] = [0.78, 0, 0];
const M_HERO_SCALE = 0.8;
const M_SKILLS_SCALE = 1.0;

const lerp = THREE.MathUtils.lerp;
const clamp = THREE.MathUtils.clamp;
const smoothstep = (x: number) => x * x * (3 - 2 * x);

export function SharedKeyboard({
  glowSkills,
  mobile = false,
}: {
  glowSkills: SkillDatum[];
  mobile?: boolean;
}) {
  const scroll = useScroll();
  const boardRef = useRef<THREE.Group>(null);
  const glowProgress = useRef(0);
  const tmpPos = useRef(new THREE.Vector3());
  const [hovered, setHovered] = useState<{ code: string; point: THREE.Vector3 } | null>(null);

  // Anchor the hover panel to the non-scrolled canvas container. drei <Html>
  // defaults its portal to events.connected, which we repointed to drei's
  // scrolled scroll element — that would offset the panel off-screen by the
  // scrollTop. The canvas's parent isn't scrolled, so positions stay correct.
  const portalRef = useRef<HTMLElement | null>(null);
  portalRef.current = useThree((s) => s.gl.domElement.parentElement);

  // Stable reference: hovering a glow key calls setHovered → this component
  // re-renders, and a fresh array here would re-run Keyboard's model useMemo
  // (re-clone + re-color the whole GLB, swap the <primitive>) on every hover —
  // the source of the highlighted-key glitch. Memoize so the model builds once.
  const emissiveKeys = useMemo(() => glowSkills.map((s) => s.code), [glowSkills]);

  useFrame(() => {
    const board = boardRef.current;
    if (!board) return;

    if (mobile) {
      // First half: rotate/zoom hero→skills (stops at the skills pose).
      const rotT = smoothstep(clamp(scroll.offset / 0.5, 0, 1));
      // Second half: lift the settled board up so skills DOM rises beneath it.
      const upT = smoothstep(clamp((scroll.offset - 0.5) / 0.5, 0, 1));

      const p = tmpPos.current;
      p.lerpVectors(M_HERO_POS, M_SKILLS_POS, rotT);
      p.lerp(M_TOP_POS, upT);
      board.position.copy(p);
      board.rotation.set(
        lerp(M_HERO_ROT[0], M_SKILLS_ROT[0], rotT),
        lerp(M_HERO_ROT[1], M_SKILLS_ROT[1], rotT),
        lerp(M_HERO_ROT[2], M_SKILLS_ROT[2], rotT),
      );
      board.scale.setScalar(lerp(M_HERO_SCALE, M_SKILLS_SCALE, rotT) * (1 - upT * 0.25));
      glowProgress.current = scroll.range(0.3, 0.2);
      return;
    }

    const t = smoothstep(scroll.offset);
    board.position.lerpVectors(HERO_POS, SKILLS_POS, t);
    board.rotation.set(
      lerp(HERO_ROT[0], SKILLS_ROT[0], t),
      lerp(HERO_ROT[1], SKILLS_ROT[1], t),
      lerp(HERO_ROT[2], SKILLS_ROT[2], t),
    );
    board.scale.setScalar(lerp(HERO_SCALE, SKILLS_SCALE, t));
    // Keys ramp on as the Skills page approaches (last ~45% of the scroll).
    glowProgress.current = scroll.range(0.55, 0.45);
  });

  const active = hovered
    ? glowSkills.find((s) => s.code === hovered.code) ?? null
    : null;

  // Mobile: glow only, no hover/press/panels (no interactivity).
  if (mobile) {
    return (
      <group ref={boardRef}>
        <Keyboard emissiveKeys={emissiveKeys} glowProgress={glowProgress} />
      </group>
    );
  }

  return (
    <>
      <group ref={boardRef} onPointerMissed={() => setHovered(null)}>
        <Keyboard
          interactive
          emissiveKeys={emissiveKeys}
          glowProgress={glowProgress}
          onHoverGlow={(code, point) =>
            // Only reveal panels once the keys are actually glowing (in Skills).
            setHovered(
              code && point && glowProgress.current > 0.4 ? { code, point } : null,
            )
          }
        />
      </group>

      {active && hovered && (
        <Html
          portal={portalRef}
          position={[hovered.point.x, hovered.point.y, hovered.point.z]}
          center
          style={{ pointerEvents: "none" }}
          zIndexRange={[30, 10]}
        >
          <SkillPanel data={active} />
        </Html>
      )}
    </>
  );
}

function SkillPanel({ data }: { data: SkillDatum }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="w-[210px] translate-y-[80px] border border-border bg-bg-elev/90 px-4 py-3 backdrop-blur-sm"
    >
      <p className="font-sans text-[14px] font-medium text-fg">{data.title}</p>
      <p className="mt-1.5 font-sans text-[12px] leading-relaxed text-fg-muted">
        {data.detail}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {data.tools.map((t) => (
          <span
            key={t}
            className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
