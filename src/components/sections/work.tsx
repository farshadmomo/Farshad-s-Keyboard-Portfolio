"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionLabel } from "@/components/ui/section-label";

type Project = {
  n: string;
  title: string;
  category: string;
  year: string;
  blurb: string;
  tags: string[];
  href: string;
  /** Section screenshots; the active card cross-fades through them on hover.
      Live-site projects only — automation projects use a ghosted-number tile. */
  images?: string[];
};

export const PROJECTS: Project[] = [
  {
    n: "01",
    title: "4Gardens",
    category: "Creative / E-commerce",
    year: "2026",
    blurb:
      "Brand & store for a luxury fragrance house — eight sculptural “sphere & cube” compositions presented in a scroll-driven, gallery-style showcase.",
    tags: ["Next.js", "Framer Motion", "E-commerce"],
    href: "https://4-gardens.vercel.app/",
    images: [
      "/projects/4-gardens/01.jpg",
      "/projects/4-gardens/02.jpg",
      "/projects/4-gardens/03.jpg",
      "/projects/4-gardens/04.jpg",
    ],
  },
  {
    n: "02",
    title: "mroom",
    category: "Creative / E-commerce",
    year: "2026",
    blurb:
      "Studio site for handmade designer lamps — pleated “Samurai” cones and glowing “Mochi” mushrooms, with a build-your-lamp configurator and a night-mode mood toggle.",
    tags: ["Next.js", "Three.js", "E-commerce"],
    href: "https://mroom.vercel.app/",
    images: [
      "/projects/mroom/01.jpg",
      "/projects/mroom/02.jpg",
      "/projects/mroom/03.jpg",
      "/projects/mroom/04.jpg",
    ],
  },
  {
    n: "03",
    title: "boos. station",
    category: "Creative / Brand",
    year: "2026",
    blurb:
      "Playful Tehran streetwear brand — drops “modeled” by cardboard celebrity heads, with reels, a lookbook, and a motion-heavy, bilingual hero.",
    tags: ["Next.js", "Framer Motion", "Streetwear"],
    href: "https://boos-station.vercel.app/",
    images: [
      "/projects/boos-station/01.jpg",
      "/projects/boos-station/02.jpg",
      "/projects/boos-station/03.jpg",
      "/projects/boos-station/04.jpg",
    ],
  },
  {
    n: "04",
    title: "tttamoom",
    category: "Creative / E-commerce",
    year: "2026",
    blurb:
      "Made-to-order framed minifig art — a LEGO minifig of your favorite character boxed with eight tiles of their world. Bilingual EN/FA, built by hand.",
    tags: ["Next.js", "Framer Motion", "E-commerce"],
    href: "https://tttamoom.vercel.app/",
    images: [
      "/projects/tttamoom/01.jpg",
      "/projects/tttamoom/02.jpg",
      "/projects/tttamoom/03.jpg",
      "/projects/tttamoom/04.jpg",
    ],
  },
  {
    n: "05",
    title: "PatchMood",
    category: "Creative / E-commerce",
    year: "2026",
    blurb:
      "A brutalist “mood archive” store — bilingual catalog with category filtering, product pages, and showroom locations, in a design-forward, image-heavy layout.",
    tags: ["Next.js", "E-commerce", "Brutalist"],
    href: "https://patchmood-website.vercel.app/",
    images: [
      "/projects/patchmood/01.jpg",
      "/projects/patchmood/02.jpg",
      "/projects/patchmood/03.jpg",
      "/projects/patchmood/04.jpg",
    ],
  },
  {
    n: "06",
    title: "Molana Repair Shop",
    category: "Front-end / Web App",
    year: "2025",
    blurb:
      "Automotive diagnostics web app — drivers enter vehicle details for troubleshooting analysis, with engine sound checks, foreign-car diagnostics, and a full repair guide.",
    tags: ["React.js", "Next.js", "Web App"],
    href: "https://molana-repair-and-fix-shop.vercel.app/",
    images: [
      "/projects/molana/01.jpg",
      "/projects/molana/02.jpg",
      "/projects/molana/03.jpg",
    ],
  },
  {
    n: "07",
    title: "Lead Generator Automation",
    category: "Automation / n8n",
    year: "2025",
    blurb:
      "Intelligent system that finds, enriches, and auto-categorizes sales leads from across the web — keyword + geo search, validation, and structured storage ready for outreach.",
    tags: ["n8n", "Web Scraping", "MongoDB"],
    href: "https://github.com/farshadmomo",
  },
  {
    n: "08",
    title: "Indent Info Finder",
    category: "Automation / AI",
    year: "2025",
    blurb:
      "Automates product research, pricing, and purchase kickoff from Indent orders — removing manual entry and keeping supplier follow-up timely and accurate.",
    tags: ["n8n", "AI Agents", "SERP API"],
    href: "https://github.com/farshadmomo",
  },
  {
    n: "09",
    title: "Telegram Bot Admin Panel",
    category: "Automation / Tooling",
    year: "2024",
    blurb:
      "Reusable, user-friendly panel for managing and configuring Telegram bots — turning complex database and API interactions into one focused interface.",
    tags: ["n8n", "Telegram", "MongoDB"],
    href: "https://github.com/farshadmomo",
  },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Media for one card. Only the active card cycles (on hover); others show the
// first shot. Automation projects (no images) get a ghosted-number tile.
function CardMedia({
  project,
  cycling,
}: {
  project: Project;
  cycling: boolean;
}) {
  const { images, n, category } = project;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!cycling || !images || images.length < 2) {
      setIdx(0);
      return;
    }
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 1100);
    return () => clearInterval(t);
  }, [cycling, images]);

  if (!images) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_120%_at_50%_-10%,#222a38,#11141b)]">
        <span
          aria-hidden
          className="select-none font-archivo text-[200px] leading-none text-white/[0.05]"
        >
          {n}
        </span>
        <span className="absolute left-5 top-4 font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim">
          // {category.split(" / ")[0]}
        </span>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 bg-bg-elev">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={`${project.title} — screenshot ${i + 1}`}
          loading="lazy"
          draggable={false}
          style={{ opacity: i === idx ? 1 : 0 }}
          className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ease-out"
        />
      ))}
    </div>
  );
}

