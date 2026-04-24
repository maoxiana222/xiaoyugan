import type { CyclePhase, Baseline } from "./storage";

// Page 1: Base energy 体质 (B)
export const B_OPTIONS = [
  {
    value: 10,
    label: "充电宝",
    hint: "续航极强，高压下依然能打",
  },
  {
    value: 7,
    label: "标准电池",
    hint: "正常作息下表现稳定，偶尔需要快充",
  },
  {
    value: 4,
    label: "易耗品",
    hint: "敏感细腻，能量像蒸气一样容易消散",
  },
] as const;

// Page 3: Daily load 浓度 (O_weight)
export const O_OPTIONS = [
  {
    value: 1.0,
    label: "轻盈",
    hint: "专注简单，较少被打断或切换身份",
  },
  {
    value: 0.7,
    label: "切换",
    hint: "在职场、家庭、自我间高频跳转",
  },
  {
    value: 0.6,
    label: "磨损",
    hint: "核心工作是沟通、安抚或处理冲突",
  },
] as const;

export const CYCLE_OPTIONS: { value: CyclePhase; multiplier: number; hint: string }[] = [
  { value: "月经期", multiplier: 0.8, hint: "需要好好对自己" },
  { value: "卵泡期", multiplier: 1.1, hint: "状态在回升" },
  { value: "排卵期", multiplier: 1.2, hint: "精力高峰" },
  { value: "黄体期", multiplier: 0.7, hint: "容易累，温柔点" },
  { value: "未追踪", multiplier: 1.0, hint: "暂不参与计算" },
];

export function cycleMultiplier(phase: CyclePhase): number {
  return CYCLE_OPTIONS.find((c) => c.value === phase)?.multiplier ?? 1.0;
}

// v3.1 formula: round(((B × 0.6) + (O_weight × 0.4 × 10)) × P_cycle, 0.5)
export function computeBaseline(B: number, O_weight: number, P_cycle: number): number {
  const raw = (B * 0.6 + O_weight * 0.4 * 10) * P_cycle;
  return clamp(roundToHalf(raw), 0, 10);
}

export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Calculate today's phase + multiplier from baseline data */
export function calculatePhase(b: Pick<Baseline, "last_period_start" | "cycle_days" | "period_days" | "skip_cycle">): {
  phase: CyclePhase;
  P_cycle: number;
} {
  if (b.skip_cycle || !b.last_period_start) {
    return { phase: "未追踪", P_cycle: 1.0 };
  }
  const today = new Date();
  const lastStart = new Date(b.last_period_start);
  if (lastStart > today) return { phase: "未追踪", P_cycle: 1.0 };

  const daysDiff = Math.floor((today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
  const T = b.cycle_days;
  const M = b.period_days;
  const D = ((daysDiff % T) + T) % T;

  if (D < M) return { phase: "月经期", P_cycle: 0.8 };
  if (D < T / 2 - 2) return { phase: "卵泡期", P_cycle: 1.1 };
  if (D < T / 2 + 2) return { phase: "排卵期", P_cycle: 1.2 };
  return { phase: "黄体期", P_cycle: 0.7 };
}

export function energyStatus(value: number): { label: string; tone: string } {
  if (value >= 9) return { label: "精力满满", tone: "text-[#E89A8F]" };
  if (value >= 7) return { label: "状态不错", tone: "text-[#E8A878]" };
  if (value >= 5) return { label: "还撑得住", tone: "text-[#C99B5B]" };
  if (value >= 3) return { label: "有点累了", tone: "text-[#A88B5C]" };
  if (value >= 1) return { label: "快没电了", tone: "text-[#9B6F5F]" };
  return { label: "需要休息", tone: "text-[#7B5F5F]" };
}

export function defaultSkippedBaseline(): Baseline {
  return {
    B: 7,
    O_weight: 1.0,
    P_cycle: 1.0,
    baseline: 10,
    computedAt: new Date().toISOString(),
    last_period_start: null,
    cycle_days: 28,
    period_days: 5,
    sleep_hours: 8.0,
    skip_cycle: true,
    skip_baseline: true,
  };
}
