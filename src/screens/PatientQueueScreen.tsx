import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, UserPlus, X } from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { departmentPatients, patientTasks } from "@/lib/derive";
import type { TaskKind } from "@/mock/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { QueueList } from "@/components/shared/QueueList";
import { EmptyState, ListSkeleton } from "@/components/shared/States";
import { TaskChip } from "@/components/shared/StatusBadges";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";

const TASK_OPTS: { value: TaskKind | "all"; label: string }[] = [
  { value: "all", label: ar.patients.all },
  { value: "give-dose", label: ar.taskShort["give-dose"] },
  { value: "draw-lab", label: ar.taskShort["draw-lab"] },
  { value: "vitals", label: ar.taskShort.vitals },
  { value: "register", label: ar.taskShort.register },
  { value: "document-care", label: ar.taskShort["document-care"] },
  { value: "update-appointment", label: ar.taskShort["update-appointment"] },
];

export function PatientQueueScreen() {
  const state = useStore();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { loading } = useSimulatedLoad();

  const taskFilter = (params.get("task") as TaskKind | null) ?? "all";
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"name" | "file">("file");

  const dept = state.department;

  const filtered = useMemo(() => {
    let list = departmentPatients(state, dept);

    if (taskFilter !== "all") {
      list = list.filter((p) => patientTasks(state, p).includes(taskFilter));
    }

    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((p) => {
        const file = `${p.fileNoBasma} ${p.fileNoBiruni}`.toLowerCase();
        const name = `${p.firstName} ${p.familyName} ${p.fatherName}`.toLowerCase();
        // file number first
        return file.includes(term) || name.includes(term);
      });
    }

    list = [...list].sort((a, b) =>
      sort === "name"
        ? `${a.firstName} ${a.familyName}`.localeCompare(`${b.firstName} ${b.familyName}`, "ar")
        : a.fileNoBasma.localeCompare(b.fileNoBasma),
    );
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.patients, state.labs, state.mar, state.vitals, state.appointments, state.careDocs, dept, taskFilter, q, sort]);

  const setTask = (t: string) => {
    const next = new URLSearchParams(params);
    if (t === "all") next.delete("task");
    else next.set("task", t);
    setParams(next, { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">{ar.patients.title}</h1>
        {dept === "clinic" && (
          <Button onClick={() => navigate("/patients/new")} size="sm">
            <UserPlus className="size-4" />
            {ar.register.title}
          </Button>
        )}
      </div>

      {/* Search + controls */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ar.searchByFileNo}
            className="ps-10"
            inputMode="search"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={taskFilter}
            onValueChange={setTask}
            options={TASK_OPTS}
            className="min-w-[9rem]"
            aria-label={ar.patients.filterTask}
          />
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as "name" | "file")}
            options={[
              { value: "file", label: ar.fileNo },
              { value: "name", label: ar.patients.name },
            ]}
            aria-label={ar.patients.sort}
          />
        </div>
      </div>

      {/* Active filter chip */}
      {taskFilter !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{ar.patients.filterTask}:</span>
          <button
            onClick={() => setTask("all")}
            className="inline-flex items-center gap-1"
            aria-label={ar.cancel}
          >
            <TaskChip task={taskFilter} />
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {loading ? (
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState message={ar.patients.empty} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {ar.patients.title}
          </p>
          <QueueList patients={filtered} />
        </>
      )}
    </div>
  );
}
