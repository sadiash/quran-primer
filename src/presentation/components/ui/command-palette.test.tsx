import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/helpers/test-utils";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "./command-palette";
import { createMockSurah } from "@/test/helpers/mock-data";
import type { Surah } from "@/core/types";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSetTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: mockSetTheme }),
}));

const mockToast = vi.fn();
vi.mock("@/presentation/components/ui/toast", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./toast")>();
  return {
    ...actual,
    useToast: () => ({ toast: mockToast }),
  };
});

const surahs: Surah[] = [
  createMockSurah({ id: 1, nameSimple: "Al-Fatihah", nameArabic: "الفاتحة", nameTranslation: "The Opener" }),
  createMockSurah({ id: 2, nameSimple: "Al-Baqarah", nameArabic: "البقرة", nameTranslation: "The Cow", versesCount: 286 }),
  createMockSurah({ id: 114, nameSimple: "An-Nas", nameArabic: "الناس", nameTranslation: "Mankind", versesCount: 6 }),
];

function renderPalette(props: Partial<React.ComponentProps<typeof CommandPalette>> = {}) {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    surahs,
    recentCommandIds: [],
    onCommandExecuted: vi.fn(),
  };
  return render(<CommandPalette {...defaultProps} {...props} />);
}

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open", () => {
    renderPalette();
    expect(screen.getByPlaceholderText(/search surahs/i)).toBeInTheDocument();
  });

  it("does not render content when closed", () => {
    renderPalette({ open: false });
    expect(screen.queryByPlaceholderText(/search surahs/i)).not.toBeInTheDocument();
  });

  it("input is present and focusable when open", () => {
    renderPalette();
    const input = screen.getByPlaceholderText(/search surahs/i);
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("role", "combobox");
  });

  it("displays all surah items", () => {
    renderPalette();
    expect(screen.getByText("1. Al-Fatihah")).toBeInTheDocument();
    expect(screen.getByText("2. Al-Baqarah")).toBeInTheDocument();
    expect(screen.getByText("114. An-Nas")).toBeInTheDocument();
  });

  it("filters surah items by English name", async () => {
    const user = userEvent.setup();
    renderPalette();

    await user.type(screen.getByPlaceholderText(/search surahs/i), "Baqarah");

    await waitFor(() => {
      expect(screen.getByText("2. Al-Baqarah")).toBeInTheDocument();
      expect(screen.queryByText("1. Al-Fatihah")).not.toBeInTheDocument();
      expect(screen.queryByText("114. An-Nas")).not.toBeInTheDocument();
    });
  });

  it("filters surah items by Arabic name", async () => {
    const user = userEvent.setup();
    renderPalette();

    await user.type(screen.getByPlaceholderText(/search surahs/i), "البقرة");

    await waitFor(() => {
      expect(screen.getByText("2. Al-Baqarah")).toBeInTheDocument();
      expect(screen.queryByText("1. Al-Fatihah")).not.toBeInTheDocument();
    });
  });

  it("navigates to surah on select", async () => {
    const user = userEvent.setup();
    const onCommandExecuted = vi.fn();
    renderPalette({ onCommandExecuted });

    await user.click(screen.getByText("2. Al-Baqarah"));

    expect(mockPush).toHaveBeenCalledWith("/surahs/2");
    expect(onCommandExecuted).toHaveBeenCalledWith("surah-2");
  });

  it("theme toggle command executes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderPalette({ onOpenChange });

    // Find and click theme toggle
    const themeItem = screen.getByText(/Toggle Dark Mode/i);
    await user.click(themeItem);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("arabic script toggle shows coming soon toast", async () => {
    const user = userEvent.setup();
    renderPalette();

    await user.click(screen.getByText("Toggle Arabic Script"));

    expect(mockToast).toHaveBeenCalledWith("Arabic script toggle coming soon");
  });

  it("closes on backdrop click", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderPalette({ onOpenChange });

    // Click on the backdrop (the aria-hidden overlay)
    const backdrop = document.querySelector("[aria-hidden]");
    if (backdrop) await user.click(backdrop);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows empty state when no results match", async () => {
    const user = userEvent.setup();
    renderPalette();

    await user.type(screen.getByPlaceholderText(/search surahs/i), "xyznonexistent");

    await waitFor(() => {
      expect(screen.getByText("No results found.")).toBeInTheDocument();
    });
  });

  it("shows footer keyboard hints", () => {
    renderPalette();
    expect(screen.getByText("navigate")).toBeInTheDocument();
    expect(screen.getByText("select")).toBeInTheDocument();
    expect(screen.getByText("close")).toBeInTheDocument();
  });

  it("shows recent commands when provided", () => {
    renderPalette({ recentCommandIds: ["surah-2"] });
    // Should show a "Recent" group with Al-Baqarah
    expect(screen.getByText("Recent")).toBeInTheDocument();
  });

  it("displays settings group", () => {
    renderPalette();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText(/Toggle.*Mode/)).toBeInTheDocument();
    expect(screen.getByText("Toggle Arabic Script")).toBeInTheDocument();
  });
});
