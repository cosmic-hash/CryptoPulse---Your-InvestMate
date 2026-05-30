import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check if your popup blocker is enabled and allow popups for this site.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-background-animated flex items-center justify-center">
      <motion.div 
        className="p-8 bg-medium-navy rounded-xl border border-light-navy max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.h1 
            className="text-4xl font-heading text-pastel-yellow uppercase mb-4"
            animate={{ textShadow: ['0 0 0px #F64E60', '0 0 12px #F64E60', '0 0 0px #F64E60'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Crypto Pulse
          </motion.h1>
          <p className="text-sm text-gray-300">
            Monitor crypto sentiment in real-time
          </p>
        </motion.div>

        <motion.button
          className="button-primary w-full flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05, boxShadow: '0 0 8px rgba(246, 78, 96, 0.6)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <LogIn size={18} />
              <span>Sign in with Google</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Login;