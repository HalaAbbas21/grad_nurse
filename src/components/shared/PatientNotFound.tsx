import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ar } from "@/i18n/ar";

export function PatientNotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-7" />
      </span>
      <div>
        <p className="text-lg font-bold">{ar.patients.empty}</p>
        <p className="text-sm text-muted-foreground">{ar.fileNo}</p>
      </div>
      <Button onClick={() => navigate("/patients")}>{ar.nav.patients}</Button>
    </div>
  );
}
