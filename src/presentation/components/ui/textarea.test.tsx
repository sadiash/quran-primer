import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("accepts typed text", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" />);
    await user.type(screen.getByRole("textbox"), "my notes");
    expect(screen.getByRole("textbox")).toHaveValue("my notes");
  });

  it("shows placeholder", () => {
    render(<Textarea placeholder="Write a note..." />);
    expect(screen.getByPlaceholderText("Write a note...")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Textarea aria-label="Notes" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="Notes" onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "x");
    expect(onChange).toHaveBeenCalled();
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} aria-label="Notes" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
