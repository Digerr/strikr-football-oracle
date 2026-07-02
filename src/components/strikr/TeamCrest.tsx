"use client";

interface TeamCrestProps {
  crest: string; // URL or emoji
  color: string;
  size?: number;
  rounded?: string;
  className?: string;
}

/**
 * Renders a team crest. If `crest` is a URL (http/https), renders an <img>.
 * Otherwise renders the emoji/text in a colored badge.
 */
export function TeamCrest({
  crest,
  color,
  size = 32,
  rounded = "rounded-lg",
  className = "",
}: TeamCrestProps) {
  const isUrl = crest.startsWith("http") || crest.startsWith("/");

  if (isUrl) {
    return (
      <span
        className={`${rounded} flex-shrink-0 inline-flex items-center justify-center overflow-hidden ${className}`}
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${color}33, ${color}11)`,
          border: `1px solid ${color}55`,
        }}
      >
        {/* Using <img> instead of next/image because crests are simple SVGs
            hosted on football-data.org and we want lazy-loading without
            Next.js image optimization overhead */}
        <img
          src={crest}
          alt=""
          className="w-[80%] h-[80%] object-contain"
          loading="lazy"
          onError={(e) => {
            // Hide broken image
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </span>
    );
  }

  // Emoji / text fallback
  return (
    <span
      className={`${rounded} flex-shrink-0 inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}33, ${color}11)`,
        border: `1px solid ${color}55`,
        fontSize: size * 0.5,
        lineHeight: 1,
      }}
    >
      {crest}
    </span>
  );
}
