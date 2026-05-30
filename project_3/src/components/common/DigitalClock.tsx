import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatUTCtoMDT } from '../../utils/timeUtils';

interface DigitalClockProps {
  pulseInterval?: number;
}

const DigitalClock = ({ pulseInterval = 0 }: DigitalClockProps) => {
  const [time, setTime] = useState('');
  const [shouldPulse, setShouldPulse] = useState(false);
  
  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date().toISOString();
      setTime(formatUTCtoMDT(now, 'HH:mm:ss'));
    };
    
    // Initial update
    updateTime();
    
    // Set up interval for time updates
    const timeInterval = setInterval(updateTime, 1000);
    
    // Set up pulse interval if specified
    let pulseTimer: NodeJS.Timeout | null = null;
    
    if (pulseInterval > 0) {
      pulseTimer = setInterval(() => {
        setShouldPulse(true);
        setTimeout(() => setShouldPulse(false), 200);
      }, pulseInterval);
    }
    
    return () => {
      clearInterval(timeInterval);
      if (pulseTimer) clearInterval(pulseTimer);
    };
  }, [pulseInterval]);
  
  return (
    <motion.div 
      className="font-mono text-sm bg-dark-navy px-3 py-1 rounded-md border border-light-navy"
      animate={{
        boxShadow: shouldPulse 
          ? ['0 0 0 rgba(246, 78, 96, 0)', '0 0 10px rgba(246, 78, 96, 0.6)', '0 0 0 rgba(246, 78, 96, 0)']
          : '0 0 0 rgba(246, 78, 96, 0)'
      }}
      transition={{ duration: 0.3 }}
    >
      {time}
    </motion.div>
  );
};

export default DigitalClock;