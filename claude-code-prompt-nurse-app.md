# Claude Code Prompt — Nurse App (Pediatric Oncology Platform · Basma)

> Paste everything below into Claude Code. It is written to be executed end-to-end: it contains the design-system implementation, full screen inventory, a per-screen data dictionary, UX rules for non-technical users, and acceptance criteria. It mirrors the Doctor-app prompt so the two apps stay consistent.

---

## 0. Your mission

You are building the **Nurse application** for a Pediatric Oncology digital platform used by the Basma cancer-support organization. The centerpiece is the **Nurse Dashboard** plus every screen the nurse reaches from it. Build it as a **production-quality, responsive, RTL Arabic** frontend in **TypeScript React**, with **mock data only** (no backend — stub all data in `/src/mock` and all writes in local state).

Act as a **senior product designer + software analyst**: internalize the user, the jobs-to-be-done, and the data each screen needs, then build clean, fully-typed React.

**Definition of "done" up front:** a nurse can log in → pick their department → see a dashboard that tells them exactly what needs them now → find a child by file number → register/complete a patient and record vitals → draw the pre-dose lab → administer a doctor-approved dose safely → and document nursing care — all in ≤3 taps per critical action, in Arabic, one-handed at the bedside, with no training.

---

## 1. The user (design for them, not for engineers)

**Persona — Nurse Rana, oncology nurse, 30s.** Clinically skilled, **low digital familiarity**, constantly **on the move at the bedside**, often holding a phone in one hand. Interrupted frequently. Handles the most safety-critical physical act in the system: **giving the child their dose**. Reads Arabic; English medical abbreviations acceptable inline.

**Jobs-to-be-done (what the dashboard must answer instantly):**
1. "Which children need me right now?" — labs to draw, **doses approved and ready to give**, vitals due, care to document.
2. "Find this exact child" — fast, unambiguous, by **file number** (names collide constantly).
3. "Record vitals and register/complete the patient" without typing essays.
4. "Draw the pre-dose lab, then give the dose safely" — never the wrong child, drug, dose, or time.
5. "Log the care I gave" quickly so the record is accurate.

**Design consequences (non-negotiable):**
- **File number (رقم الإضبارة) is the primary identity and the default search field everywhere.** Names are secondary and must never be the only disambiguator.
- **Safety first for medication administration:** enforce a verify-patient step (file number) and a clear **"Five Rights" confirmation** (right patient, right drug, right dose, right time, right route) before any dose is recorded as given. **A dose cannot be administered until the doctor has approved it** (the lab-before-dose chain ends here).
- **Minimal typing.** Dropdowns, chips, steppers, number-steppers, toggles, presets. Free-text only where clinically necessary, with large inputs (voice-to-text friendly).
- **≤2–3 taps to any critical action.** Glanceable, one-handed, big tap targets.
- **Always-visible patient context bar** once inside a patient, so the nurse never loses track of *who* they're acting on.
- **Autosave drafts** at every stage (the nurse can be interrupted at any moment).
- **Plain, reassuring language** + **status by color + icon + label**.

---

## 2. Tech stack & setup

- **React 18 + Vite + TypeScript (TSX) — required.** All components, props, mock data, and the data-model types in §7 must be **fully typed** (no `any`; define interfaces/types for every entity). Strict mode on in `tsconfig`.
- **Responsive across phone, tablet, and desktop — required.** The nurse's primary device is a **phone at the bedside**, but the app must also work on tablet (rounds) and desktop (station). See §2.1.
- **Tailwind CSS** + **shadcn/ui** (Button, Card, Input, Select, Badge, Tabs, Dialog, Sheet, Table, Toast, Tooltip, Progress, Skeleton, Avatar, Command for search, Checkbox/Switch for the Five-Rights checklist).
- **Routing:** React Router. **State:** lightweight (Zustand or React context) — current nurse, current department, selected patient, drafts, notifications.
- **Icons:** lucide-react. **Timeline/trend:** a light custom vitals trend list/sparkline is fine.
- **i18n/RTL:** app is **RTL Arabic by default**. Set `dir="rtl"` and `lang="ar"` on `<html>`. Keep all UI strings in one `ar.ts` dictionary (glossary in §11).
- **No backend.** Mock everything (§8–§9). Simulate latency + states (loading/empty/error) so the UX is realistic.

