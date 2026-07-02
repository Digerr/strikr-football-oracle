"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
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

// Memoized MatchCard to prevent re-renders when match data hasn't changed
const MemoizedMatchCard = memo(MatchCard);

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="surface-card rounded-2xl p-4 skeleton-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex justify-between mb-3">
            <div className="h-3 w-16 bg-[var(--surface-3)] rounded-full" />
            <div className="h-3 w-12 bg-[var(--surface-3)] rounded-full" />
          </div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-3)]" />
              <div className="h-3 w-20 bg-[var(--surface-3)] rounded" />
            </div>
            <div className="h-6 w-12 bg-[var(--surface-3)] rounded" />
            <div className="flex items-center gap-2">
              <div className="h-3 w-20 bg-[var(--surface-3)] rounded" />
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-3)]" />
            </div>
          </div>
          <div className="h-12 bg-[var(--surface-3)] rounded-xl" />
        </div>
      ))}
    </div>
  );
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

  // Initial fetch + auto-refresh every 90s (was 60s — reduced TG load)
  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 90_000);
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
          tg.setHeaderColor?.("#f3f4f8");
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Derived data — memoized
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

  const handleMatchClick = useCallback((m: Match) => {
    setSelectedMatch(m);
  }, []);

  const handleTabChange = useCallback((t: TabId) => {
    setTab(t);
  }, []);

  const handleFilterChange = useCallback((f: MatchFilter) => {
    setFilter(f);
  }, []);

  const handleHeroExplore = useCallback(() => setTab("predictions"), []);
  const handleHeroSeeHot = useCallback(() => {
    setFilter("hot");
    setTab("matches");
  }, []);

  // Memoized handlers for "Все" buttons — prevent re-renders
  const goLive = useCallback(() => {
    setFilter("live");
    setTab("matches");
  }, []);
  const goPredictions = useCallback(() => setTab("predictions"), []);
  const goHot = useCallback(() => {
    setFilter("hot");
    setTab("matches");
  }, []);

  return (
    <div className="min-h-screen flex flex-col safe-top safe-bottom">
      <Header liveCount={liveMatches.length} />

      <main className="flex-1 max-w-3xl mx-auto w-full pb-6">
        {/* Live data indicator */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loading && allMatches.length === 0 ? (
              <Loader2 className="w-3 h-3 animate-spin text-[var(--strikr-brand)]" />
            ) : (
              <span
                className={`w-2 h-2 rounded-full ${
                  dataSource === "live"
                    ? "bg-[var(--strikr-green)] pulse-glow"
                    : "bg-[var(--strikr-gold)]"
                }`}
              />
            )}
            <span className="text-[10px] uppercase tracking-wider text-foreground/55 font-bold">
              {dataSource === "live" ? "Live API" : "Demo data"}
            </span>
            <span className="text-[10px] text-foreground/35">
              · обновлено {lastUpdated.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
          <button
            onClick={fetchMatches}
            className="text-[10px] text-foreground/45 hover:text-foreground font-bold uppercase tracking-wider transition-colors"
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
              transition={{ duration: 0.2 }}
            >
              <Hero
                liveCount={liveMatches.length}
                hotCount={hotMatches.length}
                onExplore={handleHeroExplore}
                onSeeHot={handleHeroSeeHot}
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
                            <span className="w-2 h-2 rounded-full bg-[var(--strikr-red)] live-pulse" />
                            <h2 className="text-base font-black text-foreground uppercase tracking-tight">
                              Live сейчас
                            </h2>
                          </div>
                          <button
                            onClick={goLive}
                            className="text-[11px] font-bold text-[var(--strikr-brand)] flex items-center gap-0.5"
                          >
                            Все <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {liveMatches.slice(0, 4).map((m, i) => (
                            <MemoizedMatchCard
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
                            className="w-4 h-4 text-[var(--strikr-purple)]"
                            fill="var(--strikr-purple)"
                          />
                          <h2 className="text-base font-black text-foreground uppercase tracking-tight">
                            Топ прогнозы ИИ
                          </h2>
                        </div>
                        <button
                          onClick={goPredictions}
                          className="text-[11px] font-bold text-[var(--strikr-brand)] flex items-center gap-0.5"
                        >
                          Все <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {topPredictions.slice(0, 3).map((m, i) => (
                          <MemoizedMatchCard
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
                            className="w-4 h-4 text-[var(--strikr-orange)]"
                            fill="var(--strikr-orange)"
                          />
                          <h2 className="text-base font-black text-foreground uppercase tracking-tight">
                            Горячие матчи
                          </h2>
                        </div>
                        <button
                          onClick={goHot}
                          className="text-[11px] font-bold text-[var(--strikr-brand)] flex items-center gap-0.5"
                        >
                          Все <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {hotMatches.slice(0, 3).map((m, i) => (
                          <MemoizedMatchCard
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
              transition={{ duration: 0.2 }}
              className="px-4 pt-4"
            >
              <div className="mb-4">
                <h1 className="text-2xl font-black text-foreground">
                  Все <span className="gradient-text">матчи</span>
                </h1>
                <p className="text-[11px] text-foreground/45 mt-0.5">
                  {loading
                    ? "Загрузка..."
                    : `${filteredMatches.length} матчей · ${dataSource === "live" ? "live API" : "demo"} · обновлено ${lastUpdated.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}`}
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
                      onClick={() => handleFilterChange(f.id)}
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? "text-white shadow-[0_2px_8px_var(--ring)]"
                          : "surface-2 text-foreground/70 hover:text-foreground"
                      }`}
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(135deg, var(--strikr-brand), var(--strikr-brand-dark))",
                            }
                          : undefined
                      }
                    >
                      {f.id === "live" && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-[var(--strikr-red)] live-pulse"}`}
                        />
                      )}
                      {f.label}
                      <span
                        className={`text-[10px] tabular ${isActive ? "text-white/70" : "text-foreground/40"}`}
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
                      className="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold text-foreground/80 surface-2 flex items-center gap-1.5"
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
                <div key={filter} className="space-y-3">
                  {filteredMatches.map((m, i) => (
                    <MemoizedMatchCard
                      key={m.id}
                      match={m}
                      index={i}
                      onClick={() => handleMatchClick(m)}
                    />
                  ))}
                </div>
              )}

              {!loading && filteredMatches.length === 0 && (
                <GlassCard className="p-8 text-center">
                  <Activity className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
                  <div className="text-sm text-foreground/55 font-medium">
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
              transition={{ duration: 0.2 }}
              className="px-4 pt-4"
            >
              <div className="mb-4">
                <h1 className="text-2xl font-black text-foreground">
                  <span className="gradient-text">ИИ-прогнозы</span>
                </h1>
                <p className="text-[11px] text-foreground/45 mt-0.5">
                  Отсортировано по уверенности модели
                </p>
              </div>

              {/* AI Engine banner */}
              <GlassCard glow className="p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow"
                    style={{
                      background: "linear-gradient(135deg, var(--strikr-purple), var(--strikr-violet))",
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-foreground/45 font-bold">
                      Neural Engine v3.2
                    </div>
                    <div className="text-sm font-black text-foreground">
                      Точность за 30 дней:{" "}
                      <span className="text-[var(--strikr-green)]">87%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="surface-2 rounded-lg p-2 text-center">
                    <div className="text-sm font-black text-[var(--strikr-green)] tabular">
                      142
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-foreground/45 font-bold">
                      Верно
                    </div>
                  </div>
                  <div className="surface-2 rounded-lg p-2 text-center">
                    <div className="text-sm font-black text-[var(--strikr-orange)] tabular">
                      21
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-foreground/45 font-bold">
                      Мимо
                    </div>
                  </div>
                  <div className="surface-2 rounded-lg p-2 text-center">
                    <div className="text-sm font-black text-[var(--strikr-brand)] tabular">
                      163
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-foreground/45 font-bold">
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
                    <MemoizedMatchCard
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
              transition={{ duration: 0.2 }}
              className="px-4 pt-4"
            >
              <div className="mb-4">
                <h1 className="text-2xl font-black text-foreground">
                  Мой <span className="gradient-text">профиль</span>
                </h1>
                <p className="text-[11px] text-foreground/45 mt-0.5">
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

      <BottomNav active={tab} onChange={handleTabChange} />

      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
}
