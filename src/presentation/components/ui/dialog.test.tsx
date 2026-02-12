import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";

describe("Dialog", () => {
  it("renders content when open", () => {
    render(
      <Dialog open={true} onClose={vi.fn()}>
        <DialogHeader>
          <DialogTitle>Test Title</DialogTitle>
          <DialogDescription>Test description</DialogDescription>
        </DialogHeader>
        <p>Dialog body</p>
      </Dialog>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("Dialog body")).toBeInTheDocument();
  });

  it("renders as a dialog element", () => {
    render(
      <Dialog open={true} onClose={vi.fn()}>
        Content
      </Dialog>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <Dialog open={true} onClose={onClose}>
        Content
      </Dialog>
    );
    const dialog = screen.getByRole("dialog");
    // Simulate the cancel event (triggered by Escape key on native dialogs)
    dialog.dispatchEvent(new Event("cancel", { bubbles: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on backdrop click", () => {
    const onClose = vi.fn();
    render(
      <Dialog open={true} onClose={onClose}>
        <p>Inner</p>
      </Dialog>
    );
    const dialog = screen.getByRole("dialog");
    // Simulate click on the dialog element itself (backdrop area)
    dialog.click();
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call onClose when clicking inner content", () => {
    const onClose = vi.fn();
    render(
      <Dialog open={true} onClose={onClose}>
        <p>Inner content</p>
      </Dialog>
    );
    screen.getByText("Inner content").click();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders DialogFooter", () => {
    render(
      <Dialog open={true} onClose={vi.fn()}>
        <DialogFooter>
          <button>Save</button>
        </DialogFooter>
      </Dialog>
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
