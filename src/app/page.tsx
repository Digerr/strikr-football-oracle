"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Prediction, Capper, Match, Express } from "@/lib/predictions";
import { Hero } from "@/components/strikr/Hero";
import { Header } from "@/components/strikr/Header";
import { PredictionCard } from "@/components/strikr/PredictionCard";
import { CapperCard } from "@/components/strikr/CapperCard";
import { MatchRow } from "@/components/strikr/MatchRow";
import { ExpressCard } from "@/components/strikr/ExpressCard";
import { BottomNav, type TabId } from "@/components/strikr/BottomNav";
import { GlassCard } from "@/components/strikr/GlassCard";
import { Loader2, Activity } from "lucide-react";

type SportFilter = "all" | "football" | "hockey" | "tennis" | "basketball" | "esports" | "other";

const MemoPredictionCard = memo(PredictionCard);
const MemoCapperCard = memo(CapperCard);
const MemoMatchRow = memo(MatchRow);
const MemoExpressCard = memo(ExpressCard);

interface ApiResponse<T> {
  ok: boolean;
  count: number;
  [key: string]: unknown;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="surface-card rounded-2xl p-4 skeleton-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-[var(--surface-3)]" />
            <div className="flex-1">
              <div className="h-3 w-24 bg-[var(--surface-3)] rounded mb-1" />
              <div className="h-2 w-16 bg-[var(--surface-3)] rounded" />
            </div>
          </div>
          <div className="h-10 bg-[var(--surface-3)] rounded-lg mb-2" />
          <div className="h-12 bg-[var(--surface-3)] rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<TabId>("feed");
  const [sportFilter, setSportFilter] = useState<SportFilter>("all");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [cappers, setCappers] = useState<Capper[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [expresses, setExpresses] = useState<Express[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const [predRes, capRes, matchRes, expRes] = await Promise.all([
        fetch("/api/predictions?limit=100", { cache: "no-store" }),
        fetch("/api/cappers?limit=50", { cache: "no-store" }),
        fetch("/api/matches-list", { cache: "no-store" }),
        fetch("/api/expresses", { cache: "no-store" }),
      ]);

      if (predRes.ok) {
        const data = await predRes.json();
        setPredictions(data.predictions || []);
      }
      if (capRes.ok) {
        const data = await capRes.json();
        setCappers(data.cappers || []);
      }
      if (matchRes.ok) {
        const data = await matchRes.json();
        setMatches(data.matches || []);
      }
      if (expRes.ok) {
        const data = await expRes.json();
        setExpresses(data.expresses || []);
      }
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 90_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Telegram WebApp
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

  // Filtered data
  const filteredPredictions = useMemo(() => {
    if (sportFilter === "all") return predictions;
    return predictions.filter((p) => p.sport === sportFilter);
  }, [predictions, sportFilter]);

  const filteredMatches = useMemo(() => {
    if (sportFilter === "all") return matches;
    return matches.filter((m) => m.sport === sportFilter);
  }, [matches, sportFilter]);

  const topPredictions = useMemo(
    () =>
      [...predictions]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5),
    [predictions],
  );

  const liveMatches = useMemo(
    () => matches.filter((m) => {
      const now = new Date();
      const kickoff = new Date(m.kickoff);
      const diffH = (now.getTime() - kickoff.getTime()) / 3600000;
      return diffH > -2 && diffH < 2; // within 2 hours of kickoff
    }),
    [matches],
  );

  const handleTabChange = useCallback((t: TabId) => setTab(t), []);
  const handleSportFilter = useCallback((s: SportFilter) => setSportFilter(s), []);
  const handleExplore = useCallback(() => setTab("feed"), []);
  const handleSeeCappers = useCallback(() => setTab("cappers"), []);

  const SPORT_FILTERS: { id: SportFilter; label: string }[] = [
    { id: "all", label: "Все" },
    { id: "football", label: "Футбол" },
    { id: "hockey", label: "Хоккей" },
    { id: "tennis", label: "Теннис" },
    { id: "basketball", label: "Баскет" },
    { id: "esports", label: "Кибер" },
  ];

  return (
    <div className="min-h-screen flex flex-col safe-top safe-bottom">
      <Header liveCount={liveMatches.length} />

      <main className="flex-1 max-w-3xl mx-auto w-full pb-6">
        {/* Status bar */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loading && predictions.length === 0 ? (
              <Loader2 className="w-3 h-3 animate-spin text-[var(--strikr-brand)]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[var(--strikr-green)] pulse-glow" />
            )}
            <span className="text-[10px] uppercase tracking-wider text-foreground/55 font-bold">
              Live агрегатор
            </span>
            <span className="text-[10px] text-foreground/35">
              · {lastUpdated.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <button
            onClick={fetchAll}
            className="text-[10px] text-foreground/45 hover:text-foreground font-bold uppercase tracking-wider transition-colors"
          >
            ↻ Обновить
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Hero
                predictionsCount={predictions.length}
                cappersCount={cappers.length}
                expressesCount={expresses.length}
                onExplore={handleExplore}
                onSeeCappers={handleSeeCappers}
              />

              <div className="px-4 space-y-5">
                {/* Sport filter */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {SPORT_FILTERS.map((f) => {
                    const isActive = sportFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => handleSportFilter(f.id)}
                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
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
                        {f.label}
                      </button>
                    );
                  })}
                </div>

                {/* Top predictions */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-black text-foreground uppercase tracking-tight">
                      Топ прогнозы
                    </h2>
                    <span className="text-[11px] text-foreground/45 font-bold">
                      {filteredPredictions.length} шт
                    </span>
                  </div>
                  {loading && predictions.length === 0 ? (
                    <LoadingSkeleton />
                  ) : (
                    <div className="space-y-3">
                      {filteredPredictions.slice(0, 10).map((p, i) => (
                        <MemoPredictionCard key={p.id} prediction={p} index={i} />
                      ))}
                    </div>
                  )}
                </section>
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
                    : `${filteredMatches.length} матчей · прогнозы от ${cappers.length} капперов`}
                </p>
              </div>

              {/* Sport filter */}
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                {SPORT_FILTERS.map((f) => {
                  const isActive = sportFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleSportFilter(f.id)}
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
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
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {loading && matches.length === 0 ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-2">
                  {filteredMatches.map((m, i) => (
                    <MemoMatchRow key={m.id} match={m} index={i} />
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

          {tab === "cappers" && (
            <motion.div
              key="cappers"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="px-4 pt-4"
            >
              <div className="mb-4">
                <h1 className="text-2xl font-black text-foreground">
                  Топ <span className="gradient-text">капперы</span>
                </h1>
                <p className="text-[11px] text-foreground/45 mt-0.5">
                  Рейтинг по ROI · {cappers.length} капперов
                </p>
              </div>

              {loading && cappers.length === 0 ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-3">
                  {cappers.map((c, i) => (
                    <MemoCapperCard key={c.id} capper={c} index={i} rank={i + 1} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === "expresses" && (
            <motion.div
              key="expresses"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="px-4 pt-4"
            >
              <div className="mb-4">
                <h1 className="text-2xl font-black text-foreground">
                  <span className="gradient-text">Экспрессы</span>
                </h1>
                <p className="text-[11px] text-foreground/45 mt-0.5">
                  Топ экспрессов от капперов · {expresses.length} шт
                </p>
              </div>

              {loading && expresses.length === 0 ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-3">
                  {expresses.map((e, i) => (
                    <MemoExpressCard key={e.id} express={e} index={i} />
                  ))}
                </div>
              )}

              {!loading && expresses.length === 0 && (
                <GlassCard className="p-8 text-center">
                  <Activity className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
                  <div className="text-sm text-foreground/55 font-medium">
                    Пока нет экспрессов
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  );
}
