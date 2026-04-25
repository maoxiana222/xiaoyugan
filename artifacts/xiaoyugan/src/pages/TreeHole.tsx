import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Phone } from "lucide-react";
import { useTreeHoleChat } from "@workspace/api-client-react";
import { PageContainer } from "@/components/PageContainer";
import { CatAvatar } from "@/components/CatAvatar";
import {
  useTreeHole,
  useAchievements,
  useRecords,
  useBlindBox,
  useBaseline,
  useProfile,
  todayKey,
  newId,
  type TreeHoleMessage,
} from "@/lib/storage";
import { evaluateAchievements } from "@/lib/achievements";
import { toast } from "sonner";

export default function TreeHole() {
  const [messages, setMessages] = useTreeHole();
  const [achievements, setAchievements] = useAchievements();
  const [records] = useRecords();
  const [blindbox] = useBlindBox();
  const [baseline] = useBaseline();
  const [profile] = useProfile();
  const chat = useTreeHoleChat();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Compute energy summary to send as context to the AI (v4.3)
  const energyContext = useMemo(() => {
    const today = todayKey();
    const todayRs = records.filter((r) => r.date === today);
    const lastToday = todayRs[todayRs.length - 1];
    const currentEnergy = lastToday
      ? lastToday.energyAfter
      : baseline?.baseline ?? undefined;
    const initialEnergy = baseline?.baseline ?? undefined;

    // 7-day average of end-of-day energy
    const dayMap = new Map<string, number>();
    for (const r of records) {
      dayMap.set(r.date, r.energyAfter);
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recent: number[] = [];
    for (const [d, v] of dayMap) {
      const dt = new Date(`${d}T00:00:00`);
      if (dt >= cutoff) recent.push(v);
    }
    const avg7d =
      recent.length > 0
        ? Math.round(
            (recent.reduce((s, v) => s + v, 0) / recent.length) * 10,
          ) / 10
        : undefined;

    // Top consume categories from last 7 days
    const killerCounts = new Map<string, number>();
    for (const r of records) {
      if (r.delta >= 0) continue;
      const dt = new Date(`${r.date}T00:00:00`);
      if (dt < cutoff) continue;
      const key = r.category || r.reason;
      if (!key) continue;
      killerCounts.set(key, (killerCounts.get(key) ?? 0) + 1);
    }
    const topKillers = [...killerCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k]) => k);

    return {
      currentEnergy,
      initialEnergy,
      cyclePhase: profile.cyclePhase,
      avg7d,
      topKillers,
    };
  }, [records, baseline, profile.cyclePhase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chat.isPending]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const userMsg: TreeHoleMessage = {
      id: newId(),
      role: "user",
      text,
      ts: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setDraft("");

    // Achievement evaluation for sending message
    const ev1 = evaluateAchievements(
      { records, messages: next, blindbox },
      achievements,
    );
    if (ev1.newlyUnlocked.length > 0) {
      setAchievements(ev1.updated);
      ev1.newlyUnlocked.forEach((a) => toast(`解锁成就：${a.title}`, { description: a.description }));
    }

    chat.mutate(
      { data: { message: text, ...energyContext } },
      {
        onSuccess: (res) => {
          const catMsg: TreeHoleMessage = {
            id: newId(),
            role: "cat",
            text: res.reply,
            ts: new Date().toISOString(),
            crisis: res.crisis,
          };
          setMessages([...next, catMsg]);
        },
        onError: () => {
          const catMsg: TreeHoleMessage = {
            id: newId(),
            role: "cat",
            text: "嗯嗯，我都听到了",
            ts: new Date().toISOString(),
          };
          setMessages([...next, catMsg]);
        },
      },
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col h-screen pb-[60px]">
        <header className="flex items-center gap-3 px-5 pt-6 pb-3 border-b border-[#E8DDD2]">
          <CatAvatar size={44} mood="calm" />
          <div>
            <h1 className="text-base font-medium text-[#5C4A3F]">小猫的树洞</h1>
            <p className="text-[11px] text-[#9B8F7F]">说什么都可以，我都听着</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-12 px-8">
              <CatAvatar size={100} mood="calm" />
              <p className="mt-6 text-sm text-[#7B6F5F] leading-relaxed">
                我在这儿，你说的每一句我都会听完。
                <br />
                不用怕说得不对，也不用怕没头没尾。
              </p>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}

          {chat.isPending && (
            <div className="flex items-end gap-2">
              <CatAvatar size={32} mood="calm" />
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#FFF4CC] border border-[#F0DFA8]">
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-[#FCFCF9] border-t border-[#E8DDD2]">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={500}
              placeholder="想说什么..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F5F5F0] border border-[#E8DDD2] text-sm text-[#5C4A3F] placeholder:text-[#B8AC9C] focus:outline-none focus:border-[#FFD4D4] resize-none max-h-32"
            />
            <button
              onClick={send}
              disabled={!draft.trim() || chat.isPending}
              className="w-10 h-10 rounded-full bg-[#FFD4D4] text-[#A86A6A] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40 disabled:active:scale-100"
              aria-label="发送"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function MessageBubble({ msg }: { msg: TreeHoleMessage }) {
  if (msg.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-[#FFD4D4] text-[#5C4A3F] text-sm leading-relaxed">
          {msg.text}
        </div>
      </motion.div>
    );
  }
  if (msg.crisis) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mx-2 p-5 rounded-2xl border-2 border-[#E89A8F] bg-[#FFF6EE]">
          <p className="text-sm text-[#5C4A3F] leading-relaxed">{msg.text}</p>
          <a
            href="tel:4001619995"
            className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#FFD4D4] text-[#A86A6A] text-sm font-medium active:scale-[0.98] transition-transform"
          >
            <Phone size={14} />
            拨打 400-161-9995
          </a>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end gap-2"
    >
      <CatAvatar size={32} mood="calm" />
      <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-[#FFF4CC] border border-[#F0DFA8] text-sm text-[#5C4A3F] leading-relaxed">
        {msg.text}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#A88B5C]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
