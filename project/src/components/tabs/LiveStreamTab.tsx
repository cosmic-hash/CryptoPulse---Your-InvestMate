import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Wifi } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { connectToLiveStream } from '../../services/api';
import { SentimentData, ChartPoint } from '../../types';
import SentimentChart from '../ui/SentimentChart';

const LiveStreamTab: React.FC = () => {
  const [liveStartDate, setLiveStartDate] = useState<string>(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [liveEndDate, setLiveEndDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [sentimentData, setSentimentData] = useState<ChartPoint[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  
  useEffect(() => {
    // Clean up WebSocket on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  const handleConnectLive = () => {
    if (!liveStartDate || !liveEndDate) {
      showToast('Please select both start and end dates', 'error');
      return;
    }
    
    const start = new Date(liveStartDate);
    const end = new Date(liveEndDate);
    
    if (start > end) {
      showToast('Start date must be before end date', 'error');
      return;
    }
    
    setConnecting(true);
    
    try {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Reset chart data
      setSentimentData([]);
      
      // Default to all coins if user has none selected
      const coins = user?.coins && user.coins.length > 0 
        ? user.coins 
        : ['BTC', 'ETH', 'USDT', 'XRP', 'BNB', 'SOL', 'USDC', 'TRX', 'DOGE', 'ADA'];
      
      // Connect to WebSocket
      wsRef.current = connectToLiveStream(
        liveStartDate,
        liveEndDate,
        coins,
        handleWebSocketMessage,
        handleWebSocketError
      );
      
      // Set connected status
      setTimeout(() => {
        setConnecting(false);
        setConnected(true);
        showToast('Connected to live stream', 'success');
      }, 1500);
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnecting(false);
      showToast('Failed to connect to live stream', 'error');
    }
  };
  
  const handleWebSocketMessage = (data: SentimentData[]) => {
    // Process incoming sentiment data
    const newPoints: ChartPoint[] = [];
    
    data.forEach(tick => {
      Object.entries(tick.coins).forEach(([coin, value]) => {
        newPoints.push({
          time: tick.time,
          value,
          coin
        });
      });
    });
    
    setSentimentData(prev => [...prev, ...newPoints]);
  };
  
  const handleWebSocketError = (error: Event) => {
    console.error('WebSocket error:', error);
    setConnected(false);
    showToast('Connection error, please reconnect', 'error');
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h2 className="text-2xl font-display text-pastel-yellow mb-6">Live Sentiment Stream</h2>
      
      <div className="bg-deep-navy/60 border border-grid-line rounded-lg p-6 mb-8 animate-slide-down">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm mb-2 font-mono">
              <Calendar className="inline-block w-4 h-4 mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={liveStartDate}
              onChange={(e) => setLiveStartDate(e.target.value)}
              className="w-full bg-deep-navy border border-grid-line rounded px-3 py-2 font-mono"
              disabled={connected}
            />
          </div>
          <div>
            <label className="block text-sm mb-2 font-mono">
              <Calendar className="inline-block w-4 h-4 mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={liveEndDate}
              onChange={(e) => setLiveEndDate(e.target.value)}
              className="w-full bg-deep-navy border border-grid-line rounded px-3 py-2 font-mono"
              disabled={connected}
            />
          </div>
        </div>
        
        <button 
          onClick={handleConnectLive}
          disabled={connecting || connected}
          className={`retro-button flex items-center justify-center ${connected ? 'opacity-50 cursor-not-allowed' : 'animate-bounce-once'}`}
        >
          {connecting ? (
            <div className="spinner w-5 h-5 border-2"></div>
          ) : connected ? (
            <>
              <Wifi className="w-4 h-4 mr-2 text-green-400" />
              Connected
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              Connect Live
            </>
          )}
        </button>
      </div>
      
      <div className="bg-deep-navy/60 border border-grid-line rounded-lg p-6 h-96">
        {sentimentData.length > 0 ? (
          <SentimentChart data={sentimentData} />
        ) : (
          <div className="h-full flex items-center justify-center text-pastel-yellow/50">
            {connecting ? (
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p>Connecting to stream...</p>
              </div>
            ) : (
              <p>Connect to the live stream to see sentiment data</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreamTab;