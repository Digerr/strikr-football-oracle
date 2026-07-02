"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { Match } from "@/lib/predictions";
import { GlassCard } from "./GlassCard";
import { ChevronRight, Users } from "lucide-react";

interface MatchRowProps {
  match: Match;
  onClick?: () => void;
  index?: number;
}

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  if (isToday) return `Сегодня ${hh}:${mm}`;
  if (isTomorrow) return `Завтра ${hh}:${mm}`;
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")} ${hh}:${mm}`;
}

export const MatchRow = memo(function MatchRow({
  match: m,
  onClick,
  index = 0,
}: MatchRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.2) }}
      exit={{ opacity: 0 }}
    >
      <GlassCard onClick={onClick} glow className="p-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* League badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{
                background: `linear-gradient(135deg, ${m.leagueColor || "var(--strikr-brand)"}, ${m.leagueColor || "var(--strikr-brand)"}cc)`,
              }}
            >
              {m.leagueShort}
            </span>
          </div>

          {/* Match info */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-foreground truncate">
              {m.homeTeam} <span className="text-foreground/40">—</span> {m.awayTeam}
            </div>
            <div className="text-[10px] text-foreground/45 font-medium">
              {formatKickoff(m.kickoff)}
            </div>
          </div>

          {/* Predictions count */}
          <div className="flex items-center gap-1.5 surface-2 px-2.5 py-1 rounded-lg flex-shrink-0">
            <Users className="w-3 h-3 text-[var(--strikr-brand)]" />
            <span className="text-xs font-black text-foreground tabular">
              {m.predictionsCount}
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-foreground/35 flex-shrink-0" />
        </div>
      </GlassCard>
    </motion.div>
  );
});
