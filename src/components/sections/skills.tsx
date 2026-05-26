export const SKILL_LISTS: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["TypeScript", "JavaScript", "HTML & CSS", "GLSL", "Python"] },
  { label: "Frameworks", items: ["React", "Next.js", "Three.js", "R3F", "Tailwind"] },
  { label: "Tools", items: ["Figma", "Spline", "Blender", "Git", "Vercel"] },
  { label: "Roles", items: ["UI Engineering", "Product Design", "Creative Dev", "Design Systems"] },
];

// Desktop/tablet skills section is intentionally (near) empty DOM: the skills
// info now lives only in the hover panels over the glowing F/C/L keys. The
// section keeps its #skills anchor + 02 label and a hover hint; the keyboard
// (behind, in the canvas) carries the content. Mobile uses SKILL_LISTS via
// mobile-experience instead.
export function Skills() {
  return (
    <div id="skills" className="relative h-full w-full overflow-hidden">
      <div className="absolute left-8 top-24">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.15em]">
          <span className="text-accent">02</span>
          <span aria-hidden className="text-fg-dim">———————</span>
          <span className="text-fg-muted">Skills</span>
        </div>
      </div>

      <p className="absolute bottom-8 left-8 font-mono text-[11px] uppercase tracking-[0.15em] text-fg-dim">
        Hover the glowing keys
      </p>
    </div>
  );
}
