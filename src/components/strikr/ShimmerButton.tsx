"use client";

import { useRef, ReactNode, MouseEvent } from "react";

interface ShimmerButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "ghost" | "violet" | "orange";
  disabled?: boolean;
  type?: "button" | "submit";
}

/**
 * Button with shimmer sweep + ripple-on-click effect.
 */
export function ShimmerButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  type = "button",
}: ShimmerButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleRipple = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || !ref.current) return;
    const btn = ref.current;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const span = document.createElement("span");
    span.className = "ripple-span";
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${e.clientX - rect.left - size / 2}px`;
    span.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 700);
  };

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-[#00ff88] via-[#22d3ee] to-[#10b981] text-[#06121a] shadow-[0_8px_24px_rgba(0,255,136,0.35)]",
    violet:
      "bg-gradient-to-r from-[#a855f7] via-[#6366f1] to-[#a855f7] text-white shadow-[0_8px_24px_rgba(168,85,247,0.35)]",
    orange:
      "bg-gradient-to-r from-[#ff6b35] via-[#ffb800] to-[#ff6b35] text-[#1a0f00] shadow-[0_8px_24px_rgba(255,107,53,0.35)]",
    ghost:
      "glass text-white hover:bg-white/10",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={(e) => {
        handleRipple(e);
        onClick?.();
      }}
      className={`shimmer-btn ripple relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
    >
      <span className="relative z-[2] flex items-center gap-2">{children}</span>
    </button>
  );
}
