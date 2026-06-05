import { create } from "zustand";
import type {
  Appointment,
  AppNotification,
  AppointmentStatus,
  CareDocumentation,
  Department,
  LabTestRequest,
  MARItem,
  MedicationAdministration,
  Nurse,
  Patient,
  Vitals,
} from "@/mock/types";
import {
  APPOINTMENTS,
  CARE_DOCS,
  CURRENT_NURSE,
  LAB_REQUESTS,
  MAR_ITEMS,
  MED_ADMINISTRATIONS,
  NOTIFICATIONS,
  PATIENTS,
  VITALS,
} from "@/mock/seed";

let seq = 1000;
const uid = (prefix: string): string => `${prefix}-${++seq}`;

export interface AppState {
  // session
  isAuthenticated: boolean;
  nurse: Nurse;
  department: Department | null;

  // data
  patients: Patient[];
  vitals: Vitals[];
  labs: LabTestRequest[];
  mar: MARItem[];
  administrations: MedicationAdministration[];
  careDocs: CareDocumentation[];
  appointments: Appointment[];
  notifications: AppNotification[];

  // dev toggle
  failSave: boolean;

  // session actions
  login: () => void;
  logout: () => void;
  setDepartment: (d: Department) => void;
  setFailSave: (v: boolean) => void;

  // writes
  addVitals: (v: Omit<Vitals, "id" | "nurseId" | "recordedAt">) => void;
  recordLabDraw: (labId: string, sampleNotes?: string, drawTime?: string) => void;
  administerDose: (marItemId: string) => string; // returns administration id (for undo)
  undoAdminister: (administrationId: string) => void;
  addCareDoc: (doc: Omit<CareDocumentation, "id" | "nurseId" | "createdAt">) => void;
  upsertPatient: (patient: Patient) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;

  // notifications
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  nurse: CURRENT_NURSE,
  department: null,

  patients: PATIENTS,
  vitals: VITALS,
  labs: LAB_REQUESTS,
  mar: MAR_ITEMS,
  administrations: MED_ADMINISTRATIONS,
  careDocs: CARE_DOCS,
  appointments: APPOINTMENTS,
  notifications: NOTIFICATIONS,

  failSave: false,

  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false, department: null }),
  setDepartment: (d) =>
    set((s) => ({ department: d, nurse: { ...s.nurse, department: d } })),
  setFailSave: (v) => set({ failSave: v }),

  addVitals: (v) =>
    set((s) => ({
      vitals: [
        ...s.vitals,
        { ...v, id: uid("vit"), nurseId: s.nurse.id, recordedAt: new Date().toISOString() },
      ],
    })),

  recordLabDraw: (labId, sampleNotes, drawTime) =>
    set((s) => ({
      labs: s.labs.map((l) =>
        l.id === labId
          ? {
              ...l,
              status: "drawn",
              drawnByNurseId: s.nurse.id,
              drawTime: drawTime ?? new Date().toISOString(),
              sampleNotes: sampleNotes ?? l.sampleNotes,
            }
          : l,
      ),
    })),

  administerDose: (marItemId) => {
    const s = get();
    const item = s.mar.find((m) => m.id === marItemId);
    const adminId = uid("adm");
    if (!item) return adminId;
    const now = new Date().toISOString();
    set({
      mar: s.mar.map((m) =>
        m.id === marItemId ? { ...m, administrationStatus: "administered" } : m,
      ),
      administrations: [
        ...s.administrations,
        {
          id: adminId,
          marItemId,
          patientFileNo: item.patientFileNo,
          nurseId: s.nurse.id,
          medName: item.medName,
          dose: item.dose,
          route: item.route,
          administeredTime: now,
          administeredDate: now,
          fiveRightsConfirmed: true,
        },
      ],
    });
    return adminId;
  },

  undoAdminister: (administrationId) =>
    set((s) => {
      const adm = s.administrations.find((a) => a.id === administrationId);
      if (!adm) return {};
      return {
        administrations: s.administrations.filter((a) => a.id !== administrationId),
        mar: s.mar.map((m) =>
          m.id === adm.marItemId ? { ...m, administrationStatus: "ready" } : m,
        ),
      };
    }),

  addCareDoc: (doc) =>
    set((s) => ({
      careDocs: [
        ...s.careDocs,
        { ...doc, id: uid("care"), nurseId: s.nurse.id, createdAt: new Date().toISOString() },
      ],
    })),

  upsertPatient: (patient) =>
    set((s) => {
      const exists = s.patients.some((p) => p.fileNoBasma === patient.fileNoBasma);
      return {
        patients: exists
          ? s.patients.map((p) => (p.fileNoBasma === patient.fileNoBasma ? patient : p))
          : [...s.patients, patient],
      };
    }),

  updateAppointmentStatus: (id, status) =>
    set((s) => ({
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    })),

  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, isRead: true })) })),
}));
