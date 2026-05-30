import { AuthResponse, NewsItem, ProfileUpdateResponse, ExplainResponse } from '../types';

const API_BASE_AUTH = 'https://auth-app-877042335787.us-central1.run.app/api';
const API_BASE_NEWS = 'https://stream-app-877042335787.us-central1.run.app';
const API_BASE_CRYPTO = 'https://crypto-pulse-1-546660857332.us-central1.run.app';

// Auth APIs
export const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_AUTH}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUserProfile = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_AUTH}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
};

export const updateUserProfile = async (token: string, coins: string[]): Promise<ProfileUpdateResponse> => {
  try {
    const response = await fetch(`${API_BASE_AUTH}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ coins }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

// News APIs
export const fetchHistoricalNews = async (
  startDate: string,
  endDate: string,
  currencyCodes: string[]
): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`${API_BASE_NEWS}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        currency_codes: currencyCodes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch news');
    }

    return await response.json();
  } catch (error) {
    console.error('News fetch error:', error);
    throw error;
  }
};

// WebSocket Connection
export const connectToLiveStream = (
  startTime: string,
  endTime: string,
  tokens: string[],
  onMessage: (data: any) => void,
  onError: (error: Event) => void
): WebSocket => {
  const wsUrl = `ws://${API_BASE_CRYPTO.replace('https://', '')}/ws?start_time=${startTime}&end_time=${endTime}&tokens=${JSON.stringify(
    tokens
  )}`;
  
  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('WebSocket message parse error:', error);
    }
  };
  
  ws.onerror = onError;
  
  return ws;
};

// Explain API
export const fetchExplanation = async (
  coinId: string,
  startTime: string,
  endTime: string
): Promise<ExplainResponse> => {
  try {
    const response = await fetch(`${API_BASE_CRYPTO}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coin_id: coinId,
        start_time: startTime,
        end_time: endTime,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch explanation');
    }

    return await response.json();
  } catch (error) {
    console.error('Explanation fetch error:', error);
    throw error;
  }
};