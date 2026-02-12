import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@/test/helpers/test-utils";
import { render as rawRender } from "@testing-library/react";
import { ToastProvider, useToast } from "./toast";

function TestTrigger({
  message = "Test toast",
  variant,
  duration,
}: {
  message?: string;
  variant?: "default" | "success" | "error";
  duration?: number;
}) {
  const { toast } = useToast();
  return (
    <button onClick={() => toast(message, { variant, duration })}>Show Toast</button>
  );
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows toast on trigger", () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText("Show Toast"));
    });
    expect(screen.getByText("Test toast")).toBeInTheDocument();
  });

  it("auto-dismisses after duration", () => {
    render(
      <ToastProvider>
        <TestTrigger duration={2000} />
      </ToastProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText("Show Toast"));
    });
    expect(screen.getByText("Test toast")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.queryByText("Test toast")).not.toBeInTheDocument();
  });

  it("dismisses on close button click", () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText("Show Toast"));
    });
    expect(screen.getByText("Test toast")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByLabelText("Dismiss notification"));
    });
    expect(screen.queryByText("Test toast")).not.toBeInTheDocument();
  });

  it("renders toast with status role", () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText("Show Toast"));
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("supports multiple toasts", () => {
    render(
      <ToastProvider>
        <TestTrigger message="Toast 1" />
      </ToastProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText("Show Toast"));
    });
    act(() => {
      fireEvent.click(screen.getByText("Show Toast"));
    });
    expect(screen.getAllByRole("status")).toHaveLength(2);
  });

  it("throws when used outside provider", () => {
    expect(() => rawRender(<TestTrigger />)).toThrow("useToast must be used within ToastProvider");
  });
});
