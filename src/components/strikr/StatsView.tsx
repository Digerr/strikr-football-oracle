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
        <GlassCard tilt glow className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ff88] via-[#22d3ee] to-[#a855f7] flex items-center justify-center text-2xl font-black text-[#06121a]">
                Я
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#ffb800] border-2 border-[#0a0f1a] flex items-center justify-center text-[10px] font-black text-[#1a0f00]">
                {profile.level}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Каппер</h2>
                <span className="badge-violet text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Lvl {profile.level}
                </span>
              </div>
              <div className="text-[11px] text-white/45 font-medium mb-2">
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
            <div className="glass rounded-xl p-2.5 text-center">
              <Target className="w-3.5 h-3.5 text-[#00ff88] mx-auto mb-1" />
              <div className="text-base font-black text-white tabular">
                {profile.accuracy}%
              </div>
              <div className="text-[8px] uppercase tracking-wider text-white/45 font-bold">
                Точность
              </div>
            </div>
            <div className="glass rounded-xl p-2.5 text-center">
              <TrendingUp className="w-3.5 h-3.5 text-[#22d3ee] mx-auto mb-1" />
              <div className="text-base font-black text-white tabular">
                {profile.correctPredictions}
              </div>
              <div className="text-[8px] uppercase tracking-wider text-white/45 font-bold">
                Верно
              </div>
            </div>
            <div className="glass rounded-xl p-2.5 text-center">
              <Flame className="w-3.5 h-3.5 text-[#ff6b35] mx-auto mb-1" />
              <div className="text-base font-black text-white tabular">
                {profile.streak}
              </div>
              <div className="text-[8px] uppercase tracking-wider text-white/45 font-bold">
                Серия
              </div>
            </div>
            <div className="glass rounded-xl p-2.5 text-center">
              <Trophy className="w-3.5 h-3.5 text-[#ffb800] mx-auto mb-1" />
              <div className="text-base font-black text-white tabular">
                {profile.totalPredictions}
              </div>
              <div className="text-[8px] uppercase tracking-wider text-white/45 font-bold">
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
            <Star className="w-4 h-4 text-[#ffb800]" fill="#ffb800" />
            <h3 className="text-sm font-bold text-white">Достижения</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {profile.achievements.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl p-3 text-center transition-all ${
                  a.unlocked
                    ? "glass-card hover-lift cursor-pointer"
                    : "bg-white/3 opacity-40"
                }`}
              >
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-[9px] font-bold text-white/80 leading-tight">
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
            <Crown className="w-4 h-4 text-[#ffb800]" fill="#ffb800" />
            <h3 className="text-sm font-bold text-white">Топ капперов</h3>
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  entry.isCurrentUser
                    ? "bg-gradient-to-r from-[#00ff88]/15 to-[#a855f7]/15 border border-[#00ff88]/30"
                    : "glass hover:bg-white/5"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black ${
                    entry.rank === 1
                      ? "bg-gradient-to-br from-[#ffb800] to-[#ff6b35] text-[#1a0f00]"
                      : entry.rank === 2
                        ? "bg-gradient-to-br from-[#94a3b8] to-[#64748b] text-white"
                        : entry.rank === 3
                          ? "bg-gradient-to-br from-[#cd7f32] to-[#a0522d] text-white"
                          : "bg-white/8 text-white/65"
                  }`}
                >
                  {entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="text-[8px] font-black uppercase text-[#00ff88]">
                        (ты)
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-white/45">
                    Серия {entry.streak} · XP {entry.xp.toLocaleString("ru")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-[#00ff88] tabular">
                    {entry.accuracy}%
                  </div>
                  <div className="text-[9px] text-white/40 uppercase tracking-wider">
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
