import { Clock, Lock, Syringe } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtTime } from "@/lib/utils";
import { ar } from "@/i18n/ar";
import type { MARItem } from "@/mock/types";
import { isDoseOverdue } from "@/lib/derive";
import { Button } from "@/components/ui/button";
import { AdminStatusBadge } from "./StatusBadges";

interface MarListProps {
  items: MARItem[];
  onAdminister?: (item: MARItem) => void;
  /** When true, show the patient file-no on each row (department-wide view). */
  showPatient?: boolean;
}

/** Reusable medication-administration-record list with the safety-gated action. */
export function MarList({ items, onAdminister, showPatient }: MarListProps) {
  return (
    <ul className="space-y-3">
      {items.map((m) => {
        const overdue = isDoseOverdue(m);
        const blocked = !m.approvedByDoctor;
        const canGive =
          m.approvedByDoctor && m.administrationStatus !== "administered";
        return (
          <li
            key={m.id}
            className={cn(
              "rounded-xl border bg-card p-4",
              overdue && !blocked ? "border-warning/60 bg-warning/5" : "border-border",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Syringe className="size-4 shrink-0 text-primary" />
                  <span className="font-bold text-foreground">{m.medName}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{m.dose}</span>
                  <span>·</span>
                  <span>{ar.medRoute[m.route]}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {fmtTime(m.scheduledTime)}
                  </span>
                  {showPatient && (
                    <>
                      <span>·</span>
                      <span className="rounded bg-primary-soft px-1.5 font-bold text-primary">
                        {m.patientFileNo}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <AdminStatusBadge status={m.administrationStatus} overdue={overdue} />
            </div>

            {blocked ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-bold text-muted-foreground">
                <Lock className="size-4" />
                {m.blockedReason ?? ar.med.awaitingApproval}
              </div>
            ) : (
              onAdminister &&
              m.administrationStatus !== "administered" && (
                <div className="mt-3">
                  <Button
                    variant={overdue ? "default" : "highlight"}
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={!canGive}
                    onClick={() => onAdminister(m)}
                  >
                    <Syringe className="size-4" />
                    {ar.med.administer}
                  </Button>
                </div>
              )
            )}
          </li>
        );
      })}
    </ul>
  );
}
