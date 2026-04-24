import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Trophy, Gift } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { PageContainer } from "@/components/PageContainer";
import { FishStickRing } from "@/components/FishStickRing";
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
import { energyStatus, calculatePhase, computeBaseline, roundToHalf, clamp } from "@/lib/baseline";
import { CONSUME_REASONS, RESTORE_REASONS } from "@/lib/reasons";
import { evaluateAchievements } from "@/lib/achievements";
import { toast } from "sonner";

export default function HomeScreen() {
  const [, setLocation] = useLocation();
  const [baseline, setBaseline] = useBaseline();
  const [records, setRecords] = useRecords();
  const [profile, setProfile] = useProfile();
  const [achievements, setAchievements] = useAchievements();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"consume" | "restore">("consume");
  const [softNudge, setSoftNudge] = useState<string | null>(null);

  // Redirect to welcome if not yet completed
  useEffect(() => {
    if (!baseline) setLocation("/welcome");
  }, [baseline, setLocation]);

  // Daily phase recompute (per PRD 1.6) — runs once per day on mount
  useEffect(() => {
    if (!baseline) return;
    const today = todayKey();
    const hasTodayRecord = records.some((r) => r.date === today);
    if (hasTodayRecord) return;
    // recalculate phase + initial energy for the new day
    const { phase, P_cycle } = calculatePhase(baseline);
    const newInitial = computeBaseline(baseline.B, baseline.O_weight, P_cycle);
    setBaseline({ ...baseline, P_cycle, baseline: newInitial });
    if (phase !== profile.cyclePhase) setProfile({ ...profile, cyclePhase: phase });
    setRecords([
      ...records,
      {
        id: newId(),
        date: today,
        time: nowTime(),
        delta: 0,
        reason: "今日开启",
        energyAfter: newInitial,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!baseline) return null;

  const todayRecords = records.filter((r) => r.date === todayKey());
  const lastRecord = todayRecords[todayRecords.length - 1];
  const currentEnergy = lastRecord ? lastRecord.energyAfter : baseline.baseline;
  const status = energyStatus(currentEnergy);

  function applyDelta(delta: number, reason?: string) {
    const newEnergy = clamp(roundToHalf(currentEnergy + delta), 0, 10);
    const entry: RecordEntry = {
      id: newId(),
      date: todayKey(),
      time: nowTime(),
      delta,
      reason,
      energyAfter: newEnergy,
    };
    const next = [...records, entry];
    setRecords(next);

    // Achievements
    const { updated, newlyUnlocked } = evaluateAchievements(
      { records: next, messages: [], blindbox: [] },
      achievements,
    );
    if (newlyUnlocked.length > 0) {
      setAchievements(updated);
      newlyUnlocked.forEach((a) => {
        toast(`解锁成就：${a.title}`, { description: a.description });
      });
    }

    // Subtraction permission triggers
    if (delta < 0) {
      const t = getTriggersToday();
      const consumeStreak = countConsecutiveConsume(next);
      const triggered = [...t.triggered];
      let nudge: string | null = null;
      // Priority 1: low energy
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
      if (nudge) {
        setSoftNudge(nudge);
        setTimeout(() => setSoftNudge(null), 8000);
      }
    }
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

  // Long-press detection
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  function startPress(mode: "consume" | "restore") {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      setDrawerMode(mode);
      setDrawerOpen(true);
      if ("vibrate" in navigator) navigator.vibrate?.(30);
    }, 600);
  }

  function endPress(mode: "consume" | "restore") {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    if (!longPressed.current) {
      // simple click — step is 0.5 per PRD
      const delta = mode === "consume" ? -0.5 : 0.5;
      applyDelta(delta);
      toast(mode === "consume" ? "−0.5 鱼干" : "+0.5 鱼干", {
        duration: 1500,
        position: "top-center",
      });
    }
    longPressed.current = false;
  }

  function cancelPress() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    longPressed.current = false;
  }

  function chooseReason(reason: string) {
    const delta = drawerMode === "consume" ? -0.5 : 0.5;
    applyDelta(delta, reason);
    setDrawerOpen(false);
    toast(`${drawerMode === "consume" ? "−0.5" : "+0.5"}　${reason}`, {
      duration: 1800,
      position: "top-center",
    });
  }

  return (
    <PageContainer>
      <div className="px-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setLocation("/profile")}
            className="text-xs text-[#9B8F7F] px-3 py-1.5 rounded-full bg-[#FCFCF9] border border-[#E8DDD2]"
          >
            {profile.cyclePhase} · ×{baseline.P_cycle}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setLocation("/achievements")}
              className="p-2 rounded-full text-[#9B8F7F] hover:text-[#A86A6A] transition-colors"
              aria-label="成就"
            >
              <Trophy size={18} />
            </button>
            <button
              onClick={() => setLocation("/profile")}
              className="p-2 rounded-full text-[#9B8F7F] hover:text-[#A86A6A] transition-colors"
              aria-label="设置"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="text-center mt-2">
          <p className="text-sm text-[#9B8F7F]">今天的小鱼干</p>
        </div>

        {/* Ring + cat */}
        <div className="flex justify-center mt-6">
          <FishStickRing value={currentEnergy} size={300} />
        </div>

        {/* Status text */}
        <div className="text-center mt-2">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-light text-[#5C4A3F]">{currentEnergy.toFixed(1)}</span>
            <span className="text-sm text-[#9B8F7F]">/ 10</span>
          </div>
          <p className={`mt-1 text-sm ${status.tone}`}>{status.label}</p>
        </div>

        {/* +/- buttons */}
        <div className="mt-8 flex items-center justify-center gap-12">
          <PressButton
            label="−"
            color="#FFE4CC"
            textColor="#A86A6A"
            onPressStart={() => startPress("consume")}
            onPressEnd={() => endPress("consume")}
            onCancel={cancelPress}
          />
          <PressButton
            label="＋"
            color="#FFD4D4"
            textColor="#A86A6A"
            onPressStart={() => startPress("restore")}
            onPressEnd={() => endPress("restore")}
            onCancel={cancelPress}
          />
        </div>

        <p className="text-center text-xs text-[#9B8F7F] mt-4">
          轻点 ±0.5，长按记录原因
        </p>

        {/* Blind box hint when low */}
        {currentEnergy <= 3 && (
          <button
            onClick={() => setLocation("/blindbox")}
            className="mt-6 mx-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FFF4CC] border border-[#F0DFA8] text-sm text-[#7B6233] active:scale-[0.98] transition-transform"
          >
            <Gift size={16} />
            鱼干快没了，要不要开个盲盒？
          </button>
        )}

        {/* Today's quick stats */}
        {todayRecords.length > 1 && (
          <div className="mt-8 mx-auto max-w-[320px] p-4 rounded-2xl bg-[#FCFCF9] border border-[#E8DDD2]">
            <p className="text-xs text-[#9B8F7F] mb-2">今天 · {todayRecords.length - 1} 次记录</p>
            <div className="flex flex-wrap gap-1.5">
              {todayRecords.slice(-6).map((r) => (
                <span
                  key={r.id}
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    r.delta < 0
                      ? "bg-[#FFE4CC] text-[#A86A4F]"
                      : r.delta > 0
                        ? "bg-[#FFD4D4] text-[#A86A6A]"
                        : "bg-[#F0E8DD] text-[#9B8F7F]"
                  }`}
                >
                  {r.time} {r.delta > 0 ? "+" : ""}
                  {r.delta} {r.reason ?? ""}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Soft nudge */}
      <AnimatePresence>
        {softNudge && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 max-w-[400px] mx-auto z-30"
          >
            <div className="mx-4 px-5 py-4 rounded-2xl bg-[#FFF4CC] border border-[#F0DFA8] shadow-md flex items-start gap-3">
              <p className="text-sm text-[#7B6233] flex-1 leading-relaxed">{softNudge}</p>
              <button
                onClick={() => setSoftNudge(null)}
                className="text-xs text-[#9B8F7F] mt-0.5"
              >
                知道了
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reason drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-[#FCFCF9] border-[#E8DDD2]">
          <DrawerHeader>
            <DrawerTitle className="text-[#5C4A3F] text-center">
              {drawerMode === "consume" ? "因为什么消耗了？" : "因为什么补回了？"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {(drawerMode === "consume" ? CONSUME_REASONS : RESTORE_REASONS).map((r) => (
                <button
                  key={r}
                  onClick={() => chooseReason(r)}
                  className={`px-4 py-2.5 rounded-full text-sm border-2 active:scale-95 transition-transform ${
                    drawerMode === "consume"
                      ? "bg-[#FFE4CC] border-[#F0CFA8] text-[#A86A4F]"
                      : "bg-[#FFD4D4] border-[#F0B5B5] text-[#A86A6A]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <CustomReasonInput onSubmit={chooseReason} />
          </div>
        </DrawerContent>
      </Drawer>
    </PageContainer>
  );
}

function CustomReasonInput({ onSubmit }: { onSubmit: (r: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="mt-5 flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="或者写点别的..."
        className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F5F0] border border-[#E8DDD2] text-sm text-[#5C4A3F] placeholder:text-[#B8AC9C] focus:outline-none focus:border-[#FFD4D4]"
        maxLength={40}
      />
      <button
        onClick={() => {
          if (value.trim()) {
            onSubmit(value.trim());
            setValue("");
          }
        }}
        disabled={!value.trim()}
        className="px-5 py-2.5 rounded-full bg-[#FFD4D4] text-[#5C4A3F] text-sm font-medium disabled:opacity-40"
      >
        记下
      </button>
    </div>
  );
}

interface PressButtonProps {
  label: string;
  color: string;
  textColor: string;
  onPressStart: () => void;
  onPressEnd: () => void;
  onCancel: () => void;
}

function PressButton({ label, color, textColor, onPressStart, onPressEnd, onCancel }: PressButtonProps) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onPressStart();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        onPressEnd();
      }}
      onPointerLeave={onCancel}
      onPointerCancel={onCancel}
      className="select-none w-20 h-20 rounded-full shadow-md active:scale-90 transition-transform flex items-center justify-center text-3xl font-light"
      style={{ backgroundColor: color, color: textColor }}
    >
      {label}
    </button>
  );
}
