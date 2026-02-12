import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { HomeContent } from "./home-content";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("HomeContent", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows onboarding for new users", () => {
    render(<HomeContent />);
    expect(screen.getByText("Welcome to The Primer")).toBeInTheDocument();
  });

  it("shows welcome back for returning users", () => {
    window.localStorage.setItem("primer:onboarded", "true");
    render(<HomeContent />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });
});