### 2.1 Responsive design (phone · tablet · desktop) — first-class requirement
Mobile-first, then progressively enhance. Every screen in §6 must be usable and well-proportioned at all three sizes — no horizontal scroll, no clipped content, no tiny tap targets on mobile.

**Breakpoints (Tailwind):** `sm 640 · md 768 · lg 1024 · xl 1280`. Treat them as:
- **Phone (<768px) — the primary target:** single column. **Bottom tab bar** for primary nav with a large reachable thumb zone. Top bar condenses (logo + search icon that opens full-screen Command search + notifications bell + avatar). Dashboard count cards stack 1–2 per row; tables render as **stacked cards**; patient context bar is sticky and collapsible; multi-step flows (registration, dose administration) are full-screen steppers; primary CTA pinned bottom where natural.
- **Tablet (768–1023px):** 2-column content where it helps (e.g., patient overview + side panel). Collapsible sidebar or persistent bottom bar (pick one, keep it consistent). Count cards 2–3 per row; tables become responsive two-column cards.
- **Desktop (≥1024px):** **persistent sidebar** nav; multi-column dashboard (priority row across the top, queue + tasks side by side); full data tables; patient view uses tabs with a right rail for context/summary. Cap content width (~1280px) and center.

**Rules:** fluid layouts (flex/grid + min/max widths, not fixed px); modals become **bottom sheets** on phone and centered dialogs on desktop; **all mirrored for RTL**. Verify each screen at ~375px, ~768px, and ~1280px.

---

## 3. Design system — implement exactly

**Light mode only. oklch values are the source of truth; hex are accurate fallbacks.** Define tokens as CSS custom properties on `:root`, then map shadcn tokens to them.

### 3.1 Color tokens (CSS variables)
```css
:root {
  --background: oklch(0.992 0.005 220);      /* #F9FDFF */
  --foreground: oklch(0.255 0.045 250);      /* #112438 */
  --card: oklch(1 0 0);                        --card-foreground: oklch(0.255 0.045 250);
  --popover: oklch(1 0 0);                     --popover-foreground: oklch(0.255 0.045 250);

  --primary: oklch(0.62 0.16 240);           /* #008FD2 blue — trust/care, main actions */
  --primary-foreground: oklch(0.99 0.005 240);
  --primary-soft: oklch(0.95 0.04 240);      /* #DFF1FF */

  --secondary: oklch(0.74 0.16 150);         /* #51C672 green — success/progress/positive */
  --secondary-foreground: oklch(0.22 0.05 150);
  --secondary-soft: oklch(0.95 0.05 150);

  --accent: oklch(0.62 0.17 320);            /* #B25EC5 purple — badges/tags/supporting */
  --accent-foreground: oklch(0.99 0.005 320);
  --accent-soft: oklch(0.95 0.04 320);

  --highlight: oklch(0.86 0.16 90);          /* #FACB39 yellow — CTA highlight/celebration */
  --highlight-foreground: oklch(0.28 0.06 80);
  --highlight-soft: oklch(0.97 0.06 95);

  --muted: oklch(0.965 0.012 240);            --muted-foreground: oklch(0.52 0.03 250);
  --destructive: oklch(0.62 0.22 25);         --destructive-foreground: oklch(0.99 0.005 25);
  --success: oklch(0.7 0.16 155);             --success-foreground: oklch(0.99 0.005 155);
  --warning: oklch(0.82 0.15 80);             --warning-foreground: oklch(0.28 0.06 80);

  --border: oklch(0.92 0.015 240);            --input: oklch(0.93 0.015 240);
  --ring: oklch(0.62 0.16 240);
  --radius: 1rem; /* base 16px */
}
```
Derived radii: `sm ~12px, md ~14px, lg 16px, xl 20px, 2xl 24px, 3xl 28px, 4xl 32px`. **When inventing new tints, keep the hue angle and adjust only lightness/chroma.**

### 3.2 Typography
- **Body / UI:** `Nunito` (400, 600, 700, 800).
- **Display / headings (H1–H4, brand):** `Quicksand` (500, 600, 700), `letter-spacing: -0.01em`.
- **Arabic / RTL content:** `Tajawal` (400, 500, 700) — **the primary font for the Arabic UI.** Use Quicksand only for Latin/brand display; Tajawal carries Arabic headings and body.
- Enable antialiasing (`-webkit-font-smoothing: antialiased`).

