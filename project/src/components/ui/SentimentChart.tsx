import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { ChartPoint, ExplainResponse } from '../../types';
import { fetchExplanation } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface SentimentChartProps {
  data: ChartPoint[];
}

const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeCoinData, setActiveCoinData] = useState<ChartPoint[]>([]);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  
  // Get unique coins from data
  const uniqueCoins = [...new Set(data.map(point => point.coin))];
  
  // Random color generator based on coin name
  const getColorForCoin = (coin: string): string => {
    const colors = [
      '#F64E60', '#36B9CC', '#1cc88a', '#f6c23e', '#E91E63',
      '#9C27B0', '#673AB7', '#3F51B5', '#03A9F4', '#4CAF50'
    ];
    
    // Get a deterministic index based on coin name
    const index = coin.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };
  
  useEffect(() => {
    const updateChartSize = () => {
      if (chartRef.current) {
        setChartSize({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight
        });
      }
    };
    
    updateChartSize();
    window.addEventListener('resize', updateChartSize);
    
    return () => {
      window.removeEventListener('resize', updateChartSize);
    };
  }, []);
  
  useEffect(() => {
    if (selectedCoin) {
      setActiveCoinData(data.filter(point => point.coin === selectedCoin));
    } else {
      setActiveCoinData([]);
    }
  }, [selectedCoin, data]);
  
  const handleCoinSelect = (coin: string) => {
    setSelectedCoin(coin === selectedCoin ? null : coin);
  };
  
  const handleExplainClick = async () => {
    if (!selectedCoin || activeCoinData.length === 0) return;
    
    setLoading(true);
    setModalOpen(true);
    
    try {
      // Get time range from the data
      const times = activeCoinData.map(point => new Date(point.time).getTime());
      const startTime = new Date(Math.min(...times)).toISOString();
      const endTime = new Date(Math.max(...times)).toISOString();
      
      const response = await fetchExplanation(selectedCoin, startTime, endTime);
      setExplanation(response.explanation);
      
      // Add animation class to modal content after a brief delay
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.classList.add('active');
        }
      }, 50);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      showToast('Failed to fetch explanation', 'error');
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };
  
  const closeModal = () => {
    if (contentRef.current) {
      contentRef.current.classList.remove('active');
    }
    
    setTimeout(() => {
      setModalOpen(false);
      setExplanation('');
    }, 200);
  };
  
  // Calculate chart points position
  const getPointPosition = (point: ChartPoint) => {
    if (chartSize.width === 0 || chartSize.height === 0) return { x: 0, y: 0 };
    
    // Get time range
    const times = data.map(p => new Date(p.time).getTime());
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime;
    
    // Get value range
    const values = data.map(p => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;
    
    // Calculate position
    const pointTime = new Date(point.time).getTime();
    const x = ((pointTime - minTime) / timeRange) * chartSize.width;
    
    // Invert y-axis (0 at bottom)
    const y = chartSize.height - ((point.value - minValue) / valueRange) * chartSize.height;
    
    return { x, y };
  };
  
  return (
    <div className="h-full w-full">
      <div className="mb-4 flex flex-wrap gap-2">
        {uniqueCoins.map(coin => (
          <button
            key={coin}
            className={`px-3 py-1 rounded-full text-xs font-mono border transition-all duration-150 
                      ${selectedCoin === coin 
                          ? 'bg-neon-pink text-deep-navy border-neon-pink' 
                          : 'bg-transparent border-grid-line'}`}
            onClick={() => handleCoinSelect(coin)}
            style={{ borderColor: selectedCoin === coin ? getColorForCoin(coin) : undefined }}
          >
            {coin}
          </button>
        ))}
      </div>
      
      <div ref={chartRef} className="relative h-64 w-full border-b border-l border-grid-line">
        {/* Chart visualization would go here */}
        {selectedCoin && activeCoinData.map((point, index) => {
          const { x, y } = getPointPosition(point);
          return (
            <div 
              key={`${point.coin}-${index}`}
              className="chart-point" 
              style={{ 
                left: `${x}px`, 
                top: `${y}px`,
                backgroundColor: getColorForCoin(point.coin)
              }}
            >
              <div className="chart-tooltip">
                <p>{point.coin}</p>
                <p>Sentiment: {point.value.toFixed(2)}</p>
                <button 
                  onClick={handleExplainClick}
                  className="text-pastel-yellow hover:text-neon-pink transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {modalOpen && (
        <div className="modal">
          <div className="modal-backdrop" onClick={closeModal}></div>
          <div ref={contentRef} className="modal-content">
            <button onClick={closeModal} className="modal-close">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display text-neon-pink mb-4">
              Sentiment Explanation
            </h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-4"></div>
                <p>Analyzing sentiment data...</p>
              </div>
            ) : (
              <div className="typewriter-container">
                <p className="typewriter-text" style={{ animationDuration: `${explanation.length * 30}ms` }}>
                  {explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentChart;