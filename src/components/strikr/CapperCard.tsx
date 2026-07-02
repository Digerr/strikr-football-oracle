"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { Capper } from "@/lib/predictions";
import { GlassCard } from "./GlassCard";
import { TrendingUp, Target, Flame, BarChart3, Trophy } from "lucide-react";

interface CapperCardProps {
  capper: Capper;
  onClick?: () => void;
  index?: number;
  rank?: number;
}

export const CapperCard = memo(function CapperCard({
  capper: c,
  onClick,
  index = 0,
  rank,
}: CapperCardProps) {
  const isPositiveRoi = (c.roi || 0) > 0;
  const isPositiveProfit = (c.profit30d || 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.2) }}
      exit={{ opacity: 0 }}
    >
      <GlassCard onClick={onClick} glow className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white"
              style={{
                background: "linear-gradient(135deg, var(--strikr-brand), var(--strikr-purple))",
              }}
            >
              {c.name.charAt(0).toUpperCase()}
            </div>
            {rank && rank <= 3 && (
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--surface-1)] flex items-center justify-center text-[9px] font-black"
                style={{
                  background:
                    rank === 1
                      ? "linear-gradient(135deg, var(--strikr-gold), var(--strikr-orange))"
                      : rank === 2
                        ? "linear-gradient(135deg, #94a3b8, #64748b)"
                        : "linear-gradient(135deg, #cd7f32, #a0522d)",
                  color: "#fff",
                }}
              >
                {rank}
              </div>
            )}
            {c.verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--strikr-brand)] flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L9.5 4.5L6 4L4 7L1 8.5L2 12L1 15.5L4 17L6 20L9.5 19.5L12 22L14.5 19.5L18 20L20 17L23 15.5L22 12L23 8.5L20 7L18 4L14.5 4.5L12 2Z" />
                  <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-bold text-sm text-foreground truncate">{c.name}</h3>
              {c.bookmaker && (
                <span className="text-[9px] font-bold text-foreground/45 bg-[var(--surface-3)] px-1.5 py-0.5 rounded">
                  {c.bookmaker}
                </span>
              )}
            </div>
            <div className="text-[10px] text-foreground/45 mb-2">
              {c.totalPredictions || 0} прогнозов · {c.source}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-1.5">
              <div className="surface-2 rounded-lg p-1.5 text-center">
                <TrendingUp
                  className={`w-3 h-3 mx-auto mb-0.5 ${isPositiveRoi ? "text-[var(--strikr-green)]" : "text-[var(--strikr-red)]"}`}
                />
                <div
                  className={`text-xs font-black tabular ${isPositiveRoi ? "text-[var(--strikr-green)]" : "text-[var(--strikr-red)]"}`}
                >
                  {isPositiveRoi ? "+" : ""}{c.roi || 0}%
                </div>
                <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-bold">
                  ROI
                </div>
              </div>
              <div className="surface-2 rounded-lg p-1.5 text-center">
                <Target className="w-3 h-3 text-[var(--strikr-brand)] mx-auto mb-0.5" />
                <div className="text-xs font-black text-foreground tabular">
                  {c.accuracy || 0}%
                </div>
                <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-bold">
                  Точн
                </div>
              </div>
              <div className="surface-2 rounded-lg p-1.5 text-center">
                <Flame className="w-3 h-3 text-[var(--strikr-orange)] mx-auto mb-0.5" />
                <div className="text-xs font-black text-foreground tabular">
                  {c.streak || 0}
                </div>
                <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-bold">
                  Серия
                </div>
              </div>
              <div className="surface-2 rounded-lg p-1.5 text-center">
                <BarChart3
                  className={`w-3 h-3 mx-auto mb-0.5 ${isPositiveProfit ? "text-[var(--strikr-green)]" : "text-foreground/55"}`}
                />
                <div
                  className={`text-xs font-black tabular ${isPositiveProfit ? "text-[var(--strikr-green)]" : "text-foreground/70"}`}
                >
                  {isPositiveProfit ? "+" : ""}{c.profit30d || 0}
                </div>
                <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-bold">
                  Приб
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top stat banner */}
        {c.totalPredictions && c.totalPredictions > 0 && (
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border text-[10px]">
            <div className="flex items-center gap-1 text-foreground/55">
              <Trophy className="w-3 h-3" />
              <span className="font-bold">{c.totalPredictions} прогнозов</span>
            </div>
            <div className="text-foreground/45 font-bold uppercase tracking-wider">
              {c.source}
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
});
