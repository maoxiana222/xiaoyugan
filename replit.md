# 小鱼干 · 精力陪伴 (Little Fish Stick — Energy Companion)

A Chinese-language H5 mobile companion app for energy/mood tracking. Featuring a hand-drawn cat companion who helps users track daily energy as "fish sticks" (鱼干 = small fish), with subtraction-permission nudges, blind-box recovery actions, an AI tree-hole chat, and an AI-generated daily report.

## Architecture

This is a pnpm monorepo with three artifacts:

- **`artifacts/xiaoyugan/`** (kind: `web`) — The H5 React + Vite frontend mounted at `/`. localStorage-first; no auth. Routes:
  - `/` — Home (fish-stick ring around cat, ± buttons step **0.5**, long-press for reasons)
  - `/welcome` — First-launch welcome (PRD 1.2): cat + speech bubble + 开始体检 / 跳过
  - `/baseline` — Full 4-page questionnaire (PRD 1.3): 体质 B → 周期数据 → 浓度 O → 理想睡眠
  - `/baseline-result` — Result page (PRD 1.5): big number + phase/load summary + 开启小鱼干 button
  - `/tree-hole` — AI cat chat (≤22 char replies, crisis-keyword detection → 400-161-9995)
  - `/report` — Daily AI report + 14-day strip + per-day timeline
  - `/profile` — Nickname, manual cycle phase override, reset, clear data
  - `/achievements` — Achievement wall (8 milestones)
  - `/blindbox` — 20 preset recovery actions with countdown

**Style**: Minimalist line-art picture-book. Cat is two-triangle ears + soft squircle head, dot eyes / arc smiles. Fish stick is a leaf-like outline + tail + dot eye. No fills, no shading.
- **`artifacts/api-server/`** (kind: `api`) — Express server at `/api` with two endpoints:
  - `POST /api/ai/tree-hole` → tree-hole chat (uses Claude Haiku)
  - `POST /api/ai/daily-report` → daily report (uses Claude Sonnet)
- **`artifacts/mockup-sandbox/`** (kind: `design`) — Unused for this app, kept from scaffold.

## Backend dependencies

- Anthropic AI via Replit AI Integrations (no user-supplied API key required). Env vars `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` and `AI_INTEGRATIONS_ANTHROPIC_API_KEY` are auto-provisioned.
- PostgreSQL is provisioned but **not used** — all user data lives in browser localStorage.

## Shared libraries

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth (run `pnpm --filter @workspace/api-spec run codegen` after changes)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod schemas
- `lib/integrations-anthropic-ai/` — thin wrapper exporting the Anthropic SDK client
- `lib/db/` — Drizzle schemas (currently unused)

## Frontend conventions

- localStorage keys: `xiaoyugan_baseline`, `xiaoyugan_records`, `xiaoyugan_profile`, `xiaoyugan_treehole`, `xiaoyugan_blindbox`, `xiaoyugan_achievements`, `xiaoyugan_triggers_today`. All read/write via `src/lib/storage.ts` (which provides hooks that re-render on cross-component updates).
- Color palette: bg `#F5F5F0`, primary pink `#FFD4D4`, secondary orange `#FFE4CC`, bubble yellow `#FFF4CC`, text `#333`. **No pure white, no cool tones, no emojis.**
- Animations via Framer Motion (springs, never linear). Toasts via Sonner. Drawers via Vaul (shadcn).
- Long-press detection: 600ms hold opens the reason drawer; tap = silent ±1 with toast.

## Subtraction-permission triggers (priority queue, max 1 per day per priority)

1. Energy ≤ 2 → "今天的鱼干很少了，要不要早点休息？"
2. 3 consecutive consume records → "今天好像一直在消耗，给自己留点鱼干？"
3. In luteal/menstrual phase → "现在是 [阶段]，本来就比较累..."

## Crisis safety

Tree-hole backend matches Chinese crisis keywords (不想活/去死/自杀/想死/活不下去/结束生命/了结自己) and returns a fixed safety reply with the 400-161-9995 hotline. The frontend renders such replies as a special bordered card with a `tel:` button.
