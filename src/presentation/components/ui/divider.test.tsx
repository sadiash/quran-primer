import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { Divider } from "./divider";

describe("Divider", () => {
  it("renders as separator role", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("defaults to horizontal orientation", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("renders horizontal with full width", () => {
    render(<Divider />);
    const el = screen.getByRole("separator");
    expect(el).toHaveClass("w-full", "h-px");
  });

  it("renders vertical orientation", () => {
    render(<Divider orientation="vertical" />);
    const el = screen.getByRole("separator");
    expect(el).toHaveAttribute("aria-orientation", "vertical");
    expect(el).toHaveClass("h-full", "w-px");
  });

  it("merges custom className", () => {
    render(<Divider className="my-4" />);
    expect(screen.getByRole("separator")).toHaveClass("my-4");
  });
});
