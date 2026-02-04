import { MOCK_COMPANIES, CATEGORIES } from '../constants';
import { Company, VerificationStatus } from '../types';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for mock data
class MockStorage {
  public users: Map<string, any> = new Map();
  public savedListings: Map<string, Set<string>> = new Map(); // userId -> Set of companyIds
  public inquiries: any[] = [];
  public companies: Company[] = [...MOCK_COMPANIES];
  public jobRequests: any[] = [];
  public leadMatches: any[] = [];
  public quotes: any[] = [];
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

  constructor() {
    // Initialize dummy data for testing
    this.initializeDummyData();
  }

  private initializeDummyData() {
    // Create a demo consumer user
    const demoConsumerId = 'demo-consumer-1';
    this.users.set(demoConsumerId, {
      id: demoConsumerId,
      email: 'demo@consumer.com',
      name: 'Demo Consumer',
      firstName: 'Demo',
      lastName: 'Consumer',
      role: 'CONSUMER',
      avatarUrl: null,
      location: 'København',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Create demo partner user
    const demoPartnerId = 'demo-partner-1';
    this.users.set(demoPartnerId, {
      id: demoPartnerId,
      email: 'demo@partner.com',
      name: 'Demo Partner',
      firstName: 'Partner',
      lastName: 'Demo',
      role: 'PARTNER',
      avatarUrl: null,
      location: 'København',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Create demo partner company (matching the partner user ID)
    this.companies.push({
      id: demoPartnerId, // Important: matches the user ID so getOnboardingStatus works
      name: 'Demo Craftsmen Service',
      shortDescription: 'Your trusted local craftsmen for all home improvement needs.',
      description: 'We are a full-service home improvement company specializing in renovations, repairs, and custom projects. Our team of skilled craftsmen has over 15 years of combined experience serving the Copenhagen area.',
      logoUrl: 'https://picsum.photos/id/45/200/200',
      bannerUrl: 'https://picsum.photos/id/49/1200/400',
      isVerified: true,
      rating: 4.8,
      reviewCount: 67,
      category: 'Tømrer',
      location: 'København',
      postalCode: '2100',
      tags: ['Renovation', 'Repairs', 'Custom'],
      pricingTier: 'Premium',
      contactEmail: 'demo@partner.com',
      website: 'democraftsmen.dk',
      phone: '+45 12 34 56 78',
      address: 'Vesterbrogade 123, 1620 København V',
      cvrNumber: '12345678',
      onboardingCompleted: true, // Important: marks onboarding as done so dashboard loads
      services: [
        { id: 's-demo-1', title: 'Kitchen Renovation', description: 'Complete kitchen remodeling including cabinets, countertops, and appliances.' },
        { id: 's-demo-2', title: 'Bathroom Renovation', description: 'Modern bathroom upgrades with quality fixtures and tiling.' },
        { id: 's-demo-3', title: 'General Repairs', description: 'All types of home repairs, from plumbing to electrical.' },
      ],
      portfolio: [
        { id: 'p-demo-1', title: 'Modern Kitchen', category: 'Renovation', imageUrl: 'https://picsum.photos/id/42/600/400', description: 'Complete kitchen redesign with modern fixtures.' },
        { id: 'p-demo-2', title: 'Bathroom Update', category: 'Renovation', imageUrl: 'https://picsum.photos/id/28/600/400', description: 'Luxurious bathroom renovation with premium materials.' },
      ],
      testimonials: [
        { id: 't-demo-1', author: 'Lars Nielsen', role: 'Homeowner', company: 'Private', content: 'Excellent work on our kitchen renovation. Very professional!', rating: 5 },
      ],
    } as any);

    // === DUMMY INQUIRIES (for Consumer "My Inquiries" page) ===
    this.inquiries = [
      {
        id: 'inq-demo-1',
        consumerId: demoConsumerId,
        companyId: '1', // Nexus Solutions
        message: 'Hi, I need help with cloud migration for my e-commerce platform. Can you provide a quote?',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'inq-demo-2',
        consumerId: demoConsumerId,
        companyId: '2', // Summit Capital
        message: 'Looking for Series A funding advice for our startup. Would love to discuss opportunities.',
        status: 'RESPONDED',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'inq-demo-3',
        consumerId: demoConsumerId,
        companyId: '3', // Alpha Design Studio
        message: 'Need a complete rebrand for my bakery business - logo, website, and packaging design.',
        status: 'CLOSED',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // === DUMMY JOB REQUESTS (3 Quotes feature) ===
    this.jobRequests = [
      {
        id: 'job-demo-1',
        consumerId: demoConsumerId,
        title: 'Website Redesign for Restaurant',
        description: 'Need a modern, responsive website for my restaurant. Should include online ordering, menu display, and reservation system.',
        category: 'Technology',
        postalCode: '2100',
        images: ['https://picsum.photos/id/292/600/400'],
        status: 'open',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'job-demo-2',
        consumerId: demoConsumerId,
        title: 'Startup Financial Planning',
        description: 'Looking for financial advisory services for our early-stage fintech startup. Need help with funding strategy and investor pitch.',
        category: 'Finance',
        postalCode: '8000',
        images: [],
        status: 'open',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'job-demo-3',
        consumerId: demoConsumerId,
        title: 'Brand Identity Package',
        description: 'Complete branding package for a new eco-friendly fashion line. Need logo, color palette, and brand guidelines.',
        category: 'Marketing',
        postalCode: '5000',
        images: ['https://picsum.photos/id/225/600/400', 'https://picsum.photos/id/96/600/400'],
        status: 'closed',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // === DUMMY LEAD MATCHES (Partners matched to jobs) ===
    this.leadMatches = [
      // Matches for Job 1 (Website Redesign)
      {
        id: 'match-demo-1a',
        jobRequestId: 'job-demo-1',
        companyId: '1', // Nexus Solutions
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // Matches for Job 2 (Startup Financial Planning)
      {
        id: 'match-demo-2a',
        jobRequestId: 'job-demo-2',
        companyId: '2', // Summit Capital
        status: 'quoted',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'match-demo-2b',
        jobRequestId: 'job-demo-2',
        companyId: '6', // Nordic Consult
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // Matches for Job 3 (Brand Identity - closed)
      {
        id: 'match-demo-3a',
        jobRequestId: 'job-demo-3',
        companyId: '3', // Alpha Design Studio
        status: 'quoted',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // === LEADS FOR DEMO PARTNER (demo-partner-1) ===
      {
        id: 'match-demo-partner-1',
        jobRequestId: 'job-demo-1', // Website Redesign
        companyId: 'demo-partner-1',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'match-demo-partner-2',
        jobRequestId: 'job-demo-2', // Financial Planning
        companyId: 'demo-partner-1',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // === DUMMY QUOTES (from partners) ===
    this.quotes = [
      {
        id: 'quote-demo-1',
        matchId: 'match-demo-2a',
        price: 15000,
        message: 'We would be happy to help with your startup funding strategy. Our team has extensive experience in fintech investments. This quote includes a 3-month advisory package.',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'quote-demo-2',
        matchId: 'match-demo-3a',
        price: 8500,
        message: 'Complete brand identity package including logo design, typography selection, color palette, and comprehensive brand guidelines document. Delivery in 4-6 weeks.',
        status: 'accepted',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Add portfolio descriptions to existing mock companies
    this.companies.forEach(company => {
      if (company.portfolio && company.portfolio.length > 0) {
        company.portfolio = company.portfolio.map((item: any, idx: number) => ({
          ...item,
          description: this.getPortfolioDescription(company.category, idx),
        }));
      }
    });
  }

  private getPortfolioDescription(category: string, index: number): string {
    const descriptions: Record<string, string[]> = {
      'Technology': [
        'Complete system redesign with microservices architecture, reducing load times by 60%.',
        'Custom AI chatbot integration that improved customer satisfaction scores by 35%.',
        'Real-time analytics dashboard enabling data-driven decision making.',
      ],
      'Finance': [
        'Successful Series B funding round, raising $15M for continued growth.',
        'Payment platform scaling that now processes 1M+ transactions daily.',
      ],
      'Marketing': [
        'Award-winning rebrand that increased brand recognition by 40%.',
        'Responsive web design that boosted mobile conversions by 55%.',
        'Sustainable packaging design reducing environmental impact.',
      ],
      'Consulting': [
        'Market entry strategy that achieved 20% market share within first year.',
      ],
    };
    const categoryDescriptions = descriptions[category] || ['Professional work delivered on time and within budget.'];
    return categoryDescriptions[index % categoryDescriptions.length];
  }

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

    // If user doesn't exist, create or use demo user
    if (!user) {
      // For consumer logins, use demo consumer to show dummy data
      const isPartner = email.includes('partner');
      const isAdmin = email.includes('admin');

      if (!isPartner && !isAdmin) {
        // Use demo consumer to show dummy data
        user = mockStorage.users.get('demo-consumer-1');
        if (user) {
          // Update email to match login
          user = { ...user, email };
        }
      }

      // If still no user, create new one
      if (!user) {
        const userId = isPartner ? 'demo-partner-1' : `user-${Date.now()}`;
        const existingUser = mockStorage.users.get(userId);

        if (existingUser) {
          user = { ...existingUser, email };
        } else {
          user = {
            id: userId,
            email,
            name: email.split('@')[0],
            firstName: null,
            lastName: null,
            role: isAdmin ? 'ADMIN' : isPartner ? 'PARTNER' : 'CONSUMER',
            avatarUrl: null,
            location: null,
            createdAt: new Date().toISOString(),
          };
          mockStorage.setUser(userId, user);
        }
      }
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
    postalCode?: string;
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

    if (params?.postalCode) {
      companies = companies.filter(c => c.postalCode === params.postalCode);
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

    // Sort logic: Gold first
    companies.sort((a, b) => {
      if (a.pricingTier === 'Gold' && b.pricingTier !== 'Gold') return -1;
      if (a.pricingTier !== 'Gold' && b.pricingTier === 'Gold') return 1;
      return 0;
    });

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
      return { step: 0, hasCompany: false, onboardingCompleted: false };
    }

    // If onboarding is completed, return that status
    if (company.onboardingCompleted) {
      return {
        step: 5,
        hasCompany: true,
        onboardingCompleted: true,
        company
      };
    }

    // Determine step based on company data
    let step = 1;
    if (company.shortDescription && company.description) step = 2;
    if (company.logoUrl || company.bannerUrl) step = 3;
    if (company.cvrNumber || company.permitType) step = 4; // Step 4 is verification

    return {
      step,
      hasCompany: true,
      onboardingCompleted: company.onboardingCompleted || false,
      company
    };
  }

  async saveOnboardingStep1(data: { name: string; category: string; location: string; contactEmail: string; website?: string; phone?: string; cvrNumber?: string; address?: string }) {
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
      address: data.address || '',
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
      phone: data.phone || '',
      cvrNumber: data.cvrNumber || '',
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
        phone: data.phone,
        cvrNumber: data.cvrNumber,
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

    // Logo and banner are optional - save even if empty
    company.logoUrl = data.logoUrl || null;
    company.bannerUrl = data.bannerUrl || null;
    if (data.gallery) {
      company.portfolio = data.gallery.map((item, idx) => ({
        id: `port-${Date.now()}-${idx}`,
        title: item.title,
        category: item.category,
        imageUrl: item.imageUrl,
      }));
    }

    return { company, step: 3 };
  }

  async saveOnboardingStep4(data: {
    cvrNumber?: string;
    vatNumber?: string;
    legalName?: string;
    businessAddress?: string;
    cvrLookupUrl?: string;
    permitType?: string;
    permitIssuer?: string;
    permitNumber?: string;
    permitDocuments?: string[];
    requestVerification?: boolean;
  }) {
    await delay(400);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const company = mockStorage.getCompanies().find(c => c.id === userId);
    if (!company) {
      throw new Error('Company not found. Complete step 1 first.');
    }

    // Set verification status based on request
    const verificationStatus = (data.requestVerification ? 'pending' : 'unverified') as VerificationStatus;

    Object.assign(company, {
      cvrNumber: data.cvrNumber || null,
      vatNumber: data.vatNumber || null,
      legalName: data.legalName || null,
      businessAddress: data.businessAddress || null,
      cvrLookupUrl: data.cvrLookupUrl || null,
      permitType: data.permitType || null,
      permitIssuer: data.permitIssuer || null,
      permitNumber: data.permitNumber || null,
      permitDocuments: data.permitDocuments || [],
      verificationStatus: verificationStatus as VerificationStatus,
      // Only set isVerified to true if status is verified
      isVerified: verificationStatus === 'verified',
    });

    return { company, step: 4 };
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

    // Mark onboarding as completed
    company.onboardingCompleted = true;

    return {
      company,
      step: 5,
      completed: true,
      onboardingCompleted: true,
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

  // Admin Finance & Transactions
  async getFinanceMetrics() {
    await delay(300);
    return {
      totalRevenue: 125430.50,
      monthlyRecurringRevenue: 12450.00,
      activeSubscriptions: 254,
      newSubscriptionsThisMonth: 23,
      cancellationsThisMonth: 5,
      upcomingRenewals: 42,
    };
  }

  async getTransactions(params?: { dateRange?: string }) {
    await delay(300);
    const mockTransactions = [
      {
        id: '1',
        userOrCompany: 'Nexus Solutions',
        planName: 'Partner Plan',
        billingCycle: 'monthly',
        amount: 49,
        status: 'paid',
        date: '2024-01-15',
        transactionId: 'txn_abc123',
      },
      {
        id: '2',
        userOrCompany: 'Summit Capital',
        planName: 'Partner Plan',
        billingCycle: 'annual',
        amount: 470.40,
        status: 'paid',
        date: '2024-01-14',
        transactionId: 'txn_def456',
      },
      {
        id: '3',
        userOrCompany: 'TechFlow Inc',
        planName: 'Partner Plan',
        billingCycle: 'monthly',
        amount: 49,
        status: 'failed',
        date: '2024-01-13',
        transactionId: 'txn_ghi789',
      },
      {
        id: '4',
        userOrCompany: 'CloudBuilders',
        planName: 'Partner Plan',
        billingCycle: 'monthly',
        amount: 49,
        status: 'upcoming',
        date: '2024-01-20',
        transactionId: 'txn_jkl012',
      },
      {
        id: '5',
        userOrCompany: 'DataSync Pro',
        planName: 'Partner Plan',
        billingCycle: 'annual',
        amount: 470.40,
        status: 'paid',
        date: '2024-01-12',
        transactionId: 'txn_mno345',
      },
    ];
    return { transactions: mockTransactions };
  }

  async getVerificationQueue() {
    await delay(300);
    return {
      requests: [
        {
          id: '1',
          companyName: 'Nexus Solutions',
          cvrNumber: '12345678',
          submittedDate: '2024-01-10',
          status: 'pending',
          permitType: 'Electrical authorisation',
          permitDocuments: 3,
        },
        {
          id: '2',
          companyName: 'Summit Capital',
          cvrNumber: '87654321',
          submittedDate: '2024-01-08',
          status: 'pending',
          permitType: 'General contractor',
          permitDocuments: 2,
        },
        {
          id: '3',
          companyName: 'TechFlow Inc',
          cvrNumber: '11223344',
          submittedDate: '2024-01-05',
          status: 'approved',
          permitType: 'Plumbing licence',
          permitDocuments: 4,
        },
      ],
    };
  }

  async getSubscription(): Promise<{ subscription: any }> {
    await delay(200);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const company = mockStorage.getCompanies().find(c => c.id === userId);
    if (!company) {
      throw new Error('Company not found');
    }

    // Return mock subscription
    return {
      subscription: {
        id: 'sub_1',
        companyId: company.id,
        tier: 'Premium',
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        stripeCustomerId: 'cus_mock',
        stripeSubscriptionId: 'sub_mock',
      },
    };
  }

  // Stripe Payment - Mock Checkout Session
  async createCheckoutSession(billingCycle: 'monthly' | 'annual', tier?: 'Standard' | 'Premium' | 'Elite') {
    await delay(500);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // In mock mode, simulate a successful checkout by redirecting to success page
    // Generate a mock session ID
    const mockSessionId = `cs_mock_${Date.now()}`;

    // Return a URL that will redirect to the success page
    // The PlanReview component will handle this URL
    const successUrl = `/billing/success?session_id=${mockSessionId}`;

    // For mock mode, we'll simulate the Stripe redirect by returning a local URL
    // that the frontend can handle
    return {
      url: successUrl,
      sessionId: mockSessionId
    };
  }
  // 3 Quotes (Jobs) - Now supports guest submissions
  async createJobRequest(data: {
    title: string;
    description: string;
    category: string;
    postalCode: string;
    budget?: string;
    images?: string[];
    // Guest contact info (optional - for non-authenticated users)
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
  }) {
    await delay(600);
    const userId = getCurrentUserId();

    // Allow guest submissions - no authentication required
    const isGuestSubmission = !userId && data.guestName && data.guestEmail && data.guestPhone;

    if (!userId && !isGuestSubmission) {
      throw new Error('Please provide contact information or log in');
    }

    const jobRequest = {
      id: `job-${Date.now()}`,
      consumerId: userId || `guest-${Date.now()}`, // Guest ID if not logged in
      title: data.title,
      description: data.description,
      category: data.category,
      postalCode: data.postalCode,
      budget: data.budget,
      images: data.images || [],
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Guest contact info (only if guest submission)
      ...(isGuestSubmission && {
        isGuestRequest: true,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
      }),
    };

    mockStorage.jobRequests.push(jobRequest);

    // Simulate smart matching: find companies in same category OR all companies if no category match
    let matchingCompanies = mockStorage.getCompanies().filter(c =>
      c.category?.toLowerCase() === data.category.toLowerCase()
    );

    // If no category match, use any companies (fallback for demo)
    if (matchingCompanies.length === 0) {
      matchingCompanies = mockStorage.getCompanies();
    }

    const matchesToCreate = matchingCompanies.slice(0, 3); // Max 3 matches

    matchesToCreate.forEach(company => {
      mockStorage.leadMatches.push({
        id: `match-${Date.now()}-${company.id}`,
        jobRequestId: jobRequest.id,
        companyId: company.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    console.log(`✅ Job request created: ${jobRequest.title} (${isGuestSubmission ? 'Guest' : 'User'}) - Matched to ${matchesToCreate.length} craftsmen`);

    return {
      message: 'Job request created successfully',
      jobRequest,
      matchCount: matchesToCreate.length
    };
  }

  async getMyJobRequests() {
    await delay(300);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const requests = mockStorage.jobRequests.filter(r => r.consumerId === userId);

    // Add matches and quotes to each request
    const enrichedRequests = requests.map(originalReq => {
      const req = { ...originalReq };
      const matches = mockStorage.leadMatches.filter(m => m.jobRequestId === req.id);
      const enrichedMatches = matches.map(m => {
        const company = mockStorage.getCompanies().find(c => c.id === m.companyId);
        const quote = mockStorage.quotes.find(q => q.matchId === m.id);
        return { ...m, company, quote };
      });
      return { ...req, matches: enrichedMatches };
    });

    return { requests: enrichedRequests };
  }

  async getAdminJobRequests() {
    await delay(400);
    // Return all requests with full details
    const requests = mockStorage.jobRequests.map(originalReq => {
      const req = { ...originalReq };
      const consumer = mockStorage.users.get(req.consumerId);
      const matches = mockStorage.leadMatches.filter(m => m.jobRequestId === req.id);
      const enrichedMatches = matches.map(m => {
        const company = mockStorage.getCompanies().find(c => c.id === m.companyId);
        const quote = mockStorage.quotes.find(q => q.matchId === m.id);
        return { ...m, company, quote };
      });
      return {
        ...req,
        consumer,
        matches: enrichedMatches,
        matchCount: matches.length,
        quoteCount: enrichedMatches.filter(m => m.quote).length
      };
    });

    return {
      jobRequests: requests,
      pagination: {
        total: requests.length,
        page: 1,
        limit: 20,
        totalPages: 1
      }
    };
  }

  async getPartnerLeads() {
    await delay(300);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const matches = mockStorage.leadMatches.filter(m => m.companyId === userId);
    const leads = matches.map(m => {
      const jobRequest = mockStorage.jobRequests.find(r => r.id === m.jobRequestId) as any;
      const quote = mockStorage.quotes.find(q => q.matchId === m.id);

      // Get customer info - either from user (registered) or from guest info on job request
      let customer = null;
      if (jobRequest) {
        if (jobRequest.isGuestRequest) {
          // Guest customer - use info from job request
          customer = {
            name: jobRequest.guestName || 'Guest',
            email: jobRequest.guestEmail || '',
            phone: jobRequest.guestPhone || '',
            isGuest: true,
          };
        } else {
          // Registered customer - look up user
          const consumerUser = mockStorage.getUser(jobRequest.consumerId);
          customer = {
            name: consumerUser?.name || consumerUser?.firstName || 'Customer',
            email: consumerUser?.email || 'customer@example.com',
            phone: consumerUser?.phone || '+45 12 34 56 78', // Mock phone for demo
            isGuest: false,
          };
        }
      }

      // Return in format expected by PartnerLeadDashboard component
      return {
        id: m.id,
        status: m.status,
        createdAt: m.createdAt,
        job: jobRequest ? {
          id: jobRequest.id,
          title: jobRequest.title,
          description: jobRequest.description,
          category: jobRequest.category,
          postalCode: jobRequest.postalCode,
          images: jobRequest.images || [],
          createdAt: jobRequest.createdAt,
        } : {
          id: 'unknown',
          title: 'Unknown Job',
          description: 'Job details not available',
          category: 'Unknown',
          postalCode: '0000',
          images: [],
          createdAt: new Date().toISOString(),
        },
        customer, // Include customer contact info
        quotes: quote ? [quote] : [],
      };
    });

    return { leads };
  }

  async submitQuote(matchId: string, data: { price: number; message: string }) {
    await delay(500);
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const match = mockStorage.leadMatches.find(m => m.id === matchId);
    if (!match) {
      throw new Error('Lead match not found');
    }

    const quote = {
      id: `quote-${Date.now()}`,
      matchId,
      price: data.price,
      message: data.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStorage.quotes.push(quote);
    match.status = 'quoted';

    return { message: 'Quote submitted successfully', quote };
  }
}

export const mockApi = new MockApiService();







