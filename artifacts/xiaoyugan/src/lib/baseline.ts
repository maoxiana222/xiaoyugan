import type { CyclePhase } from "./storage";

export const B_OPTIONS = [
  { value: 4, label: "少于 5 小时", hint: "睡眠不足" },
  { value: 7, label: "5 至 7 小时", hint: "还可以" },
  { value: 10, label: "7 小时以上", hint: "睡得不错" },
] as const;

export const O_OPTIONS = [
  { value: 1.0, label: "满血复活", hint: "今天能打" },
  { value: 0.7, label: "还行能凑合", hint: "勉强出门" },
  { value: 0.6, label: "想再睡 8 小时", hint: "起不来" },
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
  // Round to nearest 0.5
  const rounded = Math.round(raw * 2) / 2;
  return Math.max(0, Math.min(10, rounded));
}

export function energyStatus(value: number): { label: string; tone: string } {
  if (value >= 9) return { label: "精力满满", tone: "text-[#E89A8F]" };
  if (value >= 7) return { label: "状态不错", tone: "text-[#E8A878]" };
  if (value >= 5) return { label: "还撑得住", tone: "text-[#C99B5B]" };
  if (value >= 3) return { label: "有点累了", tone: "text-[#A88B5C]" };
  if (value >= 1) return { label: "快没电了", tone: "text-[#9B6F5F]" };
  return { label: "需要休息", tone: "text-[#7B5F5F]" };
}
