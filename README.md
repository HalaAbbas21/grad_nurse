# تطبيق الممرضة — منصة بسمة لأورام الأطفال · Nurse App

A production-quality, **RTL Arabic**, fully-responsive **React + TypeScript** frontend for the
Basma pediatric-oncology platform. The app centers on the **Nurse Dashboard** and every
bedside workflow a nurse reaches from it. **Mock data only** — no backend; all writes live in
client state (Zustand).

> Designed for **Nurse Rana**: clinically skilled, low digital familiarity, one-handed at the
> bedside. Every critical action is ≤3 taps, in Arabic, with medication safety enforced.

---

## Run it

```bash
npm install
npm run dev        # → http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check (tsc) + production build
npm run typecheck  # strict type-check only
npm run preview    # preview the production build
```

**Login:** any username + password works (mock), or tap **الدخول بالبصمة** (mock biometric).
Then pick a department — default-rich demo data lives in **القسم النهاري (Day Care)**.

---

## What to try (demo path)

1. **Login → pick القسم النهاري** → the **Dashboard** shows the priority row. The single
   **yellow hero card = جرعات جاهزة للإعطاء** (doses approved & ready).
2. Tap the hero card → filtered patient queue → open a patient with a ready dose
   (e.g. **B-10245 آدم**).
3. **Patient record** → context bar pinned with file number first → tabs for vitals,
   meds, labs, care, appointments, read-only treatment plan.
4. **إعطاء جرعة** → the safety flow: **verify file number → Five-Rights checklist →
   record** → green toast with **undo**.
5. A dose **pending doctor approval** (e.g. B-10246 Doxorubicin) is shown **disabled** with a
   reason — it cannot be given.
6. Switch to **القسم الداخلي** to see an **overdue dose** (warning treatment) and
   **care-to-document** counts; switch to **العيادة** to see **register a new patient**
   (B-10333 جنى) via the guided stepper.
7. Toggle **محاكاة فشل الحفظ** in **حسابي (Profile)** to prove error states on save.

---

## Where things live

```
src/
  app entry          main.tsx, App.tsx (routing + auth/department guards)
  styles/tokens.css  design-system color tokens (oklch source of truth)
  index.css          Tailwind + Surface ambient gradient + fonts
  i18n/ar.ts         single Arabic string dictionary + enum labels (glossary §11)
  mock/
    types.ts         fully-typed domain model (every §7 entity)
    seed.ts          ~14 patients across 3 departments + vitals/labs/MAR/care/appts/notifs
  store/useStore.ts  Zustand store: session + data + all clinical write actions
  lib/
    derive.ts        task derivation, dose-readiness/overdue, vital-range flags, dashboard counts
    utils.ts         cn(), age, date/time formatting, wait labels
    usePatient.ts    resolve :fileNo route param → patient
    useSimulatedLoad.ts  loading/error simulation for data areas
  components/
    ui/              shadcn-style primitives (button, card, badge, input, select,
                     switch/checkbox, dialog→bottom-sheet, tabs, skeleton, progress/stepper,
                     avatar, toast, number-stepper)
    shared/          PatientContextBar, CountCard, QueueList, MarList, VitalsTrend,
                     FiveRightsChecklist, DemographicsFields, CommandSearch, StatusBadges, States
    layout/          AppShell (top bar + sidebar/bottom-tabs), PatientScreen wrapper
  screens/           Login, SelectDepartment, Dashboard, PatientQueue, PatientRecord,
                     RegisterPatient, Vitals, LabDraw, Medication, Care,
                     MedicationsDept, Notifications, Profile
```

## Screen index (routes)

| Route | Screen |
|---|---|
| `/login` | Login + mock biometric |
| `/select-department` | Department selector (Clinic / Day Care / Inpatient) |
| `/` | Dashboard — priority row, queue, med round, notifications |
| `/patients` | Patient queue (file-number search, task filter, sort) |
| `/patients/:fileNo` | Patient record (tabbed: overview · demographics · vitals · meds · labs · care · appointments · plan) |
| `/patients/new` | Register / complete patient (4-step guided stepper) |
| `/patients/:fileNo/vitals` | Vitals entry (number-steppers, out-of-range flags, trend) |
| `/patients/:fileNo/lab-draw` | Pre-dose lab draw |
| `/patients/:fileNo/medication` | Medication administration (MAR) — Five-Rights safety flow |
| `/patients/:fileNo/care` | Nursing care documentation |
| `/medications` | Department-wide MAR / doses ready to give |
| `/notifications` | Notifications center (deep-links to the relevant screen) |
| `/profile` | Profile, department switch, logout, dev fail-save toggle |

---

## How to add data

All mock data is in [`src/mock/seed.ts`](src/mock/seed.ts), fully typed against
[`src/mock/types.ts`](src/mock/types.ts). Timestamps are computed **relative to load time**
(`iso(minutes)`, `days(n)`) so the demo always looks live.

- **Add a patient:** append a `Patient` to `PATIENTS`. Set `registrationComplete: false` to make
  it appear under "مرضى جدد للتسجيل" (Clinic). `fileNoBasma` is the primary identity.
- **Add a doctor-approved dose (ready to give):** append a `MARItem` to `MAR_ITEMS` with
  `approvedByDoctor: true`, `approvalStatus: "approved"`, `administrationStatus: "ready"`.
  Set `approvedByDoctor: false` + a `blockedReason` to show the **disabled** (awaiting-approval)
  state. A `scheduledTime` in the past renders the **overdue/warning** treatment.
- **Add a lab to draw:** append a `LabTestRequest` with `status: "requested-to-draw"`
  (set `preDose: true` to mark it as gating a dose).

Task counts, queue chips, and dashboard cards are **derived** from this data in
[`src/lib/derive.ts`](src/lib/derive.ts) — no need to maintain counts by hand.

---

## Design system

- **Light mode only.** Color tokens are oklch (source of truth) in
  [`src/styles/tokens.css`](src/styles/tokens.css), mapped to Tailwind in
  [`tailwind.config.js`](tailwind.config.js).
- **Fonts:** Tajawal (Arabic UI/headings), Nunito (body fallback), Quicksand (Latin/brand display).
- **Surface background:** subtle blue + yellow radial glows over `#F9FDFF`.
- **Color semantics:** blue = primary/links/headings · green = success/progress ·
  purple = badges/supporting · **yellow = the single hero CTA** (doses ready) + celebration ·
  red = destructive/critical only.
- **Responsive:** phone (<768) bottom-tab nav + stacked cards + bottom-sheet modals;
  tablet (768–1023) 2-column; desktop (≥1024) persistent sidebar + multi-column, content capped
  at ~1280px. Verified at ~375 / ~768 / ~1280. Everything mirrored for RTL.

## Safety model (medication)

A dose **cannot be administered** until the doctor has approved it. Unapproved doses are visible
but **disabled** with a reason. Administering an approved dose requires, in order:
**(1) verify file number → (2) confirm all Five Rights → (3) record** — then a green toast with an
**undo** window. Implemented in [`src/screens/MedicationScreen.tsx`](src/screens/MedicationScreen.tsx)
and [`src/components/shared/FiveRightsChecklist.tsx`](src/components/shared/FiveRightsChecklist.tsx).

## Non-goals

No backend/API, no auth server, no other roles (doctor/reception/lab/admin), no dark mode, no real
biometric. The nurse does **not** diagnose, build treatment plans, or approve doses — those appear
as read-only context or inbound handoffs.
