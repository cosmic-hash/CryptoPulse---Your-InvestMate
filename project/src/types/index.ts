// Authentication Types
export interface User {
  name: string;
  email: string;
  picture: string;
  coins: string[];
  questions?: string[];
  created_at: string;
  last_login: string;
  uid: string;
}

export interface AuthResponse {
  message: string;
  success: boolean;
  token: string;
  user: User;
}

// News Types
export interface NewsItem {
  currency_code: string;
  id: number;
  newsdatetime: string;
  score: number;
  title: string;
  url: string;
}

// Sentiment Types
export interface SentimentData {
  coins: Record<string, number>;
  time: string;
}

export interface ChartPoint {
  time: string;
  value: number;
  coin: string;
}

// Explain Response
export interface ExplainResponse {
  explanation: string;
}

// Profile Update Response
export interface ProfileUpdateResponse {
  success: boolean;
  user: {
    coins: string[];
  };
}

export type TabType = 'historical' | 'live' | 'profile';