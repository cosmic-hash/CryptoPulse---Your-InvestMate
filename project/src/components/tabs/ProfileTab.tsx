import React, { useState, useEffect } from 'react';
import { User, Calendar, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserProfile, updateUserProfile } from '../../services/api';

// Available cryptocurrency options
const AVAILABLE_COINS = [
  'BTC', 'ETH', 'USDT', 'XRP', 'BNB', 
  'SOL', 'USDC', 'TRX', 'DOGE', 'ADA'
];

const ProfileTab: React.FC = () => {
  const { user, token, updateUserCoins } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    if (user?.coins) {
      setSelectedCoins(user.coins);
    }
  }, [user]);
  
  const fetchLatestProfile = async () => {
    if (!token) return;
    
    setLoading(true);
    
    try {
      const response = await getUserProfile(token);
      
      if (response.success) {
        // Update user coins in context
        updateUserCoins(response.user.coins);
        setSelectedCoins(response.user.coins);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLatestProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  
  const toggleCoin = (coin: string) => {
    const newSelectedCoins = selectedCoins.includes(coin)
      ? selectedCoins.filter(c => c !== coin)
      : [...selectedCoins, coin];
    
    setSelectedCoins(newSelectedCoins);
    setHasChanges(true);
  };
  
  const handleSavePreferences = async () => {
    if (!token) {
      showToast('Not authenticated', 'error');
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await updateUserProfile(token, selectedCoins);
      
      if (response.success) {
        updateUserCoins(response.user.coins);
        showToast('Preferences saved', 'success');
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update preferences', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-2xl font-display text-pastel-yellow mb-6">Profile & Preferences</h2>
      
      <div className="bg-deep-navy/60 border border-grid-line rounded-lg p-6 animate-slide-in-left">
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neon-pink flex-shrink-0 animate-fade-in">
                {user.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-deep-navy flex items-center justify-center text-neon-pink">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="mb-4 typewriter-container">
                  <h3 className="text-xl font-display text-neon-pink typewriter-text">
                    {user.name}
                  </h3>
                </div>
                
                <div className="mb-4 typewriter-container" style={{ animationDelay: '500ms' }}>
                  <p className="text-pastel-yellow typewriter-text">
                    {user.email}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <div className="bg-deep-navy/80 rounded px-3 py-1 text-xs flex items-center animate-fade-in" style={{ animationDelay: '800ms' }}>
                    <Calendar className="w-3 h-3 mr-1 text-grid-line" />
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="bg-deep-navy/80 rounded px-3 py-1 text-xs flex items-center animate-fade-in" style={{ animationDelay: '900ms' }}>
                    <Calendar className="w-3 h-3 mr-1 text-grid-line" />
                    Last Login: {new Date(user.last_login).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-display text-pastel-yellow mb-4">
                Preferred Cryptocurrencies
              </h4>
              
              <div className="flex flex-wrap">
                {AVAILABLE_COINS.map(coin => (
                  <div
                    key={coin}
                    onClick={() => toggleCoin(coin)}
                    className={`coin-toggle ${selectedCoins.includes(coin) ? 'active' : ''}`}
                  >
                    {coin}
                  </div>
                ))}
              </div>
            </div>
            
            {hasChanges && (
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="retro-button animate-bounce-once"
              >
                {saving ? (
                  <div className="spinner w-5 h-5 border-2"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;