import React, { useState } from 'react';
import { Language } from '../../../types';
import { Briefcase, Search, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';

interface PartnersManagementProps {
  lang: Language;
  onBack: () => void;
}

const PartnersManagement: React.FC<PartnersManagementProps> = ({ lang, onBack }) => {
  const [search, setSearch] = useState('');

  // Mock partners
  const partners = [
    { id: '1', name: 'Nexus Solutions', email: 'partner@nexus.com', plan: 'Elite', verified: true, joinedDate: '2023-11-15' },
    { id: '2', name: 'Summit Capital', email: 'partner@summit.com', plan: 'Premium', verified: true, joinedDate: '2023-12-01' },
    { id: '3', name: 'Alpha Design', email: 'partner@alpha.com', plan: 'Standard', verified: false, joinedDate: '2024-01-20' }
  ];

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Partnerstyring' : 'Partners Management'}
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={lang === 'da' ? 'Søg partnere...' : 'Search partners...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Partner' : 'Partner'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Plan' : 'Plan'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Status' : 'Status'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Tilmeldt' : 'Joined'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{lang === 'da' ? 'Handlinger' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(partner => (
                <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-nexus-bg flex items-center justify-center">
                        <Briefcase className="text-nexus-accent" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-[#1D1D1F]">{partner.name}</div>
                        <div className="text-xs text-gray-400">{partner.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                      partner.plan === 'Elite' ? 'bg-purple-50 text-purple-700' :
                      partner.plan === 'Premium' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {partner.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {partner.verified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                        <CheckCircle size={12} />
                        {lang === 'da' ? 'Verificeret' : 'Verified'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                        <XCircle size={12} />
                        {lang === 'da' ? 'Ikke Verificeret' : 'Not Verified'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-nexus-subtext">{partner.joinedDate}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={18} />
                    </button>
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

export default PartnersManagement;
