import { SectionLabel } from "@/components/ui/section-label";

type Role = {
  period: string;
  org: string;
  role: string;
  points: string[];
};

export const EXPERIENCE: Role[] = [
  {
    period: "2025 — Present",
    org: "Self-Directed",
    role: "LLM Engineering & Vibe Coding",
    points: [
      "Building AI-first by driving Claude Code and agentic tooling — prompting, iterating, and shipping at the speed of thought.",
      "Studying LLM engineering hands-on: prompt design, agent orchestration, and wiring models into real product workflows.",
    ],
  },
  {
    period: "2024 — Present",
    org: "Independent",
    role: "Automation Developer",
    points: [
      "Designing scalable n8n workflow systems — lead generation, AI-agent research, and Telegram bot tooling.",
      "Wiring APIs, web scraping, and MongoDB pipelines into automations that remove manual work.",
    ],
  },
  {
    period: "2023",
    org: "Saipa — Tehran, Iran",
    role: "Front-End Development Intern",
    points: [
      "Built responsive React.js + Material UI interfaces for a Torque System and a Quality Control System alongside the back-end team (.NET Core, Oracle).",
      "Joined 12 team sessions on Next.js, Docker, Kubernetes & design patterns; drove debugging and cross-browser performance.",
    ],
  },
  {
    period: "2022 — 2023",
    org: "Kanzhook Studio",
    role: "Freelance Front-End Developer",
    points: [
      "Shipped a clothing-brand e-commerce site end to end — React.js + MUI front end, Node.js + MongoDB back end, accounts and checkout.",
      "Owned speed, responsiveness, and cross-browser support under a full-stack lead.",
    ],
  },
  {
    period: "2024",
    org: "Private Tutor",
    role: "HTML, CSS & JavaScript Instructor",
    points: [
      "Taught web fundamentals from beginner to intermediate, guiding students through hands-on projects and code reviews.",
    ],
  },
];

// Section 04 — Experience. DOM-only career timeline composited over the
// keyboard's low backdrop pose (shared with Work). Lives inside <Scroll html>.
export function Experience() {
  return (
    <div id="experience" className="relative h-full w-full overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1280px] flex-col justify-center gap-8 px-8">
        <div className="flex flex-col gap-4">
          <SectionLabel index="04" label="Experience" />
          <h2 className="font-sans text-[36px] font-normal leading-[1.0] tracking-[-0.02em] text-fg sm:text-[48px]">
            Where I&rsquo;ve worked
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {EXPERIENCE.map(({ period, org, role, points }) => (
            <div
              key={role}
              className="grid grid-cols-1 gap-2 border border-border bg-bg-elev/70 p-4 backdrop-blur-md transition-colors duration-200 hover:border-accent/40 md:grid-cols-[170px_1fr] md:gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent">
                  {period}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
                  {org}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-sans text-[18px] font-medium leading-tight text-fg">
                  {role}
                </h3>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
