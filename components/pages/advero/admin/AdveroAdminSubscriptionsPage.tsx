import React, { useCallback, useEffect, useState } from 'react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import { formatAdminDate } from './adveroAdminFormat';

const AdveroAdminSubscriptionsPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const locale = isDa ? 'da-DK' : 'en-GB';
  const [status, setStatus] = useState('active');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { subscriptions } = await api.getAdveroAdminSubscriptions({
        status: status || undefined,
        limit: 50,
      });
      setRows(subscriptions);
    } catch {
      setError(isDa ? 'Kunne ikke hente abonnementer' : 'Could not load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [status, isDa]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <AdveroAdminPageHeader
        kicker={isDa ? 'Forretning' : 'Business'}
        title={isDa ? 'Abonnementer' : 'Subscriptions'}
        description={
          isDa
            ? 'Stripe-abonnementer knyttet til Advero workspaces.'
            : 'Stripe subscriptions linked to Advero workspaces.'
        }
        actions={
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white"
          >
            <option value="">{isDa ? 'Alle' : 'All'}</option>
            <option value="active">active</option>
            <option value="canceled">canceled</option>
            <option value="past_due">past_due</option>
          </select>
        }
      />

      {loading ? <p className="text-white/60">{isDa ? 'Henter…' : 'Loading…'}</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="advero-admin-table">
          <thead>
            <tr>
              <th>{isDa ? 'Virksomhed' : 'Company'}</th>
              <th>{isDa ? 'Plan' : 'Plan'}</th>
              <th>{isDa ? 'Linje' : 'Line'}</th>
              <th>{isDa ? 'Status' : 'Status'}</th>
              <th>{isDa ? 'Periode slut' : 'Period end'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="text-white/50">
                  {isDa ? 'Ingen abonnementer' : 'No subscriptions'}
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-white">{s.workspace?.companyName ?? '—'}</td>
                  <td>{s.tierId}</td>
                  <td>{s.serviceLine}</td>
                  <td>
                    <span className="advero-admin-pill">{s.status}</span>
                  </td>
                  <td className="text-white/60">{formatAdminDate(s.currentPeriodEnd, locale)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdveroAdminSubscriptionsPage;
