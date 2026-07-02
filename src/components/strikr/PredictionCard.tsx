"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { Prediction } from "@/lib/predictions";
import { GlassCard } from "./GlassCard";
import { Clock, Heart, MessageCircle, ExternalLink, Flame } from "lucide-react";

interface PredictionCardProps {
  prediction: Prediction;
  onClick?: () => void;
  index?: number;
  compact?: boolean;
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ч назад`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} д назад`;
  return d.toLocaleDateString("ru", { day: "2-digit", month: "short" });
}

function getConfidenceColor(c: number): string {
  if (c >= 8) return "var(--strikr-green)";
  if (c >= 6) return "var(--strikr-brand)";
  if (c >= 4) return "var(--strikr-gold)";
  return "var(--strikr-orange)";
}

function getStatusBadge(status: Prediction["status"]): { label: string; class: string } | null {
  switch (status) {
    case "won":
      return { label: "ВЫИГРЫШ", class: "badge-soon" };
    case "lost":
      return { label: "ПРОИГРЫШ", class: "badge-finished" };
    case "void":
      return { label: "ВОЗВРАТ", class: "badge-finished" };
    default:
      return null;
  }
}

export const PredictionCard = memo(function PredictionCard({
  prediction: p,
  onClick,
  index = 0,
  compact = false,
}: PredictionCardProps) {
  const statusBadge = getStatusBadge(p.status);
  const isHot = p.confidence >= 8 && p.likes && p.likes > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.2) }}
      exit={{ opacity: 0 }}
    >
      <GlassCard onClick={onClick} glow className="p-4">
        {/* Capper row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--strikr-brand), var(--strikr-purple))",
              }}
            >
              {p.capper.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-foreground truncate">
                  {p.capper.name}
                </span>
                {p.capper.verified && (
                  <svg className="w-3 h-3 text-[var(--strikr-brand)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L9.5 4.5L6 4L4 7L1 8.5L2 12L1 15.5L4 17L6 20L9.5 19.5L12 22L14.5 19.5L18 20L20 17L23 15.5L22 12L23 8.5L20 7L18 4L14.5 4.5L12 2Z" />
                    <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="text-[10px] text-foreground/45 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {formatRelativeTime(p.publishedAt)}
                {p.capper.bookmaker && (
                  <>
                    <span>·</span>
                    <span>{p.capper.bookmaker}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {isHot && (
            <span className="badge-hot text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
              <Flame className="w-2.5 h-2.5" /> Hot
            </span>
          )}
          {statusBadge && (
            <span className={`${statusBadge.class} text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0`}>
              {statusBadge.label}
            </span>
          )}
        </div>

        {/* Match info */}
        <div className="surface-2 rounded-lg p-2.5 mb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold text-sm text-foreground truncate">
              {p.matchTitle}
            </div>
            <div className="text-[10px] text-foreground/45 font-medium flex-shrink-0">
              {new Date(p.kickoff).toLocaleString("ru", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Bet + odds */}
        <div className="flex items-stretch gap-2 mb-3">
          <div className="flex-1 surface-2 rounded-lg p-2.5">
            <div className="text-[9px] uppercase tracking-wider text-foreground/45 font-bold mb-0.5">
              Ставка
            </div>
            <div className="text-sm font-black text-foreground leading-tight">
              {p.betLabel}
            </div>
          </div>
          <div className="surface-2 rounded-lg p-2.5 text-center min-w-[70px]">
            <div className="text-[9px] uppercase tracking-wider text-foreground/45 font-bold mb-0.5">
              Коэф
            </div>
            <div className="text-lg font-black text-[var(--strikr-brand)] tabular">
              {p.odds > 0 ? p.odds.toFixed(2) : "—"}
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-foreground/55 font-bold">
              Уверенность
            </span>
            <span
              className="text-xs font-black tabular"
              style={{ color: getConfidenceColor(p.confidence) }}
            >
              {p.confidence}/10
            </span>
          </div>
          <div className="confidence-bar" style={{ height: 5 }}>
            <div
              className="confidence-fill"
              style={{
                width: `${(p.confidence / 10) * 100}%`,
                background: `linear-gradient(90deg, var(--strikr-brand), ${getConfidenceColor(p.confidence)})`,
              }}
            />
          </div>
        </div>

        {/* Argumentation */}
        {!compact && p.argumentation && (
          <div className="mb-3">
            <div className="text-[9px] uppercase tracking-wider text-foreground/45 font-bold mb-1">
              Аргументация
            </div>
            <p className="text-[12px] text-foreground/70 leading-relaxed line-clamp-3">
              {p.argumentation}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-foreground/55">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold tabular">{p.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-foreground/55">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold tabular">{p.comments || 0}</span>
            </div>
          </div>
          {p.sourceUrl && (
            <a
              href={p.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-foreground/45 hover:text-[var(--strikr-brand)] font-bold transition-colors"
            >
              {p.source}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
});
