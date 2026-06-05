import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Compute age in years from an ISO date-of-birth string, relative to `now`. */
export function computeAge(dob: string, now: Date = new Date()): number {
  const birth = new Date(dob);
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

/** Arabic age label: years, or months for infants. */
export function ageLabel(dob: string, now: Date = new Date()): string {
  const birth = new Date(dob);
  const years = computeAge(dob, now);
  if (years >= 2) return `${years} سنة`;
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  return `${Math.max(0, months)} شهر`;
}

/** Minutes between two ISO timestamps. */
export function minutesBetween(fromIso: string, to: Date = new Date()): number {
  return Math.round((to.getTime() - new Date(fromIso).getTime()) / 60000);
}

/** Friendly Arabic "waited X" duration. */
export function waitLabel(fromIso: string, now: Date = new Date()): string {
  const mins = minutesBetween(fromIso, now);
  if (mins < 1) return "الآن";
  if (mins < 60) return `${mins} دقيقة`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${h} س ${rem} د` : `${h} ساعة`;
}

/** Format an ISO timestamp as Arabic-locale date+time (Gregorian). */
export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Simulated network latency for mock async calls. */
export function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
