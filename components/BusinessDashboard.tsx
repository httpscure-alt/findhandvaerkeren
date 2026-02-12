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
  Loader2,
  ArrowRight
} from 'lucide-react';

interface BusinessDashboardProps {
  lang: Language;
  onEditListing: () => void;
  onManageServices: () => void;
  onManagePortfolio: () => void;
  onManageTestimonials: () => void;
  onViewInquiries: () => void;
  onViewGrowth: () => void;
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  lang,
  onEditListing,
  onManageServices,
  onManagePortfolio,
  onManageTestimonials,
  onViewInquiries,
  onViewGrowth,
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

      {/* Growth Services Notice */}
      {localStorage.getItem('selectedGrowthServices') && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">
                {lang === 'da' ? 'Du har valgt væksttjenester' : 'You have selected growth services'}
              </h3>
              <p className="text-sm text-blue-700/80">
                {lang === 'da'
                  ? 'Vi har registreret dit valg af SEO & Ads. Gør opsætningen færdig i Vækst Centeret.'
                  : 'We have recorded your choice of SEO & Ads. Complete the setup in the Growth Hub.'}
              </p>
            </div>
          </div>
          <button
            onClick={onViewGrowth}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {lang === 'da' ? 'Gå til Vækst Center' : 'Go to Growth Hub'}
            <ArrowRight size={18} />
          </button>
        </div>
      )}

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

        <button
          onClick={onViewGrowth}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <BarChart3 className="text-purple-500 mb-3" size={24} />
          <h3 className="font-bold text-[#1D1D1F] mb-1 group-hover:text-purple-500 transition-colors">
            {lang === 'da' ? 'Vækst Center' : 'Growth Hub'}
          </h3>
          <p className="text-sm text-nexus-subtext">
            {lang === 'da' ? 'SEO & Google Ads styring' : 'SEO & Google Ads management'}
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
                  <span className={`text-xs px-2 py-1 rounded-full ${inquiry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
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
                ? `Nuværende plan: ${company?.pricingTier || 'Basic'}`
                : `Current plan: ${company?.pricingTier || 'Basic'}`}
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







