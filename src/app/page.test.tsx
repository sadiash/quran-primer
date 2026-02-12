import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import Home from "./page";

describe("Home page", () => {
  it("renders the heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The Primer");
  });
});
