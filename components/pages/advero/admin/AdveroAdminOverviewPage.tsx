import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import { auditStatusClass, formatAdminDate } from './adveroAdminFormat';

type Overview = Awaited<ReturnType<typeof api.getAdveroAdminOverview>>;

const AdveroAdminOverviewPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const locale = isDa ? 'da-DK' : 'en-GB';
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAdveroAdminOverview();
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError(isDa ? 'Kunne ikke hente overblik' : 'Could not load overview');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isDa]);

  const stats = data
    ? [
        { label: isDa ? 'Kunder (workspaces)' : 'Customers (workspaces)', value: data.workspaces },
        { label: isDa ? 'Med login' : 'With login', value: data.workspacesWithUser },
        { label: isDa ? 'Synlighedsaudits' : 'Visibility audits', value: data.audits },
        { label: isDa ? 'Aktive abonnementer' : 'Active subscriptions', value: data.activeSubscriptions },
        {
          label: isDa ? 'Fulfillment afventer' : 'Fulfillment pending',
          value: data.pendingFulfillment ?? 0,
        },
        {
          label: isDa ? 'Fulfillment i gang' : 'Fulfillment in progress',
          value: data.fulfillmentsInProgress ?? 0,
        },
        { label: isDa ? 'Brugere i alt' : 'Total users', value: data.totalUsers },
        { label: isDa ? 'Audits i kø' : 'Audits queued', value: data.auditsPending + data.auditsProcessing },
        { label: isDa ? 'Audits fejlet' : 'Audits failed', value: data.auditsFailed },
      ]
    : [];

  return (
    <div>
      <AdveroAdminPageHeader
        kicker={isDa ? 'Internt' : 'Internal'}
        title={isDa ? 'Forretningsoverblik' : 'Business overview'}
        description={
          isDa
            ? 'Kunder, audits, abonnementer og indhold — alt Advero-drift på ét sted.'
            : 'Customers, audits, subscriptions, and content — all Advero operations in one place.'
        }
      />

      {loading ? <p className="text-white/60">{isDa ? 'Henter…' : 'Loading…'}</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}

      {data && (data.pendingFulfillment ?? 0) > 0 ? (
        <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {isDa
            ? `${data.pendingFulfillment} ny(e) ordre afventer opsætning.`
            : `${data.pendingFulfillment} new order(s) awaiting setup.`}{' '}
          <Link to="/advero/admin/fulfillment" className="font-semibold text-white underline">
            {isDa ? 'Åbn nye ordrer →' : 'Open new orders →'}
          </Link>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="advero-admin-stat-grid mb-8">
            {stats.map((s) => (
              <div key={s.label} className="advero-admin-stat-card">
                <div className="advero-admin-stat-value">{s.value}</div>
                <div className="advero-admin-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                  {isDa ? 'Seneste audits' : 'Recent audits'}
                </h2>
                <Link to="/advero/admin/audits" className="text-sm text-sky-300 hover:text-white">
                  {isDa ? 'Se alle →' : 'View all →'}
                </Link>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="advero-admin-table">
                  <thead>
                    <tr>
                      <th>{isDa ? 'Virksomhed' : 'Company'}</th>
                      <th>{isDa ? 'Status' : 'Status'}</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentAudits.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-white/50">
                          {isDa ? 'Ingen audits endnu' : 'No audits yet'}
                        </td>
                      </tr>
                    ) : (
                      data.recentAudits.map((a) => (
                        <tr key={a.id}>
                          <td>
                            <Link
                              to={`/advero/audit/results?id=${encodeURIComponent(a.id)}`}
                              className="text-sky-300 hover:text-white"
                            >
                              {a.companyName}
                            </Link>
                            <div className="text-xs text-white/45">{formatAdminDate(a.createdAt, locale)}</div>
                          </td>
                          <td>
                            <span className={auditStatusClass(a.status)}>{a.status}</span>
                          </td>
                          <td>{a.overallScore ?? '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                  {isDa ? 'Seneste kunder' : 'Recent customers'}
                </h2>
                <Link to="/advero/admin/workspaces" className="text-sm text-sky-300 hover:text-white">
                  {isDa ? 'Se alle →' : 'View all →'}
                </Link>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="advero-admin-table">
                  <thead>
                    <tr>
                      <th>{isDa ? 'Virksomhed' : 'Company'}</th>
                      <th>{isDa ? 'E-mail' : 'Email'}</th>
                      <th>Audits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentWorkspaces.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-white/50">
                          {isDa ? 'Ingen workspaces endnu' : 'No workspaces yet'}
                        </td>
                      </tr>
                    ) : (
                      data.recentWorkspaces.map((w) => (
                        <tr key={w.id}>
                          <td className="font-medium text-white">{w.companyName}</td>
                          <td className="text-white/70">{w.user?.email ?? w.contactEmail ?? '—'}</td>
                          <td>{w._count.audits}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdveroAdminOverviewPage;
