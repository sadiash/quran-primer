import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("renders with accessible label", () => {
    render(<IconButton label="Close">X</IconButton>);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("has aria-label attribute", () => {
    render(<IconButton label="Settings">S</IconButton>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Settings");
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton label="Close" onClick={onClick}>
        X
      </IconButton>
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("can be disabled", () => {
    render(
      <IconButton label="Disabled" disabled>
        X
      </IconButton>
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies variant styles", () => {
    render(
      <IconButton label="Outlined" variant="outline">
        X
      </IconButton>
    );
    expect(screen.getByRole("button")).toHaveClass("border");
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <IconButton ref={ref} label="Ref">
        X
      </IconButton>
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
