import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Circle, Sparkles } from 'lucide-react';
import type { DashboardIntelligence } from '../../../../lib/adveroDashboardIntelligence';

type BlocksProps = {
  intel: DashboardIntelligence;
  isDa: boolean;
};

export const AdveroDashboardSetupChecklist: React.FC<BlocksProps> = ({ intel, isDa }) => {
  if (!intel.setup.showChecklist) return null;

  return (
    <section className="advero-dash-setup advero-home-enter">
      <div className="advero-dash-setup-head">
        <h2 className="advero-home-section-title">
          {isDa ? 'Workspace-opsætning' : 'Workspace setup'}
        </h2>
        <p className="advero-home-section-sub">
          {isDa
            ? `${intel.setup.done} af ${intel.setup.total} trin fuldført — styrker aktivering og tillid.`
            : `${intel.setup.done} of ${intel.setup.total} steps complete — improves activation and trust.`}
        </p>
      </div>
      <ul className="advero-dash-setup-list">
        {intel.setup.items.map((item) => (
          <li key={item.id} className={`advero-dash-setup-item ${item.done ? 'advero-dash-setup-item--done' : ''}`}>
            <span className="advero-dash-setup-icon" aria-hidden>
              {item.done ? <Check size={14} strokeWidth={2.5} /> : <Circle size={14} />}
            </span>
            <span className="advero-dash-setup-label">
              {isDa ? item.labelDa : item.labelEn}
              {item.optional ? (
                <span className="advero-dash-setup-optional">{isDa ? 'Valgfrit' : 'Optional'}</span>
              ) : null}
            </span>
            {!item.done && item.actionHref ? (
              <Link to={item.actionHref} className="advero-dash-setup-action">
                {isDa ? item.actionLabelDa : item.actionLabelEn}
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
};

export const AdveroDashboardPriorityBlock: React.FC<BlocksProps> = ({ intel, isDa }) => {
  const p = intel.priority;
  return (
    <section id="priority" className="advero-dash-priority advero-home-enter">
      <p className="mono-label advero-dash-priority-kicker">
        {isDa ? 'Prioriteret anbefaling' : 'Priority recommendation'}
      </p>
      <div className="advero-dash-priority-inner">
        <div className="advero-dash-priority-main">
          <span className={`advero-home-priority advero-home-priority--${p.priorityKey}`}>{p.priority}</span>
          <h2 className="advero-dash-priority-title">{p.title}</h2>
          <p className="advero-dash-priority-body">{p.body}</p>
          <p className="advero-dash-business-impact">
            <strong>{isDa ? 'Hvorfor det betyder noget: ' : 'Why it matters: '}</strong>
            {p.businessImpact}
          </p>
          <Link to={p.ctaHref} className="advero-dash-btn-primary inline-flex items-center gap-2 !mt-0">
            {p.cta}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
};

export const AdveroDashboardConnectedFlow: React.FC<BlocksProps> = ({ intel, isDa }) => (
  <section className="advero-dash-connected advero-home-enter" aria-label={isDa ? 'Forbundet arbejdsgang' : 'Connected workflow'}>
    <h2 className="advero-home-section-title">{isDa ? 'Forbundet synligheds-OS' : 'Connected visibility OS'}</h2>
    <p className="advero-home-section-sub">
      {isDa
        ? 'Fra audit til handling — én sammenhængende fortælling på tværs af faner.'
        : 'From audit to action — one coherent story across tabs.'}
    </p>
    <ol className="advero-dash-connected-steps">
      {intel.connectedFlow.map((step, i) => (
        <li key={step.key} className="advero-dash-connected-step">
          <span className="advero-dash-connected-num">{i + 1}</span>
          <div className="advero-dash-connected-content">
            <p className="advero-dash-connected-label">{step.label}</p>
            {step.href ? (
              <Link to={step.href} className="advero-dash-connected-detail advero-dash-connected-detail--link">
                {step.detail}
              </Link>
            ) : (
              <p className="advero-dash-connected-detail">{step.detail}</p>
            )}
          </div>
          {i < intel.connectedFlow.length - 1 ? (
            <ArrowRight className="advero-dash-connected-arrow hidden sm:block" size={16} aria-hidden />
          ) : null}
        </li>
      ))}
    </ol>
  </section>
);

export const AdveroDashboardWorkspaceHealth: React.FC<BlocksProps> = ({ intel, isDa }) => (
  <section className="advero-dash-health advero-home-enter">
    <h2 className="advero-home-section-title">{isDa ? 'Workspace-helbred' : 'Workspace health'}</h2>
    <p className="advero-home-section-sub">
      {isDa ? 'Operativ infrastruktur — ikke teknisk støj.' : 'Operational infrastructure — not technical noise.'}
    </p>
    <ul className="advero-dash-health-grid">
      {intel.workspaceHealth.map((item) => (
        <li key={item.label} className={`advero-dash-health-item advero-dash-health-item--${item.tone}`}>
          <p className="mono-label advero-dash-health-label">{item.label}</p>
          <p className="advero-dash-health-status">{item.status}</p>
        </li>
      ))}
    </ul>
  </section>
);

export const AdveroDashboardVisibilityHistory: React.FC<BlocksProps> = ({ intel, isDa }) => (
  <section className="advero-dash-history advero-home-panel advero-home-enter">
    <div className="advero-home-panel-head">
      <div>
        <h2 className="advero-home-section-title">{isDa ? 'Synlighedshistorik' : 'Visibility history'}</h2>
        <p className="advero-home-section-sub">
          {isDa
            ? 'Bevis for værdi over tid — score, søgning og AI.'
            : 'Proof of value over time — score, search, and AI.'}
        </p>
      </div>
    </div>
    <div className="advero-dash-history-bars">
      {intel.history.map((pt) => (
        <div key={pt.label} className="advero-dash-history-col">
          <div
            className="advero-dash-history-bar"
            style={{ height: `${Math.max(12, pt.score)}%` }}
            title={`${pt.score}`}
          />
          <span className="mono-label advero-dash-history-label">{pt.label}</span>
          <span className="advero-dash-history-score">{pt.score}</span>
        </div>
      ))}
    </div>
    {!intel.hasAudit ? (
      <p className="advero-dash-history-hint">
        {isDa ? 'Kør audit for historik baseret på jeres data.' : 'Run an audit for history based on your data.'}
      </p>
    ) : null}
  </section>
);

export const AdveroDashboardGrowthUpsell: React.FC<BlocksProps> = ({ intel }) => {
  if (!intel.growthUpsell) return null;
  const u = intel.growthUpsell;
  return (
    <section className="advero-dash-upsell advero-home-enter">
      <Sparkles size={18} className="text-sky-200/80 shrink-0" aria-hidden />
      <p className="advero-dash-upsell-body">{u.body}</p>
      <Link to={u.href} className="advero-dash-upsell-cta">
        {u.cta}
        <ArrowRight size={14} aria-hidden />
      </Link>
    </section>
  );
};

export function MetricBusinessImpact({ text }: { text: string }) {
  return <p className="advero-dash-metric-impact">{text}</p>;
}
