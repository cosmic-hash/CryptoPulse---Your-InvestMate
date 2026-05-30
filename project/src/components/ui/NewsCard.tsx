import React from 'react';
import { ExternalLink, Clock, Bitcoin } from 'lucide-react';
import { NewsItem } from '../../types';

interface NewsCardProps {
  newsItem: NewsItem;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, index }) => {
  const formattedDate = new Date(newsItem.newsdatetime).toLocaleString();
  
  // Calculate animation delay for staggered entrance
  const animationDelay = `${index * 50}ms`;
  
  // Determine sentiment color based on score
  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-400';
    if (score < -0.3) return 'text-red-400';
    return 'text-yellow-400';
  };
  
  const sentimentColor = getSentimentColor(newsItem.score);
  
  return (
    <div 
      className="news-card animate-stagger-fade-up"
      style={{ animationDelay }}
    >
      <div className="flex justify-between items-start">
        <div className="bg-neon-pink px-2 py-1 rounded text-xs font-mono text-deep-navy font-bold mb-2">
          {newsItem.currency_code}
        </div>
        <span className={`text-sm font-mono ${sentimentColor}`}>
          Score: {newsItem.score.toFixed(2)}
        </span>
      </div>
      
      <h3 className="font-display text-lg mb-4 text-pastel-yellow">
        {newsItem.title}
      </h3>
      
      <div className="flex justify-between items-center mt-3 text-xs text-grid-line">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {formattedDate}
        </div>
        
        <a 
          href={newsItem.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-neon-pink flex items-center hover:underline transition-colors duration-150"
        >
          Read More
          <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default NewsCard;