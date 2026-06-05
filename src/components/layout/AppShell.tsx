import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Home,
  Pill,
  Search,
  Users,
  User,
  ChevronDown,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ar } from "@/i18n/ar";
import { useStore } from "@/store/useStore";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommandSearch } from "@/components/shared/CommandSearch";
import type { Department } from "@/mock/types";

const NAV = [
  { to: "/", label: ar.nav.dashboard, icon: Home, end: true },
  { to: "/patients", label: ar.nav.patients, icon: Users, end: false },
  { to: "/medications", label: ar.nav.medications, icon: Pill, end: false },
  { to: "/notifications", label: ar.nav.notifications, icon: Bell, end: false },
  { to: "/profile", label: ar.nav.profile, icon: User, end: false },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const unread = useStore((s) => s.notifications.filter((n) => !n.isRead).length);

  return (
    <div className="min-h-screen">
      <TopBar onSearch={() => setSearchOpen(true)} unread={unread} />
      <div className="mx-auto flex w-full max-w-screen-xl gap-6 px-0 lg:px-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 py-6 lg:block">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <SideLink key={item.to} item={item} unread={unread} />
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="w-full min-w-0 px-4 pb-24 pt-4 lg:px-0 lg:pb-10">{children}</main>
      </div>

      {/* Phone bottom tab bar */}
      <BottomTabBar unread={unread} />

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

function TopBar({ onSearch, unread }: { onSearch: () => void; unread: number }) {
  const nurse = useStore((s) => s.nurse);
  const department = useStore((s) => s.department);
  const setDepartment = useStore((s) => s.setDepartment);
  const [deptOpen, setDeptOpen] = useState(false);
  const navigate = useNavigate();
  const depts: Department[] = ["clinic", "daycare", "inpatient"];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="mx-auto flex h-16 w-full max-w-screen-xl items-center gap-3 px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <Stethoscope className="size-5" />
          </span>
          <span className="hidden font-display text-lg font-extrabold tracking-tight text-foreground sm:inline">
            {ar.brand}
          </span>
        </Link>

        {/* Department switcher */}
        <div className="relative">
          <button
            onClick={() => setDeptOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-bold text-foreground hover:bg-muted"
          >
            <span className="size-2 rounded-full bg-secondary" />
            {department ? ar.dept[department] : ar.selectDept}
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
          {deptOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDeptOpen(false)} />
              <div className="absolute z-20 mt-2 w-48 rounded-xl border border-border bg-popover p-1 shadow-soft">
                {depts.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDepartment(d);
                      setDeptOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted",
                      department === d ? "text-primary" : "text-foreground",
                    )}
                  >
                    {ar.dept[d]}
                    {department === d && <span className="size-2 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />

        <Button variant="ghost" size="icon" onClick={onSearch} aria-label={ar.search}>
          <Search className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate("/notifications")}
          aria-label={ar.nav.notifications}
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -end-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-extrabold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
        <button onClick={() => navigate("/profile")} aria-label={ar.nav.profile}>
          <Avatar name={`${nurse.firstName} ${nurse.lastName}`} className="size-9" />
        </button>
      </div>
    </header>
  );
}

function SideLink({
  item,
  unread,
}: {
  item: (typeof NAV)[number];
  unread: number;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
          isActive
            ? "bg-primary-soft text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )
      }
    >
      <Icon className="size-5" />
      {item.label}
      {item.to === "/notifications" && unread > 0 && (
        <span className="ms-auto flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-extrabold text-destructive-foreground">
          {unread}
        </span>
      )}
    </NavLink>
  );
}

function BottomTabBar({ unread }: { unread: number }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-screen-sm items-stretch justify-around">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "relative flex min-h-[60px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-bold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <span className="relative">
                <Icon className="size-6" />
                {item.to === "/notifications" && unread > 0 && (
                  <span className="absolute -end-2 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-extrabold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
