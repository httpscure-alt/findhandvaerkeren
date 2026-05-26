import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { explainRecommendation } from '../../../lib/recommendPlan';
import type { PlanRecommendation } from '../../../lib/recommendPlan';
import type { VisibilityAuditResult } from '../../../lib/mockAnalyzeVisibility';

type Props = {
  audit: VisibilityAuditResult;
  recommendation: PlanRecommendation;
  isDa: boolean;
  compact?: boolean;
};

const GetStartedRecommendationPanel: React.FC<Props> = ({
  audit,
  recommendation,
  isDa,
  compact = false,
}) => {
  const copy = explainRecommendation(recommendation, isDa ? 'da' : 'en');
  const engineLabel =
    audit.engine === 'toprank'
      ? isDa
        ? 'Baseret på TopRank-audit'
        : 'Based on TopRank audit'
      : isDa
        ? 'Baseret på synlighedsanalyse'
        : 'Based on visibility analysis';

  const channels = [
    { label: isDa ? 'Søg' : 'Search', value: audit.scores.search },
    { label: isDa ? 'Lokal' : 'Local', value: audit.scores.local },
    { label: 'AI', value: audit.scores.ai },
    { label: 'Web', value: audit.scores.web },
  ];

  return (
    <section className={`advero-getstarted-rec ${compact ? 'advero-getstarted-rec--compact' : ''}`}>
      <div className="advero-getstarted-rec-head">
        <Sparkles className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="advero-getstarted-rec-kicker">{engineLabel}</p>
          <p className="advero-getstarted-rec-company">{audit.companyName}</p>
        </div>
        <div className="advero-getstarted-rec-score" aria-label={isDa ? 'Synlighedsscore' : 'Visibility score'}>
          <span className="advero-getstarted-rec-score-val">{audit.overallScore}</span>
          <span className="advero-getstarted-rec-score-max">/100</span>
        </div>
      </div>

      <h3 className="advero-getstarted-rec-headline">{copy.headline}</h3>
      <p className="advero-getstarted-rec-reason">{copy.reason}</p>

      {!compact ? (
        <>
          {audit.topRecommendation ? (
            <p className="advero-getstarted-rec-top">
              <strong>{isDa ? 'Vigtigste fund: ' : 'Top finding: '}</strong>
              {audit.topRecommendation}
            </p>
          ) : null}

          <div className="advero-getstarted-rec-channels">
            {channels.map((ch) => (
              <div key={ch.label} className="advero-getstarted-rec-channel">
                <span className="advero-getstarted-rec-channel-label">{ch.label}</span>
                <span className="advero-getstarted-rec-channel-val">{ch.value}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <p className="advero-getstarted-rec-foot">
        {isDa
          ? 'Planerne nedenfor er forudvalgt ud fra analysen. Du kan stadig ændre dem.'
          : 'Plans below are pre-selected from your analysis. You can still change them.'}{' '}
        <Link to={`/advero/audit/results?id=${encodeURIComponent(audit.id)}`} className="underline">
          {isDa ? 'Se fuld rapport' : 'View full report'}
        </Link>
      </p>
    </section>
  );
};

export default GetStartedRecommendationPanel;
