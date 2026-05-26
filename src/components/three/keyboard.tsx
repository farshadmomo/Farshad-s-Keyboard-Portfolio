"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame, type ThreeElements, type ThreeEvent } from "@react-three/fiber";

const MODEL_URL = "/models/keyboard.glb";
// Serve the DRACO decoder locally (public/draco/) instead of drei's gstatic CDN
// default, so the first keyboard render doesn't wait on a third-party fetch.
const DRACO_PATH = "/draco/";

// Normalize the model's largest axis to this many world units so CLAUDE.md's
// tuned camera positions + light distances stay meaningful.
const TARGET_SIZE = 3;

// How deep a key travels when pressed, as a fraction of board thickness.
const PRESS_FRACTION = 0.24;
const PRESS_SIGN = -1; // direction along the thin (up) axis; flip if keys pop up

// Keyboard theme (GLB ships all-white, so we color in code).
// Matched to the physical board: cream alphas, navy case + navy accent
// keycaps on the function row, single orange ESC.
const CREAM = "#e8e1cf"; // alpha/main keycaps
const NAVY_KEY = "#3a4250"; // accent keycaps (function row), lighter than case
const CASE = "#2c3340"; // case / structural shell
const LEGEND_DARK = "#20242e"; // legends printed on cream keys
const LEGEND_LIGHT = "#d4d8df"; // legends printed on navy keys
const ACCENT = "#ff5b1f"; // ESC
const GLOW_MAX = 1.4; // peak emissiveIntensity for glowing skill keys
// A resolved key must persist this long before the hover commits. Flicker at a
// cap boundary keeps resetting the timer, so the active key never oscillates.
const HOVER_DWELL_MS = 30;

const SPACE_COLOR = "#54545B"; // space bar

// Keycaps rendered in the darker navy: function row, nav cluster, and all structural/modifier keys.
const NAVY_CODES = new Set([
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
  "Delete", "Home", "End", "PageUp", "PageDown", "Insert", "PrintScreen", "Pause",
  "Backquote", "Tab", "CapsLock", "ShiftLeft", "ShiftRight",
  "ControlLeft", "ControlRight", "MetaLeft", "AltLeft", "AltRight",
  "Fn", "Enter", "Backslash", "Backspace",
]);

/** Map a keycap's printed legend (the GLB node name) to a KeyboardEvent.code. */
function legendToCode(raw: string | undefined): string | null {
  if (!raw) return null;
  const n = raw.trim();
  const lower = n.toLowerCase();

  if (/^[a-z]$/i.test(n)) return "Key" + n.toUpperCase();
  if (/^[0-9]$/.test(n)) return "Digit" + n;
  const f = lower.match(/^f(\d{1,2})$/);
  if (f) return "F" + f[1];

  // quote key node name is  '"
  if (n.includes("'") && n.includes('"')) return "Quote";

  // three.js sanitizes node names on load: spaces → "_" and [ ] . : / are removed.
  // Keys below cover both the raw Spline legends and their sanitized forms.
  const map: Record<string, string | null> = {
    space: "Space",
    esc: "Escape",
    enter: "Enter",
    tab: "Tab",
    capslock: "CapsLock",
    win: "MetaLeft",
    // No standard KeyboardEvent.code exists for Fn (it rarely fires a browser
    // event), but a sentinel lets it respond to hover/mouse like every other key.
    fn: "Fn",
    del: "Delete",
    home: "Home",
    end: "End",
    prtsc: "PrintScreen",
    pause: "Pause",
    // multi-word legends (sanitized: space → "_")
    "back space": "Backspace",
    back_space: "Backspace",
    backspace: "Backspace",
    "shift left": "ShiftLeft",
    shift_left: "ShiftLeft",
    "shift right": "ShiftRight",
    shift_right: "ShiftRight",
    "ctrl left": "ControlLeft",
    ctrl_left: "ControlLeft",
    "ctrl right": "ControlRight",
    ctrl_right: "ControlRight",
    "alt left": "AltLeft",
    alt_left: "AltLeft",
    "alt right": "AltRight",
    alt_right: "AltRight",
    "page up": "PageUp",
    page_up: "PageUp",
    "page down": "PageDown",
    page_down: "PageDown",
    "up arrow": "ArrowUp",
    up_arrow: "ArrowUp",
    "down arrow": "ArrowDown",
    down_arrow: "ArrowDown",
    "down aroow": "ArrowDown", // typo in the model
    down_aroow: "ArrowDown",
    "left arrow": "ArrowLeft",
    left_arrow: "ArrowLeft",
    "right arrow": "ArrowRight",
    right_arrow: "ArrowRight",
    // symbol legends (sanitized: [ ] . : / stripped → second char remains)
    "[{": "BracketLeft",
    "{": "BracketLeft",
    "]}": "BracketRight",
    "}": "BracketRight",
    ";:": "Semicolon",
    ";": "Semicolon",
    "/?": "Slash",
    "?": "Slash",
    ",<": "Comma",
    ".>": "Period",
    ">": "Period",
    "=+": "Equal",
    "-_": "Minus",
    "\\|": "Backslash",
    "`~": "Backquote",
  };
  return lower in map ? map[lower] : null;
}

