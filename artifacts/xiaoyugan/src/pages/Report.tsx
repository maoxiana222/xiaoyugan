import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGenerateDailyReport } from "@workspace/api-client-react";
import { PageContainer } from "@/components/PageContainer";
import { CatAvatar } from "@/components/CatAvatar";
import {
  useRecords,
  useProfile,
  useBlindBox,
  todayKey,
  type RecordEntry,
} from "@/lib/storage";

export default function Report() {
  const [records] = useRecords();
  const [profile] = useProfile();
  const [blindbox] = useBlindBox();

  const [selectedDate, setSelectedDate] = useState<string>(todayKey());
  const dayRecords = useMemo(
    () => records.filter((r) => r.date === selectedDate),
    [records, selectedDate],
  );

  const stats = useMemo(() => computeStats(dayRecords), [dayRecords]);
  const isToday = selectedDate === todayKey();

  const reportMutation = useGenerateDailyReport();
  const [report, setReport] = useState<string | null>(null);

  useEffect(() => {
    setReport(null);
  }, [selectedDate]);

  function generateReport() {
    if (dayRecords.length === 0) {
      setReport(null);
      return;
    }
    const blindboxToday = blindbox
      .filter((b) => b.ts.startsWith(selectedDate))
      .map((b) => b.action);
    reportMutation.mutate(
      {
        data: {
          date: selectedDate,
          recordCount: dayRecords.length,
          averageEnergy: stats.avg,
          minEnergy: stats.min,
          minTime: stats.minTime,
          maxEnergy: stats.max,
          maxTime: stats.maxTime,
          events: dayRecords
            .filter((r) => r.reason && r.reason !== "基线测算")
            .map((r) => `${r.time} ${r.delta > 0 ? "+" : ""}${r.delta} ${r.reason}`),
          blindBoxActions: blindboxToday,
          cyclePhase: profile.cyclePhase,
        },
      },
      { onSuccess: (res) => setReport(res.content) },
    );
  }

  // Build last-14-days strip
  const recentDays = useMemo(() => {
    const result: { date: string; count: number; min?: number; max?: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const day = records.filter((r) => r.date === key);
      result.push({
        date: key,
        count: day.length,
        min: day.length ? Math.min(...day.map((r) => r.energyAfter)) : undefined,
        max: day.length ? Math.max(...day.map((r) => r.energyAfter)) : undefined,
      });
    }
    return result;
  }, [records]);

  return (
    <PageContainer>
      <div className="px-5 pt-8 pb-6">
        <h1 className="text-2xl font-medium text-[#5C4A3F]">日报</h1>
        <p className="text-sm text-[#9B8F7F] mt-1">小猫陪你看看今天</p>
      </div>

      {/* Date strip */}
      <div className="px-5 pb-4 overflow-x-auto">
        <div className="flex gap-1.5">
          {recentDays.map((d) => {
            const active = d.date === selectedDate;
            const has = d.count > 0;
            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex-shrink-0 w-12 py-2 rounded-xl text-center transition-all ${
                  active
                    ? "bg-[#FFD4D4] border-2 border-[#E89A8F]"
                    : has
                      ? "bg-[#FCFCF9] border-2 border-[#E8DDD2]"
                      : "bg-[#F5F5F0] border-2 border-[#EEE8DC]"
                }`}
              >
                <div className={`text-[10px] ${active ? "text-[#A86A6A]" : "text-[#9B8F7F]"}`}>
                  {d.date.slice(5)}
                </div>
                <div className="mt-1 flex justify-center">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      has ? "bg-[#E89A8F]" : "bg-[#D8CFC0]"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* AI report card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-[#FFF6EE] border border-[#E8DDD2] shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <CatAvatar size={28} mood="calm" />
            <span className="text-xs text-[#9B8F7F]">小猫的日记</span>
          </div>
          {dayRecords.length === 0 ? (
            <p className="text-sm text-[#9B8F7F] leading-relaxed">
              {isToday ? "今天还没有记录哦，去给小猫加点鱼干吧。" : "这一天没有留下记录。"}
            </p>
          ) : report ? (
            <p className="text-sm text-[#5C4A3F] leading-loose whitespace-pre-wrap">{report}</p>
          ) : reportMutation.isPending ? (
            <p className="text-sm text-[#9B8F7F]">小猫正在写日记...</p>
          ) : (
            <button
              onClick={generateReport}
              className="px-5 py-2.5 rounded-full bg-[#FFD4D4] text-[#A86A6A] text-sm font-medium active:scale-95 transition-transform"
            >
              让小猫写一份
            </button>
          )}
        </motion.div>

        {/* Stats */}
        {dayRecords.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="记录" value={`${dayRecords.length}`} />
            <StatCard label="平均" value={stats.avg.toFixed(1)} />
            <StatCard label="最低" value={`${stats.min}`} />
          </div>
        )}

        {/* Timeline */}
        {dayRecords.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#FCFCF9] border border-[#E8DDD2]">
            <p className="text-xs text-[#9B8F7F] mb-3">时间线</p>
            <ul className="space-y-2.5">
              {dayRecords.map((r) => (
                <li key={r.id} className="flex items-start gap-3 text-sm">
                  <span className="text-[#9B8F7F] text-xs w-12 mt-0.5">{r.time}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      r.delta < 0
                        ? "bg-[#FFE4CC] text-[#A86A4F]"
                        : r.delta > 0
                          ? "bg-[#FFD4D4] text-[#A86A6A]"
                          : "bg-[#F0E8DD] text-[#9B8F7F]"
                    }`}
                  >
                    {r.delta > 0 ? "+" : ""}
                    {r.delta}
                  </span>
                  <span className="text-[#5C4A3F] flex-1">
                    {r.reason ?? "未记录原因"} · 此时 {r.energyAfter} 条
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function computeStats(records: RecordEntry[]) {
  if (records.length === 0) {
    return { avg: 0, min: 0, max: 0, minTime: "", maxTime: "" };
  }
  const energies = records.map((r) => r.energyAfter);
  const avg = energies.reduce((a, b) => a + b, 0) / energies.length;
  let minIdx = 0,
    maxIdx = 0;
  for (let i = 1; i < records.length; i++) {
    if (records[i]!.energyAfter < records[minIdx]!.energyAfter) minIdx = i;
    if (records[i]!.energyAfter > records[maxIdx]!.energyAfter) maxIdx = i;
  }
  return {
    avg,
    min: records[minIdx]!.energyAfter,
    max: records[maxIdx]!.energyAfter,
    minTime: records[minIdx]!.time,
    maxTime: records[maxIdx]!.time,
  };
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-2xl bg-[#FCFCF9] border border-[#E8DDD2] text-center">
      <div className="text-xs text-[#9B8F7F]">{label}</div>
      <div className="text-2xl font-light text-[#5C4A3F] mt-1">{value}</div>
    </div>
  );
}
