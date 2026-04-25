interface Props {
  size?: number;
  mood?: "calm" | "happy" | "sleepy" | "concerned";
  className?: string;
}

export function CatAvatar({ size = 120, mood = "calm", className }: Props) {
  // Quick tune knobs for line-art style
  const stroke = "#3D3530";
  const sw = 2.15;
  const detailSw = 1.7; // eyes/whiskers细节线宽
  const noseSw = 1.2;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      fill="none"
    >
      {/* line-art ears */}
      <path
        d="M 38 38 L 44 16 L 56 33"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 82 38 L 76 16 L 64 33"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* line-art head contour */}
      <path
        d="M 39 40 Q 31 50 35 70 Q 39 92 60 92 Q 81 92 85 70 Q 89 50 81 40"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* soft blush for a cuter look */}
      <ellipse
        cx="44"
        cy="72"
        rx="6.2"
        ry="2.8"
        fill="#FFD4D4"
        opacity="0.45"
      />
      <ellipse
        cx="76"
        cy="72"
        rx="6.2"
        ry="2.8"
        fill="#FFD4D4"
        opacity="0.45"
      />
      {/* eyes */}
      {mood === "happy" ? (
        <>
          <path
            d="M 45 59 Q 50 54.5 55 59"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 65 59 Q 70 54.5 75 59"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : mood === "sleepy" ? (
        <>
          <path
            d="M 45 61.5 Q 50 64 55 61.5"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 65 61.5 Q 70 64 75 61.5"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <circle
            cx="50"
            cy="60.5"
            r="2.8"
            stroke={stroke}
            strokeWidth={detailSw}
            fill="none"
          />
          <circle
            cx="70"
            cy="60.5"
            r="2.8"
            stroke={stroke}
            strokeWidth={detailSw}
            fill="none"
          />
        </>
      )}
      {/* nose */}
      <path
        d="M 58.3 67.8 L 61.7 67.8 L 60 70.4 Z"
        fill="none"
        stroke={stroke}
        strokeWidth={noseSw}
        strokeLinejoin="round"
      />
      {/* mouth */}
      {mood === "concerned" ? (
        <path
          d="M 56.5 76.8 Q 60 74.8 63.5 76.8"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M 55.2 73.8 Q 60 78.8 64.8 73.8"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {/* whiskers */}
      <path
        d="M 46 72.5 L 39 71.8"
        stroke={stroke}
        strokeWidth={detailSw}
        strokeLinecap="round"
      />
      <path
        d="M 46 76 L 39 76.8"
        stroke={stroke}
        strokeWidth={detailSw}
        strokeLinecap="round"
      />
      <path
        d="M 74 72.5 L 81 71.8"
        stroke={stroke}
        strokeWidth={detailSw}
        strokeLinecap="round"
      />
      <path
        d="M 74 76 L 81 76.8"
        stroke={stroke}
        strokeWidth={detailSw}
        strokeLinecap="round"
      />
    </svg>
  );
}
