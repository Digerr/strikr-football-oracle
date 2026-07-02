"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 400], [0, 100]);
  const yContent = useTransform(scrollY, [0, 400], [0, 60]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Parallax background blobs */}
      <motion.div
        style={{ y: yBg }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="blob"
          style={{
            top: "-80px",
            left: "-60px",
            width: "320px",
            height: "320px",
            background: "#00ff88",
            animationDelay: "0s",
          }}
        />
        <div
          className="blob"
          style={{
            top: "40px",
            right: "-100px",
            width: "380px",
            height: "380px",
            background: "#a855f7",
            animationDelay: "2s",
          }}
        />
        <div
          className="blob"
          style={{
            bottom: "-120px",
            left: "30%",
            width: "260px",
            height: "260px",
            background: "#ff6b35",
            animationDelay: "4s",
          }}
        />
      </motion.div>

      {/* Parallax content */}
      <motion.div
        style={{ y: yContent, opacity }}
        className="px-4 pt-6 pb-8 sm:pt-10 sm:pb-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-between"
        >
          <Logo size={42} />
          <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3366] live-pulse" />
            <span className="text-[11px] font-bold text-white/85 tabular">
              {liveCount} LIVE
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mt-8 sm:mt-10"
        >
          <div className="inline-flex items-center gap-1.5 glass px-2.5 py-1 rounded-full mb-3">
            <Zap className="w-3 h-3 text-[#00ff88]" fill="#00ff88" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70">
              AI Predictions Engine v3.2
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] tracking-tight">
            <span className="gradient-text">Прогнозы</span>
            <br />
            <span className="text-white">на футбол с</span>
            <br />
            <span className="gradient-text">точностью 87%</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/55 max-w-md leading-relaxed">
            Живые матчи, deep analytics и ИИ-прогнозы на основе xG, формы команд
            и H2H. Всё в одном Telegram-апп.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
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
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {[
            { v: "87%", l: "Точность ИИ", c: "text-[#00ff88]" },
            { v: "15K+", l: "Игроков", c: "text-[#22d3ee]" },
            { v: "24/7", l: "Live обновления", c: "text-[#a855f7]" },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-3 text-center">
              <div className={`text-xl font-black tabular ${s.c}`}>{s.v}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/45 font-semibold mt-0.5">
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
