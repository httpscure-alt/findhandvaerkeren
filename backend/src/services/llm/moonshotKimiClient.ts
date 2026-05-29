import { logger } from '../../config/logger';

export type KimiChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export function isKimiConfigured(): boolean {
  const key = process.env.MOONSHOT_API_KEY?.trim() || process.env.KIMI_API_KEY?.trim();
  return Boolean(key);
}

export function kimiApiKey(): string | undefined {
  return process.env.MOONSHOT_API_KEY?.trim() || process.env.KIMI_API_KEY?.trim();
}

export function kimiModel(): string {
  return process.env.MOONSHOT_MODEL?.trim() || 'kimi-k2.6';
}

export function kimiBaseUrl(): string {
  return (process.env.MOONSHOT_API_BASE_URL || 'https://api.moonshot.ai/v1').replace(/\/$/, '');
}

/** Template copy is default; set ADVERO_LLM_INTERPRETATION=true to enable Kimi narrative. */
export function llmInterpretationEnabled(): boolean {
  if (process.env.ADVERO_LLM_INTERPRETATION !== 'true') return false;
  return isKimiConfigured();
}

/**
 * OpenAI-compatible chat completion (Moonshot / Kimi).
 */
export async function kimiChatCompletion(
  messages: KimiChatMessage[],
  opts?: { maxTokens?: number; temperature?: number }
): Promise<string | null> {
  const apiKey = kimiApiKey();
  if (!apiKey) return null;

  const url = `${kimiBaseUrl()}/chat/completions`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: kimiModel(),
        messages,
        temperature: opts?.temperature ?? 0.4,
        max_completion_tokens: opts?.maxTokens ?? 1200,
        thinking: { type: 'disabled' },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.warn('Kimi API error', { status: res.status, body: text.slice(0, 400) });
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err: unknown) {
    logger.warn('Kimi API request failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Extract JSON object from model output (raw JSON or ```json fence). */
export function parseJsonFromLlm<T>(raw: string): T | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
