import { logger } from '../../config/logger';
import { kimiChatCompletion, isKimiConfigured } from './moonshotKimiClient';

export function translateAiEnabled(): boolean {
  if (process.env.ADVERO_OPS_AI === 'false') return false;
  return isKimiConfigured();
}

export async function translateDaToEnMarkdown(markdown: string): Promise<string | null> {
  if (!translateAiEnabled()) return null;
  const src = String(markdown || '').trim();
  if (!src) return '';
  if (src.length > 22_000) {
    return null;
  }

  const raw = await kimiChatCompletion(
    [
      {
        role: 'system',
        content:
          'You translate Danish to English. Return ONLY English Markdown. Preserve headings and lists. Do not add commentary. No em dashes.',
      },
      { role: 'user', content: src },
    ],
    { maxTokens: 2200, temperature: 0.1 }
  );

  if (!raw) return null;
  const out = raw.trim();
  logger.info('Translated blog markdown da->en', { chars: src.length });
  return out;
}

