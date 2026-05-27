import React, { useCallback, useEffect, useState } from 'react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import { formatAdminDate } from './adveroAdminFormat';
import { entitlementsFromSubscription, packageLabel } from '../../../../lib/workspaceEntitlements';

const AdveroAdminWorkspacesPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const locale = isDa ? 'da-DK' : 'en-GB';
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { workspaces } = await api.getAdveroAdminWorkspaces({
        search: debounced || undefined,
        limit: 50,
      });
      setRows(workspaces);
    } catch {
      setError(isDa ? 'Kunne ikke hente kunder' : 'Could not load customers');
    } finally {
      setLoading(false);
    }
  }, [debounced, isDa]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <AdveroAdminPageHeader
        kicker={isDa ? 'Forretning' : 'Business'}
        title={isDa ? 'Kunder & workspaces' : 'Customers & workspaces'}
        description={
          isDa
            ? 'Alle Advero-kunder — fra audit-intake til betalende workspace.'
            : 'All Advero customers — from audit intake to paying workspace.'
        }
        actions={
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isDa ? 'Søg virksomhed eller e-mail…' : 'Search company or email…'}
            className="advero-admin-search"
          />
        }
      />

      {loading ? <p className="text-white/60">{isDa ? 'Henter…' : 'Loading…'}</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="advero-admin-table">
          <thead>
            <tr>
              <th>{isDa ? 'Virksomhed' : 'Company'}</th>
              <th>{isDa ? 'Kontakt' : 'Contact'}</th>
              <th>{isDa ? 'Bruger' : 'User'}</th>
              <th>{isDa ? 'Plan' : 'Plan'}</th>
              <th>{isDa ? 'Moduler' : 'Modules'}</th>
              <th>Audits</th>
              <th>{isDa ? 'Oprettet' : 'Created'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className="text-white/50">
                  {isDa ? 'Ingen kunder fundet' : 'No customers found'}
                </td>
              </tr>
            ) : (
              rows.map((w) => {
                const sub = w.subscriptions?.[0];
                const ent = sub
                  ? entitlementsFromSubscription(sub.tierId, sub.serviceLine)
                  : null;
                return (
                  <tr key={w.id}>
                    <td className="font-medium text-white">{w.companyName}</td>
                    <td>{w.contactEmail ?? '—'}</td>
                    <td>{w.user?.email ?? (isDa ? 'Gæst / audit' : 'Guest / audit')}</td>
                    <td>
                      {sub ? (
                        <span className="advero-admin-pill">
                          {packageLabel(ent!, isDa ? 'da' : 'en')} · {sub.status}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {ent ? (
                        <span className="flex flex-wrap gap-1">
                          {ent.seo ? (
                            <span className="advero-admin-pill text-[10px]">SEO</span>
                          ) : null}
                          {ent.ads ? (
                            <span className="advero-admin-pill text-[10px]">Ads</span>
                          ) : null}
                          {ent.aiVisibility ? (
                            <span className="advero-admin-pill text-[10px]">AI</span>
                          ) : null}
                          {!ent.seo && !ent.ads && !ent.aiVisibility ? '—' : null}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{w._count?.audits ?? 0}</td>
                    <td className="text-white/60">{formatAdminDate(w.createdAt, locale)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdveroAdminWorkspacesPage;
