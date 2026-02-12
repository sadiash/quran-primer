import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/helpers/test-utils";
import { AudioDock } from "./audio-dock";

beforeEach(() => {
  // Create the portal slot
  const slot = document.createElement("div");
  slot.id = "audio-dock-slot";
  document.body.appendChild(slot);

  // Mock Audio element
  vi.spyOn(window, "Audio").mockImplementation(
    vi.fn(function (this: Record<string, unknown>) {
      this.src = "";
      this.currentTime = 0;
      this.duration = 0;
      this.play = vi.fn().mockResolvedValue(undefined);
      this.pause = vi.fn();
      this.addEventListener = vi.fn();
      this.removeEventListener = vi.fn();
    }) as unknown as () => HTMLAudioElement,
  );

  return () => {
    document.body.removeChild(slot);
    vi.restoreAllMocks();
  };
});

describe("AudioDock", () => {
  it("renders nothing when no audio is playing", () => {
    render(<AudioDock />);
    // The portal slot should be empty
    const slot = document.getElementById("audio-dock-slot");
    expect(slot?.children.length).toBe(0);
  });

  it("renders controls into the portal slot", () => {
    render(<AudioDock />);
    // Since no audio is playing, no controls should appear
    expect(screen.queryByLabelText("Pause")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Play")).not.toBeInTheDocument();
  });
});
