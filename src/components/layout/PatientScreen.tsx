import { PatientContextBar } from "@/components/shared/PatientContextBar";
import { PatientNotFound } from "@/components/shared/PatientNotFound";
import { usePatient } from "@/lib/usePatient";
import type { Patient } from "@/mock/types";

/** Wrapper for patient-scoped flow screens: sticky context bar + constrained content. */
export function PatientScreen({
  children,
}: {
  children: (patient: Patient) => React.ReactNode;
}) {
  const { patient } = usePatient();
  if (!patient) return <PatientNotFound />;
  return (
    <>
      <PatientContextBar patient={patient} />
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 pb-28 pt-4 lg:pb-12">
        {children(patient)}
      </div>
    </>
  );
}
