"use client";

import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { SKILL_LISTS } from "@/components/sections/skills";
import { PROJECTS } from "@/components/sections/work";
import { EXPERIENCE } from "@/components/sections/experience";
import { GLOW_SKILLS } from "@/lib/skills-data";
import { Footer } from "@/components/footer";

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
      <h1 className="text-balance font-archivo text-[clamp(2.25rem,11vw,3rem)] leading-[0.95] tracking-[-0.03em] text-fg">
        Designing <span className="text-accent">thoughtful</span> digital systems
      </h1>
      <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-fg-muted">
        Automation developer <span className="text-accent">/</span> front-end engineer
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
    <div id="mskills" className="flex min-h-[100svh] flex-col gap-8 px-6 pb-24 pt-24">
      <SectionLabel index="02" label="Skills" />
      <h2 className="text-balance font-archivo text-[clamp(1.9rem,8vw,2.5rem)] leading-[1.0] tracking-[-0.03em] text-fg">
        Engineering <span className="text-accent">elegant</span> experiences
      </h2>

      <div className="flex flex-col gap-3">
        {GLOW_SKILLS.map((s) => (
          <div
            key={s.code}
            className="border border-border bg-bg-elev/70 px-4 py-3 backdrop-blur-md"
          >
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
          <div
            key={label}
            className="flex flex-col gap-3 border border-border bg-bg-elev/70 p-4 backdrop-blur-md"
          >
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

const MOBILE_SOCIALS: { label: string; handle: string; href: string }[] = [
  { label: "Email", handle: "momtazfarshad@gmail.com", href: "mailto:momtazfarshad@gmail.com" },
  { label: "GitHub", handle: "@farshadmomo", href: "https://github.com/farshadmomo" },
  { label: "LinkedIn", handle: "in/farshadmomtaz", href: "https://linkedin.com/in/farshadmomtaz" },
  { label: "Phone", handle: "+98 930 214 3477", href: "tel:+989302143477" },
];

const MOBILE_TERMINAL: { cmd: string; out: string }[] = [
  { cmd: "whoami", out: "farshad momtaz" },
  { cmd: "role", out: "automation developer · front-end engineer" },
  { cmd: "status", out: "open for select freelance partnerships" },
];

// Contact screen: terminal block + stacked social links (no 3D).
export function MobileContact() {
  return (
    <div id="mcontact" className="flex min-h-[100svh] flex-col gap-8 px-6 pb-24 pt-24">
      <SectionLabel index="05" label="Contact" />
      <h2 className="text-balance font-archivo text-[clamp(1.9rem,8vw,2.5rem)] leading-[1.0] tracking-[-0.03em] text-fg">
        Let&rsquo;s build something <span className="text-accent">good</span>
      </h2>

      <div className="border border-border bg-bg-elev/60">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <span className="size-2 rounded-full bg-fg-dim/50" aria-hidden />
          <span className="size-2 rounded-full bg-fg-dim/50" aria-hidden />
          <span className="size-2 rounded-full bg-accent/70" aria-hidden />
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim">
            contact — zsh
          </span>
        </div>
        <div className="flex flex-col gap-3 p-4 font-mono text-[12px] leading-relaxed">
          {MOBILE_TERMINAL.map(({ cmd, out }) => (
            <div key={cmd} className="flex flex-col gap-0.5">
              <p className="flex items-center gap-2">
                <span className="text-accent">&gt;</span>
                <span className="text-fg">{cmd}</span>
              </p>
              <p className="pl-4 text-fg-muted">{out}</p>
            </div>
          ))}
        </div>
      </div>

      <ul className="flex flex-col">
        {MOBILE_SOCIALS.map(({ label, handle, href }) => (
          <li key={label}>
            <a
              href={href}
              {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              className="pointer-events-auto flex items-center justify-between gap-4 border-b border-border py-3.5"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg-muted">
                {label}
              </span>
              <span className="font-sans text-[14px] text-fg-muted">{handle}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-2">
        <Footer />
      </div>
    </div>
  );
}

// Experience screen: stacked career timeline.
export function MobileExperience() {
  return (
    <div id="mexperience" className="flex min-h-[100svh] flex-col gap-8 px-6 pb-24 pt-24">
      <SectionLabel index="04" label="Experience" />
      <h2 className="text-balance font-archivo text-[clamp(1.9rem,8vw,2.5rem)] leading-[1.0] tracking-[-0.03em] text-fg">
        Where I&rsquo;ve <span className="text-accent">worked</span>
      </h2>

      <div className="flex flex-col gap-3">
        {EXPERIENCE.map(({ period, org, role, points }) => (
          <div
            key={role}
            className="flex flex-col gap-2 border border-border bg-bg-elev/70 p-4 backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent">
                {period}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
                {org}
              </span>
            </div>
            <h3 className="font-sans text-[16px] font-semibold tracking-[-0.01em] text-fg">{role}</h3>
            <ul className="flex flex-col gap-1.5">
              {points.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-2 font-sans text-[13px] leading-relaxed text-fg-muted"
                >
                  <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// Last screen: the project list.
export function MobileWork() {
  return (
    <div id="mwork" className="flex min-h-[100svh] flex-col gap-8 px-6 pb-24 pt-24">
      <SectionLabel index="03" label="Work" />
      <h2 className="text-balance font-archivo text-[clamp(1.9rem,8vw,2.5rem)] leading-[1.0] tracking-[-0.03em] text-fg">
        Selected <span className="text-accent">projects</span>
      </h2>

      <div className="flex flex-col gap-4">
        {PROJECTS.map((p) => (
          <a
            key={p.n}
            href={p.href}
            {...(p.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
            className="pointer-events-auto flex flex-col gap-2 border border-border bg-bg-elev/70 p-4 backdrop-blur-md"
          >
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.15em]">
              <span className="text-accent">{p.n}</span>
              <span className="text-fg-dim">{p.year}</span>
            </div>
            <h3 className="font-sans text-[17px] font-medium text-fg">{p.title}</h3>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
              {p.category}
            </p>
            <p className="font-sans text-[13px] leading-relaxed text-fg-muted">{p.blurb}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim"
                >
                  {t}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
