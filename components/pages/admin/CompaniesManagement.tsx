import React, { useState } from 'react';
import { Company, Language } from '../../../types';
import { MOCK_COMPANIES } from '../../../constants';
import { Search, CheckCircle, XCircle, Edit2, MoreHorizontal } from 'lucide-react';

interface CompaniesManagementProps {
  lang: Language;
  onBack: () => void;
}

const CompaniesManagement: React.FC<CompaniesManagementProps> = ({ lang, onBack }) => {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [search, setSearch] = useState('');

  const toggleVerification = (id: string) => {
    setCompanies(prev => prev.map(c => 
      c.id === id ? { ...c, isVerified: !c.isVerified } : c
    ));
  };

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Virksomhedsstyring' : 'Companies Management'}
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={lang === 'da' ? 'Søg virksomheder...' : 'Search companies...'}
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Virksomhed' : 'Company'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Plan' : 'Plan'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Status' : 'Status'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{lang === 'da' ? 'Handlinger' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(company => (
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
                        {lang === 'da' ? 'Verificeret' : 'Verified'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {lang === 'da' ? 'Afventer' : 'Pending'}
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
                      >
                        {company.isVerified ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D1D1F]">
                        <Edit2 size={18} />
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

export default CompaniesManagement;
