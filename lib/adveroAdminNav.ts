import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  ScanSearch,
  Search,
  Users,
} from 'lucide-react';

export type AdveroAdminNavItem = {
  to: string;
  end?: boolean;
  icon: LucideIcon;
  labelDa: string;
  labelEn: string;
  section?: 'business' | 'content';
};

export const ADVERO_ADMIN_NAV: AdveroAdminNavItem[] = [
  {
    to: '/advero/admin',
    end: true,
    icon: LayoutDashboard,
    labelDa: 'Overblik',
    labelEn: 'Overview',
    section: 'business',
  },
  {
    to: '/advero/admin/workspaces',
    icon: Building2,
    labelDa: 'Kunder',
    labelEn: 'Customers',
    section: 'business',
  },
  {
    to: '/advero/admin/audits',
    icon: ScanSearch,
    labelDa: 'Audits',
    labelEn: 'Audits',
    section: 'business',
  },
  {
    to: '/advero/admin/subscriptions',
    icon: CreditCard,
    labelDa: 'Abonnementer',
    labelEn: 'Subscriptions',
    section: 'business',
  },
  {
    to: '/advero/admin/fulfillment',
    icon: ClipboardList,
    labelDa: 'Nye ordrer',
    labelEn: 'New orders',
    section: 'business',
  },
  {
    to: '/advero/admin/users',
    icon: Users,
    labelDa: 'Brugere',
    labelEn: 'Users',
    section: 'business',
  },
  {
    to: '/advero/admin/content',
    icon: FileText,
    labelDa: 'Blog / CMS',
    labelEn: 'Blog / CMS',
    section: 'content',
  },
  {
    to: '/advero/admin/seo',
    icon: Search,
    labelDa: 'SEO-værktøjer',
    labelEn: 'SEO tools',
    section: 'content',
  },
];
