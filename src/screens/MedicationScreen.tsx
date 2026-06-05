import { useState } from "react";
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  Syringe,
  UserCheck,
} from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { PatientScreen } from "@/components/layout/PatientScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Input, Field } from "@/components/ui/input";
import { Stepper } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/shared/States";
import { MarList } from "@/components/shared/MarList";
import {
  FiveRightsChecklist,
  EMPTY_FIVE_RIGHTS,
  allRightsConfirmed,
  type FiveRights,
} from "@/components/shared/FiveRightsChecklist";
import { cn, fmtDateTime } from "@/lib/utils";
import type { MARItem, Patient } from "@/mock/types";

export function MedicationScreen() {
  return <PatientScreen>{(p) => <MedicationInner patient={p} />}</PatientScreen>;
}

function MedicationInner({ patient }: { patient: Patient }) {
  const meds = useStore((s) => s.mar.filter((m) => m.patientFileNo === patient.fileNoBasma));
  const [active, setActive] = useState<MARItem | null>(null);

  const pending = meds.filter((m) => m.administrationStatus !== "administered");
  const done = meds.filter((m) => m.administrationStatus === "administered");

  return (
    <>
      <h1 className="font-display text-xl font-extrabold tracking-tight">{ar.med.mar}</h1>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="font-bold">{ar.med.title}</h2>
          {pending.length === 0 ? (
            <EmptyState message={ar.med.empty} />
          ) : (
            <MarList items={pending} onAdminister={(m) => setActive(m)} />
          )}
        </CardContent>
      </Card>

      {done.length > 0 && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <h2 className="font-bold text-muted-foreground">{ar.med.administeredAt}</h2>
            <MarList items={done} />
          </CardContent>
        </Card>
      )}

      {active && (
        <AdministerFlow item={active} patient={patient} onClose={() => setActive(null)} />
      )}
    </>
  );
}

// ── Guided administration flow ────────────────────────────────
function AdministerFlow({
  item,
  patient,
  onClose,
}: {
  item: MARItem;
  patient: Patient;
  onClose: () => void;
}) {
  const administerDose = useStore((s) => s.administerDose);
  const undoAdminister = useStore((s) => s.undoAdminister);
  const failSave = useStore((s) => s.failSave);
  const { toast } = useToast();

  const [step, setStep] = useState(0); // 0 verify, 1 five-rights, 2 record
  const [fileInput, setFileInput] = useState("");
  const [rights, setRights] = useState<FiveRights>(EMPTY_FIVE_RIGHTS);

  const matched = fileInput.trim() === patient.fileNoBasma;
  const allChecked = allRightsConfirmed(rights);

  const record = () => {
    if (failSave) {
      toast(ar.saveError, { tone: "error" });
      return;
    }
    const adminId = administerDose(item.id);
    onClose();
    toast(ar.med.successToast, {
      tone: "success",
      onUndo: () => undoAdminister(adminId),
    });
  };

  const titles = [ar.med.verifyTitle, ar.med.fiveRights, ar.med.recordTitle];

  return (
    <Modal
      open
      onClose={onClose}
      title={titles[step]}
      description={`${item.medName} · ${item.dose}`}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between">
          <Stepper step={step + 1} total={3} />
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                {ar.back}
              </Button>
            )}
            {step === 0 && (
              <Button disabled={!matched} onClick={() => setStep(1)}>
                {ar.next}
              </Button>
            )}
            {step === 1 && (
              <Button disabled={!allChecked} onClick={() => setStep(2)}>
                {ar.next}
              </Button>
            )}
            {step === 2 && (
              <Button onClick={record}>
                <Syringe className="size-4" />
                {ar.med.confirmAdminister}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {step === 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCheck className="size-5 text-primary" />
            {ar.med.verifyBody}
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-xs text-muted-foreground">{ar.fileNo}</div>
            <div className="font-display text-2xl font-extrabold text-primary">
              {patient.fileNoBasma}
            </div>
            <div className="text-sm font-bold">
              {patient.firstName} {patient.familyName}
            </div>
          </div>
          <Field label={ar.fileNo} htmlFor="verify">
            <Input
              id="verify"
              autoFocus
              value={fileInput}
              onChange={(e) => setFileInput(e.target.value)}
              placeholder={patient.fileNoBasma}
              inputMode="text"
            />
          </Field>
          {fileInput.length > 0 && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold",
                matched
                  ? "bg-secondary-soft text-secondary-foreground"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {matched ? <CheckCircle2 className="size-4" /> : <Lock className="size-4" />}
              {matched ? ar.med.verifyMatch : ar.med.verifyMismatch}
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-5 text-secondary" />
            {ar.med.fiveRightsBody}
          </div>
          <FiveRightsChecklist item={item} value={rights} onChange={setRights} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <RecordRow label={ar.med.medName} value={item.medName} />
          <RecordRow label={ar.med.dose} value={item.dose} />
          <RecordRow label={ar.med.route} value={ar.medRoute[item.route]} />
          <RecordRow label={ar.med.timeDate} value={fmtDateTime(new Date().toISOString())} />
          <RecordRow label={ar.med.administeringNurse} value="رنا حدّاد" />
          <div className="flex items-center gap-2 rounded-lg bg-secondary-soft px-3 py-2 text-sm font-bold text-secondary-foreground">
            <ShieldCheck className="size-4" />
            {ar.med.fiveRights}: ✓
          </div>
        </div>
      )}
    </Modal>
  );
}

function RecordRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
