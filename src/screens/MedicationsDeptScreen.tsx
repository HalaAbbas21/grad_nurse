import { useNavigate } from "react-router-dom";
import { Clock, Syringe } from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { isDoseOverdue, medRound, patientByFileNo, readyDoses } from "@/lib/derive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ListSkeleton } from "@/components/shared/States";
import { AdminStatusBadge } from "@/components/shared/StatusBadges";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import { fmtTime } from "@/lib/utils";

export function MedicationsDeptScreen() {
  const state = useStore();
  const navigate = useNavigate();
  const { loading } = useSimulatedLoad();
  const dept = state.department;

  const ready = readyDoses(state, dept);
  const round = medRound(state, dept);

  const goPatientMed = (fileNo: string) =>
    navigate(`/patients/${encodeURIComponent(fileNo)}/medication`);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">{ar.med.title}</h1>
        <p className="text-sm text-muted-foreground">{dept ? ar.dept[dept] : ""}</p>
      </div>

      {/* Ready to administer (hero) */}
      <Card className="border-highlight/40 bg-highlight-soft/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="size-5 text-highlight-foreground" />
            {ar.med.readyDept}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ListSkeleton rows={2} />
          ) : ready.length === 0 ? (
            <EmptyState success message={ar.dashboard.allClear} />
          ) : (
            <ul className="space-y-2">
              {ready.map((m) => {
                const p = patientByFileNo(state, m.patientFileNo);
                const overdue = isDoseOverdue(m);
                return (
                  <li
                    key={m.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary-soft px-1.5 font-display font-extrabold text-primary">
                          {m.patientFileNo}
                        </span>
                        <span className="font-bold">{p ? `${p.firstName} ${p.familyName}` : ""}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                        <span className="font-bold text-foreground">{m.medName}</span>
                        <span>·</span>
                        <span>{m.dose}</span>
                        <span>·</span>
                        <span>{ar.medRoute[m.route]}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {fmtTime(m.scheduledTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AdminStatusBadge status={m.administrationStatus} overdue={overdue} />
                      <Button
                        variant={overdue ? "default" : "highlight"}
                        size="sm"
                        onClick={() => goPatientMed(m.patientFileNo)}
                      >
                        <Syringe className="size-4" />
                        {ar.med.administer}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Full round (upcoming + overdue) */}
      <Card>
        <CardHeader>
          <CardTitle>{ar.dashboard.medRoundTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ListSkeleton rows={3} />
          ) : round.length === 0 ? (
            <EmptyState message={ar.dashboard.nothingMeds} />
          ) : (
            <ul className="space-y-2">
              {round.map((m) => {
                const p = patientByFileNo(state, m.patientFileNo);
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <span className="inline-flex flex-col items-center rounded-lg bg-muted px-2 py-1 text-xs">
                      <Clock className="size-4 text-muted-foreground" />
                      <span className="font-bold">{fmtTime(m.scheduledTime)}</span>
                    </span>
                    <button
                      onClick={() => goPatientMed(m.patientFileNo)}
                      className="min-w-0 flex-1 text-start"
                    >
                      <div className="font-bold">{m.medName}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {m.dose} · {p ? `${p.firstName} ${p.familyName}` : m.patientFileNo}
                      </div>
                    </button>
                    <AdminStatusBadge status={m.administrationStatus} overdue={isDoseOverdue(m)} />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
