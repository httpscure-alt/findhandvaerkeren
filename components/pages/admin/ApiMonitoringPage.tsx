import React, { useState } from 'react';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, Server, Globe } from 'lucide-react';
import { Language } from '../../../types';

interface ApiMonitoringPageProps {
  lang: Language;
  onBack: () => void;
}

const ApiMonitoringPage: React.FC<ApiMonitoringPageProps> = ({ lang, onBack }) => {
  const isDa = lang === 'da';
  const [timeRange, setTimeRange] = useState('24h');

  const apiMetrics = {
    totalRequests: '1,245,890',
    successRate: '99.8%',
    avgResponseTime: '145ms',
    errorRate: '0.2%',
    requestsPerMinute: '865',
    activeEndpoints: 47
  };

  const endpoints = [
    { path: '/api/companies', method: 'GET', requests: '124,580', avgTime: '120ms', errors: 2, status: 'healthy' },
    { path: '/api/auth/login', method: 'POST', requests: '89,450', avgTime: '95ms', errors: 5, status: 'healthy' },
    { path: '/api/inquiries', method: 'POST', requests: '45,230', avgTime: '180ms', errors: 12, status: 'warning' },
    { path: '/api/admin/metrics', method: 'GET', requests: '12,340', avgTime: '250ms', errors: 0, status: 'healthy' },
    { path: '/api/upload', method: 'POST', requests: '8,920', avgTime: '450ms', errors: 23, status: 'warning' }
  ];

  const recentErrors = [
    { time: '2 min ago', endpoint: '/api/inquiries', error: '500 Internal Server Error', count: 3 },
    { time: '15 min ago', endpoint: '/api/upload', error: '413 Payload Too Large', count: 1 },
    { time: '1 hour ago', endpoint: '/api/auth/login', error: '429 Too Many Requests', count: 5 }
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'healthy') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 flex items-center gap-1">
        <CheckCircle size={12} />
        {isDa ? 'Sund' : 'Healthy'}
      </span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 flex items-center gap-1">
      <AlertTriangle size={12} />
      {isDa ? 'Advarsel' : 'Warning'}
    </span>;
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-xl">
              <Activity className="text-green-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1D1D1F]">
                {isDa ? 'API Monitoring' : 'API Monitoring'}
              </h1>
              <p className="text-gray-500 mt-1">
                {isDa ? 'Overvåg API ydeevne og status' : 'Monitor API performance and status'}
              </p>
            </div>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-nexus-accent"
          >
            <option value="1h">{isDa ? 'Sidste time' : 'Last Hour'}</option>
            <option value="24h">{isDa ? 'Sidste 24 timer' : 'Last 24 Hours'}</option>
            <option value="7d">{isDa ? 'Sidste 7 dage' : 'Last 7 Days'}</option>
            <option value="30d">{isDa ? 'Sidste 30 dage' : 'Last 30 Days'}</option>
          </select>
        </div>
      </div>

      {/* API Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 mb-4">
            <Globe size={20} />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">{isDa ? 'Totale Forespørgsler' : 'Total Requests'}</p>
          <h3 className="text-2xl font-bold text-[#1D1D1F]">{apiMetrics.totalRequests}</h3>
          <p className="text-xs text-gray-500 mt-2">
            {isDa ? `${apiMetrics.requestsPerMinute} per minut` : `${apiMetrics.requestsPerMinute} per minute`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="p-3 rounded-xl bg-green-50 text-green-600 mb-4">
            <CheckCircle size={20} />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">{isDa ? 'Succesrate' : 'Success Rate'}</p>
          <h3 className="text-2xl font-bold text-[#1D1D1F]">{apiMetrics.successRate}</h3>
          <p className="text-xs text-gray-500 mt-2">
            {isDa ? `${apiMetrics.errorRate} fejlrate` : `${apiMetrics.errorRate} error rate`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 mb-4">
            <Zap size={20} />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">{isDa ? 'Gennemsnitlig Response Tid' : 'Avg Response Time'}</p>
          <h3 className="text-2xl font-bold text-[#1D1D1F]">{apiMetrics.avgResponseTime}</h3>
          <p className="text-xs text-gray-500 mt-2">
            {isDa ? 'Optimal ydeevne' : 'Optimal performance'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Endpoints Performance */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#1D1D1F] flex items-center gap-2">
              <Server size={20} />
              {isDa ? 'Endpoint Ydeevne' : 'Endpoint Performance'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{isDa ? 'Endpoint' : 'Endpoint'}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{isDa ? 'Forespørgsler' : 'Requests'}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{isDa ? 'Gns. Tid' : 'Avg Time'}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{isDa ? 'Status' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {endpoints.map((endpoint, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${
                          endpoint.method === 'GET' ? 'bg-blue-50 text-blue-700' :
                          endpoint.method === 'POST' ? 'bg-green-50 text-green-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="text-sm font-mono text-[#1D1D1F]">{endpoint.path}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{endpoint.requests}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{endpoint.avgTime}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(endpoint.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            {isDa ? 'Seneste Fejl' : 'Recent Errors'}
          </h2>
          <div className="space-y-4">
            {recentErrors.map((error, index) => (
              <div key={index} className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {error.time}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                    {error.count} {isDa ? 'fejl' : 'errors'}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#1D1D1F] mb-1">{error.endpoint}</p>
                <p className="text-xs text-red-600">{error.error}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiMonitoringPage;







