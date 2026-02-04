import React, { useState, useEffect } from 'react';
import { Users, Briefcase, DollarSign, TrendingUp, Search, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Language, Company } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';
import { LoadingSkeleton } from './common/LoadingSkeleton';
import { ErrorState } from './common/ErrorState';

import { useToast } from '../hooks/useToast';

interface AdminDashboardProps {
  lang: Language;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
  const t = translations[lang].admin;
  const toast = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    verifiedCompanies: 0,
    pendingVerifications: 0,
    monthlyRevenue: 0,
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'companies' | 'jobs'>('companies');
  const [jobRequests, setJobRequests] = useState<any[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [companiesResponse, statsResponse] = await Promise.all([
          api.getCompanies({}),
          api.getAdminStats(),
        ]);
        setCompanies(companiesResponse.companies);
        setStats({
          totalCompanies: statsResponse.totalCompanies,
          verifiedCompanies: statsResponse.verifiedCompanies,
          pendingVerifications: statsResponse.pendingVerifications,
          monthlyRevenue: statsResponse.monthlyRevenue,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'jobs' && jobRequests.length === 0) {
      fetchJobs();
    }
  }, [activeTab]);

  const fetchJobs = async () => {
    setIsJobsLoading(true);
    try {
      const response = await api.getAdminJobRequests();
      setJobRequests(response.requests);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load job requests');
    } finally {
      setIsJobsLoading(false);
    }
  };

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      await api.verifyCompany(id, !currentStatus);
      setCompanies(prev => prev.map(c =>
        c.id === id ? { ...c, isVerified: !currentStatus } : c
      ));
      toast.success('Verification status updated');
      // Refresh stats
      const statsResponse = await api.getAdminStats();
      setStats({
        totalCompanies: statsResponse.totalCompanies,
        verifiedCompanies: statsResponse.verifiedCompanies,
        pendingVerifications: statsResponse.pendingVerifications,
        monthlyRevenue: statsResponse.monthlyRevenue,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update verification status');
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  const displayStats = [
    { title: t.totalCompanies, value: stats.totalCompanies, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
    { title: t.activeListings, value: stats.verifiedCompanies, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { title: t.monthlyRevenue, value: `$${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-indigo-50 text-indigo-600' },
    { title: t.pendingReview, value: stats.pendingVerifications, icon: Users, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">{t.dashboard}</h1>
        <p className="text-gray-500 mt-1">Welcome back, Administrator.</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load stats" message={error} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {displayStats.map((stat, index) => (
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
      )}

      {/* Main Content Area */}
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'companies'
            ? 'bg-[#1D1D1F] text-white'
            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
        >
          {t.listings}
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'jobs'
            ? 'bg-[#1D1D1F] text-white'
            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
        >
          {t.jobRequests}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        {activeTab === 'companies' ? (
          <>
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
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <LoadingSkeleton key={i} variant="table" />
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12">
                        <ErrorState title="Failed to load companies" message={error} />
                      </td>
                    </tr>
                  ) : filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No companies found
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map(company => (
                      <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                              {company.logoUrl ? (
                                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-200"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-[#1D1D1F]">{company.name}</div>
                              <div className="text-xs text-gray-400">{company.contactEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${company.pricingTier === 'Gold' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                            'bg-gray-100 text-gray-600'
                            }`}>
                            {company.pricingTier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {company.isVerified || company.verificationStatus === 'verified' ? (
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
                              onClick={() => toggleVerification(company.id, company.isVerified || company.verificationStatus === 'verified')}
                              className={`p-2 rounded-lg transition-colors ${company.isVerified || company.verificationStatus === 'verified'
                                ? 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                                : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                                }`}
                              title={company.isVerified || company.verificationStatus === 'verified' ? t.reject : t.approve}
                            >
                              {company.isVerified || company.verificationStatus === 'verified' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D1D1F]">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Job Requests Table */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1D1D1F]">{t.jobRequests}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t.consumer}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Topic</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t.matches}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t.quotes}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isJobsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <LoadingSkeleton key={i} variant="table" />
                    ))
                  ) : jobRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {t.noJobsFound}
                      </td>
                    </tr>
                  ) : (
                    jobRequests.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-[#1D1D1F]">{job.consumer?.name || 'Anonymous'}</div>
                            <div className="text-xs text-gray-400">{job.consumer?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-[#1D1D1F]">{job.title}</div>
                            <div className="text-xs text-gray-400">{job.category} • {job.postalCode}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                            {job.matches?.length || 0} Partners
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                            {job.matches?.reduce((acc: number, m: any) => acc + (m.quotes?.length || 0), 0)} {t.quotes}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-nexus-accent hover:underline text-sm font-medium">
                            {t.viewDetails}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;