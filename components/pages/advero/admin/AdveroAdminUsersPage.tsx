import React, { useCallback, useEffect, useState } from 'react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import { formatAdminDate } from './adveroAdminFormat';

const AdveroAdminUsersPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const locale = isDa ? 'da-DK' : 'en-GB';
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
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
      const { users } = await api.getAdminUsers({
        search: debounced || undefined,
        role: role || undefined,
        limit: 50,
      });
      setRows(users);
    } catch {
      setError(isDa ? 'Kunne ikke hente brugere' : 'Could not load users');
    } finally {
      setLoading(false);
    }
  }, [debounced, role, isDa]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <AdveroAdminPageHeader
        kicker={isDa ? 'Platform' : 'Platform'}
        title={isDa ? 'Brugere' : 'Users'}
        description={
          isDa
            ? 'Alle konti — admin, partner og forbruger.'
            : 'All accounts — admin, partner, and consumer.'
        }
        actions={
          <>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white"
            >
              <option value="">{isDa ? 'Alle roller' : 'All roles'}</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PARTNER">PARTNER</option>
              <option value="CONSUMER">CONSUMER</option>
            </select>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isDa ? 'Søg e-mail…' : 'Search email…'}
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
              <th>E-mail</th>
              <th>{isDa ? 'Navn' : 'Name'}</th>
              <th>{isDa ? 'Rolle' : 'Role'}</th>
              <th>{isDa ? 'Verificeret' : 'Verified'}</th>
              <th>{isDa ? 'Oprettet' : 'Created'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="text-white/50">
                  {isDa ? 'Ingen brugere' : 'No users'}
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-white">{u.email}</td>
                  <td>{u.name ?? '—'}</td>
                  <td>
                    <span className="advero-admin-pill">{u.role}</span>
                  </td>
                  <td>{u.isVerified ? (isDa ? 'Ja' : 'Yes') : (isDa ? 'Nej' : 'No')}</td>
                  <td className="text-white/60">{formatAdminDate(u.createdAt, locale)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdveroAdminUsersPage;
