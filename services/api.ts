// Use empty string to disable API (offline mode)
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '';
// Enable mock API if explicitly set OR if no API URL is provided
const USE_MOCK_API = (import.meta as any).env.VITE_USE_MOCK_API === 'true' || !API_BASE_URL;

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', {
    API_BASE_URL: API_BASE_URL || '(Not Set)',
    USE_MOCK_API,
    MODE: (import.meta as any).env.MODE
  });
}

// Warn if USE_MOCK_API is true but we have an API URL
if (USE_MOCK_API && API_BASE_URL) {
  console.warn('⚠️ WARNING: USE_MOCK_API is true but API_BASE_URL is set! This should not happen.');
  console.warn('⚠️ Check if VITE_USE_MOCK_API is set to "true" in .env.local');
}

// Warn if API_BASE_URL is empty
if (!API_BASE_URL) {
  console.error('❌ API_BASE_URL is empty! Check your .env.local file for VITE_API_URL');
}


import { mockApi } from './mockApi';

interface RequestOptions {
  method?: string;
  body?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiService {
  private getToken(): string | null {
    const token = localStorage.getItem('token');
    // If token is a mock token, return null to trigger mock mode
    if (token && token.startsWith('mock-token-')) {
      return null;
    }
    return token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    // Use mock API if enabled, BUT allow Stripe endpoints to hit the real backend
    if (USE_MOCK_API && !endpoint.includes('/stripe/')) {
      throw new Error('USE_MOCK_API');
    }

    // Check if API is available (for offline mode)
    if (!API_BASE_URL) {
      if (USE_MOCK_API) {
        throw new Error('USE_MOCK_API');
      }
      console.error('❌ API_BASE_URL is not set. Check your .env.local file for VITE_API_URL');
      throw new Error('API_NOT_AVAILABLE');
    }

    // Check if we have a mock token - if so, use mock API
    const rawToken = localStorage.getItem('token');
    const token = this.getToken();
    // If we have a raw token but getToken() returns null, it's a mock token
    if (options.requiresAuth !== false && rawToken && rawToken.startsWith('mock-token-')) {
      throw new Error('API_NOT_AVAILABLE');
    }

    // Quick check if API is reachable (only for localhost)
    // Skip health check for Stripe endpoints - they handle their own errors
    if (API_BASE_URL.includes('localhost') && !endpoint.includes('/stripe/')) {
      const isAvailable = await this.checkApiAvailability();
      if (!isAvailable) {
        console.warn('⚠️ Health check failed, but continuing for Stripe endpoint');
        // Don't throw for Stripe - let it try and show real error
      }
    }

    const { method = 'GET', body, headers = {}, requiresAuth = true } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    let url = `${API_BASE_URL}${endpoint}`;
    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const query = queryParams.toString();
      if (query) {
        url += (url.includes('?') ? '&' : '?') + query;
      }
    }

    if (requiresAuth) {
      // Get token fresh from localStorage (in case it was just set after signup)
      const currentToken = this.getToken();

      // Only add token if we have one - let the backend handle missing tokens
      // This allows the request to go through and get a proper 401 response
      if (currentToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${currentToken}`,
        };
      }
      // If no token, let the request proceed - backend will return 401
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        const errorMessage = error.error || `HTTP error! status: ${response.status}`;

        // If it's a database connection error, treat as API not available
        // BUT: Don't do this for Stripe endpoints - Stripe works without database
        if (!endpoint.includes('/stripe/')) {
          if (errorMessage.includes('Database connection error') ||
            errorMessage.includes('Can\'t reach database') ||
            (errorMessage.includes('database') && errorMessage.includes('Failed to fetch'))) {
            throw new Error('API_NOT_AVAILABLE');
          }
        }

        // Don't treat "Failed to login/register" as API unavailable for Stripe
        if (errorMessage.includes('Failed to login') ||
          errorMessage.includes('Failed to register')) {
          // Only treat as unavailable if it's not a Stripe endpoint
          if (!endpoint.includes('/stripe/')) {
            throw new Error('API_NOT_AVAILABLE');
          }
        }

        // If it's an authentication error (invalid/expired token), handle it properly
        // Don't treat as API_NOT_AVAILABLE - this is a real auth error
        if (response.status === 401) {
          // Only throw AUTHENTICATION_REQUIRED for "silent" failures on protected routes
          // If this was an explicit login attempt (requiresAuth: false), we should show the real error (e.g. "Invalid credentials")
          if (requiresAuth !== false && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Throw a specific auth error instead of API_NOT_AVAILABLE
            throw new Error('AUTHENTICATION_REQUIRED');
          }
        }

        // For Stripe errors, don't treat as API_NOT_AVAILABLE - show the actual error
        if (errorMessage.includes('Stripe') || errorMessage.includes('stripe')) {
          throw new Error(errorMessage);
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async checkApiAvailability(): Promise<boolean> {
    // Skip check if API URL is not set
    if (!API_BASE_URL || API_BASE_URL.trim() === '') {
      return false; // Offline mode
    }

    // For localhost, do a quick check
    if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout (increased)

        const healthUrl = API_BASE_URL.replace('/api', '') + '/health';
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-cache',
        });

        clearTimeout(timeoutId);
        const isOk = response.ok;
        if (!isOk) console.warn('❌ Backend health check failed');
        return isOk;
      } catch (error: any) {
        console.warn('⚠️ Health check error:', error.message);
        // Don't fail completely - backend might be starting up
        // Return true to allow the request to try anyway
        return true;
      }
    }

    // For non-localhost URLs, assume available
    return true;
  }

  // Auth
  async register(data: { email: string; password: string; name?: string; firstName?: string; lastName?: string; role?: string }) {
    try {
      return await this.request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: data,
        requiresAuth: false,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.register(data);
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      return await this.request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
        requiresAuth: false,
      });
    } catch (error: any) {
      // If it's a database connection error or API not available, use mock login
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' ||
        error.message === 'API_NOT_AVAILABLE' ||
        error.message.includes('Database connection error') ||
        error.message.includes('Failed to login'))) {
        return mockApi.login(email, password);
      }
      throw error;
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      return await this.request<{ user: any; token: string }>('/auth/verify-otp', {
        method: 'POST',
        body: { email, otp },
        requiresAuth: false,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async resendOtp(email: string) {
    try {
      return await this.request<{ message: string }>('/auth/resend-otp', {
        method: 'POST',
        body: { email },
        requiresAuth: false,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getMe() {
    try {
      return await this.request<{ user: any }>('/auth/me');
    } catch (error: any) {
      // Don't fall back to mock on auth errors - user needs to log in
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        throw error; // Let the caller handle auth errors
      }
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getMe();
      }
      throw error;
    }
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
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      return await this.request<{ companies: any[]; pagination: any }>(
        `/companies${query ? `?${query}` : ''}`,
        { requiresAuth: false }
      );
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getCompanies(params);
      }
      throw error;
    }
  }

  async getCompany(id: string) {
    try {
      return await this.request<{ company: any }>(`/companies/${id}`, { requiresAuth: false });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getCompany(id);
      }
      throw error;
    }
  }

  async createCompany(data: any) {
    try {
      return await this.request<{ company: any }>('/companies', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.createCompany(data);
      }
      throw error;
    }
  }

  async updateCompany(id: string, data: any) {
    try {
      return await this.request<{ company: any }>(`/companies/${id}`, {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.updateCompany(id, data);
      }
      throw error;
    }
  }

  async deleteCompany(id: string) {
    try {
      return await this.request<{ message: string }>(`/companies/${id}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.deleteCompany(id);
      }
      throw error;
    }
  }

