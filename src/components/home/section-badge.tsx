import { cn } from "@/lib/utils";

export function SectionBadge({
  children,
  tone = "magenta",
  className,
}: {
  children: React.ReactNode;
  tone?: "magenta" | "green" | "blue";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center max-w-full text-center font-mono text-[clamp(9px,3.05vw,12px)] font-semibold uppercase",
        tone === "magenta"
          ? "rounded-full border border-tbs-magenta bg-[rgba(232,9,76,0.12)] px-3 py-1.5 leading-[14px] tracking-[-0.24px] text-tbs-magenta"
          : tone === "blue"
            ? "h-7 shrink-0 rounded-full border border-tbs-blue-100 bg-tbs-blue-100/20 px-3 text-[12px] font-extrabold leading-4 tracking-[0.72px] text-tbs-blue-100 uppercase"
            : "rounded-lg border border-tbs-green-200 bg-[rgba(17,224,127,0.2)] px-2 py-1 font-bold leading-4 tracking-[0.72px] text-tbs-green-200",
        className
      )}
    >
      {children}
    </span>
  );
}
