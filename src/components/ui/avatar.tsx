import { cn } from "@/lib/utils";

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full bg-care-gradient text-sm font-bold text-white",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
