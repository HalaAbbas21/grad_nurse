import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** size of the centered desktop dialog */
  size?: "sm" | "md" | "lg";
}

/**
 * Responsive modal: centered dialog on desktop, bottom sheet on phone.
 * Mirrored for RTL automatically (uses logical properties).
 */
export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeCls = size === "sm" ? "sm:max-w-md" : size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden bg-card shadow-soft",
          "rounded-t-3xl sm:rounded-2xl",
          sizeCls,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 border-b border-border p-5">
            <div className="flex flex-col gap-1">
              {title && <h2 className="text-lg font-bold tracking-tight">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="إغلاق" className="-me-2 -mt-2">
              <X className="size-5" />
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
