import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatFullDateMDT } from '../utils/timeUtils';
import { toast } from 'react-hot-toast';
import { User, Calendar, Clock, Save } from 'lucide-react';

const Profile = () => {
  const { currentUser, updateUserCoins } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  
  // Available crypto coins
  const availableCoins = [
    { code: 'BTC', name: 'Bitcoin' },
    { code: 'ETH', name: 'Ethereum' },
    { code: 'USDT', name: 'Tether' },
    { code: 'XRP', name: 'Ripple' },
    { code: 'BNB', name: 'Binance Coin' },
    { code: 'SOL', name: 'Solana' },
    { code: 'USDC', name: 'USD Coin' },
    { code: 'TRX', name: 'Tron' },
    { code: 'DOGE', name: 'Dogecoin' },
    { code: 'ADA', name: 'Cardano' },
  ];
  
  // Load profile data
  const loadProfile = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const response = await userApi.getProfile();
      
      if (response.success) {
        setSelectedCoins(response.user.coins || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Save preferred coins
  const savePreferences = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      const response = await userApi.updateProfile({
        coins: selectedCoins,
      });
      
      if (response.success) {
        updateUserCoins(selectedCoins);
        toast.success('Preferences saved successfully');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };
  
  // Toggle coin selection
  const toggleCoin = (coinCode: string) => {
    setSelectedCoins((prevSelected) => {
      if (prevSelected.includes(coinCode)) {
        return prevSelected.filter((code) => code !== coinCode);
      } else {
        return [...prevSelected, coinCode];
      }
    });
  };
  
  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [currentUser]);
  
  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-medium-navy rounded-lg border border-light-navy p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <motion.div 
            className="flex-shrink-0 flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.name || 'User'}
                className="w-24 h-24 rounded-full border-2 border-neon-pink"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-dark-navy border-2 border-neon-pink flex items-center justify-center">
                <User size={32} className="text-neon-pink" />
              </div>
            )}
          </motion.div>
          
          <div className="flex-grow">
            <motion.h2 
              className="text-2xl font-heading text-pastel-yellow mb-2 overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {currentUser.name}
            </motion.h2>
            
            <motion.p 
              className="text-gray-300 mb-4 overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {currentUser.email}
            </motion.p>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <motion.div 
                className="bg-dark-navy text-sm rounded-md px-3 py-2 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: 0.4 }}
              >
                <Calendar size={14} className="text-neon-pink" />
                <span className="text-gray-400">Created: </span>
                <span>{formatFullDateMDT(currentUser.created_at)}</span>
              </motion.div>
              
              <motion.div 
                className="bg-dark-navy text-sm rounded-md px-3 py-2 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: 0.5 }}
              >
                <Clock size={14} className="text-neon-pink" />
                <span className="text-gray-400">Last Login: </span>
                <span>{formatFullDateMDT(currentUser.last_login)}</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-medium-navy rounded-lg border border-light-navy p-6">
        <h3 className="text-xl font-heading text-pastel-yellow mb-4">
          Preferred Cryptocurrencies
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-neon-pink border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <p className="text-gray-300 mb-4">
              Select the cryptocurrencies you want to track:
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
              {availableCoins.map((coin, index) => (
                <motion.div
                  key={coin.code}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <button
                    className={`w-full py-2 px-3 rounded-lg transition-all duration-200 border ${
                      selectedCoins.includes(coin.code)
                        ? 'bg-pastel-yellow text-background border-neon-pink'
                        : 'bg-dark-navy text-white border-light-navy hover:border-pastel-yellow'
                    }`}
                    onClick={() => toggleCoin(coin.code)}
                  >
                    <div className="text-sm font-bold">{coin.code}</div>
                    <div className="text-xs opacity-80">{coin.name}</div>
                  </button>
                </motion.div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <motion.button
                className="button-primary flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={savePreferences}
                disabled={saving}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Preferences</span>
                  </>
                )}
              </motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;