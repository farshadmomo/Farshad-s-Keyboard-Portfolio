import { cn } from "@/lib/utils";

export function SectionLabel({
  index,
  label,
  className,
}: {
  index: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.15em]",
        className,
      )}
    >
      <span className="text-accent">{index}</span>
      <span aria-hidden className="text-fg-dim">
        ———————
      </span>
      <span className="text-fg-muted">{label}</span>
    </div>
  );
}
