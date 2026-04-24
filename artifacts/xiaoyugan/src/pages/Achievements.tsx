import { useLocation } from "wouter";
import { ChevronLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/PageContainer";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useAchievements, useRecords, useTreeHole, useBlindBox } from "@/lib/storage";

export default function Achievements() {
  const [, setLocation] = useLocation();
  const [achievements] = useAchievements();
  const [records] = useRecords();
  const [messages] = useTreeHole();
  const [blindbox] = useBlindBox();

  const unlockedCount = Object.keys(achievements).length;

  return (
    <PageContainer>
      <div className="px-5 pt-6 pb-4 flex items-center gap-2">
        <button
          onClick={() => setLocation("/profile")}
          className="p-1.5 rounded-full text-[#9B8F7F] hover:text-[#A86A6A]"
          aria-label="返回"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-medium text-[#5C4A3F]">成就墙</h1>
      </div>

      <div className="px-5 pb-2">
        <p className="text-sm text-[#9B8F7F]">
          已解锁 {unlockedCount} / {ACHIEVEMENTS.length}
        </p>
      </div>

      <div className="px-5 pt-4 grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a, idx) => {
          const meta = achievements[a.id];
          const unlocked = !!meta;
          // Get progress hint when not unlocked
          let progress = "";
          if (!unlocked) {
            if (a.id === "streak_3" || a.id === "streak_7" || a.id === "streak_30") {
              const target = a.id === "streak_3" ? 3 : a.id === "streak_7" ? 7 : 30;
              const days = new Set(records.map((r) => r.date)).size;
              progress = `${days} / ${target} 天`;
            } else if (a.id === "tree_talker") {
              progress = `${messages.filter((m) => m.role === "user").length} / 10`;
            } else if (a.id === "blindbox_completed") {
              progress = `${blindbox.filter((b) => b.completed).length} / 1`;
            }
          }
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-2xl border-2 ${
                unlocked
                  ? "bg-[#FFF6EE] border-[#FFD4D4]"
                  : "bg-[#FCFCF9] border-[#E8DDD2]"
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    unlocked ? "bg-[#FFD4D4]" : "bg-[#F0E8DD]"
                  }`}
                >
                  {unlocked ? (
                    <span className="text-xl text-[#A86A6A]">✦</span>
                  ) : (
                    <Lock size={16} className="text-[#9B8F7F]" />
                  )}
                </div>
              </div>
              <h3
                className={`text-sm font-medium text-center ${
                  unlocked ? "text-[#5C4A3F]" : "text-[#9B8F7F]"
                }`}
              >
                {a.title}
              </h3>
              <p
                className={`text-[11px] text-center mt-1 ${
                  unlocked ? "text-[#7B6F5F]" : "text-[#B8AC9C]"
                }`}
              >
                {a.description}
              </p>
              {unlocked && meta && (
                <p className="text-[10px] text-center text-[#9B8F7F] mt-2">
                  {meta.unlockedAt.slice(0, 10)}
                </p>
              )}
              {!unlocked && progress && (
                <p className="text-[10px] text-center text-[#9B8F7F] mt-2">{progress}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </PageContainer>
  );
}
