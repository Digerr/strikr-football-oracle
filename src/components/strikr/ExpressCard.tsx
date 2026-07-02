"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { Express } from "@/lib/predictions";
import { GlassCard } from "./GlassCard";
import { Layers, ExternalLink, TrendingUp } from "lucide-react";

interface ExpressCardProps {
  express: Express;
  onClick?: () => void;
  index?: number;
}

export const ExpressCard = memo(function ExpressCard({
  express: e,
  onClick,
  index = 0,
}: ExpressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.2) }}
      exit={{ opacity: 0 }}
    >
      <GlassCard onClick={onClick} glow className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--strikr-orange), var(--strikr-gold))",
              }}
            >
              <Layers className="w-4 h-4 text-[#1a0f00]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-foreground truncate">
                {e.capper.name}
              </div>
              <div className="text-[10px] text-foreground/45">
                Экспресс · {e.legs.length} исхода
              </div>
            </div>
          </div>
          <div className="surface-2 rounded-lg px-3 py-1.5 text-center flex-shrink-0">
            <div className="text-[9px] uppercase tracking-wider text-foreground/45 font-bold">
              Коэф
            </div>
            <div className="text-lg font-black text-[var(--strikr-orange)] tabular">
              {e.totalOdds.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Legs */}
        <div className="space-y-1.5 mb-3">
          {e.legs.map((leg, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 surface-2 rounded-lg p-2"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-foreground/55 font-medium truncate">
                  {leg.matchTitle}
                </div>
                <div className="text-xs font-bold text-foreground truncate">
                  {leg.betLabel}
                </div>
              </div>
              <div className="text-xs font-black text-[var(--strikr-brand)] tabular flex-shrink-0">
                {leg.odds.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-[10px]">
          <div className="flex items-center gap-1 text-foreground/55">
            <TrendingUp className="w-3 h-3" />
            <span className="font-bold">
              Возможный выигрыш: x{e.totalOdds.toFixed(1)}
            </span>
          </div>
          {e.sourceUrl && (
            <a
              href={e.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-foreground/45 hover:text-[var(--strikr-brand)] font-bold transition-colors"
            >
              {e.source}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
});
