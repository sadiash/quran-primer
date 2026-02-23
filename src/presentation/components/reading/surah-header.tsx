"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Surah } from "@/core/types";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { cn } from "@/lib/utils";

interface SurahHeaderProps {
  surah: Surah;
  compact?: boolean;
}

export function SurahHeader({ surah, compact = false }: SurahHeaderProps) {
  const audio = useAudioPlayer();
  const hasPrev = surah.id > 1;
  const hasNext = surah.id < 114;

  return (
    <div className="text-center">
      {/* ── Compact header (scrolled state) ── */}
      <div
        className={cn(
          "flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 overflow-hidden",
          compact ? "max-h-14 opacity-100 py-2" : "max-h-0 opacity-0",
        )}
      >
        <NavChevron
          href={hasPrev ? `/surah/${surah.id - 1}` : "#"}
          disabled={!hasPrev}
          direction="prev"
          small
        />

        <span className="text-[10px] font-medium text-primary/40 serif-display">
          {surah.id}
        </span>

        <h2
          lang="ar"
          dir="rtl"
          className="arabic-display text-lg text-foreground leading-normal"
        >
          {surah.nameArabic}
        </h2>

        <span className="text-primary/15 text-xs select-none">·</span>

        <span className="serif-display text-sm text-muted-foreground/60 font-light italic">
          {surah.nameSimple}
        </span>

        <NavChevron
          href={hasNext ? `/surah/${surah.id + 1}` : "#"}
          disabled={!hasNext}
          direction="next"
          small
        />
      </div>

      {/* ── Expanded header (at-top state) ── */}
      <div
        className={cn(
          "transition-all duration-300 overflow-hidden",
          compact ? "max-h-0 opacity-0" : "max-h-80 opacity-100",
        )}
      >
        <div className="header-reveal pb-3 pt-2">
          {/* Islamic shamsa medallion with surah number */}
          <div className="mb-4">
            <ShamsaMedallion number={surah.id} />
          </div>

          {/* Arabic name with prev/next chevrons */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <NavChevron
              href={hasPrev ? `/surah/${surah.id - 1}` : "#"}
              disabled={!hasPrev}
              direction="prev"
            />

            <h1
              lang="ar"
              dir="rtl"
              className="arabic-display surah-title-arabic"
            >
              {surah.nameArabic}
            </h1>

            <NavChevron
              href={hasNext ? `/surah/${surah.id + 1}` : "#"}
              disabled={!hasNext}
              direction="next"
            />
          </div>

          {/* English name — serif display */}
          <p className="mt-2 text-base tracking-wide text-muted-foreground/70 font-light serif-display">
            {surah.nameSimple}
            <span className="mx-2 text-border/40">—</span>
            <span className="italic">{surah.nameTranslation}</span>
          </p>

          {/* Metadata */}
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-muted-foreground/50 tracking-wide serif-display">
            <span className="uppercase">
              {surah.revelationType === "makkah" ? "Meccan" : "Medinan"}
            </span>
            <span className="text-primary/20">·</span>
            <span>{surah.versesCount} verses</span>
            <span className="text-primary/20">·</span>
            <button
              onClick={() => audio.play(`${surah.id}:1`, surah.id)}
              className="inline-flex items-center gap-1 text-primary/50 hover:text-primary transition-all"
              aria-label="Play surah"
            >
              <svg
                className="h-2.5 w-2.5"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
              Play
            </button>
          </div>

          {/* Arabesque floral divider */}
          <div className="mt-4">
            <ArabesqueDivider />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Navigation Chevron ─── */

function NavChevron({
  href,
  disabled,
  direction,
  small,
}: {
  href: string;
  disabled: boolean;
  direction: "prev" | "next";
  small?: boolean;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full transition-all",
        small ? "p-1" : "p-2",
        disabled
          ? "pointer-events-none opacity-0"
          : "text-muted-foreground/30 hover:text-foreground hover:bg-surface-hover",
      )}
      aria-label={direction === "prev" ? "Previous surah" : "Next surah"}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      <Icon className={cn(small ? "h-3.5 w-3.5" : "h-4 w-4")} />
    </Link>
  );
}

/* ─── Shamsa Medallion — Islamic floral rosette ─── */

function ShamsaMedallion({ number }: { number: number }) {
  // Generate 8 large petals + 8 small petals
  const petals = generatePetals(8, 42, 18, 10);
  const smallPetals = generatePetals(8, 34, 18, 6, 22.5);

  // Dots at petal tips
  const tipDots = Array.from({ length: 8 }, (_, i) => {
    const rad = (i * 45) * Math.PI / 180;
    return { cx: 50 + 46 * Math.cos(rad), cy: 50 + 46 * Math.sin(rad) };
  });

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        width="64"
        height="64"
        className="text-primary"
      >
        {/* Outer ornamental ring */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />

        {/* 8 large petals */}
        {petals.map((d, i) => (
          <path
            key={`p${i}`}
            d={d}
            fill="currentColor"
            opacity="0.18"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.4"
          />
        ))}

        {/* 8 smaller petals between the large ones */}
        {smallPetals.map((d, i) => (
          <path
            key={`sp${i}`}
            d={d}
            fill="currentColor"
            opacity="0.12"
            stroke="currentColor"
            strokeWidth="0.4"
            strokeOpacity="0.3"
          />
        ))}

        {/* Small flower buds at each large petal tip */}
        {tipDots.map((d, i) => (
          <g key={`td${i}`}>
            <circle cx={d.cx} cy={d.cy} r="2" fill="currentColor" opacity="0.25" />
            <circle cx={d.cx} cy={d.cy} r="1" fill="currentColor" opacity="0.45" />
          </g>
        ))}

        {/* Inner decorated circles */}
        <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
        <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />

        {/* 8 tiny inner petal marks (lotus ring) */}
        {Array.from({ length: 8 }, (_, i) => {
          const rad = (i * 45 + 22.5) * Math.PI / 180;
          const cx = 50 + 16 * Math.cos(rad);
          const cy = 50 + 16 * Math.sin(rad);
          return (
            <circle key={`il${i}`} cx={cx} cy={cy} r="1.2" fill="currentColor" opacity="0.2" />
          );
        })}
      </svg>
      <span className="absolute text-sm font-medium text-primary/50 tracking-wide serif-display">
        {number}
      </span>
    </div>
  );
}

/** Generate teardrop-shaped petals around center (50,50) */
function generatePetals(
  count: number,
  tipR: number,
  baseR: number,
  width: number,
  offsetDeg = 0,
): string[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i * (360 / count) + offsetDeg) * Math.PI / 180;
    const perp = a + Math.PI / 2;

    const tx = 50 + tipR * Math.cos(a);
    const ty = 50 + tipR * Math.sin(a);

    const b1x = 50 + baseR * Math.cos(a) + (width / 2) * Math.cos(perp);
    const b1y = 50 + baseR * Math.sin(a) + (width / 2) * Math.sin(perp);
    const b2x = 50 + baseR * Math.cos(a) - (width / 2) * Math.cos(perp);
    const b2y = 50 + baseR * Math.sin(a) - (width / 2) * Math.sin(perp);

    const midR = (baseR + tipR) / 2;
    const bulge = width * 0.7;
    const c1x = 50 + midR * Math.cos(a) + bulge * Math.cos(perp);
    const c1y = 50 + midR * Math.sin(a) + bulge * Math.sin(perp);
    const c2x = 50 + midR * Math.cos(a) - bulge * Math.cos(perp);
    const c2y = 50 + midR * Math.sin(a) - bulge * Math.sin(perp);

    return `M${f(b1x)},${f(b1y)} Q${f(c1x)},${f(c1y)} ${f(tx)},${f(ty)} Q${f(c2x)},${f(c2y)} ${f(b2x)},${f(b2y)} Z`;
  });
}

