interface Props {
  size?: number;
  mood?: "calm" | "happy" | "sleepy" | "concerned";
  className?: string;
}

export function CatAvatar({ size = 120, mood = "calm", className }: Props) {
  const eyeShape =
    mood === "sleepy" || mood === "concerned"
      ? "M -2 0 Q 0 -1 2 0"
      : mood === "happy"
        ? "M -2 1 Q 0 -2 2 1"
        : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      fill="none"
    >
      {/* head outline — slightly wobbly hand-drawn */}
      <path
        d="M 30 65 Q 28 38 45 30 L 50 22 L 58 32 Q 60 31 62 32 L 70 22 L 75 30 Q 92 38 90 65 Q 88 90 60 92 Q 32 90 30 65 Z"
        stroke="#5C4A3F"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="#FFF6EE"
      />
      {/* inner ear pink */}
      <path d="M 50 26 L 54 34 L 58 30 Z" fill="#FFD4D4" opacity="0.7" />
      <path d="M 70 26 L 66 30 L 62 34 Z" fill="#FFD4D4" opacity="0.7" />
      {/* cheek blushes */}
      <ellipse cx="42" cy="68" rx="6" ry="3.5" fill="#FFD4D4" opacity="0.55" />
      <ellipse cx="78" cy="68" rx="6" ry="3.5" fill="#FFD4D4" opacity="0.55" />
      {/* eyes */}
      {mood === "happy" ? (
        <>
          <path
            d="M 47 58 Q 50 54 53 58"
            stroke="#5C4A3F"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 67 58 Q 70 54 73 58"
            stroke="#5C4A3F"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : mood === "sleepy" ? (
        <>
          <path
            d="M 46 60 Q 50 62 54 60"
            stroke="#5C4A3F"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 66 60 Q 70 62 74 60"
            stroke="#5C4A3F"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <ellipse cx="50" cy="60" rx="2.4" ry="3" fill="#3A2C25" />
          <ellipse cx="70" cy="60" rx="2.4" ry="3" fill="#3A2C25" />
          <circle cx="50.6" cy="59" r="0.7" fill="#FFFFFF" />
          <circle cx="70.6" cy="59" r="0.7" fill="#FFFFFF" />
        </>
      )}
      {/* nose */}
      <path
        d="M 58 68 L 62 68 L 60 71 Z"
        fill="#E89A8F"
        stroke="#5C4A3F"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* mouth */}
      <path
        d={
          mood === "concerned"
            ? "M 56 76 Q 60 73 64 76"
            : "M 56 75 Q 58 78 60 76 Q 62 78 64 75"
        }
        stroke="#5C4A3F"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* whiskers */}
      <path d="M 36 70 L 28 68" stroke="#5C4A3F" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 36 73 L 28 74" stroke="#5C4A3F" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 84 70 L 92 68" stroke="#5C4A3F" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 84 73 L 92 74" stroke="#5C4A3F" strokeWidth="1.2" strokeLinecap="round" />
      {/* never used eyeShape — keep ts happy */}
      <g style={{ display: "none" }}>{eyeShape}</g>
    </svg>
  );
}
