import { useNavigate } from "react-router-dom";
import { LogOut, Mail, ShieldCheck, Stethoscope, User } from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import type { Department } from "@/mock/types";
import { cn } from "@/lib/utils";

export function ProfileScreen() {
  const nurse = useStore((s) => s.nurse);
  const department = useStore((s) => s.department);
  const setDepartment = useStore((s) => s.setDepartment);
  const logout = useStore((s) => s.logout);
  const failSave = useStore((s) => s.failSave);
  const setFailSave = useStore((s) => s.setFailSave);
  const navigate = useNavigate();

  const depts: Department[] = ["clinic", "daycare", "inpatient"];
  const fullName = `${nurse.firstName} ${nurse.lastName}`;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">{ar.profile.title}</h1>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar name={fullName} className="size-16" />
          <div>
            <div className="text-lg font-bold">{fullName}</div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-4" />
              {nurse.contactEmail}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="flex items-center gap-2 font-bold">
            <Stethoscope className="size-4 text-primary" />
            {ar.profile.activeDept}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {depts.map((d) => (
              <button
                key={d}
                onClick={() => setDepartment(d)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-bold transition-colors",
                  department === d
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {ar.dept[d]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="flex items-center gap-2 font-bold">
            <ShieldCheck className="size-4 text-primary" />
            {ar.profile.security}
          </h2>
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              {ar.profile.securityPlaceholder}
            </div>
          </div>

          {/* Dev tool: simulate save failures to demonstrate error states */}
          <div className="flex items-center justify-between rounded-lg border border-dashed border-warning/50 bg-warning/5 p-3">
            <span className="text-sm font-bold text-warning-foreground">{ar.failSaveToggle}</span>
            <Switch checked={failSave} onCheckedChange={setFailSave} aria-label={ar.failSaveToggle} />
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-destructive"
        onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      >
        <LogOut className="size-4" />
        {ar.profile.logout}
      </Button>
    </div>
  );
}
