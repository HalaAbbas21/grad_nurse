import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  ClipboardList,
  FileText,
  FlaskConical,
  HeartPulse,
  Info,
  LayoutGrid,
  Pill,
  Save,
  Stethoscope,
  Syringe,
  UserRound,
} from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { usePatient } from "@/lib/usePatient";
import {
  isDoseOverdue,
  latestVitals,
  patientTasks,
} from "@/lib/derive";
import { ageLabel, fmtDate, fmtDateTime, fmtTime } from "@/lib/utils";
import type { AppointmentStatus } from "@/mock/types";
import { PatientContextBar } from "@/components/shared/PatientContextBar";
import { TabsBar, type TabItem } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/shared/States";
import { VitalsTrend } from "@/components/shared/VitalsTrend";
import { MarList } from "@/components/shared/MarList";
import {
  AdminStatusBadge,
  AppointmentStatusBadge,
  LabStatusBadge,
  TaskChip,
} from "@/components/shared/StatusBadges";
import {
  DemographicsFields,
  type DemographicsDraft,
} from "@/components/shared/DemographicsFields";
import { PatientNotFound } from "@/components/shared/PatientNotFound";

type TabKey =
  | "overview"
  | "demographics"
  | "vitals"
  | "medications"
  | "labs"
  | "care"
  | "appointments"
  | "plan";

const TABS: TabItem[] = [
  { value: "overview", label: ar.tabs.overview, icon: <LayoutGrid /> },
  { value: "demographics", label: ar.tabs.demographics, icon: <UserRound /> },
  { value: "vitals", label: ar.tabs.vitals, icon: <HeartPulse /> },
  { value: "medications", label: ar.tabs.medications, icon: <Pill /> },
  { value: "labs", label: ar.tabs.labs, icon: <FlaskConical /> },
  { value: "care", label: ar.tabs.care, icon: <ClipboardList /> },
  { value: "appointments", label: ar.tabs.appointments, icon: <CalendarClock /> },
  { value: "plan", label: ar.tabs.plan, icon: <FileText /> },
];

export function PatientRecordScreen() {
  const { patient } = usePatient();
  const [tab, setTab] = useState<TabKey>("overview");

  if (!patient) return <PatientNotFound />;

  return (
    <>
      <PatientContextBar patient={patient} />
      <div className="mx-auto w-full max-w-screen-xl space-y-4 px-4 pb-24 pt-4 lg:px-6 lg:pb-10">
        <PatientToolbar fileNo={patient.fileNoBasma} />
        <TabsBar tabs={TABS} value={tab} onValueChange={(v) => setTab(v as TabKey)} />

        {tab === "overview" && <OverviewTab fileNo={patient.fileNoBasma} />}
        {tab === "demographics" && <DemographicsTab fileNo={patient.fileNoBasma} />}
        {tab === "vitals" && <VitalsTab fileNo={patient.fileNoBasma} />}
        {tab === "medications" && <MedicationsTab fileNo={patient.fileNoBasma} />}
        {tab === "labs" && <LabsTab fileNo={patient.fileNoBasma} />}
        {tab === "care" && <CareTab fileNo={patient.fileNoBasma} />}
        {tab === "appointments" && <AppointmentsTab fileNo={patient.fileNoBasma} />}
        {tab === "plan" && <PlanTab fileNo={patient.fileNoBasma} />}
      </div>
    </>
  );
}

