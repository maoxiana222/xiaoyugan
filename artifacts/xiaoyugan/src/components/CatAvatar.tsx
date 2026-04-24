interface Props {
  size?: number;
  mood?: "calm" | "happy" | "sleepy" | "concerned";
  className?: string;
}

export function CatAvatar({ size = 120, mood = "calm", className }: Props) {
  const stroke = "#3D3530";
  const sw = 2.2;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      fill="none"
    >
      {/* ears — clean triangles */}
      <path
        d="M 38 38 L 44 18 L 56 32"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 82 38 L 76 18 L 64 32"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* head — soft squircle */}
      <path
        d="M 38 38 Q 30 50 32 70 Q 35 92 60 92 Q 85 92 88 70 Q 90 50 82 38"
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
            d="M 46 62 Q 50 65 54 62"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 66 62 Q 70 65 74 62"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <circle cx="50" cy="62" r="2" fill={stroke} />
          <circle cx="70" cy="62" r="2" fill={stroke} />
        </>
      )}
      {/* nose — tiny triangle */}
      <path
        d="M 58 70 L 62 70 L 60 73 Z"
        fill={stroke}
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* mouth — simple */}
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
    </svg>
  );
}
