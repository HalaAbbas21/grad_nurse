import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Lock, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";

const MAX_ATTEMPTS = 5;

export function LoginScreen() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [username, setUsername] = useState("rana");
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");

  const lockedOut = attempts >= MAX_ATTEMPTS;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedOut) return;
    if (!username.trim() || !password.trim()) {
      setAttempts((a) => a + 1);
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    login();
    navigate("/select-department", { replace: true });
  };

  const biometric = () => {
    login();
    navigate("/select-department", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Hero brand gradient — used sparingly */}
      <div className="pointer-events-none absolute -top-32 start-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-gradient opacity-15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-soft">
            <Stethoscope className="size-8" />
          </span>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            {ar.appName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{ar.login.subtitle}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">{ar.login.title}</h2>
          <form onSubmit={submit} className="space-y-4">
            <Field label={ar.login.username} htmlFor="username">
              <div className="relative">
                <User className="absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="ps-10"
                  autoComplete="username"
                />
              </div>
            </Field>
            <Field label={ar.login.password} htmlFor="password" error={error || undefined}>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ps-10"
                  autoComplete="current-password"
                />
              </div>
            </Field>

            {lockedOut && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
                {ar.login.lockout}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={lockedOut}>
              {ar.login.signIn}
            </Button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">أو</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button type="button" variant="outline" size="lg" className="w-full" onClick={biometric}>
              <Fingerprint className="size-5" />
              {ar.login.biometric}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">{ar.login.hint}</p>
        </div>
      </div>
    </div>
  );
}
