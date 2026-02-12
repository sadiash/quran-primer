import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
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
});
