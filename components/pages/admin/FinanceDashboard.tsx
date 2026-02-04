import * as React from 'react';
import { useState, useEffect } from 'react';
import { Language } from '../../../types';
import { DollarSign, TrendingUp, Users, Calendar, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import { exportFinanceMetricsToCSV } from '../../../utils/csvExport';

interface FinanceDashboardProps {
  lang: Language;
  onBack: () => void;
}

interface FinanceMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  newSubscriptionsThisMonth: number;
  cancellationsThisMonth: number;
  upcomingRenewals: number;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ lang, onBack }) => {
  const toast = useToast();
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.getFinanceMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch finance metrics:', error);
        toast.error(lang === 'da' ? 'Kunne ikke indlæse finansielle data' : 'Failed to load finance data');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">{lang === 'da' ? 'Indlæser...' : 'Loading...'}</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center text-gray-500">
          {lang === 'da' ? 'Kunne ikke indlæse finansielle data' : 'Failed to load finance data'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Finans' : 'Finance'}
          </h1>
          <p className="text-gray-500">
            {lang === 'da' ? 'Finansiel oversigt og indtægter' : 'Financial overview and revenue'}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {lang === 'da' ? 'Tilbage' : 'Back'}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">
              {lang === 'da' ? 'Samlet indtægt' : 'Total Revenue'}
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1D1D1F] mb-1">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <p className="text-sm text-gray-500">
            {lang === 'da' ? 'Alle tider' : 'All-time'}
          </p>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">
              {lang === 'da' ? 'Månedlig indtægt' : 'Monthly Recurring Revenue'}
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1D1D1F] mb-1">
            {formatCurrency(metrics.monthlyRecurringRevenue)}
          </div>
          <p className="text-sm text-gray-500">
            {lang === 'da' ? 'MRR' : 'MRR'}
          </p>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">
              {lang === 'da' ? 'Aktive abonnementer' : 'Active Subscriptions'}
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1D1D1F] mb-1">
            {metrics.activeSubscriptions}
          </div>
          <p className="text-sm text-gray-500">
            {lang === 'da' ? 'Aktive partnere' : 'Active partners'}
          </p>
        </div>

        {/* New Subscriptions This Month */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ArrowUp className="text-emerald-600" size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">
              {lang === 'da' ? 'Nye denne måned' : 'New This Month'}
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1D1D1F] mb-1">
            {metrics.newSubscriptionsThisMonth}
          </div>
          <p className="text-sm text-gray-500">
            {lang === 'da' ? 'Nye abonnementer' : 'New subscriptions'}
          </p>
        </div>

        {/* Cancellations This Month */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <ArrowDown className="text-red-600" size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">
              {lang === 'da' ? 'Opsigelser denne måned' : 'Cancellations This Month'}
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1D1D1F] mb-1">
            {metrics.cancellationsThisMonth}
          </div>
          <p className="text-sm text-gray-500">
            {lang === 'da' ? 'Opsigelser' : 'Cancellations'}
          </p>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-amber-600" size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">
              {lang === 'da' ? 'Kommende fornyelser' : 'Upcoming Renewals'}
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1D1D1F] mb-1">
            {metrics.upcomingRenewals}
          </div>
          <p className="text-sm text-gray-500">
            {lang === 'da' ? 'Næste 30 dage' : 'Next 30 days'}
          </p>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            if (metrics) {
              exportFinanceMetricsToCSV(metrics);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          {lang === 'da' ? 'Eksporter CSV' : 'Export CSV'}
        </button>
      </div>
    </div>
  );
};

export default FinanceDashboard;







