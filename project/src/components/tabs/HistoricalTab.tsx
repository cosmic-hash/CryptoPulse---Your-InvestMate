import React, { useState } from 'react';
import { Calendar, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchHistoricalNews } from '../../services/api';
import { NewsItem } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import NewsCard from '../ui/NewsCard';

const HistoricalTab: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const handleLoadNews = async () => {
    if (!startDate || !endDate) {
      showToast('Please select both start and end dates', 'error');
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      showToast('Start date must be before end date', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Default to all coins if user has none selected
      const coins = user?.coins && user.coins.length > 0 
        ? user.coins 
        : ['BTC', 'ETH', 'USDT', 'XRP', 'BNB', 'SOL', 'USDC', 'TRX', 'DOGE', 'ADA'];
      
      const news = await fetchHistoricalNews(startDate, endDate, coins);
      setNewsItems(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      showToast('Failed to load news', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h2 className="text-2xl font-display text-pastel-yellow mb-6">Historical News</h2>
      
      <div className="bg-deep-navy/60 border border-grid-line rounded-lg p-6 mb-8 animate-slide-down">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm mb-2 font-mono">
              <Calendar className="inline-block w-4 h-4 mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-deep-navy border border-grid-line rounded px-3 py-2 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 font-mono">
              <Calendar className="inline-block w-4 h-4 mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-deep-navy border border-grid-line rounded px-3 py-2 font-mono"
            />
          </div>
        </div>
        
        <button 
          onClick={handleLoadNews}
          disabled={loading}
          className="retro-button flex items-center justify-center animate-bounce-once"
        >
          {loading ? (
            <div className="spinner w-5 h-5 border-2"></div>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Load News
            </>
          )}
        </button>
      </div>
      
      {newsItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsItems.map((item, index) => (
            <NewsCard 
              key={item.id} 
              newsItem={item} 
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-pastel-yellow/50">
          {loading ? 'Loading news...' : 'No news items to display. Use the filters above to load news.'}
        </div>
      )}
    </div>
  );
};

export default HistoricalTab;