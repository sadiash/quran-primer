"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Listens to scroll on #main-content (the app uses h-dvh overflow-hidden,
 * so window scroll doesn't apply). Hides nav when scrolling down past a
 * threshold, shows it when scrolling up.
 */
export function useAutoHideNav() {
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const el = document.getElementById("main-content");
    if (!el) return;

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = el!.scrollTop;
        const delta = currentY - lastScrollY.current;

        if (delta > 10 && currentY > 48) {
          setNavHidden(true);
        } else if (delta < -10) {
          setNavHidden(false);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return navHidden;
}
