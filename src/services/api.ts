import {
  User,
  Crop,
  Order,
  MarketPrice,
  ApprovedKnowledge,
  Notification,
  MarketplaceStats,
} from '../types';

const BASE_URL = '/api';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('agroconnect_token');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = 'An unexpected error occurred';
    try {
      const errorData = await res.json();
      errMessage = errorData.error || errorData.message || errMessage;
    } catch {
      errMessage = res.statusText || errMessage;
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // Auth
  async login(email: string, role?: string) {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    farmName?: string;
  }) {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return fetchWithAuth('/auth/me');
  },

  // Crops
  async getCrops(params?: Record<string, string | number | undefined>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchWithAuth(`/crops${query}`);
  },

  async getCropById(id: string): Promise<{ crop: Crop; farmer: User; reviews: any[] }> {
    return fetchWithAuth(`/crops/${id}`);
  },

  async createCrop(data: Partial<Crop>) {
    return fetchWithAuth('/crops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCrop(id: string, updates: Partial<Crop>) {
    return fetchWithAuth(`/crops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteCrop(id: string) {
    return fetchWithAuth(`/crops/${id}`, {
      method: 'DELETE',
    });
  },

  async updateCropStatus(id: string, status: 'available' | 'sold' | 'hidden') {
    return fetchWithAuth(`/crops/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Farmer Details
  async getFarmerProfile(id: string) {
    return fetchWithAuth(`/users/farmers/${id}`);
  },

  // Orders
  async getOrders(params?: { buyerId?: string; farmerId?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.buyerId) searchParams.append('buyerId', params.buyerId);
    if (params?.farmerId) searchParams.append('farmerId', params.farmerId);
    if (params?.status) searchParams.append('status', params.status);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchWithAuth(`/orders${query}`);
  },

  async getOrderById(id: string) {
    return fetchWithAuth(`/orders/${id}`);
  },

  async placeOrder(data: {
    buyer_id: string;
    crop_id: string;
    quantity: number;
    delivery_address: string;
    buyer_phone: string;
    payment_method?: string;
  }) {
    return fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrderStatus(id: string, status: string, note?: string) {
    return fetchWithAuth(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  async submitReview(orderId: string, rating: number, comment: string) {
    return fetchWithAuth(`/orders/${orderId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  // Prices & Marketplace Stats
  async getMarketPrices(): Promise<{ prices: MarketPrice[]; disclaimer: string; live_weather?: any; last_synced?: string; api_source?: string }> {
    return fetchWithAuth('/prices');
  },

  async getLivePrices(): Promise<{ prices: MarketPrice[]; live_weather: any; last_synced: string; api_source: string }> {
    return fetchWithAuth('/prices/live');
  },

  async getAgriWeather(): Promise<{ weather: Record<string, any>; api_source: string; last_updated: string }> {
    return fetchWithAuth('/realtime/weather');
  },

  async getMarketStats(): Promise<{ stats: MarketplaceStats }> {
    return fetchWithAuth('/marketplace/stats');
  },

  // AI Assistant
  async askAssistant(message: string, farmerId?: string, contextCrop?: string, language?: string) {
    return fetchWithAuth('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, farmerId, contextCrop, language }),
    });
  },

  async getCropDemand(cropName: string) {
    return fetchWithAuth(`/assistant/market-demand/${cropName}`);
  },

  async getPopularCrops() {
    return fetchWithAuth('/assistant/popular-crops');
  },

  async getFarmerSummary(farmerId: string) {
    return fetchWithAuth(`/assistant/farmer-summary/${farmerId}`);
  },

  // Real-Time India Weather & State Mandi Prices
  async searchIndiaLocations(q: string): Promise<{ results: any[] }> {
    return fetchWithAuth(`/realtime/india-weather/search?q=${encodeURIComponent(q)}`);
  },

  async getPlaceWeather(lat: number, lon: number, name: string, state?: string): Promise<{ weather: any }> {
    return fetchWithAuth(`/realtime/india-weather/place?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}&state=${encodeURIComponent(state || 'India')}`);
  },

  async getStatePrices(state?: string, category?: string): Promise<{
    total: number;
    states_available: string[];
    prices: any[];
    api_source: string;
    last_synced: string;
  }> {
    const searchParams = new URLSearchParams();
    if (state && state !== 'All') searchParams.append('state', state);
    if (category && category !== 'All') searchParams.append('category', category);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchWithAuth(`/realtime/state-prices${query}`);
  },

  // AI Disease Detection & Precision Agronomy Crop Suggester
  async detectDisease(crop: string, symptoms: string, imageBase64?: string, language?: string): Promise<any> {
    return fetchWithAuth('/assistant/disease-detect', {
      method: 'POST',
      body: JSON.stringify({ crop, symptoms, imageBase64, language }),
    });
  },

  async recommendCrops(data: {
    location: string;
    soilType: string;
    waterAvailability: string;
    lat?: number;
    lon?: number;
    language?: string;
  }): Promise<any> {
    return fetchWithAuth('/assistant/crop-recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin
  async getAdminUsers() {
    return fetchWithAuth('/admin/users');
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended') {
    return fetchWithAuth(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getAdminAnalytics() {
    return fetchWithAuth('/admin/analytics');
  },

  async getApprovedKnowledge(): Promise<{ knowledge: ApprovedKnowledge[] }> {
    return fetchWithAuth('/admin/knowledge');
  },

  async createApprovedKnowledge(data: Partial<ApprovedKnowledge>) {
    return fetchWithAuth('/admin/knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteApprovedKnowledge(id: string) {
    return fetchWithAuth(`/admin/knowledge/${id}`, {
      method: 'DELETE',
    });
  },

  async resetDatabase() {
    return fetchWithAuth('/admin/reset-data', {
      method: 'POST',
    });
  },

  // Notifications
  async getNotifications(userId: string): Promise<{ notifications: Notification[] }> {
    return fetchWithAuth(`/notifications?userId=${userId}`);
  },

  async markNotificationRead(id: string) {
    return fetchWithAuth(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};