// ── Primary actions toolbar ───────────────────────────────────
function PatientToolbar({ fileNo }: { fileNo: string }) {
  const navigate = useNavigate();
  const base = `/patients/${encodeURIComponent(fileNo)}`;
  const actions = [
    { label: ar.vitals.record, icon: HeartPulse, to: `${base}/vitals` },
    { label: ar.labs.record, icon: FlaskConical, to: `${base}/lab-draw` },
    { label: ar.med.administer, icon: Syringe, to: `${base}/medication` },
    { label: ar.care.add, icon: ClipboardList, to: `${base}/care` },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {actions.map((a) => (
        <Button
          key={a.to}
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => navigate(a.to)}
        >
          <a.icon className="size-4" />
          {a.label}
        </Button>
      ))}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────
function OverviewTab({ fileNo }: { fileNo: string }) {
  const state = useStore();
  const navigate = useNavigate();
  const patient = state.patients.find((p) => p.fileNoBasma === fileNo)!;
  const tasks = patientTasks(state, patient);
  const lv = latestVitals(state, fileNo);
  const meds = state.mar.filter((m) => m.patientFileNo === fileNo);
  const todayMeds = meds.filter((m) => m.administrationStatus !== "administered");
  const lastAdmin = [...state.administrations]
    .filter((a) => a.patientFileNo === fileNo)
    .sort((a, b) => +new Date(b.administeredTime) - +new Date(a.administeredTime))[0];
  const nextDose = [...meds]
    .filter((m) => m.administrationStatus !== "administered")
    .sort((a, b) => +new Date(a.scheduledTime) - +new Date(b.scheduledTime))[0];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <h3 className="font-bold">{ar.overview.needsNow}</h3>
          {tasks.length === 0 ? (
            <EmptyState success message={ar.dashboard.allClear} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {tasks.map((t) => (
                <TaskChip key={t} task={t} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{ar.overview.latestVitals}</h3>
            <Button variant="link" size="sm" onClick={() => navigate(`/patients/${encodeURIComponent(fileNo)}/vitals`)}>
              {ar.more}
            </Button>
          </div>
          {lv ? (
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Stat label={ar.vitals.temperature} value={`${lv.temperature}°`} />
              <Stat label={ar.vitals.pulse} value={`${lv.pulse}`} />
              <Stat label={ar.vitals.bp} value={`${lv.bloodPressureSystolic}/${lv.bloodPressureDiastolic}`} />
              <Stat label={ar.vitals.weight} value={`${lv.weight}`} />
              <Stat label={ar.vitals.rr} value={`${lv.respiratoryRate}`} />
              {lv.oxygenSaturation !== undefined && (
                <Stat label={ar.vitals.spo2} value={`${lv.oxygenSaturation}%`} />
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{ar.vitals.empty}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h3 className="font-bold">{ar.overview.todayMeds}</h3>
          {todayMeds.length === 0 ? (
            <p className="text-sm text-muted-foreground">{ar.med.empty}</p>
          ) : (
            <ul className="space-y-2">
              {todayMeds.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0">
                    <span className="font-bold">{m.medName}</span>{" "}
                    <span className="text-muted-foreground">
                      {m.dose} · {fmtTime(m.scheduledTime)}
                    </span>
                  </span>
                  <AdminStatusBadge status={m.administrationStatus} overdue={isDoseOverdue(m)} />
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-4 border-t border-border pt-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">{ar.overview.lastDose}</span>
              <div className="font-bold">
                {lastAdmin ? fmtDate(lastAdmin.administeredTime) : ar.overview.none}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">{ar.overview.nextDose}</span>
              <div className="font-bold">
                {nextDose ? fmtDateTime(nextDose.scheduledTime) : ar.overview.none}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6">
          <h3 className="font-bold">{ar.overview.openTasks}</h3>
          <p className="text-sm text-muted-foreground">
            {ageLabel(patient.dob)} · {ar.dept[patient.department]} · {patient.currentPhase}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={() => navigate(`/patients/${encodeURIComponent(fileNo)}/medication`)}
          >
            <Syringe className="size-4" />
            {ar.med.administer}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-extrabold">{value}</div>
    </div>
  );
}

// ── Demographics (editable) ───────────────────────────────────
function DemographicsTab({ fileNo }: { fileNo: string }) {
  const patient = useStore((s) => s.patients.find((p) => p.fileNoBasma === fileNo)!);
  const upsertPatient = useStore((s) => s.upsertPatient);
  const failSave = useStore((s) => s.failSave);
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DemographicsDraft>(toDraft(patient));

  const save = () => {
    if (failSave) {
      toast(ar.saveError, { tone: "error" });
      return;
    }
    upsertPatient({ ...patient, ...draft });
    setEditing(false);
    toast(ar.saved);
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{ar.tabs.demographics}</h3>
          {editing ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setDraft(toDraft(patient)); setEditing(false); }}>
                {ar.cancel}
              </Button>
              <Button size="sm" onClick={save}>
                <Save className="size-4" />
                {ar.save}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              {ar.edit}
            </Button>
          )}
        </div>

        {editing ? (
          <DemographicsFields draft={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} lockFileNo />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ReadField label={ar.demo.firstName} value={patient.firstName} />
            <ReadField label={ar.demo.familyName} value={patient.familyName} />
            <ReadField label={ar.demo.fatherName} value={patient.fatherName} />
            <ReadField label={ar.demo.motherName} value={patient.motherName} />
            <ReadField label={ar.demo.dob} value={`${fmtDate(patient.dob)} (${ageLabel(patient.dob)})`} />
            <ReadField label={ar.gender} value={ar.genderLabel[patient.gender]} />
            <ReadField label={ar.demo.nationality} value={ar.nationality[patient.nationality]} />
            <ReadField label={ar.demo.nationalIdPatient} value={patient.nationalIdPatient ?? "—"} />
            <ReadField label={ar.demo.nationalIdFather} value={patient.nationalIdFather ?? "—"} />
            <ReadField
              label={ar.demo.residence}
              value={`${patient.residence.city}، ${patient.residence.governorate}`}
            />
            <ReadField label={ar.demo.caregiver} value={ar.caregiver[patient.caregiver]} />
            <ReadField
              label={ar.demo.caregiverEducation}
              value={ar.caregiverEducation[patient.caregiverEducation]}
            />
            <ReadField label={ar.demo.phoneFather} value={patient.phones.father ?? "—"} />
            <ReadField label={ar.demo.phoneMother} value={patient.phones.mother ?? "—"} />
            <ReadField label={ar.demo.phoneCaregiver} value={patient.phones.caregiver ?? "—"} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function toDraft(p: ReturnType<typeof useStore.getState>["patients"][number]): DemographicsDraft {
  return {
    fileNoBasma: p.fileNoBasma,
    fileNoBiruni: p.fileNoBiruni,
    nationalIdPatient: p.nationalIdPatient,
    nationalIdFather: p.nationalIdFather,
    firstName: p.firstName,
    familyName: p.familyName,
    fatherName: p.fatherName,
    motherName: p.motherName,
    dob: p.dob,
    gender: p.gender,
    nationality: p.nationality,
    residence: p.residence,
    caregiver: p.caregiver,
    caregiverEducation: p.caregiverEducation,
    phones: p.phones,
  };
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-bold text-foreground">{value}</div>
    </div>
  );
}

// ── Vitals tab ────────────────────────────────────────────────
function VitalsTab({ fileNo }: { fileNo: string }) {
  const readings = useStore((s) => s.vitals.filter((v) => v.patientFileNo === fileNo));
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{ar.vitals.history}</h3>
          <Button size="sm" onClick={() => navigate(`/patients/${encodeURIComponent(fileNo)}/vitals`)}>
            <HeartPulse className="size-4" />
            {ar.vitals.record}
          </Button>
        </div>
        {readings.length === 0 ? (
          <EmptyState message={ar.vitals.empty} />
        ) : (
          <VitalsTrend readings={readings} />
        )}
      </CardContent>
    </Card>
  );
}

// ── Medications tab ───────────────────────────────────────────
function MedicationsTab({ fileNo }: { fileNo: string }) {
  const meds = useStore((s) => s.mar.filter((m) => m.patientFileNo === fileNo));
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{ar.med.mar}</h3>
          <Button size="sm" onClick={() => navigate(`/patients/${encodeURIComponent(fileNo)}/medication`)}>
            <Syringe className="size-4" />
            {ar.med.administer}
          </Button>
        </div>
        {meds.length === 0 ? (
          <EmptyState message={ar.med.empty} />
        ) : (
          <MarList
            items={meds}
            onAdminister={() => navigate(`/patients/${encodeURIComponent(fileNo)}/medication`)}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ── Labs tab ──────────────────────────────────────────────────
function LabsTab({ fileNo }: { fileNo: string }) {
  const labs = useStore((s) => s.labs.filter((l) => l.patientFileNo === fileNo));
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{ar.labs.title}</h3>
          <Button size="sm" onClick={() => navigate(`/patients/${encodeURIComponent(fileNo)}/lab-draw`)}>
            <FlaskConical className="size-4" />
            {ar.labs.record}
          </Button>
        </div>
        {labs.length === 0 ? (
          <EmptyState message={ar.labs.empty} />
        ) : (
          <ul className="space-y-2">
            {labs.map((l) => (
              <li key={l.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{l.testType}</span>
                  <LabStatusBadge status={l.status} />
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                  <span>{ar.labKind[l.labKind]}</span>
                  <span>·</span>
                  <span>{ar.labPriority[l.priority]}</span>
                  {l.preDose && (
                    <>
                      <span>·</span>
                      <span className="font-bold text-warning-foreground">{ar.labs.preDose}</span>
                    </>
                  )}
                  {l.resultSummary && (
                    <>
                      <span>·</span>
                      <span className="font-bold text-secondary-foreground">{l.resultSummary}</span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ── Care tab ──────────────────────────────────────────────────
function CareTab({ fileNo }: { fileNo: string }) {
  const docs = useStore((s) => s.careDocs.filter((c) => c.patientFileNo === fileNo));
  const navigate = useNavigate();
  const sorted = [...docs].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{ar.care.title}</h3>
          <Button size="sm" onClick={() => navigate(`/patients/${encodeURIComponent(fileNo)}/care`)}>
            <ClipboardList className="size-4" />
            {ar.care.add}
          </Button>
        </div>
        {sorted.length === 0 ? (
          <EmptyState message={ar.care.empty} />
        ) : (
          <ol className="space-y-3">
            {sorted.map((c) => (
              <li key={c.id} className="rounded-lg border border-border bg-card p-3">
                <div className="mb-1 text-xs font-bold text-muted-foreground">
                  {fmtDateTime(c.createdAt)}
                </div>
                <p className="text-sm text-foreground">{c.notes}</p>
                {c.procedures.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.procedures.map((pr) => (
                      <span
                        key={pr}
                        className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent"
                      >
                        {pr}
                      </span>
                    ))}
                  </div>
                )}
                {c.observations && (
                  <p className="mt-2 text-xs text-muted-foreground">{c.observations}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

// ── Appointments tab ──────────────────────────────────────────
function AppointmentsTab({ fileNo }: { fileNo: string }) {
  const appts = useStore((s) => s.appointments.filter((a) => a.patientFileNo === fileNo));
  const updateStatus = useStore((s) => s.updateAppointmentStatus);
  const { toast } = useToast();
  const sorted = [...appts].sort((a, b) => +new Date(a.dateTime) - +new Date(b.dateTime));
  const statusOpts = (["scheduled", "checked-in", "checked-out", "cancelled"] as AppointmentStatus[]).map(
    (s) => ({ value: s, label: ar.apptStatus[s] }),
  );
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <h3 className="font-bold">{ar.appt.title}</h3>
        {sorted.length === 0 ? (
          <EmptyState message={ar.appt.empty} />
        ) : (
          <ul className="space-y-2">
            {sorted.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-bold">{a.type}</div>
                  <div className="text-xs text-muted-foreground">{fmtDateTime(a.dateTime)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <AppointmentStatusBadge status={a.status} />
                  <Select
                    value={a.status}
                    onValueChange={(v) => {
                      updateStatus(a.id, v as AppointmentStatus);
                      toast(ar.saved);
                    }}
                    options={statusOpts}
                    className="h-9 min-w-[8rem] text-sm"
                    aria-label={ar.appt.updateStatus}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ── Treatment plan (read-only) ────────────────────────────────
function PlanTab({ fileNo }: { fileNo: string }) {
  const patient = useStore((s) => s.patients.find((p) => p.fileNoBasma === fileNo)!);
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-5 text-primary" />
          <h3 className="font-bold">{ar.plan.title}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
            {ar.readOnly}
          </span>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-primary-soft/60 p-3 text-sm text-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{ar.plan.note}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ReadField label={ar.diagnosis} value={patient.diagnosis} />
          <ReadField label={ar.plan.protocol} value={patient.currentPhase} />
        </div>
        {patient.basicMedicalNotes && (
          <ReadField label={ar.demo.medicalNotes} value={patient.basicMedicalNotes} />
        )}
      </CardContent>
    </Card>
  );
}
