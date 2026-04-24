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

const TREE_HOLE_SYSTEM_PROMPT = `你是一只温柔、包容的小猫，用户正在向你倾诉情绪。

【严格规则，不得违反】：
1. 每次回应必须控制在 20 个汉字以内（含标点）。
2. 只表达共情和理解，不提供任何建议、解决方案或行动指引。
3. 不追问用户的具体情况或细节。
4. 不重复用户说的具体内容（避免"所以你是因为XXX才这样？"类句式）。
5. 语气温暖、像朋友，可用"抱抱""摸摸头""嗯嗯"等词汇。
6. 禁止输出任何格式标签、markdown、emoji 之外的特殊符号。
7. 直接输出回应内容，不要加任何前缀如"小猫："等。

【参考回应示例】：
- "听起来真的很累了呢"
- "抱抱你，辛苦了"
- "嗯嗯，我懂的"
- "没关系的，慢慢来"
- "今天也很不容易吧"`;

router.post("/tree-hole", async (req, res) => {
  const parse = TreeHoleChatBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "invalid request" });
    return;
  }

  const { message } = parse.data;

  // Crisis keyword check — return fixed safety response immediately
  if (CRISIS_KEYWORDS.some((k) => message.includes(k))) {
    const safeReply =
      "抱抱你，你很勇敢。如果需要帮助，可以拨打心理援助热线 400-161-9995。";
    res.json(TreeHoleChatResponse.parse({ reply: safeReply, crisis: true }));
    return;
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      system: TREE_HOLE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: `用户说：${message}` }],
    });

    const block = response.content[0];
    let reply = block && block.type === "text" ? block.text.trim() : "";

    // Hard-truncate to ~22 chars in case the model overshoots
    if (reply.length === 0) {
      reply =
        TREE_HOLE_FALLBACK_REPLIES[
          Math.floor(Math.random() * TREE_HOLE_FALLBACK_REPLIES.length)
        ]!;
    } else if (reply.length > 22) {
      reply = reply.slice(0, 22);
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
