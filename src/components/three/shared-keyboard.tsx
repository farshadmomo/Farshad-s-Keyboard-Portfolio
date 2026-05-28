"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
// Contact = pure-DOM terminal page. The board shrinks and sits on the RIGHT,
// where it slowly rotates in place (turntable spin added in useFrame from clock
// time) as a quiet showpiece beside the terminal block.
const CONTACT_POS = new THREE.Vector3(1.95, -1.05, 0.5);
const HERO_ROT: [number, number, number] = [0.35, -0.2, 0];
const SKILLS_ROT: [number, number, number] = [0.78, 0, 0];
const WORK_ROT: [number, number, number] = [0.5, -0.1, 0];
const CONTACT_ROT: [number, number, number] = [0.5, 0.9, 0];
const HERO_SCALE = 1;
const SKILLS_SCALE = 1.5;
const WORK_SCALE = 1.7;
const CONTACT_SCALE = 0.32;

// Rest spin: when the board settles into the contact pose it gets a velocity
// kick, then angular velocity decays so it eases to a stop. The accumulated
// angle is scaled by the contact-settle progress (t) where it's applied, so it
// unwinds to exactly 0 at the work/experience boundary — no snap on scroll-up.
const CONTACT_SPIN_V0 = 0.7; // rad/s kick on settle
const CONTACT_SPIN_DECAY = 0.85; // higher = eases to a stop faster

// Mobile (portrait) pose track. Driven by NATIVE scroll, not drei
// ScrollControls — mobile uses normal document flow (so long content can't
// overlap), and the keyboard lives in a fixed transparent canvas BEHIND the
// content, animating the same hero→skills→work→experience→contact poses the
// desktop does (just non-interactive). Sections stay transparent so the board
// reads as a backdrop; glass cards float over it for legibility. Poses are
// portrait-framed: hero upper-center, skills top-down zoom, work/experience
// sunk low as a faint bottom backdrop, contact shrunk toward the corner.
const M_HERO_POS = new THREE.Vector3(0, -0.1, 0);
const M_SKILLS_POS = new THREE.Vector3(0, 0.1, 0.5);
const M_WORK_POS = new THREE.Vector3(0, -1.55, 0.2);
const M_CONTACT_POS = new THREE.Vector3(0.8, -1.35, 0.5);
const M_HERO_ROT: [number, number, number] = [0.3, -0.15, 0];
const M_SKILLS_ROT: [number, number, number] = [0.82, 0, 0];
const M_WORK_ROT: [number, number, number] = [0.5, -0.1, 0];
const M_CONTACT_ROT: [number, number, number] = [0.5, 0.9, 0];
const M_HERO_SCALE = 0.82;
const M_SKILLS_SCALE = 0.95;
const M_WORK_SCALE = 1.7;
const M_CONTACT_SCALE = 0.42;

// Pose keyframes indexed by section: [hero, skills, work, experience, contact].
// Experience reuses the low work pose (shared faint backdrop, like desktop).
const M_POSES = [M_HERO_POS, M_SKILLS_POS, M_WORK_POS, M_WORK_POS, M_CONTACT_POS];
const M_ROTS: [number, number, number][] = [
  M_HERO_ROT,
  M_SKILLS_ROT,
  M_WORK_ROT,
  M_WORK_ROT,
  M_CONTACT_ROT,
];
const M_SCALES = [
  M_HERO_SCALE,
  M_SKILLS_SCALE,
  M_WORK_SCALE,
  M_WORK_SCALE,
  M_CONTACT_SCALE,
];
// DOM ids of the scrolling sections, in pose order (index 0 = hero = top = 0).
const M_SECTION_IDS = ["mskills", "mwork", "mexperience", "mcontact"];

// Desktop scroll keyframes (offset) across 6 pages. drei normalizes offset by
// (scrollHeight − viewport), so with N pages a DOM block at top:k·100vh lands at
// offset k/(N−1) — here the divisor is 5. The bands:
//   [0,   0.2] hero → skills        (Skills DOM @100vh = 0.2)
//   [0.2, 0.4] HOLD at skills       (the requested pause; empty 100vh gap)
//   [0.4, 0.6] skills → work        (Work DOM @300vh = 0.6)
//   [0.6, 0.8] HOLD at work         (Work + Experience @400vh=0.8 share the low pose)
//   [0.8, 1.0] work → contact       (board shrinks into the bottom-right corner; Contact @500vh = 1.0)
const SKILLS_IN = 0.2;
const SKILLS_HOLD = 0.4;
const WORK_IN = 0.6;
const WORK_HOLD = 0.8;

