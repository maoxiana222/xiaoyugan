import { Router, type IRouter } from "express";
import {
  TreeHoleChatBody,
  TreeHoleChatResponse,
  GenerateDailyReportBody,
  GenerateDailyReportResponse,
} from "@workspace/api-zod";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router: IRouter = Router();

const CRISIS_KEYWORDS = [
  "不想活",
  "去死",
  "自杀",
  "想死",
  "活不下去",
  "结束生命",
  "了结自己",
];

const TREE_HOLE_FALLBACK_REPLIES = [
  "抱抱你，辛苦了",
  "嗯嗯，我懂的",
  "听起来真的累了呢",
  "没关系的，慢慢来",
  "今天也很不容易吧",
  "我陪着你呢",
  "摸摸头，先停一停",
  "嗯，我都听到了",
  "辛苦了，先歇会儿",
  "我都懂的，别勉强",
];

// v4.3 问题优先版
const TREE_HOLE_SYSTEM_PROMPT = `你是一只温柔的小猫陪伴者。你会收到用户的话（可能是倾诉或提问）以及他近期的精力数据摘要。

【回应优先级】
1. 如果用户在问一个具体问题（比如"勺子理论是什么"、"精力为什么这么低"），
   请先用最简练的话直接回答这个问题，然后自然衔接一句对当前状态的轻提醒。
2. 如果用户只是倾诉情绪，不必回答问题，直接用共情开头，并视情况给一句精力守护建议。
3. 所有回应必须是一句完整的话，严格控制在 80 字内，不截断。

【硬性输出格式】
- 整段输出只能是一句话，不允许换行、空行、分段、列表、序号、标题。
- 不能科普展开，不能给两条以上信息，不能用"首先""其次""另外"等连接词分开多点。
- 如果发现自己快超过 80 字，立即用句号结束。

【风格约束】
- 回答问题要简短准确，像朋友随口解释，不科普长篇。
- 精力提醒只能基于提供的真实数据，没有模式时只说："累了就该休息，这从来没错。"
- 禁止说教、鼓励再坚持、任何形式的"你可以更好"。
- 如遇自我伤害词汇，固定回复："抱抱你，你很勇敢。需要时可以拨打 400-161-9995。"

【语气】
温暖、轻快，可用"喵""摸鱼"。禁止 markdown、标签。`;

router.post("/tree-hole", async (req, res) => {
  const parse = TreeHoleChatBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "invalid request" });
    return;
  }

  const { message, currentEnergy, initialEnergy, cyclePhase, avg7d, topKillers } =
    parse.data;

  // Crisis keyword check — return fixed safety response immediately
  if (CRISIS_KEYWORDS.some((k) => message.includes(k))) {
    const safeReply = "抱抱你，你很勇敢。需要时可以拨打 400-161-9995。";
    res.json(TreeHoleChatResponse.parse({ reply: safeReply, crisis: true }));
    return;
  }

  // Build user prompt with energy summary (only include real data)
  const lines: string[] = [];
  if (
    typeof currentEnergy === "number" ||
    typeof initialEnergy === "number" ||
    cyclePhase
  ) {
    const parts: string[] = [];
    if (typeof currentEnergy === "number") parts.push(`精力 ${currentEnergy}/10`);
    if (typeof initialEnergy === "number") parts.push(`初始 ${initialEnergy}`);
    if (cyclePhase) parts.push(`阶段 ${cyclePhase}`);
    lines.push(`今日：${parts.join("，")}`);
  }
  if (typeof avg7d === "number") {
    lines.push(`近7天：日均精力 ${avg7d.toFixed(1)}`);
  }
  if (topKillers && topKillers.length > 0) {
    lines.push(`近期高消耗 Top${topKillers.length}：${topKillers.join("、")}`);
  }
  lines.push(`用户说：${message}`);
  const userPrompt = lines.join("\n");

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: TREE_HOLE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = response.content[0];
    let reply = block && block.type === "text" ? block.text.trim() : "";

    // Force single-line, single-sentence output (no newlines, no markdown)
    reply = reply
      .replace(/[\r\n]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/[*_#`>]/g, "")
      .trim();

    // Soft cap at 80 chars — try to end on a sentence boundary
    if (reply.length > 80) {
      const slice = reply.slice(0, 80);
      const lastPunct = Math.max(
        slice.lastIndexOf("。"),
        slice.lastIndexOf("？"),
        slice.lastIndexOf("！"),
        slice.lastIndexOf("，"),
      );
      reply = lastPunct > 30 ? slice.slice(0, lastPunct + 1) : slice + "…";
    }

    if (reply.length === 0) {
      reply =
        TREE_HOLE_FALLBACK_REPLIES[
          Math.floor(Math.random() * TREE_HOLE_FALLBACK_REPLIES.length)
        ]!;
    }

    res.json(TreeHoleChatResponse.parse({ reply, crisis: false }));
  } catch (err) {
    req.log.warn({ err }, "tree-hole AI call failed; using fallback");
    const reply =
      TREE_HOLE_FALLBACK_REPLIES[
        Math.floor(Math.random() * TREE_HOLE_FALLBACK_REPLIES.length)
      ]!;
    res.json(TreeHoleChatResponse.parse({ reply, crisis: false }));
  }
});

const DAILY_REPORT_SYSTEM_PROMPT = `你是「小鱼干」App 的陪伴猫咪，正在为用户生成今日精力日报。

【严格约束，不得违反】：
1. 只能描述以下真实发生的数据，绝对不能编造任何未发生的事件或情绪。
2. 不得使用"可能""也许""或许"等推测语气描述当日已发生的事实。
3. 不得在日报中对用户进行评判、打分或说教。
4. 第二段建议必须基于今日数据的实际规律，无规律则不写第二段。
5. 第三段周期预测仅在 cycle_phase 不为「未追踪」时出现。
6. 总字数控制在 120-180 字之间。
7. 直接输出日报正文，不要加标题、不要分段编号。

【语气要求】：温暖、陪伴感、像朋友写给朋友的观察日记，不说教、不催促。`;

router.post("/daily-report", async (req, res) => {
  const parse = GenerateDailyReportBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "invalid request" });
    return;
  }

  const data = parse.data;

  if (data.recordCount === 0) {
    res.json(
      GenerateDailyReportResponse.parse({
        content: "今天还没有记录，明天见~",
      }),
    );
    return;
  }

  const userPrompt = `今天的数据（${data.date}）：
- 精力记录条数：${data.recordCount} 条
- 平均精力值：${data.averageEnergy.toFixed(1)} 条
- 最低精力：${data.minEnergy} 条${data.minTime ? `（${data.minTime}）` : ""}
- 最高精力：${data.maxEnergy} 条${data.maxTime ? `（${data.maxTime}）` : ""}
- 记录的消耗/补充事件：${data.events.length > 0 ? data.events.join("、") : "（无详细记录）"}
- 使用盲盒次数：${data.blindBoxActions.length} 次${data.blindBoxActions.length > 0 ? `，行动：${data.blindBoxActions.join("、")}` : ""}
- 当前周期阶段：${data.cyclePhase}

请生成今日精力日报。`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: DAILY_REPORT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = response.content[0];
    const content =
      block && block.type === "text"
        ? block.text.trim()
        : "今天的日报生成遇到了点麻烦，明天再试试~";

    res.json(GenerateDailyReportResponse.parse({ content }));
  } catch (err) {
    req.log.warn({ err }, "daily-report AI call failed");
    res.json(
      GenerateDailyReportResponse.parse({
        content: "今天的日报生成遇到了点麻烦，明天再试试~",
      }),
    );
  }
});

export default router;