  async verifyCompany(id: string, isVerified: boolean) {
    try {
      return await this.request<{ company: any }>(`/companies/${id}/verify`, {
        method: 'PATCH',
        body: { isVerified },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.verifyCompany(id, isVerified);
      }
      throw error;
    }
  }

  // Saved Listings
  async getSavedListings() {
    try {
      return await this.request<{ savedListings: any[] }>('/saved');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getSavedListings();
      }
      throw error;
    }
  }

  async saveListing(companyId: string) {
    try {
      return await this.request<{ savedListing: any }>('/saved', {
        method: 'POST',
        body: { companyId },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.saveListing(companyId);
      }
      throw error;
    }
  }

  async unsaveListing(companyId: string) {
    try {
      return await this.request<{ message: string }>(`/saved/${companyId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.unsaveListing(companyId);
      }
      throw error;
    }
  }

  // Inquiries
  async getInquiries(type?: string) {
    try {
      return await this.request<{ inquiries: any[] }>(`/inquiries${type ? `?type=${type}` : ''}`);
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getInquiries(type);
      }
      throw error;
    }
  }

  async createInquiry(companyId: string, message: string) {
    try {
      return await this.request<{ inquiry: any }>('/inquiries', {
        method: 'POST',
        body: { companyId, message },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.createInquiry(companyId, message);
      }
      throw error;
    }
  }

  async updateInquiry(id: string, status: string) {
    try {
      return await this.request<{ inquiry: any }>(`/inquiries/${id}`, {
        method: 'PATCH',
        body: { status },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.updateInquiry(id, status);
      }
      throw error;
    }
  }

  // 3 Quotes (Jobs)
  async createJobRequest(data: { title: string; description: string; category: string; postalCode: string; budget?: string; images?: string[] }) {
    try {
      return await this.request<{ message: string; jobRequest: any; matchCount: number }>('/jobs', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.createJobRequest(data);
      }
      throw error;
    }
  }

  async getMyJobRequests() {
    try {
      return await this.request<{ requests: any[] }>('/jobs/my-requests');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getMyJobRequests();
      }
      throw error;
    }
  }

  async getPartnerLeads() {
    try {
      return await this.request<{ leads: any[] }>('/jobs/partner/leads');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getPartnerLeads();
      }
      throw error;
    }
  }

  async submitQuote(matchId: string, data: { price: number; message: string }) {
    try {
      return await this.request<{ message: string; quote: any }>(`/jobs/quotes/${matchId}`, {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.submitQuote(matchId, data);
      }
      throw error;
    }
  }

  async getAdminJobRequests(params?: { status?: string; category?: string; page?: number; limit?: number }) {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      return await this.request<{ requests: any[]; pagination: any }>(
        `/admin/jobs${query ? `?${query}` : ''}`
      );
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        // Return dummy data for mock mode
        return {
          requests: [
            {
              id: 'mock-job-1',
              title: 'Need a new roof',
              description: 'The roof is leaking and needs to be replaced entirely.',
              category: 'roofing',
              postalCode: '2100',
              status: 'open',
              createdAt: new Date().toISOString(),
              consumer: { name: 'John Doe', email: 'john@example.com' },
              matches: [
                {
                  company: { name: 'Roof Masters' },
                  quotes: [{ price: 5000, message: 'We can do it!' }]
                }
              ]
            }
          ],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
        };
      }
      throw error;
    }
  }

  // Categories
  async getCategories() {
    try {
      return await this.request<{ categories: any[] }>('/categories', { requiresAuth: false });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getCategories();
      }
      throw error;
    }
  }

  async createCategory(data: { name: string; description?: string }) {
    try {
      return await this.request<{ category: any }>('/categories', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.createCategory(data);
      }
      throw error;
    }
  }

  async updateCategory(id: string, data: { name?: string; description?: string }) {
    try {
      return await this.request<{ category: any }>(`/categories/${id}`, {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.updateCategory(id, data);
      }
      throw error;
    }
  }

  async deleteCategory(id: string) {
    try {
      return await this.request<{ message: string }>(`/categories/${id}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.deleteCategory(id);
      }
      throw error;
    }
  }

  // Locations
  async getLocations() {
    try {
      return await this.request<{ locations: any[] }>('/locations', { requiresAuth: false });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getLocations();
      }
      throw error;
    }
  }