### 3.3 Surface background (not flat)
Page background = **Surface gradient** layered over `#F9FDFF`: soft **blue radial glow top-start** + **yellow radial glow top-end**, very subtle, behind cards.

### 3.4 Brand gradients (use sparingly for hero/celebration only)
- Brand `135°: #008FD2 → #B25EC5 → #51C672`
- Sun `135°: #FACB39 → #F5C06A`
- Hope `135°: #51C672 → #008FD2`
- Care `135°: #B25EC5 → #008FD2`

### 3.5 Component styling
- **Button variants:** `default` = primary blue, white text, shadow, hover 90% · `destructive` = red · `outline` = bordered on background, hover → accent-soft + accent text · `secondary` = green, dark-green text, hover 80% · `ghost` = transparent, hover → accent-soft + accent · `link` = blue, underline on hover.
- **Card:** `rounded-xl border bg-white shadow`; Header `p-6`, Title `font-semibold tracking-tight`, Description `text-sm text-muted-foreground`; Content `p-6 pt-0`; Footer `flex items-center p-6 pt-0`.
- **Color semantics — apply consistently:** blue = primary actions/links/headings; green = success/progress/positive; purple = badges/tags/supporting accents; yellow = the single most important CTA on a screen + celebratory moments; red = destructive/critical alerts only.

---

## 4. UX rules for low-familiarity clinical users (enforce on every screen)

1. **One primary action per screen**, styled as the boldest button. Secondary actions are quieter.
2. **Progressive disclosure:** show essentials; tuck detail behind "More"/expandable sections. Dashboard and patient overview scannable in <5s.
3. **Guided flows (steppers/wizards)** for multi-part tasks (patient registration, dose administration). Show step X of Y, allow back, autosave each step.
4. **Status as color + icon + label** (never color alone). Map states to tokens (see §6 per screen).
5. **Confirm + undo** for clinical writes (recording a dose, submitting vitals, documenting care). Toasts confirm success in green.
6. **Empty, loading, error states** for every list/data area (skeletons, friendly empty text, retry).
7. **Patient-safety affordances:** context bar shows file number + name + age + diagnosis + life-status badge + critical flags; require a match before any clinical write; medication administration adds an explicit Five-Rights step.
8. **Tap targets ≥44px**, generous spacing, large readable Arabic type, one-handed reach on a phone.
9. **No dead ends:** every screen has clear back/next and a path to search + notifications.

---

## 5. Information architecture & navigation

**App shell** (persistent):
- **Top bar:** brand/logo · **Department switcher** (العيادة / النهاري / الداخلي) showing the active department · **global search** (file-number-first Command palette) · **notifications bell** with unread count · nurse avatar/profile menu.
- **Primary nav** (sidebar on desktop, bottom tab bar on phone): **الرئيسية (Dashboard)** · **المرضى (Patients)** · **الأدوية (Medications)** · **الإشعارات (Notifications)** · **حسابي (Profile)**.
- **Patient context bar:** appears at top of all patient-scoped screens; sticky.

**Route map:**
```
/login
/select-department
/                          → Dashboard (home)
/patients                  → Patient queue/list (current department)
/patients/:fileNo          → Patient record (nurse view) with tabbed sections
/patients/new              → Register new patient (demographics + initial vitals)
/patients/:fileNo/vitals   → Vitals entry / monitoring
/patients/:fileNo/lab-draw → Pre-dose lab draw (record sample / basic lab)
/patients/:fileNo/medication → Medication / dose administration (MAR)
/patients/:fileNo/care     → Nursing care documentation
/medications               → Department-wide MAR / doses ready to administer
/notifications
/profile
```

---

## 6. Screen-by-screen specification

> For each screen: **Purpose · Layout · Data shown · Data captured (inputs) · Components · States · Design notes.** Build all of them.

### 6.1 Login + Department selector
- **Purpose:** secure entry, then set the shift's working department (drives the dashboard and patient lists).
- **Login data:** username, password, plus a **PIN / biometric** affordance (mock biometric as a button). Show lockout message after N failed attempts (mock).
- **Department selector:** three large cards — **العيادة (Clinic)**, **القسم النهاري (Day Care)**, **القسم الداخلي (Inpatient)** — each with icon, one-line purpose, today's patient count. Selecting sets context → Dashboard. Changeable later from the top bar.
- **Design:** hero uses Brand gradient sparingly; cards white, rounded-xl, large tap targets.

