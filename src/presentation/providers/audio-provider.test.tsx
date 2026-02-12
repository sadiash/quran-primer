import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AudioProvider, useAudioPlayer } from "./audio-provider";

// Mock HTMLAudioElement
let mockAudio: Record<string, unknown> & {
  src: string;
  currentTime: number;
  duration: number;
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
};

const originalAudio = globalThis.Audio;

beforeEach(() => {
  mockAudio = {
    src: "",
    currentTime: 0,
    duration: 30,
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  // Replace Audio constructor globally — returns mockAudio as the instance
  globalThis.Audio = vi.fn(function (this: HTMLAudioElement) {
    Object.keys(mockAudio).forEach((key) => {
      Object.defineProperty(this, key, {
        get: () => mockAudio[key],
        set: (v: unknown) => {
          mockAudio[key] = v;
        },
        configurable: true,
      });
    });
  }) as unknown as typeof Audio;

  // Mock fetch for audio API
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        ok: true,
        data: [
          { verseKey: "1:1", url: "https://audio.example.com/1_1.mp3" },
          { verseKey: "1:2", url: "https://audio.example.com/1_2.mp3" },
          { verseKey: "1:3", url: "https://audio.example.com/1_3.mp3" },
        ],
      }),
    ),
  );
});

afterEach(() => {
  globalThis.Audio = originalAudio;
  vi.restoreAllMocks();
});

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>{children}</AudioProvider>
    </QueryClientProvider>
  );
}

describe("AudioProvider", () => {
  it("starts with no active playback", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    expect(result.current.currentVerseKey).toBeNull();
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isActive).toBe(false);
  });

  it("plays a verse", async () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    await act(async () => {
      await result.current.play("1:1", 1);
    });

    expect(result.current.currentVerseKey).toBe("1:1");
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isActive).toBe(true);
    expect(mockAudio.src).toBe("https://audio.example.com/1_1.mp3");
  });

  it("pauses and resumes", async () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    await act(async () => {
      await result.current.play("1:1", 1);
    });

    act(() => result.current.pause());
    expect(result.current.isPlaying).toBe(false);
    expect(mockAudio.pause).toHaveBeenCalled();

    await act(async () => {
      await result.current.resume();
    });
    expect(result.current.isPlaying).toBe(true);
  });

  it("stops playback and clears state", async () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    await act(async () => {
      await result.current.play("1:1", 1);
    });

    act(() => result.current.stop());

    expect(result.current.currentVerseKey).toBeNull();
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isActive).toBe(false);
  });

  it("advances to next verse", async () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    await act(async () => {
      await result.current.play("1:1", 1);
    });

    await act(async () => {
      await result.current.next();
    });

    expect(result.current.currentVerseKey).toBe("1:2");
  });

  it("goes to previous verse", async () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    await act(async () => {
      await result.current.play("1:2", 1);
    });

    await act(async () => {
      await result.current.previous();
    });

    expect(result.current.currentVerseKey).toBe("1:1");
  });

  it("toggles play/pause on Space key when playing", async () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    await act(async () => {
      await result.current.play("1:1", 1);
    });

    act(() => {
      const event = new KeyboardEvent("keydown", { code: "Space" });
      window.dispatchEvent(event);
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("ignores Space when focused on input", async () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    await act(async () => {
      await result.current.play("1:1", 1);
    });

    const input = document.createElement("input");
    document.body.appendChild(input);

    act(() => {
      const event = new KeyboardEvent("keydown", {
        code: "Space",
        bubbles: true,
      });
      Object.defineProperty(event, "target", { value: input });
      window.dispatchEvent(event);
    });

    expect(result.current.isPlaying).toBe(true);

    document.body.removeChild(input);
  });
});
