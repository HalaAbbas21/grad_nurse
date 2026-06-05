import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Plus, Save } from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { PatientScreen } from "@/components/layout/PatientScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/shared/States";
import { cn, fmtDateTime } from "@/lib/utils";

export function CareScreen() {
  return <PatientScreen>{(p) => <CareInner fileNo={p.fileNoBasma} />}</PatientScreen>;
}

function CareInner({ fileNo }: { fileNo: string }) {
  const docs = useStore((s) => s.careDocs.filter((c) => c.patientFileNo === fileNo));
  const addCareDoc = useStore((s) => s.addCareDoc);
  const failSave = useStore((s) => s.failSave);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [notes, setNotes] = useState("");
  const [observations, setObservations] = useState("");
  const [procedures, setProcedures] = useState<string[]>([]);

  const toggleProc = (p: string) =>
    setProcedures((arr) => (arr.includes(p) ? arr.filter((x) => x !== p) : [...arr, p]));

  const canSave = notes.trim().length > 0 || procedures.length > 0;

  const save = () => {
    if (!canSave) return;
    if (failSave) {
      toast(ar.saveError, { tone: "error" });
      return;
    }
    addCareDoc({
      patientFileNo: fileNo,
      notes: notes.trim(),
      procedures,
      observations: observations.trim() || undefined,
    });
    toast(ar.care.successToast);
    navigate(`/patients/${encodeURIComponent(fileNo)}`);
  };

  const sorted = [...docs].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <>
      <h1 className="font-display text-xl font-extrabold tracking-tight">{ar.care.title}</h1>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Field label={ar.care.procedures}>
            <div className="flex flex-wrap gap-2">
              {ar.care.procedurePresets.map((p) => {
                const on = procedures.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleProc(p)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-bold transition-colors",
                      on
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {on ? "✓ " : <Plus className="me-1 inline size-3.5" />}
                    {p}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label={ar.care.notes} htmlFor="notes">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="صف الرعاية المقدّمة وحالة الطفل…"
              className="min-h-[120px]"
            />
          </Field>

          <Field label={ar.care.observations} htmlFor="obs" hint="اختياري">
            <Textarea
              id="obs"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="sticky bottom-20 z-10 lg:bottom-4">
        <Button size="lg" className="w-full shadow-soft" onClick={save} disabled={!canSave}>
          <Save className="size-5" />
          {ar.save}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="flex items-center gap-2 font-bold">
            <ClipboardList className="size-4 text-primary" />
            {ar.care.title}
          </h2>
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
    </>
  );
}