### 6.2 Dashboard (home) — the heart of the build
- **Purpose:** answer "what needs me now?" in <5s, scoped to the active department.
- **Layout (top→bottom):**
  1. **Greeting strip:** "مرحباً {name}" · **active department** (with switch link) · date.
  2. **Prominent file-number search** ("ابحث برقم الإضبارة…") — fastest path to a patient.
  3. **Action-needed cards (priority row)** — each a tappable count that deep-links to a filtered list:
     - **جرعات جاهزة للإعطاء** (doses approved by the doctor, ready to administer) — **highlight/yellow, the hero CTA** (most safety-critical, time-sensitive action).
     - **تحاليل بانتظار السحب** (pre-dose labs to draw) — warning/amber.
     - **علامات حيوية مطلوبة** (vitals due) — blue.
     - **مرضى جدد للتسجيل** (new patients to register/complete — Clinic) — purple.
     - **مهام رعاية للتوثيق** (care/documentation pending) — green.
     - **مواعيد لتحديث حالتها** (appointment statuses to update) — blue.
  4. **Department queue (current department):** waiting patients with **token, file number, name, age, diagnosis, what's needed (draw lab / give dose / vitals), waiting time, status**; tap → patient record.
  5. **Medication round summary (Day Care/Inpatient):** upcoming/overdue doses with time and patient.
  6. **Notifications feed (compact):** latest 3–5; link to full center.
- **Data shown:** nurse profile summary; per-department task counts; queue items; med round; notifications.
- **States:** skeletons while loading; per-section empty state ("لا يوجد ما يتطلب انتباهك الآن ✅" in green).
- **Design notes:** the priority row is the anchor; soft token backgrounds with strong token numbers; exactly one yellow card (doses ready) as the hero CTA. Surface overdue doses with a clear (non-alarming) warning treatment.

### 6.3 Patient queue / list
- **Purpose:** browse/triage patients in the active department.
- **Data shown per row:** token, **file number (bold, primary)**, full name, age, gender, diagnosis, **task needed** (draw lab / give dose / record vitals / register), status badge, waiting time, quick actions (open, vitals, draw lab, give dose).
- **Inputs/controls:** **search (file number default, name secondary)**, filters (task type, status), sort (waiting time, name).
- **Components:** shadcn Table (stacked cards on phone), Command palette search, Badge for status.
- **Status badges → tokens:** بانتظار التسجيل (purple/accent) · بانتظار العلامات الحيوية (blue) · بانتظار سحب التحليل (warning) · بانتظار النتيجة (muted) · جرعة جاهزة للإعطاء (highlight) · تم الإعطاء (secondary/green) · حالة حرجة (destructive).

