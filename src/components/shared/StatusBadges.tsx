import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  Droplet,
  FlaskConical,
  HeartPulse,
  Syringe,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { ar } from "@/i18n/ar";
import type {
  AdministrationStatus,
  AppointmentStatus,
  LabStatus,
  LifeStatus,
  TaskKind,
} from "@/mock/types";

type Tone = NonNullable<BadgeProps["tone"]>;

// ── Task metadata: icon + tone, shared by dashboard cards and chips ──
export const TASK_META: Record<TaskKind, { tone: Tone; icon: LucideIcon }> = {
  "give-dose": { tone: "highlight", icon: Syringe },
  "draw-lab": { tone: "warning", icon: FlaskConical },
  vitals: { tone: "primary", icon: HeartPulse },
  register: { tone: "accent", icon: UserPlus },
  "document-care": { tone: "secondary", icon: ClipboardList },
  "update-appointment": { tone: "primary", icon: CalendarClock },
};

export function TaskChip({ task }: { task: TaskKind }) {
  const meta = TASK_META[task];
  const Icon = meta.icon;
  return (
    <Badge tone={meta.tone}>
      <Icon />
      {ar.taskShort[task]}
    </Badge>
  );
}

// ── Life status ──
const LIFE_TONE: Record<LifeStatus, Tone> = {
  alive: "success",
  deceased: "destructive",
  "treatment-abandoned": "warning",
  "lost-to-followup": "muted",
  unknown: "muted",
};

export function LifeStatusBadge({ status }: { status: LifeStatus }) {
  const Icon = status === "alive" ? Activity : status === "deceased" ? AlertTriangle : Clock;
  return (
    <Badge tone={LIFE_TONE[status]}>
      <Icon />
      {ar.lifeStatus[status]}
    </Badge>
  );
}

// ── Lab status ──
const LAB_TONE: Record<LabStatus, Tone> = {
  "requested-to-draw": "warning",
  drawn: "primary",
  "results-available": "success",
};
export function LabStatusBadge({ status }: { status: LabStatus }) {
  const Icon =
    status === "requested-to-draw" ? Droplet : status === "drawn" ? CheckCircle2 : FlaskConical;
  return (
    <Badge tone={LAB_TONE[status]}>
      <Icon />
      {ar.labStatus[status]}
    </Badge>
  );
}

// ── Medication administration status ──
const ADMIN_TONE: Record<AdministrationStatus, Tone> = {
  scheduled: "muted",
  ready: "highlight",
  administered: "secondary",
  missed: "destructive",
};
export function AdminStatusBadge({
  status,
  overdue,
}: {
  status: AdministrationStatus;
  overdue?: boolean;
}) {
  if (overdue && status !== "administered") {
    return (
      <Badge tone="warning">
        <AlertTriangle />
        {ar.med.overdue}
      </Badge>
    );
  }
  const Icon =
    status === "administered" ? CheckCircle2 : status === "ready" ? Syringe : Clock;
  return (
    <Badge tone={ADMIN_TONE[status]}>
      <Icon />
      {ar.adminStatus[status]}
    </Badge>
  );
}

// ── Appointment status ──
const APPT_TONE: Record<AppointmentStatus, Tone> = {
  scheduled: "primary",
  "checked-in": "secondary",
  "checked-out": "muted",
  cancelled: "destructive",
};
export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge tone={APPT_TONE[status]}>
      <CalendarClock />
      {ar.apptStatus[status]}
    </Badge>
  );
}