function f(n: number) { return n.toFixed(1); }

/* ─── Arabesque Floral Divider ─── */

function ArabesqueDivider() {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 300 30"
        className="w-64 h-7 text-primary"
        fill="none"
        stroke="currentColor"
      >
        {/* Center floral medallion — 4-petal flower */}
        <circle cx="150" cy="15" r="7" strokeWidth="0.6" opacity="0.5" />
        <ellipse cx="150" cy="6" rx="2.5" ry="5" fill="currentColor" opacity="0.22" />
        <ellipse cx="150" cy="24" rx="2.5" ry="5" fill="currentColor" opacity="0.22" />
        <ellipse cx="141" cy="15" rx="5" ry="2.5" fill="currentColor" opacity="0.22" />
        <ellipse cx="159" cy="15" rx="5" ry="2.5" fill="currentColor" opacity="0.22" />
        <circle cx="150" cy="15" r="2.5" fill="currentColor" stroke="none" opacity="0.35" />

        {/* Left vine — flowing S-curve with palmette leaves */}
        <path
          d="M132,15 C125,10 118,16 110,13 C102,10 95,16 87,14 C79,12 72,16 64,15 C56,14 48,15 38,15"
          strokeWidth="0.6"
          opacity="0.4"
        />
        {/* Left palmette leaves */}
        <path d="M118,14 C114,9 108,11 110,16 C111,19 115,18 117,15" fill="currentColor" opacity="0.18" stroke="none" />
        <path d="M95,14 C91,18 85,16 87,12 C88,9 92,10 94,13" fill="currentColor" opacity="0.15" stroke="none" />
        <path d="M72,15 C68,10 62,12 64,17 C65,20 69,19 71,16" fill="currentColor" opacity="0.12" stroke="none" />
        {/* Left flower buds */}
        <circle cx="108" cy="12" r="1.5" fill="currentColor" stroke="none" opacity="0.22" />
        <circle cx="85" cy="13" r="1.2" fill="currentColor" stroke="none" opacity="0.18" />
        <circle cx="62" cy="14" r="1" fill="currentColor" stroke="none" opacity="0.15" />
        {/* Left tendril curls */}
        <path d="M110,13 C107,8 104,10 106,13" strokeWidth="0.4" opacity="0.3" />
        <path d="M87,14 C84,18 81,16 83,13" strokeWidth="0.4" opacity="0.25" />

        {/* Right vine — mirror of left */}
        <path
          d="M168,15 C175,10 182,16 190,13 C198,10 205,16 213,14 C221,12 228,16 236,15 C244,14 252,15 262,15"
          strokeWidth="0.6"
          opacity="0.4"
        />
        {/* Right palmette leaves */}
        <path d="M182,14 C186,9 192,11 190,16 C189,19 185,18 183,15" fill="currentColor" opacity="0.18" stroke="none" />
        <path d="M205,14 C209,18 215,16 213,12 C212,9 208,10 206,13" fill="currentColor" opacity="0.15" stroke="none" />
        <path d="M228,15 C232,10 238,12 236,17 C235,20 231,19 229,16" fill="currentColor" opacity="0.12" stroke="none" />
        {/* Right flower buds */}
        <circle cx="192" cy="12" r="1.5" fill="currentColor" stroke="none" opacity="0.22" />
        <circle cx="215" cy="13" r="1.2" fill="currentColor" stroke="none" opacity="0.18" />
        <circle cx="238" cy="14" r="1" fill="currentColor" stroke="none" opacity="0.15" />
        {/* Right tendril curls */}
        <path d="M190,13 C193,8 196,10 194,13" strokeWidth="0.4" opacity="0.3" />
        <path d="M213,14 C216,18 219,16 217,13" strokeWidth="0.4" opacity="0.25" />
      </svg>
    </div>
  );
}

