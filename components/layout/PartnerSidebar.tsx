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
  Zap
} from 'lucide-react';

interface PartnerSidebarProps {
  lang: Language;
  onLogout: () => void;
}

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({ lang, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
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
    },
    {
      path: '/dashboard/growth',
      icon: Zap,
      label: lang === 'da' ? 'Vækst' : 'Growth'
    },
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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                ? 'bg-nexus-bg text-[#1D1D1F] font-medium'
                : 'text-nexus-subtext hover:bg-gray-50 hover:text-[#1D1D1F]'
                }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4 border-t border-gray-200 mt-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span>{lang === 'da' ? 'Log Ud' : 'Logout'}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default PartnerSidebar;
