import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ar } from "@/i18n/ar";
import type {
  Caregiver,
  CaregiverEducation,
  Gender,
  Nationality,
  Patient,
} from "@/mock/types";

/** Mutable subset of a patient the nurse may create/edit. */
export type DemographicsDraft = Pick<
  Patient,
  | "fileNoBasma"
  | "fileNoBiruni"
  | "nationalIdPatient"
  | "nationalIdFather"
  | "firstName"
  | "familyName"
  | "fatherName"
  | "motherName"
  | "dob"
  | "gender"
  | "nationality"
  | "residence"
  | "caregiver"
  | "caregiverEducation"
  | "phones"
>;

const enumOpts = <T extends string>(rec: Record<T, string>) =>
  (Object.keys(rec) as T[]).map((k) => ({ value: k, label: rec[k] }));

interface Props {
  draft: DemographicsDraft;
  onChange: (patch: Partial<DemographicsDraft>) => void;
  /** file number editable only during initial registration */
  lockFileNo?: boolean;
}

export function DemographicsFields({ draft, onChange, lockFileNo }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={ar.fileNo} htmlFor="fileNoBasma">
        <Input
          id="fileNoBasma"
          value={draft.fileNoBasma}
          disabled={lockFileNo}
          onChange={(e) => onChange({ fileNoBasma: e.target.value })}
        />
      </Field>
      <Field label={ar.fileNoBiruni} htmlFor="fileNoBiruni" hint="xxxx/yyyy">
        <Input
          id="fileNoBiruni"
          value={draft.fileNoBiruni}
          onChange={(e) => onChange({ fileNoBiruni: e.target.value })}
        />
      </Field>

      <Field label={ar.demo.firstName} htmlFor="firstName">
        <Input
          id="firstName"
          value={draft.firstName}
          onChange={(e) => onChange({ firstName: e.target.value })}
        />
      </Field>
      <Field label={ar.demo.familyName} htmlFor="familyName">
        <Input
          id="familyName"
          value={draft.familyName}
          onChange={(e) => onChange({ familyName: e.target.value })}
        />
      </Field>
      <Field label={ar.demo.fatherName} htmlFor="fatherName">
        <Input
          id="fatherName"
          value={draft.fatherName}
          onChange={(e) => onChange({ fatherName: e.target.value })}
        />
      </Field>
      <Field label={ar.demo.motherName} htmlFor="motherName">
        <Input
          id="motherName"
          value={draft.motherName}
          onChange={(e) => onChange({ motherName: e.target.value })}
        />
      </Field>

      <Field label={ar.demo.dob} htmlFor="dob">
        <Input
          id="dob"
          type="date"
          value={draft.dob}
          onChange={(e) => onChange({ dob: e.target.value })}
        />
      </Field>
      <Field label={ar.gender}>
        <Select
          value={draft.gender}
          onValueChange={(v) => onChange({ gender: v as Gender })}
          options={enumOpts(ar.genderLabel)}
        />
      </Field>

      <Field label={ar.demo.nationalIdPatient} htmlFor="nidp">
        <Input
          id="nidp"
          inputMode="numeric"
          value={draft.nationalIdPatient ?? ""}
          onChange={(e) => onChange({ nationalIdPatient: e.target.value })}
        />
      </Field>
      <Field label={ar.demo.nationalIdFather} htmlFor="nidf">
        <Input
          id="nidf"
          inputMode="numeric"
          value={draft.nationalIdFather ?? ""}
          onChange={(e) => onChange({ nationalIdFather: e.target.value })}
        />
      </Field>

      <Field label={ar.demo.nationality}>
        <Select
          value={draft.nationality}
          onValueChange={(v) => onChange({ nationality: v as Nationality })}
          options={enumOpts(ar.nationality)}
        />
      </Field>
      <Field label={ar.demo.caregiver}>
        <Select
          value={draft.caregiver}
          onValueChange={(v) => onChange({ caregiver: v as Caregiver })}
          options={enumOpts(ar.caregiver)}
        />
      </Field>

      <Field label={ar.demo.country} htmlFor="country">
        <Input
          id="country"
          value={draft.residence.country}
          onChange={(e) => onChange({ residence: { ...draft.residence, country: e.target.value } })}
        />
      </Field>
      <Field label={ar.demo.governorate} htmlFor="gov">
        <Input
          id="gov"
          value={draft.residence.governorate}
          onChange={(e) =>
            onChange({ residence: { ...draft.residence, governorate: e.target.value } })
          }
        />
      </Field>
      <Field label={ar.demo.city} htmlFor="city">
        <Input
          id="city"
          value={draft.residence.city}
          onChange={(e) => onChange({ residence: { ...draft.residence, city: e.target.value } })}
        />
      </Field>
      <Field label={ar.demo.caregiverEducation}>
        <Select
          value={draft.caregiverEducation}
          onValueChange={(v) => onChange({ caregiverEducation: v as CaregiverEducation })}
          options={enumOpts(ar.caregiverEducation)}
        />
      </Field>

      <Field label={ar.demo.phoneFather} htmlFor="pf">
        <Input
          id="pf"
          inputMode="tel"
          value={draft.phones.father ?? ""}
          onChange={(e) => onChange({ phones: { ...draft.phones, father: e.target.value } })}
        />
      </Field>
      <Field label={ar.demo.phoneMother} htmlFor="pm">
        <Input
          id="pm"
          inputMode="tel"
          value={draft.phones.mother ?? ""}
          onChange={(e) => onChange({ phones: { ...draft.phones, mother: e.target.value } })}
        />
      </Field>
      <Field label={ar.demo.phoneCaregiver} htmlFor="pc">
        <Input
          id="pc"
          inputMode="tel"
          value={draft.phones.caregiver ?? ""}
          onChange={(e) => onChange({ phones: { ...draft.phones, caregiver: e.target.value } })}
        />
      </Field>
      <Field label={ar.demo.phoneExtra} htmlFor="pe">
        <Input
          id="pe"
          inputMode="tel"
          value={draft.phones.extra ?? ""}
          onChange={(e) => onChange({ phones: { ...draft.phones, extra: e.target.value } })}
        />
      </Field>
    </div>
  );
}
