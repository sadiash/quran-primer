import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders with text", () => {
    render(<Badge>Meccan</Badge>);
    expect(screen.getByText("Meccan")).toBeInTheDocument();
  });

  it("applies default variant", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass("bg-primary");
  });

  it("applies secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary")).toHaveClass("bg-secondary");
  });

  it("applies outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toHaveClass("border");
  });

  it("applies destructive variant", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error")).toHaveClass("bg-destructive");
  });

  it("merges custom className", () => {
    render(<Badge className="my-class">Tag</Badge>);
    expect(screen.getByText("Tag")).toHaveClass("my-class");
  });
});
