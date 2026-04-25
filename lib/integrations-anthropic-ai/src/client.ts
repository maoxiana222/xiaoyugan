import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // Default to Anthropic official endpoint; allow override only when explicitly configured.
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
});