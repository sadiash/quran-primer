"use client";

import { useRef, useEffect } from "react";

export function useScrollPosition(key: string) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const storageKey = `scroll:${key}`;
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      el.scrollTop = Number(saved);
    }

    let timer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        sessionStorage.setItem(storageKey, String(el.scrollTop));
      }, 150);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", handleScroll);
    };
  }, [key]);

  return containerRef;
}
