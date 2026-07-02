"use client";

import { motion } from "framer-motion";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

/**
 * STRIKR Logo — animated football-orbital crest with shine sweep.
 * Colors adapt to theme via CSS variables.
 */
export function Logo({ size = 44, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative logo-shine rounded-2xl"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-[2]"
        >
          <defs>
            <linearGradient id="logoBg" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stopColor="var(--strikr-brand)" />
              <stop offset="100%" stopColor="var(--strikr-purple)" />
            </linearGradient>
            <linearGradient id="logoRing" x1="8" y1="8" x2="56" y2="56">
              <stop offset="0%" stopColor="var(--strikr-green)" />
              <stop offset="50%" stopColor="var(--strikr-cyan)" />
              <stop offset="100%" stopColor="var(--strikr-purple)" />
            </linearGradient>
            <linearGradient id="logoStrike" x1="20" y1="20" x2="44" y2="44">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="var(--strikr-green)" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#logoBg)" />
          {/* Outer orbital ring */}
          <motion.g
            style={{ transformOrigin: "32px 32px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <circle
              cx="32"
              cy="32"
              r="18"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 6"
            />
          </motion.g>
          {/* Pentagon football pattern */}
          <path
            d="M32 18 L40 24 L37 33 L27 33 L24 24 Z"
            fill="url(#logoStrike)"
            opacity="0.95"
          />
          <path
            d="M32 18 L32 14 M40 24 L44 22 M37 33 L41 38 M27 33 L23 38 M24 24 L20 22"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="32" cy="32" r="2.5" fill="#ffffff" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-black tracking-tight gradient-text">
            STRIKR
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-foreground/40 font-medium">
            Football Oracle
          </span>
        </div>
      )}
    </div>
  );
}
