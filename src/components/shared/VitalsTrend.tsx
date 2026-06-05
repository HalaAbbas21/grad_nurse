import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDateTime } from "@/lib/utils";
import { ar } from "@/i18n/ar";
import type { Vitals } from "@/mock/types";
import { vitalFlags } from "@/lib/derive";

/** Tiny inline sparkline for a numeric series (RTL: newest on the left). */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  // newest first (RTL) → reverse so left = latest
  const pts = [...values]
    .reverse()
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const TREND_METRICS: { key: keyof Vitals; label: string; unit: string }[] = [
  { key: "weight", label: ar.vitals.weight, unit: ar.vitals.units.weight },
  { key: "temperature", label: ar.vitals.temperature, unit: ar.vitals.units.temperature },
  { key: "pulse", label: ar.vitals.pulse, unit: ar.vitals.units.pulse },
  { key: "respiratoryRate", label: ar.vitals.rr, unit: ar.vitals.units.rr },
];

export function VitalsTrend({ readings }: { readings: Vitals[] }) {
  // newest first
  const sorted = [...readings].sort((a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt));
  if (sorted.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Trend sparklines */}
      {sorted.length >= 2 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TREND_METRICS.map((m) => {
            const series = sorted.map((r) => r[m.key] as number);
            return (
              <div key={String(m.key)} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span className="font-display text-lg font-extrabold text-foreground">
                    {series[0]}
                    <span className="text-xs font-normal text-muted-foreground"> {m.unit}</span>
                  </span>
                </div>
                <Sparkline values={series} />
              </div>
            );
          })}
        </div>
      )}

      {/* History list */}
      <ol className="space-y-2">
        {sorted.map((r) => {
          const flags = vitalFlags(r);
          return (
            <li
              key={r.id}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  {fmtDateTime(r.recordedAt)}
                </span>
                {flags.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-[11px] font-bold text-warning-foreground">
                    <AlertTriangle className="size-3" />
                    {ar.vitals.outOfRange}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-4 lg:grid-cols-6">
                <Metric label={ar.vitals.weight} value={`${r.weight}`} unit={ar.vitals.units.weight} />
                <Metric label={ar.vitals.height} value={`${r.height}`} unit={ar.vitals.units.height} />
                <Metric
                  label={ar.vitals.temperature}
                  value={`${r.temperature}`}
                  unit={ar.vitals.units.temperature}
                  warn={flags.some((f) => f.field === "temperature")}
                />
                <Metric
                  label={ar.vitals.pulse}
                  value={`${r.pulse}`}
                  unit={ar.vitals.units.pulse}
                  warn={flags.some((f) => f.field === "pulse")}
                />
                <Metric label={ar.vitals.bp} value={`${r.bloodPressureSystolic}/${r.bloodPressureDiastolic}`} unit="" />
                <Metric
                  label={ar.vitals.rr}
                  value={`${r.respiratoryRate}`}
                  unit={ar.vitals.units.rr}
                  warn={flags.some((f) => f.field === "respiratoryRate")}
                />
                {r.oxygenSaturation !== undefined && (
                  <Metric
                    label={ar.vitals.spo2}
                    value={`${r.oxygenSaturation}`}
                    unit={ar.vitals.units.spo2}
                    warn={flags.some((f) => f.field === "oxygenSaturation")}
                  />
                )}
                {r.painScore !== undefined && (
                  <Metric label={ar.vitals.pain} value={`${r.painScore}`} unit="/10" />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  warn,
}: {
  label: string;
  value: string;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={cn("font-bold", warn ? "text-warning-foreground" : "text-foreground")}>
        {value}
        <span className="text-[10px] font-normal text-muted-foreground"> {unit}</span>
      </span>
    </div>
  );
}
