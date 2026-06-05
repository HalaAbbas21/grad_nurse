import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Save,
  AlertTriangle,
} from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field, Textarea } from "@/components/ui/input";
import { Stepper } from "@/components/ui/progress";
import { NumberStepper } from "@/components/ui/number-stepper";
import { useToast } from "@/components/ui/toast";
import {
  DemographicsFields,
  type DemographicsDraft,
} from "@/components/shared/DemographicsFields";
import { vitalFlags } from "@/lib/derive";
import type { Patient } from "@/mock/types";

const emptyDemographics = (): DemographicsDraft => ({
  fileNoBasma: "",
  fileNoBiruni: "",
  nationalIdPatient: "",
  nationalIdFather: "",
  firstName: "",
  familyName: "",
  fatherName: "",
  motherName: "",
  dob: "",
  gender: "male",
  nationality: "syrian",
  residence: { country: "سوريا", governorate: "", city: "" },
  caregiver: "both-parents",
  caregiverEducation: "secondary",
  phones: {},
});

export function RegisterPatientScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = useStore();
  const upsertPatient = useStore((s) => s.upsertPatient);
  const failSave = useStore((s) => s.failSave);
  const dept = state.department ?? "clinic";

  const [step, setStep] = useState(0);
  const [fileSearch, setFileSearch] = useState("");
  const [draft, setDraft] = useState<DemographicsDraft>(emptyDemographics());
  const [vitals, setVitals] = useState({
    weight: 15,
    height: 100,
    temperature: 37,
    pulse: 95,
    bloodPressureSystolic: 95,
    bloodPressureDiastolic: 60,
    respiratoryRate: 22,
    oxygenSaturation: 98,
  });
  const [medicalNotes, setMedicalNotes] = useState("");

  const existing = state.patients.find((p) => p.fileNoBasma === fileSearch.trim());
  const vFlags = vitalFlags(vitals);

  // uniqueness validation against other patients
  const fileDup =
    !!draft.fileNoBasma &&
    state.patients.some((p) => p.fileNoBasma === draft.fileNoBasma && p.registrationComplete);
  const nidDup =
    !!draft.nationalIdPatient &&
    state.patients.some(
      (p) => p.nationalIdPatient && p.nationalIdPatient === draft.nationalIdPatient,
    );

  const startFromExisting = (p: Patient) => {
    setDraft({
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
    });
    setStep(1);
  };

  const startNew = () => {
    setDraft((d) => ({ ...d, fileNoBasma: fileSearch.trim() || d.fileNoBasma }));
    setStep(1);
  };

  const canAdvanceDemographics =
    draft.fileNoBasma.trim() &&
    draft.firstName.trim() &&
    draft.familyName.trim() &&
    draft.dob &&
    !fileDup &&
    !nidDup;

  const finish = () => {
    if (failSave) {
      toast(ar.saveError, { tone: "error" });
      return;
    }
    const base = existing ?? state.patients.find((p) => p.fileNoBasma === draft.fileNoBasma);
    const patient: Patient = {
      ...(base ?? {
        lifeStatus: "alive",
        diagnosis: "قيد التقييم",
        currentPhase: "تقييم أولي",
        criticalFlags: [],
        registrationDate: new Date().toISOString(),
      }),
      ...draft,
      department: dept,
      basicMedicalNotes: medicalNotes.trim() || base?.basicMedicalNotes,
      registrationComplete: true,
      registrationDate: base?.registrationDate ?? new Date().toISOString(),
    } as Patient;

    upsertPatient(patient);
    // initial vitals
    useStore.getState().addVitals({
      patientFileNo: patient.fileNoBasma,
      weight: vitals.weight,
      height: vitals.height,
      temperature: vitals.temperature,
      pulse: vitals.pulse,
      bloodPressureSystolic: vitals.bloodPressureSystolic,
      bloodPressureDiastolic: vitals.bloodPressureDiastolic,
      respiratoryRate: vitals.respiratoryRate,
      oxygenSaturation: vitals.oxygenSaturation,
    });
    toast(ar.register.successToast);
    navigate(`/patients/${encodeURIComponent(patient.fileNoBasma)}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label={ar.back}>
          <ArrowRight className="size-5" />
        </Button>
        <h1 className="font-display text-xl font-extrabold tracking-tight">{ar.register.title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Stepper step={step + 1} total={4} />
        <span className="text-sm font-bold text-muted-foreground">
          {ar.step} {step + 1} {ar.of} 4 — {ar.register.steps[step]}
        </span>
      </div>

      {/* Step 1 — verify */}
      {step === 0 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-2 font-bold">
              <FileSearch className="size-5 text-primary" />
              {ar.register.verifyTitle}
            </div>
            <p className="text-sm text-muted-foreground">{ar.register.verifyBody}</p>
            <Field label={ar.fileNo} htmlFor="fsearch">
              <Input
                id="fsearch"
                autoFocus
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                placeholder="B-XXXXX"
              />
            </Field>

            {fileSearch.trim() && existing && (
              <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
                <p className="flex items-center gap-2 text-sm font-bold text-warning-foreground">
                  <AlertTriangle className="size-4" />
                  {ar.register.existsFound}
                </p>
                <Button size="sm" onClick={() => startFromExisting(existing)}>
                  {ar.register.openExisting}: {existing.firstName} {existing.familyName}
                </Button>
              </div>
            )}

            {fileSearch.trim() && !existing && (
              <p className="rounded-lg bg-secondary-soft px-3 py-2 text-sm font-bold text-secondary-foreground">
                {ar.register.noExisting}
              </p>
            )}

            <div className="flex justify-end">
              <Button onClick={startNew} disabled={!fileSearch.trim()}>
                {ar.next}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — demographics */}
      {step === 1 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <DemographicsFields draft={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />
            {fileDup && (
              <p className="text-sm font-bold text-destructive">{ar.register.uniqueError}</p>
            )}
            {nidDup && (
              <p className="text-sm font-bold text-destructive">{ar.register.nationalIdError}</p>
            )}
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                {ar.back}
              </Button>
              <Button disabled={!canAdvanceDemographics} onClick={() => setStep(2)}>
                {ar.next}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — initial vitals */}
      {step === 2 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-bold">{ar.register.steps[2]}</h2>
            {vFlags.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-warning/15 px-3 py-2 text-sm font-bold text-warning-foreground">
                <AlertTriangle className="size-4" />
                {ar.vitals.outOfRange}: {vFlags.map((f) => f.label).join("، ")}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`${ar.vitals.weight} (${ar.vitals.units.weight})`}>
                <NumberStepper value={vitals.weight} onChange={(v) => setVitals((s) => ({ ...s, weight: v }))} step={0.5} max={150} />
              </Field>
              <Field label={`${ar.vitals.height} (${ar.vitals.units.height})`}>
                <NumberStepper value={vitals.height} onChange={(v) => setVitals((s) => ({ ...s, height: v }))} max={220} />
              </Field>
              <Field label={`${ar.vitals.temperature} (${ar.vitals.units.temperature})`}>
                <NumberStepper value={vitals.temperature} onChange={(v) => setVitals((s) => ({ ...s, temperature: v }))} step={0.1} min={30} max={43} warn={vFlags.some((f) => f.field === "temperature")} />
              </Field>
              <Field label={`${ar.vitals.pulse} (${ar.vitals.units.pulse})`}>
                <NumberStepper value={vitals.pulse} onChange={(v) => setVitals((s) => ({ ...s, pulse: v }))} max={250} warn={vFlags.some((f) => f.field === "pulse")} />
              </Field>
              <Field label={`${ar.vitals.bp} — ${ar.vitals.sys}`}>
                <NumberStepper value={vitals.bloodPressureSystolic} onChange={(v) => setVitals((s) => ({ ...s, bloodPressureSystolic: v }))} min={40} max={220} />
              </Field>
              <Field label={`${ar.vitals.bp} — ${ar.vitals.dia}`}>
                <NumberStepper value={vitals.bloodPressureDiastolic} onChange={(v) => setVitals((s) => ({ ...s, bloodPressureDiastolic: v }))} min={20} max={150} />
              </Field>
              <Field label={`${ar.vitals.rr} (${ar.vitals.units.rr})`}>
                <NumberStepper value={vitals.respiratoryRate} onChange={(v) => setVitals((s) => ({ ...s, respiratoryRate: v }))} max={80} warn={vFlags.some((f) => f.field === "respiratoryRate")} />
              </Field>
              <Field label={`${ar.vitals.spo2} (${ar.vitals.units.spo2})`}>
                <NumberStepper value={vitals.oxygenSaturation} onChange={(v) => setVitals((s) => ({ ...s, oxygenSaturation: v }))} min={50} max={100} warn={vFlags.some((f) => f.field === "oxygenSaturation")} />
              </Field>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                {ar.back}
              </Button>
              <Button onClick={() => setStep(3)}>{ar.next}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 — notes + save */}
      {step === 3 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-bold">{ar.register.steps[3]}</h2>
            <Field label={ar.register.optionalNotes} htmlFor="mnotes">
              <Textarea
                id="mnotes"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="ملاحظات طبية أولية، تاريخ مرضي، حساسيات…"
              />
            </Field>
            <div className="flex items-center gap-2 rounded-lg bg-primary-soft/60 p-3 text-sm">
              <CheckCircle2 className="size-4 text-primary" />
              {ar.register.readyForReview}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                {ar.back}
              </Button>
              <Button onClick={finish}>
                <Save className="size-4" />
                {ar.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
