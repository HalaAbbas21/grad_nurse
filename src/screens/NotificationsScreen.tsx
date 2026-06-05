import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, BellRing, CheckCheck, Info } from "lucide-react";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/States";
import { cn, waitLabel } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/mock/types";

const TYPE_META: Record<NotificationType, { cls: string; icon: typeof Bell }> = {
  alert: { cls: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  reminder: { cls: "bg-warning/20 text-warning-foreground", icon: BellRing },
  info: { cls: "bg-primary-soft text-primary", icon: Info },
};

export function NotificationsScreen() {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationRead);
  const markAllRead = useStore((s) => s.markAllRead);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationType | "all">("all");

  const list = [...notifications]
    .filter((n) => filter === "all" || n.type === filter)
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

  const open = (n: AppNotification) => {
    markRead(n.id);
    if (!n.relatedPatientFileNo) return;
    const base = `/patients/${encodeURIComponent(n.relatedPatientFileNo)}`;
    if (n.deepLink === "register") navigate("/patients/new");
    else if (n.deepLink) navigate(`${base}/${n.deepLink}`);
    else navigate(base);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">{ar.notif.title}</h1>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <CheckCheck className="size-4" />
          {ar.notif.markAllRead}
        </Button>
      </div>

      <Select
        value={filter}
        onValueChange={(v) => setFilter(v as NotificationType | "all")}
        options={[
          { value: "all", label: ar.notif.all },
          { value: "alert", label: ar.notifType.alert },
          { value: "reminder", label: ar.notifType.reminder },
          { value: "info", label: ar.notifType.info },
        ]}
        className="max-w-[12rem]"
        aria-label={ar.notif.filter}
      />

      {list.length === 0 ? (
        <EmptyState message={ar.notif.empty} />
      ) : (
        <ul className="space-y-2">
          {list.map((n) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <li key={n.id}>
                <button
                  onClick={() => open(n)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-3 text-start transition-colors hover:bg-muted/50",
                    n.isRead ? "border-border bg-card" : "border-primary/30 bg-primary-soft/30",
                  )}
                >
                  <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full", meta.cls)}>
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={n.isRead ? "text-foreground" : "font-bold text-foreground"}>
                      {n.message}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-0.5 font-bold">
                        {ar.notifType[n.type]}
                      </span>
                      {n.relatedPatientFileNo && (
                        <span className="font-bold text-primary">{n.relatedPatientFileNo}</span>
                      )}
                      <span>·</span>
                      <span>{waitLabel(n.timestamp)} مضت</span>
                    </div>
                  </div>
                  {!n.isRead && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
