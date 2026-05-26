import type { DashboardLang, SearchConsoleSnapshot, VisibilityIntelligence, AuditInput } from '../../lib/visibilityIntelligence';
import { buildVisibilityIntelligence } from '../../lib/visibilityIntelligence';
import type { PublicVisibilityAudit } from './adveroAuditTypes';
import { getSearchConsoleSnapshot } from '../google/searchConsoleService';

function toAuditInput(audit: PublicVisibilityAudit | null): AuditInput | null {
  if (!audit || audit.status !== 'complete' || !audit.scores || !audit.recommendation) return null;
  return {
    id: audit.id,
    companyName: audit.companyName,
    status: 'complete',
    scores: audit.scores,
    overallScore: audit.overallScore ?? 0,
    delta: audit.delta,
    growthGoal: audit.growthGoal,
    industry: audit.industry,
    engine: audit.engine,
    recommendation: audit.recommendation,
    interpretation: audit.interpretation,
  };
}

export async function buildCanonicalIntelligence(
  lang: DashboardLang,
  audit: PublicVisibilityAudit | null,
  workspaceId?: string | null
): Promise<{ intelligence: VisibilityIntelligence; searchConsole: SearchConsoleSnapshot }> {
  const gsc = await getSearchConsoleSnapshot(workspaceId);
  const intelligence = buildVisibilityIntelligence({
    lang,
    audit: toAuditInput(audit),
    searchConsole: gsc,
  });
  return { intelligence, searchConsole: gsc };
}
