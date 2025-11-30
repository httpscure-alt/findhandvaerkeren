import React from 'react';
import { ViewState, Language } from '../../types';
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  Tag,
  MapPin,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut
} from 'lucide-react';

interface AdminSidebarProps {
  currentView: ViewState;
  lang: Language;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, lang, onNavigate, onLogout }) => {
  const menuItems = [
    {
      view: ViewState.ADMIN,
      icon: LayoutDashboard,
      label: lang === 'da' ? 'Dashboard' : 'Dashboard'
    },
    {
      view: ViewState.ADMIN_COMPANIES,
      icon: Building2,
      label: lang === 'da' ? 'Virksomheder' : 'Companies'
    },
    {
      view: ViewState.ADMIN_CONSUMERS,
      icon: Users,
      label: lang === 'da' ? 'Forbrugere' : 'Consumers'
    },
    {
      view: ViewState.ADMIN_PARTNERS,
      icon: Briefcase,
      label: lang === 'da' ? 'Partnere' : 'Partners'
    },
    {
      view: ViewState.ADMIN_CATEGORIES,
      icon: Tag,
      label: lang === 'da' ? 'Kategorier' : 'Categories'
    },
    {
      view: ViewState.ADMIN_LOCATIONS,
      icon: MapPin,
      label: lang === 'da' ? 'Lokationer' : 'Locations'
    },
    {
      view: ViewState.ADMIN_SUBSCRIPTIONS,
      icon: CreditCard,
      label: lang === 'da' ? 'Abonnementer' : 'Subscriptions'
    },
    {
      view: ViewState.ADMIN_INQUIRIES,
      icon: MessageSquare,
      label: lang === 'da' ? 'Forespørgsler' : 'Inquiries'
    },
    {
      view: ViewState.ADMIN_ANALYTICS,
      icon: BarChart3,
      label: lang === 'da' ? 'Analytics' : 'Analytics'
    },
    {
      view: ViewState.ADMIN_SETTINGS,
      icon: Settings,
      label: lang === 'da' ? 'Indstillinger' : 'Settings'
    },
    {
      view: ViewState.ADMIN_USERS,
      icon: ShieldCheck,
      label: lang === 'da' ? 'Admin Brugere' : 'Admin Users'
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

export default AdminSidebar;
