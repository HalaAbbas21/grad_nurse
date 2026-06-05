import { Switch } from "@/components/ui/switch";
import { ar } from "@/i18n/ar";
import type { MARItem } from "@/mock/types";

export interface FiveRights {
  patient: boolean;
  drug: boolean;
  dose: boolean;
  time: boolean;
  route: boolean;
}

export const EMPTY_FIVE_RIGHTS: FiveRights = {
  patient: false,
  drug: false,
  dose: false,
  time: false,
  route: false,
};

export function allRightsConfirmed(r: FiveRights): boolean {
  return r.patient && r.drug && r.dose && r.time && r.route;
}

interface Props {
  item: MARItem;
  value: FiveRights;
  onChange: (v: FiveRights) => void;
}

/** The "Five Rights" safety checklist — each must be confirmed before recording a dose. */
export function FiveRightsChecklist({ item, value, onChange }: Props) {
  const rows: { key: keyof FiveRights; label: string; detail: string }[] = [
    { key: "patient", label: ar.med.rightPatient, detail: item.patientFileNo },
    { key: "drug", label: ar.med.rightDrug, detail: item.medName },
    { key: "dose", label: ar.med.rightDose, detail: item.dose },
    { key: "time", label: ar.med.rightTime, detail: ar.medRoute[item.route] ? new Date(item.scheduledTime).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "" },
    { key: "route", label: ar.med.rightRoute, detail: ar.medRoute[item.route] },
  ];

  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li
          key={row.key}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
        >
          <div className="min-w-0">
            <div className="font-bold text-foreground">{row.label}</div>
            <div className="truncate text-sm text-muted-foreground">{row.detail}</div>
          </div>
          <Switch
            checked={value[row.key]}
            onCheckedChange={(c) => onChange({ ...value, [row.key]: c })}
            aria-label={row.label}
          />
        </li>
      ))}
    </ul>
  );
}
