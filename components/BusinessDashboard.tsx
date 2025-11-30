import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';
import { 
  BarChart3, 
  MessageSquare, 
  Heart, 
  Eye, 
  Edit, 
  Image as ImageIcon,
  FileText,
  Settings,
  Loader2
} from 'lucide-react';

interface BusinessDashboardProps {
  lang: Language;
  onEditListing: () => void;
  onManageServices: () => void;
  onManagePortfolio: () => void;
  onManageTestimonials: () => void;
  onViewInquiries: () => void;
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  lang,
  onEditListing,
  onManageServices,
  onManagePortfolio,
  onManageTestimonials,
  onViewInquiries,
}) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboard, analyticsData] = await Promise.all([
        api.getBusinessDashboard(),
        api.getBusinessAnalytics(),
      ]);
      setDashboardData(dashboard.company);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-nexus-accent" size={32} />
      </div>
    );
  }

  const company = dashboardData;
  const t = translations[lang];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-2">
          {lang === 'da' ? 'Business Dashboard' : 'Business Dashboard'}
        </h1>
        <p className="text-nexus-subtext">
          {lang === 'da' 
            ? 'Administrer din virksomhedsprofil og se din ydeevne'
            : 'Manage your business profile and view your performance'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Eye className="text-nexus-accent" size={24} />
            <span className="text-2xl font-bold text-[#1D1D1F]">{analytics?.views || 0}</span>
          </div>
          <p className="text-sm text-nexus-subtext">{lang === 'da' ? 'Visninger' : 'Profile Views'}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Heart className="text-red-500" size={24} />
            <span className="text-2xl font-bold text-[#1D1D1F]">{analytics?.saves || 0}</span>
          </div>
          <p className="text-sm text-nexus-subtext">{lang === 'da' ? 'Gemt' : 'Saved'}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-[#1D1D1F]">{analytics?.inquiries || 0}</span>
          </div>
          <p className="text-sm text-nexus-subtext">{lang === 'da' ? 'Henvendelser' : 'Inquiries'}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-[#1D1D1F]">
              {company?.rating ? company.rating.toFixed(1) : '0.0'}
            </span>
          </div>
          <p className="text-sm text-nexus-subtext">{lang === 'da' ? 'Bedømmelse' : 'Rating'}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={onEditListing}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <Edit className="text-nexus-accent mb-3" size={24} />
          <h3 className="font-bold text-[#1D1D1F] mb-1 group-hover:text-nexus-accent transition-colors">
            {lang === 'da' ? 'Rediger Profil' : 'Edit Profile'}
          </h3>
          <p className="text-sm text-nexus-subtext">
            {lang === 'da' ? 'Opdater din virksomhedsoplysninger' : 'Update your business information'}
          </p>
        </button>

        <button
          onClick={onManageServices}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <FileText className="text-nexus-accent mb-3" size={24} />
          <h3 className="font-bold text-[#1D1D1F] mb-1 group-hover:text-nexus-accent transition-colors">
            {lang === 'da' ? 'Ydelser' : 'Services'}
          </h3>
          <p className="text-sm text-nexus-subtext">
            {lang === 'da' ? 'Administrer dine ydelser' : 'Manage your services'}
          </p>
        </button>

        <button
          onClick={onManagePortfolio}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <ImageIcon className="text-nexus-accent mb-3" size={24} />
          <h3 className="font-bold text-[#1D1D1F] mb-1 group-hover:text-nexus-accent transition-colors">
            {lang === 'da' ? 'Portfolio' : 'Portfolio'}
          </h3>
          <p className="text-sm text-nexus-subtext">
            {lang === 'da' ? 'Administrer dit galleri' : 'Manage your gallery'}
          </p>
        </button>

        <button
          onClick={onViewInquiries}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <MessageSquare className="text-nexus-accent mb-3" size={24} />
          <h3 className="font-bold text-[#1D1D1F] mb-1 group-hover:text-nexus-accent transition-colors">
            {lang === 'da' ? 'Henvendelser' : 'Inquiries'}
          </h3>
          <p className="text-sm text-nexus-subtext">
            {lang === 'da' ? 'Se og besvar henvendelser' : 'View and respond to inquiries'}
          </p>
        </button>
      </div>

      {/* Recent Inquiries */}
      {company?.inquiries && company.inquiries.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-[#1D1D1F] mb-4">
            {lang === 'da' ? 'Seneste Henvendelser' : 'Recent Inquiries'}
          </h2>
          <div className="space-y-3">
            {company.inquiries.slice(0, 5).map((inquiry: any) => (
              <div key={inquiry.id} className="p-4 border border-gray-100 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-[#1D1D1F]">{inquiry.consumer?.name || 'Anonymous'}</p>
                    <p className="text-sm text-nexus-subtext">{inquiry.consumer?.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    inquiry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    inquiry.status === 'RESPONDED' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {inquiry.status}
                  </span>
                </div>
                <p className="text-sm text-nexus-text mt-2 line-clamp-2">{inquiry.message}</p>
                <p className="text-xs text-nexus-subtext mt-2">
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Placeholder */}
      <div className="bg-gradient-to-r from-nexus-bg to-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1D1D1F] mb-1">
              {lang === 'da' ? 'Abonnement' : 'Subscription'}
            </h3>
            <p className="text-sm text-nexus-subtext">
              {lang === 'da' 
                ? `Nuværende plan: ${company?.pricingTier || 'Standard'}`
                : `Current plan: ${company?.pricingTier || 'Standard'}`}
            </p>
          </div>
          <button className="px-4 py-2 bg-[#1D1D1F] text-white rounded-xl text-sm font-medium hover:bg-black transition-all">
            {lang === 'da' ? 'Opgrader' : 'Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
