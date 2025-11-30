import React from 'react';
import { ViewState, Language } from '../../types';
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
  ShieldCheck
} from 'lucide-react';

interface PartnerSidebarProps {
  currentView: ViewState;
  lang: Language;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({ currentView, lang, onNavigate, onLogout }) => {
  const menuItems = [
    {
      view: ViewState.PARTNER_DASHBOARD,
      icon: LayoutDashboard,
      label: lang === 'da' ? 'Dashboard' : 'Dashboard'
    },
    {
      view: ViewState.PARTNER_PROFILE_EDIT,
      icon: Building2,
      label: lang === 'da' ? 'Virksomhedsprofil' : 'Company Profile'
    },
    {
      view: ViewState.PARTNER_SERVICES,
      icon: Briefcase,
      label: lang === 'da' ? 'Ydelser' : 'Services'
    },
    {
      view: ViewState.PARTNER_PORTFOLIO,
      icon: Image,
      label: lang === 'da' ? 'Portefølje' : 'Portfolio'
    },
    {
      view: ViewState.PARTNER_TESTIMONIALS,
      icon: Star,
      label: lang === 'da' ? 'Udtalelser' : 'Testimonials',
      // Testimonials creation temporarily disabled until we finalise moderation rules.
    },
    {
      view: ViewState.PARTNER_VERIFICATION,
      icon: ShieldCheck,
      label: lang === 'da' ? 'Verificering' : 'Verification'
    },
    {
      view: ViewState.PARTNER_LEADS,
      icon: MessageSquare,
      label: lang === 'da' ? 'Leads & Beskeder' : 'Leads & Messages'
    },
    {
      view: ViewState.PARTNER_BILLING,
      icon: CreditCard,
      label: lang === 'da' ? 'Abonnement' : 'Subscription'
    },
    {
      view: ViewState.PARTNER_SETTINGS,
      icon: Settings,
      label: lang === 'da' ? 'Indstillinger' : 'Settings'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
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
