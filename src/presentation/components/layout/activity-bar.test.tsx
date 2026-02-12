import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { ActivityBar } from "./activity-bar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/surahs",
}));

describe("ActivityBar", () => {
  it("renders nav items", () => {
    render(<ActivityBar collapsed={false} onToggle={vi.fn()} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Surahs")).toBeInTheDocument();
    expect(screen.getByText("Bookmarks")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("calls onToggle when collapse button clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<ActivityBar collapsed={false} onToggle={onToggle} />);

    const toggleBtn = screen.getByLabelText("Collapse sidebar");
    await user.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("hides labels when collapsed", () => {
    render(<ActivityBar collapsed={true} onToggle={vi.fn()} />);
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
  });
});
