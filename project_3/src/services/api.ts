import toast from 'react-hot-toast';

// Base URLs
const AUTH_API_URL = 'https://auth-app-877042335787.us-central1.run.app';
const STREAM_API_URL = 'https://stream-app-877042335787.us-central1.run.app';
const CRYPTO_API_URL = 'https://crypto-pulse-1-546660857332.us-central1.run.app';

// Helper to get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('authToken') || '';
};

// Helper to handle fetch errors consistently
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Error: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

// Fetch with auth headers
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    console.log('[fetchWithAuth] Request →', options.method ?? 'GET', url, options);
    const response = await fetch(url, {
      ...options,
      headers,
    });
    console.log('[fetchWithAuth] Response status →', response.status);
    return await handleResponse(response);
  } catch (error) {
    console.error('API error:', error);
    toast.error('An error occurred. Please try again.');
    throw error;
  }
};

// Endpoints for user profile
export const userApi = {
  getProfile: async () => {
    return fetchWithAuth(`${AUTH_API_URL}/api/users/profile`);
  },
  
  updateProfile: async (data: { coins: string[] }) => {
    return fetchWithAuth(`${AUTH_API_URL}/api/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Endpoints for news
export const newsApi = {
  getHistorical: async (startDate: string, endDate: string, currencyCodes: string[]) => {
    console.log('[newsApi] getHistorical →', { startDate, endDate, currencyCodes });
    const data = await fetchWithAuth(`${STREAM_API_URL}/news`, {
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        currency_codes: currencyCodes,
      }),
    });
    console.log('[newsApi] getHistorical ←', data);
    return data;
  },
};

// Endpoints for alerts
export const alertsApi = {
  getAlerts: async (userId: string) => {
    return fetchWithAuth(`${CRYPTO_API_URL}/alerts`, {
      headers: {
        'X-User-ID': userId,
      },
    });
  },
  
  createAlert: async (userId: string, data: { coinId: number; threshold: number; email: string }) => {
    return fetchWithAuth(`${CRYPTO_API_URL}/alerts`, {
      method: 'POST',
      headers: {
        'X-User-ID': userId,
      },
      body: JSON.stringify(data),
    });
  },
  
  updateAlert: async (userId: string, alertId: string, data: { coinId: number; threshold: number }) => {
    return fetchWithAuth(`${CRYPTO_API_URL}/alerts/${alertId}`, {
      method: 'PUT',
      headers: {
        'X-User-ID': userId,
      },
      body: JSON.stringify(data),
    });
  },
  
  deleteAlert: async (userId: string, alertId: string) => {
    return fetch(`${CRYPTO_API_URL}/alerts/${alertId}`, {
      method: 'DELETE',
      headers: {
        'X-User-ID': userId,
      },
    });
  },
};

// Endpoint for sentiment explanation
export const sentimentApi = {
  explain: async (data: { coin_id: number; start_time: string; end_time: string }) => {
    return fetchWithAuth(`${CRYPTO_API_URL}/explain`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default {
  userApi,
  newsApi,
  alertsApi,
  sentimentApi,
};