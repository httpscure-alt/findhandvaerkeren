import React from 'react';
import { Language } from '../../../types';
import { CreditCard, CheckCircle, Calendar, TrendingUp } from 'lucide-react';

interface SubscriptionsManagementProps {
  lang: Language;
  onBack: () => void;
}

const SubscriptionsManagement: React.FC<SubscriptionsManagementProps> = ({ lang }) => {
  const subscriptions = [
    { id: '1', company: 'Nexus Solutions', plan: 'Elite', amount: '$149', status: 'Active', nextBilling: '2024-02-15' },
    { id: '2', company: 'Summit Capital', plan: 'Premium', amount: '$99', status: 'Active', nextBilling: '2024-02-20' },
    { id: '3', company: 'Alpha Design', plan: 'Standard', amount: 'Free', status: 'Active', nextBilling: 'N/A' }
  ];

  const stats = {
    totalRevenue: '$12,450',
    activeSubscriptions: 45,
    monthlyRecurring: '$8,950'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <h1 className="text-3xl font-bold text-[#1D1D1F] mb-8">
        {lang === 'da' ? 'Abonnementsstyring' : 'Subscriptions Management'}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-nexus-subtext">{lang === 'da' ? 'Total Omsætning' : 'Total Revenue'}</p>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-[#1D1D1F]">{stats.totalRevenue}</h3>
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
          <h3 className="text-2xl font-bold text-[#1D1D1F]">{stats.monthlyRecurring}</h3>
        </div>
      </div>

      {/* Subscriptions Table */}
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
                  <td className="px-6 py-4 font-medium text-[#1D1D1F]">{sub.company}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                      sub.plan === 'Elite' ? 'bg-purple-50 text-purple-700' :
                      sub.plan === 'Premium' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#1D1D1F]">{sub.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                      <CheckCircle size={12} />
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-nexus-subtext flex items-center gap-1">
                    <Calendar size={14} />
                    {sub.nextBilling}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsManagement;
