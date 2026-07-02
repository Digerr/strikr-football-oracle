"use client";

import { useRef, ReactNode, MouseEvent } from "react";

interface ShimmerButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "ghost" | "violet" | "orange" | "green";
  disabled?: boolean;
  type?: "button" | "submit";
}

/**
 * Button with shimmer sweep + ripple-on-click effect.
 * Uses CSS variables for theme-aware colors.
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
    setTimeout(() => span.remove(), 600);
  };

  const variants: Record<string, string> = {
    primary:
      "text-white shadow-[0_4px_14px_var(--ring)]",
    violet:
      "text-white shadow-[0_4px_14px_rgba(94,54,202,0.3)]",
    orange:
      "text-[#1a0f00] shadow-[0_4px_14px_rgba(255,107,0,0.3)]",
    green:
      "text-white shadow-[0_4px_14px_rgba(34,164,67,0.3)]",
    ghost:
      "surface-2 text-foreground hover:bg-[var(--surface-3)]",
  };

  const bgStyles: Record<string, string> = {
    primary: "linear-gradient(135deg, var(--strikr-brand), var(--strikr-brand-dark))",
    violet: "linear-gradient(135deg, var(--strikr-purple), var(--strikr-violet))",
    orange: "linear-gradient(135deg, var(--strikr-orange), var(--strikr-gold))",
    green: "linear-gradient(135deg, var(--strikr-green), var(--strikr-green-dark))",
    ghost: "",
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
      style={
        bgStyles[variant]
          ? { background: bgStyles[variant] }
          : undefined
      }
      className={`shimmer-btn ripple relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
    >
      <span className="relative z-[2] flex items-center gap-2">{children}</span>
    </button>
  );
}
