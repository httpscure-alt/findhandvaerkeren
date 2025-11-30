import React, { useState } from 'react';
import { Users, Briefcase, DollarSign, TrendingUp, Search, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Language, Company } from '../types';
import { translations } from '../translations';
import { MOCK_COMPANIES } from '../constants';

interface AdminDashboardProps {
  lang: Language;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
  const t = translations[lang].admin;
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [search, setSearch] = useState('');

  const toggleVerification = (id: string) => {
    setCompanies(prev => prev.map(c => 
      c.id === id ? { ...c, isVerified: !c.isVerified } : c
    ));
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  // Mock Stats
  const stats = [
    { title: t.totalCompanies, value: companies.length, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
    { title: t.activeListings, value: companies.filter(c => c.isVerified).length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { title: t.monthlyRevenue, value: '$12,450', icon: DollarSign, color: 'bg-indigo-50 text-indigo-600' },
    { title: t.pendingReview, value: companies.filter(c => !c.isVerified).length, icon: Users, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">{t.dashboard}</h1>
        <p className="text-gray-500 mt-1">Welcome back, Administrator.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-[#1D1D1F] mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#1D1D1F]">{t.recentActivity}</h2>
          <div className="relative">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
             <input 
                type="text" 
                placeholder="Search companies..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent focus:ring-2 focus:ring-nexus-accent/20"
             />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t.company}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t.plan}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t.status}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCompanies.map(company => (
                <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                        <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-[#1D1D1F]">{company.name}</div>
                        <div className="text-xs text-gray-400">{company.contactEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                      company.pricingTier === 'Elite' ? 'bg-purple-50 text-purple-700' :
                      company.pricingTier === 'Premium' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {company.pricingTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {company.isVerified ? (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                         {t.verified}
                       </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                         <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                         {t.pending}
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleVerification(company.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          company.isVerified 
                            ? 'hover:bg-red-50 text-gray-400 hover:text-red-600' 
                            : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                        }`}
                        title={company.isVerified ? t.reject : t.approve}
                      >
                        {company.isVerified ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D1D1F]">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
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

export default AdminDashboard;