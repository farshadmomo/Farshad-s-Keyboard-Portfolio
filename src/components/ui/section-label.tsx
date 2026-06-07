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
        "flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em]",
        className,
      )}
    >
      <span className="text-[13px] font-semibold tabular-nums tracking-[0.1em] text-accent">
        {index}
      </span>
      <span
        aria-hidden
        className="h-px w-9 bg-gradient-to-r from-fg-dim to-transparent"
      />
      <span className="text-fg-muted">{label}</span>
    </div>
  );
}