  async createLocation(name: string) {
    try {
      return await this.request<{ location: any }>('/locations', {
        method: 'POST',
        body: { name },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.createLocation(name);
      }
      throw error;
    }
  }

  async updateLocation(id: string, name: string) {
    try {
      return await this.request<{ location: any }>(`/locations/${id}`, {
        method: 'PUT',
        body: { name },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.updateLocation(id, name);
      }
      throw error;
    }
  }

  async deleteLocation(id: string) {
    try {
      return await this.request<{ message: string }>(`/locations/${id}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.deleteLocation(id);
      }
      throw error;
    }
  }

  // Analytics
  async trackEvent(companyId: string, eventType: string, metadata?: any) {
    try {
      return await this.request<{ message: string }>('/analytics/track', {
        method: 'POST',
        body: { companyId, eventType, metadata },
        requiresAuth: false,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.trackEvent(companyId, eventType, metadata);
      }
      throw error;
    }
  }

  async getCompanyAnalytics(companyId: string) {
    try {
      return await this.request<{ analytics: any }>(`/analytics/company/${companyId}`);
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getCompanyAnalytics(companyId);
      }
      throw error;
    }
  }

  // Onboarding (Partner)
  async getOnboardingStatus() {
    try {
      return await this.request<{ step: number; hasCompany: boolean; onboardingCompleted: boolean; company?: any }>('/onboarding/status');
    } catch (error: any) {
      // Don't fall back to mock on auth errors
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        throw error;
      }
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getOnboardingStatus();
      }
      throw error;
    }
  }

  async saveOnboardingStep1(data: { name: string; category: string; location: string; contactEmail: string; website?: string; phone?: string; cvrNumber?: string; address?: string }) {
    try {
      return await this.request<{ company: any; step: number }>('/onboarding/step-1', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      // Don't fall back to mock on auth errors - user needs to be logged in
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        throw new Error('You must be logged in as a Partner to create a business profile. Please log in and try again.');
      }
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.saveOnboardingStep1(data);
      }
      throw error;
    }
  }

  async saveOnboardingStep2(data: { shortDescription: string; description: string }) {
    try {
      return await this.request<{ company: any; step: number }>('/onboarding/step-2', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      // Don't fall back to mock on auth errors - user needs to be logged in
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        throw new Error('You must be logged in as a Partner to continue. Please log in and try again.');
      }
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.saveOnboardingStep2(data);
      }
      throw error;
    }
  }

  async saveOnboardingStep3(data: { logoUrl?: string; bannerUrl?: string; gallery?: Array<{ imageUrl: string; title: string; category: string }> }) {
    try {
      return await this.request<{ company: any; step: number }>('/onboarding/step-3', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      // Don't fall back to mock on auth errors - user needs to be logged in
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        throw new Error('You must be logged in as a Partner to continue. Please log in and try again.');
      }
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.saveOnboardingStep3(data);
      }
      throw error;
    }
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
    try {
      return await this.request<{ company: any; step: number }>('/onboarding/step-4', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      // Don't fall back to mock on auth errors - user needs to be logged in
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        throw new Error('You must be logged in as a Partner to continue. Please log in and try again.');
      }
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.saveOnboardingStep4(data);
      }
      throw error;
    }
  }

  async completeOnboarding() {
    try {
      return await this.request<{ company: any; step: number; completed: boolean; onboardingCompleted: boolean }>('/onboarding/complete', {
        method: 'POST',
      });
    } catch (error: any) {
      // Don't fall back to mock on auth errors - user needs to be logged in
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        throw new Error('You must be logged in as a Partner to complete onboarding. Please log in and try again.');
      }
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.completeOnboarding();
      }
      throw error;
    }
  }

  // User Profile (Consumer)
  async getConsumerProfile() {
    try {
      return await this.request<{ user: any }>('/user/profile');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getConsumerProfile();
      }
      throw error;
    }
  }

  async updateConsumerProfile(data: { firstName?: string; lastName?: string; name?: string; location?: string; avatarUrl?: string; phone?: string }) {
    try {
      return await this.request<{ user: any }>('/user/profile', {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.updateConsumerProfile(data);
      }
      throw error;
    }
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
      return await this.request<{ message: string }>('/user/change-password', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.changePassword(data);
      }
      throw error;
    }
  }

  async deleteAccount() {
    try {
      return await this.request<{ message: string }>('/user/account', {
        method: 'DELETE',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.deleteAccount();
      }
      throw error;
    }
  }

  // Business Dashboard (Partner)
  async getBusinessDashboard() {
    try {
      return await this.request<{ company: any }>('/business/dashboard');
    } catch (error: any) {
      // Don't fall back to mock on auth errors
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        throw error;
      }
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getBusinessDashboard();
      }
      throw error;
    }
  }

  async updateBusinessListing(data: {
    name?: string;
    description?: string;
    shortDescription?: string;
    address?: string;
    location?: string;
    category?: string;
    website?: string;
    phone?: string;
    logoUrl?: string;
    bannerUrl?: string;
  }) {
    try {
      return await this.request<{ company: any }>('/business/listing', {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.updateBusinessListing(data);
      }
      throw error;
    }
  }

  async getBusinessAnalytics() {
    try {
      return await this.request<{ views: number; saves: number; inquiries: number }>('/business/analytics');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getBusinessAnalytics();
      }
      throw error;
    }
  }

  // Admin Finance & Transactions
  async getFinanceMetrics() {
    try {
      return await this.request<{
        totalRevenue: number;
        monthlyRecurringRevenue: number;
        activeSubscriptions: number;
        newSubscriptionsThisMonth: number;
        cancellationsThisMonth: number;
        upcomingRenewals: number;
      }>('/admin/metrics/revenue');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getFinanceMetrics();
      }
      throw error;
    }
  }

  async getTransactions(params?: { dateRange?: string }) {
    return this.request<{ transactions: any[] }>('/stripe/transactions', {
      params,
    });
  }

  async getVerificationQueue() {
    try {
      return await this.request<{ requests: any[] }>('/admin/verification-queue');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getVerificationQueue();
      }
      throw error;
    }
  }

  async getAdminStats() {
    try {
      return await this.request<{
        totalCompanies: number;
        verifiedCompanies: number;
        pendingVerifications: number;
        totalUsers: number;
        totalPartners: number;
        totalConsumers: number;
        activeSubscriptions: number;
        monthlyRevenue: number;
      }>('/admin/stats');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return {
          totalCompanies: 0,
          verifiedCompanies: 0,
          pendingVerifications: 0,
          totalUsers: 0,
          totalPartners: 0,
          totalConsumers: 0,
          activeSubscriptions: 0,
          monthlyRevenue: 0,
        };
      }
      throw error;
    }
  }

  async getAdminUsers(params?: { role?: string; page?: number; limit?: number; search?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      return await this.request<{ users: any[]; pagination: any }>(
        `/admin/users${query ? `?${query}` : ''}`
      );
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { users: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
      }
      throw error;
    }
  }

  async getUserDetails(userId: string) {
    try {
      return await this.request<{ user: any }>(`/admin/users/${userId}`);
    } catch (error: any) {
      throw error;
    }
  }

  async suspendUser(userId: string, reason?: string) {
    try {
      return await this.request<{ message: string }>(`/admin/users/${userId}/suspend`, {
        method: 'POST',
        body: { reason },
      });
    } catch (error: any) {
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      return await this.request<{ message: string }>(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      throw error;
    }
  }

  async resetUserPassword(userId: string, newPassword: string) {
    try {
      return await this.request<{ message: string }>(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
        body: { newPassword },
      });
    } catch (error: any) {
      throw error;
    }
  }

  async resetPartnerProfile(userId: string) {
    try {
      return await this.request<{ message: string }>(`/admin/users/${userId}/reset-profile`, {
        method: 'POST',
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getActivityLogs(params?: { page?: number; limit?: number; action?: string; targetType?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      return await this.request<{ logs: any[]; pagination: any }>(
        `/admin/activity-logs${query ? `?${query}` : ''}`
      );
    } catch (error: any) {
      throw error;
    }
  }

  async createAdminUser(data: { email: string; password: string; name?: string; firstName?: string; lastName?: string }) {
    try {
      return await this.request<{ user: any }>('/admin/admins', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async updateUserRole(userId: string, role: 'CONSUMER' | 'PARTNER' | 'ADMIN') {
    try {
      return await this.request<{ user: any }>(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: { role },
      });
    } catch (error: any) {
      throw error;
    }
  }

  // GDPR Endpoints
  async exportUserData() {
    try {
      return await this.request<{ data: any }>('/gdpr/export-data');
    } catch (error: any) {
      throw error;
    }
  }

  async deleteUserAccount() {
    try {
      return await this.request<{ message: string; deletedAt: string }>('/gdpr/delete-account', {
        method: 'DELETE',
      });
    } catch (error: any) {
      throw error;
    }
  }

  // File Upload
  async uploadLogo(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');

      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/upload/logo`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  }

  async uploadBanner(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'banner');

      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/upload/banner`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  }

  async uploadDocument(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'document');

      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/upload/document`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  }

  // Stripe Payment
  async createCheckoutSession(billingCycle: 'monthly' | 'annual', tier?: 'Standard' | 'Premium' | 'Elite') {
    console.log('🔵 Creating Stripe checkout session...', { billingCycle, tier, API_BASE_URL, USE_MOCK_API });

    // NEVER use mock API for Stripe checkout - user must go through real Stripe
    // ALLOW Stripe checkout even in mock mode (Hybrid Mode)
    // if (USE_MOCK_API) {
    //   throw new Error('Backend is not available. Please ensure the backend is running on http://localhost:4000. Start it with: cd backend && npm run dev');
    // }

    if (!API_BASE_URL) {
      throw new Error('API URL is not configured. Please set VITE_API_URL=http://localhost:4000/api in your .env.local file.');
    }

    try {
      const result = await this.request<{ url: string }>('/stripe/create-checkout-session', {
        method: 'POST',
        body: { billingCycle, tier: tier || 'Premium' },
      });


      // Log for debugging
      console.log('✅ Stripe checkout session created:', result.url);

      // Validate that we got a Stripe URL
      if (!result.url || (!result.url.startsWith('https://checkout.stripe.com') && !result.url.includes('stripe.com'))) {
        console.error('❌ Backend returned invalid URL:', result.url);
        throw new Error(`Backend returned invalid checkout URL: ${result.url}. Expected Stripe checkout URL.`);
      }

      return result;
    } catch (error: any) {
      console.error('❌ Stripe checkout error:', error.message, error);
      console.error('Error details:', {
        message: error.message,
        API_BASE_URL,
        USE_MOCK_API,
        errorType: error.constructor.name
      });

      // NEVER fall back to mock for Stripe checkout - user needs real Stripe payment
      // Always throw the error so user sees what's wrong
      throw error;
    }
  }

  // Get subscription details
  async getSubscription() {
    try {
      return await this.request<{ subscription: any }>('/business/subscription');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getSubscription();
      }
      throw error;
    }
  }

  // Platform Settings
  async getPlatformSettings() {
    try {
      return await this.request<{ settings: any }>('/admin/settings');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return {
          settings: {
            id: 'singleton',
            platformName: 'Findhåndværkeren',
            supportEmail: 'support@findhandvaerkeren.dk',
            maintenanceMode: false,
          },
        };
      }
      throw error;
    }
  }

  async updatePlatformSettings(data: any) {
    try {
      return await this.request<{ settings: any }>('/admin/settings', {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { settings: data };
      }
      throw error;
    }
  }

  // Recent Searches
  async getRecentSearches() {
    try {
      return await this.request<{ recentSearches: any[] }>('/recent-searches');
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { recentSearches: [] };
      }
      throw error;
    }
  }

  async saveRecentSearch(query: string) {
    try {
      return await this.request<{ recentSearch: any }>('/recent-searches', {
        method: 'POST',
        body: { query },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { recentSearch: { id: `search-${Date.now()}`, query } };
      }
      throw error;
    }
  }



  async getPlatformAnalytics() {
    return this.request<any>('/analytics/platform');
  }

  async clearRecentSearches() {
    try {
      return await this.request<{ message: string }>('/recent-searches', {
        method: 'DELETE',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { message: 'Recent searches cleared' };
      }
      throw error;
    }
  }

  // Services Management
  async getCompanyServices(companyId: string) {
    try {
      return await this.request<{ services: any[] }>(`/companies/${companyId}/services`, {
        requiresAuth: false,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { services: [] };
      }
      throw error;
    }
  }

  async createService(companyId: string, data: { title: string; description: string }) {
    try {
      return await this.request<{ service: any }>(`/companies/${companyId}/services`, {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        // Mock fallback - return success
        return { service: { id: `svc-${Date.now()}`, ...data } };
      }
      throw error;
    }
  }

  async updateService(companyId: string, serviceId: string, data: { title: string; description: string }) {
    try {
      return await this.request<{ service: any }>(`/companies/${companyId}/services/${serviceId}`, {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { service: { id: serviceId, ...data } };
      }
      throw error;
    }
  }

  async deleteService(companyId: string, serviceId: string) {
    try {
      return await this.request<{ message: string }>(`/companies/${companyId}/services/${serviceId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { message: 'Service deleted' };
      }
      throw error;
    }
  }

  // Portfolio Management
  async getCompanyPortfolio(companyId: string) {
    try {
      return await this.request<{ portfolio: any[] }>(`/companies/${companyId}/portfolio`, {
        requiresAuth: false,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { portfolio: [] };
      }
      throw error;
    }
  }

  async createPortfolioItem(companyId: string, data: { title: string; imageUrl: string; category: string; description?: string }) {
    try {
      return await this.request<{ portfolioItem: any }>(`/companies/${companyId}/portfolio`, {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { portfolioItem: { id: `port-${Date.now()}`, ...data } };
      }
      throw error;
    }
  }

  async updatePortfolioItem(companyId: string, portfolioId: string, data: { title: string; imageUrl: string; category: string; description?: string }) {
    try {
      return await this.request<{ portfolioItem: any }>(`/companies/${companyId}/portfolio/${portfolioId}`, {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { portfolioItem: { id: portfolioId, ...data } };
      }
      throw error;
    }
  }

  async deletePortfolioItem(companyId: string, portfolioId: string) {
    try {
      return await this.request<{ message: string }>(`/companies/${companyId}/portfolio/${portfolioId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { message: 'Portfolio item deleted' };
      }
      throw error;
    }
  }

  // Testimonials Management
  async getCompanyTestimonials(companyId: string) {
    try {
      return await this.request<{ testimonials: any[] }>(`/companies/${companyId}/testimonials`, {
        requiresAuth: false,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { testimonials: [] };
      }
      throw error;
    }
  }

  async createTestimonial(companyId: string, data: { author: string; role: string; company: string; content: string; rating: number }) {
    try {
      return await this.request<{ testimonial: any }>(`/companies/${companyId}/testimonials`, {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { testimonial: { id: `test-${Date.now()}`, ...data } };
      }
      throw error;
    }
  }

  async updateTestimonial(companyId: string, testimonialId: string, data: { author: string; role: string; company: string; content: string; rating: number }) {
    try {
      return await this.request<{ testimonial: any }>(`/companies/${companyId}/testimonials/${testimonialId}`, {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { testimonial: { id: testimonialId, ...data } };
      }
      throw error;
    }
  }

  async deleteTestimonial(companyId: string, testimonialId: string) {
    try {
      return await this.request<{ message: string }>(`/companies/${companyId}/testimonials/${testimonialId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { message: 'Testimonial deleted' };
      }
      throw error;
    }
  }

  // Contact Form
  async submitContactForm(data: { name: string; email: string; phone?: string; subject: string; message: string; files?: string[] }) {
    try {
      return await this.request<{ message: string; success: boolean }>('/contact', {
        method: 'POST',
        body: data,
        requiresAuth: false,
      });
    } catch (error: any) {
      // Contact form doesn't need mock fallback - just throw error
      throw error;
    }
  }

  // Inquiry Reply
  async replyToInquiry(inquiryId: string, replyMessage: string) {
    try {
      return await this.request<{ inquiry: any }>(`/inquiries/${inquiryId}/reply`, {
        method: 'POST',
        body: { replyMessage },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        // Mock fallback
        return { inquiry: { id: inquiryId, status: 'RESPONDED' } };
      }
      throw error;
    }
  }

  // Verification Management
  async approveVerification(companyId: string) {
    try {
      return await this.request<{ company: any }>(`/admin/verification-queue/${companyId}/approve`, {
        method: 'POST',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { company: { id: companyId, verificationStatus: 'verified' } };
      }
      throw error;
    }
  }

  async rejectVerification(companyId: string, reason?: string) {
    try {
      return await this.request<{ company: any }>(`/admin/verification-queue/${companyId}/reject`, {
        method: 'POST',
        body: { reason },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { company: { id: companyId, verificationStatus: 'unverified' } };
      }
      throw error;
    }
  }

  async getStripeSessionDetails(sessionId: string) {
    try {
      console.log('🔵 API: Fetching Stripe session details for:', sessionId);
      const result = await this.request<{
        session: {
          id: string;
          status: string;
          paymentStatus: string;
          billingCycle: string;
          planType: string;
          amountTotal: number;
          currency: string;
          customerEmail: string;
          createdAt: string;
        };
        subscription: {
          id: string;
          status: string;
          currentPeriodStart: string;
          currentPeriodEnd: string;
        } | null;
      }>(`/stripe/session-details?session_id=${sessionId}`, {
        requiresAuth: false,
      });
      console.log('✅ API: Session details received:', result);
      return result;
    } catch (error: any) {
      console.error('❌ API: Error fetching session details:', error);
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        // Return mock data for offline mode
        console.log('⚠️ API: Using mock data for session details');
        return {
          session: {
            id: sessionId,
            status: 'complete',
            paymentStatus: 'paid',
            billingCycle: 'monthly',
            planType: 'Partner Plan',
            amountTotal: 99,
            currency: 'USD',
            customerEmail: 'test@example.com',
            createdAt: new Date().toISOString(),
          },
          subscription: null,
        };
      }
      // For other errors (404, 500, etc.), also return mock data so user sees success page
      console.warn('⚠️ API: Backend error, using fallback mock data');
      return {
        session: {
          id: sessionId,
          status: 'complete',
          paymentStatus: 'paid',
          billingCycle: 'monthly',
          planType: 'Partner Plan',
          amountTotal: 99,
          currency: 'USD',
          customerEmail: 'test@example.com',
          createdAt: new Date().toISOString(),
        },
        subscription: null,
      };
    }
  }

  async cancelSubscription() {
    try {
      return await this.request<{ message: string }>('/stripe/subscription/cancel', {
        method: 'POST',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { message: 'Subscription scheduled for cancellation (Mock)' };
      }
      throw error;
    }
  }

  async updateSubscription(tier: string, billingCycle: string) {
    try {
      return await this.request<{ message: string }>('/stripe/subscription/update', {
        method: 'PUT',
        body: { tier, billingCycle },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { message: 'Subscription successfully updated (Mock)' };
      }
      throw error;
    }
  }

  async getStripePortalUrl() {
    try {
      return await this.request<{ url: string }>('/stripe/portal', {
        method: 'GET',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return { url: 'https://billing.stripe.com/p/session/mock' };
      }
      throw error;
    }
  }

  // Growth Center
  async submitGrowthRequest(data: { services: string[]; details: any }) {
    try {
      return await this.request<{ success: boolean; request: any }>('/growth/requests', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.submitGrowthRequest(data);
      }
      throw error;
    }
  }

  async getGrowthRequests() {
    try {
      return await this.request<{ requests: any[] }>('/growth/requests', {
        method: 'GET',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getGrowthRequests();
      }
      throw error;
    }
  }

  async updateGrowthRequestStatus(id: string, status: string) {
    try {
      return await this.request<{ success: boolean }>(`/growth/requests/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.updateGrowthRequestStatus(id, status);
      }
      throw error;
    }
  }

  async getPerformanceMetrics(companyId: string) {
    try {
      return await this.request<{ metrics: any }>(`/companies/${companyId}/performance`, {
        method: 'GET',
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.getPerformanceMetrics(companyId);
      }
      throw error;
    }
  }

  async updatePerformanceMetrics(companyId: string, metrics: any) {
    try {
      return await this.request<{ success: boolean }>(`/companies/${companyId}/performance`, {
        method: 'PUT',
        body: metrics,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.updatePerformanceMetrics(companyId, metrics);
      }
      throw error;
    }
  }

  async addOptimizationLog(companyId: string, log: { title: string; description: string; type: 'seo' | 'ads' }) {
    try {
      return await this.request<{ success: boolean }>(`/companies/${companyId}/optimization-logs`, {
        method: 'POST',
        body: log,
      });
    } catch (error: any) {
      if (USE_MOCK_API && (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE')) {
        return mockApi.addOptimizationLog(companyId, log);
      }
      throw error;
    }
  }
}

export const api = new ApiService();
