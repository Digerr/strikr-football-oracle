"use client";

import { motion } from "framer-motion";
import { Home, Trophy, Sparkles, BarChart3 } from "lucide-react";

export type TabId = "home" | "matches" | "predictions" | "stats";

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Главная", icon: Home },
  { id: "matches", label: "Матчи", icon: Trophy },
  { id: "predictions", label: "Прогнозы", icon: Sparkles },
  { id: "stats", label: "Рейтинг", icon: BarChart3 },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 z-40 safe-bottom">
      <div className="glass-strong border-t border-white/10">
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
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#00ff88]/15 to-[#a855f7]/15 border border-[#00ff88]/30"
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                  />
                )}
                <div
                  className={`relative z-[1] transition-colors ${
                    isActive ? "text-[#00ff88]" : "text-white/45"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`relative z-[1] text-[10px] font-bold transition-colors ${
                    isActive ? "text-white" : "text-white/45"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="activeDot"
                    className="absolute -top-0.5 w-1 h-1 rounded-full bg-[#00ff88] pulse-glow"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
