import React from 'react';
import { ViewState, Language } from '../../types';
import { LayoutDashboard, Heart, Clock, MessageSquare, Settings, LogOut } from 'lucide-react';
import { translations } from '../../translations';

interface ConsumerSidebarProps {
  currentView: ViewState;
  lang: Language;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const ConsumerSidebar: React.FC<ConsumerSidebarProps> = ({ currentView, lang, onNavigate, onLogout }) => {
  const menuItems = [
    {
      view: ViewState.CONSUMER_DASHBOARD,
      icon: LayoutDashboard,
      label: lang === 'da' ? 'Dashboard' : 'Dashboard'
    },
    {
      view: ViewState.CONSUMER_SAVED_LISTINGS,
      icon: Heart,
      label: lang === 'da' ? 'Gemte Annoncer' : 'Saved Listings'
    },
    {
      view: ViewState.CONSUMER_RECENT_SEARCHES,
      icon: Clock,
      label: lang === 'da' ? 'Seneste Søgninger' : 'Recent Searches'
    },
    {
      view: ViewState.CONSUMER_INQUIRIES,
      icon: MessageSquare,
      label: lang === 'da' ? 'Mine Forespørgsler' : 'My Inquiries'
    },
    {
      view: ViewState.CONSUMER_SETTINGS,
      icon: Settings,
      label: lang === 'da' ? 'Kontoindstillinger' : 'Account Settings'
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

export default ConsumerSidebar;
