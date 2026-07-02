"use client";

interface ConfidenceBarProps {
  value: number; // 0-100
  label?: string;
  color?: "green" | "orange" | "violet" | "red" | "cyan";
  showValue?: boolean;
  animate?: boolean;
  height?: number;
}

const COLOR_MAP: Record<string, string> = {
  green: "linear-gradient(90deg, #00ff88, #22d3ee)",
  orange: "linear-gradient(90deg, #ff6b35, #ffb800)",
  violet: "linear-gradient(90deg, #a855f7, #6366f1)",
  red: "linear-gradient(90deg, #ff3366, #ff6b35)",
  cyan: "linear-gradient(90deg, #22d3ee, #00ff88)",
};

export function ConfidenceBar({
  value,
  label,
  color = "green",
  showValue = true,
  animate = true,
  height = 8,
}: ConfidenceBarProps) {
  const v = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label ? (
            <span className="text-[11px] uppercase tracking-wider text-white/55 font-semibold">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue && (
            <span className="tabular text-[11px] font-bold text-white/80">
              {Math.round(v)}%
            </span>
          )}
        </div>
      )}
      <div
        className="confidence-bar"
        style={{ height }}
      >
        <div
          className="confidence-fill"
          style={
            animate
              ? ({
                  // CSS animation handles the 0 -> target transition.
                  // --target-pct drives the @keyframes end state.
                  ["--target-pct" as string]: `${v}%`,
                  background: COLOR_MAP[color],
                  width: `${v}%`,
                  animation: "bar-grow 1.2s cubic-bezier(0.65, 0, 0.35, 1) 1",
                } as React.CSSProperties)
              : {
                  width: `${v}%`,
                  background: COLOR_MAP[color],
                }
          }
        />
      </div>
    </div>
  );
}