const lerp = THREE.MathUtils.lerp;
const clamp = THREE.MathUtils.clamp;
const smoothstep = (x: number) => x * x * (3 - 2 * x);
// Wrap an angle into [-π, π] — the shortest signed rotation to the equivalent
// orientation, so the board turns left or right by whichever is closer.
const wrapPi = (a: number) => {
  const m = ((a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  return m - Math.PI;
};
// Interpolate between two angles along the shortest arc.
const lerpAngle = (a: number, b: number, t: number) => a + wrapPi(b - a) * t;

export function SharedKeyboard({ glowSkills }: { glowSkills: SkillDatum[] }) {
  const scroll = useScroll();
  const boardRef = useRef<THREE.Group>(null);
  const glowProgress = useRef(0);
  const hintRef = useRef<HTMLDivElement>(null);
  // Rest-spin state (contact pose). Offset is integrated from a decaying
  // velocity; spunSettled re-arms the kick so it spins again on each visit.
  const spinVel = useRef(0);
  const spinOffset = useRef(0);
  const spunSettled = useRef(false);
  const [hovered, setHovered] = useState<{
    code: string;
    point: THREE.Vector3;
  } | null>(null);

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
  const emissiveKeys = useMemo(
    () => glowSkills.map((s) => s.code),
    [glowSkills],
  );

  useFrame((_, delta) => {
    const board = boardRef.current;
    if (!board) return;

    // 6 pages: hero → skills → HOLD (pause) → work → HOLD (work+experience) →
    // contact (board shrinks into the bottom-right corner and buzzes).
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
      const t = smoothstep(
        clamp((o - SKILLS_HOLD) / (WORK_IN - SKILLS_HOLD), 0, 1),
      );
      board.position.lerpVectors(SKILLS_POS, WORK_POS, t);
      board.rotation.set(
        lerp(SKILLS_ROT[0], WORK_ROT[0], t),
        lerp(SKILLS_ROT[1], WORK_ROT[1], t),
        lerp(SKILLS_ROT[2], WORK_ROT[2], t),
      );
      board.scale.setScalar(lerp(SKILLS_SCALE, WORK_SCALE, t));
    } else if (o < WORK_HOLD) {
      // Pin the low work pose across both the Work grid and the Experience
      // timeline — the board is a faint backdrop for both DOM sections.
      board.position.copy(WORK_POS);
      board.rotation.set(WORK_ROT[0], WORK_ROT[1], WORK_ROT[2]);
      board.scale.setScalar(WORK_SCALE);
    } else {
      // Work/Experience → Contact: scroll-driven rotate + move + shrink into the
      // right-side pose (t). On top of that, a rest spin that eases to a stop:
      // kicked once the board settles (t≈1), velocity decays, and the offset is
      // scaled by t so it unwinds to 0 at the boundary — no snap on scroll-up.
      const t = smoothstep(clamp((o - WORK_HOLD) / (1 - WORK_HOLD), 0, 1));
      board.position.lerpVectors(WORK_POS, CONTACT_POS, t);
      board.scale.setScalar(lerp(WORK_SCALE, CONTACT_SCALE, t));

      if (t > 0.95 && !spunSettled.current) {
        spunSettled.current = true;
        spinVel.current = CONTACT_SPIN_V0;
      } else if (t < 0.5) {
        spunSettled.current = false; // re-arm for the next visit
      }
      spinVel.current *= Math.exp(-CONTACT_SPIN_DECAY * delta);
      spinOffset.current += spinVel.current * delta;
      // Keep the offset as the shortest signed angle so the board settles by
      // turning whichever way (left or right) is nearer, never the long way.
      spinOffset.current = wrapPi(spinOffset.current);

      board.rotation.set(
        lerp(WORK_ROT[0], CONTACT_ROT[0], t),
        lerpAngle(WORK_ROT[1], CONTACT_ROT[1], t) + spinOffset.current * t,
        lerp(WORK_ROT[2], CONTACT_ROT[2], t),
      );
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
    if (hintRef.current)
      hintRef.current.style.opacity = String(glowProgress.current);
  });

  const active = hovered
    ? (glowSkills.find((s) => s.code === hovered.code) ?? null)
    : null;

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
              code && point && glowProgress.current > 0.4
                ? { code, point }
                : null,
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
        <div
          ref={hintRef}
          style={{ opacity: 0 }}
          className="flex flex-col items-center gap-2"
        >
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

// Mobile keyboard: glow only, no hover/press/panels (no interactivity, kept
// cheap — dpr 1, no bloom). Lives in a fixed canvas behind native-scrolling
// DOM and animates the per-section poses from window.scrollY mapped to the
// measured DOM section anchors. Within each section it HOLDS that section's
// pose for the first ~55%, then transitions to the next over the last ~45% —
// the same "settle then move" rhythm as the desktop hold bands.
export function MobileKeyboard({ glowSkills }: { glowSkills: SkillDatum[] }) {
  const boardRef = useRef<THREE.Group>(null);
  const glowProgress = useRef(0);
  const scrollY = useRef(0);
  const vh = useRef(800);
  // Absolute document Y of each section top: [hero=0, skills, work, exp, contact].
  const anchors = useRef<number[]>([0, 1, 2, 3, 4]);

  const emissiveKeys = useMemo(
    () => glowSkills.map((s) => s.code),
    [glowSkills],
  );

  useEffect(() => {
    const measure = () => {
      const y = window.scrollY;
      vh.current = window.innerHeight || 800;
      anchors.current = [
        0,
        ...M_SECTION_IDS.map((id) => {
          const el = document.getElementById(id);
          return el ? el.getBoundingClientRect().top + y : Number.MAX_SAFE_INTEGER;
        }),
      ];
    };
    const onScroll = () => {
      scrollY.current = window.scrollY;
    };
    onScroll();
    measure();
    // Re-measure after late layout shifts (fonts, canvas mount).
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1200);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useFrame(() => {
    const board = boardRef.current;
    if (!board) return;
    const segs = anchors.current;
    const y = scrollY.current;
    const sSkills = segs[1];
    const sContact = segs[4];
    const W = vh.current * 0.85; // transition window (~one screen)

    // Lerp the board between two pose keyframes (indices into M_POSES); returns
    // the eased factor for glow timing.
    const pose = (i: number, j: number, raw: number) => {
      const t = smoothstep(clamp(raw, 0, 1));
      board.position.lerpVectors(M_POSES[i], M_POSES[j], t);
      board.rotation.set(
        lerp(M_ROTS[i][0], M_ROTS[j][0], t),
        lerpAngle(M_ROTS[i][1], M_ROTS[j][1], t),
        lerp(M_ROTS[i][2], M_ROTS[j][2], t),
      );
      board.scale.setScalar(lerp(M_SCALES[i], M_SCALES[j], t));
      return t;
    };

    // Piecewise schedule. Indices: 0 hero · 1 skills(zoom) · 2 work(low,
    // shared backdrop for skills body + work + experience) · 4 contact(corner).
    let glow = 0;
    if (y < sSkills - W) {
      pose(0, 0, 0); // hero, held
    } else if (y < sSkills) {
      glow = pose(0, 1, (y - (sSkills - W)) / W); // hero → skills zoom
    } else if (y < sSkills + W) {
      glow = 1 - pose(1, 2, (y - sSkills) / W); // skills zoom → sink to low
    } else if (y < sContact - W) {
      pose(2, 2, 0); // low backdrop, held through work + experience
    } else if (y < sContact) {
      pose(2, 4, (y - (sContact - W)) / W); // low → contact corner
    } else {
      pose(4, 4, 0); // contact, held
    }
    glowProgress.current = glow;
  });

  return (
    <group ref={boardRef}>
      <Keyboard emissiveKeys={emissiveKeys} glowProgress={glowProgress} />
    </group>
  );
}

function SkillPanel({ data }: { data: SkillDatum }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      className="w-[300px] translate-y-[96px] border border-border bg-bg-elev/70 p-4 shadow-xl shadow-black/40 backdrop-blur-md"
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
            <span
              aria-hidden
              className="mt-[6px] size-1 shrink-0 rounded-full bg-accent"
            />
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
