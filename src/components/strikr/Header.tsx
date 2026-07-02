"use client";

import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  liveCount: number;
}

/**
 * Sticky header with lightweight blur (TG-optimized).
 */
export function Header({ liveCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 safe-top">
      <div className="surface-glass border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between max-w-3xl mx-auto">
          <Logo size={34} />
          <div className="flex items-center gap-2">
            <div className="surface-2 px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--strikr-red)] live-pulse" />
              <span className="text-[11px] font-bold text-foreground/85 tabular">
                {liveCount} LIVE
              </span>
            </div>
            <ThemeToggle />
            <button
              className="w-9 h-9 rounded-full surface-2 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Profile"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
