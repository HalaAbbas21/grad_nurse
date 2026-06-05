import * as React from "react";
import { CheckCircle2, AlertTriangle, Info, X, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  onUndo?: () => void;
}

interface ToastContextValue {
  toast: (message: string, opts?: { tone?: ToastTone; onUndo?: () => void }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const remove = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    (message, opts) => {
      const id = ++counter;
      const tone = opts?.tone ?? "success";
      setItems((prev) => [...prev, { id, message, tone, onUndo: opts?.onUndo }]);
      const ttl = opts?.onUndo ? 6000 : 3500;
      window.setTimeout(() => remove(id), ttl);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const toneStyles: Record<ToastTone, { cls: string; icon: React.ReactNode }> = {
  success: {
    cls: "border-secondary/40 bg-secondary-soft text-secondary-foreground",
    icon: <CheckCircle2 className="size-5 text-secondary" />,
  },
  error: {
    cls: "border-destructive/40 bg-destructive/10 text-destructive",
    icon: <AlertTriangle className="size-5 text-destructive" />,
  },
  info: {
    cls: "border-primary/30 bg-primary-soft text-primary",
    icon: <Info className="size-5 text-primary" />,
  },
};

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const t = toneStyles[item.tone];
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border px-4 py-3 shadow-soft",
        t.cls,
      )}
      role="status"
    >
      {t.icon}
      <span className="flex-1 text-sm font-bold">{item.message}</span>
      {item.onUndo && (
        <button
          onClick={() => {
            item.onUndo?.();
            onClose();
          }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-extrabold underline-offset-2 hover:underline"
        >
          <Undo2 className="size-3.5" />
          تراجع
        </button>
      )}
      <button onClick={onClose} aria-label="إغلاق" className="opacity-70 hover:opacity-100">
        <X className="size-4" />
      </button>
    </div>
  );
}