type KeyEntry = { code: string; node: THREE.Object3D };

type KeyboardProps = ThreeElements["group"] & {
  /** Enable keydown/keyup + hover key-press animation (intro hero only). */
  interactive?: boolean;
  /** KeyboardEvent.code values to render with an emissive orange glow (skills). */
  emissiveKeys?: string[];
  /** Shared 0→1 ref driving the glow ramp-in (written each frame by the skills scene). */
  glowProgress?: RefObject<number>;
  /** Fired when a glowing key is hovered/tapped — passes its code + world hit point (skills). */
  onHoverGlow?: (code: string | null, point: THREE.Vector3 | null) => void;
};

export function Keyboard({
  interactive = false,
  emissiveKeys,
  glowProgress,
  onHoverGlow,
  ...props
}: KeyboardProps) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH);

  const glowSet = useMemo(() => new Set(emissiveKeys ?? []), [emissiveKeys]);
  const glowActive = glowSet.size > 0;

  const { model, keys, axis, pressDist, glowMats } = useMemo(() => {
    const clone = scene.clone(true);
    const glow = new Set(emissiveKeys ?? []);

    // Strip baked lights + cameras so our Canvas lighting wins.
    const strip: THREE.Object3D[] = [];
    clone.traverse((o) => {
      const x = o as THREE.Object3D & { isLight?: boolean; isCamera?: boolean };
      if (x.isLight || x.isCamera) strip.push(o);
    });
    strip.forEach((o) => o.parent?.remove(o));

    // Collect pressable key groups (named by legend → mapped to a code).
    const keyEntries: KeyEntry[] = [];
    clone.traverse((o) => {
      const code = legendToCode(o.name);
      if (code) keyEntries.push({ code, node: o });
    });

    // Glow keycap materials, collected so the skills scene can ramp them in.
    const glowMats: { code: string; mat: THREE.MeshStandardMaterial }[] = [];

    // Color each mesh by role: legend / keycap / accent / case.
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const parentCode = legendToCode(o.parent?.name);
      const isLegend = /text/i.test(o.name);

      let color = CASE;
      let isGlow = false;
      if (parentCode) {
        const isNavy = NAVY_CODES.has(parentCode);
        if (parentCode === "Escape") {
          color = isLegend ? LEGEND_DARK : ACCENT;
        } else if (parentCode === "Space") {
          color = isLegend ? LEGEND_LIGHT : SPACE_COLOR;
        } else if (isNavy) {
          color = isLegend ? LEGEND_LIGHT : NAVY_KEY;
        } else {
          color = isLegend ? LEGEND_DARK : CREAM;
        }
        // Glow keys keep their normal keycap color and gain emissive on top —
        // so they match their neighbors at rest and light up orange as the
        // glow ramps in (instead of reading as black caps before glow).
        if (glow.has(parentCode) && !isLegend) {
          isGlow = true;
        }
      }

      const src = mesh.material as THREE.MeshStandardMaterial;
      const mat = (Array.isArray(src) ? src[0] : src).clone();
      mat.color = new THREE.Color(color);
      // Fully matte caps: roughness 1 + zero metalness = no specular hotspot at
      // all, so scene lights can't make a cap read like the emissive glow keys.
      // Glow is driven by emissive (not reflected light), so F/C/L still light up.
      mat.roughness = 1;
      mat.metalness = 0;
      // Glow keys carry an orange emissive at intensity 0; glowProgress ramps it.
      mat.emissive = new THREE.Color(isGlow ? ACCENT : "#000000");
      mat.emissiveIntensity = 0;
      mesh.material = mat;
      if (isGlow && parentCode) glowMats.push({ code: parentCode, mat });
    });

    clone.updateWorldMatrix(true, true);

    // World bbox → normalization (recenter + scale to TARGET_SIZE).
    const worldBox = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    worldBox.getSize(size);
    worldBox.getCenter(center);
    const wdims = [size.x, size.y, size.z];

    // Local bbox in the key nodes' PARENT space → correct press axis + distance.
    // (Key positions live in a large, scaled-down local space, so a world-derived
    // distance applied to node.position would be invisible.)
    const parent = keyEntries[0]?.node.parent ?? clone;
    const invParent = parent.matrixWorld.clone().invert();
    const localBox = new THREE.Box3();
    const gb = new THREE.Box3();
    const m = new THREE.Matrix4();
    parent.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      gb.copy(mesh.geometry.boundingBox as THREE.Box3);
      m.multiplyMatrices(invParent, mesh.matrixWorld);
      gb.applyMatrix4(m);
      localBox.union(gb);
    });
    const lsize = new THREE.Vector3();
    localBox.getSize(lsize);
    const ldims = [lsize.x, lsize.y, lsize.z];
    const thinAxis = ldims.indexOf(Math.min(...ldims)) as 0 | 1 | 2;
    const pressDist = (ldims[thinAxis] || 1) * PRESS_FRACTION;

    // Normalize: recenter to origin and scale to TARGET_SIZE.
    clone.position.sub(center);
    const wrapper = new THREE.Group();
    wrapper.add(clone);
    wrapper.scale.setScalar(TARGET_SIZE / (Math.max(...wdims) || 1));

    return { model: wrapper, keys: keyEntries, axis: thinAxis, pressDist, glowMats };
  }, [scene, emissiveKeys]);

  const pressed = useRef<Set<string>>(new Set());
  // Committed hover (drives press + glow). Switches only via the dwell gate.
  const hovered = useRef<string | null>(null);
  const hoveredGlow = useRef<string | null>(null);
  // Candidate hover from the raycast + when it was first seen. The dwell gate
  // in useFrame promotes candidate → committed once it's stable.
  const pendingCode = useRef<string | null>(null);
  const pendingPoint = useRef<THREE.Vector3 | null>(null);
  const pendingAt = useRef(0); // performance.now() of the pending change; 0 = settled

  const findCode = (obj: THREE.Object3D): string | null => {
    let o: THREE.Object3D | null = obj;
    while (o) {
      const code = legendToCode(o.name);
      if (code) return code;
      o = o.parent;
    }
    return null;
  };

  const reportGlow = (code: string | null, point: THREE.Vector3 | null) => {
    const glowCode = code && glowSet.has(code) ? code : null;
    hoveredGlow.current = glowCode;
    onHoverGlow?.(glowCode, glowCode ? point : null);
    if (typeof document !== "undefined") {
      document.body.style.cursor = glowCode ? "pointer" : "auto";
    }
  };

  useEffect(() => {
    if (!interactive) return;
    const down = (e: KeyboardEvent) => pressed.current.add(e.code);
    const up = (e: KeyboardEvent) => pressed.current.delete(e.code);
    // Alt+Tab (or any focus loss) steals the keyup, so the key would stay stuck
    // down — clear everything when the window loses focus.
    const clear = () => pressed.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [interactive]);

  useFrame((_, dt) => {
    // Dwell gate: commit the candidate hover only after it's stayed resolved for
    // HOVER_DWELL_MS. Two-cap boundary flicker keeps resetting pendingAt, so the
    // committed key never oscillates — it switches only when the cursor settles.
    if (pendingAt.current && pendingCode.current !== hovered.current) {
      if (performance.now() - pendingAt.current >= HOVER_DWELL_MS) {
        hovered.current = pendingCode.current;
        if (glowActive) reportGlow(pendingCode.current, pendingPoint.current);
        pendingAt.current = 0;
      }
    }

    const an = (["x", "y", "z"] as const)[axis];
    for (const { code, node } of keys) {
      const active =
        interactive && (pressed.current.has(code) || hovered.current === code);
      const cur = THREE.MathUtils.damp(
        (node.userData.press as number) ?? 0,
        active ? 1 : 0,
        14,
        dt,
      );
      node.userData.press = cur;
      node.position[an] = PRESS_SIGN * pressDist * cur;
    }

    // Ramp the skill keys' glow with the shared progress; boost the hovered one.
    if (glowProgress) {
      const base = glowProgress.current * GLOW_MAX;
      for (const { code, mat } of glowMats) {
        mat.emissiveIntensity = base * (hoveredGlow.current === code ? 1.4 : 1);
      }
    }
  });

  // Feed the dwell gate. Latch to the committed key when it's still under the
  // cursor; otherwise take the closest hit as the new candidate.
  const setCandidate = (code: string | null, point: THREE.Vector3 | null) => {
    if (code === hovered.current) {
      // Already committed here — cancel any in-flight switch.
      pendingCode.current = code;
      pendingPoint.current = point;
      pendingAt.current = 0;
      return;
    }
    if (code !== pendingCode.current) {
      pendingCode.current = code;
      pendingAt.current = performance.now();
    }
    pendingPoint.current = point;
  };

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const committed = hovered.current;
    const stillOnCommitted =
      committed != null && e.intersections.some((i) => findCode(i.object) === committed);
    const code = stillOnCommitted
      ? committed
      : findCode(e.intersections[0]?.object ?? e.object);
    setCandidate(code, e.point.clone());
  };

  const handleOut = () => setCandidate(null, null);

  return (
    <primitive
      object={model}
      {...props}
      onPointerMove={interactive || glowActive ? handleMove : undefined}
      onPointerOut={interactive || glowActive ? handleOut : undefined}
      onPointerDown={
        glowActive
          ? (e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              const obj = e.intersections[0]?.object ?? e.object;
              reportGlow(findCode(obj), e.point.clone());
            }
          : undefined
      }
    />
  );
}

useGLTF.preload(MODEL_URL, DRACO_PATH);
