import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Search } from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import {
  departmentPatients,
  departmentTaskCounts,
  medRound,
  patientByFileNo,
} from "@/lib/derive";
import type { TaskKind } from "@/mock/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountCard } from "@/components/shared/CountCard";
import { QueueList } from "@/components/shared/QueueList";
import { CommandSearch } from "@/components/shared/CommandSearch";
import { CardsSkeleton, EmptyState, ErrorState, ListSkeleton } from "@/components/shared/States";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import { fmtDate, fmtTime, waitLabel } from "@/lib/utils";
import { AdminStatusBadge } from "@/components/shared/StatusBadges";
import { isDoseOverdue } from "@/lib/derive";

// order of the priority row; give-dose is the hero
const PRIORITY_ORDER: TaskKind[] = [
  "give-dose",
  "draw-lab",
  "vitals",
  "register",
  "document-care",
  "update-appointment",
];

export function DashboardScreen() {
  const state = useStore();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { loading, error, retry } = useSimulatedLoad();

  const dept = state.department;
  const nurse = state.nurse;
  const counts = departmentTaskCounts(state, dept);
  const queue = departmentPatients(state, dept)
    .filter((p) => p.lifeStatus === "alive")
    .slice(0, 6);
  const round = medRound(state, dept).slice(0, 5);
  const recentNotifs = [...state.notifications]
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
    .slice(0, 4);

  const allClear = PRIORITY_ORDER.every((t) => counts[t] === 0);

  const goTask = (t: TaskKind) => navigate(`/patients?task=${t}`);

  return (
    <div className="space-y-5">
      {/* 1. Greeting strip */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            {ar.dashboard.greeting} {nurse.firstName} 👋
          </h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-2.5 py-0.5 font-bold text-secondary-foreground">
              <span className="size-2 rounded-full bg-secondary" />
              {dept ? ar.dept[dept] : ""}
            </span>
            <button
              onClick={() => navigate("/select-department")}
              className="font-bold text-primary underline-offset-2 hover:underline"
            >
              {ar.switchDept}
            </button>
            <span>·</span>
            <span>{fmtDate(new Date().toISOString())}</span>
          </p>
        </div>
      </div>

      {/* 2. Prominent file-number search */}
      <button
        onClick={() => setSearchOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-start text-muted-foreground shadow-card transition-colors hover:bg-muted/50"
      >
        <Search className="size-5 text-primary" />
        <span className="font-bold">{ar.searchByFileNo}</span>
      </button>

      {/* 3. Priority row */}
      <section>
        <h2 className="mb-3 text-lg font-bold">{ar.dashboard.priorityTitle}</h2>
        {loading ? (
          <CardsSkeleton count={6} />
        ) : error ? (
          <ErrorState onRetry={retry} />
        ) : allClear ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState success message={ar.dashboard.allClear} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {PRIORITY_ORDER.map((t) => (
              <CountCard
                key={t}
                task={t}
                count={counts[t]}
                hero={t === "give-dose"}
                onClick={() => goTask(t)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 4. Department queue */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{ar.dashboard.queueTitle}</CardTitle>
            <Button variant="link" size="sm" onClick={() => navigate("/patients")}>
              {ar.dashboard.seeAll}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ListSkeleton rows={4} />
            ) : queue.length === 0 ? (
              <EmptyState message={ar.dashboard.nothingQueue} />
            ) : (
              <QueueList patients={queue} />
            )}
          </CardContent>
        </Card>

        {/* 5. Medication round summary */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{ar.dashboard.medRoundTitle}</CardTitle>
            <Button variant="link" size="sm" onClick={() => navigate("/medications")}>
              {ar.dashboard.seeAll}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ListSkeleton rows={3} />
            ) : round.length === 0 ? (
              <EmptyState message={ar.dashboard.nothingMeds} />
            ) : (
              <ul className="space-y-2">
                {round.map((m) => {
                  const overdue = isDoseOverdue(m);
                  const patient = patientByFileNo(state, m.patientFileNo);
                  return (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <span className="inline-flex flex-col items-center rounded-lg bg-muted px-2 py-1 text-xs">
                        <Clock className="size-4 text-muted-foreground" />
                        <span className="font-bold">{fmtTime(m.scheduledTime)}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-foreground">{m.medName}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {m.dose} · {patient ? `${patient.firstName} ${patient.familyName}` : m.patientFileNo}
                        </div>
                      </div>
                      <AdminStatusBadge status={m.administrationStatus} overdue={overdue} />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 6. Notifications feed (compact) */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{ar.dashboard.notificationsTitle}</CardTitle>
          <Button variant="link" size="sm" onClick={() => navigate("/notifications")}>
            {ar.dashboard.seeAll}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ListSkeleton rows={3} />
          ) : recentNotifs.length === 0 ? (
            <EmptyState message={ar.notif.empty} />
          ) : (
            <ul className="space-y-2">
              {recentNotifs.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start gap-3 rounded-lg p-2 text-sm"
                >
                  <span
                    className={
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full " +
                      (n.type === "alert"
                        ? "bg-destructive/10 text-destructive"
                        : n.type === "reminder"
                          ? "bg-warning/20 text-warning-foreground"
                          : "bg-primary-soft text-primary")
                    }
                  >
                    <Bell className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={n.isRead ? "text-muted-foreground" : "font-bold text-foreground"}>
                      {n.message}
                    </p>
                    <span className="text-xs text-muted-foreground">{waitLabel(n.timestamp)} مضت</span>
                  </div>
                  {!n.isRead && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
