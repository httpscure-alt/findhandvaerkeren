import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Language } from '../../types';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Image,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Star,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Globe
} from 'lucide-react';

interface PartnerSidebarProps {
  lang: Language;
  onLogout: () => void;
}

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({ lang, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const coreItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: lang === 'da' ? 'Dashboard' : 'Dashboard'
    },
    {
      path: '/dashboard/profile',
      icon: Building2,
      label: lang === 'da' ? 'Virksomhedsprofil' : 'Company Profile'
    },
    {
      path: '/dashboard/services',
      icon: Briefcase,
      label: lang === 'da' ? 'Ydelser' : 'Services'
    },
    {
      path: '/dashboard/portfolio',
      icon: Image,
      label: lang === 'da' ? 'Portefølje' : 'Portfolio'
    },
    {
      path: '/dashboard/testimonials',
      icon: Star,
      label: lang === 'da' ? 'Udtalelser' : 'Testimonials',
    },
    {
      path: '/dashboard/verification',
      icon: ShieldCheck,
      label: lang === 'da' ? 'Verificering' : 'Verification'
    },
    {
      path: '/dashboard/inquiries',
      icon: MessageSquare,
      label: lang === 'da' ? 'Leads & Beskeder' : 'Leads & Messages'
    }
  ];

  const growthItems = [
    {
      path: '/dashboard/growth?tab=overview',
      icon: TrendingUp,
      label: lang === 'da' ? 'Performance' : 'Performance overview'
    },
    {
      path: '/dashboard/growth?tab=recommendations',
      icon: Sparkles,
      label: lang === 'da' ? 'Anbefalinger' : 'Recommendations'
    },
    {
      path: '/dashboard/growth?tab=status',
      icon: Globe,
      label: lang === 'da' ? 'Kampagne Status' : 'Campaign status'
    }
  ];

  const systemItems = [
    {
      path: '/dashboard/billing',
      icon: CreditCard,
      label: lang === 'da' ? 'Abonnement' : 'Subscription'
    },
    {
      path: '/dashboard/settings',
      icon: Settings,
      label: lang === 'da' ? 'Indstillinger' : 'Settings'
    }
  ];

  const renderItem = (item: any) => {
    const Icon = item.icon;
    const isActive = location.pathname + location.search === item.path || (location.pathname === item.path && !location.search);

    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive
          ? 'bg-[#1D1D1F] text-white font-medium shadow-md'
          : 'text-nexus-subtext hover:bg-gray-50 hover:text-[#1D1D1F]'
          }`}
      >
        <Icon size={18} />
        <span className="text-sm">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 overflow-y-auto">
      <nav className="space-y-6">
        <div className="space-y-1">
          {coreItems.map(renderItem)}
        </div>

        <div className="space-y-2">
          <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
            {lang === 'da' ? 'SEO & Ads' : 'SEO & Ads'}
          </h3>
          <div className="space-y-1">
            {growthItems.map(renderItem)}
          </div>
        </div>

        <div className="space-y-1">
          {systemItems.map(renderItem)}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold">{lang === 'da' ? 'Log Ud' : 'Logout'}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default PartnerSidebar;
