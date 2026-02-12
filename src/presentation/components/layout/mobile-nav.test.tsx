import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { MobileNav } from "./mobile-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("MobileNav", () => {
  it("renders nav items", () => {
    render(<MobileNav />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Surahs")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders mobile navigation landmark", () => {
    render(<MobileNav />);
    expect(
      screen.getByRole("navigation", { name: /mobile/i }),
    ).toBeInTheDocument();
  });
});
