import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewsCardProps {
  title: string;
  date: string;
  coinCode: string;
  sentiment: number;
  url: string;
}

const NewsCard = ({ title, date, coinCode, sentiment, url }: NewsCardProps) => {
  // Sentiment color based on score
  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'bg-green-500/20 text-green-300';
    if (score < -0.3) return 'bg-red-500/20 text-red-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  // Sentiment label based on score
  const getSentimentLabel = (score: number) => {
    if (score > 0.5) return 'Bullish';
    if (score > 0.3) return 'Positive';
    if (score > -0.3 && score < 0.3) return 'Neutral';
    if (score > -0.5) return 'Negative';
    return 'Bearish';
  };

  return (
    <motion.div 
      className="card h-full"
      whileHover={{ y: -4, boxShadow: '0 4px 12px rgba(246, 78, 96, 0.3)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="bg-neon-pink/20 text-neon-pink px-2 py-1 rounded text-xs font-medium">
          {coinCode}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(sentiment)}`}>
          {getSentimentLabel(sentiment)}
        </span>
      </div>

      <h3 className="text-lg font-medium mb-2">{title}</h3>
      
      <div className="flex justify-between items-end mt-3">
        <p className="text-xs text-gray-400">{date}</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-pastel-yellow hover:text-neon-pink transition-colors"
        >
          <span className="text-sm">Read</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </motion.div>
  );
};

export default NewsCard;