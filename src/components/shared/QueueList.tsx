import { useNavigate } from "react-router-dom";
import { Clock, ChevronLeft } from "lucide-react";
import { ageLabel, waitLabel } from "@/lib/utils";
import type { Patient } from "@/mock/types";
import { useStore } from "@/store/useStore";
import { patientTasks } from "@/lib/derive";
import { LifeStatusBadge, TaskChip } from "./StatusBadges";

interface QueueListProps {
  patients: Patient[];
}

/** Patient queue rendered as stacked cards (phone) / rows (desktop). */
export function QueueList({ patients }: QueueListProps) {
  const state = useStore();
  const navigate = useNavigate();

  if (patients.length === 0) {
    return null; // caller renders empty state
  }

  return (
    <ul className="space-y-2">
      {patients.map((p, idx) => {
        const tasks = patientTasks(state, p);
        const checkedIn = state.appointments.find(
          (a) => a.patientFileNo === p.fileNoBasma && a.status === "checked-in",
        );
        const waitingFrom = checkedIn?.dateTime;
        return (
          <li key={p.fileNoBasma}>
            <button
              onClick={() => navigate(`/patients/${encodeURIComponent(p.fileNoBasma)}`)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* token */}
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted font-display text-sm font-extrabold text-muted-foreground">
                {idx + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-primary">{p.fileNoBasma}</span>
                  <span className="truncate font-bold text-foreground">
                    {p.firstName} {p.familyName}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>{ageLabel(p.dob)}</span>
                  <span>·</span>
                  <span className="truncate">{p.diagnosis}</span>
                </div>
                {tasks.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {tasks.slice(0, 3).map((t) => (
                      <TaskChip key={t} task={t} />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <LifeStatusBadge status={p.lifeStatus} />
                {waitingFrom && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    {waitLabel(waitingFrom)}
                  </span>
                )}
              </div>
              <ChevronLeft className="size-5 shrink-0 text-muted-foreground" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
