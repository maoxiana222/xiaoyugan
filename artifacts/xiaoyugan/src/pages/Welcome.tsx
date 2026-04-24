import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/PageContainer";
import { CatAvatar } from "@/components/CatAvatar";
import { FishStick } from "@/components/FishStick";
import { useBaseline, useRecords, todayKey, nowTime, newId } from "@/lib/storage";
import { defaultSkippedBaseline } from "@/lib/baseline";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [, setBaseline] = useBaseline();
  const [records, setRecords] = useRecords();

  function skipAll() {
    const b = defaultSkippedBaseline();
    setBaseline(b);
    setRecords([
      ...records,
      {
        id: newId(),
        date: todayKey(),
        time: nowTime(),
        delta: 0,
        reason: "跳过基线",
        energyAfter: b.baseline,
      },
    ]);
    setLocation("/");
  }

  return (
    <PageContainer withTabs={false}>
      <div className="px-6 pt-12 pb-10 flex flex-col items-center min-h-screen">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14 }}
        >
          <CatAvatar size={140} mood="happy" />
        </motion.div>

        {/* speech bubble */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="relative mt-6 mx-2 px-6 py-5 rounded-3xl bg-[#FFF4CC] border border-[#F0DFA8] max-w-[340px]"
        >
          <span
            aria-hidden
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-[#FFF4CC] border-l border-t border-[#F0DFA8]"
          />
          <p className="text-[14.5px] leading-[1.95] text-[#5C4A3F] text-center whitespace-pre-line">
            {`欢迎来到小鱼干

我是你的陪伴小猫
我们用「小鱼干」来代表精力
鱼干越多 越充沛
鱼干越少 越需要照顾

先了解一下你的能量基线吧`}
          </p>
        </motion.div>

        <div className="flex-1" />

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="w-full max-w-[320px] flex flex-col items-center gap-4 mt-10"
        >
          <button
            onClick={() => setLocation("/baseline")}
            className="w-full py-3.5 rounded-full bg-[#FFD4D4] text-[#5C4A3F] text-[15px] font-medium shadow-sm active:scale-[0.97] transition-transform"
          >
            开始体检
          </button>
          <button
            onClick={skipAll}
            className="text-xs text-[#9B8F7F] underline-offset-4 hover:underline"
          >
            跳过，直接进入
          </button>
        </motion.div>

        {/* progress fish-sticks: empty outlines */}
        <div className="mt-8 flex items-center gap-3 opacity-60">
          {[0, 1, 2, 3].map((i) => (
            <FishStick key={i} size={28} state="empty" />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
