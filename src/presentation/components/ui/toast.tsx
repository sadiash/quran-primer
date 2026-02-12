"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ─── Types ───

export type ToastVariant = "default" | "success" | "error";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, options?: { variant?: ToastVariant; duration?: number }) => void;
}

// ─── Context ───

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Provider ───

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const toast = useCallback(
    (message: string, options?: { variant?: ToastVariant; duration?: number }) => {
      const id = String(++counterRef.current);
      const newToast: Toast = {
        id,
        message,
        variant: options?.variant ?? "default",
        duration: options?.duration ?? 4000,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-20 md:bottom-4 right-4 z-60 flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext>
  );
}

// ─── Toast Item ───

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-card text-card-foreground border-border",
  success: "bg-card text-card-foreground border-accent",
  error: "bg-card text-card-foreground border-destructive",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="status"
      className={cn(
        "animate-slide-in-bottom rounded-lg border px-4 py-3 shadow-soft-md",
        "min-w-[280px] max-w-sm text-sm",
        variantStyles[toast.variant]
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span>{toast.message}</span>
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-fast"
          aria-label="Dismiss notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
