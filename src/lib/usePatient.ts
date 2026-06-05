import { useParams } from "react-router-dom";
import { useStore } from "@/store/useStore";
import type { Patient } from "@/mock/types";

/** Resolve the :fileNo route param to a patient (or undefined). */
export function usePatient(): { fileNo: string; patient: Patient | undefined } {
  const { fileNo = "" } = useParams();
  const decoded = decodeURIComponent(fileNo);
  const patient = useStore((s) => s.patients.find((p) => p.fileNoBasma === decoded));
  return { fileNo: decoded, patient };
}
