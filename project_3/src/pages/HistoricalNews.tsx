import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { format, sub } from 'date-fns';
import { newsApi } from '../services/api';
import { formatUTCtoMDT } from '../utils/timeUtils';
import { toast } from 'react-hot-toast';
import { Calendar, Search, UserCircle as LoaderCircle } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import NewsCard from '../components/news/NewsCard';

interface NewsItem {
  id: number;
  currency_code: string;
  newsdatetime: string;
  score: number;
  title: string;
  url: string;
}

const HistoricalNews = () => {
  const [startDate, setStartDate] = useState(sub(new Date(), { days: 7 }));
  const [endDate, setEndDate] = useState(new Date());
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const currencyCodes = ['BTC', 'ETH', 'USDT', 'XRP', 'BNB', 'SOL', 'USDC', 'TRX', 'DOGE', 'ADA'];

  const loadNews = async () => {
    console.log('[HistoricalNews] loadNews called with:', { startDate, endDate });
    setLoading(true);
    try {
      const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
      const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
      console.log('[HistoricalNews] Fetching news for dates:', formattedStartDate, formattedEndDate, 'coins:', currencyCodes);
      const data = await newsApi.getHistorical(
        formattedStartDate,
        formattedEndDate,
        currencyCodes
      );
      console.log('[HistoricalNews] Received data:', data);
      setNews(data);
    } catch (error) {
      console.log('[HistoricalNews] loadNews error:', error);
      console.error('Error loading news:', error);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  // Load news on first render
  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div>
      <motion.div 
        className="mb-6 bg-medium-navy p-4 rounded-lg border border-light-navy"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-heading mb-4 text-pastel-yellow uppercase">
          Historical News Data
        </h2>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block mb-2 text-sm">Start Date</label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date || new Date())}
                maxDate={endDate}
                className="bg-dark-navy border border-light-navy text-white p-2 rounded-md w-full pl-9"
              />
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-pink" />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 text-sm">End Date</label>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date || new Date())}
                minDate={startDate}
                maxDate={new Date()}
                className="bg-dark-navy border border-light-navy text-white p-2 rounded-md w-full pl-9"
              />
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-pink" />
            </div>
          </div>
          
          <motion.button
            className="button-primary ml-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadNews}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle className="animate-spin" size={20} />
            ) : (
              <div className="flex items-center gap-2">
                <Search size={16} />
                <span>Load News</span>
              </div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: index * 0.05 }}
            >
              <NewsCard
                title={item.title}
                date={formatUTCtoMDT(item.newsdatetime, 'hh:mm a, MMM dd yyyy')}
                coinCode={item.currency_code}
                sentiment={item.score}
                url={item.url}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          {loading ? (
            <div className="flex justify-center">
              <LoaderCircle className="animate-spin text-neon-pink" size={32} />
            </div>
          ) : (
            <p className="text-gray-400">
              {news.length === 0 ? "No news found. Try adjusting your date range." : "Select a date range and click 'Load News'"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoricalNews;