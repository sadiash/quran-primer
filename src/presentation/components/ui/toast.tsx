"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "error" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant, action?: ToastAction) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "default", action?: ToastAction) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant, action }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, action ? 6000 : 4000);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 shadow-soft-md animate-fade-in",
              "border text-sm font-medium",
              toast.variant === "default" && "bg-card text-card-foreground border-border",
              toast.variant === "success" && "bg-accent/10 text-accent border-accent/30",
              toast.variant === "error" && "bg-destructive/10 text-destructive border-destructive/30",
              toast.variant === "warning" && "bg-primary/10 text-primary border-primary/30",
            )}
          >
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.onClick();
                  removeToast(toast.id);
                }}
                className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold underline underline-offset-2 hover:bg-muted transition-fast"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded p-0.5 hover:bg-muted transition-fast"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
