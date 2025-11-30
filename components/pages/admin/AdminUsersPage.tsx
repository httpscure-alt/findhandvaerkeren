import React, { useState } from 'react';
import { Language } from '../../../types';
import { ShieldCheck, UserPlus, Search, MoreHorizontal } from 'lucide-react';

interface AdminUsersPageProps {
  lang: Language;
  onBack: () => void;
}

const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ lang }) => {
  const [search, setSearch] = useState('');

  const adminUsers = [
    { id: '1', name: 'Admin User', email: 'admin@findhandvaerkeren.dk', role: 'Super Admin', lastLogin: '2024-01-20' },
    { id: '2', name: 'Support Admin', email: 'support@findhandvaerkeren.dk', role: 'Support', lastLogin: '2024-01-19' }
  ];

  const filtered = adminUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Admin Brugere' : 'Admin Users'}
        </h1>
        <button className="px-4 py-2 bg-nexus-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
          <UserPlus size={18} />
          {lang === 'da' ? 'Tilføj Admin' : 'Add Admin'}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          type="text"
          placeholder={lang === 'da' ? 'Søg admin brugere...' : 'Search admin users...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Bruger' : 'User'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Rolle' : 'Role'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{lang === 'da' ? 'Sidste Login' : 'Last Login'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{lang === 'da' ? 'Handlinger' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-nexus-bg flex items-center justify-center">
                        <ShieldCheck className="text-nexus-accent" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-[#1D1D1F]">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-nexus-subtext">{user.lastLogin}</td>
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

export default AdminUsersPage;
