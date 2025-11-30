import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Database,
  Server,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Lock,
  BarChart3,
  Settings,
  FileText,
  RefreshCw,
  Eye,
  Key,
  HardDrive
} from 'lucide-react';
import { Language } from '../../../types';

interface SuperAdminDashboardProps {
  lang: Language;
  onNavigate?: (view: string) => void;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
}

interface SecurityMetrics {
  totalLogins: number;
  failedAttempts: number;
  blockedIPs: number;
  activeSessions: number;
  lastSecurityIncident: string;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ lang, onNavigate }) => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: 145,
    errorRate: 0.02,
    activeConnections: 1247
  });

  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    totalLogins: 12450,
    failedAttempts: 23,
    blockedIPs: 5,
    activeSessions: 892,
    lastSecurityIncident: '2 hours ago'
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - replace with real API calls
  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const isDa = lang === 'da';

  // Platform Overview Stats
  const platformStats = [
    {
      title: isDa ? 'Totale Brugere' : 'Total Users',
      value: '12,450',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: isDa ? 'Aktive Partnere' : 'Active Partners',
      value: '1,247',
      change: '+8.2%',
      trend: 'up',
      icon: Shield,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: isDa ? 'Månedlig Omsætning' : 'Monthly Revenue',
      value: '$124,500',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: isDa ? 'System Uptime' : 'System Uptime',
      value: systemHealth.uptime,
      change: systemHealth.status === 'healthy' ? 'Optimal' : 'Warning',
      trend: systemHealth.status === 'healthy' ? 'up' : 'down',
      icon: Activity,
      color: systemHealth.status === 'healthy' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
    }
  ];

  // System Health Indicators
  const healthIndicators = [
    {
      label: isDa ? 'API Response Time' : 'API Response Time',
      value: `${systemHealth.responseTime}ms`,
      status: systemHealth.responseTime < 200 ? 'good' : systemHealth.responseTime < 500 ? 'warning' : 'critical',
      icon: Zap
    },
    {
      label: isDa ? 'Fejlrate' : 'Error Rate',
      value: `${systemHealth.errorRate}%`,
      status: systemHealth.errorRate < 0.1 ? 'good' : systemHealth.errorRate < 1 ? 'warning' : 'critical',
      icon: AlertTriangle
    },
    {
      label: isDa ? 'Aktive Forbindelser' : 'Active Connections',
      value: systemHealth.activeConnections.toLocaleString(),
      status: 'good',
      icon: Server
    },
    {
      label: isDa ? 'Database Status' : 'Database Status',
      value: isDa ? 'Optimal' : 'Optimal',
      status: 'good',
      icon: Database
    }
  ];

  // Security Overview
  const securityItems = [
    {
      label: isDa ? 'Totale Logins (i dag)' : 'Total Logins (Today)',
      value: securityMetrics.totalLogins.toLocaleString(),
      icon: Users
    },
    {
      label: isDa ? 'Fejlede Forsøg' : 'Failed Attempts',
      value: securityMetrics.failedAttempts,
      icon: AlertTriangle,
      color: securityMetrics.failedAttempts > 10 ? 'text-red-600' : 'text-amber-600'
    },
    {
      label: isDa ? 'Blokerede IPs' : 'Blocked IPs',
      value: securityMetrics.blockedIPs,
      icon: Lock
    },
    {
      label: isDa ? 'Aktive Sessioner' : 'Active Sessions',
      value: securityMetrics.activeSessions.toLocaleString(),
      icon: Activity
    }
  ];

  // Quick Actions
  const quickActions = [
    {
      label: isDa ? 'System Indstillinger' : 'System Settings',
      icon: Settings,
      onClick: () => onNavigate?.('ADMIN_SETTINGS'),
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      label: isDa ? 'Sikkerhedslog' : 'Security Logs',
      icon: FileText,
      onClick: () => onNavigate?.('ADMIN_SECURITY_LOGS'),
      color: 'bg-red-50 text-red-600 hover:bg-red-100'
    },
    {
      label: isDa ? 'Database Management' : 'Database Management',
      icon: Database,
      onClick: () => onNavigate?.('ADMIN_DATABASE'),
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    },
    {
      label: isDa ? 'API Monitoring' : 'API Monitoring',
      icon: BarChart3,
      onClick: () => onNavigate?.('ADMIN_API_MONITORING'),
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Shield className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-[#1D1D1F]">
              {isDa ? 'Super Admin Dashboard' : 'Super Admin Dashboard'}
            </h1>
          </div>
          <p className="text-gray-500">
            {isDa 
              ? 'Komplet platformoversigt og systemstyring' 
              : 'Complete platform overview and system management'}
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[#1D1D1F] hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isDa ? 'Opdater' : 'Refresh'}</span>
        </button>
      </div>

      {/* Platform Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {platformStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp size={14} />
                  {stat.change}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-[#1D1D1F]">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* System Health */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1D1D1F] flex items-center gap-2">
              <Activity size={20} />
              {isDa ? 'System Sundhed' : 'System Health'}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              systemHealth.status === 'healthy' 
                ? 'bg-green-50 text-green-700' 
                : systemHealth.status === 'warning'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {systemHealth.status === 'healthy' 
                ? (isDa ? 'Sund' : 'Healthy')
                : systemHealth.status === 'warning'
                ? (isDa ? 'Advarsel' : 'Warning')
                : (isDa ? 'Kritisk' : 'Critical')
              }
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {healthIndicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={18} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">{indicator.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#1D1D1F]">{indicator.value}</span>
                    {indicator.status === 'good' && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                    {indicator.status === 'warning' && (
                      <AlertTriangle size={16} className="text-amber-500" />
                    )}
                    {indicator.status === 'critical' && (
                      <AlertTriangle size={16} className="text-red-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Overview */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#1D1D1F] flex items-center gap-2 mb-6">
            <Lock size={20} />
            {isDa ? 'Sikkerhed' : 'Security'}
          </h2>
          <div className="space-y-4">
            {securityItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${item.color || 'text-[#1D1D1F]'}`}>
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={14} />
              <span>
                {isDa 
                  ? `Sidste hændelse: ${securityMetrics.lastSecurityIncident}`
                  : `Last incident: ${securityMetrics.lastSecurityIncident}`
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-[#1D1D1F] mb-6">
          {isDa ? 'Hurtige Handlinger' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`p-4 rounded-2xl border border-gray-200 transition-all hover:shadow-md ${action.color}`}
              >
                <Icon size={24} className="mb-3" />
                <p className="text-sm font-medium">{action.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent System Events */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-2">
            <Clock size={20} />
            {isDa ? 'Seneste Systemhændelser' : 'Recent System Events'}
          </h2>
          <div className="space-y-4">
            {[
              { time: '2 min ago', event: 'Database backup completed', status: 'success' },
              { time: '15 min ago', event: 'API rate limit warning', status: 'warning' },
              { time: '1 hour ago', event: 'New partner verification approved', status: 'info' },
              { time: '2 hours ago', event: 'Security scan completed', status: 'success' },
              { time: '3 hours ago', event: 'System update deployed', status: 'success' }
            ].map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.status === 'success' ? 'bg-green-500' :
                  event.status === 'warning' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1D1D1F]">{event.event}</p>
                  <p className="text-xs text-gray-400 mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-2">
            <Server size={20} />
            {isDa ? 'System Information' : 'System Information'}
          </h2>
          <div className="space-y-4">
            {[
              { label: isDa ? 'Platform Version' : 'Platform Version', value: 'v2.1.0' },
              { label: isDa ? 'Node.js Version' : 'Node.js Version', value: 'v18.17.0' },
              { label: isDa ? 'Database' : 'Database', value: 'PostgreSQL 15.4' },
              { label: isDa ? 'Server Region' : 'Server Region', value: 'EU (Copenhagen)' },
              { label: isDa ? 'Last Backup' : 'Last Backup', value: '2 minutes ago' },
              { label: isDa ? 'Storage Used' : 'Storage Used', value: '245 GB / 500 GB' }
            ].map((info, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">{info.label}</span>
                <span className="text-sm font-medium text-[#1D1D1F]">{info.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
