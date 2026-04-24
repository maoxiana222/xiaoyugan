import { useEffect, useState, useCallback } from "react";

export type CyclePhase = "月经期" | "卵泡期" | "排卵期" | "黄体期" | "未追踪";

export interface Baseline {
  B: number;
  O_weight: number;
  P_cycle: number;
  baseline: number;
  computedAt: string;
}

export interface RecordEntry {
  id: string;
  date: string;
  time: string;
  delta: number;
  reason?: string;
  energyAfter: number;
}

export interface Profile {
  nickname: string;
  cyclePhase: CyclePhase;
}

export interface TreeHoleMessage {
  id: string;
  role: "user" | "cat";
  text: string;
  ts: string;
  crisis?: boolean;
}

export interface BlindBoxEntry {
  id: string;
  action: string;
  completed: boolean;
  ts: string;
}

export type Achievements = Record<string, { unlockedAt: string }>;

const KEYS = {
  baseline: "xiaoyugan_baseline",
  records: "xiaoyugan_records",
  profile: "xiaoyugan_profile",
  treehole: "xiaoyugan_treehole",
  blindbox: "xiaoyugan_blindbox",
  achievements: "xiaoyugan_achievements",
  triggersToday: "xiaoyugan_triggers_today",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("xiaoyugan-storage", { detail: { key } }));
  } catch {
    /* ignore quota errors */
  }
}

function useStored<T>(key: string, fallback: T): [T, (next: T) => void] {
  const [state, setState] = useState<T>(() => read(key, fallback));

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === key) {
        setState(read(key, fallback));
      }
    };
    window.addEventListener("xiaoyugan-storage", onChange);
    return () => window.removeEventListener("xiaoyugan-storage", onChange);
  }, [key]);

  const update = useCallback(
    (next: T) => {
      write(key, next);
      setState(next);
    },
    [key],
  );

  return [state, update];
}

export const useBaseline = () =>
  useStored<Baseline | null>(KEYS.baseline, null);

export const useRecords = () =>
  useStored<RecordEntry[]>(KEYS.records, []);

export const useProfile = () =>
  useStored<Profile>(KEYS.profile, { nickname: "你", cyclePhase: "未追踪" });

export const useTreeHole = () =>
  useStored<TreeHoleMessage[]>(KEYS.treehole, []);

export const useBlindBox = () =>
  useStored<BlindBoxEntry[]>(KEYS.blindbox, []);

export const useAchievements = () =>
  useStored<Achievements>(KEYS.achievements, {});

export function clearAllData(): void {
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  window.dispatchEvent(new CustomEvent("xiaoyugan-storage", { detail: { key: "*" } }));
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Daily-trigger tracking for subtraction permission
interface TriggersToday {
  date: string;
  triggered: number[];
  consecutiveConsume: number;
}

export function getTriggersToday(): TriggersToday {
  const v = read<TriggersToday>(KEYS.triggersToday, {
    date: todayKey(),
    triggered: [],
    consecutiveConsume: 0,
  });
  if (v.date !== todayKey()) {
    return { date: todayKey(), triggered: [], consecutiveConsume: 0 };
  }
  return v;
}

export function setTriggersToday(v: TriggersToday): void {
  write(KEYS.triggersToday, v);
}
