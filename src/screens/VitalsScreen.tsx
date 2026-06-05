import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, HeartPulse, Save } from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { latestVitals, vitalFlags } from "@/lib/derive";
import { PatientScreen } from "@/components/layout/PatientScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { NumberStepper } from "@/components/ui/number-stepper";
import { VitalsTrend } from "@/components/shared/VitalsTrend";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/shared/States";

interface VitalsForm {
  weight: number;
  height: number;
  temperature: number;
  pulse: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  painScore: number;
}

export function VitalsScreen() {
  return <PatientScreen>{(p) => <VitalsInner fileNo={p.fileNoBasma} />}</PatientScreen>;
}

function VitalsInner({ fileNo }: { fileNo: string }) {
  const state = useStore();
  const addVitals = useStore((s) => s.addVitals);
  const failSave = useStore((s) => s.failSave);
  const { toast } = useToast();
  const navigate = useNavigate();
  const prev = latestVitals(state, fileNo);

  const [form, setForm] = useState<VitalsForm>({
    weight: prev?.weight ?? 20,
    height: prev?.height ?? 110,
    temperature: prev?.temperature ?? 37,
    pulse: prev?.pulse ?? 90,
    bloodPressureSystolic: prev?.bloodPressureSystolic ?? 100,
    bloodPressureDiastolic: prev?.bloodPressureDiastolic ?? 65,
    respiratoryRate: prev?.respiratoryRate ?? 20,
    oxygenSaturation: prev?.oxygenSaturation ?? 98,
    painScore: prev?.painScore ?? 0,
  });

  const set = (patch: Partial<VitalsForm>) => setForm((f) => ({ ...f, ...patch }));
  const flags = vitalFlags(form);
  const flagFor = (field: keyof VitalsForm) =>
    flags.some((fl) => fl.field === (field as never));

  const readings = state.vitals.filter((v) => v.patientFileNo === fileNo);

  const save = () => {
    if (failSave) {
      toast(ar.saveError, { tone: "error" });
      return;
    }
    addVitals({
      patientFileNo: fileNo,
      weight: form.weight,
      height: form.height,
      temperature: form.temperature,
      pulse: form.pulse,
      bloodPressureSystolic: form.bloodPressureSystolic,
      bloodPressureDiastolic: form.bloodPressureDiastolic,
      respiratoryRate: form.respiratoryRate,
      oxygenSaturation: form.oxygenSaturation,
      painScore: form.painScore,
    });
    toast(ar.saved);
    navigate(`/patients/${encodeURIComponent(fileNo)}`);
  };

  return (
    <>
      <h1 className="font-display text-xl font-extrabold tracking-tight">{ar.vitals.record}</h1>

      {flags.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-warning/15 px-3 py-2 text-sm font-bold text-warning-foreground">
          <AlertTriangle className="size-4" />
          {ar.vitals.outOfRange}: {flags.map((f) => f.label).join("، ")}
        </div>
      )}

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <Field label={`${ar.vitals.weight} (${ar.vitals.units.weight})`}>
            <NumberStepper value={form.weight} onChange={(v) => set({ weight: v })} step={0.5} min={0} max={150} />
          </Field>
          <Field label={`${ar.vitals.height} (${ar.vitals.units.height})`}>
            <NumberStepper value={form.height} onChange={(v) => set({ height: v })} step={1} min={0} max={220} />
          </Field>
          <Field label={`${ar.vitals.temperature} (${ar.vitals.units.temperature})`}>
            <NumberStepper
              value={form.temperature}
              onChange={(v) => set({ temperature: v })}
              step={0.1}
              min={30}
              max={43}
              warn={flagFor("temperature")}
            />
          </Field>
          <Field label={`${ar.vitals.pulse} (${ar.vitals.units.pulse})`}>
            <NumberStepper
              value={form.pulse}
              onChange={(v) => set({ pulse: v })}
              step={1}
              min={0}
              max={250}
              warn={flagFor("pulse")}
            />
          </Field>
          <Field label={`${ar.vitals.bp} — ${ar.vitals.sys}`}>
            <NumberStepper
              value={form.bloodPressureSystolic}
              onChange={(v) => set({ bloodPressureSystolic: v })}
              step={1}
              min={40}
              max={220}
            />
          </Field>
          <Field label={`${ar.vitals.bp} — ${ar.vitals.dia}`}>
            <NumberStepper
              value={form.bloodPressureDiastolic}
              onChange={(v) => set({ bloodPressureDiastolic: v })}
              step={1}
              min={20}
              max={150}
            />
          </Field>
          <Field label={`${ar.vitals.rr} (${ar.vitals.units.rr})`}>
            <NumberStepper
              value={form.respiratoryRate}
              onChange={(v) => set({ respiratoryRate: v })}
              step={1}
              min={0}
              max={80}
              warn={flagFor("respiratoryRate")}
            />
          </Field>
          <Field label={`${ar.vitals.spo2} (${ar.vitals.units.spo2})`}>
            <NumberStepper
              value={form.oxygenSaturation}
              onChange={(v) => set({ oxygenSaturation: v })}
              step={1}
              min={50}
              max={100}
              warn={flagFor("oxygenSaturation")}
            />
          </Field>
          <Field label={`${ar.vitals.pain} (0–10)`} className="sm:col-span-2">
            <NumberStepper value={form.painScore} onChange={(v) => set({ painScore: v })} step={1} min={0} max={10} />
          </Field>
        </CardContent>
      </Card>

      <div className="sticky bottom-20 z-10 lg:bottom-4">
        <Button size="lg" className="w-full shadow-soft" onClick={save}>
          <Save className="size-5" />
          {ar.save}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="flex items-center gap-2 font-bold">
            <HeartPulse className="size-4 text-primary" />
            {ar.vitals.history}
          </h2>
          {readings.length === 0 ? (
            <EmptyState message={ar.vitals.empty} />
          ) : (
            <VitalsTrend readings={readings} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
