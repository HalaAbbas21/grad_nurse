import { Minus, Plus } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  value: number | "";
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  warn?: boolean;
  id?: string;
}

export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  unit,
  warn,
  id,
}: NumberStepperProps) {
  const num = value === "" ? 0 : value;
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border bg-card p-1.5",
        warn ? "border-warning" : "border-input",
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-md bg-muted"
        onClick={() => onChange(clamp(num - step))}
        aria-label="إنقاص"
      >
        <Minus className="size-4" />
      </Button>
      <div className="flex flex-1 items-baseline justify-center gap-1">
        <input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return onChange(0);
            const parsed = parseFloat(v);
            if (!Number.isNaN(parsed)) onChange(clamp(parsed));
          }}
          className={cn(
            "w-16 bg-transparent text-center font-display text-2xl font-extrabold focus:outline-none",
            warn ? "text-warning-foreground" : "text-foreground",
          )}
        />
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-md bg-muted"
        onClick={() => onChange(clamp(num + step))}
        aria-label="زيادة"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
