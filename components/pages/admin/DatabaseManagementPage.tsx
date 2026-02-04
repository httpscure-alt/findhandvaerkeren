import React, { useState } from 'react';
import { Database, RefreshCw, Download, Upload, Trash2, Search, HardDrive, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { Language } from '../../../types';

interface DatabaseManagementPageProps {
  lang: Language;
  onBack: () => void;
}

const DatabaseManagementPage: React.FC<DatabaseManagementPageProps> = ({ lang, onBack }) => {
  const isDa = lang === 'da';
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const dbStats = {
    totalSize: '245.8 GB',
    usedSize: '198.3 GB',
    freeSize: '47.5 GB',
    tables: 24,
    totalRows: '1,245,890',
    lastBackup: '2 minutes ago',
    status: 'healthy',
    connections: 47,
    queriesPerSecond: 125
  };

  const tables = [
    { name: 'users', rows: '124,580', size: '45.2 MB', lastUpdated: 'Just now' },
    { name: 'companies', rows: '1,247', size: '12.8 MB', lastUpdated: '2 min ago' },
    { name: 'inquiries', rows: '8,945', size: '3.4 MB', lastUpdated: '5 min ago' },
    { name: 'transactions', rows: '15,234', size: '8.9 MB', lastUpdated: '1 min ago' },
    { name: 'sessions', rows: '892', size: '1.2 MB', lastUpdated: 'Just now' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-[#1D1D1F] mb-4 flex items-center gap-2"
        >
          ← {isDa ? 'Tilbage' : 'Back'}
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <Database className="text-purple-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1D1D1F]">
                {isDa ? 'Database Management' : 'Database Management'}
              </h1>
              <p className="text-gray-500 mt-1">
                {isDa ? 'Administrer og overvåg din database' : 'Manage and monitor your database'}
              </p>
            </div>
          </div>
          <button
            onClick={refreshStats}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[#1D1D1F] hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isDa ? 'Opdater' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <HardDrive size={20} />
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${dbStats.status === 'healthy' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
              {dbStats.status === 'healthy' ? (isDa ? 'Sund' : 'Healthy') : (isDa ? 'Fejl' : 'Error')}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">{isDa ? 'Total Størrelse' : 'Total Size'}</p>
          <h3 className="text-2xl font-bold text-[#1D1D1F]">{dbStats.totalSize}</h3>
          <p className="text-xs text-gray-500 mt-2">
            {isDa ? `${dbStats.usedSize} brugt` : `${dbStats.usedSize} used`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="p-3 rounded-xl bg-green-50 text-green-600 mb-4">
            <Database size={20} />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">{isDa ? 'Tabeller' : 'Tables'}</p>
          <h3 className="text-2xl font-bold text-[#1D1D1F]">{dbStats.tables}</h3>
          <p className="text-xs text-gray-500 mt-2">
            {isDa ? `${dbStats.totalRows} rækker` : `${dbStats.totalRows} rows`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 mb-4">
            <Activity size={20} />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">{isDa ? 'Forbindelser' : 'Connections'}</p>
          <h3 className="text-2xl font-bold text-[#1D1D1F]">{dbStats.connections}</h3>
          <p className="text-xs text-gray-500 mt-2">
            {isDa ? `${dbStats.queriesPerSecond} queries/s` : `${dbStats.queriesPerSecond} queries/s`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 mb-4">
            <CheckCircle size={20} />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">{isDa ? 'Sidste Backup' : 'Last Backup'}</p>
          <h3 className="text-2xl font-bold text-[#1D1D1F]">{dbStats.lastBackup}</h3>
          <p className="text-xs text-gray-500 mt-2">
            {isDa ? 'Automatisk backup' : 'Automatic backup'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-[#1D1D1F] mb-4">
          {isDa ? 'Database Handlinger' : 'Database Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all">
            <Download size={20} className="text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-[#1D1D1F]">{isDa ? 'Download Backup' : 'Download Backup'}</p>
              <p className="text-xs text-gray-500">{isDa ? 'Eksporter database' : 'Export database'}</p>
            </div>
          </button>
          <button
            onClick={() => {
              if (window.confirm(isDa ? 'Er du sikker på at du vil gendanne databasen? Dette vil overskrive alle nuværende data.' : 'Are you sure you want to restore the database? This will overwrite all current data.')) {
                alert(isDa ? 'Gendannelse startet...' : 'Restoration started...');
              }
            }}
            className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <Upload size={20} className="text-green-600" />
            <div className="text-left">
              <p className="font-medium text-[#1D1D1F]">{isDa ? 'Restore Backup' : 'Restore Backup'}</p>
              <p className="text-xs text-gray-500">{isDa ? 'Gendan fra backup' : 'Restore from backup'}</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-red-50 transition-all">
            <Trash2 size={20} className="text-red-600" />
            <div className="text-left">
              <p className="font-medium text-[#1D1D1F]">{isDa ? 'Ryd Cache' : 'Clear Cache'}</p>
              <p className="text-xs text-gray-500">{isDa ? 'Slet cache' : 'Delete cache'}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Tables List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1D1D1F]">
            {isDa ? 'Database Tabeller' : 'Database Tables'}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={isDa ? 'Søg tabeller...' : 'Search tables...'}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{isDa ? 'Tabelnavn' : 'Table Name'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{isDa ? 'Rækker' : 'Rows'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{isDa ? 'Størrelse' : 'Size'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{isDa ? 'Sidst Opdateret' : 'Last Updated'}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{isDa ? 'Handlinger' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tables.map((table, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#1D1D1F]">{table.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{table.rows}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{table.size}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{table.lastUpdated}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D1D1F]">
                        <Activity size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D1D1F]">
                        <Download size={16} />
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

export default DatabaseManagementPage;







