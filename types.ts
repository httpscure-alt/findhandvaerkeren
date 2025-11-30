
export interface ServiceItem {
  title: string;
  description: string;
}

export interface PortfolioItem {
  title: string;
  imageUrl: string;
  category: string;
}

export interface TestimonialItem {
  author: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface Company {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  category: string;
  location: string;
  tags: string[];
  pricingTier: 'Standard' | 'Premium' | 'Elite';
  contactEmail: string;
  website: string;
  onboardingCompleted?: boolean;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  testimonials: TestimonialItem[];
  // Danish verification fields
  cvrNumber?: string | null;
  vatNumber?: string | null;
  legalName?: string | null;
  businessAddress?: string | null;
  cvrLookupUrl?: string | null;
  permitType?: string | null;
  permitIssuer?: string | null;
  permitNumber?: string | null;
  permitDocuments?: string[];
  verificationStatus?: VerificationStatus;
  verificationNotes?: string | null;
}

export interface ConsumerUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  location: string;
}

export interface FilterState {
  category: string | null;
  location: string | null;
  verifiedOnly: boolean;
  searchQuery: string;
}

export enum ViewState {
  // Visitor Pages
  HOME = 'HOME',
  LISTINGS = 'LISTINGS',
  PROFILE = 'PROFILE',
  PRICING = 'PRICING',
  CATEGORIES = 'CATEGORIES',
  HOW_IT_WORKS = 'HOW_IT_WORKS',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT',
  BLOG = 'BLOG',
  
  // Consumer Pages
  CONSUMER_DASHBOARD = 'CONSUMER_DASHBOARD',
  CONSUMER_SAVED_LISTINGS = 'CONSUMER_SAVED_LISTINGS',
  CONSUMER_RECENT_SEARCHES = 'CONSUMER_RECENT_SEARCHES',
  CONSUMER_INQUIRIES = 'CONSUMER_INQUIRIES',
  CONSUMER_SETTINGS = 'CONSUMER_SETTINGS',
  
  // Auth Pages
  AUTH = 'AUTH',
  SIGNUP = 'SIGNUP',
  SIGNUP_SELECT = 'SIGNUP_SELECT',
  CONSUMER_SIGNUP = 'CONSUMER_SIGNUP',
  PARTNER_REGISTER = 'PARTNER_REGISTER',
  
  // Partner Pages
  PARTNER_DASHBOARD = 'PARTNER_DASHBOARD',
  PARTNER_PROFILE_EDIT = 'PARTNER_PROFILE_EDIT',
  PARTNER_SERVICES = 'PARTNER_SERVICES',
  PARTNER_PORTFOLIO = 'PARTNER_PORTFOLIO',
  PARTNER_TESTIMONIALS = 'PARTNER_TESTIMONIALS',
  PARTNER_LEADS = 'PARTNER_LEADS',
  PARTNER_BILLING = 'PARTNER_BILLING',
  PARTNER_SETTINGS = 'PARTNER_SETTINGS',
  PARTNER_VERIFICATION = 'PARTNER_VERIFICATION',
  PARTNER_ONBOARDING_STEP_1 = 'PARTNER_ONBOARDING_STEP_1',
  PARTNER_ONBOARDING_STEP_2 = 'PARTNER_ONBOARDING_STEP_2',
  PARTNER_ONBOARDING_STEP_3 = 'PARTNER_ONBOARDING_STEP_3',
  PARTNER_ONBOARDING_STEP_4 = 'PARTNER_ONBOARDING_STEP_4',
  PARTNER_ONBOARDING_STEP_5 = 'PARTNER_ONBOARDING_STEP_5',
  PLAN_REVIEW = 'PLAN_REVIEW',
  PAYMENT_COMING_SOON = 'PAYMENT_COMING_SOON',
  
  // Admin Pages
  ADMIN = 'ADMIN',
  ADMIN_COMPANIES = 'ADMIN_COMPANIES',
  ADMIN_CONSUMERS = 'ADMIN_CONSUMERS',
  ADMIN_PARTNERS = 'ADMIN_PARTNERS',
  ADMIN_CATEGORIES = 'ADMIN_CATEGORIES',
  ADMIN_LOCATIONS = 'ADMIN_LOCATIONS',
  ADMIN_SUBSCRIPTIONS = 'ADMIN_SUBSCRIPTIONS',
  ADMIN_INQUIRIES = 'ADMIN_INQUIRIES',
  ADMIN_ANALYTICS = 'ADMIN_ANALYTICS',
  ADMIN_SETTINGS = 'ADMIN_SETTINGS',
  ADMIN_USERS = 'ADMIN_USERS',
  ADMIN_FINANCE = 'ADMIN_FINANCE',
  ADMIN_TRANSACTIONS = 'ADMIN_TRANSACTIONS',
  ADMIN_VERIFICATION_QUEUE = 'ADMIN_VERIFICATION_QUEUE',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_SECURITY_LOGS = 'ADMIN_SECURITY_LOGS',
  ADMIN_DATABASE = 'ADMIN_DATABASE',
  ADMIN_API_MONITORING = 'ADMIN_API_MONITORING'
}

export enum ModalState {
  CLOSED = 'CLOSED',
  REGISTER_FREE = 'REGISTER_FREE',
  CONTACT_SALES = 'CONTACT_SALES',
  CONTACT_VENDOR = 'CONTACT_VENDOR',
  LOGIN = 'LOGIN'
}

export interface GeminiSearchResponse {
  suggestedCategory: string;
  suggestedLocation: string;
  keywords: string[];
  reasoning: string;
}

export type Language = 'en' | 'da';

export interface SelectedPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  billingPeriod: 'monthly' | 'annual';
}
