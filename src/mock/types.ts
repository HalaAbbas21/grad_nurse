// ─────────────────────────────────────────────────────────────
// Data dictionary (§7) — fully typed domain model. No `any`.
// ─────────────────────────────────────────────────────────────

export type Department = "clinic" | "daycare" | "inpatient";

export type Gender = "male" | "female";

export type Nationality = "syrian" | "syrian-palestinian" | "other";

export type Caregiver =
  | "both-parents"
  | "father-only"
  | "mother-only"
  | "grandparent"
  | "relative"
  | "other";

export type CaregiverEducation =
  | "illiterate"
  | "primary"
  | "preparatory"
  | "secondary"
  | "university";

export type LifeStatus =
  | "alive"
  | "deceased"
  | "treatment-abandoned"
  | "lost-to-followup"
  | "unknown";

export interface Nurse {
  id: string;
  firstName: string;
  lastName: string;
  contactEmail: string;
  department: Department;
}

export interface Residence {
  country: string;
  governorate: string;
  city: string;
}

export interface Phones {
  father?: string;
  mother?: string;
  caregiver?: string;
  extra?: string;
}

export interface Patient {
  fileNoBasma: string; // PRIMARY identity
  fileNoBiruni: string; // xxxx/yyyy
  nationalIdPatient?: string;
  nationalIdFather?: string;
  firstName: string;
  familyName: string;
  fatherName: string;
  motherName: string;
  dob: string; // ISO date
  gender: Gender;
  nationality: Nationality;
  residence: Residence;
  caregiver: Caregiver;
  caregiverEducation: CaregiverEducation;
  phones: Phones;
  lifeStatus: LifeStatus;
  diagnosis: string; // read-only (doctor scope)
  currentPhase: string; // read-only (doctor scope)
  criticalFlags: string[]; // allergies / alerts
  department: Department;
  basicMedicalNotes?: string;
  registrationDate: string; // ISO
  /** Whether the nurse has completed registration for a new clinic case. */
  registrationComplete: boolean;
}

export interface Vitals {
  id: string;
  patientFileNo: string;
  nurseId: string;
  weight: number; // kg
  height: number; // cm
  temperature: number; // °C
  pulse: number; // bpm
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  respiratoryRate: number;
  oxygenSaturation?: number; // %
  painScore?: number; // 0–10
  recordedAt: string; // ISO
}

export type LabKind = "internal" | "external";
export type LabPriority = "routine" | "urgent";
export type LabStatus = "requested-to-draw" | "drawn" | "results-available";

export interface LabTestRequest {
  id: string;
  patientFileNo: string;
  doctorId: string; // requestedBy
  testType: string;
  labKind: LabKind;
  priority: LabPriority;
  status: LabStatus;
  preDose: boolean; // gates a dose (lab-before-dose chain)
  drawnByNurseId?: string;
  drawTime?: string; // ISO
  sampleNotes?: string;
  resultSummary?: string;
}

export type MedRoute = "IV" | "PO" | "IM" | "SC" | "IT";
export type ApprovalStatus = "pending" | "approved";
export type AdministrationStatus = "scheduled" | "ready" | "administered" | "missed";

export interface MARItem {
  id: string;
  patientFileNo: string;
  medName: string;
  dose: string;
  route: MedRoute;
  scheduledTime: string; // ISO
  approvedByDoctor: boolean;
  approvalStatus: ApprovalStatus;
  administrationStatus: AdministrationStatus;
  /** Reason a dose is blocked, if any (e.g. awaiting lab result). */
  blockedReason?: string;
}

export interface MedicationAdministration {
  id: string;
  marItemId: string;
  patientFileNo: string;
  nurseId: string;
  medName: string;
  dose: string;
  route: MedRoute;
  administeredTime: string; // ISO
  administeredDate: string; // ISO date
  fiveRightsConfirmed: boolean;
}

export interface CareDocumentation {
  id: string;
  patientFileNo: string;
  nurseId: string;
  notes: string;
  procedures: string[];
  observations?: string;
  createdAt: string; // ISO
}

export type AppointmentStatus = "scheduled" | "checked-in" | "checked-out" | "cancelled";

export interface Appointment {
  id: string;
  patientFileNo: string;
  dateTime: string; // ISO
  type: string;
  status: AppointmentStatus;
  assignedNurseId?: string;
  notes?: string;
}

export type NotificationType = "alert" | "info" | "reminder";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  relatedPatientFileNo?: string;
  timestamp: string; // ISO
  isRead: boolean;
  /** Optional deep-link route segment relative to the patient, e.g. "medication". */
  deepLink?: "medication" | "lab-draw" | "vitals" | "care" | "register";
}

/** What a patient most urgently needs — drives queue/dashboard task chips. */
export type TaskKind =
  | "register"
  | "vitals"
  | "draw-lab"
  | "give-dose"
  | "document-care"
  | "update-appointment";
