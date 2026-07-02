"use client";

import { GlassCard } from "./GlassCard";
import { ConfidenceBar } from "./ConfidenceBar";
import type { Match } from "@/lib/football-data";
import { motion } from "framer-motion";
import { Clock, MapPin, Flame, TrendingUp } from "lucide-react";

interface MatchCardProps {
  match: Match;
  onClick: () => void;
  index?: number;
}

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  if (isToday) return `Сегодня ${hh}:${mm}`;
  if (isTomorrow) return `Завтра ${hh}:${mm}`;
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")} ${hh}:${mm}`;
}

function FormBadges({ form }: { form: ("W" | "D" | "L")[] }) {
  return (
    <div className="flex gap-1">
      {form.slice(0, 5).map((r, i) => (
        <span
          key={i}
          className={`w-3.5 h-3.5 rounded-[3px] text-[8px] font-black flex items-center justify-center ${
            r === "W"
              ? "bg-[#00ff88] text-[#06121a]"
              : r === "D"
                ? "bg-white/15 text-white/70"
                : "bg-[#ff3366] text-white"
          }`}
        >
          {r === "W" ? "В" : r === "D" ? "Н" : "П"}
        </span>
      ))}
    </div>
  );
}

export function MatchCard({ match, onClick, index = 0 }: MatchCardProps) {
  const p = match.prediction;
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const isUpcoming = match.status === "UPCOMING";
  const isHot = match.importance >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      exit={{ opacity: 0, scale: 0.96 }}
    >
      <GlassCard
        tilt
        glow
        onClick={onClick}
        className="p-4"
      >
        {/* Top row: league + status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{
                background: `linear-gradient(135deg, ${match.leagueColor}, ${match.leagueColor}99)`,
              }}
            >
              {match.leagueShort}
            </span>
            <span className="text-[10px] text-white/40 font-medium">
              {match.country}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {isHot && (
              <span className="badge-hot text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" /> Hot
              </span>
            )}
            {isLive && (
              <span className="badge-live text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-white live-pulse" />
                {match.minute}&apos;
              </span>
            )}
            {isUpcoming && (
              <span className="text-[10px] text-white/55 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatKickoff(match.kickoff)}
              </span>
            )}
            {isFinished && (
              <span className="badge-finished text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full">
                FT
              </span>
            )}
          </div>
        </div>

        {/* Teams row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{
                  background: `linear-gradient(135deg, ${match.homeTeam.color}33, ${match.homeTeam.color}11)`,
                  border: `1px solid ${match.homeTeam.color}55`,
                }}
              >
                {match.homeTeam.crest}
              </span>
              <span className="font-bold text-sm text-white truncate">
                {match.homeTeam.name}
              </span>
            </div>
            <FormBadges form={match.homeTeam.form} />
          </div>

          <div className="flex flex-col items-center px-2">
            {isUpcoming ? (
              <>
                <div className="text-2xl font-black gradient-text-static tabular">
                  VS
                </div>
                <div className="text-[9px] text-white/40 mt-0.5">
                  {new Date(match.kickoff).toLocaleTimeString("ru", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </>
            ) : (
              <div className="text-2xl font-black text-white tabular flex items-baseline gap-1.5">
                <span>{match.score?.home}</span>
                <span className="text-white/30 text-base">:</span>
                <span>{match.score?.away}</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <span className="font-bold text-sm text-white truncate">
                {match.awayTeam.name}
              </span>
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{
                  background: `linear-gradient(135deg, ${match.awayTeam.color}33, ${match.awayTeam.color}11)`,
                  border: `1px solid ${match.awayTeam.color}55`,
                }}
              >
                {match.awayTeam.crest}
              </span>
            </div>
            <div className="flex justify-end">
              <FormBadges form={match.awayTeam.form} />
            </div>
          </div>
        </div>

        {/* AI pick highlight */}
        <div className="mt-3 glass rounded-xl p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#6366f1] flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-wider text-white/45 font-bold">
                AI прогноз
              </div>
              <div className="text-[11px] font-bold text-white truncate">
                {p.pick}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[9px] uppercase tracking-wider text-white/45 font-bold">
              Увер.
            </div>
            <div className="text-base font-black text-[#00ff88] tabular">
              {p.confidence}%
            </div>
          </div>
        </div>

        {/* Probability bars */}
        {!isFinished && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div>
              <div className="text-[9px] text-white/50 mb-1 font-semibold">
                П1
              </div>
              <ConfidenceBar
                value={p.homeWinProb}
                color="green"
                showValue={false}
                height={5}
                animate={false}
              />
              <div className="text-[10px] font-bold text-white/80 mt-1 tabular">
                {p.homeWinProb}%
              </div>
            </div>
            <div>
              <div className="text-[9px] text-white/50 mb-1 font-semibold">
                X
              </div>
              <ConfidenceBar
                value={p.drawProb}
                color="orange"
                showValue={false}
                height={5}
                animate={false}
              />
              <div className="text-[10px] font-bold text-white/80 mt-1 tabular">
                {p.drawProb}%
              </div>
            </div>
            <div>
              <div className="text-[9px] text-white/50 mb-1 font-semibold">
                П2
              </div>
              <ConfidenceBar
                value={p.awayWinProb}
                color="violet"
                showValue={false}
                height={5}
                animate={false}
              />
              <div className="text-[10px] font-bold text-white/80 mt-1 tabular">
                {p.awayWinProb}%
              </div>
            </div>
          </div>
        )}

        {/* Venue */}
        <div className="mt-3 flex items-center gap-1 text-[10px] text-white/35">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{match.venue}</span>
          {match.weather && (
            <>
              <span className="mx-1">•</span>
              <span>{match.weather}</span>
              {match.temperature !== undefined && (
                <span>· {match.temperature}°</span>
              )}
            </>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
