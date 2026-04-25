import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { FishStick } from "@/components/FishStick";
import {
  useBaseline,
  useRecords,
  useProfile,
  useAchievements,
  todayKey,
  nowTime,
  newId,
  getTriggersToday,
  setTriggersToday,
  type RecordEntry,
} from "@/lib/storage";
import { roundToHalf, clamp } from "@/lib/baseline";
import { CONSUME_CATEGORIES, type ConsumeCategory } from "@/lib/reasons";
import { evaluateAchievements } from "@/lib/achievements";
import { toast } from "sonner";

export default function SubtractDetail() {
  const [, setLocation] = useLocation();
  const [baseline] = useBaseline();
  const [records, setRecords] = useRecords();
  const [profile] = useProfile();
  const [achievements, setAchievements] = useAchievements();
  const [category, setCategory] = useState<ConsumeCategory | null>(null);
  const [detail, setDetail] = useState("");

  // Order categories by recent (last 14 days) energy_killers ranking
  const orderedCategories = useMemo<ConsumeCategory[]>(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const counts = new Map<ConsumeCategory, number>();
    for (const r of records) {
      if (r.delta >= 0) continue;
      if (!r.category) continue;
      if (!CONSUME_CATEGORIES.includes(r.category as ConsumeCategory)) continue;
      const d = new Date(`${r.date}T00:00:00`);
      if (d < cutoff) continue;
      const c = r.category as ConsumeCategory;
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const ranked = [...CONSUME_CATEGORIES].sort((a, b) => {
      const ca = counts.get(a) ?? 0;
      const cb = counts.get(b) ?? 0;
      if (cb !== ca) return cb - ca;
      // keep "其他" last when tied
      if (a === "其他") return 1;
      if (b === "其他") return -1;
      return 0;
    });
    return ranked;
  }, [records]);

  useEffect(() => {
    if (!baseline) setLocation("/welcome");
  }, [baseline, setLocation]);

  if (!baseline) return null;

  const todayRecords = records.filter((r) => r.date === todayKey());
  const lastRecord = todayRecords[todayRecords.length - 1];
  const currentEnergy = lastRecord ? lastRecord.energyAfter : baseline.baseline;

  function submit() {
    if (!category) {
      toast("先选一个大类吧~");
      return;
    }
    const delta = -0.5;
    const newEnergy = clamp(roundToHalf(currentEnergy + delta), 0, 10);
    const trimmed = detail.trim();
    const entry: RecordEntry = {
      id: newId(),
      date: todayKey(),
      time: nowTime(),
      delta,
      reason: trimmed || category,
      energyAfter: newEnergy,
      category,
      detail: trimmed || undefined,
    };
    const next = [...records, entry];
    setRecords(next);

    const { updated, newlyUnlocked } = evaluateAchievements(
      { records: next, messages: [], blindbox: [] },
      achievements,
    );
    if (newlyUnlocked.length > 0) {
      setAchievements(updated);
      newlyUnlocked.forEach((a) =>
        toast(`解锁成就：${a.title}`, { description: a.description }),
      );
    }

    // Subtraction permission triggers (same logic as HomeScreen)
    const t = getTriggersToday();
    const consumeStreak = countConsecutiveConsume(next);
    const triggered = [...t.triggered];
    let nudge: string | null = null;
    if (newEnergy <= 2 && !triggered.includes(1)) {
      nudge = "今天的鱼干很少了，要不要早点休息？";
      triggered.push(1);
    } else if (consumeStreak >= 3 && !triggered.includes(2)) {
      nudge = "今天好像一直在消耗，给自己留点鱼干？";
      triggered.push(2);
    } else if (
      (profile.cyclePhase === "黄体期" || profile.cyclePhase === "月经期") &&
      !triggered.includes(3)
    ) {
      nudge = `现在是${profile.cyclePhase}，本来就比较累，对自己温柔点。`;
      triggered.push(3);
    }
    setTriggersToday({ ...t, triggered, consecutiveConsume: consumeStreak });
    if (nudge) sessionStorage.setItem("xiaoyugan_nudge", nudge);

    sessionStorage.setItem("xiaoyugan_anim", "out");
    setLocation("/");
  }

  return (
    <PageContainer withTabs={false}>
      <div className="px-6 pt-6 pb-10">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-1 text-sm text-[#9B8F7F] active:opacity-60"
        >
          <ArrowLeft size={16} />
          返回
        </button>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2">
            <FishStick size={28} state="empty" />
            <span className="text-xl text-[#5C4A3F]">−0.5 鱼干</span>
          </div>
          <p className="mt-2 text-sm text-[#9B8F7F]">
            发生了什么让你有点累？
          </p>
        </div>

        <div className="mt-8">
          <p className="text-xs text-[#9B8F7F] mb-3">选择一个大类（高频在前）</p>
          <div className="flex flex-wrap gap-2">
            {orderedCategories.map((c) => {
              const active = category === c;
              return (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2.5 rounded-full text-sm border-2 transition-colors ${
                    active
                      ? "bg-[#FFE4CC] border-[#E8B894] text-[#A86A4F]"
                      : "bg-[#FCFCF9] border-[#E8DDD2] text-[#5C4A3F]"
                  }`}
                >
                  {c}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs text-[#9B8F7F] mb-3">具体是什么呢（可不填）</p>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="发生了什么让你有点累？"
            rows={3}
            maxLength={80}
            className="w-full px-4 py-3 rounded-2xl bg-[#FCFCF9] border border-[#E8DDD2] text-sm text-[#5C4A3F] placeholder:text-[#B8AC9C] focus:outline-none focus:border-[#FFE4CC] resize-none"
          />
        </div>

        <button
          onClick={submit}
          disabled={!category}
          className="mt-8 w-full py-3.5 rounded-full bg-[#FFE4CC] text-[#A86A4F] text-base font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
        >
          记录 -0.5 条
        </button>
      </div>
    </PageContainer>
  );
}

function countConsecutiveConsume(rs: RecordEntry[]): number {
  const today = rs.filter((r) => r.date === todayKey() && r.delta !== 0);
  let count = 0;
  for (let i = today.length - 1; i >= 0; i--) {
    if (today[i]!.delta < 0) count++;
    else break;
  }
  return count;
}
