import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { AppShell } from "@/components/layout/AppShell";
import { LoginScreen } from "@/screens/LoginScreen";
import { SelectDepartmentScreen } from "@/screens/SelectDepartmentScreen";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { PatientQueueScreen } from "@/screens/PatientQueueScreen";
import { PatientRecordScreen } from "@/screens/PatientRecordScreen";
import { RegisterPatientScreen } from "@/screens/RegisterPatientScreen";
import { VitalsScreen } from "@/screens/VitalsScreen";
import { LabDrawScreen } from "@/screens/LabDrawScreen";
import { MedicationScreen } from "@/screens/MedicationScreen";
import { CareScreen } from "@/screens/CareScreen";
import { MedicationsDeptScreen } from "@/screens/MedicationsDeptScreen";
import { NotificationsScreen } from "@/screens/NotificationsScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuth = useStore((s) => s.isAuthenticated);
  const department = useStore((s) => s.department);
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!department) return <Navigate to="/select-department" replace />;
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  const isAuth = useStore((s) => s.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <LoginScreen />} />
      <Route
        path="/select-department"
        element={isAuth ? <SelectDepartmentScreen /> : <Navigate to="/login" replace />}
      />

      <Route path="/" element={<RequireAuth><DashboardScreen /></RequireAuth>} />
      <Route path="/patients" element={<RequireAuth><PatientQueueScreen /></RequireAuth>} />
      <Route path="/patients/new" element={<RequireAuth><RegisterPatientScreen /></RequireAuth>} />
      <Route
        path="/patients/:fileNo"
        element={<RequireAuth><PatientRecordScreen /></RequireAuth>}
      />
      <Route
        path="/patients/:fileNo/vitals"
        element={<RequireAuth><VitalsScreen /></RequireAuth>}
      />
      <Route
        path="/patients/:fileNo/lab-draw"
        element={<RequireAuth><LabDrawScreen /></RequireAuth>}
      />
      <Route
        path="/patients/:fileNo/medication"
        element={<RequireAuth><MedicationScreen /></RequireAuth>}
      />
      <Route path="/patients/:fileNo/care" element={<RequireAuth><CareScreen /></RequireAuth>} />
      <Route
        path="/medications"
        element={<RequireAuth><MedicationsDeptScreen /></RequireAuth>}
      />
      <Route
        path="/notifications"
        element={<RequireAuth><NotificationsScreen /></RequireAuth>}
      />
      <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
