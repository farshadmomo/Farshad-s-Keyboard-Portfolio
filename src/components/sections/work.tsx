import { SectionLabel } from "@/components/ui/section-label";

type Project = {
  n: string;
  title: string;
  category: string;
  year: string;
  blurb: string;
  tags: string[];
  href: string;
};

export const PROJECTS: Project[] = [
  {
    n: "01",
    title: "Lead Generator Automation",
    category: "Automation / n8n",
    year: "2025",
    blurb:
      "Intelligent system that finds, enriches, and auto-categorizes sales leads from across the web — keyword + geo search, validation, and structured storage ready for outreach.",
    tags: ["n8n", "Web Scraping", "MongoDB"],
    href: "https://github.com/farshadmomo",
  },
  {
    n: "02",
    title: "Indent Info Finder",
    category: "Automation / AI",
    year: "2025",
    blurb:
      "Automates product research, pricing, and purchase kickoff from Indent orders — removing manual entry and keeping supplier follow-up timely and accurate.",
    tags: ["n8n", "AI Agents", "SERP API"],
    href: "https://github.com/farshadmomo",
  },
  {
    n: "03",
    title: "Telegram Bot Admin Panel",
    category: "Automation / Tooling",
    year: "2024",
    blurb:
      "Reusable, user-friendly panel for managing and configuring Telegram bots — turning complex database and API interactions into one focused interface.",
    tags: ["n8n", "Telegram", "MongoDB"],
    href: "https://github.com/farshadmomo",
  },
  {
    n: "04",
    title: "Kanzhook Studio",
    category: "Front-end / E-commerce",
    year: "2023",
    blurb:
      "Full e-commerce site for a clothing brand, idea to deployment — React + MUI front end, Node.js + MongoDB back end, accounts and checkout.",
    tags: ["React.js", "MUI", "Node.js"],
    href: "https://github.com/farshadmomo",
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
  },
];

function Arrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="shrink-0 text-fg-dim transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
    >
      <path
        d="M3 7h8M7.5 3.5 11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectCard({ n, title, category, year, blurb, tags, href }: Project) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group pointer-events-auto flex flex-col gap-2.5 border border-border bg-bg-elev/70 p-5 backdrop-blur-sm transition-colors duration-200 hover:border-accent/60 hover:bg-bg-elev/90"
    >
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.15em]">
        <span className="text-accent">{n}</span>
        <span className="text-fg-dim">{year}</span>
      </div>

      <div className="mt-1 flex items-start justify-between gap-3">
        <h3 className="font-sans text-[18px] font-medium leading-tight text-fg">
          {title}
        </h3>
        <Arrow />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
        {category}
      </p>

      <p className="font-sans text-[13px] leading-relaxed text-fg-muted">{blurb}</p>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {tags.map((t) => (
          <span
            key={t}
            className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim"
          >
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}

// Section 03 — Work. DOM-only 3×2 grid composited over the keyboard's faint
// backdrop pose. Lives inside <Scroll html>, so cards opt back into pointer
// events for their hover/click.
export function Work() {
  return (
    <div id="work" className="relative h-full w-full overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1280px] flex-col justify-center gap-8 px-8">
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-4">
            <SectionLabel index="03" label="Work" />
            <h2 className="font-sans text-[36px] font-normal leading-[1.0] tracking-[-0.02em] text-fg sm:text-[48px]">
              Selected projects
            </h2>
          </div>
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.15em] text-fg-dim md:block">
            Automation & front-end
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.n} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}
