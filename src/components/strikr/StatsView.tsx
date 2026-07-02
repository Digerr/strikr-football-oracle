"use client";

import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { ConfidenceBar } from "./ConfidenceBar";
import { getUserProfile, getLeaderboard, type Match } from "@/lib/football-data";
import { Flame, Trophy, Target, TrendingUp, Crown, Star } from "lucide-react";

interface StatsViewProps {
  topPredictions: Match[];
  onMatchClick: (m: Match) => void;
}

export function StatsView({ topPredictions, onMatchClick }: StatsViewProps) {
  const profile = getUserProfile();
  const leaderboard = getLeaderboard();
  const xpPct = (profile.xp / profile.xpToNext) * 100;

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard glow className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                style={{
                  background: "linear-gradient(135deg, var(--strikr-brand), var(--strikr-purple))",
                }}
              >
                Я
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[var(--surface-1)] flex items-center justify-center text-[10px] font-black text-[#1a0f00]"
                style={{ background: "var(--strikr-gold)" }}
              >
                {profile.level}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-foreground">Каппер</h2>
                <span className="badge-violet text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Lvl {profile.level}
                </span>
              </div>
              <div className="text-[11px] text-foreground/45 font-medium mb-2">
                Ранг #{profile.rank} из {profile.totalUsers.toLocaleString("ru")}
              </div>
              <ConfidenceBar
                value={xpPct}
                label={`XP ${profile.xp} / ${profile.xpToNext}`}
                color="violet"
                height={6}
                showValue={false}
              />
            </div>
          </div>

          {/* KPI grid */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="surface-2 rounded-xl p-2.5 text-center">
              <Target className="w-3.5 h-3.5 text-[var(--strikr-green)] mx-auto mb-1" />
              <div className="text-base font-black text-foreground tabular">
                {profile.accuracy}%
              </div>
              <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-bold">
                Точность
              </div>
            </div>
            <div className="surface-2 rounded-xl p-2.5 text-center">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--strikr-brand)] mx-auto mb-1" />
              <div className="text-base font-black text-foreground tabular">
                {profile.correctPredictions}
              </div>
              <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-bold">
                Верно
              </div>
            </div>
            <div className="surface-2 rounded-xl p-2.5 text-center">
              <Flame className="w-3.5 h-3.5 text-[var(--strikr-orange)] mx-auto mb-1" />
              <div className="text-base font-black text-foreground tabular">
                {profile.streak}
              </div>
              <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-bold">
                Серия
              </div>
            </div>
            <div className="surface-2 rounded-xl p-2.5 text-center">
              <Trophy className="w-3.5 h-3.5 text-[var(--strikr-gold)] mx-auto mb-1" />
              <div className="text-base font-black text-foreground tabular">
                {profile.totalPredictions}
              </div>
              <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-bold">
                Всего
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-[var(--strikr-gold)]" fill="var(--strikr-gold)" />
            <h3 className="text-sm font-bold text-foreground">Достижения</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {profile.achievements.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl p-3 text-center transition-all ${
                  a.unlocked
                    ? "surface-card hover-lift cursor-pointer"
                    : "bg-[var(--surface-2)] opacity-40"
                }`}
              >
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-[9px] font-bold text-foreground/80 leading-tight">
                  {a.title}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-[var(--strikr-gold)]" fill="var(--strikr-gold)" />
            <h3 className="text-sm font-bold text-foreground">Топ капперов</h3>
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  entry.isCurrentUser
                    ? "border border-[var(--strikr-brand)]/30"
                    : "surface-2 hover:bg-[var(--surface-3)]"
                }`}
                style={
                  entry.isCurrentUser
                    ? {
                        background:
                          "linear-gradient(to right, rgba(1,97,218,0.10), rgba(94,54,202,0.10))",
                      }
                    : undefined
                }
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black ${
                    entry.rank === 1
                      ? "text-[#1a0f00]"
                      : entry.rank === 2
                        ? "text-white"
                        : entry.rank === 3
                          ? "text-white"
                          : "bg-[var(--surface-3)] text-foreground/65"
                  }`}
                  style={
                    entry.rank <= 3
                      ? {
                          background:
                            entry.rank === 1
                              ? "linear-gradient(135deg, var(--strikr-gold), var(--strikr-orange))"
                              : entry.rank === 2
                                ? "linear-gradient(135deg, #94a3b8, #64748b)"
                                : "linear-gradient(135deg, #cd7f32, #a0522d)",
                        }
                      : undefined
                  }
                >
                  {entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="text-[8px] font-black uppercase text-[var(--strikr-brand)]">
                        (ты)
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-foreground/45">
                    Серия {entry.streak} · XP {entry.xp.toLocaleString("ru")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-[var(--strikr-green)] tabular">
                    {entry.accuracy}%
                  </div>
                  <div className="text-[9px] text-foreground/40 uppercase tracking-wider">
                    точность
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
