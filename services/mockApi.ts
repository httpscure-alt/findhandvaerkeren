import { MOCK_COMPANIES, CATEGORIES } from '../constants';
import { Company } from '../types';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for mock data
class MockStorage {
  public users: Map<string, any> = new Map();
  public savedListings: Map<string, Set<string>> = new Map(); // userId -> Set of companyIds
  public inquiries: any[] = [];
  public companies: Company[] = [...MOCK_COMPANIES];
  public categories: any[] = CATEGORIES.filter(c => c !== 'All').map((name, idx) => ({
    id: `cat-${idx}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: `${name} services and solutions`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  public locations: any[] = [
    { id: 'loc-1', name: 'København', slug: 'kobenhavn' },
    { id: 'loc-2', name: 'Aarhus', slug: 'aarhus' },
    { id: 'loc-3', name: 'Odense', slug: 'odense' },
    { id: 'loc-4', name: 'Aalborg', slug: 'aalborg' },
    { id: 'loc-5', name: 'Roskilde', slug: 'roskilde' },
  ];

  // User management
  getUser(userId: string) {
    return this.users.get(userId) || null;
  }

  setUser(userId: string, user: any) {
    this.users.set(userId, user);
  }

  // Saved listings
  getSavedListings(userId: string): string[] {
    return Array.from(this.savedListings.get(userId) || []);
  }

  saveListing(userId: string, companyId: string) {
    if (!this.savedListings.has(userId)) {
      this.savedListings.set(userId, new Set());
    }
    this.savedListings.get(userId)!.add(companyId);
  }

  unsaveListing(userId: string, companyId: string) {
    this.savedListings.get(userId)?.delete(companyId);
  }

  // Inquiries
  addInquiry(inquiry: any) {
    this.inquiries.push({
      ...inquiry,
      id: `inq-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  getInquiries(userId?: string, companyId?: string) {
    if (userId) {
      return this.inquiries.filter(i => i.consumerId === userId);
    }
    if (companyId) {
      return this.inquiries.filter(i => i.companyId === companyId);
    }
    return this.inquiries;
  }

  updateInquiry(id: string, status: string) {
    const inquiry = this.inquiries.find(i => i.id === id);
    if (inquiry) {
      inquiry.status = status;
      inquiry.updatedAt = new Date().toISOString();
    }
  }

  // Companies
  getCompanies() {
    return this.companies;
  }

  updateCompany(companyId: string, data: any) {
    const company = this.companies.find(c => c.id === companyId);
    if (company) {
      Object.assign(company, data, { updatedAt: new Date().toISOString() });
    }
    return company;
  }

  // Analytics
  private analytics: Map<string, any[]> = new Map();

  trackEvent(companyId: string, eventType: string, metadata?: any) {
    if (!this.analytics.has(companyId)) {
      this.analytics.set(companyId, []);
    }
    this.analytics.get(companyId)!.push({
      eventType,
      metadata,
      createdAt: new Date().toISOString(),
    });
  }

  getAnalytics(companyId: string) {
    return this.analytics.get(companyId) || [];
  }
}

const mockStorage = new MockStorage();

// Helper to get current user from localStorage
const getCurrentUserId = (): string | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || null;
    }
  } catch {
    return null;
  }
  return null;
};

// Generate mock token
const generateMockToken = (userId: string): string => {
  return `mock-token-${userId}-${Date.now()}`;
};

class MockApiService {
  // Auth
  async register(data: { email: string; password: string; name?: string; firstName?: string; lastName?: string; role?: string }) {
    await delay(500);
    
    const userId = `user-${Date.now()}`;
    const user = {
      id: userId,
      email: data.email,
      name: data.name || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.firstName || data.lastName || data.email.split('@')[0]),
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'CONSUMER',
      avatarUrl: null,
      location: null,
      createdAt: new Date().toISOString(),
    };

    mockStorage.setUser(userId, user);
    const token = generateMockToken(userId);

    return { user, token };
  }

  async login(email: string, password: string) {
    await delay(500);

    // Check if user exists
    let user = null;
    for (const [userId, storedUser] of mockStorage.users.entries()) {
      if (storedUser.email === email) {
        user = storedUser;
        break;
      }
    }

    // If user doesn't exist, create a mock user
    if (!user) {
      const userId = `user-${Date.now()}`;
      user = {
        id: userId,
        email,
        name: email.split('@')[0],
        firstName: null,
        lastName: null,
        role: email.includes('admin') ? 'ADMIN' : email.includes('partner') ? 'PARTNER' : 'CONSUMER',
        avatarUrl: null,
        location: null,
        createdAt: new Date().toISOString(),
      };
      mockStorage.setUser(userId, user);
    }

    const token = generateMockToken(user.id);
    return { user, token };
  }

  async getMe() {
    await delay(200);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const user = mockStorage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If user is a partner, add their company
    if (user.role === 'PARTNER') {
      const company = mockStorage.getCompanies().find(c => c.id === user.id) || null;
      return { user: { ...user, ownedCompany: company } };
    }

    return { user };
  }

  // Companies
  async getCompanies(params?: {
    category?: string;
    location?: string;
    verifiedOnly?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    await delay(300);

    let companies = [...mockStorage.getCompanies()];

    // Apply filters
    if (params?.category && params.category !== 'All') {
      companies = companies.filter(c => c.category === params.category);
    }

    if (params?.location && params.location !== 'All') {
      companies = companies.filter(c => c.location === params.location);
    }

    if (params?.verifiedOnly) {
      companies = companies.filter(c => c.isVerified);
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      companies = companies.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.shortDescription.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = companies.slice(start, end);

    return {
      companies: paginated,
      pagination: {
        page,
        limit,
        total: companies.length,
        totalPages: Math.ceil(companies.length / limit),
      },
    };
  }

  async getCompany(id: string) {
    await delay(200);
    const company = mockStorage.getCompanies().find(c => c.id === id);
    if (!company) {
      throw new Error('Company not found');
    }
    return { company };
  }

  async createCompany(data: any) {
    await delay(500);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const company: Company = {
      id: `company-${Date.now()}`,
      name: data.name,
      shortDescription: data.shortDescription || '',
      description: data.description || '',
      logoUrl: data.logoUrl || 'https://picsum.photos/id/42/200/200',
      bannerUrl: data.bannerUrl || 'https://picsum.photos/id/48/1200/400',
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      category: data.category,
      location: data.location,
      tags: data.tags || [],
      pricingTier: data.pricingTier || 'Standard',
      contactEmail: data.contactEmail,
      website: data.website || '',
      services: [],
      portfolio: [],
      testimonials: [],
    };

    mockStorage.companies.push(company);
    return { company };
  }

  async updateCompany(id: string, data: any) {
    await delay(300);
    const company = mockStorage.updateCompany(id, data);
    if (!company) {
      throw new Error('Company not found');
    }
    return { company };
  }

  async deleteCompany(id: string) {
    await delay(300);
    const companies = mockStorage.companies;
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Company not found');
    }
    companies.splice(index, 1);
    return { message: 'Company deleted successfully' };
  }

  async verifyCompany(id: string, isVerified: boolean) {
    await delay(300);
    const company = mockStorage.updateCompany(id, { isVerified });
    if (!company) {
      throw new Error('Company not found');
    }
    return { company };
  }

  // Saved Listings
  async getSavedListings() {
    await delay(200);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const savedIds = mockStorage.getSavedListings(userId);
    const companies = mockStorage.getCompanies().filter(c => savedIds.includes(c.id));

    return {
      savedListings: savedIds.map(companyId => ({
        id: `saved-${companyId}`,
        consumerId: userId,
        companyId,
        company: companies.find(c => c.id === companyId),
        createdAt: new Date().toISOString(),
      })),
    };
  }

  async saveListing(companyId: string) {
    await delay(300);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    mockStorage.saveListing(userId, companyId);
    const company = mockStorage.getCompanies().find(c => c.id === companyId);

    return {
      savedListing: {
        id: `saved-${companyId}`,
        consumerId: userId,
        companyId,
        company,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async unsaveListing(companyId: string) {
    await delay(300);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    mockStorage.unsaveListing(userId, companyId);
    return { message: 'Listing removed from saved' };
  }

  // Inquiries
  async getInquiries(type?: string) {
    await delay(200);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const user = mockStorage.getUser(userId);
    let inquiries = [];

    if (user?.role === 'CONSUMER') {
      inquiries = mockStorage.getInquiries(userId);
    } else if (user?.role === 'PARTNER') {
      // Get inquiries for partner's company
      const company = mockStorage.getCompanies().find(c => c.id === user.id);
      if (company) {
        inquiries = mockStorage.getInquiries(undefined, company.id);
      }
    } else {
      inquiries = mockStorage.getInquiries();
    }

    // Add consumer info
    inquiries = inquiries.map(inq => ({
      ...inq,
      consumer: {
        id: inq.consumerId,
        name: `User ${inq.consumerId.slice(-4)}`,
        email: `user${inq.consumerId.slice(-4)}@example.com`,
      },
      company: mockStorage.getCompanies().find(c => c.id === inq.companyId),
    }));

    return { inquiries };
  }

  async createInquiry(companyId: string, message: string) {
    await delay(400);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const inquiry = {
      consumerId: userId,
      companyId,
      message,
    };

    mockStorage.addInquiry(inquiry);
    const saved = mockStorage.getInquiries().find(i => i.consumerId === userId && i.companyId === companyId);

    return { inquiry: saved };
  }

  async updateInquiry(id: string, status: string) {
    await delay(300);
    mockStorage.updateInquiry(id, status);
    const inquiry = mockStorage.getInquiries().find(i => i.id === id);
    return { inquiry };
  }

  // Categories
  async getCategories() {
    await delay(200);
    return { categories: mockStorage.categories };
  }

  async createCategory(data: { name: string; description?: string }) {
    await delay(300);
    const category = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockStorage.categories.push(category);
    return { category };
  }

  async updateCategory(id: string, data: { name?: string; description?: string }) {
    await delay(300);
    const category = mockStorage.categories.find(c => c.id === id);
    if (!category) {
      throw new Error('Category not found');
    }
    Object.assign(category, data, { updatedAt: new Date().toISOString() });
    return { category };
  }

  async deleteCategory(id: string) {
    await delay(300);
    const categories = mockStorage.categories;
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    categories.splice(index, 1);
    return { message: 'Category deleted successfully' };
  }

  // Locations
  async getLocations() {
    await delay(200);
    return { locations: mockStorage.locations };
  }

  async createLocation(name: string) {
    await delay(300);
    const location = {
      id: `loc-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockStorage.locations.push(location);
    return { location };
  }

  async updateLocation(id: string, name: string) {
    await delay(300);
    const location = mockStorage.locations.find(l => l.id === id);
    if (!location) {
      throw new Error('Location not found');
    }
    Object.assign(location, { name, slug: name.toLowerCase().replace(/\s+/g, '-'), updatedAt: new Date().toISOString() });
    return { location };
  }

  async deleteLocation(id: string) {
    await delay(300);
    const locations = mockStorage.locations;
    const index = locations.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Location not found');
    }
    locations.splice(index, 1);
    return { message: 'Location deleted successfully' };
  }

  // Analytics
  async trackEvent(companyId: string, eventType: string, metadata?: any) {
    await delay(100);
    mockStorage.trackEvent(companyId, eventType, metadata);
    return { message: 'Event tracked' };
  }

  async getCompanyAnalytics(companyId: string) {
    await delay(200);
    const events = mockStorage.getAnalytics(companyId);
    return {
      analytics: {
        totalEvents: events.length,
        events,
        views: events.filter(e => e.eventType === 'profile_view').length,
        saves: events.filter(e => e.eventType === 'save').length,
        inquiries: events.filter(e => e.eventType === 'inquiry').length,
      },
    };
  }

  // Onboarding (Partner)
  async getOnboardingStatus() {
    await delay(200);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const user = mockStorage.getUser(userId);
    if (!user || user.role !== 'PARTNER') {
      throw new Error('Not a partner');
    }

    const company = mockStorage.getCompanies().find(c => c.id === userId);
    
    if (!company) {
      return { step: 0, hasCompany: false };
    }

    // Determine step based on company data
    let step = 1;
    if (company.shortDescription && company.description) step = 2;
    if (company.logoUrl || company.bannerUrl) step = 3;
    if (company.portfolio && company.portfolio.length > 0) step = 4;

    return { step, hasCompany: true, company };
  }

  async saveOnboardingStep1(data: { name: string; category: string; location: string; contactEmail: string; website?: string; phone?: string }) {
    await delay(400);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get user email for contactEmail if not provided
    const user = mockStorage.getUser(userId);
    const contactEmail = data.contactEmail || user?.email || '';

    const company: Company = {
      id: userId,
      name: data.name,
      shortDescription: '',
      description: '',
      logoUrl: '',
      bannerUrl: '',
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      category: data.category,
      location: data.location,
      tags: [],
      pricingTier: 'Standard',
      contactEmail: contactEmail,
      website: data.website || '',
      services: [],
      portfolio: [],
      testimonials: [],
    };

    // Check if company already exists
    const existingIndex = mockStorage.companies.findIndex(c => c.id === userId);
    if (existingIndex >= 0) {
      Object.assign(mockStorage.companies[existingIndex], {
        name: data.name,
        category: data.category,
        location: data.location,
        contactEmail: contactEmail,
        website: data.website,
      });
    } else {
      mockStorage.companies.push(company);
    }

    return { company, step: 1 };
  }

  async saveOnboardingStep2(data: { shortDescription: string; description: string }) {
    await delay(400);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const company = mockStorage.getCompanies().find(c => c.id === userId);
    if (!company) {
      throw new Error('Company not found. Complete step 1 first.');
    }

    Object.assign(company, {
      shortDescription: data.shortDescription,
      description: data.description,
    });

    return { company, step: 2 };
  }

  async saveOnboardingStep3(data: { logoUrl?: string; bannerUrl?: string; gallery?: Array<{ imageUrl: string; title: string; category: string }> }) {
    await delay(400);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const company = mockStorage.getCompanies().find(c => c.id === userId);
    if (!company) {
      throw new Error('Company not found. Complete step 1 first.');
    }

    if (data.logoUrl) company.logoUrl = data.logoUrl;
    if (data.bannerUrl) company.bannerUrl = data.bannerUrl;
    if (data.gallery) {
      company.portfolio = data.gallery.map(item => ({
        title: item.title,
        category: item.category,
        imageUrl: item.imageUrl,
      }));
    }

    return { company, step: 3 };
  }

  async completeOnboarding() {
    await delay(300);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const company = mockStorage.getCompanies().find(c => c.id === userId);
    if (!company) {
      throw new Error('Company not found');
    }

    return {
      company,
      step: 4,
      completed: true,
      message: 'Onboarding completed successfully',
    };
  }

  // User Profile (Consumer)
  async getConsumerProfile() {
    await delay(200);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const user = mockStorage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const savedIds = mockStorage.getSavedListings(userId);
    const savedListings = savedIds.map(companyId => ({
      id: `saved-${companyId}`,
      consumerId: userId,
      companyId,
      company: mockStorage.getCompanies().find(c => c.id === companyId),
      createdAt: new Date().toISOString(),
    }));

    const inquiries = mockStorage.getInquiries(userId).map(inq => ({
      ...inq,
      company: mockStorage.getCompanies().find(c => c.id === inq.companyId),
    }));

    return {
      user: {
        ...user,
        savedListings,
        sentInquiries: inquiries,
      },
    };
  }

  async updateConsumerProfile(data: { firstName?: string; lastName?: string; name?: string; location?: string; avatarUrl?: string }) {
    await delay(300);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const user = mockStorage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, {
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      name: data.name || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : user.name),
      location: data.location ?? user.location,
      avatarUrl: data.avatarUrl ?? user.avatarUrl,
    });

    return { user };
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    await delay(300);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }
    // In mock, always succeed
    return { message: 'Password updated successfully' };
  }

  async deleteAccount() {
    await delay(300);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }
    mockStorage.users.delete(userId);
    mockStorage.savedListings.delete(userId);
    return { message: 'Account deleted successfully' };
  }

  // Business Dashboard (Partner)
  async getBusinessDashboard() {
    await delay(300);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const company = mockStorage.getCompanies().find(c => c.id === userId);
    if (!company) {
      throw new Error('Company not found');
    }

    const inquiries = mockStorage.getInquiries(undefined, company.id).map(inq => ({
      ...inq,
      consumer: {
        id: inq.consumerId,
        name: `User ${inq.consumerId.slice(-4)}`,
        email: `user${inq.consumerId.slice(-4)}@example.com`,
      },
    }));

    const savedIds = Array.from(mockStorage.savedListings.values())
      .flatMap(set => Array.from(set))
      .filter(id => id === company.id);

    return {
      company: {
        ...company,
        inquiries: inquiries.slice(0, 10),
        subscriptions: [],
        savedBy: savedIds.map(id => ({
          id: `saved-${id}`,
          consumerId: id,
          companyId: company.id,
          consumer: {
            id: id,
            name: `User ${id.slice(-4)}`,
          },
        })),
        _count: {
          savedBy: savedIds.length,
          inquiries: inquiries.length,
        },
      },
    };
  }

  async updateBusinessListing(data: any) {
    await delay(400);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const company = mockStorage.updateCompany(userId, data);
    if (!company) {
      throw new Error('Company not found');
    }

    return { company };
  }

  async getBusinessAnalytics() {
    await delay(200);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const events = mockStorage.getAnalytics(userId);
    const savedIds = Array.from(mockStorage.savedListings.values())
      .flatMap(set => Array.from(set))
      .filter(id => id === userId);
    const inquiries = mockStorage.getInquiries(undefined, userId);

    return {
      views: events.filter(e => e.eventType === 'profile_view').length || Math.floor(Math.random() * 100) + 50,
      saves: savedIds.length || Math.floor(Math.random() * 20) + 5,
      inquiries: inquiries.length || Math.floor(Math.random() * 10) + 2,
    };
  }
}

export const mockApi = new MockApiService();
