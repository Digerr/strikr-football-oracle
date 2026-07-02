"use client";

import { Home, Trophy, Users, Layers } from "lucide-react";

export type TabId = "feed" | "matches" | "cappers" | "expresses";

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "feed", label: "Лента", icon: Home },
  { id: "matches", label: "Матчи", icon: Trophy },
  { id: "cappers", label: "Капперы", icon: Users },
  { id: "expresses", label: "Экспрессы", icon: Layers },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 z-40 safe-bottom">
      <div className="surface-glass border-t border-border">
        <div className="max-w-3xl mx-auto grid grid-cols-4 px-2 py-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors"
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-[var(--surface-3)]" />
                )}
                <div
                  className={`relative z-[1] transition-colors ${
                    isActive ? "text-[var(--strikr-brand)]" : "text-foreground/45"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`relative z-[1] text-[10px] font-bold transition-colors ${
                    isActive ? "text-foreground" : "text-foreground/45"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute -top-0.5 w-1 h-1 rounded-full bg-[var(--strikr-brand)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
