import { AlertTriangle, CheckCircle2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ar } from "@/i18n/ar";

export function EmptyState({
  message,
  success,
  icon,
}: {
  message: string;
  success?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <div
        className={
          success
            ? "flex size-12 items-center justify-center rounded-full bg-secondary-soft text-secondary"
            : "flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
        }
      >
        {icon ?? (success ? <CheckCircle2 className="size-6" /> : <Inbox className="size-6" />)}
      </div>
      <p
        className={
          success
            ? "text-sm font-bold text-secondary-foreground"
            : "text-sm font-medium text-muted-foreground"
        }
      >
        {message}
      </p>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div>
        <p className="font-bold text-foreground">{ar.errorTitle}</p>
        <p className="text-sm text-muted-foreground">{ar.errorBody}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {ar.retry}
        </Button>
      )}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}