// One coverflow slide. `delta` is the wrapped distance from the active index;
// transforms (GPU only) angle neighbours back like keycaps on a slant.
function Slide({
  project,
  delta,
  hovered,
  reduce,
  onSelect,
}: {
  project: Project;
  delta: number;
  hovered: boolean;
  reduce: boolean | null;
  onSelect: () => void;
}) {
  const abs = Math.abs(delta);
  const isActive = delta === 0;
  const visible = abs <= 2;
  const external = project.href.startsWith("http");

  const scale = abs === 0 ? 1 : abs === 1 ? 0.82 : 0.66;
  const transform = `translate(-50%, -50%) translateX(${delta * 58}%) rotateY(${
    delta * -38
  }deg) scale(${scale})`;

  return (
    <div
      aria-hidden={!isActive}
      style={{
        transform,
        opacity: abs === 0 ? 1 : abs === 1 ? 0.55 : 0,
        zIndex: 30 - abs * 10,
        pointerEvents: visible ? "auto" : "none",
        filter: isActive ? "none" : "brightness(0.55)",
        transition: reduce
          ? "none"
          : "transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease, filter 0.5s ease",
      }}
      className="absolute left-1/2 top-1/2 aspect-[16/10] h-[90%] max-w-[94%] [transform-style:preserve-3d]"
    >
      <div
        style={{ boxShadow: "0 30px 55px -18px rgba(0,0,0,0.6)" }}
        className={`relative h-full w-full overflow-hidden border bg-bg-elev transition-colors duration-300 ${
          isActive ? "border-accent/50" : "border-border"
        }`}
      >
        <CardMedia project={project} cycling={isActive && hovered && !reduce} />

        {/* Active overlay: full metadata. Neighbours: a quiet bottom label. */}
        {isActive ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex flex-col gap-2.5 bg-gradient-to-t from-black/92 via-black/55 to-transparent px-6 pb-5 pt-16">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tabular-nums text-accent">
                {project.n}
              </span>
              <span aria-hidden className="h-px flex-1 bg-white/15" />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
                {project.category}
              </span>
            </div>
            <h3 className="font-archivo text-[clamp(1.3rem,2.3vw,1.9rem)] leading-[1.05] tracking-[-0.02em] text-white">
              {project.title}
            </h3>
            <p className="max-w-[54ch] font-sans text-[12.5px] leading-relaxed text-white/75">
              {project.blurb}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="border border-white/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/75"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
                {external ? "Visit site" : "View on GitHub"}
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M4 10 10 4M5 4h5v5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10">
            <span className="font-sans text-[14px] font-semibold text-white/85">
              {project.title}
            </span>
          </div>
        )}

        {/* Interaction layer. Active = link to the project; neighbours = focus. */}
        {isActive ? (
          <a
            href={project.href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            aria-label={`Visit ${project.title} (${project.category})`}
            className="absolute inset-0 z-10"
          />
        ) : (
          <button
            type="button"
            tabIndex={visible ? 0 : -1}
            onClick={onSelect}
            aria-label={`Show ${project.title}`}
            className="absolute inset-0 z-10 cursor-pointer"
          />
        )}
      </div>
    </div>
  );
}

