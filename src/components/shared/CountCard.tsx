import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskKind } from "@/mock/types";
import { ar } from "@/i18n/ar";
import { TASK_META } from "./StatusBadges";

interface CountCardProps {
  task: TaskKind;
  count: number;
  onClick: () => void;
  hero?: boolean;
}

const TONE_BG: Record<string, string> = {
  highlight: "bg-highlight-soft",
  warning: "bg-warning/15",
  primary: "bg-primary-soft",
  accent: "bg-accent-soft",
  secondary: "bg-secondary-soft",
};

const TONE_NUM: Record<string, string> = {
  highlight: "text-highlight-foreground",
  warning: "text-warning-foreground",
  primary: "text-primary",
  accent: "text-accent",
  secondary: "text-secondary-foreground",
};

const TONE_ICON: Record<string, string> = {
  highlight: "bg-highlight text-highlight-foreground",
  warning: "bg-warning text-warning-foreground",
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground",
};

export function CountCard({ task, count, onClick, hero }: CountCardProps) {
  const meta = TASK_META[task];
  const Icon = meta.icon;
  const tone = meta.tone;
  const dim = count === 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border p-4 text-start transition-all hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        TONE_BG[tone],
        hero ? "border-highlight/50 shadow-soft ring-1 ring-highlight/40 sm:col-span-2" : "border-border",
        dim && "opacity-70",
      )}
      aria-label={`${ar.task[task]}: ${count}`}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl [&_svg]:size-6",
            TONE_ICON[tone],
          )}
        >
          <Icon />
        </span>
        <ChevronLeft className="size-5 text-muted-foreground transition-transform group-hover:-translate-x-1" />
      </div>
      <div className="space-y-0.5">
        <div className={cn("font-display text-4xl font-extrabold leading-none", TONE_NUM[tone])}>
          {count}
        </div>
        <div className="text-sm font-bold text-foreground">{ar.task[task]}</div>
      </div>
      {hero && (
        <span className="absolute -top-2 start-4 rounded-full bg-highlight px-2 py-0.5 text-[10px] font-extrabold text-highlight-foreground shadow">
          الأهم الآن
        </span>
      )}
    </button>
  );
}
