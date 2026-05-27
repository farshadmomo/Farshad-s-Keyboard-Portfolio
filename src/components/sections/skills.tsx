export const SKILL_LISTS: { label: string; items: string[] }[] = [
  { label: "Front-End", items: ["React.js", "Next.js", "Redux", "JavaScript (ES6+)", "HTML5 & CSS3"] },
  { label: "Automation", items: ["n8n", "AI Agents", "Web Scraping", "SERP API", "API Integration"] },
  { label: "Backend & Data", items: ["Node.js", "MongoDB", "Oracle", "Google Sheets"] },
  { label: "Tools", items: ["Git & GitHub", "Docker", "Kubernetes", "MUI", "Tailwind CSS"] },
];

// Desktop/tablet skills section is intentionally (near) empty DOM: the skills
// info now lives only in the hover panels over the glowing F/A/C keys. The
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
    </div>
  );
}
