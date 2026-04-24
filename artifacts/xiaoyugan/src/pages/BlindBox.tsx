import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { CatAvatar } from "@/components/CatAvatar";
import { pickBlindBoxAction } from "@/lib/blindbox";
import {
  useBlindBox,
  useRecords,
  useAchievements,
  newId,
  todayKey,
  nowTime,
  type BlindBoxEntry,
} from "@/lib/storage";
import { evaluateAchievements } from "@/lib/achievements";
import { toast } from "sonner";

type Stage = "closed" | "opening" | "revealed" | "doing" | "done";

export default function BlindBox() {
  const [, setLocation] = useLocation();
  const [blindbox, setBlindbox] = useBlindBox();
  const [records, setRecords] = useRecords();
  const [achievements, setAchievements] = useAchievements();

  const [stage, setStage] = useState<Stage>("closed");
  const [action, setAction] = useState<string>("");
  const [entryId, setEntryId] = useState<string>("");
  const [countdown, setCountdown] = useState(30);

  function open() {
    const picked = pickBlindBoxAction();
    setAction(picked);
    setStage("opening");
    setTimeout(() => {
      setStage("revealed");
      const id = newId();
      setEntryId(id);
      const entry: BlindBoxEntry = {
        id,
        action: picked,
        completed: false,
        ts: new Date().toISOString(),
      };
      const next = [...blindbox, entry];
      setBlindbox(next);
      // Achievement: first blindbox
      const ev = evaluateAchievements(
        { records, messages: [], blindbox: next },
        achievements,
      );
      if (ev.newlyUnlocked.length > 0) {
        setAchievements(ev.updated);
        ev.newlyUnlocked.forEach((a) => toast(`解锁成就：${a.title}`, { description: a.description }));
      }
    }, 1100);
  }

  function startDoing() {
    setStage("doing");
    setCountdown(30);
  }

  function complete() {
    const lastEnergy = records.filter((r) => r.date === todayKey()).slice(-1)[0]?.energyAfter ?? 5;
    const newEnergy = Math.min(10, lastEnergy + 1);
    const next = blindbox.map((b) => (b.id === entryId ? { ...b, completed: true } : b));
    setBlindbox(next);
    const recNext = [
      ...records,
      {
        id: newId(),
        date: todayKey(),
        time: nowTime(),
        delta: 1,
        reason: `盲盒：${action}`,
        energyAfter: newEnergy,
      },
    ];
    setRecords(recNext);
    const ev = evaluateAchievements(
      { records: recNext, messages: [], blindbox: next },
      achievements,
    );
    if (ev.newlyUnlocked.length > 0) {
      setAchievements(ev.updated);
      ev.newlyUnlocked.forEach((a) => toast(`解锁成就：${a.title}`, { description: a.description }));
    }
    toast("+1 鱼干，谢谢你愿意尝试", { duration: 2000 });
    setStage("done");
  }

  // Countdown ticker
  useEffect(() => {
    if (stage !== "doing") return;
    if (countdown <= 0) {
      complete();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, countdown]);

  return (
    <PageContainer>
      <div className="px-5 pt-6 pb-4 flex items-center gap-2">
        <button
          onClick={() => setLocation("/")}
          className="p-1.5 rounded-full text-[#9B8F7F] hover:text-[#A86A6A]"
          aria-label="返回"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-medium text-[#5C4A3F]">恢复盲盒</h1>
      </div>

      <div className="px-5 pt-8 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {stage === "closed" && (
            <motion.div
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <CatAvatar size={100} mood="calm" />
              <p className="mt-6 text-sm text-[#7B6F5F] max-w-[280px] leading-relaxed">
                里面装的是一些很小的事，做起来不费力，但能给你 +1 条鱼干。
              </p>
              <Box />
              <button
                onClick={open}
                className="mt-8 px-8 py-3.5 rounded-full bg-[#FFD4D4] text-[#A86A6A] font-medium shadow-sm active:scale-95 transition-transform"
              >
                打开盲盒
              </button>
            </motion.div>
          )}

          {stage === "opening" && (
            <motion.div
              key="opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: [-8, 8, -8, 8, 0] }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <Box />
              </motion.div>
              <p className="mt-4 text-sm text-[#9B8F7F]">摇一摇...</p>
            </motion.div>
          )}

          {stage === "revealed" && (
            <motion.div
              key="revealed"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="flex flex-col items-center"
            >
              <div className="mt-6 px-8 py-12 rounded-3xl bg-[#FFF4CC] border-2 border-[#F0DFA8] shadow-md max-w-[320px]">
                <p className="text-xs text-[#9B8F7F] mb-3">今天的小行动</p>
                <p className="text-2xl text-[#5C4A3F] leading-relaxed">{action}</p>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setLocation("/")}
                  className="px-6 py-2.5 rounded-full bg-[#FCFCF9] border border-[#E8DDD2] text-[#9B8F7F] text-sm active:scale-95 transition-transform"
                >
                  下次吧
                </button>
                <button
                  onClick={startDoing}
                  className="px-6 py-2.5 rounded-full bg-[#FFD4D4] text-[#A86A6A] text-sm font-medium active:scale-95 transition-transform"
                >
                  去做
                </button>
              </div>
            </motion.div>
          )}

          {stage === "doing" && (
            <motion.div
              key="doing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <CatAvatar size={80} mood="calm" />
              <p className="mt-6 text-sm text-[#9B8F7F]">正在做：</p>
              <p className="text-xl text-[#5C4A3F] mt-2 max-w-[280px] leading-relaxed">{action}</p>
              <div className="mt-8 relative w-32 h-32">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="#F0E8DD" strokeWidth="4" fill="none" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="#FFD4D4"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(2 * Math.PI * 44 * (30 - countdown)) / 30} ${2 * Math.PI * 44}`}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-light text-[#5C4A3F]">{countdown}</span>
                </div>
              </div>
              <button
                onClick={complete}
                className="mt-8 px-6 py-2.5 rounded-full bg-[#FFD4D4] text-[#A86A6A] text-sm font-medium active:scale-95 transition-transform"
              >
                做完了
              </button>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
              className="flex flex-col items-center"
            >
              <CatAvatar size={120} mood="happy" />
              <p className="mt-6 text-base text-[#5C4A3F]">谢谢你愿意尝试</p>
              <p className="text-sm text-[#9B8F7F] mt-1">+1 条小鱼干已经记下了</p>
              <button
                onClick={() => setLocation("/")}
                className="mt-8 px-8 py-3 rounded-full bg-[#FFD4D4] text-[#A86A6A] text-sm font-medium active:scale-95 transition-transform"
              >
                回主页
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

function Box() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mt-6">
      <rect x="20" y="48" width="80" height="58" rx="6" fill="#FFD4D4" stroke="#A86A6A" strokeWidth="2.4" />
      <rect x="14" y="40" width="92" height="18" rx="5" fill="#FFE4CC" stroke="#A86A6A" strokeWidth="2.4" />
      <rect x="55" y="40" width="10" height="66" fill="#FFB3B3" stroke="#A86A6A" strokeWidth="1.8" />
      <path
        d="M 50 30 Q 45 18 55 18 Q 60 24 60 30 M 60 30 Q 60 24 65 18 Q 75 18 70 30"
        stroke="#A86A6A"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
