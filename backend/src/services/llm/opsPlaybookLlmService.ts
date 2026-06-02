import { logger } from '../../config/logger';
import { kimiChatCompletion, isKimiConfigured } from './moonshotKimiClient';

export function opsAiEnabled(): boolean {
  // Enabled by default when a key is configured.
  // Explicitly disable with ADVERO_OPS_AI=false.
  if (process.env.ADVERO_OPS_AI === 'false') return false;
  return isKimiConfigured();
}

export type OpsDraftContext = {
  lang: 'da' | 'en';
  playbookKey: 'triage' | 'seo' | 'ads' | 'combined';
  playbookMarkdown: string;
  fulfillment: {
    id: string;
    companyName: string;
    websiteUrl?: string | null;
    contactEmail?: string | null;
    serviceLine: string;
    tierId: string;
    overallScore?: number | null;
    weakestChannel?: string | null;
    planHeadline?: string | null;
    notes?: string | null;
  };
};

const SYSTEM_DA = `Du er Adveros operations-specialist (SEO + Google Ads) for danske SMBs.
Du hjælper interne medarbejdere med at levere ydelser hurtigt og korrekt.
Skriv KUN på dansk. Ingen engelsk. Ingen em dashes. Ingen markdown tabeller.
Output skal være ren Markdown med overskrifter og tjeklister.
Skriv konkret og praktisk. Giv ikke juridisk rådgivning.`;

const SYSTEM_EN = `You are Advero's operations specialist (SEO + Google Ads) for Danish SMBs.
Write ONLY in English. No em dashes. No markdown tables.
Output must be plain Markdown with headings and checklists.
Be practical and execution oriented.`;

function buildPrompt(ctx: OpsDraftContext): string {
  return JSON.stringify(
    {
      task: 'Generate an ops draft that the team can review and then publish to internal notes / send to client.',
      lang: ctx.lang,
      fulfillment: ctx.fulfillment,
      playbookReference: ctx.playbookMarkdown,
      outputSpec: ctx.lang === 'da'
        ? {
            format: 'Markdown',
            sections: [
              'Kort opsummering (hvad kunden købte + mål)',
              'Hvad vi mangler fra kunden (adgang)',
              'Uge 1 plan (konkret)',
              'Uge 2-4 plan (konkret)',
              'Kvalitets-checklist (hurtig)',
              'Skabelon-mail til kunden (kort og professionel)',
            ],
          }
        : {
            format: 'Markdown',
            sections: [
              'Short summary (what they bought + goal)',
              'What we need from the client (access)',
              'Week 1 plan',
              'Week 2-4 plan',
              'Quality checklist',
              'Client email template',
            ],
          },
    },
    null,
    2
  );
}

export async function generateOpsPlaybookDraft(ctx: OpsDraftContext): Promise<string | null> {
  if (!opsAiEnabled()) return null;

  const system = ctx.lang === 'da' ? SYSTEM_DA : SYSTEM_EN;
  const user = buildPrompt(ctx);

  const raw = await kimiChatCompletion(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { maxTokens: 1600, temperature: 0.25 }
  );

  if (!raw) return null;

  const out = raw.trim();

  // Guardrail: if Danish is requested, reject obvious English-heavy drafts.
  if (ctx.lang === 'da') {
    const lower = out.toLowerCase();
    const englishSignals = [' the ', ' and ', ' you ', ' your ', ' week ', ' client ', ' access '];
    const hits = englishSignals.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
    if (hits >= 3) {
      logger.warn('Ops AI draft rejected due to mixed language', {
        fulfillmentId: ctx.fulfillment.id,
        hits,
      });
      return null;
    }
  }

  logger.info('Ops AI draft generated', {
    fulfillmentId: ctx.fulfillment.id,
    playbookKey: ctx.playbookKey,
    model: process.env.MOONSHOT_MODEL || 'kimi-k2.6',
  });

  return out;
}

