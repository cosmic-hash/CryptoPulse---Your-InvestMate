import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User as FirebaseUser, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { toast } from 'react-hot-toast';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBaSXZJrwjnmvqzHpEOBWsp7rKYpWPsEIA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crypto-pulse-76003.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crypto-pulse-76003",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crypto-pulse-76003.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "669896981995",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:669896981995:web:36f6c7cfc6860dd2b7adae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  token: string;
  coins: string[];
  questions: string[];
  created_at: string;
  last_login: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserCoins: (coins: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Process Firebase user and API response to create our AuthUser
  const processUser = async (firebaseUser: FirebaseUser): Promise<void> => {
    try {
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Call to backend auth API to get JWT and user data
      const response = await fetch(
        'https://auth-app-877042335787.us-central1.run.app/api/auth/google',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Set our user with additional data from API
      setCurrentUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: data.user.name || firebaseUser.displayName,
        photoURL: data.user.picture || firebaseUser.photoURL,
        token: data.token,
        coins: data.user.coins || [],
        questions: data.user.questions || [],
        created_at: data.user.created_at || new Date().toISOString(),
        last_login: data.user.last_login || new Date().toISOString(),
      });

      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
    } catch (error) {
      console.error('Error in processUser:', error);
      toast.error('Error processing authentication');
      await firebaseSignOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('authToken');
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await processUser(result.user);
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('authToken');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Update user coins (used in Profile page)
  const updateUserCoins = (coins: string[]) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        coins
      });
    }
  };

  // Check for existing auth on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await processUser(user);
        } catch (error) {
          console.error('Error processing existing user:', error);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('authToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
    updateUserCoins
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};