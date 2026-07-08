/**
 * Thin, provider-agnostic AI abstraction shared by the nutrition and workout
 * generators. Tries providers in priority order and returns the first
 * successful raw text completion, or `null` if none are configured/available
 * — callers MUST have a deterministic fallback for the `null` case so the
 * product works with zero AI spend / zero API keys configured.
 */

type AiProvider = "openai" | "anthropic" | "gemini";

const PROVIDER_ORDER: AiProvider[] = (() => {
  const preferred = process.env.AI_PROVIDER?.toLowerCase();
  const all: AiProvider[] = ["openai", "anthropic", "gemini"];
  if (preferred && all.includes(preferred as AiProvider)) {
    return [preferred as AiProvider, ...all.filter((p) => p !== preferred)];
  }
  return all;
})();

export interface AiCompletionRequest {
  system: string;
  prompt: string;
  /** Hint that the response should be parsed as JSON; used for provider-specific JSON modes. */
  json?: boolean;
  maxTokens?: number;
}

async function callOpenAI(req: AiCompletionRequest): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.prompt },
      ],
      max_tokens: req.maxTokens ?? 2000,
      ...(req.json ? { response_format: { type: "json_object" as const } } : {}),
    });
    return completion.choices[0]?.message?.content ?? null;
  } catch (error) {
    console.error("[ai] OpenAI completion failed", error);
    return null;
  }
}

async function callAnthropic(req: AiCompletionRequest): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-5", // still Active; upgrade to "claude-sonnet-5" for better quality/cheaper intro pricing (through Aug 31 2026)
      max_tokens: req.maxTokens ?? 2000,
      system: req.system,
      messages: [{ role: "user", content: req.prompt }],
    });
    const block = message.content[0];
    return block && block.type === "text" ? block.text : null;
  } catch (error) {
    console.error("[ai] Anthropic completion failed", error);
    return null;
  }
}

async function callGemini(req: AiCompletionRequest): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(`${req.system}\n\n${req.prompt}`);
    return result.response.text();
  } catch (error) {
    console.error("[ai] Gemini completion failed", error);
    return null;
  }
}

const CALLERS: Record<AiProvider, (req: AiCompletionRequest) => Promise<string | null>> = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  gemini: callGemini,
};

/** Returns the first successful completion across configured providers, or `null`. */
export async function generateWithAI(req: AiCompletionRequest): Promise<string | null> {
  for (const provider of PROVIDER_ORDER) {
    const result = await CALLERS[provider](req);
    if (result) return result;
  }
  return null;
}

/** Extracts the first JSON object/array found in a (possibly markdown-fenced) AI response. */
export function extractJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/i) ?? raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) return null;
    try {
      return JSON.parse(match[1]) as T;
    } catch {
      return null;
    }
  }
}
