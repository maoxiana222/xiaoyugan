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

  // Cat mood by energy
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
          strokeWidth="1.5"
          strokeDasharray="2 4"
          fill="none"
          opacity="0.7"
        />
        {Array.from({ length: total }).map((_, i) => {
          const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          // The leftmost (index 5 visually at bottom) is "0" filling clockwise from top
          const filled = i < Math.ceil(value);
          const half = i === Math.floor(value) && value % 1 !== 0;
          return (
            <g
              key={i}
              transform={`translate(${x} ${y}) rotate(${(angle * 180) / Math.PI + 90})`}
            >
              <FishStick filled={filled && !half} half={half} />
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

function FishStick({ filled, half }: { filled: boolean; half: boolean }) {
  // A simple hand-drawn fish stick: rounded rectangle with two crosshatch lines
  const fill = half ? "#FFE4CC" : filled ? "#FFD4A8" : "#F0E8DD";
  const stroke = filled || half ? "#A88B5C" : "#C9BFB0";
  return (
    <g>
      <rect
        x="-9"
        y="-4"
        width="18"
        height="8"
        rx="3.5"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.4"
      />
      <line x1="-3" y1="-4" x2="-3" y2="4" stroke={stroke} strokeWidth="0.9" opacity="0.6" />
      <line x1="3" y1="-4" x2="3" y2="4" stroke={stroke} strokeWidth="0.9" opacity="0.6" />
    </g>
  );
}
