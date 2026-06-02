import { logger } from '../../config/logger';
import { kimiChatCompletion, isKimiConfigured } from './moonshotKimiClient';

export function blogAiEnabled(): boolean {
  if (process.env.ADVERO_OPS_AI === 'false') return false;
  return isKimiConfigured();
}

export type BlogDraftRequest = {
  lang: 'da' | 'en';
  topic: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  audience?: string;
  businessType?: string;
  location?: string;
  category?: string;
  tone?: 'practical' | 'expert' | 'friendly';
  length?: 'short' | 'medium' | 'long';
};

export type BlogDraftResult = {
  title: string;
  excerpt: string;
  contentMarkdown: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  category: string;
  additionalJsonLd?: string; // JSON string
};

const SYSTEM_DA = `Du er Advero. Du skriver SEO-artikler til danske service- og håndværksfirmaer.
Skriv KUN på dansk. Ingen engelsk. Ingen em dashes. Ingen markdown tabeller.
Output skal være VALID JSON og intet andet.`;

const SYSTEM_EN = `You are Advero. You write SEO blog posts for Danish SMBs.
Write ONLY in English. No em dashes. No markdown tables.
Output must be VALID JSON and nothing else.`;

function clamp(s: string, max: number): string {
  const out = String(s || '').trim();
  if (out.length <= max) return out;
  return out.slice(0, max).trim();
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => String(t || '').trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);
}

function parseJsonLoose<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    // try extract first {...} block
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function looksTooEnglishForDa(text: string): boolean {
  const lower = text.toLowerCase();
  const englishSignals = [' the ', ' and ', ' you ', ' your ', ' week ', ' client ', ' access '];
  const hits = englishSignals.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
  return hits >= 3;
}

function buildPrompt(req: BlogDraftRequest): string {
  const secondary = (req.secondaryKeywords || []).filter(Boolean).slice(0, 8);
  return JSON.stringify(
    {
      task: 'Generate a complete SEO blog post draft for the Advero blog CMS.',
      lang: req.lang,
      inputs: {
        topic: req.topic,
        primaryKeyword: req.primaryKeyword || null,
        secondaryKeywords: secondary,
        audience: req.audience || null,
        businessType: req.businessType || null,
        location: req.location || null,
        category: req.category || null,
        tone: req.tone || 'practical',
        length: req.length || 'medium',
      },
      outputSchema: {
        title: 'string (55-75 chars ideal)',
        excerpt: 'string (1-2 short paragraphs)',
        metaTitle: 'string (<= 60 chars ideal)',
        metaDescription: 'string (<= 160 chars ideal)',
        category: 'string (seo | google-ads | ai | business | general)',
        tags: 'string[] (lowercase, short)',
        contentMarkdown:
          'string (Markdown). Include: H1 (same as title), intro, TOC, multiple H2/H3, practical checklist, FAQ section.',
        additionalJsonLd:
          'optional string: JSON for FAQPage schema if you included FAQ; otherwise omit.',
      },
      hardRules:
        req.lang === 'da'
          ? [
              'Return ONLY JSON. No commentary.',
              'Write ONLY Danish.',
              'No em dashes.',
              'No markdown tables.',
              'Prefer practical, local-DK examples (pricing ranges ok but no fake guarantees).',
            ]
          : [
              'Return ONLY JSON. No commentary.',
              'Write ONLY English.',
              'No em dashes.',
              'No markdown tables.',
            ],
    },
    null,
    2
  );
}

export async function generateBlogDraft(req: BlogDraftRequest): Promise<BlogDraftResult | null> {
  if (!blogAiEnabled()) return null;

  const topic = clamp(req.topic, 220);
  if (!topic) return null;

  const system = req.lang === 'da' ? SYSTEM_DA : SYSTEM_EN;
  const user = buildPrompt({ ...req, topic });

  const raw = await kimiChatCompletion(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { maxTokens: 2200, temperature: 0.35 }
  );
  if (!raw) return null;

  const parsed = parseJsonLoose<Partial<BlogDraftResult> & { contentMarkdown?: string }>(raw.trim());
  if (!parsed?.title || !parsed?.excerpt || !parsed?.contentMarkdown) return null;

  const title = clamp(parsed.title, 140);
  const excerpt = clamp(parsed.excerpt, 520);
  const contentMarkdown = String(parsed.contentMarkdown || '').trim();
  const metaTitle = clamp(parsed.metaTitle || title, 140);
  const metaDescription = clamp(parsed.metaDescription || excerpt, 220);
  const category = clamp(parsed.category || req.category || 'seo', 40) || 'seo';
  const tags = normalizeTags(parsed.tags);
  const additionalJsonLd = parsed.additionalJsonLd ? String(parsed.additionalJsonLd).trim() : undefined;

  if (req.lang === 'da' && (looksTooEnglishForDa(title) || looksTooEnglishForDa(excerpt) || looksTooEnglishForDa(contentMarkdown))) {
    logger.warn('Blog draft rejected due to mixed language', { topic });
    return null;
  }

  logger.info('Blog draft generated', {
    topic,
    lang: req.lang,
    model: process.env.MOONSHOT_MODEL || 'kimi-k2.6',
  });

  return {
    title,
    excerpt,
    contentMarkdown,
    metaTitle,
    metaDescription,
    tags,
    category,
    additionalJsonLd,
  };
}

