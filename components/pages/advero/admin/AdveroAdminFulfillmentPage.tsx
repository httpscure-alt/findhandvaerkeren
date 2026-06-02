import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import { manualFulfillmentTasks } from '../../../../lib/manualFulfillmentTasks';
import { formatAdminDate } from './adveroAdminFormat';
import { markdownToHtml } from '../../../../lib/simpleMarkdown';
import { OPS_PLAYBOOKS, playbookForServiceLine, type OpsPlaybookKey } from '../../../../lib/opsPlaybooks';

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

function buildTriageSummary(row: FulfillmentRow, isDa: boolean): string {
  const lines: string[] = [];
  lines.push(`### ${isDa ? 'Auto-triage (fra ordre/audit)' : 'Auto triage (from order/audit)'}`);
  lines.push('');
  lines.push(`- **${isDa ? 'Firma' : 'Company'}**: ${row.companyName}`);
  lines.push(`- **${isDa ? 'Service' : 'Service'}**: ${row.serviceLine} · ${row.tierId}`);
  if (row.websiteUrl) lines.push(`- **Website**: ${row.websiteUrl}`);
  const email = row.contactEmail || row.userEmail;
  if (email) lines.push(`- **Email**: ${email}`);
  if (row.overallScore != null) lines.push(`- **Audit**: ${row.overallScore}/100`);
  if (row.weakestChannel) lines.push(`- **${isDa ? 'Svageste kanal' : 'Weakest channel'}**: ${row.weakestChannel}`);
  if (row.planHeadline) lines.push(`- **${isDa ? 'Plan headline' : 'Plan headline'}**: ${row.planHeadline}`);

  lines.push('');
  lines.push(`### ${isDa ? 'Manglende info (tjekliste)' : 'Missing info (checklist)'}`);
  lines.push(`- [${row.websiteUrl ? 'x' : ' '}] ${isDa ? 'Website' : 'Website'}`);
  lines.push(`- [${email ? 'x' : ' '}] ${isDa ? 'Kontakt-email' : 'Contact email'}`);
  lines.push(`- [ ] ${isDa ? 'Adgang: GBP (Manager)' : 'Access: GBP (Manager)'}`);
  lines.push(`- [ ] ${isDa ? 'Adgang: Search Console' : 'Access: Search Console'}`);
  lines.push(`- [ ] ${isDa ? 'Adgang: Google Ads (hvis Ads)' : 'Access: Google Ads (if Ads)'}`);
  lines.push(`- [ ] ${isDa ? 'Adgang: CMS + GA4' : 'Access: CMS + GA4'}`);
  return lines.join('\n');
}

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
  const [playbookOpenId, setPlaybookOpenId] = useState<string | null>(null);
  const [playbookTabById, setPlaybookTabById] = useState<Record<string, OpsPlaybookKey>>({});
  const [draftById, setDraftById] = useState<Record<string, string>>({});
  const [draftLoadingId, setDraftLoadingId] = useState<string | null>(null);
  const [translatedById, setTranslatedById] = useState<Record<string, { playbook?: string; draft?: string }>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);

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

  const copyPlaybook = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const generateDraft = async (row: FulfillmentRow) => {
    const id = row.id;
    setDraftLoadingId(id);
    setError(null);
    try {
      const key = (playbookTabById[id] || playbookForServiceLine(row.serviceLine)) as any;
      const pb = OPS_PLAYBOOKS.find((x) => x.key === key) || OPS_PLAYBOOKS[0];
      const staticPlaybook = isDa ? pb.markdownDa : pb.markdownEn;
      const triage = buildTriageSummary(row, isDa);
      const playbookMarkdown = key === 'triage' ? triage : `${triage}\n\n---\n\n${staticPlaybook}`;
      const { draft } = await api.generateAdveroFulfillmentOpsDraft(id, {
        lang: isDa ? 'da' : 'en',
        playbookKey: key,
        playbookMarkdown,
      });
      setDraftById((prev) => ({ ...prev, [id]: draft }));
    } catch (e: any) {
      setError(e?.message || (isDa ? 'Kunne ikke generere udkast' : 'Could not generate draft'));
    } finally {
      setDraftLoadingId(null);
    }
  };

  const saveDraftToNotes = async (row: FulfillmentRow) => {
    const draft = draftById[row.id];
    if (!draft) return;
    const prev = (row.notes ?? '').trim();
    const next = `${prev ? `${prev}\n\n` : ''}---\nOps AI draft (${new Date().toISOString().slice(0, 10)})\n\n${draft}`.trim();
    await updateRow(row.id, { notes: next, status: row.status === 'PENDING' ? 'IN_PROGRESS' : undefined });
  };

  const translateDaToEn = async (row: FulfillmentRow, kind: 'playbook' | 'draft', text: string) => {
    if (!text.trim()) return;
    setTranslatingId(row.id);
    setError(null);
    try {
      const { translated } = await api.adminTranslateMarkdownDaToEn({ markdown: text });
      setTranslatedById((prev) => ({
        ...prev,
        [row.id]: {
          ...(prev[row.id] || {}),
          [kind]: translated || '',
        },
      }));
    } catch (e: any) {
      setError(e?.message || (isDa ? 'Kunne ikke oversætte' : 'Could not translate'));
    } finally {
      setTranslatingId(null);
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
                <button
                  type="button"
                  onClick={() => {
                    const open = playbookOpenId === row.id ? null : row.id;
                    setPlaybookOpenId(open);
                    if (open) {
                      setPlaybookTabById((prev) => ({
                        ...prev,
                        [row.id]: prev[row.id] || playbookForServiceLine(row.serviceLine),
                      }));
                    }
                  }}
                  className="text-sky-300 hover:text-white"
                >
                  {playbookOpenId === row.id ? (isDa ? 'Skjul playbook' : 'Hide playbook') : (isDa ? 'Åbn playbook' : 'Open playbook')}
                </button>
              </div>

              {playbookOpenId === row.id ? (
                <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {isDa ? 'Ops playbooks (intern)' : 'Ops playbooks (internal)'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {OPS_PLAYBOOKS.map((p) => {
                        const active = (playbookTabById[row.id] || 'triage') === p.key;
                        return (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => setPlaybookTabById((prev) => ({ ...prev, [row.id]: p.key }))}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              active
                                ? 'border-white/25 bg-white/10 text-white'
                                : 'border-white/10 bg-black/20 text-white/70 hover:bg-white/5'
                            }`}
                          >
                            {isDa ? p.titleDa : p.titleEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {(() => {
                    const key = playbookTabById[row.id] || 'triage';
                    const pb = OPS_PLAYBOOKS.find((x) => x.key === key) || OPS_PLAYBOOKS[0];
                    const md = isDa ? pb.markdownDa : pb.markdownEn;
                    const html = markdownToHtml(md);
                    return (
                      <>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-white/50">
                            {isDa
                              ? 'Brug som playbook til alle henvendelser i køen. Copy/paste skabelonerne til mail/noter.'
                              : 'Use as a playbook for any inquiry. Copy/paste templates into email/notes.'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {isDa ? (
                              <button
                                type="button"
                                disabled={translatingId === row.id}
                                onClick={() => translateDaToEn(row, 'playbook', md)}
                                className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/5 disabled:opacity-60"
                              >
                                {translatingId === row.id ? 'Oversætter…' : 'Oversæt (EN)'}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => copyPlaybook(md)}
                              className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/5"
                            >
                              {isDa ? 'Kopiér' : 'Copy'}
                            </button>
                          </div>
                        </div>
                        <div
                          className="advero-blog-prose max-w-none text-white/80"
                          dangerouslySetInnerHTML={{ __html: html }}
                        />
                        {isDa && translatedById[row.id]?.playbook ? (
                          <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                              English preview (playbook)
                            </p>
                            <div
                              className="advero-blog-prose mt-2 max-w-none text-white/85"
                              dangerouslySetInnerHTML={{
                                __html: markdownToHtml(translatedById[row.id]?.playbook || ''),
                              }}
                            />
                          </div>
                        ) : null}

                        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                              {isDa ? 'AI-udkast (kræver godkendelse)' : 'AI draft (review required)'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={draftLoadingId === row.id}
                                onClick={() => generateDraft(row)}
                                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                              >
                                {draftLoadingId === row.id ? (isDa ? 'Genererer…' : 'Generating…') : (isDa ? 'Generér' : 'Generate')}
                              </button>
                              {draftById[row.id] ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => copyPlaybook(draftById[row.id])}
                                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/5"
                                  >
                                    {isDa ? 'Kopiér udkast' : 'Copy draft'}
                                  </button>
                                  {isDa ? (
                                    <button
                                      type="button"
                                      disabled={translatingId === row.id}
                                      onClick={() => translateDaToEn(row, 'draft', draftById[row.id])}
                                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/5 disabled:opacity-60"
                                    >
                                      {translatingId === row.id ? 'Oversætter…' : 'Oversæt udkast (EN)'}
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => saveDraftToNotes(row)}
                                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/5"
                                  >
                                    {isDa ? 'Gem i noter' : 'Save to notes'}
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>

                          {draftById[row.id] ? (
                            <div
                              className="advero-blog-prose mt-3 max-w-none rounded-lg border border-white/10 bg-white/[0.03] p-3 text-white/85"
                              dangerouslySetInnerHTML={{ __html: markdownToHtml(draftById[row.id]) }}
                            />
                          ) : (
                            <p className="mt-2 text-xs text-white/55">
                              {isDa
                                ? 'Generér et forslag til plan + kundemail. Gem først efter menneskelig review.'
                                : 'Generate a draft plan + client email. Save only after human review.'}
                            </p>
                          )}

                          {isDa && translatedById[row.id]?.draft ? (
                            <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                                English preview (draft)
                              </p>
                              <div
                                className="advero-blog-prose mt-2 max-w-none text-white/85"
                                dangerouslySetInnerHTML={{
                                  __html: markdownToHtml(translatedById[row.id]?.draft || ''),
                                }}
                              />
                            </div>
                          ) : null}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : null}

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