/* ─── Vine Border — Repeating arabesque pattern for side margins ─── */

export function VineBorder({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 w-7 pointer-events-none hidden lg:block",
        side === "left" ? "left-0" : "right-0",
      )}
    >
      <svg className="h-full w-full text-primary/[0.25]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={`vine-${side}`}
            width="28"
            height="140"
            patternUnits="userSpaceOnUse"
          >
            {/* Main vine stem — sinuous S-curve */}
            <path
              d="M14,0 C19,12 9,24 14,36 C19,48 6,58 14,70 C22,82 9,92 14,104 C19,116 9,128 14,140"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />

            {/* Left palmette leaves */}
            <path
              d="M14,18 C8,12 2,15 4,22 C5,26 10,25 13,22 Q14,20 14,18"
              fill="currentColor"
              opacity="0.6"
            />
            <path
              d="M14,88 C8,82 2,85 4,92 C5,96 10,95 13,92 Q14,90 14,88"
              fill="currentColor"
              opacity="0.5"
            />

            {/* Right palmette leaves */}
            <path
              d="M14,52 C20,46 26,49 24,56 C23,60 18,59 15,56 Q14,54 14,52"
              fill="currentColor"
              opacity="0.55"
            />
            <path
              d="M14,122 C20,116 26,119 24,126 C23,130 18,129 15,126 Q14,124 14,122"
              fill="currentColor"
              opacity="0.45"
            />

            {/* Small flower buds with petal rings */}
            <circle cx="3" cy="19" r="2.5" fill="currentColor" opacity="0.25" />
            <circle cx="3" cy="17" r="1" fill="currentColor" opacity="0.15" />
            <circle cx="1" cy="19" r="1" fill="currentColor" opacity="0.15" />
            <circle cx="5" cy="19" r="1" fill="currentColor" opacity="0.15" />
            <circle cx="3" cy="21" r="1" fill="currentColor" opacity="0.15" />

            <circle cx="25" cy="53" r="2.5" fill="currentColor" opacity="0.25" />
            <circle cx="25" cy="51" r="1" fill="currentColor" opacity="0.15" />
            <circle cx="23" cy="53" r="1" fill="currentColor" opacity="0.15" />
            <circle cx="27" cy="53" r="1" fill="currentColor" opacity="0.15" />
            <circle cx="25" cy="55" r="1" fill="currentColor" opacity="0.15" />

            <circle cx="3" cy="89" r="2" fill="currentColor" opacity="0.2" />
            <circle cx="25" cy="123" r="2" fill="currentColor" opacity="0.2" />

            {/* Tendril curls */}
            <path d="M4,22 C1,27 -1,24 2,21" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M24,56 C27,61 29,58 26,55" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M4,92 C1,97 -1,94 2,91" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M24,126 C27,131 29,128 26,125" fill="none" stroke="currentColor" strokeWidth="0.5" />

            {/* Small leaf buds along stem */}
            <path d="M14,5 C11,3 9,5 11,8 C12,9 13,8 14,6" fill="currentColor" opacity="0.3" />
            <path d="M14,36 C17,34 19,36 17,39 C16,40 15,39 14,37" fill="currentColor" opacity="0.3" />
            <path d="M14,70 C11,68 9,70 11,73 C12,74 13,73 14,71" fill="currentColor" opacity="0.3" />
            <path d="M14,104 C17,102 19,104 17,107 C16,108 15,107 14,105" fill="currentColor" opacity="0.3" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#vine-${side})`}
          transform={side === "right" ? "scale(-1,1) translate(-28,0)" : undefined}
        />
      </svg>
    </div>
  );
}
