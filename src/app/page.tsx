"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Match } from "@/lib/football-data";
import { Hero } from "@/components/strikr/Hero";
import { Header } from "@/components/strikr/Header";
import { MatchCard } from "@/components/strikr/MatchCard";
import { MatchDetailModal } from "@/components/strikr/MatchDetailModal";
import { BottomNav, type TabId } from "@/components/strikr/BottomNav";
import { StatsView } from "@/components/strikr/StatsView";
import { GlassCard } from "@/components/strikr/GlassCard";
import { Sparkles, Flame, Activity, ChevronRight, Loader2 } from "lucide-react";

type MatchFilter = "all" | "live" | "upcoming" | "hot" | "finished";

interface MatchesResponse {
  ok: boolean;
  count: number;
  matches: Match[];
  source: "live" | "mock";
  timestamp: string;
}

export default function Home() {
  const [tab, setTab] = useState<TabId>("home");
  const [filter, setFilter] = useState<MatchFilter>("all");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"live" | "mock">("mock");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matches?filter=all", { cache: "no-store" });
      if (res.ok) {
        const data: MatchesResponse = await res.json();
        setAllMatches(data.matches || []);
        setDataSource(data.source || "mock");
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Failed to fetch matches:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 60s
  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60_000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  // Telegram WebApp integration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (
        window as unknown as {
          Telegram?: {
            WebApp?: {
              expand?: () => void;
              ready?: () => void;
              setHeaderColor?: (c: string) => void;
            };
          };
        }
      ).Telegram?.WebApp;
      if (tg) {
        try {
          tg.ready?.();
          tg.expand?.();
          tg.setHeaderColor?.("#06121a");
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Derived data
  const liveMatches = useMemo(
    () => allMatches.filter((m) => m.status === "LIVE"),
    [allMatches],
  );
  const upcomingMatches = useMemo(
    () =>
      allMatches
        .filter((m) => m.status === "UPCOMING")
        .sort(
          (a, b) =>
            new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
        ),
    [allMatches],
  );
  const hotMatches = useMemo(
    () =>
      allMatches
        .filter((m) => m.importance >= 4 && m.status !== "FINISHED")
        .sort((a, b) => b.importance - a.importance),
    [allMatches],
  );
  const finishedMatches = useMemo(
    () =>
      allMatches
        .filter((m) => m.status === "FINISHED")
        .sort(
          (a, b) =>
            new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime(),
        ),
    [allMatches],
  );
  const topPredictions = useMemo(
    () =>
      [...allMatches]
        .filter((m) => m.status !== "FINISHED")
        .sort((a, b) => b.prediction.confidence - a.prediction.confidence)
        .slice(0, 5),
    [allMatches],
  );
  const leagues = useMemo(() => {
    const seen = new Map<
      string,
      { name: string; short: string; color: string }
    >();
    allMatches.forEach((m) => {
      if (!seen.has(m.leagueShort))
        seen.set(m.leagueShort, {
          name: m.league,
          short: m.leagueShort,
          color: m.leagueColor,
        });
    });
    return Array.from(seen.values());
  }, [allMatches]);

  const filteredMatches = useMemo(() => {
    switch (filter) {
      case "live":
        return liveMatches;
      case "upcoming":
        return upcomingMatches;
      case "hot":
        return hotMatches;
      case "finished":
        return finishedMatches;
      default:
        return allMatches;
    }
  }, [filter, allMatches, liveMatches, upcomingMatches, hotMatches, finishedMatches]);

  const handleMatchClick = (m: Match) => setSelectedMatch(m);

  return (
    <div className="min-h-screen flex flex-col safe-top safe-bottom">
      <Header liveCount={liveMatches.length} />

      <main className="flex-1 max-w-3xl mx-auto w-full pb-6">
        {/* Live data indicator */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#00ff88]" />
            ) : (
              <span
                className={`w-2 h-2 rounded-full ${
                  dataSource === "live"
                    ? "bg-[#00ff88] pulse-glow"
                    : "bg-[#ffb800]"
                }`}
              />
            )}
            <span className="text-[10px] uppercase tracking-wider text-white/55 font-bold">
              {dataSource === "live" ? "Live API" : "Demo data"}
            </span>
            <span className="text-[10px] text-white/35">
              · обновлено {lastUpdated.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
          <button
            onClick={fetchMatches}
            className="text-[10px] text-white/45 hover:text-white font-bold uppercase tracking-wider transition-colors"
          >
            ↻ Обновить
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Hero
                liveCount={liveMatches.length}
                hotCount={hotMatches.length}
                onExplore={() => setTab("predictions")}
                onSeeHot={() => {
                  setFilter("hot");
                  setTab("matches");
                }}
              />

              <div className="px-4 space-y-5">
                {loading && allMatches.length === 0 ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    {/* LIVE section */}
                    {liveMatches.length > 0 && (
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#ff3366] live-pulse" />
                            <h2 className="text-base font-black text-white uppercase tracking-tight">
                              Live сейчас
                            </h2>
                          </div>
                          <button
                            onClick={() => {
                              setFilter("live");
                              setTab("matches");
                            }}
                            className="text-[11px] font-bold text-[#00ff88] flex items-center gap-0.5"
                          >
                            Все <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {liveMatches.slice(0, 4).map((m, i) => (
                            <MatchCard
                              key={m.id}
                              match={m}
                              index={i}
                              onClick={() => handleMatchClick(m)}
                            />
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Top predictions */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles
                            className="w-4 h-4 text-[#a855f7]"
                            fill="#a855f7"
                          />
                          <h2 className="text-base font-black text-white uppercase tracking-tight">
                            Топ прогнозы ИИ
                          </h2>
                        </div>
                        <button
                          onClick={() => setTab("predictions")}
                          className="text-[11px] font-bold text-[#00ff88] flex items-center gap-0.5"
                        >
                          Все <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {topPredictions.slice(0, 3).map((m, i) => (
                          <MatchCard
                            key={m.id}
                            match={m}
                            index={i}
                            onClick={() => handleMatchClick(m)}
                          />
                        ))}
                      </div>
                    </section>

                    {/* Hot matches */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Flame
                            className="w-4 h-4 text-[#ff6b35]"
                            fill="#ff6b35"
                          />
                          <h2 className="text-base font-black text-white uppercase tracking-tight">
                            Горячие матчи
                          </h2>
                        </div>
                        <button
                          onClick={() => {
                            setFilter("hot");
                            setTab("matches");
                          }}
                          className="text-[11px] font-bold text-[#00ff88] flex items-center gap-0.5"
                        >
                          Все <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {hotMatches.slice(0, 3).map((m, i) => (
                          <MatchCard
                            key={m.id}
                            match={m}
                            index={i}
                            onClick={() => handleMatchClick(m)}
                          />
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {tab === "matches" && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="px-4 pt-4"
            >
              <div className="mb-4">
                <h1 className="text-2xl font-black text-white">
                  Все <span className="gradient-text">матчи</span>
                </h1>
                <p className="text-[11px] text-white/45 mt-0.5">
                  {loading ? "Загрузка..." : `${filteredMatches.length} матчей · ${dataSource === "live" ? "live API" : "demo"} · обновлено ${lastUpdated.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>

              {/* Filter chips */}
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: "all" as const, label: "Все", count: allMatches.length },
                  { id: "live" as const, label: "Live", count: liveMatches.length },
                  { id: "upcoming" as const, label: "Предстоящие", count: upcomingMatches.length },
                  { id: "hot" as const, label: "Горячие", count: hotMatches.length },
                  { id: "finished" as const, label: "Завершены", count: finishedMatches.length },
                ].map((f) => {
                  const isActive = filter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? "bg-gradient-to-r from-[#00ff88] to-[#22d3ee] text-[#06121a] shadow-[0_4px_14px_rgba(0,255,136,0.35)]"
                          : "glass text-white/70 hover:text-white"
                      }`}
                    >
                      {f.id === "live" && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#06121a]" : "bg-[#ff3366] live-pulse"}`}
                        />
                      )}
                      {f.label}
                      <span
                        className={`text-[10px] tabular ${isActive ? "text-[#06121a]/70" : "text-white/40"}`}
                      >
                        {f.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* League chips */}
              {leagues.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                  {leagues.map((l) => (
                    <div
                      key={l.short}
                      className="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold text-white/80 glass flex items-center gap-1.5"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: l.color }}
                      />
                      {l.name.length > 18 ? l.short : l.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Match list */}
              {loading && filteredMatches.length === 0 ? (
                <LoadingSkeleton />
              ) : (
                <motion.div
                  key={filter}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredMatches.map((m, i) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        index={i}
                        onClick={() => handleMatchClick(m)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {!loading && filteredMatches.length === 0 && (
                <GlassCard className="p-8 text-center">
                  <Activity className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <div className="text-sm text-white/55 font-medium">
                    Нет матчей в этом фильтре
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}

          {tab === "predictions" && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="px-4 pt-4"
            >
              <div className="mb-4">
                <h1 className="text-2xl font-black text-white">
                  <span className="gradient-text">ИИ-прогнозы</span>
                </h1>
                <p className="text-[11px] text-white/45 mt-0.5">
                  Отсортировано по уверенности модели
                </p>
              </div>

              {/* AI Engine banner */}
              <GlassCard tilt glow className="p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#6366f1] flex items-center justify-center pulse-glow">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold">
                      Neural Engine v3.2
                    </div>
                    <div className="text-sm font-black text-white">
                      Точность за 30 дней:{" "}
                      <span className="text-[#00ff88]">87%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="glass rounded-lg p-2 text-center">
                    <div className="text-sm font-black text-[#00ff88] tabular">
                      142
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-white/45 font-bold">
                      Верно
                    </div>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <div className="text-sm font-black text-[#ff6b35] tabular">
                      21
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-white/45 font-bold">
                      Мимо
                    </div>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <div className="text-sm font-black text-[#22d3ee] tabular">
                      163
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-white/45 font-bold">
                      Всего
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="space-y-3">
                {loading && topPredictions.length === 0 ? (
                  <LoadingSkeleton />
                ) : (
                  topPredictions.map((m, i) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      index={i}
                      onClick={() => handleMatchClick(m)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {tab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="px-4 pt-4"
            >
              <div className="mb-4">
                <h1 className="text-2xl font-black text-white">
                  Мой <span className="gradient-text">профиль</span>
                </h1>
                <p className="text-[11px] text-white/45 mt-0.5">
                  Рейтинг, достижения и лидерборд
                </p>
              </div>
              <StatsView
                topPredictions={topPredictions}
                onMatchClick={handleMatchClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={setTab} />

      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="glass-card rounded-2xl p-4 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex justify-between mb-3">
            <div className="h-3 w-16 bg-white/10 rounded-full" />
            <div className="h-3 w-12 bg-white/10 rounded-full" />
          </div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10" />
              <div className="h-3 w-20 bg-white/10 rounded" />
            </div>
            <div className="h-6 w-12 bg-white/10 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="w-8 h-8 rounded-lg bg-white/10" />
            </div>
          </div>
          <div className="h-12 bg-white/5 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