### 6.4 Patient record (nurse view)
- **Purpose:** the nurse's safe view of one child; launch point for nurse actions. Narrower than the doctor's view — focused on demographics, vitals, medications, care, lab status, appointments. Clinical diagnosis/plan are **read-only** for the nurse.
- **Patient context bar (sticky, on all patient screens):** **file number (Basma) — primary**, file number (Biruni `xxxx/yyyy`), full name, DOB + **computed age**, gender, **life-status badge**, current department, diagnosis (read-only), **critical flags** (allergies/alerts), guardian contact quick-action.
- **Tabbed sections (data shown):**
  - **نظرة عامة (Overview):** what's needed now (draw lab / give dose / vitals), latest vitals snapshot, today's scheduled meds, last/next dose dates (read-only), open nursing tasks.
  - **المعلومات السكانية (Demographics):** names (first/family/father/mother), DOB, gender, national IDs (patient/father), residence (country/governorate/city), nationality, caregiver + caregiver education, phones (father/mother/caregiver/extra). **Nurse can create/edit demographics**; administrative/referral fields are read-only (Reception's scope).
  - **العلامات الحيوية (Vitals):** history + trend (weight, height, temp, pulse, BP, resp rate, optional O₂ sat & pain score) with timestamps; "+ تسجيل علامات حيوية".
  - **الأدوية (Medications / MAR):** scheduled meds + doctor-approved doses, each with med, dose, route, scheduled time, status (مجدول / جاهز للإعطاء / تم الإعطاء / فائت); "إعطاء" action.
  - **سحب التحاليل (Lab draws):** labs requested by the doctor to draw before dose + basic labs; status (مطلوب السحب / تم السحب / النتيجة متوفرة); "تسجيل السحب".
  - **الرعاية (Care documentation):** nursing notes + procedures, timestamped, authored; "+ توثيق رعاية".
  - **المواعيد (Appointments):** date/time, type, status; nurse can update status.
  - **خطة العلاج (Treatment plan):** **read-only** summary so the nurse understands the protocol/phase.
- **Primary actions (toolbar):** تسجيل علامات حيوية · تسجيل سحب تحليل · إعطاء جرعة/دواء · توثيق رعاية · تحديث حالة الموعد.

### 6.5 Register / complete patient (Clinic — new case)
- **Purpose:** the nurse is often the first clinical touch for a new case: create/complete demographics + record initial vitals + flag basic medical history, in a guided form with minimal typing.
- **Flow (stepper):** (1) verify no existing file (search by file number) → (2) demographics → (3) initial vitals → (4) initial medical notes (optional) → save.
- **Data captured:** file number (Basma) — primary, names, DOB, gender, national IDs (patient/father), residence (country/governorate/city), nationality (سوري / سوري فلسطيني / أخرى), caregiver (الأب والأم / الأب فقط / الأم فقط / الجد أو الجدة / العم أو الخال أو العمة أو الخالة / جهة أخرى), caregiver education (أمّي / ابتدائي / إعدادي / ثانوي / جامعي), phones (father/mother/caregiver/extra), initial vitals (see 6.6), basic medical notes.
- **UX:** dropdowns/chips for all enumerated fields; validate file-number + national-ID uniqueness; **autosave draft**; on save mark patient "جاهز لمراجعة الطبيب". If a file already exists, open and update it instead of creating a duplicate.

### 6.6 Vitals entry / monitoring
- **Purpose:** record and track vitals quickly (number-steppers, not keyboards where possible).
- **Data captured:** weight (kg), height (cm), temperature, pulse, blood pressure (systolic/diastolic), respiratory rate, optional O₂ saturation, optional pain score (0–10), recordedAt (auto).
- **Data shown:** latest values + a simple trend list/sparkline of prior readings.
- **UX:** big number inputs with steppers; out-of-range values flagged (warning color + icon + label, non-blocking); confirm + green toast on save.

### 6.7 Pre-dose lab draw
- **Purpose:** record the sample drawn before a dose (the lab-before-dose chain), and register basic labs per doctor direction in Clinic.
- **Data shown:** labs the doctor requested for this patient (test type, target lab internal/external, priority, status); for each, a "تسجيل السحب" action.
- **Data captured:** which requested test(s) drawn, draw time (auto/edit), sample notes (optional); for Clinic basic labs the nurse may create a draw entry (test type, indication is read-only/doctor-set where applicable).
- **On save:** mark "تم السحب"; the result will arrive later (internal or external via notification). Surface a note that the dose waits on result + doctor approval.
- **States:** empty ("لا توجد تحاليل مطلوبة للسحب"); error on save.

### 6.8 Medication / dose administration (MAR) — safety-critical
- **Purpose:** administer doctor-approved doses and scheduled meds **safely** and record them.
- **Hard rule:** **a dose can only be administered after the doctor has approved it** (status "جاهز للإعطاء"). Doses without approval are shown but **disabled** with a clear reason ("بانتظار إقرار الطبيب").
- **Flow (guided, ≤3 taps):**
  1. **Verify patient:** confirm file number against the context bar (scan/confirm step).
  2. **Five-Rights checklist (الحقوق الخمسة):** right patient (المريض الصحيح) · right drug (الدواء الصحيح) · right dose (الجرعة الصحيحة) · right time (الوقت الصحيح) · right route (طريق الإعطاء الصحيح) — each a checkbox/switch that must be confirmed.
  3. **Record administration:** med, dose, route, **time & date** (auto, editable), administering nurse (auto). Confirm.
  4. **Result:** status → "تم الإعطاء"; green (celebratory) toast; undo window.
- **Data shown:** scheduled + ready doses for the patient/department (med, dose, route, scheduled time, status), overdue highlighted (warning).
- **States:** disabled (unapproved) with reason; confirm + undo; error on save.

### 6.9 Nursing care documentation
- **Purpose:** log nursing notes and procedures quickly.
- **Data captured:** nursing notes (text), procedures performed (chips/presets + optional note), relevant observations, timestamp + author (auto).
- **UX:** presets/chips for common procedures to reduce typing; autosave; green toast.

### 6.10 Notifications center
- **Data shown per item:** type (تنبيه/معلومة/تذكير) with icon+color, message, **related patient (file number + name)**, timestamp, read/unread. Tapping deep-links to the relevant screen (e.g., **"تم إقرار الجرعة من الطبيب"** → medication administration; "النتيجة متوفرة" → patient labs; "مريض جديد مُسند" → registration).
- **Controls:** mark read / mark all read; filter by type. Unread count drives the bell badge.

### 6.11 Profile / department switch (light)
- Nurse profile (name, department, contact), active department switcher, secure-login settings placeholder, logout.

---

## 7. Data dictionary (build mock types from this — fully typed)

**Nurse:** id, firstName, lastName, contactEmail, department.

**Patient:** fileNoBasma (PRIMARY), fileNoBiruni (`xxxx/yyyy`), nationalIdPatient, nationalIdFather, firstName, familyName, fatherName, motherName, dob, age(computed), gender, nationality, residence{country,governorate,city}, caregiver, caregiverEducation, phones{father,mother,caregiver,extra}, lifeStatus, diagnosis(read-only), currentPhase(read-only), criticalFlags[], department, basicMedicalNotes, registrationDate.

**Vitals:** id, patientFileNo, nurseId, weight, height, temperature, pulse, bloodPressureSystolic, bloodPressureDiastolic, respiratoryRate, oxygenSaturation?, painScore?, recordedAt.

**LabDraw / LabTestRequest (nurse view):** id, patientFileNo, doctorId(requestedBy), testType, labKind(internal/external), priority, status(requested-to-draw/drawn/results-available), drawnByNurseId?, drawTime?, sampleNotes?.

**MedicationOrder / MARItem:** id, patientFileNo, medName, dose, route, scheduledTime, approvedByDoctor(boolean), approvalStatus(pending/approved), administrationStatus(scheduled/ready/administered/missed).

**MedicationAdministration:** id, marItemId, patientFileNo, nurseId, medName, dose, route, administeredTime, administeredDate, fiveRightsConfirmed(boolean).

**CareDocumentation:** id, patientFileNo, nurseId, notes, procedures[], observations?, createdAt.

**Appointment:** id, patientFileNo, dateTime, type, status, assignedNurseId?, notes.

**Notification:** id, userId, type(alert/info/reminder), message, relatedPatientFileNo, timestamp, isRead.

---

## 8. Mock data requirements
- Seed **~12–15 patients** spread across the three departments, with varied life statuses, phases, and pending states so every dashboard count and status badge is demonstrable.
- Include patients with: a **doctor-approved dose ready to give**, a dose **pending doctor approval** (so the disabled state is visible), a **pre-dose lab to draw**, **vitals due**, a **new patient to register** (Clinic), and **care to document** — so the dashboard priority row shows non-zero counts.
- Include at least one **overdue dose** and one **out-of-range vital** to demonstrate warning treatments.
- Simulate latency (~400–800ms) and provide a way to trigger an error state (e.g., a "fail save" toggle) so states are provably handled.

---

## 9. Accessibility & RTL
- `dir="rtl"`, `lang="ar"`, mirror all layouts (icons, chevrons, progress, trends flow right→left).
- Status never by color alone — pair with icon + Arabic label.
- WCAG AA contrast using the tokens; visible focus ring (`--ring`).
- Min 44px tap targets; supports text scaling; keyboard navigable.

---

## 10. Acceptance criteria (Definition of Done)
1. Login → department selection → dashboard works; department switch updates dashboard + patient list.
2. File-number search finds a patient in ≤2 taps from anywhere.
3. Dashboard priority row shows live, accurate counts and deep-links to filtered lists; exactly one yellow hero CTA (doses ready to give).
4. Patient record (nurse view) shows all §6.4 sections with the sticky context bar (file number primary); diagnosis/plan are read-only.
5. New-patient registration works as a guided stepper (demographics + initial vitals) with autosave and uniqueness validation.
6. Vitals entry uses number-steppers, flags out-of-range values, and shows a trend.
7. Pre-dose lab draw records "drawn" and reflects in the patient's lab status.
8. **Medication administration enforces doctor approval** (unapproved doses are disabled with a reason) and requires the **Five-Rights confirmation + patient verification** before recording a dose.
9. Care documentation captures notes + procedures with presets and autosave.
10. Every list/data area has loading, empty, and error states; overdue/out-of-range items use the warning treatment (color + icon + label).
11. Design tokens, fonts (Tajawal/Nunito/Quicksand), radii, gradients, and Surface ambient background match §3 exactly. Light mode only.
12. **Fully responsive and verified at phone (~375px), tablet (~768px), desktop (~1280px)** per §2.1: bottom-tab nav + one-handed usability + stacked-card tables on phone; collapsible/sidebar nav + multi-column layouts on tablet/desktop; modals → bottom sheets on phone; all mirrored for RTL. No horizontal scroll or clipped content at any size.
13. **Written in TypeScript with full typing** — every entity in §7 has an interface/type, components are typed, `tsconfig` is strict, and the project builds with no type errors.

---

## 11. Arabic UI glossary (use these strings)
| English | Arabic |
|---|---|
| Dashboard | الرئيسية / لوحة الممرضة |
| Patients | المرضى |
| File number | رقم الإضبارة |
| Clinic / Day Care / Inpatient | العيادة / القسم النهاري / القسم الداخلي |
| Search by file number | ابحث برقم الإضبارة |
| Doses ready to administer | جرعات جاهزة للإعطاء |
| Labs to draw | تحاليل بانتظار السحب |
| Vitals due | علامات حيوية مطلوبة |
| New patients to register | مرضى جدد للتسجيل |
| Care to document | مهام رعاية للتوثيق |
| Appointments to update | مواعيد لتحديث حالتها |
| Register / complete patient | تسجيل / استكمال مريض |
| Vitals | العلامات الحيوية |
| Weight / Height | الوزن / الطول |
| Temperature / Pulse | الحرارة / النبض |
| Blood pressure / Respiratory rate | ضغط الدم / معدل التنفس |
| Oxygen saturation / Pain score | إشباع الأكسجين / درجة الألم |
| Pre-dose lab draw | سحب التحليل قبل الجرعة |
| Record draw | تسجيل السحب |
| Drawn | تم السحب |
| Medications (MAR) | الأدوية |
| Administer dose | إعطاء الجرعة |
| Waiting for doctor approval | بانتظار إقرار الطبيب |
| Ready to administer | جاهز للإعطاء |
| Administered | تم الإعطاء |
| Overdue / Missed | فائت |
| Five Rights | الحقوق الخمسة |
| Right patient/drug/dose/time/route | المريض الصحيح / الدواء الصحيح / الجرعة الصحيحة / الوقت الصحيح / طريق الإعطاء الصحيح |
| Route | طريق الإعطاء |
| Nursing care documentation | توثيق الرعاية التمريضية |
| Notes / Procedures | الملاحظات / الإجراءات |
| Appointment status | حالة الموعد |
| Checked in / Checked out / Cancelled | تم الدخول / تم الخروج / ملغى |
| Notifications | الإشعارات |
| Dose approved by doctor | تم إقرار الجرعة من الطبيب |
| Result available | النتيجة متوفرة |
| New patient assigned | مريض جديد مُسند |
| Save as draft / Save | حفظ كمسودة / حفظ |
| Saved | تم الحفظ |
| Ready for doctor review | جاهز لمراجعة الطبيب |
| Life status badges | حياة / وفاة / انقطاع عن العلاج / فقد متابعة / غير معروفة |

---

## 12. Deliverables & structure
- A runnable Vite app (`npm install && npm run dev`).
- Suggested structure: `src/app` (shell, routing), `src/screens/*`, `src/components/*` (shared + patient-context-bar, count-card, vitals-trend, five-rights-checklist, mar-list), `src/mock` (data + types), `src/i18n/ar.ts`, `src/styles/tokens.css`.
- A short `README.md`: how to run, where mock data lives, how to add a patient/med order, and a screen index.

## Non-goals (do not build)
- No backend/API, no auth server (mock login).
- No other roles (doctor/reception/lab/admin) — Nurse only. The nurse **does not** diagnose, choose templates, build treatment plans, approve doses, or create discharge reports — those are doctor-only and appear here as read-only context or as inbound handoffs (doctor-approved doses).
- No dark mode. No real device/biometric integration (mock).

**Build it screen by screen, starting with the design-system tokens + app shell + patient context bar, then the Dashboard, then patient-scoped screens (registration → vitals → lab draw → medication administration → care). Keep components small, reusable, and fully typed. Prioritize bedside clarity and medication safety over visual density.**
