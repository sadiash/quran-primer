import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("@/presentation/components/ui/toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/presentation/providers/audio-provider", () => ({
  AudioProvider: ({ children }: { children: React.ReactNode }) => children,
  useAudioPlayer: () => ({
    isActive: false,
    isPlaying: false,
    currentVerseKey: null,
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
  }),
}));

vi.mock("./audio-dock", () => ({
  AudioDock: () => null,
}));

describe("AppShell", () => {
  it("renders children", () => {
    render(
      <AppShell>
        <div data-testid="child">Hello</div>
      </AppShell>,
    );
    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("renders main navigation", () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByRole("navigation", { name: /main/i })).toBeInTheDocument();
  });

  it("renders audio dock slot", () => {
    const { container } = render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );
    expect(container.querySelector("#audio-dock-slot")).toBeInTheDocument();
  });

  it("has id main-content on main element", () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });
});
