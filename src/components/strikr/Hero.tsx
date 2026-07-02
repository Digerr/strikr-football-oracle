"use client";

import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { ShimmerButton } from "./ShimmerButton";
import { TrendingUp, Flame, Zap } from "lucide-react";

interface HeroProps {
  liveCount: number;
  hotCount: number;
  onExplore: () => void;
  onSeeHot: () => void;
}

export function Hero({ liveCount, hotCount, onExplore, onSeeHot }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background accents (TG-friendly, no heavy blur) */}
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
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--strikr-red)] live-pulse" />
            <span className="text-[11px] font-bold text-foreground/85 tabular">
              {liveCount} LIVE
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
            <Zap className="w-3 h-3 text-[var(--strikr-gold)]" fill="var(--strikr-gold)" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">
              AI Predictions Engine v3.2
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] tracking-tight">
            <span className="gradient-text-animated">Прогнозы</span>
            <br />
            <span className="text-foreground">на футбол с</span>
            <br />
            <span className="gradient-text-animated">точностью 87%</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-foreground/55 max-w-md leading-relaxed">
            Живые матчи, deep analytics и ИИ-прогнозы на основе xG, формы команд
            и H2H. Всё в одном Telegram-апп.
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
            Топ прогнозы
          </ShimmerButton>
          <ShimmerButton onClick={onSeeHot} variant="orange" className="px-6 py-3 text-base">
            <Flame className="w-4 h-4" />
            Горячие матчи ({hotCount})
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
            { v: "87%", l: "Точность ИИ", c: "var(--strikr-green)" },
            { v: "15K+", l: "Игроков", c: "var(--strikr-brand)" },
            { v: "24/7", l: "Live обновления", c: "var(--strikr-purple)" },
          ].map((s, i) => (
            <div key={i} className="surface-card rounded-xl p-3 text-center">
              <div className="text-xl font-black tabular" style={{ color: s.c }}>
                {s.v}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-foreground/45 font-semibold mt-0.5">
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
