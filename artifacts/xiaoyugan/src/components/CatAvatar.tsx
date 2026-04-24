interface Props {
  size?: number;
  mood?: "calm" | "happy" | "sleepy" | "concerned";
  className?: string;
}

export function CatAvatar({ size = 120, mood = "calm", className }: Props) {
  // Quick tune knobs for line-art style
  const stroke = "#3D3530";
  const sw = 2;
  const detailSw = 1.5; // eyes/whiskers细节线宽
  const noseSw = 1.3;

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
        d="M 38 39 Q 30 52 33 72 Q 36 94 60 94 Q 84 94 87 72 Q 90 52 82 39"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* eyes */}
      {mood === "happy" ? (
        <>
          <path
            d="M 47 60 Q 50 56 53 60"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 67 60 Q 70 56 73 60"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : mood === "sleepy" ? (
        <>
          <path
            d="M 46 62 Q 50 64.5 54 62"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 66 62 Q 70 64.5 74 62"
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
            cy="62"
            r="2.1"
            stroke={stroke}
            strokeWidth={detailSw}
            fill="none"
          />
          <circle
            cx="70"
            cy="62"
            r="2.1"
            stroke={stroke}
            strokeWidth={detailSw}
            fill="none"
          />
        </>
      )}
      {/* nose */}
      <path
        d="M 58 70 L 62 70 L 60 73 Z"
        fill="none"
        stroke={stroke}
        strokeWidth={noseSw}
        strokeLinejoin="round"
      />
      {/* mouth */}
      {mood === "concerned" ? (
        <path
          d="M 56 80 Q 60 77 64 80"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M 56 76 Q 60 80 64 76"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {/* whiskers */}
      <path
        d="M 44 74 L 34 72"
        stroke={stroke}
        strokeWidth={detailSw}
        strokeLinecap="round"
      />
      <path
        d="M 44 78 L 33 79"
        stroke={stroke}
        strokeWidth={detailSw}
        strokeLinecap="round"
      />
      <path
        d="M 76 74 L 86 72"
        stroke={stroke}
        strokeWidth={detailSw}
        strokeLinecap="round"
      />
      <path
        d="M 76 78 L 87 79"
        stroke={stroke}
        strokeWidth={detailSw}
        strokeLinecap="round"
      />
    </svg>
  );
}
