import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { FishStick } from "@/components/FishStick";
import {
  useBaseline,
  useRecords,
  useAchievements,
  todayKey,
  nowTime,
  newId,
  type RecordEntry,
} from "@/lib/storage";
import { roundToHalf, clamp } from "@/lib/baseline";
import { RESTORE_CATEGORIES, type RestoreCategory } from "@/lib/reasons";
import { evaluateAchievements } from "@/lib/achievements";
import { toast } from "sonner";

export default function AddDetail() {
  const [, setLocation] = useLocation();
  const [baseline] = useBaseline();
  const [records, setRecords] = useRecords();
  const [achievements, setAchievements] = useAchievements();
  const [category, setCategory] = useState<RestoreCategory | null>(null);
  const [detail, setDetail] = useState("");

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
    const delta = 0.5;
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

    sessionStorage.setItem("xiaoyugan_anim", "in");
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
            <FishStick size={28} state="full" />
            <span className="text-xl text-[#5C4A3F]">+0.5 鱼干</span>
          </div>
          <p className="mt-2 text-sm text-[#9B8F7F]">
            是什么让你今天有了点能量？
          </p>
        </div>

        <div className="mt-8">
          <p className="text-xs text-[#9B8F7F] mb-3">选择一个大类</p>
          <div className="flex flex-wrap gap-2">
            {RESTORE_CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2.5 rounded-full text-sm border-2 transition-colors ${
                    active
                      ? "bg-[#FFD4D4] border-[#E8A7A7] text-[#A86A6A]"
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
            placeholder="说说是什么让你有能量的~"
            rows={3}
            maxLength={80}
            className="w-full px-4 py-3 rounded-2xl bg-[#FCFCF9] border border-[#E8DDD2] text-sm text-[#5C4A3F] placeholder:text-[#B8AC9C] focus:outline-none focus:border-[#FFD4D4] resize-none"
          />
        </div>

        <button
          onClick={submit}
          disabled={!category}
          className="mt-8 w-full py-3.5 rounded-full bg-[#FFD4D4] text-[#A86A6A] text-base font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
        >
          记录 +0.5 条
        </button>
      </div>
    </PageContainer>
  );
}
