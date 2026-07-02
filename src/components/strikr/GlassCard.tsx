"use client";

import { useRef, useState, ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

/**
 * Card with surface styling. Tilt effect is mouse-only
 * (disabled on touch devices for Telegram performance).
 */
export function GlassCard({
  children,
  className = "",
  tilt = false,
  glow = false,
  onClick,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("");
  const [glowPos, setGlowPos] = useState<{ x: number; y: number } | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || isTouch || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -4;
    const rotY = ((x - cx) / cx) * 4;
    setTransform(
      `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
    );
    setGlowPos({ x, y });
  };

  const handleLeave = () => {
    if (!tilt) return;
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg)");
    setGlowPos(null);
  };

  // Detect touch device on mount
  const handleTouchStart = () => {
    setIsTouch(true);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchStart={handleTouchStart}
      onClick={onClick}
      style={{ transform: tilt && !isTouch ? transform : undefined }}
      className={`surface-card ${tilt && !isTouch ? "tilt-card" : ""} ${glow ? "hover-lift" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {glow && glowPos && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-30 transition-opacity"
          style={{
            background: `radial-gradient(180px circle at ${glowPos.x}px ${glowPos.y}px, var(--ring), transparent 60%)`,
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
