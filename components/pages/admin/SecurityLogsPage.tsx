import React, { useState } from 'react';
import { Shield, Search, Filter, Download, AlertTriangle, CheckCircle, Clock, Lock, User, Globe } from 'lucide-react';
import { Language } from '../../../types';

interface SecurityLogsPageProps {
  lang: Language;
  onBack: () => void;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'login' | 'failed_login' | 'blocked' | 'suspicious' | 'admin_action';
  user: string;
  ip: string;
  location: string;
  action: string;
  status: 'success' | 'warning' | 'danger';
}

const SecurityLogsPage: React.FC<SecurityLogsPageProps> = ({ lang, onBack }) => {
  const isDa = lang === 'da';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  // Mock security logs
  const [logs] = useState<SecurityLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15 14:32:15',
      type: 'failed_login',
      user: 'user@example.com',
      ip: '192.168.1.100',
      location: 'Copenhagen, DK',
      action: 'Failed login attempt',
      status: 'warning'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:28:42',
      type: 'blocked',
      user: 'suspicious@example.com',
      ip: '10.0.0.50',
      location: 'Unknown',
      action: 'IP blocked after multiple failed attempts',
      status: 'danger'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:15:30',
      type: 'admin_action',
      user: 'admin@platform.com',
      ip: '192.168.1.1',
      location: 'Copenhagen, DK',
      action: 'Changed user permissions',
      status: 'success'
    },
    {
      id: '4',
      timestamp: '2024-01-15 13:45:12',
      type: 'login',
      user: 'partner@example.com',
      ip: '192.168.1.50',
      location: 'Aarhus, DK',
      action: 'Successful login',
      status: 'success'
    },
    {
      id: '5',
      timestamp: '2024-01-15 13:20:05',
      type: 'suspicious',
      user: 'unknown@example.com',
      ip: '203.0.113.1',
      location: 'Unknown',
      action: 'Suspicious activity detected',
      status: 'danger'
    }
  ]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.ip.includes(search) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || log.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'failed_login':
        return <AlertTriangle size={16} className="text-amber-500" />;
      case 'blocked':
        return <Lock size={16} className="text-red-500" />;
      case 'suspicious':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'admin_action':
        return <Shield size={16} className="text-blue-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      success: 'bg-green-50 text-green-700',
      warning: 'bg-amber-50 text-amber-700',
      danger: 'bg-red-50 text-red-700'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-[#1D1D1F] mb-4 flex items-center gap-2"
        >
          ← {isDa ? 'Tilbage' : 'Back'}
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-50 rounded-xl">
            <Shield className="text-red-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-[#1D1D1F]">
            {isDa ? 'Sikkerhedslog' : 'Security Logs'}
          </h1>
        </div>
        <p className="text-gray-500">
          {isDa ? 'Overvåg alle sikkerhedsrelaterede hændelser' : 'Monitor all security-related events'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={isDa ? 'Søg efter bruger, IP eller handling...' : 'Search by user, IP or action...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent focus:ring-2 focus:ring-nexus-accent/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent"
            >
              <option value="all">{isDa ? 'Alle Typer' : 'All Types'}</option>
              <option value="login">{isDa ? 'Logins' : 'Logins'}</option>
              <option value="failed_login">{isDa ? 'Fejlede Logins' : 'Failed Logins'}</option>
              <option value="blocked">{isDa ? 'Blokerede' : 'Blocked'}</option>
              <option value="suspicious">{isDa ? 'Mistænkelige' : 'Suspicious'}</option>
              <option value="admin_action">{isDa ? 'Admin Handlinger' : 'Admin Actions'}</option>
            </select>
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-[#1D1D1F] text-white hover:bg-black transition-all flex items-center gap-2">
            <Download size={18} />
            <span>{isDa ? 'Eksporter' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tidspunkt</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Bruger</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">IP Adresse</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Lokation</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Handling</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(log.type)}
                      <span className="text-sm font-medium text-[#1D1D1F] capitalize">
                        {log.type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-[#1D1D1F]">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-400" />
                      <span className="text-sm font-mono text-gray-600">{log.ip}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.location}</td>
                  <td className="px-6 py-4 text-sm text-[#1D1D1F]">{log.action}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </span>
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

export default SecurityLogsPage;







