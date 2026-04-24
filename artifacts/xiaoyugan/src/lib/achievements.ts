import type { Achievements, RecordEntry, TreeHoleMessage, BlindBoxEntry } from "./storage";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  records: RecordEntry[];
  messages: TreeHoleMessage[];
  blindbox: BlindBoxEntry[];
}

function uniqueDays(items: { date?: string; ts?: string }[]): string[] {
  const set = new Set<string>();
  for (const it of items) {
    const d = it.date ?? (it.ts ? it.ts.slice(0, 10) : "");
    if (d) set.add(d);
  }
  return [...set].sort();
}

function maxConsecutiveDays(days: string[]): number {
  if (days.length === 0) return 0;
  const sorted = [...days].sort();
  let best = 1;
  let curr = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]!);
    const cur = new Date(sorted[i]!);
    const diff = (cur.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      curr += 1;
      best = Math.max(best, curr);
    } else if (diff > 1) {
      curr = 1;
    }
  }
  return best;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_record",
    title: "第一条鱼干",
    description: "完成第一次记录",
    check: ({ records }) => records.length >= 1,
  },
  {
    id: "first_treehole",
    title: "第一次倾诉",
    description: "和小猫说说话",
    check: ({ messages }) => messages.some((m) => m.role === "user"),
  },
  {
    id: "first_blindbox",
    title: "第一个盲盒",
    description: "打开第一个恢复盲盒",
    check: ({ blindbox }) => blindbox.length >= 1,
  },
  {
    id: "blindbox_completed",
    title: "真的去做了",
    description: "完成一次盲盒行动",
    check: ({ blindbox }) => blindbox.some((b) => b.completed),
  },
  {
    id: "streak_3",
    title: "连续三天",
    description: "连续记录 3 天",
    check: ({ records }) => maxConsecutiveDays(uniqueDays(records)) >= 3,
  },
  {
    id: "streak_7",
    title: "一周陪伴",
    description: "连续记录 7 天",
    check: ({ records }) => maxConsecutiveDays(uniqueDays(records)) >= 7,
  },
  {
    id: "streak_30",
    title: "一个月一起",
    description: "连续记录 30 天",
    check: ({ records }) => maxConsecutiveDays(uniqueDays(records)) >= 30,
  },
  {
    id: "tree_talker",
    title: "树洞常客",
    description: "和小猫聊过 10 次",
    check: ({ messages }) => messages.filter((m) => m.role === "user").length >= 10,
  },
];

export function evaluateAchievements(
  ctx: AchievementContext,
  current: Achievements,
): { updated: Achievements; newlyUnlocked: AchievementDef[] } {
  const updated = { ...current };
  const newlyUnlocked: AchievementDef[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!current[a.id] && a.check(ctx)) {
      updated[a.id] = { unlockedAt: new Date().toISOString() };
      newlyUnlocked.push(a);
    }
  }
  return { updated, newlyUnlocked };
}
