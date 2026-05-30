import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { alertsApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import { X, Edit, Trash2, Save, AlertCircle, ChevronRight } from 'lucide-react';

interface Alert {
  ID: string;
  UserID: string;
  CoinID: number;
  Threshold: number;
  Email: string;
}

interface EditingAlert {
  id: string;
  coinId: number;
  threshold: number;
}

interface AlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AlertsPanel = ({ isOpen, onClose }: AlertsPanelProps) => {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAlert, setEditingAlert] = useState<EditingAlert | null>(null);
  
  // New alert form state
  const [newAlert, setNewAlert] = useState({
    coinId: 1, // BTC
    threshold: 0.5,
    email: currentUser?.email || '',
  });
  
  // Available coins
  const availableCoins = [
    { id: 1, code: 'BTC', name: 'Bitcoin' },
    { id: 91, code: 'ETH', name: 'Ethereum' },
    { id: 92, code: 'SOL', name: 'Solana' },
    { id: 3, code: 'ADA', name: 'Cardano' },
    { id: 4, code: 'DOGE', name: 'Dogecoin' },
    { id: 5, code: 'XRP', name: 'Ripple' },
    { id: 6, code: 'BNB', name: 'Binance Coin' },
    { id: 7, code: 'USDT', name: 'Tether' },
    { id: 8, code: 'USDC', name: 'USD Coin' },
    { id: 9, code: 'TRX', name: 'Tron' },
  ];
  
  // Get coin name by ID
  const getCoinName = (id: number): string => {
    const coin = availableCoins.find(c => c.id === id);
    return coin ? `${coin.code} (${coin.name})` : `Coin ID: ${id}`;
  };
  
  // Fetch alerts
  const fetchAlerts = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const data = await alertsApi.getAlerts(currentUser.uid);
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };
  
  // Create new alert
  const createAlert = async () => {
    if (!currentUser) return;
    
    try {
      const response = await alertsApi.createAlert(currentUser.uid, newAlert);
      
      // Add new alert to list
      setAlerts([...alerts, response]);
      
      // Reset form
      setNewAlert({
        ...newAlert,
        threshold: 0.5,
      });
      
      toast.success('Alert created successfully');
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Failed to create alert');
    }
  };
  
  // Update alert
  const updateAlert = async () => {
    if (!currentUser || !editingAlert) return;
    
    try {
      await alertsApi.updateAlert(
        currentUser.uid,
        editingAlert.id,
        {
          coinId: editingAlert.coinId,
          threshold: editingAlert.threshold,
        }
      );
      
      // Update alert in list
      setAlerts(
        alerts.map((alert) =>
          alert.ID === editingAlert.id
            ? { ...alert, CoinID: editingAlert.coinId, Threshold: editingAlert.threshold }
            : alert
        )
      );
      
      // Exit edit mode
      setEditingAlert(null);
      
      toast.success('Alert updated successfully');
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
    }
  };
  
  // Delete alert
  const deleteAlert = async (id: string) => {
    if (!currentUser) return;
    
    try {
      await alertsApi.deleteAlert(currentUser.uid, id);
      
      // Remove alert from list
      setAlerts(alerts.filter((alert) => alert.ID !== id));
      
      toast.success('Alert deleted successfully');
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };
  
  // Edit alert
  const handleEdit = (alert: Alert) => {
    setEditingAlert({
      id: alert.ID,
      coinId: alert.CoinID,
      threshold: alert.Threshold,
    });
  };
  
  // Load alerts when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen, currentUser]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-medium-navy h-full w-full sm:max-w-md border-l border-light-navy overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, type: 'spring', damping: 30 }}
          >
            <div className="sticky top-0 bg-dark-navy z-10 p-4 border-b border-light-navy flex justify-between items-center">
              <h2 className="text-xl font-heading text-pastel-yellow">MANAGE ALERTS</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-6">
                <h3 className="font-heading text-lg mb-3 text-pastel-yellow flex items-center gap-2">
                  <AlertCircle size={18} />
                  <span>Your Alerts</span>
                </h3>
                
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-neon-pink border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <motion.div
                        key={alert.ID}
                        className="bg-dark-navy border border-light-navy rounded-lg p-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2 }}
                      >
                        {editingAlert && editingAlert.id === alert.ID ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm mb-1">Coin</label>
                              <select
                                value={editingAlert.coinId}
                                onChange={(e) => setEditingAlert({
                                  ...editingAlert,
                                  coinId: parseInt(e.target.value),
                                })}
                                className="w-full bg-background border border-light-navy rounded p-2"
                              >
                                {availableCoins.map((coin) => (
                                  <option key={coin.id} value={coin.id}>
                                    {coin.code} ({coin.name})
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm mb-1">
                                Threshold: {editingAlert.threshold.toFixed(2)}
                              </label>
                              <input
                                type="range"
                                min="-1"
                                max="1"
                                step="0.01"
                                value={editingAlert.threshold}
                                onChange={(e) => setEditingAlert({
                                  ...editingAlert,
                                  threshold: parseFloat(e.target.value),
                                })}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingAlert(null)}
                                className="px-3 py-1 text-sm bg-dark-navy hover:bg-light-navy text-white rounded transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={updateAlert}
                                className="px-3 py-1 text-sm bg-neon-pink hover:bg-neon-pink/80 text-white rounded flex items-center gap-1 transition-colors"
                              >
                                <Save size={14} />
                                <span>Save</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{getCoinName(alert.CoinID)}</h4>
                                <p className="text-sm text-gray-400">
                                  Threshold: {alert.Threshold.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{alert.Email}</p>
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(alert)}
                                  className="p-1 text-gray-400 hover:text-white transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => deleteAlert(alert.ID)}
                                  className="p-1 text-gray-400 hover:text-neon-pink transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No alerts found. Create one below.</p>
                )}
              </div>
              
              <div className="border-t border-light-navy pt-4">
                <h3 className="font-heading text-lg mb-3 text-pastel-yellow">Create New Alert</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Coin</label>
                    <select
                      value={newAlert.coinId}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        coinId: parseInt(e.target.value),
                      })}
                      className="w-full bg-background border border-light-navy rounded p-2"
                    >
                      {availableCoins.map((coin) => (
                        <option key={coin.id} value={coin.id}>
                          {coin.code} ({coin.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">
                      Threshold: {newAlert.threshold.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.01"
                      value={newAlert.threshold}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        threshold: parseFloat(e.target.value),
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Bearish (-1.0)</span>
                      <span>Neutral (0.0)</span>
                      <span>Bullish (1.0)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input
                      type="email"
                      value={newAlert.email}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        email: e.target.value,
                      })}
                      className="w-full bg-background border border-light-navy rounded p-2"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <motion.button
                    onClick={createAlert}
                    className="w-full button-primary mt-2 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AlertCircle size={16} />
                    <span>Create Alert</span>
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertsPanel;