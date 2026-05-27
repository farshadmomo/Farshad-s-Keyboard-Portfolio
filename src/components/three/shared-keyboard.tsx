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
// Work = sink the board low + back so the 3×2 project grid reads on top of it.
const WORK_POS = new THREE.Vector3(0, -1.25, 0.2);
// Contact = pure-DOM terminal page; slide the board straight down out of frame
// (same rot/scale as Work) so the terminal block reads on a clean backdrop.
const CONTACT_POS = new THREE.Vector3(0, -3.4, 0.2);
const HERO_ROT: [number, number, number] = [0.35, -0.2, 0];
const SKILLS_ROT: [number, number, number] = [0.78, 0, 0];
const WORK_ROT: [number, number, number] = [0.5, -0.1, 0];
const CONTACT_ROT: [number, number, number] = [0.5, -0.1, 0];
const HERO_SCALE = 1;
const SKILLS_SCALE = 1.5;
const WORK_SCALE = 1.7;
const CONTACT_SCALE = 1.7;

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

// Desktop scroll keyframes (offset) across 5 pages. drei normalizes offset by
// (scrollHeight − viewport), so with N pages a DOM block at top:k·100vh lands at
// offset k/(N−1) — here the divisor is 4. The bands:
//   [0,    0.25] hero → skills      (Skills DOM @100vh = 0.25)
//   [0.25, 0.5 ] HOLD at skills     (the requested pause; empty 100vh gap)
//   [0.5,  0.75] skills → work      (Work DOM @300vh = 0.75)
//   [0.75, 1.0 ] work → contact     (board sinks out; Contact DOM @400vh = 1.0)
const SKILLS_IN = 0.25;
const SKILLS_HOLD = 0.5;
const WORK_IN = 0.75;

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
  const hintRef = useRef<HTMLDivElement>(null);
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
      // 4 mobile pages (hero, skills, work, +tail). Rotate hero→skills early
      // (by offset 0.3), then lift the settled board up (by 0.5) and keep it
      // lifted while the Skills + Work DOM scroll past beneath it.
      const rotT = smoothstep(clamp(scroll.offset / 0.3, 0, 1));
      const upT = smoothstep(clamp((scroll.offset - 0.3) / 0.2, 0, 1));

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
      glowProgress.current = scroll.range(0.18, 0.12);
      return;
    }

    // 5 pages: hero → skills → HOLD (pause) → work → contact (board sinks out).
    const o = scroll.offset;
    if (o < SKILLS_IN) {
      const t = smoothstep(clamp(o / SKILLS_IN, 0, 1));
      board.position.lerpVectors(HERO_POS, SKILLS_POS, t);
      board.rotation.set(
        lerp(HERO_ROT[0], SKILLS_ROT[0], t),
        lerp(HERO_ROT[1], SKILLS_ROT[1], t),
        lerp(HERO_ROT[2], SKILLS_ROT[2], t),
      );
      board.scale.setScalar(lerp(HERO_SCALE, SKILLS_SCALE, t));
    } else if (o < SKILLS_HOLD) {
      // Dead band: pin the board to the skills pose. One page of scroll passes
      // with nothing moving — the requested pause before Work.
      board.position.copy(SKILLS_POS);
      board.rotation.set(SKILLS_ROT[0], SKILLS_ROT[1], SKILLS_ROT[2]);
      board.scale.setScalar(SKILLS_SCALE);
    } else if (o < WORK_IN) {
      const t = smoothstep(clamp((o - SKILLS_HOLD) / (WORK_IN - SKILLS_HOLD), 0, 1));
      board.position.lerpVectors(SKILLS_POS, WORK_POS, t);
      board.rotation.set(
        lerp(SKILLS_ROT[0], WORK_ROT[0], t),
        lerp(SKILLS_ROT[1], WORK_ROT[1], t),
        lerp(SKILLS_ROT[2], WORK_ROT[2], t),
      );
      board.scale.setScalar(lerp(SKILLS_SCALE, WORK_SCALE, t));
    } else {
      const t = smoothstep(clamp((o - WORK_IN) / (1 - WORK_IN), 0, 1));
      board.position.lerpVectors(WORK_POS, CONTACT_POS, t);
      board.rotation.set(
        lerp(WORK_ROT[0], CONTACT_ROT[0], t),
        lerp(WORK_ROT[1], CONTACT_ROT[1], t),
        lerp(WORK_ROT[2], CONTACT_ROT[2], t),
      );
      board.scale.setScalar(lerp(WORK_SCALE, CONTACT_SCALE, t));
    }
    // Glow ramps on approaching skills, stays full through the whole hold (so
    // panels remain armed while paused), then fades out toward work.
    glowProgress.current =
      o < SKILLS_IN
        ? smoothstep(clamp((o - (SKILLS_IN - 0.18)) / 0.18, 0, 1))
        : o < SKILLS_HOLD
          ? 1
          : 1 - smoothstep(clamp((o - SKILLS_HOLD) / 0.18, 0, 1));

    // The "hover the glowing keys" hint rides above the board (anchored in the
    // scene, not the scrolled DOM) and fades in with the glow, so it sits over
    // the keyboard at skills instead of scrolling away.
    if (hintRef.current) hintRef.current.style.opacity = String(glowProgress.current);
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

      {/* Hint anchored above the board (scene-locked, fades with glow) so it
          hovers over the keyboard at skills rather than scrolling off. Outer
          ref carries the glow-driven opacity; the inner ping is the eye-catch
          (motion-safe so reduced-motion users get a static dot). */}
      <Html
        portal={portalRef}
        position={[0.1, 0.95, 0.9]}
        center
        style={{ pointerEvents: "none" }}
        zIndexRange={[20, 10]}
      >
        <div ref={hintRef} style={{ opacity: 0 }} className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5 whitespace-nowrap border border-accent/40 bg-bg-elev/80 px-4 py-2.5 backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-70 motion-safe:animate-ping" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg-muted">
              Hover the <span className="text-accent">glowing keys</span>
            </span>
          </div>
          <svg
            width="14"
            height="9"
            viewBox="0 0 14 9"
            fill="none"
            aria-hidden
            className="text-accent/50"
          >
            <path
              d="M2 2l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Html>

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
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      className="w-[300px] translate-y-[96px] border border-border bg-bg-elev/95 p-4 shadow-xl shadow-black/40 backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center border border-accent/60 font-mono text-[13px] text-accent">
          {data.key}
        </span>
        <p className="font-sans text-[16px] font-medium leading-tight text-fg">
          {data.title}
        </p>
      </div>

      <p className="mt-3 font-sans text-[13px] leading-relaxed text-fg-muted">
        {data.detail}
      </p>

      <ul className="mt-3 flex flex-col gap-1.5">
        {data.highlights.map((h) => (
          <li
            key={h}
            className="flex items-start gap-2 font-sans text-[12.5px] leading-snug text-fg"
          >
            <span aria-hidden className="mt-[6px] size-1 shrink-0 rounded-full bg-accent" />
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-border pt-3">
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
