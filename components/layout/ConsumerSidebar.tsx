import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Language } from '../../types';
import { LayoutDashboard, Heart, Clock, MessageSquare, Settings, LogOut } from 'lucide-react';

interface ConsumerSidebarProps {
  lang: Language;
  onLogout: () => void;
}

const ConsumerSidebar: React.FC<ConsumerSidebarProps> = ({ lang, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: lang === 'da' ? 'Dashboard' : 'Dashboard'
    },
    {
      path: '/dashboard/saved',
      icon: Heart,
      label: lang === 'da' ? 'Gemte Annoncer' : 'Saved Listings'
    },
    {
      path: '/dashboard/recent',
      icon: Clock,
      label: lang === 'da' ? 'Seneste Søgninger' : 'Recent Searches'
    },
    {
      path: '/dashboard/inquiries',
      icon: MessageSquare,
      label: lang === 'da' ? 'Mine Forespørgsler' : 'My Inquiries'
    },
    {
      path: '/dashboard/settings',
      icon: Settings,
      label: lang === 'da' ? 'Kontoindstillinger' : 'Account Settings'
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

export default ConsumerSidebar;
