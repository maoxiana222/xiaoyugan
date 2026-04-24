import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { B_OPTIONS, O_OPTIONS, CYCLE_OPTIONS, computeBaseline } from "@/lib/baseline";
import { useBaseline, useProfile, useRecords, todayKey, nowTime, newId } from "@/lib/storage";
import { PageContainer } from "@/components/PageContainer";
import { CatAvatar } from "@/components/CatAvatar";
import type { CyclePhase } from "@/lib/storage";

export default function Baseline() {
  const [, setLocation] = useLocation();
  const [, setBaseline] = useBaseline();
  const [profile, setProfile] = useProfile();
  const [records, setRecords] = useRecords();

  const [step, setStep] = useState(1);
  const [B, setB] = useState<number | null>(null);
  const [O, setO] = useState<number | null>(null);
  const [phase, setPhase] = useState<CyclePhase | null>(null);

  const P = phase ? CYCLE_OPTIONS.find((c) => c.value === phase)!.multiplier : 1.0;
  const score = B !== null && O !== null ? computeBaseline(B, O, P) : 0;

  function next() {
    if (step < 4) setStep(step + 1);
  }
  function back() {
    if (step > 1) setStep(step - 1);
  }
  function finish() {
    if (B === null || O === null || phase === null) return;
    const ts = new Date().toISOString();
    setBaseline({ B, O_weight: O, P_cycle: P, baseline: score, computedAt: ts });
    setProfile({ ...profile, cyclePhase: phase });
    // Seed today's record so the home shows the baseline
    setRecords([
      ...records,
      {
        id: newId(),
        date: todayKey(),
        time: nowTime(),
        delta: 0,
        reason: "基线测算",
        energyAfter: score,
      },
    ]);
    setLocation("/");
  }

  return (
    <PageContainer withTabs={false}>
      <div className="px-6 pt-12 pb-10">
        {/* progress dots */}
        <div className="flex justify-center gap-1.5 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step ? "w-8 bg-[#E89A8F]" : s < step ? "w-3 bg-[#FFD4D4]" : "w-3 bg-[#E8DDD2]"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <StepCard
                title="昨晚睡了几小时？"
                subtitle="先看看身体的真实状态"
                options={B_OPTIONS.map((o) => ({
                  key: String(o.value),
                  label: o.label,
                  hint: o.hint,
                  selected: B === o.value,
                  onClick: () => setB(o.value),
                }))}
              />
            )}
            {step === 2 && (
              <StepCard
                title="今天醒来感觉？"
                subtitle="主观状态也很重要"
                options={O_OPTIONS.map((o) => ({
                  key: String(o.value),
                  label: o.label,
                  hint: o.hint,
                  selected: O === o.value,
                  onClick: () => setO(o.value),
                }))}
              />
            )}
            {step === 3 && (
              <StepCard
                title="现在处于哪个阶段？"
                subtitle="不同阶段的精力本就不同"
                options={CYCLE_OPTIONS.map((o) => ({
                  key: o.value,
                  label: o.value,
                  hint: o.hint,
                  selected: phase === o.value,
                  onClick: () => setPhase(o.value),
                }))}
              />
            )}
            {step === 4 && (
              <div className="flex flex-col items-center text-center pt-4">
                <CatAvatar size={120} mood={score >= 6 ? "happy" : score >= 3 ? "calm" : "sleepy"} />
                <p className="mt-6 text-[#7B6F5F] text-sm">今天我们从这里开始</p>
                <div className="my-4">
                  <span className="text-6xl font-light text-[#A86A6A]">
                    {score.toFixed(1)}
                  </span>
                  <span className="ml-2 text-[#9B8F7F]">条小鱼干</span>
                </div>
                <p className="text-xs text-[#9B8F7F] max-w-[260px] leading-relaxed">
                  这个数会随着今天的消耗和补充慢慢变化。
                  <br />
                  长按按钮可以记录具体发生了什么。
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 1}
            className="text-sm text-[#9B8F7F] disabled:opacity-30 px-4 py-2"
          >
            返回
          </button>
          {step < 4 ? (
            <button
              onClick={next}
              disabled={
                (step === 1 && B === null) ||
                (step === 2 && O === null) ||
                (step === 3 && phase === null)
              }
              className="px-8 py-3 rounded-full bg-[#FFD4D4] text-[#5C4A3F] text-sm font-medium shadow-sm active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
            >
              下一步
            </button>
          ) : (
            <button
              onClick={finish}
              className="px-8 py-3 rounded-full bg-[#FFD4D4] text-[#5C4A3F] text-sm font-medium shadow-sm active:scale-95 transition-transform"
            >
              开始今天
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function StepCard({
  title,
  subtitle,
  options,
}: {
  title: string;
  subtitle: string;
  options: { key: string; label: string; hint: string; selected: boolean; onClick: () => void }[];
}) {
  return (
    <div>
      <h2 className="text-2xl font-medium text-[#5C4A3F] tracking-wide">{title}</h2>
      <p className="mt-2 text-sm text-[#9B8F7F]">{subtitle}</p>
      <div className="mt-8 space-y-3">
        {options.map((o) => (
          <button
            key={o.key}
            onClick={o.onClick}
            className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
              o.selected
                ? "border-[#E89A8F] bg-[#FFF4EE] shadow-sm"
                : "border-[#E8DDD2] bg-[#FCFCF9] hover:border-[#FFD4D4]"
            }`}
          >
            <div className="text-base text-[#5C4A3F] font-medium">{o.label}</div>
            <div className="text-xs text-[#9B8F7F] mt-1">{o.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
