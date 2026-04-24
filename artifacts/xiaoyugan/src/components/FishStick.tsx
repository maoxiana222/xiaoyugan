interface Props {
  size?: number;
  state?: "full" | "half" | "empty";
  className?: string;
}

export function FishStick({ size = 24, state = "full", className }: Props) {
  const stroke = "#3D3530";
  const dim = "#C9BFB0";
  const lineColor = state === "empty" ? dim : stroke;
  const sw = 1.6;

  return (
    <svg
      width={size}
      height={size * 0.45}
      viewBox="0 0 32 14"
      className={className}
      fill="none"
    >
      {/* body — leaf-like fish */}
      <path
        d="M 4 7 Q 4 1 14 1 Q 24 1 26 7 Q 24 13 14 13 Q 4 13 4 7 Z"
        stroke={lineColor}
        strokeWidth={sw}
        strokeLinejoin="round"
        fill="none"
      />
      {/* tail */}
      <path
        d="M 26 7 L 30 3 L 30 11 Z"
        stroke={lineColor}
        strokeWidth={sw}
        strokeLinejoin="round"
        fill="none"
      />
      {/* eye */}
      <circle cx="9" cy="6" r="0.9" fill={lineColor} />
      {state === "half" && (
        // half-fill as a small dot pattern indicating half
        <circle cx="18" cy="7" r="1.4" fill={lineColor} opacity="0.5" />
      )}
    </svg>
  );
}
