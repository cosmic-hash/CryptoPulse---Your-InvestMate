import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useWebSocket } from '../services/websocket';
import { formatUTCtoMDT, getCurrentISOTime, getTimeHoursAgo } from '../utils/timeUtils';
import { sentimentApi } from '../services/api';
import { toast } from 'react-hot-toast';
import DigitalClock from '../components/common/DigitalClock';
import AlertsPanel from '../components/alerts/AlertsPanel';
import { Bell, HelpCircle, X } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  [key: string]: {
    times: string[];
    scores: number[];
  };
}

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string;
  coinId: string;
}

const ExplanationModal = ({ isOpen, onClose, explanation, coinId }: ExplanationModalProps) => {
  const [typedText, setTypedText] = useState('');
  
  useEffect(() => {
    if (isOpen && explanation) {
      let i = 0;
      const typeWriter = () => {
        if (i < explanation.length) {
          setTypedText(explanation.substring(0, i + 1));
          i++;
          setTimeout(typeWriter, 20);
        }
      };
      
      // Reset and start typing
      setTypedText('');
      typeWriter();
    }
  }, [isOpen, explanation]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div 
            className="bg-medium-navy border border-neon-pink rounded-lg max-w-xl w-full p-6 m-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-heading text-pastel-yellow">
                {coinId} SENTIMENT ANALYSIS
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="border-t border-light-navy pt-4">
              <p className="font-mono leading-relaxed">
                {typedText}
                <span className="animate-pulse">|</span>
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={onClose}
                className="button-primary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TimeRangeButton = ({ hours, active, onClick }: { hours: number; active: boolean; onClick: () => void }) => (
  <button
    className={`px-4 py-1 rounded-full border transition-colors duration-200 
      ${active 
        ? 'bg-pastel-yellow text-background border-neon-pink' 
        : 'bg-transparent text-pastel-yellow border-light-navy hover:border-neon-pink'
      }`}
    onClick={onClick}
  >
    {hours}h
  </button>
);

const LiveSentiment = () => {
  const [activeTimeRange, setActiveTimeRange] = useState(1);
  const [chartData, setChartData] = useState<ChartData>({});
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState<{
    coinId: string;
    score: number;
    time: string;
  } | null>(null);
  
  const chartRef = useRef<ChartJS<'line'>>(null);
  
  // Define time range
  const endTime = getCurrentISOTime();
  const startTime = getTimeHoursAgo(activeTimeRange);
  
  // Default tokens to track
  const tokens = ['BTC', 'ETH', 'SOL', 'ADA', 'DOGE'];
  
  // Connect to WebSocket
  const { lastMessage, connected } = useWebSocket({
    startTime,
    endTime,
    tokens,
    onMessage: (data) => {
      // Update chart data when new message is received
      if (data && data.coin_id && data.sentiment_score !== undefined) {
        const { coin_id, sentiment_score, timestamp } = data;
        
        setChartData((prev) => {
          const coinData = prev[coin_id] || { times: [], scores: [] };
          
          // Add new data point
          return {
            ...prev,
            [coin_id]: {
              times: [...coinData.times, timestamp],
              scores: [...coinData.scores, sentiment_score],
            },
          };
        });
      }
    },
  });
  
  // Handle time range change
  const handleTimeRangeChange = (hours: number) => {
    setActiveTimeRange(hours);
    // Clear chart data when time range changes
    setChartData({});
  };
  
  // Handle explanation request
  const handleExplainRequest = async (coinId: string) => {
    try {
      const result = await sentimentApi.explain({
        coin_id: parseInt(coinId),
        start_time: startTime,
        end_time: endTime,
      });
      
      setSelectedCoin(coinId);
      setExplanation(result.explanation);
      setShowExplanationModal(true);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      toast.error('Failed to fetch sentiment explanation');
    }
  };
  
  // Prepare data for Chart.js
  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#FFFFFF',
          font: {
            family: "'Space Mono', monospace",
            size: 12,
          },
          boxWidth: 15,
        },
      },
      tooltip: {
        enabled: false, // Disable default tooltip, we'll use custom one
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(241, 250, 140, 0.1)',
        },
        ticks: {
          color: '#FFFFFF',
          font: {
            family: "'Space Mono', monospace",
          },
          callback: function(value: any, index: number, values: any) {
            const allTimes = Object.values(chartData).reduce(
              (acc: string[], curr) => [...acc, ...curr.times],
              []
            );
            if (index < allTimes.length) {
              return formatUTCtoMDT(allTimes[index], 'HH:mm');
            }
            return '';
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(241, 250, 140, 0.1)',
        },
        ticks: {
          color: '#FFFFFF',
          font: {
            family: "'Space Mono', monospace",
          },
        },
      },
    },
    onHover: (event: any, elements: any) => {
      if (elements && elements.length > 0) {
        const datasetIndex = elements[0].datasetIndex;
        const index = elements[0].index;
        const datasets = chartRef.current?.data.datasets || [];
        
        if (datasets[datasetIndex]) {
          const coinId = datasets[datasetIndex].label || '';
          const score = datasets[datasetIndex].data[index] as number;
          const times = Object.values(chartData).reduce(
            (acc: string[], curr) => [...acc, ...curr.times],
            []
          );
          
          setHoveredPoint({
            coinId,
            score,
            time: times[index] || '',
          });
        }
      } else {
        setHoveredPoint(null);
      }
    },
  };
  
  const lineChartData = {
    datasets: Object.entries(chartData).map(([coinId, data]) => ({
      label: coinId,
      data: data.scores,
      borderColor: getColorForCoin(coinId),
      backgroundColor: `${getColorForCoin(coinId)}33`, // Add transparency
      borderWidth: 2,
      pointBackgroundColor: '#F1FA8C',
      pointBorderColor: '#F64E60',
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.3,
    })),
  };
  
  // Get unique color for each coin
  function getColorForCoin(coinId: string): string {
    const colors = {
      BTC: '#F7931A', // Bitcoin orange
      ETH: '#627EEA', // Ethereum blue
      SOL: '#14F195', // Solana green
      ADA: '#0033AD', // Cardano blue
      DOGE: '#C2A633', // Dogecoin gold
      USDT: '#26A17B', // Tether green
      XRP: '#23292F', // Ripple black
      BNB: '#F3BA2F', // Binance yellow
      USDC: '#2775CA', // USD Coin blue
      TRX: '#EF0027', // Tron red
    };
    
    return (colors as any)[coinId] || '#F64E60'; // Default to neon-pink
  }
  
  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
        <motion.div 
          className="bg-medium-navy p-4 rounded-lg border border-light-navy w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading text-pastel-yellow uppercase">
              Live Sentiment
            </h2>
            <DigitalClock pulseInterval={2 * 60 * 1000} />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 6, 12, 24].map((hours) => (
              <TimeRangeButton
                key={hours}
                hours={hours}
                active={activeTimeRange === hours}
                onClick={() => handleTimeRangeChange(hours)}
              />
            ))}
            
            <div className="ml-auto flex items-center">
              <span className={`h-2 w-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-xs text-gray-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="bg-medium-navy p-4 rounded-lg border border-light-navy relative mb-6">
        <div className="h-[400px]">
          {Object.keys(chartData).length > 0 ? (
            <Line 
              ref={chartRef}
              data={lineChartData} 
              options={chartOptions} 
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400">
                {connected ? "Waiting for data..." : "Connecting to live feed..."}
              </p>
            </div>
          )}
        </div>
        
        {/* Custom tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute bg-dark-navy border border-neon-pink rounded-md p-3 z-10 pointer-events-none"
            style={{
              left: `${(chartRef.current?.canvas.getBoundingClientRect().left || 0) + 20}px`,
              top: `${(chartRef.current?.canvas.getBoundingClientRect().top || 0) - 80}px`,
              transform: 'translate(-50%, -100%)',
              transition: 'opacity 0.1s ease',
            }}
          >
            <p className="font-heading text-pastel-yellow mb-1">{hoveredPoint.coinId}</p>
            <p className="text-sm mb-1">Sentiment: {hoveredPoint.score.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{formatUTCtoMDT(hoveredPoint.time)}</p>
            <button 
              className="mt-2 text-xs bg-neon-pink/20 hover:bg-neon-pink/40 text-neon-pink px-2 py-1 rounded-full transition-colors flex items-center gap-1"
              onClick={() => handleExplainRequest(hoveredPoint.coinId)}
            >
              <HelpCircle size={12} />
              <span>Explain</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Floating button for alerts */}
      <motion.button
        className="fixed bottom-6 right-6 bg-neon-pink text-white p-3 rounded-full shadow-lg z-10"
        whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(246, 78, 96, 0.6)' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAlertsPanel(true)}
      >
        <Bell size={24} />
      </motion.button>
      
      {/* Alerts panel */}
      <AlertsPanel 
        isOpen={showAlertsPanel} 
        onClose={() => setShowAlertsPanel(false)} 
      />
      
      {/* Explanation modal */}
      <ExplanationModal 
        isOpen={showExplanationModal}
        onClose={() => setShowExplanationModal(false)}
        explanation={explanation}
        coinId={selectedCoin}
      />
    </div>
  );
};

export default LiveSentiment;