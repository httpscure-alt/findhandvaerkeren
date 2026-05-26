import type { AuditScores } from './recommendPlan';

export type EngineCheckId = 'seo' | 'local' | 'schema' | 'service_pages' | 'ai_readability';

export interface EngineCheck {
  id: EngineCheckId;
  labelDa: string;
  labelEn: string;
  statusDa: string;
  statusEn: string;
  ok: boolean;
}

export interface AuditInterpretation {
  executiveSummaryDa: string;
  executiveSummaryEn: string;
  opportunitiesDa: string[];
  opportunitiesEn: string[];
  engineChecks: EngineCheck[];
  aiReadinessLabelDa: string;
  aiReadinessLabelEn: string;
}

export function buildAuditInterpretation(
  scores: AuditScores,
  _engine: 'toprank' | 'mock' = 'mock'
): AuditInterpretation {
  const weakest = (['search', 'local', 'ai', 'web'] as const).reduce((a, b) =>
    scores[a] <= scores[b] ? a : b
  );

  const executiveSummaryDa = `Baseret på Adveros analyse af jeres synlighed ligger I på et niveau hvor målrettet SEO, lokal tilstedeværelse og AI-læsbar struktur kan give mærkbare henvendelser. Størst gap lige nu: ${channelDa(weakest)}.`;
  const executiveSummaryEn = `Based on Advero's visibility analysis, you can improve meaningfully with focused SEO, local presence, and AI-readable structure. Biggest gap right now: ${channelEn(weakest)}.`;

  const opportunitiesDa = [
    scores.local < 70
      ? 'Udvid lokal synlighed og Google Business Profile-dækning.'
      : 'Hold lokal synlighed stabil mens I skalerer organisk.',
    scores.ai < 68
      ? 'Tilføj FAQ og fakta-blokke så AI-søgning kan citere jer.'
      : 'AI-læsbarhed er på vej — finpuds service-sider.',
    scores.search < 72
      ? 'Styrk søge-synlighed på jeres vigtigste ydelsessider.'
      : 'Søge-synlighed er solid — optimer konvertering på landingssider.',
    'Match anbefalet pakke med jeres mål om vækst og leads.',
  ];

  const opportunitiesEn = [
    scores.local < 70
      ? 'Expand local visibility and Google Business Profile coverage.'
      : 'Keep local visibility steady while scaling organic reach.',
    scores.ai < 68
      ? 'Add FAQ and fact blocks so AI search can cite you.'
      : 'AI readability is improving — refine service pages.',
    scores.search < 72
      ? 'Strengthen search visibility on your core service pages.'
      : 'Search visibility is solid — optimize landing page conversion.',
    'Align the recommended package with your growth and lead goals.',
  ];

  return {
    executiveSummaryDa,
    executiveSummaryEn,
    opportunitiesDa,
    opportunitiesEn,
    engineChecks: [
      check('seo', scores.search >= 60, 'SEO-analyse', 'SEO analysis'),
      check('local', scores.local >= 58, 'Lokal synlighed', 'Local visibility'),
      check('schema', scores.web >= 55, 'Schema-detektion', 'Schema detection'),
      check('service_pages', scores.search >= 50, 'Ydelsesside-dækning', 'Service page coverage'),
      check('ai_readability', scores.ai >= 52, 'AI-læsbarhed', 'AI readability'),
    ],
    aiReadinessLabelDa: scores.ai >= 70 ? 'Klar til AI-søgning' : scores.ai >= 55 ? 'På vej' : 'Behov for struktur',
    aiReadinessLabelEn: scores.ai >= 70 ? 'AI-ready' : scores.ai >= 55 ? 'On track' : 'Needs structure',
  };
}

function channelDa(k: keyof AuditScores): string {
  const m = { search: 'søg', local: 'lokal opdagelse', ai: 'AI-synlighed', web: 'website' };
  return m[k];
}

function channelEn(k: keyof AuditScores): string {
  const m = { search: 'search', local: 'local discovery', ai: 'AI visibility', web: 'website' };
  return m[k];
}

function check(
  id: EngineCheckId,
  ok: boolean,
  labelDa: string,
  labelEn: string
): EngineCheck {
  return {
    id,
    labelDa,
    labelEn,
    statusDa: ok ? 'Gennemført' : 'Mulighed for forbedring',
    statusEn: ok ? 'Complete' : 'Room to improve',
    ok,
  };
}
