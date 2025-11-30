// Use empty string to disable API (offline mode)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
  async register(data: { email: string; password: string; name?: string; role?: string }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false,
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
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
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ companies: any[]; pagination: any }>(
      `/companies${query ? `?${query}` : ''}`,
      { requiresAuth: false }
    );
  }

  async getCompany(id: string) {
    return this.request<{ company: any }>(`/companies/${id}`, { requiresAuth: false });
  }

  async createCompany(data: any) {
    return this.request<{ company: any }>('/companies', {
      method: 'POST',
      body: data,
    });
  }

  async updateCompany(id: string, data: any) {
    return this.request<{ company: any }>(`/companies/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteCompany(id: string) {
    return this.request<{ message: string }>(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  async verifyCompany(id: string, isVerified: boolean) {
    return this.request<{ company: any }>(`/companies/${id}/verify`, {
      method: 'PATCH',
      body: { isVerified },
    });
  }

  // Saved Listings
  async getSavedListings() {
    return this.request<{ savedListings: any[] }>('/saved-listings');
  }

  async saveListing(companyId: string) {
    return this.request<{ savedListing: any }>('/saved-listings', {
      method: 'POST',
      body: { companyId },
    });
  }

  async unsaveListing(companyId: string) {
    return this.request<{ message: string }>(`/saved-listings/${companyId}`, {
      method: 'DELETE',
    });
  }

  // Inquiries
  async getInquiries(type?: string) {
    return this.request<{ inquiries: any[] }>(`/inquiries${type ? `?type=${type}` : ''}`);
  }

  async createInquiry(companyId: string, message: string) {
    return this.request<{ inquiry: any }>('/inquiries', {
      method: 'POST',
      body: { companyId, message },
    });
  }

  async updateInquiry(id: string, status: string) {
    return this.request<{ inquiry: any }>(`/inquiries/${id}`, {
      method: 'PATCH',
      body: { status },
    });
  }

  // Categories
  async getCategories() {
    return this.request<{ categories: any[] }>('/categories', { requiresAuth: false });
  }

  async createCategory(data: { name: string; description?: string }) {
    return this.request<{ category: any }>('/categories', {
      method: 'POST',
      body: data,
    });
  }

  async updateCategory(id: string, data: { name?: string; description?: string }) {
    return this.request<{ category: any }>(`/categories/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteCategory(id: string) {
    return this.request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Locations
  async getLocations() {
    return this.request<{ locations: any[] }>('/locations', { requiresAuth: false });
  }

  async createLocation(name: string) {
    return this.request<{ location: any }>('/locations', {
      method: 'POST',
      body: { name },
    });
  }

  async updateLocation(id: string, name: string) {
    return this.request<{ location: any }>(`/locations/${id}`, {
      method: 'PUT',
      body: { name },
    });
  }

  async deleteLocation(id: string) {
    return this.request<{ message: string }>(`/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async trackEvent(companyId: string, eventType: string, metadata?: any) {
    return this.request<{ message: string }>('/analytics/track', {
      method: 'POST',
      body: { companyId, eventType, metadata },
      requiresAuth: false,
    });
  }

  async getCompanyAnalytics(companyId: string) {
    return this.request<{ analytics: any }>(`/analytics/company/${companyId}`);
  }
}

export const api = new ApiService();
