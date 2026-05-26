# Portfolio

Personal portfolio site built around a custom 3D keyboard (modeled in Spline, exported to GLB, rendered with React Three Fiber).

## Stack

Next.js 15 · TypeScript · Tailwind v4 · React Three Fiber · drei · Framer Motion · Lenis

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Adding your keyboard GLB

1. **Export from Spline**: `File → Export → glTF`, choose **Binary (.glb)**.
2. **Compress with DRACO** (essential — uncompressed Spline exports are 5–15MB):
   ```bash
   npx gltf-pipeline -i ~/Downloads/keyboard.glb -o public/models/keyboard.glb -d
   ```
3. **Generate the typed component**:
   ```bash
   npx gltfjsx public/models/keyboard.glb --types --transform
   ```
   Move the generated `Keyboard.tsx` into `components/three/keyboard.tsx`.

The component will have typed references to every mesh in your model — useful for making individual keycaps emissive in the skills section.

## Tuning camera angles

Each section has its own `<Canvas>` with a different camera position. Open `components/three/keyboard-canvas.tsx` and tweak the `position` and `fov` values per variant. Start values are in `CLAUDE.md`.

## Conventions

See `CLAUDE.md` for the full design system, file structure, lighting recipe, and constraints.

## Deploy

Push to GitHub, import on Vercel. Node 20+. No env vars required.
