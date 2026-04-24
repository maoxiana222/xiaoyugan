import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { B_OPTIONS, O_OPTIONS, computeBaseline, calculatePhase } from "@/lib/baseline";
import { useBaseline, useRecords, useProfile, todayKey, nowTime, newId } from "@/lib/storage";
import { PageContainer } from "@/components/PageContainer";
import { FishStick } from "@/components/FishStick";

export default function Baseline() {
  const [, setLocation] = useLocation();
  const [, setBaseline] = useBaseline();
  const [profile, setProfile] = useProfile();
  const [records, setRecords] = useRecords();

  const [step, setStep] = useState(1);
  const [B, setB] = useState<number | null>(null);
  const [O, setO] = useState<number | null>(null);
  // page 2
  const [lastPeriodStart, setLastPeriodStart] = useState<string>("");
  const [cycleDays, setCycleDays] = useState<number>(28);
  const [periodDays, setPeriodDays] = useState<number>(5);
  const [skipCycle, setSkipCycle] = useState<boolean>(false);
  // page 4
  const [sleepHours, setSleepHours] = useState<number>(8.0);

  const todayStr = todayKey();
  const threeYearsAgo = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 3);
    return d.toISOString().slice(0, 10);
  })();

  const periodError = !skipCycle && lastPeriodStart && periodDays >= cycleDays
    ? "经期天数不能大于等于周期天数哦"
    : "";

  function next() {
    if (step < 4) setStep(step + 1);
    else finish();
  }
  function back() {
    if (step > 1) setStep(step - 1);
  }
  function skipStep2() {
    setLastPeriodStart("");
    setCycleDays(28);
    setPeriodDays(5);
    setSkipCycle(true);
    setStep(3);
  }

  function canNext(): boolean {
    if (step === 1) return B !== null;
    if (step === 2) {
      if (skipCycle) return true;
      if (!lastPeriodStart) return true; // allow proceeding; will treat as skip
      return !periodError;
    }
    if (step === 3) return O !== null;
    if (step === 4) return true;
    return false;
  }

  function finish() {
    if (B === null || O === null) return;
    const skip = skipCycle || !lastPeriodStart;
    const { phase, P_cycle } = calculatePhase({
      last_period_start: skip ? null : lastPeriodStart,
      cycle_days: cycleDays,
      period_days: periodDays,
      skip_cycle: skip,
    });
    const baselineValue = computeBaseline(B, O, P_cycle);
    const ts = new Date().toISOString();
    setBaseline({
      B,
      O_weight: O,
      P_cycle,
      baseline: baselineValue,
      computedAt: ts,
      last_period_start: skip ? null : lastPeriodStart,
      cycle_days: cycleDays,
      period_days: periodDays,
      sleep_hours: sleepHours,
      skip_cycle: skip,
    });
    setProfile({ ...profile, cyclePhase: phase });
    setRecords([
      ...records,
      {
        id: newId(),
        date: todayKey(),
        time: nowTime(),
        delta: 0,
        reason: "基线测算",
        energyAfter: baselineValue,
      },
    ]);
    setLocation("/baseline-result");
  }

  return (
    <PageContainer withTabs={false}>
      <div className="px-6 pt-10 pb-10 min-h-screen flex flex-col">
        {/* progress: 4 fish-stick outlines */}
        <div className="flex justify-center items-center gap-3 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`transition-opacity ${s <= step ? "opacity-100" : "opacity-30"}`}
            >
              <FishStick size={26} state={s < step ? "full" : s === step ? "half" : "empty"} />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {step === 1 && (
              <CardStep
                title="在这个世界上，你觉得自己更接近哪种能量体态？"
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
              <div>
                <h2 className="text-[22px] leading-[1.5] font-medium text-[#5C4A3F] tracking-wide">
                  我们想在你最脆弱的几天，给你自动「请假」。
                </h2>
                <p className="mt-2 text-[13px] text-[#9B8F7F]">
                  不知道也没关系，可以填大概的。
                </p>

                <div className="mt-8 space-y-7">
                  <div>
                    <label className="text-sm text-[#7B6F5F]">上一次月经起始日期</label>
                    <input
                      type="date"
                      value={lastPeriodStart}
                      max={todayStr}
                      min={threeYearsAgo}
                      onChange={(e) => {
                        setLastPeriodStart(e.target.value);
                        setSkipCycle(false);
                      }}
                      className="mt-2 w-full px-4 py-3 rounded-2xl bg-[#FCFCF9] border-2 border-[#E8DDD2] text-[#5C4A3F] focus:outline-none focus:border-[#FFD4D4]"
                    />
                  </div>

                  <SliderRow
                    label="平均周期天数 T"
                    value={cycleDays}
                    min={21}
                    max={35}
                    step={1}
                    suffix="天"
                    onChange={setCycleDays}
                  />

                  <SliderRow
                    label="经期天数 M"
                    value={periodDays}
                    min={2}
                    max={10}
                    step={1}
                    suffix="天"
                    onChange={setPeriodDays}
                  />

                  {periodError && (
                    <p className="text-xs text-[#C56A6A] -mt-3">{periodError}</p>
                  )}

                  <button
                    onClick={skipStep2}
                    className="text-xs text-[#9B8F7F] underline-offset-4 hover:underline"
                  >
                    跳过此步（按中性值计算）
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <CardStep
                title="你的日常，是在以下哪种「浓度」中穿行？"
                options={O_OPTIONS.map((o) => ({
                  key: String(o.value),
                  label: o.label,
                  hint: o.hint,
                  selected: O === o.value,
                  onClick: () => setO(o.value),
                }))}
              />
            )}

            {step === 4 && (
              <div>
                <h2 className="text-[22px] leading-[1.5] font-medium text-[#5C4A3F] tracking-wide">
                  睡多久，才能让你感到「活过来了」？
                </h2>
                <p className="mt-2 text-[13px] text-[#9B8F7F]">
                  这是你的理想睡眠时长，不是实际睡眠时间。
                </p>

                <div className="mt-12 text-center">
                  <span className="text-6xl font-light text-[#5C4A3F]">
                    {sleepHours.toFixed(1)}
                  </span>
                  <span className="ml-2 text-[#9B8F7F] text-base">小时</span>
                </div>

                <div className="mt-8 px-2">
                  <input
                    type="range"
                    min={4.0}
                    max={10.0}
                    step={0.5}
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full accent-[#E89A8F]"
                  />
                  <div className="flex justify-between text-[11px] text-[#9B8F7F] mt-2 px-1">
                    <span>4h</span>
                    <span>7h</span>
                    <span>10h</span>
                  </div>
                </div>
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
          <button
            onClick={next}
            disabled={!canNext()}
            className="px-8 py-3 rounded-full bg-[#FFD4D4] text-[#5C4A3F] text-sm font-medium shadow-sm active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
          >
            {step === 4 ? "完成" : "下一步"}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}

function CardStep({
  title,
  options,
}: {
  title: string;
  options: { key: string; label: string; hint: string; selected: boolean; onClick: () => void }[];
}) {
  return (
    <div>
      <h2 className="text-[22px] leading-[1.5] font-medium text-[#5C4A3F] tracking-wide">{title}</h2>
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
            <div className="text-xs text-[#9B8F7F] mt-1 leading-relaxed">{o.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#7B6F5F]">{label}</span>
        <span className="text-sm text-[#A86A6A] font-medium">
          {value} {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-2 w-full accent-[#E89A8F]"
      />
      <div className="flex justify-between text-[11px] text-[#9B8F7F] mt-1 px-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
