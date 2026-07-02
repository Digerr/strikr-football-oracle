"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Match } from "@/lib/football-data";
import { GlassCard } from "./GlassCard";
import { ConfidenceBar } from "./ConfidenceBar";
import { ShimmerButton } from "./ShimmerButton";
import { TeamCrest } from "./TeamCrest";
import {
  X,
  MapPin,
  Clock,
  Flame,
  TrendingUp,
  Target,
  Activity,
  Trophy,
  Cloud,
} from "lucide-react";

interface MatchDetailModalProps {
  match: Match | null;
  onClose: () => void;
}

function StatRow({
  label,
  home,
  away,
  type = "bar",
  suffix = "",
}: {
  label: string;
  home: number;
  away: number;
  type?: "bar" | "number";
  suffix?: string;
}) {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  const awayPct = (away / total) * 100;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold text-white tabular">
          {home}
          {suffix}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">
          {label}
        </span>
        <span className="text-sm font-bold text-white tabular">
          {away}
          {suffix}
        </span>
      </div>
      {type === "bar" && (
        <div className="flex items-center gap-1 h-1.5">
          <div className="flex-1 h-full bg-white/5 rounded-l-full overflow-hidden flex justify-end">
            <div
              className="h-full bg-gradient-to-l from-[#00ff88] to-[#10b981] transition-all duration-700"
              style={{ width: `${homePct}%` }}
            />
          </div>
          <div className="flex-1 h-full bg-white/5 rounded-r-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#a855f7] to-[#6366f1] transition-all duration-700"
              style={{ width: `${awayPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function MatchDetailModal({ match, onClose }: MatchDetailModalProps) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0.5, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto no-scrollbar safe-bottom"
          >
            <GlassCard className="p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl" tilt={false}>
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full glass flex items-center justify-center text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* League + status */}
              <div className="flex items-center gap-2 mb-4 pr-12">
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                  style={{
                    background: `linear-gradient(135deg, ${match.leagueColor}, ${match.leagueColor}99)`,
                  }}
                >
                  {match.league}
                </span>
                {match.importance >= 5 && (
                  <span className="badge-hot text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5" /> Hot
                  </span>
                )}
                {match.status === "LIVE" && (
                  <span className="badge-live text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-white live-pulse" />
                    {match.minute}&apos;
                  </span>
                )}
                {match.status === "FINISHED" && (
                  <span className="badge-finished text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full">
                    Завершён
                  </span>
                )}
              </div>

              {/* Teams & score */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex-1 text-center">
                  <div className="flex justify-center mb-2">
                    <TeamCrest
                      crest={match.homeTeam.crest}
                      color={match.homeTeam.color}
                      size={64}
                      rounded="rounded-2xl"
                    />
                  </div>
                  <div className="font-bold text-sm text-white">
                    {match.homeTeam.name}
                  </div>
                  <div className="flex gap-1 justify-center mt-1.5">
                    {match.homeTeam.form.slice(0, 5).map((r, i) => (
                      <span
                        key={i}
                        className={`w-3 h-3 rounded-[3px] text-[8px] font-black flex items-center justify-center ${
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
                </div>

                <div className="text-center px-2">
                  {match.status === "UPCOMING" ? (
                    <>
                      <div className="text-4xl font-black gradient-text-static tabular">
                        VS
                      </div>
                      <div className="text-[10px] text-white/45 mt-1">
                        {new Date(match.kickoff).toLocaleString("ru", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-5xl font-black text-white tabular flex items-baseline gap-2">
                      <span>{match.score?.home}</span>
                      <span className="text-white/30 text-2xl">:</span>
                      <span>{match.score?.away}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center">
                  <div className="flex justify-center mb-2">
                    <TeamCrest
                      crest={match.awayTeam.crest}
                      color={match.awayTeam.color}
                      size={64}
                      rounded="rounded-2xl"
                    />
                  </div>
                  <div className="font-bold text-sm text-white">
                    {match.awayTeam.name}
                  </div>
                  <div className="flex gap-1 justify-center mt-1.5">
                    {match.awayTeam.form.slice(0, 5).map((r, i) => (
                      <span
                        key={i}
                        className={`w-3 h-3 rounded-[3px] text-[8px] font-black flex items-center justify-center ${
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
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="glass rounded-xl p-2.5 text-center">
                  <MapPin className="w-3.5 h-3.5 text-[#00ff88] mx-auto mb-1" />
                  <div className="text-[10px] text-white/45 font-semibold uppercase tracking-wider">
                    Стадион
                  </div>
                  <div className="text-[10px] text-white/80 font-medium truncate">
                    {match.venue.split(",")[0]}
                  </div>
                </div>
                <div className="glass rounded-xl p-2.5 text-center">
                  <Clock className="w-3.5 h-3.5 text-[#22d3ee] mx-auto mb-1" />
                  <div className="text-[10px] text-white/45 font-semibold uppercase tracking-wider">
                    Начало
                  </div>
                  <div className="text-[10px] text-white/80 font-medium">
                    {new Date(match.kickoff).toLocaleTimeString("ru", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="glass rounded-xl p-2.5 text-center">
                  <Cloud className="w-3.5 h-3.5 text-[#a855f7] mx-auto mb-1" />
                  <div className="text-[10px] text-white/45 font-semibold uppercase tracking-wider">
                    Погода
                  </div>
                  <div className="text-[10px] text-white/80 font-medium">
                    {match.weather} {match.temperature}°
                  </div>
                </div>
              </div>

              {/* AI Prediction block */}
              <div className="glass-card rounded-2xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#6366f1] flex items-center justify-center pulse-glow">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold">
                      AI Прогноз
                    </div>
                    <div className="text-sm font-black gradient-text-static">
                      {match.prediction.pick}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-[9px] uppercase tracking-wider text-white/45 font-bold">
                      Уверенность
                    </div>
                    <div className="text-2xl font-black text-[#00ff88] tabular">
                      {match.prediction.confidence}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="glass rounded-lg p-2 text-center">
                    <div className="text-[9px] text-white/45 font-bold uppercase tracking-wider mb-1">
                      П1
                    </div>
                    <div className="text-base font-black text-[#00ff88] tabular">
                      {match.prediction.homeWinProb}%
                    </div>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <div className="text-[9px] text-white/45 font-bold uppercase tracking-wider mb-1">
                      Ничья
                    </div>
                    <div className="text-base font-black text-[#ff6b35] tabular">
                      {match.prediction.drawProb}%
                    </div>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <div className="text-[9px] text-white/45 font-bold uppercase tracking-wider mb-1">
                      П2
                    </div>
                    <div className="text-base font-black text-[#a855f7] tabular">
                      {match.prediction.awayWinProb}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <ConfidenceBar
                    value={match.prediction.over25Prob}
                    label="ТБ 2.5 гола"
                    color="orange"
                    height={6}
                  />
                  <ConfidenceBar
                    value={match.prediction.bttsProb}
                    label="Обе забьют"
                    color="cyan"
                    height={6}
                  />
                </div>

                <div className="mt-3 text-[11px] text-white/55">
                  <span className="font-bold text-white/80">Ожидаемый счёт: </span>
                  <span className="tabular text-[#00ff88] font-bold">
                    {match.prediction.expectedScore.home} : {match.prediction.expectedScore.away}
                  </span>
                  <span className="mx-1">·</span>
                  <span className="font-bold text-white/80">xG: </span>
                  <span className="tabular text-[#22d3ee] font-bold">
                    {match.prediction.expectedGoals.toFixed(1)}
                  </span>
                </div>

                {match.prediction.insights.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {match.prediction.insights.map((ins, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 text-[11px] text-white/65"
                      >
                        <span className="text-[#00ff88] mt-0.5">▸</span>
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live stats */}
              {match.stats && (
                <div className="glass-card rounded-2xl p-4 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-[#22d3ee]" />
                    <h3 className="text-sm font-bold text-white">
                      Статистика матча
                    </h3>
                  </div>
                  <StatRow
                    label="Владение %"
                    home={match.stats.possession[0]}
                    away={match.stats.possession[1]}
                    type="number"
                    suffix="%"
                  />
                  <StatRow
                    label="Удары"
                    home={match.stats.shots[0]}
                    away={match.stats.shots[1]}
                  />
                  <StatRow
                    label="В створ"
                    home={match.stats.shotsOnTarget[0]}
                    away={match.stats.shotsOnTarget[1]}
                  />
                  <StatRow
                    label="xG"
                    home={match.stats.xG[0]}
                    away={match.stats.xG[1]}
                    type="number"
                  />
                  <StatRow
                    label="Угловые"
                    home={match.stats.corners[0]}
                    away={match.stats.corners[1]}
                  />
                  <StatRow
                    label="Фолы"
                    home={match.stats.fouls[0]}
                    away={match.stats.fouls[1]}
                  />
                  <StatRow
                    label="Жёлтые"
                    home={match.stats.yellowCards[0]}
                    away={match.stats.yellowCards[1]}
                  />
                </div>
              )}

              {/* H2H */}
              <div className="glass-card rounded-2xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-[#ffb800]" />
                  <h3 className="text-sm font-bold text-white">
                    Личные встречи (H2H)
                  </h3>
                </div>
                <div className="space-y-2">
                  {match.h2h.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between glass rounded-lg p-2.5"
                    >
                      <div className="flex-1">
                        <div className="text-[10px] text-white/45">
                          {h.competition}
                        </div>
                        <div className="text-[11px] text-white/65">
                          {new Date(h.date).toLocaleDateString("ru", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="text-lg font-black text-white tabular">
                        {h.score}
                      </div>
                      <div className="flex-1 text-right">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            h.result === "HOME"
                              ? "bg-[#00ff88]/20 text-[#00ff88]"
                              : h.result === "AWAY"
                                ? "bg-[#a855f7]/20 text-[#a855f7]"
                                : "bg-white/15 text-white/60"
                          }`}
                        >
                          {h.result === "HOME"
                            ? "П1"
                            : h.result === "AWAY"
                              ? "П2"
                              : "X"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <ShimmerButton variant="primary" className="flex-1">
                  <Target className="w-4 h-4" />
                  Принять прогноз
                </ShimmerButton>
                <ShimmerButton variant="ghost" className="flex-1">
                  Поделиться
                </ShimmerButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
