import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { OnboardingFlow } from "./onboarding-flow";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("OnboardingFlow", () => {
  it("renders step 1", () => {
    render(<OnboardingFlow onComplete={vi.fn()} />);
    expect(screen.getByText("Welcome to The Primer")).toBeInTheDocument();
  });

  it("navigates through 3 steps", async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow onComplete={vi.fn()} />);

    // Step 1
    expect(screen.getByText("Welcome to The Primer")).toBeInTheDocument();
    await user.click(screen.getByText("Next"));

    // Step 2
    expect(screen.getByText("Powerful Features")).toBeInTheDocument();
    await user.click(screen.getByText("Next"));

    // Step 3
    expect(screen.getByText("Choose Your Theme")).toBeInTheDocument();
  });

  it("calls onComplete on final step", async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(<OnboardingFlow onComplete={onComplete} />);

    await user.click(screen.getByText("Next")); // step 1 -> 2
    await user.click(screen.getByText("Next")); // step 2 -> 3
    await user.click(screen.getByText("Get Started")); // complete

    expect(onComplete).toHaveBeenCalledOnce();
  });
});
