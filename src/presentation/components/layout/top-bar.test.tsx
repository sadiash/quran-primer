import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { TopBar } from "./top-bar";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

describe("TopBar", () => {
  it("renders", () => {
    render(<TopBar onMenuToggle={vi.fn()} />);
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    expect(screen.getByLabelText("Command palette")).toBeInTheDocument();
  });

  it("calls onMenuToggle when hamburger clicked", async () => {
    const onMenuToggle = vi.fn();
    render(<TopBar onMenuToggle={onMenuToggle} />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Toggle menu"));
    expect(onMenuToggle).toHaveBeenCalledOnce();
  });
});