function ProjectCarousel() {
  const reduce = useReducedMotion();
  const n = PROJECTS.length;
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const paused = useRef(false);

  const go = useCallback((dir: number) => setActive((a) => (a + dir + n) % n), [n]);
  // Shortest signed distance i→active on the ring, so slide 0 can sit just past
  // slide 8 (the carousel wraps both ways).
  const wrap = (d: number) => (d > n / 2 ? d - n : d < -n / 2 ? d + n : d);

  // Autoplay: advances every 5.5s, paused while the user hovers, focuses, or
  // drags. Off entirely for reduced-motion users (they drive it manually).
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      if (!paused.current) setActive((a) => (a + 1) % n);
    }, 5500);
    return () => clearInterval(t);
  }, [reduce, n]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  const pause = () => {
    paused.current = true;
    setHovered(true);
  };
  const resume = () => {
    paused.current = false;
    setHovered(false);
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Selected projects"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className="pointer-events-auto flex flex-col gap-5 outline-none"
    >
      {/* Stage */}
      <div className="relative" style={{ perspective: 1600 }}>
        <motion.div
          className="relative h-[clamp(260px,50vh,480px)] w-full [transform-style:preserve-3d]"
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragStart={() => (paused.current = true)}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60 || info.velocity.x < -400) go(1);
            else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
          }}
        >
          {PROJECTS.map((p, i) => (
            <Slide
              key={p.n}
              project={p}
              delta={wrap(i - active)}
              hovered={hovered}
              reduce={reduce}
              onSelect={() => setActive(i)}
            />
          ))}
        </motion.div>

        {/* Edge arrows (keycap-styled) */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous project"
          className="group absolute left-0 top-1/2 z-40 grid size-11 -translate-y-1/2 place-items-center border border-border bg-bg-elev/80 text-fg-muted shadow-[0_3px_0_var(--color-border)] backdrop-blur-sm transition-all duration-150 hover:border-accent/60 hover:text-accent active:translate-y-[calc(-50%+2px)] active:shadow-none"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next project"
          className="group absolute right-0 top-1/2 z-40 grid size-11 -translate-y-1/2 place-items-center border border-border bg-bg-elev/80 text-fg-muted shadow-[0_3px_0_var(--color-border)] backdrop-blur-sm transition-all duration-150 hover:border-accent/60 hover:text-accent active:translate-y-[calc(-50%+2px)] active:shadow-none"
        >
          <Chevron dir="right" />
        </button>
      </div>

      {/* Keycap index rail — press a key to jump to that project */}
      <div className="relative z-50 flex items-center justify-center gap-1.5">
        {PROJECTS.map((p, i) => {
          const on = i === active;
          return (
            <button
              key={p.n}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${p.title}`}
              aria-current={on}
              className={`grid h-8 w-8 place-items-center rounded-[3px] border font-mono text-[10px] tabular-nums transition-all duration-150 ${
                on
                  ? "translate-y-px border-accent bg-accent text-bg shadow-[inset_0_-2px_0_rgba(0,0,0,0.28)]"
                  : "border-border bg-bg-elev text-fg-dim shadow-[0_2px_0_var(--color-border)] hover:border-accent/50 hover:text-fg"
              }`}
            >
              {p.n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Section 03 — Work. A 3D coverflow carousel of projects composited over the
// keyboard's faint backdrop pose. Lives inside <Scroll html>, so it opts back
// into pointer events for drag / click / hover.
export function Work() {
  return (
    <div id="work" className="relative h-full w-full overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1240px] flex-col justify-center gap-6 px-8 pb-12 pt-28">
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <SectionLabel index="03" label="Work" />
            <h2 className="text-balance font-archivo text-[clamp(1.7rem,4vw,2.9rem)] leading-[0.95] tracking-[-0.03em] text-fg">
              Selected <span className="text-accent">projects</span>
            </h2>
          </div>
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.15em] text-fg-dim md:block">
            Drag · arrows · keys
          </p>
        </div>

        <ProjectCarousel />
      </div>
    </div>
  );
}
