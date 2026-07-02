"use client";

import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { ShimmerButton } from "./ShimmerButton";
import { TrendingUp, Users, Layers, Activity } from "lucide-react";

interface HeroProps {
  predictionsCount: number;
  cappersCount: number;
  expressesCount: number;
  onExplore: () => void;
  onSeeCappers: () => void;
}

export function Hero({
  predictionsCount,
  cappersCount,
  expressesCount,
  onExplore,
  onSeeCappers,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, var(--strikr-brand), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, var(--strikr-purple), transparent 70%)",
          }}
        />
      </div>

      <div className="px-4 pt-6 pb-8 sm:pt-10 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between"
        >
          <Logo size={42} />
          <div className="surface-2 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--strikr-green)] pulse-glow" />
            <span className="text-[11px] font-bold text-foreground/85 tabular">
              LIVE
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
          className="mt-8 sm:mt-10"
        >
          <div className="inline-flex items-center gap-1.5 surface-2 px-2.5 py-1 rounded-full mb-3">
            <Activity className="w-3 h-3 text-[var(--strikr-gold)]" fill="var(--strikr-gold)" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">
              Агрегатор прогнозов
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] tracking-tight">
            <span className="gradient-text-animated">Прогнозы</span>
            <br />
            <span className="text-foreground">от топ</span>
            <br />
            <span className="gradient-text-animated">капперов</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-foreground/55 max-w-md leading-relaxed">
            Агрегируем прогнозы с Stavka.tv, Sports.ru и других площадок.
            Реальные капперы, реальные ставки, реальные коэффициенты.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <ShimmerButton onClick={onExplore} className="px-6 py-3 text-base">
            <TrendingUp className="w-4 h-4" />
            Смотреть прогнозы
          </ShimmerButton>
          <ShimmerButton onClick={onSeeCappers} variant="violet" className="px-6 py-3 text-base">
            <Users className="w-4 h-4" />
            Топ капперы
          </ShimmerButton>
        </motion.div>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {[
            { v: predictionsCount, l: "Прогнозов", c: "var(--strikr-brand)", icon: TrendingUp },
            { v: cappersCount, l: "Капперов", c: "var(--strikr-purple)", icon: Users },
            { v: expressesCount, l: "Экспрессов", c: "var(--strikr-orange)", icon: Layers },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="surface-card rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.c }} />
                <div className="text-xl font-black tabular" style={{ color: s.c }}>
                  {s.v}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-foreground/45 font-semibold mt-0.5">
                  {s.l}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
