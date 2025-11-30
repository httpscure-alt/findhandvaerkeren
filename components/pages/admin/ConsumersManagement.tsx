import React, { useState } from 'react';
import { Language } from '../../../types';
import { User, Search, Mail, MapPin, MoreHorizontal } from 'lucide-react';

interface ConsumersManagementProps {
  lang: Language;
  onBack: () => void;
}

const ConsumersManagement: React.FC<ConsumersManagementProps> = ({ lang, onBack }) => {
  const [search, setSearch] = useState('');

  // Mock consumers
  const consumers = [
    { id: '1', name: 'Anders Jensen', email: 'anders@example.com', location: 'København', savedCount: 5, joinedDate: '2024-01-15' },
    { id: '2', name: 'Sarah Nielsen', email: 'sarah@example.com', location: 'Aarhus', savedCount: 12, joinedDate: '2023-12-20' },
    { id: '3', name: 'Mads Hansen', email: 'mads@example.com', location: 'Odense', savedCount: 3, joinedDate: '2024-02-01' }
  ];

  const filtered = consumers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Forbrugerstyring' : 'Consumers Management'}
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={lang === 'da' ? 'Søg forbrugere...' : 'Search consumers...'}
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Forbruger' : 'Consumer'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Lokation' : 'Location'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Gemte' : 'Saved'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Tilmeldt' : 'Joined'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{lang === 'da' ? 'Handlinger' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(consumer => (
                <tr key={consumer.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="text-gray-400" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-[#1D1D1F]">{consumer.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail size={12} />
                          {consumer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-nexus-subtext">
                      <MapPin size={14} />
                      {consumer.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#1D1D1F]">{consumer.savedCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-nexus-subtext">{consumer.joinedDate}</span>
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

export default ConsumersManagement;
