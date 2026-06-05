import { useNavigate } from "react-router-dom";
import { Building2, ChevronLeft, HeartPulse, Stethoscope, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import type { Department } from "@/mock/types";
import { departmentPatients } from "@/lib/derive";

const DEPT_ICON: Record<Department, LucideIcon> = {
  clinic: Stethoscope,
  daycare: Sun,
  inpatient: Building2,
};

export function SelectDepartmentScreen() {
  const navigate = useNavigate();
  const setDepartment = useStore((s) => s.setDepartment);
  const state = useStore();
  const nurse = state.nurse;

  const depts: Department[] = ["clinic", "daycare", "inpatient"];

  const choose = (d: Department) => {
    setDepartment(d);
    navigate("/", { replace: true });
  };

  return (
    <div className="relative min-h-screen p-4">
      <div className="pointer-events-none absolute -top-24 end-0 size-96 rounded-full bg-sun-gradient opacity-10 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-3xl pt-10">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-hope-gradient text-white">
            <HeartPulse className="size-6" />
          </span>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            {ar.dashboard.greeting} {nurse.firstName} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">{ar.selectDept}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {depts.map((d) => {
            const Icon = DEPT_ICON[d];
            const count = departmentPatients(state, d).length;
            return (
              <button
                key={d}
                onClick={() => choose(d)}
                className="group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 text-start shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="size-7" />
                </span>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">{ar.dept[d]}</h2>
                  <p className="text-sm text-muted-foreground">{ar.deptPurpose[d]}</p>
                </div>
                <div className="mt-auto flex w-full items-center justify-between pt-2">
                  <span className="text-sm">
                    <span className="font-display text-2xl font-extrabold text-foreground">
                      {count}
                    </span>{" "}
                    <span className="text-muted-foreground">{ar.patientsToday}</span>
                  </span>
                  <ChevronLeft className="size-5 text-primary transition-transform group-hover:-translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
