export type SkillDatum = {
  /** KeyboardEvent.code of the keycap that glows + reveals this skill. */
  code: string;
  /** The keycap letter, shown in the panel header. */
  key: string;
  title: string;
  detail: string;
  /** Short capability bullets shown in the panel body. */
  highlights: string[];
  tools: string[];
};

// Three glowing keys (F / A / C), each revealing a role panel on hover or
// physical key press.
export const GLOW_SKILLS: SkillDatum[] = [
  {
    code: "KeyF",
    key: "F",
    title: "Front-End Development",
    detail:
      "Production interfaces in React & Next.js — responsive, accessible, and fast, built down to the last interaction.",
    highlights: [
      "Reusable component systems with MUI & Tailwind",
      "Responsive, cross-browser layouts",
      "State with Redux & modern hooks",
      "Performance & UX optimization",
    ],
    tools: ["React.js", "Next.js", "Redux", "Tailwind"],
  },
  {
    code: "KeyA",
    key: "A",
    title: "Automation & Integration",
    detail:
      "Designing scalable, intelligent workflows in n8n — wiring APIs, AI agents, and data sources into systems that run themselves.",
    highlights: [
      "Complex n8n workflow design",
      "AI agents & SERP-driven research",
      "Web scraping & lead generation",
      "API integration & MongoDB pipelines",
    ],
    tools: ["n8n", "AI Agents", "SERP API", "MongoDB"],
  },
  {
    code: "KeyC",
    key: "C",
    title: "Creative Development",
    detail:
      "Interactive, motion-rich web — scroll-driven scenes and real-time 3D, like the keyboard you're looking at.",
    highlights: [
      "React Three Fiber & WebGL scenes",
      "Scroll-driven motion & interaction",
      "Framer Motion & GSAP animation",
      "Real-time pointer interaction",
    ],
    tools: ["Three.js", "R3F", "Framer Motion", "GSAP"],
  },
];
