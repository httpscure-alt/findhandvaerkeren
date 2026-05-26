import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import { manualFulfillmentTasks } from '../../../../lib/manualFulfillmentTasks';
import { formatAdminDate } from './adveroAdminFormat';

type FulfillmentRow = {
  id: string;
  status: string;
  serviceLine: string;
  tierId: string;
  companyName: string;
  contactEmail: string | null;
  userEmail: string | null;
  websiteUrl: string | null;
  overallScore: number | null;
  weakestChannel: string | null;
  planHeadline: string | null;
  notes: string | null;
  auditId: string | null;
  workspaceId: string;
  createdAt: string;
};

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

function serviceLabel(line: string, isDa: boolean): string {
  if (line === 'ads') return 'Google Ads';
  if (line === 'seo') return 'SEO';
  if (line === 'growth') return isDa ? 'Growth+ (SEO + Ads)' : 'Growth+ (SEO + Ads)';
  return line;
}

const AdveroAdminFulfillmentPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const locale = isDa ? 'da-DK' : 'en-GB';
  const [status, setStatus] = useState('PENDING');
  const [serviceLine, setServiceLine] = useState('');
  const [rows, setRows] = useState<FulfillmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { fulfillments } = await api.getAdveroAdminFulfillment({
        status: status || undefined,
        serviceLine: serviceLine || undefined,
        limit: 50,
      });
      setRows(fulfillments);
    } catch {
      setError(isDa ? 'Kunne ikke hente fulfillment-kø' : 'Could not load fulfillment queue');
    } finally {
      setLoading(false);
    }
  }, [status, serviceLine, isDa]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRow = async (id: string, patch: { status?: string; notes?: string }) => {
    setSavingId(id);
    try {
      const { fulfillment } = await api.patchAdveroAdminFulfillment(id, patch);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: fulfillment.status, notes: fulfillment.notes } : r
        )
      );
    } catch {
      setError(isDa ? 'Kunne ikke gemme' : 'Could not save');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <AdveroAdminPageHeader
        kicker={isDa ? 'Drift' : 'Operations'}
        title={isDa ? 'Fulfillment-kø' : 'Fulfillment queue'}
        description={
          isDa
            ? 'Alle betalte SEO-, Google Ads- og Growth+-ordrer leveres manuelt, indtil den autonome motor er klar. Opdater status når I går i gang og afslutter.'
            : 'All paid SEO, Google Ads, and Growth+ orders are delivered manually until the autonomous engine is ready. Update status as you work.'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white"
            >
              <option value="">{isDa ? 'Alle status' : 'All statuses'}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={serviceLine}
              onChange={(e) => setServiceLine(e.target.value)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white"
            >
              <option value="">{isDa ? 'Alle ydelser' : 'All services'}</option>
              <option value="ads">Google Ads</option>
              <option value="seo">SEO</option>
              <option value="growth">Growth+</option>
            </select>
          </div>
        }
      />

      {loading ? <p className="text-white/60">{isDa ? 'Henter…' : 'Loading…'}</p> : null}
      {error ? <p className="mb-4 text-red-300">{error}</p> : null}

      <div className="space-y-4">
        {rows.length === 0 && !loading ? (
          <p className="text-white/50">{isDa ? 'Ingen ordrer i køen' : 'No orders in queue'}</p>
        ) : (
          rows.map((row) => (
            <article
              key={row.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{row.companyName}</h3>
                  <p className="text-sm text-white/60">
                    {serviceLabel(row.serviceLine, isDa)} · {row.tierId}
                    {row.overallScore != null ? ` · Audit ${row.overallScore}/100` : ''}
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {row.contactEmail || row.userEmail || '—'}
                    {row.websiteUrl ? (
                      <>
                        {' · '}
                        <a
                          href={row.websiteUrl.startsWith('http') ? row.websiteUrl : `https://${row.websiteUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-300 hover:text-white"
                        >
                          {row.websiteUrl}
                        </a>
                      </>
                    ) : null}
                  </p>
                  {row.planHeadline ? (
                    <p className="mt-2 text-sm text-amber-200/90">{row.planHeadline}</p>
                  ) : null}
                  {row.weakestChannel ? (
                    <p className="text-xs text-white/40">
                      {isDa ? 'Svageste kanal' : 'Weakest channel'}: {row.weakestChannel}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={row.status}
                    disabled={savingId === row.id}
                    onChange={(e) => updateRow(row.id, { status: e.target.value })}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-white/40">
                    {formatAdminDate(row.createdAt, locale)}
                  </span>
                </div>
              </div>

              {['seo', 'ads', 'growth'].includes(row.serviceLine) ? (
                <div className="mb-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                    {isDa ? 'Manuel checkliste' : 'Manual checklist'}
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-white/70">
                    {manualFulfillmentTasks(row.serviceLine, isDa ? 'da' : 'en').map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mb-3 flex flex-wrap gap-3 text-sm">
                {row.auditId ? (
                  <a
                    href={`/advero/audit/results?id=${encodeURIComponent(row.auditId)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-300 hover:text-white"
                  >
                    {isDa ? 'Se audit' : 'View audit'}
                  </a>
                ) : null}
                <Link to="/advero/admin/workspaces" className="text-sky-300 hover:text-white">
                  {isDa ? 'Kunder' : 'Customers'}
                </Link>
              </div>

              <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                {isDa ? 'Interne noter' : 'Internal notes'}
              </label>
              <textarea
                defaultValue={row.notes ?? ''}
                rows={2}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                placeholder={isDa ? 'Opsætningsnoter, kontaktet kunde, osv.' : 'Setup notes, contacted customer, etc.'}
                onBlur={(e) => {
                  const next = e.target.value.trim();
                  const prev = (row.notes ?? '').trim();
                  if (next !== prev) updateRow(row.id, { notes: next });
                }}
              />
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default AdveroAdminFulfillmentPage;
