import { useState } from "react";
import { Droplet, FlaskConical, Info } from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { PatientScreen } from "@/components/layout/PatientScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/shared/States";
import { LabStatusBadge } from "@/components/shared/StatusBadges";
import { fmtDateTime } from "@/lib/utils";
import type { LabTestRequest } from "@/mock/types";

export function LabDrawScreen() {
  return <PatientScreen>{(p) => <LabDrawInner fileNo={p.fileNoBasma} />}</PatientScreen>;
}

function LabDrawInner({ fileNo }: { fileNo: string }) {
  const labs = useStore((s) => s.labs.filter((l) => l.patientFileNo === fileNo));
  const recordDraw = useStore((s) => s.recordLabDraw);
  const failSave = useStore((s) => s.failSave);
  const { toast } = useToast();
  const [active, setActive] = useState<LabTestRequest | null>(null);
  const [notes, setNotes] = useState("");

  const toDraw = labs.filter((l) => l.status === "requested-to-draw");

  const openDraw = (lab: LabTestRequest) => {
    setActive(lab);
    setNotes("");
  };

  const confirm = () => {
    if (!active) return;
    if (failSave) {
      toast(ar.saveError, { tone: "error" });
      return;
    }
    recordDraw(active.id, notes.trim() || undefined);
    setActive(null);
    toast(ar.labs.drawnNote, { tone: "success" });
  };

  return (
    <>
      <h1 className="font-display text-xl font-extrabold tracking-tight">{ar.labs.title}</h1>

      <div className="flex items-start gap-2 rounded-lg bg-primary-soft/60 p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>{ar.labs.drawnNote}</span>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="font-bold">{ar.labs.title}</h2>
          {labs.length === 0 ? (
            <EmptyState message={ar.labs.empty} />
          ) : (
            <ul className="space-y-2">
              {labs.map((l) => (
                <li key={l.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="size-4 shrink-0 text-primary" />
                        <span className="font-bold">{l.testType}</span>
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
                        {l.drawTime && (
                          <>
                            <span>·</span>
                            <span>
                              {ar.labs.drawTime}: {fmtDateTime(l.drawTime)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <LabStatusBadge status={l.status} />
                  </div>
                  {l.status === "requested-to-draw" && (
                    <Button size="sm" className="mt-3 w-full sm:w-auto" onClick={() => openDraw(l)}>
                      <Droplet className="size-4" />
                      {ar.labs.record}
                    </Button>
                  )}
                  {l.resultSummary && (
                    <p className="mt-2 rounded-md bg-secondary-soft px-2 py-1 text-xs font-bold text-secondary-foreground">
                      {ar.labs.result}: {l.resultSummary}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          {labs.length > 0 && toDraw.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">{ar.labs.empty}</p>
          )}
        </CardContent>
      </Card>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={ar.labs.record}
        description={active?.testType}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>
              {ar.cancel}
            </Button>
            <Button onClick={confirm}>
              <Droplet className="size-4" />
              {ar.labStatus.drawn}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label={ar.labs.sampleNotes} htmlFor="notes" hint="اختياري">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم السحب من الوريد المحيطي، العينة سليمة"
            />
          </Field>
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            {ar.labs.drawnNote}
          </p>
        </div>
      </Modal>
    </>
  );
}
