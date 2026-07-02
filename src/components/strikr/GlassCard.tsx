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
 * Glass morphism card with optional 3D tilt-on-cursor effect.
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

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -6;
    const rotY = ((x - cx) / cx) * 6;
    setTransform(
      `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.015)`,
    );
    setGlowPos({ x, y });
  };

  const handleLeave = () => {
    if (!tilt) return;
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)");
    setGlowPos(null);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ transform: tilt ? transform : undefined }}
      className={`glass-card rounded-2xl ${tilt ? "tilt-card" : ""} ${glow ? "hover-lift" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {glow && glowPos && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-40 transition-opacity"
          style={{
            background: `radial-gradient(220px circle at ${glowPos.x}px ${glowPos.y}px, rgba(0,255,136,0.18), transparent 60%)`,
          }}
        />
      )}
      <div className="relative" style={{ transform: tilt ? "translateZ(40px)" : undefined }}>
        {children}
      </div>
    </div>
  );
}
