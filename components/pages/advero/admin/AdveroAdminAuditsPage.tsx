import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import { auditStatusClass, formatAdminDate } from './adveroAdminFormat';

const STATUS_OPTIONS = ['', 'PENDING', 'PROCESSING', 'COMPLETE', 'FAILED'] as const;

const AdveroAdminAuditsPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const locale = isDa ? 'da-DK' : 'en-GB';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
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
      const { audits } = await api.getAdveroAdminAudits({
        search: debounced || undefined,
        status: status || undefined,
        limit: 50,
      });
      setRows(audits);
    } catch {
      setError(isDa ? 'Kunne ikke hente audits' : 'Could not load audits');
    } finally {
      setLoading(false);
    }
  }, [debounced, status, isDa]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <AdveroAdminPageHeader
        kicker={isDa ? 'Forretning' : 'Business'}
        title={isDa ? 'Synlighedsaudits' : 'Visibility audits'}
        description={
          isDa
            ? 'Alle kørte og ventende audits — åbn rapport for detaljer.'
            : 'All completed and queued audits — open report for details.'
        }
        actions={
          <>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white"
            >
              <option value="">{isDa ? 'Alle status' : 'All statuses'}</option>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isDa ? 'Søg…' : 'Search…'}
              className="advero-admin-search"
            />
          </>
        }
      />

      {loading ? <p className="text-white/60">{isDa ? 'Henter…' : 'Loading…'}</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="advero-admin-table">
          <thead>
            <tr>
              <th>{isDa ? 'Virksomhed' : 'Company'}</th>
              <th>URL</th>
              <th>{isDa ? 'Status' : 'Status'}</th>
              <th>Score</th>
              <th>{isDa ? 'Oprettet' : 'Created'}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="text-white/50">
                  {isDa ? 'Ingen audits' : 'No audits'}
                </td>
              </tr>
            ) : (
              rows.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium text-white">{a.companyName}</td>
                  <td className="max-w-[180px] truncate text-white/70">{a.websiteUrl ?? '—'}</td>
                  <td>
                    <span className={auditStatusClass(a.status)}>{a.status}</span>
                  </td>
                  <td>{a.overallScore ?? '—'}</td>
                  <td className="text-white/60">{formatAdminDate(a.createdAt, locale)}</td>
                  <td>
                    <Link
                      to={`/advero/audit/results?id=${encodeURIComponent(a.id)}`}
                      className="text-sm text-sky-300 hover:text-white"
                    >
                      {isDa ? 'Rapport' : 'Report'}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdveroAdminAuditsPage;
