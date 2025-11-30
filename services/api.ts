// Use empty string to disable API (offline mode)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// Enable mock API when no real API URL is provided
const USE_MOCK_API = !API_BASE_URL || import.meta.env.VITE_USE_MOCK_API === 'true';

import { mockApi } from './mockApi';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    // Use mock API if enabled
    if (USE_MOCK_API) {
      throw new Error('USE_MOCK_API');
    }

    // Check if API is available (for offline mode)
    if (!API_BASE_URL) {
      throw new Error('API_NOT_AVAILABLE');
    }

    // Quick check if API is reachable (only for localhost)
    if (API_BASE_URL.includes('localhost')) {
      const isAvailable = await this.checkApiAvailability();
      if (!isAvailable) {
        throw new Error('API_NOT_AVAILABLE');
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

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
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
    if (API_BASE_URL.includes('localhost')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
        
        const healthUrl = API_BASE_URL.replace('/api', '') + '/health';
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return response.ok;
      } catch {
        return false; // API not available
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.login(email, password);
      }
      throw error;
    }
  }

  async getMe() {
    try {
      return await this.request<{ user: any }>('/auth/me');
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.getMe();
      }
      throw error;
    }
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.getCompanies(params);
      }
      throw error;
    }
  }

  async getCompany(id: string) {
    try {
      return await this.request<{ company: any }>(`/companies/${id}`, { requiresAuth: false });
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.verifyCompany(id, isVerified);
      }
      throw error;
    }
  }

  // Saved Listings
  async getSavedListings() {
    try {
      return await this.request<{ savedListings: any[] }>('/saved-listings');
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.getSavedListings();
      }
      throw error;
    }
  }

  async saveListing(companyId: string) {
    try {
      return await this.request<{ savedListing: any }>('/saved-listings', {
        method: 'POST',
        body: { companyId },
      });
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.saveListing(companyId);
      }
      throw error;
    }
  }

  async unsaveListing(companyId: string) {
    try {
      return await this.request<{ message: string }>(`/saved-listings/${companyId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.updateInquiry(id, status);
      }
      throw error;
    }
  }

  // Categories
  async getCategories() {
    try {
      return await this.request<{ categories: any[] }>('/categories', { requiresAuth: false });
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.trackEvent(companyId, eventType, metadata);
      }
      throw error;
    }
  }

  async getCompanyAnalytics(companyId: string) {
    try {
      return await this.request<{ analytics: any }>(`/analytics/company/${companyId}`);
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.getCompanyAnalytics(companyId);
      }
      throw error;
    }
  }

  // Onboarding (Partner)
  async getOnboardingStatus() {
    try {
      return await this.request<{ step: number; hasCompany: boolean; company?: any }>('/onboarding/status');
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.getOnboardingStatus();
      }
      throw error;
    }
  }

  async saveOnboardingStep1(data: { name: string; category: string; location: string; contactEmail: string; website?: string; phone?: string }) {
    try {
      return await this.request<{ company: any; step: number }>('/onboarding/step-1', {
        method: 'POST',
        body: data,
      });
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.saveOnboardingStep3(data);
      }
      throw error;
    }
  }

  async completeOnboarding() {
    try {
      return await this.request<{ company: any; step: number; completed: boolean }>('/onboarding/step-4', {
        method: 'POST',
      });
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.getConsumerProfile();
      }
      throw error;
    }
  }

  async updateConsumerProfile(data: { firstName?: string; lastName?: string; name?: string; location?: string; avatarUrl?: string }) {
    try {
      return await this.request<{ user: any }>('/user/profile', {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
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
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.getBusinessDashboard();
      }
      throw error;
    }
  }

  async updateBusinessListing(data: any) {
    try {
      return await this.request<{ company: any }>('/business/listing', {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.updateBusinessListing(data);
      }
      throw error;
    }
  }

  async getBusinessAnalytics() {
    try {
      return await this.request<{ views: number; saves: number; inquiries: number }>('/business/analytics');
    } catch (error: any) {
      if (error.message === 'USE_MOCK_API' || error.message === 'API_NOT_AVAILABLE') {
        return mockApi.getBusinessAnalytics();
      }
      throw error;
    }
  }
}

export const api = new ApiService();
