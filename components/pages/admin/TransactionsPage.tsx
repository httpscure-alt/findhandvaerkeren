import React, { useState, useEffect } from 'react';
import { Language } from '../../../types';
import { Calendar, Download, Filter } from 'lucide-react';
import { api } from '../../../services/api';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { ErrorState } from '../../common/ErrorState';
import { EmptyState } from '../../common/EmptyState';
import { exportTransactionsToCSV } from '../../../utils/csvExport';
import { Receipt } from 'lucide-react';

interface TransactionsPageProps {
  lang: Language;
  onBack: () => void;
}

interface Transaction {
  id: string;
  userOrCompany: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  status: 'paid' | 'failed' | 'upcoming' | 'succeeded';
  date: string;
  transactionId: string;
  subscriptionId?: string;
  eventType?: string;
  createdAt: string;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ lang, onBack }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  useEffect(() => {
    fetchTransactions();
  }, [dateRange]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTransactions({ dateRange });
      setTransactions(data.transactions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
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

  const getStatusBadge = (status: Transaction['status']) => {
    const styles = {
      paid: 'bg-green-50 text-green-700',
      failed: 'bg-red-50 text-red-700',
      upcoming: 'bg-amber-50 text-amber-700',
    };
    const labels = {
      paid: lang === 'da' ? 'Betalt' : 'Paid',
      failed: lang === 'da' ? 'Fejlet' : 'Failed',
      upcoming: lang === 'da' ? 'Kommende' : 'Upcoming',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Transaktioner' : 'Transactions'}
          </h1>
          <p className="text-gray-500">
            {lang === 'da' ? 'Fuld transaktionshistorik' : 'Complete transaction history'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {lang === 'da' ? 'Tilbage' : 'Back'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {lang === 'da' ? 'Filtrer efter periode:' : 'Filter by period:'}
          </span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
          >
            <option value="all">{lang === 'da' ? 'Alle' : 'All'}</option>
            <option value="month">{lang === 'da' ? 'Denne måned' : 'This Month'}</option>
            <option value="quarter">{lang === 'da' ? 'Dette kvartal' : 'This Quarter'}</option>
            <option value="year">{lang === 'da' ? 'Dette år' : 'This Year'}</option>
          </select>
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {lang === 'da' ? 'Eksporter CSV' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-6">
          <LoadingSkeleton variant="table" count={5} />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load transactions" message={error} onRetry={fetchTransactions} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {lang === 'da' ? 'Bruger / Virksomhed' : 'User or Company'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {lang === 'da' ? 'Plan' : 'Plan Name'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {lang === 'da' ? 'Faktureringscyklus' : 'Billing Cycle'}
                    </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Beløb' : 'Amount'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Status' : 'Status'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Dato' : 'Date'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Transaktions-ID' : 'Transaction ID'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {lang === 'da' ? 'Type' : 'Event Type'}
                </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1D1D1F]">
                        {transaction.userOrCompany}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {transaction.planName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {transaction.billingCycle === 'monthly'
                          ? (lang === 'da' ? 'Månedligt' : 'Monthly')
                          : (lang === 'da' ? 'Årligt' : 'Annual')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#1D1D1F]">
                        {formatCurrency(transaction.amount)} {transaction.currency?.toUpperCase() || 'USD'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {transaction.transactionId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.eventType || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {transactions.length === 0 && !loading && (
            <EmptyState
              icon={Receipt}
              title={lang === 'da' ? 'Ingen transaktioner fundet' : 'No transactions found'}
              description={lang === 'da' ? 'Der er ingen transaktioner for den valgte periode.' : 'No transactions found for the selected period.'}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TransactionsPage;


