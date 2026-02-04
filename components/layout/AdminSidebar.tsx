import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Language } from '../../types';
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
  LogOut,
  DollarSign,
  Receipt,
  FileCheck,
  Database,
  Activity,
  FileText
} from 'lucide-react';

interface AdminSidebarProps {
  lang: Language;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ lang, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/admin',
      icon: LayoutDashboard,
      label: lang === 'da' ? 'Dashboard' : 'Dashboard'
    },
    {
      path: '/admin/companies',
      icon: Building2,
      label: lang === 'da' ? 'Virksomheder' : 'Companies'
    },
    {
      path: '/admin/consumers',
      icon: Users,
      label: lang === 'da' ? 'Forbrugere' : 'Consumers'
    },
    {
      path: '/admin/partners',
      icon: Briefcase,
      label: lang === 'da' ? 'Partnere' : 'Partners'
    },
    {
      path: '/admin/categories',
      icon: Tag,
      label: lang === 'da' ? 'Kategorier' : 'Categories'
    },
    {
      path: '/admin/locations',
      icon: MapPin,
      label: lang === 'da' ? 'Lokationer' : 'Locations'
    },
    {
      path: '/admin/subscriptions',
      icon: CreditCard,
      label: lang === 'da' ? 'Abonnementer' : 'Subscriptions'
    },
    {
      path: '/admin/inquiries',
      icon: MessageSquare,
      label: lang === 'da' ? 'Forespørgsler' : 'Inquiries'
    },
    {
      path: '/admin/analytics',
      icon: BarChart3,
      label: lang === 'da' ? 'Analytics' : 'Analytics'
    },
    {
      path: '/admin/settings',
      icon: Settings,
      label: lang === 'da' ? 'Indstillinger' : 'Settings'
    },
    {
      path: '/admin/users',
      icon: ShieldCheck,
      label: lang === 'da' ? 'Admin Brugere' : 'Admin Users'
    },
    {
      path: '/admin/finance',
      icon: DollarSign,
      label: lang === 'da' ? 'Finans' : 'Finance'
    },
    {
      path: '/admin/transactions',
      icon: Receipt,
      label: lang === 'da' ? 'Transaktioner' : 'Transactions'
    },
    {
      path: '/admin/verification-queue',
      icon: FileCheck,
      label: lang === 'da' ? 'Verificeringskø' : 'Verification Queue'
    },
    {
      path: '/admin/activity-logs',
      icon: FileText,
      label: lang === 'da' ? 'Aktivitetslog' : 'Activity Logs'
    },
    {
      path: '/admin/security-logs',
      icon: ShieldCheck,
      label: lang === 'da' ? 'Sikkerhedslog' : 'Security Logs'
    },
    {
      path: '/admin/database',
      icon: Database,
      label: lang === 'da' ? 'Database' : 'Database'
    },
    {
      path: '/admin/api-monitoring',
      icon: Activity,
      label: lang === 'da' ? 'API Monitoring' : 'API Monitoring'
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

export default AdminSidebar;
