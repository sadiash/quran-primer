import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("does not show content by default", () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows content on hover after delay", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Help text" delayMs={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole("button"));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Help text");
  });

  it("hides content on mouse leave", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Help text" delayMs={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole("button"));
    await screen.findByRole("tooltip");
    await user.unhover(screen.getByRole("button"));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows content on focus", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Keyboard tip" delayMs={0}>
        <button>Focus me</button>
      </Tooltip>
    );
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Keyboard tip");
  });

  it("renders children", () => {
    render(
      <Tooltip content="Tip">
        <button>Child button</button>
      </Tooltip>
    );
    expect(screen.getByRole("button", { name: "Child button" })).toBeInTheDocument();
  });
});
