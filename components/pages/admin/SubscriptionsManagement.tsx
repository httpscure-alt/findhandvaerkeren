import React, { useState, useEffect } from 'react';
import { Language } from '../../../types';
import { CreditCard, CheckCircle, Calendar, TrendingUp, Download } from 'lucide-react';
import { api } from '../../../services/api';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { ErrorState } from '../../common/ErrorState';
import { EmptyState } from '../../common/EmptyState';
import { exportSubscriptionsToCSV } from '../../../utils/csvExport';

interface SubscriptionsManagementProps {
  lang: Language;
  onBack: () => void;
}

interface Subscription {
  id: string;
  company?: { name: string };
  tier: string;
  status: string;
  billingCycle?: string;
  currentPeriodEnd?: string;
  startDate: string;
  stripeSubscriptionId?: string;
}

const SubscriptionsManagement: React.FC<SubscriptionsManagementProps> = ({ lang, onBack }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    monthlyRecurring: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [financeMetrics, companiesResponse] = await Promise.all([
        api.getFinanceMetrics(),
        api.getCompanies({}),
      ]);

      // Get subscriptions from companies (simplified - in production, fetch from subscriptions table)
      const allSubscriptions: Subscription[] = [];
      companiesResponse.companies.forEach((company: any) => {
        if (company.subscriptions && company.subscriptions.length > 0) {
          allSubscriptions.push(...company.subscriptions);
        }
      });

      setSubscriptions(allSubscriptions);
      setStats({
        totalRevenue: financeMetrics.totalRevenue,
        activeSubscriptions: financeMetrics.activeSubscriptions,
        monthlyRecurring: financeMetrics.monthlyRecurringRevenue,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAmount = (tier: string, billingCycle?: string) => {
    const monthlyAmount = tier === 'Elite' ? 149 : tier === 'Premium' ? 99 : 49;
    return billingCycle === 'annual' ? monthlyAmount * 12 * 0.8 : monthlyAmount;
  };

  const handleExportCSV = () => {
    exportSubscriptionsToCSV(subscriptions);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <h1 className="text-3xl font-bold text-[#1D1D1F] mb-8">
        {lang === 'da' ? 'Abonnementsstyring' : 'Subscriptions Management'}
      </h1>

      {/* Header with Export */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Abonnementsstyring' : 'Subscriptions Management'}
          </h1>
          <p className="text-gray-500">
            {lang === 'da' ? 'Administrer alle abonnementer' : 'Manage all subscriptions'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportCSV}
            disabled={subscriptions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {lang === 'da' ? 'Eksporter CSV' : 'Export CSV'}
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {lang === 'da' ? 'Tilbage' : 'Back'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-nexus-subtext">{lang === 'da' ? 'Total Omsætning' : 'Total Revenue'}</p>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F]">{formatCurrency(stats.totalRevenue)}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-nexus-subtext">{lang === 'da' ? 'Aktive Abonnementer' : 'Active Subscriptions'}</p>
              <CheckCircle className="text-blue-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F]">{stats.activeSubscriptions}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-nexus-subtext">{lang === 'da' ? 'Månedlig Tilbagevendende' : 'Monthly Recurring'}</p>
              <CreditCard className="text-purple-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F]">{formatCurrency(stats.monthlyRecurring)}</h3>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden p-6">
          <LoadingSkeleton variant="table" count={5} />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load subscriptions" message={error} onRetry={fetchData} />
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Virksomhed' : 'Company'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Plan' : 'Plan'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Beløb' : 'Amount'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Status' : 'Status'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Næste Fakturering' : 'Next Billing'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#1D1D1F]">{sub.company?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                          sub.tier === 'Elite' ? 'bg-purple-50 text-purple-700' :
                          sub.tier === 'Premium' ? 'bg-indigo-50 text-indigo-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {sub.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#1D1D1F]">
                        {formatCurrency(getAmount(sub.tier, sub.billingCycle))}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          sub.status === 'active' ? 'bg-green-50 text-green-700' :
                          sub.status === 'canceled' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          <CheckCircle size={12} />
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-nexus-subtext flex items-center gap-1">
                        <Calendar size={14} />
                        {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {subscriptions.length === 0 && !loading && (
            <EmptyState
              icon={CreditCard}
              title={lang === 'da' ? 'Ingen abonnementer' : 'No subscriptions'}
              description={lang === 'da' ? 'Der er ingen abonnementer endnu.' : 'There are no subscriptions yet.'}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionsManagement;
