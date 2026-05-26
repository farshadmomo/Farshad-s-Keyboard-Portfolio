# Portfolio Site — Project Guide

## Overview

Personal portfolio for a UI engineer / product designer / creative developer. The defining visual element is a custom 3D keyboard model (built in Spline, exported as GLB) that recurs across sections at different angles and framings. The aesthetic is dark, monochrome, with a single orange accent, and quietly technical (mono-font section labels, terminal-style contact block, numbered sections).

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **3D**: `three` + `@react-three/fiber` + `@react-three/drei` (loads GLTF/GLB directly — no Spline runtime, no watermark)
- **3D post**: `@react-three/postprocessing` (bloom on glowing keycaps)
- **Animation**: Framer Motion (entrance reveals, hover states)
- **Smooth scroll**: Lenis
- **Fonts**: Geist Sans (body/display) + Geist Mono (labels, terminal)
- **Utilities**: `clsx` + `tailwind-merge` (via `cn()` helper)

## File Structure

```
app/
  layout.tsx              # root layout, fonts, Lenis wrapper
  page.tsx                # single-page portfolio; sections composed here
  globals.css             # tailwind import + CSS variables + @theme map
components/
  three/
    keyboard.tsx          # GLTF-loaded keyboard (typed, from gltfjsx)
    keyboard-canvas.tsx   # Canvas + lights + environment + camera variants
  nav.tsx
  sections/
    intro.tsx             # 01 hero — full keyboard, slight angle
    skills.tsx            # 02 close-up — JS/TS/React/Node/AI keys glow
    work.tsx              # 03 project grid over wide low-angle keyboard
    contact.tsx           # 04 terminal-style contact (no 3D)
  ui/
    section-label.tsx
    project-card.tsx
    button.tsx
lib/
  lenis-provider.tsx      # client component, wraps app
  utils.ts                # cn() helper
public/
  models/
    keyboard.glb          # exported from Spline, DRACO-compressed
```

## Spline → GLB Workflow

1. In Spline: **File → Export → glTF**, pick **Binary (.glb)**.
2. DRACO-compress (cuts file size 3–5x, target under 2MB):
   ```bash
   npx gltf-pipeline -i keyboard.glb -o keyboard.glb -d
   ```
3. Save to `public/models/keyboard.glb`.
4. Generate the typed React component:
   ```bash
   npx gltfjsx public/models/keyboard.glb --types --transform
   ```
   Move the generated file into `components/three/keyboard.tsx`. This gives typed access to every mesh — essential for the keycap glow effect in section 02.

## Critical Constraints

### React Three Fiber integration

- Any file importing from `@react-three/fiber` or `@react-three/drei` must start with `"use client"`.
- Preload the GLB once at the module level so all sections share it:
  ```tsx
  import { useGLTF } from "@react-three/drei";
  useGLTF.preload("/models/keyboard.glb");
  ```
- Each section has its own `<Canvas>` with a tuned camera position, but the GLB cache means the model only downloads once.
- Wrap each `<Canvas>` in an IntersectionObserver-driven mount so we don't render WebGL contexts for off-screen sections.

### Performance

- DRACO-compress the GLB (see workflow above).
- `<Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>` — cap pixel ratio on retina screens.
- Use `frameloop="demand"` on static sections (intro, work). Use `frameloop="always"` only where you want ambient rotation (skills).
- Set transparent background on the Canvas (`alpha: true`) so the section's CSS background shows through.

### Lighting recipe (use across all three keyboard canvases)

```tsx
<color attach="background" args={['transparent']} />
<ambientLight intensity={0.15} />
<directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
<Environment preset="warehouse" />     {/* dark moody reflections */}
<pointLight position={[-1.5, 0.5, 1]} intensity={3} color="#ff5b1f" distance={4} />
```

The orange `pointLight` near the esc/F1 corner is what gives the keyboard that subtle warm rim — present in all three reference framings.

### Glowing keycaps (skills section only)

After running `gltfjsx`, you'll have typed refs to every keycap mesh. For the JS, TS, React, Node, AI keycaps:

```tsx
<mesh geometry={nodes.Key_JS.geometry}>
  <meshStandardMaterial
    color="#1a1a1a"
    emissive="#ff5b1f"
    emissiveIntensity={2.5}
    roughness={0.4}
  />
</mesh>
```

Then in the Canvas add post-processing for the glow halo:

```tsx
<EffectComposer>
  <Bloom intensity={0.8} luminanceThreshold={0.6} luminanceSmoothing={0.4} />
</EffectComposer>
```

### Camera positions per section

Each section's `<Canvas camera={{ ... }}>` uses a different position/fov:

- **Intro**: `{ position: [2, 1.5, 3.5], fov: 35 }` — three-quarter, slight top-down
- **Skills**: `{ position: [0, 0.8, 1.8], fov: 30 }` — closer, lower, hero shot of keycaps
- **Work**: `{ position: [0, 0.3, 4.5], fov: 50 }` — low wide angle, keyboard fills bottom

Tune these to match your specific GLB orientation — they're starting points.

## Design System

### Colors (CSS variables in `globals.css`)

```css
:root {
  --bg: #0a0a0a;
  --bg-elev: #141414;
  --fg: #ededed;
  --fg-muted: #8a8a8a;
  --fg-dim: #555555;
  --accent: #ff5b1f;
  --border: #1f1f1f;
}
```

Map into Tailwind v4 via:

```css
@theme inline {
  --color-bg: var(--bg);
  --color-bg-elev: var(--bg-elev);
  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-fg-dim: var(--fg-dim);
  --color-accent: var(--accent);
  --color-border: var(--border);
}
```

### Typography

- Display / body: **Geist Sans**
- Labels, terminal, accents: **Geist Mono**
- Hero headline: ~80–96px, tracking `-0.02em`, weight **400 (NOT bold)** — the lightness is the look
- Body: 16px, leading-relaxed, `--fg-muted`
- Section labels: 11px uppercase, `tracking-[0.15em]`

### Layout

- Max content width: 1280px
- Section padding: 96px vertical (desktop), 64px (mobile)
- Section label pattern: orange index, gray em-dashes, muted uppercase label: `01 ——————— INTRO`

### Motion

- Default ease: `[0.22, 1, 0.36, 1]`
- Section reveals: opacity 0→1 + translateY 20→0, 600ms, staggered 60ms
- No bouncy springs — keep it controlled

## Sections

1. **Intro (01)** — Headline "Designing thoughtful digital systems", subtitle, "View Work" button. Keyboard Canvas occupies right two-thirds. Top-right: "Available For Projects" status card with orange dot.
2. **Skills (02)** — Heading "Engineering elegant experiences", short copy on craft/clarity/performance. Keyboard close-up centered, JS/TS/React/Node/AI keycaps emissive orange with bloom. Right column: Languages / Frameworks / Tools / Roles lists.
3. **Work (03)** — Heading "Selected projects", 3×2 card grid composited over a wide low-angle keyboard Canvas (keyboard at low z-index, cards above).
4. **Contact (04)** — Pure CSS section, no 3D. Terminal block with `>` prompts. Right column: social links.

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm gltf` → alias for `npx gltfjsx public/models/keyboard.glb --types --transform`

## Don't

- Don't add a light mode.
- Don't introduce a second accent color. Orange is the only color outside grayscale.
- Don't make the headline bold — weight 400 is deliberate.
- Don't render `<Canvas>` server-side — every R3F file is `"use client"`.
- Don't load the GLB more than once — `useGLTF.preload()` and rely on the cache.
- Don't ship without DRACO-compressing the GLB.
