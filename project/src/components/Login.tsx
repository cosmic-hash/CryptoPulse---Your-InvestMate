import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { loginWithGoogle } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Trigger Google sign-in popup
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the ID token
      const idToken = await result.user.getIdToken();
      
      // Call our backend with the ID token
      const response = await loginWithGoogle(idToken);
      
      if (response.success && response.user && response.token) {
        login(response.user, response.token);
        showToast('Successfully logged in', 'success');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast(
        error instanceof Error ? error.message : 'Authentication failed. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen retro-grid animate-grid-breathe flex flex-col items-center justify-center">
      <div className="text-center mb-16 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-display text-neon-pink mb-2 animate-glow-pulse">
          CRYPTO PULSE
        </h1>
        <p className="text-pastel-yellow font-mono opacity-70">Monitor. Analyze. React.</p>
      </div>

      <div className="bg-deep-navy/60 border border-grid-line rounded-lg p-8 w-11/12 max-w-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col items-center">
          <Activity className="text-neon-pink w-16 h-16 mb-6" />
          
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="retro-button w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="spinner w-5 h-5 border-2"></div>
            ) : (
              <>Sign in with Google</>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 text-sm text-pastel-yellow/50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        &copy; 2025 CRYPTO PULSE • REAL-TIME SENTIMENT ANALYSIS
      </div>
    </div>
  );
};

export default Login;