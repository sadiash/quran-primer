import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No items found." />);
    expect(screen.getByText("No items found.")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState title="No items." description="Try adding some items." />,
    );
    expect(screen.getByText("Try adding some items.")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<EmptyState title="No items." />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(1);
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="No items."
        action={<button>Add Item</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState title="No items." className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
