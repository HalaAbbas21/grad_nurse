import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText } from "lucide-react";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ar } from "@/i18n/ar";
import { ageLabel } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { LifeStatusBadge } from "./StatusBadges";

/** File-number-first command palette. Names are secondary. */
export function CommandSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const patients = useStore((s) => s.patients);
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return patients.slice(0, 8);
    // file number first, then biruni, then name
    return patients
      .map((p) => {
        const file = p.fileNoBasma.toLowerCase();
        const biruni = p.fileNoBiruni.toLowerCase();
        const name = `${p.firstName} ${p.familyName} ${p.fatherName}`.toLowerCase();
        let score = -1;
        if (file.includes(term)) score = file.startsWith(`b-${term}`) || file.includes(term) ? 0 : 1;
        else if (biruni.includes(term)) score = 2;
        else if (name.includes(term)) score = 3;
        return { p, score };
      })
      .filter((r) => r.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map((r) => r.p);
  }, [q, patients]);

  const go = (fileNo: string) => {
    onClose();
    navigate(`/patients/${encodeURIComponent(fileNo)}`);
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ar.searchByFileNo}
            className="ps-10 text-lg"
            inputMode="search"
          />
        </div>
        <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
          {results.length === 0 && (
            <li className="py-8 text-center text-sm text-muted-foreground">{ar.patients.empty}</li>
          )}
          {results.map((p) => (
            <li key={p.fileNoBasma}>
              <button
                onClick={() => go(p.fileNoBasma)}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-start transition-colors hover:bg-muted"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-primary">{p.fileNoBasma}</span>
                    <span className="truncate font-bold text-foreground">
                      {p.firstName} {p.familyName}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ageLabel(p.dob)} · {ar.dept[p.department]}
                  </div>
                </div>
                <LifeStatusBadge status={p.lifeStatus} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
