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

// Three glowing keys (F / L / C), each revealing a role panel on hover or
// physical key press.
export const GLOW_SKILLS: SkillDatum[] = [
  {
    code: "KeyF",
    key: "F",
    title: "Front-end Developing",
    detail:
      "Production interfaces in React & Next.js — typed, accessible, and fast, considered down to the last frame.",
    highlights: [
      "Design systems & reusable component libraries",
      "Accessibility, semantic HTML & keyboard support",
      "Performance budgets & Core Web Vitals",
      "Type-safe data flow end to end",
    ],
    tools: ["React", "Next.js", "TypeScript", "Tailwind"],
  },
  {
    code: "KeyL",
    key: "L",
    title: "LLM Engineering",
    detail:
      "Building with large language models — from prompt and context design to retrieval and agentic tools.",
    highlights: [
      "Prompt & context engineering",
      "RAG & vector search",
      "Agentic tool-calling workflows",
      "Evals, guardrails & monitoring",
    ],
    tools: ["Claude", "Vercel AI SDK", "Python", "Embeddings"],
  },
  {
    code: "KeyC",
    key: "C",
    title: "Creative Development",
    detail:
      "Interactive 3D and motion on the web — shaders, scroll-driven scenes, and real-time interaction.",
    highlights: [
      "React Three Fiber & WebGL scenes",
      "GLSL shaders & post-processing",
      "Scroll-driven & physics motion",
      "Real-time pointer interaction",
    ],
    tools: ["Three.js", "R3F", "GLSL", "Spline"],
  },
];
