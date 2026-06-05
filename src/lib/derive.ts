import type { AppState } from "@/store/useStore";
import type { Department, MARItem, Patient, TaskKind, Vitals } from "@/mock/types";
import { minutesBetween } from "./utils";

/** A dose is overdue if it's ready/scheduled, approved, and past its scheduled time. */
export function isDoseOverdue(m: MARItem, now: Date = new Date()): boolean {
  if (m.administrationStatus === "administered") return false;
  return m.approvedByDoctor && new Date(m.scheduledTime).getTime() < now.getTime();
}

/** A dose can be administered only if the doctor approved it and it isn't done. */
export function isDoseReady(m: MARItem): boolean {
  return (
    m.approvedByDoctor &&
    m.approvalStatus === "approved" &&
    (m.administrationStatus === "ready" || m.administrationStatus === "scheduled")
  );
}

export function latestVitals(state: AppState, fileNo: string): Vitals | undefined {
  return [...state.vitals]
    .filter((v) => v.patientFileNo === fileNo)
    .sort((a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt))[0];
}

function isToday(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const VITALS_STALE_MIN = 240; // 4h

/** Independent outstanding tasks for a patient (a patient may have several). */
export function patientTasks(state: AppState, p: Patient): TaskKind[] {
  const tasks: TaskKind[] = [];

  if (!p.registrationComplete) {
    tasks.push("register");
    return tasks; // a not-yet-registered patient only needs registration
  }

  const isActive = p.lifeStatus === "alive";

  // doses ready to give (approved by doctor)
  const hasReadyDose = state.mar.some(
    (m) =>
      m.patientFileNo === p.fileNoBasma &&
      m.approvedByDoctor &&
      (m.administrationStatus === "ready" ||
        (m.administrationStatus === "scheduled" && isDoseOverdue(m))),
  );
  if (hasReadyDose) tasks.push("give-dose");

  // labs awaiting draw
  const hasLabToDraw = state.labs.some(
    (l) => l.patientFileNo === p.fileNoBasma && l.status === "requested-to-draw",
  );
  if (hasLabToDraw) tasks.push("draw-lab");

  // appointments present (checked-in) → vitals & care relevance
  const apptsForPatient = state.appointments.filter((a) => a.patientFileNo === p.fileNoBasma);
  const checkedInToday = apptsForPatient.some(
    (a) => a.status === "checked-in" && isToday(a.dateTime),
  );
  const presentNow = checkedInToday || p.department === "inpatient";

  // vitals due
  if (isActive && presentNow) {
    const lv = latestVitals(state, p.fileNoBasma);
    const stale = !lv || minutesBetween(lv.recordedAt) > VITALS_STALE_MIN;
    if (stale) tasks.push("vitals");
  }

  // care to document
  if (isActive && presentNow) {
    const lastCare = [...state.careDocs]
      .filter((c) => c.patientFileNo === p.fileNoBasma)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
    const careStale = !lastCare || minutesBetween(lastCare.createdAt) > 360; // 6h
    if (careStale) tasks.push("document-care");
  }

  // appointments to update (scheduled, not yet checked in/out)
  const hasApptToUpdate = apptsForPatient.some((a) => a.status === "scheduled");
  if (hasApptToUpdate) tasks.push("update-appointment");

  return tasks;
}

/** Single highest-priority task — used for the queue "what's needed" chip. */
const TASK_PRIORITY: TaskKind[] = [
  "register",
  "give-dose",
  "draw-lab",
  "vitals",
  "document-care",
  "update-appointment",
];

export function primaryTask(state: AppState, p: Patient): TaskKind | null {
  const tasks = patientTasks(state, p);
  for (const t of TASK_PRIORITY) if (tasks.includes(t)) return t;
  return null;
}

export function departmentPatients(state: AppState, dept: Department | null): Patient[] {
  if (!dept) return state.patients;
  return state.patients.filter((p) => p.department === dept);
}

export type TaskCounts = Record<TaskKind, number>;

/** Count of patients in a department that have each outstanding task. */
export function departmentTaskCounts(state: AppState, dept: Department | null): TaskCounts {
  const counts: TaskCounts = {
    register: 0,
    "give-dose": 0,
    "draw-lab": 0,
    vitals: 0,
    "document-care": 0,
    "update-appointment": 0,
  };
  for (const p of departmentPatients(state, dept)) {
    for (const t of patientTasks(state, p)) counts[t]++;
  }
  return counts;
}

export function patientsWithTask(
  state: AppState,
  dept: Department | null,
  task: TaskKind,
): Patient[] {
  return departmentPatients(state, dept).filter((p) => patientTasks(state, p).includes(task));
}

// ── Vital range checks (for warning treatment) ───────────────
export interface VitalFlag {
  field: keyof Vitals;
  label: string;
  high: boolean;
}

export function vitalFlags(v: Pick<Vitals,
  "temperature" | "pulse" | "respiratoryRate" | "oxygenSaturation" | "bloodPressureSystolic"
>): VitalFlag[] {
  const flags: VitalFlag[] = [];
  if (v.temperature >= 38) flags.push({ field: "temperature", label: "حرارة مرتفعة", high: true });
  else if (v.temperature < 35.5)
    flags.push({ field: "temperature", label: "حرارة منخفضة", high: false });
  if (v.pulse > 130) flags.push({ field: "pulse", label: "نبض سريع", high: true });
  else if (v.pulse < 60) flags.push({ field: "pulse", label: "نبض بطيء", high: false });
  if (v.respiratoryRate > 28)
    flags.push({ field: "respiratoryRate", label: "تنفّس سريع", high: true });
  if (v.oxygenSaturation !== undefined && v.oxygenSaturation < 95)
    flags.push({ field: "oxygenSaturation", label: "أكسجين منخفض", high: false });
  return flags;
}

/** Doses ready to administer across a department (the dashboard hero count). */
export function readyDoses(state: AppState, dept: Department | null): MARItem[] {
  const fileNos = new Set(departmentPatients(state, dept).map((p) => p.fileNoBasma));
  return state.mar.filter(
    (m) =>
      fileNos.has(m.patientFileNo) &&
      m.approvedByDoctor &&
      m.administrationStatus !== "administered" &&
      (m.administrationStatus === "ready" || isDoseOverdue(m)),
  );
}

/** Upcoming + overdue approved doses for the med-round summary. */
export function medRound(state: AppState, dept: Department | null): MARItem[] {
  const fileNos = new Set(departmentPatients(state, dept).map((p) => p.fileNoBasma));
  return state.mar
    .filter(
      (m) =>
        fileNos.has(m.patientFileNo) &&
        m.administrationStatus !== "administered" &&
        m.approvedByDoctor,
    )
    .sort((a, b) => +new Date(a.scheduledTime) - +new Date(b.scheduledTime));
}

export function patientByFileNo(state: AppState, fileNo: string): Patient | undefined {
  return state.patients.find((p) => p.fileNoBasma === fileNo);
}
