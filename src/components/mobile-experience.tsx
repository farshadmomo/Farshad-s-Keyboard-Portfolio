"use client";

import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { SKILL_LISTS } from "@/components/sections/skills";
import { GLOW_SKILLS } from "@/lib/skills-data";

// Mobile (<768px) DOM blocks that ride inside <Scroll html> over the
// scroll-driven 3D keyboard. No interactivity: the keyboard just rotates on
// scroll, settles at the skills pose, then lifts up so this skills content
// scrolls into view beneath it.

// First screen: hero copy pinned to the bottom so the keyboard (centered,
// behind) reads above it.
export function MobileHero() {
  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 px-6 pb-12">
      <SectionLabel index="01" label="Intro" />
      <h1 className="font-sans text-[36px] font-normal leading-[0.95] tracking-[-0.02em] text-fg">
        Designing thoughtful digital systems
      </h1>
      <p className="font-mono text-[12px] tracking-wide text-fg-muted">
        UI engineer / product designer / creative developer
      </p>
      <div className="pointer-events-auto">
        <Button href="#mskills">View Work</Button>
      </div>
    </div>
  );
}

// Last screen: full skills content, revealed below the settled keyboard.
export function MobileSkills() {
  return (
    <div id="mskills" className="flex min-h-[100svh] flex-col gap-8 px-6 pb-24 pt-10">
      <SectionLabel index="02" label="Skills" />
      <h2 className="font-sans text-[30px] font-normal leading-[1.0] tracking-[-0.02em] text-fg">
        Engineering elegant experiences
      </h2>

      <div className="flex flex-col gap-3">
        {GLOW_SKILLS.map((s) => (
          <div key={s.code} className="border border-border bg-bg-elev/60 px-4 py-3">
            <p className="font-sans text-[15px] font-medium text-fg">{s.title}</p>
            <p className="mt-1 font-sans text-[13px] leading-relaxed text-fg-muted">
              {s.detail}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {s.tools.map((t) => (
                <span
                  key={t}
                  className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-8">
        {SKILL_LISTS.map(({ label, items }) => (
          <div key={label} className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg-muted">
              {label}
            </span>
            <ul className="flex flex-col gap-1.5 font-sans text-[14px] text-fg">
              {items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
