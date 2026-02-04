import React, { useState, useEffect } from 'react';
import { Language } from '../../../types';
import { FileText, Search, Filter, Download, Clock, User, Shield } from 'lucide-react';
import { api } from '../../../services/api';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { ErrorState } from '../../common/ErrorState';
import { EmptyState } from '../../common/EmptyState';
import { exportToCSV } from '../../../utils/csvExport';

interface ActivityLogsPageProps {
  lang: Language;
  onBack: () => void;
}

interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: any;
  createdAt: string;
}

const ActivityLogsPage: React.FC<ActivityLogsPageProps> = ({ lang, onBack }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterTargetType, setFilterTargetType] = useState<string>('');

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterTargetType]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getActivityLogs({
        action: filterAction || undefined,
        targetType: filterTargetType || undefined,
      });
      setLogs(response.logs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'verify_company': lang === 'da' ? 'Godkendt virksomhed' : 'Approved company',
      'reject_verification': lang === 'da' ? 'Afvist verificering' : 'Rejected verification',
      'suspend_user': lang === 'da' ? 'Suspenderede bruger' : 'Suspended user',
      'delete_user': lang === 'da' ? 'Slettede bruger' : 'Deleted user',
      'reset_password': lang === 'da' ? 'Nulstillede password' : 'Reset password',
      'reset_partner_profile': lang === 'da' ? 'Nulstillede partner profil' : 'Reset partner profile',
      'create_admin': lang === 'da' ? 'Oprettede admin' : 'Created admin',
      'update_user_role': lang === 'da' ? 'Opdaterede bruger rolle' : 'Updated user role',
    };
    return labels[action] || action;
  };

  const handleExportCSV = () => {
    const data = logs.map(log => ({
      'ID': log.id,
      'Action': getActionLabel(log.action),
      'Target Type': log.targetType || '',
      'Target ID': log.targetId || '',
      'Admin ID': log.adminId,
      'Details': JSON.stringify(log.details || {}),
      'Date': formatDate(log.createdAt),
    }));
    exportToCSV(data, 'activity_logs');
  };

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));
  const uniqueTargetTypes = Array.from(new Set(logs.map(l => l.targetType).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Aktivitetslog' : 'Activity Logs'}
          </h1>
          <p className="text-gray-500">
            {lang === 'da' ? 'Fuld oversigt over admin handlinger' : 'Complete overview of admin actions'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {lang === 'da' ? 'Eksporter CSV' : 'Export CSV'}
          </button>
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
        <div className="flex items-center gap-4 flex-wrap">
          <Filter size={20} className="text-gray-400" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {lang === 'da' ? 'Handling:' : 'Action:'}
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
            >
              <option value="">{lang === 'da' ? 'Alle' : 'All'}</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{getActionLabel(action)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {lang === 'da' ? 'Måltype:' : 'Target Type:'}
            </label>
            <select
              value={filterTargetType}
              onChange={(e) => setFilterTargetType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent"
            >
              <option value="">{lang === 'da' ? 'Alle' : 'All'}</option>
              {uniqueTargetTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-6">
          <LoadingSkeleton variant="table" count={5} />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load activity logs" message={error} onRetry={fetchLogs} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {lang === 'da' ? 'Dato' : 'Date'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {lang === 'da' ? 'Handling' : 'Action'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {lang === 'da' ? 'Måltype' : 'Target Type'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {lang === 'da' ? 'Detaljer' : 'Details'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {lang === 'da' ? 'Admin ID' : 'Admin ID'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1D1D1F]">
                        {getActionLabel(log.action)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.targetType || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                        <div className="truncate">
                          {log.details ? JSON.stringify(log.details).substring(0, 100) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {log.adminId.substring(0, 8)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {logs.length === 0 && !loading && (
            <EmptyState
              icon={FileText}
              title={lang === 'da' ? 'Ingen aktivitetslog' : 'No activity logs'}
              description={lang === 'da' ? 'Der er ingen aktivitetslog endnu.' : 'There are no activity logs yet.'}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ActivityLogsPage;





