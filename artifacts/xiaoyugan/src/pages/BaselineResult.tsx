import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/PageContainer";
import { CatAvatar } from "@/components/CatAvatar";
import { useBaseline, useProfile } from "@/lib/storage";
import { O_OPTIONS } from "@/lib/baseline";

export default function BaselineResult() {
  const [, setLocation] = useLocation();
  const [baseline] = useBaseline();
  const [profile] = useProfile();

  useEffect(() => {
    if (!baseline) setLocation("/welcome");
  }, [baseline, setLocation]);

  if (!baseline) return null;

  const phase = profile.cyclePhase;
  const loadLabel = O_OPTIONS.find((o) => o.value === baseline.O_weight)?.label ?? "切换";
  const mood = baseline.baseline >= 7 ? "happy" : baseline.baseline >= 4 ? "calm" : "sleepy";

  const extras: string[] = [];
  if (phase === "黄体期") extras.push("正处于经前敏感期，我们已为你自动开启「减负模式」。");
  if (baseline.skip_cycle) extras.push("如果以后想追踪生理周期能量，可以在「我的」里补填哦。");

  return (
    <PageContainer withTabs={false}>
      <div className="px-6 pt-12 pb-10 flex flex-col items-center min-h-screen">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
        >
          <CatAvatar size={130} mood={mood} />
        </motion.div>

        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-sm text-[#7B6F5F]"
        >
          建模完成
        </motion.p>

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring", damping: 14 }}
          className="my-4 flex items-baseline gap-2"
        >
          <span className="text-7xl font-light text-[#A86A6A] tabular-nums">
            {baseline.baseline.toFixed(1)}
          </span>
          <span className="text-base text-[#9B8F7F]">条小鱼干</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[13px] text-[#7B6F5F] text-center max-w-[300px] leading-[1.9] mt-2"
        >
          考虑到你今日处于「{phase}」，且面临「{loadLabel}」浓度，
          <br />
          这就是你今天开始时的小鱼干数量。
        </motion.p>

        {extras.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 px-5 py-4 rounded-2xl bg-[#FFF4CC] border border-[#F0DFA8] max-w-[320px]"
          >
            {extras.map((e, i) => (
              <p key={i} className="text-[12.5px] text-[#7B6233] leading-relaxed">
                {e}
              </p>
            ))}
          </motion.div>
        )}

        <div className="flex-1" />

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={() => setLocation("/")}
          className="mt-10 w-full max-w-[320px] py-3.5 rounded-full bg-[#FFD4D4] text-[#5C4A3F] text-[15px] font-medium shadow-sm active:scale-[0.97] transition-transform"
        >
          开启小鱼干 →
        </motion.button>
      </div>
    </PageContainer>
  );
}
