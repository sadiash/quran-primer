"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AudioRecitation, ApiResponse } from "@/core/types";

interface AudioState {
  currentVerseKey: string | null;
  currentSurahId: number | null;
  isPlaying: boolean;
  reciterId: number;
  duration: number;
  currentTime: number;
  isActive: boolean;
}

interface AudioControls {
  play: (verseKey: string, surahId: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  setReciter: (id: number) => void;
  seek: (time: number) => void;
}

type AudioContextValue = AudioState & AudioControls;

const AudioContext = createContext<AudioContextValue | null>(null);

const DEFAULT_RECITER_ID = 7; // Mishari Rashid al-Afasy

async function fetchAudioMap(
  surahId: number,
  reciterId: number,
): Promise<Map<string, string>> {
  const res = await fetch(
    `/api/v1/audio?surah_id=${surahId}&reciter_id=${reciterId}`,
  );
  const json = (await res.json()) as ApiResponse<AudioRecitation[]>;
  if (!json.ok) throw new Error(json.error.message);

  const map = new Map<string, string>();
  for (const rec of json.data) {
    map.set(rec.verseKey, rec.url);
  }
  return map;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioMapRef = useRef<Map<string, string>>(new Map());
  const verseKeysRef = useRef<string[]>([]);

  const [currentVerseKey, setCurrentVerseKey] = useState<string | null>(null);
  const [currentSurahId, setCurrentSurahId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciterId, setReciterIdState] = useState(DEFAULT_RECITER_ID);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Lazily create audio element
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }, []);

  // Load audio map for a surah
  const loadAudioMap = useCallback(
    async (surahId: number, rid: number) => {
      const map = await fetchAudioMap(surahId, rid);
      audioMapRef.current = map;
      verseKeysRef.current = Array.from(map.keys()).sort((a, b) => {
        const [, aNum] = a.split(":");
        const [, bNum] = b.split(":");
        return Number(aNum) - Number(bNum);
      });
      return map;
    },
    [],
  );

  const play = useCallback(
    async (verseKey: string, surahId: number) => {
      const audio = getAudio();

      // Load audio map if surah changed
      if (surahId !== currentSurahId || audioMapRef.current.size === 0) {
        await loadAudioMap(surahId, reciterId);
      }

      const url = audioMapRef.current.get(verseKey);
      if (!url) return;

      audio.src = url;
      await audio.play();
      setCurrentVerseKey(verseKey);
      setCurrentSurahId(surahId);
      setIsPlaying(true);
    },
    [currentSurahId, reciterId, getAudio, loadAudioMap],
  );

  const pause = useCallback(() => {
    getAudio().pause();
    setIsPlaying(false);
  }, [getAudio]);

  const resume = useCallback(async () => {
    await getAudio().play();
    setIsPlaying(true);
  }, [getAudio]);

  const stop = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    audio.src = "";
    setIsPlaying(false);
    setCurrentVerseKey(null);
    setCurrentSurahId(null);
    setDuration(0);
    setCurrentTime(0);
  }, [getAudio]);

  const next = useCallback(() => {
    if (!currentVerseKey || !currentSurahId) return;
    const keys = verseKeysRef.current;
    const idx = keys.indexOf(currentVerseKey);
    const nextKey = keys[idx + 1];
    if (idx < 0 || !nextKey) return;
    play(nextKey, currentSurahId);
  }, [currentVerseKey, currentSurahId, play]);

  const previous = useCallback(() => {
    if (!currentVerseKey || !currentSurahId) return;
    const keys = verseKeysRef.current;
    const idx = keys.indexOf(currentVerseKey);
    const prevKey = keys[idx - 1];
    if (idx <= 0 || !prevKey) return;
    play(prevKey, currentSurahId);
  }, [currentVerseKey, currentSurahId, play]);

  const setReciter = useCallback(
    async (id: number) => {
      setReciterIdState(id);
      if (currentSurahId) {
        await loadAudioMap(currentSurahId, id);
        // If currently playing, restart with new reciter
        if (currentVerseKey && isPlaying) {
          const audio = getAudio();
          const url = audioMapRef.current.get(currentVerseKey);
          if (url) {
            audio.src = url;
            await audio.play();
          }
        }
      }
    },
    [currentSurahId, currentVerseKey, isPlaying, getAudio, loadAudioMap],
  );

  const seek = useCallback(
    (time: number) => {
      const audio = getAudio();
      audio.currentTime = time;
    },
    [getAudio],
  );

  // Audio element event listeners
  useEffect(() => {
    const audio = getAudio();

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => next();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [getAudio, next]);

  // Global keyboard: Space to toggle play/pause
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      if (!currentVerseKey) return;

      e.preventDefault();
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentVerseKey, isPlaying, pause, resume]);

  const value: AudioContextValue = {
    currentVerseKey,
    currentSurahId,
    isPlaying,
    reciterId,
    duration,
    currentTime,
    isActive: currentVerseKey !== null,
    play,
    pause,
    resume,
    stop,
    next,
    previous,
    setReciter,
    seek,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within an AudioProvider");
  }
  return ctx;
}
