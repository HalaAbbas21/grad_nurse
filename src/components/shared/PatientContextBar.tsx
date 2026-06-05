import { useState } from "react";
import { AlertTriangle, ChevronDown, Phone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ar } from "@/i18n/ar";
import { ageLabel, cn } from "@/lib/utils";
import type { Patient } from "@/mock/types";
import { LifeStatusBadge } from "./StatusBadges";

/** Sticky patient identity bar shown on every patient-scoped screen. */
export function PatientContextBar({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const fullName = `${patient.firstName} ${patient.familyName}`;
  const phone =
    patient.phones.caregiver ?? patient.phones.father ?? patient.phones.mother ?? patient.phones.extra;

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto w-full max-w-screen-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label={ar.back}
            className="shrink-0"
          >
            <ArrowRight className="size-5" />
          </Button>
          <Avatar name={fullName} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {/* File number is the PRIMARY identity */}
              <span className="rounded-md bg-primary-soft px-2 py-0.5 font-display text-sm font-extrabold text-primary">
                {patient.fileNoBasma}
              </span>
              <span className="truncate font-bold text-foreground">{fullName}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span>{ageLabel(patient.dob)}</span>
              <span>·</span>
              <span>{ar.genderLabel[patient.gender]}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden truncate sm:inline">{patient.diagnosis}</span>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <LifeStatusBadge status={patient.lifeStatus} />
            {phone && (
              <Button variant="outline" size="sm" onClick={() => (window.location.href = `tel:${phone}`)}>
                <Phone className="size-4" />
                {ar.guardianContact}
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={ar.more}
          >
            <ChevronDown className={cn("size-5 transition-transform", open && "rotate-180")} />
          </Button>
        </div>

        {/* Critical flags + expandable detail (mobile) */}
        {patient.criticalFlags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {patient.criticalFlags.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive"
              >
                <AlertTriangle className="size-3.5" />
                {f}
              </span>
            ))}
          </div>
        )}

        {open && (
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-3 text-xs md:hidden">
            <Detail label={ar.fileNoBiruni} value={patient.fileNoBiruni} />
            <Detail label={ar.department} value={ar.dept[patient.department]} />
            <Detail label={ar.diagnosis} value={patient.diagnosis} />
            <div className="flex items-center justify-between">
              <LifeStatusBadge status={patient.lifeStatus} />
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1 font-bold text-primary"
                >
                  <Phone className="size-3.5" />
                  اتصال
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
