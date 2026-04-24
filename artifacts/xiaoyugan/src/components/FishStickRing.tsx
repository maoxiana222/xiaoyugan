import { CatAvatar } from "./CatAvatar";

interface Props {
  value: number; // 0..10
  size?: number;
}

export function FishStickRing({ value, size = 280 }: Props) {
  const total = 10;
  const radius = size / 2 - 30;
  const cx = size / 2;
  const cy = size / 2;

  const mood: "happy" | "calm" | "sleepy" | "concerned" =
    value >= 8 ? "happy" : value >= 5 ? "calm" : value >= 2 ? "sleepy" : "concerned";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        {/* outer ring decorative */}
        <circle
          cx={cx}
          cy={cy}
          r={radius + 14}
          stroke="#E8DDD2"
          strokeWidth="1"
          strokeDasharray="2 5"
          fill="none"
          opacity="0.7"
        />
        {Array.from({ length: total }).map((_, i) => {
          const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          const filled = i < Math.floor(value);
          const half = i === Math.floor(value) && value % 1 !== 0;
          return (
            <g
              key={i}
              transform={`translate(${x} ${y}) rotate(${(angle * 180) / Math.PI + 90})`}
            >
              <FishStickIcon state={filled ? "full" : half ? "half" : "empty"} />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <CatAvatar size={size * 0.45} mood={mood} />
      </div>
    </div>
  );
}

function FishStickIcon({ state }: { state: "full" | "half" | "empty" }) {
  const stroke = "#3D3530";
  const dim = "#C9BFB0";
  const color = state === "empty" ? dim : stroke;
  const sw = 1.5;
  return (
    <g transform="translate(-13 -5)">
      {/* body */}
      <path
        d="M 3 5 Q 3 0 11 0 Q 19 0 21 5 Q 19 10 11 10 Q 3 10 3 5 Z"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        fill="none"
      />
      {/* tail */}
      <path
        d="M 21 5 L 25 1.5 L 25 8.5 Z"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        fill="none"
      />
      {/* eye */}
      <circle cx="7" cy="4.5" r="0.8" fill={color} />
      {state === "half" && (
        <circle cx="14" cy="5" r="1.2" fill={color} opacity="0.5" />
      )}
    </g>
  );
}
