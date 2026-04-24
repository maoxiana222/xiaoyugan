import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, RotateCcw, Trash2, Trophy, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageContainer } from "@/components/PageContainer";
import { CatAvatar } from "@/components/CatAvatar";
import {
  useProfile,
  useBaseline,
  useRecords,
  useTreeHole,
  useBlindBox,
  useAchievements,
  clearAllData,
  type CyclePhase,
} from "@/lib/storage";
import { CYCLE_OPTIONS } from "@/lib/baseline";
import { toast } from "sonner";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useProfile();
  const [baseline] = useBaseline();
  const [records] = useRecords();
  const [messages] = useTreeHole();
  const [blindbox] = useBlindBox();
  const [achievements] = useAchievements();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.nickname);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const totalRecords = records.length;
  const totalMessages = messages.filter((m) => m.role === "user").length;
  const totalBlindbox = blindbox.length;
  const totalAchievements = Object.keys(achievements).length;

  function saveName() {
    setProfile({ ...profile, nickname: nameDraft.trim() || "你" });
    setEditingName(false);
    toast("名字改好啦", { duration: 1500 });
  }

  function setPhase(phase: CyclePhase) {
    setProfile({ ...profile, cyclePhase: phase });
    toast(`已切换到${phase}`, { duration: 1500 });
  }

  return (
    <PageContainer>
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <CatAvatar size={64} mood="happy" />
          <div className="flex-1">
            {editingName ? (
              <div className="flex gap-2">
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  maxLength={12}
                  autoFocus
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#FCFCF9] border border-[#E8DDD2] text-sm text-[#5C4A3F]"
                />
                <button
                  onClick={saveName}
                  className="px-3 py-1.5 rounded-lg bg-[#FFD4D4] text-[#A86A6A] text-xs"
                >
                  保存
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNameDraft(profile.nickname);
                  setEditingName(true);
                }}
                className="text-left"
              >
                <div className="text-lg text-[#5C4A3F] font-medium">{profile.nickname}</div>
                <div className="text-xs text-[#9B8F7F] mt-0.5">点击修改名字</div>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          <MiniStat label="记录" value={totalRecords} />
          <MiniStat label="倾诉" value={totalMessages} />
          <MiniStat label="盲盒" value={totalBlindbox} />
          <MiniStat label="成就" value={totalAchievements} />
        </div>
      </div>

      {/* Cycle phase */}
      <div className="px-5 pb-4">
        <p className="text-xs text-[#9B8F7F] mb-2 px-2">现在的周期阶段</p>
        <div className="p-4 rounded-2xl bg-[#FCFCF9] border border-[#E8DDD2]">
          <div className="flex flex-wrap gap-2">
            {CYCLE_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => setPhase(c.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs border-2 transition-all ${
                  profile.cyclePhase === c.value
                    ? "bg-[#FFD4D4] border-[#E89A8F] text-[#A86A6A]"
                    : "bg-transparent border-[#E8DDD2] text-[#9B8F7F]"
                }`}
              >
                {c.value} ×{c.multiplier}
              </button>
            ))}
          </div>
          {baseline && (
            <p className="text-[11px] text-[#9B8F7F] mt-3">
              当前基线 {baseline.baseline.toFixed(1)} 条 · 上次测算 {baseline.computedAt.slice(0, 10)}
            </p>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="px-5 pb-4 space-y-2">
        <MenuItem
          icon={<Trophy size={18} />}
          label="我的成就"
          onClick={() => setLocation("/achievements")}
        />
        <MenuItem
          icon={<RefreshCw size={18} />}
          label="重做基线测算"
          onClick={() => setConfirmReset(true)}
        />
        <MenuItem
          icon={<Trash2 size={18} />}
          label="清空所有数据"
          onClick={() => setConfirmClear(true)}
          danger
        />
      </div>

      <div className="px-5 pt-6 pb-12 text-center">
        <p className="text-[11px] text-[#9B8F7F]">
          小鱼干 · 精力陪伴 v0.1
          <br />
          一只愿意陪你的猫
        </p>
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent className="bg-[#FCFCF9] border-[#E8DDD2]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C4A3F]">重新测算今天的基线？</AlertDialogTitle>
            <AlertDialogDescription className="text-[#9B8F7F]">
              这会清掉今天已有的基线，但不会动你的记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#F5F5F0] text-[#9B8F7F] border-[#E8DDD2]">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setLocation("/baseline")}
              className="bg-[#FFD4D4] text-[#A86A6A] hover:bg-[#FFC4C4]"
            >
              去测算
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent className="bg-[#FCFCF9] border-[#E8DDD2]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#5C4A3F]">清空所有数据？</AlertDialogTitle>
            <AlertDialogDescription className="text-[#9B8F7F]">
              所有记录、聊天、成就都会消失，并且不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#F5F5F0] text-[#9B8F7F] border-[#E8DDD2]">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearAllData();
                toast("数据已清空", { duration: 1500 });
                setTimeout(() => setLocation("/baseline"), 500);
              }}
              className="bg-[#E89A8F] text-white hover:bg-[#D88A7F]"
            >
              确定清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-xl bg-[#FCFCF9] border border-[#E8DDD2] text-center">
      <div className="text-xl font-light text-[#5C4A3F]">{value}</div>
      <div className="text-[10px] text-[#9B8F7F] mt-0.5">{label}</div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl bg-[#FCFCF9] border border-[#E8DDD2] active:scale-[0.99] transition-transform ${
        danger ? "text-[#C26F6F]" : "text-[#5C4A3F]"
      }`}
    >
      <span className={danger ? "text-[#C26F6F]" : "text-[#9B8F7F]"}>{icon}</span>
      <span className="flex-1 text-left text-sm">{label}</span>
      <ChevronRight size={16} className="text-[#9B8F7F]" />
    </button>
  );
}
